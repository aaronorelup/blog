/* 09 — Keep this (end card, noBadge)
   The lesson's one drawing is rebuilt at M.layout.end (960, 400, 0.55) in the same order the lesson taught it,
   so the end card is a recap in pictures as well as words:
   - opening ("Three things to keep"): the car assembles (o.build over 1.4 s) with its engine already in the bay,
     headlight low, chat bubbles in the window. Eyebrow "KEEP THIS" at y 150. Ground: night bg plus only the plate's
     lowest band (below the rows), petals in the far margins only.
   - [[keep-1]] row 1 rises (gold 01). The engine glows gold (eases up 0.5 s, holds ~1 s, settles to a held glow);
     its gears spin up briefly on "Text in, text out". Rest on "a lab's".
   - [[keep-2]] row 2 rises (cream 02). The car body outline turns gold and holds (bodyGlow). Rest on "chat"; "One engine, many cars." joins the row on "One".
   - [[keep-3]] row 3 rises (terracotta 03). The steering ring draws in (the bubbles leave, as in 05); on "drive"
     the wheel glows and the headlight comes fully on; on "tools" the rack drops onto the roof, lit terracotta
     (the scene's one 'back' on the first tool); on "loop" a flat loop draws on the ground around the wheels (M.loop, back half
     clipped behind the body, front half over it) and its dot runs one unlabelled lap, then fades as the focus
     moves to you; on "you" the passenger fades in and, on "deciding", gets the gold glow (held) and a gold
     'you decide' callout on a hairline from the passenger seat. Rest on "tools" ("Tools, a loop,"),
     "and you decide what it may do." joins on "you".
   Exit: three rows held, the complete car (engine, body, wheel, tools, loop, passenger, headlight) at rest.
   Pure function of t. */
