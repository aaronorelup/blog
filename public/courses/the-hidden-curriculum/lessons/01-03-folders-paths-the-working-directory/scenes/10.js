/* 01.03 section 10: "The lantern: agents and the folder they stand in"  (fix pass 2)
   Two maps side by side. Left: the human's map (dimmed to half once the rule starts, lantern unlit).
   Right: the agent's map, lantern lit, with its own dot. The agent's dot carries the relative routes:
   a cd that carries over while inside the project (gold), a cd out that gets pulled back (dashed),
   the sandbox boundary (hedged by platform), a native Windows note on the human's side, a reported-issue
   pill, and a worktree card. One dated timeline runs under both maps (2021, Feb 2025, Apr 2025, now).
   Local cue times come from cues.json via S.cue; word anchors use S.find. */
SCENE('10', (t, S) => {
  K.bg();
  const C = K.C;

  // ---- boxes: the two maps are a little shorter than the single map so the timeline fits below them
  const LB = { x: 80, y: 200, w: 820, h: 600 };   // bottom 800: clears the timeline pills at RULE_Y
  const RB = { x: 1020, y: 200, w: 820, h: 600 };
  const DL = { x: 490, y: 520 }, DR = { x: 1430, y: 520 };
  const PILL_Y = 252;    // time pills, top of each map (clear of the bottom label row and the map's bottom)
  const RULE_Y = 846;    // one dated timeline, between the maps (bottom 820) and the closing line (910)

  // ---- beat times (local seconds)
  const cChange = S.cue('lantern-change', 0);
  const cRule = S.cue('lantern-rule', 30);
  const cSand = S.cue('lantern-sandbox', 48);
  const cRep = S.cue('lantern-reported', 65);
  const cWt = S.cue('lantern-worktree', 73);
  const cClose = S.cue('lantern-close', 83);
  const tLeft = S.find('2021', 0, 1.5);
  const tNow = S.find('Now', 0, 22.8);
  const tFeb = S.find('February', 0, 16.2);
  const tApr = S.find('April', 0, 20.4);
  const tRep = S.find('reported', 0, 35.5);     // "Users have reported that a cd out ..."
  const tPull = S.find('pulled', 0, 40.7);
  const tNative = S.find('Native', 0, cSand + 9.6);

  // ---- maps: the human's dims at the rule, the agent's stays bright
  const grow = K.io(t, 0, 0.8, 'out');
  const dim = 0.5 * K.io(t, cRule, 0.8, 'io');
  const hA = 1 - dim;                                   // human map alpha
  M.card(t, { box: LB, grow, alpha: hA, rootLabel: null, disk: 'the disk', glow: 0.3 });
  M.card(t, { box: RB, grow, alpha: 1, rootLabel: null, disk: 'the disk', glow: 0.5 });

  // ---- lanterns: the human's unlit, the agent's lit
  M.agentLantern(t, LB, { lit: 0, alpha: hA });
  M.agentLantern(t, RB, { lit: 1 });

  // ---- dots and their labels
  M.dot(t, DL.x, DL.y, { alpha: hA, pulse: 0.6, k: K.io(t, 0, 0.6, 'out') });
  M.dotLabel('working directory', DL.x, DL.y + 62, { alpha: hA * K.io(t, 0.3, 0.5) });
  M.dot(t, DR.x, DR.y, { pulse: 0.6, k: K.io(t, 0.2, 0.6, 'out') });
  M.dotLabel('working directory', DR.x, DR.y + 62, { alpha: K.io(t, 0.4, 0.5) });

  // ---- time pills at the top of each map, at the words "2021" and "Now" (both same cream text)
  const pLeft = K.io(t, tLeft, 0.5) * hA;
  if (pLeft > 0.01) M.pill('2021: you typed cd', 700, PILL_Y, { mono: true, size: 26, alpha: pLeft });
  const pRight = K.io(t, tNow, 0.4);
  // the pill starts right of the lantern rule (x 1430) so the gold arrow never crosses it
  const nowW = K.measure('now: agent types cd', { font: 'mono', weight: 600, size: 26 }) + 26 * 1.6;
  const nowX = 1462 + nowW / 2;
  if (pRight > 0.01) M.pill('now: agent types cd', nowX, PILL_Y, { mono: true, size: 26, alpha: pRight, lit: true, glow: 0.4 });

  // ---- lantern-rule: the route from the lantern to the agent's dot, the cd that carries over
  const ruleK = K.io(t, cRule, 0.8, 'io');
  M.route([[1430, 168], [1430, 494]], { k: ruleK, head: true });
  const ruleLabA = K.io(t, cRule + 0.8, 0.6);
  // reported, not documented: the carry-over is a reported behaviour; the docs-read line is on the sandbox card only
  M.label('reported: cd carries over', 1462, 334, { align: 'left', color: C.strong, alpha: ruleLabA });
  M.label('inside the project', 1462, 370, { align: 'left', color: C.strong, alpha: ruleLabA });

  // ---- the cd out of the project: a dashed route to another folder, then a dashed route back
  const outK = K.io(t, tRep, 0.8, 'io');
  const folderA = K.io(t, tRep + 0.2, 0.6, 'out');
  M.dashedRoute([[1452, 512], [1640, 478]], { k: outK });
  M.folder(1700, 472, 84, 'other folder', { alpha: folderA });
  const backK = K.io(t, tPull, 0.8, 'io');
  M.dashedRoute([[1640, 500], [1466, 524]], { k: backK, head: true, color: C.body });
  const pullA = K.io(t, tPull, 0.6);
  M.label('reported: pulled back', 1462, 646, { align: 'left', color: C.body, alpha: pullA });
  M.label('to project', 1462, 682, { align: 'left', color: C.body, alpha: pullA });

  // ---- lantern-sandbox: the dashed boundary of the agent's sandbox, hedged by platform
  const sandA = K.io(t, cSand, 0.6);
  if (sandA > 0.01) {
    K.layer(sandA, () => {
      const g = K.ctx();
      g.save();
      g.setLineDash([12, 10]);
      g.lineWidth = 2.5;
      g.strokeStyle = C.line2;
      K.rr(RB.x + 16, RB.y + 16, RB.w - 32, RB.h - 32, 22);
      g.stroke();
      g.restore();
    });
    M.label('sandbox (macOS, Linux, WSL2, per current docs)', RB.x + 44, 762, { align: 'left', color: C.body, alpha: sandA });
  }

  // ---- native Windows: the human's side, no sandbox here, the folder rule is the one that matters
  const winA = K.io(t, tNative, 0.6);
  if (winA > 0.01) {
    M.label('native Windows: no sandbox, per current docs', 490, 748, { color: C.strong, alpha: winA });
  }

  // ---- the one dated timeline under both maps: 2021, Feb 2025, Apr 2025, now
  const lineA = K.io(t, cChange, 0.8);
  K.line(120, RULE_Y, 1800, RULE_Y, { k: lineA, color: C.line2, w: 2, alpha: 1 });
  const d2021 = K.io(t, tLeft, 0.5);
  if (d2021 > 0.01) M.pill('2021', 300, RULE_Y, { alpha: d2021 });
  const dFeb = K.io(t, tFeb, 0.5);
  if (dFeb > 0.01) M.pill('Feb 2025: Claude Code research preview', 790, RULE_Y, { alpha: dFeb });   // wording as in the script and research-change.md
  const dApr = K.io(t, tApr, 0.5);
  if (dApr > 0.01) M.pill('Apr 2025: Codex CLI', 1290, RULE_Y, { alpha: dApr });
  const dNow = K.io(t, tNow, 0.5);
  if (dNow > 0.01) M.pill('now', 1700, RULE_Y, { alpha: dNow, lit: true });

  // ---- lantern-reported: the reported issue, with a warning, marked as not a rule
  const repA = K.io(t, cRep, 0.5);
  if (repA > 0.01) {
    M.icon('warning', 1046, 462, 34, { color: M.P.miss, alpha: repA });
    M.pill('reported, not a rule', 1252, 462, { alpha: repA });
  }

  // ---- lantern-worktree: a second folder for the same project, on its own branch
  const wtA = K.io(t, cWt, 0.6);
  if (wtA > 0.01) {
    K.layer(wtA, () => {
      K.card(1050, 290, 350, 130, { r: 20, fill: M.P.codeFill, stroke: C.line2, glow: 0, shadow: false });
    });
    M.folder(1104, 356, 60, '', { alpha: wtA });
    M.label('same project,', 1160, 332, { align: 'left', color: K.C.strong, alpha: wtA });
    M.label('own branch', 1160, 370, { align: 'left', color: K.C.strong, alpha: wtA });
  }

  // ---- lantern-close: the closing line, with both maps and dots holding
  const closeA = K.io(t, cClose, 0.6);
  if (closeA > 0.01) {
    M.line30("You still need to know which folder the agent is in, and whether it is the project you think.", 960, 910, { alpha: closeA, color: C.strong });
  }
});
