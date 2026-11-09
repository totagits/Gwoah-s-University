import React, { useState, useEffect } from 'react';
import { setSessionCsrf } from './services/session';
import { defaultPortalModule, isPortalModuleAvailable, PORTAL_MODULES } from './portal/moduleRegistry';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicHero } from './components/public/PublicHero';
import { PublicAbout } from './components/public/PublicAbout';
import { PublicVirtualTour } from './components/public/PublicVirtualTour';
import { PublicColleges, resolvePublicDegree } from './components/public/PublicColleges';
import { PublicDegreeDetail } from './components/public/PublicDegreeDetail';
import { PublicAdmissions } from './components/public/PublicAdmissions';
import { PublicCalendar } from './components/public/PublicCalendar';
import { PublicDEI } from './components/public/PublicDEI';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicLeaderProfile } from './components/public/PublicLeaderProfile';
import { resolveLeaderProfile } from './data/leadershipData';

import { PortalHeader } from './components/portal/PortalHeader';
import { PortalLoginModal } from './components/portal/PortalLoginModal';
import { TaskManagementDashboard } from './components/portal/TaskManagementDashboard';
import { IntegratedAnalyticsHub } from './components/portal/IntegratedAnalyticsHub';
import { FacultyAdminDashboard } from './components/portal/FacultyAdminDashboard';
import { AcademicPlanningRegistration } from './components/portal/AcademicPlanningRegistration';
import { CurriculumStudio } from './components/portal/CurriculumStudio';
import { SecureStudentWorkspace } from './components/portal/SecureStudentWorkspace';
import { AdmissionsReviewModule } from './components/portal/AdmissionsReviewModule';
import { FinanceBursarModule } from './components/portal/FinanceBursarModule';
import { PolicyComplianceRegister } from './components/portal/PolicyComplianceRegister';
import { PrintableDocumentModal } from './components/portal/PrintableDocumentModal';
import { PortalThemeSettingsModal } from './components/portal/PortalThemeSettingsModal';
import { PortalQuickActionsMenu } from './components/portal/PortalQuickActionsMenu';
import { VirtualClassroomCollab } from './components/portal/VirtualClassroomCollab';

