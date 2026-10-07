// 08 — Default apps: the whole ledger
// The lifted ledger from the room grows into a two-page book: left page "by label" (the familiar rows),
// right page "by app" (Firefox, and every label it can open, all held by Edge now). ONE state drives both pages:
// whenever a right-page row flips Edge -> Firefox, the matching left-page row (.html, .pdf) flips at the same moment
// with a gold pulse on both. Dated right pages: 2021 (the pen rewrites five rows one by one), 2022 (both pages rewind
// to Edge as the page turns; one "Set default" press rewrites four together; .pdf stays Edge), Europe 2025 (the same
// press rewrites .pdf and many more rows). Exit: book open, all calm.
SCENE('08', (t, S) => {
  const C = K.C, g = K.ctx(), P = M.palette, L = M.layout;
  K.bg();

  // ---------------------------------------------------------------- timing (local seconds)
  const T = {
    book: S.cue('book', 0),
    dflt: S.find('default', 1, 5.5),          // "A default app is just the program a row points to"
    byLabel: S.cue('by-label', 9),
    byApp: S.cue('by-app', 12.35),
    pick: S.find('pick', 0, 13.9),
    every: S.find('every', 0, 15.15),
    who: S.find('who', 0, 16.8),
    proof: S.cue('proof', 18.8),
    one: S.cue('one-click', 28.2),
    setDef: S.find(/^Set$/, 0, 29.0),
    eu: S.cue('europe', 32.3),
    rew: S.find('rewrites', 0, 34.6),
    same: S.find('Same', 0, 36.8),
  };

  // ---------------------------------------------------------------- geometry
  const SC = 1.18;                         // page scale: a 600-wide ledger page drawn 708 px wide
  const PW = 600, PH = M.ledgerH(5);       // local page size (334)
  const DY = 40;                           // book sits lower: centred in the space under the title
  const LX = 228, RX = 984, PY = 330 + DY;      // page origins on screen; spine at x 960
  const rowYL = (i) => M.LED.head + M.LED.row * (i + 0.5);   // local baseline-centre of row i
  const scr = (ox, x, y) => ({ x: ox + x * SC, y: PY + y * SC });
  const ROWF = { font: 'ui', weight: 600, size: 30 };
  const INK2 = '#7A4A1C';                  // the pen's brown ink (same as M.ledger)

  // ---------------------------------------------------------------- 1. 07's last ledger (one row: .py -> V S Code, top right)
  //   glides down-left and becomes the .py row of the full ledger, which opens around it as the book's left page
  const mk = K.io(t, T.book + 0.3, 1.1);
  const oneA = 1 - K.io(t, T.book + 0.9, 0.5);
  const fullA = K.io(t, T.book + 0.8, 0.6);

  // ---------------------------------------------------------------- 2. heading + date cards
  K.eyebrow('Windows Settings', 200, 150, { size: 24, alpha: K.io(t, T.book + 1.2, 0.6) });
  const titleK = K.io(t, T.book + 0.7, 0.7);
  K.title('Default apps', 200, 216, { size: 56, alpha: titleK });

  const cards = [
    ['Oct 2021', 'Windows 11 launch', T.proof],
    ['Mar 2022', 'Set default returns', T.one],
    ['Jul 2025', 'Europe (EEA) only', T.eu],
  ];
  const widths = cards.map((c) => M.dateCard(c[0], c[1], 0, 0, { k: 0 }).w);
  let cx = 1720 - widths.reduce((a, b) => a + b, 0) - 18 * (cards.length - 1);
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    const quiet = next && t > next[2] + 0.3;
    M.dateCard(c[0], c[1], cx, 132, { k: K.io(t, c[2], 0.6), tone: quiet ? 'quiet' : 'gold' });
    cx += widths[i] + 18;
  });

  // ---------------------------------------------------------------- 3. the book cover (behind both pages)
  const coverA = K.io(t, T.book + 0.6, 0.7);
  if (coverA > 0) {
    K.layer(coverA, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 60; g.shadowOffsetY = 22;
      K.rr(200, 284 + DY, 1520, 470, 20); g.fillStyle = '#3E3029'; g.fill(); g.restore();
      K.rr(200, 284 + DY, 1520, 470, 20); g.strokeStyle = K.rgba(C.gold, 0.45); g.lineWidth = 2; g.stroke();
      K.line(960, 300 + DY, 960, 740 + DY, { color: 'rgba(0,0,0,.35)', w: 6 });      // spine
      K.eyebrow('by label', LX + 4, 318 + DY, { size: 24, alpha: K.io(t, T.byLabel, 0.5) });
      K.eyebrow('by app', RX + 4, 318 + DY, { size: 24, alpha: K.io(t, T.byApp, 0.5) });
    });
  }

  // ---------------------------------------------------------------- shared state: one ledger, two views
  const BROWSER = 'Firefox';
  const writeAt = (i) => T.proof + 2.4 + i * 1.2;                     // 2021: the pen, row by row
  const WRITE_D = 1.0;
  const press1 = T.setDef + 0.85, press2 = T.rew;
  const groupK = K.io(t, press1 + 0.15, 1.0);                          // 2022: four rows at once
  const euK = K.io(t, press2 + 0.15, 1.0);                             // 2025: .pdf + the new rows at once
  const turn1 = K.io(t, T.proof + 0.2, 0.75), turn2 = K.io(t, T.one + 0.25, 0.75);
  const r21 = (i) => K.io(t, writeAt(i), WRITE_D, 'lin');
  // how far right-page row i (.htm .html .pdf http https) has been rewritten to Firefox; the 2021 pass rewinds as the
  // 2022 page turns, so the left page rewinds with it
  // The 2022 page is a FRESH START (new PC): the left page cross-fades back to Edge with the page turn (no un-writing),
  // and a "new PC" pill says so before Set default is pressed.
  const resetK = K.io(t, T.one + 0.25, 0.75);
  const flipK = (i, old) => Math.max(old ? r21(i) : 0, i === 2 ? euK : groupK);
  // one-shot pulse when row i flips (0..1, sin-shaped by the drawer)
  const pulseK = (i) => {
    const ev = [K.io(t, writeAt(i) + WRITE_D - 0.35, 0.9), K.io(t, (i === 2 ? press2 : press1) + 0.75, 0.9)];
    for (const v of ev) if (v > 0 && v < 1) return v;
    return 0;
  };
  const PAIR = { 3: 1, 4: 2 };                                         // left row -> right row (.html, .pdf)

  // ---------------------------------------------------------------- 4. left page = the ledger itself
  // finger walks the rows one at a time, then rests on .pdf
  const fSteps = [0, 1, 2, 3, 4].map((i) => K.io(t, T.byLabel + 0.55 + i * 0.6, 0.45));
  const finger = fSteps[1] + fSteps[2] + fSteps[3] + fSteps[4];
  const fingerK = K.io(t, T.byLabel, 0.4) * (1 - K.io(t, T.proof, 0.5));
  const linkK = K.io(t, T.who + 0.2, 0.6) * (1 - K.io(t, T.proof, 0.5));
  const dfK = K.io(t, T.dflt, 0.6) * (1 - K.io(t, T.byLabel, 0.4));
  const leftRowsAt = (old) => M.ROWS.map((r, i) => ({
    ...r,
    ...(PAIR[i] != null ? { door: 'Edge', to: BROWSER, toK: flipK(PAIR[i], old), pulse: pulseK(PAIR[i]) } : {}),
    hi: i === 1 ? dfK : (i === 3 ? linkK : (i === 4 ? Math.max(linkK, K.io(t, T.byLabel + 3.0, 0.4) * (1 - K.io(t, T.proof, 0.5))) : 0)),
  }));
  const leftRows = leftRowsAt(resetK <= 0);
  if (oneA > 0) {
    const ox = K.lerp(1120, LX, mk), oy = K.lerp(230, PY + (rowYL(1) - rowYL(0)) * SC, mk), os = K.lerp(1, SC, mk);
    K.at(ox, oy, os, 0, () => M.ledger(0, 0, PW, { rows: [{ ...M.ROWS[1], hi: 1 - mk }], size: 30, alpha: oneA }));
  }
  K.at(LX, PY, SC, 0, () => {
    M.ledger(0, 0, PW, { rows: leftRows, size: 30, finger: fingerK > 0 ? finger : null, fingerK, alpha: fullA });
    // fresh start: the hand-written 2021 rows fade off the reset page (same paper, so only the ink cross-fades)
    if (resetK > 0 && resetK < 1) M.ledger(0, 0, PW, { rows: leftRowsAt(true), size: 30, alpha: fullA * (1 - resetK) });
    // "default app = the door on a row": a gold ring round one row's door cell
    if (dfK > 0) {
      const w = K.measure('V S Code', ROWF), dx = 28 + 30 * 4.4 + 30 * 1.5;
      K.layer(dfK, () => K.ring(dx + w / 2, rowYL(1) - 1, w / 2 + 26, 27, K.io(t, T.dflt, 0.7), { color: C.gold, w: 4, rot: 0 }));
    }
  });
  if (dfK > 0) M.label('default app  =  the door on a row', 960, 860, { alpha: dfK, size: 30 });

  // ---------------------------------------------------------------- 5. right page = one app, every label
  // arrows sit at a fixed x per column with >= 16 px clear after the longest label (.shtml / .xhtml, 6 mono chars)
  const COLS = [{ x: 0, label: 28, arrow: 140, door: 180 }, { x: 290, label: 14, arrow: 148, door: 184 }];
  const LINKS = { http: 1, https: 1 };     // web links, not file labels: drawn lighter
  const A_LABELS = ['.htm', '.html', '.pdf', 'http', 'https'];
  const B_LABELS = ['ftp', '.svg', '.shtml', '.xhtml', '.xml'];
  const euRowsK = (i) => K.stagger(t, T.eu + 0.35, i, 0.14, 0.5);

  function paper() {
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 70; g.shadowOffsetY = 26;
    K.rr(0, 0, PW, PH, 14); g.fillStyle = P.paper; g.fill(); g.restore();
    K.rr(6, PH - 4, PW - 12, 10, 6); g.fillStyle = P.paperShade; g.fill();
    K.line(18, 10, 18, PH - 10, { color: K.rgba(C.accent, 0.35), w: 1.5 });
  }
  function header(k) {
    if (k <= 0) return;
    const title = BROWSER;
    const shown = title.slice(0, Math.ceil(title.length * k));
    const tw = K.text(shown, 28, 44, { font: 'mono', weight: 700, size: 30, color: P.ink });
    K.icon('globe', 28 + K.measure(title, { font: 'mono', weight: 700, size: 30 }) + 28, 33, 32, { color: P.ink, w: 2.4, alpha: K.clamp(k * 2 - 1) });
    K.line(14, 62, PW - 14, 62, { color: P.paperLine, w: 2 });
    return tw;
  }
  function row(col, i, r) {
    const c = COLS[col], ry = rowYL(i), base = ry + 30 * 0.34;
    const lk = r.lk == null ? 1 : r.lk, dk = r.dk == null ? 1 : r.dk;
    if (lk <= 0) return;
    if (r.hi > 0) { K.rr(c.x + 8, ry - 21, 282, 42, 10); g.fillStyle = K.rgba(C.head, 0.32 * r.hi); g.fill(); }
    if (r.pulse > 0) { K.rr(c.x + 8, ry - 21, 282, 42, 10); g.strokeStyle = K.rgba(C.gold, Math.sin(r.pulse * Math.PI)); g.lineWidth = 3; g.stroke(); }
    const dx = (1 - lk) * -16;
    K.text(r.label, c.x + c.label + dx, base, { font: 'mono', weight: LINKS[r.label] ? 400 : 700, size: 30, color: LINKS[r.label] ? P.inkSoft : P.ink, alpha: lk });
    if (dk <= 0) return;
    K.text('→', c.x + c.arrow, base, { font: 'mono', weight: 400, size: 30, color: P.inkSoft, alpha: dk });
    const tk = r.to ? K.clamp(r.toK || 0) : 0, x = c.x + c.door;
    const fade = tk > 0.5 ? 1 - (tk - 0.5) * 2 : 1;
    if (tk < 1) {
      K.text(r.door, x, base, { ...ROWF, color: P.ink, alpha: dk * fade });
      if (tk > 0) K.line(x - 4, ry, x + K.measure(r.door, ROWF) + 4, ry, { k: K.clamp(tk * 2), color: P.changed, w: 3.5, alpha: dk * fade });
    }
    if (r.to && tk > 0.5) {
      const n = Math.ceil(r.to.length * K.clamp((tk - 0.5) * 2));
      K.text(r.to.slice(0, n), x, base, { ...ROWF, color: INK2, alpha: dk });
    }
    if (i < 4) K.line(c.x + 16, ry + 25, (col === 0 && r.full ? PW - 16 : c.x + 282), ry + 25, { color: K.rgba(P.paperLine, 0.7), w: 1, alpha: lk });
  }
  // page "now": what Settings shows when you pick a browser today
  function pageNow() {
    paper();
    // before "by app": a faint invitation, so the page is never blank
    const phK = 1 - K.io(t, T.pick - 0.35, 0.4);
    if (phK > 0) K.layer(phK, () => {
      K.text('pick an app…', PW / 2, 118, { font: 'ui', weight: 600, size: 30, color: P.inkSoft, align: 'center', alpha: 0.8 });
      ['globe', 'code', 'file', 'chat'].forEach((n, i) => {
        const x = PW / 2 + (i - 1.5) * 96;
        K.rr(x - 34, 172, 68, 68, 14); g.strokeStyle = K.rgba(P.paperLine, 0.9); g.lineWidth = 2; g.stroke();
        K.icon(n, x, 206, 40, { color: P.inkSoft, w: 2.2, alpha: 0.55 });
      });
    });
    header(K.io(t, T.pick, 0.6));
    A_LABELS.forEach((lab, i) => row(0, i, {
      label: lab, door: 'Edge', full: true,
      lk: K.stagger(t, T.every, i, 0.12, 0.45), dk: K.stagger(t, T.who, i, 0.12, 0.45),
      hi: (i === 1 || i === 2) ? linkK : 0,
    }));
    // http / https are web links, not labels after a dot: say so the first time they appear
    const wk = K.io(t, T.every + 0.75, 0.5);
    if (wk > 0) K.layer(wk, () => {
      const bx = 262, y0 = rowYL(3) - 18, y1 = rowYL(4) + 18;
      K.line(bx, y0, bx + 10, y0, { color: C.accent, w: 2.5 }); K.line(bx + 10, y0, bx + 10, y1, { color: C.accent, w: 2.5 });
      K.line(bx, y1, bx + 10, y1, { color: C.accent, w: 2.5 });
      K.rr(292, y0 - 2, 290, y1 - y0 + 4, 12); g.fillStyle = P.paperShade; g.fill();
      const ym = (rowYL(3) + rowYL(4)) / 2;
      K.text('web links,', 437, ym - 6, { font: 'ui', weight: 700, size: 24, color: INK2, align: 'center' });
      K.text('not file labels', 437, ym + 24, { font: 'ui', weight: 700, size: 24, color: INK2, align: 'center' });
    });
  }
  // page 2021: every label rewritten by hand, with a counter
  function page2021() {
    paper(); header(1);
    A_LABELS.forEach((lab, i) => row(0, i, { label: lab, door: 'Edge', to: BROWSER, toK: r21(i), pulse: pulseK(i), full: false }));
    const ck = K.io(t, T.proof + 1.4, 0.5) * (1 - K.io(t, T.one, 0.4));
    if (ck > 0) {
      K.text('one at a time', 445, 158, { font: 'ui', weight: 600, size: 26, color: P.inkSoft, align: 'center', alpha: ck });
      for (let i = 0; i < 5; i++) {
        const done = K.io(t, writeAt(i) + WRITE_D - 0.1, 0.25);
        const x = 445 + (i - 2) * 46;
        K.text(String(i + 1), x, 222, { font: 'mono', weight: 700, size: 36, color: K.mixColor(P.paperLine, INK2, done), align: 'center', alpha: ck });
        if (i < 4) K.text('·', x + 23, 220, { font: 'mono', weight: 700, size: 30, color: P.paperLine, align: 'center', alpha: ck });
      }
    }
  }
  // page 2022 (+ Europe 2025): one button
  function page2022() {
    paper(); header(1);
    const bLive = K.io(t, T.eu + 0.2, 0.4);
    A_LABELS.forEach((lab, i) => row(0, i, {
      label: lab, door: 'Edge', to: BROWSER, full: bLive <= 0,
      toK: i === 2 ? euK : groupK, pulse: t > T.one ? pulseK(i) : 0,
    }));
    if (bLive > 0) {
      K.line(290, 70, 290, PH - 14, { color: K.rgba(P.paperLine, 0.8), w: 1.5, alpha: bLive });
      B_LABELS.forEach((lab, i) => row(1, i, { label: lab, door: 'Edge', to: BROWSER, toK: euK, lk: euRowsK(i), dk: euRowsK(i) }));
    }
    // the Set default button: one press, many rows
    const pk = K.io(t, T.setDef, 0.5);
    if (pk > 0) {
      const pr = Math.max(K.env(t, press1, press1 + 0.35, 0.15), K.env(t, press2, press2 + 0.35, 0.15));
      const lit = Math.max(K.io(t, press1, 0.2) * (1 - K.io(t, press1 + 1.4, 0.6)), K.io(t, press2, 0.2) * (1 - K.io(t, press2 + 1.4, 0.6)));
      K.at(470, 33, 1 - 0.06 * pr, 0, () => {
        K.pill('Set default', 0, 0, { size: 24, color: C.head, fill: C.tile, stroke: K.rgba(C.gold, 0.5 + 0.5 * lit), glow: lit, alpha: pk });
      });
    }
  }

  const openK = K.io(t, T.book + 0.8, 0.8);                            // the right page opens from the spine
  const pages = [pageNow, page2021, page2022];
  const cur = turn2 > 0 ? 2 : turn1 > 0 ? 1 : 0;
  const turning = cur === 2 ? turn2 : cur === 1 ? turn1 : 1;
  if (openK > 0) {
    K.at(RX, PY, SC, 0, () => {
      g.save(); g.scale(openK, 1); pages[cur](); g.restore();
      if (turning < 1) {
        // the old page lifts away toward the spine like a turning leaf
        const sx = Math.max(0.001, 1 - turning);
        g.save(); g.scale(sx, 1); pages[cur - 1]();
        K.rr(0, 0, PW, PH, 14); g.fillStyle = `rgba(30,24,20,${0.35 * turning})`; g.fill();
        g.restore();
      }
    });
  }

  // ---------------------------------------------------------------- 6. links between the two views (same rows)
  [[3, 1], [4, 2]].forEach(([li, ri]) => {
    const fl = Math.sin(pulseK(ri) * Math.PI) * openK;
    const a2 = Math.max(linkK, fl);
    if (a2 <= 0) return;
    const a = scr(LX, 588, rowYL(li)), b = scr(RX, 14, rowYL(ri));
    K.path([[a.x, a.y], [960, (a.y + b.y) / 2], [b.x, b.y]], { k: Math.max(linkK, fl > 0 ? 1 : 0), color: C.gold, w: 3, head: false, alpha: a2 });
    K.glow(a.x, a.y, 14, C.gold, 0.6 * a2); K.glow(b.x, b.y, 14, C.gold, 0.6 * a2);
  });

  // ---------------------------------------------------------------- 7. the pen (2021 only)
  const penIn = K.io(t, T.proof + 1.6, 0.6), penOut = K.io(t, T.one, 0.5);
  if (penIn > 0 && penOut < 1) {
    const rest = scr(RX, 470, 300);
    const bw = K.measure(BROWSER, ROWF);
    let px = rest.x, py = rest.y, wr = 0;
    for (let i = 0; i < 5; i++) {
      const a = writeAt(i), mv = K.io(t, a - 0.45, 0.4);
      if (t >= a - 0.45) {
        const p = scr(RX, COLS[0].door, rowYL(i) + 4);
        const prev = i === 0 ? rest : scr(RX, COLS[0].door + bw, rowYL(i - 1) + 4);
        const prog = K.clamp((t - a) / WRITE_D);
        px = K.lerp(prev.x, p.x, mv) + (t >= a ? prog * bw * SC : 0);
        py = K.lerp(prev.y, p.y, mv);
        wr = K.env(t, a, a + WRITE_D, 0.12);
      }
    }
    const back = K.io(t, writeAt(4) + WRITE_D + 0.1, 0.6);
    const last = scr(RX, COLS[0].door + bw, rowYL(4) + 4);
    if (back > 0) { px = K.lerp(last.x, rest.x, back); py = K.lerp(last.y, rest.y, back); }
    M.pen(px, py, 160, { t, writing: wr, alpha: penIn * (1 - penOut) });
  }

  // ---------------------------------------------------------------- 7b. fresh start before the 2022 press
  const freshK = K.io(t, T.one, 0.5) * (1 - K.io(t, press1 + 0.9, 0.5));
  if (freshK > 0) M.label('new PC, fresh start:  every row back to Edge', 960, 860, { alpha: freshK, size: 30 });

  // ---------------------------------------------------------------- 8. closing line
  const sk = K.io(t, T.same, 0.6);
  if (sk > 0) M.label('same ledger, a bigger pen', 960, 860, { alpha: sk, color: C.head, size: 30 });
});
