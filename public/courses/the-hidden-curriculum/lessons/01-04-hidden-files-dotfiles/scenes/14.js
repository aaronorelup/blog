/* 01.04 section 14 "What it connects to"
   Left: the course map at 0.69 scale with its module lists hidden (district names stay >= 26 px), pin on 01.
   Right: a column of six small doors out of the back room, each with a lesson-number pill, sorted by lesson
   number so the leaders never cross. As each lesson is named: its door eases ajar, a full-size gold chip with
   the same lesson number washes in on its district's card, the district lifts out of its dim, and a thin gold
   leader draws from the door to that card. At "instruction files" the Lanterns over the map light (AI hangs
   over every district). Ends calm: six ajar doors, six leaders, the map held. */
SCENE('14', (t, S) => {
  const C = K.C, M = window.M, g = K.ctx();
  K.bg();

  // ---- the map transform: world (wx, wy) -> screen
  const MS = 0.69, MCX = 877.5, MCY = 540, MX = 637, MY = 590;
  const P = (wx, wy) => ({ x: MX + (wx - MCX) * MS, y: MY + (wy - MCY) * MS });
  const D = (id) => K.map.district(id);
  // a module row's chip centre (screen), a touch lower than the scaled row so the full-size chip clears the question
  const rowAt = (mod) => { const c = K.map.chipPos(mod); return P(c.x, c.y).y + 6; };

  // ---- the six links, in slot order (sorted by lesson number); `at` is when each is said
  const at = (re, fb) => S.find(re, 0, fb);
  const DOOR_X = 1236, ANCHOR = DOOR_X - 10;
  const SLOT_Y = [230, 356, 482, 608, 734, 860];
  const links = [
    { num: '01.05', name: 'environment variables', mod: '01', dist: 'machine', at: at('variables', 0.2) },
    { num: '03.09', name: 'instruction files', mod: '03', dist: 'machine', at: at('Instruction', 12.7) },
    { num: '05.03', name: 'virtual environments', mod: '05', dist: 'code', at: at('Virtual', 4.5) },
    { num: '08.07', name: '.gitignore & secrets', mod: '08', dist: 'history', at: at('ignore', 8.8) - 0.3 },
    { num: '10.09', name: 'MCP config files', mod: '10', dist: 'network', at: at(/^M$/, 16.7) },
    { num: '15.07', name: 'secrets out of plain text', mod: '15', dist: 'trust', at: at('Keeping', 21.1) },
  ];
  const kOf = (l) => K.io(t, l.at, 0.7, 'io');

  // leader routes: right from the door, along a short lane in the gap, then into the district card's nearest
  // edge. Top-row cards (Machine, Code) are entered from a channel just above them, Trust from just below.
  const cardTop = P(0, D('machine').y).y, botEdge = P(0, D('trust').y + D('trust').h).y;
  const rightEdge = P(D('history').x + D('history').w, 0).x;
  const route = {
    '01.05': (y) => [[ANCHOR, y], [1196, y], [1196, cardTop - 36], [P(560, 0).x, cardTop - 36], [P(560, 0).x, cardTop]],
    '03.09': (y) => [[ANCHOR, y], [1215, y], [1215, cardTop - 24], [P(640, 0).x, cardTop - 24], [P(640, 0).x, cardTop]],
    '05.03': (y) => [[ANCHOR, y], [1205, y], [1205, cardTop - 12], [P(1060, 0).x, cardTop - 12], [P(1060, 0).x, cardTop]],
    '08.07': (y) => [[ANCHOR, y], [1204, y], [1204, rowAt('08')], [rightEdge, rowAt('08')]],
    '10.09': (y) => [[ANCHOR, y], [1204, y], [1204, rowAt('10')], [rightEdge, rowAt('10')]],
    '15.07': (y) => [[ANCHOR, y], [1204, y], [1204, botEdge + 22], [P(1100, 0).x, botEdge + 22], [P(1100, 0).x, botEdge]],
  };
  // draw a polyline up to fraction k of its length, ending in a small dot when complete
  const leader = (pts, k, a) => {
    if (k <= 0 || a <= 0) return;
    let total = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
    let left = total * k;
    g.save(); g.globalAlpha *= a; g.strokeStyle = C.head; g.lineWidth = 2; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    let end = pts[0];
    for (let i = 1; i < pts.length && left > 0; i++) {
      const u = Math.min(1, left / seg[i - 1]); left -= seg[i - 1];
      end = [K.lerp(pts[i - 1][0], pts[i][0], u), K.lerp(pts[i - 1][1], pts[i][1], u)];
      g.lineTo(end[0], end[1]);
    }
    g.stroke();
    g.fillStyle = C.head; g.beginPath(); g.arc(end[0], end[1], 2 + 3 * K.clamp((k - 0.9) / 0.1), 0, Math.PI * 2); g.fill();
    g.restore();
  };

  // ---- the map (module lists hidden: only district names and questions, so nothing is mush)
  const hi = {};
  links.forEach((l) => { if (l.dist !== 'machine') hi[l.dist] = Math.max(hi[l.dist] || 0, kOf(l)); });
  const kLant = K.io(t, links[1].at, 0.8, 'io');
  K.at(MX, MY, MS, 0, () => {
    K.at(-MCX, -MCY, 1, 0, () => {
      K.map.draw(t, {
        focus: 'machine', dim: 0.65, pin: '01', chips: false,
        lanterns: K.lerp(0, 1, kLant), lanternLabels: 0,
        highlight: (id) => hi[id] || 0,
      });
    });
  });

  // ---- full-size lesson chips on the cards (the "washed rows"), drawn outside the scaled map
  links.forEach((l) => {
    const k = kOf(l); if (k <= 0.002) return;
    const d = D(l.dist), x0 = P(d.x + 26, 0).x, y = rowAt(l.mod);
    const fn = { font: 'mono', weight: 600, size: 26 };
    const w = K.measure(l.num, fn) + 28, h = 38;
    K.layer(k, () => {
      K.rr(x0, y - h / 2, w, h, h / 2); g.fillStyle = K.rgba(C.head, 0.16); g.fill();
      g.strokeStyle = K.rgba(C.head, 0.85); g.lineWidth = 1.5; g.stroke();
      K.text(l.num, x0 + 14, y + 9, { ...fn, color: C.head });
    });
  });

  // ---- the column of doors, pills and leaders
  const DS = 0.3, DH = 330 * DS, DW = 96 * DS;
  links.forEach((l, i) => {
    const k = kOf(l), cy = SLOT_Y[i];
    const appear = K.io(t, l.at - 0.15, 0.5, 'out');
    if (appear <= 0.002) return;
    // leader first, under the door and pill
    leader(route[l.num](cy), K.io(t, l.at + 0.1, 0.8, 'io'), 0.7);
    const top = cy - DH * 0.55 + (1 - appear) * 16;
    K.layer(appear, () => {
      M.doorGroup(DOOR_X, top, DS, { sign: false, open: 0.7 * k, light: 0.7 * k });
      const px = DOOR_X + DW + 22, py = top + DH * 0.55, sz = 28;
      const w = M.ref(l.num, l.name, px, py, { align: 'left', size: sz });
      // a thin gold edge on the pill while its link is live, settling to a hairline
      const live = K.clamp(k - K.io(t, l.at + 2.2, 0.8, 'io') * 0.6);
      K.rr(px, py - sz * 0.95, w, sz * 1.9, sz * 0.95); g.strokeStyle = K.rgba(C.head, 0.75 * live); g.lineWidth = 1.5; g.stroke();
      // colour law: a leading dot is painted gold (overdraw the '.' at M.ref's own text position)
      if (l.name[0] === '.') {
        const nw = K.measure(l.num, { font: 'mono', weight: 600, size: sz });
        K.text('.', px + sz * 0.8 + nw + sz * 0.55, py + sz * 0.34, { font: 'ui', weight: 600, size: sz, color: M.palette.dot });
      }
    });
  });
});
