// 12 — The four meters: input, cache write, cache read, output (the usage fields), on the warm desk.
SCENE('12', (t, S) => {
  K.bg();
  const C = K.C;
  const cu = {
    input: S.cue('input', 2.3), write: S.cue('write', 5.56), read: S.cue('read', 16.95), output: S.cue('output', 22.63),
    fields: S.cue('fields', 31.45), chat: S.cue('long-chat', 35.06), fills: S.cue('still-fills', 45.59), others: S.cue('others', 50.98),
  };
  const w = (word, n, fb) => S.find(word, n || 0, fb);

  // ------------------------------------------------------------ layout
  const MY = 360, MXS = [330, 735, 1190, 1610], R = 110;          // meters (wall)
  const FY = MY + 130;                                            // usage field row (own baseline)
  const D0 = M.desk({ w: 1120, h: 420 }, { cx: 780, cy: 610 });    // 11's exit desk
  const D1 = M.desk({ w: 900, h: 220 }, { cx: 960, cy: 735 });     // the warm desk, lower and smaller
  const kd = K.io(t, 0, M.motion.grow);
  const D = M.lerpDesk(D0, D1, kd);
  const onDesk = K.io(t, 0.25, 0.5);                               // papers/ruler settle once the desk has landed
  const meters = [
    { label: 'fresh input · full price', field: 'input_tokens', tags: ['1×'], at: cu.input },
    { label: 'cache write', field: 'cache_creation_input_tokens', tags: ['1.25× · 5 min', '2× · 1 h'], at: cu.write },
    { label: 'cache read', field: 'cache_read_input_tokens', tags: ['≤ 0.1×'], at: cu.read },
    { label: 'output (incl. thinking)', field: 'output_tokens', tags: ['≈ 5×'], at: cu.output },
  ];
  // long chat: four turns, each re-sends the whole desk
  const turns = [w('long', 0, cu.chat + 0.3), w('turn', 0, cu.chat + 2.4), w('word', 0, cu.chat + 4.4), w('again', 0, cu.chat + 6.4)];
  const pulse = turns.reduce((m, tt) => Math.max(m, t < tt ? 0 : Math.exp(-(t - tt) / 0.45)), 0);
  const turnsDone = turns.reduce((n, tt, i) => n + K.io(t, tt, 0.6), 0);

  // needle = price relative to input (1× = .18, 5× = .9)
  const tQuarter = w('quarter', 0, cu.write + 7.7), tDouble = w('double', 0, cu.write + 9.6);
  const tFive = w(/^five$/i, 1, cu.output + 6.4);
  const needle = [
    0.18 * K.io(t, cu.input + 0.3, 0.9) + 0.07 * turnsDone,            // each turn re-sends more: the bill steps up

    0.225 * K.io(t, tQuarter, 0.7) + (0.36 - 0.225) * K.io(t, tDouble, 0.7),
    0.018 * K.io(t, cu.read + 0.6, 0.7) + 0.05 * turnsDone,
    0.9 * K.io(t, cu.output + 0.5, 1.4, 'back'),
  ];
  const tagAt = [[cu.input + 0.6], [tQuarter, tDouble], [w('tenth', 0, cu.read + 3.3)], [tFive]];

  // ------------------------------------------------------------ meters on the wall
  const appear = (i) => K.stagger(t, 0.9, i, 0.2, 0.6);
  meters.forEach((m, i) => {
    const on = K.io(t, m.at, 0.6);
    const tick = i < 3 ? pulse : 0;
    const glow = 0.6 * on * (1 - K.io(t, m.at + 2.5, 1)) + 0.8 * tick + (i === 3 ? 0.5 * K.env(t, cu.output + 1.5, cu.output + 7.5, 0.8) : 0);
    M.meter(t, MXS[i], MY, needle[i] + 0.03 * tick, { r: R, lit: 0.25 + 0.75 * on, glow, alpha: appear(i) });
    K.text(m.label, MXS[i], MY + 82, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: on });
    // tags (price vs input)
    const ws = m.tags.map((s) => K.measure(s, { font: 'mono', size: 26, weight: 600 }) + 26 * 1.6);
    const tot = ws.reduce((a, b) => a + b, 0) + 12 * (ws.length - 1);
    let x = MXS[i] - tot / 2;
    m.tags.forEach((s, j) => {
      const k = K.io(t, tagAt[i][j], 0.5);
      if (k > 0) K.pill(s, x + ws[j] / 2, MY - R - 58 + (1 - k) * 8, { size: 26, font: 'mono', color: C.head, stroke: K.rgba(C.head, 0.5), alpha: k });
      x += ws[j] + 12;
    });
  });
  K.layer(K.io(t, tQuarter - 0.6, 0.6), () => M.dated('Claude API · Oct 2026', 88, 150));

  // ------------------------------------------------------------ the desk
  const st = M.stage(t, {
    desk: D,
    deskGlow: 0.55 + 0.4 * pulse,
    wash: pulse > 0.01 ? { color: C.head, a: 0.14 * pulse } : undefined,
    clerk: { s: K.lerp(1, 0.8, kd), glow: K.env(t, cu.output + 0.2, cu.output + 7, 0.6) },
    lamp: { s: K.lerp(1.3, 1, kd), y: K.lerp(D0.y0 - 34 - 52 - 44 - 38 * 1.3, 512, kd), cordTop: K.lerp(D0.y0 - 34 - 52 - 44 - 38 * 1.3 - 60, FY - 10, kd) },  // cord tucks under the usage strip
    ruler: false,
  });
  // usage frame (code window strip) around the four field names
  const fk = K.io(t, cu.fields, 0.7);
  if (fk > 0) {
    K.layer(fk, () => {
      K.card(92, FY - 34, 1736, 50, { r: 14, fill: C.code || C.page, stroke: C.head, glow: 0.35, shadow: false });
      K.text('usage', 108, FY, { font: 'mono', size: 26, weight: 600, color: C.head });
    });
  }
  meters.forEach((m, i) => {
    const on = K.io(t, m.at + 0.3, 0.6);
    const col = M.mixHex(C.soft, C.head, fk);
    K.text(m.field, MXS[i], FY, { font: 'mono', size: 26, weight: 600, color: col, align: 'center', alpha: on });
  });

  // cached prefix: four gold-edged papers laid out for reuse
  const P = (u, v) => M.spot(D, u, v);
  const cachedGlow = 0.25 + 0.35 * K.env(t, cu.write + 0.3, cu.write + 3.5, 0.6) + 0.4 * K.env(t, cu.read + 0.3, cu.read + 3.5, 0.6) + 0.3 * pulse
    + 0.4 * K.env(t, cu.fills + 0.4, cu.fills + 4.5, 0.6);
  [0, 0.13, 0.26, 0.39].forEach((u, i) => {
    const p = P(u, 0.32);
    M.paper(p.x, p.y, { w: 96, h: 66, rot: (i % 2 ? 0.03 : -0.025), edge: 0.75, glow: cachedGlow, lines: 2, alpha: onDesk });
  });
  // fresh input paper lands at input
  {
    const p = P(0.55, 0.32), l = M.land(t, cu.input, p.x, p.y, p.x, D.y0 - 140);
    if (t >= cu.input) M.paper(l.x, l.y, { w: 96, h: 66, alpha: l.a, lines: 2, edge: 0.75 * K.io(t, cu.chat - 0.5, 0.8) });
  }
  // the clerk writes (output, thinking included)
  M.write(t, 1150, 662, { t0: cu.output + 0.6, n: 16, perRow: 8, cell: 16, gap: 6, step: 0.35 });
  // each new turn: a small message paper lands
  turns.forEach((tt, i) => {
    const p = P(0.5 + i * 0.12, 0.86), l = M.land(t, tt, p.x, p.y, p.x, p.y + 60, 0.5);
    if (t >= tt) M.paper(l.x, l.y, { w: 84, h: 42, kind: 'msg', lines: 1, alpha: l.a });
  });
  // ruler: grows with input, output and each turn; the cached part keeps its size
  const fill = 0.3 + 0.05 * K.io(t, cu.input, 0.6) + 0.06 * K.io(t, cu.output + 1, 3) + 0.075 * turnsDone;
  const rl = M.ruler(t, D, { fill, alpha: onDesk });
  const sk = K.io(t, cu.fills + 0.2, 0.6);
  if (sk > 0) {
    const cellW = 20, nC = Math.round(0.3 * rl.n), x1 = rl.xa + nC * cellW - 6;
    K.layer(sk, () => {
      K.card(rl.xa - 6, rl.y - 13, x1 - rl.xa + 12, 26, { r: 6, fill: 'rgba(0,0,0,0)', stroke: C.head, lw: 2.5, shadow: false, glow: 0.5 });
      K.line((rl.xa + x1) / 2, P(0, 0.32).y + 40, (rl.xa + x1) / 2, rl.y - 16, { color: K.rgba(C.head, 0.7), w: 2, dash: [5, 6], k: K.io(t, cu.fills + 0.3, 0.6) });
    });
    const pk = K.io(t, w('cheaper', 0, cu.fills + 1.4), 0.5);
    K.layer(pk, () => {
      K.pill('cheaper, not smaller', 1636, 790, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.55), fill: C.page });
    });
  }

  // ------------------------------------------------------------ the long chat (left)
  const ck = K.io(t, cu.chat - 0.2, 0.6);
  if (ck > 0) {
    K.layer(ck, () => {
      const x0 = 96, y0 = 548, cw = 360, ch = 236;
      K.card(x0, y0, cw, ch, { r: 20, fill: K.rgba(C.tile, 0.92), stroke: K.mixColor(C.line2, C.head, 0.5 * pulse + 0.2) });
      K.icon('chat', x0 + 34, y0 + 32, 30, { color: C.soft, w: 2 });
      K.text('a long chat', x0 + 62, y0 + 41, { font: 'ui', weight: 600, size: 26, color: C.soft });
      K.line(x0 + 16, y0 + 62, x0 + cw - 16, y0 + 62, { color: C.line2, w: 1.5 });
      const g = K.ctx();
      g.save(); K.rr(x0 + 4, y0 + 64, cw - 8, ch - 70, 16); g.clip();
      const words = ['ok', 'and?', 'yes', 'go'];
      const rowH = 80, scroll = Math.max(0, turnsDone - 2) * rowH;
      turns.forEach((tt, i) => {
        const k = K.io(t, tt, 0.4, 'out');
        if (k <= 0) return;
        const yy = y0 + 76 + i * rowH - scroll;
        K.layer(k, () => {
          const bw = K.measure(words[i], { font: 'ui', size: 26, weight: 600 }) + 36;
          K.card(x0 + cw - 22 - bw, yy, bw, 40, { r: 16, fill: K.rgba(C.head, 0.22), stroke: K.rgba(C.head, 0.6), shadow: false });
          K.text(words[i], x0 + cw - 22 - bw / 2, yy + 29, { font: 'ui', size: 26, weight: 600, color: C.strong, align: 'center' });
          const rk = K.io(t, tt + 0.7, 0.4);
          K.layer(rk, () => {
            K.card(x0 + 22, yy + 46, 190, 28, { r: 12, fill: K.rgba(C.paper, 0.85), stroke: false, shadow: false });
            K.line(x0 + 38, yy + 60, x0 + 170, yy + 60, { color: '#B9AD98', w: 3 });
          });
        });
      });
      g.restore();
      // re-send arrow to the desk on each turn
      K.arrow(x0 + cw + 8, y0 + 120, D.x0 - 2, D.cy - 20, { k: 1, color: K.rgba(C.head, 0.25 + 0.6 * pulse), w: 2.5, dash: [8, 7], bend: -0.15 });
    });
    const capK = K.io(t, w('cheap', 0, cu.chat + 7.7), 0.6);
    K.layer(capK, () => {
      K.icon('clock', 112, 812, 28, { color: C.head, w: 2 });
      K.text('cheap only while warm', 136, 821, { font: 'ui', weight: 600, size: 26, color: C.head });
    });
  }

  // ------------------------------------------------------------ others
  const oth = [
    ['OpenAI · automatic', w('OpenAI', 0, cu.others)],
    ['Google · automatic', w('Google', 0, cu.others + 1.2)],
    ['Claude API · one setting', w('switch', 0, cu.others + 6.5)],
  ];
  oth.forEach(([s, at], i) => {
    const k = K.io(t, at, 0.5);
    if (k > 0) K.pill(s, 1636 + (1 - k) * 20, 578 + i * 66, { size: 26, color: i === 2 ? C.head : C.strong, stroke: i === 2 ? K.rgba(C.head, 0.55) : C.line2, alpha: k });
  });
  const shk = K.io(t, w('meters', 1, cu.others + 7.9), 0.6);
  if (shk > 0) M.shelf('The Network', 1840, 880, { k: shk });
});
