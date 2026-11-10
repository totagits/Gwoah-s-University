import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Video,
} from 'lucide-react';
import { DEFAULT_PUBLIC_VIDEOS, type PublicVideo } from '../../data/publicMedia';

interface PublicHeroProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenApplicationModal: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  onOpenPortal: _onOpenPortal,
  onNavigateSection,
  onOpenApplicationModal,
}) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [heroVideos, setHeroVideos] = useState<PublicVideo[]>(DEFAULT_PUBLIC_VIDEOS);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public-media/videos', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Media unavailable')))
      .then((payload: { videos?: PublicVideo[] }) => {
        if (Array.isArray(payload.videos) &&
          payload.videos.length === 2 &&
          payload.videos[0]?.id === 'campus' &&
          payload.videos[1]?.id === 'classroom' &&
          payload.videos.every((video) => typeof video.src === 'string' && video.src.startsWith('/'))) {
          setHeroVideos(payload.videos);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.warn('Using default public videos:', error);
      });
    return () => controller.abort();
  }, []);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Dual video refs: keep both permanently mounted & preloaded to eliminate any blank gap
  const campusVideoRef = useRef<HTMLVideoElement>(null);
  const classroomVideoRef = useRef<HTMLVideoElement>(null);

  const currentVideo = heroVideos[activeVideoIndex];

  // Seamless instant handoff between the two videos with crossfade
  const switchVideo = (nextIndex: number) => {
    if (nextIndex === activeVideoIndex) return;

    const incoming = nextIndex === 0 ? campusVideoRef.current : classroomVideoRef.current;
    const outgoing = activeVideoIndex === 0 ? campusVideoRef.current : classroomVideoRef.current;

    if (incoming) {
      incoming.currentTime = 0;
      incoming.muted = isMuted;
      if (isPlaying) {
        incoming.play().catch(() => {});
      }
    }

    setActiveVideoIndex(nextIndex);

    // Pause outgoing video only after incoming crossfade completes to prevent blank gaps
    setTimeout(() => {
      if (outgoing && outgoing !== incoming) {
        outgoing.pause();
      }
    }, 750);
  };

  // Sync play / pause state to active video
  useEffect(() => {
    const current = activeVideoIndex === 0 ? campusVideoRef.current : classroomVideoRef.current;
    if (!current) return;
    if (isPlaying) {
      current.play().catch(() => {});
    } else {
      current.pause();
    }
  }, [isPlaying, activeVideoIndex]);

  // Sync mute state to both video elements
  useEffect(() => {
    if (campusVideoRef.current) campusVideoRef.current.muted = isMuted;
    if (classroomVideoRef.current) classroomVideoRef.current.muted = isMuted;
  }, [isMuted]);

  // Initial autoplay attempt on mount
  useEffect(() => {
    if (campusVideoRef.current && isPlaying) {
      campusVideoRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlayback = () => {
    const current = activeVideoIndex === 0 ? campusVideoRef.current : classroomVideoRef.current;
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
    if (campusVideoRef.current) campusVideoRef.current.muted = nextMuted;
    if (classroomVideoRef.current) classroomVideoRef.current.muted = nextMuted;
  };

  const handleNextVideo = () => {
    switchVideo((activeVideoIndex + 1) % heroVideos.length);
    setIsPlaying(true);
  };

  const handlePrevVideo = () => {
    switchVideo((activeVideoIndex - 1 + heroVideos.length) % heroVideos.length);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full bg-white text-[#4A1249] overflow-hidden border-b border-purple-100">
      {/* HIAU Full-Bleed Edge-to-Edge Diagonal Split Hero */}
      <div className="relative w-full min-h-[580px] lg:min-h-[620px] xl:min-h-[680px] flex flex-col justify-center bg-white">
        {/* Left Column: Full-Bleed Carousel Video to Left Edge with Signature Slanted Cut */}
        <div
          className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-[53%] xl:w-[52%] w-full h-84 sm:h-96 lg:h-full relative overflow-hidden z-10 bg-[#2A082C]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)',
          }}
        >
          {/* Video 0: Campus Complex (Preloaded & Always Mounted for Seamless Crossfade) */}
          <video
            ref={campusVideoRef}
            src={heroVideos[0].src}
            poster={heroVideos[0].poster}
            preload="auto"
            muted={isMuted}
            playsInline
            onEnded={() => switchVideo(1)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              activeVideoIndex === 0 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          />

          {/* Video 1: Smart Classroom & Lab (Preloaded & Always Mounted for Seamless Crossfade) */}
          <video
            ref={classroomVideoRef}
            src={heroVideos[1].src}
            poster={heroVideos[1].poster}
            preload="auto"
            muted={isMuted}
            playsInline
            onEnded={() => switchVideo(0)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              activeVideoIndex === 1 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          />

          {/* Diagonal HIAU Heritage Gold Accent Slash (Exact Slanted Divider Line) */}
          <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-1.5 bg-[#C39A53] shadow-md z-20 pointer-events-none" />

          {/* Top Video Overlay: Slide Indicator & Continuous Stream Badge */}
          <div className="absolute top-4 left-4 right-12 z-20 flex items-center justify-between pointer-events-none">
            <span className="bg-[#4A1249]/90 text-[#C39A53] border border-[#C39A53]/70 px-3 py-1 rounded text-xs font-collegiate font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Video className="w-3.5 h-3.5 text-[#C39A53]" />
              <span>{currentVideo.badge}</span>
            </span>
          </div>

          {/* Bottom Video Information & Carousel Controls */}
          <div className="absolute bottom-4 left-4 right-8 z-20 flex flex-col gap-2.5">
            {/* Video Caption Card */}
            <div className="bg-[#2A082C]/85 backdrop-blur-md border border-[#C39A53]/40 p-2.5 rounded-lg text-white max-w-sm hidden sm:block">
              <span className="text-xs font-collegiate font-bold text-[#C39A53] uppercase tracking-wide block truncate">
                {currentVideo.title}
              </span>
              <span className="text-[11px] text-purple-100 block truncate mt-0.5">
                {currentVideo.subtitle}
              </span>
            </div>

            {/* Bottom Controls Bar: Prev / Play-Pause / Next / Mute & 01/02 Selectors */}
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle Button */}
              <button
                onClick={togglePlayback}
                className="w-9 h-9 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center justify-center backdrop-blur-md border border-[#C39A53]/70 shadow-lg cursor-pointer transition-transform active:scale-95"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                title={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-[#C39A53]" />
                ) : (
                  <Play className="w-4 h-4 text-[#C39A53] ml-0.5" />
                )}
              </button>

              {/* Audio Mute / Unmute Toggle Button */}
              <button
                onClick={toggleMute}
                className="w-9 h-9 rounded-full bg-[#4A1249]/90 hover:bg-[#4A1249] text-white flex items-center justify-center backdrop-blur-md border border-[#C39A53]/70 shadow-lg cursor-pointer transition-transform active:scale-95"
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#C39A53]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#C39A53]" />
                )}
              </button>

              {/* Prev / Next Video Carousel Switchers */}
              <div className="flex items-center gap-1 bg-[#2A082C]/80 backdrop-blur-md p-1 rounded-full border border-[#C39A53]/50">
                <button
                  onClick={handlePrevVideo}
                  className="w-7 h-7 rounded-full bg-[#4A1249] hover:bg-[#661B69] text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  aria-label="Previous video (Campus)"
                  title="Previous video"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#C39A53]" />
                </button>
                <button
                  onClick={handleNextVideo}
                  className="w-7 h-7 rounded-full bg-[#4A1249] hover:bg-[#661B69] text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  aria-label="Next video (Classroom)"
                  title="Next video"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C39A53]" />
                </button>
              </div>

              {/* 2-Slide Tabs (01 Campus / 02 Classroom) */}
              <div className="flex items-center gap-1.5 ml-1">
                {heroVideos.map((vid, idx) => {
                  const isActive = activeVideoIndex === idx;
                  return (
                    <button
                      key={vid.id}
                      onClick={() => {
                        switchVideo(idx);
                        setIsPlaying(true);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-collegiate font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C39A53] text-[#2A082C] shadow-md ring-1 ring-[#C39A53]'
                          : 'bg-[#2A082C]/80 text-purple-200 hover:text-white hover:bg-[#4A1249] border border-white/20'
                      }`}
                    >
                      {vid.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Canvas in HIAU Imperial Purple & Gold */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 relative z-20">
          <div className="lg:w-1/2 lg:ml-auto lg:pl-10 xl:pl-16 space-y-6 text-left">
            {/* HIAU Brand Headline in Imperial Purple */}
            <h1 className="font-collegiate font-black text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] text-[#4A1249] tracking-tight leading-[0.92] uppercase">
              HARVEST UNIVERSITY <br />
              <span className="text-[#4A1249]">IN LIBERIA</span>
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl font-normal">
              Our Liberia location is preparing career-ready students for the challenges and opportunities of tomorrow. Strong academic excellence, Christ-centered leadership, and global standards accelerate hands-on learning opportunities, technological research, and community service across Liberia.
            </p>

            {/* Dual Rectangular CTA Buttons in Authentic HIAU Brand Colors (Purple & Gold) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenApplicationModal}
                className="px-8 py-4 bg-[#C39A53] hover:bg-[#DDB86C] text-[#2A082C] font-collegiate font-black text-sm uppercase tracking-wider rounded-none shadow-sm transition-all flex items-center gap-3 cursor-pointer hover:shadow-md active:scale-98"
              >
                <span>BECOME A STUDENT</span>
                <ArrowRight className="w-4 h-4 text-[#2A082C]" />
              </button>

              <button
                onClick={() => onNavigateSection('colleges')}
                className="px-8 py-4 bg-[#4A1249] hover:bg-[#661B69] text-white font-collegiate font-black text-sm uppercase tracking-wider rounded-none shadow-sm transition-all flex items-center gap-3 cursor-pointer hover:shadow-md active:scale-98 border border-[#C39A53]/40"
              >
                <span>EXPLORE DEGREE PROGRAMS</span>
                <ArrowRight className="w-4 h-4 text-[#C39A53]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width HIAU Heritage Gold Banner Strip */}
      <div className="bg-[#C39A53] text-[#2A082C] py-7 px-4 sm:px-6 lg:px-8 border-t border-[#A17A32]/40">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-collegiate font-black uppercase tracking-tight text-[#2A082C]">
            Take your next giant leap in Liberia with Harvest Intercontinental American University
          </h2>
        </div>
      </div>
    </div>
  );
};
