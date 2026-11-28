// alphaTab "editing" trial: alphaTab has no editor UI, so this checks the hooks an app would build one on.
// 1. render S2n.gp5 with note bounds; 2. click the first melody note of bar 1 with the mouse (Playwright) and record
// the noteMouseDown event; 3. change that note in the data model (fret 0 -> 2 on the same string) and re-render;
// 4. export the edited score as Guitar Pro 7 (.gp) and as alphaTex from the browser; 5. screenshot.
// Usage: node alphatab_edit.cjs <out prefix> [extra query, e.g. player=1]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 900 } });
  const msgs = [];
  page.on('console', (m) => msgs.push(m.type() + ': ' + m.text().slice(0, 300)));
  page.on('pageerror', (e) => msgs.push('pageerror: ' + String(e).slice(0, 300)));
  await page.goto('http://127.0.0.1:8765/pages/alphatab.html?file=/inputs/S2n/S2n.gp5&notebounds=1' + (process.argv[3] ? '&' + process.argv[3] : ''), { waitUntil: 'load' });
  await page.waitForFunction('window.__rendered === true', null, { timeout: 60000 });
  if ((process.argv[3] || '').includes('player=1')) {
    await page.waitForFunction('window.__playerReady === true', null, { timeout: 60000 });
  }
  // find the first melody note of bar 1 and its note-head bounds
  const target = await page.evaluate(() => {
    const api = window.api;
    const beat = api.score.tracks[0].staves[0].bars[1].voices[0].beats[0];
    const note = beat.notes[0];
    window.__clicked = [];
    api.noteMouseDown.on((n) => window.__clicked.push({ event: 'noteMouseDown', bar: n.beat.voice.bar.index, voice: n.beat.voice.index, string_alphatab: n.string, fret: n.fret, pitch: n.realValue }));
    api.beatMouseDown.on((b) => window.__clicked.push({ event: 'beatMouseDown', bar: b.voice.bar.index, voice: b.voice.index, beat: b.index }));
    const bb = api.boundsLookup.findBeat(beat);
    const nb = bb && bb.notes ? bb.notes.find((x) => x.note === note) : null;
    const box = document.getElementById('at').getBoundingClientRect();
    return {
      before: { string_alphatab: note.string, fret: note.fret, pitch: note.realValue },
      noteBounds: nb ? { x: nb.noteHeadBounds.x, y: nb.noteHeadBounds.y, w: nb.noteHeadBounds.w, h: nb.noteHeadBounds.h } : null,
      nBoundsNotes: bb && bb.notes ? bb.notes.length : null,
      container: { x: box.x, y: box.y },
    };
  });
  let clickResult = null;
  if (target.noteBounds) {
    // there are two note heads for this note (standard notation and tab); the bounds lookup gives one of them
    const x = target.container.x + target.noteBounds.x + target.noteBounds.w / 2;
    const y = target.container.y + target.noteBounds.y + target.noteBounds.h / 2;
    await page.mouse.click(x, y);
    await page.waitForTimeout(300);
    clickResult = await page.evaluate(() => window.__clicked);
  }
  // edit the model and re-render
  const edited = await page.evaluate(async () => {
    const api = window.api;
    const note = api.score.tracks[0].staves[0].bars[1].voices[0].beats[0].notes[0];
    window.__rendered = false;
    note.fret = 2;
    api.render();
    await new Promise((r) => { const iv = setInterval(() => { if (window.__rendered) { clearInterval(iv); r(); } }, 50); });
    const gp = new alphaTab.exporter.Gp7Exporter().export(api.score, api.settings);
    const tex = new alphaTab.exporter.AlphaTexExporter().exportToString(api.score, api.settings);
    return { after: { string_alphatab: note.string, fret: note.fret, pitch: note.realValue }, gp: Array.from(gp), tex };
  });
  fs.writeFileSync(out + '.edited.gp', Buffer.from(edited.gp));
  fs.writeFileSync(out + '.edited.atex', edited.tex);
  await page.screenshot({ path: out + '.edited.png', fullPage: true });
  const res = { target, clickResult, after: edited.after, gpBytes: edited.gp.length, texChars: edited.tex.length, console: msgs };
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await browser.close();
})();
