/* 20 — Keep this
   Part 1: the whole workspace seen from far away (rooms on top, the studio at left, the desk under its lamp,
   a cloud office at right, the four meters faint). Three dated arrows run out to the right edge, each lighting
   the part of the drawing it comes from, then a dashed fourth to a question mark. Safe-to-ignore pills float
   up and fade. Part 2 (keep-1): the desk shrinks into an emblem at top centre and the end card builds. */
SCENE('20', (t, S) => {
  const C = K.C, P = M.palette;
  const w = (re, after, fb) => {
    for (let i = 0; i < 40; i++) { const v = S.find(re, i, NaN); if (isNaN(v)) break; if (v >= after - 0.01) return v; }
    return fb;
  };
  const cFew = S.cue('fewer-modes', 5.3), cOwn = S.cue('own-computers', 11.2), cCur = S.cue('curate', 14.9);
  const cIgn = S.cue('ignore', 22.4), cK1 = S.cue('keep-1', 29.1), cK2 = S.cue('keep-2', 42.5), cK3 = S.cue('keep-3', 54.9);
  const tHead = w(/^heading/i, 0, 1.6), tBeyond = w(/^Beyond/i, cCur, 18.9);
  const tVer = w(/^version/i, cIgn, 24.4), tLead = w(/^leaderboards/i, cIgn, 25.5), tMath = w(/^maths/i, cIgn, 26.9);

  // ------------------------------------------------------------ ground: night, then the end-card plate
  const endK = K.io(t, cK1 - 0.2, 1.2);
  K.bg();
  if (endK > 0) K.layer(endK, () => K.plate('plate', t, { shade: 0.6, mask: [680, 860] }));

  // part-1 visibility: dims for the ignore beat, gone at keep-1
  // the dim holds through keep-1 (part 1 never brightens again); the panel and its pills leave together
  const dimK = K.io(t, cIgn - 0.1, 0.7);
  const panelOut = 1 - K.io(t, cK1 - 0.3, 0.6);
  const ignK = dimK * panelOut;
  const p1 = (1 - 0.85 * dimK) * (1 - K.io(t, cK1 - 0.2, 0.7));
  const fewK = K.io(t, cFew, 0.8), ownK = K.io(t, cOwn, 0.7), curK = K.io(t, cCur, 0.7);
  // each highlight stays on, softer, once the next one is spoken
  const hiFew = fewK * (1 - 0.55 * K.io(t, cOwn, 0.6));
  const hiOwn = ownK * (1 - 0.55 * K.io(t, cCur, 0.6));
  const hiCur = curK * (1 - 0.4 * K.io(t, cIgn, 0.6));

  // desk position: part-1 spot -> emblem at top centre
  const embK = K.io(t, cK1 - 0.1, 1.0);
  const dX = K.lerp(600, 960, embK), dY = K.lerp(720, 214, embK), dS = K.lerp(0.62, 0.27, embK);

  if (p1 > 0.001) K.layer(p1, () => {
    // ---- rooms: Chat | Cowork | Code (scene-13 order); Chat and Cowork merge into one
    const RY = 150, RH = 250;
    // the arrow leaves from the Code card's edge, so the whole row of rooms lights up together
    if (hiFew > 0) K.glow(780, RY + RH / 2, 200, C.head, 0.12 * hiFew);
    M.room(t, 660, RY, 240, RH, { label: 'Code', lit: 0.55 + 0.35 * hiFew });
    if (fewK < 1) K.layer(1 - fewK, () => {
      M.room(t, 140 + 130 * fewK, RY, 240, RH, { label: 'Chat', lit: 0.55 });
      M.room(t, 400 - 130 * fewK, RY, 240, RH, { label: 'Cowork', lit: 0.55 });
    });
    if (fewK > 0) K.layer(fewK, () => {
      if (hiFew > 0) K.glow(390, RY + RH / 2, 330, C.head, 0.16 * hiFew);
      M.room(t, 140, RY, 500, RH, { label: 'Chat + Cowork', lit: 0.55 + 0.45 * hiFew });
    });

    // ---- the studio (left), small and still
    K.at(150, 470, 0.55, 0, () => M.studio(t, 0, 0, { show: 1, still: true, label: ' ', seed: 3 }));
    M.phone(t, 262, 590, 470, 700, { k: 1, alpha: 0.7, bend: -12 });

    // ---- the four meters, faint
    [160, 248, 336, 424].forEach((x, i) => K.layer(0.38, () => K.at(x, 790, 0.28, 0, () => M.meter(t, 0, 0, [0.55, 0.35, 0.8, 0.25][i], { lit: 0.5 }))));

    // ---- the cloud office (right): a building whose window stays lit
    const OX = 860, OY = 430, OW = 200, OH = 230;
    if (hiOwn > 0) K.glow(OX + OW / 2, OY + OH / 2, 230, C.head, 0.2 * hiOwn);
    K.card(OX, OY, OW, OH, { r: 16, fill: K.rgba(C.tile, 0.92), stroke: K.mixColor(C.line2, C.head, 0.3 + 0.7 * hiOwn), lw: 1.5 + hiOwn, glow: 0.4 * hiOwn });
    K.icon('cloud', OX + OW / 2, OY + 46, 56, { color: K.mixColor(C.soft, C.head, hiOwn), w: 2.5 });
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([c, r], i) => {
      const wx = OX + 48 + c * 70, wy = OY + 84 + r * 52, lit = i === 1 ? 0.55 + 0.45 * ownK : 0.25;
      K.card(wx, wy, 34, 36, { r: 4, fill: K.rgba(C.head, lit * (0.6 + 0.08 * K.wave(t, 0.7, 1, i))), stroke: false, shadow: false });
    });
    K.text('cloud', OX + OW / 2, OY + OH - 22, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center' });

    // ---- the desk under its lamp, with a summary page on it
    if (hiCur > 0) K.glow(dX, dY - 10, 230, C.head, 0.18 * hiCur);
    M.mini(t, dX, dY, dS, {});
    K.at(dX, dY, dS, 0, () => {
      const D0 = M.desk('y2021', { cx: 0, cy: 0 });
      const p = M.spot(D0, 0.6, 0.5);
      M.paper(p.x, p.y, { kind: 'summary', w: 120, h: 76, rot: -0.04, edge: hiCur, glow: hiCur });
    });
  });

  // ------------------------------------------------------------ the arrows to the right edge (outside the drawing)
  K.layer(p1, () => {
    K.layer(K.io(t, tHead, 0.6), () => K.eyebrow('what the companies did in 2026', 1110, 178, { size: 22, color: C.gold }));
    const AX0 = 1100, AX1 = 1250, LX = 1272;
    const rows = [
      { y: 275, at: cFew, from: [910, 275], lab: 'fewer modes, one agent', date: 'Sep 2026', hi: hiFew },
      { y: 480, at: cOwn, from: [1070, 520], lab: 'agents on their own computers', date: 'Sep 2026', hi: hiOwn },
      { y: 680, at: cCur, from: [745, 700], lab: 'curate the desk', date: '2026', hi: hiCur },
    ];
    rows.forEach((r) => {
      const ak = K.io(t, r.at, 0.7), lk = K.io(t, r.at + 0.3, 0.5, 'out');
      if (ak <= 0) return;
      K.arrow(r.from[0], r.from[1], AX1, r.y, { k: ak, color: K.mixColor(C.soft, C.head, 0.4 + 0.6 * r.hi), w: 3, bend: r.from[1] === r.y ? 0 : (r.from[1] > r.y ? -20 : 20) });
      K.layer(lk, () => {
        K.text(r.lab, LX + (1 - lk) * 16, r.y + 11, { font: 'ui', weight: 600, size: 32, color: K.mixColor(C.strong, C.head, 0.6 * r.hi) });
        M.dated(r.date, LX + (1 - lk) * 16, r.y + 54);
      });
    });
    // dashed fourth arrow: beyond that
    const qk = K.io(t, tBeyond, 0.7), qlk = K.io(t, tBeyond + 0.3, 0.5, 'out');
    if (qk > 0) {
      K.arrow(745, 770, AX1, 830, { k: qk, color: K.rgba(C.soft, 0.8), w: 3, dash: [9, 9], bend: -18 });
      K.layer(qlk, () => {
        K.icon('question', LX + 22, 828, 44, { color: C.soft, w: 2.5 });
        K.text('beyond that: nobody knows yet', LX + 60, 839, { font: 'read', size: 30, italic: true, color: C.body });
      });
    }
  });

  // ------------------------------------------------------------ safe to ignore: grey pills float up and fade
  if (ignK > 0) {
    K.layer(ignK, () => {
      K.card(330, 380, 1260, 270, { r: 28, fill: K.rgba(C.page, 0.88), stroke: K.rgba(C.line2, 0.8) });
      K.eyebrow('safe to ignore for now', 960, 440, { size: 22, color: C.soft, align: 'center' });
    });
    [{ s: 'version numbers', x: 600, at: tVer }, { s: 'leaderboards', x: 960, at: tLead }, { s: 'the maths inside', x: 1320, at: tMath }].forEach((p, i) => {
      const a = K.io(t, p.at - 0.1, 0.5, 'out');
      if (a <= 0) return;
      const rise = K.seg(t, p.at, cK1) * 50;
      // pills stay at full strength until keep-1 and leave together with the panel
      const fade = panelOut;
      K.pill(p.s, p.x, 575 - rise + (1 - a) * 20, { size: 32, color: C.soft, fill: K.rgba(C.tile, 0.95), stroke: K.rgba(C.line2, 1), alpha: a * fade });
    });
  }

  // ------------------------------------------------------------ end card
  if (embK > 0) {
    // emblem: the desk continues from part 1 into the top centre; the lamp glows gently
    const gl = 0.12 + 0.05 * K.wave(t, 0.5, 1);
    K.layer(1 - p1, () => {
      K.glow(960, 150, 150, C.head, gl * embK);
      M.mini(t, dX, dY, dS, {});
    });
    K.layer(K.io(t, cK1 + 0.8, 0.6), () => K.title('Keep this', 960, 318, { size: 60, align: 'center' }));
    const cards = [
      { y: 348, at: cK1 + 1.2, n: '1', i: 0 },
      { y: 514, at: cK2, n: '2', i: 1 },
      { y: 680, at: cK3, n: '3', i: 2 },
    ];
    const keep = [
      ['The model only knows what\'s on its desk right now.', 'Memory and instruction files are text put back on the desk, and a fuller desk is a worse desk.'],
      ['Making pictures is mostly a hand-off.', 'It reads many kinds of input, but pictures, video and music usually come from a separate model, most often diffusion.'],
      ['Same model, many rooms, four meters.', 'Where you meet it changes what it can touch and what it costs, and a warm cache makes repeats cheap.'],
    ];
    cards.forEach((c) => {
      const k = K.io(t, c.at, 0.7, 'out');
      if (k <= 0) return;
      const [lead, rest] = keep[c.i];
      const y = c.y + (1 - k) * 18;
      K.layer(k, () => {
        K.card(200, y, 1520, 152, { r: 22, fill: K.rgba(C.tile, 0.92), stroke: K.rgba(C.head, 0.35) });
        const nl = K.wrap(rest, 1360, { font: 'read', size: 30 }).length, oy = nl < 2 ? 19 : 0;
        K.text(c.n, 262, y + 96, { font: 'head', weight: 700, size: 56, color: C.head, align: 'center' });
        K.text(lead, 320, y + 54 + oy, { font: 'ui', weight: 700, size: 34, color: C.strong });
        K.para(rest, 320, y + 96 + oy, 1360, { font: 'read', size: 30, lh: 38, color: C.body });
      });
    });
    K.layer(endK, () => K.petals(t, { n: 4, avoid: [[120, 130, 1800, 860]] }));
  }
});
