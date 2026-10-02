/* 14 — Skills, connectors, plugins
   The desk sits left of centre. Connectors are phone lines to service tiles on the left (the outside world),
   skills are books on a shelf to the right (only the label lands on the desk; the pages load on demand),
   a plugin is a boxed kit at the far right. Then a counter row of shops along the bottom, which gives way
   to the trust line (third-party add-ons are code you trust). */
SCENE('14', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette;
  // word times (local), first match at or after `after`
  const w = (re, after, fb) => {
    for (let i = 0; i < 40; i++) { const v = S.find(re, i, NaN); if (isNaN(v)) break; if (v >= after - 0.01) return v; }
    return fb;
  };
  const cSkill = S.cue('skill', 0), cConn = S.cue('connector', 17.43), cPlug = S.cue('plugin', 25.51);
  const cShops = S.cue('shops', 31.22), cTrust = S.cue('trust', 45.72);
  const tFolder = w('folder', cSkill, 1), tFile = w('file', cSkill, 2.8), tScripts = w('scripts', cSkill, 6.4);
  const tLabel = w('label', cSkill, 8.2), tPages = w('pages', cSkill, 10.2), tClerk = w('clerk', cSkill, 11.3);
  const tOpen = w('open', cSkill, 13.1), tOther = w('other', cSkill, 14.9);
  const tGmail = w('Gmail', cConn, 20.5), tNotion = w('Notion', cConn, 21.3), tGit = w('GitHub', cConn, 22), tBuilt = w('built', cConn, 22.9);
  const tBoxed = w('boxed', cPlug, 25.8), tSk = w('skills', cPlug, 27.4), tCo = w('connectors', cPlug, 28), tCm = w('commands', cPlug, 28.8), tHk = w('hooks', cPlug, 29.5);
  const tDir = w(/^app's/i, cShops, 32.15), tMkt = w('Claude', cShops, 33.8), tRep = w(/^reported/i, cShops, 35.85);
  const tGitM = w('Claude', tMkt + 1, 38.57), tOAI = w('OpenAI', cShops, 43.36);
  const tCode = w('code', cTrust, 47.62), tClaw = w(/^OpenClaw/i, cTrust, 49.56), tHund = w('hundreds', cTrust, 51.43), tNet = w(/^Network/i, cTrust, 56.31);
  const tAll = w('All', cTrust, 55.09);

  // while the shop row is up, everything above it steps back to half so the row reads as its own beat
  const dimA = 1 - 0.5 * K.io(t, cShops - 0.3, 0.6) * (1 - K.io(t, cTrust, 0.6));
  const BX = { x0: 1500, x1: 1820, y0: 236, y1: 520 };
  K.layer(dimA, () => {
  // ---------------------------------------------------------------- the desk (left of centre)
  const D = M.desk({ w: 720, h: 250 }, { cx: 700, cy: 470 });
  const loadK = K.io(t, tPages, 0.8);
  const st = M.stage(t, {
    desk: D,
    clerk: { glow: K.io(t, tClerk, 0.6) * (1 - K.io(t, tOpen + 1.5, 1)) },
    ruler: { fill: 0.14 + 0.18 * loadK + 0.04 * K.io(t, tLabel, 0.6), cell: 12, gap: 6 },
  });
  // a couple of messages already on the desk
  [[0.86, 0.12, -0.03], [0.74, 0.62, 0.04]].forEach(([u, v, r]) => { const p = M.spot(D, u, v); M.paper(p.x, p.y, { kind: 'msg', w: 120, h: 62, rot: r, lines: 2 }); });

  // ---------------------------------------------------------------- skills: books on a shelf
  const SH = { x0: 1100, x1: 1440, plank: 400 };
  const shelfK = K.io(t, cSkill + 0.15, 0.6);
  const spines = [{ x: 1140, h: 186, name: 'pdf', hi: 1 }, { x: 1200, h: 170, name: 'brand' }, { x: 1260, h: 186, name: 'review' }, { x: 1320, h: 160 }, { x: 1374, h: 176 }];
  K.layer(shelfK, () => {
    K.eyebrow('skills', SH.x0, 196, { size: 22, color: C.head });
    K.card(SH.x0 - 10, SH.plank, SH.x1 - SH.x0 + 20, 16, { r: 4, fill: P.wood, stroke: false, shadow: true });
    spines.forEach((b, i) => {
      const pull = b.hi ? K.io(t, tFolder, 0.5) * (1 - K.io(t, tLabel, 0.6)) : 0;
      const bx = b.x, by = SH.plank - b.h - pull * 14, gold = b.name ? 1 : 0;
      K.card(bx, by, 44, b.h, { r: 6, fill: b.name ? '#3A2F4A' : K.rgba(C.tile, 0.9), stroke: gold ? K.rgba(C.head, b.hi ? 0.95 : 0.55) : K.rgba(C.line2, 0.8), shadow: false, lw: b.hi ? 2.5 : 1.5, glow: b.hi ? 0.4 * pull + 0.5 * K.env(t, tPages, tPages + 1.6, 0.4) : 0 });
      K.line(bx + 6, by + 18, bx + 38, by + 18, { color: K.rgba(C.head, gold ? 0.6 : 0.25), w: 2 });
      K.line(bx + 6, by + b.h - 18, bx + 38, by + b.h - 18, { color: K.rgba(C.head, gold ? 0.6 : 0.25), w: 2 });
      if (b.name) K.at(bx + 22, by + b.h / 2, 1, -Math.PI / 2, () => K.text(b.name, 0, 9, { font: 'ui', weight: 600, size: 26, color: b.hi ? C.head : C.body, align: 'center' }));
    });
  });
  // the open folder under the shelf: SKILL.md (+ a script)
  const fk = K.io(t, tFolder, 0.6);
  const fDim = 1 - 0.45 * K.io(t, tLabel, 0.6);
  K.layer(fk * fDim, () => {
    K.card(SH.x0 - 10, 436, SH.x1 - SH.x0 + 20, 214, { r: 18, fill: K.rgba(C.tile, 0.9), stroke: K.rgba(C.head, 0.45), shadow: false });
    K.folder(SH.x0 + 30, 470, 34, {});
    K.text('pdf/', SH.x0 + 62, 480, { font: 'mono', weight: 600, size: 26, color: C.strong });
  });
  const mdK = K.io(t, tFile, 0.5, 'out'), pyK = K.io(t, tScripts, 0.5, 'out');
  K.layer(fk * fDim * mdK, () => M.file(1190, 552 - (1 - mdK) * 14, 92, { ext: 'md', name: 'SKILL.md' }));
  K.layer(fk * fDim * pyK, () => M.file(1350, 552 - (1 - pyK) * 14, 92, { ext: 'py', name: 'tool.py' }));
  // only the label sits on the desk...
  const nl = M.spot(D, 0.12, 0.5);
  const lab = M.land(t, tLabel - 0.3, nl.x, nl.y, SH.x0 - 60, 320, M.motion.land);
  if (t >= tLabel - 0.3) M.paper(lab.x, lab.y, { kind: 'note', w: 170, h: 84, title: 'pdf skill', lines: 1, alpha: lab.a, rot: -0.03 * lab.k, edge: 0.5 * K.env(t, tLabel, tPages, 0.4) });
  // ...the pages load when the clerk needs them
  const pg = M.spot(D, 0.38, 0.42);
  const pl = M.land(t, tPages, pg.x, pg.y, 1190, 552, 0.8);
  if (t >= tPages) M.file(pl.x, pl.y, 92, { ext: 'md', name: 'SKILL.md', alpha: pl.a, glow: 0.6 * K.env(t, tPages + 0.6, tClerk + 1.2, 0.5) });
  // open format
  K.layer(K.io(t, tOpen, 0.5), () => {
    K.pill('open format', 1340, 186, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5) });
  });
  K.layer(K.io(t, tOther, 0.5), () => M.dated('since Dec 2025', 1270, 150));

  // ---------------------------------------------------------------- connectors: phone lines to services
  const TX = 170, tiles = [{ y: 214, n: 'Gmail', at: tGmail, ic: 'envelope' }, { y: 354, n: 'Notion', at: tNotion, ic: null }, { y: 494, n: 'GitHub', at: tGit, ic: 'code' }];
  const ends = [[372, 392], [352, 462], [352, 530]];
  K.layer(K.io(t, cConn, 0.5), () => K.eyebrow('connectors', 96, 160, { size: 22, color: C.accent }));
  tiles.forEach((c, i) => {
    const k = K.io(t, c.at - 0.15, 0.5, 'out');
    if (k <= 0) return;
    M.phone(t, ends[i][0], ends[i][1], TX + 46, c.y, { k: K.io(t, c.at - 0.15, 0.6), pulse: true, bend: (i - 1) * 10 });
    K.layer(k, () => {
      K.card(TX - 42, c.y - 42 + (1 - k) * 10, 84, 84, { r: 22, fill: C.tile, stroke: K.rgba(C.accent, 0.8), lw: 2 });
      if (c.ic) K.icon(c.ic, TX, c.y + (1 - k) * 10, 50, { color: C.accent });
      else K.text('N', TX, c.y + 14 + (1 - k) * 10, { font: 'head', weight: 700, size: 40, color: C.accent, align: 'center' });
      K.text(c.n, TX, c.y + 78, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
    });
  });
  K.layer(K.io(t, tBuilt, 0.5), () => K.pill('built on MCP', 186, 628, { size: 26, font: 'mono', color: C.accent, stroke: K.rgba(C.accent, 0.6) }));

  // ---------------------------------------------------------------- plugins: a boxed kit
  const bk = K.io(t, cPlug, 0.6, 'out');
  K.layer(bk, () => {
    K.eyebrow('plugin', BX.x0, 206, { size: 22, color: C.head });
    K.card(BX.x0, BX.y0 + (1 - bk) * 16, BX.x1 - BX.x0, BX.y1 - BX.y0, { r: 16, fill: K.rgba('#4A3426', 0.92), stroke: K.rgba(C.head, 0.6), lw: 2 });
    K.line(BX.x0 + 2, BX.y0 + 44, BX.x1 - 2, BX.y0 + 44, { color: K.rgba(C.head, 0.5), w: 2 });
    K.card((BX.x0 + BX.x1) / 2 - 40, BX.y0 + 14, 80, 16, { r: 8, fill: K.rgba(C.head, 0.35), stroke: false, shadow: false });
  });
  const items = [
    { at: tSk, x: 1580, y: 340, lab: 'skills', draw: (x, y) => { K.card(x - 30, y - 34, 26, 64, { r: 4, fill: '#3A2F4A', stroke: C.head, shadow: false, lw: 2 }); K.card(x + 2, y - 30, 26, 60, { r: 4, fill: '#3A2F4A', stroke: K.rgba(C.head, 0.6), shadow: false, lw: 2 }); } },
    { at: tCo, x: 1740, y: 340, lab: 'connectors', draw: (x, y) => { K.line(x - 36, y + 18, x + 4, y - 14, { color: C.accent, w: 3, dash: [7, 6] }); K.card(x + 2, y - 30, 34, 34, { r: 9, fill: C.tile, stroke: C.accent, shadow: false, lw: 2 }); } },
    { at: tCm, x: 1580, y: 448, lab: 'commands', draw: (x, y) => M.chip('/', x, y - 4, { size: 34 }) },
    { at: tHk, x: 1740, y: 448, lab: 'hooks', draw: (x, y) => K.icon('gear', x, y - 4, 52, { color: C.head }) },
  ];
  items.forEach((it) => {
    const k = K.io(t, it.at - 0.1, 0.5, 'out');
    if (k <= 0) return;
    K.layer(k, () => {
      it.draw(it.x, it.y - (1 - k) * 60);
      K.text(it.lab, it.x, it.y + 54, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
    });
  });
  K.layer(K.io(t, tBoxed + 0.2, 0.5), () => K.pill('plugin = a kit', (BX.x0 + BX.x1) / 2, 572, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5) }));
  });
  // trust: a warning drops on the box (the scene's one overshoot), then rests at 40%
  const wk = K.io(t, cTrust, 0.6, 'back');
  if (t >= cTrust) {
    const wa = 1 - 0.6 * K.io(t, tAll, 1.2);
    K.layer(K.clamp(wk * 1.5) * wa, () => {
      K.glow(BX.x1 - 18, BX.y0 + 6, 70, C.accent, 0.35);
      K.iconTile('warning', BX.x1 - 18, BX.y0 + 6 - (1 - wk) * 80, 64, { color: C.accent, stroke: C.accent });
    });
  }

  // ---------------------------------------------------------------- shops: where you get them
  const shopOut = K.io(t, cTrust, 0.6);
  const RY = 704, RH = 150, RW = 400, xs = [115, 545, 975, 1405];
  if (t >= cShops - 0.1 && shopOut < 1) {
    K.layer((1 - shopOut) * K.io(t, cShops, 0.5), () => K.eyebrow('where you get them', 115, 682, { size: 22, color: C.accent }));
    const shops = [
      { at: tDir, title: 'in-app directory', sub: 'all three, one list', icon: (x, y) => K.icon('puzzle', x, y, 46, { color: C.accent }) },
      { at: tMkt, title: 'Claude Marketplace', sub: '2,000+ add-ons', subAt: tRep, flag: 'REPORTED', date: 'Sep 2026', icon: (x, y) => K.icon('sparkle', x, y, 46, { color: C.head }) },
      { at: tGitM, title: 'plugin marketplaces', sub: '= git repositories', icon: (x, y) => { K.folder(x, y - 6, 34, {}); K.line(x - 6, y + 22, x + 22, y + 22, { color: C.accent, w: 3 }); K.line(x + 4, y + 22, x + 16, y + 10, { color: C.accent, w: 3 }); } },
      { at: tOAI, title: 'OpenAI', sub: 'apps · plugins', icon: (x, y) => K.icon('globe', x, y, 46, { color: C.soft }) },
    ];
    shops.forEach((s, i) => {
      const k = K.io(t, s.at - 0.15, 0.5, 'out');
      if (k <= 0) return;
      const x0 = xs[i], y0 = RY + (1 - k) * 18 + shopOut * 40;
      K.layer(k * (1 - shopOut), () => {
        K.card(x0, y0, RW, RH, { r: 18, fill: K.rgba(C.tile, 0.95), stroke: K.rgba(C.accent, 0.55), lw: 1.5 });
        s.icon(x0 + 50, y0 + 98);
        K.text(s.title, x0 + 96, y0 + 84, { font: 'ui', weight: 600, size: 30, color: C.strong });
        const sk = s.subAt ? K.io(t, s.subAt - 0.1, 0.5) : 1;
        K.layer(sk, () => K.text(s.sub, x0 + 96, y0 + 124, { font: 'ui', weight: 600, size: 26, color: C.soft }));
        // "Sep 2026 · REPORTED" lives inside this card's top-right corner (badge right, date to its left)
        if (s.flag) {
          const fw = K.measure(s.flag, { font: 'ui', weight: 700, size: 22, tracking: 2.5, upper: true }) + 36;
          K.layer(sk, () => {
            M.flag(s.flag, x0 + RW - 16 - fw / 2, y0 + 34);
            if (s.date) M.dated(s.date, x0 + RW - 30 - fw, y0 + 42, { align: 'right' });
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------- trust: third-party = code you trust
  if (t >= cTrust) {
    const ck = K.io(t, tCode - 0.2, 0.6);
    K.layer(ck, () => {
      K.icon('warning', 150, 770 + (1 - ck) * 10, 52, { color: C.accent });
      K.text('third-party add-on = code you trust', 196, 782 + (1 - ck) * 10, { font: 'ui', weight: 600, size: 34, color: C.strong });
    });
    const ok = K.io(t, tClaw - 0.1, 0.6, 'out');
    K.layer(ok, () => {
      const x0 = 1000, y0 = 700 + (1 - ok) * 16;
      K.card(x0, y0, 560, 130, { r: 18, fill: K.rgba(C.tile, 0.95), stroke: K.rgba(C.accent, 0.7), lw: 2 });
      K.text("OpenClaw's skill store", x0 + 28, y0 + 52, { font: 'ui', weight: 600, size: 30, color: C.strong });
      M.dated('Feb 2026', x0 + 532, y0 + 50, { align: 'right' });
      K.layer(K.io(t, tHund - 0.1, 0.5), () => K.text('hundreds of malicious skills', x0 + 28, y0 + 98, { font: 'ui', weight: 600, size: 28, color: C.accent }));
    });
    M.shelf('The Network', 1840, 880, { prefix: 'own lessons', k: K.io(t, tAll, 0.6) });
  }
});
