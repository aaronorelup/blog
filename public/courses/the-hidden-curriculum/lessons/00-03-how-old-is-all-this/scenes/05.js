/* 00.03 · 05 — The ages on the road
   Opens on 04's exit frame exactly (geom 'full', gable roofs, 26 px decade labels, brackets, low ground glow,
   lantern tags hanging on their terracotta leaders), then the SAME street lifts into geom 'raised' over 0.8 s
   (M.lerpGeom, K.io): roofs, decade labels and brackets fade as it rises. The lantern tags stay in their stack and
   keep their leaders all scene: each leader bends from its tag to its year's node, so as the street shrinks the
   leader grows an elbow and the AI end never detaches from its dots (the lanterns hang straight over those dots).
   The four buildings this scene never names (MS-DOS, JavaScript, Docker, VS Code) fold up onto their nodes as the
   street lifts (show → ~0), which clears the rows for the rings later; Git waits at 0.6 for its line.
   00.02's road returns underneath (raised 24 px from 660 so everything under it ends by y 900).
   Each stop lights on its narration and the tags that built it warm up and send thin gold arrows down into it
   (one stop's arrows on screen at a time; the ~1991 arrows drop through the free b1 row then run along a lane
   above the cards). The spoken word inside the shared ~1991 tag gets a gold underline. Ages under the cards:
   "decades" (cream-muted C.body), the three service tags under card 4, "a few years" under card 5; the lantern
   tags join a short terracotta spine on the stack's right and one arrow runs down into card 5.
   "Here's where the picture breaks": street and road dim, then "a birthday, not a finish line" rises in the lane.
   On "Python and git" the other tags dim, the service tags drop to 40%, and tight stadium rings (8 px clear of
   their own pills) draw round "~1991 · web · Python · Linux" (Python underlined) and "2005 · Git", with
   "updated yearly" sitting between the two rings above the street.
   On "1950s" a terracotta dashed run leaves the street's start into a small unlit lantern over "1950s · AI research".
   On "What's new" the rings step away and the street folds to years (every tag re-hangs, lantern tags to years too),
   so the last ~4 s are calm; on "talk" the lanterns and the AI card swell once and "AI you can talk to" rises.
   Exit (last 0.8 s): leaders fade, extra lantern glow settles, ground glow eases to 06's, so the hand-over equals
   06's opening frame (raised street, year tags, lantern tags in years). */
