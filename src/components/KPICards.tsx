import React from 'react';
import { Users, UserCheck, UserX, Percent } from 'lucide-react';
import { AttendanceSummary } from '../types';

interface KPICardsProps {
  summary: AttendanceSummary;
  selectedDate: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, selectedDate }) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Students */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{summary.totalStudents}</h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Active class roster</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
      </div>

      {/* Present Today */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Present {isToday ? 'Today' : ''}
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{summary.presentCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {summary.lateCount > 0 ? `+ ${summary.lateCount} late arrival(s)` : 'In class'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600" />
      </div>

      {/* Absent Today */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Absent {isToday ? 'Today' : ''}
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">{summary.absentCount}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {summary.excusedCount > 0 ? `${summary.excusedCount} excused leave` : 'Unexcused / pending'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
      </div>

      {/* Attendance Rate */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {summary.attendanceRate}%
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {summary.attendanceRate >= 90 ? '🟢 Excellent turnout' : summary.attendanceRate >= 75 ? '🟡 Average turnout' : '🔴 Low turnout'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, summary.attendanceRate))}%` }}
        />
      </div>
    </div>
  );
};
