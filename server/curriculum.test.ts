import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installCurriculumStudio} from './curriculum';

test('curriculum administration keeps drafts private and separates approval from live catalog',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-curriculum-test-'));
  const store=new Operations(dir);
  const app=express();app.use(express.json());
  app.use((req,res,next)=>{
    const role=req.get('x-test-role')||'student';
    res.locals.actor={id:'actor-'+role,role,name:role,email:role+'@example.test'};
    next();
  });
  installCurriculumStudio(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const root='http://127.0.0.1:'+(server.address() as any).port;
  const request=async(method:string,url:string,role:string,body?:object)=>{
    const response=await fetch(root+url,{method,headers:{'Content-Type':'application/json','x-test-role':role},
      body:body?JSON.stringify(body):undefined});
    return {status:response.status,body:await response.json().catch(()=>null)};
  };
  try{
    const input={
      code:'BS-IT',name:'Bachelor of Science in Information Technology',
      college:'College of Science, Technology, and Allied Health',credential:'Bachelor of Science',
      generalCredits:6,collegeCredits:3,majorCredits:6,minorCredits:0,electiveCredits:0,
      requiredCredits:15,sourceTitle:'College of Science.pdf',sourcePage:'3, 6–7',
      notes:'Draft test data, not a sanctioned curriculum.',
    };
    const deny=await request('GET','/api/curriculum/programs','student');
    assert.equal(deny.status,403);
    const deniedWrite=await request('POST','/api/curriculum/programs','student',input);
    assert.equal(deniedWrite.status,403);
    const invalid=await request('POST','/api/curriculum/programs','registrar',{...input,requiredCredits:16});
    assert.equal(invalid.status,400);
    const created=await request('POST','/api/curriculum/programs','registrar',input);
    assert.equal(created.status,201);
    const id=created.body.program.id;
    assert.equal(created.body.program.status,'draft');
    assert.equal(store.all('SELECT * FROM programs').length,0);
    assert.equal(store.all('SELECT * FROM courses').length,0);
    const course=async(category:string,code:string,credits:number,year=1,semester=1)=>request('POST','/api/curriculum/programs/'+id+'/courses','registrar',
      {category,code,title:'Verified curriculum '+code,credits,year,semester,prerequisites:'',sourcePage:'6'});
    assert.equal((await course('general','ENGL 101',3)).status,201);
    assert.equal((await course('general','ENGL 102',3,1,2)).status,201);
    assert.equal((await course('college','ITCB 201',3)).status,201);
    assert.equal((await course('major','ITCB 401',3,3,1)).status,201);
    assert.equal((await course('major','ITCB 402',3,3,2)).status,201);
    assert.equal((await request('POST','/api/curriculum/programs/'+id+'/status','registrar',{status:'in_review'})).status,200);
    assert.equal((await request('POST','/api/curriculum/programs/'+id+'/courses','registrar',
      {code:'X',title:'Not allowed',category:'major',credits:1,year:1,semester:1})).status,409);
    assert.equal((await request('POST','/api/curriculum/programs/'+id+'/status','registrar',{status:'approved'})).status,403);
    assert.equal((await request('POST','/api/curriculum/programs/'+id+'/status','super_admin',{status:'approved'})).status,200);
    assert.equal(store.one('SELECT status FROM curriculum_programs WHERE id=?',id).status,'approved');
    assert.equal(store.all('SELECT * FROM programs').length,0,'approval must not create live programs');
    assert.equal(store.all('SELECT * FROM courses').length,0,'approval must not create live courses');
    const snapshot=store.exportSnapshot();
    assert.equal(snapshot.tables.curriculum_programs.length,1);
    assert.equal(snapshot.tables.curriculum_courses.length,5);
    store.importSnapshot(snapshot);
    assert.equal(store.all('SELECT * FROM curriculum_courses').length,5);
    const old={...snapshot,tables:{...snapshot.tables}};
    delete old.tables.curriculum_programs;delete old.tables.curriculum_courses;
    store.importSnapshot(old);
    assert.equal(store.all('SELECT * FROM curriculum_programs').length,0);
    assert.equal(store.all('SELECT * FROM curriculum_courses').length,0);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();
    if(path.dirname(dir)===os.tmpdir()&&path.basename(dir).startsWith('hiau-curriculum-test-'))
      fs.rmSync(dir,{recursive:true,force:true});
  }
});

