/* 00.02 · scene 02 — Where it lives
   The course map (K.map). The road from 01 waits off-screen and returns in 03.
   Beats (local seconds from cues.json):
     - open      whole map at rest (t0 0); lanterns a bare ghost cord, no labels.
     - [[pin]]   the map's own you-are-here pin (terracotta, as on every lesson's map) drops on the Start
                 gate with the scene's one 'back'; the gate gets map.js's pinned gold ring; the camera eases
                 toward the Start (z 1 -> 1.2) and the six districts veil to near-ghosts (0.88) so the cards the
                 zoom crops at the frame edges and under the caption band read as background, not as errors.
     - "Orientation"  a note to the RIGHT of the gate (joined by a short gold stem) names the module and its
                 question on two lines, inside the Machine card's footprint; the Machine card behind it veils fully so nothing half-covered peeks out.
     - "lantern" (you carry)  a small gold lantern lifts off the Start gate, arcs up to the string and hangs
                 itself as the first lantern, which stays half-lit; meanwhile the camera keeps a slow push (z 1.2 -> 1.27)
                 so the 6 s on the Start never sit still.
     - [[gate]]  the note leaves, the camera eases back to z 1, the districts come back (veil 0.45).
       "six districts"  all six district cards brighten together once (gold outline + veil dip, M.bump).
     - "One road"  the districts veil further and the five-stop road (M.road, a slim strip geom 220 x 78 at y 579, ghost stops)
                 draws across the middle of the map on a page-coloured band, under the Start gate: the road runs
                 through every district. "five stops": the five stops pulse left to right (0.15 s stagger), then rest
                 as ghosts, so 03 can light them one by one.
     - [[lanterns]]  the six lanterns light left to right (fast stagger, all lit by ~0.8 s after the cue) and
                 a 26/30 px label row "THE LANTERNS · AI  lights every district" fades in (drawn here, since
                 map.js's row is 20/24 px); the districts brighten a little more: light falls on every district.
   Exit: whole map, Start pinned (pin bobbing), the ghost road across it, six lanterns glowing gently. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, G = () => K.ctx(), GATE = MAP.GATE;

  // ------------------------------------------------------------------ beats
  const tPin = S.cue('pin', 2.125);
  const tOrient = S.find('Orientation', 0, 2.97);
  const tGate = S.cue('gate', 8.417);
  const tSix = S.find('six', 0, 9.88);
  const tLan = S.cue('lanterns', 13.352);
  const tCarry = S.find('lantern', 0, 5.793);   // "...and the lantern you carry"
  const tOne = S.find('One', 0, 11.227);
  const tFive = S.find('five', 0, 12.017);

  // ------------------------------------------------------------------ camera
  const cam = K.cam(t, [
    { at: -10, x: 960, y: 540, z: 1 },
    { at: tPin, x: 600, y: 430, z: 1.2, d: 0.8 },
    { at: tPin + 0.8, x: 590, y: 420, z: 1.27, d: tGate - tPin - 0.8 },   // slow push while the note is read
    { at: tGate, x: 960, y: 540, z: 1, d: 0.8 },
  ]);

  // ------------------------------------------------------------------ veils
  const sixK = window.M.bump(t, tSix, 1.0);
  const roadK = K.io(t, tOne, 0.6);
  const veil = 0.88 * K.io(t, tPin, 0.8) - 0.43 * K.io(t, tGate, 0.8) + 0.3 * roadK - 0.25 * K.io(t, tLan + 0.3, 0.8) - 0.4 * sixK;
  const noteK = K.io(t, tOrient, 0.5) * (1 - K.io(t, tGate - 0.45, 0.45));

  // ------------------------------------------------------------------ lanterns
  const carriedK = K.io(t, tCarry + 1.15, 0.5);  // the carried lantern has reached the string
  const lanterns = (i) => Math.max(K.stagger(t, tLan - 0.05, i, 0.08, 0.45), i === 0 ? 0.55 * carriedK : 0);
  const carryU = K.io(t, tCarry, 1.4), carryA = K.io(t, tCarry, 0.3) * (1 - K.io(t, tCarry + 1.25, 0.4));
  const labelK = K.io(t, tLan + 0.25, 0.5);

  // gate highlight + pin
  const gateK = K.io(t, tPin + 0.15, 0.6);
  const dropK = K.io(t, tPin, 0.7, 'back');
  const pinA = K.io(t, tPin, 0.25);
  const bob = K.wave(t, 2.4, 5);

  K.bg();
  K.withCam(cam, () => {
    MAP.draw(t, { t0: 0, lanterns, lanternLabels: 0 });

    // page-coloured veils over each district's opaque footprint; the Machine card goes fully quiet while
    // the Orientation note sits on it
    MAP.DISTRICTS.forEach((d) => {
      const v = K.clamp(veil + (d.id === 'machine' ? 0.12 * noteK : 0));
      if (v > 0.002) { K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); G().fillStyle = K.rgba(C.page, v); G().fill(); }
    });

    // "the six districts": all six outlines brighten together, once
    if (sixK > 0.002) MAP.DISTRICTS.forEach((d) => {
      K.rr(d.x, d.y, d.w, d.h, 24);
      G().save(); G().strokeStyle = K.rgba(C.head, 0.75 * sixK); G().lineWidth = 2.5; G().stroke(); G().restore();
      K.glow(d.x + d.w / 2, d.y + d.h / 2, 260, C.head, 0.06 * sixK);
    });

    // the Lanterns' label row, larger than map.js's 20/24 px row, at its spot under the string
    if (labelK > 0) K.layer(labelK, () => {
      const eb = { size: 26, weight: 600, tracking: 3, upper: true, color: C.head };
      const name = MAP.LANTERNS.name + ' · AI', y = MAP.LANTERNS.y + 66;
      K.eyebrow(name, 250, y, eb);
      K.text(MAP.LANTERNS.q, 250 + K.measure(name, eb) + 24, y, { size: 30, color: C.body, font: 'ui' });
    });

    // the Start gate, pinned: map.js's own pinned look, eased in
    if (gateK > 0) {
      K.glow(GATE.x, GATE.y, 110, C.head, 0.22 * gateK);
      K.layer(gateK, () => {
        K.card(GATE.x - 50, GATE.y - 50, 100, 100, { r: 50, fill: C.tile, stroke: C.head, glow: 0.8 });
        K.text(GATE.mod, GATE.x, GATE.y + 10, { font: 'mono', size: 28, color: C.head, weight: 700, align: 'center' });
        K.text(GATE.label, GATE.x, GATE.y + 86, { size: MAP.TYPE.endLabel, color: C.strong, align: 'center', weight: 600 });
      });
    }

    // the lantern you carry: lifts off the gate and arcs up to hang as the first lantern on the string
    if (carryA > 0) {
      const L0 = MAP.lanternAt(0), u = carryU;
      const p0 = { x: GATE.x, y: GATE.y - 74 }, p1 = { x: GATE.x - 10, y: L0.y + 10 }, p2 = { x: L0.x, y: L0.y };
      const bx = (1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * p1.x + u * u * p2.x;
      const by = (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * p1.y + u * u * p2.y;
      K.glow(bx, by + 16, 70, C.head, 0.35 * carryA);
      K.layer(carryA, () => K.at(bx, by, 1, K.wave(t, 1.6, 0.08), () => K.icon('lantern', 0, 16, 40, { color: C.head, w: 2.4 })));
    }

    // the you-are-here pin, at map.js's spot for the gate, dropping 70 px with one 'back' overshoot
    if (pinA > 0) {
      const px = GATE.x + 58, py = GATE.y - 40 + bob - (1 - dropK) * 70;
      K.layer(pinA, () => K.icon('pin', px, py, 44, { color: C.accent }));
    }
  });

  // ------------------------------------------------------------------ the road, laid across the map ("One road, five stops")
  // drawn in screen space; the camera is back at z 1 by then (gate + 0.8 s < "One").
  if (roadK > 0) {
    K.layer(K.io(t, tOne - 0.15, 0.4), () => { K.rr(128, 536, 1664, 86, 24); G().fillStyle = K.rgba(C.page, 0.94); G().fill(); });
    const gm = window.M.geom('strip', { y: 579, h: 78, icon: 32 })   // slim: fits the gap between the district rows, cutting no text;
    const fiveK = (i) => window.M.bump(t, tFive + 0.15 * i, 0.9);
    window.M.road(t, {
      geom: gm, alpha: roadK, ghost: 0.45, eyebrow: false,
      band: K.io(t, tOne, 0.8),
      arrows: (i) => K.io(t, tOne + 0.2 + 0.12 * i, 0.5),
      lit: (i) => 0.75 * fiveK(i), pulse: fiveK,
    });
  }

  // ------------------------------------------------------------------ the Orientation note (screen space)
  // right of the gate, level with it, over the (fully veiled) Machine card; leaves before the pull-back
  if (noteK > 0) {
    const gx = (GATE.x + 52 - cam.x) * cam.z + 960, gy = (GATE.y - cam.y) * cam.z + 540;
    const nx = 556, nw = 520, nh = 186, ny = gy - nh / 2;
    K.layer(noteK, () => {
      K.line(gx + 4, gy, nx - 4, gy, { color: K.rgba(C.head, 0.7), w: 2 });
      G().save(); G().translate((1 - noteK) * 16, 0);
      K.card(nx, ny, nw, nh, { fill: K.rgba(C.tile, 0.97), stroke: K.rgba(C.head, 0.55), r: 22, shadow: true });
      K.text('00', nx + 40, ny + 56, { font: 'mono', size: 24, color: C.head, weight: 700 });
      K.eyebrow('Orientation', nx + 84, ny + 56, { size: 22, tracking: 3, color: C.head });
      K.text('what this course is,', nx + 40, ny + 108, { font: 'ui', size: 30, color: C.body });
      K.text('and the lantern you carry', nx + 40, ny + 150, { font: 'ui', size: 30, color: C.body });
      G().restore();
    });
  }
});
