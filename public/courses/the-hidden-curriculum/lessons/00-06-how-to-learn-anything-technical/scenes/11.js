/* 00.06 · 11 — Who owns the supplier list
 * Side house (s 300, at 520,600), owner with the approved list on the left, a road at y 740 where supplier vans
 * (dependencies) queue up. Top-right slot changes per beat; the package.json diff closes the scene. */
SCENE('11', (t, S) => {
  const C = K.C, P = M.palette;
  const cue = (n, f) => S.cue(n, f);
  const tSup = cue('suppliers', 1.16), tDecide = cue('decide', 12.41), tStr = cue('stranger', 20.06);
  const tVul = cue('vulnerable', 22.96), tFake = cue('fake', 32.84), tWorm = cue('worms', 38.14), tDiff = cue('diff', 53.12);
  const tDeps = S.find('dependencies:', 0, 3.5);
  const tOther = S.find('Otherwise', 0, 14.9);
  const tAdd = S.find('adding', 0, 16.3);
  const tHid = S.find('hid', 0, 45.3);
  const tRun = S.find('moment', 0, 49.2);
  const tAug = S.find("August's", 0, 44.5);

  K.bg({ glow: 0.32, glowX: 620, glowY: 600 });

  // ---------------------------------------------------------------- road + house + owner
  const ROAD = 740;
  K.line(690, ROAD + 2, 1840, ROAD + 2, { color: C.line2, w: 3 });
  const gm = M.house(t, 520, 600, 300, { lights: 1 });

  // "someone who knows the libraries" -> the owner glows; the list arrives on "decide"
  const tSome = S.find('someone', 0, 10.7);
  const ownGlow = K.env(t, tSome, tDecide + 1.2, 0.5);
  if (ownGlow > 0) K.glow(236, gm.ground - 80, 120, C.head, 0.35 * ownGlow);
  const listK = K.io(t, tDecide, 0.6, 'out');
  // the decider is NOT the beginner: like 10's 'someone who knows the norms', a library-literate person owns the list
  M.person(t, 236, gm.ground, 140, 'owner', { prop: 'clipboard', propK: listK, i: 1 });
  const nameK = K.io(t, tSome, 0.5, 'out');
  if (nameK > 0) {
    M.label('someone who knows', 236, gm.ground + 44, 'machine', { alpha: nameK });
    M.label('the libraries', 236, gm.ground + 80, 'machine', { alpha: nameK });
  }

  // approved list card (upper left), slides in from the left, tied to the clipboard
  if (listK > 0) {
    K.layer(listK, () => {
      const x = 104 - (1 - listK) * 60, y = 168, w = 380, rows = ['http', 'dates'];
      const h = 76 + rows.length * 50 + 14;
      K.card(x, y, w, h, { r: 18, stroke: K.mixColor(C.line2, C.head, 0.5) });
      K.eyebrow('APPROVED SUPPLIERS', x + 28, y + 50, { size: 22, color: C.head, tracking: 3 });
      rows.forEach((r, i) => {
        const k = K.io(t, tDecide + 0.35 + i * 0.25, 0.45, 'out');
        const ry = y + 104 + i * 50;
        K.layer(k, () => {
          K.icon('check', x + 46, ry - 10, 30, { color: P.machine, w: 3.5 });
          K.text(r, x + 80, ry, { font: 'mono', weight: 600, size: 30, color: C.strong });
        });
      });
      K.line(282, y + h + 8, 282, 610, { color: K.rgba(C.head, 0.5), w: 2, dash: [6, 8], k: K.io(t, tDecide + 0.3, 0.6) });
    });
  }

  // ---------------------------------------------------------------- crew: "everyone codes with AI", then the one adding packages
  const tEvery = S.find('everyone', 0, 8.5);
  const grpK = K.io(t, tEvery, 0.8, 'lin');
  const grpOut = 1 - K.io(t, tOther - 0.3, 0.5);
  if (grpK > 0 && grpOut > 0) {
    M.crewGroup(t, 1320, 330, 3, 56, { k: grpK, alpha: grpOut, i: 4 });
    M.label('everyone codes with AI', 1320, 470, 'machine', { alpha: grpOut * K.io(t, tEvery + 0.4, 0.5) });
  }
  const crewK = K.io(t, tOther, 0.6, 'out');
  if (crewK > 0) M.crew(t, 742, 520, 56, { i: 2, alpha: crewK });

  // ---------------------------------------------------------------- vans
  const VS = 140, GAP = 142, X0 = 770;
  const vans = [
    { name: 'http', at: tSup + 0.05 },
    { name: 'dates', at: tSup + 0.45 },
    { name: 'charts', at: tAdd - 0.1 },
    { name: 'icons', at: tAdd + 0.25 },
    { name: 'forms', at: tAdd + 0.6 },
    { name: 'csv-tools', at: tAdd + 0.95 },
    { name: 'md-render', at: tAdd + 1.3 },
    { name: null, at: tFake + 0.05, ghost: true },
  ];
  const diffFade = 1 - K.io(t, tDiff - 0.2, 0.7);
  const unTint = K.mixColor(C.line2, C.accent, 0.75);
  vans.forEach((v, i) => {
    const tx = X0 + i * GAP;
    const k = K.io(t, v.at, 1.3, 'out');
    if (k <= 0) return;
    const x = K.lerp(2060, tx, k);
    // engines idle once parked: the wheels keep turning slowly
    const roll = -(2060 - x) / (0.085 * VS) + (k >= 1 ? (t - v.at - 1.3) * 0.9 : 0);
    const approved = i < 2;
    const keyK = i < 7 ? K.io(t, tStr + 0.1 + i * 0.12, 0.5, 'out') : 0;
    M.van(t, x, ROAD, VS, {
      ghost: v.ghost ? 1 : approved ? 0 : 0.3,
      driver: v.ghost ? K.io(t, tFake + 0.9, 0.5) : 0,
      warn: i === 3 ? K.io(t, tVul + 0.2, 0.5, 'out') : 0,
      keyK,
      crate: i === 4 ? K.io(t, tHid, 0.6, 'out') : 0,
      roll,
      alpha: diffFade,
      tint: v.ghost ? K.mixColor(C.soft, C.accent, 0.6) : approved ? undefined : unTint,
    });
    // names under the wheels, alternating rows so the long names never touch
    const nm = v.ghost ? '?' : v.name;
    const ny = ROAD + (i % 2 ? 72 : 40);
    const na = diffFade * K.io(t, v.at + 0.9, 0.4);
    const col = v.ghost ? P.unseen : approved ? (listK > 0.5 ? P.machine : C.strong) : P.unseen;
    K.text(nm, x, ny, { font: 'mono', weight: 600, size: 26, align: 'center', alpha: na, color: col });
    if (approved && listK > 0) {
      const tw = K.measure(nm, { font: 'mono', weight: 600, size: 26 });
      K.layer(na * listK, () => K.icon('check', x - tw / 2 - 20, ny - 9, 24, { color: P.machine, w: 3.5 }));
    }
  });
  // not on the list
  const naK = Math.min(diffFade, K.io(t, tAdd + 1.6, 0.5, 'out'));
  if (naK > 0) M.chip('not on the approved list', 1270, 880, 'unseen', { k: naK, size: 28 });

  // ---------------------------------------------------------------- top-right slot, one idea at a time
  const SX = 1300; // centre of the slot
  const slot = (a, b) => K.env(t, a, b, 0.45);

  // 1. what a dependency is
  const s1 = slot(tDeps, tOther - 0.4);
  if (s1 > 0) K.layer(s1, () => {
    K.eyebrow('DEPENDENCIES', 900, 540, { size: 26, color: C.head, tracking: 4, align: 'center' });
    M.label("other people's code", 900, 598, 'plain', { size: 40 });
  });

  // 2. a package for every want (paraphrase)
  const s2 = slot(tAdd + 0.3, tStr - 0.35);
  if (s2 > 0) M.dated(1000, 270, 600, 'GitClear CEO · Jul 2026', 'A new package for every want.', { alpha: s2, k: s2, badge: { text: 'paraphrase', kind: 'paraphrase' } });

  // 3. each one runs with your keys
  const s3 = slot(tStr, tVul - 0.3);
  if (s3 > 0) K.layer(s3, () => {
    const txt = "a stranger's code, with your keys";
    const tw = K.measure(txt, { ...M.type.read, size: 36 });
    const x0 = SX - (tw + 64) / 2;
    K.glow(x0 + 22, 366, 40, C.head, 0.35);
    K.icon('key', x0 + 22, 366, 44, { color: P.machine, w: 3.5 });
    M.label(txt, x0 + 64, 378, 'plain', { size: 36, align: 'left' });
  });

  // 4. agents' picks, one study
  const s4 = slot(tVul + 0.2, tFake - 0.35);
  if (s4 > 0) M.dated(990, 250, 620, 'arXiv study · Jan 2026', "Agents' package picks made security worse on balance.", { kind: 'unseen', alpha: s4, k: s4, badge: { text: 'one study', kind: 'preview' } });

  // 5. invented names
  const s5 = slot(tFake + 0.2, tWorm - 0.35);
  if (s5 > 0) K.layer(s5, () => {
    M.label("a name that didn't exist", SX, 330, 'unseen', { size: 40 });
    M.label('attackers register the invented names', SX, 396, 'note', { size: 30 });
  });

  // 6. worms
  const s6 = slot(tWorm + 0.1, tDiff - 0.3);
  if (s6 > 0) {
    M.dated(790, 190, 490, 'Shai-Hulud · Sep 2025', 'A self-spreading npm worm; more waves since.', { kind: 'unseen', alpha: s6, k: s6 });
    const k2 = Math.min(s6, K.io(t, tAug, 0.6));
    if (k2 > 0) M.dated(1310, 190, 490, 'npm worm · Aug 2026', "Hid files inside a hijacked project's code.", { kind: 'unseen', alpha: k2, k: k2 });
    // the file in the newest van's crate runs in an AI editor
    const rk = Math.min(s6, K.io(t, tRun, 0.6, 'out'));
    if (rk > 0) {
      const crate = { x: X0 + 4 * GAP - VS / 2 + VS * 0.56, y: ROAD - VS * 0.56 * 0.5 - VS * 0.085 * 1.1 };
      K.arrow(crate.x + 14, crate.y - 4, 1500, 530, { k: rk, color: P.unseen, w: 2.5, cx: 1400, cy: 566 });
      M.chip('runs when opened in an AI editor', 1500, 500, 'unseen', { k: rk, icon: 'code', size: 28 });
    }
  }

  // ---------------------------------------------------------------- the diff you'll actually meet
  const dk = K.io(t, tDiff, 0.6, 'out');
  if (dk > 0) {
    K.layer(dk, () => {
      const dy = (1 - dk) * 18;
      const r = K.win(820, 186 + dy, 960, 530, { kind: 'code', title: 'package.json', titleSize: 26, focus: true });
      const lines = [
        ['  "dependencies": {', 0],
        ['    "http": "^2.1.0",', 0],
        ['    "dates": "^3.0.4",', 0],
        ['    "charts": "^1.9.2",', 1],
        ['    "icons": "^4.0.0",', 1],
        ['    "forms": "^0.8.1",', 1],
        ['    "csv-tools": "^2.2.0",', 1],
        ['    "md-render": "^5.1.3"', 1],
        ['  }', 0],
      ];
      lines.forEach(([s, plus], i) => {
        const ly = r.y + 46 + i * 46;
        const lk = plus ? K.io(t, tDiff + 0.35 + (i - 3) * 0.18, 0.4, 'out') : 1;
        if (plus) {
          K.layer(lk, () => {
            const g = K.ctx(); g.save(); g.fillStyle = K.rgba(C.accent, 0.12); g.fillRect(r.x + 2, ly - 32, r.w - 4, 44); g.restore();
            K.text('+', r.x + 30, ly, { font: 'mono', weight: 700, size: 28, color: P.unseen });
          });
        }
        K.text(s, r.x + 64, ly, { font: 'mono', weight: 600, size: 28, color: plus ? P.unseen : C.body, alpha: plus ? lk : 1 });
      });
      M.chip('five new lines nobody asked for', 1300, 800, 'unseen', { k: K.io(t, tDiff + 1.3, 0.5, 'out') });
    });
  }
});
