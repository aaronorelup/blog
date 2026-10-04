/* 01.01 · 07 — The lantern: agents and your files
   The string (hello.py, read as letters) hangs under the course lantern. A then/now block names the change arc.
   The agent (gold sparkle) comes down from the lantern and WORKS on the string: creates a new tagged string, reads
   along the beads, edits one bead (h -> H); then reads a picture as a picture (the PNG string becomes a thumbnail).
   AGENTS.md / CLAUDE.md are strings whose NAMES carry the signal; Magika's scan bar reads the beads, not the tag;
   three invisible beads (a zero-width space) slide in and the sparkle points at them. */
SCENE('07', (t, S) => {
  const C = K.C, L = M.layout.lantern;
  K.bg({ glow: 0.5, glowX: 960, glowY: 200 });

  // ---------------------------------------------------------------- beats (local seconds; fallbacks = narrated times)
  const A1 = S.cue('agent-hand', 7.66), A2 = S.cue('agents-md', 18.76), A3 = S.cue('magika', 33.23), A4 = S.cue('invisible', 44.88);
  const tMade = S.find(/^made/i, 0, 1.23), tAuto = S.find(/^autocomplete/i, 0, 4.12);
  const tCreate = S.find(/^create/i, 0, 10.02), tRead = S.find(/^read$/i, 0, 11.21), tEdit = S.find(/^edit/i, 0, 11.86);
  const tText = S.find(/^They$/i, 0, 15.03), tPics = S.find(/^pictures/i, 0, 17.03);
  const tClaude = S.find(/^CLAUDE/i, 1, 20.99), tPlain = S.find(/^plain/i, 0, 22.99);
  const tMe = S.find(/^me$/i, 0, 25.14), tSame = S.find(/^Same/i, 0, 26.17), tLinux = S.find(/^Linux/i, 0, 31.72);
  const tIdent = S.find(/^identifies/i, 0, 35.13), tDir = S.find(/^direction/i, 0, 38.57);
  const tName = S.find(/^name$/i, 0, 39.86), tCheck = S.find(/^check/i, 0, 43.22);
  const tInv = S.find(/^invisible/i, 0, 46.37), tAgent = S.find(/^agent$/i, 0, 47.96);

  // ---------------------------------------------------------------- the lantern (the course's AI, top-centre)
  K.map.lantern(t, 0, { x: 960, y: 150, glowK: 1.8 + 0.6 * K.io(t, A1 - 0.4, 0.6) * (1 - K.io(t, A1 + 1.2, 0.8)) });

  // ---------------------------------------------------------------- then / now: two columns above the string
  const blockOut = 1 - K.io(t, A2 - 0.5, 0.45);
  const nowK = K.io(t, A1, 0.5);
  const thenDim = 1 - 0.5 * nowK;
  K.layer(blockOut, () => {
    const LX = 600, RX = 1330;
    const rd = { ...M.type.read, color: C.strong, align: 'center' };
    K.eyebrow('Five years ago', LX, 262, { size: 26, align: 'center', alpha: thenDim * K.io(t, -0.2, 0.5) });
    K.text('you made every file', LX, 312, { ...rd, alpha: thenDim * K.io(t, tMade - 0.2, 0.5) });
    K.text('AI: autocomplete in one file', LX, 356, { ...rd, alpha: thenDim * K.io(t, tAuto, 0.5) });
    K.eyebrow('Now', RX, 262, { size: 26, align: 'center', alpha: nowK });
    K.text('coding agents work in your files', RX, 312, { ...rd, alpha: nowK });
    // create · read · edit light up on their words (gold = what the agent does)
    const words = [['create', tCreate], ['read', tRead], ['edit', tEdit]];
    const parts = [];
    words.forEach(([w, at], i) => {
      if (i) parts.push({ s: '  ·  ', color: C.soft, alpha: nowK * 0.8 });
      parts.push({ s: w, color: C.head, alpha: K.io(t, at - 0.1, 0.35) });
    });
    const totalW = parts.reduce((a, p) => a + K.measure(p.s, { font: 'ui', weight: 600, size: 30 }), 0);
    let cx = RX - totalW / 2;
    parts.forEach((p) => { const w = K.measure(p.s, { font: 'ui', weight: 600, size: 30 }); K.text(p.s, cx, 356, { font: 'ui', weight: 600, size: 30, color: p.color, alpha: p.alpha }); cx += w; });
  });

  // ---------------------------------------------------------------- the main string: hello.py, read as letters
  // 0 .. agents-md: under the lantern. agents-md .. magika: steps back (up, smaller, faint). magika ..: returns.
  const back = K.io(t, A2, M.motion.move) * (1 - K.io(t, A3, M.motion.move));
  const mx = L.x, my = K.lerp(L.y, 300, back), ms = K.lerp(L.s, 0.5, back);
  const g0 = M.geo(L.x, L.y, L.s);
  // read: a gold glow travels bead by bead; edit: bead 7 'h' (104) becomes 'H' (72)
  const rs = tRead + 0.05, re = tRead + 0.8;
  const sweep = K.seg(t, rs, re) * 13 - 0.5;
  const tFlip = tEdit + 0.35;
  const edited = t >= tFlip + 0.3;
  const dip = K.io(t, tFlip, 0.25) * (1 - K.io(t, tFlip + 0.35, 0.3));
  const editRing = K.io(t, tFlip, 0.3) * (1 - K.io(t, tFlip + 1.4, 0.5));
  const ringBeads = {};
  for (let i = 0; i < 12; i++) {
    const r = t > rs && t < re + 0.3 ? K.clamp(1 - Math.abs(sweep - i) / 1.2) : 0;
    ringBeads[i] = i === 7 ? Math.max(r, editRing) : r;
  }
  const bytes = M.BYTES.slice(), letters = M.LETTERS.slice();
  if (edited) { bytes[7] = 72; letters[7] = 'H'; }
  const scan1 = K.seg(t, tIdent - 0.2, tIdent + 1.6), scan2 = K.seg(t, tCheck - 0.1, tCheck + 1.3);
  const scanK = t < tCheck - 0.1 ? scan1 : scan2;
  const insK = K.io(t, tInv - 0.45, 0.9);
  const tagDim = 1 - 0.45 * K.io(t, tIdent - 0.3, 0.4) * (1 - K.io(t, tName - 0.3, 0.5));
  const gm = M.drawString(mx, my, ms, {
    t, preset: 'py', bytes, letters, alpha: K.lerp(1, 0.4, back),
    letterK: (i) => (i === 7 ? 1 - dip : 1),
    ringBeads,
    tag: { name: 'hello.py', mark: K.io(t, tName, 0.6) * (1 - K.io(t, A4, 0.5)) },
    tagK: tagDim,
    scanK,
    ins: { at: 7, k: insK },
  });

  // Magika's verdict: a guess from the beads, not the tag
  const verdict = K.io(t, tIdent + 1.5, 0.5) * (1 - K.io(t, A4, 0.5));
  if (verdict > 0) M.chip('looks like: Python', 1360, 655, { alpha: verdict });

  // ---------------------------------------------------------------- create: the agent makes a new tagged string
  const NOTE = { bytes: [35, 32, 110, 111, 116, 101, 115], letters: ['#', '·', 'n', 'o', 't', 'e', 's'] };
  const createOut = 1 - K.io(t, tText - 0.1, 0.45);
  if (t > tCreate - 0.1 && createOut > 0) {
    M.drawString(760, 800, 0.6, {
      t, ...NOTE, alpha: createOut, cordK: K.io(t, tCreate - 0.1, 0.5),
      beadK: (i) => K.stagger(t, tCreate + 0.1, i, 0.08, 0.4),
      letterK: (i) => K.stagger(t, tCreate + 0.7, i, 0.06, 0.4),
      tag: { name: 'notes.md', swing: K.io(t, tCreate, 0.8) }, tagK: K.io(t, tCreate, 0.3),
    });
  }

  // ---------------------------------------------------------------- text as text, pictures as pictures
  const picOut = 1 - K.io(t, A2 - 0.2, 0.5);
  const c1 = K.io(t, tText + 0.3, 0.5) * picOut;
  if (c1 > 0) M.chip('text → text', 1000, 655, { alpha: c1 });
  const tPng = tText + 0.5;
  const thumb = K.io(t, tPics - 0.1, 0.6);
  if (t > tPng - 0.1 && picOut > 0) {
    const PX = 1000, PY = 805;
    M.drawString(PX, PY, 0.6, {
      t, preset: 'png', alpha: picOut * (1 - thumb), cordK: K.io(t, tPng - 0.1, 0.4),
      beadK: (i) => K.stagger(t, tPng, i, 0.06, 0.35),
      stampK: K.io(t, tPng + 0.6, 0.4),
      tag: { name: 'photo.png' }, tagK: K.io(t, tPng, 0.3) * picOut,
    });
    if (thumb > 0) {
      K.layer(thumb * picOut, () => {
        const w = K.lerp(120, 250, thumb), h = w * 0.62, x0 = PX - w / 2, y0 = PY - h / 2;
        K.card(x0, y0, w, h, { r: 12, fill: '#2B2840', stroke: K.rgba(C.gold, 0.9), lw: 2.5, shadow: false });
        const gg = K.ctx();
        gg.save(); K.rr(x0 + 8, y0 + 8, w - 16, h - 16, 6); gg.clip();
        gg.fillStyle = '#3B3654'; gg.fillRect(x0, y0, w, h);
        gg.fillStyle = C.head; gg.beginPath(); gg.arc(x0 + w * 0.72, y0 + h * 0.32, h * 0.12, 0, Math.PI * 2); gg.fill();
        gg.fillStyle = '#6E6585'; gg.beginPath();
        gg.moveTo(x0, y0 + h); gg.lineTo(x0 + w * 0.32, y0 + h * 0.42); gg.lineTo(x0 + w * 0.55, y0 + h * 0.75);
        gg.lineTo(x0 + w * 0.72, y0 + h * 0.55); gg.lineTo(x0 + w, y0 + h * 0.9); gg.lineTo(x0 + w, y0 + h); gg.closePath(); gg.fill();
        gg.restore();
      });
      M.chip('image → picture', 1440, PY, { alpha: K.io(t, tPics + 0.2, 0.5) * picOut });
    }
  }

  // ---------------------------------------------------------------- AGENTS.md and CLAUDE.md: names that say "read me first"
  const mdOut = 1 - K.io(t, A3 - 0.2, 0.5);
  const AG = { bytes: [35, 32, 65, 71, 69, 78, 84, 83], letters: ['#', '·', 'A', 'G', 'E', 'N', 'T', 'S'] };
  const CL = { bytes: [35, 32, 67, 76, 65, 85, 68, 69], letters: ['#', '·', 'C', 'L', 'A', 'U', 'D', 'E'] };
  const markK = K.io(t, tSame, 0.6), tAg = A2 + 0.45;   // AGENTS.md waits for hello.py to step back
  if (t > tAg - 0.1 && mdOut > 0) {
    M.drawString(900, 560, 0.8, {
      t, ...AG, alpha: mdOut, cordK: K.io(t, tAg - 0.1, 0.5),
      beadK: (i) => K.stagger(t, tAg + 0.15, i, 0.08, 0.4),
      letterK: (i) => K.stagger(t, tPlain, i, 0.06, 0.4),
      tag: { name: 'AGENTS.md', swing: K.io(t, tAg, 0.8, 'back'), mark: markK }, tagK: K.io(t, tAg, 0.3),
    });
    if (t > tClaude - 0.1) M.drawString(900, 730, 0.8, {
      t, ...CL, alpha: mdOut, cordK: K.io(t, tClaude - 0.1, 0.5),
      beadK: (i) => K.stagger(t, tClaude + 0.15, i, 0.08, 0.4),
      letterK: (i) => K.stagger(t, tPlain + 0.2, i, 0.06, 0.4),
      tag: { name: 'CLAUDE.md', swing: K.io(t, tClaude, 0.8), mark: markK }, tagK: K.io(t, tClaude, 0.3),
    });
    // "plain text" under the beads, "read me first" beside the names
    const pk = K.io(t, tPlain, 0.5) * mdOut;
    if (pk > 0) K.text('plain text', 900, 852, { ...M.type.read, color: C.strong, align: 'center', alpha: pk });
    const rk = K.io(t, tMe - 0.3, 0.5) * mdOut;
    if (rk > 0) K.pill('the name says: read me first', 1520, 645, { size: 30, color: C.strong, stroke: K.rgba(C.gold, 0.8), alpha: rk });
    const nk = K.io(t, tLinux - 0.3, 0.5) * mdOut;
    if (nk > 0) K.note(1290, 720, 530, 'Linux Foundation', 'AGENTS.md · since Dec 2025', { size: 30, alpha: nk });
  }

  // ---------------------------------------------------------------- Magika, then where it's heading (bottom band)
  const magK = K.io(t, A3 + 0.1, 0.5) * (1 - K.io(t, tDir - 0.2, 0.45));
  if (magK > 0) K.note(960 - 300, 720, 600, 'Google Magika · since 2024', 'identifies file types from their bytes', { size: 30, alpha: magK });
  const dirK = K.io(t, tDir, 0.5) * (1 - K.io(t, A4, 0.5));
  if (dirK > 0) {
    K.eyebrow("Where it's heading", 960, 752, { size: 26, align: 'center', alpha: dirK });
    K.pill('name first, then check the beads', 960, 808, { size: 30, color: C.strong, stroke: K.rgba(C.gold, 0.7), alpha: dirK });
  }

  // ---------------------------------------------------------------- invisible characters
  const clusterX = gm.beads.filter((b) => b.ins).reduce((a, b) => a + b.x, 0) / 3 || 1170;
  const invK = K.io(t, tInv, 0.5);
  const ringK = K.io(t, tInv + 0.4, 0.7);
  if (invK > 0) {
    K.ring(clusterX, L.y, 1.4 * gm.sp + 4, gm.r * 1.7, ringK, { color: K.rgba(C.accent, 0.85), w: 3, rot: 0 });
    K.spans([
      { s: 'invisible to you', color: C.accent },
      { s: '  ·  ', color: C.soft },
      { s: 'read by agents', color: C.strong },
    ], 960, 700, { font: 'ui', weight: 600, size: 30, align: 'center', alpha: invK });
  }

  // ---------------------------------------------------------------- the agent: one sparkle, moved smoothly between jobs
  const drop = K.io(t, A1, 1.0), dropY = K.io(t, A1, 0.6, 'out');
  let ax = K.lerp(960, 1640, drop), ay = K.lerp(190, 470, dropY);
  const go = (at, x, y, d = 0.6, e = 'io') => { const k = K.io(t, at, d, e); ax = K.lerp(ax, x, k); ay = K.lerp(ay, y, k); };
  go(tCreate - 0.35, 1080, 770, 0.6);                       // create: beside the new notes.md string
  go(tRead - 0.3, g0.x0, 470, 0.4);                         // read: start of the beads ...
  { const k = K.seg(t, rs, re); if (t > rs) ax = K.lerp(g0.x0, g0.x1, k); } // ... and along them with the glow
  go(re, g0.beads[7].x, 470, 0.35);                         // edit: over bead 7
  go(tText + 0.3, 1640, 470, 0.7);                           // back to rest, beside the string
  go(tPics - 0.2, 1240, 700, 0.6);                           // pictures: looks at the thumbnail
  go(A2 - 0.1, 1660, 470, 0.7);                              // rest while the instruction files arrive
  go(tMe - 0.7, 250, 645, 0.8);                              // read me first: beside the two name tags
  go(tLinux - 0.2, 1660, 470, 0.8);                          // rest
  const tPoint = tAgent - 0.9;
  go(tPoint, clusterX + 120, 430, 0.8);                      // invisible: points at the ringed cluster
  if (drop > 0) M.agent(ax, ay, 72, { t, alpha: K.clamp(drop * 2.5), glow: 1 + 0.5 * K.io(t, tPoint, 0.8) });
  const pt = K.io(t, tPoint + 0.6, 0.5);
  if (pt > 0) K.arrow(clusterX + 80, 462, clusterX + 34, L.y - gm.r * 1.7 - 6, { k: pt, color: C.head, w: 3, bend: -12 });
});
