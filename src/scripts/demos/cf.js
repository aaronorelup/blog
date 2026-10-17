// Two small demos for AO-057 (who-visits-a-new-website.md), mounted by <ao-demo name="cf" part="…">:
//
//   you    asks Cloudflare's edge what it saw of this visit (/cdn-cgi/trace, which every site
//          Cloudflare serves answers), lays it beside the post's own numbers, and walks the
//          reader through the funnel above to see where their visit lands
//   count  the post's live reader counter: one read per browser per day, sent after the page has
//          been visible for a few seconds, kept in D1 by the site's Worker (worker/reads.js);
//          the post's slug comes from the element's data-slug
//
// The numbers quoted here are the post's own: Cloudflare's analytics for aaronorelup.com, 18 Sep
// to 17 Oct 2026, read through the GraphQL connection on 17 Oct.
import '../../styles/demos/cf.css';

const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v);
  }
  for (const kid of kids) if (kid !== null && kid !== undefined && kid !== false) el.append(kid);
  return el;
};
const fmt = (n) => Number(n).toLocaleString('en-US');
const regionName = (() => {
  let dn = null;
  try { dn = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) { /* old browser */ }
  return (code) => {
    if (!code || code === 'XX') return 'Unknown';
    if (code === 'T1') return 'Tor';
    try { return (dn && dn.of(code)) || code; } catch (e) { return code; }
  };
})();

// ---------------------------------------------------------------------------------------------
// you

// Requests per country, 18 Sep - 17 Oct 2026 (httpRequestsAdaptiveGroups by clientCountryName).
const COUNTRY = {
  US: 32112, NL: 7436, DE: 1867, JP: 1599, SG: 1465, GB: 1374, BE: 1154, KR: 1129, IN: 1066, FR: 934,
  CA: 829, PL: 750, CN: 563, BR: 485, RU: 410, AU: 276, HK: 261, MX: 253, TW: 168, RO: 141, TR: 126,
  CH: 123, ES: 113, TH: 106, KZ: 99, CL: 98, PS: 81, PE: 80, IT: 70, VN: 68, SE: 67, BD: 66, UZ: 62,
  AR: 61, PH: 57, FI: 53, ID: 52, NG: 51, SI: 50, SA: 49,
};
const ALL = 56384;
const PROTOCOL = { 'http/1.1': 26031, 'http/2': 14714, 'http/3': 15636 };
const pct = (n) => Math.round((n / ALL) * 100) + '%';

// "More than a year out of date" as the funnel used it: older than Chrome or Edge 142, Firefox 144,
// Safari 26 (all of them released between September and November 2025).
function browserOf(ua) {
  let m;
  if ((m = /Edg(?:e|A|iOS)?\/(\d+)/.exec(ua))) return { name: 'Edge', v: +m[1], current: +m[1] >= 142 };
  if ((m = /(?:Firefox|FxiOS)\/(\d+)/.exec(ua))) return { name: 'Firefox', v: +m[1], current: +m[1] >= 144 };
  if ((m = /SamsungBrowser\/(\d+)/.exec(ua))) return { name: 'Samsung Internet', v: +m[1], current: +m[1] >= 28 };
  if ((m = /(?:Chrome|CriOS)\/(\d+)/.exec(ua))) return { name: 'Chrome', v: +m[1], current: +m[1] >= 142 };
  if ((m = /Version\/(\d+)[\d.]*.*Safari/.exec(ua))) return { name: 'Safari', v: +m[1], current: +m[1] >= 26 };
  return null;
}

function beaconState() {
  try {
    if (window.__cfBeacon) return 'ran';
    if (performance.getEntriesByType('resource').some((e) => /cloudflareinsights\.com\/beacon/.test(e.name))) return 'ran';
  } catch (e) { /* no resource timing */ }
  return document.querySelector('script[src*="cloudflareinsights.com/beacon"]') ? 'blocked' : 'absent';
}

