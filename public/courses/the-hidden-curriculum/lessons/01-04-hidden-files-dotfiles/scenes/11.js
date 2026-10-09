// 11 — Your job: check the back room
// The staff leave, you (the owner) walk in and look at what moved: rings in the back room, then git status /
// git diff on the shop floor, then a polite note vs a real lock, then the drawer with a beta "virtual .env".
SCENE('11', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette;

  const cOwner = S.cue('owner', 0);
  const cAfter = S.cue('after-staff', 2.24);
  const cDiff = S.cue('diff', 8.5);
  const cReview = S.cue('review-as-code', 20.43);
  const cPolite = S.cue('polite-note', 26.4);
  const cHeading = S.cue('heading', 39.03);

  const wMoved = S.find('moved', 0, cAfter + 3.0);
  const wStatus = S.find('status', 0, cDiff + 5.2);         // "git status"
  const wLists = S.find('lists', 0, cDiff + 5.8);
  const wDiffWord = S.find('diff', 0, cDiff + 7.2);         // "git diff"
  const wIgnored = S.find('Ignored', 0, cDiff + 8.6);
  const wRules = S.find('rules', 0, cReview + 0.9);
  const wConfig = S.find('config', 0, cReview + 2.7);
  const wReview = S.find('review', 0, cReview + 4.0);
  const wRequest = S.find('request', 0, cPolite + 2.7);
  const wDeny = S.find('deny', 0, cPolite + 6.0);
  const wSandbox = S.find('sandboxes', 0, cPolite + 6.9);
  const wRefuse = S.find('refuse', 0, cPolite + 9.3);
  const w1P = S.find('1Password', 0, cHeading + 1.6);
  const wFake = S.find('fake', 0, cHeading + 4.9);
  const wPlain = S.find('plain', 0, cHeading + 8.3);

  // ---------------------------------------------------------------- camera: wide -> room -> wide -> room
  // A gentler push than the shared 'room' view (z 1.25 put the card at y 90-952): z 1.05 on (1490, 548) keeps the
  // back-room card at screen y ~175-899 and x ~600-1315, clear of the badge and inside the safe area.
  const ROOM = { x: 1490, y: 548, z: 1.05 };
  const cam = M.cam(t, [
    { at: -5, view: 'wide' },
    { at: cAfter, ...ROOM },
    { at: cDiff, view: 'wide' },        // wide, not 'floor': the floor zoom cut the room mid-note and pushed the caption past y 930
    { at: cPolite, ...ROOM },
  ]);

  // ---------------------------------------------------------------- state
  const staffOut = K.io(t, cOwner + 0.3, 1.2);                       // agents finish and fade
  const ownerIn = K.io(t, cOwner + 0.4, 0.6);                        // owner appears in the doorway
  const ownerWalk = K.io(t, cOwner + 0.9, 2.2);                      // and walks into the room
  const doorOpen = 0.35 + 0.3 * (K.io(t, cOwner, 0.6) - K.io(t, cOwner + 3.2, 0.8));
  const ringK = (i) => { const r = K.io(t, wMoved - 0.2 + i * 0.35, 0.6), f = 1 - K.io(t, cPolite, 0.6); return f < 0.02 ? 0 : r * f; };
  const boardOut = K.io(t, cPolite, 0.6);
  const notesDim = 0.5 * K.io(t, cPolite, 0.6);
  const politeOut = K.io(t, cHeading - 0.1, 0.6);
  // during the git beat the back room steps back so the terminal stands on its own
  const diffDim = K.io(t, cDiff, 0.6) * (1 - K.io(t, cPolite - 0.2, 0.6));
  // the back room steps back as ONE group (labels stay faintly readable, no grey placeholder blocks)
  const roomA = 1 - 0.68 * diffDim;
  // the shop floor (card, Explorer, porter) leaves before each push into the room and returns for the git beat
  const floorA = (1 - K.io(t, cAfter - 0.45, 0.5)) + K.io(t, cDiff + 0.25, 0.6) - K.io(t, cPolite - 0.5, 0.5);

  K.withCam(cam, () => {
    // the floor (card, Explorer, porter) as its own group so it can fade as one; drawn first so the sign stays on top
    if (floorA > 0.001) K.layer(K.clamp(floorA), () => M.shop(t, {
      roomK: 0, wallK: 0, doorK: 0, signK: 0,
      explorerK: t < cDiff - 1 ? 1 : 0,      // the Explorer belongs to the opening only; the terminal owns the git beat
    }));
    M.shop(t, {
      shelvesK: 0,
      wallDash: 0.3,
      roomDim: 0.5 * diffDim,
      floorK: 0,
      porter: false,
      door: { open: doorOpen },
    });
    K.layer(roomA, () => {
    // --- notes wall (from 09): instruction files pinned in the top half of the room
    const notes = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md', '.cursor/rules/', '.github/copilot-instructions.md'];
    notes.forEach((n, i) => {
      const [x, y] = L.notes[i];
      K.layer(1 - notesDim, () => M.note(n, x, y, { ring: n === 'AGENTS.md' ? ringK(1) : 0 }));
    });

    // --- wiring board (lower half), two rows so the owner has floor to stand on
    M.board(L.board.x, L.board.y, L.board.w, [
      { label: '.mcp.json', plug: 1, ring: ringK(0) },
      { label: '.cursor/mcp.json', plug: 1 },
    ], { alpha: 1 - boardOut });

    // --- the project's .claude/ folder, low on the right
    M.item(1625, 795, 60, { kind: 'folder', name: '.claude', label: 'right', size: 26, ring: ringK(2), alpha: 1 - K.io(t, cHeading - 0.1, 0.6) });

    // --- staff, finishing up and leaving
    if (staffOut < 1) {
      M.staff(1290, 800 - 10 * staffOut, 56, { t, i: 0, alpha: 1 - staffOut });
      M.staff(1500, 800 - 10 * staffOut, 56, { t, i: 1, alpha: 1 - staffOut });
    }

    // --- the owner: through the door, into the room
    const ox = K.lerp(1120, 1270, ownerWalk);
    M.owner(ox, 780, 72, { t, alpha: ownerIn });
    });
  });

  // ---------------------------------------------------------------- shop floor: git status + git diff (world coords, same cam)
  K.withCam(cam, () => {
    const termK = K.io(t, cDiff + 0.35, 0.6);
    const termOut = K.io(t, cPolite - 0.5, 0.5);
    const tA = termK * (1 - termOut);
    if (tA > 0) {
      const W1 = { x: 170, y: 270, w: 860, h: 310 };
      const r1 = K.win(W1.x, W1.y, W1.w, W1.h, { kind: 'terminal', title: 'terminal · my-project', titleSize: 26, alpha: tA });
      K.layer(tA, () => {
        const size = 26, lh = 38, x0 = r1.x + 24, y0 = r1.y + 16 + size;
        const prompt = 'my-project>';
        const pw = K.text(prompt, x0, y0, { font: 'mono', size, color: K.C.head }) + 14;
        const cmd = 'git status';
        // type slowly from just after the window lands, done well before "git status" is said
        const tStart = cDiff + 0.8;
        const typed = t >= tStart ? K.typed(cmd, t, tStart, 4.5) : '';
        const cx = x0 + pw + K.text(typed, x0 + pw, y0, { font: 'mono', size, color: K.C.strong });
        const outAt = wLists - 0.1;
        if (t < outAt && K.caretOn(t)) {
          K.text('▍', cx + 2, y0, { font: 'mono', size, color: K.C.strong });
        }
        const lines = [
          { s: 'Changes not staged for commit:', kind: 'plain' },
          { s: '.mcp.json', kind: 'mod' },
          { s: 'AGENTS.md', kind: 'mod' },
          { s: 'Untracked files:', kind: 'plain' },
          { s: '.claude/', kind: 'new' },
        ];
        lines.forEach((ln, i) => {
          const k = K.io(t, outAt + i * 0.14, 0.3);
          if (k <= 0) return;
          const y = y0 + lh * (i + 1);
          if (ln.kind === 'plain') K.text(ln.s, x0, y, { font: 'mono', size, color: K.C.body, alpha: k });
          else {
            const lead = ln.kind === 'mod' ? '    modified:   ' : '    ';
            const lw = K.text(lead, x0, y, { font: 'mono', size, color: K.C.soft, alpha: k });
            const nw = M.dotName(ln.s, x0 + lw, y, { size, alpha: k });
            // review-as-code: underline the rules file, then the MCP config
            const mk = ln.s === 'AGENTS.md' ? K.io(t, wRules, 0.6) : ln.s === '.mcp.json' ? K.io(t, wConfig, 0.6) : 0;
            if (mk > 0) K.line(x0 + lw, y + 9, x0 + lw + nw, y + 9, { color: K.C.head, w: 3, k: mk, alpha: k });
          }
        });
      });

      // git diff window, below it
      const dK = K.io(t, wDiffWord - 0.25, 0.5) * (1 - termOut);
      if (dK > 0) {
        const focus = K.io(t, wReview - 0.1, 0.6);
        const W2 = { x: 170, y: 604, w: 760, h: 200 };
        K.win(W2.x, W2.y, W2.w, W2.h, { kind: 'terminal', title: 'git diff .mcp.json', titleSize: 26, alpha: dK, stroke: K.mixColor(K.C.line2, K.C.head, focus) });
        if (focus > 0) K.layer(dK * focus * 0.5, () => K.glow(W2.x + W2.w / 2, W2.y + W2.h / 2, 420, K.C.head, 0.12));
        K.layer(dK, () => {
          const size = 26, x0 = W2.x + 24, y1 = W2.y + 50 + 16 + size;
          const k1 = K.io(t, wDiffWord + 0.15, 0.35), k2 = K.io(t, wDiffWord + 0.4, 0.35);
          K.text('-    "args": ["docs"]', x0, y1, { font: 'mono', size, color: P.danger, alpha: k1 });
          K.text('+    "args": ["docs", "--allow-write"]', x0, y1 + 44, { font: 'mono', size, color: K.C.head, alpha: k2 });
        });
      }

      // one caption slot under the windows: what git does not list, then "review like code"
      const ignK = K.io(t, wIgnored, 0.5) * (1 - K.io(t, wReview - 0.3, 0.4));
      if (ignK > 0) {
        const x = 180, y = 846;
        let w = K.text('not listed: ignored files (', x, y, { ...M.type.label, weight: 400, color: K.C.soft, alpha: ignK * tA });
        w += M.dotName('.env', x + w, y, { size: 26, alpha: ignK * tA });
        K.text(') · your home back room', x + w, y, { ...M.type.label, weight: 400, color: K.C.soft, alpha: ignK * tA });
      }
      const revK = K.io(t, wReview, 0.5) * (1 - termOut);
      if (revK > 0) K.text('review like code', 180, 846, { ...M.type.read, color: K.C.head, alpha: revK });
    }
  });

  // ---------------------------------------------------------------- back room: a polite note vs a real lock, then the drawer
  K.withCam(cam, () => {
    // the polite note, pinned in the middle of the room once the board is down
    const pinK = K.io(t, cPolite + 0.25, 0.6);
    const pA = 1 - politeOut;
    if (pinK > 0 && pA > 0) K.layer(pA, () => {
      M.note("please don't read .env", 1490, 585, { k: pinK, rot: -0.015 });
      const reqK = K.io(t, wRequest - 0.1, 0.5);
      M.caption('request, not a lock', 1490, 652, { alpha: reqK, color: K.C.strong });
      // a real lock: deny rules, sandbox, protected paths (14.12), as one pill with the lock inside
      const lockK = K.io(t, wDeny - 0.1, 0.6);
      if (lockK > 0) K.layer(lockK, () => {
        const text = 'deny rules · sandbox · protected paths';
        const ft = { font: 'ui', weight: 600, size: 26 }, fn = { font: 'mono', weight: 600, size: 26 };
        const tw = K.measure(text, ft), nw = K.measure('14.12', fn);
        const w = 22 + 34 + 12 + tw + 16 + nw + 24, h = 50, cx = 1500, y = 706, x0 = cx - w / 2;
        K.card(x0, y - h / 2, w, h, { r: h / 2, fill: K.C.tile, stroke: K.C.head, shadow: false });
        K.icon('lock', x0 + 22 + 17, y - 1, 34, { color: K.C.head, w: 3 });
        K.text(text, x0 + 22 + 34 + 12, y + 9, { ...ft, color: K.C.strong });
        K.text('14.12', x0 + w - 24 - nw, y + 9, { ...fn, color: K.C.head });
      });
    });

    // the .env drawer, with a beta "virtual .env" floating over it
    const drK = K.io(t, cHeading + 0.2, 0.6);
    if (drK > 0) {
      M.drawer(L.drawer.x, L.drawer.y, L.drawer.w, L.drawer.h, { alpha: drK });
      const vK = K.io(t, wFake - 0.2, 0.6);
      if (vK > 0) K.layer(vK, () => {
        const label = 'virtual .env · beta';
        const f = { font: 'ui', weight: 600, size: 26 };
        const vw = K.measure(label, f) + 44, vh = 50, cx = 1500, cy = 620;
        K.card(cx - vw / 2, cy - vh / 2, vw, vh, { r: vh / 2, fill: K.C.tile, stroke: 'rgba(0,0,0,0)', shadow: false });
        dashedPill(cx - vw / 2, cy - vh / 2, vw, vh, K.C.head);
        // "virtual " + gold-dotted ".env" + " · beta"
        const a1 = K.measure('virtual ', f), a2 = K.measure('.env', { font: 'mono', weight: 600, size: 26 }), a3 = K.measure(' · beta', f);
        const tx = cx - (a1 + a2 + a3) / 2, ty = cy + 9;
        K.text('virtual ', tx, ty, { ...f, color: K.C.strong });
        M.dotName('.env', tx + a1, ty, { size: 26 });
        K.text(' · beta', tx + a1 + a2, ty, { ...f, color: K.C.head });
        
      });
      M.caption('1Password · Mac and Linux', 1500, 570, { alpha: K.io(t, w1P - 0.1, 0.5) });
      const plK = K.io(t, wPlain - 0.1, 0.6);
      if (plK > 0) {
        const f = { ...M.type.label };
        const s1 = 'plain ', s3 = ' · still the default';
        const a1 = K.measure(s1, f), a2 = K.measure('.env', { font: 'mono', weight: 600, size: 26 }), a3 = K.measure(s3, f);
        const tx = 1500 - (a1 + a2 + a3) / 2, ty = 688;
        K.text(s1, tx, ty, { ...f, color: K.C.strong, alpha: plK });
        M.dotName('.env', tx + a1, ty, { size: 26, alpha: plK });
        K.text(s3, tx + a1 + a2, ty, { ...f, color: K.C.strong, alpha: plK });
      }
    }
  });

  function dashedPill(x, y, w, h, color) {
    const ctx = K.ctx();
    ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    K.rr(x, y, w, h, h / 2); ctx.stroke(); ctx.restore();
  }
});
