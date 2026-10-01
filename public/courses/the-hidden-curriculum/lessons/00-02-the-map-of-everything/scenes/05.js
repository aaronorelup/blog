// 05 — Every district on the road
// The road eases up and shrinks (std → shelf); under it the course's districts land as shelves, each on
// the stops it belongs to: Machine · Code on stop 1, History straddling stop 1 (git) and stop 4 (GitHub),
// the Network along the road itself (APIs where the road meets the doors), Trust at the services' door,
// and Shipping under Trust in the services column, linked to "your app", which travels the road and
// docks at stop 4 (this scene's one 'back'). The AI column stays empty: AI is the Lanterns, not a district.
SCENE('05', (t, S) => {
  const C = K.C, L = M.layout;
  K.bg();

  // ---- times (beats land on the spoken word)
  const tShrink = 0.3;                                      // "Now the districts land on the road."
  const tMachine = S.cue('machine', 2.24);
  const tComputer = S.find('computer', 0, tMachine + 1.64); // "...live on your computer"
  const tHistory = S.cue('history', 8.82);
  const tGit = S.find(/^git$/i, 0, tHistory + 2.08);
  const tGitHub = S.find('GitHub', 0, tHistory + 4.93);
  const tNetwork = S.cue('network', 16.36);
  const tRoadWord = S.find(/^road/i, 0, tNetwork + 0.98);   // "The Network is the road"
  const tApi = S.find(/^A$/, 0, tNetwork + 4.48);           // "A P Is"
  const tTrust = S.cue('trust', 24.67);
  const tDoors = S.find('doors', 0, tTrust + 0.92);
  const tShip = S.cue('shipping', 29.73);
  const tBecome = S.find('become', 0, tShip + 3.67);

  // ---- the road: std → shelf, then it stays put
  const gm = M.lerpGeom('std', 'shelf', K.io(t, tShrink, 0.8));
  const cards = gm.cards, under = (i) => cards[i].b + 14;

  // the Network is the road itself: the lane warms gold under the cards (drawn before the road)
  const laneK = K.io(t, tRoadWord - 0.2, 0.7);
  if (laneK > 0) {
    K.line(gm.xs[0], gm.y, gm.xs[4], gm.y, { color: C.head, w: 8, alpha: 0.42 * laneK });
    K.glow(gm.xs[2], gm.y, 640, C.head, 0.06 * laneK);
  }

  M.road(t, {
    geom: gm,
    pulse: (i) => [
      M.bump(t, tComputer) + M.bump(t, tGit + 0.1),                           // stop 1: Machine, git
      M.bump(t, tRoadWord),                                                   // stop 2: the road
      M.bump(t, tRoadWord + 0.25),                                            // stop 3
      M.bump(t, tGitHub + 0.1) + M.bump(t, tDoors) + M.bump(t, tBecome, 1.1), // stop 4: GitHub, door, become one
      0,
    ][i],
  });

  // ---- shelves. Three rows so both of stop 4's districts (Trust, Shipping) stack in the services column and
  // the AI column stays empty (AI is the Lanterns, never a district). Rows are tighter than M.layout.shelves.
  const A = 500, B = 676, Cr = 800;                          // row A, History row, Shipping row
  const stem = (x, k, top = A) => {                          // same stem + cap as M.shelf's bracket
    if (k <= 0) return;
    const ey = K.lerp(top, under(0), k), cap = 22 * K.seg(k, 0.7, 1);
    K.line(x, top, x, ey, { color: C.head, w: 2.5 });
    K.line(x - cap, ey, x + cap, ey, { color: C.head, w: 2.5 });
  };
  const col4 = { x0: 1165, x1: 1455 }, c3 = cards[3];

  // Machine · Code on stop 1, with its bracket rising to the card
  M.shelf(115, 405, A, 'The Machine · The Code', '01–07', {
    h: 150, k: K.io(t, tMachine, 0.6), bracket: K.io(t, tMachine + 0.35, 0.6), toY: under(0), stemX: cards[0].x,
  });

  // History spans stop 1 to stop 4: git on stop 1's column, GitHub on stop 4's
  const histK = K.io(t, tHistory, 0.6);
  if (histK > 0) {
    M.shelf(115, 1455, B, 'The History · 08', null, { k: histK, h: 92 });
    const dy = (1 - histK) * 24, py = B + 46 + dy;
    const gitK = K.io(t, tGit, 0.5), hubK = K.io(t, tGitHub, 0.5);
    if (gitK > 0) K.pill('git', cards[0].x, py + (1 - gitK) * 14, { size: 28, font: 'mono', color: C.head, stroke: K.rgba(C.head, 0.6), alpha: gitK * histK });
    if (hubK > 0) K.pill('GitHub', c3.x, py + (1 - hubK) * 14, { size: 28, color: C.head, stroke: K.rgba(C.head, 0.6), alpha: hubK * histK });
  }

  // Network under stops 2–3, a stem to each
  const netK = K.io(t, tNetwork, 0.6);
  if (netK > 0) {
    K.layer(netK, () => { stem(cards[1].x, K.io(t, tNetwork + 0.35, 0.6)); stem(cards[2].x, K.io(t, tNetwork + 0.5, 0.6)); });
    M.shelf(465, 1105, A, 'The Network', '09–13', { k: netK, h: 112 });
  }
  // APIs: a pill above the internet→services arrow, with a short dotted drop onto that arrow (the road meeting
  // the services' door). Nothing runs through the pill.
  const gp = M.gap(gm, 2), apiK = K.io(t, tApi, 0.6);
  const apiX = (cards[2].r + c3.l) / 2, apiY = gp.y - 62, tickX = gp.x1 + 18;   // inside the gap, clear of the app's lane
  if (apiK > 0) {
    K.line(tickX, apiY + 22, tickX, K.lerp(apiY + 22, gp.y - 6, K.seg(apiK, 0.2, 1)), { color: C.soft, w: 2.5, alpha: 0.6, dash: [2, 7] });
    K.pill('APIs', apiX, apiY + (1 - apiK) * 12, { size: 26, alpha: apiK });
  }

  // Trust: a lock sits on the end of the internet→services arrow, just outside the door; the shelf's tee rises
  // straight from services' bottom centre ("guards the doors of services")
  const lockK = K.io(t, tTrust, 0.5), lockS = 52, lockX = gp.x2 - lockS / 2, lockY = gp.y;
  const trustK = K.io(t, tTrust + 0.15, 0.6);
  if (trustK > 0) {
    K.layer(trustK, () => stem(c3.x, K.io(t, tDoors - 0.1, 0.6)));
    M.shelf(col4.x0, col4.x1, A, 'Trust', '14–16', { k: trustK, h: 112 });
    // keys · logins · secrets, each on its spoken word
    const words = [['keys', S.find('keys', 0, tTrust + 2.28)], ['logins', S.find('logins', 0, tTrust + 3.14)], ['secrets', S.find(/^secrets/i, 0, tTrust + 3.99)]];
    const st = { ...M.type.detail }, sep = '  ·  ';
    const ws = words.map(([w]) => K.measure(w, st)), sw = K.measure(sep, st);
    let x = (col4.x0 + col4.x1) / 2 - (ws[0] + ws[1] + ws[2] + 2 * sw) / 2;
    words.forEach(([w, at], j) => {
      const k = K.io(t, at - 0.05, 0.4);
      if (k > 0) {
        K.text(w, x, A + 112 + 40 + (1 - k) * 8, { ...st, align: 'left', alpha: k });
        if (j > 0) K.text(sep, x - sw, A + 112 + 40, { ...st, align: 'left', alpha: k });
      }
      x += ws[j] + sw;
    });
  }
  if (lockK > 0) K.layer(lockK, () => K.iconTile('lock', lockX, lockY + (1 - lockK) * 10, lockS, { color: C.head, stroke: K.rgba(C.head, 0.7) }));

  // Shipping: its shelf at the bottom of the services column; "your app" travels the road and docks above
  // stop 4, then a gold line runs from the app through services down the column's right side to Shipping.
  const shipK = K.io(t, tShip, 0.6), shipH = 112;
  const tVisit = S.find(/^services/i, 1, tShip + 2.79);      // "...only visiting services"
  const linkK = K.io(t, tVisit, 0.8);
  const becomeK = K.io(t, tBecome, 0.8);
  if (becomeK > 0) K.glow((col4.x0 + col4.x1) / 2, Cr + shipH / 2, 200, C.head, 0.12 * becomeK);
  const aw = 210, ah = 64, ay = cards[0].t - 48 - ah / 2;   // "your app" rides 30 px clear of the card tops
  if (linkK > 0) {                                           // your app → Shipping: one dotted line down the right,
    // outside the History bar, broken where it crosses the services→AI arrow so it never reads as joining the road
    const gx = 1488, xa = c3.x + aw / 2, ye = Cr + shipH / 2;
    const pts = [[xa, ay], [gx, ay], [gx, ye], [col4.x1 + 4, ye]];
    const lens = pts.slice(1).map((q, j) => Math.hypot(q[0] - pts[j][0], q[1] - pts[j][1])), tot = lens.reduce((x, y) => x + y);
    let r = linkK * tot;
    const o = { color: C.head, w: 2.5, alpha: 0.75, dash: [3, 9] };
    const ln = (x1, y1, x2, y2) => {                         // vertical runs skip the arrow band (y ± 18)
      if (x1 === x2 && Math.min(y1, y2) < gm.y + 18 && Math.max(y1, y2) > gm.y - 18) {
        if (y2 > gm.y - 18) K.line(x1, y1, x1, Math.min(y2, gm.y - 18), o);
        if (y2 > gm.y + 18) K.line(x1, gm.y + 18, x1, y2, o);
      } else K.line(x1, y1, x2, y2, o);
    };
    lens.forEach((len, j) => {
      const f = Math.min(1, r / len); r -= len;
      if (f > 0) ln(pts[j][0], pts[j][1], K.lerp(pts[j][0], pts[j + 1][0], f), K.lerp(pts[j][1], pts[j + 1][1], f));
    });
  }
  M.shelf(col4.x0, col4.x1, Cr, 'Shipping', '17–20', { k: shipK, h: shipH });
  const appIn = K.io(t, tShip + 0.3, 0.4);
  if (appIn > 0) {
    const travel = K.io(t, tShip + 0.5, 1.8, 'back');        // the scene's one overshoot, on landing
    const ax = K.lerp(cards[0].x, c3.x, travel);
    const docked = becomeK;                                   // "...and become one": it lights like a stop
    const dockK = K.io(t, tShip + 2.1, 0.4);
    K.layer(appIn, () => {
      if (dockK > 0) K.line(c3.x, ay + ah / 2, c3.x, K.lerp(ay + ah / 2, c3.t, dockK), { color: C.head, w: 2.5 });
      if (docked > 0) K.glow(ax, ay, 170, C.head, 0.16 * docked);
      K.card(ax - aw / 2, ay - ah / 2, aw, ah, { r: 18, stroke: K.mixColor(C.line2, C.head, 0.3 + 0.7 * docked), lw: 2, glow: docked * 0.8 });
      K.icon('laptop', ax - 58, ay - 1, 36, { color: K.mixColor(C.soft, C.head, 0.4 + 0.6 * docked), w: 2.2 });
      K.text('your app', ax + 22, ay + 9, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
    });
  }
});
