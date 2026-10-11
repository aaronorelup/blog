/* 01.06 Programs, processes & services — shared drawing (window.M)
   The lesson's one metaphor: THE KITCHEN ROSTER, seen from above.
     - a PROGRAM is a RECIPE CARD: cream paper, folded corner, program icon + mono file name, on the SHELF
       (paper = inert instructions on disk; it never moves on its own, it is only copied);
     - a PROCESS is a COOK: a dark tile with a person icon, a small cream toque on top, a paper TICKET (PID)
       clipped under it and 01.05's SATCHEL (redrawn identically: same code) on its hip;
       kinds: app (gold), tray app (gold + clock badge), service = NIGHT STAFF (grey, gear badge),
       agent (sparkle head cook), ghost (leftover / ended: dashed, faded). AI cooks get a sparkle badge;
     - its MEMORY is its own STRETCH of the long COUNTER (lit gold when named; a solid wall + lock = private);
     - a PORT is a numbered SERVING HATCH in the back wall (square-ish, r 8: the scene's square element);
     - the STAFF BOARD is Task Manager (M.board: a drawn mock-up, never a screenshot);
     - a WINDOW is a DOOR to the cook (M.doorWin collapses into its title bar; the cook stays);
     - a SANDBOX is a GLASS FENCE (dashed gold, faint fill).
   Every scene draws these with the functions below so they look identical across the lesson.

   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call because the runtime swaps canvases.
   Colours: gold (C.head) = alive / lit / named; cream paper = recipe cards, tickets, order slips;
   terracotta (C.accent) = the thing being named, errors, blocks, satchel leather; C.soft grey = services
   (night staff) and dimmed things. Pink is never used here (decoration only, on the title and end cards). */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);
  const G = () => K.ctx();

  // ---------------------------------------------------------------- palette
  const P = {
    // 01.05 satchel (identical values)
    leather: K.mixColor(C.tile, C.accent, 0.16),
    leatherBack: K.mixColor(C.page, C.accent, 0.12),
    leatherFlap: K.mixColor(C.tile, C.accent, 0.26),
    stitch: C.accent, buckle: C.head,
    paper: C.paper, paperShade: C.paperShade, ink: C.ink, inkSoft: '#6B5E52',
    tab: '#262433', tabText: C.strong,
    // kitchen
    shelf: K.mixColor(C.tile, C.head, 0.16), shelfEdge: K.mixColor(C.line2, C.head, 0.35),
    counter: K.mixColor(C.tile, C.head, 0.05), counterTop: K.mixColor(C.line2, C.head, 0.22),
    wall: K.mixColor(C.page, C.tile, 0.55),
    cook: C.tile, cookIcon: C.head,
    night: K.mixColor(C.tile, C.page, 0.35), nightIcon: C.soft, nightHat: K.mixColor(C.paperShade, C.soft, 0.55),
    hat: C.paper,
    lit: C.head, named: C.accent, dim: C.soft,
    text: C.strong, label: C.body,
    fence: C.head,
  };
  const T = {
    label: { font: 'ui', weight: 600, size: 26 },
    labelBig: { font: 'ui', weight: 600, size: 30 },
    mono: { font: 'mono', weight: 600, size: 30 },
    monoSm: { font: 'mono', weight: 600, size: 26 },
    eyebrow: { font: 'ui', weight: 600, size: 26, tracking: 3, upper: true },
  };

  // ---------------------------------------------------------------- layout (1920x1080; safe x 80-1840, y 130-930)
  const L = {
    safe: { x0: 80, y0: 130, x1: 1840, y1: 930 },
    // recipe shelf, top-left: 4 slots of 184 x 124 cards
    shelf: { x: 120, y: 160, w: 800, cardW: 184, cardH: 124, gap: 16, n: 4 },
    // the long counter across the middle; cooks stand on cookY (behind it, seen from above)
    counter: { x: 140, y: 620, w: 1640, h: 180, n: 8 },
    cookY: 445, cookS: 96,
    // back wall of six serving hatches (ports), full width (08, 09)
    hatches: { y: 230, w: 210, h: 124, xs: [260, 540, 820, 1100, 1380, 1660] },
    // staff board = Task Manager (06)
    board: { x: 240, y: 150, w: 1440, h: 760, nav: 300 },
    // a window as a door (07)
    door: { x: 200, y: 240, w: 640, h: 420 },
    // corner lantern mark (10-12)
    lantern: { x: 1700, y: 190 },
  };
  /** centre of shelf slot i */
  const shelfSlot = (i, geo = L.shelf) => ({ x: geo.x + 24 + geo.cardW / 2 + i * (geo.cardW + geo.gap), y: geo.y + geo.cardH / 2 + 8 });
  /** stretch i of the counter: {x, y, w, h, cx, cy} (geo default L.counter) */
  function stretchAt(i, geo = L.counter) {
    const sw = geo.w / geo.n;
    return { x: geo.x + i * sw, y: geo.y, w: sw, h: geo.h, cx: geo.x + (i + 0.5) * sw, cy: geo.y + geo.h / 2 };
  }
  /** where the cook working stretch i stands */
  const cookAt = (i, geo = L.counter) => ({ x: stretchAt(i, geo).cx, y: L.cookY });
  /** centre of hatch i on the back wall */
  const hatchAt = (i, geo = L.hatches) => ({ x: geo.xs[i], y: geo.y + geo.h / 2, w: geo.w, h: geo.h });

  // ---------------------------------------------------------------- small helpers
  function label(s, x, y, o = {}) {
    return K.text(s, x, y, { font: o.font || 'ui', weight: o.weight || 600, size: o.size || 26, color: o.color || P.label, align: o.align || 'center', alpha: o.alpha, italic: o.italic });
  }
  function eyebrow(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.eyebrow, color: o.color || C.head, align: o.align || 'center', alpha: o.alpha });
  }
  /** hand-drawn terracotta X centred at (x, y), size s, progress k */
  function cross(x, y, s, k = 1, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    const r = s * 0.32, w = o.w || Math.max(4, s * 0.1), col = o.color || C.accent;
    K.line(x - r, y - r, x + r, y + r, { k: K.clamp(k * 2), color: col, w, alpha: o.alpha });
    K.line(x + r, y - r, x - r, y + r, { k: K.clamp(k * 2 - 1), color: col, w, alpha: o.alpha });
  }
  /** "course laptop · Oct 2026" observation tag (laptop icon + soft 26 px). o: {text, align ('left'), alpha} ; returns width */
  function obsTag(x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    const s = o.text || 'course laptop · Oct 2026', al = o.align || 'left';
    const tw = K.measure(s, T.label), w = tw + 44;
    const x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    K.icon('laptop', x0 + 16, y - 9, 30, { color: C.soft, alpha: a, w: 2 });
    K.text(s, x0 + 44, y, { ...T.label, color: C.soft, alpha: a, weight: 400 });
    return w;
  }
  /** a small round badge (icon in a dark disc with a coloured ring), centred at (x, y), radius r */
  function badge(name, x, y, r, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return;
    const g = G(), col = o.color || C.head;
    K.layer(a, () => {
      g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = o.fill || C.panel; g.fill();
      g.lineWidth = Math.max(1.5, r * 0.09); g.strokeStyle = col; g.stroke(); g.restore();
      K.icon(name, x, y, r * 1.35, { color: col, w: Math.max(1.6, r * 0.09) });
    });
  }

  // ---------------------------------------------------------------- 01.05's card + satchel (identical code)
  function chip(x, y, o = {}) {
    const w = o.w || 120, h = o.h || 150, size = o.size || 26, a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002) return;
    const g = G();
    K.layer(a, () => {
      g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot);
      g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      K.rr(-w / 2, 0, w, h, 10); g.fillStyle = P.paper; g.fill(); g.shadowColor = 'transparent';
      if (o.dashed) { g.setLineDash([8, 6]); g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(-w / 2, 0, w, h, 10); g.stroke(); g.setLineDash([]); }
      const band = o.kind === 'path' ? C.head : o.kind === 'key' ? C.accent : null;
      if (band) { g.save(); K.rr(-w / 2, 0, w, h, 10); g.clip(); g.fillStyle = band; g.fillRect(-w / 2, 0, 8, h); g.restore(); }
      const tabH = size * 1.55;
      g.save(); K.rr(-w / 2, 0, w, h, 10); g.clip(); g.fillStyle = P.tab; g.fillRect(-w / 2, 0, w, tabH); g.restore();
      if (o.name) K.text(o.name, 0, tabH * 0.5 + size * 0.36, { font: 'mono', weight: 700, size, color: P.tabText, align: 'center' });
      for (let i = 0; i < 3; i++) {
        const ly = tabH + 18 + i * 16; if (ly > h - 10) break;
        K.line(-w / 2 + 18, ly, -w / 2 + 18 + (w - 36) * (i === 2 ? 0.55 : 0.85), ly, { color: '#B9AD98', w: 3 });
      }
      if (o.lit) { g.shadowColor = K.rgba(C.head, 0.7 * (o.lit === true ? 1 : o.lit)); g.shadowBlur = 30; g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(-w / 2, 0, w, h, 10); g.stroke(); }
      g.restore();
    });
  }
  /** 01.05's satchel, centred at (x, y), width s. o: {open 0..1, cards [{name, kind, lift, lit, dashed, alpha, w}],
   *  names, strap 'handle'|'none'|[[x,y]...], glow, alpha, lock 0..1}. Same drawing as lesson 01.05. */
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
        g.save(); g.setLineDash([s * 0.022, s * 0.02]); g.lineWidth = Math.max(1, lw * 0.8); g.strokeStyle = K.rgba(C.accent, 0.7);
        g.beginPath(); g.moveTo(-w / 2 + s * 0.04, 0); g.lineTo(-w / 2 + s * 0.04, flapH * 0.6); g.quadraticCurveTo(-w / 2 + s * 0.04, flapH - s * 0.04, -w * 0.28, flapH - s * 0.04);
        g.lineTo(w * 0.28, flapH - s * 0.04); g.quadraticCurveTo(w / 2 - s * 0.04, flapH - s * 0.04, w / 2 - s * 0.04, flapH * 0.6); g.lineTo(w / 2 - s * 0.04, 0); g.stroke(); g.restore();
        if (sy > 0) {
          const bw = s * 0.13, bh = s * 0.1;
          K.rr(-bw / 2, flapH - bh * 0.7, bw, bh, s * 0.02); g.fillStyle = C.head; g.fill();
          K.rr(-bw * 0.25, flapH - bh * 0.45, bw * 0.5, bh * 0.45, s * 0.01); g.fillStyle = P.leatherFlap; g.fill();
        }
        g.restore();
      };
      g.save(); K.rr(x0, y0 - s * 0.03, w, h + s * 0.03, r); g.fillStyle = P.leatherBack; g.fill(); g.restore();
      if (open >= 0.5) drawFlap();
      const cards = o.cards || [];
      const n = cards.length;
      const gap = (w * 0.88) / Math.max(1, n);
      const cwDef = Math.min(w * 0.34, gap - w * 0.025);
      const chH = h * 0.78;
      cards.forEach((c, i) => {
        const cx = x + (i - (n - 1) / 2) * gap;
        const peek = chH * (0.32 * K.ease.io(open) + 0.62 * clamp01(c.lift));
        const cy = y0 + h * 0.12 - peek;
        chip(cx, cy, { w: c.w || cwDef, h: chH, name: names ? c.name : null, kind: c.kind, lit: c.lit, dashed: c.dashed,
          alpha: pick(c.alpha, 1), rot: c.rot != null ? c.rot : (i - (n - 1) / 2) * 0.05, size: c.size || Math.max(26, Math.round(s * 0.085)) });
      });
      g.save();
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = s * 0.2; g.shadowOffsetY = s * 0.06;
      K.rr(x0, y0 + h * 0.1, w, h * 0.9, r); g.fillStyle = P.leather; g.fill(); g.shadowColor = 'transparent';
      g.lineWidth = lw * 1.4; g.strokeStyle = C.accent; g.stroke();
      g.setLineDash([s * 0.022, s * 0.02]); g.lineWidth = Math.max(1, lw * 0.8); g.strokeStyle = K.rgba(C.accent, 0.6);
      K.rr(x0 + s * 0.035, y0 + h * 0.1 + s * 0.035, w - s * 0.07, h * 0.9 - s * 0.07, r * 0.7); g.stroke(); g.setLineDash([]);
      if (open >= 0.5) {
        const bw = s * 0.12, bh = s * 0.16, ft = y0 + h * 0.1;
        K.rr(x - bw / 2, ft - 2, bw, bh, s * 0.02); g.fillStyle = P.leatherFlap; g.fill(); g.lineWidth = lw; g.strokeStyle = C.accent; g.stroke();
        K.rr(x - bw * 0.62, ft + bh - s * 0.05, bw * 1.24, s * 0.07, s * 0.015); g.fillStyle = C.head; g.fill();
      }
      g.restore();
      if (open < 0.5) drawFlap();
      if (o.lock) {
        const ly = open >= 0.5 ? y + h * 0.18 : y0 + flapH * 0.55;
        K.icon('lock', x, ly, s * 0.2, { color: C.head, alpha: clamp01(o.lock), w: Math.max(2, s * 0.012) });
      }
    });
    return geo;
  }

  // ---------------------------------------------------------------- the recipe card (a program on disk)
  /** a recipe card centred at (x, y). Cream paper, folded top-right corner, program icon (ink) + mono name.
   *  o: {name ('node.exe'), w (184), h (124), icon ('program'; 'file' for a plain script), size (name px, 26),
   *      lit 0..1 (gold outline + glow: "this one is being run"), dashed (a COPY in flight: dashed gold edge),
   *      dim 0..1 (fades to 35%), alpha, rot, accent (terracotta name: the thing being named)}
   *  Good sizes: 184x124 on the shelf, 150x100 in hand, 260x176 hero. Names up to ~10 mono chars at w 184. */
  function recipe(x, y, o = {}) {
    const w = o.w || 184, h = o.h || 124, a = clamp01(pick(o.alpha, 1)) * (1 - 0.65 * clamp01(o.dim));
    if (a <= 0.002) return;
    const g = G(), sc = w / 184, size = o.size || Math.max(26, Math.round(26 * sc)), fold = 26 * sc;
    const lit = o.lit === true ? 1 : clamp01(o.lit);
    K.layer(a, () => {
      g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot);
      const body = () => {
        g.beginPath(); g.moveTo(-w / 2 + 10, -h / 2); g.lineTo(w / 2 - fold, -h / 2); g.lineTo(w / 2, -h / 2 + fold);
        g.lineTo(w / 2, h / 2 - 10); g.quadraticCurveTo(w / 2, h / 2, w / 2 - 10, h / 2); g.lineTo(-w / 2 + 10, h / 2);
        g.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 10); g.lineTo(-w / 2, -h / 2 + 10); g.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + 10, -h / 2); g.closePath();
      };
      if (lit > 0) { g.save(); g.shadowColor = K.rgba(C.head, 0.75 * lit); g.shadowBlur = 40 * sc; body(); g.fillStyle = P.paper; g.fill(); g.restore(); }
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30 * sc; g.shadowOffsetY = 10 * sc;
      body(); g.fillStyle = o.dashed ? K.rgba(P.paper, 0.9) : P.paper; g.fill(); g.restore();
      // folded corner
      g.beginPath(); g.moveTo(w / 2 - fold, -h / 2); g.lineTo(w / 2 - fold, -h / 2 + fold); g.lineTo(w / 2, -h / 2 + fold); g.closePath();
      g.fillStyle = P.paperShade; g.fill();
      // texture: two faint recipe lines under the icon row
      K.line(-w / 2 + 70 * sc, -h / 2 + 30 * sc, w / 2 - fold - 10 * sc, -h / 2 + 30 * sc, { color: '#C9BBA2', w: 3 * sc });
      K.line(-w / 2 + 70 * sc, -h / 2 + 46 * sc, w / 2 - fold - 40 * sc, -h / 2 + 46 * sc, { color: '#C9BBA2', w: 3 * sc });
      K.icon(o.icon || 'program', -w / 2 + 38 * sc, -h / 2 + 38 * sc, 46 * sc, { color: P.ink, w: Math.max(2, 2.6 * sc) });
      if (o.name) K.text(o.name, 0, h / 2 - 22 * sc, { font: 'mono', weight: 700, size, color: o.accent ? '#B4532F' : P.ink, align: 'center' });
      if (o.dashed) { g.setLineDash([9, 7]); g.lineWidth = 2.5; g.strokeStyle = C.head; body(); g.stroke(); g.setLineDash([]); }
      else if (lit > 0) { g.lineWidth = 3; g.strokeStyle = K.rgba(C.head, lit); body(); g.stroke(); }
      g.restore();
    });
  }

  /** the recipe shelf (a wooden plank with two brackets) and its cards. o:
   *   cards [{name, k 0..1 (pop in), lit, dim, alpha, accent, icon, gone 0..1 (lifted off the shelf: hidden)}]
   *   label (eyebrow over the shelf, e.g. 'programs: instructions on disk'), labelK, k (plank draws in), alpha
   *   geo (L.shelf). Cards sit in M.shelfSlot(i). */
  function shelf(t, o = {}) {
    const geo = o.geo || L.shelf, a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    if (a <= 0.002) return;
    const g = G();
    K.layer(a, () => {
      const py = geo.y + geo.cardH + 22;
      // plank
      const pw = geo.w * K.ease.io(k);
      if (pw > 2) {
        g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
        K.rr(geo.x, py, pw, 18, 6); g.fillStyle = P.shelf; g.fill(); g.restore();
        K.line(geo.x + 6, py + 2, geo.x + pw - 6, py + 2, { color: P.shelfEdge, w: 2 });
        // brackets
        [0.12, 0.88].forEach((u) => { if (u * geo.w < pw) { const bx = geo.x + geo.w * u; K.line(bx, py + 18, bx, py + 34, { color: P.shelfEdge, w: 4 }); K.line(bx, py + 34, bx + 18, py + 18, { color: P.shelfEdge, w: 3 }); } });
      }
      (o.cards || []).forEach((c, i) => {
        const ck = clamp01(pick(c.k, 1)), gone = clamp01(c.gone);
        if (ck <= 0 || gone >= 1) return;
        const s = shelfSlot(i, geo);
        const dy = (1 - K.ease.out(ck)) * -40;
        recipe(s.x, s.y + dy, { name: c.name, w: geo.cardW, h: geo.cardH, lit: c.lit, dim: c.dim, accent: c.accent, icon: c.icon, alpha: ck * (1 - gone) * pick(c.alpha, 1), rot: pick(c.rot, (i % 2 ? 0.012 : -0.01)) });
      });
      if (o.label) eyebrow(o.label, geo.x, geo.y - 18, { align: 'left', alpha: pick(o.labelK, 1) });
    });
  }

  // ---------------------------------------------------------------- the ticket (PID)
  /** a paper ticket centred at (x, y) with a mono number (e.g. 'PID 18412'), a punched hole on the left.
   *  o: {size (26), flip 0..1 (flips over to o.next: scene 15's "changes every run"), next, lit, alpha, color}
   *  Returns its width. */
  function ticket(text, x, y, o = {}) {
    const size = o.size || 26, a = clamp01(pick(o.alpha, 1));
    const f = clamp01(o.flip), shown = f >= 0.5 && o.next != null ? String(o.next) : String(text);
    const tw = Math.max(K.measure(String(text), { font: 'mono', weight: 700, size }), o.next != null ? K.measure(String(o.next), { font: 'mono', weight: 700, size }) : 0);
    const w = tw + size * 1.9, h = size * 1.6;
    if (a <= 0.002) return w;
    const g = G(), sy = Math.max(0.02, Math.abs(Math.cos(f * Math.PI)));
    K.layer(a, () => {
      g.save(); g.translate(x, y); g.scale(1, sy);
      if (o.lit) { g.shadowColor = K.rgba(C.head, 0.7); g.shadowBlur = 26; }
      else { g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 16; g.shadowOffsetY = 5; }
      K.rr(-w / 2, -h / 2, w, h, 6); g.fillStyle = P.paper; g.fill(); g.shadowColor = 'transparent';
      // perforation + hole
      g.save(); g.setLineDash([3, 4]); g.strokeStyle = '#B9AD98'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-w / 2 + size * 0.95, -h / 2 + 4); g.lineTo(-w / 2 + size * 0.95, h / 2 - 4); g.stroke(); g.restore();
      g.beginPath(); g.arc(-w / 2 + size * 0.48, 0, size * 0.15, 0, Math.PI * 2); g.fillStyle = P.paperShade; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#A89A84'; g.stroke();
      if (o.lit) { g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(-w / 2, -h / 2, w, h, 6); g.stroke(); }
      K.text(shown, -w / 2 + size * 0.95 + (w - size * 0.95) / 2, size * 0.35, { font: 'mono', weight: 700, size, color: o.color || P.ink, align: 'center' });
      g.restore();
    });
    return w;
  }

  // ---------------------------------------------------------------- the cook (a process)
  function toque(x, y, w, fill, stroke) {
    // a chef's hat sitting with its band bottom at y, band width w
    const g = G(), bh = w * 0.3;
    g.save();
    g.fillStyle = fill; g.strokeStyle = stroke; g.lineWidth = Math.max(1.2, w * 0.035);
    g.beginPath();
    g.arc(x - w * 0.28, y - bh - w * 0.16, w * 0.26, 0, Math.PI * 2);
    g.arc(x + w * 0.28, y - bh - w * 0.16, w * 0.26, 0, Math.PI * 2);
    g.moveTo(x + w * 0.24, y - bh - w * 0.32);
    g.arc(x, y - bh - w * 0.32, w * 0.3, 0, Math.PI * 2);
    g.fill();
    K.rr(x - w / 2 + w * 0.06, y - bh - w * 0.05, w - w * 0.12, bh + w * 0.05, w * 0.06); g.fill(); g.stroke();
    g.restore();
  }
  /** a cook centred on its tile at (x, y), tile size s. o:
   *   kind      'app' (default: gold person) | 'tray' (gold + clock badge) | 'service' (night staff: grey tile,
   *             grey hat, gear badge) | 'agent' (sparkle head cook, gold) | 'ghost' (leftover / ended: dashed
   *             outline, no fill, 45% — the "earlier copy" or a gone cook)
   *   icon      override the tile icon (e.g. 'folder' File Explorer, 'terminal', 'code', 'globe')
   *   ai        sparkle badge (true for AI cooks: model servers, MCP servers, agent helpers)
   *   badge     explicit badge icon name ('gear' | 'clock' | 'lock' | 'sparkle' | 'cross'), badgeColor
   *   pid       ticket text under the tile ('PID 18412' or just '18412'); pidK 0..1 clips it on (drops 20 px)
   *   pidFlip / pidNext  ticket flip (scene 15)
   *   name      mono name under the ticket ('node.exe', 26 px) ; nameColor
   *   satchel   true | false | {open, cards, ...} (01.05 satchel on the right hip, 0.5 x s) ; satchelK 0..1
   *   hat       default true ; lit 0..1 (gold outline glow) ; named 0..1 (terracotta outline: the thing named)
   *   dim 0..1  (fades to 35%) ; alpha ; walking 0..1 (step bob) ; idle (default 1: tiny breathing bob, phase o.phase)
   *   flicker 0..1  (scene 04 'cores': gently dims to 45% when off its core; drive it slowly, no flashing)
   *  Good sizes: 120 hero (03/04 zoom), 96 at the counter (default), 64 in crowds (11 node cooks), 44 tiny (dots).
   *  Below s 70 drop the name and the satchel (they get illegible); the ticket stays readable at size 26 down to s 64.
   *  Returns {x, y, top, bottom, sx, sy, ss, ticketY, nameY} (bottom = lowest drawn item's bottom). */
  function cook(t, x, y, s, o = {}) {
    const kind = o.kind || 'app';
    const a0 = clamp01(pick(o.alpha, 1)) * (1 - 0.65 * clamp01(o.dim)) * (1 - 0.55 * clamp01(o.flicker));
    const bob = -Math.abs(Math.sin(t * 8.5)) * s * 0.06 * clamp01(o.walking) + K.wave(t, 0.9, s * 0.012 * pick(o.idle, 1), pick(o.phase, x * 0.013));
    const yy = y + bob;
    const ss = s * 0.5, sx = x + s * 0.5, sy = yy + s * 0.32;
    const tkY = yy + s / 2 + 30, nmY = tkY + 52;
    const res = { x, y: yy, top: yy - s / 2 - s * 0.62, bottom: o.name ? nmY + 8 : o.pid ? tkY + 22 : yy + s / 2, sx, sy, ss, ticketY: tkY, nameY: nmY };
    if (a0 <= 0.002) return res;
    const g = G();
    const ghost = kind === 'ghost', night = kind === 'service';
    const ak = ghost ? 0.45 : 1;
    K.layer(a0 * ak, () => {
      const lit = o.lit === true ? 1 : clamp01(o.lit), named = o.named === true ? 1 : clamp01(o.named);
      // satchel strap behind the tile
      const sk = o.satchel ? clamp01(pick(o.satchelK, 1)) : 0;
      if (sk > 0 && !ghost) K.layer(sk, () => K.path([[sx + ss * 0.3, sy - ss * 0.3], [x + s * 0.52, yy - s * 0.48], [x + s * 0.05, yy - s * 0.6], [x - s * 0.36, yy - s * 0.4]], { color: P.leatherFlap, w: Math.max(4, s * 0.06), head: false }));
      // tile
      const icon = o.icon || (kind === 'agent' ? 'sparkle' : 'person');
      const icol = night ? P.nightIcon : ghost ? C.soft : (o.iconColor || P.cookIcon);
      if (ghost) {
        g.save(); g.setLineDash([8, 7]); g.lineWidth = 2.5; g.strokeStyle = C.soft; K.rr(x - s / 2, yy - s / 2, s, s, s * 0.28); g.stroke(); g.restore();
        K.icon(icon, x, yy, s * 0.62, { color: icol });
      } else {
        const stroke = named > 0.05 ? K.mixColor(C.line2, C.accent, named) : lit > 0.05 ? K.mixColor(C.line2, C.head, lit) : night ? C.line : C.line2;
        K.card(x - s / 2, yy - s / 2, s, s, { r: s * 0.28, fill: night ? P.night : P.cook, stroke, glow: lit, lw: named > 0.05 || lit > 0.05 ? 2.5 : 1.5 });
        if (named > 0) { g.save(); g.shadowColor = K.rgba(C.accent, 0.6 * named); g.shadowBlur = 30; g.lineWidth = 2.5; g.strokeStyle = K.rgba(C.accent, named); K.rr(x - s / 2, yy - s / 2, s, s, s * 0.28); g.stroke(); g.restore(); }
        K.icon(icon, x, yy + (icon === 'person' ? s * 0.04 : 0), s * 0.62, { color: icol, w: Math.max(2, s * 0.03) });
      }
      // hat
      if (pick(o.hat, true)) toque(x, yy - s / 2 + 3, s * 0.5, ghost ? K.rgba(P.paper, 0.3) : night ? P.nightHat : P.hat, ghost ? C.soft : night ? C.soft : P.paperShade);
      // satchel on the hip
      if (sk > 0 && !ghost) {
        const so = typeof o.satchel === 'object' ? o.satchel : {};
        satchel(t, sx, sy, ss, { strap: 'none', names: false, ...so, alpha: sk * pick(so.alpha, 1) });
      }
      // badge (top-right corner of the tile)
      const bname = o.badge || (o.ai ? 'sparkle' : night ? 'gear' : kind === 'tray' ? 'clock' : null);
      if (bname) {
        badge(bname, x + s * 0.44, yy - s * 0.44, Math.max(13, s * 0.17), { color: o.badgeColor || (night ? C.soft : bname === 'cross' ? C.accent : C.head) });
      }
      // ticket
      const pk = o.pid != null ? clamp01(pick(o.pidK, 1)) : 0;
      if (pk > 0) {
        const txt = /^\d+$/.test(String(o.pid)) ? 'PID ' + o.pid : String(o.pid);
        ticket(txt, x, tkY - (1 - K.ease.out(pk)) * 20, { alpha: pk, flip: o.pidFlip, next: o.pidNext != null ? (/^\d+$/.test(String(o.pidNext)) ? 'PID ' + o.pidNext : o.pidNext) : null, lit: o.pidLit });
      }
      if (o.name) K.text(o.name, x, o.pid != null ? nmY : yy + s / 2 + 38, { font: 'mono', weight: 600, size: o.nameSize || 26, color: o.nameColor || (night ? C.soft : C.strong), align: 'center' });
    });
    return res;
  }

  // ---------------------------------------------------------------- the counter (memory)
  /** the long counter. o:
   *   geo (L.counter: {x, y, w, h, n stretches}) ; k 0..1 (draws in from the left) ; alpha
   *   lit {i: k} or [k...] : stretch i washes gold (its memory) ; named {i: k} : terracotta wash
   *   wall {at: i, k} : a solid wall + lock between stretch i and i+1 (scene 04 'private')
   *   threads {i: {n, k}} : n small worker dots sharing stretch i (scene 04 'threads')
   *   items {i: [{icon, k}]} : small objects on a stretch (e.g. 'brain' for a loaded model, scene 10)
   *   extend 0..1 : the counter grows off both screen edges (scene 04 'count')
   *   dividers (default true) */
  function counter(t, o = {}) {
    const base = o.geo || L.counter, a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    if (a <= 0.002 || k <= 0) return;
    const ex = K.ease.io(clamp01(o.extend));
    const geo = { ...base, x: K.lerp(base.x, -40, ex), w: K.lerp(base.w, 2000, ex) };
    const g = G();
    const get = (m, i) => (m == null ? 0 : Array.isArray(m) ? clamp01(m[i]) : clamp01(m[i]));
    K.layer(a, () => {
      const w = geo.w * K.ease.io(k);
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 70; g.shadowOffsetY = 26;
      K.rr(geo.x, geo.y, w, geo.h, 20); g.fillStyle = P.counter; g.fill(); g.restore();
      g.save(); K.rr(geo.x, geo.y, w, geo.h, 20); g.clip();
      // wood-grain hairlines (deterministic)
      const rnd = K.rng(61);
      for (let i = 0; i < 9; i++) { const ly = geo.y + 24 + rnd() * (geo.h - 40); K.line(geo.x + rnd() * 200, ly, geo.x + w - rnd() * 200, ly, { color: K.rgba(C.line2, 0.35), w: 1.2 }); }
      // stretch washes
      for (let i = 0; i < geo.n; i++) {
        const st = stretchAt(i, geo), lk = get(o.lit, i), nk = get(o.named, i);
        if (lk > 0) { const gr = g.createLinearGradient(0, st.y, 0, st.y + st.h); gr.addColorStop(0, K.rgba(C.head, 0.34 * lk)); gr.addColorStop(1, K.rgba(C.head, 0.1 * lk)); g.fillStyle = gr; g.fillRect(st.x + 3, st.y, st.w - 6, st.h); }
        if (nk > 0) { g.fillStyle = K.rgba(C.accent, 0.22 * nk); g.fillRect(st.x + 3, st.y, st.w - 6, st.h); }
      }
      g.restore();
      // top edge
      K.line(geo.x + 14, geo.y + 1.5, geo.x + w - 14, geo.y + 1.5, { color: P.counterTop, w: 3 });
      g.save(); g.lineWidth = 1.5; g.strokeStyle = C.line2; K.rr(geo.x, geo.y, w, geo.h, 20); g.stroke(); g.restore();
      // dividers
      if (pick(o.dividers, true)) for (let i = 1; i < geo.n; i++) { const dx = geo.x + i * geo.w / geo.n; if (dx < geo.x + w) K.line(dx, geo.y + 16, dx, geo.y + geo.h - 16, { color: C.line2, w: 1.5, dash: [6, 8] }); }
      // lit outlines
      for (let i = 0; i < geo.n; i++) {
        const st = stretchAt(i, geo), lk = get(o.lit, i);
        if (lk > 0.05) { g.save(); g.globalAlpha *= lk; g.shadowColor = K.rgba(C.head, 0.6); g.shadowBlur = 24; g.lineWidth = 2.5; g.strokeStyle = C.head; K.rr(st.x + 6, st.y + 6, st.w - 12, st.h - 12, 14); g.stroke(); g.restore(); }
      }
      // threads: worker dots sharing a stretch
      Object.entries(o.threads || {}).forEach(([i, th]) => {
        const st = stretchAt(+i, geo), n = th.n || 3, tk = clamp01(pick(th.k, 1));
        for (let j = 0; j < n; j++) {
          const dk = K.clamp(tk * n - j); if (dk <= 0) continue;
          const px = st.cx + Math.sin(t * 0.7 + j * 2.1) * st.w * 0.3, py = st.cy + Math.cos(t * 0.55 + j * 1.7) * st.h * 0.22;
          K.glow(px, py, 26, C.head, 0.3 * dk);
          g.save(); g.globalAlpha *= dk; g.beginPath(); g.arc(px, py, 9, 0, Math.PI * 2); g.fillStyle = C.head; g.fill(); g.restore();
        }
      });
      // items on a stretch
      Object.entries(o.items || {}).forEach(([i, list]) => {
        const st = stretchAt(+i, geo);
        list.forEach((it, j) => {
          const ik = clamp01(pick(it.k, 1)); if (ik <= 0) return;
          const ix = st.cx + (j - (list.length - 1) / 2) * 70;
          K.layer(ik, () => { if (it.lit) K.glow(ix, st.cy, 70, C.head, 0.35); K.icon(it.icon, ix, st.cy, it.s || 56, { color: it.color || C.head, w: 3 }); });
        });
      });
      // a wall between two stretches
      if (o.wall) {
        const wk = clamp01(pick(o.wall.k, 1));
        const dx = geo.x + (o.wall.at + 1) * geo.w / geo.n;
        if (wk > 0) {
          const top = geo.y - 24, bot = geo.y + geo.h + 10;
          K.line(dx, bot, dx, K.lerp(bot, top, K.ease.io(wk)), { color: C.strong, w: 9 });
          if (wk > 0.6) { const lk = K.seg(wk, 0.6, 1); badge('lock', dx, geo.y + geo.h / 2, 28, { alpha: lk, color: C.head }); }
        }
      }
    });
  }

  // ---------------------------------------------------------------- order slip (requests through a hatch)
  /** a small paper order slip centred at (x, y), size s (height; width 0.78 s). o: {alpha, rot, lit} */
  function slip(x, y, s = 56, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return;
    const g = G(), w = s * 0.78, h = s;
    K.layer(a, () => {
      g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot);
      g.shadowColor = o.lit ? K.rgba(C.head, 0.6) : 'rgba(0,0,0,.35)'; g.shadowBlur = 16;
      K.rr(-w / 2, -h / 2, w, h, 4); g.fillStyle = P.paper; g.fill(); g.shadowColor = 'transparent';
      for (let i = 0; i < 3; i++) K.line(-w / 2 + 8, -h / 2 + 14 + i * h * 0.22, w / 2 - 8 - (i === 2 ? w * 0.3 : 0), -h / 2 + 14 + i * h * 0.22, { color: '#B9AD98', w: 2.5 });
      g.restore();
    });
  }

  // ---------------------------------------------------------------- the serving hatch (a port)
  /** a hatch centred at (x, y). o:
   *   num ('3000', mono 30 on a plate over the opening) ; owner ('Node', 26 px under) ; ownerMono (true: mono owner)
   *   state  'idle' (dark opening) | 'open' (warm gold light inside: a cook is serving) | 'busy' (= open + named
   *          terracotta frame: the one being talked about) | 'blocked' (terracotta bar across + X) | 'dim' (35%)
   *   w (210), h (124), k 0..1 (draws in: frame, then light), alpha, bar 0..1 (blocked bar slides across),
   *   lock 0..1 (gold lock on the plate) ; ai (sparkle badge top-right) ; small (strip hatch: 46x34, no text)
   *   slips n (order slips waiting on the sill, scene 08 'hatch') ; slipK 0..1 */
  function hatch(t, x, y, o = {}) {
    const small = !!o.small, w = o.w || (small ? 46 : 210), h = o.h || (small ? 34 : 124);
    const a = clamp01(pick(o.alpha, 1)) * (o.state === 'dim' ? 0.35 : 1), k = clamp01(pick(o.k, 1));
    if (a <= 0.002 || k <= 0) return;
    const g = G(), st = o.state || 'idle';
    const open = st === 'open' || st === 'busy';
    K.layer(a * K.ease.out(K.clamp(k * 1.6)), () => {
      const x0 = x - w / 2, y0 = y - h / 2;
      const frame = st === 'busy' || st === 'blocked' ? C.accent : open ? C.head : C.line2;
      // frame + opening
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = small ? 10 : 40; g.shadowOffsetY = small ? 4 : 14;
      K.rr(x0, y0, w, h, small ? 4 : 8); g.fillStyle = C.tile; g.fill(); g.restore();
      const ix = x0 + (small ? 5 : 14), iy = y0 + (small ? 5 : 44), iw = w - (small ? 10 : 28), ih = h - (small ? 10 : 56);
      g.save(); K.rr(ix, iy, iw, ih, small ? 2 : 5); g.fillStyle = C.page; g.fill();
      const lk = open ? K.seg(k, 0.4, 1) : 0;
      if (lk > 0) {
        g.clip(); const gr = g.createRadialGradient(x, iy + ih, 0, x, iy + ih, iw * 0.8);
        gr.addColorStop(0, K.rgba(C.head, 0.75 * lk)); gr.addColorStop(1, K.rgba(C.head, 0.05 * lk)); g.fillStyle = gr; g.fillRect(ix, iy, iw, ih);
      }
      // closed shutter (nobody listening): slats
      if (!open && st !== 'blocked') { const nsl = small ? 2 : 4; for (let i = 1; i <= nsl; i++) { const sy2 = iy + ih * i / (nsl + 1); g.beginPath(); g.moveTo(ix + 4, sy2); g.lineTo(ix + iw - 4, sy2); g.lineWidth = small ? 1.5 : 2; g.strokeStyle = K.rgba(C.line2, 0.9); g.stroke(); } }
      g.restore();
      if (open && !small) K.glow(x, y + h * 0.2, w * 0.7, C.head, 0.22 * lk);
      g.save(); g.lineWidth = st === 'idle' ? 1.5 : 2.5; g.strokeStyle = frame; K.rr(x0, y0, w, h, small ? 4 : 8); g.stroke(); g.restore();
      // sill
      if (!small) K.line(x0 - 8, y0 + h, x0 + w + 8, y0 + h, { color: open ? C.head : C.line2, w: 4 });
      // number plate
      if (!small && o.num != null) {
        K.text(String(o.num), x, y0 + 34, { font: 'mono', weight: 700, size: o.numSize || 30, color: open ? C.head : st === 'blocked' ? C.accent : C.strong, align: 'center' });
      }
      if (o.lock) K.icon('lock', x0 + 24, y0 + 22, 26, { color: C.head, alpha: clamp01(o.lock), w: 2.2 });
      if (o.ai) badge('sparkle', x0 + w - 4, y0 + 4, small ? 10 : 18, {});
      // blocked bar
      const bar = st === 'blocked' ? clamp01(pick(o.bar, 1)) : clamp01(o.bar);
      if (bar > 0) {
        const by = iy + ih / 2;
        K.line(ix - 6, by, K.lerp(ix - 6, ix + iw + 6, K.ease.io(bar)), by, { color: C.accent, w: small ? 4 : 10 });
        if (!small && bar > 0.7) cross(x + w / 2 + 34, y0 - 8, 44, K.seg(bar, 0.7, 1));
      }
      // slips on the sill
      const n = o.slips || 0, sk = clamp01(pick(o.slipK, 1));
      for (let i = 0; i < n; i++) {
        const sk2 = K.clamp(sk * n - i); if (sk2 <= 0) continue;
        slip(x - (n - 1) * 22 + i * 44, y0 + h + 34 - (1 - K.ease.out(sk2)) * 40, 44, { alpha: sk2, rot: (i - 1) * 0.08 });
      }
      if (!small && o.owner) K.text(o.owner, x, y0 + h + (n ? 96 : 42), { font: o.ownerMono ? 'mono' : 'ui', weight: 600, size: 26, color: open ? C.strong : C.body, align: 'center' });
    });
  }
  /** the back wall: a faint band + hatches at L.hatches.xs. o: {hatches [{num, owner, state, k, ...}], k (wall),
   *  alpha, geo (L.hatches), y offset via geo}. Returns geo. */
  function hatchWall(t, o = {}) {
    const geo = o.geo || L.hatches, a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    if (a <= 0.002) return geo;
    const g = G();
    K.layer(a, () => {
      const wy = geo.y - 26, wh = geo.h + 52, x0 = Math.max(90, Math.min(...geo.xs) - geo.w / 2 - 50), w = (Math.min(1830, Math.max(...geo.xs) + geo.w / 2 + 50) - x0) * K.ease.io(k);
      if (w > 2) { g.save(); K.rr(x0, wy, w, wh, 18); g.fillStyle = K.rgba(P.wall, 0.85); g.fill(); g.restore(); K.line(x0 + 10, wy + wh, x0 + w - 10, wy + wh, { color: C.line2, w: 2 }); }
      (o.hatches || []).forEach((hh, i) => { if (i < geo.xs.length) hatch(t, geo.xs[i], geo.y + geo.h / 2, { w: geo.w, h: geo.h, ...hh, k: clamp01(pick(hh.k, 1)) * K.seg(k, 0.2, 1) }); });
    });
    return geo;
  }

  // ---------------------------------------------------------------- the glass fence (a sandbox)
  /** dashed gold rounded fence around (x, y, w, h). o: {k 0..1 (the dashes draw around), label (eyebrow, top-left
   *  on a dark tab), alpha, glow 0..1, color (C.head), r (28), fill (true: faint glass)} */
  function fence(x, y, w, h, o = {}) {
    const a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    if (a <= 0.002 || k <= 0) return;
    const g = G(), col = o.color || P.fence, r = pick(o.r, 28);
    K.layer(a, () => {
      if (pick(o.fill, true)) { g.save(); g.globalAlpha *= K.ease.io(k); K.rr(x, y, w, h, r); const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, K.rgba(col, 0.09)); gr.addColorStop(0.5, K.rgba(col, 0.03)); gr.addColorStop(1, K.rgba(col, 0.07)); g.fillStyle = gr; g.fill(); g.restore(); }
      if (o.glow) K.glow(x + w / 2, y + h / 2, Math.max(w, h) * 0.6, col, 0.12 * clamp01(o.glow));
      // the outline, drawn by progress around the perimeter (top-left, clockwise)
      const pts = [[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r], [x + r, y]];
      K.path(pts, { k, color: col, w: 3, dash: [14, 10], head: false, tension: 0.25 });
      // glass glints
      if (k >= 1) { K.line(x + 24, y + 44, x + 44, y + 24, { color: K.rgba(C.strong, 0.35), w: 3 }); K.line(x + 24, y + 70, x + 70, y + 24, { color: K.rgba(C.strong, 0.18), w: 3 }); }
      if (o.label) {
        const lw = K.measure(o.label, T.eyebrow) + 36;
        const lk = K.seg(k, 0.5, 1);
        K.card(x + 30, y - 22, lw, 44, { r: 22, fill: C.panel, stroke: col, shadow: false, alpha: lk });
        eyebrow(o.label, x + 30 + lw / 2, y + 9, { alpha: lk, color: col });
      }
    });
  }

  // ---------------------------------------------------------------- parent link
  /** a dashed parent -> child link from (x1, y1) to (x2, y2). o: {k 0..1, label ('parent'; null hides),
   *  color (C.soft; gold when lit), lit, bend (40), alpha, w, head (true)} */
  function parentLink(x1, y1, x2, y2, o = {}) {
    const k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1)); if (k <= 0 || a <= 0.002) return;
    const col = o.color || (o.lit ? C.head : C.soft);
    K.layer(a, () => {
      K.arrow(x1, y1, x2, y2, { k, bend: pick(o.bend, 40), color: col, w: o.w || 3, dash: [10, 8], head: pick(o.head, true) });
      const lb = o.label === undefined ? 'parent' : o.label;
      if (lb && k > 0.6) {
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, b = pick(o.bend, 40);
        const mx = (x1 + x2) / 2 - (dy / len) * b * 0.5, my = (y1 + y2) / 2 + (dx / len) * b * 0.5;
        K.pill(lb, mx, my, { size: 26, fill: C.panel, stroke: col, color: o.lit ? C.head : C.body, alpha: K.seg(k, 0.6, 1) });
      }
    });
  }

  // ---------------------------------------------------------------- a window as a door
  /** an app window (K.win) that is the cook's door. Closing collapses it into its title bar, then fades it;
   *  a faint dashed outline stays where the door was (o.ghost, default true). o:
   *   title, kind ('browser' | 'terminal' | 'notepad' | 'code' | 'explorer'), close 0..1, focus, alpha,
   *   inner(rect) callback to draw the content while open (clipped), titleSize (26)
   *  Default rect L.door. Returns the content rect. */
  function doorWin(t, o = {}) {
    const x = pick(o.x, L.door.x), y = pick(o.y, L.door.y), w = pick(o.w, L.door.w), h = pick(o.h, L.door.h);
    const c = K.ease.io(clamp01(o.close)), a = clamp01(pick(o.alpha, 1));
    const g = G();
    let rect = { x, y: y + 50, w, h: h - 50 };
    if (a <= 0.002) return rect;
    K.layer(a, () => {
      if (pick(o.ghost, true) && c > 0) { g.save(); g.globalAlpha *= 0.5 * c; g.setLineDash([10, 9]); g.lineWidth = 2; g.strokeStyle = C.soft; K.rr(x, y, w, h, 14); g.stroke(); g.restore(); }
      const hh = K.lerp(h, 50, c), fade = 1 - K.seg(c, 0.75, 1);
      if (fade <= 0.002) return;
      K.layer(fade, () => {
        rect = K.win(x, y, w, hh, { title: o.title || '', titleSize: o.titleSize || 26, kind: o.kind || 'browser', focus: o.focus, url: o.url });
        if (o.inner && hh > 70) { g.save(); K.rr(rect.x, rect.y, rect.w, Math.max(0, rect.h), 0); g.clip(); K.layer(1 - c, () => o.inner(rect)); g.restore(); }
      });
    });
    return rect;
  }

  // ---------------------------------------------------------------- the staff board (Task Manager mock-up)
  const NAV = ['Processes', 'Performance', 'App history', 'Startup apps', 'Users', 'Details', 'Services'];
  const NAV_ICON = { Processes: 'program', Performance: 'brain', 'App history': 'clock', 'Startup apps': 'sparkle', Users: 'person', Details: 'book', Services: 'gear' };
  /** Task Manager drawn as the kitchen's staff board. Default rect L.board (1440x760). o:
   *   x, y, w, h ; title ('Task Manager') ; tab (one of NAV: 'Processes' | 'Details' | 'Services' | 'Startup apps')
   *   tabK 0..1 (gold wash on the active nav item) ; nav (default true; false = no left column, for small boards)
   *   heading (defaults to tab) ; k 0..1 (whole board reveal) ; alpha ; focus
   *   cols [{name, w (px), align ('left'|'right'|'center'), dashed (a new / hidden column: dashed header outline),
   *          k 0..1 (column slides in)}]   (first column is the name column and takes the remaining width)
   *   rows [{name, icon ('program' default; 'gear' service; 'sparkle' AI; 'folder', 'globe', 'code'...),
   *          group (makes this a group header row: 'Apps (3)'), kind ('service' => grey name), cells [string |
   *          {bar: 0..1} | {pill: 'Running'|'Stopped'} | {mark: true} (a gold check: Isolation column)],
   *          k 0..1 (row reveal), hl 0..1 (gold highlight), named 0..1 (terracotta highlight), gone 0..1
   *          (row fades out + strike: 'End task'), ai (sparkle after the name), alpha}]
   *   rowH (56) ; size (26: the minimum, do not go lower)
   *  Returns {x, y, w, h, body: {x, y, w, h}, rowY(i) -> centre y of row i, colX(j) -> left x of column j}.
   *  Good sizes: full 1440x760 (06); 900x560 small (13, nav false); scale with K.at for a wall thumbnail
   *  (the staff board in 03/05/14 at ~0.28: draw it with rows as bars, text unreadable on purpose). */
  function board(t, o = {}) {
    const x = pick(o.x, L.board.x), y = pick(o.y, L.board.y), w = pick(o.w, L.board.w), h = pick(o.h, L.board.h);
    const a = clamp01(pick(o.alpha, 1)) * K.ease.out(clamp01(pick(o.k, 1)));
    const size = o.size || 26, rowH = o.rowH || 56;
    const showNav = pick(o.nav, true), navW = showNav ? (o.navW || L.board.nav) : 0;
    const tab = o.tab || 'Processes';
    const g = G();
    const bx = x + navW + 36, bw = w - navW - 72;
    const cols = o.cols || [];
    const fixedW = cols.slice(1).reduce((s, c) => s + (c.w || 200) * clamp01(pick(c.k, 1)), 0);
    const colX = (j) => { if (j === 0) return bx; let cx = bx + (bw - fixedW); for (let i = 1; i < j; i++) cx += (cols[i].w || 200) * clamp01(pick(cols[i].k, 1)); return cx; };
    const headY = y + 50 + 70, colY = headY + 56, rowsY = colY + 30;
    const res = { x, y, w, h, body: { x: bx, y: rowsY, w: bw, h: y + h - rowsY }, rowY: (i) => rowsY + i * rowH + rowH / 2, colX };
    if (a <= 0.002) return res;
    K.layer(a, () => {
      const r = K.win(x, y, w, h, { title: o.title || 'Task Manager', titleSize: 28, kind: 'explorer', focus: o.focus });
      // nav column
      if (showNav) {
        g.save(); g.fillStyle = K.rgba(C.tile, 0.6); g.fillRect(x + 1, r.y, navW, r.h - 14); g.restore();
        K.line(x + navW, r.y, x + navW, y + h - 16, { color: C.line, w: 1.5 });
        const step = Math.min(64, (r.h - 30) / NAV.length);
        g.save(); K.rr(x, r.y, navW, r.h - 6, 0); g.clip();
        NAV.forEach((nm, i) => {
          const ny = r.y + 22 + step / 2 + i * step, act = nm === tab, ak = act ? clamp01(pick(o.tabK, 1)) : 0;
          if (ak > 0) { K.card(x + 14, ny - Math.min(26, step / 2 - 3), navW - 28, Math.min(52, step - 6), { r: 12, fill: K.mixColor(C.tile, C.head, 0.16), stroke: false, shadow: false, alpha: ak }); K.line(x + 18, ny - 14, x + 18, ny + 14, { color: C.head, w: 5, alpha: ak }); }
          K.icon(NAV_ICON[nm] || 'program', x + 50, ny, 30, { color: ak > 0.5 ? C.head : C.soft, w: 2 });
          K.text(nm, x + 80, ny + 9, { font: 'ui', weight: 600, size, color: ak > 0.5 ? C.head : C.body });
        });
        g.restore();
      }
      // heading + columns
      K.text(o.heading || tab, bx, headY, { font: 'head', weight: 700, size: 38, color: C.head });
      cols.forEach((c, j) => {
        const ck = clamp01(pick(c.k, 1)); if (ck <= 0) return;
        const cx = colX(j), cw = j === 0 ? bw - fixedW : (c.w || 200) * ck;
        const al = c.align || (j === 0 ? 'left' : 'right');
        const tx = al === 'left' ? cx + (j === 0 ? 0 : 14) : al === 'center' ? cx + cw / 2 : cx + cw - 14;
        K.layer(ck, () => {
          if (c.dashed) { g.save(); g.setLineDash([8, 6]); g.lineWidth = 2; g.strokeStyle = C.head; K.rr(cx + 4, colY - 34, cw - 8, 48, 10); g.stroke(); g.restore(); }
          K.text(c.name, tx, colY, { font: 'ui', weight: 600, size, color: c.dashed ? C.head : C.soft, align: al });
        });
      });
      K.line(bx, colY + 16, bx + bw, colY + 16, { color: C.line, w: 1.5 });
      // rows (clipped to the window)
      g.save(); K.rr(x, rowsY - 4, w, y + h - rowsY - 10, 0); g.clip();
      (o.rows || []).forEach((rw, i) => {
        const rk = clamp01(pick(rw.k, 1)); if (rk <= 0) return;
        const ry = rowsY + i * rowH, cy = ry + rowH / 2, gone = clamp01(rw.gone);
        K.layer(rk * (1 - gone) * pick(rw.alpha, 1), () => {
          g.save(); g.translate((1 - K.ease.out(rk)) * 30, 0);
          if (rw.group) { K.text(rw.group, bx, cy + 9, { font: 'ui', weight: 700, size, color: C.head }); g.restore(); return; }
          const hl = clamp01(rw.hl), nm = clamp01(rw.named);
          if (hl > 0) K.card(bx - 12, ry + 4, bw + 24, rowH - 8, { r: 12, fill: K.rgba(C.head, 0.14), stroke: K.rgba(C.head, 0.8), shadow: false, alpha: hl });
          if (nm > 0) K.card(bx - 12, ry + 4, bw + 24, rowH - 8, { r: 12, fill: K.rgba(C.accent, 0.16), stroke: C.accent, shadow: false, alpha: nm });
          const svc = rw.kind === 'service';
          const ic = rw.icon || (svc ? 'gear' : 'program');
          K.icon(ic, bx + 22, cy, 30, { color: svc ? C.soft : C.head, w: 2 });
          const nameW = bw - fixedW - 70 - (rw.ai ? 44 : 0);
          g.save(); g.beginPath(); g.rect(bx + 40, ry, nameW + 12, rowH); g.clip();
          const nw = K.text(rw.name, bx + 52, cy + 9, { font: rw.mono ? 'mono' : 'ui', weight: 600, size, color: svc ? C.body : C.strong });
          if (nw > nameW) { const fx = bx + 52 + nameW - 50, gr = g.createLinearGradient(fx, 0, fx + 62, 0); gr.addColorStop(0, K.rgba(C.code, 0)); gr.addColorStop(1, K.rgba(C.code, 1)); g.fillStyle = gr; g.fillRect(fx, ry + 6, 62, rowH - 12); }
          g.restore();
          if (rw.ai) badge('sparkle', bx + 52 + Math.min(nw, nameW) + 24, cy, 15, {});
          (rw.cells || []).forEach((cell, j) => {
            const c = cols[j + 1]; if (!c) return;
            const ck = clamp01(pick(c.k, 1)); if (ck <= 0.05 || cell == null) return;
            const cx = colX(j + 1), cw = (c.w || 200) * ck, al = c.align || 'right';
            K.layer(ck, () => {
              if (typeof cell === 'string' || typeof cell === 'number') {
                K.text(String(cell), al === 'center' ? cx + cw / 2 : cx + cw - 14, cy + 9, { font: 'mono', weight: 600, size, color: C.strong, align: al === 'center' ? 'center' : 'right' });
              } else if (cell.bar != null) {
                const bw2 = cw - 40, bxx = cx + 20;
                K.rr(bxx, cy - 7, bw2, 14, 7); g.fillStyle = K.rgba(C.line2, 0.6); g.fill();
                K.rr(bxx, cy - 7, Math.max(14, bw2 * clamp01(cell.bar)), 14, 7); g.fillStyle = cell.color || K.mixColor(C.head, C.tile, 0.25); g.fill();
              } else if (cell.pill) {
                const run = cell.pill === 'Running', pw = K.measure(cell.pill, T.label) + 32, ph = Math.min(40, rowH - 12);
                K.card(cx + cw / 2 - pw / 2, cy - ph / 2, pw, ph, { r: ph / 2, fill: run ? K.mixColor(C.tile, C.head, 0.12) : C.tile, stroke: run ? C.head : C.line2, shadow: false });
                K.text(cell.pill, cx + cw / 2, cy + 9, { ...T.label, color: run ? C.head : C.soft, align: 'center' });
              } else if (cell.mark) {
                K.icon('check', cx + cw / 2, cy, 32, { color: C.head, w: 3 });
              }
            });
          });
          if (gone > 0) K.line(bx, cy, bx + bw * K.ease.io(K.clamp(gone * 2)), cy, { color: C.accent, w: 3 });
          g.restore();
        });
        if (i < (o.rows || []).length - 1 && !rw.group) K.line(bx, ry + rowH, bx + bw, ry + rowH, { color: K.rgba(C.line, 0.7), w: 1, alpha: rk * (1 - clamp01(rw.gone)) });
      });
      g.restore();
    });
    return res;
  }

  /** the STAFF BOARD as it hangs on the kitchen wall (03, 05, 14; it grows into M.board in 06): a pinned dark
   *  board, centred at (x, y), w x h (default 240 x 300), rows drawn as name bars + gold/grey status dots
   *  (deliberately unreadable: it is the object, not the data). o: {rows (8), lit 0..1 (gold outline + glow),
   *  label ('staff board', 26 px under it; null hides), night (count of grey service rows at the bottom, 3),
   *  alpha, k 0..1 (rows fill in)} */
  function staffBoard(t, x, y, o = {}) {
    const w = o.w || 240, h = o.h || 300, a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    if (a <= 0.002) return;
    const g = G(), lit = clamp01(o.lit), n = o.rows || 8, night = pick(o.night, 3);
    K.layer(a, () => {
      if (lit > 0) K.glow(x, y, w * 1.1, C.head, 0.25 * lit);
      K.card(x - w / 2, y - h / 2, w, h, { r: 14, fill: C.panel, stroke: lit > 0.05 ? K.mixColor(C.line2, C.head, lit) : C.line2, glow: lit, lw: 2 });
      // pin
      g.save(); g.beginPath(); g.arc(x, y - h / 2 + 2, 8, 0, Math.PI * 2); g.fillStyle = C.accent; g.fill(); g.restore();
      const rnd = K.rng(17), top = y - h / 2 + 30, step = (h - 50) / n;
      for (let i = 0; i < n; i++) {
        const rk = K.clamp(k * n - i); if (rk <= 0) continue;
        const ry = top + i * step + step / 2, svc = i >= n - night;
        K.layer(rk, () => {
          g.save(); g.beginPath(); g.arc(x - w / 2 + 26, ry, 6, 0, Math.PI * 2); g.fillStyle = svc ? C.soft : C.head; g.fill(); g.restore();
          K.line(x - w / 2 + 44, ry, x - w / 2 + 44 + (w - 110) * (0.45 + 0.5 * rnd()), ry, { color: svc ? C.line2 : C.body, w: 6, alpha: svc ? 0.9 : 0.6 });
          K.line(x + w / 2 - 44, ry, x + w / 2 - 22, ry, { color: C.line2, w: 6 });
        });
      }
      const lb = o.label === undefined ? 'staff board' : o.label;
      if (lb) label(lb, x, y + h / 2 + 40, { color: lit > 0.5 ? C.head : C.body });
    });
  }

  // ---------------------------------------------------------------- the lantern mark (10-12)
  /** small lantern icon + glow + eyebrow 'the lantern' (top-right by default, L.lantern). o: {k, alpha, text} */
  function lanternMark(t, o = {}) {
    const x = pick(o.x, L.lantern.x), y = pick(o.y, L.lantern.y), a = clamp01(pick(o.alpha, 1)) * clamp01(pick(o.k, 1));
    if (a <= 0.002) return;
    K.layer(a, () => {
      const sway = K.wave(t, 0.7, 0.05, 0.3);
      K.glow(x, y, 120, C.head, 0.3);
      K.at(x, y - 30, 1, sway, () => K.icon('lantern', 0, 30, 64, { color: C.head, w: 3 }));
      eyebrow(o.text || 'the lantern', x - 50, y + 10, { align: 'right' });
    });
  }

  // ---------------------------------------------------------------- the whole kitchen (14: everything at once)
  /** the assembled kitchen: shelf + hatch wall + counter + cooks, for overview shots (14) and dim backdrops.
   *  o: {alpha, glow: {shelf, cooks, night, hatches, satchels, fence, parents} board, each 0..1 (scene 14's questions
   *  light one part at a time), dim 0..1 (whole kitchen at 35%)}. Drawn in the default layout, so scale it with
   *  K.at / K.withCam to fit (14 uses K.at(80, 120, 0.62)). */
  const KITCHEN_HATCHES = { y: 160, w: 190, h: 124, xs: [1050, 1270, 1490] };
  function kitchen(t, o = {}) {
    const gl = o.glow || {}, a = clamp01(pick(o.alpha, 1)) * (1 - 0.65 * clamp01(o.dim));
    if (a <= 0.002) return;
    K.layer(a, () => {
      shelf(t, { cards: [{ name: 'node.exe', lit: gl.shelf }, { name: 'python.exe', lit: gl.shelf }, { name: 'ollama.exe', lit: gl.shelf }] });
      hatchWall(t, { geo: KITCHEN_HATCHES, hatches: [{ num: '3000', state: gl.hatches ? 'open' : 'idle' }, { num: '5173', state: gl.hatches ? 'open' : 'idle' }, { num: '11434', state: gl.hatches ? 'open' : 'idle', ai: true }] });
      staffBoard(t, 1700, 225, { w: 150, h: 170, rows: 6, night: 2, lit: gl.board, label: null });
      counter(t, { lit: { 0: gl.cooks, 1: gl.cooks, 6: gl.night, 7: gl.night } });
      const fk = clamp01(gl.fence);
      fence(L.counter.x + 2 * L.counter.w / 8 + 10, L.cookY - 100, 2 * L.counter.w / 8 - 20, 290, { k: 1, glow: fk, alpha: 0.45 + 0.55 * fk });
      const sat = clamp01(gl.satchels);
      [0, 1].forEach((i) => cook(t, cookAt(i).x, L.cookY, 88, { pid: i ? '20118' : '18412', satchel: { glow: sat }, lit: gl.cooks }));
      [2, 3].forEach((i) => cook(t, cookAt(i).x, L.cookY, 88, { ai: true, pid: i === 2 ? '22124' : '24031', satchel: { glow: sat } }));
      [6, 7].forEach((i) => cook(t, cookAt(i).x, L.cookY, 88, { kind: 'service', lit: gl.night }));
      const pk = clamp01(gl.parents);
      if (pk > 0) parentLink(cookAt(2).x - 20, L.cookY - 90, cookAt(3).x, L.cookY - 90, { k: 1, lit: true, alpha: pk, label: null, bend: -60 });
    });
  }

  // ---------------------------------------------------------------- expose
  window.M = {
    P, T, L, palette: P, layout: L, NAV,
    // primitives
    label, eyebrow, cross, obsTag, badge, staffBoard,
    // 01.05 carry-over
    chip, satchel,
    // the metaphor
    recipe, shelf, shelfSlot, ticket, cook, counter, stretchAt, cookAt, slip,
    hatch, hatchWall, hatchAt, fence, parentLink, doorWin, board, lanternMark, kitchen,
  };
})();
