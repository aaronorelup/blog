// Custom elements that posts can use from plain Markdown (raw HTML is allowed there).
// A post reaches readers two ways: its own /ledger/<slug>/ page, and the homepage panel,
// where openPost() copies the article in with innerHTML. Scripts inside that HTML never run,
// so behaviour lives here as custom elements: PostView loads this module on the standalone
// page and openPost() imports it on the homepage, and the browser upgrades the tags either way.
// The stylesheet is imported by this module, so it reaches both surfaces with it.
//
//   <ao-shots> <video …></video> <ol><li data-t="0:05.4"><img …>Label</li></ol> <figcaption>…
//   <ao-demo name="synthid" part="tournament"> fallback text </ao-demo>
//   <ao-series avg="7"> <table>day, then one column per series</table> <ol><li data-d="2026-09-30">…</li></ol> <figcaption>…
//   <ao-funnel unit="pages"> <ol><li><b>Label</b> <data value="-1634">−1,634</data> note <ul>…</ul></li></ol> <figcaption>…
//   <ao-ask> <details data-via="Connection" data-tool="tool"><summary>Question</summary><pre>call</pre><p>answer</p></details> …
//
// Two behaviours need no tag at all and apply to every post: one player at a time and the image viewer (every
// picture in a post opens full size, zooms and pages through the post's other pictures). They live in
// src/elements/_core/, and enhance() in src/elements/enhance.js; the elements below move to src/elements/ one by one.
// Usage notes: docs/COMPONENTS.md.
import '../styles/post-components.css';
import { AO_LISTEN_PLAY, claim } from '../elements/_core/player.js';
import { openViewer } from '../elements/_core/viewer.js';
import { fmtTime } from '../elements/_lib/time.js';
import { enhance } from '../elements/enhance.js';

// The standalone page runs it by itself; the homepage calls it after it swaps a post in.
export { enhance };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhance());
else enhance();

// ---------------------------------------------------------------------------------------
// <ao-fetch>: HTTP requests the reader sends from their own browser, with the answer shown as
// it arrives: status, the headers that matter, bytes received and time taken. For posts where
// the claim is about what a server does, so the reader can check it live instead of trusting
// a pasted curl. Same-origin only (the site's own files); nothing is sent until a click.
// Children: an <ol> of <li data-url="/path" data-range="bytes=a-b"> (data-range optional,
// data-method="HEAD" optional) whose text is the label, then an optional <figcaption>.
// A body is counted, not kept, and reading stops at cap bytes (default 2 MB): an ignored
// Range on a 25 MB video then costs the reader 2 MB, and the row says where it stopped.
// data-show="body" on a row also prints the body (its first 4 KB, JSON indented) for small
// text answers worth reading, like /version.json.
const FETCH_HEADERS = ['content-range', 'content-length', 'accept-ranges', 'content-type'];
// HTTP/2 carries no reason phrase, so res.statusText is empty there; these are the usual ones.
const STATUS_TEXT = { 200: 'OK', 206: 'Partial Content', 304: 'Not Modified', 404: 'Not Found', 416: 'Range Not Satisfiable' };
const fmtBytes = (n) => (n < 10000 ? n.toLocaleString('en-US') + ' bytes'
  : n < 1e6 ? (n / 1000).toFixed(1) + ' KB' : (n / 1e6).toFixed(2) + ' MB');
class AoFetch extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > ol > li[data-url]')];
    if (!items.length) return;
    this._ready = true;
    const cap = parseInt(this.getAttribute('cap') || '2000000', 10);
    const rows = items.map((li) => {
      const url = li.dataset.url;
      let same = false;
      try { same = new URL(url, location.href).origin === location.origin; } catch (e) { /* bad url */ }
      const method = (li.dataset.method || 'GET').toUpperCase();
      const range = li.dataset.range || '';
      const showBody = li.dataset.show === 'body';
      const label = li.textContent.trim();
      li.replaceChildren();
      const head = document.createElement('div');
      head.className = 'ao-fetch-head';
      const name = document.createElement('span');
      name.className = 'ao-fetch-label';
      name.textContent = label;
      const go = document.createElement('button');
      go.type = 'button';
      go.textContent = 'Send it';
      go.disabled = !same;
      head.append(name, go);
      const req = document.createElement('pre');
      req.className = 'ao-fetch-req';
      req.textContent = method + ' ' + url + (range ? '\nRange: ' + range : '');
      const out = document.createElement('pre');
      out.className = 'ao-fetch-out';
      out.setAttribute('aria-live', 'polite');
      out.textContent = same ? 'Not sent yet.' : "Only this site's own files can be requested.";
      li.append(head, req, out);
      let busy = false;
      const run = async () => {
        if (!same || busy) return;
        busy = true;
        go.disabled = true;
        out.textContent = 'Sending…';
        out.classList.remove('ao-fetch-ok', 'ao-fetch-whole');
        const t0 = performance.now();
        const ctl = new AbortController();
        this._ctl = ctl;
        try {
          const headers = range ? { Range: range } : {};
          const res = await fetch(url, { method, headers, cache: 'no-store', signal: ctl.signal });
          const lines = ['HTTP ' + res.status + ' ' + (res.statusText || STATUS_TEXT[res.status] || '')];
          for (const h of FETCH_HEADERS) {
            const v = res.headers.get(h);
            if (v) lines.push(h.replace(/(^|-)\w/g, (m) => m.toUpperCase()) + ': ' + v);
          }
          let got = 0;
          let stopped = false;
          const kept = [];
          if (res.body && method !== 'HEAD') {
            const reader = res.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (showBody && got < 4096) kept.push(value.slice(0, 4096 - got));
              got += value.byteLength;
              if (got >= cap) { stopped = true; reader.cancel().catch(() => {}); break; }
            }
          }
          if (showBody && kept.length) {
            let text = new TextDecoder().decode(await new Blob(kept).arrayBuffer());
            try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { /* not JSON, or cut short */ }
            lines.push('', text.trimEnd() + (got > 4096 ? '\n…' : ''));
          }
          const ms = Math.round(performance.now() - t0);
          lines.push('');
          lines.push(method === 'HEAD' ? 'No body asked for.'
            : 'Received: ' + fmtBytes(got) + (stopped ? ' (stopped reading here; the server was still sending)' : ''));
          lines.push('Time: ' + ms + ' ms');
          if (range && res.status === 200) lines.push('The Range header was ignored: this is the whole file.');
          out.textContent = lines.join('\n');
          out.classList.add(res.status === 206 || (showBody && !range && res.ok) ? 'ao-fetch-ok' : 'ao-fetch-whole');
        } catch (e) {
          out.textContent = ctl.signal.aborted ? 'Stopped.' : 'The request failed: ' + ((e && e.message) || e);
        } finally {
          busy = false;
          go.disabled = false;
          go.textContent = 'Send it again';
        }
      };
      go.addEventListener('click', run);
      return run;
    });
    if (rows.length > 1) {
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'ao-fetch-all';
      all.textContent = 'Send all ' + rows.length;
      all.addEventListener('click', async () => { for (const run of rows) await run(); });
      this.querySelector(':scope > ol').before(all);
    }
    this.classList.add('ao-fetch-ready');
  }

  disconnectedCallback() {
    // The homepage swaps posts out; don't keep reading a body nobody will see.
    this._ctl?.abort();
  }
}

// ---------------------------------------------------------------------------------------
// <ao-bars>: a bar chart drawn from a plain <table>, so the numbers are written once and a reader
// without JS (or with a screen reader) still gets the table. The first column labels the rows;
// every other column is a series, named by its <th>. One shared scale per chart.
//   max="N"     the value a full-width bar stands for (default: the largest value). Give two
//               charts the same max to put them on the same scale.
//   unit="…"    printed after each value ("lessons", "%")
// A direct child <figcaption> captions the chart. Cells that aren't numbers draw no bar.

