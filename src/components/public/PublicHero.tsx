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

interface PublicHeroProps {
  onOpenPortal: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenApplicationModal: () => void;
}

interface HeroVideoSlide {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  badge: string;
  label: string;
}

const HERO_VIDEOS: HeroVideoSlide[] = [
  {
    id: 'hero-campus',
    title: 'HIAU Main Academic Campus',
    subtitle: 'Exterior complex, 2nd-floor lecture halls & palm quadrangle',
    src: '/api/public/video/hero-campus',
    badge: 'Video 1 • Campus First',
    label: '01 Campus Tour',
  },
  {
    id: 'hero-classroom',
    title: 'Interactive Laptop Lab & Smart Classroom',
    subtitle: 'Individual wooden carrels, dedicated laptops & interactive projection',
    src: '/api/public/video/hero-classroom',
    badge: 'Video 2 • Classroom Second',
    label: '02 Smart Lab',
  },
];

export const PublicHero: React.FC<PublicHeroProps> = ({
  onOpenPortal: _onOpenPortal,
  onNavigateSection,
  onOpenApplicationModal,
}) => {
  const [videos,setVideos]=useState<HeroVideoSlide[]>(HERO_VIDEOS);
  const [activeVideoIndex,setActiveVideoIndex]=useState(0);
  const [isPlaying,setIsPlaying]=useState(true);
  const [isMuted,setIsMuted]=useState(true);
  const videoRefs=useRef(new Map<string,HTMLVideoElement>());
  const currentVideo=videos[activeVideoIndex]||videos[0];

  // No authenticated information is returned from this public, published-only listing.
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/public/hero-videos',{signal:controller.signal,cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Media listing unavailable')))
      .then(data=>{
        if(!Array.isArray(data.videos)||data.videos.length<2)return;
        const safe=data.videos.filter((v:HeroVideoSlide)=>
          typeof v.id==='string'&&typeof v.title==='string'&&
          typeof v.src==='string'&&v.src.startsWith('/api/public/video/')&&/^[a-z0-9_-]+$/.test(v.src.slice(18)));
        if(safe.length>=2){setVideos(safe);setActiveVideoIndex(0);}
      }).catch(()=>{/* Preserve two original videos if dynamic listing is unavailable. */});
    return ()=>controller.abort();
  },[]);

  const switchVideo=(index:number)=>{
    if(!videos.length)return;
    const next=(index+videos.length)%videos.length;
    if(next===activeVideoIndex)return;
    const outgoing=videoRefs.current.get(currentVideo.id);
    setActiveVideoIndex(next);
    setIsPlaying(true);
    // Maintain the signature crossfade before retiring the previous player.
    window.setTimeout(()=>outgoing?.pause(),750);
  };

  useEffect(()=>{
    const current=videoRefs.current.get(currentVideo?.id);
    if(!current)return;
    current.muted=isMuted;
    if(isPlaying)void current.play().catch(()=>setIsPlaying(false));
    else current.pause();
  },[currentVideo?.id,isMuted,isPlaying]);

  const togglePlayback=()=>{
    const current=videoRefs.current.get(currentVideo.id);
    if(isPlaying){current?.pause();setIsPlaying(false);}
    else void current?.play().then(()=>setIsPlaying(true)).catch(()=>setIsPlaying(false));
  };
  const toggleMute=()=>setIsMuted(value=>!value);
  const handleNextVideo=()=>switchVideo(activeVideoIndex+1);
  const handlePrevVideo=()=>switchVideo(activeVideoIndex-1);

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
          {/* The video is the hero: do not cover it with a photo or poster.
              Browsers render the actual first decoded frame as soon as bytes arrive. */}
          {/* Keep mounted clips stable when the server returns the public playlist.
              The initial built-in IDs match the server IDs, avoiding video reloads. */}
          {videos.map((video,index)=>(
            <video
              key={video.id}
              ref={node=>{
                if(node)videoRefs.current.set(video.id,node);
                else videoRefs.current.delete(video.id);
              }}
              src={video.src}
              preload={index===0?'auto':'none'}
              autoPlay={index===activeVideoIndex&&isPlaying}
              muted={isMuted}
              playsInline
              onLoadedData={()=>{
                // Retry when first frame is decoded, without waiting for React state.
                if(index===activeVideoIndex&&isPlaying){
                  void videoRefs.current.get(video.id)?.play().catch(()=>{});
                }
              }}
              onCanPlay={()=>{
                if(index===activeVideoIndex&&isPlaying){
                  void videoRefs.current.get(video.id)?.play().catch(()=>{});
                }
              }}
              onEnded={()=>{if(index===activeVideoIndex)switchVideo(index+1);}}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                activeVideoIndex===index
                  ? 'opacity-100 z-10':'opacity-0 pointer-events-none z-0'
              }`}
            />
          ))}

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
                  aria-label="Previous homepage video"
                  title="Previous video"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#C39A53]" />
                </button>
                <button
                  onClick={handleNextVideo}
                  className="w-7 h-7 rounded-full bg-[#4A1249] hover:bg-[#661B69] text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  aria-label="Next homepage video"
                  title="Next video"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#C39A53]" />
                </button>
              </div>

              {/* Dynamic homepage video selector: originals plus published additions. */}
              <div className="flex items-center gap-1.5 ml-1">
                {videos.map((vid, idx) => {
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
