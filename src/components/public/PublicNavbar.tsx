import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Lock,
  Layers,
  ArrowRight,
  Building,
  Users,
  Compass,
  Search,
  BookOpen,
  Calendar,
  X,
  GraduationCap,
  FileText,
  Clock,
  Download,
  ShieldCheck,
  Laptop,
  CheckCircle,
  Wrench,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface PublicNavbarProps {
  onOpenPortal: (tab?: string) => void;
  currentUser: UserProfile | null;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
  onOpenApplicationModal?: () => void;
  onOpenProfile?: (profileId: string) => void;
}

interface SubmenuItem {
  label: string;
  desc: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  restricted?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onOpenPortal,
  currentUser,
  onNavigateSection,
  activeSection,
  onOpenApplicationModal,
  onOpenProfile,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menuId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Submenu configuration for all public navigation items
  const submenus: Record<string, SubmenuItem[]> = {
    about: [
      {
        label: 'Mission, Vision & Core Principles',
        desc: '"A world where no one lives or dies without access to quality education"',
        icon: <Building className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('about'),
      },
      {
        label: 'Founder & Chancellor: Bishop Dr. Darlingston G. Johnson',
        desc: 'Presiding Bishop of HIM-U & Visionary Founder of HIAU',
        icon: <Award className="w-4 h-4 text-[#4A1249]" />,
        action: () => (onOpenProfile ? onOpenProfile('chancellor') : onNavigateSection('about')),
        badge: 'Official Profile',
      },
      {
        label: 'President: Asst. Professor Mamawa M. Freeman-Moore',
        desc: 'Founding President message, philosophy of education & leadership',
        icon: <Award className="w-4 h-4 text-[#C39A53]" />,
        action: () => (onOpenProfile ? onOpenProfile('president') : onNavigateSection('about')),
        badge: 'President Page',
      },
      {
        label: 'Deputy Chancellor: Dr. Kona-Facia Freeman-Nepay',
        desc: 'Executive academic direction & 2020 task force leadership',
        icon: <Award className="w-4 h-4 text-[#C39A53]" />,
        action: () => (onOpenProfile ? onOpenProfile('deputy_chancellor') : onNavigateSection('about')),
        badge: 'Deputy Chancellor',
      },
      {
        label: 'Board of Trustees (Dr. Jonathan C. Taylor, Chair)',
        desc: 'Fiduciary governance, statutory oversight & university council',
        icon: <Users className="w-4 h-4 text-[#4A1249]" />,
        action: () => (onOpenProfile ? onOpenProfile('board_chair') : onNavigateSection('about')),
        badge: 'Board Chair',
      },
      {
        label: 'Global & National Board Head: Stanton B. Johnson',
        desc: 'International executive leadership & strategic partnerships',
        icon: <Users className="w-4 h-4 text-[#C39A53]" />,
        action: () => (onOpenProfile ? onOpenProfile('board_head') : onNavigateSection('about')),
        badge: 'Board Head',
      },
      {
        label: 'Main Academic Campus — Old Road, Chugbor',
        desc: 'Administrative headquarters, lecture halls, and lab in Monrovia',
        icon: <Building className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('about'),
      },
      {
        label: 'NCHE Licensure & Oral Roberts University Partner',
        desc: 'Chartered in Liberia with global academic collaboration in Tulsa, USA',
        icon: <ShieldCheck className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('about'),
        badge: 'Chartered',
      },
    ],
    tour: [
      {
        label: 'Campus & Classroom Continuous Video Tour',
        desc: 'Watch real campus facilities, grounds & laptop lab',
        icon: <Compass className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('tour'),
        badge: 'Video Tour',
      },
      {
        label: 'Interactive Computer Lab',
        desc: 'Dedicated student carrels, laptops & multimedia projection',
        icon: <Laptop className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('tour'),
      },
      {
        label: 'Central Library & Reading Commons',
        desc: 'Polished mahogany study tables & 2.5M+ digital catalog access',
        icon: <BookOpen className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('tour'),
      },
      {
        label: 'Campus Facilities Feedback & Repairs',
        restricted: true,
        desc: 'Submit maintenance work orders for rooms and equipment',
        icon: <Wrench className="w-4 h-4 text-[#4A1249]" />,
        action: () => onOpenPortal('facilities'),
        badge: 'ERP Live',
      },
    ],
    colleges: [
      {
        label: 'The BLEST College Framework',
        desc: 'Business, Liberal Arts, Education, Science/Tech & Theology',
        icon: <GraduationCap className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('colleges'),
        badge: 'BLEST',
      },
      {
        label: 'B — Business & Entrepreneurship',
        desc: 'Accounting & practical startup business incubation',
        icon: <Users className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('colleges'),
      },
      {
        label: 'S — Science, Technology & Allied Health',
        desc: 'B.S. in IT, Science & Tech, Nursing BSN & Lab Science',
        icon: <Laptop className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('colleges'),
        badge: 'STEM & Health',
      },
      {
        label: 'E — College of Education',
        desc: 'Early Childhood, Elementary & Secondary STEM/English',
        icon: <GraduationCap className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('colleges'),
      },
      {
        label: 'T — College of Theology & Ministry',
        desc: 'Christian Education, Christian Counseling & Global Missions',
        icon: <Award className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('colleges'),
      },
      {
        label: 'TVET Vocational Certificate Tracks',
        desc: 'Cosmetology, Catering & Pastry, Tailoring, and Carpentry',
        icon: <Sparkles className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('colleges'),
        badge: 'TVET',
      },
    ],
    admissions: [
      {
        label: 'Start Online Application',
        desc: 'Apply for Semester I 2026/2027 ($10 placement assessment fee)',
        icon: <ArrowRight className="w-4 h-4 text-[#C39A53]" />,
        action: () => {
          if (onOpenApplicationModal) onOpenApplicationModal();
          else onNavigateSection('admissions');
        },
        badge: 'Open Now',
      },
      {
        label: '5-Step Admission Requirements',
        desc: 'Application, WASSCE/WAEC transcripts, photos, exam, interview',
        icon: <CheckCircle className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('admissions'),
      },
      {
        label: 'HIAU Scholarship Committee',
        desc: 'Need-based and merit-based tuition financial aid',
        icon: <FileText className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('admissions'),
        badge: 'Aid',
      },
      {
        label: 'Admissions Officer Review Desk',
        restricted: true,
        desc: 'Evaluate applicant transcripts and manage acceptances',
        icon: <Users className="w-4 h-4 text-[#4A1249]" />,
        action: () => onOpenPortal('admissions'),
        badge: 'ERP Staff',
      },
    ],
    calendar: [
      {
        label: '2026/2027 Senate Academic Calendar',
        desc: 'Official semester registration, instruction & exam dates',
        icon: <Calendar className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('calendar'),
        badge: 'Official',
      },
      {
        label: 'Mid-Term & Final Examination Schedules',
        desc: 'Comprehensive timetables, room assignments & rules',
        icon: <Clock className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('calendar'),
      },
      {
        label: 'Export Official Calendar (.ICS)',
        desc: 'Sync directly to Apple Calendar, Google Calendar, or Outlook',
        icon: <Download className="w-4 h-4 text-[#C39A53]" />,
        action: () => {
          window.location.href = '/api/calendar/export.ics';
        },
        badge: '.ICS Sync',
      },
      {
        label: 'Commencement & Matriculation',
        desc: 'Annual convocation milestones and graduation ceremonies',
        icon: <Award className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('calendar'),
      },
    ],
    dei: [
      {
        label: 'Student Life & Spiritual Fellowship',
        desc: 'Chapel, student ministries, clubs, and sports',
        icon: <Users className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('dei'),
      },
      {
        label: 'DEI & Non-Discrimination Charter',
        desc: 'Accessible education, Section 504 / ADA accommodations',
        icon: <ShieldCheck className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('dei'),
        badge: 'Charter',
      },
      {
        label: 'Shared Resource Library (ERP)',
        restricted: true,
        desc: 'Document versioning, syllabi, study guides & past papers',
        icon: <BookOpen className="w-4 h-4 text-[#C39A53]" />,
        action: () => onOpenPortal('library'),
        badge: 'Versioned',
      },
      {
        label: 'Campus Facilities Feedback',
        restricted: true,
        desc: 'Report repair, plumbing, or classroom issues directly to staff',
        icon: <Wrench className="w-4 h-4 text-[#4A1249]" />,
        action: () => onOpenPortal('facilities'),
        badge: 'Repair Log',
      },
    ],
  };

