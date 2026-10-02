/* 00.05 scene 04 — One tile at a time.
   03's tiles drop away as the desk narrows; the question "What's the capital of France ?" is already on row 0.
   The model sweeps (reads) the desk, the tray scores candidates, and it lays the answer on row 1 one tile per step
   ("The capital of France is Paris . stop"). The chat then streams exactly those tiles, each lighting on the desk as
   its word lands. Then temperature: row 2 "Write a name for my cat :", the slider reshapes the tray, three tries;
   on [[twice]] two chats answer "Luna." / "Biscuit." and the desk slot shows the same two answers in turn. */
SCENE('04', (t, S) => {
  K.bg();
  const io = K.io, C = K.C;
  const c = (n, fb) => S.cue(n, fb);
  const f = (w, n, fb) => S.find(w, n || 0, fb);
  const bump = (a, d) => Math.sin(Math.PI * K.seg(t, a, a + d));

  // ---- cue times (local) ----
  const tScore = c('score', 0), tAgain = c('again', 9.24), tStream = c('stream', 17.15);
  const tDial = c('dial', 26.37), tTwice = c('twice', 41.3);
  const tReads = f('reads', 0, 0.65), tScores = f('scores', 0, 2.79);
  const tLays = f('lays', 0, 5.49);                  // "It lays one."
  const tJoins = f('joins', 0, 7.77);                // "That tile joins the desk"
  const tStep = f('step', 0, 12.47);                 // "one tile per step"
  const tMeans = f('means', 0, 15.09), tStop = f('stop', 0, 15.92);
  const tWatch = f('watching', 0, 24.39);
  const tTemp = f('temperature', 0, 28.77);
  const tLow = f('Low', 0, 30.11), tLikeliest = f('likeliest', 0, 31.49);
  const tHigh = f('High', 0, 35.5), tReaches = f('reaches', 0, 36.44), tOdd = f('odd', 0, 40.16);
  const tQuestion = f('question', 0, 43.13), tDifferent = f('different', 0, 44.37);
  const tMost = f('Most', 0, 45.93), tApps = f('apps', 0, 46.43);

  // ---- the desk: standard -> narrow (03 ends on M.DESK) ----
  const dk = io(t, tScore, 0.8);
  const R = M.lerpRect(M.layout.desk, M.layout.narrow, dk);
  const d = M.desk(t, R, {});
  const y0 = d.rowY(0), y1 = d.rowY(1), y2 = d.rowY(2);

  M.eyebrow('ONE TILE AT A TIME', { x: 740, alpha: io(t, tScore + 0.1, 0.6) });

  // ---- 03's tiles (its exit layout on M.DESK) drop under the desk and fade, while the crossfade runs ----
  const OLD = M.flow(['Explain', 'unbeliev', 'ably', 'short', 'words'], 960, { align: 'center' }).map((p) => ({ ...p, y: M.rowY(M.DESK, 0) }))
    .concat(M.flow(['str', 'aw', 'berry'], 960, { align: 'center' }).map((p) => ({ ...p, y: M.rowY(M.DESK, 1) })));
  OLD.forEach((p, i) => {
    const u = io(t, tScore + 0.03 * i, 0.5, 'in');
    if (u >= 1) return;
    M.tile(p.s, p.x, p.y + 60 * u, { rot: (i % 2 ? 0.08 : -0.08) * u, alpha: 1 - u });
  });

  // ---- row 0: the question (on the desk within 0.4 s, before "reads") ----
  const Q = ["What's", 'the', 'capital', 'of', 'France', '?'];
  M.row(t, Q, d.x0, y0, { k: (i) => io(t, tScore + 0.08 + 0.04 * i, 0.35) });

  // ---- row 1: the answer the model lays, one tile per step ----
  const ANS = ['The', 'capital', 'of', 'France', 'is', 'Paris', '.', 'stop'];
  const CANDS = [
    ['The', 'Paris', 'It', 'France', "It's"],
    ['capital', 'city', 'answer', 'French', 'main'],
    ['of', 'city', 'is', ',', 'for'],
    ['France', 'French', 'the', 'Paris', 'a'],
    ['is', 'was', 'has', ',', 'remains'],
    ['Paris', 'a', 'the', 'located', 'known'],
    ['.', 'and', ',', 'which', '!'],
    ['stop', 'It', 'The', 'Its', 'Paris'],
  ];
  const SC = [[2.4, 1.4, 1.2, 0.8, 0.5], [2.6, 1.3, 1.0, 0.7, 0.5], [3.0, 1.2, 1.0, 0.6, 0.4], [3.2, 1.2, 0.9, 0.6, 0.4],
    [2.8, 1.5, 1.0, 0.7, 0.4], [3.2, 1.4, 1.2, 0.8, 0.5], [2.6, 1.6, 1.3, 0.6, 0.3], [2.8, 1.2, 1.0, 0.7, 0.4]];
  // timing per step: in (candidates fill), pick (gold), fly (lift), dur (flight), settle (gold -> plain)
  const tOne = tStep - 1.0;                           // "one tile per step" begins
  const ST = ANS.map((s, i) => {
    if (i === 0) return { in: tScores + 0.05, stag: 0.15, pick: tLays - 0.1, fly: tLays + 0.25, dur: 0.45, settle: tJoins - 0.2 };
    if (i === 1) return { in: tAgain + 0.3, stag: 0.06, pick: tAgain + 0.95, fly: tAgain + 1.15, dur: 0.45 };
    if (i === 7) return { in: tMeans - 0.5, stag: 0.04, pick: tMeans - 0.1, fly: tMeans + 0.05, dur: 0.45, settle: tStop };
    const b = tOne - 0.4 + 0.7 * (i - 2);
    return { in: b, stag: 0.04, pick: b + 0.22, fly: b + 0.3, dur: 0.38 };
  });
  ST.forEach((st, i) => {
    st.land = st.fly + st.dur;
    if (st.settle == null) st.settle = st.land + 0.2;
    st.out = i < ST.length - 1 ? ST[i + 1].in - 0.15 : Infinity;
  });

  // ---- the tray: one candidate set per step ----
  const trayK = io(t, tScores - 0.35, M.motion.move) * (1 - io(t, tStream - 0.55, 0.6));
  let si = 0; ST.forEach((st, i) => { if (t >= st.in - 0.05) si = i; });
  const ss = ST[si];
  let trayPos = null;
  if (t < tDial) {
    const fill = (j) => io(t, ss.in + ss.stag * j, si === 0 ? 0.4 : 0.25) * (1 - io(t, ss.out, 0.15));
    trayPos = M.tray(t, CANDS[si], {
      k: trayK, temp: 0.5, scores: SC[si], fill,
      pick: t >= ss.pick ? 0 : undefined, lift: t >= ss.fly ? 1 : 0,
    });
    // the picked tile has left: a ghost holds its slot until the tray re-scores
    const ga = t >= ss.fly ? fill(0) * trayK : 0;
    if (ga > 0.01) M.tile(CANDS[si][0], trayPos[0].x, trayPos[0].y, { tone: 'ghost', size: 26, alpha: ga });
  }

  // sweeps: the model reads every tile on the desk (first one slow, the repeat faster, over both rows)
  const QP = M.flow(Q, d.x0), AP = M.flow(ANS, d.x0);
  const endOf = (P, n) => P[n - 1].x + P[n - 1].w / 2;
  M.sweep(d.x0 - 40, endOf(QP, Q.length) + 40, y0, K.seg(t, tReads + 0.05, tReads + 0.05 + M.motion.sweep));
  M.sweep(d.x0 - 40, endOf(QP, Q.length) + 40, (y0 + y1) / 2, K.seg(t, tAgain + 0.2, tAgain + 0.7), { r: 200 });

  // [[stream]]: each answer tile lights as its word lands in the chat; "watching tiles land": one more ripple
  const STREAM0 = tStream + 0.85, SSTEP = 0.45;
  const wordOf = [0, 1, 2, 3, 4, 5, 5, -1];          // "Paris." covers the Paris and . tiles; stop never shows
  const lit = (i) => {
    if (wordOf[i] < 0) return 0;
    return Math.max(bump(STREAM0 + SSTEP * wordOf[i], 0.8), bump(tWatch + 0.1 + 0.09 * i, 0.7));
  };
  // a desk tile with a gold overlay (k 0..1) whose text stays at full strength (no half-transparent text mid-blend)
  const glowTile = (str, x, y, tone, k) => {
    M.tile(str, x, y, { tone });
    if (k <= 0.01) return;
    M.tile(str, x, y, { tone: 'hot', glow: 0.5 * k, alpha: k });
    K.text(str, x, y + M.tileSize() * 0.35, { ...M.type.tile, size: M.tileSize(), align: 'center', color: K.mixColor(tone === 'soft' ? C.soft : C.strong, C.strong, k) });
  };
  ST.forEach((st, i) => {
    const slot = AP[i];
    if (t < st.fly) return;
    if (t < st.land) {
      const src = trayPos ? trayPos[0] : { x: 1500, y: 316 };
      M.fly(ANS[i], src.x, src.y, slot.x, y1, (t - st.fly) / st.dur, { bend: -140, trail: 0.6 });
      return;
    }
    const s = io(t, st.settle, i === 0 || i === 7 ? 0.5 : 0.3);
    const after = i === 7 ? 'soft' : 'plain';
    glowTile(ANS[i], slot.x, y1, after, Math.max(1 - s, lit(i)));
  });

  // step counter (above the desk, left): the step being worked on. It ticks up as soon as the previous tile has
  // landed and the next round starts (step 2 on [[again]]), before the tray shows that step's candidates.
  const stepAt = ST.map((st, i) => (i === 0 ? ST[0].land : Math.max(ST[i - 1].land, st.in - 0.25)));
  const nStep = stepAt.filter((a) => t >= a).length;
  const cAlpha = io(t, ST[0].land, 0.4) * (1 - io(t, tDial, 0.5));
  if (cAlpha > 0.01 && nStep > 0) {
    const fresh = t < stepAt[nStep - 1] + 0.4;
    K.layer(cAlpha, () => K.spans([{ s: 'step ', color: C.soft }, { s: String(nStep), color: fresh ? C.head : C.body }],
      d.x0, y0 - 110, { font: 'mono', size: 30, weight: 600 }));
  }

  // ---- [[stream]]: the same question, the same tiles, appearing word by word where the tray was ----
  const chK = io(t, tStream + 0.05, 0.6) * (1 - io(t, tDial, 0.5));
  if (chK > 0.01) {
    K.layer(chK, () => K.at(0, (1 - io(t, tStream + 0.05, 0.6)) * 30, () => {
      M.chat(t, 1420, 230, 400, 300, [
        { s: "What's the capital of France?", who: 'you', k: io(t, tStream + 0.3, 0.4) },
        { s: 'The capital of France is Paris.', who: 'ai', k: io(t, tStream + 0.75, 0.4), stream: STREAM0, step: SSTEP },
      ]);
    }));
  }

  // ---- [[dial]]: temperature; row 2 is a new prompt with an empty slot ----
  const cat = ['Write', 'a', 'name', 'for', 'my', 'cat', ':'];
  const catP = M.row(t, cat, d.x0, y2, { k: (i) => io(t, tDial + 0.2 + 0.08 * i, 0.45) });
  const lastCat = catP[catP.length - 1];
  const slotL = lastCat.x + lastCat.w / 2 + 14;                 // left edge of the next tile
  const slotW = 190, slotX = slotL + slotW / 2;

  // the two answers that land in the slot on [[twice]] (they come from tries 1 and 2)
  const ansA = { s: 'Luna', from: 0, fly: tTwice + 0.7, out: tQuestion + 0.2 };
  const ansB = { s: 'Biscuit', from: 1, fly: tQuestion + 0.35, out: Infinity };
  [ansA, ansB].forEach((a) => { a.land = a.fly + M.motion.land; });
  const slotA = io(t, tDial + 1.0, 0.5) * (1 - io(t, ansA.land, 0.3));
  if (slotA > 0.01) M.tile('', slotX, y2, { tone: 'ghost', w: slotW, alpha: slotA });

  // the dial: mid -> low -> high -> back to mid ("most apps set the dial for you")
  const kn = 0.5 - 0.5 * io(t, tLow, 0.7) + io(t, tHigh, 0.8) - 0.5 * io(t, tMost + 0.05, 0.7);
  if (t >= tTemp - 0.3) {
    M.slider(t, kn, {
      draw: io(t, tTemp - 0.2, 0.6), knob: io(t, tTemp + 0.25, 0.6, 'back'),
      labels: io(t, tTemp + 0.55, 0.5) * (1 - io(t, tMost, 0.45)),
    });
    const pa = io(t, tApps, 0.5);           // "Most apps set the dial for you"
    if (pa > 0.01) K.pill('the app sets it', 1500, 880, { size: 26, alpha: pa });
  }

  if (t >= tDial) {
    const catK = io(t, tDial + 0.8, M.motion.move) * (1 - io(t, tTwice, 0.6));
    M.tray(t, ['Mochi', 'Luna', 'Pepper', 'Biscuit', 'Admiral'], {
      k: catK, temp: kn,
      fill: (i) => io(t, tDial + 1.2 + 0.1 * i, 0.4),
      pick: t >= tLikeliest - 0.2 && t < tHigh ? 0 : undefined,
    });
  }

  // three separate tries, above the desk (a desk row is one sequence; tries are separate runs)
  const triesOut = io(t, tDifferent, 0.6);
  const tryA = (i) => io(t, tLow + 0.15 + 0.12 * i, 0.5) * (1 - triesOut);
  const lowPick = ['Mochi', 'Mochi', 'Mochi'], highPick = ['Luna', 'Biscuit', 'Admiral'];
  const tryXY = (i) => ({ x: 400 + 340 * i, y: 222 + 100 });
  [0, 1, 2].forEach((i) => {
    const a = tryA(i); if (a <= 0.01) return;
    const cx = tryXY(i).x, x = cx - 150, y = 222, w = 300, h = 156;
    K.layer(a, () => K.at(0, (1 - Math.min(1, io(t, tLow + 0.15 + 0.12 * i, 0.5))) * 20, () => {
      K.card(x, y, w, h, { r: 20, fill: K.rgba(C.tile, 0.6) });
      K.eyebrow('TRY ' + (i + 1), x + 28, y + 42, { size: 20 });
      const ty = y + 100;
      const lo = io(t, tLikeliest + 0.2 * i, 0.4) * (1 - io(t, tReaches + 0.3 * i, 0.35));
      const flown = i === 0 ? t >= ansA.fly : i === 1 ? t >= ansB.fly : false;   // the answer leaves for the desk slot
      const hi = io(t, tReaches + 0.3 * i + 0.35, 0.4) * (flown ? 0 : 1);
      if (lo > 0.01) M.tile(lowPick[i], cx, ty + (1 - lo) * 10, { tone: 'hot', alpha: lo });
      if (hi > 0.01) M.tile(highPick[i], cx, ty + (1 - hi) * 10, { tone: 'hot', alpha: hi, rot: i === 2 ? 0.07 * io(t, tOdd - 0.6, 0.6) : 0 });
      if (flown) M.tile(highPick[i], cx, ty, { tone: 'ghost', size: 30, alpha: 0.6 });
    }));
  });

  // the answers in the desk slot: Luna lands, then Biscuit replaces it as the second chat answers
  [ansA, ansB].forEach((a) => {
    if (t < a.fly) return;
    const x = slotL + M.tileW(a.s) / 2;
    if (t < a.land) {
      const src = tryXY(a.from);
      M.fly(a.s, src.x, src.y, x, y2, (t - a.fly) / M.motion.land, { bend: -140, trail: 0.6 });
      return;
    }
    const gone = io(t, a.out, 0.45, 'in');
    if (gone >= 1) return;
    const s = io(t, a.land + 0.6, 0.5);
    if (gone > 0) M.tile(a.s, x, y2 + 40 * gone, { alpha: 1 - gone, rot: -0.06 * gone });
    else glowTile(a.s, x, y2, 'plain', 1 - s);
  });

  // ---- [[twice]]: same question, two answers (both from the tries above) ----
  const answerStroke = K.mixColor(C.line2, C.gold, io(t, tDifferent, 0.5));
  [[tTwice + 0.35, 'Luna.', 190], [tQuestion - 0.1, 'Biscuit.', 470]].forEach(([t0, ans, y]) => {
    const k = io(t, t0, 0.6); if (k <= 0.01) return;
    K.layer(k, () => K.at(0, (1 - k) * 30, () => {
      M.chat(t, 1420, y, 400, 262, [
        { s: 'Write a name for my cat:', who: 'you', k: io(t, t0 + 0.15, 0.4) },
        { s: ans, who: 'ai', k: io(t, t0 + 0.55, 0.4), stroke: answerStroke },
      ]);
    }));
  });
});
