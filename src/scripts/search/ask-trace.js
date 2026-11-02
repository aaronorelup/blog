// What RAG Goobie is doing while it works, one line a step as the stream's events come (worker/ask/run.js), each
// ticked when the next arrives, and a status line for screen readers; then one summary line under the answer. Only
// counts, the closed list of topic labels and listed posts' titles (previews.json) are ever shown: never a word the
// planner wrote.
import { TOPICS } from '../../data/taxonomy.js';
import { h } from './results.js';

const num = (n) => n.toLocaleString('en-US');
const posts = (n) => `${num(n)} post${n === 1 ? '' : 's'}`;
const k = (t) => `${Math.round(t / 1000)}k`;

function titles(focus, cards) {
  const names = focus.map((s) => cards[s]?.title).filter(Boolean);
  if (!names.length) return '';
  const [a, b] = names;
  const more = names.length - 2;
  return `, starting with ${b ? `${a}, ${b}` : a}${more > 0 ? ` and ${more} more` : ''}`;
}

// The line an event adds, or null for one that adds none.
export function line(e, start, cards) {
  if (e.t === 'start') return `Reading the catalog of ${posts(e.posts)}...`;
  if (e.t === 'plan') {
    if (e.skipped) return 'Searched without the catalog';
    const topics = e.topics.map((t) => TOPICS[t].label);
    return `Read the catalog of ${posts(start.posts)}: picked ${e.picks || 'none'}${topics.length ? ` (${topics.join(', ')})` : ''}`;
  }
  if (e.t === 'found') {
    if (e.skipped) return 'Searched by the catalog only';
    const close = e.matched ? `${num(e.matched)} look${e.matched === 1 ? 's' : ''} closely related` : 'nothing looks closely related';
    return `Searched ${e.searches} ways: ${num(e.passages)} passages from ${posts(e.posts)}, ${close}`;
  }
  if (e.t === 'read') {
    const all = e.given === e.of ? `all ${posts(e.of)}` : `${num(e.given)} of the ${posts(e.of)}`;
    return `Reading ${all} in full${titles(e.focus, cards)}`;
  }
  if (e.t === 'write') return 'Writing...';
  return null;
}

// "Read all 71 posts in full · 309k tokens, 99.9% from cache · 5.2 s · $0.0025", or the answer cache's line.
export function summary(a, read) {
  const took = `${(a.took / 1000).toFixed(1)} s`;
  if (a.cached) return h('p', { class: 'ask-summary' }, `Answered before, from the answer cache · ${took}`);
  // A fresh answer always follows its 'read' event (worker/ask/run.js).
  const all = read.given === read.of ? `Read all ${posts(read.of)} in full` : `Read ${num(read.given)} of the ${posts(read.of)} in full`;
  const cache = `${k(a.usage.tokens)} tokens, ${((100 * a.usage.hit) / a.usage.tokens).toFixed(1)}% from cache`;
  return h('p', { class: 'ask-summary' }, [all, cache, took, `$${a.usage.usd.toFixed(4)}`].join(' · '));
}

// The step list. on(e) takes every event before the answer; read is the last 'read' event, for the summary.
export function trace(cards) {
  const steps = h('ol', { class: 'ask-steps', 'aria-hidden': 'true' });
  const status = h('p', { class: 'visually-hidden', role: 'status' });
  const el = h('div', { class: 'ask-trace' }, steps, status);
  let start = null;
  const out = {
    el, read: null,
    on(e) {
      if (e.t === 'start') start = e;
      if (e.t === 'read') out.read = e;
      const text = line(e, start, cards);
      if (!text) return;
      steps.lastElementChild?.classList.add('is-done');
      steps.append(h('li', { class: 'ask-step' }, text));
      status.textContent = text;
    },
  };
  return out;
}
