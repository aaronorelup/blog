/* 00.01 · scene 05 — Where it lives
   The course map is the shelf. The four loose questions wait in one stacked chip in the corner,
   then each one flies to its row of the map and is filed there (gold wash + check + a small label chip).
   Persistent objects (all through window.M / K.map):
     - the four tags leave 04's tray and pile into the stack chip as the map reveals
     - the full course map (K.map.draw), its lanterns (AI) and its gate
     - the gate pin (M.pin, the scene's one 'back'), the filing move (M.shelve)
   Beats:
     - [[map]]      six districts reveal; the lantern string is only a faint bare cord (no glow, no labels).
                    On "six" a count (1-6 on the cards) makes the districts countable. The Lanterns are not a
                    district (map restructured 2026-10-01), so the cord gets no number.
     - roll call    each district lights as it is named.
     - [[lanterns]] the six lanterns (one over each district) light left to right, the Lanterns' label row fades in.
     - "lights"     a warm pool falls onto the top edge of every card (top row first).
     - "walk"       a small terracotta walker (you) stands at the Gate and footprints step out toward The Machine,
                    stop short of it and fade to 0.4: the lanterns light the streets, the walking is yours.
     - [[gate]]     a big pin drops on the gate, onto the first footprint, with "you are here"; it settles to
                    map size as the tags go, and the trail leaves with the label.
     - [[shelve]]   the map veils; each tag rises out of the stack on its own name and waits in the clear
                    corner; on "live(s) in" its district lights FIRST, then it flies (under a second) and lands
                    as the district is named. A label chip stays on the row (Trust's hangs in its header);
                    .venv's landing shows "05.03 Virtual environments" so 05 Packages reads as the right shelf.
   Focus: map.js's own `focus` can only snap between districts, so the map is drawn unfocused and each
   district is dimmed with a page-coloured veil over its opaque footprint (same result inside the card,
   and it lets the light cross-fade from district to district).
   Exit: the full map, no focus, the pin bobbing on the start, rows 01 02 05 14 shelved, stack empty. */
