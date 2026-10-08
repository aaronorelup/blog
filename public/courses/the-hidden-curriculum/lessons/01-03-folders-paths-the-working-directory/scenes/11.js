/* 01.03 section 11 "Safe to ignore for now".
   The map sits dimmed in the background (0.45, lifted from 0.25 so the root edge, root label and
   "the disk" label stay readable). Four small pills appear in a row, each on the cue for the thing
   being said: 260 characters, forward slashes, /mnt/c, import list. Each is labelled "later" at
   28 px in body cream (lifted from the 24-ish quiet grey that read as too faint); the two lesson
   references (01.08, 05.02) appear under their pills. A closing reading line lands on "memorize". */
SCENE('11', (t, S) => {
  const M = window.M, P = M.P, C = K.C;
  K.bg();

  // the map, dimmed in the background (the metaphor object persists from section 03)
  M.frame(t, { alpha: 0.45, glow: 0.2, dotAlpha: 0.45, dotPulse: 0.4 });

  const items = [
    { s: '260 characters', mono: false, icon: 'puzzle', cue: S.cue('ignore-260', 2.68), ref: '01.08' },
    { s: 'forward slashes', mono: false, icon: 'code', cue: S.cue('ignore-slashes', 17.68) },
    { s: '/mnt/c', mono: true, icon: 'server', cue: S.cue('ignore-wsl', 22.3) },
    { s: 'import list', mono: false, icon: 'puzzle', cue: S.cue('ignore-python', 27.78), ref: '05.02',
      color: K.mixColor(C.strong, C.head, 0.35) },
  ];

  // lay the pills out in one row, centred on the canvas, with equal gaps
  const font = (it) => (it.mono ? { font: 'mono', weight: 600, size: 30 } : { font: 'ui', weight: 600, size: 26 });
  const padOf = (it) => (it.mono ? 30 : 26) * 1.6;
  const widths = items.map((it) => K.measure(it.s, font(it)) + padOf(it));
  const gap = 56;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x0 = 960 - total / 2;
  const cxs = items.map((_, i) => {
    const cx = x0 + widths[i] / 2;
    x0 += widths[i] + gap;
    return cx;
  });

  // exit: the pills dim only a little over the last seconds (floor 0.8), calm for the handover
  const dimK = K.io(t, S.dur - 3, 1.5, 'io');
  const pa = 1 - 0.2 * dimK;

  items.forEach((it, i) => {
    const a = K.io(t, it.cue, 0.5, 'out');
    if (a <= 0.002) return;
    const cx = cxs[i];
    const alpha = a * pa;
    M.icon(it.icon, cx, 320, 84, { color: it.color || P.ink, alpha });
    if (it.mono) M.addressPill(it.s, cx, 420, { alpha });
    else M.pill(it.s, cx, 420, { alpha, color: P.ink });
    // "later": 28 px, body cream for contrast (never below 26 px)
    M.label('later', cx, 480, { color: P.body, alpha, size: 28 });
    if (it.ref) M.mono(it.ref, cx, 530, { align: 'center', size: 26, color: P.body, alpha });
  });

  // the closing reading line, on the word "memorize"
  const ca = K.io(t, S.find('memorize', 0, 33), 0.8, 'out');
  M.line30("You don't need to memorize any of this today.", 960, 800, { color: C.body, alpha: ca * pa });
});
