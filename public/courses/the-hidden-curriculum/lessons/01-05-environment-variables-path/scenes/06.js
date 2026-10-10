/* 01.05 scene 06 — "Not recognized as a command"
   The same street grid as 05, but no shop holds python: the courier walks every street and finds nothing.
   Then four cause cards (right column), then the error's three outfits as three stacked terminals. */
SCENE('06', (t, S) => {
  const C = K.C;
  K.bg();

  const cEvery = S.cue('every-street', 0);
  const cInst = S.cue('not-installed', 6.35);
  const cPath = S.cue('not-on-path', 8.78);
  const cStale = S.cue('stale', 12.28);
  const cTypo = S.cue('typo', 16.38);
  const cWord = S.cue('wordings', 17.94);
  const tCmd = S.find('Command', 0, cWord + 2.6);
  const tPs = S.find('PowerShell', 0, cWord + 8.4);
  const tSh = S.find('Bash', 0, cWord + 13.2);
  const tSame = S.find('Same', 0, cWord + 17.3);

  // grid: streets end at x 1240 so the right column (x 1360-1820) is free for the cause cards
  const geo = { ...M.L.streets, x1: 1240 };
  const names = ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\Git\\cmd', 'C:\\Program Files\\nodejs', 'C:\\Users\\…\\.local\\bin'];

  // the walk: per street, walk to the shop (0.4 s), the X lands, then cut back down-left to the next street
  const W0 = cEvery + 1.0, PER = 0.8, WALK = 0.4, BACK = 0.3;
  const arrive = (i) => W0 + PER * i + WALK;
  const U = 0.85; // stop in front of the shop, clear of the X
  let cx, cy, walking = 0;
  {
    const p0 = M.streetAt(0, 0, geo);
    cx = p0.x; cy = p0.y;
    for (let i = 0; i < 5; i++) {
      const s0 = W0 + PER * i;
      if (t < s0) break;
      const a = M.streetAt(i, 0, geo), b = M.streetAt(i, U, geo);
      if (t < s0 + WALK) { const k = K.io(t, s0, WALK); cx = K.lerp(a.x, b.x, k); cy = a.y; walking = 1; break; }
      cx = b.x; cy = b.y;
      if (i < 4) {
        const r0 = s0 + WALK + 0.1;
        if (t < r0) break;
        const n = M.streetAt(i + 1, 0, geo);
        if (t < r0 + BACK) { const k = K.io(t, r0, BACK); cx = K.lerp(b.x, n.x, k); cy = K.lerp(b.y, n.y, k); walking = 1; break; }
        cx = n.x; cy = n.y;
      }
    }
  }

  // phase fades
  const wordK = K.io(t, cWord, 0.7);               // cause cards + terminal strip leave, the three outfits arrive
  // the street list crossfades out as the three windows arrive, fully gone before they settle (no empty beat, no show-through)
  // the grid stays (dimming) until the first window is named, then leaves under it
  const gridA = (1 - 0.45 * K.io(t, cWord, 0.7)) * (1 - K.io(t, tCmd - 0.3, 0.6));

  // ---- the street grid (nothing named python anywhere)
  const rows = names.map((name, i) => {
    const missK = K.io(t, arrive(i), 0.35);
    return { name, state: missK > 0 ? 'miss' : 'idle', missK };
  });
  if (gridA > 0.002) M.streets(t, geo, { rows, alpha: gridA });

  // ---- the courier, empty-handed at the end
  const endK = K.io(t, arrive(4) + 0.3, 0.5);
  M.courier(t, cx, cy, 80, { walking, alpha: 1 - wordK, dim: 0.35 * endK });

  // ---- which machine this is: not 05's machine, one with no Python on it
  // (not gold: gold is reserved for PATH / "this one" in this lesson)
  M.eyebrow('a machine with no Python', 220, 182, { align: 'left', color: C.body, alpha: K.io(t, cEvery + 0.2, 0.5) * gridA });

  // ---- "no shop by that name" (said 'found no shop with that name')
  const noShop = K.io(t, S.find('no', 0, 4.54, { whole: true }), 0.5);
  M.label('no shop by that name', 1000, 182, { size: 30, color: C.strong, alpha: noShop * (1 - wordK) });

  // ---- terminal strip: the bare name that started the search, then the error once street 5 is empty
  M.termStrip(t, [
    { at: cEvery + 0.25, cmd: 'python', cps: 22 },
    { at: arrive(4) + 0.35, out: "'python' is not recognized as an internal or external command, ...", color: C.accent },
  ], { y: 792, h: 138, size: 26, rows: 2, alpha: 1 - wordK });

  // ---- cause cards (right column)
  const CX = 1360, CW = 460, CH = 104, CY = [230, 360, 490, 620];
  const causes = [
    { at: cInst, icon: 'cross', text: ['not installed'] },
    { at: cPath, icon: 'folder', text: ['installed, folder', 'not on the list'] },
    { at: cStale, icon: 'clock', text: ['list changed after', 'this terminal left'] },
    { at: cTypo, icon: 'typo', text: ['a typo'] },
  ];
  causes.forEach((c, i) => {
    const k = K.io(t, c.at, 0.5);
    if (k <= 0) return;
    const a = k * (1 - wordK);
    if (a <= 0.002) return;
    const y = CY[i] + (1 - k) * 24;
    K.card(CX, y, CW, CH, { r: 16, fill: C.tile, stroke: C.line2, alpha: a, shadow: false });
    const ix = CX + 52, iy = y + CH / 2;
    K.layer(a, () => {
      if (c.icon === 'folder') {
        // the shop that exists but stands on no street: dim, dashed outline around it
        K.layer(0.45, () => K.folder(ix, iy + 4, 50, {}));
        const g = K.ctx(); g.save(); g.setLineDash([6, 6]); g.strokeStyle = C.soft; g.lineWidth = 2;
        K.rr(ix - 36, iy - 30, 72, 64, 10); g.stroke(); g.restore();
      } else if (c.icon === 'typo') {
        K.icon('question', ix, iy, 44, { color: C.soft, w: 3 });
      } else if (c.icon === 'cross') {
        M.cross(ix, iy, 56, 1);
      } else {
        K.icon(c.icon, ix, iy, 46, { color: C.soft, w: 3 });
      }
      const tx = CX + 104;
      if (c.icon === 'typo') {
        const w = K.text('a typo:', tx, iy + 10, { font: 'ui', weight: 600, size: 30, color: C.strong });
        K.text('pyhton', tx + w + 16, iy + 10, { font: 'mono', weight: 600, size: 30, color: C.accent });
      } else if (c.text.length === 1) {
        K.text(c.text[0], tx, iy + 10, { font: 'ui', weight: 600, size: 30, color: C.strong });
      } else {
        K.text(c.text[0], tx, iy - 8, { font: 'ui', weight: 600, size: 28, color: C.strong });
        K.text(c.text[1], tx, iy + 28, { font: 'ui', weight: 600, size: 28, color: C.strong });
      }
    });
  });

  // ---- the three outfits: one terminal per shell, stacked, each arriving as it is named
  // each window fades up in its final slot only when its shell is named (no empty frames waiting)
  const TX = 260, TW = 1400, TH = 200, TY = [180, 404, 628];
  const outfits = [
    { at: tCmd, title: 'Command Prompt', prompt: 'C:\\Users\\you>',
      out: "'python' is not recognized as an internal or external command,\noperable program or batch file." },
    { at: tPs, title: 'Windows PowerShell', prompt: 'PS C:\\Users\\you> ',
      out: "The term 'python' is not recognized as the name of a cmdlet,\nfunction, script file, or operable program. ..." },
    { at: tSh, title: 'bash  ·  zsh', prompt: '$ ',
      out: 'bash: python: command not found\nzsh: command not found: python' },
  ];
  outfits.forEach((o, i) => {
    const k = K.io(t, o.at - 0.35, 0.5);
    if (k <= 0) return;
    const named = 1;
    const y = TY[i] + (1 - k) * 30;
    K.layer(k, () => {
      const rect = K.win(TX, y, TW, TH, { kind: 'terminal', title: o.title, titleSize: 26 });
      const items = [{ at: o.at - 0.1, cmd: 'python', cps: 40 }, { at: o.at + 0.3, out: o.out, color: C.accent }];
      K.layer(Math.max(0.0001, named), () => K.term(rect, t, items, { size: 28, pad: 20, rows: 3, prompt: o.prompt, idle: false }));
    });
  });

  // "Same empty street.": one quiet line under the three outfits
  const same = K.io(t, tSame, 0.6);
  if (same > 0) M.label('same empty street', 960, 872, { size: 30, color: C.strong, alpha: same });
});