function you(root) {
  root.append(
    h('p', { class: 'cfd-eyebrow', text: 'Ask Cloudflare about your visit' }),
    h('p', { class: 'cfd-lede' },
      'Any site Cloudflare serves will tell its own pages what the edge saw of a visit, at ',
      h('code', { text: '/cdn-cgi/trace' }), '. Nothing below is sent anywhere or kept.'),
  );
  const go = h('button', { type: 'button', class: 'cfd-go', text: 'Show what Cloudflare saw of me' });
  const out = h('div', { class: 'cfd-out', 'aria-live': 'polite' });
  root.append(go, out);
  let ctl = null;

  go.addEventListener('click', async () => {
    go.disabled = true;
    out.replaceChildren(h('p', { class: 'cfd-note', text: 'Asking…' }));
    ctl = new AbortController();
    let t = null;
    try {
      const r = await fetch('/cdn-cgi/trace', { cache: 'no-store', signal: ctl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      t = Object.fromEntries((await r.text()).trim().split('\n').map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i), l.slice(i + 1)];
      }));
      if (!t.ip) throw new Error('no trace');
    } catch (e) {
      out.replaceChildren(h('p', { class: 'cfd-note' }, ctl.signal.aborted ? 'Stopped.'
        : 'The trace only answers on aaronorelup.com itself, where Cloudflare sits in front of the page. (' + ((e && e.message) || e) + ')'));
      go.disabled = false;
      return;
    }
    go.textContent = 'Ask again';
    go.disabled = false;
    render(t);
  });

  function render(t) {
    const rows = h('dl', { class: 'cfd-trace' });
    const row = (k, v, note) => rows.append(h('div', {}, h('dt', { text: k }), h('dd', {}, h('b', {}, v), note ? h('span', { text: note }) : null)));
    const c = (t.loc || '').toUpperCase();
    row('Country', regionName(c), COUNTRY[c]
      ? fmt(COUNTRY[c]) + ' of my ' + fmt(ALL) + ' requests in 30 days came from there (' + pct(COUNTRY[c]) + ').'
      : 'Fewer than 50 of my requests a month come from there.');
    row('Data centre', t.colo || '?', 'The Cloudflare location that answered you, named for its nearest airport.');
    const proto = (t.http || '').toLowerCase();
    row('Protocol', proto.toUpperCase(), PROTOCOL[proto]
      ? pct(PROTOCOL[proto]) + ' of my requests used it. Scripts and bots mostly still speak HTTP/1.1 (' + pct(PROTOCOL['http/1.1']) + ').'
      : '');
    row('Encryption', (t.tls || '?').replace('TLSv', 'TLS '), t.kex ? 'Key exchange ' + t.kex + '.' : '');
    const b = browserOf(t.uag || navigator.userAgent);
    row('Browser', b ? b.name + ' ' + b.v : 'Not one I recognise',
      b ? (b.current ? 'Less than a year old, so you pass the out-of-date filter in the funnel above.'
        : 'More than a year old: the funnel above counts browsers this old as probably bots.') : '');
    const ip = t.ip || '';
    const masked = ip.includes(':') ? ip.split(':').slice(0, 2).join(':') + ':••••' : ip.split('.').slice(0, 2).join('.') + '.•••.•••';
    const ipVal = h('span', { text: masked });
    const show = h('button', { type: 'button', class: 'cfd-show', text: 'show' });
    show.addEventListener('click', () => { ipVal.textContent = ipVal.textContent === ip ? masked : ip; show.textContent = ipVal.textContent === ip ? 'hide' : 'show'; });
    rows.append(h('div', {}, h('dt', { text: 'IP address' }), h('dd', {}, h('b', {}, ipVal, ' ', show),
      h('span', { text: 'What made you one “unique visitor” today. The analytics API will give it to me in a query, which is how I found my own visits; the dashboards, this post and the counter below never show or keep it.' }))));
    if (t.warp === 'on' || t.warp === 'plus') row('WARP', 'on', 'You reach the web through Cloudflare’s own VPN, so your country is the exit’s, not yours.');

    // The funnel, applied to this visit.
    const ua = t.uag || navigator.userAgent;
    const automated = navigator.webdriver || /HeadlessChrome|PhantomJS|Electron.*Headless/i.test(ua);
    const botName = /bot|crawl|spider|slurp|fetch(er)?\b/i.test(ua);
    const beacon = beaconState();
    const steps = [
      ['Me and my agents', null, 'Not unless you are me.'],
      ['Bots that say so', !botName, botName ? 'Your browser names itself a bot.' : 'Your browser doesn’t call itself a bot.'],
      ['Scanners that missed', true, 'You asked for a page that exists.'],
      ['Scripts and headless browsers', !automated, automated ? 'Your browser reports that it is automated.' : 'A real browser, not driven by a script.'],
      ['Browsers a year out of date', b ? b.current : null, b ? (b.current ? 'Yours is current.' : b.name + ' ' + b.v + ' is older than that.') : 'Can’t tell from your browser’s name.'],
      ['Ran Cloudflare’s analytics script', beacon === 'ran' ? true : beacon === 'blocked' ? false : null,
        beacon === 'ran' ? 'It loaded and reported this visit: you are in the ~290.'
          : beacon === 'blocked' ? 'Something stopped it (an ad blocker, a privacy setting): Web Analytics can’t see you, which is why the ~290 undercounts people.'
            : 'It isn’t on this copy of the page.'],
    ];
    const list = h('ol', { class: 'cfd-steps' });
    let out1 = null;
    for (const [name, pass, why] of steps) {
      const mark = pass === true ? '✓' : pass === false ? '✗' : '–';
      list.append(h('li', { class: pass === false ? 'is-out' : pass === true ? 'is-in' : '' },
        h('span', { class: 'cfd-mark', 'aria-hidden': 'true', text: mark }),
        h('b', { text: name }), ' ', h('span', { text: why })));
      if (pass === false && !out1 && name !== 'Ran Cloudflare’s analytics script') out1 = name;
    }
    const verdict = out1 ? 'The funnel would file you under “' + out1 + '”.'
      : beacon === 'blocked' ? 'You count as one of the people, in the gap between the two estimates: the one Cloudflare’s script can’t see.'
        : 'You count as one of the people.';
    out.replaceChildren(rows, h('p', { class: 'cfd-sub', text: 'Where this visit lands in the funnel' }), list, h('p', { class: 'cfd-verdict', text: verdict }));
  }

  return { destroy: () => ctl?.abort() };
}

