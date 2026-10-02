/* 09 — How it "remembers": the clerk keeps nothing; five ways paper comes back to the desk.
   Layout: the desk (standard-height, 1060 wide) sits left at cx 680; the five sources are a numbered column of
   cards on the right (x 1340–1840). Each source's paper flies from its card onto its own spot on the desk.
   At [[cost]] every card gets its price: a gold square (desk space) and/or a terracotta terminal (tool call). */
SCENE('09', (t, S) => {
  const C = K.C, g = K.ctx();
  K.bg();

  // ---------------------------------------------------------------- times (cues + spoken words)
  const cue = (n, f) => S.cue(n, f);
  const T = {
    five: cue('five', 6.03), convo: cue('convo', 8.5), profile: cue('profile', 15.24), search: cue('search', 27.75),
    external: cue('external', 34.68), rag: cue('rag', 46.17), cost: cue('cost', 64.48),
  };
  const W = {
    resends: S.find('re-sends', 0, 12.0), turn: S.find('turn', 0, 14.3) - 0.5,
    profileW: S.find('profile', 0, 18.9), writes: S.find('writes', 0, 19.5),
    claudes: S.find('Claude', 0, 21.2), paid: S.find('paid', 0, 26.2),
    searching: S.find('searching', 0, 28.2), see: S.find('searched', 0, 32.1),
    memfiles: S.find('Memory', 2, 38.7), notion: S.find('Notion', 0, 42.9), connector: S.find('connector', 0, 44.7),
    three: S.find('three', 1, 51.9), four: S.find('four', 1, 52.3), fetch: S.find('Fetch', 0, 53.5),
    putdesk: S.find('desk', 1, 55.9), answer: S.find('answer', 0, 56.8),
    vector: S.find('Vector', 0, 57.9), files: S.find('coding', 0, 60.3),
    tool: S.find('tool', 3, 65.6), space: S.find('space', 0, 67.1), both: S.find('both', 0, 68.3),
    own: S.find('Memory', 3, 69.5),
  };

  // ---------------------------------------------------------------- the workspace (left)
  const D = M.desk({ w: 1060, h: 380 }, { cx: 680, cy: 640 });
  const FLY = 0.8;
  const landed = (t0) => K.io(t, t0 + FLY * 0.7, 0.5);
  const rulerFill = 0.12 * landed(T.convo + 0.5) + 0.04 * landed(W.turn) + 0.1 * landed(W.profileW)
    + 0.08 * landed(W.searching) + 0.08 * landed(W.memfiles) + 0.08 * landed(W.notion)
    + 0.1 * landed(W.fetch + 0.3) + 0.06 * K.io(t, W.answer, 3.2, 'lin');
  const costPulse = K.env(t, W.space, W.space + 1.6, 0.4);
  M.stage(t, {
    desk: D,
    lamp: { s: 1.3, cordTop: 100 },
    clerk: {},
    ruler: { fill: rulerFill },
    deskGlow: 0.6 * costPulse,
  });

  // header
  K.layer(K.io(t, -0.2, 0.8), () => K.text('The clerk keeps nothing', 120, 196, { font: 'head', size: 40, color: C.head }));

  // ---------------------------------------------------------------- source cards (right column)
  const RX = 1340, RW = 500, RH = 118, RY = [208, 350, 492, 634, 776];
  const ROWS = [
    { label: 'conversation', at: T.convo, detail: 're-sent every turn', dAt: W.resends },
    { label: 'memory it keeps', at: T.profile, detail: 'Claude · ChatGPT · Gemini', dAt: W.claudes },
    { label: 'past chats', at: T.search, detail: 'searched with a tool', dAt: W.searching },
    { label: 'files · Notion · Drive', at: T.external, detail: 'reached by tool calls', dAt: W.memfiles - 0.6 },
    { label: 'RAG', at: T.rag, detail: 'fetch → desk → answer', dAt: W.fetch },
  ];
  const nextAt = (i) => (i < 4 ? ROWS[i + 1].at : T.cost);
  const tools = [0, 0, 1, 1, 1]; // which sources need a tool call
  ROWS.forEach((r, i) => {
    const y = RY[i], x0 = RX, top = y - RH / 2;
    const slotK = K.io(t, T.five + i * 0.15, 0.5);
    if (slotK <= 0) return;
    const fillK = K.io(t, r.at, 0.6);
    let active = K.io(t, r.at, 0.5) * (1 - K.io(t, nextAt(i) - 0.2, 0.5));
    if (i === 2) active = Math.max(active, K.env(t, W.three, W.fetch, 0.3));
    if (i === 3) active = Math.max(active, K.env(t, W.four, W.fetch, 0.3));
    if (i >= 2) active = Math.max(active, 0.8 * K.env(t, W.both, W.both + 1.2, 0.3));
    K.layer(slotK, () => {
      // empty slot: dashed outline
      if (fillK < 1) {
        K.layer(1 - fillK, () => {
          g.save(); g.setLineDash([8, 8]); g.lineWidth = 2; g.strokeStyle = K.rgba(C.line2, 0.9);
          K.rr(x0, top, RW, RH, 18); g.stroke(); g.restore();
        });
      }
      if (fillK > 0) K.layer(fillK, () => K.card(x0, top, RW, RH, {
        r: 18, fill: K.rgba(C.tile, 0.92), stroke: active > 0.05 ? K.rgba(C.head, 0.35 + 0.5 * active) : C.line2,
        glow: 0.25 * active, shadow: true,
      }));
      // number badge
      g.save(); g.beginPath(); g.arc(x0 + 46, y, 25, 0, Math.PI * 2); g.fillStyle = C.page; g.fill();
      g.lineWidth = 2; g.strokeStyle = K.rgba(C.head, 0.45 + 0.4 * fillK); g.stroke(); g.restore();
      K.text(String(i + 1), x0 + 46, y + 9, { font: 'mono', size: 26, weight: 600, color: C.head, align: 'center', alpha: 0.6 + 0.4 * fillK });
      // label + detail
      K.layer(fillK, () => K.text(r.label, x0 + 90, y - 8, { font: 'ui', size: 30, weight: 600, color: C.strong }));
      if (i < 4) {
        K.layer(K.io(t, r.dAt, 0.5), () => K.text(r.detail, x0 + 90, y + 32, { font: 'ui', size: 26, weight: 500, color: C.soft }));
      } else {
        // RAG detail: the flow, then the two ways to fetch
        const swap = K.io(t, W.vector, 0.5);
        K.layer(K.io(t, r.dAt, 0.5) * (1 - swap), () => K.text(r.detail, x0 + 90, y + 32, { font: 'ui', size: 26, weight: 500, color: C.soft }));
        K.layer(swap, () => {
          const w1 = K.text('vector search', x0 + 90, y + 32, { font: 'ui', size: 26, weight: 500, color: C.soft });
          K.layer(K.io(t, W.files, 0.5), () => K.text(' · file tools', x0 + 90 + w1, y + 32, { font: 'ui', size: 26, weight: 500, color: C.soft }));
        });
      }
      // price tags (cost beat): gold square = desk space, terracotta terminal = tool call
      const gx = x0 + RW - 34;
      const tk = tools[i] ? K.io(t, W.tool + (i - 2) * 0.15, 0.4) : 0;
      const dk = K.io(t, W.space + i * 0.1, 0.4);
      if (tk > 0) K.layer(tk, () => K.icon('terminal', gx, y + 22, 30, { color: C.accent, w: 2.5 }));
      if (dk > 0) K.layer(dk, () => K.card(gx - 12, y - 36 - (1 - dk) * 6, 24, 24, { r: 5, fill: C.head, stroke: false, shadow: false }));
    });
  });

  // ---------------------------------------------------------------- what lands on the desk
  const from = (i) => ({ x: RX + 20, y: RY[i] });
  const fly = (i, t0, x, y, draw) => {
    if (t < t0) return;
    const f = from(i), p = M.land(t, t0, x, y, f.x, f.y, FLY);
    draw(p.x, p.y, p.a, p.k);
  };

  // 1 · conversation: a stack of messages, re-sent every turn
  const pulse = (a) => K.env(t, a, a + 0.9, 0.35);
  const reGlow = Math.max(pulse(W.resends), pulse(W.turn + 0.2));
  const MSG = [[282, 520, -0.02], [292, 585, 0.02], [276, 650, -0.015], [286, 715, 0.015]];
  MSG.forEach((m, j) => {
    const t0 = j < 3 ? T.convo + 0.4 + j * 0.35 : W.turn;
    fly(0, t0, m[0], m[1], (x, y, a) => M.paper(x, y, { kind: 'msg', w: 160, h: 50, lines: 1, rot: m[2], alpha: a, glow: reGlow }));
  });

  // 2 · memory it keeps: a profile card the clerk edits itself
  const PX = 470, PY = 600;
  fly(1, W.profileW - 0.4, PX, PY, (x, y, a) => {
    M.paper(x, y, { kind: 'summary', w: 180, h: 170, title: 'about you', lines: 4, alpha: a, glow: 0.5 * K.env(t, W.writes, W.writes + 2.2, 0.4) });
  });
  if (t > W.writes) {
    const ek = K.io(t, W.writes, 1.4, 'sine'), lx0 = PX - 90 + 16, lx1 = PX + 90 - 16, ly = PY - 85 + 62 + 16;
    g.save(); g.fillStyle = M.palette.paper; g.fillRect(lx0 - 2, ly - 4, (lx1 - lx0 + 4) * ek, 8); g.restore();
    K.line(lx0, ly, K.lerp(lx0, lx1, ek), ly, { color: C.head, w: 3.5 });
    M.pen(K.lerp(lx0, lx1, ek) + 2, ly + 1, { s: 0.7, alpha: 1 - K.io(t, W.writes + 1.6, 0.5) });
  }
  // dated: free on Claude since March 2026
  K.layer(K.io(t, W.paid, 0.5) * (1 - K.io(t, T.cost - 0.4, 0.5)), () => M.dated('free on Claude · since Mar 2026', 122, 252));

  // 3 · past chats: an old message comes back, and the status line you see in the app
  fly(2, W.searching, 640, 540, (x, y, a) => {
    M.paper(x, y, { kind: 'msg', w: 150, h: 50, lines: 1, alpha: a, dim: 0.35 });
    K.icon('clock', x + 98, y - 20, 28, { color: M.palette.cold, w: 2, alpha: a });
  });
  const sk = K.io(t, W.see - 0.6, 0.5);
  if (sk > 0) K.layer(sk, () => {
    const sx = 640, sy = 745;
    K.card(sx - 190, sy - 26, 380, 52, { r: 14, fill: C.page, stroke: K.rgba(C.accent, 0.7), shadow: false });
    K.icon('terminal', sx - 162, sy, 26, { color: C.accent, w: 2 });
    K.text(K.typed('searched past chats', t, W.see, 24), sx - 136, sy + 9, { font: 'mono', size: 26, weight: 600, color: C.strong });
  });

  // 4 · stores outside the app: a memory file on disk, a Notion page through a connector
  fly(3, W.memfiles, 815, 540, (x, y, a) => M.file(x, y, 100, { ext: 'md', name: 'memory.md', alpha: a }));
  fly(3, W.notion - 0.2, 965, 610, (x, y, a) => M.paper(x, y, { w: 140, h: 100, title: 'Notion', lines: 2, alpha: a }));
  M.phone(t, RX - 4, RY[3], 1037, 618, { k: K.io(t, W.connector, 0.7), pulse: true, bend: -18, alpha: 0.85 * (1 - 0.6 * K.io(t, T.rag, 0.6)) });

  // 5 · RAG: three index cards fetched onto the desk, then the clerk answers
  const IDX = [[1048, 540, -0.1], [1072, 532, 0.0], [1096, 540, 0.1]];
  IDX.forEach((c, j) => {
    fly(4, W.fetch + j * 0.3, c[0], c[1], (x, y, a, k) => M.paper(x, y, { w: 104, h: 70, lines: 2, rot: c[2] * k, alpha: a, edge: 0.8 * K.env(t, W.fetch, W.answer + 0.4, 0.3) }));
  });
  M.write(t, 950, 728, { t0: W.answer, n: 8, step: 0.35, cell: 18, gap: 6 });

  // ---------------------------------------------------------------- the price: legend + shelf
  K.layer(K.io(t, W.tool, 0.5), () => {
    K.icon('terminal', 136, 252, 30, { color: C.accent, w: 2.5 });
    K.text('tool call', 164, 261, { font: 'ui', size: 26, weight: 600, color: C.strong });
  });
  K.layer(K.io(t, W.space, 0.5), () => {
    K.card(318, 240, 24, 24, { r: 5, fill: C.head, stroke: false, shadow: false });
    K.text('desk space', 354, 261, { font: 'ui', size: 26, weight: 600, color: C.strong });
  });
  M.shelf('The Code', 1840, 888, { k: K.io(t, W.own, 0.6) });
});
