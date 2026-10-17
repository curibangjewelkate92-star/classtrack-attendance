import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Printer, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  UserCheck,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { Student, DailyAttendance, AttendanceStatus } from '../types';

interface AttendanceHistoryViewProps {
  students: Student[];
  allAttendance: Record<string, DailyAttendance>;
  onSelectDateToEdit: (date: string) => void;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  students,
  allAttendance,
  onSelectDateToEdit,
}) => {
  // Sorted list of recorded dates in descending order (newest first)
  const recordedDates = Object.keys(allAttendance).sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split('T')[0];
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(recordedDates[0] || today);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState('');

  const activeDaily = allAttendance[selectedHistoryDate];

  // Helper stats for selected date
  const getStats = (daily?: DailyAttendance) => {
    if (!daily) return { total: 0, present: 0, absent: 0, late: 0, rate: 0 };
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    Object.values(daily.records).forEach((r) => {
      if (r.status === 'present') present++;
      if (r.status === 'absent') absent++;
      if (r.status === 'late') late++;
      if (r.status === 'excused') excused++;
    });

    const total = present + absent + late + excused;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  };

  const currentStats = getStats(activeDaily);

  // Export CSV
  const handleExportCSV = () => {
    if (!activeDaily) return;

    const headers = ['Roll Number', 'Student Name', 'Grade', 'Attendance Status', 'Notes', 'Recorded Date'];
    const rows = students.map((st) => {
      const rec = activeDaily.records[st.id];
      const status = rec ? rec.status.toUpperCase() : 'NOT MARKED';
      const note = rec?.note || '';
      return [
        `"${st.rollNumber}"`,
        `"${st.fullName}"`,
        `"${st.gradeLevel}"`,
        `"${status}"`,
        `"${note.replace(/"/g, '""')}"`,
        `"${selectedHistoryDate}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ClassTrack_Attendance_${selectedHistoryDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print Preview
  const handlePrint = () => {
    window.print();
  };

  // Filter students for the selected date view
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchStudent.toLowerCase());

    const rec = activeDaily?.records[student.id];
    const status = rec?.status || 'unmarked';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-600" />
            <span>Attendance History Logs</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past attendance records by date, export reports, or print official school attendance sheets.
          </p>
        </div>

        {/* Export and Print actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Date Selector Pills / Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Logged Date:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {recordedDates.slice(0, 7).map((d) => {
            const isSelected = d === selectedHistoryDate;
            const stats = getStats(allAttendance[d]);
            return (
              <button
                key={d}
                onClick={() => setSelectedHistoryDate(d)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{d}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {stats.rate}%
                </span>
              </button>
            );
          })}

          {/* Custom Date Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => e.target.value && setSelectedHistoryDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Date Summary Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Record Overview for:
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
            {new Date(selectedHistoryDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {activeDaily?.notes && (
            <p className="text-xs text-slate-600 mt-1 italic flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Notes: "{activeDaily.notes}"</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-3 py-2 rounded-xl border border-emerald-100 text-center min-w-[70px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Present</span>
            <p className="text-lg font-black text-emerald-600">{currentStats.present}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-rose-100 text-center min-w-[70px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Absent</span>
            <p className="text-lg font-black text-rose-600">{currentStats.absent}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-amber-100 text-center min-w-[70px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Late</span>
            <p className="text-lg font-black text-amber-600">{currentStats.late}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-emerald-200 text-center min-w-[80px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Turnout</span>
            <p className="text-lg font-black text-emerald-700">{currentStats.rate}%</p>
          </div>

          <button
            onClick={() => onSelectDateToEdit(selectedHistoryDate)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
          >
            Edit This Date
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            placeholder="Search student or roll number..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Show All Records</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="late">Late Only</option>
            <option value="excused">Excused Only</option>
          </select>
        </div>
      </div>

      {/* History Table / Printable Sheet Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Printable Header (Visible on print preview) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ClassTrack – Attendance Record</h1>
              <p className="text-sm text-slate-600 mt-1">Official Classroom Daily Roster Log</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">Date: {selectedHistoryDate}</p>
              <p className="text-xs text-slate-500">Attendance Rate: {currentStats.rate}%</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Roll ID</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No matching records found for this date.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, i) => {
                  const rec = activeDaily?.records[st.id];
                  const status = rec?.status;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{st.fullName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{st.rollNumber}</td>
                      <td className="py-3 px-4 text-slate-500">{st.gradeLevel}</td>
                      <td className="py-3 px-4">
                        {status === 'present' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Present</span>
                          </span>
                        ) : status === 'absent' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Absent</span>
                          </span>
                        ) : status === 'late' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Late</span>
                          </span>
                        ) : status === 'excused' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-blue-100 text-blue-800">
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Excused</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Recorded</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {rec?.note || <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Signature footer */}
        <div className="hidden print:flex items-center justify-between p-8 pt-16 border-t border-slate-300 text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-400 w-48 mb-1"></div>
            <p>Class Teacher Signature</p>
          </div>
          <div>
            <div className="border-b border-slate-400 w-48 mb-1"></div>
            <p>Principal / Dean Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};
