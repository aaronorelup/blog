/* 01.03 · 08 What is really going on
   Part 1 (child process): the shell's map has a dot; cd moves only that dot. A child process gets a copy of the
   dot (gold arc, "child gets a copy"), changes its own copy, and cannot move its parent (grey return arrow, crossed out).
   Part 2 (python and node): two lookups fed from the calling file's folder. The import list (python) starts with the
   SCRIPT's folder for "python script.py"; with python -m or -c it starts with the shell's current folder (dashed
   cream route, labelled). Node resolves a required file from the calling file's folder (gold route, resolved path).
   -P / PYTHONSAFEPATH is a label (3.11+). The closing pill points forward to 05.02.
   Canvas 1920x1080; safe area x 80-1840, y 130-930. */
SCENE('08', (t, S) => {
  const M = window.M, K = window.K, C = K.C, P = M.P;

  // layout
  const MAIN = { x: 80, y: 200, w: 600, h: 640 };        // the shell's map (centre 380, 520)
  const CHILD = { x: 1100, y: 200, w: 440, h: 640 };     // the child process's map (part 1, fades at "Python")
  const COL = { x: 1080, y: 200, w: 320, h: 640 };       // the calling file's folder (node, then python's script)
  const IMP = { x: 1500, y: 200, w: 340, h: 220 };       // python's import list
  const NODE = { x: 1500, y: 520, w: 340, h: 240 };      // node's require lookup
  const MAIN_DOT = { x: 380, y: 520 }, CD_DOT = { x: 560, y: 380 };
  const CHILD_DOT = { x: 1320, y: 520 }, CHILD_MOVED = { x: 1230, y: 430 };
  const COL_CX = COL.x + COL.w / 2;                      // 1240
  const IMP_CX = IMP.x + IMP.w / 2;                      // 1670
  const NODE_CX = NODE.x + NODE.w / 2;                   // 1670
  const ROW_PY1 = 312, ROW_PY2 = 370;                    // import-list rows
  const ROW_NODE = 620;                                  // node's resolved path row
  const SCRIPT_Y = 520, HELPER_Y = 690;                  // file rows in the column

  // cues and words (local time); fallbacks are the measured values
  const cCd = S.cue('cd-scope', 0);
  const cChild = S.cue('child-process', 8.02);
  const cPy = S.cue('python-second', 22.88);
  const tChanges = S.find('changes', 0, cCd + 3.29);      // "It changes the dot"
  const tOnly = S.find('only', 0, cCd + 6.37);            // "and only that session"
  const tChild = S.find('child', 0, cChild + 0.19);       // "A child process"
  const tMove = S.find('move', 0, cChild + 1.67);         // "cannot move its parent"
  const tChild2 = S.find('changes', 1, cChild + 4.09);    // "If a program changes its own folder"
  const tKeeps = S.find('keeps', 0, cChild + 7.92);       // "keeps its own dot"
  const tList = S.find('second', 0, cPy + 2.1);           // "a second list"
  const tNode = S.find('Node', 0, cPy + 5.6);             // "Node, for example"
  const tResolves = S.find('resolves', 0, cPy + 8.9);     // "resolves a required file"
  const tRequired = S.find('required', 0, cPy + 9.0);     // "required file"
  const tRun = S.find('When', 0, cPy + 13.2);             // "When you run python script.py"
  const tStarts = S.find('starts', 0, cPy + 17.0);        // "the import list starts with that script's folder"
  const tWith = S.find(/^With$/, 0, cPy + 19.0);          // "With dash M or dash C"
  const tDash = S.find('dash', 0, tWith + 0.3);           // "dash M"
  const tP = S.find('3.11', 0, cPy + 24.5);               // "Python 3.11 added dash P"
  const tFile = S.find(/^file$/i, 1, cPy + 37.7);         // "A file path and an import path"
  const t0502 = S.find('05.02', 0, cPy + 35.4);           // "That story belongs to 05.02"

  K.bg();

  // ---------------------------------------------------------------- part 1: the shell's map and its dot
  const kMain = K.io(t, 0, 0.6);
  M.card(t, { box: MAIN, grow: kMain, alpha: kMain, rootLabel: null, disk: null });
  M.label('this session only', MAIN.x + MAIN.w / 2, 262, { alpha: K.env(t, tOnly, Infinity, 0.5) * kMain, color: P.body });

  // cd: a gold route from the dot, labelled "cd"; the dot then moves along it (only this map's dot moves)
  const kCdRoute = K.io(t, tChanges, 1.0);
  M.route([[402, 508], [470, 468], [536, 402]], { k: kCdRoute, head: true });
  M.pill('cd', 440, 350, { mono: true, size: 26, lit: true, alpha: K.env(t, tChanges, tChanges + 2.2, 0.4) });
  const kCdMove = K.io(t, tChanges + 1.0, 0.7);
  const mx = K.lerp(MAIN_DOT.x, CD_DOT.x, kCdMove);
  const my = K.lerp(MAIN_DOT.y, CD_DOT.y, kCdMove);
  M.dot(t, mx, my, { k: K.io(t, 0, 0.5, 'out'), pulse: 0.6 });
  M.label("this window's dot", mx - 40, my + 14, { align: 'right', alpha: K.env(t, tKeeps, Infinity, 0.5) * kMain, color: P.ink });

  // ---------------------------------------------------------------- part 1: the child process (fades out at "Python")
  const kChildIn = K.io(t, cChild, 0.6, 'out');
  const kChildOut = K.io(t, cPy, 0.5);
  const aChild = kChildIn * (1 - kChildOut);
  M.card(t, { box: CHILD, grow: kChildIn, alpha: aChild, rootLabel: null, disk: null });
  M.label('child process', CHILD.x + CHILD.w / 2, 262, { alpha: aChild, color: P.ink });

  // the copy: a gold arc from the shell's dot to the child's card edge, labelled "child gets a copy"
  M.route([[CD_DOT.x, CD_DOT.y], [880, 330], [1100, 300]], { k: K.io(t, cChild + 0.9, 1.0), head: true, alpha: aChild });
  M.label('child gets a copy', 900, 280, { alpha: K.env(t, tChild, Infinity, 0.5) * aChild, color: P.body });

  // the return arrow: child to parent, crossed out ("does not move its parent")
  const kRet = K.io(t, tMove, 0.6);
  M.dashedRoute([[1100, 640], [890, 640], [686, 640]], { k: kRet, head: true, alpha: aChild });
  M.cross(890, 640, 56, K.io(t, tMove + 0.6, 0.4), { alpha: aChild });
  M.label('does not move its parent', 890, 696, { alpha: K.env(t, tMove + 0.4, Infinity, 0.5) * aChild, color: P.body });

  // the child's own dot: pops in with the card, then moves inside its own card when it changes its folder
  const kChildPop = K.io(t, cChild + 0.3, 0.6, 'out');
  const kChildMove = K.io(t, tChild2 + 0.3, 0.8);
  M.dot(t, K.lerp(CHILD_DOT.x, CHILD_MOVED.x, kChildMove), K.lerp(CHILD_DOT.y, CHILD_MOVED.y, kChildMove),
    { k: kChildPop, pulse: 0.6, alpha: aChild });

  // ---------------------------------------------------------------- part 2: python's import list (top right)
  const aImp = K.io(t, tList, 0.6, 'out');
  K.layer(aImp, () => K.card(IMP.x, IMP.y, IMP.w, IMP.h, { r: 24, fill: P.card, stroke: P.cardLine, glow: 0.2 }));
  M.label("python's import list", IMP_CX, 244, { alpha: aImp, color: P.ink });
  const aRowCur = K.io(t, tWith, 0.4);                    // -m / -c: the shell's current folder takes row 1
  const aRowScript = aImp * (1 - aRowCur);
  M.mono("script's folder", IMP_CX, ROW_PY1, { align: 'center', size: 30, color: P.path, alpha: aRowScript });
  M.mono('current folder', IMP_CX, ROW_PY1, { align: 'center', size: 30, color: P.path, alpha: aRowCur });
  M.label('then standard library', IMP_CX, ROW_PY2, { alpha: aImp, color: P.body });

  // ---------------------------------------------------------------- part 2: the calling file's folder (middle column)
  // node phase: "app" holds main.js, which requires helpers.js; python phase: "project" holds script.py
  const aCol = K.io(t, tNode, 0.6, 'out');
  K.layer(aCol, () => K.card(COL.x, COL.y, COL.w, COL.h, { r: 24, fill: P.card, stroke: P.cardLine, glow: 0.2 }));
  const aNodePhase = aCol * (1 - K.io(t, tRun - 0.5, 0.5));
  const aPyPhase = K.io(t, tRun, 0.6, 'out');
  M.label("calling file's folder", COL_CX, 262, { alpha: aNodePhase, color: P.ink });
  M.label("script's folder", COL_CX, 262, { alpha: aPyPhase, color: P.ink });
  M.folder(COL_CX, 360, 110, 'app', { alpha: aNodePhase });
  M.file(COL_CX, 520, 110, 'main.js', 'js', { alpha: aNodePhase, nameSize: 26 });
  M.file(COL_CX, HELPER_Y, 110, 'helpers.js', 'js', { alpha: aNodePhase, nameSize: 26 });
  M.folder(COL_CX, 360, 110, 'project', { alpha: aPyPhase });
  M.file(COL_CX, SCRIPT_Y, 110, 'script.py', 'py', { alpha: aPyPhase, nameSize: 26 });
  M.label('searched first', COL_CX, 800, { alpha: aPyPhase * K.io(t, tStarts, 0.5), color: P.body });

  // ---------------------------------------------------------------- part 2: node's require lookup (right, middle)
  const aNode = K.io(t, tResolves, 0.5) * (1 - K.io(t, tRun - 0.5, 0.5));
  K.layer(aNode, () => K.card(NODE.x, NODE.y, NODE.w, NODE.h, { r: 24, fill: P.card, stroke: P.cardLine, glow: 0.2 }));
  M.label("node's require", NODE_CX, 558, { alpha: aNode, color: P.ink });
  M.mono('app/helpers.js', NODE_CX, ROW_NODE, { align: 'center', size: 30, color: P.path, alpha: aNode });
  M.label('resolved from the', NODE_CX, 684, { alpha: aNode, color: P.body });
  M.label("calling file's folder", NODE_CX, 720, { alpha: aNode, color: P.body });
  // node route: helpers.js (in the calling folder) to the resolved path
  M.route([[COL_CX + 60, HELPER_Y], [1470, HELPER_Y], [1470, ROW_NODE], [NODE.x, ROW_NODE]], {
    k: K.io(t, tRequired, 0.9), head: true, alpha: aNodePhase,
  });

  // ---------------------------------------------------------------- part 2: python script.py (solid gold, labelled)
  const aScriptRoute = 1 - 0.6 * K.io(t, tWith, 0.5);     // dims once -m / -c takes over
  M.route([[COL_CX + 60, SCRIPT_Y], [1450, SCRIPT_Y], [1450, ROW_PY1], [IMP.x, ROW_PY1]], {
    k: K.io(t, tStarts, 1.0), head: true, alpha: aScriptRoute * aPyPhase,
  });
  M.pill('python script.py', 1450, 470, {
    mono: true, size: 26, lit: true, alpha: K.env(t, tStarts, Infinity, 0.5) * aScriptRoute,
  });

  // ---------------------------------------------------------------- part 2: python -m or -c (dashed cream, labelled)
  M.dashedRoute([[590, 368], [640, 250], [760, 190], [1000, 170], [1400, 170], [1670, 196]], {
    k: K.io(t, tDash, 1.0), head: true, color: P.body, alpha: 1,
  });
  M.pill('python -m or -c', 1000, 168, { mono: true, size: 26, alpha: K.env(t, tDash + 0.4, Infinity, 0.5) });

  // python 3.11: -P and PYTHONSAFEPATH stop the folders going first
  M.pill('-P, PYTHONSAFEPATH', 1670, 800, { mono: true, size: 26, alpha: K.env(t, tP, Infinity, 0.5) });

  // forward link to 05.02, on the last beat of the narration
  M.pill('05.02', 1670, 880, { mono: true, size: 26, alpha: K.env(t, t0502, Infinity, 0.5) });

  // the closing line of the section, held on the last beat
  M.line30('A file path and an import path are two different lookups.', 960, 880, { alpha: K.env(t, tFile, Infinity, 0.6) });
});
