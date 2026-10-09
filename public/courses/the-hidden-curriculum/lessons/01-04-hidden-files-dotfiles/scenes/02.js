/* 01.04 · 02 Where it lives. The course map fills the safe area; the pin drops on module 01 (The Machine).
   Beats (local seconds, cues.json):
     - [[pin-drop]] 0      The Machine eases into focus (others dim, gold outline), the pin falls onto row 01
                           (the scene's one 'back'), eyebrow "District 1 · The Machine" top right.
       "question" ~3.8     a gold underline draws under the district's question on the map.
       "computer?" ~5.7    row 01 gives one soft gold pulse (this lesson's row).
     - [[addresses]] ~6.9  Shipping (the dimmed card under The Machine) recedes, and a note card fades in just
                           below The Machine, tied to the pin on row 01 by a dashed gold leader:
                           "every file has an address" (cream);
       "leaves" ~12.6      "some are left off the tour" joins it on a second line in gold (the hidden layer).
   Frame 0 is the plain full map (calm handover from the title card); the last frame holds the map, the pin
   glowing on 01, and the two-part line. The door/shop arrives in 03. */
SCENE('02', (t, S) => {
  const C = K.C;
  K.bg();

  const pd = S.cue('pin-drop', 0);
  const ad = S.cue('addresses', 6.94);
  const tQ = S.find('question', 0, 3.84);
  const tComp = S.find('computer', 0, 5.72);
  const tLeaves = S.find('leaves', 0, 12.57);

  // the district eases into focus; the pin lands with the scene's single overshoot
  const focusK = K.io(t, pd + 0.2, 0.8, 'io');
  K.map.draw(t, {
    focus: 'machine',
    focusK,
    dim: 0.75,
    highlight: { machine: focusK },
    pin: '01',
    pinK: K.io(t, pd + 0.6, 0.25, 'io'),
    pinDrop: K.io(t, pd + 0.6, 0.7, 'back'),
    pinGlowK: K.io(t, pd + 1.1, 0.6, 'io'),
    lanterns: 0.6,
    // [[addresses]]: Shipping (already dimmed) fades out so the note can sit directly under The Machine
    districtK: (id) => (id === 'shipping' ? 1 - K.io(t, ad, 0.6, 'io') : 1),
  });

  // eyebrow, top right, clear of the lantern string's labels
  K.eyebrow('District 1 · The Machine', 1670, 240, { align: 'right', size: 26, alpha: K.io(t, pd + 0.3, 0.5, 'io') });

  const g = K.ctx();

  // the district's question, on "question": a gold underline under it on the map itself
  const md = K.map.district('machine');
  const qk = K.io(t, tQ, 0.6, 'io');
  if (qk > 0) K.mark(md.x + 36, md.y + K.map.ROW.q + 8, K.measure(md.q, { font: 'ui', size: K.map.TYPE.q }) + 8, qk, { alpha: 0.85, w: 3 });

  // on "computer?": one soft gold pulse round row 01 (this lesson's row)
  const pu = K.clamp((t - tComp) / 1.1);
  if (pu > 0 && pu < 1) {
    const a = Math.sin(Math.PI * pu);
    const ry = md.y + K.map.ROW.first;
    g.save();
    K.rr(md.x + 22, ry - 28, md.w - 44, 38, 19);
    g.strokeStyle = K.rgba(C.head, 0.75 * a); g.lineWidth = 2.5;
    g.shadowColor = K.rgba(C.head, 0.6 * a); g.shadowBlur = 18 * a;
    g.stroke();
    g.restore();
  }

  // [[addresses]]: a note card directly under The Machine (over the receded Shipping card), with a dashed gold
  // leader up to the pin on row 01, so it reads as this lesson's idea, not another district's.
  // Line 1 "every file has an address" (cream); on "leaves", line 2 "some are left off the tour" joins in gold.
  const aA = K.io(t, ad + 0.25, 0.45, 'io');
  if (aA > 0.002) {
    const to = { font: 'ui', size: 30, weight: 600 };
    const p1 = 'every file has an address', p2 = 'some are left off the tour';
    const gk = K.io(t, tLeaves - 0.1, 0.6, 'io');
    const cw = Math.max(K.measure(p1, to), K.measure(p2, to)) + 64;
    const cx = md.x + md.w / 2, top = md.y + md.h + 46;   // under the Machine card, over Shipping's faded title
    const ch = 64 + 46 * gk;                              // the card grows a second line as the gold half arrives
    // leader: from just under the pin's row (x of the pin) straight down to the card's top edge
    const lx = md.x + md.w - 54, ly0 = md.y + K.map.ROW.first + 16;
    const lk = K.io(t, ad + 0.25, 0.6, 'io');
    g.save();
    g.strokeStyle = K.rgba(C.head, 0.7 * aA); g.lineWidth = 2.5; g.setLineDash([3, 9]); g.lineCap = 'round';
    g.beginPath(); g.moveTo(lx, ly0); g.lineTo(lx, K.lerp(ly0, top, lk)); g.stroke();
    g.setLineDash([]); g.fillStyle = K.rgba(C.head, 0.85 * aA);
    g.beginPath(); g.arc(lx, ly0, 4, 0, Math.PI * 2); g.fill();
    g.restore();
    K.card(cx - cw / 2, top, cw, ch, { r: 22, fill: C.tile, stroke: C.line2, alpha: aA, shadow: true });
    K.text(p1, cx, top + 42, { ...to, align: 'center', color: C.strong, alpha: aA });
    if (gk > 0.002) {
      g.save();
      K.rr(cx - cw / 2, top, cw, ch, 22); g.clip();
      K.text(p2, cx, top + 88 + (1 - gk) * 10, { ...to, align: 'center', color: C.head, alpha: aA * gk });
      g.restore();
    }
  }
});
