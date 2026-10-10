/* 01.05 · 08 Virtual environments: a street pinned to the top.
   Beats (local seconds, cues.json; section 41.6 s):
     - [[activate]] 0       07's three streets (Python310, the WindowsApps signpost, miniconda3), courier at the start;
                            the terminal strip types `.venv\Scripts\activate` and its prompt gains "(.venv)".
       "pins" ~3.45         a new street "0" slides in above street 1 (the others shift down): my-project\.venv\Scripts
       "top" ~4.9           the gold pin fixes it.
     - [[project-python]] ~7.0  `python` is typed; the courier hops to street 0 and walks it; the shop lights.
     - [[one-shell]] ~12.4  the street grid folds back into the PATH card of "Terminal 1" (gold-underlined .venv first).
       "couriers" ~15.3     a copy flies from Terminal 1 to a child courier: "python.exe" (file glyph, as on the street pills; </> stays the editor).
       "Another" ~17.4      Terminal 2 with its own PATH card, no .venv: "not activated".
       "agent's" ~20.6      the agent (sparkle + lantern) with the same unpinned card: "not activated".
     - [[both-true]] ~22.6  speech pills "I activated it" (Terminal 1) and "wrong Python" (Terminal 2);
       "different" ~30.2    rings on the two couriers and the label "different window".
     - [[skip-activation]] ~31.9  pills fade; at "U V run" ~34.9 a `uv run` pill pops on Terminal 2 (the scene's one
                            'back'); at "directly" the .venv street is typed onto the front of its card, dashed:
                            "for this one command"; eyebrow "more in 05.03 · 05.04".
   Last frame: the three cards resting, Terminal 1 lit, the uv run line on Terminal 2's card. */
