import React, {useCallback,useEffect,useMemo,useState} from 'react';
import {BookOpen,CheckCircle2,ClipboardList,FileCheck,Plus,RefreshCw,Trash2,AlertTriangle} from 'lucide-react';
import type {UserProfile} from '../../types';

type Program={
  id:string;code:string;name:string;college:string;credential:string;
  general_half:number;college_half:number;major_half:number;minor_half:number;elective_half:number;
  required_half:number;status:'draft'|'in_review'|'approved';
  source_title:string;source_page:string;notes:string;updated_at:string;
};
type Readiness = {
  ready:boolean;courseCount:number;errorCount:number;warningCount:number;
  totals:Record<string,{required:number;listed:number}>;
  findings:{severity:'error'|'warning';code:string;detail:string}[];
};
type Course={
  id:string;program_id:string;code:string;title:string;
  category:'general'|'college'|'major'|'minor'|'elective';
  credits_half:number;year:number;semester:number;prerequisite_codes:string;source_page:string;notes:string;
};
type ProgramInput={
  name:string;code:string;college:string;credential:string;
  generalCredits:string;collegeCredits:string;majorCredits:string;
  minorCredits:string;electiveCredits:string;requiredCredits:string;
  sourceTitle:string;sourcePage:string;notes:string;
};
type CourseInput={
  code:string;title:string;category:Course['category'];credits:string;year:string;semester:string;
  prerequisites:string;sourcePage:string;notes:string;
};
const emptyProgram:ProgramInput={
  name:'',code:'',college:'College of Science, Technology, and Allied Health',
  credential:'Bachelor of Science',generalCredits:'',collegeCredits:'',
  majorCredits:'',minorCredits:'',electiveCredits:'',requiredCredits:'',
  sourceTitle:'College of Science.pdf',sourcePage:'',notes:'',
};
const emptyCourse:CourseInput={
  code:'',title:'',category:'major',credits:'3',year:'1',semester:'1',prerequisites:'',sourcePage:'',notes:'',
};
const fields:{key:keyof ProgramInput;label:string;type?:string}[]=[
  {key:'name',label:'Official program name'},
  {key:'code',label:'Program code'},
  {key:'college',label:'College / school'},
  {key:'credential',label:'Award / credential'},
  {key:'generalCredits',label:'University general credits',type:'number'},
  {key:'collegeCredits',label:'College core credits',type:'number'},
  {key:'majorCredits',label:'Major credits',type:'number'},
  {key:'minorCredits',label:'Minor credits',type:'number'},
  {key:'electiveCredits',label:'Elective credits',type:'number'},
  {key:'requiredCredits',label:'Total credits required',type:'number'},
  {key:'sourceTitle',label:'Source document'},
  {key:'sourcePage',label:'Source page / section'},
];
const categoryNames:{value:Course['category'];label:string}[]=[
  {value:'general',label:'University general'},
  {value:'college',label:'College core'},
  {value:'major',label:'Major requirement'},
  {value:'minor',label:'Minor option'},
  {value:'elective',label:'Elective option'},
];
const credit=(n:number)=>Number.isFinite(n)?(n/2).toString():'—';
const fromProgram=(p:Program):ProgramInput=>({
  name:p.name,code:p.code,college:p.college,credential:p.credential,
  generalCredits:credit(p.general_half),collegeCredits:credit(p.college_half),
  majorCredits:credit(p.major_half),minorCredits:credit(p.minor_half),
  electiveCredits:credit(p.elective_half),requiredCredits:credit(p.required_half),
  sourceTitle:p.source_title,sourcePage:p.source_page,notes:p.notes,
});
const messageFrom=(response:any)=>response?.error||'The curriculum request could not be completed.';

