/* 01.03 section 05: Relative paths and the working directory.
   Metaphor: THE MAP and the dot, bright again. A relative route is measured from the dot (gold), and it
   ends at data.csv. The inherited start is an icon above the dot; it steps back once the sentence says
   "measured from that directory", so the dot is the start, not the file. The map card is shortened
   (bottom at y 740) so the PowerShell strip (shared L.term, y 780-910) sits fully below it with no overlap.
   The prompt is the dot printed on screen: it lights up, with a caption, and no line touches the window.
   The script.py card and the "not from the file" line belong to section 06 and are not drawn here. */
SCENE('05', (t, S) => {
  const M = window.M, P = M.P, L = M.L;
  K.bg();

  // local times (seconds into this section's narration)
  const rel = S.find('three', 0, 3.7);      // "three streets from here"
  const inh = S.cue('inherit', 8.5);        // "Every running program has a working directory"
  const mf = S.cue('measured-from', 23.07); // "A relative path is measured from that directory"
  const pd = S.cue('prompt-dot', 32.17);    // "Many terminals show the dot in the prompt"

  // the map: shortened so the terminal strip sits fully below it (bottom y 740)
  const box = { x: 380, y: 200, w: 1160, h: 540 };
  M.card(t, { box });

  // the dot comes back to full brightness from section 04's dim
  const dotA = 0.4 + 0.6 * K.io(t, 0, 0.8);
  M.dot(t, L.dot.x, L.dot.y, { alpha: dotA, pulse: 0.6, ring: K.io(t, inh + 1.0, 0.8) });
  M.dotLabel('working directory', L.dot.x, L.dot.y + 62, { alpha: dotA });

  // the inherited start steps back at "measured from that directory": the dot, not the file, is the start
  const startA = 1 - 0.55 * K.io(t, mf, 0.6);

  // 1. relative: a gold route measured FROM the dot, three streets east, south, east, ending at data.csv
  const relK = K.io(t, rel, 1.2);
  K.path([[985, 520], [1130, 520], [1130, 620], [1280, 620]], {
    k: relK, color: P.path, w: 3, head: true, tension: 0,
  });
  M.tick(1050, 520, { k: K.io(t, rel + 0.7, 0.4) });
  K.line(1116, 570, 1144, 570, { k: K.io(t, rel + 1.0, 0.4), color: P.path, w: 4 });
  M.tick(1210, 620, { k: K.io(t, rel + 1.3, 0.4) });
  M.label('three streets from here', 1170, 468, { color: P.ink, alpha: K.io(t, rel + 0.2, 0.5) });
  // the target: the same data.csv the script names
  M.file(1330, 612, 84, 'data.csv', 'csv', { alpha: K.io(t, rel + 1.2, 0.5) });

  // 2. inherit: a program started here; the terminal icon sits above the dot with a hairline down to it
  const inhA = K.io(t, inh, 0.5) * startA;
  M.icon('terminal', 960, 340, 76, { alpha: inhA });
  M.label('started from here', 1012, 350, { align: 'left', color: P.ink, alpha: inhA });
  K.line(960, 382, 960, 494, { k: K.io(t, inh + 0.4, 0.5), color: P.path, w: 2.5, alpha: startA });

  // 3. prompt-dot: the terminal strip (shared layout, below the map) and the prompt, which lights up.
  //    No line joins the window to the dot; the caption says what the prompt is.
  const termA = K.io(t, pd - 0.6, 0.6);
  const rect = M.terminal(t, { alpha: termA });
  const pdK = K.io(t, pd, 0.5);
  M.prompt(t, rect, 'PS C:\\Users\\you\\project>', {
    alpha: termA, color: K.mixColor(P.ink, P.root, pdK),
  });
  M.label('the dot, printed on screen', 1020, 846, {
    align: 'left', color: P.body, alpha: K.io(t, pd + 0.4, 0.6) * termA,
  });
});
