/* 00.04 scene 07: The surprises you'll hit.
   The car (small, left) is the anchor: a gold pin, a part glow and a "you're talking to the [layer]" tag say which
   layer each surprise is about (card 2: the API talks to the engine directly; the memory stays in the app). Four cards fill a 2 x 2 grid on the right, each on its cue; earlier cards dim. */
SCENE('07', (t, S) => {
  const C = K.C;
  K.bg();

  // ---------------------------------------------------------------- timing
  const A = [S.cue('different', 2.24), S.cue('api-memory', 11.66), S.cue('allow', 18.03), S.cue('which-model', 25.22)];
  const f = (w, n, fb) => S.find(w, n, fb);
  const NEXT = (i) => (i < 3 ? A[i + 1] : Infinity);
  const END = Math.max(A[3] + 7, S.dur - 0.5);           // exit: every card settles at 0.8
  const active = (i) => K.io(t, A[i], 0.5) * (1 - K.io(t, NEXT(i), 0.5));

  // ---------------------------------------------------------------- the anchor car
  const P = M.layout.small, bob = K.wave(t, M.motion.bob.speed, 2);
  const cx = P.x, cy = P.y + bob, cs = P.s;
  const wBody = Math.max(active(0), active(3));
  const wEngine = active(1);
  const wYou = K.io(t, f('passenger', 0, 21.69), 0.5) * (1 - K.io(t, A[3], 0.5));
  const termLit = t >= f('command', 0, 20.27) && t < A[3];
  K.layer(K.io(t, -0.6, 0.6), () => {
    M.car(t, cx, cy, cs, {
      head: 1, wheel: 1, passenger: 1, youGlow: wYou, bodyGlow: wBody,
      engine: { glow: wEngine },
      rack: { tools: 1, lit: termLit ? [1] : [] },
    });
  });
  K.eyebrow('The surprises', P.x, 160, { align: 'center', alpha: K.io(t, -0.6, 0.6) });

  // pin: drops onto the car body at [[different]], then moves part to part (0.7 s eased)
  const PIN = [
    M.pt(cx, cy, cs, 'side'),
    { x: M.slot(cx, cy, cs).x, y: M.slot(cx, cy, cs).y - 70 * 0.56 * cs },
    { x: M.pt(cx, cy, cs, 'passenger').x, y: M.pt(cx, cy, cs, 'passenger').y + 14 },
    M.pt(cx, cy, cs, 'side'),
  ];
  let pin = PIN[0];
  for (let i = 1; i < 4; i++) {
    const k = K.io(t, A[i], M.motion.move);
    if (k > 0) pin = { x: K.lerp(pin.x, PIN[i].x, k), y: K.lerp(pin.y, PIN[i].y, k) };
  }
  const pinK = K.io(t, A[0], 0.6, 'out');
  if (pinK > 0) {
    const ps = 34, drop = (1 - pinK) * 30;
    K.glow(pin.x, pin.y - 14, 46, C.head, 0.35 * pinK);
    K.icon('pin', pin.x, pin.y - 0.38 * ps - drop, ps, { color: C.head, alpha: pinK });
  }

  // "you're talking to the [layer]" under the car (same pattern on all four cards)
  const LAYERS = ['app', 'model', 'agent', 'app'];
  const tagY = 724, lk = K.io(t, A[0], 0.5);
  if (lk > 0) {
    K.text("you're talking to the", P.x - 4, tagY + 9, { font: 'ui', size: 26, color: C.soft, align: 'right', alpha: lk });
    LAYERS.forEach((name, i) => {
      const a = i === 0 ? 1 - K.io(t, A[1], 0.4) : K.io(t, A[i], 0.4) * (i < 3 ? 1 - K.io(t, A[i + 1], 0.4) : 1);
      if (i === 3 && t < A[3]) return;
      if (a <= 0.01) return;
      const w = K.measure(name, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
      M.tag(name, P.x + 6 + w / 2, tagY, { alpha: a * lk });
    });
  }

  // ---------------------------------------------------------------- the 2 x 2 grid
  const CW = 545, CH = 360;
  const GRID = [{ x: 720, y: 165 }, { x: 1295, y: 165 }, { x: 720, y: 550 }, { x: 1295, y: 550 }];
  const CAPS = ['Same question, two apps', "The API can't see your chats", 'It asks first', 'Which model is this?'];

  const header = (i, x, y) => {
    const g = K.ctx();
    g.save(); g.strokeStyle = C.gold; g.lineWidth = 2; g.beginPath(); g.arc(x + 46, y + 50, 22, 0, Math.PI * 2); g.stroke(); g.restore();
    K.text(String(i + 1), x + 46, y + 59, { font: 'mono', weight: 600, size: 26, color: C.head, align: 'center' });
    K.text(CAPS[i], x + 84, y + 61, { font: 'ui', weight: 600, size: 30, color: C.head });
  };
  // a small app window without the K.win buttons (too narrow for them): bar + title
  const miniWin = (x, y, w, h, title) => {
    const g = K.ctx();
    K.card(x, y, w, h, { r: 12, fill: C.code, stroke: C.line2, shadow: false });
    g.save(); K.rr(x, y, w, h, 12); g.clip(); g.fillStyle = C.tile; g.fillRect(x, y, w, 42); g.restore();
    K.line(x, y + 42, x + w, y + 42, { color: C.line, w: 1.5 });
    K.text(title, x + 16, y + 30, { font: 'ui', weight: 600, size: 26, color: C.body });
    return { x, y: y + 42, w, h: h - 42 };
  };
  const bubble = (s, x, y, o = {}) => {
    const fnt = { font: 'ui', size: 26 }, full = o.full || s;
    const bw = K.measure(full, fnt) + 32, bh = 46, bx = o.right ? x - bw : x;
    K.card(bx, y, bw, bh, { r: 18, shadow: false, lw: 1.5, fill: o.you ? K.rgba(C.head, 0.14) : C.tile, stroke: o.you ? K.rgba(C.head, 0.55) : C.line2, alpha: o.alpha });
    K.text(s, bx + 16, y + 32, { ...fnt, color: o.you ? C.strong : C.body, alpha: o.alpha });
    return { x: bx, y, w: bw, h: bh };
  };

  // card 1: same question, two apps -> two answers
  const card1 = (x, y) => {
    const qk = K.io(t, f('same', 0, 3.1), 0.4), wk = K.io(t, f('two', 0, 2.54), 0.5);
    const q = 'Name a first project?', qw = K.measure(q, { font: 'ui', size: 26 }) + 32;
    K.layer(qk, () => bubble(q, x + CW / 2 - qw / 2, y + 92, { you: true }));
    const ak = K.io(t, f('same', 0, 3.1) + 0.3, 0.5);
    const W1 = { x: x + 24, y: y + 176, w: 240, h: 106 }, W2 = { x: x + 281, y: y + 176, w: 240, h: 106 };
    K.arrow(x + CW / 2 - 30, y + 142, W1.x + 140, W1.y - 8, { k: ak, color: C.soft, w: 2, bend: 10, headSize: 12 });
    K.arrow(x + CW / 2 + 30, y + 142, W2.x + 100, W2.y - 8, { k: ak, color: C.soft, w: 2, bend: -10, headSize: 12 });
    const ra = f('different', 0, 4.62), rr = f('randomness', 0, 9.84), eng = f('engine', 0, 8.56);
    [W1, W2].forEach((W, j) => K.layer(wk, () => K.at(0, (1 - wk) * 10, 1, 0, () => {
      const cr = miniWin(W.x, W.y, W.w, W.h, j ? 'app 2' : 'app 1');
      // the engine under each app's hood (tiny); app 2's is sometimes a different one
      const ex = W.x + W.w - 34, ey = W.y + 21, swap = j ? K.io(t, eng, 0.6) : 0;
      M.engine(t, ex, ey, 0.17, { shadow: false, alpha: 1 - swap });
      if (swap > 0) M.engine(t, ex, ey, 0.17, { shadow: false, alt: true, alpha: swap });
      // the reply; app 1 answers again on "randomness" and says something else
      let s = j ? 'A website' : 'A to-do app', at = ra + 0.1 + j * 0.25;
      if (!j && t >= rr) { s = 'A recipe site'; at = rr + 0.15; }
      const typed = K.typed(s, t, at, 26);
      if (t >= at) bubble(typed, cr.x + 14, cr.y + 10, { full: s });
    })));
    // the hidden instructions differ per app
    const hk = f('hidden', 0, 6.38);
    M.tag('instructions A', W1.x + W1.w / 2, y + 322, { stroke: C.gold, color: C.head, alpha: K.io(t, hk, 0.5) });
    M.tag('instructions B', W2.x + W2.w / 2, y + 322, { stroke: C.soft, color: C.strong, alpha: K.io(t, hk + 0.2, 0.5) });
  };

  // card 2: a program calling the API sees none of your chats
  const card2 = (x, y) => {
    const pk = K.io(t, f('program', 0, 11.83), 0.5);
    K.layer(pk, () => K.win(x + 228, y + 96, 293, 190, { kind: 'code', title: 'script', titleSize: 26, shadow: false }));
    const ck = K.io(t, f('calling', 0, 12.29), 0.5), nk = K.io(t, f('nothing', 0, 13.73), 0.5);
    const rx = x + 228 + 28, ry = y + 146;
    K.icon('key', rx + 18, ry + 40, 40, { color: C.head, alpha: ck * pk });
    K.text('API key', rx + 50, ry + 49, { font: 'mono', weight: 600, size: 26, color: C.body, alpha: ck * pk });
    K.spans([{ s: 'history: ', color: C.strong }, { s: '[ ]', color: C.accent }], rx, ry + 104, { font: 'mono', weight: 600, size: 28, alpha: nk });
    // your saved chats, back in the app: the dashed line stops short of the program
    const sk = K.io(t, f('chats', 0, 14.64), 0.5), lk2 = K.seg(t, f('app', 1, 15.21) - 0.1, f('app', 1, 15.21) + 0.5);
    K.layer(sk, () => {
      const bx = x + 34, by = y + 112, g = K.ctx();
      g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.setLineDash([6, 6]); K.rr(bx, by, 140, 120, 16); g.stroke(); g.restore();
      [[150 - 50, 0.16, 0], [86, 0.1, 0], [94, 0.32, 1], [70, 0.16, 0]].forEach(([w, a, you], i) => {
        g.save(); g.fillStyle = K.rgba(you ? C.head : C.strong, a); K.rr(you ? bx + 140 - 16 - w : bx + 16, by + 16 + i * 24, w, 16, 8); g.fill(); g.restore();
      });
      K.text('saved chats', bx + 70, by + 160, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center' });
    });
    const x0 = x + 182, x1 = x + 214;
    K.line(x0, y + 172, K.lerp(x0, x1 - 14, 1), y + 172, { color: C.soft, w: 2.5, dash: [6, 6], k: lk2 });
    const xk = K.io(t, f('app', 1, 15.21) + 0.4, 0.4);
    if (xk > 0) {
      const g = K.ctx(), bx = x1 - 2, by = y + 172, R = 7;
      g.save(); g.strokeStyle = C.accent; g.lineWidth = 3.5; g.lineCap = 'round'; g.globalAlpha *= xk;
      g.beginPath(); g.moveTo(bx - R, by - R); g.lineTo(bx + R, by + R); g.moveTo(bx + R, by - R); g.lineTo(bx - R, by + R); g.stroke(); g.restore();
    }
    M.tag('same engine, different door', x + CW / 2, y + 322, { stroke: C.gold, color: C.head, alpha: K.io(t, f('Same', 1, 15.95), 0.5) });
  };

  // card 3: the agent asks before it acts
  const card3 = (x, y) => {
    const dk = K.io(t, f(/^asks/i, 0, 19.09) - 0.15, 0.5);
    if (dk <= 0) return;
    const r = M.ask(t, x + 28, y + 90, { w: CW - 56, title: 'agent', q: 'Allow this command?', cmd: 'npm test', alpha: dk });
    const mk = K.io(t, f('Read', 0, 23.14), 0.6);
    const cw = K.measure('npm test', { font: 'mono', weight: 600, size: 26 });
    K.mark(r.cmdX - 4, r.cmdY + 12, cw + 8, mk, { w: 5 });
  };

  // card 4: which model? the picker knows; the model's own answer doesn't
  const card4 = (x, y) => {
    const pk = K.io(t, A[3] + 0.4, 0.5);
    const open = K.io(t, f('picker', 0, 28.29), 0.5) * (1 - K.io(t, f("Don't", 0, 30.8), 0.4));
    const glow = K.io(t, f('choose', 0, 29.56), 0.5);
    M.picker('Auto', x + 120, y + 128, { alpha: pk, open, options: ['Model A', 'Model B', 'Model C'], glow: glow });
    const ask = f(/^ask$/i, 1, 31.08), ans = f('answer', 0, 32.22), rel = f('reliable', 0, 33.43);
    const ck = K.io(t, ask - 0.3, 0.5);
    if (ck > 0) {
      const cr = M.chat(t, x + 230, y + 90, 291, 252, [
        { s: 'Which model are you?', who: 'you', at: ask - 0.1, cps: 40 },
        { s: "I'm Model A", who: 'ai', k: K.io(t, ans, 0.4), at: ans, cps: 26 },
      ], { alpha: ck });
      const bw = K.measure("I'm Model A", { font: 'ui', size: 26 }) + 32;
      const qy = cr.y + 18 + (26 * 1.3 * 2 + 22) + 12 + 28;
      K.icon('question', cr.x + 18 + bw + 26, qy, 38, { color: C.accent, alpha: K.io(t, ans + 0.5, 0.4) });
      const rk = K.io(t, rel, 0.5);
      // the verdict sits in the left column (the picker has closed by then), pointing at the reply
      K.pill('not reliable', x + 120, qy, { size: 26, stroke: C.accent, color: C.accent, alpha: rk, fill: C.tile });
    }
  };
  const CONTENT = [card1, card2, card3, card4];

  GRID.forEach((p, i) => {
    // empty slot, numbered, appears on "Four"
    const slotK = K.stagger(t, 0, i, 0.12, 0.5), on = K.io(t, A[i], 0.6, i === 2 ? 'back' : 'out');
    const onA = K.clamp(on);
    if (slotK > 0 && onA < 1) K.layer(slotK * (1 - onA) * 0.5, () => {
      const g = K.ctx();
      g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.setLineDash([8, 8]); K.rr(p.x, p.y, CW, CH, 24); g.stroke(); g.restore();
      K.text(String(i + 1), p.x + CW / 2, p.y + CH / 2 + 18, { font: 'mono', weight: 600, size: 48, color: C.soft, align: 'center' });
    });
    if (onA <= 0) return;
    const past = K.io(t, NEXT(i), 0.6), endK = K.io(t, END, 0.8);
    const alpha = K.lerp(K.lerp(1, 0.45, past), 0.8, endK);
    const act = active(i) * (1 - endK);
    const sc = 0.94 + 0.06 * on, rise = (1 - onA) * 14;
    K.layer(onA * alpha, () => K.at(p.x + CW / 2, p.y + CH / 2 + rise, sc, 0, () => K.at(-p.x - CW / 2, -p.y - CH / 2, 1, 0, () => {
      K.card(p.x, p.y, CW, CH, { r: 24, fill: C.tile, stroke: K.mixColor(C.line2, C.gold, act), glow: 0.3 * act, shadow: false });
      header(i, p.x, p.y);
      CONTENT[i](p.x, p.y);
    })));
  });
});
