// <ao-demo name="candy-card" part="card">: a copy of the Daily candy card on Aaron's command center (AO-089), with
// three of its days. Nothing in it is connected to anything: the switches, the days, the post tabs and the notes box
// all work, but only in this page, and a note typed here is kept in memory until the page closes. CNDY-041 opens its
// real page (public/labs/candy-card/cndy-041/, its media re-hosted under /media/candy-machine/cndy-041/); the other
// posts show a still, their opening line and Aaron's notes. data.json holds the posts and his notes as they stood on
// 24 November 2026. The original card is command-center/worker/lib/candy.js.
import { h } from '../../../_lib/dom.js';
import data from './data.json';

const TZ = 'America/Chicago';
const FOLD = 960;
const LIKED = { liked: 'Liked it', mixed: 'Mixed', disliked: "Didn't like it" };
const HINT = 'While this is off or paused, the laptop’s 24/7 timer still checks every 10 minutes, and each check costs a little usage (about $0.80 on Opus). For a long break, also switch off “Daily candy 24/7” under Scheduled in the Claude app.';
const LOCAL = 'Only this copy changed. The real switches are on my command center.';

const nice = (d) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${d}T00:00:00Z`));
const noteDay = (iso) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
const who = (w) => (w === 'aaron via chat' ? 'Aaron, via chat' : 'Aaron');

export function mount(host, part) {
  if (part !== 'card') return null;
  const P = data.posts.map((p) => ({ ...p, notes: p.notes.slice() }));
  const days = [];
  P.forEach((p, i) => {
    let last = days[days.length - 1];
    if (!last || last.d !== p.d) days.push((last = { d: p.d, posts: [] }));
    last.posts.push(i);
  });
  const start = P.findIndex((p) => p.page);
  let di = days.length - 1;
  let pi = Math.max(0, days[di].posts.indexOf(start));
  const ctl = { enabled: true, paused: false, on: true, touched: false };
  let liked = null;
  let frame = null;
  let io = null;

  // ---- the markup, in the card's own order
  const dot = h('span', { class: 'cdc-dot' });
  const st = h('span', { class: 'cdc-st', 'aria-live': 'polite' });
  const bPause = h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => flip('paused') });
  const b247 = h('button', { type: 'button', 'aria-pressed': 'true', onclick: () => flip('on') });
  const bOn = h('button', { type: 'button', 'aria-pressed': 'true', onclick: () => flip('enabled') });
  const until = h('input', { type: 'datetime-local', 'aria-label': '24/7 ends at (Chicago time)', onchange: () => { ctl.touched = true; render(); } });
  const noEnd = h('button', { type: 'button', onclick: () => { until.value = ''; ctl.touched = true; render(); } }, 'no end');
  const hint = h('div', { class: 'cdc-hint' });
  const eyebrow = h('span', { class: 'cdc-eyebrow' });
  const when = h('span', { class: 'cdc-when' });
  const prev = h('button', { type: 'button', 'aria-label': 'Previous day', onclick: () => goDay(di - 1) }, '← Prev day');
  const all = h('button', { type: 'button', 'aria-expanded': 'false', onclick: () => toggle(!list.classList.contains('open')) }, 'All days');
  const next = h('button', { type: 'button', 'aria-label': 'Next day', onclick: () => goDay(di + 1) }, 'Next day →');
  const tabs = h('div', { class: 'cdc-posts', role: 'tablist', 'aria-label': 'Posts on this day' });
  const gotoMsg = h('span');
  const goto = h('input', { placeholder: 'CNDY-041', autocomplete: 'off', 'aria-label': 'Go to a post number', onkeydown: (e) => { if (e.key === 'Enter') find(goto.value); } });
  const dayList = h('div', { role: 'list' });
  const list = h('div', { class: 'cdc-list' }, h('div', { class: 'cdc-find' }, h('label', { text: 'Go to' }), goto, gotoMsg), dayList);
  const stub = h('div', { class: 'cdc-stub' });
  const holder = h('div');
  const view = h('div', { class: 'cdc-view' }, stub, holder);
  const nh = h('div', { class: 'cdc-nh' });
  const notes = h('div', { role: 'list' });
  const chips = Object.entries(LIKED).map(([k, label]) => h('button', { type: 'button', 'data-liked': k, 'aria-pressed': 'false', onclick: () => pick(k) }, label));
  const saw = h('textarea', { id: 'cdc-saw', placeholder: 'e.g. it followed the guides, but the guides made the picture worse' });
  const nxt = h('textarea', { id: 'cdc-next', placeholder: 'e.g. try it again on a fight scene H3 cannot get right on its own, with one jump-attack frame pinned' });
  const ok = h('span', { class: 'cdc-ok', 'aria-live': 'polite' });
  const root = h('div', { class: 'cdc', onkeydown: keys },
    h('div', { class: 'cdc-top' }, h('span', { class: 'cdc-name', text: 'Daily candy' }),
      h('span', { class: 'cdc-copy', text: 'A copy of the card on my command center, with three of its days. It is not connected to anything: press and type all you like.' })),
    h('div', { class: 'cdc-ctl', role: 'group', 'aria-label': 'Daily candy controls' }, dot, st, bPause, b247,
      h('label', { class: 'cdc-until', title: 'Optional: when 24/7 mode ends, in Chicago time. Blank: it runs until you turn it off.' }, 'ends ', until, ' CT ', noEnd), bOn),
    hint,
    h('div', { class: 'cdc-bar' }, eyebrow, when, prev, all, next),
    tabs, list, view,
    h('section', { class: 'cdc-notes', 'aria-label': 'Your notes on this experiment' }, nh,
      h('div', { class: 'cdc-nlead', text: 'What you saw with your own eyes, and what candy should try next with the idea. The agents read these before they choose an experiment, and when you ask for one again.' }),
      notes,
      h('div', { class: 'cdc-chips', role: 'group', 'aria-label': 'Did you like it' }, chips),
      h('label', { class: 'cdc-l', for: 'cdc-saw', text: 'What did you see?' }), saw,
      h('label', { class: 'cdc-l', for: 'cdc-next', text: 'What should candy try next with this idea? (optional)' }), nxt,
      h('div', { class: 'cdc-row' }, h('button', { type: 'button', onclick: save }, 'Save note'), ok)));
  host.replaceChildren(root);

  days.slice().reverse().forEach((day) => {
    const n = day.posts.length;
    dayList.append(h('button', { type: 'button', class: 'cdc-day', role: 'listitem', 'data-d': day.d, onclick: () => { goDay(days.indexOf(day)); toggle(false); } },
      h('span', { class: 'd', text: day.d }), h('span', { class: 'c', text: n > 1 ? `${n} posts` : '' }),
      h('span', { class: 'ts', text: day.posts.map((i) => `${P[i].id} ${P[i].t}`).join(' · ') })));
  });

  // ---- the switches: they flip here and nowhere else
  function flip(k) { ctl[k] = !ctl[k]; ctl.touched = true; render(); }
  function render() {
    const off = !ctl.enabled;
    dot.className = 'cdc-dot';
    let line;
    const small = [];
    if (off) { dot.classList.add('off'); line = 'Daily candy is off. Nothing starts, not even the 4 am run.'; }
    else if (ctl.paused) { dot.classList.add('hold'); line = 'Paused. No run starts until you press Play.'; }
    else if (ctl.on) { dot.classList.add('on'); line = data.status.line; }
    else line = 'Once a day, at 4 am laptop time.';
    if (!off && ctl.on) small.push(until.value ? `24/7 until ${until.value.replace('T', ' ')} CT.` : data.status.small[0]);
    small.push(...data.status.small.slice(1));
    st.replaceChildren(line, ...small.map((x) => h('small', { text: x })));
    bPause.textContent = ctl.paused ? '▶ Play' : '❚❚ Pause';
    bPause.setAttribute('aria-pressed', String(ctl.paused));
    b247.textContent = ctl.on ? '24/7 on' : '24/7 off';
    b247.setAttribute('aria-pressed', String(ctl.on));
    bOn.textContent = ctl.enabled ? 'Candy on' : 'Candy off';
    bOn.setAttribute('aria-pressed', String(ctl.enabled));
    noEnd.disabled = !until.value;
    hint.textContent = [!ctl.on || ctl.paused || off ? HINT : '', ctl.touched ? LOCAL : ''].filter(Boolean).join(' ');
  }

  // ---- days and posts
  function toggle(on) { list.classList.toggle('open', on); all.setAttribute('aria-expanded', String(on)); }
  function find(v) {
    const m = /(\d{1,4})/.exec(v || '');
    const k = m ? P.findIndex((p) => Number(p.id.slice(5)) === Number(m[1])) : -1;
    if (k < 0) { gotoMsg.textContent = 'No post with that number in this copy.'; return; }
    gotoMsg.textContent = '';
    const a = days.findIndex((d) => d.posts.includes(k));
    goDay(a, days[a].posts.indexOf(k)); toggle(false);
  }
  function goDay(n, which = 0) {
    if (n < 0 || n >= days.length) return;
    di = n; pi = Math.min(which, days[di].posts.length - 1); show();
  }
  function goPost(n) {
    if (n < 0) { if (di === 0) return; di -= 1; pi = days[di].posts.length - 1; }
    else if (n >= days[di].posts.length) { if (di === days.length - 1) return; di += 1; pi = 0; }
    else pi = n;
    show();
  }
  function keys(e) {
    if (e.target.closest('input, textarea, .cdc-list, .cdc-ctl')) return;
    if (e.key === 'ArrowLeft') { goPost(pi - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { goPost(pi + 1); e.preventDefault(); }
  }

  function show() {
    const day = days[di];
    const p = P[day.posts[pi]];
    eyebrow.textContent = `Day ${di + 1} of ${days.length}${day.posts.length > 1 ? ` · post ${pi + 1} of ${day.posts.length}` : ''}`;
    when.textContent = nice(day.d);
    prev.disabled = di === 0; next.disabled = di === days.length - 1;
    tabs.replaceChildren(...day.posts.map((i, j) => h('button', { type: 'button', role: 'tab', 'aria-selected': String(j === pi), onclick: () => { pi = j; show(); } },
      h('b', { text: P[i].id }), P[i].t, P[i].notes.length ? h('i', { title: `${P[i].notes.length} notes`, text: `✎ ${P[i].notes.length}` }) : null)));
    for (const b of dayList.children) b.setAttribute('aria-current', String(b.dataset.d === day.d));
    if (p.page) { stub.hidden = true; holder.hidden = false; page(p); }
    else {
      holder.hidden = true; stub.hidden = false;
      const there = P.find((x) => x.page);
      stub.replaceChildren(h('div', { class: 'cdc-sid', text: p.id }), h('div', { class: 'cdc-stitle', text: p.t }),
        h('div', { class: 'cdc-lede', text: p.lede }), h('img', { class: 'cdc-img', src: p.img, alt: p.alt, loading: 'lazy' }),
        h('div', { class: 'cdc-elsewhere' }, `On my command center this tab opens ${p.id}'s whole page, with every trial. This copy only carries ${there.id}'s.`,
          h('button', { type: 'button', onclick: () => find(there.id) }, `Open ${there.id}`)));
    }
    drawNotes(p);
  }

  // CNDY-041's own page, made once and kept (moving a frame reloads it), and only once the card is near the screen.
  // On the command centre it shows at full height; here it is about 7,000 px, so it scrolls inside a frame of FOLD px
  // until the reader asks for the whole page.
  function page(p) {
    if (frame) return;
    frame = h('iframe', { title: `${p.id}: ${p.t}`, src: 'about:blank' });
    const more = h('button', { type: 'button', class: 'cdc-more', hidden: true, onclick: () => { open = !open; size(); if (!open) holder.scrollIntoView({ block: 'nearest' }); } });
    holder.append(frame, more);
    let open = false;
    const size = () => {
      try {
        const d = frame.contentDocument.documentElement;
        if (!d || d.scrollHeight < 200) return;
        const full = d.scrollHeight;
        frame.style.height = `${open ? full : Math.min(full, FOLD)}px`;
        more.hidden = full <= FOLD;
        more.textContent = open ? 'Fold it back' : `Show the whole page (${Math.round(full / 100) * 100} px)`;
      } catch { /* not ours */ }
    };
    frame.addEventListener('load', () => {
      size();
      try { new ResizeObserver(size).observe(frame.contentDocument.documentElement); } catch { /* old browser */ }
      setTimeout(size, 600);
    });
    io = new IntersectionObserver((seen) => {
      if (!seen.some((x) => x.isIntersecting)) return;
      frame.src = p.page; io.disconnect(); io = null;
    }, { rootMargin: '600px 0px' });
    io.observe(root);
  }

  // ---- his notes, and the reader's own, which stay in this page
  function drawNotes(p) {
    nh.textContent = `Your notes on ${p.id}`;
    const rows = p.notes.slice().reverse().map((n) => {
      const bits = n.mine ? ['just now', 'you', 'kept in this page only'] : [noteDay(n.at), who(n.who)];
      if (n.liked) bits.push(LIKED[n.liked]);
      if (!n.mine) bits.push(n.taken_by ? `taken up by ${n.taken_by}` : n.next ? 'request open' : null);
      return h('div', { class: `cdc-note${n.mine ? ' mine' : ''}`, role: 'listitem' }, h('span', { class: 'w', text: bits.filter(Boolean).join(' · ') }),
        n.saw || null, n.next ? [h('b', { text: `${n.saw ? '\n' : ''}Next: ` }), n.next] : null);
    });
    notes.replaceChildren(...(rows.length ? rows : [h('div', { class: 'cdc-note', role: 'listitem' }, h('span', { class: 'w', text: 'No notes yet.' }))]));
  }
  function pick(k) {
    liked = liked === k ? null : k;
    for (const b of chips) b.setAttribute('aria-pressed', String(b.dataset.liked === liked));
  }
  function save() {
    const p = P[days[di].posts[pi]];
    const s = saw.value.trim(); const n = nxt.value.trim();
    if (!s && !n && !liked) { ok.textContent = 'Write something first.'; return; }
    p.notes.push({ mine: true, liked, saw: s, next: n });
    saw.value = ''; nxt.value = ''; pick(null);
    ok.textContent = 'Kept in this page only. Nothing was sent anywhere, and it is gone when you leave.';
    show();
  }

  render();
  show();
  return { destroy() { io?.disconnect(); } };
}
