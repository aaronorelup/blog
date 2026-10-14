/* 13 — Every landlord keeps a logbook
   The camera leaves the wide street (12's exit: one gold folder, thin hatch path) for the vendor's building; its
   logbook opens as a ledger beside it, one entry per page (training, memory, accounts). Then the camera rolls down
   the road to a second landlord (Google's Gemini Apps) and its ledger; then it pulls back: both buildings dim at the
   right, the four questions on a card at the left; last, the deleted chat's memory chips glow in Anthropic's logbook. */
SCENE('13', (t, S) => {
  K.bg();
  const C = K.C, g = K.ctx();
  const cue = (n, fb) => S.cue(n, fb);
  const find = (w, n, fb) => S.find(w, n || 0, fb);
  // the first spoken word equal to w (case-insensitive, punctuation ignored) at or after local time a
  const w0 = S.words.length ? S.words[0][1] : 0;
  const after = (w, a, fb) => { const hit = S.words.find((x) => x[1] - w0 >= a - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9']/g, '') === w.toLowerCase()); return hit ? hit[1] - w0 : fb; };
  const TL = cue('logbook', 0), TT = cue('training', 2.6), TA = cue('already', 29.3), TM = cue('memory', 33.1),
    TC = cue('accounts', 38.7), TO = cue('other-landlords', 45.2), TQ = cue('four-questions', 57.7), TB = cue('copies-stay', 69.4);
  const io = K.io, env = (a, b, din = 0.45, dout = 0.35) => io(t, a, din) * (1 - io(t, b, dout));

  // ------------------------------------------------------------- camera over the street (world = the wide street)
  const camA = { s: 1, x: 0, y: 0 };                                          // 12's exit: the wide street
  const camB = { s: 1.1, x: 150 - 1360 * 1.1, y: 240 - 230 * 1.1 };          // Anthropic's building at the left
  const GX = 2060;                                                            // the second landlord, down the road (world x)
  const camC = { s: 1.1, x: 150 - GX * 1.1, y: camB.y };                       // Google's building at the left
  const camD = { s: 0.6, x: 1130 - 1360 * 0.6, y: 420 - 230 * 0.6 };          // both buildings small at the right
  const mix = (a, b, k) => ({ s: K.lerp(a.s, b.s, k), x: K.lerp(a.x, b.x, k), y: K.lerp(a.y, b.y, k) });
  let cam = mix(camA, camB, io(t, TL + 0.15, 1.3));
  cam = mix(cam, camC, io(t, TO + 0.25, 1.4));
  cam = mix(cam, camD, io(t, TQ + 0.1, 1.3));

  // the street: house (12's exit state), road (extended down to the second landlord), Anthropic's building
  const hatchK = 1 - io(t, TL, 0.6);
  const houseA = K.lerp(1, 0.22, io(t, TQ, 1));
  const back = io(t, TQ + 0.1, 1.3);                                           // pulled back, behind the card
  const lift = io(t, TB + 0.4, 0.6);                                           // the picture breaks: Anthropic's building wakes
  const anthA = K.lerp(1, 0.45, back) + 0.55 * lift * back;
  const logGlow = Math.max(io(t, TL + 0.3, 0.5) * (1 - io(t, TT, 0.8) * 0.6), lift * K.clamp(1 - K.seg(t, TB + 3.2, TB + 4.6) * 0.5));
  const st = M.street(t, {
    x: cam.x, y: cam.y, s: cam.s,
    house: { workFolder: 1, shelfFocus: 'Claude-work', hatch: hatchK, alpha: houseA },
    road: { x1: 3400, label: false },
    vendor: { office: 1 - lift, spare: 1 - lift, logbook: io(t, TL + 0.2, 0.6), logGlow, alpha: anthA },
  });
  K.layer(hatchK, () => M.hatchLine(st.house, st.vendor, { to: 'Claude-work', w: 3, on: 1 }));
  // the road's own label, faded by hand (it would land in the caption band once the camera moves)
  M.label('across town', st.at(1445, 0)[0], st.at(0, 912)[1], { color: C.soft, italic: true, alpha: 1 - io(t, TL, 0.4) });

  // the second landlord, down the road
  const gk = io(t, TO + 0.1, 1.3);
  const gv = M.vendor(t, { x: cam.x + GX * cam.s, y: cam.y + 230 * cam.s, s: cam.s, k: gk, alpha: K.lerp(1, 0.45, back) * (1 - 0.35 * lift),
    name: 'GOOGLE · GEMINI APPS', slots: 0.8, logbook: io(t, TO + 0.9, 0.5), logGlow: io(t, TO + 1.2, 0.5) * (1 - back) });

  // ------------------------------------------------------------- the ledger (a logbook opened beside the building)
  const LX = 740, LY = 150, LW = 1090, LH = 760, X0 = LX + 48, X1 = LX + LW - 48;
  const open1 = io(t, TL + 0.5, 0.7) * (1 - io(t, TO - 0.15, 0.5));
  const open2 = io(t, TO + 1.45, 0.7) * (1 - io(t, TQ - 0.1, 0.5));
  function ledger(k, lb, fn) {
    if (k <= 0.002) return;
    // the thread from the building's logbook to the opened ledger
    if (lb) K.line(lb.x + 120 * cam.s, lb.y - 8, LX, lb.y - 8, { k: K.clamp(k * 1.4), color: C.head, w: 2.5, dash: [3, 9], alpha: 0.8 });
    g.save(); g.translate(LX, 0); g.scale(K.ease.out(k), 1); g.translate(-LX, 0);   // a hinge on the left edge, no overshoot
    K.card(LX, LY, LW, LH, { r: 24, fill: K.mixColor(C.panel, C.tile, 0.5), stroke: K.mixColor(C.line2, C.head, 0.3), alpha: K.clamp(k * 2) });
    K.line(LX + 22, LY + 24, LX + 22, LY + LH - 24, { color: K.rgba(C.head, 0.35), w: 2 });      // the book's spine
    g.restore();
    K.layer(K.clamp((k - 0.7) / 0.3), fn);
  }
  // one page of the ledger; slides in from the right and out to the left
  function page(a, b, fn) {
    const kin = io(t, a, 0.45), kout = io(t, b, 0.35), al = kin * (1 - kout);
    if (al <= 0.002) return;
    K.layer(al, () => K.at((1 - kin) * 36 - kout * 36, 0, 1, 0, fn));
  }
  const head = (eyebrow, entry) => {
    K.eyebrow(eyebrow, X0, LY + 56, { ...M.T.eyebrow, size: 26, color: C.head });
    if (entry) K.text(entry, X1, LY + 60, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'right' });
    K.line(X0, LY + 86, X1, LY + 86, { color: C.line2, w: 1.5 });
  };
  const pillAt = (s, x, y, o = {}) => M.pillL(s, x, y, { size: 26, ...o });
  const lit = (a) => io(t, a, 0.4);

  // ---- entry 1: training
  ledger(open1, st.vendor.logbook, () => {
    K.eyebrow("THE LANDLORD'S LOGBOOK", X0, LY + 56, { ...M.T.eyebrow, size: 26, color: C.head, alpha: 1 });
    page(TT - 0.2, TM - 0.25, () => {
      K.text('entry 1 · training', X1, LY + 60, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'right' });
      K.line(X0, LY + 86, X1, LY + 86, { color: C.line2, w: 1.5 });
      const dimA = 1 - 0.7 * io(t, TA, 0.5);
      // the plans: consumer row (on "Free"), commercial row (on "Team")
      const rowY1 = LY + 150, rowY2 = LY + 214, c0 = X0 + 250;
      const tHelp = find('Help', 0, TT + 6.5), tFive = find('five', 0, TT + 10.9);
      const tFree = find('Free', 0, TT + 2.3), tTeam = find('Team', 0, TT + 19.6), tPro2 = find('Pro', 1, TT + 17.2);
      K.layer(lit(tFree) * dimA, () => {
        K.text('consumer', X0, rowY1 + 9, { font: 'ui', weight: 600, size: 26, color: K.mixColor(C.body, C.head, io(t, tPro2, 0.5)) });
        let x = c0;
        for (const [s, i] of [['Free', 0], ['Pro', 1], ['Max', 2]]) {
          const w = pillAt(s, x, rowY1, { color: C.strong, stroke: K.mixColor(C.line2, C.head, 0.5), alpha: K.stagger(t, tFree, i, 0.25, 0.4) });
          if (s === 'Pro') { const k = io(t, tPro2, 0.6); if (k > 0) K.ring(x + w / 2, rowY1, w / 2 + 6, 30, k, { color: C.head, w: 3, rot: 0 }); }
          x += w + 14;
        }
        pillAt('incl. Claude Code', x + 8, rowY1, { font: 'mono', weight: 400, color: C.body, fill: C.panel, alpha: lit(find('Code', 0, TT + 4.6)) });
      });
      K.layer(lit(tTeam) * dimA, () => {
        K.text('commercial terms', X0, rowY2 + 9, { font: 'ui', weight: 600, size: 26, color: C.body });
        let x = c0;
        ['Team', 'Enterprise', 'API', 'Gov', 'Education'].forEach((s, i) => {
          x += pillAt(s, x, rowY2, { color: C.body, stroke: C.line2, alpha: K.stagger(t, tTeam, i, 0.22, 0.4) }) + 14;
        });
      });
      // the toggle (on "Help"), its two states (on "On," and "off,")
      const tgY = LY + 300, tOn = find('On', 0, TT + 9.0, { whole: true }), tOff = find('off', 0, TT + 12.3, { whole: true });
      const flip = io(t, TA + 0.1, 0.6);
      K.layer(lit(tHelp), () => {
        const w = M.toggle(X0, tgY, 1 - flip, { label: 'Help improve our AI models' });
        pillAt('Settings › Privacy', X0 + w + 26, tgY, { font: 'mono', weight: 400, color: C.body, fill: C.panel });
      });
      const pY = LY + 376;
      const onW = pillAt('on · kept up to 5 years', X0, pY, { color: C.page, fill: C.head, stroke: C.head, alpha: lit(tOn) * (1 - 0.65 * flip) });
      pillAt('off · deleted chats purged within 30 days', X0 + onW + 20, pY, { color: C.strong, stroke: K.mixColor(C.line2, C.strong, 0.6), alpha: lit(tOff) * dimA });
      // the sources under it
      const cY = LY + 440;
      // one source card at a time in the same slot: Claude Code included, then 5 years, then (below) already started
      const outCards = 1 - io(t, TA - 0.1, 0.4);
      M.dated(X0, cY, X1 - X0, { eyebrow: 'Anthropic · consumer terms update · 2025-08-28 (still current)', body: 'including when they use Claude Code from accounts associated with those plans', quote: true, size: 30, alpha: lit(find('included', 0, TT + 4.4) - 0.15) * (1 - io(t, tHelp - 0.4, 0.3)) });
      // [[training]] on "Help improve our AI models": the real Help Center page (capture oct6, shot 'change') names the
      // setting and where it lives; the drawn toggle above stays as the ledger's picture of it
      const wk = io(t, tHelp - 0.05, 0.45) * (1 - io(t, tFive - 0.3, 0.35));
      if (wk > 0.002) K.layer(wk, () => K.at((1 - wk) * 24, 0, 1, 0, () => {
        const r = K.win(X0, cY + 6, X1 - X0, 50 + Math.round((X1 - X0) * 140 / 1100), { kind: 'browser', url: 'support.claude.com/en/articles/15520349', compact: true });
        // the shot has no mark box on this line, so the crop is in its own source pixels: the last two lines of the
        // "Your folders stay on your computer" paragraph (1920x1080 shot; the Settings > Privacy line ends near y 965)
        const p = K.image('oct6/change', r.x, r.y, r.w, r.h, { fit: 'cover', crop: [600, 880, 1100, Math.min(1100 * r.h / r.w, 200)], r: 0 });
        if (p) {
          const ck = io(t, tHelp + 0.5, 0.5);
          const [hx, hy] = p.at(650, 922), [hx2, hy2] = p.at(1424, 968);
          g.save(); g.globalAlpha *= 0.55 * ck; g.fillStyle = C.page;
          g.fillRect(r.x, r.y, r.w, hy - 4 - r.y); g.fillRect(r.x, hy2 + 4, r.w, r.y + r.h - hy2 - 4); g.restore();
          g.save(); g.globalAlpha *= ck; K.rr(hx - 10, hy - 4, hx2 - hx + 20, hy2 - hy + 8, 10); g.strokeStyle = C.head; g.lineWidth = 3; g.stroke(); g.restore();
        }
      }));
      M.dated(X0, cY, X1 - X0, { eyebrow: 'Anthropic Privacy Center · 2026-07-01', body: 'kept “for up to 5 years”, de-identified, with the setting on', size: 30, alpha: io(t, tFive + 0.15, 0.4) * (1 - io(t, tPro2 - 0.3, 0.4)) * outCards });
      // [[already]]: the toggle flips off, but training that already started keeps the file
      const ak = io(t, TA + 0.3, 0.5);
      if (ak > 0) {
        M.dated(X0, cY, 760, { eyebrow: 'Anthropic · consumer terms update · 2025-08-28', body: 'Your data will still be included in model training that has already started', quote: true, size: 30, footer: true, alpha: ak });
        const gx = X1 - 110, gy = cY + 92;
        K.layer(ak, () => {
          K.glow(gx, gy, 90, C.head, 0.18);
          K.at(gx, gy, 1, t * 1.1, () => K.icon('gear', 0, 0, 120, { color: C.head, w: 3 }));
          K.file(gx, gy + 2, 46, { alpha: 0.95 });
          M.label('training', gx, gy + 104, { color: C.head });
          M.label('already started', gx, gy + 138, { color: C.head });
        });
      }
    });
    // ---- entry 2: memory
    page(TM - 0.15, TC - 0.25, () => {
      K.text('entry 2 · memory', X1, LY + 60, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'right' });
      K.line(X0, LY + 86, X1, LY + 86, { color: C.line2, w: 1.5 });
      const tDel = after('delete', TM, TM + 3), del = io(t, tDel, 0.6);
      // a chat, and the separate memory store beside it
      const chX = X0, chY = LY + 130, chW = 330, chH = 190;
      K.layer(1 - 0.6 * del, () => {
        if (del < 0.5) K.card(chX, chY, chW, chH, { r: 18, fill: C.tile, stroke: C.line2 });
        else M.dashedRR(chX, chY, chW, chH, 18, { color: C.line2 });
        K.icon('chat', chX + 60, chY + 66, 52, { color: C.body, w: 2.6 });
        K.text('a chat', chX + 104, chY + 76, { font: 'ui', weight: 600, size: 30, color: C.strong });
        for (let i = 0; i < 3; i++) K.line(chX + 34, chY + 124 + i * 20, chX + chW - (i === 2 ? 140 : 40), chY + 124 + i * 20, { color: C.line2, w: 3 });
      });
      if (del > 0) {   // deleted: struck through
        K.line(chX + 20, chY + 20, chX + chW - 20, chY + chH - 20, { k: del, color: C.soft, w: 4 });
        K.line(chX + chW - 20, chY + 20, chX + 20, chY + chH - 20, { k: K.clamp(del * 1.6 - 0.6), color: C.soft, w: 4 });
        M.label('deleted', chX + chW / 2, chY + chH + 40, { color: C.soft, alpha: del });
      }
      const mX = X0 + 470, mW = X1 - mX, mY = chY - 10, mH = chH + 20, sk = lit(after('separate', TM, TM + 1.5));
      K.layer(sk, () => {
        M.dashedRR(mX, mY, mW, mH, 18, { color: K.mixColor(C.line2, C.head, 0.5), fill: K.rgba(C.head, 0.04) });
        K.eyebrow('memory · a separate store', mX + 28, mY + 44, { ...M.T.eyebrow, size: 24, color: C.head });
      });
      const chips = [[mX + 40, mY + 112], [mX + 40, mY + 170]];
      chips.forEach(([x, y], i) => {
        const a = K.stagger(t, after('separate', TM, TM + 1.5) + 0.3, i, 0.25, 0.4);
        if (a <= 0) return;
        K.line(chX + chW, chY + 90 + i * 30, x, y, { color: C.head, w: 2, dash: [4, 8], alpha: a * (1 - del) * 0.8 });
        pillAt('memory entry', x, y, { icon: 'brain', iconColor: C.head, color: C.strong, fill: C.tile, stroke: C.head, alpha: a, glow: 0.25 * del });
      });
      pillAt('delete them: Settings › Memory', X1, LY + 380, { align: 'right', font: 'mono', weight: 400, color: C.body, fill: C.panel, alpha: lit(after('until', TM, TM + 3.5)) });
      const cY = LY + 430;
      const h = M.dated(X0, cY, X1 - X0, { eyebrow: 'Anthropic Help Center · memory · 2026-09-30', body: 'When a conversation expires or is deleted, related memory entries generated from it won’t be removed', quote: true, size: 28, alpha: lit(tDel + 0.4) });
      M.label('memory is on by default: Free, Pro, Max', X0, cY + h + 40, { align: 'left', color: C.soft, alpha: lit(tDel + 1.2) });
    });
    // ---- entry 3: accounts
    page(TC - 0.15, TO - 0.3, () => {
      K.text('entry 3 · accounts', X1, LY + 60, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'right' });
      K.line(X0, LY + 86, X1, LY + 86, { color: C.line2, w: 1.5 });
      const tW = after('work', TC, TC + 0.8), tSep = after('separate', TC, TC + 1.9), tSh = after('shared', TC, TC + 3.2);
      const cL = [X0, (X0 + X1) / 2 - 12], cR = [(X0 + X1) / 2 + 12, X1], ay = LY + 160;
      [['work', 'laptop', cL], ['home', 'house', cR]].forEach(([s, ic, [c0, c1]], i) => {
        const a = K.stagger(t, tW, i, 0.35, 0.45);
        K.layer(a, () => {
          const x = (c0 + c1) / 2;
          K.iconTile(ic, x - 140, ay, 96, { color: C.head });
          M.label(s + ' account', x - 70, ay + 10, { color: C.strong, size: 30, align: 'left' });
        });
      });
      K.line((X0 + X1) / 2, LY + 110, (X0 + X1) / 2, LY + 470, { k: lit(tW + 0.4), color: C.line2, w: 2 });
      // unspoken notes under each account (spec C103.5): what the employer can see, what a Public share shows
      const nY = LY + 240;
      const hA = M.dated(cL[0], nY, cL[1] - cL[0], { eyebrow: 'Anthropic Help Center · Use Claude Cowork safely · 2026-10-06', body: 'Cowork on web and mobile “is captured in Compliance API”: your employer’s record', size: 26, alpha: lit(tSep) });
      const hB = M.dated(cR[0], nY, cR[1] - cR[0], { eyebrow: 'Claude Code docs · in the cloud · read 2026-10-14', body: 'Shared as Public: anyone logged into claude.ai sees it. “Sessions may contain code and credentials”', size: 26, alpha: K.stagger(t, tSep, 1, 0.3, 0.4) });
      const cY = nY + Math.max(hA, hB) + 22;
      M.dated(X0, cY, X1 - X0, { eyebrow: 'Anthropic Help Center · Cowork on web, desktop and mobile · 2026-10-06', body: 'Shared logins aren’t supported', quote: true, size: 30, alpha: lit(tSh) });
    });
  });

  // ---- the second landlord's logbook
  ledger(open2, gv.logbook, () => {
    K.eyebrow("THE OTHER LANDLORD'S LOGBOOK", X0, LY + 56, { ...M.T.eyebrow, size: 26, color: C.head });
    K.text('Gemini Apps', X1, LY + 60, { font: 'ui', weight: 600, size: 30, color: C.strong, align: 'right' });
    K.line(X0, LY + 86, X1, LY + 86, { color: C.line2, w: 1.5 });
    const rows = [
      ['person', 'human reviewers look at some chats', find('human', 0, TO + 2.8)],
      ['clock', 'reviewed chats: kept up to 3 years', find('reviewed', 0, TO + 6.6)],
      ['cross', 'not deleted when you delete your activity', find('even', 0, TO + 9.6)],
      ['clock', 'Keep Activity off: kept 72 hours', find('even', 0, TO + 9.6) + 0.9],
    ];
    rows.forEach(([ic, s, at], i) => {
      const a = lit(at), y = LY + 150 + i * 62;
      K.layer(a, () => {
        K.icon(ic, X0 + 22, y - 9, 36, { color: i === 3 ? C.body : C.head, w: 2.6 });
        K.text(s, X0 + 62, y, { font: 'ui', weight: 600, size: 30, color: i === 3 ? C.body : C.strong });
      });
    });
    M.dated(X0, LY + 420, X1 - X0, { eyebrow: 'Google · Gemini Apps Privacy Hub · page updated 2026-10-13', body: 'Please don’t enter confidential information that you wouldn’t want a reviewer to see', quote: true, size: 30, footer: 'what changed on 10-13 isn’t stated', alpha: lit(find('Gemini', 0, TO + 4.4) + 0.4) });
    M.asOf(X0, LY + LH - 46, { alpha: lit(find('Gemini', 0, TO + 4.4) + 0.8) });
  });

  // ------------------------------------------------------------- four questions to ask any tool
  const qk = io(t, TQ + 0.6, 0.7);
  if (qk > 0) {
    const qx = 120, qy = 190, qw = 880, qh = 660;
    K.layer(qk, () => K.at(0, (1 - qk) * 18, 1, 0, () => {
      K.card(qx, qy, qw, qh, { r: 24, stroke: C.line2 });
      K.eyebrow('ask any tool', qx + 48, qy + 66, { ...M.T.eyebrow, size: 26, color: C.head });
      K.title('Four questions', qx + 48, qy + 140, { size: 56 });
      const qs = [
        ['Is there a training setting?', after('is', TQ, TQ + 2.7)],
        ['Do people review chats?', after('do', TQ, TQ + 4.5)],
        ['How long is data kept with it off?', after('how', TQ, TQ + 6.6)],
        ['What does deleting reach?', after('what', TQ, TQ + 9.3)],
      ];
      qs.forEach(([s, at], i) => {
        const a = lit(at - 0.1), y = qy + 240 + i * 92;
        if (a <= 0) return;
        const hot = i === 3 ? io(t, TB + 0.6, 0.6) : 0;
        K.layer(a, () => K.at((1 - a) * 20, 0, 1, 0, () => {
          if (hot > 0) { g.save(); g.globalAlpha *= hot; K.rr(qx + 28, y - 46, qw - 56, 76, 16); g.fillStyle = K.rgba(C.head, 0.1); g.fill(); g.strokeStyle = K.rgba(C.head, 0.6); g.lineWidth = 2; g.stroke(); g.restore(); }
          g.save(); g.beginPath(); g.arc(qx + 76, y - 10, 24, 0, 7); g.fillStyle = K.mixColor(C.panel, C.head, 0.2); g.fill(); g.strokeStyle = C.head; g.lineWidth = 2; g.stroke(); g.restore();
          K.text(String(i + 1), qx + 76, y, { font: 'ui', weight: 700, size: 26, color: C.head, align: 'center' });
          K.text(s, qx + 124, y, { font: 'read', size: 34, color: C.strong });
        }));
      });
      M.asOf(qx + 48, qy + qh - 52, { alpha: lit(TQ + 1.2) });
    }));
  }

  // ------------------------------------------------------------- where the picture breaks: copies stay behind
  const bk = io(t, TB + 0.2, 0.6);
  if (bk > 0) {
    M.breaks(1110, 222, { alpha: bk });
    K.text('leaving a room doesn’t take every copy', 1110, 278, { font: 'read', size: 30, color: C.strong, alpha: io(t, TB + 0.7, 0.6) });
    // the deleted chat's two memory entries, still in the landlord's logbook
    const lb = st.vendor.logbook, ck = io(t, TB + 1.4, 0.6), pulse = K.env(t, TB + 1.6, TB + 3.6, 0.6);
    const cx = st.vendor.x + st.vendor.w / 2;
    [0, 1].forEach((i) => {
      const y = lb.y - 150 + i * 60, a = K.stagger(t, TB + 1.4, i, 0.25, 0.5);
      if (a <= 0) return;
      K.glow(cx, y, 120, C.head, 0.2 * pulse * a);
      M.pillL('memory entry', cx, y, { align: 'center', size: 26, icon: 'brain', iconColor: C.head, color: C.strong, fill: C.tile, stroke: C.head, glow: 0.5 * pulse, alpha: a * ck });
    });
    ['chat deleted;', 'these stay'].forEach((s, i) => K.text(s, cx, lb.y - 250 + i * 32, { font: 'ui', weight: 600, size: 26, color: C.head, align: 'center', alpha: io(t, TB + 2, 0.6) }));
  }
});
