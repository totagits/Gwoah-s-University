import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const navbar=readFileSync(new URL('../components/public/PublicNavbar.tsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');

test('WEB-01: public navigation does not advertise nonexistent ERP modules or unsupported calendar export',()=>{
  assert.doesNotMatch(navbar,/onOpenPortal\('facilities'\)|onOpenPortal\('library'\)/);
  assert.doesNotMatch(navbar,/\/api\/calendar\/export\.ics/);
  assert.doesNotMatch(navbar,/onOpenPortal\('admissions'\)/);
  assert.doesNotMatch(navbar,/Admissions Officer Review Desk/);
  assert.match(navbar,/grid grid-cols-2 xl:grid-cols-3/);
  assert.match(navbar,/absolute left-0 right-0 top-full/);
});
test('WEB-01: site search maps public topics and reports unknown query without wrong navigation',()=>{
  assert.match(navbar,/const siteSearch =/);
  assert.match(navbar,/section: 'financial-aid'/);
  assert.match(navbar,/section: 'admissions'/);
  assert.match(navbar,/section: 'colleges'/);
  assert.match(navbar,/section: 'tour'/);
  assert.match(navbar,/section: 'calendar'/);
  assert.match(navbar,/setSearchFeedback\('No direct match/);
  assert.match(navbar,/role="status"/);
  assert.match(app,/document\.getElementById\(sectionId\)/);
});
test('WEB-01: public mobile disclosure and keyboard closing remain available',()=>{
  assert.match(navbar,/setMobileMenuOpen\(false\)/);
  assert.match(navbar,/event\.key === 'Escape'/);
  assert.match(navbar,/aria-expanded=\{isExpanded\}/);
  assert.match(navbar,/aria-expanded=\{mobileMenuOpen\}/);
});

test('WEB-05: About offers concise public destinations and leadership anchor',()=>{
  assert.match(navbar,/label: 'University Overview'/);
  assert.match(navbar,/label: 'Leadership & Governance'/);
  assert.match(navbar,/label: 'Campus & Facilities'/);
  assert.match(navbar,/onNavigateSection\('hiau-leadership'\)/);
  assert.doesNotMatch(navbar,/label: 'Founder & Chancellor:/);
  const about=readFileSync(new URL('../components/public/PublicAbout.tsx',import.meta.url),'utf8');
  assert.match(about,/id="hiau-leadership"/);
});
