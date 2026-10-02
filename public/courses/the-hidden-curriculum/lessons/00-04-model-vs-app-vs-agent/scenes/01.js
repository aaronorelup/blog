/* 01 — Engine, car, driver (title card, noBadge)
   Frame 0 is composed: eyebrow, title, the PURPOSE line and the one-line conclusion; the car area is empty
   apart from a faint ground line on the painted street band. In step with the narration:
   - sentence 1: three layer pills rise in a row (y 860) on their spoken words: "model", "app", "agent".
   - [[engine]] the engine pops in at layout.engineIntro, gears idling; the "model" pill slides up under it.
   - [[car]] the engine eases into its hood slot (M.slot, .7 s) while the car builds around it (o.build, 1.4 s);
     the "model" pill rides with it to labelModel; on "app" the "app" pill rises to labelApp.
   - [[driver]] the steering ring draws in; on the second "agent" the "agent" pill swings up the right side of the car
     to just above-right of the windshield (the scene's one 'back') and a terracotta leader draws to the wheel; the headlight eases on at "drive"; you fade into the passenger seat on
     "passenger" (the chat bubbles leave as driver and passenger arrive, by M.car's default), and a callout
     'you: passenger seat' names it once (the side view puts that seat behind the wheel).
   - [[which-layer]] a soft ring passes over engine (gold), car (cream) and wheel + passenger (terracotta), inner
     to outer, and a terracotta "which one?" pill rises on "which".
   Exit: title block held, the complete car at rest, gears idling, headlight on, three layer pills, the passenger
   callout + "which one?".
   Pure function of t. */
