/* 01.01 Files are just bytes: shared drawing (window.M)
   The lesson's one recurring object is THE STRING OF BEADS WITH A PAPER TAG:
     the STRING = a file's contents. A cord with one bead per byte; each bead shows its number (0-255), or, under
                  a CODE CARD, the letter that number stands for. Default beads are print("hi") + newline in UTF-8.
     the TAG    = the file's name. A cream luggage tag tied to the left end of the cord, eyelet on its right; the
                  part after the last dot is the extension. It can swap names, have its extension underlined, fold
                  its last extension under a flap (hidden extensions / a tag that lies), and come untied (05 breaks).
     the CODE CARD = the agreement (UTF-8). A translucent gold-edged card laid over the beads; in its "wrong" state
                  it turns terracotta, reads beads in pairs (UTF-16) and shows junk glyphs.
     STAMPS     = magic numbers: the first beads of a PNG / PDF / zip, filled gold, with the literal above them.
     the AGENT  = AI: a gold sparkle with a soft glow and a tiny bob (it comes down from the course lantern in 07).
   Colour law (whole lesson): cream numbers = raw bytes; GOLD = meaning (letters under the card, stamps, the card,
   the agent); TERRACOTTA = wrong or hidden (wrong card, junk glyphs, the lying tag's ring, warnings). No red/green.
   Pink only via K.petals on 01 and 08.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const pick = (v, d) => (v == null ? d : v);
  const c01 = (v) => K.clamp(+v || 0);
  const fnOr = (v, i, d) => (typeof v === 'function' ? c01(v(i)) : v == null ? d : c01(v));

  // ---------------------------------------------------------------- data (real bytes)
  const BYTES = [112, 114, 105, 110, 116, 40, 34, 104, 105, 34, 41, 10];            // print("hi")\n in UTF-8
  const LETTERS = ['p', 'r', 'i', 'n', 't', '(', '"', 'h', 'i', '"', ')', '\n'];    // '\n' draws a return mark
  const UTF16 = ['牰', '湩', '⡴', '栢', '≩', '੩'];                                    // the same 12 bytes read as UTF-16-LE pairs
  const STRINGS = {
    py: { bytes: BYTES, letters: LETTERS, tag: 'hello.py' },
    txt: { bytes: BYTES, letters: LETTERS, tag: 'hello.txt' },
    png: { bytes: [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13], stamp: 4, stampLabel: '‰PNG', tag: 'photo.png' },
    pdf: { bytes: [37, 80, 68, 70, 45, 49, 46, 55, 10, 37, 226, 227], stamp: 5, stampLabel: '%PDF-', tag: 'report.pdf' },
    zip: { bytes: [80, 75, 3, 4, 20, 0, 6, 0, 8, 0, 0, 0], stamp: 2, stampLabel: 'PK', tag: 'notes.docx' },
  };
  const ZWSP = [226, 128, 139];   // a zero-width space in UTF-8 (07's invisible cluster)

  // ---------------------------------------------------------------- palette, type, motion
  const palette = {
    cord: '#665C76',          // the string itself (lighter than line2 so it reads between beads)
    bead: C.tile,             // bead body
    beadEdge: '#5A5268',      // bead outline (a touch lighter than line2 so beads read on the ground)
    beadHi: 'rgba(242,231,213,0.10)',
    number: C.strong,         // raw byte values: cream
    letter: C.head,           // meaning under the code card: gold
    wrong: C.accent,          // wrong card, junk glyphs, lying tags
    stamp: C.head,            // magic-number beads
    tag: C.paper, tagShade: C.paperShade, tagInk: C.page, tagHole: '#B9AD98',
    card: C.tile, cardEdge: C.gold,
    agent: C.head,
    quiet: C.soft,
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },     // pills / labels (course minimum)
    read: { font: 'ui', weight: 600, size: 30 },      // anything to be read
    quiet: { font: 'ui', weight: 400, size: 30, color: C.soft },
    mono: { font: 'mono', weight: 600, size: 30 },    // literals: hello.py, ‰PNG, UTF-8
  };
  const motion = {
    move: 0.7,                          // structural moves (K.io 'io')
    pop: 0.5,
    beadStep: 0.08,                     // stagger between beads (lighting, dropping, letter crossfades)
    beadDrop: 60,                       // px a bead falls (at s 1) when it drops onto the cord
    tagSway: { speed: 0.9, amp: 0.012 },// idle sway of the tag (radians)
    agentBob: { speed: 1.8, amp: 5 },   // agent idle bob (px at s 1)
  };
  // where things sit. x, y = the CENTRE OF THE BEAD ROW (not of the tag + beads); s = scale.
  // The tag hangs to the left: its eyelet is at bead0.x - 62 s and its body runs ~250 s further left.
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    standard: { x: 950, y: 520, s: 1 },     // 03, 04: beads x 400-1500, tag body ~80-328
    title: { x: 1050, y: 640, s: 0.7 },     // 01: whole assembly optically centred on 960
    porter: { x: 900, y: 400, s: 0.8 },     // 05 start (programs live at x > 1400)
    stampTop: { x: 900, y: 300, s: 0.6 },   // 05 [[stamp]]: the plain-text string shrinks up
    stampMain: { x: 940, y: 600, s: 0.8 },  // 05 [[stamp]]: the PNG string
    stampMini: { x: 940, y: 790, s: 0.5 },  // 05 [[stamp]]: the PDF mini row
    lantern: { x: 1000, y: 560, s: 0.85 },  // 07 under the lantern
    end: { x: 1010, y: 220, s: 0.5 },       // 08 end-card emblem
    cardMini: { s: 0.42 },                  // 06 surprise cards: beads only (labels: 'none'), stamp label still legible
  };

  // ---------------------------------------------------------------- geometry
  /** geometry of a string centred (bead row) at (x, y), scale s, with n beads (+ ins extra beads inserted after
   *  index insAt, eased by insK). Returns {x, y, s, r, sp, beads:[{x, y, i, ins}], x0, x1, eye:{x, y}}. */
  function geo(x, y, s, n, ins) {
    s = pick(s, 1); n = pick(n, BYTES.length);
    const sp = 100 * s, r = 38 * s;
    const extra = ins ? ins.n * c01(ins.k) : 0;
    const total = (n - 1 + extra) * sp;
    const left = x - total / 2;
    const beads = [];
    for (let i = 0; i < n; i++) {
      const shift = ins && i > ins.at ? extra * sp : 0;
      beads.push({ x: left + i * sp + shift, y, i, ins: false });
    }
    if (ins) for (let j = 0; j < ins.n; j++) beads.push({ x: left + (ins.at + 1 + j * c01(ins.k)) * sp, y, i: j, ins: true });
    const x0 = left, x1 = left + total;
    return { x, y, s, r, sp, beads, x0, x1, eye: { x: x0 - 62 * s, y } };
  }

  // ---------------------------------------------------------------- one bead
  /** one bead at (x, y), radius r. o: {label, labelColor, size (font px), font, alpha, lit (0..1, raises the edge
   *  to gold), stamp (0..1 gold fill), dashed (faint dotted edge: invisible characters), ring (0..1 gold ring)} */
  function bead(x, y, r, o = {}) {
    const g = G();
    const a = pick(o.alpha, 1); if (a <= 0) return;
    g.save(); g.globalAlpha *= a;
    // body
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = r * 0.9; g.shadowOffsetY = r * 0.25;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = o.dashed ? K.rgba(palette.bead, 0.35) : palette.bead; g.fill();
    g.shadowColor = 'transparent';
    // stamp fill
    const st = c01(o.stamp);
    if (st > 0) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = K.rgba(palette.stamp, 0.22 * st); g.fill(); }
    // soft top-left highlight, like a glazed bead
    const hi = g.createRadialGradient(x - r * 0.35, y - r * 0.45, 0, x - r * 0.35, y - r * 0.45, r * 1.1);
    hi.addColorStop(0, palette.beadHi); hi.addColorStop(1, 'rgba(242,231,213,0)');
    g.fillStyle = hi; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    // edge
    const lit = Math.max(c01(o.lit), st);
    g.lineWidth = Math.max(1.5, r * 0.06);
    g.strokeStyle = o.edge || (lit > 0 ? K.mixColor(palette.beadEdge, C.gold, lit) : palette.beadEdge);
    if (o.dashed) g.setLineDash([r * 0.18, r * 0.16]);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    if (c01(o.ring) > 0) K.ring(x, y, r * 1.35, r * 1.35, c01(o.ring), { color: o.ringColor || C.head, w: Math.max(2, r * 0.09), rot: 0 });
    g.restore();
    if (o.label != null && o.label !== '') label(o.label, x, y, r, o, a);
  }
  /** a bead's text: numbers, letters, the newline mark */
  function label(s, x, y, r, o, a) {
    const size = pick(o.size, r * 0.74);
    if (s === '\n') {   // return mark, drawn (no font dependency)
      const g = G(); g.save(); g.globalAlpha *= a; g.strokeStyle = g.fillStyle = o.labelColor || palette.letter;
      g.lineWidth = Math.max(2, size * 0.1); g.lineCap = 'round'; g.lineJoin = 'round';
      const u = size * 0.42;
      g.beginPath(); g.moveTo(x + u * 0.8, y - u * 0.8); g.lineTo(x + u * 0.8, y + u * 0.25); g.lineTo(x - u * 0.7, y + u * 0.25); g.stroke();
      g.beginPath(); g.moveTo(x - u * 0.95, y + u * 0.25); g.lineTo(x - u * 0.45, y - u * 0.12); g.lineTo(x - u * 0.45, y + u * 0.62); g.closePath(); g.fill();
      g.restore(); return;
    }
    K.text(s, x, y + size * 0.36, { font: o.font || 'mono', weight: 600, size, color: o.labelColor || palette.number, align: 'center', alpha: a });
  }

  // ---------------------------------------------------------------- the tag
  /** the paper tag, eyelet at (x, y) (tie point), body hanging to the LEFT. Returns {x0, x1, y0, y1, ext:{x0,x1,y}, w, h}
   *  (axis-aligned approximation, ignoring the small tilt) in canvas coords.
   *  o: {name, to (second name), k (0..1 crossfade name -> to), s, alpha, rot (default -0.06), swing (0..1 entry,
   *      may overshoot: pass K.io(t, a, .8, 'back')), sway (multiplier, default 1), t (for idle sway),
   *      mark (0..1 gold underline of the extension), markColor, fold (0..1: a flap folds over the LAST extension,
   *      e.g. hello.py.txt -> hello.py), w (fixed width; default fits the longest name), ring (0..1 ring round ext),
   *      ringColor, size (font px at s 1, default 34)} */
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
    const xL = -w, xR = 0, yT = -h / 2, yB = h / 2, ch = 22 * s;   // local coords, eyelet side chamfered
    const textX = xL + pad, baseY = size * 0.36;
    // where the extension sits (for the mark / ring / fold), on the CURRENT visible name
    const cur = k < 0.5 ? name : to;
    const dot = cur.lastIndexOf('.');
    const extX0 = textX + (dot > 0 ? K.measure(cur.slice(0, dot), font) : 0), extX1 = textX + K.measure(cur, font);
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
    // body
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40 * s; g.shadowOffsetY = 14 * s;
    g.beginPath(); g.moveTo(xL + 10 * s, yT); g.lineTo(xR - ch, yT); g.lineTo(xR, yT + ch); g.lineTo(xR, yB - ch); g.lineTo(xR - ch, yB);
    g.lineTo(xL + 10 * s, yB); g.quadraticCurveTo(xL, yB, xL, yB - 10 * s); g.lineTo(xL, yT + 10 * s); g.quadraticCurveTo(xL, yT, xL + 10 * s, yT); g.closePath();
    g.fillStyle = K.rgba(palette.tag, 0.94); g.fill(); g.shadowColor = 'transparent';
    g.lineWidth = 1.2; g.strokeStyle = K.rgba(palette.tagShade, 0.9); g.stroke();
    // reinforced eyelet
    g.beginPath(); g.arc(holeX, 0, holeR * 1.9, 0, Math.PI * 2); g.fillStyle = palette.tagShade; g.fill();
    g.beginPath(); g.arc(holeX, 0, holeR, 0, Math.PI * 2); g.fillStyle = C.page; g.fill();
    // name (crossfade)
    if (!to || k < 1) K.text(name, textX, baseY, { ...font, color: palette.tagInk, alpha: to ? 1 - K.clamp(k * 2) : 1 });
    if (to && k > 0) K.text(to, textX, baseY, { ...font, color: palette.tagInk, alpha: K.clamp(k * 2 - 1) });
    // fold: a paper flap hinged at the eyelet side of the extension swings over it
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
    g.restore();
    // underline / ring of the extension, in canvas coords (tilt is small: follow it with the same rotation)
    const toCanvas = (lx, ly) => [x + lx * Math.cos(rot) - ly * Math.sin(rot), y + lx * Math.sin(rot) + ly * Math.cos(rot)];
    const m = c01(o.mark);
    if (m > 0 && dot >= 0) {
      g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
      K.mark(extX0, baseY + 12 * s, extX1 - extX0, m, { color: o.markColor || C.gold, w: 5 * s, alpha: 0.95 });
      g.restore();
    }
    const [ecx, ecy] = toCanvas((extX0 + extX1) / 2, 0);
    if (c01(o.ring) > 0) K.ring(ecx, ecy, (extX1 - extX0) / 2 + 6 * s, h * 0.4, c01(o.ring), { color: o.ringColor || C.accent, w: 4 * s, rot: rot });
    return { x0: x - w, x1: x, y0: y - h / 2, y1: y + h / 2, w, h, rot, ext: { x0: x + extX0, x1: x + extX1, cx: ecx, cy: ecy } };
  }

  // ---------------------------------------------------------------- the code card
  /** the code card laid over a bead row. (x, y) = centre, w x h. o: {alpha, wrong (0..1 terracotta + "WRONG CARD"),
   *  eyebrow (default 'CODE CARD'; wrong state shows 'WRONG CARD'), chip (small mono tag at the right, e.g.
   *  'UTF-16' / 'UTF-8'), chipK, s, glow (0..1)} */
  function codeCard(x, y, w, h, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const s = pick(o.s, 1), wr = c01(o.wrong);
    const edge = K.mixColor(palette.cardEdge, palette.wrong, wr);
    K.card(x - w / 2, y - h / 2, w, h, { r: 20 * s, fill: K.rgba(palette.card, 0.6), stroke: edge, lw: 2.5, alpha: a, glow: o.glow, shadow: false });
    // eyebrow sits on a little paper-free notch above the card's top-left corner
    const eb = wr > 0.5 ? 'WRONG CARD' : o.eyebrow || 'CODE CARD';
    K.eyebrow(eb, x - w / 2 + 6 * s, y - h / 2 - 14 * s, { size: Math.max(20, 22 * s), color: wr > 0.5 ? palette.wrong : C.gold, alpha: a });
    if (o.chip) {
      const ck = pick(o.chipK, 1);
      K.pill(o.chip, x + w / 2 - 90 * s, y - h / 2 - 26 * s, { size: 26, font: 'mono', color: wr > 0.5 ? palette.wrong : C.head, stroke: edge, fill: C.tile, alpha: a * ck });
    }
  }

  // ---------------------------------------------------------------- the string
  /** THE recurring object. Draws cord, beads, optional tag, code card, stamp, inserted cluster, scan bar.
   *  (x, y) = centre of the bead row, s = scale. Returns geometry (see geo) plus {tag: tagGeo, stampBox}.
   *  o: {
   *   t           scene time (idle sway of the tag)
   *   bytes       array of numbers (default print("hi")\n), or use preset: 'py' | 'txt' | 'png' | 'pdf' | 'zip' (M.STRINGS)
   *   letters     array of letters (default for 'py'/'txt')
   *   alpha       whole object
   *   cordK       0..1 the cord draws left -> right (default 1)
   *   beadK       number | (i) => 0..1: bead i drops in from above (default 1)
   *   lit         number | (i) => 0..1: ghost (0.15 alpha) -> lit (title card). Default 1 (lit)
   *   labels      'num' (default) | 'none'
   *   letterK     number | (i) => 0..1: number -> letter crossfade (needs letters)
   *   wrongK      0..1: letters -> UTF-16 junk glyphs (one per pair, centred between pair, terracotta) + pair brackets
   *   stamp       n first beads stamped (default from preset), stampK 0..1, stampLabel ('‰PNG'), stampRing 0..1
   *   emptyStamp  0..1 faint empty ring on bead 0 ("no stamp")
   *   ins         {at, bytes:[226,128,139], k}: faint dotted beads slide in after index at (invisible characters)
   *   scanK       0..1 gold scan bar sweeps the beads (Magika); hidden at 0 and 1
   *   card        {slide 0..1 (0 = parked 220 s above, 1 = on the beads), alpha, wrong, eyebrow, chip, chipK, shift (px notch)}
   *   tag         false | string | tag options ({name, to, k, swing, mark, fold, ring, ...}); default the preset's tag
   *   tagK        0..1 tag alpha, tie   0..1 cord between eyelet and bead 0 (1 solid; < 1 dashes and fades: 'breaks')
   *   tagOffset   {x, y} moves the tag away from the eyelet (lifted off in 05 [[breaks]])
   *   ringBeads   {i: k} gold ring round chosen beads
   *  } */
  function drawString(x, y, s, o = {}) {
    const g = G();
    s = pick(s, 1);
    const pre = typeof o.preset === 'string' ? STRINGS[o.preset] : STRINGS.txt;
    const bytes = o.bytes || pre.bytes;
    const letters = o.letters || pre.letters || null;
    const a = pick(o.alpha, 1); if (a <= 0) return geo(x, y, s, bytes.length);
    const ins = o.ins ? { at: o.ins.at, n: (o.ins.bytes || ZWSP).length, k: c01(o.ins.k), bytes: o.ins.bytes || ZWSP } : null;
    const G0 = geo(x, y, s, bytes.length, ins);
    const r = G0.r, cordK = pick(o.cordK, 1);
    const tie = pick(o.tie, 1);
    const lastX = G0.beads.reduce((m, b) => Math.max(m, b.x), -Infinity);
    g.save(); g.globalAlpha *= a;

    // cord: from the eyelet to just past the last bead
    const cx0 = G0.eye.x, cx1 = lastX + r + 28 * s;
    const tagOn = o.tag !== false;
    K.line(G0.x0 - r, y, K.lerp(G0.x0 - r, cx1, 1) , y, { k: cordK, color: palette.cord, w: Math.max(2, 4 * s) });
    if (tagOn && cordK > 0) {
      if (tie >= 1) K.line(cx0, y, G0.x0 - r, y, { color: palette.cord, w: Math.max(2, 4 * s) });
      else {   // untied: a dashed loose thread from bead 0 to wherever the tag now is
        const off = o.tagOffset || { x: 0, y: 0 };
        K.line(G0.x0 - r, y, cx0 + off.x, y + off.y, { color: C.soft, w: Math.max(2, 3 * s), dash: [8 * s, 10 * s], alpha: 0.4 + 0.4 * tie });
      }
    }
    // cord end knot
    if (cordK >= 1) { g.beginPath(); g.arc(cx1, y, 5 * s, 0, Math.PI * 2); g.fillStyle = palette.cord; g.fill(); }

    // code card (parked above, slides onto the beads); beads stay visible through it, letters sit on top
    const card = o.card;
    if (card && pick(card.alpha, 1) > 0) {
      const sl = c01(pick(card.slide, 1));
      const cw = (lastX - G0.x0) + r * 2 + 90 * s, chh = 120 * s;
      const ccx = (G0.x0 + lastX) / 2 + (card.shift || 0) * s;
      codeCard(ccx, y - (1 - sl) * 220 * s, cw, chh, { ...card, s });
    }

    // stamp label above the stamped beads
    const nSt = pick(o.stamp, pre.stamp || 0), stK = pick(o.stampK, nSt ? 1 : 0);
    let stampBox = null;
    if (nSt && stK > 0) {
      const sx0 = G0.beads[0].x - r * 1.2, sx1 = G0.beads[nSt - 1].x + r * 1.2;
      stampBox = { x0: sx0, x1: sx1, y0: y - r * 1.3, y1: y + r * 1.3 };
      K.card(sx0, y - r * 1.28, sx1 - sx0, r * 2.56, { r: r * 1.28, fill: K.rgba(palette.stamp, 0.08 * stK), stroke: K.rgba(palette.stamp, 0.7 * stK), lw: 2, shadow: false });
      const lab = o.stampLabel || pre.stampLabel;
      if (lab) K.text(lab, (sx0 + sx1) / 2, y - r * 1.28 - Math.max(14, 16 * s), { font: 'mono', weight: 700, size: Math.max(28, 36 * s), color: palette.stamp, align: 'center', alpha: stK });
      if (o.stampRing) K.ring((sx0 + sx1) / 2, y, (sx1 - sx0) / 2 + 22 * s, r * 1.9, c01(o.stampRing), { color: C.head, w: Math.max(3, 4 * s), rot: 0 });
    }

    // beads
    const pairK = c01(o.wrongK);
    G0.beads.forEach((b) => {
      if (b.ins) {
        const k = ins.k;
        bead(b.x, y, r, { dashed: true, alpha: 0.6 * k, edge: C.soft, label: o.labels === 'none' ? null : String(ins.bytes[b.i]), labelColor: C.soft, size: r * 0.62 });
        return;
      }
      const i = b.i;
      const drop = fnOr(o.beadK, i, 1); if (drop <= 0) return;
      const lit = fnOr(o.lit, i, 1);
      const by = y - (1 - K.ease.out(drop)) * motion.beadDrop * s;
      const al = Math.min(K.clamp(drop * 1.6), 0.15 + 0.85 * lit);
      const lk = letters ? fnOr(o.letterK, i, 0) : 0;
      bead(b.x, by, r, { alpha: al * (1 - 0.45 * pairK), stamp: i < nSt ? stK : 0, ring: o.ringBeads ? o.ringBeads[i] : 0 });
      if (o.labels === 'none') return;
      const numA = (1 - lk) * (1 - pairK) * al * lit;
      if (numA > 0.01) label(String(bytes[i]), b.x, by, r, { labelColor: i < nSt && stK > 0 ? palette.stamp : palette.number }, numA);
      const letA = lk * (1 - pairK) * al;
      if (letA > 0.01) label(letters[i], b.x, by, r, { labelColor: palette.letter, size: r * 0.9 }, letA);
    });
    if (o.emptyStamp) K.ring(G0.beads[0].x, y, r * 1.45, r * 1.45, c01(o.emptyStamp), { color: K.rgba(C.soft, 0.7), w: Math.max(2, 3 * s), rot: 0 });

    // wrong card: beads read in pairs -> one junk glyph per pair
    if (pairK > 0) {
      for (let p = 0; p * 2 + 1 < bytes.length; p++) {
        const b0 = G0.beads[p * 2], b1 = G0.beads[p * 2 + 1];
        const mx = (b0.x + b1.x) / 2, by = y + r + 16 * s;
        g.save(); g.globalAlpha *= pairK; g.strokeStyle = palette.wrong; g.lineWidth = Math.max(2, 3 * s); g.lineCap = 'round';
        g.beginPath(); g.moveTo(b0.x - r * 0.6, by - 8 * s); g.lineTo(b0.x - r * 0.6, by); g.lineTo(b1.x + r * 0.6, by); g.lineTo(b1.x + r * 0.6, by - 8 * s); g.stroke();
        g.restore();
        // the glyph sits on a small plate bridging the pair, so it reads as ONE character made of two beads
        K.card(mx - 34 * s, y - 34 * s, 68 * s, 68 * s, { r: 16 * s, fill: C.tile, stroke: palette.wrong, lw: 2, alpha: pairK, shadow: false });
        K.text(UTF16[p] || '?', mx, y + 14 * s, { font: '"Segoe UI Symbol", "Microsoft YaHei", "Nirmala UI", sans-serif', weight: 400, size: 40 * s, color: palette.wrong, align: 'center', alpha: pairK });
      }
    }

    // scan bar (Magika reading the bytes)
    const sk = pick(o.scanK, 0);
    if (sk > 0 && sk < 1) {
      const sx = K.lerp(G0.x0 - r * 1.5, lastX + r * 1.5, sk), fade = Math.min(1, sk * 8, (1 - sk) * 8);
      K.glow(sx, y, r * 2.4, C.head, 0.22 * fade);
      K.line(sx, y - r * 1.7, sx, y + r * 1.7, { color: C.head, w: Math.max(2, 3 * s), alpha: 0.65 * fade });
    }
    g.restore();

    // tag (drawn last so its shadow falls on the cord)
    let tg = null;
    if (tagOn && pick(o.tagK, 1) > 0) {
      const to = typeof o.tag === 'string' ? { name: o.tag } : (o.tag || { name: pre.tag || 'hello.txt' });
      const off = o.tagOffset || { x: 0, y: 0 };
      tg = tag(G0.eye.x + off.x, G0.eye.y + off.y, { t: o.t, s, ...to, alpha: a * pick(o.tagK, 1) });
    }
    return { ...G0, tag: tg, stampBox };
  }

  // ---------------------------------------------------------------- the agent
  /** AI: gold sparkle in a soft glow, tiny bob. o: {t, alpha, glow (0..1), color} */
  function agent(x, y, s, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const bob = o.t != null ? K.wave(o.t, motion.agentBob.speed, motion.agentBob.amp * s / 72) : 0;
    K.layer(a, () => {
      K.glow(x, y + bob, s * 1.5, C.head, 0.26 * pick(o.glow, 1));
      K.icon('sparkle', x, y + bob, s, { color: o.color || palette.agent, w: Math.max(2.5, s * 0.07) });
    });
  }

  // ---------------------------------------------------------------- small furniture
  /** quiet one-line caption centred at (x, y), Karla 30 soft (the "stored, moved, never understood" lines) */
  function quiet(s, x, y, o = {}) { return K.text(s, x, y, { ...type.quiet, align: 'center', ...o }); }
  /** literal mono chip (e.g. '‰PNG', 'UTF-8', 'cafÃ©'): pill in mono. o as K.pill */
  function chip(s, x, y, o = {}) { return K.pill(s, x, y, { size: 28, font: 'mono', color: C.head, ...o }); }

  window.M = { BYTES, LETTERS, UTF16, STRINGS, ZWSP, palette, type, motion, layout, geo, bead, tag, codeCard, drawString, agent, quiet, chip };
})();
