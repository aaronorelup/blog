// The edition list under the stamp chip (SPEC 2.10), and the stamp section's own small behaviours: each disclosure
// says what it opened in the live region, and printing opens them all. The chip toggles the list. Escape, a click
// elsewhere or Tab past its end closes it, and Escape gives focus back to the chip. A modified click follows the link.
import { $, $$, announce } from '../core/dom.js';

const pop = document.getElementById('ail-editions');
const clean = (s) => s.replace(/\s+/g, ' ').trim();
let chip = null;

function place() {
  const r = chip.getBoundingClientRect();
  const m = 12;
  pop.style.top = `${Math.round(r.bottom + 8)}px`;
  pop.style.left = `${Math.round(Math.min(Math.max(m, r.left), innerWidth - pop.offsetWidth - m))}px`;
}

function open(from) {
  chip = from;
  pop.hidden = false;
  chip.setAttribute('aria-expanded', 'true');
  place();
  const here = $('[aria-current]', pop);
  (here || pop).focus({ preventScroll: true });
  announce(clean(`${$('#ail-eds-h', pop).textContent} ${here ? here.textContent : ''}`));
}

function close(refocus) {
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  const to = chip;
  chip = null;
  if (to) {
    to.setAttribute('aria-expanded', 'false');
    if (refocus) to.focus({ preventScroll: true });
  }
}

if (pop) {
  for (const c of $$('[data-ail-open="editions"]')) { c.setAttribute('aria-haspopup', 'dialog'); c.setAttribute('aria-expanded', 'false'); }
  window.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-ail-open="editions"]');
    if (t && !(e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
      e.preventDefault();
      e.stopPropagation();          // the chip is also a link to #snapshot: the list opens instead of the page moving
      if (pop.hidden) open(t); else close(true);
    } else if (!pop.hidden && !pop.contains(e.target)) close(false);
  }, true);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !pop.hidden) { e.preventDefault(); e.stopPropagation(); close(true); }
  }, true);
  pop.addEventListener('focusout', (e) => { if (e.relatedTarget && !pop.contains(e.relatedTarget)) close(false); });
  window.addEventListener('resize', () => { if (!pop.hidden) place(); });
  window.addEventListener('scroll', () => { if (!pop.hidden && chip && !chip.closest('.ail-chrome')) close(false); }, { passive: true });
}

// The stamp's disclosures: one sentence to the live region when one opens. Print shows every one of them open.
const discs = $$('.ail-disc');
for (const d of discs) d.addEventListener('toggle', () => { if (d.open) announce(clean($('summary', d).textContent)); });
// In the 3D page a card left open would wait over the next section's return: the stamp closes them when it leaves.
const stage = $('#snapshot .ail-stage');
if (stage) {
  new MutationObserver(() => {
    if (document.documentElement.classList.contains('ail-gl') && !stage.classList.contains('is-on')) discs.forEach((d) => { if (d.open) d.open = false; });
  }).observe(stage, { attributes: true, attributeFilter: ['class'] });
}
let shut = [];
window.addEventListener('beforeprint', () => {
  shut = discs.filter((d) => !d.open);
  for (const d of discs) { d.dataset.name = d.name; d.removeAttribute('name'); }   // one group opens one at a time
  shut.forEach((d) => { d.open = true; });
});
window.addEventListener('afterprint', () => {
  shut.forEach((d) => { d.open = false; });
  for (const d of discs) if (d.dataset.name) d.name = d.dataset.name;
  shut = [];
});
