import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import express from 'express';
import { installIdentity } from './identity';
import { Operations } from './operations';
import { installPublicAdmissions, parsePublicApplication } from './publicAdmissions';

const application = {
  applicantName: 'Martha K. Example',
  email: 'martha@example.test',
  phone: '+231 770 123 456',
  programDesired: 'B.S. in Information Technology (IT)',
  faculty: 'College of Science, Technology & Allied Health',
  county: 'Montserrado',
  wassceIndex: 'X9874',
  wassceCoreSubjects: [
    {subject:'Mathematics',grade:'B2'},
    {subject:'English Language',grade:'B3'},
    {subject:'Core Elective',grade:'C4'}
  ],
  applyingForScholarship: true,
};

test('admissions validation rejects missing identity, invalid grades and missing aid choice', () => {
  assert.match((parsePublicApplication({...application,applicantName:''}) as {error:string}).error,/name/i);
  assert.match((parsePublicApplication({...application, email:'bad'}) as {error:string}).error,/email/i);
  assert.match((parsePublicApplication({...application, applyingForScholarship:undefined}) as {error:string}).error,/scholarship/i);
  assert.match((parsePublicApplication({...application,
    wassceCoreSubjects:[...application.wassceCoreSubjects.slice(0,2),{subject:'Core Elective',grade:'Z9'}]
  }) as {error:string}).error,/grade/i);
  assert.equal('error' in parsePublicApplication(application),false);
});

test('real HTTP admissions intake persists aid interest and protects applicant records', async () => {
  const dir=mkdtempSync(path.join(os.tmpdir(),'hiau-admissions-test-'));
  const operations=new Operations(dir);
  const app=express();
  app.use('/api/applications',express.json({limit:'12kb'}));
  const identity = installIdentity(app,{directory:dir,users:()=>[],save:()=>{},origin:'https://staging.example.test',secure:false});
  installPublicAdmissions(app,operations);
  const listener=app.listen(0,'127.0.0.1');
  try {
    if (!listener.listening) await new Promise<void>((resolve,reject) => {
      listener.once('listening',resolve);
      listener.once('error',reject);
    });
    const address=listener.address();
    if (!address || typeof address==='string') throw new Error('No HTTP test listener');
    const endpoint='http://127.0.0.1:'+address.port+'/api/applications';
    const post=(body:unknown,origin:string)=>fetch(endpoint,{
      method:'POST',headers:{'content-type':'application/json',origin},
      body:JSON.stringify(body),
    });
    const foreign=await post(application,'https://foreign.example.test');
    assert.notEqual(foreign.status,201,'Foreign-origin submission must not be accepted');
    const invalid=await post({...application,applicantName:''},'https://staging.example.test');
    assert.equal(invalid.status,400);
    const response=await post(application,'https://staging.example.test');
    assert.equal(response.status,201);
    const data=await response.json() as any;
    assert.match(data.application.applicationNumber,/^HIAU-[0-9A-F]{16}$/);
    const stored=operations.one(
      'SELECT * FROM public_admissions_intake WHERE application_number=?',
      data.application.applicationNumber
    );
    assert.equal(stored.full_name,application.applicantName);
    assert.equal(stored.email,application.email);
    assert.equal(stored.scholarship_interest,1);
    assert.equal(stored.status,'received');
    assert.deepEqual(JSON.parse(stored.grades_json),application.wassceCoreSubjects);
    const privateRead=await fetch(endpoint);
    assert.equal(privateRead.status,401,'Public must never list applicants');
    const declined=await post({...application,applyingForScholarship:false},'https://staging.example.test');
    assert.equal(declined.status,201);
    assert.equal(operations.one('SELECT scholarship_interest FROM public_admissions_intake WHERE application_number=?',
      (await declined.json() as any).application.applicationNumber).scholarship_interest,0);
  } finally {
    listener.closeAllConnections();
    if (listener.listening) await new Promise<void>((resolve,reject)=>listener.close(error=>error?reject(error):resolve()));
    identity.close();
    operations.sql.close();
    rmSync(dir,{recursive:true,force:true});
  }
});
