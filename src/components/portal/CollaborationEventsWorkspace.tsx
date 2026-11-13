import React,{useEffect,useMemo,useState} from 'react';
import {
  CalendarDays,CheckCircle2,ExternalLink,RefreshCw,ShieldCheck,Users,
} from 'lucide-react';
import type {UserProfile} from '../../types';

type EventRecord={
  id:string;title:string;eventType:string;summary:string;deliveryMode:string;venue:string;
  startsAt:string;endsAt:string;timezone:string;status:string;registrationOpen:boolean;
  maxParticipants:number;certificateEligible:boolean;institutionName:string;reviewNote?:string;
  registered?:boolean;
};
type Participant={
  id:string;user_id:string;name:string;email:string;role:string;status:string;
  attended_at?:string|null;certificate_code?:string|null;
};
type Participation={
  status:string;registered_at:string;attended_at?:string|null;certificate_code?:string|null;
  certificate_issued_at?:string|null;event_id:string;title:string;event_type:string;starts_at:string;ends_at:string;
};
const field='w-full rounded-lg border border-[#CBBBD1] bg-white px-3 py-2.5 text-sm text-[#2C1733] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249]';
const primary='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#341034] disabled:cursor-not-allowed disabled:opacity-50';
const secondary='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#CBBBD1] bg-white px-4 py-2 text-sm font-semibold text-[#4A1249] hover:bg-[#F6EFF7] disabled:cursor-not-allowed disabled:opacity-50';
const read=async(response:Response)=>{
  const data=await response.json().catch(()=>({error:'Unreadable server response.'}));
  if(!response.ok)throw new Error(data.error||'Academic event request failed.');
  return data;
};
const eventTypes=[
  ['guest_lecture','Guest lecture'],['seminar','Seminar'],['symposium','Symposium'],
  ['conference','Conference'],['workshop','Workshop'],['professional_development','Professional development'],
] as const;
const modes=[['online','Online'],['hybrid','Hybrid'],['in_person','In person']] as const;
const localDate=(value:string)=>new Date(value).toLocaleString([],{
  year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',
});
const toIso=(value:string)=>value?new Date(value).toISOString():'';

