/* 01 — Lift the hood (title card, noBadge)
   Frame 0 is composed: eyebrow, title, the PURPOSE line and the one-line conclusion, and 00.04's engine
   (gears idling, lid closed, 'model' pill) at (960, 590) s 1.4. The engine stays the model all scene: it is the
   READER at the desk, never the desk itself. In step with the narration:
   - [[tiles]] a plain mono line "Latest version is" fades in above the engine (y 420); on "cuts" gold slice marks
     flash and it separates into three tiles (M.split).
   - [[one-at-a-time]] the tiles slide down into a row left of the engine (y 590); a soft arrow runs into its left
     port, the gears give one extra turn, and on "next piece" one new tile "4.2" flies out of the right port to
     (1260, 590).
   - [[desk]] a faint dashed outline marks the desk's footprint (M.DESK), labelled "desk = context window" (30 px)
     just above its top-left corner; the label stays for the rest of the scene.
   - [[sound-right]] on "trained" "4.2" turns gold ('hot': the model's pick); "sounds right" (gold pill, 28 px) on
     "sound right"; on "being right" a dashed-gold "is it right?" pill (28 px, cream 75 %): unverified, a specific.
   - [[hood]] the title block never moves or fades. The engine settles from s 1.4 to 1.2 and on "lift" the lid hinges
     open to ≈ 42° about a visible hinge pin, a prop rod holding it (the scene's one 'back'; peak tip y ≈ 346, below the
     conclusion line); on "won't find gears" the pills leave and the gears fade as the little desk of tiles shows inside,
     and it STAYS tiles from here on; on "You'll find" the engine dips under "4.2" and parks, small, at the desk's right
     end (lid to a crack, 'model' pill kept clear of the small card); on "desk" the desk slides out of its left port
     like a drawer to M.DESK (legs 0→1), the four tiles land in row 1, and one gold sweep runs along the row.
     The dashed footprint runs down to the desk's lip (y 784) so the pills above it clear the dashes.
   Exit (calm): title block back, the desk at M.DESK with "Latest version is 4.2" in row 1 (4.2 gold), the small
   engine ('model') reading it from the right, the context-window label, lamp glow, petals.
   Pure function of t. */
