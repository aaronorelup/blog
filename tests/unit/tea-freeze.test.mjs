// scripts/tools/tea-freeze.mjs on a made-up build: a script's folder string ('/x/y/' + name) is pointed at the copy
// only when the copy holds every file of that folder, so a prefix of video or of other pages stays live.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { freeze } from '../../scripts/tools/tea-freeze.mjs';

test('a folder string is pointed at the copy only when the copy holds the whole folder', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'freeze-'));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  put('dist/media/previews/a.webp', 'a');
  put('dist/media/previews/b.webp', 'b');
  put('dist/media/previews/clip.mp4', 'v');
  put('dist/x/hero/one.webp', '1');
  put('dist/p/index.html', '<html><head><meta name="viewport" content="width=device-width">' +
    '<meta name="ao-build" content="abc"></head><body><img src="/media/previews/a.webp"><img src="/x/hero/one.webp">' +
    "<script>const clip = '/media/previews/'; const hero = '/x/hero/';</script></body></html>");
  const cwd = process.cwd();
  process.chdir(root);
  try {
    freeze({ page: '/p/', folder: 'public/c', dist: 'dist', log: () => {} });
  } finally {
    process.chdir(cwd);
  }
  const out = fs.readFileSync(path.join(root, 'public/c/index.html'), 'utf8');
  assert.match(out, /src="\/c\/assets\/media\/previews\/a\.webp"/);
  assert.match(out, /const clip = '\/media\/previews\/'/);
  assert.match(out, /const hero = '\/c\/assets\/x\/hero\/'/);
  assert.ok(!fs.existsSync(path.join(root, 'public/c/assets/media/previews/clip.mp4')));
});