test('college science PDF reference import is idempotent, isolated, and blocked from approval until reviewed',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-pdf-reference-'));
  const store=new Operations(directory);
  const app=express();app.use(express.json());
  app.use((req,res,next)=>{
    const role=req.get('x-test-role')||'student';
    res.locals.actor={id:role+'-actor',role,name:role};
    next();
  });
  installCurriculumStudio(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const url='http://127.0.0.1:'+(server.address() as any).port;
  const req=async(method:string,path:string,role:string,body?:object)=>{
    const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json','x-test-role':role},body:body?JSON.stringify(body):undefined});
    return {status:r.status,data:await r.json().catch(()=>null)};
  };
  try{
    const prefix='/api/curriculum/reference/college-science';
    assert.equal((await req('GET',prefix,'student')).status,403);
    assert.equal((await req('POST',prefix+'/import','student',{confirmation:'IMPORT_UNVERIFIED_DRAFTS'})).status,403);
    assert.equal((await req('POST',prefix+'/import','registrar',{confirmation:'wrong'})).status,400);
    const preview=await req('GET',prefix,'registrar');
    assert.equal(preview.status,200);assert.equal(preview.data.programs.length,8);
    assert.ok(preview.data.programs.every((p:any)=>p.code.startsWith('REF-')));
    const created=await req('POST',prefix+'/import','registrar',{confirmation:'IMPORT_UNVERIFIED_DRAFTS'});
    assert.equal(created.status,201);
    assert.equal(created.data.imported,8);
    assert.ok(created.data.courseSamples>=30);
    assert.equal(store.all('SELECT * FROM programs').length,0);
    assert.equal(store.all('SELECT * FROM courses').length,0);
    assert.equal(store.all('SELECT * FROM curriculum_programs').length,8);
    const second=await req('POST',prefix+'/import','registrar',{confirmation:'IMPORT_UNVERIFIED_DRAFTS'});
    assert.equal(second.status,201);assert.equal(second.data.imported,0);
    assert.equal(second.data.skipped,8);assert.equal(second.data.courseSamples,0);
    const source=store.one("SELECT * FROM curriculum_programs WHERE code='REF-HIAU-BS-IT'");
    assert.equal(source.status,'draft');assert.ok(source.notes.includes('SOURCE_REVIEW_REQUIRED'));
    assert.equal((await req('POST','/api/curriculum/programs/'+source.id+'/status','registrar',{status:'in_review'})).status,409);
    const p={
      name:source.name,code:'BS-IT-APPROVED',college:source.college,credential:source.credential,
      generalCredits:source.general_half/2,collegeCredits:source.college_half/2,
      majorCredits:source.major_half/2,minorCredits:source.minor_half/2,
      electiveCredits:source.elective_half/2,requiredCredits:source.required_half/2,
      sourceTitle:source.source_title,sourcePage:source.source_page,
      notes:'Registrar reviewed source, still missing required courses',
    };
    assert.equal((await req('PATCH','/api/curriculum/programs/'+source.id,'registrar',p)).status,200);
    const changed=store.one('SELECT * FROM curriculum_programs WHERE id=?',source.id);
    assert.equal(changed.code,'BS-IT-APPROVED');
    // Draft still needs the full curriculum. Sample courses do not grant approval.
    assert.equal((await req('POST','/api/curriculum/programs/'+source.id+'/status','registrar',{status:'in_review'})).status,200);
    assert.equal((await req('POST','/api/curriculum/programs/'+source.id+'/status','super_admin',{status:'approved'})).status,409);
    const snapshot=store.exportSnapshot();
    assert.equal(snapshot.tables.curriculum_programs.length,8);
    store.importSnapshot(snapshot);
    assert.equal(store.all('SELECT * FROM curriculum_programs').length,8);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();
    if(path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('hiau-pdf-reference-'))fs.rmSync(directory,{recursive:true,force:true});
  }
});