class AoBars extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const head = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    const rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const cells = [...tr.children];
      return {
        label: cells[0]?.textContent.trim() || '',
        values: cells.slice(1).map((c) => {
          const n = parseFloat(c.textContent.replace(/[^0-9.\-]/g, ''));
          return Number.isFinite(n) ? n : null;
        }),
      };
    });
    if (!rows.length) return;
    this._ready = true;
    const series = Math.max(...rows.map((r) => r.values.length));
    const all = rows.flatMap((r) => r.values).filter((v) => v !== null);
    const max = parseFloat(this.getAttribute('max')) || Math.max(...all, 0) || 1;
    const unit = this.getAttribute('unit') || '';

    const chart = document.createElement('div');
    chart.className = 'ao-bars-chart';
    chart.setAttribute('aria-hidden', 'true');
    if (series > 1) {
      const legend = document.createElement('div');
      legend.className = 'ao-bars-legend';
      for (let k = 0; k < series; k++) {
        const item = document.createElement('span');
        item.className = 'ao-bars-key ao-bars-s' + (k % 4);
        item.textContent = head[k + 1] || 'Series ' + (k + 1);
        legend.append(item);
      }
      chart.append(legend);
    }
    for (const r of rows) {
      const row = document.createElement('div');
      row.className = 'ao-bars-row';
      const label = document.createElement('span');
      label.className = 'ao-bars-label';
      label.textContent = r.label;
      const track = document.createElement('div');
      track.className = 'ao-bars-track';
      r.values.forEach((v, k) => {
        const line = document.createElement('div');
        line.className = 'ao-bars-line';
        const bar = document.createElement('span');
        bar.className = 'ao-bars-bar ao-bars-s' + (k % 4);
        bar.style.setProperty('--w', v === null ? '0' : String(Math.max(0, Math.min(1, v / max))));
        const val = document.createElement('span');
        val.className = 'ao-bars-val';
        val.textContent = v === null ? '' : v.toLocaleString('en-US') + (unit ? ' ' + unit : '');
        line.append(bar, val);
        track.append(line);
      });
      row.append(label, track);
      chart.append(row);
    }
    table.classList.add('ao-bars-table');
    table.before(chart);
    this.classList.add('ao-bars-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-shots>: a video with its shots laid out as a strip of thumbnails underneath, so a reader
// can see the whole edit at a glance and jump to any shot. For reels, trailers, films, cuts.
// Children: one <video>, then an <ol> whose <li data-t="m:ss.xx"> each hold an <img> (the shot's
// thumbnail) and a short label, then an optional <figcaption>. The shot being played is lit and
// kept in view inside the strip (never by scrolling the page); clicking one plays from there.
// Arrow keys move along the strip. Without JS: the video, then the thumbnails as a plain list.
const shotTime = (v) => {
  const p = String(v || '').trim().split(':').map(Number);
  return !p.length || p.some((n) => !isFinite(n)) ? NaN : p.reduce((a, n) => a * 60 + n, 0);
};
class AoShots extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const video = this.querySelector(':scope > video');
    const list = this.querySelector(':scope > ol');
    if (!video || !list) return;
    this._ready = true;
    const shots = [];
    for (const li of list.querySelectorAll(':scope > li')) {
      const t = shotTime(li.dataset.t);
      if (!isFinite(t)) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ao-shots-btn';
      while (li.firstChild) b.append(li.firstChild);
      const at = document.createElement('span');
      at.className = 'ao-shots-at';
      const m = Math.floor(t / 60), sec = t - m * 60;
      at.textContent = m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1);
      b.append(at);
      b.title = 'Play from ' + at.textContent;
      li.append(b);
      shots.push({ t, li, b });
    }
    if (!shots.length) return;
    shots.sort((a, z) => a.t - z.t);
    list.classList.add('ao-shots-strip');
    const go = (s) => {
      video.currentTime = s.t + 0.02;
      video.play().catch(() => {});
    };
    shots.forEach((s, i) => {
      s.b.addEventListener('click', () => go(s));
      s.b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        shots[Math.min(shots.length - 1, Math.max(0, i + (e.key === 'ArrowLeft' ? -1 : 1)))].b.focus();
      });
    });
    let lit = null;
    const show = () => {
      const now = video.currentTime;
      let cur = shots[0];
      for (const s of shots) if (s.t <= now + 0.01) cur = s;
      if (cur === lit) return;
      if (lit) { lit.li.classList.remove('is-current'); lit.b.removeAttribute('aria-current'); }
      lit = cur;
      cur.li.classList.add('is-current');
      cur.b.setAttribute('aria-current', 'true');
      // Keep the lit shot in view inside the strip only; scrollIntoView would move the page.
      const l = cur.li.offsetLeft - list.offsetLeft, r = l + cur.li.offsetWidth;
      if (l < list.scrollLeft || r > list.scrollLeft + list.clientWidth) {
        list.scrollTo({ left: Math.max(0, l - (list.clientWidth - cur.li.offsetWidth) / 2), behavior: 'smooth' });
      }
    };
    for (const ev of ['timeupdate', 'seeked', 'loadedmetadata']) video.addEventListener(ev, show);
    show();
    this.classList.add('ao-shots-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-blind>: rows of outputs made from the same brief (one row per prompt, one figure per
// model, agent or setting), shown labelled, with a "Judge blind" button. Blind, each row is
// shuffled, every caption is hidden and the pictures stop opening the viewer (its caption would
// give the answer away); the reader picks one per row, then Reveal puts the labels back, marks
// the picks and counts them. A figure with data-verdict="…" carries someone else's pick (a
// judge agent, a reviewer), shown on reveal and compared with the reader's.
// Children: <div data-row="Row title"> each holding <figure>s (an <img> and a <figcaption>
// whose <b> is the label), then an optional <figcaption> for the set.
//   aspect="w/h"  the frame every picture is fitted into (default 4/3)
// Without JS the rows are plain figures with their captions.
class AoBlind extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const rows = [...this.querySelectorAll(':scope > div')].map((el) => ({
      el,
      figs: [...el.querySelectorAll(':scope > figure')],
      pick: null,
    })).filter((r) => r.figs.length > 1);
    if (!rows.length) return;
    this._ready = true;
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const labelOf = (f) => f.querySelector('figcaption b')?.textContent.trim() || '?';

    for (const r of rows) {
      r.el.classList.add('ao-blind-row');
      r.el.style.setProperty('--ao-cols', String(r.figs.length));
      const title = r.el.getAttribute('data-row');
      if (title) {
        const h = document.createElement('p');
        h.className = 'ao-blind-title';
        h.textContent = title;
        r.el.prepend(h);
      }
      r.figs.forEach((f) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ao-blind-pick';
        b.addEventListener('click', () => choose(r, f));
        f.append(b);
        f.querySelector('img')?.addEventListener('click', () => {
          if (this.classList.contains('is-blind')) choose(r, f);
        });
      });
    }

    const bar = document.createElement('div');
    bar.className = 'ao-blind-bar';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ao-blind-btn';
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'ao-blind-btn';
    reveal.textContent = 'Reveal';
    const status = document.createElement('p');
    status.className = 'ao-blind-status';
    status.setAttribute('aria-live', 'polite');
    bar.append(toggle, reveal, status);
    this.prepend(bar);

    const picked = () => rows.filter((r) => r.pick).length;
    const choose = (r, f) => {
      if (!this.classList.contains('is-blind')) return;
      r.pick = r.pick === f ? null : f;
      r.figs.forEach((g) => g.classList.toggle('is-picked', g === r.pick));
      paint();
    };
    const paint = () => {
      const blind = this.classList.contains('is-blind');
      toggle.textContent = blind ? 'Show labels' : 'Judge blind';
      reveal.hidden = !blind;
      reveal.disabled = !picked();
      rows.forEach((r) => r.figs.forEach((f, i) => {
        const b = f.querySelector('.ao-blind-pick');
        const letter = String.fromCharCode(65 + Number(f.style.order || i));
        b.textContent = f === r.pick ? 'Picked ' + letter : 'Pick ' + letter;
        b.setAttribute('aria-pressed', String(f === r.pick));
      }));
      if (blind) status.textContent = 'Pick one in each row, then Reveal. ' + picked() + ' of ' + rows.length + ' picked.';
    };
    const shuffle = (n) => {
      const a = [...Array(n).keys()];
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const imgs = () => [...this.querySelectorAll('figure img')];
    toggle.addEventListener('click', () => {
      const blind = !this.classList.contains('is-blind');
      this.classList.remove('is-revealed');
      this.classList.toggle('is-blind', blind);
      for (const r of rows) {
        r.pick = null;
        const order = shuffle(r.figs.length);
        r.figs.forEach((f, i) => {
          f.classList.remove('is-picked');
          f.style.order = blind ? String(order[i]) : '';
          f.querySelector('.ao-blind-verdict')?.remove();
        });
      }
      // Blind, a click picks; the viewer would show the caption, so it is switched off.
      for (const img of imgs()) {
        if (blind) img.setAttribute('data-no-zoom', '');
        else img.removeAttribute('data-no-zoom');
      }
      if (!blind) status.textContent = '';
      paint();
    });
    reveal.addEventListener('click', () => {
      this.classList.remove('is-blind');
      this.classList.add('is-revealed');
      for (const img of imgs()) img.removeAttribute('data-no-zoom');
      const tally = new Map();
      let agree = 0, judged = 0;
      for (const r of rows) {
        const ref = r.figs.find((f) => f.hasAttribute('data-verdict'));
        if (ref) {
          const v = document.createElement('span');
          v.className = 'ao-blind-verdict';
          v.textContent = ref.getAttribute('data-verdict');
          ref.append(v);
        }
        if (!r.pick) continue;
        tally.set(labelOf(r.pick), (tally.get(labelOf(r.pick)) || 0) + 1);
        if (ref) { judged++; if (ref === r.pick) agree++; }
      }
      const parts = [...tally].sort((a, b) => b[1] - a[1]).map(([k, n]) => k + ' ' + n);
      status.textContent = 'Your picks: ' + parts.join(' · ') + '.' +
        (judged ? ' You agreed with the marked pick in ' + agree + ' of ' + judged + ' rows.' : '');
      reveal.hidden = true;
      toggle.textContent = 'Judge blind again';
    });
    paint();
    this.classList.add('ao-blind-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-runs>: when each agent of a run (a workflow, a fleet, a night of scheduled jobs) started
// and stopped, drawn on one clock. One lane per phase, in the order phases first appear; agents
// that overlap inside a phase stack, so a fan-out reads as a tall block and a lone agent as a
// thin line. The numbers are written once, as a <table>: label, phase, start, end, where a time
// is a clock time (HH:MM:SS, same day) or m:ss / plain seconds from the start of the run.
//   start="HH:MM"  end="HH:MM"   the axis (default: the first start and the last end)
// Pointing at a bar, or moving along them with the arrow keys, names the agent and its length.
// The table stays for screen readers (visually hidden once drawn); without JS it is the table.
const runTime = (v) => {
  const p = String(v || '').trim().split(':').map(Number);
  if (!p.length || p.some((n) => !isFinite(n))) return NaN;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0];
};
const runSpan = (s) => {
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? h + ' h ' + String(m).padStart(2, '0') + ' min' : m ? m + ' min ' + x + ' s' : x + ' s';
};
class AoRuns extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    // HH:MM and m:ss look alike. The table is on a clock when any start is HH:MM:SS, or when
    // the element has a start= attribute; otherwise two-part times are m:ss from the start.
    const clock = this.hasAttribute('start') ||
      [...table.querySelectorAll('tbody td:nth-child(3)')].some((td) => td.textContent.trim().split(':').length === 3);
    const parse = (v) => {
      const p = String(v || '').trim().split(':');
      if (clock && p.length === 2) return runTime(v) * 60;
      return runTime(v);
    };
    const runs = [];
    for (const tr of table.querySelectorAll('tbody tr')) {
      const c = [...tr.children].map((td) => td.textContent.trim());
      const s = parse(c[2]), e = parse(c[3]);
      if (!isFinite(s) || !isFinite(e) || e < s) continue;
      runs.push({ label: c[0], phase: c[1] || '', s, e, raw: [c[2], c[3]] });
    }
    if (!runs.length) return;
    this._ready = true;
    let t0 = Math.min(...runs.map((r) => r.s)), t1 = Math.max(...runs.map((r) => r.e));
    if (this.hasAttribute('start')) t0 = Math.min(t0, parse(this.getAttribute('start')));
    if (this.hasAttribute('end')) t1 = Math.max(t1, parse(this.getAttribute('end')));
    const span = Math.max(1, t1 - t0);
    const pct = (t) => ((t - t0) / span) * 100;
    const fmt = (t) => {
      if (!clock) return runSpan(t - t0).replace(' 0 s', '');
      const h = Math.floor(t / 3600) % 24, m = Math.floor((t % 3600) / 60);
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    };

    const phases = [];
    for (const r of runs) if (!phases.includes(r.phase)) phases.push(r.phase);

    const chart = document.createElement('div');
    chart.className = 'ao-runs-chart';
    const sum = document.createElement('p');
    sum.className = 'ao-runs-sum';
    sum.textContent = runs.length + (runs.length === 1 ? ' agent' : ' agents') +
      (phases.length > 1 ? ' · ' + phases.length + ' phases' : '') + ' · ' + runSpan(span);
    chart.append(sum);

    // Axis ticks at a round step that gives four to eight marks.
    const steps = [60, 120, 300, 600, 900, 1800, 3600, 7200];
    const step = steps.find((st) => span / st <= 8) || 7200;
    const axis = document.createElement('div');
    axis.className = 'ao-runs-row ao-runs-axisrow';
    axis.innerHTML = '<span class="ao-runs-lane"></span>';
    const ticks = document.createElement('div');
    ticks.className = 'ao-runs-axis';
    for (let t = Math.ceil(t0 / step) * step; t <= t1; t += step) {
      const k = document.createElement('span');
      k.className = 'ao-runs-tick';
      k.style.left = pct(t) + '%';
      k.textContent = fmt(t);
      ticks.append(k);
    }
    axis.append(ticks);
    chart.append(axis);

    const bars = [];
    phases.forEach((ph, pi) => {
      const mine = runs.filter((r) => r.phase === ph).sort((a, z) => a.s - z.s || a.e - z.e);
      // Greedy packing: each agent takes the first sub-row that is free when it starts.
      const ends = [];
      for (const r of mine) {
        let k = ends.findIndex((e) => e <= r.s + 0.5);
        if (k < 0) { k = ends.length; ends.push(0); }
        ends[k] = r.e;
        r.slot = k;
      }
      const from = Math.min(...mine.map((r) => r.s)), to = Math.max(...mine.map((r) => r.e));
      const row = document.createElement('div');
      row.className = 'ao-runs-row';
      const lane = document.createElement('span');
      lane.className = 'ao-runs-lane';
      lane.innerHTML = '<b></b><span></span>';
      lane.firstChild.textContent = ph || '—';
      lane.lastChild.textContent = mine.length + ' · ' + runSpan(to - from);
      const track = document.createElement('div');
      track.className = 'ao-runs-track ao-runs-c' + (pi % 2);
      track.style.setProperty('--slots', String(ends.length));
      for (const r of mine) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ao-runs-bar';
        b.tabIndex = -1;
        b.style.left = pct(r.s) + '%';
        b.style.width = Math.max(0.35, pct(r.e) - pct(r.s)) + '%';
        b.style.setProperty('--slot', String(r.slot));
        b.setAttribute('aria-label', r.label + ', ' + (ph ? ph + ', ' : '') + r.raw[0] + ' to ' + r.raw[1] + ', ' + runSpan(r.e - r.s));
        r.b = b;
        track.append(b);
        bars.push(r);
      }
      row.append(lane, track);
      chart.append(row);
    });

    const read = document.createElement('p');
    read.className = 'ao-runs-read';
    read.setAttribute('aria-live', 'polite');
    const idle = 'Point at a bar, or focus the chart and use the arrow keys, to name an agent.';
    read.textContent = idle;
    chart.append(read);

    bars.sort((a, z) => a.s - z.s || a.e - z.e);
    let on = null;
    const pick = (r) => {
      if (on) on.b.classList.remove('is-on');
      on = r;
      if (!r) { read.textContent = idle; return; }
      r.b.classList.add('is-on');
      read.textContent = '';
      const b = document.createElement('b');
      b.textContent = r.label;
      read.append(b, ' ' + (r.phase ? r.phase + ' · ' : '') + r.raw[0] + '–' + r.raw[1] + ' · ' + runSpan(r.e - r.s));
    };
    bars[0].b.tabIndex = 0;
    bars.forEach((r, i) => {
      r.b.addEventListener('pointerenter', () => pick(r));
      r.b.addEventListener('focus', () => {
        for (const o of bars) o.b.tabIndex = o === r ? 0 : -1;
        pick(r);
      });
      r.b.addEventListener('click', () => pick(r));
      r.b.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        const j = e.key === 'Home' ? 0 : e.key === 'End' ? bars.length - 1 : d ? i + d : -1;
        if (j < 0 || j >= bars.length) return;
        e.preventDefault();
        bars[j].b.focus();
      });
    });
    chart.addEventListener('pointerleave', () => { if (!chart.contains(document.activeElement)) pick(null); });

    table.classList.add('ao-runs-table');
    table.before(chart);
    this.classList.add('ao-runs-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-calc>: a calculator the reader can turn, for a post whose numbers depend on choices
// (how many minutes, how many takes per keeper, which size). Children: a <ul> of inputs, an
// <ol> of results, an optional <figcaption>.
//   <li data-var="mins" data-min="1" data-max="60" data-step="1" data-value="10">Label</li>
//     a slider; data-unit is printed after its value
//   <li data-var="size" data-options="736×416:7|1344×768:19" data-value="1344×768">Label</li>
//     one button per option; the variable takes the number after the colon
//   <li data-f="mins / 60 * size * 1.09" data-prefix="$" data-unit="per run" data-digits="2">Label</li>
//     a result: + - * / ^, parentheses, min max round ceil floor abs, and the variables above
// Without JS the labels stay as two plain lists, so the caption should carry one worked example.
const calcFns = { min: Math.min, max: Math.max, round: Math.round, ceil: Math.ceil, floor: Math.floor, abs: Math.abs };
function calcCompile(src) {
  const toks = String(src).match(/\d+\.?\d*|\.\d+|[A-Za-z_]\w*|[-+*/^(),]/g) || [];
  let i = 0;
  const peek = () => toks[i];
  const eat = (t) => { if (toks[i] !== t) throw new Error('ao-calc: expected ' + t + ' in ' + src); i++; };
  const primary = () => {
    const t = toks[i++];
    if (t === undefined) throw new Error('ao-calc: unexpected end of ' + src);
    if (t === '(') { const e = expr(); eat(')'); return e; }
    if (t === '-') { const e = power(); return (v) => -e(v); }
    if (/^[\d.]/.test(t)) { const n = parseFloat(t); return () => n; }
    if (calcFns[t] && peek() === '(') {
      eat('(');
      const args = [expr()];
      while (peek() === ',') { i++; args.push(expr()); }
      eat(')');
      return (v) => calcFns[t](...args.map((a) => a(v)));
    }
    if (/^[A-Za-z_]/.test(t)) return (v) => (t in v ? v[t] : NaN);
    throw new Error('ao-calc: unexpected ' + t + ' in ' + src);
  };
  const power = () => {
    const b = primary();
    if (peek() !== '^') return b;
    i++;
    const e = power();
    return (v) => Math.pow(b(v), e(v));
  };
  const term = () => {
    let a = power();
    while (peek() === '*' || peek() === '/') {
      const op = toks[i++], l = a, r = power();
      a = op === '*' ? (v) => l(v) * r(v) : (v) => l(v) / r(v);
    }
    return a;
  };
  const expr = () => {
    let a = term();
    while (peek() === '+' || peek() === '-') {
      const op = toks[i++], l = a, r = term();
      a = op === '+' ? (v) => l(v) + r(v) : (v) => l(v) - r(v);
    }
    return a;
  };
  const f = expr();
  if (i < toks.length) throw new Error('ao-calc: unexpected ' + toks[i] + ' in ' + src);
  return f;
}
const calcFmt = (n, digits) => !Number.isFinite(n) ? '–'
  : n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
class AoCalc extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const inputs = [...this.querySelectorAll(':scope > ul > li[data-var]')];
    const outs = [...this.querySelectorAll(':scope > ol > li[data-f]')];
    if (!inputs.length || !outs.length) return;
    this._ready = true;
    const vars = {};
    const box = document.createElement('div');
    box.className = 'ao-calc-box';
    const controls = document.createElement('div');
    controls.className = 'ao-calc-inputs';
    const results = document.createElement('div');
    results.className = 'ao-calc-results';
    results.setAttribute('aria-live', 'polite');
    const update = [];
    const run = () => update.forEach((u) => u());

    inputs.forEach((li, n) => {
      const name = li.dataset.var;
      const label = li.textContent.trim();
      const row = document.createElement('div');
      row.className = 'ao-calc-input';
      const id = 'aocalc-' + Math.random().toString(36).slice(2, 8) + n;
      if (li.dataset.options) {
        const opts = li.dataset.options.split('|').map((o) => {
          const k = o.lastIndexOf(':');
          return { label: o.slice(0, k).trim(), value: parseFloat(o.slice(k + 1)) };
        });
        const cap = document.createElement('span');
        cap.className = 'ao-calc-label';
        cap.id = id;
        cap.textContent = label;
        const group = document.createElement('div');
        group.className = 'ao-calc-opts';
        group.setAttribute('role', 'group');
        group.setAttribute('aria-labelledby', id);
        const start = opts.find((o) => o.label === li.dataset.value) || opts[0];
        vars[name] = start.value;
        for (const o of opts) {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = o.label;
          b.setAttribute('aria-pressed', String(o === start));
          b.addEventListener('click', () => {
            vars[name] = o.value;
            for (const x of group.children) x.setAttribute('aria-pressed', String(x === b));
            run();
          });
          group.append(b);
        }
        row.append(cap, group);
      } else {
        const min = parseFloat(li.dataset.min ?? 0), max = parseFloat(li.dataset.max ?? 100);
        const step = li.dataset.step || 'any';
        const unit = li.dataset.unit || '';
        const cap = document.createElement('label');
        cap.className = 'ao-calc-label';
        cap.htmlFor = id;
        cap.textContent = label;
        const val = document.createElement('output');
        val.className = 'ao-calc-val';
        const range = document.createElement('input');
        range.type = 'range';
        range.id = id;
        range.min = min; range.max = max; range.step = step;
        range.value = li.dataset.value ?? min;
        const show = () => {
          vars[name] = parseFloat(range.value);
          val.textContent = range.value + (unit ? ' ' + unit : '');
        };
        show();
        range.addEventListener('input', () => { show(); run(); });
        row.append(cap, val, range);
      }
      controls.append(row);
    });

    for (const li of outs) {
      let f;
      try { f = calcCompile(li.dataset.f); } catch (e) { console.warn(e.message); f = () => NaN; }
      const digits = parseInt(li.dataset.digits ?? '0', 10);
      const prefix = li.dataset.prefix || '';
      const unit = li.dataset.unit || '';
      const row = document.createElement('div');
      row.className = 'ao-calc-out';
      const label = document.createElement('span');
      label.className = 'ao-calc-label';
      label.textContent = li.textContent.trim();
      const num = document.createElement('span');
      num.className = 'ao-calc-num';
      row.append(label, num);
      results.append(row);
      update.push(() => {
        const v = f(vars);
        num.textContent = prefix + calcFmt(v, digits) + (unit ? ' ' + unit : '');
      });
    }
    run();
    box.append(controls, results);
    this.querySelector(':scope > ul').before(box);
    this.classList.add('ao-calc-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-series>: numbers per day (or per any ordered label) drawn as one column each, from a plain
// <table>, so the figures are written once and the table stays for screen readers and readers
// without JS. The first column is the day (YYYY-MM-DD, read out as "Tue 30 Sep") or any label;
// every other column is a series named by its <th>, and a <th data-unit="MB"> prints its unit.
//   show="Name"  the series drawn first (default: the first); a button per series switches
//   avg="7"      also draws the trailing N-day average as a line over the columns
//   stack        every series stacked in one column per day instead; the legend's buttons hide
//                and show a layer, and the scale follows what is shown
// An optional <ol> of <li data-d="YYYY-MM-DD">…</li> marks days under the axis (a post going up,
// a deploy). Pointing at a day, or focusing the chart and using the arrow keys, reads out every
// series and any marks for that day.
const seriesDay = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
};
// UTC on purpose: the labels are bare dates, and a reader west of UTC must not see them a day early.
// Spelled out by hand because en-GB's short month is "Sept" in some browsers and "Sep" in others.
const SERIES_MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const SERIES_WEEKDAYS = 'Sun Mon Tue Wed Thu Fri Sat'.split(' ');
const SERIES_TICK = { format: (d) => d.getUTCDate() + ' ' + SERIES_MONTHS[d.getUTCMonth()] };
const SERIES_DAY = { format: (d) => SERIES_WEEKDAYS[d.getUTCDay()] + ' ' + SERIES_TICK.format(d) };
const SERIES_AXIS = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const seriesNum = (v) => v.toLocaleString('en-US', { maximumFractionDigits: Math.abs(v) < 100 ? 1 : 0 });
const niceStep = (v) => {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
};
class AoSeries extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const heads = [...table.querySelectorAll('thead th')];
    const names = heads.slice(1).map((th) => th.textContent.trim());
    const units = heads.slice(1).map((th) => th.dataset.unit || '');
    const rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const c = [...tr.children];
      const label = c[0]?.textContent.trim() || '';
      return {
        label,
        date: seriesDay(label),
        v: names.map((_, k) => {
          const n = parseFloat((c[k + 1]?.textContent || '').replace(/[^0-9.\-]/g, ''));
          return Number.isFinite(n) ? n : 0;
        }),
      };
    });
    if (!rows.length || !names.length) return;
    this._ready = true;
    const n = rows.length;
    const stack = this.hasAttribute('stack');
    const avgN = Math.max(0, parseInt(this.getAttribute('avg') || '0', 10));
    const dayName = (r) => (r.date ? SERIES_DAY.format(r.date) : r.label);
    const withUnit = (v, k) => seriesNum(v) + (units[k] ? ' ' + units[k] : '');

    const marks = new Map(); // row index -> the marks on that day
    const at = new Map(rows.map((r, i) => [r.label, i]));
    for (const li of this.querySelectorAll(':scope > ol > li[data-d]')) {
      const i = at.get(li.dataset.d.trim());
      if (i === undefined) continue;
      if (!marks.has(i)) marks.set(i, []);
      marks.get(i).push(li.textContent.trim());
    }

    let shown = Math.max(0, names.indexOf(this.getAttribute('show') || ''));
    const on = names.map(() => true); // stack mode: which layers are drawn
    let active = -1;

    const chart = document.createElement('div');
    chart.className = 'ao-series-chart';
    const top = document.createElement('div');
    top.className = 'ao-series-top';
    top.setAttribute('role', 'group');
    top.setAttribute('aria-label', stack ? 'Layers shown' : 'Series shown');
    const buttons = names.map((name, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = name;
      if (stack) b.className = 'ao-series-key ao-series-s' + (k % 4);
      b.addEventListener('click', () => {
        if (stack) {
          if (on[k] && on.filter(Boolean).length === 1) return; // keep one layer
          on[k] = !on[k];
        } else shown = k;
        draw();
        read();
      });
      top.append(b);
      return b;
    });
    if (names.length > 1 || stack) chart.append(top);

    const body = document.createElement('div');
    body.className = 'ao-series-body';
    const plot = document.createElement('div');
    plot.className = 'ao-series-plot';
    plot.tabIndex = 0;
    plot.setAttribute('role', 'group');
    plot.setAttribute('aria-roledescription', 'chart');
    plot.setAttribute('aria-label', (stack ? names.join(', ') : names.join(' / ')) + ', ' + n + ' days. Arrow keys move between days.');
    const grid = document.createElement('div');
    grid.className = 'ao-series-grids';
    grid.setAttribute('aria-hidden', 'true');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + n + ' 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const hl = document.createElement('div');
    hl.className = 'ao-series-hl';
    hl.style.width = 100 / n + '%';
    plot.append(grid, svg, hl);

    const xs = document.createElement('div');
    xs.className = 'ao-series-x';
    xs.setAttribute('aria-hidden', 'true');
    const ticks = [0];
    rows.forEach((r, i) => { if (i && r.date && r.date.getUTCDate() === 1) ticks.push(i); });
    if (!rows[0].date) for (let i = 1; i < 5; i++) ticks.push(Math.round((i * (n - 1)) / 5));
    ticks.push(n - 1);
    let last = -Infinity;
    ticks.forEach((i, j) => {
      const pct = ((i + 0.5) / n) * 100;
      const end = j === ticks.length - 1;
      if (!end && pct - last < 12) return; // two labels this close would overprint
      if (end && pct - last < 12) {
        // The last day wins over a month label just before it, never over the first label.
        if (xs.children.length > 1) xs.lastChild.remove();
        else return;
      }
      const t = document.createElement('span');
      t.textContent = rows[i].date ? SERIES_TICK.format(rows[i].date) : rows[i].label;
      t.style.left = pct + '%';
      if (j === 0) t.className = 'is-first';
      if (end) t.className = 'is-last';
      xs.append(t);
      last = pct;
    });

    const strip = document.createElement('div');
    strip.className = 'ao-series-marks';
    strip.setAttribute('aria-hidden', 'true');
    const dots = new Map();
    for (const [i, list] of marks) {
      const d = document.createElement('span');
      d.className = 'ao-series-mark' + (list.length > 1 ? ' is-many' : '');
      d.style.left = ((i + 0.5) / n) * 100 + '%';
      strip.append(d);
      dots.set(i, d);
    }
    body.append(plot, xs);
    if (marks.size) body.append(strip);
    chart.append(body);

    const out = document.createElement('p');
    out.className = 'ao-series-read';
    out.setAttribute('aria-live', 'polite');
    chart.append(out);

    let scaleTop = 1;
    const draw = () => {
      buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(stack ? on[k] : k === shown)));
      const keys = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown];
      const tot = rows.map((r) => keys.reduce((a, k) => a + Math.max(0, r.v[k]), 0));
      const max = Math.max(...tot, 0);
      const step = niceStep(max / 4);
      scaleTop = Math.max(step, Math.ceil(max / step) * step);
      grid.replaceChildren();
      for (let g = step; g <= scaleTop + step / 1000; g += step) {
        const line = document.createElement('div');
        line.className = 'ao-series-grid';
        line.style.bottom = (g / scaleTop) * 100 + '%';
        const lab = document.createElement('span');
        // "1K MB" reads badly: with a unit, the number is written out.
        lab.textContent = !stack && units[shown] ? seriesNum(g) + ' ' + units[shown] : SERIES_AXIS.format(g);
        line.append(lab);
        grid.append(line);
      }
      const y = (v) => 100 - (v / scaleTop) * 100;
      let html = '';
      if (stack) {
        rows.forEach((r, i) => {
          let base = 0;
          for (const k of keys) {
            const v = Math.max(0, r.v[k]);
            if (!v) continue;
            html += '<rect class="ao-series-s' + (k % 4) + '" x="' + (i + 0.1) + '" width="0.8" y="' + y(base + v) +
              '" height="' + (v / scaleTop) * 100 + '"/>';
            base += v;
          }
        });
      } else {
        const muted = avgN > 1 ? ' ao-series-muted' : '';
        rows.forEach((r, i) => {
          const v = Math.max(0, r.v[shown]);
          if (v) html += '<rect class="ao-series-s0' + muted + '" x="' + (i + 0.1) + '" width="0.8" y="' + y(v) + '" height="' + (v / scaleTop) * 100 + '"/>';
        });
        if (avgN > 1) {
          const pts = rows.map((r, i) => {
            const from = Math.max(0, i - avgN + 1);
            let s = 0;
            for (let j = from; j <= i; j++) s += rows[j].v[shown];
            return (i + 0.5) + ',' + y(s / (i - from + 1));
          });
          html += '<polyline class="ao-series-avg" points="' + pts.join(' ') + '"/>';
        }
      }
      svg.innerHTML = html;
    };

    const summary = () => {
      if (stack) {
        const keys = names.map((_, k) => k).filter((k) => on[k]);
        const sums = keys.map((k) => rows.reduce((a, r) => a + r.v[k], 0));
        const all = sums.reduce((a, b) => a + b, 0);
        return [n + ' days', ...keys.map((k, j) => names[k] + ' ' + seriesNum(sums[j]) + ' (' + Math.round((sums[j] / (all || 1)) * 100) + '%)')].join(' · ');
      }
      const sum = rows.reduce((a, r) => a + r.v[shown], 0);
      const peak = rows.reduce((m, r, i) => (r.v[shown] > rows[m].v[shown] ? i : m), 0);
      return n + ' days · ' + names[shown] + ' ' + withUnit(sum, shown) + ' in all · busiest ' + dayName(rows[peak]) +
        ', ' + withUnit(rows[peak].v[shown], shown);
    };
    const read = () => {
      out.replaceChildren();
      for (const d of dots.values()) d.classList.remove('is-on');
      if (active < 0) {
        hl.hidden = true;
        out.append(summary());
        const hint = document.createElement('span');
        hint.className = 'ao-series-hint';
        hint.textContent = 'Point at a day, or focus the chart and use the arrow keys.';
        out.append(hint);
        return;
      }
      const r = rows[active];
      hl.hidden = false;
      hl.style.left = (active / n) * 100 + '%';
      const day = document.createElement('b');
      day.textContent = dayName(r);
      out.append(day);
      const order = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown, ...names.map((_, k) => k).filter((k) => k !== shown)];
      for (const k of order) {
        const s = document.createElement('span');
        s.className = 'ao-series-val' + (stack ? ' ao-series-s' + (k % 4) : k === shown ? ' is-shown' : '');
        s.textContent = names[k] + ' ' + withUnit(r.v[k], k);
        out.append(' · ', s);
      }
      if (stack) out.append(' · Total ' + seriesNum(order.reduce((a, k) => a + r.v[k], 0)));
      if (!stack && avgN > 1 && active >= avgN - 1) {
        let s = 0;
        for (let j = active - avgN + 1; j <= active; j++) s += rows[j].v[shown];
        out.append(' · ' + avgN + '-day average ' + withUnit(s / avgN, shown));
      }
      const m = marks.get(active);
      if (m) {
        dots.get(active)?.classList.add('is-on');
        for (const text of m) {
          const em = document.createElement('span');
          em.className = 'ao-series-note';
          em.textContent = text;
          out.append(em);
        }
      }
    };
    const pick = (i) => {
      active = i < 0 ? -1 : Math.max(0, Math.min(n - 1, i));
      read();
    };
    const fromPointer = (e) => {
      const box = plot.getBoundingClientRect();
      pick(Math.floor(((e.clientX - box.left) / box.width) * n));
    };
    body.addEventListener('pointermove', fromPointer);
    body.addEventListener('pointerdown', fromPointer);
    body.addEventListener('pointerleave', () => { if (document.activeElement !== plot) pick(-1); });
    plot.addEventListener('focus', () => { if (active < 0) pick(n - 1); });
    plot.addEventListener('blur', () => pick(-1));
    plot.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, PageDown: 7, PageUp: -7 }[e.key];
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : d ? (active < 0 ? n - 1 : active + d) : null;
      if (to === null) return;
      e.preventDefault();
      pick(to);
    });

    draw();
    read();
    table.classList.add('ao-series-table');
    table.before(chart);
    this.classList.add('ao-series-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-funnel>: a total, then what each layer takes out of it, down to what is left: requests
// down to the ones that were people, renders down to the keepers. Children: an <ol> whose <li>
// each hold a <b> label, a <data value="…"> and a short note, optionally followed by a nested
// <ul> of examples that opens on request. The first value is the total; a negative value is what
// that layer removes; a positive value after the first is a count measured another way ("of
// these, about 290 ran the script"): what it leaves out is shown as unconfirmed, not as removed,
// so the end of the bar reads as a range. A value written "~290" is an estimate, and every figure
// after an estimate is rounded to tens. One bar at the top shows the whole split; each row shows
// what it took and what was left. Without JS: the list, with the numbers as written.
const funnelNum = (v) => Math.round(v).toLocaleString('en-US');
class AoFunnel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > ol > li')].filter((li) => li.querySelector(':scope > data'));
    if (items.length < 2) return;
    this._ready = true;
    const unit = this.getAttribute('unit') || '';
    const rows = items.map((li) => {
      const data = li.querySelector(':scope > data');
      const value = parseFloat(data.getAttribute('value'));
      const note = document.createElement('span');
      note.className = 'ao-funnel-note';
      for (const node of [...li.childNodes]) {
        if (node.nodeType === 1 && (node.tagName === 'B' || node.tagName === 'DATA' || node.tagName === 'UL')) continue;
        note.append(node.cloneNode(true));
      }
      return {
        label: li.querySelector(':scope > b')?.textContent.trim() || '',
        value,
        approx: /^\s*[~≈]/.test(data.textContent),
        note,
        examples: li.querySelector(':scope > ul'),
      };
    });
    const total = rows[0].value;
    let left = total;
    let rough = false;
    rows.forEach((r, i) => {
      r.before = left;
      if (i === 0) r.left = total;
      else if (r.value < 0) r.left = left + r.value;
      else r.left = r.value;
      r.measured = i > 0 && r.value >= 0;
      r.taken = i === 0 ? 0 : r.before - r.left;
      rough = rough || r.approx;
      r.rough = rough; // this figure, or one it was worked out from, is an estimate
      left = r.left;
    });
    const num = (v, r) => (r.rough ? '~' + funnelNum(Math.round(v / 10) * 10) : funnelNum(v));
    const share = (v) => (v / total < 0.01 ? '<1' : Math.round((v / total) * 100)) + '%';

    const box = document.createElement('div');
    box.className = 'ao-funnel-box';
    const bar = document.createElement('div');
    bar.className = 'ao-funnel-bar';
    bar.setAttribute('aria-hidden', 'true');
    const segs = [];
    rows.slice(1).forEach((r, j) => {
      const s = document.createElement('span');
      s.className = 'ao-funnel-seg ' + (r.measured ? 'ao-funnel-left is-maybe' : 'ao-funnel-f' + (j % 6));
      s.style.flexGrow = String(Math.max(0, r.taken));
      s.title = (r.measured ? 'Unconfirmed' : r.label) + ': ' + num(r.taken, r);
      bar.append(s);
      segs.push(s);
    });
    const rest = document.createElement('span');
    rest.className = 'ao-funnel-seg ao-funnel-left';
    rest.style.flexGrow = String(Math.max(0, left));
    const last = rows[rows.length - 1];
    rest.title = last.label + ': ' + num(left, last);
    bar.append(rest);
    const sum = document.createElement('p');
    sum.className = 'ao-funnel-sum';
    sum.textContent = funnelNum(total) + (unit ? ' ' + unit : '') + ' → ' + (last.measured
      ? num(last.left, last) + ' to ' + num(last.before, rows[rows.length - 2]) + ' left (' + share(last.left) + ' to ' + share(last.before) + ')'
      : num(left, last) + ' left (' + share(left) + ')');
    box.append(sum, bar);

    const list = document.createElement('ol');
    list.className = 'ao-funnel-rows';
    rows.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = 'ao-funnel-row' + (i === 0 ? ' is-total' : '');
      if (i > 0) li.classList.add('ao-funnel-f' + ((i - 1) % 6));
      const head = document.createElement('div');
      head.className = 'ao-funnel-head';
      const name = document.createElement('b');
      name.textContent = r.label;
      const nums = document.createElement('span');
      nums.className = 'ao-funnel-nums';
      if (i === 0) nums.textContent = funnelNum(total) + (unit ? ' ' + unit : '');
      else if (!r.measured) nums.textContent = (r.approx ? '~' : '') + '−' + funnelNum(r.approx ? Math.round(r.taken / 10) * 10 : r.taken) +
        ' → ' + num(r.left, r) + ' left';
      else nums.textContent = num(r.left, r) + ' of ' + num(r.before, rows[i - 1]) + ', counted another way';
      head.append(name, nums);
      const track = document.createElement('div');
      track.className = 'ao-funnel-track';
      track.setAttribute('aria-hidden', 'true');
      const keep = document.createElement('span');
      keep.className = 'ao-funnel-keep';
      keep.style.width = (r.left / total) * 100 + '%';
      track.append(keep);
      if (r.taken > 0) {
        const gone = document.createElement('span');
        gone.className = 'ao-funnel-gone' + (r.measured ? ' is-maybe' : '');
        gone.style.left = (r.left / total) * 100 + '%';
        gone.style.width = (r.taken / total) * 100 + '%';
        track.append(gone);
      }
      li.append(head, track, r.note);
      if (r.examples) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'ao-funnel-more';
        more.setAttribute('aria-expanded', 'false');
        more.textContent = 'What’s in it';
        const ex = r.examples.cloneNode(true);
        ex.className = 'ao-funnel-ex';
        ex.hidden = true;
        more.addEventListener('click', () => {
          const open = more.getAttribute('aria-expanded') !== 'true';
          more.setAttribute('aria-expanded', String(open));
          ex.hidden = !open;
        });
        li.append(more, ex);
      }
      if (i > 0) {
        const seg = segs[i - 1];
        const light = (v) => { seg.classList.toggle('is-on', v); li.classList.toggle('is-on', v); };
        li.addEventListener('pointerenter', () => light(true));
        li.addEventListener('pointerleave', () => light(false));
        li.addEventListener('focusin', () => light(true));
        li.addEventListener('focusout', () => light(false));
        seg.addEventListener('pointerenter', () => light(true));
        seg.addEventListener('pointerleave', () => light(false));
      }
      list.append(li);
    });
    box.append(list);
    this.querySelector(':scope > ol').before(box);
    this.classList.add('ao-funnel-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-ask>: questions put to an AI agent, each with the tool call it became and what came back,
// so a reader sees what a connection can answer and can take the question for their own. Each
// is a <details data-via="Connection" data-tool="tool_name"> holding a <summary> (the question as
// asked), then whatever shows the call (<pre>) and the answer (<p>, <ul>). With JS: a filter per
// connection, a Copy button on each question, and one question open at a time. Without JS: the
// details, which already open and close.
let askGroups = 0;
class AoAsk extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > details')];
    if (!items.length) return;
    this._ready = true;
    const group = 'ao-ask-' + ++askGroups;
    const vias = [];
    for (const d of items) {
      const via = d.dataset.via || '';
      if (via && !vias.includes(via)) vias.push(via);
      const sum = d.querySelector(':scope > summary');
      if (!sum) continue;
      const question = sum.textContent.trim();
      d.setAttribute('name', group); // one open at a time, natively where supported
      d.addEventListener('toggle', () => {
        if (d.open) for (const o of items) if (o !== d && o.open) o.open = false;
      });
      const q = document.createElement('span');
      q.className = 'ao-ask-q';
      q.append(...sum.childNodes);
      sum.append(q);
      if (via || d.dataset.tool) {
        const tag = document.createElement('span');
        tag.className = 'ao-ask-tag';
        if (via) tag.append(via);
        if (d.dataset.tool) {
          const code = document.createElement('code');
          code.textContent = d.dataset.tool;
          tag.append(code);
        }
        sum.append(tag);
      }
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'ao-ask-copy';
      copy.textContent = 'Copy the question';
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(question);
          copy.textContent = 'Copied';
        } catch (e) {
          copy.textContent = 'Copy failed: select it instead';
        }
        setTimeout(() => { copy.textContent = 'Copy the question'; }, 1800);
      });
      sum.after(copy);
    }
    if (vias.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-ask-filter';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show questions for');
      const pick = (via) => {
        for (const b of bar.children) b.setAttribute('aria-pressed', String(b.dataset.via === via));
        for (const d of items) d.hidden = !!via && d.dataset.via !== via;
      };
      for (const via of ['', ...vias]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.via = via;
        const count = via ? items.filter((d) => d.dataset.via === via).length : items.length;
        b.textContent = (via || 'All') + ' · ' + count;
        b.addEventListener('click', () => pick(via));
        bar.append(b);
      }
      pick('');
      this.prepend(bar);
    }
    this.classList.add('ao-ask-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-demo name="x" part="y">: an interactive demo written for one post. Its code lives in
// src/scripts/demos/<name>.js and is a separate chunk, fetched only when a post uses it, so
// one post's demo never weighs on the others. The module exports mount(host, part), which
// returns { destroy } or null; whatever the element held before is the no-JS fallback.
// ---------------------------------------------------------------------------------------
// <ao-pan>: a picture far wider than the page (a panorama, a long strip, a storyboard), shown
// at a readable height and panned across instead of shrunk to a sliver. Drag it, swipe it,
// use a trackpad, or focus it and use the arrow keys (Home/End jump to the ends); a minimap
// under it shows the whole picture and where the frame is, and a click on it jumps there.
//   views="A|B"            two or more <img>s become views of one place, one button each; the
//                          frame keeps its place as a fraction of the width, so pictures of
//                          different lengths (an 8:1 and a 12:1 strip) are compared at the
//                          same point of their story
//   stops="0.3:Bridge|…"   buttons that glide the frame's centre to a fraction of the width
//   height="360"           the frame's height in px on wide screens (phones get less)
// Adds Glide (a slow pan to the end; any touch stops it) and Full size (the image viewer).
// Without JS: the images and caption stack, at the page's width.
class AoPan extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const imgs = [...this.querySelectorAll(':scope > img')];
    if (!imgs.length) return;
    this._ready = true;
    this.imgs = imgs;
    const h = parseFloat(this.getAttribute('height') || '');
    if (h > 0) this.style.setProperty('--ao-pan-h', h + 'px');
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim());
    imgs.forEach((img, i) => { img.dataset.label = views[i] || img.alt || 'View ' + (i + 1); });

    const stage = document.createElement('div');
    stage.className = 'ao-pan-stage';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', 'Wide picture: drag, or use the arrow keys, to pan');
    const track = document.createElement('div');
    track.className = 'ao-pan-track';
    track.append(...imgs);
    stage.append(track);
    this.stage = stage;

    const mini = document.createElement('div');
    mini.className = 'ao-pan-mini';
    mini.setAttribute('aria-hidden', 'true');
    this.miniImg = document.createElement('img');
    this.miniImg.alt = '';
    this.miniImg.draggable = false;
    this.miniImg.setAttribute('data-no-zoom', '');
    this.win = document.createElement('span');
    this.win.className = 'ao-pan-win';
    mini.append(this.miniImg, this.win);

    const bar = document.createElement('div');
    bar.className = 'ao-pan-bar';
    const mk = (label, cls, fn, title) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ao-pan-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      if (title) b.title = title;
      b.addEventListener('click', fn);
      bar.append(b);
      return b;
    };
    this.viewBtns = imgs.length > 1 ? imgs.map((img, i) => mk(img.dataset.label, 'ao-pan-view', () => this.show(i))) : [];
    for (const part of (this.getAttribute('stops') || '').split('|')) {
      const k = part.indexOf(':');
      const f = parseFloat(k < 0 ? part : part.slice(0, k));
      if (!isFinite(f)) continue;
      mk(k < 0 ? Math.round(f * 100) + '%' : part.slice(k + 1).trim(), 'ao-pan-stop', () => this.glideTo(f, 900), 'Pan to here');
    }
    this.glideBtn = mk('Glide', 'ao-pan-glide', () => (this.anim ? this.stop() : this.glide()), 'Pan slowly to the end');
    mk('Full size', 'ao-pan-zoom', () => openViewer(this.imgs[this.cur], this.imgs), 'Open the picture full size, to zoom in');

    const cap = this.querySelector(':scope > figcaption');
    this.insertBefore(bar, cap || null);
    this.insertBefore(mini, bar);
    this.insertBefore(stage, mini);

    // Mouse drag pans (touch and trackpads already scroll natively).
    let drag = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      this.stop();
      drag = { x: e.clientX, left: stage.scrollLeft };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('ao-pan-dragging');
    });
    stage.addEventListener('pointermove', (e) => {
      if (drag) stage.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    const end = () => { drag = null; stage.classList.remove('ao-pan-dragging'); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', () => this.stop(), { passive: true });
    stage.addEventListener('touchstart', () => this.stop(), { passive: true });
    stage.addEventListener('keydown', (e) => {
      const step = stage.clientWidth * (e.shiftKey ? 0.9 : 0.25);
      const go = { ArrowRight: step, ArrowLeft: -step, End: Infinity, Home: -Infinity }[e.key];
      if (go === undefined) return;
      e.preventDefault();
      this.stop();
      const to = isFinite(go) ? stage.scrollLeft + go : go > 0 ? stage.scrollWidth : 0;
      stage.scrollTo({ left: to, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    stage.addEventListener('scroll', () => this.paint(), { passive: true });

    const jump = (e) => {
      const r = mini.getBoundingClientRect();
      this.stop();
      this.centreAt((e.clientX - r.left) / r.width);
    };
    let miniDrag = false;
    mini.addEventListener('pointerdown', (e) => { miniDrag = true; mini.setPointerCapture(e.pointerId); jump(e); });
    mini.addEventListener('pointermove', (e) => { if (miniDrag) jump(e); });
    mini.addEventListener('pointerup', () => { miniDrag = false; });

    for (const img of imgs) img.addEventListener('load', () => this.paint());
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(stage);
    this.onStop = () => this.stop();
    document.addEventListener('ao-stop', this.onStop);
    this.cur = 0;
    this.show(0);
    this.classList.add('ao-pan-ready');
  }

  disconnectedCallback() {
    this.stop();
    if (this.ro) this.ro.disconnect();
    if (this.onStop) document.removeEventListener('ao-stop', this.onStop);
  }

  // Where the frame's centre sits, as a fraction of the picture's width.
  frac() {
    const s = this.stage;
    return s.scrollWidth > 0 ? (s.scrollLeft + s.clientWidth / 2) / s.scrollWidth : 0;
  }

  centreAt(f) {
    const s = this.stage;
    s.scrollLeft = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
  }

  show(i) {
    const keep = this.frac();
    this.cur = i;
    this.imgs.forEach((img, k) => {
      const on = k === i;
      img.classList.toggle('ao-pan-off', !on);
      if (on) img.loading = 'eager';
    });
    this.viewBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const img = this.imgs[i];
    this.miniImg.src = img.currentSrc || img.src;
    const restore = () => {
      if (this._shown) this.centreAt(keep);
      this._shown = true;
      this.paint();
    };
    if (img.complete && img.naturalWidth) restore(); else img.addEventListener('load', restore, { once: true });
  }

  paint() {
    const s = this.stage;
    if (!s || !s.scrollWidth) return;
    this.win.style.left = (s.scrollLeft / s.scrollWidth) * 100 + '%';
    this.win.style.width = Math.min(100, (s.clientWidth / s.scrollWidth) * 100) + '%';
  }

  glideTo(f, ms) {
    this.stop();
    const s = this.stage;
    const to = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { s.scrollLeft = to; return; }
    this.run(s.scrollLeft, to, ms, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
  }

  // About 30 seconds for the whole width, the pace of a scroll video.
  glide() {
    const s = this.stage;
    const max = s.scrollWidth - s.clientWidth;
    if (max <= 0) return;
    const from = s.scrollLeft >= max - 2 ? 0 : s.scrollLeft;
    this.run(from, max, 30000 * ((max - from) / max), (t) => t);
    this.glideBtn.textContent = 'Stop';
    this.glideBtn.setAttribute('aria-pressed', 'true');
  }

  run(from, to, ms, ease) {
    const s = this.stage;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / Math.max(1, ms));
      s.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) this.anim = requestAnimationFrame(step); else this.stop();
    };
    this.anim = requestAnimationFrame(step);
  }

  stop() {
    if (this.anim) cancelAnimationFrame(this.anim);
    this.anim = 0;
    if (this.glideBtn) {
      this.glideBtn.textContent = 'Glide';
      this.glideBtn.setAttribute('aria-pressed', 'false');
    }
  }
}

// ---------------------------------------------------------------------------------------
// <ao-treemap>: parts of a whole whose parts have parts, drawn as nested rectangles with
// areas in proportion. Written once as a plain <table>: first column = the groups (projects),
// every other column = a kind of part (languages), cells = amounts. Each group is a block, its
// parts tiles coloured by column. A second view (`views="By project|By language"`) turns it
// inside out: one block per column, the groups as its tiles. `top="6"` keeps the six largest
// columns and folds the rest into "Other". Pointing at a tile, or focusing the chart and using
// the arrow keys, reads it out. The table stays for screen readers; without JS it is the table.
function squarify(items, x, y, w, h) {
  // items: [{v}], sorted descending, v > 0. Returns the same items with x, y, w, h set.
  const out = [];
  let rest = items.slice();
  const total = rest.reduce((a, b) => a + b.v, 0);
  if (!total || w <= 0 || h <= 0) return out;
  const scale = (w * h) / total;
  const worst = (row, side) => {
    const s = row.reduce((a, b) => a + b.v * scale, 0);
    let mx = 0, mn = Infinity;
    for (const r of row) { mx = Math.max(mx, r.v * scale); mn = Math.min(mn, r.v * scale); }
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (rest.length) {
    const side = Math.min(w, h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) row.push(rest[i++]);
    rest = rest.slice(i);
    const area = row.reduce((a, b) => a + b.v * scale, 0);
    if (w >= h) {
      const cw = area / h;
      let cy = y;
      for (const r of row) { const ch = (r.v * scale) / cw; out.push(Object.assign(r, { x, y: cy, w: cw, h: ch })); cy += ch; }
      x += cw; w -= cw;
    } else {
      const ch = area / w;
      let cx = x;
      for (const r of row) { const cw = (r.v * scale) / ch; out.push(Object.assign(r, { x: cx, y, w: cw, h: ch })); cx += cw; }
      y += ch; h -= ch;
    }
  }
  return out;
}
class AoTreemap extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const head = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    const num = (c) => { const n = parseFloat(String(c || '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) && n > 0 ? n : 0; };
    let rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const cells = [...tr.children];
      return { label: cells[0]?.textContent.trim() || '', values: cells.slice(1).map((c) => num(c.textContent)) };
    }).filter((r) => r.values.some((v) => v > 0));
    if (!rows.length) return;
    this._ready = true;
    let cols = head.slice(1);
    // Fold the smaller columns into "Other" when `top` asks for it.
    const top = parseInt(this.getAttribute('top'), 10);
    if (top > 0 && cols.length > top) {
      const sums = cols.map((_, k) => rows.reduce((a, r) => a + (r.values[k] || 0), 0));
      const keep = sums.map((s, k) => [s, k]).sort((a, b) => b[0] - a[0]).slice(0, top).map((p) => p[1]).sort((a, b) => a - b);
      rows = rows.map((r) => ({
        label: r.label,
        values: [...keep.map((k) => r.values[k] || 0), r.values.reduce((a, v, k) => a + (keep.includes(k) ? 0 : v), 0)],
      }));
      cols = [...keep.map((k) => cols[k]), 'Other'];
    }
    this.cols = cols;
    this.rows = rows;
    this.total = rows.reduce((a, r) => a + r.values.reduce((x, y) => x + y, 0), 0);
    this.unit = this.getAttribute('unit') || '';
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);
    this.view = 0;

    const wrap = document.createElement('div');
    wrap.className = 'ao-tm';
    const bar = document.createElement('div');
    bar.className = 'ao-tm-bar';
    if (views.length > 1) {
      this.viewBtns = views.slice(0, 2).map((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.setAttribute('aria-pressed', String(i === 0));
        b.addEventListener('click', () => this.setView(i));
        bar.append(b);
        return b;
      });
    }
    const legend = document.createElement('div');
    legend.className = 'ao-tm-legend';
    cols.forEach((c, k) => {
      const key = document.createElement('span');
      key.className = 'ao-tm-key';
      key.style.setProperty('--tm', `var(--tm-${k % 8})`);
      key.textContent = c;
      legend.append(key);
    });
    bar.append(legend);
    this.stage = document.createElement('div');
    this.stage.className = 'ao-tm-stage';
    this.stage.tabIndex = 0;
    this.stage.setAttribute('role', 'img');
    this.stage.setAttribute('aria-label', 'Treemap; the table it is drawn from follows. Arrow keys read the tiles.');
    this.read = document.createElement('p');
    this.read.className = 'ao-tm-read';
    this.read.setAttribute('aria-live', 'polite');
    wrap.append(bar, this.stage, this.read);
    table.classList.add('ao-tm-table');
    table.before(wrap);

    this.cur = -1;
    this.stage.addEventListener('pointermove', (e) => {
      const t = e.target.closest('.ao-tm-tile');
      if (t) this.focusTile(+t.dataset.i, false);
    });
    this.stage.addEventListener('pointerleave', () => { if (document.activeElement !== this.stage) this.focusTile(-1, false); });
    this.stage.addEventListener('keydown', (e) => {
      const n = this.tiles?.length || 0;
      if (!n) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); this.focusTile((this.cur + step + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); this.focusTile(0, true); }
      else if (e.key === 'End') { e.preventDefault(); this.focusTile(n - 1, true); }
    });
    this.stage.addEventListener('focus', () => { if (this.cur < 0) this.focusTile(0, true); });
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(this.stage);
    this.classList.add('ao-treemap-ready');
    this.paint();
  }
  disconnectedCallback() { this.ro?.disconnect(); }
  setView(i) {
    this.view = i;
    this.viewBtns?.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    this.cur = -1;
    this.paint();
    this.read.textContent = '';
  }
  groups() {
    // The outer blocks for the current view, each with its inner tiles, sorted descending.
    const { rows, cols } = this;
    const g = this.view === 0
      ? rows.map((r) => ({ label: r.label, parts: r.values.map((v, k) => ({ v, label: cols[k], k, group: r.label })) }))
      : cols.map((c, k) => ({ label: c, k, parts: rows.map((r) => ({ v: r.values[k] || 0, label: r.label, k, group: c })) }));
    for (const b of g) {
      b.parts = b.parts.filter((p) => p.v > 0).sort((a, b2) => b2.v - a.v);
      b.v = b.parts.reduce((a, p) => a + p.v, 0);
    }
    return g.filter((b) => b.v > 0).sort((a, b) => b.v - a.v);
  }
  fmt(v) { return v.toLocaleString('en-US') + (this.unit ? ' ' + this.unit : ''); }
  pct(v) { const p = (100 * v) / this.total; return (p >= 10 ? p.toFixed(0) : p.toFixed(1)) + '%'; }
  paint() {
    const W = this.stage.clientWidth, H = this.stage.clientHeight;
    if (!W || !H) return;
    const blocks = squarify(this.groups(), 0, 0, W, H);
    this.stage.textContent = '';
    this.tiles = [];
    const pad = 2, headH = 20;
    for (const b of blocks) {
      const el = document.createElement('div');
      el.className = 'ao-tm-block';
      Object.assign(el.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
      const labelled = b.w > 64 && b.h > 44;
      const inner = { x: pad, y: labelled ? headH : pad, w: b.w - 2 * pad, h: b.h - (labelled ? headH : pad) - pad };
      if (labelled) {
        const name = document.createElement('span');
        name.className = 'ao-tm-name';
        name.textContent = b.label;
        el.append(name);
      }
      for (const p of squarify(b.parts.map((q) => ({ ...q })), inner.x, inner.y, inner.w, inner.h)) {
        const t = document.createElement('span');
        t.className = 'ao-tm-tile';
        t.dataset.i = String(this.tiles.length);
        t.style.setProperty('--tm', `var(--tm-${p.k % 8})`);
        Object.assign(t.style, { left: p.x + 'px', top: p.y + 'px', width: Math.max(0, p.w - 1) + 'px', height: Math.max(0, p.h - 1) + 'px' });
        if (p.w > 58 && p.h > 30) {
          const l = document.createElement('span');
          l.className = 'ao-tm-label';
          l.textContent = this.view === 0 && blocks.length > 1 && !labelled ? p.group : p.label;
          t.append(l);
        }
        el.append(t);
        this.tiles.push({ el: t, p, block: b });
      }
      this.stage.append(el);
    }
    if (this.cur >= 0 && this.tiles[this.cur]) this.focusTile(this.cur, false);
  }
  focusTile(i, keyed) {
    this.tiles?.forEach((t, k) => t.el.classList.toggle('ao-tm-on', k === i));
    this.cur = i;
    const t = this.tiles?.[i];
    if (!t) { this.read.textContent = ''; return; }
    const { p, block } = t;
    const outer = this.view === 0 ? p.group : p.label;
    const part = this.view === 0 ? p.label : p.group;
    this.read.textContent = `${outer} · ${part}: ${this.fmt(p.v)} (${this.pct(p.v)} of all). ${block.label} in all: ${this.fmt(block.v)} (${this.pct(block.v)}).`;
  }
}


// ---------------------------------------------------------------------------------------
// <ao-matrix>: one subject run through a grid of settings (a method per row, a target per
// column), every cell shown the same size, with buttons that switch every cell between views of
// the same output at once (textured / clay, before / after, front / back).
//   cols="A|B|C"     column headings, left to right
//   views="X|Y"      one button per view; a cell's nth <img> is its nth view (default: one view)
//   aspect="w/h"     the frame every picture is fitted into (default 1/1)
// Each child <div data-row="Label|note"> is a row of <figure>s; <figure class="none">text</figure>
// is an empty cell. Switching views on one matrix switches every matrix on the page that has the
// same views, so a reader comparing two subjects keeps one look. Without JS: the rows, every
// picture showing. Only the pictures in view open in the image viewer, and page through in order.
const MATRIX_VIEW = 'ao-matrix-view';
class AoMatrix extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const rows = [...this.querySelectorAll(':scope > div[data-row]')];
    if (!rows.length) return;
    this._ready = true;
    const cols = (this.getAttribute('cols') || '').split('|').map((c) => c.trim()).filter(Boolean);
    const n = Math.max(cols.length, ...rows.map((r) => r.querySelectorAll(':scope > figure').length));
    this.style.setProperty('--ao-cols', String(n));
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    this.views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);

    const grid = document.createElement('div');
    grid.className = 'ao-matrix-grid';
    grid.setAttribute('role', 'table');
    const corner = document.createElement('span');
    corner.className = 'ao-matrix-corner';
    grid.append(corner);
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'ao-matrix-col';
      h.setAttribute('role', 'columnheader');
      h.textContent = cols[i] || '';
      grid.append(h);
    }
    for (const r of rows) {
      const [label, note] = r.getAttribute('data-row').split('|');
      const head = document.createElement('div');
      head.className = 'ao-matrix-row';
      head.setAttribute('role', 'rowheader');
      const b = document.createElement('b');
      b.textContent = label.trim();
      head.append(b);
      if (note) {
        const s = document.createElement('span');
        s.textContent = note.trim();
        head.append(s);
      }
      grid.append(head);
      const figs = [...r.querySelectorAll(':scope > figure')];
      for (let i = 0; i < n; i++) {
        const f = figs[i] || document.createElement('figure');
        if (!figs[i]) f.className = 'none';
        f.classList.add('ao-matrix-cell');
        // On a phone the column heading sits above the grid, out of sight: each cell says it.
        if (cols[i]) f.dataset.col = cols[i];
        grid.append(f);
      }
      r.remove();
    }
    this.cells = [...grid.querySelectorAll('figure:not(.none)')];

    if (this.views.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-matrix-bar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show every cell as');
      this.btns = this.views.map((v, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ao-matrix-btn';
        btn.textContent = v;
        btn.addEventListener('click', () => {
          this.show(i);
          document.dispatchEvent(new CustomEvent(MATRIX_VIEW, { detail: { from: this, views: this.views.join('|'), i } }));
        });
        bar.append(btn);
        return btn;
      });
      this.prepend(bar);
      this.onView = (e) => {
        if (e.detail.from !== this && e.detail.views === this.views.join('|')) this.show(e.detail.i);
      };
      document.addEventListener(MATRIX_VIEW, this.onView);
    }
    const cap = this.querySelector(':scope > figcaption');
    if (cap) this.insertBefore(grid, cap); else this.append(grid);
    this.show(0);
    this.classList.add('ao-matrix-ready');
  }

  disconnectedCallback() {
    if (this.onView) document.removeEventListener(MATRIX_VIEW, this.onView);
  }

  show(i) {
    for (const f of this.cells) {
      const imgs = [...f.querySelectorAll(':scope > img')];
      const k = Math.min(i, imgs.length - 1);
      imgs.forEach((img, j) => {
        img.classList.toggle('ao-matrix-off', j !== k);
        // A view only fetches its pictures once someone asks for it.
        if (j === k && img.loading === 'lazy' && i > 0) img.loading = 'eager';
      });
    }
    (this.btns || []).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  }
}

