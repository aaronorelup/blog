/* 03 — The porter and the ledger
   The room is introduced: doors on the right, desk + closed ledger on the left, a string waiting in front.
   The porter pops in (File Explorer · Finder), takes the string and holds its tag up to read it: the beads dim,
   the name before the last dot dims, a gold underline runs under '.txt'. The ledger lifts and opens, the gold
   finger lands on '.txt -> Notepad', the Notepad door lights, and the string is carried there and handed over.
   The ledger's header writes 'file associations'; then a second account's ledger slides out beside it with
   '.txt -> VS Code' (one ledger per user) and fades again. Exit = 04's entry: ledger lifted, Notepad holding.
   On-screen editor name is the literal 'VS Code' (00-shared.js still spells 'V S Code'; remapped here). */
SCENE('03', (t, S) => {
  K.bg();
  const L = M.layout, C = K.C;
  const cue = (n, f) => S.cue(n, f);
  const w = (word, n, f) => S.find(word, n, f);
  const cPorter = cue('porter', 0), cRead = cue('reads-tag', 9.6), cOpen = cue('ledger-open', 16.6);
  const cFinger = cue('finger', 18.7), cCarry = cue('carry', 26.5), cTerm = cue('term', 33.05), cUser = cue('per-user', 36.7);
  const tTakes = w('takes', 0, 3.85), tExplorer = w('Explorer', 0, 6.7) - 0.35, tFinder = w('Finder', 0, 8.7);
  const tNever = w('never', 0, 10.23), tBeads = w('beads', 0, 11.1), tTag = w('tag', 0, 12.9), tLast = w('last', 0, 15.1);
  const tNotepad = w('Notepad', 0, 25.0), tHands = w('hands', 0, 28.5), tUntied = w('untied', 0, 31.0);
  const tAssoc = w('associations', 0, 35.4) - 0.4, tTwo = w('two', 0, 39.4), tDiff = w('different', 0, 41.35);
  const END = S.dur;

  // the screen carries the literal 'VS Code' (00-shared.js spells the spoken 'V S Code'): remap names here.
  // the door icon table is keyed by name, so alias it once (additive, idempotent; the shared file is untouched).
  const VS = 'VS Code', fixName = (n) => (n === 'V S Code' ? VS : n);
  if (M.DOORS && !M.DOORS[VS] && M.DOORS['V S Code']) M.DOORS[VS] = M.DOORS['V S Code'];
  const DOOR_NAMES = ['Notepad', 'V S Code', 'Photos', 'Browser'].map(fixName);
  const ROWS = M.ROWS.map((r) => ({ ...r, door: fixName(r.door) }));

  // ------------------------------------------------ camera: room -> reading the tag -> the ledger -> room
  // a gentle push only: all four doors stay in frame the whole scene (right door edge 1735 -> 1837 at z 1.05)
  const cam = K.cam(t, [
    { at: 0, ...L.cams.room },
    { at: cRead, x: 900, y: 500, z: 1.05, d: 1.0 },
    { at: cOpen, ...L.cams.room, d: 1.0 },
  ]);

  // ------------------------------------------------ the string: waiting -> in the porter's hand -> carried
  const SI = L.stringIn;
  const HOLD = { x: 700, y: 304 };                       // held up over the desk, tag above the porter's head
  const takeK = K.io(t, tTakes, 0.8);
  const takePts = [[SI.x, SI.y], [860, 600], [HOLD.x, HOLD.y]];
  const carryA = cCarry + 0.25, CARRY = M.motion.carry;
  const carryK = K.io(t, carryA, CARRY);
  const handK = K.io(t, carryA + CARRY - 0.15, 0.6);    // handed over: door strand fades in, carried string out
  const notepadFocus = K.io(t, tNotepad, 0.6);

  // ------------------------------------------------ the second ledger (one per user account)
  const dupK = K.io(t, cUser + 0.2, 0.8);
  const dupOut = K.io(t, END - 1.0, 0.5);
  const dupA = dupK * (1 - dupOut);
  // doors persist all scene: they recede while the tag and ledger are read, then Notepad is gold-framed and the
  // other three sit at ~35%; on 'different' V S Code lifts a little (the second account's door); all back for 04.
  const readDim = K.io(t, cRead, 0.6) * (1 - K.io(t, tNotepad - 0.1, 0.6));
  const othersDim = K.io(t, tNotepad - 0.1, 0.6) * (1 - K.io(t, END - 1.3, 0.9));
  const vsLift = K.io(t, tDiff - 0.1, 0.5) * (1 - dupOut);

  // ------------------------------------------------ the room
  const popA = cPorter + 0.35;
  const popped = t >= popA + 0.75;
  const capK = K.clamp(K.io(t, tExplorer - 0.1, 0.5) * 0.5 + K.io(t, tFinder - 0.1, 0.5) * 0.5) * (1 - K.io(t, cRead, 0.5));
  const lift = K.io(t, cOpen + 0.1, 1.0);
  const fingerSlide = K.io(t, cFinger + 0.25, M.motion.finger);
  const fingerK = K.io(t, cFinger + 0.2, 0.3) * (1 - K.io(t, cUser, 0.5));
  const hiA = K.io(t, tDiff - 0.1, 0.5) * (1 - dupOut);
  const rowsA = ROWS.map((r, i) => (i === 0 ? { ...r, hi: hiA } : r));
  const look = K.lerp(0, 0.35, K.io(t, cRead, 0.6)) * (1 - K.io(t, cOpen, 0.6)) + 0.5 * K.env(t, cCarry, cTerm, 0.6);

  K.withCam(cam, () => {
    const R = M.room({
      t, lift,
      porter: popped ? { t, look, caption: capK > 0 ? ['File Explorer', 'Finder'] : null, captionK: capK } : false,
      doors: {
        names: DOOR_NAMES,
        each: (i, n) => n === 'Notepad'
          ? { focus: notepadFocus, alpha: 1 - 0.4 * readDim, holding: handK, holdName: 'hello.txt', t }
          : { alpha: (1 - 0.4 * readDim) * (1 - 0.65 * othersDim * (n === VS ? 1 - 0.45 * vsLift : 1)) },
      },
      ledger: {
        rows: rowsA,
        // a neutral 'ledger' heading until [[term]], then it is retitled 'file associations'
        title: t < cTerm + 0.35 ? 'ledger' : 'file associations',
        titleK: t < cTerm + 0.35 ? 1 - K.clamp((t - cTerm) / 0.35) : K.clamp((t - Math.max(cTerm + 0.35, tAssoc - 0.1)) / 1.1),
        finger: K.lerp(-0.7, 0, fingerSlide), fingerK,
      },
    });
    // the porter's pop-in (the scene's one 'back' overshoot), drawn over the room until it settles
    if (!popped && t >= popA) {
      const k = K.io(t, popA, 0.75, 'back');
      K.layer(K.clamp(k * 1.5), () => K.at(L.porter.x, L.porter.y + 60, 0.6 + 0.4 * k, 0, () => {
        K.ctx().translate(-L.porter.x, -L.porter.y - 60);
        M.porter(L.porter.x, L.porter.y, L.porter.s, { t });
      }));
    }

    // ---- the string
    const beadsDim = K.io(t, tNever - 0.05, 0.5) * (1 - K.io(t, cOpen, 0.6));
    const tagS = K.lerp(0.8, 1.3, K.io(t, tTag - 0.2, 0.7) * (1 - K.io(t, cOpen, 0.7)));
    const dimBase = K.io(t, tLast - 0.9, 0.6) * (1 - K.io(t, cCarry, 0.6));
    const mark = K.io(t, tLast - 0.5, 0.8) * (1 - K.io(t, cCarry, 0.6));
    let p;
    if (t < carryA) p = takeK > 0 ? M.along(takePts, takeK) : { x: SI.x, y: SI.y };
    else p = M.along(M.carryPath(HOLD.x, HOLD.y, R.doors.byName.Notepad, 120), carryK);
    const sA = 1 - handK;
    if (sA > 0) {
      // faint gold trail behind the carried string
      if (t >= carryA) {
        const trailA = 0.45 * (1 - K.io(t, carryA + CARRY + 0.3, 0.8));
        if (trailA > 0) K.path(M.carryPath(HOLD.x, HOLD.y, R.doors.byName.Notepad, 120), { k: carryK, color: C.gold, w: 3, dash: [10, 12], alpha: trailA, head: false });
      }
      const G = M.drawString(p.x, p.y, SI.s, { t, n: SI.n, tag: false, alpha: sA * (1 - 0.75 * beadsDim) });
      const TG = M.tag(G.eye.x, p.y, { name: 'hello.txt', s: tagS, t, alpha: sA, dimBase, mark });
      // "never looks at the beads": the porter's gaze goes to the tag only; a struck-through eye sits over the beads
      const gazeK = K.io(t, tNever - 0.05, 0.5) * (1 - K.io(t, cOpen - 0.3, 0.5));
      if (gazeK > 0 && TG) {
        const hx = L.porter.x + 30, hy = L.porter.y - 78;
        const tx = (TG.x0 + TG.x1) / 2, ty = TG.y1 + 4;
        K.line(hx, hy, tx, ty, { k: K.io(t, tNever, 0.6), color: C.gold, w: 3, dash: [8, 9], alpha: 0.85 * gazeK });
        // the eye chip makes way for 'only after the last dot' (which sits on the same line above the tag)
        const eyeK = gazeK * (1 - K.io(t, tLast - 0.95, 0.5));
        if (eyeK > 0) notRead((G.x0 + G.x1) / 2, p.y - 58, eyeK, K.io(t, tNever + 0.35, 0.5));
      }
    }
    // the porter's finger: a small cream fingertip that slides down beside the gold bar and stops on '.txt'
    const fpA = fingerK * (1 - K.io(t, cCarry - 0.2, 0.5));
    if (fpA > 0 && R.ledger) {
      const fy = R.ledger.rowY(0) + K.lerp(-0.7, 0, fingerSlide) * M.LED.row;
      const tipX = R.ledger.x - 6, tipY = fy;
      K.layer(fpA, () => {
        const g = K.ctx();
        g.save(); g.lineCap = 'round';
        g.strokeStyle = C.gold; g.lineWidth = 30;
        g.beginPath(); g.moveTo(tipX, tipY); g.lineTo(tipX - 70, tipY - 34); g.stroke();
        g.strokeStyle = C.paper; g.lineWidth = 24;
        g.beginPath(); g.moveTo(tipX, tipY); g.lineTo(tipX - 70, tipY - 34); g.stroke();
        g.restore();
      });
    }

    // "only after the last dot"
    const ruleK = K.io(t, tLast - 0.3, 0.6) * (1 - K.io(t, cOpen, 0.5));
    if (ruleK > 0) M.label('only after the last dot', 520, 238 - ruleK * 6, { alpha: ruleK, color: C.head });

    // "never untied": under the Notepad door's handed-over string
    const nuK = K.io(t, tUntied - 0.6, 0.6) * (1 - K.io(t, cTerm, 0.5));
    if (nuK > 0) M.label('never untied', R.doors.byName.Notepad.x0 + 85, 772 - nuK * 6, { alpha: nuK });

    // "one row = one association": once the ledger has its proper name
    const rowK = K.io(t, tAssoc + 0.2, 0.6) * (1 - K.io(t, cUser - 0.35, 0.45));
    if (rowK > 0 && R.ledger) {
      const ry = R.ledger.rowY(0), rx = R.ledger.x + R.ledger.w - 14;
      const px = 1010, py = 790 - rowK * 6;
      K.line(rx, ry, rx + 34, ry, { color: C.head, w: 2, alpha: 0.7 * rowK });
      K.line(rx + 34, ry, px - 120, py - 22, { k: rowK, color: C.head, w: 2, alpha: 0.7 * rowK });
      M.label('one row = one association', px, py, { alpha: rowK, color: C.head });
    }

    // ---- one ledger per user: a second account's ledger (just its first two rows) settles under the doors
    if (dupA > 0) {
      const BX = 1255, BY = 668, BW = 430;
      const k = K.ease.io(dupK);
      const bx = K.lerp(BX + 140, BX, k), by = BY + dupOut * 24;   // slides in from the right, clear of the Notepad tag
      M.ledger(bx, by, BW, {
        alpha: K.clamp(dupK * 2) * (1 - dupOut), size: 26,
        rows: [{ ...ROWS[0], door: VS, hi: hiA }, ROWS[1]],
      });
      // owners arrive with the ledger, on the per-user cue
      const ownK = K.io(t, cUser + 0.3, 0.6) * (1 - dupOut);
      if (ownK > 0) {
        owner('a second account', bx + BW / 2, BY + M.ledgerH(2) + 36, ownK);
        owner('you', L.ledger.x + 300, L.ledger.y - 30, ownK);
      }
      const ruleU = K.io(t, cUser + 0.6, 0.6) * (1 - dupOut);
      if (ruleU > 0) {
        // centred in the gap between the two ledgers, with a thin leader to each
        const ux = (L.ledger.x + L.ledger.w + BX) / 2, uy = 830 - ruleU * 6;
        const P = M.label('one ledger per user', ux, uy, { alpha: ruleU, color: C.head });
        const hw = (typeof P === "number" ? P : 300) / 2;
        K.line(ux - hw - 4, uy, L.ledger.x + L.ledger.w + 6, uy, { k: ruleU, color: C.head, w: 2, alpha: 0.7 * ruleU });
        K.line(ux + hw + 4, uy, BX - 6, uy, { k: ruleU, color: C.head, w: 2, alpha: 0.7 * ruleU });
      }
    }
  });

  /** a small dark chip with an eye struck through: 'not read' (sits over the bead row) */
  function notRead(x, y, a, strikeK) {
    const g = K.ctx(), r = 34;
    K.layer(a, () => {
      g.save();
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = C.tile; g.fill();
      g.lineWidth = 2; g.strokeStyle = C.line2; g.stroke();
      g.strokeStyle = C.strong; g.lineWidth = 3.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - 20, y); g.quadraticCurveTo(x, y - 18, x + 20, y); g.quadraticCurveTo(x, y + 18, x - 20, y); g.stroke();
      g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fillStyle = C.strong; g.fill();
      g.restore();
      if (strikeK > 0) K.line(x - 22, y + 20, x + 22, y - 20, { k: strikeK, color: M.palette.changed, w: 5 });
    });
    K.text('not read', x + r + 12, y + 9, { font: 'ui', weight: 600, size: 26, color: C.soft, alpha: a });
  }

  /** a small owner pill with a person icon: who this ledger belongs to */
  function owner(name, x, y, a) {
    const size = 28, tw = K.measure(name, { font: 'ui', weight: 600, size }), pw = tw + 44 + size * 1.6;
    K.card(x - pw / 2, y - size * 0.95, pw, size * 1.9, { r: size * 0.95, fill: C.tile, stroke: C.line2, alpha: a });
    K.icon('person', x - pw / 2 + 34, y, 30, { color: C.head, alpha: a, w: 2.5 });
    K.text(name, x - pw / 2 + 56, y + size * 0.34, { font: 'ui', weight: 600, size, color: C.strong, alpha: a });
  }
});
