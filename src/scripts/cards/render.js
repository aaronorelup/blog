// The hover card's element and where it goes (cards/hover.js decides when). One element, reused: build() makes it,
// fill() writes a card into it, place() puts it beside the link it belongs to. PREVIEWS.md is the spec.
const GAP = 18;           // between the link's text and the card
const EDGE = 12;          // the card keeps this far from the panel's edges

export function build() {
  const card = document.createElement('div');
  card.className = 'lp-card';
  // A visual summary of a page the link already leads to: screen readers get the link, and
  // the post, rather than the card read out on every focus.
  card.setAttribute('aria-hidden', 'true');
  // The picture sits inside the body: full width across the top normally, floated into a
  // thumbnail the text wraps around when space is short (place()). With no picture, the post's icon.
  card.innerHTML =
    '<div class="lp-body">' +
    '<div class="lp-media"><img class="lp-img" alt="" decoding="async">' +
    '<video class="lp-video" muted playsinline loop disablepictureinpicture disableremoteplayback preload="none"></video></div>' +
    '<img class="lp-icon" alt="" width="48" height="48" decoding="async">' +
    '<div class="lp-meta"></div>' +
    '<div class="lp-title"></div>' +
    '<p class="lp-line"></p>' +
    '<div class="lp-verdict"></div>' +
    '<p class="lp-takeaway"></p>' +
    '<ul class="lp-points"></ul>' +
    '<p class="lp-excerpt"><span class="lp-label">From the opening</span><span class="lp-excerpt-text"></span></p>' +
    '</div>';
  const q = (s) => card.querySelector(s);
  const els = {
    media: q('.lp-media'), img: q('.lp-img'), video: q('.lp-video'), icon: q('.lp-icon'), meta: q('.lp-meta'),
    title: q('.lp-title'), line: q('.lp-line'), verdict: q('.lp-verdict'), takeaway: q('.lp-takeaway'),
    points: q('.lp-points'), excerpt: q('.lp-excerpt'), excerptText: q('.lp-excerpt-text'),
  };
  els.video.muted = true;
  els.img.addEventListener('load', () => els.img.classList.add('lp-ready'));
  els.video.addEventListener('playing', () => els.video.classList.add('lp-ready'));
  // Inside #panel-screen it inherits the panel's palette, which the homepage scene tweens
  // inline as day turns to night. Fixed, so it isn't clipped by the panel's overflow.
  (document.getElementById('panel-screen') || document.body).appendChild(card);
  return { card, els };
}

// row: the link is a ledger row, which already shows the title beside the card.
export function fill(els, p, row) {
  els.meta.textContent = `${p.id} · ${p.mins} min read`;
  els.title.hidden = row;
  els.title.textContent = row ? '' : p.title;
  els.verdict.hidden = !p.verdict;
  els.verdict.textContent = p.verdict || '';
  els.takeaway.hidden = !p.takeaway;
  els.takeaway.textContent = p.takeaway || '';
  els.points.replaceChildren(...(p.points || []).map((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    return li;
  }));
  els.points.hidden = !(p.points && p.points.length);
  els.excerpt.hidden = !p.excerpt;
  els.excerptText.textContent = p.excerpt || '';

  els.media.hidden = !p.image;
  els.img.classList.remove('lp-ready');
  els.video.classList.remove('lp-ready');
  if (p.image) {
    els.img.alt = p.alt || '';
    if (els.img.getAttribute('src') !== p.image) els.img.src = p.image;
    if (els.img.complete && els.img.naturalWidth) els.img.classList.add('lp-ready');
  } else {
    els.img.removeAttribute('src');
  }
  els.icon.hidden = !!p.image || !p.icon;
  if (!els.icon.hidden && els.icon.getAttribute('src') !== p.icon) els.icon.src = p.icon;
}

// The link's own line (data-card-line: which passage a Goobie cite lands on), or none. Set on every open, apart from
// fill(), so moving between two cites of one post changes only this line and leaves its loop playing.
export function line(els, text) {
  els.line.hidden = !text;
  els.line.textContent = text || '';
}

