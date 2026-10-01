/* 00.01 · scene 04 — It isn't just you
   MIT's Missing Semester shows the gap is real and shared; the work story adds the fourth loose question.
   Persistent objects (all through window.M):
     - the three question tags glide from 03's gap column back to tray slots 1-3 at full size
     - tag 4 `service account` lifts off the service-account card and glides to tray slot 4; all four pulse once
   The browser page "loads" as it is read: faint skeleton bars stand where each line will be and resolve into
   text on its word, under a slow 1 → 1.04 push-in. The lantern stays out of this scene: AI-as-lantern is
   introduced in 05, so "Agentic Coding" is just a gold pill after a plain "·".
   Work layout leaves a 140 px gutter before the tray (service card ends at x 1220, tray starts at 1360).
   Exit: the two work cards dimmed to 0.6 with the arrow between them, four tags at rest in the tray (glow 0.25). */
SCENE('04', (t, S) => {
  const C = K.C, L = M.layout, G = () => K.ctx();
  K.bg();

  // ------------------------------------------------------------------ beats (local seconds)
  const tMit = S.cue('mit', 0.46);
  const tMissing = S.find('Missing', 0, 3.33);          // "The Missing Semester"
  const tOf = S.find('of', 0, 4.48);                    // "of Your C S Education"
  const tFront = S.find('front', 0, 7.73);              // "Its front page says..."
  const tTool = S.find('tool', 0, 8.95);                // "...tool skills are"
  const tRarely = S.cue('rarely', 10.29);
  const tLeft = S.find('left', 0, 12.39);               // "left to students to figure out"
  const tJan = S.find('January', 0, 15.72);
  const tAgentic = S.cue('agentic', 19.56);
  const tSemester = S.find('missing', 1, 23.42);        // "need a missing semester"
  const tAllowed = S.find('allowed', 0, 25.31);
  const tMissMap = S.find('missing', 2, 26.09);         // "a missing map"
  const tWork = S.cue('work', 27.4);                    // [[work]] "It follows you to work, too."
  const tWorkW = S.find('work', 0, 28.39);              // the spoken word "work"
  const tAuto = S.find('automations', 0, 30.13);
  const tPersonal = S.find('personal', 0, 32.35);
  const tService = S.cue('service', 35.11);
  const tCred = S.find('credentials', 0, 36.48);
  const tNobody = S.find('Nobody', 0, 38.8);            // "Nobody had taught me that either."

  // tag 4: the card's label fades out (0.12 s), the tag fades in where it was (0.18 s) and holds a beat,
  // then glides to slot 4 (0.7 s) and lands on "either"; then all four tags pulse once
  const t4pop = tNobody, t4go = t4pop + 0.4, t4land = t4go + M.motion.glide;
  const pulse = t < t4land ? 0
    : t < t4land + 0.35 ? 0.5 * K.io(t, t4land, 0.35, 'out')
      : 0.5 - 0.25 * K.io(t, t4land + 0.35, 0.65);
  const endDim = 1 - 0.4 * K.io(t, t4land, 0.6);       // work cards settle to 0.6 as the tray takes focus

  // ------------------------------------------------------------------ 03's gap column dissolves as the tags leave it
  const gapA = 1 - K.io(t, 0.1, 0.6);
  if (gapA > 0) K.layer(gapA, () => {
    K.glow(L.gap.cx, 430, 260, C.accent, 0.14);
    L.gap.edges.forEach((x) => K.line(x, L.gap.top, x, L.gap.bottom, { dash: [6, 10], color: C.line2, w: 2 }));
  });

  // ------------------------------------------------------------------ MIT: the Missing Semester page
  // [[work]] "It follows you to work, too": the page and its line slide 60 px left and fade over 0.6 s
  const outK = K.io(t, tWork, 0.6);
  const dimK = K.io(t, tAllowed, 0.6);                  // browser eases to 0.5 under the reassurance line
  const B = { x: 120, y: 180, w: 1000, h: 470 }, bcx = B.x + B.w / 2, bcy = B.y + B.h / 2;
  // the whole MIT block is drawn 70 px lower than these coordinates (browser 250-720, reassurance line at 830),
  // so the page and its line centre on the safe area's midline instead of leaving y 650-930 empty
  const MY = 70;
  const push = 1 + 0.04 * K.io(t, tOf, Math.max(0.6, tRarely - tOf), 'sine');   // slow push-in while the page is read
  const QX = 206;                                       // quote block text column (the gold rule sits at x 184)
  const pillO = { font: 'ui', size: 28, weight: 600 };
  const dateW = K.measure('January 2026', pillO) + 28 * 1.6, agW = K.measure('Agentic Coding', pillO) + 28 * 1.6;
  const dotX = 180 + dateW + 22, agX = dotX + 22;
  const toolO = { font: 'ui', weight: 600, size: 30, color: C.strong }, toolW = K.measure('tool skills', toolO);
  const qx = QX + toolW + 14;                           // where the first quote starts, after "tool skills"

  // a faint placeholder line that gives way to its text when that text is spoken; the bar is fully gone
  // 0.05 s before the text starts to rise, so a bar never runs through a glyph (it would read as a strikethrough)
  const skel = (x, y, w, h, gone) => {
    const a = K.io(t, tMit + 0.3, 0.5) * (1 - K.io(t, gone - 0.25, 0.2));
    if (a <= 0.002) return;
    K.layer(a, () => { K.rr(x, y, w, h, h / 2); G().fillStyle = K.rgba(C.line2, 0.6); G().fill(); });
  };

  K.layer((1 - outK) * (1 - 0.5 * dimK), () => K.at(-60 * outK, 0, () => K.rise(t, tMit, () => K.at(bcx, bcy + MY, push, 0, () => {
    G().translate(-bcx, -bcy);
    K.win(B.x, B.y, B.w, B.h, { title: 'missing.csail.mit.edu', kind: 'browser' });
    K.layer(K.io(t, tMit + 0.2, 0.5), () => K.eyebrow('MIT', 180, 290));

    // the page skeleton: one bar per line still to be read
    skel(180, 334, 600, 34, tMissing);
    skel(180, 402, 375, 20, tOf);
    skel(QX, 482, toolW, 16, tTool);
    skel(qx, 482, K.measure('“rarely covered” in class', M.type.quote), 16, tRarely);
    skel(QX, 530, K.measure('“left to students to figure out”', M.type.quote), 16, tLeft);
    skel(180, 590, dateW, 28, tJan);
    skel(agX, 590, agW, 28, tAgentic);

    const titleO = { font: 'head', weight: 700, size: 64, tracking: -1 };
    K.rise(t, tMissing, () => K.title('The Missing Semester', 180, 370, { size: 64 }), 16, 0.5);
    K.rise(t, tOf, () => K.text('of Your CS Education', 180, 425, { font: 'head', weight: 500, size: 40, color: C.strong }), 16, 0.5);
    // "If MIT students need a missing semester": a soft gold stroke under the course's name
    const mx = 180 + K.measure('The ', titleO), mw = K.measure('Missing Semester', titleO);
    K.mark(mx, 386, mw, K.io(t, tSemester, 0.7), { alpha: 0.55, w: 5 });

    // "Its front page says": a thin gold quote rule announces the quote block, then it fills on its words
    K.line(184, 466, 184, 560, { color: C.head, w: 3, k: K.io(t, tFront, 0.6), alpha: 0.75 * K.io(t, tFront, 0.2) });
    K.rise(t, tTool, () => K.text('tool skills', QX, 500, toolO), 14, 0.5);
    K.rise(t, tRarely, () => K.text('“rarely covered” in class', qx, 500, { ...M.type.quote }), 14, 0.5);
    K.rise(t, tLeft, () => K.text('“left to students to figure out”', QX, 548, { ...M.type.quote }), 14, 0.5);

    // the schedule line: January 2026 · Agentic Coding
    const jk = K.io(t, tJan, 0.5, 'out'), ak = K.io(t, tAgentic, 0.6, 'out');
    K.layer(jk, () => K.pill('January 2026', 180 + dateW / 2, 604 + (1 - jk) * 14, { size: 28, color: C.body }));
    K.layer(ak, () => K.text('·', dotX, 614, { size: 34, weight: 700, color: C.soft, align: 'center' }));
    K.layer(ak, () => K.pill('Agentic Coding', agX + agW / 2, 604 + (1 - ak) * 14, { size: 28, color: C.head, glow: 0.4 * ak }));
  }))));

  // "You're allowed to need a missing map." with a gold stroke under "missing map."
  K.layer(1 - outK, () => K.at(-60 * outK, 0, () => K.rise(t, tAllowed, () => {
    const o = { font: 'read', italic: true, size: 40, color: C.strong };
    const s = 'You’re allowed to need a missing map.';
    const x0 = bcx - K.measure(s, o) / 2;   // centred under the browser
    K.text(s, x0, 760 + MY, o);
    K.mark(x0 + K.measure('You’re allowed to need a ', o), 776 + MY, K.measure('missing map.', o), K.io(t, tMissMap, 0.7));
  })));

  // ------------------------------------------------------------------ work: personal account → service account
  // "At work" arrives on the spoken word "work" (the page has finished leaving by then, so they never overlap);
  // the automations chip follows on "automations"
  // the work row sits 110 px lower than first built (eyebrow 310 .. credentials 742), centred on the safe area
  const WY = 110;
  const tEyebrow = Math.max(tWorkW, tWork + 0.6);
  K.layer(endDim, () => K.rise(t, tEyebrow, () => K.eyebrow('At work', 120, 200 + WY), 14, 0.5));

  const PC = { x: 120, y: 330 + WY, w: 430, h: 170 }, SC = { x: 820, y: 330 + WY, w: 400, h: 170 };
  const PIX = 72, SIX = 70, cardO = { iconSize: 64, size: 32 };
  const pcx = PC.x + PC.w / 2, scx = SC.x + SC.w / 2, midY = PC.y + PC.h / 2;
  const personalA = 1 - 0.4 * K.io(t, tService + 0.4, 0.6);   // dims once its automations have left
  K.rise(t, tPersonal, () => M.iconCard(PC.x, PC.y, PC.w, PC.h, 'person', 'personal account',
    { ...cardO, iconX: PIX, iconColor: C.body, alpha: personalA }));

  K.arrow(PC.x + PC.w + 24, midY, SC.x - 24, midY, { k: K.io(t, tService, 0.6), color: C.head, alpha: endDim });
  // the card's own gear + label lift off as tag 4. They are gone before the tag appears (no doubled
  // "service account" in two fonts); afterwards the label returns only part-way, so the eye goes to the
  // new tag rather than to the same words twice
  const labelA = 1 - K.io(t, t4pop, 0.12) + 0.6 * K.io(t, t4go + 0.35, 0.5);
  K.rise(t, tService + 0.35, () => {
    K.card(SC.x, SC.y, SC.w, SC.h, { alpha: endDim });
    M.iconCard(SC.x, SC.y, SC.w, SC.h, 'gear', 'service account',
      { ...cardO, iconX: SIX, alpha: endDim * labelA, fill: 'rgba(0,0,0,0)', stroke: false, shadow: false });
  });
  // a noun-level gloss for the beginner (curriculum 09.11: "logins for robots")
  K.layer(endDim, () => K.rise(t, tService + 0.45, () =>
    K.text('a login for a robot', scx, 552 + WY, { font: 'ui', size: 30, color: C.body, align: 'center' }), 14, 0.5));

  // credentials stored properly: a gold lock and its caption, one row under the gloss
  const credO = { ...M.type.caption }, credS = 'credentials stored properly', lockS = 40;
  const rowW = lockS + 14 + K.measure(credS, credO), rx = scx - rowW / 2, ry = 632 + WY;
  K.layer(endDim, () => {
    K.pop(t, tCred, rx + lockS / 2, ry - 13, () => K.icon('lock', rx + lockS / 2, ry - 13, lockS, { color: C.head }));
    K.rise(t, tCred + 0.15, () => K.text(credS, rx + lockS + 14, ry, credO), 12, 0.5);
  });

  // the automations: hang above the personal account, then move across to the service account;
  // they step back to 0.5 when tag 4 is born
  const autoO = { font: 'ui', size: 28, weight: 600 };
  const autoW = Math.round(K.measure('automations', autoO) + 34 + 24 + 64), autoH = 64, autoY = 236 + WY;
  const autoA = Math.min(endDim, 1 - 0.5 * K.io(t, t4pop, 0.4));
  const mk = K.io(t, tService, M.motion.glide);
  const ap = M.arc({ x: pcx - autoW / 2, y: autoY }, { x: scx - autoW / 2, y: autoY }, mk, 60);
  const ac = ap.x + autoW / 2;
  // the hanger lines: under the chip to the personal card until the move, to the service card after it lands
  K.line(pcx, autoY + autoH, pcx, PC.y, { color: C.line2, w: 2, alpha: K.io(t, tPersonal + 0.3, 0.4) * (1 - K.io(t, tService, 0.2)) });
  const hangK = K.io(t, tService + M.motion.glide, 0.3);
  if (hangK > 0) K.line(scx, autoY + autoH, scx, SC.y, { color: C.line2, w: 2, k: hangK, alpha: autoA });
  const lift = Math.sin(Math.PI * mk);
  K.rise(t, tAuto, () => K.at(ac, autoY + autoH / 2, 1 + 0.035 * lift, 0.03 * lift, () => {
    G().translate(-ac, -(autoY + autoH / 2));
    M.iconCard(ap.x, ap.y, autoW, autoH, 'clock', 'automations',
      { iconSize: 34, iconX: 32 + 17, size: 28, iconColor: C.body, r: 18, alpha: autoA, glow: 0.35 * lift });
  }), 18, 0.5);

  // ------------------------------------------------------------------ the tray: three tags come home, a fourth joins
  K.glow(L.tray.glow[0], L.tray.glow[1], L.tray.glow[2], C.head, 0.24 * pulse);
  M.TAGS.slice(0, 3).forEach((tg, i) => {
    const t0 = 0.12 + 0.06 * i, d = M.motion.glide, to = M.traySlot(i);
    // 03 ends with the tags compact in the gap column: `cd` still faintly lit (0.35), `.venv` hollowed to 0.22 ("different holes")
    if (t < t0 + d) M.tagMove(tg.label, t, t0, d, { ...M.gapSlot(i), glow: i === 1 ? 0.35 : 0, alpha: i === 2 ? 0.22 : 1 }, { ...to, compact: 0, alpha: 1 });
    else M.tag(tg.label, to.x, to.y, { glow: pulse });
  });

  // the tag is born compact, inside the card: its "?" stub sits exactly where the gear was, its label where
  // the card's label was; it grows to full size on the way to the tray
  const T4 = M.TAGS[3], slot4 = M.traySlot(3), cb = M.tagBox(1);
  const peel = { x: SC.x + SIX - cb.h / 2, y: midY - cb.h / 2, compact: 1 };
  if (t >= t4pop && t < t4go) {
    const k = K.io(t, t4pop + 0.12, 0.18, 'out');     // starts as the card's label finishes fading
    M.tag(T4.label, peel.x, peel.y, { compact: 1, alpha: k, scale: 0.92 + 0.08 * k });
  } else if (t >= t4go && t < t4land) {
    // the tag is born at the card's mid-height (top y 497), level with the `.venv` tag (y 462-538), and it
    // grows as it flies, so an upward bow, a straight line or a shallow dip all clip .venv's bottom edge; a
    // deep dip instead grazes "a login for a robot" (y 638-670). Two levers together: bow -70 dips under the
    // tray, and compact 1.6 (tag() clamps it to 1) keeps it compact for the first 37% of the glide, so its
    // right edge reaches the tray later and its bottom stays higher. Checked numerically with the swell and
    // tilt: >= 12 px clear of .venv and >= 13 px clear of the gloss; it rises into slot 4 from just below.
    M.tagMove(T4.label, t, t4go, M.motion.glide, { ...peel, compact: 1.6 }, { ...slot4, compact: 0 }, { bow: -70 });
  } else if (t >= t4land) {
    M.tag(T4.label, slot4.x, slot4.y, { glow: pulse });
  }
});
