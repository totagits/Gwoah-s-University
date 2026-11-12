import React,{useState} from 'react';
import {
  ArrowLeft, GraduationCap, LogOut, Moon, Settings, Sun, Search, SlidersHorizontal
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
  const [mobileSearchOpen,setMobileSearchOpen]=useState(false);
  const [mobileSettingsOpen,setMobileSettingsOpen]=useState(false);

  return (
    <header className="relative z-30 border-b border-[#e8e0ec] bg-white text-[#35103b]">
      <div className="border-b border-[#eee8ee] bg-[#faf8fb]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2 sm:flex-wrap sm:px-8 lg:px-10">
          <button type="button" onClick={onBackToPublic}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-[#4a1249] hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true"/> Public university website
          </button>
          <div className="flex w-full items-center justify-end gap-1 text-xs text-slate-600 sm:w-auto sm:flex-wrap sm:gap-3">
            <span className="mr-auto rounded-full border border-[#e6dce7] bg-white px-2 py-1 text-[11px] font-semibold text-[#4a1249] sm:mr-0 sm:px-2.5 sm:text-xs">Staging</span>
            <span className="hidden sm:inline">Signed in as {currentUser.name}</span>
            <span className="hidden sm:inline-flex">{installedAppKind&&<PwaInstallControl kind={installedAppKind} compact/>}</span>
            {!installedAppKind&&<a href={currentUser.role==='student'?'/student/':'/staff/'}
              className="hidden rounded border border-[#4A1249] bg-white px-3 py-2 text-xs font-semibold text-[#4A1249] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249] sm:inline-flex">
              {currentUser.role==='student'?'Install Student App':'Install Staff ERP'}
            </a>}
            {currentUser.role==='super_admin'&&window.location.hostname==='hiau-staging.totag.network'&&<span className="hidden sm:inline-flex"><StagingStudentInvite/></span>}
            <button type="button" onClick={onToggleTheme} aria-label="Toggle display theme"
              className="hidden items-center gap-1.5 rounded-md p-2 text-[#35103b] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] sm:inline-flex">
              {currentTheme === 'dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
              <span className="hidden md:inline">{currentTheme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
            <button type="button" onClick={onOpenThemeSettings} aria-label="Display and accessibility settings"
              className="hidden rounded-md p-2 text-[#35103b] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] sm:inline-flex"><Settings className="h-4 w-4"/></button>
            <button type="button" onClick={()=>setMobileSearchOpen(v=>!v)} aria-label="Search university" aria-expanded={mobileSearchOpen}
              className="rounded-md p-2 text-[#35103b] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] sm:hidden"><Search className="h-5 w-5"/></button>
            <button type="button" onClick={()=>setMobileSettingsOpen(v=>!v)} aria-label="Mobile display and language options" aria-expanded={mobileSettingsOpen}
              className="rounded-md p-2 text-[#35103b] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249] sm:hidden"><SlidersHorizontal className="h-5 w-5"/></button>
            <button type="button" onClick={onLogout} aria-label="Sign out"
              className="inline-flex items-center gap-1.5 rounded-md p-2 text-[#4a1249] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">
              <LogOut className="h-4 w-4"/> <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-3 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 sm:gap-4 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 bg-[#4a1249] text-white hiau-dashboard-icon">
              <GraduationCap className="h-6 w-6" aria-hidden="true"/>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#765622] sm:text-[11px] sm:tracking-[0.14em]">HIAU · University Operations</p>
              <p className="truncate text-sm font-semibold text-[#35103b] sm:text-lg">Harvest Intercontinental American University</p>
            </div>
          </div>
          <div className="hidden min-w-0 flex-1 basis-full sm:block lg:basis-[360px] lg:max-w-[565px]">
            <div className="campus-header-tools flex items-center gap-3" aria-label="Search, notifications and language">
              <GlobalSearch navigate={onSelectTab}/>
              <PortalNotificationsPopover/>
              <LanguagePicker/>
            </div>
          </div>
        </div>

        {mobileSearchOpen&&<div className="border-t border-purple-100 py-3 sm:hidden"><GlobalSearch navigate={(id:string)=>{onSelectTab(id);setMobileSearchOpen(false);}}/></div>}
        {mobileSettingsOpen&&<div className="flex flex-wrap items-center gap-3 border-t border-purple-100 py-3 sm:hidden">
          <LanguagePicker/>
          <button type="button" onClick={onToggleTheme} className="rounded border border-[#4a1249] bg-white px-3 py-2 text-sm font-semibold text-[#4a1249] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">Toggle theme</button>
          <button type="button" onClick={onOpenThemeSettings} className="rounded border border-[#4a1249] bg-white px-3 py-2 text-sm font-semibold text-[#4a1249] hover:bg-[#f1eaf2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">Accessibility settings</button>
          {installedAppKind&&<PwaInstallControl kind={installedAppKind}/>}
        </div>}
      </div>
    </header>
  );
};
