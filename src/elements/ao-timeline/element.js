// <ao-timeline>: events from several concurrent sources (sessions, agents, people) in one time order, each on its
// own rail, so what overlapped is visible at a glance; optional view buttons dim every event one party couldn't see.
// Without JS it is still an ordered list with times, which is the whole content. Attributes: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';

class AoTimeline extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const parse = (s) => (s || '').split('|').map((p) => {
      const i = p.indexOf(':');
      return { key: p.slice(0, i).trim(), label: p.slice(i + 1).trim() };
    }).filter((x) => x.key);
    const lanes = parse(this.getAttribute('lanes'));
    const views = parse(this.getAttribute('views'));
    const list = this.querySelector('ol');
    if (!list || !lanes.length) return;
    this.style.setProperty('--ao-lanes', String(lanes.length));

    const legend = h('ul', { class: 'ao-tl-legend' },
      lanes.map((l, i) => h('li', { 'data-lane-idx': String(i), text: l.label })));
    const head = h('div', { class: 'ao-tl-head' }, legend);

    for (const ev of list.children) {
      const idx = Math.max(0, lanes.findIndex((l) => l.key === ev.dataset.lane));
      ev.dataset.laneIdx = String(idx);
      const rail = h('span', { class: 'ao-tl-rail', 'aria-hidden': 'true' },
        lanes.map((_, i) => h('i', { 'data-lane-idx': String(i), class: i === idx ? 'on' : null })));
      const body = h('div', { class: 'ao-tl-body' });
      const who = h('span', { class: 'ao-tl-who', text: lanes[idx].label });
      while (ev.firstChild) body.appendChild(ev.firstChild);
      const t = body.querySelector('time');
      if (t) t.after(who); else body.prepend(who);
      ev.append(rail, body);
    }

    if (views.length) {
      const all = [{ key: '', label: 'Everything' }, ...views];
      const buttons = all.map((v) => {
        const b = h('button', { type: 'button', text: v.label, 'aria-pressed': v.key ? 'false' : 'true', onclick: () => {
          for (const o of buttons) o.setAttribute('aria-pressed', String(o === b));
          for (const ev of list.children) {
            const keys = (ev.dataset.in || '').split(/\s+/);
            ev.classList.toggle('ao-tl-out', !!v.key && !keys.includes(v.key));
          }
          this.toggleAttribute('filtered', !!v.key);
        } });
        return b;
      });
      head.appendChild(h('div', { class: 'ao-tl-views', role: 'group', 'aria-label': 'Show whose view' }, buttons));
    }
    this.prepend(head);
  }
}

customElements.define('ao-timeline', AoTimeline);
