// 09: The lantern: new staff in the back room.
// Camera eases from 08's wide shot onto the back room (a gentle 1.15 so the whole room card stays inside y 930);
// the door swings ajar and two lantern-carrying staff (AI agents) come through it. The shelves stay (dimmed) and the
// instruction files are pinned on the wall: blank notes pin up on "notes pinned", each name appears as it is said.
// The top row (CLAUDE.md, AGENTS.md, GEMINI.md) carries a "no dot · not hidden, still on the wall" pill; the two dot-named notes
// below keep their gold dots, so the difference is visible. A wiring board (MCP configs) hangs below.
// The shop floor fades out as the camera reaches the back room (no clipped half-panel at the left edge).
// [[staff-notebooks]]: the room fades out in place while the camera pushes onto the home folder only
// (.claude / .codex / .cursor + skills / auto memory). [[converging]]: back to the room at z 1.0 so the date pills sit
// above the room card; each agent is labelled ('Copilot cloud agent', 'Claude Code') directly under itself and draws
// its arrow to the note it reads; AGENTS.md + .mcp.json share the Linux Foundation pill.
// NOTE: in this scene the notes do not use M.layout.notes (no room there for a row label and labelled staff); the
// scene after (10) opens on a split, so the wall arrangement is not carried across a hard match.
SCENE('09', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette, C = K.C, F = L.frame;
  const w = (word, n, fb) => S.find(word, n, fb);
  const cStaff = S.cue('new-staff', 0);
  const cNotes = S.cue('pinned-notes', 4.46);
  const cBoard = S.cue('wiring-board', 17.18);
  const cBooks = S.cue('staff-notebooks', 27.19);
  const cConv = S.cue('converging', 37.65);

  // ---------------------------------------------------------------- the set: from 08's broken picture back to calm
  const settle = K.io(t, cStaff + 0.1, 0.8);              // 08 ended dimmed, dashed, door unpainted
  const doorOpen = 0.8 * K.io(t, cStaff + 0.3, 0.6) - 0.55 * K.io(t, cStaff + 3.6, 0.7);
  const shelfA = 1 - 0.55 * K.io(t, cNotes, 0.8);        // the shelves stay, dimmed behind the notes wall

  // the home beat: the room fades out in place, the home folder fades in on the same spot, then they swap back.
  // No shrinking copy: nothing half-faded or clipped sits at the frame edge while the home folder is the subject.
  const box = { x: F.x0, y: F.y0, w: F.x1 - F.x0, h: F.y1 - F.y0 };
  const shrink = K.io(t, cBooks, 0.6) * (1 - K.io(t, cConv + 0.35, 0.7));
  const shopA = 1 - shrink;                               // the room leaves entirely while the home folder is the subject
  // the shop floor is not the subject here: it fades out as the camera pushes onto the back room (no clipped half-panel)
  const floorOut = K.io(t, cStaff + 0.1, 0.8);

  // ---------------------------------------------------------------- notes wall (world coords)
  // top row: the three instruction files with no dot (not hidden, but still back-room notes); below: the two dot-named ones
  const tClaude = w('Claude', 0, 9.45), tAgents = w('agents', 1, 11.47), tCursor = w('Cursor', 0, 13.47), tCopilot = w('Copilot', 0, 15.05);
  const tPinned = w('pinned', 0, 6.11);
  const notes = [
    { name: 'GEMINI.md', x: 1290, y: 300, at: tAgents + 0.75, rot: -0.012 },
    { name: 'CLAUDE.md', x: 1480, y: 300, at: tClaude - 0.1, rot: 0.008 },
    { name: 'AGENTS.md', x: 1670, y: 300, at: tAgents - 0.1, rot: -0.006 },
    { name: '.cursor/rules/', x: 1330, y: 400, at: tCursor - 0.1, rot: 0.01 },
    { name: '.github/copilot-instructions.md', x: 1472, y: 515, at: tCopilot - 0.1, rot: -0.007 },
  ];
  const noDotK = K.io(t, tAgents + 1.2, 0.6);

  // ---------------------------------------------------------------- convergence timings
  const tGit = w('GitHub', 0, 40.39), tCop2 = w('Copilot', 1, 40.93), tRd0 = w('reads', 0, 42.27);
  const tSept = w('September', 0, 44.68), tCode = w('Claude', 4, 46.85), tRd1 = w('reads', 1, 47.59);
  const tDec = w('December', 0, 52.69), tAg2 = w('agents', 3, 54.87), tMcp2 = w('both', 0, 57.31) - 0.8;
  const focusDim = 0.55 * K.io(t, tGit - 0.2, 0.6);       // the notes not being discussed step back
  const copLab = K.io(t, tCop2 - 0.1, 0.5), copArrow = K.io(t, tRd0 - 0.1, 0.7);
  const claudeRing = K.io(t, tRd0 + 0.4, 0.6) * (1 - K.io(t, tSept - 0.3, 0.6));
  const tAgRd = w('agents', 2, 47.94);                    // "Claude Code reads agents dot M D": pulse AGENTS.md
  const agentsRing = K.io(t, tAgRd - 0.1, 0.6) * (1 - K.io(t, tDec - 0.3, 0.6));
  const lfK = K.io(t, tDec + 0.2, 0.6);
  const septK = K.io(t, tSept, 0.6) * (1 - lfK);
  const codeLab = K.io(t, tCode - 0.1, 0.5), codeArrow = K.io(t, tRd1 - 0.1, 0.7);
  const ringAg = K.io(t, tAg2 - 0.1, 0.6), ringMcp = K.io(t, tMcp2 - 0.1, 0.6);

  // ---------------------------------------------------------------- staff (two agents with lanterns)
  const staffPos = [{ x: 1520, y: 405 }, { x: 1755, y: 405 }];   // [0] reads CLAUDE.md (Copilot), [1] AGENTS.md (Claude Code)
  const door = { x: 1120, y: 790 };
  // Claude Code's reading arrow: from the agent's upper-left straight up to the bottom of the AGENTS.md note
  const AG = { x0: staffPos[1].x - 22, y0: staffPos[1].y - 30, x1: 1676, y1: 332 };
  const staffAt = [w('new', 0, 0.42) + 0.1, w('arrived', 0, 1.16) + 0.1];
  const lanternK = K.io(t, w('lanterns', 0, 2.08) - 0.2, 0.6);

  // ---------------------------------------------------------------- board (MCP configs)
  const boardK = K.io(t, w('hangs', 0, 17.95) - 0.2, 0.6);
  const tRows = w('config', 0, 20.63) - 0.9;
  const tJson = w('Jason', 0, 23.61) - 1.3;
  const tPlug = w('plug', 0, 26.12) - 0.6;
  const mcpRing = K.io(t, tJson, 0.6) * (1 - K.io(t, cBooks - 0.6, 0.5)) + ringMcp;
  const sockets = ['.mcp.json', '.cursor/mcp.json', '.vscode/mcp.json', 'claude_desktop_config.json'].map((label, i) => ({
    label,
    k: K.io(t, tRows + i * 0.35, 0.5),
    plug: K.io(t, tPlug + i * 0.18, 0.5),
    ring: i === 0 ? K.clamp(mcpRing) : 0,
  }));

  // ---------------------------------------------------------------- cameras
  // A: the room at 1.15 (card y 126..920 on screen); H: the home folder alone; B: the room at 1.0, pills above the card
  const camA = { x: 1490, y: 560, z: 1.15 }, camH = { x: 1470, y: 560, z: 1.2 }, camB = { x: 1500, y: 545, z: 1 };
  const cam = M.cam(t, [{ at: 0, view: 'wide' }, { at: cStaff + 0.1, ...camA, d: 0.9 }, { at: cBooks, ...camH, d: 0.8 }, { at: cConv + 0.1, ...camB, d: 0.8 }]);
  K.withCam(cam, () => {
    K.layer(shopA, () => M.place(box, () => {
      M.shop(t, {
        floorDim: 1, floorK: 1 - floorOut, roomDim: 1 - settle,
        wallDash: 1 - 0.65 * settle,
        door: { paint: settle, open: doorOpen },
        sign: { dim: 0.55 * (1 - settle) },
        shelvesK: 0,
        eyebrowK: 1 - shrink,
        porter: floorOut >= 1 ? false : { alpha: 0.6 * (1 - floorOut), face: 1 },
      });
      // the shelves from 06-08 stay in the room, dimmed behind the notes
      L.shelves.forEach((y) => M.shelf(L.shelfX[0], L.shelfX[1], y, { alpha: shelfA * (1 - 0.6 * (1 - settle)) }));

      // notes: blank papers pin up on "notes pinned", each name appears when it is said
      notes.forEach((n, i) => {
        const pk = K.io(t, tPinned - 0.25 + i * 0.16, 0.5);
        if (pk <= 0) return;
        const nk = K.io(t, n.at, 0.5);
        const side = n.name === 'GEMINI.md' || n.name === '.cursor/rules/' || n.name[1] === 'g';
        const dim = side ? focusDim : 0;
        const ring = n.name === 'AGENTS.md' ? Math.max(ringAg, agentsRing) : n.name === 'CLAUDE.md' ? claudeRing : 0;
        if (nk < 1) M.note(' '.repeat(n.name.length), n.x, n.y, { k: pk, rot: n.rot, dim });
        if (nk > 0) M.note(n.name, n.x, n.y, { k: 1, alpha: nk * pk, rot: n.rot, dim, ring });
      });
      if (noDotK > 0) K.pill('no dot · not hidden, still on the wall', 1612, 236, { size: 26, alpha: noDotK, color: C.body });

      // board
      M.board(1200, 565, L.board.w, sockets, { k: boardK });

      // staff walk in through the door
      staffPos.forEach((sp, i) => {
        const a0 = staffAt[i];
        const fin = K.io(t, a0, 0.4);
        if (fin <= 0) return;
        const u = K.io(t, a0, M.motion.walk);
        const cx = 1420, cy = 820;
        const x = (1 - u) * (1 - u) * door.x + 2 * (1 - u) * u * cx + u * u * sp.x;
        const y = (1 - u) * (1 - u) * door.y + 2 * (1 - u) * u * cy + u * u * sp.y;
        M.staff(x, y, 52, { t, i, alpha: fin, lantern: lanternK });
      });

      // reading: dashed lines from each agent up to the note above it (while the notes are being named)
      const readOut = 1 - K.io(t, cBoard, 0.6);
      const readK = K.io(t, tClaude + 0.5, 0.6) * readOut, readK2 = K.io(t, tAgents + 0.5, 0.6) * readOut;
      if (readK > 0) K.arrow(staffPos[0].x - 8, staffPos[0].y - 34, 1494, 340, { k: readK, alpha: K.clamp(readK * 2.5), color: C.head, w: 2.5, dash: [6, 7] });
      if (readK2 > 0) K.arrow(AG.x0, AG.y0, AG.x1, AG.y1, { k: readK2, alpha: K.clamp(readK2 * 2.5), color: C.head, w: 2.5, dash: [6, 7] });

      // --- convergence: each agent is named under itself and reads its note
      const lab = { ...M.type.label, color: C.strong, align: 'center' };
      if (copLab > 0) K.text('Copilot cloud agent', staffPos[0].x, staffPos[0].y + 62, { ...lab, alpha: copLab });
      if (copArrow > 0) K.arrow(staffPos[0].x - 8, staffPos[0].y - 34, 1494, 340, { k: copArrow, alpha: K.clamp(copArrow * 2.5), color: C.head, w: 3.5 });
      if (codeLab > 0) K.text('Claude Code', staffPos[1].x, staffPos[1].y + 62, { ...lab, alpha: codeLab });
      if (codeArrow > 0) K.arrow(AG.x0, AG.y0, AG.x1, AG.y1, { k: codeArrow, alpha: K.clamp(codeArrow * 2.5), color: C.head, w: 3.5 });
      // dates: outside the room card, above its top edge
      if (septK > 0) K.pill('new · Sept 2026', 1670, 170, { size: 26, alpha: septK, color: C.head });
      if (lfK > 0) K.pill('Linux Foundation · Dec 2025', 1560, 170, { size: 26, alpha: lfK, color: C.head });
    }));
  });

  // ---------------------------------------------------------------- the home back room (camera pushed onto it alone)
  const homeK = K.io(t, cBooks + 0.7, 0.7) * (1 - K.io(t, cConv, 0.5));
  if (homeK > 0) {
    const looseK = K.clamp(K.seg(t, cBooks + 1.1, cBooks + 2.4));
    const books = K.io(t, w('Claude', 1, 30.62) - 0.1, 0.6);
    K.withCam(cam, () => K.layer(homeK, () => {
      M.home(t, {
        k: 1, subK: 1, configK: 0.4, looseK,
        loose: ['.ssh', '.aws', '.claude', '.codex', '.cursor'], books,
      });
      const sk = K.io(t, w('Skills', 0, 32.63) - 0.1, 0.6), mk = K.io(t, w('notes', 1, 34.86) - 0.1, 0.6);
      K.pill('skills', M.HOME.rooms.x, M.HOME.rooms.ys[0] + 10, { size: 26, alpha: sk, color: C.strong });
      K.pill('auto memory', M.HOME.rooms.x, M.HOME.rooms.ys[1] + 18, { size: 26, alpha: mk, color: C.strong });
    }));
  }
});
