// scripts/check/assets.mjs on a seeded repo: a preview still or loop that is missing or over its cap, a project
// picture that isn't there, an icon or project picture over its cap, and a video or audio file a post names that
// is not in R2 each fail the deploy build, at the file and line that names them. A file exactly at its cap passes,
// and so does media in R2, in a folder that stays in git, or only shown as code.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';
import { ICON, PREVIEW_MEDIA, PROJECT_IMAGE } from '../../src/data/limits.js';

const KB = 1024;
const kb = (bytes) => `${(bytes / KB).toFixed(1)} KB`;
const post = (id, slug, body = 'Text.') => `---
id: "${id}"
title: "A post"
summary: "s"
date: 2026-11-01
topic: "agents"
preview:
  verdict: "Works"
  takeaway: "It ran."
  image: "/media/previews/${slug}.webp"
  loop: "/media/previews/${slug}.mp4"
---

${body}
`;
const POSTS = {
  ok: post('AO-600', 'ok', ['<video src="/media/ok/clip.mp4"></video>', '[A song](https://aaronorelup.com/media/ok/song.mp3?v=2), and a stream at /media/ok/stream.m3u8.',
    '<video src="/courses/c/lesson.mp4"></video>', 'A picture is no video: ![x](/media/ok/picture.webp)', '', '```html', '<video src="/media/ok/only-an-example.mp4"></video>', '```'].join('\n')),
  over: post('AO-601', 'over'),
  missing: post('AO-602', 'missing', ['<video src="/media/missing/on-disk-not-pushed.mp4"></video>', '<audio src="/courses/c/gone.mp3"></audio>'].join('\n')),
};

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'assets-'));
test.after(() => fs.rmSync(root, { recursive: true }));
const put = (rel, content) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), typeof content === 'number' ? Buffer.alloc(content) : content);
};
for (const [slug, text] of Object.entries(POSTS)) put(`src/content/posts/${slug}.md`, text);
put('src/content/projects/card.yaml', 'name: "P"\nimage:\n  src: /media/projects/card.webp\n  alt: "a"\n');
put('src/content/projects/no-picture.yaml', 'name: "P"\nimage:\n  src: /media/projects/none.webp\n  alt: "a"\n');
put('src/data/never-publish.json', '[]');
put('public/_redirects', '');
put('src/data/media-manifest.json', JSON.stringify({
  '/media/previews/ok.mp4': { bytes: PREVIEW_MEDIA.loopCap, etag: 'x' },
  '/media/previews/over.mp4': { bytes: PREVIEW_MEDIA.loopCap + KB, etag: 'x' },
  '/media/ok/clip.mp4': { bytes: 5e6, etag: 'x' }, '/media/ok/song.mp3': { bytes: 3e6, etag: 'x' }, '/media/ok/stream.m3u8': { bytes: 900, etag: 'x' },
}));
put('public/media/previews/ok.webp', PREVIEW_MEDIA.stillCap);
put('public/media/previews/over.webp', PREVIEW_MEDIA.stillCap + KB);
put('public/media/missing/on-disk-not-pushed.mp4', 10);
put('public/courses/c/lesson.mp4', 10);
put('public/media/icons/AO-600.webp', ICON.s256Cap);
put('public/media/icons/AO-600-96.webp', ICON.s96Cap);
put('public/media/icons/AO-601.webp', ICON.s256Cap + KB);
put('public/media/icons/AO-601-96.webp', ICON.s96Cap + KB);
put('public/media/icons/source.png', ICON.s256Cap * 4);
put('public/media/projects/card.webp', PROJECT_IMAGE.cap);
put('public/media/projects/big.webp', PROJECT_IMAGE.cap + KB);

const runs = { check: runChecks({ root }), deploy: runChecks({ root, deploy: true }) };
const assets = (level, file) => runs[level].filter((i) => i.rule === 'assets' && (!file || i.file === file));
const shape = (issues) => issues.map((i) => [i.line, i.severity, i.message]).sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0) || a[2].localeCompare(b[2]));
const lineOf = (text, needle) => text.slice(0, text.indexOf(needle)).split('\n').length;

