import { Student, DailyAttendance, AttendanceSummary } from '../types';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const STORAGE_KEY_STUDENTS = 'classtrack_students_v1';
const STORAGE_KEY_ATTENDANCE = 'classtrack_attendance_v1';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-101',
    rollNumber: 'ROLL-101',
    fullName: 'Sophia Martinez',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Female',
    contactPhone: '+1 (555) 234-5678',
    guardianName: 'Elena Martinez',
    avatarBgColor: 'bg-emerald-600',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-102',
    rollNumber: 'ROLL-102',
    fullName: 'Liam Alexander Chen',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Male',
    contactPhone: '+1 (555) 345-6789',
    guardianName: 'David Chen',
    avatarBgColor: 'bg-teal-600',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-103',
    rollNumber: 'ROLL-103',
    fullName: 'Emma Grace Johnson',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Female',
    contactPhone: '+1 (555) 456-7890',
    guardianName: 'Sarah Johnson',
    avatarBgColor: 'bg-green-600',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-104',
    rollNumber: 'ROLL-104',
    fullName: 'Noah Benjamin Patel',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Male',
    contactPhone: '+1 (555) 567-8901',
    guardianName: 'Anil Patel',
    avatarBgColor: 'bg-emerald-700',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-105',
    rollNumber: 'ROLL-105',
    fullName: 'Olivia Rose Washington',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Female',
    contactPhone: '+1 (555) 678-9012',
    guardianName: 'Marcus Washington',
    avatarBgColor: 'bg-lime-700',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-106',
    rollNumber: 'ROLL-106',
    fullName: 'Ethan James Morales',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Male',
    contactPhone: '+1 (555) 789-0123',
    guardianName: 'Carla Morales',
    avatarBgColor: 'bg-teal-700',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-107',
    rollNumber: 'ROLL-107',
    fullName: 'Ava Marie Tanaka',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Female',
    contactPhone: '+1 (555) 890-1234',
    guardianName: 'Kenji Tanaka',
    avatarBgColor: 'bg-emerald-800',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'std-108',
    rollNumber: 'ROLL-108',
    fullName: 'Lucas Daniel Wright',
    gradeLevel: 'Grade 10 - Emerald',
    gender: 'Male',
    contactPhone: '+1 (555) 901-2345',
    guardianName: 'Emily Wright',
    avatarBgColor: 'bg-green-700',
    active: true,
    createdAt: '2026-09-01T08:00:00Z',
  },
];

function generateInitialAttendance(): Record<string, DailyAttendance> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dayBefore = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

  const results: Record<string, DailyAttendance> = {};

  results[dayBefore] = {
    date: dayBefore,
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    takenBy: 'Teacher Miller',
    notes: 'Regular morning assembly completed.',
    records: {
      'std-101': { status: 'present', timestamp: dayBefore + 'T08:15:00Z' },
      'std-102': { status: 'present', timestamp: dayBefore + 'T08:12:00Z' },
      'std-103': { status: 'absent', note: 'Sick leave reported by parent', timestamp: dayBefore + 'T08:10:00Z' },
      'std-104': { status: 'present', timestamp: dayBefore + 'T08:18:00Z' },
      'std-105': { status: 'present', timestamp: dayBefore + 'T08:14:00Z' },
      'std-106': { status: 'late', note: 'Bus delay 15 mins', timestamp: dayBefore + 'T08:35:00Z' },
      'std-107': { status: 'present', timestamp: dayBefore + 'T08:10:00Z' },
      'std-108': { status: 'present', timestamp: dayBefore + 'T08:11:00Z' },
    },
  };

  results[yesterday] = {
    date: yesterday,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    takenBy: 'Teacher Miller',
    notes: 'All laboratory work completed safely.',
    records: {
      'std-101': { status: 'present', timestamp: yesterday + 'T08:10:00Z' },
      'std-102': { status: 'present', timestamp: yesterday + 'T08:12:00Z' },
      'std-103': { status: 'present', timestamp: yesterday + 'T08:15:00Z' },
      'std-104': { status: 'present', timestamp: yesterday + 'T08:18:00Z' },
      'std-105': { status: 'absent', note: 'Family emergency', timestamp: yesterday + 'T08:05:00Z' },
      'std-106': { status: 'present', timestamp: yesterday + 'T08:19:00Z' },
      'std-107': { status: 'present', timestamp: yesterday + 'T08:08:00Z' },
      'std-108': { status: 'present', timestamp: yesterday + 'T08:11:00Z' },
    },
  };

  results[today] = {
    date: today,
    updatedAt: new Date().toISOString(),
    takenBy: 'Teacher Miller',
    notes: 'Morning Roll Call',
    records: {
      'std-101': { status: 'present', timestamp: today + 'T08:05:00Z' },
      'std-102': { status: 'present', timestamp: today + 'T08:08:00Z' },
      'std-103': { status: 'present', timestamp: today + 'T08:10:00Z' },
      'std-104': { status: 'present', timestamp: today + 'T08:12:00Z' },
      'std-105': { status: 'present', timestamp: today + 'T08:14:00Z' },
      'std-106': { status: 'absent', note: 'Medical appointment', timestamp: today + 'T08:02:00Z' },
      'std-107': { status: 'present', timestamp: today + 'T08:09:00Z' },
      'std-108': { status: 'present', timestamp: today + 'T08:11:00Z' },
    },
  };

  return results;
}

function cleanFirestorePayload<T>(value: T): T {
  if (value === null || value === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(cleanFirestorePayload) as unknown as T;
  }
  if (typeof value === 'object') {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        res[k] = cleanFirestorePayload(v);
      }
    }
    return res as T;
  }
  return value;
}

