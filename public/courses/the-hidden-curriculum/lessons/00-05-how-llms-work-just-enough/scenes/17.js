/* 17 — Desks that never close: personal agents
   A small office with its own lamp and desk, window lit at night, that you text from a phone. It slides into a house
   ("self-hosted": OpenClaw, Hermes Agent; the Feb 2026 exposure), then a second office appears in a company tower
   ("hosted": Muse, dots, Gemini Spark). Anthropic's nearest pieces sit between them. Handover: everything dims; the guest
   palette starts only after "Here's June." and June's lower-third arrives with scene 18. */
SCENE('17', (t, S) => {
  const C = K.C, P = M.palette;
  const W = (re, n, fb) => S.find(re, n, fb);

  // ---- cues and words (local seconds; fallbacks = measured times)
  const cAlways = S.cue('always-on', 2.58), cSelf = S.cue('self-hosted', 13.6), cSec = S.cue('security', 33.55);
  const cHost = S.cue('hosted', 40.39), cAnth = S.cue('anthropic', 60.83), cHand = S.cue('handover', 72.05);
  const wRuns = W(/^runs$/i, 0, 3.9), wOwn = W(/^own$/i, 0, 5.9), wMsg = W(/^message$/i, 0, 7.4);
  const wLong = W(/^long$/i, 0, 9.6), wBroad = W(/^broad$/i, 0, 11.3);
  const wSelfH = W(/^self-hosted/i, 0, 15.8), wClaw = W(/^openclaw$/i, 0, 17.0), wHermes = W(/^hermes$/i, 0, 21.9);
  const wSkills = W(/^skills/i, 0, 28.9), wYour = W(/^your$/i, 0, 30.0);
  const wHundred = W(/^hundred$/i, 0, 37.1), wInstalls = W(/^installs$/i, 0, 38.0);
  const wHosted = W(/^hosted$/i, 0, 41.7), wMuse = W(/^muse$/i, 0, 44.3), wDots = W(/^dots$/i, 0, 49.3);
  const wRolling = W(/^rolling$/i, 0, 51.7), wSpark = W(/^gemini$/i, 0, 54.3);
  const wPaid = W(/^(paid|ultra|top)$/i, 0, wSpark + 1.9);   // survives a re-voice of the Spark line
  const wTheir = W(/^their$/i, 0, 57.7);
  const wCloud = W(/^cloud$/i, 0, 62.9), wRout = W(/^routines/i, 0, 64.9), wDisp = W(/^dispatch/i, 0, 66.3);
  const wPhone = W(/^phone/i, 0, 68.7), wLesson = W(/^lesson$/i, 0, 70.1), wHere = W(/^here's$/i, 0, 74.6);

  // ---- guest tone + handover dim
  // Narrator scene: normal indigo backdrop. The guest palette only starts once the narrator has finished
  // ("Here's June." ends at the section end), so it completes inside the crossfade into 18 (gk = 1 there).
  const wJune = W(/^june/i, 0, 75.1);
  const tVoiceEnd = Math.max(wJune + 0.5, S.dur || 75.8);
  const gk = K.io(t, tVoiceEnd - 0.1, 0.9);
  const tone = M.tone(gk);
  const dim = 1 - 0.45 * K.io(t, cHand, 1.0);
  K.bg({ glow: 0.1 + 0.65 * gk });

  // ---- the office: card + lit shoji window + spinning clock + its own mini workspace (local 600 x 400, centred)
  const office = (x, y, s, lit, a) => K.layer(a, () => K.at(x, y, s, 0, () => {
    const g = K.ctx();
    K.card(-300, -200, 600, 400, { r: 26, fill: K.rgba(C.tile, 0.92), stroke: M.mixHex(C.line2, C.head, 0.55 * lit), glow: 0.25 * lit, lw: 2 });
    // window (top right)
    const wx = 150, wy = -160, ww = 112, wh = 120;
    if (lit > 0) K.glow(wx + ww / 2, wy + wh / 2, 130, tone.lamp, 0.28 * lit);
    K.card(wx, wy, ww, wh, { r: 8, fill: M.mixHex('#1E1A24', '#F2C878', 0.12 + 0.78 * lit), stroke: P.beam, shadow: false, lw: 4 });
    g.save(); g.strokeStyle = P.woodDark; g.lineWidth = 4;
    g.beginPath(); g.moveTo(wx + ww / 2, wy + 4); g.lineTo(wx + ww / 2, wy + wh - 4);
    g.moveTo(wx + 4, wy + wh / 2); g.lineTo(wx + ww - 4, wy + wh / 2); g.stroke(); g.restore();
    // clock (top left): hands keep turning once it is "always on"
    const cx = -222, cy = -122, r = 36, run = Math.max(0, t - cAlways);
    g.save(); g.strokeStyle = M.mixHex(C.line2, C.head, lit); g.lineWidth = 3.5;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    const hand = (ang, len, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len); g.stroke(); };
    g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const a2 = i * Math.PI / 2; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + Math.sin(a2) * r * 0.78, cy - Math.cos(a2) * r * 0.78); g.lineTo(cx + Math.sin(a2) * r * 0.92, cy - Math.cos(a2) * r * 0.92); g.stroke(); }
    hand(0.6 + run * 2.4, r * 0.7, 3);
    hand(2.2 + run * 0.2, r * 0.42, 5);
    g.fillStyle = M.mixHex(C.line2, C.head, lit); g.beginPath(); g.arc(cx, cy, 4.5, 0, Math.PI * 2); g.fill();
    g.restore();
    // the desk inside
    M.mini(t, -40, 70, 0.62, { dark: 1 - lit });
  }));

  // ---- phase weights
  const offK = K.io(t, cSelf, 0.8);                    // the office slides into the house
  const introA = 1 - K.io(t, cSelf, 0.5);              // the phone (it sits where the house is built)
  // the four property labels sit on the empty right half, so they can stay readable a while longer:
  // until "self-hosted" is said (>= 4 s after "broad permissions" lands), before the tiles start.
  const labelsA = 1 - K.io(t, Math.max(cSelf + 1, wBroad + 3, wSelfH - 0.3), 0.5);
  const litA = 0.25 + 0.75 * K.io(t, cAlways, 0.9);

  K.layer(dim, () => {
    // ================= self-hosted: the house (left)
    const houseK = K.io(t, cSelf + 0.3, 0.8);
    if (houseK > 0) {
      const g = K.ctx();
      const warnK = K.io(t, cSec, 0.6);
      const stroke = M.mixHex(C.line2, C.accent, 0.6 * warnK);
      K.layer(houseK, () => {
        K.card(150, 270, 600, 290, { r: 10, fill: K.rgba(C.page, 0.35), stroke, shadow: false, lw: 2.5 });
      });
      // roof draws itself
      const rk = K.io(t, cSelf + 0.3, 1.0);
      K.line(110, 276, 450, 170, { k: rk, color: stroke, w: 4 });
      K.line(790, 276, 450, 170, { k: rk, color: stroke, w: 4 });
      K.text('self-hosted', 450, 254, { font: 'head', weight: 700, size: 32, color: C.head, align: 'center', alpha: K.io(t, wSelfH - 0.2, 0.5) });
      void g;
    }
    // the office (slides from centre into the house)
    const ox = K.lerp(960, 450, offK), oy = 420, os = K.lerp(1, 0.567, offK);
    office(ox, oy, os, litA, 1);

    // ================= phase A labels: always on, own computer, long memory, broad permissions; the phone
    if (labelsA > 0) K.layer(labelsA, () => {
      const items = [
        ['clock', 'always on', wRuns, 300],
        ['laptop', 'its own computer', wOwn, 380],
        ['brain', 'long memory', wLong, 460],
        ['key', 'broad permissions', wBroad, 540],
      ];
      items.forEach(([ic, s, at, y]) => {
        const k = K.io(t, at, 0.5);
        if (k <= 0) return;
        K.layer(k, () => K.at((1 - k) * 14, 0, 1, 0, () => {
          K.icon(ic, 1340, y, 38, { color: C.head });
          K.text(s, 1382, y + 10, { font: 'ui', weight: 600, size: 30, color: C.strong });
        }));
      });
    });
    if (introA > 0) K.layer(introA, () => {
      // the phone (bottom left) and chat bubbles flying to the office
      const pk = K.io(t, wMsg - 0.3, 0.5);
      if (pk > 0) K.layer(pk, () => {
        K.iconTile('phone', 470, 730, 100, { glow: 0.3 });
        K.text('from a chat app', 470, 812, { font: 'ui', weight: 600, size: 28, color: C.body, align: 'center' });
        const t0 = wMsg, per = 1.7;
        for (let i = 0; i < 4; i++) {
          const tt = t - t0 - i * per * 0.5;
          if (tt < 0) continue;
          const p = (tt % (per * 2)) / per;
          if (p > 1) continue;
          const e = K.ease ? K.ease.io(p) : p;
          const x0 = 530, y0 = 690, x1 = 650, y1 = 520, bx = 560, by = 560;
          const bxp = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * bx + e * e * x1;
          const byp = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * by + e * e * y1;
          const a = Math.min(1, p * 5, (1 - p) * 5) * (1 - K.io(t, cSelf - 0.3, 0.3));
          K.icon('chat', bxp, byp, 34, { color: C.head, alpha: a });
        }
      });
    });

    // ================= self-hosted tiles + skill file + caption
    const tile = (x0, y, w, name, meta, right, k) => {
      if (k <= 0) return;
      K.layer(k, () => K.at(0, (1 - k) * 12, 1, 0, () => {
        K.card(x0, y - 30, w, 60, { r: 16, fill: K.rgba(C.tile, 0.9), stroke: K.rgba(C.head, 0.35), shadow: false });
        K.spans([{ s: name, color: C.strong, size: 30, weight: 700 }, { s: meta, color: C.soft, size: 26, weight: 600 }], x0 + 24, y + 10, { font: 'ui' });
        if (right) right(x0 + w - 20, y);
      }));
    };
    tile(140, 604, 620, 'OpenClaw', '  ·  was Clawdbot', (x, y) => M.dated('Jan 2026', x, y + 8, { align: 'right' }), K.io(t, wClaw, 0.5));
    tile(140, 672, 620, 'Hermes Agent', '  ·  Nous Research', (x, y) => M.dated('Feb 2026', x, y + 8, { align: 'right' }), K.io(t, wHermes, 0.5));
    // Hermes writes its own skill
    const skK = K.io(t, wSkills - 0.6, 0.6, 'back') * (1 - K.io(t, cHost, 0.5));
    if (skK > 0) K.layer(Math.min(1, skK), () => {
      K.line(770, 672, 800, 672, { color: C.head, w: 2, dash: [5, 5], alpha: 0.7 });
      K.at(860, 650, 0.6 + 0.4 * skK, 0, () => M.file(0, 0, 96, { ext: 'md', name: 'SKILL.md', nameSize: 26, glow: 0.4 }));
    });
    K.text('your machine, your keys, your risk', 450, 816, { font: 'read', italic: true, size: 32, color: tone.accent, align: 'center', alpha: K.io(t, wYour, 0.6) });

    // ================= security: Feb 2026 exposure
    const secK = K.io(t, cSec, 0.6);
    if (secK > 0) {
      // warning triangles drop onto the roof
      [[270, 214], [450, 154], [630, 214]].forEach(([x, y], i) => {
        const k = K.io(t, cSec + 0.15 * i, 0.5, 'out');
        if (k <= 0) return;
        K.icon('warning', x, y - 6 - (1 - k) * 90, 44, { color: C.accent, alpha: k * (1 - 0.35 * K.io(t, cHost, 0.6)) });
      });
      // the stat card (right half, before the tower arrives)
      const cardA = secK * (1 - K.io(t, cHost - 0.2, 0.5));
      if (cardA > 0) K.layer(cardA, () => K.at(0, (1 - secK) * 16, 1, 0, () => {
        K.card(1080, 250, 640, 300, { r: 22, fill: K.rgba(C.tile, 0.92), stroke: K.rgba(C.accent, 0.8), glow: 0.2, lw: 2 });
        K.icon('warning', 1136, 306, 40, { color: C.accent });
        K.text('FEB 2026 · OPENCLAW', 1172, 314, { font: 'ui', weight: 700, size: 22, tracking: 3, color: C.accent });
        K.text('100,000+', 1120, 432, { font: 'head', weight: 700, size: 84, color: C.strong, alpha: K.io(t, wHundred, 0.5) });
        K.text('installs open to the internet', 1120, 496, { font: 'ui', weight: 600, size: 32, color: C.body, alpha: K.io(t, wInstalls, 0.5) });
      }));
    }

    // ================= hosted: the company tower (right)
    const towK = K.io(t, cHost, 0.8);
    if (towK > 0) {
      K.layer(towK, () => K.at(0, (1 - towK) * 40, 1, 0, () => {
        const g = K.ctx();
        K.card(1160, 160, 600, 400, { r: 14, fill: K.rgba(C.page, 0.45), stroke: C.line2, shadow: false, lw: 2.5 });
        // facade windows
        g.save();
        for (let r = 0; r < 6; r++) for (const cx of [1184, 1222, 1700, 1738]) {
          const on = ((r * 7 + cx) % 3) !== 0;
          g.fillStyle = on ? K.rgba(tone.lamp, 0.35) : K.rgba(C.line2, 0.5);
          g.fillRect(cx - 8, 236 + r * 50, 16, 26);
        }
        g.restore();
        K.text('hosted', 1460, 214, { font: 'head', weight: 700, size: 32, color: C.head, align: 'center', alpha: K.io(t, wHosted - 0.2, 0.5) });
      }));
      office(1460, K.lerp(460, 420, towK), 0.567 * (0.9 + 0.1 * towK), 1, towK);
    }
    tile(1160, 604, 600, 'Muse', '  ·  Meta', (x, y) => M.dated('Sep 2026 · US', x, y + 8, { align: 'right' }), K.io(t, wMuse, 0.5));
    tile(1160, 672, 600, 'dots', '  ·  OpenAI', (x, y) => {
      const k = K.io(t, wRolling, 0.5);
      if (k > 0) { const fw = K.measure('ROLLING OUT', { font: 'ui', weight: 700, size: 22, tracking: 2.5 }) + 36; M.flag('rolling out', x - fw / 2, y, { alpha: k }); }
    }, K.io(t, wDots, 0.5));
    tile(1160, 740, 600, 'Gemini Spark', '  ·  Google', (x, y) => K.text('Ultra plan', x, y + 9, { font: 'ui', weight: 600, size: 26, color: C.body, align: 'right', alpha: K.io(t, wPaid, 0.5) }), K.io(t, wSpark, 0.5));
    K.text('their computer, their approval rules', 1460, 816, { font: 'read', italic: true, size: 32, color: tone.accent, align: 'center', alpha: K.io(t, wTheir, 0.6) });

    // ================= Anthropic's nearest pieces (between the two)
    const anK = K.io(t, cAnth, 0.6);
    if (anK > 0) {
      K.layer(anK, () => K.text("ANTHROPIC'S NEAREST", 960, 330, { font: 'ui', weight: 700, size: 22, tracking: 3, color: C.head, align: 'center' }));
      const chip = (s, y, at) => {
        const k = K.io(t, at, 0.5, 'out');
        if (k <= 0) return;
        K.layer(k, () => K.pill(s, 960, y + (1 - k) * 10, { size: 28, color: C.strong, stroke: K.rgba(C.head, 0.6) }));
      };
      chip('cloud sessions', 392, wCloud);
      chip('routines', 462, wRout);
      chip('Dispatch', 532, wDisp);
      M.flag('preview', 960, 586, { alpha: K.io(t, wDisp + 0.3, 0.5) });
      K.layer(K.io(t, wPhone - 0.8, 0.5), () => {
        K.icon('phone', 823, 640, 30, { color: C.head });
        K.text('task from your phone', 846, 649, { font: 'ui', weight: 600, size: 26, color: C.body });
      });
    }
    M.shelf('Trust', 1840, 880, { k: K.io(t, wLesson, 0.6) * (1 - K.io(t, cHand, 0.6)) });
  });

  // June's lower-third is not drawn here: scene 18 shows it from its first frame, so it arrives with her voice.
  void wHere;
});
