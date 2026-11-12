import React,{useState} from 'react';
import {ArrowRight, Building2, GraduationCap, LockKeyhole, PlayCircle} from 'lucide-react';

/**
 * Public Campus Tour is an on-demand page, NOT the homepage hero carousel.
 * This player never auto-plays, rotates clips, overlaps diagonal masks, or
 * transfers authenticated ERP sessions into public navigation.
 */
const TOUR_VIDEOS=[
 {id:'campus',label:'Campus overview',description:'Explore the university campus video.',
  src:'/api/public/video/hero-campus',poster:'/assets/aistudio/image_29eb5504.png'},
 {id:'classroom',label:'Classroom and learning spaces',description:'Watch the university classroom video.',
  src:'/api/public/video/hero-classroom',poster:'/assets/aistudio/image_51d124f3.png'},
] as const;

interface PublicVirtualTourProps {
 onOpenApplicationModal?:()=>void;
 onRequestFacilitiesLogin?:()=>void;
}

export const PublicVirtualTour:React.FC<PublicVirtualTourProps>=({
 onOpenApplicationModal,onRequestFacilitiesLogin
})=>{
 const [selected,setSelected]=useState<(typeof TOUR_VIDEOS)[number]['id']>('campus');
 const video=TOUR_VIDEOS.find(v=>v.id===selected)||TOUR_VIDEOS[0];
 return <section id="tour" aria-label="HIAU campus tour"
  className="scroll-mt-32 border-b border-purple-100 bg-[#FAF8FB] py-12 text-[#2E0F34]">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   <header className="max-w-3xl">
    <p className="text-xs font-bold uppercase tracking-widest text-[#96702D]">Explore HIAU</p>
    <h2 className="mt-2 text-3xl font-black text-[#4A1249] sm:text-4xl">Campus Tour</h2>
    <p className="mt-3 text-sm leading-7 text-slate-700">Select a campus or classroom video to watch at your own pace. This tour is separate from the homepage video carousel.</p>
   </header>

   <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Select campus tour video">
    {TOUR_VIDEOS.map(item=><button key={item.id} type="button" aria-pressed={item.id===selected}
      onClick={()=>setSelected(item.id)}
      className={`flex items-center gap-3 rounded-lg border p-4 text-left font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C39A53] ${item.id===selected?'border-[#4A1249] bg-purple-50 text-[#4A1249]':'border-purple-200 bg-white text-slate-700 hover:border-purple-400'}`}>
      {item.id==='campus'?<Building2 className="h-5 w-5 shrink-0"/>:<GraduationCap className="h-5 w-5 shrink-0"/>}
      <span>{item.label}</span>{item.id===selected&&<PlayCircle className="ml-auto h-5 w-5 shrink-0"/>}
    </button>)}
   </div>

   <div className="mt-6 overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm">
    <video key={video.id} controls playsInline preload="metadata" poster={video.poster}
      aria-label={video.label} className="aspect-video w-full bg-black object-contain">
      <source src={video.src} type="video/mp4"/>
      Your browser does not support this video format.
    </video>
    <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
     <div><h3 className="text-xl font-bold text-[#4A1249]">{video.label}</h3>
      <p className="mt-1 text-sm text-slate-600">{video.description}</p></div>
     <p className="text-xs text-slate-500">Select Play to begin · Standard video controls</p>
    </div>
   </div>

   <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-purple-200 bg-white p-4">
    {onOpenApplicationModal&&<button type="button" onClick={onOpenApplicationModal}
      className="rounded bg-[#C39A53] px-5 py-3 text-sm font-bold text-[#2A082C] hover:bg-[#DDB86C] focus-visible:outline-2">
      Schedule campus visit <ArrowRight className="ml-1 inline h-4 w-4"/>
    </button>}
    {onRequestFacilitiesLogin&&<button type="button" onClick={onRequestFacilitiesLogin}
      className="hiau-brand-action inline-flex items-center gap-2 rounded bg-[#4A1249] px-5 py-3 text-sm font-bold text-white focus-visible:outline-2">
      <LockKeyhole className="h-4 w-4"/> Campus Facilities — Staff Sign In
    </button>}
    <p className="text-xs text-slate-600">Facilities management is an internal university system. Authorized staff credentials are required.</p>
   </div>
  </div>
 </section>;
};
