// 10 — The house and the flat. A VM is a detached house on its own foundations; a container is a flat in a
// shared building (MIT Missing Semester, S209). The Blender shot house_and_flat plays from [[vm]], slowed so the
// shared foundation glows when the narration says "shares the host's kernel". Then the stage shrinks left for
// MIT's two cards, and the worker that skips approvals walks out of your house into the flat block.
SCENE('10', (t, S) => {
  K.bg({ glow: 0.2 });
  const g = K.ctx();
  const C = K.C;
  const cVm = S.cue('vm', 8.44), cCon = S.cue('container', 17.79), cWeak = S.cue('weaker', 30.96), cUn = S.cue('unattended', 37.35);
  const tKernel = S.find('shares', 0, 20.68), tDocker = S.find('Docker', 0, 24.9), tAaron = S.find('Aaron', 0, 28.42);
  const tNames = S.find('names', 0, 6.8), tSkips = S.find('skips', 0, 40.46), tAccept = S.find('acceptable', 0, 44.44);
  const tBox = S.find('box', 0, 49.44);

  // ---- your house: the wide street at rest (scene 09's exit), then road and vendor leave and the house hands over
  // to a big outline of itself: YOUR COMPUTER, the frame everything in this scene lives inside
  const aStreet = 1 - K.io(t, 0.5, 0.6);
  if (aStreet > 0) M.street(t, {
    house: { rooms: 0.8, alpha: aStreet },
    road: { alpha: 1 - K.io(t, 0.2, 0.5) }, vendor: { alpha: 1 - K.io(t, 0.2, 0.5) },
  });

  // ---- the stage: the clip sits inside the YOUR COMPUTER outline; at [[weaker]] both move left for MIT's cards
  const kMove = K.io(t, cWeak - 0.2, 0.8);
  const vx = K.lerp(420, 170, kMove), vy = K.lerp(292, 300, kMove), vw = K.lerp(1080, 840, kMove), vh = vw * 9 / 16;
  const fx = vx - 30, fw = vw + 60, fy = vy - 30, fb = K.lerp(vy + vh + 26, 915, kMove);   // floor band for the worker
  const kFrame = K.io(t, 0.6, 0.9), aFrame = K.io(t, 0.6, 0.5);
  if (aFrame > 0) {
    K.layer(aFrame, () => {
      g.save(); K.rr(fx, fy, fw, fb - fy, 22); g.fillStyle = K.rgba(M.P.house, 0.16 * kFrame); g.fill(); g.restore();
      M.outline(fx, fy, fw, fb - fy, 22, kFrame, { color: M.P.houseEdge, w: 3 });
      const apex = [fx + fw / 2, fy - 96];
      K.path([[fx - 24, fy + 4], apex, [fx + fw + 24, fy + 4]], { k: kFrame, color: M.P.houseEdge, w: 3, head: false, tension: 0 });
      M.label('YOUR COMPUTER', apex[0], fy - 34, { color: C.head, size: 26, alpha: K.io(t, 1.1, 0.5) });
    });
  }

  // ---- the Blender shot: it waits on its first frame at half strength from "inside", then plays from [[vm]]
  // media time: a slow push (rate r0) from [[vm]], easing up to 1x so media 2.4 s (the shared foundation starts to
  // glow) lands 0.7 s before "shares the host's kernel"; it then plays out at 1x and holds its calm last frame.
  const g0 = tKernel - 0.7, r0 = 1.9 / (g0 - 1 - cVm + 0.5), c1 = g0 - 1;
  let mt;
  if (t < c1) mt = r0 * Math.max(0, t - cVm);
  else if (t < g0) { const u = t - c1; mt = r0 * (c1 - cVm) + r0 * u + (1 - r0) * u * u / 2; }
  else mt = 2.4 + (t - g0);
  const tInside = S.find('inside', 0, 2.62);
  const aVid = 0.5 * K.io(t, tInside - 0.2, 0.6) + 0.5 * K.io(t, cVm - 0.3, 0.6);
  let p = null;
  if (aVid > 0) p = K.video('house_and_flat', mt, vx, vy, vw, vh, { r: 18, stroke: true, alpha: aVid });
  // "a computer inside it": a gold pill on the clip's top-left corner while the narration says so
  const aIn = K.io(t, tInside, 0.5) * (1 - K.io(t, cVm + 0.2, 0.5));
  if (aIn > 0) M.pillL('a computer inside your computer', vx + 24, vy + 40, { size: 26, color: C.head, fill: C.panel, stroke: C.head, alpha: aIn });

  // ---- MIT's first line, over the waiting clip, until [[vm]]
  const kc = K.io(t, tNames - 1.6, 0.6) * (1 - K.io(t, cVm - 0.4, 0.5));
  if (kc > 0) {
    const w = 820, y = 520 + 16 * (1 - kc);
    M.dated(960 - w / 2, y, w, {
      eyebrow: 'MIT Missing Semester · Packaging and Shipping Code · 2026-01-20',
      body: 'VMs abstract the entire computer', quote: true, footer: true, alpha: kc,
    });
  }
  const A = (n) => (p ? SHOT('house_and_flat', n, mt, p) : null);
  const aVm = A('vm'), aCon = A('container'), aSlab = A('vm-slab'), aSh = A('shared');

  // VM: its own slab glows (canvas glow on the clip's slab), label pinned above the house's ridge
  if (aSlab) {
    const gk = K.io(t, cVm + 0.8, 0.6) * (1 - K.io(t, cCon - 0.6, 0.8));
    if (gk > 0) K.glow(aSlab.x, aSlab.y - 70 * p.s, 190 * p.s, C.head, 0.34 * gk);
  }
  const kShort = K.io(t, cWeak - 0.3, 0.5);   // once the stage shrinks, the labels drop their second line
  // three short lines (name, what it is, the metaphor), so the two labels never run into each other on the wide stage
  const tag = (a, name, rest, sub, at) => {
    if (!a) return;
    const k = K.io(t, at, 0.6), y = a.y - 78 + 12 * (1 - k);
    const full = 1 - kShort;
    const wid = Math.max(K.measure(name, { font: 'ui', weight: 600, size: 30 }), full > 0 ? K.measure(sub, { font: 'ui', weight: 600, size: 26 }) * 1.04 : 0) / 2;
    const x = K.clamp(a.x, vx + wid + 24, vx + vw - wid - 24);
    M.label(name, x, y + 36 * kShort, { size: 30, color: C.head, alpha: k });
    if (full > 0) {
      M.label(rest, x, y + 36, { color: C.strong, alpha: k * full });
      M.label(sub, x, y + 72, { italic: true, color: C.body, alpha: k * full * K.io(t, at + 0.5, 0.6) });
    }
  };
  tag(aVm, 'virtual machine', 'its own operating system', 'a detached house, on its own foundations', cVm + 0.4);
  tag(aCon, 'container', "shares the host's kernel", 'a flat in a shared building', cCon + 0.3);

  // the shared foundation: a soft canvas echo while MIT's "weaker" line is on screen
  if (aSh) {
    const sk = K.io(t, cWeak + 0.6, 0.8) * (1 - K.io(t, cUn - 0.2, 0.6));
    if (sk > 0) K.glow(aSh.x, aSh.y, 260 * p.s, C.head, 0.22 * sk);
  }

  // Docker pill + Aaron's own gap list (S210, no quote marks), on the dark ground under the block
  if (p && aSh) {
    const out = 1 - K.io(t, cWeak + 1.0, 0.4);   // held through MIT's 'weaker' card arriving
    const kd = K.io(t, tDocker - 0.1, 0.5) * out, ka = K.io(t, tAaron - 0.2, 0.5) * out;
    const dx = vx + vw - 24, dy = p.at(0, 612)[1] - 20;   // lifted so the second pill clears the panel's bottom edge
    if (kd > 0) M.pillL('Docker · a tool that makes containers', dx, dy + 10 * (1 - kd), { align: 'right', size: 26, color: C.strong, fill: C.panel, stroke: C.line2, alpha: kd });
    if (ka > 0) M.pillL("on Aaron's list of gaps · AO-029 · 2026-10-01", dx, dy + 62 + 10 * (1 - ka), { align: 'right', size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel, alpha: ka });
  }

  // ---- right column: MIT's two cards, one at a time
  const colX = 1215, colW = 625, colY = 215;
  const kW = K.io(t, cWeak + 0.1, 0.6) * (1 - K.io(t, cUn - 0.1, 0.5));
  if (kW > 0) {
    const h = M.dated(colX, colY + 16 * (1 - kW), colW, {
      eyebrow: 'MIT Missing Semester · Packaging and Shipping Code · 2026-01-20',
      body: "Docker's isolation is weaker than VMs", quote: true, footer: true, alpha: kW,
    });
    K.para('a concern on machines many people share', colX + 32, colY + h + 50, colW - 64, { size: 26, font: 'ui', italic: true, color: C.body, alpha: kW * K.io(t, cWeak + 1.2, 0.6) });
  }
  const kU = K.io(t, cUn + 0.3, 0.6);
  if (kU > 0) {
    const h = M.dated(colX, colY + 16 * (1 - kU), colW, {
      eyebrow: 'MIT Missing Semester · Agentic Coding exercises · 2026-01-21',
      body: '“It is not secure to use this mode directly” … “it may be acceptable to run a coding agent in an isolated environment like a virtual machine or container”',
      size: 28, footer: true, alpha: kU,
    });
    M.pointer('the lesson on sandboxes', colX, colY + h + 52, { alpha: K.io(t, tBox - 0.3, 0.5) });
  }

  // ---- [[unattended]] the worker that skips approvals walks along the floor band of your computer and parks
  // just below the clip, under the flat block, with a short dashed gold leader up to the shared foundation
  // (outside the render, so the building's windows stay clear)
  if (aSh && aCon) {
    const kIn = K.io(t, cUn + 0.6, 0.6);
    if (kIn > 0) {
      const floorY = fb - 42;
      const home = [fx + 230, floorY];   // in your computer, outside both boxes; badge clear of the frame's left edge
      const park = [aSh.x, floorY];
      const w0 = tAccept - 0.6, kWalk = K.io(t, w0, 1.5, 'io');
      const pos = M.along([home, park], kWalk);
      const walking = t > w0 && t < w0 + 1.5 ? 1 : 0;
      const kb = K.io(t, tSkips - 0.15, 0.4);
      const kL = K.io(t, w0 + 1.5, 0.5);
      if (kL > 0) {
        const y0 = vy + vh - 6, y1 = aSh.y + 6;
        K.path([[park[0], y0], [park[0], K.lerp(y0, y1, kL)]], { color: C.head, w: 3, dash: [8, 8], head: false, alpha: kIn });
        g.save(); g.globalAlpha = kIn * kL; g.fillStyle = C.head; g.beginPath(); g.arc(park[0], y1, 6, 0, Math.PI * 2); g.fill(); g.restore();
      }
      M.worker(t, pos[0], pos[1], {
        s: 60, alpha: kIn, walk: walking, glow: 0.4 + 0.4 * kL,
        badge: kb > 0.02 ? 'skips approvals' : null,
      });
    }
  }
});
