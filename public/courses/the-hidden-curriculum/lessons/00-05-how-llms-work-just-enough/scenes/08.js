/* 08 — Put the facts on the desk
   The desk comes back from 07's small bottom band to its standard place (M.DESK) carrying 06's guessed citation
   ("Source: Smith (2019) p. 42", the model's calm guesses, at 0.5). Then real things are put on it:
   - eyebrow PUT THE FACTS ON THE DESK (until [[ignore]] brings its own card).
   - [[facts]] "Paste the exact error": the error card (M.alert calm, mono 28, 07's invented package) slides in
     along row 0 and pushes the guessed tiles off the desk's left edge (they tip and fall). "attach the file":
     app.py lands beside it. "share the docs": a docs tile. "Same model": the facts dim back (as if absent);
     "same question": the question's tiles on row 2 and, without the facts, 07's guess 'pip install fastjsonx'
     (terracotta). "with the real file": the facts come back, the file warms, the guess is struck out and falls
     away; "answer": a gold 'import json' tile flies into its slot; "fits": a gold check.
   - [[sources]] the desk's contents step back (0.5); a chat window (left) asks "Where is that from?", the reply
     streams; "open the source": an arrow to a small browser window (right, docs.example.org).
   - [[verify]] the chat and source leave; three specimens (invented on purpose, as in 06/07) line up in the band
     between the eyebrow and the desk top (y 330, clear of the legs and the caption band) on "every specific";
     checking gives a verdict on its word: "package" = terracotta cross, struck tile and "doesn't exist" (07's fake
     package); "path", "version" = gold checks.
   - [[ignore]] the specimens leave with the eyebrow, the desk steps back to 0.4; a card "SAFE TO IGNORE FOR
     NOW" takes the same band, with three cream pills (gold hairline) on their words; they stay readable.
   - "AI is the lantern": everything fades, the desk shrinks into one point, and a single lit lantern hangs over a
     faint street; [[lantern-line]] "it lights every district," then "but it doesn't walk the streets for you"
     (same 36 px serif, the second half gold), with a slow 3% push-in to carry the hold.
   No overshoot in this scene. Pure function of t. */
