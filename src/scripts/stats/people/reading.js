// Figure 3a, "What do they read?": the pages people opened, ranked, each title a real link to the
// post (so a mouse gets the site's hover card from ledger-preview.js), and each row opening in
// place onto that page's days. Under the list, one sentence on how people found the site.
//
// Honesty rules this figure keeps:
// - Each day's list is that day's top 40 pages, so a page can be missing from a day it was read
//   on. A total that may have lost such days says "at least", and in the day strip a day it
//   wasn't listed on is drawn hollow ("under the day's top 40"), never as a zero.
// - Only listed posts are named. view.paths has already dropped every path that isn't public
//   (agg.isPublicPath) and view.reads every slug that isn't listed; a post row's slug is checked
//   against the build's list once more here before its title is printed, so a new mode can't
//   let an unlisted post slip through.
// - Referrer hosts are named only when agg allowed them (allowlisted, or common enough); the rest
//   are "other sites", counted and never named.

const MODES = [
  { key: 'posts', label: 'Posts' },
  { key: 'every', label: 'Every page' },
  { key: 'stayed', label: 'Readers who stayed' },
];
const TOP = 12;
const NO_READS = 'Only posts with the reader counter appear here, and none have readers in these days.';

const h = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

export function createReading(fig, ctx) {
  const { fmt, agg, ui } = ctx;
  const M = ctx.motion || {};
  const reduced = () => !!(M.motion && M.motion.reduced);
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  const fq = h('h3', 'st-fq', 'What do they read?');
  const fa = h('p', 'st-fa');
  const toggle = h('div', 'st-ppl-toggle');
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'What to list');
  const btns = MODES.map((m) => {
    const b = h('button', 'st-pill st-ppl-pill', m.label);
    b.type = 'button';
    b.dataset.mode = m.key;
    b.setAttribute('aria-pressed', 'false');
    toggle.append(b);
    return b;
  });
  // In 'stayed' mode, a standing line under the toggle that says why the list is so short: only
  // posts carrying the reader counter are measured this way, so a post missing here isn't a zero.
  // Without it one row reads as "one post kept readers and every other kept none", which the
  // answer above (the most-read post, by pages) seems to contradict.
  const scope = h('p', 'st-ppl-scope');
  scope.hidden = true;
  const head = h('div', 'st-ppl-listhead');
  head.setAttribute('aria-hidden', 'true');
  const listHost = h('div', 'st-ppl-list');
  const empty = h('p', 'st-ppl-empty');
  const invite = h('p', 'st-invite');
  const sources = h('p', 'st-ppl-sources');
  sources.id = 'st-sources';
  const tools = h('div', 'st-ppl-tools');
  fig.append(fq, fa, toggle, scope, head, listHost, empty, invite, sources, tools);

  let view = null, mode = 'posts', rows = [], bars = null, open = null, toolsApi = null;
  let selfRoute = null;

  const hasReads = (v) => (v.reads || []).some((r) => r.post && r.n > 0);

  // ---- rows for the current mode ----
  function rowsFor(v, m) {
    const bySlug = ctx.build && ctx.build.bySlug;
    const listed = (r) => r.kind !== 'post' || !!(r.slug && bySlug && bySlug.has(r.slug));
    if (m === 'stayed') {
      return (v.reads || [])
        .filter((r) => r.post && r.n > 0 && bySlug && bySlug.has(r.post.slug))
        .map((r) => ({
          path: `/ledger/${r.post.slug}/`, n: r.n, partial: false, kind: 'post',
          id: r.post.id, slug: r.post.slug, label: r.post.title, href: `/ledger/${r.post.slug}/`, date: r.post.date,
        }))
        .sort((a, b) => b.n - a.n);
    }
    const src = (v.paths || []).filter(listed);
    return m === 'posts' ? src.filter((r) => r.kind === 'post') : src;
  }

  // The label cell: the AO number, then the title. With a mouse the title is a real link, which
  // carries the site's hover card. On a touch screen it is plain text inside the row's button: the
  // title is most of the row, so a thumb aimed at the row lands on it, and as a link it would
  // carry the reader off the page instead of opening the row ("Read it" in the row is the link).
  // A raw public path (one with no friendly name) is shown as code and is never a link: it may be
  // a file, not a page. Site pages have no AO number, and no empty slot for one either, so on a
  // phone their names start at the same edge as the post rows' numbers.
  function labelNode(r) {
    const wrap = h('span', 'st-ppl-lab');
    if (r.kind === 'post' && r.id) wrap.append(h('span', 'st-ppl-id', r.id), document.createTextNode(' '));
    else wrap.classList.add('is-noid');
    let title;
    if (r.kind === 'other') title = h('span', 'st-ppl-title is-raw', r.label);
    else if (!fine.matches) title = h('span', 'st-ppl-title', r.label);
    else {
      title = h('a', 'st-ppl-title', r.label);
      title.href = r.href;
    }
    wrap.append(title);
    return wrap;
  }

  function writeFa() {
    // The sentence follows the list: in 'stayed' mode it counts readers who stayed, not pages.
    if (mode === 'stayed' && rows.length) {
      const total = rows.reduce((s, r) => s + r.n, 0);
      const lead = `${fmt.num(total)} ${fmt.plural(total, 'reader', 'readers')} stayed on a post 4 seconds or more ${view.phrase.long}`;
      fa.textContent = rows.length === 1
        ? `${lead}, all of them on ${rows[0].id}.`
        : `${lead}, across ${fmt.num(rows.length)} posts.`;
      return;
    }
    const posts = (view.paths || []).filter((r) => r.kind === 'post');
    const home = (view.paths || []).find((r) => r.path === '/');
    const k = posts.length;
    const lead = k === 0 ? 'No post was opened' : k === 1 ? 'One post was opened' : `${fmt.num(k)} different posts were opened`;
    const homeBit = home
      ? `; the homepage drew ${home.partial ? 'at least ' : ''}${fmt.num(home.n)} ${fmt.plural(home.n, 'page', 'pages')}.`
      : '.';
    fa.textContent = `${lead} ${view.phrase.long}${homeBit}`;
  }

  function renderRows() {
    open = null;
    const unit = mode === 'stayed' ? 'readers' : 'pages';
    const barRows = rows.map((r) => ({
      key: r.path, label: labelNode(r), value: r.n, partial: !!r.partial,
    }));
    const opts = {
      rows: barRows, color: 'var(--st-person)', unit, top: TOP,
      label: mode === 'stayed' ? 'Readers who stayed, by post' : mode === 'posts' ? 'Posts people opened' : 'Pages people opened',
      onSelect: (row, li) => toggleRow(li),
    };
    if (!bars) bars = ui.bars.rankedBars(listHost, opts);
    else bars.update(opts);
    head.replaceChildren(
      h('span', '', mode === 'every' ? 'Page' : 'Post'),
      h('span', 'st-ppl-headval', mode === 'stayed' ? 'Readers who stayed' : 'Pages by people'),
    );
    const none = rows.length === 0;
    head.hidden = none;
    listHost.hidden = none;
    empty.hidden = !none;
    empty.textContent = mode === 'stayed'
      ? NO_READS
      : mode === 'posts'
        ? `No post made people's lists ${view.phrase.long}.`
        : `No pages went to people ${view.phrase.long}.`;
    const ids = rows.map((r) => r.id).filter(Boolean);
    scope.hidden = mode !== 'stayed' || none;
    scope.textContent = scope.hidden ? '' : `Only posts carrying the reader counter count readers who stayed; ${view.phrase.long} ${ids.length === 1 ? `only ${ids[0]} counted any` : `${fmt.list(ids)} counted some`}. Other posts aren't measured this way, so a post missing here isn't zero readers.`;
    invite.textContent = none ? '' : fine.matches ? 'Click a row for its days.' : 'Tap a row for its days.';
  }

  // ---- the day strip and facts that open under a row ----
  function detailFor(r) {
    const box = h('div', 'st-ppl-dinner');
    const days = view.days || [];
    // A post can't be read before it went up: those days are zeros, not "maybe, under the top 40".
    const daily = agg.pathDaily(days, r.path).map((x) => (r.date && x.d < r.date && x.n == null ? { d: x.d, n: 0 } : x));
    if (daily.length >= 2) {
      const max = daily.reduce((m, x) => Math.max(m, x.n || 0), 0) || 1;
      const strip = h('div', 'st-ppl-strip');
      strip.setAttribute('aria-hidden', 'true');
      strip.style.setProperty('--n', String(daily.length));
      const marks = h('div', 'st-ppl-strip st-ppl-marks');
      marks.setAttribute('aria-hidden', 'true');
      marks.style.setProperty('--n', String(daily.length));
      daily.forEach((x, i) => {
        const c = h('span', 'st-ppl-cell');
        if (x.n == null) c.classList.add('is-under');
        else if (x.n === 0) c.classList.add('is-zero');
        else c.style.setProperty('--a', (0.25 + 0.75 * (x.n / max)).toFixed(3));
        c.dataset.i = String(i);
        strip.append(c);
        marks.append(h('span', r.date && x.d === r.date ? 'st-ppl-went' : ''));
      });
      const axis = h('div', 'st-ppl-axis');
      axis.setAttribute('aria-hidden', 'true');
      axis.append(h('span', '', fmt.day(daily[0].d, 'axis')), h('span', '', fmt.day(daily[daily.length - 1].d, 'axis')));
      const read = h('p', 'st-ppl-readout');
      const counted = daily.filter((x) => x.n != null);
      const best = counted.reduce((b, x) => (!b || x.n > b.n ? x : b), null);
      const under = daily.length - counted.length;
      const sum = best && best.n > 0
        ? `Read on ${fmt.num(counted.filter((x) => x.n > 0).length)} of ${fmt.num(daily.length)} days${under ? ` (and maybe on ${fmt.num(under)} more, under the day's top 40)` : ''}; the most was ${fmt.num(best.n)} ${fmt.plural(best.n, 'page', 'pages')}, on ${fmt.day(best.d)}.`
        : `Not in any day's top 40 ${view.phrase.long}.`;
      read.textContent = sum;
      // Pointing at (or touching) a day reads it out; leaving puts the summary back.
      const showCell = (ev) => {
        const t = ev.target.closest && ev.target.closest('.st-ppl-cell');
        if (!t || !strip.contains(t)) return;
        const x = daily[Number(t.dataset.i)];
        for (const c of strip.children) c.classList.toggle('is-on', c === t);
        read.textContent = x.n == null
          ? `${fmt.day(x.d)}: under that day's top 40, so not counted.`
          : `${fmt.day(x.d)}: ${fmt.num(x.n)} ${fmt.plural(x.n, 'page', 'pages')} by people.`;
      };
      const reset = () => {
        for (const c of strip.children) c.classList.remove('is-on');
        read.textContent = sum;
      };
      strip.addEventListener('pointermove', showCell);
      strip.addEventListener('pointerdown', showCell);
      strip.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse') reset(); });
      box.append(strip, marks, axis, read);
      const wentIn = r.date && daily.some((x) => x.d === r.date);
      if (under || wentIn) {
        const key = h('p', 'st-ppl-key');
        key.setAttribute('aria-hidden', 'true');
        if (under) key.append(h('span', 'st-ppl-cell is-under'), h('span', '', "under the day's top 40"));
        if (wentIn) key.append(h('span', 'st-ppl-went'), h('span', '', 'the day it went up'));
        box.append(key);
      }
    }
    const facts = h('ul', 'st-ppl-facts');
    if (r.kind === 'post' && r.date) facts.append(h('li', '', `Went up ${fmt.day(r.date, 'long')}`));
    if (mode === 'stayed') {
      const pages = (view.paths || []).find((p) => p.path === r.path);
      if (pages) facts.append(h('li', '', `Pages by people: ${pages.partial ? 'at least ' : ''}${fmt.num(pages.n)}`));
    } else if (r.kind === 'post') {
      const rd = (view.reads || []).find((x) => x.post && x.post.slug === r.slug);
      if (rd && rd.n > 0) facts.append(h('li', '', `Readers who stayed 4 s or more: ${fmt.num(rd.n)}`));
    }
    const rum = (view.rumPaths || []).find((x) => x.key === r.path);
    if (rum && rum.n > 0) {
      const n = Math.round(rum.n);
      facts.append(h('li', '', `Cloudflare's counter: ${n >= 100 ? 'about ' : ''}${fmt.approx(n)} page ${fmt.plural(n, 'load', 'loads')}`));
    }
    if (facts.children.length) box.append(facts);
    if (r.kind !== 'other') {
      const go = h('a', 'st-ppl-go', r.kind === 'post' ? 'Read it' : 'Open it');
      go.href = r.href;
      go.append(ui.glyph.arrowSVG('right'));
      box.append(go);
    }
    return box;
  }

  function setOpen(li, want) {
    const hit = li.querySelector('.st-bars-hit');
    const slot = li.querySelector('.st-bars-more');
    if (!slot) return;
    if (want) {
      if (open && open !== li) setOpen(open, false);
      const r = rows.find((x) => x.path === li.dataset.key);
      if (!r) return;
      const inner = detailFor(r);
      slot.replaceChildren(inner);
      slot.hidden = false;
      li.classList.add('is-open');
      if (hit) hit.setAttribute('aria-expanded', 'true');
      open = li;
      if (M.enter) M.enter(inner, { y: 6, dur: 220 });
    } else {
      slot.hidden = true;
      slot.replaceChildren();
      li.classList.remove('is-open');
      if (hit) hit.setAttribute('aria-expanded', 'false');
      if (open === li) open = null;
    }
  }
  const toggleRow = (li) => setOpen(li, !li.classList.contains('is-open'));

  listHost.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape' || !open) return;
    const li = open;
    setOpen(li, false);
    const hit = li.querySelector('.st-bars-hit');
    if (hit) hit.focus();
    ev.stopPropagation();
  });

  // ---- the toggle ----
  function setMode(m, { route = true } = {}) {
    if (m === 'stayed' && !hasReads(view)) return;
    mode = m;
    rows = rowsFor(view, mode);
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    writeFa();
    renderRows();
    renderTools();
    if (route && ctx.router) {
      selfRoute = mode === 'stayed' ? 'stayed' : '';
      ctx.router.go({ ch: 'read', sub: mode === 'stayed' ? 'stayed' : null, item: null }, { push: false, scroll: false });
    }
  }
  toggle.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.getAttribute('aria-disabled') === 'true') {
      // disabled, but still says why: a card with the reason instead of a dead button
      ui.pop.openPop(b, ui.pop.cardBody ? ui.pop.cardBody({ title: 'Readers who stayed', body: NO_READS }) : NO_READS,
        { kind: 'card', label: 'Readers who stayed', pinned: true, focus: ev.detail === 0 });
      return;
    }
    if (b.dataset.mode !== mode) setMode(b.dataset.mode);
  });

  // ---- how people found the site ----
  function writeSources() {
    const ref = view.referrers || { none: 0, total: 0, rows: [], other: 0 };
    const term = (key, label) => {
      try { return ui.term.term(key, label); } catch (e) { return document.createTextNode(label); }
    };
    const t = (s) => document.createTextNode(s);
    sources.replaceChildren(h('strong', 'st-ppl-srchead', 'How they found the site. '));
    const total = Math.round(ref.total || 0);
    if (total < 1) {
      sources.append(term('counter', "Cloudflare's counter"), t(` heard of no arrivals from outside the site ${view.phrase.long}.`));
      return;
    }
    const est = (n) => (n >= 100 ? `about ${fmt.approx(n)}` : fmt.num(n));
    const named = (ref.rows || []).filter((r) => r.label && r.n > 0).slice(0, 3);
    const namedSum = named.reduce((s, r) => s + r.n, 0);
    sources.append(
      t(`Of the ${total >= 100 ? 'roughly ' + fmt.approx(total) : fmt.num(total)} page ${fmt.plural(total, 'load', 'loads')} `),
      term('counter', "Cloudflare's counter"),
      t(` heard about from outside the site, ${fmt.frac((ref.none || 0) / total)} came `),
      term('nolink', 'with no link'),
      t(' (typed, a bookmark or an app).'),
    );
    if (named.length) {
      const parts = named.map((r, i) => (i === 0 ? `${r.label} sent ${est(r.n)}` : `${r.label} ${est(r.n)}`));
      sources.append(t(` ${fmt.list(parts)}.`));
    }
    // everything with a link that isn't named above: hosts too rare to name, and named ones past the third
    const rest = Math.round(total - (ref.none || 0) - namedSum);
    if (rest > 0) sources.append(t(` Other sites sent ${est(rest)} more.`));
  }

  // ---- table twin and tools ----
  function renderTools() {
    if (toolsApi) toolsApi.destroy();
    tools.replaceChildren();
    const stayed = mode === 'stayed';
    const twin = ui.table.tableTwin({
      caption: stayed
        ? `Readers who stayed 4 seconds or more, by post, ${view.phrase.long}`
        : `${mode === 'posts' ? 'Posts' : 'Pages'} people opened, ${view.phrase.long}`,
      cols: stayed
        ? [{ key: 'rank', label: 'Rank', num: true }, { key: 'page', label: 'Post' }, { key: 'n', label: 'Readers', num: true }]
        : [{ key: 'rank', label: 'Rank', num: true }, { key: 'page', label: 'Page' }, { key: 'n', label: 'Pages', num: true }, { key: 'partial', label: 'Partial' }],
      rows: rows.map((r, i) => ({
        rank: i + 1,
        page: r.kind === 'post' && r.id ? `${r.id} ${r.label}` : r.label,
        n: r.n,
        partial: r.partial ? "yes: missing from some days' top 40" : '',
      })),
    });
    toolsApi = ui.table.figureTools(tools, {
      table: twin,
      route: { ch: 'read', sub: stayed ? 'stayed' : null, item: null },
      router: ctx.router,
    });
  }

  // a tablet with a mouse plugged in (or pulled out) gets the right kind of title from then on
  const onPointerKind = () => { if (view) renderRows(); };
  if (fine.addEventListener) fine.addEventListener('change', onPointerKind);

  function update(v) {
    view = v;
    const canStay = hasReads(v);
    const sb = btns[2];
    sb.setAttribute('aria-disabled', String(!canStay));
    sb.classList.toggle('is-off', !canStay);
    if (!canStay && mode === 'stayed') mode = 'posts';
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    rows = rowsFor(v, mode);
    writeFa();
    renderRows();
    writeSources();
    renderTools();
  }

  const pulseEl = (el) => { if (el && M.pulse) M.pulse(el); };

  // Routes: #/read, #/read/<slug>, #/read/sources, #/read/stayed.
  function go(sub) {
    const echo = selfRoute;
    selfRoute = null;
    if (echo !== null && (sub || '') === echo) return; // our own toggle, coming back through the router
    if (sub === 'sources') { pulseEl(sources); return; }
    if (sub === 'stayed') { if (mode !== 'stayed') setMode('stayed', { route: false }); return; }
    if (!sub) return;
    // A post: list posts (or every page, if it's only there), open its row, focus it.
    if (mode === 'stayed') setMode('posts', { route: false });
    const path = `/ledger/${String(sub).toLowerCase()}/`;
    if (!rows.some((r) => r.path === path) && mode === 'posts') setMode('every', { route: false });
    if (!rows.some((r) => r.path === path)) return; // not read in this range, or not a listed post
    if (open && open.dataset.key === path) {
      const hit = open.querySelector('.st-bars-hit');
      if (hit) hit.focus({ preventScroll: true });
      pulseEl(open);
      return;
    }
    const li = bars.expand(path); // reveals it past "Show all", runs onSelect (opens it), focuses it
    if (li) pulseEl(li);
  }

  return {
    update,
    go,
    destroy() {
      if (fine.removeEventListener) fine.removeEventListener('change', onPointerKind);
      if (toolsApi) toolsApi.destroy();
      if (bars) bars.destroy();
      fig.replaceChildren();
    },
  };
}
