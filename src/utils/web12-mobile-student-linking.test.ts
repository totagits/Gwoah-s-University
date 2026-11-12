import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const header=read('../components/portal/PortalHeader.tsx');
const app=read('../App.tsx');
const workspaces=read('../../server/workspaces.ts');
const linking=read('../components/portal/RegistrarStudentLinking.tsx');

test('WEB-12 Android mobile workspace header is compact and accessible',()=>{
 assert.match(header,/mobileSearchOpen/);
 assert.match(header,/mobileSettingsOpen/);
 assert.match(header,/aria-label="Search university"/);
 assert.match(header,/aria-label="Mobile display and language options"/);
 assert.match(header,/sm:hidden/);
 assert.match(header,/hidden min-w-0 flex-1 basis-full sm:block/);
 assert.match(header,/sm:py-4/);
 assert.match(header,/setMobileSearchOpen\(false\)/);
});
test('WEB-12 linking requires Registrar role, approved admitted record and exact email identity',()=>{
 assert.match(workspaces,/app\.get\('\/api\/workspaces\/student-links'/);
 assert.match(workspaces,/app\.post\('\/api\/workspaces\/student-links'/);
 assert.match(workspaces,/workspacePermissions\(actor\.role\)\.registrar/);
 assert.match(workspaces,/record\.admission_status!=='admitted'/);
 assert.match(workspaces,/record\.user_id!==null/);
 assert.match(workspaces,/account\.role!=='student'/);
 assert.match(workspaces,/record\.email\.trim\(\)\.toLowerCase\(\)!==account\.email\.trim\(\)\.toLowerCase\(\)/);
 assert.match(workspaces,/SELECT id FROM students WHERE user_id=\?/);
 assert.match(workspaces,/BEGIN IMMEDIATE|store\.transaction\(\(\)=>/);
 assert.match(workspaces,/STUDENT_IDENTITY_LINK/);
 assert.match(workspaces,/WHERE id=\? AND user_id IS NULL/);
});
test('WEB-12 approved-record linking is wired only into authorized Admissions module',()=>{
 assert.match(app,/activePortalTab === 'admissions'/);
 assert.match(app,/<RegistrarStudentLinking currentUser=\{currentUser\} \/>/);
 assert.match(linking,/\['super_admin','registrar'\]\.includes\(currentUser\.role\)/);
 assert.match(linking,/application_status==='admitted'/);
 assert.match(linking,/No unlinked admitted student records exist/);
 assert.match(linking,/does not create enrollment, grades, payments or student records/);
 assert.doesNotMatch(linking,/INSERT INTO students/);
});
