/* 01.05 Environment variables & PATH — shared drawing (window.M)
   The lesson's one metaphor: THE SATCHEL COPIED AT THE DOOR.
     - every running program is a COURIER: a program tile (K.iconTile) wearing a small SATCHEL;
     - the satchel (terracotta-stitched leather card, flap, strap) holds CARDS: cream paper luggage tags,
       a dark name tab (mono, e.g. PATH) + an ink value. Key cards carry a terracotta band + key icon;
       the PATH card carries a gold band;
     - HOME is a tall arched DOOR (gold outline) on the left; couriers leave it to the right along the lane;
     - the PATH card unfolds into numbered STREETS (hairlines, numbered pills), each with one SHOP
       (a folder + its real name, optionally a python.exe tag). A SIGNPOST stands in for a shop that only
       forwards you (Store alias, install-manager alias, shims).
   Every scene draws these with the functions below so they look identical across the lesson.

   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call because the runtime swaps canvases.
   Colours: gold (C.head) = PATH, a winning shop, the door, "lit"; cream paper = cards; terracotta (C.accent)
   = the satchel leather, keys, misses/errors; C.soft / C.line2 = dimmed, never-visited things.
   Pink is never used here (decoration only, on the title and end cards). */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);
  const G = () => K.ctx();

  // ---------------------------------------------------------------- palette
  const P = {
    leather: K.mixColor(C.tile, C.accent, 0.16),     // satchel body
    leatherBack: K.mixColor(C.page, C.accent, 0.12), // inside of the satchel
    leatherFlap: K.mixColor(C.tile, C.accent, 0.26),
    stitch: C.accent,
    buckle: C.head,
    paper: C.paper, paperShade: C.paperShade,       // the cards
    ink: C.ink, inkSoft: '#6B5E52',                   // text on paper
    tab: '#262433',                                   // the card's dark name tab
    tabText: C.strong,
    path: C.head,                                     // PATH band, winning shop, lit street
    key: C.accent,                                    // key band
    door: C.head,
    street: C.line2, streetLit: C.head, streetDim: C.line,
    miss: C.accent,
    text: C.strong, label: C.body, dim: C.soft,
    agent: C.head,
  };
  // type: 26 px minimum for labels, 30 for read text, mono for literal names
  const T = {
    label: { font: 'ui', weight: 600, size: 26 },
    labelBig: { font: 'ui', weight: 600, size: 30 },
    mono: { font: 'mono', weight: 600, size: 30 },
    monoSm: { font: 'mono', weight: 600, size: 26 },
    eyebrow: { font: 'ui', weight: 600, size: 26, tracking: 3, upper: true },
  };

  // ---------------------------------------------------------------- layout (1920x1080; safe x 80-1840, y 130-930)
  const L = {
    door: { x: 120, y: 260, w: 240, h: 560 },        // home, scenes 03, 04, 09, 12, 13
    laneY: 540, laneX0: 380, laneX1: 1760,           // the courier lane
    panel: { x: 700, y: 180, w: 1060, h: 700 },      // "inside the satchel" zoom panel
    emblem: { x: 960, y: 650, s: 300 },              // title card satchel (01)
    token: { x: 1700, y: 820, s: 110 },              // satchel as a corner token (02)
    endSatchel: { x: 1500, y: 600, s: 340 },         // end card satchel (16)
    // the street grid (05, 06): five streets
    streets: { ys: [260, 380, 500, 620, 740], numX: 220, x0: 270, x1: 1720, shopX: 760, fileX: 1560 },
    // three streets (07, 08)
    streets3: { ys: [320, 500, 680], numX: 220, x0: 270, x1: 1720, shopX: 760, fileX: 1560 },
    term: { x: 300, y: 800, w: 1320, h: 120 },       // terminal strip under the grid
    safe: { x0: 80, y0: 130, x1: 1840, y1: 930 },
  };

  // ---------------------------------------------------------------- small helpers
  /** a centred 26 px label (ui 600, C.body). o: {color, size, align, alpha, font, weight} ; returns width */
  function label(s, x, y, o = {}) {
    return K.text(s, x, y, { font: o.font || 'ui', weight: o.weight || 600, size: o.size || 26, color: o.color || P.label, align: o.align || 'center', alpha: o.alpha });
  }
  /** a 26 px gold eyebrow, centred by default */
  function eyebrow(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.eyebrow, color: o.color || C.head, align: o.align || 'center', alpha: o.alpha });
  }
  /** a hand-drawn terracotta X centred at (x, y), size s, drawn with progress k (first stroke, then second) */
  function cross(x, y, s, k = 1, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    const r = s * 0.32, w = o.w || Math.max(4, s * 0.1), col = o.color || P.miss;
    K.line(x - r, y - r, x + r, y + r, { k: K.clamp(k * 2), color: col, w, alpha: o.alpha });
    K.line(x + r, y - r, x - r, y + r, { k: K.clamp(k * 2 - 1), color: col, w, alpha: o.alpha });
  }
  /** 01.03's gold you-are-here dot (core radius r, default 11), k fades it in */
  function dot(x, y, o = {}) {
    const k = clamp01(pick(o.k, 1)), r = o.r || 11;
    if (k <= 0) return;
    K.layer(k, () => {
      K.glow(x, y, r * 4, C.head, 0.4);
      const g = G();
      g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = C.head; g.fill();
      g.lineWidth = 2; g.strokeStyle = C.gold; g.beginPath(); g.arc(x, y, r + 6, 0, Math.PI * 2); g.stroke(); g.restore();
    });
  }

  // ---------------------------------------------------------------- the card (an environment variable)
  /** a small card as it sits INSIDE a satchel or flies between satchels: paper tag, dark name tab on top.
   *  centred on (x, y) at its top edge -> the card hangs DOWN from y. o: {w, h, name, kind:'plain'|'path'|'key',
   *  dashed (a copy in flight), lit (gold glow), alpha, rot, size (name px, default 26), new (gold "+")}
   *  The name is drawn only if it fits; give w >= measure + 24. */
  function chip(x, y, o = {}) {
    const w = o.w || 120, h = o.h || 150, size = o.size || 26, a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002) return;
    const g = G();
    K.layer(a, () => {
      g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot);
      // paper body
      g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      K.rr(-w / 2, 0, w, h, 10); g.fillStyle = P.paper; g.fill(); g.shadowColor = 'transparent';
      if (o.dashed) { g.setLineDash([8, 6]); g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(-w / 2, 0, w, h, 10); g.stroke(); g.setLineDash([]); }
      // kind band down the left edge
      const band = o.kind === 'path' ? P.path : o.kind === 'key' ? P.key : null;
      if (band) { g.save(); K.rr(-w / 2, 0, w, h, 10); g.clip(); g.fillStyle = band; g.fillRect(-w / 2, 0, 8, h); g.restore(); }
      // name tab
      const tabH = size * 1.55;
      g.save(); K.rr(-w / 2, 0, w, h, 10); g.clip(); g.fillStyle = P.tab; g.fillRect(-w / 2, 0, w, tabH); g.restore();
      if (o.name) K.text(o.name, 0, tabH * 0.5 + size * 0.36, { font: 'mono', weight: 700, size, color: P.tabText, align: 'center' });
      // value lines (texture, not text)
      for (let i = 0; i < 3; i++) {
        const ly = tabH + 18 + i * 16; if (ly > h - 10) break;
        K.line(-w / 2 + 18, ly, -w / 2 + 18 + (w - 36) * (i === 2 ? 0.55 : 0.85), ly, { color: '#B9AD98', w: 3 });
      }
      if (o.lit) { g.shadowColor = K.rgba(C.head, 0.7 * (o.lit === true ? 1 : o.lit)); g.shadowBlur = 30; g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(-w / 2, 0, w, h, 10); g.stroke(); }
      if (o.new) { K.text('+', w / 2 - 6, -6, { font: 'head', weight: 700, size: 40, color: C.head, align: 'center' }); }
      g.restore();
    });
  }

  /** a LARGE card read by the viewer (zoom panel, key scenes): one horizontal tag, name tab on the left,
   *  value on the right. Top-left at (x, y). o: {w (900), h (96), name, value, kind:'plain'|'path'|'key',
   *  lit 0..1, dashed, alpha, size (30), nameW (fixed tab width, for aligned stacks), valueK 0..1 (typewriter
   *  share of the value), fade (true: a long value fades out at the right edge instead of squashing),
   *  mask (true: value shown as given, never real keys; pass e.g. 'sk-ant-••••••••')}.
   *  Returns {w, h, tabW}. */
  function envCard(x, y, o = {}) {
    const w = o.w || 900, h = o.h || 96, size = o.size || 30, a = clamp01(pick(o.alpha, 1));
    const name = o.name || 'NAME';
    const tabW = o.nameW || K.measure(name, { font: 'mono', weight: 700, size }) + 56 + (o.kind === 'key' ? 44 : 0);
    if (a <= 0.002) return { w, h, tabW };
    const g = G();
    K.layer(a, () => {
      g.save();
      g.shadowColor = 'rgba(0,0,0,.42)'; g.shadowBlur = 60; g.shadowOffsetY = 20;
      K.rr(x, y, w, h, 18); g.fillStyle = P.paper; g.fill(); g.shadowColor = 'transparent';
      g.save(); K.rr(x, y, w, h, 18); g.clip();
      g.fillStyle = P.tab; g.fillRect(x, y, tabW, h);
      const band = o.kind === 'path' ? P.path : o.kind === 'key' ? P.key : null;
      if (band) { g.fillStyle = band; g.fillRect(x, y, 10, h); }
      // value
      const vs = o.value != null ? String(o.value) : '';
      const shown = o.valueK == null ? vs : vs.slice(0, Math.round(vs.length * clamp01(o.valueK)));
      K.text(shown, x + tabW + 30, y + h / 2 + size * 0.36, { font: 'mono', weight: 600, size, color: P.ink });
      if (o.fade !== false) {
        const fx = x + w - 140, gr = g.createLinearGradient(fx, 0, x + w, 0);
        gr.addColorStop(0, K.rgba(P.paper, 0)); gr.addColorStop(1, K.rgba(P.paper, 1));
        g.fillStyle = gr; g.fillRect(fx, y, 140, h);
      }
      g.restore();
      // name in tab
      let nx = x + 28;
      if (o.kind === 'key') { K.icon('key', nx + 16, y + h / 2, 40, { color: C.accent, w: 3.5 }); nx += 44; }
      K.text(name, nx, y + h / 2 + size * 0.36, { font: 'mono', weight: 700, size, color: o.kind === 'path' ? C.head : P.tabText });
      // outline
      const lit = o.lit === true ? 1 : clamp01(o.lit);
      if (o.dashed) { g.setLineDash([10, 8]); g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(x, y, w, h, 18); g.stroke(); g.setLineDash([]); }
      if (lit > 0) { g.shadowColor = K.rgba(C.head, 0.6 * lit); g.shadowBlur = 36; g.lineWidth = 3; g.strokeStyle = K.rgba(C.head, lit); K.rr(x, y, w, h, 18); g.stroke(); }
      g.restore();
    });
    return { w, h, tabW };
  }

  // ---------------------------------------------------------------- the satchel
  /** the satchel, centred at (x, y), width s (body height 0.68 s). o:
   *   open 0..1      flap lifts back (0 closed, 1 open, cards visible above the mouth)
   *   cards          [{name, kind, lift 0..1 (rises out of the bag), lit, dashed, new, alpha, w}] (max ~4 at s 300)
   *   names          show card names (default s >= 200)
   *   strap          'handle' (default: an arc above, the emblem) | 'none' | [[x,y],...] explicit strap points
   *   glow 0..1      warm glow behind it; alpha; dot 0..1 (01.03's you-are-here dot riding on the flap)
   *   lock 0..1      a lock icon on the flap (scene 10's failed seal); lockFail 0..1 crosses it out
   *  Good sizes: emblem 280-340, end card 340, corner token 110, a courier's satchel = 0.7 x tile size.
   *  Returns {mouthY, x0, x1, top, bottom} for placing flying cards. */
  function satchel(t, x, y, s, o = {}) {
    const w = s, h = s * 0.68, x0 = x - w / 2, y0 = y - h / 2, r = Math.max(8, s * 0.08);
    const open = clamp01(o.open), a = clamp01(pick(o.alpha, 1));
    const geo = { mouthY: y0, x0, x1: x0 + w, top: y0, bottom: y0 + h };
    if (a <= 0.002) return geo;
    const g = G();
    const names = pick(o.names, s >= 200);
    const lw = Math.max(1.5, s * 0.009);
    K.layer(a, () => {
      if (o.glow) K.glow(x, y, s * 0.95, C.head, 0.22 * clamp01(o.glow));
      // strap
      const strap = pick(o.strap, 'handle');
      g.save(); g.lineCap = 'round';
      if (strap === 'handle') {
        g.strokeStyle = P.leatherFlap; g.lineWidth = Math.max(4, s * 0.045);
        g.beginPath(); g.moveTo(x0 + w * 0.1, y0 + 4); g.bezierCurveTo(x0 + w * 0.05, y0 - h * 0.95, x0 + w * 0.95, y0 - h * 0.95, x0 + w * 0.9, y0 + 4); g.stroke();
        g.strokeStyle = K.rgba(C.accent, 0.55); g.lineWidth = Math.max(1, s * 0.006); g.setLineDash([s * 0.02, s * 0.018]); g.stroke(); g.setLineDash([]);
      } else if (Array.isArray(strap)) {
        K.path(strap, { color: P.leatherFlap, w: Math.max(4, s * 0.06), head: false });
      }
      g.restore();
      // flap, when thrown back (behind the cards)
      const flapH = h * 0.52;
      const drawFlap = () => {
        const sy = K.lerp(1, -0.42, K.ease.io(open));
        g.save(); g.translate(x, y0); g.scale(1, sy);
        g.beginPath();
        g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w / 2, flapH * 0.62);
        g.quadraticCurveTo(w / 2, flapH, w * 0.3, flapH); g.lineTo(-w * 0.3, flapH);
        g.quadraticCurveTo(-w / 2, flapH, -w / 2, flapH * 0.62); g.closePath();
        g.fillStyle = sy < 0 ? P.leatherBack : P.leatherFlap; g.fill();
        g.lineWidth = lw * 1.4; g.strokeStyle = C.accent; g.stroke();
        // stitch
        g.save(); g.setLineDash([s * 0.022, s * 0.02]); g.lineWidth = Math.max(1, lw * 0.8); g.strokeStyle = K.rgba(C.accent, 0.7);
        g.beginPath(); g.moveTo(-w / 2 + s * 0.04, 0); g.lineTo(-w / 2 + s * 0.04, flapH * 0.6); g.quadraticCurveTo(-w / 2 + s * 0.04, flapH - s * 0.04, -w * 0.28, flapH - s * 0.04);
        g.lineTo(w * 0.28, flapH - s * 0.04); g.quadraticCurveTo(w / 2 - s * 0.04, flapH - s * 0.04, w / 2 - s * 0.04, flapH * 0.6); g.lineTo(w / 2 - s * 0.04, 0); g.stroke(); g.restore();
        // buckle
        if (sy > 0) {
          const bw = s * 0.13, bh = s * 0.1;
          K.rr(-bw / 2, flapH - bh * 0.7, bw, bh, s * 0.02); g.fillStyle = C.head; g.fill();
          K.rr(-bw * 0.25, flapH - bh * 0.45, bw * 0.5, bh * 0.45, s * 0.01); g.fillStyle = P.leatherFlap; g.fill();
        }
        g.restore();
      };
      // inside / back panel
      g.save(); K.rr(x0, y0 - s * 0.03, w, h + s * 0.03, r); g.fillStyle = P.leatherBack; g.fill(); g.restore();
      if (open >= 0.5) drawFlap();
      // cards
      const cards = o.cards || [];
      const n = cards.length;
      const gap = (w * 0.88) / Math.max(1, n);
      const cwDef = Math.min(w * 0.34, gap - w * 0.025);
      const chH = h * 0.78;
      cards.forEach((c, i) => {
        const cx = x + (i - (n - 1) / 2) * gap;
        const peek = chH * (0.32 * K.ease.io(open) + 0.62 * clamp01(c.lift));
        const cy = y0 + h * 0.12 - peek;
        chip(cx, cy, { w: c.w || cwDef, h: chH, name: names ? c.name : null, kind: c.kind, lit: c.lit, dashed: c.dashed, new: c.new,
          alpha: pick(c.alpha, 1), rot: c.rot != null ? c.rot : (i - (n - 1) / 2) * 0.05, size: c.size || Math.max(26, Math.round(s * 0.085)) });
      });
      // front body
      g.save();
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = s * 0.2; g.shadowOffsetY = s * 0.06;
      K.rr(x0, y0 + h * 0.1, w, h * 0.9, r); g.fillStyle = P.leather; g.fill(); g.shadowColor = 'transparent';
      g.lineWidth = lw * 1.4; g.strokeStyle = C.accent; g.stroke();
      g.setLineDash([s * 0.022, s * 0.02]); g.lineWidth = Math.max(1, lw * 0.8); g.strokeStyle = K.rgba(C.accent, 0.6);
      K.rr(x0 + s * 0.035, y0 + h * 0.1 + s * 0.035, w - s * 0.07, h * 0.9 - s * 0.07, r * 0.7); g.stroke(); g.setLineDash([]);
      // front buckle strap (visible once the flap is thrown back)
      if (open >= 0.5) {
        const bw = s * 0.12, bh = s * 0.16, ft = y0 + h * 0.1;
        K.rr(x - bw / 2, ft - 2, bw, bh, s * 0.02); g.fillStyle = P.leatherFlap; g.fill(); g.lineWidth = lw; g.strokeStyle = C.accent; g.stroke();
        K.rr(x - bw * 0.62, ft + bh - s * 0.05, bw * 1.24, s * 0.07, s * 0.015); g.fillStyle = C.head; g.fill();
      }
      g.restore();
      if (open < 0.5) drawFlap();
      // lock (scene 10)
      if (o.lock) {
        const lk = clamp01(o.lock), ly = open >= 0.5 ? y + h * 0.18 : y0 + flapH * 0.55;
        K.icon('lock', x, ly, s * 0.2, { color: C.head, alpha: lk * (1 - 0.6 * clamp01(o.lockFail)), w: Math.max(2, s * 0.012) });
        if (o.lockFail) cross(x, ly, s * 0.26, o.lockFail);
      }
      if (o.dot) dot(x + w * 0.28, y0 + flapH * 0.42 * K.lerp(1, -0.42, K.ease.io(open)), { k: o.dot, r: Math.max(6, s * 0.04) });
    });
    return geo;
  }

  // ---------------------------------------------------------------- the courier (a running program)
  /** a courier: a program tile (K.iconTile) with a satchel on its hip, centred at (x, y), tile size s.
   *  o: icon ('terminal' | 'code' | 'folder'-like name | 'sparkle' for the agent | 'gear' installer | 'person')
   *     label (26 px under it), labelColor, lit 0..1 (gold outline glow), dim (0..1 -> fades to 35%)
   *     walking 0..1 (bob amplitude; bob phase from t), satchel (true | false | satchel options object:
   *     {open, cards, ...}), satchelScale (0.7), lantern 0..1 (gold lantern + glow, the agent's AI light),
   *     dot 0..1 (you-are-here dot on the satchel flap), alpha, flip (satchel on the left hip)
   *  Good sizes: 140 hero (03), 100 road, 80 street-walker (05-08), 64 in chains (11, 14 cards).
   *  Returns the satchel centre {sx, sy, ss} (for card flights). */
  function courier(t, x, y, s, o = {}) {
    const a = clamp01(pick(o.alpha, 1)) * (1 - 0.65 * clamp01(o.dim));
    const bob = -Math.abs(Math.sin(t * 8.5)) * s * 0.05 * clamp01(o.walking);
    const yy = y + bob;
    const side = o.flip ? -1 : 1;
    const ss = s * pick(o.satchelScale, 0.7), sx = x + side * s * 0.48, sy = yy + s * 0.3;
    const res = { sx, sy, ss, x, y: yy };
    if (a <= 0.002) return res;
    K.layer(a, () => {
      const lan = clamp01(o.lantern);
      if (lan > 0) K.glow(x, yy - s * 0.2, s * 1.6, C.head, 0.28 * lan);
      const lit = o.lit === true ? 1 : clamp01(o.lit);
      // shoulder strap, drawn behind the tile: only its loop over the shoulder shows
      if (o.satchel !== false) {
        K.path([[sx + side * ss * 0.32, sy - ss * 0.3], [x + side * s * 0.52, yy - s * 0.5], [x + side * s * 0.05, yy - s * 0.64], [x - side * s * 0.36, yy - s * 0.4]],
          { color: P.leatherFlap, w: Math.max(4, s * 0.06), head: false });
      }
      K.iconTile(o.icon || 'terminal', x, yy, s, { glow: lit, stroke: lit > 0.05 ? K.mixColor(C.line2, C.head, lit) : C.line2,
        color: o.icon === 'sparkle' ? C.head : o.iconColor || C.head });
      if (o.satchel !== false) {
        const so = typeof o.satchel === 'object' ? o.satchel : {};
        // shoulder strap: from the far top corner of the tile down to the satchel
        satchel(t, sx, sy, ss, { strap: 'none', names: false, ...so, dot: pick(so.dot, o.dot) });
      }
      if (lan > 0) {
        const lx = x - side * s * 0.62, ly = yy - s * 0.62 + K.wave(t, 1.6, s * 0.02);
        K.icon('lantern', lx, ly, s * 0.5, { color: C.head, alpha: lan, w: Math.max(2, s * 0.025) });
        K.glow(lx, ly, s * 0.5, C.head, 0.35 * lan);
      }
      if (o.label) label(o.label, x, yy + s * 0.5 + 44, { color: o.labelColor || P.label, size: o.labelSize || 26 });
    });
    return res;
  }

  // ---------------------------------------------------------------- home: the door
  /** the arched home door, top-left (x, y), size w x h (default L.door). o:
   *   open 0..1     the leaf swings back on its left hinge; warm light spills from inside
   *   label         'home' (eyebrow under the door; null hides), icon (house over the arch, default true)
   *   drawers 0..1  two drawers inside the frame, "user" and "system" (the Windows master copy, 04, 09)
   *   drawerLit     'user' | 'system' | null (gold outline on one drawer); alpha; glow 0..1
   *  Returns {x, y, w, h, cx, cy, sill: {x, y}} where sill is the doorstep couriers leave from. */
  function door(t, o = {}) {
    const x = pick(o.x, L.door.x), y = pick(o.y, L.door.y), w = pick(o.w, L.door.w), h = pick(o.h, L.door.h);
    const res = { x, y, w, h, cx: x + w / 2, cy: y + h / 2, sill: { x: x + w + 20, y: y + h - 60 } };
    const a = clamp01(pick(o.alpha, 1)), open = K.ease.io(clamp01(o.open));
    if (a <= 0.002) return res;
    const g = G();
    const arch = (ix, iy, iw, ih) => { g.beginPath(); g.roundRect(ix, iy, iw, ih, [iw / 2, iw / 2, 10, 10]); };
    K.layer(a, () => {
      if (o.glow) K.glow(x + w / 2, y + h * 0.5, w * 1.6, C.head, 0.2 * clamp01(o.glow));
      // interior
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 60; g.shadowOffsetY = 20;
      arch(x, y, w, h); g.fillStyle = C.panel; g.fill(); g.restore();
      g.save(); arch(x, y, w, h); g.clip();
      const lamp = g.createRadialGradient(x + w / 2, y + h * 0.55, 0, x + w / 2, y + h * 0.55, h * 0.6);
      lamp.addColorStop(0, K.rgba(C.head, 0.12 + 0.3 * open)); lamp.addColorStop(1, K.rgba(C.head, 0));
      g.fillStyle = lamp; g.fillRect(x, y, w, h);
      // drawers (master copy)
      const dk = clamp01(o.drawers);
      if (dk > 0) {
        ['user', 'system'].forEach((nm, i) => {
          const dy = y + h * 0.38 + i * 130, lit = o.drawerLit === nm;
          K.card(x + 24, dy, w - 48, 104, { r: 12, fill: C.tile, stroke: lit ? C.head : C.line2, glow: lit ? 0.6 : 0, shadow: false, alpha: dk });
          K.line(x + w / 2 - 22, dy + 30, x + w / 2 + 22, dy + 30, { color: C.head, w: 4, alpha: dk });
          label(nm, x + w / 2, dy + 78, { color: lit ? C.head : C.strong, alpha: dk, size: 28 });
        });
      }
      // the leaf: shrinks toward the left hinge as it swings open
      const lf = 1 - 0.88 * open;
      if (lf > 0.02 && dk < 1) {
        g.save(); g.globalAlpha *= 1 - dk;
        arch(x + 6, y + 6, (w - 12) * lf, h - 12); g.fillStyle = K.mixColor(C.tile, C.head, 0.05 + 0.08 * open); g.fill();
        g.strokeStyle = C.line2; g.lineWidth = 1.5; g.stroke();
        // two panels + the handle
        if (lf > 0.25) {
          g.strokeStyle = K.rgba(C.head, 0.25); g.lineWidth = 1.5;
          K.rr(x + 6 + (w - 12) * lf * 0.16, y + h * 0.34, (w - 12) * lf * 0.68, h * 0.24, 8); g.stroke();
          K.rr(x + 6 + (w - 12) * lf * 0.16, y + h * 0.64, (w - 12) * lf * 0.68, h * 0.24, 8); g.stroke();
        }
        g.beginPath(); g.arc(x + 6 + (w - 12) * lf - 22 * lf, y + h * 0.6, 7, 0, Math.PI * 2); g.fillStyle = C.head; g.fill();
        g.restore();
      }
      g.restore();
      // frame
      g.save(); arch(x, y, w, h); g.lineWidth = 3; g.strokeStyle = P.door; g.shadowColor = K.rgba(C.head, 0.35); g.shadowBlur = 18; g.stroke(); g.restore();
      if (pick(o.icon, true)) K.icon('house', x + w / 2, y + w * 0.36, 64, { color: C.head, w: 3 });
      const lb = pick(o.label, 'home');
      if (lb) label(lb, x + w / 2, y + h + 50, { color: C.head, size: 30 });
    });
    return res;
  }

  // ---------------------------------------------------------------- PATH as streets
  /** y of street i in a grid (geo = L.streets, L.streets3 or your own {ys, ...}) */
  const streetY = (i, geo = L.streets) => geo.ys[i];
  /** where a courier stands on street i at progress u (0 = street start, 1 = in front of the shop) */
  function streetAt(i, u, geo = L.streets) {
    return { x: K.lerp(geo.x0 + 50, geo.shopX - 70, clamp01(u)), y: geo.ys[i] };
  }
  /** the street grid. geo: L.streets | L.streets3 | custom {ys, numX, x0, x1, shopX, fileX}. o.rows: one per street:
   *   {num (default i+1; '0' for the pinned venv street), name (folder path, mono 28), file ('python.exe' |
   *    null), state: 'idle' | 'lit' (the courier went in: gold) | 'dim' (never visited: 30%, dashed) |
   *    'miss' (searched, nothing: terracotta X) | 'empty' (street with no shop) | 'signpost' (a forwarding
   *    stand-in, drawn as M.signpost) | 'ghost' (outline only), k 0..1 (row reveal: street draws, shop drops in),
   *    pinned 0..1 (gold number pill + pin: the activated .venv street), missK (X progress)}
   *   o.k: global reveal multiplier; o.alpha; o.nameSize (28); o.numbers (default true)
   *  Row spacing 120 (5 streets) or 180 (3 streets). Names longer than ~32 mono chars collide with the file tag. */
  function streets(t, geo = L.streets, o = {}) {
    const rows = o.rows || [];
    const A = clamp01(pick(o.alpha, 1));
    if (A <= 0.002) return;
    K.layer(A, () => {
      rows.forEach((r, i) => {
        if (i >= geo.ys.length) return;
        const y = geo.ys[i], k = clamp01(pick(r.k, 1)) * clamp01(pick(o.k, 1));
        if (k <= 0) return;
        const st = r.state || 'idle';
        const ra = st === 'dim' ? 0.32 : st === 'ghost' ? 0.45 : 1;
        K.layer(ra, () => {
          const lineY = y + 40;
          const lit = st === 'lit';
          // the street itself
          K.line(geo.x0, lineY, geo.x1, lineY, { k: K.io(k, 0, 0.6), color: lit ? P.streetLit : P.street, w: lit ? 3 : 2, dash: st === 'dim' ? [10, 10] : null });
          // number
          const pin = clamp01(r.pinned);
          if (pick(o.numbers, true)) {
            K.pill(String(pick(r.num, i + 1)), geo.numX, y + 10, { font: 'mono', size: 28, w: 64, alpha: K.io(k, 0, 0.4),
              fill: pin > 0.5 ? K.mixColor(C.tile, C.head, 0.25) : C.tile, stroke: pin > 0 || lit ? C.head : C.line2, color: pin > 0 || lit ? C.head : C.strong, glow: pin * 0.7 });
            if (pin > 0) K.icon('pin', geo.numX - 60, y - 6, 44, { color: C.head, alpha: pin });
          }
          // the shop
          const drop = K.io(k, 0.3, 0.7, 'out');
          const sy = y + 6 - (1 - drop) * 50;
          if (st !== 'empty' && drop > 0) {
            K.layer(drop, () => {
              if (lit) K.glow(geo.shopX, y, 150, C.head, 0.35);
              if (st === 'signpost') signpost(t, geo.shopX, sy - 6, 80, {});
              else if (st === 'ghost') { const g = G(); g.save(); g.setLineDash([8, 6]); g.strokeStyle = C.soft; g.lineWidth = 2; K.rr(geo.shopX - 40, sy - 30, 80, 60, 8); g.stroke(); g.restore(); }
              else K.folder(geo.shopX, sy, 56, { color: lit ? '#E0B055' : undefined });
              if (r.name) K.text(r.name, geo.shopX + 62, y + 18, { font: 'mono', weight: 600, size: o.nameSize || 28, color: lit ? C.head : st === 'signpost' ? C.accent : C.strong });
              if (r.file) K.pill(r.file, geo.fileX, y + 8, { font: 'mono', size: 26, icon: 'file', fill: lit ? K.mixColor(C.tile, C.head, 0.18) : C.tile, stroke: lit ? C.head : C.line2, color: lit ? C.head : C.strong, glow: lit ? 0.5 : 0 });
            });
          }
          if (st === 'miss') cross(geo.shopX, y + 4, 70, pick(r.missK, 1));
        });
      });
    });
  }

  // ---------------------------------------------------------------- signpost (a stand-in that forwards you)
  /** a signpost centred on its board at (x, y), board width s*1.3. o: {label (mono 26 under the post), point 0..1
   *  (dashed arrow leading off to the right, length o.reach 220), alpha, warn (default true: warning glyph)} */
  function signpost(t, x, y, s, o = {}) {
    const a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002) return;
    const g = G();
    K.layer(a, () => {
      const bw = s * 1.3, bh = s * 0.5;
      K.line(x - bw * 0.25, y, x - bw * 0.25, y + s * 0.62, { color: C.soft, w: Math.max(3, s * 0.06) });
      g.save();
      g.beginPath(); g.moveTo(x - bw / 2, y - bh / 2); g.lineTo(x + bw / 2 - bh * 0.45, y - bh / 2); g.lineTo(x + bw / 2, y);
      g.lineTo(x + bw / 2 - bh * 0.45, y + bh / 2); g.lineTo(x - bw / 2, y + bh / 2); g.closePath();
      g.fillStyle = K.mixColor(C.tile, C.accent, 0.18); g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.accent; g.stroke();
      g.restore();
      if (pick(o.warn, true)) K.icon('warning', x - bw * 0.12, y, bh * 0.72, { color: C.accent, w: Math.max(2, s * 0.035) });
      if (o.point) K.arrow(x + bw / 2 + 10, y, x + bw / 2 + pick(o.reach, 220), y, { k: clamp01(o.point), color: C.accent, dash: [10, 8], w: 3 });
      if (o.label) K.text(o.label, x, y + s * 0.62 + 36, { font: 'mono', weight: 600, size: 26, color: C.body, align: 'center' });
    });
  }

  // ---------------------------------------------------------------- copies in flight
  /** a card copy flying from (x1, y1) to (x2, y2) along an arc, k 0..1 (ease it yourself or pass raw: eased here).
   *  The source stays put; this draws the dashed copy + a fading gold trail. o: {name, kind, w (90), h (110),
   *  bend (-120: arcs upward), trail (true), alpha, size} */
  function copyFly(x1, y1, x2, y2, k, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    const e = K.ease.io(k), bend = pick(o.bend, -120);
    const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) + bend;
    const q = (u) => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2];
    const [px, py] = q(e);
    if (pick(o.trail, true) && k < 1) K.arrow(x1, y1, px, py, { cx, cy, k: 1, color: K.rgba(C.head, 0.5 * (1 - e)), dash: [6, 8], w: 2.5, head: false });
    // last 15%: the copy sinks into the satchel and is gone at k = 1 (then list it in that satchel's cards)
    const sink = pick(o.sink, true) ? K.ease.io(K.seg(k, 0.85, 1)) : 0;
    const ch = o.h || 110;
    chip(px, py - ch * 0.4 + sink * ch * 0.5, { w: o.w || 90, h: ch, name: o.name, kind: o.kind, dashed: true, alpha: pick(o.alpha, 1) * (1 - sink), size: o.size || 26, rot: Math.sin(e * Math.PI) * 0.12 });
  }

  // ---------------------------------------------------------------- a blocked return (03, 09)
  /** a short arrow from (x1, y1) toward (x2, y2) that stops at the door with an X: k draws the arrow, the X lands
   *  at the end. o: {color (C.soft), stop (0.75: share of the way it gets before the X)} */
  function blocked(x1, y1, x2, y2, k, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    const stop = pick(o.stop, 0.75);
    const ex = K.lerp(x1, x2, stop), ey = K.lerp(y1, y2, stop);
    K.arrow(x1, y1, ex, ey, { k: K.clamp(k * 1.4), color: o.color || C.soft, w: 3, head: false, dash: [10, 8] });
    if (k > 0.65) cross(ex, ey, 56, K.seg(k, 0.65, 1));
  }

  // ---------------------------------------------------------------- terminal strip
  /** a short terminal window (K.win kind 'terminal' + K.term). rect default L.term; items as K.term.
   *  o: {x, y, w, h, title ('Terminal'), prompt, size (28), rows (1-2), alpha, focus} ; returns the content rect */
  function termStrip(t, items, o = {}) {
    const x = pick(o.x, L.term.x), y = pick(o.y, L.term.y), w = pick(o.w, L.term.w), h = pick(o.h, L.term.h);
    const a = clamp01(pick(o.alpha, 1));
    let rect = { x, y: y + 50, w, h: h - 50 };
    K.layer(a, () => {
      rect = K.win(x, y, w, h, { kind: 'terminal', title: o.title || 'Terminal', titleSize: 26, focus: o.focus });
      K.term(rect, t, items, { size: o.size || 28, pad: 18, rows: o.rows || Math.max(1, Math.floor((h - 50 - 18) / 42)), prompt: o.prompt });
    });
    return rect;
  }

  // ---------------------------------------------------------------- expose
  window.M = {
    P, T, L, palette: P, layout: L,
    // primitives
    label, eyebrow, cross, dot,
    // cards
    chip, envCard,
    // the metaphor
    satchel, courier, door, copyFly, blocked,
    // PATH
    streets, streetY, streetAt, signpost,
    // terminal
    termStrip,
  };
})();
