import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {portalModulesForRole} from '../portal/moduleRegistry';

test('partner academic resources appear only in authorized student and faculty workspaces',()=>{
  const ids=(role:Parameters<typeof portalModulesForRole>[0])=>
    portalModulesForRole(role).map(m=>m.id);
  for(const role of ['student','lecturer','dean'] as const)
    assert.ok(ids(role).includes('partner_library'),role+' needs read-only Partner Academic Library');
  assert.ok(ids('super_admin').includes('partner_distribution'),'administrator needs rights approval and individual grants');
  for(const role of ['partner_representative','bursar','registrar','alumni','website_editor','website_reviewer'] as const)
    assert.ok(!ids(role).includes('partner_library')&&!ids(role).includes('partner_distribution'),
      role+' must not inherit student library or distribution administration');
  const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  assert.match(app,/activePortalTab === 'partner_library'/);
  assert.match(app,/activePortalTab === 'partner_distribution'/);
  const library=readFileSync(new URL('../components/portal/PartnerAcademicLibrary.tsx',import.meta.url),'utf8');
  assert.match(library,/\/api\/partner-distribution\/library/);
  assert.match(library,/\['student','lecturer','dean'\]/);
  assert.match(library,/cache:'no-store'/);
});
