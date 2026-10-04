/* 00.06 Trust what you can verify: shared drawing (window.M)
   The lesson's one recurring object is THE HOUSE, with its CREW and its OWNER:
     the HOUSE   = the software. A small two-storey tea house (curved eaves, wood corner posts, stepping stones),
                   built in 01 and never off screen. It can be under construction (brick courses), lit, cut away
                   into four rooms (front door = lock, window = globe, data = server, back door = key), leaking,
                   given an off-style wing, split into a gold "machine checks" half and a terracotta "you check" half,
                   and repeated along a street.
     the CREW    = AI: glowing gold sparkle sprites with a tiny bob.
     the OWNER   = you: a gold figure (meeple) who signs off. Other figures share the same body: inspector (shield),
                   burglar (quiet colour, key), tenants, hand-coders, the signer (code).
     plus repeated furniture: chat bubbles, dated cards and badges, verdict chips, supplier vans, the checklist,
     the plaque/notice, the owner's view cone and the leak trail.
   Colour law (whole lesson): GOLD (C.head) = what a machine can check / the crew / the owner.
                              TERRACOTTA (C.accent) = what nobody sees: holes, leaks, drift, unknowns.
                              No status green or red. Pink only via K.petals on 01 and 16.
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
    machine: C.head,          // checkable: crew, check marks, gold half, ticked rows
    unseen: C.accent,         // not visible / not checked: holes, leaks, drift, open rows
    owner: C.head,
    crew: C.head,
    inspector: C.strong,
    burglar: C.quiet,
    tenant: C.soft,
    coder: C.body,
    outline: '#8A7E8E',       // house line work (warm grey, readable on the night ground)
    wall: '#26232F',          // plaster
    wallLit: '#2E2933',
    roof: '#1C1A28',
    roofEdge: '#5E5468',
    wood: '#6B4630',          // posts and beams
    woodHi: '#8A5E40',
    brick: '#5A3E33',
    brickLine: '#7A5646',
    glass: '#1B1C2C',
    lamp: '#F6CF84',          // lit window
    room: C.tile,
    ground: '#3A3446',
  };
  const type = {
    label: { font: 'ui', weight: 600, size: 26 },    // labels under things, chips, tags (minimum)
    read: { font: 'ui', weight: 600, size: 30 },     // anything to be read
    mono: { font: 'mono', weight: 600, size: 26 },   // literals (package.json, row-level security: off)
    body: { font: 'read', size: 30 },                // Georgia lines
  };
  const motion = {
    move: 0.7,                       // structural moves
    pop: 0.5,                        // things appearing
    bob: { speed: 1.7, amp: 4 },     // crew idle bob (px at s 60)
    sway: { speed: 0.9, amp: 1.5 },  // people idle sway (px)
    leak: 1.2,                       // leak trail draws over 1.2 s
  };
  // where things sit (from storyboard.md; text stays in x 80–1840, y 130–930)
  const layout = {
    safe: { x0: 80, x1: 1840, y0: 130, y1: 930 },
    hero: { x: 960, y: 600, s: 420 },      // 04: the mental-model house
    left: { x: 700, y: 600, s: 420 },      // 05, 12: house left, cards right
    side: { x: 520, y: 600, s: 300 },      // 06, 11: house left third
    small: { x: 420, y: 600, s: 300 },     // 07
    title: { x: 960, y: 690, s: 260 },     // 01 title card
    plaque: { x: 960, y: 680, s: 300 },    // 14
    rightCol: { x0: 1180, x1: 1800 },      // data cards beside a left house
  };

  // ---------------------------------------------------------------- the house: geometry
  /** geometry of the house centred at (x, y) with size s (body ≈ 0.76 s wide; whole house incl. eaves ≈ 1.1 s
   *  wide and 0.8 s tall; y is the middle of the walls, the ground line is at y + 0.36 s).
   *  Returns {x, y, s, body, ground, eave, ridgeY, door, windows[3], rooms{living,data,front,back},
   *  backDoor{x, y}, wing{x0,x1,y0,y1}, bounds{x0,x1,y0,y1}} in canvas coords. */
  function geo(x, y, s) {
    const u = (v) => v * s;
    const body = { x0: x - u(0.38), x1: x + u(0.38), y0: y - u(0.1), y1: y + u(0.36) };
    const mid = y + u(0.13);
    const pad = u(0.03), gap = u(0.02);
    const rw = (body.x1 - body.x0 - pad * 2 - gap) / 2;
    const rh1 = mid - body.y0 - pad - gap / 2, rh2 = body.y1 - mid - pad - gap / 2;
    const room = (cx, top, h, icon, name) => ({ x: cx, y: top, w: rw, h, cx: cx + rw / 2, cy: top + h / 2, icon, name });
    const lx = body.x0 + pad, rx = body.x0 + pad + rw + gap;
    return {
      x, y, s, body, mid,
      ground: y + u(0.36),
      eave: { x0: x - u(0.53), x1: x + u(0.53), y: y - u(0.1) },
      ridgeY: y - u(0.36),
      door: { x: x - u(0.19), y: body.y1 - u(0.1), w: u(0.12), h: u(0.2) },
      windows: [
        { x: x - u(0.19), y: y + u(0.015), w: u(0.15), h: u(0.1) },   // upper left
        { x: x + u(0.19), y: y + u(0.015), w: u(0.15), h: u(0.1) },   // upper right
        { x: x + u(0.19), y: y + u(0.245), w: u(0.15), h: u(0.1) },   // lower right
      ],
      rooms: {
        living: room(lx, body.y0 + pad, rh1, 'globe', 'window'),
        data: room(rx, body.y0 + pad, rh1, 'server', 'data'),
        front: room(lx, mid + gap / 2, rh2, 'lock', 'front door'),
        back: room(rx, mid + gap / 2, rh2, 'key', 'back door'),
      },
      backDoor: { x: body.x1, y: body.y1 - u(0.09) },
      wing: { x0: body.x1, x1: body.x1 + u(0.26), y0: y + u(0.02), y1: body.y1 },
      bounds: { x0: x - u(0.56), x1: x + u(0.56), y0: y - u(0.38), y1: y + u(0.4) },
    };
  }

  function roofPath(gm) {
    const g = G(), s = gm.s, x = gm.x, u = (v) => v * s;
    const ey = gm.eave.y, ry = gm.ridgeY;
    g.beginPath();
    g.moveTo(x - u(0.56), ey - u(0.045));                                   // upturned left tip
    g.quadraticCurveTo(x - u(0.5), ey + u(0.005), x - u(0.42), ey);          // eave underside
    g.lineTo(x + u(0.42), ey);
    g.quadraticCurveTo(x + u(0.5), ey + u(0.005), x + u(0.56), ey - u(0.045));
    g.quadraticCurveTo(x + u(0.28), ry + u(0.15), x + u(0.13), ry);         // concave slope up
    g.lineTo(x - u(0.13), ry);
    g.quadraticCurveTo(x - u(0.28), ry + u(0.15), x - u(0.56), ey - u(0.045));
    g.closePath();
  }

  /** core house drawing (no split). o: see M.house */
  function drawHouse(t, gm, o) {
    const g = G(), s = gm.s, u = (v) => v * s, B = gm.body;
    const lw = Math.max(1.6, s * 0.007);
    const ink = o.tint || palette.outline;
    const build = c01(pick(o.build, 1)), lights = c01(o.lights), cut = c01(o.cutaway), ghost = !!o.ghost;
    const walls = K.clamp((build - 0.08) / 0.6), roofK = K.clamp((build - 0.7) / 0.2), finish = K.clamp((build - 0.9) / 0.1);
    g.save();
    g.lineJoin = 'round'; g.lineCap = 'round';

    // ground + stepping stones (always first; the plot)
    const gk = K.clamp(build / 0.08);
    if (!o.noGround) {
      const gr = g.createLinearGradient(gm.x - u(0.7), 0, gm.x + u(0.7), 0);
      gr.addColorStop(0, K.rgba(palette.ground, 0)); gr.addColorStop(0.5, palette.ground); gr.addColorStop(1, K.rgba(palette.ground, 0));
      g.globalAlpha = gk; g.strokeStyle = gr; g.lineWidth = lw * 1.4;
      g.beginPath(); g.moveTo(gm.x - u(0.7), gm.ground); g.lineTo(gm.x + u(0.7), gm.ground); g.stroke();
      if (s >= 160) {
        g.fillStyle = K.rgba(palette.ground, 0.9);
        [[-0.2, 0.06, 0.07], [-0.15, 0.11, 0.06]].forEach(([dx, dy, w]) => {
          g.beginPath(); g.ellipse(gm.x + u(dx), gm.ground + u(dy) * 0.6, u(w) / 2, u(w) / 6, 0, 0, 7); g.fill();
        });
      }
      g.globalAlpha = 1;
    }

    // walls (rise from the ground while building)
    if (walls > 0) {
      g.save();
      const top = K.lerp(B.y1, B.y0, walls);
      g.beginPath(); g.rect(B.x0 - u(0.05), top, B.x1 - B.x0 + u(0.1), B.y1 - top + 2); g.clip();
      // plaster
      const wallFill = ghost ? K.rgba(palette.wall, 0.35) : K.mixColor(palette.wall, palette.wallLit, lights);
      g.fillStyle = wallFill; g.fillRect(B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0);
      // brick courses while building, fading to a faint texture when finished
      const bk = (1 - finish) * 0.9 + 0.08;
      if (!ghost && s >= 120) {
        const rows = 9, rh = (B.y1 - B.y0) / rows, bw = rh * 2.2;
        g.strokeStyle = K.rgba(palette.brickLine, bk * (1 - cut)); g.lineWidth = Math.max(1, lw * 0.6);
        for (let r = 0; r < rows; r++) {
          const yy = B.y1 - r * rh;
          g.beginPath(); g.moveTo(B.x0, yy - rh); g.lineTo(B.x1, yy - rh); g.stroke();
          for (let xx = B.x0 + (r % 2 ? bw / 2 : 0); xx < B.x1; xx += bw) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy - rh); g.stroke(); }
        }
      }
      // floor beam + corner posts (wood)
      if (!ghost) {
        g.fillStyle = palette.wood;
        g.fillRect(B.x0 - u(0.012), B.y0, u(0.024), B.y1 - B.y0);
        g.fillRect(B.x1 - u(0.012), B.y0, u(0.024), B.y1 - B.y0);
        g.globalAlpha = 1 - cut * 0.6;
        g.fillRect(B.x0, gm.mid - u(0.012), B.x1 - B.x0, u(0.024));
        g.globalAlpha = 1;
      }
      // facade: door + windows (fade out in cutaway)
      const fk = finish * (1 - cut) * (ghost ? 0.3 : 1);
      if (fk > 0) {
        g.globalAlpha = fk;
        const D = gm.door;
        g.fillStyle = palette.woodHi; K.rr(D.x - D.w / 2, D.y - D.h / 2, D.w, D.h, u(0.012)); g.fill();
        g.strokeStyle = palette.wood; g.lineWidth = lw; g.stroke();
        g.fillStyle = palette.lamp; g.beginPath(); g.arc(D.x + D.w * 0.3, D.y + u(0.01), Math.max(1.5, u(0.008)), 0, 7); g.fill();
        gm.windows.forEach((w, i) => {
          const lk = typeof o.lights === 'function' ? c01(o.lights(i)) : lights;
          g.fillStyle = K.mixColor(palette.glass, palette.lamp, lk * 0.92);
          K.rr(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h, u(0.01)); g.fill();
          g.strokeStyle = palette.wood; g.lineWidth = lw; g.stroke();
          // shoji cross bars
          g.strokeStyle = K.rgba(lk > 0.3 ? palette.woodHi : palette.outline, 0.7); g.lineWidth = Math.max(1, lw * 0.6);
          g.beginPath(); g.moveTo(w.x, w.y - w.h / 2); g.lineTo(w.x, w.y + w.h / 2); g.moveTo(w.x - w.w / 2, w.y); g.lineTo(w.x + w.w / 2, w.y); g.stroke();
        });
        g.globalAlpha = 1;
      }
      // wall outline
      g.strokeStyle = ink; g.lineWidth = lw; g.strokeRect(B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0);
      g.restore();
    }

    // cutaway rooms
    if (cut > 0 && walls >= 1) {
      Object.keys(gm.rooms).forEach((key, i) => {
        const R = gm.rooms[key];
        const rk = K.clamp(cut * 1.6 - i * 0.15);
        if (rk <= 0) return;
        const roomLit = o.roomLit ? c01(typeof o.roomLit === 'function' ? o.roomLit(key) : o.roomLit[key]) : 0;
        const hot = o.roomHot ? c01(typeof o.roomHot === 'function' ? o.roomHot(key) : o.roomHot[key]) : 0;
        g.save(); g.globalAlpha *= rk;
        K.rr(R.x, R.y, R.w, R.h, Math.min(12, u(0.03)));
        g.fillStyle = K.mixColor(K.mixColor(palette.room, '#3A3226', roomLit), '#3A2522', hot); g.fill();
        g.strokeStyle = hot > 0.05 ? K.mixColor(C.line2, palette.unseen, hot) : K.mixColor(C.line2, palette.machine, roomLit * 0.8);
        g.lineWidth = lw; g.stroke();
        g.restore();
        if (roomLit > 0) K.layer(rk * roomLit, () => K.glow(R.cx, R.cy, R.w * 0.55, C.head, 0.22));
        const ic = (o.roomIcons && o.roomIcons[key]) || R.icon;
        const icColor = hot > 0.05 ? palette.unseen : roomLit > 0.3 ? palette.machine : C.body;
        K.icon(ic, R.cx, R.cy, Math.min(R.w, R.h) * 0.5, { color: icColor, alpha: rk, w: Math.max(2, s * 0.008) });
      });
      // back door: opening in the right wall of the back room
      const bo = c01(o.backOpen);
      if (bo > 0) {
        const bd = gm.backDoor, dh = u(0.15), dw = u(0.08) * Math.sin(bo * 1.2);
        g.save();
        g.fillStyle = '#0B0C16'; g.fillRect(bd.x - lw * 2, bd.y - dh / 2, lw * 4, dh);      // the opening
        g.beginPath(); g.moveTo(bd.x, bd.y - dh / 2); g.lineTo(bd.x + dw, bd.y - dh / 2 - dw * 0.25);
        g.lineTo(bd.x + dw, bd.y + dh / 2 + dw * 0.1); g.lineTo(bd.x, bd.y + dh / 2); g.closePath();
        g.fillStyle = K.mixColor(palette.wood, C.accent, 0.35); g.fill();
        g.strokeStyle = palette.unseen; g.lineWidth = lw * 1.3; g.stroke();
        g.restore();
        K.layer(bo, () => K.glow(bd.x + u(0.03), bd.y, u(0.12), C.accent, 0.3));
      }
    }

    // off-style wing (09): flat box, round window, terracotta outline; slides out of the right wall
    const wk = c01(o.wing);
    if (wk > 0 && walls >= 1) {
      const Wg = gm.wing, wx1 = K.lerp(Wg.x0, Wg.x1, K.ease.out(wk));
      g.save();
      g.fillStyle = K.rgba('#2A2028', 1); g.fillRect(Wg.x0, Wg.y0, wx1 - Wg.x0, Wg.y1 - Wg.y0);
      g.strokeStyle = palette.unseen; g.lineWidth = lw * 1.2;
      g.beginPath(); g.moveTo(Wg.x0, Wg.y0); g.lineTo(wx1, Wg.y0); g.lineTo(wx1, Wg.y1); g.lineTo(Wg.x0, Wg.y1); g.stroke();
      g.fillStyle = palette.unseen; g.fillRect(Wg.x0, Wg.y0 - u(0.03), wx1 - Wg.x0 + u(0.02) * wk, u(0.03));
      if (wk > 0.6) {
        g.globalAlpha = K.clamp((wk - 0.6) / 0.4);
        g.beginPath(); g.arc((Wg.x0 + Wg.x1) / 2, (Wg.y0 + Wg.y1) / 2 - u(0.02), u(0.045), 0, 7); g.stroke();
      }
      g.restore();
    }

    // roof (lands from above while building)
    if (roofK > 0) {
      g.save();
      g.globalAlpha *= roofK;
      g.translate(0, -(1 - K.ease.out(roofK)) * u(0.12));
      roofPath(gm);
      g.fillStyle = ghost ? K.rgba(palette.roof, 0.4) : palette.roof; g.fill();
      g.strokeStyle = ink; g.lineWidth = lw; g.stroke();
      if (!ghost) {
        // ridge cap + under-eave beam + roof tile lines
        g.strokeStyle = palette.roofEdge; g.lineWidth = lw * 1.6;
        g.beginPath(); g.moveTo(gm.x - u(0.15), gm.ridgeY); g.lineTo(gm.x + u(0.15), gm.ridgeY); g.stroke();
        if (s >= 120) {
          g.lineWidth = Math.max(1, lw * 0.6); g.strokeStyle = K.rgba(palette.roofEdge, 0.55);
          for (let i = -3; i <= 3; i++) {
            const bx = gm.x + u(i * 0.042);
            g.beginPath(); g.moveTo(bx, gm.ridgeY + u(0.01)); g.lineTo(gm.x + u(i * 0.13), gm.eave.y - u(0.01)); g.stroke();
          }
        }
        g.fillStyle = palette.wood; g.fillRect(gm.body.x0 - u(0.02), gm.eave.y - u(0.012), gm.body.x1 - gm.body.x0 + u(0.04), u(0.024));
      }
      g.restore();
    }
    g.restore();

    // window glow (outside the clip so it spills)
    if (lights > 0 && finish > 0 && cut < 1) {
      gm.windows.forEach((w, i) => {
        const lk = typeof o.lights === 'function' ? c01(o.lights(i)) : lights;
        if (lk > 0) K.layer(lk * finish * (1 - cut), () => K.glow(w.x, w.y, u(0.16), C.head, 0.32));
      });
    }

    // leak (01): a thin terracotta trickle out of the back door, along the ground to the right
    const lk = c01(o.leak);
    if (lk > 0 && walls >= 1) {
      const p = leakPts(gm);
      K.path(p, { k: lk, color: palette.unseen, w: Math.max(2, s * 0.009), head: false, dash: [u(0.02), u(0.025)] });
      const r = K.rng(7);
      for (let i = 0; i < 5; i++) {
        const v = (i + 0.5) / 5;
        if (v > lk) break;
        const ph = (t * 0.6 + r()) % 1;
        const px = K.lerp(p[1][0], p[p.length - 1][0], v), py = p[p.length - 1][1] + 2;
        K.layer((1 - ph) * 0.8, () => { const g2 = G(); g2.fillStyle = palette.unseen; g2.beginPath(); g2.arc(px + ph * u(0.03), py, Math.max(2, u(0.008)), 0, 7); g2.fill(); });
      }
    }
  }

  /** points of the leak trail (from the back door corner along the ground to the right) */
  function leakPts(gm) {
    const s = gm.s, u = (v) => v * s;
    return [[gm.body.x1, gm.backDoor.y], [gm.body.x1 + u(0.06), gm.ground - u(0.01)], [gm.body.x1 + u(0.22), gm.ground + u(0.005)], [gm.body.x1 + u(0.48), gm.ground + u(0.01)]];
  }

  /** THE HOUSE.
   *  t: scene time (for the leak drips). x, y: centre of the walls. s: size (300–420 hero, 260 title, 200 small,
   *  100–140 street; below 120 the brick/roof-tile detail drops out).
   *  o: {
   *    build: 0..1      construction (0–.08 ground, .08–.68 brick walls rise, .7–.9 roof lands, .9–1 plaster + windows). default 1
   *    lights: 0..1 | (i) => 0..1   window glow (i 0 upper-left, 1 upper-right, 2 lower-right)
   *    cutaway: 0..1    facade fades, four room cards appear: living (globe), data (server), front (lock), back (key)
   *    roomLit: {living, data, front, back} 0..1 or (key) => 0..1   gold room wash (checked / seen / lit by the cone)
   *    roomHot: same shape                                           terracotta room wash (exposed)
   *    roomIcons: {key: iconName}   override a room's icon (e.g. back: 'lock' → drawn open by scene)
   *    backOpen: 0..1   back door opening (terracotta) in the back room's right wall (cutaway only)
   *    leak: 0..1       terracotta trickle from the back door along the ground (01)
   *    wing: 0..1       off-style wing slides out of the right wall (09)
   *    split: {k, at, labels}   gold left / terracotta right halves; at 0..1 = boundary across the house (0.5 middle)
   *    ghost: true      faint outline-only version (05's "2021" house, background streets)
   *    tint: hex        override the line colour
   *    alpha, noGround
   *  }
   *  returns geo(x, y, s) so the scene can attach things to rooms, door, back door, roof. */
  function house(t, x, y, s, o = {}) {
    const gm = geo(x, y, s);
    const sp = o.split;
    K.layer(pick(o.alpha, 1), () => {
      if (!sp || c01(sp.k) <= 0) { drawHouse(t, gm, o); return; }
      const k = c01(sp.k), at = pick(sp.at, 0.5);
      const b = gm.bounds, bx = K.lerp(b.x0, b.x1, at);
      const g = G();
      const tinted = (color) => ({ ...o, tint: K.mixColor(palette.outline, color, k) });
      // a soft colour wash over walls and roof, so each half reads as gold / terracotta at a glance
      const wash = (color) => {
        g.save(); g.globalAlpha *= 0.16 * k; g.fillStyle = color;
        g.fillRect(gm.body.x0, gm.body.y0, gm.body.x1 - gm.body.x0, gm.body.y1 - gm.body.y0);
        roofPath(gm); g.fill(); g.restore();
      };
      g.save(); g.beginPath(); g.rect(b.x0 - s, b.y0 - s, bx - (b.x0 - s), b.y1 - b.y0 + 2 * s); g.clip();
      drawHouse(t, gm, tinted(palette.machine)); wash(palette.machine);
      g.restore();
      g.save(); g.beginPath(); g.rect(bx, b.y0 - s, b.x1 + s - bx, b.y1 - b.y0 + 2 * s); g.clip();
      drawHouse(t, gm, tinted(palette.unseen)); wash(palette.unseen);
      g.restore();
      K.line(bx, b.y0 - s * 0.06, bx, b.y1 + s * 0.04, { color: C.strong, w: 2, dash: [8, 8], alpha: k });
    });
    return gm;
  }

  /** a street of n houses in a row, centred at (cx, y), size s, gap px between centres.
   *  o: {k: reveal 0..1 (left to right), focus: index drawn full, others dimmed by o.dim (default .55),
   *      each: (i) => house options (lights, wing, cutaway...), ghost: true}  returns array of geo */
  function street(t, cx, y, n, s, gap, o = {}) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * gap;
      const k = o.k == null ? 1 : K.clamp(o.k * (n + 1) - i);
      const ho = { ...(o.each ? o.each(i) : {}), ghost: o.ghost };
      const dim = o.focus != null && i !== o.focus ? pick(o.dim, 0.55) : 1;
      if (k > 0) out.push(house(t, x, y + (1 - K.ease.out(k)) * 20, s, { ...ho, alpha: K.ease.out(k) * dim * pick(ho.alpha, 1) }));
      else out.push(geo(x, y, s));
    }
    return out;
  }

  // ---------------------------------------------------------------- people and crew
  /** a figure (meeple: round head + capsule body), FEET at (x, y), height s (80–160; 60 minimum).
   *  role: 'owner' (gold) | 'inspector' (cream, shield) | 'burglar' (quiet, key, cap) | 'tenant' (soft) |
   *        'coder' (body colour, hand-coder) | 'signer' (cream, code badge)
   *  o: {prop: 'shield'|'key'|'clipboard'|'code'|'book'|'question'|null, propK 0..1, ai: 0..1 (sparkle badge on
   *      the chest: AI inspector / AI-armed burglar), color, alpha, label, labelColor, labelSize (30), labelBelow,
   *      face: -1|1 (prop side), sway (idle, default on), i (phase)}
   *  returns {x, y, head: {x, y}, hand: {x, y}, top} */
  function person(t, x, y, s, role = 'owner', o = {}) {
    const R = {
      owner: { color: palette.owner, prop: null },
      inspector: { color: palette.inspector, prop: 'shield' },
      burglar: { color: palette.burglar, prop: 'key', cap: true },
      tenant: { color: palette.tenant, prop: null },
      coder: { color: palette.coder, prop: 'code' },
      signer: { color: palette.inspector, prop: 'code' },
    }[role] || { color: C.strong };
    const color = o.color || R.color, prop = o.prop === undefined ? R.prop : o.prop, face = o.face || 1;
    const sway = o.sway === false ? 0 : K.wave(t, motion.sway.speed, motion.sway.amp, (o.i || 0) * 1.9);
    const g = G();
    const hx = x + sway * 0.4, hy = y - s * 0.8, hr = s * 0.14;
    const hand = { x: x + face * s * 0.3, y: y - s * 0.4 };
    K.layer(pick(o.alpha, 1), () => {
      g.save();
      g.lineWidth = Math.max(2, s * 0.035); g.strokeStyle = color; g.lineJoin = 'round';
      // shadow on the ground
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x, y + 2, s * 0.22, s * 0.035, 0, 0, 7); g.fill();
      // body
      g.fillStyle = K.mixColor(C.tile, color, 0.22);
      K.rr(x - s * 0.2, y - s * 0.6, s * 0.4, s * 0.6, [s * 0.18, s * 0.18, s * 0.05, s * 0.05]); g.fill(); g.stroke();
      // head
      g.fillStyle = K.mixColor(C.tile, color, 0.35);
      g.beginPath(); g.arc(hx, hy, hr, 0, 7); g.fill(); g.stroke();
      if (R.cap) { g.fillStyle = '#2A2833'; g.beginPath(); g.arc(hx, hy - hr * 0.05, hr * 1.05, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = color; K.rr(hx - hr * 0.7, hy - hr * 0.05 - hr * 0.16, hr * 1.4 + face * hr * 0.6, hr * 0.32, hr * 0.12); g.fill(); g.fillStyle = '#1A1922'; K.rr(hx - hr * 0.62, hy + hr * 0.25, hr * 1.24, hr * 0.32, hr * 0.14); g.fill(); }
      g.restore();
      // prop in the hand
      if (prop && c01(pick(o.propK, 1)) > 0) {
        K.layer(c01(pick(o.propK, 1)), () => {
          if (prop === 'clipboard') {
            const w = s * 0.26, h = s * 0.32;
            g.save(); g.fillStyle = C.paper; K.rr(hand.x - w / 2, hand.y - h / 2, w, h, 4); g.fill();
            g.strokeStyle = palette.wood; g.lineWidth = Math.max(2, s * 0.02); g.stroke();
            g.strokeStyle = K.rgba(C.ink, 0.7); g.lineWidth = Math.max(1, s * 0.012);
            for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hand.x - w * 0.3, hand.y - h * 0.15 + i * h * 0.2); g.lineTo(hand.x + w * 0.3, hand.y - h * 0.15 + i * h * 0.2); g.stroke(); }
            g.fillStyle = palette.wood; g.fillRect(hand.x - w * 0.2, hand.y - h / 2 - 3, w * 0.4, 6);
            g.restore();
          } else {
            K.card(hand.x - s * 0.17, hand.y - s * 0.17, s * 0.34, s * 0.34, { r: s * 0.1, fill: C.tile, stroke: color, shadow: false });
            K.icon(prop, hand.x, hand.y, s * 0.24, { color: prop === 'key' && role === 'burglar' ? color : prop === 'shield' ? palette.machine : color, w: Math.max(2, s * 0.025) });
          }
        });
      }
      // AI badge on the chest
      const ai = c01(o.ai);
      if (ai > 0) {
        K.layer(ai, () => {
          K.glow(x, y - s * 0.34, s * 0.2, C.head, 0.35);
          sparkleShape(x, y - s * 0.34, s * 0.2, palette.crew, 1);
        });
      }
      if (o.label) {
        const below = o.labelBelow !== false;
        K.text(o.label, x, below ? y + (o.labelSize || 30) + 16 : y - s - 18, { ...type.read, size: o.labelSize || 30, color: o.labelColor || color, align: 'center' });
      }
    });
    return { x, y, head: { x: hx, y: hy }, hand, top: y - s };
  }

  /** filled four-point sparkle (crew body) centred at (x, y), radius r */
  function sparkleShape(x, y, r, color, a = 1) {
    const g = G();
    const star = (cx, cy, rr) => {
      g.beginPath(); g.moveTo(cx, cy - rr);
      g.quadraticCurveTo(cx + rr * 0.12, cy - rr * 0.12, cx + rr, cy);
      g.quadraticCurveTo(cx + rr * 0.12, cy + rr * 0.12, cx, cy + rr);
      g.quadraticCurveTo(cx - rr * 0.12, cy + rr * 0.12, cx - rr, cy);
      g.quadraticCurveTo(cx - rr * 0.12, cy - rr * 0.12, cx, cy - rr);
      g.closePath();
    };
    g.save(); g.globalAlpha *= a;
    g.fillStyle = color; star(x, y, r); g.fill();
    g.fillStyle = K.rgba('#FFF4DA', 0.55); star(x, y, r * 0.4); g.fill();
    g.fillStyle = color; star(x + r * 0.95, y - r * 0.85, r * 0.32); g.fill();
    g.restore();
  }

  /** A CREW MEMBER (AI): a glowing gold sparkle with a small idle bob. Centre (x, y), size s (40–90; 60 default).
   *  o: {i: phase index (give each member its own), alpha, glow (0..1, default .8), dim 0..1 (fades to C.soft,
   *      e.g. when its "yes" is doubted), carry: 'brick'|'file'|'puzzle'|null (a small thing it holds below),
   *      label, labelColor, labelSize (30), shield: 0..1 (verifier badge, 15)}
   *  returns {x, y} of the drawn (bobbing) centre */
  function crew(t, x, y, s = 60, o = {}) {
    const i = o.i || 0;
    const by = y + K.wave(t, motion.bob.speed, motion.bob.amp * s / 60, i * 2.1);
    const col = K.mixColor(palette.crew, C.soft, c01(o.dim));
    K.layer(pick(o.alpha, 1), () => {
      K.glow(x, by, s * 0.9, C.head, 0.28 * pick(o.glow, 0.8) * (1 - c01(o.dim)));
      sparkleShape(x, by, s * 0.42, col, 1);
      if (o.carry) {
        if (o.carry === 'brick') {
          const g = G(); g.save(); g.fillStyle = palette.brick; g.strokeStyle = palette.brickLine; g.lineWidth = 2;
          K.rr(x - s * 0.22, by + s * 0.5, s * 0.44, s * 0.18, 3); g.fill(); g.stroke(); g.restore();
        } else K.icon(o.carry, x, by + s * 0.62, s * 0.36, { color: C.body });
      }
      const sh = c01(o.shield);
      if (sh > 0) K.layer(sh, () => {
        const bs = Math.max(40, s * 0.6);
        K.card(x - s * 0.45 - bs / 2, by + s * 0.3 - bs / 2, bs, bs, { r: bs * 0.3, fill: C.tile, stroke: palette.machine, shadow: false });
        K.icon('shield', x - s * 0.45, by + s * 0.3, bs * 0.66, { color: palette.machine, w: Math.max(2.5, bs * 0.06) });
      });
      if (o.label) K.text(o.label, x, y + s * 0.95 + (o.labelSize || 30) * 0.6, { ...type.read, size: o.labelSize || 30, color: o.labelColor || palette.crew, align: 'center' });
    });
    return { x, y: by };
  }

  /** n crew members in a loose cluster around (x, y). o: {spread (s * 1.3), k reveal (staggered pop), dim, alpha, carry}
   *  returns array of centres */
  function crewGroup(t, x, y, n = 3, s = 60, o = {}) {
    const sp = pick(o.spread, s * 1.3), out = [];
    const offs = [[0, 0], [0.9, 0.55], [-0.85, 0.6], [0.2, 1.15], [-0.1, -0.9]];
    for (let i = 0; i < n; i++) {
      const [dx, dy] = offs[i % offs.length];
      const k = o.k == null ? 1 : K.clamp(o.k * (n + 0.5) - i);
      const px = x + dx * sp, py = y + dy * sp * 0.7;
      if (k > 0) K.at(px, py, 0.6 + 0.4 * K.ease.back(k), () => crew(t, 0, 0, s, { ...o, i: i + (o.i || 0), alpha: pick(o.alpha, 1) * Math.min(1, k * 1.5), label: null }));
      out.push({ x: px, y: py });
    }
    return out;
  }

  // ---------------------------------------------------------------- talk, cards, chips
  /** chat bubble. (x, y) = centre of the box. who: 'owner' (gold stroke, tail bottom-left) | 'crew' (sparkle tab,
   *  tail bottom-right). o: {size (32), maxW (520), check: 0..1 (gold check after the text), dim 0..1 (text → soft),
   *  tail: 'left'|'right'|'none', alpha, k: pop 0..1}  returns {w, h} */
  function bubble(text, x, y, who = 'owner', o = {}) {
    const size = o.size || 32, padX = size * 0.9, padY = size * 0.62;
    const to = { font: 'ui', weight: 600, size };
    const lines = K.wrap(text, (o.maxW || 520) - padX * 2, to);
    const tw = Math.max(...lines.map((l) => K.measure(l, to)));
    const ck = c01(o.check), extra = ck > 0 ? size * 1.3 : 0;
    const crewTab = who === 'crew' ? size * 1.3 : 0;
    const w = tw + padX * 2 + extra + crewTab, lh = size * 1.32, h = lines.length * lh + padY * 2 - (lh - size) + 4;
    const x0 = x - w / 2, y0 = y - h / 2;
    const tail = o.tail || (who === 'crew' ? 'right' : 'left');
    const stroke = who === 'owner' ? palette.owner : C.line2;
    const k = pick(o.k, 1);
    if (k <= 0) return { w, h };
    K.layer(pick(o.alpha, 1) * K.ease.out(c01(k)), () => K.at(x, y, 0.9 + 0.1 * K.ease.out(c01(k)), () => {
      const g = G(); g.save(); g.translate(-x, -y);
      K.card(x0, y0, w, h, { r: Math.min(26, h / 2), fill: who === 'crew' ? '#262234' : C.tile, stroke, shadow: true });
      if (tail !== 'none') {
        const tx = tail === 'left' ? x0 + w * 0.22 : x0 + w * 0.78, dir = tail === 'left' ? -1 : 1;
        g.beginPath(); g.moveTo(tx - 14, y0 + h - 1); g.lineTo(tx + dir * 18, y0 + h + 22); g.lineTo(tx + 14, y0 + h - 1); g.closePath();
        g.fillStyle = who === 'crew' ? '#262234' : C.tile; g.fill();
        g.strokeStyle = stroke; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(tx - 14, y0 + h); g.lineTo(tx + dir * 18, y0 + h + 22); g.lineTo(tx + 14, y0 + h); g.stroke();
      }
      if (who === 'crew') sparkleShape(x0 + padX * 0.75 + size * 0.2, y0 + padY + size * 0.42, size * 0.38, palette.crew);
      const col = K.mixColor(C.strong, C.soft, c01(o.dim));
      lines.forEach((ln, i) => K.text(ln, x0 + padX + crewTab, y0 + padY + size * 0.82 + i * lh, { ...to, color: col }));
      if (ck > 0) K.icon('check', x0 + w - padX - size * 0.45, y0 + padY + size * 0.45, size * 1.1, { color: K.mixColor(palette.machine, C.soft, c01(o.dim)), alpha: ck, w: 4 });
      g.restore();
    }));
    return { w, h };
  }

  /** small tag pill for dates and status. kind: 'date' (gold mono) | 'preview' | 'beta' (soft outline) |
   *  'forecast' (terracotta outline, upper) | 'paraphrase' (soft italic) | 'asof' (gold outline, upper)
   *  centred at (x, y); size 26 (minimum). returns width */
  function tag(text, x, y, kind = 'date', o = {}) {
    const st = {
      date: { color: C.head, stroke: C.line2, font: 'mono' },
      preview: { color: C.body, stroke: C.soft, upper: true, tracking: 2 },
      beta: { color: C.body, stroke: C.soft, upper: true, tracking: 2 },
      forecast: { color: C.accent, stroke: C.accent, upper: true, tracking: 3 },
      paraphrase: { color: C.soft, stroke: C.line2 },
      asof: { color: C.head, stroke: C.head, upper: true, tracking: 3 },
    }[kind] || {};
    return K.pill(text, x, y, { size: o.size || 26, color: st.color, stroke: st.stroke, font: st.font, upper: st.upper, tracking: st.tracking, alpha: o.alpha, fill: o.fill || C.tile });
  }

  /** DATED CARD: an eyebrow date line + 1–3 lines of text, for every sourced fact on screen.
   *  (x, y) = top-left, width w. date e.g. "Veracode · Jul 2026". text wraps at 30 px Karla.
   *  o: {size (30), kind: 'neutral'|'machine'|'unseen' (left rule colour), badge: {text, kind} (tag at top-right),
   *      alpha, k (rise 0..1), mono: true (text in mono, for literals)}  returns height */
  function dated(x, y, w, date, text, o = {}) {
    const size = o.size || 30, pad = 28;
    const tf = o.mono ? { font: 'mono', weight: 600, size: size - 2 } : { font: 'ui', weight: 600, size };
    const lines = K.wrap(text, w - pad * 2 - 8, tf), lh = size * 1.3;
    const h = pad * 2 + 34 + lines.length * lh - (lh - size);
    const k = pick(o.k, 1);
    if (k <= 0) return h;
    const rule = { neutral: C.line2, machine: palette.machine, unseen: palette.unseen }[o.kind || 'neutral'];
    K.layer(pick(o.alpha, 1) * K.ease.out(c01(k)), () => {
      const g = G(); g.save(); g.translate(0, (1 - K.ease.out(c01(k))) * 18);
      K.card(x, y, w, h, { r: 18 });
      g.fillStyle = rule; K.rr(x + 10, y + 16, 5, h - 32, 3); g.fill();
      K.eyebrow(date, x + pad + 8, y + pad + 16, { size: 22, color: C.head, tracking: 3 });
      lines.forEach((ln, i) => K.text(ln, x + pad + 8, y + pad + 34 + size * 0.86 + i * lh, { ...tf, color: o.color || C.strong }));
      if (o.badge) {
        const bw = K.measure(o.badge.text, { font: 'ui', weight: 600, size: 22, upper: true, tracking: 2 }) + 22 * 1.6;
        tag(o.badge.text, x + w - pad - bw / 2, y + pad + 8, o.badge.kind || 'preview', { size: 22 });
      }
      g.restore();
    });
    return h;
  }

  /** VERDICT CHIP: icon + label pill. kind: 'machine' (gold, check) | 'unseen' (terracotta, warning) |
   *  'ask' (terracotta, question) | 'neutral' (cream, no icon) | 'off' (soft, struck) ; centred at (x, y).
   *  o: {size (30; 26 min), icon (override), alpha, k (pop), glow}  returns width */
  function chip(text, x, y, kind = 'machine', o = {}) {
    const size = o.size || 30;
    const st = {
      machine: { c: palette.machine, icon: 'check', stroke: K.mixColor(C.line2, C.head, 0.55) },
      unseen: { c: palette.unseen, icon: 'warning', stroke: K.mixColor(C.line2, C.accent, 0.6) },
      ask: { c: palette.unseen, icon: 'question', stroke: K.mixColor(C.line2, C.accent, 0.6) },
      neutral: { c: C.strong, icon: null, stroke: C.line2 },
      off: { c: C.soft, icon: null, stroke: C.line },
    }[kind];
    const ic = o.icon === undefined ? st.icon : o.icon;
    const to = { font: 'ui', weight: 600, size };
    const iw = ic ? size * 1.15 : 0;
    const w = K.measure(text, to) + size * 1.6 + iw, h = size * 1.9;
    const k = pick(o.k, 1);
    if (k <= 0) return w;
    K.layer(pick(o.alpha, 1), () => K.pop(k * 0.5, 0, x, y, () => {
      K.card(x - w / 2, y - h / 2, w, h, { r: h / 2, fill: C.tile, stroke: st.stroke, shadow: false, glow: o.glow });
      if (ic) K.icon(ic, x - w / 2 + size * 0.8 + iw * 0.35, y, size * 0.95, { color: st.c, w: Math.max(2.5, size * 0.09) });
      K.text(text, x - w / 2 + size * 0.8 + iw, y + size * 0.34, { ...to, color: kind === 'off' ? C.soft : kind === 'neutral' ? C.strong : st.c });
      if (kind === 'off') K.line(x - w / 2 + size * 0.6, y, x + w / 2 - size * 0.6, y, { color: C.soft, w: 2 });
    }, 0.5));
    return w;
  }

  /** a plain label in one of the lesson's meanings. kind: 'machine' gold | 'unseen' terracotta | 'note' soft |
   *  'plain' cream. Default 30 px Karla 600, centred. returns width */
  function label(text, x, y, kind = 'plain', o = {}) {
    const color = { machine: palette.machine, unseen: palette.unseen, note: C.soft, plain: C.strong }[kind] || kind;
    return K.text(text, x, y, { ...type.read, size: o.size || 30, color, align: o.align || 'center', alpha: o.alpha, italic: o.italic });
  }

  // ---------------------------------------------------------------- suppliers
  /** SUPPLIER VAN (a dependency): a pill-shaped van card on wheels, cargo icon + mono name. FEET (road) at
   *  (x, y), size s = length (140–240; 180 default).
   *  o: {name ('requests'), icon ('puzzle'), ghost: 0..1 (dashed outline, no name: an invented package),
   *      warn: 0..1 (terracotta warning badge on the roof), keyK: 0..1 (your key hangs on it, gold),
   *      driver: 0..1 (burglar silhouette in the cab), crate: 0..1 (a small file icon in the cargo with a
   *      terracotta glow: hidden code), alpha, tint (outline colour), roll: wheel rotation (pass distance/radius)}
   *  returns {x, y, top, cab: {x, y}} */
  function van(t, x, y, s = 180, o = {}) {
    const g = G(), h = s * 0.56, wr = s * 0.085;
    const x0 = x - s / 2, y0 = y - h - wr * 1.1;
    const ghost = c01(o.ghost);
    const stroke = o.tint || (ghost > 0.5 ? C.soft : K.mixColor(C.line2, C.head, 0.35));
    K.layer(pick(o.alpha, 1), () => {
      g.save();
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x, y + 2, s * 0.5, s * 0.04, 0, 0, 7); g.fill();
      if (ghost > 0) g.setLineDash([10, 8]);
      // cargo box + cab
      g.lineWidth = Math.max(2, s * 0.012); g.strokeStyle = stroke;
      g.fillStyle = ghost > 0.5 ? K.rgba(C.tile, 0.4) : '#25222F';
      K.rr(x0, y0, s * 0.68, h, s * 0.08); g.fill(); g.stroke();
      K.rr(x0 + s * 0.7, y0 + h * 0.28, s * 0.3, h * 0.72, [s * 0.12, s * 0.06, s * 0.04, s * 0.04]); g.fill(); g.stroke();
      g.setLineDash([]);
      // cab window
      g.fillStyle = K.mixColor(palette.glass, C.line2, 0.4); K.rr(x0 + s * 0.76, y0 + h * 0.38, s * 0.17, h * 0.28, 5); g.fill();
      // wheels
      [x0 + s * 0.18, x0 + s * 0.82].forEach((wx) => {
        g.fillStyle = '#121320'; g.strokeStyle = stroke; g.beginPath(); g.arc(wx, y - wr, wr, 0, 7); g.fill(); g.stroke();
        const a = o.roll || 0; g.beginPath(); g.moveTo(wx, y - wr); g.lineTo(wx + Math.cos(a) * wr * 0.7, y - wr + Math.sin(a) * wr * 0.7); g.stroke();
      });
      g.restore();
      // cargo icon + name
      const cx = x0 + s * 0.34;
      K.icon(o.icon || 'puzzle', cx, y0 + h * (o.name && ghost < 0.5 ? 0.32 : 0.5), s * 0.2, { color: ghost > 0.5 ? C.soft : C.head, w: Math.max(2, s * 0.015) });
      if (o.name && ghost < 0.5) K.text(o.name, cx, y0 + h * 0.7, { font: 'mono', weight: 600, size: Math.max(22, Math.min(26, s * 0.13)), color: C.strong, align: 'center', maxW: s * 0.62 });
      const dr = c01(o.driver);
      if (dr > 0) K.layer(dr, () => {
        g.save(); g.fillStyle = palette.burglar;
        g.beginPath(); g.arc(x0 + s * 0.845, y0 + h * 0.5, h * 0.1, 0, 7); g.fill();
        g.fillRect(x0 + s * 0.845 - h * 0.12, y0 + h * 0.37, h * 0.24, h * 0.06);
        g.restore();
      });
      const cr = c01(o.crate);
      if (cr > 0) K.layer(cr, () => { K.glow(x0 + s * 0.56, y0 + h * 0.5, s * 0.14, C.accent, 0.45); K.icon('file', x0 + s * 0.56, y0 + h * 0.5, s * 0.16, { color: palette.unseen, w: 2.5 }); });
      const wk = c01(o.warn);
      if (wk > 0) K.layer(wk, () => { K.card(x0 + s * 0.04, y0 - s * 0.2, s * 0.18, s * 0.18, { r: s * 0.05, fill: C.tile, stroke: palette.unseen, shadow: false }); K.icon('warning', x0 + s * 0.13, y0 - s * 0.11, s * 0.13, { color: palette.unseen, w: 2.5 }); });
      const kk = c01(o.keyK);
      if (kk > 0) K.layer(kk, () => { K.glow(x0 + s * 0.6, y0 - s * 0.12, s * 0.16, C.head, 0.45); K.icon('key', x0 + s * 0.6, y0 - s * 0.12, s * 0.22, { color: palette.machine, w: 3.5 }); });
    });
    return { x, y, top: y0, cab: { x: x0 + s * 0.85, y: y0 + h * 0.5 } };
  }

  // ---------------------------------------------------------------- checklist, plaque, cone
  /** CHECKLIST card (12 deploy list, also 13): (x, y) top-left, width w.
   *  rows: [{s, kind: 'machine' (gold check, ticked) | 'unseen' (terracotta empty box), k 0..1 reveal}]
   *  o: {title (eyebrow), size (30), signK 0..1 (signature line draws + scribble), signLabel ('signed by someone
   *      who can code'), alpha}  returns height */
  function checklist(x, y, w, rows, o = {}) {
    const size = o.size || 30, pad = 32, rh = size * 1.75;
    const head = o.title ? 46 : 0, sign = o.signK != null ? 96 : 0;
    const h = pad * 2 + head + rows.length * rh + sign - (rh - size * 1.2);
    const g = G();
    K.layer(pick(o.alpha, 1), () => {
      K.card(x, y, w, h, { r: 20 });
      if (o.title) K.eyebrow(o.title, x + pad, y + pad + 18);
      rows.forEach((r, i) => {
        const k = c01(pick(r.k, 1)); if (k <= 0) return;
        const ry = y + pad + head + i * rh + size * 0.6;
        K.layer(K.ease.out(k), () => {
          const bx = x + pad + size * 0.5;
          K.rr(bx - size * 0.45, ry - size * 0.45, size * 0.9, size * 0.9, 6);
          g.save(); g.lineWidth = 2.5; g.strokeStyle = r.kind === 'machine' ? palette.machine : palette.unseen; g.stroke(); g.restore();
          if (r.kind === 'machine') K.icon('check', bx, ry, size * 0.95, { color: palette.machine, w: 4 });
          K.text(r.s, x + pad + size * 1.5, ry + size * 0.34, { font: 'ui', weight: 600, size, color: r.kind === 'machine' ? C.strong : palette.unseen });
        });
      });
      if (o.signK != null) {
        const sk = c01(o.signK), sy = y + h - pad - 34;
        K.line(x + pad, sy, x + w - pad, sy, { color: C.line2, w: 2 });
        if (sk > 0) {
          const pts = [];
          for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([x + pad + 20 + u * (w * 0.42), sy - 14 + Math.sin(u * 19) * 9 * (1 - u * 0.3)]); }
          K.path(pts, { k: sk, color: C.head, w: 3, head: false, tension: 0.4 });
        }
        K.text(o.signLabel || 'signed: someone who can code', x + pad, sy + 30, { font: 'ui', weight: 600, size: 26, color: sk > 0.9 ? C.head : C.soft });
      }
    });
    return h;
  }

  /** PLAQUE / posted notice: a wood-framed paper card with centred text (14 the rule, 10 the house rule).
   *  (x, y) = centre, width w. o: {size (44), font ('head' gold on paper → ink), sub (smaller second line),
   *  k reveal 0..1, alpha, pins: true (two brass pins: a posted notice)}  returns height */
  function plaque(text, x, y, w, o = {}) {
    const size = o.size || 44, pad = 34;
    const tf = { font: o.font || 'head', weight: 700, size };
    const lines = K.wrap(text, w - pad * 2, tf), lh = size * 1.25;
    const subF = { font: 'read', size: 30, italic: true };
    const subLines = o.sub ? K.wrap(o.sub, w - pad * 2, subF) : [];
    const h = pad * 2 + lines.length * lh - (lh - size) + (subLines.length ? 22 + subLines.length * 40 : 0) + 8;
    const k = c01(pick(o.k, 1));
    if (k <= 0) return h;
    const g = G();
    K.layer(pick(o.alpha, 1) * K.ease.out(k), () => K.at(x, y, 0.94 + 0.06 * K.ease.out(k), () => {
      g.save(); g.translate(-x, -y);
      const x0 = x - w / 2, y0 = y - h / 2;
      K.card(x0 - 10, y0 - 10, w + 20, h + 20, { r: 16, fill: palette.wood, stroke: palette.woodHi });
      K.card(x0, y0, w, h, { r: 10, fill: C.paper, stroke: C.paperShade, shadow: false });
      lines.forEach((ln, i) => K.text(ln, x, y0 + pad + size * 0.8 + i * lh, { ...tf, color: C.ink, align: 'center', tracking: -0.5 }));
      subLines.forEach((ln, i) => K.text(ln, x, y0 + pad + lines.length * lh + 22 + 28 + i * 40, { ...subF, color: '#5A4E44', align: 'center' }));
      if (o.pins) [x0 + 22, x0 + w - 22].forEach((px) => { g.fillStyle = C.gold; g.beginPath(); g.arc(px, y0 + 20, 7, 0, 7); g.fill(); });
      g.restore();
    }));
    return h;
  }

  /** the owner's VIEW CONE (05): a soft gold wedge from (x, y) towards angle ang (radians, 0 = right),
   *  half-spread sp, length len, reveal k. Things outside it are what the owner can't see. */
  function cone(x, y, ang, sp, len, k = 1, color = C.head) {
    k = c01(k); if (k <= 0) return;
    const g = G(); g.save();
    const r = g.createRadialGradient(x, y, 0, x, y, len * k);
    r.addColorStop(0, K.rgba(color, 0.32)); r.addColorStop(1, K.rgba(color, 0));
    g.fillStyle = r; g.beginPath(); g.moveTo(x, y); g.arc(x, y, len * k, ang - sp, ang + sp); g.closePath(); g.fill();
    g.restore();
  }

  window.M = { palette, type, motion, layout, geo, house, street, leakPts, person, crew, crewGroup, sparkleShape,
    bubble, tag, dated, chip, label, van, checklist, plaque, cone };
})();
