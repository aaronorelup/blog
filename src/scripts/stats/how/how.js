// 05 · How was this counted? The page's method, told so a reader can check it: the four
// questions as a sieve they can drop visitors through (sieve.js), why the people count is a
// range, what the numbers can't see, and when and how this filing was made.
//
// The server already rendered the four questions as a plain list (it works without JS or
// data); this replaces that list with the Sieve, which is the same list, made to move.
import '../../../styles/stats/how.css';
import { createSieve } from './sieve.js';
import { GATES } from './samples.js';

const make = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
// A bold-lead line: the bold part says it all on its own, the rest is the detail.
const lead = (tag, b, rest, cls) => {
  const n = make(tag, cls);
  n.append(make('strong', null, b), ' ' + rest);
  return n;
};

const ANSWER = 'Every page Cloudflare sent went through four questions, in order. The first yes decides its pile. Whatever is left is probably people, and that includes Aaron reading his own site.';

export async function mount(el, ctx) {
  const { fmt, ui } = ctx;
  const body = el.querySelector('[data-st-body]') || el;
  const answerEl = el.querySelector('[data-st-answer]');
  const contextEl = el.querySelector('[data-st-context]');
  const followEl = el.querySelector('[data-st-follow]');
  let view = ctx.views.get(ctx.store.get().range);

  // The answer, with "page" as a defined word (its first use in this chapter).
  if (answerEl) {
    answerEl.replaceChildren();
    const pageBtn = termButton(ui, 'page', 'page');
    if (pageBtn) answerEl.append('Every ', pageBtn, ANSWER.slice('Every page'.length));
    else answerEl.textContent = ANSWER;
  }
  if (contextEl) contextEl.textContent = 'Try it below with a few typical visitors, or with your own browser.';

  // ---- 5a · Try it: the Sieve
  let lastLocal = null;   // the visitor last dropped by a tap here, so its route doesn't replay it
  const tryFig = make('figure', 'st-fig st-how-try');
  tryFig.id = 'st-try';
  const tryH = make('h3', 'st-fq', 'Try it: the Sieve');
  const tryA = make('p', 'st-fa');
  tryFig.append(tryH, tryA);
  const sieve = createSieve(tryFig, ctx, {
    onPick: (key) => {
      lastLocal = { key, at: performance.now() };
      ctx.router.go(`#/how/try/${key}`, { push: false, scroll: false });
    },
  });
  // The table twin and the tools row (figureTools places the table after its row).
  const tryTable = ui.table.tableTwin(tryTableData(view, fmt));
  const tryTools = ui.table.figureTools(tryFig, { table: tryTable, route: { ch: 'how', sub: 'try', item: null }, router: ctx.router });

  // ---- 5b · Why is the people count a range?
  const rangeFig = make('figure', 'st-fig st-how-range');
  rangeFig.id = 'st-range';
  const rangeH = make('h3', 'st-fq', 'Why is the people count a range?');
  const rangeA = make('p', 'st-fa');
  const bars = make('div', 'st-how-bars');
  const reasons = make('ul', 'st-how-reasons');
  reasons.append(
    lead('li', 'Ad blockers stop the counter.', 'Its script never runs for them.'),
    lead('li', 'The counter hears about 1 visit in 10 and multiplies,', 'so its number is an estimate.'),
    lead('li', 'Some people-looking visitors are bots in costume', 'that pass all four questions.'),
    lead('li', 'The homepage reads posts in the background.', "Opening a post from the homepage's ledger fetches the post's page, which the server counts and the counter never sees."),
    lead('li', 'Aaron is in there.', 'Telling him apart would mean looking at internet addresses, and this page never does.'),
  );
  rangeFig.append(rangeH, rangeA, bars, reasons);
  const rangeTable = ui.table.tableTwin(rangeTableData(view, fmt));
  const rangeTools = ui.table.figureTools(rangeFig, { table: rangeTable, route: { ch: 'how', sub: 'range', item: null }, router: ctx.router });
  let rangeBar = null;

  // ---- 5c · What these numbers can't see
  const blind = make('figure', 'st-fig st-how-blind');
  blind.id = 'st-blind';
  const blindList = make('ul', 'st-how-reasons');
  blindList.append(
    lead('li', 'What anyone did on a page.', "Clicks, scrolling and reading time aren't kept. (The reader counter only knows a post stayed open 4 seconds.)"),
    lead('li', 'What they searched to find it.', 'Search engines keep that to themselves.'),
    lead('li', 'Who anyone is.', 'No addresses are kept or looked at; only daily totals.'),
    lead('li', 'Whether a perfect impostor is a person.', 'A bot that looks exactly like a current browser passes every question.'),
  );
  blind.append(make('h3', 'st-fq', "What these numbers can't see"), blindList);

  // ---- When this was filed
  const filed = make('figure', 'st-fig st-how-filed');
  filed.id = 'st-filed';
  const filedP = make('p', 'st-how-filedp');
  const snag = make('p', 'st-how-snag');
  const links = make('p', 'st-how-links');
  filed.append(make('h3', 'st-fq', 'When was this filed?'), filedP, snag, links);
  fillFiled(ctx, filedP, snag, links);

  body.replaceChildren(tryFig, rangeFig, blind, filed);

  function render() {
    tryA.textContent = `Pick a visitor and drop it through. The number beside each question is how many pages it caught ${view.phrase.long}.`;
    sieve.counts(view);
    // Each bar is one source's own total: the counter's page loads (loRaw) and the pages that got
    // four noes (hiRaw). The range the page quotes is built day by day from the lower and the
    // higher of the two, so on a day the counter's estimate overshoots, its ends aren't these
    // totals; that is said in words rather than hung on the wrong bar.
    const p = view.people;
    const counter = counterSpoken(fmt, p);
    const swapped = p.loRaw && p.swappedDays > 0;
    let text = p.loRaw
      ? `Two counts, each wrong in a known direction: Cloudflare's counter heard ${counter} page ${fmt.plural(Math.round(p.loRaw), 'load', 'loads')}, and ${fmt.num(p.hiRaw)} ${fmt.plural(p.hiRaw, 'page', 'pages')} passed every question ${view.phrase.long}. The truth is between them.`
      : `Cloudflare's counter heard from no one ${view.phrase.long}, so only the high end is known: ${fmt.num(p.hiRaw)} ${fmt.plural(p.hiRaw, 'page', 'pages')}.`;
    if (swapped) {
      text += view.n === 1
        ? ` On this day the counter's estimate came out higher than the server's count, so the range runs from the lower to the higher: ${fmt.rangeSpoken(p)}.`
        : ` On ${fmt.num(p.swappedDays)} of these days the counter came out higher, so the range, built day by day from the lower and the higher of the two, runs ${fmt.rangeSpoken(p)}.`;
    }
    rangeA.textContent = text;
    const max = Math.max(p.hiRaw, p.loRaw, 1);
    const opts = {
      lo: p.loRaw, hi: p.hiRaw, max,
      loLabel: p.loRaw ? `Cloudflare's counter: ${counter}` : "Cloudflare's counter: heard from no one",
      hiLabel: `Pages that passed every question: ${fmt.num(p.hiRaw)}`,
    };
    if (rangeBar) rangeBar.update(opts);
    else rangeBar = ui.bars.rangeBar(bars, opts);
  }
  render();

  if (followEl) {
    ui.followups.followups(followEl, [
      { label: 'Back to the answer', href: '#/top' },
      { label: 'Am I in here?', href: '#/top/you' },
    ]);
  }

  // A sample named by the route plays once the reader is looking at it.
  //
  // The wait is the route's to lose. Another route in the meantime (eight links tapped in a row,
  // Back) cancels it outright: a drop that started later would scroll the page back to the Sieve
  // under an address naming somewhere else. The reader scrolling, tapping or pressing a key in
  // the meantime lets it play but not move the page; they've taken the scroll back.
  let pending = null;   // { key, timer, touched, off }
  function cancelPending() {
    if (!pending) return;
    clearTimeout(pending.timer);
    pending.off();
    pending = null;
  }
  function playWhenSeen(key) {
    cancelPending();
    if (ctx.motion.reduced) { sieve.play(key); return; }
    const sc = document.getElementById('panel-scroll');
    const p = { key, touched: false, timer: 0, off: () => {} };
    const touch = () => { p.touched = true; };
    const kinds = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    kinds.forEach((t) => sc && sc.addEventListener(t, touch, { passive: true }));
    p.off = () => kinds.forEach((t) => sc && sc.removeEventListener(t, touch));
    // Let the route's smooth scroll land first, so the fall is seen, not missed.
    p.timer = setTimeout(() => {
      const follow = !p.touched;
      cancelPending();
      sieve.play(key, { follow });
    }, 520);
    pending = p;
  }
  const offRoute = ctx.bus ? ctx.bus.on('route', ({ route } = {}) => {
    if (!pending) return;
    if (route && route.ch === 'how' && route.sub === 'try' && route.item === pending.key) return;
    cancelPending();
  }) : () => {};

  return {
    update(state, prev) {
      if (prev && ctx.agg.rangeKey(state.range) === ctx.agg.rangeKey(prev.range) && state.tz === prev.tz) return;
      view = ctx.views.get(state.range);
      render();
      tryTable.update(tryTableData(view, fmt));
      rangeTable.update(rangeTableData(view, fmt));
      fillFiled(ctx, filedP, snag, links);
    },
    go(route) {
      if (route.sub !== 'try' || !route.item) return;
      // A tap on a visitor already started this drop and then wrote the route; don't restart it.
      if (lastLocal && lastLocal.key === route.item && performance.now() - lastLocal.at < 400) return;
      playWhenSeen(route.item);
    },
    destroy() {
      cancelPending();
      offRoute();
      sieve.destroy();
      tryTools.destroy();
      rangeTools.destroy();
    },
  };
}