SCENE('01', (t, S) => {
  const C = K.C;

  // ---- ground: night bg, then only the lower band of the painted plate (the car sits on the tea-house street)
  K.bg({ glow: 0.18, glowX: 960, glowY: 300 });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.5, mask: [620, 820] });
  K.petals(t, { n: 5, seed: 4, alpha: 0.45, avoid: [[300, 110, 1620, 350], [470, 360, 1540, 920]] });

  // ---- cue and word times (local seconds)
  const cEngine = S.cue('engine', 6.73);
  const cCar = S.cue('car', 8.34);
  const cDriver = S.cue('driver', 10.8);
  const cWhich = S.cue('which-layer', 16.63);
  const wModel = S.find(/^model/, 0, 2.87);
  const wApp = S.find(/^app$/, 0, 3.88);
  const wAgent = S.find(/^agent/, 0, 5.61);
  const wApp2 = S.find(/^app$/, 1, cCar + 0.19);
  const wAgent2 = S.find(/^agent/, 1, cDriver + 0.12);
  const wDrive = S.find(/^drive/, 0, 13.3);
  const wPass = S.find(/^passenger/, 0, 15.05);
  const wWhich = S.find(/^which$/, 0, cWhich + 0.34);

  // ---- title block, composed from frame 0
  K.eyebrow('The Hidden Curriculum · 00.04 Orientation', 960, 148, { align: 'center', size: 20, tracking: 3 });
  K.title('Model vs app vs agent', 960, 220, { size: 80, align: 'center' });
  K.text('The difference between a model, its app, and an agent.', 960, 276,
    { font: 'read', size: 32, color: C.body, align: 'center' });
  // the conclusion line says which is which, colour-keyed to the three layer pills (gold / cream / terracotta)
  K.spans([
    { s: 'Model', color: C.head }, { s: ' = engine.   ', color: C.body },
    { s: 'App', color: C.strong }, { s: ' = car.   ', color: C.body },
    { s: 'Agent', color: C.accent }, { s: ' = a car allowed to drive.', color: C.body },
  ], 960, 324, { font: 'ui', weight: 600, size: 32, align: 'center' });

  // ---- the drawing's placements
  const P = M.layout.title, cx = P.x, cy = P.y, cs = P.s;   // car at (960, 610, .86)
  const ground = cy + 158 * cs;
  K.line(470, ground, 1450, ground, { color: C.line, w: 2, alpha: 0.5 });

  // gears: still until the engine appears, then idle for the rest of the lesson
  const turn = M.spin(t, [{ at: cEngine, rate: M.motion.turn, d: 0.6 }], 0);

  // engine: pops in alone, then eases into the hood slot
  const kSlot = K.io(t, cCar, M.motion.move, 'io');
  const slot = M.slot(cx, cy, cs);
  const E = M.lerpPlace(M.layout.engineIntro, slot, kSlot);
  const inCar = kSlot >= 1;

  // the car builds around the engine; the agent's parts arrive on [[driver]]
  const build = K.seg(t, cCar, cCar + M.motion.build);
  const kWheel = K.io(t, cDriver, 0.7, 'io');
  const kHead = K.io(t, wDrive - 0.1, 0.8, 'io');
  const kPass = K.io(t, wPass - 0.1, 0.6, 'io');
  M.car(t, cx, cy, cs, {
    build,
    alpha: build > 0 ? 1 : 0,
    engine: inCar ? { turn } : false,
    wheel: kWheel,
    wheelGlow: 0.5 * K.io(t, cDriver + 0.3, 0.5, 'io'),
    head: kHead,
    passenger: kPass,
  });
  if (!inCar) K.pop(t, cEngine, E.x, E.y, () => M.engine(t, E.x, E.y, E.s, { turn, shadow: false }), 0.5);

  // ---- the three layer pills: a row on their spoken words, then each to its part
  const rowY = 860;
  const row = { model: { x: 760, y: rowY }, app: { x: 960, y: rowY }, agent: { x: 1160, y: rowY } };
  const appear = (w) => K.io(t, w - 0.1, 0.5, 'out');
  // model: row -> under the engine (with the pop) -> labelModel (with the slot move)
  {
    const under = M.ept(M.layout.engineIntro.x, M.layout.engineIntro.y, M.layout.engineIntro.s, 'label');
    const dest = M.pt(cx, cy, cs, 'labelModel');
    const k1 = K.io(t, cEngine, 0.6, 'io'), k2 = kSlot;
    let x = K.lerp(row.model.x, under.x, k1), y = K.lerp(row.model.y, under.y, k1);
    x = K.lerp(x, dest.x, k2); y = K.lerp(y, dest.y, k2);
    const a = appear(wModel);
    M.tag('model', x, y + (1 - a) * 16, { alpha: a * K.lerp(0.75, 1, k1), glow: ringGlow(0) });
    // once parked above the hood, a gold hairline draws from the pill down to the engine block it names
    // (same style as the agent leader, in the model's colour)
    const top = M.ept(slot.x, slot.y, slot.s, 'top'), kL = K.io(t, cCar + M.motion.move + 0.05, 0.45, 'io');
    K.line(dest.x - 14, dest.y + 24, top.x + 10, top.y + 4, { color: C.head, w: 2, alpha: 0.8, k: kL });
  }
  // app: row -> labelApp (under the ground line) on the second "app"
  {
    const dest = M.pt(cx, cy, cs, 'labelApp'), k = K.io(t, wApp2 - 0.05, 0.6, 'io');
    const a = appear(wApp);
    M.tag('app', K.lerp(row.app.x, dest.x, k), K.lerp(row.app.y, dest.y, k) + (1 - a) * 16,
      { alpha: a * K.lerp(0.75, 1, k), glow: ringGlow(1) });
  }
  // agent: row -> up the right side of the car -> just above-right of the windshield, beside the wheel it names
  // (the scene's one 'back'); a terracotta hairline then draws from the pill down to the steering ring
  const agentDest = { x: 1072, y: 382 };
  {
    const u = K.io(t, wAgent2 - 0.05, 0.8, 'back');
    // cubic path: out to the right of the nose, up past the hood, in over the model pill; never across the car
    const P0 = row.agent, P1 = { x: 1560, y: 820 }, P2 = { x: 1560, y: 330 }, P3 = agentDest, v = 1 - u;
    const bz = (a, b, c, d) => v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
    const x = bz(P0.x, P1.x, P2.x, P3.x), y = bz(P0.y, P1.y, P2.y, P3.y);
    const a = appear(wAgent);
    M.tag('agent', x, y + (1 - a) * 16, { alpha: a * K.lerp(0.75, 1, K.clamp(u)), glow: ringGlow(2) });
    const w = M.pt(cx, cy, cs, 'wheel'), r = 28 * cs, kL = K.io(t, wAgent2 + 0.8, 0.45, 'io');
    const from = { x: agentDest.x - 34, y: agentDest.y + 25 }, to = { x: w.x + r * 0.75, y: w.y - r * 0.75 };
    K.line(from.x, from.y, to.x, to.y, { color: C.accent, w: 2, alpha: 0.8, k: kL });
  }
  // "with you in the passenger seat": the seat sits behind the wheel in this side view, so name it once, here,
  // so it reads as the passenger seat (beside the driver), not a back seat
  {
    const p = M.pt(cx, cy, cs, 'passenger');
    M.callout('you: passenger seat', p.x - 13, p.y - 14, 540, 458, { k: K.io(t, wPass + 0.2, 0.8, 'io'), dot: false });
  }

  // ---- [[which-layer]]: a soft ring passes over each layer in turn, inner to outer, then fades
  function ringK(i) { const a = cWhich + 0.3 + i * 0.6; return { draw: K.io(t, a, 0.45, 'io'), fade: K.io(t, a + 0.75, 0.45, 'io') }; }
  function ringGlow(i) { const r = ringK(i); return 0.5 * r.draw * (1 - r.fade); }
  const rings = [
    { ...M.pt(cx, cy, cs, 'engine'), rx: 76, ry: 56, color: C.head },
    { x: cx, y: cy + 2, rx: 410, ry: 118, color: C.soft },
    { x: K.lerp(M.pt(cx, cy, cs, 'wheel').x, M.pt(cx, cy, cs, 'passenger').x, 0.5) + 6, y: M.pt(cx, cy, cs, 'wheel').y + 4, rx: 124, ry: 52, color: C.accent },
  ];
  rings.forEach((r, i) => {
    const k = ringK(i);
    if (k.draw <= 0 || k.fade >= 1) return;
    K.layer(0.85 * (1 - k.fade), () => K.ring(r.x, r.y, r.rx, r.ry, k.draw, { color: r.color, w: 3, rot: 0 }));
  });
  K.rise(t, wWhich - 0.1, () => K.pill('which one?', 960, 880,
    { size: 30, color: C.accent, stroke: C.accent, fill: C.tile, glow: 0.3 }), 16, 0.6);
});
