// The agentic-search part: the model gets the question and three tools, and decides what to look up, turn by turn.
// Pick a question, then step through its turns: each tool call with its arguments and the result the model read, the
// window growing, the map shading in, the figures adding up, and the answer at the last turn. Every recorded call can
// be run again live on the site's own files (live.js), and so can a reader's own.
import { lazy } from '../../../../scripts/lazy.js';
import { h } from '../../../_lib/dom.js';
import { answer, blogMap, eyebrow, fmt, foot, grade, listedBy, meter, picker, secs, seenBy, stats, usd } from './ui.js';

const call = (c) => `${c.name}(${Object.entries(c.args ?? {}).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')})`;
let live = null;
const loadLive = () => (live ??= lazy(() => import('./live.js')).catch((e) => { live = null; throw e; }));
const FAILED = 'The site’s files couldn’t be read just now. Try again in a minute.';

// The posts listed since the recording, in words, this one named if it is among them.
function since(added, ctx) {
  const home = added.some((p) => p.slug === ctx.home);
  if (added.length === 1) return `${home ? 'This post has' : `“${added[0].title}” has`} been listed since`;
  return `${added.length} posts have been listed since${home ? ', this one among them' : ''}`;
}

// The button that runs a recorded call again: first on the posts it searched then (still listed, as they read today),
// so "Same" means the recording is what the tool returns; then on every post listed today, if that differs.
function rerun(c, ctx) {
  const out = h('div', { class: 'gl-live', 'aria-live': 'polite' });
  const go = h('button', { type: 'button', class: 'gl-btn gl-btn-small', text: 'Run this call live' });
  go.addEventListener('click', async () => {
    if (go.getAttribute('aria-disabled') === 'true') return;   // still running: the button keeps its focus
    go.setAttribute('aria-disabled', 'true');
    out.setAttribute('aria-busy', 'true');
    out.replaceChildren(h('p', { class: 'gl-note', text: 'Reading the site’s files…' }));
    try {
      const { runLive } = await loadLive();
      const then = await runLive(c.name, c.args, { only: ctx.recorded, projects: ctx.projects });
      const now = await runLive(c.name, c.args, { projects: ctx.projects });
      const added = now.listed.filter((p) => !ctx.recorded.has(p.slug));
      const gone = ctx.recorded.size - then.listed.length;
      const today = (text, label) => h('details', { class: 'gl-result' }, h('summary', { text: label }), h('pre', { text }));
      if (then.text !== c.result) {
        const why = gone ? `${gone} of the ${ctx.recorded.size} posts it searched ${gone === 1 ? 'is' : 'are'} no longer listed`
          : `Some of the ${ctx.recorded.size} posts it searched have changed since`;
        out.replaceChildren(h('p', { class: 'gl-note' }, h('b', { text: 'Different from the recorded run. ' }), `${why}.`),
          today(now.text, 'What it returns today'));
      } else if (now.text === c.result) {
        out.replaceChildren(h('p', { class: 'gl-note' }, h('b', { text: 'Same as the recorded run. ' }),
          `Run just now on the ${now.listed.length} posts listed today.`));
      } else {
        out.replaceChildren(h('p', { class: 'gl-note' }, h('b', { text: 'Same as the recorded run' }),
          `, on the ${then.listed.length} posts it searched. ${since(added, ctx)}, so on all ${now.listed.length} listed today it returns something new.`),
        today(now.text, `What it returns on all ${now.listed.length} today`));
      }
    } catch {
      out.replaceChildren(h('p', { class: 'gl-note', text: FAILED }));
    }
    out.removeAttribute('aria-busy');
    go.removeAttribute('aria-disabled');
  });
  return [go, out];
}

function turnView(s, i, last, ctx) {
  const head = `Turn ${i + 1}: ${s.calls.length ? `${s.calls.length} tool ${s.calls.length === 1 ? 'call' : 'calls'}` : 'the answer'}, `
    + `${secs(s.ms)}, the model read ${fmt(s.usage.in)} tokens`;
  return h('li', { class: `gl-turn${last ? ' is-last' : ''}` }, h('p', { class: 'gl-turn-head', text: head }),
    s.content && s.calls.length ? h('p', { class: 'gl-says', text: s.content }) : null,
    s.calls.map((c) => {
      const [go, out] = rerun(c, ctx);
      return h('div', { class: 'gl-call' }, h('div', { class: 'gl-call-head' }, h('code', { class: 'gl-sig', text: call(c) }), go),
        h('details', { class: 'gl-result' }, h('summary', { text: `What it returned (${fmt(c.result.length)} characters)` }), h('pre', { text: c.result })),
        out);
    }));
}

