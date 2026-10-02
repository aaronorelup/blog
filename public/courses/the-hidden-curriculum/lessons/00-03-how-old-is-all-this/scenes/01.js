/* 01 — Old streets, new lanterns (title card, noBadge)
   Frame 0 (lesson 0:00) is fully composed and already carries the point: eyebrow, title and the PURPOSE line
   (what you'll learn: Aaron's standing rule, the first spoken sentence), with three unlit paper lanterns already
   hanging where the street will end. Then the street works under the voice ('title' preset):
   - "how old the tools you build with really are": the grey street draws itself left to right toward the lanterns;
     a slow camera push (z 1 → 1.03) runs under the same sentence;
   - "why their age matters": the decade ticks fade in;
   - [[conclusion]] the plain one-line conclusion rises under the purpose line; on "decades" the gold warms the
     old 85 % of the street (1965 → 2016) with a soft glow riding its front; on "only the AI layer on top is new"
     the unlit lanterns breathe one clear warm pulse (rises and falls back to dark paper, never lit);
   - [[old-floor]] the street steps up to full presence and four name-only ghost tags hang on their spoken words
     ("terminal", "files", "the web", "git"; names only, so no year is claimed for "files");
   - [[new-lamp]] the three lanterns light one by one (this scene's one 'back' = the first lantern's glow swell),
     the lit line runs on to 2026 and the lantern stretch turns terracotta; "still changing" rises under the
     lanterns on "still";
   - [[sort]] two brackets under the street (M.bracket, as 04 will use): gold "learn deeply, once" on "learn",
     terracotta "keep checking" on "keep".
   Exit: everything held, lanterns glowing, petals drifting. Pure function of t. */
