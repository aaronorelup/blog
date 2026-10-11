// 12 — The lantern: agents start processes for you
// The agent is a head cook (sparkle tile) who sends helper cooks into the kitchen; every command is a child.
// Then: background tasks (/tasks), cleanup on exit vs a leftover, the glass fence (sandbox), the larger
// Execution Containers fence, the Task Manager Isolation column, and the heading (an agent with its own account).
SCENE('12', (t, S) => {
  K.bg();
  const C = K.C, g = K.ctx();
  const cue = (n, fb) => S.cue(n, fb);
  const cBg = cue('background', 9.22), cFence = cue('fences', 19.39), cMxc = cue('mxc', 37.25);
  const cIso = cue('isolation', 48.55), cHead = cue('heading', 53.85);
  const f = (w, nth, fb) => S.find(w, nth || 0, fb);

  // ---- word times (fallbacks = measured narration)
  const wHead = f('head', 0, 1.2);
  const wEvery = f('Every', 0, 3.18);
  const wDev = f('dev', 0, 6.42);
  const wBelongs = f('belongs', 0, 7.61);
  const wBackground = f('background', 0, 10.74);
  const wSlash = f(/^(slash|\/tasks)/, 0, 13.04);
  const wLists = f('lists', 0, 14.12);
  const wCleans = f('cleans', 0, 16.05);
  const wNot = f('Not', 0, 17.8);
  const wLimiting = f('limiting', 0, 21.59);
  const wTouch = f('touch', 0, 23.73);
  const wAsOf = f('As', 0, 24.8);
  const wCC = f('Claude', 1, 26.1);
  const wMac = f('Mac', 0, 28.01);
  const wLinux = f('Linux', 0, 28.67);
  const wWsl = f(/^W(SL)?2?[,.]?$/i, 0, 29.4);
  const wNative = f('native', 0, 31.39);
  const wCodex = f('Codex', 0, 32.63);
  const wStops = f('stops', 0, 34.66);
  const wGenerally = f('generally', 0, 42.75);
  const wSome = f('Some', 0, 44.78);
  const wOthers = f('others', 0, 46.8);
  const wIsoCol = f('Isolation', 0, 49.44);
  const wFences2 = f('fences', 1, 51.19);
  const wApp = f('app', 0, 52.49);
  const wAgents = f('agents', 2, 55.07);
  const wAccount = f('account', 0, 58.06);

  // ---- layout
  const AG = { x: 420, y: 640, s: 130 };                       // the agent (head cook)
  const KG = { x: 820, y: 660, w: 960, h: 140, n: 4 };          // the right-hand counter
  const cookY = 490, cookS = 96;
  const stX = (i) => KG.x + KG.w / KG.n * (i + 0.5);
  const HATCH = { x: stX(0), y: 236 };
  const FENCE = { x: 830, y: 350, w: 480, h: 292 };            // the sandbox around the two long-running children
  const BIG = { x: 110, y: 330, w: 1700, h: 530 };             // Execution Containers
  const BOARD = { x: 760, y: 250, w: 1060, h: 470 };

  // ---- phase envelopes
  const exitAgent = K.io(t, wCleans, 0.5);                     // the agent exits (Claude Code)
  const backAgent = K.io(t, cFence + 0.05, 0.6);               // back for the fences part
  const agentA = 1 - exitAgent + backAgent * exitAgent;
  const kidsGone = K.io(t, wCleans + 0.45, 0.5);               // cleaned up on exit
  const kidsBack = K.io(t, cFence + 0.25, 0.6);
  const kidsA = 1 - kidsGone + kidsBack * kidsGone;
  const ghostA = K.env(t, wNot, cFence + 0.1, 0.45);            // "not every tool": a leftover stays
  const dimK = K.io(t, cIso, 0.6);                             // kitchen dims under the Task Manager board
  const hf = K.io(t, cHead, 0.6);                              // heading: everything but the agent clears away
  const agMove = K.io(t, cHead + 0.15, 0.9);
  const agX = K.lerp(420, 960, agMove), agY = K.lerp(640, 470, agMove);

  // the three children: node (dev server), git (short), python (long watcher)
  const kids = [
    { st: 0, name: 'node.exe', pid: '26840', at: wEvery + 0.25 },
    { st: 2, name: 'git.exe', pid: '27012', at: wEvery + 1.05, short: true },
    { st: 1, name: 'python.exe', pid: '27355', at: wEvery + 1.85 },
  ];


  // ---- the agent's terminal (top-left), until the fences
  const termA = 1 - K.io(t, wCleans, 0.5);
  if (termA > 0.002) K.layer(termA, () => {
    const r = K.win(100, 140, 640, 330, { title: 'agent', titleSize: 26, kind: 'terminal' });
    K.term(r, t, [
      { at: wEvery + 0.05, cmd: 'npm run dev', cps: 24 },
      { at: wEvery + 0.85, cmd: 'git status', cps: 24 },
      { at: wEvery + 1.65, cmd: 'python watch.py', cps: 24 },
      { at: wSlash, cmd: '/tasks', cps: 14, prompt: '> ' },
      { at: wLists, out: '1  dev server   running', color: C.head },
      { at: wLists + 0.25, out: '2  watch.py     running', color: C.head },
    ], { size: 26, lh: 36, pad: 22, prompt: '$ ' });
  });

  // a large glass fence drawn like M.fence, but with straight segments and arc points (no spline overshoot)
  function bigFence(x, y, w, h, k, lb, lk) {
    if (k <= 0) return;
    const r = 28, col = C.head, pts = [];
    const arc = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
    pts.push(pts[0]);
    g.save(); g.globalAlpha *= K.ease.io(k); K.rr(x, y, w, h, r);
    const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, K.rgba(col, 0.09)); gr.addColorStop(0.5, K.rgba(col, 0.03)); gr.addColorStop(1, K.rgba(col, 0.07));
    g.fillStyle = gr; g.fill(); g.restore();
    K.glow(x + w / 2, y + h / 2, Math.max(w, h) * 0.6, col, 0.05);
    K.path([[x + r, y]].concat(pts), { k, color: col, w: 3, dash: [14, 10], head: false, tension: 0 });
    if (k >= 1) { K.line(x + 24, y + 44, x + 44, y + 24, { color: K.rgba(C.strong, 0.35), w: 3 }); K.line(x + 24, y + 70, x + 70, y + 24, { color: K.rgba(C.strong, 0.18), w: 3 }); }
    if (lk <= 0) return;                                        // the header waits until the border is fully drawn
    const lw = K.measure(lb, M.T.eyebrow) + 36;
    g.save(); g.fillStyle = C.page; K.rr(x + 30, y - 22, lw, 44, 22); g.fill(); g.restore();   // opaque: no dash shows through
    K.card(x + 30, y - 22, lw, 44, { r: 22, fill: C.panel, stroke: col, shadow: false, alpha: lk });
    M.eyebrow(lb, x + 30 + lw / 2, y + 9, { alpha: lk, color: col });
  }

  // ---- kitchen (right): hatch, counter, fences, links, cooks
  K.layer(1 - hf, () => {
    // hatch 5173: the dev server's port
    const hOpen = K.io(t, wDev, 0.5);
    const hState = ghostA > 0.5 ? 'busy' : (hOpen > 0 && (kidsA > 0.5 || ghostA > 0.5) ? 'open' : 'idle');
    K.layer(1 - dimK, () => M.hatch(t, HATCH.x, HATCH.y, { num: '5173', state: hState, k: K.io(t, -0.2, 0.6) }));   // gone behind the board
    // tag beside it
    const tagA = K.io(t, wBelongs, 0.5) * (1 - K.io(t, wCleans, 0.4));
    if (tagA > 0) M.label("dev server: the agent's child", HATCH.x + 130, HATCH.y + 10, { align: 'left', alpha: tagA, color: C.head });

    M.counter(t, { geo: KG, lit: { 0: K.io(t, wDev, 0.5) * kidsA * (1 - K.io(t, cMxc, 0.6)) } });

    // the sandbox fence around the long-running children
    const fK = K.io(t, f('fences', 0, 20.1), 1.4, 'lin');
    const fA = 1 - K.io(t, cMxc + 0.3, 0.8);
    M.fence(FENCE.x, FENCE.y, FENCE.w, FENCE.h, { k: fK, alpha: fA, label: 'sandbox', glow: 0.6 });

    // "limiting what they can touch": python reaches for your files, stopped at the fence
    const reachA = 1 - K.io(t, cMxc, 0.5);
    const reachK = K.io(t, wLimiting + 0.3, 0.8);
    if (reachK > 0 && reachA > 0) K.layer(reachA, () => {
      const fx = stX(3), fy = cookY - 10;
      K.layer(K.io(t, wLimiting, 0.5), () => {
        K.folder(fx, fy, 64, {});
        M.label('your files', fx, fy + 76, { color: C.body });
      });
      K.arrow(stX(1) + 56, cookY - 20, FENCE.x + FENCE.w - 8, cookY - 20, { k: reachK, color: C.soft, w: 3, dash: [10, 8], head: false });
      M.cross(FENCE.x + FENCE.w + 4, cookY - 20, 40, K.io(t, wTouch, 0.5));
    });

    // the larger fence: Execution Containers
    const bK = K.io(t, cMxc + 0.25, 1.8, 'lin');
    bigFence(BIG.x, BIG.y, BIG.w, BIG.h, bK, 'Execution Containers · Windows', K.io(t, cMxc + 0.25 + 1.8, 0.4));
    const gaA = K.io(t, wGenerally, 0.5);
    if (gaA > 0) K.pill('GA · Oct 2026', 1250, BIG.y, { size: 26, color: C.head, fill: C.panel, stroke: C.head, alpha: gaA });

    // parent links agent -> children (drawn under the cooks)
    kids.forEach((kd) => {
      const arrive = kd.at + 0.8;
      let a = kidsA;
      if (kd.short) a = 1 - K.io(t, cBg + 0.1, 0.5);
      if (a <= 0.002) return;
      const lk = t < cFence ? K.io(t, arrive - 0.1, 0.5) : K.io(t, cFence + 0.3, 0.5);
      M.parentLink(AG.x + AG.s / 2 + 4, AG.y - 30, stX(kd.st) - 56, cookY + 12, { k: lk, label: null, bend: 0, alpha: a * 0.9, lit: kd.st === 0 && hOpen > 0.5 });
    });

    // the children
    kids.forEach((kd) => {
      const tx = stX(kd.st);
      const mv = K.io(t, kd.at, 0.8);
      if (t < kd.at) return;
      let a = kidsA * K.io(t, kd.at, 0.25);
      if (kd.short) a = K.io(t, kd.at, 0.25) * (1 - K.io(t, cBg + 0.1, 0.5));
      if (a <= 0.002) return;
      const back = t >= cFence;              // after the reset they simply stand there
      const x = back ? tx : K.lerp(AG.x + 40, tx, mv), y = back ? cookY : K.lerp(AG.y - 20, cookY, mv);
      const walking = back ? 0 : K.clamp(1 - Math.abs(mv - 0.5) * 2.2) * (mv < 1 ? 1 : 0);
      const bgBadge = !kd.short && t >= wBackground && t < cFence;
      // inside the sandbox (Claude Code part: Mac, Linux, WSL2) the children carry plain names;
      // the Windows .exe names return with the Codex Windows sandbox chip
      const r = M.cook(t, x, y, cookS, {
        alpha: a, walking, pid: kd.pid, pidK: K.io(t, kd.at + 0.7, 0.4), name: back ? null : (mv > 0.85 ? kd.name : null),
        lit: kd.st === 0 ? K.io(t, wDev, 0.5) * (1 - K.io(t, cFence, 0.3)) : 0,
        badge: bgBadge ? 'clock' : null,
      });
      if (back) {
        // sequential swap (out, then in) so the two centred names never overlap mid-transition
        const nm = (str, al) => { if (al > 0.002) K.text(str, x, r.nameY, { font: 'mono', weight: 600, size: 26, color: C.strong, align: 'center', alpha: a * al }); };
        nm(kd.name.replace(/\.exe$/, ''), 1 - K.io(t, wCodex, 0.25));
        nm(kd.name, K.io(t, wCodex + 0.25, 0.3));
      }
    });

    // the leftover: "not every tool does"
    if (ghostA > 0) {
      M.cook(t, stX(0), cookY, cookS, { kind: 'ghost', alpha: ghostA, pid: '26840', name: 'node.exe' });
      M.label('not every tool: a leftover', stX(0) + 120, KG.y + KG.h + 50, { color: C.accent, alpha: ghostA });
    }
  });

  if (dimK > 0) { g.save(); g.fillStyle = K.rgba(C.page, 0.72 * dimK * (1 - hf)); g.fillRect(0, 0, 1920, 1080); g.restore(); }

  // ---- the agent (head cook), never dimmed: it carries the heading beat
  const agLit = K.io(t, wHead, 0.5);
  M.cook(t, agX, agY, AG.s, { kind: 'agent', alpha: agentA * (1 - 0.6 * dimK * (1 - K.io(t, cHead, 0.5))), lit: agLit });
  M.label('coding agent', agX, agY + AG.s / 2 + 52, { alpha: agentA * (1 - 0.6 * dimK * (1 - K.io(t, cHead, 0.5))), color: C.strong });
  // Claude Code cleans up on exit
  const agGhost = exitAgent * (1 - backAgent);
  if (agGhost > 0.002) M.cook(t, AG.x, AG.y, AG.s, { kind: 'ghost', icon: 'sparkle', alpha: agGhost });
  const cleanA = K.env(t, wCleans + 0.3, wNot - 0.45, 0.4);
  if (cleanA > 0) M.label('Claude Code: cleaned up on exit', stX(0) + 120, KG.y + KG.h + 50, { alpha: cleanA, color: C.head });

  // ---- fact cards (top-left), fences beat
  const cardsA = 1 - K.io(t, cMxc, 0.5);
  const c1 = K.io(t, wCC, 0.5), c2 = K.io(t, wCodex, 0.5);
  if (cardsA > 0.002 && t > wAsOf - 0.5) K.layer(cardsA, () => {
    const cx = 110, cw = 640;
    if (c1 > 0) K.layer(c1, () => {
      K.card(cx, 150, cw, 130, { r: 18, fill: C.panel, stroke: C.line2 });
      M.eyebrow('Claude Code sandbox', cx + 26, 196, { align: 'left' });
      M.label('as of Oct 2026', cx + cw - 26, 196, { align: 'right', color: C.soft });
      const pills = [['Mac', wMac], ['Linux', wLinux], ['WSL2', wWsl]];
      let px = cx + 26;
      pills.forEach(([s, at]) => {
        const w = K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
        const pa = K.io(t, at - 0.15, 0.35);
        if (pa > 0) K.pill(s, px + w / 2, 242, { size: 26, color: C.head, fill: C.tile, stroke: C.head, alpha: pa });
        px += w + 14;
      });
      const nw = K.measure('native Windows', { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
      const na = K.io(t, wNative - 0.15, 0.35);
      if (na > 0) {
        K.pill('native Windows', px + nw / 2, 242, { size: 26, color: C.soft, fill: C.tile, stroke: C.line2, alpha: na });
        K.line(px + 18, 242, px + nw - 18, 242, { color: C.accent, w: 3, k: K.io(t, wNative + 0.3, 0.5) });
      }
    });
    if (c2 > 0) K.layer(c2, () => {
      K.card(cx, 296, cw, 104, { r: 18, fill: C.panel, stroke: C.line2 });
      M.eyebrow('Codex · Windows sandbox', cx + 26, 340, { align: 'left' });
      M.label('stops leftover child processes', cx + 26, 380, { align: 'left', alpha: K.io(t, wStops, 0.5), color: C.strong });
    });
  });

  // ---- "some agents now, others planned"
  const someA = K.io(t, wSome, 0.5) * (1 - K.io(t, cIso, 0.5));
  if (someA > 0) K.spans([
    { s: 'some agents use them now', color: C.head, alpha: someA },
    { s: '  ·  ', color: C.soft, alpha: someA },
    { s: 'others planned', color: C.body, alpha: K.io(t, wOthers, 0.5) * someA },
  ], 960, 905, { align: 'center', size: 26, font: 'ui' });

  // ---- Task Manager: the Isolation column (mock-up)
  const bIn = K.io(t, cIso, 0.7);
  if (bIn > 0) {
    const ox = (1 - bIn) * 140;
    const colK = K.io(t, wIsoCol, 0.6);
    const mark = K.io(t, wFences2, 0.5);
    K.layer(bIn * (1 - hf), () => {
      M.board(t, {
        x: BOARD.x + ox, y: BOARD.y, w: BOARD.w, h: BOARD.h, nav: false, tab: 'Processes', heading: 'Processes',
        cols: [{ name: 'Name' }, { name: 'Isolation', w: 240, align: 'center', dashed: true, k: colK }],
        rows: [
          { name: "WSL (Claude Code's sandbox inside)", icon: 'program', k: K.io(t, cIso + 0.3, 0.4), cells: [null] },
          { name: 'Codex sandbox helper', icon: 'program', ai: true, k: K.io(t, cIso + 0.45, 0.4), cells: [null] },
          { name: 'MXC process container', icon: 'program', ai: true, k: K.io(t, cIso + 0.6, 0.4), hl: mark, cells: [mark > 0.3 ? { mark: true } : null] },
        ],
      });
      M.label('AppContainer fences only', BOARD.x + ox + BOARD.w / 2, BOARD.y + BOARD.h + 50, { alpha: K.io(t, wApp, 0.5), color: C.head });
    });
  }

  M.lanternMark(t, {});

  // ---- heading: agents as their own kind of process, with their own account
  const hk = K.io(t, cHead + 0.5, 0.6);
  if (hk > 0) {
    const s = AG.s, pad = 22;
    K.layer(hk, () => {
      g.save(); g.setLineDash([10, 8]); g.lineWidth = 3; g.strokeStyle = C.head;
      K.rr(agX - s / 2 - pad, agY - s / 2 - pad - 34, s + pad * 2, s + pad + 34 + 12, s * 0.32); g.stroke(); g.restore();
    });
    M.badge('person', agX + s * 0.5 + pad, agY - s * 0.5 - pad - 34, 28, { alpha: K.io(t, wAccount - 0.3, 0.5), color: C.head });
    const la = K.io(t, wAgents - 0.2, 0.5);
    if (la > 0) {
      M.label("Where it's heading:", 960, agY + s / 2 + 130, { size: 30, color: C.head, alpha: la, weight: 700 });
      K.spans([
        { s: 'agents as their own kind of process', color: C.head },
        { s: ', with their own account', color: C.head, alpha: K.io(t, wAccount - 0.6, 0.5) },
      ], 960, agY + s / 2 + 182, { align: 'center', size: 32, font: 'ui', alpha: la });
    }
  }
});
