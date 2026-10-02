/* 00.05 scene 05 — The desk (the context window).
   04's three rows ride along as the desk widens back to its standard rect ("everything the model can see at once").
   "Starts cold": the rows clear and the empty slab says "starts empty". "Every turn the app slides the whole
   conversation back": the SAME words slide back in from the app chip, now as one stream in reading order, with the
   hidden instructions (faint, there all along) in front. Each part is named on its word (label + a small lift wave):
   hidden instructions, your messages, its replies, then a notes.pdf strip. More chat fills the last row; the outline warms.
   The app's three choices are ALTERNATIVES, each from the same full desk (a quick snap back between them):
   drop the oldest turn off the left edge (the pinned hidden instructions stay), squash it into a short summary,
   or stop with an error. Cost: the chat rewinds to turn 1 and grows turn by turn; each re-send is swept and counted. */
SCENE('05', (t, S) => {
  K.bg();
  const C = K.C, io = K.io;
  const f = (re, n, fb) => S.find(re, n, fb);

  // ---- timing (cues + spoken words)
  const cFull = S.cue('full', 18.3), cEdge = S.cue('edge', 21.25), cCost = S.cue('cost', 29.64);
  const tCtx = f('context', 0, 1.23), tSee = f('everything', 0, 3.09), tCold = f('cold', 0, 6.62);
  const tTurn = f('every', 1, 8.32), tApp = f('app', 0, 9.07), tSlides = f('slides', 0, 9.37);
  const tHidden = f('hidden', 0, 12.92), tYour = f('your', 0, 14.65), tIts = f('its', 0, 15.86), tFiles = f('files', 0, 17.19);
  const tApp2 = f('app', 1, 21.63);
  const tDrop = f('drop', 0, 23.06), tOldest = f('oldest', 0, 23.63);
  const tSquash = f('squash', 0, 25.47), tStop = f('stop', 0, 27.93);
  const tEvery2 = f('everything', 1, 30.34), tResent = f('re-sent', 0, 31.33), tLong = f('long', 0, 32.69);
  const tChat = f('chat', 0, 33.17), tTokens = f('tokens', 0, 34.3);

  // the three alternatives each start from the same full desk: quick snap backs between them
  const snap1 = io(t, tSquash - 0.45, 0.35);           // dropped turn comes back before "squash"
  const snap2 = io(t, tStop - 0.45, 0.35);             // squashed turn comes back before "stop"
  const rewind = io(t, cCost + 0.1, 0.5);              // cost: back to turn 1, then it grows
  const b1 = tResent - 0.05, b2 = tChat;               // turn 2 / turn 3 batches arrive
  const b1k = io(t, b1, 0.6), b2k = io(t, b2, 0.6);
  const sw = [tEvery2, tLong - 0.15, tTokens - 0.1];   // a gold pass per re-send

  // ---- the desk: back from 04's narrow rect to the standard one
  const R = M.lerpRect(M.layout.narrow, M.DESK, io(t, 0.2, 0.8));
  const lamp = io(t, tSee, 0.6) * (1 - io(t, tCold - 0.3, 0.9));
  let heat = io(t, cFull + 0.2, 2.2);
  heat = K.lerp(heat, 0.55, io(t, tOldest + 0.5, 0.8));
  heat = K.lerp(heat, 1, snap1);
  heat = K.lerp(heat, 0.6, io(t, tSquash + 0.6, 0.8));
  heat = K.lerp(heat, 1, snap2);
  heat = K.lerp(heat, 0.3, rewind);
  heat = K.lerp(heat, 0.6, b1k);
  heat = K.lerp(heat, 0.95, b2k);
  const edge = Math.sin(Math.PI * K.seg(t, tOldest + 0.3, tOldest + 0.9));
  const d = M.desk(t, R, { heat, lamp, edge });
  if (lamp > 0.01) K.card(R.x - 12, R.y - 12, R.w + 24, R.h + 24, { r: 32, fill: 'rgba(0,0,0,0)', stroke: C.head, shadow: false, lw: 2, alpha: 0.5 * lamp });

  // ---- top text
  M.eyebrow('CONTEXT WINDOW', { alpha: io(t, tCtx - 0.1, 0.5) });
  const lab = io(t, tSee, 0.5) * (1 - io(t, cEdge - 0.7, 0.5));
  if (lab > 0) K.text('everything the model can see at once', 960, 336, { ...M.type.read, color: C.body, align: 'center', alpha: lab });
  const clk = io(t, tTurn - 0.1, 0.5) * (1 - io(t, cEdge - 0.7, 0.5));
  if (clk > 0) {
    K.icon('clock', 1700, 286, 48, { color: C.body, alpha: clk });
    K.text('every turn', 1700, 352, { ...M.type.label, color: C.body, align: 'center', alpha: clk });
  }

  // ---- 04's last rows ride along as the desk widens, then clear: the engine starts cold every message
  {
    const prev = [
      { strs: ["What's", 'the', 'capital', 'of', 'France', '?'], r: 0 },
      { strs: ['The', 'capital', 'of', 'France', 'is', 'Paris', '.', 'stop'], r: 1 },
      { strs: ['Write', 'a', 'name', 'for', 'my', 'cat', ':', 'Biscuit'], r: 2 },
    ];
    let n = 0;
    prev.forEach((rw) => {
      M.flow(rw.strs, d.x0).forEach((q) => {
        const u = io(t, tCold - 0.1 + 0.02 * n++, 0.45, 'in');
        if (u < 1) M.tile(q.s, q.x - 40 * u, d.rowY(rw.r), { alpha: 1 - u, tone: q.s === 'stop' ? 'soft' : 'plain' });
      });
    });
  }
  // the empty slab: what the engine has at the start of every message
  const emp = io(t, tCold + 0.35, 0.5) * (1 - io(t, tSlides, 0.4));
  if (emp > 0) K.text('starts empty', 960, 600, { ...M.type.read, color: C.soft, align: 'center', alpha: emp });

  // ---- the conversation, re-sent: one stream in reading order (a message is many tiles; parts keep a wider gap)
  const RY = [0, 1, 2].map((r) => M.rowY(M.DESK, r));
  const X0 = M.rowX0(M.DESK), X1 = M.DESK.x + M.DESK.w - 40, GAP = 14, GG = 30;
  const LBL_TOP = 452, LBL_BOT = 743;                  // label baselines: above row 0 / below row 2 (desk margins)
  const PARTS = [
    { g: 'sys', label: 'hidden instructions', at: tHidden, tone: 'ghost', w: ['Be', 'brief', '.'] },
    { g: 'you1', who: 'you', at: tSlides, w: ["What's", 'the', 'capital', 'of', 'France', '?'] },
    { g: 'ai1', who: 'ai', at: tSlides, w: ['The', 'capital', 'of', 'France', 'is', 'Paris', '.'] },
    { g: 'you2', who: 'you', at: tSlides, w: ['Write', 'a', 'name', 'for', 'my', 'cat', ':'] },
    { g: 'ai2', who: 'ai', at: tSlides, w: ['Biscuit'] },
    { g: 'file', label: 'notes.pdf', at: tFiles, w: ['Plan', ':', 'v2'] },
    { g: 'fill', at: cFull, w: ['next', ':', 'the', 'login', 'page', 'looks', 'off', 'on', 'mobile', 'too'] },
  ];
  const lay = (items) => {
    let r = 0, x = X0, pg = null;
    for (const it of items) {
      const w = M.tileW(it.s);
      if (pg !== null && pg !== it.g && x > X0) x += GG;
      if (x + w > X1) { if (r === 2) break; r++; x = X0; }
      it.x = x + w / 2; it.y = RY[r]; it.w = w; it.r = r; it.on = true;
      x += w + GAP; pg = it.g;
    }
  };
  const turnOf = (g) => (g === 'you2' || g === 'ai2' ? 2 : g === 'file' || g === 'fill' ? 3 : 1);
  const ALL = [];
  PARTS.forEach((P) => P.w.forEach((s, j) => ALL.push({ s, g: P.g, P, j })));
  lay(ALL);
  const TILES = ALL.filter((it) => it.on);
  TILES.forEach((it, n) => { it.n = n; });
  TILES.filter((it) => turnOf(it.g) === 3).forEach((it, i) => { it.wi2 = i; });
  const first = (g) => TILES.find((it) => it.g === g);
  const OLD = TILES.filter((it) => it.g === 'you1' || it.g === 'ai1');    // the oldest turn (drop / squash)

  const dropD = Math.max(...OLD.map((it) => it.x)) - M.DESK.x + 190;   // conveyor travel: the last tile clears the edge

  // the summary strip (squash), right after the hidden instructions on row 0
  const sysEnd = TILES.filter((it) => it.g === 'sys').pop();
  const sysRight = sysEnd.x + sysEnd.w / 2 + 6;
  const SUM = M.flow(['capital', ':', 'Paris'], sysEnd.x + sysEnd.w / 2 + GG);
  const sumC = { x: (SUM[0].x - SUM[0].w / 2 + SUM[2].x + SUM[2].w / 2) / 2, y: RY[0] };

  // name each part on its word: a label in the desk margin + a small lift wave over all of its tiles
  const waveAt = { sys: tHidden, you: tYour, ai: tIts, file: tFiles };
  const waveIdx = {};
  TILES.forEach((it) => { const key = it.P.who || it.g; waveIdx[key] = (waveIdx[key] || 0) + 1; it.wi = waveIdx[key] - 1; });
  const lift = (it) => {
    const a = waveAt[it.P.who || it.g]; if (a == null) return 0;
    const s0 = a + 0.1 + 0.03 * it.wi;
    return 9 * Math.sin(Math.PI * K.seg(t, s0, s0 + 0.5));
  };

  // arrival of each tile (alpha, x offset)
  const arrive = (it) => {
    let a, dx;
    if (it.g === 'fill') { const k = io(t, cFull + 0.1 + 0.11 * it.j, 0.5, 'out'); a = k; dx = (1 - k) * 240; }
    else if (it.g === 'file') { const k = io(t, tFiles - 0.05 + 0.06 * it.j, 0.5, 'out'); a = k; dx = (1 - k) * 240; }
    else {
      const k = io(t, tSlides + 0.025 * it.n, 0.6, 'out'); a = k; dx = (1 - k) * 320;
      if (it.g === 'sys') a *= K.lerp(0.14, 1, io(t, tHidden - 0.1, 0.5));   // hidden: there all along, faint until named
    }
    // cost: rewind to turn 1, then turns 2 and 3 arrive again
    const tn = turnOf(it.g);
    if (tn > 1 && rewind > 0) {
      const back = tn === 2 ? io(t, b1 + 0.04 * it.j, 0.5, 'out') : io(t, b2 + 0.05 * it.wi2, 0.5, 'out');
      if (back > 0) { a *= back; dx += (1 - back) * 200; } else a *= 1 - rewind;
    }
    return { a, dx };
  };

  const label = (s, x, y, a, soft) => { if (a > 0.002) K.text(s, x, y, { ...M.type.label, color: soft ? C.soft : C.body, alpha: a }); };
  const tileAt = (it, x, y, o = {}) => M.tile(it.s, x, y, { tone: it.P.tone || 'plain', ...o });

  // 1) the oldest turn: drop (off the left edge, under the pinned strip), squash, or simply sit there
  OLD.forEach((it, j) => {
    const { a, dx } = arrive(it); if (a <= 0.002) return;
    const ly = it.y - lift(it);
    // drop: the whole turn slides left like a conveyor (under the pinned strip); each tile tips off the edge
    const du = io(t, tOldest, 1.25, 'io');
    if (du > 0 && snap1 <= 0) {
      const xs = it.x - dropD * du;
      // on row 0 the turn slides in behind the pinned strip: it fades as it reaches it
      const behind = it.r === 0 ? K.clamp((xs - it.w / 2 - sysRight) / 110) : 1;
      if (behind <= 0.002) return;
      if (xs >= R.x) { tileAt(it, xs, it.y, { alpha: a * behind }); return; }
      const v = K.clamp((R.x - xs) / 180);
      if (v < 1) tileAt(it, R.x - (R.x - xs) * 0.45, it.y + 170 * v * v, { rot: -0.6 * v, alpha: a * (1 - v) });
      return;
    }
    if (snap1 > 0 && snap1 < 1) { tileAt(it, it.x - 30 * (1 - snap1), ly, { alpha: a * snap1 }); return; }
    // squash: words fade, the empty tiles narrow and close into the summary slot; back at snap2
    const uSq = K.seg(t, tSquash + 0.05, tSquash + 0.95);
    if (uSq > 0 && snap2 <= 0) {
      const ta = 1 - K.clamp(uSq / 0.3), e = K.ease.io(K.clamp((uSq - 0.25) / 0.75));
      const ba = 1 - K.clamp((uSq - 0.55) / 0.45);
      if (ba > 0.002) M.tile('', K.lerp(it.x, sumC.x, e), K.lerp(it.y, sumC.y, e), { w: it.w * (1 - 0.75 * e), alpha: a * ba * (1 - ta) });
      if (ta > 0.002) tileAt(it, it.x, it.y, { alpha: a * ta });
      return;
    }
    if (snap2 > 0 && snap2 < 1) { tileAt(it, it.x - 30 * (1 - snap2), ly, { alpha: a * snap2 }); return; }
    tileAt(it, it.x + dx, ly, { alpha: a });
  });

  // the summary strip grows out of the squash point, then gives way when the turn comes back
  const kSum = io(t, tSquash + 0.7, 0.5) * (1 - snap2);
  if (kSum > 0.002) {
    SUM.forEach((p) => M.tile(p.s, K.lerp(sumC.x, p.x, 0.85 + 0.15 * kSum), RY[0], { alpha: kSum }));
    label('summary of earlier chat', SUM[0].x - SUM[0].w / 2, LBL_TOP, kSum);
  }

  // 2) everything after the oldest turn stays put
  TILES.filter((it) => it.g !== 'sys' && !OLD.includes(it)).forEach((it) => {
    const { a, dx } = arrive(it); if (a <= 0.002) return;
    tileAt(it, it.x + dx, it.y - lift(it), { alpha: a });
  });

  // 3) the hidden instructions: first on the desk, pinned when the app starts dropping (drawn over the falling turn)
  TILES.filter((it) => it.g === 'sys').forEach((it) => {
    const { a, dx } = arrive(it); if (a <= 0.002) return;
    tileAt(it, it.x + dx, it.y - lift(it), { alpha: a, pin: it.j === 0 ? io(t, tDrop, 0.45) : 0 });
  });

  // part labels (desk margins), each on its spoken word; the oldest turn's labels leave with it
  {
    const oldGone = Math.max(io(t, tOldest - 0.05, 0.3) * (1 - snap1), io(t, tSquash, 0.3) * (1 - snap2));
    const lblOut = 1 - io(t, cEdge - 0.4, 0.5);        // once the app starts choosing, only the pinned label stays
    const L = [
      { g: 'sys', s: 'hidden instructions', at: tHidden, soft: true, keep: true },
      { g: 'you1', s: 'your messages', at: tYour, old: true },
      { g: 'ai1', s: 'its replies', at: tIts, old: true },
      { g: 'file', s: 'notes.pdf', at: tFiles },
    ];
    L.forEach((l) => {
      const it = first(l.g); if (!it) return;
      const y = it.r === 0 ? LBL_TOP : it.r === 2 ? LBL_BOT : null; if (y == null) return;
      let a = io(t, l.at - 0.1, 0.4);
      if (!l.keep) a *= lblOut;
      if (l.old) a *= 1 - oldGone;
      if (l.g === 'sys') a *= 1 - io(t, tSquash + 0.6, 0.3) * (1 - snap2);   // makes room for the summary label
      const x = it.x - it.w / 2 + (l.g === 'sys' ? 24 * io(t, tDrop, 0.45) : 0);
      label(l.s, x, y, a, l.soft);
    });
  }

  // ---- the app: the one that sends the desk every turn, and the one that chooses
  {
    const k = io(t, tApp - 0.1, 0.45);
    if (k > 0.002) {
      const pulse = Math.max(Math.sin(Math.PI * K.seg(t, tSlides - 0.1, tSlides + 0.9)), Math.sin(Math.PI * K.seg(t, tApp2 - 0.1, tApp2 + 0.9)),
        ...sw.map((a) => Math.sin(Math.PI * K.seg(t, a - 0.2, a + 0.4))));
      K.pill('app', 1752, 590, { size: 26, alpha: k, stroke: K.mixColor(C.line2, C.gold, pulse), glow: 0.35 * pulse });
    }
  }

  // ---- the app's three choices, each on its word (the earlier one dims as the next is said)
  const ch = [
    { s: 'drop the oldest', at: tDrop },
    { s: 'summarize', at: tSquash },
    { s: '  stop with an error', at: tStop, err: true },   // em spaces leave room for the warning icon
  ];
  const pf = { font: 'ui', weight: 600, size: 26 };
  const pw = ch.map((c) => K.measure(c.s, pf) + 26 * 1.6), pg = 28;
  let px = 960 - (pw.reduce((a, b) => a + b, 0) + pg * (ch.length - 1)) / 2;
  const chOut = 1 - io(t, cCost - 0.1, 0.5);
  ch.forEach((c, i) => {
    const cx = px + pw[i] / 2; px += pw[i] + pg;
    const k = io(t, c.at - 0.05, 0.45, 'out'); if (k <= 0 || chOut <= 0) return;
    const nxt = ch[i + 1] ? ch[i + 1].at : Infinity;
    const lit = 1 - 0.55 * io(t, nxt - 0.45, 0.35);
    K.pill(c.s, cx, 352 + (1 - k) * 12, {
      size: 26, alpha: k * lit * chOut,
      stroke: c.err ? C.accent : C.line2, color: c.err ? C.accent : C.strong,
      fill: c.err ? '#2A1E22' : C.tile,
    });
    if (c.err) K.icon('warning', cx - pw[i] / 2 + 38, 350 + (1 - k) * 12, 28, { color: C.accent, w: 2.5, alpha: k * lit * chOut });
  });
  // "stop with an error": the full desk's outline flares once
  {
    const e = Math.sin(Math.PI * K.seg(t, tStop + 0.1, tStop + 1.1));
    if (e > 0.01) K.card(R.x - 8, R.y - 8, R.w + 16, R.h + 16, { r: 30, fill: 'rgba(0,0,0,0)', stroke: C.accent, shadow: false, lw: 3, alpha: 0.7 * e });
  }

  // ---- cost: every re-send is counted, and each one is bigger
  sw.forEach((a, i) => M.sweep(d.x0, d.x1, 590, K.seg(t, a, a + (i ? 0.5 : 0.8)), { r: 260 }));
  const ck = io(t, cCost, 0.5);
  if (ck > 0) {
    const ca = ck * (1 - 0.2 * io(t, S.dur - 1.2, 0.8));
    K.layer(1, () => K.at(0, (1 - ck) * 20, () => {
      M.turns(1300, 150, 480, 220, 'TOKENS SENT', [
        { label: 'turn 1', v: 0.48, k: io(t, sw[0], 0.6) },
        { label: 'turn 2', v: 0.73, k: io(t, sw[1], 0.6) },
        { label: 'turn 3', v: 1.0, k: io(t, sw[2], 0.6) },
      ], { alpha: ca });
    }));
  }
});
