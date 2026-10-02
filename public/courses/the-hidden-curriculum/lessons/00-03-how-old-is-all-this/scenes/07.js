/* 07 — The market that never closes.
   The building (left layout) becomes YOUR PROJECT: its sign is the project's own version ("my-app 1.0") and stays that way.
   Packages come from a market (two stalls that never stop). Each delivery lands inside the door as one parcel with a tag,
   "colors-kit 2.3.0" -> ... -> "2.4.1" (the recurring repaint, on the tag, not on the sign). The version pill explains 2.4.1
   and points back at that tag; the lockfile writes the tag's version down and the next delivery knocks against it.
   Supply chain: two invented parcels, "co1ors-kit" (look-alike name) and "colors-kit" (taken over), both solid terracotta
   with a small warning glyph. The pin drops on the lockfile; the installer tools pop in a row at the bottom. */
SCENE('07', (t, S) => {
  const C = K.C;
  K.bg({ glow: 0.16, glowX: 1300 });

  // ---- cues (local seconds) ----
  const cMarket = S.cue('market', 4.27), cSemver = S.cue('semver', 13.58), cLock = S.cue('lockfile', 20.87);
  const cSupply = S.cue('supply-chain', 27.74), cTools = S.cue('tools', 39.0);
  const wPackages = S.find('packages', 0, 0.61);
  const wYou = S.find('you', 0, 2.61);
  const wPyPI = S.find(/^Pie/, 0, 6.18);
  const wEvery = S.find('every', 0, 12.47);
  const wVersion = S.find(/^two/, 0, 14.93);
  const wFirst = S.find('first', 0, 17.78);
  const wBreak = S.find(/^break/, 0, 19.86);
  const wLockfile = S.find('lockfile', 0, 21.05);
  const wExact = S.find('exact', 0, 22.44);
  const wQuietly = S.find('quietly', 0, 25.41);
  const wLook = S.find(/^look-alike/, 0, 31.29);
  const wTake = S.find('take', 0, 32.45);
  const wPin = S.find('pin', 0, 35.61);
  const wPip = S.find(/^pip/, 0, 42.38);
  const wPoetry = S.find('Poetry', 0, 43.25);
  const wUv = S.find(/^U$/, 0, 45.14);
  const wAll = S.find('all', 0, 47.21);

  // ---- the building, left layout: it becomes YOUR PROJECT; the sign is the project's own version ----
  const L = M.LAYOUTS.left;
  const own = K.io(t, wYou - 0.1, 0.55);                  // "for you to use": this building is your project
  const frozen = K.io(t, wExact + 0.6, 0.6);              // the lockfile holds the delivered version
  M.building(t, {
    layout: L,
    sign: own > 0 ? 'my-app 1.0' : 'VS Code', signFrom: own > 0 && own < 1 ? 'VS Code' : null, signK: own > 0 && own < 1 ? own : null,
    roofLabel: own > 0 ? 'YOUR PROJECT' : 'VS CODE', roofLabelFrom: 'VS CODE', roofLabelK: own > 0 && own < 1 ? own : null,
    lock: 'key',
    stoneLabel: 'STONE · THE IDEA',
  });

  // ---- "packages": three parcels, before the market is named ----
  const pre = K.io(t, wPackages, 0.5) * (1 - K.io(t, cMarket, 0.5));
  if (pre > 0) [[1340, 0], [1420, 1], [1500, 2]].forEach(([x, tint], i) => {
    const k = K.io(t, wPackages + i * 0.12, 0.5, 'out');
    M.parcel(x, 330 - 16 * (1 - k), 60, { tint, alpha: pre * k });
  });

  // ---- the market: two stalls that never close ----
  const STALL_Y = 170;
  M.stall(t, 1060, STALL_Y, { title: 'NPM · JAVASCRIPT', k: K.io(t, cMarket, 0.6), flow: cMarket + 0.4, every: 1.1, seed: 7 });
  M.stall(t, 1440, STALL_Y, { title: 'PYPI · PYTHON', k: K.io(t, wPyPI, 0.6), flow: wPyPI + 0.4, every: 1.1, seed: 11 });

  // "every day": a small clock under the stalls
  const dayK = K.io(t, wEvery, 0.5);
  if (dayK > 0) K.layer(dayK, () => {
    K.icon('clock', 1352, 522, 34, { color: C.head });
    K.text('every day', 1384, 531, { font: 'ui', weight: 600, size: 26, color: C.body });
  });

  // ---- the delivered package: one parcel inside the house, beside the door, with a version tag ----
  const NPM_OUT = { x: 1090, y: 444 };                    // where a delivery leaves the npm stall
  const BOX = { x: 648, y: 702 };                         // inside the walls, under the right window, beside the door
  const TAG = { x: 800, y: 702 };                         // the tag pill's left edge (outside the wall)
  const LOCKF = { x: 890, y: 560 };                       // the lockfile, beside the building
  const deliveries = [
    [cMarket + 1.4, 'colors-kit 2.3.0'],
    [cMarket + 4.3, 'colors-kit 2.3.1'],
    [cMarket + 7.1, 'colors-kit 2.4.0'],
    [wVersion, 'colors-kit 2.4.1'],
  ];
  let di = -1; deliveries.forEach(([at], i) => { if (t >= at - 0.1) di = i; });
  const boxK = K.io(t, deliveries[0][0] - 0.1, 0.4, 'out');
  if (boxK > 0) {
    const thump = deliveries.reduce((a, [at]) => a + M.bump(t, at, 0.35), 0);
    // a thin string from the parcel to its tag
    K.layer(boxK, () => K.line(BOX.x + 28, BOX.y, TAG.x, BOX.y, { color: C.line2, w: 2 }));
    M.parcel(BOX.x, BOX.y - 3 * thump, 50, { tint: 1, alpha: boxK });
    const at = deliveries[di][0], tk = K.io(t, at - 0.1, 0.5);
    const tag = deliveries[di][1], from = di > 0 && tk < 1 ? deliveries[di - 1][1] : (di === 0 && tk < 1 ? '' : null);
    M.paint(TAG.x, TAG.y, tag, {
      from, k: from != null ? tk : null, size: 26, font: 'mono', weight: 500, align: 'left',
      lit: 0.85 * frozen, alpha: boxK, blankW: 120,
    });
  }

  // ---- a parcel in flight: from the npm stall to (tx, ty), landing at `land` ----
  const flight = (land, tx, ty, o = {}) => {
    const dur = 0.95, a = land - dur;
    if (t < a || t > land + 0.7) return;
    const u = K.ease.io(K.seg(t, a, land));
    const cx = (NPM_OUT.x + tx) / 2, cy = Math.min(NPM_OUT.y, ty) - 40;          // a low arc, over the wall and in
    const x = (1 - u) * (1 - u) * NPM_OUT.x + 2 * (1 - u) * u * cx + u * u * tx;
    const y = (1 - u) * (1 - u) * NPM_OUT.y + 2 * (1 - u) * u * cy + u * u * ty;
    const fadeIn = K.seg(t, a, a + 0.2);
    const after = K.seg(t, land, land + (o.stop ? 0.7 : 0.2));
    const s = (o.s || 40) * (o.stop ? 1 - 0.25 * K.ease.in(after) : 1 + 0.25 * after);
    const dx = o.stop ? 14 * Math.sin(Math.PI * Math.min(1, after * 2)) : 0;   // a small knock back from the lockfile
    M.parcel(x + dx, y, s, { tint: o.tint ?? 1, alpha: fadeIn * (1 - after) });
  };
  deliveries.forEach(([at], i) => flight(at, BOX.x, BOX.y, { tint: i % 3, s: 46 }));
  // after the lockfile: the next delivery stops at the lockfile, and the package inside stays as it is
  flight(wQuietly, LOCKF.x + 70, LOCKF.y - 40, { stop: true, tint: 2 });

  // ---- semver: the version pill, pointing back at the delivered package's tag ----
  const PILL = { x: 1420, y: 640 };
  const pillK = K.io(t, wVersion - 0.25, 0.5);
  const labelsOut = K.io(t, cSupply + 0.1, 0.5);
  // the narrated part leads: on "first" the '2' lights gold and "may break" comes in under it;
  // the other two labels are secondary (never said), so they wait until after "break" and stay at 60 %
  const hlFirst = K.io(t, wFirst - 0.05, 0.4) * (1 - labelsOut);
  const lbK = (i) => (i === 0 ? K.io(t, wFirst, 0.5) : 0.6 * K.io(t, wBreak + 0.3 + (i - 1) * 0.25, 0.5)) * (1 - labelsOut);
  const ringK = K.io(t, wPin + 0.25, 0.8);
  // a soft arrow from the tag's version number out to the big pill: "a version number like 2.4.1"
  K.arrow(TAG.x + 300, TAG.y - 6, PILL.x - 124, PILL.y + 6, { k: K.io(t, wVersion - 0.1, 0.6), color: C.soft, w: 2, bend: -14, headSize: 11 });
  if (pillK > 0) K.layer(pillK, () => K.at(0, 14 * (1 - K.ease.out(pillK)), 1, 0, () => {
    M.versionPill(PILL.x, PILL.y, {
      parts: ['2', '4', '1'], size: 40,
      hl: (i) => (i === 0 ? hlFirst : 0),
      labels: [{ text: 'may break', color: C.accent }, { text: 'new features', color: C.soft }, { text: 'fixes', color: C.soft }],
      labelsK: lbK,
      ring: ringK,
    });
  }));

  // ---- the lockfile, beside the building: it writes down the tag's exact version ----
  const lfK = K.io(t, wLockfile, 0.6);
  const knock = M.bump(t, wQuietly, 0.6);
  if (lfK > 0) {
    if (knock > 0 || frozen > 0) K.glow(LOCKF.x, LOCKF.y, 90, C.head, 0.1 * frozen + 0.18 * knock);
    K.file(LOCKF.x, LOCKF.y + 16 * (1 - K.ease.out(lfK)), 90, { ext: 'lock', name: 'lockfile', nameSize: 26, alpha: lfK });
  }
  // a short gold arrow from the tag up into the lockfile: this exact version is written down
  K.arrow(TAG.x + 215, TAG.y - 30, LOCKF.x + 50, LOCKF.y - 14, { k: K.io(t, wExact, 0.6), color: C.head, w: 2.5, bend: 22, headSize: 11 });
  // the pin drops onto the lockfile
  const pinK = K.io(t, wPin, 0.5, 'out');
  if (pinK > 0) K.icon('pin', LOCKF.x, LOCKF.y - 66 - 40 * (1 - pinK), 52, { color: C.head, alpha: Math.min(1, pinK * 1.6) });

  // ---- supply chain: two invented parcels, both marked the same way ----
  const pairOut = K.io(t, cTools - 0.6, 0.5);
  const realK = K.io(t, cSupply + 0.3, 0.5) * (1 - pairOut);
  const fakeK = K.io(t, wLook, 0.5) * (1 - pairOut);
  const takeK = K.io(t, wTake + 0.15, 0.5);
  const PAIR_Y = 772, REAL_X = 1270, FAKE_X = 1580, PS = 56;
  const warn = (x, y, k) => {                               // a small warning glyph: a rounded triangle with "!"
    if (k <= 0) return;
    const g = K.ctx(), r = 17;
    K.layer(k, () => {
      g.save();
      g.beginPath(); g.arc(x, y, r + 7, 0, Math.PI * 2); g.fillStyle = C.panel || C.tile; g.fill();
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.95, y + r * 0.7); g.lineTo(x - r * 0.95, y + r * 0.7); g.closePath();
      g.lineJoin = 'round'; g.lineWidth = 2.5; g.strokeStyle = C.accent; g.stroke();
      g.restore();
      K.text('!', x, y + 8, { font: 'ui', weight: 700, size: 20, color: C.accent, align: 'center' });
    });
  };
  const mono = { font: 'mono', size: 26 };
  const labelY = (y) => y - PS * 0.39 + PS * 0.08 + PS * 0.78 + 34;   // same baseline M.parcel uses for its label
  if (realK > 0) {
    const y = PAIR_Y + 12 * (1 - K.ease.out(realK));
    M.parcel(REAL_X, y, PS, { tint: 0, alpha: realK, outline: takeK > 0 ? K.mixColor(C.line2, C.accent, takeK) : null });
    K.text('colors-kit', REAL_X, labelY(y), { ...mono, color: K.mixColor(C.body, C.accent, takeK), align: 'center', alpha: realK });
    warn(REAL_X + 40, y - 40, realK * takeK);
    if (takeK > 0) K.text('taken over', REAL_X, labelY(y) + 40 + 8 * (1 - K.ease.out(takeK)), { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: realK * takeK });
  }
  if (fakeK > 0) {
    const y = PAIR_Y + 12 * (1 - K.ease.out(fakeK));
    M.parcel(FAKE_X, y, PS, { tint: 0, alpha: fakeK, outline: C.accent });
    // the near-miss name: the "1" that replaces the "l" is picked out in terracotta
    const parts = ['co', '1', 'ors-kit'], ws = parts.map((s) => K.measure(s, mono)), total = ws.reduce((a, b) => a + b, 0);
    let x = FAKE_X - total / 2;
    parts.forEach((s, i) => {
      K.text(s, x, labelY(y), { ...mono, weight: i === 1 ? 700 : 400, color: i === 1 ? C.accent : C.body, align: 'left', alpha: fakeK });
      x += ws[i];
    });
    warn(FAKE_X + 40, y - 40, fakeK * K.io(t, wLook + 0.3, 0.4));
    const capK = K.io(t, wLook + 0.35, 0.5);
    if (capK > 0) K.text('look-alike name', FAKE_X, labelY(y) + 40 + 8 * (1 - K.ease.out(capK)), { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: fakeK * capK });
  }

  // ---- the tools that install packages ----
  const eyeK = K.io(t, cTools + 0.2, 0.5);
  if (eyeK > 0) K.eyebrow('Tools that install packages', 1420, 788, { size: 20, align: 'center', tracking: 3, alpha: eyeK });
  // three pills, evenly gapped and centred on the column
  const tools = [[wPip, 'pip'], [wPoetry, 'Poetry · 2018'], [wUv, 'uv · 2024']];
  const pw = tools.map(([, s]) => K.measure(s, { font: 'mono', weight: 600, size: 26 }) + 26 * 1.6), GAP = 56;
  let tx = 1420 - (pw.reduce((a, b) => a + b, 0) + GAP * (tools.length - 1)) / 2;
  tools.map(([at, s], i) => { const x = tx + pw[i] / 2; tx += pw[i] + GAP; return [at, s, x]; }).forEach(([at, s, x]) => {
    const k = K.io(t, at, 0.5, 'out');
    if (k > 0) K.layer(k, () => K.at(x, 850, 0.9 + 0.1 * k, 0, () => K.pill(s, 0, 0, { size: 26, font: 'mono' })));
  });
  const allK = K.io(t, wAll, 0.5);
  if (allK > 0) K.text('all still in use', 1420, 912 - 8 * (1 - K.ease.out(allK)), { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: allK });
});
