// Browser-side painter for the hero's stand-in picture (run by paint.mjs inside Chromium): the tea house garden at
// night or at dusk, as a far layer (sky, moon, mountains, house, garden) and a mid cut-out layer (cherry trees, with
// alpha), in world units mapped to pixels (100 px a unit) so the layers line up with the manifest's planes.
/* global window, document */
window.paintTeaHouse = function paintTeaHouse(layer, mode) {
  const N = mode === 'night';
  const C = N ? {
    skyTop: '#0B1030', skyMid: '#1B2350', skyLow: '#3A3F6E', moon: '#FFF3D6', mtnFar: '#2E3858', mtnNear: '#222B45',
    ground: '#1E2B2C', groundLow: '#121A1E', wall: '#5E3D4C', wallDark: '#3E2833', roof: '#2C3247', roofEdge: '#454D6A',
    wood: '#4A3022', shoji: '#E9A85A', shojiDim: '#8A5E28', door: '#FFD58A', stone: '#4C525C', stoneLit: '#7A6A5A',
    leaf: '#22301F', trunk: '#1C1412', blossom: '#7E5068', blossomLit: '#A87590', haze: 'rgba(120,130,190,0.10)',
  } : {
    skyTop: '#5B4B86', skyMid: '#B07A9A', skyLow: '#F2A27A', moon: '#FFE2B0', mtnFar: '#8A6E95', mtnNear: '#6C5478',
    ground: '#5E6A3E', groundLow: '#3E4A2C', wall: '#C98590', wallDark: '#9A5E6A', roof: '#5E6280', roofEdge: '#7D82A3',
    wood: '#8A5634', shoji: '#F6DFA8', shojiDim: '#D8B47E', door: '#FFE6B0', stone: '#9C9284', stoneLit: '#C8B49A',
    leaf: '#4A5A30', trunk: '#5A3826', blossom: '#F0A6B8', blossomLit: '#FBD0DA', haze: 'rgba(255,190,150,0.12)',
  };
  const far = layer === 'far';
  const W = far ? 2400 : 1700, H = far ? 1500 : 1060;
  const top = far ? 8.15 : 6.3, left = far ? -12 : -8.5;   // world coordinates of the image's top-left corner
  const X = (wx) => (wx - left) * 100, Y = (wy) => (top - wy) * 100;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let seed = far ? 11 : 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const blob = (x, y, rx, ry, col, a = 1, blur = 0) => {
    g.save(); g.globalAlpha = a; g.filter = blur ? `blur(${blur}px)` : 'none';
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore();
  };
  const glow = (x, y, r, col, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'lighter'; g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  };
  const ridge = (base, amp, col, blur, f) => {
    g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const w = x / W;
      g.lineTo(x, Y(base + amp * (Math.sin(w * f + 1.3) * 0.5 + Math.sin(w * f * 2.7 + 0.4) * 0.3 + Math.sin(w * f * 6.1) * 0.12)));
    }
    g.lineTo(W, H); g.fill(); g.restore();
  };

  if (far) {
    // sky, clouds, moon or low sun
    const sky = g.createLinearGradient(0, 0, 0, Y(0.9));
    sky.addColorStop(0, C.skyTop); sky.addColorStop(0.55, C.skyMid); sky.addColorStop(1, C.skyLow);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    if (N) for (let i = 0; i < 420; i++) blob(rnd() * W, rnd() * Y(3), 0.6 + rnd() * 1.4, 0.6 + rnd() * 1.4, '#FFF6E0', 0.25 + rnd() * 0.6);
    const mx = X(N ? 5.6 : 7.5), my = Y(N ? 6.2 : 1.9);
    glow(mx, my, N ? 420 : 900, N ? 'rgba(200,210,255,0.55)' : 'rgba(255,190,120,0.8)', 1);
    blob(mx, my, N ? 46 : 70, N ? 46 : 70, C.moon, 1, 2);
    for (let i = 0; i < 26; i++) {
      const cx = rnd() * W, cy = Y(3.6 + rnd() * 3.8);
      blob(cx, cy, 120 + rnd() * 260, 18 + rnd() * 30, N ? '#3A4272' : '#F3B9A0', N ? 0.35 : 0.45, 14);
      blob(cx + 30, cy - 8, 80 + rnd() * 140, 10 + rnd() * 16, N ? '#5A6296' : '#FFD7B8', N ? 0.18 : 0.35, 10);
    }
    ridge(3.0, 1.6, C.mtnFar, 3, 5);
    ridge(1.9, 1.1, C.mtnNear, 1.5, 8);
    g.fillStyle = C.haze; g.fillRect(0, Y(3), W, Y(0.6) - Y(3));
    // the garden ground, falling toward the viewer
    const gr = g.createLinearGradient(0, Y(1.0), 0, H);
    gr.addColorStop(0, C.ground); gr.addColorStop(1, C.groundLow);
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, Y(1.15));
    for (let x = 0; x <= W; x += 20) g.lineTo(x, Y(1.0 + 0.18 * Math.sin(x / 300)));
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    // dark trees behind the house's shoulders
    for (const [tx, s] of [[-4.6, 1.2], [-3.8, 0.9], [4.0, 1.1], [4.9, 1.3], [-6.5, 1.0], [6.8, 0.9]]) {
      for (let i = 0; i < 18; i++) blob(X(tx + (rnd() - 0.5) * 1.4 * s), Y(1.6 + rnd() * 2.0 * s), 40 + rnd() * 60, 30 + rnd() * 40, C.leaf, 0.9, 1);
    }
    house();
    // stepping stones to the door, larger as they come near
    for (let i = 0; i < 9; i++) {
      const t = i / 8, wy = 0.7 - t * 4.9, wx = Math.sin(i * 1.7) * 0.18 * t;
      blob(X(wx), Y(wy), 34 + t * 120, 9 + t * 34, '#0E1012', 0.35, 4);
      blob(X(wx), Y(wy) - 3, 30 + t * 110, 8 + t * 30, C.stone, 1, 0.5);
      blob(X(wx) - 6, Y(wy) - 7, 18 + t * 70, 4 + t * 14, C.stoneLit, N ? 0.35 : 0.45, 2);
    }
    for (const sx of [-3.3, 3.3]) stoneLantern(sx);
  } else {
    for (const s of [-1, 1]) cherry(s * 6.1, s);
    // low azalea mounds at the bottom corners
    for (const s of [-1, 1]) for (let i = 0; i < 40; i++) {
      blob(X(s * (5.2 + rnd() * 3.2)), Y(-2.6 - rnd() * 1.6), 40 + rnd() * 50, 26 + rnd() * 30, i % 3 ? C.leaf : C.blossom, 0.95, 1);
    }
  }

  function house() {
    const L = -2.6, R = 2.6, base = 0.75, eave = 2.35;
    blob(X(0), Y(base - 0.05), 330, 26, '#000', 0.35, 10);
    g.fillStyle = C.wood; g.fillRect(X(L - 0.2), Y(base), X(R + 0.2) - X(L - 0.2), Y(base - 0.22) - Y(base));
    g.fillStyle = C.wall; g.fillRect(X(L), Y(eave), X(R) - X(L), Y(base) - Y(eave));
    // shoji panels: a lit grid either side of the door
    const panels = [[-2.4, -1.55], [-1.45, -0.6], [0.6, 1.45], [1.55, 2.4]];
    for (const [a, b] of panels) {
      g.fillStyle = N ? C.shojiDim : C.shoji; g.fillRect(X(a), Y(2.1), X(b) - X(a), Y(0.95) - Y(2.1));
      glow((X(a) + X(b)) / 2, (Y(2.1) + Y(0.95)) / 2, 150, N ? 'rgba(255,170,80,0.55)' : 'rgba(255,230,180,0.25)', 1);
      g.strokeStyle = C.wood; g.lineWidth = 3;
      for (let k = 1; k < 4; k++) { const x = X(a + (b - a) * k / 4); g.beginPath(); g.moveTo(x, Y(2.1)); g.lineTo(x, Y(0.95)); g.stroke(); }
      for (let k = 1; k < 6; k++) { const y = Y(0.95 + 1.15 * k / 6); g.beginPath(); g.moveTo(X(a), y); g.lineTo(X(b), y); g.stroke(); }
      g.lineWidth = 6; g.strokeRect(X(a), Y(2.1), X(b) - X(a), Y(0.95) - Y(2.1));
    }
    // the open door: the warm room the camera flies toward
    const dg = g.createLinearGradient(0, Y(2.25), 0, Y(0.85));
    dg.addColorStop(0, N ? '#B8743A' : '#E8B27A'); dg.addColorStop(1, C.door);
    g.fillStyle = dg; g.fillRect(X(-0.45), Y(2.25), X(0.45) - X(-0.45), Y(0.85) - Y(2.25));
    g.fillStyle = N ? '#6E3E26' : '#9A6A48'; g.fillRect(X(-0.45), Y(1.05), X(0.45) - X(-0.45), Y(0.85) - Y(1.05));
    blob(X(0), Y(1.55), 18, 26, N ? '#FFE9B8' : '#FFF4D8', 0.9, 6);
    glow(X(0), Y(1.5), 360, N ? 'rgba(255,190,100,0.75)' : 'rgba(255,220,160,0.4)', 1);
    g.fillStyle = '#8E2B2B'; g.fillRect(X(-0.5), Y(2.3), X(0.5) - X(-0.5), Y(1.95) - Y(2.3));   // noren
    g.fillStyle = C.wood;
    for (const x of [L, -0.5, 0.5, R]) g.fillRect(X(x) - 7, Y(eave), 14, Y(base) - Y(eave));
    g.fillRect(X(L), Y(eave), X(R) - X(L), 16);
    // the roof: a heavy hip with curling eaves
    g.fillStyle = C.roof; g.beginPath();
    g.moveTo(X(L - 0.9), Y(2.2));
    g.quadraticCurveTo(X(L - 0.2), Y(2.45), X(L + 0.6), Y(3.3));
    g.lineTo(X(R - 0.6), Y(3.3));
    g.quadraticCurveTo(X(R + 0.2), Y(2.45), X(R + 0.9), Y(2.2));
    g.quadraticCurveTo(X(0), Y(2.55), X(L - 0.9), Y(2.2)); g.fill();
    g.strokeStyle = C.roofEdge; g.lineWidth = 8; g.beginPath();
    g.moveTo(X(L - 0.9), Y(2.2)); g.quadraticCurveTo(X(0), Y(2.55), X(R + 0.9), Y(2.2)); g.stroke();
    g.fillStyle = C.roofEdge; g.fillRect(X(L + 0.5), Y(3.38), X(R - 0.5) - X(L + 0.5), 16);
    for (let i = 0; i < 46; i++) { g.globalAlpha = 0.18; g.fillStyle = '#000'; g.fillRect(X(L + 0.7 + i * 0.087), Y(3.28), 3, Y(2.4) - Y(3.28)); }
    g.globalAlpha = 1;
    if (N) glow(X(0), Y(1.4), 900, 'rgba(255,170,90,0.12)', 1);
  }

  function stoneLantern(sx) {
    const s = C.stone;
    blob(X(sx), Y(0.3), 60, 12, '#000', 0.4, 5);
    g.fillStyle = s;
    g.fillRect(X(sx) - 10, Y(1.0), 20, Y(0.32) - Y(1.0));
    g.fillRect(X(sx) - 34, Y(1.35), 68, Y(1.0) - Y(1.35));
    g.beginPath(); g.moveTo(X(sx) - 52, Y(1.35)); g.lineTo(X(sx), Y(1.62)); g.lineTo(X(sx) + 52, Y(1.35)); g.fill();
    g.fillStyle = N ? '#FFC870' : '#F6DFA8'; g.fillRect(X(sx) - 14, Y(1.3), 28, Y(1.05) - Y(1.3));
    glow(X(sx), Y(1.17), 130, N ? 'rgba(255,190,90,0.8)' : 'rgba(255,220,150,0.35)', 1);
  }

  function cherry(tx, s) {
    // trunk and limbs reaching in toward the house, then clouds of blossom
    g.strokeStyle = C.trunk; g.lineCap = 'round';
    const limb = (x0, y0, x1, y1, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(X(x0), Y(y0)); g.quadraticCurveTo(X((x0 + x1) / 2 + 0.2 * s), Y((y0 + y1) / 2 + 0.3), X(x1), Y(y1)); g.stroke(); };
    limb(tx + 0.4 * s, -4.3, tx, 1.8, 52);
    limb(tx, 1.6, tx - 1.9 * s, 3.6, 22);
    limb(tx, 2.0, tx + 0.6 * s, 4.6, 20);
    limb(tx - 0.9 * s, 2.6, tx - 3.0 * s, 2.9, 12);
    const cl = [[tx - 1.9 * s, 3.7], [tx + 0.6 * s, 4.6], [tx - 3.0 * s, 3.0], [tx - 0.6 * s, 4.1], [tx + 0.3 * s, 3.0], [tx - 1.2 * s, 2.7]];
    for (const [cx, cy] of cl) {
      for (let i = 0; i < 60; i++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.75;
        blob(X(cx + Math.cos(a) * r * 1.3), Y(cy + Math.sin(a) * r * 0.8), 14 + rnd() * 26, 12 + rnd() * 20, rnd() < 0.3 ? C.blossomLit : C.blossom, 0.92, 1);
      }
    }
  }

  // a painterly pass: short strokes of the picture's own colours, laid at a slant
  const img = g.getImageData(0, 0, W, H).data;
  for (let i = 0; i < (far ? 90000 : 50000); i++) {
    const x = (rnd() * W) | 0, y = (rnd() * H) | 0, o = (y * W + x) * 4;
    if (img[o + 3] < 200) continue;
    const j = (rnd() - 0.5) * 18;
    g.strokeStyle = `rgba(${img[o] + j | 0},${img[o + 1] + j | 0},${img[o + 2] + j | 0},0.45)`;
    g.lineWidth = 1.5 + rnd() * 3.5;
    const a = -0.6 + (rnd() - 0.5) * 0.6, len = 4 + rnd() * 10;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  if (far) {
    const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H * 0.45, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, N ? 'rgba(4,6,18,0.55)' : 'rgba(40,20,30,0.35)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }
  return cv.toDataURL('image/png');
};
