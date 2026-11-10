import React, { useState, useEffect } from 'react';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicHero } from './components/public/PublicHero';
import { PublicAbout } from './components/public/PublicAbout';
import { PublicVirtualTour } from './components/public/PublicVirtualTour';
import { PublicColleges } from './components/public/PublicColleges';
import { PublicAdmissions } from './components/public/PublicAdmissions';
import { PublicCalendar } from './components/public/PublicCalendar';
import { PublicDEI } from './components/public/PublicDEI';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicLeaderProfile } from './components/public/PublicLeaderProfile';
import { resolveLeaderProfile } from './data/leadershipData';

import { PortalHeader } from './components/portal/PortalHeader';
import { AdminPublicVideoManager } from './components/portal/AdminPublicVideoManager';
import { PortalLoginModal } from './components/portal/PortalLoginModal';
import { TaskManagementDashboard } from './components/portal/TaskManagementDashboard';
import { IntegratedAnalyticsHub } from './components/portal/IntegratedAnalyticsHub';
import { FacultyAdminDashboard } from './components/portal/FacultyAdminDashboard';
import { AcademicPlanningRegistration } from './components/portal/AcademicPlanningRegistration';
import { StudentPortalView } from './components/portal/StudentPortalView';
import { AdmissionsReviewModule } from './components/portal/AdmissionsReviewModule';
import { FinanceBursarModule } from './components/portal/FinanceBursarModule';
import { PolicyComplianceRegister } from './components/portal/PolicyComplianceRegister';
import { PrintableDocumentModal } from './components/portal/PrintableDocumentModal';
import { PortalThemeSettingsModal } from './components/portal/PortalThemeSettingsModal';
import { PortalQuickActionsMenu } from './components/portal/PortalQuickActionsMenu';
import { VirtualClassroomCollab } from './components/portal/VirtualClassroomCollab';

import { UserProfile, UserRole, StudentProfileData, StudentRegistrationItem, FinancialAccount } from './types';
import { api } from './services/api';
import { restoreMediaSession, logoutMediaSession, clearMediaCsrf } from './services/mediaAuthClient';
import { DEMO_USERS, DEMO_STUDENT, DEMO_REGISTRATIONS, DEMO_FINANCIAL_ACCOUNT } from './data/seedData';
import {
  ThemeMode,
  resolveUserTheme,
  toggleTheme,
  applyThemeToDom,
  THEME_STORAGE_KEY,
} from './utils/themeManager';

