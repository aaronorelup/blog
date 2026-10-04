// 10 — Writing the house rules down
// The norms get written into a file the crew reads (CLAUDE.md / AGENTS.md); one rule is posted on the site as a
// notice beside the house. It is a note, not a lock: a crew member skims the long file right past it; only checks
// and reviews enforce it, so someone who knows the norms watches the crew.
SCENE('10', (t, S) => {
  const C = K.C, P = M.palette, g = K.ctx();
  const T = {
    claude: S.cue('claude-md', 5.8),
    agents: S.cue('agents-md', 9.4),
    oneLine: S.find('One', 0, 15.0),
    rule: S.cue('rule', 17.3),
    note: S.find(/^note/, 0, 20.5),
    lock: S.cue('not-a-lock', 21.2),
    long: S.find('Long', 0, 22.3),
    checks: S.find('checks', 0, 24.5),
    someone: S.find('someone', 0, 27.5),
    ignored: S.cue('ignored', 31.2),
  };

  // house on the right, lit, with its crew
  K.bg({ glow: 0.35, glowX: 1460, glowY: 600 });
  const HX = 1640, HY = 660, HS = 300;

  // ---------------------------------------------------------------- the project window (left)
  const W = { x: 100, y: 190, w: 800, h: 610 };
  const exOut = K.io(t, T.oneLine, 0.4), toEd = K.io(t, T.oneLine + 0.35, 0.45); // explorer out, then editor in
  const rect = K.win(W.x, W.y, W.w, W.h, { title: '', kind: toEd > 0.5 ? 'code' : 'explorer' });
  K.text('my-project', W.x + 56, W.y + 34, { size: 26, color: C.body, weight: 600, alpha: 1 - exOut });
  K.text('CLAUDE.md', W.x + 56, W.y + 34, { font: 'mono', size: 26, color: C.strong, weight: 600, alpha: toEd });

  // explorer rows
  if (exOut < 1) K.layer(1 - exOut, () => {
    const rows = [
      { name: 'src/', folder: true },
      { name: 'package.json' },
      { name: 'README.md' },
      { name: 'CLAUDE.md', at: T.claude, note: 'read by Claude Code' },
      { name: 'AGENTS.md', at: T.agents, note: 'read by many tools' },
    ];
    rows.forEach((r, i) => {
      const k = r.at == null ? 1 : K.io(t, r.at, 0.6, 'out');
      if (k <= 0) return;
      const y = rect.y + 62 + i * 82;
      K.layer(k, () => {
        g.save(); g.translate(0, (1 - k) * 14);
        if (r.at != null) { K.rr(rect.x + 18, y - 34, rect.w - 36, 68, 12); g.fillStyle = K.rgba(C.head, 0.1); g.fill(); }
        if (r.folder) K.folder(rect.x + 62, y, 34);
        else K.icon('file', rect.x + 62, y, 40, { color: r.at != null ? C.head : C.soft, w: 2.5 });
        K.text(r.name, rect.x + 104, y + 11, { font: 'mono', size: 30, weight: 600, color: r.at != null ? C.strong : C.body });
        if (r.note) M.label(r.note, rect.x + rect.w - 40, y + 10, 'note', { size: 28, align: 'right' });
        g.restore();
      });
    });
  });

  // editor body: a long CLAUDE.md, the rule typed on 'rule'
  const LINES = [
    '# House rules', '', '## Dependencies', '@1', '@2', '', '## Style',
    '- Follow the existing names.', '- Match the folder layout.', '- Handle errors like src/api.',
    '', '## Testing', '- Run the tests before a commit.', '- Add a test for every fix.', '',
    '## Commands', '- npm run dev', '- npm test', '- npm run lint', '', '## Data',
    '- Never print secrets.', '- Keys live in .env only.', '', '## Reviews',
    '- Small changes, one per PR.', '- Explain why, not what.', '', '## Notes',
    '- The API is versioned (v2).', '- Dates are UTC.', '- Old code in legacy/: leave it.',
    '- Ask before deleting files.', '', '## Release', '- Tag every release.', '- Update CHANGELOG.md.',
    '', '## More', '- ...',
  ];
  const RULE = ['- Use only libraries', '  already in this project.'];
  const size = 28, lh = 44, gx = rect.x + 26, tx = rect.x + 92;
  const scrollMax = 26 * lh;
  const scroll = scrollMax * (K.io(t, T.long, 1.5, 'io') - K.io(t, T.someone - 0.6, 1.0, 'io'));
  if (toEd > 0) K.layer(toEd, () => {
    g.save(); g.beginPath(); g.rect(rect.x, rect.y, rect.w, rect.h - 4); g.clip();
    g.translate(0, -scroll);
    // the rule line wash
    const ruleY = rect.y + 26 + size + 3 * lh;
    const wash = K.io(t, T.rule + 1.6, 0.5);
    if (wash > 0) { K.rr(rect.x + 14, ruleY - size - 6, rect.w - 40, lh * 2 + 4, 10); g.fillStyle = K.rgba(C.head, 0.12 * wash); g.fill(); }
    let budget = Math.max(0, (t - T.rule) * 26);
    LINES.forEach((ln, i) => {
      const y = rect.y + 26 + size + i * lh;
      if (y - scroll < rect.y - 10 || y - scroll > rect.y + rect.h + 30) return;
      K.text(String(i + 1), gx + 30, y, { font: 'mono', size: size * 0.8, color: C.quiet, align: 'right' });
      if (ln === '@1' || ln === '@2') {
        const s = RULE[ln === '@1' ? 0 : 1];
        const vis = ln === '@1' ? s.slice(0, budget) : s.slice(0, Math.max(0, budget - RULE[0].length - 1));
        K.text(vis, tx, y, { font: 'mono', size, color: C.strong, weight: 600 });
        const typing = budget < RULE[0].length + RULE[1].length + 1;
        const onThis = ln === '@1' ? budget <= RULE[0].length : budget > RULE[0].length;
        if (t >= T.rule && typing && onThis && K.caretOn(t)) {
          const cx = tx + K.measure(vis, { font: 'mono', size, weight: 600 }) + 3;
          g.fillStyle = C.strong; g.fillRect(cx, y - size * 0.8, size * 0.5, size);
        }
      } else {
        K.text(ln, tx, y, { font: 'mono', size, color: ln.startsWith('#') ? C.head : C.body });
      }
    });
    g.restore();
    // scroll bar: a long file
    const total = LINES.length * lh + 60, vis = rect.h - 20;
    const th = Math.max(60, vis * vis / total), ty = rect.y + 10 + (vis - th) * (scroll / (total - vis));
    K.rr(rect.x + rect.w - 18, rect.y + 10, 6, vis, 3); g.fillStyle = K.rgba(C.line2, 0.5); g.fill();
    K.rr(rect.x + rect.w - 20, ty, 10, th, 5); g.fillStyle = C.soft; g.fill();
  });

  // fact card for AGENTS.md (right column, gives way to the notice)
  const factK = K.io(t, T.agents + 0.3, 0.6) * (1 - K.io(t, T.oneLine, 0.6));
  if (factK > 0) M.dated(1000, 230, 620, 'Linux Foundation · Dec 2025', 'AGENTS.md: open, read by many AI tools', { k: factK });

  // ---------------------------------------------------------------- the posted notice
  const NX = 1270, NY = 320, NW = 530;
  const ph = M.plaque('Use only libraries already in this project.', NX, NY, NW, { size: 40, pins: true, k: 0 });
  const fly = K.io(t, T.rule + 1.7, 0.8, 'io');
  const postK = K.io(t, T.rule + 2.3, 0.6, 'out');
  const ground = HY + 0.36 * HS;
  if (postK > 0) {
    const top = NY + ph / 2;
    const bot = K.lerp(top, ground, postK);
    g.save();
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(NX, ground + 2, 40 * postK, 6, 0, 0, 7); g.fill();
    g.fillStyle = P.wood; g.strokeStyle = P.woodHi; g.lineWidth = 2;
    K.rr(NX - 9, top, 18, bot - top, 4); g.fill(); g.stroke();
    g.restore();
  }

  // house + crew
  M.house(t, HX, HY, HS, { lights: 1 });
  const crewPos = [[1585, 470], [1715, 420], [1805, 485]];
  // the skimmer: crew 2 flies to the editor, skims down past the rule, comes back
  const out1 = K.io(t, T.long - 0.5, 0.6, 'io');
  const down = K.io(t, T.long + 0.1, 1.4, 'io');
  const back = K.io(t, T.checks - 0.2, 0.8, 'io');
  crewPos.forEach(([x, y], i) => {
    if (i !== 2) { M.crew(t, x, y, 56, { i }); return; }
    let px = K.lerp(x, 820, out1), py = K.lerp(y, 300, out1);
    py = K.lerp(py, 740, down);
    px = K.lerp(px, x, back); py = K.lerp(py, y, back);
    M.crew(t, px, py, 56, { i });
  });

  // the notice itself (flies from the rule line to the post)
  if (fly > 0) {
    const fx = K.lerp(rect.x + 380, NX, fly), fy = K.lerp(rect.y + 26 + size + 3 * lh + 10, NY, fly);
    const sc = K.lerp(0.55, 1, fly);
    K.at(fx, fy, sc, () => M.plaque('Use only libraries already in this project.', 0, 0, NW, { size: 40, pins: true, k: Math.min(1, fly * 2.5) }));
  }

  // a note, not a lock
  M.chip('a note', 1130, 486, 'neutral', { icon: 'pin', k: K.io(t, T.note, 0.5, 'out') });
  M.chip('a lock', 1420, 486, 'off', { icon: 'lock', k: K.io(t, T.lock, 0.5, 'out') });

  // only checks and reviews enforce it
  M.chip('checks and reviews enforce it', W.x + W.w / 2, 868, 'machine', { k: K.io(t, T.checks, 0.5, 'out') });

  // someone who knows the norms, watching the crew
  const ow = K.io(t, T.someone, 0.7, 'out');
  // "...and notice when it's ignored": an unapproved supplier truck rolls in under the notice
  const ROAD = 860, VS = 170, VX = 1590;
  const vk = K.io(t, T.ignored - 0.15, 1.0, 'out');
  if (ow > 0) {
    const watch = K.io(t, T.someone + 0.5, 0.8, 'io');
    const swing = K.io(t, T.ignored + 0.2, 0.7, 'io');
    M.cone(1150, 650, K.lerp(-0.38, 0.33, swing), K.lerp(0.2, 0.16, swing), K.lerp(540, 500, swing), watch);
  }
  if (vk > 0) {
    const x = K.lerp(2080, VX, vk);
    M.van(t, x, ROAD, VS, {
      name: 'charts', ghost: 0.3, tint: K.mixColor(C.line2, C.accent, 0.75),
      roll: -(2080 - x) / (0.085 * VS),
    });
  }
  if (ow > 0) K.layer(ow, () => {
    g.save(); g.translate(0, (1 - ow) * 20);
    M.person(t, 1150, ground, 150, 'owner', { label: 'someone who knows the norms', i: 1 });
    g.restore();
  });
  M.chip('ignored the note', 1335, 885, 'unseen', { k: K.io(t, T.ignored + 0.5, 0.5, 'out') });
});
