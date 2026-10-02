/* 18 — Myth or still true? Part one [guest: June]
   The hall desk becomes a quiz table. Each myth card slides onto the left of the desk, gets its verdict
   stamp, flips to its true side, and the right half of the desk shows the thing that is true (the taped
   dial from 08, the three memory sources from 09, the pile from 05, the two wells from 07, the studio
   hand-off from 06). When the next myth arrives, the flipped card shrinks into a fan along the desk's far
   edge (left of the clerk). Exit: five flipped cards in the fan, counter "myth 5/10". */
SCENE('18', (t, S) => {
  // indigo base kept under the guest (review: a 0.75 bg glow turned the backdrop mustard and hid the badge);
  // the guest's warmth is a soft radial glow behind the lamp only
  K.bg();
  const C = K.C, P = M.palette, g = K.ctx();
  const gk = 1, TN = M.tone(gk), ACC = TN.accent;
  K.glow(960, 170, 520, TN.lamp, 0.25);
  // first spoken occurrence of a word at or after `after`
  const w = (re, after, fb) => {
    for (let i = 0; i < 40; i++) { const v = S.find(re, i, NaN); if (isNaN(v)) break; if (v >= after - 0.01) return v; }
    return fb;
  };
  const m = [S.cue('myth-1', 2.57), S.cue('myth-2', 14.6), S.cue('myth-3', 25.29), S.cue('myth-4', 31.89), S.cue('myth-5', 40.08)];
  const tTen = w(/^Ten/, 0, 0.8);
  const tEnd = Math.max(m[4] + 6, (S.out || S.dur + 0.8) - 1.2);   // last card joins the fan (after "someone else")

  // per-myth beats: verdict stamp and flip (stamp first, flip >= 0.6 s later)
  const tWrong = w(/^Wrong/, m[0], 7.0), tNewest = w(/^newest/, m[0], 8.4), tError = w(/^error/, m[0], 10.0), tNever = w(/^never/, m[0], 12.1);
  const tNotQ = w(/^Not/, m[1], 16.8), tReread = w(/^re-reads/, m[1], 18.0), tProf = w(/^profile/, m[1], 18.7), tSearch = w(/^searches/, m[1], 20.1);
  const tFile = w(/^file/, m[1], 22.1), tNothing = w(/^Nothing/, m[1], 22.7);
  const tNo = w(/^No\./, m[2], 29.2), tFuller = w(/^fuller/, m[2], 29.7), tWorse = w(/^worse/, m[2], 30.7);
  const tMostly = w(/^Mostly/, m[3], 35.1), tSome = w(/^Some/, m[3], 36.4), tBuild = w(/^build/, m[3], 37.4);
  const tWrites = w(/^writes/, m[4], 42.7), tCalls = w(/^calls/, m[4], 44.3), tBrush = w(/^paintbrush/, m[4], 45.8);

  const MY = [
    { n: 1, front: 'Temperature zero gives the same answer every time.', verdict: 'WRONG', st: tWrong, fl: Math.max(tWrong + 1.1, tNewest - 0.2),
      back: 'On the newest Claude models, setting it is an error. And zero never guaranteed one answer.' },
    { n: 2, front: 'It remembers me.', verdict: 'NOT QUITE', st: tNotQ, fl: Math.max(tNotQ + 1.1, tReread - 0.2),
      back: 'It re-reads a profile, searches old chats, or opens a file. Nothing lives inside the model.' },
    { n: 3, front: 'A bigger window means it remembers everything.', verdict: 'WRONG', st: tNo, fl: tNo + 0.6,
      back: 'A fuller desk is a worse desk.' },
    { n: 4, front: 'All AI art is diffusion.', verdict: 'MOSTLY', st: tMostly, fl: tMostly + 1.1,
      back: 'Mostly, not all. Some image models build pictures piece by piece, like text.' },
    { n: 5, front: 'Claude can draw that for you.', verdict: 'HALF TRUE', st: tWrites - 0.5, fl: tWrites + 0.6,
      back: 'It writes code that draws, or it calls another model.' },
  ];

  // ---------------------------------------------------------------- the quiz table (hall desk)
  const D = M.at(M.layout.hall);
  const st = M.stage(t, { desk: D, guest: gk });
  const CL = st.clerk;

  // ---------------------------------------------------------------- counter (top right)
  const nShown = m.filter((x) => t >= x - 0.05).length;
  K.layer(K.io(t, tTen, 0.5), () => {
    const label = nShown === 0 ? '10 myths' : 'myth ' + nShown + '/10';
    const pop = nShown > 0 ? 1 + 0.08 * K.env(t, m[nShown - 1], m[nShown - 1] + 0.35, 0.15) : 1;
    K.at(1720, 176, pop, 0, () => K.pill(label, 0, 0, { size: 30, font: 'mono', color: ACC, stroke: K.rgba(ACC, 0.55) }));
  });

  // ---------------------------------------------------------------- the cards: active spot, fan slots
  const ACT = { x: 690, y: 640, s: 0.95 };
  const fanSlot = (i) => ({ x: 300 + i * 125, y: 404 + Math.pow(i - 2, 2) * 4, s: 0.3, rot: (i - 2) * 0.06 });
  // exit: the five cards line up where scene 19 picks them up (x 560 + 200 n, y 420, ~241 px wide)
  const endSlot = (i) => ({ x: 560 + i * 200, y: 420, s: 0.43 });
  MY.forEach((c, i) => {
    const t0 = m[i];
    if (t < t0 - 0.05) return;
    const fk = i < 4 ? K.io(t, m[i + 1], M.motion.move) : 0;
    const ld = M.land(t, t0, ACT.x, ACT.y, ACT.x - 150, ACT.y, M.motion.land);
    const F = fanSlot(i), E = endSlot(i), ek = K.io(t, tEnd, M.motion.move);
    let x = K.lerp(ld.x, F.x, fk), y = K.lerp(ld.y, F.y, fk), s = K.lerp(ACT.s, F.s, fk), r = F.rot * fk;
    x = K.lerp(x, E.x, ek); y = K.lerp(y, E.y, ek); s = K.lerp(s, E.s, ek); r = K.lerp(r, 0, ek);
    K.at(x, y, 1, r, () => M.myth(t, 0, 0, {
      n: c.n, front: c.front, back: c.back, verdict: c.verdict, s, alpha: ld.a,
      stamp: K.io(t, c.st, 0.6, 'out'), flip: K.io(t, c.fl, 0.8),
    }));
    // the verdict stays on the card after the flip: a small stamp on the back's lower-right corner
    const fl = K.io(t, c.fl, 0.8);
    if (fl > 0.5) {
      const sx = Math.abs(Math.cos(fl * Math.PI)), kk = K.io(t, c.fl + 0.4, 0.4);
      K.at(x, y, s, r, () => K.layer(ld.a * kk, () => K.at(280 - 118, 150 - 46, sx, -0.12, () => {
        const to = { font: 'ui', weight: 700, size: 26, tracking: 4, upper: true }, sw = K.measure(c.verdict, to) + 34;
        g.save(); K.rr(-sw / 2, -25, sw, 50, 9); g.fillStyle = K.rgba(C.page, 0.6); g.fill();
        g.strokeStyle = C.accent; g.lineWidth = 3.5; g.stroke(); g.restore();
        K.text(c.verdict, 0, 10, { ...to, color: C.accent, align: 'center' });
      })));
    }
  });

  // ---------------------------------------------------------------- right half: what is true
  const out = (i) => 1 - K.io(t, i < 4 ? m[i + 1] - 0.1 : tEnd - 0.1, 0.45);   // the right side clears for the next myth
  const lab = (s, x, y, a) => K.text(s, x, y, { ...M.type.label, color: C.strong, align: 'center', alpha: a });

  // myth 1: the temperature dial, taped (an error on the newest models); two runs that still differ
  {
    const a = K.io(t, MY[0].fl + 0.3, 0.6) * out(0);
    if (a > 0) {
      K.layer(a, () => {
        M.dated('Oct 2026', 110, 176, { align: 'left' });
        M.dial(t, 1230, 540, 0, { r: 92, label: 'temperature 0', taped: K.io(t, tError, 1.5) });
        K.layer(K.io(t, tError + 0.4, 0.5), () => K.pill('error', 1230, 400, { size: 26, font: 'mono', color: ACC, stroke: K.rgba(ACC, 0.6) }));
        const rk = K.io(t, tNever, 0.6, 'out');
        if (rk > 0) {
          M.paper(1540, 500 - (1 - rk) * 20, { kind: 'msg', w: 200, h: 96, title: 'run 1', lines: 1, alpha: rk });
          M.paper(1540, 690 - (1 - rk) * 20, { kind: 'msg', w: 200, h: 96, title: 'run 2', lines: 2, alpha: rk });
          K.text('≠', 1540, 612, { font: 'ui', weight: 700, size: 44, color: ACC, align: 'center', alpha: K.io(t, tNever + 0.4, 0.4) });
        }
      });
    }
  }

  // myth 2: three ways text comes back to the desk; nothing stored inside the clerk
  {
    const a = out(1);
    const items = [
      { at: tProf, x: 1160, label: 'a profile it wrote' },
      { at: tSearch, x: 1400, label: 'old chats' },
      { at: tFile, x: 1630, label: 'a file' },
    ];
    items.forEach((it, i) => {
      const ld = M.land(t, it.at - 0.15, it.x, 560, it.x + 80, 560, 0.5);
      if (t < it.at - 0.15) return;
      K.layer(a * ld.a, () => {
        if (i === 0) {
          M.paper(ld.x, ld.y, { kind: 'note', w: 170, h: 130, title: 'profile', lines: 3, rot: -0.03 });
        } else if (i === 1) {
          [[-16, -14, -0.06], [0, 0, 0.02], [16, 14, 0.05]].forEach(([dx, dy, r]) => M.paper(ld.x + dx, ld.y + dy, { kind: 'msg', w: 150, h: 84, rot: r, lines: 2 }));
          K.iconTile('chat', ld.x + 72, ld.y - 58, 54, {});
        } else {
          M.file(ld.x, ld.y - 10, 120, { ext: 'md', name: '' });
        }
        lab(it.label, ld.x, 700, 1);
      });
    });
    // "Nothing lives inside the model": a dashed ring around the clerk, a pill to its right
    const nk = K.io(t, tNothing, 0.6) * a;
    if (nk > 0) {
      K.layer(nk, () => {
        K.ring(CL.x, CL.y, 70, 70, K.io(t, tNothing, 0.7), { color: ACC, w: 3, rot: 0 });
        K.pill('nothing stored inside', CL.x + 250, CL.y, { size: 26, color: C.strong, stroke: K.rgba(ACC, 0.6) });
      });
    }
  }

  // myth 3: the pile from 05: more paper, the middle gets lost
  {
    const a = out(2);
    if (t >= tFuller - 0.3 && a > 0) {
      const PD = M.desk({ w: 520, h: 300 }, { cx: 1330, cy: 600 });
      M.pile(t, PD, 14, { k: K.io(t, tFuller - 0.3, 1.2, 'lin'), seed: 5, w: 130, h: 84, dimMiddle: K.io(t, tWorse, 0.6), alpha: a });
      // the bar starts falling as the pile lands ("a fuller desk") and is already low by "worse"
      K.layer(a * K.io(t, tFuller - 0.3, 0.4), () => {
        M.vbar(1700, 450, 740, 0.9 - 0.58 * K.io(t, tFuller, 0.9), { label: 'accuracy' });
      });
    }
  }

  // myth 4: diffusion (static to picture) beside a picture built tile by tile
  {
    const a = K.io(t, tMostly + 0.2, 0.5) * out(3);
    if (a > 0) {
      K.layer(a, () => {
        M.well(t, 1210, 560, 240, K.io(t, tMostly + 0.3, 3.2, 'sine'), { seed: 7, cells: 40 });
        lab('diffusion', 1210, 740, 1);
        const bk = K.io(t, tSome, 0.5);
        if (bk > 0) K.layer(bk, () => {
          M.well(t, 1540, 560, 240, K.io(t, tBuild, 2.6, 'lin'), { order: 'tiles', cells: 16, seed: 7 });
          lab('piece by piece', 1540, 740, 1);
        });
      });
    }
  }

  // myth 5: code that draws, or a phone call to someone else's studio
  {
    const a = out(4);
    const ck = K.io(t, tWrites, 0.6, 'out');
    if (ck > 0) K.layer(a * ck, () => {
      M.paper(1190, 690 - (1 - ck) * 20, { kind: 'tool', w: 250, h: 150, title: '      draw.py', lines: 3, rot: -0.02 });
      lab('code that draws', 1190, 812, 1);
    });
    const SX = 1515, SY = 380, SS = 1;
    const sk = K.io(t, tCalls - 0.3, 0.6);
    if (sk > 0) {
      K.layer(a * sk, () => K.at(SX, SY, SS, 0, () => M.studio(t, 0, 0, {
        open: K.io(t, tCalls + 0.5, 0.6), show: K.io(t, tCalls + 0.8, 2.6, 'sine'), guest: gk,
      })));
      M.phone(t, CL.x + 58, CL.y + 6, SX, SY + 210 * SS, { k: K.io(t, tCalls, 0.7) * a, pulse: true, bend: -60, color: ACC, alpha: 0.9 * a });
      K.layer(a * K.io(t, tBrush, 0.5), () => lab("someone else's brush", SX + 95 * SS, 848, 1));
    }
  }

  // ---------------------------------------------------------------- guest lower-third (last)
  M.guest(t, gk);
});
