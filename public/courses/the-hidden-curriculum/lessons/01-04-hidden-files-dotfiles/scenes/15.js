// 15 · Keep this (end card). Bookends 01: the plate, the staff-only door ajar at the right with gold light in the gap.
// Three bold-lead takeaways rise on their cues. [[keep-1]] the door's Windows flag (a "Hidden" tag) hangs on the
// knob as "a flag on Windows" is said; [[keep-2]] your key (terracotta) settles at the door's foot on "key";
// [[keep-3]] an agent with its lantern joins it and the light through the door brightens a little, one soft glow
// pulse ("keep this picture"). Last frame: three takeaways, door ajar, key and agent, petals drifting.
SCENE('15', (t, S) => {
  const C = K.C, M = window.M;
  const k1 = S.cue('keep-1', 1.27), k2 = S.cue('keep-2', 10.43), k3 = S.cue('keep-3', 21.1);
  const flagAt = S.find('flag', 0, k1 + 5.8);
  const keyAt = S.find('key', 0, k2 + 9.2);
  const agentAt = S.find('agents', 0, k3 + 0.9);

  K.bg({ glow: 0.6 });
  K.plate('plate', t, { zoom: true, shade: 0.35 });

  // soft indigo scrim behind the text block (same as 01) so cream and gold read over the plate
  {
    const g = K.ctx();
    g.save();
    g.translate(700, 520); g.scale(1, 0.5);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1100);
    grad.addColorStop(0, K.rgba(C.page, 0.95));
    grad.addColorStop(0.6, K.rgba(C.page, 0.82));
    grad.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = grad; g.fillRect(-1200, -1200, 2400, 2400); g.restore();
    // a quieter pool under the key and the agent
    g.save(); g.translate(1615, 820); g.scale(1, 0.45);
    const g2 = g.createRadialGradient(0, 0, 0, 0, 0, 260);
    g2.addColorStop(0, K.rgba(C.page, 0.7)); g2.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = g2; g.fillRect(-300, -300, 600, 600); g.restore();
  }

  // the door: barely ajar on the first frame (continuity with 14's doors), it swings about a quarter open on
  // [[keep-1]] and a warm wedge of light spills from the gap onto the step; brighter on the third takeaway
  const D = M.layout.title.door; // (1560, 360), 96 x 330, sill at y 690
  const DW = 96, DH = 330;
  const swing = K.io(t, k1 + 0.2, 0.9);
  const open = K.lerp(0.12, 0.75, swing);
  const brighter = K.io(t, agentAt + 0.2, 0.8);
  const pulse = K.io(t, agentAt + 0.2, 0.4) * (1 - K.io(t, agentAt + 0.6, 0.4));
  const lightK = K.lerp(0.35, 0.8, swing) + 0.2 * brighter;
  {
    // light wedge on the step: from the gap at the sill, fanning out and down; low alpha, drawn under the door
    const g = K.ctx();
    const pw = (DW - 8) * (1 - 0.42 * open);
    const gx0 = D.x + 4 + pw, gx1 = D.x + DW - 4, sy = D.y + DH;
    const spread = 70 + 40 * swing;
    g.save();
    g.beginPath();
    g.moveTo(gx0, sy); g.lineTo(gx1, sy);
    g.lineTo(gx1 + spread * 1.2, sy + 120); g.lineTo(gx0 - spread * 0.5, sy + 120);
    g.closePath();
    const gr = g.createLinearGradient(0, sy, 0, sy + 120);
    gr.addColorStop(0, K.rgba(M.palette.light, 0.30 * lightK * swing + 0.04));
    gr.addColorStop(1, K.rgba(M.palette.light, 0));
    g.fillStyle = gr; g.fill(); g.restore();
    K.glow((gx0 + gx1) / 2, sy + 20, 90, M.palette.light, 0.16 * lightK * (0.3 + 0.7 * swing));
  }
  M.doorGroup(D.x, D.y, D.s, { open, light: Math.min(1, lightK), glow: pulse });

  // the Windows flag on the knob ("a flag on Windows")
  const tagK = K.io(t, flagAt, 0.6);
  if (tagK > 0.002) {
    const kx = D.x + 4 + (DW - 8) * (1 - 0.42 * open) * 0.82; // the knob, wherever the panel is
    M.tag(kx, D.y + DH * 0.5 + 8, { t, k: tagK, alpha: tagK, side: 1, size: 26 });
  }

  // your key, at the door's foot (terracotta = secrets)
  const keyK = K.io(t, keyAt, 0.6);
  if (keyK > 0.002) {
    K.layer(keyK, () => {
      const y = 790 + 14 * (1 - keyK);
      K.glow(1500, y, 60, M.palette.secret, 0.18);
      K.icon('key', 1500, y, 64, { color: M.palette.secret, w: 3.5 });
      K.text('your keys', 1500, y + 66, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center' });
    });
  }
  // an agent with its lantern
  const agK = K.io(t, agentAt, 0.6);
  if (agK > 0.002) {
    const y = 790 + 14 * (1 - agK);
    M.staff(1720, y, 52, { t, i: 1, alpha: agK, lantern: K.io(t, agentAt + 0.3, 0.6) });
    K.text('AI agents', 1720, 790 + 66, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center', alpha: agK });
  }

  // petals, kept off the text and the door group
  K.petals(t, {
    n: 6, seed: 15, alpha: 0.5,
    avoid: [[130, 170, 1420, 860], [1420, 250, 1800, 900]],
  });

  // body text: backticked words are literal dot-names (mono, gold leading dot); the rest is Georgia. Wraps by width.
  const flow = (str, x, y, maxW, lh, alpha) => {
    const toks = [];
    str.split('`').forEach((seg, si) => {
      seg.split(/(\s+)/).forEach((w) => { if (w) toks.push({ s: w, lit: si % 2 === 1, sp: /^\s+$/.test(w) }); });
    });
    const rf = { font: 'read', size: 30, weight: 400 }, mf = { font: 'mono', size: 30, weight: 600 };
    let cx = x, cy = y;
    toks.forEach((tk) => {
      const w = K.measure(tk.s, tk.lit ? mf : rf);
      if (tk.sp) { if (cx > x) cx += w; return; }
      if (cx > x && cx + w > x + maxW) { cx = x; cy += lh; }
      if (tk.lit) M.dotName(tk.s, cx, cy, { size: 30, alpha });
      else K.text(tk.s, cx, cy, { ...rf, color: C.strong, alpha });
      cx += w;
    });
  };

  K.eyebrow('Keep this', 160, 214, { size: 24 });

  const X = 160, TX = 236, TW = 890; // body ends by x ~1126, before the lantern string
  const rows = [
    { y: 312, at: k1, lead: 'Hidden means out of sight, not locked.',
      body: 'A dot on Mac and Linux, a flag on Windows, and anything can still read it.' },
    { y: 502, at: k2, lead: 'Your secrets live in the hidden layer.',
      body: '`.env` is plain text. Never commit it, never paste it, and replace a key that leaked.' },
    { y: 692, at: k3, lead: 'Agents read and write this layer.',
      body: 'After an agent works, check what changed, hidden files included, and review rules and MCP config like code.' },
  ];
  rows.forEach((r, i) => {
    const k = K.io(t, r.at, 0.6, 'out');
    if (k <= 0.002) return;
    const dy = 18 * (1 - k);
    K.text(String(i + 1), X, r.y + dy, { font: 'head', size: 52, weight: 700, color: C.head, alpha: k });
    K.title(r.lead, TX, r.y + dy, { size: 44, alpha: k });
    flow(r.body, TX, r.y + 58 + dy, TW, 42, k);
  });
});
