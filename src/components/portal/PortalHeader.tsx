import React from 'react';
import {
  ArrowLeft, GraduationCap, LogOut, Moon, Settings, Sun
} from 'lucide-react';
import type { UserProfile } from '../../types';
import type { ThemeMode } from '../../utils/themeManager';
import { LanguagePicker } from '../../i18n/Localization';
import { GlobalSearch } from './CampusServices';
import { PortalNotificationsPopover } from './PortalNotificationsPopover';
import {PwaInstallControl} from './PwaInstallControl';
import {StagingStudentInvite} from './StagingStudentInvite';

interface PortalHeaderProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onLogout: () => void;
  onBackToPublic: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  onOpenThemeSettings: () => void;
  installedAppKind?: 'student'|'staff'|null;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentUser, activeTab, onSelectTab, onLogout, onBackToPublic,
  currentTheme, onToggleTheme, onOpenThemeSettings,installedAppKind,
}) => {

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
            {installedAppKind&&<PwaInstallControl kind={installedAppKind} compact/>}
            {currentUser.role==='super_admin'&&window.location.hostname==='hiau-staging.totag.network'&&<StagingStudentInvite/>}
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


      </div>
    </header>
  );
};
