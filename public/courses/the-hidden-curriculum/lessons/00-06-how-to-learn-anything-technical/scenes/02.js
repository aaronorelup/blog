/* 00.06 · scene 02 — Where it lives
   The course map (K.map). 01's lit house shrinks onto the map and settles just under the Start gate: this lesson
   lives at the Start, and every district is walked from that house.
   The gap between the two rows of districts is the map's "street" (y 571): every caption in this scene sits on it,
   so nothing covers a district's text.
   Beats (local seconds, cues.json):
     - lead-in      01's house (s 260 at 960, 690) shrinks to s 84 under the Start gate while the map assembles.
     - [[pin]]      the pin drops on Start / 00 (the scene's one 'back'); the districts and lanterns dim.
     - [[lanterns]] the six lanterns light left to right, the districts come back; the label row ("lights every
                    district") fades in on "AI"; on "lights" a pool of lantern light falls on each district; on
                    "doesn't walk" a street pill: "AI doesn't walk the streets".
     - [[walking]]  a dashed gold walk leaves the house along the street; pill "The walking stays yours".
     - [[districts]] ("There are four") four pills land inside their own district cards (top-right, by the name:
                    dependencies in The Code, team fit in The History, security in Trust, going live in Shipping);
                    The Machine and The Network step back. Each pill turns gold as its check is named, and its
                    district takes a gold outline as the district is named (Code, History, Trust, Shipping).
   Exit: map holds, Start pinned, the walk resting, four gold pills, one inside each checked district, four districts outlined. */