SCENE('08', (t, S) => {
  const C = K.C;
  K.bg();

  const tAct = S.cue('activate', 0);
  const tPins = S.find('pins', 0, 3.45);
  const tTop = S.find('top', 0, 4.91);
  const tPy = S.cue('project-python', 7.04);
  const tPyWord = S.find('python', 0, 7.33);
  const tOne = S.cue('one-shell', 12.37);
  const tSends = S.find('couriers', 0, 15.28);
  const tAnother = S.find('another', 0, 17.44);
  const tAgent = S.find('agent', 0, 20.6);
  const tBoth = S.cue('both-true', 22.58);
  const tIAct = S.find('activated', 0, 23.6);
  const tWrong = S.find('wrong', 0, 26.08);
  const tDiff = S.find('different', 0, 30.23);
  const tSkip = S.cue('skip-activation', 31.92);
  const tUv = S.find(/^(uv|u)$/i, 0, 34.9);
  const tDirect = S.find('directly', 0, 37.59);
  const tJust = S.find('just', 0, 39.46);

  // ------------------------------------------------------------ phase 1: the street grid (0 .. one-shell)
  const fold = K.io(t, tOne, 0.8);            // grid out, cards in
  const gridA = 1 - fold;
  if (gridA > 0.002) {
    const slide = K.io(t, tPins, 0.8);
    const y0 = [320, 500, 680], y1 = [400, 550, 700];
    const ys = [250, ...y0.map((y, i) => K.lerp(y, y1[i], slide))];
    const geo = { ...M.L.streets3, ys };
    const rowK = K.io(t, tPins + 0.1, 0.9);
    const pin = K.io(t, tTop, 0.5, 'out');
    const walkA = tPyWord + 0.45, walkB = walkA + 0.75;      // hop up, then walk the pinned street
    const arrived = t >= walkB;
    const rows = [
      { num: '0', name: 'my-project\\.venv\\Scripts', file: 'python.exe', k: rowK, pinned: pin, state: arrived ? 'lit' : 'idle' },
      { num: '1', name: 'C:\\Users\\…\\Python310', file: 'python.exe', state: 'idle' },
      { num: '2', name: 'C:\\Users\\…\\WindowsApps', file: 'python.exe', state: 'signpost' },
      { num: '3', name: 'C:\\Users\\…\\miniconda3', file: 'python.exe', state: 'idle' },
    ];
    // once the courier is in, the streets it never visited recede (signpost kept as a signpost)
    const dimK = K.io(t, walkB, 0.5);
    K.layer(gridA, () => {
      M.streets(t, geo, { rows: rows.map((r, i) => (i === 0 ? { ...r, k: 0 } : r)), alpha: 1 - 0.6 * dimK });
      M.streets(t, geo, { rows: [rows[0]] });

      // the courier: rides street 1 while the grid shifts, hops to street 0, walks it
      const hop = K.io(t, tPyWord, 0.4);
      const walk = K.io(t, walkA, walkB - walkA);
      const start = M.streetAt(1, 0, geo), top = M.streetAt(0, 0, geo), end = M.streetAt(0, 0.86, geo);
      const cx = K.lerp(start.x, top.x, hop) + (end.x - top.x) * walk;
      const cy = K.lerp(start.y, top.y, hop);
      const moving = (t > tPyWord && t < walkB) ? 1 : 0;
      M.courier(t, cx, cy, 80, { walking: moving, lit: K.io(t, walkB, 0.4), alpha: 1 - K.io(t, walkB, 0.5) * 0.25 });

      // terminal strip: activate, then python
      M.termStrip(t, [
        { at: tAct + 0.6, cmd: '.venv\\Scripts\\activate', prompt: 'my-project>', cps: 26 },
        { at: tPyWord - 0.15, cmd: 'python', prompt: '(.venv) my-project>', cps: 18 },
      ], { prompt: 'my-project>', rows: 1, focus: true });
    });
  }

  // ------------------------------------------------------------ phase 2: one shell, three cards
  if (fold > 0.002) {
    const R = [300, 520, 740];                 // courier centre per row
    const cardX = 330, cardW = 1130, cardH = 88, size = 28, tagX = 1650;
    const V1 = 'C:\\…\\my-project\\.venv\\Scripts;C:\\…\\Python310;C:\\…\\WindowsApps;…';
    const V2 = 'C:\\…\\Python310;C:\\…\\WindowsApps;C:\\…\\miniconda3;…';
    const PRE = 'C:\\…\\my-project\\.venv\\Scripts;';
    const monoW = (s) => K.measure(s, { font: 'mono', weight: 600, size });
    const nameW = K.measure('PATH', { font: 'mono', weight: 700, size }) + 56;
    const valX = cardX + nameW + 30;

    const rowA = [
      K.io(t, tOne + 0.15, 0.7),
      K.io(t, tAnother, 0.6),
      K.io(t, tAgent - 0.1, 0.6),
    ];
    const bothK = K.env(t, tBoth + 0.2, tSkip + 0.2, 0.5);     // the both-true overlay
    const agentDim = 0.55 * bothK;

    // row 1: Terminal 1, activated
    {
      const a = rowA[0], y = R[0];
      const rise = (1 - a) * 30;
      K.layer(a, () => {
        const c = M.courier(t, 200, y + rise, 80, { lit: 1, label: 'Terminal 1', labelColor: C.head });
        M.envCard(cardX, y - cardH / 2 + rise, { w: cardW, h: cardH, name: 'PATH', kind: 'path', value: V1, size, nameW, lit: 0.35 });
        // gold underline under the .venv entry + pin
        const uw = monoW('C:\\…\\my-project\\.venv\\Scripts');
        K.line(valX, y + cardH / 2 - 16 + rise, valX + uw, y + cardH / 2 - 16 + rise, { color: C.head, w: 4, k: K.io(t, tOne + 0.6, 0.6) });
        K.icon('pin', valX - 8, y - cardH / 2 - 14 + rise, 40, { color: C.head, alpha: K.io(t, tOne + 0.8, 0.4) });
        // "and the couriers it sends": a child gets a copy
        const childA = K.io(t, tSends - 0.2, 0.5);
        const ch = M.courier(t, tagX, y, 64, { icon: 'file', label: 'python.exe', alpha: childA, lit: K.io(t, tSends + 1.0, 0.4) * 0.6 });
        const fk = K.seg(t, tSends + 0.1, tSends + 1.0);
        if (fk > 0 && fk < 1) M.copyFly(c.sx, c.sy - 30, ch.sx, ch.sy - 20, fk, { name: 'PATH', kind: 'path', w: 90, h: 100, bend: -110 });
        // the child now carries the copy: a small gold card peeks from its satchel
      });
    }
    // row 2: Terminal 2, not activated (and later: uv run)
    const uvPop = K.io(t, tUv, 0.6, 'back');
    const preK = K.io(t, tDirect, 0.9);
    {
      const a = rowA[1], y = R[1];
      const rise = (1 - a) * 30;
      K.layer(a, () => {
        M.courier(t, 200, y + rise, 80, { label: 'Terminal 2' });
        const cy = y - cardH / 2 + rise;
        if (preK <= 0) {
          M.envCard(cardX, cy, { w: cardW, h: cardH, name: 'PATH', kind: 'path', value: V2, size, nameW });
        } else {
          // the .venv entry slides out from under the tab as ONE whole entry, pushing the old value right
          M.envCard(cardX, cy, { w: cardW, h: cardH, name: 'PATH', kind: 'path', value: '', size, nameW, fade: false });
          const preW = monoW(PRE);
          const by = cy + cardH / 2 + size * 0.36;
          const g = K.ctx();
          g.save();
          K.rr(cardX, cy, cardW, cardH, 18); g.clip();
          g.beginPath(); g.rect(cardX + nameW, cy, cardW - nameW, cardH); g.clip();
          const ft = { font: 'mono', weight: 600, size, color: M.P.ink };
          K.text(V2, valX + preW * preK, by, ft);
          K.text(PRE, valX - preW * (1 - preK), by, { ...ft, alpha: 0.3 + 0.7 * preK });
          const fx = cardX + cardW - 140, gr = g.createLinearGradient(fx, 0, cardX + cardW, 0);
          gr.addColorStop(0, K.rgba(M.P.paper, 0)); gr.addColorStop(1, K.rgba(M.P.paper, 1));
          g.fillStyle = gr; g.fillRect(fx, cy, 140, cardH);
          g.restore();
          const uw = monoW(PRE.replace(/;$/, ''));
          const ux0 = valX - preW * (1 - preK);
          const ux1 = ux0 + uw;
          if (ux1 > valX + 4) K.line(Math.max(valX, ux0), y + cardH / 2 - 16 + rise, ux1, y + cardH / 2 - 16 + rise, { color: C.head, w: 4, dash: [10, 8], alpha: K.io(t, tDirect + 0.6, 0.4) });
        }
        M.label('not activated', tagX, y + 10, { color: C.soft, alpha: 1 - K.io(t, tUv - 0.3, 0.4) });
        if (uvPop > 0) {
          K.at(tagX, y + 2, 0.6 + 0.4 * uvPop, 0, () => {
            K.pill('uv run', 0, 0, { font: 'mono', size: 30, color: C.head, stroke: C.head, fill: K.mixColor(C.tile, C.head, 0.15), glow: 0.4, alpha: K.clamp(uvPop) });
          });
        }
        const forK = K.io(t, tJust - 0.3, 0.5);
        M.label('for this one command', valX + 270, y + cardH / 2 + 44, { color: C.head, alpha: forK, size: 28 });
      });
    }
    // row 3: the agent, its own separate shell
    {
      const a = rowA[2], y = R[2];
      const rise = (1 - a) * 30;
      K.layer(a, () => {
        M.courier(t, 200, y + rise, 80, { icon: 'sparkle', lantern: 1, label: 'agent', dim: agentDim });
        K.layer(1 - agentDim, () => {
          M.envCard(cardX, y - cardH / 2 + rise, { w: cardW, h: cardH, name: 'PATH', kind: 'path', value: V2, size, nameW });
          M.label('not activated', tagX, y + 10, { color: C.soft });
        });
      });
    }

    // both true: two speech pills, then "different window"
    if (bothK > 0) {
      K.layer(bothK, () => {
        const p1 = K.io(t, tIAct - 0.2, 0.45), p2 = K.io(t, tWrong - 0.2, 0.45);
        K.pill('"I activated it"', 1230, R[0] - cardH / 2 - 40 + (1 - p1) * 12, { size: 30, color: C.strong, stroke: C.head, fill: C.tile, alpha: p1 });
        K.pill('"wrong Python"', 1230, R[1] - cardH / 2 - 40 + (1 - p2) * 12, { size: 30, color: C.strong, stroke: C.accent, fill: C.tile, alpha: p2 });
        const dk = K.io(t, tDiff - 0.1, 0.6);
        K.ring(204, R[0] - 4, 60, 60, dk, { color: C.head, w: 3, rot: 0 });
        K.ring(204, R[1] - 4, 60, 60, dk, { color: C.accent, w: 3, rot: 0 });
        M.label('different window', 760, R[1] - cardH / 2 - 30, { color: C.strong, size: 30, alpha: K.io(t, tDiff, 0.5) });
      });
    }

    // depth pointer
    M.eyebrow('more in 05.03 · 05.04', tagX, 900, { alpha: K.io(t, tJust + 0.4, 0.5) });
  }
});
