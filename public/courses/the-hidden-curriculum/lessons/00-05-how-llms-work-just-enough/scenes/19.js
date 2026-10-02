// 19 — Myth or still true? Part two [guest] (June). The quiz table: myths 6–10 land, get stamped, flip to the true side,
// and each flips open a small picture from earlier in the lesson; at 'back' all ten cards gather into one stack and the guest leaves.
SCENE('19', (t, S) => {
  K.bg({ glow: 0.75 });
  const C = K.C;
  const f = (word, n, fb) => S.find(word, n || 0, fb);
  const cue = {
    m6: S.cue('myth-6', 1.23), m7: S.cue('myth-7', 16.09), m8: S.cue('myth-8', 26.62),
    m9: S.cue('myth-9', 34.91), m10: S.cue('myth-10', 42.62), back: S.cue('back', 50.26),
  };

  // guest tone: held at 1, eases back to 0 on 'back'
  const gk = 1 - K.io(t, cue.back + 0.6, 1.2);
  const tone = M.tone(gk);
  const gather = K.io(t, cue.back + 0.2, 1.1);

  // ------------------------------------------------------------ the quiz table (hall desk)
  const st = M.stage(t, {
    desk: 'hall', cx: 960, cy: 600, lit: 0.85, guest: gk,
    clerk: { s: 0.9, glow: 0 },
    lamp: {},
    ruler: false,
  });
  const D = st.D;

  // ------------------------------------------------------------ the five myths of this round
  const CX = 700, CY = 540, CW = 540, CH = 300; // current card on the desk (x 430..970, y 390..690)
  const myths = [
    { n: 6, at: cue.m6, front: 'Cached tokens are free.', verdict: 'WRONG',
      stamp: f('free.', 0, 3.94), flip: f('Writing', 0, 4.75),
      back: 'Writes cost extra. Reads are cheap, but they still fill the desk.' },
    { n: 7, at: cue.m7, front: 'I pay for Pro, so my chats aren’t used for training.', verdict: 'HALF TRUE',
      stamp: f('training.', 0, 20.22), flip: f('Consumer', 0, 21.18),
      back: 'Personal plans may be, unless you switch it off. Work plans aren’t, by default.' },
    { n: 8, at: cue.m8, front: 'My subscription can run any agent.', verdict: 'WRONG',
      stamp: f('agent.', 0, 29.5), flip: f(/^Not$/, 0, 30.26),
      back: 'Not on your plan’s usage since April 2026: billed separately.' },
    { n: 9, at: cue.m9, front: 'CLAUDE.md is a rule it must obey.', verdict: 'WRONG',
      stamp: f('obey.', 0, 38.28), flip: f(/^It's$/, 0, 38.99),
      back: 'It’s a note on the desk. Hooks and permissions are the locks.' },
    { n: 10, at: cue.m10, front: 'Sora is where AI video lives.', verdict: 'OUTDATED',
      stamp: f('lives.', 0, 45.59), flip: f('OpenAI', 0, 46.24),
      back: 'The Sora app closed in spring 2026. Other studios carry on.' },
  ];
  const ends = [cue.m7, cue.m8, cue.m9, cue.m10, cue.back];

  // ------------------------------------------------------------ the done pile (left edge)
  // 18 ends with five flipped cards; here they sit as a cascade at the desk's left edge, one strip per myth
  const FX = 300, FY0 = 408, FSTEP = 36, FW = 210, FH = 112;
  const slot = (n) => ({ x: FX, y: FY0 + (n - 1) * FSTEP });
  const STACK = { x: 960, y: 600 };
  const doneCard = (x, y, n, a, s) => {
    K.layer(a, () => K.at(x, y, s || 1, 0, () => {
      K.card(-FW / 2, -FH / 2, FW, FH, { r: 14, fill: M.mixHex(C.tile, C.head, 0.1), stroke: tone.accent, lw: 1.5, glow: 0.15, shadow: false });
      K.icon('check', -FW / 2 + 26, -FH / 2 + 18, 22, { color: tone.accent, w: 3 });
      K.text('MYTH ' + n, -FW / 2 + 48, -FH / 2 + 27, { font: 'mono', weight: 600, size: 26, color: C.strong });
    }));
  };
  // where a finished card is now: its slot, then the gather onto one stack
  const pilePos = (n) => {
    const s = slot(n), g = K.stagger(t, cue.back + 0.2, n - 1, 0.03, 0.9);
    return { x: K.lerp(s.x, STACK.x, g), y: K.lerp(s.y, STACK.y - (n - 1) * 3, g), g };
  };
  // a flipped myth card travelling from {x, y, s} into its place in the pile; it turns into the compact pile card on arrival
  const travel = (m, from, k, alpha) => {
    const p = pilePos(m.n);
    if (k < 1) {
      K.layer((alpha == null ? 1 : alpha) * (1 - K.clamp((k - 0.7) / 0.3)), () =>
        M.myth(t, K.lerp(from.x, p.x, k), K.lerp(from.y, p.y, k), { w: CW, h: CH, n: m.n, front: m.front, back: m.back, verdict: m.verdict,
          stamp: m.stampK == null ? 1 : m.stampK, flip: m.flipK == null ? 1 : m.flipK, s: K.lerp(from.s, FW / CW, k) }));
    }
    if (k > 0.7) doneCard(p.x, p.y, m.n, K.clamp((k - 0.7) / 0.3));
  };
  // cards 1-5 arrive from 18's exit row (x 560 + 200 i, y 420, s 0.43, true side up) and settle into the cascade
  const pileIn = K.io(t, -0.3, 1.2);
  const BACK18 = [
    'On the newest Claude models, setting it is an error. And 0 never guaranteed one answer.',
    'It re-reads a profile, searches old chats, or opens a file. Nothing lives inside the model.',
    'A fuller desk is a worse desk.',
    'Mostly, not all. Some image models build pictures piece by piece, like text.',
    'It writes code that draws, or it calls another model.',
  ];
  for (let n = 1; n <= 5; n++) travel({ n, front: '', back: BACK18[n - 1] }, { x: 560 + (n - 1) * 200, y: 420, s: 0.43 * 560 / CW }, pileIn);

  // ------------------------------------------------------------ illustrations (the true side, built from earlier scenes)
  const ill = (i) => K.env(t, myths[i].flip, ends[i], 0.5); // illustration alpha window
  const AX0 = 1030, AX1 = 1740; // illustration area x (desk), y 360..810

  // myth 6: the four meters, the write meter highlighted; the desk's ruler fills; a cold timer with a tea cup
  {
    const a = ill(0);
    if (a > 0) K.layer(a, () => {
      const tWrite = f('Writing', 0, 4.75), tRead = f('Reading', 0, 7.78), tFill = f('fill', 0, 10.03);
      const tCoffee = f('coffee', 0, 11.38), tRebuild = f('rebuilds', 0, 14.34);
      const xs = [1118, 1296, 1474, 1652], MY = 470, R = 58;
      const labels = ['input', 'cache write', 'cache read', 'output'];
      const k = [0.18, 0.18 + 0.18 * K.io(t, tWrite + 0.5, 0.7), 0.18 - 0.16 * K.io(t, tRead + 0.4, 0.7), 0.9];
      const hi = [0, K.env(t, tWrite + 0.3, tRead + 0.2, 0.4) + 0.8 * K.env(t, tRebuild, 99, 0.4), K.env(t, tRead + 0.3, tCoffee, 0.4), 0];
      xs.forEach((x, i) => {
        M.meter(t, x, MY, k[i], { r: R, lit: 0.35 + 0.65 * Math.max(hi[i], i === 1 ? 0.6 : 0), glow: hi[i] });
        K.text(labels[i], x, MY + 82, { font: 'ui', weight: 600, size: 26, color: hi[i] > 0.5 ? C.head : C.strong, align: 'center' });
      });
      K.pill('costs more', xs[1], MY - R - 52, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5), alpha: K.io(t, tWrite + 0.9, 0.5) });
      K.pill('cheap', xs[2], MY - R - 52 + 0, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5), alpha: K.io(t, tRead + 0.6, 0.5) * (1 - 0.0) });
      // cache timer runs out over the coffee break
      const tk = 1 - K.seg(t, tCoffee + 0.2, tCoffee + 2.4);
      const cold = K.io(t, tCoffee + 2.2, 0.6);
      const TX = 1200, TY = 690;
      M.timer(t, TX, TY, tk, { r: 50, cold, alpha: K.io(t, tCoffee - 0.2, 0.5) });
      K.icon('tea', TX - 108, TY + 6, 60, { color: C.soft, w: 3, alpha: K.io(t, tCoffee, 0.5) });
      K.text('rebuilds from scratch', 1600, TY + 10, { font: 'ui', weight: 600, size: 26, color: M.palette.cold, align: 'center', alpha: K.io(t, tRebuild, 0.5) });
      K.arrow(1290, TY, 1440, TY, { k: K.io(t, tRebuild - 0.2, 0.5), color: M.palette.cold, w: 3 });
      // the desk's own ruler: cached tokens still fill it
      M.ruler(t, D, { fill: 0.6 * K.io(t, tFill - 0.2, 1.2), alpha: K.io(t, tFill - 0.4, 0.5) });
    });
  }

  // a two-state switch: on = gold knob right, off = grey knob left
  const toggle = (x, y, on, a) => {
    const w = 84, h = 44, col = M.mixHex(C.line2, C.head, on);
    K.layer(a, () => {
      K.card(x - w / 2, y - h / 2, w, h, { r: h / 2, fill: K.rgba(col, 0.25 + 0.2 * on), stroke: col, lw: 2, shadow: false });
      const kx = K.lerp(x - w / 2 + h / 2, x + w / 2 - h / 2, on);
      K.card(kx - 16, y - 16, 32, 32, { r: 16, fill: on > 0.5 ? C.head : C.soft, stroke: false, shadow: false });
    });
  };

  // myth 7: personal room vs work room, each with its training switch
  {
    const a = ill(1);
    if (a > 0) K.layer(a, () => {
      const tCons = f('Consumer', 0, 21.18), tOff = f('off.', 0, 23.62), tWork = f('Work', 0, 24.31);
      const rl = K.io(t, tCons - 0.1, 0.5), rr = K.io(t, tWork - 0.1, 0.5);
      M.room(t, 1035, 370, 340, 300, { label: 'Personal', tag: 'Free · Pro · Max', lit: 0.4 + 0.6 * rl * (1 - 0.5 * rr), deskS: 0.4, alpha: 0.35 + 0.65 * rl });
      M.room(t, 1395, 370, 340, 300, { label: 'Work', tag: 'Team · Enterprise', lit: 0.3 + 0.7 * rr, deskS: 0.4, alpha: 0.35 + 0.65 * rr });
      // personal: on by default, you switch it off
      const homeOn = 1 - K.io(t, tOff - 0.2, 0.5);
      toggle(1095, 730, homeOn, rl);
      K.text('trains on chats', 1150, 739, { font: 'ui', weight: 600, size: 26, color: C.strong, alpha: rl });
      K.text(homeOn > 0.5 ? 'on unless you switch it off' : 'switched off', 1205, 800, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: rl });
      toggle(1455, 730, 0, rr);
      K.text('trains on chats', 1510, 739, { font: 'ui', weight: 600, size: 26, color: C.strong, alpha: rr });
      K.text('off by default', 1565, 800, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: rr });
    });
  }

  // myth 8: an outside agent tries the plan's plug; blocked; rerouted to its own bill
  {
    const a = ill(2);
    if (a > 0) K.layer(a, () => {
      const tNot = f(/^Not$/, 0, 30.26), tApr = f('April.', 0, 32.3), tBill = f('billed', 0, 33.58);
      const AX = 1130, AY = 470, PX = 1580, PY = 470;
      K.iconTile('terminal', AX, AY, 110, { alpha: K.io(t, tNot - 0.6, 0.5) });
      K.text('outside agent', AX, AY + 100, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: K.io(t, tNot - 0.6, 0.5) });
      M.mini(t, PX, PY + 30, 0.42, { lit: 0.8, alpha: K.io(t, tNot - 0.6, 0.5) });
      K.text('your plan’s usage', PX, PY + 130, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: K.io(t, tNot - 0.6, 0.5) });
      // the plug line, stopped halfway by a cross
      const pk = K.io(t, tNot - 0.3, 0.6);
      M.phone(t, AX + 70, AY, 1355, AY, { k: pk, color: tone.accent });
      const xk = K.io(t, tNot + 0.3, 0.5, 'back');
      if (xk > 0) K.at(1385, AY, xk, 0, () => K.icon('cross', 0, 0, 48, { color: C.accent, w: 5 }));
      // reroute: down to its own bill
      const bk = K.io(t, tBill - 0.3, 0.6);
      M.phone(t, AX, AY + 120, AX + 120, 720, { k: bk, color: tone.accent, bend: 40, head: true });
      K.layer(K.io(t, tBill, 0.5), () => {
        K.card(1270, 680, 420, 90, { r: 18, fill: C.tile, stroke: tone.accent, lw: 2, glow: 0.3 });
        K.text('billed separately', 1480, 718, { font: 'ui', weight: 700, size: 30, color: C.strong, align: 'center' });
        K.text('API key · pay as you go', 1480, 754, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center' });
      });
      // dark pill behind the stamp so it reads on the guest's bright vignette
      const da = K.io(t, tApr, 0.5), dw = K.measure('since Apr 2026', { font: 'mono', size: 22, weight: 600 }) + 18;
      K.card(84, 146, dw + 32, 38, { r: 19, fill: K.rgba(C.ink, 0.55), stroke: false, shadow: false, alpha: da });
      M.dated('since Apr 2026', 100, 172, { alpha: da });
    });
  }

  // myth 9: the pinned note vs the padlock
  {
    const a = ill(3);
    if (a > 0) K.layer(a, () => {
      const tNote = f('note', 0, 39.31), tHooks = f('Hooks', 0, 40.59), tLocks = f('locks.', 0, 41.87);
      const nl = M.land(t, tNote - 0.3, 1180, 540, 1180, 900);
      M.paper(nl.x, nl.y, { w: 270, h: 190, kind: 'note', title: 'CLAUDE.md', lines: 4, pinned: true, rot: -0.03, alpha: nl.a });
      K.text('a note asks', 1180, 690, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: K.io(t, tNote + 0.3, 0.5) });
      const lk = K.io(t, tHooks - 0.1, 0.6, 'back');
      if (lk > 0) K.layer(Math.min(1, lk), () => {
        K.glow(1580, 520, 110, C.head, 0.18);
        K.icon('lock', 1580, 520 - (1 - lk) * 60, 120, { color: C.head, w: 5 });
      });
      K.text('hooks · permissions', 1580, 640, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: K.io(t, tHooks + 0.3, 0.5) });
      K.text('lock', 1580, 690, { font: 'ui', weight: 600, size: 26, color: C.head, align: 'center', alpha: K.io(t, tHooks + 0.6, 0.5) });
      K.text('note ≠ lock', 1385, 790, { font: 'read', size: 40, italic: true, color: C.strong, align: 'center', alpha: K.io(t, tLocks, 0.6) });
    });
  }

  // myth 10: the Sora app tile closes (cold); the studio door stays open
  {
    const a = ill(4);
    if (a > 0) K.layer(a, () => {
      const tSora = f('Sora', 0, 43.75), tShut = f('shut', 0, 46.97), tOther = f('other', 0, 48.69);
      const sa = K.io(t, tSora - 0.2, 0.5) * (1 - 0.65 * K.io(t, tShut + 0.4, 0.8));
      K.layer(sa, () => {
        K.card(1060, 420, 400, 170, { r: 22, fill: C.tile, stroke: M.mixHex(C.line2, M.palette.cold, K.io(t, tShut, 0.6)), lw: 2 });
        K.icon('sparkle', 1120, 490, 56, { color: M.mixHex(C.head, M.palette.cold, K.io(t, tShut, 0.6)), w: 3 });
        K.text('Sora app', 1170, 502, { font: 'head', weight: 700, size: 38, color: C.strong });
      });
      K.pill('closed · spring 2026', 1260, 640, { size: 26, color: M.palette.cold, stroke: K.rgba(M.palette.cold, 0.6), alpha: K.io(t, tShut + 0.1, 0.5) });
      const sk = K.io(t, tOther - 0.4, 0.6);
      M.studio(t, 1540, 360, { open: sk, show: K.io(t, tOther - 0.3, 1.6, 'sine'), guest: gk, alpha: 0.4 + 0.6 * sk, seed: 4 });
      K.text('other studios carry on', 1635, 820, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: K.io(t, tOther + 0.3, 0.5) });
    });
  }

  // ------------------------------------------------------------ the current myth card: lands, stamp, flip, then joins the pile
  myths.forEach((m, i) => {
    const end = ends[i];
    if (t < m.at - 0.1 + (i ? 0.35 : 0)) return;
    const done = K.io(t, end, 0.8);                // travel to its place in the pile (or straight onto the stack at 'back')
    const L = M.land(t, m.at + (i ? 0.35 : 0), CX, CY, CX, 1180, 0.6);
    travel({ ...m, stampK: K.seg(t, m.stamp, m.stamp + 0.6), flipK: K.io(t, m.flip, 0.8) }, { x: L.x, y: L.y, s: 1 }, done, L.a);
  });
  // a flip makes the clerk's light lift for a moment
  // (drawn as a soft glow over the clerk; the stage itself is not redrawn)
  const flipPulse = myths.reduce((mx, m) => Math.max(mx, K.env(t, m.flip, m.flip + 1.2, 0.4)), 0);
  if (flipPulse > 0) K.glow(st.clerk.x, st.clerk.y, 120, tone.lamp, 0.14 * flipPulse);

  // the gathered stack: one neat card on top once everything has arrived
  const topK = K.io(t, cue.back + 1.1, 0.5);
  if (topK > 0) K.layer(topK, () => {
    K.card(STACK.x - FW / 2 - 20, STACK.y - 30 - FH / 2 - 10, FW + 40, FH + 20, { r: 16, fill: M.mixHex(C.tile, C.head, 0.12), stroke: M.mixHex(C.line2, C.head, 0.8), lw: 2, glow: 0.3 });
    K.icon('check', STACK.x - 92, STACK.y - 30, 30, { color: C.head, w: 4 });
    K.text('10 myths', STACK.x + 14, STACK.y - 20, { font: 'ui', weight: 700, size: 32, color: C.strong, align: 'center' });
  });

  // ------------------------------------------------------------ counter (top right)
  const count = t < cue.m6 ? 5 : t < cue.m7 ? 6 : t < cue.m8 ? 7 : t < cue.m9 ? 8 : t < cue.m10 ? 9 : 10;
  const ca = 1 - K.io(t, cue.back + 1.0, 0.9);
  const pop = 1 + 0.08 * Math.max(...myths.map((m) => K.env(t, m.at, m.at + 0.35, 0.15)));
  K.layer(ca, () => K.at(1720, 176, pop, 0, () => K.pill('myth ' + count + '/10', 0, 0, { size: 30, font: 'mono', color: tone.accent, stroke: K.rgba(tone.accent, 0.55) })));

  // ------------------------------------------------------------ badge backing
  // the engine draws the top-left lesson badge after this scene; under the guest's bright vignette it
  // nearly vanishes, so lay a soft dark pill where it lands (kept to the end: K.bg glow stays bright)
  K.card(62, 58, 440, 40, { r: 20, fill: K.rgba(C.ink, 0.55), stroke: false, shadow: false, alpha: K.io(t, -0.2, 0.8) });

  // ------------------------------------------------------------ guest lower-third (last)
  M.guest(t, 1 - K.io(t, cue.back + 0.4, 0.8));
});
