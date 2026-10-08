/* 03 — The mental model (fix pass 1)
   The shared single map (M.card, the same box as every scene) grows in from 0.9 to 1 with its 'root' edge and 'the disk' label.
   While "picture a map drawn on the disk" is said, a faint street grid is drawn on the disk and drifts very slowly, so the
   empty card keeps moving through the narration. The grid fades out before the handover so section 04 starts on the plain map.
   "Now picture giving directions": a hollow start ring appears at the map centre, exactly where the dot will sit, and a
   strip reads "3 streets east, then 2 up" (on a small backing pill, so no grid line runs through it). The gold route is drawn
   FROM that centre spot: directions need a start, and the start is the spot you stand on.
   "On Windows, each drive": a second small disk box appears at the right with its own root line, labelled D:\ root.
   "Those directions only work from one spot": the route dims and the gold you-are-here dot pops in on the start ring.
   The label "working directory" types in under the dot; on "running program" a faint gold ring marks the dot as a program's start.
   The dot stays put for section 04. Exit: calm. */
SCENE('03', (t, S) => {
  K.bg();
  const P = M.P, L = M.L, C = K.C;
  const cDot = S.cue('you-are-here', 21.1);
  const cLabel = S.cue('dot-is-working-dir', 23.7);
  const tGiving = S.find('giving', 0, 13.1);
  const tStreets = S.find('streets', 0, 15.5);
  const tEach = S.find('each', 0, 7.5);
  const tRunning = S.find('running', 0, 26.6);
  const tPicture = S.find('picture', 0, 0.4);
  const handover = S.out > 0 ? S.out : 32.7;

  // the map: fades in and grows from 0.9 to 1 (the shared single-map frame, without the dot until it is said)
  const mapA = K.io(t, 0, 0.6);
  const mapGrow = K.io(t, 0, 0.9, 'out');
  M.card(t, { grow: mapGrow, alpha: mapA, glow: 0.35 });

  // the street grid on the disk: "a map drawn on the disk". Faint, clipped to the card, drifting slowly,
  // and faded out in the last seconds so the handover to section 04 lands on the plain map.
  const box = L.card, inset = 26;
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const sc = 0.9 + 0.1 * mapGrow;
  const gridIn = K.io(t, tPicture, 1.4);
  const gridOut = 1 - K.io(t, handover - 3.2, 3.2);
  const gridA = mapA * gridIn * gridOut;
  if (gridA > 0.002) {
    const g = K.ctx();
    const spacing = 120;
    const dx = K.wave(t, 0.32, 10, 0), dy = K.wave(t, 0.23, 7, 1.3);
    K.layer(gridA, () => K.zoomAt(cx, cy, sc, () => {
      g.save();
      g.beginPath(); g.rect(box.x + inset, box.y + inset, box.w - 2 * inset, box.h - 2 * inset); g.clip();
      const x0 = box.x + 60 + dx, y0 = box.y + 60 + dy;
      for (let x = x0 - spacing * 4; x <= box.x + box.w + spacing; x += spacing) {
        K.line(x, box.y, x, box.y + box.h, { color: P.cardLine, w: 1.5, alpha: 0.55 });
      }
      for (let y = y0 - spacing * 4; y <= box.y + box.h + spacing; y += spacing) {
        K.line(box.x, y, box.x + box.w, y, { color: P.cardLine, w: 1.5, alpha: 0.55 });
      }
      g.restore();
    }));
  }

  // the directions: the route starts at the centre spot (where the dot will sit), not at a floating point.
  // The hollow start ring appears first ("a spot to start from"), then the route draws out of it.
  // The route dims once the dot arrives: "those directions only work from one spot".
  const S0 = { x: L.dot.x, y: L.dot.y };
  const CORNER = { x: S0.x + 360, y: S0.y };     // three streets east
  const END = { x: CORNER.x, y: CORNER.y - 240 }; // then two up
  const stripA = K.io(t, tGiving, 0.6);
  const dimK = K.io(t, cDot - 0.2, 0.6);
  const routeAlpha = (1 - 0.7 * dimK);
  const routeK = K.io(t, tStreets - 0.2, 2.2, 'io');
  const startRingK = K.io(t, tGiving + 0.4, 0.5);

  // the direction label sits on a small dark backing pill, so no grid line runs through the text
  K.layer(mapA * stripA, () => {
    M.pill('3 streets east, then 2 up', 960, 262, { size: 26, color: P.body, fill: P.card, stroke: P.pillLine, alpha: 1 });
  });
  K.layer(mapA * routeAlpha, () => {
    K.ring(S0.x, S0.y, 30, 30, startRingK, { color: P.dim, w: 3 });
    M.route([[S0.x, S0.y], [CORNER.x, CORNER.y], [END.x, END.y]], { k: routeK, color: P.path, w: 3 });
  });

  // the second disk: "each drive has its own root". A small box at the right with its own root edge.
  // It appears on "each drive", so the single-disk picture gains a second root only when the narration asks for one.
  const dBox = { x: 1600, y: 330, w: 220, h: 200 };
  const dK = K.io(t, tEach, 0.6);
  const dRootK = K.io(t, tEach + 0.2, 0.6);
  if (dK > 0.002) {
    K.layer(mapA * dK, () => {
      K.card(dBox.x, dBox.y, dBox.w, dBox.h, { fill: P.card, stroke: P.cardLine, r: 18, glow: false });
      K.line(dBox.x, dBox.y, dBox.x + dBox.w, dBox.y, { k: dRootK, color: P.root, w: 4 });
      M.mono('D:\\ root', dBox.x + dBox.w / 2, dBox.y - 34, { align: 'center', color: P.root, alpha: dRootK });
      M.label('another disk', dBox.x + dBox.w / 2, dBox.y + dBox.h / 2 + 10, { color: P.body, size: 26, alpha: dRootK });
    });
  }

  // the you-are-here dot: the single overshoot of the scene. It pops onto the start ring.
  const dotK = K.io(t, cDot, 0.6, 'back');
  const ringK = K.io(t, tRunning, 0.6);
  M.dot(t, L.dot.x, L.dot.y, { k: dotK, pulse: 0.6, ring: ringK, alpha: mapA });

  // "working directory" types in under the dot, with a hairline from the dot to the label
  const lineK = K.io(t, cLabel, 0.4);
  const labelText = K.typed('working directory', t, cLabel, 28);
  K.layer(mapA * K.env(t, cLabel - 0.1, Infinity, 0.3), () => {
    K.line(L.dot.x, L.dot.y + 26, L.dot.x, L.dot.y + 26 + 40 * lineK, { color: P.dim, w: 2 });
    K.text(labelText, L.dot.x, L.dot.y + 100, { font: 'ui', weight: 600, size: 26, color: P.ink, align: 'center' });
  });
});