// The counter's number is an estimate: "about 1,120" from 100 up, exact below (DESIGN §D.5).
const about = (fmt, n) => (n < 100 ? fmt.num(n) : 'about ' + fmt.approx(n));
// The counter's total, said the way the range says it: when the counter came out at or above the
// server's count on every day, the range's top IS the counter's total and prints unrounded (165),
// so the sentence must not call the same count "about 170" two clauses earlier.
const counterSpoken = (fmt, p) => (p.loRaw === p.hi ? fmt.num(p.loRaw) : about(fmt, p.loRaw));
const counterFig = (fmt, p) => (p.loRaw === p.hi ? p.loRaw : fmt.approx(p.loRaw));

function termButton(ui, key, label) {
  try { return ui.term && ui.term.term ? ui.term.term(key, label) : null; } catch { return null; }
}

function tryTableData(view, fmt) {
  const p = view.people;
  const names = { bot: 'Named bots', scanner: 'Scanners', agent: 'Scripts & agents', stale: 'Old browsers' };
  return {
    caption: `Pages ${view.phrase.long}, by the question that sorted them`,
    cols: [{ key: 'q', label: 'Question' }, { key: 'pile', label: 'Pile' }, { key: 'pages', label: 'Pages', num: true }],
    rows: [
      ...GATES.map((g) => ({ q: g.short, pile: names[g.kind], pages: view.pages[g.kind] || 0 })),
      { q: 'Four noes', pile: 'Probably people', pages: p.hiRaw },
      { q: 'Second opinion', pile: "Page loads Cloudflare's counter heard (an estimate)", pages: counterFig(fmt, p) },
    ],
  };
}

