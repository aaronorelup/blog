/* 00.03 · 04 — One long street of years  (extended rebuild; v1 scene 04 adapted)
   The street of years drawn in full (geom 'full'), drawn as a STREET:
   - "Picture one long street": a cobbled road band (kerbs, one paving stone per year) draws in left to right
     under the street line, decade labels appearing as it passes.
   - "with a year painted on every building": ten blank ghost houses rise out of the road from "painted", left to right
     (M.houses, shared now, so 05 can fade the very same houses out).
   - Then, cue by cue, the gold walks along the street (litTo, eased a beat ahead of the names) and each house lights
     and gets its year painted on: the shared year tag hangs on its stem onto the house's facade, ON its spoken year.
   - [[far-end]]: the last stretch turns terracotta; the three lanterns (dark paper ghosts since frame 0) warm on
     "the lanterns" and light one by one on their names, each with its stacked terracotta tag and a thin stem down to its year.
   - "More than fifty years of street": a gold bracket spans the old street (0.8 s, from "More");
     "A few years of lanterns": a short terracotta one spans the lanterns (0.5 s, from "A"), held ~1.2 s before the handover.
   Exit (= 05's first frame): the whole street with every lit house, brackets held, lanterns glowing, glow settled at centre. */
SCENE('04', (t, S) => {
  // The ~1991 house sits 22 px lower than the rest of its row (custom row key 'a1w'), so its three-peaked roof
  // clears the MS-DOS house's bottom-right corner by ~16 px. 05 must start from the same geom + items
  // (M.geom('full', {a1w: -68}) and BUILDINGS with web.row = 'a1w') so the crossfade matches.
  const M = window.M, C = K.C, g = K.ctx();
  const gm = M.geom('full', { a1w: -68 });
  const items = M.BUILDINGS.map((b) => (b.key === 'web' ? { ...b, row: 'a1w' } : b));

  // ---- cues (local seconds)
  const cSev = S.cue('seventies', 3.3), cEig = S.cue('eighties', 7.7), cNin = S.cue('nineties', 13.6);
  const cTwo = S.cue('two-thousands', 18.3), cFar = S.cue('far-end', 24.1);
  const tLong = S.find('one', 0, 0.45);                 // "Picture one long street"
  const tPainted = S.find('painted', 0, 1.79);          // "...a year painted on every building"
  // each bracket draws while its own sentence is spoken: "More than fifty years of street." / "A few years of lanterns."
  const tMore = S.find('More', 0, 36.28), tA = S.find(/^A$/, 0, 37.85);
  const tLanterns = S.find('lanterns', 0, 25.76);       // "...the very end of the street, the lanterns."

  // ---- the road draws in on "one long street"
  const draw = K.lerp(M.Y0, M.Y1, K.io(t, tLong, 1.8, 'io'));
  const xd = M.X(draw, gm);

  // ---- the gold walks the street, one decade-run per cue, a beat ahead of the names it reaches
  const LEAD = 0.3;
  const runs = [[cSev, 1976], [cEig, 1986], [cNin, 1999], [cTwo, 2018], [cFar, 2026]];
  let lit = M.Y0;
  runs.forEach(([at, to]) => { lit = K.lerp(lit, to, K.io(t, at - LEAD, M.motion.draw, 'io')); });

  // ---- each house gets its year on its spoken year (or its name, when the name is said first)
  const hangAt = [
    S.find('1969', 0, 3.3),        // unix
    S.find('1973', 0, 5.68),       // ethernet
    S.find('1981', 0, 7.7),        // ms-dos
    S.find('1983', 0, 10.94),      // dns
    S.find('web', 0, 13.93),       // ~1991 web · Python · Linux
    S.find('JavaScript', 0, 16.77),// js
    S.find('Git', 0, 18.32),       // git ("Git," comes before "GitHub,")
    S.find('GitHub', 0, 19.91),    // github
    S.find('Docker', 0, 21.13),    // docker
    S.find(/^V/, 0, 22.49),        // vs code ("V S Code"; shown as "VS")
  ];
  const show = (i) => K.io(t, hangAt[i], M.motion.hang, 'out');
  // the house being named warms briefly, then rests
  const itemLit = (i) => 0.75 * K.io(t, hangAt[i] + 0.2, 0.4) * (1 - K.io(t, hangAt[i] + 2.2, 0.8));
  // blank ghost houses rise out of the road from "painted", left to right, all standing by "building"
  const rise = (i) => K.io(t, tPainted + 0.055 * i, 0.45, 'out');
  const named = (i) => K.io(t, hangAt[i], 0.4, 'io');      // ghost → lit house

  // ---- the lanterns: ghosts from frame 0; a faint warmth on "the lanterns"; each lights on its name
  const lightAt = [
    S.find('GitHub', 1, 26.61),    // "GitHub Copilot" (the name starts)
    S.find('ChatGPT', 0, 28.39),
    S.find(/^M$/, 1, 30.99),       // "M C P" (the first M is "M S DOS")
  ];
  const warm = 0.18 * K.io(t, tLanterns, 0.8);
  const lanterns = (i) => Math.max(warm, K.io(t, lightAt[i], M.motion.light, 'io'));
  const lanternTags = (i) => K.io(t, lightAt[i] + 0.1, M.motion.hang, 'out');
  const stretch = K.io(t, cFar - LEAD, M.motion.draw, 'io');

  // ---- ground: the lamp glow follows the newest lit year, then settles at centre on "More than fifty"
  const glowX = K.lerp(M.X(Math.max(lit, 1969), gm), 960, K.io(t, tMore, 1.2, 'io'));
  K.bg({ glow: 0.14, glowX, glowY: 560 });

  // ================================================================ the road (under the street line)
  const RH = M.HOUSE.RH, roadT = gm.y - RH, roadB = gm.y + RH;
  if (xd > gm.x0) {
    g.save();
    g.beginPath(); g.rect(gm.x0 - 4, roadT - 2, xd - gm.x0 + 4, RH * 2 + 4); g.clip();
    K.rr(gm.x0 - 2, roadT, (M.X(M.Y1, gm) - gm.x0) + 4, RH * 2, 6);
    g.fillStyle = K.mixColor(C.panel, C.line, 0.75); g.fill();
    // cobbles: one paving stone per year, two courses, the lower course offset half a year
    g.strokeStyle = K.rgba(C.page, 0.75); g.lineWidth = 2;
    g.beginPath();
    for (let y = M.Y0 + 1; y < M.Y1; y++) {
      const xa = M.X(y, gm), xb = M.X(y + 0.5, gm);
      g.moveTo(xa, roadT + 3); g.lineTo(xa, gm.y - 3);
      g.moveTo(xb, gm.y + 3); g.lineTo(xb, roadB - 3);
    }
    g.stroke();
    // kerbs
    g.strokeStyle = C.line2; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(gm.x0, roadT); g.lineTo(M.X(M.Y1, gm), roadT); g.moveTo(gm.x0, roadB); g.lineTo(M.X(M.Y1, gm), roadB); g.stroke();
    g.restore();
  }

  // ---- leader stems: each lantern tag hangs on a thin terracotta stem straight down to its year's node
  //      The stem's top retracts to the bottom of the lowest pill shown so far, so no stem ever shows in the
  //      gaps between the stacked pills (it hangs from the stack, not through it).
  const bottoms = M.LANTERNS.map((_, j) => M.lanternTagRect(gm, j).y1 - 2);
  M.LANTERNS.forEach((L, i) => {
    const k = K.io(t, lightAt[i] + 0.35, 0.6, 'io'); if (k <= 0) return;
    let y0 = bottoms[i];
    for (let j = i + 1; j < M.LANTERNS.length; j++) y0 = K.lerp(y0, Math.max(y0, bottoms[j]), K.ease.io(K.clamp(lanternTags(j) * 1.6)));
    const x = M.X(L.year, gm), y1 = gm.y - gm.node;
    K.line(x, y0, x, K.lerp(y0, y1, k), { color: K.mixColor(C.line2, C.accent, 0.75), w: 1.5 });
  });

  // ================================================================ houses, street, roofs
  M.houses(gm, { pass: 'body', rise, named, warm: itemLit, items });

  M.street(t, {
    geom: gm, items, draw, litTo: lit, show, itemLit,
    lanterns, lanternTags, stretch, cord: 1,
    tickLabels: 0,                    // drawn below at 26 px (the shared ones are 22 px)
  });

  M.houses(gm, { pass: 'roofs', rise, named, warm: itemLit, items });

  // ---- decade labels, 26 px, appearing as the street reaches each decade
  for (let d = 1970; d <= 2020; d += 10) {
    const k = K.seg(draw, d - 0.5, d + 1.5); if (k <= 0) continue;
    K.text(String(d), M.X(d, gm), gm.y + 42, { font: 'mono', weight: 500, size: 26, color: C.soft, align: 'center', alpha: 0.85 * k });
  }

  // ---- "More than fifty years of street. A few years of lanterns."
  const by = M.layout.s04.bracketY;
  M.bracket(gm, 1969, 2020, { k: K.io(t, tMore, 0.8, 'io'), color: C.head, y: by, label: '50+ years of street' });
  M.bracket(gm, 2021, 2026, { k: K.io(t, tA, 0.5, 'io'), color: C.accent, y: by, label: 'a few years of lanterns', align: 'right' });
});
