// 15 — Safe to ignore for now
// A low "later" shelf: three pills drop onto it as they are named; a cook's PID ticket flips
// (18412 -> 30556, "changes every run"); a fourth pill, Process Explorer, joins the shelf. Exit: the shelf, calm.
SCENE('15', (t, S) => {
  K.bg();
  const C = K.C, io = K.io;
  const word = (w, nth, fb) => S.find(w, nth, fb, { whole: true });

  // ---- beat times (local)
  const tIgnore = S.cue('ignore', 0);
  const tThreads = word('threads', 0, tIgnore + 1.9);
  const tSvcHost = word('each', 0, tIgnore + 3.7);
  const tEff = S.find('Efficiency', 0, tIgnore + 5.86);   // 603.16 abs: lands with the word, inside the 'and Efficiency mode.' caption
  const tPid = S.cue('pids-change', 7.44);
  const tChange = word('change', 0, tPid + 2.65);
  const tPower = S.cue('power-tools', 11.9);
  const tPE = word('Process', 0, tPower + 1.0);

  // ---- heading
  const hk = io(t, tIgnore - 0.3, 0.6);
  K.title('Safe to ignore for now', 960, 244 + (1 - hk) * 14, { size: 64, align: 'center', alpha: hk });

  // ---- the low shelf (M.shelf's plank, no cards)
  const geo = { x: 180, y: 324, w: 1560, cardW: 184, cardH: 124, gap: 16, n: 4 };
  const plankY = geo.y + geo.cardH + 22;           // 470
  M.shelf(t, { cards: [], geo, k: io(t, tIgnore, 0.8) });
  M.label('for later', geo.x + 8, plankY + 74, { align: 'left', color: C.soft, alpha: io(t, tIgnore + 0.4, 0.6) });

  // ---- pills: layout for 3 and for 4, eased between as the fourth joins
  const size = 32, ph = size * 1.9, gap = 40;
  const items = [
    { s: 'threads & priorities', at: tThreads - 0.15 },
    { s: 'each Service Host row', at: tSvcHost - 0.1 },
    { s: 'Efficiency mode', at: tEff - 0.2 },
    { s: 'Process Explorer', at: tPE - 0.15, icon: 'program' },
  ];
  const widthOf = (it) => {
    const to = { size, font: 'ui', weight: 600 };
    const is = it.icon ? size * 1.05 + size * 0.4 : 0;
    return K.measure(it.s, to) + is + size * 1.6;
  };
  const ws = items.map(widthOf);
  const lay = (n) => {
    const tot = ws.slice(0, n).reduce((a, b) => a + b, 0) + gap * (n - 1);
    let x = 960 - tot / 2;
    return ws.slice(0, n).map((w) => { const cx = x + w / 2; x += w + gap; return cx; });
  };
  const l3 = lay(3), l4 = lay(4);
  const joinK = io(t, tPE - 0.75, 0.7);         // the three make room just before the fourth lands
  const pillY = plankY - ph / 2 - 1;
  const rots = [-0.014, 0.01, -0.008, 0.012];
  items.forEach((it, i) => {
    const k = io(t, it.at, 0.55, 'out');
    if (k <= 0) return;
    const x = i < 3 ? K.lerp(l3[i], l4[i], joinK) : l4[i];
    const y = pillY - (1 - k) * 70;
    K.at(x, y, 1, rots[i] * k, () => {
      K.pill(it.s, 0, 0, { size, alpha: k, icon: it.icon, iconColor: C.head, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.25) });
    });
  });

  // ---- the PID beat: a cook whose ticket flips to a new number
  const ck = io(t, tPid - 0.1, 0.6);
  const calm = io(t, tPower, 0.6);                   // the label quietens once the power tools are named
  const flip = io(t, tChange - 0.25, 0.6);
  if (ck > 0.002) {
    const r = M.cook(t, 960, 708 + (1 - ck) * 16, 104, {
      pid: 18412, pidK: ck, pidFlip: flip, pidNext: 30556, name: 'node.exe',
      alpha: ck, lit: 0,
    });
    const lk = io(t, tChange - 0.05, 0.5) * (1 - 0.5 * calm);
    K.text('changes every run', 1090, r.ticketY + 10, { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: lk });
  }
});