SCENE('01', (t, S) => {
  const C = K.C, L = M.layout.s01;

  // ---- ground: night bg, painted plate (darkened), sparse petals
  K.bg({ glow: 0.12, glowX: 960, glowY: 280 });
  // the plate is atmosphere only, and only in the lower band (stepping stones, the pond): its own painted
  // lantern string hangs exactly where the street's three lanterns and the 'git' tag sit (x 1100–1700,
  // y 400–540), and many lit painted lanterns there would contradict "lanterns only at the far end".
  // Workaround: draw the plate (same framing as K.plate) into a scratch canvas, fade it in from y 680 to
  // y 860 with an alpha mask, and lay that over the night ground (no seam). The scratch canvas is only a
  // buffer, fully redrawn every frame, so the frame is still a pure function of t.
  const im = K.img && K.img.plate;
  if (im) {
    const W = 1920, H = 1080, top = 680, full = 860;
    const oc = (window.__s01Plate = window.__s01Plate || Object.assign(document.createElement('canvas'), { width: W, height: H }));
    const o = oc.getContext('2d');
    o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.clearRect(0, 0, W, H);
    const z = 1.04 + 0.006 * t, w = W * z, h = (im.height / im.width) * w;
    o.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    o.fillStyle = K.rgba(C.page, 0.45); o.fillRect(0, 0, W, H);
    const m = o.createLinearGradient(0, top, 0, full);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)');
    o.globalCompositeOperation = 'destination-in'; o.fillStyle = m; o.fillRect(0, 0, W, H);
    o.globalCompositeOperation = 'source-over';
    K.ctx().drawImage(oc, 0, 0);
  }

  // ---- slow camera push over the purpose sentence (z 1 → 1.03), then held; everything but the ground moves
  const camZ = 1 + 0.03 * K.io(t, 0.3, 5.2, 'io');
  K.withCam({ x: 960, y: 540, z: camZ }, () => {
  K.petals(t, { n: 6, seed: 3, alpha: 0.45 });

  // ---- cue times (local)
  const cConc = S.cue('conclusion', 6.55);
  const cOld = S.cue('old-floor', 13.17);
  const cNew = S.cue('new-lamp', 18.32);
  const cSort = S.cue('sort', 22.92);

  // ---- title block: fully composed from lesson frame 0 (local -1.6), so any poster frame shows the card
  K.eyebrow('00.03 · Orientation', 960, L.eyebrowY, { align: 'center', size: 20, tracking: 4 });
  K.title('How old is all this?', 960, L.titleY, { size: 84, align: 'center' });
  // the purpose line: what this lesson teaches (said first, shown from the first frame)
  K.text("You'll learn how old your tools are, and why it matters.", 960, L.purposeY,
    { font: 'read', size: 34, color: C.strong, align: 'center' });
  // [[conclusion]] the one-line conclusion, plain words (the street metaphor only arrives in 04)
  K.rise(t, cConc, () => K.text('Almost everything is decades old. Only the AI layer is new.', 960, L.conclusionY + 10,
    { font: 'read', size: 32, color: C.body, align: 'center' }), 16, 0.6);

  // ---- the street of years ('title' preset): it works under the voice from the first sentence
  // "how old the tools you build with really are": the grey axis draws itself left to right toward the
  // (already hanging, unlit) lanterns at its far end
  const tHow = S.find('how', 0, 1.85), tAre = S.find('are', 0, 3.84);
  const draw = K.lerp(M.Y0, M.Y1, K.io(t, tHow - 0.05, tAre + 0.45 - tHow, 'io'));
  // "why their age matters": the decade ticks fade in along it
  const ticks = K.io(t, S.find('why', 0, 4.66) - 0.1, 1.0, 'out');
  // "decades": the gold warms the old 85 % of the street (1965 → 2016), a soft glow riding its front;
  // [[new-lamp]] the lit line runs on to the end with the lanterns
  const tDec = S.find('decades', 0, 8.86);
  const kWarm = K.io(t, tDec - 0.1, 1.2, 'io');
  const kNewLine = K.io(t, cNew, 0.8, 'io');
  const litTo = kNewLine > 0 ? K.lerp(2016, 2026, kNewLine) : K.lerp(M.Y0, 2016, kWarm);

  // [[old-floor]] the four ghost tags hang on their spoken words (names only), and the street steps up to full presence
  const kOld = K.io(t, cOld - 0.1, 1.0, 'out');
  const hangAt = [
    S.find('terminal', 0, cOld + 0.18),
    S.find('files', 0, cOld + 1.1),
    S.find('web', 0, cOld + 2.25),
    S.find(/^git/, 0, cOld + 3.05),
  ].map((x) => x - 0.12);
  const show = (i) => K.io(t, hangAt[i], M.motion.hang, 'out');

  // lanterns light one by one on "The AI tools"; the first one's light carries the scene's single 'back'
  const lamp = (i) => (i === 0 ? K.io(t, cNew, M.motion.light, 'back') : K.stagger(t, cNew, i, 0.15, M.motion.light));
  const swell = Math.max(0, lamp(0) - 1);          // the overshoot, shown as a brief extra glow
  // "only the AI layer on top is new": the unlit lantern string gives one clear pulse, left to right (a warm
  // breath that rises and falls back to dark paper; the real lighting waits for [[new-lamp]]); their three
  // street nodes blush terracotta with them (M.street mixes the nodes by lantern light)
  const tLayer = S.find('AI', 1, 10.77) - 0.15;
  const pulse = (i) => 0.42 * M.bump(t, tLayer + i * 0.14, 1.7);
  const lanternK = (i) => Math.max(K.clamp(lamp(i)), t < cNew ? pulse(i) : 0);

  // the whole street steps up from a soft ghost to full presence as its buildings hang
  const streetA = K.lerp(0.8, 1, kOld);

  const gm = M.street(t, {
    geom: 'title',
    draw,
    litTo: Math.min(litTo, draw),
    ghost: 0.6,
    ticks,
    items: L.ghostItems,
    mode: 'name',
    show,
    itemAlpha: 0.75,
    lanterns: lanternK,
    lanternGlow: 1 + 3 * swell,
    alpha: streetA,
  });

  // the warm front: a soft gold glow travels with the lit edge while it moves (gone once it settles at 2016)
  if (kWarm > 0 && kWarm < 1) {
    const env = Math.sin(Math.PI * kWarm);
    K.glow(M.X(litTo, gm), gm.y, 90, C.head, 0.32 * env);
  }
  // the drawing front: a faint cool glint leads the grey street while it draws in
  const kDraw = K.seg(draw, M.Y0, M.Y1);
  if (kDraw > 0 && kDraw < 1) K.glow(M.X(draw, gm), gm.y, 50, C.body, 0.14 * Math.sin(Math.PI * kDraw));

  // "still changing": a terracotta pill that rises under the lanterns on "still"
  const tStill = S.find('still', 0, 20.92);
  const lx = (M.lanternX(gm, 0) + M.lanternX(gm, 2)) / 2;
  K.rise(t, tStill - 0.1, () => K.pill('still changing', lx, 600, { size: 26, color: C.accent, stroke: K.rgba(C.accent, 0.6) }), 12, 0.6);

  // ---- [[sort]] learn deeply once (the old street) · keep checking (the lantern end)
  const tLearn = S.find('learn', 1, cSort + 0.3);
  const tKeep = S.find('keep', 0, cSort + 2.0);
  const by = L.sortY - 44;
  M.bracket(gm, 1969, 2016, { k: K.io(t, tLearn - 0.15, M.motion.draw, 'io'), color: C.head, y: by, label: 'learn deeply, once' });
  M.bracket(gm, 2021, 2026, { k: K.io(t, tKeep - 0.15, M.motion.draw, 'io'), color: C.accent, y: by, label: 'keep checking' });
  });
});
