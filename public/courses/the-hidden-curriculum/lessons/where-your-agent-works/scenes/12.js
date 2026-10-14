/* 12 — Desktop no longer means "on your computer"
   The wide street (as 11 left it: back office across town, spare workshop working) eases into a smaller street at
   top left (s 0.68) so a right-hand column (x 1300-1840) can carry the dated cards and a bottom strip (y 740-930)
   the plain-words lines. Everything that crosses the road is a dashed copy.
   - [[processed]] eyebrow FIRST · PRO AND MAX; the hatch glows on "desktop"; the hatch path reaches to Documents and
     a file leaves through the hatch, turning into a dashed copy that lands in the vendor's back office on
     "processed". Card S069 (Use Cowork safely, 2026-10-06).
   - [[copies]] the copy gets its 'copy' stamp; on "delete" the session ends and the copy fades. Cards S184.
   - [[keeps-going]] laptop closed (house dark, hatch path grey); the back office's gear keeps turning. Cards S184 +
     S069 (the tasks-that-stay-local footnote lives on the lesson page, not on screen).
   The column shows ONE dated card at a time (each replaces the last), one-line eyebrows, the as-of pill inside the card.
   - [[hatch-narrow]] SECOND · THE HATCH; laptop open again, the path runs to every connected folder (never Finances);
     on "organization" a dashed outline round the house: your employer's files. Cards S069. Pills: the conditions.
   - [[one-folder]] the gold Claude-work folder joins the shelf, the other folders dim, the paths fold back and one thin
     gold path runs to Claude-work only. Cards S069 + Mollick (S249). Pointer chip to the folder lesson.
   Exit: one folder lit, hatch path thin and gold. No 'back' overshoot. Pure function of t. */
