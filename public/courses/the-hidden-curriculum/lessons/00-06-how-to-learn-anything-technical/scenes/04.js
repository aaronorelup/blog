/* 04 - The builder and the owner: the mental model. The crew (AI) builds and re-checks; the owner (you) walks
   through the finished, lit house, and the question changes to what can't be seen from inside. */
SCENE('04', (t, S) => {
  const C = K.C, P = M.palette;
  K.bg({ glow: 0.35, glowX: 960, glowY: 600 });

  // ---- beats (local seconds)
  const tCrew = S.cue('crew', 3.1);
  const tOwner = S.cue('owner', 5.6);
  const tBuild = S.find('builds', 0, 8.0);
  const tChecks = S.find('checks', 0, 9.0);
  const tRebuild = S.cue('rebuild', 10.3);
  const tWalk = S.cue('walkthrough', 13.1);
  const tLights = S.find('lights', 0, 14.9);
  const tTaps = S.find('taps', 0, 16.0);
  const tWorks = S.find('works', 0, 17.0);
  const tAnswers = S.find('answers', 0, 22.1);
  const tCant = S.cue('cant-see', 26.4);
  const tQuestion = S.find('question', 0, 24.8);

  const HX = 960, HY = 600, HS = 420;
  const gm = M.geo(HX, HY, HS);
  const ground = gm.ground;

  // ---- gentle push into the house on the walkthrough
  const z = 1 + 0.12 * K.io(t, tWalk, 1.6, 'io');

  K.zoomAt(HX, HY, z, () => {
    // house: lights per window, the third one on "taps"
    M.house(t, HX, HY, HS, {
      lights: (i) => (i < 2 ? K.io(t, tLights + i * 0.18, 0.7) : K.io(t, tTaps, 0.7)),
    });

    // faint dashed hint of rooms behind the walls (no detail yet; 05 cuts them open)
    const hk = K.io(t, tCant + 0.4, 0.9);
    if (hk > 0) {
      Object.values(gm.rooms).forEach((R, i) => {
        const a = hk * 0.6 * K.clamp(hk * 4 - i * 0.6);
        const o = { color: P.unseen, w: 2.5, dash: [10, 9], alpha: a };
        K.line(R.x, R.y, R.x + R.w, R.y, o); K.line(R.x + R.w, R.y, R.x + R.w, R.y + R.h, o);
        K.line(R.x + R.w, R.y + R.h, R.x, R.y + R.h, o); K.line(R.x, R.y + R.h, R.x, R.y, o);
      });
    }

    // ---- the garden wall the crew builds, checks, and rebuilds (pillar 2 bricks x 6 courses)
    const BW = 36, BH = 20, COURSES = 6, WX0 = 568, WX1 = WX0 + 2 * BW;
    const laid = K.clamp((t - tBuild) / 0.9) * COURSES;               // courses rise while "builds a wall"
    const fall = K.io(t, tRebuild, 0.45, 'in');                       // topples toward the house
    const back = K.io(t, tRebuild + 0.95, 0.7, 'io');                 // the crew stands it back up
    const ang = (Math.PI / 2) * fall * (1 - back);
    if (laid > 0) {
      K.at(WX1, ground, 1, ang, () => {
        const g = K.ctx();
        g.save(); g.translate(-WX1, -ground);
        for (let c = 0; c < COURSES; c++) {
          const ck = K.clamp(laid - c);
          if (ck <= 0) break;
          const y0 = ground - (c + 1) * BH, off = c % 2 ? BW / 2 : 0;
          for (let b = -1; b < 3; b++) {
            let x0 = WX0 + b * BW + off, x1 = x0 + BW;
            x0 = Math.max(x0, WX0); x1 = Math.min(x1, WX1);
            if (x1 - x0 < 2) continue;
            g.globalAlpha = ck;
            g.fillStyle = P.brick; g.strokeStyle = P.brickLine; g.lineWidth = 2;
            g.fillRect(x0, y0 + (1 - ck) * -10, x1 - x0, BH); g.strokeRect(x0, y0 + (1 - ck) * -10, x1 - x0, BH);
          }
        }
        g.globalAlpha = 1;
        g.restore();
      });
    }
    // check over the wall: once when it stands, again after the rebuild
    const wcx = (WX0 + WX1) / 2, wcy = ground - 100;
    const ccx = WX1 + 46;
    const chk1 = K.io(t, tChecks, 0.45, 'out') * (1 - K.io(t, tRebuild - 0.05, 0.25));
    const chk2 = K.io(t, tRebuild + 1.75, 0.45, 'out') * (1 - K.io(t, tWalk + 0.2, 0.6));
    const ck = Math.max(chk1, chk2);
    if (ck > 0) {
      K.layer(ck, () => {
        K.card(ccx - 26, wcy - 26, 52, 52, { r: 26, fill: C.tile, stroke: P.machine, shadow: false });
        K.icon('check', ccx, wcy, 34, { color: P.machine, w: 4 });
      });
    }

    // ---- the crew: three sparkles; one flies to the wall to build, then sweeps it back up
    const homes = [[400, 590], [478, 668], [318, 668]];
    homes.forEach(([hx, hy], i) => {
      const pk = K.io(t, tCrew + i * 0.16, 0.55, 'back');            // the scene's one overshoot
      if (pk <= 0) return;
      let x = hx, y = hy, carry = null;
      if (i === 1) {
        const go = K.io(t, tBuild - 0.45, 0.5, 'io');                 // to the wall
        const ret = K.io(t, tRebuild + 1.8, 0.6, 'io');               // home again after the rebuild
        const wx = wcx, wy = ground - COURSES * BH - 56;
        // during the fall the builder swoops low over the toppled wall, then lifts with it
        const sweep = K.io(t, tRebuild + 0.45, 0.35, 'io') * (1 - K.io(t, tRebuild + 0.95, 0.7, 'io'));
        x = K.lerp(K.lerp(hx, wx, go), hx, ret) + sweep * 70;
        y = K.lerp(K.lerp(hy, wy, go), hy, ret) + sweep * 60;
        if (t > tBuild - 0.2 && t < tBuild + 0.9) carry = 'brick';
      }
      K.at(x, y, 0.4 + 0.6 * pk, 0, () => M.crew(t, 0, 0, 70, { i, carry, alpha: K.clamp(pk * 1.6) }));
    });
    // crew label: "the crew: AI", later "the crew checks it stands"
    const lk = K.io(t, tCrew + 0.3, 0.6);
    const swap = K.io(t, tAnswers, 0.6);
    if (lk > 0) {
      M.label('the crew: AI', 390, 480, 'machine', { size: 32, alpha: lk * (1 - swap) });
      if (swap > 0) M.label('the crew checks it stands', 400, 480, 'machine', { size: 32, alpha: swap });
    }

    // ---- the owner: appears at the right, walks in through the front door, the lights come on,
    //      then steps back out to stand by the house (label returns) and, as the question changes, wonders.
    const ok = K.io(t, tOwner, 0.6, 'out');
    if (ok > 0) {
      const D = gm.door;
      const tOut = tWorks + 1.9;                                       // "For years, that was the whole test"
      const walk = K.io(t, tWalk + 0.1, 2.1, 'io');
      const back = K.io(t, tOut, 1.6, 'io');
      const OX = 1440;
      const ox = K.lerp(K.lerp(1500, D.x, walk), OX, back);
      const os = K.lerp(K.lerp(130, 80, K.io(t, tWalk + 1.5, 0.7, 'io')), 130, K.io(t, tOut + 0.2, 1.2, 'io'));
      // inside: the figure fades at the door, reappears there before walking back out
      const inside = K.io(t, tWalk + 2.0, 0.4) * (1 - K.io(t, tOut - 0.35, 0.4));
      // dotted path along the ground, drawn ahead of the owner, gone once inside
      const pk = K.io(t, tWalk, 0.7, 'out') * (1 - K.io(t, tWalk + 2.6, 0.8));
      if (pk > 0) K.line(1500, ground + 16, D.x + 30, ground + 16, { k: pk, color: P.owner, w: 3, dash: [4, 12], alpha: 0.55 * pk });
      // the door opens onto lamplight as the owner reaches it
      const dk = K.io(t, tWalk + 1.4, 0.5, 'out');
      if (dk > 0) {
        K.layer(dk, () => {
          const g = K.ctx();
          g.fillStyle = K.mixColor(P.lamp, P.wood, 0.25);
          K.rr(D.x - D.w / 2, D.y - D.h / 2, D.w, D.h, 4); g.fill();
          K.glow(D.x, D.y, 80, C.head, 0.3);
        });
      }
      // on "the owner's question changes": a soft gold glow and a question mark at the hand
      const tq = tQuestion;
      const qk = K.io(t, tq, 0.6, 'out');
      if (qk > 0) K.glow(ox, ground - os * 0.55, 120, C.head, 0.22 * qk);
      M.person(t, ox, ground, os, 'owner', {
        alpha: ok * (1 - inside), i: 1,
        prop: qk > 0 ? 'question' : null, propK: qk,
        face: back > 0.5 ? -1 : 1,
      });
      const nameK = (1 - K.io(t, tWalk, 0.5)) + K.io(t, tOut + 1.3, 0.6);
      if (nameK > 0) M.label('the owner: you, who signs off', K.clamp(ox, 1250, 1640), ground - os - 22, 'machine', { alpha: ok * K.clamp(nameK) * (1 - inside) });
    }
  });

  // ---- screen-space text: eyebrow and the verdict chips
  K.eyebrow('the mental model', 960, 170, { size: 26, align: 'center', alpha: K.io(t, 0.1, 0.6) });
  const wk = K.io(t, tWorks, 0.5, 'out');
  const cant = K.io(t, tCant, 0.6, 'io');
  if (wk > 0) {
    const y = K.lerp(370, 270, cant);
    K.layer(1 - 0.45 * cant, () => M.chip('It works', 960, y, cant > 0.5 ? 'neutral' : 'machine', { k: wk, icon: 'check' }));
  }
  if (cant > 0) M.chip("What can't I see from in here?", 960, 372, 'ask', { k: K.io(t, tCant + 0.15, 0.5, 'out'), size: 36 });
});
