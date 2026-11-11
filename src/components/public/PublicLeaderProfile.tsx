import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Camera, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, GraduationCap, Link2, Search, Users, X } from 'lucide-react';
import {
  LEADERSHIP_PROFILES,
  LEADER_GROUPS,
  resolveLeaderProfile,
  type LeaderProfile,
} from '../../data/leadershipData';

interface PublicLeaderProfileProps {
  profileId: string;
  onClose: () => void;
  onSelectProfile: (id: string) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenApplicationModal?: () => void;
}

type Section = 'biography' | 'qualifications' | 'publications' | 'responsibilities';
const categories = ['All', ...LEADER_GROUPS.map(group => group.category)] as const;
const directoryMembers = LEADER_GROUPS.flatMap(group => group.members);

const initials = (name: string) =>
  name.replace(/^(bishop|dr\.?|asst\.?|prof\.?|rev\.?|hon\.?|cllr\.?|mr\.?|ms\.?)\s+/gi, '')
    .split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');

export const PublicLeaderProfile: React.FC<PublicLeaderProfileProps> = ({
  profileId, onClose, onSelectProfile, onNavigateSection,
}) => {
  const resolvedProfile = resolveLeaderProfile(profileId);
  // Unknown or obsolete public links must never display another official's
  // biography as though it were the requested profile.
  const profile: LeaderProfile | undefined = resolvedProfile;
  const [section, setSection] = useState<Section>('biography');
  const [showDirectory, setShowDirectory] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [showSecondary, setShowSecondary] = useState(false);
  const [portraitUnavailable, setPortraitUnavailable] = useState(false);
  const [avatarFailures, setAvatarFailures] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setSection('biography');
    setShowDirectory(false);
    setShowSecondary(false);
    setPortraitUnavailable(false);
    setLinkCopied(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [profileId]);

  const index = directoryMembers.findIndex(member => member.id === profile.id);
  const prev = index > 0 ? directoryMembers[index - 1] : null;
  const next = index >= 0 && index < directoryMembers.length - 1 ? directoryMembers[index + 1] : null;
  const visibleGroups = LEADER_GROUPS
    .filter(group => category === 'All' || group.category === category)
    .map(group => ({
      ...group,
      members: group.members.filter(member =>
        [member.name, member.role, member.badge].some(value => value.toLowerCase().includes(query.trim().toLowerCase()))),
    }))
    .filter(group => group.members.length > 0);

  const hasQualifications = Boolean(profile.education?.length);
  const hasPublications = Boolean(profile.publications?.length);
  const hasResponsibilities = Boolean(profile.strategicMandates?.length || profile.keyOffices?.length);
  const tabs: Array<{ id: Section; label: string }> = [
    { id: 'biography', label: 'Biography' },
    ...(hasQualifications ? [{ id: 'qualifications' as Section, label: 'Qualifications' }] : []),
    ...(hasPublications ? [{ id: 'publications' as Section, label: 'Publications' }] : []),
    ...(hasResponsibilities ? [{ id: 'responsibilities' as Section, label: 'Responsibilities' }] : []),
  ];

  const shareProfile = async () => {
    const url = new URL(window.location.href);
    url.hash = `leader=${profile.id}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
    } catch {
      // Clipboard permissions may be denied; provide a usable link in the UI.
      window.prompt('Copy this profile link:', url.toString());
    }
  };

  const imageSrc = showSecondary && profile.secondaryImage ? profile.secondaryImage : profile.image;
  const socialLinks = [
    profile.socialLinks?.linkedin && { label: 'LinkedIn', href: profile.socialLinks.linkedin },
    profile.socialLinks?.twitter && { label: 'X', href: profile.socialLinks.twitter },
    profile.socialLinks?.website && { label: 'Official website', href: profile.socialLinks.website },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  if (!profile) {
    return (
      <main className="min-h-[45vh] bg-[#FAF9FB] px-6 py-16 text-[#28192B]">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#E7DDE7] bg-white p-8">
          <h1 className="text-2xl font-bold text-[#4A1249]">Leadership profile unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            This profile link could not be matched to the published university leadership directory.
          </p>
          <button type="button" onClick={() => { onClose(); onNavigateSection('about'); }}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white">
            <ArrowLeft className="h-4 w-4" /> Return to leadership directory
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9FB] text-[#28192B]">
      {/* Institutional section heading, rather than a second competing portrait banner. */}
      <header className="border-b border-[#E7DDE7] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A1249] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to university website
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowDirectory(open => !open)}
                aria-expanded={showDirectory} aria-controls="hiau-leadership-directory"
                className="inline-flex items-center gap-2 rounded-md border border-[#DAD1DE] bg-white px-3 py-2 text-sm font-semibold text-[#4A1249] hover:bg-[#F6F0F6]">
                <Users className="h-4 w-4" /> Leadership directory
                <ChevronDown className={`h-4 w-4 transition-transform ${showDirectory ? 'rotate-180' : ''}`} />
              </button>
              <button type="button" onClick={shareProfile}
                className="inline-flex items-center gap-2 rounded-md bg-[#4A1249] px-3 py-2 text-sm font-semibold text-white hover:bg-[#672066]">
                <Link2 className="h-4 w-4" /> {linkCopied ? 'Link copied' : 'Share profile'}
              </button>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#986F2F]">Harvest Intercontinental American University</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#4A1249] sm:text-3xl">University leadership</h1>
          </div>
        </div>
      </header>

      {showDirectory && (
        <section id="hiau-leadership-directory" aria-label="Leadership directory"
          className="border-b border-[#E7DDE7] bg-white">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#745F75]" />
                <span className="sr-only">Search university leaders</span>
                <input type="search" value={query} onChange={event => setQuery(event.target.value)}
                  placeholder="Search leadership by name or office"
                  className="w-full rounded-md border border-[#DAD1DE] bg-white py-2 pl-10 pr-4 text-sm text-[#28192B] outline-offset-2 focus:outline-[#4A1249]" />
              </label>
              <label>
                <span className="sr-only">Filter leaders by category</span>
                <select value={category} onChange={event => setCategory(event.target.value)}
                  className="max-w-full rounded-md border border-[#DAD1DE] bg-white px-3 py-2 text-sm text-[#28192B]">
                  {categories.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setShowDirectory(false)} aria-label="Close directory"
                className="rounded-md p-2 text-[#4A1249] hover:bg-[#F6F0F6]"><X className="h-5 w-5" /></button>
            </div>
            {visibleGroups.length === 0 && <p className="text-sm text-slate-600">No matching leaders found.</p>}
            {visibleGroups.map(group => (
              <div key={group.category}>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#755279]">{group.category}</h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map(member => (
                    <button type="button" key={member.id} onClick={() => {
                      onSelectProfile(member.id);
                      setShowDirectory(false);
                    }} aria-current={member.id === profile.id ? 'page' : undefined}
                      className={`flex min-w-0 items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors hover:border-[#A17A32] hover:bg-[#FCF9F3] ${member.id === profile.id ? 'border-[#C39A53] bg-[#FAF4E8]' : 'border-[#E7DDE7] bg-white'}`}>
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4A1249] text-xs font-bold text-white">
                        <span aria-hidden="true">{initials(member.name)}</span>
                        {!avatarFailures.includes(member.id) && (
                          <img alt="" src={member.avatar} loading="lazy" decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-top"
                            onError={() => setAvatarFailures(ids => [...ids, member.id])} />
                        )}
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#28192B]">{member.name}</span>
                        <span className="block truncate text-xs text-slate-600">{member.role}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Clear portrait/title hierarchy. The photograph is never covered by badges or gradients. */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(250px,320px)_minmax(0,1fr)] lg:gap-12">
          <div className="mx-auto w-full max-w-[360px] lg:mx-0">
            <figure className="overflow-hidden rounded-lg border border-[#E2DEE5] bg-white shadow-[0_12px_28px_-18px_rgba(35,14,40,0.30)]">
              <div className="relative aspect-[3/4] bg-[#F0EEF2]">
                {portraitUnavailable ? (
                  <div role="img" aria-label={`Official photograph unavailable for ${profile.name}`}
                    className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-[#4A1249]">
                    Official photograph unavailable
                  </div>
                ) : (
                  <img src={imageSrc} alt={`Portrait of ${profile.name}`}
                    className="h-full w-full object-cover object-top" decoding="async"
                    onError={() => {
                      if (!showSecondary && profile.secondaryImage && profile.secondaryImage !== profile.image) {
                        setShowSecondary(true);
                      } else setPortraitUnavailable(true);
                    }} />
                )}
              </div>
              <figcaption className="px-4 py-3 text-center">
                <p className="text-sm font-semibold text-[#4A1249]">{profile.name}</p>
                <p className="mt-1 text-xs text-slate-600">{profile.roleBadge}</p>
              </figcaption>
            </figure>
            {profile.secondaryImage && profile.secondaryImage !== profile.image && (
              <button type="button" onClick={() => {
                setPortraitUnavailable(false);
                setShowSecondary(value => !value);
              }} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#4A1249] hover:underline">
                <Camera className="h-4 w-4" /> {showSecondary ? 'View formal portrait' : 'View alternate photograph'}
              </button>
            )}
          </div>

          <div className="min-w-0">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#986F2F]">{profile.roleBadge}</p>
            <h2 className="max-w-3xl text-3xl font-bold leading-[1.12] tracking-tight text-[#35103B] sm:text-4xl xl:text-5xl">
              {profile.name}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700">{profile.subtitle}</p>
            {profile.kicker && <p className="mt-3 max-w-2xl text-sm font-semibold text-[#4A1249]">{profile.kicker}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {socialLinks.map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A1249] underline-offset-4 hover:underline">
                  {link.label} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            <div className="mt-8 border-b border-[#DDD6E0]">
              <div role="tablist" aria-label="Leadership profile information"
                className="-mb-px flex gap-5 overflow-x-auto">
                {tabs.map(tab => (
                  <button type="button" key={tab.id} role="tab"
                    id={`leader-tab-${tab.id}`}
                    aria-selected={section === tab.id}
                    aria-controls="leader-profile-panel"
                    onClick={() => setSection(tab.id)}
                    className={`shrink-0 border-b-[3px] pb-3 text-sm font-semibold transition-colors ${section === tab.id
                      ? 'border-[#4A1249] text-[#4A1249]' : 'border-transparent text-slate-600 hover:text-[#4A1249]'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <section id="leader-profile-panel" role="tabpanel" aria-labelledby={`leader-tab-${section}`}
              className="max-w-3xl space-y-5 py-7 text-base leading-[1.75] text-[#38313A]">
              {section === 'biography' && (
                <>
                  {profile.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                  {profile.quote && <blockquote className="border-l-[3px] border-[#C39A53] pl-5 text-[#4A1249] italic">{profile.quote}</blockquote>}
                </>
              )}
              {section === 'qualifications' && (
                <ul className="space-y-4">
                  {profile.education?.map((item, i) => <li key={i} className="flex items-start gap-3">
                    <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-[#986F2F]" /><span>{item}</span>
                  </li>)}
                </ul>
              )}
              {section === 'publications' && (
                <ul className="space-y-5">
                  {profile.publications?.map((item, i) => (
                    <li key={i} className="border-b border-[#E7DDE7] pb-4">
                      <p className="font-semibold text-[#4A1249]">{item.title}</p>
                      {(item.type || item.year || item.venue) &&
                        <p className="mt-1 text-sm text-slate-600">{[item.type, item.year, item.venue].filter(Boolean).join(' · ')}</p>}
                      {item.description && <p className="mt-2 text-sm">{item.description}</p>}
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#4A1249] hover:underline">
                        View publication <ExternalLink className="h-4 w-4" />
                      </a>}
                    </li>
                  ))}
                </ul>
              )}
              {section === 'responsibilities' && (
                <>
                  {profile.strategicMandates && profile.strategicMandates.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#4A1249]">
                        <BookOpen className="h-5 w-5" /> Strategic responsibilities
                      </h3>
                      <ul className="list-disc space-y-2 pl-6">{profile.strategicMandates.map((text,i)=><li key={i}>{text}</li>)}</ul>
                    </div>
                  )}
                  {profile.keyOffices && profile.keyOffices.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#4A1249]">
                        <BriefcaseBusiness className="h-5 w-5" /> Appointments and offices
                      </h3>
                      <ul className="list-disc space-y-2 pl-6">{profile.keyOffices.map((text,i)=><li key={i}>{text}</li>)}</ul>
                    </div>
                  )}
                </>
              )}
            </section>
            {profile.contactLiaison && (
              <div className="max-w-3xl border-t border-[#E7DDE7] pt-5 text-sm text-slate-600">
                <p className="font-semibold text-[#4A1249]">{profile.contactLiaison.office}</p>
                <p>{profile.contactLiaison.location}</p>
                {profile.contactLiaison.email && (
                  <a href={`mailto:${profile.contactLiaison.email}`} className="font-medium text-[#4A1249] hover:underline">
                    {profile.contactLiaison.email}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Browse university leadership"
          className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7DDE7] pt-6">
          {prev ? (
            <button type="button" onClick={() => onSelectProfile(prev.id)}
              className="inline-flex max-w-[48%] items-center gap-2 text-sm font-semibold text-[#4A1249] hover:underline">
              <ChevronLeft className="h-4 w-4 shrink-0" /> <span className="truncate">{prev.name}</span>
            </button>
          ) : <span />}
          {next ? (
            <button type="button" onClick={() => onSelectProfile(next.id)}
              className="inline-flex max-w-[48%] items-center gap-2 text-sm font-semibold text-[#4A1249] hover:underline">
              <span className="truncate">{next.name}</span> <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          ) : <span />}
        </nav>
        <button type="button" onClick={() => { onClose(); onNavigateSection('about'); }}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4A1249] hover:underline">
          About the university <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
};