export const CurriculumStudio:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const canApprove=currentUser.role==='super_admin';
  const [programs,setPrograms]=useState<Program[]>([]);
  const [courses,setCourses]=useState<Course[]>([]);
  const [readiness,setReadiness]=useState<Readiness|null>(null);
  const [readinessError,setReadinessError]=useState('');
  const [publications,setPublications]=useState<{program_id:string;degree_route:string;version:number;effective_year:string}[]>([]);
  const [selected,setSelected]=useState('');
  const [programInput,setProgramInput]=useState<ProgramInput>(emptyProgram);
  const [courseInput,setCourseInput]=useState<CourseInput>(emptyCourse);
  const [programFormOpen,setProgramFormOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [filter,setFilter]=useState('');
  const [sourcePreview,setSourcePreview]=useState<{code:string;name:string;page:string;sourceTotal:number;draftCourseCount:number;alreadyImported:boolean}[]>([]);
  const [sourceOpen,setSourceOpen]=useState(false);
  const active=programs.find(p=>p.id===selected);
  const programCourses=useMemo(()=>courses.filter(c=>c.program_id===selected)
    .sort((a,b)=>a.year-b.year||a.semester-b.semester||a.code.localeCompare(b.code)),
    [courses,selected]);
  const sum=useMemo(()=>[
    programInput.generalCredits,programInput.collegeCredits,programInput.majorCredits,
    programInput.minorCredits,programInput.electiveCredits,
  ].reduce((n,v)=>n+Number(v||0),0),[programInput]);
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const r=await fetch('/api/curriculum/programs',{cache:'no-store'});
      const data=await r.json();
      if(!r.ok)throw new Error(messageFrom(data));
      setPrograms(data.programs||[]);setCourses(data.courses||[]);setPublications(data.publications||[]);
      setSelected(prev=>data.programs?.some((p:Program)=>p.id===prev)?prev:(data.programs?.[0]?.id||''));
    }catch(e){setError(e instanceof Error?e.message:'Unable to load curriculum drafts.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    if(!selected){setReadiness(null);setReadinessError('');return;}
    const controller=new AbortController();
    setReadiness(null);setReadinessError('');
    void fetch('/api/curriculum/programs/'+encodeURIComponent(selected)+'/readiness',{
      signal:controller.signal,cache:'no-store',
    }).then(async r=>{
      if(!r.ok)throw new Error('Readiness report unavailable.');
      return r.json();
    }).then(data=>{if(!controller.signal.aborted)setReadiness(data);})
      .catch(()=>{if(!controller.signal.aborted)setReadinessError('Could not verify curriculum completeness.');});
    return ()=>controller.abort();
  },[selected,programs,courses]);

  const loadSourcePreview=async()=>{
    setError('');
    try{
      const response=await fetch('/api/curriculum/reference/college-science',{cache:'no-store'});
      const result=await response.json();
      if(!response.ok)throw new Error(messageFrom(result));
      setSourcePreview(result.programs||[]);
      setSourceOpen(true);
    }catch(e){setError(e instanceof Error?e.message:'Unable to load the source preview.');}
  };
  const importReferenceDrafts=async()=>{
    if(!window.confirm('Import the College of Science PDF reference records as UNVERIFIED DRAFTS only? No live course or program will be created.'))return;
    const result=await mutate('/api/curriculum/reference/college-science/import','POST',{
      confirmation:'IMPORT_UNVERIFIED_DRAFTS'
    });
    if(result){
      setMessage(`Imported ${result.imported} draft programs and ${result.courseSamples} sample course rows; ${result.skipped} existing references skipped. All imported records require Registrar review.`);
      await loadSourcePreview();
    }
  };
  const mutate=async(url:string,method:'POST'|'PATCH'|'DELETE',data?:object)=>{
    setBusy(true);setError('');setMessage('');
    try{
      const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
      const result=await r.json();
      if(!r.ok)throw new Error(messageFrom(result));
      await load();
      setMessage('Changes saved successfully.');
      return result;
    }catch(e){setError(e instanceof Error?e.message:'The request failed.');return null;}
    finally{setBusy(false);}
  };
  const submitProgram=async(event:React.FormEvent)=>{
    event.preventDefault();
    if(Math.abs(sum-Number(programInput.requiredCredits))>0.001){
      setError('The component credits must add up to the required total. Check the university source document.');return;
    }
    const updating=!!(active&&programFormOpen);
    const result=await mutate(updating?'/api/curriculum/programs/'+active.id:'/api/curriculum/programs',
      updating?'PATCH':'POST',programInput);
    if(result){setProgramFormOpen(false);setProgramInput(emptyProgram);if(result.program?.id)setSelected(result.program.id);}
  };
  const submitCourse=async(event:React.FormEvent)=>{
    event.preventDefault();if(!active)return;
    const result=await mutate('/api/curriculum/programs/'+active.id+'/courses','POST',{
      ...courseInput,year:Number(courseInput.year),semester:Number(courseInput.semester),
    });
    if(result)setCourseInput(emptyCourse);
  };
  const submitStatus=async(status:Program['status'])=>{
    if(!active)return;
    if(status==='approved'&&!window.confirm('Approve this internal curriculum draft for catalog preparation? This does NOT publish the program to live admissions or registration.'))return;
    await mutate('/api/curriculum/programs/'+active.id+'/status','POST',{status});
  };
  const publishCurriculum=async()=>{
    if(!active||!canApprove)return;
    const year=window.prompt('Enter approved effective academic year (e.g., 2027-2028). Publishing will make the course list and credit requirements visible to all public visitors.');
    if(!year)return;
    if(!window.confirm('Publish the approved curriculum for '+active.name+'? This is a separate public release; live registrations and student degree rules will NOT change.'))return;
    await mutate('/api/curriculum/programs/'+active.id+'/publish','POST',
      {effectiveYear:year,confirmation:'PUBLISH_PUBLIC_CURRICULUM'});
  };
  const withdrawCurriculum=async()=>{
    if(!active||!canApprove)return;
    if(!window.confirm('Withdraw the public curriculum listing for '+active.name+'? Existing student records will not change.'))return;
    await mutate('/api/curriculum/programs/'+active.id+'/withdraw','POST',
      {confirmation:'WITHDRAW_PUBLIC_CURRICULUM'});
  };
  const removeCourse=async(course:Course)=>{
    if(!active||!window.confirm('Remove '+course.code+' from this draft curriculum?'))return;
    await mutate('/api/curriculum/programs/'+active.id+'/courses/'+course.id,'DELETE');
  };
  if(!['super_admin','registrar'].includes(currentUser.role))
    return <div role="alert" className="rounded-xl bg-white p-6">Curriculum administration requires Registrar or Super Administrator authorization.</div>;
  return <div className="space-y-5">
    <section className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#987a53]">Protected university administration</p>
          <h2 className="mt-1 text-2xl font-bold text-[#35103b]">Curriculum Studio</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Enter actual programs, course codes, credit requirements and year-by-year sequences. Drafts remain separate from live academic catalogs until reviewed and published through a distinct authorized process.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#4a1249] hover:bg-[#faf4fa]"><RefreshCw className="h-4 w-4"/>Refresh</button>
          <button type="button" onClick={()=>void loadSourcePreview()} className="inline-flex items-center gap-2 rounded-lg border border-[#dacbdb] px-3 py-2 text-sm font-semibold text-[#4a1249] hover:bg-[#faf4fa]"><BookOpen className="h-4 w-4"/>PDF reference drafts</button>
          <button type="button" onClick={()=>{setSelected('');setProgramInput(emptyProgram);setProgramFormOpen(true);}}
            className="hiau-dashboard-selected inline-flex items-center gap-2 rounded-lg border border-[#C39A53] bg-[#4a1249] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#661b69]"><Plus className="h-4 w-4"/>New program draft</button>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true"/>
        <p>The uploaded College of Science document has conflicting program totals and course codes. Enter each value with its source page and obtain academic confirmation before approving. Draft approvals do not automatically change enrolled students or graduation policies.</p>
      </div>
    </section>
    {sourceOpen&&<section aria-label="College of Science reference import" className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-lg font-semibold text-[#35103b]">College of Science · PDF reference intake</h3>
          <p className="mt-1 text-sm text-slate-600">Eight source-derived program candidates with provisional REF- identifiers, sample course sequences, source pages and mandatory discrepancy reviews. No university program codes are invented.</p></div>
        <button type="button" onClick={()=>setSourceOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Close preview</button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[580px] text-left text-sm">
          <thead><tr className="border-b bg-[#faf8fb] text-slate-700"><th className="p-2">Reference program</th><th className="p-2">Source page(s)</th><th className="p-2">Credit candidate</th><th className="p-2">Course examples</th><th className="p-2">Status</th></tr></thead>
          <tbody>{sourcePreview.map(p=><tr className="border-b last:border-0" key={p.code}>
            <td className="p-2"><strong>{p.name}</strong><span className="block text-xs text-slate-600">{p.code}</span></td>
            <td className="p-2">{p.page}</td><td className="p-2">{p.sourceTotal}</td><td className="p-2">{p.draftCourseCount}</td>
            <td className="p-2">{p.alreadyImported?'Already in drafts':'Not yet imported'}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy||sourcePreview.every(p=>p.alreadyImported)} onClick={()=>void importReferenceDrafts()}
          className="rounded-lg bg-[#4a1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Import unverified drafts</button>
        <p className="text-xs text-amber-900">Imports are non-destructive and skipped on repeat. Drafts cannot enter review until reference codes and source conflicts are resolved.</p>
      </div>
    </section>}
    {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {message&&<p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
    {programFormOpen&&<form onSubmit={event=>void submitProgram(event)} className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[#35103b]">{active?'Edit program draft':'New academic program draft'}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(f=><label key={f.key} className="block text-sm font-medium text-slate-700">
          {f.label}<input required={f.key!=='sourcePage'} type={f.type||'text'} min={f.type==='number'?'0':undefined} step={f.type==='number'?'0.5':undefined}
            disabled={busy} value={programInput[f.key]}
            onChange={e=>setProgramInput(prev=>({...prev,[f.key]:e.target.value}))}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#35103b] disabled:bg-slate-100"/>
        </label>)}
      </div>
      <label className="mt-3 block text-sm font-medium text-slate-700">Curriculum source notes / discrepancies
        <textarea rows={3} value={programInput.notes} onChange={e=>setProgramInput(prev=>({...prev,notes:e.target.value}))}
          className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="For example: total credits differ between source pages 2 and 5; registrar verification required."/>
      </label>
      <p className="mt-3 text-sm text-slate-600">Calculated category total: <strong>{sum} credits</strong> · Stated program total: <strong>{programInput.requiredCredits||'—'}</strong></p>
      <div className="mt-4 flex gap-2"><button disabled={busy} type="submit" className="rounded-lg bg-[#4a1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save draft</button>
        <button type="button" onClick={()=>setProgramFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button></div>
    </form>}
    <div className="grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-[#e6dce7] bg-white p-4 shadow-sm">
        <label className="mb-3 block text-sm font-medium text-[#35103b]">Find program
          <input type="search" placeholder="Program name or code" value={filter} onChange={e=>setFilter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"/>
        </label>
        <div className="max-h-[620px] space-y-2 overflow-y-auto">
          {loading?<p className="text-sm text-slate-600">Loading curriculum drafts…</p>:
          programs.filter(p=>(p.name+' '+p.code).toLowerCase().includes(filter.toLowerCase())).map(p=>
            <button type="button" key={p.id} onClick={()=>{setSelected(p.id);setProgramFormOpen(false);}} aria-current={selected===p.id?'true':undefined}
              className={`w-full rounded-lg border p-3 text-left text-sm ${selected===p.id?'border-[#4a1249] bg-[#f7eff7]':'border-slate-200 hover:bg-slate-50'}`}>
              <span className="block font-semibold text-[#35103b]">{p.name}</span><span className="mt-1 block text-xs text-slate-600">{p.code} · {credit(p.required_half)} credits</span>
              <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] capitalize text-[#4a1249]">{p.status.replace('_',' ')}</span>
            </button>)}
          {!loading&&programs.length===0&&<p className="rounded-lg bg-[#faf8fb] p-4 text-sm text-slate-600">No curriculum drafts yet. Create the first program to start building the catalog.</p>}
        </div>
      </aside>
      <div className="min-w-0 space-y-5">
        {!active?<section className="rounded-2xl border border-dashed border-[#dbc9de] bg-white p-8 text-center text-sm text-slate-600">Select a program to review its curriculum or create a draft to begin.</section>:
        <>
          <section className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-widest text-[#97774e]">{active.college}</p>
                <h3 className="mt-1 text-xl font-semibold text-[#35103b]">{active.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{active.code} · {active.credential} · {credit(active.required_half)} required credits</p>
                <p className="mt-2 text-xs text-slate-600">Source: {active.source_title}{active.source_page?' · Page '+active.source_page:''}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {active.status==='draft'&&<button type="button" onClick={()=>{setProgramInput(fromProgram(active));setProgramFormOpen(true);}}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-[#4a1249]">Edit requirements</button>}
                {active.status==='draft'&&<button disabled={busy} onClick={()=>void submitStatus('in_review')} className="rounded-lg bg-[#4a1249] px-3 py-2 text-sm font-semibold text-white">Submit for review</button>}
                {active.status==='in_review'&&canApprove&&<button disabled={busy} onClick={()=>void submitStatus('approved')} className="inline-flex items-center gap-2 rounded-lg bg-[#4a1249] px-3 py-2 text-sm font-semibold text-white"><FileCheck className="h-4 w-4"/>Approve draft</button>}
                {active.status!=='draft'&&canApprove&&<button disabled={busy} onClick={()=>void submitStatus('draft')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Reopen for corrections</button>}
                {active.status==='approved'&&canApprove&&!publications.some(p=>p.program_id===active.id)&&
                  <button type="button" disabled={busy} onClick={()=>void publishCurriculum()} className="rounded-lg bg-[#4a1249] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Publish to degree page</button>}
                {canApprove&&publications.some(p=>p.program_id===active.id)&&
                  <button type="button" disabled={busy} onClick={()=>void withdrawCurriculum()} className="rounded-lg border border-amber-400 bg-white px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50">Withdraw publication</button>}
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {([
                ['General',active.general_half],['College',active.college_half],
                ['Major',active.major_half],['Minor',active.minor_half],
                ['Electives',active.elective_half],['Total',active.required_half],
              ] as [string,number][]).map(([label,count])=><div key={label} className="rounded-lg bg-[#faf8fb] p-3">
                <p className="text-xs text-slate-600">{label}</p><strong className="text-lg text-[#35103b]">{credit(count)}</strong>
              </div>)}
            </div>
            {active.notes&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Source review: {active.notes}</p>}
            {publications.filter(p=>p.program_id===active.id).map(p=>
              <p key={p.degree_route} className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
                Published on public degree page · Version {p.version} · Effective {p.effective_year}
              </p>)}
            {active.status==='approved'&&!publications.some(p=>p.program_id===active.id)&&
              <p className="mt-3 rounded-lg bg-[#faf8fb] p-3 text-xs text-slate-600">
                Approved internally; not yet publicly released. Only a Super Administrator can publish an approved curriculum.
              </p>}
            {active.status==='approved'&&<p className="mt-3 text-xs font-semibold text-emerald-800"><CheckCircle2 className="mr-1 inline h-4 w-4"/>Approved for internal catalog preparation. Not published to admissions or registration.</p>}
          </section>
          <section aria-label="Curriculum readiness checks" className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#35103b]">Curriculum readiness audit</h3>
              {readiness&&<span className={`rounded-full px-3 py-1 text-xs font-bold ${readiness.ready?'bg-emerald-50 text-emerald-800':'bg-amber-50 text-amber-900'}`}>
                {readiness.ready?'No blocking issues':'Needs academic corrections'}
              </span>}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Checks entered credit totals, duplicate course codes, prerequisite order, missing verified courses, and unresolved source-document notes.
              A passing automated check is not a substitute for academic approval.
            </p>
            {readinessError&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{readinessError}</p>}
            {!readiness&&!readinessError&&<p role="status" className="mt-3 text-sm text-slate-600">Checking academic data…</p>}
            {readiness&&<>
              <p className="mt-4 text-sm font-semibold text-[#35103b]">
                {readiness.courseCount} entered courses · {readiness.errorCount} blocking issue(s) · {readiness.warningCount} advisory note(s)
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(readiness.totals).map(([category,item])=>
                  <div key={category} className="rounded-lg border border-[#e7dce8] p-3">
                    <p className="text-xs font-medium capitalize text-slate-600">{category}</p>
                    <p className="mt-1 text-sm font-bold text-[#35103b]">{item.listed} entered / {item.required} required</p>
                  </div>)}
              </div>
              {readiness.findings.length>0?<ul className="mt-4 space-y-2">
                {readiness.findings.map((issue,index)=><li key={issue.code+'-'+index}
                  className={`rounded-lg border px-3 py-2 text-sm ${issue.severity==='error'?'border-red-200 bg-red-50 text-red-900':'border-amber-200 bg-amber-50 text-amber-950'}`}>
                  <span className="font-semibold">{issue.severity==='error'?'Fix required':'Review'}:</span> {issue.detail}
                </li>)}
              </ul>:<p className="mt-4 text-sm font-semibold text-emerald-800">The entered course list passes the automated consistency checks.</p>}
            </>}
          </section>
          <section className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-[#4a1249]"/><h3 className="text-lg font-semibold text-[#35103b]">Year-by-year curriculum sequence</h3></div>
            {programCourses.length===0?<p className="rounded-lg bg-[#faf8fb] p-5 text-sm text-slate-600">No courses entered. Add the required course codes and semester sequence below.</p>:
              <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm">
                <thead><tr className="border-b bg-[#faf8fb] text-xs text-slate-600">
                  <th className="p-3">Year / Semester</th><th className="p-3">Course</th><th className="p-3">Category</th><th className="p-3">Credits</th><th className="p-3">Prerequisites / Source</th>{active.status==='draft'&&<th className="p-3">Actions</th>}
                </tr></thead>
                <tbody>{programCourses.map(c=><tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">Year {c.year} · Sem. {c.semester}</td>
                  <td className="p-3"><strong className="text-[#35103b]">{c.code}</strong><span className="block text-slate-600">{c.title}</span></td>
                  <td className="p-3 capitalize">{c.category}</td><td className="p-3">{credit(c.credits_half)}</td>
                  <td className="p-3 text-xs text-slate-600">{c.prerequisite_codes||'None listed'}{c.source_page&&<span className="block">Page {c.source_page}</span>}</td>
                  {active.status==='draft'&&<td className="p-3"><button type="button" onClick={()=>void removeCourse(c)} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label={'Remove '+c.code}><Trash2 className="h-4 w-4"/></button></td>}
                </tr>)}</tbody>
              </table></div>}
          </section>
          {active.status==='draft'&&<form onSubmit={event=>void submitCourse(event)} className="rounded-2xl border border-[#e6dce7] bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#35103b]"><BookOpen className="h-5 w-5"/>Add a course to the sequence</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {([
                ['code','Course code'],['title','Official course title'],
                ['credits','Credits'],['year','Study year'],['semester','Semester'],
                ['prerequisites','Prerequisite course codes'],['sourcePage','Source page'],
                ['notes','Verification notes'],
              ] as [keyof CourseInput,string][]).map(([key,label])=><label key={key} className="text-sm font-medium text-slate-700">{label}
                <input type={['credits','year','semester'].includes(key)?'number':'text'}
                  required={['code','title','credits','year','semester'].includes(key)}
                  step={key==='credits'?'0.5':'1'} min={['credits','year','semester'].includes(key)?'0.5':undefined}
                  value={courseInput[key]} onChange={event=>setCourseInput(prev=>({...prev,[key]:event.target.value}))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#35103b]"/>
              </label>)}
              <label className="text-sm font-medium text-slate-700">Requirement category
                <select value={courseInput.category} onChange={event=>setCourseInput(prev=>({...prev,category:event.target.value as Course['category']}))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#35103b]">
                  {categoryNames.map(k=><option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </label>
            </div>
            <button type="submit" disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4a1249] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4"/>Save course</button>
          </form>}
        </>}
      </div>
    </div>
  </div>;
};
