import React,{useEffect,useState} from 'react';
import type {UserProfile} from '../../types';
import {ShieldCheck,RefreshCw,UserPlus} from 'lucide-react';

type Resource={id:string;title:string;kind:string;status:string;institution_name:string};
type Eligible={id:string;name:string;role:string};
type Grant={id:string;user_id:string;name:string;role:string;revoked_at:string|null};
type Distribution={rights_expires_on:string;rights_evidence:string;withdrawn_at:string|null};
type Detail={resource:Resource;distribution:Distribution|null;grants:Grant[]};
const field='w-full rounded-lg border border-[#CBBBD1] bg-white px-3 py-2.5 text-sm text-[#35103B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A1249]';
const primary='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4A1249] px-4 py-2 text-sm font-semibold text-white hover:bg-[#341034] disabled:opacity-50';
const secondary='inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#CBBBD1] bg-white px-4 py-2 text-sm font-semibold text-[#4A1249] disabled:opacity-50';
const api=async(response:Response)=>{const data=await response.json().catch(()=>({error:'No readable response.'}));if(!response.ok)throw Error(data.error||'Request failed.');return data;};
const today=new Date().toISOString().slice(0,10);
export const PartnerDistributionConsole:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
  const [resources,setResources]=useState<Resource[]>([]);
  const [users,setUsers]=useState<Eligible[]>([]);
  const [selected,setSelected]=useState('');
  const [details,setDetails]=useState<Detail|null>(null);
  const [evidence,setEvidence]=useState('');
  const [expiry,setExpiry]=useState('');
  const [userId,setUserId]=useState('');
  const [reason,setReason]=useState('');
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const admin=currentUser.role==='super_admin';
  const refresh=async(id=selected)=>{
    setLoading(true);setError('');
    try{
      const [items,people]=await Promise.all([
        api(await fetch('/api/partner-collaboration/resources',{cache:'no-store'})),
        api(await fetch('/api/partner-distribution/admin/eligible-users',{cache:'no-store'})),
      ]);
      setResources(items.resources.filter((r:Resource)=>r.status==='approved'));
      setUsers(people.users);
      const target=id||items.resources.find((r:Resource)=>r.status==='approved')?.id;
      if(target){
        setSelected(target);
        const detail=await api(await fetch('/api/partner-distribution/admin/resources/'+encodeURIComponent(target),{cache:'no-store'}));
        setDetails(detail);
      }else{setDetails(null);setSelected('');}
    }catch(e){setError(e instanceof Error?e.message:'Unable to load distribution permissions.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{if(admin)void refresh('');},[currentUser.id]);
  const select=async(id:string)=>{
    setSelected(id);setError('');setMessage('');
    try{setDetails(await api(await fetch('/api/partner-distribution/admin/resources/'+id,{cache:'no-store'})));}
    catch(e){setError(e instanceof Error?e.message:'Unable to load selected resource.');}
  };
  const action=async(path:string,body:unknown,success:string)=>{
    setBusy(true);setError('');setMessage('');
    try{
      await api(await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
      setMessage(success);
      await refresh(selected);
    }catch(e){setError(e instanceof Error?e.message:'Action failed.');}
    finally{setBusy(false);}
  };
  if(!admin)return <p role="alert" className="rounded-lg bg-white p-4">Only HIAU administrators may authorize partner resource distribution.</p>;
  const active=details?.distribution&&!details.distribution.withdrawn_at&&details.distribution.rights_expires_on>today;
  return <section aria-labelledby="distribution-title" className="mx-auto max-w-6xl space-y-5 text-[#301737]">
    <header className="rounded-xl border border-[#E4DCE9] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-[#916C35]">Protected HIAU academic governance</p>
      <h2 id="distribution-title" className="mt-2 flex items-center gap-2 text-2xl font-bold text-[#4A1249]"><ShieldCheck/> Partner Resource Distribution</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">Resource approval is separate from student/faculty publication. Verify the license and choose specific HIAU accounts; nothing is available to everyone by default.</p>
      <button type="button" className={secondary+' mt-3'} onClick={()=>void refresh()} disabled={loading||busy}><RefreshCw size={16}/> Refresh</button>
    </header>
    {error&&<p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    {message&&<p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950">{message}</p>}
    <div className="grid gap-4 lg:grid-cols-[minmax(200px,.85fr)_minmax(0,1.4fr)]">
      <section aria-label="Reviewed partner submissions" className="rounded-xl border border-[#E4DCE9] bg-white p-4">
        <h3 className="font-bold text-[#35103B]">Reviewed resources ({resources.length})</h3>
        {loading?<p className="mt-3 text-sm">Loading…</p>:resources.length===0?<p className="mt-3 text-sm text-slate-700">No approved partner resources yet.</p>:
          <div className="mt-3 space-y-2">{resources.map(r=><button key={r.id} type="button" onClick={()=>void select(r.id)}
            aria-pressed={selected===r.id} className={`w-full rounded-lg border p-3 text-left text-sm ${selected===r.id?'border-[#4A1249] bg-[#F5EEF6]':'border-[#E4DCE9] hover:bg-[#F8F2F8]'}`}>
            <span className="block font-semibold text-[#35103B]">{r.title}</span>
            <span className="mt-1 block text-xs text-slate-600">{r.institution_name} · {r.kind}</span>
          </button>)}</div>}
      </section>
      <section aria-label="Distribution authorization and access grants" className="space-y-5 rounded-xl border border-[#E4DCE9] bg-white p-5">
        {!details?<p className="text-sm text-slate-700">Select an approved resource to configure authorized distribution.</p>:<>
          <div><h3 className="text-xl font-bold text-[#35103B]">{details.resource.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{details.resource.institution_name}</p>
            <p className="mt-2 text-sm font-semibold">{active?'Distribution authorized':'Not currently distributed'}</p></div>
          {!active?<form className="space-y-3 border-t pt-4" onSubmit={e=>{e.preventDefault();void action('/api/partner-distribution/admin/resources/'+selected+'/authorize',{rightsEvidence:evidence,rightsExpiresOn:expiry},'Distribution rights reviewed and authorized.');}}>
            <h4 className="font-bold text-[#35103B]">Copyright and licensing verification</h4>
            <label className="block text-sm font-semibold">Review evidence / signed license or rights reference
              <textarea className={field+' mt-1'} required maxLength={1500} rows={3} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Record the verified license / rights evidence reference and scope."/>
            </label>
            <label className="block text-sm font-semibold">Rights expire on
              <input type="date" className={field+' mt-1'} required min={today} value={expiry} onChange={e=>setExpiry(e.target.value)}/>
            </label>
            <button type="submit" className={primary} disabled={busy||!evidence.trim()||!expiry}>Authorize controlled distribution</button>
          </form>:<>
            <p className="rounded-lg bg-[#F7F2F8] p-3 text-xs text-slate-700">License review: {details.distribution?.rights_evidence} · Expires {details.distribution?.rights_expires_on}</p>
            <div className="border-t pt-4">
              <h4 className="flex items-center gap-2 font-semibold text-[#35103B]"><UserPlus size={17}/> Grant access to named HIAU student or faculty</h4>
              <label className="mt-3 block text-sm font-semibold">Eligible student / faculty
                <select className={field+' mt-1'} required value={userId} onChange={e=>setUserId(e.target.value)}>
                  <option value="">Choose HIAU account</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </label>
              <button type="button" className={primary+' mt-3'} disabled={busy||!userId}
                onClick={()=>void action('/api/partner-distribution/admin/resources/'+selected+'/grants',{recipientId:userId},'Access granted to the selected HIAU account.')}>Grant access</button>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold text-[#35103B]">Revoke distribution</h4>
              <label className="mt-2 block text-sm font-semibold">Withdrawal reason
                <textarea required rows={2} maxLength={1000} className={field+' mt-1'} value={reason} onChange={e=>setReason(e.target.value)}/>
              </label>
              <button type="button" className={secondary+' mt-2'} disabled={busy||!reason.trim()}
                onClick={()=>void action('/api/partner-distribution/admin/resources/'+selected+'/withdraw',{reason},'All distribution blocked for this resource.')}>Withdraw distribution</button>
            </div>
          </>}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-[#35103B]">Individual access assignments</h4>
            {details.grants.length===0?<p className="mt-2 text-sm text-slate-600">No individual access granted.</p>:
              <ul className="mt-3 space-y-2">{details.grants.map(g=><li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E4DCE9] p-3 text-sm">
                <span>{g.name} ({g.role}) {g.revoked_at?'· Revoked':''}</span>
                {!g.revoked_at&&<button type="button" className={secondary} disabled={busy}
                  onClick={()=>void action('/api/partner-distribution/admin/resources/'+selected+'/grants/'+encodeURIComponent(g.user_id)+'/revoke',{},'Individual access revoked.')}>Revoke</button>}
              </li>)}</ul>}
          </div>
        </>}
      </section>
    </div>
  </section>;
};
