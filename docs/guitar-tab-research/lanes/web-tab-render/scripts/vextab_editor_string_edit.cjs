// Gap round 2 (web-tab-render): VexTab 4.0.5 editor mode (pages/vextab_editor.html, the verifier's page of r0407),
// changing a note's string instead of its fret: the second ":q 0/3" (melody bar 1 note 2, G3 on the G string) is
// selected in the editor's textarea and ":q 5/4" (G3 on the D string) is typed with the keyboard, as in
// verify-trials/vextab_editor_edit.cjs. Reads every fret number VexFlow drew with the tab line it sits on (string
// 1 = top line of its tab stave), before and after VexTab's redraw.
// Usage: node vextab_editor_string_edit.cjs <out prefix>
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
  const read = () => p.evaluate(() => {
    // tab staves: stave groups whose horizontal line paths number 6
    const staves = [...document.querySelectorAll('.vextab-auto svg g.vf-stave')].map((g) => [...g.querySelectorAll('path')]
      .map((pa) => pa.getBBox()).filter((bb) => bb.height < 1 && bb.width > 50).map((bb) => bb.y).sort((a, c) => a - c))
      .filter((ys) => ys.length === 6);
    return [...document.querySelectorAll('.vextab-auto svg g.vf-tabnote text')].filter((t) => t.textContent.trim() !== '').map((t) => {
      const bb = t.getBBox(); const yc = bb.y + bb.height / 2;
      let best = null;
      staves.forEach((ys, si) => ys.forEach((y, i) => { const d = Math.abs(y - yc); if (!best || d < best.d) best = { d, stave: si, string: i + 1 }; }));
      return { text: t.textContent.trim(), string: best ? best.string : null, stave: best ? best.stave : null, dy: best ? +best.d.toFixed(2) : null };
    });
  });
  const before = await read();
  const text = await p.$eval('textarea.editor', (t) => t.value);
  const target = ':q 0/3', repl = ':q 5/4';
  const at = text.indexOf(target, text.indexOf(target) + 1); // the second occurrence
  await p.$eval('textarea.editor', (t, [s, e]) => { t.focus(); t.setSelectionRange(s, e); }, [at, at + target.length]);
  await p.keyboard.type(repl);
  await p.waitForTimeout(1200);
  const after = await read();
  const changed = [];
  for (let i = 0; i < Math.max(before.length, after.length); i++) {
    const x = before[i], y = after[i];
    if (!x || !y || x.text !== y.text || x.string !== y.string) changed.push({ i, before: x, after: y });
  }
  const err = await p.$eval('.editor-error', (d) => d.textContent).catch(() => null);
  await p.screenshot({ path: out + '.png', fullPage: true });
  const res = { replaced: target, occurrence: 2, with: repl, at, n_before: before.length, n_after: after.length,
    first4_before: before.slice(0, 4), first4_after: after.slice(0, 4), max_dy: Math.max(...after.map((t) => t.dy)), changed, editor_error: err, console: msgs.slice(0, 6) };
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await b.close();
})();
