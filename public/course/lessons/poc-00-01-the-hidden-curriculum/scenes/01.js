/* 01 — Nobody handed you the map (title card, noBadge)
   Left column at x 140, inside the painted sky; the tea house keeps the right half.
   The card carries the conclusion before the first word. Then the hidden curriculum's five
   topics rise on their words, the folded map tile (the promise) unfolds on "map", and the
   degree card arrives, its cap tipping on "hard". Every beat is a pure function of t. */
SCENE('01', (t, S) => {
  const C = K.C, X = 140;

  // ground: night bg with the house glow, the plate (slow drift), sparse petals
  K.bg({ glow: 0.5, glowX: 1350, glowY: 520 });
  K.plate('plate', t, { zoom: true, shade: 0.45, drift: 0.008 });
  K.petals(t, { n: 6, seed: 3, alpha: 0.5 });

  // ---- title block: rises under the engine's 0.6 s fade from black (local -1.6 = lesson frame 0),
  // so the whole card, conclusion included, is composed by 0.8 s global: the poster and anyone who
  // leaves after the first seconds see the conclusion, not an empty plate.
  K.layer(K.io(t, -1.6, 0.5, 'out'), () => K.eyebrow('The Missing Map · 00.01 Orientation', X, 220));
  K.rise(t, -1.5, () => K.title('The hidden curriculum', X, 320, { size: 92 }), 16, 0.5);
  const concl = { font: 'read', italic: true, size: 44, color: C.strong };
  K.rise(t, -1.3, () => K.text('A gap in the syllabus, not in you.', X, 400, concl), 16, 0.5);

  // [[not-you]]: the narration reaches "not in you" and a gold stroke draws under it (gold = known, settled)
  const notX = X + K.measure('A gap in the syllabus, ', concl), notW = K.measure('not in you.', concl);
  K.mark(notX - 2, 418, notW + 4, K.io(t, S.find('not', 0, 11.2) - 0.05, 0.7), { color: C.head, w: 5 });

  // [[topics]]: terminals · files · git · keys · hosting, each on its word
  const topics = ['terminals', 'files', 'git', 'keys', 'hosting'];
  M.pillRow(topics, X, 490, { ks: topics.map((w, i) => K.io(t, S.find(w, 0, 4.8 + i * 0.5), 0.5, 'out')) });

  // [[map]]: the folded map tile pops in (the scene's one 'back') and unfolds, left panel then right
  const tm = S.cue('map', 13.8), [mx, my, ms] = M.layout.tile.s01;
  const pop = K.io(t, tm, 0.6, 'back'), fade = K.io(t, tm, 0.35, 'out');
  K.layer(fade, () => K.at(mx, my, 0.55 + 0.45 * pop, 0, () => {
    K.ctx().translate(-mx, -my);
    M.mapTile(mx, my, ms, [], { t, glow: 0.6 * K.io(t, tm + 0.3, 0.8), open: K.io(t, tm + 0.05, 0.85) });
  }));
  // "what each thing is · where it goes", each half on its own words
  const cap = { font: 'ui', size: 30, color: C.body }, capX = mx + ms / 2 + 26, capY = my + 11;
  const half1 = 'what each thing is', w1 = K.measure(half1, cap);
  K.rise(t, S.find('what', 0, 15.6) - 0.05, () => K.text(half1, capX, capY, cap), 12, 0.5);
  K.rise(t, S.find('where', 0, 17.4) - 0.05, () => K.spans([{ s: ' · ', color: C.soft }, { s: 'where it goes' }], capX + w1, capY, cap), 12, 0.5);

  // [[degree]]: the Information Systems card rises; on "hard" the cap tips askew and stays that way.
  // The card itself stays M.degree, untouched: 02 opens on exactly this card at rest (700 x 104 at
  // layout.degree.card) during the crossfade, then flies it to the chip, so its footprint must match.
  // M.degree never said "degree" (the cap carried it alone) and its right half sat empty, so a quiet
  // " degree" (Karla 32, 400, C.soft) follows the name inside it; it fades with the crossfade and the
  // chip keeps the bare name. Drawn only if it fits, in case M.degree is later sized to its label.
  // Tilt 0.3 rad (0.22 was barely visible), 'io': the scene's one 'back' belongs to the map tile.
  const [dx, dy] = M.layout.degree.card;
  const nameW = K.measure('Information Systems', { font: 'ui', size: 32, weight: 600 });
  const tail = ' degree', tailO = { font: 'ui', size: 32, weight: 400, color: C.soft }, tailW = K.measure(tail, tailO);
  K.rise(t, S.cue('degree', 19.6), () => {
    const card = M.degree(dx, dy, { tilt: K.io(t, S.find('hard', 0, 23.7), 0.45) * 0.3 });
    if (card && card.tx + nameW + tailW + 24 <= card.x + card.w) K.text(tail, card.tx + nameW, card.icy + 32 * 0.36, tailO);
  }, 24, 0.6);
});
