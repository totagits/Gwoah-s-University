import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const tour=readFileSync(new URL('../components/public/PublicVirtualTour.tsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
test('WEB-11 campus tour uses actual video-frame preview, never unrelated stock posters or homepage carousel',()=>{
 assert.match(tour,/Campus Tour/);
 assert.match(tour,/<video key=\{video.id\} controls playsInline preload="auto"/);
 assert.match(tour,/onLoadedMetadata=\{event=>/);
 assert.match(tour,/currentTime=0\.15/);
 assert.match(tour,/onClick=\{\(\)=>setSelected\(item.id\)\}/);
 assert.doesNotMatch(tour,/poster=\{/);
 assert.doesNotMatch(tour,/autoPlay|onEnded=|hero-diagonal-clip|switchTourVideo/);
});
test('WEB-11 no staff ERP entry is exposed in Campus Tour',()=>{
 assert.doesNotMatch(tour,/Campus Facilities — Staff Sign In|onRequestFacilitiesLogin/);
 assert.doesNotMatch(app,/handleRequestFacilitiesLogin|onRequestFacilitiesLogin=\{/);
 assert.match(app,/DedicatedAppEntry/);
});