SCENE('08', (t, S) => {
  const C = K.C;

  // ---- times (local), each with the measured fallback
  const cue = (n, fb) => S.cue(n, fb);
  const w = (re, fb, nth = 0) => S.find(re, nth, fb);
  const tSrc = cue('sources', 12.11), tVer = cue('verify', 15.27), tIgn = cue('ignore', 21.05), tLine = cue('lantern-line', 27.85);
  const tPaste = w(/^paste/i, 2.26), tAttach = w(/^attach/i, 3.83), tShare = w(/^share/i, 5.26);
  const tSame = w(/^same/i, 6.77), tSame2 = w(/^same/i, 7.48, 1);
  const tReal = w(/^real/i, 8.86), tAnswer = w(/^answer/i, 10.40), tFits = w(/^fits/i, 10.85);
  const tFrom = w(/^from/i, 13.47), tOpen = w(/^open/i, 14.20);
  const tEvery = w(/^every/i, 15.74), tPkg = w(/^package/i, 18.25), tPath = w(/^path/i, 19.03), tVersion = w(/^version/i, 19.81);
  const tTransf = w(/^transformers/i, 22.85), tAttn = w(/^attention/i, 23.73), tMath = w(/^math/i, 24.64);
  const tAI = w(/^AI$/i, 26.18), tLantern = w(/^lantern/i, 26.94), tBut = w(/^but$/i, 29.45);

  K.bg();

  // ---- exit: everything on and around the desk fades as "AI is the lantern" begins; the desk shrinks to a point
  const gone = K.io(t, tAI - 0.15, 0.5);            // contents out
  const shrink = K.io(t, tAI + 0.05, 0.8);          // desk rect -> a point where the lantern will hang
  const all = 1 - gone;
  const ign = K.io(t, tIgn - 0.1, 0.5);             // [[ignore]]: the desk and its specifics step back to 0.3

  // ---- eyebrow (until the ignore card brings its own)
  M.eyebrow('Put the facts on the desk', { alpha: K.io(t, 0.25, 0.5) * (1 - K.io(t, tIgn - 0.35, 0.4)) });

  // ---- the desk: 07's small band -> standard, at the very start (rows 1 -> 3)
  const back = K.io(t, -0.05, M.motion.morph);
  const POINT = { x: 960 - 60, y: 455, w: 120, h: 30 };
  const R = M.lerpRect(M.lerpRect(M.layout.small, M.DESK, back), POINT, shrink);
  const rows3 = back >= 0.5;
  M.desk(t, R, {
    rows: rows3 ? 3 : 1,
    grooves: (rows3 ? (back - 0.5) * 2 : 1 - back * 2) * (1 - shrink),
    // 07 leaves its small desk at 0.9; it steps back to 0.4 for [[ignore]]
    alpha: K.lerp(0.9, 1, back) * (1 - K.io(t, tAI + 0.35, 0.5)) * (1 - 0.6 * ign * (1 - shrink)),
  });

  // as the desk shrinks it turns into light where the lantern will hang
  if (shrink > 0) K.glow(960, 450, 90 + 120 * shrink, C.head, 0.22 * shrink);

  // fixed positions on the standard desk (contents only show once the desk is back)
  const X0 = M.rowX0(M.DESK), EDGE = M.DESK.x, Y0 = M.rowY(M.DESK, 0), Y2 = M.rowY(M.DESK, 2);
  const dimC = (1 - 0.5 * K.io(t, tSrc - 0.2, 0.6)) * (1 - 0.4 * ign);  // 1 -> 0.5 (sources) -> 0.3 (ignore)

  // ---- 06's guessed citation, pushed off the left edge by the pasted error
  const GUESS = ['Source:', 'Smith', '(2019)', 'p. 42'];
  const GP = M.flow(GUESS, X0);
  const gRight = GP[GP.length - 1].x + GP[GP.length - 1].w / 2;
  const ERR = "ModuleNotFoundError: No module named 'fastjsonx'";
  const CARD_W = Math.ceil(92 + K.measure(ERR, { font: 'mono', size: 28, weight: 600 }) + 36);
  const CARD_FROM = 960, CARD_D = 0.9;
  const cardX = (tt) => K.lerp(CARD_FROM, X0, K.io(tt, tPaste - 0.05, CARD_D));
  const push = (tt) => Math.max(0, gRight + 14 - cardX(tt));
  // when tile i's centre passes the edge (bisection on the eased push; deterministic)
  const crossAt = (xi) => {
    const need = xi - EDGE, a0 = tPaste - 0.05, a1 = a0 + CARD_D;
    if (push(a1) < need) return Infinity;
    let lo = a0, hi = a1;
    for (let k = 0; k < 28; k++) { const m = (lo + hi) / 2; if (push(m) >= need) hi = m; else lo = m; }
    return hi;
  };
  // "Same model, same question": the facts step back as if absent, then return "with the real file on the desk"
  const absent = K.io(t, tSame - 0.1, 0.4) * (1 - K.io(t, tReal - 0.25, 0.45));   // back on "real file"
  const factsA = 1 - 0.7 * absent;
  K.layer(all * dimC, () => {
    const gIn = K.io(t, 0.55, 0.5);
    GP.forEach((p, i) => {
      const tc = crossAt(p.x), dt = Math.max(0, t - tc);
      if (dt > 0.6) return;
      const x = p.x - push(t) - 70 * dt, y = Y0 + 1500 * dt * dt;
      M.tile(p.s, x, y, { tone: i ? 'hot' : 'plain', glow: 0.2, alpha: 0.5 * gIn * (1 - K.clamp(dt / 0.6)), rot: -1.6 * dt });
    });

    K.layer(factsA, () => {
      // the pasted error (row 0): slides in from the right and stops at the row's left
      const ek = K.io(t, tPaste - 0.05, 0.35);
      M.alert(cardX(t), Y0 - 50, CARD_W, ERR, { size: 28, calm: true, k: ek });

      // the attached file and the shared docs, right of the error card
      const FX = 1350, DX = 1550;
      const fk = K.io(t, tAttach, 0.5), fx = FX + 90 * (1 - fk);
      const warm = K.io(t, tReal, 0.5) * (1 - 0.6 * K.io(t, tReal + 1.2, 0.8));
      if (warm > 0) K.glow(FX, 520, 130, C.head, 0.4 * warm);
      if (fk > 0) K.file(fx, 518, 118, { ext: 'py', name: 'app.py', nameSize: 26, alpha: fk });
      const dk = K.io(t, tShare, 0.5), dx = DX + 90 * (1 - dk);
      if (dk > 0) K.layer(dk, () => {
        K.iconTile('book', dx, 512, 104);
        K.text('docs', dx, 610, { font: 'ui', size: 26, weight: 600, color: C.body, align: 'center' });
      });
    });

    // same question (row 2): first the facts-free guess (07's fake package), struck out; then the answer that fits
    const Q = ['why', 'does', 'it', 'fail?'];
    M.row(t, Q, X0, Y2, { k: (i) => K.stagger(t, tSame2 - 0.1, i, 0.08, 0.45) });
    const GUESS2 = 'pip install fastjsonx', ANS = 'import json';
    const gp = M.flow([...Q, GUESS2], X0)[Q.length];
    const gk = K.io(t, tSame2 + 0.25, 0.4), strike = K.io(t, tReal - 0.05, 0.35), gOut = K.io(t, tReal + 0.55, 0.5);
    if (gk > 0 && gOut < 1) {
      const gy = Y2 + (1 - gk) * 10 + 60 * gOut * gOut;
      M.tile(GUESS2, gp.x, gy, { tone: 'wrong', alpha: 0.85 * gk * (1 - gOut), rot: -0.12 * gOut });
      if (strike > 0) K.line(gp.x - gp.w / 2 + 14, gy, gp.x - gp.w / 2 + 14 + (gp.w - 28) * strike, gy,
        { color: C.accent, w: 4, alpha: 1 - gOut });
    }
    const ap = M.flow([...Q, ANS], X0)[Q.length], u = K.seg(t, tAnswer - 0.25, tAnswer + 0.2);
    if (u > 0 && u < 1) M.fly(ANS, 1380, 300, ap.x, Y2, u, { trail: 0.6 });
    else if (u >= 1) M.tile(ANS, ap.x, Y2 + K.wave(t, M.motion.bob.speed, M.motion.bob.amp), { tone: 'hot' });
    const ck = K.io(t, tFits, 0.4);
    if (ck > 0) K.icon('check', ap.x + ap.w / 2 + 44, Y2, 36 * (0.7 + 0.3 * ck), { color: C.head, alpha: ck, w: 4 });
  });

  // ---- [[sources]] a chat (left) and the source itself (right), either side of the eyebrow
  const upper = all * (1 - K.io(t, tVer - 0.1, 0.45));   // gone before the specimens take their band
  const chatK = K.io(t, tSrc - 0.05, 0.5);
  if (chatK > 0 && upper > 0) {
    const CX = 160, CY = 160, CW = 560, CH = 236, SX = 1200;   // both clear the eyebrow (x 776-1144)
    K.layer(upper, () => K.at(0, (1 - chatK) * 20, () => {
      M.chat(t, CX, CY, CW, CH, [
        { s: 'Where is that from?', who: 'you', k: K.io(t, tSrc + 0.1, 0.4) },
        { s: 'From the install guide.', who: 'ai', k: K.io(t, tFrom - 0.1, 0.35), stream: tFrom, step: 0.2 },
      ], { alpha: chatK });
    }));
    const ay = CY + 50 + 16 + (30 * 1.3 + 24 + 12) + (30 * 1.3 + 24) / 2;   // centre of the reply bubble
    K.layer(upper, () => {
      K.arrow(CX + CW + 14, ay, SX - 14, ay, { k: K.io(t, tOpen, 0.45), color: C.soft, w: 3 });
      const sk = K.io(t, tOpen + 0.3, 0.5);
      if (sk > 0) K.layer(sk, () => K.at(0, (1 - sk) * 16, () => {
        const r = K.win(SX, CY, 560, CH, { kind: 'browser', title: 'source', titleSize: 26, url: 'docs.example.org' });
        K.text('Install guide', r.x + 28, r.y + 44, { font: 'ui', size: 30, weight: 600, color: C.strong });
        K.line(r.x + 28, r.y + 76, r.x + r.w - 60, r.y + 76, { color: C.line2, w: 8 });
        K.line(r.x + 28, r.y + 102, r.x + r.w - 180, r.y + 102, { color: C.line2, w: 8 });
      }));
    });
  }

  // ---- [[verify]] three specifics in the band above the desk; checking each gives a verdict on its word
  const SPEC = [['fastjsonx', tPkg, false], ['C:\\project\\config.yaml', tPath, true], ['v4.2.1', tVersion, true]];
  const TAG = "doesn't exist", tagF = { font: 'ui', size: 26, weight: 600 };
  const tagW = K.measure(TAG, tagF);
  const ICON_GAP = 20, ICON = 40, GAPX = 90, SY = 330;
  const items = SPEC.map(([s, , ok]) => {
    const tw = M.tileW(s);
    return { tw, w: tw + ICON_GAP + ICON + (ok ? 0 : 12 + tagW) };
  });
  let sx = 960 - (items.reduce((a, b) => a + b.w, 0) + GAPX * (items.length - 1)) / 2;
  K.layer(all * (1 - K.io(t, tIgn - 0.35, 0.4)), () => SPEC.forEach(([s, tw0, ok], i) => {
    const it = items[i], px = sx + it.tw / 2;
    sx += it.w + GAPX;
    const k = K.stagger(t, tEvery - 0.1, i, 0.15, 0.5);
    if (k <= 0) return;
    const y = SY + (1 - k) * 10, c = K.io(t, tw0, 0.4);
    const ix = px + it.tw / 2 + ICON_GAP + ICON / 2;
    if (ok) {
      M.tile(s, px, y, { alpha: k });
      if (c > 0) K.icon('check', ix, SY, ICON * (0.7 + 0.3 * c), { color: C.head, alpha: c, w: 4 });
    } else {
      M.tile(s, px, y, { alpha: k * (1 - c) });
      if (c > 0) {
        M.tile(s, px, y, { tone: 'wrong', alpha: k * c });
        K.line(px - it.tw / 2 + 12, y, px - it.tw / 2 + 12 + (it.tw - 24) * c, y, { color: C.accent, w: 4, alpha: c });
        K.icon('cross', ix, SY, ICON * (0.7 + 0.3 * c), { color: C.accent, alpha: c, w: 4 });
        K.text(TAG, ix + ICON / 2 + 12, SY + 9, { ...tagF, color: C.accent, alpha: K.io(t, tw0 + 0.15, 0.4) });
      }
    }
  }));

  // ---- [[ignore]] a card of things to skip for now: cream pills with a gold hairline, only the box is dim
  const ik = ign * all;
  if (ik > 0) K.layer(ik, () => K.at(0, (1 - ign) * 14, () => {
    K.card(560, 180, 800, 150, { fill: K.rgba(C.tile, 0.6), stroke: C.line, shadow: false });
    K.eyebrow('Safe to ignore for now', 960, 226, { size: 20, align: 'center' });
    const P = [['transformers', tTransf], ['attention', tAttn], ['training math', tMath]];
    const pf = { font: 'ui', size: 26, weight: 600 };
    const ws = P.map((p) => K.measure(p[0], pf) + 26 * 1.6), gap = 28;
    let x = 960 - (ws.reduce((a, b) => a + b, 0) + gap * (P.length - 1)) / 2;
    P.forEach((p, i) => {
      const a = K.io(t, p[1] - 0.1, 0.4), px = x + ws[i] / 2;
      if (a > 0) K.at(0, (1 - a) * 8, () =>
        K.pill(p[0], px, 284, { size: 26, color: C.strong, stroke: K.rgba(C.gold, 0.75), fill: C.page, alpha: a }));
      x += ws[i] + gap;
    });
  }));

  // ---- the lantern: one lit lantern over a faint street, and the course line (slow 3% push-in to carry the hold)
  const lk = K.io(t, tLantern - 0.25, 0.7);
  if (lk > 0) {
    const zoom = 1 + 0.03 * K.io(t, tLantern, 5.5, 'sine');
    K.at(960, 560, zoom, 0, () => K.at(-960, -560, () => {
      K.eyebrow('AI is the lantern', 960, 300, { size: 20, align: 'center', alpha: K.io(t, tAI + 0.1, 0.5) });
      K.glow(960, 610, 420, C.head, 0.08 * lk);
      K.line(560, 610, 1360, 610, { color: C.line2, w: 2, alpha: 0.7 * lk, k: K.io(t, tLantern - 0.1, 0.7) });
      K.line(960, 336, 960, 396, { color: C.gold, w: 2, alpha: 0.5 * lk, k: lk });   // its cord: it hangs, it doesn't walk
      K.map.lantern(t, 2, { x: 960, y: 410, lit: lk, glowK: 1.8, s: 2.2, alpha: lk, sway: 1 });
      const lf = { font: 'read', size: 36, align: 'center' };
      K.rise(t, tLine - 0.05, () => K.text('it lights every district,', 960, 704, { ...lf, color: C.strong }), 14);
      K.rise(t, tBut - 0.05, () => K.spans([
        { s: 'but it ', color: C.strong },
        { s: "doesn't walk the streets for you", color: C.head },
      ], 960, 764, lf), 12);
    }));
  }
});
