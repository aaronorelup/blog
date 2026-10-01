/* 07 — The surprises you'll hit
   Two surprises, in two halves.
   1) A word: "just". Three speech bubbles say it. Under the stack, one row of sources (tutorials,
      coworkers, your AI) each send a thin arrow up into it: all three say every "just".
      On [[skipped]] each gold "just" lifts off its bubble as a terracotta pin (terracotta = open) and
      plants itself on the folded map tile in the district its lesson lives in: cd and PATH in The
      Machine, .venv in The Code. Not a verdict, a place on the map. The landing is the scene's one 'back'.
   2) An error. A terminal runs `python script.py` from the home folder and prints Python's real
      "can't open file ... No such file or directory". The mechanism is drawn, not just named:
      on "never even opened it" the folder part of the error's path (C:\\Users\\you\\) is underlined in
      gold, "where Python looked"; on "standing" the prompt is circled, pinned "you are here" (the map's
      own terracotta pin), and a gold connector joins the two: Python looks where you stand. On "wrong
      folder" the real place appears right under the prompt, path aligned with path:
      C:\Users\you\projects + gold pin "script.py is here" (06's AI typed `cd projects`).
      Under that, the two usual causes each point to their fix, pulled back out of the map tile as
      shelved tags:
        [folder | wrong folder]      -> [✓ cd]
                  or
        [script.txt | still .txt]    -> [✓ .txt → .py]
   Continuity: opens on 06's corner tile (1700, 220, 130) with the four gold shelved pins; it glides to
   its hero seat for the "just" half and back to the corner for the error half, where 08 picks it up
   (08 must draw the same JUST offsets, below).
   Everything is a pure function of t. */
