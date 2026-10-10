/* 01.05 scene 05 — "PATH: a numbered list of streets"
   The PATH card (04's exit) opens centred, slides up to its header slot on "list of folders" and copies its
   folders down onto five numbered streets. The list is the same observed order 07 uses: two system streets
   (system32, Windows), then the user streets Python310, WindowsApps, miniconda3. A bare `python` sends the
   courier down the streets in order: streets 1 and 2 have no python (X), street 3's shop has python.exe and
   the courier goes in (gold). Streets 4-5 also hold python.exe but are never visited (dim).
   Header band (y 140-215) carries one idea at a time: the PATH card -> "first match wins" + PATHEXT ->
   "system list first" -> the shell's own checks before PATH (built-ins / aliases, cmd's current folder).
   Exit: everything fades out before the crossfade, because 06 redraws its own grid and terminal. */
SCENE('05', (t, S) => {
  const C = K.C;
  K.bg();
  const exitK = K.io(t, S.out - 1.1, 0.7);
  K.layer(1 - exitK, () => body05(t, S, C));
});

function body05(t, S, C) {
  // ---- cues (local seconds)
  const cList = S.cue('list-of-streets', 0);
  const tList = S.find('list', 0, cList + 1.8);
  const tStreets = tList + 0.75;        // rows unfold right after "list of folders" (card has reached its slot)
  const tSemi = S.find('semicolons', 0, cList + 8.0);
  const tColon = S.find('colons', 0, cList + 11.7);
  const cBare = S.cue('bare-name', 12.95);
  const tPy = S.find('python', 0, cBare + 1.7);
  const tWalk = S.find('walks', 0, cBare + 3.5);
  const cFirst = S.cue('first-shop', 18.2);
  const cWins = S.cue('first-wins', 21.0);
  const tNever = S.find('never', 0, cWins + 3.7);
  const tEnd = S.find('endings', 0, cWins + 7.3);
  const tExe = S.find(/^\.?exe/i, 0, cWins + 12.7);
  const cSys = S.cue('system-first', 35.5);
  const cShell = S.cue('shell-first', 40.9);
  const tBuilt = S.find('built', 0, cShell + 1.5);
  const tCmd = S.find('Command', 0, cShell + 5.4);
  const tPs = S.find('PowerShell', 0, cShell + 9.6);

  // 105 px pitch (not 120) so street 5 clears the terminal strip below it
  const geo = { ...M.L.streets, ys: [255, 360, 465, 570, 675] };
  const WIN = 2;                         // the winning street: the first user entry
  const ROWS = [
    { name: 'C:\\Windows\\system32', file: null },
    { name: 'C:\\Windows', file: null },
    { name: 'C:\\Users\\…\\Python310', file: 'python.exe' },
    { name: 'C:\\Users\\…\\WindowsApps', file: 'python.exe' },
    { name: 'C:\\Users\\…\\miniconda3', file: 'python.exe' },
  ];

  // ---- the PATH card: opens centred (04's exit), slides up to the header on "list of folders",
  //      copies its folders down, leaves when python is typed
  const upK = K.io(t, tList - 0.1, 0.75);
  const card = { x: K.lerp(385, 270, upK), y: K.lerp(452, 138, upK), w: 1150, h: 76, size: 26 };
  const cardOut = K.io(t, cBare, 0.6);
  const cardA = 1 - cardOut;
  const value = ROWS.map((r) => r.name).join(';');
  const tabW = K.measure('PATH', { font: 'mono', weight: 700, size: card.size }) + 56;
  const vx = card.x + tabW + 30, vBase = card.y + card.h / 2 + card.size * 0.36;
  const mono = { font: 'mono', weight: 600, size: card.size };
  const segX = []; let pre = '';
  ROWS.forEach((r) => { segX.push(vx + K.measure(pre, mono)); pre += r.name + ';'; });
  if (cardA > 0.002) {
    M.envCard(card.x, card.y, { w: card.w, h: card.h, name: 'PATH', value, kind: 'path', size: card.size,
      lit: 1 - K.io(t, tStreets + 1.0, 1.2) * 0.6, alpha: cardA });
    // ring each semicolon, in order, as "semicolons" is said
    // rings fade with the card (and leave before it, once the streets carry the idea)
    const ringA = cardA * (1 - K.io(t, Math.max(tSemi + 1.6, cBare - 0.5), 0.45));
    let p2 = '';
    if (ringA > 0.002) K.layer(ringA, () => ROWS.slice(0, -1).forEach((r, i) => {
      p2 += r.name;
      const sx = vx + K.measure(p2, mono) + K.measure(';', mono) / 2;
      p2 += ';';
      if (sx < card.x + card.w - 150) K.ring(sx, vBase - 9, 17, 24, K.io(t, tSemi + 0.1 * i, 0.4), { color: C.head, w: 3, rot: 0 });
    }));
  }
  // separator pill (right of the card) on "semicolons" / "colons"
  K.layer(K.io(t, tSemi, 0.5) * cardA, () => {
    K.spans([
      { s: ';', color: C.head, font: 'mono', weight: 700 }, { s: ' Windows   ', color: C.strong },
      { s: ':', color: C.head, font: 'mono', weight: 700, alpha: K.io(t, tColon, 0.5) }, { s: ' Mac · Linux', color: C.strong, alpha: K.io(t, tColon, 0.5) },
    ], 1640, 186, { align: 'center', size: 28, font: 'ui' });
  });

  // ---- the courier's route timing: street 1 (miss), drop to 2 (miss), drop to 3 and go in
  const rowK = (i) => K.stagger(t, tStreets, i, 0.22, 0.7);
  const t0Walk = Math.max(cBare + 2.4, tWalk - 0.5);
  const WALK = 0.6, DROP = 0.4, PAUSE = 0.2;
  const arr0 = t0Walk + WALK;                  // in front of shop 1
  const d1 = arr0 + PAUSE, arr1 = d1 + DROP;   // in front of shop 2
  const d2 = arr1 + PAUSE, arr2 = d2 + DROP;   // in front of shop 3
  const tEnter = Math.max(arr2 + 0.1, cFirst + 0.2);
  const miss0 = K.io(t, arr0 + 0.05, 0.35), miss1 = K.io(t, arr1 + 0.05, 0.35);
  const litK = K.io(t, tEnter + 0.15, 0.45);
  const dimK = K.io(t, tNever, 0.6);

  // ---- street rows
  const blank = () => ({ k: 0 });
  const base = (i, extra) => ({ name: ROWS[i].name, file: ROWS[i].file, k: rowK(i), ...extra });
  const missRow = (i, k) => base(i, { state: k > 0 ? 'miss' : 'idle', missK: k });
  // streets 1-2 miss; street 3 crossfades idle -> lit; streets 4-5 crossfade idle -> dim
  M.streets(t, geo, { rows: [missRow(0, miss0), missRow(1, miss1), base(2, { state: 'idle' }), blank(), blank()] });
  if (litK > 0) M.streets(t, geo, { rows: [blank(), blank(), base(WIN, { state: 'lit' }), blank(), blank()], alpha: litK });
  if (dimK < 1) M.streets(t, geo, { rows: [blank(), blank(), blank(), base(3, {}), base(4, {})], alpha: 1 - dimK });
  if (dimK > 0) M.streets(t, geo, { rows: [blank(), blank(), blank(), base(3, { state: 'dim' }), base(4, { state: 'dim' })], alpha: dimK });

  // as each street drops in, its segment of the card is underlined in gold (the card "splits" in order);
  // no flying text copies: they crossed street 1's label on the way down
  if (cardA > 0.002) ROWS.forEach((r, i) => {
    const a = tStreets + 0.22 * i - 0.1;
    const k = K.io(t, a, 0.3) * (1 - K.io(t, a + 0.9, 0.5));
    if (k <= 0.002) return;
    const xr = Math.min(segX[i] + K.measure(r.name, mono), card.x + card.w - 40);
    if (segX[i] > xr - 20) return;
    K.line(segX[i], vBase + 9, K.lerp(segX[i], xr, Math.min(1, k * 1.5)), vBase + 9, { color: C.head, w: 4, alpha: k * cardA });
  });

  // ---- the courier: waits at street 1, walks it, drops down street by street, goes into shop 3
  const u = 0.85;
  const q = [0, 1, 2].map((i) => M.streetAt(i, u, geo));
  const p0 = M.streetAt(0, 0, geo);
  let cx = p0.x, cy = p0.y, walking = 0, cs = 80, cA = K.io(t, cBare + 0.3, 0.6);
  if (t >= t0Walk && t < arr0) { cx = K.lerp(p0.x, q[0].x, K.io(t, t0Walk, WALK)); walking = 1; }
  else if (t >= arr0 && t < d1) { cx = q[0].x; }
  else if (t >= d1 && t < arr1) { cx = q[0].x; cy = K.lerp(q[0].y, q[1].y, K.io(t, d1, DROP)); walking = 1; }
  else if (t >= arr1 && t < d2) { cx = q[1].x; cy = q[1].y; }
  else if (t >= d2 && t < tEnter) { const k = K.io(t, d2, DROP); cx = q[1].x; cy = K.lerp(q[1].y, q[2].y, k); walking = k < 1 ? 1 : 0; }
  else if (t >= tEnter) {
    const k = K.io(t, tEnter, 0.55);
    cx = K.lerp(q[2].x, geo.shopX, k); cy = q[2].y; cs = K.lerp(80, 40, k); cA *= 1 - k; walking = k < 1 ? 1 : 0;
  }
  M.courier(t, cx, cy, cs, { icon: 'terminal', walking, alpha: cA, lit: 0.6 });
  // inside shop 3: the you-are-here dot
  M.dot(geo.shopX + 34, geo.ys[WIN] - 26, { k: K.io(t, tEnter + 0.4, 0.5), r: 9 });

  // ---- terminal strip: `python` typed on "bare name"; the banner proves which one ran
  K.layer(K.io(t, cBare, 0.6), () => {
    M.termStrip(t, [
      { at: Math.min(cBare + 0.5, tPy - 0.8), cmd: 'python', cps: 9 },
      { at: tEnter + 0.6, out: 'Python 3.10.11', color: C.head },
    ], { rows: 2, h: 140, y: 755, size: 26 });
  });

  // ---- header captions, one idea at a time
  const capA = K.io(t, cWins, 0.5) * (1 - K.io(t, cSys - 0.2, 0.5));
  K.layer(capA, () => {
    K.spans([
      { s: 'First match wins', color: C.head, weight: 700 },
      { s: '  ·  the rest: never visited', color: C.body, alpha: K.io(t, tNever, 0.5) },
    ], 270, 190, { size: 32, font: 'ui' });
  });
  // PATHEXT (screen only) on "endings"
  const extA = K.io(t, tEnd, 0.5) * (1 - K.io(t, cSys - 0.2, 0.5));
  K.layer(extA, () => {
    K.pill('PATHEXT  .COM .EXE .BAT .CMD …', 1480, 180, { font: 'mono', size: 26, color: C.strong, fill: C.tile, stroke: C.line2 });
  });
  // ring python.exe on street 3 when "python dot E X E" is said
  const ringK = K.io(t, tExe - 0.3, 0.5) * (1 - K.io(t, cSys, 0.5));
  if (ringK > 0) K.ring(geo.fileX, geo.ys[WIN] + 8, 132, 36, ringK, { color: C.head, w: 3, rot: 0 });

  // system list first, then yours: brackets on the left + header caption
  const sysA = K.io(t, cSys, 0.6) * (1 - K.io(t, cShell - 0.1, 0.5));
  K.layer(sysA, () => {
    K.spans([
      { s: 'On Windows: ', color: C.body },
      { s: 'system list first', color: C.strong, weight: 700 },
      { s: ', then yours', color: C.body },
    ], 270, 190, { size: 32, font: 'ui' });
  });
  const brA = K.io(t, cSys, 0.6);
  K.layer(brA, () => {
    const bx = 160;
    const band = (yTop, yBot, word, i) => {
      const k = K.io(t, cSys + 0.25 * i, 0.6);
      K.line(bx, yTop, bx, K.lerp(yTop, yBot, k), { color: C.line2, w: 3 });
      K.line(bx, yTop, bx + 14, yTop, { color: C.line2, w: 3, alpha: k });
      K.line(bx, yBot, bx + 14, yBot, { color: C.line2, w: 3, alpha: k });
      const g = K.ctx(); g.save(); g.translate(bx - 26, (yTop + yBot) / 2); g.rotate(-Math.PI / 2);
      M.label(word, 0, 9, { color: C.strong, size: 26, alpha: k }); g.restore();
    };
    band(geo.ys[0] - 22, geo.ys[1] + 52, 'system', 0);
    band(geo.ys[2] - 22, geo.ys[4] + 52, 'user', 1);
  });

  // shells check their own names before PATH: built-ins · aliases -> (cmd: current folder) -> PATH
  const shA = K.io(t, cShell, 0.6);
  K.layer(shA, () => {
    const y = 192, gx = 440, fx = 940, px = 1370;
    const gateK = K.io(t, tBuilt - 0.6, 0.5);
    K.layer(gateK, () => {
      K.pill('built-ins · aliases', gx, y, { size: 28, color: C.strong, fill: C.tile, stroke: C.line2, icon: 'terminal', iconColor: C.soft });
    });
    K.arrow(gx + 175, y, fx - 158, y, { k: K.io(t, tBuilt - 0.2, 0.5), color: C.soft, w: 3, dash: [8, 8] });
    K.arrow(fx + 158, y, px - 70, y, { k: K.io(t, tBuilt + 0.1, 0.5), color: C.soft, w: 3, dash: [8, 8] });
    K.layer(K.io(t, tBuilt + 0.3, 0.5), () => {
      K.pill('PATH', px, y, { font: 'mono', weight: 700, size: 28, color: C.head, fill: K.mixColor(C.tile, C.head, 0.15), stroke: C.head });
      K.pill('more in 02.02', px + 230, y, { size: 26, color: C.soft, fill: C.tile, stroke: C.line2 });
    });
    // cmd's current folder, inserted on "Command Prompt"
    const cfK = K.io(t, tCmd, 0.5);
    K.layer(cfK, () => {
      K.card(fx - 140, y - 30, 280, 60, { r: 30, fill: C.tile, stroke: C.line2, shadow: false });
      K.folder(fx - 100, y + 2, 34);
      K.text('current folder', fx - 72, y + 10, { font: 'ui', weight: 600, size: 26, color: C.strong });
      M.eyebrow('cmd: yes', fx - 136, y - 44, { align: 'left' });
    });
    // PowerShell deliberately doesn't
    const psK = K.io(t, tPs, 0.5);
    M.cross(fx - 100, y, 60, psK);
    K.layer(psK, () => M.eyebrow('PowerShell: no', fx + 175, y - 44, { align: 'left', color: C.accent }));
  });
}
