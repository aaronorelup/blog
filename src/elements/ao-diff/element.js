// <ao-diff>: versions of the same text with the changed words marked, so a reader sees what an edit, a fact-check or
// a judge did to a line. One button per version: an earlier one shows its cut words struck through and the last
// version's new words underlined; the last shows as it stands. Without JS the blockquotes and the caption stack.
// Attribute labels: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';

const diffWords = (a, b) => {
  // Word-level LCS. Tokens keep their trailing space, so joining them rebuilds the text.
  const tok = (s) => s.replace(/\s+/g, ' ').trim().match(/\S+\s*/g) || [];
  const A = tok(a), B = tok(b);
  const key = (w) => w.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = key(A[i]) === key(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
  }
  const out = [];
  const push = (type, w) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += w;
    else out.push({ type, text: w });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (key(A[i]) === key(B[j])) { push('same', B[j]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) push('del', A[i++]);
    else push('ins', B[j++]);
  }
  while (i < n) push('del', A[i++]);
  while (j < m) push('ins', B[j++]);
  return out;
};

class AoDiff extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const quotes = [...this.querySelectorAll(':scope > blockquote')];
    if (quotes.length < 2) return;
    this._ready = true;
    const labels = (this.getAttribute('labels') || '').split('|');
    const texts = quotes.map((q) => q.textContent);
    const name = (k) => (labels[k] || '').trim() || 'Version ' + (k + 1);
    const last = quotes.length - 1;

    const bar = h('div', { class: 'ao-diff-bar' });
    const view = h('div', { class: 'ao-diff-view', 'aria-live': 'polite' });
    const legend = h('p', { class: 'ao-diff-legend' });

    const buttons = [];
    const show = (k) => {
      buttons.forEach((b, x) => b.setAttribute('aria-pressed', String(x === k)));
      view.replaceChildren();
      if (k === last) {
        view.append(texts[last].replace(/\s+/g, ' ').trim());
        legend.textContent = name(last) + ', as it stands.';
        return;
      }
      for (const part of diffWords(texts[k], texts[last])) {
        if (part.type === 'same') { view.append(part.text); continue; }
        view.append(h(part.type, { text: part.text.trimEnd() }), part.text.endsWith(' ') ? ' ' : '');
      }
      legend.textContent = 'Struck through: only in ' + name(k) + '. Underlined: only in ' + name(last) + '.';
    };
    quotes.forEach((q, k) => {
      const b = h('button', { type: 'button', text: k === last ? name(k) : name(k) + ' \u2192 ' + name(last),
        onclick: () => show(k) });
      bar.append(b);
      buttons.push(b);
      q.hidden = true;
    });

    quotes[0].before(bar, view, legend);
    this.classList.add('ao-diff-ready');
    show(0);
  }
}

customElements.define('ao-diff', AoDiff);
