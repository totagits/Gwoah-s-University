import React, {useCallback,useEffect,useState} from 'react';
import {Building2,RefreshCw,ShieldCheck,Plus,ClipboardCheck,ShieldOff} from 'lucide-react';
import type {UserProfile} from '../../types';

type Agreement={id:string;signed_reference:string;activities:string[];starts_on:string;expires_on:string;revoked_at:string|null};
type Partner={id:string;name:string;country:string;contact_email:string;institution_type:string;notes?:string;status:'draft'|'verified'|'active'|'suspended';agreements?:Agreement[]};
const choices=[
  ['lectures','Lessons & guest lectures'],['symposiums','Seminars & symposiums'],
  ['research','Collaborative research'],['library','Digital library resources'],['courses','Course collaboration'],
] as const;
const today=new Date().toISOString().slice(0,10);
const blank={name:'',country:'',contactEmail:'',institutionType:'University',notes:''};
const read=async(response:Response)=>{
  const data=await response.json().catch(()=>({error:'The server did not return a valid response.'}));
  if(!response.ok)throw new Error(data.error||'This request could not be completed.');
  return data;
};
const field='w-full rounded-lg border border-[#C9BDD2] bg-white px-3 py-2.5 text-sm text-[#27152F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249]';
const primary='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 font-semibold text-white hover:bg-[#341034] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249] disabled:cursor-not-allowed disabled:opacity-50';
const secondary='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#BFAAC4] bg-white px-4 py-2 font-semibold text-[#4A1249] hover:bg-[#F5EEF6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249] disabled:cursor-not-allowed disabled:opacity-50';
const Label:React.FC<{children:React.ReactNode}>=({children})=><span className="mb-1 block text-sm font-semibold text-[#35103B]">{children}</span>;

