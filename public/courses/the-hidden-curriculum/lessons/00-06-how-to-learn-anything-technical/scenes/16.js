// 16 — Keep this: end card over the street at night, our house lit among the others.
// "Safe to ignore" chips first (struck soft), then three takeaways land on their cues.
SCENE('16', (t, S) => {
  const P = M.palette, C = K.C;
  const cIgnore = S.cue('ignore', 0);
  const cK1 = S.cue('k1', 7.79);
  const cK2 = S.cue('k2', 18.76);
  const cK3 = S.cue('k3', 29.25);
  const cKeep = S.find('Keep', 0, 6.44);

  // ---- ground: night bg, painted plate only in the lower band behind the street
  K.bg({ glow: 0.4, glowX: 960, glowY: 820 });
  if (K.img.plate) K.plate('plate', t, { shade: 0.5, mask: [680, 860] });

  // ---- the street: our house (middle) fully lit, the neighbours dimmer
  const lit = [0.35, 0.6, 0.2, 0.5, 1, 0.45, 0.25, 0.55, 0.3];
  M.street(t, 960, 872, 9, 100, 170, {
    focus: 4, dim: 0.6,
    each: (i) => ({ lights: i === 4 ? 1 : (w) => ((w + i) % 3 === 0 ? 0.15 : lit[i]) }),
  });

  // ---- the end card: snug around the ignore strip, then grows to hold the takeaways
  const kOut = K.io(t, cKeep - 0.2, 0.7, 'io');
  const lerp = (a, b) => a + (b - a) * kOut;
  const CX0 = 360, CW = 1200;
  const CY0 = lerp(300, 150), CH = lerp(250, 650);
  K.card(CX0, CY0, CW, CH, { alpha: 0.96 });
  K.petals(t, { n: 7, seed: 16, alpha: 0.8, avoid: [[CX0 - 20, 130, CX0 + CW + 20, 820], [80, 800, 1840, 960]] });

  const TX = CX0 + 80;            // text left edge
  const EY = 150 + 72;            // keep-phase eyebrow baseline

  // ---- phase 1: safe to ignore for now (pills centred from the start, each on its word)
  const kIg = 1 - K.io(t, cKeep - 0.25, 0.4, 'io');
  if (kIg > 0.001) {
    K.eyebrow('Safe to ignore for now', 960, 372, { size: 30, color: P.machine, align: 'center', alpha: kIg });
    const items = [
      ['which scanner', S.find('scanner', 0, 2.1)],
      ['security jargon', S.find('jargon', 0, 3.9)],
      ['exact percentages', S.find('percentages', 0, 5.1)],
    ];
    const po = { font: 'ui', weight: 600, size: 30 };
    const g = K.ctx();
    items.forEach(([s, at], i) => {
      const k = K.io(t, at - 0.2, 0.5, 'out') * kIg;
      if (k <= 0) return;
      const cx = 960 + (i - 1) * 360, cy = 462, w = K.measure(s, po) + 56, h = 58;
      g.save(); g.globalAlpha *= k;
      K.rr(cx - w / 2, cy - h / 2, w, h, h / 2);
      g.fillStyle = K.rgba(C.strong, 0.05); g.fill();
      g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.strong, 0.35); g.stroke();
      g.restore();
      K.text(s, cx, cy + 10, { ...po, color: C.strong, align: 'center', alpha: 0.72 * k });
      K.line(cx - w / 2 + 20, cy, cx + w / 2 - 20, cy, { color: K.rgba(C.strong, 0.6), w: 2, alpha: k });
    });
  }

  // ---- phase 2: keep this
  const kKeep = K.io(t, cKeep, 0.6, 'out');
  if (kKeep > 0) K.eyebrow('Keep this', TX, EY, { size: 30, color: P.machine, alpha: kKeep });

  const rows = [
    {
      at: cK1, lead: 'The agent fixes the crashes; you own what it can\u2019t see.',
      line: 'Security, team fit, dependencies and ready to ship are judgment calls; a person who can code signs off before launch.',
      lineAt: S.find('Security', 1, cK1 + 4.8),
    },
    {
      at: cK2, lead: 'Trust AI only on what can be checked.',
      line: '\u201cYes, it\u2019s secure\u201d is just another answer; learn to check it, or get someone who can.',
      lineAt: S.find('Yes', 0, cK2 + 3.4),
    },
    {
      at: cK3, lead: 'Someone has to own the rules and the supplier list.',
      line: 'Write the norms down; a library expert approves new dependencies.',
      lineAt: S.find('Write', 0, cK3 + 4.5),
    },
  ];
  const leadW = CW - 80 - 90 - 60;  // room right of the number
  const bo = { font: 'read', size: 30, color: C.body };
  let y = EY + 104;                 // first lead baseline
  rows.forEach((r, i) => {
    const lines = K.wrap(r.line, leadW, bo);
    const rowY = y;
    y += 52 + lines.length * 40 + 62;
    const k = K.io(t, r.at, 0.6, 'out');
    if (k <= 0) return;
    const dy = (1 - k) * 14;
    // number medallion
    const nx = TX + 26, ny = rowY - 12 + dy;
    const g = K.ctx();
    g.save(); g.globalAlpha *= k;
    g.beginPath(); g.arc(nx, ny, 26, 0, Math.PI * 2);
    g.fillStyle = K.rgba(P.machine, 0.14); g.fill();
    g.lineWidth = 2; g.strokeStyle = P.machine; g.stroke();
    g.restore();
    K.text(String(i + 1), nx, ny + 11, { font: 'ui', weight: 700, size: 30, color: P.machine, align: 'center', alpha: k });
    // bold lead (the rule row in gold), shrunk only if it would overflow
    const lo = { font: 'ui', weight: 700, size: 38, color: i === 1 ? P.machine : C.strong };
    const lw = K.measure(r.lead, lo);
    if (lw > leadW) lo.size = Math.floor(38 * leadW / lw);
    K.text(r.lead, TX + 90, rowY + dy, { ...lo, alpha: k });
    // Georgia line(s)
    const k2 = K.io(t, r.lineAt, 0.6, 'out');
    if (k2 > 0) K.para(r.line, TX + 90, rowY + 52 + (1 - k2) * 10, leadW, { ...bo, lh: 40, alpha: k2 });
  });
});
