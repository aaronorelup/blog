// The site's video and audio: which files they are, where they live, and the manifest that lists
// what is in R2. Shared by push.mjs, verify.mjs and guard.mjs. docs/MEDIA.md says how it fits.
//
// Video and audio are not kept in git. They live in the private R2 bucket below, each under its
// URL path without the leading slash (/media/<slug>/clip.mp4 is the object media/<slug>/clip.mp4),
// and the Worker (worker/media.js) serves them at the same URLs. public/courses/ is the exception:
// the course publishers in other repos write it, so its media stay in git until they upload too.
// So does public/media/teardown-lab/ (AO-073): a live notebook a fleet of other sessions is still
// writing, video included. Leave it to them; move it once that post is finished.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
export const PUBLIC = path.join(ROOT, 'public');
export const BUCKET = 'aaronorelup-site-media';
export const SITE = 'https://aaronorelup.com';
export const MANIFEST = path.join(ROOT, 'src', 'data', 'media-manifest.json');
export const STAYS_IN_GIT = ['courses/', 'media/teardown-lab/'];

export const TYPES = {
  mp4: 'video/mp4', m4v: 'video/x-m4v', webm: 'video/webm', mov: 'video/quicktime',
  m3u8: 'application/vnd.apple.mpegurl', ts: 'video/mp2t',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', flac: 'audio/flac',
  ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg',
};

export const typeOf = (file) => TYPES[path.extname(file).slice(1).toLowerCase()];

// Every file under public/, as [URL path, absolute path].
export function publicFiles(dir = PUBLIC) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? publicFiles(p) : [['/' + path.relative(PUBLIC, p).split(path.sep).join('/'), p]];
  });
}

// The video and audio under public/ that belong in R2 (everything outside STAYS_IN_GIT).
export const localMedia = () =>
  publicFiles().filter(([url]) => typeOf(url) && !STAYS_IN_GIT.some((dir) => url.startsWith('/' + dir)));

// { "/media/<slug>/clip.mp4": { bytes, etag } }; etag is the file's MD5, which is what R2 reports
// for an object uploaded in one piece, so the live ETag proves the bytes are the same.
export const readManifest = () => (fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {});

export function writeManifest(entries) {
  const lines = Object.keys(entries).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(entries[k])}`);
  fs.writeFileSync(MANIFEST, `{\n${lines.join(',\n')}\n}\n`);
}

export const md5 = (bytes) => crypto.createHash('md5').update(bytes).digest('hex');
