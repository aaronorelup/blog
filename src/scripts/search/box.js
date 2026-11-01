// The ledger's search box (components/ledger/SearchBox.astro). Search: the words half (Pagefind) as the reader
// types and the meaning half (/api/search) after 400 ms of quiet or on Enter, merged into one list. Nothing loads
// before the box is first focused, and search needs no session. Ask Goobie loads ask.js only once it is opened, and
// keeps the box's text, selected.
// "/" focuses the box unless something else takes typing. mount(root) returns unmount.
import { load as loadCards } from '../cards/data.js';
import { lazy } from '../lazy.js';
import * as keyword from './keyword.js';
import { merge } from './merge.js';
import { resultsList } from './results.js';
import * as semantic from './semantic.js';

const QUIET = 400;        // ms without typing before the meaning half is asked
const MIN = 3;            // characters the meaning half and Ask need
const MAX = { search: 200, ask: 300 };
const PLACEHOLDER = { search: 'Search the ledger', ask: 'Ask Goobie about anything Aaron has written' };

const typing = (el) => el.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

export function mount(root) {
  const form = root.querySelector('[data-search]');
  const q$ = (s) => form.querySelector(s);
  const ui = { form, input: q$('.search-input'), go: q$('.search-go'), lens: q$('.search-lens'), goobie: q$('.search-goobie'),
    modes: q$('.search-modes'), note: q$('[data-search-note]'), turnstile: q$('[data-turnstile]'), out: q$('[data-search-out]') };
  let mode = 'search';
  let q = '';
  let words = { q: null, hits: [] };
  let meaning = { q: null, hits: [] };
  let quietT = 0;
  let ask = null;

  // Drawn once the words half has answered, or the meaning half has found something: an empty meaning answer that
  // comes first would say "nothing matches" before the words are in. A list whose query has gone (the box was
  // cleared or changed, or Ask opened) is never drawn.
  const render = async () => {
    if (mode !== 'search') return;
    const found = words.q === q ? words.hits : null;
    const meant = meaning.q === q ? meaning.hits : [];
    if (!found && !meant.length) return;
    const shown = q;
    const list = await resultsList(merge(found ?? [], meant), shown);
    if (!list || mode !== 'search' || q !== shown) return;
    ui.out.replaceChildren(list);
    performance.mark('search:results');
  };
  const askMeaning = async (text) => {
    clearTimeout(quietT);
    if (text.length < MIN) return;
    const hits = await semantic.search(text);
    if (hits && text === q) { meaning = { q: text, hits }; render(); }
  };
  const onInput = async () => {
    if (mode !== 'search') return;
    const text = (q = ui.input.value.trim());
    clearTimeout(quietT);
    if (!text) { ui.out.replaceChildren(); return; }
    quietT = setTimeout(() => askMeaning(text), QUIET);
    const hits = await keyword.search(text);
    if (hits && text === q) { words = { q: text, hits }; render(); }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const text = ui.input.value.trim();
    if (mode !== 'ask') return askMeaning(text);
    // The reply is drawn only if Ask is still open when it comes.
    if (text.length >= MIN) ask.ask(ui, text).then((reply) => { if (reply && mode === 'ask') ui.out.replaceChildren(reply); });
  };

  const setMode = (next) => {
    mode = next;
    clearTimeout(quietT);
    for (const b of ui.modes.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    ui.lens.classList.toggle('is-off', mode === 'ask');
    ui.goobie.hidden = mode !== 'ask';
    ui.go.hidden = mode !== 'ask';
    ui.input.placeholder = PLACEHOLDER[mode];
    ui.input.setAttribute('aria-label', PLACEHOLDER[mode]);
    ui.input.maxLength = MAX[mode];
    ui.out.replaceChildren();
    words = meaning = { q: null, hits: [] };
    ui.input.focus();
    // Ask keeps what was typed, selected: Enter asks it as it stands, typing replaces it with a question.
    if (mode === 'search') onInput();
    else ui.input.select();
  };
  const onMode = async (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b || b.dataset.mode === mode) return;
    if (b.dataset.mode === 'search') return setMode('search');
    ask ??= await lazy(() => import('./ask.js'));
    if (await ask.open(ui)) return setMode('ask');
    ui.modes.hidden = true;
    ui.note.textContent = 'Goobie is resting.';
    ui.note.hidden = false;
  };
  // The index and the card data (titles, icons) a result needs, both on the first focus.
  const onFocus = () => { keyword.load(); loadCards(); };
  const onSlash = (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
    if (!ui.input.getClientRects().length || getComputedStyle(ui.input).visibility !== 'visible') return;
    e.preventDefault();
    ui.input.focus();
  };

  ui.input.maxLength = MAX.search;
  ui.input.addEventListener('input', onInput);
  ui.input.addEventListener('focus', onFocus, { once: true });
  form.addEventListener('submit', onSubmit);
  ui.modes.addEventListener('click', onMode);
  document.addEventListener('keydown', onSlash);
  return () => {
    ui.input.removeEventListener('input', onInput);
    ui.input.removeEventListener('focus', onFocus);
    form.removeEventListener('submit', onSubmit);
    ui.modes.removeEventListener('click', onMode);
    document.removeEventListener('keydown', onSlash);
  };
}
