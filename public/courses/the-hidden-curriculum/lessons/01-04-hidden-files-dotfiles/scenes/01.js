// 01 · The point (title card).
// Purpose line from the first frame; the conclusion at its cue, with the "out of sight, never locked" line landing
// on the spoken "Hidden only means...". The staff-only door stands dim at the right (foreshadowing 03's shop).
// [[point-secrets]] a terracotta key settles under the door; [[point-agents]] an agent joins it and the door
// eases ajar, gold light in the gap. Last frame: everything built, door ajar, petals drifting.
SCENE('01', (t, S) => {
  const K = window.K, C = K.C, M = window.M;
  const pc = S.cue('point-conclusion', 8.1);
  const hid = S.find('Hidden', 1, 18.7);          // "Hidden only means out of sight."
  const sec = S.cue('point-secrets', 22.18);
  const ag = S.cue('point-agents', 24.59);

  K.bg({ glow: 0.6 });
  K.plate('plate', t, { zoom: true, shade: 0.35 });

  // soft indigo scrim behind the text block so cream and gold read over the plate
  {
    const g = K.ctx();
    const sa = 0.7 * K.io(t, -0.6, 0.8, 'out');
    g.save(); g.globalAlpha *= sa;
    g.translate(640, 470); g.scale(1, 0.42);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1050);
    grad.addColorStop(0, K.rgba(C.page, 1));
    grad.addColorStop(0.6, K.rgba(C.page, 0.85));
    grad.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = grad; g.fillRect(-1100, -1100, 2200, 2200); g.restore();
    // a quieter pool under the key and agent labels
    const la = 0.7 * K.io(t, sec, 0.6);
    if (la > 0.002) {
      g.save(); g.globalAlpha *= la; g.translate(1620, 820); g.scale(1, 0.45);
      const g2 = g.createRadialGradient(0, 0, 0, 0, 0, 260);
      g2.addColorStop(0, K.rgba(C.page, 1)); g2.addColorStop(1, K.rgba(C.page, 0));
      g.fillStyle = g2; g.fillRect(-300, -300, 600, 600); g.restore();
    }
  }

  // the door: set into a dark wall alcove so the plate's lanterns and windows pass BEHIND it (opaque backing,
  // soft shadow), then dim at first, steadier once the layer behind it is named, ajar when the agents arrive
  const D = M.layout.title.door, DW = M.layout.door.w, DH = M.layout.door.h;
  const openK = K.io(t, ag + 0.15, 0.8);
  const wallA = K.io(t, -0.6, 0.8, 'out');
  {
    const g = K.ctx();
    // a soft dark halo, then the wall slab: masks the lantern string behind the door
    g.save(); g.globalAlpha *= wallA;
    g.translate(D.x + DW / 2, D.y + DH / 2 - 20);
    g.scale(1, 1.9);
    const hg = g.createRadialGradient(0, 0, 0, 0, 0, 230);
    hg.addColorStop(0, K.rgba(C.page, 0.95)); hg.addColorStop(0.55, K.rgba(C.page, 0.8)); hg.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = hg; g.fillRect(-240, -240, 480, 480); g.restore();
    g.save(); g.globalAlpha *= wallA;
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 12;
    K.rr(D.x - 34, D.y - 108, DW + 68, DH + 108, 10); g.fillStyle = M.palette.room; g.fill(); g.restore();
    K.line(D.x - 34, D.y - 108, D.x - 34, D.y + DH, { color: M.palette.roomEdge, w: 2, alpha: wallA });
    K.line(D.x + DW + 34, D.y - 108, D.x + DW + 34, D.y + DH, { color: M.palette.roomEdge, w: 2, alpha: wallA });
    // opaque door body so nothing shows through the panel
    K.rr(D.x + 4, D.y + 4, DW - 8, DH - 4, 4); g.save(); g.globalAlpha *= wallA; g.fillStyle = M.palette.door; g.fill(); g.restore();
  }
  const doorA = wallA * (0.75 + 0.15 * K.io(t, sec, 0.7) + 0.1 * openK);
  M.doorGroup(D.x, D.y, D.s, { alpha: doorA, open: 0.42 * openK, light: 0.9 * openK });

  // what lives behind it: your keys (terracotta = secrets) and an agent (gold sparkle with lantern)
  const keyK = K.io(t, sec, 0.6);
  if (keyK > 0.002) {
    K.layer(keyK, () => {
      const y = 790 + 14 * (1 - keyK);
      K.glow(1530, y, 60, M.palette.secret, 0.18);
      K.icon('key', 1530, y, 64, { color: M.palette.secret, w: 3.5 });
      K.text('your keys', 1530, y + 66, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center' });
    });
  }
  const agK = K.io(t, ag, 0.6);
  if (agK > 0.002) {
    const y = 790 + 14 * (1 - agK);
    M.staff(1710, y, 52, { t, i: 1, alpha: agK, lantern: K.io(t, ag + 0.3, 0.6) });
    K.text('AI agents', 1710, 790 + 66, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center', alpha: agK });
  }

  // calm petals, kept off the text and the door group
  K.petals(t, {
    n: 6, seed: 4, alpha: 0.5,
    avoid: [[140, 160, 1440, 700], [1440, 220, 1780, 900]],
  });

  // eyebrow + gold title + purpose line (first spoken sentence): about half on by the first word
  const pa = K.io(t, -0.6, 0.8, 'out');
  if (pa > 0.002) {
    K.eyebrow('01.04', 160, 214, { size: 24, alpha: pa });
    K.title('Hidden files & dotfiles', 160, 300, { size: 72, alpha: pa });
    K.para('In this lesson you’ll learn about the hidden layer of files on your computer, what lives in it, and why you need to know it is there.',
      160, 392, 1180, { font: 'read', weight: 400, size: 38, lh: 54, color: C.strong, alpha: pa });
  }

  // conclusion, phrase by phrase on the spoken words: settings / history / secrets / AI instructions each land
  // as they are said (secrets in terracotta, the others in strong cream), then "hides... tucks out of the way"
  {
    const ph = [
      ['Almost every project and app keeps its', pc, C.body],
      ['settings,', S.find('settings', 0, pc + 2.3), C.strong],
      ['its history,', S.find('history', 0, pc + 3.3), C.strong],
      ['its secrets,', S.find('secrets', 0, pc + 4.3), M.palette.secret],
      ['and now its AI instructions', S.find('now', 0, pc + 5.4), C.strong],
      ['in files your computer', S.find('files', 1, pc + 6.9), C.body],
      ['hides,', S.find('hides', 0, pc + 8), C.body],
      ['or tucks out of the way.', S.find('tucks', 0, pc + 8.5), C.body],
    ];
    const fo = { font: 'read', weight: 400, size: 32 };
    const sp = K.measure(' ', fo), W = 900, LH = 46;
    let x = 0, y = 0;
    for (const [txt, at, col] of ph) {
      const w = K.measure(txt, fo);
      if (x > 0 && x + w > W) { x = 0; y += LH; }
      const k = K.io(t, at - 0.1, 0.45);
      if (k > 0.002) K.text(txt, 160 + x, 540 + y + 6 * (1 - k), { ...fo, color: col, alpha: k });
      x += w + sp;
    }
  }
  const hk = K.io(t, hid, 0.6);
  if (hk > 0.002) {
    K.text('Hidden means out of sight, never locked.', 160, 712 + 8 * (1 - hk),
      { font: 'read', weight: 400, size: 36, color: C.head, alpha: hk });
  }
});
