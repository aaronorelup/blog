/* 07 — One coding agent, many doors
   The workshop (Claude Code) gets five doors that all lead to one bench (one loop), the bench copies into three
   places (Local / Cloud / Remote Control), the desktop app's picker (real `local` + `envs` shots) adds the WSL guest
   room and an SSH line to another machine, and Mollick's second axis ("what it shows you") closes the scene.
   One camera for the whole street: VIEW(t) gives {cx, cy, z} (world point at screen centre, scale) and the street is
   drawn with M.street({x, y, s}) so its own labels keep their 26 px rule; everything else hangs on world anchors. */
SCENE('07', (t, S) => {
  const C = K.C, M = window.M;
  K.bg();

  // ------------------------------------------------------------ beats (all from cues / spoken words)
  const cWork = S.cue('workshop', 0), cWin = S.cue('windows', 3.96), cEnv = S.cue('envs', 9.8);
  const cPick = S.cue('picker', 23.35), cSsh = S.cue('ssh', 31.94), cExp = S.cue('expose', 37.15);
  const wDoors = S.find('many', 0, 3.06);
  const wordT = [S.find('terminal', 0, 4.13), S.find('desktop', 0, 4.99), S.find('code', 1, 6.22), S.find('browser', 0, 7.63), S.find('Slack', 0, 8.86)];
  const wLocal = S.find('Local', 0, 11.55), wLocal2 = S.find('Local', 1, 24.79), wCloud = S.find('Cloud', 0, 14.98), wRemote = S.find('Remote', 0, 19.81);
  const wCloud2 = S.find('Cloud', 1, 25.68), wWslList = S.find('W', 0, 26.96, { whole: true }), wWsl = S.find('W', 1, 28.42, { whole: true }), wWhere = S.find('where', 0, 34.55);
  const wCodex = S.find('Codex', 0, 40.35), wExpose = S.find('expose', 0, 41.56), wCowork = S.find('Cowork', 0, 43.38);
  const wResult = S.find('finished', 0, 45.29);

  // ------------------------------------------------------------ the camera over the street (world = wide street px)
  // V1 is capped so the roof stays under the badge band (y >= 130) and the house's left wall at x >= 80;
  // V3 parks the whole house (with its guest room) small at top left, fully on canvas, beside the picker shot,
  // and stays there for the Mollick beat (the vendor building comes back between house and card).
  const V0 = { cx: 960, cy: 540, z: 1 };            // the wide street (06's exit)
  const V1 = { cx: 880, cy: 520, z: 1.08 };          // onto the workshop: roof top y 140, left wall x 129, floor y 896
  const V2 = { cx: 965, cy: 353, z: 0.68 };         // whole street low, a card band on top
  const V3 = { cx: 1513, cy: 779, z: 0.62 };        // house x 90-673 / y 150-584, guest to x 778; right of x 840 free
  const keys = [[cWork + 0.2, 1.4, V1], [cEnv - 0.1, 1.3, V2], [cPick - 0.15, 1.05, V3]];
  let v = { ...V0 };
  for (const [at, d, n] of keys) {
    const k = K.io(t, at, d, 'io');
    if (k <= 0) break;
    v = { cx: K.lerp(v.cx, n.cx, k), cy: K.lerp(v.cy, n.cy, k), z: Math.exp(K.lerp(Math.log(v.z), Math.log(n.z), k)) };
  }
  const P = (wx, wy) => [960 + (wx - v.cx) * v.z, 540 + (wy - v.cy) * v.z];
  const W3 = (sx, sy) => [V3.cx + (sx - 960) / V3.z, V3.cy + (sy - 540) / V3.z];   // a V3 screen point as a world point
  const close = K.clamp((v.z - 1.02) / 0.05);                                      // 1 only while the camera is on the workshop

  // ------------------------------------------------------------ the street (continues 06: office across town, merged door)
  // the vendor's building, road and hatch path leave while the camera is close and while the picker shot is up
  const pickPh = K.io(t, cPick - 0.55, 0.45) * (1 - K.io(t, cExp + 0.2, 0.6));
  const vendA = (1 - close) * (1 - pickPh);
  const guestK = K.io(t, wWsl, 0.9, 'out');
  const codeLit = 0.8 + 0.2 * K.io(t, cWork + 0.3, 0.8) ;
  // at the small V3 scale the four folder names (26 px each) run into each other, so the house drops its own labels
  // and this scene redraws only the two that matter: the eyebrow and the merged 'Claude' door
  const small = v.z < 0.7;
  const street = M.street(t, {
    x: 960 - v.cx * v.z, y: 540 - v.cy * v.z, s: v.z,
    house: { labels: small ? false : undefined, office: 0, merge: 1, hatch: 0.35, guest: guestK, rooms: { chat: 0.8 - 0.3 * K.io(t, cWork + 0.3, 0.8), cowork: 0.8, code: codeLit } },
    vendor: { office: 1, officeLit: 0.8, alpha: vendA },
    road: { alpha: vendA, label: vendA > 0.9 ? undefined : false },
  });
  const H = street.house, Vd = street.vendor;
  if (vendA > 0.002) K.layer(0.45 * vendA, () => M.hatchLine(H, Vd, { on: 1 }));
  if (small) {
    const [ex, ey] = H.at(M.L.house.w / 2, -38);
    K.eyebrow('YOUR COMPUTER', ex, ey, { ...M.T.eyebrow, size: 24, color: C.head, align: 'center' });
    const dx = H.door.x, dy = H.door.y;
    K.text('Claude', dx, dy + 9, { font: 'ui', weight: 600, size: 26, color: C.page, align: 'center' });
  }

  // ------------------------------------------------------------ one loop: the worker at the bench, a loop around it
  const bench = [890, 676], spot = [890, 566];
  const loopK = K.io(t, cWork + 0.6, 0.7, 'out');
  {
    const [sx, sy] = P(...spot), ws = 96 * Math.min(1.35, v.z);
    if (loopK > 0) K.layer(loopK * 0.85, () => K.at(sx, sy - 2, 1, t * 0.5, () => K.icon('restart', 0, 0, ws * 1.9, { color: C.head, w: 2.6, alpha: 0.55 })));
    M.worker(t, sx, sy, { s: ws, glow: 0.4 + 0.4 * loopK });
    // the label 'one loop' under the bench, only while the camera is close
    const la = loopK * close;
    if (la > 0) { const [lx, ly] = P(890, 790); M.pillL('one loop', lx, ly, { align: 'center', size: 30, color: C.page, fill: C.head, stroke: C.head, icon: 'restart', alpha: la }); }
  }

  // ------------------------------------------------------------ five doors, all leading to the one bench
  const doors = [['terminal', 'terminal', 481, 410], ['desktop app', 'laptop', 451, 492], ['code editor', 'code', 441, 575], ['browser', 'globe', 451, 658], ['Slack', 'chat', 481, 740]];
  doors.forEach(([name, icon, wx, wy], i) => {
    const ek = K.io(t, wDoors - 0.3 + i * 0.12, 0.5, 'out');           // the door appears (icon tile)
    if (ek <= 0) return;
    const lk = K.io(t, wordT[i] - 0.05, 0.4, 'out') * close;   // its name, only while close
    const [x0, y0] = P(wx, wy), ts = 56 * Math.min(1, v.z);
    const pw = K.measure(name, { font: 'ui', size: 30, weight: 600 }) + 30 * 1.45 + 30 * 1.6;
    const right = K.lerp(x0 + ts, x0 + pw, lk);
    // the arrow to the bench (world end point, so it follows the camera)
    const [ex, ey] = P(bench[0] - 98, bench[1] - 40 + (i - 2) * 16);
    K.arrow(right + 8, y0, ex, ey, { k: K.io(t, wDoors + i * 0.12, 0.7), color: C.head, w: 2.5 * Math.min(1, v.z), dash: [3, 9], bend: (i - 2) * -14, alpha: 0.25 + 0.6 * K.clamp((v.z - 0.8) / 0.4) });
    K.layer(ek * (1 - lk), () => K.iconTile(icon, x0 + ts / 2, y0, ts, { color: C.head, r: 12 }));
    if (lk > 0) K.layer(lk, () => M.pillL(name, x0, y0, { size: 30, icon, iconColor: C.head, color: C.strong, stroke: K.mixColor(C.line2, C.head, 0.6) }));
  });

  // card: one loop, every interface (S101)
  const card1 = K.env(t, cWin + 0.2, cEnv - 0.2, 0.5);
  // the card is as wide as its footer pill needs (M.dated does not widen itself), right edge on 1820
  const c1w = Math.max(520, Math.ceil(K.measure(M.ASOF, { font: 'mono', size: 26, weight: 400 })) + 140);
  if (card1 > 0) K.layer(card1, () => M.dated(1820 - c1w, 300, c1w, { eyebrow: 'Anthropic · How Claude Code works · read 2026-10-14', body: 'the underlying agentic loop is identical', quote: true, footer: true }));

  // ------------------------------------------------------------ the bench moves: Local / Cloud / Remote Control
  const envOn = K.env(t, cEnv + 0.6, cPick - 0.35, 0.45);
  // Local: the workshop itself, outlined
  const lo = K.io(t, wLocal - 0.1, 0.8) * K.env(t, -1, cPick - 0.35, 0.45);
  if (lo > 0) {
    const r = H.rooms.code;
    M.outline(r.x - 6, r.y - 6, r.w + 12, r.h + 12, 18, lo, { color: C.head, w: 3.5 });
    const [dx, dy] = P(890, 800);
    if (v.z < 0.9) M.pillL('Local', dx, dy, { align: 'center', size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: lo * envOn });
  }
  // Cloud: a dashed copy of the bench crosses the road into the vendor's building (anything that crosses is a copy)
  const ck = K.io(t, wCloud + 0.1, 1.3, 'io');
  if (ck > 0) {
    const sp = Vd.spare;
    const path = [P(890, 612), P(1000, 830), P(1150, 860), P(1330, 860), [sp.cx, sp.cy]];
    const [px, py] = M.along(path, ck), sc = K.lerp(0.35, 1, K.ease.io(ck)) * v.z;
    const ka = Math.min(1, ck * 4) * vendA;
    K.layer(ka, () => K.at(px, py, sc, 0, () => M.room('code', -202, -113, 404, 226, { dashed: true, lit: 1, door: ck >= 1 && v.z < 0.9 ? 'Cloud' : null, doorSize: 26 / v.z })));
  }
  // Remote Control: your machine, steered from a browser outside
  const rk = K.io(t, wRemote, 0.6, 'out') * K.env(t, -1, cPick - 0.35, 0.4);
  if (rk > 0) {
    const [bx, by] = P(1120, 640), bw = 190 * v.z, bh = 130 * v.z;
    K.layer(rk, () => {
      K.win(bx, by, bw, bh, { kind: 'browser', focus: true });
      K.icon('globe', bx + bw / 2, by + bh * 0.6, 50 * v.z, { color: C.head, w: 2.6 });
      if (v.z < 0.9) M.pillL('Remote Control', bx + bw / 2, by - 30, { align: 'center', size: 26, color: C.page, fill: C.head, stroke: C.head });
    });
    const [ex, ey] = P(bench[0] + 70, bench[1] - 30);
    K.arrow(bx - 6, by + bh * 0.6, ex, ey, { k: K.io(t, wRemote + 0.3, 0.7), color: C.head, w: 3, dash: [3, 9], bend: 30 });
  }
  // the source card on top: three columns, each on its word
  if (envOn > 0) K.layer(envOn, () => {
    const x = 110, y = 130, w = 1700, h = 246;
    K.card(x, y, w, h, { r: 24, stroke: C.line2, lw: 1.5 });
    K.text('Anthropic · How Claude Code works · read 2026-10-14', x + 32, y + 44, { ...M.T.eyebrow, color: C.head });
    const cols = [['Local', 'Full access to your files, tools, and environment', wLocal],
      ['Cloud', 'Anthropic-managed VMs, or self-hosted environments your organization operates', wCloud],
      ['Remote Control', 'Your machine, controlled from a browser', wRemote]];
    cols.forEach(([nm, q, at], i) => {
      const ck2 = K.io(t, at - 0.1, 0.5, 'out');
      if (ck2 <= 0) return;
      const cx = x + 32 + i * 556;
      K.layer(ck2, () => {
        if (i) K.line(cx - 24, y + 72, cx - 24, y + h - 24, { color: C.line2, w: 1.5 });
        K.text(nm, cx, y + 92, { font: 'ui', weight: 700, size: 30, color: C.head });
        K.wrap('“' + q + '”', 500, { ...M.T.read }).forEach((ln, j) => K.text(ln, cx, y + 134 + j * 41, { ...M.T.read, color: C.strong }));
      });
    });
  });

  // ------------------------------------------------------------ the desktop app's picker: real docs page
  // The `local` and `envs` shots are one page at two scroll positions (the recorded scroll between them gives the
  // offset), so they are joined into one continuous page strip, never crossfaded. First the whole Local / Cloud /
  // SSH / WSL run is framed at once and a gold box steps through the four items on their spoken words; on the second
  // sentence ("W S L is a Linux guest room") the camera pushes straight in on the list and the box stays on WSL,
  // then moves up to SSH on [[ssh]]. Every box hangs on the recorded marks.
  const shotA = K.env(t, cPick + 0.3, cExp, 0.45);
  if (shotA > 0) {
    const cap = K.capture('desktop-docs');
    const ev = cap && cap.events ? cap.events : [];
    const tL = K.captureAt('desktop-docs', 'local', 5.88), tE = K.captureAt('desktop-docs', 'envs', 8.37);
    const off = ev.filter(e => e.kind === 'scroll' && e.t > tL && e.t < tE).reduce((a, e) => a + e.dy, 0) || 498;
    const lb = K.captureBox('desktop-docs', 'local', 'line', [767, 380, 1083, 105]);
    const eb0 = K.captureBox('desktop-docs', 'envs', 'list', [767, 289, 1083, 502]);
    const eb = [eb0[0], eb0[1] + off, eb0[2], eb0[3]];                        // the list in page (local-shot) px
    const ib = K.captureBox('desktop-docs', 'envs', 'intro', [767, 199, 1083, 52]);
    // the three bullets as fractions of the measured list box: Cloud, SSH, WSL
    const cloudB = [eb[0], eb[1], eb[2], eb[3] * 0.2], sshB = [eb[0], eb[1] + eb[3] * 0.22, eb[2], eb[3] * 0.55], wslB = [eb[0], eb[1] + eb[3] * 0.78, eb[2], eb[3] * 0.22];
    const items = [lb, cloudB, sshB, wslB];
    const WR = [830, 170, 1010, 740];
    const seamP = ib[1] + off + ib[3] + 20;                                   // a blank row under 'You can also select:' (both shots hold it)
    const topCut = 212;                                                       // under the docs' sticky header in both shots
    const [IW, IH] = K.mediaSize('desktop-docs/envs') || [1920, 1080];
    // the camera inside the window: page rect [x, y, w] (h follows the content's aspect)
    const crW = WR[2], crH = WR[3] - 50;
    const viewA = (() => { const y0 = lb[1] - 28, y1 = eb[1] + eb[3] + 10, h = y1 - y0, w = h * crW / crH; return [Math.min(lb[0] - 40, IW - w), y0, w]; })();
    const viewB = (() => { const w = (eb[2] + 80), h = w * crH / crW, y1 = off + Math.min(IH - 170, eb0[1] + eb0[3] + 125); return [eb[0] - 40, Math.min(y1 - h, eb[1] - 60), w]; })();
    const push = K.io(t, wWsl - 0.15, 1.0, 'io');
    const vw = Math.exp(K.lerp(Math.log(viewA[2]), Math.log(viewB[2]), push));
    const vx = K.lerp(viewA[0], viewB[0], push), vy = K.lerp(viewA[1], viewB[1], push);
    K.layer(shotA, () => {
      K.text('Anthropic docs · desktop quickstart · read 2026-10-14', WR[0], WR[1] - 16, { ...M.T.eyebrow, color: C.head });
      const cr = K.win(WR[0], WR[1], WR[2], WR[3], { kind: 'browser', url: 'code.claude.com/docs/en/desktop-quickstart', compact: true });
      const sc = cr.w / vw, at = (px, py) => [cr.x + (px - vx) * sc, cr.y + (py - vy) * sc];
      const g = K.ctx(); g.save(); g.beginPath(); g.rect(cr.x, cr.y, cr.w, cr.h); g.clip();
      // the page strip: the local shot above the seam, the envs shot below it (identical pixels around the seam)
      const strip = (name, r0, r1, dy) => {                                   // source rows r0..r1 of a shot, page y = row + dy
        const [x0, y0] = at(0, r0 + dy), [x1, y1] = at(IW, r1 + dy);
        K.image(name, x0, y0, x1 - x0, y1 - y0, { crop: [0, r0, IW, r1 - r0], fit: 'cover', r: 0 });
      };
      strip('desktop-docs/local', topCut, seamP, 0);
      strip('desktop-docs/envs', seamP - off, IH, off);
      g.restore();
      // the gold box steps Local -> Cloud -> SSH -> WSL on the words, holds WSL through the guest-room sentence, then SSH
      const stops = [[wLocal2 - 0.08, 0], [wCloud2 - 0.08, 1], [S.find('S', 0, 26.15, { whole: true }) - 0.08, 2], [wWslList - 0.08, 3], [cSsh - 0.1, 2]];
      let cur = items[0];
      for (let i = 0; i < stops.length; i++) {
        const k = K.io(t, stops[i][0], 0.28, 'io');
        if (k <= 0) break;
        const nb = items[stops[i][1]];
        cur = i === 0 ? nb : cur.map((v0, j) => K.lerp(v0, nb[j], k));
      }
      const hk = K.io(t, wLocal2 - 0.2, 0.3, 'out');
      if (hk > 0) {
        const [x0, y0] = at(cur[0] - 12, cur[1] - 6), [x1, y1] = at(cur[0] + cur[2] + 12, cur[1] + cur[3] + 6);
        const bx0 = Math.max(cr.x + 4, x0), bx1 = Math.min(cr.x + cr.w - 4, x1), by0 = Math.max(cr.y + 4, y0), by1 = Math.min(cr.y + cr.h - 4, y1);
        g.save(); g.globalAlpha *= 0.42 * hk; g.fillStyle = C.page;
        g.fillRect(cr.x, cr.y, cr.w, Math.max(0, by0 - cr.y)); g.fillRect(cr.x, by1, cr.w, Math.max(0, cr.y + cr.h - by1));
        g.restore();
        M.outline(bx0, by0, bx1 - bx0, by1 - by0, 10, hk, { color: C.head, w: 3 });
      }
    });
  }
  // the WSL guest room's words, under the annex (clear of the road band and of the shot at x 840)
  const outX = 1 - K.io(t, cExp - 0.1, 0.5);                                 // WSL / SSH notes leave before Mollick's card
  const gl = K.io(t, wWsl + 0.5, 0.5, 'out') * K.clamp((t - cPick - 0.6) / 0.4) * outX;
  if (gl > 0) {
    const g = H.guest, ly = g.y + g.h + 62;
    K.layer(gl, () => {
      K.text('WSL', g.cx, ly, { font: 'ui', weight: 700, size: 30, color: C.head, align: 'center' });
      K.text('Linux side,', g.cx, ly + 36, { ...M.T.label, color: C.strong, align: 'center' });
      K.text('native paths', g.cx, ly + 68, { ...M.T.label, color: C.strong, align: 'center' });
    });
  }

  // ------------------------------------------------------------ SSH: a line to another machine (bottom left, under the house)
  const sk = K.io(t, cSsh, 1.1);
  if (sk > 0 && outX > 0) K.layer(outX, () => {
    const srv = W3(150, 800);
    const pts = [W3(545, 500), W3(565, 610), W3(330, 700), W3(160, 765)].map(p => P(...p));
    K.path(pts, { k: sk, color: C.head, w: 3.5 * Math.min(1, v.z / 0.62), dash: [10, 9], headSize: 16, tension: 0.4 });
    const tk = K.io(t, cSsh + 0.8, 0.5, 'out');
    const [sx, sy] = P(...srv), ss = 56;
    if (tk > 0) K.layer(tk, () => {
      K.iconTile('server', sx, sy, ss, { color: C.head, r: 12 });
      K.text('SSH · your server, a cloud VM, a dev container', sx + 46, sy + 9, { ...M.T.label, color: C.strong });
      M.pillL('installs Claude Code there itself', sx + 46, sy + 52, { size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: K.io(t, wWhere, 0.5, 'out') });
    });
  });

  // ------------------------------------------------------------ Mollick's second axis: what it shows you
  // the card arrives whole (eyebrow, title, axis and both ends, dim); each end lights on its own words
  const ax = K.io(t, cExp + 0.3, 0.6, 'out');
  if (ax > 0) K.layer(ax, () => {
    const x = 1400, y = 150, w = 440, h = 720;
    K.card(x, y, w, h, { r: 24, stroke: C.line2, lw: 1.5 });
    const ebl = K.wrap('ETHAN MOLLICK · 2026-07-23', w - 64, M.T.eyebrow);
    ebl.forEach((ln, i) => K.text(ln, x + 32, y + 52 + i * 32, { ...M.T.eyebrow, color: C.head }));
    K.text('what it shows you', x + 32, y + 52 + ebl.length * 32 + 22, { font: 'ui', weight: 700, size: 30, color: C.strong });
    const axX = x + 40, top = y + 120 + ebl.length * 32, bot = y + h - 36;
    K.line(axX, top, axX, bot, { color: K.mixColor(C.line2, C.head, 0.4), w: 3 });
    // top: the work itself
    const tk = 0.4 + 0.6 * K.io(t, wCodex - 0.1, 0.5, 'out');
    K.layer(tk, () => {
      K.glow(axX, top + 22, 26 * tk, C.head, 0.5 * tk);
      K.text('the work itself', axX + 28, top + 32, { font: 'ui', weight: 700, size: 30, color: C.head });
      let px = axX + 28; px += M.pillL('Codex', px, top + 84, { size: 26 }) + 12; M.pillL('Claude Code', px, top + 84, { size: 26 });
      [['files changed', 'file'], ['commands run', 'terminal'], ['tests', 'check']].forEach(([s2, ic], i) => {
        const rk2 = 0.45 + 0.55 * K.io(t, wExpose + i * 0.25, 0.4, 'out');
        K.layer(rk2, () => { K.icon(ic, axX + 46, top + 150 + i * 48, 30, { color: C.body, w: 2.4 }); K.text(s2, axX + 74, top + 160 + i * 48, { font: 'ui', weight: 600, size: 28, color: C.body }); });
      });
    });
    // bottom: the finished result
    const bk = 0.4 + 0.6 * K.io(t, wCowork - 0.1, 0.5, 'out');
    K.layer(bk, () => {
      K.glow(axX, bot - 160, 26 * bk, C.head, 0.5 * bk);
      K.text('the finished result', axX + 28, bot - 150, { font: 'ui', weight: 700, size: 30, color: C.head });
      let px = axX + 28; px += M.pillL('Cowork', px, bot - 98, { size: 26 }) + 12; M.pillL('Work', px, bot - 98, { size: 26 });
      K.file(axX + 66, bot - 26, 56, { alpha: 0.35 + 0.65 * K.io(t, wResult, 0.5, 'out') });
    });
  });
  const capK = K.io(t, wResult - 0.6, 0.6, 'out');
  if (capK > 0) K.text('where it runs ≠ what it shows you', 1090, 905, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center', alpha: capK });
});
