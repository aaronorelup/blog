// 14 — Your job: judge what's running
// The whole kitchen (M.kitchen) seen by the manager, left; a five-question checklist card, right.
// Each question lights one part of the kitchen as it is asked; the staff board lights on 'board'.
SCENE('14', (t, S) => {
  K.bg();
  const C = K.C, io = K.io;
  const cue = (n, fb) => S.cue(n, fb);
  const word = (w, nth, fb) => S.find(w, nth, fb, { whole: true });

  // ---- beat times (local)
  const tJob = cue('your-job', 0);
  const tAgent = word('agent', 0, tJob + 0.25);
  const tFind = word('find', 0, tJob + 1.0);
  const tYour = word('Your', 0, tJob + 3.0);
  const tJudge = word('judge', 0, tJob + 4.0);
  const tFive = word('five', 0, tJob + 5.5);
  const tWhat = cue('q-what', 6.85);
  const tFile = word('file', 0, tWhat + 0.4);
  const tCopy = word('running', 1, tWhat + 1.2);
  const tSvc = word('service', 0, tWhat + 2.7);
  const tWho = cue('q-who', 12.3);
  const tPort = cue('q-port', 18.4);
  const tKeys = cue('q-keys', 19.7);
  const tFence = cue('q-fence', 21.5);
  const tBoard = cue('board', 25.0);
  const tBoardW = word('board', 0, tBoard + 2.0);
  const tWSL = word('W', 0, tBoard + 4.7);

  // ---- kitchen glows: each lights on its beat, fades when the next question arrives, then all settle soft
  const D = 0.5;
  const soft = io(t, tBoard, 0.8) * 0.35;
  const env = (a, b) => Math.max(io(t, a, D) * (1 - io(t, b, D)), soft);
  const glow = {
    shelf: env(tFile, tWho),
    cooks: env(tCopy, tWho),
    night: env(tSvc, tWho),
    parents: env(tWho, tPort),
    satchels: env(tKeys, tFence),
    fence: env(tFence, tBoard),
    board: io(t, tBoardW - 0.45, 0.4),
  };
  const hatchK = env(tPort, tKeys);

  // ---- the kitchen, left two thirds (camera eases back to 0.62 as the scene opens)
  const ks = K.lerp(0.68, 0.62, io(t, -0.4, 1.8));
  const kx = K.lerp(30, 60, io(t, -0.4, 1.8)), ky = K.lerp(205, 235, io(t, -0.4, 1.8));
  const kdim = 0.3 * io(t, tJob + 0.2, 1.0) * (1 - 0.6 * io(t, tBoard, 0.8));
  K.at(kx, ky, ks, () => {
    // the kitchen, with its PID tickets masked out: at 0.62 scale they would read at ~16 px (below the 26 px floor)
    const gk = K.ctx();
    gk.save(); gk.beginPath(); gk.rect(-2000, -2000, 6000, 6000);
    [0, 1, 2, 3].forEach((i) => gk.rect(M.cookAt(i).x - 100, M.L.cookY + 47, 200, 58));
    gk.clip('evenodd');
    M.kitchen(t, { glow: { ...glow, parents: 0, satchels: 0 }, dim: kdim }); // parent links + satchel glows drawn below, unclipped
    gk.restore();
    // hatches light up 'open' over the kitchen's idle ones (kitchen's own hatch glow is on/off)
    if (hatchK > 0.002) {
      const H = { y: 160, w: 190, h: 124, xs: [1050, 1270, 1490] };
      const nums = ['3000', '5173', '11434'];
      K.layer(hatchK * (1 - 0.65 * kdim), () => {
        H.xs.forEach((x, i) => M.hatch(t, x, H.y + H.h / 2, { w: H.w, h: H.h, num: nums[i], state: 'open', ai: i === 2 }));
      });
    }
    // stronger accents for the parts the small scale would lose (same kitchen coordinates, undimmed)
    const ckx = (i) => M.cookAt(i).x, cy = M.L.cookY;
    const pk = glow.parents;
    if (pk > 0.002) {
      M.parentLink(ckx(0) + 40, cy - 66, ckx(1) - 40, cy - 66, { k: io(t, tWho, 0.7), lit: true, alpha: pk, label: null, bend: -36, w: 5 });
      M.parentLink(ckx(2) + 40, cy - 66, ckx(3) - 40, cy - 66, { k: io(t, tWho, 0.7), lit: true, alpha: pk, label: null, bend: -36, w: 5 });
    }
    const sk = glow.satchels;
    if (sk > 0.002) [0, 1, 2, 3].forEach((i) => K.glow(ckx(i) + 44, cy + 28, 76, C.head, 0.7 * sk));
    const fk = glow.fence;
    if (fk > 0.002) {
      const fx = M.L.counter.x + 2 * M.L.counter.w / 8 + 10, fw = 2 * M.L.counter.w / 8 - 20;
      K.glow(fx + fw / 2, cy + 45, 300, C.head, 0.18 * fk);
      M.fence(fx, cy - 100, fw, 290, { k: 1, alpha: fk, fill: false });
    }
  });

  // ---- the checklist card, right
  const cx0 = 1210, cy0 = 170, cw = 610, ch = 720, cmx = cx0 + cw / 2;
  const cardK = io(t, tJob - 0.1, 0.6);
  K.layer(cardK, () => {
    K.card(cx0, cy0 + (1 - cardK) * 20, cw, ch, { r: 24, fill: C.panel, stroke: C.line2 });
  });

  // agent tile (finds · stops) and you (judges)
  const ty = 285;
  const aK = io(t, tAgent, 0.5), aL = io(t, tFind, 0.5);
  const yK = io(t, tYour, 0.5), yL = io(t, tJudge, 0.5);
  const youLit = io(t, tJudge, 0.5) * (1 - 0.6 * io(t, tWhat, 0.6));
  M.cook(t, cx0 + 150, ty, 76, { kind: 'agent', alpha: aK, dim: 0.35 * io(t, tYour, 0.6) });
  M.label('finds · stops', cx0 + 150, ty + 80, { alpha: aL, size: 26, color: C.body });
  M.cook(t, cx0 + cw - 150, ty, 76, { hat: false, alpha: yK, lit: youLit });
  M.label('judges', cx0 + cw - 150, ty + 80, { alpha: yL, size: 30, color: C.head });
  // a quiet hand-off arrow between them
  K.layer(yK * aK, () => K.arrow(cx0 + 205, ty, cx0 + cw - 205, ty, { k: io(t, tYour, 0.6), color: C.line2, w: 2.5, dash: [8, 8] }));

  // heading
  const hK = io(t, tFive, 0.5);
  K.layer(hK, () => K.title('Five questions', cmx, 448 - (1 - hK) * 12, { size: 44, align: 'center' }));

  // the five rows
  const Q = [
    { at: tWhat, s: 'file, running copy, or service?' },
    { at: tWho, s: 'who started it?' },
    { at: tPort, s: 'which port?' },
    { at: tKeys, s: 'carries my keys?' },
    { at: tFence, s: 'fenced in?' },
  ];
  const nextAt = [tWho, tPort, tKeys, tFence, tBoard];
  const g = K.ctx();
  Q.forEach((q, i) => {
    const rk = io(t, q.at, 0.5);
    if (rk <= 0.002) return;
    const ry = 512 + i * 56;
    const act = rk * (1 - io(t, nextAt[i], 0.5));
    K.layer(rk, () => {
      // active wash
      if (act > 0.01) K.card(cx0 + 22, ry - 26, cw - 44, 52, { r: 26, fill: K.rgba(C.head, 0.12 * act), stroke: K.rgba(C.head, 0.5 * act), shadow: false });
      // number disc
      const dx = cx0 + 62, dy = ry + (1 - rk) * 10;
      g.save(); g.beginPath(); g.arc(dx, dy, 20, 0, Math.PI * 2);
      g.fillStyle = K.mixColor(C.panel, C.head, act); g.fill();
      g.lineWidth = 2.5; g.strokeStyle = C.head; g.stroke(); g.restore();
      K.text(String(i + 1), dx, dy + 9, { font: 'mono', weight: 700, size: 26, align: 'center', color: K.mixColor(C.head, C.page, act) });
      K.text(q.s, cx0 + 100, dy + 10, { font: 'ui', weight: 600, size: 30, color: K.mixColor(C.strong, C.head, act), align: 'left', maxW: cw - 130 });
    });
  });

  // the board row (bottom of the card): the kitchen's staff board lights at the same time
  // the row lands with the word 'board' (fully in as it is said); the WSL line lands with 'W S L'
  const bK = io(t, tBoardW - 0.45, 0.4), wK = io(t, tWSL - 0.2, 0.4);
  K.layer(bK, () => {
    K.line(cx0 + 40, 778, cx0 + cw - 40, 778, { color: C.line2, w: 1.5 });
    // a tiny staff board: the same object as the one on the kitchen wall
    K.glow(cx0 + 66, 840, 60, C.head, 0.25 * bK);
    K.card(cx0 + 40, 806, 52, 68, { r: 8, fill: C.panel, stroke: C.head, shadow: false });
    [0, 1, 2, 3].forEach((j) => { const ly = 822 + j * 13; K.line(cx0 + 50, ly, cx0 + 54, ly, { color: j === 3 ? C.soft : C.head, w: 5 }); K.line(cx0 + 60, ly, cx0 + 80 - (j % 2) * 6, ly, { color: j === 3 ? C.line2 : C.body, w: 4, alpha: 0.7 }); });
    K.text('board: nearly every process', cx0 + 110, 828, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'left' });
  });
  K.layer(wK, () => K.text('WSL / VMs: one row', cx0 + 110, 870, { font: 'ui', weight: 600, size: 28, color: C.strong, align: 'left' }));
});
