import React from 'react';
import {
  ListTodo,
  BarChart3,
  BookOpen,
  User,
  Users,
  Inbox,
  CreditCard,
  ShieldCheck,
  Globe,
  Wifi,
  Sparkles,
  Sun,
  Moon,
  Settings,
  LogOut,
  Video,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { ThemeMode } from '../../utils/themeManager';
import { PortalNotificationsPopover } from './PortalNotificationsPopover';

interface PortalHeaderProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tabId: string, subAction?: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onBackToPublic: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  onOpenThemeSettings: () => void;
  onOpenPrintModal?: (docType: 'transcript' | 'financial_statement') => void;
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
  onOpenPrintModal,
}) => {
  const tabs = [
    { id: 'tasks', label: 'Tasks Dashboard', icon: ListTodo, badge: 'Core' },
    { id: 'analytics', label: 'Integrated Analytics', icon: BarChart3, badge: 'Realtime' },
    { id: 'faculty_admin', label: 'Faculty & Admin Desk', icon: Users, badge: 'New' },
    { id: 'academics', label: 'Course Planning & Add/Drop', icon: BookOpen },
    { id: 'student_portal', label: 'Student Portal', icon: User },
    { id: 'classroom', label: 'Online Classroom & Studio', icon: Video, badge: 'Collab' },
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
    <div className="bg-[#4A1249] border-b-2 border-[#C39A53]/60 text-white shadow-xl sticky top-0 z-30">
      {/* Top Institutional Strip */}
      <div className="bg-[#2A082C] px-4 py-2 border-b border-[#C39A53]/25 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 text-[#C39A53] hover:text-[#DDB86C] font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>← View Public University Website</span>
            </button>
            <span className="text-purple-300/40">|</span>
            <span className="text-purple-100">
              Active Term: <strong className="text-white font-bold">Semester I 2026/2027</strong> (Week 2 • Add/Drop Window Open)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-200 text-[11px] font-bold bg-[#4A1249] border border-[#C39A53]/50 px-2.5 py-0.5 rounded-full">
              <Wifi className="w-3 h-3 text-[#C39A53]" />
              <span>Campus Starlink Active</span>
            </span>

            {/* Quick Role Switcher */}
            <div className="flex items-center gap-1.5 bg-[#4A1249] border border-[#C39A53]/50 px-2.5 py-1 rounded">
              <Sparkles className="w-3.5 h-3.5 text-[#C39A53] shrink-0" />
              <span className="text-[11px] text-purple-200 font-bold uppercase tracking-wider">Role:</span>
              <select
                value={currentUser.role}
                onChange={(e) => onSwitchRole(e.target.value as UserRole)}
                className="bg-transparent text-[#C39A53] font-bold text-xs focus:outline-none cursor-pointer"
                aria-label="Switch User Role"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role} className="bg-[#2A082C] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#4A1249] hover:bg-[#661B69] border border-[#C39A53]/40 text-xs font-bold uppercase tracking-wider text-purple-100 transition-colors cursor-pointer"
              title={`Switch display mode (Current: ${currentTheme === 'light' ? 'HIAU Purple & Gold Standard' : 'Academic Midnight Purple'})`}
              aria-label="Toggle display theme"
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span className="text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span className="text-[11px]">Midnight Mode</span>
                </>
              )}
            </button>

            {/* Portal & Accessibility Settings */}
            <button
              onClick={onOpenThemeSettings}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#4A1249] hover:bg-[#661B69] border border-white/10 text-purple-200 hover:text-[#C39A53] text-xs font-medium transition-colors cursor-pointer"
              title="Portal Settings & Accessibility"
              aria-label="Open portal settings"
            >
              <Settings className="w-3.5 h-3.5 text-purple-300 hover:text-[#C39A53]" />
              <span className="text-[11px] hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-purple-300 hover:text-rose-400 transition-colors p-1 cursor-pointer"
              title="Sign Out of ERP"
              aria-label="Sign out of portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar with user badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/image_bfcc4a11.png"
              alt="Harvest Intercontinental American University Seal"
              className="w-11 h-11 object-contain bg-white rounded-full p-0.5 border-2 border-[#C39A53]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-collegiate font-black text-white tracking-tight uppercase">
                  HARVEST INTERCONTINENTAL AMERICAN UNIVERSITY ERP
                </h2>
                <span className="bg-[#2A082C] text-[#C39A53] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#C39A53]/40">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-purple-200">
                {currentUser.name} • <span className="text-[#C39A53] font-semibold">{currentUser.title}</span>
              </p>
            </div>
          </div>

          {/* Right Main Bar Actions: Real-Time Notifications Popover */}
          <div className="flex items-center gap-3 shrink-0">
            <PortalNotificationsPopover
              onNavigateTab={onSelectTab}
              onOpenPrintModal={onOpenPrintModal}
            />
          </div>
        </div>

        {/* Navigation Tabs with Heritage Gold active states */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-purple-300/20 mt-3 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C39A53] text-[#2A082C] font-black shadow-md'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2A082C]' : 'text-[#C39A53]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                      isActive ? 'bg-[#2A082C] text-[#C39A53]' : 'bg-[#2A082C] text-[#C39A53] border border-[#C39A53]/40'
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
