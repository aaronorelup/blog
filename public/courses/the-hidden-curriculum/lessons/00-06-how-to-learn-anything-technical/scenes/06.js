/* 06 What that looks like: one real house whose public key opened every room (Moltbook), then a street of
   AI-built apps, some left public by default (RedAccess). */
SCENE('06', (t, S) => {
  const C = K.C, P = M.palette;
  K.bg({ glow: 0.32, glowX: 520, glowY: 600 });

  // ---- beats (local seconds)
  const tMolt = S.cue('moltbook', 0);
  const tKey = S.find('public', 0, 7.2);
  const tNormal = S.find('normal', 0, 9.85);
  const tRls = S.cue('rls', 11.75);
  const tOpened = S.find('opened', 0, 14.9);
  const tAnyone = S.find('Anyone', 1, 16.4);
  const tEmails = S.find('emails', 0, 19.3);
  const tFixed = S.cue('fixed', 21.6);
  const tRed = S.cue('redaccess', 24.2);
  const tPublic = S.cue('public', 34.7);
  const tWords = S.cue('words', 38.6);

  // ---- the house: starts large (continuity with 05's hero house), shows the open database on "database ... open
  //      to anyone", then closes and slides to the side position while the key is introduced
  const L = M.layout.side;
  const tDb = S.find('database', 0, 4.7), tOpen = S.find('open', 0, 5.3);
  const mv = K.io(t, tDb + 1.95, 0.8);                       // ~6.65: move to the side
  const HX = K.lerp(760, L.x, mv), HY = K.lerp(600, L.y, mv), HS = K.lerp(400, L.s, mv);
  const cutA = K.io(t, tDb, 0.7) * (1 - K.io(t, tDb + 1.85, 0.7));
  const hotA = K.io(t, tOpen, 0.5) * (1 - K.io(t, tDb + 1.8, 0.6));
  const cut = Math.max(cutA, K.io(t, tRls + 0.5, 0.9) * (1 - K.io(t, tFixed + 0.3, 0.9)));
  const hotOrder = { front: 0, living: 1, data: 2, back: 3 };
  const hot = (key) => Math.max(key === 'data' ? hotA : 0,
    K.io(t, tOpened + hotOrder[key] * 0.3, 0.6) * (1 - K.io(t, tFixed + 0.1, 0.6)));
  const gm = M.house(t, HX, HY, HS, {
    lights: 1,
    cutaway: cut,
    roomHot: hot,
    backOpen: hotA,
    leak: K.io(t, tOpen + 0.2, M.motion.leak, 'lin') * (1 - K.io(t, tDb + 1.8, 0.5)),
    roomIcons: { data: K.io(t, tEmails, 0.01) > 0 ? 'envelope' : 'server' },
  });
  // phase A label on the right: what "open to anyone" means
  // "built entirely by AI": the crew that built it hovers beside the house until it moves aside (the scene's one 'back' pop)
  const crewOut = 1 - K.io(t, tDb + 1.8, 0.5);
  if (crewOut > 0) M.crewGroup(t, 1380, 440, 3, 64, { k: K.io(t, S.find('built', 0, 2.8), 0.7), alpha: crewOut });
  M.chip('database open to anyone', 1380, 630, 'unseen', { k: K.io(t, tOpen, 0.5, 'out'), alpha: 1 - K.io(t, tDb + 1.8, 0.5) });

  // ---- Moltbook card above the house (rides left with it)
  M.dated(K.lerp(470, 230, mv), 150, 580, 'Moltbook · Jan 2026', 'Built entirely by AI, its founder said. Database open to anyone.',
    { kind: 'unseen', k: K.io(t, tMolt, 0.6, 'out') });

  // ---- the right-hand evidence (browser page + database setting), cleared when the street arrives
  const clearK = 1 - K.io(t, tRed - 0.45, 0.5);
  const winK = K.io(t, Math.max(tKey, tDb + 2.6), 0.7, 'out') * clearK;
  const D = gm.door;
  const keyX = D.x, keyY = D.y - D.h * 0.05;
  // the key, pinned on the front door (gold: normal, meant to be seen); it glows when it opens everything
  const keyK = K.io(t, tKey, 0.5, 'out');
  if (keyK > 0) {
    const glowK = K.io(t, tRls + 0.3, 0.6) * (1 - K.io(t, tFixed, 0.6));
    K.layer(keyK * (1 - cut), () => {
      if (glowK > 0) K.glow(keyX, keyY, 70, C.head, 0.5 * glowK);
      K.icon('key', keyX, keyY, 46, { color: K.mixColor(P.machine, '#FFE7B0', glowK * 0.6), w: 3.5 });
    });
  }
  const WX = 820, WY = 236, WW = 700, WH = 210;
  if (winK > 0) {
    K.layer(winK, () => {
      const tether = 1 - cut;
      const g = K.ctx(); g.save(); g.translate((1 - winK) * -60, 0);
      // a thin dashed tether from the key to the page
      K.path([[keyX + 26, keyY - 10], [WX - 60, keyY - 90], [WX + 2, WY + WH - 40]], { color: C.line2, w: 2, dash: [6, 8], head: false, k: winK, alpha: tether });
      const r = K.win(WX, WY, WW, WH, { kind: 'browser', title: 'page source', titleSize: 26, url: 'app.example', urlLock: false });
      K.text('anon key: eyJhbGciOi…', r.x + 30, r.y + 62, { font: 'mono', weight: 600, size: 30, color: C.head });
      g.restore();
    });
  }
  M.chip('normal: meant to be public', WX + WW / 2, WY + WH + 50, 'machine', { k: K.io(t, tNormal, 0.5, 'out'), alpha: clearK });

  // database setting card (separate from the page)
  const dbK = K.io(t, tRls, 0.6, 'out') * clearK;
  if (dbK > 0) {
    K.layer(dbK, () => {
      const x = WX, y = 640, w = WW, h = 130;
      K.card(x, y, w, h, { r: 18, stroke: K.mixColor(C.line2, P.unseen, 0.6) });
      K.eyebrow('database settings', x + 30, y + 44, { size: 22, color: C.head });
      K.text('row-level security: off', x + 30, y + 98, { font: 'mono', weight: 600, size: 30, color: P.unseen });
      K.icon('warning', x + w - 50, y + h / 2, 44, { color: P.unseen, w: 3 });
    });
  }
  // "anyone: read + change" after the key opens everything
  M.chip('anyone could read and change it', WX + WW / 2, 830, 'unseen', { k: K.io(t, tAnyone, 0.5, 'out'), alpha: clearK });

  // ---- under the house: what was exposed, then fixed
  const emK = K.io(t, tEmails, 0.5, 'out') * (1 - K.io(t, tFixed - 0.2, 0.4));
  if (emK > 0) M.label('emails · API tokens', L.x, 800, 'unseen', { alpha: emK });
  M.chip('fixed within hours of the report', L.x, 800, 'machine', { k: K.io(t, tFixed, 0.5, 'out') });

  // ---- the street: a 3×3 block of AI-built apps (RedAccess scan); the exposed ones light up in a cascade on
  //      "found thousands exposing": terracotta halo, open door, leak trail
  M.dated(1000, 150, 800, 'RedAccess · May 2026', '~5,000 of ~380,000 scanned apps exposing data',
    { kind: 'unseen', k: K.io(t, tRed + 0.15, 0.6, 'out') });
  const tThousands = S.find('thousands', 1, 30.2);
  const openSet = { 1: 0, 3: 1, 8: 2, 5: 3 };              // 4 of the 9 exposed, cascade order
  const rows = [430, 590, 750];
  const GX = 1500, GAP = 200, SS = 140;
  const exK = (idx) => openSet[idx] == null ? 0 : K.io(t, tThousands + openSet[idx] * 0.25, 0.6, 'out');
  rows.forEach((ry, r) => {
    const rowK = K.io(t, tRed + 0.4 + r * 0.35, 0.8, 'out');
    if (rowK <= 0) return;
    // halos behind the exposed houses
    for (let c = 0; c < 3; c++) {
      const e = exK(r * 3 + c);
      if (e > 0) { const hg = M.geo(GX + (c - 1) * GAP, ry, SS); K.glow((hg.body.x0 + hg.body.x1) / 2, (hg.bounds.y0 + hg.bounds.y1) / 2, SS * 0.75, C.accent, 0.42 * e); }
    }
    const geos = M.street(t, GX, ry, 3, SS, GAP, {
      k: rowK,
      each: (c) => {
        const idx = r * 3 + c, e = exK(idx);
        return {
          lights: (i) => ((r * 3 + c + i) % 3 === 0 ? 0.25 : 0.9),
          tint: e > 0 ? K.mixColor(P.outline, P.unseen, e) : undefined,
          leak: openSet[idx] == null ? 0 : K.io(t, tThousands + openSet[idx] * 0.25 + 0.2, M.motion.leak, 'lin'),
        };
      },
    });
    // doors swing open (terracotta) on the exposed ones
    geos.forEach((hg, c) => {
      const ok = exK(r * 3 + c);
      if (ok <= 0) return;
      const d = hg.door, g = K.ctx();
      K.glow(d.x, d.y, 40, C.accent, 0.5 * ok);
      g.save();
      g.fillStyle = '#0B0C16'; g.fillRect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);       // the opening
      const sw = d.w * 0.9 * Math.sin(ok * 1.2);                                        // door leaf swings out left
      g.beginPath();
      g.moveTo(d.x - d.w / 2, d.y - d.h / 2); g.lineTo(d.x - d.w / 2 - sw, d.y - d.h / 2 - sw * 0.2);
      g.lineTo(d.x - d.w / 2 - sw, d.y + d.h / 2 + sw * 0.1); g.lineTo(d.x - d.w / 2, d.y + d.h / 2); g.closePath();
      g.fillStyle = K.mixColor(P.wood, C.accent, 0.45); g.fill();
      g.strokeStyle = P.unseen; g.lineWidth = 2; g.stroke();
      g.restore();
    });
  });

  // ---- the default toggle: sits on "Public"
  const tgK = K.io(t, tPublic, 0.6, 'out');
  if (tgK > 0) {
    K.layer(tgK, () => {
      const cx = 1000, cy = 560, w = 300, h = 64, x0 = cx - w / 2, y0 = cy - h / 2;
      K.eyebrow('new project default', cx, y0 - 22, { size: 22, align: 'center', color: C.head });
      K.card(x0, y0, w, h, { r: h / 2, fill: C.tile, stroke: C.line2, shadow: false });
      const g = K.ctx();
      g.save(); K.rr(x0 + 5, y0 + 5, w / 2 - 5, h - 10, (h - 10) / 2); g.fillStyle = K.rgba(C.accent, 0.28); g.fill();
      g.strokeStyle = C.accent; g.lineWidth = 2; g.stroke(); g.restore();
      K.text('Public', x0 + w / 4 + 2, cy + 10, { font: 'ui', weight: 600, size: 28, color: C.accent, align: 'center' });
      K.text('Private', x0 + w * 3 / 4, cy + 10, { font: 'ui', weight: 600, size: 28, color: C.soft, align: 'center' });
    });
  }

  // ---- words you'll meet
  const words = [['row-level security', 'unseen', S.find('row-level', 1, tWords + 1)], ['public', 'unseen', S.find('public', 2, tWords + 2.2)],
    ['anon key', 'machine', S.find('anon', 0, tWords + 2.9)], ['exposed', 'unseen', S.find('exposed', 0, tWords + 3.6)]];
  const ws = words.map(([s]) => K.measure(s, { font: 'mono', weight: 600, size: 28 }) + 28 * 1.6);
  const gap = 28, total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let px = 1300 - total / 2;
  words.forEach(([s, kind, at], i) => {
    const k = K.io(t, Math.max(at, tWords), 0.5, 'out');
    const cx = px + ws[i] / 2; px += ws[i] + gap;
    if (k <= 0) return;
    K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => K.pill(s, cx, 880, {
      size: 28, font: 'mono', color: kind === 'machine' ? C.head : C.accent,
      stroke: kind === 'machine' ? K.mixColor(C.line2, C.head, 0.5) : K.mixColor(C.line2, C.accent, 0.6),
    })));
  });
});
