import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Operations } from './operations';
import { workspacePermissions } from './workspaces';

const roles=['super_admin','registrar','admissions_officer','bursar','dean','lecturer','student','alumni'];
const roleCan=(role:string,key:keyof ReturnType<typeof workspacePermissions>)=>workspacePermissions(role)[key];

test('server permission matrix gives admissions, finance and audit capabilities only to intended roles',()=>{
  for (const role of roles) {
    assert.equal(roleCan(role,'admissions'),['super_admin','registrar','admissions_officer'].includes(role),role+' admissions');
    assert.equal(roleCan(role,'finance'),['super_admin','bursar'].includes(role),role+' finance');
    assert.equal(roleCan(role,'audit'),['super_admin','registrar'].includes(role),role+' audit');
    assert.equal(roleCan(role,'accounts'),role==='super_admin',role+' accounts');
    assert.equal(roleCan(role,'student'),role==='student',role+' student');
  }
});

test('backend rejects spoofed privileged application and billing operations for unprivileged roles',()=>{
  const directory=mkdtempSync(path.join(tmpdir(),'hiau-rbac-accept-'));
  const operations=new Operations(directory);
  try {
    for(const role of ['student','lecturer','dean','bursar','alumni']) {
      assert.throws(()=>operations.execute({id:'untrusted',role} as any,'application',{
        fullName:'Fictional Applicant',email:'fictional@example.test',programId:'invalid'
      }),/role cannot perform/i,role+' must not create application');
    }
    for(const role of ['student','lecturer','dean','admissions_officer','alumni']) {
      assert.throws(()=>operations.execute({id:'untrusted',role} as any,'program',{
        code:'X',title:'Unapproved program',requiredCredits:3
      }),/role cannot perform/i,role+' must not create degree programs');
    }
    assert.equal(operations.all('SELECT COUNT(*) AS count FROM applications')[0].count,0);
    assert.equal(operations.all('SELECT COUNT(*) AS count FROM programs')[0].count,0);
  } finally {
    operations.close();
    rmSync(directory,{recursive:true,force:true});
  }
});
