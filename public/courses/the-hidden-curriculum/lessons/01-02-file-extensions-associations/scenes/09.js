/* 09 Who gets to write in the ledger
   The room. The ledger stands open BESIDE the porter (x 500-940, top y 200), never over him; it grows downward.
   Three hands sit under the page (you, installer, update), each with a short dashed pen line up to it.
   installer: the pen rewrites .py -> Python, and a Python door joins the row (doors slide to layout.doors5).
   update: two rows appear (.7z, .rar -> File Explorer); File Explorer is the porter himself, so the rows link to him.
   ask-rule: the installer's line retracts; a gold arrow sends it to "you", pill "Ask in Settings".
   glass: guarded panes slide over https and .pdf; only "you" lights. side-effect: your pen's rewrite of the guarded
   .pdf row rises to ~.7 and eases back (doesn't stick). grab: "an app" (a window tile, not the installer's gear) sends a
   faint grey pen: it bumps the guarded .pdf glass (row pulses, pen recoils), then slides to the unguarded .7z row and
   overwrites File Explorer -> an app on "grabbing"; the pen fades, the grabbed row stays.
   Exit: ledger with glass on two rows, all pens resting, calm. */
SCENE('09', (t, S) => {
  K.bg();
  const L = M.layout;
  const cHands = S.cue('hands', 0), cInst = S.cue('installer', 2.43), cUpd = S.cue('update', 8.93);
  const cAsk = S.cue('ask-rule', 17.59), cGlass = S.cue('glass', 24.82), cSide = S.cue('side-effect', 35.75), cGrab = S.cue('grab', 41.59);

  // spoken anchors
  const wInstall = S.find('install', 0, cInst + 1.7);
  const wPython = S.find('Python', 0, cInst + 3.4);
  const w2023 = S.find('twenty-three', 0, cUpd + 2.4) - 0.4;
  const wItself = S.find('itself', 0, cUpd + 7.6);
  const wSeven = S.find('seven', 0, cUpd + 4.6);
  const wRar = S.find('RAR', 0, cUpd + 6.1);
  const wShould = S.find('should', 0, cAsk + 3.0);
  const wSettings = S.find('Settings', 0, cAsk + 3.8);
  const wQuietly = S.find('quietly', 0, cAsk + 5.2);
  const wWeb = S.find('web', 0, cGlass + 3.5);
  const wP = S.find(/^P$/, 1, cGlass + 4.3);
  const wOnly = S.find('only', 1, cGlass + 5.4);
  const wLast = S.find('last', 0, cGlass + 7.5);
  const wStick = S.find("doesn't", 0, cSide + 3.1);
  const wReset = S.find('reset', 0, cSide + 4.2);

  // ---- motion keys
  const iPenIn = K.io(t, wPython - 0.2, 0.6), iWrite = K.io(t, wPython + 0.5, 1.4, 'sine'), iPenOut = K.io(t, wPython + 2.1, 0.6);
  const doorShift = K.io(t, wPython - 0.6, 0.7), pyRise = K.io(t, wPython - 0.2, 0.6);
  const pyFocus = K.env(t, wPython + 1.0, wPython + 3.4, 0.5);
  const uPenIn = K.io(t, wSeven - 0.55, 0.55), r7 = K.io(t, wSeven, 0.9, 'sine'), rRar = K.io(t, wRar, 0.9, 'sine'), uPenOut = K.io(t, wRar + 1.0, 0.6);
  const grow = K.clamp(r7 * 4) || 0;
  const feLink = K.io(t, wItself - 0.5, 0.6) * (1 - K.io(t, cAsk - 0.2, 0.6));
  // your stroke on the guarded .pdf row: rises to ~.7, then eases back
  const yPenIn = K.io(t, cSide + 0.3, 0.7), yUp = K.io(t, cSide + 1.1, 1.4, 'sine') * 0.75, yBack = K.io(t, wStick, 0.9);
  const yWrite = yUp * (1 - yBack), yPenOut = K.io(t, wReset + 0.1, 0.7);
  const gHttps = K.io(t, wWeb, 0.7), gPdf = K.io(t, wP, 0.7);
  const grabK = K.io(t, cGrab + 0.1, 0.6);
  const wApps = S.find('apps', 1, cGrab + 1.16), wGrab = S.find('grabbing', 0, cGrab + 1.39);
  const aPenIn = K.io(t, cGrab + 0.35, 0.6);                       // app pen reaches the guarded .pdf glass
  const bump = K.seg(t, cGrab + 0.95, wApps + 0.05);                // pen pushes the glass, glass holds
  const aSlide = K.io(t, wApps + 0.05, wGrab - wApps + 0.05);        // pen slides off to the unguarded .7z row
  const aWrite = K.io(t, wGrab + 0.05, 0.85, 'sine');               // overwrites the door
  const aPenOut = K.io(t, wGrab + 1.1, 0.6);

  // ---- the room: doors (Python joins at the installer beat), porter, desk. Ledger drawn beside the porter below.
  const xs = L.doors.map((x, i) => K.lerp(x, L.doors5[i], doorShift)).concat([L.doors5[4]]);
  M.room({
    t,
    porter: { look: 0.25, glow: 1 + 1.2 * feLink },
    doors: {
      names: ['Notepad', 'V S Code', 'Photos', 'Browser', 'Python'], xs, w: K.lerp(L.doorW, 150, doorShift),
      k: (i) => (i === 4 ? pyRise : 1),
      each: (i) => (i === 4 ? { dim: 0.4 * (1 - pyFocus), focus: pyFocus } : { dim: 0.4 }),
    },
    ledger: false,
  });

  // ---- the ledger, standing open beside the porter (grows downward; never over him)
  const lx = 500, ly = 200, lw = 440;
  const rows = [
    { label: '.txt', door: 'Notepad' },
    { label: '.py', door: 'V S Code', to: 'Python', toK: iWrite, pulse: K.seg(t, wPython + 2.0, wPython + 3.0) },
    { label: '.png', door: 'Photos' },
    { label: '.html', door: 'Browser' },
    { label: 'https', door: 'Browser', glass: gHttps },
    { label: '.pdf', door: 'Browser', glass: gPdf, to: 'Reader', toK: yWrite, pulse: bump },
    { label: '.7z', door: 'File Explorer', k: r7, hi: 0.5 * feLink, to: 'an app', toK: aWrite },
    { label: '.rar', door: 'File Explorer', k: rRar, hi: 0.5 * feLink },
  ].slice(0, grow > 0 ? 8 : 6);
  const led = M.ledger(lx, ly, lw, { rows, size: 30 });

  // File Explorer = the porter: the two new rows link to him
  if (feLink > 0) {
    const ry = (led.rowY(6) + led.rowY(7)) / 2;
    K.arrow(lx - 8, ry, L.porter.x + 46, L.porter.y + 30, { k: feLink, bend: -40, color: K.C.head, w: 3 });
    M.label('File Explorer', 390, 312, { alpha: feLink, color: K.C.head });
  }

  // ---- the hands, under the page
  const hy = 790;
  const H = [
    { icon: 'person', label: 'you', x: 560, at: cHands + 0.25 },
    { icon: 'gear', label: 'installer', x: 720, at: cInst },
    { icon: 'clock', label: 'update', x: 880, at: cUpd },
  ];
  const youLit = K.env(t, wOnly - 0.1, cSide + 0.2, 0.5) + K.io(t, cSide + 0.2, 0.5) * (1 - K.io(t, wReset + 0.6, 0.6));
  const instLine = 1 - K.io(t, wQuietly - 0.2, 0.7);
  const pageBot = led.y + led.h + 10;
  H.forEach((h, i) => {
    const k = K.io(t, h.at, 0.6);
    if (k <= 0) return;
    const lineK = K.io(t, h.at + 0.3, 0.6) * (i === 1 ? instLine : 1);
    const col = i === 0 ? K.mixColor(K.C.strong, K.C.head, K.clamp(youLit)) : K.C.strong;
    if (i === 0 && youLit > 0) K.glow(h.x, hy, 90, K.C.head, 0.22 * K.clamp(youLit));
    M.hand(h.icon, h.label, h.x, hy + (1 - k) * 16, null, null, { alpha: k, color: col });
    if (lineK > 0) K.line(h.x, hy - 50, h.x, pageBot, { k: lineK, color: K.rgba(col, 0.7), w: 2.5, dash: [8, 8], alpha: k });
  });

  // ---- ask in Settings: the installer is sent to you
  const askOut = 1 - K.io(t, cGlass - 0.4, 0.6);
  const askK = K.io(t, wShould, 0.7) * askOut;
  if (askK > 0) {
    K.arrow(H[1].x - 10, hy + 100, H[0].x + 14, hy + 100, { k: askK, bend: -26, color: K.C.head, w: 3 });
    M.label('Ask in Settings', 362, hy, { alpha: K.io(t, wSettings - 0.2, 0.5) * askOut, color: K.C.head });
  }

  // ---- pens (nib at the row being written; they come up from their hand)
  const nibOn = (i, k, name, oldName) => {
    const wNew = K.measure(name, { font: 'ui', weight: 600, size: led.size });
    const wOld = oldName ? K.measure(oldName, { font: 'ui', weight: 600, size: led.size }) : wNew;
    return { x: led.doorX + Math.max(wNew, wOld) * k, y: led.rowY(i) + 4 };
  };
  const penAt = (fromX, inK, outK, target, writing) => {
    const a = K.clamp(inK * 1.6) * (1 - outK);
    if (a <= 0) return;
    const start = { x: fromX + 20, y: hy - 60 };
    const x = K.lerp(K.lerp(start.x, target.x, inK), start.x, outK);
    const y = K.lerp(K.lerp(start.y, target.y, inK), start.y, outK);
    M.pen(x, y, 150, { alpha: a, t, writing });
  };
  penAt(H[1].x, iPenIn, iPenOut, nibOn(1, iWrite, 'Python', 'V S Code'), K.env(t, wPython + 0.5, wPython + 1.9, 0.2));
  {
    const onRar = K.io(t, wRar - 0.35, 0.35);
    const p7 = nibOn(6, r7, 'File Explorer'), pR = nibOn(7, rRar, 'File Explorer');
    const target = { x: K.lerp(p7.x, pR.x, onRar), y: K.lerp(p7.y, pR.y, onRar) };
    penAt(H[2].x, uPenIn, uPenOut, target, K.env(t, wSeven, wRar + 0.9, 0.2));
  }
  penAt(H[0].x, yPenIn, yPenOut, nibOn(5, yWrite, 'Reader', 'Browser'), K.env(t, cSide + 1.1, wStick + 0.9, 0.2));

  // ---- the notes zone (under the doors: x 990-1840, y 660-930)
  const zx = 1000, cy = 676;
  const instPill = K.io(t, wInstall, 0.5) * (1 - K.io(t, cUpd - 0.1, 0.5));
  if (instPill > 0) M.label('installers claim labels', 1410, 740, { alpha: instPill });

  const card1 = K.io(t, w2023, 0.6) * (1 - K.io(t, cAsk - 0.3, 0.5));
  if (card1 > 0) M.dateCard('Oct 2023', 'Windows 11 23H2', zx, cy, { k: card1 });
  if (card1 > 0) M.quiet('updates write rows too', 1410, 850, { alpha: card1 * K.io(t, wSeven + 0.4, 0.5) });

  const card2 = K.io(t, cAsk + 0.2, 0.6) * (1 - K.io(t, cGlass - 0.3, 0.5));
  if (card2 > 0) M.dateCard('Mar 2023', "Microsoft's principles", zx, cy, { k: card2 });

  const cardOut = 1 - K.io(t, cSide - 0.1, 0.5);
  const card3 = K.io(t, cGlass + 0.4, 0.6) * cardOut;
  const c3w = M.dateCard('2024', 'guarded rows', zx, cy, { k: card3 }).w;
  const card4 = K.io(t, wLast, 0.6) * cardOut;
  if (card4 > 0) M.dateCard('2025', 'locked record', zx + c3w + 24, cy, { k: card4 });
  const onlyYou = K.io(t, wOnly, 0.5) * cardOut;
  if (onlyYou > 0) M.quiet('only you change a guarded row', 1410, 850, { alpha: onlyYou });

  const sidePill = K.io(t, cSide + 0.9, 0.6) * (1 - K.io(t, cGrab - 0.1, 0.5));
  if (sidePill > 0) M.label('sometimes, after upgrades: reset defaults', 1410, 706, { alpha: sidePill });

  // ---- grab: "an app" (a window tile) sends a faint pen; the guarded .pdf glass resists, the unguarded .7z row is taken
  if (grabK > 0) {
    const gx = 1070, gy = 790;
    K.card(gx - 42, gy - 42 + (1 - grabK) * 16, 84, 84, { r: 24, fill: K.C.tile, stroke: K.C.line2, alpha: grabK * 0.8 });
    const wy = gy + (1 - grabK) * 16;
    K.card(gx - 25, wy - 20, 50, 40, { r: 6, fill: 'rgba(0,0,0,0)', stroke: K.C.soft, alpha: grabK * 0.8 });
    K.line(gx - 25, wy - 9, gx + 25, wy - 9, { color: K.C.soft, w: 2, alpha: grabK * 0.8 });
    K.line(gx + 10, wy - 15, gx + 18, wy - 15, { color: K.C.soft, w: 2, alpha: grabK * 0.8 });
    K.text('an app', gx, gy + 76, { font: 'ui', weight: 600, size: 26, color: K.C.body, align: 'center', alpha: grabK });
    K.text('people still report this', gx + 66, gy + 10, { font: 'ui', weight: 600, size: 28, color: K.C.strong, alpha: grabK * 0.9 });
    // the pen: tile -> .pdf glass (bump, recoil) -> .7z row (writes) -> fades
    const a = K.clamp(aPenIn * 1.6) * (1 - aPenOut) * 0.75;
    if (a > 0) {
      const start = { x: gx - 30, y: gy - 50 };
      const glassP = { x: lx + lw - 70 - 14 * Math.sin(bump * Math.PI), y: led.rowY(5) + 4 };
      const wNew = K.measure('an app', { font: 'ui', weight: 600, size: led.size });
      const wOld = K.measure('File Explorer', { font: 'ui', weight: 600, size: led.size });
      const rowP = { x: led.doorX + Math.max(wNew, wOld) * aWrite, y: led.rowY(6) + 4 };
      let x = K.lerp(start.x, glassP.x, aPenIn), y = K.lerp(start.y, glassP.y, aPenIn);
      x = K.lerp(x, rowP.x, aSlide); y = K.lerp(y, rowP.y, aSlide);
      x = K.lerp(x, start.x, aPenOut); y = K.lerp(y, start.y, aPenOut);
      M.pen(x, y, 150, { alpha: a, t, color: K.C.soft, writing: K.env(t, wGrab + 0.05, wGrab + 0.9, 0.15) });
    }
  }
});
