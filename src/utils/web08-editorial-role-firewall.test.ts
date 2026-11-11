import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p:string)=>readFileSync(new URL(p,import.meta.url),'utf8');
const firewall=read('../../server/identity.ts');
const modules=read('../portal/moduleRegistry.ts');
const cms=read('../../server/websiteCms.ts');
const news=read('../../server/publicNewsEvents.ts');
const c=read('../components/portal/WebsiteCmsConsole.tsx');
const n=read('../components/portal/WebsiteNewsEventsConsole.tsx');

test('WEB-08: editorial roles are registered but not granted ERP sidebar or API access',()=>{
 for(const role of ['website_editor','website_reviewer']){
  assert.match(firewall,new RegExp("'"+role+"'"));
  assert.match(modules,new RegExp(role+": \\[\\'website_cms\\',\\'website_news\\'\\]"));
 }
 assert.match(firewall,/Website editorial accounts cannot access institutional ERP APIs/);
 assert.match(firewall,/admin\\\/(?:site-content|news-events)/);
 assert.doesNotMatch(modules,/website_editor: \[.*admissions/);
 assert.doesNotMatch(modules,/website_reviewer: \[.*finance/);
});
test('WEB-08: authors cannot approve and reviewers cannot author CMS drafts',()=>{
 assert.match(cms,/const author=/);assert.match(cms,/const reviewer=/);
 assert.match(cms,/if\(!author\(res\)\)return res\.sendStatus\(403\)/);
 assert.match(cms,/if\(!reviewer\(res\)\)return res\.sendStatus\(403\)/);
 assert.match(cms,/if\(!editor\(res\)\)content\.verified=false/);
 assert.match(news,/if\(!admin\(res\)\)content\.verified=false/);
 assert.match(c,/Approve reviewed draft/);
 assert.match(n,/Approve draft/);
});
test('WEB-08: scheduled publication remains durable and cannot appear prematurely',()=>{
 assert.match(cms,/scheduledAt\?:string/);assert.match(cms,/SITE_CMS_SCHEDULED_PUBLISH/);
 assert.match(cms,/SCHEDULE_CONFLICT_CANCELLED/);
 assert.match(news,/NEWS_SCHEDULED_PUBLISH/);
 assert.match(news,/Never expose draft metadata/);
 assert.match(c,/Schedule approved draft/);
 assert.match(n,/Schedule event or news/);
});
