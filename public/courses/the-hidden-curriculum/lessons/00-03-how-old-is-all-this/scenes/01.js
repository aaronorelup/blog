/* 01 — Old stone, fresh paint, new locks (title card, noBadge)
   Frame 0 (lesson 0:00) is fully composed: eyebrow, title and the PURPOSE line (Aaron's rule: the first spoken
   sentence states what you'll learn), with the lesson's one object, the building, already standing below as a
   ghost in the 'title' layout, and the street of years as the dim 'floor' strip under it.
   The one-line conclusion is on screen from frame 0 too (0.85 alpha), so the card states purpose AND conclusion at once.
   Never frozen: a slow 3 % camera push over the first 10 s, the ghost lifts 0.22 -> 0.4 under the purpose line,
   and the v1 sign gives one faint shimmer on "changing".
   - [[conclusion]] the conclusion line brightens to full and the ghost building fades up to 0.6.
   - "three speeds": a gold brace draws down the label column with "three speeds" beside it: three empty slots.
   - [[slow]] the stone comes up to full with its gold edge; "barely moves" slides in on "barely".
   - [[medium]] the sign comes up and repaints v1 -> v2 on "change" (the repaint move); "every year" on "every".
   - [[fast]] the door comes up; its padlock (the neutral 'lock' icon everywhere outside 08-09; the key means
     'password' and is kept for 08) shakes, greys and is replaced twice (0.5 s swaps, the second on "fastest"); "fastest" rides the first.
   - [[ai-fastest]] the three lanterns light left to right (the scene's one 'back' is the first lantern's glow swell);
     on "newest" a dashed roofline divider draws ABOVE the brace, and on the second "fastest" the lanterns' label
     arrives in a different register: a glowing terracotta lantern tag above that line, outside the brace.
     So the card reads 3 + 1: three speeds below, and the AI layer on top.
   Exit: title, purpose and conclusion held; the building lit with brace, three labels and the lantern tag.
   Pure function of t. */
