/* 09 Keep this: end card. The road shrinks into a header ribbon (lanterns above), three takeaway rows rise on their cues. */
SCENE('09', (t, S) => {
  const C = K.C;
  // ---------------------------------------------------------------- times (local)
  const k1 = S.cue('keep-1', 1.95), k2 = S.cue('keep-2', 10.5), k3 = S.cue('keep-3', 17.4);
  const w = (word, nth, fb) => S.find(word, nth, fb);
  const tStops = [w('computer', 0, 4.66), w('network', 0, 5.63), w('internet', 0, 6.53), w(/^services/, 0, 7.4), w('AI', 0, 8.49)];
  const tLighting = w('lighting', 0, 8.88);
  const tWhich = w('which', 0, 10.91), tRoom = w('room', 0, 13.54), tDoor = w('door', 0, 15.45);
  const tDoor2 = w('door', 1, 19.98), tLives = w('lives', 0, 22.8), tAnswers = w('answers', 0, 23.81);

  // ---------------------------------------------------------------- ground
  if (K.img.plate) K.plate('plate', t, { shade: 0.55 }); else K.bg({ glow: 0.6 });
  {
    // a soft scrim from the left so the rows read over the plate's lit tea house (it stays visible on the right)
    const g = K.ctx(), gr = g.createLinearGradient(0, 0, 1920, 0);
    gr.addColorStop(0, K.rgba(C.page, 0.62)); gr.addColorStop(0.5, K.rgba(C.page, 0.55)); gr.addColorStop(0.62, K.rgba(C.page, 0.35)); gr.addColorStop(0.78, K.rgba(C.page, 0));
    g.save(); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); g.restore();
  }
  K.petals(t, { n: 5, alpha: 0.55 });

  // ---------------------------------------------------------------- the road becomes the ribbon
  // Before the morph it sits at the standard row (matches 08's last frame); it then rises and shrinks to a ribbon.
  const RIB = M.geom('ribbon', { y: 240 });
  const mk = K.io(t, 0.15, 0.8);
  const gm = M.lerpGeom('std', RIB, mk);
  const lightK = M.litAt(t, tStops, M.motion.light);
  const lit = (i) => Math.max(1 - mk, lightK(i));                       // dims to calm ghosts as it shrinks, relights word by word
  const pulse = (i) =>
    (i === 3 ? M.bump(t, tDoor2 + 0.55, 1.0) : 0) +                     // the outbound arc arrives at the service's door
    (i >= 3 ? 0.8 * M.bump(t, tLives - 0.1, 1.1) : 0) +                 // "the AI you use lives there"
    (i === 0 ? M.bump(t, tAnswers + 0.65, 1.0) : 0);                    // the reply arrives home
  M.road(t, { geom: gm, lit, pulse, alpha: K.lerp(0.8, 1, mk) });

  // lanterns over the ribbon: arrive as calm ghosts with the ribbon, light on "AI lighting all of it"
  const LO = { xs: RIB.xs, y: 150, x0: RIB.xs[0] - 80, x1: RIB.xs[4] + 80, sag: 10, s: 36 };
  M.lanterns(t, { ...LO, alpha: K.io(t, 0.7, 0.6), cord: K.io(t, 0.7, 0.7), lit: (i) => K.io(t, tLighting + i * 0.12, M.motion.light) });

  // eyebrow, left-aligned clear of the ribbon
  K.eyebrow('Keep this', 200, 160, { size: 22, alpha: K.io(t, 0.2, 0.6) });

  // ---------------------------------------------------------------- keep-2: gold rings ask "which stop?"
  // One rings your room on "room", a second rings the service's door on "door"; both let go as row 3 arrives.
  {
    const a = 1 - K.io(t, k3 - 0.2, 0.5);
    [[0, tRoom - 0.1], [3, tDoor - 0.1]].forEach(([i, at]) => {
      const draw = K.io(t, at, 0.7);
      const p = M.along(RIB, i);
      if (draw > 0 && a > 0) K.layer(a, () => {
        K.glow(p.x, p.y, 70, C.head, 0.12 * draw);
        K.ring(p.x, p.y, 40, 37, draw, { color: C.head, w: 3.5 });
      });
    });
  }

  // ---------------------------------------------------------------- keep-3: out to the service's door, and the answer back
  {
    const c = RIB.cards[0], s = RIB.cards[3], y0 = RIB.y + 34;
    const out = K.io(t, tDoor2, 0.8);
    const outA = 1 - 0.55 * K.io(t, tAnswers, 0.6);                      // steps back once the reply is under way
    if (out > 0) K.arrow(c.x + 10, y0, s.x - 10, y0, { k: out, bend: 70, color: C.accent, w: 2.5, headSize: 11, dash: [7, 8], alpha: 0.7 * outA });
    const back = K.io(t, tAnswers, 0.8);
    if (back > 0) K.arrow(s.x - 10, y0 + 4, c.x + 10, y0 + 4, { k: back, bend: -118, color: C.paper, w: 3, headSize: 12, alpha: 0.9 });
  }

  // ---------------------------------------------------------------- the three rows
  // Text is wrapped to ~900 px so every line ends before the plate's lantern string and porch (x > ~1100).
  const LEAD = { font: 'head', size: 40, weight: 700 }, REST = { font: 'read', size: 30 };
  const ROWS = [
    { at: k1, lead: 'Everything sits on one road.', rest: 'Your computer, the network, the internet, services, and AI lighting all of it.' },
    { at: k2, lead: 'Ask which stop first.', rest: "A problem in your room and a problem at a service's door need different fixes." },
    { at: k3, lead: "A service is someone else's computer, with its door open.", rest: 'Most of the AI you use lives there, and answers back to yours.' },
  ];
  let y = 392;
  ROWS.forEach((r, i) => {
    const leadL = K.wrap(r.lead, 880, LEAD), restL = K.wrap(r.rest, 880, REST);
    const y0 = y;
    K.rise(t, r.at, () => {
      K.text(String(i + 1).padStart(2, '0'), 200, y0, { font: 'mono', size: 26, weight: 600, color: C.gold, alpha: 0.8 });
      leadL.forEach((ln, j) => K.text(ln, 260, y0 + j * 48, { ...LEAD, color: C.head }));
      restL.forEach((ln, j) => K.text(ln, 260, y0 + leadL.length * 48 + j * 40, { ...REST, color: C.body }));
    });
    y += leadL.length * 48 + restL.length * 40 + 64;
  });
});
