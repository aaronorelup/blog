/* 01.05 · 15 Safe to ignore, and the neighbours.
   Beats (local seconds, cues.json; section 33.8 s):
     - [[ignore]] 0        eyebrow "safe to ignore for now"; the closed satchel is set down on the right.
       "registry" ~2.6     dim pills drop in one per spoken item: registry · command rules · shims · editors,
       "full" ~4.5         then a screen-only `setx` limits pill.
       "version" ~7.5
       "environment" ~10.0
     - [[neighbours]] 12.4 the satchel shrinks into the 'Your computer' pin; the ignore list shrinks into the bottom-left corner (Shipping's
                           empty slot) and the map fades in together with only The Machine, The Code and Trust.
       "shells" ~14.3      row 02 washes gold; card 02.02 "shells" on the right.
       "Pythons" ~17.2     row 05 washes; card 05.01 "many Pythons";  "virtual" ~18.0 card 05.03.
     - [[trust]] 21.3      row 14 washes; card 14.12;  "secrets" ~24.4 row 15 + card 15.07;  "user" ~27.0 card 15.08;
       "District" ~30.5    the Trust outline warms to gold.
   Last frame: three districts, four washed rows, six lesson cards, the ignore list resting dim. No "next time". */
SCENE('15', (t, S) => {
  const C = K.C, io = K.io;
  K.bg();

  // ---- beats
  const tIgn = S.cue('ignore', 0);
  const tNb = S.cue('neighbours', 12.42);
  const tTr = S.cue('trust', 21.34);
  const f = (w, n, fb, o) => S.find(w, n, fb, o);
  const B = {
    registry: f('registry', 0, 2.61),
    rules: f('full', 0, 4.54),
    shims: f('version', 0, 7.49),
    editors: f('environment', 0, 9.98),
    setx: f('tools', 0, 11.15),
    shells: f('shells', 0, 14.33),
    pythons: f('Pythons', 0, 17.16),
    venvs: f('virtual', 0, 18.03),
    keys: f('Giving', 0, tTr),
    secrets: f('secrets', 0, 24.36),
    user: f('user', 0, 27.03, { whole: true }),
    district: f('District', 0, 30.48),
  };

  // ---- phase 2 move: the ignore list settles into the bottom-left corner
  const mv = io(t, tNb, 0.6, 'io');

  // ---- the map (phase 2): only the three districts this scene names
  const mapK = io(t, tNb + 0.1, 0.65, 'io');
  // The Machine sits where the list starts: it fades in only once the list has slid out from under it
  const machK = io(t, tNb + 0.4, 0.5, 'io');
  const trustIn = io(t, tNb + 0.3, 0.65, 'io');
  // the satchel shrinks into the 'Your computer' pin; the pin itself appears as it lands
  const shrink = io(t, tNb, 0.75, 'io');
  const pinIn = io(t, tNb + 0.6, 0.3, 'io');
  if (mapK > 0) {
    const wash = (a) => ({ k: io(t, a, 0.6, 'io'), color: C.head });
    const shown = { machine: machK, code: mapK, trust: trustIn };
    K.map.draw(t, {
      pin: '01',
      pinK: pinIn,
      pinGlowK: 0,
      path: 0,
      lanterns: 0,
      lanternLabels: 0,
      districtK: (id) => (id in shown ? shown[id] : 0),
      highlight: { trust: io(t, B.district, 0.8, 'io') },
      rowWash: {
        '02': wash(B.shells),
        '05': wash(B.pythons),
        '14': wash(B.keys),
        '15': wash(B.secrets),
      },
    });
  }

  // ---- the safe-to-ignore list
  const P1 = { x: 200, eb: 250, ys: [340, 430, 520, 610, 712], size: 30 };   // phase 1: the whole left half
  const P2 = { x: 252, eb: 618, ys: [662, 718, 774, 830, 886], size: 26 };   // phase 2: Shipping's empty slot
  const ebA = io(t, tIgn - 0.4, 0.8, 'io') * K.lerp(1, 0.8, mv);
  M.eyebrow('safe to ignore for now', K.lerp(P1.x, P2.x, mv), K.lerp(P1.eb, P2.eb, mv), { align: 'left', alpha: ebA, color: K.mixColor(C.head, C.soft, 0.25) });
  const items = [
    { s: 'editing the registry by hand', at: B.registry },
    { s: 'command precedence rules', at: B.rules },
    { s: 'version-manager shims', at: B.shims },
    { s: 'environment editor tools', at: B.editors },
    { s: 'setx · 1,024-char limit', at: B.setx, mono: true },
  ];
  items.forEach((it, i) => {
    const k = io(t, it.at, 0.5, 'out');
    if (k <= 0.002) return;
    const size = K.lerp(P1.size, P2.size, mv);
    const font = it.mono ? 'mono' : 'ui';
    const to = { size, font, weight: 600 };
    const w = K.measure(it.s, to) + size * 1.05 + size * 0.4 + size * 1.6;   // K.pill's own width formula (with icon)
    const x = K.lerp(P1.x, P2.x, mv) + w / 2;
    const y = K.lerp(P1.ys[i], P2.ys[i], mv) - (1 - k) * 18;
    // freshly said: brighter for a moment, then rests dim
    const fresh = 1 - io(t, it.at + 1.2, 0.8, 'io');
    const a = k * K.lerp(0.72, 1, fresh) * K.lerp(1, 0.78, mv);
    // K.pill's shape, but a slimmer body (1.9 -> 1.6 x size) once it settles, so the stacked rows keep a gap
    const h = size * K.lerp(1.9, 1.6, mv), is = size * 1.05, gap = size * 0.4, cw = w - size * 1.6;
    const col = K.mixColor(C.soft, C.body, 0.5 * fresh);
    K.card(x - w / 2, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: C.line2, shadow: false, alpha: a });
    K.icon('clock', x - cw / 2 + is / 2, y, is, { color: C.soft, alpha: a });
    K.text(it.s, x + (is + gap) / 2, y + size * 0.34, { ...to, color: col, align: 'center', alpha: a });
  });

  // ---- the neighbour lessons, on the right
  const cards = [
    { num: '02.02', name: 'shells', at: B.shells, y: 262 },
    { num: '05.01', name: 'many Pythons', at: B.pythons, y: 366 },
    { num: '05.03', name: 'virtual environments', at: B.venvs, y: 470 },
    { num: '14.12', name: 'giving agents keys safely', at: B.keys, y: 616 },
    { num: '15.07', name: 'secrets out of plain text', at: B.secrets, y: 720 },
    { num: '15.08', name: 'user vs system variables', at: B.user, y: 824 },
  ];
  const CX = 1228, CW = 610, CH = 86;
  cards.forEach((c) => {
    const k = io(t, c.at, 0.55, 'out');
    if (k <= 0.002) return;
    const fresh = 1 - io(t, c.at + 1.4, 0.8, 'io');
    const x = CX + (1 - k) * 30;
    K.layer(k, () => {
      K.card(x, c.y, CW, CH, { r: 20, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.6 * fresh), glow: 0.3 * fresh, shadow: false });
      K.text(c.num, x + 28, c.y + 54, { font: 'mono', size: 30, weight: 700, color: C.gold });
      K.text(c.name, x + 148, c.y + 54, { font: 'ui', size: 30, weight: 600, color: C.strong });
    });
  });
  // ---- the satchel: set down in phase 1, then it shrinks and flies into the map's "Your computer" pin
  const sIn = io(t, tIgn - 0.4, 0.9, 'out');
  const sFade = 1 - io(t, tNb + 0.55, 0.25, 'io');
  if (sIn * sFade > 0.003) {
    const c = K.map.chipPos('01');
    const px = c.x + c.w - 14, py = c.y - 4 - 6;
    const sx = K.lerp(1380, px, shrink), sy = K.lerp(560 - (1 - sIn) * 40, py, shrink) - Math.sin(Math.PI * shrink) * 60;
    M.satchel(t, sx, sy, K.lerp(320, 36, shrink), { open: 0, alpha: sIn * sFade * K.lerp(1, 0.9, shrink) });
  }
});
