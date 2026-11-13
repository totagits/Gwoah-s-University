import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import {Operations} from './operations';
import {installInstitutionalPartners} from './institutionalPartners';
import {installPartnerCollaboration,partnerInviteAllowed} from './partnerCollaboration';

test('partner representatives are institution-scoped and submissions require agreement plus review',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-collaboration-'));
  const store=new Operations(directory);
  const app=express();
  let role='super_admin',email='reviewer@hiau.example';
  app.use(express.json());
  app.use((_req,res,next)=>{
    res.locals.actor={id:'test-reviewer',name:'Tester',role,email,title:''};
    next();
  });
  installInstitutionalPartners(app,store);
  installPartnerCollaboration(app,store);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const port=(server.address() as any).port;
  const call=async(method:string,route:string,body?:any)=>{
    const r=await fetch(`http://127.0.0.1:${port}${route}`,{
      method,headers:{'content-type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),
    });
    return {status:r.status,data:await r.json().catch(()=>null)};
  };
  try {
    const created=await call('POST','/api/institutional-partners',{
      name:'Academic Test Partner',country:'Liberia',contactEmail:'lead@partner.example',
      institutionType:'University',
    });
    const id=created.data.partner.id;
    assert.equal(partnerInviteAllowed(store,'person@partner.example'),false);
    await call('POST',`/api/institutional-partners/${id}/verify`,{
      verificationNote:'Checked test registration',
    });
    await call('POST',`/api/institutional-partners/${id}/activate`,{
      signedAgreementReference:'TEST-MOU-001',activities:['lectures','research'],
      startsOn:'2026-01-01',expiresOn:'2099-01-01',
    });
    const invalid=await call('POST',`/api/partner-collaboration/admin/partners/${id}/members`,{
      name:'Researcher',email:'bad-address',
    });
    assert.equal(invalid.status,400);
    const member=await call('POST',`/api/partner-collaboration/admin/partners/${id}/members`,{
      name:'Researcher',email:'person@partner.example',
    });
    assert.equal(member.status,201);
    assert.equal(partnerInviteAllowed(store,'person@partner.example'),true);
    const resourceUrl='/api/partner-collaboration/resources';
    role='partner_representative';email='person@partner.example';
    assert.equal((await call('GET','/api/institutional-partners')).status,403);
    assert.equal((await call('GET','/api/partner-collaboration/me')).status,200);
    const invalidRights=await call('POST',resourceUrl,{
      kind:'lecture',title:'Test lecture',summary:'Academic lecture notes',
      sourceUrl:'https://academic.example/lecture',licenseStatement:'Owned content',
      rightsConfirmed:false,
    });
    assert.equal(invalidRights.status,400);
    const invalidKind=await call('POST',resourceUrl,{
      kind:'library',title:'Test library',summary:'Academic library resources',
      sourceUrl:'https://academic.example/resource',licenseStatement:'Owned content',
      rightsConfirmed:true,
    });
    assert.equal(invalidKind.status,403,'agreement lacks library permission');
    const submitted=await call('POST',resourceUrl,{
      kind:'lecture',title:'International research lecture',
      summary:'Guest presentation and collaborative learning',
      sourceUrl:'https://academic.example/lecture',
      licenseStatement:'Institution has permission to share',
      rightsConfirmed:true,
    });
    assert.equal(submitted.status,201);
    const resourceId=submitted.data.resource.id;
    assert.equal((await call('GET',resourceUrl)).data.resources.length,1);
    role='super_admin';email='reviewer@hiau.example';
    assert.equal((await call('GET',resourceUrl)).data.resources[0].status,'submitted');
    const review=await call('POST',`/api/partner-collaboration/admin/resources/${resourceId}/review`,{
      decision:'approved',note:'Reviewed ownership and authorized scope',
    });
    assert.equal(review.status,200);
    const secondReview=await call('POST',`/api/partner-collaboration/admin/resources/${resourceId}/review`,{
      decision:'approved',note:'Double approval',
    });
    assert.equal(secondReview.status,409);
    const suspended=await call('POST',`/api/institutional-partners/${id}/suspend`,{
      reason:'Testing suspension',
    });
    assert.equal(suspended.status,200);
    assert.equal(partnerInviteAllowed(store,'person@partner.example'),false);
    role='partner_representative';email='person@partner.example';
    assert.equal((await call('GET','/api/partner-collaboration/me')).status,403);
    assert.equal((await call('POST',resourceUrl,{
      kind:'research',title:'Denied',summary:'Denied after revocation',
      sourceUrl:'https://academic.example/denied',licenseStatement:'Owned content',rightsConfirmed:true,
    })).status,403);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
