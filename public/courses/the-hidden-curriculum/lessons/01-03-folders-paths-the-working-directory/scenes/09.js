/* 01.03 section 09 "The surprises you'll hit": the map shrinks to a band at the top,
   and the error lines arrive one card at a time, each fading before the next. */
SCENE('09', (t, S) => {
  const { P, L } = M;
  K.bg();

  // cue times (local seconds); fallbacks are the offsets from cues.json
  const c1 = S.cue('err-no-such-file', 0);
  const c2 = S.cue('err-python', 11.34);
  const c3 = S.cue('err-powershell', 29.58);
  const c4 = S.cue('git-bash-spelling', 40.29);
  const c5 = S.cue('agent-reset', 49.70);

  // a card is visible from its cue until just before the next card's cue
  const fade = (a, b) => K.io(t, a, 0.4) * (b === Infinity ? 1 : 1 - K.io(t, b - 0.5, 0.4));
  const a1 = fade(c1, c2);
  const a2 = fade(c2, c3);
  const a3 = fade(c3, c4);
  const a4 = fade(c4, c5);
  const a5 = fade(c5, Infinity);

  const X = 260, W = 1400;
  // each card group (card + pill) sits centred in the zone between the band and the bottom safe line
  const ZONE_MID = 585;
  const GAP = 64, PILL_HALF = 25;
  const groupTop = (h, extra) => ZONE_MID - (h + GAP + PILL_HALF + (extra || 0)) / 2;

  // the map, shrunk to a strip with the dot as a small gold tick
  M.band(t, { alpha: 1 });
  // the band's own label: the gold dot is where the command ran
  M.label('the dot: where the command ran', 1000, 202, { align: 'left', color: P.body });

  // card 1: the generic message
  if (a1 > 0.002) {
    const h1 = 170;
    const CT = groupTop(h1);
    M.errorCard(t, X, CT, W, ['no such file or directory'], {
      eyebrow: 'macOS, Linux, Git Bash', alpha: a1, lh: 56, pad: 36,
    });
    M.pill('name not found from this dot', 960, CT + h1 + GAP, { alpha: a1 });
  }

  // card 2: Python's exact line, with the quoted name marked
  if (a2 > 0.002) {
    const h2 = 170;
    const CT = groupTop(h2);
    M.errorCard(t, X, CT, W, ["FileNotFoundError: [Errno 2] No such file or directory: 'data.csv'"], {
      eyebrow: 'Python', alpha: a2, lh: 56, pad: 36,
      mark: { line: 0, text: 'data.csv', k: K.io(t, c2 + 1.2, 0.6) },
    });
    M.pill('the name is right, the place is wrong', 960, CT + h2 + GAP, { alpha: a2 });
  }

  // card 3: PowerShell, paraphrased ("something like"), not exact text
  if (a3 > 0.002) {
    const h3 = 170;
    const CT = groupTop(h3);
    M.label('something like', X, CT - 22, { align: 'left', alpha: a3, color: P.body });
    M.errorCard(t, X, CT, W, ['cannot find path ... because it does not exist'], {
      eyebrow: 'PowerShell, file commands', alpha: a3, lh: 56, pad: 36,
    });
    M.pill('check the exact words on your own screen', 960, CT + h3 + GAP, { alpha: a3 });
  }

  // card 4: the same place in two spellings
  if (a4 > 0.002) {
    const ch = 260;
    const CT = groupTop(ch);
    K.layer(a4, () => {
      K.card(X, CT, W, ch, { r: 24, fill: P.codeFill, stroke: P.cardLine, glow: 0, shadow: false });
    });
    M.label('same place', 960, CT + 66, { color: P.root, alpha: a4 });
    M.mono('C:\\Users\\you', 560, CT + 118, { align: 'center', alpha: a4 });
    M.mono('/c/Users/you', 1360, CT + 118, { align: 'center', alpha: a4 });
    K.arrow(760, CT + 108, 1160, CT + 108, {
      k: K.io(t, c4 + 0.6, 0.8), color: P.path, w: 3, head: true, alpha: a4,
    });
    M.label('Windows spelling', 560, CT + 170, { color: P.body, alpha: a4 });
    M.label('Git Bash spelling', 1360, CT + 170, { color: P.body, alpha: a4 });
    M.pill('same place, another spelling', 960, CT + ch + GAP, { alpha: a4 });
  }

  // card 5: the Claude Code line, shown as written, in a terminal window
  if (a5 > 0.002) {
    const th = 240;
    const CT = groupTop(th);
    const rect = K.win(X, CT, W, th, {
      title: 'Claude Code', kind: 'terminal', titleSize: 26, focus: true, alpha: a5,
    });
    M.mono('Shell cwd was reset to <dir>', rect.x + 40, rect.y + rect.h / 2 + 10, { alpha: a5 });
    // the claim and its status in one pill
    const s5 = 'some people report this: the shell went back to the project';
    const w5 = K.measure(s5, { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
    M.icon('warning', 960 - w5 / 2 - 40, CT + th + GAP, 40, { color: P.miss, alpha: a5 });
    M.pill(s5, 960, CT + th + GAP, { alpha: a5 });
  }
});
