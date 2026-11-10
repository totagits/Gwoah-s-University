import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {LEADERSHIP_PROFILES,LEADER_GROUPS,QUICK_LEADERSHIP_SWITCHER} from '../data/leadershipData';

// Source-level guard: this only proves local asset existence, not identities,
// institutional roles, image likenesses, or rights to use the portraits.
const localAsset=(url:string)=>path.join(process.cwd(),'public',url.replace(/^\//,''));

test('each public leadership profile has a real bundled portrait and valid internal slug',()=>{
  const profiles=Object.values(LEADERSHIP_PROFILES);
  assert.ok(profiles.length>=15,'Leadership directory unexpectedly truncated');
  for(const leader of profiles){
    assert.ok(/^[a-z0-9_-]+$/.test(leader.id),leader.name+' has invalid id');
    assert.ok(leader.name.trim(),leader.id+' has no display name');
    for(const source of [leader.image,leader.secondaryImage].filter((v):v is string=>Boolean(v))){
      assert.ok(source.startsWith('/assets/'),leader.name+' points outside the public asset directory');
      const file=localAsset(source);
      assert.ok(existsSync(file),leader.name+' portrait file missing: '+source);
      assert.ok(statSync(file).size>100,leader.name+' portrait is empty: '+source);
    }
  }
});

test('leadership directory and quick links resolve to profiles and valid bundled avatars',()=>{
  for(const group of LEADER_GROUPS){
    assert.ok(group.members.length>0,group.category+' is empty');
    for(const member of group.members){
      assert.ok(LEADERSHIP_PROFILES[member.id],'Leadership directory has unknown id: '+member.id);
      assert.ok(existsSync(localAsset(member.avatar)),member.name+' avatar missing: '+member.avatar);
    }
  }
  for(const shortcut of QUICK_LEADERSHIP_SWITCHER){
    assert.ok(LEADERSHIP_PROFILES[shortcut.id],'Leadership quick switcher has unknown id: '+shortcut.id);
  }
});
