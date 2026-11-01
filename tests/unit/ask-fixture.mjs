// A small blog for RAG Goobie's unit tests, built by the real build code (src/lib/ask/manifest.js assemble()): posts
// 1-6 (6 by Claude, with a notes page), 7 the live notebook. env() gives worker/ask/ stub bindings over it: ASSETS
// serving its files, an in-memory D1 (worker-env.mjs), Workers AI and Vectorize that count their calls, limiters.
import { assemble } from '../../src/lib/ask/manifest.js';
import { d1 } from './worker-env.mjs';

const section = (anchor, heading, text) => ({ anchor, heading, text });
export function doc(n, extra = {}) {
  const slug = extra.slug ?? `post-${n}`;
  return {
    n, slug, url: `/ledger/${slug}/`, title: `Title ${n}`, topic: n % 2 ? 'video' : 'agents', by: 'Aaron',
    takeaway: `What post ${n} found.`, live: false, notes: null,
    short: { anchor: 'short', heading: 'The short version', text: `Summary of post ${n}.` },
    sections: [section('', '', `Opening of post ${n}.`), section('first', 'First', `Post ${n} measured ${n * 10} seconds.`),
      section('second', 'Second', `More of post ${n}.`)],
    ...extra,
  };
}
export const DOCS = [1, 2, 3, 4, 5].map((n) => doc(n)).concat([
  doc(6, { by: 'Claude', notes: { title: 'Post 6: the making-of notes', url: '/ledger/post-6/notes/', by: 'Claude',
    summary: 'The whole run.', sections: [section('', '', 'Notes opening.'), section('what-went-wrong', 'What went wrong', 'A crash.')] } }),
  doc(7, { slug: 'live-lab', live: true, title: 'A fleet title' }),
]);

export const built = (docs = DOCS, opts = {}) => assemble(docs, { pins: [1], ...opts });

// Vector ids as search's chunks name them: AO-00n:i, AO-00nn:i for a notes page.
export const id = (n, i = 0, notes = false) => `AO-${String(n).padStart(3, '0')}${notes ? 'n' : ''}:${i}`;

export function env({ files, manifest }, { lists = [[id(2, 2), id(3, 1), id(7, 1)]], ...more } = {}) {
  const asked = { ai: 0, vectorize: 0, assets: 0, db: 0 };
  const db = d1();
  const counted = { prepare: (sql) => { asked.db++; return db.prepare(sql); }, batch: (l) => { asked.db++; return db.batch(l); } };
  let next = 0;
  return {
    asked, db,
    env: {
      SESSION_KEY: 'k', DEEPSEEK_API_KEY: 'test', DEEPSEEK_URL: 'https://deepseek.test/chat/completions', DB: counted,
      ASSETS: { fetch: async (req) => {
        asked.assets++;
        const path = new URL(req.url).pathname;
        if (path === '/ask/manifest.json') return Response.json(manifest);
        if (path === '/search/manifest.json') return Response.json({ model: '@cf/baai/bge-m3' });
        const file = files.get(path.slice('/ask/'.length));
        return file === undefined ? new Response(null, { status: 404 }) : new Response(file);
      } },
      AI: { run: async (model, { text }) => { asked.ai++; return { data: text.map(() => [0.1, 0.2]) }; } },
      SEARCH_INDEX: { query: async () => { asked.vectorize++; return { matches: (lists[next++ % lists.length]).map((x) => ({ id: x })) }; } },
      ASK_LIMIT: { limit: async () => ({ success: true }) },
      ASK_ALL: { limit: async () => ({ success: true }) },
      ...more,
    },
  };
}
