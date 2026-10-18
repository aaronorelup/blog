// "Try it: the Sieve". The four questions stacked as gates, each with this range's count, and a
// row of visitors to drop through them. A dropped visitor's request card falls gate by gate,
// waits 350 ms at each while a stamp says "no" or "yes", and on a yes swings out along an arc
// into that question's bin; four noes carry it to "Probably people". The whole drop is under
// 2.4 s, and the result is read out when it lands.
//
// On a wide screen the card itself falls down a chute on the left. On a phone there's no room
// beside the questions, so the card sits above them and a small ticket (the card in miniature)
// falls down the rail instead, swinging into the bin chip at the gate's right edge.
//
// The sieve is taller than a phone's screen, and the visitors sit above it, so a drop would
// happen out of sight. Before it starts, the page scrolls the card and the first gates into view,
// and then just far enough to keep each gate the ticket reaches, and finally the result line, on
// screen (in one jump, under reduced motion).
//
// That following is a courtesy, and it yields to everything else. The moment the reader scrolls,
// taps or presses a key, a route takes the page somewhere else, or the Sieve has left the screen,
// the drop stops moving the page and finishes where it is. Without that, the reveal for the next
// gate pulled the page back to the Sieve after the reader had followed a link to #/where, and the
// address named one place while the page showed another.
//
// "You" is the reader's own browser, sorted with the same rules as the hero's "Am I in here?"
// (core/browser.classifyYou), on their machine. Nothing is sent anywhere.
//
// Reduced motion: no fall. The result is shown at once, with every gate it passed stamped.
import { GATES, samples, youSample, resultSentence, decidedAt } from './samples.js';

const FADE_IN = 100, TRAVEL = 110, PAUSE = 350, DECIDE = 280, ARC = 500, SECOND = 220;
const PHONE = '(max-width: 639px)';

const make = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const wait = (ms, signal) => new Promise((res, rej) => {
  const t = setTimeout(res, ms);
  signal.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('stop', 'AbortError')); }, { once: true });
});

// Has Cloudflare's counter script loaded on this page, in this browser? Read from the page's
// own resource list; nothing is fetched to find out.
function counterRan() {
  try {
    if (document.querySelector('script[src*="cloudflareinsights.com"]')) return true;
    return performance.getEntriesByType('resource').some((e) => /cloudflareinsights\.com\/beacon/.test(e.name));
  } catch { return null; }
}

