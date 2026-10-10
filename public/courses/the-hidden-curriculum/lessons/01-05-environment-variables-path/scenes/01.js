// 01 · The point (title card).
// Left column: eyebrow, gold title, purpose line from the first frame; the conclusion at [[conclusion]].
// Right: the satchel emblem. It opens on "a copy" (HOME, PATH, KEY cards peek out); at [[path-card]] the PATH card
// lifts and lights, a second gold line sets the PATH half of the conclusion, and three numbered folder-streets draws under the text: street 1's shop lights on
// "first match wins", street 3's twin stays dim. [[depends]]: "who started it" / "when" pills tie to the satchel.
// [[three-symptoms]]: three symptom cards rise one per spoken symptom, then one gold ring: "one idea".
// [[agents-inside]]: the agent courier (sparkle + lantern) walks in, clear of the emblem, and on "work inside it"
// one copied satchel slides along a dashed gold "copy" line onto its hip. Last frame: everything built and resting, petals drifting.
SCENE('01', (t, S) => {
  const K = window.K, C = K.C, M = window.M;

  const cConc = S.cue('conclusion', 11.645);
  const cPath = S.cue('path-card', 18.6);
  const cDep = S.cue('depends', 24.43);
  const cSym = S.cue('three-symptoms', 31.73);
  const cAg = S.cue('agents-inside', 41.16);

  const wCopy = S.find('copy', 0, cConc + 1.7);
  const wPath = S.find('path', 0, cPath + 1.2);
  const wFold = S.find('folders', 0, cPath + 3.0);
  const wFirst = S.find('first', 0, cPath + 3.9);
  const wKeys = S.find('keys', 0, cDep + 2.4);
  const wWho = S.find('who', 0, cDep + 4.7);
  const wWhen = S.find('when', 1, cDep + 6.1);
  const wWrong = S.find('wrong', 0, cSym + 3.0);
  const wBill = S.find('billing', 0, cSym + 5.4);
  const wOne = S.find('one', 1, cSym + 7.45, { whole: true });
  const wAgents = S.find('agents', 0, cAg + 0.4);
  const wWork = S.find('work', 0, cAg + 4.3);

  K.bg({ glow: 0.5, glowX: 1440, glowY: 460 });
  K.plate('plate', t, { zoom: true, shade: 0.45 });

  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    if (a <= 0.002) return;
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.85)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  // soft indigo scrims so cream and gold read over the painted plate
  const base = K.io(t, -0.6, 0.8, 'out');
  blob(680, 470, 900, 360, 0.75 * base);
  blob(1460, 500, 420, 300, 0.6 * base);
  blob(960, 810, 1000, 160, 0.75 * K.io(t, cSym - 0.3, 0.6));

  // ---------------------------------------------------------------- text column
  const X = 160, COLW = 1040;
  M.eyebrow('Module 01 · Lesson 5', X, 200, { align: 'left', alpha: base });
  K.title('Environment variables & PATH', X, 288, { size: 70, alpha: base });
  {
    const k = K.io(t, -0.6, 0.8, 'out');
    K.para('In this lesson you’ll learn how your computer finds the right program when you type a name like python, and about the hidden settings every program carries with it.',
      X, 368 + 12 * (1 - k), COLW, { font: 'read', weight: 400, size: 34, lh: 48, color: C.strong, alpha: k });
  }
  {
    const k = K.io(t, cConc - 0.1, 0.6);
    if (k > 0.002) K.para('Every program starts with a copy of its parent’s settings, called its environment.',
      X, 538 + 10 * (1 - k), COLW, { font: 'read', weight: 400, size: 32, lh: 46, color: C.head, alpha: k });
  }

  // second half of the conclusion, on [[path-card]]: PATH is an ordered list, first match wins
  {
    const k = K.io(t, cPath - 0.1, 0.6);
    if (k > 0.002) K.para('One of them, PATH, is an ordered list of folders: the first match wins.',
      X, 650 + 10 * (1 - k), COLW, { font: 'read', weight: 400, size: 32, lh: 46, color: C.head, alpha: k });
  }

  // ---------------------------------------------------------------- ghost streets (PATH as an ordered list)
  // Same model as 05: each numbered street is a FOLDER (the shop, sitting on the street), and python.exe is a
  // file inside it (the tag at the street's far end). Street 1 lights on "first"; street 3's twin stays dim.
  const symK = K.io(t, cSym - 0.1, 0.5);          // the streets and pills give way to the symptoms
  const stA = 1 - symK;
  if (stA > 0.002 && t > wPath - 0.2) {
    const ys = [728, 794, 860], x0 = 250, x1 = 900, shopX = 330, fileX = 770;
    const rows = [['Python310', 'python.exe'], ['nodejs', null], ['Python312', 'python.exe']];
    const lit1 = K.io(t, wFirst, 0.5);
    K.layer(stA, () => {
      ys.forEach((y, i) => {
        const k = K.stagger(t, wFold - 0.5, i, 0.18, 0.6);
        if (k <= 0) return;
        const isLit = i === 0, dimmed = i === 2 ? lit1 : 0;
        const gold = isLit ? lit1 : 0;
        K.layer(1 - 0.6 * dimmed, () => {
          K.line(x0, y, x1, y, { k, color: K.mixColor(C.line2, C.head, gold), w: 2 + gold, dash: i === 2 && dimmed > 0.5 ? [10, 10] : null });
          K.pill(String(i + 1), 200, y, { font: 'mono', size: 26, w: 56, alpha: K.io(k, 0, 0.4), fill: C.tile,
            stroke: K.mixColor(C.line2, C.head, gold), color: K.mixColor(C.strong, C.head, gold) });
          const drop = K.io(k, 0.4, 0.6, 'out');
          if (drop > 0) {
            K.layer(drop, () => {
              const sy = y - 22 - 30 * (1 - drop);       // the folder sits ON the street, not across it
              if (gold > 0) K.glow(shopX, y - 20, 110, C.head, 0.35 * gold);
              K.folder(shopX, sy, 42, { color: gold > 0.5 ? '#E0B055' : undefined });
              K.text(rows[i][0], shopX + 34, y - 12, { font: 'mono', weight: 600, size: 26, color: K.mixColor(C.strong, C.head, gold) });
              if (rows[i][1]) K.pill(rows[i][1], fileX, y - 20, { font: 'mono', size: 26, icon: 'file',
                fill: gold > 0.5 ? K.mixColor(C.tile, C.head, 0.18) : C.tile, stroke: K.mixColor(C.line2, C.head, gold),
                color: K.mixColor(C.strong, C.head, gold), glow: 0.5 * gold });
            });
          }
        });
      });
      if (lit1 > 0) {
        K.text('first match wins', x1 + 30, ys[0] - 10, { font: 'ui', weight: 600, size: 30, color: C.head, alpha: lit1 });
        K.text('never reached', x1 + 30, ys[2] - 10, { font: 'ui', weight: 600, size: 26, color: C.soft, alpha: lit1 });
      }
    });
  }

  // ---------------------------------------------------------------- the satchel emblem
  const SX = 1390, SY = 500, SS = 300;
  const open = K.io(t, wCopy, 0.6);
  const pathLift = K.io(t, wPath - 0.1, 0.5);
  const keyLift = K.io(t, wKeys - 0.1, 0.5);
  const sat = M.satchel(t, SX, SY, SS, {
    open, glow: 0.45 + 0.35 * pathLift, alpha: base,
    cards: open > 0.02 ? [
      { name: 'HOME', w: 84 },
      { name: 'PATH', kind: 'path', w: 92, lift: pathLift, lit: pathLift },
      { name: 'KEY', kind: 'key', w: 84, lift: 0.3 * keyLift },
    ] : [],
  });

  // "depends on who started it, and when": two pills tied to the satchel
  if (stA > 0.002) {
    const pills = [['who started it', 1330, wWho], ['when', 1600, wWhen]];
    pills.forEach(([s, px, at]) => {
      const k = K.io(t, at - 0.1, 0.5);
      if (k <= 0.002) return;
      const py = 712 + 10 * (1 - k);
      K.arrow(px, py - 30, px + (SX - px) * 0.25, sat.bottom + 14, { k: K.io(t, at + 0.15, 0.4), color: C.soft, w: 2.5 });
      K.pill(s, px, py, { size: 28, alpha: k * stA, fill: C.tile, stroke: C.line2, color: C.strong });
    });
  }

  // ---------------------------------------------------------------- three symptoms, one idea
  {
    const cw = 520, ch = 104, cy = 762, xs = [150, 700, 1250];
    const items = [
      { at: cSym, s: '’python’ is not recognized…', mono: true },
      { at: wWrong - 0.2, s: 'the wrong Python' },
      { at: wBill - 0.25, s: 'the wrong account billed' },
    ];
    items.forEach((it, i) => {
      const k = K.io(t, it.at, 0.5);
      if (k <= 0.002) return;
      const x = xs[i], y = cy + 16 * (1 - k);
      K.card(x, y, cw, ch, { r: 18, alpha: k, fill: C.tile, stroke: C.line2 });
      K.icon('warning', x + 46, y + ch / 2, 40, { color: C.accent, alpha: k, w: 3 });
      K.text(it.mono ? '\'python\' is not recognized…' : it.s, x + 84, y + ch / 2 + (it.mono ? 9 : 10),
        it.mono ? { font: 'mono', weight: 600, size: 26, color: C.strong, alpha: k }
                : { font: 'ui', weight: 600, size: 30, color: C.strong, alpha: k });
    });
    const rk = K.io(t, wOne - 0.1, 0.9);
    if (rk > 0) {
      // one gold outline drawn around all three (a rounded frame: an ellipse would cut the card corners)
      const fx = 118, fy = cy - 22, fw = 1684, fh = ch + 44, per = 2 * (fw + fh);
      g.save(); g.lineWidth = 3; g.strokeStyle = C.head; g.shadowColor = K.rgba(C.head, 0.5); g.shadowBlur = 16;
      const e = K.ease.io(rk); g.setLineDash([per * e, per * (1 - e) + 0.5]); g.lineDashOffset = -fw / 2;
      K.rr(fx, fy, fw, fh, 30); g.stroke(); g.restore();
      K.text('one idea, not three problems', 960, fy - 22, { font: 'ui', weight: 600, size: 30, color: C.head, align: 'center', alpha: K.io(t, wOne + 0.3, 0.5) });
    }
  }

  // ---------------------------------------------------------------- the agent works inside it too
  // The agent walks in and stands well clear of the emblem; on "work inside it" ONE copied satchel slides
  // along a dashed gold "copy" line onto its hip (its satchel on the near side). No loose cards over the tile.
  {
    const ak = K.io(t, wAgents - 0.2, 1.1);
    if (ak > 0.002) {
      const AX = 1760, AY = 470;
      const x = K.lerp(2010, AX, ak);
      const walking = ak > 0 && ak < 1 ? 1 : 0;
      const cards = [{ name: 'HOME' }, { name: 'PATH', kind: 'path' }, { name: 'KEY', kind: 'key' }];
      const ck = K.seg(t, wWork - 0.35, wWork + 0.65);   // the copy's flight
      const got = ck >= 1;
      const c = M.courier(t, x, AY, 100, {
        icon: 'sparkle', lantern: 1, walking, flip: true, satchelScale: 0.85, label: 'agent', labelColor: C.strong,
        satchel: got ? { open: 0.75, cards } : false,
      });
      // the dashed "copy" line from the emblem to the agent's hip
      const lk = K.io(t, wWork - 0.6, 0.5);
      const fx = SX + SS / 2 + 14, fy = SY + 40, tx = c.sx - c.ss / 2 - 8, ty = c.sy;
      if (lk > 0.002 && ak >= 1) {
        const fade = 1 - 0.6 * K.io(t, wWork + 1.0, 0.6);
        K.line(fx, fy, K.lerp(fx, tx, lk), K.lerp(fy, ty, lk), { color: C.head, w: 2.5, dash: [9, 8], alpha: 0.85 * fade });
        M.label('copy', (fx + tx) / 2, Math.min(fy, ty) + 62, { color: C.head, alpha: lk * fade });
      }
      if (ck > 0 && !got) {
        const e = K.ease.io(ck);
        const px = K.lerp(SX + SS / 2 + 70, c.sx, e), py = K.lerp(SY + 30, c.sy, e) - Math.sin(Math.PI * e) * 60;
        const ps = K.lerp(120, c.ss, e);
        K.layer(Math.min(1, ck * 5), () => {
          K.glow(px, py, ps * 0.9, C.head, 0.3);
          M.satchel(t, px, py, ps, { open: 0.75, strap: 'none', names: false, cards });
        });
      }
    }
  }

  K.petals(t, {
    n: 6, seed: 5, alpha: 0.5,
    avoid: [[130, 160, 1230, 900], [1200, 190, 1600, 650], [1600, 360, 1840, 640], [120, 680, 1800, 900]],
  });
});