// ---------------------------------------------------------------------------------------------
// count

const today = () => new Date().toISOString().slice(0, 10);
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const dayLabel = (d) => DAY.format(new Date(d + 'T00:00:00Z'));

function count(root, slug) {
  root.classList.add('cfd-count');
  const big = h('span', { class: 'cfd-big', text: '…' });
  const since = h('span', { class: 'cfd-since', text: 'reads, counted live' });
  const spark = h('div', { class: 'cfd-spark', 'aria-hidden': 'true' });
  const where = h('p', { class: 'cfd-where' });
  const me = h('p', { class: 'cfd-me', 'aria-live': 'polite', text: 'A read counts after a few seconds on the page.' });
  const again = h('button', { type: 'button', class: 'cfd-show', text: 'refresh' });
  root.append(
    h('p', { class: 'cfd-eyebrow', text: 'This post’s readers, counted live' }),
    h('div', { class: 'cfd-head' }, big, since),
    spark, where, me,
    h('p', { class: 'cfd-foot' },
      'Kept per read: this post, the day, the country Cloudflare saw. Not kept: your IP address, your browser, a cookie. One read per browser per day; automated browsers and anything calling itself a bot are skipped. ',
      again),
  );

  let alive = true;
  let timer = null;
  const ctl = new AbortController();

  async function load() {
    try {
      const r = await fetch('/api/reads?slug=' + encodeURIComponent(slug), { cache: 'no-store', signal: ctl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      if (!alive) return;
      big.textContent = fmt(d.total);
      since.textContent = (d.total === 1 ? 'read' : 'reads') + (d.first ? ' since ' + dayLabel(d.first) : '') + ' · ' + fmt(d.today) + ' today';
      // One bar per day from the first read (at most the last 30), empty days included.
      const byDay = new Map((d.days || []).map((x) => [x.day, x.n]));
      const end = new Date(today() + 'T00:00:00Z');
      let start = new Date((d.first || today()) + 'T00:00:00Z');
      if ((end - start) / 864e5 > 29) start = new Date(end - 29 * 864e5);
      const bars = [];
      for (let t = start; t <= end; t = new Date(+t + 864e5)) bars.push([t.toISOString().slice(0, 10), byDay.get(t.toISOString().slice(0, 10)) || 0]);
      const max = Math.max(1, ...bars.map((x) => x[1]));
      spark.replaceChildren(...bars.map(([day, n]) => {
        const bar = h('span', { title: dayLabel(day) + ': ' + fmt(n) });
        bar.style.height = Math.max(n ? 8 : 2, (n / max) * 100) + '%';
        return bar;
      }));
      const cs = (d.countries || []).map((c) => regionName(c.country) + ' ' + fmt(c.n));
      where.textContent = cs.length ? 'From ' + cs.join(' · ') : '';
    } catch (e) {
      if (!alive || ctl.signal.aborted) return;
      big.textContent = '–';
      since.textContent = 'the counter isn’t reachable from here';
      me.textContent = 'It lives on aaronorelup.com, in the site’s Worker; a copy of this page anywhere else can’t reach it.';
    }
  }

  async function send() {
    if (!alive) return;
    const ua = navigator.userAgent;
    if (navigator.webdriver || /HeadlessChrome|bot|crawl|spider/i.test(ua)) {
      me.textContent = 'Not counted: this browser says it is automated.';
      return;
    }
    let seen = null;
    try { seen = localStorage.getItem('ao-read:' + slug); } catch (e) { /* storage blocked */ }
    if (seen === today()) {
      me.textContent = 'You were counted earlier today. One read per browser per day.';
      return;
    }
    try {
      const r = await fetch('/api/reads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
        keepalive: true,
        signal: ctl.signal,
      });
      if (r.status === 204) {
        try { localStorage.setItem('ao-read:' + slug, today()); } catch (e) { /* counted, just not remembered */ }
        me.textContent = 'You were counted just now: you’re in the number above.';
        load();
      } else if (r.status === 429) {
        me.textContent = 'Not counted: too many reads from your address in the last minute.';
      } else {
        me.textContent = 'Not counted: the counter said ' + r.status + '.';
      }
    } catch (e) {
      if (alive && !ctl.signal.aborted) me.textContent = 'Not counted: the counter isn’t reachable from here.';
    }
  }

  // A read is a page that stayed in front of someone for a few seconds, not a prerender, a tab
  // opened in the background or a bounce.
  const arm = () => {
    clearTimeout(timer);
    if (document.visibilityState === 'visible') timer = setTimeout(send, 4000);
  };
  document.addEventListener('visibilitychange', arm);
  again.addEventListener('click', load);
  load();
  arm();

  return {
    destroy() {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', arm);
      ctl.abort();
    },
  };
}

export function mount(host, part) {
  const slug = host.dataset.slug || (location.pathname.match(/^\/ledger\/([^/]+)\/?$/) || [])[1] || '';
  if (part !== 'you' && !(part === 'count' && slug)) return null;
  const root = h('div', { class: 'cfd' });
  host.replaceChildren(root);
  return part === 'you' ? you(root) : count(root, slug);
}
