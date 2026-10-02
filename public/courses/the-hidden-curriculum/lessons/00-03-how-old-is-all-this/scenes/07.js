// 07 — The lantern: new light on old streets
// The street of years in full (04's layout), old tags resting at half strength, the lanterns lit at the far end.
// On "assumes you know the oldest ones" a soft gold light spreads back from the lanterns to 1969 and each old tag
// brightens as the light's edge passes it. A coding agent (sparkle) hangs under the lanterns and sends four
// everyday jobs down onto the OLD stretch, one per spoken verb: cd (1971 shell), app.py (1991 Python),
// .venv (2012), git commit (2005). Each job leaves the agent as a spark, drops past the street's far end, travels
// left under the street and lands in a row below the tags, carrying its own gold year ("1971 · cd project"); as it
// lands, that year's node on the street swells once (and the Unix / ~1991 / Git tag it relies on warms). No leader
// lines: the tag rows below the street leave no clean path, and a line through a pill reads as "belongs to that pill". On "can't tell" a terracotta "?" appears beside the agent and every job pulses.
// On "oldest ground" a dashed gold arrow arcs from the agent to the 1969 end. On [[light]] the job row steps back,
// the "new light, old streets" pill gives its slot to the recurring line, which closes the scene as the headline,
// and on "lights" one warm sweep runs from the lanterns back along the whole street to 1969, warming every old tag
// in turn, then settles into an even glow along the street ("it lights every district").
// No lantern tags here: the agent owns the space under the lanterns.
SCENE('07', (t, S) => {
  const C = K.C, L = M.layout.s07, gm = M.geom('full');

  // ---- times: every beat on the word that names it
  const tAssume = S.cue('assume', 3.18);                  // "The newest layer assumes you know the oldest ones."
  const tAgent = S.find('coding', 0, 6.68);               // "A coding agent will ..."
  const tCd = S.cue('agent-cd', 8.05);                    // "run C D,"
  const tPy = S.find('write', 0, tCd + 1.26);             // "write a dot P Y file,"
  const tVenv = S.find('make', 0, tCd + 3.4);             // "make a dot V E N V,"
  const tGit = S.find('save', 0, tCd + 5.98);             // "and save its work with git."
  const tTell = S.find('tell', 0, 17.96);                 // "you can't tell whether it did the right thing."
  const tGround = S.cue('old-ground', 20.03);             // "The newest thing on the road spends its day on the oldest ground."
  const tPill = S.find('spends', 0, tGround + 1.4);
  const tLantern = S.find('lantern', 0, 25.22);           // "AI is the lantern:"
  const tLight = S.cue('light', 26.09);                   // "it lights every district, but it doesn't walk the streets for you."

  const [ax, ay, as] = L.agent;

  // ---- the agent's four jobs. Each lands in a row below the tag rows (b2 pills end at y 745), x near its year but
  // nudged into the gaps between pills, and carries its own year, so it never borrows a neighbouring pill's meaning.
  const rowY = 856;                                        // job anchor; the caption / chip line sits at ~870
  const jobs = [
    { kind: 'chip', s: 'cd project', year: M.YEARS.shell, x: 317, at: tCd, tagI: 0 },        // Unix shell, 1971
    { kind: 'file', s: 'app.py', year: M.YEARS.python, x: 770, at: tPy, tagI: 4 },           // Python, 1991
    { kind: 'folder', s: '.venv', year: M.YEARS.venv, x: 1440, at: tVenv, tagI: -1 },        // venv, 2012
    { kind: 'chip', s: 'git commit', year: 2005, x: 1150, at: tGit, tagI: 6, low: true },  // passes under .venv               // Git, 2005
  ];
  const FLY = 0.9, SPARK = 0.26;                           // total flight; the first part is a spark only
  const landAt = (j) => j.at + FLY;
  const landK = (j) => K.io(t, landAt(j) - 0.15, 0.5);    // the landing settles: warms its year on the street
  const nodeK = (j) => K.io(t, landAt(j) - 0.1, 0.4);     // the job's year node appears on the street as it lands

  // ---- the light: a pool at the lanterns, then it spreads back to 1969
  const lightK = K.io(t, tAssume, 1.2);
  const edgeX = K.lerp(M.X(2020, gm), M.X(1968, gm), lightK);   // the light's left edge (matches M.light)
  const edgeY = M.yearAt(edgeX, gm);
  const reached = (year) => K.ease.io(K.clamp((year + 3 - edgeY) / 4));
  const lineSwell = M.bump(t, tLantern, 1.8);
  const rest = 1 - 0.6 * K.io(t, tLight, 0.6);              // on [[light]] the job row steps back to 0.4

  // ---- "it lights every district": one warm sweep from the lanterns back to 1969 (0.8 s), then an even settle
  const tLights = S.find('lights', 0, 26.31);
  const SW = 0.8, swRaw = K.clamp((t - tLights) / SW);
  const swOn = t >= tLights && swRaw < 1;
  const frontX = K.lerp(M.X(2024, gm), M.X(1962, gm), K.ease.io(swRaw));
  const swEnv = swOn ? Math.sin(Math.PI * swRaw) ** 0.6 : 0;
  const sweepAt = (x) => swEnv * Math.exp(-(((x - frontX) / 150) ** 2));
  const settle = K.io(t, tLights + 0.5, 0.9);              // after the sweep: the whole street stays gently lit

  K.bg({ glow: 0.22, glowX: 1660, glowY: 300 });
  M.light(gm, lightK, { a: 0.3 + 0.06 * lineSwell + 0.04 * settle, h: 150 });
  // the settled light: an even warm lane along the whole street, 1969 to the lanterns (not only a pool at the far end)
  if (settle > 0) {
    const g = K.ctx(), xa = M.X(1967, gm), xb = M.X(2025, gm);
    const lg = g.createLinearGradient(xa, 0, xb, 0);
    lg.addColorStop(0, K.rgba(C.head, 0)); lg.addColorStop(0.08, K.rgba(C.head, 0.07 * settle));
    lg.addColorStop(0.9, K.rgba(C.head, 0.07 * settle)); lg.addColorStop(1, K.rgba(C.head, 0));
    g.save(); g.fillStyle = lg; g.globalCompositeOperation = 'lighter';
    // vertical falloff: thin stacked bands with gaussian alpha make a soft lane
    for (let i = -6; i <= 6; i++) {
      const a = Math.exp(-((i / 3.2) ** 2));
      g.globalAlpha = a; g.fillRect(xa, gm.y - 20 + i * 26 - 13, xb - xa, 26);
    }
    g.restore();
  }
  // the sweep's moving front: a warm bloom travelling along the street
  if (swEnv > 0) {
    K.glow(frontX, gm.y - 20, 230, M.palette.lanternGlow, 0.22 * swEnv);
    K.glow(frontX, gm.y, 90, M.palette.lanternGlow, 0.35 * swEnv);
  }

  // old tags: half strength until the light reaches them; the tag an agent job lands under warms
  const itemAlpha = (i) => 0.5 + 0.5 * reached(M.BUILDINGS[i].year);
  const itemLit = (i) => {
    const j = jobs.find((x) => x.tagI === i);
    const job = j ? 0.7 * landK(j) * (0.6 + 0.4 * rest) : 0;
    const sw = 0.9 * sweepAt(M.itemPos(gm, M.BUILDINGS[i]).x);
    return Math.min(1, Math.max(job, sw, 0.18 * settle));
  };
  M.street(t, { geom: gm, itemAlpha, itemLit, lanterns: 1, lanternTags: 0, lanternGlow: 1 + 0.6 * lineSwell });

  // each job's year on the street: a node (1971 and 2012 have no building of their own) that swells as the job lands
  jobs.forEach((j) => {
    const k = nodeK(j);
    if (k <= 0) return;
    const x = M.X(j.year, gm), p = M.bump(t, landAt(j) + 0.25, 0.8);
    if (p > 0) K.glow(x, gm.y, 50, C.head, 0.6 * p);
    K.line(x, gm.y, x + 0.01, gm.y, { color: C.head, w: 10 + 6 * p, alpha: K.clamp(k * 3) });
  });

  // ---- the agent: a sparkle under the lanterns, named "coding agent"
  const agentK = K.io(t, tAgent, 0.6, 'out');
  if (agentK > 0) {
    const send = Math.max(...jobs.map((j) => M.bump(t, j.at - 0.1, 0.7)));
    K.layer(agentK, () => {
      K.glow(ax, ay, 90, M.palette.lanternGlow, 0.22 + 0.18 * send);
      K.at(ax, ay, 0.85 + 0.15 * agentK, 0, () => K.icon('sparkle', 0, 0, as, { color: M.palette.lanternGlow, w: 3.5 }));
      K.text('coding agent', ax, ay + as * 0.5 + 44, { font: 'ui', weight: 600, size: 26, color: C.accent, align: 'center' });
    });
  }

  // ---- "you can't tell whether it did the right thing": the doubt sits with the agent, and every job pulses
  const tellPulse = M.bump(t, tTell, 1.0);
  const qk = K.io(t, tTell, 0.6, 'out');
  if (qk > 0) {
    K.layer(qk * (0.55 + 0.45 * rest), () => K.at(1750, 420, 0.7 + 0.3 * qk, 0,
      () => K.icon('question', 0, 0, 56, { color: C.accent, w: 3.5 })));
  }

  // ---- the four jobs: a spark leaves the agent, drops past the street's far end (x > 1760, so it never crosses
  // the line, a tag or a decade label), then travels left beneath the street and becomes the job as it lands
  // a job: the artifact plus its own year, written "year · thing" like every tag in the lesson (year in gold mono)
  const yearParts = (j) => [
    { s: String(j.year), font: 'mono', weight: 600, size: 26, color: C.head },
    { s: '  ·  ', font: 'ui', weight: 400, size: 26, color: C.soft },
    { s: j.s, font: 'mono', weight: 500, size: 26, color: C.strong },
  ];
  const partsW = (parts) => parts.reduce((w, p) => w + K.measure(p.s, p), 0);
  const drawJob = (j, x, y, s, a) => K.layer(a, () => K.at(x, y, s, 0, () => {
    const parts = yearParts(j), tw = partsW(parts);
    if (j.kind === 'chip') {
      const g = K.ctx(), w = tw + 26 * 1.4, h = 26 * 1.85, cy = 14;
      g.save(); K.rr(-w / 2, cy - h / 2, w, h, h / 2); g.fillStyle = C.tile; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, 0.35); g.stroke(); g.restore();
      K.spans(parts, 0, cy + 26 * 0.34, { size: 26, align: 'center' });
    } else {
      if (j.kind === 'file') K.file(0, -50, 64, { ext: 'py' });
      else K.folder(0, -46, 56);
      K.spans(parts, 0, 24, { size: 26, align: 'center' });
    }
  }));
  const bez = (u, a, b, c) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
  const SX = 1800, SY = 790;                              // where the spark has passed below the street
  jobs.forEach((j) => {
    const k = K.clamp((t - j.at) / FLY);
    if (k <= 0) return;
    const ks = SPARK / FLY;
    const x1 = j.x, y1 = rowY;
    if (k < ks) {
      // the spark: out of the agent, right and down past the street's end
      const u = K.ease.io(k / ks);
      const x = bez(u, ax + 20, 1835, SX), y = bez(u, ay + 30, ay + 120, SY);
      K.glow(x, y, 26, M.palette.lanternGlow, 0.7);
      K.line(x, y, x + 0.01, y, { color: M.palette.lanternGlow, w: 9 });
      return;
    }
    const u = K.ease.out((k - ks) / (1 - ks));
    const cx = Math.max(x1 + 220, 1560), cy = j.low ? 990 : 915;        // the low arc stays well below the hanging tags
    const x = bez(u, SX, cx, x1), y = bez(u, SY, cy, y1);
    const g0 = j.low ? 0.5 : 0.1;                          // stays a spark until it is clear of the far end (and of .venv)
    const grow = K.ease.io(K.clamp((u - g0) / 0.5));
    if (grow < 1) K.glow(x, y, 26, M.palette.lanternGlow, 0.7 * (1 - grow));
    const pulse = 1 + 0.08 * tellPulse;
    if (tellPulse > 0) K.glow(x1, rowY, 70, C.accent, 0.35 * tellPulse);
    drawJob(j, x, y, K.lerp(0.55, 1, grow) * pulse, grow * rest);
  });

  // ---- "the newest thing ... spends its day on the oldest ground": agent → the 1969 end
  const arrowK = K.io(t, tGround, 1.4);
  if (arrowK > 0) {
    const u = M.itemRect(gm, 'unix');
    K.arrow(ax - 40, ay - 10, u.cx, u.y0 - 10, { k: arrowK, bend: 288, color: C.head, w: 3, dash: [10, 9], headSize: 15, alpha: 0.9 * (0.7 + 0.3 * rest) });
  }

  // ---- the headline slot: "new light, old streets" on "spends", then the recurring line takes its place on [[light]]
  const [px, py] = L.pill;
  const pillOut = 1 - K.io(t, tLight, 0.35);
  if (pillOut > 0) K.layer(pillOut, () => K.rise(t, tPill, () =>
    K.pill('new light, old streets', px, py, { size: 30, color: C.head, stroke: K.mixColor(C.line2, C.head, 0.5) }), 18, 0.6));
  K.rise(t, tLight + 0.3, () => K.text("It lights every district. It doesn't walk the streets for you.", 960, py + 14,
    { font: 'read', size: 40, color: C.strong, align: 'center' }), 16, 0.7);
});
