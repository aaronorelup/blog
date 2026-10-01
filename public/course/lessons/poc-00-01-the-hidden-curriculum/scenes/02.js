/* 02 — Python in a text file
   Aaron's true story, drawn as a desk on the left: Notepad, script.txt, a terminal still sitting in
   the home folder, a .venv folder nobody explained. Each thing he didn't know shows up as a dashed
   ghost with a terracotta "?" (open = terracotta), then becomes one of the lesson's question tags and
   glides into the tray, which owns the right third.
   Continuity: it opens on 01's degree card at rest, which then flies up to its compact chip (same object,
   same tipped cap) and stays all scene: the quiet joke. On [[pile]] the viewer's own questions arrive
   as three faint, unlabeled tickets under the tray; on "Each one has a place" a dashed shelf line and
   the caption settle under them. It ends calm: three full glowing tags in the tray, the faint pile, the
   shelf and caption, the desk dimmed, the chip top-right. Everything is a pure function of t. */
(function () {
  'use strict';

  // scratch buffer for group alpha (the desk dims as one picture, so overlapping windows don't show
  // through each other). Cleared on every use; nothing carries between frames.
  let off = null;
  function group(a, fn) {
    if (a <= 0.002) return;
    if (a >= 0.998) { fn(); return; }
    const main = K.ctx(), cw = main.canvas.width, ch = main.canvas.height;
    if (!off || off.width !== cw || off.height !== ch) { off = document.createElement('canvas'); off.width = cw; off.height = ch; }
    const oc = off.getContext('2d');
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.clearRect(0, 0, cw, ch);
    oc.setTransform(main.getTransform());
    K.use(oc);
    try { fn(); } finally { K.use(main); }
    main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha *= a; main.drawImage(off, 0, 0); main.restore();
  }

  // a dashed "ghost": the thing he didn't know yet. text '' draws a lone "?" in a dashed circle.
  const GSIZE = 28, GF = { font: 'mono', size: GSIZE, weight: 600 };
  const ghostParts = (text) => (text ? [{ s: text + ' ', color: K.C.body }, { s: '?', color: K.C.accent, weight: 700 }] : [{ s: '?', color: K.C.accent, weight: 700 }]);
  /** width of a ghost pill (a lone "?" is a circle) */
  function ghostW(text) {
    const h = GSIZE * 1.9;
    if (!text) return h;
    return ghostParts(text).reduce((w, p) => w + K.measure(p.s, { ...GF, ...p }), 0) + GSIZE * 1.5;
  }
  function ghost(text, cx, cy, a) {
    if (a <= 0.002) return;
    const C = K.C, size = GSIZE, f = GF, parts = ghostParts(text);
    const h = size * 1.9, w = ghostW(text);
    const sc = 0.85 + 0.15 * a;
    K.layer(a, () => K.at(cx, cy, sc, 0, () => {
      const g = K.ctx();
      g.save();
      K.rr(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = K.rgba(C.tile, 0.9); g.fill();
      g.setLineDash([5, 7]); g.lineWidth = 2; g.strokeStyle = K.rgba(C.accent, 0.75); g.stroke();
      g.restore();
      K.spans(parts, 0, size * 0.36, { ...f, align: 'center' });
    }));
  }

  SCENE('02', (t, S) => {
    const C = K.C;
    K.bg();

    // ---------------------------------------------------------------- times (local seconds)
    const CODE = ['print("hello")', 'name = input("name? ")', 'print("hi", name)'];
    const CPS = 36;
    const tNote = S.cue('notepad', 1.28);
    const typeAt = tNote + 0.32;
    const typedEnd = typeAt + (CODE.join('\n').length) / CPS;
    const tSave = Math.max(S.find('saved', 0, 2.1), typedEnd + 0.06);   // lands on "T X T"
    const tRename = S.cue('rename', 5.62);
    const tTerm = S.cue('terminal', 8.53);
    const tCdGhost = S.find('and', 1, 9.06) + 0.12;                     // as "C D" is spoken
    const tFolder = S.find('folder', 0, 10.14);
    const tVenv = S.cue('venv', 12.05);
    const tIdea = S.find('idea', 0, 14.01);
    const tHard = S.find('hard', 0, 16.56);
    const tHanded = S.find('handed', 0, 18.33);
    const tPile = S.cue('pile', 20.86);
    const tEach = S.find('Each', 0, 22.63);

    // tag births: [tag index, the moment the ghost becomes a tag, ghost centre]
    const births = [
      { i: 0, at: tRename + 0.9, ghostAt: tRename, text: '.py', x: 1110, y: 520 },
      { i: 1, at: tFolder, ghostAt: tCdGhost, text: 'cd', x: 0, y: 657 },          // x set from the prompt below
      { i: 2, at: tIdea + 0.3, ghostAt: tVenv + 0.45, text: '', x: 1110, y: 598 },
    ];
    const prompt = 'C:\\Users\\you>', TERM = { x: 260, y: 560, w: 740, h: 300 }, TSIZE = 30;
    // the cd ghost sits on the prompt line, just past the caret
    births[1].x = TERM.x + 28 + K.measure(prompt, { font: 'mono', size: TSIZE }) + 40 + ghostW('cd') / 2;

    // ---------------------------------------------------------------- 01's degree card → compact chip
    // 01 ends with the card at rest at (140, 712), cap tipped 0.22 rad. Same object, same tilt, flown up
    // to the corner before Notepad opens. On "handed" it warms and breathes once: the one thing he *was*
    // handed. The warmth holds until [[pile]], then hands over to the tray (the light moves from the
    // degree to the pile of questions).
    const TILT = 0.22;
    const kDeg = K.io(t, 0.25, 0.8);
    const chipGlow = K.io(t, tHanded, 0.5) * (1 - K.io(t, tPile, 0.9));
    const breath = 1 + 0.04 * K.io(t, tHanded, 0.45) * (1 - K.io(t, tHanded + 0.5, 0.8));
    const [cx0, cy0] = M.layout.degree.card, [cx1, cy1] = M.layout.degree.chip;
    const chipC = [cx1 + 220, cy1 + 38];
    if (chipGlow > 0) K.glow(chipC[0], chipC[1], 240, C.head, 0.28 * chipGlow);
    if (kDeg <= 0) M.degree(cx0, cy0, { tilt: TILT });
    else if (kDeg >= 1) {
      K.at(chipC[0], chipC[1], breath, 0, () => {
        K.ctx().translate(-chipC[0], -chipC[1]);
        M.degree(cx1, cy1, { compact: true, tilt: TILT, glow: chipGlow });
      });
    } else {
      const p = M.arc([cx0, cy0], [cx1, cy1], kDeg, 60), L = (a, b) => K.lerp(a, b, kDeg);
      M.iconCard(p.x, p.y, L(700, 440), L(104, 76), 'cap', 'Information Systems', {
        iconSize: L(56, 40), iconX: L(60, 45), size: L(32, 28), weight: kDeg < 0.5 ? 600 : 400,
        color: K.mixColor(C.strong, C.soft, kDeg), tilt: TILT,
      });
    }

    // ---------------------------------------------------------------- the desk (dims on "hard")
    const deskA = 1 - 0.55 * K.io(t, tHard, 0.7);
    group(deskA, () => {
      // [[notepad]] Notepad rises; plain text, because Notepad doesn't highlight code.
      // The title reads "*Untitled" while typing and becomes script.txt the moment it is saved.
      K.rise(t, tNote, () => {
        const r = K.win(100, 190, 820, 420, { title: t < tSave ? '*Untitled - Notepad' : 'script.txt - Notepad', kind: 'notepad' });
        K.editor(r, t, CODE, { syntax: 'none', size: 30, typeAt, cps: CPS });
      });
      // saved: script.txt slides out of the window's side
      const kF = K.io(t, tSave, 0.5, 'out');
      if (kF > 0) K.layer(kF, () => K.at(K.lerp(1020, 1110, kF), 330, 0.85 + 0.15 * kF, 0, () => M.script(0, 0, 170)));

      // [[terminal]] Command Prompt rises over Notepad's lower-left corner: a steady prompt in the
      // home folder, caret blinking, nothing typed (he didn't know to cd)
      K.rise(t, tTerm, () => {
        const r = K.win(TERM.x, TERM.y, TERM.w, TERM.h, { title: 'Command Prompt', kind: 'terminal', focus: true });
        K.term(r, t, [{ at: tTerm - 1, cmd: '' }, { at: tHard + 0.35, out: '' }], { size: TSIZE });   // the caret stops as the desk dims
      });

      // [[venv]] the .venv folder (label drawn at 28 px: the kit's folder label would be 22)
      K.pop(t, tVenv, 1110, 700, () => {
        K.folder(1110, 700, 130);
        K.text('.venv', 1110, 800, { font: 'mono', size: 28, color: C.body, align: 'center' });
      });
    });

    // ---------------------------------------------------------------- ghosts → tags → tray
    // The ghost finishes fading before its tag appears (never both at once), and the tag fades in
    // in place at S0 0.9, so its label is 27 px from the first frame: the ghost visibly turns into
    // the tag, then the tag glides on an arc into its tray slot.
    const POP = 0.22, S0 = 0.9, GOUT = 0.15;
    const glowNow = 0.5 * K.io(t, tPile, 0.8);
    births.forEach((b) => {
      ghost(b.text, b.x, b.y, Math.min(K.io(t, b.ghostAt, 0.35, 'out'), 1 - K.io(t, b.at - GOUT, GOUT, 'in')));
    });

    // [[pile]] warm light gathers behind the tray (taking over from the degree chip)
    K.glow(...M.layout.tray.glow, C.head, 0.12 * K.io(t, tPile, 0.9));

    // [[pile]] "your own pile of these, too": three unlabeled, faint tickets (the viewer's questions,
    // no names yet) spill in under Aaron's three. On "Each one has a place" they straighten up and a
    // dashed shelf line draws under the whole column: yours have a place on the same shelf.
    const YOURS = [{ x: 1380, y: 584, rot: -0.04 }, { x: 1414, y: 622, rot: 0.032 }, { x: 1448, y: 660, rot: -0.018 }];
    const kSettle = K.io(t, tEach, 0.6);
    group(0.46, () => YOURS.forEach((p, j) => {
      const k = K.io(t, tPile + 0.14 * j, 0.5, 'out');
      if (k <= 0) return;
      M.tag('', p.x, p.y - (1 - k) * 18, { compact: 1, alpha: k, rot: p.rot * (1 - kSettle) });
    }));

    // each ghost becomes its tag
    births.forEach((b) => {
      if (t < b.at) return;
      const label = M.TAGS[b.i].label, box = M.tagBox(0), left = b.x - ghostW(b.text) / 2;
      const at = (sc) => ({ x: left + (sc * box.w) / 2 - box.w / 2, y: b.y - box.h / 2, scale: sc });
      if (t < b.at + POP) {
        const p = at(S0);
        M.tag(label, p.x, p.y, { scale: S0, alpha: K.io(t, b.at, POP, 'out') });
        return;
      }
      M.tagMove(label, t, b.at + POP, M.motion.glide, at(S0), { ...M.traySlot(b.i), glow: glowNow });
    });

    // "Each one has a place.": the shelf line draws, then the caption rises (C.body, fully in by "place")
    const SHELF = { x0: M.layout.tray.x, x1: M.layout.tray.right, y: 744 };
    const kShelf = K.io(t, tEach, 0.7);   // guarded: a zero-length round-capped line still draws a dot
    if (kShelf > 0.01) K.line(SHELF.x0, SHELF.y, SHELF.x1, SHELF.y, { k: kShelf, dash: [6, 10], color: K.rgba(C.soft, 0.75), w: 2 });
    K.rise(t, tEach + 0.05, () => K.text('each one has a place', M.layout.tray.cx, SHELF.y + 52, { ...M.type.caption, color: C.body, align: 'center' }), 14, 0.5);
  });
})();
