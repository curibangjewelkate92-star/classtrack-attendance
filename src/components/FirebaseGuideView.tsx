import React, { useState } from 'react';
import { 
  Database, 
  Cloud, 
  Terminal, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  FileCode,
  Flame,
  Globe,
  Settings
} from 'lucide-react';

interface FirebaseGuideViewProps {
  onOpenConfigModal: () => void;
  isFirebaseActive: boolean;
}

export const FirebaseGuideView: React.FC<FirebaseGuideViewProps> = ({
  onOpenConfigModal,
  isFirebaseActive,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ClassTrack Rules: Secure students & attendance collections
    match /students/{studentId} {
      allow read, write: if true; // In production, replace with: if request.auth != null;
    }
    match /attendance/{date} {
      allow read, write: if true; // In production, replace with: if request.auth != null;
    }
    match /_classtrack_health/{docId} {
      allow read, write: if true;
    }
  }
}`;

  const sampleFirebaseJson = `{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}`;

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Configuration & Deployment Handbook</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Firebase Firestore & Hosting Setup
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Learn how to configure Google Firebase Firestore for cloud persistence and deploy your ClassTrack application to Firebase Hosting.
            </p>
          </div>

          <button
            onClick={onOpenConfigModal}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-md shrink-0"
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span>{isFirebaseActive ? 'Manage Firebase Settings' : 'Connect Your Firebase'}</span>
          </button>
        </div>

        {/* Current status banner */}
        <div className="mt-5 pt-4 border-t border-emerald-600/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-200">Connected Project:</span>
            <span className="bg-emerald-500/40 text-white px-2.5 py-0.5 rounded-full font-bold font-mono flex items-center gap-1.5 border border-emerald-400">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              onyx-audio-42w8r
            </span>
          </div>
          <span className="text-emerald-200 text-[11px]">Region: asia-east1</span>
        </div>
      </div>

      {/* Step 1: Firebase Project & Firestore */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Create a Firebase Project & Enable Firestore
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Firebase provides a free tier ("Spark Plan") with no credit card required to start.
            </p>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 ml-2">
          <li>
            Visit the{' '}
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              Firebase Console <ExternalLink className="w-3 h-3" />
            </a>{' '}
            and click <strong>"Add project"</strong>.
          </li>
          <li>Enter a project name (e.g. <code>classtrack-school</code>) and click <strong>Continue</strong>.</li>
          <li>In the Firebase sidebar, go to <strong>Build &gt; Firestore Database</strong>.</li>
          <li>Click <strong>Create database</strong>, select a cloud location close to your users, and choose <strong>Start in test mode</strong> (or production mode with the rules below).</li>
        </ol>

        {/* Firestore Security Rules Box */}
        <div className="mt-3 bg-slate-900 rounded-xl p-4 text-slate-100 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              firestore.rules
            </span>
            <button
              onClick={() => copyToClipboard(sampleRules, 'rules')}
              className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
            >
              {copiedKey === 'rules' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300">
            {sampleRules}
          </pre>
        </div>
      </div>

      {/* Step 2: Register Web App & Connect */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Register Web App & Connect to ClassTrack
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Extract your Web App config credentials directly from your Firebase Project Settings.
            </p>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 ml-2">
          <li>In your Firebase Project Overview, click the <strong>Web icon</strong> (<code>&lt;/&gt;</code>) to add an app.</li>
          <li>Enter an app nickname (e.g. <code>ClassTrack Web</code>) and click <strong>Register app</strong>.</li>
          <li>
            Firebase will present your <code>firebaseConfig</code> object containing:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-600 font-mono text-[11px]">
              <li>apiKey: "AIzaSy..."</li>
              <li>authDomain: "your-project.firebaseapp.com"</li>
              <li>projectId: "your-project-id"</li>
              <li>storageBucket: "your-project.appspot.com"</li>
              <li>messagingSenderId: "123456789"</li>
              <li>appId: "1:12345:web:6789"</li>
            </ul>
          </li>
          <li>
            Click the button below to open <strong>Database Settings</strong> and paste your configuration. ClassTrack tests the connection automatically!
          </li>
        </ol>

        <div className="pt-2">
          <button
            onClick={onOpenConfigModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            Open Database Settings & Connect
          </button>
        </div>
      </div>

      {/* Step 3: Deploy to Firebase Hosting */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
            3
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Deploying ClassTrack to Firebase Hosting
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deploy your production-built web application to a fast Google CDN with free SSL certificate.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-900 rounded-xl p-4 text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                Terminal Deployment Commands
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `# 1. Install Firebase CLI globally\nnpm install -g firebase-tools\n\n# 2. Login to your Google account\nfirebase login\n\n# 3. Initialize Firebase Hosting in project root\nfirebase init hosting\n\n# 4. Build the production bundle\nnpm run build\n\n# 5. Deploy to live URL\nfirebase deploy --only hosting`,
                    'commands'
                  )
                }
                className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedKey === 'commands' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300 space-y-1">
              <div><span className="text-slate-500"># 1. Install Firebase CLI</span></div>
              <div className="text-emerald-400">npm install -g firebase-tools</div>
              <div className="pt-1"><span className="text-slate-500"># 2. Login to Google</span></div>
              <div className="text-emerald-400">firebase login</div>
              <div className="pt-1"><span className="text-slate-500"># 3. Initialize Hosting (public dir: 'dist', SPA: 'Yes')</span></div>
              <div className="text-emerald-400">firebase init hosting</div>
              <div className="pt-1"><span className="text-slate-500"># 4. Compile the web application</span></div>
              <div className="text-emerald-400">npm run build</div>
              <div className="pt-1"><span className="text-slate-500"># 5. Deploy to live global CDN</span></div>
              <div className="text-emerald-400">firebase deploy --only hosting</div>
            </pre>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">During <code>firebase init hosting</code> prompts:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2 text-slate-600">
              <li><strong>What do you want to use as your public directory?</strong> Type <code className="bg-slate-200 px-1 rounded">dist</code></li>
              <li><strong>Configure as a single-page app (rewrite all urls to /index.html)?</strong> Type <code className="bg-slate-200 px-1 rounded">Yes</code></li>
              <li><strong>Set up automatic builds and deploys with GitHub?</strong> Type <code className="bg-slate-200 px-1 rounded">No</code> (or Yes if desired)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 4: Testing the App */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
            4
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-900">
              How to Test ClassTrack Right Now
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify all key features in your browser or on your mobile device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Test Marking Attendance
            </h4>
            <p className="text-slate-600 text-[11px]">
              On the <strong>Attendance</strong> tab, click <strong>PRESENT</strong> or <strong>ABSENT</strong> on any student card. Notice the attendance rate and counters update instantly and save automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Test Date Switching & History
            </h4>
            <p className="text-slate-600 text-[11px]">
              Use the top date arrows (or date picker) to change the date. Head to the <strong>History</strong> tab to inspect logged attendance by date or click <strong>Export CSV</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. Test Student Enrollment & Deletion
            </h4>
            <p className="text-slate-600 text-[11px]">
              Switch to <strong>Students</strong> tab. Click <strong>Add New Student</strong> to enroll a student with roll number and grade. Test form validation and deletion safeguards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              4. Test Mobile Responsiveness
            </h4>
            <p className="text-slate-600 text-[11px]">
              Resize your browser window down to mobile width (or open on a phone). Notice the sticky bottom navigation bar, 44px+ touch targets, and responsive cards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
