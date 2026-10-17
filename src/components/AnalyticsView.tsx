import React from 'react';
import { 
  BarChart3, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  PhoneCall, 
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Student, DailyAttendance } from '../types';

interface AnalyticsViewProps {
  students: Student[];
  allAttendance: Record<string, DailyAttendance>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ students, allAttendance }) => {
  const recordedDates = Object.keys(allAttendance).sort(); // chronological
  const totalDays = recordedDates.length;

  // Calculate per student rates
  const studentMetrics = students.map((student) => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let totalMarked = 0;

    recordedDates.forEach((date) => {
      const rec = allAttendance[date]?.records[student.id];
      if (rec) {
        totalMarked++;
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'late') {
          lateCount++;
          presentCount++; // Late is counted as present in overall rate
        } else if (rec.status === 'absent') {
          absentCount++;
        }
      }
    });

    const rate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;
    return {
      student,
      presentCount,
      absentCount,
      lateCount,
      totalMarked,
      rate,
    };
  });

  // Top performers (95%+ attendance)
  const topStudents = studentMetrics
    .filter((m) => m.rate >= 90 && m.totalMarked > 0)
    .sort((a, b) => b.rate - a.rate);

  // At risk students (< 80% attendance)
  const atRiskStudents = studentMetrics
    .filter((m) => m.rate < 80 && m.totalMarked > 0)
    .sort((a, b) => a.rate - b.rate);

  // Daily turnout trends for the latest 7 recorded days
  const recentDays = recordedDates.slice(-7);
  const dailyTrends = recentDays.map((d) => {
    const daily = allAttendance[d];
    let present = 0;
    let marked = 0;
    students.forEach((s) => {
      const rec = daily?.records[s.id];
      if (rec) {
        marked++;
        if (rec.status === 'present' || rec.status === 'late') present++;
      }
    });
    const rate = marked > 0 ? Math.round((present / marked) * 100) : 0;
    return {
      date: d,
      rate,
      present,
      marked,
    };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Analytics Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Attendance Reports & Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Summary insights across {totalDays} recorded school sessions.
          </p>
        </div>
      </div>

      {/* Turnout Trend Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Daily Turnout Trend (Recent Sessions)</span>
            </h3>
            <p className="text-xs text-slate-500">Percentage of students present by date</p>
          </div>
        </div>

        {dailyTrends.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No attendance data recorded yet.
          </div>
        ) : (
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 items-end h-48 border-b border-slate-200 pb-2">
              {dailyTrends.map((t) => (
                <div key={t.date} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 mb-1 group-hover:text-emerald-700">
                    {t.rate}%
                  </span>
                  <div
                    className="w-full max-w-[42px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all relative"
                    style={{ height: `${Math.max(12, t.rate)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none transition-opacity">
                      {t.present}/{t.marked} students
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[48px]">
                    {t.date.substring(5)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Past dates</span>
              <span>Latest session</span>
            </div>
          </div>
        )}
      </div>

      {/* Two columns: Honor Roll & At-Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Honor Roll */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-base mb-1">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Outstanding Attendance (90%+)</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Students maintaining regular classroom presence.
            </p>

            <div className="space-y-2.5">
              {topStudents.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No students meeting this threshold yet.</p>
              ) : (
                topStudents.slice(0, 6).map((item) => (
                  <div
                    key={item.student.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg ${
                          item.student.avatarBgColor || 'bg-emerald-600'
                        } text-white font-bold text-xs flex items-center justify-center`}
                      >
                        {item.student.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.student.fullName}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{item.student.rollNumber}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {item.rate}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Needs Attention / Guardian Followup */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-base mb-1">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Attendance Concerns (&lt; 80%)</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Students with frequent absences that may require follow-up.
            </p>

            <div className="space-y-2.5">
              {atRiskStudents.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs text-center border border-emerald-100">
                  🎉 Great job! No students currently fall below the 80% attendance mark.
                </div>
              ) : (
                atRiskStudents.map((item) => (
                  <div
                    key={item.student.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg ${
                          item.student.avatarBgColor || 'bg-rose-600'
                        } text-white font-bold text-xs flex items-center justify-center`}
                      >
                        {item.student.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.student.fullName}</h4>
                        <p className="text-[10px] text-slate-500">
                          {item.absentCount} absences ({item.rate}% rate)
                        </p>
                      </div>
                    </div>

                    {item.student.contactPhone ? (
                      <a
                        href={`tel:${item.student.contactPhone}`}
                        className="flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-white px-2 py-1 rounded-md border border-rose-200 hover:bg-rose-100"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call Guardian</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No phone</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