export function createSieve(fig, ctx, { onPick } = {}) {
  const { glyph } = ctx.ui;
  const posts = (ctx.build && ctx.build.posts) || [];
  const newest = posts[posts.length - 1];
  const postPath = newest && newest.slug.length <= 26 ? `/ledger/${newest.slug}/` : '/ledger/';
  const fixed = samples(ctx.snap.through, postPath);
  const sampleOf = (key) => (key === 'you' ? youSample(ctx.snap.through, counterRan()) : fixed.find((s) => s.key === key));

  // Visitors.
  const pickRow = make('div', 'st-how-samples');
  pickRow.setAttribute('role', 'group');
  pickRow.setAttribute('aria-label', 'Pick a visitor to sort');
  const pickBtns = new Map();
  for (const s of [...fixed, { key: 'you', label: 'You' }]) {
    const b = make('button', 'st-how-sample' + (s.key === 'you' ? ' st-how-sample-you' : ''), s.key === 'you' ? 'You (your browser)' : s.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.dataset.key = s.key;
    b.addEventListener('click', () => { play(s.key); onPick && onPick(s.key); });
    pickBtns.set(s.key, b);
    pickRow.append(b);
  }

  // The card as it reads above the gates on a phone (and to screen readers nowhere: the
  // result line says it all).
  const now = make('div', 'st-how-now st-how-idle');
  now.setAttribute('aria-hidden', 'true');
  now.append(make('span', 'st-how-l1', 'Waiting at the gate'), make('span', 'st-how-l2', 'pick a visitor above'));

  // The gates.
  const sieve = make('div', 'st-how-sieve');
  const ol = make('ol', 'st-how-gates');
  ol.setAttribute('aria-label', 'The four questions, in order');
  const rows = [];
  GATES.forEach((g, i) => {
    const li = make('li', 'st-how-gate');
    li.dataset.q = g.q;
    const slot = make('span', 'st-how-slot');
    slot.setAttribute('aria-hidden', 'true');
    slot.append(make('span', 'st-how-node', String(i + 1)));
    const q = make('p', 'st-how-gq');
    q.append(make('b', null, g.short), ' ' + g.ask);
    const stamp = make('span', 'st-how-stamp');
    stamp.setAttribute('aria-hidden', 'true');
    const n = make('span', 'st-how-gn');
    const bin = make('span', 'st-how-bin');
    bin.append(glyph.glyphSVG(g.kind, { size: 12 }), make('span', null, ctx.words.KINDS?.[g.kind]?.short || ({ bot: 'Named bots', scanner: 'Scanners', agent: 'Scripts', stale: 'Old browsers' })[g.kind]));
    li.append(slot, q, stamp, n, bin);
    ol.append(li);
    rows.push({ li, slot, stamp, n, bin, kind: g.kind });
  });
  // The second opinion and the end of the road.
  const second = make('li', 'st-how-gate st-how-second');
  const sSlot = make('span', 'st-how-slot');
  sSlot.setAttribute('aria-hidden', 'true');
  sSlot.append(make('span', 'st-how-node st-how-node-dot'));
  const sq = make('p', 'st-how-gq');
  sq.append(make('b', null, 'Second opinion:'), " did Cloudflare's counter run in it? Then it's in the solid part of the people range.");
  const sStamp = make('span', 'st-how-stamp');
  sStamp.setAttribute('aria-hidden', 'true');
  const sN = make('span', 'st-how-gn st-how-gn-soft');
  second.append(sSlot, sq, sStamp, sN);
  ol.append(second);

  const end = make('li', 'st-how-gate st-how-end');
  const eSlot = make('span', 'st-how-slot');
  eSlot.setAttribute('aria-hidden', 'true');
  eSlot.append(make('span', 'st-how-node st-how-node-end'));
  const eq = make('p', 'st-how-gq');
  eq.append(make('b', null, 'Probably people.'), ' Whatever got four noes.');
  const eN = make('span', 'st-how-gn');
  const eBin = make('span', 'st-how-bin');
  eBin.append(glyph.glyphSVG('person', { size: 12 }), make('span', null, 'People'));
  end.append(eSlot, eq, make('span', 'st-how-stamp'), eN, eBin);
  ol.append(end);

  const drop = make('div', 'st-how-drop');
  drop.setAttribute('aria-hidden', 'true');
  const dl1 = make('span', 'st-how-l1'), dl2 = make('span', 'st-how-l2');
  drop.append(dl1, dl2);
  sieve.append(ol, drop);

  const result = make('div', 'st-how-result');
  const resultLine = make('p', 'st-how-rline');
  resultLine.setAttribute('aria-live', 'polite');
  const resultWhy = make('p', 'st-how-why');
  const youLink = make('a', 'st-how-youlink', 'See where you would land at the gate');
  youLink.href = '#/top/you';
  youLink.hidden = true;
  result.append(resultLine, resultWhy, youLink);
  resultLine.textContent = 'Pick a visitor above and watch where it lands.';

  fig.append(pickRow, now, sieve, result);

  // Where a visitor appears: on the chute, above the first gate's hairline with a little air
  // (measured from the row's top, since the card is about as tall as the gap above the row).
  // On a phone the ticket starts just above the rail's first stretch.
  function startPos() {
    const p = centre(rows[0].slot);
    const top = rows[0].li.getBoundingClientRect().top - sieve.getBoundingClientRect().top;
    p.y = matchMedia(PHONE).matches ? top - 10 : top - drop.offsetHeight / 2 - 10;
    return p;
  }

  // At rest, an empty dashed card waits at the top of the chute, where a visitor will appear.
  function idle() {
    drop.getAnimations().forEach((a) => a.cancel());
    dl1.textContent = 'Waiting at the gate';
    dl2.textContent = 'pick a visitor above';
    drop.classList.add('st-how-idle');
    drop.style.transform = tf(startPos());
  }
  requestAnimationFrame(() => { if (!current) idle(); });
  const onResize = () => { if (!current) idle(); };
  addEventListener('resize', onResize);

  let ctrl = null;
  let current = null;
  let follow = null;   // this drop's leave to scroll the page; once aborted, hands off

  // A fresh leave for one drop, taken away by anything that means the reader (or another part of
  // the page) wants the scroll back. A tap on a visitor counts too, but play() starts its own.
  function startFollowing(key) {
    if (follow) follow.abort();
    const f = new AbortController();
    follow = f;
    const stop = () => f.abort();
    const sc = document.getElementById('panel-scroll');
    if (sc) {
      for (const t of ['wheel', 'touchstart', 'pointerdown', 'keydown']) sc.addEventListener(t, stop, { passive: true, signal: f.signal });
    }
    // The route for this very visitor is the one a tap here writes (or the one that started the
    // drop); any other route is somewhere else to be.
    const off = ctx.bus && ctx.bus.on('route', ({ route } = {}) => {
      if (route && route.ch === 'how' && route.sub === 'try' && route.item === key) return;
      stop();
    });
    if (off) f.signal.addEventListener('abort', off, { once: true });
  }
  const following = () => !!follow && !follow.signal.aborted;

  function counts(view) {
    const f = ctx.fmt;
    const p = view.pages;
    rows.forEach((r) => { r.n.textContent = `${f.num(p[r.kind] || 0)} pages`; });
    const pr = view.people;
    // Each line counts what it says: four noes is the server's own count; the second opinion is
    // the counter's (an estimate). The range made from the two is the hero's and 5b's business.
    eN.textContent = `${f.num(pr.hiRaw)} ${f.plural(pr.hiRaw, 'page', 'pages')}`;
    // When the counter's total is the range's top (it came out higher on every day), the hero
    // prints it unrounded, so it is unrounded here too.
    sN.textContent = pr.loRaw ? `${pr.loRaw < 100 || pr.loRaw === pr.hi ? f.num(pr.loRaw) : 'about ' + f.approx(pr.loRaw)} heard` : 'heard none';
  }

  function reset() {
    for (const r of [...rows, { li: second, stamp: sStamp }, { li: end, stamp: end.querySelector('.st-how-stamp') }]) {
      r.li.classList.remove('st-how-asked', 'st-how-hit', 'st-how-at');
      r.stamp.replaceChildren();
      r.stamp.className = 'st-how-stamp';
    }
    for (const r of rows) r.bin.classList.remove('st-how-landed');
    eBin.classList.remove('st-how-landed');
    drop.getAnimations().forEach((a) => a.cancel());
    drop.classList.remove('st-how-show');
  }

  function stampOn(row, yes, kind, text) {
    row.stamp.replaceChildren();
    row.stamp.className = 'st-how-stamp ' + (yes ? 'st-how-yes' : 'st-how-no');
    if (yes && kind) row.stamp.append(glyph.glyphSVG(kind, { size: 11 }));
    row.stamp.append(document.createTextNode(text || (yes ? 'yes' : 'no')));
    row.li.classList.add('st-how-asked');
    if (yes) row.li.classList.add('st-how-hit');
  }

  // Where things are, relative to the sieve box.
  function centre(node) {
    const a = sieve.getBoundingClientRect(), b = node.getBoundingClientRect();
    return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 };
  }
  // The part of #panel-scroll the reader can actually see: below the sticky range bar, above
  // the scroller's bottom edge.
  function band() {
    const sc = document.getElementById('panel-scroll');
    if (!sc) return null;
    const r = sc.getBoundingClientRect();
    const bar = document.querySelector('.st-bar');
    const b = bar && bar.getBoundingClientRect();
    const top = b && b.bottom > r.top && b.top < r.top + 140 ? b.bottom : r.top;
    return { sc, top: top + 12, bottom: Math.min(r.bottom, innerHeight) - 12 };
  }
  // Scrolls just far enough to show from the top of `a` to the bottom of `b`; when both can't
  // fit, the top wins. Returns how far it moved.
  function reveal(a, b = a, { first = false } = {}) {
    if (!following()) return 0;
    const bd = band();
    if (!bd || !a) return 0;
    // Once the drop is under way, a Sieve wholly off screen means the page went elsewhere by some
    // way no event told us about: stop following rather than drag the reader back.
    if (!first) {
      const r = fig.getBoundingClientRect();
      if (r.bottom < bd.top || r.top > bd.bottom) { follow.abort(); return 0; }
    }
    const t = a.getBoundingClientRect().top, btm = b.getBoundingClientRect().bottom;
    let dy = btm > bd.bottom ? btm - bd.bottom : 0;
    if (t - dy < bd.top) dy = t - bd.top;
    if (Math.abs(dy) < 2) return 0;
    bd.sc.scrollBy({ top: dy, behavior: ctx.motion.reduced ? 'auto' : 'smooth' });
    return Math.abs(dy);
  }

  const tf = (p, s = 1) => `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, -50%) scale(${s})`;

  function arcFrames(from, to, steps = 14) {
    const c = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 46 };
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      const p = { x: u * u * from.x + 2 * u * t * c.x + t * t * to.x, y: u * u * from.y + 2 * u * t * c.y + t * t * to.y };
      out.push({ transform: tf(p, 1 - 0.7 * t), opacity: t < 0.8 ? 1 : 1 - (t - 0.8) * 5, offset: t });
    }
    return out;
  }

  function finish(sample) {
    resultLine.textContent = resultSentence(sample);
    resultWhy.textContent = sample.why;
    youLink.hidden = sample.key !== 'you';
    // Keep the gate that decided and the sentence under it in view.
    const at = decidedAt(sample);
    reveal(at >= 0 ? rows[at].li : end, result);
  }

  function showInstant(sample) {
    const at = decidedAt(sample);
    sample.answers.forEach((yes, i) => stampOn(rows[i], yes, GATES[i].kind));
    if (at >= 0) rows[at].bin.classList.add('st-how-landed');
    else {
      if (sample.counter != null) stampOn({ li: second, stamp: sStamp }, !!sample.counter, null, sample.counter ? 'ran' : "didn't");
      end.classList.add('st-how-hit');
      eBin.classList.add('st-how-landed');
    }
    finish(sample);
  }

  async function animate(sample, signal) {
    const phone = matchMedia(PHONE).matches;
    const at = decidedAt(sample);
    // Bring the card and the first gates on screen before anything falls.
    if (reveal(phone ? now : sieve, result, { first: true })) await wait(420, signal);
    const start = startPos();
    drop.classList.add('st-how-show');
    const go = (from, to, dur, scale = 1) => drop.animate([{ transform: tf(from, scale) }, { transform: tf(to, scale) }],
      { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    drop.animate([{ transform: tf(start), opacity: 0 }, { transform: tf(start), opacity: 1 }], { duration: FADE_IN, fill: 'forwards' });
    await wait(FADE_IN, signal);
    let pos = start;
    for (let i = 0; i < sample.answers.length; i++) {
      const row = rows[i];
      reveal(row.li);
      const to = centre(row.slot);
      go(pos, to, TRAVEL);
      pos = to;
      await wait(TRAVEL, signal);
      row.li.classList.add('st-how-at');
      const yes = sample.answers[i];
      stampOn(row, yes, GATES[i].kind);
      if (!yes) { await wait(PAUSE, signal); row.li.classList.remove('st-how-at'); continue; }
      await wait(DECIDE, signal);
      const target = centre(row.bin);
      drop.animate(arcFrames(pos, target), { duration: ARC, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      await wait(ARC, signal);
      row.li.classList.remove('st-how-at');
      row.bin.classList.add('st-how-landed');
      row.bin.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)' });
      return;
    }
    // Four noes: the second opinion, then the tea room.
    if (at < 0) {
      reveal(second);
      const sTo = centre(sSlot);
      go(pos, sTo, TRAVEL);
      pos = sTo;
      await wait(TRAVEL, signal);
      if (sample.counter != null) stampOn({ li: second, stamp: sStamp }, !!sample.counter, null, sample.counter ? 'ran' : "didn't");
      await wait(SECOND, signal);
      reveal(end);
      const eTo = centre(eSlot);
      go(pos, eTo, TRAVEL);
      await wait(TRAVEL, signal);
      end.classList.add('st-how-hit');
      eBin.classList.add('st-how-landed');
      drop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards', delay: 120 });
    }
  }

  // `follow: false` drops the visitor without moving the page at all (the reader already took
  // the scroll back while the route that asked for this drop was waiting to play it).
  async function play(key, { follow: mayFollow = true } = {}) {
    const sample = sampleOf(key);
    if (!sample) return;
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    const signal = ctrl.signal;
    current = key;
    startFollowing(key);
    if (!mayFollow) follow.abort();
    for (const [k, b] of pickBtns) b.setAttribute('aria-pressed', String(k === key));
    reset();
    drop.classList.remove('st-how-idle');
    drop.style.transform = '';
    dl1.textContent = sample.line1;
    dl2.textContent = sample.line2;
    now.replaceChildren(make('span', 'st-how-l1', sample.line1), make('span', 'st-how-l2', sample.line2));
    now.classList.remove('st-how-idle');
    youLink.hidden = true;
    resultWhy.textContent = '';
    if (ctx.motion.reduced) { showInstant(sample); return; }
    resultLine.textContent = '';
    try {
      await animate(sample, signal);
      finish(sample);
    } catch (e) {
      if (e.name !== 'AbortError') throw e;
    }
  }

  return {
    play,
    counts,
    get current() { return current; },
    destroy() { if (ctrl) ctrl.abort(); if (follow) follow.abort(); removeEventListener('resize', onResize); },
  };
}
