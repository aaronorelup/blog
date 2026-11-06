// The agent's tools on the live site: the corpus built from the same three files the recorder read from dist/
// (/ask/manifest.json, its packs and /rss.xml, src/lib/goobie-lab/corpus.js), fetched once on the first live run, so
// a tool call re-run here sees every post listed now. Free: static files, no model and no Worker call.
import { corpusOf, packFiles, unfragment } from '../../../../lib/goobie-lab/corpus.js';
import { runTool } from '../../../../lib/goobie-lab/tools.js';

let ready = null;
const get = async (url, json) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return json ? r.json() : r.text();
};

export function liveCorpus() {
  ready ??= (async () => {
    const [manifest, rss] = await Promise.all([get('/ask/manifest.json', true), get('/rss.xml', false)]);
    const packs = await Promise.all(packFiles(manifest).map(async (f) => unfragment(await get(f, false))));
    return corpusOf({ manifest, packs, rss });
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

// One call on the live corpus: { text, posts }. literal: a reader's own words, searched as plain text.
export async function runLive(name, args, { literal = false } = {}) {
  const corpus = await liveCorpus();
  return { ...runTool(corpus, name, args, { literal }), posts: corpus.posts.length };
}
