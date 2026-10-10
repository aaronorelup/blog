/* 01.05 scene 03 — The satchel copied at the door.
   Home (the stored master copy) stays shut at the far left. A courier (a running program) pops in; four
   possible parents are named (File Explorer, terminal, editor, agent); the terminal becomes "parent" at x 520.
   "At the door": a doorway opens between parent and courier. The parent's cards rise; dashed copies fly
   through the doorway into the courier's satchel ("a copy, at the door"). The courier steps out onto the road
   (x 1060 -> 1300) and the doorway shuts behind it; the copies turn solid. Home (the stored master copy)
   then gets a key card ("home changes later"): its arrow is stopped at the shut doorway, never reaching the courier. The courier adds its own card:
   its arrow back is stopped at the shut doorway. Cards sink, satchels close, and 01.03's you-are-here dot is
   copied the same way, parent flap -> courier flap. Exit: home shut, courier on the road at x 1300, calm. */
SCENE('03', (t, S) => {
  const M = window.M, C = K.C, L = M.L;
  K.bg();

  // ---- cue times (local seconds) ----
  const tCourier = S.cue('courier', 0);
  const tParent = S.cue('parent', 3.17);
  const tSatchel = S.cue('satchel', 12.18);
  const tDoor = S.cue('door-closes', 20.16);
  const tNoRet = S.cue('no-return', 27.83);
  const tDot = S.cue('dot-callback', 31.93);
  const w = (word, n, fb) => S.find(word, n || 0, fb, { whole: true });
  const tExplorer = w('File', 0, tParent + 2.36);
  const tTerm = w('terminal,', 0, tParent + 3.81);
  const tEditor = w('editor,', 0, tParent + 4.86);
  const tAgent = w('agent.', 0, tParent + 5.9);
  const tSender = w('sender', 0, tParent + 7.31);
  const tCopies = w('copies', 0, tSatchel + 1.36);
  const tHands = w('hands', 0, tSatchel + 5.7);
  const tCloses = w('closes,', 0, tDoor + 0.63);
  const tBelongs = w('belongs', 0, tDoor + 2.31);
  const tNothing = w('Nothing', 0, tDoor + 4.21);
  const tReaches = w('reaches', 0, tDoor + 6.19);
  const tChanges = w('changes', 0, tNoRet + 1.24);
  const tBack = w('back', 0, tNoRet + 3.0);
  const tHere = w('you-are-here', 0, tDot + 0.23);
  const tAgo = w('ago', 0, tDot + 2.44);
  const tTravels = w('travels', 0, tDot + 2.87);

  const LANE = L.laneY;            // 540
  const PX = 520;                  // the parent's spot
  const CX0 = 1060, CX1 = 1300;    // the courier: on the doorstep, then on the road
  const DW = { x: 750, y: 380, w: 160, h: 380 };   // the doorway between parent and courier

  // ---- home: the stored master copy, shut the whole scene ----
  M.door(t, { open: 0 });

  // the road: a faint ground line under the couriers
  K.line(L.laneX0, 700, L.laneX1, 700, { color: K.rgba(C.line2, 0.55), w: 2, dash: [14, 12] });

  // ---- the doorway: appears on "At the door", open; swings shut once the courier has stepped out ----
  const doorwayA = K.io(t, tSatchel - 0.1, 0.5, 'io');
  const doorwayOpen = 1 - K.io(t, tCloses - 0.15, 0.6, 'io');
  if (doorwayA > 0.002) {
    M.door(t, { ...DW, open: doorwayOpen, label: '', icon: false, glow: 0.3 * doorwayOpen, alpha: doorwayA });
  }

  // ---- the four possible parents (named one by one), then the terminal becomes "the parent" ----
  const cand = [
    { icon: 'file', label: 'File Explorer', at: tExplorer },
    { icon: 'terminal', label: 'terminal', at: tTerm },
    { icon: 'code', label: 'editor', at: tEditor },
    { icon: 'sparkle', label: 'agent', at: tAgent, lantern: 1 },
  ];
  const rowY = 270, rowX0 = 560, rowDX = 240, rowS = 90;
  const pickK = K.io(t, tSender, 0.8, 'io');            // terminal walks down to the parent spot
  const othersOut = K.io(t, tSender, 0.5, 'io');
  cand.forEach((c, i) => {
    if (i === 1) return;                                 // the terminal is drawn as the parent below
    const a = K.stagger(t, tParent, i, 0.12, 0.5) * (1 - othersOut);
    if (a <= 0.002) return;
    M.courier(t, rowX0 + i * rowDX, rowY, rowS, {
      icon: c.icon, label: c.label, alpha: a, dim: 1 - K.io(t, c.at - 0.1, 0.4, 'io'),
      lantern: c.lantern ? 1 : 0, satchel: { open: 0 },
    });
  });

  // ---- satchel open/close windows ----
  const sinkK = K.io(t, tDot, 0.7, 'io');               // every card goes back into its satchel on the callback
  const closeK = K.io(t, tDot + 0.35, 0.6, 'io');

  // ---- the parent (terminal) ----
  const parentA = K.stagger(t, tParent, 1, 0.12, 0.5);
  const px = K.lerp(rowX0 + rowDX, PX, pickK), py = K.lerp(rowY, LANE, pickK), ps = K.lerp(rowS, 140, pickK);
  const parentOpen = K.io(t, tSatchel, 0.6, 'io') * (1 - closeK);
  const par = M.courier(t, px, py, ps, {
    icon: 'terminal', alpha: parentA, dim: 1 - K.io(t, tTerm - 0.1, 0.4, 'io'),
    lit: K.io(t, tSender, 0.6, 'io'), walking: pickK > 0 && pickK < 1 ? 1 : 0,
    satchel: { open: parentOpen },
    label: pickK < 0.5 ? 'terminal' : null,
  });
  M.label('parent', PX, LANE + 70 + 44, { color: C.strong, size: 30, alpha: K.io(t, tSender + 0.6, 0.5, 'io') });

  // ---- the child courier: pops in at 1180, slides to the doorstep when the parent is named, steps onto the road ----
  const slideK = K.io(t, tSender + 0.1, 0.8, 'io');
  const walkK = K.io(t, tDoor, 0.8, 'io');
  const cx = K.lerp(K.lerp(1180, CX0, slideK), CX1, walkK);
  const moving = (slideK > 0 && slideK < 1) || (walkK > 0 && walkK < 1);
  const childOpen = K.io(t, tCopies + 1.2, 0.6, 'io') * (1 - closeK);
  let ch = { sx: cx + 67, sy: LANE + 42, ss: 98 };
  K.pop(t, tCourier + 0.1, cx, LANE, () => {
    ch = M.courier(t, cx, LANE, 140, {
      icon: 'terminal', walking: moving ? 1 : 0, satchel: { open: childOpen },
      label: 'a running program', labelSize: 30,
    });
  });

  // ---- the cards: a fan above each satchel ----
  const CARDS = [
    { name: 'PATH', kind: 'path' },
    { name: 'HOME', kind: 'plain' },
    { name: 'TEMP', kind: 'plain' },
  ];
  const CW = 100, CH = 120, FAN_TOP = 250, FAN_DX = 120;
  const fanX = (x0, i) => x0 + 20 + (i - 1) * FAN_DX;

  // a card rising out of (or sinking back into) a satchel: k 0 = at the mouth, 1 = in the fan
  const fanCard = (sat, x, k, o) => {
    if (k <= 0.002) return;
    const e = K.clamp(k);
    const mx = sat.sx, my = sat.sy - sat.ss * 0.34;
    M.chip(K.lerp(mx, x, e), K.lerp(my - 20, FAN_TOP, e), {
      w: K.lerp(36, o.w || CW, e), h: K.lerp(44, CH, e), name: e > 0.7 ? o.name : null,
      kind: o.kind, alpha: K.clamp(e * 2.5) * (o.alpha == null ? 1 : o.alpha), dashed: o.dashed, lit: o.lit, new: o.new, rot: o.rot || 0,
    });
  };

  // parent's own cards rise on "copies its own satchel"
  CARDS.forEach((c, i) => {
    const k = K.stagger(t, tCopies, i, 0.15, 0.7) * (1 - sinkK);
    fanCard(par, fanX(PX, i), k, c);
  });

  // home (the stored master copy) changes later: a key card lands ON the home door, not in the parent's satchel
  // (the one 'back' overshoot). "home" always means the stored settings; the parent is only the one who copied.
  const HKX = M.L.door.x + M.L.door.w / 2, HKY = 420;   // card hangs from y 420 on the shut door
  const keyIn = K.io(t, tNothing + 0.05, 0.55, 'back');
  const keyK = K.clamp(keyIn) * (1 - sinkK);
  if (keyK > 0.002) {
    const s = 0.7 + 0.3 * keyIn;
    K.layer(keyK, () => K.at(HKX, HKY + CH / 2, s, 0, () => {
      M.chip(0, -CH / 2, { w: 160, h: CH, name: 'API_KEY', kind: 'key', new: true });
    }));
  }
  M.label('home changes later', HKX + 20, 205, { color: C.strong, size: 28, alpha: K.io(t, tNothing + 0.1, 0.5, 'io') * (1 - sinkK) });
  // a quiet gloss under the door so "home" can't be mistaken for the parent
  M.label('stored settings', HKX, 912, { color: C.soft, size: 26, alpha: K.io(t, tNothing, 0.5, 'io') });

  // dashed copies fly from the parent's fan, over the doorway, into the courier's fan ("hands over the copy")
  const copyAt = (i) => tHands - 0.7 + i * 0.18;
  const solidK = K.io(t, tBelongs - 0.2, 0.4, 'io');    // copies become the courier's own
  CARDS.forEach((c, i) => {
    const k = K.seg(t, copyAt(i), copyAt(i) + 0.85);
    const tx = fanX(cx, i);
    if (k > 0 && k < 1) {
      M.copyFly(fanX(PX, i), FAN_TOP + CH * 0.4, tx, FAN_TOP + CH * 0.4, k, { name: c.name, kind: c.kind, w: CW, h: CH, sink: false, bend: -110 });
    } else if (k >= 1) {
      fanCard(ch, tx, 1 - sinkK, { ...c, dashed: solidK < 0.5 });
    }
  });

  // the courier changes something on the road: its own new card
  const NEWX = fanX(cx, 3);
  const newIn = K.io(t, tChanges - 0.1, 0.5, 'io');
  if (newIn > 0.002) {
    const pulse = Math.sin(K.clamp(K.seg(t, tChanges - 0.1, tChanges + 0.9)) * Math.PI);
    fanCard(ch, NEWX, newIn * (1 - sinkK), { name: 'DEBUG', kind: 'plain', new: true, lit: pulse, w: 120 });
  }
  M.label('courier changes', NEWX, 192, { color: C.strong, size: 26, alpha: K.io(t, tChanges, 0.5, 'io') * (1 - sinkK) });

  // "a copy, at the door"
  const copyLabelA = K.io(t, tHands - 0.1, 0.5, 'io') * (1 - K.io(t, tDoor, 0.5, 'io'));
  M.label('a copy, at the door', 960, 190, { color: C.strong, size: 30, alpha: copyLabelA });

  // ---- blocked: home's later change never reaches the courier on the road (stops at the shut doorway) ----
  K.layer(1 - sinkK, () => {
    const ax0 = HKX + 90, ax1 = fanX(CX1, 0) - 60, ay = 415, stopX = DW.x - 10;
    M.blocked(ax0, ay, ax1, ay, K.seg(t, tNothing + 0.6, tReaches + 0.6), { stop: (stopX - ax0) / (ax1 - ax0) });
  });
  // ---- blocked: the courier's change stops at the shut doorway (stays, faint, into the exit) ----
  const backX0 = CX1 - 78, backX1 = PX + 80, doorEdge = DW.x + DW.w + 8;
  K.layer(1 - 0.65 * K.io(t, tDot, 0.8, 'io'), () => {
    M.blocked(backX0, LANE, backX1, LANE, K.seg(t, tChanges + 0.35, tBack + 0.3), { stop: (backX0 - doorEdge) / (backX0 - backX1) });
  });

  // ---- 01.03's you-are-here dot: on the parent's flap, then a copy travels to the courier's flap ----
  const R = 13;
  const flap = (sat) => ({ x: sat.sx, y: sat.sy - sat.ss * 0.34 + sat.ss * 0.68 * 0.52 * 0.5 });
  const dotA = K.io(t, tHere - 0.1, 0.5, 'io');
  if (dotA > 0) {
    const pf = flap(par), cf = flap(ch);
    M.dot(pf.x, pf.y, { k: dotA, r: R });
    const fk = K.seg(t, tTravels, tTravels + 1.0), fe = K.ease.io(fk);
    if (fk > 0 && fk < 1) {
      const qx = (pf.x + cf.x) / 2, qy = Math.min(pf.y, cf.y) - 480;
      const bx = (1 - fe) * (1 - fe) * pf.x + 2 * (1 - fe) * fe * qx + fe * fe * cf.x;
      const by = (1 - fe) * (1 - fe) * pf.y + 2 * (1 - fe) * fe * qy + fe * fe * cf.y;
      K.arrow(pf.x, pf.y, bx, by, { cx: qx, cy: qy, k: 1, color: K.rgba(C.head, 0.55 * (1 - fe * 0.6)), dash: [6, 8], w: 3, head: false });
      M.dot(bx, by, { k: 1, r: R });
    } else if (fk >= 1) {
      const tail = 1 - K.io(t, tTravels + 1.0, 0.8, 'io');
      if (tail > 0) {
        const qx = (pf.x + cf.x) / 2, qy = Math.min(pf.y, cf.y) - 480;
        K.arrow(pf.x, pf.y, cf.x, cf.y, { cx: qx, cy: qy, k: 1, color: K.rgba(C.head, 0.22 * tail), dash: [6, 8], w: 3, head: false });
      }
      M.dot(cf.x, cf.y, { k: 1, r: R });
    }
    M.label('01.03 · same rule, a copy', CX1, 790, { color: C.head, size: 28, alpha: K.io(t, tAgo - 0.2, 0.5, 'io') });
  }
});
