import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, RefreshCw, X } from 'lucide-react';

type Notification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export const PortalNotificationsPopover: React.FC = () => {
  const [items,setItems] = useState<Notification[]>([]);
  const [open,setOpen] = useState(false);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const wrapper=useRef<HTMLDivElement>(null);
  const unread=items.filter(n=>!n.read_at).length;

  const load=useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const res=await fetch('/api/notifications',{credentials:'same-origin',cache:'no-store',signal});
      if(!res.ok) throw new Error('Could not load notifications.');
      const data=await res.json();
      if(!Array.isArray(data.notifications)) throw new Error('Invalid notification response.');
      if(!signal?.aborted) setItems(data.notifications);
    }catch(e){if(!signal?.aborted)setError(e instanceof Error?e.message:'Notifications unavailable.');}
    finally{if(!signal?.aborted)setLoading(false);}
  },[]);

  useEffect(()=>{
    const controller=new AbortController();
    void load(controller.signal);
    return ()=>controller.abort();
  },[load]);

  useEffect(()=>{
    if(!open) return;
    const dismiss=(e:PointerEvent)=>{
      if(wrapper.current && !wrapper.current.contains(e.target as Node))setOpen(false);
    };
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape);};
  },[open]);

  const markRead=async (id:string)=>{
    setBusy(true);setError('');
    try{
      const res=await fetch('/api/notifications/'+encodeURIComponent(id)+'/read',{method:'PATCH',credentials:'same-origin'});
      if(!res.ok)throw new Error('Could not mark notification as read.');
      setItems(prev=>prev.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n));
    }catch(e){setError(e instanceof Error?e.message:'Unable to update notification.');}
    finally{setBusy(false);}
  };
  const markAll=async()=>{
    setBusy(true);setError('');
    try{
      const res=await fetch('/api/notifications/read-all',{method:'POST',credentials:'same-origin'});
      if(!res.ok)throw new Error('Could not mark notifications as read.');
      setItems(prev=>prev.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));
    }catch(e){setError(e instanceof Error?e.message:'Unable to update notifications.');}
    finally{setBusy(false);}
  };
  return <div ref={wrapper} className="relative shrink-0">
    <button type="button" onClick={()=>setOpen(v=>!v)} aria-label={`Notifications${unread?' ('+unread+' unread)':''}`} aria-haspopup="dialog" aria-expanded={open}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e6dce7] bg-white text-[#4a1249] hover:bg-[#faf4fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a1249]">
      <Bell className="h-5 w-5" aria-hidden="true"/>
      {unread>0&&<span className="absolute -right-1 -top-1 rounded-full bg-[#4a1249] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{unread>99?'99+':unread}</span>}
    </button>
    {open&&<section role="dialog" aria-label="University notifications" className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,360px)] max-h-[min(70vh,480px)] overflow-y-auto rounded-xl border border-[#e6dce7] bg-white p-4 text-slate-800 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#35103b]">Notifications</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={()=>void load()} disabled={loading||busy} className="rounded-lg p-2 text-[#4a1249] hover:bg-[#faf4fa]" aria-label="Refresh notifications"><RefreshCw className="h-4 w-4"/></button>
          <button type="button" onClick={()=>setOpen(false)} className="rounded-lg p-2 text-[#4a1249] hover:bg-[#faf4fa]" aria-label="Close notifications"><X className="h-4 w-4"/></button>
        </div>
      </div>
      {unread>0&&<button type="button" disabled={busy} onClick={()=>void markAll()} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4a1249] hover:underline disabled:opacity-50"><CheckCheck className="h-4 w-4"/>Mark all read</button>}
      {error&&<p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      {loading?<p role="status" className="text-sm text-slate-600">Loading notifications…</p>:
        items.length===0?<p role="status" className="rounded-lg bg-[#faf8fb] p-5 text-center text-sm text-slate-600">No university notifications yet.</p>:
        <ul className="space-y-2">{items.map(n=><li key={n.id} className={`rounded-lg border p-3 ${n.read_at?'border-slate-200 bg-white':'border-[#d5bfd8] bg-[#faf6fb]'}`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[#35103b]">{n.title}</p>
            {!n.read_at&&<button type="button" disabled={busy} onClick={()=>void markRead(n.id)} className="shrink-0 text-xs font-semibold text-[#4a1249] hover:underline disabled:opacity-50">Mark read</button>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{n.body}</p>
          <time className="mt-2 block text-[11px] text-slate-500" dateTime={n.created_at}>{Number.isFinite(Date.parse(n.created_at))?new Date(n.created_at).toLocaleString():'Date unavailable'}</time>
        </li>)}</ul>}
    </section>}
  </div>;
};
