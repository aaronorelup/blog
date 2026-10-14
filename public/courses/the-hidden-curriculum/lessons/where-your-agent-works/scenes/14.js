/* 14 — You and the agent
   Two soft columns, spread across the frame, then three: THE AGENT (the gold worker tile as its header), YOU
   (person) and BRING IN AN EXPERT (shield). The faint street from scene 13 sits behind at s 0.85 and fades out in
   the first second. Items are Karla 30, one short line each (the narration carries the detail; no grey sub-lines).
   - [[agent-part]] the two columns sit centred and wide apart. Agent rows on their words: chat or task? · writes
     commands for its own shell · fixes its own setup · fetches vendors' privacy pages -> 'the four questions'
     + gold 'dated' pills.
   - [[your-part]] the agent column dims; you rows: the room, by the output · local or cloud · the account and its
     settings · one dedicated folder (the gold folder slides in; "never your home folder" in terracotta on "never").
   - [[approval]] both columns slide left to make room; fifth row "the approval level" with a slider ask first <-> Auto:
     it slides to Auto on "Auto"; the right-hand space holds the Claude Code docs card (the classifier), the two
     starting-mode facts and Mollick's card; on "keep it asking" the slider goes back to ask first. Pointer chip to
     the lesson on letting it loose.
   - [[expert]] the approval cards leave; the agent and you columns dim; the expert column builds with its question;
     three chips on "employer", "client contract", "privacy law".
   - [[who]] two entries: managed computer -> IT or security admin; patient / client / customer data -> compliance,
     legal or data-protection owner.
   Exit: three columns at rest on a plain background, the expert column in focus. One 'back' overshoot: none. */
