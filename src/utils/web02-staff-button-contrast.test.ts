import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ui=readFileSync(new URL('../components/portal/WebsiteStaffProfiles.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../index.css',import.meta.url),'utf8');

test('WEB-02: all primary public staff actions use forced high-contrast white-on-purple styling',()=>{
  const actions=['New staff profile','Save {active?',"'Unpublish':'Publish to website'"];
  for(const action of actions)assert.ok(ui.includes(action),'Missing primary action '+action);
  assert.equal((ui.match(/hiau-dashboard-selected/g)||[]).length,3,
    'New, Save, Publish/Unpublish need the shared high-contrast class');
  assert.match(css,/\.hiau-erp-site \.hiau-dashboard-selected/);
  assert.match(css,/color: #ffffff !important/);
  assert.match(css,/background-color: #4a1249 !important/);
});
