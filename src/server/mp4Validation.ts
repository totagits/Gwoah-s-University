/**
 * Structural MP4 screening for a single-file browser upload.
 * This is not a codec decoder, transcoder, or malware scanner.
 * Every top-level box must have a valid size and remain within the payload.
 * Require a plausible ISO BMFF ftyp brand, track metadata (moov), and media data (mdat).
 */
const ALLOWED_BRANDS = new Set(['isom', 'iso2', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'M4V ', 'qt  ', 'dash']);
const MAX_BYTES = 50 * 1024 * 1024;
export function checkMp4Upload(bytes: unknown): { ok: boolean; message: string } {
  if (!Buffer.isBuffer(bytes) || bytes.length < 32 || bytes.length > MAX_BYTES)
    return { ok: false, message: 'An MP4 file between 32 bytes and 50 MB is required.' };
  let offset = 0;
  let ftyp = false;
  let moov = false;
  let mdat = false;
  let count = 0;
  while (offset < bytes.length) {
    if (bytes.length - offset < 8 || ++count > 10000)
      return { ok: false, message: 'Malformed MP4 box header.' };
    let length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    let header = 8;
    if (length === 1) {
      if (bytes.length - offset < 16) return { ok: false, message: 'Truncated extended MP4 box.' };
      const large = bytes.readBigUInt64BE(offset + 8);
      if (large > BigInt(Number.MAX_SAFE_INTEGER)) return { ok: false, message: 'Invalid MP4 box size.' };
      length = Number(large);
      header = 16;
    } else if (length === 0) {
      length = bytes.length - offset;
    }
    if (length < header || length > bytes.length - offset || !/^[\x20-\x7e]{4}$/.test(type))
      return { ok: false, message: 'Invalid or truncated MP4 box.' };
    if (type === 'ftyp') {
      if (offset !== 0 || ftyp || length < header + 8)
        return { ok: false, message: 'Invalid MP4 file-type box.' };
      const brand = bytes.toString('ascii', offset + header, offset + header + 4);
      let supported = ALLOWED_BRANDS.has(brand);
      for (let i = offset + header + 8; i + 4 <= offset + length; i += 4)
        supported ||= ALLOWED_BRANDS.has(bytes.toString('ascii', i, i + 4));
      if (!supported) return { ok: false, message: 'Unsupported MP4 brand.' };
      ftyp = true;
    } else if (type === 'moov') {
      if (length <= header) return { ok: false, message: 'Missing MP4 track metadata.' };
      moov = true;
    } else if (type === 'mdat') {
      if (length <= header) return { ok: false, message: 'Missing MP4 media data.' };
      mdat = true;
    }
    offset += length;
  }
  return ftyp && moov && mdat
    ? { ok: true, message: '' }
    : { ok: false, message: 'MP4 must contain file-type, track metadata and media data.' };
}
