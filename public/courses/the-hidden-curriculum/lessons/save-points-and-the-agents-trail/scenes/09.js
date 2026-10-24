/* 09 — Evidence is something you read
   The guide hands the walker slips from the trail (test output, the command + what it returned, a screenshot),
   then Aaron's /version.json is compared with the newest stone: the commit matches, a check settles.
   Map at M.VIEW.left (as in 04, 05, 08); everything readable on the right is drawn in screen space. */
SCENE('09', (t, S) => {
  const C = K.C, L = M.L;
  K.bg();
  const cue = (n, fb) => S.cue(n, fb);
  const tEv = cue('evidence', 0), tVer = cue('version', 11.4);
  const fw = (w, fb, n = 0) => S.find(w, n, fb);
  const tTest = fw('test', 5.8), tCmd = fw('command', 7.3), tShot = fw('screenshot', 9.6);
  const tFile = fw('version', tVer + 3.4), tCommit = fw('commit', tVer + 5.7), tBranch = fw('branch', tVer + 6.2);
  const tCompare = fw('compare', tVer + 8.7), tPushed = fw('pushed', tVer + 10.9), tDone = fw('Treating', tVer + 11.8);
  const id = M.ids();

  // ------------------------------------------------------------------ the map (identical to the other scenes)
  const cam = K.cam(t, [{ at: -5, ...M.VIEW.left }]);
  const ts = M.ts(cam);
  const SX = L.stoneX, Y = L.pathY, MX = L.mergeX, [c1, c2] = L.sideStones;
  const matchK = K.io(t, tCompare + 0.9, 0.6, 'out');                  // the commit line reaches the stone
  const okK = K.io(t, tPushed - 0.4, 0.5, 'out');                       // the check settles
  const showWalker = K.io(t, -0.4, 0.6);
  const verOut = K.io(t, tVer - 0.2, 0.5);                              // slips + first card leave
  const stoneGlow = matchK * (0.6 + 0.4 * okK);
  K.withCam(cam, () => {
    M.sheet(t, { ts });
    M.mainPath();
    M.trail(L.side, { kind: 'side' });
    M.back(SX[0], Y, SX[1], Y, { alpha: 0.6 });
    M.back(SX[1], Y, MX, Y, { alpha: 0.6, bend: -46 });
    M.stone(SX[0], Y, { id: id.home, ts });
    M.stone(SX[1], Y, { id: id.about, ts });
    M.stone(c1[0], c1[1], { id: id.contact, ts, idSide: 'above' });
    M.stone(c2[0], c2[1], { id: id.phone, ts });
    M.stone(MX, Y, { id: id.merge, ts, glow: stoneGlow, idColor: K.mixColor(C.body, C.head, matchK) });
    M.signFor('feature/contact', c2[0], c2[1], { ts, h: 96 });
    M.signFor('main', MX, Y, { ts, lantern: 1, t });
    // the tracing sheet from 08 lifts away
    M.tracing(170, 250, 1080, 560, { k: 1, lift: K.io(t, 0, 0.8) });
    M.guide(t, L.guide[0], L.guide[1], { penTo: [L.guide[0] + 160, L.guide[1] - 60] });
    M.walker(t, L.walker[0], L.walker[1], { alpha: showWalker });
  });

  // walker / guide on screen (for hand-offs and the sight-line)
  const [gx, gy] = M.toScreen(cam, L.guide[0] + 60, L.guide[1] - 20);
  const [wx, wy] = M.toScreen(cam, L.walker[0], L.walker[1] - 34);
  const [stx, sty] = M.toScreen(cam, MX, Y);

  // ------------------------------------------------------------------ [[evidence]]: the S117 card and three slips
  const evA = K.io(t, tEv + 0.3, 0.6) * (1 - verOut);
  if (evA > 0.002) {
    K.layer(evA, () => K.at(0, (1 - K.ease.out(K.io(t, tEv + 0.3, 0.6))) * 16, 1, 0, () => {
      M.dated(L.cards.x - 40, L.cards.y, L.cards.w + 40, {
        eyebrow: 'Anthropic · Best practices for Claude Code · ' + M.READ, size: 28, quote: true,
        body: 'Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned, or a screenshot of the result.',
      });
    }));
  }
  // slips: handed from the guide (one flies across), then fanned into a row
  const slips = [
    { at: tTest, kind: 'terminal', title: 'tests', lines: ['$ npm test', 'passed'], label: ['test output'] },
    { at: tCmd, kind: 'terminal', title: 'command', lines: ['$ git push', 'main -> main'], label: ['the command', '+ what it returned'] },
    { at: tShot, kind: 'browser', title: 'screenshot', lines: null, label: ['a screenshot'] },
  ];
  const SW = 250, SH = 160, row = 492, x0 = 1015, gap = 25;
  // the hand-off: a folded slip travels from the guide's pen to the walker
  const hand = K.io(t, tEv + 1.2, 1.6, 'io');
  if (hand > 0 && hand < 1 && evA > 0.01) {
    const px = K.lerp(gx, wx - 30, hand), py = K.lerp(gy, wy - 40, hand) - Math.sin(hand * Math.PI) * 120;
    K.layer(evA * Math.min(1, hand * 6, (1 - hand) * 6 + 0.4), () => K.at(px, py, 1, -0.1 + hand * 0.2, () => {
      K.card(-38, -26, 76, 52, { r: 6, fill: K.mixColor(C.tile, C.paper, 0.2), stroke: C.head, lw: 2, shadow: false });
      K.line(-24, -8, 22, -8, { color: C.head, w: 2, alpha: 0.7 }); K.line(-24, 6, 10, 6, { color: C.head, w: 2, alpha: 0.7 });
    }));
  }
  slips.forEach((s, i) => {
    const k = K.io(t, s.at - 0.25, 0.6, 'out');
    if (k <= 0.002 || evA <= 0.002) return;
    const tx = x0 + i * (SW + gap), ty = row;
    const x = K.lerp(wx - SW / 2, tx, k), y = K.lerp(wy - 60, ty, k);
    K.layer(evA * Math.min(1, k * 1.4), () => {
      // a slip: a small card with a header strip (icon + what it is), not a full window (no room for window buttons)
      K.card(x, y, SW, SH, { r: 12, fill: C.code, stroke: C.line2, lw: 1.5 });
      const gg = K.ctx(); gg.save(); K.rr(x, y, SW, SH, 12); gg.clip(); gg.fillStyle = C.tile; gg.fillRect(x, y, SW, 46); gg.restore();
      K.line(x, y + 46, x + SW, y + 46, { color: C.line, w: 1.5 });
      K.icon(s.kind === 'browser' ? 'globe' : 'terminal', x + 26, y + 23, 26, { color: C.soft, w: 2 });
      K.text(s.title, x + 50, y + 32, { font: 'ui', weight: 600, size: 26, color: C.body });
      const r = { x, y: y + 46, w: SW, h: SH - 46 };
      if (s.lines) {
        K.text(s.lines[0], r.x + 18, r.y + 42, { font: 'mono', size: 26, color: C.body });
        K.text(s.lines[1], r.x + 18, r.y + 84, { font: 'mono', size: 26, color: C.head });
      } else {
        // a tiny page: a header bar, a heading line, two text lines (a picture of a result, not text to read)
        const g = K.ctx(); g.save(); g.fillStyle = K.rgba(C.paper, 0.1); g.fillRect(r.x + 14, r.y + 12, r.w - 28, 22); g.restore();
        K.line(r.x + 20, r.y + 54, r.x + 150, r.y + 54, { color: C.head, w: 6 });
        K.line(r.x + 20, r.y + 76, r.x + r.w - 30, r.y + 76, { color: C.soft, w: 3 });
        K.line(r.x + 20, r.y + 92, r.x + r.w - 70, r.y + 92, { color: C.soft, w: 3 });
      }
      K.layer(K.clamp(k * 2 - 1), () => s.label.forEach((ln, j) =>
        K.text(ln, x + SW / 2, y + SH + 36 + j * 32, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' })));
    });
  });
  // the walker reads the slips (sight-line brightens while they arrive)
  const readA = evA * (0.4 + 0.6 * K.env(t, tTest, tShot + 1.2, 0.4));
  const lookI = t < tCmd ? 0 : t < tShot ? 1 : 2;
  // the line runs under ALL the labels (the deepest is two lines) so it never strikes through a word,
  // and leaves from the side of the walker that faces the slip being read
  const lbBottom = row + SH + 36 + 32 + 26;
  const tgx = x0 + lookI * (SW + gap) + SW / 2;
  const sx0 = wx + Math.sign(tgx - wx) * 30;
  if (K.io(t, tTest, 0.5) > 0) M.sight(sx0, wy - 8, tgx, lbBottom, { k: K.io(t, tTest, 0.5), alpha: readA * 0.9 });

  // ------------------------------------------------------------------ [[version]]: /version.json against the newest stone
  const vA = K.io(t, tVer + 0.3, 0.6);
  if (vA > 0.002) {
    K.layer(vA, () => K.at(0, (1 - K.ease.out(vA)) * 16, 1, 0, () => {
      M.dated(L.cards.x - 40, L.cards.y, L.cards.w + 40, {
        eyebrow: 'Aaron Orelup · AO-043 · 2026-10-09', size: 28, quote: true,
        body: 'Every build writes /version.json with the commit, the branch Cloudflare built, the time, and the newest listed post.',
      });
    }));
  }
  const edK = K.io(t, tFile - 0.6, 0.6, 'out');
  const ER = { x: 1000, y: 388, w: 800, h: 338 };
  if (edK > 0.002) {
    K.layer(edK, () => K.at(0, (1 - K.ease.out(edK)) * 20, 1, 0, () => {
      const r = K.win(ER.x, ER.y, ER.w, ER.h, { kind: 'code', title: '/version.json  ·  example values', titleSize: 26, focus: okK > 0.5 });
      const lines = ['{', `  "commit": "${id.merge || 'abc1234'}",`, '  "branch": "main",', '  "built": "<build time>",', '  "newest": "<newest post>"', '}'];
      const size = 26, lh = size * 1.55, pad = 26, lineY = (i) => r.y + pad + size + i * lh;
      // highlight bands under the line being spoken about
      const hi = (i, a) => { if (a <= 0.002) return; const g = K.ctx(); g.save(); g.globalAlpha *= a; g.fillStyle = K.rgba(C.head, 0.14); K.rr(r.x + 70, lineY(i) - size - 2, r.w - 100, lh - 2, 8); g.fill(); g.restore(); };
      hi(1, K.env(t, tCommit - 0.1, Infinity, 0.35));
      hi(2, K.env(t, tBranch - 0.1, tCompare, 0.35));
      K.editor(r, t, lines, { typeAt: tFile - 0.2, cps: 70, size });
      // the commit value → the newest stone
      const vx = r.x + pad + 60 + K.measure('  "commit": "', { font: 'mono', size }) - 6, vy = lineY(1) - size * 0.35;
      if (matchK > 0) {
        K.mark(vx + 6, lineY(1) + 8, K.measure(`"${id.merge || 'abc1234'}"`, { font: 'mono', size }) - 12, matchK);
        K.arrow(r.x - 6, lineY(1) - 9, stx + 36, sty - 8, { k: matchK, color: C.head, w: 3, bend: 30, headSize: 14 });
      }
      if (okK > 0.002) K.layer(okK, () => {
        const cx = r.x + r.w - 70, cy = lineY(1) - 10, g = K.ctx();
        g.save(); g.beginPath(); g.arc(cx, cy, 24 * (0.8 + 0.2 * K.ease.out(okK)), 0, 7); g.fillStyle = C.page; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.head; g.stroke(); g.restore();
        K.icon('check', cx, cy, 30, { color: C.head, w: 3 });
      });
    }));
  }
  // label for the match, on the map side near the stone
  if (okK > 0.002) K.pill('live = what was pushed', stx, sty + 120, { size: 26, color: C.head, stroke: C.head, fill: C.tile, alpha: okK });

  // ------------------------------------------------------------------ "done" is a claim: pointer to the owning lesson
  const pk = K.io(t, tDone + 0.6, 0.6);
  if (pk > 0.002) M.pointer('the lesson on when the agent says done', 1800, 880, { alpha: pk, align: 'right' });
});
