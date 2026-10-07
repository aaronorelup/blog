/* 07 — Open with: just once, or always
   Room (desk close-up): a slip "→ Notepad" is handed to the porter (Open with). "Just once": the string goes to the
   Notepad door, the .py row pulses untouched. "Always": the pen rewrites .py → Notepad and two more .py strings follow.
   Then the Mac: a file-info card whose choice pins a note to ONE file, unless "Change All". Close: Mac per file ·
   Windows per label (the same ledger row the pen just rewrote, .py → Notepad, the pen resting beside it). */
SCENE('07', (t, S) => {
  K.bg();
  const L = M.layout, C = K.C;

  // ---- beats (local seconds)
  const cNote = S.cue('note', 0);
  const cOnce = S.cue('once', 5.0);
  const cAlways = S.cue('always', 11.9);
  const cMac = S.cue('mac-change-all', 18.75);
  const cPer = S.cue('per-file', 26.5);
  const wOneTime = S.find('one-time', 0, cOnce + 2.2);
  const wOpens = S.find('opens', 0, cOnce + 3.2);
  const wAlone = S.find('alone', 0, cOnce + 5.6);
  const wPen = S.find('pen', 0, cAlways + 1.6);
  const wRewrites = S.find('rewrites', 0, cAlways + 2.1);
  const wEvery = S.find('every', 0, cAlways + 3.6);
  const wDifferent = S.find('different', 0, cMac + 1.3);
  const wOnly = S.find('only', 0, cMac + 4.2);
  const wChange = S.find('Change', 1, cMac + 6.7);
  const wWindows = S.find('Windows', 0, cPer + 2.6);

  // ---- room phase (0 .. Mac)
  const roomA = 1 - K.io(t, cMac - 0.45, 0.5);
  // whole room in frame (all four doors end by x 1735); a small pan lifts the ledger's foot to y ~889
  const cam = K.cam(t, [{ at: 0, x: 960, y: 540, z: 1 }, { at: cNote + 0.3, x: 960, y: 575, z: 1, d: 1.0 }]);
  const hand = { x: 880, y: 470 };                         // the string waiting at the porter's side
  const jamb = L.doors[0] - L.doorW / 2;                   // Notepad's left jamb: the threshold
  // a straight walk in at bead height; it is clipped at the jamb, so the string passes INTO the door, never over its art
  const pts = [[hand.x, hand.y], [1120, hand.y + 6], [1380, hand.y]];

  // carries: hello.py (just once), then app.py + test.py (always)
  const carries = [
    { name: 'hello.py', in: cNote + 0.8, go: wOpens },
    { name: 'app.py', in: wEvery - 0.5, go: wEvery },
    { name: 'test.py', in: wEvery + 0.4, go: wEvery + 0.9 },
  ];
  const arrive = (c) => c.go + M.motion.carry;
  // what the Notepad door holds now (one string at a time)
  let holdName = null, holding = 0;
  carries.forEach((c, i) => {
    const next = carries[i + 1];
    const k = K.io(t, arrive(c) - 0.25, 0.45) * (next ? 1 - K.io(t, arrive(next) - 0.45, 0.25) : 1)
      * (i === 0 ? 1 - K.io(t, wEvery - 0.6, 0.4) : 1);
    if (k > 0) { holdName = c.name; holding = k; }
  });
  const focusNP = K.io(t, wOpens + 0.3, 0.6);

  const pickOnce = K.io(t, wOneTime, 0.5) * (1 - K.io(t, cAlways, 0.5));
  const pickAlways = K.io(t, cAlways, 0.5);
  const toK = K.io(t, wRewrites - 0.35, 1.4, 'sine');
  const pulse = K.seg(t, wAlone - 0.1, wAlone + 0.9);
  const look = 0.6 * (K.io(t, wOpens - 0.2, 0.5) - K.io(t, arrive(carries[0]), 0.5))
    - 0.6 * (K.io(t, wPen - 0.3, 0.5) - K.io(t, wRewrites + 1.1, 0.5))
    + 0.6 * (K.io(t, wEvery - 0.2, 0.5) - K.io(t, arrive(carries[2]), 0.5));

  if (roomA > 0) K.layer(roomA, () => K.withCam(cam, () => {
    const R = M.room({
      t,
      porter: { look },
      doors: { each: (i, n) => (n === 'Notepad' ? { focus: focusNP, holding, holdName, t } : {}) },
      lift: K.io(t, cNote + 0.2, 0.9),   // 06 leaves the ledger closed on the desk; lift it as the camera pushes in
      ledger: {
        finger: 1, fingerK: 1,
        rows: M.ROWS.map((r, i) => (i === 1 ? { ...r, to: 'Notepad', toK, pulse } : r)),
      },
    });
    const led = R.ledger;

    // Open with: the label and the slip handed to the porter
    const noteK = K.io(t, cNote + 0.1, 0.8);
    M.label('Open with', 235, 262, { alpha: K.io(t, cNote, 0.5) });
    M.slip('→ Notepad', K.lerp(-260, 235, noteK), 342, { alpha: K.clamp(noteK * 3), rot: K.lerp(-0.25, -0.05, noteK) });

    // the two kinds of answer
    const pk = (i) => K.stagger(t, cOnce + 0.2, i, 0.25, 0.5);
    const choice = (s, x, k, lit) => {
      if (k <= 0) return;
      K.pill(s, x, 300, { size: 28, alpha: k,
        color: lit > 0.5 ? C.head : C.strong, stroke: lit > 0 ? K.rgba(C.gold, 0.4 + 0.6 * lit) : C.line2, glow: lit });
    };
    const anyLit = Math.max(pickOnce, pickAlways);
    const dimOther = (lit) => (anyLit > 0 ? (lit > 0.01 ? 1 : 1 - 0.45 * anyLit) : 1);
    choice('Just once', 648, pk(0) * dimOther(pickOnce), pickOnce);
    choice('Always', 832, pk(1) * dimOther(pickAlways), pickAlways);

    // the pen: rests beside the ledger, picks up on "pen", writes the row, rests again
    const rest = { x: 868, y: led.rowY(3) + 10, rot: -0.95 };   // low beside the page, clear of the carry path
    const penIn = K.io(t, wPen - 0.9, 0.5);
    const toRow = K.io(t, wPen - 0.25, 0.55) * (1 - K.io(t, wRewrites + 1.25, 0.6));
    const wpx = led.doorX + 128 * toK, wpy = led.rowY(1) + 4;
    const writing = K.env(t, wRewrites - 0.35, wRewrites + 1.05, 0.2);
    if (penIn > 0) M.pen(K.lerp(rest.x, wpx, toRow), K.lerp(rest.y, wpy, toRow), 150,
      { alpha: penIn, rot: K.lerp(rest.rot, -0.75, toRow), writing, t });

    // the waiting strings and their carries
    carries.forEach((c) => {
      const ink = K.io(t, c.in, 0.5);
      if (ink <= 0) return;
      const ck = K.io(t, c.go, M.motion.carry);
      const hk = K.io(t, arrive(c) - 0.25, 0.4);
      if (hk >= 1) return;
      const p = M.along(pts, ck);
      const g = K.ctx(); g.save(); g.beginPath(); g.rect(0, 0, jamb, 1080); g.clip();
      M.drawString(p.x, p.y, 0.3, { n: 8, preset: 'py', tag: c.name, t, alpha: ink * (1 - hk) });
      g.restore();
    });

  }));

  // ---- Mac phase + the per-file / per-label close (screen space)
  const macA = K.io(t, cMac - 0.05, 0.6);
  if (macA > 0) K.layer(macA, () => {
    const dx = K.lerp(440, 0, K.io(t, cPer, 0.8));
    // the Finder-style info card (generic, not a dialog mock)
    const cardDim = 1 - 0.35 * K.io(t, cPer + 0.2, 0.6);
    K.layer(cardDim, () => {
      K.card(170 + dx, 200, 700, 320, { r: 22, fill: C.tile, stroke: C.line2 });
      K.eyebrow('Mac · file info', 210 + dx, 250, { size: 22 });
      K.text('hello.py', 210 + dx, 312, { font: 'mono', weight: 600, size: 34, color: C.strong });
      K.line(200 + dx, 340, 840 + dx, 340, { color: C.line2, w: 1.5 });
      K.text('Open with', 210 + dx, 411, { font: 'ui', weight: 600, size: 30, color: C.body });
      const sw = K.io(t, wDifferent, 0.5);
      M.chip('V S Code', 600 + dx, 400, { alpha: 1 - sw, color: C.strong });
      M.chip('TextEdit', 600 + dx, 400, { alpha: sw });
      const ca = K.io(t, wChange, 0.5) * (1 - 0.6 * K.io(t, cPer + 0.2, 0.6));
      K.pill('Change All', 710 + dx, 468, { size: 28, color: ca > 0.5 ? C.head : C.strong, stroke: ca > 0 ? K.rgba(C.gold, 0.4 + 0.6 * ca) : C.line2, glow: ca });
    });

    // the files: hello.py gets its own note pinned on; Change All briefly pins the same note on app.py and test.py
    const allK = K.io(t, wChange - 0.15, 0.5) * (1 - K.io(t, cPer + 0.2, 0.6));
    const rowsMac = [{ n: 'hello.py', y: 610, a: 1 }, { n: 'app.py', y: 700, a: allK }, { n: 'test.py', y: 790, a: allK }];
    const bx = 500 + dx, slx = 770 + dx;
    rowsMac.forEach((r, i) => {
      if (r.a <= 0) return;
      K.layer(r.a, () => {
        M.drawString(bx, r.y, 0.3, { n: 8, preset: 'py', tag: r.n, t: t + 1.3 + i * 0.6 });
        if (i > 0) {
          K.line(bx + 106, r.y, slx - 112, r.y, { color: M.palette.cord, w: 3 });
          M.slip('→ TextEdit', slx, r.y, { s: 0.9, rot: -0.04 });
        }
      });
    });
    const fly = K.io(t, wOnly - 0.4, 1.0);
    if (fly > 0) {
      const p0 = { x: 600 + dx, y: 400 }, p1 = { x: slx, y: 610 };
      const p = M.along([[p0.x, p0.y], [K.lerp(p0.x, p1.x, 0.5) + 90, (p0.y + p1.y) / 2 - 30], [p1.x, p1.y]], fly);
      if (fly >= 1) K.line(bx + 106, 610, slx - 112, 610, { color: M.palette.cord, w: 3 });
      M.slip('→ TextEdit', p.x, p.y, { s: 0.9, rot: K.lerp(0.1, -0.04, fly), alpha: K.clamp(fly * 4) });
    }

    // close: Mac per file · Windows per label
    M.label('Mac: per file', 520 + dx, 862, { alpha: K.io(t, cPer + 0.5, 0.5), color: C.head, stroke: K.rgba(C.gold, 0.6) });
    const wk = K.io(t, wWindows - 0.5, 0.7);
    if (wk > 0) K.layer(wk, () => {
      const led = M.ledger(1120, 230, 600, { rows: [{ label: '.py', door: 'V S Code', to: 'Notepad', toK: 1, hi: K.io(t, wWindows + 0.4, 0.6) }] });
      M.pen(1762, 352, 150, { rot: -1.25 });
      const names = ['hello.py', 'app.py', 'test.py'];
      names.forEach((n, i) => M.drawString(1600, 470 + i * 88, 0.26, { n: 6, preset: 'py', tag: { name: n, mark: K.io(t, wWindows + 0.4 + i * 0.12, 0.5) }, t: t + i * 0.7 }));
      // one bracket: every .py file -> the same row
      const bx = 1292, by0 = 440, by1 = 680;
      K.line(bx, by0, bx, by1, { color: K.rgba(C.gold, 0.8), w: 3 });
      K.line(bx, by0, bx + 14, by0, { color: K.rgba(C.gold, 0.8), w: 3 });
      K.line(bx, by1, bx + 14, by1, { color: K.rgba(C.gold, 0.8), w: 3 });
      K.arrow(bx, by0 - 6, led.labelX + 20, led.y + led.h + 12, { k: K.io(t, wWindows + 0.2, 0.6), color: C.gold, w: 3, bend: -0.25 });
      M.label('Windows: per label', 1420, 862, { color: C.head, stroke: K.rgba(C.gold, 0.6) });
    });
  });
});
