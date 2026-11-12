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
  const [availability,setAvailability]=useState<'checking'|'available'|'missing'>('checking');
  useEffect(()=>{
    const controller=new AbortController();
    setAvailability('checking');
    void fetch('/api/public/video-status/'+encodeURIComponent(route),{signal:controller.signal,cache:'no-store'})
      .then(async r=>{
        if(!r.ok)throw Error('Availability not confirmed');
        const status:{available:boolean}=await r.json();
        if(!controller.signal.aborted)setAvailability(status.available?'available':'missing');
      })
      .catch(()=>{if(!controller.signal.aborted)setAvailability('missing');});
    return ()=>controller.abort();
  },[route]);

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

  if(availability==='checking')return <div role="status" className="rounded-xl border border-purple-200 bg-[#faf8fb] p-6 text-sm text-[#4A1249]">
    Checking the availability of this program's video…
  </div>;
  if(availability==='missing')return <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
    <p className="font-semibold text-amber-950">This degree's explanatory video is not currently available.</p>
    <p className="mt-2 text-sm text-amber-950">The university can publish an approved video for this program through the Website Video Library. Academic program information remains available below.</p>
  </div>;
  return <div className="space-y-3">
    <div className="overflow-hidden rounded-xl bg-[#2a082c]">
      <video ref={videoRef} key={route} controls autoPlay muted playsInline preload="auto"
        
        className="aspect-video w-full object-contain" aria-label={`Educational video about ${title}`}
        onError={()=>setMediaError(true)} onPlaying={()=>setAutoplayBlocked(false)}
        onVolumeChange={event=>setSoundOn(!event.currentTarget.muted&&event.currentTarget.volume>0)}>
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
