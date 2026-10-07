/* 01.02 File extensions & associations: shared drawing (window.M)
   ONE metaphor: THE PORTER AND THE LEDGER, continuing 01.01's STRING OF BEADS WITH A PAPER TAG.
     the STRING  = a file's bytes: a cord of glazed beads (01.01's exact look). Never untied, never changes on a rename.
     the TAG     = the file's name: a cream luggage tag tied at the LEFT end of the cord (01.01 convention). The part
                   after the last dot is the label (the extension). It can be underlined, ringed, crossed out and
                   rewritten, crossfaded to a new name, and FOLDED at the last dot (hidden extensions).
     the PORTER  = the OS file manager (File Explorer / Finder): a person icon in a small porter's cap, behind a desk.
     the LEDGER  = the file-association table: a cream paper page of mono rows ".txt -> Notepad", hairline dividers,
                   a gold finger bar that slides to a row, a pen that rewrites a row, glass that guards a row.
     the DOORS   = programs: tall narrow door frames on the right with the program's name on the lintel and an icon.
     the PEN     = editing the ledger (Open with "Always", default apps, installers, updates).
     the AGENT   = AI: a gold sparkle in a soft glow (the same as 01.01), lit from the course lantern.
   Colour law (whole lesson): CREAM = literal names and raw things (tags, ledger paper, file names); GOLD = the
   porter's attention and meaning (finger bar, underline of the label, focused door, the agent); TERRACOTTA = a
   wrong / hidden / changed label (fold ring, struck-out text, a label with no row). No red/green status colours.
   Pink only via K.petals on 01 and 14.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const pick = (v, d) => (v == null ? d : v);
  const c01 = (v) => K.clamp(+v || 0);
  const fnOr = (v, i, d) => (typeof v === 'function' ? c01(v(i)) : v == null ? d : c01(v));

  // ---------------------------------------------------------------- data
  const BYTES = [112, 114, 105, 110, 116, 40, 34, 104, 105, 34, 41, 10];            // print("hi")\n in UTF-8
  const STRINGS = {
    txt: { bytes: BYTES, tag: 'hello.txt' },
    py: { bytes: BYTES, tag: 'hello.py' },
    pytxt: { bytes: BYTES, tag: 'hello.py.txt' },
    notes: { bytes: [110, 111, 116, 101, 115, 32, 116, 111, 32, 115, 101, 108], tag: 'notes.txt' },
    png: { bytes: [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13], tag: 'photo.png', tint: '#2C3A4A' },
    jpg: { bytes: [255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1], tag: 'photo.jpg', tint: '#3A2E44' },
    pdf: { bytes: [37, 80, 68, 70, 45, 49, 46, 55, 10, 37, 226, 227], tag: 'report.pdf', tint: '#3C2C2A' },
    docx: { bytes: [80, 75, 3, 4, 20, 0, 6, 0, 8, 0, 0, 0], tag: 'report.docx', tint: '#2A3346' },
  };
  // the ledger's standard rows (03). door names must match DOORS keys
  const ROWS = [
    { label: '.txt', door: 'Notepad' },
    { label: '.py', door: 'V S Code' },
    { label: '.png', door: 'Photos' },
    { label: '.html', door: 'Browser' },
    { label: '.pdf', door: 'Browser' },
  ];
  // every program door: icon drawn on the door panel (K.icon name, or 'lines' / 'code' / 'image' custom)
  const DOORS = {
    'Notepad': { icon: 'lines' },
    'V S Code': { icon: 'code' },
    'Photos': { icon: 'image' },
    'Browser': { icon: 'globe' },
    'Python': { icon: 'terminal' },
    'Preview': { icon: 'image' },
    'TextEdit': { icon: 'lines' },
    'File Explorer': { icon: 'folder' },
  };

  // ---------------------------------------------------------------- palette, type, motion
  const palette = {
    cord: '#665C76', bead: C.tile, beadEdge: '#5A5268', beadHi: 'rgba(242,231,213,0.10)', number: C.strong,
    tag: C.paper, tagShade: C.paperShade, tagInk: C.page,
    paper: '#EFE3CE', paperShade: '#D9CAB0', paperLine: '#CBB998', ink: '#2C2A36', inkSoft: '#6E6457',
    wood: '#3A2E2A', woodTop: '#5A4436', woodEdge: '#7A5C44',
    door: '#1B1C2C', doorPanel: '#23233A', doorFrame: C.line2,
    porter: C.strong, cap: C.accent,
    finger: C.head, focus: C.head, changed: C.accent, quiet: C.soft,
    glass: 'rgba(150,185,225,0.26)', glassEdge: 'rgba(120,160,210,0.85)',
    agent: C.head,
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },
    read: { font: 'ui', weight: 600, size: 30 },
    quiet: { font: 'ui', weight: 400, size: 30, color: C.soft },
    mono: { font: 'mono', weight: 600, size: 30 },
    row: { font: 'mono', weight: 600, size: 30 },     // ledger rows (paper ink)
  };
  const motion = {
    move: 0.7, pop: 0.5, finger: 0.6, carry: 1.4, write: 0.8,
    tagSway: { speed: 0.9, amp: 0.012 }, agentBob: { speed: 1.8, amp: 5 }, porterBob: { speed: 1.1, amp: 2 },
  };
  // where things sit (1920 x 1080 canvas). THE ROOM is the standing set for 03-09 and 11-13.
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    porter: { x: 420, y: 450, s: 130 },             // porter icon centre; stands behind the desk
    desk: { x: 250, y: 540, w: 480, h: 150 },       // desk top-left; porter's chest hidden behind it
    ledgerDesk: { x: 540, y: 400, w: 200 },         // closed ledger standing on the desk, right of the porter (book 200 x 140)
    ledger: { x: 200, y: 590, w: 600 },             // ledger lifted for reading: x 200-800, 5 rows -> y 590-~900
    stringIn: { x: 480, y: 860, s: 0.3, n: 8, tagS: 0.8 },  // a string waiting in front of the desk (bead-row centre; porter captions sit at y 760 above it)
    doors: [1080, 1270, 1460, 1650],                // centres of 4 doors (Notepad, V S Code, Photos, Browser)
    doors5: [1030, 1200, 1370, 1540, 1710],         // 5 doors (+ Python), w 150
    doorY: 230, doorW: 170, doorH: 400,             // door top y and size (door bottoms at 630)
    doorStop: 680,                                  // y where a carried string rests in front of a door
    cams: {                                          // K.cam keys
      room: { x: 960, y: 540, z: 1 },
      desk: { x: 560, y: 600, z: 1.3 },
      doors: { x: 1380, y: 460, z: 1.25 },
    },
    title: { x: 1020, y: 640, s: 0.55 },            // 01 still-life string
    end: { x: 1660, y: 840, s: 0.24 },              // 14 still-life string
  };

  // ---------------------------------------------------------------- beads (01.01 look, kept identical)
  function geo(x, y, s, n) {
    const sp = 100 * s, r = 38 * s, total = (n - 1) * sp, left = x - total / 2;
    const beads = []; for (let i = 0; i < n; i++) beads.push({ x: left + i * sp, y, i });
    return { x, y, s, r, sp, beads, x0: left, x1: left + total, eye: { x: left - 62 * s, y } };
  }
  /** one bead. o: {label, alpha, lit (0..1 gold edge), ring (0..1 gold ring), tint (body colour)} */
  function bead(x, y, r, o = {}) {
    const g = G(), a = pick(o.alpha, 1); if (a <= 0) return;
    g.save(); g.globalAlpha *= a;
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = r * 0.9; g.shadowOffsetY = r * 0.25;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = o.tint || palette.bead; g.fill();
    g.shadowColor = 'transparent';
    const hi = g.createRadialGradient(x - r * 0.35, y - r * 0.45, 0, x - r * 0.35, y - r * 0.45, r * 1.1);
    hi.addColorStop(0, palette.beadHi); hi.addColorStop(1, 'rgba(242,231,213,0)');
    g.fillStyle = hi; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    const lit = c01(o.lit);
    g.lineWidth = Math.max(1.5, r * 0.06);
    g.strokeStyle = lit > 0 ? K.mixColor(palette.beadEdge, C.gold, lit) : palette.beadEdge;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.restore();
    if (o.label != null) K.text(String(o.label), x, y + r * 0.27, { font: 'mono', weight: 600, size: r * 0.74, color: palette.number, align: 'center', alpha: a });
  }

  // ---------------------------------------------------------------- the tag
  /** paper tag, eyelet at (x, y), body hanging LEFT. o: {name, to, k (crossfade name->to), s, alpha, rot, swing,
   *  sway, t, mark (0..1 gold underline of the label), markColor, ring (0..1 terracotta ring round the label),
   *  ringColor, fold (0..1 flap folds over the LAST extension), strike (0..1 terracotta line through the label),
   *  dimBase (0..1 fades the part before the last dot to 30%), extColor (colour of the label text),
   *  size (font px at s 1, default 34), w}. Returns {x0, x1, y0, y1, w, h, rot, ext:{x0, x1, cx, cy}} */
  function tag(x, y, o = {}) {
    const g = G();
    const s = pick(o.s, 1), a = pick(o.alpha, 1); if (a <= 0) return null;
    const name = o.name || 'hello.txt', to = o.to, k = to ? c01(o.k) : 0;
    const size = pick(o.size, 34) * s;
    const font = { font: 'mono', weight: 600, size };
    const pad = 26 * s, holeR = 9 * s, holeX = -24 * s;
    const tw = Math.max(K.measure(name, font), to ? K.measure(to, font) : 0);
    const w = pick(o.w, Math.max(220 * s, tw + pad * 2 + 40 * s)), h = 90 * s;
    const swing = pick(o.swing, 1);
    const rot = pick(o.rot, -0.06) + (1 - swing) * 0.9 + (o.t != null ? K.wave(o.t, motion.tagSway.speed, motion.tagSway.amp * pick(o.sway, 1)) : 0);
    const xL = -w, xR = 0, yT = -h / 2, yB = h / 2, ch = 22 * s;
    const textX = xL + pad, baseY = size * 0.36;
    const cur = k < 0.5 ? name : to;
    const dot = cur.lastIndexOf('.');
    const extX0 = textX + (dot > 0 ? K.measure(cur.slice(0, dot), font) : 0), extX1 = textX + K.measure(cur, font);
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40 * s; g.shadowOffsetY = 14 * s;
    g.beginPath(); g.moveTo(xL + 10 * s, yT); g.lineTo(xR - ch, yT); g.lineTo(xR, yT + ch); g.lineTo(xR, yB - ch); g.lineTo(xR - ch, yB);
    g.lineTo(xL + 10 * s, yB); g.quadraticCurveTo(xL, yB, xL, yB - 10 * s); g.lineTo(xL, yT + 10 * s); g.quadraticCurveTo(xL, yT, xL + 10 * s, yT); g.closePath();
    g.fillStyle = K.rgba(palette.tag, 0.95); g.fill(); g.shadowColor = 'transparent';
    g.lineWidth = 1.2; g.strokeStyle = K.rgba(palette.tagShade, 0.9); g.stroke();
    g.beginPath(); g.arc(holeX, 0, holeR * 1.9, 0, Math.PI * 2); g.fillStyle = palette.tagShade; g.fill();
    g.beginPath(); g.arc(holeX, 0, holeR, 0, Math.PI * 2); g.fillStyle = C.page; g.fill();
    // name: base part + label part (so the label can be dimmed / coloured separately)
    const drawName = (str, al) => {
      if (al <= 0) return;
      const d = str.lastIndexOf('.');
      const base = d > 0 ? str.slice(0, d) : str, ext = d > 0 ? str.slice(d) : '';
      const db = c01(o.dimBase);
      K.text(base, textX, baseY, { ...font, color: palette.tagInk, alpha: al * (1 - 0.7 * db) });
      if (ext) K.text(ext, textX + K.measure(base, font), baseY, { ...font, color: o.extColor || palette.tagInk, alpha: al });
    };
    drawName(name, to ? 1 - K.clamp(k * 2) : 1);
    if (to) drawName(to, K.clamp(k * 2 - 1));
    const f = c01(o.fold);
    if (f > 0 && dot > 0) {
      const fx0 = extX0 + 1 * s, fx1 = extX1 + 6 * s, fw = (fx1 - fx0) * f;
      g.save();
      g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 10 * s; g.shadowOffsetX = -3 * s;
      K.rr(fx1 - fw, yT + 12 * s, fw, h - 24 * s, 6 * s); g.fillStyle = K.mixColor(palette.tag, palette.tagShade, 0.55 + 0.25 * (1 - f)); g.fill();
      g.shadowColor = 'transparent';
      g.beginPath(); g.moveTo(fx1, yT + 14 * s); g.lineTo(fx1, yB - 14 * s); g.strokeStyle = K.rgba('#9C8C74', 0.8); g.lineWidth = 1.5; g.stroke();
      g.restore();
    }
    const m = c01(o.mark);
    if (m > 0 && dot >= 0) K.mark(extX0, baseY + 12 * s, extX1 - extX0, m, { color: o.markColor || C.gold, w: 5 * s, alpha: 0.95 });
    const st = c01(o.strike) * (to ? 1 - K.clamp(k * 2) : 1);
    const od = name.lastIndexOf('.');
    if (st > 0 && od >= 0) {
      const sx0 = textX + (od > 0 ? K.measure(name.slice(0, od), font) : 0), sx1 = textX + K.measure(name, font);
      K.line(sx0 - 3 * s, -2 * s, sx1 + 3 * s, -2 * s, { k: c01(o.strike), color: palette.changed, w: 4 * s, alpha: to ? 1 - K.clamp(k * 2) : 1 });
    }
    g.restore();
    const toCanvas = (lx, ly) => [x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)];
    const [ecx, ecy] = toCanvas((extX0 + extX1) / 2, 0);
    if (c01(o.ring) > 0) K.ring(ecx, ecy, (extX1 - extX0) / 2 + 7 * s, h * 0.42, c01(o.ring), { color: o.ringColor || palette.changed, w: Math.max(2.5, 4 * s), rot });
    return { x0: x - w, x1: x, y0: y - h / 2, y1: y + h / 2, w, h, rot, ext: { x0: x + extX0, x1: x + extX1, cx: ecx, cy: ecy } };
  }

  /** width of a tag for this name at scale s (font px = size * s) */
  function tagWidth(name, s, size) {
    s = pick(s, 1); const fs = pick(size, 34) * s;
    return Math.max(220 * s, K.measure(name, { font: 'mono', weight: 600, size: fs }) + 26 * s * 2 + 40 * s);
  }

  // ---------------------------------------------------------------- the string (beads + tag)
  /** THE recurring file object. (x, y) = centre of the bead row; s = bead scale (1 = 01.01's 100 px spacing).
   *  o: {t, preset ('txt'|'py'|'pytxt'|'notes'|'png'|'jpg'|'pdf'|'docx'), bytes, n (bead count, default 12),
   *      alpha, cordK (0..1 cord draws), beadK (n | i=>0..1 beads drop in), labels ('auto'|'num'|'none'; auto shows
   *      numbers only when s >= 0.6), lit (n | i=>0..1 gold edge), tint (bead body; default the preset's),
   *      hold (0..1 gold "held still" ring round the whole bead row: renames never move beads),
   *      tag (false | 'name' | tag options {name, to, k, mark, fold, ring, strike, dimBase, extColor, swing...}),
   *      tagS (tag scale, default max(s, 0.8) so its text stays >= 27 px), tagK (tag alpha)}
   *  Returns geo + {tag: tagGeo, left (x of tag's left edge), right (x of cord end)} */
  function drawString(x, y, s, o = {}) {
    const g = G();
    s = pick(s, 1);
    const pre = STRINGS[o.preset] || STRINGS.txt;
    const bytes = (o.bytes || pre.bytes).slice(0, pick(o.n, 12));
    const G0 = geo(x, y, s, bytes.length);
    const a = pick(o.alpha, 1);
    if (a <= 0) return { ...G0, tag: null, left: G0.eye.x, right: G0.x1 };
    const r = G0.r, cordK = pick(o.cordK, 1), cw = Math.max(2, 4 * s);
    const tint = pick(o.tint, pre.tint);
    const labels = pick(o.labels, 'auto'), showNum = labels === 'num' || (labels === 'auto' && s >= 0.6);
    const cx1 = G0.x1 + r + 28 * s;
    g.save(); g.globalAlpha *= a;
    K.line(G0.eye.x, y, cx1, y, { k: cordK, color: palette.cord, w: cw });
    if (cordK >= 1) { g.beginPath(); g.arc(cx1, y, Math.max(2.5, 5 * s), 0, Math.PI * 2); g.fillStyle = palette.cord; g.fill(); }
    G0.beads.forEach((b) => {
      const drop = fnOr(o.beadK, b.i, 1); if (drop <= 0) return;
      const by = y - (1 - K.ease.out(drop)) * 60 * s;
      bead(b.x, by, r, { alpha: K.clamp(drop * 1.6), lit: fnOr(o.lit, b.i, 0), tint, label: showNum ? bytes[b.i] : null });
    });
    const hold = c01(o.hold);
    if (hold > 0) K.ring((G0.x0 + G0.x1) / 2, y, (G0.x1 - G0.x0) / 2 + r * 1.9, r * 2, hold, { color: C.head, w: Math.max(2.5, 4 * s), rot: 0 });
    g.restore();
    let tg = null;
    if (o.tag !== false && pick(o.tagK, 1) > 0) {
      const to = typeof o.tag === 'string' ? { name: o.tag } : (o.tag || { name: pre.tag });
      tg = tag(G0.eye.x, y, { t: o.t, s: pick(o.tagS, Math.max(s, 0.8)), ...to, alpha: a * pick(o.tagK, 1) });
    }
    return { ...G0, tag: tg, left: tg ? tg.x0 : G0.eye.x, right: cx1 };
  }

  // ---------------------------------------------------------------- the porter
  /** the porter (OS file manager): person icon + small terracotta porter's cap, soft lamp glow behind.
   *  (x, y) = icon centre; s = icon size (130 standard, >= 90). o: {t (idle bob), alpha, glow (0..1), look (-1..1
   *  head tilt toward ledger (-) or doors (+)), question (0..1 shows a '?' above: no row), caption (string or
   *  array of pill labels under the desk, e.g. ['File Explorer', 'Finder']), captionK, captionY} */
  function porter(x, y, s, o = {}) {
    s = pick(s, layout.porter.s);
    const a = pick(o.alpha, 1), capA = pick(o.captionAlpha, a);
    const bob = o.t != null ? K.wave(o.t, motion.porterBob.speed, motion.porterBob.amp) : 0;
    const look = pick(o.look, 0);
    const g = G();
    if (a > 0) K.layer(a, () => {
      K.glow(x, y - s * 0.1, s * 1.3, C.head, 0.16 * pick(o.glow, 1));
      const hx = x + look * s * 0.05, hy = y + bob;
      // body + head
      g.save(); g.translate(hx, hy); g.rotate(look * 0.08); g.translate(-hx, -hy);
      K.icon('person', hx, hy, s, { color: palette.porter, w: Math.max(3, s * 0.05) });
      // cap: a flat pillbox with a short brim, sitting on the head (head centre y - 0.22 s, r 0.2 s)
      const cy = hy - s * 0.42;
      K.rr(hx - s * 0.17, cy - s * 0.09, s * 0.34, s * 0.12, s * 0.03); g.fillStyle = palette.cap; g.fill();
      K.rr(hx - s * 0.2, cy + s * 0.02, s * 0.3 + (look >= 0 ? s * 0.12 : 0), s * 0.04, s * 0.02); g.fillStyle = K.mixColor(palette.cap, '#000000', 0.25); g.fill();
      g.restore();
      const q = c01(o.question);
      if (q > 0) K.icon('question', hx + s * 0.38, hy - s * 0.62, s * 0.42, { color: palette.changed, alpha: q, w: Math.max(3, s * 0.04) });
    });
    if (o.caption && capA > 0) {
      const caps = Array.isArray(o.caption) ? o.caption : [o.caption], ck = pick(o.captionK, 1);
      const cy = pick(o.captionY, y + s * 1.55), gap = 20;
      const ws = caps.map((c) => K.measure(c, { font: 'ui', weight: 600, size: 28 }) + 28 * 1.6);
      let cx = x - (ws.reduce((p, q) => p + q, 0) + gap * (caps.length - 1)) / 2;
      caps.forEach((c, i) => { K.pill(c, cx + ws[i] / 2, cy, { size: 28, alpha: capA * K.clamp(ck * caps.length - i), color: C.strong }); cx += ws[i] + gap; });
    }
  }

  // ---------------------------------------------------------------- the desk
  /** the porter's desk: dark wood front, lit top edge, two short legs. (x, y) = top-left, w x h. o: {alpha} */
  function desk(x, y, w, h, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const g = G();
    K.layer(a, () => {
      const top = 22;
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
      K.rr(x + 18, y + top, w - 36, h - top, 10); g.fillStyle = palette.wood; g.fill(); g.restore();
      // front panel inset
      K.rr(x + 44, y + top + 20, w - 88, h - top - 44, 8); g.strokeStyle = K.rgba(palette.woodEdge, 0.45); g.lineWidth = 1.5; g.stroke();
      // top slab
      K.rr(x, y, w, top, 8); g.fillStyle = palette.woodTop; g.fill();
      K.line(x + 10, y + 2, x + w - 10, y + 2, { color: K.rgba(C.head, 0.35), w: 2 });
      // legs
      g.fillStyle = palette.wood;
      g.fillRect(x + 34, y + h - 2, 16, 26); g.fillRect(x + w - 50, y + h - 2, 16, 26);
    });
  }

  // ---------------------------------------------------------------- the ledger
  /** row height and header for a ledger of width w */
  const LED = { head: 66, row: 50, pad: 28, foot: 18 };
  /** ledger height for n rows */
  const ledgerH = (n, o = {}) => (o.title === false ? 22 : LED.head) + n * LED.row + LED.foot;
  /** THE LEDGER (file associations). (x, y) = top-left, w = width (>= 520 for 30 px rows; 380 for 26 px).
   *  o: {alpha, rows (default ROWS; each {label, door, to, toK (0..1 pen rewrites door -> to), k (0..1 row reveal),
   *        dim (0..1), hi (0..1 gold wash), glass (0..1 guarded), pulse (0..1 one-shot gold pulse), strike,
   *        missing (true: label with no door, shows '?' in terracotta), alpha}),
   *      title ('file associations' default; false hides the header), titleK (0..1 types the title in),
   *      eyebrow (small gold uppercase over the page, e.g. 'one row = one association'), eyebrowK,
   *      finger (row index, may be fractional while sliding: the gold bar), fingerK (0..1 alpha),
   *      open (0..1: 0 = a closed book glyph at the same spot, 1 = open page), size (row font, default 30 if w>=520 else 26),
   *      arrow ('→' default)}
   *  Returns {x, y, w, h, rowY(i) -> baseline-centre y of row i, doorX (x of door column), labelX, rowRect(i)} */
  function ledger(x, y, w, o = {}) {
    const a = pick(o.alpha, 1);
    const rows = o.rows || ROWS;
    const hasTitle = o.title !== false;
    const headH = hasTitle ? LED.head : 22;
    const h = headH + rows.length * LED.row + LED.foot;
    const size = pick(o.size, w >= 520 ? 30 : 26);
    const labelX = x + LED.pad, arrowX = x + LED.pad + size * 4.4, doorX = arrowX + size * 1.5;
    const rowY = (i) => y + headH + LED.row * (i + 0.5);
    const rowRect = (i) => ({ x: x + 10, y: y + headH + LED.row * i + 3, w: w - 20, h: LED.row - 6 });
    const ret = { x, y, w, h, rowY, rowRect, labelX, doorX, arrowX, size };
    if (a <= 0) return ret;
    const g = G();
    const open = pick(o.open, 1);
    K.layer(a, () => {
      if (open < 1) {   // closed book: a leather-bound block with a gold title band
        const ca = 1 - K.clamp(open * 1.6);
        const bw = Math.min(w, 260), bh = Math.round(bw * 0.7), bx = x + (w - bw) / 2, by = y;
        K.layer(ca, () => {
          g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 50; g.shadowOffsetY = 18;
          K.rr(bx, by, bw, bh, 12); g.fillStyle = '#4A3A30'; g.fill(); g.restore();
          K.rr(bx + bw - 16, by + 8, 10, bh - 16, 4); g.fillStyle = palette.paper; g.fill();      // page edges
          K.rr(bx + 26, by + bh / 2 - 22, bw - 70, 44, 6); g.strokeStyle = C.gold; g.lineWidth = 2; g.stroke();
          K.text('LEDGER', bx + 26 + (bw - 70) / 2, by + bh / 2 + 9, { font: 'ui', weight: 600, size: 26, color: C.head, align: 'center', tracking: 4 });
        });
        if (open <= 0) return;
      }
      const oa = K.clamp(open * 1.4 - 0.2);
      const sy = K.lerp(0.35, 1, K.ease.out(K.clamp(open)));
      g.save(); g.globalAlpha *= oa;
      g.translate(x + w / 2, y); g.scale(1, sy); g.translate(-(x + w / 2), -y);
      // page
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 70; g.shadowOffsetY = 26;
      K.rr(x, y, w, h, 14); g.fillStyle = palette.paper; g.fill(); g.restore();
      // a second sheet peeking under (it's a book)
      K.rr(x + 6, y + h - 4, w - 12, 10, 6); g.fillStyle = palette.paperShade; g.fill();
      // margin rule
      K.line(x + LED.pad - 10, y + 10, x + LED.pad - 10, y + h - 10, { color: K.rgba(C.accent, 0.35), w: 1.5 });
      if (hasTitle) {
        const title = o.title || 'file associations';
        const tk = pick(o.titleK, 1);
        const shown = tk >= 1 ? title : title.slice(0, Math.floor(title.length * tk));
        K.text(shown, labelX, y + 44, { font: 'mono', weight: 700, size: Math.min(30, size), color: palette.ink });
        K.line(x + 14, y + headH - 4, x + w - 14, y + headH - 4, { color: palette.paperLine, w: 2 });
      }
      // finger bar
      const fk = pick(o.fingerK, o.finger != null ? 1 : 0);
      if (o.finger != null && fk > 0) {
        const fy = y + headH + LED.row * o.finger + 4;
        K.rr(x + 8, fy, w - 16, LED.row - 8, 10); g.fillStyle = K.rgba(C.head, 0.32 * fk); g.fill();
        K.rr(x + 8, fy, 6, LED.row - 8, 3); g.fillStyle = K.rgba(C.gold, fk); g.fill();
      }
      rows.forEach((r, i) => {
        const rk = pick(r.k, 1); if (rk <= 0) return;
        const ry = rowY(i), base = ry + size * 0.34;
        const ra = rk * pick(r.alpha, 1) * (1 - 0.6 * c01(r.dim));
        if (c01(r.hi) > 0) { K.rr(x + 8, ry - LED.row / 2 + 4, w - 16, LED.row - 8, 10); g.fillStyle = K.rgba(C.head, 0.32 * c01(r.hi)); g.fill(); }
        const pu = c01(r.pulse);
        if (pu > 0) { K.rr(x + 8, ry - LED.row / 2 + 4, w - 16, LED.row - 8, 10); g.strokeStyle = K.rgba(C.gold, Math.sin(pu * Math.PI)); g.lineWidth = 3; g.stroke(); }
        const dx = (1 - rk) * -20;
        K.text(r.label, labelX + dx, base, { font: 'mono', weight: 700, size, color: r.missing ? palette.changed : palette.ink, alpha: ra });
        K.text(o.arrow || '→', arrowX + dx, base, { font: 'mono', weight: 400, size, color: palette.inkSoft, alpha: ra });
        if (r.missing) K.text('?', doorX + dx, base, { font: 'mono', weight: 700, size, color: palette.changed, alpha: ra });
        else {
          const tk = r.to ? c01(r.toK) : 0;
          const oldW = K.measure(r.door, { font: 'ui', weight: 600, size });
          // old door: crossed out by the pen, then fades
          if (tk < 1) {
            K.text(r.door, doorX + dx, base, { font: 'ui', weight: 600, size, color: palette.ink, alpha: ra * (tk > 0.5 ? 1 - (tk - 0.5) * 2 : 1) });
            if (tk > 0) K.line(doorX - 4, ry, doorX + oldW + 4, ry, { k: K.clamp(tk * 2), color: palette.changed, w: 3.5, alpha: ra * (tk > 0.5 ? 1 - (tk - 0.5) * 2 : 1) });
          }
          if (r.to && tk > 0.5) {
            const full = r.to, n = Math.ceil(full.length * K.clamp((tk - 0.5) * 2));
            K.text(full.slice(0, n), doorX + dx, base, { font: 'ui', weight: 600, size, color: '#7A4A1C', alpha: ra });
          }
        }
        if (c01(r.strike) > 0) K.line(labelX - 4, ry, x + w - LED.pad, ry, { k: c01(r.strike), color: palette.changed, w: 3 });
        if (i < rows.length - 1) K.line(x + 16, ry + LED.row / 2, x + w - 16, ry + LED.row / 2, { color: K.rgba(palette.paperLine, 0.7), w: 1, alpha: rk });
      });
      g.restore();
      // glass sits over the page, outside the squash so it reads as a separate pane
      rows.forEach((r, i) => { if (c01(r.glass) > 0) { const rr = rowRect(i); glass(rr.x - 4, rr.y - 2, rr.w + 8, rr.h + 4, { k: c01(r.glass), lock: true }); } });
      if (o.eyebrow) K.eyebrow(o.eyebrow, x + 4, y - 18, { size: 22, alpha: pick(o.eyebrowK, 1) * K.clamp(open * 2 - 1) });
    });
    return ret;
  }

  // ---------------------------------------------------------------- a door (one program)
  /** a program's door: tall frame, lintel with the program's name (Karla 26), a recessed panel with the program's
   *  icon, a small gold knob. (x, y) = top-centre (lintel top), w x h (170 x 400 standard; min w 140).
   *  o: {name ('Notepad'...), icon (override), alpha, focus (0..1 gold frame + glow), open (0..1 the panel swings
   *      away and shows the inside: pass o.inside(rect) to draw content there), dim (0..1), cross (0..1 terracotta
   *      'X' on the panel: can't read these bytes), sub (small quiet label under the door, e.g. '(.venv)'),
   *      nameSize (default 26)}
   *  Returns {x0, x1, y0, y1, cx, cy (panel centre), mouth: {x, y} (where a carried string arrives, at the sill)} */
  function door(x, y, w, h, o = {}) {
    w = pick(w, layout.doorW); h = pick(h, layout.doorH);
    const x0 = x - w / 2, x1 = x + w / 2, y1 = y + h;
    const lint = 56, inset = 14;
    const px0 = x0 + inset, py0 = y + lint, pw = w - inset * 2, ph = h - lint - inset;
    const ret = { x0, x1, y0: y, y1, cx: x, cy: py0 + ph / 2, mouth: { x, y: y1 + 40 }, panel: { x: px0, y: py0, w: pw, h: ph } };
    const a = pick(o.alpha, 1) * (1 - 0.6 * c01(o.dim)); if (a <= 0) return ret;
    const g = G();
    const fk = c01(o.focus), ok = c01(o.open);
    const name = o.name || 'Notepad', def = DOORS[name] || { icon: 'file' };
    K.layer(a, () => {
      if (fk > 0) K.glow(x, y + h * 0.55, w * 1.1, C.head, 0.22 * fk);
      // frame
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
      K.rr(x0, y, w, h, 12); g.fillStyle = palette.door; g.fill(); g.restore();
      K.rr(x0, y, w, h, 12); g.lineWidth = 2 + fk; g.strokeStyle = K.mixColor(palette.doorFrame, C.head, fk); g.stroke();
      // lintel with the name
      K.rr(x0 + 6, y + 6, w - 12, lint - 12, 8); g.fillStyle = C.tile; g.fill();
      K.text(name, x, y + lint / 2 + 9, { font: 'ui', weight: 600, size: pick(o.nameSize, 26), color: fk > 0.5 ? C.head : C.strong, align: 'center' });
      // inside (revealed when open)
      if (ok > 0) {
        K.rr(px0, py0, pw, ph, 6); g.fillStyle = K.mixColor(C.code, C.head, 0.08 * ok); g.fill();
        if (o.inside) { const ix = px0 + pw * 0.14; g.save(); K.rr(ix, py0, px0 + pw - ix, ph, 6); g.clip(); K.layer(ok, () => o.inside({ x: ix + 6, y: py0, w: px0 + pw - ix - 6, h: ph })); g.restore(); }
        else K.glow(x, py0 + ph * 0.5, pw * 0.8, C.head, 0.25 * ok);
      }
      // panel (swings toward the viewer: narrows to the hinge side)
      const pwNow = pw * (1 - 0.86 * ok);
      if (pwNow > 1) {
        K.rr(px0, py0, pwNow, ph, 6); g.fillStyle = palette.doorPanel; g.fill();
        g.strokeStyle = K.rgba(C.line2, 0.9); g.lineWidth = 1.5; g.stroke();
        if (ok < 0.5) {
          const ia = (1 - ok * 2) * (1 - 0.85 * c01(o.holding)), icx = px0 + pwNow / 2, icy = py0 + ph * 0.36, is = Math.min(pw * 0.55, 76);
          K.layer(ia, () => doorIcon(o.icon || def.icon, icx, icy, is, fk));
          // knob
          g.beginPath(); g.arc(px0 + pwNow - 18, py0 + ph * 0.62, 6, 0, 7); g.fillStyle = K.rgba(C.gold, 1 - ok * 2); g.fill();
          // lower panel inset
          K.rr(px0 + 16, py0 + ph * 0.72, pwNow - 32, ph * 0.2, 4); g.strokeStyle = K.rgba(C.line2, 0.6 * ia); g.lineWidth = 1.2; g.stroke();
        }
      }
      const cr = c01(o.cross);
      if (cr > 0) { K.glow(x, ret.cy, pw * 0.6, C.accent, 0.12 * cr); K.icon('cross', x, ret.cy, pw * 0.7, { color: palette.changed, alpha: cr, w: 6 }); }
      // sill
      K.line(x0 - 10, y1, x1 + 10, y1, { color: K.mixColor(C.line2, C.head, fk * 0.7), w: 3 });
      // a handed-over string: a strand of beads hanging in the doorway
      const hk = c01(o.holding);
      if (hk > 0) {
        const n = 6, sp = 36, br = 13, top = py0 + 18, sway = o.t != null ? K.wave(o.t, 1.1, 3) : 0;
        const len = (n - 1) * sp + 30;
        K.line(x, top, x + sway * 0.5, top + len * hk, { color: palette.cord, w: 3 });
        for (let i = 0; i < n; i++) {
          const bk = K.clamp(hk * (n + 2) - i * 1.2); if (bk <= 0) continue;
          bead(x + sway * (i / n) * 0.5, top + 14 + i * sp, br, { alpha: bk, tint: o.holdTint, lit: fk * 0.6 });
        }
      }
    });
    if (o.holdName && c01(o.holding) > 0) {
      const ts = 0.74, tsize = 36, tw = tagWidth(o.holdName, ts, tsize);
      tag(x + tw / 2, y1 + 46, { name: o.holdName, s: ts, size: tsize, t: o.t, alpha: a * c01(o.holding), rot: -0.03, extColor: o.holdExtColor });
    }
    if (o.sub) K.text(o.sub, x, y1 + 40, { font: 'mono', weight: 600, size: 26, color: C.soft, align: 'center', alpha: a });
    return ret;
  }
  /** the small icon painted on a door panel */
  function doorIcon(name, x, y, s, fk) {
    const g = G(), col = K.mixColor(C.soft, C.head, fk);
    g.save(); g.strokeStyle = g.fillStyle = col; g.lineWidth = Math.max(2, s * 0.05); g.lineCap = 'round'; g.lineJoin = 'round';
    if (name === 'lines') {        // a sheet with text lines
      K.rr(x - s * 0.32, y - s * 0.42, s * 0.64, s * 0.84, 4); g.stroke();
      for (let i = 0; i < 4; i++) K.line(x - s * 0.2, y - s * 0.22 + i * s * 0.14, x + (i === 3 ? s * 0.04 : s * 0.2), y - s * 0.22 + i * s * 0.14, { color: col, w: Math.max(2, s * 0.04) });
    } else if (name === 'code') {  // < / >
      g.beginPath(); g.moveTo(x - s * 0.14, y - s * 0.24); g.lineTo(x - s * 0.38, y); g.lineTo(x - s * 0.14, y + s * 0.24);
      g.moveTo(x + s * 0.14, y - s * 0.24); g.lineTo(x + s * 0.38, y); g.lineTo(x + s * 0.14, y + s * 0.24);
      g.moveTo(x + s * 0.07, y - s * 0.3); g.lineTo(x - s * 0.07, y + s * 0.3); g.stroke();
    } else if (name === 'image') { // framed mountain + sun
      K.rr(x - s * 0.4, y - s * 0.32, s * 0.8, s * 0.64, 5); g.stroke();
      g.beginPath(); g.moveTo(x - s * 0.34, y + s * 0.24); g.lineTo(x - s * 0.1, y - s * 0.04); g.lineTo(x + s * 0.06, y + s * 0.12); g.lineTo(x + s * 0.18, y + s * 0.02); g.lineTo(x + s * 0.34, y + s * 0.24); g.stroke();
      g.beginPath(); g.arc(x + s * 0.18, y - s * 0.16, s * 0.07, 0, 7); g.stroke();
    } else if (name === 'folder') {
      K.rr(x - s * 0.4, y - s * 0.22, s * 0.8, s * 0.52, 5); g.stroke();
      g.beginPath(); g.moveTo(x - s * 0.4, y - s * 0.12); g.lineTo(x - s * 0.4, y - s * 0.3); g.lineTo(x - s * 0.1, y - s * 0.3); g.lineTo(x, y - s * 0.22); g.stroke();
    } else { g.restore(); K.icon(name, x, y, s, { color: col }); return; }
    g.restore();
  }
  /** the standard row of doors. o: {names (default ['Notepad','V S Code','Photos','Browser']), xs (default
   *  layout.doors / layout.doors5 by count), y, w, h, each: (i, name) => door options (focus, open, dim, cross...),
   *  alpha, k (0..1 | i=>0..1: each door rises in)} Returns array of door geometries (by index) + .byName */
  function doors(o = {}) {
    const names = o.names || ['Notepad', 'V S Code', 'Photos', 'Browser'];
    const xs = o.xs || (names.length >= 5 ? layout.doors5 : layout.doors);
    const w = pick(o.w, names.length >= 5 ? 150 : layout.doorW), h = pick(o.h, layout.doorH), y = pick(o.y, layout.doorY);
    const out = []; out.byName = {};
    names.forEach((n, i) => {
      const k = fnOr(o.k, i, 1);
      const extra = o.each ? o.each(i, n) || {} : {};
      const d = door(xs[i], y + (1 - K.ease.out(k)) * 40, w, h, { name: n, alpha: pick(o.alpha, 1) * k, ...extra });
      out.push(d); out.byName[n] = d;
    });
    return out;
  }

  // ---------------------------------------------------------------- the pen
  /** a fountain pen whose NIB TIP is at (x, y), barrel leaning up-right (off the row it writes). s = length (160 standard). o: {alpha, rot
   *  (radians, direction from nib to cap; default -0.75 = up-right), writing (0..1: small scribble wobble while it writes), t, color} */
  function pen(x, y, s, o = {}) {
    s = pick(s, 160);
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const g = G(), wr = c01(o.writing);
    const wob = wr > 0 && o.t != null ? K.wave(o.t, 22, 3 * wr) : 0;
    K.layer(a, () => {
      g.save(); g.translate(x + wob, y + wob * 0.4); g.rotate(pick(o.rot, -0.75));
      // nib at origin, barrel along +x after the rotate flip
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(s * 0.16, -s * 0.05); g.lineTo(s * 0.16, s * 0.05); g.closePath(); g.fillStyle = C.gold; g.fill();
      g.shadowColor = 'transparent';
      K.line(s * 0.02, 0, s * 0.12, 0, { color: '#6B5420', w: 1.5 });
      K.rr(s * 0.16, -s * 0.065, s * 0.2, s * 0.13, s * 0.03); g.fillStyle = '#2A2638'; g.fill();          // grip
      K.rr(s * 0.34, -s * 0.075, s * 0.66, s * 0.15, s * 0.07); g.fillStyle = o.color || palette.cap; g.fill();  // barrel
      K.rr(s * 0.34, -s * 0.075, s * 0.05, s * 0.15, 2); g.fillStyle = C.gold; g.fill();                     // band
      K.line(s * 0.5, -s * 0.085, s * 0.86, -s * 0.085, { color: C.gold, w: 2.5 });                          // clip
      g.restore();
    });
  }

  // ---------------------------------------------------------------- glass (a guarded row)
  /** translucent pane with a lock: "only you can change this row". (x, y) top-left, w x h.
   *  o: {k (0..1 slides in from the right + fades), lock (true), label (small text right of the pane), alpha} */
  function glass(x, y, w, h, o = {}) {
    const k = pick(o.k, 1), a = pick(o.alpha, 1) * k; if (a <= 0) return;
    const g = G(), dx = (1 - K.ease.out(k)) * 60;
    K.layer(a, () => {
      K.rr(x + dx, y, w, h, 10); g.fillStyle = palette.glass; g.fill();
      g.strokeStyle = palette.glassEdge; g.lineWidth = 2; g.stroke();
      // sheen
      g.save(); K.rr(x + dx, y, w, h, 10); g.clip();
      g.beginPath(); g.moveTo(x + dx + w * 0.18, y + h); g.lineTo(x + dx + w * 0.18 + h * 0.6, y); g.lineTo(x + dx + w * 0.18 + h * 0.6 + 26, y); g.lineTo(x + dx + w * 0.18 + 26, y + h); g.closePath();
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.fill(); g.restore();
      if (o.lock !== false) {
        const ls = Math.min(30, h * 0.62), lx = x + dx + w - ls * 0.9, ly = y + h / 2;
        K.icon('lock', lx, ly, ls, { color: '#3A3A50', w: 2.6 });
      }
    });
    if (o.label) K.text(o.label, x + dx + w + 18, y + h / 2 + 9, { font: 'ui', weight: 600, size: 26, color: C.body, alpha: a });
  }

  // ---------------------------------------------------------------- small furniture
  /** dated fact card: mono date on top in gold, Karla line below. (x, y) = top-left. o: {alpha, w (auto),
   *  k (0..1 rise in), tone ('gold' | 'quiet')}. Returns {w, h} */
  function dateCard(date, line, x, y, o = {}) {
    const k = pick(o.k, 1), a = pick(o.alpha, 1) * k;
    const lw = line ? K.measure(line, { font: 'ui', weight: 600, size: 28 }) : 0;
    const dw = K.measure(date, { font: 'mono', weight: 600, size: 26 });
    const w = pick(o.w, Math.max(lw, dw) + 56), h = line ? 104 : 62;
    if (a <= 0) return { w, h };
    const dy = (1 - K.ease.out(k)) * 18;
    K.card(x, y + dy, w, h, { r: 18, fill: C.tile, stroke: o.tone === 'quiet' ? C.line2 : K.rgba(C.gold, 0.7), alpha: a, shadow: true });
    K.text(date, x + 28, y + dy + 40, { font: 'mono', weight: 600, size: 26, color: o.tone === 'quiet' ? C.soft : C.head, alpha: a });
    if (line) K.text(line, x + 28, y + dy + 82, { font: 'ui', weight: 600, size: 28, color: C.strong, alpha: a });
    return { w, h };
  }
  /** a small paper slip (the Open with note handed to the porter). (x, y) = centre. o: {alpha, rot, s} */
  function slip(text, x, y, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const g = G(), s = pick(o.s, 1), font = { font: 'mono', weight: 700, size: 30 * s };
    const w = K.measure(text, font) + 48 * s, h = 64 * s;
    K.layer(a, () => {
      g.save(); g.translate(x, y); g.rotate(pick(o.rot, -0.05));
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
      K.rr(-w / 2, -h / 2, w, h, 6); g.fillStyle = palette.paper; g.fill(); g.shadowColor = 'transparent';
      K.line(-w / 2 + 12, -h / 2 + 10, w / 2 - 12, -h / 2 + 10, { color: K.rgba(C.accent, 0.4), w: 1.5 });
      K.text(text, 0, 11 * s, { ...font, color: palette.ink, align: 'center' });
      g.restore();
    });
  }
  /** a hand at the ledger: icon tile + label + a short pen stroke toward (tx, ty). name: 'person'|'gear'|'clock'.
   *  o: {alpha, k (0..1 pen line draws), color, grey (true: faint grey, 'people still report')} */
  function hand(name, label, x, y, tx, ty, o = {}) {
    const a = pick(o.alpha, 1) * (o.grey ? 0.55 : 1); if (a <= 0) return;
    const col = o.grey ? C.soft : (o.color || C.head);
    K.iconTile(name, x, y, 84, { color: col, alpha: a, stroke: o.grey ? C.line2 : K.rgba(col, 0.6) });
    K.text(label, x, y + 76, { font: 'ui', weight: 600, size: 26, color: o.grey ? C.soft : C.strong, align: 'center', alpha: a });
    if (tx != null) {
      const ang = Math.atan2(ty - y, tx - x), sx = x + Math.cos(ang) * 56, sy = y + Math.sin(ang) * 56;
      K.line(sx, sy, tx, ty, { k: pick(o.k, 1), color: K.rgba(col, 0.7), w: 2.5, dash: [8, 8], alpha: a });
    }
  }
  /** AI: gold sparkle in a soft glow, tiny bob (01.01's agent). o: {t, alpha, glow (0..1), color} */
  function agent(x, y, s, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const bob = o.t != null ? K.wave(o.t, motion.agentBob.speed, motion.agentBob.amp * s / 72) : 0;
    K.layer(a, () => {
      K.glow(x, y + bob, s * 1.5, C.head, 0.26 * pick(o.glow, 1));
      K.icon('sparkle', x, y + bob, s, { color: o.color || palette.agent, w: Math.max(2.5, s * 0.07) });
    });
  }
  /** quiet one-line caption centred (Karla 30 soft) */
  function quiet(s, x, y, o = {}) { return K.text(s, x, y, { ...type.quiet, align: 'center', ...o }); }
  /** literal mono chip (e.g. '.py', 'Content-Type: text/html'). o as K.pill */
  function chip(s, x, y, o = {}) { return K.pill(s, x, y, { size: 28, font: 'mono', color: C.head, ...o }); }
  /** concept pill (Karla 28, cream). o as K.pill (glow, alpha, color) */
  function label(s, x, y, o = {}) { return K.pill(s, x, y, { size: 28, color: C.strong, ...o }); }

  // ---------------------------------------------------------------- the carry
  /** smooth path a string follows from (x0, y0) to a door's mouth, arcing up over the desk front.
   *  Returns waypoints for K.path and use with M.along(). lift = arc height (default 120). */
  function carryPath(x0, y0, d, lift = 120) {
    const mx = (x0 + d.mouth.x) / 2;
    return [[x0, y0], [mx, Math.min(y0, d.mouth.y) - lift], [d.mouth.x, d.mouth.y]];
  }
  /** point at fraction k along a waypoint list (Catmull-Rom like K.path, by arc length). Returns {x, y} */
  function along(pts, k) {
    k = c01(k);
    const seg = (p0, p1, p2, p3, u) => {
      const u2 = u * u, u3 = u2 * u;
      return [0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)];
    };
    const P = [pts[0], ...pts, pts[pts.length - 1]], samp = [];
    for (let i = 1; i < P.length - 2; i++) for (let j = 0; j < 20; j++) samp.push(seg(P[i - 1], P[i], P[i + 1], P[i + 2], j / 20));
    samp.push(pts[pts.length - 1]);
    const L = [0]; for (let i = 1; i < samp.length; i++) L.push(L[i - 1] + Math.hypot(samp[i][0] - samp[i - 1][0], samp[i][1] - samp[i - 1][1]));
    const want = L[L.length - 1] * k;
    let i = 1; while (i < L.length - 1 && L[i] < want) i++;
    const u = L[i] === L[i - 1] ? 0 : (want - L[i - 1]) / (L[i] - L[i - 1]);
    return { x: K.lerp(samp[i - 1][0], samp[i][0], u), y: K.lerp(samp[i - 1][1], samp[i][1], u) };
  }

  // ---------------------------------------------------------------- the room (standing set, 03-09 / 11-13)
  /** draws the standard room in one call: doors (right), desk + porter (left), ledger (on the desk or lifted).
   *  o: {t, alpha, porter (options for M.porter, or false), desk (false hides), doors (options for M.doors, or false),
   *      ledger (options for M.ledger, or false), lift (0..1: ledger moves from the desk to layout.ledger),
   *      ledgerOpen (0..1, default: opens over the last 60% of lift)}
   *  Returns {doors, ledger, porter: {x, y}} */
  function room(o = {}) {
    const a = pick(o.alpha, 1);
    let D = [], L = null;
    K.layer(a, () => {
      if (o.doors !== false) D = doors(o.doors || {});
      const P = layout.porter;
      const po = o.porter || {};
      if (o.porter !== false) porter(P.x, P.y, P.s, { t: o.t, ...po, caption: null });
      if (o.desk !== false) desk(layout.desk.x, layout.desk.y, layout.desk.w, layout.desk.h);
      if (o.porter !== false && po.caption) porter(P.x, P.y, P.s, { ...po, alpha: 0, captionY: pick(po.captionY, layout.desk.y + layout.desk.h + 70), captionAlpha: pick(po.alpha, 1) });
      if (o.ledger !== false) {
        const lift = pick(o.lift, 0), ld = layout.ledgerDesk, lu = layout.ledger;
        const lo = o.ledger || {};
        const open = pick(o.ledgerOpen, pick(lo.open, K.clamp((lift - 0.4) / 0.6)));   // the book travels closed, then opens
        const lx = K.lerp(ld.x, lu.x, K.ease.io(lift)), ly = K.lerp(ld.y, lu.y, K.ease.io(lift)), lw = K.lerp(ld.w, lu.w, K.ease.io(lift));
        L = ledger(lx, ly, lw, { size: lu.w >= 520 ? 30 : 26, ...lo, open });
      }
    });
    if (!D.byName) D.byName = {};
    return { doors: D, ledger: L, porter: { x: layout.porter.x, y: layout.porter.y } };
  }

  window.M = {
    BYTES, STRINGS, ROWS, DOORS, palette, type, motion, layout, LED, ledgerH,
    geo, bead, tag, tagWidth, drawString, porter, desk, ledger, door, doors, pen, glass,
    dateCard, slip, hand, agent, quiet, chip, label, carryPath, along, room,
  };
})();
