/* 03 — One worker, many rooms
   The worker (the model) always stays in the vendor's building. At [[house]] the building shrinks to a small lot at
   bottom right (the road leads to it for the rest of the scene) while your house builds at left with the sub-label
   "thinks across town · reaches in here". Each room is then shown only as where the worker's REACH lands: a dotted
   gold arm from the vendor's building, along the road, in through that room's door. On "which shelves it can touch"
   the counter's glass draws and its grey dotted stub stops AT the glass ("no file access"), while the workshop's
   reach goes up to Projects: every room is somewhere it works from, but the counter touches no shelves.
   Rooms in turn:
     Chat = the front counter (glass partition, "no file access"; the arm stops at the counter),
     Cowork = the back office (a job lands in the in-tray; you walk away),
     Code = the workshop (the reach arrow goes on up to the shelves; only now do the shelves light).
   At right, the real desktop-quickstart screenshot (S208, desktop-docs/tabs) in browser chrome, cropped to the whole
   intro line and bullet list (no docs nav); a gold box marks the bullet being narrated and its words sit in a chip
   BELOW the window, never over the captured text.
   [[before]]: only the counter's arm stays; eyebrow "before agents" + the narrated line (no source card).
   Exit: all rooms at 0.8, the worker in the small vendor's building, arms gone. No 'back' used. */
