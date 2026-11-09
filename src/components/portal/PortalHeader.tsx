import React from 'react';
import { LanguagePicker, useLocalization } from '../../i18n/Localization';
import { portalModulesForRole, type PortalModuleId } from '../../portal/moduleRegistry';
import { GlobalSearch, NotificationCenter } from './CampusServices';
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

  onLogout,
  onBackToPublic,
  currentTheme,
  onToggleTheme,
  onOpenThemeSettings,
}) => {
  const {t}=useLocalization();
  const tabIcons: Record<PortalModuleId, React.ElementType> = {
    tasks: ListTodo,
    analytics: BarChart3,
    faculty_admin: Users,
    academics: BookOpen,
    admissions: Inbox,
    finance: CreditCard,
    compliance: ShieldCheck,
    student_portal: User,
    classroom: GraduationCap,
  };
  const availableModules = portalModulesForRole(currentUser.role);
  const primaryModules = availableModules.filter(module => module.group === 'primary');
  const otherModules = availableModules.filter(module => module.group === 'secondary');
  const [moreOpen, setMoreOpen] = React.useState(false);

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
              HIAU Operations · Protected staging environment
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              <Wifi className="w-3 h-3" />
              <span>Staging workspace</span>
            </span>

            <span className="text-xs font-semibold">Signed in · {currentUser.role.replaceAll('_',' ')}</span>
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
                  Harvest Intercontinental American University ERP
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

        <div className="campus-header-tools mt-3" aria-label="Search, notifications and language"><GlobalSearch navigate={onSelectTab}/><NotificationCenter/><LanguagePicker/></div>

        {/* Only render modules with an implemented workspace; the API enforces access. */}
        <nav aria-label="University ERP modules" className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {primaryModules.map(module => {
              const Icon = tabIcons[module.id];
              const selected = activeTab === module.id;
              return (
                <button
                  type="button"
                  key={module.id}
                  onClick={() => { setMoreOpen(false); onSelectTab(module.id); }}
                  aria-current={selected ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249] ${selected ? 'bg-[#4A1249] border-[#4A1249] text-white shadow-sm' : 'border-transparent bg-transparent text-slate-700 hover:bg-[#f5edf5] hover:text-[#4A1249]'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t(module.label)}</span>
                </button>
              );
            })}
            {otherModules.length > 0 && (
              <div className="relative">
                <button type="button" aria-expanded={moreOpen} aria-haspopup="true"
                  onClick={() => setMoreOpen(value => !value)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 hover:bg-[#f5edf5]">
                  Other workspaces <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 min-w-[230px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {otherModules.map(module => {
                      const Icon = tabIcons[module.id];
                      return (
                        <button type="button" key={module.id}
                          onClick={() => { onSelectTab(module.id); setMoreOpen(false); }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-[#f5edf5]">
                          <Icon className="h-4 w-4" aria-hidden="true" />{t(module.label)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};
