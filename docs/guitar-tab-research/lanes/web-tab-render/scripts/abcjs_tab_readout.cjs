// Read back the string and fret abcjs drew in its guitar tablature, from the SVG: every <text class="abcjs-tab-number">
// is assigned to the nearest of the six lines of its tab staff (staff groups with 6 line paths). String 1 = top line.
// The time order comes from the line index and the x position (both voices share one staff, so x orders events).
// Writes the gtr-eval JSON (notes with a pseudo onset = (line * 100000 + x) / 1000 s; score with --ignore-time).
// Usage: node abcjs_tab_readout.cjs <page query> <out.json> <tuning low-to-high, e.g. 40,45,50,55,59,64> [capo]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [, , qs, out, tuningArg, capoArg] = process.argv;
  const tuning = tuningArg.split(',').map(Number);
  const capo = parseInt(capoArg || '0', 10);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1240, height: 900 } });
  await p.goto('http://127.0.0.1:8765/pages/abcjs.html?' + qs);
  await p.waitForFunction('window.__rendered === true');
  const raw = await p.evaluate(() => {
    const staves = [...document.querySelectorAll('#paper svg g.abcjs-staff')].map((g) => {
      const ys = [...g.querySelectorAll('path')].map((pa) => { const bb = pa.getBBox(); return bb.y + bb.height / 2; }).sort((a, c) => a - c);
      const lineCls = [...g.classList].find((c) => /^abcjs-l\d+$/.test(c));
      return { line: lineCls ? parseInt(lineCls.slice(7), 10) : -1, ys };
    }).filter((s) => s.ys.length === 6);
    const nums = [...document.querySelectorAll('#paper svg text.abcjs-tab-number')].map((t) => {
      const g = t.closest('g[class*="abcjs-tabNumber"]');
      const cls = g ? g.getAttribute('class') : '';
      return { text: t.textContent.trim(), x: parseFloat(t.getAttribute('x')), y: parseFloat(t.getAttribute('y')),
        fontSize: parseFloat(t.getAttribute('font-size') || '15'), cls };
    });
    return { staves, nums };
  });
  const notes = [];
  let unknown = 0;
  for (const n of raw.nums) {
    const yc = n.y - n.fontSize * 0.35;
    let best = null;
    for (const s of raw.staves) {
      for (let i = 0; i < 6; i++) {
        const d = Math.abs(s.ys[i] - yc);
        if (!best || d < best.d) best = { d, line: s.line, string: i + 1 };
      }
    }
    const fret = /^-?\d+$/.test(n.text) ? parseInt(n.text, 10) : null;
    if (fret === null) { unknown++; continue; }
    const voice = (n.cls.match(/abcjs-v(\d+)/) || [])[1];
    notes.push({ onset: +(((best.line * 100000) + n.x) / 1000).toFixed(4), string: best.string, fret,
      pitch: tuning[6 - best.string] + capo + fret, voice_index: voice ? +voice : null, line: best.line, dy: +best.d.toFixed(2) });
  }
  fs.writeFileSync(out, JSON.stringify({ tuning_midi: tuning, capo, notes, not_numbers: unknown,
    tab_staves: raw.staves.length, max_dy: Math.max(...notes.map((n) => n.dy)) }, null, 1));
  console.log(JSON.stringify({ tab_staves: raw.staves.length, numbers: raw.nums.length, notes: notes.length, not_numbers: unknown,
    max_dy: Math.max(...notes.map((n) => n.dy)), first5: notes.slice(0, 5) }));
  await b.close();
})();
