import React,{useEffect,useState} from 'react';
import type {UserProfile} from '../../types';
type Student={id:string;student_number:string;full_name:string;email:string;user_id:null;application_status:string};
type Account={id:string;name:string;email:string};
export const RegistrarStudentLinking:React.FC<{currentUser:UserProfile}>=({currentUser})=>{
 const [students,setStudents]=useState<Student[]>([]),[accounts,setAccounts]=useState<Account[]>([]);
 const [studentId,setStudentId]=useState(''),[userId,setUserId]=useState('');
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const authorized=['super_admin','registrar'].includes(currentUser.role);
 const refresh=async()=>{
  const response=await fetch('/api/workspaces/student-links',{credentials:'same-origin',cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Unable to read unlinked student records.');
  setStudents(data.students||[]);setAccounts(data.accounts||[]);
 };
 useEffect(()=>{if(authorized)void refresh().catch(e=>setError(e.message));},[authorized]);
 if(!authorized)return null;
 const selected=students.find(s=>s.id===studentId);
 const eligible=accounts.filter(a=>selected&&a.email.toLowerCase()===selected.email.toLowerCase());
 const match=eligible.find(a=>a.id===userId);
 const submit=async()=>{
  if(!selected||!match||busy)return;
  if(!window.confirm('Link the existing approved record '+selected.student_number+' to the student account '+match.email+'? This is an audited Registrar action.'))return;
  setBusy(true);setError('');setMessage('');
  try{
   const auth=await fetch('/api/auth/me',{credentials:'same-origin',cache:'no-store'});
   const session=await auth.json().catch(()=>({}));
   if(!auth.ok||typeof session.csrf!=='string'||!session.csrf)throw new Error('Session verification unavailable. Refresh and sign in again.');
   const response=await fetch('/api/workspaces/student-links',{
    method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json','x-csrf-token':session.csrf},
    body:JSON.stringify({studentId,studentAccountId:userId})
   });
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Could not link student identity.');
   setStudentId('');setUserId('');
   await refresh();
   setMessage('Linked approved record '+data.studentNumber+'. Ask the student to refresh their workspace.');
  }catch(e){setError(e instanceof Error?e.message:'Linking failed.');}
  finally{setBusy(false);}
 };
 return <section aria-label="Registrar student account linking"
  className="mt-5 rounded-xl border border-purple-200 bg-white p-4 sm:p-6">
  <h2 className="text-lg font-bold text-[#4A1249]">Registrar — Student Identity Linking</h2>
  <p className="mt-2 text-sm leading-6 text-slate-600">Match an existing admitted student record to an activated Student account. This does not create enrollment, grades, payments or student records.</p>
  {error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  {message&&<p role="status" className="mt-2 text-sm text-green-800">{message}</p>}
  <div className="mt-4 grid gap-3 sm:grid-cols-2">
   <label className="text-sm font-semibold">Unlinked admitted student
    <select value={studentId} onChange={event=>{setStudentId(event.target.value);setUserId('');}}
     className="mt-1 block w-full rounded border border-slate-300 p-2.5">
     <option value="">Select an approved student record</option>
     {students.filter(s=>s.application_status==='admitted').map(student=>
      <option value={student.id} key={student.id}>{student.student_number} — {student.full_name}</option>)}
    </select>
   </label>
   <label className="text-sm font-semibold">Matching student login
    <select value={userId} onChange={event=>setUserId(event.target.value)} disabled={!selected}
     className="mt-1 block w-full rounded border border-slate-300 p-2.5 disabled:opacity-60">
     <option value="">Choose an account with the same email</option>
     {eligible.map(account=><option value={account.id} key={account.id}>{account.name} ({account.email})</option>)}
    </select>
   </label>
  </div>
  {selected&&!eligible.length&&<p className="mt-3 text-sm text-amber-800">No matching activated student account found. Verify admission and email identity before linking.</p>}
  <button type="button" disabled={!selected||!match||busy} onClick={()=>void submit()}
   className="hiau-brand-action mt-4 rounded bg-[#4A1249] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
   {busy?'Linking…':'Link verified student account'}
  </button>
  {!students.length&&<p className="mt-3 text-sm text-slate-600">No unlinked admitted student records exist. Complete the approved admissions and Registrar workflow before attempting to link an account.</p>}
 </section>;
};
