// <ao-timeline>: events from several concurrent sources (sessions, agents, people) in one time order, each on its
// own rail, so what overlapped is visible at a glance; optional view buttons dim every event one party couldn't see.
// Without JS it is still an ordered list with times, which is the whole content. Attributes: docs/COMPONENTS.md.

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

    const head = document.createElement('div');
    head.className = 'ao-tl-head';
    const legend = document.createElement('ul');
    legend.className = 'ao-tl-legend';
    lanes.forEach((l, i) => {
      const li = document.createElement('li');
      li.dataset.laneIdx = String(i);
      li.textContent = l.label;
      legend.appendChild(li);
    });
    head.appendChild(legend);

    for (const ev of list.children) {
      const idx = Math.max(0, lanes.findIndex((l) => l.key === ev.dataset.lane));
      ev.dataset.laneIdx = String(idx);
      const rail = document.createElement('span');
      rail.className = 'ao-tl-rail';
      rail.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < lanes.length; i++) {
        const r = document.createElement('i');
        r.dataset.laneIdx = String(i);
        if (i === idx) r.className = 'on';
        rail.appendChild(r);
      }
      const body = document.createElement('div');
      body.className = 'ao-tl-body';
      const who = document.createElement('span');
      who.className = 'ao-tl-who';
      who.textContent = lanes[idx].label;
      while (ev.firstChild) body.appendChild(ev.firstChild);
      const t = body.querySelector('time');
      if (t) t.after(who); else body.prepend(who);
      ev.append(rail, body);
    }

    if (views.length) {
      const bar = document.createElement('div');
      bar.className = 'ao-tl-views';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show whose view');
      const all = [{ key: '', label: 'Everything' }, ...views];
      const buttons = all.map((v) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = v.label;
        b.setAttribute('aria-pressed', v.key ? 'false' : 'true');
        b.addEventListener('click', () => {
          for (const o of buttons) o.setAttribute('aria-pressed', String(o === b));
          for (const ev of list.children) {
            const keys = (ev.dataset.in || '').split(/\s+/);
            ev.classList.toggle('ao-tl-out', !!v.key && !keys.includes(v.key));
          }
          this.toggleAttribute('filtered', !!v.key);
        });
        bar.appendChild(b);
        return b;
      });
      head.appendChild(bar);
    }
    this.prepend(head);
  }
}

customElements.define('ao-timeline', AoTimeline);
