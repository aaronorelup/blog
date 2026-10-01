// 08 — Safe to ignore for now
// The road waits dimmed behind a "later" tray. Things that look important settle into the tray as they are
// named; then the tray is set aside, the road brightens and a pin marks "your computer" (you are here).
SCENE('08', (t, S) => {
  const C = K.C;
  // the "later" tray: wider than the shared tray (430..1490) so it fully covers stops 2-4 of the dimmed road,
  // and tall enough for three left-aligned rows with clear space between them
  const T = { x: 430, y: 270, w: 1060, h: 500 };
  K.bg();

  // ---- times (beats land on the spoken word)
  const tTray = 0.25;                                   // "Some things look important and can wait."
  const tRouter = S.find('routers', 0, S.cue('packets', 2.45));
  const tPacket = S.find('inside', 0, tRouter + 2.2);
  const tCloud = S.cue('which-cloud', 6.78);
  const tAcro = S.cue('acronyms', 9.12);
  const tSettle = S.find('screen', 0, tAcro + 2.2);     // the settings window settles into the tray
  const tAside = S.find(/^now/i, 0, 12.7);              // "For now," — tray set aside
  const tStop = S.find('stop', 0, 15.0);                // "which stop you're standing at"
  const tStand = S.find('standing', 0, 15.6);

  // ---- the road: dims to 0.15 while the tray is up, brightens back once the tray is set aside
  const bright = K.io(t, tAside + 0.5, 0.8);   // starts once the tray is nearly gone
  const under = K.io(t, tTray, 0.7) * (1 - K.io(t, tAside + 0.6, 0.4));   // road stays at 0.15 until the tray has faded
  const roadA = K.lerp(K.lerp(0.35, 0.15, under), 0.8, bright);
  // 07 ends on the 'lantern' road (y 560): start there so the crossfade shows one road, then settle to std
  const gm = M.road(t, { geom: M.lerpGeom('lantern', 'std', K.io(t, 0.15, 0.7)), alpha: roadA });
  // stop 1 ("your computer") comes up to full strength, with one gentle swell on "standing"
  const c0 = gm.cards[0];
  const hereK = K.io(t, tStop, M.motion.light);
  if (hereK > 0) M.stop(gm, 0, { lit: 1, alpha: hereK * 0.9, pulse: M.bump(t, tStand, 0.9) });

  // ---- the "later" tray
  const trayIn = K.io(t, tTray, 0.7);
  // set aside in two steps so nothing half-transparent ever sits over the road: the contents fade first,
  // then the (still opaque) card fades; the road only brightens after that
  const aside = K.io(t, tAside, 0.45);
  const contentA = (1 - aside) * (1 - aside);
  const cardA = trayIn * (1 - K.io(t, tAside + 0.3, 0.45));
  const trayDy = (1 - trayIn) * 24 + K.io(t, tAside + 0.3, 0.45) * 30;
  if (cardA > 0.001) {
    K.layer(cardA, () => {
      const x = T.x, y = T.y + trayDy, w = T.w, h = T.h;
      K.card(x, y, w, h, { fill: C.tile, stroke: C.line2, r: 28 });
      K.layer(contentA, () => {
      K.eyebrow('Safe to ignore for now', x + w / 2, y + 58, { align: 'center', size: 22 });
      K.line(x + 60, y + 84, x + w - 60, y + 84, { color: C.line, w: 1.5, alpha: 0.8 });

      const dy = y - T.y;
      const iconX = x + 90, colX = x + 150;           // one icon column, one left edge for every chip
      const pillW = (str) => K.measure(str, { size: 32, font: 'ui', weight: 600 }) + 32 * 1.6;
      // a pill (left edge at lx) that drops into place and then settles (dims slightly) once it has landed
      const drop = (str, lx, py, at) => {
        const k = K.io(t, at, 0.5, 'out');
        const w = pillW(str);
        if (k <= 0) return w;
        const settle = K.io(t, at + 1.0, 0.6);
        K.pill(str, lx + w / 2, py + dy - (1 - k) * 40, { size: 32, alpha: k * (1 - 0.25 * settle), color: C.strong });
        return w;
      };
      const rowIcon = (name, py, at) => {
        const a = K.io(t, at, 0.6) * 0.75;
        if (a > 0) K.icon(name, iconX, py + dy, 40, { color: C.soft, alpha: a });
      };
      const r1 = T.y + 150, r2 = T.y + 240, r3 = T.y + 330;
      // row 1: networking internals
      rowIcon('wifi', r1, tRouter);
      const w1 = drop('router paths', colX, r1, tRouter);
      drop('packet insides', colX + w1 + 24, r1, tPacket);
      // row 2: cloud shopping
      rowIcon('cloud', r2, tCloud);
      drop('which cloud is best', colX, r2, tCloud);
      // row 3: the settings screen full of acronyms, which slides down a little and fades to 0.4
      rowIcon('gear', r3, tAcro);
      const wk = K.io(t, tAcro, 0.5, 'out');
      if (wk > 0) {
        const sk = K.io(t, tSettle, 0.7);
        const ww = 560, wh = 150;
        const wy = r3 + dy - 34 - (1 - wk) * 30 + 10 * sk;
        const wa = wk * K.lerp(1, 0.4, sk);
        const rect = K.win(colX, wy, ww, wh, { title: 'Network settings', kind: 'notepad', alpha: wa, shadow: false });
        K.text('DNS · DHCP · subnet mask', rect.x + rect.w / 2, rect.y + rect.h / 2 + 10, { font: 'mono', size: 26, color: C.body, align: 'center', alpha: wa });
      }
      });
    });
  }

  // ---- you are here: the pin drops onto stop 1's roof on "stop"
  M.pin(t, tStop, c0.roof.x, c0.roof.y - 6, { s: 48 });
});
