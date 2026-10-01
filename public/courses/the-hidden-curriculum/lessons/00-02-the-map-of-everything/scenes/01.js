/* 01 — One road, five stops (title card, noBadge)
   The card carries the conclusion from frame 0: title, the one-line conclusion, and the road as five
   calm ghost stops (M.road, 'title' preset). Then, in step with the narration:
   - [[five-stops]] each stop lights on its own spoken name, arrows drawing just after the next stop lights;
   - [[which-stop]] a terracotta "which stop?" pill rises and a soft ring passes over each stop once, left to right;
   - [[land]] small gold pins drop onto each stop's roof, staggered 0.12 s (no overshoot: M.pin);
   - on "road" (second time) the gold attention dot travels stop 1 → stop 5 under the cards and parks at AI.
   Everything is a pure function of t. No 'back' overshoot is used in this scene. */
SCENE('01', (t, S) => {
  const C = K.C;

  // ---- ground: night bg, painted plate (slow drift, darkened so the road reads), sparse petals
  K.bg({ glow: 0.6, glowX: 960, glowY: 300 });
  K.plate('plate', t, { zoom: true, shade: 0.5, drift: 0.008 });
  // a soft night scrim behind the road row, so the ghost stops are not lost in the lit tea house
  {
    const g = K.ctx(), y0 = 380, y1 = 880;
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, K.rgba(C.page, 0));
    gr.addColorStop(0.2, K.rgba(C.page, 0.6));   // y 480
    gr.addColorStop(0.68, K.rgba(C.page, 0.8));  // y 720: darkest under the stop row
    gr.addColorStop(1, K.rgba(C.page, 0));
    g.save(); g.fillStyle = gr; g.fillRect(0, y0, 1920, y1 - y0); g.restore();
  }
  K.petals(t, { n: 6, seed: 7, alpha: 0.45 });

  // ---- title block: composed under the engine's fade from black (local -1.6 = lesson frame 0)
  K.layer(K.io(t, -1.6, 0.5, 'out'), () =>
    K.eyebrow('The Hidden Curriculum · 00.02 Orientation', 960, 160, { align: 'center', size: 20, tracking: 3 }));
  K.rise(t, -1.5, () => K.title('The map of everything', 960, 240, { size: 84, align: 'center' }), 16, 0.5);
  K.rise(t, -1.3, () => K.text('One road, five stops. Ask which stop.', 960, 312,
    { font: 'read', size: 34, color: C.body, align: 'center' }), 16, 0.5);

  // ---- [[five-stops]]: each stop lights on its spoken name ("AI" is the second AI in the section)
  const c0 = S.cue('five-stops', 3.38);
  // lead each word onset by .15 s so the stop is visibly warm while its name is still being said
  const LEAD = 0.15;
  const times = [
    S.find('computer', 0, c0 + 0.2),
    S.find('network', 0, c0 + 1.17),
    S.find('internet', 0, c0 + 2.05),
    S.find('services', 0, c0 + 2.8),
    S.find('AI', 1, c0 + 3.68),
  ].map((x) => x - LEAD);
  const lit = M.litAt(t, times);
  const arrows = (i) => K.io(t, times[i + 1] + 0.1, M.motion.arrow);

  // [[which-stop]]: one terracotta ring closes around stop 1, then glides left to right over each stop once;
  // each stop warms gently while the ring is over it (pure: from the ring's position u)
  const tw = S.cue('which-stop', 10.74);
  const ringK = K.io(t, tw + 0.3, 0.45), ringU = 4 * K.io(t, tw + 0.8, 1.6, 'io');
  const ringA = ringK * (1 - K.io(t, tw + 2.45, 0.45));
  // [[land]]: pins drop onto each roof, staggered .12 s
  const tl = S.cue('land', 14.25);
  const pinAt = (i) => tl + i * 0.12;
  const pulse = (i) => 0.6 * ringA * Math.max(0, 1 - Math.abs(ringU - i)) + 0.5 * M.bump(t, pinAt(i) + 0.35, 0.8);

  // opaque night-ink backing under each stop card: the shared ghost tile is ~25% alpha, which lets the
  // lit tea-house windows and lantern string of the plate show through stops 4-5 (workaround, not in M)
  // (two passes: the lane band first, then the backings, then the stops with band 0 - so the band reads
  // between the cards but no longer shows through the ghost tiles as a grey bar across the icons)
  M.road(t, { geom: 'title', arrows: 0, cardAlpha: 0 });
  {
    const g0 = M.geom('title');
    g0.cards.forEach((c) => K.card(c.l, c.t, c.w, c.h, { fill: '#1b1a2a', alpha: 0.94, stroke: false, shadow: false, r: 24 }));
  }
  const gm = M.road(t, { geom: 'title', band: 0, lit, arrows, pulse, iconDx: (i) => (i === 2 ? K.wave(t, 1.2, 3) * lit(2) : 0) });

  // the ring: terracotta (the question), one ring travelling along the road
  if (ringA > 0) {
    const rp = M.along(gm, ringU);
    K.layer(0.8 * (1 - K.io(t, tw + 2.45, 0.45)), () => K.ring(rp.x, rp.y, gm.w / 2 + 16, gm.h / 2 + 16, ringK, { color: C.accent, w: 3 }));
  }

  // the "which stop?" pill, held to the end
  K.rise(t, tw, () => K.pill('which stop?', 960, 800, { size: 34, color: C.accent, stroke: K.rgba(C.accent, 0.7) }), 16, 0.5);

  // pins on every roof: every later lesson lands somewhere here
  gm.cards.forEach((c, i) => M.pin(t, pinAt(i), c.roof.x, c.roof.y, { s: 40 }));

  // ---- "a road leading out of your room": the gold dot travels stop 1 → 5 under the cards, parks at AI
  const tr = S.find('road', 1, 16.14);
  const DY = gm.h / 2 + 34;
  const u = 4 * K.io(t, tr, 2, 'io');
  const p = M.along(gm, u, DY);
  const dotA = K.io(t, tr - 0.3, 0.4) * (0.85 + 0.15 * K.io(t, tr + 2, 0.6));
  if (dotA > 0) {
    // a faint gold trail behind the dot, along the lane it has walked
    const x0 = gm.xs[0];
    if (p.x > x0 + 1) K.line(x0, p.y, p.x, p.y, { color: C.head, w: 2, alpha: 0.28 * dotA });
    M.dot(p.x, p.y, dotA);
  }
});
