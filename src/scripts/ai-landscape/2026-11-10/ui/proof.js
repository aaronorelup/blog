// The proof card (SPEC 2.11, 7.4): any .ail-fact opens it by mouse, touch, Enter or Space, filled from the fact's own
// data. It sits under the fact (over it when there is no room, a sheet on a phone) and follows it, keeps Tab inside,
// and goes away on Escape, its button, a click elsewhere, or when the fact leaves the screen. Escape and the button
// give focus back to the fact. Each source number is a link into the sources drawer, titled once the list has loaded.
import { $, $$, announce } from '../core/dom.js';
import { source } from './drawer.js';

const card = document.getElementById('ail-proof');
const phone = matchMedia('(max-width: 599px)');
let from = null;
let last = '';
let raf = 0;

const word = (key) => (key && card.getAttribute(`data-w-${key}`)) || '';
const clean = (s) => s.replace(/\s+/g, ' ').trim();

function fill(fact) {
  const d = fact.dataset;
  const text = d.text || clean(fact.textContent);
  $('.ail-proof__say', card).textContent = text;
  const state = $('.ail-proof__state', card);
  state.textContent = word(d.status === 'none' ? d.gap || 'absent' : d.status);
  state.dataset.status = d.status || '';
  const conf = $('.ail-proof__conf', card);
  conf.textContent = word(d.conf);
  conf.dataset.conf = d.conf || '';
  const time = $('.ail-proof__date time', card);
  time.textContent = d.asOf || '';
  time.dateTime = d.asOf || '';
  $('.ail-proof__date', card).hidden = !d.asOf;
  const list = $('.ail-proof__list', card);
  const nums = (d.src || '').split(/\s+/).filter(Boolean);
  list.textContent = '';
  $('.ail-proof__src', card).hidden = !nums.length;
  for (const n of nums) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const b = document.createElement('b');
    const t = document.createElement('span');
    a.href = `${card.dataset.src}#s-${n}`;
    a.dataset.ailSrc = n;
    b.textContent = n;
    t.className = 'ail-proof__t';
    a.append(b, t);
    li.append(a);
    list.append(li);
    source(n).then((s) => { if (s && a.isConnected) { t.textContent = s.title; a.dataset.kind = s.kind; } }).catch(() => {});
  }
  return text;
}

// Where the fact is now: its first line box, or null when it is hidden or off the screen.
function anchor() {
  if (!from || !from.isConnected) return null;
  const r = from.getClientRects()[0];
  if (!r || (!r.width && !r.height) || r.bottom < 0 || r.top > innerHeight) return null;
  if (getComputedStyle(from).visibility === 'hidden' || from.closest('.ail-gl .ail-stage:not(.is-on)')) return null;
  return r;
}

function place() {
  const r = anchor();
  if (!r) { close(card.contains(document.activeElement)); return; }
  const key = phone.matches ? 'sheet' : `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.bottom)},${card.offsetHeight},${innerWidth},${innerHeight}`;
  if (key === last) return;
  last = key;
  card.classList.toggle('is-sheet', phone.matches);
  if (phone.matches) { card.style.left = ''; card.style.top = ''; return; }
  const m = 12;
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  let top = r.bottom + 10;
  if (top + h > innerHeight - m) top = r.top - 10 - h;
  if (top < m) top = Math.min(innerHeight - m - h, Math.max(m, r.bottom + 10));
  card.style.left = `${Math.round(Math.min(Math.max(m, r.left - 14), innerWidth - w - m))}px`;
  card.style.top = `${Math.round(top)}px`;
}

function follow() {
  raf = 0;
  if (card.hidden) return;
  place();
  if (!card.hidden) raf = requestAnimationFrame(follow);
}

export function openProof(fact) {
  if (!card) return;
  if (from === fact && !card.hidden) { close(true); return; }
  if (from) from.setAttribute('aria-expanded', 'false');
  from = fact;
  card.ailFrom = fact;
  const text = fill(fact);
  card.hidden = false;
  last = '';
  fact.setAttribute('aria-expanded', 'true');
  place();
  card.focus({ preventScroll: true });
  announce(text);
  if (!raf) raf = requestAnimationFrame(follow);
}

// Put the card away. `refocus`: give focus back to the fact (Escape, the button, or focus was inside the card).
export function close(refocus) {
  if (!card || card.hidden) return;
  card.hidden = true;
  const fact = from;
  from = null;
  card.ailFrom = null;
  if (fact) fact.setAttribute('aria-expanded', 'false');
  if (refocus && fact && fact.isConnected) fact.focus({ preventScroll: true });
}

if (card) {
  window.addEventListener('click', (e) => {
    const fact = e.target.closest && e.target.closest('.ail-fact');
    if (fact && !card.contains(fact)) {
      e.preventDefault();          // a world's floor row reads this and leaves its push-in alone
      openProof(fact);
    } else if (!card.hidden && !card.contains(e.target)) close(false);
  }, true);
  card.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(true); });
  window.addEventListener('keydown', (e) => {
    if (card.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (e.key !== 'Tab' || !card.contains(document.activeElement)) return;
    const stops = $$('a[href], button', card).filter((n) => n.offsetParent !== null);
    if (!stops.length) return;
    const i = stops.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : (i + 1) % stops.length;
    e.preventDefault();
    stops[next].focus();
  }, true);
  window.addEventListener('ail:sources', () => close(false));
  window.addEventListener('resize', () => { last = ''; });
}
