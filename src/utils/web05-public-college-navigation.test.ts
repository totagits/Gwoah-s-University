import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
const colleges=readFileSync(new URL('../components/public/PublicColleges.tsx',import.meta.url),'utf8');
const login=readFileSync(new URL('../components/portal/PortalLoginModal.tsx',import.meta.url),'utf8');

test('WEB-05: Explore academic colleges is a public anchor to the directory',()=>{
  assert.match(colleges,/href="#hiau-college-directory"/);
  assert.match(colleges,/id="hiau-college-directory"/);
  assert.match(colleges,/Explore academic colleges/);
});
test('WEB-05: stale portal query does not re-open admin login on public hash navigation',()=>{
  const begin=app.indexOf('const handleUrlRouting = () => {');
  const end=app.indexOf('handleUrlRouting();',begin);
  assert.ok(begin>=0&&end>begin);
  const router=app.slice(begin,end);
  assert.doesNotMatch(router,/setIsLoginModalOpen\(true\)/);
  assert.match(app,/if \(active && \(params\.has\('portal'\) \|\| params\.has\('activate'\) \|\| appKind!==null\)\) setIsLoginModalOpen\(true\)/);
  assert.match(app,/const handleNavigateSection = \(sectionId: string\) => \{/);
  assert.match(app,/url\.searchParams\.delete\('portal'\)/);
  assert.match(app,/onBackToPublic=\{\(\) => \{/);
});
test('WEB-05: portal login renders no literal backslash n text and submit text is legible',()=>{
  assert.doesNotMatch(login,/\\n\s*<div className/);
  assert.match(login,/hiau-dashboard-selected mt-1 rounded-md/);
  assert.match(login,/className="hiau-dashboard-selected[^"]*text-white/);
});

test('WEB-05: initial protected portal entry still depends on verified server session',()=>{
  assert.match(app,/fetch\('\/api\/auth\/me', \{ credentials: 'same-origin' \}\)/);
  assert.match(app,/\(params\.has\('portal'\)\|\|appKind!==null\)\&\&canUseInstalledApp\(session\.user\.role\)/);
  assert.match(app,/if \(active && \(params\.has\('portal'\) \|\| params\.has\('activate'\) \|\| appKind!==null\)\) setIsLoginModalOpen\(true\)/);
});
