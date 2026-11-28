// Gap round 2 (web-tab-render): change one note's string (and the fret that keeps its pitch) in alphaTab 1.9.0's data
// model in headless Chromium, re-render, and export Guitar Pro 7, as alphatab_edit.cjs (r0132) did for a fret only.
// S2n.gp5, melody bar 1 note 2 (G3, open G string): alphaTab Note.string 4 -> 3 (alphaTab counts 1 = lowest string,
// so string 3 from the top -> string 4 from the top) and fret 0 -> 5. No editor: the page's API only.
// Usage: node alphatab_model_string_edit.cjs <out prefix>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 900 } });
  const msgs = [];
  page.on('console', (m) => msgs.push(m.type() + ': ' + m.text().slice(0, 300)));
  page.on('pageerror', (e) => msgs.push('pageerror: ' + String(e).slice(0, 300)));
  await page.goto('http://127.0.0.1:8765/pages/alphatab.html?file=/inputs/S2n/S2n.gp5', { waitUntil: 'load' });
  await page.waitForFunction('window.__rendered === true', null, { timeout: 60000 });
  const r = await page.evaluate(async () => {
    const api = window.api;
    const staff = api.score.tracks[0].staves[0];
    const note = staff.bars[1].voices[0].beats[1].notes[0];
    const desc = (n) => ({ string_alphatab: n.string, string_from_top: staff.tuning.length - n.string + 1, fret: n.fret, pitch: n.realValue });
    const before = desc(note);
    window.__rendered = false;
    note.string = 3;
    note.fret = 5;
    api.render();
    await new Promise((res) => { const iv = setInterval(() => { if (window.__rendered) { clearInterval(iv); res(); } }, 50); });
    const gp = new alphaTab.exporter.Gp7Exporter().export(api.score, api.settings);
    const tex = new alphaTab.exporter.AlphaTexExporter().exportToString(api.score, api.settings);
    return { before, after: desc(note), gp: Array.from(gp), tex };
  });
  fs.writeFileSync(out + '.edited.gp', Buffer.from(r.gp));
  fs.writeFileSync(out + '.edited.atex', r.tex);
  await page.screenshot({ path: out + '.edited.png', fullPage: true });
  const res = { before: r.before, after: r.after, gpBytes: r.gp.length, texChars: r.tex.length, console: msgs };
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await browser.close();
})();
