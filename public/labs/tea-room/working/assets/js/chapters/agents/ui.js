// Everything that is read: the chapter's name, the label under each scene, the four post cards, the names under the
// ten screens, the key to the paper animals and the sound switch. Plain page elements laid over the drawing, each
// put where the drawing says. Nothing here moves by itself: the scene sets every place and every fold.
import { POSTS, LEAD, LABELS, WALL, WALL_WORDS } from './data.js';

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function buildUI(host) {
  const ui = el('div', 'at-ui');

  const lead = el('header', 'at-lead');
  lead.append(el('p', 'at-kicker', LEAD.kicker));
  const word = el('h2', 'at-word'); LEAD.word.forEach((w) => word.append(el('span', '', w)));
  lead.append(word, el('p', 'at-say', LEAD.say));
  ui.append(lead);

  const labels = {};
  Object.entries(LABELS).forEach(([k, v]) => {
    const d = el('div', 'at-label at-label-' + k); d.append(el('b', '', v.name), el('span', '', v.line));
    labels[k] = d; ui.append(d);
  });

  const posts = {};
  Object.entries(POSTS).forEach(([k, p]) => {
    const a = el('a', 'at-post'); a.href = '/ledger/' + p.slug + '/';
    const pic = el('span', 'at-post-pic'); pic.dataset.id = p.id;
    const leaf = el('span', 'at-post-fold');
    const img = el('img'); img.src = p.img; img.alt = ''; img.width = 640; img.height = 360; img.decoding = 'async'; img.loading = 'lazy';
    pic.append(img);
    const cap = el('span', 'at-post-cap');
    const label = el('span', 'at-post-label'); label.append(el('i', '', p.id), document.createTextNode(p.verdict));
    cap.append(label, el('strong', 'at-post-title', p.title), el('span', 'at-post-line', p.line), el('span', 'at-post-go', 'Read the post'));
    leaf.append(pic, cap); a.append(leaf);
    posts[k] = { a, pic, cap }; ui.append(a);
  });

  // the names under the ten screens: each is a button, so a screen can be chosen without a mouse
  const tags = WALL.map((w, i) => {
    const b = el('button', 'at-tag'); b.type = 'button'; b.dataset.i = i;
    b.append(el('b', '', w.model + ' ' + w.effort), el('span', '', w.title));
    b.setAttribute('aria-pressed', 'false');
    ui.append(b); return b;
  });

  const key = el('div', 'at-key');
  WALL_WORDS.key.forEach((s, i) => { const p = el('p', i === 0 ? 'cream' : i === 1 ? 'blue' : 'folds', s); key.append(p); });
  ui.append(key);

  const sound = el('div', 'at-sound');
  const say = el('p', 'at-sound-say', WALL_WORDS.soundSay);
  const sw = el('div', 'at-switch'); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Sound');
  const off = el('button', '', WALL_WORDS.soundOff), on = el('button', '', WALL_WORDS.soundOn);
  off.type = on.type = 'button'; off.setAttribute('aria-pressed', 'true'); on.setAttribute('aria-pressed', 'false');
  sw.append(off, on); sound.append(say, sw); ui.append(sound);

  const now = el('p', 'at-now'); now.setAttribute('aria-live', 'polite'); ui.append(now);

  Array.prototype.forEach.call(ui.children, (e) => { e._visibility = 'hidden'; e.style.visibility = 'hidden'; });
  host.append(ui);

  // set one style only when it changes, so a still page writes nothing
  const put = (e, k, v) => { if (e['_' + k] !== v) { e['_' + k] = v; e.style[k] = v; } };
  const dpr = () => window.devicePixelRatio || 1;
  const snap = (x) => Math.round(x * dpr()) / dpr();
  function place(e, x, y, opacity, scale) {
    const shown = opacity > 0.01;
    put(e, 'visibility', shown ? '' : 'hidden');      // ('' and never 'visible': the page hides the whole layer by visibility)
    if (!shown) return;
    put(e, 'opacity', opacity > 0.995 ? '1' : opacity.toFixed(3));
    put(e, 'transform', 'translate3d(' + snap(x) + 'px,' + snap(y) + 'px,0)' + (scale != null && scale !== 1 ? ' scale(' + scale.toFixed(3) + ')' : ''));
  }
  // a post card unfolds in two folds: the words rise off the glass, then the picture opens above them
  function fold(k, u) {
    const p = posts[k], e1 = Math.min(1, u * 2), e2 = Math.max(0, u * 2 - 1);
    const s1 = e1 * e1 * (3 - 2 * e1), s2 = e2 * e2 * (3 - 2 * e2);
    if (p.a._e1 !== s1) { p.a._e1 = s1; p.a.style.setProperty('--e1', s1.toFixed(3)); }
    if (p.a._e2 !== s2) { p.a._e2 = s2; p.a.style.setProperty('--e2', s2.toFixed(3)); }
    const back = s2 < 0.5 ? '1' : '0';
    if (p.pic.dataset.back !== back) p.pic.dataset.back = back;
    put(p.a, 'pointerEvents', u > 0.9 ? 'auto' : 'none');
  }
  // an element's size, measured once and kept until the window or the words change
  const size = (e) => e._box || (e._box = { w: e.offsetWidth, h: e.offsetHeight });
  const forget = () => { ui.querySelectorAll('*').forEach((e) => { e._box = null; }); };
  return { ui, lead, labels, posts, tags, key, sound, soundSay: say, off, on, now, place, fold, put, size, forget };
}