SCENE('07', (t, S) => {
  const C = K.C, L = M.layout, lerp = K.lerp;
  K.bg();

  // ---------------------------------------------------------------- times (local s; fallbacks = narrated)
  const tFirst = S.find('first', 0, 2.01);            // "The first is a word"
  const tJust = S.cue('just', 3.03);
  const tBub = [S.find('just', 1, 3.44), S.find('just', 2, 5.89), S.find('just', 3, 9.22)];
  // "Tutorials say it. Coworkers say it. Your AI assistant says it too." ("your" 0 is "add it to your path")
  const tSrc = [S.find('Tutorials', 0, 11.44), S.find('Coworkers', 0, 13.17), S.find('your', 1, 14.71)];
  const tEvery = S.find('just', 4, 17.89);             // "Every just is a lesson somebody skipped"
  const tSkip = S.cue('skipped', 19.31);
  const tPin = S.find('pin', 0, 22.51);                // "It's a pin on the map"
  const tSecond = S.find('second', 0, 24.10);          // "The second is an error": the just half clears
  const tErrWord = S.find('error', 0, 25.44);
  const tRun = S.find('Run', 0, 26.79);
  const tErr = S.cue('error', 30.31);
  const tCant = S.find(/^can/i, 0, 31.24);             // "can't open file"
  const tSuch = S.find('such', 0, 33.29) - 0.22;       // "no such file or directory"
  const tBroken = S.find('broken', 0, 36.96);
  const tNever = S.find('never', 0, 38.16);            // "Python never even opened it": show where it looked
  const tStand = S.find('standing', 0, 40.43);         // "you're standing in the wrong folder"
  const tWrong = S.cue('wrong-folder', 41.02);
  const tOr = S.find('or', 1, 42.10);                  // "or" 0 is "no such file or directory"
  const tStill = S.find('still', 0, 42.84);            // "or the file is still called .txt"

  // ---------------------------------------------------------------- layout
  const X = 160, EY1 = 232, EY = 180;                   // left column; eyebrow baselines (half 1, half 2)
  const TITLE_Y = 334;
  const BY = [382, 502, 622], BW = 720, BH = 96;        // bubble tops, width, height
  const BUBBLES = ['cd into the folder', 'activate the .venv', 'add it to your PATH'];
  // who says it: one row of sources under the whole stack, each pointing up into it
  const SRC = [{ icon: 'book', label: 'tutorials' }, { icon: 'person', label: 'coworkers' }, { icon: 'lantern', label: 'your AI' }];
  const SRC_Y = 836, SRC_S = 72, SRC_GAP = 16, SRC_X = [250, 490, 730];   // tiles in thirds, nudged left so the names fit
  const srcLab = { size: 28, font: 'ui', weight: 400 };
  const stackBot = BY[2] + BH;
  const HERO = [1480, 520, 320], CORNER = L.tile.corner;   // hero seat: bigger than s07 so the pins read
  const SHELVED = M.TAGS.map((g) => g.mod);             // '01', '02', '05', '14'
  // The three "just" pins, as {dx, dy} offsets from the tile centre in units of s (M.tilePt). Each lands in
  // the district its lesson lives in, beside the gold shelved pins, never on them:
  //   just cd    -> The Machine (02 The command line), between the 01 and 02 pins, at the block's foot
  //   just .venv -> The Code (05.03 Virtual environments), left of the 05 pin
  //   just PATH  -> The Machine (01.05 Environment variables & PATH), left of and below the 01 pin
  // They are a touch smaller than the gold pins (size 0.12 s vs 0.14 s) so the Machine block holds four
  // pins without any head covering a gold one. 08.js draws the same three specs on its tile (any mismatch
  // makes the pins jump mid-crossfade).
  const JUST_SIZE = 0.12;
  const JUST = [[-0.26, 0.012], [-0.045, -0.011], [-0.355, 0.03]].map(([dx, dy]) => ({ dx, dy, color: C.accent, size: JUST_SIZE }));
  const jw = K.measure('just', { font: 'mono', size: 30, weight: 700 });

  // pin flight: lift off the word, fly an arc, plant on the tile ('back')
  const LIFT = 0.25, FLY = 0.75, PLANT = 0.35, K0 = 0.65, JUST_GHOST = 0.16, FLY_SIZE = 42;
  const pinT = [0, 1, 2].map((i) => { const l = tSkip + 0.3 * i; return { l, f: l + LIFT, land: l + LIFT + FLY }; });

  // shelved tags coming back out of the tile in the error half
  const tCd = tWrong + 0.6, tPy = tStill + 0.3;

  // ---------------------------------------------------------------- half 1: the word "just"
  const kClr = K.io(t, tSecond, 0.6);
  if (kClr < 1) K.layer(1 - kClr, () => K.at(0, -30 * kClr, 1, 0, () => {
    K.layer(K.io(t, tFirst, 0.5, 'out'), () => K.eyebrow('Surprise one · a word', X, EY1));
    K.rise(t, tJust, () => K.title('“just”', X - 8, TITLE_Y, { size: 96 }));
    BY.forEach((by, i) => {
      const T = pinT[i];
      const just = lerp(1, JUST_GHOST, K.io(t, T.l, LIFT, 'out'));
      const glow = 0.6 * K.io(t, tEvery - 0.1, 0.4) * (1 - K.io(t, T.l + 0.1, 0.6));
      K.rise(t, tBub[i], () => {
        M.bubble(X, by, BW, BUBBLES[i], { just, glow });
        // "Every just": the word itself warms before it lifts off
        if (glow > 0) {
          const g = K.ctx(); g.save(); K.rr(X, by, BW, BH, 48); g.clip();      // keep the warmth inside its bubble
          K.glow(X + 100 + jw / 2, by + BH / 2, 84, C.head, 0.32 * glow);
          g.restore();
        }
      });
    });
    // the sources: tile + name, centred in thirds under the stack; a thin arrow draws up into the stack
    SRC.forEach((src, i) => {
      const sx = SRC_X[i];
      K.arrow(sx, SRC_Y - SRC_S / 2 - 10, sx, stackBot + 12, { k: K.io(t, tSrc[i] + 0.2, 0.4), color: C.soft, w: 2, headSize: 12 });
      K.pop(t, tSrc[i], sx, SRC_Y, () => {
        if (src.icon === 'lantern') M.lanternTile(t, sx, SRC_Y, SRC_S, { phase: 0.8 });
        else K.iconTile(src.icon, sx, SRC_Y, SRC_S, { color: C.body });
        K.text(src.label, sx + SRC_S / 2 + SRC_GAP, SRC_Y + 10, { ...srcLab, color: C.soft });
      });
    });
    K.rise(t, tPin, () => K.pill('a pin on the map', HERO[0], HERO[1] + HERO[2] / 2 + 72, { size: 30, color: C.head }));
  }));

  // ---------------------------------------------------------------- half 2: the error
  // h 318 is the least that still shows K.term's five rows; it leaves room under the window for the
  // line that says where script.py really is
  const WIN = { x: 160, y: 220, w: 1060, h: 318 };
  const rect = { x: WIN.x, y: WIN.y + 50, w: WIN.w, h: WIN.h - 50 };   // K.win's content rect
  const FS = 28, mono = { font: 'mono', size: FS };
  const rowY = (i) => rect.y + 28 + FS + i * FS * 1.5;                  // K.term's row baselines
  const tx0 = rect.x + 28;
  // Python prints the path with doubled backslashes; each one is \\\\ in this string literal
  const ERR_PRE = "python: can't open file '", ERR_DIR = 'C:\\\\Users\\\\you\\\\';
  const ERR = ERR_PRE + ERR_DIR + "script.py':\n[Errno 2] No such file or directory";
  const promptW = K.measure('C:\\Users\\you>', mono);
  // cmd.exe prints a blank line before the next prompt (row 4), which gives the ring clean air;
  // the ring stays inside the window and clears the caret
  const ring = { x: tx0 + promptW / 2 + 8, y: rowY(4) - 9, rx: promptW / 2 + 24, ry: 32 };
  // "you are here": the map's own terracotta pin, standing just right of the ring
  const HERE = { x: ring.x + ring.rx + 34, y: rowY(4) + 2 };
  const hereLab = { ...M.type.caption, color: C.body };
  const hereEnd = HERE.x + 24 + K.measure('you are here', hereLab);
  // "where Python looked": the folder part of the path in the error (C:\\Users\\you\\), underlined in gold
  const dirX = tx0 + K.measure(ERR_PRE, mono), dirW = K.measure(ERR_DIR, mono);
  const lookLab = { font: 'ui', size: 28, weight: 600, color: C.head };
  // its connector leaves the underline's right end, drops past the end of the [Errno 2] line, and lands
  // on "you are here": the folder Python looked in is the folder you are standing in
  const LINK = { x1: dirX + dirW - 16, y1: rowY(1) + 18, x2: hereEnd + 16, y2: rowY(4) - 9 };
  // where script.py actually is: one line under the window, its path set directly under the prompt's
  // (same mono, same x) so the only difference, \projects, stands out in gold (06's AI typed `cd projects`)
  const THERE_Y = WIN.y + WIN.h + 64, THERE = ['C:\\Users\\you', '\\projects'];
  const thereEnd = tx0 + K.measure(THERE.join(''), mono);
  // the causes and their fixes: two rows under that line, "or" between them
  const R = [684, 834], CH = 72;
  const causeLab = { size: 30, font: 'ui', weight: 600 };
  const CAUSES = ['wrong folder', 'still script.txt'];
  const CW = 88 + Math.max(...CAUSES.map((s) => K.measure(s, causeLab))) + 36;
  const FX = X + CW + 110;                               // fix tags' left edge
  const cdTo = { x: FX, y: R[0] - M.SIZE.compact.h / 2, compact: 1, shelved: 1 };
  const pyTo = { x: FX, y: R[1] - M.SIZE.compact.h / 2, compact: 1, shelved: 1 };
  const cause = (i, y) => {
    K.card(X, y - CH / 2, CW, CH, { r: 22 });
    if (i === 0) K.folder(X + 46, y + 1, 40);
    else M.script(X + 46, y, 50, { name: '' });
    K.text(CAUSES[i], X + 88, y + 11, { ...causeLab, color: C.strong });
  };

  const tWin = Math.min(tErrWord - 0.35, tSecond + 0.9);   // the terminal rises on "is an error"
  if (t > tWin - 0.3) {
    K.layer(K.io(t, tWin - 0.2, 0.5, 'out'), () => K.eyebrow('Surprise two · an error', X, EY));
    K.rise(t, tWin, () => {
      K.win(WIN.x, WIN.y, WIN.w, WIN.h, { title: 'Command Prompt', kind: 'terminal', focus: true });
      // before the command is typed, an idle prompt (steady prompt, blinking caret)
      const items = t < tRun + 0.4
        ? [{ at: -99, cmd: '' }]
        : [{ at: tRun + 0.4, cmd: 'python script.py', cps: 16 }, { at: tErr, out: ERR, color: C.accent }, { at: tErr + 0.5, out: '' }, { at: tErr + 0.5, cmd: '' }];
      K.term(rect, t, items, { size: FS });
    });
    // the narration reads the error out: underline the two phrases as they are said
    // (they step back once the cause is being circled, so the eye moves to the ring)
    if (t > tErr) {
      const mk = { color: C.accent, w: 4, alpha: 0.75 * (1 - 0.5 * K.io(t, tStand - 0.2, 0.5)) };
      K.mark(tx0 + K.measure('python: ', mono), rowY(1) + 10, K.measure("can't open file", mono), K.io(t, tCant, 0.6), mk);
      K.mark(tx0 + K.measure('[Errno 2] ', mono), rowY(2) + 10, K.measure('No such file or directory', mono), K.io(t, tSuch, 0.8), mk);
    }
    // "That doesn't mean your code is broken": a quiet callout beside the terminal, dimmed once the cause is shown
    // it points at the error's end, the path Python looked for and never found
    const errEnd = tx0 + K.measure(ERR.split('\n')[0], mono), cy = rowY(1) - 9;
    const cw = K.measure('not a code problem', { size: 30, font: 'ui', weight: 600 }) + 48, cx = errEnd + 150 + cw / 2;
    K.layer(1 - 0.45 * K.io(t, tStand, 0.5), () => {
      K.arrow(cx - cw / 2 - 12, cy, errEnd + 22, cy, { k: K.io(t, tBroken, 0.45), color: C.soft, w: 2.5, headSize: 13 });
      K.rise(t, tBroken - 0.15, () => K.pill('not a code problem', cx, cy, { size: 30, color: C.strong }));
    });
    // "Python never even opened it": the path in the error is where it looked, C:\\Users\\you\\
    if (t > tErr) {
      K.mark(dirX, rowY(1) + 10, dirW, K.io(t, tNever, 0.6), { color: C.head, w: 4, alpha: 0.95 });
      K.layer(K.io(t, tNever + 0.35, 0.45, 'out'), () => K.text('where Python looked', LINK.x1 + 46, rowY(2) + 2, lookLab));
    }
    // "you're standing in the wrong folder": circle the prompt and pin it, like the map's you-are-here
    // K.ring tilts -0.08 rad; counter most of it so the left arc clears the "C" of the prompt
    K.at(ring.x, ring.y, 1, 0.055, () => K.ring(0, 0, ring.rx, ring.ry, K.io(t, tStand, 0.7), { color: C.head, w: 4 }));
    const kHere = K.io(t, tStand + 0.35, 0.5);
    if (kHere > 0) {
      M.pin(HERE.x, HERE.y + K.wave(t, M.motion.bob.speed, 3), 44, { color: C.accent, k: kHere });
      K.layer(K.io(t, tStand + 0.45, 0.4, 'out'), () => K.text('you are here', HERE.x + 24, rowY(4), hereLab));
    }
    // ...and the folder Python looked in is that one: the gold connector closes the loop
    // (its first fifth drops from the underline with the label, so "where Python looked" is never a loose caption;
    // the head appears only once it heads for "you are here")
    const kLink = 0.2 * K.io(t, tNever + 0.3, 0.4) + 0.8 * K.io(t, tStand + 0.4, 0.6);
    if (t > tErr) K.arrow(LINK.x1, LINK.y1, LINK.x2, LINK.y2, { k: kLink, head: kLink > 0.3, bend: -95, color: C.head, w: 2.5, headSize: 13 });
    // "wrong folder": where script.py really is, set right under the prompt
    K.rise(t, tWrong, () => K.spans([{ s: THERE[0], color: C.body }, { s: THERE[1], color: C.head, weight: 600 }], tx0, THERE_Y, mono), 14, 0.5);
    const kThere = K.io(t, tWrong + 0.2, 0.5);
    if (kThere > 0) {
      M.pin(thereEnd + 34, THERE_Y + 2, 44, { color: C.head, k: kThere });
      K.layer(K.io(t, tWrong + 0.3, 0.4, 'out'), () => K.text('script.py is here', thereEnd + 58, THERE_Y, hereLab));
    }
    // row 1: the folder you are standing in is the wrong one -> cd (from 02's shelf)
    K.rise(t, tWrong + 0.3, () => cause(0, R[0]));
    K.arrow(X + CW + 18, R[0], FX - 18, R[0], { k: K.io(t, tCd + 0.5, 0.35), color: C.soft, w: 2.5, headSize: 13 });
    // "or"
    K.layer(K.io(t, tOr, 0.4, 'out'), () => K.text('or', X + CW / 2, (R[0] + R[1]) / 2 + 12, { font: 'read', italic: true, size: 34, color: C.soft, align: 'center' }));
    // row 2: the file is still script.txt (the same file as 02) -> .txt → .py
    K.rise(t, tStill, () => cause(1, R[1]));
    K.arrow(X + CW + 18, R[1], FX - 18, R[1], { k: K.io(t, tPy + 0.5, 0.35), color: C.soft, w: 2.5, headSize: 13 });
  }

  // ---------------------------------------------------------------- the map tile (corner -> hero -> corner)
  const kIn = K.io(t, 0, 0.8), kBack = K.io(t, tSecond, 0.8);
  const tp = kBack <= 0 ? M.arc(CORNER, HERO, kIn, 24) : M.arc(HERO, CORNER, kBack, 24);
  const ts = kBack <= 0 ? lerp(CORNER[2], HERO[2], kIn) : lerp(HERO[2], CORNER[2], kBack);
  // a shelved pin warms as its tag leaves the tile
  const leaveGlow = (t0) => K.io(t, t0 - 0.25, 0.3) * (1 - K.io(t, t0 + 0.4, 0.6));
  const specs = SHELVED.map((m) => ({ mod: m, glow: m === '02' ? leaveGlow(tCd) : m === '01' ? leaveGlow(tPy) : 0 }));
  JUST.forEach((p, i) => {
    const T = pinT[i]; if (t < T.land) return;
    specs.push({ ...p, k: lerp(K0, 1, K.io(t, T.land, PLANT, 'back')), glow: 0.6 * (1 - K.seg(t, T.land, T.land + 0.8)) });
  });
  M.mapTile(tp.x, tp.y, ts, specs, { t });

  // ---------------------------------------------------------------- in flight (drawn on top of everything)
  // the shelved tags glide out of the tile to stand beside the cause they fix
  const fromTile = (mod) => {
    const q = M.tilePt(CORNER[0], CORNER[1], CORNER[2], mod);
    return { x: q.x - M.SIZE.compact.w / 2, y: q.y - 12 - M.SIZE.compact.h / 2, compact: 1, shelved: 1, scale: 0.3, alpha: 0.25 };
  };
  // a negative bow swings them down the empty right side and in under the window, so they never fly
  // across the error text, "where Python looked" or the "not a code problem" pill
  const SWOOP = { bow: -260 };
  if (t >= tCd) M.tagMove(M.TAGS[1].label, t, tCd, M.motion.glide, fromTile('02'), cdTo, SWOOP);
  if (t >= tPy) M.tagMove(M.TAGS[0].label, t, tPy, M.motion.glide, fromTile('01'), pyTo, SWOOP);

  // the "just" pins: each word lifts off as a terracotta pin and arcs to its place on the tile
  const ps = HERO[2] * JUST_SIZE;                        // = the landed pin's size on the hero tile
  JUST.forEach((p, i) => {
    const T = pinT[i]; if (t < T.l || t >= T.land) return;
    const jx = X + 100 + jw / 2, jy = BY[i] + BH / 2;
    const A0 = { x: jx, y: jy + 16 }, A1 = { x: jx, y: jy - 10 };
    const B = M.tilePt(HERO[0], HERO[1], HERO[2], p);
    const hover = { x: B.x, y: B.y - (1 - K0) * ps * 1.1 }, hs = ps * (0.55 + 0.45 * K0);   // = M.pin at k K0
    let x, y, s, a = 1;
    if (t < T.f) { const kl = K.io(t, T.l, LIFT, 'out'); x = A0.x; y = lerp(A0.y, A1.y, kl); s = lerp(28, FLY_SIZE, kl); a = kl; }
    else { const kf = K.io(t, T.f, FLY, 'io'), q = M.arc(A1, hover, kf, 210); x = q.x; y = q.y; s = lerp(FLY_SIZE, hs, kf); }
    K.layer(a, () => M.pin(x, y, s, { color: C.accent, glow: 0.6 }));
  });
});
