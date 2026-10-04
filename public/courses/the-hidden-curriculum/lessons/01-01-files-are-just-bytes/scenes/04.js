/* 01.01 · 04 — Text is an agreement
   The same string (standard layout) gains the CODE CARD: parked above with a small legend, it slides onto the
   beads and the numbers become gold letters (print("hi")). The tag STAYS hello.txt all scene (the only .txt -> .py
   rename is scene 05's [[rename-py]]); the pill carries "a .py file is text". The wrong card (UTF-16)
   reads the beads in pairs as junk, then slides back. UTF-8 facts, then "what you see is a rendering":
   a small second string (notes.md: * * h i * *) drops in under the main one, a Notepad window shows a bold hi, and
   on "stars" the four star beads ring gold and an arrow runs stored -> shown. */
SCENE('04', (t, S) => {
  const C = K.C, L = M.layout.standard;
  K.bg({ glow: 0.45, glowX: 960, glowY: 440 });

  // ---- beats (local seconds)
  const cCard = S.cue('code-card', 0);
  const tSays = S.find('says', 0, 3.98);
  const tOne = S.find('One', 0, 6.8);
  const tTwelve = S.find('twelve', 0, 7.5);
  const cLetters = S.cue('letters', 10.53);
  const tSpell = S.find('spell', 0, 12.64);
  const tDotPy = S.find(/^dot$/i, 0, 14.83) - 0.2;
  const tNothing = S.find('Nothing', 0, 20.04);
  const cGarbled = S.cue('garbled', 22.43);
  const tWrong = S.find('wrong', 0, 22.86);
  const cUtf8 = S.cue('utf8', 26.97);
  const tUsed = S.find('used', 0, 30.69);
  const tPython = S.find('Python', 2, 34.16);
  const cRender = S.cue('rendering', 38.77);
  const tNotepad = S.find('Notepad', 0, 42.61) - 0.45;
  const tBold = S.find('bold', 0, 45.02);
  const tStars = S.find('stars', 0, 46.6);
  const tFile = S.find(/^file/i, 1, 47.23);

  // ---- code card state
  // the card arrives on "code card" and its legend follows within ~0.6 s, so it is never shown blank
  const tCodeW = S.find(/^code$/i, 0, 3.08);
  const cardA = K.io(t, tCodeW - 0.25, 0.5);
  const legIn = tCodeW + 0.3;   // pairs staggered 0.15 s apart, all in by "which number means which letter"
  // [[rendering]]: the hello strip steps back so notes.md -> Notepad is the only bright thing
  const dimMain = 1 - 0.68 * K.io(t, cRender, 0.6);
  const slide = K.io(t, cLetters, M.motion.move);
  const wrong = K.io(t, tWrong, 0.6) * (1 - K.io(t, cUtf8 - 0.55, 0.55));
  const letterK = (i) => K.stagger(t, tSpell - 0.25, i, 0.06, 0.4);
  // chip: UTF-16 while wrong, then UTF-8 from [[utf8]]
  const chip16 = wrong;
  const chip8 = K.io(t, cUtf8, 0.5);
  const chipName = chip8 > 0 ? 'UTF-8' : 'UTF-16';
  const chipK = chip8 > 0 ? chip8 : chip16;


  // bead 0 ringed while "one hundred twelve means a small p" is said
  const ring0 = K.io(t, tOne, 0.5) * (1 - K.io(t, cLetters, 0.5));

  const geo = M.drawString(L.x, L.y, L.s, {
    t, preset: 'txt', alpha: dimMain,
    letterK, wrongK: wrong,
    ringBeads: { 0: ring0 },
    card: { slide, alpha: cardA, wrong, shift: 24 * wrong, chip: chipK > 0.01 ? chipName : null, chipK, glow: 0.25 * slide * (1 - wrong) },
    tag: { name: 'hello.txt' },
  });

  // ---- legend inside the parked card (fades as the card starts to slide)
  const legOut = (1 - K.io(t, cLetters - 0.1, 0.35)) * cardA;
  if (legOut > 0.01 && t > legIn) {
    const ly = L.y - 220 + 10;
    const pairs = [['112', 'p'], ['114', 'r'], ['105', 'i']];
    const glow = K.io(t, tTwelve, 0.4);
    pairs.forEach(([n, l], i) => {
      const x = 700 + i * 250;
      const legA = K.io(t, legIn + 0.15 * i, 0.4) * legOut;
      if (legA <= 0.01) return;
      const hi = i === 0 ? glow : 0;
      if (hi > 0) K.glow(x, ly - 10, 90, C.head, 0.22 * hi * legA);
      K.spans([
        { s: n, color: K.mixColor(C.strong, C.head, hi) },
        { s: '  →  ', color: C.soft },
        { s: l, color: C.head },
      ], x, ly, { font: 'mono', weight: 600, size: 32, align: 'center', alpha: legA * (i === 0 ? 1 : 0.85 - 0.25 * glow) });
    });
  }

  // ---- [[letters]] pills under the beads
  const pillsOut = 1 - K.io(t, cGarbled - 0.4, 0.4);
  const p1 = K.io(t, tDotPy + 0.2, 0.5) * pillsOut;
  const p2 = K.io(t, tNothing, 0.5) * pillsOut;
  if (p1 > 0.01) K.pill('a .py file is just text', 730, 680, { size: 30, color: C.head, stroke: C.gold, alpha: p1 });
  if (p2 > 0.01) K.pill("no 'Python' inside", 1190, 680, { size: 30, color: C.strong, stroke: C.gold, alpha: p2 });

  // ---- [[utf8]] two notes
  const notesOut = 1 - K.io(t, cRender, 0.5);
  const n1 = K.io(t, tUsed - 0.2, 0.5) * notesOut;
  const n2 = K.io(t, tPython - 0.1, 0.5) * notesOut;
  if (n1 > 0.01) K.rise(t, tUsed - 0.2, () => K.note(400, 650, 540, 'Web · W3Techs, Sep 2026', '≈99% of websites use UTF-8', { size: 30, alpha: n1 }));
  if (n2 > 0.01) K.rise(t, tPython - 0.1, () => K.note(980, 650, 540, 'Python 3.15 · due Oct 2026', 'UTF-8 by default, everywhere', { size: 30, alpha: n2 }));

  // ---- [[rendering]] stored vs shown: a second small string (the file) and a Notepad window (the view)
  const tNewer = S.find('newer', 0, 42.16);
  const mx = 690, my = 775, ms = 0.8;
  const STAR = [42, 42, 104, 105, 42, 42], STAR_L = ['*', '*', 'h', 'i', '*', '*'];
  const miniOn = cRender + 0.35;
  if (t > miniOn) {
    const ringK = K.io(t, tStars - 0.1, 0.5);
    const mg = M.drawString(mx, my, ms, {
      t, bytes: STAR, letters: STAR_L,
      beadK: (i) => K.stagger(t, miniOn + 0.25, i, 0.08, 0.4),
      cordK: K.io(t, miniOn, 0.5),
      letterK: (i) => K.stagger(t, tNewer, i, 0.06, 0.4),
      ringBeads: { 0: ringK, 1: ringK, 4: ringK, 5: ringK },
      tag: { name: 'notes.md', swing: K.io(t, miniOn + 0.2, 0.8, 'back') },
      tagK: K.io(t, miniOn + 0.2, 0.4),
    });
    K.eyebrow('In the file', mg.x0 - mg.r, my - 72, { size: 20, alpha: K.io(t, miniOn + 0.4, 0.5) });
    // arrow from the stored beads to the shown text
    K.arrow(mg.x1 + mg.r + 26, my, 1092, my, { k: K.io(t, tStars + 0.15, 0.6), color: C.gold, w: 3 });
  }
  const winA = K.io(t, tNotepad, 0.6);
  if (winA > 0.01) {
    K.rise(t, tNotepad, () => {
      const rc = K.win(1110, 680, 480, 200, { kind: 'notepad', title: 'Notepad', titleSize: 26, alpha: winA });
      const bA = K.io(t, tBold, 0.4) * winA;
      if (bA > 0.01) {
        const hx = rc.x + 60, hy = rc.y + rc.h / 2 + 38;
        K.text('hi', hx, hy, { font: 'ui', weight: 800, size: 84, color: C.strong, alpha: bA });
        K.text('hi', hx + 2, hy, { font: 'ui', weight: 800, size: 84, color: C.strong, alpha: bA });   // faux-heavy: double strike
      }
      K.eyebrow('Shown', 1114, 664, { size: 20, alpha: winA });
    });
  }
  const pA = K.io(t, tFile - 0.1, 0.5);
  if (pA > 0.01) K.pill('stored → shown', 960, 890, { size: 30, color: C.head, stroke: C.gold, alpha: pA });
});
