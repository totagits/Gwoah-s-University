import React, { useState, useEffect } from 'react';
import { setSessionCsrf } from './services/session';
import { useLocalization } from './i18n/Localization';
import { AccountCenter, HistoricalPrediction } from './components/portal/AccountCenter';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicHero } from './components/public/PublicHero';
import { PublicAbout } from './components/public/PublicAbout';
import { PublicColleges } from './components/public/PublicColleges';
import { PublicAdmissions } from './components/public/PublicAdmissions';
import { PublicCalendar } from './components/public/PublicCalendar';
import { PublicDEI } from './components/public/PublicDEI';
import { PublicFooter } from './components/public/PublicFooter';

import { PortalHeader } from './components/portal/PortalHeader';
import { CampusProvider } from './components/portal/CampusContext';
import { StudentServices, AlumniPortalView, CourseDependencyMapper } from './components/portal/CampusServices';
import { LibraryTools, LearningStudio } from './components/portal/LearningStudio';
import { FacultyTools, InstitutionalControls, SuccessPredictor, TuitionReminders, Proctoring, NcheComplianceMonitor } from './components/portal/InstitutionalTools';
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

import { UserProfile, UserRole, StudentProfileData, StudentRegistrationItem, FinancialAccount } from './types';
import { api } from './services/api';
import { DEMO_USERS, DEMO_STUDENT, DEMO_REGISTRATIONS, DEMO_FINANCIAL_ACCOUNT } from './data/seedData';
import {
  ThemeMode,
  resolveUserTheme,
  toggleTheme,
  applyThemeToDom,
  THEME_STORAGE_KEY,
} from './utils/themeManager';

export default function App() {
  useLocalization();
  // Current view mode: 'public' or 'portal'
  const [viewMode, setViewMode] = useState<'public' | 'portal'>('public');
  const [activePublicSection, setActivePublicSection] = useState('hero');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Active ERP Tab
  const [activePortalTab, setActivePortalTab] = useState<string>('campus');

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


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch('/api/auth/me').then(async response => {
      if (response.ok) { const session = await response.json();setSessionCsrf(session.csrf);setCurrentUser(session.user);setActivePortalTab(session.user.role==='alumni'?'alumni':session.user.role==='bursar'?'finance':session.user.role==='admissions_officer'?'admissions':['lecturer','dean'].includes(session.user.role)?'faculty_admin':'campus'); if(params.has('portal'))setViewMode('portal'); }
      else if(params.has('portal')||params.has('activate'))setIsLoginModalOpen(true);
    }).catch(() => {if(params.has('portal')||params.has('activate'))setIsLoginModalOpen(true);});
    const expired=()=>{setSessionCsrf('');setCurrentUser(null);setViewMode('public');setIsLoginModalOpen(true);};
    window.addEventListener('gu:session-expired',expired);return()=>window.removeEventListener('gu:session-expired',expired);
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

  const handleOpenPortal = () => {
    if (currentUser) {
      setViewMode('portal');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserProfile, _token: string) => {
    setCurrentUser(user);
    setActivePortalTab(user.role==='alumni'?'alumni':user.role==='bursar'?'finance':user.role==='admissions_officer'?'admissions':['lecturer','dean'].includes(user.role)?'faculty_admin':'campus');
    setIsLoginModalOpen(false);
    setViewMode('portal');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionCsrf('');
    setCurrentUser(null);
    setViewMode('public');
  };

  const handleNavigateSection = (sectionId: string) => {
    setActivePublicSection(sectionId);
    setViewMode('public');
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPrintModal = async (docType: 'registration_plan' | 'transcript' | 'financial_statement') => {
    await refreshStudentPrintData();
    setPrintDocType(docType);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* RENDER PUBLIC WEBSITE VIEW */}
      {viewMode === 'public' && (
        <div className="flex flex-col min-h-screen">
          <PublicNavbar
            onOpenPortal={handleOpenPortal}
            currentUser={currentUser}
            onNavigateSection={handleNavigateSection}
            activeSection={activePublicSection}
          />

          <main className="flex-1">
            <PublicHero
              onOpenPortal={handleOpenPortal}
              onNavigateSection={handleNavigateSection}
              onOpenApplicationModal={() => setIsApplicationModalOpen(true)}
            />
            <PublicAbout />
            <PublicColleges />
            <PublicAdmissions
              isModalOpen={isApplicationModalOpen}
              onCloseModal={() => setIsApplicationModalOpen(false)}
              onOpenModal={() => setIsApplicationModalOpen(true)}
            />
            <PublicCalendar />
            <PublicDEI />
          </main>

          <PublicFooter
            onOpenPortal={handleOpenPortal}
            onNavigateSection={handleNavigateSection}
          />
        </div>
      )}

      {/* RENDER PROTECTED ERP SUBSYSTEM VIEW */}
      {viewMode === 'portal' && currentUser && (
        <CampusProvider user={currentUser.id}>
        <div className="flex flex-col min-h-screen bg-slate-950">
          <PortalHeader
            currentUser={currentUser}
            activeTab={activePortalTab}
            onSelectTab={setActivePortalTab}

            onLogout={handleLogout}
            onBackToPublic={() => setViewMode('public')}
            currentTheme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
          />

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="campus-staging"><span>STAGING</span> Authenticated staging environment. Use fictional data during evaluation.</div>
            {activePortalTab === 'account' && <AccountCenter user={currentUser} />}
            {activePortalTab === 'campus' && <StudentServices />}
            {activePortalTab === 'alumni' && <AlumniPortalView />}
            {activePortalTab === 'faculty_tools' && <FacultyTools />}
            {activePortalTab === 'library_tools' && <LibraryTools faculty={['super_admin','registrar','dean','lecturer'].includes(currentUser.role)} />}
            {activePortalTab === 'studio' && <><LearningStudio faculty={['super_admin','registrar','dean','lecturer'].includes(currentUser.role)} /><Proctoring faculty={['super_admin','registrar','dean','lecturer'].includes(currentUser.role)} /></>}
            {activePortalTab === 'institution' && <InstitutionalControls />}
            {activePortalTab === 'tasks' && (
              <TaskManagementDashboard currentUser={currentUser} />
            )}

            {activePortalTab === 'analytics' && (
              <><HistoricalPrediction />
              <IntegratedAnalyticsHub />
              </>
            )}

            {activePortalTab === 'faculty_admin' && (
              <><FacultyTools />
              <FacultyAdminDashboard currentUser={currentUser} />
              </>
            )}

            {activePortalTab === 'academics' && (
              <><CourseDependencyMapper />
              <AcademicPlanningRegistration
                currentUser={currentUser}
                onOpenPrintModal={handleOpenPrintModal}
              />
              </>
            )}

            {activePortalTab === 'student_portal' && (
              <><StudentServices />
              <StudentPortalView
                currentUser={currentUser}
                onOpenPrintModal={handleOpenPrintModal}
              />
              </>
            )}

            {activePortalTab === 'admissions' && (
              <AdmissionsReviewModule currentUser={currentUser} />
            )}

            {activePortalTab === 'finance' && (
              <><TuitionReminders />
              <FinanceBursarModule currentUser={currentUser} />
              </>
            )}

            {activePortalTab === 'compliance' && (
              <><NcheComplianceMonitor />
              <PolicyComplianceRegister currentUser={currentUser} />
              </>
            )}
          </main>

          <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
            Gwoah’s University · Republic of Liberia · Staging evaluation environment
          </footer>
        </div>
        </CampusProvider>
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