export default function App() {
  // Current view mode: 'public' or 'portal'
  const [viewMode, setViewMode] = useState<'public' | 'portal'>('public');
  const [activePublicSection, setActivePublicSection] = useState('hero');
  const [activeLeaderProfileId, setActiveLeaderProfileId] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // A full reload rechecks the signed session with the server; no localStorage tokens.
  useEffect(() => {
    let mounted = true;
    restoreMediaSession().then(session => {
      if (mounted && session.success && session.user?.role === 'super_admin') {
        setCurrentUser(session.user as UserProfile);
      }
    }).catch(() => { /* Public website remains accessible without a session. */ });
    return () => { mounted = false; };
  }, []);

  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Active ERP Tab
  const [activePortalTab, setActivePortalTab] = useState<string>('tasks');

  // Printable Document Modal State
  const [printDocType, setPrintDocType] = useState<'registration_plan' | 'transcript' | 'financial_statement' | null>(null);
  const [studentData, setStudentData] = useState<StudentProfileData>(DEMO_STUDENT);
  const [registrationsData, setRegistrationsData] = useState<StudentRegistrationItem[]>(DEMO_REGISTRATIONS);
  const [financialData, setFinancialData] = useState<FinancialAccount>(DEMO_FINANCIAL_ACCOUNT);

  // User Theme Preference State (persisted to ERP & localStorage)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedLocal = typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null;
    return resolveUserTheme(currentUser?.themePreference, savedLocal);
  });
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);

  // Apply theme to DOM on state change
  useEffect(() => {
    applyThemeToDom(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  // Sync theme when user changes (e.g. role switch)
  useEffect(() => {
    if (currentUser?.themePreference) {
      setTheme(currentUser.themePreference);
    }
  }, [currentUser]);

  const handleUpdateTheme = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyThemeToDom(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, themePreference: newTheme } : null));
      try {
        await api.updateUserTheme(currentUser.id, newTheme);
      } catch (err) {
        console.error('Failed to sync theme preference to ERP server:', err);
      }
    }
  };

  const handleToggleTheme = async () => {
    const next = toggleTheme(theme);
    await handleUpdateTheme(next);
  };


  // Auto-switch to portal or leader profile if URL params or hash are present (enabling unique, linkable page views)
  useEffect(() => {
    const handleUrlRouting = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('portal') === '1') {
        // A URL may request the sign-in screen, but may never authenticate a user.
        setViewMode('public');
        setIsLoginModalOpen(true);
        return;
      }

      // Check query params: ?leader=chancellor or ?profile=president
      const queryLeader = params.get('leader') || params.get('profile');
      if (queryLeader) {
        const found = resolveLeaderProfile(queryLeader);
        if (found) {
          setActiveLeaderProfileId(found.id);
          setViewMode('public');
          return;
        }
      }

      // Check URL hash: #leader=chancellor or #profile=...
      const hash = window.location.hash.replace(/^#/, '');
      if (hash.startsWith('leader=') || hash.startsWith('profile=')) {
        const leaderKey = hash.split('=')[1];
        if (leaderKey) {
          const found = resolveLeaderProfile(leaderKey);
          if (found) {
            setActiveLeaderProfileId(found.id);
            setViewMode('public');
            return;
          }
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);

    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  // Fetch updated student and finance data for print documents
  const refreshStudentPrintData = async () => {
    try {
      const res = await api.getStudent('u-student');
      if (res.student) setStudentData(res.student);
      if (res.registrations) setRegistrationsData(res.registrations);
      if (res.financialAccount) setFinancialData(res.financialAccount);
    } catch (err) {
      console.error('Failed to load student print data:', err);
    }
  };

  const [pendingPortalTab, setPendingPortalTab] = useState<string | null>(null);
  const [studentSubTab, setStudentSubTab] = useState<'grades' | 'materials' | 'calendar' | 'library' | 'messages' | 'facilities' | 'classroom'>('grades');

  const handleSelectTabWithSubAction = (tabId: string, subAction?: string) => {
    setActivePortalTab(tabId);
    if (tabId === 'student_portal' && subAction) {
      if (['grades', 'materials', 'calendar', 'library', 'messages', 'facilities', 'classroom'].includes(subAction)) {
        setStudentSubTab(subAction as any);
      }
    }
  };

  const handleOpenPortal = (preferredTab?: string) => {
    if (preferredTab === 'facilities' || preferredTab === 'library' || preferredTab === 'classroom') {
      setActivePortalTab('student_portal');
      setStudentSubTab(preferredTab);
      setPendingPortalTab('student_portal');
    } else if (preferredTab) {
      setActivePortalTab(preferredTab);
      setPendingPortalTab(preferredTab);
    }
    if (currentUser) {
      setViewMode('portal');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserProfile, _token: string) => {
    if (user.role !== 'super_admin') return;
    setActivePortalTab('tasks');
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    setViewMode('portal');
    if (pendingPortalTab) {
      setActivePortalTab(pendingPortalTab);
      setPendingPortalTab(null);
    }
  };

  const handleSwitchRole = (_role: UserRole) => {
    // Role changes must be authorized by the server in a future authenticated session.
    setCurrentUser(null);
    setViewMode('public');
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    // Clear the privileged client view immediately, then revoke the server session.
    setCurrentUser(null);
    setViewMode('public');
    void logoutMediaSession().catch(() => clearMediaCsrf());
  };

  const handleOpenProfile = (profileId: string) => {
    const found = resolveLeaderProfile(profileId);
    const validId = found ? found.id : profileId;
    setActiveLeaderProfileId(validId);
    setViewMode('public');
    if (window.location.hash !== `#leader=${validId}`) {
      window.history.pushState(null, '', `#leader=${validId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseProfile = () => {
    setActiveLeaderProfileId(null);
    if (window.location.hash.startsWith('#leader=') || window.location.hash.startsWith('#profile=')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveLeaderProfileId(null);
    setActivePublicSection(sectionId);
    setViewMode('public');
    if (window.location.hash.startsWith('#leader=') || window.location.hash.startsWith('#profile=')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenPrintModal = async (docType: 'registration_plan' | 'transcript' | 'financial_statement') => {
    await refreshStudentPrintData();
    setPrintDocType(docType);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FB] text-[#2E0F34] font-sans selection:bg-[#C39A53]/30 selection:text-[#4A1249]">
      {/* RENDER PUBLIC WEBSITE VIEW */}
      {viewMode === 'public' && (
        <div className="flex flex-col min-h-screen bg-[#FAF8FB]">
          <PublicNavbar
            onOpenPortal={handleOpenPortal}
            currentUser={currentUser}
            onNavigateSection={handleNavigateSection}
            activeSection={activePublicSection}
            onOpenApplicationModal={() => setIsApplicationModalOpen(true)}
            onOpenProfile={handleOpenProfile}
          />

          {activeLeaderProfileId ? (
            <PublicLeaderProfile
              profileId={activeLeaderProfileId}
              onClose={handleCloseProfile}
              onSelectProfile={handleOpenProfile}
              onNavigateSection={handleNavigateSection}
              onOpenApplicationModal={() => setIsApplicationModalOpen(true)}
            />
          ) : (
            <main className="flex-1">
              <PublicHero
                onOpenPortal={handleOpenPortal}
                onNavigateSection={handleNavigateSection}
                onOpenApplicationModal={() => setIsApplicationModalOpen(true)}
              />
              <PublicAbout onOpenProfile={handleOpenProfile} />
              <PublicVirtualTour
                onOpenApplicationModal={() => setIsApplicationModalOpen(true)}
                onOpenPortal={handleOpenPortal}
              />
              <PublicColleges />
              <PublicAdmissions
                isModalOpen={isApplicationModalOpen}
                onCloseModal={() => setIsApplicationModalOpen(false)}
                onOpenModal={() => setIsApplicationModalOpen(true)}
              />
              <PublicCalendar />
              <PublicDEI />
            </main>
          )}

          <PublicFooter
            onOpenPortal={handleOpenPortal}
            onNavigateSection={handleNavigateSection}
            onOpenProfile={handleOpenProfile}
          />
        </div>
      )}

      {/* Only website media management is enabled in this security phase.
          The separate university ERP modules remain disabled until RBAC acceptance. */}
      {viewMode === 'portal' && currentUser?.role === 'super_admin' && (
        <div className="min-h-screen bg-[#FAF8FB]">
          <header className="bg-[#4A1249] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-bold text-lg">HIAU Website Media Administration</h1>
              <p className="text-xs text-purple-100">Public videos and publishing only</p>
            </div>
            <div className="flex gap-3">
              <button className="border border-[#C39A53] rounded px-3 py-2" onClick={() => setViewMode('public')}>
                View public website
              </button>
              <button className="bg-[#C39A53] text-[#2A082C] font-semibold rounded px-3 py-2" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminPublicVideoManager />
          </main>
        </div>
      )}

      {/* LOGIN MODAL */}
      <PortalLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* PRINTABLE OFFICIAL DOCUMENT MODAL */}
      {printDocType && (
        <PrintableDocumentModal
          isOpen={true}
          onClose={() => setPrintDocType(null)}
          documentType={printDocType}
          student={studentData}
          registrations={registrationsData}
          financialAccount={financialData}
        />
      )}

      {/* PORTAL ACCESSIBILITY & THEME SETTINGS MODAL */}
      {currentUser && (
        <PortalThemeSettingsModal
          isOpen={isThemeSettingsOpen}
          onClose={() => setIsThemeSettingsOpen(false)}
          currentUser={currentUser}
          currentTheme={theme}
          onThemeChange={handleUpdateTheme}
        />
      )}
    </div>
  );
}