SCENE('14', (t, S) => {
  const C = K.C;
  const io = (a, d = 0.6, e) => K.io(t, a, d, e);
  const f = (re, n, fb) => S.find(re, n, fb);

  // ---- times (local)
  const tY = S.cue('your-part', 15.21), tAp = S.cue('approval', 24.89), tE = S.cue('expert', 39.92), tW = S.cue('who', 47.64);
  const aRow = [f(/^decides/i, 0, 0.77), f(/^writes/i, 0, 3.56), f(/^fixes/i, 0, 6.16), f(/^fetch/i, 0, 8.6)];
  const tFour = f(/^four$/i, 0, 13.0), tDated = f(/^dated/i, 0, 14.47);
  const yRow = [f(/^room/i, 0, 15.9), f(/^local/i, 0, 17.5), f(/^account/i, 0, 19.4), f(/^dedicated/i, 0, 21.6), tAp + 0.2];
  const tNever = f(/^never$/i, 0, 23.2);
  const tStarts = f(/^starts$/i, 0, 28.4), tAuto = f(/^auto/i, 0, 29.1), tClass = f(/^classifier$/i, 0, 30.4);
  const tMol = f(/^ethan$/i, 0, 35.1), tKeep = f(/^keep$/i, 0, 38.5);
  const tEmp = f(/^employer/i, 0, 41.7), tCon = f(/^contract/i, 0, 43.0), tLaw = f(/^law/i, 0, 44.8);
  const tIT = f(/^ask$/i, 0, 50.0), tPat = f(/^patient/i, 0, 53.9);

  K.bg({ glow: 0.25 });

  // ---- the faint street behind (a hand-off from scene 13; gone once the cards are up)
  const s = 0.85, SX = 1245 - 1050 * s, SY = 885 - 860 * s;
  const streetA = 0.2 * (1 - io(0.3, 0.9));
  if (streetA > 0.002) K.layer(streetA, () => M.street(t, {
    x: SX, y: SY, s,
    house: { labels: false, office: 0, workFolder: 1, rooms: { chat: 0.5, cowork: 0.5, code: 0.6 } },
    road: { label: false },
    vendor: { labels: false, office: 1, spare: 1, logbook: 1, officeLit: 0.4, spareLit: 0.4 },
  }));

  // ---- column geometry: two columns spread across the frame, sliding left when the approval cards need the right third
  const W = 540, Y0 = 180, H = 670;
  const sl = io(tAp - 0.1, 0.8);
  const AX = K.lerp(300, 100, sl), YX = K.lerp(1080, 660, sl), EX = 1290;
  const focusE = io(tE + 0.2, 0.8);                 // expert in focus: the other two columns step back
  const backA = 1 - 0.45 * focusE;

  const colCard = (x, a, lit) => K.card(x, Y0, W, H, { r: 24, alpha: a, fill: K.rgba(C.tile, 0.86), stroke: K.mixColor(C.line2, C.head, 0.35 * lit), glow: 0.12 * lit });
  const head = (x, title, a) => K.text(title, x, Y0 + 62, { font: 'head', weight: 700, size: 38, color: C.head, alpha: a });

  // rows: an icon on the left, a main line (Karla 30, wraps); returns the row's height so rows stack by measurement
  const MAIN = { font: 'ui', weight: 600, size: 30 }, LH = 38, GAP = 30, TXW = W - 8 - 88 - 28;
  const row = (x, y, a, icon, main, o = {}) => {
    const lines = K.wrap(main, TXW, MAIN);
    if (a > 0.002) {
      const pk = o.pulse || 0;
      K.layer(a, () => K.at(0, (1 - a) * 12, 1, 0, () => {
        if (pk > 0) K.glow(x + 46, y - 10, 46, C.head, 0.4 * pk);
        if (o.folder) K.folder(x + 46, y - 12, 44, { color: C.head });
        else K.icon(icon, x + 46, y - 10, 36, { color: o.ic || K.mixColor(C.body, C.head, 0.55 + 0.45 * pk), w: 2.6 });
        lines.forEach((ln, i) => K.text(ln, x + 88, y + i * LH, { ...MAIN, color: o.color || C.strong }));
      }));
    }
    return lines.length * LH;
  };
  const rv = (a) => io(a - 0.15, 0.55);
  const pulse = (a) => Math.max(0, 1 - Math.abs(t - (a + 0.5)) / 0.9) * (t > a - 0.2 ? 1 : 0);
  const R0 = 312;

  // ---------------- THE AGENT
  K.layer(backA, () => {
    const x = AX;
    const lit = 1 - 0.6 * io(tY, 0.8);
    colCard(x, 1, lit);
    M.worker(t, x + 52, Y0 + 50, { s: 60, shadow: false, glow: 0.6 * lit });
    head(x + 100, 'the agent', 1);
    const rows = [
      ['chat', 'chat or task?'],
      ['terminal', 'writes commands for its own shell'],
      ['gear', 'fixes its own setup'],
      ['globe', "fetches vendors' privacy pages"],
    ];
    // once you take over, the agent's rows step back a little
    const dimA = 1 - 0.3 * io(tY, 0.8);
    let y = R0;
    K.layer(dimA, () => {
      rows.forEach((r, i) => { y += row(x + 8, y, rv(aRow[i]), r[0], r[1], { pulse: i < 3 ? pulse(aRow[i]) * (1 - io(tY, 0.5)) : 0 }) + GAP; });
      // the four questions, dated
      const py = y - GAP + 26;
      const qa = io(tFour - 0.1, 0.5), da = io(tDated - 0.1, 0.5, 'out');
      const qw = M.pillL('the four questions', x + 96, py, { size: 26, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.4), alpha: qa });
      M.pillL('dated', x + 96 + qw + 12, py, { size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: da });
    });
  });

  // ---------------- YOU
  K.layer(backA, () => {
    const x = YX;
    const ya = io(tY - 0.3, 0.7);
    colCard(x, 1, ya);
    K.layer(0.45 + 0.55 * ya, () => {
      K.iconTile('person', x + 52, Y0 + 50, 60, { color: K.mixColor(C.body, C.head, ya) });
      head(x + 100, 'you', 1);
    });
    const rows = [
      ['house', 'the room, by the output'],
      ['cloud', 'local or cloud'],
      ['person', 'the account and its settings'],
    ];
    let y = R0;
    rows.forEach((r, i) => { y += row(x + 8, y, rv(yRow[i]), r[0], r[1], { pulse: pulse(yRow[i]) }) + GAP; });
    // the dedicated folder: the gold folder slides in; "never your home folder" lands on "never"
    const fa = rv(yRow[3]), slide = io(yRow[3] - 0.1, 0.7, 'out');
    const yF = y;
    K.layer(fa, () => K.at((1 - slide) * -40, 0, 1, 0, () =>
      row(x + 8, yF, 1, 'folder', 'one dedicated folder', { folder: true, pulse: pulse(yRow[3]) })));
    K.text('never your home folder', x + 96, yF + LH + 2, { font: 'ui', weight: 600, size: 28, color: C.accent, alpha: io(tNever - 0.1, 0.5) });
    y = yF + LH + 38 + GAP;
    // the approval level: a slider ask first <-> Auto
    const y5 = y, a5 = rv(yRow[4]);
    row(x + 8, y5, a5, 'check', 'the approval level', { pulse: pulse(yRow[4]) });
    const pos = io(tAuto - 0.2, 0.6) * (1 - io(tKeep, 0.7));
    K.layer(io(tAp + 0.4, 0.5), () => {
      const ty = y5 + 52, tx0 = x + 96, g = K.ctx();
      const askW = K.text('ask first', tx0, ty + 9, { font: 'ui', weight: 600, size: 26, color: K.mixColor(C.soft, C.strong, 1 - pos) });
      const trx = tx0 + askW + 20, trw = 150, th = 34;
      g.save(); K.rr(trx, ty - th / 2, trw, th, th / 2); g.fillStyle = K.mixColor(C.panel, C.head, 0.25 + 0.5 * pos); g.fill();
      g.lineWidth = 2; g.strokeStyle = K.mixColor(C.line2, C.head, 0.6); g.stroke();
      g.beginPath(); g.arc(K.lerp(trx + th / 2, trx + trw - th / 2, pos), ty, th / 2 - 5, 0, 7); g.fillStyle = C.strong; g.fill(); g.restore();
      K.text('Auto', trx + trw + 20, ty + 9, { font: 'ui', weight: 700, size: 26, color: K.mixColor(C.soft, C.head, pos) });
    });
    M.pointer('the lesson on letting it loose', x + 32, y5 + 112, { alpha: io(tKeep + 0.5, 0.6) });
  });

  // ---------------- APPROVAL (the right-hand space, before the expert arrives)
  {
    const x = EX, w = W;
    const out = io(tE - 0.35, 0.5);
    const ca = io(tStarts - 0.1, 0.6) * (1 - out), ma = io(tMol - 0.1, 0.6) * (1 - out);
    if (ca > 0.002) K.at(out * 30, 0, 1, 0, () => {
      const h1 = M.dated(x, Y0, w, {
        eyebrow: 'Anthropic · Claude Code docs · Cowork changelog',
        body: 'Auto mode: “a classifier reviews most actions in the background and blocks the risky ones instead of asking you.”',
        size: 28, footer: 'as of 2026-10-14', alpha: ca, glow: 0.4 * pulse(tClass),
      });
      const ly = Y0 + h1 + 40;
      K.text('starts in Auto: Claude Code v2.1.283+', x + 16, ly, { font: 'ui', weight: 600, size: 26, color: C.body, alpha: ca });
      K.text('and new desktop Code tab sessions', x + 16, ly + 36, { font: 'ui', weight: 600, size: 26, color: C.body, alpha: ca });
      K.text('(since 2026-09-24)', x + 16, ly + 72, { font: 'ui', weight: 400, size: 26, color: C.soft, alpha: ca });
      M.dated(x, ly + 108, w, {
        eyebrow: 'Ethan Mollick · One Useful Thing · 2026-07-23',
        body: 'Keep agents asking first “until you trust the system.”',
        size: 28, alpha: ma,
      });
    });
  }

  // ---------------- BRING IN AN EXPERT
  {
    const x = EX, w = W;
    const ea = io(tE, 0.7);
    if (ea > 0.002) {
      K.layer(ea, () => {
        colCard(x, 1, 1);
        K.iconTile('shield', x + 52, Y0 + 50, 60, { color: C.head });
        head(x + 100, 'bring in an expert', 1);
      });
      const qa = io(tE + 0.4, 0.6);
      K.layer(qa, () => K.para('Is the data allowed to go there?', x + 32, 304, w - 64, { font: 'read', size: 30, italic: true, color: C.strong }));
      const chip = (s, cx, cy, a) => M.pillL(s, cx, cy, { size: 26, color: C.strong, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.4), alpha: a });
      const w1 = chip('your employer', x + 32, 384, io(tEmp - 0.1, 0.5));
      chip('a client contract', x + 32 + w1 + 12, 384, io(tCon - 0.1, 0.5));
      chip('a privacy law', x + 32, 438, io(tLaw - 0.1, 0.5));
      // who to ask
      const wa = io(tW, 0.6);
      K.line(x + 32, 486, x + w - 32, 486, { k: wa, color: C.line2, w: 1.5 });
      const e1 = io(tIT - 0.2, 0.6), e2 = io(tPat - 0.3, 0.6);
      const ANS = { font: 'ui', weight: 700, size: 30, color: C.head, lh: LH };
      let y = 542;
      y += row(x + 8, y, e1, 'laptop', 'a computer your work manages', { pulse: pulse(tIT) });
      K.layer(e1, () => K.para('→ your IT or security admin', x + 96, y, TXW, ANS));
      y += K.wrap('→ your IT or security admin', TXW, ANS).length * LH + GAP + 4;
      y += row(x + 8, y, e2, 'lock', 'patient, client or customer data', { pulse: pulse(tPat) });
      K.layer(e2, () => K.para('→ compliance, legal or data-protection owner', x + 96, y, TXW, ANS));
    }
  }
});
