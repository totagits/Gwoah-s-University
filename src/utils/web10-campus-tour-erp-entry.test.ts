import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const tour=readFileSync(new URL('../components/public/PublicVirtualTour.tsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');

test('WEB-10 campus tour is independent from autoplaying homepage carousel',()=>{
 assert.match(tour,/Campus Tour/);
 assert.match(tour,/<video key=\{video.id\} controls playsInline preload="metadata"/);
 assert.match(tour,/onClick=\{\(\)=>setSelected\(item.id\)\}/);
 assert.doesNotMatch(tour,/onEnded=/);
 assert.doesNotMatch(tour,/autoPlay/);
 assert.doesNotMatch(tour,/hero-diagonal-clip/);
 assert.doesNotMatch(tour,/Continuous Video Stream Carousel/);
 assert.doesNotMatch(tour,/switchTourVideo/);
 assert.match(tour,/Campus Facilities — Staff Sign In/);
});
test('WEB-10 facilities entry requires a fresh server-session login instead of reusing Super Admin dashboard',()=>{
 assert.match(app,/const handleRequestFacilitiesLogin = async \(\) =>/);
 assert.match(app,/fetch\('\/api\/auth\/logout', \{ method: 'POST', credentials: 'same-origin' \}\)/);
 assert.match(app,/setCurrentUser\(null\)/);
 assert.match(app,/setPendingPortalTab\('facilities'\)/);
 assert.match(app,/setIsLoginModalOpen\(true\)/);
 assert.match(app,/onRequestFacilitiesLogin=\{handleRequestFacilitiesLogin\}/);
 assert.doesNotMatch(tour,/onOpenPortal\('facilities'\)/);
});
