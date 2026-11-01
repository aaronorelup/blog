// <ao-blind>: rows of outputs made from the same brief, shown labelled, with a "Judge blind" button. Blind, each row
// is shuffled, every caption is hidden and the pictures stop opening the viewer (its caption would give the answer
// away); the reader picks one per row, then Reveal puts the labels back, marks the picks and counts them, against
// any figure's data-verdict (someone else's pick). Children and the aspect attribute: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';

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
      if (title) r.el.prepend(h('p', { class: 'ao-blind-title', text: title }));
      r.figs.forEach((f) => {
        f.append(h('button', { type: 'button', class: 'ao-blind-pick', onclick: () => choose(r, f) }));
        f.querySelector('img')?.addEventListener('click', () => {
          if (this.classList.contains('is-blind')) choose(r, f);
        });
      });
    }

    const toggle = h('button', { type: 'button', class: 'ao-blind-btn' });
    const reveal = h('button', { type: 'button', class: 'ao-blind-btn', text: 'Reveal' });
    const status = h('p', { class: 'ao-blind-status', 'aria-live': 'polite' });
    this.prepend(h('div', { class: 'ao-blind-bar' }, toggle, reveal, status));

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
        if (ref) ref.append(h('span', { class: 'ao-blind-verdict', text: ref.getAttribute('data-verdict') }));
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

customElements.define('ao-blind', AoBlind);
