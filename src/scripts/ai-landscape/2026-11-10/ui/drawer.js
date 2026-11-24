// The sources drawer (SPEC 2.11, 7.4): a modal dialog that opens from [data-ail-open="sources"] and from a proof's
// source number, loads the static sources page once and gives focus back to what opened it. A click with a modifier
// key still follows the link. source(n) reads one source from the same page for the proof card.
import { $, $$, announce } from '../core/dom.js';

const root = document.getElementById('ail-drawer');
const body = root && $('[data-body]', root);
let page = null;
let filled = false;
let back = null;

// The sources page, fetched and parsed once (a failed fetch is tried again next time).
export function loadSources() {
  if (!root) return Promise.reject(new Error('ai-landscape: no sources drawer'));
  if (!page) {
    page = fetch(root.dataset.src, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`ai-landscape: sources page ${r.status}`))))
      .then((html) => new DOMParser().parseFromString(html, 'text/html'));
    page.catch(() => { page = null; });
  }
  return page;
}

// One numbered source: { n, title, href, kind }, or null when the page has no such row.
export async function source(n) {
  const li = (await loadSources()).getElementById(`s-${n}`);
  const t = li && $('.ail-src__t', li);
  return t ? { n, title: t.textContent.trim(), href: t.getAttribute('href'), kind: li.dataset.kind } : null;
}

function fill(doc) {
  if (filled) return;
  for (const id of ['ail-srcs', 'ail-srcs-end']) {
    const node = doc.getElementById(id);
    if (node) body.append(document.importNode(node, true));
  }
  filled = true;
  body.removeAttribute('aria-busy');
}

// Open at row n (0: the top). `from` gets focus back when the drawer closes.
export function openSources(n = 0, from = document.activeElement) {
  if (!root) return false;
  back = from;
  if (!root.open) {
    root.showModal();
    root.classList.remove('is-open');
    requestAnimationFrame(() => root.classList.add('is-open'));
  }
  const land = () => {
    for (const hit of $$('.is-hit', body)) hit.classList.remove('is-hit');
    const li = n ? body.querySelector(`#s-${n}`) : null;
    if (li) {
      li.classList.add('is-hit');
      li.scrollIntoView({ block: 'center' });
      li.focus({ preventScroll: true });
      announce(li.textContent.replace(/\s+/g, ' ').trim());
    } else {
      body.scrollTop = 0;
      body.focus({ preventScroll: true });
      announce($('#ail-drawer-h', root).textContent.replace(/\s+/g, ' ').trim());
    }
  };
  loadSources().then((doc) => { fill(doc); land(); }).catch(() => { body.removeAttribute('aria-busy'); land(); });
  return true;
}

export function closeSources() {
  if (root && root.open) root.close();
}

if (root) {
  // the dialog closes by its button, a click on the dim page around it, or Escape (the dialog's own cancel)
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === root) closeSources();
  });
  root.addEventListener('close', () => {
    root.classList.remove('is-open');
    const to = back;
    back = null;
    if (to && to.isConnected && typeof to.focus === 'function') to.focus({ preventScroll: true });
  });
  // the page behind never scrolls while the drawer is open (in the 3D page a scroll would move the story)
  root.addEventListener('wheel', (e) => { if (!body.contains(e.target)) e.preventDefault(); }, { passive: false });
  root.addEventListener('touchmove', (e) => { if (!body.contains(e.target)) e.preventDefault(); }, { passive: false });
  window.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-ail-open="sources"], [data-ail-src]');
    if (!t || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    const card = t.closest('[data-ail-card]');                       // a card that stands in for what opened it
    const from = (card && card.ailFrom) || t;
    window.dispatchEvent(new CustomEvent('ail:sources'));           // the proof card steps aside
    openSources(Number(t.dataset.ailSrc) || 0, from);
  }, true);
}