export const CollaborationEventsWorkspace:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const role=currentUser.role;
  const isAdmin=role==='super_admin',isPartner=role==='partner_representative';
  const isLearner=['student','lecturer','dean'].includes(role);
  const [events,setEvents]=useState<EventRecord[]>([]);
  const [participation,setParticipation]=useState<Participation[]>([]);
  const [participants,setParticipants]=useState<Record<string,Participant[]>>({});
  const [reviewNotes,setReviewNotes]=useState<Record<string,string>>({});
  const [cancelReasons,setCancelReasons]=useState<Record<string,string>>({});
  const [access,setAccess]=useState<Record<string,{meetingUrl:string;venue:string}>>({});
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [proposal,setProposal]=useState({
    title:'',eventType:'guest_lecture',summary:'',deliveryMode:'online',venue:'',meetingUrl:'',
    startsAt:'',endsAt:'',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Africa/Monrovia',
    maxParticipants:'0',certificateEligible:true,
  });

  const load=async()=>{
    setLoading(true);setError('');
    try{
      const data=await read(await fetch('/api/partner-collaboration/events',{cache:'no-store'}));
      setEvents(data.events||[]);
      if(isLearner){
        const mine=await read(await fetch('/api/partner-collaboration/events/my/participation',{cache:'no-store'}));
        setParticipation(mine.participation||[]);
      }
    }catch(e){setError(e instanceof Error?e.message:'Unable to load academic events.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[currentUser.id]);

  const post=async(path:string,body:unknown,success:string)=>{
    setBusy(true);setError('');setNotice('');
    try{
      await read(await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
      setNotice(success);await load();
    }catch(e){setError(e instanceof Error?e.message:'Action failed.');}
    finally{setBusy(false);}
  };
  const submitProposal=async(e:React.FormEvent)=>{
    e.preventDefault();
    await post('/api/partner-collaboration/events/proposals',{
      ...proposal,startsAt:toIso(proposal.startsAt),endsAt:toIso(proposal.endsAt),
      maxParticipants:Number(proposal.maxParticipants||0),
    },'Academic event proposal submitted to HIAU for review.');
    setProposal(p=>({...p,title:'',summary:'',venue:'',meetingUrl:'',startsAt:'',endsAt:'',maxParticipants:'0'}));
  };
  const loadParticipants=async(id:string)=>{
    setError('');
    try{
      const data=await read(await fetch('/api/partner-collaboration/events/'+id+'/participants',{cache:'no-store'}));
      setParticipants(current=>({...current,[id]:data.participants||[]}));
    }catch(e){setError(e instanceof Error?e.message:'Unable to load participants.');}
  };
  const openEvent=async(id:string)=>{
    setError('');
    try{
      const data=await read(await fetch('/api/partner-collaboration/events/'+id+'/access',{cache:'no-store'}));
      setAccess(current=>({...current,[id]:{meetingUrl:data.meetingUrl||'',venue:data.venue||''}}));
    }catch(e){setError(e instanceof Error?e.message:'Event access unavailable.');}
  };

  const sorted=useMemo(()=>[...events].sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt)),[events]);
  return <section className="mx-auto max-w-7xl space-y-5 text-[#2C1733]" aria-labelledby="collaboration-events-title">
    <header className="rounded-2xl border border-[#E0D5E3] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#916A32]">HIAU Global Academic Collaboration</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h2 id="collaboration-events-title" className="flex items-center gap-2 text-2xl font-bold text-[#4A1249]"><CalendarDays/> Joint Lectures, Seminars & Symposiums</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Governed academic events shared between HIAU and approved partner institutions. Registration and participation
            do not create HIAU academic credit automatically.
          </p>
        </div>
        <button type="button" className={secondary} onClick={()=>void load()} disabled={loading||busy}><RefreshCw size={16}/> Refresh</button>
      </div>
    </header>

    {error&&<p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {notice&&<p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">{notice}</p>}

    {isPartner&&<form onSubmit={submitProposal} className="grid gap-4 rounded-2xl border border-[#E0D5E3] bg-white p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h3 className="text-lg font-bold text-[#35103B]">Propose a partner academic event</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">Your active institutional agreement must authorize lectures or symposium activities. HIAU review is required before registration opens.</p>
      </div>
      <label className="sm:col-span-2"><span className="mb-1 block text-sm font-semibold">Event title</span><input required maxLength={220} className={field} value={proposal.title} onChange={e=>setProposal({...proposal,title:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-semibold">Event type</span><select className={field} value={proposal.eventType} onChange={e=>setProposal({...proposal,eventType:e.target.value})}>{eventTypes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label><span className="mb-1 block text-sm font-semibold">Delivery mode</span><select className={field} value={proposal.deliveryMode} onChange={e=>setProposal({...proposal,deliveryMode:e.target.value})}>{modes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <label className="sm:col-span-2"><span className="mb-1 block text-sm font-semibold">Academic description</span><textarea required rows={4} maxLength={2500} className={field} value={proposal.summary} onChange={e=>setProposal({...proposal,summary:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-semibold">Starts</span><input required type="datetime-local" className={field} value={proposal.startsAt} onChange={e=>setProposal({...proposal,startsAt:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-semibold">Ends</span><input required type="datetime-local" className={field} value={proposal.endsAt} onChange={e=>setProposal({...proposal,endsAt:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-semibold">Time zone</span><input required maxLength={80} className={field} value={proposal.timezone} onChange={e=>setProposal({...proposal,timezone:e.target.value})}/></label>
      <label><span className="mb-1 block text-sm font-semibold">Maximum participants (0 = no platform cap)</span><input type="number" min={0} max={100000} className={field} value={proposal.maxParticipants} onChange={e=>setProposal({...proposal,maxParticipants:e.target.value})}/></label>
      {proposal.deliveryMode!=='online'&&<label><span className="mb-1 block text-sm font-semibold">Venue</span><input required maxLength={300} className={field} value={proposal.venue} onChange={e=>setProposal({...proposal,venue:e.target.value})}/></label>}
      {proposal.deliveryMode!=='in_person'&&<label><span className="mb-1 block text-sm font-semibold">Approved HTTPS meeting/stream link</span><input required type="url" maxLength={1500} className={field} value={proposal.meetingUrl} onChange={e=>setProposal({...proposal,meetingUrl:e.target.value})}/></label>}
      <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" className="mt-1 accent-[#4A1249]" checked={proposal.certificateEligible} onChange={e=>setProposal({...proposal,certificateEligible:e.target.checked})}/>Allow HIAU to issue participation certificates after verified attendance.</label>
      <div className="sm:col-span-2"><button className={primary} disabled={busy}>Submit proposal for HIAU review</button></div>
    </form>}

    <section className="space-y-3" aria-label="Academic collaboration events">
      {loading?<p className="rounded-xl bg-white p-5 text-sm">Loading academic events…</p>:sorted.length===0?
        <p className="rounded-xl border border-[#E0D5E3] bg-white p-5 text-sm text-slate-700">No academic collaboration events are currently available for this account.</p>:
        sorted.map(event=><article key={event.id} className="rounded-2xl border border-[#E0D5E3] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#916A32]">{event.institutionName} · {event.eventType.replaceAll('_',' ')}</p>
              <h3 className="mt-1 text-xl font-bold text-[#35103B]">{event.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{event.summary}</p>
            </div>
            <span className="rounded-full border border-[#CABBD0] bg-[#F7F2F8] px-3 py-1 text-xs font-bold capitalize text-[#4A1249]">{event.status}</span>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <p><strong>Starts:</strong> {localDate(event.startsAt)}</p>
            <p><strong>Ends:</strong> {localDate(event.endsAt)}</p>
            <p><strong>Mode:</strong> {event.deliveryMode.replaceAll('_',' ')}</p>
            <p><strong>Certificate:</strong> {event.certificateEligible?'Eligible after verified attendance':'Not configured'}</p>
          </div>
          {event.reviewNote&&<p className="mt-3 rounded-lg bg-[#F8F5F9] p-3 text-xs text-slate-700"><strong>HIAU review:</strong> {event.reviewNote}</p>}

          {isAdmin&&event.status==='proposed'&&<div className="mt-4 space-y-3 border-t pt-4">
            <label><span className="mb-1 block text-sm font-semibold">Academic review rationale</span><textarea rows={2} className={field} value={reviewNotes[event.id]||''} onChange={e=>setReviewNotes({...reviewNotes,[event.id]:e.target.value})}/></label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} disabled={busy||!reviewNotes[event.id]?.trim()} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/review',{decision:'approved',note:reviewNotes[event.id],registrationOpen:true},'Academic event approved and registration opened.')}>Approve & open registration</button>
              <button type="button" className={secondary} disabled={busy||!reviewNotes[event.id]?.trim()} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/review',{decision:'rejected',note:reviewNotes[event.id],registrationOpen:false},'Academic event proposal rejected with rationale.')}>Reject</button>
            </div>
          </div>}

          {isAdmin&&event.status==='approved'&&<div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondary} onClick={()=>void loadParticipants(event.id)}><Users size={16}/> Load participants</button>
            </div>
            {participants[event.id]?.length>0&&<ul className="space-y-2">{participants[event.id].map(person=><li key={person.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E5DCE8] p-3 text-sm">
              <span><strong>{person.name}</strong> · {person.role} · {person.status}{person.certificate_code?' · certificate '+person.certificate_code:''}</span>
              <span className="flex flex-wrap gap-2">
                {person.status==='registered'&&<button type="button" className={secondary} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/attendance/'+person.user_id,{},'Attendance verified.')}>Verify attendance</button>}
                {person.status==='attended'&&event.certificateEligible&&!person.certificate_code&&<button type="button" className={secondary} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/certificate/'+person.user_id,{},'Participation certificate issued.')}>Issue certificate</button>}
              </span>
            </li>)}</ul>}
            <label><span className="mb-1 block text-sm font-semibold">Cancellation reason</span><input className={field} maxLength={1000} value={cancelReasons[event.id]||''} onChange={e=>setCancelReasons({...cancelReasons,[event.id]:e.target.value})}/></label>
            <button type="button" className={secondary} disabled={busy||!cancelReasons[event.id]?.trim()} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/cancel',{reason:cancelReasons[event.id]},'Academic event cancelled and registration closed.')}>Cancel event</button>
          </div>}

          {isLearner&&event.status==='approved'&&<div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
            {!event.registered?<button type="button" className={primary} disabled={busy||!event.registrationOpen} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/register',{},'You are registered for this academic event.')}>Register</button>:
              <>
                <button type="button" className={primary} onClick={()=>void openEvent(event.id)}><ExternalLink size={16}/> View access details</button>
                <button type="button" className={secondary} disabled={busy} onClick={()=>void post('/api/partner-collaboration/events/'+event.id+'/unregister',{},'Registration cancelled.')}>Cancel registration</button>
              </>}
            {access[event.id]&&<div className="w-full rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">
              {access[event.id].venue&&<p><strong>Venue:</strong> {access[event.id].venue}</p>}
              {access[event.id].meetingUrl&&<a className="mt-2 inline-flex items-center gap-2 font-semibold underline" target="_blank" rel="noreferrer" href={access[event.id].meetingUrl}>Open approved online session <ExternalLink size={14}/></a>}
            </div>}
          </div>}
        </article>)}
    </section>

    {isLearner&&<section className="rounded-2xl border border-[#E0D5E3] bg-white p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold text-[#35103B]"><CheckCircle2 size={20}/> My participation record</h3>
      <p className="mt-1 text-xs text-slate-600">Participation is tracked separately from academic credit. Certificates require HIAU-verified attendance.</p>
      {participation.length===0?<p className="mt-3 text-sm text-slate-700">No collaboration-event participation recorded yet.</p>:
        <ul className="mt-3 space-y-2">{participation.map(item=><li key={item.event_id} className="rounded-lg border border-[#E5DCE8] p-3 text-sm">
          <strong>{item.title}</strong> · {item.status}
          {item.certificate_code&&<span className="ml-2 font-semibold text-emerald-800">Certificate: {item.certificate_code}</span>}
        </li>)}</ul>}
    </section>}
  </section>;
};