  const navLinks = [
    { id: 'hero', label: 'Home', hasDropdown: false },
    { id: 'about', label: 'About', hasDropdown: true },
    { id: 'tour', label: 'Campus Tour', hasDropdown: true },
    { id: 'colleges', label: 'Academics', hasDropdown: true },
    { id: 'admissions', label: 'Admissions', hasDropdown: true },
    { id: 'calendar', label: 'Current Events', hasDropdown: true },
    { id: 'dei', label: 'Student Experience', hasDropdown: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-purple-200 text-[#2A082C] shadow-sm">
      {/* HIAU Primary Institutional Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Wordmark - HIAU Institutional Layout: [SEAL] [NAME] | [CAMPUS/SUBTITLE] */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
            onClick={() => onNavigateSection('hero')}
            role="button"
            tabIndex={0}
            aria-label="Harvest Intercontinental American University Homepage"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onNavigateSection('hero');
            }}
          >
            <img
              src="/assets/aistudio/image_bfcc4a11.png"
              alt="Harvest Intercontinental American University Official Seal"
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-3">
              <div className="leading-tight">
                <span className="text-xl sm:text-2xl font-collegiate font-black tracking-tight text-[#4A1249] block group-hover:text-[#661B69] transition-colors">
                  HARVEST INTERCONTINENTAL
                </span>
                <span className="text-xs sm:text-sm font-collegiate font-bold tracking-wider text-[#C39A53] block uppercase">
                  American University
                </span>
              </div>
              <div className="hidden sm:block h-8 w-[1.5px] bg-[#C39A53]/40 mx-1" />
              <div className="hidden sm:block">
                <span className="text-base font-collegiate font-bold text-[#2A082C] block">
                  Liberia
                </span>
                <span className="text-[10px] text-slate-600 font-semibold block">
                  Chartered by NCHE
                </span>
              </div>
            </div>
          </div>

          {/* Right: Search & Direct ERP Gateway Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-700 hover:text-[#4A1249] hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5 rounded-sm"
              aria-label="Toggle site search"
              title="Search university programs, admissions, and faculties"
            >
              <Search className="w-5 h-5 text-[#4A1249]" />
              <span className="hidden sm:inline text-xs font-bold text-slate-700">Search</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#4A1249] hover:bg-purple-50 rounded-sm cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#4A1249]" />
              ) : (
                <svg className="w-6 h-6 text-[#4A1249]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search Overlay Dropdown */}
        {searchOpen && (
          <div className="py-3 px-4 bg-purple-50/70 border-t border-purple-200 animate-in fade-in flex items-center gap-3">
            <Search className="w-4 h-4 text-[#4A1249] shrink-0" />
            <input
              type="text"
              placeholder="Search colleges, degrees, admissions, academic calendar, or facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-3 py-1.5 border border-purple-300 text-xs rounded-none focus:outline-none focus:border-[#4A1249] text-slate-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = searchQuery.toLowerCase();
                  if (q.includes('admiss') || q.includes('apply')) {
                    if (onOpenApplicationModal) onOpenApplicationModal();
                    else onNavigateSection('admissions');
                  } else if (q.includes('tour') || q.includes('camp') || q.includes('build')) {
                    onNavigateSection('tour');
                  } else if (q.includes('coll') || q.includes('deg') || q.includes('major')) {
                    onNavigateSection('colleges');
                  } else if (q.includes('cal') || q.includes('exam') || q.includes('date')) {
                    onNavigateSection('calendar');
                  } else if (q.includes('repair') || q.includes('facil') || q.includes('work')) {
                    onNavigateSection('dei');
                  } else {
                    onNavigateSection('about');
                  }
                  setSearchOpen(false);
                }
              }}
            />
            <button
              onClick={() => {
                const q = searchQuery.toLowerCase();
                if (q.includes('admiss') || q.includes('apply')) {
                  if (onOpenApplicationModal) onOpenApplicationModal();
                  else onNavigateSection('admissions');
                } else if (q.includes('tour') || q.includes('camp') || q.includes('build')) {
                  onNavigateSection('tour');
                } else if (q.includes('coll') || q.includes('deg') || q.includes('major')) {
                  onNavigateSection('colleges');
                } else if (q.includes('cal') || q.includes('exam') || q.includes('date')) {
                  onNavigateSection('calendar');
                } else if (q.includes('repair') || q.includes('facil') || q.includes('work')) {
                  onNavigateSection('dei');
                } else {
                  onNavigateSection('about');
                }
                setSearchOpen(false);
              }}
              className="px-4 py-1.5 bg-[#4A1249] hover:bg-[#661B69] text-white text-xs font-collegiate font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HIAU Navigation Sub-Bar with horizontal items and interactive submenus */}
        <div className="hidden lg:flex items-center justify-between border-t border-purple-100 py-2">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const hasItems = link.hasDropdown && !!submenus[link.id];
              const isCurrentOpen = activeDropdown === link.id;

              return (
                <div
                  key={link.id}
                  className="relative"
                  onMouseEnter={() => hasItems && handleMouseEnter(link.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => {
                      if (hasItems) {
                        setActiveDropdown(isCurrentOpen ? null : link.id);
                      } else {
                        onNavigateSection(link.id);
                        setActiveDropdown(null);
                      }
                    }}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer py-1.5 px-1 border-b-2 ${
                      activeSection === link.id
                        ? 'text-[#4A1249] font-black border-[#4A1249]'
                        : isCurrentOpen
                        ? 'text-[#4A1249] border-[#C39A53]'
                        : 'text-slate-700 hover:text-[#4A1249] border-transparent'
                    }`}
                    aria-expanded={isCurrentOpen}
                    aria-haspopup={hasItems}
                  >
                    <span>{link.label}</span>
                    {hasItems && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                          isCurrentOpen ? 'rotate-180 text-[#4A1249]' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Rich Desktop Submenu Dropdown */}
                  {hasItems && isCurrentOpen && (
                    <div
                      className="absolute left-0 mt-1 w-80 bg-white border-2 border-purple-200 rounded-none shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseEnter={() => handleMouseEnter(link.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="px-3 py-2 border-b border-purple-100 text-[11px] font-black text-[#4A1249] uppercase tracking-wider flex items-center justify-between">
                        <span>{link.label} Directory</span>
                        <span className="text-[10px] text-[#C39A53] font-semibold">HIAU Liberia</span>
                      </div>
                      <div className="py-1 space-y-1">
                        {submenus[link.id].filter(sub => !sub.restricted || !!currentUser).map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              sub.action();
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left p-2.5 rounded-sm hover:bg-purple-50 group flex items-start justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 bg-purple-50 group-hover:bg-[#4A1249] group-hover:text-white rounded transition-colors shrink-0 mt-0.5">
                                {sub.icon}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-[#4A1249] flex items-center gap-1.5">
                                  <span>{sub.label}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1">
                                  {sub.desc}
                                </div>
                              </div>
                            </div>
                            {sub.badge && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#C39A53]/20 text-[#4A1249] border border-[#C39A53]/50 rounded shrink-0">
                                {sub.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}


          </nav>

          {/* Right: Solid Rectangular APPLY NOW button in HIAU Imperial Purple */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onOpenApplicationModal) onOpenApplicationModal();
                else onNavigateSection('admissions');
              }}
              className="px-6 py-2.5 bg-[#4A1249] hover:bg-[#661B69] text-white font-collegiate font-black text-sm uppercase tracking-wider rounded-none transition-all flex items-center gap-3 shadow-md cursor-pointer border-2 border-[#C39A53] active:scale-98"
            >
              <span className="text-white font-black tracking-wider text-sm drop-shadow-xs" style={{ color: '#FFFFFF' }}>APPLY NOW</span>
              <ArrowRight className="w-4 h-4 text-[#C39A53]" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown with full accordion submenus */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-purple-200 space-y-2 bg-white max-h-[75vh] overflow-y-auto">
            {navLinks.map((link) => {
              const hasSub = link.hasDropdown && !!submenus[link.id];
              const isExpanded = mobileExpandedSection === link.id;

              return (
                <div key={link.id} className="border-b border-purple-50 last:border-0 pb-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <button
                      onClick={() => {
                        onNavigateSection(link.id);
                        if (!hasSub) setMobileMenuOpen(false);
                      }}
                      className="text-left text-sm font-bold text-slate-800 hover:text-[#4A1249]"
                    >
                      {link.label}
                    </button>
                    {hasSub && (
                      <button
                        onClick={() => setMobileExpandedSection(isExpanded ? null : link.id)}
                        className="p-1 text-[#4A1249] hover:bg-purple-50 rounded"
                        aria-label={`Expand ${link.label} submenu`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSub && isExpanded && (
                    <div className="pl-6 pr-3 py-1 space-y-1 bg-purple-50/50">
                      {submenus[link.id].filter(sub => !sub.restricted || !!currentUser).map((sub, sidx) => (
                        <button
                          key={sidx}
                          onClick={() => {
                            sub.action();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left py-2 px-2 text-xs font-semibold text-slate-700 hover:text-[#4A1249] flex items-center justify-between border-b border-purple-100 last:border-0"
                        >
                          <span className="flex items-center gap-2">
                            {sub.icon}
                            <span>{sub.label}</span>
                          </span>
                          {sub.badge && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#C39A53]/20 text-[#4A1249] rounded">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Actions: Apply Now & ERP Access */}
            <div className="pt-2 px-3 flex flex-col gap-2">
              <button
                onClick={() => {
                  if (onOpenApplicationModal) onOpenApplicationModal();
                  else onNavigateSection('admissions');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4A1249] text-white font-collegiate font-bold text-sm uppercase rounded-none cursor-pointer border border-[#C39A53]/50"
              >
                <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>APPLY NOW</span>
                <ArrowRight className="w-4 h-4 text-[#C39A53]" />
              </button>

            </div>
          </div>
        )}
      </div>
    </header>
  );
};
