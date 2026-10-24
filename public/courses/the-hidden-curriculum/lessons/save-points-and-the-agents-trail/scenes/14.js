/* 14 — Keep this (end card, noBadge)
   The painted plate at shade .55 bookends the title card, with a soft indigo scrim behind the text column.
   A gold 'KEEP THIS' eyebrow at (960, 200). Three M.keep rows (x 380, w 1180, ending before the lantern string; glyphs at x 270: stone + lantern,
   footprints, tracing square), each lead rising on its cue and the body on its first spoken word.
   [[credits]]: the end credit line (M.credits preset 'end', two lines at y 860) fades in, and the folded map
   (a small sheet with one fold crease, its lantern on top) settles into the gap above it.
   Petals (n 5) avoid the eyebrow, the rows, the map and the credits. No 'back' overshoot. Pure function of t.
   Exit: rows, map and credits at rest; plate drift and petals only. */
SCENE('14', (t, S) => {
  const C = K.C;

  // ---- times (local), each beat on its spoken word
  const k1 = S.cue('keep1', 0), k2 = S.cue('keep2', 9.69), k3 = S.cue('keep3', 16.35), kc = S.cue('credits', 21.83);
  const b1 = S.find(/^commits$/i, 0, 2.26);          // 'commits are save points…'
  const b2 = S.find(/^ask$/i, 0, 13.14);             // 'ask about anything aimed at…'
  const b3 = S.find(/^evidence/i, 0, 18.6);          // 'then ask for evidence: what it ran…'

  // ---- ground: the plate, as the title card, and a soft scrim behind the text
  K.bg({ glow: 0.1 });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.55, alpha: K.io(t, 0, 1.2) });
  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    if (a <= 0.002) return;
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.8)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  blob(960, 540, 1050, 430, 0.85);
  // a second, tighter navy scrim under the Keep block so its right edge stays off the lantern string
  blob(930, 470, 860, 290, 0.7);

  // ---- eyebrow
  K.eyebrow('Keep this', 960, 220, { size: 24, align: 'center', color: C.head, alpha: K.io(t, k1 - 0.2, 0.6) });

  // ---- three takeaways: lead on its cue, body on its first spoken word (row height from the full row)
  const X = 380, W = 1180,   // lines end by x 1560, before the lanterns
        glyphs = ['stone', 'step', 'tracing'];
  let y = 290;
  const row = (i, leadAt, bodyAt) => {
    M.keep(i, X, y, W, { k: K.io(t, leadAt - 0.15, 0.6), body: '', glyph: glyphs[i], t });
    M.keep(i, X, y, W, { k: K.io(t, bodyAt - 0.15, 0.6), lead: '' });
    y += M.keep(i, X, y, W, { k: 0 });
  };
  row(0, k1, b1);
  row(1, k2, b2);
  row(2, k3, b3);
  const rowsBottom = y;

  // ---- the folded map, lantern on top, settling above the credit line
  const mk = K.io(t, kc + 0.3, 0.8), mw = 190, mh = 104, mx = 960 - mw / 2;
  const my = Math.max(rowsBottom + 20, 704) + (1 - K.ease.out(mk)) * -18;
  if (mk > 0.002) {
    M.miniMap(t, mx, my, mw, mh, { k: mk, lantern: mk });
    // the fold: one crease down the middle and a faint shadow on the right half
    K.layer(mk, () => {
      g.save(); g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(960, my + 4, mw / 2 - 6, mh - 8); g.restore();
      K.line(960, my + 3, 960, my + mh - 3, { color: M.P.crease, w: 2, alpha: 0.9 });
    });
  }

  // ---- credits
  M.credits(170, 870, 1580, { preset: 'end', align: 'center', color: C.strong, alpha: 0.8 * K.io(t, kc - 0.1, 0.8) });

  // ---- petals, kept off the text, the map and the credits
  K.petals(t, {
    n: 5, seed: 14, alpha: 0.45 * K.io(t, 0.2, 1.2),
    avoid: [[700, 160, 1220, 220], [X - 150, 280, X + W + 20, 300], [X - 150, 240, X + W + 20, rowsBottom], [mx - 30, 700, mx + mw + 30, 850], [160, 830, 1760, 930]],
  });
});
