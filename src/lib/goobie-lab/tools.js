// The Goobie lab agent's three tools over corpus.js's posts, run by the recorder and re-run by the page: list_posts
// (the catalog, filtered by topic, project, author or date), grep (every line that matches, with its section mark)
// and read (a post's outline, or one section in full). Each returns the exact text the model was shown. TOOLS is
// their schema as the model gets it. A reader's own search is literal (escaped), so no pattern can hang the page.
import { sectionName } from './corpus.js';

export const LIMITS = { matches: 40, line: 240, section: 8000, pattern: 200 };

const fmt = (n) => n.toLocaleString('en-US');
const str = { type: 'string' };
export const TOOLS = [
  { type: 'function', function: { name: 'list_posts', description: 'Every post as one line: id, date, topic, '
    + 'author, slug, title and size, oldest first. All filters are optional and combine.',
  parameters: { type: 'object', properties: {
    topic: { type: 'string', enum: ['video', 'art', '3d', 'games', 'agents', 'learning', 'site'] },
    project: { ...str, description: 'a project key, like evening-television or blackwater' },
    by: { type: 'string', enum: ['Aaron', 'Claude'] },
    after: { ...str, description: 'YYYY-MM-DD: posts dated on or after it' },
    before: { ...str, description: 'YYYY-MM-DD: posts dated on or before it' } } } } },
  { type: 'function', function: { name: 'grep', description: 'Every line of every post that matches a regular '
    + 'expression (case-insensitive unless told), with the post slug and section mark. Shows the first 40 lines '
    + 'and every post\'s count.',
  parameters: { type: 'object', required: ['pattern'], properties: { pattern: str,
    slug: { ...str, description: 'search only this post' }, case_sensitive: { type: 'boolean' } } } } },
  { type: 'function', function: { name: 'read', description: 'Without a section: the post\'s outline (its section '
    + 'marks and sizes) and its short version. With a section mark like 55.2 or 26.N3: that section in full.',
  parameters: { type: 'object', required: ['slug'], properties: { slug: str, section: str } } } },
];

