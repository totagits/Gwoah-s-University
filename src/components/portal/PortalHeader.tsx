import React from 'react';
import {
  GraduationCap,
  ListTodo,
  BarChart3,
  BookOpen,
  User,
  Users,
  Inbox,
  CreditCard,
  ShieldCheck,
  Globe,
  ChevronDown,
  Wifi,
  Sparkles,
  Sun,
  Moon,
  Settings,
  LogOut,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { ThemeMode } from '../../utils/themeManager';

interface PortalHeaderProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onBackToPublic: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  onOpenThemeSettings: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onSwitchRole,
  onLogout,
  onBackToPublic,
  currentTheme,
  onToggleTheme,
  onOpenThemeSettings,
}) => {
  const tabs = [
    { id: 'tasks', label: 'Tasks Dashboard', icon: ListTodo, badge: 'Core' },
    { id: 'analytics', label: 'Integrated Analytics', icon: BarChart3, badge: 'Realtime' },
    { id: 'faculty_admin', label: 'Faculty & Admin Desk', icon: Users, badge: 'New' },
    { id: 'academics', label: 'Course Planning & Add/Drop', icon: BookOpen },
    { id: 'student_portal', label: 'Student Portal', icon: User },
    { id: 'admissions', label: 'Admissions Desk', icon: Inbox },
    { id: 'finance', label: 'Finance & Bursar', icon: CreditCard },
    { id: 'compliance', label: 'NCHE & Audit', icon: ShieldCheck },
  ];

  const roleOptions: Array<{ role: UserRole; label: string }> = [
    { role: 'super_admin', label: 'Super Admin (President)' },
    { role: 'registrar', label: 'Registrar (Mrs. Tweh)' },
    { role: 'dean', label: 'Dean of Engineering' },
    { role: 'lecturer', label: 'Senior Lecturer (Dr. Doe)' },
    { role: 'student', label: 'Student (Sando F.)' },
    { role: 'bursar', label: 'Bursar (Mr. Barclay)' },
    { role: 'admissions_officer', label: 'Admissions Coordinator' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white shadow-lg sticky top-0 z-30">
      {/* Top Strip */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>← View Public University Website</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Active Term: <strong className="text-slate-200">Semester I 2026/2027</strong> (Week 2 • Add/Drop Active)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" />
              <span>Low-Bandwidth Sync Online</span>
            </span>

            {/* Quick Role Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium">Switch Role:</span>
              <select
                value={currentUser.role}
                onChange={(e) => onSwitchRole(e.target.value as UserRole)}
                className="bg-transparent text-amber-300 font-semibold text-xs focus:outline-none cursor-pointer"
                aria-label="Switch User Role"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              title={`Switch to ${currentTheme === 'dark' ? 'High-Contrast Light' : 'Dark'} Mode`}
              aria-label="Toggle display theme"
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px]">Dark Mode</span>
                </>
              )}
            </button>

            {/* Portal & Accessibility Settings */}
            <button
              onClick={onOpenThemeSettings}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              title="Portal Settings & Accessibility"
              aria-label="Open portal settings"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400" />
              <span className="text-[11px] hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors p-1"
              title="Sign Out"
              aria-label="Sign out of portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar with user badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Gwoah's University ERP
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.name} • {currentUser.title}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-800/80 mt-3 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
