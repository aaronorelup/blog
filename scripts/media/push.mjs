#!/usr/bin/env node
// npm run media:push: puts the site's new or changed video and audio into R2, records them in
// src/data/media-manifest.json, and takes the local copies out of public/ (the build refuses
// video and audio there; --keep leaves them). Drop a clip in public/media/<slug>/, reference it in
// the post by its URL path as usual, run this, commit the manifest. docs/MEDIA.md has the rest.
//
// Credentials: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_ENDPOINT from the environment, or
// from Infisical through ~/.claude/bin/getkey.py. Uploads are signed S3 PUTs, one piece per file
// (so R2's ETag is the file's MD5), with the content type the site serves each extension as.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BUCKET, localMedia, md5, readManifest, typeOf, writeManifest } from './files.mjs';

const keep = process.argv.includes('--keep');
const manifest = readManifest();
const todo = [];
let unchanged = 0;
for (const [url, file] of localMedia()) {
  const bytes = fs.readFileSync(file);
  const entry = { bytes: bytes.byteLength, etag: md5(bytes) };
  const known = manifest[url];
  if (known && known.bytes === entry.bytes && known.etag === entry.etag) unchanged++;
  else todo.push({ url, file, entry });
}

if (todo.length) {
  const r2 = { id: secret('R2_ACCESS_KEY_ID'), key: secret('R2_SECRET_ACCESS_KEY'), endpoint: secret('R2_ENDPOINT').replace(/\/+$/, '') };
  let done = 0;
  let sent = 0;
  const worker = async () => {
    for (let job = todo.shift(); job; job = todo.shift()) {
      const etag = await put(r2, job.url.slice(1), fs.readFileSync(job.file), typeOf(job.url));
      if (etag !== job.entry.etag) throw new Error(`${job.url}: R2 answered ETag ${etag}, the file's MD5 is ${job.entry.etag}`);
      manifest[job.url] = job.entry;
      done++;
      sent += job.entry.bytes;
      console.log(`up ${job.url} (${mb(job.entry.bytes)})`);
    }
  };
  try {
    await Promise.all(Array.from({ length: 8 }, worker));
  } finally {
    writeManifest(manifest);
  }
  console.log(`Uploaded ${done} file(s), ${mb(sent)}, to R2 bucket ${BUCKET}.`);
}
console.log(`${unchanged} file(s) were already in R2.`);

if (!keep) {
  let removed = 0;
  for (const [url, file] of localMedia()) {
    if (manifest[url]?.etag === md5(fs.readFileSync(file))) { fs.unlinkSync(file); removed++; }
  }
  if (removed) console.log(`Took ${removed} local cop${removed === 1 ? 'y' : 'ies'} out of public/ (the site serves them from R2).`);
}
console.log('Commit src/data/media-manifest.json with the post.');

// One S3 PUT, signed with AWS Signature V4 (region "auto" on R2). Returns R2's ETag, unquoted.
async function put(r2, key, body, type) {
  const url = new URL(`${r2.endpoint}/${BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`);
  const stamp = new Date().toISOString().replace(/[-:]|\.\d+/g, '');
  const scope = `${stamp.slice(0, 8)}/auto/s3/aws4_request`;
  const headers = { 'content-type': type, host: url.host, 'x-amz-content-sha256': sha256(body), 'x-amz-date': stamp };
  const names = Object.keys(headers).sort();
  const request = ['PUT', url.pathname, '', ...names.map((n) => `${n}:${headers[n]}`), '', names.join(';'), headers['x-amz-content-sha256']].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', stamp, scope, sha256(request)].join('\n');
  const signingKey = scope.split('/').reduce((k, part) => hmac(k, part), 'AWS4' + r2.key);
  const signature = crypto.createHmac('sha256', signingKey).update(toSign).digest('hex');
  delete headers.host;
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${r2.id}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`;
  const res = await fetch(url, { method: 'PUT', headers, body });
  if (!res.ok) throw new Error(`${key}: R2 answered ${res.status} ${/<Code>([^<]*)/.exec(await res.text())?.[1] || ''}`);
  return res.headers.get('etag').replaceAll('"', '');
}

function secret(name) {
  if (process.env[name]) return process.env[name];
  const getkey = path.join(os.homedir(), '.claude', 'bin', 'getkey.py');
  for (const python of ['python3', 'python']) {
    const r = spawnSync(python, [getkey, name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  throw new Error(`No ${name}: set it in the environment, or store it in Infisical for ${getkey}`);
}

function sha256(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
function hmac(key, data) { return crypto.createHmac('sha256', key).update(data).digest(); }
function mb(n) { return `${(n / 1048576).toFixed(1)} MB`; }