SCENE('05', (t, S) => {
  const C = K.C, L = M.layout, G = () => K.ctx(), MAP = K.map;

  // ------------------------------------------------------------------ beats (local seconds)
  const tMap = S.cue('map', 1.74);
  const tSix = S.find('six', 0, 2.33);                 // "a map with six districts"
  const tQuestion = S.find('question', 0, 4.81);       // "...each answering one question."
  const tMachine = S.find('Machine', 0, 6.28);
  const tCode = S.find('Code', 0, 9.24);
  const tHistory = S.find('History', 0, 11.97);
  const tNetwork = S.find('Network', 0, 15.33);
  const tTrust = S.find('Trust', 0, 17.82);
  const tShipping = S.find('Shipping', 0, 20.27);
  const tStrung = S.find('strung', 0, 22.77);          // "And strung over all of them"
  const tLanterns = S.cue('lanterns', 25.04);
  const tLights = S.find('lights', 0, 27.68);          // "It lights every district"
  const tWalk = S.find('walk', 0, 29.71);              // "...doesn't walk the streets for you"
  const tGate = S.cue('gate', 33.07);
  const tLoose = S.find('loose', 0, 34.25);            // "those loose questions?"
  const tShelve = S.cue('shelve', 36.07);              // "Dot P Y and C D..."
  const tCD = S.find('and', 3, 37.23) + 0.2;           // "...and C D" (letters can't be found: hang it on "and")
  const tLive1 = S.find('live', 0, 38.07);             // "live in The Machine"
  const tMachine2 = S.find('Machine', 1, 38.69);
  const tVenv = S.find('Dot', 1, 39.9);                // "Dot V E N V"
  const tLive2 = S.find('live', 1, 42.04);             // "lives in The Code"
  const tCode2 = S.find('Code', 1, 42.88);
  const tService = S.find('Service', 0, 43.91);        // "Service accounts"
  const tLive3 = S.find('live', 2, 44.85);             // "live in Trust"
  const tTrust2 = S.find('Trust', 1, 45.5);

  // the filing schedule, two moves per tag, so every frame shows what is being said:
  //  lift  - on its name, the tag rises out of the stack to a waiting spot in the empty top-right corner of
  //          The Network card (no text there) while the whole map is veiled: it is in the air, on no shelf yet
  //  leave - on "live(s) in", its district lights FIRST (see STEPS), then the tag flies (0.7-1.0 s, so it
  //          never lingers over another district's rows) and lands as the district is named
  // chip: the label that stays on the shelved row ('header': too long for the row, so it hangs in the card's header)
  const SPOT = [{ x: 1500, y: 604 }, { x: 1500, y: 676 }];   // compact tag 340 x 56: x 1500-1840, clear of every label
  const FILE = [
    { lift: tShelve, spot: 0, leave: tLive1 - 0.1, land: tMachine2 + 0.2, district: 'machine', chip: '.py' },
    { lift: tCD, spot: 1, leave: tLive1 + 0.12, land: tMachine2 + 0.45, district: 'machine', chip: 'cd' },
    { lift: tVenv, spot: 1, leave: tLive2 + 0.1, land: tCode2 + 0.1, district: 'code', chip: '.venv' },
    { lift: tService, spot: 1, leave: tLive3 + 0.05, land: tTrust2 + 0.1, district: 'trust', chip: 'service account', header: true },
  ];
  const LIFT_D = 0.55;
  const waitAt = (i) => ({ ...SPOT[FILE[i].spot], compact: 1, scale: 1, glow: 0.45 });
  const tClear = tTrust2 + 0.75;                       // focus clears once the last check has popped

  // ".venv lives in The Code": a callout under the filed row names the lesson it is (05.03)
  // The underlay that hides the rows beneath it leads in and trails out: the rows are gone before the
  // callout is more than faint, and they come back only once it has nearly left, so the two texts never overlap.
  const VENV = (() => {
    // gone (bar its last faint trace) by the time Trust lights for "service accounts live in Trust"
    const kin = K.io(t, tCode2 + 0.3, 0.4, 'out'), kout = K.io(t, tLive3 - 0.4, 0.4);
    return {
      kin, kout,
      k: K.seg(kin, 0.3, 1) * (1 - K.seg(kout, 0, 0.6)),
      mask: K.seg(kin, 0, 0.45) * (1 - K.seg(kout, 0.55, 1)),
    };
  })();

  // the four tags pile into the stack as the map reveals, bottom tag first, so no tag crosses another
  const pileAt = (i) => tMap + 0.15 * (M.TAGS.length - 1 - i);   // glide start
  const arriveAt = (i) => pileAt(i) + M.motion.glide;  // lands on the stack
  // the pile is last-in, first-out: tag i always sits n = 4 - i deep, so it lands on and later lifts off
  // the top of the pile (the top ghost layer, a little above the chip's centre) and never covers the "×n"
  const pileSpot = (i) => {
    const n = M.TAGS.length - i, k = Math.max(0, Math.min(n, 4) - 1), b = M.stackFrom();
    return { ...b, x: b.x + 5 * k, y: b.y - 7 * k - (n > 1 ? 20 : 0) };
  };

  // ------------------------------------------------------------------ focus (cross-fading veils)
  const DIM = 0.45;
  const TOP = { machine: 1, code: 1, history: 1 };
  // [time, focus, d]: a district id, '*' (every district dimmed: the lanterns' turn) or null (all lit)
  const STEPS = [
    [tMachine, 'machine', 0.5], [tCode, 'code', 0.5], [tHistory, 'history', 0.5], [tNetwork, 'network', 0.5],
    [tTrust, 'trust', 0.5], [tShipping, 'shipping', 0.5], [tLanterns, '*', 0.6], [tLights, null, 0.7],
    // shelving: the whole map veils as the first question rises (in the air, on no shelf), then each
    // destination lights just BEFORE its tag takes off and stays lit until the next one does
    [tShelve - 0.1, '*', 0.5],
    [FILE[0].leave - 0.15, 'machine', 0.4], [FILE[2].leave - 0.2, 'code', 0.4], [FILE[3].leave - 0.15, 'trust', 0.4],
    [tClear, null, 0.5],
  ];
  // "it lights every district": the light reaches the top row first, the bottom row a beat later
  const delayOf = (step, id) => (step[0] === tLights && !TOP[id] ? 0.3 : 0);
  function focusOf(id) {
    let any = 0, own = 0;
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i], n = STEPS[i + 1];
      const e = K.io(t, s[0] + delayOf(s, id), s[2]) - (n ? K.io(t, n[0] + delayOf(n, id), n[2]) : 0);
      if (s[1] != null) any += e;
      if (s[1] === id) own += e;
    }
    return { veil: DIM * Math.max(0, any - own), lit: own };
  }
  const F = {};
  MAP.DISTRICTS.forEach((d) => (F[d.id] = focusOf(d.id)));
  const rowAlpha = (id) => 1 - F[id].veil;

  // ------------------------------------------------------------------ the lanterns (AI over every district)
  // map.js's lantern geometry (K.map.lanternAt): one lantern over each district, hanging from a cord that sags
  const LY = MAP.LANTERNS.y, LN = MAP.LANTERNS.n;
  const lanternX = (i) => MAP.lanternAt(i).x;
  const lanternY = (i) => MAP.lanternAt(i).y;
  // the count on "six": badges 1-6 ride the districts' staggered reveal (never ahead of their card);
  // all gone by the end of "question". The cord is not counted: the Lanterns are not a district.
  const revealAt = (i) => tMap + 0.22 * i;             // map.js: item i (0 = lanterns, 1-6 = districts) starts here
  const badgeAt = (i) => Math.max(tSix + 0.12 * i, revealAt(i + 1) + 0.3);
  const badgeOut = K.io(t, tQuestion + 0.2, 0.5);
  // until [[lanterns]] the cord is a bare 0.2-alpha ghost; it warms slightly on "strung over all of them",
  // then on the cue the lanterns light left to right
  const hint = 0.15 * K.io(t, tStrung, 0.7);
  const litK = (i) => Math.max(hint, K.io(t, tLanterns + 0.09 * i, 0.35));
  const labelsK = K.io(t, tLanterns + 0.35, 0.6, 'out');
  // the lanterns' turn: their glow brightens on top of map.js's, then settles after "walk the streets"
  const aiK = K.io(t, tLanterns, 0.6) * (1 - K.io(t, tWalk + 1.5, 0.8));
  // "it lights every district": a warm pool on each card's top edge, top row first
  const poolK = (id) => K.io(t, tLights + (TOP[id] ? 0 : 0.3), 0.7) * (1 - K.io(t, tWalk + 1.5, 0.8));

  // ------------------------------------------------------------------ the gate pin
  // drops in big with the scene's one overshoot ('back' first reaches the rest point at ~42 %), with a
  // "you are here" label; as the tags take over it settles to map size, and then map.js's own pin
  // (same glyph, same tip, same bob, 05's clock) takes over: exactly what 06 opens on.
  const GATE = MAP.GATE;
  const PIN_BIG = 72, PIN_MAP = 44;
  const pinK = K.io(t, tGate, 0.6, 'back');
  const touch = tGate + 0.25;
  const settleK = K.io(t, tShelve - 0.35, 0.5);
  const tHand = tShelve + 0.16;                        // settle finished: hand over to map.js's pin
  const pinTip = { x: GATE.x + 58, y: GATE.y - 40 + 0.38 * PIN_MAP };
  const hereK = K.io(t, tGate + 0.3, 0.45, 'out') * (1 - K.io(t, tShelve - 0.4, 0.4));

  // ------------------------------------------------------------------ "it doesn't walk the streets for you"
  // a short trail of terracotta footprints steps out of the Gate along the garden path toward The Machine,
  // then stops short of the card and fades to 0.4: the walking is yours. The first print sits right under
  // the gate pin's tip (map.js's pin spot, so 06 opens on the same pin), and at [[gate]] the pin drops onto
  // it: the walker becomes "you are here". The trail leaves with the "you are here" label as the tags go.
  // A quadratic from under the pin, down onto the dotted path (y 408), to just short of the card's edge.
  const TRAIL = (() => {
    const p0 = [pinTip.x + 4, pinTip.y + 7], p1 = [214, GATE.y + 1], p2 = [MAP.district('machine').x - 14, GATE.y + 1];
    const at = (u) => [0, 1].map((j) => (1 - u) * (1 - u) * p0[j] + 2 * u * (1 - u) * p1[j] + u * u * p2[j]);
    const dir = (u) => Math.atan2(2 * (1 - u) * (p1[1] - p0[1]) + 2 * u * (p2[1] - p1[1]), 2 * (1 - u) * (p1[0] - p0[0]) + 2 * u * (p2[0] - p1[0]));
    const n = 3;                                       // left, right, left: the gap to the card holds three clear steps
    return Array.from({ length: n }, (_, i) => {
      const u = i / (n - 1), [x, y] = at(u), a = dir(u), side = i % 2 ? 1 : -1;
      // left / right feet sit either side of the line of travel
      return { x: x - Math.sin(a) * 5 * side, y: y + Math.cos(a) * 5 * side, a, side };
    });
  })();
  const stepAt = (i) => tWalk + 0.2 * i;               // three steps in 0.6 s, on "walk the streets"
  const trailRest = 1 - 0.6 * K.io(t, tWalk + 1.05, 0.5);   // the walk stops on "for you" and fades to 0.4
  const trailOut = 1 - K.io(t, tShelve - 0.4, 0.4);
  const pinTouch = K.io(t, touch - 0.05, 0.3);         // the pin's tip lands on the first print: it is you
  /** one footprint at (x, y), heading a (rad), side -1 left / 1 right; k: its press-in 0..1 */
  function footprint(x, y, a, side, k, alpha) {
    if (k <= 0 || alpha <= 0.002) return;
    const g = G();
    K.layer(alpha * Math.min(1, k * 1.5), () => K.at(x, y, 1.25 - 0.25 * k, a + side * 0.12, () => {
      g.fillStyle = C.accent;
      g.beginPath(); g.ellipse(3.3, 0, 5.6, 4.0, 0, 0, 7); g.fill();     // ball of the foot (18 px heel to toe)
      g.beginPath(); g.ellipse(-6.1, 0, 3.3, 3.0, 0, 0, 7); g.fill();    // heel
    }));
  }

  // ------------------------------------------------------------------ small drawing helpers
  const MONO = { font: 'mono', size: 26, weight: 600 };
  /** a filed tag's label: a small ticket-coloured chip, right edge xr, centred on cy */
  function chip(label, xr, cy, a, rise = 0) {
    if (a <= 0.002) return;
    const w = K.measure(label, MONO) + 20, h = 32, g = G();
    K.layer(a, () => {
      g.save(); g.translate(0, rise);
      K.rr(xr - w, cy - h / 2, w, h, 10); g.fillStyle = C.tile; g.fill();
      g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, 0.55); g.stroke();
      K.text(label, xr - w + 10, cy + 9, { ...MONO, color: C.strong });
      g.restore();
    });
  }
  /** the label chip that stays with filed tag i (k: its reveal 0..1) */
  function fileChip(i, k) {
    const f = FILE[i], c = MAP.chipPos(M.TAGS[i].mod), checkX = c.x + c.w - 6;
    if (k <= 0) return;
    if (!f.header) { chip(f.chip, checkX - 26, c.y - 1, k, (1 - k) * 6); return; }
    // too long for the row: it hangs in the district's header, tied to the row's check by a short cord
    const d = c.d, hy = d.y + ((MAP.ROW && MAP.ROW.name) || 70) - 13;
    chip(f.chip, checkX + 14, hy, k, (1 - k) * 6);
    const y1 = hy + 20, y2 = c.y - 18;
    K.line(checkX, y1, checkX, y2, { color: K.rgba(C.head, 0.75), w: 1.5, dash: [2, 5], k: K.io(k, 0.3, 0.7) });
  }
  const chipK = (i) => K.io(t, FILE[i].land + 0.2, 0.35, 'out');
  /** count badge: a small numbered disc */
  function badge(n, x, y, k) {
    if (k <= 0.002) return;
    const g = G();
    K.layer(k, () => K.at(x, y, 0.75 + 0.25 * k, 0, () => {
      g.beginPath(); g.arc(0, 0, 21, 0, Math.PI * 2);
      g.fillStyle = K.mixColor(C.page, C.tile, 0.6); g.fill();
      g.lineWidth = 1.5; g.strokeStyle = K.rgba(C.head, 0.7); g.stroke();
      K.text(String(n), 0, 9, { font: 'mono', size: 26, weight: 700, color: C.head, align: 'center' });
    }));
  }

  // ------------------------------------------------------------------ ground and glows (under the map)
  K.bg();
  K.glow(L.tray.glow[0], L.tray.glow[1], L.tray.glow[2], C.head, 0.06 * (1 - K.io(t, tMap, 0.5)));
  if (aiK > 0) {
    K.glow(960, LY + 10, 760, C.head, 0.07 * aiK);
    for (let i = 0; i < LN; i++) K.glow(lanternX(i), lanternY(i) + 16, 60, C.head, 0.22 * aiK * litK(i));
  }
  K.glow(GATE.x, GATE.y, 110, C.head, 0.25 * K.io(t, touch - 0.1, 0.6));

  // ------------------------------------------------------------------ the map
  K.map.draw(t, {
    t0: tMap, pin: t >= touch ? '00' : undefined, pinK: t >= tHand ? 1 : 0,
    lanterns: litK, lanternLabels: labelsK,
  });

  // the count: 1-6 on the cards (riding each card's rise)
  if (t < tQuestion + 0.8) {
    MAP.DISTRICTS.forEach((d, i) => {
      const rise = (1 - K.stagger(t, tMap, i + 1, 0.22, 0.7)) * 20;
      badge(i + 1, d.x + d.w - 44, d.y + 44 + rise, K.io(t, badgeAt(i), 0.35, 'out') * (1 - badgeOut));
    });
  }

  // filed rows (and their label chips) sit under the veils, so they dim with their district exactly like
  // the rest of the card (drawn over a dimmed card instead, the regular-weight row text ghosts through)
  FILE.forEach((f, i) => {
    if (t < f.land + M.motion.collapse) return;
    M.shelveRow(M.TAGS[i].mod, K.io(t, f.land + 0.05, 0.5, 'out'));
    fileChip(i, chipK(i));
  });
  // the .venv callout sits over the rows under Packages (06 Data, 07 Concurrency). An opaque, card-coloured
  // underlay fades those rows out a beat ahead of the callout and brings them back only once it is mostly
  // gone, so the two texts are never on screen at the same strength. Under the veils, so it dims with the card.
  if (VENV.mask > 0.002) {
    const c = MAP.chipPos('05'), d = c.d, y0 = c.y + 20, g = G();
    K.layer(VENV.mask, () => { K.rr(d.x + 12, y0, d.w - 24, d.y + d.h - 12 - y0, 14); g.fillStyle = K.mixColor(C.page, C.tile, 0.94); g.fill(); });
  }

  // veils dim the unfocused districts; the focused one gets map.js's gold outline and glow
  MAP.DISTRICTS.forEach((d) => {
    const f = F[d.id];
    if (f.veil > 0.002) { K.rr(d.x - 1, d.y - 1, d.w + 2, d.h + 2, 25); G().fillStyle = K.rgba(C.page, f.veil); G().fill(); }
    if (f.lit > 0.002) {
      const g = G(); g.save();
      g.shadowColor = K.rgba(C.head, 0.55 * f.lit); g.shadowBlur = 40;
      g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, f.lit);
      K.rr(d.x, d.y, d.w, d.h, 24); g.stroke(); g.restore();
    }
  });

  // "it lights every district": lantern light drops into a warm pool on each card's top edge, and the
  // top rim catches it (top row first, the bottom row a beat later)
  MAP.DISTRICTS.forEach((d) => {
    const k = poolK(d.id);
    if (k <= 0.002) return;
    const g = G(); g.save();
    K.rr(d.x, d.y, d.w, d.h, 24); g.clip();
    K.glow(d.x + d.w / 2, d.y - 30 - 90 * (1 - k), d.w * 0.62, C.head, 0.16 * k);
    g.restore();
    const rim = g.createLinearGradient(d.x, 0, d.x + d.w, 0);
    rim.addColorStop(0, K.rgba(C.head, 0)); rim.addColorStop(0.5, K.rgba(C.head, 0.65 * k)); rim.addColorStop(1, K.rgba(C.head, 0));
    g.save(); g.beginPath(); g.rect(d.x - 4, d.y - 4, d.w + 8, 30); g.clip();
    K.rr(d.x, d.y, d.w, d.h, 24); g.lineWidth = 2; g.strokeStyle = rim; g.stroke();
    g.restore();
  });

  // ------------------------------------------------------------------ the stack (the loose questions, waiting)
  const ST = L.stack;
  let n = 0;
  M.TAGS.forEach((_, i) => { if (t >= arriveAt(i) && t < FILE[i].lift) n++; });
  const firstIn = Math.min(...M.TAGS.map((_, i) => arriveAt(i)));
  const stackIn = K.io(t, firstIn - 0.1, 0.35, 'out');
  // the last ticket lifts off the chip itself, so the chip fades out under it instead of vanishing
  const lastLeave = FILE[FILE.length - 1].lift, lastOut = K.io(t, lastLeave, 0.35);
  const shown = n > 0 ? n : t >= lastLeave && lastOut < 1 ? 1 : 0;
  if (shown > 0) {
    const cx = ST.x + ST.w / 2, cy = ST.y + ST.h / 2;
    K.layer(stackIn * (n > 0 ? 1 : 1 - lastOut), () => K.at(cx, cy, 0.85 + 0.15 * stackIn, 0, () => {
      G().translate(-cx, -cy);
      M.stack(ST.x, ST.y, shown, { glow: 0.6 * K.io(t, tLoose, 0.5) });
    }));
  }

  // ------------------------------------------------------------------ the footprints (under the pin)
  if (t >= tWalk && trailOut > 0.002) {
    TRAIL.forEach((p, i) => {
      // the first print is the walker: it comes back to full strength as the pin lands on it
      const rest = i === 0 ? Math.max(trailRest, pinTouch) : trailRest;
      footprint(p.x, p.y, p.a, p.side, K.io(t, stepAt(i), 0.15, 'out'), rest * trailOut);
    });
  }
  // the walker: you, a small terracotta figure standing on the first print at the gate (the lanterns light the
  // streets; the walking is yours). As the [[gate]] pin drops onto this same spot it fades out: you are here.
  {
    const k = K.io(t, tWalk - 0.1, 0.35, 'out') * (1 - K.io(t, tGate - 0.05, 0.3));
    if (k > 0.002) {
      const s = 40, fx = pinTip.x + 6, feet = pinTip.y + 3;   // shoulders end 0.33 s below the icon centre
      K.icon('person', fx, feet - 0.33 * s + (1 - k) * 6, s, { color: C.accent, w: 3, alpha: k });
    }
  }

  // ------------------------------------------------------------------ the gate pin and "you are here"
  if (pinK > 0 && t < tHand) {
    M.pin(pinTip.x, pinTip.y + K.wave(t, 2.4, 5), K.lerp(PIN_BIG, PIN_MAP, settleK), { color: C.accent, k: pinK });
  }
  if (hereK > 0.002) {
    // 26 px (the label minimum): the column left of the map is only 170 px wide, and 28 px touches The Machine
    K.text('you are here', 84, pinTip.y - 0.7 * PIN_BIG - 20 + (1 - hereK) * 8,
      { font: 'ui', size: 26, weight: 600, color: C.head, alpha: hereK });
  }

  // ------------------------------------------------------------------ .venv: which lesson of 05 it is
  // (the rows it covers were already faded out by VENV's underlay, drawn under the veils above)
  {
    const c = MAP.chipPos('05'), d = c.d, k = VENV.k;
    if (k > 0.002) {
      const num = '05.03', name = 'Virtual environments';
      const nw = K.measure(num, { ...MONO }), tw = K.measure(name, { font: 'ui', size: 26, weight: 600 });
      const w = 18 + nw + 14 + tw + 18, h = 40;
      // rises 8 px in; leaves as one object, sliding 6 px down while it fades
      const x1 = d.x + d.w - 16, x0 = x1 - w, y0 = c.y + 22 + (1 - VENV.kin) * 8 + VENV.kout * 6;
      const px = c.x + c.w - 6 - 26 - (K.measure('.venv', MONO) + 20) / 2;   // under the .venv chip
      const g = G();
      K.layer(k * rowAlpha('code'), () => {
        g.save();
        g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
        K.rr(x0, y0, w, h, 12); g.fillStyle = C.tile; g.fill();
        g.shadowColor = 'transparent';
        g.beginPath(); g.moveTo(px - 9, y0 + 0.5); g.lineTo(px, y0 - 8); g.lineTo(px + 9, y0 + 0.5); g.closePath(); g.fill();
        g.lineWidth = 1.5; g.strokeStyle = K.mixColor(C.line2, C.head, 0.55);
        K.rr(x0, y0, w, h, 12); g.stroke();
        g.restore();
        K.text(num, x0 + 18, y0 + 29, { ...MONO, color: C.head });
        K.text(name, x0 + 18 + nw + 14, y0 + 29, { font: 'ui', size: 26, weight: 600, color: C.strong });
      });
    }
  }

  // ------------------------------------------------------------------ named: a tag rises out of the stack and waits
  // (M.tagMove from its place on the pile to the waiting spot; it hands over to M.shelve, from the same state, at leave)
  FILE.forEach((f, i) => {
    if (t < f.lift || t >= f.leave) return;
    // bow 12: a near-vertical rise bows sideways, and the default 50 would push its right edge past x 1840
    M.tagMove(M.TAGS[i].label, t, f.lift, LIFT_D, pileSpot(i), waitAt(i), { bow: 12 });
  });

  // ------------------------------------------------------------------ filing: tags in flight and collapsing
  // (collapsing ones first; among tags in the air, the one that left first is drawn on top)
  const order = M.TAGS.map((_, i) => i).filter((i) => t >= FILE[i].leave && t < FILE[i].land + M.motion.collapse);
  order.sort((a, b) => {
    const la = t >= FILE[a].land, lb = t >= FILE[b].land;
    return la !== lb ? (la ? -1 : 1) : FILE[b].leave - FILE[a].leave;
  });
  order.forEach((i) => {
    const tg = M.TAGS[i], f = FILE[i];
    M.shelve(tg.label, tg.mod, t, f.leave, f.land, waitAt(i), { alpha: rowAlpha(f.district) });
    if (t >= f.land) K.layer(rowAlpha(f.district), () => fileChip(i, chipK(i)));
  });

  // ------------------------------------------------------------------ 04's tray: the tags pile into the stack
  for (let i = M.TAGS.length - 1; i >= 0; i--) {
    if (t >= arriveAt(i)) continue;
    M.tagMove(M.TAGS[i].label, t, pileAt(i), M.motion.glide, { ...M.traySlot(i), glow: 0.25 }, pileSpot(i));
  }
});
