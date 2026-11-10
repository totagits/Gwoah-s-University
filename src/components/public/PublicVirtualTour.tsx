import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Users,
  Video,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_PUBLIC_VIDEOS, type PublicVideo } from '../../data/publicMedia';

export interface TourVideoItem {
  id: string;
  name: string;
  shortName: string;
  campusName: string;
  category: 'campus' | 'computing';
  location: string;
  videoUrl: string;
  posterImage: string;
  badge: string;
  headline: string;
  description: string;
  stats: { label: string; value: string }[];
  highlights: string[];
  hotspots: { title: string; desc: string; icon: string }[];
}

// Exactly the two attached videos: Campus first, Classroom second
const TOUR_VIDEOS: TourVideoItem[] = [
  {
    id: 'hiau-campus-tour',
    name: 'Main University Academic Complex & Exterior Grounds',
    shortName: '01 • Campus Complex (Video 1)',
    campusName: 'HIAU Main Academic Campus',
    category: 'campus',
    location: 'Montserrado County, Republic of Liberia',
    videoUrl: '/assets/aistudio/image_20261105_121706_f720baa0.mp4',
    posterImage: '/assets/aistudio/image_29eb5504.png',
    badge: 'Video 1 • Campus First',
    headline: 'OFFICIAL ACADEMIC HEADQUARTERS, 2ND-FLOOR LECTURE HALLS & SURROUNDING QUADRANGLE',
    description:
      'Authentic tour video footage of Harvest Intercontinental American University’s main academic campus in Liberia. Highlighting the multi-story educational building, covered entrance portico, tropical grounds, student parking, and active undergraduate scholars discussing lecture facilities on the second floor.',
    stats: [
      { label: 'Tour Sequence', value: 'Video 01 (Campus)' },
      { label: 'Facility Type', value: 'Multi-Story Complex' },
      { label: 'Primary Brand', value: 'Purple, Gold & White' },
      { label: 'Accreditation', value: 'NCHE Chartered' },
    ],
    highlights: [
      'Multi-story university facility housing undergraduate lecture halls and administrative suites',
      'Covered entrance portico with official HIAU welcome gateway and registrar reception',
      'Second-floor lecture halls providing elevated classroom spaces with natural cross-ventilation',
      'Perimeter driveway with dedicated student, faculty, and visitor parking facilities',
      'Direct integration with Starlink high-speed satellite networks and solar power backups',
    ],
    hotspots: [
      {
        title: 'Second-Floor Lecture Rooms',
        desc: 'Spacious classrooms dedicated to undergraduate instruction across all academic colleges.',
        icon: 'building',
      },
      {
        title: 'Covered Portico Foyer',
        desc: 'Central entrance connecting students with academic advisors and departmental offices.',
        icon: 'shield',
      },
      {
        title: 'Tropical Campus Quadrangle',
        desc: 'Palm-lined grounds and secure student parking area.',
        icon: 'sparkles',
      },
    ],
  },
  {
    id: 'hiau-classroom-lab',
    name: 'Interactive Digital Computing Center & Smart Classroom',
    shortName: '02 • Smart Classroom (Video 2)',
    campusName: 'Technology & Instructional Wing',
    category: 'computing',
    location: 'Main Academic Complex, Room 102',
    videoUrl: '/assets/aistudio/image_20261105_102657_b174d32f.mp4',
    posterImage: '/assets/aistudio/image_51d124f3.png',
    badge: 'Video 2 • Classroom Second',
    headline: 'INDIVIDUAL LAPTOP WORKSTATIONS, INTERACTIVE PROJECTION & FACULTY INSTRUCTION',
    description:
      'Authentic operational video footage inside HIAU’s interactive computing laboratory and smart classroom. Students work at individual wooden carrels with dedicated laptops, conducting software design, data research, and coursework with ceiling-mounted multimedia projection and hands-on faculty mentorship.',
    stats: [
      { label: 'Tour Sequence', value: 'Video 02 (Classroom)' },
      { label: 'Workstations', value: 'Individual Carrels' },
      { label: 'Hardware', value: 'Dedicated Laptops' },
      { label: 'Instruction', value: 'Smart Projection' },
    ],
    highlights: [
      'Individual wooden student study carrels equipped with high-speed internet laptops',
      'Ceiling-mounted interactive projector displaying real-time lectures and coding walkthroughs',
      'Dedicated student workstations with personal electrical outlets for continuous study',
      'Hands-on faculty mentorship in computer science, business analytics, and STEM',
      'Quiet, air-conditioned smart instructional laboratory environment',
    ],
    hotspots: [
      {
        title: 'Individual Student Workstations',
        desc: 'Ergonomic carrels designed for focused programming, research, and coursework.',
        icon: 'cpu',
      },
      {
        title: 'Interactive Multimedia Projection',
        desc: 'Displays international curriculum, remote lectures, and technical diagrams.',
        icon: 'sparkles',
      },
      {
        title: 'Collaborative Cohort',
        desc: 'Scholars working collaboratively on digital research projects.',
        icon: 'users',
      },
    ],
  },
];

