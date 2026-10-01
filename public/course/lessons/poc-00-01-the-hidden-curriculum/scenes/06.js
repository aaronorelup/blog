/* 00.01 · 06 — A map, not a manual
   The 05 map (four shelved rows, pin on the gate) folds into the pocket map tile, and its shelved rows
   drop onto the tile as gold pins. A manual rises opposite it and is turned down (dimmed, a terracotta
   slash), and leaves before "Every lesson"; then the five-questions card slides out of the map tile. "Do the thing" arrives as a dashed ghost pill (not yet) that turns into the gold "recognise it"
   as the tile lights. At [[messy]] the tile unfolds back into the full map, where
   Git and keys cross district borders (the place the tidy map breaks). At "Memorising" the map folds
   into the corner (07 starts from there) while a terminal rises: the AI (lantern) types `cd projects`
   then `python script.py` (it goes to the folder first, unlike 07's failure), and the viewer's job is
   shown as a gloss on each line: go to the folder, run this file. */
SCENE('06', (t, S) => {
  const g = K.ctx(), C = K.C;
  const SHELVED = M.TAGS.map((x) => x.mod);                 // '01', '02', '05', '09'
  const DIM = 0.55;

  // the map runs on 05's clock, so the gate pin's bob and the lantern sway carry across the crossfade
  const s05 = ((window.__timeline || {}).sections || []).find((s) => s.n === '05');
  const mt = t + (s05 ? S.start - s05.start : 0);

  // ---------------------------------------------------------------- beats (local seconds)
  const tMap = S.find('map', 0, 1.6), tManual = S.cue('manual', 2.58), tFive = S.cue('five', 5.5);
  const tQ = [S.find('what', 0, 6.95), S.find('live', 0, 8.38), S.find('like', 0, 9.79), S.find('connect', 0, 11.18), S.find('surprise', 0, 13.03)];
  const tWont = S.find("won't", 0, 14.59), tDo = S.find(/^do$/i, 0, 15.99);   // exact "do": a prefix 'do' would hit "does"
  const tRec = S.cue('recognise', 17.75), tMessy = S.cue('messy', 21.08);
  const tGit = S.find('Git', 0, 23.41), tTalks = S.find('talks', 0, 25.73), tNet = S.find('Network', 0, 26.74);
  const tKeys = S.find('Keys', 0, 27.78), tTurn = S.find('turn', 0, 29.93), tEvery = S.find('everywhere', 0, 30.4);
  const tMem = S.find('Memoris', 0, 31.51), tSkip = S.cue('skip', 33.76), tAI = S.find('AI', 0, 35.56);
  const tType = S.find('type', 0, 36.13), tJob = S.find('job', 0, 37.65), tKnow = S.find('knowing', 0, 38.23);

  // ---------------------------------------------------------------- layout
  // the promise half sits 60 px below M.layout.tile.s06 so the tile, its labels and the question card centre on the safe area
  const PY = 60;
  const [TX, TY0, TS] = M.layout.tile.s06, TY = TY0 + PY;   // 1440, 460, 240: the promise tile
  const [CX, CY, CS] = M.layout.tile.corner;                 // 1700, 220, 130: 06 exit / 07 start
  const BOOK = { x: 480, y: TY, s: 240 };                    // the manual, mirrored across the frame
  const CARD = { x: 150, y: 214 + PY, w: 660, h: 452 };      // the five questions, centred on the book's axis
  // the last beat reads left to right: your AI (the lantern) types -> the terminal -> what each line means (your job)
  const WIN = { x: 380, y: 430, w: 880, h: 240 };            // the terminal: big enough to read from the back row
  const FS = 34, MONO = { font: 'mono', size: FS };          // its type size
  const LAMP = { x: 255, y: 555, s: 110 };                   // your AI, beside the terminal
  const GLOSS = { x: 1320, size: 30 };                       // the meanings, one per line, right of the window
  // the AI goes to the folder first, then runs the file: the opposite of 07's wrong-folder failure
  const LINES = [
    { cmd: 'cd projects', prompt: 'C:\\Users\\you>', gloss: 'go to the folder' },
    { cmd: 'python script.py', prompt: 'C:\\Users\\you\\projects>', gloss: 'run this file' },
  ];
  const CPS = 34;                                            // an AI types fast: both lines are in by "them."
  // the shrinking map is composited from its own buffer, so a fading map never lets map.js's
  // regular-weight row text ghost through the re-inked shelved rows (scratch only: cleared every frame)
  const buf = window.__s06MapBuf || (window.__s06MapBuf = document.createElement('canvas'));
  if (buf.width !== K.W || buf.height !== K.H) { buf.width = K.W; buf.height = K.H; }

  // ---------------------------------------------------------------- the full map (05's exit state) + overlays
  // focus: History from "Git" until it reaches The Network; Trust from "Keys" until "everywhere"
  function focusState() {
    if (t < tKeys) { const k = K.io(t, tGit, 0.5) * (1 - K.io(t, tNet + 0.1, 0.6)); return { focus: k > 0.001 ? 'history' : null, k }; }
    const k = K.io(t, tKeys, 0.5) * (1 - K.io(t, tEvery + 0.25, 0.6)); return { focus: k > 0.001 ? 'trust' : null, k };
  }
  function crossings(f) {
    const out = 1 - K.io(t, tMem - 0.2, 0.4);                // cleared just before the map folds away
    if (out <= 0 || t < tGit) return;
    // these coordinates were laid out on map.js's first geometry (district rows at y 290 / 630);
    // the map moved up 32 px into the safe area, so the overlay follows it instead of hard-coding it
    const dy = K.map.district('history').y - 290;
    K.layer(out, () => {
      K.ctx().translate(0, dy);
      // Git lives in The History, but talks across The Network
      const ga = M.litAlpha('history', f.focus, f.k, DIM), gk = K.io(t, tGit, 0.5, 'out');
      if (gk > 0) K.layer(gk * ga, () => K.pill('git', 1596, 350 + (1 - gk) * 16, { size: 28, color: C.head }));
      K.arrow(1596, 388, 1596, 716, { k: K.io(t, tTalks, 0.8), bend: -46, color: C.head, w: 3, alpha: ga });
      // keys belong to Trust, and turn up everywhere: three dashed arrows cross its borders
      const ka = M.litAlpha('trust', f.focus, f.k, DIM), kk = K.io(t, tKeys, 0.5, 'out');
      if (kk > 0) K.layer(kk * ka, () => K.pill('keys', 1098, 688 + (1 - kk) * 16, { size: 28, color: C.head }));
      // on "everywhere" the arrows themselves glow (a soft halo on the strokes, no flash)
      const glowK = K.io(t, tEvery, 0.2, 'sine') * (1 - K.io(t, tEvery + 0.4, 0.5, 'sine'));
      [[1000, 652, 1000, 562], [1132, 822, 1226, 822], [778, 822, 686, 822]].forEach(([x1, y1, x2, y2], i) => {
        const k = K.io(t, tTurn + 0.15 * i, 0.5);
        if (k <= 0) return;
        const cg = K.ctx(); cg.save();
        if (glowK > 0) { cg.shadowColor = K.rgba(C.head, 0.95 * glowK); cg.shadowBlur = 22 * glowK; }
        K.arrow(x1, y1, x2, y2, { k, color: C.head, w: 3, dash: [7, 8], headSize: 15 });
        cg.restore();
      });
    });
  }
  // a shelved row at full strength, then dimmed with its district by a page-coloured veil (same maths
  // as map.js's layer alpha over the opaque footprint, but the underlay stays opaque, so no ghosting)
  function shelvedRow(m, a) {
    M.shelveRow(m, 1);
    if (a >= 0.999) return;
    const c = K.map.chipPos(m), cg = K.ctx();
    K.rr(c.x - 18, c.y - 19, c.w + 36, 38, 19); cg.fillStyle = K.rgba(C.page, 1 - a); cg.fill();
  }
  function fullMap() {
    const f = focusState();
    K.glow(K.map.GATE.x, K.map.GATE.y, 110, C.head, 0.25);    // 05's warm glow on the Start gate (this lesson sits there)
    K.map.draw(mt, { pin: '00', focus: f.focus, focusK: f.k, dim: DIM });
    SHELVED.forEach((m) => shelvedRow(m, M.litAlpha(K.map.districtOf(m).id, f.focus, f.k, DIM)));
    crossings(f);
  }
  /** M.foldMap's move, with 05's shelved rows (and the crossing arrows) riding on the shrinking map */
  function fold(k, x, y, s, tileFn) {
    const mk = K.clamp(k), z = K.lerp(1, s / 1333, mk);
    const cx = K.lerp(960, x, mk), cy = K.lerp(540, y, mk);
    // no map text ever shows through the tile's paper (a half-faded tile over the shrinking map read as
    // mud): the map dissolves over mk 0.2-0.7 (scale 0.84 -> 0.43), the tile over mk 0.3-0.8, and the
    // tile's footprint is cut out of the map buffer as soon as the tile starts to show (fully by tile 0.12),
    // so the tile reads as the one object the map folded into. The unfold runs the same curves backwards.
    const mapA = 1 - K.ease.sine(K.seg(mk, 0.2, 0.7)), tileK = K.ease.sine(K.seg(mk, 0.3, 0.8));
    const sc = K.lerp(1.3, 1, K.ease.out(tileK)), cover = K.clamp(tileK * 8);
    if (mk <= 0) fullMap();
    else if (mapA > 0.002) {
      const bc = buf.getContext('2d');
      bc.setTransform(1, 0, 0, 1, 0, 0); bc.globalAlpha = 1; bc.clearRect(0, 0, K.W, K.H);
      K.use(bc);
      try { fullMap(); } finally { K.use(g); }
      if (cover > 0) {                                       // the tile's rounded square, in map-buffer space
        const h = (s * sc / 2 + 4) / z;
        bc.save(); bc.setTransform(1, 0, 0, 1, 0, 0); bc.globalCompositeOperation = 'destination-out'; bc.globalAlpha = cover;
        bc.beginPath(); bc.roundRect(960 + (x - cx) / z - h, 540 + (y - cy) / z - h, 2 * h, 2 * h, h * 0.48); bc.fill();
        bc.restore();
      }
      K.layer(mapA, () => K.at(cx, cy, z, 0, () => g.drawImage(buf, -960, -540)));
    }
    if (tileK > 0) K.at(x, y, sc, 0, () => { g.translate(-x, -y); tileFn(tileK); });
  }

  K.bg();
  const leftOut = 1 - K.io(t, tMessy, 0.5);                  // the promise half clears at [[messy]]

  // ---------------------------------------------------------------- the five-questions card leaves the tile
  // on "five" the card comes OUT OF THE MAP TILE: drawn beneath the tile, it starts hidden behind it at
  // the tile's size, slides out of its left edge and arcs to its place while the tile breathes warm, so
  // the questions read as what the map gives you (never as what the manual turned into)
  const cardK = K.io(t, tFive, 0.6);
  const cardA = leftOut * (1 - 0.3 * K.io(t, tWont, 0.6));    // "You won't finish...": attention moves to the promise
  const give = K.io(t, tFive - 0.1, 0.25, 'sine') * (1 - K.io(t, tFive + 0.4, 0.6, 'sine'));
  if (give > 0) K.glow(TX, TY, 230, C.head, 0.26 * give);
  if (cardK > 0 && cardA > 0) {
    const home = { x: CARD.x + CARD.w / 2, y: CARD.y + CARD.h / 2 }, p = M.arc({ x: TX, y: TY }, home, cardK, 40);
    K.layer(cardA, () => K.at(p.x, p.y, K.lerp(TS * 0.8 / CARD.w, 1, cardK), 0, () => {
      g.translate(-home.x, -home.y);
      K.card(CARD.x, CARD.y, CARD.w, CARD.h, { glow: 0.45 * (1 - cardK) });
      K.eyebrow('Every lesson answers', CARD.x + 56, CARD.y + 64);
    }));
  }

  // ---------------------------------------------------------------- map ⇄ tile
  const recK = K.io(t, tRec, 0.7) * leftOut;                 // "recognise it": the tile becomes a known place
  if (t < tMem) {
    // the fold starts once 05's crossfade has resolved (an earlier start shows two maps, one sliding)
    const kk = K.io(t, 0.15, 0.9) * (1 - K.io(t, tMessy + 0.3, 0.9));
    if (recK > 0) K.glow(TX, TY, 230, C.head, 0.3 * recK);
    const pins = SHELVED.map((m, i) => ({ mod: m, k: K.io(t, 0.75 + 0.12 * i, 0.45, 'out') }));
    fold(kk, TX, TY, TS, (a) => M.mapTile(TX, TY, TS, pins, { t: mt, here: true, lit: recK, glow: Math.max(0.55 * recK, 0.45 * give), alpha: a }));
  } else {
    // the corner tile carries the four gold pins and no you-are-here pin, exactly as 07 opens on it
    fold(K.io(t, tMem, 0.9), CX, CY, CS, (a) => M.mapTile(CX, CY, CS, SHELVED, { t: mt, alpha: a }));
  }

  // ---------------------------------------------------------------- a map, not a manual
  const ui = (s, x, y, size, color, k, o = {}) => K.layer(k, () => K.text(s, x, y + (1 - k) * 14, { size, color, align: 'center', font: 'ui', ...o }));
  ui('a map', TX, 580 + PY, 36, C.head, K.io(t, tMap, 0.5, 'out') * leftOut, { weight: 600 });
  ui('what it is · where it lives', TX, 625 + PY, 28, C.soft, K.io(t, tManual + 0.3, 0.5, 'out') * leftOut);

  // the manual is shown only to be turned down: it rises, then dims to 0.35 while a terracotta slash
  // crosses its tile ("not a manual"), and it has left before "Every lesson", so the left half sits
  // empty for a beat and the five questions can't read as what the manual turned into
  const bookIn = K.io(t, tManual, 0.6, 'out'), bookK = bookIn * (1 - K.io(t, tManual + 1.4, 0.5));
  const noK = K.io(t, tManual + 0.6, 0.4, 'out'), dimK = K.io(t, tManual + 0.6, 0.5);
  if (bookK > 0) K.layer(bookK, () => {
    g.save(); g.translate(0, (1 - bookIn) * 24);
    K.layer(K.lerp(1, 0.35, dimK), () => K.iconTile('book', BOOK.x, BOOK.y, BOOK.s, { color: C.soft }));
    K.layer(K.lerp(1, 0.6, dimK), () => {
      K.text('a manual', BOOK.x, 580 + PY, { size: 36, color: C.soft, weight: 600, align: 'center' });
      K.text('step by step', BOOK.x, 625 + PY, { size: 28, color: C.quiet, align: 'center' });
    });
    if (noK > 0) {                                           // the slash, corner to corner across the tile
      const h = BOOK.s * 0.4, x1 = BOOK.x - h, y1 = BOOK.y + h, x2 = BOOK.x + h, y2 = BOOK.y - h;
      g.save(); g.shadowColor = K.rgba(C.page, 0.9); g.shadowBlur = 10;
      K.line(x1, y1, x2, y2, { k: noK, color: C.accent, w: 10 });
      g.restore();
    }
    g.restore();
  });

  // ---------------------------------------------------------------- five questions every lesson answers
  const QS = ['What is it?', 'Where does it live?', 'What is it like?', 'What does it connect to?', 'What will surprise you?'];
  if (cardK > 0 && cardA > 0) {                              // the card itself was drawn under the tile, above
    QS.forEach((q, i) => {
      const k = K.io(t, tQ[i], 0.5, 'out'); if (k <= 0) return;
      K.layer(k * cardA, () => {
        const y = CARD.y + 136 + i * 66 + (1 - k) * 18;
        K.text(String(i + 1), CARD.x + 56, y, { font: 'mono', size: 30, weight: 600, color: C.gold });
        K.text(q, CARD.x + 104, y, { size: 38, color: C.strong });
      });
    });
  }
  // "able to DO the thing" arrives as a ghost (dashed terracotta = not yet), and on "recognise" the same
  // pill morphs into the solid gold "recognise it" over 0.7 s: the ghost's word leaves first, the outline
  // widens and turns solid, and only then does the gold word arrive (no overlap, no text outside the pill)
  const doK = K.io(t, tDo, 0.45, 'out') * leftOut, swap = K.seg(t, tRec, tRec + 0.7);
  if (doK > 0) {
    const PSZ = 30, to = { size: PSZ, font: 'ui', weight: 600 }, ph = PSZ * 1.9, py = 702 + PY;
    const wk = K.ease.io(K.seg(swap, 0.05, 0.45));
    const pw = K.lerp(K.measure('do it', to), K.measure('recognise it', to), wk) + PSZ * 1.6;
    const px = TX - pw / 2, ty = py + (1 - K.io(t, tDo, 0.45, 'out')) * 14;
    K.layer(doK, () => {
      if (wk < 1) K.layer(1 - wk, () => {
        g.save(); K.rr(px, ty - ph / 2, pw, ph, ph / 2); g.fillStyle = K.rgba(C.tile, 0.45); g.fill();
        g.setLineDash([9, 7]); g.lineWidth = 2; g.strokeStyle = K.rgba(C.accent, 0.9); g.stroke(); g.restore();
      });
      if (wk > 0) K.card(px, ty - ph / 2, pw, ph, { r: ph / 2, shadow: false, glow: 0.35 * wk, alpha: wk });
      const outK = 1 - K.ease.io(K.seg(swap, 0, 0.25)), inK = K.ease.io(K.seg(swap, 0.35, 0.85));
      if (outK > 0) K.text('do it', TX, ty + PSZ * 0.34, { ...to, color: C.quiet, align: 'center', alpha: outK });
      if (inK > 0) K.text('recognise it', TX, ty + PSZ * 0.34, { ...to, color: C.head, align: 'center', alpha: inK });
    });
  }

  // ---------------------------------------------------------------- safe to skip: the AI types, you know what it means
  const winK = K.io(t, tMem + 0.75, 0.6, 'out');
  if (winK > 0) {
    const term = { x: WIN.x, y: WIN.y + 50, w: WIN.w, h: WIN.h - 50 };
    // K.term's row geometry (pad 28, line height 1.5 x size), so the glosses sit on the same baselines
    const rows = LINES.map((L, i) => {
      const y = term.y + 28 + FS + i * FS * 1.5, x = term.x + 28 + K.measure(L.prompt, MONO), w = K.measure(L.cmd, MONO);
      return { ...L, y, x, w, end: x + w };
    });
    const tC = [tType, tType + LINES[0].cmd.length / CPS + 0.12];   // Enter after `cd projects`, then the next line
    const tDone = tC[1] + LINES[1].cmd.length / CPS;                 // ≈ 37.0 s, as "them." ends
    const typing = K.io(t, tType - 0.15, 0.3) * (1 - 0.6 * K.io(t, tDone + 0.3, 0.9));

    const ek = K.io(t, tSkip, 0.5, 'out');
    if (ek > 0) K.eyebrow('Safe to skip: memorising commands', WIN.x, WIN.y - 28 + (1 - ek) * 10, { size: 24, alpha: ek });

    K.layer(winK, () => {
      g.save(); g.translate(0, (1 - winK) * 24);
      const r = K.win(WIN.x, WIN.y, WIN.w, WIN.h, { title: 'Command Prompt', kind: 'terminal' });
      if (typing > 0) {                                      // lantern light on the line while the AI types
        const i = t < tC[1] ? 0 : 1, tw = K.measure(K.typed(rows[i].cmd, t, tC[i], CPS), MONO);
        g.save(); g.beginPath(); g.roundRect(r.x + 1, r.y, r.w - 2, r.h - 1, [0, 0, 13, 13]); g.clip();   // the light stays inside the window
        K.glow(rows[i].x + tw, rows[i].y - 12, 190, C.head, 0.16 * typing);
        g.restore();
      }
      K.term(r, t, t < tType ? [{ at: -99, cmd: '' }] : rows.map((L, i) => ({ at: tC[i], cmd: L.cmd, prompt: L.prompt, cps: CPS })), { size: FS });
      g.restore();
    });

    K.pop(t, tAI, LAMP.x, LAMP.y, () => {
      M.lanternTile(t, LAMP.x, LAMP.y, LAMP.s, { glow: 0.35 + 0.5 * typing, lit: 1.3 + 0.9 * typing });
      K.text('your AI', LAMP.x, LAMP.y + LAMP.s / 2 + 44, { size: 28, color: C.soft, align: 'center' });
    });

    // your job: knowing what each line means. A thin gold underline under the command, a thin arrow from
    // its meaning, then the meaning itself (gold = known). `cd` on "knowing", the run line on "they mean".
    const jk = K.io(t, tJob, 0.5, 'out');
    if (jk > 0) K.text('your job', GLOSS.x, LAMP.y + LAMP.s / 2 + 44 + (1 - jk) * 12, { size: 28, color: C.soft, alpha: jk });
    const tG = [tKnow, tKnow + 0.45];
    rows.forEach((L, i) => {
      const mk = K.io(t, tG[i], 0.35), ak = K.io(t, tG[i] + 0.1, 0.4), lk = K.io(t, tG[i] + 0.2, 0.45, 'out');
      if (mk <= 0) return;
      K.mark(L.x, L.y + 12, L.w, mk, { color: C.head, w: 3 });
      // the run line keeps its blinking caret, so that arrow stops short of it
      K.arrow(GLOSS.x - 16, L.y - 11, L.end + (i ? 40 : 18), L.y - 11, { k: ak, color: C.head, w: 2, headSize: 12 });
      if (lk > 0) K.text(L.gloss, GLOSS.x + (1 - lk) * 12, L.y, { size: GLOSS.size, weight: 600, color: C.head, alpha: lk });
    });
  }
});
