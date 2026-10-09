/* 01.04 Hidden files & dotfiles: shared drawing (window.M)
   ONE metaphor: THE SHOP CROSS-SECTION, built in 03 and kept at the same coordinates through 15.
     the SHOP FLOOR = what File Explorer / Finder shows: a card on the left with an Explorer window of visible items.
     the PORTER     = the OS file manager (01.02's porter: person icon + small terracotta cap). He walks the floor
                      and stops at the wall: the tour skips the back room.
     the BACK WALL  = a vertical hairline at x 1120; it turns dashed when the picture breaks (08).
     the DOOR       = in the wall, gold frame, "staff only" sign above. It can stand ajar (gold light in the gap)
                      and can lose its paint (08: only a dotted outline left, it was never a real door).
     the BACK ROOM  = darker card on the right with three wooden shelves: the project's hidden layer.
     the HOME ROOM  = a second back room (05, 09, 12, 13): your home folder (~), with a house icon over it.
     the DOT        = a leading dot in a name, always painted GOLD (M.dotName): the Mac/Linux sign.
     the FLAG       = a cream paper tag reading "Hidden" hung on an item (M.tag): the Windows sign.
     the DRAWER     = .env: a drawer under the bottom shelf holding a TERRACOTTA key, with no lock.
     the NOTES      = instruction files (CLAUDE.md, AGENTS.md...) pinned on the back-room wall: cream paper cards;
                      as ORDERS (10) they gain a terracotta edge + a terminal glyph; a STRANGER's note is dashed.
     the BOARD      = MCP configs: a wiring board with sockets and plugs.
     the STAFF      = AI agents: gold sparkles each carrying a small swaying lantern (the course's lantern).
     the OWNER      = you: a gold person icon labelled "you".
   Colour law (whole lesson): CREAM = literal names and raw things (file names, notes, tags); GOLD = the dot, attention,
   light, the staff and the owner; TERRACOTTA = secrets and danger (keys, crossed locks, orders, strangers' notes,
   "changed"). No red/green status colours. Pink only via K.petals on 01 and 15.
   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call: the runtime swaps canvases. */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const pick = (v, d) => (v == null ? d : v);
  const c01 = (v) => K.clamp(+v || 0);

  // ---------------------------------------------------------------- palette, type, motion
  const palette = {
    floor: '#1B1B2B', floorEdge: C.line2, room: '#131424', roomEdge: '#3A3550',
    wall: C.line2, floorLine: '#34314A',
    wood: '#3A2E2A', woodTop: '#5A4436', woodEdge: '#7A5C44',
    door: '#1E1E31', doorPanel: '#26263D', doorFrame: C.gold, light: C.head,
    signFill: '#2A2638', signInk: C.strong, signEdge: C.gold,
    paperDot: '#A8740E', paper: '#EFE3CE', paperShade: '#D9CAB0', ink: '#2C2A36', inkSoft: '#6E6457',
    dot: C.head, name: C.strong, quiet: C.soft,
    secret: C.accent, danger: C.accent, attention: C.head,
    porter: C.strong, cap: C.accent,
    staff: C.head, owner: C.head,
    ghost: C.quiet,
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },
    read: { font: 'ui', weight: 600, size: 30 },
    name: { font: 'mono', weight: 600, size: 30 },
    eyebrow: { size: 22 },
  };
  const motion = {
    move: 0.7, pop: 0.5, walk: 1.6,
    tagSway: { speed: 1.3, amp: 0.07 }, porterBob: { speed: 1.1, amp: 2 }, walkBob: { speed: 9, amp: 4 },
    staffBob: { speed: 1.6, amp: 5 }, lanternSway: { speed: 1.2, amp: 0.08 },
  };

  // ---------------------------------------------------------------- layout (1920 x 1080 canvas)
  const FRAME = { x0: 120, y0: 200, x1: 1840, y1: 890 };   // whole cross-section bbox (for M.place)
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    frame: FRAME,
    floor: { x: 120, y: 200, w: 960, h: 690, eyebrow: { x: 150, y: 244 } },
    explorer: { x: 170, y: 270, w: 860, h: 450 },             // content rect y 320-720
    exRows: [430, 610],                                      // icon centre y of the visible row / hidden (ghost) row
    exCols: [300, 500, 700, 900],                            // icon centre x of up to 4 items per row
    floorY: 860,                                             // the floor line (porter's feet, door sill)
    porter: { x: 980, s: 100 },                              // porter idle spot by the wall; y from floorY
    wall: { x: 1120, y0: 200, y1: 890 },
    door: { x: 1072, y: 530, w: 96, h: 330 },                // door top-left; sill on floorY
    sign: { x: 1120, y: 482 },                               // "staff only" plaque centre
    room: { x: 1160, y: 200, w: 680, h: 690, eyebrow: { x: 1190, y: 244 } },
    shelves: [370, 540, 710],                                // plank top y; planks x 1190-1810
    shelfX: [1190, 1810],
    slotX: [1290, 1580],                                     // item centre x on a shelf (2 slots); clears the sign
    drawer: { x: 1330, y: 736, w: 340, h: 80 },              // .env drawer, under the bottom shelf (opens 40 px down)
    notes: [[1300, 300], [1560, 300], [1300, 400], [1560, 400], [1500, 500]], // note centres (top half of room); the 5th fits the long copilot path
    board: { x: 1200, y: 550, w: 600 },                      // wiring board top-left (lower half of room; 4 rows end ~y 854)
    home: { x: 1100, y: 320, w: 740, h: 560, house: { x: 1170, y: 262 } },
    split: {                                                  // boxes for M.place: two copies side by side (10), shop left (05)
      left: { x: 120, y: 330, w: 820, h: 400 }, right: { x: 980, y: 330, w: 820, h: 400 },
      shop05: { x: 100, y: 330, w: 900, h: 420 },
    },
    cams: {                                                   // K.cam keys (x, y = world point at screen centre)
      wide: { x: 960, y: 540, z: 1 },
      room: { x: 1500, y: 560, z: 1.25 },
      floor: { x: 600, y: 545, z: 1.25 },
      drawer: { x: 1500, y: 680, z: 1.5 },
      door: { x: 1120, y: 640, z: 1.6 },
    },
    title: { door: { x: 1560, y: 360, s: 1 } },              // 01 / 15 door group (see M.doorGroup)
  };

  // ---------------------------------------------------------------- names with a painted dot
  /** mono name whose leading dots (start of the name or after a '/') are painted gold: ".env", "~/.config",
   *  ".cursor/rules/". Returns its width. o: {size (30), align ('left'|'center'|'right'), color (cream),
   *  dot (gold), dotK (0..1: 0 = dot in the name colour, 1 = painted gold), alpha, weight (600), glow (0..1 soft
   *  gold glow under each dot)} */
  function dotName(name, x, y, o = {}) {
    name = String(name);
    const size = pick(o.size, 30), weight = pick(o.weight, 600), a = pick(o.alpha, 1);
    if (a <= 0) return 0;
    const f = { font: 'mono', size, weight };
    const w = K.measure(name, f);
    const al = o.align || 'left';
    const x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    const base = o.color || palette.name;
    const dotCol = K.mixColor(base, o.dot || palette.dot, c01(pick(o.dotK, 1)));
    // runs of [text, isDot]
    const runs = []; let cur = '', curDot = null;
    for (let i = 0; i < name.length; i++) {
      const ch = name[i], isDot = ch === '.' && (i === 0 || name[i - 1] === '/');
      if (curDot !== null && isDot !== curDot) { runs.push([cur, curDot]); cur = ''; }
      cur += ch; curDot = isDot;
    }
    if (cur) runs.push([cur, curDot]);
    let off = 0;
    runs.forEach(([s, isDot]) => {
      const px = x0 + off;
      if (isDot && o.glow) K.glow(px + K.measure('.', f) / 2, y - size * 0.12, size * 0.9, palette.dot, 0.35 * c01(o.glow) * a);
      K.text(s, px, y, { ...f, color: isDot ? dotCol : base, alpha: a });
      off += K.measure(s, f);
    });
    return w;
  }

  // ---------------------------------------------------------------- the Hidden flag (Windows)
  /** a cream paper tag reading "Hidden", hung by a short string from (x, y) and swinging gently.
   *  o: {t (sway), label ('Hidden'), size (26), alpha, k (0..1 drop-in from 30 px above), sway (amp multiplier,
   *  default 1; 0 = still), phase, side (1 hangs down-right, -1 down-left)}. Returns {w, h}. */
  function tag(x, y, o = {}) {
    const k = c01(pick(o.k, 1)), a = pick(o.alpha, 1) * k;
    const size = pick(o.size, 26), label = pick(o.label, 'Hidden');
    const tw = K.measure(label, { font: 'ui', weight: 600, size }) + size * 1.5, th = size * 1.55;
    if (a <= 0) return { w: tw, h: th };
    const g = G();
    const rot = (o.t != null ? K.wave(o.t, motion.tagSway.speed, motion.tagSway.amp * pick(o.sway, 1), pick(o.phase, 0)) : 0) - 0.06 * pick(o.side, 1);
    K.layer(a, () => {
      K.at(x, y - (1 - k) * 30, 1, rot, () => {
        const str = size * 1.1, side = pick(o.side, 1), hx = side * tw * 0.28;
        // string (from the hang point to the tag's hole)
        g.save(); g.strokeStyle = K.rgba(C.body, 0.85); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(hx * 0.2, str * 0.7, hx, str + th * 0.2); g.stroke(); g.restore();
        g.beginPath(); g.arc(0, 0, 3, 0, 7); g.fillStyle = C.body; g.fill();
        // tag body: notched paper luggage tag, hole near the top, offset to the side so the item stays readable
        const bx = hx - tw / 2, by = str;
        g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 22; g.shadowOffsetY = 8;
        g.beginPath();
        g.moveTo(bx + th * 0.3, by); g.lineTo(bx + tw - th * 0.3, by); g.lineTo(bx + tw, by + th * 0.3);
        g.lineTo(bx + tw, by + th - 6); g.quadraticCurveTo(bx + tw, by + th, bx + tw - 6, by + th);
        g.lineTo(bx + 6, by + th); g.quadraticCurveTo(bx, by + th, bx, by + th - 6); g.lineTo(bx, by + th * 0.3); g.closePath();
        g.fillStyle = palette.paper; g.fill(); g.restore();
        g.beginPath(); g.arc(hx, by + th * 0.2, 3.5, 0, 7); g.fillStyle = palette.inkSoft; g.fill();
        K.text(label, hx, by + th * 0.5 + size * 0.48, { font: 'ui', weight: 600, size, color: palette.ink, align: 'center' });
      });
    });
    return { w: tw, h: th };
  }

  // ---------------------------------------------------------------- files and folders with names
  /** a folder or file with a dot-painted name. (x, y) = icon centre, s = icon size (80 shelf, 100 explorer, 60 tight).
   *  o: {kind ('folder'|'file'), name, label ('below'|'right'|'none'), size (name px, 30; 26 when tight),
   *  alpha, ghost (0..1: fades the item to a dashed outline: "it's there, just hidden"), tag (0..1 hangs the
   *  Hidden flag on the top-right corner), tagSide (1 default; -1 hangs it from the top-left, out to the left), t (for the tag sway), ring (0..1 gold ring: "this changed / look here"),
   *  ringColor, dotK (0..1 paint the dot), glow (0..1 gold glow behind), color (folder/file fill), ext (file badge)}
   *  Returns {x, y, s, w, h, nameX, nameY, corner: {x, y}} */
  function item(x, y, s, o = {}) {
    const kind = o.kind || 'folder', a = pick(o.alpha, 1);
    const w = kind === 'folder' ? s * 1.25 : s * 0.78, h = kind === 'folder' ? s * 0.9 : s;
    const lab = o.label || 'below', size = pick(o.size, 30);
    const nameX = lab === 'right' ? x + w / 2 + 18 : x;
    const nameY = lab === 'right' ? y + size * 0.36 : y + h / 2 + size + 10;
    const corner = { x: x + w / 2 - (kind === 'folder' ? 10 : s * 0.24), y: y - h / 2 + (kind === 'folder' ? h * 0.14 : 4) };
    const ret = { x, y, s, w, h, nameX, nameY, corner };
    if (a <= 0) return ret;
    const g = G();
    const ghost = c01(o.ghost);
    K.layer(a, () => {
      if (o.glow) K.glow(x, y, s * 1.2, palette.attention, 0.28 * c01(o.glow));
      // solid icon fades as the dashed ghost outline comes in
      K.layer(1 - ghost * 0.82, () => {
        if (kind === 'folder') K.folder(x, y, s, { color: o.color });
        else K.file(x, y, s, { color: o.color, ext: o.ext });
      });
      if (ghost > 0) K.layer(ghost, () => {
        g.save(); g.setLineDash([7, 7]); g.strokeStyle = K.rgba(palette.ghost, 0.9); g.lineWidth = 2.5;
        if (kind === 'folder') { K.rr(x - w / 2, y - h / 2 + h * 0.12, w, h * 0.88, 10); g.stroke(); K.rr(x - w / 2, y - h / 2, w * 0.45, h * 0.3, 8); g.stroke(); }
        else { K.rr(x - w / 2, y - h / 2, w, h, 10); g.stroke(); }
        g.restore();
      });
      if (o.name && lab !== 'none') dotName(o.name, nameX, nameY, { size, align: lab === 'right' ? 'left' : 'center', dotK: o.dotK, color: ghost > 0 ? K.mixColor(palette.name, palette.ghost, ghost) : undefined, alpha: 1 - ghost * 0.35 });
      const r = c01(o.ring);
      if (r > 0) {
        const tw = o.name ? K.measure(o.name, { font: 'mono', size, weight: 600 }) : 0;
        if (lab === 'right') K.ring(x - w / 2 + (w + 18 + tw) / 2, y, (w + 18 + tw) / 2 + 22, h / 2 + 18, r, { color: o.ringColor || palette.attention, w: 4, rot: 0 });
        else { const below = lab === 'below' && o.name; K.ring(x, y + (below ? size * 0.6 : 0), Math.max(w, below ? tw : 0) / 2 + 24, below ? h / 2 + size * 0.6 + 22 : h / 2 + 18, r, { color: o.ringColor || palette.attention, w: 4, rot: 0 }); }
      }
    });
    if (o.tag) tag(o.tagSide === -1 ? x - w / 2 + 14 : corner.x, corner.y, { k: o.tag, t: o.t, alpha: a, side: pick(o.tagSide, 1) });
    return ret;
  }

  // ---------------------------------------------------------------- the porter
  /** the porter (OS file manager), 01.02's look: person icon + small terracotta porter's cap, soft lamp glow.
   *  (x, y) = icon centre; s = icon size (100 on the floor, >= 80). Feet line: y + 0.25 s (use M.porterY(s)).
   *  o: {t (idle bob), alpha, walking (true: brisk step bob), face (1 brim right / -1 brim left), glow (0..1),
   *  caption (string or array of pills drawn above the head), captionK, question (0..1 '?' above)} */
  function porter(x, y, s, o = {}) {
    s = pick(s, layout.porter.s);
    const a = pick(o.alpha, 1);
    if (a <= 0) return;
    const g = G();
    const bob = o.t == null ? 0 : o.walking ? -Math.abs(K.wave(o.t, motion.walkBob.speed, motion.walkBob.amp)) : K.wave(o.t, motion.porterBob.speed, motion.porterBob.amp);
    const face = pick(o.face, 1);
    K.layer(a, () => {
      K.glow(x, y - s * 0.1, s * 1.2, C.head, 0.14 * pick(o.glow, 1));
      const hy = y + bob;
      K.icon('person', x, hy, s, { color: palette.porter, w: Math.max(3, s * 0.05) });
      const cy = hy - s * 0.42;
      K.rr(x - s * 0.17, cy - s * 0.09, s * 0.34, s * 0.12, s * 0.03); g.fillStyle = palette.cap; g.fill();
      const bx = face >= 0 ? x - s * 0.2 : x - s * 0.22;
      K.rr(bx, cy + s * 0.02, s * 0.42, s * 0.04, s * 0.02); g.fillStyle = K.mixColor(palette.cap, '#000000', 0.25); g.fill();
      const q = c01(o.question);
      if (q > 0) K.icon('question', x + s * 0.38, hy - s * 0.62, s * 0.42, { color: palette.danger, alpha: q, w: Math.max(3, s * 0.04) });
    });
    if (o.caption) {
      const caps = Array.isArray(o.caption) ? o.caption : [o.caption], ck = pick(o.captionK, 1), gap = 16;
      const ws = caps.map((c) => K.measure(c, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6);
      let cx = x - (ws.reduce((p, q) => p + q, 0) + gap * (caps.length - 1)) / 2;
      const cy = y - s * 0.95;
      caps.forEach((c, i) => { K.pill(c, cx + ws[i] / 2, cy, { size: 26, alpha: a * K.clamp(ck * caps.length - i), color: C.strong }); cx += ws[i] + gap; });
    }
  }
  const porterY = (s) => layout.floorY - pick(s, layout.porter.s) * 0.25;

  // ---------------------------------------------------------------- staff (AI agents) and owner (you)
  /** an AI agent: gold sparkle with a small swaying lantern held above-right, warm glow.
   *  (x, y) = sparkle centre; s = size (64 standard, 48 small). o: {t, i (phase index), alpha, lantern (0..1),
   *  label (26 px under it), dim (0..1 desaturate toward quiet)} */
  function staff(x, y, s, o = {}) {
    s = pick(s, 64);
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const i = pick(o.i, 0), t = pick(o.t, 0);
    const by = y + K.wave(t, motion.staffBob.speed, motion.staffBob.amp * s / 64, i * 1.7);
    const col = K.mixColor(palette.staff, palette.quiet, c01(o.dim));
    const lk = c01(pick(o.lantern, 1));
    K.layer(a, () => {
      K.glow(x, by, s * 1.4, palette.light, 0.18 + 0.12 * lk);
      K.icon('sparkle', x, by, s, { color: col, w: Math.max(3, s * 0.06) });
      if (lk > 0) {
        const lx = x + s * 0.62, ly = by - s * 0.82;
        const sw = K.wave(t, motion.lanternSway.speed, motion.lanternSway.amp, i * 2.1);
        K.layer(lk, () => {
          K.glow(lx, ly, s * 0.9, palette.light, 0.4);
          K.at(lx, ly - s * 0.3, 1, sw, () => K.icon('lantern', 0, s * 0.3, s * 0.7, { color: palette.light, w: 2.5 }));
        });
      }
      if (o.label) K.text(o.label, x, by + s * 0.75 + 20, { ...type.label, color: C.body, align: 'center' });
    });
  }
  /** you, the owner: gold person icon with a 'you' label under it. o: {alpha, t, label ('you'), s (80)} */
  function owner(x, y, s, o = {}) {
    s = pick(s, 80);
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const by = y + (o.t != null ? K.wave(o.t, motion.porterBob.speed, motion.porterBob.amp) : 0);
    K.layer(a, () => {
      K.glow(x, by, s * 1.3, palette.owner, 0.22);
      K.icon('person', x, by, s, { color: palette.owner, w: Math.max(3, s * 0.055) });
      K.text(pick(o.label, 'you'), x, by + s * 0.3 + 34, { ...type.read, color: palette.owner, align: 'center' });
    });
  }

  // ---------------------------------------------------------------- the door and its sign
  /** the back-room door, face on, set in the wall. (x, y) = top-left, w x h (96 x 330 standard).
   *  o: {alpha, open (0..1: ajar, the panel swings toward its left hinge and gold light shows in the gap),
   *  light (0..1 light strength through the gap, default = open), paint (1 = solid door; 0 = only a dotted
   *  outline: "there's no door, really"), glow (0..1 gold outline pulse), k (0..1 build-in: frame draws, panel fades)} */
  function door(x, y, w, h, o = {}) {
    const a = pick(o.alpha, 1); if (a <= 0) return;
    const g = G();
    const open = c01(o.open), paint = c01(pick(o.paint, 1)), k = c01(pick(o.k, 1));
    const light = c01(pick(o.light, open));
    K.layer(a, () => {
      // light spilling from behind the gap
      if (light > 0) {
        K.glow(x + w * 0.8, y + h * 0.5, h * 0.75, palette.light, 0.32 * light);
        g.save(); K.rr(x + 4, y + 4, w - 8, h - 4, 4); g.clip();
        const gr = g.createLinearGradient(x, 0, x + w, 0);
        gr.addColorStop(0, K.rgba(palette.light, 0.15 * light)); gr.addColorStop(1, K.rgba(palette.light, 0.85 * light));
        g.fillStyle = gr; g.fillRect(x, y, w, h); g.restore();
      }
      // the panel: narrows toward the hinge as it opens
      const pw = (w - 8) * (1 - 0.42 * open);
      K.layer(paint * k, () => {
        g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 10;
        K.rr(x + 4, y + 4, pw, h - 4, 4); g.fillStyle = palette.door; g.fill(); g.restore();
        // two inset panels
        g.save(); g.strokeStyle = K.rgba(palette.doorFrame, 0.35); g.lineWidth = 1.5;
        K.rr(x + 4 + pw * 0.18, y + h * 0.08, pw * 0.64, h * 0.36, 3); g.stroke();
        K.rr(x + 4 + pw * 0.18, y + h * 0.52, pw * 0.64, h * 0.4, 3); g.stroke(); g.restore();
        // knob
        const kx = x + 4 + pw * 0.82, ky = y + h * 0.5;
        K.glow(kx, ky, 14, palette.doorFrame, 0.5);
        g.beginPath(); g.arc(kx, ky, 5, 0, 7); g.fillStyle = palette.doorFrame; g.fill();
      });
      // frame: solid gold when painted, dotted when only a display choice
      const gl = c01(o.glow);
      g.save();
      if (gl > 0) { g.shadowColor = K.rgba(C.head, 0.8 * gl); g.shadowBlur = 30; }
      g.strokeStyle = K.mixColor(palette.doorFrame, C.head, gl); g.lineWidth = 3 + gl * 1.5;
      if (paint < 1) g.setLineDash([6 + paint * 40, 10 * (1 - paint) + 0.01]);
      const per = 2 * h + w, len = per * k;
      g.beginPath(); g.moveTo(x, y + h);
      // frame drawn up the left jamb, across the head, down the right jamb
      const segs = [[x, y + h, x, y], [x, y, x + w, y], [x + w, y, x + w, y + h]];
      let left = len;
      for (const [x1, y1, x2, y2] of segs) {
        const sl = Math.hypot(x2 - x1, y2 - y1), u = K.clamp(left / sl);
        if (u > 0) g.lineTo(K.lerp(x1, x2, u), K.lerp(y1, y2, u));
        left -= sl; if (left <= 0) break;
      }
      g.stroke(); g.restore();
    });
  }
  /** the "staff only" plaque hung above the door: tile plaque, gold edge, two hanging cords to a nail.
   *  (x, y) = plaque centre. o: {text ('staff only'), size (28), alpha, k (0..1 pop: scale 0.85 -> 1 + fade; feed it
   *  K.io(t, a, .5, 'back') for the scene's one overshoot), note (small 26 px quiet label under the door-side,
   *  e.g. 'display choice'), noteK, dim (0..1 toward quiet)} Returns {w, h}. */
  function sign(x, y, o = {}) {
    const size = pick(o.size, 28), text = pick(o.text, 'staff only');
    const w = K.measure(text, { font: 'ui', weight: 600, size }) + size * 1.4, h = size * 1.75;
    const k = pick(o.k, 1), a = pick(o.alpha, 1) * K.clamp(k * 1.4);
    if (a <= 0) return { w, h };
    const g = G();
    const ink = K.mixColor(palette.signInk, palette.quiet, c01(o.dim));
    K.layer(a, () => K.at(x, y, 0.85 + 0.15 * k, 0, () => {
      // cords to a nail
      g.save(); g.strokeStyle = K.rgba(palette.signEdge, 0.6); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-w * 0.32, -h / 2); g.lineTo(0, -h / 2 - 26); g.lineTo(w * 0.32, -h / 2); g.stroke();
      g.beginPath(); g.arc(0, -h / 2 - 27, 3, 0, 7); g.fillStyle = palette.signEdge; g.fill(); g.restore();
      K.card(-w / 2, -h / 2, w, h, { r: 8, fill: palette.signFill, stroke: K.mixColor(palette.signEdge, palette.quiet, c01(o.dim)), lw: 2, shadow: true });
      K.text(text, 0, size * 0.36, { font: 'ui', weight: 600, size, color: ink, align: 'center', upper: false });
    }));
    if (o.note) K.text(o.note, x, y + h / 2 + 34 + 4, { ...type.label, color: C.soft, align: 'center', alpha: pick(o.alpha, 1) * c01(pick(o.noteK, 1)) });
    return { w, h };
  }
  /** door + sign as one free-standing group (title card 01, end card 15, the doors of 14).
   *  (x, y) = door top-left; s scales the 96 x 330 door. o: {alpha, open, light, glow, sign (true; false hides),
   *  signText, signSize, t (light flicker-free breathing)} */
  function doorGroup(x, y, s, o = {}) {
    s = pick(s, 1);
    const D = layout.door;
    K.at(x, y, s, 0, () => {
      // threshold line and a short wall stub so it never floats
      K.line(-40, D.h, D.w + 40, D.h, { color: palette.floorLine, w: 3, alpha: pick(o.alpha, 1) });
      door(0, 0, D.w, D.h, { alpha: o.alpha, open: o.open, light: o.light, glow: o.glow });
      if (o.sign !== false) sign(D.w / 2, -48, { alpha: o.alpha, text: o.signText, size: pick(o.signSize, 28) });
    });
  }

  // ---------------------------------------------------------------- shelves, drawer, notes, board
  /** one wooden shelf plank with two brackets. (x0..x1) at plank top y. o: {alpha, k (0..1 draws left to right)} */
  function shelf(x0, x1, y, o = {}) {
    const a = pick(o.alpha, 1), k = c01(pick(o.k, 1)); if (a <= 0 || k <= 0) return;
    const g = G(), xe = K.lerp(x0, x1, k);
    K.layer(a, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
      K.rr(x0, y, xe - x0, 12, 3); g.fillStyle = palette.wood; g.fill(); g.restore();
      K.line(x0 + 4, y + 1.5, xe - 4, y + 1.5, { color: K.rgba(palette.woodEdge, 0.9), w: 2 });
      [x0 + 40, x1 - 40].forEach((bx) => { if (bx < xe) { g.fillStyle = palette.wood; g.beginPath(); g.moveTo(bx - 6, y + 12); g.lineTo(bx + 6, y + 12); g.lineTo(bx, y + 34); g.closePath(); g.fill(); } });
    });
  }
  /** centre of an item sitting on shelf i (0 top .. 2 bottom), slot j (0 left, 1 right), for icon size s (80) */
  const slot = (i, j, s) => ({ x: layout.slotX[j], y: layout.shelves[i] - pick(s, 80) * 0.45 - 6 });

  /** the .env drawer (secrets): a wooden drawer under the bottom shelf that slides open to show a terracotta key.
   *  (x, y) = closed front top-left, w x h (340 x 84 standard). o: {alpha, open (0..1 slides 70 px down/out and
   *  shows the tray), key (0..1 the key inside), lock (0..1 a lock icon floats over the drawer), crossed (0..1 the
   *  lock gets a terracotta cross: "no lock"), label (name on the front plate, default '.env'), t}
   *  Returns {keyX, keyY, lockX, lockY, front: {x, y, w, h}} */
  function drawer(x, y, w, h, o = {}) {
    const a = pick(o.alpha, 1);
    const open = c01(o.open), dy = open * 40;
    const keyX = x + w * 0.5, keyY = y + dy - 34 * open, lockX = x + w + 70, lockY = y + dy + h * 0.4;
    const ret = { keyX, keyY, lockX, lockY, front: { x, y: y + dy, w, h } };
    if (a <= 0) return ret;
    const g = G();
    K.layer(a, () => {
      // tray (seen from slightly above) revealed as the drawer comes out
      if (open > 0) {
        const ty = y + dy - 62 * open;
        K.rr(x + 10, ty, w - 20, 62 * open + 6, 6); g.fillStyle = '#2A221F'; g.fill();
        g.save(); g.strokeStyle = K.rgba(palette.woodEdge, 0.7); g.lineWidth = 2; K.rr(x + 10, ty, w - 20, 62 * open + 6, 6); g.stroke(); g.restore();
        const kk = c01(o.key) * open;
        if (kk > 0) { K.glow(keyX, keyY, 70, palette.secret, 0.35 * kk); K.icon('key', keyX, keyY, 60, { color: palette.secret, alpha: kk, w: 5 }); }
      }
      // front
      g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
      K.rr(x, y + dy, w, h, 8); g.fillStyle = palette.wood; g.fill(); g.restore();
      K.line(x + 8, y + dy + 2, x + w - 8, y + dy + 2, { color: K.rgba(palette.woodEdge, 0.9), w: 2 });
      // name plate + handle
      const label = pick(o.label, '.env');
      const pw = K.measure(label, { font: 'mono', size: 30, weight: 600 }) + 36;
      K.rr(x + w / 2 - pw / 2, y + dy + h / 2 - 22, pw, 44, 6); g.fillStyle = palette.paper; g.fill();
      dotName(label, x + w / 2, y + dy + h / 2 + 10, { size: 30, align: 'center', color: palette.ink, dot: palette.paperDot });
      K.rr(x + w / 2 - 40, y + dy + h - 14, 80, 7, 3.5); g.fillStyle = palette.woodEdge; g.fill();
    });
    const lk = c01(o.lock);
    if (lk > 0) K.layer(a * lk, () => {
      K.icon('lock', lockX, lockY, 64, { color: C.strong, w: 4 });
      const cr = c01(o.crossed);
      if (cr > 0) K.icon('cross', lockX, lockY + 6, 84 * (0.8 + 0.2 * cr), { color: palette.danger, alpha: cr, w: 6 });
    });
    return ret;
  }

  /** an instruction file pinned to the wall: paper note with a gold pin and the file name in mono ink.
   *  (x, y) = centre. o: {kind ('note' | 'order' | 'stranger'), size (26), alpha, k (0..1 pin-in: drops 20 px and
   *  fades), rot (radians, default small per-name tilt), ring (0..1 gold outline), dim (0..1), orderK (0..1 crossfade
   *  note -> order for 10)} order = terracotta left edge + terminal glyph (an agent runs it); stranger = dashed
   *  terracotta edge, darker paper. Returns {w, h}. */
  function note(name, x, y, o = {}) {
    const size = pick(o.size, 26);
    const kind = o.kind || 'note';
    const ok = kind === 'order' ? c01(pick(o.orderK, 1)) : 0;
    const tw = K.measure(name, { font: 'mono', size, weight: 600 });
    const w = tw + size * 1.4 + ok * size * 1.6, h = size * 2.3;
    const k = c01(pick(o.k, 1)), a = pick(o.alpha, 1) * k;
    if (a <= 0) return { w, h };
    const g = G();
    let hsh = 0; for (let i = 0; i < name.length; i++) hsh = (hsh * 31 + name.charCodeAt(i)) % 997;
    const rot = pick(o.rot, ((hsh % 7) - 3) * 0.008);
    K.layer(a * (1 - 0.6 * c01(o.dim)), () => K.at(x, y - (1 - k) * 20, 1, rot, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 26; g.shadowOffsetY = 10;
      K.rr(-w / 2, -h / 2, w, h, 6); g.fillStyle = kind === 'stranger' ? '#D9CBB2' : palette.paper; g.fill(); g.restore();
      // folded corner
      g.beginPath(); g.moveTo(w / 2 - 16, h / 2); g.lineTo(w / 2, h / 2 - 16); g.lineTo(w / 2, h / 2 - 6); g.quadraticCurveTo(w / 2, h / 2, w / 2 - 6, h / 2); g.closePath(); g.fillStyle = palette.paperShade; g.fill();
      if (ok > 0) {
        K.layer(ok, () => {
          g.save(); K.rr(-w / 2, -h / 2, w, h, 6); g.clip(); g.fillStyle = palette.danger; g.fillRect(-w / 2, -h / 2, 9, h); g.restore();
          K.icon('terminal', w / 2 - size * 1.05, 2, size * 1.25, { color: palette.danger, w: 2.5 });
        });
      }
      if (kind === 'stranger') { g.save(); g.setLineDash([8, 6]); g.strokeStyle = palette.danger; g.lineWidth = 2.5; K.rr(-w / 2, -h / 2, w, h, 6); g.stroke(); g.restore(); }
      const tx = -w / 2 + size * 0.7 + ok * 6;
      dotName(name, tx, size * 0.36, { size, color: palette.ink, dot: palette.paperDot });
      // pin
      g.beginPath(); g.arc(0, -h / 2 + 2, 7, 0, 7); g.fillStyle = C.gold; g.fill();
      g.beginPath(); g.arc(-2, -h / 2, 2.5, 0, 7); g.fillStyle = 'rgba(255,240,200,.7)'; g.fill();
      const r = c01(o.ring);
      if (r > 0) { g.save(); g.shadowColor = K.rgba(C.head, 0.7); g.shadowBlur = 20; g.strokeStyle = K.rgba(C.head, r); g.lineWidth = 3; K.rr(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 10); g.stroke(); g.restore(); }
    }));
    return { w, h };
  }

  /** the MCP wiring board: a dark panel with a row per socket: a ring socket, a plug that slides in, a mono name.
   *  (x, y) = top-left, w = width (600). sockets: [{label, k (0..1 row reveal), plug (0..1 plug slides in), ring
   *  (0..1 gold outline on the row), sub (quiet 26 px text after the name, e.g. '(AppData)')}].
   *  o: {alpha, title ('tool wiring'), k (0..1 panel)}. Returns {h, rowY(i), socketX} */
  function board(x, y, w, sockets, o = {}) {
    const rowH = 58, head = 56, h = head + sockets.length * rowH + 16;
    w = Math.max(w, ...sockets.map((s) => 150 + K.measure(s.label, { font: 'mono', size: 26, weight: 600 }) + (s.sub ? 12 + K.measure(s.sub, { font: 'ui', size: 26 }) : 0) + 30));
    const rowY = (i) => y + head + rowH * (i + 0.5);
    const socketX = x + 50;
    const ret = { w, h, rowY, socketX };
    const a = pick(o.alpha, 1) * c01(pick(o.k, 1)); if (a <= 0) return ret;
    const g = G();
    K.layer(a, () => {
      K.card(x, y, w, h, { r: 14, fill: '#1C1A26', stroke: palette.roomEdge });
      // little screws
      [[x + 14, y + 14], [x + w - 14, y + 14], [x + 14, y + h - 14], [x + w - 14, y + h - 14]].forEach(([sx, sy]) => { g.beginPath(); g.arc(sx, sy, 3.5, 0, 7); g.fillStyle = C.line2; g.fill(); });
      K.eyebrow(pick(o.title, 'tool wiring'), x + 32, y + 38, { size: 22 });
      sockets.forEach((s, i) => {
        const rk = c01(pick(s.k, 1)); if (rk <= 0) return;
        const ry = rowY(i);
        K.layer(rk, () => {
          if (s.ring) { K.rr(x + 14, ry - 24, w - 28, 48, 24); g.fillStyle = K.rgba(C.head, 0.12 * c01(s.ring)); g.fill(); g.save(); g.strokeStyle = K.rgba(C.head, 0.8 * c01(s.ring)); g.lineWidth = 2; K.rr(x + 14, ry - 24, w - 28, 48, 24); g.stroke(); g.restore(); }
          g.beginPath(); g.arc(socketX, ry, 15, 0, 7); g.fillStyle = '#0E0F1A'; g.fill(); g.strokeStyle = C.gold; g.lineWidth = 2.5; g.stroke();
          const pk = c01(s.plug);
          if (pk > 0) {
            const px = socketX + 34 - 18 * pk;
            g.fillStyle = C.head; K.rr(px - 4, ry - 10, 26, 20, 4); g.fill();
            K.line(px + 22, ry, px + 52, ry, { color: C.head, w: 4 });
            g.fillStyle = C.head; g.fillRect(px - 12 + 4 * (1 - pk), ry - 6, 8, 3); g.fillRect(px - 12 + 4 * (1 - pk), ry + 3, 8, 3);
          }
          const nw = dotName(s.label, socketX + 100, ry + 10, { size: 26 });
          if (s.sub) K.text(s.sub, socketX + 100 + nw + 12, ry + 10, { ...type.label, weight: 400, color: C.soft });
        });
      });
    });
    return ret;
  }

  // ---------------------------------------------------------------- the shop cross-section
  const DEFAULT_ITEMS = [
    { name: 'src', kind: 'folder' }, { name: 'app.py', kind: 'file', ext: 'py' }, { name: 'README.md', kind: 'file' },
  ];
  const DEFAULT_HIDDEN = [
    { name: '.git', kind: 'folder' }, { name: '.env', kind: 'file' }, { name: '.vscode', kind: 'folder' },
  ];
  /** THE SHOP CROSS-SECTION, the standing set for 03-13. Draws (back to front): back room, shop floor + Explorer
   *  window, floor line, wall, door, sign, shelves, porter. Everything takes 0..1 build values so 03 can assemble it
   *  and later scenes just pass defaults. All coordinates are layout.* (never move them).
   *  o: {t, alpha,
   *    floorK (0..1 floor card rises), explorerK (0..1 window), items (visible Explorer items, default src / app.py /
   *      README.md; each {name, kind, ext, k, ring, glow}), itemsK (0..1 staggered reveal),
   *    hidden (0..1: shows the hidden row as dashed ghosts), hiddenItems (default .git .env .vscode; each may set
   *      {tag, ring, ghost} to override), floorDim (0..1 dims the floor),
   *    wallK (0..1 wall draws top -> bottom), wallDash (0..1 crossfade solid -> dashed),
   *    doorK (0..1), door: {open, light, paint, glow} (M.door options), signK (0..1, pass an eased 'back' value
   *      for the pop), sign: {text, note, noteK, dim},
   *    roomK (0..1 back room fades in), roomDim (0..1), shelvesK (0..1, or [k0, k1, k2]), roomEyebrow ('BACK ROOM'),
   *    floorEyebrow ('SHOP FLOOR'), eyebrowK (0..1),
   *    porter: false | {x, s, walking, face, caption, captionK, alpha} (default: idle at layout.porter.x)}
   *  Returns geometry: {explorer: content rect, itemPos(i), hiddenPos(i), door: {x, y, w, h}, slot, floorY, porterY} */
  function shop(t, o = {}) {
    const a = pick(o.alpha, 1);
    const L = layout, Fl = L.floor, R = L.room, D = L.door;
    const exItems = o.items || DEFAULT_ITEMS, hidItems = o.hiddenItems || DEFAULT_HIDDEN;
    const itemPos = (i) => ({ x: L.exCols[i], y: L.exRows[0] });
    const hiddenPos = (i) => ({ x: L.exCols[i], y: L.exRows[1] });
    const ret = { explorer: null, itemPos, hiddenPos, door: { ...D }, slot, floorY: L.floorY, porterY: porterY() };
    if (a <= 0) return ret;
    K.layer(a, () => {
      // --- back room (behind the wall)
      const rk = c01(pick(o.roomK, 1));
      if (rk > 0) K.layer(rk * (1 - 0.6 * c01(o.roomDim)), () => {
        K.card(R.x, R.y, R.w, R.h, { r: 24, fill: palette.room, stroke: palette.roomEdge });
        K.glow(R.x + 120, L.floorY - 160, 360, palette.light, 0.05 + 0.12 * c01(o.door && o.door.open));
        K.eyebrow(pick(o.roomEyebrow, 'BACK ROOM'), R.eyebrow.x, R.eyebrow.y, { size: 22, alpha: c01(pick(o.eyebrowK, 1)) });
        const sk = o.shelvesK == null ? [1, 1, 1] : Array.isArray(o.shelvesK) ? o.shelvesK : [0, 1, 2].map((i) => K.clamp(o.shelvesK * 3 - i));
        L.shelves.forEach((y, i) => shelf(L.shelfX[0], L.shelfX[1], y, { k: sk[i] }));
        K.line(R.x + 30, L.floorY, R.x + R.w - 30, L.floorY, { color: palette.floorLine, w: 2 });
      });
      // --- shop floor
      const fk = c01(pick(o.floorK, 1));
      if (fk > 0) K.layer(fk * (1 - 0.6 * c01(o.floorDim)), () => {
        const g = G(); g.save(); g.translate(0, (1 - fk) * 24);
        K.card(Fl.x, Fl.y, Fl.w, Fl.h, { r: 24, fill: palette.floor, stroke: palette.floorEdge });
        K.eyebrow(pick(o.floorEyebrow, 'SHOP FLOOR'), Fl.eyebrow.x, Fl.eyebrow.y, { size: 22, alpha: c01(pick(o.eyebrowK, 1)) });
        K.line(Fl.x + 30, L.floorY, Fl.x + Fl.w - 10, L.floorY, { color: palette.floorLine, w: 2 });
        const ek = c01(pick(o.explorerK, 1));
        if (ek > 0) {
          const E = L.explorer;
          ret.explorer = K.win(E.x, E.y, E.w, E.h, { kind: 'explorer', title: 'my-project', titleSize: 26, alpha: ek });
          K.layer(ek, () => {
            const ik = pick(o.itemsK, 1);
            exItems.forEach((it, i) => {
              const p = itemPos(i), k = K.clamp(ik * exItems.length - i);
              if (k > 0) item(p.x, p.y, 96, { kind: it.kind, ext: it.ext, name: it.name, alpha: k * pick(it.k, 1), ring: it.ring, glow: it.glow, size: 26 });
            });
            const hk = c01(o.hidden);
            if (hk > 0) {
              K.line(E.x + 30, (L.exRows[0] + L.exRows[1]) / 2 + 8, E.x + E.w - 30, (L.exRows[0] + L.exRows[1]) / 2 + 8, { color: C.line, w: 1.5, dash: [6, 8], alpha: hk });
              hidItems.forEach((it, i) => {
                const p = hiddenPos(i), k = K.clamp(hk * hidItems.length - i);
                if (k > 0) item(p.x, p.y, 96, { kind: it.kind, ext: it.ext, name: it.name, alpha: k * pick(it.k, 1), ghost: pick(it.ghost, 1), tag: it.tag, t, ring: it.ring, size: 26 });
              });
            }
          });
        } else ret.explorer = { x: L.explorer.x, y: L.explorer.y + 50, w: L.explorer.w, h: L.explorer.h - 50 };
        g.restore();
      });
      // --- wall
      const wk = c01(pick(o.wallK, 1));
      if (wk > 0) {
        const W = L.wall, wd = c01(o.wallDash);
        if (wd < 1) K.line(W.x, W.y0, W.x, D.y - 60, { color: palette.wall, w: 4, k: K.clamp(wk * 1.4), alpha: 1 - wd });
        if (wd > 0) K.line(W.x, W.y0, W.x, D.y - 60, { color: palette.wall, w: 4, k: K.clamp(wk * 1.4), alpha: wd, dash: [10, 14] });
        if (wk > 0.7) {
          const k2 = K.clamp((wk - 0.7) / 0.3);
          if (wd < 1) K.line(W.x, L.floorY, W.x, W.y1, { color: palette.wall, w: 4, k: k2, alpha: 1 - wd });
          if (wd > 0) K.line(W.x, L.floorY, W.x, W.y1, { color: palette.wall, w: 4, k: k2, alpha: wd, dash: [10, 14] });
        }
      }
      // --- door + sign
      const dk = c01(pick(o.doorK, 1));
      if (dk > 0) door(D.x, D.y, D.w, D.h, { ...(o.door || {}), k: dk });
      const sk2 = pick(o.signK, 1);
      if (sk2 > 0) sign(L.sign.x, L.sign.y, { ...(o.sign || {}), k: sk2 });
      // --- porter
      if (o.porter !== false) {
        const P = o.porter || {};
        const s = pick(P.s, L.porter.s);
        porter(pick(P.x, L.porter.x), porterY(s), s, { t, walking: P.walking, face: pick(P.face, -1), caption: P.caption, captionK: P.captionK, alpha: pick(P.alpha, 1), question: P.question });
      }
    });
    return ret;
  }

  /** an icon resting on a shelf with a 26-30 px label to its right (03: gear 'settings', clock 'history',
   *  puzzle 'supplies', key 'keys'). o: {alpha, k (0..1 pop), color (gold; pass palette.secret for keys),
   *  size (label px, 30), s (icon size, 64)} */
  function shelfIcon(icon, label, i, j, o = {}) {
    const s = pick(o.s, 64), p = slot(i, j, s);
    const k = c01(pick(o.k, 1)), a = pick(o.alpha, 1) * k; if (a <= 0) return p;
    K.layer(a, () => K.at(p.x, p.y + (1 - k) * 14, () => {
      K.glow(0, 0, s, o.color || C.head, 0.12);
      K.icon(icon, 0, 0, s, { color: o.color || C.head, w: 3.5 });
      if (label) K.text(label, s * 0.6 + 14, pick(o.size, 30) * 0.36, { font: 'ui', weight: 600, size: pick(o.size, 30), color: C.strong });
    }));
    return p;
  }

  // ---------------------------------------------------------------- the home back room
  /** where the home room's items sit (centres). keys: config, ssh, aws, claude, codex, appdata, rooms (pill column x, ys) */
  const HOME = {
    config: { x: 1235, y: 450 },
    loose: [ { name: '.ssh', x: 1420, y: 435 }, { name: '.aws', x: 1560, y: 450 }, { name: '.claude', x: 1705, y: 432 }, { name: '.codex', x: 1440, y: 565 }, { name: '.cursor', x: 1640, y: 565 } ],
    appdata: { x: 1235, y: 735 },
    rooms: { x: 1590, ys: [670, 742, 814] },
  };
  /** THE HOME BACK ROOM (your home folder, ~): house icon + card + "~" eyebrow, with ~/.config, loose dot folders and
   *  AppData (+ its three rooms). Default box layout.home (1100, 320, 740 x 560); pass {x, y, w, h} ignored: the
   *  item positions are fixed to that box (draw it inside K.at / M.place to move it).
   *  o: {t, alpha, k (0..1 card + house), subK (0..1 'your settings, not one project's'), configK, looseK (0..1
   *  staggered), appdataK, roomsK (0..1 staggered), loose (names, default .ssh .aws .claude .codex; '.cursor' has a 5th spot for 09), seed (rng for the
   *  loose offsets, 7), books (0..1: a small gold book icon on .claude / .codex: skills and memory),
   *  ring: {name: 0..1} gold rings on items (keys: '~/.config', '.ssh', ..., 'AppData'), dim (0..1), roomsText
   *  (array of 3 pill labels)} Returns {pos(name) -> {x, y}} */
  function home(t, o = {}) {
    const Hm = layout.home, a = pick(o.alpha, 1);
    const names = o.loose || ['.ssh', '.aws', '.claude', '.codex'];
    const rnd = K.rng(pick(o.seed, 7));
    const loose = names.map((n, i) => { const b = HOME.loose.find((q) => q.name === n) || HOME.loose[i % HOME.loose.length]; return { name: n, x: b.x + (rnd() - 0.5) * 24, y: b.y + (rnd() - 0.5) * 18, rot: (rnd() - 0.5) * 0.12 }; });
    const pos = (n) => {
      if (n === '~/.config') return { ...HOME.config };
      if (n === 'AppData') return { ...HOME.appdata };
      const l = loose.find((q) => q.name === n); return l ? { x: l.x, y: l.y } : null;
    };
    const ret = { pos, rooms: HOME.rooms };
    if (a <= 0) return ret;
    const ring = o.ring || {};
    const k = c01(pick(o.k, 1));
    K.layer(a * (1 - 0.6 * c01(o.dim)), () => {
      K.layer(k, () => {
        K.card(Hm.x, Hm.y, Hm.w, Hm.h, { r: 24, fill: palette.room, stroke: palette.roomEdge });
        K.glow(Hm.house.x, Hm.house.y, 90, C.head, 0.18);
        K.icon('house', Hm.house.x, Hm.house.y, 76, { color: C.head, w: 3.5 });
        K.text('~', Hm.house.x + 64, Hm.house.y + 18, { font: 'mono', weight: 700, size: 52, color: C.head });
        K.eyebrow('HOME FOLDER', Hm.x + 30, Hm.y + 44, { size: 22 });
        K.text("your settings, not one project's", Hm.house.x + 120, Hm.house.y + 14, { ...type.read, color: C.body, alpha: c01(o.subK) });
      });
      // ~/.config: the tidy one, gold outline card behind
      const ck = c01(o.configK);
      if (ck > 0) K.layer(ck, () => {
        const P = HOME.config;
        K.card(P.x - 95, P.y - 70, 190, 160, { r: 14, fill: 'rgba(240,192,106,0.05)', stroke: C.head, shadow: false });
        item(P.x, P.y - 8, 70, { name: '~/.config', size: 26, ring: ring['~/.config'] });
      });
      // the loose ones, a little crooked
      const lk = pick(o.looseK, 0);
      loose.forEach((l, i) => {
        const kk = K.clamp(lk * loose.length - i); if (kk <= 0) return;
        K.layer(kk, () => K.at(l.x, l.y, 1, l.rot, () => item(0, 0, 60, { name: l.name, size: 26, ring: ring[l.name] })));
        const bk = c01(o.books);
        if (bk > 0 && /claude|codex|cursor/.test(l.name)) K.layer(bk * kk, () => { K.glow(l.x + 62, l.y - 30, 34, C.head, 0.3); K.icon('book', l.x + 62, l.y - 30, 40, { color: C.head, w: 2.5 }); });
      });
      // AppData + its rooms
      const ak = c01(o.appdataK);
      if (ak > 0) {
        const P = HOME.appdata;
        K.layer(ak, () => item(P.x, P.y, 76, { name: 'AppData', size: 30, tag: 1, tagSide: -1, t, ring: ring.AppData }));
        const rk = pick(o.roomsK, 0);
        const texts = o.roomsText || ['Roaming · follows a work login', 'Local · this machine', 'LocalLow · fewer permissions'];
        texts.forEach((s, i) => {
          const kk = K.clamp(rk * texts.length - i); if (kk <= 0) return;
          const y = HOME.rooms.ys[i];
          K.arrow(P.x + 70, P.y - 10, HOME.rooms.x - 190, y, { k: kk, color: C.line2, w: 2, head: false, bend: (i - 1) * -10 });
          K.pill(s, HOME.rooms.x, y, { size: 26, alpha: kk, color: C.strong });
        });
      }
    });
    return ret;
  }

  // ---------------------------------------------------------------- small shared pieces
  /** a lesson-reference chip: gold mono number + cream text in one pill, centred at (x, y). e.g. M.ref('01.05',
   *  'environment variables', x, y). o: {size (26), alpha, align ('center'|'left')}. Returns width. */
  function ref(num, text, x, y, o = {}) {
    const size = pick(o.size, 26), a = pick(o.alpha, 1);
    const fn = { font: 'mono', weight: 600, size }, ft = { font: 'ui', weight: 600, size };
    const nw = K.measure(num, fn), tw = text ? K.measure(text, ft) : 0, gap = text ? size * 0.55 : 0;
    const w = nw + gap + tw + size * 1.6, h = size * 1.9;
    if (a <= 0) return w;
    const x0 = (o.align === 'left' ? x : x - w / 2);
    K.card(x0, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: C.line2, shadow: false, alpha: a });
    K.text(num, x0 + size * 0.8, y + size * 0.34, { ...fn, color: C.head, alpha: a });
    if (text) K.text(text, x0 + size * 0.8 + nw + gap, y + size * 0.34, { ...ft, color: C.strong, alpha: a });
    return w;
  }
  /** a quiet 26 px caption, centred. o: {alpha, color (C.soft), italic} */
  function caption(s, x, y, o = {}) { return K.text(s, x, y, { ...type.label, weight: 400, color: o.color || C.soft, align: o.align || 'center', alpha: pick(o.alpha, 1), italic: o.italic }); }

  /** fit the whole cross-section (layout.frame, 1720 x 690) into box {x, y, w, h}, centred, aspect kept; draws fn
   *  inside that transform (draw M.shop / anything in full-size layout coordinates inside fn). Returns the scale. */
  function place(box, fn) {
    const F = FRAME, fw = F.x1 - F.x0, fh = F.y1 - F.y0;
    const s = Math.min(box.w / fw, box.h / fh);
    const ox = box.x + (box.w - fw * s) / 2, oy = box.y + (box.h - fh * s) / 2;
    const g = G(); g.save(); g.translate(ox, oy); g.scale(s, s); g.translate(-F.x0, -F.y0); fn(s); g.restore();
    return s;
  }
  /** map a full-size layout point to screen after M.place(box): for labels drawn at full scale outside the copy */
  function placed(box, x, y) {
    const F = FRAME, fw = F.x1 - F.x0, fh = F.y1 - F.y0, s = Math.min(box.w / fw, box.h / fh);
    return { x: box.x + (box.w - fw * s) / 2 + (x - F.x0) * s, y: box.y + (box.h - fh * s) / 2 + (y - F.y0) * s };
  }
  /** camera by view name: keys [{at, view: 'wide'|'room'|'floor'|'drawer'|'door', d}] (or raw {x, y, z}).
   *  Default move 0.7 s, eased io. Use with K.withCam(M.cam(t, keys), () => {...}). */
  function cam(t, keys) {
    return K.cam(t, keys.map((k) => ({ ...(k.view ? layout.cams[k.view] : {}), ...k, d: pick(k.d, motion.move) })), motion.move);
  }

  window.M = {
    palette, type, motion, layout, HOME,
    dotName, tag, item, porter, porterY, staff, owner,
    door, sign, doorGroup, shelf, slot, shelfIcon, drawer, note, board,
    shop, home, ref, caption, place, placed, cam,
    DEFAULT_ITEMS, DEFAULT_HIDDEN,
  };
})();