interface PublicVirtualTourProps {
  onOpenApplicationModal?: () => void;
  onOpenPortal?: (tab?: string) => void;
}

export const PublicVirtualTour: React.FC<PublicVirtualTourProps> = ({
  onOpenApplicationModal,
  onOpenPortal,
}) => {
  const [managedVideos, setManagedVideos] = useState<PublicVideo[]>(DEFAULT_PUBLIC_VIDEOS);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public-media/videos', { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Media unavailable')))
      .then((data: { videos?: PublicVideo[] }) => {
        if (Array.isArray(data.videos) &&
          data.videos.every(item => typeof item.src === 'string' && item.src.startsWith('/'))) {
          setManagedVideos(data.videos);
        }
      })
      .catch(() => { /* Keep existing videos if public media service is unavailable. */ });
    return () => controller.abort();
  }, []);
  const tourVideos: TourVideoItem[] = managedVideos
    .filter(video => video.status === 'published' && video.src)
    .sort((a, b) => a.order - b.order)
    .map((video, index) => {
      const template = TOUR_VIDEOS[index < 2 ? index : 0];
      return {
        ...template,
        id: video.id,
        name: video.title,
        shortName: video.label || video.title,
        badge: video.badge || 'HIAU Video',
        headline: video.title,
        description: video.subtitle,
        videoUrl: video.src,
        posterImage: video.poster,
        // New videos should not inherit campus-specific achievements and claims.
        stats: index < 2 ? template.stats : [],
        highlights: index < 2 ? template.highlights : [],
        hotspots: index < 2 ? template.hotspots : [],
        campusName: index < 2 ? template.campusName : 'University Media Library',
        location: index < 2 ? template.location : 'HIAU Liberia',
      };
    });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Dual video refs: keep both permanently mounted & preloaded to eliminate any blank gap
  const campusTourRef = useRef<HTMLVideoElement>(null);
  const classroomTourRef = campusTourRef;

  const currentVideo = tourVideos[selectedIndex] || tourVideos[0];

  // Seamless instant handoff between the two videos with crossfade
  const switchTourVideo = (nextIndex: number) => {
    if (nextIndex === selectedIndex) return;

    const incoming = campusTourRef.current;
    const outgoing = campusTourRef.current;

    if (incoming) {
      incoming.currentTime = 0;
      incoming.muted = isMuted;
      if (isPlaying) {
        incoming.play().catch(() => {});
      }
    }

    setSelectedIndex(nextIndex);

    // Pause outgoing video only after incoming crossfade completes to prevent blank gaps
    setTimeout(() => {
      if (outgoing && outgoing !== incoming) {
        outgoing.pause();
      }
    }, 750);
  };

  // Sync play / pause state to active video
  useEffect(() => {
    const current = campusTourRef.current;
    if (!current) return;
    if (isPlaying) {
      current.play().catch(() => {});
    } else {
      current.pause();
    }
  }, [isPlaying, selectedIndex]);

  // Sync mute state to both video elements
  useEffect(() => {
    if (campusTourRef.current) campusTourRef.current.muted = isMuted;
    if (classroomTourRef.current) classroomTourRef.current.muted = isMuted;
  }, [isMuted]);

  // Initial autoplay attempt on mount
  useEffect(() => {
    if (campusTourRef.current && isPlaying) {
      campusTourRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlayback = () => {
    const current = campusTourRef.current;
    if (!current) return;
    if (isPlaying) {
      current.pause();
      setIsPlaying(false);
    } else {
      current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (campusTourRef.current) campusTourRef.current.muted = nextMuted;
    if (classroomTourRef.current) classroomTourRef.current.muted = nextMuted;
  };

  const handleRestart = () => {
    const current = campusTourRef.current;
    if (!current) return;
    current.currentTime = 0;
    current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleNext = () => {
    switchTourVideo((selectedIndex + 1) % tourVideos.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    switchTourVideo((selectedIndex - 1 + tourVideos.length) % tourVideos.length);
    setIsPlaying(true);
  };

  if (!currentVideo) {
    return <section id="tour" className="py-16 text-center text-[#4A1249]">
      <h2 className="text-2xl font-bold">University Video Library</h2>
      <p>No public videos have been published yet.</p>
    </section>;
  }

  return (
    <section id="tour" className="py-16 bg-[#FAF8FB] border-b border-purple-100 text-[#2E0F34] relative overflow-hidden">
      {/* Background Subtle HIAU Purple & Gold Geometry */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4A1249]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C39A53]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Collegiate Typography in HIAU Imperial Purple & Gold */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-purple-200/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4A1249] text-[#C39A53] shadow-xs">
                <Video className="w-3.5 h-3.5 text-[#C39A53]" />
                Continuous Video Stream Carousel
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF4E8] text-[#A17A32] border border-[#C39A53]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#C39A53]" />
                Zero-Gap Continuous Flow
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-collegiate font-black text-[#4A1249] uppercase tracking-tight leading-tight">
              EXPLORE OUR REAL CAMPUS & SMART CLASSROOM
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mt-1.5 leading-relaxed">
              Watch authentic video footage of Harvest Intercontinental American University in Liberia: flowing continuously from our multi-story main campus building to our interactive laptop laboratory and smart classroom.
            </p>
          </div>

          {/* Tour Status Chip */}
          <div className="bg-white px-4 py-2.5 rounded-lg border border-purple-200 shadow-sm shrink-0 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#C39A53] animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-[#4A1249] block">Continuous Video Flow</span>
              <span className="text-slate-500 font-mono text-[11px]">Campus (01) & Classroom (02)</span>
            </div>
          </div>
        </div>

        {/* 2-Slide Video Carousel Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {tourVideos.map((video, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={video.id}
                onClick={() => {
                  switchTourVideo(idx);
                  setIsPlaying(true);
                }}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-white border-[#C39A53] shadow-lg ring-2 ring-[#C39A53]/50'
                    : 'bg-white/80 hover:bg-white border-purple-200 hover:border-purple-300 shadow-xs'
                }`}
              >
                {/* Active Indicator Top Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 transition-all ${
                    isSelected ? 'bg-[#C39A53]' : 'bg-transparent group-hover:bg-purple-200'
                  }`}
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#4A1249] text-[#C39A53]'
                          : 'bg-purple-50 text-purple-700 group-hover:bg-purple-100'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-[#C39A53]">
                          {video.badge}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C39A53]/20 text-[#A17A32]">
                            Now Playing
                          </span>
                        )}
                      </div>
                      <span
                        className={`block text-sm sm:text-base font-collegiate font-bold uppercase tracking-tight truncate ${
                          isSelected ? 'text-[#4A1249]' : 'text-slate-800'
                        }`}
                      >
                        {video.name}
                      </span>
                      <span className="block text-xs text-slate-500 truncate mt-0.5">
                        {video.campusName} • {video.location}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md ${
                        isSelected
                          ? 'bg-[#4A1249] text-[#C39A53]'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-[#4A1249]'
                      }`}
                    >
                      <span>Watch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Video Carousel Showcase in HIAU Imperial Purple & Heritage Gold */}
        <div className="bg-white rounded-xl border border-purple-200/80 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Video Showcase with hero-diagonal-clip & Diagonal Gold Accent Strip */}
            <div className="lg:col-span-7 relative bg-[#2A082C] min-h-[380px] sm:min-h-[460px] lg:min-h-[580px] flex flex-col justify-between overflow-hidden">
              {/* Dual Preloaded HTML5 Video Elements for Continuous Zero-Gap Playback */}
              <div className="absolute inset-0 w-full h-full hero-diagonal-clip overflow-hidden bg-black">
                {currentVideo && <video
                  key={currentVideo.id + currentVideo.videoUrl}
                  ref={campusTourRef} src={currentVideo.videoUrl}
                  poster={currentVideo.posterImage}
                  preload="metadata" muted={isMuted} playsInline
                  onEnded={() => switchTourVideo((selectedIndex + 1) % tourVideos.length)}
                  className="absolute inset-0 w-full h-full object-cover"
                />}
                {/* Dynamic Vignette & Purple Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082C]/90 via-transparent to-black/30 pointer-events-none z-10" />
              </div>

              {/* Diagonal Accent Divider Slash on Desktop (HIAU Heritage Gold Line) */}
              <div className="hidden lg:block absolute -top-2 -bottom-2 -right-4 w-12 bg-white transform skew-x-[-12deg] border-l-4 border-[#C39A53] z-20 pointer-events-none" />

              {/* Top Video Overlays: Badge & Location Tag */}
              <div className="relative z-20 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="bg-[#4A1249]/95 text-[#C39A53] border border-[#C39A53]/60 px-3.5 py-1.5 rounded text-xs font-collegiate font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-2 shadow-lg">
                    <Video className="w-3.5 h-3.5 text-[#C39A53]" />
                    <span>{currentVideo.badge}</span>
                  </span>
                </div>

                <div className="bg-black/65 backdrop-blur-md text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 border border-white/20">
                  <MapPin className="w-3.5 h-3.5 text-[#C39A53]" />
                  <span>{currentVideo.location}</span>
                </div>
              </div>

              {/* Interactive Video Hotspots & Controls on Video Player */}
              <div className="relative z-20 p-5 sm:p-6">
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C39A53] bg-[#2A082C]/90 px-2.5 py-1 rounded border border-[#C39A53]/40 backdrop-blur-md">
                    Featured Infrastructure in Video
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentVideo.hotspots.map((hs, i) => (
                    <div
                      key={i}
                      className="bg-[#2A082C]/90 hover:bg-[#4A1249] text-white p-2.5 rounded-lg border border-[#C39A53]/30 backdrop-blur-md transition-all hover:border-[#C39A53]"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#C39A53] mb-1">
                        {hs.icon === 'shield' && <ShieldCheck className="w-3.5 h-3.5 text-[#C39A53]" />}
                        {hs.icon === 'building' && <Building2 className="w-3.5 h-3.5 text-[#C39A53]" />}
                        {hs.icon === 'users' && <Users className="w-3.5 h-3.5 text-[#C39A53]" />}
                        {hs.icon === 'cpu' && <Cpu className="w-3.5 h-3.5 text-[#C39A53]" />}
                        {hs.icon === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-[#C39A53]" />}
                        <span className="truncate">{hs.title}</span>
                      </div>
                      <p className="text-[11px] text-purple-100 line-clamp-2 leading-tight">
                        {hs.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom Media Controls: Play/Pause, Mute, Replay, Prev / Next */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/15">
                  <div className="flex items-center gap-2">
                    {/* Play / Pause */}
                    <button
                      onClick={togglePlayback}
                      className="h-9 px-3.5 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center gap-1.5 backdrop-blur-md border border-[#C39A53]/60 text-xs font-bold cursor-pointer transition-transform active:scale-95 shadow-md"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 text-[#C39A53]" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-[#C39A53] ml-0.5" />
                          <span>Play</span>
                        </>
                      )}
                    </button>

                    {/* Audio Mute / Unmute */}
                    <button
                      onClick={toggleMute}
                      className="h-9 px-3 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center gap-1.5 backdrop-blur-md border border-[#C39A53]/60 text-xs font-medium cursor-pointer transition-transform active:scale-95 shadow-md"
                      aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                      title={isMuted ? 'Unmute audio' : 'Mute audio'}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-[#C39A53]" />
                          <span className="hidden sm:inline">Unmute</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#C39A53]" />
                          <span className="hidden sm:inline">Audio On</span>
                        </>
                      )}
                    </button>

                    {/* Replay */}
                    <button
                      onClick={handleRestart}
                      className="w-9 h-9 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center justify-center backdrop-blur-md border border-[#C39A53]/60 cursor-pointer active:scale-95 shadow-md"
                      aria-label="Restart video"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#C39A53]" />
                    </button>

                    <span className="text-white/80 text-xs font-mono ml-1">
                      Video {selectedIndex + 1} of {tourVideos.length}
                    </span>
                  </div>

                  {/* Previous / Next Slide Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrev}
                      className="w-9 h-9 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center justify-center backdrop-blur-md border border-[#C39A53]/60 cursor-pointer active:scale-95 shadow-md"
                      aria-label="Previous video (Campus first)"
                      title="Previous video"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#C39A53]" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-9 h-9 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center justify-center backdrop-blur-md border border-[#C39A53]/60 cursor-pointer active:scale-95 shadow-md"
                      aria-label="Next video (Classroom second)"
                      title="Next video"
                    >
                      <ChevronRight className="w-4 h-4 text-[#C39A53]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Information & Educational Specifications Panel */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
              <div className="space-y-6">
                {/* Title & Subheading in HIAU Purple & Gold */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-collegiate font-bold text-[#C39A53] tracking-widest uppercase mb-1">
                    <span>{currentVideo.campusName}</span>
                    <span>•</span>
                    <span>Verified HIAU Video Facility</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-collegiate font-black text-[#4A1249] uppercase tracking-tight leading-tight">
                    {currentVideo.name}
                  </h3>
                  <p className="text-xs font-collegiate font-bold text-[#C39A53] tracking-wide uppercase mt-1">
                    {currentVideo.headline}
                  </p>
                </div>

                {/* Descriptive Body */}
                <p className="text-slate-700 text-sm leading-relaxed">
                  {currentVideo.description}
                </p>

                {/* Key Facility Highlights Checklist */}
                <div className="space-y-2 bg-[#FAF4FB] p-4 rounded-lg border border-purple-200">
                  <div className="text-xs font-bold text-[#4A1249] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#4A1249]" />
                    <span>Verified Video Infrastructure</span>
                  </div>
                  {currentVideo.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4A1249] shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                {/* Numerical Metric Highlights Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {currentVideo.stats.map((st, i) => (
                    <div
                      key={i}
                      className="bg-white border border-purple-200 border-l-4 border-l-[#C39A53] p-3 rounded shadow-xs"
                    >
                      <div className="font-collegiate font-black text-xl text-[#4A1249] leading-none">
                        {st.value}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons & In-Person Visit Invitation */}
              <div className="pt-6 mt-6 border-t border-purple-100 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenApplicationModal}
                  className="flex-1 min-w-[170px] px-5 py-3 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-collegiate font-black text-xs uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
                >
                  <span>SCHEDULE CAMPUS VISIT</span>
                  <ArrowRight className="w-4 h-4 text-[#2A082C]" />
                </button>

                {onOpenPortal && (
                  <button
                    onClick={() => onOpenPortal('facilities')}
                    className="px-4 py-3 bg-[#4A1249] hover:bg-[#661B69] text-white font-collegiate font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C39A53]/50 hover:shadow-md"
                    title="Submit repair work order for this campus facility"
                  >
                    <span>CAMPUS FACILITIES (ERP)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NCHE Statutory Compliance & Institutional Ribbon */}
        <div className="mt-8 bg-white border border-purple-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4A1249] text-[#C39A53] rounded">
              <ShieldCheck className="w-5 h-5 text-[#C39A53]" />
            </div>
            <div>
              <span className="font-bold text-[#4A1249] block">
                Statutory University Infrastructure Standards
              </span>
              <span className="text-slate-500 block">
                All shown physical facilities satisfy National Commission on Higher Education (NCHE) spatial, laboratory, and instructional benchmarks.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#4A1249] font-bold shrink-0">
            <span>Verified Campus Facilities • Republic of Liberia</span>
          </div>
        </div>
      </div>
    </section>
  );
};