SCENE('09', (t, S) => {
  const C = K.C;
  const P = M.layout.end;                                   // { x: 960, y: 400, s: 0.55 }

  // ---- times (local)
  const k1 = S.cue('keep-1', 1.58), k2 = S.cue('keep-2', 8.6), k3 = S.cue('keep-3', 17.45);
  const tLab = S.find(/^lab's$/i, 0, k1 + 2.0);
  const tText = S.find(/^text$/i, 0, k1 + 3.6);
  const tChat = S.find(/^chat$/i, 0, k2 + 1.7);
  const tOne = S.find(/^one$/i, 0, k2 + 6.4);
  const tDrive = S.find(/^drive/i, 0, k3 + 1.6);
  const tTools = S.find(/^tools/i, 0, k3 + 2.6);
  const tLoop = S.find(/^loop/i, 0, k3 + 3.8);
  const tYou = S.find(/^you$/i, 1, k3 + 4.5);              // 2nd "you" of the section ("and you in the passenger seat")
  const tDecide = S.find(/^deciding/i, 0, k3 + 6.0);

  // ---- ground (bookends 01): night bg, only the plate's lowest band, petals in the far margins
  K.bg({ glow: 0.16, glowX: 960, glowY: 320 });
  if (K.img && K.img.plate) K.plate('plate', t, { shade: 0.55, mask: [820, 1000] });
  K.petals(t, { n: 4, seed: 9, alpha: 0.5, avoid: [[120, 130, 1800, 930]] });

  K.eyebrow('Keep this', 960, 150, { align: 'center', alpha: K.io(t, -0.2, 0.6) });

  // ---- the car's state, beat by beat
  const build = K.ease.out(K.seg(t, 0.05, 0.05 + M.motion.build));
  // engine: glow eases up on keep-1, holds about a second, then settles to a held glow
  const eGlow = K.io(t, k1 - 0.1, 0.5) - 0.5 * K.io(t, k1 + 1.4, 0.8);
  const turn = M.spin(t, [{ at: tText, rate: M.motion.busy }, { at: tText + 1.4, rate: M.motion.turn, d: 0.6 }]);
  const bodyGlow = 0.85 * K.io(t, k2 - 0.05, 0.5);
  const wheel = K.io(t, k3, 0.7);
  const wheelGlow = K.io(t, tDrive, 0.5);
  const head = K.lerp(0.35, 1, K.io(t, tDrive, 0.6));
  // tools drop on "tools": the first with the scene's one overshoot, the others plain
  const tools = [K.io(t, tTools - 0.05, 0.6, 'back'), K.io(t, tTools + 0.15, 0.55), K.io(t, tTools + 0.35, 0.55)];
  const rackK = K.io(t, tTools - 0.25, 0.5);
  const toolsLit = t >= tTools + 0.3 ? [0, 1, 2] : [];
  const pass = K.io(t, tYou - 0.05, 0.5);
  const youGlow = K.io(t, tDecide - 0.05, 0.5);
  const bob = K.wave(t, M.motion.bob.speed, 1.5);         // parked: a 1.5 px idle bob

  // ---- the loop: a flat ring on the ground around the wheels. Back half drawn before the car (it passes
  //      behind the body), front half after it, so it reads as a ring lying on the ground.
  const LP = { cx: P.x, cy: P.y + 140 * P.s, rx: 390, ry: 56 };
  const loopK = K.seg(t, tLoop - 0.05, tLoop + 0.75);
  const lapStart = tLoop + 0.75;
  const lapEnd = lapStart + M.motion.loop;                       // one lap, unlabelled
  const u = t < lapStart ? 0 : K.ease.io(K.seg(t, lapStart, lapEnd));
  const dotA = 1 - K.io(t, lapEnd - 0.55, 0.55);               // the dot fades over the end of its lap, before "deciding"
  const loopA = K.io(t, tLoop - 0.05, 0.4);
  const drawLoop = (back) => {
    if (loopK <= 0) return;
    const g = K.ctx();
    g.save(); g.beginPath();
    if (back) {
      // above the ring's centre line, minus the car body (the body is translucent, so the far arc must not show through it)
      g.rect(0, 0, 1920, LP.cy);
      const x0 = P.x - 430 * P.s, x1 = P.x + 430 * P.s;
      g.rect(x0, P.y - 90 * P.s, x1 - x0, LP.cy - (P.y - 90 * P.s));
      g.clip('evenodd');
    } else { g.rect(0, LP.cy, 1920, 1080 - LP.cy); g.clip(); }
    K.layer(loopA, () => M.loop(t, { ...LP, k: K.ease.out(loopK), stations: 0, alpha: 0.75, dot: null }));
    if (loopK >= 1 && dotA > 0.01) K.layer(loopA * dotA, () => M.loop(t, { ...LP, k: 1, stations: 0, alpha: 0, dot: u }));
    g.restore();
  };
  drawLoop(true);

  M.car(t, P.x, P.y + bob, P.s, {
    build,
    ground: K.io(t, 0.3, 1.0),
    engine: { turn, glow: eGlow },
    bodyGlow,
    head,
    wheel, wheelGlow,
    passenger: pass, youGlow,
    rack: rackK > 0 ? { k: rackK, tools, labels: 0, lit: toolsLit } : undefined,
  });
  // the engine is small at this scale: a little extra gold at its bay carries the keep-1 glow
  if (eGlow > 0) { const e = M.pt(P.x, P.y + bob, P.s, 'engine'); K.glow(e.x, e.y, 95, C.head, 0.32 * eGlow); }
  drawLoop(false);
  // you decide: a gold hairline callout from the passenger seat as "deciding" is said (gold = you, as in 05)
  {
    const pp = M.pt(P.x, P.y + bob, P.s, 'passenger');
    M.callout('you decide', pp.x - 14, pp.y + 4, 600, 300, { k: K.seg(t, tDecide - 0.1, tDecide + 0.6), color: C.head, stroke: C.gold, dot: false });
  }

  // ---- the three rows: number (layer colour), bold lead (gold), rest (cream) — block centred under the car
  const LEAD = { font: 'ui', size: 34, weight: 600, color: C.head };
  const REST = { font: 'read', size: 30, color: C.body };
  const ROWS = [
    { y: 600, n: '01', nc: C.head, lead: 'The model is the engine.', rest: "A lab's file of numbers.", rest2: 'Text in, text out.', at: k1, restAt: tLab, rest2At: tText },
    { y: 690, n: '02', nc: C.strong, lead: 'The app is the car.', rest: 'Window, chats, instructions, bill.', rest2: 'One engine, many cars.', at: k2, restAt: tChat, rest2At: tOne },
    { y: 780, n: '03', nc: C.accent, lead: 'An agent is the car you let drive.', rest: 'Tools, a loop,', rest2: 'and you decide what it may do.', at: k3, restAt: tTools, rest2At: tYou },
  ];
  const GAP = 18, NUMW = 64;
  const restW = (r) => K.measure(r.rest, REST) + (r.rest2 ? K.measure(' ' + r.rest2, REST) : 0);
  const widths = ROWS.map((r) => K.measure(r.lead, LEAD) + GAP + restW(r));
  const X0 = Math.round(960 - (Math.max(...widths) + NUMW) / 2 + NUMW);
  ROWS.forEach((r) => {
    const lw = K.measure(r.lead, LEAD);
    K.rise(t, r.at - 0.1, () => {
      K.text(r.n, X0 - NUMW, r.y, { font: 'mono', size: 26, weight: 600, color: r.nc, alpha: 0.9 });
      K.text(r.lead, X0, r.y, LEAD);
    }, 16);
    K.rise(t, r.restAt - 0.1, () => K.text(r.rest, X0 + lw + GAP, r.y, REST), 12);
    if (r.rest2) K.rise(t, r.rest2At - 0.1, () => K.text(' ' + r.rest2, X0 + lw + GAP + K.measure(r.rest, REST), r.y, REST), 12);
  });
});
