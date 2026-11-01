// <ao-ask>: questions put to an AI agent, each with the tool call it became and what came back, so a reader sees
// what a connection can answer and can take the question for their own. Each is a <details data-via data-tool>; with
// JS: a filter per connection, a Copy button on each question, and one question open at a time. Without JS: the
// details, which already open and close. docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';

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
      sum.append(h('span', { class: 'ao-ask-q' }, ...sum.childNodes));
      if (via || d.dataset.tool) {
        sum.append(h('span', { class: 'ao-ask-tag' }, via || null, d.dataset.tool ? h('code', { text: d.dataset.tool }) : null));
      }
      const copy = h('button', { type: 'button', class: 'ao-ask-copy', text: 'Copy the question', onclick: async () => {
        try {
          await navigator.clipboard.writeText(question);
          copy.textContent = 'Copied';
        } catch (e) {
          copy.textContent = 'Copy failed: select it instead';
        }
        setTimeout(() => { copy.textContent = 'Copy the question'; }, 1800);
      } });
      sum.after(copy);
    }
    if (vias.length > 1) {
      const bar = h('div', { class: 'ao-ask-filter', role: 'group', 'aria-label': 'Show questions for' });
      const pick = (via) => {
        for (const b of bar.children) b.setAttribute('aria-pressed', String(b.dataset.via === via));
        for (const d of items) d.hidden = !!via && d.dataset.via !== via;
      };
      for (const via of ['', ...vias]) {
        const count = via ? items.filter((d) => d.dataset.via === via).length : items.length;
        bar.append(h('button', { type: 'button', 'data-via': via, text: (via || 'All') + ' · ' + count, onclick: () => pick(via) }));
      }
      pick('');
      this.prepend(bar);
    }
    this.classList.add('ao-ask-ready');
  }
}

customElements.define('ao-ask', AoAsk);