// Beside the text if there's room (flush with the row's right edge, beside the text, or to its
// left), otherwise under the link, otherwise above it. The card may cover the rows around the
// one being hovered, never that row's own title or the link itself: if the full card can't sit
// clear of them, it steps down a size before anything is covered. The picture shrinks to a
// thumbnail, then goes; last, the findings go and the verdict and takeaway stay, which fits
// on any screen. The bounds are the panel card, so on the homepage it never hangs over the scene.
const SIZES = ['', 'lp-thumb', 'lp-compact', 'lp-compact lp-tight'];

export function place(card, els, a) {
  const panel = a.closest('#panel-card');
  const b = panel ? panel.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  const r = anchorBox(a);
  const size = (cls) => {
    card.classList.remove('lp-thumb', 'lp-compact', 'lp-tight');
    if (cls) card.classList.add(...cls.split(' '));
    return card.offsetHeight;
  };
  const sizes = els.media.hidden ? ['', 'lp-compact lp-tight'] : SIZES;
  let h = size('');
  const w = card.offsetWidth;
  const minX = b.left + EDGE, maxX = b.right - EDGE - w, minY = b.top + EDGE, maxBottom = b.bottom - EDGE;
  const side =
    r.right - w >= r.textRight + GAP && r.right - w <= maxX ? r.right - w   // flush with the row's right edge: the row, opened out
    : r.textRight + GAP <= maxX ? r.textRight + GAP
    : r.textLeft - GAP - w >= minX ? r.textLeft - GAP - w
    : null;
  let x, y = null;
  if (side !== null) {
    x = side;
    // Only a title long enough to reach under the card constrains it; otherwise it can slide.
    const blocked = r.titleRight > x - 4;
    for (const cls of sizes) {
      h = size(cls);
      if (r.top + h <= maxBottom || (!blocked && h <= maxBottom - minY)) { y = r.top; break; }
      if (blocked && r.titleTop - 6 - h >= minY) { y = r.titleTop - 6 - h; break; }
    }
  } else {
    x = r.left;
    for (const cls of sizes) {
      h = size(cls);
      if (r.bottom + 8 + h <= maxBottom) { y = r.bottom + 8; break; }
      if (r.above - 8 - h >= minY) { y = r.above - 8 - h; break; }
    }
  }
  if (y === null) y = r.top;   // nothing fits whole at any size: the smallest, held inside the bounds
  const maxY = maxBottom - h;
  card.style.left = `${Math.round(Math.min(Math.max(x, minX), Math.max(minX, maxX)))}px`;
  card.style.top = `${Math.round(Math.min(Math.max(y, minY), Math.max(minY, maxY)))}px`;
}

// Where the words are. A ledger row is as wide as the page, its title one line and its summary capped at 600px:
// beside the summary, the card starts level with it, under the title. A link inside a post sits in a 720px column
// with the margin beside it free.
//   top: where a card beside the text starts      above/bottom: what a card above/below clears
//   textLeft/textRight: the column of words        titleTop/titleRight: a row's title, to keep clear
function anchorBox(a) {
  if (a.hasAttribute('data-ledger-entry')) {
    const row = a.closest('.row');
    const r = row.getBoundingClientRect();
    const box = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect();
    };
    const t = box(row.querySelector('.row-summary')), h = box(a);
    return { left: r.left, right: r.right, top: t.top - 4, above: r.top, bottom: r.bottom,
      textLeft: r.left, textRight: t.right, titleTop: h.top, titleRight: h.right };
  }
  const r = a.getBoundingClientRect();
  const col = a.closest('[data-post-article]');
  const c = col ? col.getBoundingClientRect() : r;
  const line = a.getClientRects()[0] || r;
  return { left: line.left, right: -Infinity, top: line.top - 6, above: line.top, bottom: r.bottom,
    textLeft: c.left, textRight: c.right, titleTop: line.top, titleRight: -Infinity };
}