SCENE('12', (t, S) => {
  const C = K.C;
  K.bg();

  // ---- times (local), each beat on its spoken word
  const tCopies = S.cue('copies', 14.56), tKeeps = S.cue('keeps-going', 25.8), tHatch = S.cue('hatch-narrow', 32.18), tOne = S.cue('one-folder', 42.35);
  const tFirst = S.find(/^first/i, 0, 2.32), tDesktop = S.find(/^desktop$/i, 0, 4.74), tCowork = S.find(/^cowork/i, 0, 7.95);
  const tIncl = S.find(/^including$/i, 0, 9.14), tProc = S.find(/^processed$/i, 0, 11.78);
  const tDelete = S.find(/^delete$/i, 0, 18.31), tCopiesGo = S.find(/^copies$/i, 0, 20.09), tRetention = S.find(/^retention$/i, 0, 23.75);
  const tSched = S.find(/^scheduled$/i, 0, 28.71);
  const tAny = S.find(/^any$/i, 0, 34.2), tOrg = S.find(/^organization$/i, 0, 37.6), tEmployer = S.find(/^employer/i, 0, 40.7);
  const tDedicated = S.find(/^dedicated$/i, 0, 44.34), tMollick = S.find(/^mollick$/i, 0, 47.22), tHabit = S.find(/^folder$/i, 2, 49.64);

  // ---- the street: from 11's wide street (s 1) to the working frame (s 0.68, top left)
  const zk = K.io(t, 0.25, 1.3);
  const SX = K.lerp(0, 20, zk), SY = K.lerp(0, 60, zk), SS = K.lerp(1, 0.68, zk);

  const hatchOn = K.io(t, tDesktop, 0.6) - K.io(t, tKeeps + 0.2, 0.6) + K.io(t, tHatch, 0.6);
  const dark = K.io(t, tKeeps + 0.1, 0.7) - K.io(t, tHatch, 0.6);
  const wf = K.io(t, tOne + 0.2, 0.9);
  const dimF = K.io(t, tOne + 0.2, 0.8);
  const shelfAlpha = {};
  for (const n of ['Documents', 'Projects', 'Photos', 'Finances']) shelfAlpha[n] = K.lerp(1, 0.28, dimF);
  const gearA = (t - tKeeps) * 1.4;

  const st = M.street(t, {
    x: SX, y: SY, s: SS,
    house: { office: 0, rooms: { chat: 0.8, code: 0.8, cowork: 0 }, hatch: hatchOn, dark, workFolder: wf,
      shelfFocus: wf > 0 ? 'Claude-work' : undefined, shelfAlpha, labels: false, doors: false },
    vendor: { office: 1, officeLit: 0.8 + 0.2 * K.io(t, tProc, 0.5), spare: 1, spareLit: 0.6, gear: t * 0.9 },
  });
  const H = st.house, V = st.vendor, s = SS;

  // ---- the house's own text, drawn here instead of by M.house (labels:false, doors:false): at this scale the shared
  //      folder names sit on the folder icons and touch each other. Same words and places, but every name keeps an
  //      8 px gap under its folder (Karla 600 26 on screen, standing on the shelf plank) and the door pills stay 26 px.
  {
    const lit = 1 - 0.62 * dark;                                   // the house's lights-out overlay, matched
    const lsz = 26 / s;                                             // 26 px on screen
    K.at(H.x, H.y, s, 0, () => {
      K.eyebrow('YOUR COMPUTER', M.L.house.w / 2, -38, { ...M.T.eyebrow, size: 24 / s, color: C.head, align: 'center' });
      const names = wf > 0 ? ['Documents', 'Projects', 'Claude-work', 'Photos', 'Finances'] : M.L.shelfNames;
      for (const n of names) {
        // in 5-slot focus mode only the lit folder is named: the others' names fade out before it arrives
        const sk = n === 'Claude-work' ? K.ease.out(K.clamp(wf * 1.6 - 0.6)) : 1 - K.clamp(wf * 4);
        const al = sk * (n === 'Claude-work' ? 1 : shelfAlpha[n]) * lit;
        if (al <= 0.002) continue;
        const lx = (H.folders[n].x - H.x) / s;
        // folder icon: centre y 48, bottom 79.5 (local); plank top 116. Baseline on the plank, caps clear of the icon.
        K.text(n, lx, n === 'Finances' ? 114 - 4 / s : 116 - 1 / s,   // Finances sits just inside its terracotta ring
           { font: 'ui', weight: 600, size: lsz, color: n === 'Claude-work' ? C.head : C.body, align: 'center', alpha: al });
      }
      for (const [n, label] of [['chat', 'Chat'], ['code', 'Code']]) {
        const r = M.L.rooms[n], dx = (r[0] + r[1]) / 2;
        K.at(dx, M.L.doorY, 1 / s, 0, () => K.pill(label, 0, 0, { size: 26, alpha: lit, color: C.strong, stroke: K.mixColor(C.line2, C.head, 0.6) }));
      }
    });
  }

  // ---- the back office keeps working (a turning gear on its top-right corner while your laptop is closed)
  const gk = K.env(t, tKeeps + 0.4, tHatch + 0.2, 0.5);
  if (gk > 0) K.at(V.office.x + V.office.w - 30 * s, V.office.y + 30 * s, s, gearA, () => K.icon('gear', 0, 0, 40, { color: C.head, w: 2.6, alpha: gk }));

  // ---- hatch paths
  // processed / copies: the cloud reaches in through the hatch to Documents (grey while the laptop is closed)
  const pathOn = 1 - K.io(t, tKeeps + 0.2, 0.6) + K.io(t, tHatch, 0.6);
  const docK = K.io(t, tCowork - 0.1, 0.9) * (1 - K.io(t, tAny + 0.9, 0.01, 'lin'));
  // hatch-narrow: every connected folder (never Finances), folding back at one-folder
  const fanOut = K.io(t, tAny, 0.9), fanBack = K.io(t, tOne + 0.2, 0.7);
  const fanK = fanOut * (1 - fanBack);
  const oneK = K.io(t, tOne + 0.7, 0.9);
  if (docK > 0) M.hatchLine(H, V, { to: 'Documents', k: docK, on: pathOn });
  if (fanK > 0) for (const f of ['Documents', 'Projects', 'Photos']) M.hatchLine(H, V, { to: f, k: fanK, on: 1, w: 5 + 1.5 * K.io(t, tAny + 0.4, 0.6) * (1 - fanBack) });
  if (oneK > 0) M.hatchLine(H, V, { to: 'Claude-work', k: oneK, on: 1, w: 4 });
  if (oneK > 0) K.glow(H.folders['Claude-work'].x, H.folders['Claude-work'].y, 90 * s, C.head, 0.25 * oneK);

  // ---- the file: leaves Documents through the hatch, crosses as a dashed copy, lands on the back office's desk
  const pts = M.hatchLine(H, V, { to: 'Documents', k: 0 }).slice().reverse().slice(0, -1);   // starts under the plank, clear of the name
  const desk = V.at(120, 166);   // back-office desk (vendor-local), left of the worker
  pts.push([V.office.x + 40 * s, V.office.cy - 30 * s], desk);
  const fileIn = K.io(t, tIncl - 0.1, 0.4), travel = K.io(t, tIncl + 0.5, tProc - tIncl - 0.6, 'io');
  const fileGone = K.io(t, tCopiesGo - 0.1, 0.7);
  const fileA = fileIn * (1 - fileGone);
  if (fileA > 0) {
    const p = M.along(pts, travel);
    const crossed = p[0] > H.hatch.cx - 4 * s;                // once out through the hatch it is a copy
    const fs = 82 * s;
    if (!crossed) K.file(p[0], p[1], fs, { alpha: fileA });
    else M.copy(p[0], p[1], fs, { alpha: fileA });
    const stA = fileA * K.io(t, tCopies, 0.4);
    if (stA > 0) K.pill('copy', p[0] - 8, p[1] - fs * 0.5 - 26, { size: 26, font: 'mono', color: C.page, fill: C.head, stroke: C.head, alpha: stA });
  }
  // the session that holds the copy: a dashed ring round the desk, gone on "delete"
  const sesA = K.env(t, tCopies + 0.2, tDelete + 0.3, 0.5);
  if (sesA > 0) M.dashedRR(desk[0] - 44, desk[1] - 52, 88, 104, 12, { color: C.body, alpha: sesA * 0.8, w: 2 });

  // ---- the worker in the vendor's back office
  const wg = 0.3 + 0.7 * K.env(t, tProc, tCopies + 0.3, 0.5) + 0.5 * gk;
  M.worker(t, V.office.spot[0] + 8 * s, V.office.spot[1] - 6 * s, { s: 96 * s * 0.8, glow: Math.min(1, wg) });

  // ---- the desktop app, beside the hatch: open / closed
  const lapA = K.io(t, tDesktop, 0.5);
  if (lapA > 0) {
    const lx = (H.hatch.x + H.hatch.w + V.x) / 2, ly = H.hatch.cy + 92;
    const closed = K.env(t, tKeeps + 0.1, tHatch, 0.5);
    const col = K.mixColor(C.head, C.soft, closed);
    K.layer(lapA, () => {
      K.iconTile('laptop', lx, ly, 60, { color: col });
      M.label('desktop app', lx, ly + 64, { color: C.body });
      // the word swaps in sequence (old out over 0.25 s, then new in, rising 12 px): never two words at once
      const openA = (1 - K.io(t, tKeeps + 0.1, 0.25)) + K.io(t, tHatch + 0.25, 0.25);
      const closedIn = K.io(t, tKeeps + 0.35, 0.3), closedA = Math.min(closedIn, 1 - K.io(t, tHatch, 0.25));
      const openIn = t > tHatch ? K.io(t, tHatch + 0.25, 0.3) : 1;
      if (openA > 0.002) M.label('open', lx, ly + 96 + 12 * (1 - openIn), { color: C.head, alpha: Math.min(1, openA) });
      if (closedA > 0.002) M.label('closed', lx, ly + 96 + 12 * (1 - closedIn), { color: C.soft, alpha: closedA });
    });
  }

  // ---- your organization's computer: a dashed outline round the whole house
  const orgA = K.env(t, tOrg - 0.1, tOne + 0.1, 0.6);
  if (orgA > 0) {
    const x0 = H.x - 22, y0 = H.roofTop[1] - 18, x1 = H.x + H.w + 18, y1 = H.y + H.h + 16;
    M.outline(x0, y0, x1 - x0, y1 - y0, 20, K.io(t, tOrg - 0.1, 0.9), { color: C.body, w: 2.5, dash: [12, 9], alpha: orgA });
    M.pillL('managed by your organization', x0 + 26, y1, { size: 26, color: C.strong, fill: C.tile, stroke: C.body, alpha: orgA * K.io(t, tOrg + 0.5, 0.5) });
  }

  // ---- right column: title, beat eyebrow, dated cards
  const CX = 1300, CW = 540;
  const tSize = Math.min(46, 46 * CW / K.measure('Where your files end up', { font: 'head', weight: 700, size: 46, tracking: -1 }));
  K.title('Where your files end up', CX, 196, { size: tSize, alpha: K.io(t, 1.5, 0.6) });
  const eb1 = K.env(t, Math.max(tFirst, 1.5), tHatch - 0.3, 0.45), eb2 = K.io(t, tHatch + 0.2, 0.45);   // in sequence, never overlapping
  if (eb1 > 0) K.eyebrow('first · on Pro and Max', CX, 246, { size: 24, color: C.head, alpha: eb1 });
  if (eb2 > 0) K.eyebrow('second · the hatch', CX, 246, { size: 24, color: C.head, alpha: eb2 });

  // ONE card at a time, at y 274: each card holds until the next one's `at`, then the old fades out (0.3 s) before the
  // new one rises in, so two cards never share the column. The as-of pill sits inside the card it dates (footer).
  // Eyebrows are one line: publisher · date.
  const HC = 'Help Center · 2026-10-06', ASOF = 'as of 2026-10-14';
  const cards = [
    { at: tIncl - 0.3, o: { eyebrow: HC, body: "…including any local files it opens through the desktop app, is processed on Anthropic's servers", quote: true, footer: 'Pro, Max · since 2026-10-06' } },
    { at: tCopies + 0.1, o: { eyebrow: HC, body: 'When a task needs a file in the cloud, Claude fetches a copy of just that file.', quote: true, footer: ASOF } },
    { at: tDelete, o: { eyebrow: HC, body: 'When you delete a session, the copies Claude fetched are deleted too, per our data retention practices.', quote: true, footer: ASOF } },
    { at: tKeeps + 0.1, o: { eyebrow: HC, body: 'Close your laptop and Claude keeps going.', quote: true, footer: ASOF } },
    { at: tSched, o: { eyebrow: HC, body: 'Scheduled tasks run on their own even when your computer is off.', quote: true, footer: ASOF } },
    { at: tHatch + 0.2, o: { eyebrow: HC, body: 'A session in the cloud reaches your computer only when the Claude Desktop app is open', quote: true, footer: ASOF } },
    { at: tOrg - 0.2, o: { eyebrow: HC, body: 'If your organization manages your computer, note that connecting local folders makes them reachable from a session in the cloud.', quote: true, footer: ASOF } },
    { at: tOne + 0.1, o: { eyebrow: HC, body: 'Consider creating a dedicated working folder for Claude rather than granting broad access', quote: true, footer: ASOF } },
    { at: tMollick - 0.3, o: { eyebrow: 'Ethan Mollick · 2026-07-23', body: 'a non-private part of my Google Drive', quote: true, footer: 'One Useful Thing' } },
  ];
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    const inK = K.io(t, c.at + (i ? 0.3 : 0), 0.5);
    const outK = next ? K.io(t, next.at, 0.3) : 0;
    const ca = inK * (1 - outK);
    if (ca <= 0.002) return;
    K.at(0, (1 - K.ease.out(inK)) * 14, 1, 0, () => M.dated(CX, 274, CW, { ...c.o, alpha: ca }));
  });

  // ---- bottom strip: the plain-words lines (x 110-1260)
  const BX = 110;
  const line = (s, y, a, color, size = 30) => { if (a > 0) K.text(s, BX, y, { font: 'ui', weight: 600, size, color, alpha: a }); };
  // processed
  line('“Desktop” no longer means “on your computer”', 772, K.env(t, tDesktop + 0.1, tCopies - 0.3, 0.5), C.strong);
  line('Cowork\'s work is processed on Anthropic\'s servers', 826, K.env(t, tProc, tCopies - 0.3, 0.5), C.head);
  // copies
  line('a copy of just the file it needs crosses the road', 772, K.env(t, tCopies + 0.2, tKeeps - 0.3, 0.5), C.strong);
  line('delete the session, and those copies go too', 826, K.env(t, tDelete + 0.1, tKeeps - 0.3, 0.5), C.head);
  M.asOf(BX, 886, { text: "per Anthropic's data retention practices", alpha: K.env(t, tRetention - 0.2, tKeeps - 0.3, 0.5) });
  // keeps-going
  line('laptop closed: Claude keeps going', 772, K.env(t, tKeeps + 0.3, tHatch - 0.3, 0.5), C.strong);
  line('scheduled tasks run with your computer off', 826, K.env(t, tSched, tHatch - 0.3, 0.5), C.head);
  // hatch-narrow
  line('any connected folder is reachable from the cloud', 772, K.env(t, tAny, tOne - 0.3, 0.5), C.strong);
  line('on a managed computer, those are your employer\'s files', 826, K.env(t, tEmployer - 0.4, tOne - 0.3, 0.5), C.head);
  {
    const pa = K.env(t, tHatch + 0.6, tOne - 0.3, 0.5);
    if (pa > 0) {
      let x = BX;
      [['desktop app open', 0], ['connected folders only', 1], ['session started on desktop, or scheduled', 2]].forEach(([s, i]) => {
        x += M.pillL(s, x, 886, { size: 26, color: C.body, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.3), alpha: pa * K.stagger(t, tHatch + 0.6, i, 0.25, 0.5) }) + 14;
      });
    }
  }
  // one-folder
  line('one dedicated working folder', 772, K.io(t, tDedicated - 0.2, 0.5), C.strong);
  line('the folder habit, carried across town', 826, K.io(t, tHabit - 0.2, 0.5), C.head);
  M.pointer("the habit from the lesson on the agent's folder", BX, 886, { alpha: K.io(t, tHabit + 0.2, 0.5) });
});
