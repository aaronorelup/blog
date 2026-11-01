// /read/<slug>.json for every built post: { slug, hash, voice, model, sections: [{ hash, chars, blocks: [[r, kind,
// text]] }] }. worker/read/step.js voices a post's missing sections from it; kind shapes the spoken copy (speak.js).
import { VOICE } from '../../data/voice.js';
import { allPosts, renderEntry, slugOf } from '../../lib/content.js';
import { postHash, sectionsOf } from '../../lib/read/sections.js';

export async function getStaticPaths() {
  return (await allPosts()).filter((post) => !post.data.draft)
    .map((post) => ({ params: { slug: slugOf(post) }, props: { post } }));
}

export async function GET({ props: { post } }) {
  const sections = sectionsOf(post.data, (await renderEntry(post)).remarkPluginFrontmatter.text);
  const body = { slug: slugOf(post), hash: postHash(sections), voice: VOICE.id, model: VOICE.model, sections };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
