// For unit tests of the pages and builders that read astro:content (through src/lib/content.js): importing this
// stands astro:content in with a loader, as worker-env.mjs does for .sql, and lets a JSON file under src/data/ be
// imported the way the build imports it. setCollections({ posts, notes, now, research, projects }) gives the entries
// getCollection() answers with, each { id: <slug>, data: <frontmatter>, text?: <the extraction> }; render(entry)
// answers entry.text as remarkPluginFrontmatter.text. Set them before the module under test first reads them.
import { register } from 'node:module';

register('data:text/javascript,' + encodeURIComponent(`
  import { readFile } from 'node:fs/promises';
  export async function resolve(specifier, context, next) {
    return specifier === 'astro:content' ? { url: 'stub:astro-content', shortCircuit: true } : next(specifier, context);
  }
  export async function load(url, context, next) {
    if (url === 'stub:astro-content') {
      return { format: 'module', shortCircuit: true, source: 'export const getCollection = async (name) => [...(globalThis.COLLECTIONS?.[name] ?? [])];'
        + 'export const render = async (entry) => ({ remarkPluginFrontmatter: { text: entry.text } });' };
    }
    if (url.startsWith('file:') && url.includes('/src/data/') && url.endsWith('.json') && context.importAttributes?.type !== 'json') {
      return { format: 'module', shortCircuit: true, source: 'export default ' + await readFile(new URL(url), 'utf8') };
    }
    return next(url, context);
  }`));

export function setCollections(collections) {
  globalThis.COLLECTIONS = collections;
}
