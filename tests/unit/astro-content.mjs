// For unit tests of the pages and builders that read astro:content (through src/lib/content.js): importing this
// stands astro:content in with a loader, as worker-env.mjs does for .sql, and lets a JSON file under src/data/ be
// imported the way the build imports it. setCollections({ posts, notes, now, research, projects }) gives the entries
// getCollection() answers with, each { id: <slug>, data: <frontmatter>, text?: <the extraction> }; render(entry)
// answers entry.text as remarkPluginFrontmatter.text. Set them before the module under test first reads them. Vite's
// import.meta.glob of JSON files (eager, default import: data/courses.js, lib/lore.js) is stood in for too.
import fs from 'node:fs';
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
    const loaded = await next(url, context);
    const source = loaded.source && String(loaded.source);
    if (url.startsWith('file:') && url.includes('/src/') && source?.includes('import.meta.glob(')) {
      return { ...loaded, source: source.replaceAll('import.meta.glob(', 'globalThis.viteGlob(import.meta.url, ') };
    }
    return loaded;
  }`));

// import.meta.glob(pattern, { eager: true, import: 'default' }) over JSON files, as the loader rewrites it: { './<path>':
// the parsed file } for each file the pattern's last part matches, none when its folder is missing.
globalThis.viteGlob = (base, pattern, { eager, import: name } = {}) => {
  if (!eager || name !== 'default' || !pattern.endsWith('.json')) throw new Error(`astro-content.mjs: no stand-in for import.meta.glob('${pattern}')`);
  const at = pattern.lastIndexOf('/') + 1;
  const dir = new URL(pattern.slice(0, at), base);
  const file = new RegExp(`^${pattern.slice(at).replace(/[.+^$()|[\]\\{}]/g, '\\$&').replaceAll('*', '[^/]*')}$`);
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => file.test(f)).sort() : [];
  return Object.fromEntries(names.map((f) => [pattern.slice(0, at) + f, JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))]));
};

export function setCollections(collections) {
  globalThis.COLLECTIONS = collections;
}
