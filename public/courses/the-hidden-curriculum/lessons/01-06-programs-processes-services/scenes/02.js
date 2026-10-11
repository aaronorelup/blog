/* 01.06 · 02 Where it lives. The course map; the pin drops on module 01; the 01.05 satchel comes back and the
   first cooks walk in carrying it.
   Beats (local seconds, cues.json; section 18.07 s):
     - [[map]] 0            the map assembles; "Machine" ~2.3 The Machine eases into focus (others dim, gold outline);
                            "what's" ~4.05 a gold underline draws under the district's question.
     - [[pin]] ~5.9         the terracotta pin drops on row 01 (the scene's one 'back'); the other districts, Start and Finish fade first, then the camera eases in (z 1.35)
                            with The Machine on the left half of the frame.
     - [[satchel-callback]] ~8.3
                            the rest of the map recedes; the closed 01.05 satchel slides out of the pinned row to the
                            right half. "copy" ~12.2: it opens, three cards lift (HOME, PATH, KEY); label
                            "a copy of the parent's settings". "Now" ~14.4: it closes; four cooks walk in from the
                            right, each with a satchel on the hip (the big satchel shrinks onto the first cook's hip).
                            "count" ~16.5: pill "how many right now?" under them.
   Last frame: The Machine (pinned) on the left, four cooks idling on the right, the question pill. */
SCENE('02', (t, S) => {
  const C = K.C;
  K.bg();

  const tMap = S.cue('map', 0);
  const tFocus = S.find('Machine', 0, 2.33);
  const tQ = S.find("what's", 0, 4.05);
  const tPin = S.cue('pin', 5.91);
  const tSat = S.cue('satchel-callback', 8.28);
  const tCopy = S.find('copy', 0, 12.22);
  const tNow = S.find('Now', 0, 14.4);
  const tCount = S.find('count', 0, 16.53);

  const md = K.map.district('machine');
  // camera: The Machine sits on the left half (its left edge at screen x ~180), z 1.4
  const Z = 1.35, CX = md.x + (960 - 180) / Z, CY = md.y + md.h / 2;
  const cam = K.cam(t, [{ at: 0, x: 960, y: 540, z: 1 }, { at: tPin + 0.45, x: CX, y: CY, z: Z, d: 1.3 }]);

  const focusK = K.io(t, tFocus - 0.2, 0.8, 'io');
  // the outer ring (other districts, Start, Finish) clears as the pin lands, BEFORE the push, so nothing is half-cropped
  const clearRing = K.io(t, tPin + 0.05, 0.6, 'io');
  const recede = K.io(t, tSat - 0.1, 0.9, 'io');
  K.withCam(cam, () => {
    K.map.draw(t, {
      t0: tMap,
      focus: 'machine',
      focusK,
      dim: 0.75,
      highlight: { machine: focusK },
      pin: '01',
      pinK: K.io(t, tPin, 0.25, 'io'),
      pinDrop: K.io(t, tPin, 0.7, 'back'),
      pinGlowK: K.io(t, tPin + 0.5, 0.6, 'io'),
      lanterns: 0.6,
      districtK: (id) => (id === 'machine' ? 1 : id === 'ai' ? 1 - recede : 1 - clearRing),
    });
    // "what's on your computer": a gold underline under the district's question on the map itself
    const qk = K.io(t, tQ, 0.7, 'io');
    if (qk > 0) K.mark(md.x + 36, md.y + K.map.ROW.q + 8, K.measure(md.q, { font: 'ui', size: K.map.TYPE.q }) + 8, qk, { alpha: 0.85, w: 3 });
  });

  // screen position of a world point under the camera's current state
  const pc = K.map.chipPos('01');
  const toScreen = (wx, wy) => ({ x: 960 + (wx - cam.x) * cam.z, y: 540 + (wy - cam.y) * cam.z });
  const rowEnd = toScreen(pc.x + pc.w, pc.y);

  // ---- the four cooks (programs carrying satchels), standing on the map's path (tile bottoms at y 540) ----
  const CS = 120, COOKY = 540 - CS / 2, XS = [1060, 1250, 1440, 1630];
  // the big satchel shrinks onto cook 0's hip first; then the cooks step in from the left, one by one
  const tHand = tNow - 0.15, hand = K.io(t, tHand, 0.7, 'io');
  const cooks = XS.map((x, i) => {
    const a = tHand + 0.35 + i * 0.3, d = 0.7;
    const k = K.io(t, a, d, 'io');
    return { x: K.lerp(x - 110, x, k), k, walking: k > 0 && k < 1 ? 1 : 0, a, d };
  });

  // ---- the satchel: slides out of the pinned row, opens on "copy", closes, then lands on the first cook's hip ----
  const SAT = { x: 1360, y: 450, s: 280 };
  const inK = K.io(t, tSat + 0.15, 0.9, 'io');
  const openK = K.io(t, tCopy - 0.1, 0.6, 'io') * (1 - K.io(t, tNow - 0.6, 0.45, 'io'));
  const lift = K.io(t, tCopy + 0.2, 0.6, 'io') * (1 - K.io(t, tNow - 0.7, 0.35, 'io'));
  const hipX = cooks[0].x + CS * 0.5, hipY = COOKY + CS * 0.32, hipS = CS * 0.5;
  const c0on = K.io(t, cooks[0].a + cooks[0].d * 0.6, 0.3, 'io');
  if (inK > 0.002 && c0on < 0.999) {
    const sx = K.lerp(rowEnd.x - 40, SAT.x, inK), sy = K.lerp(rowEnd.y, SAT.y, inK), ss = K.lerp(90, SAT.s, inK);
    M.satchel(t, K.lerp(sx, hipX, hand), K.lerp(sy, hipY, hand), K.lerp(ss, hipS, hand), {
      open: openK,
      glow: 0.35 * (1 - hand),
      alpha: Math.min(1, inK * 1.6) * (1 - c0on),
      strap: hand > 0.3 ? 'none' : 'handle',
      cards: [
        { name: 'HOME', kind: 'plain', lift },
        { name: 'PATH', kind: 'path', lift },
        { name: 'KEY', kind: 'key', lift },
      ],
    });
  }
  // under the satchel: first where it came from, then what it holds
  const ebA = K.io(t, tSat + 0.7, 0.5, 'io') * (1 - K.io(t, tCopy - 0.3, 0.3, 'io'));
  if (ebA > 0.002) M.eyebrow('from 01.05', SAT.x, SAT.y + 165, { alpha: ebA });
  const lblA = K.io(t, tCopy + 0.05, 0.5, 'io') * (1 - K.io(t, tNow - 0.4, 0.4, 'io'));
  if (lblA > 0.002) M.label("a copy of the parent's settings", SAT.x, SAT.y + 175, { size: 30, color: C.strong, alpha: lblA });

  cooks.forEach((c, i) => {
    if (c.k <= 0) return;
    const hasSat = i === 0 ? c0on : 1;
    M.cook(t, c.x, COOKY, CS, { satchel: hasSat > 0, satchelK: hasSat, walking: c.walking, alpha: Math.min(1, c.k * 2.5) });
  });

  // "count how many are out": the question, under the line of cooks
  const qA = K.io(t, tCount - 0.1, 0.5, 'io');
  if (qA > 0.002) {
    K.pill('how many right now?', (XS[0] + XS[3]) / 2, 680 + (1 - qA) * 12, { size: 30, color: C.head, stroke: K.rgba(C.head, 0.6), alpha: qA });
  }
});
