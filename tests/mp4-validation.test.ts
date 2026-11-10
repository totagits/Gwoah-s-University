import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkMp4Upload } from '../src/server/mp4Validation';

function box(type: string, payload: Buffer): Buffer {
  const result = Buffer.alloc(payload.length + 8);
  result.writeUInt32BE(result.length, 0);
  result.write(type, 4, 'ascii');
  payload.copy(result, 8);
  return result;
}
const ftyp = box('ftyp', Buffer.concat([Buffer.from('isom'),Buffer.alloc(4),Buffer.from('isom')]));
const moov = box('moov', Buffer.from([1,2,3,4]));
const mdat = box('mdat', Buffer.from([5,6,7,8]));
test('accepts bounded MP4 with metadata and media boxes', () => {
  assert.equal(checkMp4Upload(Buffer.concat([ftyp,moov,mdat])).ok, true);
});
test('rejects fake MP4 with only ftyp bytes', () => {
  assert.equal(checkMp4Upload(ftyp).ok, false);
});
test('rejects missing moov or mdat', () => {
  assert.equal(checkMp4Upload(Buffer.concat([ftyp,moov])).ok, false);
  assert.equal(checkMp4Upload(Buffer.concat([ftyp,mdat])).ok, false);
});
test('rejects invalid box length and truncated payload', () => {
  const invalid = Buffer.from(Buffer.concat([ftyp,moov,mdat]));
  invalid.writeUInt32BE(500000,ftyp.length);
  assert.equal(checkMp4Upload(invalid).ok,false);
  assert.equal(checkMp4Upload(Buffer.concat([ftyp,moov,mdat]).subarray(0,-1)).ok,false);
});
test('rejects unknown brand and non-container contents', () => {
  const unknown = Buffer.from(ftyp);
  unknown.write('zzzz',8,'ascii');
  unknown.write('zzzz',16,'ascii');
  assert.equal(checkMp4Upload(Buffer.concat([unknown,moov,mdat])).ok,false);
  assert.equal(checkMp4Upload(Buffer.from('not a video')).ok,false);
});
