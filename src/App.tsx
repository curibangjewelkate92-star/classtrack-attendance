/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Student, DailyAttendance, AttendanceStatus, AttendanceSummary } from './types';
import { StorageService, INITIAL_STUDENTS } from './services/storage';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentDirectoryView } from './components/StudentDirectoryView';
import { AttendanceHistoryView } from './components/AttendanceHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { FirebaseGuideView } from './components/FirebaseGuideView';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [allAttendance, setAllAttendance] = useState<Record<string, DailyAttendance>>({});
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load data initially
  const loadData = async () => {
    try {
      const loadedStudents = await StorageService.getStudents();
      const loadedAttendance = await StorageService.getAllAttendance();
      if (loadedStudents && loadedStudents.length > 0) {
        setStudents(loadedStudents);
      }
      if (loadedAttendance) {
        setAllAttendance(loadedAttendance);
      }
      setIsFirebaseActive(true);
    } catch (err) {
      console.warn('Initial student data fetch fallback notice:', err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Teacher authenticated - refresh data from cloud
        loadData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Current day attendance record
  const currentAttendance: DailyAttendance = useMemo(() => {
    return (
      allAttendance[selectedDate] || {
        date: selectedDate,
        records: {},
        updatedAt: new Date().toISOString(),
      }
    );
  }, [allAttendance, selectedDate]);

  // Current attendance summary for selectedDate
  const summary: AttendanceSummary = useMemo(() => {
    return StorageService.calculateSummary(students, currentAttendance);
  }, [students, currentAttendance]);

  // Update a single student attendance record
  const handleUpdateAttendanceRecord = async (
    studentId: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    setIsSaving(true);
    const updatedRecords = {
      ...currentAttendance.records,
      [studentId]: {
        status,
        note: note !== undefined ? note : currentAttendance.records[studentId]?.note,
        timestamp: new Date().toISOString(),
      },
    };

    const newDaily: DailyAttendance = {
      ...currentAttendance,
      date: selectedDate,
      records: updatedRecords,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setAllAttendance((prev) => ({
      ...prev,
      [selectedDate]: newDaily,
    }));

    try {
      await StorageService.saveDailyAttendance(newDaily);
    } catch (e) {
      console.error('Failed to save attendance', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk mark all active students
  const handleBulkMark = async (status: AttendanceStatus) => {
    setIsSaving(true);
    const newRecords: Record<string, { status: AttendanceStatus; note?: string; timestamp: string }> = {};

    students.forEach((st) => {
      if (st.active) {
        newRecords[st.id] = {
          status,
          note: currentAttendance.records[st.id]?.note,
          timestamp: new Date().toISOString(),
        };
      }
    });

    const newDaily: DailyAttendance = {
      ...currentAttendance,
      date: selectedDate,
      records: newRecords,
      updatedAt: new Date().toISOString(),
    };

    setAllAttendance((prev) => ({
      ...prev,
      [selectedDate]: newDaily,
    }));

    try {
      await StorageService.saveDailyAttendance(newDaily);
      showToast(`All active students marked as ${status.toUpperCase()}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear attendance records for current day
  const handleClearAttendance = async () => {
    setIsSaving(true);
    const newDaily: DailyAttendance = {
      ...currentAttendance,
      date: selectedDate,
      records: {},
      updatedAt: new Date().toISOString(),
    };

    setAllAttendance((prev) => ({
      ...prev,
      [selectedDate]: newDaily,
    }));

    try {
      await StorageService.saveDailyAttendance(newDaily);
      showToast("Cleared today's attendance records.");
    } finally {
      setIsSaving(false);
    }
  };

  // Update optional day notes
  const handleUpdateDayNotes = async (notes: string) => {
    const newDaily: DailyAttendance = {
      ...currentAttendance,
      notes,
      updatedAt: new Date().toISOString(),
    };
    setAllAttendance((prev) => ({
      ...prev,
      [selectedDate]: newDaily,
    }));
    await StorageService.saveDailyAttendance(newDaily);
  };

  // Student directory operations
  const handleAddStudent = async (newStudent: Student) => {
    const res = await StorageService.saveStudent(newStudent);
    setStudents(res.updatedList);
    showToast(`Enrolled "${newStudent.fullName}" (${newStudent.rollNumber}) ${res.cloudSaved ? '• Synced to Cloud Firestore' : ''}`);
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    const res = await StorageService.saveStudent(updatedStudent);
    setStudents(res.updatedList);
    showToast(`Updated student profile for ${updatedStudent.fullName} ${res.cloudSaved ? '• Synced to Cloud Firestore' : ''}`);
  };

  const handleDeleteStudent = async (studentId: string) => {
    const deleted = students.find((s) => s.id === studentId);
    const updated = await StorageService.deleteStudent(studentId);
    setStudents(updated);
    showToast(`Removed student ${deleted?.fullName || ''}`);
  };

  // Reset to original demo dataset
  const handleResetDemoData = async () => {
    const { students: resetStudents, attendance: resetAtt } = await StorageService.resetDemoData();
    setStudents(resetStudents);
    setAllAttendance(resetAtt);
    setIsConfigModalOpen(false);
    showToast('Demo roster and sample attendance history restored!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isFirebaseActive={isFirebaseActive}
        onOpenFirebaseConfig={() => setIsConfigModalOpen(true)}
        onOpenFirebaseGuide={() => setCurrentTab('firebase-guide')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            students={students}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            currentAttendance={currentAttendance}
            onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
            onBulkMark={handleBulkMark}
            onClearAttendance={handleClearAttendance}
            onUpdateDayNotes={handleUpdateDayNotes}
            summary={summary}
            isSaving={isSaving}
          />
        )}

        {currentTab === 'students' && (
          <StudentDirectoryView
            students={students}
            allAttendance={allAttendance}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {currentTab === 'history' && (
          <AttendanceHistoryView
            students={students}
            allAttendance={allAttendance}
            onSelectDateToEdit={(date) => {
              setSelectedDate(date);
              setCurrentTab('dashboard');
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView students={students} allAttendance={allAttendance} />
        )}

        {currentTab === 'firebase-guide' && (
          <FirebaseGuideView
            onOpenConfigModal={() => setIsConfigModalOpen(true)}
            isFirebaseActive={isFirebaseActive}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Firebase & Database Settings Modal */}
      <FirebaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigUpdated={() => {
          setIsFirebaseActive(true);
          loadData();
        }}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