test('a file at its cap, media in R2 or in a folder that stays in git, and media shown as code all pass', () => {
  for (const level of ['check', 'deploy']) {
    assert.deepEqual(assets(level, 'src/content/posts/ok.md'), []);
    assert.deepEqual(assets(level, 'src/content/projects/card.yaml'), []);
    for (const file of ['AO-600.webp', 'AO-600-96.webp', 'source.png']) assert.deepEqual(assets(level, `public/media/icons/${file}`), [], file);
    assert.deepEqual(assets(level, 'public/media/projects/card.webp'), []);
  }
});

test('a preview still or loop over its cap fails the deploy, at the line that names it', () => {
  const raw = POSTS.over;
  for (const level of ['check', 'deploy']) {
    assert.deepEqual(shape(assets(level, 'src/content/posts/over.md')), [
      [lineOf(raw, 'image:'), 'error', `preview image /media/previews/over.webp is ${kb(PREVIEW_MEDIA.stillCap + KB)}, over the ${kb(PREVIEW_MEDIA.stillCap)} cap: remake it with scripts/tools/preview-media.mjs (PREVIEWS.md)`],
      [lineOf(raw, 'loop:'), 'error', `preview loop /media/previews/over.mp4 is ${kb(PREVIEW_MEDIA.loopCap + KB)}, over the ${kb(PREVIEW_MEDIA.loopCap)} cap: remake it with scripts/tools/preview-media.mjs (PREVIEWS.md)`],
    ], level);
  }
});

test('a preview that is nowhere, and a video or audio file that is not in R2, fail the deploy', () => {
  const raw = POSTS.missing;
  const notInR2 = (url) => `${url} is not in R2: npm run media:push (docs/MEDIA.md)`;
  for (const level of ['check', 'deploy']) {
    assert.deepEqual(shape(assets(level, 'src/content/posts/missing.md')), [
      [lineOf(raw, 'image:'), 'error', 'preview image /media/previews/missing.webp is neither under public/ nor in R2'],
      [lineOf(raw, 'loop:'), 'error', notInR2('/media/previews/missing.mp4')],
      [lineOf(raw, 'loop:'), 'error', 'preview loop /media/previews/missing.mp4 is neither under public/ nor in R2'],
      // On disk is not enough: video and audio are served from R2, so one that was never pushed would 404.
      [lineOf(raw, 'on-disk-not-pushed'), 'error', notInR2('/media/missing/on-disk-not-pushed.mp4')],
      [lineOf(raw, 'gone.mp3'), 'error', notInR2('/courses/c/gone.mp3')],
    ], level);
  }
});

test('a project picture that is not under public/ fails the deploy', () => {
  assert.deepEqual(shape(assets('deploy', 'src/content/projects/no-picture.yaml')),
    [[3, 'error', 'image /media/projects/none.webp is not under public/: make it with scripts/tools/preview-media.mjs (docs/MEDIA.md)']]);
});

test('an icon or a project picture over its cap fails the deploy, each size by its own cap', () => {
  const over = (bytes, cap) => [[null, 'error', `${kb(bytes)}, over its ${kb(cap)} cap (src/data/limits.js)`]];
  for (const level of ['check', 'deploy']) {
    assert.deepEqual(shape(assets(level, 'public/media/icons/AO-601.webp')), over(ICON.s256Cap + KB, ICON.s256Cap));
    assert.deepEqual(shape(assets(level, 'public/media/icons/AO-601-96.webp')), over(ICON.s96Cap + KB, ICON.s96Cap));
    assert.deepEqual(shape(assets(level, 'public/media/projects/big.webp')), over(PROJECT_IMAGE.cap + KB, PROJECT_IMAGE.cap));
  }
  // Nothing else in the seeded repo trips the rule.
  assert.deepEqual([...new Set(assets('deploy').map((i) => i.file))].sort(), ['public/media/icons/AO-601-96.webp', 'public/media/icons/AO-601.webp',
    'public/media/projects/big.webp', 'src/content/posts/missing.md', 'src/content/posts/over.md', 'src/content/projects/no-picture.yaml']);
});
