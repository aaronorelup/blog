// 16 · Keep this (end card on the painted plate). One icon per takeaway, in the lesson's own materials.
// [[keep-1]] row 1 rises with the node.exe recipe card; on "cook" a dashed copy flies from the card to a cook;
//   on "many times" a second cook steps in beside it (two running copies of one file).
// [[keep-2]] row 2 rises with an open door (a window) and a cook behind it; on "service" a night-staff cook
//   (grey tile, gear badge) steps in beside it with no door at all (the bold lead); on "Closing a window" the door
//   closes to its dashed outline and the cook is still there, lit gold; on "old copy" that cook is named (terracotta).
// [[keep-3]] row 3 rises with the agent (sparkle tile); on "fenced" the glass fence draws round it.
// Last frame: three rows held, petals drifting.
SCENE('16', (t, S) => {
  const C = K.C, M = window.M;
  const k1 = S.cue('keep-1', 0), k2 = S.cue('keep-2', 10.45), k3 = S.cue('keep-3', 21.69);
  const wCook = S.find('cook', 0, k1 + 3.95);
  const wMany = S.find('many', 0, k1 + 6.34);
  const wWindow = S.find('Closing', 0, k2 + 4.19);   // "Closing a window" (the second 'window')
  const wOld = S.find('old', 0, k2 + 9.16);
  const wService = S.find('service', 0, k2 + 0.21);
  const wTools = S.find('tools', 0, k3 + 0.65);
  const wFenced = S.find('fenced', 0, k3 + 7.25);

  K.bg({ glow: 0.5, glowX: 1500, glowY: 520 });
  K.plate('plate', t, { zoom: true, shade: 0.5 });

  // soft indigo scrim so cream and gold read over the plate (same recipe as 01)
  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.85)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  blob(900, 540, 1150, 460, 0.88);

  K.petals(t, { n: 6, seed: 16, alpha: 0.5, avoid: [[130, 150, 1780, 880]] });

  M.eyebrow('Keep this', 170, 196, { align: 'left', alpha: K.io(t, k1 - 0.6, 0.6) });

  const TX = 450, TW = 1260;
  const IX = 280;                       // icon column centre
  const leadO = { font: 'head', weight: 700, size: 40, color: C.head, tracking: -1 };
  const bodyO = { font: 'read', weight: 400, size: 30, color: C.strong };
  // the card reads word for word what is spoken (script.md section 16 and lesson.js keep:)
  const keep = [
    ['A program is a recipe; a process is a cook using it.', 'One file can run many times, each with its own number, memory and settings.'],
    ['A service is a process the system keeps alive with no window.', 'Closing a window doesn’t end a process, and “port already in use” usually means an old copy holds the hatch.'],
    ['Your AI tools are processes too.', 'They run as you, with your keys. Know what should run, and whether it’s fenced in.'],
  ];
  const rowY = [290, 500, 710];
  const at = [k1, k2, k3];

  keep.forEach((r, i) => {
    const k = K.io(t, at[i], 0.6, 'out');
    if (k <= 0.002) return;
    const y = rowY[i] + 18 * (1 - k);
    const h = K.para(r[0], TX, y, TW, { ...leadO, lh: 50, alpha: k });
    K.para(r[1], TX, y + h + 6, TW, { ...bodyO, lh: 42, alpha: k });
  });

  // ---------------------------------------------------------------- icon 1: recipe card + cooks
  {
    const k = K.io(t, k1, 0.6, 'out');
    if (k > 0.002) {
      const cy = rowY[0] + 30 + 18 * (1 - k);
      K.layer(k, () => {
        const cardX = IX - 88, cX1 = IX + 34, cX2 = IX + 92;
        M.recipe(cardX, cy, { name: 'node.exe', w: 150, h: 100, icon: 'program' });
        // second running copy, steps in on "many"
        const m = K.io(t, wMany - 0.1, 0.5);
        if (m > 0.002) M.cook(t, cX2, cy + 4, 50, { alpha: m, hat: true });
        const c = K.io(t, wCook - 0.05, 0.45);
        if (c > 0.002) M.cook(t, cX1, cy + 4, 58, { alpha: c, lit: 0.6 * c });
        // the dashed copy flies card -> cook
        const f = K.seg(t, wCook - 0.55, wCook + 0.2);
        if (f > 0 && f < 1) {
          const e = K.ease.io(f);
          M.recipe(K.lerp(cardX, cX1, e), cy - 40 * Math.sin(Math.PI * e), { name: '', w: 60, h: 42, dashed: true, alpha: 1 - K.seg(f, 0.6, 1) });
        }
      });
    }
  }

  // ---------------------------------------------------------------- icon 2: the door closes, the cook stays
  {
    const k = K.io(t, k2, 0.6, 'out');
    if (k > 0.002) {
      const cy = rowY[1] + 34 + 18 * (1 - k);
      const close = K.io(t, wWindow, 0.7);
      const named = K.io(t, wOld - 0.1, 0.5);
      const sv = K.io(t, wService - 0.1, 0.5);
      const DX = IX - 34;                 // door shifted left to make room for the night-staff cook
      K.layer(k, () => {
        M.cook(t, DX, cy + 10, 60, { lit: 0.6 * close * (1 - named), named });
        M.doorWin(t, { x: DX - 95, y: cy - 66, w: 190, h: 140, title: '', kind: 'browser', close });
        // a service: started by the OS, never had a door (named while the bold lead is said)
        if (sv > 0.002) M.cook(t, IX + 100, cy + 12 + 12 * (1 - sv), 56, { kind: 'service', alpha: sv, named: sv * (1 - close) });
      });
    }
  }

  // ---------------------------------------------------------------- icon 3: the agent behind a glass fence
  {
    const k = K.io(t, k3, 0.6, 'out');
    if (k > 0.002) {
      const cy = rowY[2] + 34 + 18 * (1 - k);
      const fk = K.io(t, wFenced - 0.2, 0.9);
      const lit = K.io(t, wTools - 0.1, 0.5);
      K.layer(k, () => {
        M.cook(t, IX, cy + 6, 66, { kind: 'agent', lit: 0.7 * lit });
        M.fence(IX - 90, cy - 62, 180, 136, { k: fk, glow: fk, r: 22 });
      });
    }
  }
});
