import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Server, 
  CloudCheck,
  ExternalLink,
  ShieldCheck,
  Flame,
  Activity
} from 'lucide-react';
import { db, testConnectionOnBoot, getFirebaseProjectInfo } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
  onResetDemoData: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
  onResetDemoData,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const projectInfo = getFirebaseProjectInfo();

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const pingDocRef = doc(db, '_classtrack_health', 'live_check');
      await setDoc(pingDocRef, {
        ping: true,
        timestamp: new Date().toISOString(),
        system: 'ClassTrack Student Attendance System',
      });
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Successfully connected to Firestore database on project "${projectInfo.projectId}"! Health check document written.`,
      });
    } catch (err: unknown) {
      setIsTesting(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `Firestore ping note: ${errMsg}. Local cache is active to ensure zero downtime.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Firebase Firestore Backend</h3>
              <p className="text-xs text-slate-500">Live cloud database status & diagnostic controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Backend Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-600" />
              Connected Firebase Project
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-900 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Live Synced
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Project ID:</span>
              <span className="font-mono font-bold text-slate-900">{projectInfo.projectId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Database Instance:</span>
              <span className="font-mono text-[11px] text-slate-800 truncate max-w-[220px]" title={projectInfo.databaseId}>
                {projectInfo.databaseId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Region:</span>
              <span className="font-mono text-slate-800">asia-east1</span>
            </div>
          </div>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Features Checklist */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <p className="font-bold text-slate-800">Automatic Persistence Features:</p>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Student records enrolled/deleted sync to <code>/students</code> collection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Daily roll call and attendance status sync to <code>/attendance</code> collection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Offline caching preserves instant attendance taking even without an internet connection</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetDemoData}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
            title="Reset students and logs to original demo dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Roster</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isTesting}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Pinging Firestore...' : 'Test Connection Ping'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
