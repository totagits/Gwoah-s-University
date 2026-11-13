import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {portalModulesForRole,defaultPortalModule} from '../portal/moduleRegistry';

test('external partner accounts cannot inherit internal Staff ERP or Student PWA navigation',()=>{
  assert.deepEqual(portalModulesForRole('partner_representative').map(m=>m.id),['collaboration_hub','collaboration_events','partner_resources']);
  assert.equal(defaultPortalModule('partner_representative'),'collaboration_hub');
  assert.ok(portalModulesForRole('super_admin').some(m=>m.id==='partner_resources'));
  for(const role of ['student','lecturer','registrar','bursar','alumni'] as const)
    assert.ok(!portalModulesForRole(role).some(m=>m.id==='partner_resources'));
  const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  const entry=readFileSync(new URL('../components/portal/DedicatedAppEntry.tsx',import.meta.url),'utf8');
  assert.match(app,/role!=='partner_representative'/);
  assert.match(entry,/currentUser\.role!=='partner_representative'/);
  const identity=readFileSync(new URL('../../server/identity.ts',import.meta.url),'utf8');
  assert.match(identity,/actor\.role==='partner_representative'/);
  assert.match(identity,/!endpoint\.startsWith\('\/api\/partner-collaboration\/'\)/);
  assert.match(identity,/options\.partnerInviteAllowed\?\.\(email\)/);
});
