// 12 — The surprises you'll hit.
// The shop cross-section stays behind, dimmed; seven surprise cards come one at a time on one card that
// sits right of the shop floor (1-2, so the .git spot stays visible) and then left (3-7, so the back room /
// home room stays visible). The spot each surprise is about lights up behind the card.
SCENE('12', (t, S) => {
  K.bg();
  const L = M.layout, P = M.palette, C = K.C, g = K.ctx();

  // ---- cue times (local)
  const fb = [0, 6.75, 16.12, 23.92, 28.61, 36.14, 42.89];
  const names = ['no-git', 'windows-open', 'still-on-github', 'push-declined', 'roaming-path', 'ds-store', 'leftovers'];
  const c = names.map((n, i) => S.cue(n, fb[i]));
  const w = (word, off, nth) => S.find(word, nth || 0, off);   // word time with a fallback

  // ---- background: the shop, then (from the AppData surprise on) the home back room
  const homeK = K.io(t, c[4], 0.8);
  const leftK = K.io(t, c[2] - 0.15, 0.7);
  M.shop(t, {
    roomK: 1 - homeK,
    wallK: 1 - homeK,
    door: { alpha: 1 - homeK },
    sign: { alpha: (1 - homeK) * (1 - leftK) },
  });
  // the leftover dot folder appears in the home room on the last surprise
  const goneK = K.io(t, c[6] + 0.2, 0.6);
  // AppData envelope (surprise 5): the home copy of AppData steps aside while the lit copy is up
  const adA = K.io(t, w(/^App$/, c[4] + 3.42) - 0.1, 0.6) * (1 - K.io(t, c[5] - 0.2, 0.6));
  M.home(t, { alpha: homeK, k: 1, configK: 1, looseK: 1, appdataK: 1 - adA, roomsK: 1 });

  // ---- dim everything behind the cards (calm crossfade from 11's lit set)
  const dimK = K.io(t, -0.4, 0.8);
  g.save(); g.fillStyle = K.rgba(C.page, 0.64 * dimK); g.fillRect(0, 0, K.W || 1920, K.H || 1080); g.restore();

  // ---- lit spots behind the card
  // .git in the shop's hidden row: lit on "It's there", gets the Hidden flag on "flag"
  const gitA = K.io(t, w("It's", c[0] + 4.46) - 0.1, 0.6) * (1 - K.io(t, c[2] - 0.2, 0.6));
  if (gitA > 0) {
    const p = { x: L.exCols[0], y: L.exRows[1] };
    M.item(p.x, p.y, 96, { kind: 'folder', name: '.git', size: 26, ghost: 1, glow: 1, alpha: gitA, t,
      ring: K.io(t, w("It's", c[0] + 4.46) + 0.2, 0.6), tag: K.io(t, w('flag', c[1] + 7.6) - 0.3, 0.6) });
  }
  // the .env drawer for the two key surprises
  const drA = K.io(t, c[2] + 0.4, 0.6) * (1 - K.io(t, c[4] - 0.1, 0.6));
  if (drA > 0) {
    const D = L.drawer;
    K.glow(D.x + D.w / 2, D.y + 10, 220, P.secret, 0.16 * drA);
    M.drawer(D.x, D.y, D.w, D.h, { alpha: drA, open: K.io(t, c[2] + 0.6, 0.7), key: 1, t });
  }
  // AppData in the home room, then its Roaming room
  // ring hugs the folder icon only; the name sits below it and the Hidden tag hangs to the right, both outside
  const AD = { x: M.HOME.appdata.x, y: M.HOME.appdata.y, rx: 66, ry: 50 };
  if (adA > 0) {
    const H = M.HOME.appdata;
    K.layer(adA, () => {
      M.item(H.x, H.y, 76, { name: 'AppData', label: 'none', glow: 1 });
      M.dotName('AppData', H.x, H.y + AD.ry + 40, { size: 30, align: 'center' });
      K.ring(H.x, H.y, AD.rx, AD.ry, K.io(t, w(/^App$/, c[4] + 3.42), 0.6), { color: C.head, w: 4, rot: 0 });
      M.tag(H.x + AD.rx + 22, H.y - 20, { t, side: 1 });
      const rk = K.io(t, w('Roaming', c[4] + 4.28) - 0.1, 0.6);
      const pw = K.measure('Roaming · follows a work login', { font: 'ui', weight: 600, size: 26 }) + 52;
      K.arrow(H.x + AD.rx * 0.7, H.y - AD.ry * 0.75, M.HOME.rooms.x - pw / 2 - 8, M.HOME.rooms.ys[0], { k: rk, color: C.head, w: 2, head: false, bend: 8 });
      K.pill('Roaming · follows a work login', M.HOME.rooms.x, M.HOME.rooms.ys[0], { size: 26, alpha: rk, color: C.strong, stroke: C.head, glow: 0.5 });
    });
  }
  // the leftover: a dim dot folder at the home room's spare spot
  if (goneK > 0) {
    const sp = M.HOME.loose[4];
    K.layer(goneK, () => {
      M.item(sp.x, sp.y, 60, { name: '.gemini', size: 26, color: '#6E5A3E', alpha: 0.8,
        glow: K.io(t, w('tried', c[6] + 4.69) - 0.4, 0.6) });
    });
  }

  // ---- the card: right of the shop floor for 1-2, then slides left for 3-7
  const CW = 980, CY = 200, CH = 690, XR = 880, XL = 120, CWD = 960;   // drawn card sits exactly on the frame (floor card / room card edges); content keeps its 980 grid
  const cx = K.lerp(XR, XL, leftK);
  const cardA = K.io(t, -0.3, 0.5);
  K.card(cx, CY, CWD, CH, { r: 24, fill: C.tile, stroke: C.line2, alpha: cardA });

  // per-card content envelope: in just after its cue, out just before the next one
  const inAt = (i) => c[i] + (i === 2 ? 0.45 : 0.02);
  const env = (i) => {
    const a = K.io(t, inAt(i), 0.45, 'out');
    const b = i < 6 ? 1 - K.io(t, c[i + 1] - 0.32, 0.3) : 1;
    return Math.min(a, b);
  };
  const rise = (i) => (1 - K.io(t, inAt(i), 0.45, 'out')) * 14;
  const eyebrow = (i, x0) => K.eyebrow(`SURPRISE ${i + 1} OF 7`, x0 + 40, CY + 50, { size: 22 });
  const divider = (x0) => K.line(x0 + 40, 745, x0 + CW - 40, 745, { color: C.line2, w: 1.5 });
  const explain = (s, x0, k) => K.text(s, x0 + CW / 2, 818, { font: 'ui', weight: 600, size: 36, color: C.strong, align: 'center', alpha: k });
  // gold (or terracotta) ring around an item and its name, wide enough not to cut the name
  const hl = (x, y, name, k, col) => { if (k <= 0) return; const tw = K.measure(name, { font: 'mono', size: 26, weight: 600 }); K.ring(x, y + 24, Math.max(tw / 2, 50) + 36, 76, k, { color: col || C.head, w: 4, rot: 0 }); };
  const content = (i, fn) => { const a = env(i); if (a <= 0) return; K.layer(a, () => K.at(0, rise(i), 1, 0, () => fn(cx - 10))); };

  // 1 · no .git, git works anyway
  content(0, (x0) => {
    eyebrow(0, x0);
    K.win(x0 + 40, 300, 440, 400, { kind: 'explorer', title: 'my-project', titleSize: 26 });
    M.item(x0 + 150, 430, 76, { kind: 'folder', name: 'src', size: 26 });
    M.item(x0 + 340, 430, 76, { kind: 'file', ext: 'py', name: 'app.py', size: 26 });
    const there = w("It's", c[0] + 4.46);
    M.item(x0 + 150, 595, 70, { kind: 'folder', name: '.git', size: 26, ghost: 1, alpha: K.io(t, there - 0.1, 0.5),
      ring: K.io(t, there + 0.2, 0.6) });
    const tr = K.win(x0 + 510, 300, 430, 400, { kind: 'terminal', title: 'terminal', titleSize: 26 });
    K.term(tr, t, [
      { at: w('git', c[0] + 3.26, 1) - 0.1, cmd: 'git status', cps: 24 },
      { at: w('works', c[0] + 3.46) + 0.35, out: 'On branch main', color: C.head },
    ], { prompt: '$ ', size: 28 });
    divider(x0);
    explain("it's there, just hidden", x0, K.io(t, there, 0.5));
  });

  // 2 · Windows shows .env and .ssh, hides .git
  content(1, (x0) => {
    eyebrow(1, x0);
    K.win(x0 + 40, 300, 900, 300, { kind: 'explorer', title: 'my-project  (Windows)', titleSize: 26 });
    const env1 = w('Windows', c[1] + 0.27) + 0.65, ssh = w('Windows', c[1] + 0.27) + 1.8, gitT = w('while', c[1] + 5.35);
    const xs = [0, 1, 2, 3, 4].map((j) => x0 + 125 + j * 168);
    M.item(xs[0], 440, 70, { kind: 'folder', name: '.claude', size: 26 });
    M.item(xs[1], 440, 70, { kind: 'file', name: '.env', size: 26, ring: K.io(t, env1, 0.6) });
    M.item(xs[2], 440, 70, { kind: 'folder', name: '.vscode', size: 26 });
    M.item(xs[3], 440, 70, { kind: 'file', ext: 'py', name: 'app.py', size: 26 });
    M.item(xs[4], 440, 70, { kind: 'folder', name: '.git', size: 26, ghost: K.io(t, gitT, 0.6), alpha: K.io(t, gitT - 0.1, 0.4),
      tag: K.io(t, gitT + 0.3, 0.6), t });
    // home folder strip
    const hk = K.io(t, ssh - 0.1, 0.45);
    K.layer(hk, () => {
      K.card(x0 + 40, 620, 900, 86, { r: 14, fill: C.code, stroke: C.line2, shadow: false });
      K.text('C:\\Users\\you', x0 + 70, 673, { font: 'mono', size: 26, color: C.soft });
      const nx = x0 + 330;
      const sw = M.dotName('.ssh', nx, 674, { size: 30 });
      M.dotName('.claude', nx + sw + 48, 674, { size: 30 });
      K.ring(nx + sw / 2, 663, sw / 2 + 22, 30, K.io(t, ssh, 0.6), { color: C.head, w: 3, rot: 0 });
    });
    divider(x0);
    explain('the flag, not the dot', x0, K.io(t, w('flag', c[1] + 7.6) - 0.4, 0.5));
  });

  // 3 · .env ignored, still on GitHub
  content(2, (x0) => {
    eyebrow(2, x0);
    const ed = K.win(x0 + 40, 300, 410, 330, { kind: 'code', title: '', titleSize: 26 });
    M.dotName('.gitignore', x0 + 96, 334, { size: 26, color: C.body });
    const addT = w('add', c[2] + 0.27);
    M.dotName('.venv/', ed.x + 30, ed.y + 60, { size: 28 });
    K.text('__pycache__/', ed.x + 30, ed.y + 112, { font: 'mono', size: 28, color: C.strong, weight: 600 });
    const ak = K.io(t, addT, 0.5);
    K.layer(ak, () => {
      g.save(); g.fillStyle = K.rgba(C.head, 0.12); g.fillRect(ed.x + 6, ed.y + 136, ed.w - 12, 44); g.restore();
      K.text('+', ed.x + 30, ed.y + 167, { font: 'mono', size: 28, color: C.head, weight: 700 });
      M.dotName('.env', ed.x + 62, ed.y + 167, { size: 28 });
    });
    const br = K.win(x0 + 480, 300, 460, 400, { kind: 'browser', title: 'your repo, online', titleSize: 26, url: 'github.com/you/project' });
    const rows = [['app.py', 'file'], ['README.md', 'file'], ['.env', 'file']];
    rows.forEach(([n], j) => {
      const y = br.y + 56 + j * 58;
      K.icon('file', br.x + 44, y - 9, 30, { color: C.soft, w: 2 });
      M.dotName(n, br.x + 78, y, { size: 28 });
    });
    const stillT = w('still', c[2] + 3.5);
    const ry = br.y + 56 + 2 * 58 - 10;
    K.ring(br.x + 120, ry, 90, 30, K.io(t, stillT, 0.6), { color: P.secret, w: 3.5, rot: 0 });
    const keyK = K.io(t, w('Replace', c[2] + 6.28) - 0.1, 0.5);
    if (keyK > 0) { K.glow(br.x + 260, ry, 50, P.secret, 0.3 * keyK); K.icon('key', br.x + 260, ry, 44, { color: P.secret, w: 4, alpha: keyK }); }
    divider(x0);
    const k1 = K.io(t, w('already', c[2] + 5.0) - 0.1, 0.5), k2 = K.io(t, w('Replace', c[2] + 6.28) - 0.1, 0.5);
    const s1 = 'already committed', s2 = '  ·  replace the key';
    const f = { font: 'ui', weight: 600, size: 36 };
    const tw = K.measure(s1, f) + K.measure(s2, f), lx = x0 + CW / 2 - tw / 2;
    K.text(s1, lx, 818, { ...f, color: C.strong, alpha: k1 });
    K.text(s2, lx + K.measure(s1, f), 818, { ...f, color: P.secret, alpha: k2 });
  });

  // 4 · push declined: push protection
  content(3, (x0) => {
    eyebrow(3, x0);
    const tr = K.win(x0 + 40, 300, 900, 280, { kind: 'terminal', title: 'terminal', titleSize: 26 });
    K.term(tr, t, [
      { at: w('push', c[3] + 0.17) - 0.05, cmd: 'git push', cps: 20 },
      { at: w('declined', c[3] + 0.72), out: 'push declined: secret detected', color: P.secret },
    ], { prompt: '$ ', size: 28 });
    K.layer(K.io(t, w('contains', c[3] + 1.56), 0.2), () => {
      const fx = tr.x + 28 + K.text('  found in ', tr.x + 28, tr.y + 28 + 28 + 84, { font: 'mono', size: 28, color: C.soft });
      M.dotName('.env', fx, tr.y + 28 + 28 + 84, { size: 28, weight: 400, color: C.soft });
    });
    const nk = K.io(t, w('protection', c[3] + 3.7) - 0.3, 0.6);
    K.layer(nk, () => {
      // a little gold net with the key caught in it
      const nx = x0 + 300, ny = 662, nw = 150, nh = 96;
      g.save(); g.strokeStyle = K.rgba(C.head, 0.75); g.lineWidth = 2;
      K.rr(nx - nw / 2, ny - nh / 2, nw, nh, 18); g.stroke();
      g.beginPath();
      for (let i = 1; i < 5; i++) { const xx = nx - nw / 2 + (nw * i) / 5; g.moveTo(xx, ny - nh / 2 + 4); g.lineTo(xx, ny + nh / 2 - 4); }
      for (let i = 1; i < 3; i++) { const yy = ny - nh / 2 + (nh * i) / 3; g.moveTo(nx - nw / 2 + 4, yy); g.lineTo(nx + nw / 2 - 4, yy); }
      g.globalAlpha *= 0.45; g.stroke(); g.restore();
      K.glow(nx, ny, 60, P.secret, 0.3);
      K.icon('key', nx, ny, 52, { color: P.secret, w: 4.5 });
      K.pill('push protection', x0 + 610, ny, { size: 30, color: C.head, stroke: C.head });
    });
    divider(x0);
    explain('the net caught a key', x0, nk);
  });

  // 5 · a path with AppData\Roaming in it
  content(4, (x0) => {
    eyebrow(4, x0);
    const r = K.win(x0 + 40, 300, 900, 330, { kind: 'browser', title: 'setup guide: a desktop AI app', titleSize: 26 });
    K.text("Open the app's config folder:", r.x + 34, r.y + 66, { font: 'ui', weight: 600, size: 30, color: C.body });
    const appT = w(/^App$/, c[4] + 3.42), roamT = w('Roaming', c[4] + 4.28);
    K.card(r.x + 30, r.y + 100, r.w - 60, 84, { r: 12, fill: C.page, stroke: C.line2, shadow: false });
    const f = { font: 'mono', size: 30, weight: 600 };
    const parts = [['C:\\Users\\you\\', 0], ['AppData', K.io(t, appT, 0.5)], ['\\', 0], ['Roaming', K.io(t, roamT, 0.5)], ['\\Claude\\', 0]];
    let px = r.x + 60;
    const py = r.y + 152;
    parts.forEach(([s, k]) => { K.text(s, px, py, { ...f, color: K.mixColor(C.strong, C.head, k) }); if (k > 0) K.mark(px, py + 12, K.measure(s, f), k); px += K.measure(s, f); });
    // a thread from the path to the home room's AppData, behind the card's right edge
    const hk = K.io(t, w('home', c[4] + 6.35) - 0.2, 0.6);
    divider(x0);
    K.layer(hk, () => {
      const f2 = { font: 'ui', weight: 600, size: 36 };
      const s = 'your home back room', tw = K.measure(s, f2), lx = x0 + CW / 2 - (tw + 64) / 2;
      K.icon('house', lx + 22, 806, 40, { color: C.head, w: 3 });
      K.text(s, lx + 64, 818, { ...f2, color: C.strong });
    });
    { // end the arrow on the ring's edge, toward the icon centre
      const sx = x0 + CW - 34, sy = 680, dx = AD.x - sx, dy = AD.y - sy;
      const q = 1 / Math.sqrt((dx / (AD.rx + 8)) ** 2 + (dy / (AD.ry + 8)) ** 2);
      K.arrow(sx, sy, AD.x - dx * q, AD.y - dy * q, { k: hk, color: C.head, w: 3, bend: -0.12 });
    }
  });

  // 6 · .DS_Store on a Mac
  content(5, (x0) => {
    eyebrow(5, x0);
    K.win(x0 + 40, 300, 900, 290, { kind: 'explorer', title: 'my-project  (Finder)', titleSize: 26 });
    const dsT = w('Store', c[5] + 2.3) - 0.8;
    const xs = [0, 1, 2, 3].map((j) => x0 + 160 + j * 210);
    M.item(xs[0], 440, 70, { kind: 'folder', name: 'src', size: 26 });
    M.item(xs[1], 440, 70, { kind: 'file', ext: 'py', name: 'app.py', size: 26 });
    M.item(xs[2], 440, 70, { kind: 'file', name: 'README.md', size: 26 });
    M.item(xs[3], 440, 70, { kind: 'file', name: '.DS_Store', size: 26, ghost: 1, alpha: K.io(t, dsT - 0.1, 0.5) });
    hl(xs[3], 440, '.DS_Store', K.io(t, dsT + 0.3, 0.6));
    const cm = K.io(t, w('commits', c[5] + 3.84) - 0.1, 0.5);
    K.layer(cm, () => {
      K.card(x0 + 40, 615, 900, 86, { r: 14, fill: C.code, stroke: C.line2, shadow: false });
      K.text('in a commit:', x0 + 70, 668, { font: 'ui', weight: 600, size: 28, color: C.soft });
      K.text('+', x0 + 270, 669, { font: 'mono', size: 30, weight: 700, color: C.head });
      M.dotName('.DS_Store', x0 + 302, 669, { size: 30 });
    });
    divider(x0);
    explain('Finder leaves these behind', x0, K.io(t, w('Finder', c[5] + 4.88) - 0.1, 0.5));
  });

  // 7 · leftover dot folders
  content(6, (x0) => {
    eyebrow(6, x0);
    K.win(x0 + 40, 300, 900, 330, { kind: 'explorer', title: '~  (your home folder)', titleSize: 26 });
    const xs = [0, 1, 2, 3].map((j) => x0 + 160 + j * 210);
    M.item(xs[0], 450, 70, { kind: 'folder', name: '.ssh', size: 26 });
    M.item(xs[1], 450, 70, { kind: 'folder', name: '.claude', size: 26 });
    M.item(xs[2], 450, 70, { kind: 'folder', name: '.config', size: 26 });
    const gk = K.io(t, w('tried', c[6] + 4.69) - 0.4, 0.6);
    M.item(xs[3], 450, 70, { kind: 'folder', name: '.gemini', size: 26, color: '#6E5A3E', alpha: 0.7 });
    hl(xs[3], 450, '.gemini', gk);
    divider(x0);
    explain('left behind by a tool you tried once', x0, K.io(t, w('stopped', c[6] + 2.1) - 0.1, 0.5));
  });
});
