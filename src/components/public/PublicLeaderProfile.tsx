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
  BookOpen,
  ExternalLink,
  Globe,
} from 'lucide-react';
import {
  resolveLeaderProfile,
  LEADER_GROUPS,
  LeaderProfile,
  LEADERSHIP_PROFILES,
  PublicationItem,
} from '../../data/leadershipData';

// Branded Official Social Media Icons
const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const TwitterXIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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

  const [activeTab, setActiveTab] = useState<'bio' | 'education' | 'publications' | 'mandates' | 'offices'>('bio');
  const [copiedLink, setCopiedLink] = useState(false);
  const [useSecondaryPhoto, setUseSecondaryPhoto] = useState(false);
  const [portraitUnavailable, setPortraitUnavailable] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarCategory, setSidebarCategory] = useState<
    'all' | 'Executive Leadership' | 'Governing Trustees' | 'Professors & Academic Deans'
  >('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copyFeedbackToast, setCopyFeedbackToast] = useState(false);

  // Scroll to top and reset state when profile changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUseSecondaryPhoto(false);
    setPortraitUnavailable(false);
    setActiveTab('bio');
    setMobileSidebarOpen(false);
  }, [profileId]);

  // Flatten members list for previous / next pagination
  const allMembers = LEADER_GROUPS.flatMap((g) => g.members);
  const currentIndex = allMembers.findIndex((m) => m.id === profile.id);
  const prevMember = currentIndex > 0 ? allMembers[currentIndex - 1] : null;
  const nextMember =
    currentIndex >= 0 && currentIndex < allMembers.length - 1 ? allMembers[currentIndex + 1] : null;

  // Copy shareable unique URL to clipboard with fallback and toast feedback
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const shareUrl = `${origin}${pathname}#leader=${profile.id}`;

    const onSuccess = () => {
      setCopiedLink(true);
      setCopyFeedbackToast(true);
      setTimeout(() => setCopiedLink(false), 2500);
      setTimeout(() => setCopyFeedbackToast(false), 3500);
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(onSuccess)
        .catch(() => fallbackCopy(shareUrl, onSuccess));
    } else {
      fallbackCopy(shareUrl, onSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(el);
      if (successful) onSuccess();
    } catch (e) {
      console.warn('Clipboard copy fallback error', e);
    }
  };

  const currentDisplayedImage =
    useSecondaryPhoto && profile.secondaryImage ? profile.secondaryImage : profile.image;

  // Filter all 19 leader records across groups and search query
  const q = sidebarSearch.toLowerCase().trim();
  const filteredGroups = LEADER_GROUPS.map((group) => {
    if (sidebarCategory !== 'all' && group.category !== sidebarCategory) {
      return null;
    }
    if (!q) return group;
    const matched = group.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.badge.toLowerCase().includes(q) ||
        group.category.toLowerCase().includes(q)
    );
    return matched.length > 0 ? { ...group, members: matched } : null;
  }).filter((group): group is typeof LEADER_GROUPS[0] => group !== null);

  const totalFilteredCount = filteredGroups.reduce((acc, g) => acc + g.members.length, 0);

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
            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-100 font-medium">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-[#FCD34D] hover:text-white transition-colors cursor-pointer group"
              >
                <Home className="w-4 h-4 text-[#FCD34D] group-hover:scale-110 transition-transform" />
                <span className="text-[#FCD34D] font-bold">Home</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-purple-200" />
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onNavigateSection('about'), 50);
                }}
                className="text-purple-100 hover:text-white transition-colors cursor-pointer font-medium"
              >
                About HIAU
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-purple-200" />
              <span
                className="text-white font-extrabold tracking-wider uppercase px-2.5 py-1 rounded bg-white/15 border border-white/30 shadow-xs"
                style={{ color: '#FFFFFF' }}
              >
                {profile.breadcrumb}
              </span>
            </div>

            {/* Direct Share Link & Mobile Directory Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold cursor-pointer border border-white/30"
              >
                <Menu className="w-3.5 h-3.5 text-[#FCD34D]" />
                <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Switch Leader</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] border border-[#C39A53] rounded text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="Copy unique link to this profile"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2A082C]" />
                    <span className="text-[#2A082C] font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#2A082C]" />
                    <span className="hidden sm:inline font-bold text-[#2A082C]">Share Profile Link</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-collegiate font-bold uppercase tracking-wider rounded border border-white/40 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#FCD34D]" />
                <span className="hidden sm:inline text-white font-bold" style={{ color: '#FFFFFF' }}>Return to Overview</span>
                <span className="sm:hidden text-white font-bold" style={{ color: '#FFFFFF' }}>Close</span>
              </button>
            </div>
          </div>

          {/* Large Hero Title */}
          <div>
            <span className="text-xs sm:text-sm font-collegiate font-bold text-[#FCD34D] tracking-widest uppercase block mb-1 drop-shadow-xs">
              Harvest Intercontinental American University Leadership
            </span>
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-collegiate font-black text-white tracking-tight uppercase drop-shadow-md"
              style={{ color: '#FFFFFF' }}
            >
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
            className={`w-full lg:w-84 shrink-0 bg-white border-2 border-purple-200/90 rounded-2xl shadow-md p-4 lg:sticky lg:top-24 transition-all z-20 ${
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
                    Leadership Directory
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">19 Officers, Trustees & Faculty</span>
                </div>
              </div>

              {/* Mobile close button */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                aria-label="Close directory menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ================================================================= */}
            {/* TOP SEARCH BAR (INSTANT FILTER ACROSS ALL 19 LEADERSHIP PROFILES) */}
            {/* ================================================================= */}
            <div className="mt-3 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#822180] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty, staff & leadership..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-[#FAF8FB] border border-purple-200 focus:border-[#4A1249] focus:ring-2 focus:ring-[#C39A53]/40 text-xs rounded-lg pl-8 pr-7 py-2 text-slate-900 font-medium placeholder-slate-400 transition-all outline-none"
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { id: 'all', label: 'All', count: 19 },
                  { id: 'Executive Leadership', label: 'Exec', count: 5 },
                  { id: 'Governing Trustees', label: 'Trustees', count: 7 },
                  { id: 'Professors & Academic Deans', label: 'Faculty', count: 7 },
                ].map((tab) => {
                  const isActive = sidebarCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSidebarCategory(tab.id as typeof sidebarCategory)}
                      className={`text-[10px] px-2 py-1 rounded-md font-bold tracking-tight transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#4A1249] text-white shadow-xs'
                          : 'bg-purple-50 text-slate-700 hover:bg-purple-100 hover:text-[#4A1249]'
                      }`}
                      style={isActive ? { color: '#FFFFFF' } : undefined}
                    >
                      {tab.label} <span className="opacity-80">({tab.count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Result Summary Bar when filtering */}
              {(sidebarSearch.trim() || sidebarCategory !== 'all') && (
                <div className="flex items-center justify-between text-[10px] px-1 text-slate-500 font-medium">
                  <span>
                    Showing <strong className="text-[#4A1249] font-bold">{totalFilteredCount}</strong> leader{totalFilteredCount !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setSidebarSearch('');
                      setSidebarCategory('all');
                    }}
                    className="text-[#A17A32] hover:text-[#4A1249] font-bold cursor-pointer underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            {/* ================================================================= */}
            {/* DYNAMIC LEADERSHIP GROUPS & MEMBERS LIST */}
            {/* ================================================================= */}
            <div className="mt-3.5 space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {totalFilteredCount === 0 ? (
                <div className="p-6 text-center bg-[#FAF8FB] border border-dashed border-purple-200 rounded-xl space-y-2">
                  <Search className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No leaders found</p>
                  <p className="text-[11px] text-slate-500">
                    No results matching "{sidebarSearch}".
                  </p>
                  <button
                    onClick={() => {
                      setSidebarSearch('');
                      setSidebarCategory('all');
                    }}
                    className="text-xs font-bold text-[#4A1249] hover:text-[#661B69] underline cursor-pointer pt-1 block mx-auto"
                  >
                    Clear Search Query
                  </button>
                </div>
              ) : (
                filteredGroups.map((group, gidx) => (
                  <div key={gidx} className="space-y-1.5">
                    {/* Category Label */}
                    <div className="px-2 py-1 text-[10px] font-collegiate font-black uppercase tracking-wider text-[#A17A32] bg-[#FAF4E8] border border-[#E7D5B5] rounded-md flex items-center justify-between">
                      <span>{group.category}</span>
                      <span className="text-[#8C6215] font-bold">• {group.members.length}</span>
                    </div>

                    {/* Member Buttons */}
                    <div className="space-y-1 pt-0.5">
                      {group.members.map((member) => {
                        const isCurrent = member.id === profile.id;
                        return (
                          <button
                            key={member.id}
                            onClick={() => {
                              onSelectProfile(member.id);
                              setMobileSidebarOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer group border ${
                              isCurrent
                                ? 'bg-[#4A1249] text-white shadow-md border-2 border-[#C39A53] ring-2 ring-[#C39A53]/50'
                                : 'bg-white hover:bg-purple-50/70 text-slate-800 border-purple-100 hover:border-purple-300'
                            }`}
                          >
                            {/* Avatar */}
                            <div
                              className={`relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 ${
                                isCurrent ? 'border-[#C39A53] ring-1 ring-white' : 'border-purple-200'
                              } bg-purple-900 shadow-xs`}
                            >
                              <img
                                src={member.avatar}
                                alt={member.name}
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
                                  className={`text-[9px] font-black uppercase tracking-wider ${
                                    isCurrent ? 'text-[#FCD34D]' : 'text-[#822180]'
                                  }`}
                                  style={isCurrent ? { color: '#FCD34D' } : undefined}
                                >
                                  {member.badge}
                                </span>
                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-[#C39A53] ring-2 ring-white/70 animate-pulse shrink-0" />
                                )}
                              </div>
                              <div
                                className={`text-xs font-extrabold truncate leading-tight mt-0.5 ${
                                  isCurrent ? 'text-white drop-shadow-xs' : 'text-[#1F0620] group-hover:text-[#4A1249]'
                                }`}
                                style={isCurrent ? { color: '#FFFFFF' } : undefined}
                              >
                                {member.name}
                              </div>
                              <div
                                className={`text-[10px] truncate leading-tight mt-0.5 ${
                                  isCurrent ? 'text-purple-100 font-medium' : 'text-slate-500'
                                }`}
                                style={isCurrent ? { color: '#F5EDF8' } : undefined}
                              >
                                {member.role}
                              </div>
                            </div>

                            <ChevronRight
                              className={`w-4 h-4 shrink-0 transition-transform ${
                                isCurrent
                                  ? 'text-[#FCD34D] translate-x-0.5'
                                  : 'text-slate-400 group-hover:text-[#4A1249]'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Overview Link */}
            <div className="mt-4 pt-3 border-t border-purple-100 text-center">
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => onNavigateSection('about'), 50);
                }}
                className="text-[11px] font-bold text-[#4A1249] hover:text-[#661B69] cursor-pointer inline-flex items-center gap-1 group"
              >
                <span>View Full 19-Member Assembly</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C39A53] group-hover:translate-x-1 transition-transform" />
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-collegiate font-black uppercase tracking-wider bg-[#4A1249] text-[#FCD34D] mb-2 shadow-xs border border-[#C39A53]/60">
                    <Award className="w-3.5 h-3.5 text-[#FCD34D]" />
                    <span>{profile.roleBadge}</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-collegiate font-black text-[#1F0620] tracking-tight leading-tight uppercase">
                    {profile.name}
                  </h2>

                  <p className="text-base sm:text-lg font-bold text-[#3B1440] mt-2 leading-snug">
                    {profile.subtitle}
                  </p>

                  {/* Optional Section Kicker */}
                  {profile.kicker && (
                    <div className="mt-3 text-sm font-extrabold text-[#4A1249] uppercase tracking-wide">
                      {profile.kicker}
                    </div>
                  )}

                  {/* Actionable Branded Social Media Handles (LinkedIn, Twitter/X) */}
                  {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.twitter || profile.socialLinks.website) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-1">
                      <span className="text-[11px] font-collegiate font-black uppercase tracking-wider text-[#6E4908] flex items-center gap-1 mr-0.5">
                        <span>Connect:</span>
                      </span>

                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs hover:shadow hover:scale-105 active:scale-95 cursor-pointer group"
                          aria-label={`${profile.name} on LinkedIn`}
                        >
                          <LinkedInIcon className="w-3.5 h-3.5 fill-current text-white" />
                          <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      )}

                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1419] hover:bg-black text-white text-xs font-bold transition-all shadow-xs hover:shadow hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer group"
                          aria-label={`${profile.name} on Twitter / X`}
                        >
                          <TwitterXIcon className="w-3.5 h-3.5 fill-current text-white" />
                          <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>X (Twitter)</span>
                          <ExternalLink className="w-3 h-3 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      )}

                      {profile.socialLinks.website && (
                        <a
                          href={profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A1249] hover:bg-[#661B69] text-white text-xs font-bold transition-all shadow-xs hover:shadow hover:scale-105 active:scale-95 border border-[#C39A53]/50 cursor-pointer group"
                          aria-label={`${profile.name} Official Website`}
                        >
                          <Globe className="w-3.5 h-3.5 text-[#FCD34D]" />
                          <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>Official Portal</span>
                          <ExternalLink className="w-3 h-3 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      )}

                      {/* Actionable Profile Share Button */}
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4FB] hover:bg-[#F3EBF5] text-[#4A1249] text-xs font-bold transition-all shadow-xs hover:shadow border border-purple-300 hover:border-[#4A1249] cursor-pointer group active:scale-95 ml-auto sm:ml-0"
                        title="Copy direct share link to this leader profile"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-bold text-emerald-700">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-[#4A1249] group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-[#4A1249]">Share Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* If no social links exist, still provide the direct share button */}
                  {(!profile.socialLinks || (!profile.socialLinks.linkedin && !profile.socialLinks.twitter && !profile.socialLinks.website)) && (
                    <div className="flex items-center gap-2 mt-3.5 pt-1">
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FAF4FB] hover:bg-[#F3EBF5] text-[#4A1249] text-xs font-bold transition-all shadow-xs hover:shadow border border-purple-300 hover:border-[#4A1249] cursor-pointer group active:scale-95"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-bold text-emerald-700">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-[#4A1249] group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-[#4A1249]">Share Profile URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Gold horizontal accent line matching HIAU authentic screenshots */}
                  <div className="w-20 h-1.5 bg-[#C39A53] my-4 rounded-full shadow-xs" />
                </div>

                {/* Dynamic Content Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b-2 border-purple-200 pb-2.5">
                  <button
                    onClick={() => setActiveTab('bio')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-collegiate font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'bio'
                        ? 'bg-[#4A1249] text-white shadow-md ring-1 ring-[#C39A53]/50'
                        : 'text-[#3B1440] hover:text-[#4A1249] hover:bg-purple-100 font-bold'
                    }`}
                  >
                    Biography Narrative
                  </button>

                  {profile.education && profile.education.length > 0 && (
                    <button
                      onClick={() => setActiveTab('education')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-collegiate font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'education'
                          ? 'bg-[#4A1249] text-white shadow-md ring-1 ring-[#C39A53]/50'
                          : 'text-[#3B1440] hover:text-[#4A1249] hover:bg-purple-100 font-bold'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Qualifications ({profile.education.length})</span>
                    </button>
                  )}

                  {profile.publications && profile.publications.length > 0 && (
                    <button
                      onClick={() => setActiveTab('publications')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-collegiate font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'publications'
                          ? 'bg-[#4A1249] text-white shadow-md ring-1 ring-[#C39A53]/50'
                          : 'text-[#3B1440] hover:text-[#4A1249] hover:bg-purple-100 font-bold'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Works ({profile.publications.length})</span>
                    </button>
                  )}

                  {profile.strategicMandates && profile.strategicMandates.length > 0 && (
                    <button
                      onClick={() => setActiveTab('mandates')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-collegiate font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'mandates'
                          ? 'bg-[#4A1249] text-white shadow-md ring-1 ring-[#C39A53]/50'
                          : 'text-[#3B1440] hover:text-[#4A1249] hover:bg-purple-100 font-bold'
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                      <span>Strategic Mandates</span>
                    </button>
                  )}

                  {profile.keyOffices && profile.keyOffices.length > 0 && (
                    <button
                      onClick={() => setActiveTab('offices')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-collegiate font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'offices'
                          ? 'bg-[#4A1249] text-white shadow-md ring-1 ring-[#C39A53]/50'
                          : 'text-[#3B1440] hover:text-[#4A1249] hover:bg-purple-100 font-bold'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Key Appointments</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: BIOGRAPHY NARRATIVE */}
                {activeTab === 'bio' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-4 text-[#1B051C] text-sm sm:text-base leading-relaxed text-justify font-medium">
                      {profile.paragraphs.map((para, idx) => (
                        <p key={idx} className="first-of-type:font-medium">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Inspirational Quote Callout */}
                    {profile.quote && (
                      <div className="relative mt-8 p-6 sm:p-7 bg-[#FAF4FB] border-l-4 border-l-[#4A1249] rounded-r-xl shadow-md border border-purple-100">
                        <Quote className="w-9 h-9 text-[#C39A53]/35 absolute top-4 right-4" />
                        <p className="text-base sm:text-lg italic text-[#2A082C] font-serif font-bold leading-relaxed pr-8">
                          "{profile.quote}"
                        </p>
                        <div className="mt-3.5 text-xs font-black uppercase tracking-wider text-[#6E4908] flex items-center gap-1.5">
                          <span className="w-4 h-0.5 bg-[#6E4908] rounded-full inline-block" />
                          <span>{profile.name}</span>
                        </div>
                      </div>
                    )}

                    {/* SELECTED BIBLIOGRAPHY & WORKS SECTION (Directly below biography) */}
                    {profile.publications && profile.publications.length > 0 && (
                      <div className="mt-10 pt-7 border-t-2 border-purple-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#4A1249] text-[#FCD34D] flex items-center justify-center font-bold shadow-xs">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xl sm:text-2xl font-collegiate font-black text-[#1F0620] uppercase tracking-tight">
                                Selected Bibliography & Works
                              </h3>
                              <span className="text-xs text-[#6E4908] font-bold block">
                                Notable scholarly treatises, published volumes, keynote addresses & curriculum frameworks
                              </span>
                            </div>
                          </div>
                          <span className="self-start sm:self-auto text-[11px] font-collegiate font-black uppercase tracking-wider px-2.5 py-1 bg-purple-100 text-[#4A1249] border border-purple-200 rounded">
                            {profile.publications.length} Works Recorded
                          </span>
                        </div>

                        <div className="space-y-3">
                          {profile.publications.map((work, widx) => (
                            <div
                              key={widx}
                              className="p-4 bg-[#FAF8FB] hover:bg-white border-2 border-purple-200/80 hover:border-[#C39A53] rounded-xl transition-all shadow-xs group"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                                    work.type === 'Book'
                                      ? 'bg-[#4A1249] text-[#FCD34D] border-[#C39A53]/60'
                                      : work.type === 'Policy Treatise'
                                      ? 'bg-[#FAF4E8] text-[#8C6215] border-[#C39A53]/50'
                                      : work.type === 'Curriculum Standard'
                                      ? 'bg-purple-100 text-[#4A1249] border-purple-300'
                                      : 'bg-white text-[#1F0620] border-purple-200 font-bold'
                                  }`}
                                >
                                  {work.type || 'Scholarly Publication'}
                                </span>
                                {work.year && (
                                  <span className="text-xs font-mono font-bold text-[#8C6215] bg-white px-2 py-0.5 rounded border border-purple-100">
                                    {work.year}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm sm:text-base font-bold text-[#1F0620] group-hover:text-[#4A1249] transition-colors leading-snug">
                                "{work.title}"
                              </h4>

                              {work.venue && (
                                <div className="text-xs font-bold text-[#4A1249] mt-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C39A53]" />
                                  <span>{work.venue}</span>
                                </div>
                              )}

                              {work.description && (
                                <p className="text-xs text-[#1B051C] mt-2 leading-relaxed font-medium">
                                  {work.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: PUBLICATIONS & SCHOLARLY WORKS DEDICATED VIEW */}
                {activeTab === 'publications' && profile.publications && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-5 bg-[#FAF8FB] border border-purple-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h4 className="text-xs font-collegiate font-black text-[#1F0620] uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#8C6215]" />
                          <span>Scholarly Treatises, Books & Curriculum Frameworks</span>
                        </h4>
                        <span className="text-[11px] font-bold text-[#6E4908] bg-[#FAF4E8] px-2 py-0.5 rounded border border-[#C39A53]/30">
                          {profile.publications.length} Publications
                        </span>
                      </div>

                      <div className="space-y-3">
                        {profile.publications.map((work, widx) => (
                          <div
                            key={widx}
                            className="p-4 bg-white border border-purple-200 hover:border-[#C39A53] rounded-lg shadow-xs transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-[#4A1249] border border-purple-200">
                                {work.type || 'Scholarly Work'}
                              </span>
                              {work.year && (
                                <span className="text-xs font-mono font-bold text-[#8C6215]">
                                  {work.year}
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm sm:text-base font-bold text-[#1F0620] leading-snug">
                              "{work.title}"
                            </h5>
                            {work.venue && (
                              <div className="text-xs font-bold text-[#4A1249] mt-1">
                                {work.venue}
                              </div>
                            )}
                            {work.description && (
                              <p className="text-xs text-[#1B051C] mt-1.5 leading-relaxed font-medium">
                                {work.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
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
                            className="flex items-start gap-3 p-3.5 bg-white border border-purple-200 rounded-lg shadow-xs"
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-[#C39A53] mt-1.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-[#1B051C] font-bold leading-snug">
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
                    <div className="p-5 bg-[#FAF8FB] border border-purple-200 rounded-xl">
                      <h4 className="text-xs font-collegiate font-black text-[#1F0620] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#8C6215]" />
                        <span>Vision & Institutional Priority Directives</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.strategicMandates.map((mandate, midx) => (
                          <div
                            key={midx}
                            className="flex items-start gap-3 p-3.5 bg-white border border-purple-200 rounded-lg shadow-xs"
                          >
                            <CheckCircle className="w-4 h-4 text-[#8C6215] mt-0.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-[#1B051C] font-bold leading-snug">
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
                    <div className="p-5 bg-[#FAF8FB] border border-purple-200 rounded-xl">
                      <h4 className="text-xs font-collegiate font-black text-[#1F0620] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#4A1249]" />
                        <span>Executive Appointments & Councils</span>
                      </h4>
                      <div className="space-y-2">
                        {profile.keyOffices.map((office, oidx) => (
                          <div
                            key={oidx}
                            className="flex items-start gap-3 p-3.5 bg-white border border-purple-200 rounded-lg shadow-xs"
                          >
                            <Award className="w-4 h-4 text-[#4A1249] mt-0.5 shrink-0" />
                            <span className="text-xs sm:text-sm text-[#1B051C] font-bold leading-snug">
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
                  <div className="p-4 sm:p-5 bg-[#FAF4FB] border-2 border-purple-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-collegiate font-black text-[#1F0620] uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-[#8C6215]" />
                        <span>{profile.contactLiaison.office}</span>
                      </div>
                      <div className="text-[#3B1440] font-semibold flex items-center gap-1 mt-1 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#4A1249]" />
                        <span>{profile.contactLiaison.location}</span>
                      </div>
                    </div>
                    {profile.contactLiaison.email && (
                      <a
                        href={`mailto:${profile.contactLiaison.email}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border-2 border-purple-300 text-[#4A1249] hover:bg-[#4A1249] hover:text-white rounded font-bold transition-colors cursor-pointer text-xs shrink-0 shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#8C6215]" />
                        <span>{profile.contactLiaison.email}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Institutional Credentials Badge strip */}
                <div className="pt-4 border-t border-purple-200 flex flex-wrap items-center gap-3 text-xs text-[#3B1440] font-bold">
                  <span className="flex items-center gap-1.5 text-[#1F0620] font-extrabold">
                    <CheckCircle className="w-4 h-4 text-[#8C6215]" />
                    <span>Statutory Leader</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-[#1B051C]">
                    <Building className="w-4 h-4 text-[#4A1249]" />
                    <span>Main Campus • Old Road, Chugbor</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-[#1B051C]">
                    <GraduationCap className="w-4 h-4 text-[#8C6215]" />
                    <span>HIAU Liberia</span>
                  </span>
                </div>
              </div>

              {/* DYNAMIC FORMAL PORTRAIT PANEL (5 cols on xl) */}
              <div className="xl:col-span-5 space-y-5">
                <div className="bg-white border-2 border-[#4A1249] rounded-2xl p-5 sm:p-6 shadow-[0_25px_50px_-12px_rgba(74,18,73,0.35)] ring-4 ring-[#C39A53]/25 transition-all">
                  {/* Photo Frame with high-contrast shadow and border styling */}
                  <div className="relative rounded-xl overflow-hidden bg-[#1A051C] border-4 border-[#C39A53] shadow-[0_16px_36px_rgba(26,5,28,0.55)] ring-2 ring-[#4A1249] group aspect-[3/4] w-full max-w-[420px] mx-auto flex items-center justify-center">
                    {portraitUnavailable ? (
                      <div role="img" aria-label={`Portrait unavailable for ${profile.name}`} className="w-full h-full flex items-center justify-center text-center px-8 text-white font-bold text-sm">
                        Official portrait unavailable
                      </div>
                    ) : (
                      <img
                        src={currentDisplayedImage}
                        alt={profile.name}
                        className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                        style={{ objectPosition: 'center 12%' }}
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (!useSecondaryPhoto && profile.secondaryImage && profile.secondaryImage !== profile.image) {
                            setUseSecondaryPhoto(true);
                          } else {
                            setPortraitUnavailable(true);
                          }
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                    {/* Corner official badge */}
                    <div className="absolute top-3.5 left-3.5 bg-[#4A1249] text-[#FCD34D] border-2 border-[#C39A53] px-3.5 py-1.5 rounded-md text-[11px] font-collegiate font-black uppercase tracking-wider shadow-lg backdrop-blur-xs flex items-center gap-1.5 z-10">
                      <Award className="w-3.5 h-3.5 text-[#FCD34D]" />
                      <span>{profile.roleBadge}</span>
                    </div>

                    {/* Secondary Photo Switcher if available */}
                    {profile.secondaryImage && (
                      <div className="absolute bottom-3.5 right-3.5 z-10">
                        <button
                          onClick={() => setUseSecondaryPhoto(!useSecondaryPhoto)}
                          className="px-3 py-1.5 bg-[#1F0620]/90 hover:bg-[#4A1249] text-white text-[10px] font-black uppercase tracking-wider rounded-md border-2 border-[#C39A53] backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
                          title="Toggle between formal studio portrait and campus photograph"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#FCD34D]" />
                          <span>
                            {useSecondaryPhoto ? 'Show Formal Portrait' : 'Show Campus Photo'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Caption Under Photo (strict WCAG AAA high contrast typography) */}
                  {profile.imageCaption && (
                    <div className="mt-5 pt-4 border-t-2 border-purple-100 text-center space-y-1">
                      {profile.imageCaption.map((line, lidx) => (
                        <div
                          key={lidx}
                          className={
                            lidx === 0
                              ? 'text-sm sm:text-base font-collegiate font-black text-[#1F0620] tracking-wide uppercase'
                              : lidx === 1
                              ? 'text-xs font-black text-[#6E4908] uppercase tracking-wider'
                              : 'text-xs font-bold text-[#491E51]'
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actionable Branded Social Links Underneath Portrait */}
                  {profile.socialLinks && (profile.socialLinks.linkedin || profile.socialLinks.twitter || profile.socialLinks.website) && (
                    <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-center gap-2">
                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold shadow-xs hover:shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          title={`${profile.name} on LinkedIn`}
                        >
                          <LinkedInIcon className="w-3.5 h-3.5 fill-current" />
                          <span style={{ color: '#FFFFFF' }}>LinkedIn</span>
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F1419] hover:bg-black text-white text-xs font-bold shadow-xs hover:shadow transition-all hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer"
                          title={`${profile.name} on X (Twitter)`}
                        >
                          <TwitterXIcon className="w-3.5 h-3.5 fill-current" />
                          <span style={{ color: '#FFFFFF' }}>X (Twitter)</span>
                        </a>
                      )}
                      {profile.socialLinks.website && (
                        <a
                          href={profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#4A1249] hover:bg-[#661B69] text-white shadow-xs hover:shadow transition-all hover:scale-105 active:scale-95 border border-[#C39A53]/50 cursor-pointer"
                          title="Official Website / Portal"
                        >
                          <Globe className="w-4 h-4 text-[#FCD34D]" />
                        </a>
                      )}
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

      {/* ========================================================================= */}
      {/* 3. FLOATING COPY LINK FEEDBACK TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {copyFeedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F0620] text-white px-5 py-3.5 rounded-xl shadow-2xl border-2 border-[#C39A53] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-full bg-[#C39A53] flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-4 h-4 text-[#1F0620]" />
          </div>
          <div>
            <div className="text-xs font-collegiate font-black uppercase tracking-wider text-[#FCD34D]" style={{ color: '#FCD34D' }}>
              Profile Link Copied to Clipboard!
            </div>
            <div className="text-[11px] text-purple-100 font-medium">
              Direct link for {profile.name} is ready to paste and share.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