function rangeTableData(view, fmt) {
  const p = view.people;
  return {
    caption: `The two people counts ${view.phrase.long}, and the range made from them`,
    cols: [{ key: 'count', label: 'Count' }, { key: 'pages', label: 'Pages', num: true }],
    rows: [
      { count: "Cloudflare's counter (page loads, an estimate)", pages: counterFig(fmt, p) },
      { count: 'Passed every question', pages: p.hiRaw },
      { count: 'The range (the lower to the higher of the two, day by day)', pages: fmt.range(p) },
    ],
  };
}

// "Filed Sun 18 Oct, 2:24 am your time from 63 small questions to Cloudflare. …"
function fillFiled(ctx, p, snag, links) {
  const { fmt, snap } = ctx;
  const cov = snap.coverage || {};
  const mid = fmt.utcMidnightLocal();
  const zone = ctx.tz && ctx.tz.zone;
  const sameAsUtc = !zone || /^(UTC|Etc\/UTC|Etc\/GMT|GMT)$/.test(zone) || mid === 'midnight';
  const q = snap.run && snap.run.queries;
  let text = `Filed ${fmt.localStamp(snap.builtAt)}${q ? ` from ${fmt.num(q)} small questions to Cloudflare` : ''}. `;
  if (cov.first) text += `Covers ${fmt.day(cov.first, 'short')} to ${fmt.day(snap.through, 'short')} in detail`;
  if (cov.totalsFirst) text += `, and every day since ${fmt.day(cov.totalsFirst, 'short')} in totals`;
  if (cov.first) text += '. ';
  text += sameAsUtc ? 'Days here run midnight to midnight UTC, which is your clock too. '
    : `Days here start at midnight UTC, which is ${mid} where you are. `;
  if (snap.ageHours > 36) {
    const days = Math.floor(snap.ageHours / 24);
    text += `That was ${days >= 2 ? `${days} days` : `${Math.round(snap.ageHours)} hours`} ago; today's filing hasn't come in yet. `;
  }
  text += 'Everyone sees the same filing; the next one comes just after midnight UTC.';
  p.textContent = text;

  const err = snap.run && snap.run.lastError;
  snag.hidden = !err;
  if (err) {
    const msg = String(err.message || 'an error').replace(/\s+/g, ' ').slice(0, 140);
    const at = err.at ? fmt.localStamp(err.at) : 'some point';
    snag.textContent = `Last night's update hit a snag at ${at} (${msg}); these are the numbers from the run before.`;
  }

  links.replaceChildren();
  const post = ctx.build && ctx.build.bySlug && ctx.build.bySlug.get && ctx.build.bySlug.get('who-visits-a-new-website');
  const a1 = make('a', 'st-how-link');
  a1.href = '/ledger/who-visits-a-new-website/';
  a1.textContent = post ? `${post.id}, ${post.title}` : 'AO-057, Who actually visits a new website?';
  const a2 = make('a', 'st-how-link st-how-mono', '/api/stats');
  a2.href = '/api/stats';
  links.append('How this began: ', a1, make('span', 'st-how-sep', ' · '), 'The raw numbers: ', a2);
}
