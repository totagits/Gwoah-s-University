import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installWorkspaces} from './workspaces';

test('staging-only Super Admin fixture creates one admitted active linked student and no academic/finance history',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-staging-student-'));
  const previousAppUrl=process.env.APP_URL;
  process.env.APP_URL='https://hiau-staging.totag.network';
  const store=new Operations(directory);
  const adminId=crypto.randomUUID(),studentUserId=crypto.randomUUID();
  const programId=crypto.randomUUID(),termId=crypto.randomUUID();
  store.saveUsers([
    {id:adminId,name:'University Administrator',email:'admin@hiau.example',role:'super_admin',title:'',department:''},
    {id:studentUserId,name:'MICHAEL GWOAH',email:'michael.staging@example.com',role:'student',title:'Staging Student',department:''},
  ]);
  const stamp=new Date().toISOString();
  store.run('INSERT INTO programs(id,code,title,required_credits,created_at) VALUES(?,?,?,?,?)',
    programId,'STG-BSC','Staging Bachelor Program',120,stamp);
  store.run('INSERT INTO terms(id,code,title,start_date,end_date,status,max_credits,created_at) VALUES(?,?,?,?,?,?,?,?)',
    termId,'STG-TERM','Staging Acceptance Term','2026-01-01','2099-12-31','open',18,stamp);

  const app=express();
  let actor:any={id:adminId,email:'admin@hiau.example',name:'University Administrator',role:'super_admin',title:''};
  app.use(express.json());
  app.use((_req,res,next)=>{res.locals.actor=actor;next();});
  installWorkspaces(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const address=server.address();
  if(!address||typeof address==='string')throw Error('No test server');
  const base='http://127.0.0.1:'+address.port;
  const call=async(method:string,url:string,body?:unknown)=>{
    const response=await fetch(base+url,{
      method,headers:{'content-type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
    });
    return {status:response.status,data:await response.json().catch(()=>null)};
  };

  try{
    const options=await call('GET','/api/workspaces/staging-student-setup');
    assert.equal(options.status,200);
    assert.equal(options.data.accounts.length,1);
    assert.equal(options.data.accounts[0].name,'MICHAEL GWOAH');
    assert.equal(options.data.programs[0].id,programId);
    assert.equal(options.data.terms[0].id,termId);

    const created=await call('POST','/api/workspaces/staging-student-setup',{
      accountId:studentUserId,programId,termId,
    });
    assert.equal(created.status,201);
    assert.equal(created.data.student.fullName,'MICHAEL GWOAH');
    assert.equal(created.data.student.status,'active');
    assert.match(created.data.student.studentNumber,/^HIAU-STG-\d{4}-[0-9A-F]{6}$/);

    const student=store.one('SELECT * FROM students WHERE user_id=?',studentUserId);
    assert.ok(student);
    assert.equal(student.email,'michael.staging@example.com');
    assert.equal(student.program_id,programId);
    assert.equal(student.admitted_term_id,termId);
    assert.equal(student.status,'active');
    assert.equal(student.financial_hold,0);
    const application=store.one('SELECT * FROM applications WHERE id=?',student.application_id);
    assert.equal(application.status,'admitted');
    assert.match(application.decision_note,/STAGING TEST ONLY/);

    for(const table of ['registrations','grades','invoices','payments','student_course_plans','student_assistance_requests'])
      assert.equal(store.one(`SELECT COUNT(*) AS n FROM ${table}`).n,0,'Fixture must not populate '+table);
    assert.equal(store.one("SELECT COUNT(*) AS n FROM audit WHERE action='STAGING_TEST_STUDENT_LINK'").n,1);

    const duplicate=await call('POST','/api/workspaces/staging-student-setup',{
      accountId:studentUserId,programId,termId,
    });
    assert.equal(duplicate.status,409);

    process.env.APP_URL='https://hiau.totag.network';
    const productionBlocked=await call('GET','/api/workspaces/staging-student-setup');
    assert.equal(productionBlocked.status,404);

    process.env.APP_URL='https://hiau-staging.totag.network';
    actor={id:studentUserId,email:'michael.staging@example.com',name:'MICHAEL GWOAH',role:'student',title:''};
    assert.equal((await call('GET','/api/workspaces/staging-student-setup')).status,403);
  }finally{
    process.env.APP_URL=previousAppUrl;
    server.closeAllConnections();
    await new Promise<void>((resolve,reject)=>server.close(error=>error&&
      (error as NodeJS.ErrnoException).code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
