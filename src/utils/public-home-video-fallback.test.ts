import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('WEB-01: homepage carousel is video-first without any static poster',()=>{
  const hero=fs.readFileSync(new URL('../components/public/PublicHero.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(hero,/poster\s*=/);
  assert.doesNotMatch(hero,/image_29eb5504\.png/);
  assert.match(hero,/src=\{currentVideo\.src\}/);
  assert.match(hero,/autoPlay/);
  assert.match(hero,/muted=\{isMuted\}/);
  assert.match(hero,/onEnded=\{\(\)=>switchVideo\(activeVideoIndex\+1\)\}/);
  assert.match(hero,/onPlaying=\{\(\)=>\{setIsActuallyPlaying\(true\);setIsVideoLoading\(false\)/);
  assert.match(hero,/onWaiting=\{\(\)=>\{setIsVideoLoading\(true\)/);
  assert.match(hero,/onError=\{\(\)=>\{setIsVideoLoading\(false\);setVideoError/);
  assert.match(hero,/isVideoLoading && !videoError && wantsPlayback/);
  assert.match(hero,/aria-label="Loading homepage video"/);
  assert.match(hero,/pointer-events-none absolute inset-0/);
  assert.match(hero,/aria-label=\{isActuallyPlaying \? 'Pause video' : 'Play video'\}/);
  assert.match(hero,/onClick=\{handlePrevVideo\}/);
  assert.match(hero,/onClick=\{handleNextVideo\}/);
  assert.match(hero,/onClick=\{toggleMute\}/);
});
