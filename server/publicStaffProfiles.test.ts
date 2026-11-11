import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Operations} from './operations';
import {installPublicStaffProfiles} from './publicStaffProfiles';

test('WEB-02: public staff drafts are private until an authorized administrator publishes photo and biography',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-public-staff-'));
 const store=new Operations(dir);
 const app=express();
 app.use((req,res,next)=>{
   const role=req.get('x-test-role');
   if(role)res.locals.actor={id:'test-'+role,role,name:'Test'};
   next();
 });
 app.use(express.json({limit:'4mb'}));
 installPublicStaffProfiles(app,store,dir);
 const server=app.listen(0,'127.0.0.1');
 await new Promise<void>(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+(server.address() as any).port;
 const request=(url:string,role='visitor',method='GET',body?:object)=>fetch(base+url,{
   method,headers:{'Content-Type':'application/json','x-test-role':role},
   ...(body?{body:JSON.stringify(body)}:{}),
 });
 try{
   const form={name:'Fictional Dr. Academic Example',title:'Professor of Computing',
     category:'faculty',biography:'An approved fictional public professional biography for testing purposes.'};
   assert.equal((await request('/api/admin/public-staff')).status,403);
   assert.equal((await request('/api/admin/public-staff','registrar','POST',form)).status,403);
   const added=await request('/api/admin/public-staff','super_admin','POST',form);
   assert.equal(added.status,201);
   const id=(await added.json() as any).profile.id;
   assert.match(id,/^staff-[a-f0-9-]{36}$/);
   assert.deepEqual((await (await request('/api/public/staff')).json() as any).profiles,[]);
   assert.equal((await request('/api/public/staff/'+id+'/photo')).status,404);
   const prephoto=await request('/api/admin/public-staff/'+id+'/publish','super_admin','POST',{published:true});
   assert.equal(prephoto.status,409);
   const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(200)]);
   const upload=await request('/api/admin/public-staff/'+id+'/photo','super_admin','POST',{imageBase64:png.toString('base64')});
   assert.equal(upload.status,200);
   assert.equal((await request('/api/public/staff/'+id+'/photo')).status,404);
   assert.equal((await request('/api/admin/public-staff/'+id+'/publish','registrar','POST',{published:true})).status,403);
   assert.equal((await request('/api/admin/public-staff/'+id+'/publish','super_admin','POST',{published:true})).status,200);
   const published=(await (await request('/api/public/staff')).json() as any).profiles;
   assert.equal(published.length,1);
   assert.equal(published[0].name,form.name);
   assert.equal(published[0].category,'faculty');
   const image=await request('/api/public/staff/'+id+'/photo');
   assert.equal(image.status,200);
   assert.match(image.headers.get('content-type')||'',/image\/png/);
   assert.equal((await image.arrayBuffer()).byteLength,png.length);
   assert.equal((await request('/api/admin/public-staff/'+id+'/publish','super_admin','POST',{published:false})).status,200);
   assert.equal((await request('/api/public/staff/'+id+'/photo')).status,404);
   assert.deepEqual((await (await request('/api/public/staff')).json() as any).profiles,[]);
   assert.ok(store.all("SELECT action FROM audit WHERE action='PUBLIC_STAFF_PUBLISH'").length>0);
 }finally{
   server.closeAllConnections();
   await new Promise<void>(resolve=>server.close(()=>resolve()));
   store.close();fs.rmSync(dir,{recursive:true,force:true});
 }
});
