import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Check, 
  X, 
  Clock, 
  FileText, 
  CheckCheck, 
  RotateCcw,
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Student, DailyAttendance, AttendanceStatus, AttendanceSummary } from '../types';
import { KPICards } from './KPICards';

interface DashboardViewProps {
  students: Student[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  currentAttendance: DailyAttendance;
  onUpdateAttendanceRecord: (studentId: string, status: AttendanceStatus, note?: string) => void;
  onBulkMark: (status: AttendanceStatus) => void;
  onClearAttendance: () => void;
  onUpdateDayNotes: (notes: string) => void;
  summary: AttendanceSummary;
  isSaving: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  selectedDate,
  onDateChange,
  currentAttendance,
  onUpdateAttendanceRecord,
  onBulkMark,
  onClearAttendance,
  onUpdateDayNotes,
  summary,
  isSaving,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNoteStudentId, setEditingNoteStudentId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Extract unique grades
  const grades = Array.from(new Set(students.map((s) => s.gradeLevel)));

  // Date navigation helpers
  const handlePrevDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() - 1);
    onDateChange(cur.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + 1);
    onDateChange(cur.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    if (!student.active) return false;
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || student.gradeLevel === selectedGrade;

    const record = currentAttendance.records[student.id];
    const status = record?.status || 'unmarked';

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unmarked' && !record) ||
      status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleOpenNote = (studentId: string) => {
    const existing = currentAttendance.records[studentId]?.note || '';
    setTempNote(existing);
    setEditingNoteStudentId(studentId);
  };

  const handleSaveNote = (studentId: string) => {
    const curStatus = currentAttendance.records[studentId]?.status || 'present';
    onUpdateAttendanceRecord(studentId, curStatus, tempNote.trim() || undefined);
    setEditingNoteStudentId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner & Date Selector */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Class Attendance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatDateDisplay(selectedDate)}
            </h1>
            <p className="text-emerald-100/90 text-sm mt-0.5">
              Mark attendance for students. Changes are saved automatically.
            </p>
          </div>

          {/* Date Picker & Nav Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-emerald-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/30">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
              title="Previous Day"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-emerald-950/80 text-white font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl border border-emerald-600/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
              title="Next Day"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isToday && (
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Live Auto-Save Pill */}
        <div className="mt-4 pt-3 border-t border-emerald-600/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              {isSaving ? 'Saving changes...' : 'Synced and up to date'}
            </span>
          </div>
          <div className="text-emerald-100 text-[11px] font-medium">
            Marked: <strong className="text-white">{summary.presentCount + summary.absentCount + summary.lateCount + summary.excusedCount}</strong> of <strong className="text-white">{summary.totalStudents}</strong> students
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards summary={summary} selectedDate={selectedDate} />

      {/* Actions and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
              Quick Mark:
            </span>
            <button
              onClick={() => onBulkMark('present')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => onBulkMark('absent')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
            >
              <X className="w-4 h-4 text-rose-600" />
              <span>Mark All Absent</span>
            </button>
            <button
              onClick={onClearAttendance}
              className="flex items-center space-x-1 px-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors"
              title="Clear today's attendance"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Day Note toggle / preview */}
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Add optional notes for this date..."
              value={currentAttendance.notes || ''}
              onChange={(e) => onUpdateDayNotes(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll #..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Grade filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Classes / Grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Attendance Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
              <option value="unmarked">Unmarked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List & Attendance Marking */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or grade filter, or add new students from the Students Directory tab.
            </p>
          </div>
        ) : (
          filteredStudents.map((student, index) => {
            const record = currentAttendance.records[student.id];
            const currentStatus = record?.status;
            const hasNote = Boolean(record?.note);

            return (
              <div
                key={student.id}
                className={`bg-white rounded-2xl p-4 border transition-all duration-150 ${
                  currentStatus === 'present'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : currentStatus === 'absent'
                    ? 'border-rose-200 bg-rose-50/20'
                    : currentStatus === 'late'
                    ? 'border-amber-200 bg-amber-50/20'
                    : currentStatus === 'excused'
                    ? 'border-blue-200 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
                      #{index + 1}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-xl ${
                        student.avatarBgColor || 'bg-emerald-600'
                      } text-white font-bold flex items-center justify-center shrink-0 shadow-xs text-sm`}
                    >
                      {student.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 truncate text-sm sm:text-base">
                          {student.fullName}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          {student.rollNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{student.gradeLevel}</span>
                        {record?.note && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {record.note}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0">
                    {/* PRESENT Button (Primary) */}
                    <button
                      type="button"
                      onClick={() => onUpdateAttendanceRecord(student.id, 'present')}
                      className={`flex-1 sm:flex-initial min-w-[90px] sm:min-w-[100px] h-11 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-xs ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${currentStatus === 'present' ? 'stroke-[3]' : ''}`} />
                      <span>PRESENT</span>
                    </button>

                    {/* ABSENT Button (Primary) */}
                    <button
                      type="button"
                      onClick={() => onUpdateAttendanceRecord(student.id, 'absent')}
                      className={`flex-1 sm:flex-initial min-w-[90px] sm:min-w-[100px] h-11 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-xs ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white ring-2 ring-rose-600 ring-offset-2'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 active:scale-95'
                      }`}
                    >
                      <X className={`w-4 h-4 ${currentStatus === 'absent' ? 'stroke-[3]' : ''}`} />
                      <span>ABSENT</span>
                    </button>

                    {/* LATE Button (Secondary) */}
                    <button
                      type="button"
                      onClick={() => onUpdateAttendanceRecord(student.id, 'late')}
                      title="Mark Late"
                      className={`h-11 px-2.5 sm:px-3 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
                        currentStatus === 'late'
                          ? 'bg-amber-500 text-white font-bold ring-2 ring-amber-500 ring-offset-2'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Late</span>
                    </button>

                    {/* Add Note Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenNote(student.id)}
                      title={hasNote ? `Edit Note: "${record?.note}"` : 'Add note/remarks'}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                        hasNote
                          ? 'bg-emerald-100 text-emerald-800 font-bold'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Note Editor Modal/Card */}
                {editingNoteStudentId === student.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Remarks for ${student.fullName} (e.g. excused doctor checkup, arrived at 8:30)`}
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNote(student.id);
                        if (e.key === 'Escape') setEditingNoteStudentId(null);
                      }}
                      autoFocus
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleSaveNote(student.id)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setEditingNoteStudentId(null)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
