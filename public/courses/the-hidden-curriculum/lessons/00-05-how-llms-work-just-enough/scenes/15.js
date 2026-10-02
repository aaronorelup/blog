/* 15 — Individual vs enterprise
   The same workspace twice: a house (individual plans) on the left, a company building (Team / Enterprise) on the right.
   Same clerk, different building rules. Home: plans differ mostly in usage; consumer chats may train the model unless switched off.
   Company: single sign-on, admin allow-list, audit logs, retention, instruction files pushed to every machine; not trained on by default,
   notice before changes. Since Apr 2026 a subscription can't power third-party agents (OpenClaw): billed separately. */
SCENE('15', (t, S) => {
  K.bg();
  const C = K.C, P = M.palette, g = K.ctx();
  const W = (re, n, fb) => S.find(re, n, fb);

  // ---- cue / word times (local seconds)
  const cHome = S.cue('home', 3.08), cCo = S.cue('company', 19.31), cNT = S.cue('no-training', 36.36), cTP = S.cue('third-party', 42.74);
  const wFree = W(/^free/i, 0, cHome + 1.6), wPro = W(/^pro$/i, 0, cHome + 2.3), wMax = W(/^max/i, 0, cHome + 3.3);
  const wMostly = W(/^mostly/i, 0, cHome + 4.4), wHow = W(/^how$/i, 0, cHome + 5.5);
  const wSince = W(/^since$/i, 0, cHome + 7.3), wTrain = W(/^training$/i, 0, cHome + 13.6), wOff = W(/^off\.?$/i, 0, cHome + 15.1);
  const wSSO = W(/^single/i, 0, cCo + 3.5), wAdmins = W(/^admins$/i, 0, cCo + 5.5);
  const wConn = W(/^connectors/i, 0, cCo + 7.3), wPlug = W(/^plugins$/i, 0, cCo + 8.4), wSkills = W(/^skills$/i, 0, cCo + 9.2);
  const wAudit = W(/^audit/i, 0, cCo + 10.9), wRet = W(/^custom/i, 0, cCo + 11.8);
  const wInstr = W(/^instruction/i, 0, cCo + 14.3), wPushed = W(/^pushed/i, 0, cCo + 15.3);
  const wNotice = W(/^notice/i, 0, cNT + 3.4);
  const wApril = W(/^april/i, 0, cTP + 0.3), wSub = W(/^subscription/i, 0, cTP + 1.3), wIncl = W(/^included/i, 0, cTP + 2.1);
  const wThird = W(/^third-party/i, 0, cTP + 3.9), wOC = W(/^openclaw/i, 0, cTP + 5.2);
  const wBilled = W(/^billed/i, 0, cTP + 7.1), wUsage = W(/^usage$/i, 1, cTP + 8.4), wPlans = W(/^plans$/i, 2, cTP + 11);

  // ---- light: both buildings dim at first; each lights when named; the home side steps back while the company talks,
  //      the company steps back during the third-party beat; both settle lit at the end
  const homeOn = K.io(t, cHome, 0.7), coOn = K.io(t, cCo, 0.7), tpOn = K.io(t, cTP, 0.7), endOn = K.io(t, wPlans, 0.8);
  const litL = 0.3 + 0.7 * homeOn - 0.35 * coOn * (1 - tpOn) ;
  const litR = Math.max(0.3, 0.3 + 0.7 * coOn - 0.45 * tpOn * (1 - endOn));
  const aR = 1 - 0.4 * tpOn * (1 - endOn);           // the company side fades back while the home side shows the plug
  const strokeFor = (lit) => K.mixColor(C.line2, C.head, 0.75 * lit);

  // ---- divider
  K.line(960, 210, 960, 820, { color: C.line2, w: 2, alpha: 0.45, dash: [6, 10] });

  // ================================================================ LEFT: the house (individual plans)
  const HX0 = 140, HX1 = 880, HTOP = 300, HBOT = 848, HCX = 510;
  // walls
  K.card(HX0, HTOP, HX1 - HX0, HBOT - HTOP, { r: 16, fill: K.rgba(C.tile, 0.82), stroke: strokeFor(litL), lw: 1.5 + litL, glow: 0.25 * litL });
  // roof (with a chimney)
  g.save();
  g.fillStyle = K.rgba(C.tile, 0.92); g.strokeStyle = strokeFor(litL); g.lineWidth = 1.5 + litL; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(735, 205); g.lineTo(735, 150); g.lineTo(785, 150); g.lineTo(785, 225); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(100, HTOP); g.lineTo(HCX, 150); g.lineTo(920, HTOP); g.closePath(); g.fill(); g.stroke();
  g.restore();
  K.text('Individual', HCX, 278, { font: 'head', weight: 700, size: 38, color: K.mixColor(C.soft, C.head, litL), align: 'center', tracking: -0.5 });
  // the same workspace (cord hangs from the ceiling at y 300)
  M.mini(t, HCX, 452, 0.46, { lit: 0.3 + 0.7 * litL });

  // plans: Free / Pro / Max with how much you can use
  const homeLow = 1 - K.io(t, cTP, 0.6);              // the lower area clears for the third-party beat
  const plans = [['Free', wFree, 80], ['Pro', wPro, 230], ['Max', wMax, 500]];
  K.layer(homeLow, () => {
    K.text('mostly: how much you can use', HCX, 584, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: K.io(t, wMostly, 0.5) });
    plans.forEach(([name, at, len], i) => {
      const y = 630 + i * 50, k = K.io(t, at, 0.5);
      if (k <= 0) return;
      K.layer(k, () => {
        K.pill(name, 240, y + (1 - k) * 10, { size: 26, color: C.head, stroke: K.rgba(C.head, 0.5) });
        // usage bar: empty track, then the plan's share grows
        const bk = K.io(t, wHow + i * 0.18, 0.8, 'out');
        K.card(312, y - 9, 520, 18, { r: 9, fill: K.rgba(C.page, 0.6), stroke: K.rgba(C.line2, 0.8), shadow: false });
        if (bk > 0) K.card(312, y - 9, Math.max(18, len * bk), 18, { r: 9, fill: K.rgba(C.head, 0.85), stroke: false, shadow: false });
      });
    });
  });

  // training toggle (consumer): on by default, you can switch it off
  const toggle = (x, y, on, a, coldOff) => {
    K.layer(a, () => {
      const col = K.mixColor(P.cold, C.head, on);
      K.card(x, y - 17, 64, 34, { r: 17, fill: K.rgba(C.page, 0.8), stroke: col, lw: 2, shadow: false });
      if (on > 0) K.card(x, y - 17, 64, 34, { r: 17, fill: K.rgba(C.head, 0.3 * on), stroke: false, shadow: false });
      g.save(); g.fillStyle = col; g.beginPath(); g.arc(x + 17 + 30 * on, y, 12, 0, Math.PI * 2); g.fill(); g.restore();
    });
  };
  // the label is there from the toggle's first frame and reads "on by default"; the switch flips only on "turn that off"
  const wTurn = W(/^turn$/i, 0, cHome + 14.7);
  const tgA = K.io(t, wSince, 0.6) * homeLow;
  if (tgA > 0) K.layer(tgA, () => K.at(0, (1 - K.io(t, wSince, 0.6)) * 14, 1, 0, () => {
    K.card(160, 770, 700, 66, { r: 16, fill: K.rgba(C.tile, 0.95), stroke: C.line2, shadow: false });
    const on = 1 - K.io(t, wTurn, Math.max(0.4, wOff - wTurn + 0.2));
    K.text('training on your chats', 184, 812, { font: 'ui', weight: 600, size: 26, color: C.strong });
    toggle(496, 803, on, 1);
    const st = { font: 'mono', weight: 600, size: 26 };
    K.text('on by default', 580, 812, { ...st, color: C.head, alpha: K.clamp(on * 2 - 1, 0, 1) });
    K.text('switched off', 580, 812, { ...st, color: P.cold, alpha: K.clamp(1 - on * 2, 0, 1) });
  }));
  // dated tag in the top-left corner: autumn 2025 for the training change, then Apr 2026 for the third-party rule
  M.dated('since autumn 2025', 100, 176, { alpha: K.io(t, wSince, 0.5) * (1 - K.io(t, cTP - 0.6, 0.5)) });

  // ---- third-party agents: OpenClaw can't plug into the subscription; it is billed separately
  if (tpOn > 0) {
    const subK = K.io(t, wSub, 0.6);
    K.layer(subK, () => K.at(0, (1 - subK) * 12, 1, 0, () => {
      K.card(560, 588, 300, 90, { r: 16, fill: K.rgba(C.tile, 0.95), stroke: K.rgba(C.head, 0.6), lw: 2, shadow: false, glow: 0.25 });
      K.text('your subscription', 710, 624, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center' });
      const bk = K.io(t, wIncl, 0.8, 'out');
      K.card(592, 646, 236, 14, { r: 7, fill: K.rgba(C.page, 0.6), stroke: K.rgba(C.line2, 0.8), shadow: false });
      if (bk > 0) K.card(592, 646, Math.max(14, 150 * bk), 14, { r: 7, fill: K.rgba(C.head, 0.85), stroke: false, shadow: false });
    }));
    const ocK = K.io(t, wThird, 0.6);
    K.layer(ocK, () => K.at((1 - ocK) * -30, 0, 1, 0, () => {
      K.iconTile('sparkle', 250, 632, 92, { stroke: K.rgba(C.accent, 0.8), color: C.accent });
      K.text('OpenClaw', 250, 716, { font: 'ui', weight: 600, size: 26, color: C.strong, align: 'center', alpha: K.io(t, wOC - 0.3, 0.5) });
    }));
    // the plug tries, and stops short
    const plugK = K.io(t, wThird + 0.4, 0.7);
    M.phone(t, 300, 632, 470, 632, { k: plugK, alpha: 0.9 * (1 - 0.5 * K.io(t, wBilled, 0.6)) });
    const crossK = K.io(t, wThird + 1.0, 0.5, 'back');
    if (crossK > 0) K.at(498, 632, 0.6 + 0.4 * crossK, 0, () => {
      K.icon('cross', 0, 0, 40, { color: C.accent, w: 4, alpha: Math.min(1, crossK) * (1 - 0.4 * K.io(t, wBilled, 0.6)) });
    });
    // rerouted: billed separately, by usage or an API key
    M.phone(t, 290, 666, 556, 796, { k: K.io(t, wBilled - 0.1, 0.7), bend: 40, head: true, pulse: true });
    const bK = K.io(t, wBilled + 0.3, 0.6);
    K.layer(bK, () => K.at(0, (1 - bK) * 12, 1, 0, () => {
      K.card(560, 752, 300, 88, { r: 16, fill: K.rgba(C.tile, 0.95), stroke: K.rgba(C.accent, 0.7), lw: 2, shadow: false });
      K.text('billed separately', 710, 788, { font: 'ui', weight: 600, size: 26, color: C.accent, align: 'center' });
      K.text('usage or API key', 710, 822, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center', alpha: K.io(t, wUsage, 0.5) });
    }));
    M.dated('since Apr 2026', 100, 176, { alpha: K.io(t, wApril, 0.5) });
  }

  // ================================================================ RIGHT: the company building (Team / Enterprise)
  const BX0 = 1020, BX1 = 1800, BTOP = 196, BBOT = 848, BCX = 1410;
  K.layer(aR, () => {
    K.card(BX0 - 16, BTOP - 20, BX1 - BX0 + 32, 24, { r: 8, fill: K.rgba(C.tile, 0.95), stroke: strokeFor(litR), lw: 1.5 + litR, shadow: false });
    K.card(BX0, BTOP, BX1 - BX0, BBOT - BTOP, { r: 14, fill: K.rgba(C.tile, 0.82), stroke: strokeFor(litR), lw: 1.5 + litR, glow: 0.25 * litR });
    K.text('Team · Enterprise', BCX, 254, { font: 'head', weight: 700, size: 38, color: K.mixColor(C.soft, C.head, litR), align: 'center', tracking: -0.5 });
    K.line(BX0 + 30, 284, BX1 - 30, 284, { color: C.line2, w: 1.5, alpha: 0.7 });
    M.mini(t, BCX, 452, 0.46, { lit: 0.3 + 0.7 * litR });

    const item = (at, fn) => { const k = K.io(t, at, 0.5); if (k > 0) K.layer(k, () => K.at(0, (1 - k) * 10, 1, 0, fn)); };
    // single sign-on at the door
    item(wSSO, () => {
      K.iconTile('key', 1078, 336, 58, { stroke: K.rgba(C.head, 0.5) });
      K.text('single sign-on', 1118, 345, { font: 'ui', weight: 600, size: 26, color: C.strong });
    });
    // the admin allow-list
    item(wAdmins, () => {
      K.card(1050, 384, 236, 172, { r: 16, fill: K.rgba(C.page, 0.7), stroke: K.rgba(C.head, 0.45), shadow: false });
      K.eyebrow('ADMINS ALLOW', 1070, 416, { size: 20 });
      [['connectors', wConn], ['plugins', wPlug], ['skills', wSkills]].forEach(([s, at], i) => {
        const k = K.io(t, at, 0.4);
        K.layer(k, () => {
          K.icon('check', 1084, 452 + i * 38, 26, { color: C.head, w: 3 });
          K.text(s, 1108, 461 + i * 38, { font: 'ui', weight: 600, size: 26, color: C.strong });
        });
      });
    });
    // audit logs, retention
    item(wAudit, () => {
      K.icon('book', 1556, 366, 38, { color: C.head, w: 2.5 });
      K.text('audit logs', 1588, 375, { font: 'ui', weight: 600, size: 26, color: C.strong });
    });
    item(wRet, () => {
      K.icon('clock', 1556, 446, 38, { color: C.head, w: 2.5 });
      K.text('data retention', 1588, 455, { font: 'ui', weight: 600, size: 26, color: C.strong });
    });
    // instruction files pushed to every machine
    const LX = [1230, 1410, 1590];
    item(wInstr, () => {
      LX.forEach((x) => K.icon('laptop', x, 628, 74, { color: C.soft, w: 2.5 }));
      K.text('instruction files on every machine', BCX, 704, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center' });
    });
    LX.forEach((x, i) => {
      const t0 = wPushed + i * 0.22, k = K.io(t, t0, 0.6, 'out');
      if (k <= 0) return;
      const px = K.lerp(BCX, x, k), py = K.lerp(512, 618, k) - Math.sin(k * Math.PI) * 24;
      M.paper(px, py, { kind: 'note', w: 38, h: 28, lines: 1, rot: (1 - k) * 0.2 });
    });

    // not trained on by default · notice before changes
    const ntK = K.io(t, cNT, 0.6);
    K.layer(ntK, () => K.at(0, (1 - ntK) * 14, 1, 0, () => {
      K.card(1040, 770, 456, 66, { r: 16, fill: K.rgba(C.tile, 0.95), stroke: C.line2, shadow: false });
      toggle(1062, 803, 0, 1);
      K.text('not trained on by default', 1144, 812, { font: 'ui', weight: 600, size: 26, color: C.strong });
    }));
    const nK = K.io(t, wNotice, 0.6);
    K.layer(nK, () => K.at(0, (1 - nK) * 14, 1, 0, () => {
      K.card(1512, 770, 272, 66, { r: 16, fill: K.rgba(C.tile, 0.95), stroke: C.line2, shadow: false });
      K.icon('envelope', 1544, 803, 32, { color: C.head, w: 2.5 });
      K.text('advance notice', 1574, 812, { font: 'ui', weight: 600, size: 26, color: C.strong });
    }));
  });

  // ---- shelf pointer
  M.shelf('Trust', 1840, 880, { prefix: 'work plans', k: K.io(t, wPlans, 0.6) });
});
