import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('production Docker image includes curriculum degree route JSON required at startup',()=>{
  const dockerfile=fs.readFileSync(path.join(root,'Dockerfile'),'utf8');
  const source=path.join(root,'scripts','hiau-degree-video-content.json');
  assert.ok(fs.existsSync(source),'degree-route JSON must exist in the build context');
  assert.match(dockerfile,
    /COPY --from=build --chown=node:node \/app\/scripts\/hiau-degree-video-content\.json \.\/scripts\/hiau-degree-video-content\.json/,
    'runtime image must copy the JSON file imported by server/curriculum.ts');
});
