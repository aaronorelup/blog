#!/usr/bin/env node
// npm run media:verify: asks the live site for every file in src/data/media-manifest.json and
// checks that it comes from R2 with the right length, type and ETag (a one-byte range each, so
// the whole run moves a few kilobytes). Then a mid-file range, the first two bytes and a 304 on one
// video. Exits 1 if anything is wrong. --site <origin> checks another deployment.
import { readManifest, SITE, typeOf } from './files.mjs';

const at = process.argv.indexOf('--site');
const site = at > 0 ? process.argv[at + 1].replace(/\/+$/, '') : SITE;
const manifest = readManifest();
const paths = Object.keys(manifest);
const failures = [];

const check = async (url) => {
  const { bytes, etag } = manifest[url];
  const res = await fetch(site + url, { headers: { Range: 'bytes=0-0' } });
  await res.arrayBuffer();
  const got = {
    status: res.status,
    range: res.headers.get('content-range'),
    type: res.headers.get('content-type'),
    etag: res.headers.get('etag'),
    source: res.headers.get('x-media-source'),
  };
  const want = { status: 206, range: `bytes 0-0/${bytes}`, type: typeOf(url), etag: `"${etag}"`, source: 'r2' };
  const wrong = Object.keys(want).filter((k) => got[k] !== want[k]);
  if (wrong.length) failures.push(`${url}: ${wrong.map((k) => `${k} ${got[k]} (want ${want[k]})`).join(', ')}`);
};

const queue = [...paths];
await Promise.all(Array.from({ length: 16 }, async () => {
  for (let url = queue.shift(); url; url = queue.shift()) await check(url).catch((e) => failures.push(`${url}: ${e.message}`));
}));
console.log(`${paths.length - failures.length} of ${paths.length} files answer from R2 with the right length, type and ETag.`);

// The answers a video player depends on, on the largest MP4.
const [video] = paths.filter((p) => p.endsWith('.mp4')).sort((a, b) => manifest[b].bytes - manifest[a].bytes);
const { bytes, etag } = manifest[video];
const mid = Math.floor(bytes / 2);
const probes = [
  ['a mid-file range', { Range: `bytes=${mid}-${mid + 999}` }, 206, `bytes ${mid}-${mid + 999}/${bytes}`, 1000],
  ['the first two bytes', { Range: 'bytes=0-1' }, 206, `bytes 0-1/${bytes}`, 2],
  ['If-None-Match', { 'If-None-Match': `"${etag}"` }, 304, null, 0],
];
for (const [what, headers, status, range, length] of probes) {
  const res = await fetch(site + video, { headers });
  const body = (await res.arrayBuffer()).byteLength;
  const ok = res.status === status && res.headers.get('content-range') === range && body === length;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}: ${res.status}, ${res.headers.get('content-range') || 'no Content-Range'}, ${body} bytes (${video})`);
  if (!ok) failures.push(`${video}: ${what} answered ${res.status} ${res.headers.get('content-range')} with ${body} bytes`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
