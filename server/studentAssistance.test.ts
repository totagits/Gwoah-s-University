import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import type {Server} from 'node:http';
import {Operations} from './operations';
import {installStudentAssistance} from './studentAssistance';

test('ERP-STUDENT-01D: own-student privacy, separated reviews, no credits or financial awards',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-aid-'));
 const store=new Operations(dir);
 const [student,other,studentUser,otherUser,registrar,bursar,program,term,appId,appOther]=
  Array.from({length:10},()=>randomUUID());
 const time=new Date().toISOString();
 for(const [id,role] of [[studentUser,'student'],[otherUser,'student'],
  [registrar,'registrar'],[bursar,'bursar']] as const)
  store.run('INSERT INTO users VALUES(?,?,?,?,?,?)',id,id+'@example.test',id,role,'','');
 store.run('INSERT INTO programs VALUES(?,?,?,?,?)',program,'P1','Sample Degree',120,time);
 store.run('INSERT INTO terms VALUES(?,?,?,?,?,?,?,?)',term,'T1','Open Term','2026-01-01','2027-12-31','open',18,time);
 for(const [id,user,aid] of [[student,studentUser,appId],[other,otherUser,appOther]] as const){
  store.run('INSERT INTO applications VALUES(?,?,?,?,?,?,?,?,?,?)',aid,'APP-'+aid,id,id+'@example.test','',program,'admitted','',time,time);
  store.run('INSERT INTO students VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    id,user,aid,'ST-'+id,id,id+'@example.test',program,term,'active',0,time);
 }
 const app=express();app.use(express.json());
 app.use((req,res,next)=>{
  const id=req.get('x-test-role')||'visitor';
  res.locals.actor={id,role:id===studentUser||id===otherUser?'student':
   id===registrar?'registrar':id===bursar?'bursar':'visitor'};
  next();
 });
 installStudentAssistance(app,store);
 const server:Server=await new Promise(ok=>{const s=app.listen(0,'127.0.0.1',()=>ok(s));});
 const addr=server.address();
 if(!addr||typeof addr==='string')throw Error('No test port');
 const base='http://127.0.0.1:'+addr.port;
 t.after(async()=>{await new Promise<void>((ok,bad)=>server.close(err=>err?bad(err):ok()));
  store.close();fs.rmSync(dir,{recursive:true,force:true});});
 const call=async(method:string,url:string,actor:string,data?:unknown)=>{
  const response=await fetch(base+url,{method,headers:{'x-test-role':actor,'content-type':'application/json'},
   body:data===undefined?undefined:JSON.stringify(data)});
  return {status:response.status,body:await response.json().catch(()=>({}))};
 };
 const root='/api/student/assistance';
 assert.equal((await call('GET',root,studentUser)).body.requests.length,0);
 assert.equal((await call('POST',root,bursar,{kind:'scholarship'})).status,403);
 assert.equal((await call('POST',root,studentUser,{termId:term,kind:'scholarship',
  reason:'short',requestedAmount:'50.00'})).status,400);
 const req=await call('POST',root,studentUser,{termId:term,kind:'financial_aid',
  reason:'Need-based assistance request for tuition review.',requestedAmount:'50.00'});
 assert.equal(req.status,201);
 const id=req.body.id;
 assert.equal((await call('GET',root,studentUser)).body.requests.length,1);
 assert.equal((await call('GET',root,otherUser)).body.requests.length,0);
 assert.equal((await call('GET',root,registrar)).body.requests.length,1);
 assert.equal((await call('GET',root,bursar)).body.requests.length,0);
 assert.equal((await call('POST',root+'/'+id+'/review',studentUser,{decision:'recommend',note:'Verified eligibility'})).status,403);
 assert.equal((await call('POST',root+'/'+id+'/review',bursar,{decision:'finance_review',note:'Reviewed documents'})).status,403);
 assert.equal((await call('POST',root+'/'+id+'/review',registrar,{decision:'recommend',note:'Academic recommendation confirmed'})).status,200);
 assert.equal((await call('GET',root,bursar)).body.requests.length,1);
 const review=await call('POST',root+'/'+id+'/review',bursar,{decision:'finance_review',note:'Finance reviewed for future award authorization'});
 assert.equal(review.status,200);
 assert.equal(review.body.status,'finance_reviewed');
 assert.equal((await call('POST',root+'/'+id+'/review',bursar,{decision:'finance_review',note:'Repeat action is forbidden'})).status,409);
 assert.equal((await call('GET',root,studentUser)).body.requests[0].status,'finance_reviewed');
 assert.equal(store.one('SELECT COUNT(*) AS n FROM invoices').n,0);
 assert.equal(store.one('SELECT COUNT(*) AS n FROM credit_notes').n,0);
 assert.equal(store.one('SELECT COUNT(*) AS n FROM payments').n,0);
 assert.equal(store.one('SELECT COUNT(*) AS n FROM audit WHERE action=?','ASSISTANCE_REVIEW').n,2);
 assert.equal(store.exportSnapshot().tables?.student_assistance_requests?.length,1);
});
