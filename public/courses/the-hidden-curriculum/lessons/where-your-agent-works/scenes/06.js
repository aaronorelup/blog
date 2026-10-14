/* 06 — The back office moved across town
   The back office lifts out of your house and moves across the road into Anthropic's building (S184, 2026-10-06);
   the real help-center paragraph; the workshop stays home (Claude Code) but what it reads still goes out;
   Team/Enterprise keep local Cowork; the hatch (connected folders, only while the desktop app is open, S184/S069);
   ChatGPT Work splits the same way (S025); the May description of Cowork is stale for Pro and Max (S050);
   second break in the picture: rooms move without you.
   Layout: wide street at s 1 for the move and the exit; s 0.75 anchored right (a left column x 84-514 for the
   dated cards) in between, swapped while the capture covers the screen. */
SCENE('06', (t, S) => {
  K.bg();
  const C = K.C;

  // ---------------------------------------------------------------- times (local seconds)
  const cMove = S.cue('move', 0), cRem = S.cue('removed', 15.6), cHatch = S.cue('hatch', 33.9);
  const cOai = S.cue('openai-work', 41.3), cStale = S.cue('stale', 49.1), cMoves = S.cue('moves', 56.5);
  const tSays = S.find('says', 0, cMove + 5.7);                        // "Anthropic's help center says ..."
  const tIso = S.find('isolated', 0, cMove + 10.9);                     // "an isolated, temporary environment"
  const tCode = S.find('Claude', 0, cRem + 3.6);                         // "points you to Claude Code"
  const tRun = S.find('Running', 0, cRem + 5.5);                         // "Running locally isn't staying local"
  const tReads = S.find('reads', 0, cRem + 6.0);                         // "what it reads still goes ..."
  const tTeam = S.find('Team', 0, cRem + 12.6);                          // "Team and Enterprise ..."
  const tBeta = S.find('beta', 0, cRem + 14.3);
  const tOpen = S.find(/^open/, 0, cHatch + 5.8);                       // "while the app is open"

  const liftAt = cMove + 1.8, travelD = 1.5, arriveAt = liftAt + 0.2 + travelD - 0.05;
  const capIn = Math.min(tSays - 1.0, arriveAt + 0.9), capOut = tIso - 0.55;

  // ---------------------------------------------------------------- street placement
  // wide street (s 1) -> s 0.75 anchored right (while the capture covers the screen) -> back to s 1 at [[moves]]
  const lay = K.io(t, capIn + 0.9, 0.8) * (1 - K.io(t, cMoves + 0.45, 0.9));
  const SX = 455 * lay, SY = 133 * lay, SS = 1 - 0.25 * lay;
  const capA = K.io(t, capIn, 0.5) * (1 - K.io(t, capOut, 0.5));

  // ---------------------------------------------------------------- street state
  const merge = 1 - K.io(t, cMove + 0.15, 0.6);                          // 05 ended on one door: the rooms show again
  const office = 1 - K.io(t, liftAt, 0.3);
  const vk = K.io(t, cMove + 0.3, 1.3);
  const vOffice = K.io(t, arriveAt, 0.35);
  const codeLit = 0.8 + 0.2 * K.io(t, tCode - 0.2, 0.5) * (1 - K.io(t, tTeam, 0.6));
  const focusCode = K.io(t, tCode - 0.2, 0.5) * (1 - K.io(t, tTeam, 0.6));
  const officeGlow = K.io(t, capOut + 0.2, 0.6) * (1 - K.io(t, cRem, 0.6));
  // the hatch: opens at [[hatch]]; at +3 s the app "closes" (path greys, hatch dims), then opens again
  const closeAt = Math.max(cHatch + 3.0, tOpen + 0.35), reopenAt = Math.min(closeAt + 1.6, cOai + 0.1);
  const appOn = 1 - K.io(t, closeAt, 0.4) * (1 - K.io(t, reopenAt, 0.4));
  const hatchK = K.io(t, cHatch + 0.1, 0.5);
  const pathK = K.io(t, cHatch + 0.5, 1.2);
  const hatchGlow = hatchK * appOn * (1 - 0.45 * K.io(t, cOai, 0.8));   // faintly gold after the beat
  // [[openai-work]]: the beat is about OpenAI, so Anthropic's building (and its hatch path) steps back while the card is up
  const oaiDim = K.io(t, cOai + 0.2, 0.5) * (1 - K.io(t, cStale - 0.35, 0.5));
  // while the real page covers the screen the street steps back too, so nothing peeks past the window's edges
  const capHide = K.io(t, capIn, 0.4) * (1 - K.io(t, capOut, 0.4));

  const street = M.street(t, {
    x: SX, y: SY, s: SS,
    house: {
      merge, office,
      rooms: { chat: 0.8 - 0.3 * focusCode, cowork: 0.8, code: codeLit },
      hatch: hatchGlow,
    },
    vendor: { k: vk, office: vOffice, officeLit: 0.8 + 0.2 * officeGlow, slots: vk, alpha: (1 - 0.78 * oaiDim) * (1 - capHide) },
  });
  const H = street.house, V = street.vendor;

  // the vendor's back office glows while the help center's words are on screen
  if (officeGlow > 0.01) K.glow(V.office.cx, V.office.cy, 220 * SS, C.head, 0.22 * officeGlow);

  // ---------------------------------------------------------------- the move (one block, along the road)
  {
    const r0 = { cx: 580, cy: 250 + 134 + 228, w: 290, h: 452 };          // the house's back office at s 1 (local box)
    const o1 = { cx: 1360 + 28 + 202, cy: 230 + 54 + 125, w: 404, h: 250 }; // the vendor's top slot at s 1
    const pts = [[r0.cx, r0.cy], [760, 790], [1210, 790], [o1.cx, o1.cy]];
    const tr = K.io(t, liftAt + 0.2, travelD, 'io');
    const fa = K.io(t, liftAt, 0.3) * (1 - K.io(t, arriveAt, 0.35));
    // a faint gold trail of where it went
    const trailA = 0.55 * (1 - K.io(t, arriveAt + 0.6, 0.6));
    if (tr > 0 && trailA > 0.01) K.path(pts, { k: tr, color: C.head, w: 3, dash: [4, 12], head: false, alpha: trailA, tension: 0.4 });
    if (fa > 0.002) {
      const p = M.along(pts, tr);
      const f = 1 - 0.5 * Math.sin(Math.PI * tr);
      const w = K.lerp(r0.w, o1.w, tr), h = K.lerp(r0.h, o1.h, tr);
      K.layer(fa, () => {
        K.glow(p[0], p[1], 160 * f, C.head, 0.18);
        K.at(p[0], p[1], f, K.wave(t, 6, 0.025) * Math.sin(Math.PI * tr), () => {
          M.room('cowork', -w / 2, -h / 2, w, h, { lit: 1, door: f > 0.92 ? 'Cowork' : null });
        });
      });
    }
  }

  // ---------------------------------------------------------------- left column (cards), x 84-514
  const LX = 84, LW = 430;
  const colIn = (a, b) => K.io(t, a, 0.5) * (1 - K.io(t, b, 0.4));

  // [[move]] after the capture: the help center's own words (S069)
  {
    const k = colIn(capOut + 0.15, cRem - 0.35);
    if (k > 0.002) K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
      M.dated(LX, 250, LW, {
        eyebrow: 'Anthropic Help Center · Use Claude Cowork safely · 2026-10-06',
        body: 'Claude’s work runs in an isolated, temporary environment on Anthropic’s servers.', quote: true,
      });
    }));
  }
  // the qualifier that holds for the whole scene
  {
    const k = K.io(t, capOut + 0.4, 0.5) * (1 - K.io(t, cMoves + 0.2, 0.5)) * (1 - 0.7 * oaiDim);
    if (k > 0.002) M.pillL('new Cowork tasks · Pro and Max · since 2026-10-06', 1820, 884, { size: 26, align: 'right', color: C.strong, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.5), alpha: k });
  }

  // [[removed]] the removed option (S184), the toggle struck through
  {
    const k = colIn(cRem, tRun - 0.4);
    if (k > 0.002) K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
      const h = M.dated(LX, 250, LW, {
        eyebrow: 'Anthropic Help Center · 2026-10-06',
        body: 'The “Only on your computer” option in Settings > General was removed.',
      });
      const ty = 250 + h + 62;
      M.toggle(LX + 4, ty, 0, { label: 'Only on your computer', struck: K.io(t, cRem + 1.0, 0.6) });
      M.label('tasks already started stay local', LX + 4, ty + 70, { align: 'left', color: C.body });
    }));
  }
  // the workshop stays home: Claude Code
  {
    const k = K.io(t, tCode - 0.2, 0.5) * (1 - K.io(t, tTeam - 0.3, 0.5));
    if (k > 0.002) {
      const b = H.rooms.code;
      K.glow(b.cx, b.cy, 200, C.head, 0.2 * k);
      M.pillL('runs on your machine → Claude Code', b.cx, 822, { size: 26, align: 'center', color: C.page, fill: C.head, stroke: C.head, alpha: k });
    }
  }
  // "what it reads still goes to Anthropic's servers": dashed copies ride from the bench to the vendor
  {
    const k = K.io(t, tRun - 0.1, 0.5) * (1 - K.io(t, tTeam - 0.3, 0.5));
    if (k > 0.002) {
      const b = H.rooms.code, vx = V.x, vy = V.y;
      const pts = [[b.bench[0] + 50 * SS, b.bench[1] - 40 * SS], [H.x + H.w + 30, H.y + 70 * SS], [vx - 10, vy + 40 * SS]];
      K.path(pts, { k: K.io(t, tRun, 1.0), color: C.head, w: 4, dash: [2, 12], headSize: 18, tension: 0.45, alpha: k });
      for (let i = 0; i < 3; i++) {
        const u = (t - tReads - i * 0.75) / 2.2;
        if (u <= 0 || t > tTeam) continue;
        const uu = u % 1, ca = Math.sin(Math.PI * uu) * k;
        const p = M.along(pts, uu);
        M.copy(p[0], p[1], 40, { alpha: ca });
      }
      M.label('what it reads still goes to the model', (H.x + H.w + vx) / 2 - 10, 190, { color: C.strong, size: 28, alpha: K.io(t, tReads - 0.2, 0.5) * k });
    }
  }

  // [[removed]] continued: Team and Enterprise keep local Cowork; the cloud is a beta org setting
  {
    const k = colIn(tTeam - 0.2, cHatch - 0.3);
    if (k > 0.002) K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
      K.eyebrow('Team · Enterprise', LX + LW / 2, 310, { size: 26, tracking: 3, upper: true, color: C.head, align: 'center' });
      const hs = 0.4, hx = LX + (LW - 940 * hs) / 2, hy = 380;
      M.house(t, { x: hx, y: hy, s: hs, labels: false, doors: false, rooms: { chat: 0.7, cowork: 1, code: 0.7 } });
      const oc = [hx + 465 * hs, hy + (134 + 228) * hs];
      K.glow(oc[0], oc[1], 110, C.head, 0.25);
      const y0 = hy + 600 * hs + 62;
      M.label('local Cowork remains', LX + LW / 2, y0, { color: C.strong, size: 30 });
      M.label('cloud: a beta org setting', LX + LW / 2, y0 + 48, { color: C.body, size: 30, alpha: K.io(t, tBeta - 0.4, 0.5) });
      M.asOf(LX + LW / 2, y0 + 112, { text: 'read 2026-10-14', align: 'center' });
    }));
  }

  // ---------------------------------------------------------------- [[hatch]] the one way in
  if (pathK > 0) K.layer(1 - 0.75 * oaiDim, () => M.hatchLine(H, V, { k: pathK, on: appOn }));
  {
    const k = colIn(cHatch, cOai + 0.15);
    if (k > 0.002) K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
      const h = M.dated(LX, 250, LW, {
        eyebrow: 'Anthropic Help Center · 2026-10-06',
        body: 'Claude reaches only the folders you’ve connected, through the desktop app, and only while it’s open.', quote: true,
      });
      const cy = 250 + h + 60, on = appOn;
      const chipK = K.io(t, tOpen - 0.3, 0.5);
      K.layer(chipK, () => {
        M.pillL(on > 0.5 ? 'desktop app open' : 'desktop app closed', LX + 4, cy, { size: 30, icon: 'laptop', color: on > 0.5 ? C.page : C.body, fill: on > 0.5 ? C.head : C.tile, stroke: on > 0.5 ? C.head : C.line2, iconColor: on > 0.5 ? C.page : C.soft });
        M.label(on > 0.5 ? 'the hatch is open' : 'the hatch is shut', LX + 4, cy + 64, { align: 'left', color: on > 0.5 ? C.body : C.soft });
      });
    }));
  }

  // ---------------------------------------------------------------- [[openai-work]] the same split at OpenAI (S025)
  {
    const k = colIn(cOai + 0.45, cStale - 0.35);
    if (k > 0.002) K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
      const pad = 32, iw = LW - pad * 2, y = 200;
      const q = { font: 'read', size: 28 }, lh = 38;
      const l1 = K.wrap('“can also use local files, apps, and the browser”', iw, q);
      const l2 = K.wrap('“cannot access that computer’s files or tools”', iw, q);
      const l3 = K.wrap('“can’t switch from local to cloud execution during a turn”', iw, { ...q, size: 26, italic: true });
      const eb = K.wrap('GET STARTED PAGE · READ 2026-10-14', iw, M.T.eyebrow);
      const h = pad + 40 + eb.length * 32 + 26 + (52 + l1.length * lh) + 30 + (52 + l2.length * lh) + 28 + l3.length * 34 + 20 + pad;
      K.card(LX, y, LW, h, { r: 24, stroke: C.line2 });
      let yy = y + pad + 20;
      // a clear "this is OpenAI" tag, so the card does not read as Anthropic's building
      M.pillL('OpenAI · ChatGPT Work', LX + pad, yy + 4, { size: 26, color: C.strong, fill: C.tile, stroke: C.line2, icon: 'globe' });
      yy += 40;
      eb.forEach((ln, i) => K.text(ln, LX + pad, yy + 20 + i * 32, { ...M.T.eyebrow, color: C.head }));
      yy += eb.length * 32 + 26;
      const row = (tag, lines, on, a) => K.layer(a, () => {
        M.pillL(tag, LX + pad, yy + 20, { size: 26, color: on ? C.page : C.strong, fill: on ? C.head : C.tile, stroke: on ? C.head : C.line2 });
        lines.forEach((ln, i) => K.text(ln, LX + pad, yy + 52 + 28 + i * lh, { ...q, color: C.strong }));
      });
      row('local', l1, true, 1); yy += 52 + l1.length * lh + 30;
      const a2 = K.io(t, S.find('cloud', 0, cOai + 4.6) - 0.3, 0.5);
      row('cloud', l2, false, a2); yy += 52 + l2.length * lh + 28;
      l3.forEach((ln, i) => K.text(ln, LX + pad, yy + 20 + i * 34, { ...q, size: 26, italic: true, color: C.body, alpha: a2 }));
    }));
  }

  // ---------------------------------------------------------------- [[stale]] May's description, pinned to the empty slot
  {
    const k = colIn(cStale, cMoves + 0.2);
    if (k > 0.002) {
      const slot = H.rooms.cowork;
      const pin = [slot.cx, slot.cy + 20];
      K.layer(k, () => K.at(0, (1 - k) * 14, 1, 0, () => {
        const h = M.dated(LX, 270, LW, {
          eyebrow: 'Anthropic Engineering · 2026-05-25',
          body: 'Cowork’s first version, “The local VM”: “nothing else on the host is visible”',
          stale: K.io(t, S.find('stale', 0, cStale + 6.0) - 0.4, 0.3) > 0.5 ? 'stale for Pro and Max' : null,
        });
        // a thread from the note to the empty slot it describes
        K.path([[LX + LW, 270 + h * 0.6], [K.lerp(LX + LW, pin[0], 0.55), pin[1] - 20], [pin[0], pin[1] + 6]], { k: K.io(t, cStale + 0.4, 0.7), color: C.soft, w: 2.5, dash: [6, 8], head: false });
        K.icon('pin', pin[0], pin[1] - 4, 40, { color: C.accent, w: 2.6, alpha: K.io(t, cStale + 1.0, 0.3) });
      }));
      // a short timeline of the back office along the top
      const items = [['May · local VM', false], ['16 Sep · merge announced', false], ['6 Oct · cloud (Pro, Max)', true]];
      const y = 172, x0 = 560, x1 = 1820;
      const ws = items.map(([s]) => K.measure(s, { font: 'ui', weight: 600, size: 26 }) + 42);
      const gap = (x1 - x0 - ws.reduce((a, b) => a + b, 0)) / (items.length - 1);
      let x = x0;
      const tk = K.io(t, cStale + 0.8, 0.8);
      K.line(x0 + 20, y, x1 - 20, y, { k: tk, color: C.line2, w: 2, alpha: k });
      items.forEach(([s, now], i) => {
        const a = K.stagger(t, cStale + 0.8, i, 0.35, 0.5) * k;
        M.pillL(s, x, y, { size: 26, color: now ? C.page : i === 0 ? C.accent : C.body, fill: now ? C.head : C.tile, stroke: now ? C.head : i === 0 ? C.accent : C.line2, alpha: a });
        x += ws[i] + gap;
      });
    }
  }

  // ---------------------------------------------------------------- [[moves]] second break in the picture
  {
    const k = K.io(t, cMoves + 1.1, 0.6);
    if (k > 0.002) {
      const slot = H.rooms.cowork;
      const pulse = Math.sin(Math.PI * K.seg(t, cMoves + 1.3, cMoves + 2.7));
      if (pulse > 0.01) {
        K.glow(slot.cx, slot.cy, 230, C.accent, 0.18 * pulse);
        M.outline(slot.x - 4, slot.y - 4, slot.w + 8, slot.h + 8, 18, 1, { color: C.accent, w: 3, alpha: pulse });
      }
      M.breaks(860, 186, { alpha: k });
      M.label('rooms move', slot.cx, slot.cy + 6, { color: C.strong, size: 30, alpha: k });
      M.label('without you', slot.cx, slot.cy + 46, { color: C.strong, size: 30, alpha: k });
    }
  }

  // ---------------------------------------------------------------- the real page (oct6), over a dimmed street
  if (capA > 0.002) {
    const g = K.ctx();
    g.save(); g.fillStyle = K.rgba(C.page, 0.8 * capA); g.fillRect(0, 0, K.W, K.H);
    g.fillStyle = K.rgba(C.page, capA); g.fillRect(100, 140, 1720, 780); g.restore();
    const line1 = K.captureBox('oct6', 'change', 'line1');
    const head = K.captureBox('oct6', 'change', 'heading');
    const zTop = (head ? head[1] : 324) - 34;
    K.layer(capA, () => K.at(0, (1 - capA) * 18, 1, 0, () => {
      K.shot('oct6/change', t - capIn, [330, 150, 1260], {
        frame: [100, 140, 1720, 780],
        // the zoom starts just above the heading, so the site's header and nav are never sliced; it keeps the frame's
        // aspect (1720:780) so the camera cannot widen it back up into the header
        zooms: line1 ? [{ at: 0, box: [line1[0] - 18, zTop, 1310, 1310 * 780 / 1720] }] : [],
        // the first sentence only, through "cloud." (about 0.795 of the paragraph's width on the 1920 px page)
        callouts: line1 ? [{ at: 1.3, until: capOut - capIn + 1, box: [line1[0] - 8, line1[1] - 3, line1[2] * 0.785 + 8, line1[3] / 4 + 6], dim: 0.3 }] : [],
      });
    }));
  }
});
