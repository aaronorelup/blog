// The ledger, made to open. The homepage's book is two closed boxes; this one has a cover and four leaves that turn
// about the spine, and every page is a real element of the page (text you can select, links you can click), laid
// onto its leaf in the scene's own perspective.
//
// The book lies in the desk's own frame: x along the desk (to the reader's right), z toward the reader, y up. The
// spine runs along z at x = 0 of the book. A turner (the cover, then each leaf) lies flat to the right at angle 0
// and flat to the left at angle PI. Each turner has two faces: its front (seen while it lies right) and its back
// (seen once it has turned). Spread k is the back of turner k-1 beside the front of turner k:
//   the cover's inside | leaf 1's front   = post 1          (left page | right page)
//   leaf 1's back      | leaf 2's front   = post 2   ...    leaf 4's back | the last page = "there is more"
// On an upright phone the same book is seen from straight above, turned a quarter: the spine runs across the
// screen, the left page stands over the right one, and a leaf turns from the bottom up. Only the pages' own
// measures and the way their words are set change (layout()).
//
// A leaf bends as it turns. A page's own element cannot bend, so while a leaf is in the air it is shown as STRIPS:
// narrow slices of the same page (copies, hidden from readers of the page's words), each on its own segment of an
// arch, shaded by how it stands to the lantern. At rest the page's own element lies there again, flat and whole.
// The cover is a board and stays stiff.
//
// pose(q) puts every turner where the chapter's progress q says: nothing is remembered between calls.
import {
  BoxGeometry, CanvasTexture, CylinderGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Vector3,
} from '../vendor/three.module.min.js';

const PI = Math.PI;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// The chapter's time, in shares of its progress q: the camera arrives, the cover opens, then each spread is held
// still for a while (HOLD) before its leaf turns (TURN).
const ARRIVE = 0.13, OPEN = 0.085, HOLD = 0.10, TURN = 0.07;
export const TIME = { arrive: ARRIVE, open: [ARRIVE, ARRIVE + OPEN], hold: HOLD, turn: TURN };
const LEAVES = 4;                                   // the posts; with the cover, five turners
const SEGS = 7;                                     // the strips a turning leaf is shown as
const BEND = 1.15;                                  // how far a leaf bends from its spine to its edge at the top of its turn (radians)
const win = (i) => (i === 0 ? [ARRIVE, ARRIVE + OPEN] : [ARRIVE + OPEN + HOLD + (i - 1) * (HOLD + TURN), ARRIVE + OPEN + HOLD + (i - 1) * (HOLD + TURN) + TURN]);
// where to stand to read spread s (1 to 5): the middle of its hold. 0: the shut book.
export const stopOf = (s) => (s <= 0 ? 0 : ARRIVE + OPEN + HOLD / 2 + (s - 1) * (HOLD + TURN));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function img(cls, src, alt, w, h) {
  const i = el('img', cls);
  i.src = src; i.alt = alt; i.width = w; i.height = h; i.decoding = 'async'; i.draggable = false;
  return i;
}

