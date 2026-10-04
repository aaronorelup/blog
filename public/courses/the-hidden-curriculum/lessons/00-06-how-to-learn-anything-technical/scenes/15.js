// 15 — Where it's heading: the split house from 14; the gold/terracotta boundary moves outward
// (2025 -> 2026, with a faint dashed "next"), a verifier joins the builder, first-draft security stays flat,
// the burglar gains the same AI sparkle, a vendor forecast, and the human "yes" that every tool still keeps.
SCENE('15', (t, S) => {
  const P = M.palette, C = K.C;
  const cOut = S.cue('outward', 0.88);
  const cMonths = S.find('months', 0, 2.26);
  const cVer = S.cue('verifier', 2.83);
  const cSec = S.find('Security', 0, 7.42);
  const cOld = S.find('old', 0, 20.6);
  const cFirst = S.cue('first-time', 15.23);
  const cAtt = S.cue('attackers', 18.72);
  const cAnth = S.find(/Anthropic/, 0, 24.16);
  const cFore = S.cue('forecast', 28.72);
  const cUnk = S.cue('unknown', 32.0);

  K.bg({ glow: 0.4, glowX: 960, glowY: 540 });

  // ---- focus: each card is fully lit only while its sentence is spoken, then rests at 35%;
  // at 'unknown' everything but the house, the owner and the closing pill drops further back
  const kU = K.io(t, cUnk, 0.6, 'io');
  const dimAt = (tc) => K.lerp(1, 0.35, K.io(t, tc, 0.5, 'io')) * K.lerp(1, 0.55, kU);

  // ---- the split house; the boundary steps right: 2025 (0.5) -> 2026 (0.64), "next" only as a ghost line
  const HX = 960, HY = 540, HS = 280;
  const gm = M.geo(HX, HY, HS);
  const AT = [0.5, 0.66, 0.82];
  const bxOf = (a) => K.lerp(gm.bounds.x0, gm.bounds.x1, a);
  const s1 = K.io(t, cOut + 0.1, 0.8, 'io');
  const at = K.lerp(AT[0], AT[1], s1);
  M.house(t, HX, HY, HS, { split: { k: 1, at } });

  // the ghost "next" boundary: dashed, faint, not part of the house
  const kNext = K.io(t, cMonths, 0.7, 'out');
  if (kNext > 0) {
    const nx = bxOf(AT[2]);
    K.line(nx, gm.bounds.y0 - HS * 0.06, nx, gm.bounds.y1 + HS * 0.04,
      { color: P.machine, w: 2, dash: [4, 10], alpha: 0.45 * kNext });
  }

  // ---- date scale under the house: its own small axis, ticks directly over their labels; a gold marker
  // rides from 2025 to 2026 as the boundary moves, "next" is a dashed soft tick
  const kScale = K.io(t, cOut, 0.6, 'out');
  const SX = [840, 960, 1080], tickY = gm.ground + 40, labY = tickY + 40;
  const labs = ['2025', '2026', 'next'];
  if (kScale > 0) {
    K.layer(kScale * K.lerp(1, 0.4, kU), () => {
      K.line(SX[0] - 30, tickY, SX[1], tickY, { color: C.line2, w: 2 });
      K.line(SX[1], tickY, SX[2] + 30, tickY, { color: C.line2, w: 2, dash: [4, 8], alpha: Math.max(0.3, kNext) });
      labs.forEach((s, i) => {
        const shown = i === 0 ? 1 : i === 1 ? K.io(t, cOut + 0.5, 0.5, 'out') : kNext;
        if (shown <= 0) return;
        K.layer(shown, () => {
          K.line(SX[i], tickY - 9, SX[i], tickY + 9, { color: i === 2 ? C.soft : C.body, w: 3 });
          K.text(s, SX[i], labY, { font: 'mono', weight: 600, size: 28, align: 'center',
            color: i === 2 ? C.soft : (i === 1 && s1 > 0.5 ? P.machine : C.body) });
        });
      });
      const c = K.ctx(); c.save(); c.fillStyle = P.machine; c.beginPath();
      c.arc(K.lerp(SX[0], SX[1], s1), tickY, 8, 0, Math.PI * 2); c.fill(); c.restore();
    });
  }

  // ---- the owner, still at the door (present all scene)
  const ow = M.person(t, gm.bounds.x0 - 50, gm.ground, 120, 'owner', { i: 0.4 });
  const kQ = K.io(t, cUnk, 0.6, 'out');
  if (kQ > 0) K.icon('question', ow.x, ow.top - 48, 64, { color: P.unseen, alpha: kQ, w: 5 });

  // ---- left: the builder (present) and the verifier (arrives on its cue)
  const BX = 300, VX = 560, CY = 320;
  const aCrew = dimAt(cFirst);
  K.layer(aCrew, () => {
  M.crew(t, BX, CY, 76, { i: 0.2, label: 'builder' });
  const kV = K.io(t, cVer, 0.6, 'out');
  if (kV > 0) {
    M.crew(t, VX, CY, 76, { i: 1.3, alpha: kV, shield: K.io(t, cVer + 0.4, 0.5, 'out'), label: 'verifier' });
    K.text('≠', (BX + VX) / 2, CY + 18, { font: 'ui', weight: 600, size: 56, color: C.strong, align: 'center',
      alpha: K.io(t, cVer + 0.9, 0.5, 'out') });
  }
  const kSec = K.io(t, cSec, 0.6, 'out');
  M.dated(110, 480, 540, 'Security agents · 2026', 'Confirm a bug before reporting it',
    { kind: 'machine', k: kSec, badge: { text: 'beta', kind: 'beta' } });
  });

  // ---- right: first-draft security stays flat while the line moves
  K.layer(dimAt(cAtt), () => M.dated(1160, 160, 660, 'Veracode · 2025 → 2026', 'First-draft security: ~flat, 55% → 56%',
    { kind: 'unseen', k: K.io(t, cFirst, 0.6, 'out') }));

  // ---- the burglar (present all scene), gains the same sparkle
  const kAtt = K.io(t, cAtt, 0.7, 'out');
  K.layer(dimAt(cAnth), () => {
  M.person(t, 1480, gm.ground + 10, 140, 'burglar', { i: 1.7, ai: kAtt, face: -1 });
  M.label('attackers get the same tools', 1480, gm.ground + 66, 'unseen', { alpha: K.io(t, cAtt + 0.4, 0.6, 'out') });

  // ---- "AI is finding old bugs humans missed": both sides of the line
  M.dated(1260, 330, 560, 'Frontier security AI · Apr 2026', 'Finds bugs hidden for years: for defenders and attackers',
    { kind: 'unseen', k: K.io(t, cOld, 0.6, 'out') });
  });

  // ---- bottom: the vendor forecast, badged on "That's a forecast"
  const FX = 520, FY = 770, FW = 880;
  K.layer(1 - kU, () => {
  M.dated(FX, FY, FW, 'Anthropic engineers · mid-2026', "Claude's code better than ours within a year",
    { kind: 'neutral', k: K.io(t, cAnth, 0.6, 'out') });
  const kFB = K.io(t, cFore, 0.5, 'out');
  if (kFB > 0) {
    const bw = K.measure('forecast', { font: 'ui', weight: 600, size: 22, upper: true, tracking: 3 }) + 22 * 1.6;
    M.tag('forecast', FX + FW - 28 - bw / 2, FY + 36, 'forecast', { size: 22, alpha: kFB });
  }
  });

  // ---- under the house, where the forecast card was: the sign-off every tool still keeps today
  const kYes = K.io(t, cUnk + 0.9, 0.6, 'out');
  if (kYes > 0) {
    M.chip('human sign-off: still required', HX, 830, 'machine', { k: kYes });
  }
});
