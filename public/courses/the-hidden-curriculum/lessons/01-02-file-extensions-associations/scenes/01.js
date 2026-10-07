/* 01.02 scene 01: A label in the name, a ledger in the computer (title card)
   Still life under the title: the hello.txt string (01.01's exact look) and a closed LEDGER book.
   [[headline]] the conclusion line rises; on "label" the tag's .txt gets the gold underline + pill.
   [[ledger]] the book opens into a 3-row page (file associations); on "matches" a gold dashed line runs from the
   string to the .txt row and the finger bar lands there.
   [[same-beads]] the bead row is held (gold ring), .txt is struck and the tag becomes hello.py; the finger and the
   line slide to the .py row (the label picked the row, the bytes never moved).
   The table already reads .txt -> Notepad, .py -> VS Code, .docx -> Word, so the rename alone sends hello.py to VS Code.
   [[edit]] the pen comes in on a DIFFERENT row (.docx), crosses out Word and writes LibreOffice, then fades out; on
   "edit" that row glows gold (renaming and editing the table are two separate actions).
   [[agents]] the sparkle drifts in and ties report.docx onto a fresh short string; on "decides" the finger slides
   to the .docx row and a second dashed line joins it. End frame: two strings, open ledger (pen gone). */
SCENE('01', (t, S) => {
  const C = K.C;

  // ground: painted plate on the lower band only; all type sits on the dark upper band
  K.bg({ glow: 0.3, glowX: 960, glowY: 300 });
  K.plate('plate', t, { zoom: true, shade: 0.5, mask: [700, 920] });

  // ---- beats (local seconds)
  const aHead = S.cue('headline', 6.44);
  const aLabel = S.find('label', 0, aHead + 1.05);             // "a label in the file's name"
  const aLedger = S.cue('ledger', 9.28);
  const aTable = S.find('table', 0, aLedger + 1.1);
  const aMatch = S.find('matches', 0, aLedger + 1.66);
  const aSame = S.cue('same-beads', 13.24);
  const aLabel2 = S.find('label', 2, aSame + 0.75);            // "changes the label"
  const aBytes = S.find('bytes', 0, aSame + 1.75);
  const aEdit = S.cue('edit', 16.16);
  const aAlways = S.find('always', 0, aEdit + 1.4);
  const aEditW = S.find(/^edit$/i, 0, aEdit + 3.56);            // "edit that table"
  const aAgents = S.cue('agents', 21.5);
  const aLabels = S.find('labels', 0, aAgents + 2.1);
  const aDecides = S.find('decides', 1, aAgents + 3.53);

  // ---- title block (on screen from frame 0)
  K.eyebrow('01.02 · Your computer, under the hood', 960, 170, { size: 20, align: 'center' });
  K.title('File extensions & associations', 960, 250, { size: 80, align: 'center' });
  K.text('Which program opens a file, and how you change that', 960, 318, { font: 'read', size: 32, color: C.body, align: 'center' });
  const cK = K.io(t, aHead, 0.7);
  if (cK > 0) K.text('A label in the name, a ledger in the computer.', 960, 394 + (1 - cK) * 16, { font: 'read', weight: 600, size: 40, color: C.head, align: 'center', alpha: cK });

  // ---- the ledger (right): closed book from frame 0, opens on [[ledger]]
  const LX = 1300, LY = 476, LW = 480;
  const openK = K.io(t, aLedger + 0.1, 0.7);
  // pen timeline on the .docx row (row 2): strike, lift back, write, fade 0.4 s after the write
  const pIn = aEdit, pS0 = aEdit + 0.6, pS1 = pS0 + 0.6, pW0 = pS1 + 0.3, pW1 = pW0 + 1.0, pOut = pW1 + 0.4;
  const strikeK = K.io(t, pS0, pS1 - pS0, 'sine'), writeK = K.io(t, pW0, pW1 - pW0, 'sine');
  // M.ledger crossfades the struck word while it types the new one (both visible mid-way). Workaround without touching
  // 00-shared.js: pad the new name with 120 zero-width spaces, so tk 0.5-0.969 (the lift) only fades the struck
  // Word out, and the visible letters type over tk 0.969-1 (the write) onto clean paper.
  const ZW = String.fromCharCode(0x200B).repeat(120);
  const liftK = K.io(t, pS1, pW0 - pS1);
  const toK = 0.5 * strikeK + 0.46875 * liftK + 0.03125 * writeK;
  // finger: .txt (0) on "matches", .py (1) on "label", fades for the pen, .docx (2) on "decides"
  const fRow = K.lerp(K.lerp(0, 1, K.io(t, aLabel2, 0.6)), 2, K.io(t, aDecides, 0.6));
  const fingerK = K.io(t, aMatch, 0.5) * (1 - 0.4 * K.io(t, aEdit, 0.5) + 0.4 * K.io(t, aDecides - 0.2, 0.5));
  const ledgerOpts = {
    size: 30,
    titleK: K.io(t, aLedger + 0.5, 0.7, 'lin'),
    rows: [
      { label: '.txt', door: 'Notepad' },
      { label: '.py', door: 'VS Code', pulse: K.io(t, aLabel2 + 0.35, 0.9, 'lin') },
      { label: '.docx', door: 'Word', to: ZW + 'LibreOffice', toK, hi: K.env(t, aEditW, aEditW + 1.6, 0.4) * 0.8 },
    ],
    finger: fRow, fingerK,
  };
  // closed book fades out, then the page unfolds (two calls so the book and the rows never overlap)
  const bookA = K.lerp(0.6, 1, K.io(t, aLedger - 0.4, 0.4)) * (1 - K.io(t, aLedger + 0.1, 0.35));
  const pageK = K.io(t, aLedger + 0.1, 0.7);
  if (bookA > 0) M.ledger(LX, LY, LW, { ...ledgerOpts, open: 0, alpha: bookA });
  const L = M.ledger(LX, LY, LW, { ...ledgerOpts, open: K.lerp(0.63, 1, pageK), alpha: K.clamp(pageK * 2.5) });

  // ---- the main string: hello.txt, renamed to hello.py on [[same-beads]] (beads never move)
  const SX = 800, SY = 560, SS = 0.55;
  const markK = K.io(t, aLabel, 0.6);
  const strike = K.io(t, aSame + 0.15, 0.5);
  const renK = K.io(t, aLabel2 - 0.1, 0.7);
    const Gm = M.drawString(SX, SY, SS, {
    t, preset: 'txt', labels: 'none',
    lit: (i) => 0.15 + 0.6 * K.env(t, aBytes + i * 0.04, aBytes + 1.2 + i * 0.04, 0.35),
    tag: { name: 'hello.txt', to: 'hello.py', k: renK, mark: markK, strike },
  });

  // hold ring: draws in on [[same-beads]], fades out (not un-drawn) after the pen arrives
  const ringIn = K.io(t, aSame, 0.6), ringOut = 1 - K.io(t, aEdit + 0.4, 0.8);
  if (ringIn > 0 && ringOut > 0) K.layer(ringOut, () => K.ring((Gm.x0 + Gm.x1) / 2, SY, (Gm.x1 - Gm.x0) / 2 + Gm.r * 1.9, Gm.r * 2, ringIn, { color: C.head, w: 3, rot: 0 }));

  // gold dashed line from the string's end to the finger's row (the porter's attention)
  const lineK = K.io(t, aMatch, 0.6);
  if (lineK > 0 && openK >= 1) {
    const ry = L.rowY(Math.min(fRow, 1));
    K.arrow(Gm.right + 22, SY, LX - 14, ry, { k: lineK, color: C.gold, w: 2.5, dash: [9, 9], alpha: 0.75 * (1 - 0.6 * K.io(t, aDecides, 0.6)), bend: -12 });
  }

  // ---- the pen: enters at [[edit]] from the lower right, strikes Word on the .docx row, writes LibreOffice, fades.
  // The nib stays at the right (leading) end of the cell and the barrel leans DOWN-right, into the empty space right of
  // below the page, so it never sits on the other rows, the header, or text it has not yet written.
  const penA = K.io(t, pIn, 0.5) * (1 - K.io(t, pOut, 0.4));
  if (penA > 0) {
    const ry = L.rowY(2) + 6;
    const font = { font: 'ui', weight: 600, size: L.size };
    const oldW = K.measure('Word', font), newW = K.measure('LibreOffice', font);
    const endOld = L.doorX + oldW + 8;
    let px, py;
    if (t < pS0) { const k = K.io(t, pIn, pS0 - pIn); px = K.lerp(LX + LW - 90, endOld, k); py = K.lerp(ry + 110, ry, k); }
    else if (t < pS1) { px = endOld; py = ry; }                                          // strike runs into the nib
    else if (t < pW0) { const k = K.io(t, pS1, pW0 - pS1); px = K.lerp(endOld, L.doorX + 4, k); py = ry - Math.sin(Math.PI * k) * 14; }
    else { px = L.doorX + 4 + newW * writeK; py = ry; }                                // nib leads the new ink
    const writing = K.env(t, pS0, pS1, 0.1) + K.env(t, pW0, pW1, 0.1);
    M.pen(px, py, 150, { t, writing, alpha: penA, rot: 0.3 });
  }

  // ---- [[agents]]: the sparkle drifts in and ties report.docx onto a fresh, shorter string
  const agK = K.io(t, aAgents, 0.9);
  if (agK > 0) {
    const BX = 900, BY = 730, BS = 0.45, n = 6;
    const ax = K.lerp(1250, 1110, agK), ay = BY - 6;
    const tieK = K.io(t, aLabels - 0.2, 0.8, 'back');          // the scene's one overshoot: the tag swings on
    const G2 = M.drawString(BX, BY, BS, {
      t, preset: 'docx', n, labels: 'none',
      cordK: K.io(t, aAgents + 0.4, 0.6),
      beadK: (i) => K.stagger(t, aAgents + 0.7, i, 0.12, 0.5),
      tag: { name: 'report.docx', swing: tieK, mark: K.io(t, aDecides, 0.6) },
      tagK: K.clamp((t - (aLabels - 0.2)) / 0.25),
    });
    M.agent(ax, ay, 56, { t, alpha: agK, glow: agK });
    // a short gold thread from the sparkle to the new string (it made this file)
    K.line(ax - 44, ay + 6, G2.right + 10, BY, { k: K.io(t, aAgents + 0.5, 0.5), color: C.gold, w: 2.5, alpha: 0.6 });
    // "the table still decides": a dashed gold line from the new string to the .docx row
    K.arrow(G2.right + 10, BY + 26, LX - 14, L.rowY(2), { k: K.io(t, aDecides, 0.7), color: C.gold, w: 2.5, dash: [9, 9], alpha: 0.75, bend: 30 });
  }

  // ---- one concept pill at a time, bottom centre
  const pills = [
    [aLabel, 'extension = a label in the name'],
    [aTable, 'a table: label → program'],
    [aSame + 0.2, 'rename = new label, same bytes'],
    [aEdit + 0.25, 'Open with · Always · Default apps'],
    [aAgents + 0.3, 'AI makes files; the table still opens them'],
  ];
  pills.forEach(([at, s], i) => {
    const next = pills[i + 1] ? pills[i + 1][0] : Infinity;
    const a = K.io(t, at, 0.5) * (1 - K.io(t, next - 0.35, 0.35));
    if (a > 0) M.label(s, 960, 872 + (1 - K.io(t, at, 0.5)) * 12, { alpha: a });
  });

  // a few petals, clear of the type, the strings, the ledger and the pills
  K.petals(t, { n: 5, avoid: [[160, 140, 1760, 430], [200, 460, 1820, 920]] });
});
