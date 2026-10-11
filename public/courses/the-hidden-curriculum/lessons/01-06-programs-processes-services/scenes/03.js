/* 01.06 scene 03 — The recipe and the cooks.
   The kitchen is built here: the recipe shelf (programs on disk), one cook (a process) who takes a
   dashed COPY of the node.exe card in hand, gets a ticket (PID), steps down to its own stretch of counter
   (memory) and lays the card there on 'counter', and is
   handed 01.05's satchel at the door by its parent; then ten more cooks work from copies of the same card.
   The counter has 11 stretches here (one per node cook) so the closing crowd lines up. */
SCENE('03', (t, S) => {
  const M = window.M, C = K.C, L = M.L;
  K.bg();
  // warmth stays local: a soft lamp glow over the shelf and the counter, not a re-tint of the indigo base
  K.glow(520, 250, 520, C.head, 0.10 * K.io(t, 0.2, 1.2));
  K.glow(960, 710, 760, C.head, 0.07 * K.io(t, 0.6, 1.2));

  // ---------------------------------------------------------------- cues
  const cShelf = S.cue('shelf', 0);
  const cCook = S.cue('cook', 6.65);
  const cTicket = S.cue('ticket', 10.59);
  const cCounter = S.cue('counter', 15.42);
  const cSatchel = S.cue('satchel', 18.47);
  const cSame = S.cue('same-card', 28.78);
  const w = (word, n, fb) => S.find(word, n, fb);
  const tProgram = w('program', 0, cShelf + 3.7);
  const tCookWord = w('cook', 0, cCook + 1.0);
  const tNow = w('right', 0, cCook + 2.7);
  const tTicketWord = w('ticket', 0, cTicket + 0.46);
  const tMemory = w('memory', 0, cCounter + 2.0);
  const tWhoever = w('whoever', 0, cSatchel + 2.3);
  const tSatchelWord = w('satchel', 0, cSatchel + 0.33);
  const tHanded = w('handed', 0, cSatchel + 0.84);
  const tExplorer = w('File', 0, cSatchel + 4.04);
  const tTerminal = w('terminal', 0, cSatchel + 5.39);
  const tEditor = w('editor', 0, cSatchel + 6.34);
  const tAgent = w('agent', 0, cSatchel + 7.12);
  const tSender = w('sender', 0, cSatchel + 8.55);
  const tParent = w('parent', 0, cSatchel + 9.34);
  const tLaptop = w('laptop', 0, cSame + 3.65);
  const tEleven = w('eleven', 0, cSame + 5.43);
  const tOneRecipe = w('recipe', 1, cSame + 9.36);

  // ---------------------------------------------------------------- geometry
  const G11 = { ...L.counter, n: 11 };
  const HERO = 5;
  const st = (i) => M.stretchAt(i, G11);
  const cookY = L.cookY;
  const door = { x: 112, y: 374, w: 136, h: 150, cx: 180, cy: 456 };
  const SG = { ...L.shelf, y: 176 };   // shelf 16 px lower so its eyebrow clears the safe-area top
  const card0 = M.shelfSlot(0, SG);
  const CW = 136, CH = 92;              // copy of the card lying on a counter stretch
  const cardOn = (i) => ({ x: st(i).cx, y: st(i).cy - 4 });

  // ---------------------------------------------------------------- shelf
  const shelfFadeK = 1;
  const nodeLit = K.io(t, tCookWord - 0.2, 0.5);
  M.shelf(t, {
    k: K.io(t, cShelf + 0.2, 0.8),
    cards: [
      { name: 'node.exe', k: K.stagger(t, cShelf + 1.2, 0, 0.3, 0.6), lit: nodeLit },
      { name: 'python.exe', k: K.stagger(t, cShelf + 1.2, 1, 0.3, 0.6) },
      { name: 'ollama.exe', k: K.stagger(t, cShelf + 1.2, 2, 0.3, 0.6) },
      { name: 'hello.py', icon: 'file', k: K.stagger(t, cShelf + 1.2, 3, 0.3, 0.6) },
    ],
    label: 'programs: instructions on disk',
    labelK: K.io(t, tProgram - 0.1, 0.5),
    alpha: shelfFadeK,
    geo: SG,
  });

  // ---------------------------------------------------------------- counter (memory)
  const sameK = K.io(t, cSame, 0.6);
  const order = [4, 6, 3, 7, 2, 8, 1, 9, 0, 10];
  const arrive = (j) => cSame + 0.3 + j * 0.38;     // start of cook j's walk
  const WALK = 1.1;
  const lit = {};
  lit[HERO] = K.io(t, cCounter, 0.6);
  order.forEach((i, j) => { lit[i] = 0.45 * K.io(t, arrive(j) + WALK + 0.5, 0.5); });
  M.counter(t, { geo: G11, k: K.io(t, cShelf + 0.6, 1.0), lit });

  // memory label on the counter (counter beat), clears for the crowd
  K.layer(K.io(t, tMemory - 0.15, 0.5) * (1 - K.io(t, cSame - 0.6, 0.5)), () => {
    M.eyebrow('memory', st(HERO).cx, G11.y + G11.h + 40, {});
  });

  // ---------------------------------------------------------------- the door (left)
  const doorK = K.io(t, cCook - 0.5, 0.5) * (1 - K.io(t, cSame - 0.5, 0.5));
  if (doorK > 0.002) K.layer(doorK, () => {
    const g = K.ctx();
    K.glow(door.cx, door.cy, 120, C.head, 0.16);
    g.save();
    K.rr(door.x, door.y, door.w, door.h, 14);
    const gr = g.createLinearGradient(0, door.y, 0, door.y + door.h);
    gr.addColorStop(0, K.rgba(C.head, 0.16)); gr.addColorStop(1, K.rgba(C.head, 0.04));
    g.fillStyle = gr; g.fill();
    g.lineWidth = 6; g.strokeStyle = M.P.shelfEdge; g.stroke();
    g.restore();
  });

  // ---------------------------------------------------------------- the hero cook (node, PID 18412)
  const heroIn = K.io(t, cCook, 0.5);
  const walkA = cCook + 0.35, walkD = 1.7;
  const heroX = K.lerp(door.cx, st(HERO).cx, K.io(t, walkA, walkD));
  const heroWalking = Math.min(K.io(t, walkA, 0.3), 1 - K.io(t, walkA + walkD - 0.3, 0.3));
  const heroS = K.lerp(96, 64, K.io(t, cSame, 0.6));
  // on 'counter' the cook steps down to stand right at its stretch; on 'same-card' it settles into the crowd line
  const DOWN_Y = 528, CROWD_Y = 520;
  const downK = K.io(t, cCounter + 0.05, 0.8);
  const heroY = K.lerp(K.lerp(cookY, DOWN_Y, downK), CROWD_Y, K.io(t, cSame, 0.6));
  const heroDescending = Math.min(K.io(t, cCounter + 0.05, 0.25), 1 - K.io(t, cCounter + 0.6, 0.25));
  const satchelArrive = tHanded + 0.9;
  const heroSatK = K.io(t, satchelArrive - 0.1, 0.3);

  // the hero's copy of the card: shelf -> the cook's hand on 'right now', then hand -> its counter stretch on 'counter'
  const heroCard = () => {
    const f = K.io(t, tNow - 0.4, 0.8);
    if (f <= 0) return;
    const hand = { x: heroX - 114, y: heroY + 8 };
    const g2 = K.io(t, cCounter + 0.1, 0.75);
    const dst = cardOn(HERO);
    let x, y, cw, ch, rot;
    if (g2 <= 0) {
      x = K.lerp(card0.x, hand.x, f); y = K.lerp(card0.y, hand.y, f) - Math.sin(f * Math.PI) * 70;
      cw = K.lerp(184, CW, f); ch = K.lerp(124, CH, f); rot = f * -0.05;
    } else {
      x = K.lerp(hand.x, dst.x, g2); y = K.lerp(hand.y, dst.y, g2) - Math.sin(g2 * Math.PI) * 40;
      cw = CW; ch = CH; rot = K.lerp(-0.05, -0.012, g2);
    }
    M.recipe(x, y, { name: 'node.exe', w: cw, h: ch, dashed: f < 0.97, alpha: K.clamp(f * 4), rot });
  };
  const copyFly = (t0, i, alphaK = 1) => {
    const f = K.io(t, t0, 0.8);
    if (f <= 0) return;
    const dst = cardOn(i);
    const x = K.lerp(card0.x, dst.x, f), y = K.lerp(card0.y, dst.y, f) - Math.sin(f * Math.PI) * 90;
    const cw = K.lerp(184, CW, f), ch = K.lerp(124, CH, f);
    const landed = K.io(t, t0 + 0.8, 0.3);
    M.recipe(x, y, { name: 'node.exe', w: cw, h: ch, dashed: landed < 0.5, alpha: alphaK * K.clamp(f * 4), rot: (1 - f) * -0.01 + f * (i % 2 ? 0.015 : -0.012) });
  };

  // ---------------------------------------------------------------- the parent at the door (satchel beat)
  const parentK = K.io(t, cSatchel + 0.1, 0.5) * (1 - K.io(t, cSame - 0.5, 0.5));
  const icons = [
    { at: -Infinity, icon: 'question', label: null },
    { at: tExplorer, icon: 'folder', label: 'File Explorer' },
    { at: tTerminal, icon: 'terminal', label: 'terminal' },
    { at: tEditor, icon: 'code', label: 'editor' },
    { at: tAgent, icon: 'sparkle', label: 'agent', kind: 'agent' },
  ];
  let cur = icons[0];
  icons.forEach((ic) => { if (t >= ic.at) cur = ic; });
  const pulse = cur.at > -Infinity ? K.io(t, cur.at, 0.25) * (1 - K.io(t, cur.at + 0.45, 0.4)) : 0;
  const parentLinkK = K.io(t, tSender - 0.1, 0.9);
  if (parentK > 0.002) {
    M.cook(t, door.cx, door.cy, 80, { kind: cur.kind || 'app', icon: cur.kind === 'agent' ? undefined : cur.icon, lit: Math.max(pulse, 0.6 * K.io(t, tParent - 0.2, 0.5)), alpha: parentK, phase: 0.4 });
    // label under the door, crossfading with each sender
    icons.forEach((ic, k) => {
      if (!ic.label) return;
      const nxt = icons[k + 1];
      const a = K.io(t, ic.at, 0.3) * (nxt ? 1 - K.io(t, nxt.at, 0.25) : 1);
      if (a > 0.002) M.label(ic.label, door.cx, door.y + door.h + 40, { alpha: a * parentK, color: C.strong });
    });
    // "parent" link from the sender to the cook
    M.parentLink(door.cx + 50, door.cy - 20, st(HERO).cx - 58, heroY - 20, { k: parentLinkK, lit: true, bend: -60, alpha: parentK });
  }

  // satchel handed over at the door: flies from the door to the cook's hip
  {
    // the sender holds it at the door from the 'satchel' word, then hands it over on 'handed'
    const f = K.io(t, tHanded, satchelArrive - tHanded);
    const show = K.io(t, tSatchelWord - 0.1, 0.35) * (1 - K.io(t, satchelArrive - 0.1, 0.25));
    if (show > 0.002) {
      const hipX = st(HERO).cx + 48, hipY = heroY + 31;
      const sx = K.lerp(door.cx + 40, hipX, f), sy = K.lerp(door.cy + 34, hipY, f) - Math.sin(f * Math.PI) * 110;
      M.satchel(t, sx, sy, K.lerp(58, 48, f), { strap: 'none', names: false, alpha: show });
    }
  }

  // ---------------------------------------------------------------- the crowd: ten more node cooks
  const PIDS = { 4: 9840, 6: 20144, 3: 3216, 7: 21596, 2: 14052, 8: 23708, 1: 11276, 9: 25012, 0: 6688, 10: 17320 };
  const crowd = [];
  order.forEach((i, j) => {
    const a0 = arrive(j);
    const ak = K.io(t, a0, 0.35);
    if (ak <= 0.002) return;
    const fromX = i < HERO ? 150 : 1770;   // enter inside the safe area, fading in
    const f = K.io(t, a0, WALK);
    const x = K.lerp(fromX, st(i).cx, f);
    const walking = Math.min(K.io(t, a0, 0.25), 1 - K.io(t, a0 + WALK - 0.3, 0.3));
    crowd.push({ i, j, x, ak, walking, a0 });
  });
  crowd.forEach((c) => {
    const r = M.cook(t, c.x, CROWD_Y, 64, { alpha: c.ak, walking: c.walking, satchel: true, satchelK: K.io(t, c.a0 + 0.2, 0.3) });
    const pk = K.io(t, c.a0 + WALK + 0.15, 0.4);
    if (pk > 0) M.ticket(String(PIDS[c.i]), c.x, r.ticketY - (1 - K.ease.out(pk)) * 20, { alpha: pk * c.ak });
  });

  // hero drawn last so it sits on top while it walks
  {
    const r = M.cook(t, heroX, heroY, heroS, { alpha: heroIn, walking: Math.max(heroWalking, heroDescending), satchel: true, satchelK: heroSatK,
      named: K.io(t, tCookWord - 0.1, 0.5) * (1 - K.io(t, cTicket + 1.6, 0.6)) });
    const pk = K.io(t, tTicketWord - 0.1, 0.5);
    if (pk > 0) {
      // under the cook, then beside it while it stands at the counter (its stretch is right below), then under again in the crowd
      const side = downK * (1 - K.io(t, cSame, 0.6));
      const tx = K.lerp(heroX, heroX + heroS / 2 + 111, side);
      const ty = K.lerp(r.ticketY, heroY + 6, side) - (1 - K.ease.out(pk)) * 20;
      const swap = K.io(t, cSame, 0.5);
      M.ticket('PID 18412', tx, ty, { alpha: pk * (1 - swap) });
      M.ticket('18412', tx, ty, { alpha: pk * swap });
    }
  }

  // copies of the card: drawn over the cooks so a card in flight never slides behind a tile
  heroCard();
  crowd.forEach((c) => copyFly(c.a0 + WALK - 0.25, c.i));

  // ---------------------------------------------------------------- the legend on the right (solo beats)
  const LX = 1120;
  const rows = [
    { at: K.io(t, tCookWord - 0.1, 0.5), key: 'process', rest: 'one running copy' },
    { at: K.io(t, tTicketWord - 0.1, 0.5), key: 'PID', rest: 'its ticket number' },
    { at: K.io(t, tMemory - 0.1, 0.5), key: 'memory', rest: 'its own counter stretch' },
    { at: K.io(t, tHanded - 0.1, 0.5), key: 'satchel', rest: "copy of the sender's settings (env)" },
    { at: K.io(t, tParent - 0.1, 0.5), key: 'parent', rest: 'who sent it in' },
  ];
  const legendOut = 1 - K.io(t, cSame - 0.6, 0.5);
  rows.forEach((rw, i) => {
    if (rw.at <= 0.002) return;
    const newer = rows[i + 1] ? rows[i + 1].at : 0;
    const a = rw.at * legendOut * (1 - 0.4 * newer);
    const y = 214 + i * 64 + (1 - rw.at) * 14;
    K.spans([
      { s: rw.key, color: C.head, font: rw.key === 'PID' ? 'mono' : 'ui', weight: 700 },
      { s: '  =  ', color: C.soft },
      { s: rw.rest, color: C.strong },
    ], LX, y, { size: 30, font: 'ui', alpha: a, align: 'left' });
  });

  // ---------------------------------------------------------------- the count (same-card beat)
  const RX = 1390;
  K.layer(K.io(t, tEleven - 0.1, 0.5), () => {
    K.pill('11 × node.exe', RX, 214, { size: 30, font: 'mono', weight: 700, color: C.head, stroke: C.head, fill: C.panel });
  });
  M.obsTag(RX, 286, { align: 'center', alpha: K.io(t, tLaptop - 0.1, 0.5) });
  M.label('one recipe · eleven processes', RX, 346, { size: 30, color: C.strong, alpha: K.io(t, tOneRecipe - 0.2, 0.5) });
});
