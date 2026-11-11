import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
const admissions=fs.readFileSync(new URL('../components/public/PublicAdmissions.tsx',import.meta.url),'utf8');
const navbar=fs.readFileSync(new URL('../components/public/PublicNavbar.tsx',import.meta.url),'utf8');
const hero=fs.readFileSync(new URL('../components/public/PublicHero.tsx',import.meta.url),'utf8');

test('WEB-01: all Apply Now and Become a Student actions open the shared application workflow',()=>{
  assert.match(navbar,/onOpenApplicationModal\(\)/);
  assert.match(hero,/onClick=\{onOpenApplicationModal\}/);
  assert.match(app,/onOpenApplicationModal=\{\(\) => setIsApplicationModalOpen\(true\)\}/);
  assert.match(admissions,/\{isModalOpen && \(/);
});

test('WEB-01: degree and leader profile pages can open admissions without adding a duplicate admissions section',()=>{
  assert.match(app,/\{\(activeDegreeRoute \|\| activeLeaderProfileId\) && \(/);
  assert.match(app,/showSection=\{false\}/);
  assert.match(admissions,/showSection\?: boolean/);
  assert.match(admissions,/\{showSection && <section id="admissions"/);
  assert.match(app,/<PublicAdmissions[\s\S]*?<PublicCalendar \/>/);
  assert.match(admissions,/onCloseModal/);
});

test('WEB-01: choosing a mobile public section closes the menu',()=>{
  assert.match(navbar,/onNavigateSection\(link\.id\);\s*setMobileMenuOpen\(false\);/);
  assert.match(navbar,/onNavigateSection\(link\.id\);\s*setMobileMenuOpen\(false\);\s*setMobileExpandedSection\(null\);/);
});

test('WEB-01: application submission still uses authenticated-free public intake and never charges online',()=>{
  assert.match(admissions,/api\.submitApplication\(payload\)/);
  assert.match(admissions,/applyingForScholarship: formData\.applyingForScholarship/);
  assert.match(admissions,/county: formData\.county/);
  assert.match(admissions,/Submit application \(no online charge\)/);
});
