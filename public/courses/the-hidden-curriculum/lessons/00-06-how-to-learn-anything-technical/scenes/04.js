/* 00.06 scene 04: The first clue, and its exact words.
   The case file slides from home to the side (0.55). Clue lights; a Python traceback prints in a terminal and is
   read (file / line / kind, the last line circled, "did you mean"). The clerk reads it too; your cream tick is the
   check. At [[exact]] Clue is done and Search lights: the terminal collapses to the circled line, which becomes a
   search query minus your own names; an AI answer slides in over the result cards, and one source is followed. */
SCENE('04', (t, S) => {
  K.bg();
  const g = K.ctx(), C = K.C;
  const cue = (n, f) => S.cue(n, f);
  const find = (w, n, f) => S.find(w, n, f);

  const T0 = cue('traceback', 0), tLast = cue('last-line', 7.4), tDym = cue('did-you-mean', 13.3);
  const tAgent = cue('agent-reads', 18.7), tExact = cue('exact', 23.8), tAI = cue('ai-answer', 32.1), tSrc = cue('source', 37.7);

  // ------------------------------------------------------------ the case file: home -> side, Clue then Search
  const slide = K.io(t, T0, M.motion.move);
  const F = M.lerpGeo('home', 'side', slide);
  const clueV = K.io(t, T0 + 0.1, M.motion.light) + K.io(t, tExact, M.motion.light);
  const searchV = K.io(t, tExact + 0.5, M.motion.light);
  // file / line / kind are written onto the case sheet as they are named (the matching spans underline in the terminal)
  const fileAt = find('file', 0, T0 + 4.1), lineAt = find('line', 0, T0 + 5.0), kindAt = find('kind', 0, T0 + 6.0);
  const notes = [['file', 'app.py', fileAt], ['line', '3', lineAt], ['kind', 'NameError', kindAt]];
  const notesA = 1 - K.io(t, tExact, 0.45);
  // [[exact]]: the three notes condense into the Clue tab's running line, which stays on the sheet for the lesson
  const clueLineK = K.io(t, tExact + 0.3, 0.5);
  const content = (G) => {
    if (clueLineK > 0) K.layer(clueLineK, () => {
      const y = G.inner.y + 34 + (1 - clueLineK) * 10;
      K.icon('warning', G.inner.x + 22, y - 9, 26, { color: C.head, w: 2 });
      K.text('NameError · app.py line 3', G.inner.x + 46, y, { font: 'ui', weight: 600, size: 26, color: C.strong });
    });
    if (notesA <= 0) return;
    K.layer(notesA, () => notes.forEach(([lab, val, at], i) => {
      const k = K.io(t, at, 0.45);
      if (k <= 0) return;
      const y = G.inner.y + 30 + i * 52;
      K.layer(k, () => {
        K.text(lab, G.inner.x + 70, y, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'right' });
        K.text(K.typed(val, t, at, 28), G.inner.x + 88, y, { font: 'mono', size: 26, color: C.head });
      });
    }));
  };
  M.drawFile(t, F, { tabs: [clueV, searchV, 0, 0, 0], labels: slide > 0.9 ? 'above' : 'none', caseNo: slide < 0.3 ? 'CASE 00.06' : false, content });

  // you: from 03's spot (left of the file) to just under the side file, beside it
  const youX = K.lerp(380, 300, slide), youY = K.lerp(620, 740, slide), youS = K.lerp(120, 90, slide);
  M.you(t, youX, youY, youS, { label: 1 });

  // ------------------------------------------------------------ the terminal
  const mono28 = { font: 'mono', size: 26 }; // terminal text (26 keeps the circled line inside the window)
  const collapse = K.io(t, tExact + 0.4, M.motion.move);
  // centred on the side file while it is read; rises to the top when it collapses to the circled line
  const TX = 700, TY = K.lerp(250, 180, collapse), TW = 1140;
  const TH = K.lerp(430, 150, collapse);
  const termIn = K.io(t, T0 + 0.3, 0.6);
  const rows = [
    null, // prompt row, drawn separately
    'Traceback (most recent call last):',
    '  File "C:\\Users\\you\\app.py", line 3, in <module>',
    '    pirnt("hello")',
    '    ^^^^^',
    "NameError: name 'pirnt' is not defined. Did you mean: 'print'?",
  ];
  const LX = TX + 48, base = (i) => TY + 50 + 56 + i * 42;
  const lastY = K.lerp(base(5), base(0), collapse);
  const lastW = K.measure(rows[5], mono28);
  const printed = t >= T0 + 1.2; // the traceback prints all at once after the command
  const aboveA = (1 - 0.5 * K.io(t, tLast, 0.5)) * (1 - K.io(t, tExact, 0.45));
  const xOf = (row, sub) => LX + K.measure(rows[row].slice(0, rows[row].indexOf(sub)), mono28);

  K.rise(t, T0 + 0.3, () => {
    const R = K.win(TX, TY, TW, TH, { kind: 'terminal', title: 'Terminal', titleSize: 26 });
    g.save(); g.beginPath(); g.rect(R.x, R.y, R.w, R.h); g.clip();
    // prompt + command
    K.layer(aboveA, () => {
      const cmd = 'python app.py', shown = K.typed(cmd, t, T0 + 0.5, 30);
      let x = LX + K.text('C:\\Users\\you>', LX, base(0), { ...mono28, color: C.head });
      x += K.text(' ' + shown, x, base(0), { ...mono28, color: C.strong });
      if (!printed && K.caretOn(t)) { g.fillStyle = C.strong; g.fillRect(x + 4, base(0) - 22, 15, 28); }
      if (printed) for (let i = 1; i <= 4; i++) K.text(rows[i], LX, base(i), { ...mono28, color: i === 4 ? C.soft : C.body });
    });
    if (printed) K.text(rows[5], LX, lastY, { ...mono28, color: C.strong });
    g.restore();
  }, 20, 0.6);

  // file / line / kind: gold marks under the spans (their values are written onto the case sheet above)
  const spans = [
    { at: fileAt, row: 2, sub: 'app.py' },
    { at: lineAt, row: 2, sub: 'line 3' },
    { at: kindAt, row: 5, sub: 'NameError' },
  ];
  const legendA = (1 - 0.55 * K.io(t, tLast, 0.5)) * (1 - K.io(t, tExact, 0.4));
  spans.forEach((sp) => {
    const k = K.io(t, sp.at, 0.45);
    if (k <= 0) return;
    const x = xOf(sp.row, sp.sub), w = K.measure(sp.sub, mono28);
    const y = sp.row === 5 ? lastY : base(sp.row);
    const keep = sp.row === 5 ? 1 - K.io(t, tExact, 0.4) : legendA;
    K.layer(keep, () => K.mark(x, y + 9, w, k, { w: 4, alpha: 0.85 }));
  });

  // [[last-line]]: circle the line that names the failure
  const ringK = K.io(t, tLast + 0.2, 0.9);
  // centred on the line and capped so the whole ellipse stays 12 px inside the terminal window
  const ringCX = LX + lastW / 2, ringRX = Math.min(lastW / 2 + 40, ringCX - (TX + 12), TX + TW - 12 - ringCX);
  K.ring(ringCX, lastY - 9, ringRX, 44, ringK, { color: C.head, w: 4, rot: 0 });
  const readAt = find('last', 0, tLast + 4.6);
  K.layer(K.io(t, readAt, 0.45) * (1 - K.io(t, tExact, 0.4)), () =>
    K.pill('read this first', ringCX, lastY + 66, { size: 28, color: C.head, stroke: K.rgba(C.head, 0.6), fill: '#1C1B2A' }));

  // [[did-you-mean]]: friendlier errors (Python 3.14), on a card just under the terminal; it gives way to the clerk
  const dymOut = 1 - K.io(t, tAgent, 0.45);
  const dymA = K.io(t, tDym, 0.6) * dymOut;
  const dymText = "SyntaxError: invalid syntax. Did you mean 'while'?";
  const mono26 = { font: 'mono', size: 26 };
  const cw = K.measure('M', mono26);
  const dymW = K.measure(dymText, mono26) + 64, DY = 712;
  if (dymA > 0) {
    K.layer(dymA, () => {
      g.save(); g.translate(0, (1 - K.io(t, tDym, 0.6)) * 30);
      K.card(TX, DY, dymW, 96, { r: 16, fill: '#262333', stroke: C.line2 });
      K.text(dymText, TX + 32, DY + 58, { ...mono26, color: C.strong });
      g.restore();
    });
    K.layer(K.io(t, find('friendlier', 0, tDym + 0.8), 0.45) * dymOut, () => M.dated('Python 3.14 · Oct 2025', TX + 196, DY + 150));
  }
  // "did you mean...": gold marks under both suggestions (the traceback's stays until [[exact]])
  const dymMark = K.io(t, find('did', 0, tDym + 3.9), 0.6);
  if (dymMark > 0) {
    K.layer(dymOut, () => {
      const dx = TX + 32 + K.measure("SyntaxError: invalid syntax. ", mono26);
      K.mark(dx, DY + 70, K.measure('Did you mean', mono26), dymMark, { w: 4 });
    });
    K.layer(1 - K.io(t, tExact, 0.4), () =>
      K.mark(xOf(5, 'Did you mean'), lastY + 9, K.measure("Did you mean: 'print'?", mono28), dymMark, { w: 4 }));
  }

  // [[agent-reads]]: the clerk reads the error and says what it found; you check its reading against the error itself
  const agentOut = 1 - K.io(t, tExact, 0.45);
  const clerkK = K.io(t, tAgent, 0.6);
  const CLX = 1480, CLY = 760;
  const sayText = 'cause: typo pirnt → print, line 3';
  const sayX0 = LX + cw * 5;                 // puts the chip's 'pirnt' straight under the traceback's 'pirnt'
  const sayX = sayX0 - 28, sayY = 718, sayW = K.measure(sayText, mono26) + 56, sayH = 84, sayTY = sayY + 52;
  const sayAt = tAgent + 1.0, sayK = K.io(t, sayAt, 0.5);
  if (clerkK > 0) {
    M.clerk(t, CLX, CLY, 72, { alpha: clerkK * agentOut, label: clerkK * agentOut });
    K.layer(agentOut, () => {
      M.clerkLine(CLX + 30, CLY - 40, LX + lastW + 24, lastY + 30, K.io(t, tAgent + 0.3, 0.8), { bend: -30 });
      if (sayK > 0) K.layer(sayK, () => {
        g.save(); g.translate((1 - sayK) * 16, 0);
        K.card(sayX, sayY, sayW, sayH, { r: 18, fill: '#24222F', stroke: K.rgba(C.head, 0.6), shadow: false });
        // a small tail toward the clerk
        g.beginPath(); g.moveTo(sayX + sayW - 1, sayY + 30); g.lineTo(sayX + sayW + 16, sayY + 42); g.lineTo(sayX + sayW - 1, sayY + 54);
        g.closePath(); g.fillStyle = '#24222F'; g.fill(); g.strokeStyle = K.rgba(C.head, 0.6); g.lineWidth = 2;
        g.beginPath(); g.moveTo(sayX + sayW, sayY + 30); g.lineTo(sayX + sayW + 16, sayY + 42); g.lineTo(sayX + sayW, sayY + 54); g.stroke();
        K.text(K.typed(sayText, t, sayAt + 0.2, 34), sayX0, sayTY, { ...mono26, color: C.head });
        g.restore();
      });
    });
  }
  // your check: matching cream outlines round the same words in the clerk's chip and in the traceback
  const box = (x, y, w, k) => {
    if (k <= 0) return;
    K.rr(x - 3, y - 26, w + 6, 36, 8);
    g.strokeStyle = K.rgba(C.strong, 0.95 * k); g.lineWidth = 2.5; g.stroke();
  };
  const pairA = find(/^error$/i, 1, tAgent + 2.4), pairB = find('your', 0, tAgent + 3.0), checkAt = find('check', 0, tAgent + 3.2);
  const kA = K.io(t, pairA, 0.45), kB = K.io(t, pairB, 0.45);
  K.layer(agentOut * sayK, () => {
    const pw = K.measure('pirnt', mono26), lw = K.measure('line 3', mono26);
    // pair A: 'pirnt' (chip) <-> 'pirnt' (last line), with a short straight cream link between them
    box(sayX0 + cw * 12, sayTY, pw, kA);
    box(xOf(5, 'pirnt'), lastY, pw, kA);
    M.youLine(sayX0 + cw * 14.5, sayTY - 30, xOf(5, 'pirnt') + pw / 2, lastY + 16, K.io(t, pairA + 0.15, 0.4), { head: 10 });
    // pair B: 'line 3' (chip) <-> 'line 3' (traceback's File row)
    box(sayX0 + cw * 27, sayTY, lw, kB);
    box(xOf(2, 'line 3'), base(2), lw, kB);
    // the cream tick: your check, tied to you
    M.youLine(youX + 40, youY - 30, sayX - 70, sayY + 50, K.io(t, checkAt - 0.2, 0.5), { bend: 20 });
    M.tick(sayX - 40, sayY + 40, 46, K.io(t, checkAt, 0.5));
    K.layer(K.io(t, checkAt + 0.1, 0.45), () =>
      K.text('your check', sayX - 40, sayY + sayH + 50, { font: 'ui', weight: 600, size: 28, color: C.strong, align: 'center' }));
  });


  // ------------------------------------------------------------ [[exact]]: the search window
  const SX = 700, SY = 380, SW = 1140, SH = 540;
  const searchIn = K.io(t, tExact + 0.8, 0.6);
  if (searchIn > 0) {
    K.layer(searchIn, () => {
      g.save(); g.translate(0, (1 - searchIn) * 24);
      const R = K.win(SX, SY, SW, SH, { kind: 'browser', title: 'Search', titleSize: 26, url: '', urlLock: false });

      // the query: the circled line lifted out, then cut down to the tool's own words
      const qy = SY + 50 + 39, qx = SX + 16 + 22 + 8, cw = K.measure('M', mono26);
      const typeAt = find('search', 0, tExact + 1.25);
      const full = rows[5];
      const typedN = K.clamp(Math.floor((t - typeAt) * 52), 0, full.length);
      const minusAt = find('minus', 0, tExact + 2.7);
      const cut = K.io(t, minusAt, 0.6);          // your names fade
      const close = K.io(t, minusAt + 0.7, 0.6);  // the tool's words close up
      const quote = K.io(t, minusAt + 1.0, 0.5);
      // segments: [text, start char in full, start char in final, keep]
      const segs = [
        ['NameError: name', 0, 1, true], [" 'pirnt'", 15, 0, false],
        [' ', 23, 0, false], ['is not defined', 24, 19, true], ['. Did you mean: \'print\'?', 38, 0, false],
      ];
      g.save(); K.rr(SX + 16, SY + 59, SW - 32, 42, 21); g.clip();
      segs.forEach(([s, a, b, keep]) => {
        const vis = s.slice(0, K.clamp(typedN - a, 0, s.length));
        if (!vis) return;
        const x = qx + cw * (keep ? K.lerp(a, b, close) : a);
        K.text(vis, x, qy, { ...mono26, color: keep || cut === 0 ? C.strong : C.soft, alpha: keep ? 1 : 1 - cut });
      });
      if (quote > 0) [0, 16, 18, 33].forEach((c) => K.text('"', qx + cw * c, qy, { ...mono26, color: C.head, alpha: quote }));
      if (typedN < full.length && t >= typeAt && K.caretOn(t)) { g.fillStyle = C.strong; g.fillRect(qx + cw * typedN + 2, qy - 21, 13, 26); }
      g.restore();
      // your tick on the exact words: the query that finds everyone who hit it
      const qTickK = K.io(t, minusAt + 1.4, 0.5);
      M.tick(qx + cw * 34 + 34, qy - 9, 34, qTickK);
      K.text("the tool's words", qx + cw * 34 + 68, qy, { font: 'ui', weight: 600, size: 26, color: C.strong, alpha: K.io(t, minusAt + 1.5, 0.45) });

      g.save(); g.beginPath(); g.rect(R.x, R.y, R.w, R.h); g.clip();
      // the paraphrase you might have typed instead: quiet, struck through
      const paraA = K.io(t, minusAt + 1.8, 0.5) * (1 - K.io(t, tAI, 0.4));
      if (paraA > 0) {
        const ps = 'python print not working', pw = K.pill(ps, SX + 40 + (K.measure(ps, { font: 'ui', size: 26, weight: 600 }) + 42) / 2, 548, { size: 26, color: C.quiet, alpha: paraA });
        K.line(SX + 52, 548, SX + 28 + pw, 548, { k: K.io(t, minusAt + 2.4, 0.5), color: C.accent, w: 3, alpha: paraA });
        K.layer(paraA, () => M.cross(SX + 40 + pw + 34, 548, 40, K.io(t, minusAt + 2.7, 0.5), { disc: true }));
        K.text('your paraphrase', SX + 40 + pw + 76, 557, { font: 'ui', weight: 600, size: 26, color: C.quiet, alpha: paraA });
      }

      // report cards: everyone who hit it
      const cardsAt = find('everyone', 0, tExact + 6.6);
      const down = K.io(t, tAI - 0.2, 0.7);
      const cy = K.lerp(608, 790, down);
      const names = ['Python docs', 'Q&A thread', 'Issue tracker'];
      const clickAt = find('Click', 0, tSrc), srcK = K.io(t, clickAt + 0.6, 0.4);
      names.forEach((nm, i) => {
        const k = K.stagger(t, cardsAt, i, 0.15, 0.6);
        if (k <= 0) return;
        const cx = SX + 30 + i * 370, lit = i === 0 ? srcK : 0;
        K.layer(k, () => {
          g.save(); g.translate(0, (1 - k) * 18);
          K.card(cx, cy, 340, 116, { r: 16, fill: '#232130', stroke: lit ? K.rgba(C.head, 0.4 + 0.5 * lit) : C.line2, glow: lit * 0.7, shadow: false });
          K.icon('chat', cx + 38, cy + 40, 34, { color: lit ? C.head : C.soft, w: 2 });
          K.text(nm, cx + 70, cy + 50, { font: 'ui', weight: 600, size: 26, color: lit ? C.strong : C.body });
          [[260, 78], [190, 98]].forEach(([w, y]) => { K.rr(cx + 24, cy + y - 4, w, 8, 4); g.fillStyle = K.rgba(C.soft, 0.35); g.fill(); });
          g.restore();
        });
      });

      // [[ai-answer]]: the AI answer slides down above the links
      const aiK = K.io(t, tAI - 0.2, 0.7); // with the cards moving down, on 'Search an error today'
      if (aiK > 0) {
        K.layer(aiK, () => {
          g.save(); g.translate(0, -(1 - aiK) * 40);
          const ax = SX + 30, ay = 512;
          K.card(ax, ay, 1080, 150, { r: 18, fill: '#24222F', stroke: K.rgba(C.head, 0.45), shadow: false });
          K.glow(ax + 52, ay + 46, 60, C.head, 0.25);
          K.icon('sparkle', ax + 52, ay + 46, 38, { color: C.head, w: 2.4 });
          K.eyebrow('AI answer', ax + 90, ay + 55, { size: 24 });
          [[960, 92], [880, 114], [620, 136]].forEach(([w, y]) => { K.rr(ax + 30, ay + y - 5, w, 10, 5); g.fillStyle = K.rgba(C.soft, 0.4); g.fill(); });
          g.restore();
        });
      }
      // sources underneath: chips tied by thin strings to the cards
      const srcAt = find('sources', 0, tAI + 3.9);
      [0, 1, 2].forEach((i) => {
        const k = K.stagger(t, srcAt, i, 0.15, 0.45);
        if (k <= 0) return;
        const chx = SX + 90 + i * 112, chy = 704;
        const cardTop = SX + 30 + i * 370 + 170;
        const glowS = i === 0 ? K.io(t, tSrc, 0.4) : 0;
        K.line(chx, chy + 24, cardTop, 790, { k: K.io(t, srcAt + 0.2 + i * 0.15, 0.6), color: glowS ? C.head : K.rgba(C.soft, 0.6), w: 1.5 + 1.5 * glowS });
        if (glowS) K.glow((chx + cardTop) / 2, (chy + 814) / 2, 90, C.head, 0.12 * glowS);
        K.pill(`[${i + 1}]`, chx, chy, { size: 26, font: 'mono', color: C.head, stroke: K.rgba(C.head, 0.45 + 0.4 * glowS), fill: '#1C1B2A', alpha: k, glow: glowS * 0.6 });
      });

      // [[source]]: your cursor follows the lit string to its card
      const curK = K.io(t, clickAt, 0.7);
      if (curK > 0) {
        const ax0 = SX + 90 + 10, ay0 = 734, ax1 = SX + 200 + 30, ay1 = 790 + 66;
        const px = K.lerp(ax0, ax1, curK), py = K.lerp(ay0, ay1, curK);
        K.layer(K.io(t, clickAt - 0.1, 0.3), () => {
          g.save(); g.translate(px, py);
          g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.lineTo(9, 26); g.lineTo(16, 40); g.lineTo(22, 37); g.lineTo(15, 24); g.lineTo(26, 24); g.closePath();
          g.fillStyle = C.strong; g.fill(); g.lineWidth = 2; g.strokeStyle = C.page; g.stroke();
          g.restore();
        });
      }
      g.restore();
      g.restore();
    });
  }
  // the lifted line: a short cream arrow from the circled line into the query bar while it is typed
  const liftK = K.io(t, find('search', 0, tExact + 1.25) - 0.2, 0.5);
  K.layer(1 - K.io(t, find('minus', 0, tExact + 2.7) + 1.4, 0.5), () =>
    M.youLine(TX + 160, TY + TH + 8, TX + 160, SY + 52, liftK));
});
