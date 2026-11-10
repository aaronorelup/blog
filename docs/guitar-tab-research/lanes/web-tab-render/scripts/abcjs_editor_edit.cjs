// Edit a note through the abcjs Editor's UI (its textarea) with Playwright: in bar 1 of the melody, change the first
// note G,4 (G4 written = G3 sounding) to A,4 by typing, then read the re-rendered tab numbers and save the edited ABC
// (the textarea is the export) and a screenshot.
// Usage: node abcjs_editor_edit.cjs <abc url> <out prefix>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [, , src, out] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1240, height: 900 } });
  await p.goto('http://127.0.0.1:8765/pages/abcjs_editor.html?src=' + src);
  await p.waitForFunction('window.__rendered === true');
  const before = await p.evaluate(() => window.__tabNumbers());
  const text = await p.$eval('#abc', (t) => t.value);
  // the first melody bar line after "V:1": find "z16 | " then the first note token "G4" (written-octave file: "G4")
  const idx = text.indexOf('z16 | ', text.indexOf('V:1')) + 'z16 | '.length;
  const token = text.slice(idx, idx + 2);
  // select those two characters in the textarea and type the replacement, as a user would
  await p.focus('#abc');
  await p.evaluate(([s, e]) => { const t = document.getElementById('abc'); t.setSelectionRange(s, e); }, [idx, idx + 2]);
  await p.keyboard.type('A4');
  await p.waitForTimeout(800);
  const after = await p.evaluate(() => window.__tabNumbers());
  const edited = await p.$eval('#abc', (t) => t.value);
  fs.writeFileSync(out + '.edited.abc', edited);
  await p.screenshot({ path: out + '.edited.png', fullPage: true });
  const res = { replaced: token, with: 'A4', at: idx, tab_numbers_before_first8: before.slice(0, 8), tab_numbers_after_first8: after.slice(0, 8),
    n_before: before.length, n_after: after.length, changed_positions: before.map((v, i) => (v !== after[i] ? i : -1)).filter((i) => i >= 0) };
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await b.close();
})();
