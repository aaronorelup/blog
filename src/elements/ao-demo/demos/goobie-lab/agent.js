// The agentic-search part: the model gets the question and three tools, and decides what to look up, turn by turn.
// Pick a question, then step through its turns: each tool call with its arguments and the result the model read, the
// window growing, the map shading in, the figures adding up, and the answer at the last turn. Every recorded call can
// be run again live on the site's own files (live.js), and so can a reader's own.
import { h } from '../../../_lib/dom.js';
import { answer, blogMap, eyebrow, fmt, foot, grade, meter, picker, secs, seenBy, stats, usd } from './ui.js';

const call = (c) => `${c.name}(${Object.entries(c.args ?? {}).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')})`;
let live = null;
const loadLive = () => (live ??= import('./live.js').catch((e) => { live = null; throw e; }));

function rerun(c) {
  const out = h('div', { class: 'gl-live', 'aria-live': 'polite' });
  const go = h('button', { type: 'button', class: 'gl-btn gl-btn-small', text: 'Run this call live' });
  go.addEventListener('click', async () => {
    go.disabled = true;
    out.replaceChildren(h('p', { class: 'gl-note', text: 'Reading the site’s files…' }));
    try {
      const { runLive } = await loadLive();
      const r = await runLive(c.name, c.args);
      const same = r.text === c.result;
      const note = h('p', { class: 'gl-note' }, h('b', { text: same ? 'Same as the recorded run. ' : 'Different from the recorded run. ' }),
        same ? `Run just now on the ${r.posts} posts listed today.` : `The site has changed since: ${r.posts} posts are listed today.`);
      out.replaceChildren(note, ...(same ? [] : [h('details', { class: 'gl-result' }, h('summary', { text: 'What it returns today' }), h('pre', { text: r.text }))]));
    } catch {
      out.replaceChildren(h('p', { class: 'gl-note', text: 'The site’s files couldn’t be read just now. Try again in a minute.' }));
    }
    go.disabled = false;
  });
  return [go, out];
}

function turnView(s, i, last) {
  const head = `Turn ${i + 1}: ${s.calls.length ? `${s.calls.length} tool ${s.calls.length === 1 ? 'call' : 'calls'}` : 'the answer'}, `
    + `${secs(s.ms)}, the model read ${fmt(s.usage.in)} tokens`;
  return h('li', { class: `gl-turn${last ? ' is-last' : ''}` }, h('p', { class: 'gl-turn-head', text: head }),
    s.content && s.calls.length ? h('p', { class: 'gl-says', text: s.content }) : null,
    s.calls.map((c) => {
      const [go, out] = rerun(c);
      return h('div', { class: 'gl-call' }, h('div', { class: 'gl-call-head' }, h('code', { class: 'gl-sig', text: call(c) }), go),
        h('details', { class: 'gl-result' }, h('summary', { text: `What it returned (${fmt(c.result.length)} characters)` }), h('pre', { text: c.result })),
        out);
    }));
}

function playground() {
  const tool = h('select', { class: 'gl-select', 'aria-label': 'Tool' },
    h('option', { value: 'grep', text: 'grep: every line with these words' }), h('option', { value: 'read', text: 'read: a post, by its slug' }),
    h('option', { value: 'list_posts', text: 'list_posts: posts on or after a date (YYYY-MM-DD)' }));
  const input = h('input', { type: 'text', class: 'gl-input', value: 'graphics card', 'aria-label': 'What to search for, the slug or the date', maxlength: '200' });
  const out = h('pre', { class: 'gl-play-out', 'aria-live': 'polite' });
  const run = async (e) => {
    e.preventDefault();
    const v = input.value.trim();
    const args = { grep: { pattern: v }, read: { slug: v }, list_posts: v ? { after: v } : {} }[tool.value];
    out.textContent = 'Reading the site’s files…';
    try {
      const { runLive } = await loadLive();
      out.textContent = (await runLive(tool.value, args, { literal: true })).text;
    } catch { out.textContent = 'The site’s files couldn’t be read just now. Try again in a minute.'; }
  };
  return h('form', { class: 'gl-play', onsubmit: run }, h('p', { class: 'gl-label', text: 'Try the tools yourself, live on the site' }),
    h('div', { class: 'gl-play-row' }, tool, input, h('button', { type: 'submit', class: 'gl-btn', text: 'Run' })), out,
    h('p', { class: 'gl-note', text: 'The same code the agent ran, on the posts listed right now. Your words are searched as plain text.' }));
}

export function draw(host, blog, data) {
  const m = meter(blog.window);
  const map = blogMap(blog);
  const turns = h('ol', { class: 'gl-turns' });
  const body = h('div', { class: 'gl-run' });
  const end = h('div', { class: 'gl-end' });
  const where = h('p', { class: 'gl-where', 'aria-live': 'polite' });
  let run = null;
  let at = 0;
  const prev = h('button', { type: 'button', class: 'gl-btn', text: 'Back', onclick: () => go(at - 1) });
  const next = h('button', { type: 'button', class: 'gl-btn is-main', text: 'Next turn', onclick: () => go(at + 1) });
  const all = h('button', { type: 'button', class: 'gl-btn', text: 'Show every turn', onclick: () => go(run.steps.length - 1) });

  function go(i) {
    const n = run.steps.length;
    at = Math.max(0, Math.min(n - 1, i));
    const shown = run.steps.slice(0, at + 1);
    turns.replaceChildren(...shown.map((s, j) => turnView(s, j, j === n - 1)));
    const u = shown.at(-1).usage;
    m.set(u.in, u.hit, at === n - 1 ? 'The last turn, the biggest' : `Turn ${at + 1}`);
    map.shade(shown.flatMap((s) => s.calls).reduce((seen, c) => seenBy(c, seen), new Map()));
    const sum = (k) => shown.reduce((t, s) => t + s.usage[k], 0);
    const tools = shown.reduce((t, s) => t + s.calls.length, 0);
    const done = at === n - 1;
    where.textContent = `Turn ${at + 1} of ${n}`;
    prev.disabled = at === 0;
    next.disabled = done;
    all.disabled = done;
    body.replaceChildren(
      stats([['Model turns', `${at + 1}`], ['Tool calls', `${tools}`], ['Read in all', `${fmt(sum('in'))} tokens, ${Math.round((sum('hit') / Math.max(1, sum('in'))) * 100)}% from the cache`],
        ['Time so far', secs(shown.reduce((t, s) => t + s.ms + s.calls.reduce((a, c) => a + c.ms, 0), 0))], ['Cost so far', usd(shown.reduce((t, s) => t + s.usd, 0))]]));
    end.replaceChildren(...(done ? [answer(run.answer), grade(run)] : [h('p', { class: 'gl-note', text: 'The answer comes at the last turn.' })]));
  }

  const pick = (i) => {
    run = data.runs[i];
    go(0);
  };
  const root = h('div', { class: 'gl gl-agent' }, eyebrow('agent'), picker(data.runs, pick),
    h('div', { class: 'gl-nav' }, prev, where, next, all), m.el, map.el, body, turns, end, playground(), foot(blog));
  pick(0);
  host.replaceChildren(root);
  return () => root.remove();
}
