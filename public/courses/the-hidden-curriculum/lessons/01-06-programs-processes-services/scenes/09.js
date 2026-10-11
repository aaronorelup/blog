// 09 — The surprises: port in use, leftovers and "zombies"
// Hatch wall from 08 (3000 · 5173 · … · 11434). Node's EADDRINUSE, Vite's quiet hop to 5174,
// a second Ollama that can't bind, a Linux ps card for a strict zombie, and the live orphan at 3000.
SCENE('09', (t, S) => {
  const M = window.M, C = K.C, L = M.L;
  K.bg();

  // ---------------------------------------------------------------- beats (local seconds)
  const cMean = S.cue('meaning', 5.29), cVite = S.cue('vite-hop', 10.53), cOll = S.cue('ollama-bind', 24.49);
  const cZom = S.cue('zombie', 27.92), cOrph = S.cue('orphan', 37.58);
  const wAddr = S.find('address', 0, 1.39);
  const w3000 = S.find('3000', 0, 3.87);
  const wEarlier = S.find('earlier', 0, 7.86);
  const wPort = S.find('port', 1, 13.21, { whole: true });
  const wTrying = S.find('trying', 0, 16.0);
  const wOpens = S.find('opens', 0, 17.76);
  const wTwo = S.find('two', 0, 20.84);
  const wBrowser = S.find('browser', 0, 22.52);
  const wCant = S.find("can't", 0, 26.19);
  const wStrictly = S.find('Strictly', 0, 30.4);
  const wFinished = S.find('finished', 0, 32.17);
  const wEntry = S.find('entry', 0, 33.55);
  const wNothing = S.find('nothing', 0, 36.7);
  const wAlive = S.find('alive', 0, 39.02);
  const wLeftover = S.find('leftover', 1, 40.12);
  const wParent = S.find('parent', 1, 42.09);

  // ---------------------------------------------------------------- the hatch wall (08's six, three fade away)
  const HX = L.hatches.xs; // 260 540 820 1100 1380 1660
  const GEO = { ...L.hatches, y: 205 }; // where 08 leaves the wall
  const fadeOthers = 1 - K.io(t, 0.3, 0.8);
  const k5174 = K.io(t, wTrying, 0.6);
  const focusOrph = K.io(t, cOrph, 0.5);

  // 3000: open (old node cook) -> named when "3000" is said -> blocked bar while the new cook bumps
  const st3000 = (t >= w3000 && t < cVite) || t >= cOrph ? 'busy' : 'open';
  // 5173: named while Vite finds it taken
  const st5173 = t >= wPort - 0.2 && t < cOll ? 'busy' : 'open';
  // 11434: named + bar while the second Ollama fails to bind
  const bar11434Raw = K.io(t, wCant - 0.4, 0.5) * (1 - K.io(t, cZom + 0.2, 0.5));
  const bar11434 = bar11434Raw < 0.08 ? 0 : bar11434Raw; // no stray end-cap dot as it retracts
  const st11434 = t >= cOll + 0.3 && t < cZom + 0.5 ? 'busy' : 'open';

  M.hatchWall(t, {
    geo: GEO,
    hatches: [
      { num: '3000', state: st3000 },
      { num: '5173', state: st5173 },
      { num: '8000', state: 'open', alpha: fadeOthers },
      { num: '8188', state: 'open', ai: true, alpha: fadeOthers },
      { num: '1234', state: 'open', ai: true, alpha: fadeOthers },
      { num: '11434', state: st11434, ai: true, bar: bar11434 },
    ],
  });
  // the new hatch, one over from 5173 (where 8000 stood)
  if (k5174 > 0) M.hatch(t, HX[2], GEO.y + GEO.h / 2, { num: '5174', k: k5174, state: t >= wOpens ? 'open' : 'idle' });

  // "two copies running" bracket over 5173 + 5174
  const kTwo = K.io(t, wTwo - 0.1, 0.5) * (1 - K.io(t, cOll, 0.5));
  if (kTwo > 0) {
    const by = GEO.y - 22;
    K.layer(kTwo, () => {
      K.line(HX[1] - 90, by + 12, HX[1] - 90, by, { color: C.head, w: 3 });
      K.line(HX[1] - 90, by, HX[2] + 90, by, { color: C.head, w: 3 });
      K.line(HX[2] + 90, by, HX[2] + 90, by + 12, { color: C.head, w: 3 });
      K.pill('two copies running', (HX[1] + HX[2]) / 2, by - 10, { size: 26, fill: C.panel, stroke: C.head, color: C.head });
    });
  }

  // ---------------------------------------------------------------- cooks at the hatches
  const CY = 503;
  // owner names under the sills (as 08 leaves them)
  const kEarlier = K.io(t, wEarlier - 0.1, 0.5) * (1 - K.io(t, cVite - 0.6, 0.5));
  const OWN = ['Node', 'Vite', 'Python', 'ComfyUI', 'LM Studio', 'Ollama'];
  OWN.forEach((s, i) => {
    const a = i >= 2 && i <= 4 ? fadeOthers : 1;
    M.label(s, HX[i], 373, { color: C.strong, alpha: a });
  });
  if (k5174 > 0) M.label('Vite, again', HX[2], 373, { color: C.strong, alpha: K.io(t, wOpens, 0.5) });
  // the other three of 08's six fade with their hatches
  [2, 3, 4].forEach((i) => M.cook(t, HX[i], CY, 96, { alpha: fadeOthers, ai: i > 2 }));

  // zombie beat: the other cooks step back a little; PID 18412 stays lit (it is alive and holding 3000)
  const dimMid = 0.75 * K.io(t, cZom, 0.6) * (1 - focusOrph);
  const dimOrph = focusOrph;

  // A: the old node cook at 3000 (an earlier copy you thought you stopped)
  const litA = Math.max(K.io(t, cMean + 0.2, 0.5) * (1 - K.io(t, cVite - 0.6, 0.5)), K.io(t, cZom, 0.5));
  M.cook(t, HX[0], CY, 96, {
    pid: 18412, name: 'node.exe',
    lit: litA, named: K.io(t, wLeftover - 0.2, 0.5),
    dim: 0.25 * K.io(t, cMean, 0.5) * (1 - K.io(t, cVite, 0.5)),
  });
  // the "earlier copy" tag belongs to cook A (PID 18412), directly under its name
  if (kEarlier > 0) {
    M.label('earlier copy', HX[0], 664, { color: C.accent, alpha: kEarlier, weight: 700 });
  }
  // B: the old Vite copy at 5173
  const litB = K.io(t, wBrowser - 0.2, 0.5) * (1 - K.io(t, cOll, 0.5));
  M.cook(t, HX[1], CY, 96, {
    pid: 20544, pidK: K.io(t, wPort, 0.5), name: t >= wPort + 0.2 ? 'node.exe' : null, lit: litB,
    named: K.io(t, wPort - 0.2, 0.5) * (1 - K.io(t, wTrying, 0.5)),
    dim: Math.max(0.6 * dimMid, 0.6 * dimOrph, 0.45 * K.io(t, cOll, 0.5) * (1 - K.io(t, cZom, 0.4))),
  });

  // N: the new node copy that bumps 3000 and exits
  const nIn = K.io(t, cMean + 0.05, 0.4), nWalk = K.io(t, cMean + 0.1, 0.9);
  const nOut = 1 - K.io(t, cVite - 0.9, 0.5);
  if (nIn * nOut > 0) {
    M.cook(t, K.lerp(470, 400, nWalk), K.lerp(640, 520, nWalk), 84, {
      alpha: nIn * nOut, walking: nWalk > 0 && nWalk < 1 ? 1 : 0,
      named: K.io(t, cMean + 1.4, 0.4), badge: t >= cMean + 1.5 ? 'cross' : null,
    });
  }

  // C: the new Vite copy: walks to 5173, finds it taken, hops to 5174
  const cIn = K.io(t, cVite + 0.3, 0.4);
  const cW1 = K.io(t, cVite + 0.4, 1.0), cW2 = K.io(t, wTrying + 0.1, 1.0);
  if (cIn > 0) {
    const cx = K.lerp(K.lerp(760, 724, cW1), HX[2], cW2), cy = K.lerp(K.lerp(660, 560, cW1), CY, cW2);
    const moving = (cW1 > 0 && cW1 < 1) || (cW2 > 0 && cW2 < 1);
    M.cook(t, cx, cy, 96, {
      alpha: cIn, walking: moving ? 1 : 0,
      pid: 25360, pidK: K.io(t, wOpens + 0.2, 0.5), name: t >= wOpens + 0.4 ? 'node.exe' : null,
      lit: kTwo,
      dim: Math.max(0.6 * dimMid, 0.6 * dimOrph, 0.45 * K.io(t, cOll, 0.5) * (1 - K.io(t, cZom, 0.4))),
    });
  }

  // D: the running Ollama server at 11434
  M.cook(t, HX[5], CY, 96, {
    pid: 22124, pidK: K.io(t, cOll, 0.5), name: t >= cOll + 0.2 ? 'ollama.exe' : null, ai: true,
    lit: K.io(t, cOll, 0.5) * (1 - K.io(t, cZom, 0.5)),
    dim: Math.max(0.35 * K.io(t, 0.3, 0.8) * (1 - K.io(t, cOll, 0.5)), 0.6 * dimMid, 0.6 * dimOrph),
  });
  // E: a second Ollama that can't take its port
  const eIn = K.io(t, cOll + 0.15, 0.4), eWalk = K.io(t, cOll + 0.2, 0.9), eOut = 1 - K.io(t, cZom + 0.1, 0.5);
  if (eIn * eOut > 0) {
    M.cook(t, HX[5], K.lerp(850, 750, eWalk), 84, {
      alpha: eIn * eOut, ai: !(t >= wCant), badge: t >= wCant ? 'cross' : null,
      walking: eWalk > 0 && eWalk < 1 ? 1 : 0, named: K.io(t, wCant - 0.3, 0.4),
    });
    const lk = K.io(t, wCant, 0.5) * eOut;
    K.text('bind error', 1590, 735, { ...M.T.labelBig, color: C.accent, align: 'right', alpha: lk });
    K.text('127.0.0.1:11434', 1590, 779, { ...M.T.monoSm, color: C.strong, align: 'right', alpha: lk });
  }

  // ---------------------------------------------------------------- labels under the 3000 cook
  // what people call it: a soft quoted pill, set aside once the strict meaning arrives
  const kQuote = K.io(t, cZom + 1.6, 0.5) * (1 - 0.5 * K.io(t, wStrictly, 0.5)) * (1 - K.io(t, cOrph, 0.5));
  if (kQuote > 0) {
    // pinned to cook A (PID 18412, the leftover at 3000) with a short leader up to its name
    K.layer(kQuote, () => {
      K.line(HX[0], 652, HX[0], 700, { color: C.head, w: 2 });
      K.pill('"zombie"', HX[0], 724, { size: 26, font: 'mono', fill: C.panel, stroke: C.head, color: C.strong });
    });
  }

  // ---------------------------------------------------------------- the terminal (bottom left)
  const termA = 1 - K.io(t, cZom, 0.5);
  if (termA > 0) {
    K.layer(termA, () => {
      const r = K.win(120, 692, 960, 230, { title: 'Terminal', titleSize: 26, kind: 'terminal' });
      K.term(r, t, [
        { at: 0.25, cmd: 'npm run dev', prompt: 'C:\\api>', cps: 24 },
        { at: wAddr - 0.15, out: 'Error: listen EADDRINUSE: address already in use :::3000', color: C.accent },
        { at: cVite + 0.1, cmd: 'npm run dev', prompt: 'C:\\web>', cps: 24 },
        { at: wPort - 0.1, out: 'Port 5173 is in use, trying another one...', color: C.body },
        { at: wOpens, out: '  Local:   http://localhost:5174/', color: C.head },
      ], { size: 26, lh: 36, pad: 14, rows: 4 });
    });
  }

  // ---------------------------------------------------------------- the browser still on the old one (right)
  const brA = K.io(t, wBrowser - 0.2, 0.5) * (1 - K.io(t, cOll, 0.45));
  if (brA > 0) {
    K.layer(brA, () => {
      const r = K.win(1170, 670, 600, 210, { title: 'my app', titleSize: 26, kind: 'browser', url: 'localhost:5173', urlLock: false });
      M.label('still the old one', r.x + r.w / 2, r.y + 68, { color: C.head, size: 30 });
    });
  }

  // ---------------------------------------------------------------- zombie (strict, Unix): a ps card (right)
  const psIn = K.io(t, wStrictly - 0.1, 0.6);
  if (psIn > 0) {
    const px = 1120, py = 670, pw = 680, ph = 200;
    const psDim = 1 - 0.35 * focusOrph;
    K.layer(psIn * psDim, () => {
      const r = K.win(px, py, pw, ph, { title: 'separate Linux example · ps', titleSize: 26, kind: 'terminal' });
      const rowY = (i) => r.y + 46 + i * 44;
      const col = [r.x + 30, r.x + 150, r.x + 260];
      ['PID', 'STAT', 'CMD'].forEach((s, j) => K.text(s, col[j], rowY(0), { ...M.T.monoSm, color: C.soft }));
      [['4120', 'S', 'bash'], ['4188', 'Z', '[node] <defunct>']].forEach((row, i) => {
        const zk = i === 1 ? K.io(t, wFinished - 0.2, 0.5) : 0;
        if (i === 1 && zk > 0) K.layer(zk, () => K.card(r.x + 14, rowY(i + 1) - 32, r.w - 28, 44, { r: 8, fill: K.rgba(C.soft, 0.16), stroke: K.rgba(C.soft, 0.6), shadow: false }));
        row.forEach((s, j) => K.text(s, col[j], rowY(i + 1), { ...M.T.monoSm, color: i === 1 && j > 0 ? K.mixColor(C.strong, C.soft, zk) : C.strong }));
      });
    });
    // the strict meaning, left of the card, one phrase per spoken phrase
    const zl = 1 - K.io(t, cOrph, 0.5);
    if (zl > 0) {
      const lx = 1070, ly = 720;
      M.eyebrow('zombie (strict, Unix)', lx, ly, { align: 'right', alpha: psIn * zl });
      M.label('finished', lx, ly + 48, { align: 'right', size: 30, color: C.strong, alpha: K.io(t, wFinished, 0.5) * zl });
      M.label('entry only', lx, ly + 92, { align: 'right', size: 30, color: C.strong, alpha: K.io(t, wEntry, 0.5) * zl });
      M.label('uses nothing', lx, ly + 136, { align: 'right', size: 30, color: C.strong, alpha: K.io(t, wNothing - 0.3, 0.5) * zl });
    }
  }

  // ---------------------------------------------------------------- orphan: alive at 3000, parent gone
  const pk = K.io(t, wParent - 0.3, 0.6);
  if (pk > 0) {
    M.cook(t, HX[0], 790, 84, { kind: 'ghost', icon: 'terminal', alpha: pk, hat: false });
    M.parentLink(HX[0], 742, HX[0], 648, { k: K.io(t, wParent - 0.1, 0.8), label: null, bend: 0 });
    M.label('parent: gone', HX[0] + 70, 800, { align: 'left', color: C.soft, alpha: pk });
  }

  // ---------------------------------------------------------------- exit: the two labels side by side
  const kOrphL = K.io(t, wLeftover - 0.2, 0.5);
  if (kOrphL > 0) {
    K.spans([
      { s: 'orphan: ', color: C.accent, weight: 700 },
      { s: 'alive, holding the port', color: C.strong },
    ], 560, 900, { align: 'center', size: 30, font: 'ui', alpha: kOrphL });
  }
  const kZomL = K.io(t, cOrph, 0.5);
  if (kZomL > 0) {
    K.spans([
      { s: 'zombie: ', color: C.soft, weight: 700 },
      { s: 'name only', color: C.body },
    ], 1460, 900, { align: 'center', size: 30, font: 'ui', alpha: kZomL });
  }
});
