// 13 · Keep this. End card: three takeaways pop in on their cues, over the painted plate.
SCENE('13', (t, S) => {
  const P = M.P;

  // Body text: backticked words are literal (mono), the rest is Georgia. Wraps by measured width.
  const flow = (str, x, y, maxW, lh) => {
    const toks = [];
    str.split('`').forEach((seg, si) => {
      const o = si % 2
        ? { font: 'mono', size: 30, weight: 600, color: P.ink }
        : { font: 'read', size: 30, weight: 400, color: P.body };
      seg.split(/(\s+)/).forEach((w) => { if (w) toks.push({ s: w, o, sp: /^\s+$/.test(w) }); });
    });
    let cx = x, cy = y;
    toks.forEach((tk) => {
      const w = K.measure(tk.s, tk.o);
      if (tk.sp) { if (cx > x) cx += w; return; }
      if (cx > x && cx + w > x + maxW) { cx = x; cy += lh; }
      K.text(tk.s, cx, cy, tk.o);
      cx += w;
    });
  };

  const CX = 260, CW = 1400, CH = 200;
  const rows = [220, 445, 670];
  const takeaways = [
    ['A path is an address.',
      'An absolute path starts at the root. A relative path starts where the program stands.'],
    ['Every running program has a working directory.',
      'It is inherited from whatever started the program, and a `cd` moves only the session that ran it.'],
    ['The same name can mean a different file.',
      'When something is not found, check the folder the program is in. With an agent, check which project it is in too.'],
  ];
  const cues = [S.cue('keep-one', 1.5), S.cue('keep-two', 9.8), S.cue('keep-three', 21.0)];

  K.bg({ glow: 0.5 });
  K.plate('plate', t, { zoom: true, shade: 0.35, mask: [680, 860] });

  // petals stay clear of the eyebrow and the three cards
  K.petals(t, {
    n: 6, seed: 13, alpha: 0.6,
    avoid: [[780, 150, 1140, 196], [CX, rows[0], CX + CW, rows[0] + CH], [CX, rows[1], CX + CW, rows[1] + CH], [CX, rows[2], CX + CW, rows[2] + CH]],
  });

  M.eyebrow('Keep this', 960, 176, { align: 'center', alpha: K.env(t, 0, Infinity, 0.5) });

  takeaways.forEach(([lead, body], i) => {
    const y = rows[i];
    K.pop(t, cues[i], CX + CW / 2, y + CH / 2, () => {
      K.card(CX, y, CW, CH, { fill: P.card, stroke: P.cardLine, r: 24, glow: 0.3 });
      K.text(String(i + 1), CX + 56, y + 72, { font: 'head', size: 72, weight: 700, color: P.dot });
      const tx = CX + 150, tw = CW - 150 - 56;
      K.text(lead, tx, y + 70, { font: 'read', size: 34, weight: 700, color: P.ink });
      flow(body, tx, y + 118, tw, 42);
    });
  });
});
