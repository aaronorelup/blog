/* 12 — The lantern: agents pack satchels now
   Timeline strip on top (2021 · Aug 2025 · Autumn 2025 · Dec 2025 · Oct 2026). Plain indigo bg; warmth only
   behind the agent. The door is a dim backdrop.
   then: you send a program out. now: the agent (lantern) sets things up and sends couriers of its own.
   thieves: an attacker grabs from the satchels (.env, GITHUB_TOKEN, NPM_TOKEN) and steers the agent.
   responses: npm revokes tokens (X on NPM_TOKEN); a key-stripping gate whose switch is OFF lets keys through.
   heading: one key for one courier for one run, then withdrawn; or kept behind a proxy. "heading · early". */
SCENE('12', (t, S) => {
  const C = K.C;
  K.bg();

  // ---------------------------------------------------------------- beats (local seconds)
  const tThen = S.cue('then', 0);
  const tNow = S.cue('now', 4.84);
  const tTools = S.find('install', 0, 5.75);
  const tPath = S.find('path', 0, 6.93);
  const tEnvs = S.find('environments', 0, 7.8);
  const tDotEnv = S.find('.env', 0, 9.57);
  const tSend = S.find('send', 0, 12.38);
  const tThieves = S.cue('thieves', 14.51);
  const tAug = S.find('August', 0, 16.81);
  const tPoison = S.find('poisoned', 0, 18.86);
  const tStole = S.find('stole', 0, 20.06);
  const tSteer = S.find('steered', 0, 21.98);
  const tAI = S.find('command-line', 0, 24.07);
  const tAutumn = S.find('autumn', 0, 28.05);
  const tWorm = S.find('worm', 0, 29.62);
  const tHarvest = S.find('harvested', 0, 32.17);
  const tResp = S.cue('responses', 36.13);
  const tDec = S.find('December', 0, 36.33);
  const tRevoked = S.find('revoked', 0, 38.97);
  const tAgentTools = S.find(/^agent$/i, 0, 42.33);
  const tStrip = S.find('strip', 0, 44.78);
  const tOff = S.find('switched', 0, 48.79);
  const tHead = S.cue('heading', 51.53);
  const tHand = S.find('hand', 0, 52.57);
  const tOneRun = S.find('run,', 0, 55.2);
  const tProxy = S.find('proxy', 0, 56.58);
  const tEarly = S.find('early', 0, 61.0);

  // ---------------------------------------------------------------- timeline strip
  const TL = { y: 200, x0: 200, x1: 1760 };
  const pins = [
    { x: 300, year: '2021', at: tThen + 0.2 },
    { x: 860, year: 'Aug 2025', at: tAug, cap: 'poisoned package', capAt: tPoison },
    { x: 1120, year: 'Autumn 2025', at: tAutumn, cap: 'npm worm', capAt: tWorm },
    { x: 1380, year: 'Dec 2025', at: tDec, cap: 'tokens revoked', capAt: tRevoked - 0.3 },
    { x: 1660, year: 'Oct 2026', at: tNow, cap: 'now', capAt: tNow + 0.2, capGold: true },
  ];
  // which pin is "current" (gets the glow)
  const current = t < tNow ? 0 : t < tAug ? 4 : t < tAutumn ? 1 : t < tDec ? 2 : t < tAgentTools - 0.3 ? 3 : 4;
  K.line(TL.x0, TL.y, TL.x1, TL.y, { color: C.line2, w: 3 });
  // compressed years between 2021 and 2025
  K.text('//', 580, TL.y + 10, { font: 'mono', weight: 700, size: 30, color: C.soft, align: 'center' });
  // heading: the line runs on, dashed, past today
  const extK = K.io(t, tHead + 0.2, 0.8);
  if (extK > 0) K.line(TL.x1, TL.y, TL.x1 + 70, TL.y, { k: extK, color: C.head, w: 3, dash: [8, 8], alpha: 0.8 });
  pins.forEach((p, i) => {
    const on = K.io(t, p.at, 0.5);
    const cur = i === current ? on : 0;
    if (cur > 0) K.glow(p.x, TL.y, 70, C.head, 0.4 * cur);
    const g = K.ctx();
    g.save(); g.beginPath(); g.arc(p.x, TL.y, 9 + 4 * cur, 0, Math.PI * 2);
    g.fillStyle = K.mixColor(C.page, C.head, on * (0.55 + 0.45 * cur)); g.fill();
    g.lineWidth = 2.5; g.strokeStyle = on > 0.05 ? C.head : C.line2; g.stroke(); g.restore();
    K.text(p.year, p.x, TL.y - 30, { font: 'ui', weight: 600, size: 26, align: 'center',
      color: K.mixColor(C.soft, i === current ? C.head : C.strong, on) });
    if (p.cap) {
      const ck = K.io(t, p.capAt, 0.5);
      if (ck > 0) K.text(p.cap, p.x, TL.y + 50, { font: 'ui', weight: 600, size: 26, align: 'center', alpha: ck,
        color: p.capGold ? C.head : C.body });
    }
  });

  // ---------------------------------------------------------------- home (dim backdrop: the agent stands at the door)
  M.door(t, { open: 0.25, alpha: 0.32 });

  // the figure at the door: you (then) -> the agent (now)
  const AG = { x: 540, y: 560, s: 130 };
  const swapK = K.io(t, tNow, 0.7);
  // local warmth: only behind the agent and its lantern
  if (swapK > 0) K.glow(AG.x - 20, AG.y - 20, 240, C.head, 0.16 * swapK);
  if (swapK < 1) M.courier(t, AG.x, AG.y, AG.s, { icon: 'person', satchel: false, label: 'you', labelSize: 30, alpha: 1 - swapK });
  // a program you started yourself walks out (then), and fades when the agent arrives
  const progK = K.io(t, tThen + 1.0, 1.0);
  if (swapK < 1 && progK > 0) {
    const px = K.lerp(AG.x + 40, 900, progK);
    M.courier(t, px, AG.y, 100, { icon: 'terminal', walking: progK > 0 && progK < 1 ? 1 : 0, alpha: K.clamp(progK * 3) * (1 - swapK),
      label: 'your program', labelSize: 30, satchel: { open: 0 } });
  }

  // ---------------------------------------------------------------- the agent's couriers (sent at "send out couriers")
  const kids = [
    { icon: 'terminal', x: 900 },
    { icon: 'gear', x: 1200 },
    { icon: 'code', x: 1500 },
  ];
  const KY = 790, KS = 84;
  // keys copied into every courier when the stripping switch is off (responses) ...
  const flyK = (i) => K.seg(t, tOff + 0.3 + i * 0.18, tOff + 1.1 + i * 0.18);
  // ... cleared again at heading
  const clearK = K.io(t, tHead + 0.1, 0.6);
  // one key for one command, one run (heading)
  const oneIn = K.seg(t, tHand + 0.2, tHand + 1.0);
  const oneFade = K.io(t, tOneRun + 0.2, 0.8);
  const kidPos = kids.map((kd, i) => {
    const wk = K.io(t, tSend + 0.1 + i * 0.2, 0.9);
    const x = K.lerp(AG.x + 60, kd.x, wk), y = K.lerp(AG.y + 60, KY, wk);
    return { x, y, wk, alpha: K.clamp(wk * 2.5) };
  });
  // a readable KEY card above a courier (drawn above the tile so it never covers the icon)
  const KEYDY = KS / 2 + 118;
  const keyCard = (r, alpha, lit, dy) => M.chip(r.x + 18, r.y - KEYDY - (dy || 0), { w: 84, h: 100, name: 'KEY', kind: 'key', size: 26, rot: 0.06, alpha, lit });
  const kidRes = kids.map((kd, i) => {
    const p = kidPos[i];
    if (p.alpha <= 0) return null;
    const lit = i === 1 ? K.io(t, tHand + 0.9, 0.4) * (1 - K.io(t, tOneRun + 0.6, 0.6)) : 0;
    const res = M.courier(t, p.x, p.y, KS, { icon: kd.icon, walking: p.wk > 0 && p.wk < 1 ? 1 : 0, alpha: p.alpha, lit,
      satchel: { open: 0 } });
    const hasKey = flyK(i) >= 1 ? 1 - clearK : 0;
    if (hasKey > 0) keyCard(res, hasKey * p.alpha, 0);
    // the one key, used for one run, then gone: drifts up and fades
    if (i === 1 && oneIn >= 1 && oneFade < 1) keyCard(res, (1 - oneFade) * p.alpha, 0.6, 30 * oneFade);
    return res;
  });

  // ---------------------------------------------------------------- the agent
  const agentRes = M.courier(t, AG.x, AG.y, AG.s, { icon: 'sparkle', lantern: swapK, alpha: swapK, label: 'agent', labelSize: 30,
    labelColor: C.head, satchel: { open: 0 } });

  // ---------------------------------------------------------------- NOW: what the agent sets up for you
  const nowOut = 1 - K.io(t, tThieves - 0.35, 0.45);
  if (nowOut > 0) K.layer(nowOut, () => {
    const IY = 410;
    K.pop(t, tTools, 860, IY, () => {
      K.iconTile('gear', 860, IY, 100, {});
      M.label('tools', 860, IY + 96, { color: C.body, size: 30 });
    });
    K.pop(t, tPath, 1120, IY, () => {
      M.chip(1120, IY - 64, { w: 130, h: 128, name: 'PATH', kind: 'path', new: true, lit: 0.6 });
      M.label('+ a street', 1120, IY + 96, { color: C.body, size: 30 });
    });
    K.pop(t, tEnvs, 1380, IY, () => {
      K.folder(1380, IY - 6, 100, {});
      M.label('environment', 1380, IY + 96, { color: C.body, size: 30 });
      M.label('folder', 1380, IY + 132, { color: C.soft, size: 26 });
    });
    K.pop(t, tDotEnv, 1640, IY, () => {
      K.file(1640, IY - 6, 108, {});
      K.icon('key', 1640, IY + 4, 40, { color: C.accent });
      M.label('.env', 1640, IY + 96, { font: 'mono', weight: 600, color: C.body, size: 30 });
      M.label('key file', 1640, IY + 132, { color: C.soft, size: 26 });
    });
  });

  // ---------------------------------------------------------------- THIEVES
  const TH = { x: 1120, y: 420, s: 110 };
  const thiefK = K.io(t, tThieves + 0.2, 0.5, 'back') * (1 - K.io(t, tResp + 0.1, 0.6));
  const loot = [
    { name: '.env', value: 'sk-ant-••••', from: 2, at: tStole + 0.2, y: 360 },
    { name: 'GITHUB_TOKEN', value: 'ghp_••••', from: 1, at: tHarvest + 0.1, y: 460 },
    { name: 'NPM_TOKEN', value: 'npm_••••', from: 0, at: tHarvest + 0.5, y: 560 },
  ];
  const LX = 1290, LW = 550;
  const lootOut = 1 - K.io(t, tAgentTools - 0.6, 0.6);
  if (thiefK > 0.002) {
    K.layer(K.clamp(thiefK), () => {
      K.at(TH.x, TH.y, 0.8 + 0.2 * thiefK, 0, () => {
        K.ctx().translate(-TH.x, -TH.y);
        K.glow(TH.x, TH.y, 150, C.accent, 0.22);
        K.iconTile('warning', TH.x, TH.y, TH.s, { fill: K.mixColor(C.page, C.accent, 0.08), stroke: C.accent, color: C.accent });
      });
      M.label('attacker', TH.x, TH.y + TH.s / 2 + 46, { color: C.accent, size: 30 });
      // hooks into the satchels it robs
      loot.forEach((L) => {
        const r = kidRes[L.from]; if (!r) return;
        const hk = K.io(t, L.at - 0.4, 0.5), hkA = 1 - K.io(t, L.at + 1.4, 0.6);
        if (hk > 0) K.path([[TH.x, TH.y + 140], [K.lerp(TH.x, r.sx, 0.5), K.lerp(TH.y + 140, r.sy, 0.5) - 20], [r.sx, r.sy - 24]],
          { k: hk, color: K.rgba(C.accent, 0.75), w: 3, dash: [10, 8], head: false, alpha: hkA });
      });
      // steered: the attacker drives the victim's own AI tool
      const sk = K.io(t, tSteer, 0.9);
      if (sk > 0) K.arrow(TH.x - 70, TH.y - 10, AG.x + 110, AG.y - 90, { k: sk, bend: -90, color: C.accent, w: 3.5, dash: [12, 9] });
      const rk = K.io(t, tAI, 0.7);
      if (rk > 0) K.ring(AG.x, AG.y + 8, 140, 132, rk, { color: C.accent, w: 4, rot: 0 });
    });
  }
  // the stolen cards: fly from a courier's satchel into the attacker's pile on the right, and stay
  loot.forEach((L, i) => {
    const r = kidRes[L.from];
    const fk = K.io(t, L.at, 0.8);
    if (fk <= 0 || !r || lootOut <= 0) return;
    const tx = LX, ty = L.y;
    if (fk < 1) {
      const cx = (r.sx + tx + 60) / 2, cy = Math.min(r.sy, ty) - 140;
      const u = fk, px = (1 - u) * (1 - u) * r.sx + 2 * (1 - u) * u * cx + u * u * (tx + 60);
      const py = (1 - u) * (1 - u) * (r.sy - 30) + 2 * (1 - u) * u * cy + u * u * ty;
      M.chip(px, py, { w: 70, h: 86, kind: 'key', rot: Math.sin(u * Math.PI) * 0.4, alpha: lootOut });
    }
    const ck = K.io(t, L.at + 0.6, 0.4);
    if (ck > 0) {
      M.envCard(tx, ty - 6, { w: LW, h: 78, name: L.name, value: L.value, kind: 'key', size: 30, nameW: 310, fade: false, alpha: ck * lootOut });
      if (i === 2) {
        const xk = K.io(t, tRevoked + 0.1, 0.6);
        if (xk > 0) M.cross(tx + LW - 44, ty + 33, 56, xk, { alpha: lootOut });
      }
    }
  });

  // ---------------------------------------------------------------- RESPONSES: the key-stripping gate (switched off)
  // pinned under the "Oct 2026 / now" dot: key stripping is a today thing, not a Dec 2025 one
  const GT = { x: 1660, y: 400 };
  const gateK = K.io(t, tAgentTools, 0.6) * (1 - K.io(t, tHead, 0.6));
  if (gateK > 0.002) {
    K.layer(gateK, () => {
      // a short gold tether from the "now" caption down to the gate
      K.line(GT.x, TL.y + 66, GT.x, GT.y - 62, { k: K.io(t, tAgentTools, 0.5), color: C.head, w: 2.5, dash: [6, 7], alpha: 0.8 });
      K.iconTile('shield', GT.x, GT.y, 100, { color: C.strong });
      K.text('key stripping', GT.x, GT.y + 92, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'center' });
      // the switch, drawn off, as a labelled pill
      const sw = { x: GT.x - 30, y: GT.y + 134, w: 84, h: 40 };
      const offTxt = K.io(t, tOff - 0.2, 0.5);
      const g = K.ctx();
      g.save(); K.rr(sw.x - sw.w / 2, sw.y - sw.h / 2, sw.w, sw.h, sw.h / 2);
      g.fillStyle = C.tile; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.line2; g.stroke();
      g.beginPath(); g.arc(sw.x - 21, sw.y, 14, 0, Math.PI * 2); g.fillStyle = C.soft; g.fill(); g.restore();
      K.text('off', sw.x + 64, sw.y + 11, { font: 'mono', weight: 700, size: 30, color: C.strong, alpha: 0.5 + 0.5 * offTxt });
      K.text('mostly off by default', GT.x - 30, GT.y + 196, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'center', alpha: K.io(t, tOff, 0.5) });
    });
  }
  // with the switch off, the key is copied into every courier straight past the gate
  kids.forEach((kd, i) => {
    const r = kidRes[i]; if (!r) return;
    const k = flyK(i);
    if (k > 0 && k < 1) M.copyFly(agentRes.sx, agentRes.sy - 40, r.x + 18, r.y - KEYDY + 50, k, { name: 'KEY', kind: 'key', w: 84, h: 100, bend: -60, sink: false });
  });

  // ---------------------------------------------------------------- HEADING: one key, one command, one run
  const r1 = kidRes[1];
  if (r1) {
    if (oneIn > 0 && oneIn < 1) M.copyFly(agentRes.sx, agentRes.sy - 40, r1.x + 18, r1.y - KEYDY + 50, oneIn, { name: 'KEY', kind: 'key', w: 84, h: 100, bend: -160, sink: false });
    const runK = K.io(t, tHand + 0.9, 0.4) * (1 - K.io(t, tProxy - 0.4, 0.4));
    if (runK > 0) M.label('one command · one run', r1.x, r1.y + KS / 2 + 50, { color: C.head, size: 30, alpha: runK });
  }
  // or kept behind a proxy: the key stays in the proxy; each command calls through it
  const PX = { x: 1200, y: 450 };
  const proxK = K.io(t, tProxy - 0.1, 0.6);
  if (proxK > 0) {
    K.layer(proxK, () => {
      kidRes.forEach((r, i) => {
        if (!r) return;
        const lk = K.io(t, tProxy + 0.3 + i * 0.15, 0.6);
        const x0 = r.x, y0 = r.y - KS / 2 - 12, x1 = K.lerp(PX.x, r.x, 0.25), y1 = PX.y + 64;
        K.line(x0, y0, x1, y1, { k: lk, color: C.head, w: 2.5, dash: [8, 8], alpha: 0.8 });
        // a call travelling up to the proxy
        const st = tProxy + 1.0 + i * 0.4;
        if (t > st) {
          const ck = ((t - st) / 1.6) % 1;
          const g = K.ctx(); g.save(); g.globalAlpha *= Math.sin(ck * Math.PI);
          g.beginPath(); g.arc(K.lerp(x0, x1, ck), K.lerp(y0, y1, ck), 7, 0, Math.PI * 2); g.fillStyle = C.head; g.fill(); g.restore();
        }
      });
      K.iconTile('server', PX.x, PX.y, 110, { color: C.strong });
      M.chip(PX.x + 120, PX.y - 66, { w: 84, h: 100, name: 'KEY', kind: 'key', size: 26, rot: 0.06 });
      M.label('proxy', PX.x - 130, PX.y + 10, { color: C.body, size: 30 });
    });
  }
  const earlyK = K.io(t, tEarly - 0.4, 0.6);
  if (earlyK > 0) K.pill('heading · early', 1600, 450, { size: 30, color: C.head, stroke: C.head, alpha: earlyK });
});