SCENE('01', (t, S) => {
  const C = K.C, L = 'title', g = K.ctx();

  // ---- ground: night bg, then only the lowest band of the painted plate (stepping stones, pond). The plate's own
  // lit lantern string and tea house sit at x 1100–1900, y 260–720, right where the speed labels go and lit before
  // the building's lanterns are named, so it is masked away above y 840.
  K.bg({ glow: 0.16, glowX: 960, glowY: 300 });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.55, mask: [840, 1010] });

  // ---- cue times (local)
  const cConc = S.cue('conclusion', 8.52);
  const cSlow = S.cue('slow', 16.05);
  const cMed = S.cue('medium', 20.42);
  const cFast = S.cue('fast', 24.22);
  const cAI = S.cue('ai-fastest', 30.96);
  const tChanging = S.find(/^changing/, 0, 7.15);
  const tThree = S.find(/^three$/, 0, 14.7);
  const tNewest = S.find(/^newest$/, 0, 32.06);

  // ---- slow camera push (1.00 -> 1.03 over the first 10 s) about (960, 200), so the eyebrow stays inside y 130 and the floor strip above y 930
  const z = K.lerp(1, 1.03, K.io(t, 0, 10, 'io'));
  g.save(); g.translate(960, 200); g.scale(z, z); g.translate(-960, -200);

  // petals are decoration only and never sit on text. K.petals has no keep-out option and a hard clip leaves slivers
  // at the clip edge, so this is K.petals' own motion (same rng/seed math) with each petal fading out over 50 px as it
  // nears the title block or the label column.
  {
    const W = 1920, H = 1080, r = K.rng(3);
    const keep = [[540, 108, 1380, 374], [1130, 410, 1880, 860]];
    const away = (x, y) => Math.min(...keep.map(([x0, y0, x1, y1]) =>
      Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1))));
    for (let i = 0; i < 6; i++) {
      const x0 = r() * W, sp = 18 + r() * 22, ph = r() * 10, size = 9 + r() * 7;
      const y = ((r() * H + t * sp) % (H + 80)) - 40, x = x0 + Math.sin(t * 0.6 + ph) * 40;
      const a = K.clamp((away(x, y) - size) / 50);
      if (a <= 0) continue;
      g.save(); g.globalAlpha *= 0.45 * a; g.translate(x, y); g.rotate(t * 0.8 + ph);
      g.fillStyle = i % 2 ? C.blossom : C.blossomDeep;
      g.beginPath(); g.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  }

  // ---- title block, composed from the lesson's first frame
  K.eyebrow('00.03 · Orientation', 960, 150, { align: 'center', size: 20, tracking: 4 });
  K.title('How old is all this?', 960, 222, { size: 80, align: 'center' });
  K.text('How old your tools are, and how fast each part changes.', 960, 290,
    { font: 'read', size: 32, color: C.strong, align: 'center' });
  // the plain one-line conclusion, on the card from frame 0; it brightens to full on [[conclusion]]
  K.layer(K.lerp(0.85, 1, K.io(t, cConc, 0.8, 'io')), () => K.text('Decades-old ideas. Never frozen.', 960, 344,
    { font: 'read', size: 30, color: C.body, align: 'center' }));

  // ---- the street of years, as the dim floor strip (the world 03 and 04 will open up)
  M.street(t, { geom: 'floor', alpha: 0.26, show: 0, lanterns: 0, cord: 0 });

  // ---- the building: the ghost lifts 0.22 -> 0.4 under the purpose line, -> 0.6 on the conclusion,
  // then each part to full on its own speed
  const ghost = 0.22 + 0.18 * K.io(t, 0.4, 7, 'io') + 0.2 * K.io(t, cConc, 1.0, 'io');
  const up = (a) => K.lerp(ghost, 1, K.io(t, a, 0.7, 'io'));
  const kStone = K.io(t, cSlow, 0.7, 'io');
  const tChange = S.find(/^change$/, 0, cMed + 0.73);
  const kRepaint = K.io(t, tChange - 0.1, 0.5, 'io');
  // the lock: the neutral padlock, shaken and replaced twice on "Security changes" (lock shake + lock swap).
  // Before each swap the old padlock shakes and greys (retired = dim, never red); a fresh one grows in.
  const s1 = cFast + 0.45, s2 = cFast + 1.35, sw = 0.5;
  const old = (k) => [{ icon: 'lock', dim: 0.8 * k }];
  const dimA = K.io(t, s1 - 0.35, 0.35, 'io'), dimB = K.io(t, s2 - 0.35, 0.35, 'io');
  let lock = old(dimA), lockFrom = null, lockK = 1;
  if (t >= s2) { lock = old(0); lockFrom = old(1); lockK = K.io(t, s2, sw, 'io'); }
  else if (t >= s1) { lock = old(dimB); lockFrom = old(1); lockK = K.io(t, s1, sw, 'io'); }
  const lockShake = Math.max(M.bump(t, s1 - 0.35, 0.35), M.bump(t, s2 - 0.35, 0.35));
  const lockLit = K.io(t, cFast, 0.6, 'io') * 0.7;
  // lanterns light left to right; the first one carries the scene's one 'back' (an extra glow swell)
  const lamp0 = K.io(t, cAI + 0.15, 0.8, 'back');
  const lamp = (i) => (i === 0 ? K.clamp(lamp0, 0, 1) : K.stagger(t, cAI + 0.15, i, 0.15, 0.8));
  const kAI = K.io(t, cAI, 0.7, 'io');

  const Lr = M.building(t, {
    layout: L,
    fade: {
      stone: up(cSlow), sign: up(cMed), door: up(cFast), lanterns: up(cAI),
      walls: K.lerp(ghost, 0.92, kAI), roof: K.lerp(ghost, 0.92, kAI),
    },
    stoneLit: kStone,
    sign: 'v2', signFrom: 'v1', signK: kRepaint, signFont: 'mono',
    signLit: M.bump(t, tChanging - 0.1, 1.1) * 0.8,
    lock, lockFrom, lockK, lockLit, lockShake,
    windows: K.lerp(0.35, 0.75, kAI),
    lanterns: lamp,
    roofLit: K.lerp(0.25, 0.55, kAI),
  });
  const swell = Math.max(0, lamp0 - 1);
  if (swell > 0) { const p = M.at(Lr, 'lantern0'); K.glow(p.x, p.y, 70, C.accent, 0.9 * swell); }

  // ---- the three speeds: a gold brace on "three speeds" (three empty slots), then each label on its word
  const xL = 1254;
  const ySign = M.at(Lr, 'sign').y, yStone = M.at(Lr, 'stone').y;
  const bx = 1476, by0 = ySign - 30, by1 = yStone + 30;
  const kBr = K.io(t, tThree - 0.1, 0.7, 'io');
  if (kBr > 0) {
    const col = K.mixColor(C.head, C.soft, 0.25), ym = (by0 + by1) / 2;
    K.line(bx - 14, by0, bx, by0, { k: K.seg(kBr, 0, 0.2), color: col, w: 2.5 });
    K.line(bx, by0, bx, by1, { k: K.seg(kBr, 0.1, 0.8), color: col, w: 2.5 });
    K.line(bx, by1, bx - 14, by1, { k: K.seg(kBr, 0.7, 1), color: col, w: 2.5 });
    K.line(bx, ym, bx + 12, ym, { k: K.seg(kBr, 0.5, 0.8), color: col, w: 2.5 });
    const kt = K.ease.out(K.seg(kBr, 0.4, 1));
    K.text('three speeds', bx + 26 + 12 * (1 - kt), ym + 9, { font: 'ui', weight: 600, size: 26, color: C.head, alpha: kt });
  }
  const tBarely = S.find(/^barely$/, 0, cSlow + 0.9);
  const tEvery = S.find(/^every$/, 0, cMed + 1.13);
  const tFast2 = S.find(/^fastest$/, 1, cAI + 4.9);
  M.speedLabel(Lr, 'stone', K.seg(t, tBarely - 0.15, tBarely + 0.85), { x: xL });
  M.speedLabel(Lr, 'sign', K.seg(t, tEvery - 0.15, tEvery + 0.85), { x: xL });
  M.speedLabel(Lr, 'lock', K.seg(t, cFast - 0.05, cFast + 0.7), { x: xL });

  // ---- the layer on top: a dashed roofline divider on "newest", then the lantern tag above it on "fastest"
  const yLan = M.at(Lr, 'lanterns').y, yDiv = (yLan + ySign) / 2 + 6;
  const kDiv = K.io(t, tNewest - 0.1, 0.8, 'io');
  K.line(1236, yDiv, 1700, yDiv, { k: kDiv, color: C.line2, w: 2, dash: [8, 9], alpha: 0.9 });
  const kTag = K.seg(t, tFast2 - 0.2, tFast2 + 0.8);
  if (kTag > 0) {
    const tk = K.ease.out(K.seg(kTag, 0, 0.6)), ak = K.ease.io(K.seg(kTag, 0.3, 1));
    const txt = 'fastest of all', size = 30, to = { font: 'ui', weight: 600, size };
    const w = K.measure(txt, to) + size * 1.6, h = size * 1.9, x0 = xL + 16 * (1 - tk);
    K.layer(tk, () => {
      K.glow(x0 + w / 2, yLan, w * 0.55, C.accent, 0.2);
      K.card(x0, yLan - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: K.mixColor(C.accent, C.soft, 0.2), lw: 2, shadow: false });
      K.text(txt, x0 + w / 2, yLan + size * 0.34, { ...to, color: C.accent, align: 'center' });
    });
    const lr = M.at(Lr, 'lantern2');
    K.arrow(xL - 16, yLan, lr.r + 14, yLan + 2, { k: ak, color: K.mixColor(C.accent, C.soft, 0.35), w: 2.5, headSize: 12 });
  }
  g.restore();
});
