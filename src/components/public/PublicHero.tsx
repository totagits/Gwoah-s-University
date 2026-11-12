import { ManagedText } from './ManagedText';
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
  const [wantsPlayback,setWantsPlayback]=useState(true);
  const [isActuallyPlaying,setIsActuallyPlaying]=useState(false);
  const [isMuted,setIsMuted]=useState(true);
  const [videoError,setVideoError]=useState('');
  const [retryCount,setRetryCount]=useState(0);
  const [isPreparingNext,setIsPreparingNext]=useState(false);
  // Do not mount a src for background clips until the first visible clip
  // actually plays; preload=metadata alone still generates HTTP requests.
  const [preloadStarted,setPreloadStarted]=useState(false);
  const videoRefs=useRef<Array<HTMLVideoElement|null>>([]);
  const pendingVideoIndex=useRef<number|null>(null);
  const preloadArmed=useRef<Set<string>>(new Set());
  const currentVideo=videos[activeVideoIndex]||videos[0];
  // Explicitly opt-in via ?heroDebug=1 on staging. No user or account data
  // is collected; state only describes these two public media elements.
  const [debugEnabled]=useState(()=>typeof window!=='undefined' &&
    new URLSearchParams(window.location.search).get('heroDebug')==='1');
  const [debugEvents,setDebugEvents]=useState<string[]>([]);
  const captureMedia=(event:string,index:number)=>{
    if(!debugEnabled)return;
    const media=videoRefs.current[index];
    const status=media
      ? `paused=${media.paused} ready=${media.readyState} net=${media.networkState} muted=${media.muted} time=${media.currentTime.toFixed(1)} frames=${media.videoWidth}x${media.videoHeight} error=${media.error?.code??'none'}`
      : 'no element';
    setDebugEvents(previous=>[...previous.slice(-15),`#${index+1} ${event}: ${status}`]);
  };

  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/public/hero-videos',{signal:controller.signal,cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Media listing unavailable')))
      .then(data=>{
        if(!Array.isArray(data.videos)||data.videos.length<2)return;
        const safe=data.videos.filter((v:HeroVideoSlide)=>
          typeof v.id==='string'&&typeof v.title==='string'&&
          typeof v.src==='string'&&v.src.startsWith('/api/public/video/')&&
          /^[a-z0-9_-]+$/.test(v.src.slice('/api/public/video/'.length)));
        if(safe.length>=2){
          setVideos(previous=>{
            // Do not reset an already-loading media element when the API
            // repeats the same playlist; unnecessary source reloads stall startup.
            if(previous.length===safe.length && previous.every((clip,index)=>
              clip.id===safe[index].id && clip.src===safe[index].src))return previous;
            pendingVideoIndex.current=null;
            preloadArmed.current.clear();
            return safe;
          });
        }
      }).catch(()=>{/* Original two video endpoints remain the fallback. */});
    return ()=>controller.abort();
  },[]);

  // One player owns playback; the inactive element is only allowed to buffer.
  // Refs are the authoritative state for async media events (which may arrive
  // after a React render or after the visitor has selected a different clip).
  const activeIndexRef=useRef(activeVideoIndex);
  const wantsPlaybackRef=useRef(wantsPlayback);
  const playingRef=useRef(false);
  const switchingRef=useRef(false);
  activeIndexRef.current=activeVideoIndex;
  wantsPlaybackRef.current=wantsPlayback;

  const tryPlay=(index:number)=>{
    if(index!==activeIndexRef.current||!wantsPlaybackRef.current)return;
    const player=videoRefs.current[index];
    if(!player||!player.paused)return;
    player.muted=isMuted;
    captureMedia('play requested',index);
    void player.play().then(()=>captureMedia('play resolved',index)).catch(error=>{
      captureMedia('play rejected '+String(error?.name||error),index);
      if(index!==activeIndexRef.current)return;
      if(error?.name==='NotAllowedError'){
        // Autoplay policy is browser-controlled. Stop retrying automatically
        // and let one direct user gesture unlock the current media element.
        wantsPlaybackRef.current=false;
        setWantsPlayback(false);
        setVideoError('Your browser requires a click to start video. Select Play.');
      }else if(error?.name!=='AbortError'){
        setVideoError('Playback could not start. Retry this clip or choose the next one.');
      }
    });
  };

  const commitSwitch=(next:number)=>{
    if(next===activeIndexRef.current||switchingRef.current)return;
    const incoming=videoRefs.current[next];
    if(!incoming||incoming.readyState<HTMLMediaElement.HAVE_CURRENT_DATA||incoming.videoWidth===0)return;
    switchingRef.current=true;
    // Pause the outgoing element before revealing the next decoded frame.
    const outgoing=videoRefs.current[activeIndexRef.current];
    if(outgoing&&!outgoing.paused)outgoing.pause();
    incoming.pause();
    if(incoming.currentTime>0.05)incoming.currentTime=0;
    activeIndexRef.current=next;
    playingRef.current=false;
    pendingVideoIndex.current=null;
    setIsActuallyPlaying(false);
    setIsPreparingNext(false);
    setVideoError('');
    setActiveVideoIndex(next);
    requestAnimationFrame(()=>{switchingRef.current=false;});
  };

  const switchVideo=(index:number)=>{
    if(videos.length<2)return;
    const next=(index+videos.length)%videos.length;
    if(next===activeIndexRef.current)return;
    const incoming=videoRefs.current[next];
    if(incoming&&incoming.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA&&incoming.videoWidth>0){
      commitSwitch(next);
    }else{
      pendingVideoIndex.current=next;
      setIsPreparingNext(true);
      setVideoError('');
      if(incoming){
        incoming.pause();
        incoming.preload='auto';
        // Only load if no request has been started; never discard buffered bytes.
        if(incoming.networkState===HTMLMediaElement.NETWORK_EMPTY)incoming.load();
      }
    }
  };

  // Preload the next clip only after the active one is playing. This avoids
  // making both optimized MP4 downloads compete on a slow first visit.
  useEffect(()=>{
    if(!isActuallyPlaying||videos.length<2)return;
    const next=(activeVideoIndex+1)%videos.length;
    const clip=videos[next];
    const inactive=videoRefs.current[next];
    if(!inactive||!clip||preloadArmed.current.has(clip.id))return;
    preloadArmed.current.add(clip.id);
    inactive.pause();
    inactive.muted=true;
    inactive.preload='auto';
    // Rewind the completed hidden clip while the other is playing, not
    // at the moment of transition, so the next cycle has a decoded start frame.
    if(inactive.ended||inactive.currentTime>0.05){
      try{inactive.currentTime=0;}catch{/* metadata may not be ready */ }
    }
    if(inactive.networkState===HTMLMediaElement.NETWORK_EMPTY)inactive.load();
  },[activeVideoIndex,isActuallyPlaying,videos]);

  useEffect(()=>{
    for(let i=0;i<videoRefs.current.length;i++){
      const video=videoRefs.current[i];
      if(!video)continue;
      if(i!==activeVideoIndex){
        video.muted=true;
        if(!video.paused)video.pause();
      }
    }
    const active=videoRefs.current[activeVideoIndex];
    if(!active)return;
    active.muted=isMuted;
    if(wantsPlayback){
      // play() is permitted while the media is still loading; its promise
      // resolves when playback can actually begin. Waiting for readyState
      // here could leave the first clip paused indefinitely on some browsers.
      tryPlay(activeVideoIndex);
    }else active.pause();
  },[activeVideoIndex,isMuted,wantsPlayback,retryCount,videos]);

  // Stalled loading should never become a permanently blank carousel.
  useEffect(()=>{
    if(isActuallyPlaying||videoError||!wantsPlayback)return;
    const timeout=window.setTimeout(()=>{
      if(pendingVideoIndex.current!==null){
        setIsPreparingNext(false);
        setVideoError('The next video is taking longer than expected. Retry or select another clip.');
      }else setVideoError('This video is taking longer than expected. You may retry.');
    },12000);
    return ()=>window.clearTimeout(timeout);
  },[activeVideoIndex,retryCount,isActuallyPlaying,videoError,wantsPlayback,isPreparingNext]);

  const retryVideo=()=>{
    setVideoError('');
    setWantsPlayback(true);
    wantsPlaybackRef.current=true;
    setRetryCount(value=>value+1);
    const target=pendingVideoIndex.current??activeIndexRef.current;
    const player=videoRefs.current[target];
    if(player){
      player.preload='auto';
      if(player.networkState===HTMLMediaElement.NETWORK_EMPTY||player.error)player.load();
      if(target===activeIndexRef.current)tryPlay(target);
    }
  };
  const togglePlayback=()=>{
    const index=activeIndexRef.current;
    const player=videoRefs.current[index];
    if(!player)return;
    // UI intent may be "autoplay requested" while Chrome is actually paused
    // or waiting. The first visitor click must play—not cancel that request.
    if(!player.paused && playingRef.current){
      wantsPlaybackRef.current=false;
      setWantsPlayback(false);
      player.pause();
    }else{
      setVideoError('');
      wantsPlaybackRef.current=true;
      setWantsPlayback(true);
      player.muted=isMuted;
      // A direct call in this click handler retains user-gesture activation.
      void player.play().catch(error=>{
        if(error?.name==='NotAllowedError'){
          wantsPlaybackRef.current=false;
          setWantsPlayback(false);
          setVideoError('Your browser blocked playback. Check site autoplay permissions and press Play again.');
        }else if(error?.name!=='AbortError'){
          setVideoError('Video did not start. Please retry.');
        }
      });
    }
  };
  const toggleMute=()=>setIsMuted(value=>!value);
  const handleNextVideo=()=>switchVideo(activeIndexRef.current+1);
  const handlePrevVideo=()=>switchVideo(activeIndexRef.current-1);

  const onClipCanPlay=(index:number)=>{
    if(index===pendingVideoIndex.current){
      commitSwitch(index);
    }else if(index===activeIndexRef.current&&wantsPlaybackRef.current){
      tryPlay(index);
    }else{
      videoRefs.current[index]?.pause();
    }
  };

  return (
    <div className="relative w-full bg-white text-[#4A1249] overflow-hidden border-b border-purple-100">
      {/* HIAU Full-Bleed Edge-to-Edge Diagonal Split Hero */}
      <div className="relative w-full min-h-[580px] lg:min-h-[620px] xl:min-h-[680px] flex flex-col justify-center bg-white">
        {/* Left Column: Full-Bleed Carousel Video to Left Edge with Signature Slanted Cut */}
        <div
          className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-[52%] xl:w-[51%] w-full h-84 sm:h-96 lg:h-full relative overflow-hidden z-10 bg-[#2A082C]"
        >
          {/* Keep both video elements mounted: while one plays, the other
              buffers silently. Never replace the active frame with a spinner. */}
          {videos.map((clip,index)=>(
            <video
              key={clip.id}
              ref={element=>{
                videoRefs.current[index]=element;
                if(element){
                  // The muted attribute/defaultMuted must be present on the
                  // media element for consistent Chrome muted-autoplay policy.
                  element.defaultMuted=true;
                  element.muted=index!==activeIndexRef.current||isMuted;
                }
              }}
              src={index===activeVideoIndex||preloadStarted||isPreparingNext?clip.src:undefined}
              preload={index===activeVideoIndex||preloadStarted||isPreparingNext?'auto':'none'}
              autoPlay={index===activeVideoIndex&&wantsPlayback}
              muted={index!==activeVideoIndex||isMuted}
              playsInline
              disablePictureInPicture
              aria-hidden={index!==activeVideoIndex}
              onLoadStart={()=>captureMedia('loadstart',index)}
              onLoadedMetadata={()=>captureMedia('loadedmetadata',index)}
              onCanPlay={()=>{captureMedia('canplay',index);onClipCanPlay(index);}}
              onLoadedData={()=>{captureMedia('loadeddata',index);onClipCanPlay(index);}}
              onPlaying={()=>{captureMedia('playing',index);
                if(index!==activeIndexRef.current){videoRefs.current[index]?.pause();return;}
                playingRef.current=true;
                setIsActuallyPlaying(true);
                setPreloadStarted(true);
                setVideoError('');
              }}
              onPause={()=>{captureMedia('pause',index);if(index===activeIndexRef.current){playingRef.current=false;setIsActuallyPlaying(false);}}}
              onWaiting={()=>{captureMedia('waiting',index);if(index===activeIndexRef.current){playingRef.current=false;setIsActuallyPlaying(false);}}}
              onStalled={()=>{captureMedia('stalled',index);if(index===activeIndexRef.current){playingRef.current=false;setIsActuallyPlaying(false);}}}
              onError={()=>{captureMedia('error',index);
                if(index===activeIndexRef.current){
                  setVideoError('This video is unavailable. Retry or play the next clip.');
                }
              }}
              onEnded={()=>{if(index===activeIndexRef.current){playingRef.current=false;setIsActuallyPlaying(false);switchVideo(index+1);}}}
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${index===activeVideoIndex?'z-10 opacity-100':'z-0 opacity-0'}`}
            />
          ))}
          {isPreparingNext && (
            <span role="status" className="pointer-events-none absolute left-4 top-14 z-20 rounded bg-[#2A082C]/75 px-3 py-1 text-xs font-semibold text-[#F0CE8D]">
              Preparing next video in background
            </span>
          )}
          {!isActuallyPlaying && !videoError && !isPreparingNext && wantsPlayback && (
            <span role="status" className="pointer-events-none absolute left-4 top-14 z-20 rounded bg-[#2A082C]/75 px-3 py-1 text-xs font-semibold text-[#F0CE8D]">
              Preparing video for playback
            </span>
          )}
          {videoError&&<div role="alert" className="absolute bottom-24 left-4 right-14 z-20 rounded-lg bg-[#2A082C]/95 p-3 text-sm text-white ring-1 ring-[#C39A53]">
            <p>{videoError}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={retryVideo} className="rounded border border-[#C39A53] bg-[#4A1249] px-3 py-2 font-semibold !text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C39A53]">Retry video</button>
              <button type="button" onClick={handleNextVideo} className="rounded border border-white/60 bg-[#2A082C] px-3 py-2 font-semibold !text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C39A53]">Next clip</button>
            </div>
          </div>}

          {debugEnabled && (
            <aside aria-label="Hero autoplay diagnostics" className="absolute top-24 left-3 right-14 z-30 max-h-56 overflow-auto rounded border border-[#C39A53] bg-black/90 p-2 font-mono text-[11px] text-white">
              <strong>Hero debug · active clip {activeVideoIndex+1} · requested {String(wantsPlayback)} · playing {String(isActuallyPlaying)}</strong>
              <div className="mt-1 space-y-1">{debugEvents.map((item,index)=><p key={index}>{item}</p>)}</div>
            </aside>
          )}
          {/* Top Video Overlay: Slide Indicator & Continuous Stream Badge */}
          <div className="absolute top-4 left-4 right-12 z-20 flex items-center justify-between pointer-events-none">
            <span className="bg-[#4A1249]/90 text-[#C39A53] border border-[#C39A53]/70 px-3 py-1 rounded text-xs font-collegiate font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Video className="w-3.5 h-3.5 text-[#C39A53]" />
              <span>{currentVideo.badge}</span>
            </span>
          </div>

          {/* Compact controls, safely inside the diagonal cutout at its base. */}
          <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col gap-2 sm:left-6 lg:right-[24%]">
            <div className="max-w-[390px] rounded-md bg-[#2A082C]/80 px-3 py-2 text-[#C39A53] backdrop-blur-sm">
              <span className="block truncate text-xs font-bold uppercase tracking-wide">{currentVideo.title}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={togglePlayback}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C39A53] bg-[#2A082C]/90 text-white hover:bg-[#4A1249] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C39A53]"
                aria-label={isActuallyPlaying ? 'Pause video' : 'Play video'}
                title={isActuallyPlaying ? 'Pause video' : 'Play video'}
              >
                {isActuallyPlaying
                  ? <Pause className="h-5 w-5 text-[#C39A53]" />
                  : <Play className="ml-0.5 h-5 w-5 text-[#C39A53]" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-[#2A082C]/80 text-white hover:bg-[#4A1249]"
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <div className="flex shrink-0 items-center rounded-full border border-[#C39A53]/60 bg-[#2A082C]/80">
                <button type="button" onClick={handlePrevVideo}
                  className="flex h-9 w-8 items-center justify-center text-white hover:text-[#C39A53]"
                  aria-label="Previous homepage video" title="Previous video">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-xs font-bold tabular-nums text-white"
                  aria-live="polite">{String(activeVideoIndex+1).padStart(2,'0')}/{String(videos.length).padStart(2,'0')}</span>
                <button type="button" onClick={handleNextVideo}
                  className="flex h-9 w-8 items-center justify-center text-white hover:text-[#C39A53]"
                  aria-label="Next homepage video" title="Next video">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div role="group" aria-label="Choose homepage video"
                className="flex min-w-0 items-center gap-1.5">
                {videos.map((vid,idx)=>(
                  <button
                    key={vid.id}
                    type="button"
                    onClick={()=>switchVideo(idx)}
                    aria-label={`Show video ${idx+1}: ${vid.title}`}
                    aria-current={idx===activeVideoIndex?'true':undefined}
                    title={vid.label}
                    className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      idx===activeVideoIndex
                        ? 'w-6 bg-[#C39A53]' : 'w-2.5 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* One seamless white diagonal mask on the hero canvas, not on the
            hardware-decoded player. It extends two pixels beyond the video
            column so no antialiased right-hand seam remains visible. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 left-0 z-[15] hidden h-full lg:block lg:w-[calc(52%+2px)] xl:w-[calc(51%+2px)]"
        >
          <polygon points="100,0 100,100 80,100" fill="#FFFFFF" />
        </svg>

        {/* Right Column: Clean White Canvas in HIAU Imperial Purple & Gold */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 xl:py-20 relative z-20">
          <div className="lg:w-1/2 lg:ml-auto lg:pl-9 xl:pl-12 space-y-6 text-left">
            {/* HIAU Brand Headline in Imperial Purple */}
            <h1 className="font-collegiate font-black text-5xl sm:text-6xl lg:text-[64px] xl:text-[76px] text-[#4A1249] tracking-tight leading-[0.92] uppercase">
              <ManagedText section="home" slot="hero-heading" fallback="HARVEST UNIVERSITY IN LIBERIA" />
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl font-normal">
              <ManagedText section="home" slot="hero-description" fallback="Our Liberia location is preparing career-ready students for the challenges and opportunities of tomorrow. Strong academic excellence, Christ-centered leadership, and global standards accelerate hands-on learning opportunities, technological research, and community service across Liberia." />
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
