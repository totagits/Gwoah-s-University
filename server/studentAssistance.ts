import type {Express} from 'express';
import {randomUUID} from 'node:crypto';
import {Operations} from './operations';
import {actorOf} from './identity';

const uuid=/^[a-f0-9-]{36}$/i;
const kinds=new Set(['scholarship','financial_aid','tuition_waiver']);
const now=()=>new Date().toISOString();
// Request-only workflow; does not issue awards, change tuition, or post credits.
export function installStudentAssistance(app:Express,store:Operations){
 const role=(res:any)=>actorOf(res)?.role||'';
 const registrar=(res:any)=>['registrar','super_admin'].includes(role(res));
 const finance=(res:any)=>['bursar','super_admin'].includes(role(res));
 app.get('/api/student/assistance',(req,res)=>{
  const actor=actorOf(res);
  if(!actor)return res.sendStatus(401);
  if(actor.role==='student'){
   const student=store.one('SELECT id FROM students WHERE user_id=?',actor.id);
   if(!student)return res.json({linked:false,requests:[],terms:[]});
   const requests=store.all(`SELECT r.id,r.kind,r.term_id,r.requested_cents,r.reason,r.status,
     r.registrar_note,r.finance_note,r.created_at,r.updated_at,t.title AS term_title
     FROM student_assistance_requests r JOIN terms t ON t.id=r.term_id
     WHERE r.student_id=? ORDER BY r.created_at DESC`,student.id);
   const terms=store.all("SELECT id,title FROM terms WHERE status='open' ORDER BY start_date");
   return res.json({linked:true,requests,terms});
  }
  if(!registrar(res)&&!finance(res))return res.sendStatus(403);
  const queue=registrar(res)?
    store.all(`SELECT a.*,s.student_number,s.full_name,t.title AS term_title
      FROM student_assistance_requests a JOIN students s ON s.id=a.student_id
      JOIN terms t ON t.id=a.term_id WHERE a.status='submitted'
      ORDER BY a.created_at LIMIT 100`):
    store.all(`SELECT a.*,s.student_number,s.full_name,t.title AS term_title
      FROM student_assistance_requests a JOIN students s ON s.id=a.student_id
      JOIN terms t ON t.id=a.term_id WHERE a.status='recommended'
      ORDER BY a.created_at LIMIT 100`);
  return res.json({requests:queue,queue:registrar(res)?'registrar':'finance'});
 });
 app.post('/api/student/assistance',(req,res)=>{
  const actor=actorOf(res);
  if(actor?.role!=='student')return res.sendStatus(403);
  const student=store.one('SELECT * FROM students WHERE user_id=?',actor.id);
  if(!student)return res.status(403).json({error:'Registrar-linked student record required.'});
  const {termId,kind,reason,requestedAmount}=req.body||{};
  if(typeof termId!=='string'||!uuid.test(termId)||!kinds.has(kind)||
     typeof reason!=='string'||reason.trim().length<20||reason.length>2000||
     typeof requestedAmount!=='string'||!/^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/.test(requestedAmount))
    return res.status(400).json({error:'Choose a valid term, assistance type, reason (20–2000 characters) and nonnegative USD amount.'});
  const term=store.one("SELECT id FROM terms WHERE id=? AND status='open'",termId);
  if(!term||student.status!=='active')return res.status(409).json({error:'Active student and open term required.'});
  const [whole,fraction='']=requestedAmount.split('.');
  const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if(!Number.isSafeInteger(cents)||cents>100000000000)return res.status(400).json({error:'Requested amount exceeds supported limit.'});
  try{
   const id=randomUUID(),time=now();
   store.transaction(()=>{
    store.run(`INSERT INTO student_assistance_requests
     (id,student_id,term_id,kind,requested_cents,reason,status,created_at,updated_at)
     VALUES(?,?,?,?,?,?, 'submitted',?,?)`,id,student.id,termId,kind,cents,reason.trim(),time,time);
    // Avoid storing highly sensitive free-text reason in generic audit records.
    store.audit(actor,'ASSISTANCE_SUBMITTED',id,null,
      {studentId:student.id,kind,termId,requestedCents:cents,status:'submitted'});
   });
   return res.status(201).json({id,status:'submitted',notice:'Application received. No financial award or tuition credit has been granted.'});
  }catch{return res.status(500).json({error:'Assistance request could not be saved.'});}
 });
 app.post('/api/student/assistance/:id/review',(req,res)=>{
  const actor=actorOf(res);
  if(!actor||(!registrar(res)&&!finance(res)))return res.sendStatus(403);
  if(!uuid.test(req.params.id))return res.sendStatus(404);
  const {decision,note}=req.body||{};
  if(typeof note!=='string'||note.trim().length<10||note.length>1200)
   return res.status(400).json({error:'Provide a decision reason (10–1200 characters).'});
  const registrarStage=registrar(res)&&['recommend','return','reject'].includes(decision);
  const financeStage=finance(res)&&['finance_review','return','reject'].includes(decision);
  if(!registrarStage&&!financeStage)return res.status(403).json({error:'Decision not authorized for this role.'});
  try{
   const result=store.transaction(()=>{
    const item=store.one('SELECT * FROM student_assistance_requests WHERE id=?',req.params.id);
    if(!item)return {error:'Request not found.',status:404};
    const stage=item.status==='submitted'?'registrar':item.status==='recommended'?'finance':null;
    if(!stage)return {error:'This request is no longer awaiting a decision.',status:409};
    if(stage==='registrar'&&!registrarStage||stage==='finance'&&!financeStage)
     return {error:'The request is awaiting a different approval stage.',status:403};
    if(item.student_id===actor.id||item.registrar_id===actor.id&&stage==='finance')
     return {error:'A reviewer may not review their own recommendation.',status:403};
    const status=decision==='recommend'?'recommended':
      decision==='finance_review'?'finance_reviewed':
      decision==='return'?'returned':'rejected';
    const time=now();
    if(stage==='registrar')
     store.run(`UPDATE student_assistance_requests SET status=?,registrar_note=?,registrar_id=?,updated_at=?
       WHERE id=?`,status,note.trim(),actor.id,time,item.id);
    else store.run(`UPDATE student_assistance_requests SET status=?,finance_note=?,finance_id=?,updated_at=?
       WHERE id=?`,status,note.trim(),actor.id,time,item.id);
    store.audit(actor,'ASSISTANCE_REVIEW',item.id,
      {status:item.status},{status,stage,reviewerId:actor.id});
    const student=store.one('SELECT user_id FROM students WHERE id=?',item.student_id);
    if(student?.user_id)store.notify(student.user_id,'finance',
      'Financial assistance request updated',
      'Your assistance request has a new review status. Sign in to view the decision.');
    return {id:item.id,status,notice:'Review recorded. No scholarship, waiver, payment or tuition adjustment has been posted.'};
   });
   if('error'in result)return res.status(typeof result.status==='number'?result.status:400).json({error:result.error});
   return res.json(result);
  }catch{return res.status(500).json({error:'Financial assistance review could not be completed.'});}
 });
}
