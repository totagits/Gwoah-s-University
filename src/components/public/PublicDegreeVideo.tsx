import React, {useEffect,useRef,useState} from 'react';
import {Volume2, VolumeX, PlayCircle, AlertCircle} from 'lucide-react';

type DegreeVideoProps={
  route:string;
  source:string;
  title:string;
};

/**
 * Public academic clips start silently, which satisfies common browser autoplay rules.
 * Sound is enabled only after a direct visitor action.
 */
export const PublicDegreeVideo:React.FC<DegreeVideoProps>=({route,source,title})=>{
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const [soundOn,setSoundOn]=useState(false);
  const [autoplayBlocked,setAutoplayBlocked]=useState(false);
  const [mediaError,setMediaError]=useState(false);

  useEffect(()=>{
    const video=videoRef.current;
    if(!video)return;
    let active=true;
    video.muted=true;
    setSoundOn(false);
    setAutoplayBlocked(false);
    setMediaError(false);
    // Attempt playback after route changes in addition to the native autoplay hint.
    // Browser restrictions are handled with an explicit manual Play fallback.
    const start=()=>{
      const attempt=video.play();
      if(attempt)void attempt.then(()=>{
        if(active)setAutoplayBlocked(false);
      }).catch(()=>{
        if(active&&!video.error)setAutoplayBlocked(true);
      });
    };
    if(video.readyState>=2)start();
    else video.addEventListener('loadeddata',start,{once:true});
    return ()=>{
      active=false;
      video.removeEventListener('loadeddata',start);
      video.pause();
    };
  },[route,source]);

  const startWithSound=()=>{
    const video=videoRef.current;
    if(!video)return;
    video.muted=false;
    setSoundOn(true);
    setAutoplayBlocked(false);
    void video.play().catch(()=>{
      // Users may still use the browser's native playback controls.
      setAutoplayBlocked(true);
    });
  };
  const muteSound=()=>{
    const video=videoRef.current;
    if(video)video.muted=true;
    setSoundOn(false);
  };
  const playManually=()=>{
    const video=videoRef.current;
    if(!video)return;
    void video.play().then(()=>setAutoplayBlocked(false)).catch(()=>setAutoplayBlocked(true));
  };

  return <div className="space-y-3">
    <div className="overflow-hidden rounded-xl bg-[#2a082c]">
      <video ref={videoRef} key={route} controls autoPlay muted playsInline preload="auto"
        poster="/assets/aistudio/image_29eb5504.png"
        className="aspect-video w-full object-contain" aria-label={`Educational video about ${title}`}
        onError={()=>setMediaError(true)} onPlaying={()=>setAutoplayBlocked(false)}>
        <source src={source} type="video/mp4"/>
        Your browser does not support this degree video.
      </video>
    </div>
    {mediaError?<div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/>
      This degree video could not be loaded. Please try reloading the page, or contact the university if the problem continues.
    </div>:<div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={soundOn?muteSound:startWithSound}
        aria-pressed={soundOn}
        className="inline-flex items-center gap-2 rounded-lg bg-[#4a1249] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#642166] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">
        {soundOn?<VolumeX className="h-4 w-4" aria-hidden="true"/>:<Volume2 className="h-4 w-4" aria-hidden="true"/>}
        {soundOn?'Mute narration':'Turn on narration'}
      </button>
      {autoplayBlocked&&<button type="button" onClick={playManually}
        className="inline-flex items-center gap-2 rounded-lg border border-[#4a1249] px-4 py-2.5 text-sm font-semibold text-[#4a1249] hover:bg-[#faf4fa]">
        <PlayCircle className="h-4 w-4" aria-hidden="true"/>Play video
      </button>}
      <p className="text-xs text-slate-600">
        {soundOn?'Narration enabled. You can mute it at any time.':'Video starts muted when your browser allows autoplay.'}
      </p>
    </div>}
  </div>;
};
