import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  PORTAL_MODULES, defaultPortalModule,
  isPortalModuleAvailable, portalModulesForRole,
} from '../portal/moduleRegistry';
import type { UserRole } from '../types';

const roles: UserRole[] = [
  'super_admin','registrar','dean','lecturer',
  'bursar','admissions_officer','student','alumni'
];

test('every role receives only allowed registered ERP modules', () => {
  const ids = new Set(PORTAL_MODULES.map(module => module.id));
  for (const role of roles) {
    const modules = portalModulesForRole(role);
    for (const module of modules) {
      assert.ok(ids.has(module.id), `${role}: unregistered module`);
      assert.equal(isPortalModuleAvailable(role,module.id), true);
    }
    assert.equal(defaultPortalModule(role), modules[0]?.id ?? null);
    assert.equal(isPortalModuleAvailable(role,'fake_admin_module'),false);
  }
});

test('high-risk workspace menus are never shown to unrelated roles', () => {
  for (const role of ['student','alumni','lecturer','dean','bursar'] as UserRole[]) {
    assert.equal(isPortalModuleAvailable(role,'admissions'), false,
      role + ' must not see admissions');
  }
  for (const role of ['student','alumni','lecturer','admissions_officer','registrar'] as UserRole[]) {
    assert.equal(isPortalModuleAvailable(role,'finance'), false,
      role + ' must not see finance');
  }
  assert.equal(isPortalModuleAvailable('admissions_officer','admissions'),true);
  assert.equal(isPortalModuleAvailable('bursar','finance'),true);
  assert.equal(isPortalModuleAvailable('super_admin','curriculum'),true);
});

test('side navigation cannot replace backend authorization', () => {
  const app = readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  const header = readFileSync(new URL('../components/portal/PortalHeader.tsx',import.meta.url),'utf8');
  const sidebar = readFileSync(new URL('../components/portal/PortalSidebar.tsx',import.meta.url),'utf8');
  assert.match(app,/isPortalModuleAvailable\(currentUser\.role, activePortalTab\) &&/);
  assert.match(sidebar,/portalModulesForRole\(currentUser\.role\)/);
  assert.ok(!header.includes('primary.map('),'Header must not duplicate sidebar module navigation');
});

test('server still guards direct protected API requests by role', () => {
  const middleware=readFileSync(new URL('../../server/identity.ts',import.meta.url),'utf8');
  const workspaces=readFileSync(new URL('../../server/workspaces.ts',import.meta.url),'utf8');
  const admissions=readFileSync(new URL('../../server/publicAdmissions.ts',import.meta.url),'utf8');
  assert.match(middleware,/endpoint === '\/api\/applications'/);
  assert.match(middleware,/admissions_officer/);
  assert.match(middleware,/endpoint === '\/api\/finance\/pay'/);
  assert.match(workspaces,/workspacePermissions\(actor\.role\)/);
  assert.match(admissions,/actorOf\(res\)/);
  assert.match(admissions,/!\['super_admin','registrar','admissions_officer'\]\.includes\(actor\.role\)/);
});