import { UserProfile, StudentProfileData, StudentRegistrationItem, FinancialAccount } from './types';
import { api } from './services/api';
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
  const [activeDegreeRoute, setActiveDegreeRoute] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Active ERP Tab
  const [activePortalTab, setActivePortalTab] = useState<string>('tasks');

  // Printable Document Modal State
  const [printDocType, setPrintDocType] = useState<'registration_plan' | 'transcript' | 'financial_statement' | null>(null);
  const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
  const [registrationsData, setRegistrationsData] = useState<StudentRegistrationItem[]>([]);
  const [financialData, setFinancialData] = useState<FinancialAccount | null>(null);
  const [printUnavailable, setPrintUnavailable] = useState<string | null>(null);

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
      // URL parameters never grant privileges.
      if (params.has('portal') || params.has('activate')) setIsLoginModalOpen(true);

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
      if (hash.startsWith('degree=')) {
        const route=decodeURIComponent(hash.slice('degree='.length));
        if (resolvePublicDegree(route)) {
          setActiveDegreeRoute(route);
          setActiveLeaderProfileId(null);
          setViewMode('public');
          window.scrollTo({top:0,behavior:'instant'});
          return;
        }
      }
      setActiveDegreeRoute(null);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let active = true;
    fetch('/api/auth/me', { credentials: 'same-origin' }).then(async response => {
      if (!response.ok) throw new Error('No active session');
      const session = await response.json();
      if (!active) return;
      setSessionCsrf(session.csrf);
      setCurrentUser(session.user);
      setActivePortalTab(defaultPortalModule(session.user.role) ?? 'tasks');
      if (params.has('portal')) setViewMode('portal');
    }).catch(() => {
      if (active && (params.has('portal') || params.has('activate'))) setIsLoginModalOpen(true);
    });
    const expire = () => { setSessionCsrf(''); setCurrentUser(null); setViewMode('public'); setIsLoginModalOpen(true); };
    window.addEventListener('gu:session-expired', expire);
    return () => { active = false; window.removeEventListener('gu:session-expired', expire); };
  }, []);

  // Fetch updated student and finance data for print documents
  const refreshStudentPrintData = async (): Promise<boolean> => {
    setStudentData(null);
    setRegistrationsData([]);
    setFinancialData(null);
    if (!currentUser || currentUser.role !== 'student') return false;
    try {
      const res = await api.getStudent(currentUser.id);
      if (!res.student || !res.financialAccount) return false;
      setStudentData(res.student);
      setRegistrationsData(res.registrations ?? []);
      setFinancialData(res.financialAccount);
      return true;
    } catch (err) {
      console.error('Unable to retrieve verified student print data:', err);
      return false;
    }
  };

  const [pendingPortalTab, setPendingPortalTab] = useState<string | null>(null);
  const [studentSubTab, setStudentSubTab] = useState<'grades' | 'materials' | 'calendar' | 'library' | 'messages' | 'facilities' | 'classroom'>('grades');

  const handleSelectTabWithSubAction = (tabId: string, subAction?: string) => {
    if (!currentUser || !isPortalModuleAvailable(currentUser.role, tabId)) return;
    setActivePortalTab(tabId);
    if (tabId === 'student_portal' && subAction) {
      if (['grades', 'materials', 'calendar', 'library', 'messages', 'facilities', 'classroom'].includes(subAction)) {
        setStudentSubTab(subAction as any);
      }
    }
  };

  const handleOpenPortal = (preferredTab?: string) => {
    // Links on the public site cannot choose a role or silently enter an unrelated workspace.
    if (currentUser) {
      const safeTab = preferredTab && isPortalModuleAvailable(currentUser.role, preferredTab)
        ? preferredTab
        : defaultPortalModule(currentUser.role);
      if (safeTab) setActivePortalTab(safeTab);
      setViewMode('portal');
    } else {
      // Defer any requested tab until after server authentication and role verification.
      setPendingPortalTab(preferredTab && PORTAL_MODULES.some(m => m.id === preferredTab) ? preferredTab : null);
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserProfile, _token: string) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    setViewMode('portal');
    const safeTab = pendingPortalTab && isPortalModuleAvailable(user.role, pendingPortalTab)
      ? pendingPortalTab
      : defaultPortalModule(user.role);
    if (safeTab) setActivePortalTab(safeTab);
    setPendingPortalTab(null);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    setSessionCsrf('');
    setCurrentUser(null);
    setViewMode('public');
  };

  const handleOpenProfile = (profileId: string) => {
    const found = resolveLeaderProfile(profileId);
    const validId = found ? found.id : profileId;
    setActiveLeaderProfileId(validId);
    setActiveDegreeRoute(null);
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
    setActiveDegreeRoute(null);
    setActivePublicSection(sectionId);
    setViewMode('public');
    if (window.location.hash.startsWith('#leader=') || window.location.hash.startsWith('#profile=') || window.location.hash.startsWith('#degree=')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    // When leaving a standalone degree page the directory is mounted on the next render.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  };

  const handleOpenPrintModal = async (docType: 'registration_plan' | 'transcript' | 'financial_statement') => {
    setPrintUnavailable(null);
    if (await refreshStudentPrintData()) {
      setPrintDocType(docType);
    } else {
      setPrintUnavailable('This document requires a verified student record linked to your account. No sample record will be printed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FB] text-[#2E0F34] font-sans selection:bg-[#C39A53]/30 selection:text-[#4A1249]">
      {/* RENDER PUBLIC WEBSITE VIEW */}
      {viewMode === 'public' && (
        <div className="hiau-public-site flex flex-col min-h-screen bg-[#FAF8FB]">
          <PublicNavbar
            onOpenPortal={handleOpenPortal}
            currentUser={currentUser}
            onNavigateSection={handleNavigateSection}
            activeSection={activePublicSection}
            onOpenApplicationModal={() => setIsApplicationModalOpen(true)}
            onOpenProfile={handleOpenProfile}
          />

          {activeDegreeRoute ? (
            <PublicDegreeDetail route={activeDegreeRoute}
              onBack={() => {
                setActiveDegreeRoute(null);
                setActivePublicSection('colleges');
                window.history.pushState(null, '', '#hiau-college-directory');
                window.requestAnimationFrame(() => window.requestAnimationFrame(() =>
                  document.getElementById('hiau-college-directory')?.scrollIntoView({behavior:'smooth'})
                ));
              }}
              onNavigateSection={handleNavigateSection}
            />
          ) : activeLeaderProfileId ? (
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

      {/* RENDER PROTECTED ERP SUBSYSTEM VIEW */}
      {viewMode === 'portal' && currentUser && (
        <div className="hiau-erp-site flex flex-col min-h-screen bg-[#FAF8FB]">
          <PortalHeader
            currentUser={currentUser}
            activeTab={activePortalTab}
            onSelectTab={handleSelectTabWithSubAction}
            onLogout={handleLogout}
            onBackToPublic={() => setViewMode('public')}
            currentTheme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
          />

          <main id="erp-main-content" className="flex-1 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-10 py-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#e6dce7] pb-4"><div>
              <p className="uppercase tracking-[0.18em] text-[11px] font-bold text-[#866080]">University operations / {currentUser.role.replaceAll('_', ' ')}</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#35103B] mt-1">
                {PORTAL_MODULES.find(m => m.id === activePortalTab)?.label ?? 'Workspace access'}
              </h1>
              <p className="text-sm text-slate-600 mt-1">Authorized university records and workflows.</p>
              </div>
              <PortalQuickActionsMenu currentUser={currentUser} onNavigateTab={handleSelectTabWithSubAction} onOpenPrintModal={handleOpenPrintModal} />
            </div>
            {!isPortalModuleAvailable(currentUser.role, activePortalTab) && (
              <section role="status" className="rounded-xl bg-white border border-slate-200 p-6 text-slate-700">
                This workspace is not available to your assigned role. Contact the university administrator if you need additional access.
              </section>
            )}
            {activePortalTab === 'tasks' && (
              <TaskManagementDashboard currentUser={currentUser} />
            )}

            {activePortalTab === 'analytics' && (
              <IntegratedAnalyticsHub />
            )}

            {activePortalTab === 'faculty_admin' && (
              <FacultyAdminDashboard currentUser={currentUser} />
            )}

            {activePortalTab === 'academics' && (
              <AcademicPlanningRegistration
                currentUser={currentUser}
                onOpenPrintModal={handleOpenPrintModal}
              />
            )}

            {activePortalTab === 'curriculum' && (
              <CurriculumStudio currentUser={currentUser} />
            )}

            {activePortalTab === 'student_portal' && (
              <SecureStudentWorkspace currentUser={currentUser} />
            )}

            {activePortalTab === 'classroom' && (
              <VirtualClassroomCollab currentUser={currentUser} />
            )}

            {activePortalTab === 'admissions' && (
              <AdmissionsReviewModule currentUser={currentUser} />
            )}

            {activePortalTab === 'finance' && (
              <FinanceBursarModule currentUser={currentUser} />
            )}

            {activePortalTab === 'compliance' && (
              <PolicyComplianceRegister currentUser={currentUser} />
            )}
          </main>


          <footer className="bg-[#4A1249] text-purple-100 border-t border-[#C39A53]/40 py-5 text-center text-xs">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[#C39A53] font-semibold">Harvest Intercontinental American University ERP Subsystem • Republic of Liberia</span>
              <span className="text-purple-200">Staging evaluation · Accreditation details subject to official verification</span>
              <span className="text-amber-200 font-mono text-[11px]">Secure login required · Test data only</span>
            </div>
          </footer>
        </div>
      )}

      {/* LOGIN MODAL */}
      <PortalLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Never fabricate official academic/financial documents from demo records. */}
      {printUnavailable && (
        <div role="alert" className="fixed bottom-5 left-1/2 z-[80] w-[min(92vw,34rem)] -translate-x-1/2 rounded-xl border border-amber-300 bg-white p-4 shadow-xl">
          <p className="text-sm text-slate-800">{printUnavailable}</p>
          <button className="mt-3 text-sm font-semibold text-[#4A1249] underline" onClick={() => setPrintUnavailable(null)}>Dismiss</button>
        </div>
      )}
      {/* PRINTABLE OFFICIAL DOCUMENT MODAL */}
      {printDocType && studentData && financialData && (
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
