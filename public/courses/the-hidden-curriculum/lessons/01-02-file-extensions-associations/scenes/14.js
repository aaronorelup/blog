/* 01.02 · 14 Keep this (end card, noBadge)
   Painted tea house (lower band) under the night ground; petals avoid every text block.
   [[ignore]] a centred "Safe to ignore for now" block: five pills, each landing on its spoken word.
     On [[keep-1]] it glides to the top-right corner and rests at 35% (storyboard: K.note, fades after).
   [[keep-1..3]] "KEEP THIS" and three bold gold leads, each with a regular cream tail line; each lands on its spoken number,
     the earlier rows dim slightly while the next is spoken, all return to full on [[next]].
   The still life (bottom right: one ledger, one string, one tag) answers each takeaway:
     "label"   -> the tag's extension gets the gold underline;
     "ledger"  -> the closed ledger opens to two rows, the finger rests on .txt;
     "renaming"-> the tag becomes hello.py while the gold hold ring says the beads did not move, and the finger
                 slides to the .py row (new label, new row);
     "Always"  -> that row pulses: Open with's Always and default apps are what write it.
   [[next]] a quiet next-stop line, no teaser motion. Last 3 s: everything held, calm. */
SCENE('14', (t, S) => {
  const C = K.C;

  // ---- timing (local seconds; fallbacks = narrated times) ----
  const cIg = S.cue('ignore', 0);
  const wReg = S.find('registry', 0, 1.92), wProg = S.find('prog', 0, 2.76), wMac = S.find('Mac', 0, 4.12);
  const wLin = S.find('Linux', 0, 6.0), wMenu = S.find('menu', 0, 7.71);
  const c1 = S.cue('keep-1', 8.7), c2 = S.cue('keep-2', 13.1), c3 = S.cue('keep-3', 17.69), cNx = S.cue('next', 25.07);
  const r1 = S.find('One', 0, 9.9), r2 = S.find('Two', 0, 13.1), r3 = S.find('Three', 0, 17.69);
  const wLabel = S.find('label', 0, 11.76);
  const wLedger = S.find('ledger', 0, 15.16);
  const wRename = S.find('renaming', 0, 18.77);
  const wAlways = S.find('Always', 0, 21.93);

  // ---- ground ----
  K.bg({ glow: 0.4 });
  if (K.img.plate) K.plate('plate', t, { shade: 0.5, mask: [720, 900] });

  // ---- layout ----
  const LX = 300;                                     // left edge of the takeaway stack
  const rowsY = [400, 515, 630];                      // baselines of the three bold leads; each tail sits 50 px below the last lead line
  const LEAD = { font: 'head', weight: 700, size: 44, color: C.head };
  const TAIL = { font: 'ui', weight: 400, size: 32, color: C.strong };
  const ledX = 1430, ledY = 588, ledW = 380;          // still-life ledger (2 rows, 26 px), lifted 60 px off the caption band
  const str = { x: 1660, y: 830, s: 0.24 };           // still-life string under the ledger

  // ---- petals (end card only), kept off all text ----
  K.petals(t, { n: 5, seed: 14, avoid: [[100, 130, 1840, 760], [100, 790, 1500, 900], [1240, 570, 1840, 930]] });

  // ---- [[ignore]] SAFE TO IGNORE FOR NOW: centred, then moves to the top-left corner and rests dim ----
  {
    const PS = 28, gap = 18;
    const items = [['registry', wReg], ['ProgIDs', wProg], ['Mac type identifiers', wMac], ['Linux MIME files', wLin], ['menu paths', wMenu]];
    const pw = items.map(([s]) => K.measure(s, { font: 'ui', weight: 600, size: PS }) + PS * 1.6);
    const lines = [[0, 1, 2], [3, 4]];
    const lineW = lines.map((ln) => ln.reduce((a, i) => a + pw[i], 0) + gap * (ln.length - 1));
    const BW = Math.max(...lineW) + 64, BH = 214;
    const move = K.io(t, c1 - 0.2, 0.8);
    const bx = K.lerp(960 - BW / 2, 1820 - BW, move), by = K.lerp(330, 136, move);
    const inK = K.io(t, cIg + 0.1, 0.5);
    const alpha = inK * (1 - 0.65 * move);
    if (alpha > 0) K.layer(alpha, () => {
      K.card(bx, by, BW, BH, { r: 22, fill: K.rgba(C.tile, 0.72), stroke: K.rgba(C.gold, 0.22), shadow: false });
      K.eyebrow('Safe to ignore for now', bx + 32, by + 46);
      lines.forEach((ln, li) => {
        let x = bx + 32;
        ln.forEach((i) => {
          const k = K.io(t, items[i][1] - 0.1, 0.4, 'out');
          const cy = by + 100 + li * 66;
          if (k > 0) K.pill(items[i][0], x + pw[i] / 2, cy + (1 - k) * 8, { size: PS, alpha: k, color: K.rgba(C.strong, 0.85) });
          x += pw[i] + gap;
        });
      });
    });
  }

  // ---- [[keep-1..3]] KEEP THIS + three bold leads ----
  K.rise(t, c1 + 0.15, () => K.eyebrow('Keep this', LX, 340), 12, 0.5);
  // Bold gold lead = the spoken sentence; the cream tail is the one-line support (lesson.js keep[i][1] in short).
  const leads = [
    { at: r1, lead: 'The extension is a label in the name.', tail: 'Read from the last dot, and still hidden by default.', tailAt: wLabel },
    { at: r2, lead: 'Your computer keeps a ledger from label to program.', tail: 'That ledger is the file associations: one per user.', tailAt: wLedger + 0.3 },
    // Lead 3 = the spoken sentence (and lesson.js keep[2]); the tail lands once the sentence has finished.
    { at: r3, lead: ['Renaming changes the label;', 'Always and default apps change the ledger.'], tail: 'Renaming .txt to .py moves no bytes and converts nothing.', tailAt: wAlways + 1.3 },
  ];
  const back = K.io(t, cNx - 0.2, 0.6);
  leads.forEach((r, i) => {
    const nextAt = leads[i + 1] ? leads[i + 1].at : Infinity;
    const dim = 1 - 0.4 * K.io(t, nextAt - 0.1, 0.5) * (1 - back);
    const y = rowsY[i];
    K.rise(t, r.at - 0.05, () => K.layer(dim, () => {
      K.text(String(i + 1), LX - 44, y, { font: 'mono', weight: 600, size: 30, color: K.rgba(C.gold, 0.8), align: 'center' });
      [].concat(r.lead).forEach((ln, j) => K.text(ln, LX, y + j * 54, LEAD));
    }), 16, 0.5);
    K.rise(t, r.tailAt, () => K.layer(dim, () => K.text(r.tail, LX, y + 50 + ([].concat(r.lead).length - 1) * 54, TAIL)), 10, 0.5);
  });

  // ---- still life: one ledger, one string, one tag ----
  const openK = K.io(t, wLedger - 0.15, 0.8);
  const slide = K.io(t, wRename + 0.5, 0.6);
  const pulse = K.seg(t, wAlways - 0.1, wAlways + 1.1);
  const fingerK = K.io(t, wLedger + 0.5, 0.4);
  K.rise(t, c1 + 0.3, () => {
    M.ledger(ledX, ledY, ledW, {
      open: openK,
      rows: [
        { label: '.txt', door: 'Notepad', dim: 0.45 * slide },
        { label: '.py', door: 'V S Code', pulse: pulse > 0 && pulse < 1 ? pulse : 0 },
      ],
      finger: K.lerp(0, 1, slide), fingerK,
    });
    const ren = K.io(t, wRename - 0.05, 0.8);
    const hold = K.io(t, wRename - 0.2, 0.5) * (1 - K.io(t, wAlways + 0.6, 0.8));
    M.drawString(str.x, str.y, str.s, {
      t, preset: 'txt', hold,
      tag: { name: 'hello.txt', to: 'hello.py', k: ren, mark: K.io(t, wLabel - 0.1, 0.6) },
    });
  }, 12, 0.6);

  // ---- [[next]] quiet next stop (course convention, as in 01.01), on a dark backing pill for contrast ----
  K.rise(t, cNx, () => {
    const NX = 'Next on the map: 01.03 · Folders, paths & the working directory';
    const NO = { font: 'ui', weight: 600, size: 30, color: C.strong };
    const w = K.measure(NX, NO);
    K.card(LX - 84, 800, w + 120, 64, { r: 32, fill: K.rgba(C.page, 0.82), stroke: K.rgba(C.gold, 0.25), shadow: false });
    K.icon('map', LX - 44, 832, 32, { color: K.rgba(C.gold, 0.85), w: 2.5 });
    K.text(NX, LX, 842, NO);
  }, 10, 0.6);
});
