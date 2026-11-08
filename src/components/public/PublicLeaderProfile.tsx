import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  CheckCircle,
  Quote,
  Award,
  Users,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Share2,
  Check,
  Compass,
  Briefcase,
  Mail,
  MapPin,
  Camera,
  Search,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import {
  resolveLeaderProfile,
  LEADER_GROUPS,
  LeaderProfile,
  LEADERSHIP_PROFILES,
} from '../../data/leadershipData';

interface PublicLeaderProfileProps {
  profileId: string;
  onClose: () => void;
  onSelectProfile: (id: string) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenApplicationModal?: () => void;
}

export const PublicLeaderProfile: React.FC<PublicLeaderProfileProps> = ({
  profileId,
  onClose,
  onSelectProfile,
  onNavigateSection,
  onOpenApplicationModal,
}) => {
  const profile: LeaderProfile =
    resolveLeaderProfile(profileId) || LEADERSHIP_PROFILES['chancellor'];

  const [activeTab, setActiveTab] = useState<'bio' | 'education' | 'mandates' | 'offices'>('bio');
  const [copiedLink, setCopiedLink] = useState(false);
  const [useSecondaryPhoto, setUseSecondaryPhoto] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Scroll to top and reset state when profile changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUseSecondaryPhoto(false);
    setActiveTab('bio');
    setMobileSidebarOpen(false);
  }, [profileId]);

  // Flatten members list for previous / next pagination
  const allMembers = LEADER_GROUPS.flatMap((g) => g.members);
  const currentIndex = allMembers.findIndex((m) => m.id === profile.id);
  const prevMember = currentIndex > 0 ? allMembers[currentIndex - 1] : null;
  const nextMember =
    currentIndex >= 0 && currentIndex < allMembers.length - 1 ? allMembers[currentIndex + 1] : null;

  // Copy shareable unique URL to clipboard
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/#leader=${profile.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const currentDisplayedImage =
    useSecondaryPhoto && profile.secondaryImage ? profile.secondaryImage : profile.image;

  // Executive Core Three for the quick top switcher: Chancellor, President, and Board Chairman
  const executiveOfficers = [
    {
      id: 'chancellor',
      title: 'Chancellor',
      role: 'Bishop Dr. Darlingston G. Johnson',
      subtitle: 'Founder & Chancellor',
      avatar: '/assets/images/hiau_chancellor_portrait_1794157550151.jpg',
    },
    {
      id: 'deputy_chancellor',
      title: 'Founding President',
      role: 'Dr. Kona-Facia Freeman-Nepay',
      subtitle: 'Deputy Chancellor & Founding Member',
      avatar: '/assets/images/hiau_president_portrait_1794157550124.jpg',
    },
    {
      id: 'president',
      title: 'President',
      role: 'Asst. Prof. Mamawa M. Freeman-Moore',
      subtitle: 'President of the University',
      avatar: '/assets/hiau/prof_mamawa_freeman_moore.png',
    },
    {
      id: 'board_chair',
      title: 'Board Chairman',
      role: 'Dr. Jonathan C. Taylor',
      subtitle: 'Chairman, Board of Trustees',
      avatar: '/assets/images/hiau_chair_portrait_1794157551551.jpg',
    },
  ];

  // Filter groups for side-navigation search
  const filteredGroups = LEADER_GROUPS.map((group) => {
    const q = sidebarSearch.toLowerCase().trim();
    if (!q) return group;
    return {
      ...group,
      members: group.members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.badge.toLowerCase().includes(q)
      ),
    };
  }).filter((group) => group.members.length > 0);

  return (
    <div className="bg-[#FAF8FB] min-h-screen text-[#2E0F34] animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HERO BANNER (MATCHING HIAU ARCHITECTURAL HEADER IN SCREENSHOTS) */}
      {/* ========================================================================= */}
      <div className="relative bg-[#4A1249] overflow-hidden">
        {/* Campus Building Background Image with subtle architectural overlay */}
        <div className="absolute inset-0">
          <img
            src="/assets/aistudio/image_29eb5504.png"
            alt="HIAU Campus Architecture"
            className="w-full h-full object-cover opacity-25 filter brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4A1249] via-[#4A1249]/90 to-[#2A082C]/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumbs Row (Home > About HIAU > Page Name) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200 font-medium">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-amber-300 hover:text-white transition-colors cursor-pointer group"
              >
                <Home className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onNavigateSection('about'), 50);
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About HIAU
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-white font-bold tracking-wide uppercase">
                {profile.breadcrumb}
              </span>
            </div>

            {/* Direct Share Link & Mobile Directory Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold cursor-pointer border border-white/20"
              >
                <Menu className="w-3.5 h-3.5 text-[#C39A53]" />
                <span>Switch Leader</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C39A53]/20 hover:bg-[#C39A53]/35 text-[#C39A53] hover:text-white border border-[#C39A53]/50 rounded text-xs font-semibold transition-all cursor-pointer shadow-xs"
                title="Copy unique link to this profile"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#C39A53]" />
                    <span className="hidden sm:inline">Share Profile Link</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-collegiate font-bold uppercase tracking-wider rounded border border-white/20 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C39A53]" />
                <span className="hidden sm:inline">Return to Overview</span>
                <span className="sm:hidden">Close</span>
              </button>
            </div>
          </div>

          {/* Large Hero Title */}
          <div>
            <span className="text-xs font-collegiate font-bold text-[#C39A53] tracking-widest uppercase block mb-1">
              Harvest Intercontinental American University Leadership
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-collegiate font-black text-white tracking-tight uppercase drop-shadow-sm">
              {profile.bannerTitle}
            </h1>
          </div>
        </div>

        {/* Gold accent border line */}
        <div className="h-1.5 w-full bg-[#C39A53]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN LAYOUT: SLEEK VERTICAL SIDE-NAV BAR + DEDICATED PROFILE VIEW */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ======================================================================= */}
          {/* SLEEK, VERTICAL SIDE-NAVIGATION BAR (STICKY DESKTOP MENU) */}
          {/* ======================================================================= */}
          <aside
            className={`w-full lg:w-80 shrink-0 bg-white border-2 border-purple-200/90 rounded-2xl shadow-md p-4 lg:sticky lg:top-24 transition-all z-20 ${
              mobileSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Top Bar inside Sidebar */}
            <div className="pb-3 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#4A1249] text-[#C39A53] flex items-center justify-center font-bold text-xs shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-collegiate font-black uppercase tracking-wider text-[#4A1249]">
                    Institutional Leaders
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">Direct Switch Menu</span>
                </div>
              </div>

              {/* Mobile close button */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dedicated Primary Quick Switcher: Chancellor, President & Board Chairman */}
            <div className="mt-3.5 space-y-2">
              <div className="text-[10px] font-collegiate font-black uppercase tracking-widest text-[#A17A32] px-2 flex items-center justify-between">
                <span>Executive Officers</span>
                <span className="text-[#C39A53]">• Core</span>
              </div>

              <div className="space-y-1.5">
                {executiveOfficers.map((exec) => {
                  const isCurrent = exec.id === profile.id;
                  return (
                    <button
                      key={exec.id}
                      onClick={() => {
                        onSelectProfile(exec.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer group border ${
                        isCurrent
                          ? 'bg-[#4A1249] text-white shadow-md border-[#C39A53] ring-1 ring-[#C39A53]/50'
                          : 'bg-[#FAF8FB] hover:bg-purple-50 text-slate-800 border-purple-100 hover:border-purple-300'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#C39A53] bg-purple-900 shadow-xs">
                        <img
                          src={exec.avatar}
                          alt={exec.role}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isCurrent ? 'text-[#C39A53]' : 'text-[#822180]'
                            }`}
                          >
                            {exec.title}
                          </span>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-[#C39A53] animate-pulse" />
                          )}
                        </div>
                        <div
                          className={`text-xs font-bold truncate leading-tight mt-0.5 ${
                            isCurrent ? 'text-white' : 'text-slate-900 group-hover:text-[#4A1249]'
                          }`}
                        >
                          {exec.role}
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isCurrent
                            ? 'text-[#C39A53] translate-x-0.5'
                            : 'text-slate-400 group-hover:text-[#4A1249]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Search Input */}
            <div className="mt-4 pt-3 border-t border-purple-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search other trustees & faculty..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-[#FAF8FB] border border-purple-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#4A1249] text-slate-800"
                />
              </div>
            </div>

            {/* Secondary Leader Groups (Trustees & Professors) */}
            <div className="mt-3 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredGroups
                .filter((g) => g.category !== 'Executive Leadership')
                .map((group, gidx) => (
                  <div key={gidx} className="space-y-1">
                    <div className="px-2 py-0.5 text-[9px] font-collegiate font-bold uppercase tracking-widest text-slate-500 bg-purple-50/70 rounded">
                      {group.category}
                    </div>

                    <div className="space-y-1 pt-0.5">
                      {group.members.map((member) => {
                        const isSelected = member.id === profile.id;
                        return (
                          <button
                            key={member.id}
                            onClick={() => {
                              onSelectProfile(member.id);
                              setMobileSidebarOpen(false);
                            }}
                            className={`w-full text-left p-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer group ${
                              isSelected
                                ? 'bg-[#4A1249] text-white shadow-xs font-bold border-l-2 border-[#C39A53]'
                                : 'text-slate-700 hover:bg-purple-50/80 hover:text-[#4A1249]'
                            }`}
                          >
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-purple-300 bg-purple-50">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-[11px] font-bold truncate leading-tight ${
                                  isSelected
                                    ? 'text-white'
                                    : 'text-slate-800 group-hover:text-[#4A1249]'
                                }`}
                              >
                                {member.name}
                              </div>
                              <div
                                className={`text-[10px] truncate leading-tight ${
                                  isSelected ? 'text-purple-200' : 'text-slate-500'
                                }`}
                              >
                                {member.role}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            {/* Bottom Overview Link */}
            <div className="mt-4 pt-3 border-t border-purple-100 text-center">
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onNavigateSection('about'), 50);
                }}
                className="text-[11px] font-bold text-[#4A1249] hover:text-[#661B69] cursor-pointer inline-flex items-center gap-1"
              >
                <span>View Full 19-Member Assembly</span>
                <ArrowRight className="w-3 h-3 text-[#C39A53]" />
              </button>
            </div>
          </aside>

          {/* ======================================================================= */}
          {/* RIGHT / MAIN CONTENT: DETAILED BIOGRAPHICAL & DYNAMIC IMAGE LAYOUT */}
          {/* ======================================================================= */}
          <main className="flex-1 min-w-0 bg-white border border-purple-200 rounded-2xl shadow-sm p-6 sm:p-10">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* EDITORIAL BIOGRAPHICAL CONTENT (7 cols on xl) */}
              <div className="xl:col-span-7 space-y-6">
                {/* Gold stars indicator if specified (President) */}
                {profile.showStars && (
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Sparkles className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Sparkles className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Sparkles className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                )}

                {/* Profile Name & Subtitle */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-collegiate font-bold uppercase tracking-wider bg-[#4A1249] text-[#C39A53] mb-2">
                    <Award className="w-3 h-3 text-[#C39A53]" />
                    <span>{profile.roleBadge}</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-collegiate font-black text-[#2A082C] tracking-tight leading-tight uppercase">
                    {profile.name}
                  </h2>

                  <p className="text-base sm:text-lg font-medium text-slate-600 mt-2 leading-snug">
                    {profile.subtitle}
                  </p>

                  {/* Optional Section Kicker */}
                  {profile.kicker && (
                    <div className="mt-3 text-sm font-bold text-[#4A1249] uppercase tracking-wide">
                      {profile.kicker}
                    </div>
                  )}

                  {/* Gold horizontal accent line matching HIAU authentic screenshots */}
                  <div className="w-16 h-1 bg-[#C39A53] my-4 rounded-full" />
                </div>

                {/* Dynamic Content Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-purple-200 pb-2">
                  <button
                    onClick={() => setActiveTab('bio')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'bio'
                        ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                        : 'text-slate-600 hover:text-[#4A1249] hover:bg-purple-50'
                    }`}
                  >
                    Biography Narrative
                  </button>

                  {profile.education && profile.education.length > 0 && (
                    <button
                      onClick={() => setActiveTab('education')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'education'
                          ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                          : 'text-slate-600 hover:text-[#4A1249] hover:bg-purple-50'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Qualifications ({profile.education.length})</span>
                    </button>
                  )}

                  {profile.strategicMandates && profile.strategicMandates.length > 0 && (
                    <button
                      onClick={() => setActiveTab('mandates')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'mandates'
                          ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                          : 'text-slate-600 hover:text-[#4A1249] hover:bg-purple-50'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Strategic Mandates</span>
                    </button>
                  )}

                  {profile.keyOffices && profile.keyOffices.length > 0 && (
                    <button
                      onClick={() => setActiveTab('offices')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'offices'
                          ? 'bg-[#4A1249] text-[#C39A53] shadow-xs'
                          : 'text-slate-600 hover:text-[#4A1249] hover:bg-purple-50'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Key Appointments</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: BIOGRAPHY NARRATIVE */}
                {activeTab === 'bio' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed text-justify">
                      {profile.paragraphs.map((para, idx) => (
                        <p key={idx} className="first-of-type:font-normal">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Inspirational Quote Callout */}
                    {profile.quote && (
                      <div className="relative mt-8 p-6 bg-[#FAF4FB] border-l-4 border-l-[#4A1249] rounded-r-xl shadow-xs">
                        <Quote className="w-8 h-8 text-[#C39A53]/30 absolute top-4 right-4" />
                        <p className="text-sm sm:text-base italic text-[#4A1249] font-serif leading-relaxed pr-8">
                          "{profile.quote}"
                        </p>
                        <div className="mt-3 text-xs font-bold uppercase tracking-wider text-[#C39A53]">
                          — {profile.name}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: EDUCATION & QUALIFICATIONS */}
                {activeTab === 'education' && profile.education && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-[#FAF8FB] border border-purple-200 rounded-xl">
                      <h4 className="text-xs font-collegiate font-bold text-[#4A1249] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#C39A53]" />
                        <span>Academic Degrees & International Pedagogy</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.education.map((item, eidx) => (
                          <div
                            key={eidx}
                            className="flex items-start gap-3 p-3 bg-white border border-purple-100 rounded-lg shadow-2xs"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#C39A53] mt-2 shrink-0" />
                            <span className="text-xs sm:text-sm text-slate-800 font-medium">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: STRATEGIC MANDATES */}
                {activeTab === 'mandates' && profile.strategicMandates && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-[#FAF8FB] border border-purple-200 rounded-xl">
                      <h4 className="text-xs font-collegiate font-bold text-[#4A1249] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#C39A53]" />
                        <span>Vision & Institutional Priority Directives</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.strategicMandates.map((mandate, midx) => (
                          <div
                            key={midx}
                            className="flex items-start gap-3 p-3 bg-white border border-purple-100 rounded-lg shadow-2xs"
                          >
                            <CheckCircle className="w-4 h-4 text-[#C39A53] mt-0.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-slate-800 font-medium">
                              {mandate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: KEY OFFICES & APPOINTMENTS */}
                {activeTab === 'offices' && profile.keyOffices && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-4 bg-[#FAF8FB] border border-purple-200 rounded-xl">
                      <h4 className="text-xs font-collegiate font-bold text-[#4A1249] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#4A1249]" />
                        <span>Executive Appointments & Councils</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.keyOffices.map((office, oidx) => (
                          <div
                            key={oidx}
                            className="flex items-start gap-3 p-3 bg-white border border-purple-100 rounded-lg shadow-2xs"
                          >
                            <Award className="w-4 h-4 text-[#4A1249] mt-0.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-slate-800 font-medium">
                              {office}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact / Administrative Liaison info if provided */}
                {profile.contactLiaison && (
                  <div className="p-4 bg-[#FAF4FB] border border-purple-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#4A1249] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#C39A53]" />
                        <span>{profile.contactLiaison.office}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1 mt-0.5 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{profile.contactLiaison.location}</span>
                      </div>
                    </div>
                    {profile.contactLiaison.email && (
                      <a
                        href={`mailto:${profile.contactLiaison.email}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 text-[#4A1249] hover:bg-[#4A1249] hover:text-white rounded font-medium transition-colors cursor-pointer text-xs shrink-0"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#C39A53]" />
                        <span>{profile.contactLiaison.email}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Institutional Credentials Badge strip */}
                <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 text-[#4A1249] font-bold">
                    <CheckCircle className="w-4 h-4 text-[#C39A53]" />
                    <span>Statutory Leader</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4 text-[#4A1249]" />
                    <span>Main Campus • Old Road, Chugbor</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-[#C39A53]" />
                    <span>HIAU Liberia</span>
                  </span>
                </div>
              </div>

              {/* DYNAMIC FORMAL PORTRAIT PANEL (5 cols on xl) */}
              <div className="xl:col-span-5 space-y-4">
                <div className="bg-[#FAF8FB] border-2 border-purple-200/80 rounded-2xl p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all">
                  {/* Photo Frame with subtle shadow and border */}
                  <div className="relative overflow-hidden rounded-xl bg-[#2A082C] aspect-3/4 shadow-md group">
                    <img
                      src={currentDisplayedImage}
                      alt={profile.name}
                      className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Corner official badge */}
                    <div className="absolute top-3 left-3 bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/50 px-3 py-1 rounded text-[11px] font-collegiate font-bold uppercase tracking-wider shadow backdrop-blur-xs flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#C39A53]" />
                      <span>{profile.roleBadge}</span>
                    </div>

                    {/* Secondary Photo Switcher if available */}
                    {profile.secondaryImage && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <button
                          onClick={() => setUseSecondaryPhoto(!useSecondaryPhoto)}
                          className="px-2.5 py-1 bg-black/75 hover:bg-[#4A1249] text-white text-[10px] font-bold uppercase tracking-wider rounded-md border border-white/30 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          title="Toggle between formal studio portrait and campus photograph"
                        >
                          <Camera className="w-3 h-3 text-[#C39A53]" />
                          <span>
                            {useSecondaryPhoto ? 'Show Formal Portrait' : 'Show Campus Photo'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Caption Under Photo (matching screenshot for President and leaders) */}
                  {profile.imageCaption && (
                    <div className="mt-4 pt-3 border-t border-purple-100 text-center space-y-0.5">
                      {profile.imageCaption.map((line, lidx) => (
                        <div
                          key={lidx}
                          className={
                            lidx === 0
                              ? 'text-xs sm:text-sm font-bold text-[#4A1249]'
                              : lidx === 1
                              ? 'text-xs font-semibold text-[#A17A32] uppercase tracking-wide'
                              : 'text-[11px] text-slate-500'
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admission Action Card */}
                <div className="bg-[#4A1249] text-white p-6 rounded-2xl shadow-lg border-2 border-[#C39A53]/50 space-y-3">
                  <div>
                    <span className="text-[11px] font-collegiate font-bold uppercase tracking-widest text-[#C39A53] block">
                      Transformative Higher Education
                    </span>
                    <h4 className="text-xl font-collegiate font-black uppercase text-white mt-0.5">
                      ENROLL AT HARVEST UNIVERSITY
                    </h4>
                    <p className="text-xs text-purple-100 mt-1 leading-relaxed">
                      Experience American-style collegiate education, practical startup business incubation, and whole-person formation in Monrovia.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (onOpenApplicationModal) onOpenApplicationModal();
                        else onNavigateSection('admissions');
                      }}
                      className="flex-1 py-2.5 px-4 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-collegiate font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>APPLY FOR ADMISSION</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2A082C]" />
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-collegiate font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center cursor-pointer border border-white/20"
                    >
                      <span>OVERVIEW</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PREVIOUS / NEXT PAGINATION CONTROLS */}
            <div className="mt-12 pt-6 border-t border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {prevMember ? (
                  <button
                    onClick={() => onSelectProfile(prevMember.id)}
                    className="flex items-center gap-2.5 text-left group p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#4A1249] group-hover:-translate-x-1 transition-transform" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Previous Leader
                      </div>
                      <div className="text-xs font-bold text-[#4A1249] group-hover:text-[#661B69]">
                        {prevMember.name}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div />
                )}
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#FAF4FB] hover:bg-purple-100 text-[#4A1249] text-xs font-collegiate font-bold uppercase tracking-wider rounded border border-purple-200 transition-colors cursor-pointer"
              >
                ← Return to Overview
              </button>

              <div>
                {nextMember ? (
                  <button
                    onClick={() => onSelectProfile(nextMember.id)}
                    className="flex items-center gap-2.5 text-right group p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Next Leader
                      </div>
                      <div className="text-xs font-bold text-[#4A1249] group-hover:text-[#661B69]">
                        {nextMember.name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#4A1249] group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
