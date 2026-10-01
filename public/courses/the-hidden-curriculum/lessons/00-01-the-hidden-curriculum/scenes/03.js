/* 00.01 · 03 — Why nobody taught you
   Metaphor: Aaron's loose questions (the tags from 02) lodge in the gap between two halls of study,
   Computer Science on the left and Information Systems on the right. On [[is]] the degree chip from
   01-02 glides into its own hall and settles under the title as "my degree": the plainest "this is
   why my degree didn't cover it". The everyday tools fall in the gap; three old routes feed it from
   below (forums pops the real "[Errno 2]" on "error"). It works, slowly: terminal and keys turn gold
   with a check (learned), then folders, hosting and .venv go hollow (dashed terracotta = still open).
   On "everyone" the routes hand the bottom band to three people, each carrying a labelled copy of the
   gap's 2x2 tool grid (26 px pills); on "different" each grid resolves in the gap's own language
   (gold + check = learned, dashed terracotta = hole): the first matches the gap, the others differ.
   Exit (04 picks up from here): tags compact at M.gapSlot(0..2), cd glow 0.35, .venv alpha 0.2.
   Pure function of t. One 'back' (the breaking-things tile). Tags move only with M.tagMove. */
SCENE('03', (t, S) => {
  const C = K.C, g = K.ctx(), L = M.layout;
  K.bg();

  // ------------------------------------------------------------ beat times (local seconds)
  const tCS = S.cue('cs', 2.94), tIS = S.cue('is', 10.31), tGap = S.cue('gap', 21.1);
  const tAp = S.cue('apprentice', 32.32), tHoles = S.cue('holes', 45.79);
  const tMostly = S.find('mostly', 0, 4.04), tMostly2 = S.find('mostly', 1, 12.13);
  const tChip = tIS, tSys = Math.max(tChip + 0.75, S.find('systems', 0, 11.13));   // chip glides in, then the title
  const csW = [S.find('algorithms', 0, 6.41), S.find('data', 0, 7.38), S.find('how', 0, 8.55)];
  const isW = [S.find('databases', 0, 15.98), S.find('processes', 0, 17.0), S.find('projects', 0, 17.98)];
  const gapW = [S.find('terminal', 0, 22.3), S.find('folders', 0, 23.18), S.find('keys', 0, 23.99), S.find('hosting', 0, 24.78)];
  const tUsed = S.find('Used', 0, 26.22), tRarely = S.find('rarely', 0, 27.7), tOld = S.find('old', 0, 31.17);
  const tNeed = S.find('need', 0, 35.64), tFirst = S.find('first', 0, 36.93);
  const tForums = S.find('Forums', 0, 38.17), tAnswers = S.find('answers', 0, 40.38), tError = S.find('error', 0, 41.77);
  const tBreak = S.find('breaking', 0, 42.93), tLots = S.find('Lots', 0, 44.28);
  const tWorks = Math.max(tHoles, S.find('works', 1, 46.06)), tSlowly = S.find('slowly', 0, 46.89);
  const tEvery = S.find('everyone', 0, 47.95), tDiff = S.find('different', 0, 49.41);

  // "It works": terminal, then keys, turn gold with a check (learned).
  // "slowly": folders, .venv, hosting go hollow, a beat apart (dashed terracotta outline = still open).
  const fillK = (i) => K.io(t, tWorks + 0.3 * i, 0.6);
  const holeK = (i) => K.io(t, tSlowly + 0.22 * i, 0.6);
  const holeOutline = (x, y, w, h, r, k) => {
    if (k <= 0) return;
    g.save(); g.setLineDash([6, 8]); g.lineWidth = 2; g.strokeStyle = K.rgba(C.accent, 0.6 * k);
    K.rr(x, y, w, h, r); g.stroke(); g.restore();
  };

  // ------------------------------------------------------------ the gap (drawn behind everything)
  // on "rarely" its warm light swells once and settles a little brighter (0 → +0.2 → +0.12)
  const kGap = K.io(t, tGap, 0.8);
  const swell = 0.2 * K.io(t, tRarely, 0.5, 'out') - 0.08 * K.io(t, tRarely + 0.5, 0.7);
  if (kGap > 0) {
    K.glow(L.gap.cx, 430, 260, C.accent, 0.14 * kGap + swell);
    L.gap.edges.forEach((x) => K.line(x, L.gap.top, x, L.gap.bottom, { k: kGap, dash: [6, 10], color: C.line2, w: 2 }));
    K.eyebrow('The gap', L.gap.cx, 168, { align: 'center', alpha: K.io(t, tGap, 0.5, 'out') });
  }

  // ------------------------------------------------------------ the two halls
  const hallDim = 1 - 0.5 * K.io(t, tOld, 0.8);
  const PILL_Y = [420, 490, 560];
  const hallPills = (cx, words, labels) => labels.forEach((s, i) =>
    K.rise(t, words[i], () => K.pill(s, cx, PILL_Y[i], { size: 28 }), 18, 0.5));
  K.layer(hallDim, () => {
    K.rise(t, tCS, () => {
      M.hall(120, 180, 600, 470, '', 'Computer Science');
      K.eyebrow('Mostly the ideas', 170, 236, { alpha: K.io(t, tMostly, 0.5, 'out') });
      hallPills(420, csW, ['algorithms', 'data structures', 'how computation works']);
    });
    K.rise(t, tIS, () => {
      // the title waits for "systems", by which time the degree chip has flown past it
      M.hall(1200, 180, 600, 470, '', '');
      K.rise(t, tSys, () => K.title('Information Systems', 1250, 300, { size: 44 }), 14, 0.5);
      K.eyebrow('Mostly the business', 1250, 236, { alpha: K.io(t, tMostly2, 0.5, 'out') });
      hallPills(1500, isW, ['databases', 'processes', 'projects']);
    });
  });

  // ------------------------------------------------------------ the degree chip goes home
  // 01's card, 02's chip (same tipped cap). On [[is]] it glides on an arc into its own hall,
  // then shrinks from the 440×76 chip to a 56-high "my degree" chip under the title.
  {
    const lf = { font: 'ui', size: 26, weight: 600 };
    const A = { x: L.degree.chip[0], y: L.degree.chip[1], w: 440, h: 76, is: 40, ix: 45, size: 28, r: 24 };
    const B = { x: 1250, y: 322, w: 34 + 16 + 24 + K.measure("Aaron's degree", lf) + 28, h: 56, is: 32, ix: 34, size: 26, r: 18 };
    const dk = K.io(t, tChip, M.motion.glide);
    // it arrives still reading "Information Systems"; as the hall's title rises on "systems" the
    // name moves up to the title and the chip shrinks into "my degree"
    const p = M.arc(A, B, dk, 40), lift = Math.sin(Math.PI * dk), sk = K.io(t, tSys, 0.5);
    const labOut = 1 - K.seg(t, tSys, tSys + 0.2), labIn = K.seg(t, tSys + 0.22, tSys + 0.5);   // never both at once
    const D = {
      x: p.x, y: p.y, w: K.lerp(A.w, B.w, sk), h: K.lerp(A.h, B.h, sk), is: K.lerp(A.is, B.is, sk),
      ix: K.lerp(A.ix, B.ix, sk), size: K.lerp(A.size, B.size, sk), r: K.lerp(A.r, B.r, sk),
    };
    const cx = D.x + D.w / 2, cy = D.y + D.h / 2;
    K.layer(dk >= 1 ? hallDim : 1, () => K.at(cx, cy, 1 + 0.035 * lift, 0, () => {
      g.translate(-cx, -cy);
      const c = M.iconCard(D.x, D.y, D.w, D.h, 'cap', '', { iconSize: D.is, iconX: D.ix, tilt: 0.22, r: D.r, size: D.size });
      g.save(); K.rr(D.x, D.y, D.w, D.h, D.r); g.clip();
      const by = c.icy + D.size * 0.36;
      K.text('Information Systems', c.tx, by, { font: 'ui', size: D.size, weight: 400, color: C.soft, alpha: labOut });
      K.text("Aaron's degree", c.tx, by, { ...lf, size: D.size, color: C.body, alpha: labIn });
      g.restore();
    }));
  }

  // ------------------------------------------------------------ the tools in the gap
  const NF = { font: 'ui', size: 28, weight: 600 }, PH = 28 * 1.9;
  const nouns = [['terminal', 870, 462], ['folders', 1050, 462], ['keys', 870, 534], ['hosting', 1050, 534]];
  const nounFill = { 0: fillK(0), 2: fillK(1) };
  const nounHole = { 1: holeK(0), 3: holeK(2) };
  nouns.forEach(([s, x, y], i) => {
    const k = K.io(t, gapW[i], 0.5, 'out');
    if (k <= 0) return;
    const f = nounFill[i] || 0, h = nounHole[i] || 0;
    const w0 = K.measure(s, NF) + 28 * 1.6, ext = 30 * f, yy = y - (1 - k) * 24;
    holeOutline(x - w0 / 2, y - PH / 2, w0, PH, PH / 2, h);
    K.layer(k * (1 - 0.62 * h), () => {
      // a learned tool grows a gold check on its left; the label stays where it was
      K.card(x - w0 / 2 - ext, yy - PH / 2, w0 + ext, PH, { r: PH / 2, stroke: K.mixColor(C.line2, C.head, 0.45 * f), shadow: false, glow: 0.5 * f });
      if (f > 0) K.at(x - w0 / 2 - ext + 26, yy, 0.6 + 0.4 * K.ease.out(f), 0, () => K.icon('check', 0, 0, 24, { color: C.head, alpha: f, w: 2.8 }));
      K.text(s, x, yy + 28 * 0.34, { ...NF, color: K.mixColor(C.strong, C.head, f), align: 'center' });
    });
  });

  // the mechanism, under the tools: "used everywhere" on "Used", "· rarely taught" on "rarely".
  const CAPY = 622, capA = 1;
  if (capA > 0) {
    const cf = { ...M.type.caption }, c1 = 'used everywhere', c2 = ' · rarely taught';
    const x0 = L.gap.cx - K.measure(c1 + c2, cf) / 2;
    K.layer(capA, () => {
      K.text(c1, x0, CAPY, { ...cf, alpha: K.io(t, tUsed, 0.6, 'out') });
      K.text(c2, x0 + K.measure(c1, cf), CAPY, { ...cf, alpha: K.io(t, tRarely, 0.6, 'out') });
    });
  }

  // ------------------------------------------------------------ Aaron's tags, lodged in the gap
  // they glide in from 02's tray once the crossfade has finished, shrinking to compact
  const cdGlow = K.io(t, tNeed + 0.2, 0.4, 'out') * (0.85 - 0.5 * K.io(t, tFirst + 0.4, 0.9));
  M.TAGS.slice(0, 3).forEach((tg, i) => {
    const t0 = 0.25 + 0.12 * i;
    const hole = i === 2 ? holeK(1) : 0;
    if (hole > 0) { const b = M.tagBox(1), p = M.gapSlot(i); holeOutline(p.x, p.y, b.w, b.h, 16, hole); }
    M.tagMove(tg.label, t, t0, M.motion.glide,
      { ...M.traySlot(i), compact: 0, glow: 0.5 },
      { ...M.gapSlot(i), glow: i === 1 ? cdGlow : 0, alpha: 1 - 0.8 * hole });
  });

  // ------------------------------------------------------------ everyone: a different set of holes
  // On "everyone" the old routes hand the bottom band to three people. Each carries a small copy of
  // the gap's own 2×2 tool grid (terminal, folders / keys, hosting), labelled, all plain at first.
  // On "different" every grid resolves in the gap's language: gold + check = learned, dashed
  // terracotta = hole. The first person's pattern is the gap's; the other two differ.
  {
    const MF = { font: 'ui', size: 26, weight: 600 }, MH = 44, MG = 10, CK = 30;
    const MW = Math.ceil(Math.max(...nouns.map(([s]) => K.measure(s, MF))) + 2 * 16 + CK);
    const GW = 2 * MW + MG, GH = 2 * MH + MG;
    const ICON = 60, IG = 22, UW = ICON + IG + GW, USP = 70;
    const PEOPLE = [[1, 0, 1, 0], [0, 1, 1, 1], [1, 1, 0, 0]];   // terminal, folders, keys, hosting
    const X0 = L.gap.cx - (3 * UW + 2 * USP) / 2, PYc = 790;
    const miniPill = (s, x, y, f, h) => {
      holeOutline(x, y, MW, MH, MH / 2, h);
      K.layer(1 - 0.62 * h, () => {
        K.card(x, y, MW, MH, { r: MH / 2, stroke: K.mixColor(C.line2, C.head, 0.5 * f), shadow: false, glow: 0.45 * f });
        if (f > 0) K.at(x + 24, y + MH / 2, 0.6 + 0.4 * K.ease.out(f), 0, () => K.icon('check', 0, 0, 19, { color: C.head, alpha: f, w: 2.6 }));
        K.text(s, x + MW / 2 + (CK / 2) * K.ease.out(f), y + MH / 2 + 26 * 0.34, { ...MF, color: K.mixColor(C.strong, C.head, f), align: 'center' });
      });
    };
    PEOPLE.forEach((pat, j) => {
      const k = K.io(t, tEvery + 0.03 + 0.12 * j, 0.5, 'out');   // after the routes have gone
      if (k <= 0) return;
      const ux = X0 + j * (UW + USP), gx = ux + ICON + IG, gy = PYc - GH / 2;
      K.layer(k, () => K.at(0, (1 - k) * 18, 1, 0, () => {
        K.icon('person', ux + ICON / 2, PYc + 2, ICON, { color: C.body });
        nouns.forEach(([s], i) => {
          const r = K.io(t, tDiff + 0.2 * j + 0.06 * i, 0.45, 'out');
          miniPill(s, gx + (i % 2) * (MW + MG), gy + Math.floor(i / 2) * (MH + MG), pat[i] ? r : 0, pat[i] ? 0 : r);
        });
      }));
    });
  }

  // ------------------------------------------------------------ the old routes, feeding the gap from below
  // each arrow leaves its tile's upper side and rises into the gap; forums draws its arrow on
  // "answers" and pops your exact error on "error". On "everyone" they hand the band to the people.
  const TY = 790, LY = 886;
  const routeDim = 1 - K.io(t, tEvery - 0.3, 0.33);   // gone before the people rise: no ghosting
  const routes = [
    { icon: 'person', x: 600, label: 'apprenticeship', at: tAp, arrowAt: tAp + 0.25, from: [656, 764], to: [866, 664], bend: 44 },
    { icon: 'chat', x: 960, label: 'forums', at: tForums, arrowAt: tAnswers, from: [960, TY - 56], to: [960, 664], bend: 0 },
    { icon: 'cross', x: 1320, label: 'breaking things', at: tBreak, arrowAt: tBreak + 0.25, from: [1264, 764], to: [1054, 664], bend: -44 },
  ];
  K.layer(routeDim, () => routes.forEach((r) => {
    const a = K.io(t, r.at, 0.4, 'out');
    if (a <= 0) return;
    K.arrow(r.from[0], r.from[1], r.to[0], r.to[1], { k: K.io(t, r.arrowAt, 0.6), bend: r.bend, color: C.soft, w: 2, headSize: 12 });
    if (r.icon === 'cross') {
      // the scene's one overshoot; then on "Lots of things" two small tilts that settle
      const s = 0.4 + 0.6 * K.io(t, r.at, 0.6, 'back');
      const u = K.seg(t, tLots, tLots + 1.2), rot = 0.06 * Math.sin(u * Math.PI * 4) * (1 - u);
      K.layer(a, () => K.at(r.x, TY, s, rot, () => K.iconTile('cross', 0, 0, 96, { color: C.accent })));
    } else {
      K.pop(t, r.at, r.x, TY, () => K.iconTile(r.icon, r.x, TY, 96));
    }
    K.text(r.label, r.x, LY, { size: 30, weight: 600, color: C.soft, align: 'center', alpha: a });
  }));

  // "your exact error": a small speech bubble pops out of the forums tile, in Python's real wording
  const ek = K.io(t, tError, 0.45, 'out');
  if (ek > 0) {
    const ef = { font: 'mono', size: 26, weight: 600 }, ew = K.measure('[Errno 2]', ef) + 36, eh = 48;
    const ax = 1022, ay = TY + 8;            // the tail's tip, just off the tile's right edge
    K.layer(ek * routeDim, () => K.at(ax, ay, 0.7 + 0.3 * ek, 0, () => {
      K.card(14, -eh / 2, ew, eh, { r: 16, shadow: false });
      g.save();
      g.beginPath(); g.moveTo(16, -8); g.lineTo(0, 0); g.lineTo(16, 8); g.closePath(); g.fillStyle = C.tile; g.fill();
      g.beginPath(); g.moveTo(15, -8.5); g.lineTo(0, 0); g.lineTo(15, 8.5);
      g.lineWidth = 1.5; g.strokeStyle = C.line2; g.lineJoin = 'round'; g.stroke();
      g.restore();
      K.text('[Errno 2]', 14 + ew / 2, 9, { ...ef, color: C.accent, align: 'center' });
    }));
  }
});
