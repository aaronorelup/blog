/* 04 — Pick the room by the output
   The house (scaled 0.85, left) gets one output object at each door: an answer, a document, working software.
   Right column (x 980-1820), one idea at a time: OpenAI's slide-8 lines (S008) -> where the picture breaks:
   from [[openai]] to [[stakes]] the doors carry OpenAI's names (Chat / Work / Codex) under an "OpenAI's names" tag,
   and a second worker lands between Work and Codex with a 'new model' pill on BOTH (S025); at [[stakes]] Claude's
   names come back and the second worker leaves -> Mollick's stakes
   (S249, plus his unnarrated kind-of-work card, held from the low-stakes line until the stakes card leaves) -> the meter: plan allowance or a saved API key (S132).
   The one 'back' overshoot: the second worker landing.
   Exit: the house glides to (90, 330, 0.85), where 05 picks it up; output objects and the worker fade. */
SCENE('04', (t, S) => {
  K.bg();
  const C = K.C;
  const cOut = S.cue('output', 0), cOai = S.cue('openai', 4.5), cNot = S.cue('not-same', 14.6);
  const cStk = S.cue('stakes', 28.9), cMet = S.cue('meter', 41.4);
  const f = (w, fb, n = 0) => S.find(w, n, fb);
  const END = Math.max(S.dur - 0.2, S.out - 1.1);              // cards and pointers fade before the handover

  // ---------------------------------------------------------------- the house: from 03's wide frame to 0.85 left
  const mv = K.io(t, cOut - 0.05, 0.8);
  // exit: the house glides to where scene 05 picks it up (90, 330, 0.85) while the output objects and worker leave
  const glide = K.io(t, END, 0.8);
  const hs = K.lerp(1, 0.85, mv), hx = K.lerp(110, 90, mv), hy = K.lerp(250, 262, mv) + 68 * glide;
  // [[openai]] to [[stakes]]: the doors carry OpenAI's names (Chat · Work · Codex); Claude's names come back at [[stakes]]
  const oaiNames = K.io(t, cOai + 0.05, 0.6) * (1 - K.io(t, cStk - 0.3, 0.6));
  const ownDoors = t >= cOai && t < cStk + 0.6;
  // the slide's three lines light one room each, then all rest at 0.8
  const tChat = f('Chat', cOai + 3), tWork = f('Work', cOai + 6), tCodex = f('Codex', cOai + 7.5);
  const rowsEnd = f('software', cOai + 9) + 0.9;
  const focusOn = K.io(t, tChat - 0.1, 0.4) * (1 - K.io(t, rowsEnd, 0.6));
  const which = t < tWork ? 'chat' : t < tCodex ? 'cowork' : 'code';
  const lit = (n) => K.lerp(0.8, n === which ? 1 : 0.4, focusOn);
  const tReach = f('reach', cNot + 13);
  const fadeOut = 1 - K.io(t, END, 0.6);
  const reachK = K.io(t, tReach - 0.1, 0.9) * fadeOut;
  const lits = { chat: lit('chat'), cowork: lit('cowork'), code: lit('code') };
  const H = M.house(t, { x: hx, y: hy, s: hs, rooms: lits, glass: reachK, reach: reachK, doors: !ownDoors });
  if (ownDoors) {
    // the house's own door pills, redrawn here so their names can change (same local size and colours as M.house)
    K.at(H.x, H.y, H.s, 0, () => {
      const names = { chat: ['Chat', 'Chat'], cowork: ['Cowork', 'Work'], code: ['Code', 'Codex'] };
      for (const n of ['chat', 'cowork', 'code']) {
        const [x0, x1] = M.L.rooms[n], cx = (x0 + x1) / 2, on = lits[n] > 0.5;
        const st = { color: on ? C.strong : C.body, stroke: on ? K.mixColor(C.line2, C.head, 0.6) : C.line2 };
        if (oaiNames < 1) K.pill(names[n][0], cx, M.L.doorY, { size: 26, ...st, alpha: 1 - oaiNames });
        // OpenAI's names are drawn at 26 px on screen, with a gold edge so the swap reads
        if (oaiNames > 0) K.pill(names[n][1], cx, M.L.doorY, { size: 26 / H.s, ...st, stroke: K.mixColor(st.stroke, C.head, 0.5), alpha: oaiNames });
      }
    });
    // whose names these are: a small tag above the roof's left eave
    if (oaiNames > 0) M.pillL("OpenAI's names", H.x + 6, 158, { size: 26, color: C.strong, fill: C.panel, stroke: C.head, alpha: oaiNames });
  }

  // ---------------------------------------------------------------- the output objects, one under each door
  const yObj = H.y + H.h + 66, sObj = 64;
  const tWant = f('what', 1.5);
  const objs = [
    { n: 'chat', label: 'an answer', at: tWant },
    { n: 'cowork', label: 'a document', at: tWant + 0.25 },
    { n: 'code', label: 'working software', at: tWant + 0.5 },
  ];
  objs.forEach((o, i) => {
    const k = K.io(t, o.at, 0.6, 'out') * (1 - glide);
    if (k <= 0) return;
    const x = H.rooms[o.n].cx, y = yObj + (1 - k) * 18;
    const hot = focusOn * (o.n === which ? 1 : 0);
    K.layer(k, () => {
      if (hot > 0) K.glow(x, y, 80, C.head, 0.35 * hot);
      if (o.n === 'chat') {
        K.icon('chat', x, y, sObj, { color: C.head, w: 3 });
        K.text('?', x, y + 6, { font: 'ui', weight: 700, size: 30, color: C.head, align: 'center' });
      } else if (o.n === 'cowork') {
        K.file(x, y, sObj, { ext: 'doc' });
      } else {
        K.iconTile('program', x, y, sObj + 6, { color: C.head });
      }
      M.label(o.label, x, y + sObj / 2 + 44, { color: K.mixColor(C.body, C.head, hot) });
      if (hot > 0) K.ring(x, y, sObj * 0.74, sObj * 0.74, hot, { color: C.head, w: 2.5, rot: 0 });
    });
  });

  // ---------------------------------------------------------------- the workers
  const tIsnt = f("isn't", cNot + 2.4), tLand = tIsnt + 0.35;
  // the second worker belongs to OpenAI's rooms: it leaves when Claude's names come back at [[stakes]]
  const back = K.io(t, cStk - 0.3, 0.6);
  const dimK = K.io(t, tIsnt - 0.2, 0.6) * (1 - back);
  const ws = 96 * hs;
  M.worker(t, H.rooms.chat.spot[0], H.rooms.chat.spot[1], { s: ws, dim: 0.85 * dimK, alpha: (1 - 0.3 * dimK) * (1 - glide) });
  // the second worker lands on the wall between Work and Codex, never over the counter
  const land = K.io(t, tLand, 0.7, 'back'), landA = K.io(t, tLand, 0.25) * (1 - back);
  if (landA > 0) {
    const [wx, wy0] = H.at(620, 340), wy = wy0 - (1 - land) * 140;
    M.worker(t, wx, wy, { s: ws, alpha: landA, glow: 1, shadow: land > 0.6 });
    // 'new model' on BOTH rooms it serves (Work and Codex), each with a soft gold bracket on its floor
    const bk = K.io(t, tLand + 0.35, 0.6) * (1 - back);
    if (bk > 0) for (const n of ['cowork', 'code']) {
      const r = H.rooms[n];
      K.line(r.x + 18 * hs, r.y + r.h - 8, r.x + r.w - 18 * hs, r.y + r.h - 8, { k: bk, color: C.head, w: 4, alpha: 0.75 });
      K.pill('new model', r.cx, r.sign[1] + 60, { size: 26, color: C.page, fill: C.head, stroke: C.head, alpha: bk });
    }
  }

  // ---------------------------------------------------------------- right column, one idea at a time
  const CX = 980, CW = 840, pad = 32;
  const eb = (s, x, y, a) => K.text(s, x, y, { ...M.T.eyebrow, color: C.head, alpha: a });

  // [[output]] heading + the two logos that don't decide it
  const headA = K.io(t, cOut + 0.2, 0.6) * (1 - K.io(t, cNot - 0.2, 0.5));
  if (headA > 0) {
    K.title('Pick by what you want back', CX, 200, { size: 50, alpha: headA });
    const lg = K.io(t, f('not', 2.8), 0.4), logoDim = K.io(t, f('logo', 3.4), 0.6);
    const la = headA * lg * K.lerp(1, 0.3, logoDim);
    let x = CX;
    x += M.pillL('ChatGPT', x, 262, { size: 26, color: C.soft, stroke: C.line2, alpha: la }) + 16;
    const w2 = M.pillL('Claude', x, 262, { size: 26, color: C.soft, stroke: C.line2, alpha: la });
    if (logoDim > 0) M.label('not by the logo', x + w2 + 22, 271, { align: 'left', italic: true, color: C.soft, alpha: headA * logoDim, weight: 400 });
  }

  // [[openai]] OpenAI's slide 8, quoted on a card (the deck itself is never shown)
  const oaiA = K.io(t, cOai, 0.6) * (1 - K.io(t, cNot - 0.2, 0.5));
  if (oaiA > 0) {
    const rows = [
      { s: '“Use Chat when the answer is still taking shape”', at: tChat, icon: 'chat', n: 'chat' },
      { s: '“Use Work when the desired output is knowledge artifacts”', at: tWork, icon: 'file', n: 'cowork' },
      { s: '“Use Codex when the output is working software or applications”', at: tCodex, icon: 'program', n: 'code' },
    ];
    const y0 = 320, tx = CX + pad + 62, tw = CW - pad * 2 - 62, rs = 30, lh = rs * 1.32;
    const wr = rows.map((r) => K.wrap(r.s, tw, { ...M.T.read, size: rs }));
    const ebLines = K.wrap('OPENAI ACADEMY · CODEX BOOTCAMP 101 · 2026-09-23 · SLIDE 8', CW - pad * 2, M.T.eyebrow);
    let hh = pad + ebLines.length * 32 + 18;
    wr.forEach((ls) => { hh += ls.length * lh + 22; });
    hh += 70 + pad - 10;
    K.layer(oaiA, () => {
      K.card(CX, y0, CW, hh, { r: 24 });
      ebLines.forEach((ln, i) => eb(ln, CX + pad, y0 + pad + 20 + i * 32, 1));
      let y = y0 + pad + ebLines.length * 32 + 18;
      rows.forEach((r, i) => {
        const k = K.io(t, r.at - 0.15, 0.5);
        const hot = focusOn * (r.n === which ? 1 : 0);
        K.layer(0.25 + 0.75 * k, () => {
          K.icon(r.icon, CX + pad + 24, y + 18, 40, { color: K.mixColor(C.soft, C.head, Math.max(k * 0.6, hot)), w: 2.6 });
          wr[i].forEach((ln, j) => K.text(ln, tx, y + rs * 0.8 + j * lh, { ...M.T.read, size: rs, color: K.mixColor(C.body, C.strong, Math.max(hot, 0.5)) }));
        });
        y += wr[i].length * lh + 22;
      });
      M.pillL('Codex now lives in the new ChatGPT desktop app', CX + pad, y + 26, { size: 26, color: C.body, fill: C.panel, stroke: C.line2 });
    });
  }

  // [[not-same]] where the picture breaks: the changelog line
  const nsA = K.io(t, cNot, 0.5) * (1 - K.io(t, cStk - 0.2, 0.5));
  if (nsA > 0) {
    M.breaks(CX, 200, { alpha: nsA });
    const cA = nsA * K.io(t, f('September', cNot + 5) - 0.1, 0.6);
    const ch = M.dated(CX, 250, CW, { eyebrow: 'OpenAI · ChatGPT & Codex changelog · 2026-09-22',
      body: 'In ChatGPT, the models are available in Work and Codex, but not Chat.', quote: true, size: 32,
      footer: 'again 2026-09-29 and 2026-10-08', alpha: cA });
    // the one-line point: what always differs is the reach
    const rA = nsA * K.io(t, tReach - 0.6, 0.6);
    if (rA > 0) {
      const y = 250 + ch + 70;
      K.text('What always differs:', CX, y, { font: 'ui', weight: 600, size: 34, color: C.strong, alpha: rA });
      K.text('the reach', CX + K.measure('What always differs: ', { font: 'ui', weight: 600, size: 34 }), y, { font: 'ui', weight: 700, size: 34, color: C.head, alpha: rA });
      M.label('the counter: no files · the workshop: your projects', CX, y + 48, { align: 'left', color: C.body, alpha: rA * K.io(t, tReach + 0.3, 0.6), weight: 400 });
    }
  }

  // [[stakes]] Ethan Mollick's stakes rule, and his kind-of-work picks (unnarrated, smaller)
  const stA = K.io(t, cStk, 0.6) * (1 - K.io(t, cMet - 0.2, 0.5));
  if (stA > 0) {
    const y0 = 180, lowAt = f('low', cStk + 3) - 0.2, highAt = f('high', cStk + 6) - 0.2;
    const tx = CX + pad + 214, tw = CW - pad * 2 - 214, rs = 30, lh = rs * 1.32;
    const lowL = K.wrap('“all at least fine when the stakes are low”', tw, { ...M.T.read, size: rs });
    const highL = K.wrap('the most advanced model, at least “High” thinking', tw, { ...M.T.read, size: rs });
    const h = pad + 32 + 22 + lowL.length * lh + 24 + highL.length * lh + pad + 8;
    K.layer(stA, () => {
      K.card(CX, y0, CW, h, { r: 24 });
      eb('Ethan Mollick · One Useful Thing · 2026-07-23', CX + pad, y0 + pad + 20, 1);
      let y = y0 + pad + 32 + 22;
      [[lowL, 'low stakes', lowAt], [highL, 'high stakes', highAt]].forEach(([ls, tag, at]) => {
        const k = K.io(t, at, 0.5);
        K.layer(0.3 + 0.7 * k, () => {
          M.pillL(tag, CX + pad, y + 10, { size: 26, color: k > 0.5 ? C.page : C.body, fill: k > 0.5 ? C.head : C.panel, stroke: k > 0.5 ? C.head : C.line2 });
          ls.forEach((ln, j) => K.text(ln, tx, y + rs * 0.8 + j * lh, { ...M.T.read, size: rs, color: C.strong }));
        });
        y += ls.length * lh + 24;
      });
    });
    // his picks by kind of work: a dated card, not narration (no model names; the office row is his "okay").
    // It gets a held beat: in once the narrated low-stakes row has lit (so the spoken card leads),
    // out with the stakes card (about 6 s on screen).
    const pA = stA * K.io(t, Math.min(lowAt + 0.3, cStk + 3.5), 0.7);
    if (pA > 0) {
      const py = y0 + h + 26, rowsP = [
        ['research', 'Gemini Notebook'],
        ['images', 'built into ChatGPT and Google'],
        ['video', 'Gemini sees and edits it'],
        ['voice', 'ChatGPT listens and speaks'],
        ['office documents', 'Copilot “is okay”'],
      ];
      const ph = pad + 30 + 16 + rowsP.length * 40 + 70 + pad - 16;
      K.layer(pA * 0.92, () => {
        K.card(CX + 60, py, CW - 60, ph, { r: 24, fill: K.mixColor(C.tile, C.page, 0.3) });
        K.text('HIS PICKS BY KIND OF WORK · 2026-07-23', CX + 60 + pad, py + pad + 18, { ...M.T.eyebrow, color: C.soft });
        rowsP.forEach(([a, b], i) => {
          const y = py + pad + 30 + 16 + 26 + i * 40;
          K.text(a, CX + 60 + pad, y, { font: 'ui', weight: 600, size: 26, color: C.head });
          K.text(b, CX + 60 + pad + 250, y, { font: 'ui', weight: 400, size: 26, color: C.body });
        });
        M.pillL('reissued every few months', CX + 60 + pad, py + ph - pad - 12, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel });
      });
    }
  }

  // [[meter]] the bill: plan allowance, or a saved API key billing every token
  const meA = K.io(t, cMet + 0.25, 0.6) * (1 - K.io(t, END, 0.6));   // after the stakes cards have cleared
  if (meA > 0) {
    const dx = 1100, dy = 330, R = 92;
    const swing = K.io(t, f('approve', cMet + 4.3), 1.6, 'io');   // needle: plan -> API key, once
    const ang = Math.PI * K.lerp(-0.82, -0.18, swing);
    const g = K.ctx();
    K.layer(meA, () => {
      // dial: arc, ticks, needle
      g.save(); g.lineCap = 'round';
      g.beginPath(); g.arc(dx, dy, R, Math.PI, 2 * Math.PI); g.lineWidth = 10; g.strokeStyle = C.line2; g.stroke();
      g.beginPath(); g.arc(dx, dy, R, Math.PI, Math.PI * 1.5); g.lineWidth = 10; g.strokeStyle = K.rgba(C.head, 0.55); g.stroke();
      g.beginPath(); g.arc(dx, dy, R, Math.PI * 1.5, 2 * Math.PI); g.lineWidth = 10; g.strokeStyle = K.rgba(C.strong, 0.25 + 0.45 * swing); g.stroke();
      for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; K.line(dx + Math.cos(a) * (R - 22), dy + Math.sin(a) * (R - 22), dx + Math.cos(a) * (R - 12), dy + Math.sin(a) * (R - 12), { color: C.soft, w: 2 }); }
      g.restore();
      K.line(dx, dy, dx + Math.cos(ang) * (R - 16), dy + Math.sin(ang) * (R - 16), { color: C.strong, w: 5 });
      g.save(); g.beginPath(); g.arc(dx, dy, 10, 0, 7); g.fillStyle = C.strong; g.fill(); g.restore();
      // the two ways to pay
      const px = dx + R + 44;
      M.pillL('plan limits', px, dy - 62, { size: 26, color: swing < 0.5 ? C.page : C.body, fill: swing < 0.5 ? C.head : C.panel, stroke: swing < 0.5 ? C.head : C.line2 });
      const apiA = K.io(t, f('saved', cMet + 5.5) - 0.3, 0.5);
      M.pillL('API key · every token', px, dy - 4, { size: 26, color: swing > 0.5 ? C.page : C.body, fill: swing > 0.5 ? C.head : C.panel, stroke: swing > 0.5 ? C.head : C.line2, alpha: 0.35 + 0.65 * apiA });
      // a dotted lead from the dial down to the workshop's output: the same room, two ways to pay
      const o = [H.rooms.code.cx, yObj];
      K.path([[dx - R - 8, dy + 24], [945, dy + 200], [935, o[1] - 110], [o[0] + 70, o[1]]], { k: K.io(t, cMet + 0.4, 1), color: C.head, w: 4, dash: [2, 12], alpha: 0.75, head: false, tension: 0.4 });
    });
    const cA = meA * K.io(t, f('plan', cMet + 2) - 0.1, 0.6);
    const ch = M.dated(CX, 470, CW, { eyebrow: 'Anthropic · Claude Help Center · read 2026-10-14',
      body: 'A set ANTHROPIC_API_KEY, once you approve it, is used “instead of your Claude subscription.”', size: 30, footer: true, alpha: cA });
    M.pointer('the lesson on your meter', CX, 470 + ch + 50, { alpha: meA * K.io(t, f('That', cMet + 10.5, 0) - 0.1, 0.5) });
  }
});
