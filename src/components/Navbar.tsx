import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Users, 
  Clock, 
  BarChart3, 
  Database, 
  CloudCheck, 
  HardDrive,
  School,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { auth, signInWithGoogle, signOutTeacher } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export type NavTab = 'dashboard' | 'students' | 'history' | 'analytics' | 'firebase-guide';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isFirebaseActive: boolean;
  onOpenFirebaseConfig: () => void;
  onOpenFirebaseGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isFirebaseActive,
  onOpenFirebaseConfig,
  onOpenFirebaseGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Attendance', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'analytics', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'firebase-guide', label: 'Firebase Guide', icon: <Database className="w-4 h-4" /> },
  ];

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutTeacher();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">Class<span className="text-emerald-600">Track</span></span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    School Edition
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">Student Attendance Management</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Status & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Storage State Indicator */}
              <button
                onClick={onOpenFirebaseConfig}
                title="Connected to Firebase Firestore"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Firestore Synced</span>
                <Settings className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Teacher Google Sign In */}
              {currentUser ? (
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Teacher'}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {(currentUser.displayName || currentUser.email || 'T')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate hidden lg:inline">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Sign In with Google"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Teacher Login</span>
                </button>
              )}

              {/* Help & Hosting Guide Quick Button */}
              <button
                onClick={onOpenFirebaseGuide}
                title="Firebase & Deployment Guide"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Deploy Guide</span>
              </button>

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Secondary) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  currentTab === item.id
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={currentTab === item.id ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  <span>Sign Out ({currentUser.displayName || currentUser.email})</span>
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSignIn();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100"
                >
                  <span>Teacher Google Sign In</span>
                  <LogIn className="w-4 h-4 text-slate-500" />
                </button>
              )}

              <button
                onClick={() => {
                  onOpenFirebaseConfig();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100"
              >
                <span>Database Settings</span>
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => {
                  onOpenFirebaseGuide();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100"
              >
                <span>Firebase & Hosting Deployment Guide</span>
                <HelpCircle className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Primary Touch Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xl px-2 py-1.5 flex items-center justify-around">
        {navItems.slice(0, 4).map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectTab('firebase-guide')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            currentTab === 'firebase-guide' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'firebase-guide' ? 'bg-emerald-100 text-emerald-700' : ''}`}>
            <Database className="w-4 h-4" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Deploy</span>
        </button>
      </nav>
    </>
  );
};