// ---------------------------------------------------------------- the pages
// A left page: the post's picture, its number, its date, its title, and its icon.
function leftPage(p, n, of) {
  const f = el('section', 'lb-face lb-page lb-back');
  const b = el('div', 'lb-in lb-left');
  const fig = el('div', 'lb-pic');
  fig.append(img('', p.image, p.alt, 640, 360));
  const meta = el('p', 'lb-meta');
  const id = el('span', 'lb-id', p.id);
  const when = el('time', 'lb-date', day(p.date)); when.dateTime = p.date;
  meta.append(id, when);
  const h = el('h3', 'lb-title', p.title);
  const foot = el('p', 'lb-foot');
  if (p.icon) foot.append(img('lb-icon', p.icon, '', 256, 256));
  foot.append(el('span', 'lb-topic', cap(p.topic)), el('span', 'lb-folio', `${n} / ${of}`));
  b.append(fig, meta, h, foot);
  f.append(b);
  return f;
}
// A right page: what the post found, as its own card has it (verdict, takeaway, points), and the way in.
function rightPage(p) {
  const f = el('section', 'lb-face lb-page lb-front');
  const b = el('div', 'lb-in lb-right');
  if (p.verdict) b.append(el('p', 'lb-stamp', p.verdict));
  b.append(el('p', 'lb-takeaway', p.takeaway));
  if (!p.points.length) b.classList.add('lb-solo');      // no points on its card: the takeaway carries the page
  if (p.points.length) {
    const ul = el('ul', 'lb-points');
    p.points.forEach(t => ul.append(el('li', '', t)));
    b.append(ul);
  }
  const go = el('p', 'lb-go');
  const a = el('a', 'lb-btn');
  a.href = `/ledger/${p.slug}/`;
  a.append('Read the full post', el('span', 'lb-vh', `: ${p.title}`), el('span', 'lb-arrow', ' →'));
  a.lastChild.setAttribute('aria-hidden', 'true');
  go.append(a);
  b.append(go);
  f.append(b);
  return f;
}
// The last spread: there is more. (Its few words are a plain stand-in, the owner's to rewrite; the sentence about
// the ledger is his own, from the homepage's card.)
function moreLeft(more) {
  const f = el('section', 'lb-face lb-page lb-back');
  const b = el('div', 'lb-in lb-left lb-more');
  const wall = el('div', 'lb-wall');
  wall.setAttribute('aria-hidden', 'true');
  more.icons.forEach(src => wall.append(img('', src, '', 96, 96)));
  b.append(wall, el('h3', 'lb-title', more.title));
  f.append(b);
  return f;
}
function moreRight(more) {
  const f = el('section', 'lb-face lb-page lb-front');
  const b = el('div', 'lb-in lb-right lb-more lb-solo');
  b.append(el('p', 'lb-stamp', more.stamp), el('p', 'lb-takeaway', more.line));
  const go = el('p', 'lb-go');
  const a = el('a', 'lb-btn');
  a.href = more.href;
  a.append(more.button, el('span', 'lb-arrow', ' →'));
  a.lastChild.setAttribute('aria-hidden', 'true');
  go.append(a);
  b.append(go);
  f.append(b);
  return f;
}
function coverOut(name) {
  const f = el('div', 'lb-face lb-board lb-front lb-cover');
  const label = el('p', 'lb-label');
  label.append(el('span', '', name));
  f.append(label);
  return f;
}
function coverIn(page) {
  const f = el('section', 'lb-face lb-board lb-back');
  page.classList.remove('lb-face', 'lb-back');
  page.classList.add('lb-inset');
  f.append(page);
  return f;
}
// what every face carries over its words: the shadow a turning leaf lays on it, and its own shade while it turns
function overlays(f) {
  const shade = el('i', 'lb-shade'), dim = el('i', 'lb-dim');
  f.append(shade, dim);
  return { shade, dim };
}

