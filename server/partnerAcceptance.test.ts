import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import {Operations} from './operations';
import {hashPassword,installIdentity} from './identity';
import {installInstitutionalPartners} from './institutionalPartners';
import {installPartnerCollaboration,partnerInviteAllowed} from './partnerCollaboration';
import {installPartnerDistribution} from './partnerDistribution';

// Full HTTP session test. Unlike injected-actor unit tests this goes through
// the real cookie session, CSRF gate, identity invitations and role checks.
// It intentionally uses a temporary local database and no live user accounts.
test('authenticated partner -> review -> rights -> student/faculty access, with revocation and denial',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-acceptance-'));
  const store=new Operations(directory);
  const records=[
    {id:crypto.randomUUID(),email:'admin@hiau.example',name:'Test Admin',role:'super_admin'},
    {id:crypto.randomUUID(),email:'learner@hiau.example',name:'Eligible Learner',role:'student'},
    {id:crypto.randomUUID(),email:'other@hiau.example',name:'Unassigned Learner',role:'student'},
    {id:crypto.randomUUID(),email:'lecturer@hiau.example',name:'Faculty Member',role:'lecturer'},
  ].map(item=>({...item,title:'Test account'}));
  store.saveUsers(records);
  const p=crypto.randomUUID(),t=crypto.randomUUID();
  store.run('INSERT INTO programs(id,code,title,required_credits,created_at) VALUES(?,?,?,?,?)',p,'AUTH-PROG','Test program',120,new Date().toISOString());
  store.run('INSERT INTO terms(id,code,title,start_date,end_date,status,max_credits,created_at) VALUES(?,?,?,?,?,?,?,?)',
    t,'AUTH-TERM','Test academic term','2026-01-01','2099-12-31','open',20,new Date().toISOString());
  for(const [index,record] of records.entries()){
    if(record.role!=='student')continue;
    const application=crypto.randomUUID(),stamp=new Date().toISOString();
    store.run(`INSERT INTO applications(id,number,full_name,email,phone,program_id,status,decision_note,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`,application,'AUTH-APP-'+index,record.name,record.email,'',p,'admitted','',stamp,stamp);
    store.run(`INSERT INTO students(id,user_id,application_id,student_number,full_name,email,program_id,admitted_term_id,status,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`,crypto.randomUUID(),record.id,application,'AUTH-STU-'+index,record.name,record.email,p,t,'active',stamp);
  }
  const users=store.users();
  const app=express();
  app.use(express.json({limit:'32kb'}));
  const identity=installIdentity(app,{directory,users:()=>users,save:()=>store.saveUsers(users),
    origin:'http://127.0.0.1',secure:false,partnerInviteAllowed:(email)=>partnerInviteAllowed(store,email)});
  installInstitutionalPartners(app,store);
  installPartnerCollaboration(app,store);
  installPartnerDistribution(app,store);
  app.use('/api',(_req,res)=>res.status(404).json({error:'not found'}));
  const password='NotARealProductionSecret_12345';
  for(const record of records)
    identity.sql.prepare('UPDATE accounts SET password=? WHERE id=?').run(await hashPassword(password),record.id);
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const addr=server.address();
  if(!addr||typeof addr==='string')throw Error('No local listener');
  const base='http://127.0.0.1:'+addr.port;
  const doCall=async(method:string,route:string,body?:unknown,session?:{cookie:string;csrf:string})=>{
    const response=await fetch(base+route,{
      method,headers:{
        'Origin':'http://127.0.0.1',
        'Content-Type':'application/json',
        ...(session?{'Cookie':session.cookie,'X-CSRF-Token':session.csrf}:{}),
      },body:body===undefined?undefined:JSON.stringify(body),
      redirect:'manual',
    });
    return {status:response.status,data:await response.json().catch(()=>null),
      cookie:response.headers.get('set-cookie')||''};
  };
  const login=async(address:string,secret=password)=>{
    const response=await doCall('POST','/api/auth/login',{email:address,password:secret});
    assert.equal(response.status,200,'Actual session login for '+address);
    assert.ok(response.cookie.includes('gu_session='));
    return {cookie:response.cookie.split(';')[0],csrf:response.data.csrf as string};
  };
  try{
    const admin=await login('admin@hiau.example');
    const student=await login('learner@hiau.example');
    const other=await login('other@hiau.example');
    const lecturer=await login('lecturer@hiau.example');
    assert.equal((await doCall('GET','/api/partner-distribution/library')).status,401);
    assert.equal((await doCall('GET','/api/partner-distribution/library',undefined,other)).data.resources.length,0);
    assert.equal((await doCall('POST','/api/institutional-partners',{name:'Denied'},other)).status,403);
    assert.equal((await doCall('POST','/api/institutional-partners',{
      name:'Spoofed',country:'Liberia',contactEmail:'evil@hiau.example',institutionType:'University',
    },{...other,csrf:'invalid'})).status,403);

    const draft=await doCall('POST','/api/institutional-partners',{
      name:'Fictional Integration Test Partner',country:'Liberia',
      contactEmail:'official@institution.example',institutionType:'University',
    },admin);
    assert.equal(draft.status,200);
    const partner=draft.data.partner.id;
    assert.equal((await doCall('POST','/api/institutional-partners/'+partner+'/verify',{
      verificationNote:'Local automated test only; no actual institution verified',
    },admin)).status,200);
    assert.equal((await doCall('POST','/api/institutional-partners/'+partner+'/activate',{
      signedAgreementReference:'AUTOMATED-TEST-ONLY',
      activities:['lectures'],startsOn:'2026-01-01',expiresOn:'2099-01-01',
    },admin)).status,200);
    assert.equal((await doCall('POST','/api/partner-collaboration/admin/partners/'+partner+'/members',{
      name:'Partner Representative',email:'partner@institution.example',
    },admin)).status,201);
    const invite=await doCall('POST','/api/identity/invite',{
      name:'Partner Representative',email:'partner@institution.example',role:'partner_representative',
    },admin);
    assert.equal(invite.status,200);
    const token=invite.data.activationUrl.split('#')[1];
    assert.match(token,/^[0-9a-f]{64}$/);
    assert.equal((await doCall('POST','/api/auth/activate',{
      token,password:'PartnerTestActivation_12345',
    })).status,200);
    const partnerSession=await login('partner@institution.example','PartnerTestActivation_12345');
    assert.equal((await doCall('GET','/api/finance',undefined,partnerSession)).status,403);
    assert.equal((await doCall('GET','/api/partner-distribution/library',undefined,partnerSession)).status,403);
    const submit=await doCall('POST','/api/partner-collaboration/resources',{
      kind:'lecture',title:'Authenticated academic lecture',
      summary:'Integration test of controlled educational materials',
      sourceUrl:'https://library.example/lecture/test',
      licenseStatement:'Fictional rights record, local test only',rightsConfirmed:true,
    },partnerSession);
    assert.equal(submit.status,201);
    const resource=submit.data.resource.id;
    assert.equal((await doCall('GET','/api/partner-distribution/library/'+resource+'/access',undefined,student)).status,404);
    assert.equal((await doCall('POST','/api/partner-collaboration/admin/resources/'+resource+'/review',{
      decision:'approved',note:'Integration test approval',
    },partnerSession)).status,403);
    assert.equal((await doCall('POST','/api/partner-collaboration/admin/resources/'+resource+'/review',{
      decision:'approved',note:'Local test approval',
    },admin)).status,200);
    assert.equal((await doCall('POST','/api/partner-distribution/admin/resources/'+resource+'/authorize',{
      rightsEvidence:'Test only; documentary rights verification required before real use',
      rightsExpiresOn:'2099-01-01',
    },admin)).status,200);
    for(const account of [records[1].id,records[3].id])
      assert.equal((await doCall('POST','/api/partner-distribution/admin/resources/'+resource+'/grants',{
        userId:account,
      },admin)).status,200);
    assert.equal((await doCall('GET','/api/partner-distribution/library',undefined,student)).data.resources.length,1);
    assert.equal((await doCall('GET','/api/partner-distribution/library',undefined,lecturer)).data.resources.length,1);
    assert.equal((await doCall('GET','/api/partner-distribution/library',undefined,other)).data.resources.length,0);
    assert.equal((await doCall('GET','/api/partner-distribution/library/'+resource+'/access',undefined,other)).status,404);
    const result=await doCall('GET','/api/partner-distribution/library/'+resource+'/access',undefined,student);
    assert.equal(result.status,200);
    assert.equal(result.data.url,'https://library.example/lecture/test');
    assert.equal((await doCall('POST','/api/partner-distribution/admin/resources/'+resource+'/grants/'+records[1].id+'/revoke',{},admin)).status,200);
    assert.equal((await doCall('GET','/api/partner-distribution/library/'+resource+'/access',undefined,student)).status,404);
    store.run('UPDATE institutional_partner_distributions SET rights_expires_on=? WHERE resource_id=?','2025-01-01',resource);
    assert.equal((await doCall('GET','/api/partner-distribution/library/'+resource+'/access',undefined,lecturer)).status,404);
    store.run('UPDATE institutional_partner_distributions SET rights_expires_on=? WHERE resource_id=?','2099-01-01',resource);
    assert.equal((await doCall('POST','/api/institutional-partners/'+partner+'/suspend',{
      reason:'Acceptance test suspension',
    },admin)).status,200);
    assert.equal((await doCall('GET','/api/partner-distribution/library/'+resource+'/access',undefined,lecturer)).status,404);
    assert.equal((await doCall('GET','/api/partner-collaboration/me',undefined,partnerSession)).status,403);
    assert.equal((await doCall('POST','/api/partner-collaboration/resources',{
      kind:'lecture',title:'Should fail',summary:'Invalid after suspension',
      sourceUrl:'https://library.example/blocked',licenseStatement:'none',rightsConfirmed:true,
    },partnerSession)).status,403);
    assert.ok(store.one("SELECT COUNT(*) AS n FROM audit WHERE action='PARTNER_RESOURCE_LINK_ACCESSED'").n>0);
  }finally{
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    identity.close();
    store.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