const head = (p) => `${p.id} ${p.date} ${p.topic} by ${p.by} ${p.slug}`;
// The slugs sharing the most words with one that doesn't exist, as a hint.
const closest = (corpus, slug) => {
  const words = new Set(String(slug ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  const near = corpus.posts.map((p) => [p.slug, p.slug.split('-').filter((w) => words.has(w)).length])
    .filter(([, n]) => n).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);
  return `No post has the slug "${slug}".${near.length ? ` Did you mean ${near.join(', ')}?` : ''} list_posts shows every slug.`;
};

function listPosts(corpus, a) {
  const posts = corpus.posts.filter((p) => (!a.topic || p.topic === a.topic) && (!a.by || p.by === a.by)
    && (!a.project || p.projects.includes(a.project)) && (!a.after || p.date >= a.after) && (!a.before || p.date <= a.before));
  const filters = ['topic', 'project', 'by', 'after', 'before'].filter((k) => a[k]).map((k) => `${k} ${a[k]}`);
  const lines = posts.map((p) => `${head(p)}${p.projects.length ? ` [${p.projects.join(', ')}]` : ''} | ${p.title} | ${fmt(p.tokens)} tokens`);
  return { text: [`${posts.length} posts${filters.length ? ` (${filters.join(', ')})` : ''}, oldest first:`, ...lines].join('\n'),
    slugs: posts.map((p) => p.slug) };
}

// A regular expression from the model's pattern (an invalid one is searched as plain text), or a reader's text.
export function patternOf(pattern, { literal = false, caseSensitive = false } = {}) {
  const src = String(pattern ?? '').slice(0, LIMITS.pattern);
  const flags = caseSensitive ? 'g' : 'gi';
  const plain = () => new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  if (literal) return plain();
  try { return new RegExp(src, flags); } catch { return plain(); }
}

// The part of a line around its first match, at most LIMITS.line characters.
function around(line, at, len) {
  if (line.length <= LIMITS.line) return line;
  const start = Math.max(0, Math.min(at - Math.floor((LIMITS.line - len) / 2), line.length - LIMITS.line));
  return `${start ? '…' : ''}${line.slice(start, start + LIMITS.line).trim()}${start + LIMITS.line < line.length ? '…' : ''}`;
}

export function grep(corpus, a, opts = {}) {
  const re = patternOf(a.pattern, { literal: opts.literal, caseSensitive: a.case_sensitive });
  if (!re.source || re.source === '(?:)') return { text: 'grep needs a pattern.', hits: [] };
  const posts = a.slug ? [corpus.bySlug.get(a.slug)].filter(Boolean) : corpus.posts;
  if (a.slug && !posts.length) return { text: closest(corpus, a.slug), hits: [] };
  const hits = [];
  const counts = [];
  for (const p of posts) {
    let n = 0;
    for (const s of p.sections) {
      for (const line of s.text.split('\n')) {
        re.lastIndex = 0;
        const all = [...line.matchAll(re)].filter((m) => m[0]);
        if (!all.length) continue;
        n += all.length;
        hits.push({ slug: p.slug, mark: s.mark, line: around(line, all[0].index, all[0][0].length) });
      }
    }
    if (n) counts.push([p.slug, n]);
  }
  const total = counts.reduce((t, [, n]) => t + n, 0);
  const shown = hits.slice(0, LIMITS.matches);
  const text = [`${fmt(total)} matches in ${counts.length} posts for /${re.source}/${re.flags.includes('i') ? 'i' : ''}`
    + `${counts.length ? `: ${counts.map(([s, n]) => `${s} ${n}`).join(', ')}` : ''}`,
  ...shown.map((h) => `${h.slug} [${h.mark}] ${h.line}`),
  ...(hits.length > shown.length ? [`(${hits.length - shown.length} more lines not shown: narrow the pattern or pass a slug)`] : [])].join('\n');
  return { text, hits, counts };
}

function read(corpus, a) {
  const p = corpus.bySlug.get(a.slug);
  if (!p) return { text: closest(corpus, a.slug) };
  if (!a.section) {
    const short = p.sections.find((s) => s.anchor === 'short' && s.kind === 'post');
    return { text: [`${head(p)} | ${p.title} | ${p.url}`, 'Sections:',
      ...p.sections.map((s) => `[${s.mark}] ${sectionName(s)} (${fmt(s.text.length)} characters)`),
      ...(short ? ['', `[${short.mark}] ${sectionName(short)}`, short.text] : [])].join('\n'), slug: p.slug };
  }
  const want = String(a.section).replace(/^\[|\]$/g, '');
  const mark = want.includes('.') ? want : `${p.n}.${want}`;
  const s = p.sections.find((x) => x.mark === mark);
  if (!s) return { text: `${p.slug} has no section ${a.section}. Its sections: ${p.sections.map((x) => x.mark).join(', ')}.`, slug: p.slug };
  const cut = s.text.length > LIMITS.section;
  return { text: `[${s.mark}] ${p.title}: ${sectionName(s)}\n${s.text.slice(0, LIMITS.section)}`
    + `${cut ? `\n(cut: ${fmt(s.text.length - LIMITS.section)} more characters)` : ''}`, slug: p.slug, mark: s.mark };
}

const RUN = { list_posts: listPosts, grep, read };

// One tool call: its name and its arguments as the model sent them (a JSON string or an object).
export function runTool(corpus, name, args, opts) {
  let a = args;
  if (typeof a === 'string') {
    try { a = JSON.parse(a || '{}'); } catch { return { text: `The arguments were not JSON: ${a.slice(0, 200)}` }; }
  }
  const fn = RUN[name];
  return fn ? fn(corpus, a ?? {}, opts) : { text: `There is no tool called ${name}. The tools: ${Object.keys(RUN).join(', ')}.` };
}
