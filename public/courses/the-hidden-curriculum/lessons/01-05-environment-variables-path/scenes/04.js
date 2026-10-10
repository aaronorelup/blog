/* 01.05 · 04 — What's in the satchel
   A: the road from 03 (door shut, courier at x 1300); the camera dives into the courier's satchel.
   B: the satchel opened at the left, its cards read large in the panel: NAME = text, USERPROFILE, TEMP, the long PATH.
   C: pull back to home: the Windows master copy (two drawers, combined into one satchel), the Mac/Linux .zshrc,
      and the ways to peek. Exit: the PATH card glows, everything else at 50%. */
SCENE('04', (t, S) => {
  const M = window.M, C = K.C, L = M.L;
  K.bg();

  // ---- timing (local seconds; fallbacks from cues.json)
  const cCards = S.cue('cards', 0), cEx = S.cue('examples', 5.77), cLong = S.cue('path-long', 11.25);
  const cMaster = S.cue('master-copy', 14.13), cZsh = S.cue('zshrc', 27.19), cPeek = S.cue('peek', 31.68);
  const w = (s, n, fb) => S.find(s, n || 0, fb, { whole: true });
  const tEnv = w('environment', 0, 1.03), tName = w('name', 0, 2.61), tValue = w('value', 0, 3.31), tPlain = w('plain', 0, 4.02);
  const tHome = w('home', 0, 7.04), tTemp = w('temporary', 0, 9.44), tLongW = w('long', 0, 11.85);
  const tWin = w('windows', 0, 17.31), tDrawers = w('drawers', 0, 20.19), tYou = w('you', 0, 22.13);
  const tSystem = w('system', 0, 23.45), tCombined = w('combined', 0, 25.95);
  const tMac = w('mac', 0, 27.53), tShell = w("shell's", 0, 29.3), tWrite = w('write', 0, 30.54);
  const tScreen = w('screen', 0, 31.89), tPeekW = w('peek', 0, 33.07), tYet = w("don't", 0, 34.76);

  // PATH's folders: ONE list for the whole scene. The first five are exactly scene 05's streets (the order 07
  // observed: two system folders, then Python310, the Store's WindowsApps, miniconda3), so the card 04 hands
  // over is the card 05 opens with. A few more user folders follow (never visible in 05's faded card).
  const BS = String.fromCharCode(92), U = 'C:/Users/…/';
  const PATHS = ['C:/Windows/system32', 'C:/Windows', U + 'Python310', U + 'WindowsApps', U + 'miniconda3',
    U + 'miniconda3/Scripts', U + '.cargo/bin', U + 'AppData/Roaming/npm', U + '.local/bin', U + 'Microsoft VS Code/bin']
    .map(p => p.split('/').join(BS));
  const PATH_ALL = PATHS.join(';');
  const tagFont = { font: 'ui', weight: 600, size: 26 };
  // the panel card (w 1060, tab 340): whole entries only, ending on ';…', with ONE fixed '+ N more folders' tag
  const PW = 1060, PNW = 340;
  const panelFit = (() => {
    const tagW = K.measure('+ 10 more folders', tagFont), maxW = PW - PNW - 30 - tagW - 40;
    let out = '', n = 0;
    for (; n < PATHS.length; n++) {
      const nx = out + PATHS[n] + ';';
      if (K.measure(nx + '…', { font: 'mono', weight: 600, size: 30 }) > maxW) break;
      out = nx;
    }
    return { s: out + '…', tag: '+ ' + (PATHS.length - n) + ' more folders' };
  })();
  const panelPathCard = (o = {}) => {
    M.envCard(0, 0, { w: PW, name: 'PATH', kind: 'path', value: panelFit.s, nameW: PNW, fade: false, valueK: o.valueK, lit: o.lit });
    const tk = o.tagK == null ? 1 : o.tagK;
    if (tk > 0) K.text(panelFit.tag, PW - 26, 48 + 9, { ...tagFont, color: M.P.inkSoft, align: 'right', alpha: tk });
  };
  // the hand-over card: scene 05's opening card exactly (x 385, y 452, w 1150, h 76, mono 26, faded value)
  const HAND = { x: 385, y: 452, w: 1150, h: 76, size: 26 };

  // ---- phase weights
  const toB = K.io(t, 0.75, 0.45);                   // road -> inside the satchel
  const toC = K.io(t, cMaster + 0.5, 0.9);           // satchel moves to the door step
  const dimEnd = K.io(t, tYet, 0.8);                 // exit: everything but PATH at 50%
  const dimK = 1; // dimming is an overlay drawn under the PATH card (no see-through stacking)

  // ================= A: the road, camera dives into the satchel
  if (toB < 1) {
    const zk = K.io(t, 0, 1.1);
    const sx = 1300 + 140 * 0.48, sy = 540 + 140 * 0.3, z = K.lerp(1, 3.6, zk);
    const cx = K.lerp(960, sx + 580 / 3.6, zk), cy = K.lerp(540, sy - 20 / 3.6, zk);
    K.layer(1 - toB, () => {
      K.withCam({ x: cx, y: cy, z }, () => {
        M.door(t, { open: 0 });
        M.courier(t, 1300, 540, 140, { icon: 'terminal', alpha: 1 - K.io(t, 0.2, 0.6), satchel: false });
        M.satchel(t, sx, sy, 98, { strap: 'none', names: false, open: K.io(t, 0.35, 0.6), dot: 1 - K.io(t, 0.1, 0.4),
          cards: [{ kind: 'plain' }, { kind: 'plain' }, { kind: 'path' }] });
      });
    });
  }

  // ================= B + C: the satchel itself (one object that moves from the panel view to the door step)
  const satX = K.lerp(380, 680, toC), satY = K.lerp(560, 620, toC), satS = K.lerp(360, 300, toC);
  // which chip is lifted (the one being read)
  const env = (a, b) => K.env(t, a, b, 0.45);
  const lift0 = Math.max(env(cCards + 0.6, cEx), env(tHome - 0.5, tTemp - 0.2));
  const lift1 = env(tTemp - 0.2, tLongW - 0.3);
  const lift2 = Math.max(env(tLongW - 0.3, cMaster + 0.2), K.io(t, tPeekW - 0.2, 0.5));
  // the three cards go back into the bag on "Where does the first satchel..."
  const backIn = K.io(t, cMaster, 0.7);

  // ---- C: home, the drawers, the .zshrc (drawn under the satchel)
  if (toC > 0) {
    const dA = K.io(t, cMaster + 0.7, 0.7);
    const drawers = K.io(t, tDrawers - 0.2, 0.6);
    const lit = t >= tCombined - 0.4 ? null : t >= tSystem - 0.2 ? 'system' : t >= tYou - 0.1 ? 'user' : null;
    K.layer(dimK, () => {
      M.door(t, { open: 0, drawers, drawerLit: drawers > 0.9 ? lit : null, alpha: dA, glow: 0.3 * drawers });
      M.eyebrow('Windows', 240, 172, { alpha: K.io(t, tWin, 0.5) });
      M.label('the master copy', 240, 224, { alpha: K.io(t, w('master', 0, 18.27), 0.5), size: 26, color: C.body });
      // both drawers flow into the one satchel at the door
      const ak = K.io(t, tCombined - 0.5, 0.8);
      const L0 = L.door, uY = L0.y + L0.h * 0.38 + 52, sY = uY + 130;
      if (ak > 0) {
        K.arrow(L0.x + L0.w - 14, uY, satX - satS * 0.42, satY - 30, { k: ak, color: K.rgba(C.head, 0.8), w: 3, dash: [10, 8], bend: -30 });
        K.arrow(L0.x + L0.w - 14, sY, satX - satS * 0.42, satY + 10, { k: ak, color: K.rgba(C.head, 0.8), w: 3, dash: [10, 8], bend: 30 });
        M.label('user + system, combined', satX, satY + satS * 0.34 + 66, { alpha: K.io(t, tCombined, 0.5), size: 26, color: C.strong });
      }
      // Mac / Linux: the shell's startup files write it
      const fx = 1560, fy = 610;
      M.eyebrow('Mac · Linux', fx, 470, { alpha: K.io(t, tMac, 0.5) });
      const fk = K.io(t, tShell - 0.1, 0.5, 'out');
      if (fk > 0) K.file(fx, fy + (1 - fk) * 30, 150, { ext: 'zshrc', name: '~/.zshrc', nameSize: 26, alpha: fk });
      const wk = K.io(t, tWrite - 0.1, 0.7);
      if (wk > 0) {
        K.arrow(fx - 90, fy - 10, satX + satS * 0.55, satY - 10, { k: wk, color: K.rgba(C.head, 0.8), w: 3, dash: [10, 8], bend: -40 });
        M.label('startup file writes it', fx, fy + 170, { alpha: K.io(t, tWrite, 0.5), size: 26, color: C.strong });
      }
    });
  }

  // ---- the satchel (visible from B on)
  if (toB > 0) {
    const chipsAlpha = 1;
    K.layer(toB, () => {
      M.satchel(t, satX, satY, satS, { strap: 'handle', open: 1, names: true, glow: 0.35,
        cards: [
          { kind: 'plain', lift: lift0, w: 92, alpha: chipsAlpha },
          { kind: 'plain', lift: lift1, w: 92, alpha: chipsAlpha },
          { kind: 'path', name: 'PATH', size: 26, lift: lift2, lit: Math.max(lift2, 0.0001) > 0.3 ? lift2 : 0, w: 96 },
        ] });
    });
  }

  // ---- B: the cards, read large in the panel
  const P = L.panel, cx0 = P.x;
  if (toB > 0 && backIn < 1) {
    // a card leaves the satchel (from its left) and settles at (cx0, y); k 0..1; back: 0..1 flies home
    const slot = (k, y, fn) => {
      const e = K.ease.io(K.clamp(k)), b = K.ease.io(backIn);
      const s = K.lerp(0.35, 1, e) * K.lerp(1, 0.2, b);
      const x = K.lerp(satX + 40, cx0, e), yy = K.lerp(satY - 120, y, e);
      const bx = K.lerp(x, satX - 20, b), by = K.lerp(yy, satY - 140, b);
      K.layer(Math.min(1, e * 2.5) * (1 - b) * toB, () => K.at(bx, by, s, 0, fn));
    };
    M.eyebrow('Environment variables', cx0, 290, { align: 'left', alpha: toB * K.io(t, tEnv, 0.5) * (1 - backIn) });

    // the generic card: NAME + plain text
    const gIn = K.io(t, tEnv - 0.1, 0.6), gOut = K.io(t, cEx, 0.5);
    if (gIn > 0 && gOut < 1) {
      K.layer(1 - gOut, () => {
        slot(gIn, 450, () => {
          const tabA = K.io(t, tName - 0.2, 0.4);
          M.envCard(0, 0, { w: 1000, name: 'NAME', value: 'just plain text', valueK: K.io(t, tValue, 1.0, 'lin'), fade: false, nameW: 220, lit: 0.6 * tabA * (1 - K.io(t, tValue, 0.4)) });
        });
        K.spans([
          { s: 'a name', color: C.strong, alpha: K.io(t, tName, 0.4) },
          { s: '  +  a value: ', color: C.body, alpha: K.io(t, tValue, 0.4) },
          { s: 'always text', color: C.head, alpha: K.io(t, tPlain, 0.4) },
        ], cx0 + 500, 620, { align: 'center', size: 30, font: 'ui' });
      });
    }

    // the three examples, stacked on a 130 px pitch
    const ys = [360, 490, 620];
    const kU = K.io(t, tHome - 0.55, 0.6), kT = K.io(t, tTemp - 0.25, 0.6), kP = K.io(t, tLongW - 0.35, 0.7);
    if (kU > 0) slot(kU, ys[0], () => {
      M.envCard(0, 0, { w: 1060, name: 'USERPROFILE', value: 'C:\\Users\\you', nameW: 340, fade: false });
      K.text('HOME on Mac · Linux', 1060 - 30, 48 + 9, { font: 'ui', weight: 600, size: 26, color: M.P.inkSoft, align: 'right' });
    });
    if (kT > 0) slot(kT, ys[1], () => M.envCard(0, 0, { w: 1060, name: 'TEMP', value: 'C:\\Users\\you\\AppData\\Local\\Temp', nameW: 340, fade: false }));
    if (kP > 0) {
      // PATH: the folders type in, whole entries only, ending on ';…' with the rest counted
      slot(kP, ys[2], () => panelPathCard({ valueK: K.io(t, tLongW - 0.2, 1.1, 'lin'), tagK: K.io(t, tLongW + 0.8, 0.4),
        lit: K.io(t, w('path', 0, 13.05) - 0.1, 0.5) }));
      M.label('one long card', cx0 + 530, ys[2] + 150, { alpha: K.io(t, tLongW, 0.5) * (1 - backIn), color: C.head, size: 26 });
    }
  }

  // ---- C, last beat: how to peek (screen only), and the PATH card lifted out, glowing
  if (t > cPeek - 0.2) {
    const py = 862;
    const items = [
      // each way to peek sits under its platform: Windows (satchel + dialog) left, Mac · Linux (.zshrc) right
      { s: '$env:PATH', x: 680, font: 'mono' },
      { s: 'Environment Variables dialog', x: 1110, font: 'ui' },
      { s: 'echo $PATH', x: 1560, font: 'mono' },
    ];
    K.layer(dimK, () => {
      const wk = K.io(t, tScreen + 0.6, 0.5);
      if (wk > 0) {
        const r = K.win(890, 670, 440, 150, { kind: 'explorer', title: 'Environment Variables', titleSize: 26, alpha: wk });
        K.layer(wk, () => {
          ['user', 'system'].forEach((nm, i) => {
            K.text(nm, r.x + 22, r.y + 34 + i * 40, { font: 'ui', weight: 600, size: 26, color: C.body });
            K.line(r.x + 130, r.y + 25 + i * 40, r.x + r.w - 40, r.y + 25 + i * 40, { color: C.line2, w: 3 });
          });
        });
      }
      items.forEach((it, i) => {
        const k = K.stagger(t, tScreen, i, 0.3, 0.5);
        if (k > 0) K.pill(it.s, it.x, py + (1 - k) * 16, { font: it.font, size: 28, alpha: k, fill: C.tile, stroke: C.line2, color: C.strong });
      });
    });
    // exit: on "you don't need it yet" everything but PATH settles back; the card glides to scene 05's opening slot
    const handK = K.io(t, tYet + 0.1, 1.1);
    const dimA = 0.5 * dimEnd + 0.35 * handK;
    if (dimA > 0) { const g = K.ctx(); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = K.rgba(C.page, dimA); g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore(); }
    // PATH lifted out of the satchel to read large (top, w 1200, mono 30), then handed over to 05's card
    const pk = K.io(t, tPeekW, 0.8);
    if (pk > 0) {
      const e = K.ease.io(pk), h = handK;
      const s0 = K.lerp(0.25, 1, e);
      const x = K.lerp(K.lerp(satX + 20, 560, e), HAND.x, h), y = K.lerp(K.lerp(satY - 200, 200, e), HAND.y, h);
      const cw = K.lerp(1200, HAND.w, h), ch = K.lerp(96, HAND.h, h), sz = K.lerp(30, HAND.size, h);
      const lit = K.lerp(K.io(t, tPeekW + 0.4, 0.6), 1, h);
      K.layer(Math.min(1, pk * 2), () => K.at(x, y, s0, 0, () =>
        M.envCard(0, 0, { w: cw, h: ch, size: sz, name: 'PATH', kind: 'path', value: PATH_ALL, lit })));
    }
  }
});
