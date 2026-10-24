/* 05 — Signposts, and the one with the lantern.
   Continues 04's frame (map left at M.VIEW.left, terminal right, two sealed stones on main). The rest of the
   save-points capture (items 7-15) plays: [[fork]] the side trail forks off stone 2 while `git switch -c` is typed;
   [[signpost]] signposts `feature/contact` and `main` plant (two planks on one post: both names point at stone 2),
   and as the replay commits, two stones land on the side trail and its signpost slides to each; [[graph]] the merge
   stone lands, the `main` signpost slides to it, and the log's two decorated lines are boxed and linked to their
   signposts. [[lantern]] the terminal closes and the map returns full width: a lantern swings onto `main`, visitors
   walk its road, "a setting outside the map", where the picture breaks. [[aaron]] AO-043: a second side branch gets
   a lantern too and the visitors swing to it. [[lovable]] Lovable's one synced branch, which is not the live one. */
SCENE('05', (t, S) => {
  const L = M.L, C = K.C, Y = L.pathY, [X1, X2] = L.stoneX, XM = L.mergeX;
  const [[SX1, SY1], [SX2, SY2]] = L.sideStones;
  const cue = (n, f) => S.cue(n, f);
  const cFork = cue('fork', 0), cSign = cue('signpost', 2.2), cGraph = cue('graph', 14.6);
  const cLant = cue('lantern', 21.0), cAaron = cue('aaron', 30.4), cLov = cue('lovable', 50.3);
  const w = (s, n, f) => S.find(s, n || 0, f);
  const wLantern = w('carries', 0, cLant + 2.3), wVisit = w('visitors', 0, cLant + 4.1), wWhich = w('Which', 1, cLant + 6.3)   // 'which' 0 is "which slides forward";
  const wForty = w('forty', 0, cAaron + 8.2), wEight = w('eight', 0, cAaron + 12.6), wFull = w('full', 0, cAaron + 15.0);
  const wLive = w("isn't", 0, cLov + 8.0), wPub = w('Publish', 0, cLov + 11.8);
  const id = M.ids();

  // ---- the replay: all of save-points, items 0-6 already done at t = 0 (as 04 left it), 7-15 play from here.
  // Same options for K.termReplay and K.termTimes; the agent types (fast), its output is what we read.
  const TO = { speed: 2, cps: 40, think: 0.15, gap: 0.8, start: 0.2, size: 26 };
  const sch = K.termTimes('save-points', TO);
  const it = (i) => sch.items[i];
  const t7 = it(7) ? it(7).start : 0;
  const lead = cFork + 0.3;                                   // item 7 starts typing at this local time
  const tc = t - lead + t7;                                   // capture clock
  const loc = (x) => x - t7 + lead;                           // capture time -> local time
  const outAt = (i, fb) => (it(i) ? loc(it(i).out.length ? it(i).out[0].at : it(i).done) : fb);
  const tContact = outAt(10, 7), tPhone = outAt(12, 11), tMerge = outAt(14, 15.5), tLog = outAt(15, 18);

  // ---- camera: the left framing beside the terminal, then full width at [[lantern]]
  const camGo = cLant + 0.15;
  const cam = K.cam(t, [{ at: -5, ...M.VIEW.left }, { at: camGo, ...M.VIEW.full, d: 0.85 }]);
  const tsc = M.ts(cam);
  const termK = 1 - K.io(t, cLant, 0.55, 'in');

  // ---- signposts: positions eased between stones (0.5 s), planted through k
  const fU1 = K.io(t, tContact + 0.05, 0.5), fU2 = K.io(t, tPhone + 0.05, 0.5);
  const fX = K.lerp(K.lerp(X2, SX1, fU1), SX2, fU2), fY = K.lerp(K.lerp(Y, SY1, fU1), SY2, fU2);
  const fH = K.lerp(210, L.signH, fU1);                       // stacked over main's plank while both name stone 2
  const mU = K.io(t, tMerge + 0.15, 0.6);
  const mX = K.lerp(X2, XM, mU);
  const fK = K.io(t, cSign - 0.1, 0.8, 'out'), mK = K.io(t, cSign + 1.9, 0.8, 'out');

  // ---- lanterns and visitors
  const lantK = K.io(t, Math.min(wLantern, cLant + 1.2) - 0.4, 0.6, 'out');   // lit as 'one signpost carries a lantern' begins
  const lov0 = K.io(t, cLov, 0.6);                            // the AO-043 layer leaves
  const aaronK = K.io(t, cAaron + 0.4, 0.8, 'out') * (1 - lov0);
  const tSwing = cAaron + 2.7;                                // "his host sent any pushed branch live" (~159.8 s)
  const claudeLant = K.io(t, tSwing, 0.9, 'out') * (1 - lov0);
  const visMain = K.io(t, wVisit, 0.6) * (1 - K.io(t, cAaron + 1.2, 0.5));   // main's row leaves before the new signpost plants
  const visClaude = K.io(t, tSwing + 0.2, 0.6) * (1 - lov0);
  const outsideK = K.env(t, wWhich, cAaron - 0.2, 0.5);

  // the sheet tightens to screen x 80-950 while the terminal is open (as 04 left it), and widens back with the camera
  const VL = M.VIEW.left, shK = 1 - K.io(t, camGo, 0.85);
  const shX0 = VL.x + (80 - 960) / VL.z, shX1 = VL.x + (950 - 960) / VL.z;
  const shX = K.lerp(L.sheet.x, shX0, shK), shW = K.lerp(L.sheet.x + L.sheet.w, shX1, shK) - shX;
  const wAug = w('August', 0, cAaron + 12.0);

  K.bg();
  let mainSign = null, featSign = null;
  K.withCam(cam, () => {
    M.sheet(t, { x: shX, w: shW });
    M.mainPath();

    // the side trail: forks at [[fork]] up to y 420, reaches the second side stone, rejoins main at the merge
    const sideK = 0.333 * K.io(t, cFork + 0.25, 1.2) + 0.373 * K.io(t, tPhone - 0.45, 0.45) + 0.294 * K.io(t, tMerge - 0.3, 0.6);
    M.trail(L.side, { kind: 'side', k: sideK });

    // AO-043, drawn on this map: a side branch forked off an OLD stone (the site's August state), running under main
    // to its own stone; drawn under everything else
    const CB = [1180, 730];
    if (aaronK > 0) {
      M.trail([[X1, Y], [370, 574], [410, 610], [440, 660], [520, 690], [1000, 702], [1120, 718], CB], { kind: 'side', k: aaronK });
      M.stone(CB[0], CB[1], { k: K.io(t, cAaron + 1.1, 0.6, 'out') * (1 - lov0), seal: 1, ts: tsc });
    }

    // parent arrows
    M.back(X1, Y, X2, Y, {});
    const kC = K.io(t, tContact, 0.6, 'out'), kP = K.io(t, tPhone, 0.6, 'out'), kM = K.io(t, tMerge, 0.6, 'out');
    M.back(X2, Y, SX1, SY1, { k: K.io(t, tContact + 0.4, 0.6), bend: 30 });
    M.back(SX1, SY1, SX2, SY2, { k: K.io(t, tPhone + 0.4, 0.6), bend: -24 });
    M.back(SX2, SY2, XM, Y, { k: K.io(t, tMerge + 0.4, 0.6), bend: 24 });
    M.back(X2, Y, XM, Y, { k: K.io(t, tMerge + 0.6, 0.7), bend: -34 });

    // stones (all sealed: a commit is set in place); the merge stone's ID first prints in the log
    // a sheet-coloured plate under the side stones' IDs, so the side trail and parent arrows pass behind the text
    const plate = (x, y, s, a) => {
      if (!s || a <= 0.01) return;
      const fs = 26 * tsc, pw = K.measure(s, { font: 'mono', weight: 600, size: fs }) + 16 * tsc, yb = y + 26 + 34 * tsc;
      K.card(x - pw / 2, yb - fs * 0.95, pw, fs * 1.3, { r: 8, fill: M.P.sheet, stroke: 'rgba(0,0,0,0)', shadow: false, alpha: a });
    };
    plate(SX1, SY1, id.contact, K.io(t, tContact + 0.2, 0.4));
    plate(SX2, SY2, id.phone, K.io(t, tPhone + 0.2, 0.4));
    const glow = (a) => 0.6 * K.env(t, a, a + 2, 0.4);
    const S1 = { seal: 1, idColor: C.strong, ts: tsc };
    M.stone(X1, Y, { ...S1, id: id.home });
    M.stone(X2, Y, { ...S1, id: id.about });
    M.stone(SX1, SY1, { ...S1, id: id.contact, k: kC, seal: K.io(t, tContact + 0.45, 0.5, 'out'), glow: glow(tContact), idAlpha: K.io(t, tContact + 0.2, 0.4) });
    M.stone(SX2, SY2, { ...S1, id: id.phone, k: kP, seal: K.io(t, tPhone + 0.45, 0.5, 'out'), glow: glow(tPhone), idAlpha: K.io(t, tPhone + 0.2, 0.4) });
    M.stone(XM, Y, { ...S1, id: id.merge, k: kM, seal: K.io(t, tMerge + 0.45, 0.5, 'out'), glow: glow(tMerge) + glow(tLog) * 0.6, idAlpha: K.io(t, tLog + 0.1, 0.5) });

    // signposts: feature/contact first (its post rises behind main's plank while both name stone 2)
    featSign = M.signFor('feature/contact', fX, fY, { k: fK, h: fH, ts: tsc });
    mainSign = M.signFor('main', mX, Y, { k: mK, side: 'center', ts: tsc });
    // main's lantern, drawn here so it can dim while claude/side-branch's lantern lights (only one is 'the live one')
    if (lantK > 0 && mK > 0.4) M.lantern(t, mainSign.hook[0], mainSign.hook[1], { k: lantK, alpha: 1 - 0.7 * claudeLant });
    // AO-043's signpost and its lantern ("his host sent any pushed branch live")
    let cbSign = null;
    if (aaronK > 0) cbSign = M.signFor('claude/side-branch', CB[0], CB[1], { k: K.io(t, cAaron + 1.6, 0.8, 'out') * (1 - lov0), ts: tsc, lantern: claudeLant, t });
    // 'his site went back to August': the fork's old stone gets its month, and the layer says it is Aaron's site, drawn
    if (aaronK > 0) {
      const augK = K.io(t, wAug - 0.2, 0.5, 'out') * (1 - lov0);
      if (augK > 0) M.pillL('August', X1, 488, { align: 'center', size: 26, color: C.accent, stroke: C.accent, fill: M.P.sheet, alpha: augK });
      M.label("AARON'S SITE, DRAWN", 180, 236, { align: 'left', color: C.head, tracking: 3, alpha: aaronK });
    }

    // visitors: the road from the lantern's branch to the sheet's right edge
    if (visMain > 0) M.visitors(t, [[XM + 30, Y], [L.pathX1, Y], [1260, 620], [1770, 620]], { k: visMain });
    // the new row starts right of the claude/side-branch post and runs under its lantern, above the walker
    if (visClaude > 0) M.visitors(t, [[1262, 716], [1330, 702], [1770, 702]], { k: visClaude });
    const vl = Math.max(visMain, visClaude);
    if (vl > 0) M.label('visitors go here', 1680, visMain >= visClaude ? 668 : 652, { color: C.head, alpha: vl * (1 - lov0) });

    // the lantern is set outside the map
    if (outsideK > 0 && mainSign) {
      const hx = mainSign.hook[0] + 46, hy = mainSign.hook[1] + 60;
      K.text('a setting outside the map', hx, hy, { font: 'ui', weight: 600, size: 26 * tsc, color: C.accent, alpha: outsideK });
      K.line(hx - 8, hy - 10, mainSign.hook[0] + 26, hy - 10, { color: C.accent, w: 2, alpha: 0.7 * outsideK, dash: [4, 6] });
    }

    // the guide sets the stones: the pen follows the stone being made, rests once the lantern question begins
    const targets = [
      [-9, [575, 470]], [cSign + 0.2, [fX + 44, fY - fH]], [tContact - 0.6, [SX1, SY1 + 20]],
      [tPhone - 0.6, [SX2, SY2 + 20]], [tMerge - 0.6, [XM, Y + 20]], [cLant, [L.guide[0] + 110, L.guide[1] - 20]],
    ];
    let pen = targets[0][1];
    for (let i = 1; i < targets.length; i++) {
      const u = K.io(t, targets[i][0], 0.5);
      if (u > 0) pen = [K.lerp(pen[0], targets[i][1][0], u), K.lerp(pen[1], targets[i][1][1], u)];
    }
    const writing = Math.max(K.env(t, cFork + 0.25, cFork + 1.4, 0.2), K.env(t, tContact - 0.1, tContact + 0.6, 0.2),
      K.env(t, tPhone - 0.1, tPhone + 0.6, 0.2), K.env(t, tMerge - 0.1, tMerge + 0.6, 0.2));
    M.guide(t, L.guide[0], L.guide[1], { penTo: pen, scribble: writing, ts: tsc });

    // the walker (you) comes out from behind the terminal: reads the lantern, then AO-043's
    const wkK = K.io(t, cLant + 0.5, 0.6) * (1 - lov0);
    if (wkK > 0 && mainSign) {
      const lm = [mainSign.hook[0], mainSign.hook[1] + 52];
      const lc = cbSign ? [cbSign.hook[0], cbSign.hook[1] + 52] : lm;
      const sw = K.io(t, tSwing, 0.7);
      const look = [K.lerp(lm[0], lc[0], sw), K.lerp(lm[1], lc[1], sw)];
      const sA = 0.4 + 0.5 * Math.max(K.env(t, cLant + 0.8, wWhich + 2.2, 0.5), K.env(t, tSwing + 0.2, tSwing + 4.2, 0.5));
      K.layer(wkK, () => M.walker(t, L.walker[0], L.walker[1], { look, sightAlpha: sA }));
    }
  });

  // ---- screen-space cards while the terminal is open (top-left band, above the map's signposts)
  const card = (o, a) => { if (a > 0.002) M.dated(80, 140, 860, { size: 28, ...o, alpha: a }); };
  card({ eyebrow: 'Anthropic · Claude Code quickstart · ' + M.READ, body: 'their example: “create a new branch called feature/quickstart”' },
    K.env(t, cSign + 0.5, w('That', 0, cSign + 5.3) - 0.15, 0.4));
  card({ eyebrow: 'MIT Missing Semester 2026 · Version Control', body: 'References are pointers to commits', quote: true },
    K.env(t, w('That', 0, cSign + 5.3) + 0.1, cGraph - 0.1, 0.4));

  // ---- the terminal and the real capture
  if (termK > 0.002) {
    const r = M.term({ k: termK });
    const tc0 = t7 - lead;                                    // capture clock at local 0
    const logMark = tLog + 0.35 - lead + t7, featMark = tLog + 1.1 - lead + t7;
    // the replay's visible rows, for the links
    const rows = termRows(r, tc, TO);
    K.termReplay(r, tc, 'save-points', { ...TO, alpha: termK, marks: [
      // 04's two marks, still showing at the crossfade, let go
      { at: tc0 - 5, until: tc0 + 0.3, match: '(root-commit)' },
      { at: tc0 - 5, until: tc0 + 0.3, match: 'Add about page' },
    ] });
    // 04's links fade; then the two log lines link to their signposts on the map
    const old = 1 - K.io(t, 0, 0.45);
    if (old > 0.01) [[X1, '(root-commit)'], [X2, 'Add about page']].forEach(([sx, m]) => {
      const hit = rows.find(m); if (!hit) return;
      const [ax, ay] = M.toScreen(cam, sx, Y + 26 + 34 * tsc + 10);
      M.link(ax, ay, hit.x - 12, hit.y, { alpha: 0.7 * old });
    });
    // the two decorated log lines: a box that starts after the '* ' graph column, a link that stops at the
    // terminal's left padding (never crossing the |\ graph), and the label to the LEFT of each signpost
    const linkTo = (sg, at, m, text, dyLabel, maxRight) => {
      if (!sg) return;
      const hit = rows.find(m); if (!hit) return;
      const bk = K.io(t, at, 0.4) * termK;
      if (bk > 0.01) K.card(hit.x0 - 5, hit.y - 23, hit.mw + 10, 44, { r: 7, fill: 'rgba(0,0,0,0)', stroke: C.head, lw: 2.5, shadow: false, alpha: bk });
      const lk = K.io(t, at + 0.4, 0.6) * termK; if (lk <= 0) return;
      const p = sg.plank, [ax, ay] = M.toScreen(cam, p.x + p.w, p.y + p.h / 2);
      M.link(ax + 6, ay, r.x + 18, hit.y, { k: lk, alpha: 0.75 });
      const [lx, ly] = M.toScreen(cam, p.x, p.y + p.h / 2);
      const pa = K.io(t, at + 0.6, 0.5, 'out') * termK, px = Math.min(lx - 16, maxRight || 1e9);
      M.pillL(text, px, ly + dyLabel, { align: 'right', size: 26, color: C.strong, stroke: C.head, fill: C.tile, alpha: pa });
      if (px < lx - 16 || dyLabel) K.line(px + 2, ly + dyLabel + 12, lx - 4, ly - 4, { color: C.head, w: 2, alpha: 0.6 * pa });   // tag string to its plank
    };
    // main's label sits up-left of its plank, in the clear band between feature/contact's plank and the side stones,
    // ending short of feature/contact's post (a plain link would cross the post, so none: it reads as the plank's tag)
    const fPost = featSign ? M.toScreen(cam, featSign.x, featSign.y)[0] : 1e9;
    linkTo(mainSign, tLog + 0.35, `${id.merge} (HEAD -> main)`, 'you are on main', -50, fPost - 14);
    linkTo(featSign, tLog + 1.1, `${id.phone} (feature/contact)`, "the side trail's signpost", 0);
  }

  // ---- [[lantern]] where the picture breaks (top-right band)
  const brK = K.env(t, wWhich + 0.3, cAaron - 0.1, 0.5);
  if (brK > 0) K.layer(brK, () => {
    M.breaks(L.cards.x + 40, 200);
    K.para('A signpost is only a name. Which one carries the lantern is set outside the map.', L.cards.x + 40, 252, L.cards.w - 40, { font: 'read', size: 30, color: C.strong, lh: 42 });
  });

  // ---- [[aaron]] AO-043
  const aoK = K.io(t, cAaron + 0.3, 0.5) * (1 - lov0);
  if (aoK > 0) {
    const h = M.dated(L.cards.x, L.cards.y, L.cards.w, { alpha: aoK, size: 28,
      eyebrow: 'Aaron Orelup · AO-043 · 2026-10-09',
      body: 'A cloud session pushed a side branch; the host deployed it.' });
    const py = L.cards.y + h + 40;
    const w1 = M.pillL('~40 s → live', L.cards.x, py, { size: 30, color: C.head, stroke: C.head, fill: C.tile, alpha: aoK * K.io(t, wForty, 0.5, 'out') });
    M.pillL('8 min 10 s wrong', L.cards.x + w1 + 18, py, { size: 30, color: C.strong, stroke: C.line2, fill: C.tile, alpha: aoK * K.io(t, wEight, 0.5, 'out') });
    M.pointer('the lesson on getting from your laptop to a URL', 520, 856, { alpha: aoK * K.io(t, wFull, 0.5, 'out') });
  }

  // ---- [[lovable]] one synced branch, not the live one
  const endK = 1 - K.io(t, S.out - 1.0, 0.6);
  const lvK = K.io(t, cLov + 0.5, 0.6) * endK;
  if (lvK > 0) {
    const co = { size: 28, eyebrow: 'Lovable · Git sync docs · ' + M.READ,
      body: 'Lovable edits and syncs one branch at a time. Commits on other branches don’t appear in Lovable until you merge them into the synced branch or switch the synced branch.' };
    const h = M.dated(L.cards.x, L.cards.y, L.cards.w, { ...co, alpha: lvK });
    // the small card map: one synced branch, the others greyed
    const my = L.cards.y + h + 18, mk = K.io(t, cLov + 1.6, 0.6) * endK;
    if (mk > 0) K.layer(mk, () => {
      K.card(L.cards.x, my, L.cards.w, 236, { r: 24, stroke: C.line2, lw: 1.5 });
      const x0 = L.cards.x + 40, y1 = my + 120, y2 = my + 196;
      M.trail([[x0, y1], [x0 + 250, y1]], { kind: 'main', w: 4 });
      M.stone(x0 + 50, y1, { r: 16 }); M.stone(x0 + 150, y1, { r: 16 });
      M.signpost('synced branch', x0 + 192, y1 - 8, { h: 56 });
      M.label('Lovable sees this', x0 + 290, y1 + 10, { color: C.head, align: 'left' });
      M.trail([[x0, y2], [x0 + 150, y2]], { kind: 'side', w: 3, color: C.soft, alpha: 0.6 });
      M.stone(x0 + 70, y2, { r: 14, color: C.soft, alpha: 0.6 });
      M.label('others: not shown until merged', x0 + 180, y2 + 9, { color: C.soft, align: 'left' });
    });
    M.pillL('Publish = going live · pushing never publishes', L.cards.x, my + 236 + 50, { size: 26, color: C.strong, stroke: C.head, fill: C.tile, alpha: K.io(t, wLive, 0.5, 'out') * endK });
  }

  /* the replay's visible rows (same layout as the kit's drawTerm, as in 04), to find where a matched line sits */
  function termRows(r, tt, o) {
    const c = K.capture('save-points');
    const out = { find: () => null };
    if (!c || !sch.items.length) return out;
    const size = o.size || 30, lh = o.lh || size * 1.45, pad = o.pad ?? 30;
    const cw = K.measure('M', { font: 'mono', size }), cols = Math.max(10, Math.floor((r.w - pad * 2) / cw));
    const blank = o.blank ?? (c.shell === 'cmd');
    const rows = [];
    const wrap = (s) => { if (!s.length) { rows.push(''); return; } while (s.length) { rows.push(s.slice(0, cols)); s = s.slice(cols); } };
    sch.items.forEach((itm, i) => {
      const from = i === 0 ? -Infinity : sch.items[i - 1].done;
      if (tt < from) return;
      if (blank && i > 0) rows.push('');
      const n = itm.keys.filter((k) => k <= tt).length;
      wrap(itm.prompt + itm.cmd.slice(0, n));
      if (tt < itm.enter) return;
      itm.out.forEach((ln) => { if (ln.at <= tt) wrap(ln.s); });
    });
    const last = sch.items[sch.items.length - 1];
    if (last && tt >= last.done) { if (blank) rows.push(''); wrap(last.prompt); }
    const maxRows = Math.max(1, Math.floor((r.h - pad * 2 + (lh - size)) / lh));
    const first = Math.max(0, rows.length - maxRows), shown = rows.slice(first);
    out.find = (match) => {
      let hit = null;
      shown.forEach((s, i) => { const at = s.indexOf(match); if (at >= 0) hit = { x: r.x + pad + at * cw - 10, x0: r.x + pad + at * cw, mw: match.length * cw, y: r.y + pad + size * 0.85 + i * lh - size * 0.3, end: r.x + pad + s.length * cw }; });
      return hit;
    };
    return out;
  }
});
