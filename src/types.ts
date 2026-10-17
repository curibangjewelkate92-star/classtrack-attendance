export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string; // Internal unique ID
  rollNumber: string; // e.g. "STD-101"
  fullName: string;
  gradeLevel: string; // e.g. "Grade 10 - Emerald"
  gender?: 'Male' | 'Female' | 'Other';
  contactPhone?: string;
  guardianName?: string;
  avatarBgColor?: string;
  active: boolean;
  createdAt: string;
}

export interface AttendanceEntry {
  status: AttendanceStatus;
  note?: string;
  timestamp: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceEntry>; // key: studentId, value: AttendanceEntry
  takenBy?: string;
  notes?: string;
  updatedAt: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface AttendanceSummary {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number; // 0 to 100
}
