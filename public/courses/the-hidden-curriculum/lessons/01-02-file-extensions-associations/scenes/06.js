/* 06 — Renaming: a new tag, the same beads.
   The room, wide. hello.txt is renamed in place (strike, new tag, gold hold ring: the beads never move). Payoff: BEFORE
   first (tag back to hello.txt, carried to Notepad = wrong door), then the fix (hello.py -> V S Code opens on the Python text). photo.png ->
   photo.jpg beside the Photos door: same blue PNG beads. Real conversion = a Photos window that makes NEW beads.
   The rename warning is the porter speaking: you're moving rows. The classic trap: typing hello.py can give
   hello.py.txt, folded; on "isn't" the fold opens. Text cards live top-left (above the porter), strings on the
   floor band (y 740-930). */
SCENE('06', (t, S) => {
  K.bg();
  const L = M.layout, C = K.C;
  const io = K.io;
  const cue = (n, fb) => S.cue(n, fb);
  const W = (w, nth, fb) => S.find(w, nth, fb);

  // ---- beat times (local seconds)
  const tRe = cue('rewrite', 0);
  const tStrike = W('rewrites', 0, tRe + 0.87);
  const tNew = W('tag', 0, tRe + 1.56);
  const tHold = W('beads', 0, tRe + 2.94);
  const tMs = W('Microsoft', 0, tRe + 5.03);
  const tPay = cue('aaron-payoff', 9.81);
  const tCarry = W('His', 0, tPay + 1.97);
  const tDotTxt = W('dot', 0, tPay + 4.39);
  const tSending = W('sending', 0, tPay + 6.2);
  const tWrong = W('wrong', 0, tPay + 6.98);
  const tPng = cue('png-jpg', 17.98);
  const tPhoto = W('photo', 0, tPng + 0.71);
  // payoff order: BEFORE (hello.txt -> Notepad, the wrong door) first, then the fix lands in the pause after "door."
  const tFlip = tWrong + 0.35;             // tag flips back to hello.py, finger slides to .py
  const tArrive = tFlip + 1.05;            // string reaches the V S Code door
  const tOut = tPng + 1.4;                 // fix state fades (photo.png has dropped in beside Photos)
  const tTo = W('to', 1, tPng + 2.99);
  const tJpg = W('dot', 2, tPng + 3.21);
  const tNothing = W('nothing', 0, tPng + 5.0);
  const tOpen = W('open', 0, tPng + 6.88);
  const tRead = W('read', 0, tPng + 8.65);
  const tStillPng = W('still', 2, tPng + 9.93);
  const tExp = cue('export', 29.88);
  const tInside = W('inside', 0, tExp + 1.39);
  const tSave = W('Save', 0, tExp + 2.94);
  const tExport = W('Export', 0, tExp + 3.8);
  const tWarn = cue('warning', 34.63);
  const tChange = W('change', 0, tWarn + 1.24);
  const tPorterW = W('porter', 0, tWarn + 2.56);
  const tRows = W("you're", 0, tWarn + 3.73);
  const tTrap = cue('classic-trap', 40.0);
  const tHidden = W('extensions', 0, tTrap + 1.68);
  const tNotepad = W('Notepad', 0, tTrap + 3.62);
  const tType = W('hello', 0, tTrap + 6.73);
  const tName = W('name', 0, tTrap + 8.94);
  const tCan = W('can', 0, tTrap + 9.25);
  const tGhost = W('hello', 1, tTrap + 10.07);
  const tIsnt = W('isn', 0, tTrap + 14.38);

  // ---- the room: ledger lifts twice (Aaron's fix, the warning)
  const lift1 = io(t, tPay, 0.8) * (1 - io(t, tFlip + 1.5, 0.8));
  const tLift2 = tChange - 0.3;
  const lift2 = io(t, tLift2, 0.8) * (1 - io(t, tTrap, 0.8));
  const lift = Math.max(lift1, lift2);
  // finger: Aaron's fix slides .txt -> .py; the warning slides .txt -> .py again ("you're moving rows")
  let finger = null, fingerK = 0;
  if (lift1 > 0.01) {
    finger = K.lerp(0, 1, io(t, tFlip, M.motion.finger));
    fingerK = io(t, tPay + 0.5, 0.4) * (1 - io(t, tFlip + 1.5, 0.4));
  } else if (lift2 > 0.01) {
    finger = K.lerp(0, 1, io(t, tRows, M.motion.finger));
    fingerK = io(t, tLift2 + 0.6, 0.4) * (1 - io(t, tTrap, 0.4));
  }
  const look = K.lerp(0, -0.8, io(t, tPay, 0.6)) * (1 - io(t, tSending - 0.3, 0.6))
    + 0.8 * io(t, tSending - 0.3, 0.6) * (1 - io(t, tOut, 0.6))
    + -0.8 * io(t, tLift2, 0.6) * (1 - io(t, tTrap, 0.6));

  // V S Code door: focus as the fixed string heads over, opens on the Python text, closes again for the next beat
  const vFocus = io(t, tFlip + 0.6, 0.5) * (1 - io(t, tOut, 0.6));
  const vOpen = io(t, tArrive - 0.2, 0.7) * (1 - io(t, tOut, 0.7));
  const pFocus = io(t, tOpen, 0.5) * (1 - io(t, tExp, 0.6));

  const codeInside = (r) => {
    const sz = 26, x = r.x + 4;
    const y1 = r.y + r.h * 0.42, y2 = y1 + 40;
    let xx = x;
    xx += K.text('print', xx, y1, { font: 'mono', size: sz, weight: 600, color: C.head });
    K.text('(', xx, y1, { font: 'mono', size: sz, weight: 600, color: C.strong });
    xx = x + 16;
    xx += K.text('"hi"', xx, y2, { font: 'mono', size: sz, weight: 600, color: C.accent });
    K.text(')', xx, y2, { font: 'mono', size: sz, weight: 600, color: C.strong });
  };

  const R = M.room({
    t,
    porter: { look, glow: 1 },
    ledger: false,
    doors: {
      each: (i, name) => {
        if (name === 'V S Code') return { focus: vFocus, t, open: vOpen, inside: codeInside };
        if (name === 'Photos') return { focus: pFocus };
        return {};
      },
    },
  });
  // the ledger: same closed book on the desk, but lifted to the LEFT (x 110-630) so the porter and the
  // desk's right end stay visible (room() would lift it to layout.ledger, x 200-800)
  const LG = (() => {
    const ld = L.ledgerDesk, e = K.ease.io(lift);
    const tx = 110, tw = 520;
    const open = K.clamp((lift - 0.4) / 0.6);
    return M.ledger(K.lerp(ld.x, tx, e), K.lerp(ld.y, L.ledger.y, e), K.lerp(ld.w, tw, e), { size: 30, finger, fingerK, open });
  })();
  const D = R.doors.byName;
  // "Aaron's fix": a gold pill ABOVE the V S Code door (clear of photo.png dropping in below; never over the porter)
  {
    const vd = D['V S Code'];
    const fk = io(t, tFlip + 0.3, 0.5) * (1 - io(t, tOut, 0.5));
    if (fk > 0 && vd) M.label("Aaron's fix", vd.cx, vd.y0 - 40, { alpha: fk, color: C.head });
  }
  // hello.py under the V S Code sill (the open door shows the bytes as coloured Python, no bead strand)
  {
    const vd = D['V S Code'];
    const hk = io(t, tArrive - 0.1, 0.5) * (1 - io(t, tOut, 0.6));
    if (hk > 0 && vd) {
      const ts = 0.74, tsize = 36, tw = M.tagWidth('hello.py', ts, tsize);
      M.tag(vd.cx + tw / 2, vd.y1 + 46, { name: 'hello.py', s: ts, size: tsize, t, alpha: hk, rot: -0.03 });
    }
  }

  // ---- ledger annotations
  if (LG && lift1 > 0.5) {
    // the old label sent the beads to the wrong door
    const rk = io(t, tDotTxt, 0.6) * (1 - io(t, tFlip, 0.5));
    if (rk > 0) {
      const lx = LG.labelX + K.measure('.txt', { font: 'mono', weight: 700, size: LG.size }) / 2;
      K.ring(lx, LG.rowY(0), 52, 24, rk, { color: C.accent, w: 3.5, rot: 0 });
      const nd = D['Notepad'], nh = nd.y1 - nd.y0;
      const ak = 1 - io(t, tFlip, 0.4);
      K.path([[LG.x + LG.w - 10, LG.rowY(0)], [880, 600], [nd.cx, nd.y0 + nh * 0.62]],
        { k: io(t, tSending, 0.7), color: K.rgba(C.accent, 0.85), w: 3.5, dash: [9, 9], head: true, headSize: 16, alpha: ak });
      // the wrong door: a terracotta outline on Notepad as the arrow lands
      const wk = io(t, tSending + 0.4, 0.5) * ak;
      if (wk > 0) {
        const g = K.ctx();
        K.glow(nd.cx, nd.y0 + nh * 0.55, (nd.x1 - nd.x0) * 1.0, C.accent, 0.16 * wk);
        g.save(); K.rr(nd.x0 - 4, nd.y0 - 4, nd.x1 - nd.x0 + 8, nh + 8, 14);
        g.strokeStyle = K.rgba(C.accent, 0.95 * wk); g.lineWidth = 4; g.stroke(); g.restore();
      }
    }
  }
  if (LG && lift2 > 0.5) {
    // "you're moving rows": a dotted gold hop from the .txt row to the .py row, and the porter's words beside it
    const mk = io(t, tRows, 0.6) * (1 - io(t, tTrap, 0.5));
    if (mk > 0) {
      // the hop sits on the card's RIGHT edge (inside the safe area), the pill right beside it
      const ax = LG.x + LG.w + 12;
      K.arrow(ax, LG.rowY(0), ax, LG.rowY(1), { k: mk, bend: -34, color: C.head, w: 3, dash: [6, 7] });
      const pw = K.measure("you're moving rows", { font: 'ui', weight: 600, size: 30 }) + 48;
      M.label("you're moving rows", ax + 56 + pw / 2, (LG.rowY(0) + LG.rowY(1)) / 2, { alpha: mk, color: C.head, size: 30 });
    }
  }

  // ---- string A: hello.txt -> hello.py in place (rewrite). Payoff: back to the BEFORE state (hello.txt, beads
  // already Python), carried to Notepad = wrong door; then the fix: tag flips to hello.py, carried to V S Code.
  {
    const ax = 1400, ay = 800;
    const kRev = io(t, tPay + 0.1, 0.5);                       // payoff: the tag goes back to hello.txt ("before")
    const flip = io(t, tFlip + 0.15, M.motion.write);          // the fix: hello.txt -> hello.py again
    const strike = Math.max(io(t, tStrike, 0.5) * (1 - kRev), io(t, tFlip - 0.2, 0.3));
    const kk = Math.max(io(t, tNew - 0.05, M.motion.write) * (1 - kRev), flip);
    const hold = io(t, tHold, 0.7) * (1 - io(t, tPay, 0.4));
    const mark = io(t, tDotTxt, 0.5) * (1 - io(t, tFlip - 0.2, 0.3));
    const lit = io(t, tCarry, 0.5) * (1 - io(t, tDotTxt, 0.6));    // "His beads were already Python text"
    const nd = D['Notepad'], vd = D['V S Code'];
    const nP = [nd.cx, nd.y1 + 110], vP = [vd.cx, vd.y1 + 110];
    const pts1 = [[ax, ay], [K.lerp(ax, nd.cx, 0.5), ay - 20], nP];
    const pts2 = [nP, [(nd.cx + vd.cx) / 2, nd.y1 + 70], vP];
    const ck1 = io(t, tSending - 0.3, M.motion.carry);
    const ck2 = io(t, tFlip + 0.35, 0.7);
    const p = ck2 > 0 ? M.along(pts2, ck2) : M.along(pts1, ck1);
    const gone = io(t, tArrive - 0.1, 0.5);
    const ck = Math.max(ck1, ck2);
    const s = K.lerp(0.5, 0.3, ck1), tagS = K.lerp(1, 0.8, ck1);
    const appear = io(t, -0.4, 0.6);
    if (1 - gone > 0) {
      const tr1 = 1 - io(t, tFlip, 0.4), tr2 = 1 - io(t, tArrive, 0.4);
      if (ck1 > 0 && tr1 > 0) K.path(pts1, { k: ck1, color: K.rgba(C.accent, 0.4), w: 2, dash: [6, 10], head: false, alpha: tr1 });
      if (ck2 > 0 && tr2 > 0) K.path(pts2, { k: ck2, color: K.rgba(C.head, 0.4), w: 2, dash: [6, 10], head: false, alpha: tr2 });
      M.drawString(p.x, p.y, s, {
        t, preset: 'txt', n: 12, labels: 'none', hold, lit, alpha: (1 - gone) * appear, tagS,
        tag: { name: 'hello.txt', to: 'hello.py', k: kk, strike, mark: ck > 0 ? 0 : mark, markColor: C.accent },
      });
    }
    // "before the fix": a quiet caption under the desk string while the old tag is back
    const bk = io(t, tPay + 0.4, 0.5) * (1 - io(t, tSending - 0.4, 0.4));
    if (bk > 0) K.text('before the fix', ax, ay + 92, { ...M.type.quiet, align: 'center', alpha: bk });
  }

  // ---- Microsoft card (top-left, above the porter)
  {
    const k = io(t, tMs, 0.6), out = 1 - io(t, tPay, 0.5);
    M.dateCard('Microsoft support', "renaming won't convert the file", 130, 150, { k, alpha: out });
  }

  // ---- string B: photo.png -> photo.jpg beside the Photos door; same PNG beads
  {
    const bx = 1560, by = 790, s = 0.36;
    const drop = (i) => K.stagger(t, tPhoto - 0.1, i, 0.06, 0.45);
    const tagK = io(t, tPhoto, 0.5);
    const strike = io(t, tTo, 0.45);
    const kk = io(t, tJpg, M.motion.write);
    const hold = io(t, tNothing, 0.7) * (1 - io(t, tExp, 0.5));
    const lit = io(t, tRead, 0.5) * (1 - io(t, tExp, 0.5));
    const bA = 1 - io(t, tWarn, 0.6);    // fully gone by warning + 0.6 s (no ghost under the warning)
    if (t > tPhoto - 0.2 && bA > 0.001) M.drawString(bx, by, s, {
      t, preset: 'png', alpha: bA * io(t, tPhoto - 0.2, 0.4), cordK: io(t, tPhoto - 0.2, 0.7), n: 8, labels: 'none', beadK: drop, tagK, tagS: 1, hold, lit,
      tag: { name: 'photo.png', to: 'photo.jpg', k: kk, strike, swing: io(t, tPhoto, 0.7) },
    });
    // captions under it
    const rowY = 885;
    const pk = io(t, tNothing, 0.5) * (1 - io(t, tExp, 0.5));
    if (pk > 0) M.label('nothing converts', 1140, rowY, { alpha: pk, color: C.head });
    const q1 = io(t, tOpen - 0.3, 0.5) * (1 - io(t, tExp, 0.5));
    const q2 = io(t, tStillPng, 0.5) * (1 - io(t, tExp, 0.5));
    const qx = 1310, qf = { ...M.type.quiet };
    if (q1 > 0) {
      const w1 = K.text('may still open', qx, rowY + 10, { ...qf, alpha: q1 });
      if (q2 > 0) K.text('  ·  still a PNG', qx + w1, rowY + 10, { ...qf, color: C.strong, alpha: q2 });
    }
  }

  // ---- export: a Photos window makes NEW beads
  {
    const ek = io(t, tExp + 0.2, 0.6) * (1 - io(t, tLift2 - 0.2, 0.5));
    if (ek > 0) {
      const wx = 120, wy = 742, ww = 390, wh = 180;
      K.layer(ek, () => {
        const dy = (1 - ek) * 20;
        const r = K.win(wx, wy + dy, ww, wh, { title: 'Photos', titleSize: 26, kind: 'explorer' });
        const cx = wx + ww / 2, py = r.y + 40;
        const sv = io(t, tSave, 0.4), ex = io(t, tExport, 0.4);
        M.label('Save As', cx - 82, py, { glow: sv, color: sv > 0.5 ? C.head : C.strong });
        M.label('Export', cx + 92, py, { glow: ex, color: ex > 0.5 ? C.head : C.strong });
        K.text('convert = inside an app', cx, r.y + 106, { ...M.type.quiet, align: 'center', alpha: io(t, tInside, 0.5) });
      });
      const ak = io(t, tSave + 0.1, 0.5);
      K.arrow(wx + ww + 10, 832, wx + ww + 70, 832, { k: ak * ek, color: C.head, w: 3 });
      const nx = 905, ny = 832;
      if (t > tSave) M.drawString(nx, ny, 0.3, {
        t, preset: 'jpg', n: 8, labels: 'none', alpha: ek,
        beadK: (i) => K.stagger(t, tSave + 0.3, i, 0.1, 0.4),
        tagK: io(t, tExport, 0.5), tagS: 0.8,
        tag: { name: 'photo.jpg', swing: io(t, tExport, 0.7) },
      });
    }
  }

  // ---- the warning: the porter speaking
  {
    const nk = io(t, tWarn, 0.6) * (1 - io(t, tTrap, 0.5));
    if (nk > 0) {
      const x = 130, y = 140, w = 600, h = 176, dy = (1 - nk) * 16;
      K.layer(nk, () => {
        const g = K.ctx();
        // speech tail toward the porter's head
        g.save(); g.beginPath(); g.moveTo(370, y + h + dy - 2); g.lineTo(410, y + h + dy + 40); g.lineTo(430, y + h + dy - 2); g.closePath();
        g.fillStyle = C.tile; g.fill(); g.strokeStyle = K.rgba(C.gold, 0.7); g.lineWidth = 1.5; g.stroke(); g.restore();
        K.card(x, y + dy, w, h, { r: 18, fill: C.tile, stroke: K.rgba(C.gold, 0.7) });
        g.save(); g.fillStyle = C.tile; g.fillRect(372, y + h + dy - 3, 56, 4); g.restore();
        K.icon('warning', x + w - 46, y + dy + 44, 40, { color: C.head, w: 3 });
        K.eyebrow('RENAME WARNING', x + 28, y + dy + 46, { size: 22 });
        K.text('Windows:', x + 28, y + dy + 100, { font: 'ui', weight: 600, size: 28, color: C.soft });
        K.text('"might become unusable"', x + 168, y + dy + 100, { font: 'ui', weight: 600, size: 28, color: C.strong });
        K.text('Mac:', x + 28, y + dy + 146, { font: 'ui', weight: 600, size: 28, color: C.soft });
        K.text('Keep .txt / Use .py', x + 168, y + dy + 146, { font: 'mono', weight: 600, size: 28, color: C.strong });
      });
    }
  }

  // ---- the classic trap: typing hello.py, getting hello.py.txt
  {
    const fk = io(t, tTrap + 0.3, 0.6);
    if (fk > 0) {
      const x = 130, y = 140, w = 790, h = 176, dy = (1 - fk) * 16;
      // typing starts with the beat (no empty field), ~1 char / 0.15 s
      const tTypeAt = tTrap + 0.5;
      const typed = K.typed('hello.py', t, tTypeAt, 6.7);
      const done = K.typedDone('hello.py', t, tTypeAt, 6.7);
      const ghost = io(t, tGhost, 0.6);
      K.layer(fk, () => {
        K.card(x, y + dy, w, h, { r: 18, fill: C.tile, stroke: C.line2 });
        K.text('File name:', x + 28, y + dy + 66, { font: 'ui', weight: 600, size: 28, color: C.soft });
        const bx = x + 214, bw = 276;
        K.card(bx, y + dy + 24, bw, 60, { r: 10, fill: C.page, stroke: done && t > tName ? C.line2 : K.rgba(C.gold, 0.8), shadow: false });
        const tw = K.text(typed, bx + 18, y + dy + 66, { font: 'mono', weight: 600, size: 32, color: C.strong });
        if (ghost > 0) K.text('.txt', bx + 18 + tw, y + dy + 66, { font: 'mono', weight: 600, size: 32, color: C.accent, alpha: 0.5 * ghost });
        else if (t < tName && K.caretOn(t)) { const g = K.ctx(); g.save(); g.fillStyle = C.strong; g.fillRect(bx + 22 + tw, y + dy + 40, 16, 32); g.restore(); }
        const sk = io(t, tNotepad, 0.5);
        K.text('Save as type:', x + 28, y + dy + 138, { font: 'ui', weight: 600, size: 28, color: C.soft, alpha: sk });
        K.text('Text Documents (*.txt)', x + 214, y + dy + 138, { font: 'mono', weight: 600, size: 26, color: C.strong, alpha: sk });
        // a persistent chip at the dialog's right: the condition that makes the trap possible
        const hk = io(t, tHidden, 0.5);
        if (hk > 0) M.label('extensions hidden', bx + bw + (x + w - bx - bw) / 2, y + dy + 54, { alpha: hk, size: 26, color: C.soft });
      });
      // the string that results
      const sx = 640, sy = 812;
      const drop = (i) => K.stagger(t, tName - 0.1, i, 0.07, 0.45);
      const tk = io(t, tName + 0.1, 0.6);
      const open = io(t, tIsnt, 0.5);
      // the cord fades in with the beads (no bare line); the fold opens on the spoken "hello.py.txt" so the ring
      // always surrounds a visible (dim) .txt, which turns accent on "isn't"
      const reveal = io(t, tGhost - 0.25, 0.4);
      const dimExt = K.mixColor(M.palette.tag, M.palette.tagInk, 0.45);
      if (t > tName - 0.2) M.drawString(sx, sy, 0.4, {
        t, preset: 'pytxt', n: 8, labels: 'none', beadK: drop, tagK: tk, tagS: 1, alpha: io(t, tName - 0.2, 0.4),
        tag: { name: 'hello.py.txt', fold: 1 - reveal, ring: io(t, tGhost, 0.7) * (1 - io(t, tIsnt + 0.35, 0.4)), swing: tk, extColor: K.mixColor(dimExt, C.accent, open) },
      });
      const pk = io(t, tCan, 0.5);
      if (pk > 0) M.label('can happen  ·  hidden extensions', 520, 900, { alpha: pk });
    }
  }
});
