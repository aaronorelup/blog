/* 11 — A second ledger inside your editor.
   The V S Code door opens into the editor; a small second ledger (its language modes) sits inside it.
   Then: around AI, labels are promises about how to load a file (four strings), and a rename is no disguise. */
SCENE('11', (t, S) => {
  K.bg();
  const C = K.C, L = M.layout, io = K.io;
  const cue = (n, f) => S.cue(n, f);
  const cVs = cue('vscode', 2.62), cTwo = cue('two-tables', 10.28), cGuess = cue('guess', 21.94);
  const cAI = cue('ai-labels', 25.38), cNo = cue('no-disguise', 47.1);
  const w = (re, n, f) => S.find(re, n || 0, f);

  // ------------------------------------------------------------------ 1. the room: push into the V S Code door
  const zoomK = io(t, 0, 1.1);
  const roomA = 1 - io(t, 0.75, 0.5);
  if (roomA > 0) {
    const cam = K.cam(t, [{ at: 0, ...L.cams.doors }, { at: 0, d: 1.1, x: 1270, y: 440, z: 2.2 }]);
    K.layer(roomA, () => K.withCam(cam, () => M.room({
      t, ledger: false, desk: false, porter: false,   // only the doors are in frame at this zoom
      doors: { each: (i, n) => (n === 'V S Code' ? { focus: io(t, 0, 0.5), open: io(t, 0.25, 0.7) } : { dim: zoomK }) },
    })));
  }

  // ------------------------------------------------------------------ 2. the editor (V S Code's inside)
  const edA = io(t, 0.65, 0.6) * (1 - io(t, cAI - 0.5, 0.5));   // gone before the AI headline arrives
  const WX = 440, WY = 190, WW = 1160, WH = 660;
  let LG = null;
  if (edA > 0) {
    const sc = K.lerp(0.82, 1, io(t, 0.65, 0.7));
    K.layer(edA, () => K.zoomAt(1270, 470, sc, () => {
      K.win(WX, WY, WW, WH, { title: 'V S Code', titleSize: 26, kind: 'code' });
      const g = K.ctx();
      // tab strip
      g.save(); K.rr(WX, WY, WW, WH, 14); g.clip();
      g.fillStyle = '#15162A'; g.fillRect(WX, WY + 50, WW, 64);
      K.line(WX, WY + 114, WX + WW, WY + 114, { color: C.line, w: 1.5 });
      // status bar
      g.fillStyle = C.tile; g.fillRect(WX, WY + WH - 56, WW, 56);
      K.line(WX, WY + WH - 56, WX + WW, WY + WH - 56, { color: C.line, w: 1.5 });
      g.restore();

      // the file's name on the tab: hello.py -> hello.py.txt -> Untitled-1
      const n1 = io(t, cTwo, 0.6);                              // on 'So hello.py.txt': one beat with colours + status
      const n2 = io(t, cGuess, 0.6);                             // becomes Untitled-1
      const names = [['hello.py', 1 - n1, C.strong], ['hello.py.txt', n1 * (1 - n2), C.accent], ['Untitled-1', n2, C.strong]];
      const tabW = 330, tx = WX + 18, ty = WY + 58;
      K.rr(tx, ty, tabW, 56, 8); g.fillStyle = C.code; g.fill();
      K.line(tx + 8, ty + 2, tx + tabW - 8, ty + 2, { color: C.head, w: 3 });
      const tf = { font: 'mono', weight: 600, size: 30 };
      names.forEach(([nm, a, ec]) => {
        if (a <= 0) return;
        const d = nm.lastIndexOf('.');
        const base = d > 0 ? nm.slice(0, d) : nm, ext = d > 0 ? nm.slice(d) : '';
        K.text(base, tx + 24, ty + 39, { ...tf, color: C.strong, alpha: a });
        if (ext) K.text(ext, tx + 24 + K.measure(base, tf), ty + 39, { ...tf, color: ec, alpha: a });
      });
      // gold underline on '.py' while V S Code "reads the extension"
      const mk = io(t, w('extension', 0, 4.28), 0.5) * (1 - io(t, w('remap', 0, 9.49) - 0.4, 0.4));
      if (mk > 0) { const bw = K.measure('hello', tf); K.mark(tx + 24 + bw, ty + 49, K.measure('.py', tf), mk, { color: C.gold, w: 4 }); }

      // code: print("hi") with syntax colours that come and go with the language mode
      const colK = K.clamp(io(t, w('colours', 0, 5.46) - 0.1, 0.8) - io(t, cTwo, 0.6) + io(t, w('guesses', 0, 23.44) + 0.1, 0.6));
      const cx = WX + 110, cy1 = WY + 210, sz = 48;
      K.text('1', WX + 60, cy1, { font: 'mono', size: 32, color: C.quiet, align: 'right' });
      K.text('2', WX + 60, cy1 + 74, { font: 'mono', size: 32, color: C.quiet, align: 'right' });
      const mix = (c) => K.mixColor(C.strong, c, colK);
      K.spans([
        { s: 'print', color: mix(C.head) }, { s: '(', color: mix(C.soft) },
        { s: '"hi"', color: mix('#8FB8E8') }, { s: ')', color: mix(C.soft) },
      ], cx, cy1, { font: 'mono', weight: 600, size: sz });

      // status bar: language mode
      const stA = io(t, w('language', 0, 7.57) - 0.15, 0.5);
      if (stA > 0) {
        const sy = WY + WH - 18;
        const modes = [
          ['Python', C.head, 1 - io(t, cTwo, 0.6)],
          ['Plain Text', C.strong, io(t, cTwo, 0.6) * (1 - io(t, cGuess, 0.5))],
          ['?', C.accent, io(t, cGuess + 0.25, 0.35) * (1 - io(t, w('guesses', 0, 23.44) - 0.1, 0.35))],
          ['Python (detected)', C.head, io(t, w('guesses', 0, 23.44) + 0.1, 0.5)],
        ];
        const rx = WX + WW - 30;
        let maxW = 0;
        modes.forEach(([m, col, a]) => { if (a > 0) maxW = Math.max(maxW, K.measure(m, { font: 'ui', weight: 700, size: 28 }) * Math.min(1, a * 2)); });
        modes.forEach(([m, col, a]) => { if (a > 0) K.text(m, rx, sy, { font: 'ui', weight: 700, size: 28, color: col, align: 'right', alpha: stA * a }); });
        K.text('language mode:', rx - maxW - 14, sy, { font: 'ui', weight: 600, size: 28, color: C.soft, align: 'right', alpha: stA });
        const hl = K.env(t, w('language', 0, 7.57) - 0.1, w('remap', 0, 9.49) - 0.3, 0.4);
        if (hl > 0) K.glow(rx - 150, sy - 10, 220, C.head, 0.18 * hl);
      }

      // V S Code's own ledger: language modes
      const lgK = io(t, w('ledgers', 0, 1.3) - 0.1, 0.7);
      // the remap: the pen adds a row of your own (.mdx -> Markdown) while 'and you can remap it' is said.
      // the .txt row stays 'Plain Text' throughout, so the hello.py.txt payoff never contradicts it.
      const rA = w(/^and$/, 1, 8.86) - 0.2;                              // ~8.66
      const rowK = io(t, rA + 0.15, 0.4);                                // '.mdx' slides in
      const typeK = io(t, rA + 0.5, 0.9);                                // 'Markdown' is written
      const fIn = io(t, w('extension', 0, 4.28) - 0.4, 0.4);
      const fOut = io(t, cGuess, 0.5);
      // finger: on .py while V S Code reads the label, then on .txt the moment the name becomes hello.py.txt
      const fRow = K.lerp(0, 3, io(t, cTwo, 0.6));
      const pulse = K.seg(t, w('Two', 0, 19.69), w('Two', 0, 19.69) + 1.0);
      const lx = 1236 + (1 - K.ease.out(lgK)) * 80;
      K.layer(lgK, () => {
        LG = M.ledger(lx, WY + 158, 338, {
          title: 'language mode', eyebrow: "V S Code's ledger", eyebrowK: 1,
          finger: fRow, fingerK: fIn * (1 - fOut),
          rows: [
            { label: '.py', door: 'Python' },
            { label: '.md', door: 'Markdown' },
            { label: '.json', door: 'JSON' },
            { label: '.txt', door: 'Plain Text', pulse },
            { label: '.mdx', door: 'Markdown'.slice(0, Math.ceil(8 * typeK)), k: rowK },
          ],
        });
      });
      // the pen writes the new row, then lifts away before 'So hello.py.txt'
      const penA = K.env(t, rA, cTwo - 0.15, 0.25);
      if (penA > 0 && LG) {
        const f = { font: 'ui', weight: 600, size: LG.size };
        const px = LG.doorX + K.measure('Markdown'.slice(0, Math.ceil(8 * typeK)), f);
        M.pen(px, LG.rowY(4) + 4, 130, { alpha: penA, writing: K.env(t, rA + 0.5, rA + 1.4, 0.15), t });
      }
    }));
  }

  // ------------------------------------------------------------------ 2b. the computer's ledger: .txt -> Notepad
  // lands inside 'So hello.py.txt ...': chip on 'dot T X T', door + tag before 'opens in Notepad' finishes
  const lIn = w('dot', 1, 12.82) - 0.2;
  const leftA = io(t, lIn, 0.5) * (1 - io(t, cGuess, 0.5));
  if (leftA > 0) {
    K.layer(leftA, () => {
      const pulse = K.seg(t, w('Two', 0, 19.69), w('Two', 0, 19.69) + 1.0);
      M.ledger(92, 262, 316, { title: false, eyebrow: "computer's ledger", eyebrowK: 1, rows: [{ label: '.txt', door: 'Notepad', hi: io(t, w('opens', 0, 14.81) - 0.3, 0.4), pulse }] });
      const hk = io(t, w('opens', 0, 14.81) - 0.1, 0.6);
      M.door(250, 400, 150, 290, { name: 'Notepad', alpha: io(t, lIn + 0.3, 0.5), focus: io(t, w('opens', 0, 14.81) - 0.3, 0.5), holding: hk, holdName: 'hello.py.txt', t });
    });
  }
  const twoA = io(t, w('Two', 0, 19.69), 0.6) * (1 - io(t, cGuess, 0.5));
  if (twoA > 0) M.label('two ledgers, one label', 1020, 898, { alpha: twoA, color: C.head, glow: 0.3 });


  // ------------------------------------------------------------------ 3. AI-era labels: promises about how to load a file
  // 2 x 2 grid of strings (tags 1.2x, beads 0.5x). On no-disguise the three others gather in a quiet strip at the
  // bottom so the renamed .ckpt and the loader door own the top half.
  const aiA = io(t, cAI, 0.6);
  if (aiA > 0) {
    const TS = 1.2, ss = 0.5, n = 5, EYE = 2 * 50 + 31, END = 2 * 50 + 33;   // eye / cord end, local px
    const tW = (nm) => M.tagWidth(nm, TS);
    const drop = (a) => (i) => K.clamp((t - a - i * 0.07) / 0.45);
    const capX = (nm) => -EYE - tW(nm) / 2;                                   // caption centred under the tag
    const m = io(t, cNo - 0.1, 0.9);                                          // grid -> strip

    // heading: gold eyebrow + title, on 'Around AI'
    K.layer(aiA * (1 - 0.35 * m), () => {
      K.eyebrow('around AI', 960, 168, { align: 'center', size: 26 });
      K.title('Labels are loading promises', 960, 236, { size: 58, align: 'center' });
    });

    // strip layout (scale 0.66 keeps tag type at 27 px)
    const SS = 0.66, gap = 70;
    const ext = [[EYE + tW('model.gguf'), END], [EYE + tW('model.safetensors'), END], [EYE + tW('server.mcpb'), 300]];
    const tot = ext.reduce((s, [l, r]) => s + (l + r) * SS, 0) + gap * 2;
    let sx = 960 - tot / 2; const stripX = ext.map(([l, r]) => { const x = sx + l * SS; sx += (l + r) * SS + gap; return x; });
    const SY = 790;
    const place = (gx, gy, i, fn) => {
      const x = K.lerp(gx, stripX[i], m), y = K.lerp(gy, SY - (i === 2 ? 30 : 0), m), sc = K.lerp(1, SS, m);
      K.layer(1 - 0.6 * m, () => K.at(x, y, sc, 0, fn));
    };
    // each string (beads + tag) appears only when it is named: no empty placeholders before its cue
    const cell = (i, a, fn) => {
      const k = io(t, a, 0.6); if (k <= 0) return;
      fn(k, { alpha: k, tagK: 1, beadK: drop(a) });
    };

    // .ckpt (top-left): could run code when loaded -> renamed to .safetensors in no-disguise; stays put
    const aCk = w('C', 0, 31.85) - 0.3;
    cell(0, aCk, (k, B) => K.at(747, 390, 1, 0, () => {
      const strike = io(t, cNo + 0.2, 0.5), ren = io(t, w('safe', 1, 48.48) - 0.3, 0.9);
      const hold = io(t, cNo + 0.1, 0.6);
      const G = M.drawString(0, 0, ss, {
        t, n, ...B, hold,
        tag: { s: TS, w: K.lerp(tW('model.ckpt'), tW('model.safetensors'), io(t, w('safe', 1, 48.48) - 0.6, 0.6)), name: 'model.ckpt', to: ren > 0 || strike > 0 ? 'model.safetensors' : undefined, k: ren, strike, extColor: ren > 0.5 ? C.accent : undefined, swing: K.ease.out(k) },
        tagS: TS,
      });
      // one bead carries code: it is still there after the rename (bytes never change)
      const run = w('run', 0, 33.55);
      const cb = io(t, run - 0.15, 0.45);
      if (cb > 0) {
        const b = G.beads[2];
        const g = K.ctx(); g.save(); g.globalAlpha *= cb;
        g.beginPath(); g.arc(b.x, b.y, G.r + 1, 0, Math.PI * 2); g.fillStyle = C.accent; g.fill();
        g.restore();
        K.icon('code', b.x, b.y, G.r * 1.45, { color: C.page, w: 3, alpha: cb });
        const pk = K.seg(t, run, run + 0.9), ps = 1 + 0.3 * Math.sin(Math.PI * pk);
        K.icon('warning', b.x, b.y - 62, 44 * ps, { color: C.accent, w: 3.5, alpha: cb });
      }
      M.quiet('older: could run code when loaded', capX('model.ckpt') + 40, 128, { color: C.soft, alpha: io(t, w('could', 0, 33.33) - 0.1, 0.5) });
    }));

    // .safetensors (top-right): all plain beads + a lock on "can't"
    const aSt = w('dot', 3, 35.27) - 0.1;
    cell(1, aSt, (k, B) => place(1667, 390, 1, () => {
      M.drawString(0, 0, ss, { t, n, ...B, tagS: TS, tag: { s: TS, name: 'model.safetensors', swing: K.ease.out(k) } });
      const lk = io(t, w("can't", 0, 37.25) - 0.15, 0.45);
      if (lk > 0) K.icon('lock', 0, -62, 44, { color: C.head, w: 3.5, alpha: lk });
      M.quiet('made so it can\'t', capX('model.safetensors'), 128, { color: C.soft, alpha: io(t, w('made', 0, 36.68) - 0.1, 0.5) * (1 - m) });
    }));
    // .gguf (bottom-left)
    const aGg = w('dot', 4, 38.29) - 0.1;
    cell(2, aGg, (k, B) => place(747, 650, 0, () => {
      M.drawString(0, 0, ss, { t, n, ...B, tagS: TS, tag: { s: TS, name: 'model.gguf', swing: K.ease.out(k) } });
      M.quiet('a local model', capX('model.gguf'), 128, { color: C.soft, alpha: io(t, w('local', 0, 40.73) - 0.1, 0.5) * (1 - m) });
    }));
    // .mcpb + .docx (bottom-right): zips wearing their own label
    const aMc = w('bundles', 0, 42.93) - 0.5;
    cell(3, aMc, (k, B) => place(1530, 620, 2, () => {
      const G1 = M.drawString(0, 0, ss, { t, n, ...B, preset: 'docx', tint: null, tagS: TS, tag: { s: TS, name: 'server.mcpb', swing: K.ease.out(k) } });
      const dA = io(t, w('Word', 0, 45.82) - 0.2, 0.6);
      const G2 = dA > 0 ? M.drawString(0, 116, ss, { t: t + 1.3, n, beadK: drop(w('Word', 0, 45.82) - 0.2), alpha: dA, preset: 'docx', tagS: TS, tag: { s: TS, name: 'report.docx', swing: K.ease.out(dA) } }) : null;
      const zA = io(t, w('zips', 0, 43.57) - 0.1, 0.5);
      if (zA > 0) {
        const jy = 58 * dA, jx = 180;
        const e1 = G1.beads[G1.beads.length - 1];
        K.line(e1.x + G1.r + 4, e1.y, jx, jy, { color: K.rgba(C.head, 0.75), w: 3, alpha: zA });
        if (G2) { const e2 = G2.beads[G2.beads.length - 1]; K.line(e2.x + G2.r + 4, e2.y, jx, jy, { color: K.rgba(C.head, 0.75), w: 3, alpha: zA * dA }); }
        M.chip('zip', 238 + 30 * m, jy, { alpha: zA, size: 28 / K.lerp(1, SS, m) });
        M.quiet('zips wearing their own label', -150, 236, { color: C.soft, alpha: zA * (1 - m) });
      }
    }));

    // no disguise: renamed .ckpt goes to the safetensors loader, which won't load it
    const dK = io(t, w('safe', 2, 50.04) - 0.3, 0.6);
    if (dK > 0) {
      const crossK = io(t, w('won\'t', 0, 51.44) - 0.1, 0.5);
      const DX = 1150, DY = 280 + (1 - K.ease.out(dK)) * 30;
      const D = M.door(DX, DY, 170, 260, { name: 'Loader', icon: 'blank', alpha: dK, cross: crossK, sub: crossK > 0.3 ? 'won\'t load' : null });
      const P = D.panel;
      K.icon('gear', P.x + P.w / 2, P.y + P.h * 0.36, Math.min(P.w * 0.55, 76), { color: C.soft, alpha: dK * (1 - crossK) });
      K.arrow(747 + END + 16, 390, DX - 85 - 18, 390, { k: io(t, w(/^It$/, 0, 50.96) - 0.1, 0.5), color: K.rgba(C.head, 0.7), w: 3, dash: [8, 8] });
    }
    const sA = io(t, w('safe', 2, 50.04) - 0.1, 0.5);
    if (sA > 0) M.label('safe ≠ renamed · 15.17', 470, 620, { alpha: sA, color: C.strong });
  }
});