SCENE('01', (t, S) => {
  const C = K.C;

  // ---- ground: night bg with the lamp low, then only the lower band of the painted plate
  K.bg({ glow: 0.35, glowX: 960, glowY: 560 });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.5, mask: [640, 840] });
  K.petals(t, { n: 5, seed: 5, alpha: 0.45, avoid: [[240, 110, 1620, 410], [170, 370, 1850, 880]] });

  // ---- cue and word times (local seconds)
  const cTiles = S.cue('tiles', 7.13);
  const cOne = S.cue('one-at-a-time', 11.41);
  const cDesk = S.cue('desk', 14.48);
  const cSound = S.cue('sound-right', 17.33);
  const cHood = S.cue('hood', 22.6);
  const wCuts = S.find(/^cuts/, 0, cTiles + 1.37);
  const wNext = S.find(/^next/, 0, cOne + 0.9);
  const wTrained = S.find(/^trained/, 0, cSound + 1.15);
  const wSound = S.find(/^sound$/, 0, cSound + 2.26);
  const wBeing = S.find(/^being/, 0, cSound + 4.6);
  const wLift = S.find(/^lift/, 0, cHood + 0.27);
  const wWont = S.find(/^won't/, 0, cHood + 3.92);
  const wFind2 = S.find(/^you'll$/i, 1, cHood + 5.25);
  const wDesk = S.find(/^desk$/, 0, cHood + 5.9);

  // ---- the hood beat timing
  // the lid opens to ≈ 42° (peak ≈ 45° on the 'back'): with the engine settled to s 1.2 its tip stays below y ≈ 346,
  // clear of the conclusion line (baseline 324), so the title block never has to step aside
  const lidOpen = 0.611 * K.io(t, wLift, M.motion.lid, 'back');
  const gearsOff = K.io(t, wWont, 0.8, 'io');   // gears out, the tile desk in; it stays tiles for the rest of the lesson
  const parkA = wFind2 + 0.05, park = K.io(t, parkA, M.motion.move + 0.1, 'io');   // engine to the desk's right end
  const drawA = wDesk - 0.05, drawer = K.io(t, drawA, M.motion.morph, 'io');      // the desk slides out
  const lidClose = K.io(t, parkA - 0.1, 0.45, 'io');   // eased down to a crack for the trip to the desk's end
  const lid = K.lerp(lidOpen, 0.2, lidClose);

  // ---- title block: composed from frame 0 and held, full strength, for the whole scene
  K.eyebrow('The Hidden Curriculum · 00.05 Orientation', 960, 148, { align: 'center', size: 20, tracking: 3 });
  K.title('How LLMs work (just enough)', 960, 220, { size: 80, align: 'center' });
  K.text('Just enough to see its surprises coming.', 960, 276, { font: 'read', size: 32, color: C.body, align: 'center' });
  K.text('Trained to sound right, not to be right.', 960, 324, { font: 'ui', weight: 600, size: 32, color: C.head, align: 'center' });

  // ---- engine placements: title spot (s 1.4) -> settles to s 1.2 as the hood lifts (so the open lid clears the title)
  //      -> parked at the desk's right end, on a low arc UNDER the "4.2" tile (never up toward the title block)
  const E = M.layout.engineTitle;                 // (960, 590, 1.4)
  const ER = M.engineRect(E.x, E.y, E.s);         // card 820..1100 x 492..688
  const portL = ER.x - 8, portR = ER.x + ER.w + 8;
  const rowYc = M.rowY(M.DESK, 1);                // 590: row 1 of the desk = the engine's port height
  const P = { x: 1755, y: rowYc, s: 0.6 };        // parked: card 1695..1815, left port ≈ 1691, desk edge 1660
  const parkU = K.seg(t, parkA, parkA + M.motion.move + 0.1);   // linear: the dip leads the slide, so it clears "4.2"
  const sHood = K.lerp(E.s, 1.2, K.io(t, cHood - 0.3, 0.6, 'io'));
  const ex = K.lerp(E.x, P.x, park), ey = K.lerp(E.y, P.y, park) + 210 * Math.sin(Math.PI * parkU);
  const es = K.lerp(sHood, P.s, park);

  // ---- [[desk]] dashed footprint of the desk-to-be (soft: not there yet); it fades as the real desk slides out
  {
    const k = K.io(t, cDesk, 0.8, 'io'), a = 0.5 * (1 - K.io(t, drawA + 0.3, 0.5, 'io'));
    if (k > 0 && a > 0.002) {
      const R = M.DESK, o = { color: C.soft, w: 2, dash: [8, 10], alpha: a, k };
      K.line(R.x + R.w / 2, R.y, R.x, R.y, o); K.line(R.x + R.w / 2, R.y, R.x + R.w, R.y, o);
      const B = R.y + R.h + 24;   // the footprint includes the front lip (≈ 782), so the pills above it clear the dashes
      K.line(R.x, R.y, R.x, B, o); K.line(R.x + R.w, R.y, R.x + R.w, B, o);
      K.line(R.x, B, R.x + R.w / 2, B, o); K.line(R.x + R.w, B, R.x + R.w / 2, B, o);
    }
  }
  // the real term, on the title card from the moment "desk" is said, and kept on the real desk
  {
    const a = K.io(t, cDesk + 0.3, 0.6, 'io');
    if (a > 0) K.eyebrow('desk = context window', M.DESK.x, 400 + (1 - a) * 8, { align: 'left', size: 30, tracking: 3, color: C.head, alpha: a });
  }

  // ---- the engine: gears idle, plus one extra turn while it "thinks" of the next tile
  const think = K.io(t, cOne + 0.5, 0.9, 'io');
  const readGlow = Math.sin(Math.PI * K.seg(t, drawA + 1.3, drawA + 2.2));
  M.engine(t, ex, ey, es, {
    turn: M.motion.turn * t + 2.2 * think,
    glow: 0.35 * Math.sin(Math.PI * think) + 0.3 * readGlow,
    lid, gears: 1 - gearsOff, inside: gearsOff,
    shadow: park > 0,
  });
  // the 'model' pill: M.engine's own label is a fixed 26 px pill at y + 106·s, which overlaps the card once it is
  // parked small (s 0.6); keep at least 34 px between the card's bottom and the pill's centre
  K.pill('model', ex, ey + Math.max(106 * es, 70 * es + 34), { size: 26, stroke: C.gold, color: C.head });
  // the hood's hinge pin and prop rod (drawn over the engine, in its local frame), so the lid reads as a hood
  if (lid > 0.02) {
    const g = K.ctx(), th = -1.2 * lid, hx = -100, hy = -42;
    const rodK = K.clamp((lid - 0.3) / 0.25);
    K.at(ex, ey, es, 0, () => {
      if (rodK > 0) {
        // prop rod: from the card's top edge up to the lid's underside
        const ux = hx + 150 * Math.cos(th), uy = hy + 150 * Math.sin(th);
        K.line(84, -42, ux, uy, { color: C.soft, w: 3, alpha: 0.85 * rodK });
      }
      g.save();
      g.beginPath(); g.arc(hx, hy, 7, 0, Math.PI * 2); g.fillStyle = C.head; g.fill();
      g.beginPath(); g.arc(hx, hy, 2.6, 0, Math.PI * 2); g.fillStyle = C.page; g.fill();
      g.restore();
    });
  }

  // ---- the desk slides out of the engine's left port, like a drawer (drawn over the engine)
  if (drawer > 0) {
    const R0 = { x: 1650, y: rowYc - 30, w: 40, h: 60 };
    const R = M.lerpRect(R0, M.DESK, drawer);
    M.desk(t, R, {
      legs: drawer, grooves: drawer, r: K.lerp(10, 24, drawer), alpha: K.clamp(drawer * 4),
      lamp: 0.6 * K.io(t, drawA + 0.6, 1.2, 'io'),
    });
  }

  // ---- [[tiles]] the line, cut into three tiles above the engine
  const pieces = ['Latest', ' version', ' is'];
  const words = pieces.map((s) => s.trim());
  const answer = '4.2';
  const lineIn = K.io(t, cTiles, 0.5, 'io');
  const cut = K.seg(t, wCuts, wCuts + 0.5);
  const sk = K.seg(t, wCuts + 0.45, wCuts + 1.05);
  const topY = 420;
  // final layout: "Latest version is 4.2" in row 1 of the desk
  const finalRow = M.flow([...words, answer], M.rowX0(M.DESK));
  // the input row left of the engine (inside the desk footprint, right edge 752, a short arrow gap to the port)
  const probe = M.flow(words, 0), probeEnd = probe[probe.length - 1].x + probe[probe.length - 1].w / 2;
  const inRow = M.flow(words, 752 - probeEnd);
  // the slide goes sideways first, then down, so no tile crosses the engine's lid
  const slideStart = cOne, slideU = (i) => K.seg(t, slideStart + i * 0.05, slideStart + i * 0.05 + 0.75);
  const slideX = (i) => K.ease.io(K.clamp(slideU(i) / 0.6)), slideY = (i) => K.ease.io(K.clamp((slideU(i) - 0.4) / 0.6));
  // landing into row 1 once the drawer is out: the input tiles shift left, leftmost first; the answer slides left last
  const n = words.length;
  const landK = (i) => K.io(t, drawA + 0.5 + i * M.motion.stagger, 0.55, 'io');

  if (t < slideStart) {
    if (lineIn > 0) M.split(pieces, 960, topY + (1 - lineIn) * 10, sk, { cut, alpha: lineIn });
  } else {
    const P0 = M.flow(words, 960, { align: 'center' });   // where M.split left the tiles
    P0.forEach((p, i) => {
      const v = landK(i);
      let x = K.lerp(p.x, inRow[i].x, slideX(i)), y = K.lerp(topY, rowYc, slideY(i));
      x = K.lerp(x, finalRow[i].x, v); y -= Math.sin(Math.PI * v) * 16;
      M.tile(p.s, x, y);
    });
  }

  // ---- [[one-at-a-time]] arrow into the engine, then the answer flies out of the right port
  const arrowIn = K.io(t, cOne + 0.45, 0.4, 'io');
  const arrowsOut = K.io(t, cDesk - 0.3, 0.5, 'io');
  if (arrowIn > 0 && arrowsOut < 1) {
    K.arrow(764, rowYc, portL - 6, rowYc, { k: arrowIn, color: C.soft, w: 3, alpha: 0.8 * (1 - arrowsOut), headSize: 14 });
  }
  const flyA = wNext + 0.05, fly = K.seg(t, flyA, flyA + M.motion.land);
  const ans = { x: 1260, y: rowYc };
  const hotK = K.io(t, wTrained, 0.5, 'io');
  if (fly > 0) {
    if (fly < 1) {
      M.fly(answer, portR + 4, rowYc, ans.x, ans.y, fly, { bend: -90, trail: 0.6, tone: 'plain' });
    } else {
      const v = landK(n);
      const x = K.lerp(ans.x, finalRow[n].x, v), y = ans.y - Math.sin(Math.PI * v) * 16;
      // the trail lingers briefly after landing, then fades
      const trailA = 1 - K.io(t, flyA + M.motion.land, 0.6, 'io');
      if (trailA > 0) M.fly(answer, portR + 4, rowYc, ans.x, ans.y, 1, { bend: -90, trail: 0.6 * trailA, alpha: 0 });
      M.tile(answer, x, y, { tone: hotK > 0.5 ? 'hot' : 'plain', glow: 0.35 * hotK * (1 - 0.4 * v) });
    }
  }

  // ---- [[sound-right]] "sounds right" (gold) and an unverified "is it right?" under the picked tile
  const pillsOut = K.io(t, wWont - 0.4, 0.5, 'io');
  if (pillsOut < 1) {
    const a1 = K.io(t, wSound - 0.1, 0.5, 'io') * (1 - pillsOut);
    const a2 = K.io(t, wBeing - 0.1, 0.5, 'io') * (1 - pillsOut);
    if (a1 > 0) K.pill('sounds right', ans.x, 670 + (1 - a1) * 10, { size: 28, color: C.head, stroke: C.gold, alpha: a1 });
    if (a2 > 0) {
      const y = 732 + (1 - a2) * 10, size = 28;
      const w = K.pill('is it right?', ans.x, y, { size, color: K.rgba(C.strong, 0.75), stroke: K.rgba(C.gold, 0), fill: C.tile, alpha: a2 });
      const h = size * 1.9, g = K.ctx();
      g.save(); g.globalAlpha *= a2; g.setLineDash([7, 6]); g.lineWidth = 2; g.strokeStyle = C.head;
      K.rr(ans.x - w / 2, y - h / 2, w, h, h / 2); g.stroke(); g.restore();
    }
  }

  // ---- the model reads its desk: one gold sweep along row 1 once the tiles have landed
  M.sweep(M.rowX0(M.DESK), finalRow[n].x + 60, rowYc, K.seg(t, drawA + 1.3, drawA + 2.1));
});
