/* 04 — Follow one message
   The road as 03 left it (all five stops lit). One message leaves an AI chat window and rides just above the
   road, keyed to the spoken words: it reaches stop 2 on "Wi-Fi", leaves on "router", reaches stop 3 on
   "internet", is checked by a login badge on the road before the services' door, visits the model and comes
   back right to left as a cream reply that lands in the chat window. Then the side counter below services
   (program + key -> API pill), and where the picture breaks: the road kinks, services call services, and a
   local model under stop 1 needs no road (stops 2-5 dim on "road"). The one 'back' overshoot is the local brain. */
SCENE('04', (t, S) => {
  const C = K.C;
  K.bg();                                                  // the plain indigo ground of 03/05, so the crossfades never shift colour

  // ---- spoken-word times (local) ---------------------------------------------------------------
  const tType = S.find('type', 0, 1.89);
  const tLeave = S.cue('leave', 4.55);                     // "Your computer..."
  const tHands = S.find('hands', 0, 5.53);
  const tWifi = S.find(/^Wi-Fi/i, 0, 6.29);
  const tRouter = S.find('router', 0, 7.61);
  const tInternet = S.find(/^internet/i, 0, 9.2);
  const tCarries = S.find('carries', 0, 11.05);
  const tDoor = S.cue('door', 12.17);                      // "...service."
  const tChecks = S.find('checks', 0, 13.9);
  const tReally = S.find(/^really$/i, 0, 14.59);
  const tYou = S.find(/^you,?$/i, 1, 14.99);               // "...really you," (2nd 'you')
  const tRuns = S.find('runs', 0, 15.77);
  const tSends = S.find('sends', 0, 16.91);
  const tBack = S.cue('back', 17.72);
  const tPrograms = S.find('Programs', 0, 19.25);
  const tKnock = S.find('knock', 0, 19.87);
  const tSide = S.find('side', 0, 20.35);
  const tCounter = S.find('counter', 0, 20.67);
  const tShow = S.find(/^show$/, 0, 22.95);
  const tHeres = S.find(/^Here/, 0, 24.41);
  const tPicture = S.find('picture', 0, 25.08);
  const tBreaks = S.cue('breaks', 26.18);                  // "It isn't really a straight line."
  const tServices = S.find(/^Services$/, 0, 28.53);
  const tOwn = S.find(/^own$/, 0, 33.08);
  const tRoad = S.find(/^road/, 1, 34.39);                 // "...with no road at all" (2nd "road")

  const gm = M.geom('std');
  const LIFT = -150;                                       // travellers ride just above the cards (y 370)
  const lifted = (u) => M.along(gm, u, LIFT);
  const quad = (a, c, b, k) => ({ x: (1 - k) * (1 - k) * a.x + 2 * (1 - k) * k * c.x + k * k * b.x, y: (1 - k) * (1 - k) * a.y + 2 * (1 - k) * k * c.y + k * k * b.y });

  // ---- the road: all lit, as 03 left it; it kinks on "breaks" and dims past stop 1 on "road" ----
  const arrive = [tLeave + 0.75, tWifi, tInternet, tYou + 0.6, tRuns + 0.6];
  const kinkK = K.io(t, tBreaks, 0.6) * (1 - K.io(t, tOwn, 0.7));   // straight again for the local model + the hand-over to 05
  const dimK = K.io(t, tRoad, 0.6);
  const KINK = [0, -18, 14, -12, 16];
  const pulse = (i) => M.bump(t, arrive[i], 0.9);
  const cardA = (i) => (i === 0 ? 1 : K.lerp(1, 0.35, dimK));
  const arrA = K.lerp(1, 0.35, dimK);
  const iconDx = (i) => (i === 2 ? K.wave(t, 1.2, 3) : 0);
  let cards = gm.cards;
  if (kinkK <= 0 && dimK <= 0) {
    M.road(t, { geom: gm, lit: 1, pulse, iconDx, cardAlpha: cardA, arrowAlpha: arrA });
  } else {
    // same road, each stop nudged off the straight line: drawn with M.stop + matching lane and arrows
    cards = gm.cards.map((c, i) => M.geom('std', { y: gm.y + KINK[i] * kinkK }).cards[i]);
    const kg = { ...gm, cards };
    const g = K.ctx();
    const bw = Math.max(10, gm.h * 0.16);
    const lane = (col, w, a, dash) => {
      g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'butt'; g.lineJoin = 'round';
      g.globalAlpha *= a; if (dash) g.setLineDash(dash);
      // only in the gaps, so the lane never shows through a dimmed (translucent) card
      g.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = cards[i], b = cards[i + 1], yAt = (x) => a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x);
        g.moveTo(a.r - 2, yAt(a.r - 2)); g.lineTo(b.l + 2, yAt(b.l + 2));
      }
      g.stroke(); g.restore();
    };
    lane(C.line, bw, 0.55 * K.lerp(1, 0.5, dimK));
    lane(C.line2, 2, 0.5 * K.lerp(1, 0.5, dimK), [10, 14]);
    for (let i = 0; i < 4; i++) {
      const a = cards[i], b = cards[i + 1];
      K.arrow(a.r + 8, a.y, b.l - 8, b.y, { k: 1, color: K.mixColor(C.line2, C.head, 0.7), w: Math.max(2.5, gm.h * 0.016), headSize: Math.max(10, gm.h * 0.065), alpha: arrA });
    }
    for (let i = 0; i < 5; i++) M.stop(kg, i, { lit: 1, pulse: pulse(i), alpha: cardA(i), iconDx: iconDx(i) });
  }
  const c4 = cards[3];

  // detail lines, dimmed (continuity with 03), gone once the reply heads home
  const detA = 0.4 * (1 - K.io(t, tBack, 0.6));
  if (detA > 0.01) for (let i = 0; i < 5; i++) M.detail(gm, i, null, { alpha: detA });

  // ---- the AI chat window above card 1 ------------------------------------------------------------
  const winA = K.lerp(1, 0.7, K.io(t, tPicture, 0.6));
  const W = { x: 80, y: 135, w: 580, h: 200 };             // bottom 335: clear of the riding message (top ~340)
  const RET = 1.3;                                         // reply: AI -> your computer on "sends ... back down the road"
  const tAns = tSends + RET + 0.3;                         // lands in the window, the answer is printed before "Programs"
  K.layer(winA, () => {
    const r = K.win(W.x, W.y, W.w, W.h, { kind: 'browser', title: 'AI chat' });
    const q = 'What is a terminal?';
    const qo = { font: 'ui', size: 30, weight: 600, color: C.strong };
    const qx = r.x + 30, qy = r.y + 42;
    const shown = K.typed(q, t, tType, 16);
    const qw = K.text(shown, qx, qy, qo);
    if (!K.typedDone(q, t, tType, 16) && K.caretOn(t)) {
      const g = K.ctx(); g.save(); g.fillStyle = C.strong; g.fillRect(qx + qw + 4, qy - 26, 3, 32); g.restore();
    }
    const ans = 'A window where you type commands to your computer.';
    const ao = { font: 'ui', size: 30, weight: 400, color: C.paper };
    const lines = K.wrap(ans, r.w - 60, ao);
    let n = Math.floor(K.clamp((t - tAns) * 90, 0, ans.length));
    lines.forEach((ln, j) => {
      if (n <= 0) return;
      K.text(ln.slice(0, n), qx, qy + 48 + j * 36, ao);
      n -= ln.length + 1;
    });
  });

  // ---- the login check: an ID badge in the gap before the services' door ----------------------
  const BADGE = { x: (cards[2].r + c4.l) / 2, y: c4.y };   // ~1135: the gate on the road, in the 3 -> 4 gap
  const badgeK = K.io(t, tChecks - 0.1, 0.45) * (1 - K.io(t, tRuns + 0.5, 0.5));
  if (badgeK > 0) {
    const okK = K.io(t, tYou, 0.35);                       // "...really you" -> checked
    const chk = M.bump(t, tYou, 0.9);
    K.layer(badgeK, () => {
      K.glow(BADGE.x, BADGE.y, 70, C.head, 0.1 + 0.22 * chk);
      K.at(BADGE.x, BADGE.y, 0.85 + 0.15 * badgeK, () => {
        K.card(-30, -30, 60, 60, { r: 30, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.45 + 0.55 * okK), shadow: false, lw: 2.5 });
        K.icon('person', 0, 0, 38, { color: C.head });
        if (okK > 0) {                                     // a small gold tick on the badge's shoulder
          K.card(14, -40, 30, 30, { r: 15, fill: C.head, shadow: false, alpha: okK });
          K.icon('check', 29, -25, 22, { color: C.page, w: 3.5, alpha: okK });
        }
      });
    });
  }

  // ---- the traveller: one message, keyed to the words ------------------------------------------
  const qEndX = W.x + 30 + K.measure('What is a terminal?', { font: 'ui', size: 30, weight: 600 }) + 56;
  const A = { x: qEndX, y: W.y + 50 + 42 - 10 };           // beside the typed question
  const tAppear = tType + 1.35;
  const P0 = lifted(0);
  const GATE = { x: BADGE.x, y: BADGE.y - 92 };           // waits right above the ID badge, in the 3 -> 4 gap
  const msgPos = (tt) => {
    if (tt < tAppear) return null;
    if (tt < tLeave) return A;
    if (tt < tHands) return quad(A, { x: A.x, y: P0.y }, P0, K.io(tt, tLeave, tHands - tLeave));
    if (tt < tRouter) return lifted(K.io(tt, tHands, tWifi - tHands));                       // 1 -> 2 on "Wi-Fi"
    if (tt < tCarries) return lifted(1 + K.io(tt, tRouter, tInternet - tRouter));            // 2 -> 3 on "internet"
    if (tt < tYou) {                                                                          // 3 -> the door on "service"
      const a = lifted(2), k = K.io(tt, tCarries, tDoor - tCarries);
      return quad(a, { x: (a.x + GATE.x) / 2 + 40, y: a.y }, GATE, k);
    }
    if (tt < tRuns) {                                                                         // checked: in to the services
      const b = lifted(3), k = K.io(tt, tYou, 0.6);
      return quad(GATE, { x: GATE.x, y: b.y }, b, k);
    }
    return lifted(3 + K.io(tt, tRuns, M.motion.travel));                                     // 4 -> 5 on "runs the model"
  };
  const swapK = K.io(t, tSends - 0.45, 0.4);                // the message becomes the answer at the model
  const msgA = K.io(t, tAppear, 0.4) * (1 - swapK);
  const trail = (pos, col, a) => {
    for (let j = 6; j >= 1; j--) {
      const p = pos(t - j * 0.035), q = pos(t - (j - 1) * 0.035);
      if (!p || !q || Math.hypot(q.x - p.x, q.y - p.y) < 0.8) continue;
      K.layer(a * 0.4 * (1 - j / 7), () => {
        const g = K.ctx(); g.save(); g.fillStyle = col; g.beginPath(); g.arc(p.x, p.y, 13 * (1 - j / 8), 0, 7); g.fill(); g.restore();
      });
    }
  };
  const mp = msgPos(t);
  if (mp && msgA > 0) {
    trail(msgPos, C.accent, msgA);
    const idle = K.wave(t, 1.6, 2.5);
    K.glow(mp.x, mp.y, 78, C.head, 0.12 * msgA);
    M.message(mp.x, mp.y + idle, { s: 50, alpha: msgA, glow: 0.6 });
  }

  // the reply: rests at AI, then travels AI -> your computer (right to left), then up into the chat window
  const land = { x: W.x + 64, y: W.y + 50 + 42 + 48 - 10 };
  const replyPos = (tt) => {
    if (tt < tSends - 0.45) return null;
    const u = 4 - 4 * K.io(tt, tSends, RET);
    const upK = K.io(tt, tSends + RET, 0.35);
    if (upK > 0) return quad(lifted(0), { x: lifted(0).x, y: land.y + 10 }, land, upK);
    return lifted(u);
  };
  if (swapK > 0) {
    const ra = swapK * (1 - K.io(t, tAns - 0.05, 0.35));
    const rp = replyPos(t);
    if (rp && ra > 0) {
      trail(replyPos, C.paper, ra * 0.8);
      M.reply(rp.x, rp.y + K.wave(t, 1.6, 2), { s: 48, alpha: ra });
    }
  }

  // ---- the side counter, below services: a program shows a key at the A P I --------------------
  const apiOut = 1 - K.io(t, tHeres, 0.6);
  if (apiOut > 0) {
    K.layer(apiOut, () => {
      const PY = c4.b + 66;                                // ~691: pill centre, below the services card
      const ledge = K.io(t, tPrograms, 0.4);
      if (ledge > 0) {
        K.line(c4.x, c4.b + 6, c4.x, c4.b + 6 + (PY - 29 - c4.b - 6) * ledge, { color: C.head, w: 4 });
        K.glow(c4.x, PY, 60, C.head, 0.14 * ledge);
      }
      const pillK = K.io(t, tPrograms + 0.1, 0.45);       // the counter and its caller arrive together
      if (pillK > 0) K.pill('API', c4.x, PY + (1 - pillK) * 10, { size: 30, alpha: pillK, color: C.head, stroke: C.head });
      const progK = K.io(t, tPrograms, 0.6);
      const knock = M.bump(t, tKnock, 0.35) * 8 + M.bump(t, tKnock + 0.3, 0.35) * 8;
      const px = c4.x - 176;                               // ~1134
      if (progK > 0) {
        const py = PY + (1 - progK) * 40;
        K.iconTile('code', px + knock, py, 58, { alpha: progK, color: C.paper, stroke: C.head });
        K.text('program', px + knock, py + 58, { font: 'ui', size: 26, weight: 600, color: C.strong, align: 'center', alpha: progK });
      }
      const keyK = K.io(t, tShow, 0.45);
      if (keyK > 0) {
        const kx = c4.x - 106;                              // between the program and the pill
        K.glow(kx, PY, 40, C.head, 0.28 * keyK);
        K.icon('key', kx, PY + (1 - keyK) * 12, 42, { color: C.head, alpha: keyK });
      }
    });
  }

  // ---- where the picture breaks --------------------------------------------------------------
  const ebK = K.io(t, tPicture, 0.5);
  if (ebK > 0) K.eyebrow('Where the picture breaks', 960, 150, { align: 'center', alpha: ebK });

  // services call services: two small cards branch from card 4
  const branches = [{ s: 'storage', x: 1180 }, { s: 'payments', x: 1440 }];
  K.layer(K.lerp(1, 0.35, dimK), () => branches.forEach((b, j) => {
    const ak = K.io(t, tServices + j * 0.25, M.motion.arrow);
    if (ak <= 0) return;
    const x1 = c4.x + (j ? 40 : -40), y1 = c4.b + 8, y2 = 712;
    K.arrow(x1, y1, b.x + (j ? -15 : 15), y2, { k: ak, color: K.mixColor(C.line2, C.head, 0.7), w: 3, headSize: 12 });
    const ck = K.io(t, tServices + 0.3 + j * 0.25, 0.5);
    if (ck > 0) K.layer(ck, () => {
      const dy = (1 - ck) * 16;
      K.card(b.x - 90, 720 + dy, 180, 110, { r: 20 });
      K.icon('server', b.x, 755 + dy, 34, { color: C.soft });
      K.text(b.s, b.x, 808 + dy, { font: 'ui', size: 26, weight: 600, color: C.strong, align: 'center' });
    });
  }));

  // some models run on your own computer: a local brain pops in under card 1 (the scene's one 'back')
  const bk = K.io(t, tOwn, 0.55, 'back');
  if (bk > 0) {
    const c1 = cards[0], bx = c1.x, by = c1.b + 72;
    const lk = K.io(t, tOwn + 0.3, 0.5);
    K.line(bx, c1.b + 6, bx, by - 38, { color: C.head, w: 3, alpha: 0.6 * lk });
    K.glow(bx, by, 90, C.head, 0.3 * K.clamp(bk));
    K.at(bx, by, Math.max(0, bk), () => M.brain(0, 0, 64, { color: C.head }));
    if (lk > 0) K.text('local model', bx, by + 82, { font: 'ui', size: 30, weight: 600, color: C.head, align: 'center', alpha: lk });
  }
});
