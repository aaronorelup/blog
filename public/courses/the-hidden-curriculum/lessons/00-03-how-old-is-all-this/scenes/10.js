/* 10 — A gatehouse for everything
   The lock moves off the door. The building stays in the 'left' layout with its passkey lock (opening on 09's exit:
   its faint door frame and glow settle away in the first second); the dim street strip sits along y 900.
   On "Instead of every site" three small site doors rise at right, each with its own key, labelled "every site, its
   own password" (the 'before' picture). On [[gatehouse]] the door's lock warms on "own"; on "hand" the three doors fold
   into one big
   gatehouse (the building's own roof on a card) rises at right, a dashed gold arrow draws from the building's door to it and a small key rides along it (the door no
   longer checks keys itself); "logins" names it on "dedicated service", then two pills on their words: "Sign in
   with Google", "company identity provider". On [[service-everything]] the pills go, the gatehouse shrinks into the
   top of a column and two more join it on their spoken words (logins · secrets · keys), each with its own arrow
   from the door: one service per job. On [[aaron-work]] the building eases (lerpLayout, 0.8 s) from 'left' into the
   empty middle band (x ~920–1200, s .42) with its arrows still running to the gatehouses, and an inset card
   "AARON, AT WORK" takes the freed left column (nothing sits under it): a person on "Aaron" (his personal account)
   with a tied-on gear on "automations", then three pills on
   their spoken names, each fed by an arrow from the person (service accounts · Credential Manager · Entra app
   registrations); the person dims once they have moved. "A login for the job, not the person." on "A login".
   On [[renamed]] the Entra pill warms; "RENAMED" on "moved", the new name "Entra ID" on "Entra", the old name
   "Azure Active Directory" (already dimmed) left of it on "Azure", struck with an arrow to the new one on "until",
   and the eyebrow completes to "RENAMED · 2023" on the year. The scene's one 'back' is
   the first gatehouse rising.
   Exit: Aaron's card left, the building small and dim mid-frame, the three gatehouses right. (11 opens on the 'left'
   pose at 0.3 and fades it within a second, so a faint ghost shows through the 0.6 s crossfade.) */