SCENE('02', (t, S) => {
  const C = K.C, MAP = K.map, P = M.palette, g = K.ctx();
  const GATE = MAP.GATE;

  // ------------------------------------------------------------------ beats (local seconds)
  const tPin = S.cue('pin', 1.43);
  const tLan = S.cue('lanterns', 9.14);
  const tAI = S.find(/^AI$/, 0, 10.5);
  const tLights = S.find('lights', 0, 12.7);
  const tNotWalk = S.find(/^doesn/, 0, 14.5);           // "but it doesn't walk the streets for you"
  const tWalk = S.cue('walking', 17.59);
  const tFour = S.cue('districts', 20.47);
  const CHECKS = [
    { s: 'dependencies', at: S.find(/^(Packages|Dependencies)/, 0, 23.5), d: 'code', dAt: S.find(/^Code/, 0, 24.8) },
    { s: 'team fit', at: S.find(/^(Review|Team)/, 0, 25.5), d: 'history', dAt: S.find(/^History/, 0, 26.6) },
    { s: 'security', at: S.find(/^Security/, 0, 27.5), d: 'trust', dAt: S.find(/^Trust/, 0, 28.6) },
    { s: 'going live', at: S.find(/^going/, 0, 29.7), d: 'shipping', dAt: S.find(/^Shipping/, 0, 30.8) },
  ];

  // ------------------------------------------------------------------ the house: 01's title house -> under the Start
  const FROM = M.layout.title;                          // {x 960, y 690, s 260}
  const HOME = { x: GATE.x, y: 588, s: 84 };            // under the gate's "Start" label (baseline 494)
  const go = K.io(t, -0.35, 1.2);
  const hx = K.lerp(FROM.x, HOME.x, go), hy = K.lerp(FROM.y, HOME.y, go), hs = K.lerp(FROM.s, HOME.s, go);
  const leakOut = 1 - K.io(t, -0.4, 0.5);               // 01's leak trail rests at 1; it drains as the house leaves

  // ------------------------------------------------------------------ map states
  const pinDrop = K.io(t, tPin, 0.7, 'back');
  const pinGlow = K.io(t, tPin + 0.15, 0.6);
  const focusK = K.io(t, tPin, 0.8) * (1 - K.io(t, tLan, 0.9));
  const lanterns = (i) => K.stagger(t, tLan, i, 0.14, 0.6);
  const labelK = K.io(t, tAI - 0.3, 0.6);
  const pool = (i) => K.stagger(t, tLights, i, 0.12, 0.7) * (1 - K.io(t, tWalk, 0.8));
  // the two districts with no check in them step back on "There are four"
  const restK = K.io(t, tFour, 0.7);

  K.bg();

  MAP.draw(t, {
    t0: 0, focus: '00', focusK, dim: 0.55,
    pin: '00', pinDrop, pinK: K.io(t, tPin, 0.25), pinGlowK: pinGlow,
    lanterns, lanternLabels: labelK,
  });

  // lantern light pooling on each district ("it lights every district")
  MAP.DISTRICTS.forEach((d, i) => { const k = pool(i); if (k > 0.002) K.glow(d.x + d.w / 2, d.y + d.h * 0.45, 250, C.head, 0.1 * k); });

  // The Machine and The Network step back (page-colour veil over the card)
  if (restK > 0.002) ['machine', 'network'].forEach((id) => {
    const d = MAP.district(id);
    K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); g.fillStyle = K.rgba(C.page, 0.5 * restK); g.fill();
  });

  // gold outline + soft glow on each checked district as it is named
  CHECKS.forEach((c) => {
    const k = K.io(t, c.dAt - 0.1, 0.6);
    if (k <= 0.002) return;
    const d = MAP.district(c.d);
    K.glow(d.x + d.w / 2, d.y + d.h / 2, 240, C.head, 0.07 * k);
    g.save(); K.rr(d.x, d.y, d.w, d.h, 24); g.strokeStyle = K.rgba(C.head, 0.9 * k); g.lineWidth = 2.5; g.stroke(); g.restore();
  });

  // ------------------------------------------------------------------ the street (y 571, between the two rows)
  const SY = 571;
  // the walk: from the house's right side up onto the street and along it
  const geo0 = M.geo(HOME.x, HOME.y, HOME.s);
  const WALK = [[geo0.body.x1 + 6, geo0.ground - 6], [geo0.body.x1 + 40, SY + 6], [300, SY], [1000, SY], [1720, SY]];
  const walkK = K.io(t, tWalk, 1.6, 'io');
  if (walkK > 0) K.path(WALK, { k: walkK, color: P.machine, w: 3, dash: [10, 10], head: walkK < 0.98, headSize: 14, alpha: 0.85, tension: 0.4 });

  const pillO = (alpha, color, glow) => ({ size: 28, color, alpha, glow, fill: C.tile, stroke: K.rgba(C.head, 0.55) });
  // "but it doesn't walk the streets for you" (the map's own label row already says "lights every district")
  const aiK = K.io(t, tNotWalk - 0.1, 0.5) * (1 - K.io(t, tWalk - 0.3, 0.4));
  if (aiK > 0.002) K.layer(1, () => { g.save(); g.translate(0, (1 - aiK) * 10); K.pill('AI doesn’t walk the streets', 960, SY, pillO(aiK, C.strong, 0)); g.restore(); });
  // "The walking stays yours"
  const wK = K.io(t, tWalk + 0.5, 0.5) * (1 - K.io(t, tFour - 0.3, 0.4));
  if (wK > 0.002) { g.save(); g.translate(0, (1 - wK) * 10); K.pill('The walking stays yours', 960, SY, pillO(wK, C.strong, 0)); g.restore(); }

  // four checks, each pinned INSIDE its own district card (top-right corner, level with the district name), so there
  // is no doubt which district owns which check. Soft when they land on "There are four", gold when named.
  CHECKS.forEach((c, i) => {
    const d = MAP.district(c.d);
    const k = K.stagger(t, tFour, i, 0.12, 0.5);
    if (k <= 0.002) return;
    const on = K.io(t, c.at - 0.05, 0.5);
    const PS = 26;                                     // 26: 'dependencies' must clear 'The Code'
    const w = K.measure(c.s, { size: PS, font: 'ui', weight: 600 }) + PS * 1.6;
    const cx = d.x + d.w - 16 - w / 2, cy = d.y + 58;
    g.save(); g.translate(0, (1 - k) * 10);
    K.pill(c.s, cx, cy, { size: PS, alpha: k, color: K.mixColor(C.soft, C.head, on), stroke: K.mixColor(C.line2, C.head, on), glow: 0.3 * on, fill: C.tile });
    g.restore();
  });

  // ------------------------------------------------------------------ the house (drawn last: on top while it flies in)
  M.house(t, hx, hy, hs, { lights: 1, leak: leakOut, alpha: 1 });
});
