// The ledger's search box (components/ledger/SearchBox.astro). Search: the words half (Pagefind) as the reader
// types and the meaning half (/api/search) after 400 ms of quiet or on Enter, merged into one list. Nothing loads
// before the box is first focused, and search needs no session. Ask RAG Goobie loads ask.js only once it is opened,
// keeps the box's text, selected, and cycles example questions in the empty box; its microphone loads hear.js on the
// first press. Text typed before this module ran is searched when it mounts; data-ready on the form says it has. "/"
// focuses the box unless something else takes typing. mount(root) returns unmount.
import { CYCLE_MS } from '../../data/ask.js';
import { load as loadCards } from '../cards/data.js';
import { lazy } from '../lazy.js';
import { examples } from './examples.js';
import * as keyword from './keyword.js';
import { merge } from './merge.js';
import { resultRows, resultsList, setBusy } from './results.js';
import * as semantic from './semantic.js';

const QUIET = 400;        // ms without typing before the meaning half is asked
const MIN = 3;            // characters the meaning half and Ask need
const MAX = { search: 200, ask: 300 };
const PLACEHOLDER = { search: 'Search the ledger', ask: 'Ask RAG Goobie about anything Aaron has written' };

const typing = (el) => el.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

export function mount(root) {
  const form = root.querySelector('[data-search]');
  const q$ = (s) => form.querySelector(s);
  const ui = { form, input: q$('.search-input'), go: q$('.search-go'), lens: q$('.search-lens'), goobie: q$('.search-goobie'),
    modes: q$('.search-modes'), note: q$('[data-search-note]'), turnstile: q$('[data-turnstile]'), out: q$('[data-search-out]'),
    line: q$('[data-ask-line]'), mic: q$('[data-mic]'), micTime: q$('[data-mic-time]'), voiceLine: q$('[data-voice-line]') };
  const cycle = examples(ui.input, PLACEHOLDER.ask, CYCLE_MS);
  let mode = 'search';
  let q = '';
  let words = { q: null, hits: [] };
  let meaning = { q: null, hits: [] };
  let quietT = 0;
  let ask = null;
  let hear = null;          // hear.js, loaded on the microphone's first press
  // The list on screen: its query, its <ol> and the pages in it.
  let shown = { q: null, list: null, paths: new Set() };

  // Drawn once the words half has answered, or the meaning half has found something: an empty meaning answer that
  // comes first would say "nothing matches" before the words are in. A list whose query has gone (the box was
  // cleared or changed, or Ask opened) is never drawn. A row on screen never moves or changes: a later draw for the
  // same query (more of the words half's passages, or the other half) only adds the pages not yet in the list, at
  // its end, so a reader's pointer stays on the row it reached. A new query draws a new list.
  const render = async () => {
    if (mode !== 'search') return;
    const found = words.q === q ? words.hits : null;
    const meant = meaning.q === q ? meaning.hits : [];
    if (!found && !meant.length) return;
    const at = q;
    const rows = await resultRows(merge(found ?? [], meant), at);
    if (!rows || mode !== 'search' || q !== at) return;
    const busy = !(words.q === at && words.done);
    if (shown.q === at && shown.list?.parentNode === ui.out) {
      const fresh = rows.filter((r) => !shown.paths.has(r.path));
      for (const r of fresh) shown.paths.add(r.path);
      shown.list.append(...fresh.map((r) => r.row));
      setBusy(shown.list, busy);
    } else {
      const list = resultsList(rows, at, busy);
      ui.out.replaceChildren(list);
      shown = rows.length ? { q: at, list, paths: new Set(rows.map((r) => r.path)) } : { q: null, list: null, paths: new Set() };
    }
    performance.mark('search:results');
  };
  const askMeaning = async (text) => {
    clearTimeout(quietT);
    if (text.length < MIN) return;
    const hits = await semantic.search(text);
    if (hits && text === q) { meaning = { q: text, hits }; render(); }
  };
  const onInput = () => {
    if (mode !== 'search') return;
    const text = (q = ui.input.value.trim());
    clearTimeout(quietT);
    if (!text) { ui.out.replaceChildren(); return; }
    quietT = setTimeout(() => askMeaning(text), QUIET);
    keyword.search(text, (hits, done) => { if (text === q) { words = { q: text, hits, done }; render(); } });
  };
  // The answer is drawn only while Ask is still open.
  const draw = (node) => { if (mode === 'ask') ui.out.replaceChildren(node); };
  const onSubmit = (e) => {
    e.preventDefault();
    const text = ui.input.value.trim();
    if (mode !== 'ask') return askMeaning(text);
    if (text.length >= MIN) ask.ask(ui, text, draw);
  };
  // Ask by voice: what was heard goes in the box and is asked as if typed.
  const onMic = async () => {
    hear ??= await lazy(() => import('./hear.js'));
    if (mode !== 'ask') return;
    hear.toggle(ui, { token: () => ask.token(ui), forget: ask.forget, draw,
      heard: (text) => { if (mode !== 'ask') return; ui.input.value = text; ask.ask(ui, text, draw); } });
  };

  const setMode = (next) => {
    mode = next;
    clearTimeout(quietT);
    for (const b of ui.modes.querySelectorAll('[data-mode]')) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    ui.lens.classList.toggle('is-off', mode === 'ask');
    ui.goobie.hidden = mode !== 'ask';
    ui.go.hidden = mode !== 'ask';
    ui.line.hidden = mode !== 'ask';
    ui.mic.hidden = mode !== 'ask' || !ask?.voice();
    if (mode !== 'ask') hear?.cancel();
    cycle.stop();
    ui.input.placeholder = PLACEHOLDER[mode];
    ui.input.setAttribute('aria-label', PLACEHOLDER[mode]);
    if (mode === 'ask') cycle.start();
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
    ui.note.textContent = 'RAG Goobie is resting.';
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
  ui.mic.addEventListener('click', onMic);
  document.addEventListener('keydown', onSlash);
  // What was typed (or focused) before this module ran is acted on now.
  if (document.activeElement === ui.input) onFocus();
  if (ui.input.value.trim()) onInput();
  form.dataset.ready = '';
  return () => {
    cycle.stop();
    hear?.cancel();
    delete form.dataset.ready;
    ui.input.removeEventListener('input', onInput);
    ui.input.removeEventListener('focus', onFocus);
    form.removeEventListener('submit', onSubmit);
    ui.modes.removeEventListener('click', onMode);
    ui.mic.removeEventListener('click', onMic);
    document.removeEventListener('keydown', onSlash);
  };
}
