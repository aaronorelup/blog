// scripts/tools/budgets.mjs over a made-up dist/: every row is measured, the heaviest post is named, the ledger's
// rows are counted, an element's chunk and inlined CSS are weighed (and left out of the post's chrome), so is what
// Listen loads, a live notebook is never measured, and an over-budget row is reported as over.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';
import { format, measure } from '../../scripts/tools/budgets.mjs';

const page = (body, head = '') => `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

function seed() {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'budgets-'));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(dist, rel)), { recursive: true });
    fs.writeFileSync(path.join(dist, rel), text);
  };
  put('_astro/site.css', 'body{margin:0}\n');
  put('_astro/entry.js', "import './dep.js';\nconsole.log(1);\n");
  put('_astro/dep.js', 'export const d = 1;\n');
  // The registry's map (as Vite writes it) and two element chunks; one shares the up-front dep, which isn't its own.
  put('_astro/registry.js', 'const L={"./ao-big/element.js":()=>n(()=>import("./big.js"),[]),"./ao-x/element.js":()=>n(()=>import("./x.js"),[])};\n');
  put('_astro/x.js', "import './dep.js';\ncustomElements.define('ao-x', class extends HTMLElement {});\n");
  const bulk = Array.from({ length: 3000 }, (_, i) => ((i * 2654435761) >>> 0).toString(36)).join(' ');
  put('_astro/big.js', `customElements.define('ao-big', class extends HTMLElement {}); // ${bulk}\n`);
  // Read-aloud's chunk, which Listen loads: its own bytes, not the up-front dep it shares.
  put('_astro/reader.js', "import './dep.js';\nCSS.highlights.set(\"ao-read\",new Highlight);\n");
  const head = '<link rel="stylesheet" href="/_astro/site.css"><script type="module" src="/_astro/entry.js"></script>';
  put('index.html', page('<main>home</main>', head));
  put('ledger/index.html', page(`<ol>${'<li class="row"><a data-ledger-entry>row</a></li>'.repeat(3)}</ol>`, head));
  put('ledger/light/index.html', page('<article><style data-ao>ao-big{display:block}\nao-x{display:grid}</style>' +
    '<nav>chrome</nav><div class="pc-prose"><ao-x>a</ao-x><ao-big>b</ao-big></div></article>', head));
  // Chrome no prose rule removes, made of random bytes so gzip can't shrink it: the heaviest post, over budget.
  const noise = Array.from({ length: 30000 }, (_, i) => ((i * 2654435761) >>> 0).toString(36)).join(' ');
  put('ledger/heavy/index.html', page(`<nav>${noise}</nav><article class="prose">words</article>`, head));
  // Inlined element CSS heavier still: the element's weight, not the page's chrome, so never the heaviest post.
  put('ledger/styled/index.html', page(`<article><style data-ao>${noise}${noise}</style><nav>chrome</nav>` +
    '<div class="pc-prose"><ao-z>z</ao-z></div></article>', head));
  // A live notebook heavier still: never measured.
  put('ledger/teardown-lab/index.html', page(`<nav>${noise}${noise}</nav>`, head));
  return dist;
}

test('budgets measure every row, skip the live notebook and flag what is over', () => {
  const dist = seed();
  try {
    const rows = measure(dist);
    const by = Object.fromEntries(rows.map((r) => [r.name.trim(), r]));
    for (const name of ['post page minus its prose', 'chrome HTML', 'CSS', 'JS up front', '/ledger/ chrome HTML',
      '/ledger/ per row', 'homepage before the scene', 'HTML', 'entry JS']) {
      assert.ok(by[name], `row ${name}`);
      assert.ok(Number.isInteger(by[name].bytes) && by[name].bytes > 0, `${name} has a size`);
    }
    assert.equal(by['post page minus its prose'].where, 'heavy');
    assert.equal(by['/ledger/ per row'].where, '3 rows');
    assert.ok(by['JS up front'].bytes > 0);
    assert.equal(by['an element, JS + CSS'].where, 'ao-big, the nearest its budget');
    assert.ok(by['an element, JS + CSS'].bytes > 6 * 1024, 'its chunk and its CSS');
    assert.equal(by['read-aloud on, JS'].bytes, zlib.gzipSync(fs.readFileSync(path.join(dist, '_astro/reader.js'))).length);
    const text = format(rows);
    assert.match(text, /post page minus its prose.*% over.*\(heavy\)/);
    assert.doesNotMatch(text, /teardown-lab/);
  } finally {
    fs.rmSync(dist, { recursive: true, force: true });
  }
});
