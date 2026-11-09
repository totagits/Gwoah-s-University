import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=(name:string)=>fs.readFileSync(path.join(root,name),'utf8');

test('student academic planning uses authenticated workspaces rather than legacy sample API paths',()=>{
  const app=load('src/App.tsx');
  const view=load('src/components/portal/SecureStudentRegistration.tsx');
  assert.match(app,/<SecureStudentRegistration currentUser=\{currentUser\} \/>/);
  assert.doesNotMatch(app,/<AcademicPlanningRegistration/);
  assert.match(view,/fetch\('\/api\/workspaces\/state'/);
  assert.match(view,/fetch\('\/api\/workspaces\/action'/);
  assert.match(view,/data:action==='register'/);
  assert.match(view,/\?\{sectionId:target\.row\.id\}/);
  assert.match(view,/\:\{id:target\.row\.id,reason:reason\.trim\(\)\}/);
  assert.doesNotMatch(view,/u-student|\/api\/registration\/add|\/api\/registration\/drop/);
  assert.match(view,/data\.actor\?\.id!==currentUser\.id/);
  assert.match(view,/student\.id/);
});

test('student registration screen does not falsely promise refunds, enrollment or verified documents',()=>{
  const view=load('src/components/portal/SecureStudentRegistration.tsx');
  assert.match(view,/This is not a cash refund/);
  assert.match(view,/Registration is available only for university-open terms/);
  assert.match(view,/Official printable registration slips require Registrar verification/);
  assert.match(view,/Enrollment alone does not confirm an online classroom is available/);
  assert.match(view,/student\.id/);
});
