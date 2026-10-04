/* 05 — The tag only picks the program
   The porter (the OS) reads only the tag and carries the string to a program's door; renaming moves no bead;
   Python runs notes.txt anyway; binary formats carry a stamp in their first beads; the tag isn't tied to the
   string: the folder keeps the name. */
SCENE('05', (t, S) => {
  const C = K.C, L = M.layout;
  const io = (a, d = 0.6, e = 'io') => K.io(t, a, d, e);
  const W = (w, fb) => S.find(w, 0, fb);
  K.bg({ glow: 0.4, glowX: 300, glowY: 520 });

  // ---- beats (local seconds), all hung on cues / spoken words
  const cPorter = S.cue('porter', 0);
  const tDbl = W('double-click', cPorter + 0.36);
  const tExt = W('extension', 2.66);
  const tProg = W('program', 4.05);
  const cRename = S.cue('rename-py', 5.92);
  const tToPy = W(/^Y,?$/, 10.59) - 1.4;          // "to hello dot P Y": flip as "hello" is said
  const tBead = W('bead', 11.98) - 0.4;           // "not one bead moves"
  const cRuns = S.cue('python-runs', 13.13);
  const tIgnore = W('ignore', 14.7);
  const tPython = W('Python', 15.89);
  const tNotes = W('notes', 17.33);
  const tHappily = W('happily', 16.6);
  const tTxtEnd = W(/^T\.$/, 18.58);
  const cStamp = S.cue('stamp', 19.05);
  const tCarry = W('carry', 20.28);
  const tFirst = W('first', 21.51);
  const tPNG = W('pictures', 23.66) - 0.6;
  const tPDF = W('Fs.', 27.01) - 0.5;
  const tWord = W('Word', 28.64);
  const tClue = W('clue', 32.6);
  const tThan = W('than', 33.02);
  const tPlain = W('Plain', 34.47);
  const tZip = W('zip', 29.55);
  const tMD = W('instant.', 44.22);
  const tNo = W(/^no$/, 35.75);
  const cBreaks = S.cue('breaks', 36.95);
  const tTied = W('tied', 39.46) - 0.6;
  const tFolder = W('folder', 41.11);
  const tRenaming = W('renaming', 43.22);

  // ---------------------------------------------------------------- the first string (plain text)
  // t <= 0: where 04 left it (standard, under the card, letters); 0..0.8 glides to the porter layout;
  // on [[stamp]] it rises to the top of a stack of four strings (s .93: numbers stay >= 26 px)
  const SS = 0.93, SP = 100 * SS, X0 = 590;           // shared bead-0 x for the whole stack
  const rowY = [250, 430, 590, 750];
  const u0 = io(0, 0.8);
  const uTop = io(cStamp, 0.8);
  const P0 = L.standard, P1 = L.porter, P2 = { x: X0 + 5.5 * SP, y: rowY[0], s: SS };
  const sx = K.lerp(K.lerp(P0.x, P1.x, u0), P2.x, uTop);
  const sy = K.lerp(K.lerp(P0.y, P1.y, u0), P2.y, uTop);
  const ss = K.lerp(K.lerp(P0.s, P1.s, u0), P2.s, uTop);
  const cardA = 1 - io(0, 0.6);
  const letterK = 1 - io(0.1, 0.6);
  const toPyK = io(tToPy, 0.6);
  const toNotesK = io(tNotes - 0.15, 0.5);
  const toMdK = io(tRenaming, 0.6);
  const markK = io(tExt, 0.5) * (1 - io(cRuns, 0.5));
  const tagName = toMdK > 0 ? { name: 'notes.txt', to: 'notes.md', k: toMdK }
    : toNotesK > 0 ? { name: 'hello.py', to: 'notes.txt', k: toNotesK } : { name: 'hello.txt', to: 'hello.py', k: toPyK };
  const noStampK = io(tNo - 0.1, 0.5) * (1 - io(cBreaks, 0.5));
  // [[breaks]]: the tag comes untied on "tied", then settles into the folder's card on "folder"
  const lift = io(tTied, 0.6), slideK = io(tFolder, 0.9);
  const eye0 = { x: X0 - 62 * SS, y: rowY[0] }, eye1 = { x: 705, y: 562 };
  // the lift drifts left and DOWN (toward the folder), never up into the eyebrow
  const tagOff = { x: K.lerp(-30 * lift, eye1.x - eye0.x, slideK), y: K.lerp(34 * lift, eye1.y - eye0.y, slideK) };

  // ---------------------------------------------------------------- folder card (drawn under the tag)
  const fK = io(tFolder - 0.15, 0.6);
  if (fK > 0) {
    K.folder(170 - 30 * (1 - fK), 640, 120, { name: 'folder', nameSize: 28, alpha: fK });
    K.card(270, 490, 460, 290, { r: 18, fill: K.rgba(C.tile, 0.92), stroke: C.line2, alpha: fK, shadow: false });
    const lab = { font: 'ui', weight: 600, size: 26, color: C.soft, alpha: fK };
    const val = { font: 'ui', weight: 600, size: 26, color: C.strong, alpha: fK };
    K.text('name', 300, 571, lab);
    K.line(300, 626, 700, 626, { color: C.line, w: 1.5, alpha: fK });
    K.text('size', 300, 685, lab); K.text('12 bytes', 410, 685, val);
    K.text('date', 300, 745, lab); K.text('Oct 4, 2026', 410, 745, val);
  }

  const top = M.drawString(sx, sy, ss, {
    t, preset: 'txt', letterK,
    card: cardA > 0 ? { slide: 1, alpha: cardA, chip: 'UTF-8', eyebrow: 'CODE CARD' } : null,
    tag: { ...tagName, mark: markK },
    emptyStamp: noStampK,
    tie: 1 - io(tTied, 0.4), tagOffset: tagOff,
  });
  if (noStampK > 0) M.quiet('no stamp', top.beads[0].x, top.y - top.r - 26, { alpha: noStampK });

  // ---------------------------------------------------------------- porter + programs (0 .. stamp)
  const outA = 1 - io(cStamp - 0.2, 0.5);           // everything of the first half leaves before the shrink
  const dimA = 1 - 0.7 * io(tIgnore - 0.3, 0.6);     // the double-click route dims when Python takes over
  if (outA > 0) {
    // the porter walks in to read the tag
    const walk = io(tDbl, 0.9);
    const px = K.lerp(760, 330, walk), py = 282 - (walk > 0 && walk < 1 ? Math.abs(Math.sin(t * 11)) * 7 : 0);
    const porterA = io(tDbl - 0.2, 0.4) * (1 - io(cRuns + 0.3, 0.6)) * outA;
    K.icon('person', px, py, 64, { color: C.soft, w: 3, alpha: porterA });

    // gold dashed route from the tag to the program's door
    const route = [[372, 268], [900, 196], [1440, 370]];
    const routeK1 = io(tProg - 0.3, 0.8, 'out');
    const reroute = io(tToPy + 0.2, 0.3) * (1 - io(tToPy + 0.5, 0.01));   // route fades while the tag flips
    const routeK2 = io(tToPy + 0.55, 0.8, 'out');
    const routeK = toPyK > 0 && t >= tToPy + 0.5 ? routeK2 : routeK1;
    const routeA = (t < tToPy + 0.5 ? 1 - reroute : 1) * dimA * outA;
    K.path(route, { k: routeK, color: C.gold, w: 3, dash: [10, 10], alpha: routeA, headSize: 18 });

    // Notepad, then the code editor, at the same door
    const winK = io(tProg, 0.6);
    const edK = io(tToPy + 0.5, 0.5);
    const wx = 1460 + 60 * (1 - winK);
    if (winK > 0) {
      const npA = winK * (1 - edK) * dimA * outA;
      if (npA > 0) {
        const r = K.win(wx, 260, 360, 220, { kind: 'notepad', title: 'Notepad', titleSize: 26, alpha: npA });
        K.layer(npA, () => K.editor(r, t, ['print("hi")'], { syntax: 'none', gutter: false, size: 26 }));
      }
      const edA = edK * dimA * outA;
      if (edA > 0) {
        const r = K.win(wx, 260, 360, 220, { kind: 'code', title: 'Code editor', titleSize: 26, alpha: edA });
        K.layer(edA, () => K.editor(r, t, ['print("hi")'], { syntax: 'py', size: 26 }));
      }
    }

    // pill under the tag
    const p1A = io(tDbl, 0.5) * (1 - io(cRename, 0.5)) * outA;
    if (p1A > 0) K.pill('double-click reads the tag', 320, 500, { size: 28, alpha: p1A });
    // counter under the beads
    const cntA = io(tBead, 0.5) * (1 - io(cRuns, 0.5)) * outA;
    if (cntA > 0) K.pill('bytes changed: 0', 900, 505, { size: 30, color: C.head, stroke: C.gold, alpha: cntA });

    // the terminal: Python runs notes.txt, reading the beads, not the tag
    const tmK = io(tIgnore - 0.1, 0.6);
    if (tmK > 0) {
      const tA = tmK * outA;
      const r = K.win(1440 + 60 * (1 - tmK), 540, 380, 200, { kind: 'terminal', title: 'Terminal', titleSize: 26, alpha: tA });
      K.layer(tA, () => K.term(r, t, [
        { at: tHappily, cmd: 'python notes.txt', cps: 16 / Math.max(0.8, tTxtEnd - tHappily) },
        { at: tTxtEnd + 0.1, out: 'hi', color: C.strong },
      ], { prompt: '> ', size: 26, rows: 2, pad: 24 }));
      // Python reads the beads directly
      K.arrow(1428, 640, 1352, 446, { k: io(tTxtEnd + 0.1, 0.6, 'out'), color: C.gold, w: 3, dash: [8, 8], bend: -30, alpha: outA });
      const msg = 'the program ignores the tag';
      const pw = K.measure(msg, { size: 26, font: 'ui', weight: 600 }) + 26 * 1.6;
      K.pill(msg, Math.min(1630, 1838 - pw / 2), 795, { size: 26, alpha: io(tIgnore, 0.5) * outA });
    }
  }

  // ---------------------------------------------------------------- stamps: PNG, PDF, Word (8 beads each, s .93)
  const outRows = 1 - io(cBreaks, 0.5);                // PDF + Word rows leave on [[breaks]]
  const clueK = io(tClue - 0.2, 0.5) * (1 - io(tPlain, 0.5));
  const tagDim = 1 - 0.4 * clueK;                     // the tags step back while the stamps are the clue
  const cx8 = X0 + 3.5 * SP;
  // one clean highlight + a stamp label above it (same ‰PNG label as scenes 06 and 07)
  const stampDeco = (st, label, k, hiK, a) => {
    if (!st.stampBox || k <= 0) return;
    const b = st.stampBox, r = st.r, y = st.y;
    K.text(label, (b.x0 + b.x1) / 2, y - r * 1.28 - 24, { font: 'mono', weight: 700, size: 32, color: C.head, align: 'center', alpha: k * a });
    // highlight = the stamp's own capsule, stroked brighter and heavier (one stroke, no second outline)
    if (hiK > 0) K.card(b.x0, y - r * 1.28, b.x1 - b.x0, r * 2.56,
      { r: r * 1.28, fill: K.rgba(C.head, 0.1 * hiK), stroke: C.head, lw: 4, alpha: hiK * a, shadow: false });
  };
  const row = (o) => {
    const a = o.alpha; if (a <= 0) return null;
    const st = M.drawString(o.x, o.y, SS, {
      t, preset: o.preset, bytes: o.bytes, alpha: a, stampLabel: ' ',
      beadK: (i) => K.stagger(t, o.at, i, 0.08, 0.4),
      cordK: K.io(t, o.at - 0.1, 0.8, 'out'),
      stampK: o.stampK, tag: o.tag, tagK: o.tagK,
    });
    stampDeco(st, o.label, o.stampK, o.hiK, a);
    return st;
  };

  // PNG: enters on "carry", stamp lights on "first", highlighted on "PNG pictures"; leaves on [[breaks]]
  const pngA = io(tCarry - 0.1, 0.3) * outRows;
  row({
    preset: 'png', bytes: M.STRINGS.png.bytes.slice(0, 8), alpha: pngA, at: tCarry,
    x: cx8, y: rowY[1],
    stampK: io(tFirst, 0.6), label: M.STRINGS.png.stampLabel,
    hiK: Math.max(io(tPNG, 0.6) * (1 - io(tPDF, 0.5)), clueK),
    tag: { name: 'photo.png', swing: K.io(t, tCarry + 0.3, 0.8, 'back') }, tagK: io(tCarry + 0.3, 0.3) * tagDim,
  });
  // PDF: on "P D Fs"
  row({
    preset: 'pdf', bytes: M.STRINGS.pdf.bytes.slice(0, 8), alpha: (t >= tPDF - 0.6 ? 1 : 0) * outRows, at: tPDF - 0.5,
    x: cx8, y: rowY[2], stampK: io(tPDF + 0.2, 0.5), label: '%PDF-', hiK: clueK,
    tag: { name: 'report.pdf' }, tagK: io(tPDF - 0.5, 0.5) * tagDim,
  });
  // Word: on "Word", PK stamp on "zip"
  row({
    preset: 'zip', bytes: M.STRINGS.zip.bytes.slice(0, 8), alpha: (t >= tWord - 0.3 ? 1 : 0) * outRows, at: tWord - 0.3,
    x: cx8, y: rowY[3], stampK: io(tZip, 0.5), label: 'PK', hiK: clueK,
    tag: { name: 'essay.docx' }, tagK: io(tWord - 0.3, 0.5) * tagDim,
  });
  const zipA = io(tZip + 0.1, 0.5) * outRows;
  if (zipA > 0) K.pill('PK = a zip inside', 1540, rowY[3], { size: 26, alpha: zipA });
  if (clueK > 0) K.pill('better clue: the stamp', 1560, rowY[1], { size: 28, color: C.head, stroke: C.gold, alpha: clueK });

  // ---------------------------------------------------------------- where the picture breaks
  const ebA = io(cBreaks, 0.5);
  if (ebA > 0) K.eyebrow('where the picture breaks', 120, 150, { size: 20, alpha: ebA });
});
