// The agent's tools on the live site: the corpus built from the same three files the recorder read from dist/
// (/ask/manifest.json, its packs and /rss.xml, src/lib/goobie-lab/corpus.js), fetched once on the first live run, so
// a tool call re-run here sees every post listed now. Free: static files, no model and no Worker call.
import { corpusOf, packFiles, unfragment, within } from '../../../../lib/goobie-lab/corpus.js';
import { runTool } from '../../../../lib/goobie-lab/tools.js';

let ready = null;
const get = async (url, json) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return json ? r.json() : r.text();
};

// projects: each project's label and key, as the recording had them (runs/blog.json).
export function liveCorpus(projects) {
  ready ??= (async () => {
    const [manifest, rss] = await Promise.all([get('/ask/manifest.json', true), get('/rss.xml', false)]);
    const packs = await Promise.all(packFiles(manifest).map(async (f) => unfragment(await get(f, false))));
    return corpusOf({ manifest, packs, rss, projects });
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

// One call on the live corpus: { text, listed: [{ slug, title }] }, listed the posts it ran on. literal: a reader's own
// words, searched as plain text. only: a Set of slugs, to run it on just those posts (the ones a recorded call searched).
export async function runLive(name, args, { literal = false, only = null, projects = {} } = {}) {
  const all = await liveCorpus(projects);
  const corpus = only ? within(all, only) : all;
  return { ...runTool(corpus, name, args, { literal }), listed: corpus.posts.map((p) => ({ slug: p.slug, title: p.title })) };
}