SCENE('10', (t, S) => {
  const C = K.C;

  // ---- times (local), from the narration
  const tMoved = S.find('moved', 0, 1.02);
  const tInstead = S.find('Instead', 0, 2.76);
  const tSite = S.find('site', 0, 3.7);
  const tOwn = S.find('own', 0, 4.64);
  const tHand = S.find('hand', 0, 6.65);
  const tDedicated = S.find('dedicated', 0, 7.66);
  const tGoogle = S.find('Sign', 0, 9.31);
  const tCompany = S.find("company's", 0, 10.9);
  const tEvery = S.cue('service-everything', 13.43);
  const tLogins = S.find('logins', 0, 16.29);
  const tSecrets = S.find('secrets', 0, 17.87);
  const tKeys = S.find('keys', 0, 19.41);
  const tAaron = S.cue('aaron-work', 20.63);
  const tAuto = S.find('automations', 0, 22.8);
  const tPersonal = S.find('personal', 0, 24.3);
  const tSvc = S.find('service', 2, 26.73);
  const tCred = S.find('Windows', 0, 28.29);
  const tApp = S.find('app', 0, 30.3);
  const tJob = S.find(/^login$/i, 0, 34.57) - 0.2;
  const tRenamed = S.cue('renamed', 37.35);
  const tMoved2 = S.find('moved', 1, 38.26);
  const tEntra = S.find('Entra', 1, 38.92);
  const tAzure = S.find('Azure', 0, 40.01);
  const tUntil = S.find('until', 0, 41.66);
  const tYear = S.find('2023', 0, 41.99);

  K.bg({ glow: 0.16, glowX: 1400, glowY: 300 });

  // ---- the dim street strip along the floor (a reminder that this is still the old street)
  M.street(t, { geom: 'floor', alpha: 0.3 * K.io(t, -0.6, 0.8), show: 0, lanterns: 0, cord: 0 });

  // ---- the building: 'left', then on [[aaron-work]] it eases into the empty middle band so Aaron's card owns the left
  const MID = { x: 1060, y: 612, s: 0.42 };                       // x ~926–1194, pole tops ~474, stone bottom ~740
  const moveB = K.io(t, tAaron - 0.25, 0.8);
  const L = M.lerpLayout('left', MID, moveB);
  const insetK = K.io(t, tAaron + 0.35, 0.6);                      // the card arrives once the building has cleared x 810
  // opens on 09's exit (its door frame and glow at 30 %), which settle away in the first second
  const settle = 0.3 * (1 - K.io(t, 0.2, 0.9));
  // at the small mid-band scale the small text goes (blank sign, no stone label, as on 'small'): crossfade the two
  // detail levels of the same building during the move, so nothing pops
  const dK = K.seg(moveB, 0.3, 0.7);
  const bOpts = {
    layout: L, sign: 'Python 3.13', roofLabel: 'PYTHON · 1991', lock: 'passkey',                   // as 09 leaves it and 11 takes it
    lockLit: Math.max(0.25, 0.25 + 0.75 * Math.max(M.bump(t, tMoved, 1.2), M.bump(t, tOwn, 1.2))),
    doorGlow: 0.35 * settle,
  };
  const bA = K.lerp(1, 0.5, moveB);
  if (dK < 1) M.building(t, { ...bOpts, detail: true, alpha: bA * (1 - dK) });
  if (dK > 0) M.building(t, { ...bOpts, detail: false, alpha: bA * dK });
  if (settle > 0) M.inBuilding(L, () => {
    const d = M.BLD.door, g = K.ctx(), p = 10;
    g.save(); g.globalAlpha *= settle; g.strokeStyle = K.rgba(C.accent, 0.85); g.lineWidth = 2.5;
    g.beginPath(); g.rect(d.x - p, d.y - p, d.w + 2 * p, d.h + p); g.stroke(); g.restore();
  });

  // ---- before: every site keeps its own passwords (three small doors, each with its own key)
  const foldK = K.io(t, tHand - 0.75, 0.6);                        // they fold into the one gatehouse as it rises
  if (foldK < 1) {
    const DX = [1250, 1440, 1630], DY = 400, DW = 110, DH = 170;
    DX.forEach((x0, i) => {
      const k = K.io(t, tInstead + 0.25 + i * 0.22, 0.5);
      if (k <= 0) return;
      const f = K.ease.io(foldK);
      const x = K.lerp(x0, 1440, f), y = K.lerp(DY, 410, f) + (1 - K.ease.out(k)) * 16, sc = K.lerp(1, 0.35, f);
      K.layer(k * (1 - f), () => {
        const w = DW * sc, h = DH * sc, g = K.ctx();
        g.save();
        // lintel (a small roof beam) and the door leaf
        K.line(x - w / 2 - 14 * sc, y - h / 2 - 8 * sc, x + w / 2 + 14 * sc, y - h / 2 - 8 * sc, { color: K.rgba(C.head, 0.45), w: 3 * sc });
        K.rr(x - w / 2, y - h / 2, w, h, 6 * sc);
        g.fillStyle = C.tile; g.fill();
        g.strokeStyle = K.rgba(C.soft, 0.8); g.lineWidth = 2.5 * sc; g.stroke();
        g.restore();
        M.lockIcon('key', x, y + 8 * sc, 40 * sc, { alpha: 1 });
      });
    });
    const lk = K.io(t, tSite + 0.1, 0.5) * (1 - K.io(t, tHand - 0.8, 0.35));
    if (lk > 0) K.text('every site, its own password', 1440, DY + 85 + 60 + 8 * (1 - K.ease.out(lk)),
      { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center', alpha: lk });
  }

  // ---- arrows from the door, and the gatehouses
  const door = { x: M.at(L, 'door').r + 6, y: M.at(L, 'lock').y + 4 };
  const startDy = [-6, 4, 14];                                   // the three arrows leave the door a little apart
  const stack = [290, 525, 760], SX = 1500, SW = 340, SH = 160;
  const moveK = K.io(t, tEvery + 0.1, 0.8);                       // big gatehouse -> top of the column
  const big = { x: 1440, y: 410, w: 440, h: 300 };
  const g0 = { x: K.lerp(big.x, SX, moveK), y: K.lerp(big.y, stack[0], moveK), w: K.lerp(big.w, SW, moveK), h: K.lerp(big.h, SH, moveK) };
  const houses = [
    { ...g0, icon: 'shield', label: 'logins', k: K.io(t, tHand - 0.35, 0.7, 'back'), at: tHand + 0.1 },
    // each lands ON its spoken word: the drop starts 0.4 s early and is done just after the word begins
    { x: SX, y: stack[1], w: SW, h: SH, icon: 'lock', label: 'secrets', k: K.io(t, tSecrets - 0.4, 0.5), at: tSecrets - 0.55 },
    { x: SX, y: stack[2], w: SW, h: SH, icon: 'key', label: 'keys', k: K.io(t, tKeys - 0.4, 0.5), at: tKeys - 0.55 },
  ];
  const bends = [130, 70, -30], bendsMid = [70, 40, 30];   // shorter arrows once the building moves mid-frame
  const backA = K.lerp(1, 0.55, insetK);                          // everything outside the inset steps back
  const quad = (x1, y1, x2, y2, bend, u) => {                    // same curve as K.arrow
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    return [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2];
  };

  K.layer(backA, () => {
    houses.forEach((h, i) => {
      if (h.k <= 0) return;
      const gw = h.w, gx0 = h.x - gw / 2 - 10;
      const ak = K.io(t, h.at, 0.8);
      K.arrow(door.x, door.y + startDy[i] * L.s / 0.8, gx0, h.y, { k: ak, bend: K.lerp(bends[i], bendsMid[i], moveB), color: K.rgba(C.head, 0.85), w: 2.5, dash: [9, 8], headSize: 13 });
    });
    // the key that is handed over, riding the first arrow
    const kk = K.seg(t, tHand + 0.2, tHand + 1.1);
    if (kk > 0 && kk < 1) {
      const [px, py] = quad(door.x, door.y + startDy[0], houses[0].x - houses[0].w / 2 - 10, houses[0].y, bends[0], K.ease.io(kk));
      M.lockIcon('key', px, py - 26, 34, { alpha: Math.min(1, kk * 5, (1 - kk) * 5) });
    }
    houses.forEach((h, i) => {
      if (h.k <= 0) return;
      const lit = i === 0 ? Math.max(M.bump(t, tDedicated + 0.2, 1.2), M.bump(t, tLogins, 1.0)) : M.bump(t, h.at + 0.2, 1.0);
      const size = K.lerp(30, 26, i === 0 ? moveK : 1);
      const labelK = i === 0 ? K.io(t, tDedicated, 0.5) : 1;
      M.gatehouse(h.x, h.y, { w: h.w, h: h.h, icon: h.icon, k: h.k, lit, size });
      // label drawn here so it can arrive on its word (the first gatehouse rises before it is named)
      const dy = (1 - K.ease.out(h.k)) * 20;
      K.text(h.label, h.x, h.y + h.h * 0.3 + size * 0.2 + dy, { font: 'ui', weight: 600, size, color: C.strong, align: 'center', alpha: h.k * labelK });
    });
    // the two ways sign-in gets handed off (only while the gatehouse is big)
    const pillsA = 1 - K.io(t, tEvery, 0.4);
    if (pillsA > 0) {
      [['Sign in with Google', tGoogle, 640], ['company identity provider', tCompany, 720]].forEach(([s, at, y]) => {
        const k = K.io(t, at, 0.5);
        if (k > 0) K.pill(s, big.x, y + 12 * (1 - K.ease.out(k)), { size: 26, alpha: k * pillsA, color: C.strong });
      });
    }
  });

  // ---- Aaron's inset: a login for the job, not the person
  if (insetK > 0) {
    const dy = (1 - K.ease.out(insetK)) * 18;
    K.layer(insetK, () => {
      const X0 = 110, Y0 = 190 + dy, W = 700, H = 560;
      K.card(X0, Y0, W, H, { fill: C.tile, stroke: C.line2 });
      K.eyebrow('AARON, AT WORK', X0 + 32, Y0 + 46, { size: 20, tracking: 4 });

      // the person (his personal account) with the automations tied on
      const movedK = K.io(t, tApp + 0.9, 0.8);                  // once the last arrow lands, the person steps back
      const pk = K.io(t, tAaron + 0.5, 0.5), gk = K.io(t, tAuto, 0.5), lk = K.io(t, tPersonal, 0.5);
      const px = 215, py = Y0 + 160;
      K.layer(pk * K.lerp(1, 0.4, movedK), () => {
        K.icon('person', px, py, 64, { color: K.mixColor(C.strong, C.quiet, movedK), w: 3 });
      });
      K.layer(gk * K.lerp(1, 0.35, movedK), () => {
        K.line(px + 30, py + 14, px + 52, py + 30, { color: K.mixColor(C.soft, C.quiet, movedK), w: 2.5 });
        K.icon('gear', px + 66, py + 40, 34, { color: K.mixColor(C.gold, C.quiet, movedK), w: 2.5 });
      });
      K.layer(lk * K.lerp(1, 0.5, movedK), () => {
        K.text('personal', px, py + 92, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center' });
        K.text('account', px, py + 122, { font: 'ui', weight: 600, size: 26, color: C.soft, align: 'center' });
      });

      // where the automations moved: three pills, each on its spoken name
      const PX = 420, rows = [Y0 + 115, Y0 + 200, Y0 + 285];
      const items = [['service accounts', tSvc], ['Credential Manager', tCred], ['Entra app registrations', tApp]];
      items.forEach(([s, at], i) => {
        const ak = K.io(t, at - 0.15, 0.55), k = K.io(t, at + 0.15, 0.5);
        K.arrow(px + 48, py - 6, PX - 14, rows[i], { k: ak, bend: (i - 1) * -18, color: K.rgba(C.head, 0.85), w: 2.5, dash: [8, 7], headSize: 12 });
        if (k <= 0) return;
        const lit = i === 2 ? K.io(t, tRenamed, 0.6) * (1 - 0.6 * K.io(t, tUntil + 0.6, 0.6)) : 0;
        M.paint(PX, rows[i] + 10 * (1 - K.ease.out(k)), s, { size: 26, align: 'left', alpha: k, lit });
      });

      // the one sentence
      M.say('A login for the job, not the person.', Y0 + 378, K.io(t, tJob, 0.6), { x: X0 + W / 2, size: 30 });

      // the name moved too: old name dimmed and struck, an arrow, the new name (06's retirement move, reused)
      const ek1 = K.io(t, tMoved2, 0.5), ek2 = K.io(t, tYear, 0.5);
      if (ek1 > 0) K.eyebrow('RENAMED', X0 + 32, Y0 + 440 + 8 * (1 - K.ease.out(ek1)), { size: 20, tracking: 3, alpha: ek1 });
      if (ek2 > 0) K.eyebrow('RENAMED · 2023', X0 + 32, Y0 + 440, { size: 20, tracking: 3, alpha: ek2 });
      const nk = K.io(t, tEntra, 0.5), ok = K.io(t, tAzure, 0.5);
      if (nk > 0 || ok > 0) {
        const ry = Y0 + 496, to = { size: 26, font: 'ui', weight: 600 };
        const wOld = K.measure('Azure Active Directory', to) + 26 * 1.6, wNew = K.measure('Entra ID', to) + 26 * 1.6, gap = 84;
        const xA = X0 + 32, xB = xA + wOld + gap;
        if (ok > 0) {
          const r = M.paint(xA, ry + 10 * (1 - K.ease.out(ok)), 'Azure Active Directory', { size: 26, align: 'left', alpha: ok * K.lerp(1, 0.6, K.io(t, tUntil, 0.5)), dim: 0.55 + 0.45 * K.io(t, tUntil, 0.5), color: C.soft });
          M.strike(r.x0 + 14, ry - r.h / 2 + 8, r.x1 - 14, ry + r.h / 2 - 8, K.io(t, tUntil, 0.5));
          K.arrow(xA + wOld + 12, ry, xB - 12, ry, { k: K.io(t, tAzure + 0.35, 0.5), color: K.rgba(C.head, 0.85), w: 2.5, headSize: 12 });
        }
        if (nk > 0) M.paint(xB, ry + 10 * (1 - K.ease.out(nk)), 'Entra ID', { size: 26, align: 'left', alpha: nk, lit: 0.5 + 0.5 * M.bump(t, tYear, 1.0) });
      }
    });
  }
});
