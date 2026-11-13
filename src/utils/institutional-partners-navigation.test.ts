import test from 'node:test';
import assert from 'node:assert/strict';
import {portalModulesForRole} from '../portal/moduleRegistry';
import {readFileSync} from 'node:fs';

test('institutional partnership navigation is visible only to university super administrators',()=>{
  const ids=(role:Parameters<typeof portalModulesForRole>[0])=>
    portalModulesForRole(role).map(module=>module.id);
  assert.ok(ids('super_admin').includes('partners'));
  for(const role of ['student','registrar','bursar','dean','lecturer','website_editor','website_reviewer','alumni'] as const){
    assert.ok(!ids(role).includes('partners'),role+' must not see administrator partnership management');
  }
  const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  assert.match(app,/activePortalTab === 'partners'/);
  assert.match(app,/<PartnerAdministration currentUser=\{currentUser\}/);
  const ui=readFileSync(new URL('../components/portal/PartnerAdministration.tsx',import.meta.url),'utf8');
  assert.match(ui,/currentUser\.role==='super_admin'/);
  assert.match(ui,/\/api\/institutional-partners/);
});
