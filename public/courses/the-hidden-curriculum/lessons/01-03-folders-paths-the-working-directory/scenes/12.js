/* 01.03 section 12 "What it connects to"
   The course map, drawn at the top with only its top row (Machine, Code, History) showing; the pin marks
   01 (you are here). Five shelves rise in along the bottom: 01.04, 01.05, 02.03, 05.02, 08.11.
   Rows wash in turn (02, 05, 08), and the districts they sit in are lifted out of their dim. */
SCENE('12', (t, S) => {
  const C = K.C, M = window.M;
  K.bg();

  const cHidden = S.cue('connect-hidden', 2.3);
  const cPath = S.cue('connect-path', 13.1);
  const cMove = S.cue('connect-move', 22.6);
  const cRun = S.cue('connect-running', 29.5);
  const cWork = S.cue('connect-worktrees', 34.4);

  // the bottom row of districts, the garden path and the Start/Finish gates are not needed here:
  // the top row (Machine, Code, History) is the whole picture, so the cards have room below it
  const gone = { network: 1, trust: 1, shipping: 1, gate: 1, end: 1 };
  const pinK = K.io(t, cHidden - 0.3, 0.5, 'out');

  // rows wash in turn; the districts holding them lift out of their dim as they do
  const rowK = (a) => K.io(t, a, 0.6, 'io');
  const kRun = rowK(cRun), kWork = rowK(cWork);

  K.map.draw(t, {
    focus: 'machine',
    pin: '01',
    pinK,
    pinGlowK: pinK,
    path: 0,
    lanterns: 0,
    lanternLabels: 0,
    districtK: (id) => (gone[id] ? 0 : 1),
    highlight: (id) => (id === 'code' ? kRun : id === 'history' ? kWork : 0),
    rowWash: {
      '02': { k: rowK(cMove), color: C.head },
      '05': { k: kRun, color: C.head },
      '08': { k: kWork, color: C.head },
    },
  });

  // the five shelves: x, width, lesson number, name
  const shelves = [
    { x: 200, w: 290, num: '01.04', name: 'hidden files', at: cHidden },
    { x: 520, w: 240, num: '01.05', name: 'PATH', at: cPath },
    { x: 820, w: 300, num: '02.03', name: 'moving around', at: cMove },
    { x: 1150, w: 300, num: '05.02', name: 'running a file', at: cRun },
    { x: 1480, w: 300, num: '08.11', name: 'worktrees', at: cWork },
  ];
  const Y = 640, H = 140;

  // arrows from the you-are-here pin down to the first two shelves (drawn in with their cards)
  const kHidden = K.io(t, cHidden + 0.2, 0.7, 'io');
  const kPath = K.io(t, cPath + 0.2, 0.7, 'io');
  const arrowA = [[652, 430], [652, 596], [345, 596], [345, 636]];
  const arrowB = [[684, 430], [684, 616], [640, 616], [640, 636]];
  if (kHidden > 0) K.path(arrowA, { k: kHidden, color: C.head, w: 3, tension: 0, head: true });
  if (kPath > 0) K.path(arrowB, { k: kPath, color: C.head, w: 3, tension: 0, head: true });

  shelves.forEach((s) => {
    const k = K.io(t, s.at, 0.6, 'out');
    if (k <= 0.002) return;
    const yy = Y + (1 - k) * 24;
    K.layer(k, () => {
      K.card(s.x, yy, s.w, H, { r: 22, fill: M.P.card, stroke: C.line2, glow: 0.2, shadow: false });
      M.mono(s.num, s.x + 26, yy + 56, { size: 26, color: C.head });
      M.label(s.name, s.x + 26, yy + 106, { size: 30, color: C.strong, align: 'left', weight: 600 });
    });
  });
});
