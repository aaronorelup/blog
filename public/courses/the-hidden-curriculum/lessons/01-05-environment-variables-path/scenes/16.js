// 16 · Keep this (end card). Bookends 01: the plate, the satchel emblem at the right.
// [[keep-one]] row 1 rises; the satchel opens on "copy" (HOME, PATH, KEY cards peek out).
// [[keep-two]] row 2; the PATH card lifts and lights gold on "Path".
// [[keep-three]] row 3; the KEY card rises a little on "Keys", and on "agents" the agent courier (sparkle + lantern)
// steps in under the satchel and a copy of KEY flies into its satchel. Last frame: three rows, open satchel, agent
// resting, petals drifting.
SCENE('16', (t, S) => {
  const C = K.C, M = window.M;
  const k1 = S.cue('keep-one', 0), k2 = S.cue('keep-two', 11.09), k3 = S.cue('keep-three', 19.13);
  const wCopy = S.find('copy', 0, k1 + 1.37);
  const wPath = S.find('path', 0, k2);
  const wKeys = S.find('keys', 0, k3);
  const wAgents = S.find('agents', 0, k3 + 4.2);

  K.bg({ glow: 0.5, glowX: 1500, glowY: 520 });
  K.plate('plate', t, { zoom: true, shade: 0.5 });

  // soft indigo scrims so cream and gold read over the plate (same recipe as 01)
  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.85)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  blob(700, 540, 1000, 440, 0.85);
  blob(1580, 620, 380, 340, 0.6);

  // ---------------------------------------------------------------- the satchel emblem
  const SX = 1580, SY = 560, SS = 320;
  const open = K.io(t, wCopy - 0.1, 0.6);
  const pathLift = K.io(t, wPath - 0.1, 0.5);
  const keyLift = K.io(t, wKeys - 0.1, 0.5);
  const sat = M.satchel(t, SX, SY, SS, {
    open, glow: 0.45 + 0.35 * pathLift,
    cards: open > 0.02 ? [
      { name: 'HOME', w: 84 },
      { name: 'PATH', kind: 'path', w: 92, lift: pathLift, lit: pathLift },
      { name: 'KEY', kind: 'key', w: 84, lift: 0.35 * keyLift },
    ] : [],
  });

  // the agent: steps in under the satchel on "agents" and gets its own copy of KEY
  {
    const ak = K.io(t, wAgents - 0.3, 0.9);
    if (ak > 0.002) {
      const AX = 1640, AY = 785, AS = 110;
      const x = K.lerp(1990, AX, ak);
      const flyA = wAgents + 0.7;
      const fk = K.seg(t, flyA, flyA + 0.8);
      const aOpen = K.io(t, flyA - 0.5, 0.5);
      const c = M.courier(t, x, AY, AS, {
        icon: 'sparkle', lantern: 1, walking: ak < 1 ? 1 : 0, label: 'agent', labelColor: C.strong,
        satchelScale: 0.9, satchel: { open: aOpen, cards: [] },
      });
      // the copied KEY card: drawn here (the courier's own card art is too small to read at this size)
      // and clipped at the satchel mouth so it rises out of the bag once the copy has landed
      const mouth = c.sy - c.ss * 0.3;
      const rise = K.io(t, flyA + 0.75, 0.5, 'out');
      if (rise > 0.002) {
        g.save();
        g.beginPath(); g.rect(c.sx - 200, mouth - 400, 400, 400); g.clip();
        M.chip(c.sx + 14, mouth - 74 * rise + 6, { w: 74, h: 100, name: 'KEY', kind: 'key', size: 26 });
        g.restore();
      }
      if (fk > 0 && fk < 1) M.copyFly(SX + 90, sat.mouthY - 60, c.sx, mouth - 10, fk, { name: 'KEY', kind: 'key', w: 70, h: 86, bend: -60 });
    }
  }

  K.petals(t, {
    n: 6, seed: 16, alpha: 0.5,
    avoid: [[130, 160, 1300, 900], [1360, 250, 1820, 900]],
  });

  // ---------------------------------------------------------------- the takeaways
  M.eyebrow('Keep this', 160, 230, { align: 'left' });

  const X = 160, TX = 236, TW = 1080;
  const leadO = { font: 'head', weight: 700, size: 40, color: C.head, tracking: -1 };
  const bodyO = { font: 'read', weight: 400, size: 30, color: C.strong };
  const rows = [
    { y: 330, at: k1, lead: 'Every program carries a copy of its parent’s environment.',
      body: 'Changes at home reach only programs started afterwards: open a new terminal.' },
    { y: 510, at: k2, lead: null,
      body: 'To know which program ran, ask the shell.' },
    { y: 690, at: k3, lead: 'Keys in the environment go wherever you send programs.',
      body: 'Agents included: know where yours live, and who can read them.' },
  ];
  rows.forEach((r, i) => {
    const k = K.io(t, r.at, 0.6, 'out');
    if (k <= 0.002) return;
    const y = r.y + 18 * (1 - k);
    K.text(String(i + 1), X, y, { font: 'head', size: 52, weight: 700, color: C.head, alpha: k });
    let by;
    if (r.lead) {
      const h = K.para(r.lead, TX, y, TW, { ...leadO, lh: 50, alpha: k });
      by = y + h + 6;
    } else {
      // PATH is a literal name: mono, still gold
      K.spans([
        { s: 'PATH', font: 'mono', weight: 700 },
        { s: ' is an ordered list, and the first match wins.' },
      ], TX, y, { ...leadO, alpha: k });
      by = y + 56;
    }
    K.para(r.body, TX, by, TW, { ...bodyO, lh: 42, alpha: k });
  });
});
