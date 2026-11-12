import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import {Operations} from './operations';
import {installInstitutionalPartners} from './institutionalPartners';
import {installPartnerCollaboration} from './partnerCollaboration';
import {installPartnerDistribution} from './partnerDistribution';

test('approved partner materials remain dark until explicitly licensed and granted to active HIAU users',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-distribution-'));
  const store=new Operations(directory);
  const app=express();
  let role='super_admin',userId='admin-test',email='admin@hiau.example';
  app.use(express.json());
  app.use((_req,res,next)=>{
    res.locals.actor={id:userId,email,name:'Test User',role,title:''};
    next();
  });
  installInstitutionalPartners(app,store);
  installPartnerCollaboration(app,store);
  installPartnerDistribution(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const address=server.address();
  if(!address||typeof address==='string')throw Error('No server address.');
  const base='http://127.0.0.1:'+address.port;
  const call=async(method:string,route:string,body?:unknown)=>{
    const response=await fetch(base+route,{
      method,
      headers:{'content-type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
    });
    return {status:response.status,data:await response.json().catch(()=>null)};
  };
  const prefix='/api/partner-distribution';
  try{
    // Create actual eligible faculty and an enrolled student, plus an ineligible user.
    const faculty=crypto.randomUUID(),student=crypto.randomUUID(),inactive=crypto.randomUUID();
    for(const [id,mail,asRole] of [
      [faculty,'faculty@hiau.example','lecturer'],
      [student,'student@hiau.example','student'],
      [inactive,'alumni@hiau.example','alumni'],
    ]){
      store.run('INSERT INTO users(id,email,name,role,title,department) VALUES(?,?,?,?,?,?)',
        id,mail,asRole,asRole,'','');
    }
    const program=crypto.randomUUID(),term=crypto.randomUUID(),application=crypto.randomUUID();
    store.run('INSERT INTO programs(id,code,title,required_credits,created_at) VALUES(?,?,?,?,?)',
      program,'PARTNER-PROGRAM','Test program',120,new Date().toISOString());
    store.run('INSERT INTO terms(id,code,title,start_date,end_date,status,max_credits,created_at) VALUES(?,?,?,?,?,?,?,?)',
      term,'PARTNER-TERM','Test term','2026-01-01','2099-12-31','open',20,new Date().toISOString());
    store.run(`INSERT INTO applications(id,number,full_name,email,phone,program_id,status,decision_note,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`,application,'PARTNER-APP','Active Student','student@hiau.example','',
      program,'admitted','',new Date().toISOString(),new Date().toISOString());
    store.run(`INSERT INTO students(id,user_id,application_id,student_number,full_name,email,program_id,admitted_term_id,status,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`,crypto.randomUUID(),student,application,'PARTNER-STU','Active Student',
      'student@hiau.example',program,term,'active',new Date().toISOString());
    const created=await call('POST','/api/institutional-partners',{
      name:'Test Academic Library Partner',country:'Liberia',
      contactEmail:'admin@partner.example',institutionType:'Academic Library',
    });
    assert.equal(created.status,200);
    const partnerId=created.data.partner.id;
    assert.equal((await call('POST','/api/institutional-partners/'+partnerId+'/verify',
      {verificationNote:'Test institution verified'})).status,200);
    assert.equal((await call('POST','/api/institutional-partners/'+partnerId+'/activate',{
      signedAgreementReference:'TEST-DISTRIBUTION',activities:['lectures'],
      startsOn:'2026-01-01',expiresOn:'2099-01-01',
    })).status,200);
    assert.equal((await call('POST','/api/partner-collaboration/admin/partners/'+partnerId+'/members',{
      name:'Research Librarian',email:'partner@institution.example',
    })).status,201);
    role='partner_representative';email='partner@institution.example';userId='partner-test';
    const submission=await call('POST','/api/partner-collaboration/resources',{
      kind:'lecture',title:'Academic cooperation lecture',summary:'Approved educational discussion',
      sourceUrl:'https://library.example/lectures/101',
      licenseStatement:'Licensed to share with individually approved HIAU learners',
      rightsConfirmed:true,
    });
    assert.equal(submission.status,201);
    const id=submission.data.resource.id;
    role='student';userId=student;email='student@hiau.example';
    assert.deepEqual((await call('GET',prefix+'/library')).data.resources,[]);
    assert.equal((await call('GET',prefix+'/library/'+id+'/access')).status,404);
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/authorize',{
      rightsEvidence:'spoof',rightsExpiresOn:'2099-01-01',
    })).status,403);
    role='super_admin';userId='admin-test';email='admin@hiau.example';
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/authorize',{
      rightsEvidence:'Signed rights verification',rightsExpiresOn:'2099-01-01',
    })).status,409,'review approval is a prerequisite to distribution');
    assert.equal((await call('POST','/api/partner-collaboration/admin/resources/'+id+'/review',{
      decision:'approved',note:'Confirmed license and permission',
    })).status,200);
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/authorize',{
      rightsEvidence:'Verified restricted distribution license',rightsExpiresOn:'2099-01-01',
    })).status,200);
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/grants',{userId:inactive})).status,403);
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/grants',{userId:student})).status,200);
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/grants',{userId:faculty})).status,200);
    role='student';userId=student;email='student@hiau.example';
    const library=await call('GET',prefix+'/library');
    assert.equal(library.status,200);
    assert.equal(library.data.resources.length,1);
    assert.equal('source_url' in library.data.resources[0],false,'listing never includes an external URL');
    const access=await call('GET',prefix+'/library/'+id+'/access');
    assert.equal(access.status,200);
    assert.equal(access.data.url,'https://library.example/lectures/101');
    role='lecturer';userId=faculty;email='faculty@hiau.example';
    assert.equal((await call('GET',prefix+'/library/'+id+'/access')).status,200);
    role='alumni';userId=inactive;email='alumni@hiau.example';
    assert.equal((await call('GET',prefix+'/library')).status,403);
    role='super_admin';userId='admin-test';email='admin@hiau.example';
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/grants/'+student+'/revoke',{})).status,200);
    role='student';userId=student;email='student@hiau.example';
    assert.equal((await call('GET',prefix+'/library/'+id+'/access')).status,404);
    // Even an existing faculty grant is immediately denied when licensing expires.
    role='super_admin';userId='admin-test';email='admin@hiau.example';
    store.run('UPDATE institutional_partner_distributions SET rights_expires_on=? WHERE resource_id=?','2025-12-31',id);
    role='lecturer';userId=faculty;email='faculty@hiau.example';
    assert.equal((await call('GET',prefix+'/library/'+id+'/access')).status,404);
    role='super_admin';userId='admin-test';email='admin@hiau.example';
    assert.equal((await call('POST',prefix+'/admin/resources/'+id+'/withdraw',{reason:'Test copyright takedown'})).status,200);
    assert.ok(store.one("SELECT COUNT(*) AS n FROM audit WHERE action='PARTNER_DISTRIBUTION_WITHDRAWN'").n>0);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
