// 13 — Your job: two questions. You at the door, checking the couriers the agent sends out.
SCENE('13', (t, S) => {
  const C = K.C, P = M.P;
  K.bg();
  const g = K.ctx();

  // ---- cues (local seconds) and spoken words
  const cJob = S.cue('your-job', 0);
  const cRan = S.cue('which-ran', 4.97);
  const cKeys = S.cue('where-keys', 11.89);
  const cFence = S.cue('not-a-fence', 23.1);
  const wJob = S.find('Your', 0, cJob + 2.17);
  const wCheck = S.find('check', 0, cJob + 3.1);
  const wStreets = S.find('which', 0, cRan + 0.68);
  const wRan = S.find('ran', 0, cRan + 1.97);
  const wShell = S.find('shell', 0, cRan + 3.46);
  const wFull = S.find('full', 0, cRan + 5.61);
  const wKeysW = S.find('keys', 0, cKeys + 1.69);
  const wWho = S.find('who', 0, cKeys + 2.7);
  const wFile = S.find('file', 0, cKeys + 4.28);
  const wVar = S.find('variable', 0, cKeys + 5.52);
  const wTerm = S.find('terminal', 0, cKeys + 6.78);
  const wAcct = S.find('account', 0, cKeys + 9.73);
  const wRequest = S.find('request', 0, cFence + 3.29);
  const wFenceW = S.find('fence', 0, cFence + 4.29, { whole: true });
  const wReal = S.find('Real', 0, cFence + 5.21);
  const wSand = S.find('sandboxes', 0, cFence + 6.45);
  const wScrub = S.find('scrubbing', 0, cFence + 7.84);
  const wModule = S.find('module', 0, cFence + 9.01);

  // ---- focus for the fence beat: the questions step aside, the cluster at the door dims
  const fz = K.io(t, cFence - 0.1, 0.45);
  const clusterA = 1 - 0.5 * fz;

  // ---- home and the two figures (calm from frame 0: continues 12's exit, the agent at the door)
  const you = { x: 520, y: 380, s: 120 };
  const ag = { x: 760, y: 380, s: 100 };
  let agR;
  K.layer(clusterA, () => {
    M.door(t, { open: 0.35 });
    M.courier(t, you.x, you.y, you.s, { icon: 'person', satchel: false, label: 'you', labelColor: C.strong });
    agR = M.courier(t, ag.x, ag.y, ag.s, { icon: 'sparkle', lantern: 1, label: 'agent',
      satchel: { open: 0 } });

    // ---- [[your-job]] the agent hands you a tag: "check the work" (an outlined gold pill)
    const hand = K.io(t, wJob, 0.9);
    if (t >= wJob - 0.05) {
      const x0 = agR.sx, y0 = agR.sy + 100, x1 = you.x, y1 = 556;
      const cx = K.lerp(x0, x1, hand), cy = K.lerp(y0, y1, hand) + Math.sin(hand * Math.PI) * 70;
      const sc = 0.3 + 0.7 * hand;
      // thin connector to "you" once the tag has landed
      const con = K.io(t, wJob + 0.8, 0.3);
      if (con > 0) K.line(you.x, 492, you.x, 528, { k: con, color: C.head, w: 2 });
      K.layer(K.io(t, wJob, 0.35), () => K.at(cx, cy, sc, -(1 - hand) * 0.2, () => {
        K.pill('check the work', 0, 0, { size: 28, w: 230, stroke: C.head, color: C.strong, fill: C.tile,
          glow: 0.25 * K.io(t, wCheck, 0.5) * (1 - K.io(t, cRan, 1)) });
      }));
      K.glow(you.x, you.y, 110, C.head, 0.18 * K.io(t, wCheck, 0.5) * (1 - K.io(t, cRan, 1)));
    }
  });

  // the two question cards fade out and step right while the fence beat plays
  const cardA = 1 - fz;
  const cardDx = 80 * fz;

  // ---- [[which-ran]] question 1
  const q1 = { x: 920, y: 150, w: 880, h: 350 };
  if (cardA > 0.01) K.layer(cardA, () => K.at(cardDx, 0, 1, 0, () => K.rise(t, cRan, () => {
    K.card(q1.x, q1.y, q1.w, q1.h, { r: 22, fill: C.tile, stroke: C.line2 });
    M.eyebrow('Question 1', q1.x + 40, q1.y + 52, { align: 'left' });
    K.text('Which program ran?', q1.x + 40, q1.y + 108, { font: 'head', weight: 700, size: 44, color: C.strong });
    // the street-grid ghost: three streets, the first one lit (that shop won)
    const lit = K.io(t, wRan, 0.5);
    [0, 1, 2].forEach((i) => {
      const k = K.stagger(t, wStreets, i, 0.15, 0.6);
      if (k <= 0) return;
      const y = q1.y + 190 + i * 58, on = i === 0 ? lit : 0;
      K.layer(i === 0 ? 1 : 1 - 0.55 * lit, () => {
        K.pill(String(i + 1), q1.x + 62, y, { font: 'mono', size: 26, w: 52, alpha: k,
          stroke: on > 0.5 ? C.head : C.line2, color: on > 0.5 ? C.head : C.strong });
        K.line(q1.x + 96, y + 20, q1.x + 320, y + 20, { k, color: K.mixColor(C.line2, C.head, on), w: on > 0.5 ? 3 : 2,
          dash: i === 0 ? null : [10, 10] });
        if (on > 0) K.glow(q1.x + 200, y, 70, C.head, 0.35 * on);
        K.folder(q1.x + 200, y + 2 - (1 - K.io(k, 0.3, 0.7, 'out')) * 30, 40, { alpha: K.io(k, 0.3, 0.7) });
      });
    });
    // ask the shell
    const px = q1.x + 600;
    K.pill('where.exe python', px, q1.y + 190, { font: 'mono', size: 26, w: 330, icon: 'terminal', alpha: K.io(t, wShell - 0.1, 0.5) });
    K.pill('which -a python', px, q1.y + 248, { font: 'mono', size: 26, w: 330, icon: 'terminal', alpha: K.io(t, wShell + 0.25, 0.5) });
    // ...or ask the agent for the full path: the answer, printed as output (gold mono, no pill)
    const fk = K.io(t, wFull - 0.2, 0.5);
    if (fk > 0) {
      K.line(q1.x + 330, q1.y + 210, q1.x + 368, q1.y + 292, { k: fk, color: C.head, w: 2, dash: [6, 6] });
      K.glow(px, q1.y + 300, 140, C.head, 0.12 * fk);
      K.text('→ .venv\\Scripts\\python.exe', q1.x + 382, q1.y + 310, { font: 'mono', size: 28, color: C.head, alpha: fk });
    }
  })));

  // ---- [[where-keys]] question 2
  const q2 = { x: 920, y: 530, w: 880, h: 380 };
  if (cardA > 0.01) K.layer(cardA, () => K.at(cardDx, 0, 1, 0, () => K.rise(t, cKeys, () => {
    K.card(q2.x, q2.y, q2.w, q2.h, { r: 22, fill: C.tile, stroke: C.line2 });
    M.eyebrow('Question 2', q2.x + 40, q2.y + 52, { align: 'left' });
    K.text('Where do my keys live?', q2.x + 40, q2.y + 108, { font: 'head', weight: 700, size: 44, color: C.strong });
    K.text('Who can see them?', q2.x + 40, q2.y + 158, { font: 'ui', weight: 600, size: 32, color: C.body, alpha: K.io(t, wWho - 0.1, 0.5) });
    M.chip(q2.x + 790, q2.y + 30, { kind: 'key', name: 'KEY', w: 100, h: 130, alpha: K.io(t, wKeysW - 0.1, 0.5), rot: 0.06 });
    const pills = [
      ['which file', 'file', wFile],
      ['which variable', 'key', wVar],
      ['which terminal', 'terminal', wTerm],
      ['which account pays', 'person', wAcct],
    ];
    pills.forEach(([s, icon, at], i) => {
      const x = q2.x + (i % 2 ? 640 : 230), y = q2.y + (i < 2 ? 238 : 318);
      K.rise(t, at - 0.1, () => K.pill(s, x, y, { size: 28, w: 380, icon, iconColor: icon === 'key' ? P.key : undefined }), 14, 0.45);
    });
  })));

  // ---- [[not-a-fence]] a request vs. a real fence, on its own panel where the questions were
  K.rise(t, cFence + 0.3, () => {
    const pn = { x: 920, y: 200, w: 880, h: 690 };
    K.card(pn.x, pn.y, pn.w, pn.h, { r: 22, fill: C.tile, stroke: C.line2 });
    K.line(1360, 280, 1360, 800, { color: C.line, w: 2 });

    // left: the polite note on its post; the "fence" is only a dashed line
    const lx = 1140;
    K.line(lx, 400, lx, 700, { color: C.soft, w: 8 });
    K.card(lx - 170, 278, 340, 124, { r: 12, fill: P.paper, stroke: false, shadow: true });
    K.text("please don't", lx, 330, { font: 'ui', weight: 700, size: 30, color: P.ink, align: 'center' });
    K.text('read your keys', lx, 370, { font: 'ui', weight: 700, size: 30, color: P.ink, align: 'center' });
    const rq = K.io(t, wRequest - 0.1, 0.6);
    if (rq > 0) {
      K.line(lx - 130, 580, lx + 130, 580, { k: rq, color: C.soft, w: 3, dash: [10, 12] });
      K.line(lx - 130, 650, lx + 130, 650, { k: rq, color: C.soft, w: 3, dash: [10, 12] });
      M.label('a request', lx, 770, { color: C.soft, size: 32, alpha: rq });
    }
    const nf = K.io(t, wFenceW, 0.5);
    if (nf > 0) M.cross(lx + 70, 615, 66, nf);
  });

  // right: a real fence (solid planks, rails, a shield) and where it is taught
  const rx = 1580;
  K.pop(t, wSand - 0.1, rx, 420, () => K.icon('shield', rx, 420, 84, { color: C.strong, w: 3 }), 0.5);
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => {
    const k = K.stagger(t, wReal - 0.1, i, 0.05, 0.4);
    if (k <= 0) return;
    const x = rx + (i - 4) * 30, h = 190 * K.ease.out(k);
    K.card(x - 10, 700 - h, 20, h, { r: 5, fill: K.mixColor(C.tile, C.strong, 0.35), stroke: C.line2, shadow: false });
  });
  const rails = K.io(t, wReal + 0.3, 0.4);
  if (rails > 0) {
    K.line(rx - 150, 570, rx + 150, 570, { k: rails, color: C.strong, w: 5 });
    K.line(rx - 150, 650, rx + 150, 650, { k: rails, color: C.strong, w: 5 });
  }
  M.label('sandbox · scrubbing', rx, 770, { color: C.strong, size: 32, alpha: K.io(t, wScrub - 0.1, 0.5) });
  const mk = K.io(t, wModule - 0.1, 0.6, 'back');
  if (mk > 0) K.at(rx, 832, 0.6 + 0.4 * mk, () => K.pill('→ 14.12', 0, 0, { font: 'mono', size: 28, alpha: K.clamp(mk) }));
});
