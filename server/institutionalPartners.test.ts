import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { Operations } from './operations';
import { installInstitutionalPartners } from './institutionalPartners';

test('institutional partner registry is admin-only, audited, and agreement-gated', async () => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-partners-'));
  const store=new Operations(directory);
  const app=express();
  let role='student';
  app.use(express.json());
  app.use((_req,res,next)=>{
    res.locals.actor={id:'test-actor',email:'admin@example.org',name:'Tester',role,title:''};
    next();
  });
  installInstitutionalPartners(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  try {
    const addr=server.address();
    if(!addr||typeof addr==='string') throw new Error('Missing test port');
    const call=async (method:string,url:string,body?:unknown)=>{
      const response=await fetch(`http://127.0.0.1:${addr.port}${url}`,{
        method,headers:{'content-type':'application/json'},
        body:body===undefined?undefined:JSON.stringify(body),
      });
      return {status:response.status,data:await response.json()};
    };
    assert.equal((await call('GET','/api/institutional-partners')).status,403);
    assert.equal((await call('POST','/api/institutional-partners',{name:'Blocked'})).status,403);
    role='super_admin';
    const created=await call('POST','/api/institutional-partners',{
      name:'Test University (staging only)',country:'Liberia',
      contactEmail:'partner@example.org',institutionType:'University',
    });
    assert.equal(created.status,200);
    assert.equal(created.data.partner.status,'draft');
    const id=created.data.partner.id;
    assert.equal((await call('POST',`/api/institutional-partners/${id}/activate`,{
      signedAgreementReference:'Signed test MOU',
      activities:['lectures'],startsOn:'2026-01-01',expiresOn:'2099-01-01',
    })).status,409);
    assert.equal((await call('POST',`/api/institutional-partners/${id}/verify`,{
      verificationNote:'Verified registration for test only',
    })).data.partner.status,'verified');
    assert.equal((await call('POST',`/api/institutional-partners/${id}/activate`,{
      signedAgreementReference:'',activities:['lectures'],
      startsOn:'2026-01-01',expiresOn:'2099-01-01',
    })).status,400);
    assert.equal((await call('POST',`/api/institutional-partners/${id}/activate`,{
      signedAgreementReference:'Signed test MOU',activities:['lectures','library'],
      startsOn:'2026-01-01',expiresOn:'2099-01-01',
    })).data.partner.status,'active');
    const suspended=await call('POST',`/api/institutional-partners/${id}/suspend`,{
      reason:'Test revocation',
    });
    assert.equal(suspended.data.partner.status,'suspended');
    assert.ok(suspended.data.partner.agreements[0].revoked_at);
    assert.equal((await call('POST',`/api/institutional-partners/${id}/activate`,{
      signedAgreementReference:'Second test',activities:['research'],
      startsOn:'2026-01-01',expiresOn:'2099-01-01',
    })).status,409);
    assert.equal(store.one('SELECT COUNT(*) AS n FROM audit WHERE entity=?','institutional_partner').n,4);
    role='student';
    assert.equal((await call('GET',`/api/institutional-partners/${id}`)).status,403);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve,reject)=>server.close(error=>error&&
      (error as NodeJS.ErrnoException).code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
    store.sql.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