function playground(ctx) {
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
      out.textContent = (await runLive(tool.value, args, { literal: true, projects: ctx.projects })).text;
    } catch { out.textContent = FAILED; }
  };
  return h('form', { class: 'gl-play', onsubmit: run }, h('p', { class: 'gl-label', text: 'Try the tools yourself, live on the site' }),
    h('div', { class: 'gl-play-row' }, tool, input, h('button', { type: 'submit', class: 'gl-btn', text: 'Run' })), out,
    h('p', { class: 'gl-note', text: 'The same code the agent ran, on the posts listed right now. Your words are searched as plain text.' }));
}

export function draw(host, blog, data) {
  // The posts the recording searched, the project labels it mapped, and the post this demo sits in.
  const ctx = { recorded: new Set(blog.posts.map((p) => p[1])), projects: blog.projects ?? {},
    home: host.closest('[data-slug]')?.dataset.slug ?? '' };
  const m = meter(blog.window);
  const map = blogMap(blog);
  const turns = h('ol', { class: 'gl-turns' });
  const body = h('div', { class: 'gl-run' });
  const end = h('div', { class: 'gl-end' });
  const where = h('p', { class: 'gl-where', 'aria-live': 'polite' });
  let run = null;
  let views = [];   // each turn's view of this run, made once, so a live result or an opened result stays as you step
  let at = 0;
  const prev = h('button', { type: 'button', class: 'gl-btn', text: 'Back', onclick: () => go(at - 1) });
  const next = h('button', { type: 'button', class: 'gl-btn is-main', text: 'Next turn', onclick: () => go(at + 1) });
  const all = h('button', { type: 'button', class: 'gl-btn', text: 'Show every turn', onclick: () => go(run.steps.length - 1) });

  function go(i) {
    const n = run.steps.length;
    at = Math.max(0, Math.min(n - 1, i));
    const shown = run.steps.slice(0, at + 1);
    while (turns.children.length > at + 1) turns.lastElementChild.remove();
    for (let j = turns.children.length; j <= at; j++) turns.append(views[j] ??= turnView(run.steps[j], j, j === n - 1, ctx));
    const u = shown.at(-1).usage;
    m.set(u.in, u.hit, at === n - 1 ? 'The last turn, the biggest' : `Turn ${at + 1}`);
    const calls = shown.flatMap((s) => s.calls);
    map.shade(calls.reduce((seen, c) => seenBy(c, seen), new Map()), { listed: calls.reduce((l, c) => listedBy(c, l), new Set()) });
    const sum = (k) => shown.reduce((t, s) => t + s.usage[k], 0);
    const tools = shown.reduce((t, s) => t + s.calls.length, 0);
    const done = at === n - 1;
    where.textContent = `Turn ${at + 1} of ${n}`;
    // A button that turns itself off hands the keyboard's focus to the other way, so it never drops to the page.
    const focused = document.activeElement;
    prev.disabled = at === 0;
    next.disabled = done;
    all.disabled = done;
    if (focused?.disabled && [prev, next, all].includes(focused)) (focused === prev ? next : prev).focus();
    body.replaceChildren(
      stats([['Model turns', `${at + 1}`], ['Tool calls', `${tools}`], ['Read in all', `${fmt(sum('in'))} tokens, ${Math.round((sum('hit') / Math.max(1, sum('in'))) * 100)}% from the cache`],
        ['Time so far', secs(shown.reduce((t, s) => t + s.ms + s.calls.reduce((a, c) => a + c.ms, 0), 0))], ['Cost so far', usd(shown.reduce((t, s) => t + s.usd, 0))]]));
    end.replaceChildren(...(done ? [answer(run.answer), grade(run)] : [h('p', { class: 'gl-note', text: 'The answer comes at the last turn.' })]));
  }

  const pick = (i) => {
    run = data.runs[i];
    views = [];
    turns.replaceChildren();
    go(0);
  };
  const root = h('div', { class: 'gl gl-agent' }, eyebrow('agent'), picker(data.runs, pick),
    h('div', { class: 'gl-nav' }, prev, where, next, all), m.el, map.el, body, turns, end, playground(ctx), foot(blog));
  pick(0);
  host.replaceChildren(root);
  return () => root.remove();
}