SCENE('03', (t, S) => {
  K.bg({ glow: 0.35, glowX: 580, glowY: 500 });
  const C = K.C;
  const cWork = S.cue('worker', 0), cHouse = S.cue('house', 5.7), cChat = S.cue('chat-room', 15.6);
  const cCow = S.cue('cowork-room', 23.3), cCode = S.cue('code-room', 29.2), cBef = S.cue('before', 33.8);
  const f = (w, fb, n = 0) => S.find(w, n, fb);
  const END = Math.max(S.dur + 0.05, S.out - 0.75);     // rooms relight for scene 04's opening frame

  // eased chain of levels: [[time, value], ...]
  const lv = (keys, d = 0.6) => keys.slice(1).reduce((v, [a, b]) => K.lerp(v, b, K.io(t, a, d)), keys[0][1]);

  // ---------------------------------------------------------------- the vendor's building (the worker's home, always)
  const tAnd = f('And', cHouse) - 0.25;
  const shrink = K.io(t, tAnd, 1.1);
  const vS = K.lerp(1, 0.36, shrink);
  const vX = K.lerp(1360, 1662, shrink), vY = K.lerp(230, 860 - 620 * 0.36, shrink);
  const vIn = K.io(t, cWork - 0.4, 0.6);
  const road = K.io(t, cHouse + 0.2, 1.4);
  if (road > 0) M.road(t, { k: road, alpha: road, labelX: 1350 });
  const V = M.vendor(t, { x: vX, y: vY, s: vS, alpha: vIn * K.lerp(0.62, 0.9, shrink), doors: false });
  const vLbl = K.io(t, tAnd + 0.9, 0.6);
  if (vLbl > 0) M.label("vendor's building", 1830, 906, { align: 'right', color: C.body, alpha: vLbl });

  // ---------------------------------------------------------------- your house
  const tAny = f('any', cHouse + 5.2), tShelves = f('shelves', cHouse + 8);
  const pulse = (i) => K.io(t, tAny - 0.2 + i * 0.28, 0.35) * (1 - K.io(t, tAny + 0.45 + i * 0.28, 0.6));
  const litChat = lv([[0, 0.25], [cChat + 0.1, 0.95], [cCow + 0.1, 0.35], [cBef + 0.1, 0.9], [END, 0.8]]) + 0.5 * pulse(0);
  const litCow = lv([[0, 0.25], [cChat + 0.1, 0.3], [cCow + 0.1, 0.95], [cCode + 0.1, 0.35], [cBef + 0.1, 0.25], [END, 0.8]]) + 0.5 * pulse(1);
  const litCode = lv([[0, 0.25], [cChat + 0.1, 0.3], [cCode + 0.1, 0.95], [cBef + 0.1, 0.25], [END, 0.8]]) + 0.5 * pulse(2);
  const tDirect = f('directly', cCode + 1.9);
  // "what changes is which shelves it can touch": the counter is walled off from the shelves by its glass (from here
  // on), while the workshop's reach goes up to them. The glass stays for the rest of the scene.
  const tWhich = f('which', cHouse + 6.8);
  const glass = K.io(t, tWhich - 0.1, 0.8) * (1 - K.io(t, END - 0.7, 0.6));
  const preview = K.io(t, tWhich + 0.2, 0.9) * (1 - K.io(t, cChat - 0.3, 0.5));
  const reach = Math.max(preview, K.io(t, tDirect - 0.3, 1.2) * (1 - K.io(t, cBef, 0.7)));
  const H = M.house(t, {
    k: K.io(t, cHouse, 1.8, 'out'), shelves: K.io(t, cHouse + 1.3, 1.6),
    rooms: { chat: K.clamp(litChat), cowork: K.clamp(litCow), code: K.clamp(litCode) },
    glass, reach,
  });
  const R = H.rooms;

  // under the roof's eyebrow: where the worker is, and what reaches in
  const subA = K.io(t, cHouse + 1.6, 0.6);
  if (subA > 0) M.label('thinks across town · reaches in here', H.x + H.w / 2, H.roofTop[1] + 90, { italic: true, color: C.body, alpha: subA });

  // the counter's own reach stops at the glass: a grey dotted stub from the counter up to the partition, capped
  const stub = K.io(t, tWhich + 0.1, 0.7) * (1 - K.io(t, cChat - 0.3, 0.5));
  if (stub > 0.002) {
    const sx = R.chat.x + R.chat.w - 22, gy = R.chat.y + 16;   // right of the "no file access" pill
    K.path([[sx, R.chat.bench[1] - 10], [sx, gy]], { k: stub, color: C.soft, w: 4, dash: [2, 12], head: false, tension: 0, alpha: 0.95 });
    const e = K.clamp((stub - 0.8) / 0.2);
    if (e > 0) K.layer(e, () => { K.line(sx - 18, gy, sx + 18, gy, { color: C.soft, w: 4 }); });
  }
  // the workshop's reach lands on the shelves: only the Code room lights them
  if (reach > 0.6) {
    const g = K.clamp((reach - 0.6) / 0.4);
    K.glow(H.folders.Projects.x, H.folders.Projects.y, 95, C.head, 0.34 * g);
    ['Documents', 'Photos'].forEach((n) => K.glow(H.folders[n].x, H.folders[n].y, 80, C.head, 0.16 * g));
  }

  // ---------------------------------------------------------------- the worker, in the vendor's building
  const wpos = [V.x + V.w / 2, V.y + V.h * K.lerp(0.47, 0.5, shrink)];
  const wIn = K.io(t, cWork + 0.1, 0.6, 'out');
  const armOn = (a, b) => K.io(t, a, 0.4) * (1 - K.io(t, b, 0.5));
  const busy = Math.max(armOn(cChat, cBef + 0.2), armOn(cBef + 0.2, END));
  M.worker(t, wpos[0], wpos[1], { s: K.lerp(96, 58, shrink), alpha: wIn, glow: K.lerp(0.8, 0.45, shrink) + 0.4 * busy });
  // labels at the big building (placed by hand: the worker's tag would sit on the road later)
  const tModel = f('model', cWork + 1.9), tThinks = f('thinks', cWork + 3.6);
  const lblA = 1 - K.io(t, tAnd - 0.2, 0.4);
  M.label('the model', wpos[0], wpos[1] + 100, { size: 30, color: C.head, alpha: K.io(t, tModel - 0.2, 0.5) * lblA });
  M.label("thinks in the vendor's building", wpos[0], wpos[1] + 146, { color: C.body, italic: true, alpha: K.io(t, tThinks - 0.2, 0.5) * lblA });

  // ---------------------------------------------------------------- the reach: one dotted arm into one room at a time
  const yRun = H.y + H.h - 18;                          // along the inside of the house's floor, under the door pills
  const arm = (room, a, b, end) => {
    const k = K.io(t, a, 0.9), off = 1 - K.io(t, b, 0.5);
    if (k * off <= 0.002) return;
    const rm = R[room], dx = rm.door[0] + 92;
    const pts = [[wpos[0] - 30, wpos[1] + 8], [V.x - 30, yRun], [dx, yRun], [dx, rm.door[1] - 46], end];
    K.path(pts, { k, color: C.head, w: 3, dash: [3, 10], head: false, alpha: 0.9 * off, tension: 0 });
    if (k > 0.97) {
      const e = K.clamp((k - 0.97) / 0.03) * off;
      K.glow(end[0], end[1], 46, C.head, 0.45 * e);
      K.layer(e, () => K.ring(end[0], end[1], 18, 18, 1, { color: C.head, w: 3, rot: 0 }));
    }
  };
  const chatEnd = [R.chat.spot[0], R.chat.spot[1] + 30];
  arm('chat', cChat + 0.15, cCow - 0.1, chatEnd);
  arm('cowork', cCow + 0.15, cCode - 0.1, R.cowork.tray);
  arm('code', cCode + 0.15, cBef + 0.2, R.code.bench);
  arm('chat', cBef + 0.35, END, chatEnd);

  // "no file access" on the counter, under its glass
  const naA = K.io(t, tWhich + 0.5, 0.5) * (1 - K.io(t, cCow - 0.1, 0.5));
  if (naA > 0.002) K.pill('no file access', R.chat.cx, R.chat.sign[1] + 56, { size: 26, color: C.strong, fill: C.tile, stroke: C.body, alpha: naA });

  // ---------------------------------------------------------------- you, the job and the in-tray (back office)
  const tHand = f('hand', cCow + 2.6), tAway = f('walk', cCow + 4.4);
  const youIn = K.io(t, tHand - 0.6, 0.5), youGo = K.io(t, tAway, 1.4, 'in');
  const youA = youIn * (1 - K.io(t, tAway + 0.7, 0.7));
  const youX = K.lerp(R.cowork.cx - 110, R.chat.cx - 120, youGo), youY = H.y + H.h + 46;
  if (youA > 0.002) {
    K.icon('person', youX, youY, 52, { color: C.strong, alpha: youA, w: 2.6 });
    M.label('you', youX - 44, youY + 10, { align: 'right', alpha: youA * (1 - youGo), color: C.body });
  }
  const tray = [R.cowork.tray[0] - 4 + 2 * 6, R.cowork.tray[1] - 6 - 2 * 7];
  const fly = K.io(t, tHand, 0.9);
  if (fly > 0) {
    const p0 = [R.cowork.cx - 80, youY - 20], p2 = tray, c1 = [R.cowork.cx + 150, R.cowork.door[1] - 40];
    const u = fly, q = (a, b, c) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
    K.file(q(p0[0], c1[0], p2[0]), q(p0[1], c1[1], p2[1]), 40, { alpha: K.clamp(fly * 4) });
  }

  // ---------------------------------------------------------------- the real screenshot (S208, read 2026-10-14)
  const shotA = K.io(t, cChat + 0.1, 0.6) * (1 - K.io(t, cBef, 0.6));
  if (shotA > 0.002) {
    const intro = K.captureBox('desktop-docs', 'tabs', 'intro', [681, 277, 1171.5, 52.5]);
    const L0 = K.captureBox('desktop-docs', 'tabs', 'list', [681, 367, 1171.5, 345]);
    const ln = intro[3], gap = (L0[3] - 6 * ln) / 2;     // 1 + 2 + 3 lines, two gaps between the items
    const [lx, ly, lw] = L0;
    const bullets = [
      [lx, ly, lw, ln],
      [lx, ly + ln + gap, lw, 2 * ln],
      [lx, ly + 3 * ln + 2 * gap, lw, 3 * ln],
    ];
    // the crop: the intro line and the whole list, full width (no docs nav, no sidebar)
    const cx0 = intro[0] - 14, cy0 = intro[1] - 16, cw = Math.max(lw, intro[2]) + 30, chh = ly + L0[3] + 12 - cy0;
    const WX = 1090, WY = 150, WW = 750, ch = WW * chh / cw;
    K.layer(shotA, () => {
      K.at(0, (1 - K.ease.out(shotA)) * 14, 1, 0, () => {
        const r = K.win(WX, WY, WW, 50 + ch, { kind: 'browser', url: 'code.claude.com', compact: true, titleSize: 26 });
        const P = K.image('desktop-docs/tabs', r.x, r.y, r.w, r.h, { crop: [cx0, cy0, cw, chh], r: 0 });
        // which bullet is being narrated
        const hot = [armOn(cChat + 0.3, cCow - 0.15), armOn(cCow + 0.15, cCode - 0.15), armOn(cCode + 0.15, cBef + 1)];
        const anyHot = Math.max(...hot);
        bullets.forEach((b, i) => {
          const [ax, ay] = P.at(b[0] - 8, b[1] - 6), [bx, by] = P.at(b[0] + b[2] + 4, b[1] + b[3] + 6);
          // dim the other bullets
          const dimK = anyHot * (1 - hot[i]);
          if (dimK > 0.002) K.layer(0.5 * dimK, () => { K.rr(ax, ay, bx - ax, by - ay, 8); K.ctx().fillStyle = C.code; K.ctx().fill(); });
          if (hot[i] > 0.002) {
            const g = K.ctx(), per = 2 * ((bx - ax) + (by - ay));
            g.save(); g.globalAlpha *= hot[i];
            g.setLineDash([per * K.clamp(hot[i] * 1.2), per]); g.lineWidth = 3.5; g.strokeStyle = C.head;
            g.shadowColor = K.rgba(C.head, 0.5); g.shadowBlur = 14;
            K.rr(ax, ay, bx - ax, by - ay, 10); g.stroke(); g.restore();
          }
        });
        // the narrated words, verbatim, in a chip under the window (never over the captured text)
        const chips = ['no file access', 'autonomous background agent', 'direct access to your local files'];
        const cy = WY + 50 + ch + 46;
        chips.forEach((s, i) => {
          if (hot[i] <= 0.002) return;
          K.layer(hot[i], () => K.at(0, (1 - hot[i]) * -8, 1, 0, () => {
            M.pillL(s, WX, cy, { size: 30, color: C.strong, fill: C.tile, stroke: C.head });
          }));
        });
        M.label('Anthropic docs · desktop quickstart · read 2026-10-14', WX + WW, cy + 62, { align: 'right', color: C.soft });
      });
    });
  }

  // ---------------------------------------------------------------- before agents: only the counter
  const bA = K.io(t, cBef + 0.4, 0.6) * (1 - K.io(t, END, 0.5));
  if (bA > 0.002) {
    K.layer(bA, () => K.at(0, (1 - K.ease.out(bA)) * 12, 1, 0, () => {
      K.eyebrow('before agents', 1100, 300, { size: 26, color: C.head, tracking: 3 });
      K.text('only the counter', 1100, 362, { ...M.T.labelBig, size: 34, color: C.strong });
      K.text('the only privacy question:', 1100, 420, { ...M.T.label, size: 30, color: C.body });
      K.text('your chat log', 1100, 466, { ...M.T.label, size: 30, color: C.head });
    }));
  }
});
