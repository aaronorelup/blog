/* 09 — Keep this (end card, noBadge)
   The lesson's one object, the tile desk, at its standard place (M.DESK), tidy and lamp-lit, receives three gold
   tiles: the three takeaways. Each tile slides in along its own (still empty) row lane from the right and settles
   in a left-aligned tile column; its gold lead rises beside it and its cream second line joins in parts on the
   spoken words. The tile + text block is measured and centred on the desk; a gold 'Keep this' heading sits above.
   - opening ("Three things to keep"): desk empty, lamp glow, heading, petals in the far margins.
   - [[keep-1]] "next token" on row 0: "It guesses the next token, over and over." / "pieces, not letters;" on
     "pieces", "limits and prices count them" on "limits".
   - [[keep-2]] "the desk" on row 1: "It only sees its desk: the context window." / "re-sent every turn;" on
     "re-sent", "old parts fall off" on "oldest". Row 0 eases to 0.7 so the new row leads.
   - [[keep-3]] "check it" on row 2: "Sounding right isn't being right." + terracotta tag "hallucination" on
     "right." / "facts on the desk," on "facts", "sources," on "sources", "check specifics" on "check".
   - row 0 also carries a gold 'temperature' tag (the 04 knob's pill: the fourth key idea, which the recorded
     narration does not repeat); it rises with the lead at [[keep-1]], so nothing new arrives in the hold.
  - on "specific" all rows return to full and the card holds, calm.
   The desk is M.DESK grown 60 px taller (y 390, h 400; legs end ~889) so the 32 px sub-lines get air;
   08 ends with no desk on screen, so there is no rect to match at the crossfade.
   No overshoot in this scene. Pure function of t. */
SCENE('09', (t, S) => {
  const C = K.C;

  // ---- times (local)
  const k1 = S.cue('keep-1', 1.92), k2 = S.cue('keep-2', 11.48), k3 = S.cue('keep-3', 21.61);
  const w = (re, fb) => S.find(re, 0, fb);
  const tPieces = w(/^pieces/i, 6.93), tLimits = w(/^limits/i, 8.6);
  const tResent = w(/^re-?sent/i, 15.41), tOldest = w(/^oldest/i, 17.61);
  const tRight = w(/^right\.$/i, 23.12);
  const tFacts = w(/^facts/i, 24.25), tSources = w(/^sources/i, 26.36), tCheck = w(/^check/i, 27.82);

  // ---- ground (bookends 01): night bg + lamp glow, only the plate's lower band, petals in the far margins
  K.bg({ glow: 0.3, glowX: 960, glowY: 470 });
  if (K.img && K.img.plate) K.plate('plate', t, { zoom: true, shade: 0.5, mask: [640, 840] });
  K.petals(t, { n: 5, avoid: [[160, 140, 1760, 900]] });

  // ---- heading (replaces the small eyebrow): gold, centred above the desk
  K.rise(t, 0, () => K.title('Keep this', 960, 320, { size: 56, align: 'center' }), 12, 0.7);

  // ---- the desk, tidy, lamp-lit
  const TALL = { x: M.DESK.x, y: 390, w: M.DESK.w, h: 400 };   // rows at 484 / 590 / 696
  const d = M.desk(t, TALL, { lamp: 1, grooves: 0.5 });

  const LEAD = { font: 'ui', size: 40, weight: 700, color: C.head };
  const REST = { font: 'read', size: 32, color: C.body };
  const TAG = 26;                                    // tag pill text size
  const ROWS = [
    { tile: 'next token', at: k1, lead: 'It guesses the next token, over and over.', tag: ['temperature', k1 + 0.45, 'gold'],
      rest: [['pieces, not letters;', tPieces], [' limits and prices count them', tLimits]] },
    { tile: 'the desk', at: k2, lead: 'It only sees its desk: the context window.',
      rest: [['re-sent every turn;', tResent], [' old parts fall off', tOldest]] },
    { tile: 'check it', at: k3, lead: "Sounding right isn't being right.", tag: ['hallucination', tRight],
      rest: [['facts on the desk,', tFacts], [' sources,', tSources], [' check specifics', tCheck]] },
  ];

  // ---- measure once, centre the whole block (tile column + gap + text column) on the desk
  const GAP = 44, TAGGAP = 22;
  const tileCol = Math.max(...ROWS.map((r) => M.tileW(r.tile)));
  const tagW = (s) => K.measure(s, { font: 'ui', size: TAG, weight: 600 }) + TAG * 1.6;
  const textW = Math.max(...ROWS.map((r) => Math.max(
    K.measure(r.lead, LEAD) + (r.tag ? TAGGAP + tagW(r.tag[0]) : 0),
    r.rest.reduce((a, [s]) => a + K.measure(s, REST), 0))));
  const blockW = tileCol + GAP + textW;
  const BX = Math.max(d.x0, Math.round(d.x + d.w / 2 - blockW / 2));
  const TX = BX + tileCol + GAP;

  const restore = K.io(t, tCheck + 0.7, 0.8);        // all rows back to full on the last word, before the hold

  ROWS.forEach((r, i) => {
    const y = d.rowY(i);
    const tw = M.tileW(r.tile);
    const x2 = BX + tw / 2;
    // the tile slides in along its own row lane (empty until now), from the right, with a slight arc
    // so it never crosses the row above; lands on the cue
    const t0 = r.at - 0.35, dur = 0.55;
    const u = K.seg(t, t0, t0 + dur);
    if (u <= 0) return;
    const glow = 0.35 + 0.3 * (K.io(t, t0 + dur - 0.1, 0.25) - K.io(t, t0 + dur + 0.6, 0.9));
    if (u < 1) {
      M.fly(r.tile, x2 + 640, y, x2, y, u, { bend: -40, trail: 0.6, alpha: K.io(t, t0, 0.2), spin: -0.03 });
    } else {
      M.tile(r.tile, x2, y, { tone: 'hot', glow });
    }

    // the words: gold lead above the row line, cream second line under it; earlier rows ease back while a new row leads
    const next = ROWS[i + 1];
    const dim = next ? 0.3 * K.io(t, next.at - 0.2, 0.6) * (1 - restore) : 0;
    const LY = y - 8, RY = y + 36;
    K.layer(1 - dim, () => {
      K.rise(t, t0 + dur - 0.05, () => K.text(r.lead, TX, LY, LEAD), 14);   // once the tile has passed
      if (r.tag) {
        const lw = K.measure(r.lead, LEAD), tg = tagW(r.tag[0]);
        K.rise(t, r.tag[1] - 0.1, () => K.pill(r.tag[0], TX + lw + TAGGAP + tg / 2, LY - 14,
          r.tag[2] === 'gold' ? { size: TAG, stroke: C.gold, color: C.head, glow: 0.25 }
                              : { size: TAG, stroke: C.accent, color: C.strong }), 10);
      }
      let x = TX;
      r.rest.forEach(([s, at]) => {
        const xx = x;
        K.rise(t, at - 0.1, () => K.text(s, xx, RY, REST), 10);
        x += K.measure(s, REST);
      });
    });
  });
});
