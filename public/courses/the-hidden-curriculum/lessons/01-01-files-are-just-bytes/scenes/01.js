/* 01.01 scene 01: Bytes inside, a label outside (title card)
   The string of beads is the emblem: ghosted from frame 0, it lights on "Every file is just a row of numbers",
   the hello.py tag swings on at "extension", its .py is underlined on "label", the beads are named "contents"
   on "not what is inside", and on "Agents" the sparkle drifts in from the right, tethers to the last bead and sends a soft gold wave back along the beads, with an "agent" pill. */
SCENE('01', (t, S) => {
  const C = K.C, L = { x: 1020, y: 600, s: 0.95 };   // title layout scaled up (numbers ~27 px) and nudged left so the agent fits at the right

  // ground: painted plate on the lower band only (all type sits on the dark upper band); K.bg if missing
  K.bg({ glow: 0.3, glowX: 960, glowY: 300 });
  K.plate('plate', t, { zoom: true, shade: 0.45, mask: [640, 860] });

  // beats (local seconds)
  const aHead = S.cue('headline', 9.6);
  const aBytes = S.find('numbers', 0, aHead + 2);          // beads light as "a row of numbers called bytes" is said
  const aPy = S.find('dot', 0, 6.4);                        // "like dot P Y" in the opening sentence
  const aExt = S.find('extension', 0, aHead + 4.3);         // tag swings on with "the extension"
  const aLabel = S.find('label', 0, aHead + 7);             // "a label that tells your computer..."
  const aNot = S.cue('not-inside', aHead + 12);             // "not what is inside"
  const aAgents = S.cue('agents', aNot + 1.9);

  // ---- title block (on screen from frame 0)
  K.eyebrow('01.01 · Your computer, under the hood', 960, 170, { size: 20, align: 'center' });
  K.title('Files are just bytes', 960, 250, { size: 84, align: 'center' });
  const pre = 'What a file is, and what ', lit = '.py', post = ' does';
  const pOpt = { font: 'read', size: 32, color: C.body };
  const pw = K.spans([{ s: pre }, { s: lit, font: 'mono', weight: 600, color: K.mixColor(C.body, C.head, K.io(t, aPy, 0.6)) }, { s: post }], 960, 320, { ...pOpt, align: 'center' });
  const pyX0 = 960 - pw / 2 + K.measure(pre, pOpt), pyW = K.measure(lit, { ...pOpt, font: 'mono', weight: 600 });
  K.mark(pyX0, 332, pyW, K.io(t, aPy, 0.6), { color: C.gold, w: 4, alpha: 0.85 });

  // conclusion rises under the purpose line on the headline
  const cK = K.io(t, aHead, 0.7);
  if (cK > 0) K.text('Bytes inside, a label outside.', 960, 400 + (1 - cK) * 16, { font: 'read', weight: 600, size: 40, color: C.head, align: 'center', alpha: cK });

  // ---- the string (the lesson's one object)
  const swing = K.io(t, aExt, 0.8, 'back');                 // the scene's one overshoot
  const tagA = K.clamp((t - aExt) / 0.25);
  const markK = K.io(t, aLabel, 0.6);
  const G = M.drawString(L.x, L.y, L.s, {
    t, preset: 'py',
    lit: (i) => 0.12 + 0.88 * K.stagger(t, aBytes, i, M.motion.beadStep, 0.4),   // ghosts a touch above 0.15 so the row reads on the dark band
    tag: { name: 'hello.py', swing, mark: markK },
    tagK: tagA,
  });

  // ---- pills: "label" over the tag, "contents" over the beads
  const tg = G.tag;
  const pillY = 500;
  if (tg && markK > 0) {
    const ex = tg.ext.cx;
    K.line(ex, pillY + 22, ex, tg.y0 - 2, { color: C.gold, w: 2, alpha: 0.6 * markK, k: markK });
    K.pill('label', ex, pillY, { size: 26, color: C.head, stroke: C.gold, alpha: markK });
  }
  const ctK = K.io(t, aNot, 0.6);
  if (ctK > 0) {
    // a soft bracket over the bead row, then the pill
    const bx0 = G.beads[0].x - G.r, bx1 = G.beads[G.beads.length - 1].x + G.r, by = L.y - G.r - 14;
    const g = K.ctx();
    g.save(); g.globalAlpha *= 0.7 * ctK; g.strokeStyle = C.strong; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx0, by + 8); g.lineTo(bx0, by); g.lineTo(bx1, by); g.lineTo(bx1, by + 8); g.stroke();
    g.beginPath(); g.moveTo(L.x, by); g.lineTo(L.x, pillY + 22); g.stroke();
    g.restore();
    K.pill('contents', L.x, pillY, { size: 26, color: C.strong, alpha: ctK });
  }

  // ---- [[agents]]: the sparkle drifts in from the right, touches the string's end, and a soft gold
  //      wave runs back along the beads (an agent reading the file); a small "agent" pill names it
  const agK = K.io(t, aAgents, 0.9);
  if (agK > 0) {
    const last = G.beads[G.beads.length - 1];
    const ax = K.lerp(1800, 1680, agK), ay = L.y;
    const touchK = K.io(t, aAgents + 0.7, 0.5);
    // tether: a short gold line from the sparkle to the last bead, resting faint
    if (touchK > 0) K.line(ax - 40, ay, last.x + G.r + 6, ay, { color: C.gold, w: 3, alpha: 0.75, k: touchK });
    // the wave, drawn over the beads but soft, right to left, then gone (calm end frame)
    const w0 = aAgents + 0.9;
    G.beads.forEach((b, i) => {
      const ph = t - (w0 + (G.beads.length - 1 - i) * 0.07);
      if (ph > 0 && ph < 0.8) K.glow(b.x, b.y, G.r * 1.9, C.gold, 0.45 * Math.sin(Math.PI * ph / 0.8));
    });
    M.agent(ax, ay, 56, { t, alpha: agK, glow: agK });
    K.pill('agent', ax, ay + 80, { size: 26, color: C.head, stroke: C.gold, alpha: K.io(t, aAgents + 0.3, 0.6) });
  }

  // a few petals, clear of the type, the string, the pills and the sparkle
  K.petals(t, { n: 5, avoid: [[160, 140, 1760, 430], [90, 460, 1810, 730]] });
});