// ---------------------------------------------------------------- the book
export function buildBook({ posts, more, part, onSeek }) {
  const ink = '#15131c';
  const pink = new MeshBasicMaterial({ color: 0xC97B90 }), edge = new MeshBasicMaterial({ color: 0xD9C7A6 });
  const wood = new MeshBasicMaterial({ color: 0x6E4B36 }), clay = new MeshBasicMaterial({ color: 0x4A3833 });

  // What is drawn with the room (it never passes in front of a page): the back board, the block of pages on it,
  // the brush and the ink pot.
  const gl = new Group();
  const unit = new BoxGeometry(1, 1, 1);
  const board = part(unit, pink), block = part(unit, edge);
  const brush = new Group();
  brush.add(part(new CylinderGeometry(0.02, 0.026, 0.46, 6), wood, [0, 0, 0], [PI / 2, 0, 0]));
  brush.add(part(new CylinderGeometry(0.004, 0.024, 0.09, 6), clay, [0, 0, -0.27], [PI / 2, 0, 0]));
  const pot = part(new CylinderGeometry(0.13, 0.15, 0.12, 12), clay);
  const well = part(new CylinderGeometry(0.095, 0.095, 0.005, 12), new MeshBasicMaterial({ color: 0x0b0a10 }), [0, 0.06, 0], null, 0);
  pot.add(well);
  gl.add(board, block, brush, pot);

  // Soft shadows lying on the desk under the book and the things beside it: drawn shade, a blurred dark shape
  // each, away from the lantern. The left-hand one comes as the cover opens onto the desk.
  const soft = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    // (the dark shape is drawn off the canvas and only its blurred shadow lands on it, clear of the edges)
    g.shadowColor = 'rgba(14,6,4,1)'; g.shadowBlur = 12; g.shadowOffsetX = 300; g.fillStyle = '#000';
    g.fillRect(26 - 300, 26, 76, 76);
    return new CanvasTexture(c);
  })();
  const shadow = (o) => {
    const m = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: soft, transparent: true, opacity: o, depthWrite: false }));
    m.rotation.x = -PI / 2; m.userData.o = o; m.renderOrder = 2;
    gl.add(m);
    return m;
  };
  const shR = shadow(0.8), shL = shadow(0.8), shPot = shadow(0.6), shBrush = shadow(0.5);

  // What is laid over the room: the turners and their faces.
  const css = new Group();
  const n = posts.length;
  const pagesL = posts.map((p, i) => leftPage(p, i + 1, n)), pagesR = posts.map(p => rightPage(p));
  pagesL.push(moreLeft(more)); pagesR.push(moreRight(more));
  const turners = [];
  const faces = [];
  const face = (elm, turner, side, isBoard, spread) => {
    const o = new Object3D();                        // where the face is; scene.js lays the element there
    const f = { el: elm, obj: o, turner, side, board: !!isBoard, spread, ...overlays(elm), w: 1, h: 1, vis: -1, z: -1, tf: '', sh: '', shO: -1, dm: -1 };
    faces.push(f);
    return f;
  };
  for (let i = 0; i <= LEAVES; i++) {
    const hinge = new Group();
    const front = i === 0 ? face(coverOut(more.cover), 0, 'front', true, 0) : face(pagesR[i - 1], i, 'front', false, i);
    const back = i === 0 ? face(coverIn(pagesL[0]), 0, 'back', true, 1) : face(pagesL[i], i, 'back', false, i + 1);
    hinge.add(front.obj, back.obj);
    css.add(hinge);
    turners.push({ hinge, front, back, a: 0 });
  }
  const inset = pagesL[0], inside = turners[0].back;

  // the strips of each leaf (not the cover): N segments in a chain from the spine out, each with a slice of the
  // leaf's front and of its back
  const strips = [];
  const slice = (f, k) => {
    const box = el('div', 'lb-strip ' + (f.side === 'front' ? 'lb-front' : 'lb-back'));
    box.setAttribute('aria-hidden', 'true'); box.inert = true;
    const copy = f.el.cloneNode(true);
    copy.removeAttribute('style'); copy.classList.add('lb-copy');
    copy.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
    const dim = el('i', 'lb-dim');
    box.append(copy, dim);
    const sp = { el: box, copy, dim, obj: new Object3D(), side: f.side, k, w: 1, h: 1, tf: '', dm: -1, z: -1, on: false, facing: null };
    strips.push(sp);
    return sp;
  };
  for (let i = 1; i <= LEAVES; i++) {
    const t = turners[i];
    t.curl = new Group(); t.segs = []; t.fronts = []; t.backs = [];
    let parent = t.curl;
    for (let k = 0; k < SEGS; k++) {
      const seg = new Group();
      const a = slice(t.front, k), b = slice(t.back, k);
      seg.add(a.obj, b.obj);
      parent.add(seg); parent = seg;
      t.segs.push(seg); t.fronts.push(a); t.backs.push(b);
    }
    css.add(t.curl);
  }
  const base = face(pagesR[LEAVES], LEAVES + 1, 'front', false, LEAVES + 1);
  css.add(base.obj);

  // a link that takes the focus while its page is turned away asks the page to go there (Tab walks the book)
  let spreadNow = 0;
  faces.forEach((f) => f.el.addEventListener('focusin', () => { if (f.spread !== spreadNow && onSeek) onSeek(stopOf(f.spread)); }));

  // ---------------------------------------------------------------- measures
  const M = 0.03;                      // how far the boards stand out past the pages
  const TB = 0.02, TP = 0.03;          // the back board's and the block's thickness
  const D = 0.004, E = 0.0012;         // a leaf's share of the stack; half a leaf
  let L = null;
  const mx = new Matrix4(), vx = new Vector3(), vy = new Vector3(), vz = new Vector3();
  const orient = (o, x, y, z) => { mx.makeBasis(vx.set(...x), vy.set(...y), vz.set(...z)); o.quaternion.setFromRotationMatrix(mx); };

  // tall: the phone's book. PW: a page across the turn (from the spine out); PH: a page along the spine.
  // sx: where the spine lies along the desk. px: how many screen pixels a metre of the page takes at rest.
  function layout({ tall, PW, PH, sx, top, px, ink }) {
    L = { tall, PW, PH, sx, top, px };
    gl.position.set(sx, top, 0); css.position.set(sx, top, 0);
    // (the back board is drawn with the room and its ink line is added outside its shape; it is made that much
    // smaller, so its edge meets the open cover's, which is an element of the page with its line inside)
    board.scale.set(PW + M - ink, TB, PH + 2 * M - 2 * ink); board.position.set((PW + M - ink) / 2, TB / 2, 0);
    block.scale.set(PW - ink, TP, PH - 2 * ink); block.position.set((PW - ink) / 2, TB + TP / 2, 0);
    if (tall) { brush.position.set(PW + M + 0.07, 0.02, 0.12); brush.rotation.y = -0.1; pot.position.set(PW + M + 0.088, 0.03, -0.27); }
    else { brush.position.set(PW + 0.13, 0.02, 0.1); brush.rotation.y = 0.16; pot.position.set(PW + 0.235, 0.04, -0.2); }
    brush.scale.setScalar(tall ? 0.6 : 0.66); pot.scale.setScalar(tall ? 0.42 : 0.62);
    const bw = (PW + M) * 1.76, bh = (PH + 2 * M) * 1.76, ox = tall ? 0.014 : 0.035, oz = tall ? -0.014 : 0.045;
    shR.scale.set(bw, bh, 1); shR.position.set((PW + M) / 2 + ox, 0.003, oz);
    shL.scale.set(bw, bh, 1); shL.position.set(-(PW + M) / 2 + ox, 0.003, oz);
    const ps = pot.scale.x;
    shPot.scale.set(0.56 * ps, 0.56 * ps, 1); shPot.position.set(pot.position.x + 0.035 * ps, 0.004, pot.position.z + 0.03 * ps);
    shBrush.scale.set(0.13 * ps, 0.95 * ps, 1);
    shBrush.position.set(brush.position.x + 0.014, 0.004, brush.position.z + 0.01 - 0.04 * ps * Math.cos(brush.rotation.y)); shBrush.rotation.z = brush.rotation.y;
    for (const f of faces) {
      const w = f.board ? PW + M : PW, h = f.board ? PH + 2 * M : PH;       // the face's reach from the spine, and along it
      const ww = tall ? h : w, wh = tall ? w : h;                            // the element's own width and height
      const pw = Math.max(1, Math.round(ww * px)), ph = Math.max(1, Math.round(wh * px));
      f.el.style.width = pw + 'px'; f.el.style.height = ph + 'px'; f.w = pw; f.h = ph;
      f.el.style.fontSize = ((tall ? PH : PW) * px / (tall ? 27.4 : 30)).toFixed(2) + 'px';
      f.obj.scale.setScalar(ww / pw);
      const up = f.side === 'front' ? 1 : -1;
      if (!tall) orient(f.obj, [up, 0, 0], [0, 0, -1], [0, up, 0]);
      else orient(f.obj, [0, 0, -1], [-up, 0, 0], [0, up, 0]);
      f.obj.position.set(w / 2, f === base ? TB + TP + 0.001 : up * E, 0);
    }
    // the strips: slice k of a face is the k-th from the spine; each runs three pixels under the next so no seam shows
    const fw = tall ? Math.round(PH * px) : Math.round(PW * px), fh = tall ? Math.round(PW * px) : Math.round(PH * px);
    const run = tall ? fh : fw, cut = run / SEGS, sc = (tall ? PH : PW) / (tall ? Math.round(PH * px) : Math.round(PW * px));
    const fs = ((tall ? PH : PW) * px / (tall ? 27.4 : 30)).toFixed(2) + 'px';
    for (const sp of strips) {
      const from = Math.round(sp.k * cut), to = Math.min(run, Math.round((sp.k + 1) * cut) + 3), len = to - from;
      const front = sp.side === 'front';
      // where the slice starts on the page: a front page runs from the spine out, a back page from its edge in
      const at = front ? from : run - to;
      sp.w = tall ? fw : len; sp.h = tall ? len : fh;
      sp.el.style.width = sp.w + 'px'; sp.el.style.height = sp.h + 'px';
      sp.copy.style.width = fw + 'px'; sp.copy.style.height = fh + 'px'; sp.copy.style.fontSize = fs;
      sp.copy.style.left = (tall ? 0 : -at) + 'px'; sp.copy.style.top = (tall ? -at : 0) + 'px';
      sp.obj.scale.setScalar(sc);
      const up = front ? 1 : -1;
      if (!tall) orient(sp.obj, [up, 0, 0], [0, 0, -1], [0, up, 0]);
      else orient(sp.obj, [0, 0, -1], [-up, 0, 0], [0, up, 0]);
      sp.obj.position.set(len * sc / 2, up * E, 0);
      sp.tf = ''; sp.dm = -1; sp.z = -1;
    }
    for (let i = 1; i <= LEAVES; i++) turners[i].segs.forEach((seg, k) => seg.position.set(k === 0 ? 0 : (Math.round(k * cut) - Math.round((k - 1) * cut)) * sc, 0, 0));
    // the page pasted inside the cover lies exactly where the leaves will lie on it
    const m = Math.round(M * px) + 'px';
    inset.style.inset = tall ? `${m} ${m} 0 ${m}` : `${m} 0 ${m} ${m}`;
    for (const f of faces) { f.vis = -1; f.z = -1; f.tf = ''; f.sh = ''; f.shO = -1; f.dm = -1; }
  }

  // ---------------------------------------------------------------- one frame
  // The faces are stacked by hand, not by the browser's own sorting of planes in space (which put a leaf that
  // had passed upright under the page it was coming down on): a leaf that is turning lies over the pages at rest.
  const set = (f, vis, z) => {
    if (f.z !== z) { f.z = z; f.el.style.zIndex = z; }
    if (f.vis === vis) return;
    f.vis = vis;
    f.el.style.opacity = vis <= 0 ? '0' : vis >= 1 ? '' : vis.toFixed(3);
    f.el.style.pointerEvents = vis > 0.5 ? 'auto' : 'none';
  };
  const shadeOf = (f, reach, o) => {
    if (!f) return;
    const k = clamp(reach, 0.001, 1.4), t = L.tall ? `scale(1,${k.toFixed(4)})` : `scale(${k.toFixed(4)},1)`;
    const oo = Math.round(clamp(o) * 200) / 200;
    if (f.shO !== oo) { f.shO = oo; f.shade.style.opacity = oo; }
    if (oo > 0 && f.sh !== t) { f.sh = t; f.shade.style.transform = t; }
  };
  const dimOf = (f, o) => { const oo = Math.round(clamp(o) * 200) / 200; if (f.dm !== oo) { f.dm = oo; f.dim.style.opacity = oo; } };

  const want = new Map();
  let changed = true;
  // q: the chapter's progress. rm: no turning. Both pages of a spread change at one place (the middle of what
  // would be the turn), so no place a reader can stop at shows one post's title beside another's words; the
  // change itself is a short dissolve (a transition on the pages, the one thing here that takes time of its own).
  let rmSpread = -1;
  function pose(q, rm) {
    want.clear();
    let j = turners.length;
    for (let i = 0; i < turners.length; i++) {
      const t = turners[i], [t0, t1] = win(i), u = clamp((q - t0) / (t1 - t0));
      if (rm) t.a = u >= 0.5 ? PI : 0;
      else t.a = PI * ss(0, 1, u);
      if (t.a < PI && j === turners.length) j = i;
      const s = t.a / PI;
      // a leaf lies on the right-hand stack at 0 and on the left-hand one at PI: its hinge sinks from one to the other
      const yR = TB + TP + (LEAVES + 1 - i) * D + (i === 0 ? 0.003 : 0), yL = 0.006 + i * D;
      t.hinge.position.y = yR + (yL - yR) * s;
      t.hinge.rotation.z = t.a;
    }
    const under = (i) => (i > LEAVES ? base : turners[i].front);
    if (rm) {
      if (j >= 1) want.set(turners[j - 1].back, 1);
      want.set(under(j), 1);
    } else {
      if (j >= 1) want.set(turners[j - 1].back, 1);
      if (j <= LEAVES) {
        const t = turners[j];
        want.set(t.a < PI / 2 ? t.front : t.back, 1);
        if (t.a > 0) want.set(under(j + 1), 1);
      } else want.set(base, 1);
    }
    // a leaf in the air is shown as its strips, bent round an arch (its own flat element is hidden meanwhile)
    const air = !rm && j >= 1 && j <= LEAVES && turners[j].a > 0 ? turners[j] : null;
    for (let i = 1; i <= LEAVES; i++) {
      const t = turners[i], on = t === air;
      if (on) {
        const bend = BEND * Math.sin(t.a), a0 = t.a - bend / 2, step = bend / (SEGS - 1);
        t.curl.position.y = t.hinge.position.y;
        for (let k = 0; k < SEGS; k++) {
          t.segs[k].rotation.z = k === 0 ? a0 : step;
          const ak = a0 + step * k, lit = 0.6 * Math.sin(ak) + 0.8 * Math.cos(ak);      // how the strip's front stands to the lantern
          const f = t.fronts[k], b = t.backs[k];
          const df = Math.round(clamp(0.5 * (0.8 - lit) / 1.6 + 0.03 * Math.sin(t.a)) * 200) / 200;
          const db = Math.round(clamp(0.6 * (0.8 + lit) / 1.6) * 200) / 200;
          if (f.dm !== df) { f.dm = df; f.dim.style.opacity = df; }
          if (b.dm !== db) { b.dm = db; b.dim.style.opacity = db; }
          if (f.z !== 10 + k) { f.z = b.z = 10 + k; f.el.style.zIndex = b.el.style.zIndex = 10 + k; }
        }
        want.set(t.front, 0); want.set(t.back, 0);
      }
      if (t.on !== on) { t.on = on; [...t.fronts, ...t.backs].forEach(sp => { sp.on = on; if (!on && sp.facing !== null) { sp.facing = null; sp.el.style.visibility = ''; } }); }
    }
    // the open cover's board stays under the left-hand pages, its pink edge round them
    if (turners[0].a >= PI && !want.has(inside)) want.set(inside, 1);
    const turning = !rm && j <= LEAVES && turners[j].a > 0 ? turners[j] : null;
    if (rm) {
      // The dissolve. On each side the page that lies on top is the one that fades (in or out); the page under it
      // is simply there, or goes once the fade is over. Which is on top depends on the way the book is going.
      const dir = rmSpread < 0 ? 0 : Math.sign(j - rmSpread);
      rmSpread = j;
      for (const f of faces) {
        const now = want.get(f) || 0, was = f.vis > 0 ? 1 : 0;
        if (f.vis < 0 || now === was) continue;
        const right = f.side === 'front', showing = now > 0;
        const fades = dir !== 0 && (dir > 0 ? right !== showing : right === showing);
        f.el.style.transition = dir === 0 ? 'none' : fades ? 'opacity 0.26s ease' : showing ? 'none' : 'opacity 0s linear 0.26s';
      }
    }
    for (const f of faces) set(f, want.get(f) || 0, turning && (f === turning.front || f === turning.back) ? 3 : f === inside && turners[0].a >= PI ? 1 : 2);

    // the light: a turning leaf darkens as it stands up, and lays a soft shadow on the page it leaves and the
    // page it comes down on
    const t = turning;
    for (const f of faces) {
      let reach = 0, o = 0, dm = 0;
      if (t) {
        const a = t.a, c = Math.cos(a), s = Math.sin(a);
        if (f === t.front) dm = 0.34 * s;
        else if (f === t.back) dm = 0.1 + 0.3 * s;
        else if (f === under(j + 1)) { reach = Math.max(c, 0) + 0.42 * s; o = 0.62 * ss(0, 0.2, a) * (1 - 0.45 * ss(1.2, PI, a)) * ss(PI, PI - 0.5, a); }
        else if (j >= 1 && f === turners[j - 1].back) { reach = Math.max(-c, 0) + 0.1; o = 0.5 * ss(PI * 0.42, PI * 0.42 + 0.3, a) * ss(PI, PI - 0.3, a); }
      }
      shadeOf(f, reach, o); dimOf(f, dm);
    }
    // the open cover's shadow on the desk comes as it lands
    const so = Math.round(shL.userData.o * ss(PI * 0.55, PI, turners[0].a) * 24) / 24;      // (in steps: each one redraws the room)
    if (shL.material.opacity !== so) { shL.material.opacity = so; shL.visible = so > 0.004; changed = true; }
    // which spread is open (for the keyboard): the one a reader would say is showing
    spreadNow = j === 0 ? (turners[0].a > PI / 2 ? 1 : 0) : j > LEAVES ? LEAVES + 1 : j + (turners[j].a > PI / 2 ? 1 : 0);
    const c = changed; changed = false;
    return c;                                       // true: something drawn with the room has changed
  }

  return { gl, css, layout, pose, faces, strips, M, ink, measures: () => L };
}
