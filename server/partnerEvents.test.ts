import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installInstitutionalPartners} from './institutionalPartners';
import {installPartnerCollaboration} from './partnerCollaboration';
import {installPartnerEvents} from './partnerEvents';

test('partner lecture proposal requires agreement, HIAU approval, registration and verified attendance for certificates',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-events-'));
  const store=new Operations(directory);
  const adminId=crypto.randomUUID(),studentId=crypto.randomUUID(),facultyId=crypto.randomUUID();
  for(const [id,email,role,name] of [
    [adminId,'admin@hiau.example','super_admin','Test Admin'],
    [studentId,'student@hiau.example','student','Test Student'],
    [facultyId,'faculty@hiau.example','lecturer','Test Lecturer'],
  ]) store.run('INSERT INTO users(id,email,name,role,title,department) VALUES(?,?,?,?,?,?)',id,email,name,role,'','');

  const program=crypto.randomUUID(),term=crypto.randomUUID(),application=crypto.randomUUID(),studentRow=crypto.randomUUID();
  const stamp=new Date().toISOString();
  store.run('INSERT INTO programs(id,code,title,required_credits,created_at) VALUES(?,?,?,?,?)',program,'EVENTS','Events Test',120,stamp);
  store.run('INSERT INTO terms(id,code,title,start_date,end_date,status,max_credits,created_at) VALUES(?,?,?,?,?,?,?,?)',
    term,'EVENTS-TERM','Events Term','2026-01-01','2099-12-31','open',20,stamp);
  store.run(`INSERT INTO applications(id,number,full_name,email,phone,program_id,status,decision_note,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)`,application,'EVENT-APP','Test Student','student@hiau.example','',program,'admitted','',stamp,stamp);
  store.run(`INSERT INTO students(id,user_id,application_id,student_number,full_name,email,program_id,admitted_term_id,status,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?)`,studentRow,studentId,application,'EVENT-STU','Test Student','student@hiau.example',program,term,'active',stamp);

  const app=express();
  let actor:{id:string;email:string;name:string;role:'super_admin'|'student'|'lecturer'|'partner_representative';title:string}={id:adminId,email:'admin@hiau.example',name:'Test Admin',role:'super_admin',title:''};
  app.use(express.json());
  app.use((_req,res,next)=>{res.locals.actor=actor;next();});
  installInstitutionalPartners(app,store);
  installPartnerCollaboration(app,store);
  installPartnerEvents(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const address=server.address();
  if(!address||typeof address==='string')throw Error('No test server address');
  const base='http://127.0.0.1:'+address.port;
  const call=async(method:string,route:string,body?:unknown)=>{
    const response=await fetch(base+route,{
      method,headers:{'content-type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
    });
    return {status:response.status,data:await response.json().catch(()=>null)};
  };

  try{
    const draft=await call('POST','/api/institutional-partners',{
      name:'Fictional Events University',country:'Liberia',
      contactEmail:'admin@events.example',institutionType:'University',
    });
    assert.equal(draft.status,200);
    const partnerId=draft.data.partner.id;
    assert.equal((await call('POST','/api/institutional-partners/'+partnerId+'/verify',{
      verificationNote:'Automated test verification only',
    })).status,200);
    assert.equal((await call('POST','/api/institutional-partners/'+partnerId+'/activate',{
      signedAgreementReference:'TEST-EVENTS-AGREEMENT',
      activities:['lectures','symposiums'],startsOn:'2026-01-01',expiresOn:'2099-01-01',
    })).status,200);
    assert.equal((await call('POST','/api/partner-collaboration/admin/partners/'+partnerId+'/members',{
      name:'Partner Professor',email:'professor@events.example',
    })).status,201);

    actor={id:'partner-user',email:'professor@events.example',name:'Partner Professor',role:'partner_representative',title:''};
    const proposal=await call('POST','/api/partner-collaboration/events/proposals',{
      title:'International Research Methods Guest Lecture',
      eventType:'guest_lecture',
      summary:'A controlled cross-institutional academic lecture for HIAU learners and faculty.',
      deliveryMode:'online',
      meetingUrl:'https://events.example/lecture-room',
      startsAt:'2098-04-12T14:00:00Z',endsAt:'2098-04-12T16:00:00Z',
      timezone:'Africa/Monrovia',maxParticipants:50,certificateEligible:true,
    });
    assert.equal(proposal.status,201);
    const eventId=proposal.data.event.id;
    assert.equal(proposal.data.event.status,'proposed');

    actor={id:studentId,email:'student@hiau.example',name:'Test Student',role:'student',title:''};
    assert.deepEqual((await call('GET','/api/partner-collaboration/events')).data.events,[]);
    assert.equal((await call('POST','/api/partner-collaboration/events/'+eventId+'/register',{})).status,409);

    actor={id:adminId,email:'admin@hiau.example',name:'Test Admin',role:'super_admin',title:''};
    assert.equal((await call('POST','/api/partner-collaboration/events/'+eventId+'/review',{
      decision:'approved',note:'Academic scope, presenter and partnership reviewed.',registrationOpen:true,
    })).status,200);

    actor={id:studentId,email:'student@hiau.example',name:'Test Student',role:'student',title:''};
    const available=await call('GET','/api/partner-collaboration/events');
    assert.equal(available.status,200);
    assert.equal(available.data.events.length,1);
    assert.equal(available.data.events[0].registered,false);
    assert.equal((await call('POST','/api/partner-collaboration/events/'+eventId+'/register',{})).status,200);
    const access=await call('GET','/api/partner-collaboration/events/'+eventId+'/access');
    assert.equal(access.status,200);
    assert.equal(access.data.meetingUrl,'https://events.example/lecture-room');

    actor={id:facultyId,email:'faculty@hiau.example',name:'Test Lecturer',role:'lecturer',title:''};
    assert.equal((await call('POST','/api/partner-collaboration/events/'+eventId+'/register',{})).status,200);

    actor={id:'partner-user',email:'professor@events.example',name:'Partner Professor',role:'partner_representative',title:''};
    assert.equal((await call('GET','/api/partner-collaboration/events/'+eventId+'/participants')).status,403);

    actor={id:adminId,email:'admin@hiau.example',name:'Test Admin',role:'super_admin',title:''};
    const participants=await call('GET','/api/partner-collaboration/events/'+eventId+'/participants');
    assert.equal(participants.status,200);
    assert.equal(participants.data.participants.length,2);
    assert.equal((await call('POST','/api/partner-collaboration/events/'+eventId+'/attendance/'+studentId,{})).status,200);
    const certificate=await call('POST','/api/partner-collaboration/events/'+eventId+'/certificate/'+studentId,{});
    assert.equal(certificate.status,200);
    assert.match(certificate.data.certificateCode,/^HIAU-[0-9A-F]{12}$/);

    actor={id:studentId,email:'student@hiau.example',name:'Test Student',role:'student',title:''};
    const record=await call('GET','/api/partner-collaboration/events/my/participation');
    assert.equal(record.status,200);
    assert.equal(record.data.participation[0].status,'attended');
    assert.equal(record.data.participation[0].certificate_code,certificate.data.certificateCode);

    actor={id:adminId,email:'admin@hiau.example',name:'Test Admin',role:'super_admin',title:''};
    assert.equal((await call('POST','/api/partner-collaboration/events/'+eventId+'/cancel',{
      reason:'Automated cancellation test',
    })).status,200);
    actor={id:facultyId,email:'faculty@hiau.example',name:'Test Lecturer',role:'lecturer',title:''};
    assert.equal((await call('GET','/api/partner-collaboration/events/'+eventId+'/access')).status,403);

    const backup=store.exportSnapshot();
    assert.equal(backup.tables.institutional_partner_events.length,1);
    assert.equal(backup.tables.institutional_partner_event_registrations.length,2);
  }finally{
    server.closeAllConnections();
    await new Promise<void>((resolve,reject)=>server.close(error=>error&&
      (error as NodeJS.ErrnoException).code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
