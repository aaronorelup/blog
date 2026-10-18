// "Noticed this month": up to three findings under the chips (two on a phone), each one sentence
// and a "Show me" link to where the page explains it. The rules live in findings.js and always
// read the whole filing, so this block doesn't change when the range does.
//
// It waits for the gate: while the dots are being sorted nothing else on screen should move
// (DESIGN §A.6), so the rows are laid out from the start (no shift) but stay transparent until
// the gate reports gate:done, the reader scrolls to them, or a few seconds pass, whichever is
// first. Under reduced motion they are simply there.
import '../../../styles/stats/ask.css';
import { findings } from './findings.js';
import { arrowSVG } from './icons.js';

const FALLBACK_MS = 6000;

export async function mount(el, ctx) {
  const rows = findings(ctx).slice(0, 3);
  if (!rows.length) { el.replaceChildren(); return { update() {}, destroy() {} }; }

  const box = document.createElement('div');
  box.className = 'st-ask-noticed';
  const h = document.createElement('h2');
  h.className = 'st-ask-noticed-h';
  h.id = 'st-ask-noticed-h';
  h.textContent = ctx.snap.days.length >= 28 ? 'Noticed this month' : `Noticed in the ${ctx.snap.days.length} days so far`;
  const ul = document.createElement('ul');
  ul.className = 'st-ask-notes';
  ul.setAttribute('aria-labelledby', h.id);

  for (const r of rows) {
    const li = document.createElement('li');
    li.className = 'st-ask-note';
    li.dataset.rule = r.key;
    const eb = document.createElement('p');
    eb.className = 'st-ask-eyebrow';
    eb.textContent = r.eyebrow;
    const p = document.createElement('p');
    p.className = 'st-ask-sent';
    for (const part of r.parts) {
      if (typeof part === 'string') p.append(part);
      else { const b = document.createElement('strong'); b.textContent = part.b; p.append(b); }
    }
    const a = document.createElement('a');
    a.className = 'st-ask-show';
    a.href = r.route;
    a.setAttribute('aria-label', `Show me: ${r.eyebrow.toLowerCase()}`);
    a.append(document.createTextNode('Show me'), arrowSVG(13));
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (location.hash === r.route) { e.preventDefault(); ctx.router.go(r.route, { push: false }); }
    });
    li.append(eb, p, a);
    ul.append(li);
  }
  box.append(h, ul);
  el.replaceChildren(box);

  // The quiet reveal.
  const offs = [];
  let timer = 0;
  const reveal = () => {
    if (!box.classList.contains('st-ask-wait')) return;
    box.classList.remove('st-ask-wait');
    clearTimeout(timer);
    offs.splice(0).forEach((f) => f && f());
  };
  if (!ctx.motion.reduced) {
    box.classList.add('st-ask-wait');
    offs.push(ctx.bus.on('gate:done', reveal));
    offs.push(ctx.ui.observe.onEnter(box, reveal, { threshold: 0.3 }));
    box.addEventListener('focusin', reveal, { once: true });
    timer = setTimeout(reveal, FALLBACK_MS);
  }

  return {
    update() { /* findings read the whole filing, not the range */ },
    destroy() { clearTimeout(timer); offs.forEach((f) => f && f()); el.replaceChildren(); },
  };
}
