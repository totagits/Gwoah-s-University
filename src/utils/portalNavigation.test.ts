import assert from 'node:assert/strict';
import test from 'node:test';
import { PORTAL_MODULE_IDS, defaultPortalModule, isPortalModuleAvailable, portalModulesForRole } from '../portal/moduleRegistry';
import type { UserRole } from '../types';

test('every offered ERP module has a known renderer ID', () => {
  const roles: UserRole[] = ['super_admin', 'registrar', 'dean', 'lecturer', 'student', 'bursar', 'admissions_officer', 'alumni'];
  for (const role of roles) {
    for (const module of portalModulesForRole(role)) {
      assert.ok(PORTAL_MODULE_IDS.has(module.id), `Unknown ${module.id} for ${role}`);
      assert.equal(isPortalModuleAvailable(role, module.id), true);
    }
  }
});

test('super admin starts in operations rather than individual student records', () => {
  assert.equal(defaultPortalModule('super_admin'), 'tasks');
  assert.equal(isPortalModuleAvailable('super_admin', 'student_portal'), false);
  assert.equal(isPortalModuleAvailable('registrar', 'student_portal'), false);
});

test('student account starts in its own workspace and cannot enter admin modules', () => {
  assert.equal(defaultPortalModule('student'), 'student_portal');
  for (const id of ['finance', 'analytics', 'faculty_admin', 'compliance']) {
    assert.equal(isPortalModuleAvailable('student', id), false);
  }
});

test('dead former tabs are not offered to any role', () => {
  for (const id of ['campus', 'institution', 'account', 'faculty_tools', 'library_tools', 'studio', 'alumni']) {
    assert.equal(PORTAL_MODULE_IDS.has(id), false);
  }
});

test('unconfigured alumni role never receives an invented workspace', () => {
  assert.equal(defaultPortalModule('alumni'), null);
});
