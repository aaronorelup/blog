// The lore hidden pages and their list (scripts/check/hidden.mjs): a marked page missing from the list, an entry whose
// page is gone or unmarked, and a model copy still carrying the lab's line all fail the deploy; the real repo passes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';
import { adapt } from '../../scripts/tools/hidden-models.mjs';

const HEAD = '<meta name="robots" content="noindex, nofollow">\n<meta name="ao:hidden" content="lore">';
const entry = (address, extra = {}) => ({
  address, id: null, title: 'A page', episode: 'E2', status: 'not yet attached', attached: null,
  page: 'What is on it.', story: 'How it ties in.', lore: null, model: null, ...extra,
});

function seed(pages, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hidden-'));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  put('src/data/hidden-pages.json', JSON.stringify({ pages }, null, 2));
  put('src/data/never-publish.json', '[]');
  put('src/data/media-manifest.json', '{}');
  put('public/_redirects', '');
  for (const [rel, text] of Object.entries(files)) put(rel, text);
  return root;
}

const errors = (root) => runChecks({ root, deploy: true })
  .filter((i) => i.rule === 'hidden' && i.severity === 'error').map((i) => `${i.file}: ${i.message}`);

test('the list and the marked pages agree, or the deploy fails', () => {
  const root = seed([entry('/ledger/ep/listed/'), entry('/ledger/ep/gone/'), entry('/ledger/ep/unmarked/'),
    entry('/ledger/ep/modelled/', { model: '/labs/x/' })], {
    'public/ledger/ep/listed/index.html': HEAD,
    'public/ledger/ep/unmarked/index.html': '<meta name="robots" content="noindex">',
    'public/ledger/ep/stray/index.html': HEAD,
    'public/ledger/ep/modelled/index.html': HEAD,
    'public/ledger/ep/modelled/model/index.html': '<meta name="robots" content="noindex"><div>teardown-lab experiment \\xB7 not canon</div>',
  });
  try {
    const found = errors(root);
    assert.ok(found.some((e) => e.includes('/ledger/ep/gone/: there is no public/ledger/ep/gone/index.html')), found.join('\n'));
    assert.ok(found.some((e) => e.includes('/ledger/ep/unmarked/: public/ledger/ep/unmarked/index.html has no <meta name="ao:hidden"')));
    assert.ok(found.some((e) => e.startsWith('public/ledger/ep/stray/index.html: a lore hidden page that')));
    assert.ok(found.some((e) => e.includes('still carries the lab\'s "not canon" line')));
    assert.ok(!found.some((e) => e.includes('/ledger/ep/listed/')));
  } finally {
    fs.rmSync(root, { recursive: true });
  }
});

test('an attached page needs where the episode shows it', () => {
  const root = seed([entry('/ledger/ep/a/', { status: 'attached' })], { 'public/ledger/ep/a/index.html': HEAD });
  try {
    assert.ok(errors(root).some((e) => e.includes('attached, so it needs attached.at')));
  } finally {
    fs.rmSync(root, { recursive: true });
  }
});

test('the real hidden pages and their list agree', () => {
  assert.deepEqual(errors(undefined), []);
});

test("a model copy gets the robots line and loses only the lab's line", () => {
  const html = '<html><head><meta charset="utf-8"><title>x</title></head><body><script>s(\'<div class="notcanon">teardown-lab experiment \\xB7 not canon</div>\')</script></body></html>';
  const out = adapt(html);
  assert.match(out, /<meta charset="utf-8">\n<meta name="robots" content="noindex/);
  assert.ok(!out.includes('not canon'));
  assert.equal(out.replace(/\n<meta name="robots"[^>]*>/, '').replace('<div hidden></div>', '<div class="notcanon">teardown-lab experiment \\xB7 not canon</div>'), html);
  assert.throws(() => adapt('<meta charset="utf-8">'), /found it 0 times/);
});
