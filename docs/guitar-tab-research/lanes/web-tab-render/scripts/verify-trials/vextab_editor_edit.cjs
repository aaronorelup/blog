// VexTab 4.0.5 editor mode (div.vextab-auto editor="true"), driven like a user (verifier's trial, 2026-11-10).
// Opens pages/vextab_editor.html, reads the fret numbers VexFlow drew (text inside g.vf-tabnote, document order),
// replaces the first ":q 0/3" in the textarea with ":q 2/3" by selecting it and typing, waits for VexTab's 250 ms
// debounce and redraw, reads the numbers again and writes <out>.json and <out>.png.
// Usage: node vextab_editor_edit.cjs <out prefix>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1240, height: 900 } });
  const msgs = [];
  p.on('console', (m) => msgs.push({ type: m.type(), text: m.text().slice(0, 200) }));
  p.on('pageerror', (e) => msgs.push({ type: 'pageerror', text: String(e).slice(0, 300) }));
  await p.goto('http://127.0.0.1:8765/pages/vextab_editor.html');
  await p.waitForSelector('.vextab-auto svg');
  await p.waitForSelector('textarea.editor');
  const read = () => p.evaluate(() => [...document.querySelectorAll('.vextab-auto svg g.vf-tabnote text')].map((t) => t.textContent.trim()).filter((s) => s !== ''));
  const before = await read();
  const text = await p.$eval('textarea.editor', (t) => t.value);
  const target = ':q 0/3', repl = ':q 2/3';
  const at = text.indexOf(target);
  await p.$eval('textarea.editor', (t, [s, e]) => { t.focus(); t.setSelectionRange(s, e); }, [at, at + target.length]);
  await p.keyboard.type(repl);
  await p.waitForTimeout(1200);
  const after = await read();
  const changed = [];
  for (let i = 0; i < Math.max(before.length, after.length); i++) if (before[i] !== after[i]) changed.push({ i, before: before[i], after: after[i] });
  const err = await p.$eval('.editor-error', (d) => d.textContent).catch(() => null);
  await p.screenshot({ path: out + '.png', fullPage: true });
  const res = { replaced: target, with: repl, at, n_before: before.length, n_after: after.length, first8_before: before.slice(0, 8), first8_after: after.slice(0, 8), changed, editor_error: err, console: msgs.slice(0, 6) };
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await b.close();
})();