const DEMOS = {
  synthid: () => import('./demos/synthid.js'),
  cf: () => import('./demos/cf.js'),
};
class AoDemo extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const load = DEMOS[this.getAttribute('name')];
    if (!load) return;
    this._ready = true;
    load()
      .then((mod) => {
        if (this.isConnected) this._demo = mod.mount(this, this.getAttribute('part'));
      })
      .catch(() => { this._ready = false; });
  }

  disconnectedCallback() {
    // The homepage swaps posts in and out of one host; stop timers when this one leaves.
    this._demo?.destroy?.();
  }
}

if (!customElements.get('ao-demo')) customElements.define('ao-demo', AoDemo);
if (!customElements.get('ao-fetch')) customElements.define('ao-fetch', AoFetch);
if (!customElements.get('ao-bars')) customElements.define('ao-bars', AoBars);
if (!customElements.get('ao-shots')) customElements.define('ao-shots', AoShots);
if (!customElements.get('ao-blind')) customElements.define('ao-blind', AoBlind);
if (!customElements.get('ao-runs')) customElements.define('ao-runs', AoRuns);
if (!customElements.get('ao-calc')) customElements.define('ao-calc', AoCalc);
if (!customElements.get('ao-series')) customElements.define('ao-series', AoSeries);
if (!customElements.get('ao-funnel')) customElements.define('ao-funnel', AoFunnel);
if (!customElements.get('ao-ask')) customElements.define('ao-ask', AoAsk);
if (!customElements.get('ao-matrix')) customElements.define('ao-matrix', AoMatrix);
if (!customElements.get('ao-pan')) customElements.define('ao-pan', AoPan);
if (!customElements.get('ao-treemap')) customElements.define('ao-treemap', AoTreemap);
