import React from 'react';
import {
  ArrowLeft, BarChart3, BookOpen, ChevronDown, CreditCard, GraduationCap,
  Inbox, ListTodo, LogOut, Moon, Settings, ShieldCheck, Sun, User, Users
} from 'lucide-react';
import type { UserProfile } from '../../types';
import type { ThemeMode } from '../../utils/themeManager';
import { portalModulesForRole, type PortalModuleId } from '../../portal/moduleRegistry';
import { LanguagePicker, useLocalization } from '../../i18n/Localization';
import { GlobalSearch } from './CampusServices';
import { PortalNotificationsPopover } from './PortalNotificationsPopover';

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

const icons: Record<PortalModuleId, React.ElementType> = {
  tasks: ListTodo, analytics: BarChart3, faculty_admin: Users,
  academics: BookOpen, curriculum: BookOpen, admissions: Inbox, finance: CreditCard,
  compliance: ShieldCheck, student_portal: User, classroom: GraduationCap,
  website_media: Settings,
};

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentUser, activeTab, onSelectTab, onLogout, onBackToPublic,
  currentTheme, onToggleTheme, onOpenThemeSettings,
}) => {
  const { t } = useLocalization();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const modules = portalModulesForRole(currentUser.role);
  const primary = modules.filter(m => m.group === 'primary');
  const secondary = modules.filter(m => m.group === 'secondary');
  const label = (moduleId: string) => modules.find(m => m.id === moduleId)?.label ?? 'University workspace';

  return (
    <header className="relative z-30 border-b border-[#e8e0ec] bg-white text-[#35103b]">
      <div className="border-b border-[#eee8ee] bg-[#faf8fb]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2 sm:px-8 lg:px-10">
          <button type="button" onClick={onBackToPublic}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#4a1249] hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true"/> Public university website
          </button>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="rounded-full border border-[#e6dce7] bg-white px-2.5 py-1 font-semibold text-[#4a1249]">Staging</span>
            <span className="hidden sm:inline">Signed in as {currentUser.name}</span>
            <button type="button" onClick={onToggleTheme} aria-label="Toggle display theme"
              className="inline-flex items-center gap-1.5 rounded-md p-2 hover:bg-[#f1eaf2]">
              {currentTheme === 'dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
              <span className="hidden md:inline">{currentTheme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
            <button type="button" onClick={onOpenThemeSettings} aria-label="Display and accessibility settings"
              className="rounded-md p-2 hover:bg-[#f1eaf2]"><Settings className="h-4 w-4"/></button>
            <button type="button" onClick={onLogout} aria-label="Sign out"
              className="inline-flex items-center gap-1.5 rounded-md p-2 text-[#4a1249] hover:bg-[#f1eaf2]">
              <LogOut className="h-4 w-4"/> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4a1249] text-white hiau-dashboard-icon">
              <GraduationCap className="h-6 w-6" aria-hidden="true"/>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#967d52]">HIAU · University Operations</p>
              <p className="truncate text-base font-semibold text-[#35103b] sm:text-lg">Harvest Intercontinental American University</p>
            </div>
          </div>
          <div className="min-w-0 flex-1 basis-full lg:basis-[360px] lg:max-w-[565px]">
            <div className="campus-header-tools flex items-center gap-3" aria-label="Search, notifications and language">
              <GlobalSearch navigate={onSelectTab}/>
              <PortalNotificationsPopover/>
              <LanguagePicker/>
            </div>
          </div>
        </div>

        <nav aria-label="ERP workspace navigation" className="flex items-center gap-2 border-t border-[#eee8ee] py-2">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain whitespace-nowrap pb-1">
            {primary.map(module => {
              const Icon = icons[module.id];
              const selected = activeTab === module.id;
              return (
                <button key={module.id} type="button"
                  onClick={() => { setMoreOpen(false); onSelectTab(module.id); }}
                  aria-current={selected ? 'page' : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] ${selected ? 'bg-[#4a1249] text-white hiau-dashboard-selected' : 'text-slate-650 hover:bg-[#f4edf4] hover:text-[#4a1249]'}`}>
                  <Icon className="h-4 w-4" aria-hidden="true"/> {t(label(module.id))}
                </button>
              );
            })}
          </div>
          {secondary.length > 0 && (
            <div className="relative shrink-0">
              <button type="button" onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6dce7] bg-white px-3 py-2 text-sm font-medium text-[#4a1249]">
                More <ChevronDown className="h-4 w-4" aria-hidden="true"/>
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[210px] rounded-xl border border-[#e6dce7] bg-white p-2 shadow-xl">
                  {secondary.map(module => {
                    const Icon = icons[module.id];
                    return <button key={module.id} type="button" onClick={() => { onSelectTab(module.id); setMoreOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#35103b] hover:bg-[#f4edf4]">
                      <Icon className="h-4 w-4" aria-hidden="true"/>{t(module.label)}
                    </button>;
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
