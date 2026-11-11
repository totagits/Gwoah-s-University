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
  ShieldCheck,
  Laptop,
  CheckCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface PublicNavbarProps {
  onOpenPortal: (tab?: string) => void;
  currentUser: UserProfile | null;
  onNavigateSection: (sectionId: string) => void;
  activeSection: string;
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
  onOpenProfile,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [mobileAboutCategory, setMobileAboutCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setMobileExpandedSection(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

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
    about: [],
    tour: [
      {
        label: 'Campus & Classroom Continuous Video Tour',
        desc: 'Explore campus and classroom facilities',
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
        desc: 'Explore campus study spaces and library resources',
        icon: <BookOpen className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('tour'),
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
        desc: 'Submit an application; confirm assessment fees and dates with Admissions',
        icon: <ArrowRight className="w-4 h-4 text-[#C39A53]" />,
        action: () => { window.location.assign('/?apply=1'); },
        badge: 'Apply',
      },
      {
        label: '5-Step Admission Requirements',
        desc: 'Application, WASSCE/WAEC transcripts, photos, exam, interview',
        icon: <CheckCircle className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('admissions'),
      },
      {
        label: 'Financial Aid & Scholarships',
        desc: 'Learn about aid inquiries, eligibility and available support',
        icon: <FileText className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('financial-aid'),
        badge: 'Aid',
      },
    ],
    calendar: [
      {
        label: '2026/2027 Senate Academic Calendar',
        desc: 'Review published registration, instruction and examination dates',
        icon: <Calendar className="w-4 h-4 text-[#C39A53]" />,
        action: () => onNavigateSection('calendar'),
        badge: 'Calendar',
      },
      {
        label: 'Mid-Term & Final Examination Schedules',
        desc: 'Comprehensive timetables, room assignments & rules',
        icon: <Clock className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('calendar'),
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
        desc: 'Read university student inclusion and support information',
        icon: <ShieldCheck className="w-4 h-4 text-[#4A1249]" />,
        action: () => onNavigateSection('dei'),
        badge: 'Charter',
      },


    ],
  };

  // About is a public information architecture, not a directory of names in one dropdown.
  const aboutGroups: Array<{ id: string; title: string; links: Array<{ label: string; action: () => void }> }> = [
    {
      id: 'university', title: 'Our University', links: [
        { label: 'Overview & History', action: () => onNavigateSection('about') },
        { label: 'Mission, Vision & Values', action: () => onNavigateSection('about') },
        { label: 'Institutional Identity', action: () => onNavigateSection('about') },
      ],
    },
    {
      id: 'leadership', title: 'Leadership', links: [
        { label: 'Chancellor', action: () => onOpenProfile ? onOpenProfile('chancellor') : onNavigateSection('hiau-leadership') },
        { label: 'President', action: () => onOpenProfile ? onOpenProfile('president') : onNavigateSection('hiau-leadership') },
        { label: 'Deputy Chancellor', action: () => onOpenProfile ? onOpenProfile('deputy_chancellor') : onNavigateSection('hiau-leadership') },
        { label: 'Leadership Directory', action: () => onNavigateSection('hiau-leadership') },
      ],
    },
    {
      id: 'governance', title: 'Governance', links: [
        { label: 'Board of Trustees', action: () => onNavigateSection('hiau-leadership') },
        { label: 'Institutional Governance', action: () => onNavigateSection('about') },
        { label: 'Licensure & Partnerships', action: () => onNavigateSection('about') },
      ],
    },
    {
      id: 'campus', title: 'Campus & Community', links: [
        { label: 'Campus Overview', action: () => onNavigateSection('campus-campus') },
        { label: 'Facilities & Infrastructure', action: () => onNavigateSection('campus-facilities') },
        { label: 'Campus Life & Community', action: () => onNavigateSection('campus-community') },
      ],
    },
  ];

  const [searchFeedback, setSearchFeedback] = useState('');
  const siteSearch = (value: string) => {
    const term = value.trim().toLowerCase();
    if (!term) return;
    const targets: Array<{ words: string[]; section: string }> = [
      { words: ['financial aid', 'scholarship', 'bursary', 'grant'], section: 'financial-aid' },
      { words: ['apply', 'application', 'admission', 'entrance'], section: 'admissions' },
      { words: ['degree', 'college', 'program', 'course', 'tvet', 'certificate', 'major'], section: 'colleges' },
      { words: ['leader', 'governance', 'trustee', 'president', 'chancellor', 'faculty'], section: 'about' },
      { words: ['tour', 'campus', 'classroom', 'library', 'facility'], section: 'tour' },
      { words: ['calendar', 'event', 'schedule', 'date'], section: 'calendar' },
      { words: ['student life', 'fellowship', 'student experience', 'club'], section: 'dei' },
      { words: ['home', 'welcome'], section: 'hero' },
      { words: ['about', 'mission', 'vision', 'history'], section: 'about' },
    ];
    const match = targets.find(target => target.words.some(word => term.includes(word)));
    if (!match) {
      setSearchFeedback('No direct match. Try Scholarships, Admissions, Academics, Leadership, Campus Tour or Events.');
      return;
    }
    onNavigateSection(match.section);
    setSearchFeedback('');
    setSearchOpen(false);
    setSearchQuery('');
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
    <header onKeyDown={(event) => { if (event.key === 'Escape') { setActiveDropdown(null); setSearchOpen(false); setMobileMenuOpen(false); } }} className="sticky top-0 z-40 bg-white border-b border-purple-200 text-[#2A082C] shadow-sm">
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
              aria-label="Find website section"
              aria-expanded={searchOpen}
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
          <div className="py-3 px-4 bg-purple-50/70 border-t border-purple-200 animate-in fade-in flex flex-wrap items-center gap-3">
            <Search className="w-4 h-4 text-[#4A1249] shrink-0" />
            <input
              type="text"
              placeholder="Find a section: programs, admissions, scholarships, campus, calendar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Find a university website section"
              className="min-w-[180px] flex-1 bg-white px-3 py-1.5 border border-purple-300 text-xs rounded-none focus:outline-none focus:border-[#4A1249] text-slate-900"
              autoFocus
              onKeyDown={(event) => { if (event.key === 'Enter') siteSearch(searchQuery); }}
            />
            <button
              onClick={() => siteSearch(searchQuery)}
              className="px-4 py-1.5 bg-[#4A1249] hover:bg-[#661B69] text-white text-xs font-collegiate font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => { setSearchOpen(false); setSearchFeedback(''); }}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
            {searchFeedback && <p role="status" className="max-w-sm text-xs leading-5 text-[#4A1249]">{searchFeedback}</p>}
          </div>
        )}

        {/* HIAU Navigation Sub-Bar with horizontal items and interactive submenus */}
        <div className="relative hidden lg:flex items-center justify-between border-t border-purple-100 py-2">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const hasItems = link.hasDropdown && (link.id === 'about' || !!submenus[link.id]);
              const isCurrentOpen = activeDropdown === link.id;

              return (
                <div
                  key={link.id}
                  className="static"
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
                    aria-haspopup={hasItems ? 'true' : undefined}
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

                  {/* Desktop public navigation; About uses four scannable content categories. */}
                  {hasItems && isCurrentOpen && (
                    <div
                      className="absolute left-0 right-0 top-full bg-white border border-purple-200 border-t-4 border-t-[#C39A53] rounded-b-lg shadow-2xl z-50 max-h-[min(66vh,570px)] overflow-y-auto p-5"
                      onMouseEnter={() => handleMouseEnter(link.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="px-2 pb-3 border-b border-purple-100 flex items-center justify-between">
                        <span className="text-sm font-black text-[#4A1249]">{link.id === 'about' ? 'About HIAU' : `${link.label} Directory`}</span>
                        <span className="text-xs text-slate-600">Harvest Intercontinental American University</span>
                      </div>
                      {link.id === 'about' ? (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 pt-5" aria-label="About HIAU categories">
                          {aboutGroups.map(group => (
                            <section key={group.id} aria-label={group.title} className="min-w-0">
                              <h3 className="border-b border-[#C39A53]/40 pb-2 text-sm font-bold text-[#4A1249]">{group.title}</h3>
                              <div className="flex flex-col gap-1 pt-2">
                                {group.links.map(item => (
                                  <button key={item.label} type="button"
                                    onClick={() => { item.action(); setActiveDropdown(null); }}
                                    className="rounded px-2 py-2 text-left text-sm leading-5 text-slate-700 hover:bg-purple-50 hover:text-[#4A1249] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4A1249]">
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 pt-4">
                          {submenus[link.id].filter(sub => !sub.restricted || (!!currentUser && ['super_admin','registrar','admissions_officer'].includes(currentUser.role))).map((sub, idx) => (
                            <button key={idx} type="button" onClick={() => { sub.action(); setActiveDropdown(null); }}
                              className="w-full min-h-20 text-left p-3 rounded-md border border-transparent hover:border-purple-200 hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249] group flex items-start justify-between cursor-pointer transition-colors">
                              <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-purple-50 rounded shrink-0 mt-0.5">{sub.icon}</div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900 group-hover:text-[#4A1249]">{sub.label}</div>
                                  <div className="text-[11px] text-slate-600 leading-5 line-clamp-2">{sub.desc}</div>
                                </div>
                              </div>
                              {sub.badge && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#C39A53]/20 text-[#4A1249] rounded shrink-0">{sub.badge}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}


          </nav>

          {/* Right: Solid Rectangular APPLY NOW button in HIAU Imperial Purple */}
          <div className="flex items-center gap-3">
            <a
              href="/?apply=1"
              aria-label="Apply now to HIAU"
              className="px-6 py-2.5 bg-[#4A1249] hover:bg-[#661B69] text-white font-collegiate font-black text-sm uppercase tracking-wider rounded-none transition-all flex items-center gap-3 shadow-md cursor-pointer border-2 border-[#C39A53] active:scale-98"
            >
              <span className="text-white font-black tracking-wider text-sm drop-shadow-xs" style={{ color: '#FFFFFF' }}>APPLY NOW</span>
              <ArrowRight className="w-4 h-4 text-[#C39A53]" />
            </a>
          </div>
        </div>

        {/* Mobile menu dropdown with full accordion submenus */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-purple-200 space-y-2 bg-white max-h-[75vh] overflow-y-auto">
            {navLinks.map((link) => {
              const hasSub = link.hasDropdown && (link.id === 'about' || !!submenus[link.id]);
              const isExpanded = mobileExpandedSection === link.id;

              return (
                <div key={link.id} className="border-b border-purple-50 last:border-0 pb-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <button
                      onClick={() => {
                        onNavigateSection(link.id);
                        setMobileMenuOpen(false);
                        setMobileExpandedSection(null);
                      }}
                      className="text-left text-sm font-bold text-slate-800 hover:text-[#4A1249]"
                    >
                      {link.label}
                    </button>
                    {hasSub && (
                      <button
                        onClick={() => setMobileExpandedSection(isExpanded ? null : link.id)}
                        className="p-1 text-[#4A1249] hover:bg-purple-50 rounded"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${link.label} submenu`}
                         aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSub && isExpanded && (
                    <div className="pl-5 pr-3 py-2 bg-purple-50/50">
                      {link.id === 'about' ? aboutGroups.map(group => {
                        const open = mobileAboutCategory === group.id;
                        return <div key={group.id} className="border-b border-purple-100">
                          <button type="button"
                            onClick={() => setMobileAboutCategory(open ? null : group.id)}
                            aria-expanded={open}
                            className="flex w-full items-center justify-between py-3 text-left text-sm font-bold text-[#4A1249]">
                            {group.title}<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}/>
                          </button>
                          {open && <div className="flex flex-col pb-2 pl-3">
                            {group.links.map(item => (
                              <button type="button" key={item.label}
                                onClick={() => { item.action(); setMobileMenuOpen(false); setMobileExpandedSection(null); setMobileAboutCategory(null); }}
                                className="py-2 text-left text-sm text-slate-700 hover:text-[#4A1249]">{item.label}</button>
                            ))}
                          </div>}
                        </div>;
                      }) : submenus[link.id].filter(sub => !sub.restricted || (!!currentUser && ['super_admin','registrar','admissions_officer'].includes(currentUser.role))).map((sub, sidx) => (
                        <button key={sidx} onClick={() => { sub.action(); setMobileMenuOpen(false); }}
                          className="w-full text-left py-2 px-2 text-xs font-semibold text-slate-700 hover:text-[#4A1249] border-b border-purple-100 last:border-0">
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Actions: Apply Now & ERP Access */}
            <div className="pt-2 px-3 flex flex-col gap-2">
              <a
                href="/?apply=1"
                aria-label="Apply now to HIAU"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4A1249] text-white font-collegiate font-bold text-sm uppercase rounded-none cursor-pointer border border-[#C39A53]/50"
              >
                <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>APPLY NOW</span>
                <ArrowRight className="w-4 h-4 text-[#C39A53]" />
              </a>

            </div>
          </div>
        )}
      </div>
    </header>
  );
};
