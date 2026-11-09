import React,{useCallback,useEffect,useState} from 'react';
import {BookOpen,CalendarClock,CheckCircle2,ExternalLink,FileText,RefreshCw,ShieldCheck} from 'lucide-react';
import type {UserProfile} from '../../types';

type Section={id:string;course_code:string;course_title:string;term_title:string;instructor_name:string};
type ClassSession={id:string;section_id:string;title:string;starts_at:string;ends_at:string;meeting_url:string|null;notes:string};
type Resource={id:string;section_id:string;title:string;kind:'notes'|'reading'|'recording'|'assignment';url:string;description:string};
type State={sections:Section[];sessions:ClassSession[];resources:Resource[];attendance:{session_id:string;checked_in_at:string}[];attendanceCount:{session_id:string;attended:number}[];capabilities:{liveVideoProviderConnected:boolean;automaticRecording:boolean;gradedAssignments:boolean}};
const format=(value:string)=>new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
const isoInput=(v:string)=>new Date(v).toISOString();
const Field=({title,children}:{title:string;children:React.ReactNode})=><label className="block space-y-1 text-sm font-semibold text-[#35103b]">{title}{children}</label>;
const inputClass='w-full rounded-lg border border-[#d8c6db] bg-white p-2.5 text-sm font-normal text-[#35103b]';
const panel='rounded-xl border border-[#e5d7e8] bg-white p-5 shadow-sm';
const button='rounded-lg bg-[#4a1249] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

