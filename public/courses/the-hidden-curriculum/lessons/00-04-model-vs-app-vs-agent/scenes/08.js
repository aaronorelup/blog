/* 08 — Driving across the map.
   The car from 01–07, shrunk to a map marker (M.car detail 'mini'), drives the road that runs between the
   two rows of districts: Start → The Machine → The History, then turns round and parks at Trust's edge.
   Each district lights as the car reaches it (focus cross-fade), its row washes gold and a pill names what
   the agent does there. On the lantern line the six lanterns brighten and every district comes back up;
   a lock closes in front of the car ("only goes where you let it"); then on [[later]] the map eases back
   (z .92, panned left) to open a clear band on the right, where a leaderboard card is set aside on a LATER shelf. */
SCENE('08', (t, S) => {
  const M = window.M, C = K.C, g = K.ctx();
  K.bg();

  // ---- cue times (local) -------------------------------------------------------------------------
  const cMachine = S.cue('machine', 2.66), cHistory = S.cue('history', 6.05), cTrust = S.cue('trust', 9.42);
  const cLantern = S.cue('lantern-line', 13.92), cLater = S.cue('later', 20.05);
  const wFiles = S.find('files', 0, cMachine + 0.8);
  const wGit = S.find(/^git/, 0, cHistory + 1.35);
  const wKeys = S.find('keys', 0, cTrust + 0.6);
  const wTrust = S.find(/^Trust/, 0, cTrust + 1.85);
  const wWhere = S.find('where', 0, cLantern + 5);
  const wBoard = S.find(/^leaderboard/, 0, cLater + 1.9);
  const wSafe = S.find('Safe', 0, cLater + 3.1);

  // ---- camera: on [[later]] the whole map eases back a touch and slides left, opening a clear band
  // right of it for the LATER shelf (world x 85 Start edge lands at ~92; the dotted connector at 1720
  // lands at ~1597, the Network card's right edge at ~1551).
  const cam = K.cam(t, [{ at: 0, x: 960, y: 540, z: 1 }, { at: cLater - 0.1, x: 1028, y: 540, z: 0.92, d: 1.1 }]);
  g.save();
  g.translate(960, 540); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);

  // ---- the road: the gutter between the two rows of districts --------------------------------------
  const ROAD_Y = 571;                       // middle of the 26 px gap between the rows (cards end 558, start 584)
  const CY = ROAD_Y - 20;                   // mini car centre: its wheels rest on the road
  const S_CAR = M.layout.mini.s;            // 0.13
  const X0 = 150, XM = 485, XH = 1435;      // start, The Machine, The History
  // park at Trust's edge, right of the Code card's longest row so the car never sits on text
  const code = K.map.district('code');
  const codeTextR = code.x + 84 + Math.max(...code.mods.map((m) => K.measure(K.map.MODULES[m], { size: K.map.TYPE.mod })));
  const XT = Math.max(codeTextR + 90, 1085);

  // car x along the road (pure function of t), and its heading (1 = nose right, -1 = nose left)
  const d1 = K.io(t, cMachine - 1.7, 1.9, 'io');          // Start → Machine, arriving as "files" is said
  const d2 = K.io(t, cHistory, 1.5, 'io');                // Machine → History
  const turnK = K.io(t, cTrust, 0.55, 'io');               // U-turn in place
  const d3 = K.io(t, cTrust + 0.5, 1.2, 'io');             // History → Trust (heading west)
  let cx = X0 + (XM - X0) * d1 + (XH - XM) * d2 - (XH - XT) * d3;
  const flip = Math.cos(Math.PI * turnK);                  // 1 → -1 through 0 (the car turns round)
  const reached = Math.max(cx, X0 + (XM - X0) * d1 + (XH - XM) * d2); // furthest point driven
  const moving = (d1 > 0 && d1 < 1) || (d2 > 0 && d2 < 1) || (d3 > 0 && d3 < 1);

  // ---- which district is lit -----------------------------------------------------------------------
  const kM = K.io(t, cMachine - 0.2, 0.8), kH = K.io(t, cHistory + 0.8, 0.8), kT = K.io(t, cTrust + 1.0, 0.8);
  const release = K.io(t, cLantern, 1.2);                 // "it lights every district": focus lets go
  const lanternUp = K.io(t, cLantern, 1.0);
  const lanternPulse = K.io(t, cLantern, 0.9) * (1 - K.io(t, cLantern + 1.6, 1.6));
  const routeGlow = K.io(t, wWhere - 0.1, 0.6) * (1 - K.io(t, wWhere + 1.0, 1.2));

  const wash = {
    '03': { k: K.io(t, wFiles - 0.1, 0.6) },
    '08': { k: K.io(t, wGit - 0.1, 0.6) },
    '14': { k: K.io(t, wKeys, 0.6) },
  };
  const base = {
    dim: 0.55, rowWash: wash,
    lanterns: 0.45 + 0.55 * lanternUp,
    lanternLabels: K.io(t, cLantern + 0.5, 0.8),
  };
  // the map, cross-fading its focus district to district (cards are opaque, so a second draw on top
  // at alpha k is a clean cross-fade; the lantern string, path and pin are drawn once, in the base)
  const stages = [['00', 1], ['machine', kM], ['history', kH], ['trust', kT]];
  let lastIdx = 0; stages.forEach(([, k], i) => { if (k >= 1) lastIdx = i; });
  const fk = 1 - release;
  K.map.draw(t, { ...base, focus: stages[lastIdx][0], focusK: fk, pin: '00', pinK: 0.4, pinGlowK: 0.35 });
  const nxt = stages[lastIdx + 1];
  if (nxt && nxt[1] > 0) {
    K.layer(nxt[1], () => K.map.draw(t, { ...base, focus: nxt[0], focusK: fk, path: 0, pinGlowK: 0, districtK: (id) => (id === 'ai' ? 0 : 1) }));
  }

  // lantern pulse: one slow swell over all six together (no flash)
  if (lanternPulse > 0) for (let i = 0; i < K.map.LANTERNS.n; i++) {
    const p = K.map.lanternAt(i);
    K.glow(p.x, p.y + 16, 110, C.head, 0.32 * lanternPulse);
  }

  // ---- road and route ------------------------------------------------------------------------------
  K.line(X0 - 60, ROAD_Y, XH + 120, ROAD_Y, { color: C.line2, w: 2, dash: [2, 12], alpha: 0.7 });
  const rx0 = X0 - 60, rx1 = reached - 50;
  if (rx1 > rx0) {
    if (routeGlow > 0) K.line(rx0, ROAD_Y, rx1, ROAD_Y, { color: C.head, w: 10, alpha: 0.22 * routeGlow });
    K.line(rx0, ROAD_Y, rx1, ROAD_Y, { color: C.head, w: 3, alpha: 0.8 + 0.2 * routeGlow });
  }

  // ---- district pills ------------------------------------------------------------------------------
  const pillsOut = 1 - K.io(t, cLantern, 0.6);
  const PILL_Y = 228;                                    // the band between the lantern string and the cards
  const pM = K.io(t, wFiles, 0.5) * pillsOut * (1 - 0.45 * K.io(t, cHistory + 1, 0.6));
  const pH = K.io(t, wGit, 0.5) * pillsOut * (1 - 0.45 * K.io(t, cTrust + 1, 0.6));
  const trust = K.map.district('trust');
  const pT = K.io(t, wKeys + 0.3, 0.5) * (1 - 0.45 * K.io(t, cLater, 0.6));
  if (pM > 0) K.layer(pM, () => M.tag('your files, your terminal', K.map.district('machine').x + 235, PILL_Y + (1 - pM) * 8));
  if (pH > 0) K.layer(pH, () => M.tag('git', K.map.district('history').x + 235, PILL_Y + (1 - pH) * 8));
  if (pT > 0) K.layer(pT, () => M.tag('keys to your accounts', trust.x + trust.w / 2, trust.y + trust.h - 46 + (1 - pT) * 8));

  // ---- the lock: "only goes where you let it" --------------------------------------------------------
  const lockK = K.io(t, wWhere, 0.6);
  const LX = XT - 122;                                   // on the road, just ahead of the parked car's nose
  if (lockK > 0) {
    K.layer(lockK, () => {
      K.glow(LX, ROAD_Y, 56, C.head, 0.3 * lockK);
      K.at(LX, ROAD_Y, 0.7 + 0.3 * lockK, 0, () => K.card(-25, -25, 50, 50, { r: 25, fill: C.tile, stroke: C.head, lw: 2, shadow: false }));
      K.icon('lock', LX, ROAD_Y - (1 - lockK) * 14, 28, { color: C.head, w: 2.4 });
    });
  }

  // ---- the car ---------------------------------------------------------------------------------------
  const bob = moving ? K.wave(t, 9, 0.8) : K.wave(t, M.motion.bob.speed, 1.2);
  g.save();
  g.translate(cx, CY + bob);
  g.scale(Math.abs(flip) < 0.04 ? 0.04 * Math.sign(flip || 1) : flip, 1);
  M.car(t, 0, 0, S_CAR, { detail: 'mini', head: 1, roll: cx / 7.3 });
  g.restore();

  // the key hangs from the car once it may hold keys
  const keyK = K.io(t, wKeys, 0.6);
  if (keyK > 0) {
    const kx = cx, sway = K.wave(t, 1.4, 0.12);
    K.layer(keyK, () => {
      K.line(kx, CY + 10, kx, CY + 38, { color: C.soft, w: 1.5 });
      K.at(kx, CY + 38, 1, sway, () => K.icon('key', 0, 18 - (1 - keyK) * 10, 36, { color: C.head, w: 2.2 }));
    });
  }

  g.restore();   // end of the world camera

  // ---- LATER: this month's leaderboard, set aside ------------------------------------------------------
  // Drawn in screen space, in the band the camera opened (x ~1610-1840, nothing of the map in it): the card
  // slides in on "leaderboard" beside the upper row, then on "Safe to ignore" drops onto a LATER shelf low in
  // the band and dims. Label and card end 30 px inside the 1840 safe edge.
  const cardIn = K.io(t, cLater + 0.45, 0.7);
  if (cardIn > 0) {
    const TT = { font: 'ui', size: 26, weight: 600 };
    const L1 = '#1 model', L2 = 'this month';
    const PAD = 16, R = 1810;
    const W = Math.ceil(Math.max(K.measure(L1, TT), K.measure(L2, TT))) + PAD * 2, H = 120;
    const x0 = R - W;                                    // about 1640, clear of the shifted connector (~1597)
    const SHELF_Y = 846;
    const down = K.io(t, wSafe, 0.8);
    const y = K.lerp(452, SHELF_Y - 6 - H, down), x = x0 + (1 - cardIn) * 36;
    const dimK = 1 - 0.6 * K.io(t, wSafe + 0.5, 0.8);
    const sk = K.io(t, wSafe - 0.2, 0.6);
    K.line(x0 - 6, SHELF_Y, R + 6, SHELF_Y, { color: C.line2, w: 2, k: sk });
    K.eyebrow('later', R, SHELF_Y + 38, { align: 'right', alpha: sk, size: 26 });
    K.layer(cardIn, () => {
      K.card(x, y, W, H, { r: 18, fill: C.tile, stroke: C.line2, shadow: false });
      K.layer(dimK, () => {
        K.text(L1, x + PAD, y + 38, { ...TT, color: C.strong });
        K.text(L2, x + PAD, y + 70, { ...TT, color: C.strong });
        [0.82, 0.58].forEach((f, i) => {
          const by = y + 86 + i * 12;
          g.save(); g.fillStyle = K.rgba(C.soft, 0.55 - i * 0.12); K.rr(x + PAD, by, (W - PAD * 2) * f, 7, 3.5); g.fill(); g.restore();
        });
      });
    });
  }
});
