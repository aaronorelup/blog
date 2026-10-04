// 12 — "Is it ready to deploy?"  Move-in day: the keys go to real tenants only after someone who can code signs.
SCENE('12', (t, S) => {
  const C = K.C, P = M.palette;
  K.bg({ glow: 0.3, glowX: 700, glowY: 600 });

  // ---- cue times (local seconds)
  const tMove = S.cue('move-in', 0.75);
  const tAsk = S.find('ready', 0, 5.9) - 0.45;
  const tTrap = S.cue('same-trap', 6.9);
  const tCard = S.find('agent', 0, 8.8);
  const tChecks = S.find('checks', 0, 9.6);
  const tReports = S.find('reports', 0, 11);
  const tVouch = S.find('vouch', 0, 13.2);
  const tWho = S.cue('who-sees', 15.65);
  const tCost = S.cue('cost', 17.5);
  const tRoll = S.cue('rollback', 19.9);
  const tSign = S.cue('sign', 23.5);
  const tScan = S.find('scanners', 0, 27.8);

  // ---- the house (left layout), cut away when "who may see which data" lands
  const L = M.layout.left;
  const cut = K.io(t, tWho - 0.2, 0.9);
  const hot = K.io(t, tWho + 0.3, 0.6);
  const gm = M.house(t, L.x, L.y, L.s, { lights: 1, cutaway: cut, roomHot: { data: hot } });

  // Work-around (same as scene 05): 00-shared.js nests K.mixColor (which returns rgb(), not hex),
  // so its cutaway room fill comes out #000. Repaint the room cards with a hex mix, then redraw icons.
  const hexMix = (a, b, k) => {
    const A = parseInt(a.slice(1), 16), Bc = parseInt(b.slice(1), 16);
    const ch = (sh) => Math.round(K.lerp((A >> sh) & 255, (Bc >> sh) & 255, k)).toString(16).padStart(2, '0');
    return '#' + ch(16) + ch(8) + ch(0);
  };
  if (cut > 0) {
    const g = K.ctx(), lw = Math.max(1.6, L.s * 0.007);
    Object.keys(gm.rooms).forEach((key, i) => {
      const r = gm.rooms[key], rk = K.clamp(cut * 1.6 - i * 0.15);
      if (rk <= 0) return;
      const ht = key === 'data' ? hot : 0;
      g.save(); g.globalAlpha *= rk;
      K.rr(r.x, r.y, r.w, r.h, Math.min(12, L.s * 0.03));
      g.fillStyle = hexMix(P.room, '#3A2522', ht); g.fill();
      g.strokeStyle = ht > 0.05 ? K.mixColor(C.line2, P.unseen, ht) : C.line2;
      g.lineWidth = lw; g.stroke();
      g.restore();
      K.icon(r.icon, r.cx, r.cy, Math.min(r.w, r.h) * 0.5, { color: ht > 0.05 ? P.unseen : C.body, alpha: rk, w: Math.max(2, L.s * 0.008) });
    });
  }

  // ribbon over the house
  // "move-in day" gives way to "same trap" in the same spot (one pill over the roof, never a stack)
  const trapK = K.io(t, tTrap + 0.3, 0.6, 'out');
  M.chip('move-in day', L.x, gm.bounds.y0 - 52, 'neutral', { k: K.io(t, tMove, 0.6, 'out'), alpha: 1 - trapK });

  // ---- owner on the ground, left of the house; asks the question
  const owner = M.person(t, 230, gm.ground, 140, 'owner', { i: 0 });
  M.bubble('Ready to deploy?', 268, owner.top - 70, 'owner', { k: K.io(t, tAsk, 0.5, 'out') });

  // ---- crew between house and checklist; answers yes, then the yes is doubted
  const dim = K.io(t, tVouch, 0.7);
  M.crewGroup(t, 1040, 560, 2, 56, { dim });
  M.bubble('Yes', 1040, 440, 'crew', { k: K.io(t, tTrap - 0.1, 0.5, 'out'), check: K.io(t, tReports + 0.3, 0.5), dim, size: 32 });
  if (trapK > 0) M.chip('same trap', L.x, gm.bounds.y0 - 52, 'unseen', { k: trapK });

  // ---- the deploy checklist
  const cardK = K.io(t, tCard, 0.6, 'out');
  const signK = K.io(t, tSign + 0.7, 1.3, 'lin');
  if (cardK > 0) {
    K.layer(cardK, () => K.at(0, (1 - cardK) * 24, 1, () => {
      const X = 1180, Y = 170, W = 620, rh = 52.5;
      const hFull = 32 * 2 + 46 + 5 * rh + 96 - (rh - 36); // same height math as M.checklist (size 30, title, sign)
      // the card grows row by row as each item is said, then opens the signature strip on "sign"
      const grow = (K.io(t, tWho - 0.15, 0.5) + K.io(t, tCost - 0.15, 0.5) + K.io(t, tRoll - 0.15, 0.5)) * rh
        + K.io(t, tSign - 0.2, 0.6) * (96 - 8);
      const h = Math.min(hFull, 32 * 2 + 46 + 2 * rh - (rh - 36) + 8 + grow);
      K.card(X, Y, W, h, { r: 20 });
      const g = K.ctx();
      g.save(); K.rr(X + 1, Y + 1, W - 2, h - 2, 19); g.clip();
      M.checklist(X, Y, W, [
        { s: 'builds', kind: 'machine', k: K.io(t, tChecks, 0.5) },
        { s: 'tests pass', kind: 'machine', k: K.io(t, tChecks + 0.6, 0.5) },
        { s: 'who can see what', kind: 'unseen', k: K.io(t, tWho, 0.5) },
        { s: 'cost under real load', kind: 'unseen', k: K.io(t, tCost, 0.5) },
        { s: 'how to roll back', kind: 'unseen', k: K.io(t, tRoll, 0.5) },
      ], { title: 'ready to deploy?', signK: signK, signLabel: ' ' });
      // footer label is drawn here (not by the shared card) so it only appears when "someone who can code" is said
      const labK = K.io(t, tSign, 0.6, 'out');
      if (labK > 0) K.layer(labK, () => K.text('signed: someone who can code', X + 32, Y + hFull - 32 - 34 + 30,
        { font: 'ui', weight: 600, size: 26, color: signK > 0.9 ? C.head : C.soft }));
      g.restore();
      K.card(X, Y, W, h, { r: 20, fill: 'rgba(0,0,0,0)', shadow: false });   // crisp outline over the clipped card
    }));
  }

  // ---- the signer: someone who can code
  const signerK = K.io(t, tSign, 0.6, 'out');
  M.person(t, 1190, 880, 130, 'signer', { i: 2, alpha: signerK });

  // ---- tenants waiting at right
  const tenX = [1490, 1630, 1770];
  const tenants = tenX.map((x, i) => {
    const k = K.stagger(t, tMove + 0.2, i, 0.15, 0.6);
    return { k, p: null, x };
  });
  const keyArrive = K.io(t, tSign + 2.2, 0.9);
  tenants.forEach((tn, i) => {
    K.layer(tn.k, () => K.at(0, (1 - tn.k) * 20, 1, () => {
      tn.p = M.person(t, tn.x, 880, 120, 'tenant', { i: 3 + i, prop: i === 0 ? 'key' : null, propK: i === 0 ? K.seg(keyArrive, 0.8, 1) : 0 });
    }));
  });

  // ---- the key: hovers between house and tenants until the checklist is signed, then goes to the first tenant
  const keyK = K.io(t, tMove + 0.3, 0.6, 'out');
  if (keyK > 0 && keyArrive < 1) {
    const hx = 1060, hy = 740 + K.wave(t, 1.7, 4, 0.5);
    const tx = tenX[0] + 36, ty = 880 - 48;
    const kx = K.lerp(hx, tx, keyArrive), ky = K.lerp(hy, ty, keyArrive) - Math.sin(keyArrive * Math.PI) * 60;
    K.layer(keyK * (1 - K.seg(keyArrive, 0.8, 1)), () => {
      K.glow(kx, ky, 46, C.head, 0.35);
      K.icon('key', kx, ky, 54, { color: P.machine, w: 4 });
    });
  }

  // ---- scanners: a caveat under the checklist
  M.chip('pre-launch scanners: helpful, not enough', 1490, 690, 'unseen', { k: K.io(t, tScan, 0.6, 'out') });
});
