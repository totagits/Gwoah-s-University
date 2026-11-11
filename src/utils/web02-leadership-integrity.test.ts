import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {LEADERSHIP_PROFILES,LEADER_GROUPS,resolveLeaderProfile} from '../data/leadershipData';

const about=fs.readFileSync(new URL('../components/public/PublicAbout.tsx',import.meta.url),'utf8');
const profileComponent=fs.readFileSync(new URL('../components/public/PublicLeaderProfile.tsx',import.meta.url),'utf8');

test('WEB-02: all 19 published directory records have a distinct matching detailed profile',()=>{
  const directory=LEADER_GROUPS.flatMap(group=>group.members);
  assert.equal(directory.length,19);
  assert.equal(Object.keys(LEADERSHIP_PROFILES).length,19);
  assert.equal(new Set(directory.map(member=>member.id)).size,19);
  for(const member of directory){
    const profile=resolveLeaderProfile(member.id);
    assert.ok(profile,'Missing detailed profile for '+member.id);
    assert.equal(profile.id,member.id);
    assert.ok(profile.name.trim().length>2);
    assert.ok(profile.subtitle.trim().length>3);
    assert.ok(profile.image.startsWith('/assets/'),'Portrait should be an approved local asset path');
    assert.equal(resolveLeaderProfile(profile.slug)?.id,member.id);
  }
});
test('WEB-02: main homepage directory and detail directory show the same 19 identities',()=>{
  const directory=LEADER_GROUPS.flatMap(group=>group.members);
  const sourceIds=[...about.matchAll(/\bid:\s*'((?:trustee_|dr_|rev_|mr_|board_|deputy_|chancellor|president)[a-z0-9_]*)'/g)].map(match=>match[1]);
  assert.equal(sourceIds.length,19,'Unexpected main-directory card count or duplicate identities');
  assert.deepEqual(new Set(sourceIds),new Set(directory.map(member=>member.id)));
});
test('WEB-02: all 19 directory portraits and detailed profile portraits exist as image assets',()=>{
  const directory=LEADER_GROUPS.flatMap(group=>group.members);
  for(const member of directory){
    const profile=LEADERSHIP_PROFILES[member.id];
    for(const url of [member.avatar,profile.image]){
      const disk=path.join(process.cwd(),'public',url.replace(/^\//,''));
      assert.ok(fs.existsSync(disk),`Missing leadership photograph: ${member.id}, ${url}`);
      assert.ok(fs.statSync(disk).size>500,`Empty leadership photograph: ${url}`);
    }
  }
});
test('WEB-02: missing or obsolete profile IDs must never render the Chancellor biography',()=>{
  assert.equal(resolveLeaderProfile('unknown-profile-do-not-display'),undefined);
  assert.doesNotMatch(profileComponent,/resolveLeaderProfile\(profileId\)\s*\|\|\s*LEADERSHIP_PROFILES\.chancellor/);
  assert.match(profileComponent,/Leadership profile unavailable/);
});
