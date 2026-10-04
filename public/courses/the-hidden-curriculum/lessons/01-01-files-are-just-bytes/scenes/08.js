/* 01.01 · 08 Keep this (end card, noBadge)
   The painted tea house (lower band only) under the hello.py string at s 0.85 (legible numbers): the lesson's emblem.
   [[ignore]] five dim pills arrive as each is named; [[keep-1]] they fade and "KEEP THIS" takes their place.
   Each takeaway's bold lead lands on its spoken number ("One", "Two", "Three"), the rest on its own words.
   The emblem answers each takeaway: the beads glow on "bytes", letters crossfade in on "agreement",
   the extension is underlined on "label". Previous rows dim while the next is spoken, all return to full
   on [[next]], and the quiet next-stop line rises with no motion beyond that. */
SCENE('08', (t, S) => {
  const C = K.C, P = M.palette;

  // ---- timing (local seconds; fallbacks = narrated times) ----
  const cIg = S.cue('ignore', 0);
  const wHex = S.find('hex', 0, 1.94), wBits = S.find('bits', 0, 2.79), wU = S.find('U', 0, 3.78);
  const wByte = S.find('byte', 0, 5.11), wLine = S.find('line', 0, 6.12);
  const c1 = S.cue('keep-1', 7.52), c2 = S.cue('keep-2', 11.26), c3 = S.cue('keep-3', 16.91), cNx = S.cue('next', 22.01);
  const r1 = S.find('One', 0, 8.86);
  const wBytes = S.find('bytes', 0, 10.12);
  const wAgree = S.find('agreement', 0, 13.33), wUsually = S.find('usually', 0, 14.7);
  const wLabel = S.find('label', 0, 18.88), wPicks = S.find('picks', 0, 19.38);

  // ---- ground: lower band of the painted plate (falls back to K.bg alone) ----
  K.bg({ glow: 0.5 });
  if (K.img.plate) K.plate('plate', t, { shade: 0.55, mask: [700, 880] });
  K.petals(t, { n: 4, avoid: [[120, 110, 1800, 860]] });

  // ---- the emblem: one string, one tag, at the in-scene legible size (s 0.85: 24 px numbers, 29 px letters) ----
  const ES = 0.85, EY = 196;
  const tagW = Math.max(220 * ES, K.measure('hello.py', { font: 'mono', weight: 600, size: 34 * ES }) + 2 * 26 * ES + 40 * ES);
  const half = 5.5 * 100 * ES;                         // bead row half-span
  const left = -half - 62 * ES - tagW, right = half + 38 * ES;
  const ex = 960 - (left + right) / 2;                 // tag + beads read centred on 960
  const glowK = K.io(t, wBytes - 0.15, 0.5, 'out') * (1 - K.io(t, wBytes + 0.9, 1.0));
  if (glowK > 0) M.geo(ex, EY, ES).beads.forEach((b) => K.glow(b.x, b.y, 70, C.head, 0.6 * glowK));
  M.drawString(ex, EY, ES, {
    t, preset: 'py',
    letterK: (i) => K.stagger(t, wAgree - 0.1, i, 0.06, 0.4),
    lit: 1,
    tag: { name: 'hello.py', mark: K.io(t, wLabel - 0.1, 0.6) },
  });

  // ---- [[ignore]] SAFE TO IGNORE FOR NOW: five fixed, centred slots; each fills on its word; all fade by "Keep this" ----
  const out = 1 - K.io(t, c1 - 0.1, 0.5);
  if (out > 0) {
    K.layer(out, () => {
      K.rise(t, cIg + 0.15, () => K.eyebrow('Safe to ignore for now', 960, 315, { align: 'center' }), 12, 0.5);
      const items = [['hex', wHex], ['bits', wBits], ['UTF-16', wU], ['byte order marks', wByte], ['line endings', wLine]];
      const PS = 28, pw = items.map(([s]) => K.measure(s, { font: 'ui', weight: 600, size: PS }) + PS * 1.6), gap = 24;
      const slots = K.io(t, cIg + 0.15, 0.5);          // the empty row is laid out centred before any word lands
      let x = 960 - (pw.reduce((a, b) => a + b, 0) + gap * (items.length - 1)) / 2;
      items.forEach(([s, at], i) => {
        const cx = x + pw[i] / 2, h = PS * 1.9;
        if (slots > 0) K.card(cx - pw[i] / 2, 410 - h / 2, pw[i], h, { r: h / 2, fill: 'rgba(0,0,0,0)', stroke: K.rgba(C.gold, 0.18), alpha: slots, shadow: false });
        const k = K.io(t, at - 0.1, 0.4, 'out');
        if (k > 0) K.pill(s, cx, 410, { size: PS, alpha: k, color: K.rgba(C.strong, 0.82), stroke: K.rgba(C.gold, 0.5) });
        x += pw[i] + gap;
      });
    });
  }

  // ---- [[keep-1..3]] KEEP THIS + three takeaways (bold lead = lesson.js keep[i][0], gloss below) ----
  K.rise(t, c1 + 0.1, () => K.eyebrow('Keep this', 960, 315, { align: 'center' }), 12, 0.5);
  const rows = [
    { y: 400, at: r1, restAt: r1 + 0.6, lead: 'A file is just bytes.', rest: 'A string of numbers, each 0 to 255.' },
    { y: 520, at: c2, restAt: wUsually - 0.1, lead: 'Text is bytes plus an agreement.', rest: 'Almost always UTF-8.' },
    { y: 640, at: c3, restAt: wPicks + 0.9, lead: 'The extension is a label that picks the program, not the contents.', rest: 'Renaming .txt to .py changes zero bytes.' },
  ];
  const back = K.io(t, cNx - 0.2, 0.6);                // every row back to full for the close
  rows.forEach((r, i) => {
    const nextAt = rows[i + 1] ? rows[i + 1].at : Infinity;
    const dim = 1 - 0.4 * K.io(t, nextAt - 0.1, 0.5) * (1 - back);
    K.rise(t, r.at - 0.05, () => K.layer(dim, () => K.text(r.lead, 960, r.y, { font: 'head', weight: 700, size: 40, color: C.head, align: 'center' })), 16, 0.5);
    K.rise(t, r.restAt, () => K.layer(dim, () => K.text(r.rest, 960, r.y + 48, { font: 'read', weight: 400, size: 30, color: C.body, align: 'center' })), 10, 0.5);
  });

  // ---- [[next]] quiet next stop, no teaser motion; a soft night scrim keeps it off the painted stones ----
  const kn = K.io(t, cNx - 0.2, 0.8);
  if (kn > 0) {
    const g = K.ctx(), gr = g.createRadialGradient(960, 810, 0, 960, 810, 520);
    gr.addColorStop(0, K.rgba(C.page, 0.6 * kn)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.save(); g.translate(960, 810); g.scale(1, 0.16); g.translate(-960, -810); g.fillStyle = gr; g.fillRect(400, 0, 1120, 1620); g.restore();
  }
  K.rise(t, cNx, () => K.text('Next on the map: 01.02 · File extensions & associations', 960, 820,
    { font: 'ui', weight: 400, size: 28, color: C.soft, align: 'center' }), 10, 0.6);
});