export const PartnerAdministration:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const [partners,setPartners]=useState<Partner[]>([]);
  const [selected,setSelected]=useState<Partner|null>(null);
  const [form,setForm]=useState(blank);
  const [creating,setCreating]=useState(false);
  const [verification,setVerification]=useState('');
  const [reference,setReference]=useState('');
  const [start,setStart]=useState(today);
  const [end,setEnd]=useState('');
  const [activities,setActivities]=useState<string[]>([]);
  const [reason,setReason]=useState('');
  const [memberName,setMemberName]=useState('');
  const [memberEmail,setMemberEmail]=useState('');
  const [members,setMembers]=useState<Array<{id:string;email:string;name:string;revoked_at:string|null}>>([]);
  const [activationLink,setActivationLink]=useState('');
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const isAdmin=currentUser.role==='super_admin';
  const detail=useCallback(async(id:string)=> {
    const data=await read(await fetch('/api/institutional-partners/'+encodeURIComponent(id),{cache:'no-store'}));
    setSelected(data.partner);
    const people=await read(await fetch('/api/partner-collaboration/admin/partners/'+encodeURIComponent(id)+'/members',{cache:'no-store'}));
    setMembers(people.members);
    setActivationLink('');
  },[]);
  const load=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const data=await read(await fetch('/api/institutional-partners',{cache:'no-store'}));
      setPartners(data.partners);
      if(selected)await detail(selected.id);
    }catch(e){setError(e instanceof Error?e.message:'Unable to retrieve institutional partnerships.');}
    finally{setLoading(false);}
  },[detail,selected?.id]);
  useEffect(()=>{void load();},[]); // Explicit refresh after mutations avoids looping network requests.
  const mutate=async(endpoint:string,body:unknown,success:string)=>{
    setBusy(true);setError('');setNotice('');
    try{
      const data=await read(await fetch(endpoint,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
      }));
      setSelected(data.partner);
      const list=await read(await fetch('/api/institutional-partners',{cache:'no-store'}));
      setPartners(list.partners);
      setNotice(success);
      setCreating(false);
    }catch(e){setError(e instanceof Error?e.message:'Unable to complete the request.');}
    finally{setBusy(false);}
  };
  const invitePartner=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!selected)return;
    setBusy(true);setError('');setNotice('');setActivationLink('');
    try{
      const member=await read(await fetch('/api/partner-collaboration/admin/partners/'+selected.id+'/members',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:memberName,email:memberEmail}),
      }));
      const invitation=await read(await fetch('/api/identity/invite',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:memberName,email:memberEmail,role:'partner_representative'}),
      }));
      setActivationLink(invitation.activationUrl);
      setNotice('Representative authorized. Share this activation link securely with the intended recipient.');
      setMemberName('');setMemberEmail('');
      const list=await read(await fetch('/api/partner-collaboration/admin/partners/'+selected.id+'/members'));
      setMembers(list.members);
    }catch(e){
      setError(e instanceof Error?e.message:'Could not authorize the representative.');
    }finally{setBusy(false);}
  };
  const revokeMember=async(id:string)=>{
    if(!selected||!window.confirm('Revoke this representative’s access?'))return;
    setBusy(true);setError('');setActivationLink('');
    try{
      await read(await fetch('/api/partner-collaboration/admin/members/'+id+'/revoke',{
        method:'POST',headers:{'Content-Type':'application/json'},body:'{}',
      }));
      setMembers((await read(await fetch('/api/partner-collaboration/admin/partners/'+selected.id+'/members'))).members);
      setNotice('Partner membership revoked. All further partner requests are denied.');
    }catch(e){setError(e instanceof Error?e.message:'Revocation failed.');}
    finally{setBusy(false);}
  };
  if(!isAdmin)return <section className="rounded-xl border bg-white p-6" role="alert">Access to institutional partnership administration is restricted.</section>;
  return <section className="mx-auto w-full max-w-7xl space-y-5 text-[#24162A]" aria-labelledby="partner-heading">
    <header className="rounded-2xl border border-[#E3D8E6] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#916D31]">Protected university administration</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div><h2 id="partner-heading" className="flex items-center gap-2 text-2xl font-bold text-[#35103B]"><Building2 aria-hidden="true"/> Institutional Partnerships</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Register and verify prospective academic partners. Only an approved institution with an
            in-force agreement can be activated. This registry does not grant a partner login, publish
            academic material, license library access, or award course credit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={secondary} type="button" onClick={()=>void load()} disabled={loading||busy}><RefreshCw size={16}/> Refresh</button>
          <button className={primary} type="button" onClick={()=>{setCreating(v=>!v);setError('');}} disabled={busy}><Plus size={16}/> New partner draft</button>
        </div>
      </div>
    </header>
    {error&&<p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {notice&&<p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">{notice}</p>}
    {creating&&<form className="grid gap-3 rounded-2xl border border-[#E3D8E6] bg-white p-5 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();void mutate('/api/institutional-partners',form,'Partner draft created for administrative review.');}}>
      <h3 className="sm:col-span-2 text-lg font-bold text-[#35103B]">Register prospective institution</h3>
      <label><Label>Official institution name</Label><input required maxLength={180} className={field} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label><Label>Country</Label><input required maxLength={100} className={field} value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></label>
      <label><Label>Institutional contact email</Label><input required type="email" maxLength={254} className={field} value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})}/></label>
      <label><Label>Institution type</Label><select className={field} value={form.institutionType} onChange={e=>setForm({...form,institutionType:e.target.value})}><option>University</option><option>College</option><option>Research Institution</option><option>Academic Library</option><option>Professional Organization</option><option>Other Academic Institution</option></select></label>
      <label className="sm:col-span-2"><Label>Verification notes (optional)</Label><textarea maxLength={2000} rows={2} className={field} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      <div className="sm:col-span-2 flex flex-wrap justify-end gap-2"><button type="button" className={secondary} onClick={()=>setCreating(false)}>Cancel</button><button disabled={busy} className={primary}>Create draft</button></div>
    </form>}
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.5fr)]">
      <section className="min-w-0 rounded-2xl border border-[#E3D8E6] bg-white p-4" aria-label="Institutional partner records">
        <h3 className="mb-3 font-bold text-[#35103B]">Institution directory ({partners.length})</h3>
        {loading?<p className="text-sm">Loading institution records…</p>:partners.length===0?
          <p className="rounded-lg bg-[#F7F4F8] p-4 text-sm text-slate-700">No partner institutions registered. Create a draft to begin a documented review.</p>:
          <div className="space-y-2">{partners.map(p=><button key={p.id} type="button" onClick={()=>{setError('');void detail(p.id).catch(e=>setError(String(e)));}} aria-pressed={selected?.id===p.id}
            className={`w-full rounded-xl border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249] ${selected?.id===p.id?'border-[#4A1249] bg-[#F5EEF6]':'border-[#E3D8E6] hover:bg-[#F9F5FA]'}`}>
            <span className="block font-semibold text-[#35103B]">{p.name}</span>
            <span className="mt-1 block text-xs text-slate-600">{p.country} · {p.institution_type}</span>
            <span className="mt-2 inline-block rounded-full border border-[#CAB9D0] px-2 py-0.5 text-xs font-semibold capitalize text-[#4A1249]">{p.status}</span>
          </button>)}</div>}
      </section>
      <section className="min-w-0 rounded-2xl border border-[#E3D8E6] bg-white p-5" aria-label="Selected partnership and approval controls">
        {!selected?<p className="text-sm text-slate-700">Select an institution to inspect its verification, permitted activities and agreement history.</p>:<>
          <h3 className="text-xl font-bold text-[#35103B]">{selected.name}</h3>
          <p className="mt-1 break-words text-sm text-slate-700">{selected.country} · {selected.institution_type} · {selected.contact_email}</p>
          <p className="mt-2 text-sm"><span className="font-semibold">Status:</span> <span className="capitalize">{selected.status}</span></p>
          {selected.status==='draft'&&<form className="mt-5 space-y-3 border-t pt-4" onSubmit={e=>{e.preventDefault();void mutate(`/api/institutional-partners/${selected.id}/verify`,{verificationNote:verification},'Institution verification recorded.');}}>
            <h4 className="flex items-center gap-2 font-semibold text-[#35103B]"><ClipboardCheck size={17}/> Human verification</h4>
            <label><Label>Verification evidence and decision notes</Label><textarea required maxLength={2000} rows={3} className={field} value={verification} onChange={e=>setVerification(e.target.value)} placeholder="Record what official registration or accreditation evidence was checked."/></label>
            <button className={primary} disabled={busy||!verification.trim()}>Record verification</button>
          </form>}
          {selected.status==='verified'&&<form className="mt-5 space-y-4 border-t pt-4" onSubmit={e=>{e.preventDefault();void mutate(`/api/institutional-partners/${selected.id}/activate`,{signedAgreementReference:reference,activities,startsOn:start,expiresOn:end},'Institution activated with a recorded agreement.');}}>
            <h4 className="flex items-center gap-2 font-semibold text-[#35103B]"><ShieldCheck size={17}/> Agreement-controlled activation</h4>
            <p className="text-xs text-slate-600">Enter a reference to an actual, authorized signed agreement. This field does not upload or authenticate the original document.</p>
            <label><Label>Signed agreement reference</Label><input className={field} required maxLength={300} value={reference} onChange={e=>setReference(e.target.value)} placeholder="Document number / approved institutional record"/></label>
            <fieldset><legend className="mb-2 text-sm font-semibold text-[#35103B]">Permitted collaboration activities</legend>
              <div className="grid gap-2 sm:grid-cols-2">{choices.map(([key,label])=><label key={key} className="flex items-center gap-2 rounded-lg border border-[#E3D8E6] p-2 text-sm"><input type="checkbox" className="accent-[#4A1249]" checked={activities.includes(key)} onChange={e=>setActivities(v=>e.target.checked?[...v,key]:v.filter(i=>i!==key))}/>{label}</label>)}</div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2"><label><Label>Agreement starts</Label><input required type="date" className={field} value={start} onChange={e=>setStart(e.target.value)}/></label>
              <label><Label>Agreement expires</Label><input required type="date" className={field} min={today} value={end} onChange={e=>setEnd(e.target.value)}/></label></div>
            <button className={primary} disabled={busy||activities.length===0||!reference.trim()||!end}>Activate agreement</button>
          </form>}
          {['active','verified'].includes(selected.status)&&<form className="mt-5 space-y-3 border-t pt-4" onSubmit={e=>{e.preventDefault();if(!window.confirm('Suspend this institution and revoke every current agreement?'))return;void mutate(`/api/institutional-partners/${selected.id}/suspend`,{reason},'Institution suspended and agreements revoked.');}}>
            <h4 className="flex items-center gap-2 font-semibold text-[#35103B]"><ShieldOff size={17}/> Suspend partnership</h4>
            <label><Label>Reason for suspension</Label><textarea required maxLength={1000} rows={2} className={field} value={reason} onChange={e=>setReason(e.target.value)}/></label>
            <button type="submit" className={secondary} disabled={busy||!reason.trim()}>Suspend and revoke agreements</button>
          </form>}
          {selected.status==='active'&&<section className="mt-5 space-y-3 border-t pt-4" aria-label="Authorized institution representatives">
            <h4 className="font-semibold text-[#35103B]">Partner representative accounts</h4>
            <p className="text-xs text-slate-600">A verified, active agreement is required. Representatives have no access to Registrar, Finance, or staff administrative modules.</p>
            <form onSubmit={invitePartner} className="grid gap-3 sm:grid-cols-2">
              <label><Label>Representative full name</Label><input className={field} required maxLength={100} value={memberName} onChange={e=>setMemberName(e.target.value)}/></label>
              <label><Label>Institutional email address</Label><input className={field} type="email" required maxLength={254} value={memberEmail} onChange={e=>setMemberEmail(e.target.value)}/></label>
              <div className="sm:col-span-2"><button className={primary} disabled={busy}>Authorize and generate activation link</button></div>
            </form>
            {activationLink&&<div className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-semibold">One-time activation link (expires in 48 hours)</p>
              <p className="mt-1 break-all font-mono text-xs">{activationLink}</p>
              <button type="button" className={secondary} onClick={()=>void navigator.clipboard.writeText(activationLink)}>Copy activation link</button>
              <p className="mt-1 text-xs">Only share with the authorized recipient through a secure channel; do not publish this link.</p>
            </div>}
            {members.length>0&&<ul className="space-y-2">{members.map(m=><li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E3D8E6] p-2 text-sm">
              <span className="break-all"><strong>{m.name}</strong> · {m.email} {m.revoked_at?'(revoked)':''}</span>
              {!m.revoked_at&&<button type="button" disabled={busy} className={secondary} onClick={()=>void revokeMember(m.id)}>Revoke</button>}
            </li>)}</ul>}
          </section>}
          <div className="mt-5 border-t pt-4"><h4 className="font-semibold text-[#35103B]">Agreement history</h4>
            {!selected.agreements?.length?<p className="mt-2 text-sm text-slate-600">No signed agreement recorded.</p>:
            <ul className="mt-2 space-y-2">{selected.agreements.map(a=><li key={a.id} className="break-words rounded-lg border border-[#E3D8E6] p-3 text-sm">
              <p className="font-semibold">{a.signed_reference}</p>
              <p className="mt-1 text-slate-700">{a.starts_on} through {a.expires_on}</p>
              <p className="mt-1 text-slate-700">Scope: {a.activities.join(', ')}</p>
              {a.revoked_at&&<p className="mt-1 font-semibold text-red-800">Revoked</p>}
            </li>)}</ul>}
          </div>
        </>}
      </section>
    </div>
  </section>;
};
