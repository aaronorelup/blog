// 04 — Why it's hidden: two kinds of sign.
// The shop (as 03 left it, wide) dims; the "staff only" plaque on the door duplicates and two copies slide out to
// head two cards: MAC · LINUX (the sign is painted into the name: the gold dot, and `ls` skipping dot names, with
// Rob Pike's recollection) and WINDOWS (the sign is a paper "Hidden" flag hung on the file; dots are ignored).
// On [[show-hidden]] both cards recede and four "show hidden items" names stack in the middle (labels, not steps).
SCENE('04', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette, C = K.C;
  const g = K.ctx();

  // ---- cues (local seconds) + word anchors
  const cDot = S.cue('painted-dot', 0);
  const cPike = S.cue('pike', 10.59);
  const cFlag = S.cue('flag-on-door', 29.85);
  const cOpen = S.cue('open-doors', 37.24);
  const cShow = S.cue('show-hidden', 46.14);
  const w = (word, n, fb) => S.find(word, n, fb);
  const wKinds = w('kinds', 0, cDot + 0.67);
  const wMac = w('Mac', 0, cDot + 2.25);
  const wPainted = w('painted', 0, cDot + 3.84);
  const wStarts = w('starts', 0, cDot + 6.45);
  const wSkipped = w('skipped', 0, cDot + 7.89);
  const wListed = w('listed', 0, cDot + 9.42);
  const wDotDot1 = w('dot', 1, cDot + 20.2);       // "...entries, dot and dot dot"
  const wDotDot2 = w('dot', 2, cDot + 21.07);        // "dot dot"
  const wHid = w(/^hid$/i, 0, cDot + 22.75);       // "It hid every name" (a plain 'hid' prefix would match "hide")
  const wEveryName = w('every', 0, cDot + 23.0);
  const wSettings = w('settings', 0, cDot + 26.41);
  const wMistake = w('mistake', 0, cDot + 28.91);
  const wLater = w('later', 0, cDot + 28.08);
  const wFlag = w('flag', 0, cFlag + 3.48);
  const wHiddenAttr = w('Hidden', 0, cFlag + 5.76);
  const wDotted = w('dotted', 0, cOpen + 1.22);
  const wPlain = w('plain', 0, cOpen + 2.48);
  const wUnless = w('unless', 0, cOpen + 3.16);
  const wGit = w('Git', 0, cOpen + 5.19);
  const wFlags = w('flags', 0, cOpen + 6.19);
  const wEvery = cShow;                                // "Every system can show..." starts on the cue

  // ---- the set behind: dims as the two kinds of sign come forward
  const dim = K.io(t, cDot + 0.1, 0.8);
  const outK = K.io(t, wKinds + 0.15, 0.7);          // cards build and plaque copies slide out
  // the shop fades fully away (no ghosted porter or shelves between the cards); first frame = 03's last frame
  const shopA = 1 - dim;
  if (shopA > 0.001) K.layer(shopA, () => {
    M.shop(t, {});
    M.shelfIcon('gear', 'settings', 0, 0);
    M.shelfIcon('clock', 'history', 0, 1);
    M.shelfIcon('puzzle', 'supplies', 1, 0);
    M.shelfIcon('key', 'keys', 1, 1, { color: P.secret });
  });

  // ---- the two cards
  const CL = { x: 130, y: 230, w: 800, h: 640 }, CR = { x: 990, y: 230, w: 800, h: 640 };
  const plaqueY = 300;
  const recede = K.io(t, cShow - 0.1, 0.7);                       // both cards step back for the pills
  const leftFocus = 1 - 0.55 * K.io(t, cFlag - 0.2, 0.6);         // left steps back when Windows is up
  const revealR = K.io(t, cFlag - 0.35, 0.75);                     // Windows card arrives on 'flag-on-door'
  const shiftL = (1 - revealR) * (960 - (CL.x + CL.w / 2));        // Mac/Linux card starts centred, slides left
  const shiftR = (1 - revealR) * 120;                               // Windows card slides in from the right
  const cardA = (1 - 0.82 * recede);

  const drawCard = (R, a, dx) => {
    if (a * outK <= 0) return;
    K.card(R.x + dx, R.y + (1 - outK) * 24, R.w, R.h, { r: 24, fill: '#191A2C', stroke: C.line2, alpha: outK * a });
  };
  drawCard(CL, 1, shiftL);
  drawCard(CR, revealR, shiftR);

  // plaque copies: from the door's sign to the head of each card, "staff only" turning into the system's name
  const slideK = K.io(t, wKinds + 0.1, 0.8);
  const textK = K.io(t, wKinds + 0.7, 0.5);
  const plaque = (tx, label, a) => {
    const x = K.lerp(L.sign.x, tx, slideK), y = K.lerp(L.sign.y, plaqueY, slideK);
    const al = K.clamp(outK * 3) * cardA * a;
    if (al <= 0) return;
    M.sign(x, y, { text: 'staff only', alpha: al * (1 - textK) });
    M.sign(x, y, { text: label, size: 30, alpha: al * textK });
  };
  plaque(CL.x + CL.w / 2 + shiftL, 'Mac · Linux', leftFocus);
  // the Windows plaque: a second copy hops from the door only when Windows is named
  if (revealR > 0) {
    const al = cardA * revealR;
    M.sign(CR.x + CR.w / 2 + shiftR, plaqueY + (1 - revealR) * 16, { text: 'Windows', size: 30, alpha: al });
  }

  // ================= LEFT: the sign is painted into the name
  const lx = CL.x + CL.w / 2;
  g.save(); g.translate(shiftL, 0);
  K.layer(cardA * leftFocus, () => {
    // ".env" with its dot painted on "painted"
    const nameK = K.io(t, wMac - 0.1, 0.6);
    const paint = K.io(t, wPainted, 0.7);
    const pulse = paint * (1 - K.io(t, wPainted + 1.2, 1.0));
    M.dotName('.env', lx, 432, { size: 64, align: 'center', dotK: paint, glow: 0.35 + 0.65 * pulse, alpha: nameK });
    K.text('a dot in the name', lx, 492, { ...M.type.read, color: C.body, align: 'center', alpha: K.io(t, wStarts - 0.2, 0.6) });

    // the list command skips dot names
    const tk = K.io(t, wSkipped - 0.3, 0.6);
    if (tk > 0) K.layer(tk, () => {
      const W = { x: CL.x + 40, y: 530, w: CL.w - 80, h: 270 };
      const r = K.win(W.x, W.y, W.w, W.h, { kind: 'terminal', title: 'Terminal', titleSize: 26 });
      const x0 = r.x + 30, mono = { font: 'mono', size: 28, weight: 600 };
      const cmd = K.typed('ls', t, wSkipped + 0.1, 8);
      K.text('$ ', x0, r.y + 50, { ...mono, color: C.head });
      const cw = K.text(cmd, x0 + K.measure('$ ', mono), r.y + 50, { ...mono, color: C.strong });
      const outAt = wListed - 0.1;
      if (t < outAt + 0.2 && K.caretOn(t)) { g.fillStyle = C.strong; g.fillRect(x0 + K.measure('$ ' + cmd, mono) + 4, r.y + 26, 14, 30); }
      K.text('README.md   app.py   src', x0, r.y + 96, { ...mono, color: C.body, alpha: K.io(t, outAt, 0.4) });

      // what it skipped: dashed ghost chips ("there, just not listed")
      const skK = K.io(t, outAt + 0.6, 0.6);
      K.text('skipped', x0, r.y + 150, { ...M.type.label, weight: 400, color: C.soft, alpha: skK });
      const chips = [
        { s: '.', at: outAt + 0.6, ring: wDotDot1 - 0.1 },
        { s: '..', at: outAt + 0.6, ring: wDotDot2 - 0.1 },
        { s: '.git', at: wEveryName - 0.05, ring: Infinity },
        { s: '.env', at: wEveryName + 0.3, ring: Infinity },
        { s: '.bashrc', at: wSettings - 0.15, ring: Infinity },
      ];
      let cx = x0 + 120;
      const cy = r.y + 150;
      chips.forEach((c) => {
        const f = { font: 'mono', size: 26, weight: 600 };
        const cwid = K.measure(c.s, f) + 30, k = K.io(t, c.at, 0.5);
        if (k > 0) K.layer(k, () => {
          g.save(); g.setLineDash([6, 6]); g.strokeStyle = K.rgba(P.ghost, 0.9); g.lineWidth = 2;
          K.rr(cx, cy - 30, cwid, 42, 10); g.stroke(); g.restore();
          M.dotName(c.s, cx + 15, cy, { size: 26, color: K.mixColor(P.name, P.ghost, 0.45) });
          const rk = K.io(t, c.ring, 0.6);
          if (rk > 0) { g.save(); g.globalAlpha *= rk; g.shadowColor = K.rgba(C.head, 0.6); g.shadowBlur = 14; g.strokeStyle = P.attention; g.lineWidth = 3; K.rr(cx - 4, cy - 34, cwid + 8, 50, 13); g.stroke(); g.restore(); }
        });
        cx += cwid + 16;
      });
    });
    // Pike's recollection, hedged
    const capK = K.io(t, cPike + 0.4, 0.6);
    const capK2 = K.io(t, wLater - 0.1, 0.6);
    const s1 = 'as Rob Pike tells it', s2 = '  ·  he later called it a mistake';
    const f = { ...M.type.label, weight: 400 };
    const tw = K.measure(s1, f) + capK2 * K.measure(s2, f);
    const xL = lx - tw / 2;
    K.text(s1, xL, 842, { ...f, color: C.soft, alpha: capK });
    K.text(s2, xL + K.measure(s1, f), 842, { ...f, color: C.soft, alpha: capK2 });
  });
  g.restore();

  // ================= RIGHT: the sign is a flag hung on the file
  const rx = CR.x + CR.w / 2, iy = 450;
  const cols = [rx - 250, rx - 20, rx + 205];
  g.save(); g.translate(shiftR, 0);
  if (revealR > 0) K.layer(cardA * revealR, () => {
    // 1) an ordinary file gets the flag
    const f1 = K.io(t, cFlag + 0.2, 0.6);
    const tag1 = K.io(t, wFlag - 0.1, 0.6);
    const gh1 = K.io(t, wFlag + 0.5, 0.7);
    M.item(cols[0], iy, 96, { kind: 'file', ext: 'txt', name: 'notes.txt', size: 26, alpha: f1, tag: tag1, ghost: gh1, t });

    // 2) a dotted name, no flag: in plain view (the dot is not a sign here, so it stays unpainted)
    const f2 = K.io(t, wDotted - 0.15, 0.6);
    M.item(cols[1], iy, 96, { kind: 'file', name: '.env', size: 26, alpha: f2, dotK: 0 });
    K.text('in plain view', cols[1], 605, { ...M.type.label, color: C.body, align: 'center', alpha: K.io(t, wPlain - 0.1, 0.6) });

    // 3) Git for Windows hangs the flag on its own .git
    const f3 = K.io(t, wGit - 0.15, 0.6);
    const tag3 = K.io(t, wFlags - 0.1, 0.6);
    const gh3 = K.io(t, wFlags + 0.4, 0.7);
    M.item(cols[2], iy, 96, { kind: 'folder', name: '.git', size: 26, alpha: f3, tag: tag3, ghost: gh3, t, dotK: 0 });
    K.pill('Git for Windows', cols[2], 596, { size: 26, alpha: f3, color: C.strong });

    // what the flag is called, and the rule
    const aK = K.io(t, wHiddenAttr - 0.1, 0.6);
    const fA = { ...M.type.read, weight: 400 }, fB = { ...M.type.read };
    const sA = 'a flag on the file:  ', sB = 'the Hidden attribute';
    const xA = rx - (K.measure(sA, fA) + K.measure(sB, fB)) / 2;
    K.text(sA, xA, 712, { ...fA, color: C.body, alpha: K.io(t, wFlag - 0.1, 0.6) });
    K.text(sB, xA + K.measure(sA, fA), 712, { ...fB, color: C.strong, alpha: aK });
    K.text('dot ignored  ·  flag decides', rx, 800, { ...M.type.read, color: C.head, align: 'center', alpha: K.io(t, wUnless, 0.6) });
  });
  g.restore();

  // ================= the show-hidden names (labels only, not steps)
  const pk = K.io(t, wEvery - 0.1, 0.7);
  if (pk > 0) {
    const PW = 880, PH = 430, px = 960 - PW / 2, py = 345;
    K.card(px, py + (1 - pk) * 20, PW, PH, { r: 24, fill: '#171828', stroke: C.head, alpha: pk, glow: 0.25 * pk });
    K.layer(pk, () => K.eyebrow('SHOW HIDDEN ITEMS', px + 40, py + 56 + (1 - pk) * 20, { size: 22 }));
    const rows = [
      ['Explorer', 'View > Show > Hidden items'],
      ['Finder', 'Cmd+Shift+.'],
      ['Terminal', 'ls -a'],
      ['PowerShell', 'Get-ChildItem -Force'],
    ];
    const mono = { font: 'mono', size: 28, weight: 600 };
    rows.forEach(([who, keys], i) => {
      const k = K.stagger(t, wEvery + 0.3, i, 0.35, 0.6);
      if (k <= 0) return;
      const y = py + 130 + i * 80 + (1 - k) * 14;
      K.text(who, px + 60, y + 10, { ...M.type.label, color: C.soft, alpha: k });
      const kw = K.measure(keys, mono) + 44, kx = px + 260;
      K.card(kx, y - 26, kw, 52, { r: 26, fill: C.tile, stroke: C.line2, shadow: false, alpha: k });
      K.text(keys, kx + 22, y + 10, { ...mono, color: C.strong, alpha: k });
    });
  }
});
