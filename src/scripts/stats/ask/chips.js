// The question chips under the gate: the six questions a newcomer asks first, as links, plus
// Surprise me and All questions. They wrap onto as many rows as they need and never scroll
// sideways. On a phone the last two questions hide so the set fits in three rows; both are
// still one tap away in All questions.
//
// Each chip is a real <a href="#/…">, so the router pushes it and Back undoes it, and a reader
// can open one in a new tab. Surprise me walks the "Noticed" findings in order, one per tap,
// starting after the ones already on screen, and remembers its place for the tab's session.
import '../../../styles/stats/ask.css';
import { findings } from './findings.js';

const CHIPS = [
  { label: 'Does AI read this site?', href: '#/machines/bots/ai' },
  { label: 'What do people read?', href: '#/read' },
  { label: 'Where are readers from?', href: '#/where' },
  { label: 'Is it growing?', href: '#/growing' },
  { label: 'What are scanners after?', href: '#/machines/scanners', wide: true },
  { label: 'Is the site fast?', href: '#/speed', wide: true },
];
const SURPRISE_KEY = 'st-surprise';
const PHONE = '(max-width: 639px)';

const store = {
  get() { try { return sessionStorage.getItem(SURPRISE_KEY); } catch { return null; } },
  set(v) { try { sessionStorage.setItem(SURPRISE_KEY, v); } catch { /* private mode: forget it */ } },
};

let questions = null;
export const loadQuestions = () => (questions = questions || import('./questions.js'));

export async function mount(el, ctx) {
  const nav = document.createElement('nav');
  nav.className = 'st-ask-chips';
  nav.setAttribute('aria-label', 'Questions to start with');
  const ul = document.createElement('ul');
  ul.className = 'st-ask-chiplist';
  nav.append(ul);

  for (const c of CHIPS) {
    const li = document.createElement('li');
    if (c.wide) li.className = 'st-ask-more';
    const a = document.createElement('a');
    a.className = 'st-ask-chip';
    a.href = c.href;
    a.textContent = c.label;
    // A second tap on the chip whose hash is already in the address bar fires no hashchange;
    // send it through the router so it still scrolls there.
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (location.hash === c.href) { e.preventDefault(); ctx.router.go(c.href, { push: false }); }
    });
    li.append(a);
    ul.append(li);
  }

  let list = null;
  const rules = () => (list = list || findings(ctx));

  // Surprise me and All questions aren't questions; a thin rule before them sets them apart
  // (dropped when they wrap to the start of a row, where a rule would point at nothing).
  const surpriseLi = document.createElement('li');
  surpriseLi.className = 'st-ask-tools';
  const surprise = document.createElement('button');
  surprise.type = 'button';
  surprise.className = 'st-ask-chip st-ask-special';
  surprise.textContent = 'Surprise me';
  surprise.addEventListener('click', () => {
    const all = rules();
    if (!all.length) return;
    const last = store.get();
    let i = all.findIndex((r) => r.key === last);
    // First tap of the visit: start after the findings Noticed already shows.
    if (i < 0) i = Math.min(all.length, matchMedia(PHONE).matches ? 2 : 3) - 1;
    const next = all[(i + 1) % all.length];
    store.set(next.key);
    surprise.setAttribute('aria-describedby', live.id);
    live.textContent = `Surprise: ${next.eyebrow.toLowerCase()}.`;
    ctx.router.go(next.route, { push: true });
  });
  surpriseLi.append(surprise);

  const allLi = document.createElement('li');
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'st-ask-chip st-ask-special';
  allBtn.setAttribute('aria-haspopup', 'dialog');
  allBtn.textContent = 'All questions';
  allBtn.addEventListener('pointerenter', loadQuestions, { passive: true });
  allBtn.addEventListener('focus', loadQuestions);
  allBtn.addEventListener('click', async () => (await loadQuestions()).open(ctx, allBtn));
  allLi.append(allBtn);

  ul.append(surpriseLi, allLi);

  // Where Surprise me went, for screen readers (the visible answer is the place it lands).
  const live = document.createElement('p');
  live.className = 'st-sr';
  live.id = 'st-ask-surprise-live';
  live.setAttribute('aria-live', 'polite');
  nav.append(live);

  el.replaceChildren(nav);
  surpriseLi.hidden = !rules().length;
  if (surpriseLi.hidden) allLi.className = 'st-ask-tools';

  const first = surpriseLi.hidden ? allLi : surpriseLi;
  const rule = () => {
    const prev = first.previousElementSibling;
    // The wide-only chips are display:none on a phone; the row the rule follows is the last one shown.
    let p = prev;
    while (p && !p.offsetParent) p = p.previousElementSibling;
    // Measured with the rule drawn, so dropping it can't pull the pill back up a row and flicker.
    first.classList.remove('st-ask-wrapped');
    first.classList.toggle('st-ask-wrapped', !p || p.offsetTop !== first.offsetTop);
  };
  rule();
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(rule) : null;
  if (ro) ro.observe(ul);

  return {
    update() { /* the chips don't depend on the range */ },
    destroy() { if (ro) ro.disconnect(); el.replaceChildren(); },
  };
}