export const StorageService = {
  async getStudents(): Promise<Student[]> {
    // Attempt Firestore load
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      if (!querySnapshot.empty) {
        const list: Student[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Student, 'id'>) });
        });
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(list));
        return list;
      } else {
        // Empty collection - seed initial demo students to Firestore
        await this.seedInitialToFirestore();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('permission') || message.includes('Missing or insufficient permissions')) {
        console.warn('Firestore permissions notice: User is unauthenticated or rules restrict access. Using local offline cache.');
      } else {
        console.warn('Firestore offline or sync delay, using local cache:', message);
      }
    }

    // Fall back to local storage cache
    const localRaw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (localRaw) {
      try {
        return JSON.parse(localRaw);
      } catch (e) {
        console.error('Error parsing local students', e);
      }
    }

    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  },

  async seedInitialToFirestore(): Promise<void> {
    try {
      const batch = writeBatch(db);
      INITIAL_STUDENTS.forEach((st) => {
        const { id, ...data } = st;
        batch.set(doc(db, 'students', id), cleanFirestorePayload(data));
      });
      const initialAttendance = generateInitialAttendance();
      Object.entries(initialAttendance).forEach(([date, att]) => {
        batch.set(doc(db, 'attendance', date), cleanFirestorePayload(att));
      });
      await batch.commit();
      console.log('Seeded initial students and attendance to Firestore.');
    } catch (err) {
      console.warn('Initial Firestore seed notice:', err);
    }
  },

  async saveStudent(student: Student): Promise<{ updatedList: Student[]; cloudSaved: boolean }> {
    const current = await this.getStudents();
    const index = current.findIndex((s) => s.id === student.id);
    let updated: Student[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = student;
    } else {
      updated = [student, ...current];
    }
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));

    // Save to Firestore
    let cloudSaved = false;
    try {
      const { id, ...data } = student;
      const sanitized = cleanFirestorePayload(data);
      await setDoc(doc(db, 'students', id), sanitized);
      cloudSaved = true;
      console.log(`Firestore: Successfully saved student ${id} to cloud database.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Firestore write warning:', message);
    }

    return { updatedList: updated, cloudSaved };
  },

  async deleteStudent(studentId: string): Promise<Student[]> {
    const current = await this.getStudents();
    const updated = current.filter((s) => s.id !== studentId);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('permission') || message.includes('Missing or insufficient permissions')) {
        console.warn('Firestore permission note on deleteStudent, deleted locally:', message);
      } else {
        console.warn('Firestore delete warning:', err);
      }
    }

    return updated;
  },

  async getAllAttendance(): Promise<Record<string, DailyAttendance>> {
    try {
      const querySnapshot = await getDocs(collection(db, 'attendance'));
      if (!querySnapshot.empty) {
        const map: Record<string, DailyAttendance> = {};
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as DailyAttendance;
          map[docSnap.id] = { ...data, date: docSnap.id };
        });
        localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(map));
        return map;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('permission') || message.includes('Missing or insufficient permissions')) {
        console.warn('Firestore attendance permissions notice: Serving from local offline cache.');
      } else {
        console.warn('Firestore attendance load notice:', message);
      }
    }

    const localRaw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (localRaw) {
      try {
        return JSON.parse(localRaw);
      } catch (e) {
        console.error('Error parsing local attendance', e);
      }
    }

    const initialMap = generateInitialAttendance();
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(initialMap));
    return initialMap;
  },

  async saveDailyAttendance(daily: DailyAttendance): Promise<Record<string, DailyAttendance>> {
    const all = await this.getAllAttendance();
    const updated = {
      ...all,
      [daily.date]: daily,
    };
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(updated));

    try {
      const sanitized = cleanFirestorePayload(daily);
      await setDoc(doc(db, 'attendance', daily.date), sanitized);
      console.log(`Firestore: Successfully saved attendance for ${daily.date} to cloud database.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('permission') || message.includes('Missing or insufficient permissions')) {
        console.warn('Firestore attendance write notice, cached locally:', message);
      } else {
        console.warn('Firestore attendance write warning:', err);
      }
    }

    return updated;
  },

  async resetDemoData(): Promise<{ students: Student[]; attendance: Record<string, DailyAttendance> }> {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    const initAtt = generateInitialAttendance();
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(initAtt));

    try {
      const batch = writeBatch(db);
      INITIAL_STUDENTS.forEach((st) => {
        const { id, ...data } = st;
        batch.set(doc(db, 'students', id), data);
      });
      Object.entries(initAtt).forEach(([date, att]) => {
        batch.set(doc(db, 'attendance', date), att);
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore reset batch note:', e);
    }

    return { students: INITIAL_STUDENTS, attendance: initAtt };
  },

  calculateSummary(students: Student[], daily?: DailyAttendance): AttendanceSummary {
    const totalStudents = students.filter((s) => s.active).length;
    if (!daily || totalStudents === 0) {
      return {
        totalStudents,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: 0,
      };
    }

    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach((student) => {
      if (!student.active) return;
      const rec = daily.records[student.id];
      if (!rec) return;

      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;
      else if (rec.status === 'excused') excused++;
    });

    const attended = present + late;
    const markedTotal = present + absent + late + excused;
    const rate = markedTotal > 0 ? Math.round((attended / markedTotal) * 100) : 0;

    return {
      totalStudents,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      excusedCount: excused,
      attendanceRate: rate,
    };
  },
};
