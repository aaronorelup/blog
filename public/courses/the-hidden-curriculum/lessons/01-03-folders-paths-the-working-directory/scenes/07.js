/* 01.03 section 07 · Shortcuts, and where the picture breaks
   One map, one dot. Shortcuts first (tilde, dot, dot dot), then the dot's copies leave the map for the
   running programs (outside the disk: each program is its own box with its own dot), then the top edge
   of the disk: nowhere further to go. The disk stays the whole map. */
SCENE('07', (t, S) => {
  const M = window.M, P = M.P, K2 = window.K;
  K2.bg();

  // cues and spoken words (local seconds; the sentences are in script.md)
  const tildeWord = S.find(/^tilde$/i, 0, 2.47);      // "Tilde means your home folder"
  const homeWord = S.find(/^home$/i, 0, 3.31);        // "home folder"
  const windowsWord = S.find(/^windows/i, 0, 6.95);   // "On Windows, that is usually ..."
  const cWord = S.find(/^c$/i, 0, 8.73);              // "something like C colon backslash ..."
  const usersWord = S.find(/^users$/i, 0, 10.81);     // "... backslash Users ..."
  const nameWord = S.find(/^name$/i, 0, 11.99);       // "... and your name."
  const dotsCue = S.cue('dots', 12.84);               // "A single dot means this folder"
  const twoWord = S.find(/^two$/i, 0, 15.36);         // "Two dots mean the folder one step up"
  const oneWord = S.find(/^one$/i, 0, 17.26);         // "one step up"
  const brk = S.cue('break-copy', 21.85);             // "Now the place where the picture breaks"
  const runWord = S.find(/^running$/i, 0, 29.55);     // "inside each running program"
  const copyWord = S.find(/^copy/i, 0, 34.3);         // "the child gets a copy"
  const perProg = S.find(/^one$/i, 2, 38.59);         // "one per running program"
  const rootEnd = S.cue('root-end', 40.44);           // "the top of the disk has nowhere further"

  // the shortcuts leave when the picture breaks
  const vis = 1 - K2.io(t, brk, 0.4);
  // the map's dot gives its copy away: it fades as the copies go out to the programs
  const split = K2.io(t, copyWord, 0.6);

  // the shared single map (the disk), no root label; the dot fades at the copy
  M.frame(t, { rootLabel: null, dotAlpha: 1 - split });

  // ---- tilde: the home folder hangs from the root edge, down the right side of the disk.
  // The spine is the path; on Windows its nodes are C:\ then Users then you, and the house is the end.
  const tA = K2.io(t, tildeWord, 0.6) * vis;
  M.route([[1400, 200], [1400, 445]], { k: K2.io(t, tildeWord, 0.6), head: false, w: 2.5, alpha: vis });
  M.icon('house', 1400, 490, 90, { alpha: tA });
  M.addressPill('~', 1220, 490, { alpha: tA });
  M.pill('home folder', 1400, 580, { alpha: K2.io(t, homeWord, 0.5) * vis });
  // the Windows chain, one node per spoken part of "C:\Users\you"
  M.addressPill('C:\\', 1400, 262, { alpha: K2.io(t, cWord, 0.4) * vis });
  M.addressPill('Users', 1400, 332, { alpha: K2.io(t, usersWord, 0.4) * vis });
  M.addressPill('you', 1400, 402, { alpha: K2.io(t, nameWord, 0.4) * vis });
  M.pill('usually C:\\Users\\you', 1190, 650, { mono: true, size: 26, alpha: K2.io(t, windowsWord, 0.5) * vis });

  // ---- dots: this folder (beside the dot), and the folder one step up (an arrow up to the root edge)
  M.pill('this folder', 700, 520, { alpha: K2.io(t, dotsCue, 0.5) * vis });
  M.route([[808, 520], [928, 520]], { k: K2.io(t, dotsCue, 0.5), alpha: vis });
  M.route([[960, 486], [960, 232]], { k: K2.io(t, twoWord, 0.9), alpha: vis });
  // the up-arrow's label, to its left (the right side of the disk holds the home-folder chain)
  M.addressPill('..', 800, 262, { alpha: K2.io(t, twoWord, 0.5) * vis });
  M.pill('parent folder', 800, 332, { alpha: K2.io(t, oneWord, 0.5) * vis });

  // ---- where the picture breaks: one program box per running program, outside the disk
  const rows = [380, 540, 700];
  rows.forEach((y, i) => {
    const b = K2.stagger(t, runWord, i, 0.12, 0.6);
    if (b <= 0.002) return;
    // the copy travels from the map's dot to its program (drawn as the dot gives its copy away)
    M.route([[982, 520], [1604, y]], { k: K2.io(t, copyWord, 0.6), head: false, w: 2.5, alpha: b });
    K2.layer(b, () => {
      K2.card(1580, y - 65, 250, 130, { r: 18, fill: P.card, stroke: P.cardLine, glow: 0, shadow: false });
    });
    M.dot(t, 1622, y, { r: 14, k: b, pulse: 0.4 });
    M.label('program', 1662, y + 9, { align: 'left', color: P.ink, alpha: b });
  });
  M.label('one dot per', 1705, 225, { color: P.ink, alpha: K2.io(t, perProg, 0.5) });
  M.label('running program', 1705, 257, { color: P.ink, alpha: K2.io(t, perProg, 0.5) });

  // ---- the top edge of the disk: an open stop on the root line, with nowhere further to go
  const re = K2.io(t, rootEnd, 0.6);
  K2.ring(960, 200, 18, 18, re, { color: P.root, w: 3, rot: 0 });
  M.addressPill('..', 800, 200, { alpha: re });
  M.pill('nowhere further', 1150, 200, { alpha: re });
});
