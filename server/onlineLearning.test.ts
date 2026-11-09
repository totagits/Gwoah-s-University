import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installOnlineLearning} from './onlineLearning';

test('course-scoped online sessions and resources require a real assigned instructor or registered student',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-learning-test-'));
  const store=new Operations(directory);
  const roles:Record<string,string>={admin:'super_admin',lecturer:'lecturer',outsider:'lecturer',student:'student',other:'student',bursar:'bursar'};
  const actors=Object.entries(roles).map(([id,role])=>({id,name:id,email:id+'@example.test',role}));
  store.saveUsers(actors);
  const actor=(id:string)=>({id,role:roles[id]}) as any;
  const run=(action:string,data:any)=>store.execute(actor('admin'),action,data);
  const program=run('program',{code:'ONL',title:'Online test program',requiredCredits:3});
  const term=run('term',{code:'ONL26',title:'Online class term',startDate:'2026-01-01',endDate:'2027-01-01',status:'open',maxCredits:12});
  const course=run('course',{code:'ONL101',title:'Intro to online learning',credits:3,feePerCredit:'5.00',programId:program.id});
  const section=run('section',{courseId:course.id,termId:term.id,lecturerId:'lecturer',code:'A',capacity:4,location:'Remote',schedule:'Tuesday'});
  for(const [id,number] of [['student','S1'],['other','S2']]){
    const app=run('application',{fullName:id,email:id+'@example.test',programId:program.id});
    run('reviewApplication',{id:app.id,status:'approved',note:'Test'});
    run('admit',{applicationId:app.id,studentNumber:number,termId:term.id});
  }
  store.execute(actor('student'),'register',{sectionId:section.id});
  const app=express();app.use(express.json());
  app.use((req,res,next)=>{
    const id=req.get('x-test-user')||'student';
    res.locals.actor={id,role:roles[id]||'bursar',name:id};
    next();
  });
  installOnlineLearning(app,store);
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
  const url='http://127.0.0.1:'+(server.address() as any).port;
  const call=(id:string,route:string,body?:any)=>fetch(url+route,{
    method:body?'POST':'GET',headers:{'x-test-user':id,'Content-Type':'application/json'},
    ...(body?{body:JSON.stringify(body)}:{}),
  });
  try{
    const empty=await(await call('other','/api/classroom/state')).json();
    assert.equal(empty.sections.length,0,'nonenrolled student may not see another class');
    assert.equal(empty.sessions.length,0);
    assert.equal((await call('bursar','/api/classroom/state')).status,403);
    assert.equal((await call('student','/api/classroom/sessions',{sectionId:section.id,title:'Spoofed',startsAt:new Date().toISOString(),endsAt:new Date(Date.now()+3600000).toISOString()})).status,403);
    assert.equal((await call('outsider','/api/classroom/sessions',{sectionId:section.id,title:'Spoofed',startsAt:new Date().toISOString(),endsAt:new Date(Date.now()+3600000).toISOString()})).status,403);
    const start=new Date(Date.now()-60_000).toISOString(),end=new Date(Date.now()+60*60_000).toISOString();
    assert.equal((await call('lecturer','/api/classroom/sessions',{sectionId:section.id,title:'Untrusted',startsAt:start,endsAt:end,meetingUrl:'http://unapproved.example'})).status,400);
    const scheduled=await call('lecturer','/api/classroom/sessions',{
      sectionId:section.id,title:'Seminar on data literacy',startsAt:start,endsAt:end,
      meetingUrl:'https://meeting.example.org/authorized-class',notes:'Bring lecture notes',
    });
    assert.equal(scheduled.status,201);
    const session=(await scheduled.json()).session;
    assert.equal((await call('other','/api/classroom/sessions/'+session.id+'/check-in',{})).status,403);
    const checked=await call('student','/api/classroom/sessions/'+session.id+'/check-in',{});
    assert.equal(checked.status,200);
    const checkedAgain=await call('student','/api/classroom/sessions/'+session.id+'/check-in',{});
    assert.equal(checkedAgain.status,200);
    assert.equal(store.all('SELECT * FROM class_attendance').length,1,'check-in is idempotent');
    assert.equal((await call('student','/api/classroom/resources',{sectionId:section.id,title:'Tampered',kind:'notes',url:'https://example.org'})).status,403);
    const resource=await call('lecturer','/api/classroom/resources',{sectionId:section.id,title:'Week 1 notes',kind:'notes',url:'https://university.example.org/notes',description:'Before class'});
    assert.equal(resource.status,201);
    const studentView=await(await call('student','/api/classroom/state')).json();
    assert.equal(studentView.sections.length,1);
    assert.equal(studentView.sessions.length,1);
    assert.equal(studentView.sessions[0].meeting_url,'https://meeting.example.org/authorized-class');
    assert.equal(studentView.resources.length,1);
    assert.equal(studentView.attendance.length,1);
    assert.equal(studentView.capabilities.liveVideoProviderConnected,false);
    const teacherView=await(await call('lecturer','/api/classroom/state')).json();
    assert.equal(teacherView.attendanceCount[0].attended,1);
    const otherView=await(await call('other','/api/classroom/state')).json();
    assert.equal(otherView.sessions.length,0);
    assert.equal(otherView.resources.length,0);
    const snapshot=store.exportSnapshot();
    assert.equal(snapshot.tables.class_sessions.length,1);
    assert.equal(snapshot.tables.class_resources.length,1);
    assert.equal(snapshot.tables.class_attendance.length,1);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();fs.rmSync(directory,{recursive:true,force:true});
  }
});

test('live classroom portal uses authenticated records, not simulated participants',()=>{
  const dir=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
  const source=fs.readFileSync(path.join(dir,'src/App.tsx'),'utf8');
  const page=fs.readFileSync(path.join(dir,'src/components/portal/SecureOnlineLearning.tsx'),'utf8');
  assert.match(source,/<SecureOnlineLearning currentUser=\{currentUser\} \/>/);
  assert.doesNotMatch(source,/<VirtualClassroomCollab currentUser=/);
  assert.match(page,/fetch\('\/api\/classroom\/state'/);
  assert.match(page,/live-video provider, automatic recording and graded online assessment are/);
  assert.doesNotMatch(page,/Dr\. Moses S\. Doe|Sando Fahnbulleh/);
});
