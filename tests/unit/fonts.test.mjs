// scripts/tools/fonts.mjs misses(): over a made-up dist/, a display code point no self-hosted face covers is missed,
// one no family has (recorded as lacking) is not, scripts count, and a live notebook never does. Then the real build,
// when there is one: every code point its pages show has a self-hosted face, or no family has it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { misses } from '../../scripts/tools/fonts.mjs';

const page = (text) => `<!doctype html><html><head><meta name="ao-build" content="x"></head><body>${text}</body></html>`;

test('misses names what no face covers, never what no family has or what a live notebook shows', () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'fonts-'));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(dist, rel)), { recursive: true });
    fs.writeFileSync(path.join(dist, rel), text);
  };
  try {
    put('about/index.html', page('Plain text, ł, and 🙂, and &#x416;'));          // Ж as an entity
    put('_astro/view.js', 'el.textContent = "→";');
    put('ledger/teardown-lab/index.html', page('θ only in the live notebook'));
    put('labs/other/index.html', '<p>ψ in a page Astro did not build</p>');
    const fonts = { faces: [{ range: 'U+0000-00FF' }, { range: 'U+0142' }], lacking: ['🙂'.codePointAt(0)] };
    assert.deepEqual(misses(dist, fonts), [0x416, 0x2192]);
  } finally {
    fs.rmSync(dist, { recursive: true, force: true });
  }
});

test('the built site shows no code point the self-hosted fonts miss', { skip: !fs.existsSync('dist') && 'no build' }, () => {
  assert.deepEqual(misses('dist'), []);
});
