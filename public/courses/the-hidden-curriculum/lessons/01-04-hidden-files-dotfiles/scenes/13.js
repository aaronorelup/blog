/* 01.04 · 13 Safe to ignore for now. A corner of the home back room with closed boxes you can leave shut.
   Beats (local seconds, cues.json):
     - [[ignore]] 0          12's dim frame (shop + home room) lifts: the shop sinks further back, the home back
                             room glides to the centre of the screen (scaled 1.15 about its own centre, so it is
                             framed like a camera move but centred at x 960). AppData steps aside; header line
                             "safe to ignore, for now" beside the house.
       "other" ~1.9          box 1 "~/.cache ~/.local" drops onto the floor of the home room;
       "config" ~3.3         ~/.config's folder icon gets a brief gold ring (icon only, the name stays outside).
       "hidden" ~5.8         box 2 "~/Library (Mac)".
       "Which" ~8.0          box 3 "which file wins?" stacks on box 1.
     - [[dotfiles-repos]] ~11.1  box 4 "dotfiles repos" stacks on box 2.
       "Recognise" ~15.3     all four boxes settle to 0.75: names known, lids left shut.
   First frame: 12's exit (dim shop, home room with AppData, page overlay). Last frame: home room centred, calm. */
SCENE('13', (t, S) => {
  const C = K.C, P = M.palette, g = K.ctx();
  K.bg();

  const c0 = S.cue('ignore', 0);
  const tOther = S.find('other', 0, 1.87);
  const tConfig = S.find('config', 0, 3.56);
  const tHidden = S.find('hidden', 0, 5.82);
  const tWhich = S.find('Which', 0, 8.03);
  const tRepos = S.cue('dotfiles-repos', 11.12);
  const tRecog = S.find('Recognise', 0, 15.31);

  const setK = K.io(t, c0 + 0.1, 0.8, 'io');          // the move: shop recedes, home room comes to the centre

  // ---- 12's exit state: shop without its back room, door or sign, under a page overlay
  M.shop(t, { roomK: 0, door: { alpha: 0 }, sign: { alpha: 0 }, porter: { alpha: 1 } });
  g.save(); g.fillStyle = K.rgba(C.page, 0.64 + 0.36 * setK); g.fillRect(0, 0, 1920, 1080); g.restore();

  // ---- the home back room, moved from its layout spot to the screen centre
  const Hm = M.layout.home;
  const gx = Hm.x + Hm.w / 2, gy = (Hm.house.y - 38 + Hm.y + Hm.h) / 2;   // group centre (house top .. card bottom)
  const S1 = 1.15;
  const cx = K.lerp(gx, 960, setK), cy = K.lerp(gy, 540, setK), sc = K.lerp(1, S1, setK);

  K.at(cx, cy, sc, 0, () => K.at(-gx, -gy, 1, 0, () => {
    const homeA = 0.36 + 0.64 * setK;                  // under 12's overlay at first, then fully lit
    // opaque backing so the shop and porter never show through the card while it moves
    const bk = K.io(t, c0, 0.35, 'io');
    if (bk > 0) K.card(Hm.x, Hm.y, Hm.w, Hm.h, { r: 24, fill: P.room, stroke: 'rgba(0,0,0,0)', shadow: false, alpha: bk });
    M.home(t, { alpha: homeA, k: 1, configK: 1, looseK: 1, appdataK: 1 - setK, roomsK: 1 - setK });

    // 12's leftover .gemini, carried in and faded out with the move (continuity with 12's last frame)
    const gemA = homeA * 0.8 * (1 - setK);
    if (gemA > 0.01) { const sp = M.HOME.loose[4]; M.item(sp.x, sp.y, 60, { name: '.gemini', size: 26, color: '#6E5A3E', alpha: gemA }); }

    // ~/.config: a ring around the folder icon only; the name sits below, outside it
    const Cf = M.HOME.config;
    const ringK = K.io(t, tConfig - 0.1, 0.6, 'io') * (1 - K.io(t, tHidden - 0.4, 0.6, 'io'));
    if (ringK > 0) {
      K.glow(Cf.x, Cf.y - 10, 70, C.head, 0.18 * ringK);
      K.ring(Cf.x, Cf.y - 10, 66, 40, ringK, { color: C.head, w: 4, rot: 0 });
    }

    // header beside the house (where 05's "your settings" line sat)
    const headK = K.io(t, c0 + 0.4, 0.6, 'io');
    if (headK > 0) {
      K.icon('clock', Hm.house.x + 140, Hm.house.y + 4, 32, { color: C.soft, w: 2.5, alpha: headK });
      K.text('safe to ignore, for now', Hm.house.x + 172, Hm.house.y + 14, { ...M.type.read, color: C.strong, alpha: headK });
    }

    // ---- a closed carton: wood body, a lid band with tape, a cream label on the face
    function box(x, y, w, h, k, alpha, label) {
      if (k <= 0) return;
      const a = k * alpha, dy = (1 - k) * -30;
      K.layer(a, () => K.at(0, dy, 1, 0, () => {
        K.card(x, y, w, h, { r: 8, fill: P.wood, stroke: P.woodEdge, shadow: true });
        g.save(); K.rr(x, y, w, 20, 8); g.fillStyle = P.woodTop; g.fill(); g.restore();
        K.line(x + 4, y + 20, x + w - 4, y + 20, { color: P.woodEdge, w: 2 });
        g.save(); g.fillStyle = K.rgba(P.paperShade, 0.55); g.fillRect(x + w / 2 - 14, y, 28, 30); g.restore();
        label(x + 24, y + h / 2 + 22);
      }));
    }

    const settle = 1 - 0.25 * K.io(t, tRecog - 0.1, 0.8, 'io');
    const drop = (at) => K.io(t, at - 0.05, 0.55, 'out');
    const B = { h: 84, row1: 770, row0: 680 };
    const mono = { size: 30, color: C.strong };
    const ui = { font: 'ui', weight: 600, size: 30, color: C.strong };

    box(1130, B.row1, 360, B.h, drop(tOther), settle, (x, y) => M.dotName('~/.cache ~/.local', x, y, mono));
    box(1510, B.row1, 300, B.h, drop(tHidden), settle, (x, y) => {
      const w = M.dotName('~/Library', x, y, mono);
      K.text('(Mac)', x + w + 12, y, ui);
    });
    box(1160, B.row0, 300, B.h, drop(tWhich), settle, (x, y) => K.text('which file wins?', x, y, ui));
    box(1530, B.row0, 270, B.h, drop(tRepos), settle, (x, y) => K.text('dotfiles repos', x, y, ui));
  }));
});
