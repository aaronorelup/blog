// 01 · The point (title card). Fix pass.
// The purpose line is on screen from the first frame (fading in from just before the narration starts, so it
// is half-visible by the first spoken word). The conclusion appears at its own cue, not earlier. When the map
// is named ("nobody handed you this map") the title text steps out, the map rises, and two captions carry the
// "missing semester" passage over it. The captions leave and the whole frame steps back to 0.4 at the shelf.
SCENE('01', (t, S) => {
  const K = window.K, C = K.C, M = window.M;
  const pc = S.cue('point-conclusion', 9.16);   // conclusion sentence (local time)
  const nh = S.cue('nobody-handed', 17.73);     // "Nobody handed you this map"
  const ms = S.find('missing', 0, 22.04);       // "...a missing semester."
  const ps = S.cue('point-shelf', 32.16);       // "So here's the shelf"

  K.bg({ glow: 0.6 });

  // the painted plate steps back as the map arrives (it stays as the ground of the whole scene)
  const plateDim = 0.5 * K.io(t, nh - 0.3, 1.0);
  K.plate('plate', t, { zoom: true, shade: 0.35, alpha: 1 - plateDim });

  // the title text (purpose and conclusion) leaves as the map rises
  const titleK = 1 - K.io(t, nh - 0.3, 0.6);

  // scrim: a soft indigo band behind the conclusion, so gold type reads over the lantern row
  const scrimA = K.io(t, pc - 0.2, 1.0) * 0.78 * titleK;
  if (scrimA > 0.002) {
    const g = K.ctx();
    const y0 = 396, y1 = 612;
    const grad = g.createLinearGradient(0, y0, 0, y1);
    const edge = K.rgba(C.page, 0);
    const mid = K.rgba(C.page, 1);
    grad.addColorStop(0, edge);
    grad.addColorStop(0.2, mid);
    grad.addColorStop(0.8, mid);
    grad.addColorStop(1, edge);
    g.save();
    g.globalAlpha *= scrimA;
    g.fillStyle = grad;
    g.fillRect(0, y0, 1920, y1 - y0);
    g.restore();
  }

  // THE MAP: rises from 40 px below its place; it steps back to 0.4 at the shelf
  const rise = K.io(t, nh, 0.7, 'out');
  const shelf = K.io(t, ps, 0.8);
  const mapA = (0.6 - 0.2 * shelf) * rise;
  if (mapA > 0.002) {
    M.card(t, {
      box: { x: M.L.card.x, y: M.L.card.y + 40 * (1 - rise), w: M.L.card.w, h: M.L.card.h },
      alpha: mapA, glow: 0.35, edgeK: 1, rootLabel: 'root', disk: null,
    });
  }

  // the two captions for the "missing semester" passage, centred on the map; one replaces the other
  const capStyle = { font: 'read', weight: 400, size: 46, color: C.strong, align: 'center' };
  const cap1 = K.io(t, nh + 0.1, 0.6) * (1 - K.io(t, ms - 0.3, 0.5));
  const cap2 = K.io(t, ms, 0.5) * (1 - K.io(t, ps - 0.6, 0.5));
  if (cap1 > 0.002) K.text('Nobody handed you this map.', 960, 640, { ...capStyle, alpha: cap1 });
  if (cap2 > 0.002) K.text('It\'s a missing semester.', 960, 640, { ...capStyle, alpha: cap2 });

  // calm drifting petals, kept off the text blocks
  K.petals(t, {
    n: 6, seed: 7, alpha: 0.5,
    avoid: [[140, 250, 1780, 370], [140, 420, 1780, 680]],
  });

  // purpose line (first spoken sentence): fading in from just before the narration, so it is
  // about half-visible by the first word and fully on by 0.6 s
  const pa = K.io(t, -0.6, 0.8, 'out') * titleK;
  if (pa > 0.002) {
    K.para('In this lesson you\'ll learn how a path points to a file, and why the same name can point somewhere different depending on where a program was started.',
      160, 300, 1600, { font: 'read', weight: 400, size: 40, lh: 58, color: C.strong, alpha: pa });
  }

  // conclusion: appears at its own cue (not before), with a small settle
  const ck = K.io(t, pc, 0.8);
  const ca = K.io(t, pc - 0.05, 0.8) * titleK;
  if (ca > 0.002) {
    K.para('A path is an address, and a relative path only makes sense from the working directory of the program that reads it.',
      160, 424 + 8 * (1 - ck), 1040, { font: 'read', weight: 400, size: 30, lh: 44, color: C.head, alpha: ca });
  }
});
