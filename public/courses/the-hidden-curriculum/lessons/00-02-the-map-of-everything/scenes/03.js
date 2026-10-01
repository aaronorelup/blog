/* 03 — The road out of your room
   The road at standard size. Every stop starts as a calm ghost and lights on its spoken name;
   each arrow draws just after the next stop starts lighting. One detail line per stop, on its words.
   The lane band is drawn only in the gaps between cards (road band:0), so it never strikes through a ghost.
   Stop 1: folder · laptop · file on an even 3-column grid; on "Wi-Fi off" a struck-through Wi-Fi badge sits on
   stop 1's top-right corner while the road beyond dims; the camera then pushes in on stop 1 for Aaron's
   script.txt (stops 3-5 fade out so nothing is clipped) and renames it to script.py on "fine".
   Stop 2: three home devices wired into a router. Stop 3: the router joins a cluster of networks, each with a
   different owner tag on "Nobody owns". Stop 4: an open door on its left edge on "door", three example pills.
   Stop 5: on "inside", a bracket joins services and AI and a small model tucks into the services card.
   The extras (folder, file, bracket, tucked model) fade before the end so 04 opens on the bare road. */
SCENE('03', (t, S) => {
  const C = K.C, g = K.ctx(), gm = M.geom('std'), cards = gm.cards, c0 = cards[0], c1 = cards[1], c3 = cards[3], c4 = cards[4];

  // ---- times (local), all from the narration
  const T = [
    S.cue('computer', 1.3), S.cue('network', 25.4), S.cue('internet', 33.9),
    S.cue('services', 41.8), S.cue('ai', 52.6),
  ];
  const D = [                                   // detail lines, on the words that say them
    S.find('Files', 0, 3.0), S.find(/^Wi-Fi/i, 1, 26.7), S.find('Networks', 0, 35.2),
    S.find('someone', 0, 46.7), S.find('model', 0, 53.9),
  ];
  const tFile = S.find('Files', 0, 3.0), tFolder = S.find('folders', 0, 3.8);
  const tYours = S.find('yours', 0, 7.1), tWifi = S.find(/^Wi-Fi/i, 0, 9.0), tOff = S.find('off', 0, 9.6);
  const tConf = S.find('confusion', 0, 11.9);
  const tAaron = S.find('Aaron', 0, 14.1), tTxt = S.find('txt', 0, 17.3);
  const tFine = S.find('fine', 0, 20.4), tOne = S.find('one', 1, 22.9);
  const tRouter = S.find('router', 0, 27.8), tDevice = S.find('device', 0, 30.0), tThrough = S.find('through', 0, 31.0);
  const tNets = S.find('Networks', 0, 35.2), tNobody = S.find('Nobody', 0, 38.5);
  const pills = [['GitHub', S.find('GitHub', 0, 42.9)], ['email', S.find('email', 0, 44.0)], ['payments', S.find('payment', 0, 44.9)]];
  const tDoor = S.find('door', 0, 49.55);
  const tInside = S.find('inside', 0, 55.3);
  const tEnd = Math.max(tInside + 1.6, 57.0);                 // extras fade so 04 opens on the bare road
  const endOut = 1 - K.io(t, tEnd, 0.8);

  K.bg();

  // ---- camera: calm wide; a slow push toward stop 1 after "confusion"; back out before stop 2
  const camIn = tConf - 0.2, camOut = tOne + 0.6;
  const cam = K.cam(t, [
    { at: 0, x: 960, y: 540, z: 1 },
    { at: camIn, x: 800, y: 600, z: 1.18, d: 4.6 },
    { at: camOut, x: 960, y: 540, z: 1, d: 1.5 },
  ]);
  // while pushed in, stops 3-5 fade away entirely (they would be cut by the frame edge), and return once wide
  const zk = K.io(t, camIn, 0.9) * (1 - K.io(t, camOut + 1.1, 0.5));

  K.withCam(cam, () => {
    const off = K.io(t, tOff - 0.15, 0.5) * (1 - K.io(t, tConf, 0.7));
    const lit = M.litAt(t, T);
    const cardA = (i) => (i === 0 ? 1 : (1 - 0.6 * off) * (i >= 2 ? 1 - zk : 1));
    const arrA = (i) => Math.min(cardA(i), cardA(i + 1)) * (1 - 0.8 * off);

    // the lane, only between the cards (so it never runs through a ghost's icon)
    for (let i = 0; i < 4; i++) {
      const a = Math.min(cardA(i), cardA(i + 1)) * (1 - 0.6 * off);
      if (a <= 0.01) continue;
      const bw = Math.max(10, gm.h * 0.16), x1 = cards[i].r + bw / 2, x2 = cards[i + 1].l - bw / 2;
      K.line(x1, gm.y, x2, gm.y, { color: C.line, w: Math.max(10, gm.h * 0.16), alpha: 0.55 * a });
      K.line(x1, gm.y, x2, gm.y, { color: C.line2, w: 2, alpha: 0.5 * a, dash: [10, 14] });
    }

    M.road(t, {
      geom: gm, lit, band: 0,
      arrows: (i) => K.io(t, T[i + 1] + 0.15, M.motion.arrow),
      cardAlpha: cardA, arrowAlpha: arrA,
      pulse: (i) => (i === 0 ? 0.6 * M.bump(t, tYours, 0.9) + 0.8 * M.bump(t, tOne + 0.1, 1.0)
        : i === 3 ? 0.5 * M.bump(t, tDoor + 0.1, 0.9)
        : i === 4 ? 0.5 * M.bump(t, tInside + 0.1, 1.0) : 0),
      iconDx: (i) => (i === 2 ? K.wave(t, 1.2, 3) * lit(2) : 0),
    });

    // stop 1: folder · laptop · file on an even grid (the laptop is the road's own icon at c0.x)
    const col = 88;
    K.layer(endOut, () => {
      K.pop(t, tFolder, c0.x - col, c0.iconY + 4, () => K.folder(c0.x - col, c0.iconY + 4, 42));
      K.pop(t, tFile, c0.x + col, c0.iconY + 2, () => K.file(c0.x + col, c0.iconY + 2, 46));
    });

    // Wi-Fi off: a small struck-through Wi-Fi badge on stop 1's top-right corner
    const wA = K.io(t, tWifi - 0.1, 0.45) * (1 - K.io(t, tConf + 0.2, 0.7));
    if (wA > 0) K.layer(wA, () => {
      const bx = c0.r - 4, by = c0.t + 4, r = 36;
      K.card(bx - r, by - r, 2 * r, 2 * r, { r, fill: C.tile, stroke: C.line2, shadow: true, lw: 2 });
      K.icon('wifi', bx, by + 2, 44, { color: C.body, w: 3 });
      const s = K.io(t, tOff - 0.1, 0.4);
      if (s > 0) K.line(bx - 22, by - 22, bx - 22 + 44 * s, by - 22 + 44 * s, { color: C.paper, w: 4 });
    });

    // detail lines
    D.forEach((d, i) => { const k = K.io(t, d, 0.5); if (k > 0) M.detail(gm, i, undefined, { alpha: k * cardA(i) }); });

    // Aaron's script: rises under stop 1, ringed on ".txt", renamed to .py on "fine"; fades before stop 2
    const fileOut = 1 - K.io(t, T[1] - 0.9, 0.8);
    const fx = c0.x, fy = 790, fs = 128;
    if (fileOut > 0 && t > tAaron - 0.1) K.layer(fileOut, () => {
      K.rise(t, tAaron, () => {
        const py = K.io(t, tFine, 0.6);
        if (py < 1) K.file(fx, fy, fs, { ext: 'txt', alpha: 1 - py });
        if (py > 0) K.file(fx, fy, fs, { ext: 'py', alpha: py });
        const ny = fy + fs / 2 + 40;
        if (py < 1) K.text('script.txt', fx, ny, { font: 'mono', size: 30, weight: 600, color: C.body, align: 'center', alpha: 1 - py });
        if (py > 0) K.text('script.py', fx, ny, { font: 'mono', size: 30, weight: 600, color: C.head, align: 'center', alpha: py });
      }, 30, 0.7);
      const ring = K.io(t, tTxt, 0.9) * (1 - K.io(t, tFine, 0.6));
      if (ring > 0) K.ring(fx - fs * 0.16, fy + fs * 0.27, 70, 36, ring, { color: K.rgba(C.head, 0.75), w: 3 });
    });

    // stop 2: the home router, with three devices wired up into it; it stays as one node of the internet
    const rx = c1.x, ry = 790;
    const routerA = K.io(t, tRouter, 0.5, 'out') * (1 - K.io(t, T[3] - 0.3, 0.7));
    if (routerA > 0) K.layer(routerA, () => {
      g.save();
      K.line(rx - 26, ry - 18, rx - 34, ry - 50, { color: C.head, w: 3.5 });
      K.line(rx + 26, ry - 18, rx + 34, ry - 50, { color: C.head, w: 3.5 });
      K.rr(rx - 58, ry - 20, 116, 42, 10); g.fillStyle = K.rgba(C.page, 0.9); g.fill();
      g.strokeStyle = C.head; g.lineWidth = 3; g.stroke();
      for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(rx - 24 + j * 24, ry + 1, 4, 0, 7); g.fillStyle = C.head; g.fill(); }
      g.restore();
    });
    const devA = 1 - K.io(t, T[2] + 0.6, 0.8);
    if (devA > 0 && t > tDevice - 0.1) K.layer(devA, () => {
      const devs = [[rx - 160, 878, 'laptop'], [rx, 888, 'phone'], [rx + 160, 878, 'tablet']];
      devs.forEach(([dx, dy, kind], j) => {
        const k = K.io(t, tDevice + j * 0.22, 0.5, 'out'); if (k <= 0) return;
        K.layer(k, () => {
          const top = dy - (kind === 'phone' ? 30 : 28), ex = rx + (j - 1) * 30;
          const lk = K.io(t, tDevice + 0.3 + j * 0.22, 0.6);
          if (lk > 0) K.line(dx, top, K.lerp(dx, ex, lk), K.lerp(top, ry + 24, lk), { color: C.paper, w: 2.5, alpha: 0.6, dash: [6, 7] });
          if (kind === 'laptop') K.icon('laptop', dx, dy, 56, { color: C.paper, w: 3, alpha: 0.75 });
          else {
            const w = kind === 'phone' ? 28 : 46, h = kind === 'phone' ? 48 : 40;
            g.save(); g.globalAlpha *= 0.75; K.rr(dx - w / 2, dy - h / 2, w, h, 6); g.strokeStyle = C.paper; g.lineWidth = 3; g.stroke(); g.restore();
          }
          // a small request from each device travels up the wire into the router
          const u = K.io(t, tThrough - 0.3 + j * 0.25, M.motion.travel);
          if (u > 0 && u < 1) M.message(K.lerp(dx, ex, u), K.lerp(top, ry + 14, u), { s: 30, alpha: Math.sin(Math.PI * u) });
        });
      });
    });

    // stop 3: networks joined to other networks (the home router is one of them); on "Nobody owns" each gets its own owner
    const netA = 1 - K.io(t, T[3] - 0.3, 0.7);
    if (netA > 0 && t > tNets - 0.1) K.layer(netA, () => {
      const N = [[790, 772], [890, 872], [970, 770], [1060, 872], [1110, 768]];
      const at = (j) => tNets + j * 0.42;
      const P = (j) => (j < 0 ? { x: rx + 58, y: ry } : { x: N[j][0], y: N[j][1] });
      const links = [[-1, 0], [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4]];
      const sh = (q, p) => { const dx = p.x - q.x, dy = p.y - q.y, L = Math.hypot(dx, dy) || 1; return { x: q.x + dx / L * 32, y: q.y + dy / L * 26 }; };
      links.forEach(([a, b]) => {
        const k = K.io(t, Math.max(at(Math.max(a, 0)), at(b)) + 0.2, 0.5); if (k <= 0) return;
        const pa = P(a), pb = P(b), A = a < 0 ? pa : sh(pa, pb), B = sh(pb, pa);
        K.line(A.x, A.y, K.lerp(A.x, B.x, k), K.lerp(A.y, B.y, k), { color: C.paper, w: 2, alpha: 0.45, dash: [5, 7] });
      });
      const owners = ['A', 'B', 'C', 'D', 'E'];
      N.forEach(([x, y], j) => {
        const k = K.io(t, at(j), 0.5, 'out'); if (k <= 0) return;
        K.layer(k, () => K.icon('cloud', x, y + (1 - k) * 12, 58, { color: C.paper, w: 3, alpha: 0.8 }));
        const ok = K.io(t, tNobody + j * 0.18, 0.45, 'out'); if (ok <= 0) return;
        K.layer(ok, () => {
          const bx = x + 32, by = y - 30, r = 19;
          K.card(bx - r, by - r, 2 * r, 2 * r, { r, fill: C.tile, stroke: C.line2, shadow: false, lw: 2 });
          K.text(owners[j], bx, by + 9, { font: 'mono', size: 26, weight: 600, color: C.body, align: 'center' });
        });
      });
    });

    // stop 4: three example services, staggered on their words
    const pw = pills.map(([s]) => K.measure(s, { size: 26, font: 'ui', weight: 600 }) + 26 * 1.6), gapW = 22;
    let px = c3.x - (pw.reduce((a, b) => a + b, 0) + gapW * (pw.length - 1)) / 2;
    pills.forEach(([s, at], j) => {
      const cx = px + pw[j] / 2; px += pw[j] + gapW;
      const k = K.io(t, at, 0.5, 'out'); if (k <= 0) return;
      K.layer(k, () => K.pill(s, cx, 760 + (1 - k) * 16, { size: 26 }));
    });

    // stop 4's door: an open door on the left (incoming) edge, light spilling out
    const dk = K.io(t, tDoor - 0.05, 0.6) * endOut;
    if (dk > 0) K.layer(dk, () => {
      const fx0 = c3.l + 18, fw = 30, fh = 50, fy0 = c3.y - fh / 2 + 4;
      K.glow(fx0 + fw / 2, fy0 + fh / 2, 46, C.head, 0.22);
      g.save();
      g.fillStyle = K.rgba(C.head, 0.22); g.fillRect(fx0, fy0, fw, fh);
      g.strokeStyle = C.head; g.lineWidth = 2.5; g.lineJoin = 'round';
      g.strokeRect(fx0, fy0, fw, fh);
      const sw = 13 * K.io(t, tDoor + 0.1, 0.6);           // the leaf, swung open toward the arriving road
      g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(fx0 - sw, fy0 + 6); g.lineTo(fx0 - sw, fy0 + fh + 6); g.lineTo(fx0, fy0 + fh); g.closePath();
      g.fillStyle = C.tile; g.fill(); g.stroke();
      g.restore();
    });

    // stop 5 lives inside a service: a bracket joins stops 4 and 5, and a small model tucks into the services card
    const bk0 = K.io(t, tInside - 0.1, 0.7), bk = bk0 * endOut;
    if (bk > 0) K.layer(bk, () => {
      const by = c3.t - 22, x1 = c3.l + 20, x2 = c4.r - 20, mid = (x1 + x2) / 2, half = (x2 - x1) / 2 * bk0;
      g.save(); g.strokeStyle = K.rgba(C.head, 0.8); g.lineWidth = 2.5; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(mid - half, by + 14); g.lineTo(mid - half, by); g.lineTo(mid + half, by); g.lineTo(mid + half, by + 14);
      g.stroke();
      g.beginPath(); g.moveTo(mid, by); g.lineTo(mid, by - 10); g.stroke();
      g.restore();
    });
    const mk = K.io(t, tInside + 0.2, 0.6, 'out') * endOut;
    if (mk > 0) K.layer(mk, () => {
      const p = c3.park;
      K.glow(p.x - 4, p.y + 6, 40, C.head, 0.25);
      M.brain(p.x - 4, p.y + 6, 36 * (0.8 + 0.2 * mk), { color: C.head, w: 2.4 });
    });
  });
});
