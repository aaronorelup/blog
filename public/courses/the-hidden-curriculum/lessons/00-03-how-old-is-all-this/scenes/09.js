/* 09 Keep this: end card. 08's dimmed street (full, names only) folds down into the small 'footer' street with its
   lanterns glowing; three takeaway rows rise on their cues, each rest line on its first spoken word. Row 2's years are
   the lesson's own terracotta lantern tags, and the footer lantern they name swells as its year is said. All three
   bold leads are gold (one skim set). Ground matches 01 (plate only in the lower band, so the plate's own lantern
   string never competes). The footer street sits left under the rows; 08's "street or lantern?" pill rests at its end. */
SCENE('09', (t, S) => {
  const C = K.C, L = M.layout.s09;
  // ---------------------------------------------------------------- times (local)
  const k1 = S.cue('keep-1', 1.68), k2 = S.cue('keep-2', 9.86), k3 = S.cue('keep-3', 21.03);
  const tShell = S.find('shell', 0, 4.27), tDecades2 = S.find('decades', 1, 6.52);
  const tChat = S.find('ChatGPT', 0, 12.02), t2022 = S.find('2022', 0, 13.26);
  const tMCP = S.find(/^(MCP|M)$/, 0, 14.69), t2024 = S.find('2024', 0, 15.64);
  const tCheck = S.find('check', 0, 18.47), tThey = S.find('They', 0, 26.31);

  // ---------------------------------------------------------------- ground
  // Same ground as the title card (01), so the lesson is bookended: night bg, and the painted plate only in the
  // lower band (stepping stones). The plate's own string of ~10 lit lanterns on the tea house would otherwise
  // outshine the street's three and contradict "lanterns only at the far end". The scratch canvas is a buffer
  // fully redrawn every frame, so the frame stays a pure function of t.
  K.bg({ glow: 0.14, glowX: 700, glowY: 420 });
  const im = K.img && K.img.plate;
  if (im) {
    const W = 1920, H = 1080, top = 700, full = 900;
    const oc = (window.__s09Plate = window.__s09Plate || Object.assign(document.createElement('canvas'), { width: W, height: H }));
    const o = oc.getContext('2d');
    o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.clearRect(0, 0, W, H);
    const z = 1.04 + 0.006 * t, w = W * z, h = (im.height / im.width) * w;
    o.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    o.fillStyle = K.rgba(C.page, 0.5); o.fillRect(0, 0, W, H);
    const m = o.createLinearGradient(0, top, 0, full);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)');
    o.globalCompositeOperation = 'destination-in'; o.fillStyle = m; o.fillRect(0, 0, W, H);
    o.globalCompositeOperation = 'source-over';
    K.ctx().drawImage(oc, 0, 0);
  }
  K.petals(t, { n: 5, alpha: 0.5 });

  // ---------------------------------------------------------------- the street folds into the footer
  // Starts as 08 left it ('full', names only, dim), then settles into the footer before row 1 arrives.
  const mk = K.io(t, 0.25, M.motion.move + 0.2);
  // the footer street, moved left under the rows (x 260 = the rows' left edge) so its lantern end sits in clear
  // night sky, away from the plate's ground lamps; the question pill rides at its right end
  const FOOT = M.geom('footer', { x0: 260, x1: 1060, y: 880, cordY: 806 });
  const gm = M.lerpGeom('full', FOOT, mk);
  // tags and decade labels let go in the first half of the fold, so no half-faded words ride down with it
  gm.tagA = 1 - K.seg(mk, 0, 0.5); gm.tickLabels = 1 - K.seg(mk, 0, 0.4);
  const footA = K.lerp(0.5, 0.7, mk);                        // 08 rests at 0.5
  // keep-1: the old stretch warms once ("decades to settle"); keep-2: each named lantern swells on its year
  const oldWarm = M.bump(t, tShell - 0.1, 1.4) + M.bump(t, tDecades2 - 0.1, 1.4);
  if (oldWarm > 0 && mk >= 1) {
    const g = K.ctx(), x0 = M.X(1969, gm), x1 = M.X(2020, gm), cx = (x0 + x1) / 2, rx = (x1 - x0) / 2 + 40, ry = 46;
    g.save(); g.translate(cx, gm.y); g.scale(rx / ry, 1);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, ry);
    gr.addColorStop(0, K.rgba(C.head, 0.2 * oldWarm)); gr.addColorStop(1, K.rgba(C.head, 0));
    g.fillStyle = gr; g.fillRect(-ry, -ry, ry * 2, ry * 2); g.restore();
  }
  // 08's lantern tags (names only) let go during the first half of the fold
  M.street(t, { geom: gm, mode: 'name', alpha: footA, lanterns: 1, lanternMode: 'name', lanternTags: 1 - K.seg(mk, 0, 0.45) });
  [[1, t2022], [2, t2024]].forEach(([i, at]) => {
    const b = M.bump(t, at - 0.15, 1.3);
    if (b > 0) { const p = M.lanternAt(gm, i); K.glow(p.x, p.y, 70, M.palette.lanternGlow, 0.28 * b); }
  });

  // ---------------------------------------------------------------- the one question, carried over from 08
  // A quiet pill at the street's lantern end: the lesson's usable tool stays on the end card. It settles with
  // the footer (part of the card's frame, not a spoken beat), no overshoot.
  {
    const qa = K.io(t, 0.9, 0.7, 'out');
    if (qa > 0) {
      const qs = 30, parts = [
        { s: 'street', color: C.head }, { s: ' or ', color: C.strong },
        { s: 'lantern', color: C.accent }, { s: '?', color: C.strong },
      ].map((p) => ({ ...p, font: 'ui', weight: 600, size: qs }));
      const qw = parts.reduce((a, p) => a + K.measure(p.s, p), 0) + qs * 1.6, qh = qs * 1.9;
      const qx = 1120, qy = 866 + (1 - qa) * 12;
      K.layer(qa * 0.9, () => {
        K.card(qx, qy - qh / 2, qw, qh, { r: qh / 2, fill: C.tile, stroke: K.mixColor(C.line2, C.head, 0.4), shadow: false });
        K.spans(parts, qx + qw / 2, qy + qs * 0.34, { size: qs, align: 'center' });
      });
    }
  }

  // ---------------------------------------------------------------- eyebrow
  K.eyebrow('Keep this', 200, 210, { size: 22, alpha: K.io(t, 0.2, 0.6) });

  // ---------------------------------------------------------------- the three rows
  // lead: Zen Maru 40 (all three gold: the skim layer reads as one set; the lantern colour lives in row 2's tags and tail); rest: Georgia 30, on its first spoken word.
  const LEAD = { font: 'head', size: 40, weight: 700 }, REST = { font: 'read', size: 30, color: C.body };
  const X0 = L.rowX, NX = 200, restDy = 56;
  const row = (i, at, lead, col) => {
    const y = L.rowsY[i];
    K.rise(t, at, () => {
      K.text(String(i + 1).padStart(2, '0'), NX, y, { font: 'mono', size: 26, weight: 600, color: col, alpha: 0.8 });
      K.text(lead, X0, y, { ...LEAD, color: col });
    });
    return y + restDy;
  };

  // row 1: the old street
  {
    const ry = row(0, k1, 'Most of what you build on is decades old.', C.head);
    K.rise(t, tShell - 0.15, () => K.text('The shell, files, the web and git had decades to settle, so what you learn there lasts.', X0, ry, REST), 16);
  }

  // row 2: the lanterns (the same terracotta tags the street hung in 04)
  {
    const ry = row(1, k2, 'The AI layer is brand new.', C.head);
    const ty = ry - 10, size = 30;
    const w1 = { year: '2022', name: 'ChatGPT' }, w2 = { year: 'Nov 2024', name: 'MCP' };
    const s1 = M.tagSize(w1, { size, tone: 'lantern' }), s2 = M.tagSize(w2, { size, tone: 'lantern' });
    const x1 = X0, x2 = x1 + s1.w + 20, x3 = x2 + s2.w + 30;
    const a1 = K.io(t, tChat - 0.1, M.motion.hang, 'out'), a2 = K.io(t, tMCP - 0.1, M.motion.hang, 'out');
    const lit1 = 0.6 * M.bump(t, t2022 - 0.15, 1.3), lit2 = 0.6 * M.bump(t, t2024 - 0.15, 1.3);
    if (a1 > 0) M.tag(x1, ty + (1 - a1) * 12, w1, { size, tone: 'lantern', align: 'left', alpha: a1, lit: 0.25 + lit1 });
    if (a2 > 0) M.tag(x2, ty + (1 - a2) * 12, w2, { size, tone: 'lantern', align: 'left', alpha: a2, lit: 0.25 + lit2 });
    K.rise(t, tCheck - 0.15, () => K.text('check the date.', x3, ry, { ...REST, color: C.accent }), 16);
  }

  // row 3: being lost isn't being behind
  {
    const ry = row(2, k3, "Being lost isn't being behind.", C.head);
    K.rise(t, tThey - 0.15, () => K.text('The basics were never new. Nobody handed them over.', X0, ry, REST), 16);
  }
});
