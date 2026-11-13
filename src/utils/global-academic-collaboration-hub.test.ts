import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultPortalModule,portalModulesForRole} from '../portal/moduleRegistry';

const ids=(role:Parameters<typeof portalModulesForRole>[0])=>
  portalModulesForRole(role).map(module=>module.id);

test('Global Academic Collaboration Hub is visible in the correct ERP/PWA roles',()=>{
  for(const role of ['super_admin','student','lecturer','dean','partner_representative'] as const)
    assert.ok(ids(role).includes('collaboration_hub'),role+' should see Global Collaboration Hub');

  for(const role of ['bursar','admissions_officer','website_editor','website_reviewer','alumni'] as const)
    assert.ok(!ids(role).includes('collaboration_hub'),role+' must not inherit collaboration access');

  assert.ok(ids('student').includes('partner_library'),'Student PWA must expose approved Partner Academic Library');
  assert.ok(ids('student').includes('collaboration_events'),'Student PWA must expose approved joint academic events');
  assert.ok(ids('lecturer').includes('partner_library'),'Faculty must expose approved Partner Academic Library');
  assert.equal(defaultPortalModule('partner_representative'),'collaboration_hub',
    'Partner representatives should land in the governed collaboration overview');
});

test('Hub renderer distinguishes real capabilities from demo/future milestones',()=>{
  const hub=readFileSync(new URL('../components/portal/GlobalAcademicCollaborationHub.tsx',import.meta.url),'utf8');
  const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  assert.match(app,/activePortalTab === 'collaboration_hub'/);
  assert.match(app,/<GlobalAcademicCollaborationHub/);
  assert.match(hub,/HIAU Global Academic Collaboration & Digital Learning Hub/);
  assert.match(hub,/Available now/);
  assert.match(hub,/Foundation available/);
  assert.match(hub,/Demonstration only/);
  assert.match(hub,/Planned next phase/);
  assert.match(hub,/Partner Academic Library/);
  assert.match(hub,/International Lectures & Symposiums/);
  assert.match(hub,/status:'available',module:'collaboration_events'/);
  assert.match(hub,/Academic Credit Recognition/);
  assert.match(hub,/no automatic academic credit/i);
  assert.match(hub,/adaptive live streaming and authorized offline learning packages remain future milestones/i);
});

test('Online & Hybrid Classroom remains explicitly non-live while the hub is integrated',()=>{
  const registry=readFileSync(new URL('../portal/moduleRegistry.ts',import.meta.url),'utf8');
  const classroom=readFileSync(new URL('../components/portal/VirtualClassroomCollab.tsx',import.meta.url),'utf8');
  assert.match(registry,/Online & Hybrid Classroom/);
  assert.match(classroom,/DEMO ONLY/);
  assert.match(classroom,/DEMO ONLY/);
  assert.match(classroom,/not a live stream/i);
});
