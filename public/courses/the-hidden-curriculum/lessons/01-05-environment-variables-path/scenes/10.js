/* 01.05 scene 10 — Where the picture breaks.
   Left stage (x 120-1060) shows one break at a time; right column (x 1150-1760) collects three break cards.
   1 no-seal: a lock tries the flap, gets crossed out, the flap falls open; program / script / agent each get copies,
     and the agent copies them on to its own courier.
   2 signposts: a signpost stands where a shop should be; Store alias, install-manager alias, shims;
     `where.exe python` names the signpost (WindowsApps), not the program.
   3 many-satchels: a grid of couriers, each with its own satchel. */
SCENE('10', (t, S) => {
  const K = window.K, C = K.C, M = window.M;
  K.bg();

  // a small courier whose satchel sits lower-right of the tile (clear of the icon glyph) and shows one
  // cream card stub, not three dark name tabs (M.courier's fixed hip offset would cover the glyph).
  const kid = (x, y, s, o) => {
    const ss = s * 0.72, sx = x + s * 0.66, sy = y + s * 0.42, a = o.alpha == null ? 1 : o.alpha;
    const so = o.satchel || {};
    if (a > 0.002) K.layer(a, () => {
      K.path([[sx - ss * 0.2, sy - ss * 0.3], [x + s * 0.52, y - s * 0.5], [x + s * 0.05, y - s * 0.64], [x - s * 0.36, y - s * 0.4]],
        { color: M.P.leatherFlap, w: Math.max(4, s * 0.06), head: false });
    });
    M.courier(t, x, y, s, { ...o, satchel: false });
    const has = so.has || 0;
    M.satchel(t, sx, sy, ss, { strap: 'none', names: false, alpha: a, open: so.open || 0, glow: so.glow || 0,
      cards: has > 0 ? [{ kind: so.kind || 'path', lift: 0.75, size: 8, w: ss * 0.46, alpha: has }] : [] });
    return { sx, sy, ss };
  };

  const c1 = S.cue('no-seal', 0), c2 = S.cue('signposts', 13.25), c3 = S.cue('many-satchels', 28.34);
  const w = (s, fb, n = 0) => S.find(s, n, fb);

  // ---- timings (spoken words)
  const tSealed = w('sealed', c1 + 3.4);
  const tCant = w("can't", c1 + 4.8);
  const tAny = w('Any', c1 + 5.9);
  const tProg = w('program,', c1 + 6.2);
  const tScript = w('script', c1 + 6.9);
  const tAgent = w('agent', c1 + 7.4);
  const tRead = w('read', c1 + 8.5);
  const tCopies = w('copies', c1 + 10.3);
  const tSign = w('signposts,', c2 + 1.9);
  const tStore = w('Store', c2 + 4.2);
  const tInst = w('install-manager', c2 + 5.0);
  const tShims = w('shims', c2 + 8.4);
  const tFwd = w('forward', c2 + 9.5);
  const tWhich = w('"which"', c2 + 11.6);
  const tSignpost2 = w('signpost,', c2 + 12.6);
  const tMany = w('many', c3 + 3.3);
  const tSatchels = w('satchels', c3 + 3.6);

  // ---- eyebrow
  M.eyebrow('where the picture breaks', 120, 172, { align: 'left', alpha: K.io(t, c1 - 0.2, 0.6) });

  // ---- right column: three break cards
  const cards = [
    { at: tSealed - 0.1, n: '1', title: 'No seal', body: 'every child can read every card' },
    { at: tSign, n: '2', title: 'Some shops are signposts', body: 'Store alias, install-manager alias, version-manager shims' },
    { at: tSatchels - 0.6, n: '3', title: 'No single environment', body: 'one per running program' },
  ];
  const CX = 1150, CW = 610, CH = 184, CY = [220, 434, 648];
  const active = t < c2 ? 0 : t < c3 ? 1 : 2;
  cards.forEach((cd, i) => {
    const k = K.io(t, cd.at, 0.6);
    if (k <= 0) return;
    const y = CY[i] + (1 - k) * 30;
    // card 3 is the last thing said: it stays lit through the exit
    const on = i === active ? 1 : 0;
    const lit = K.io(t, cd.at, 0.4) * (i === active ? 1 : 1 - K.io(t, i === 0 ? c2 : c3, 0.5));
    K.layer(k, () => {
      K.card(CX, y, CW, CH, { r: 20, stroke: K.mixColor(C.line2, C.strong, lit * 0.7), alpha: 1 });
      // number disc
      const g = K.ctx();
      g.save(); g.beginPath(); g.arc(CX + 56, y + 62, 28, 0, Math.PI * 2);
      g.fillStyle = K.rgba(C.strong, 0.1 + 0.12 * lit); g.fill(); g.lineWidth = 2; g.strokeStyle = K.rgba(C.strong, 0.4 + 0.4 * lit); g.stroke(); g.restore();
      K.text(cd.n, CX + 56, y + 73, { font: 'ui', weight: 700, size: 30, color: C.strong, align: 'center' });
      const ta = 0.62 + 0.38 * Math.max(lit, on);
      K.text(cd.title, CX + 104, y + 73, { font: 'ui', weight: 700, size: 32, color: C.strong, alpha: ta });
      K.para(cd.body, CX + 104, y + 124, CW - 140, { size: 27, color: C.body, alpha: ta, font: 'ui' });
    });
  });

  // =========================================================== stage 1: no seal
  const out1 = 1 - K.io(t, tSign - 1.0, 0.6);
  if (out1 > 0.002) K.layer(out1 * K.io(t, c1 - 0.6, 0.6), () => {
    const SX = 350, SY = 470, SS = 380;
    const open = K.io(t, tAny, 0.6);
    const lift = 0.35 * K.io(t, tAny + 0.3, 0.5);
    const big = [{ name: 'PATH', kind: 'path', lift }, { name: 'HOME', lift }, { name: 'KEY', kind: 'key', lift }];
    const geo = M.satchel(t, SX, SY, SS, { open, cards: big, strap: 'none' });
    // the lock tries the flap (closed: flap buckle area), gets crossed, then falls away as the flap opens
    const h = SS * 0.68, y0 = SY - h / 2, flapH = h * 0.52;
    const lockY = y0 + flapH * 0.55 - 6;
    const lockIn = K.io(t, tSealed - 0.6, 0.5);
    const fail = K.io(t, tCant, 0.5);
    const drop = K.io(t, tAny - 0.1, 0.6, 'in');
    if (lockIn > 0 && drop < 1) K.layer(lockIn * (1 - drop), () => {
      const ly = lockY + (1 - lockIn) * -40 + drop * 70;
      K.glow(SX, ly, 90, C.head, 0.18 * (1 - fail));
      K.icon('lock', SX, ly, SS * 0.2, { color: C.head, alpha: 1 - 0.55 * fail, w: 4 });
      if (fail > 0) M.cross(SX, ly, 66, fail);
    });

    // children: program / script / agent, plus the agent's own courier
    const kids = [
      { x: 740, y: 290, icon: 'terminal', label: 'program', at: tProg },
      { x: 740, y: 500, icon: 'code', label: 'script', at: tScript },
      { x: 740, y: 710, icon: 'sparkle', label: 'agent', at: tAgent, lantern: 1 },
    ];
    const KS = 90;
    const flyD = 0.75;
    kids.forEach((kd, i) => {
      const a = K.io(t, kd.at - 0.15, 0.5);
      if (a <= 0) return;
      const fs = tRead - 0.2 + i * 0.18; // copies fly on "read every card"
      const got = K.io(t, fs + flyD - 0.05, 0.3);
      const r = kid(kd.x + (1 - a) * -24, kd.y, KS, {
        icon: kd.icon, label: kd.label, lantern: kd.lantern ? a : 0, alpha: a,
        satchel: { open: K.io(t, fs - 0.3, 0.4), has: got, glow: 0.6 * got },
      });
      M.copyFly(SX + 20, geo.mouthY - 40, r.sx, r.sy - r.ss * 0.3, K.seg(t, fs, fs + flyD), { kind: 'path', w: 56, h: 72, bend: -60, size: 10 });
      M.copyFly(SX + 110, geo.mouthY - 40, r.sx, r.sy - r.ss * 0.3, K.seg(t, fs + 0.12, fs + 0.12 + flyD), { kind: 'key', w: 56, h: 72, bend: -60, size: 10 });
    });
    // the agent copies them on to its own courier
    const ga = K.io(t, tCopies - 0.2, 0.5);
    if (ga > 0) {
      const ax = 740, ay = 710, gx = 975, gy = 720, GS = 64;
      const fs = tCopies + 0.3;
      const got = K.io(t, fs + flyD - 0.05, 0.3);
      const g = kid(gx, gy, GS, { icon: 'terminal', alpha: ga, satchel: { open: K.io(t, fs - 0.3, 0.4), has: got, glow: 0.6 * got } });
      const asx = ax + KS * 0.66, asy = ay + KS * 0.42;
      M.copyFly(asx, asy - 20, g.sx, g.sy - g.ss * 0.3, K.seg(t, fs, fs + flyD), { kind: 'key', w: 48, h: 62, bend: -70, size: 10 });
      K.layer(ga, () => M.label('its own courier', gx, gy + GS / 2 + 44, {}));
    }
  });

  // =========================================================== stage 2: signposts
  const in2 = K.io(t, tSign - 0.4, 0.5), out2 = 1 - K.io(t, c3 - 0.4, 0.6);
  if (in2 * out2 > 0.002) K.layer(in2 * out2, () => {
    const PX = 330, PY = 380, PS = 120;
    // the real program, off where the signpost points (dim: the courier never sees it directly)
    const fk = K.io(t, tFwd - 0.1, 0.5);
    K.layer(0.2 + 0.4 * fk, () => {
      K.folder(860, PY, 110, {});
      M.label('the real program', 860, PY + 96, { color: C.soft });
    });
    const pop = K.io(t, tSign - 0.3, 0.6, 'back');
    K.at(PX, PY + (1 - pop) * 30, 1, 0, () => {
      M.signpost(t, 0, 0, PS, { label: 'python.exe', point: fk, reach: 380, alpha: Math.min(1, pop) });
    });
    // what the signposts are
    const pills = [
      { s: 'Store alias', at: tStore, x: 250 },
      { s: 'install-manager alias', at: tInst, x: 560 },
      { s: 'shims', at: tShims, x: 865 },
    ];
    pills.forEach((p) => {
      const k = K.io(t, p.at - 0.1, 0.4);
      if (k > 0) K.pill(p.s, p.x, 590 + (1 - k) * 16, { size: 26, alpha: k, color: C.body, stroke: K.rgba(C.accent, 0.7) });
    });
    // "which" names the signpost
    const tk = K.io(t, tWhich - 0.5, 0.4);
    if (tk > 0) {
      M.termStrip(t, [
        { at: tWhich - 0.2, cmd: 'where.exe python', cps: 40 },
        { at: tSignpost2 - 0.2, out: '…\\Microsoft\\WindowsApps\\python.exe', color: C.accent },
      ], { x: 120, y: 690, w: 940, h: 170, alpha: tk, rows: 2, title: 'Terminal' });
    }
    // and the signpost is what it named
    const rk = K.io(t, tSignpost2, 0.5);
    if (rk > 0) K.ring(PX, PY, 112, 62, rk, { color: C.accent, w: 3, rot: 0 });
  });

  // =========================================================== stage 3: many satchels
  const in3 = K.io(t, c3 - 0.2, 0.5);
  if (in3 > 0.002) K.layer(in3, () => {
    const grid = [
      { x: 260, y: 330, icon: 'terminal', label: 'terminal', n: 3 },
      { x: 560, y: 330, icon: 'code', label: 'editor', n: 2 },
      { x: 860, y: 330, icon: 'sparkle', label: 'agent', n: 3, lantern: 1 },
      { x: 260, y: 640, icon: 'file', label: 'File Explorer', n: 2 },
      { x: 560, y: 640, icon: 'gear', label: 'installer', n: 3 },
      { x: 860, y: 640, icon: 'terminal', label: 'old terminal', n: 1 },
    ];
    const kinds = [['path', null, 'key'], ['path', null], ['path', 'key', null], [null, 'path'], ['path', null, null], ['path']];
    grid.forEach((gd, i) => {
      const k = K.io(t, K.lerp(c3 + 0.1, tSatchels, i / (grid.length - 1)), 0.5);
      if (k <= 0) return;
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.1);
      kid(gd.x, gd.y + (1 - k) * 24, 100, {
        icon: gd.icon, label: gd.label, alpha: k, lantern: gd.lantern ? k : 0,
        satchel: { open: 1, has: 1, kind: kinds[i].includes('key') ? 'key' : 'path', glow: 0.25 + 0.3 * breathe * K.io(t, tMany, 0.8) },
      });
    });
  });
});
