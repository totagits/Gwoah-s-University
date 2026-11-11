import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const backend=read('../../server/websiteCms.ts');
const firewall=read('../../server/identity.ts');
const app=read('../App.tsx');
const moduleRegistry=read('../portal/moduleRegistry.ts');
const ui=read('../components/portal/WebsiteCmsConsole.tsx');
const publicUi=read('../components/public/PublicCmsSection.tsx');
test('WEB-06: public content is published and archive-filtered, never exposed as private drafts',()=>{
 assert.match(backend,/filter\(v=>!v\.archived&&v\.published\)/);
 assert.match(backend,/id:v\.id,\.\.\.v\.published/);
 assert.match(backend,/if\(!editor\(res\)\)return res\.sendStatus\(403\)/);
 assert.match(backend,/actorOf\(res\)\?\.role==='super_admin'/);
 assert.match(firewall,/endpoint === '\/api\/public\/site-content'/);
});
test('WEB-06: edits preserve published revision and publishing requires explicit verified draft',()=>{
 assert.match(backend,/item\.draft=content/);
 assert.match(backend,/item\.published=\{\.\.\.item\.draft\};item\.draft=null/);
 assert.match(backend,/if\(!item\.draft\?\.verified\)/);
 assert.match(backend,/expectedRevision/);
 assert.match(backend,/RESTORE_TO_DRAFT/);
 assert.match(backend,/verified:false/);
 assert.match(backend,/ARCHIVE_SITE_CONTENT/);
 assert.match(backend,/SITE_CMS_ARCHIVE/);
 assert.match(backend,/store\.audit/);
});
test('WEB-06: plain text only and constrained fields prevent arbitrary html injection',()=>{
 assert.match(backend,/safe\(v\?\.title,150\)/);
 assert.match(backend,/safe\(v\?\.body,4000\)/);
 assert.doesNotMatch(publicUi,/dangerouslySetInnerHTML/);
 assert.match(publicUi,/whitespace-pre-wrap/);
});
test('WEB-06: editor and public renderer are wired into authorized workspace and sections',()=>{
 assert.match(moduleRegistry,/id: 'website_cms'/);
 assert.match(app,/<WebsiteCmsConsole/);
 for(const section of ['home','about','academics','admissions','events','student-life','footer'])
  assert.ok(app.includes('<PublicCmsSection section="'+section+'"'),section);
 assert.match(ui,/Save private draft/);
 assert.match(ui,/Publish verified draft/);
 assert.match(ui,/Revision history/);
 assert.match(ui,/Restore as draft/);
 assert.match(ui,/openModule\(link\.id\)/);
});
