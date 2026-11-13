import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('WEB-01: homepage prioritizes live video with real clip-derived previews, not the old static hero',()=>{
  const hero=fs.readFileSync(new URL('../components/public/PublicHero.tsx',import.meta.url),'utf8');
  // This acceptance assertion deliberately allows an authentic first-frame
  // poster generated from the actual video. The old test blocked every poster,
  // conflicting with the approved WEB-GATE fix for slow video startup.
  assert.doesNotMatch(hero,/image_29eb5504\.png/);
  assert.match(hero,/poster=\{clip\.poster\}/);
  assert.match(hero,/src=\{index===activeVideoIndex\|\|preloadStarted\|\|isPreparingNext\?clip\.src:undefined\}/);
  assert.match(hero,/autoPlay=\{index===activeVideoIndex&&wantsPlayback\}/);
  assert.match(hero,/muted=\{index!==activeVideoIndex\|\|isMuted\}/);
  assert.match(hero,/onPlaying=\{\(\)=>\{captureMedia\('playing',index\)/);
  assert.match(hero,/setPreloadStarted\(true\)/);
  assert.match(hero,/onEnded=\{\(\)=>\{if\(index===activeIndexRef\.current\)/);
  assert.match(hero,/switchVideo\(index\+1\)/);
  assert.match(hero,/onWaiting=\{\(\)=>\{captureMedia\('waiting',index\)/);
  assert.match(hero,/onError=\{\(\)=>\{captureMedia\('error',index\)/);
  assert.match(hero,/aria-label=\{isActuallyPlaying \? 'Pause video' : 'Play video'\}/);
  assert.match(hero,/onClick=\{handlePrevVideo\}/);
  assert.match(hero,/onClick=\{handleNextVideo\}/);
  assert.match(hero,/onClick=\{toggleMute\}/);
});
