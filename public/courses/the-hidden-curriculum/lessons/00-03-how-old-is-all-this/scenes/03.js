/* 03 — Missing the oldest things
   Aaron's four missing things, each getting its year stamped on it (the same gold year tags that hang
   on the street in 04). Opens on "Aaron" with the eyebrow and his cap already at the top-left, the 40 px
   degree line rises there on "degree", an empty dimmed Notepad frame settles in below it about a second
   later, and on "in Notepad" it lights up and the code types (no layout jump). script.txt appears on "saved"; a dashed
   arrow points at the rename he didn't do (a ghost script.py, no red, no cross); a ghosted terminal types
   `cd project` after a neutral `$`; a ghosted .venv folder with a quiet question mark. On "None of that
   was new" one gold sweep passes left to right over all four; each object glows as it is named and its
   year tag stamps on the spoken year, hung just OUTSIDE its window with a short leader (1985 to the Notepad's right, at title-bar height) (only the first
   stamp overshoots). On [[oldest]] everything but the tags dims and the line "Not the latest things. /
   The oldest." lands under the Notepad, in two halves on their words. */
SCENE('03', (t, S) => {
  const C = K.C, L = M.layout.s03;

  // ---- times (local), all from the narration
  const tAaron = 0.05;
  const tDegree = S.find('degree', 0, 2.07);
  const tNotepad = S.cue('notepad', 6.86), tFrame = tDegree + 0.95, tSaved = S.find('saved', 0, 8.08);
  const tRename = S.cue('rename', 11.74), tPY = S.find(/^P$/, 0, 12.83);
  const tTerm = S.cue('terminal', 14.1), tCD = S.find(/^C$/, 0, 15.19);
  const tVenv = S.cue('venv', 17.74);
  const tNone = S.find('None', 0, 19.57);
  const name = {                                   // the object is named → a soft glow swell
    notepad: S.find('Notepad', 1, 20.93), python: S.find('Python', 1, 24.52),
    shell: S.find('Unix', 0, 26.8), venv: S.find('behind', 0, 29.78),
  };
  const year = {                                   // the year is spoken → its tag stamps on
    notepad: S.find('1985', 0, 23.06), python: S.find('1991', 0, 25.37),
    shell: S.find('1971', 0, 27.73), venv: S.find('2012', 0, 32.72),
  };
  const tOldest = S.cue('oldest', 34.08), tOldestWord = S.find('oldest', 0, 37.69);

  const dimK = K.io(t, tOldest, 0.8);
  const dim = K.lerp(1, 0.4, dimK);                // everything except the year tags

  K.bg({ glow: 0.2, glowX: 620, glowY: 480 });

  // ---- layout (a shorter Notepad than the shared layout: two lines of code don't need 520 px)
  const [wx, , ww] = L.win, wh = 270;
  const lift = -8 * K.io(t, name.notepad - 0.05, 0.5);   // Notepad lifts a touch when named
  const wy0 = 262, wy = wy0 + lift;
  const F = { txt: [1300, 330], py: [1580, 330], s: 110 };
  const [tx, , tw, th] = L.term, ty = 516;          // 46 px lower than the shared spot: room for its tag above
  const V = { x: 1300, y: 780, s: 90 };
  const label = (s, x, y, a = 1) => K.text(s, x, y, { font: 'mono', size: 26, color: C.body, align: 'center', alpha: a });

  // one gold sweep left → right over the four objects on "None of that was new"
  const sweep = (x) => M.bump(t, tNone + 0.05 + 0.7 * (x - 200) / 1560, 1.0) * (1 - dimK);
  const glowAt = (key, x) => Math.max(M.bump(t, name[key] - 0.1, 1.6) * (1 - dimK), 0.8 * sweep(x));

  // ---- the degree: set top-left from the first frame (no later layout jump). Eyebrow + cap on "Aaron",
  //      the 40 px degree line on "degree"; it stays put while the Notepad fills the frame below it.
  {
    const capS = 64, gap = 22, fs = 40, x0 = wx, y = 212;
    const deg = 'Information Systems + Data Science';
    const capK = K.io(t, tAaron, 0.6, 'out'), txtK = K.io(t, tDegree - 0.05, 0.6, 'out');
    K.layer(K.lerp(1, 0.5, dimK), () => {
      K.layer(capK, () => K.eyebrow('AARON · WHO MADE THIS COURSE', x0, 150 + (1 - capK) * 10, { size: 26, align: 'left', tracking: 3 }));
      K.layer(capK, () => K.icon('cap', x0 + capS / 2, y + (1 - capK) * 12, capS, { color: C.head, w: 3.2 }));
      K.layer(txtK, () => K.text(deg, x0 + capS + gap, y + fs * 0.36 + (1 - txtK) * 14, { font: 'ui', weight: 600, size: fs, color: C.strong }));
    });
  }

  K.layer(dim, () => {
    // ---- Notepad with the Python inside it (a .txt in Notepad: no syntax colour, no line numbers)
    {
      const frK = K.io(t, tFrame, 0.8, 'out');               // the empty frame settles in, dimmed
      const onK = K.io(t, tNotepad - 0.1, 0.5);              // "in Notepad": it lights up and the code types
      const gk = glowAt('notepad', wx + ww / 2);
      if (gk > 0) K.glow(wx + ww / 2, wy + wh / 2, ww * 0.55, C.head, 0.22 * gk);
      K.layer(frK * K.lerp(0.4, 1, onK), () => {
        const r = K.win(wx, wy + (1 - frK) * 20, ww, wh, { title: t < tSaved ? 'Untitled - Notepad' : 'script.txt - Notepad', kind: 'notepad', shadow: true });
        K.editor(r, t, ['name = "Aaron"', 'print("hello", name)'], { typeAt: tNotepad + 0.3, cps: 24, size: 32, gutter: false, syntax: 'none' });
      });
    }

    // ---- script.txt beside it, on "saved"
    const fk = K.io(t, tSaved, 0.6, 'out');
    const fGlow = sweep(F.txt[0]);
    if (fGlow > 0) K.glow(F.txt[0], F.txt[1], F.s * 0.9, C.head, 0.2 * fGlow);
    K.layer(fk, () => {
      K.file(F.txt[0], F.txt[1] + (1 - fk) * 18, F.s, { ext: 'txt' });
      label('script.txt', F.txt[0], F.txt[1] + (1 - fk) * 18 + F.s / 2 + 36);
    });

    // ---- the rename he didn't know to do: a dashed arrow to a ghost script.py (icon ghosted, name readable)
    const ak = K.io(t, tRename, 0.8);
    K.arrow(F.txt[0] + F.s * 0.39 + 22, F.txt[1], F.py[0] - F.s * 0.39 - 22, F.py[1], { k: ak, color: C.soft, w: 3, dash: [9, 9], headSize: 14, alpha: 0.8 });
    const gpk = K.io(t, tPY - 0.15, 0.6, 'out');
    const gpGlow = glowAt('python', F.py[0]);
    if (gpGlow > 0) K.glow(F.py[0], F.py[1], F.s * 0.9, C.head, 0.24 * gpGlow);
    K.layer(gpk, () => {
      K.file(F.py[0], F.py[1], F.s, { ext: 'py', alpha: 0.35 + 0.25 * gpGlow });
      label('script.py', F.py[0], F.py[1] + F.s / 2 + 36);
    });

    // ---- the terminal he didn't know to open, ghosted, typing `cd project` after a neutral prompt
    const tk = K.io(t, tTerm, 0.6, 'out');
    const tGlow = glowAt('shell', tx + tw / 2);
    K.layer(tk * (0.5 + 0.3 * tGlow), () => {
      if (tGlow > 0) K.glow(tx + tw / 2, ty + th / 2, tw * 0.6, C.head, 0.22 * tGlow);
      const r = K.win(tx, ty + (1 - tk) * 18, tw, th, { title: 'Terminal', kind: 'terminal' });
      // the empty row parks the caret: no blinking left on the calm exit
      K.term(r, t, [{ at: tCD, cmd: 'cd project', cps: 14 }, { at: tCD + 2.2, out: '' }], { prompt: '$ ', size: 28 });
    });

    // ---- .venv: a folder he'd never heard of (icon ghosted, name readable), a quiet question mark at its top-left
    const vk = K.io(t, tVenv, 0.6, 'out');
    const vGlow = glowAt('venv', V.x);
    if (vGlow > 0) K.glow(V.x, V.y, V.s * 1.1, C.head, 0.24 * vGlow);
    K.layer(vk, () => {
      const vy = V.y + (1 - vk) * 14;
      K.folder(V.x, vy, V.s, { alpha: 0.5 + 0.3 * vGlow });
      label('.venv', V.x, vy + V.s * 0.45 + 38);
    });
    // the question fades as its year arrives: the answer was "old", not "unknown"
    K.layer(vk * 0.85 * (1 - K.io(t, year.venv - 0.1, 0.5)), () => K.icon('question', V.x - V.s * 0.62 - 26, V.y - V.s * 0.36, 34, { color: C.soft, w: 3 }));
  });

  // ---- the year stamps (gold, same tags as the street in 04; year first, always), hung outside each window
  const lit = K.lerp(0.5, 1, dimK);
  const leader = (at, x1, y1, x2, y2) => {
    const k = K.io(t, at + 0.1, 0.35);
    if (k > 0) K.line(x1, y1, x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, { color: C.head, w: 2, alpha: 0.7 });
  };
  // 1985: just outside the Notepad's right edge at title-bar height, a short leader in from the window
  const nW = M.tagSize({ year: '1985' }).w, nX = wx + ww + 26 + nW / 2, nY = wy0 + 26;
  leader(year.notepad, wx + ww, nY, nX - nW / 2, nY);
  M.stamp(t, year.notepad, nX, nY, { year: '1985' }, { e: 'back', lit });
  // 1991: to the right of the ghost script.py
  M.stamp(t, year.python, 1700, F.py[1], { year: '1991' }, { lit });
  // 1971 · Unix shell: above the terminal's top edge, right side, clear of the file labels
  const sW = M.tagSize({ year: '1971', name: 'Unix shell' }).w, sX = tx + tw - 20 - sW / 2, sY = ty - 38;
  leader(year.shell, sX, sY + 24, sX, ty);
  M.stamp(t, year.shell, sX, sY, { year: '1971', name: 'Unix shell' }, { lit });
  // 2012: to the right of the .venv folder
  M.stamp(t, year.venv, V.x + V.s * 0.62 + 66, V.y, { year: '2012' }, { lit });

  // ---- the line, under the Notepad in two halves on their words
  {
    const o = { font: 'read', size: 46, color: C.strong };
    const x0 = wx + 4, y0 = wy0 + wh + 120;
    K.rise(t, tOldest, () => K.text('Not the latest things.', x0, y0, o), 16, 0.6);
    K.rise(t, tOldestWord - 0.1, () => K.text('The oldest.', x0, y0 + 66, { ...o, color: C.head }), 16, 0.6);
  }
});
