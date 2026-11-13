import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Staff ERP exposes staging student setup only on staging and keeps real Registrar link protected',()=>{
  const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  const setup=readFileSync(new URL('../components/portal/StagingStudentRecordSetup.tsx',import.meta.url),'utf8');
  const linking=readFileSync(new URL('../components/portal/RegistrarStudentLinking.tsx',import.meta.url),'utf8');
  assert.match(app,/<StagingStudentRecordSetup currentUser=\{currentUser\}/);
  assert.match(app,/<RegistrarStudentLinking currentUser=\{currentUser\}/);
  assert.match(setup,/window\.location\.hostname==='hiau-staging\.totag\.network'/);
  assert.match(setup,/currentUser\.role==='super_admin'/);
  assert.match(setup,/\/api\/workspaces\/staging-student-setup/);
  assert.match(setup,/\/api\/auth\/me/);
  assert.match(setup,/x-csrf-token/);
  assert.match(setup,/creates no grades, registrations, invoices, aid awards or payments/i);
  assert.match(linking,/studentAccountId:userId/);
  assert.match(linking,/x-csrf-token/);
});

test('staging setup prefers MICHAEL GWOAH when that unlinked login exists',()=>{
  const setup=readFileSync(new URL('../components/portal/StagingStudentRecordSetup.tsx',import.meta.url),'utf8');
  assert.match(setup,/michael\\s\+gwoah/i);
  assert.match(setup,/Create admitted staging record & link account/);
});
