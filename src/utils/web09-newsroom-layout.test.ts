import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const component=readFileSync(new URL('../components/public/PublicNewsEvents.tsx',import.meta.url),'utf8');
test('WEB-09 single news story fills content width while multiple stories remain cards',()=>{
 assert.match(component,/visible\.length===1\|\|expanded===item\.id/);
 assert.match(component,/md:col-span-2 lg:col-span-3/);
 assert.match(component,/md:grid-cols-2 lg:grid-cols-3/);
 assert.match(component,/min-w-0 overflow-hidden/);
});
test('WEB-09 gallery uses responsive two-column layout outside article copy',()=>{
 assert.match(component,/id=\{'news-gallery-'\+item\.id\}/);
 assert.match(component,/grid items-start gap-5 md:grid-cols-2/);
 assert.match(component,/aria-controls=\{'news-gallery-'\+item\.id\}/);
 assert.match(component,/item\.media\?\.map\(media=>/);
 assert.match(component,/MediaView media=\{media\} large/);
});
