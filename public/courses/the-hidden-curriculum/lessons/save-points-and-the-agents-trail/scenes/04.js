/* 04 — Stones: a commit is a save point.
   The map from 03 (sheet, main path, guide, walker) gets its first two stones. Each records the one before it
   (back-arrow), both take a lock seal (add new, don't edit old), the walker asks for a commit, the forum advice
   card, then [[real]]: the map eases to the left, the terminal opens and the real save-points capture (items 0-6)
   plays; the two commit lines are boxed and the stones take their real short IDs, linked to the marks. */
SCENE('04', (t, S) => {
  const L = M.L, C = K.C, Y = L.pathY, [X1, X2, X3] = L.stoneX;
  const cue = (n, f) => S.cue(n, f);
  const cStone = cue('stone', 0), cParent = cue('parent', 8.3), cSet = cue('set', 13.2), cAsk = cue('ask', 18.5);
  const cHabit = cue('habit', 24.8), cReal = cue('real', 31.9);

  // ---- the replay (same options for K.termReplay and K.termTimes); fast typing: the agent types, you read output
  const TO = { only: [0, 1, 2, 3, 4, 5, 6], speed: 2, cps: 90, think: 0.15, gap: 0.2, start: 0.35, size: 26 };
  const goT = cReal;                       // capture clock 0 at this local time
  const sch = K.termTimes('save-points', TO);
  const it3 = sch.items[3], it6 = sch.items[6];
  const m1 = goT + (it3 && it3.out.length ? it3.out[0].at : 4) + 0.1;   // the first commit's line prints
  const m2 = goT + (it6 && it6.out.length ? it6.out[0].at : 7) + 0.1;   // the second's
  const id = M.ids();
  // box the commit's bracket with its short ID: '[main (root-commit) <id>]' and '[main <id>]' (IDs move on re-record)
  const RX1 = /\[main \(root-commit\) [0-9a-f]{7}\]/, RX2 = /\[main [0-9a-f]{7}\](?= Add about page)/;

  // ---- camera: full map, then the left framing beside the terminal
  const cam = K.cam(t, [{ at: 0, ...M.VIEW.full }, { at: cReal, ...M.VIEW.left, d: 0.8 }]);
  const tsc = M.ts(cam);
  const termK = K.io(t, cReal + 0.1, 0.6, 'out');

  // the sheet tightens with the camera so, in the left framing, it spans screen x 80-950 and never runs on under the
  // terminal window (x 980-1800): world x is solved through M.VIEW.left (screen = (x - cam.x) * z + 960)
  const VL = M.VIEW.left, shK = K.io(t, cReal, 0.8);
  const shX0 = VL.x + (80 - 960) / VL.z, shX1 = VL.x + (950 - 960) / VL.z;
  const shX = K.lerp(L.sheet.x, shX0, shK), shW = K.lerp(L.sheet.x + L.sheet.w, shX1, shK) - shX;

  K.bg();
  K.withCam(cam, () => {
    const shR = M.sheet(t, { x: shX, w: shW, compass: 0 });
    parchment(shR);
    M.mainPath();

    // stone 1 and 2 settle; the outline of a stone not made yet at [[ask]]
    const k1 = K.io(t, cStone + 0.5, 0.6, 'out'), k2 = K.io(t, cParent + 0.15, 0.6, 'out');
    const seal = (i) => K.io(t, cSet + 0.35 + i * 0.25, 0.5, 'out');
    const idA1 = K.io(t, m1, 0.5, 'out'), idA2 = K.io(t, m2, 0.5, 'out');
    // the back-arrow from stone 2 to stone 1
    M.back(X1, Y, X2, Y, { k: K.io(t, cParent + 0.6, 0.7) });
    M.stone(X1, Y, { k: k1, seal: seal(0), id: id.home, idAlpha: idA1, idColor: C.strong, glow: Math.max(0.6 * K.env(t, m1, m1 + 2.2, 0.4), 0.5 * K.env(t, cStone + 8.3, cStone + 9.6, 0.4)), ts: tsc });
    M.stone(X2, Y, { k: k2, seal: seal(1), id: id.about, idAlpha: idA2, idColor: C.strong, glow: 0.6 * K.env(t, m2, m2 + 2.2, 0.4), ts: tsc });
    const outK = K.io(t, cAsk + 1.6, 0.6) * (1 - K.io(t, cHabit, 0.6));
    if (outK > 0) M.stone(X3, Y, { state: 'outline', k: outK, ts: tsc });

    // [[stone]]: three files shrink into stone 1 — "a snapshot of the whole project"
    // they stay on screen through "the whole project at that moment" and shrink in as the sentence ends (~stone+8.5)
    for (let i = 0; i < 3; i++) {
      const appear = K.io(t, cStone + 3.2 + i * 0.15, 0.5, 'out');
      const fly = K.io(t, cStone + 7.5 + i * 0.12, 0.9, 'io');
      if (appear <= 0 || fly >= 1) continue;
      const fx = X1 + (i - 1) * 72, fy = Y - 130;
      const x = K.lerp(fx, X1, fly), y = K.lerp(fy, Y, fly), s = 54 * (1 - 0.8 * fly);
      K.file(x, y, s, { alpha: appear * (1 - K.clamp((fly - 0.7) / 0.3)) });
    }
    const lab = (s, a, b, x, y) => { const a2 = K.env(t, a, b, 0.45); if (a2 > 0) M.label(s, x, y - (1 - K.ease.out(K.clamp(a2))) * 8, { alpha: a2, color: C.strong, ts: tsc }); };
    lab('a snapshot of the whole project', cStone + 4.8, cParent - 0.3, X1 + 340, Y - 120);
    lab('records the one before it', cParent + 1.0, cSet - 0.3, (X1 + X2) / 2, Y - 90);
    lab("add new, don't edit old", cSet + 0.8, cAsk + 1.4, (X1 + X2) / 2, Y - 90);

    // the guide sets the stones (pen aimed at the stone being set), bobs once at [[ask]]
    const penX = t < cParent - 0.4 ? X1 : t < cAsk ? X2 : K.lerp(X2, X3, K.io(t, cAsk + 1.2, 0.6));
    const writing = Math.max(K.env(t, cStone + 0.1, cStone + 1.2, 0.2), K.env(t, cParent, cParent + 0.9, 0.2), K.env(t, cAsk + 1.3, cAsk + 2.3, 0.2));
    const nod = Math.sin(Math.PI * K.seg(t, cAsk + 0.7, cAsk + 1.3)) * 6;
    M.guide(t, L.guide[0], L.guide[1] - nod, { penTo: [penX, Y + 20], scribble: writing, ts: tsc });

    // the walker reads; at [[parent]] its sight-line walks back along the line
    const back = K.io(t, cParent + 1.4, 2.2, 'sine');
    const lookX = t < cParent + 1.4 ? K.lerp(700, X2, K.io(t, cParent + 0.4, 0.8)) : K.lerp(X2, X1, back);
    const sA = 0.4 + 0.45 * K.env(t, cParent + 0.6, cSet - 0.2, 0.5);
    const wk = 1 - termK;                         // under the terminal window once it opens
    if (wk > 0.01) K.layer(wk, () => M.walker(t, L.walker[0], L.walker[1], { look: [lookX, Y - 6], sightAlpha: sA }));
  });

  // ---- source cards (screen space, top-right band) and the walker's bubble
  const wEye = [L.walker[0], L.walker[1] - 50];   // the tail stops at the top of the walker's tile
  // cards sit fully inside the sheet's top-right corner (L.cards would straddle the sheet's border at y 170 / x 1800)
  const CX = 1160, CY = 196, CW = 620;
  const mitA = K.env(t, cSet + 0.6, cAsk - 0.2, 0.5);
  if (mitA > 0) M.dated(CX, CY, CW, { alpha: mitA, size: 30, quote: true,
    eyebrow: 'MIT Missing Semester 2026 · Version Control and Git · 2026-01-16',
    body: 'Commits in Git are immutable' });
  const bA = K.env(t, cAsk + 0.2, cHabit - 0.2, 0.45);
  if (bA > 0 && termK < 1) M.bubble('commit my changes with a descriptive message', 1470, 590, { k: bA, tail: wEye });
  const hA = K.env(t, cHabit + 0.5, cReal - 0.1, 0.5);
  if (hA > 0) {
    const c1 = { eyebrow: 'Dean Rie · Cursor forum · 2026-08-13', body: 'Git with frequent commits before big Agent changes', quote: true, size: 28 };
    const c2 = { eyebrow: 'FinDevAI · Cursor forum · 2026-08-15', body: 'making many Git Commits per thread is best practice', quote: true, size: 28 };
    const h1 = M.dated(CX, CY, CW, { ...c1, measure: true });
    M.dated(CX, CY, CW, { ...c1, alpha: hA });
    M.dated(CX, CY + h1 + 18, CW, { ...c2, alpha: K.env(t, cHabit + 1.2, cReal - 0.1, 0.5) });
  }

  // ---- [[real]]: the terminal and the real capture
  if (termK > 0) {
    // the agent ran these commands: say so on the window bar and in a chip under it, for the whole run
    const r = M.term({ k: termK, title: 'Git Bash · demo-site · run by the agent' });
    M.chip("real output · recognise it, don't type it", L.term.x + L.term.w / 2, L.term.y + L.term.h + 36,
      { align: 'center', alpha: K.io(t, cReal + 0.5, 0.6), color: C.head });
    const tt = t - goT;
    // rows recomputed exactly as K.termReplay lays them out: where each boxed line sits on screen
    const rows = termRows(r, tt, TO);
    // each mark's pill sits just left of the window beside its gold link (1 above it, 2 under it, clear of the path's
    // end), so it never covers terminal output
    const pill = (text, match, under) => {
      const hit = rows.find(match); if (!hit) return undefined;
      const ls = 28, pw = K.measure(text, { font: 'ui', size: ls, weight: 700 }) + ls * 1.4, ph = ls * 1.9;
      return [r.x - pw - 22, under ? hit.y + 14 : hit.y - ph - 12];
    };
    K.termReplay(r, tt, 'save-points', { ...TO, alpha: termK, marks: [
      { at: m1 - goT, until: 999, match: RX1, text: 'save point 1', labelAt: pill('save point 1', RX1) },
      { at: m2 - goT, until: 999, match: RX2, text: 'save point 2', labelAt: pill('save point 2', RX2, true) },
    ] });
    // gold links from each stone's ID to its boxed line
    // stone 1's link leaves from the top of its seal (passing above stone 2's), stone 2's from under its ID; both end at the
    // window's left edge on the boxed row, so no line crosses the terminal text
    [[X1 + 22, m1, RX1, Y - 50], [X2, m2, RX2, null]].forEach(([sx, at, match, wy]) => {
      const lk = K.io(t, at + 0.35, 0.6);
      if (lk <= 0) return;
      const hit = rows.find(match);
      if (!hit) return;
      const [ax, ay] = M.toScreen(cam, sx, wy == null ? Y + 26 + 34 * tsc + 12 : wy);
      M.link(ax, ay, r.x + 8, hit.y, { k: lk, alpha: 0.7 });
    });
  }

  /* 03's parchment, kept on: tint, two topographic hills, the hand-inked border and the compass rose (in place of
     M.sheet's plain north mark). Drawn in world space on the sheet rect r, so it follows the sheet as it tightens
     at [[real]]; hill positions are fractions of the sheet (03's: (470, 300) and (1020, 800) on the full sheet). */
  function parchment(r) {
    const g = K.ctx(), INK = K.mixColor(C.head, C.accent, 0.45), sx = r.w / L.sheet.w;
    g.save(); K.rr(r.x, r.y, r.w, r.h, 24); g.clip();
    const pg = g.createRadialGradient(r.x + r.w * 0.5, r.y + r.h * 0.5, 80, r.x + r.w * 0.5, r.y + r.h * 0.5, r.w * 0.62);
    pg.addColorStop(0, K.rgba(C.head, 0.1)); pg.addColorStop(1, K.rgba(INK, 0.19));
    g.fillStyle = pg; g.fillRect(r.x, r.y, r.w, r.h);
    [[0.208, 0.176, 150, 62, 4], [0.536, 0.851, 190, 58, 3]].forEach(([fx, fy, rx, ry, n], hi) => {
      const hx = r.x + fx * r.w, hy = r.y + fy * r.h;
      for (let j = 0; j < n; j++) {
        const sc = 1 - j * 0.24, pts = [];
        for (let i = 0; i <= 40; i++) {
          const a = (i / 40) * Math.PI * 2, wob = 1 + 0.08 * Math.sin(a * 3 + hi * 2 + j) + 0.05 * Math.sin(a * 5 + j * 1.7);
          pts.push([hx + Math.cos(a) * rx * sx * sc * wob, hy + Math.sin(a) * ry * sc * wob]);
        }
        K.path(pts, { k: 1, head: false, color: INK, w: 1.3, alpha: 0.32, tension: 0.4 });
      }
    });
    g.restore();
    const rnd = K.rng(3031), ins = 11, pts = [];
    const cs = [[r.x + ins, r.y + ins], [r.x + r.w - ins, r.y + ins], [r.x + r.w - ins, r.y + r.h - ins], [r.x + ins, r.y + r.h - ins], [r.x + ins, r.y + ins]];
    for (let c = 0; c < 4; c++) {
      const [ax, ay] = cs[c], [bx, by] = cs[c + 1], n = Math.round(Math.hypot(bx - ax, by - ay) / 46);
      for (let i = 0; i < n; i++) { const f = i / n; pts.push([ax + (bx - ax) * f + (rnd() - 0.5) * 3.2, ay + (by - ay) * f + (rnd() - 0.5) * 3.2]); }
    }
    pts.push(pts[0].slice());
    K.path(pts, { k: 1, head: false, color: INK, w: 2.4, alpha: 0.75, tension: 0.2 });
    const x = r.x + 70, y = r.y + r.h - 74, R = 40;
    g.save(); g.lineWidth = 1.6; g.strokeStyle = K.rgba(INK, 0.8); g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); g.restore();
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 4, len = (i % 2 ? 0.55 : 1) * R * 1.1, wd = i % 2 ? 4 : 7;
      g.save(); g.translate(x, y); g.rotate(a);
      g.beginPath(); g.moveTo(len, 0); g.lineTo(0, wd); g.lineTo(0, -wd); g.closePath();
      g.fillStyle = i === 0 ? K.rgba(C.head, 0.85) : K.rgba(INK, i % 2 ? 0.45 : 0.6); g.fill();
      g.restore();
    }
    M.label('N', x, y - R - 18, { size: 26, color: C.head });
  }

  /* the replay's visible rows (same layout as the kit's drawTerm), to find where a matched line sits on screen */
  function termRows(r, tt, o) {
    const c = K.capture('save-points');
    const out = { find: () => null };
    if (!c || !sch.items.length) return out;
    const size = o.size || 30, lh = o.lh || size * 1.45, pad = o.pad ?? 30;
    const cw = K.measure('M', { font: 'mono', size }), cols = Math.max(10, Math.floor((r.w - pad * 2) / cw));
    const blank = o.blank ?? (c.shell === 'cmd');
    const rows = [];
    const wrap = (s) => { if (!s.length) { rows.push(''); return; } while (s.length) { rows.push(s.slice(0, cols)); s = s.slice(cols); } };
    sch.items.forEach((it, i) => {
      const from = i === 0 ? -Infinity : sch.items[i - 1].done;
      if (tt < from) return;
      if (blank && i > 0) rows.push('');
      const n = it.keys.filter((k) => k <= tt).length;
      wrap(it.prompt + it.cmd.slice(0, n));
      if (tt < it.enter) return;
      it.out.forEach((ln) => { if (ln.at <= tt) wrap(ln.s); });
    });
    const last = sch.items[sch.items.length - 1];
    if (last && tt >= last.done) { if (blank) rows.push(''); wrap(last.prompt); }
    const maxRows = Math.max(1, Math.floor((r.h - pad * 2 + (lh - size)) / lh));
    const first = Math.max(0, rows.length - maxRows), shown = rows.slice(first);
    out.find = (match) => {
      let hit = null;
      shown.forEach((s, i) => { const mm = match.exec(s), at = mm ? mm.index : -1; if (at >= 0) hit = { x: r.x + pad + at * cw - 10, y: r.y + pad + size * 0.85 + i * lh - size * 0.3 }; });
      return hit;
    };
    return out;
  }
});
