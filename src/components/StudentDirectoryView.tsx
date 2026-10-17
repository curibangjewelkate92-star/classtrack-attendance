import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Phone, 
  UserCheck, 
  AlertTriangle, 
  X, 
  GraduationCap,
  ShieldCheck,
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';
import { Student, DailyAttendance } from '../types';

interface StudentDirectoryViewProps {
  students: Student[];
  allAttendance: Record<string, DailyAttendance>;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-green-600',
  'bg-emerald-700',
  'bg-lime-700',
  'bg-teal-700',
  'bg-emerald-800',
  'bg-green-700',
];

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  students,
  allAttendance,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    fullName: string;
    rollNumber: string;
    gradeLevel: string;
    gender: 'Male' | 'Female' | 'Other';
    contactPhone: string;
    guardianName: string;
    active: boolean;
  }>({
    fullName: '',
    rollNumber: '',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Female',
    contactPhone: '',
    guardianName: '',
    active: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const uniqueGrades = Array.from(new Set(students.map((s) => s.gradeLevel)));

  // Calculate individual student attendance rate
  const getStudentStats = (studentId: string) => {
    let presentCount = 0;
    let totalMarked = 0;

    Object.values(allAttendance).forEach((day) => {
      const rec = day.records[studentId];
      if (rec) {
        totalMarked++;
        if (rec.status === 'present' || rec.status === 'late') {
          presentCount++;
        }
      }
    });

    const rate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;
    return { presentCount, totalMarked, rate };
  };

  const validateForm = (isEditing: boolean, studentId?: string): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter a valid student full name (minimum 2 letters).';
    }

    if (!formData.rollNumber.trim()) {
      errors.rollNumber = 'Roll number or student ID is required.';
    } else {
      // Check duplicate roll number
      const duplicate = students.find(
        (s) =>
          s.rollNumber.trim().toLowerCase() === formData.rollNumber.trim().toLowerCase() &&
          (!isEditing || s.id !== studentId)
      );
      if (duplicate) {
        errors.rollNumber = `Roll number "${formData.rollNumber}" is already assigned to ${duplicate.fullName}.`;
      }
    }

    if (!formData.gradeLevel.trim()) {
      errors.gradeLevel = 'Class or grade level is required.';
    }

    if (formData.contactPhone && !/^[+0-9\s\-()]{7,20}$/.test(formData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number format.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    // Generate next roll number suggestion
    const nextNum = students.length + 101;
    setFormData({
      fullName: '',
      rollNumber: `ROLL-${nextNum}`,
      gradeLevel: uniqueGrades[0] || 'Grade 10 - Emerald',
      gender: 'Female',
      contactPhone: '',
      guardianName: '',
      active: true,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      gradeLevel: student.gradeLevel,
      gender: student.gender || 'Female',
      contactPhone: student.contactPhone || '',
      guardianName: student.guardianName || '',
      active: student.active,
    });
    setFormErrors({});
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = Boolean(editingStudent);
    if (!validateForm(isEditing, editingStudent?.id)) {
      return;
    }

    if (isEditing && editingStudent) {
      const updated: Student = {
        ...editingStudent,
        fullName: formData.fullName.trim(),
        rollNumber: formData.rollNumber.trim(),
        gradeLevel: formData.gradeLevel.trim(),
        gender: formData.gender,
        contactPhone: formData.contactPhone.trim() || undefined,
        guardianName: formData.guardianName.trim() || undefined,
        active: formData.active,
      };
      onUpdateStudent(updated);
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: 'std-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        fullName: formData.fullName.trim(),
        rollNumber: formData.rollNumber.trim(),
        gradeLevel: formData.gradeLevel.trim(),
        gender: formData.gender,
        contactPhone: formData.contactPhone.trim() || undefined,
        guardianName: formData.guardianName.trim() || undefined,
        avatarBgColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        active: true,
        createdAt: new Date().toISOString(),
      };
      onAddStudent(newStudent);
      setIsAddModalOpen(false);
    }
  };

  // Filter students list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(search.toLowerCase()));
    const matchesGrade = gradeFilter === 'all' || s.gradeLevel === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            <span>Student Directory</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your class roster, add new enrollments, and track individual attendance profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or guardian..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            <option value="all">All Classes / Grades</option>
            {uniqueGrades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new student using the button above or clear search filters.
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const stats = getStudentStats(student.id);

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${
                        student.avatarBgColor || 'bg-emerald-600'
                      } text-white font-extrabold flex items-center justify-center text-base shadow-xs shrink-0`}
                    >
                      {student.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{student.fullName}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                          {student.rollNumber}
                        </span>
                        <span>•</span>
                        <span>{student.gradeLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Rate Pill */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        stats.rate >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : stats.rate >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {stats.rate}% Rate
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {stats.presentCount}/{stats.totalMarked} days
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl space-y-1">
                  {student.guardianName && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guardian:</span>
                      <span className="font-medium text-slate-800">{student.guardianName}</span>
                    </div>
                  )}
                  {student.contactPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Contact:</span>
                      <a
                        href={`tel:${student.contactPhone}`}
                        className="font-medium text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {student.contactPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gender:</span>
                    <span className="font-medium text-slate-700">{student.gender || 'Not specified'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setViewingStudent(student)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(student)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingStudent(student)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>{editingStudent ? 'Edit Student Record' : 'Add New Student'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maria Gonzalez"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    formErrors.fullName
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.fullName}</p>
                )}
              </div>

              {/* Roll Number and Grade Level in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Roll Number / ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ROLL-109"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                      formErrors.rollNumber
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-emerald-500'
                    }`}
                  />
                  {formErrors.rollNumber && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.rollNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Class / Grade <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 10 - Emerald"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.gradeLevel && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.gradeLevel}</p>
                  )}
                </div>
              </div>

              {/* Gender and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      formErrors.contactPhone
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-emerald-500'
                    }`}
                  />
                  {formErrors.contactPhone && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.contactPhone}</p>
                  )}
                </div>
              </div>

              {/* Guardian Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Guardian / Parent Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rosa Gonzalez"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details / Profile Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Student Attendance Profile</h3>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-5 text-center">
              <div
                className={`w-16 h-16 rounded-3xl ${
                  viewingStudent.avatarBgColor || 'bg-emerald-600'
                } text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md`}
              >
                {viewingStudent.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 mt-3">{viewingStudent.fullName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{viewingStudent.rollNumber} • {viewingStudent.gradeLevel}</p>
            </div>

            {/* Attendance Score Card */}
            {(() => {
              const stats = getStudentStats(viewingStudent.id);
              return (
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-around text-center">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">Attendance Rate</span>
                    <span className="text-2xl font-black text-emerald-700">{stats.rate}%</span>
                  </div>
                  <div className="w-px h-8 bg-emerald-200"></div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">Days Present</span>
                    <span className="text-2xl font-black text-slate-800">{stats.presentCount} / {stats.totalMarked}</span>
                  </div>
                </div>
              );
            })()}

            {/* Details list */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800">{viewingStudent.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Guardian</span>
                <span className="font-semibold text-slate-800">{viewingStudent.guardianName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contact Number</span>
                <span className="font-semibold text-emerald-700">{viewingStudent.contactPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Enrollment Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(viewingStudent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Remove Student?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove <strong>{deletingStudent.fullName}</strong> ({deletingStudent.rollNumber})? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