SCENE('05', (t, S) => {
  const M = window.M, C = K.C, L5 = M.layout.s05, g = K.ctx();

  // ---- cues and spoken words (local seconds; fallbacks from the narrated timing)
  const c1 = S.cue('stop-one', 2.8), c23 = S.cue('stops-two-three', 7.65), c4 = S.cue('stop-four', 13.57);
  const c5 = S.cue('stop-five', 18.69);
  const w = (re, nth, fb) => S.find(re, nth, fb);
  const tShell = w('shell', 0, 3.88), tPython1 = w('Python', 0, 5.32), tDecades1 = w('Decades', 0, 6.33);
  const tNetwork = w('network', 0, 7.84), tInternet = w('internet', 0, 8.65);
  const tEthernet = w('Ethernet', 0, 9.47), tDNS = w(/^D$/, 0, 10.45), tWeb = w('web', 0, 11.63), tDecades2 = w('Decades', 1, 12.34);
  const tGitHub = w('GitHub', 0, 14.37), tCloud = w('Cloudflare', 0, 15.14), tStripe = w('Stripe', 0, 16.16);
  const tAI = w(/^AI$/, 0, 18.92), tNewest = w('newest', 0, 20.76), tPicture = w('picture', 0, 22.92);
  const tBirthday = w('birthday', 0, 24.98), tPython2 = w('Python', 1, 27.24), tGit = w(/^git$/, 0, 27.89);
  const tVersions = w('versions', 0, 28.94), t1950 = w('1950s', 0, 34.66), tWhats = w(/^What's$/, 0, 35.9);
  const tTalk = w('talk', 0, 37.67);
  const tOut = S.out;

  // ---- 04 → 05: the same street lifts into 'raised'. Fold to years on "What's new"; exit settles into 06's frame.
  // the street narrows a beat before it rises, so the MCP tag (which ends below the street) never crosses its far end
  const mkX = K.io(t, 0.2, 0.6, 'io'), mkY = K.io(t, 0.35, 0.65, 'io'), mk = mkY;
  const gm = { ...M.lerpGeom('full', 'raised', mkY), x0: K.lerp(M.PRESETS.full.x0, M.PRESETS.raised.x0, mkX), x1: K.lerp(M.PRESETS.full.x1, M.PRESETS.raised.x1, mkX) };
  const fold = K.io(t, tWhats + 0.25, 0.9, 'io');          // tags → years, retracted tags re-hang, all back to full
  const exitK = K.io(t, tOut - 0.85, 0.75, 'io');           // leaders leave, glows settle to 06's opening values
  const decor04 = 1 - K.io(t, 0.15, 0.45);                  // 04's roofs + 26 px decade labels, gone as the street rises
  // ground: 04's settled glow (0.12 at centre) → 06's opening glow (0.4, top-left) in the exit
  K.bg({ glow: K.lerp(0.12, 0.4, exitK), glowX: K.lerp(960, K.W * 0.24, exitK), glowY: K.lerp(560, K.H * 0.08, exitK) });

  // "Here's where the picture breaks": everything steps back a little, then the correction arrives bright
  const brk = K.io(t, tPicture, 0.5);
  const streetA = 1 - 0.3 * brk + 0.3 * K.io(t, tBirthday - 0.2, 0.6);
  const roadDim = 1 - 0.3 * brk + 0.3 * K.io(t, tWhats, 0.8);

  // ---- buildings: which matter here
  const idx = (key) => M.BUILDINGS.findIndex((b) => b.key === key);
  const UNUSED = ['msdos', 'js', 'docker', 'vscode'].map(idx), GIT = idx('git'), WEB = idx('web');
  const ringOut = K.io(t, tWhats - 0.1, 0.5);               // rings, underline and "updated yearly" step away
  const ringPy = K.io(t, tPython2, 0.7) * (1 - ringOut), ringGit = K.io(t, tGit, 0.7) * (1 - ringOut);
  const focus = K.io(t, tBirthday - 0.2, 0.6) * (1 - fold); // the birthday line: all but Python / git step back
  const retract = K.io(t, 0.3, 0.6, 'io') * (1 - fold);     // unnamed tags fold up onto their nodes, then re-hang
  const show = (i) => (UNUSED.includes(i) ? K.lerp(1, 0.06, retract) : 1);
  const itemAlpha = (i) => {
    let a = UNUSED.includes(i) ? K.lerp(1, 0.7, retract) : i === GIT ? K.lerp(1, 0.6, mk) : 1;
    if (i === GIT) a = Math.max(a, K.io(t, tGit, 0.7));
    else if (i !== WEB) a *= K.lerp(1, 0.5, focus);
    return K.lerp(a, 1, fold);
  };

  // ---- the stops' arrows: one group per stop; a group steps away when the next stop starts
  const groupEnd = [c23, c4, c5, tPicture];
  const groupA = (gi) => 1 - K.io(t, groupEnd[gi], 0.6);
  // [building, group, time its arrow draws]
  const feeds = [['unix', 0, tShell], ['web', 0, tPython1], ['ethernet', 1, tEthernet], ['dns', 1, tDNS], ['web', 1, tWeb], ['github', 2, tGitHub]];
  const tagLit = M.BUILDINGS.map(() => 0);
  feeds.forEach(([key, gi, at]) => { const i = idx(key); tagLit[i] = Math.max(tagLit[i], 0.9 * K.io(t, at - 0.1, 0.5) * groupA(gi)); });
  tagLit[WEB] = Math.max(tagLit[WEB], 0.8 * ringPy);
  tagLit[GIT] = Math.max(tagLit[GIT], 0.8 * ringGit);

  // ---- 04's brackets fade as the street lifts
  const brA = 1 - K.io(t, 0.1, 0.5);
  if (brA > 0) {
    const g4 = M.geom('full'), by = M.layout.s04.bracketY;
    M.bracket(g4, 1969, 2020, { color: C.head, y: by, label: '50+ years of street', alpha: brA });
    M.bracket(g4, 2021, 2026, { color: C.accent, y: by, label: 'a few years of lanterns', align: 'right', alpha: brA });
  }

  // ---- the road from 00.02 (y 636: 24 px above 00.02's 660 so the ages and service tags end by y 900)
  const roadY = L5.roadY - 24;
  const roadA = K.io(t, 0.7, 0.8);
  const cardLit = [K.io(t, c1 + 0.1, 0.6), K.io(t, tNetwork, 0.6), K.io(t, tInternet, 0.6), K.io(t, c4, 0.6), K.io(t, tAI, 0.6)];
  const talk = M.bump(t, tTalk - 0.1, 1.6);
  K.layer(roadDim, () => M.road(t, {
    y: roadY, alpha: roadA, lit: (i) => cardLit[i],
    glow: (i) => (i === 4 ? 0.6 * K.io(t, tAI + 0.3, 0.8) + 0.9 * talk : 0),
  }));

  // ---- lantern tags: the stack (as 04 hung it) and the leaders that keep each tag tied to its year's node
  const lanternTagA = Math.min(1, K.lerp(1, 0.6, K.io(t, 0.2, 0.6)) + 0.4 * K.io(t, tAI + 0.2, 0.6));
  const lMode = fold > 0 ? 'year' : 'full';
  const LR = [0, 1, 2].map((i) => M.lanternTagRect(gm, i, lMode));
  const leaderA = (1 - exitK) * K.lerp(1, 0.75, mk);
  K.layer(streetA, () => {
    if (leaderA <= 0) return;
    M.LANTERNS.forEach((L, i) => {
      const r = LR[i], x = M.X(L.year, gm), sx = K.clamp(x, r.x0 + r.h / 2, r.x1 - r.h / 2);
      const ny = gm.y + (r.cy < gm.y ? -gm.node : gm.node);
      g.save(); g.globalAlpha *= leaderA * lanternTagA; g.strokeStyle = K.mixColor(C.line2, C.accent, 0.75);
      g.lineWidth = 1.5; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); g.moveTo(sx, r.cy); g.lineTo(x, r.cy); g.lineTo(x, ny); g.stroke(); g.restore();
    });
  });

  // ---- the street of years (names kept until "What's new", then years, as 06 opens)
  const talkGlow = (0.8 * K.io(t, tAI + 0.3, 0.8) + 0.9 * talk) * (1 - exitK);
  K.layer(streetA, () => M.street(t, {
    geom: gm, mode: fold > 0 ? 'year' : 'full', modeFrom: 'full', modeK: fold,
    show, itemAlpha, itemLit: (i) => tagLit[i] * (1 - fold),
    lanterns: 1, lanternTags: 0, tickLabels: 0,
    lanternGlow: 1 + talkGlow,
  }));
  // the stacked lantern tags, drawn here (same call M.street makes) so they can fold full → year with the street
  K.layer(streetA, () => M.LANTERNS.forEach((L, i) => {
    const r = LR[i];
    M.tag(r.x1, r.cy, M.words(L, lMode), { size: gm.tag, tone: 'lantern', align: 'right', lit: 0.6, alpha: lanternTagA,
      from: fold > 0 && fold < 1 ? M.words(L, 'full') : null, fromK: fold });
  }));

  // ---- 04's decoration, held for the crossfade then gone as the street rises: 26 px decade labels and gable roofs
  if (decor04 > 0) {
    for (let d = 1970; d <= 2020; d += 10) {
      K.text(String(d), M.X(d, gm), gm.y + 44, { font: 'mono', weight: 500, size: 26, color: C.soft, align: 'center', alpha: 0.85 * decor04 });
    }
    M.BUILDINGS.forEach((b) => {
      const r = M.itemRect(gm, b), cx = r.cx, top = r.y0, hw = 19, ht = 13;
      K.layer(decor04 * streetA, () => {
        g.save();
        g.beginPath(); g.moveTo(cx - hw, top + 2.5); g.lineTo(cx, top - ht); g.lineTo(cx + hw, top + 2.5); g.closePath();
        g.fillStyle = C.tile; g.fill();
        g.beginPath(); g.moveTo(cx - hw, top + 0.5); g.lineTo(cx, top - ht); g.lineTo(cx + hw, top + 0.5);
        g.lineWidth = 1.5; g.lineJoin = 'round'; g.strokeStyle = K.mixColor(C.line2, C.head, 0.25); g.stroke();
        g.restore();
      });
    });
  }

  // ---- rects (current geom, names shown)
  const R = (key) => M.itemRect(gm, key, 'full');
  const rUnix = R('unix'), rEth = R('ethernet'), rDns = R('dns'), rWeb = R('web'), rJs = R('js'), rGh = R('github'), rGit = R('git');
  const card = (i) => M.stopRect(i, { y: roadY });
  const c = [0, 1, 2, 3, 4].map(card);
  // the ~1991 arrows drop through the free b1 row between DNS and the (folded) JavaScript node, then run along a lane
  const xGap = K.clamp((rDns.x1 + rJs.x0) / 2, rWeb.x0 + 24, rWeb.x1 - 24);
  const yEnd = c[0].t - 6;

  /** a routed arrow: polyline with rounded corners, drawn to progress k, with a small head */
  function route(pts, k, o) {
    if (k <= 0 || o.alpha <= 0) return;
    const rad = 22, P = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
      const d1 = Math.hypot(bx - ax, by - ay), d2 = Math.hypot(cx - bx, cy - by), r = Math.min(rad, d1 / 2, d2 / 2);
      const p0 = [bx - ((bx - ax) / d1) * r, by - ((by - ay) / d1) * r], p2 = [bx + ((cx - bx) / d2) * r, by + ((cy - by) / d2) * r];
      for (let j = 0; j <= 8; j++) {
        const u = j / 8;
        P.push([(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * bx + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * by + u * u * p2[1]]);
      }
    }
    P.push(pts[pts.length - 1]);
    const segL = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]));
    let left = segL.reduce((s, v) => s + v, 0) * K.clamp(k);
    g.save(); g.globalAlpha *= o.alpha; g.strokeStyle = g.fillStyle = o.color; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(P[0][0], P[0][1]);
    let ex = P[0][0], ey = P[0][1], ang = Math.PI / 2;
    for (let i = 0; i < segL.length && left > 0; i++) {
      const f = Math.min(1, left / (segL[i] || 1));
      ex = K.lerp(P[i][0], P[i + 1][0], f); ey = K.lerp(P[i][1], P[i + 1][1], f);
      ang = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]);
      g.lineTo(ex, ey); left -= segL[i];
    }
    g.stroke();
    const hs = 11;
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - hs * Math.cos(ang - 0.45), ey - hs * Math.sin(ang - 0.45));
    g.lineTo(ex - hs * Math.cos(ang + 0.45), ey - hs * Math.sin(ang + 0.45)); g.closePath(); g.fill();
    g.restore();
  }
  const ARROWS = [
    // stop 1: the shell (Unix) and Python
    [0, tShell, [[Math.min(rUnix.cx, rEth.x0 - 24), rUnix.y1 + 4], [c[0].l + 100, yEnd]]],
    [0, tPython1, [[xGap, rWeb.y1 + 4], [xGap, 478], [c[0].x + 70, 478], [c[0].x + 70, yEnd]]],
    // stops 2 and 3: Ethernet; DNS and the web
    [1, tEthernet, [[rEth.x1 - 36, rEth.y1 + 4], [c[1].l + 80, yEnd]]],
    [1, tDNS, [[rDns.cx, rDns.y1 + 4], [c[2].x - 90, yEnd]]],
    [1, tWeb, [[xGap, rWeb.y1 + 4], [xGap, 466], [c[2].x + 40, 466], [c[2].x + 40, yEnd]]],
    // stop 4: GitHub
    [2, tGitHub, [[rGh.cx, rGh.y1 + 4], [c[3].x - 40, yEnd]]],
  ];
  ARROWS.forEach(([gi, at, pts]) => route(pts, K.io(t, at, 0.7, 'io'), { color: C.head, alpha: 0.85 * groupA(gi) * streetA }));

  // the word being spoken inside the shared ~1991 tag gets a gold underline
  const wordSpan = (word) => {
    const sz = gm.tag, b = M.byKey('web');
    const yearW = K.measure(b.yl, { font: 'mono', weight: 600, size: sz });
    const sepW = K.measure('  ·  ', { font: 'ui', weight: 400, size: sz });
    const nameO = { font: 'ui', weight: 600, size: sz };
    const total = yearW + sepW + K.measure(b.name, nameO);
    const at = b.name.indexOf(word), x = rWeb.cx - total / 2 + yearW + sepW + K.measure(b.name.slice(0, at), nameO);
    return [x, K.measure(word, nameO)];
  };
  const underline = (word, k, a) => {
    if (k <= 0 || a <= 0) return;
    const [x, ww] = wordSpan(word);
    K.mark(x, rWeb.cy + 16, ww, k, { color: C.head, w: 3, alpha: 0.9 * a });
  };
  underline('Python', K.io(t, tPython1, 0.5), groupA(0) * streetA);
  underline('web', K.io(t, tWeb, 0.5), groupA(1) * streetA);
  underline('Python', K.io(t, tPython2 + 0.1, 0.5), 1 - ringOut);

  // the lanterns into card 5 (terracotta): a short tick from each stacked tag's right edge joins one spine just right
  // of the stack (clear of the leaders on the left), and the spine runs down into the AI stop as a single arrow
  {
    const sx = 1820, aA = 0.85 * groupA(3) * streetA, col = C.accent;
    if (aA > 0) {
      LR.forEach((r, i) => {
        const k = K.stagger(t, tAI + 0.2, i, 0.15, 0.4, 'io');
        if (k > 0) K.line(r.x1 + 4, r.cy, K.lerp(r.x1 + 4, sx, k), r.cy, { color: col, w: 2, alpha: aA });
      });
      const sk = K.io(t, tAI + 0.35, 0.5, 'io');
      if (sk > 0) K.line(sx, LR[0].cy, sx, K.lerp(LR[0].cy, LR[2].cy, sk), { color: col, w: 2, alpha: aA });
      route([[sx, LR[2].cy], [sx, 452], [c[4].x + 80, 452], [c[4].x + 80, yEnd]], K.io(t, tAI + 0.8, 0.7, 'io'), { color: col, alpha: aA });
    }
  }

  // ---- ages under the cards (cream-muted C.body for "decades", readable on the indigo ground)
  const ageY = roadY + 154, ageO = { font: 'ui', weight: 600, size: 30, color: C.body, align: 'center' };
  const xs = M.ROAD.xs;
  const svcA = K.lerp(1, 0.4, K.io(t, tBirthday - 0.2, 0.6));   // service tags step back for the birthday beat
  K.layer(roadDim, () => {
    K.rise(t, tDecades1, () => K.text('decades', xs[0], ageY, ageO), 14);
    K.rise(t, tDecades2, () => K.text('decades', xs[1], ageY, ageO), 14);
    K.rise(t, tDecades2 + 0.15, () => K.text('decades', xs[2], ageY, ageO), 14);
    const svc = [[{ year: '2008', name: 'GitHub' }, tGitHub], [{ year: '2010', name: 'Cloudflare' }, tCloud], [{ year: '2011', name: 'Stripe' }, tStripe]];
    const top = c[3].b + 5 + 24.05;                               // first tag 5 px under the card; 52 px pitch → last ends ≤ 900
    [0, 1, 2].forEach((i) => {
      const [words, at] = svc[i], k = K.io(t, at + 0.05, 0.5, 'out'); if (k <= 0) return;
      M.tag(xs[3], top + i * 52 + (1 - k) * 12, words, { size: 26, alpha: k * svcA, lit: 0.25 * svcA });
    });
    K.rise(t, tNewest, () => K.text('a few years', xs[4], ageY, { ...ageO, color: C.accent }), 14);
  });

  // ---- [[birthday]]: every date is a birthday, not a finish line (in the lane the arrows have left)
  K.rise(t, tBirthday - 0.15, () => K.pill('a birthday, not a finish line', 930, 486,
    { size: 30, color: C.head, stroke: K.mixColor(C.line2, C.head, 0.7), glow: 0.35 }), 18, 0.7);

  // rings over ~1991 (Python) and 2005 (Git): stadiums that hug their own pill 8 px out, drawn from the top centre
  const stadium = (r, k, pad) => {
    if (k <= 0) return null;
    const x0 = r.x0 - pad, y0 = r.y0 - pad, ww = r.w + 2 * pad, hh = r.h + 2 * pad, rr = hh / 2;
    const P = 2 * (ww - 2 * rr) + 2 * Math.PI * rr;
    g.save(); g.globalAlpha *= 0.9; g.strokeStyle = C.head; g.lineWidth = 3; g.lineCap = 'round';
    g.setLineDash([P * K.clamp(k), P + 20]);
    g.beginPath(); g.moveTo(x0 + ww / 2, y0); g.lineTo(x0 + ww - rr, y0);
    g.arc(x0 + ww - rr, y0 + rr, rr, -Math.PI / 2, Math.PI / 2); g.lineTo(x0 + rr, y0 + hh);
    g.arc(x0 + rr, y0 + rr, rr, Math.PI / 2, Math.PI * 1.5); g.closePath(); g.stroke(); g.restore();
    return { x0, x1: x0 + ww, y0, y1: y0 + hh };
  };
  stadium(rWeb, ringPy, 8);
  stadium(rGit, ringGit, 8);
  // "new versions every year": between the two rings, above the ~1991 ring and left of the Git ring
  {
    const vs = 'updated yearly', vo = { font: 'ui', weight: 600, size: 26 };
    const vw = K.measure(vs, vo) + 26 * 1.6, vx = rGit.x0 - 8 - 18 - vw / 2;
    K.layer(1 - ringOut, () => K.rise(t, tVersions - 0.15, () => K.pill(vs, vx, 158, { size: 26, color: C.strong, stroke: K.mixColor(C.line2, C.head, 0.45) }), 12));
  }

  // ---- "AI research, too, goes back to the 1950s": a terracotta dashed run off the street's start,
  //      ending in a small unlit lantern over a terracotta tag
  {
    const k = K.io(t, t1950, 0.9, 'io'), lx = 140, y = gm.y;
    if (k > 0) {
      K.line(gm.x0 - 7, y, K.lerp(gm.x0 - 7, lx, k), y, { color: C.accent, w: 2, dash: [6, 9], alpha: 0.6 * streetA });
      const lk = K.io(t, t1950 + 0.6, 0.6);
      if (lk > 0) {
        const sway = K.wave(t, M.motion.sway.speed, M.motion.sway.amp, 0.9);
        K.layer(0.85 * lk * streetA, () => K.at(lx, y + 3, 1, sway, () => M.lantern(0, 0, 38, 0.18, { glow: 0.5 })));
        K.line(lx, y + 3 + 38 * 1.2, lx, 388, { color: C.accent, w: 2, dash: [4, 6], alpha: 0.5 * lk * streetA });
      }
      const tk = K.io(t, t1950 + 0.5, 0.6, 'out');
      if (tk > 0) M.tag(92, 416 + (1 - tk) * 10, { year: '1950s', name: 'AI research' }, { size: 26, tone: 'lantern', align: 'left', alpha: tk * streetA });
    }
  }

  // ---- "What's new is AI you can talk to": a chat glyph joins the brain, and the new part gets its tag
  {
    const k = K.io(t, tTalk - 0.1, 0.6, 'out');
    if (k > 0) {
      K.layer(k, () => K.icon('chat', c[4].x + 86, c[4].iconY - 22, 40, { color: C.accent, w: 3 }));
      K.layer(k, () => K.pill('AI you can talk to', xs[4], ageY + 56 + (1 - k) * 12, { size: 26, color: C.accent, stroke: K.mixColor(C.line2, C.accent, 0.6 + 0.4 * talk), glow: 0.2 * talk }));
    }
  }
});