export const SecureOnlineLearning:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const [state,setState]=useState<State|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [busy,setBusy]=useState(false);
  const [sectionId,setSectionId]=useState('');
  const [title,setTitle]=useState('');
  const [starts,setStarts]=useState('');
  const [ends,setEnds]=useState('');
  const [meetingUrl,setMeetingUrl]=useState('');
  const [notes,setNotes]=useState('');
  const [resourceTitle,setResourceTitle]=useState('');
  const [resourceKind,setResourceKind]=useState<Resource['kind']>('notes');
  const [resourceUrl,setResourceUrl]=useState('');
  const [resourceDescription,setResourceDescription]=useState('');
  const canTeach=['super_admin','lecturer','dean'].includes(currentUser.role);
  const canAttend=currentUser.role==='student';
  const refresh=useCallback(async(signal?:AbortSignal)=>{
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/classroom/state',{credentials:'same-origin',cache:'no-store',signal});
      if(!response.ok)throw new Error(response.status===401?'Your session expired. Sign in again.':'Your class schedule is not accessible.');
      const data:State=await response.json();
      if(!signal?.aborted){
        setState(data);
        setSectionId(s=>data.sections.some(v=>v.id===s)?s:data.sections[0]?.id||'');
      }
    }catch(e){if(!signal?.aborted){setState(null);setError(e instanceof Error?e.message:'Could not load class records.');}}
    finally{if(!signal?.aborted)setLoading(false);}
  },[]);
  useEffect(()=>{
    if(!canTeach&&!canAttend){setLoading(false);return;}
    const controller=new AbortController();
    void refresh(controller.signal);
    return ()=>controller.abort();
  },[refresh,canTeach,canAttend]);

  const submit=async(path:string,payload:Record<string,unknown>,message:string)=>{
    if(busy)return false;
    setBusy(true);setError('');setSuccess('');
    try{
      const response=await fetch(path,{method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await response.json();
      if(!response.ok||!data.success)throw new Error(data.error||'Your request was not accepted.');
      setSuccess(message);
      await refresh();
      return true;
    }catch(e){setError(e instanceof Error?e.message:'Unable to save the class operation.');return false;}
    finally{setBusy(false);}
  };
  if(!canTeach&&!canAttend)return <p role="alert" className={panel}>Online classes are available only to enrolled students and assigned teaching staff.</p>;
  if(loading&&!state)return <p role="status" className={panel}>Loading your authorized university classes…</p>;
  const sections=state?.sections||[];
  const selected=sections.find(v=>v.id===sectionId);
  const sessions=(state?.sessions||[]).filter(v=>v.section_id===sectionId);
  const resources=(state?.resources||[]).filter(v=>v.section_id===sectionId);
  const attended=new Set((state?.attendance||[]).map(a=>a.session_id));
  return <div className="space-y-5 text-[#35103b]">
    <header className={panel}>
      <p className="text-xs font-bold uppercase tracking-widest text-[#927040]">HIAU · Secure academic services</p>
      <h2 className="mt-2 text-2xl font-bold">Online Classes & Learning Resources</h2>
      <p className="mt-2 text-sm text-slate-700">Classes and materials come from real university course sections and authorized instructors. No simulated participants or fabricated student conversations appear here.</p>
      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
        <strong>Integration status:</strong> Classes can be scheduled and external HTTPS meeting links shared securely. An embedded live-video provider, automatic recording and graded online assessment are <strong>not yet connected</strong>. Attendance check-in is student self-attested pending faculty verification.
      </div>
      <button type="button" onClick={()=>void refresh()} disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#d8c6db] px-3 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4"/> Refresh classroom</button>
    </header>
    {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {success&&<p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="h-4 w-4"/>{success}</p>}
    <section className={panel}>
      <Field title="Choose your authorized course section">
        <select className={inputClass} value={sectionId} onChange={e=>setSectionId(e.target.value)}>
          <option value="">Select a course</option>
          {sections.map(v=><option key={v.id} value={v.id}>{v.course_code} — {v.course_title} ({v.term_title})</option>)}
        </select>
      </Field>
      {selected&&<p className="mt-2 text-sm text-slate-600">Instructor: {selected.instructor_name} · {selected.term_title}</p>}
      {sections.length===0&&<p className="mt-3 text-sm text-slate-600">{canAttend?'You must have an active course enrollment before accessing its classroom.':'Your teaching assignment must be recorded by the Registrar before you can create course sessions.'}</p>}
    </section>
    {selected&&<>
      {canTeach&&<div className="grid gap-4 xl:grid-cols-2">
        <section className={panel}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><CalendarClock className="h-5 w-5"/>Schedule a class</h3>
          <form className="space-y-3" onSubmit={e=>{
            e.preventDefault();if(!starts||!ends)return;
            void submit('/api/classroom/sessions',{sectionId,title,startsAt:isoInput(starts),endsAt:isoInput(ends),meetingUrl,notes},
              'Class scheduled for enrolled students.').then(saved=>{if(saved){setTitle('');setMeetingUrl('');setNotes('');}});
          }}>
            <Field title="Class topic"><input className={inputClass} required maxLength={180} value={title} onChange={e=>setTitle(e.target.value)}/></Field>
            <Field title="Begins (local time)"><input className={inputClass} required type="datetime-local" value={starts} onChange={e=>setStarts(e.target.value)}/></Field>
            <Field title="Ends (local time)"><input className={inputClass} required type="datetime-local" value={ends} onChange={e=>setEnds(e.target.value)}/></Field>
            <Field title="External HTTPS meeting link (optional)">
              <input className={inputClass} type="url" value={meetingUrl} onChange={e=>setMeetingUrl(e.target.value)} placeholder="https://approved-meeting-provider.example/..."/>
            </Field>
            <Field title="Instructions"><textarea className={inputClass} rows={3} maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)}/></Field>
            <button className={button} type="submit" disabled={busy||!title.trim()||!starts||!ends}>Publish class schedule</button>
          </form>
        </section>
        <section className={panel}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5"/>Publish learning resource</h3>
          <form className="space-y-3" onSubmit={e=>{
            e.preventDefault();void submit('/api/classroom/resources',{sectionId,title:resourceTitle,kind:resourceKind,url:resourceUrl,description:resourceDescription},
              'Learning resource published to students enrolled in this section.').then(saved=>{if(saved){setResourceTitle('');setResourceUrl('');setResourceDescription('');}});
          }}>
            <Field title="Material title"><input className={inputClass} required maxLength={180} value={resourceTitle} onChange={e=>setResourceTitle(e.target.value)}/></Field>
            <Field title="Material category"><select className={inputClass} value={resourceKind} onChange={e=>setResourceKind(e.target.value as Resource['kind'])}>
              <option value="notes">Lecture notes</option><option value="reading">Reading</option><option value="assignment">Assignment instructions (external)</option><option value="recording">Recording (externally hosted)</option>
            </select></Field>
            <Field title="HTTPS learning material URL"><input className={inputClass} type="url" required value={resourceUrl} onChange={e=>setResourceUrl(e.target.value)} placeholder="https://approved-resource-provider.example/..."/></Field>
            <Field title="Description"><textarea className={inputClass} rows={3} maxLength={2000} value={resourceDescription} onChange={e=>setResourceDescription(e.target.value)}/></Field>
            <button className={button} type="submit" disabled={busy||!resourceTitle.trim()||!resourceUrl.trim()}>Publish resource</button>
          </form>
        </section>
      </div>}
      <section className={panel}>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><CalendarClock className="h-5 w-5"/>Scheduled lessons</h3>
        {sessions.length===0?<p className="text-sm text-slate-600">No classes are scheduled for this section.</p>:
        <div className="space-y-3">{sessions.map(item=>{
          const now=Date.now(),start=Date.parse(item.starts_at),end=Date.parse(item.ends_at);
          const eligible=now>=start-15*60000&&now<=end+15*60000;
          const check=attended.has(item.id);
          const count=(state?.attendanceCount||[]).find(x=>x.session_id===item.id)?.attended;
          return <article key={item.id} className="rounded-lg border border-[#e5d7e8] p-4">
            <h4 className="font-bold">{item.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{format(item.starts_at)} — {format(item.ends_at)}</p>
            {item.notes&&<p className="mt-2 whitespace-pre-wrap text-sm">{item.notes}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {item.meeting_url?<a href={item.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#4a1249] px-3 py-2 text-sm font-semibold text-white"><ExternalLink className="h-4 w-4"/>Open approved meeting link</a>:
                <span className="text-xs text-slate-600">No meeting link supplied by the instructor.</span>}
              {canAttend&&<button type="button" disabled={busy||!eligible||check}
                onClick={()=>void submit('/api/classroom/sessions/'+item.id+'/check-in',{},'Self-attested attendance recorded; faculty verification is still required.')}
                className={button}>{check?'Checked in':eligible?'Check in to class':'Check-in not open'}</button>}
              {canTeach&&<span className="text-xs text-slate-600">{count??0} self-attested check-in(s); not verified attendance</span>}
            </div>
          </article>;
        })}</div>}
      </section>
      <section className={panel}>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold"><FileText className="h-5 w-5"/>Learning materials</h3>
        {resources.length===0?<p className="text-sm text-slate-600">No resources have been published for this section.</p>:
          <ul className="space-y-2">{resources.map(item=><li key={item.id} className="rounded-lg border border-[#e5d7e8] p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#926c35]">{item.kind}</span>
            <p className="font-bold">{item.title}</p>{item.description&&<p className="mt-1 text-sm text-slate-600">{item.description}</p>}
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#4a1249] underline"><ExternalLink className="h-4 w-4"/>Open course resource</a>
          </li>)}</ul>}
        <p className="mt-4 flex items-start gap-2 text-xs text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0"/>Links may lead to third-party services with their own access conditions. No grades, automatic video capture or payments are processed by this classroom module.</p>
      </section>
    </>}
  </div>;
};
