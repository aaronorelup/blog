/* 00.05 · scene 02 — Where it lives
   The course map (K.map). The lamp over our desk IS lantern 0 of the map's string (M.lamp draws K.map.lantern(t, 0)),
   so this scene lifts it out, shows it hanging over a ghost of the desk, then sends it to point at the shelves.
   Beats (local seconds, cues.json):
     - lead-in       01's title desk shrinks toward the lower-left corner and fades out by 0.8 s while the map
                     assembles (map.js's own staggered reveal); the six lanterns are bare ghosts.
     - [[pin]]       on "Start" the pin drops on the Start gate (the scene's one 'back'); the districts dim.
     - "lantern"     ("the lantern you carry") lantern 0 lights alone.
     - [[lanterns]]  the other five light left to right, the districts come back; the label row fades in on "AI";
                     on "light all six" a pool of lantern light falls on each district.
     - [[tour]]      lantern 0 is lifted out of the string and glides, growing, to the centre; the map veils and a
                     ghost of our desk (alpha .35) fades in under it: this lantern is the lamp over our desk. On
                     "each piece" three faint pieces land on the ghost desk.
     - [[shelve]]    the ghost desk leaves, the veil lifts, the lantern settles into the gap between the two rows of
                     districts and three dashed arrows draw from it to the rows that own the deeper lessons, each row
                     washed as it is named: 06 (memory), 10 (plugins · caching), 15 + 16 (plans · personal agents).
   Exit: the arrows and labels fade, the lantern dissolves at the hub as its twin on the string fades back in; map calm, pin glowing. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, P = M.palette;

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 2.69);
  const tCarry = S.find('lantern', 0, 6.48);              // "the lantern you carry"
  const tLan = S.cue('lanterns', 8.15);
  const tAI = S.find(/^AI/, 0, 10.87);
  const tAll = S.find('light', 0, 13.53);                // "they light all six"
  const tTour = S.cue('tour', 14.73);
  const tPiece = S.find('piece', 0, 18.25);
  const tShelve = S.cue('shelve', 20.94);
  const tCode = S.find('Code', 0, 22.0);
  const tPlug = S.find('plugins', 0, 22.77);
  const tCache = S.find('caching', 0, 23.86);
  const tPlans = S.find('work', 0, 26.44);
  const tAgents = S.find('agents', 0, 27.95);
  // dormant 4th pin: appears only if the narration names The Machine in this section (reviewer asked for the clause
  // "...and context and instruction files in The Machine"; it needs a re-voice, so until then it never shows)
  const tMach = S.find(/^Machine/, 0, -1);
  const hasMach = tMach > 0;
  const tOut = S.out || 30.4;
  // the lantern returns to the string early enough to be home, fully lit, before the hand-over (S.out = 30.0)
  const tBack = Math.min((hasMach ? tMach : tAgents) + 1.0, tOut - 1.0);

  // ------------------------------------------------------------------ the travelling lantern (lantern 0)
  const L0 = MAP.lanternAt(0);
  const TOUR = { x: 960, y: 318, s: 1.6 };               // over the ghost desk
  const HUB = { x: 1088, y: 510, s: 0.95 };              // inside The Code, right of '07 Concurrency', under the memory pill
  const goTour = K.io(t, tTour, 1.1);
  const goHub = K.io(t, tShelve - 0.1, 0.9);
  const goBack = K.io(t, tBack, 0.6);
  let lx = K.lerp(L0.x, TOUR.x, goTour), ly = K.lerp(L0.y, TOUR.y, goTour), ls = K.lerp(1, TOUR.s, goTour);
  lx = K.lerp(lx, HUB.x, goHub); ly = K.lerp(ly, HUB.y, goHub); ls = K.lerp(ls, HUB.s, goHub) * (1 - goBack);
  const lifted = t >= tTour && goBack < 1;               // lift + redraw at the same spot shows no jump; on the way back it
  // dissolves at the hub while the string's own lantern 0 fades back in (no flight across the cards' text)

  // ------------------------------------------------------------------ map states
  const pinDrop = K.io(t, tPin, 0.7, 'back');
  const pinGlow = K.io(t, tPin + 0.15, 0.6);
  const focusK = K.io(t, tPin, 0.8) * (1 - K.io(t, tLan, 0.9));
  const lanterns = (i) => (i === 0 ? K.io(t, tCarry, 0.6) : K.stagger(t, tLan, i - 1, 0.14, 0.6));
  const labelK = K.io(t, tAI - 0.3, 0.6);
  const pool = (i) => K.stagger(t, tAll, i, 0.12, 0.7) * (1 - K.io(t, tTour, 0.6));
  // the veil over the map while the lantern hangs over our desk
  const veil = 0.9 * K.io(t, tTour, 0.9) * (1 - K.io(t, tShelve - 0.1, 0.8));
  const deskK = K.io(t, tTour + 0.5, 0.9) * (1 - K.io(t, tShelve - 0.2, 0.5));
  // rows that own the deeper lessons, washed as they are named
  const washA = K.io(t, tShelve, 0.6), washB = K.io(t, tPlug, 0.6), washC = K.io(t, tPlans, 0.6);
  const washD = hasMach ? K.io(t, tMach, 0.6) : 0;
  const arrowsOut = 1 - K.io(t, tBack - 0.1, 0.6);
  const labelsOut = 1 - K.io(t, tOut - 0.5, 0.45);

  K.bg();

  // ------------------------------------------------------------------ the map
  MAP.draw(t, {
    t0: 0, focus: '00', focusK, dim: 0.55,
    pin: '00', pinDrop, pinK: K.io(t, tPin, 0.25), pinGlowK: pinGlow,
    lanterns, lanternLabels: labelK,
    lanternHide: (i) => (i === 0 && lifted ? 1 : 0),
    rowWash: { '06': { k: washA }, '10': { k: washB }, '15': { k: washC }, '16': { k: washC }, '03': { k: washD } },
  });
  // "they light all six": a soft pool of lantern light on each district
  MAP.DISTRICTS.forEach((d, i) => { const k = pool(i); if (k > 0) K.glow(d.x + d.w / 2, d.y + d.h / 2, 260, C.head, 0.1 * k); });

  // ------------------------------------------------------------------ 01's desk leaving (lead-in only)
  const shrink = K.io(t, -0.4, 1.1);
  const leaveA = 1 - K.io(t, 0.1, 0.7);
  if (leaveA > 0) {
    const L = M.layout.title;
    K.layer(leaveA, () => K.at(K.lerp(L.cx, 260, shrink), K.lerp(L.cy, 800, shrink), K.lerp(1, 0.28, shrink), 0, () => {
      M.stage(t, { desk: M.desk(L.size, { cx: 0, cy: 0 }), lamp: { cordTop: L.lamp.cordTop - L.cy } });
    }));
  }

  // ------------------------------------------------------------------ veil + ghost desk (tour)
  if (veil > 0) K.layer(veil, () => { const g = K.ctx(); g.fillStyle = C.page; g.fillRect(0, 0, K.W, K.H); });
  const GD = M.desk({ w: 860, h: 280 }, { cx: 960, cy: 640 });
  if (deskK > 0) {
    M.stage(t, { desk: GD, lamp: false, clerk: { bob: true }, alpha: 0.35 * deskK, floor: 0.4 });
    // "where each piece goes": three faint pieces land on the ghost desk
    const pieces = [
      (x, y, a) => M.paper(x, y, { w: 120, h: 80, alpha: a }),
      (x, y, a) => M.file(x, y, 100, { ext: 'png', alpha: a }),
      (x, y, a) => M.paper(x, y, { w: 110, h: 74, kind: 'note', alpha: a, rot: 0.04 }),
    ];
    const spots = [[0.22, 0.55], [0.5, 0.6], [0.78, 0.5]];
    pieces.forEach((fn, i) => {
      const p = M.spot(GD, spots[i][0], spots[i][1]);
      const fromX = i === 0 ? 40 : i === 2 ? 1880 : p.x, fromY = i === 1 ? 1120 : p.y;
      const ld = M.land(t, tPiece + i * 0.15, p.x, p.y, fromX, fromY, M.motion.land);
      if (ld.a > 0) fn(ld.x, ld.y, 0.55 * ld.a * deskK);
    });
  }

  // ------------------------------------------------------------------ the travelling lantern
  if (lifted) {
    // the cone onto the ghost desk only while the desk is there
    M.lamp(t, { x: lx, y: ly, s: ls, glowK: 1.4 + 0.6 * goTour * (1 - goHub), cone: deskK > 0 ? GD : null, cordTop: ly - 6 * ls, lit: 1 });
  }

  // ------------------------------------------------------------------ the string's lantern 0 lights back up
  // fully lit at every moment: the hub lantern shrinks to a spark while its twin grows back on the string from one
  if (goBack > 0 && goBack < 1) {
    const p = MAP.lanternAt(0);
    K.glow(p.x, p.y + 16, 120, C.head, 0.3 * Math.sin(Math.PI * goBack));
    MAP.lantern(t, 0, { s: goBack, lit: 1 });
  }

  // ------------------------------------------------------------------ shelve: arrows from the lantern to the rows
  if (t >= tShelve - 0.2 && labelsOut > 0) {
    const LC = { x: HUB.x, y: HUB.y + 16 * HUB.s };       // lantern icon centre at the hub
    const c06 = MAP.chipPos('06'), c10 = MAP.chipPos('10'), c15 = MAP.chipPos('15'), c16 = MAP.chipPos('16');
    const col = P.handoff || C.accent;
    // 06 sits right above the hub lantern, so it gets no arrow: its row wash and pill land on "memory"
    const arrows = [
      { from: [LC.x + 22, LC.y + 14], to: [c10.x - 18, c10.y], at: tPlug, bend: -0.12 },
      { from: [LC.x - 10, LC.y + 30], to: [c15.x + 345, (c15.y + c16.y) / 2], at: tPlans, bend: 0.15 },
    ];
    if (hasMach) { const c03 = MAP.chipPos('03'); arrows.push({ from: [LC.x - 30, LC.y + 2], to: [650, c03.y + 56], at: tMach, bend: 0.2 }); }
    if (arrowsOut > 0) K.layer(arrowsOut, () => arrows.forEach((a) => {
      const k = K.io(t, a.at, 0.6);
      if (k > 0) K.arrow(a.from[0], a.from[1], a.to[0], a.to[1], { k, bend: a.bend, color: col, w: 3, dash: [8, 8] });
    }));
    // labels beside the washed rows (26 px)
    const lab = (s, x, y, a, align) => K.layer(a * labelsOut, () => K.pill(s, x, y, { size: 26, color: C.head, align }));
    lab('memory', c06.x + 280, c06.y, K.io(t, tShelve + 0.75, 0.4));   // after the lantern has passed under it
    // "plugins · caching" is too wide for row 10's free end, so it hangs as a tab under the right end of the
    // row-10 highlight, inside The Network card, in the empty space right of '11 Websites'
    {
      const a = K.io(t, tCache - 0.2, 0.5) * labelsOut;
      if (a > 0) K.layer(a, () => {
        const s = 'plugins · caching', size = 26, to = { size, font: 'ui', weight: 600 };
        const w = K.measure(s, to) + 26, h = 46, xr = c10.d.x + c10.d.w - 22, x0 = xr - w, y0 = c10.y + 22;
        K.card(x0, y0, w, h, { r: h / 2, fill: C.tile, stroke: C.line2 });
        K.text(s, x0 + w / 2, y0 + h / 2 + size * 0.34, { ...to, color: C.head, align: 'center' });
      });
    }
    lab('plans · personal agents', 960, c16.y + 50, K.io(t, tAgents - 0.3, 0.5));
    if (hasMach) lab('context · instructions', 485, MAP.chipPos('03').y + 52, K.io(t, tMach + 0.2, 0.5), 'center');
  }
});
