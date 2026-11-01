// <ao-transcript>: narrated videos with their captions laid out as a transcript the reader can read, search and
// click, so two versions of one lesson can be compared by what they actually say. The search box counts and marks a
// term in every transcript at once; clicking a line plays that video from there; the line being spoken is lit.
// Without JS: the videos, with the captions as native subtitles. Attribute find and markup: docs/COMPONENTS.md.
import { AO_LISTEN_PLAY } from '../_core/player.js';
import { fmtTime, parseTime } from '../_lib/time.js';

// A WebVTT file's cues in time order: start and end in seconds, and the words with their tags stripped.
const parseVtt = (text) => {
  const out = [];
  for (const block of String(text).replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n');
    const at = lines.findIndex((l) => l.includes('-->'));
    if (at < 0) continue;
    const [a, b] = lines[at].split('-->');
    const words = lines.slice(at + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    if (words) out.push({ start: parseTime(a), end: parseTime(b.trim().split(/\s/)[0]), text: words });
  }
  return out.sort((x, y) => x.start - y.start);
};

class AoTranscript extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const figs = [...this.querySelectorAll(':scope > figure')].filter((f) => f.querySelector('video track[src]'));
    if (!figs.length) return;
    this._ready = true;
    this.style.setProperty('--ao-tr-n', String(Math.min(figs.length, 2)));
    const grid = document.createElement('div');
    grid.className = 'ao-tr-grid';
    figs[0].before(grid);

    const bar = document.createElement('div');
    bar.className = 'ao-tr-bar';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Search every transcript';
    input.setAttribute('aria-label', 'Search every transcript');
    bar.append(input);
    const presets = (this.getAttribute('find') || '').split('|').map((s) => s.trim()).filter(Boolean);
    const chips = presets.map((word) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = word;
      b.addEventListener('click', () => {
        input.value = input.value === word ? '' : word;
        mark();
      });
      bar.append(b);
      return b;
    });
    grid.before(bar);

    const panes = figs.map((fig) => {
      grid.append(fig);
      const v = fig.querySelector('video');
      const track = v.querySelector('track[src]');
      v.removeAttribute('loop');
      const box = document.createElement('div');
      box.className = 'ao-tr-text';
      box.setAttribute('aria-label', 'Transcript: choose a line to play from there');
      box.textContent = 'loading the transcript…';
      const count = document.createElement('span');
      count.className = 'ao-tr-count';
      const cap = fig.querySelector('figcaption');
      if (cap) cap.append(count);
      v.after(box);
      const pane = { fig, v, box, count, lines: [], lit: null };
      fetch(track.src).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((text) => {
        box.textContent = '';
        let para = null;
        let prev = null;
        let words = 0;
        for (const cue of parseVtt(text)) {
          // Caption cues usually run back to back, so a new paragraph starts at the first sentence
          // end after about 40 words, or wherever the narrator pauses for a second or more.
          const ended = prev && /[.?!]["'”’)]?$/.test(prev.text);
          if (!para || (prev && cue.start - prev.end >= 1) || (ended && words >= 40)) {
            words = 0;
            para = document.createElement('p');
            const time = document.createElement('time');
            time.textContent = fmtTime(cue.start);
            para.append(time);
            box.append(para);
          }
          const span = document.createElement('span');
          span.textContent = cue.text + ' ';
          span.tabIndex = 0;
          span.setAttribute('role', 'button');
          span.title = fmtTime(cue.start);
          span.addEventListener('click', () => seek(pane, cue.start));
          span.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seek(pane, cue.start); }
          });
          para.append(span);
          words += cue.text.split(/\s+/).length;
          pane.lines.push({ ...cue, span });
          prev = cue;
        }
        mark();
      }, () => { box.textContent = 'The transcript could not be loaded.'; });
      v.addEventListener('play', () => { if (!pane.raf) loop(pane); });
      v.addEventListener('seeked', () => light(pane));
      // timeupdate fires even where animation frames don't (a background tab), so check here too.
      v.addEventListener('timeupdate', () => { if (!this.getClientRects().length) v.pause(); });
      return pane;
    });

    // Jump to a line and play from there. A video that hasn't loaded yet (preload="none") takes
    // the time once its metadata is in; play() is what starts that load.
    const seek = (pane, t) => {
      const { v } = pane;
      light(pane, t);
      if (v.readyState >= 1) v.currentTime = t;
      else v.addEventListener('loadedmetadata', () => { v.currentTime = t; }, { once: true });
      v.play().catch(() => {});
    };

    const light = (pane, at) => {
      const t = typeof at === 'number' ? at : pane.v.currentTime;
      let cur = null;
      for (const l of pane.lines) if (l.start <= t + 0.05) cur = l; else break;
      if (cur === pane.lit) return;
      if (pane.lit) pane.lit.span.removeAttribute('aria-current');
      pane.lit = cur;
      if (!cur) return;
      cur.span.setAttribute('aria-current', 'true');
      // Scroll the transcript box only, never the page.
      const box = pane.box;
      // The box is position: relative, so offsetTop is already measured from its top edge.
      const top = cur.span.offsetTop;
      if (top < box.scrollTop || top + cur.span.offsetHeight > box.scrollTop + box.clientHeight) {
        box.scrollTop = Math.max(0, top - box.clientHeight / 3);
      }
    };
    const loop = (pane) => {
      // The homepage hides the reader rather than removing it when it closes; stop with it.
      if (!this.getClientRects().length) { pane.v.pause(); pane.raf = 0; return; }
      light(pane);
      if (pane.v.paused) { pane.raf = 0; return; }
      pane.raf = requestAnimationFrame(() => loop(pane));
    };

    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const paint = (pane) => {
      const q = input.value.trim();
      pane.count.textContent = (q ? `“${q}”: ${pane.hits || 0} ${pane.hits === 1 ? 'time' : 'times'}` : '');
    };
    const mark = () => {
      const q = input.value.trim();
      const re = q ? new RegExp(esc(q), 'gi') : null;
      chips.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === q)));
      for (const pane of panes) {
        let hits = 0;
        let first = null;
        for (const l of pane.lines) {
          const found = re ? l.text.match(re) : null;
          if (!found) { l.span.textContent = l.text + ' '; continue; }
          hits += found.length;
          if (!first) first = l;
          l.span.textContent = '';
          let i = 0;
          l.text.replace(re, (m, at) => {
            l.span.append(l.text.slice(i, at));
            const mk = document.createElement('mark');
            mk.textContent = m;
            l.span.append(mk);
            i = at + m.length;
            return m;
          });
          l.span.append(l.text.slice(i) + ' ');
        }
        pane.hits = hits;
        paint(pane);
        if (first) pane.box.scrollTop = Math.max(0, first.span.offsetTop - 12);
      }
    };
    input.addEventListener('input', mark);

    this._onOther = (e) => panes.forEach((p) => { if (p.v !== e.detail && !p.v.paused) p.v.pause(); });
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    this._stop = () => {
      panes.forEach((p) => { p.v.pause(); if (p.raf) cancelAnimationFrame(p.raf); p.raf = 0; });
    };
    this.classList.add('ao-tr-ready');
  }

  disconnectedCallback() {
    if (this._stop) this._stop();
    if (this._onOther) document.removeEventListener(AO_LISTEN_PLAY, this._onOther);
    this._ready = false;
  }
}

customElements.define('ao-transcript', AoTranscript);
