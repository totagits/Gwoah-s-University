import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play, Volume2, VolumeX, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { DEFAULT_PUBLIC_VIDEOS, featuredPublicVideos, type PublicVideo } from '../../data/publicMedia';

interface PublicHeroProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenApplicationModal: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  onNavigateSection, onOpenApplicationModal,
}) => {
  const [library, setLibrary] = useState<PublicVideo[]>(DEFAULT_PUBLIC_VIDEOS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const player = useRef<HTMLVideoElement>(null);
  const featured = featuredPublicVideos(library);
  const items = featured.length ? featured : [];
  const current = items[Math.min(activeIndex, items.length - 1)];

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public-media/videos', { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Media API unavailable')))
      .then((body: { videos?: PublicVideo[] }) => {
        if (Array.isArray(body.videos)) {
          setLibrary(body.videos);
          setActiveIndex(0);
        }
      }).catch(() => { /* Bundled campus and classroom videos are safe fallbacks. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const video = player.current;
    if (!video || !current) return;
    video.muted = muted;
    if (playing) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [current?.id, current?.src, muted, playing]);

  function changeIndex(index: number) {
    if (!items.length) return;
    setActiveIndex((index + items.length) % items.length);
    setPlaying(true);
  }

  return (
    <div className="relative w-full bg-white text-[#4A1249] overflow-hidden border-b border-purple-100">
      <div className="relative w-full min-h-[580px] lg:min-h-[620px] xl:min-h-[680px] flex flex-col justify-center">
        <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-[53%] xl:w-[52%] w-full h-84 sm:h-96 lg:h-full relative overflow-hidden z-10 bg-[#2A082C]">
          {current ? <video
            key={current.id + current.src} ref={player} src={current.src} poster={current.poster}
            preload="metadata" muted={muted} autoPlay={playing} playsInline
            onEnded={() => changeIndex(activeIndex + 1)}
            className="absolute inset-0 w-full h-full object-cover"
          /> : <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
            New university videos will appear here when published and featured.
          </div>}
          <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-1.5 bg-[#C39A53] z-20 pointer-events-none" />
          {current && <>
            <div className="absolute top-4 left-4 z-20 bg-[#4A1249]/90 text-[#C39A53] border border-[#C39A53]/70 px-3 py-1 rounded text-xs font-bold flex items-center gap-2">
              <Video className="w-4 h-4" />{current.badge || 'HIAU Featured Video'}
            </div>
            <div className="absolute bottom-4 left-4 right-8 z-20 space-y-3">
              <div className="bg-[#2A082C]/85 text-white p-3 rounded max-w-sm">
                <strong className="block text-[#C39A53] text-xs">{current.title}</strong>
                <span className="block text-xs">{current.subtitle}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause video' : 'Play video'}
                  className="rounded-full p-2 bg-[#4A1249] text-[#C39A53]">{playing ? <Pause /> : <Play />}</button>
                <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute' : 'Mute'}
                  className="rounded-full p-2 bg-[#4A1249] text-[#C39A53]">{muted ? <VolumeX /> : <Volume2 />}</button>
                <button onClick={() => changeIndex(activeIndex - 1)} aria-label="Previous video"
                  className="rounded-full p-2 bg-[#4A1249] text-[#C39A53]"><ChevronLeft /></button>
                <button onClick={() => changeIndex(activeIndex + 1)} aria-label="Next video"
                  className="rounded-full p-2 bg-[#4A1249] text-[#C39A53]"><ChevronRight /></button>
                <span className="text-white text-xs bg-[#2A082C]/90 px-2 py-1 rounded">{activeIndex + 1} / {items.length}</span>
              </div>
              <div className="flex gap-1 overflow-x-auto max-w-full">
                {items.map((item, index) => (
                  <button key={item.id} onClick={() => changeIndex(index)}
                    aria-label={'Show ' + item.title}
                    className={`shrink-0 px-3 py-1 text-xs font-bold rounded ${index === activeIndex ? 'bg-[#C39A53] text-[#2A082C]' : 'bg-[#2A082C] text-white'}`}>
                    {item.label || item.title}
                  </button>
                ))}
              </div>
            </div>
          </>}
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 relative z-20 pointer-events-none">
          <div className="lg:w-1/2 lg:ml-auto lg:pl-10 xl:pl-16 space-y-6 text-left pointer-events-auto">
            <h1 className="font-collegiate font-black text-5xl sm:text-6xl lg:text-7xl xl:text-[84px] text-[#4A1249] tracking-tight leading-[0.92] uppercase">
              HARVEST UNIVERSITY <span className="block">IN LIBERIA</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl">
              Our Liberia location is preparing career-ready students for the challenges and opportunities of tomorrow.
              Strong academic excellence, Christ-centered leadership, and global standards accelerate hands-on learning,
              technological research, and community service across Liberia.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button onClick={onOpenApplicationModal}
                className="px-8 py-4 bg-[#C39A53] text-[#2A082C] font-collegiate font-black text-sm uppercase flex items-center gap-3">
                BECOME A STUDENT <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigateSection('colleges')}
                className="px-8 py-4 bg-[#4A1249] text-white font-collegiate font-black text-sm uppercase flex items-center gap-3">
                EXPLORE DEGREE PROGRAMS <ArrowRight className="w-4 h-4 text-[#C39A53]" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#C39A53] text-[#2A082C] py-7 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-collegiate font-black uppercase">
          Take your next giant leap in Liberia with Harvest Intercontinental American University
        </h2>
      </div>
    </div>
  );
};
