/* 00.01 · 08 Keep this (end card, noBadge)
   The painted tea house at night. The folded map tile, carried over from 07's corner (same size, same
   pins: four gold shelved rows, 07's three terracotta "just" pins and 06's you-are-here pin on the
   Start gate), holds still through the
   crossfade, then glides home while "Three things to keep" is said, and seats itself beside the
   "Keep this" heading as the card's emblem: the map you keep. Each takeaway rises on its cue: the bold
   lead on the [[keep-N]] marker, the rest on its own first spoken word. Row 1's lead returns the lesson's
   one-line conclusion from 01. The row being spoken is the bright one; once the narration ends all three
   return to full for the 3 s hold. "this map" warms the tile; "lanterns" lights the tile's lantern
   string and the painted one.
   Seat note: 00-shared.js still lists layout.tile.s08 as (960, 240, 110), which left the tile floating in
   the sky; the seat is computed here from the heading's measured width instead. */
SCENE('08', (t, S) => {
  const C = K.C, L = M.layout, X = L.col;
  const DRIFT = 0.008;                       // plate drift per second (slow Ken Burns)

  // ---- timing (local seconds; fallbacks = the narrated times) ----
  const c1 = S.cue('keep-1', 1.74), c2 = S.cue('keep-2', 10.58), c3 = S.cue('keep-3', 17.52);
  const r1 = S.find('Nobody', 0, c1 + 3.0);    // "Nobody handed you this map; ..."
  const r2 = S.find('seven', 0, c2 + 2.5);     // "seven districts, with AI..."
  const r3 = S.find('Once', 0, c3 + 3.0);      // "Once you know what a thing is..."
  const tMap = S.find('map', 0, r1 + 1.4);     // "...handed you this map;"
  const tLan = S.find('lanterns', 0, c2 + 4.8);
  const tEnd = S.dur;                          // narration ends; the 3 s tail is the hold

  // ---- ground: night plate (falls back to the warm K.bg glow when the image is missing) ----
  // the plate sits 30 px right and pans slowly right, so the painted blossom twig never kisses the end
  // of the takeaway lines (it reaches x ~915 unshifted). 30 px stays inside the zoom overhang (>= 34 px).
  const PX = 30 + 0.8 * t;
  K.bg({ glow: 0.5, glowX: 1350, glowY: 520 });
  if (K.img.plate) {
    K.at(PX, 0, () => K.plate('plate', t, { zoom: true, shade: 0, drift: DRIFT }));
    const g = K.ctx(); g.save(); g.fillStyle = K.rgba(C.page, 0.55); g.fillRect(0, 0, K.W, K.H); g.restore();  // shade 0.55, full frame
    // warm the painted lantern string on "lanterns"; tracks the plate's drift (plate px -> screen)
    const z = 1.04 + DRIFT * t, gx = PX + 960 + (1335 - 960) * z, gy = 540 + (492 - 540) * z;
    const kl = K.io(t, tLan - 0.1, 0.9);
    if (kl > 0) K.glow(gx, gy, 300 * z, C.head, 0.18 * kl);
  }
  K.petals(t, { n: 6, seed: 7, alpha: 0.45 });
  // a soft night scrim under the text column (no visible panel edge): steadier contrast over the ground
  {
    const g = K.ctx(), sc = g.createLinearGradient(0, 0, 1180, 0);
    sc.addColorStop(0, K.rgba(C.page, 0.42)); sc.addColorStop(0.62, K.rgba(C.page, 0.3)); sc.addColorStop(1, K.rgba(C.page, 0));
    g.save(); g.fillStyle = sc; g.fillRect(0, 0, 1180, K.H); g.restore();
  }

  // ---- header: rises just after the 0.6 s crossfade (local -0.4..0.2), landing on "...to keep" (0.85) ----
  // drawn from frame 0 it sat on top of 07's "Surprise two" eyebrow and Command Prompt title bar mid-fade
  const EYEBROW = 'The Missing Map · 00.01', EY = 200, TY = 285, TITLE = { size: 72 };
  K.rise(t, 0.55, () => {
    K.eyebrow(EYEBROW, X, EY);
    K.title('Keep this', X, TY, TITLE);
  }, 16, 0.5);

  // ---- the map tile: from 07's corner (1700, 220, 130) to its seat beside the heading ----
  // seat: a heading-sized emblem centred on the title's letters, 46 px past "this" and clear of the
  // eyebrow's last character above it
  const SEAT_S = 104;
  const titleW = K.measure('Keep this', { font: 'head', weight: 700, size: TITLE.size, tracking: -1 });
  const ebW = K.measure(EYEBROW, { font: 'ui', weight: 600, size: 22, tracking: 4, upper: true });
  const seatX = Math.max(X + titleW + 46, X + ebW + 12) + SEAT_S / 2, seatY = TY - 27;
  const [ax, ay, as] = L.tile.corner;
  const kg = K.io(t, 0.25, 1.1);
  const p = M.arc([ax, ay], [seatX, seatY], kg, 36), lift = Math.sin(Math.PI * kg);
  // "this map": a small swell and a warm halo that settles to a quiet glow and stays (the map is yours now)
  const swell = K.io(t, tMap - 0.1, 0.45, 'out') * (1 - K.io(t, tMap + 0.35, 0.8));
  const ts = K.lerp(as, SEAT_S, kg) * (1 + 0.03 * lift + 0.06 * swell);
  const glow = K.io(t, tMap - 0.1, 0.5, 'out') * (1 - 0.6 * K.io(t, tMap + 0.6, 1.0));
  if (glow > 0) K.glow(p.x, p.y, ts * 0.92, C.head, 0.5 * glow);
  // all its pins, exactly as 07 leaves them: four gold shelved rows + 07's three terracotta "just" pins
  // (still open questions, so they stay terracotta). Offsets in units of s, copied from 07.js JUST, which moved
  // them off the storyboard's spots (its (10, 10) sat on 05's gold pin); any mismatch makes the pins jump mid-crossfade.
  const JUST = [[0.25, -0.03], [0.265, 0.17], [-0.265, 0.17]].map(([dx, dy]) => ({ dx, dy, color: C.accent }));
  // plus 06's terracotta you-are-here pin on the Start gate (this lesson sits at the gate), carried through 07;
  // the tile runs on 05's clock like 06's and 07's, so the pin's bob does not jump across the crossfade
  const s05 = ((window.__timeline || {}).sections || []).find((s) => s.n === '05');
  M.mapTile(p.x, p.y, ts, M.TAGS.map((g) => g.mod).concat(JUST), {
    t: t + (s05 ? S.start - s05.start : 0), here: true, glow, lit: K.io(t, tLan - 0.1, 0.9),
  });

  // ---- the three takeaways (same words as lesson.js keep) ----
  const FALLBACK = [
    ['The gap is in the syllabus, not in you.', "Nobody handed you this map; it's a missing semester, not a character flaw."],
    ['Every confusing thing has a shelf.', 'Seven districts, with AI as the lanterns over all of them.'],
    ['Aim for recognition, not recipes.', 'Once you know what a thing is and where it lives, the how-to is easy to find.'],
  ];
  const keep = (window.__lesson && Array.isArray(window.__lesson.keep) && window.__lesson.keep.length === 3) ? window.__lesson.keep : FALLBACK;
  const LEAD = { font: 'ui', weight: 700, size: 40, color: C.head };
  const BODY = { font: 'read', size: 32, color: C.body }, LH = 45, BW = 800;
  // a body that does not fit on one line breaks at a clause (after ; , or :), choosing the most balanced
  // split whose lines both fit; plain word wrap only if no clause break fits
  const bodyLines = (s) => {
    if (K.measure(s, BODY) <= BW) return [s];
    const w = s.split(' ');
    let best = null;
    for (let i = 1; i < w.length; i++) {
      if (!/[;,:]$/.test(w[i - 1])) continue;
      const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
      const m = Math.max(K.measure(a, BODY), K.measure(b, BODY));
      if (m <= BW && (!best || m < best.m)) best = { m, l: [a, b] };
    }
    return best ? best.l : K.wrap(s, BW, BODY);
  };
  // rows stacked with an even 56 px gap between blocks (last body line's descenders to the next lead's cap top)
  const rows = [];
  let y = 390;
  [[c1, r1], [c2, r2], [c3, r3]].forEach(([a, b], i) => {
    const lines = bodyLines(keep[i][1]);
    rows.push({ y, a, b, lines });
    y += 54 + (lines.length - 1) * LH + 10 + 56 + 30;
  });
  const relight = K.io(t, tEnd - 0.1, 0.7);   // all three full for the hold (~1.6 s before the fade to black)
  rows.forEach((r, i) => {
    const next = rows[i + 1];
    const dim = next ? 1 - 0.42 * K.io(t, next.a - 0.1, 0.5) * (1 - relight) : 1;
    K.layer(dim, () => {
      K.rise(t, r.a, () => K.text(keep[i][0], X, r.y, LEAD));
      K.rise(t, r.b, () => r.lines.forEach((ln, j) => K.text(ln, X, r.y + 54 + j * LH, BODY)), 16);
    });
  });
});
