// `node scripts/tools/hidden-models.mjs`: copies each lore hidden page's playable model into its own folder, from the
// `model` of its entry in src/data/hidden-pages.json (a page under /labs/teardown/) to <address>model/index.html,
// with three changes only: the robots noindex line after <meta charset>, the lab's "not canon" line emptied, and an
// in-world tab title, "<the page's own title> · SERVICE MODEL". Run it again when the lab fixes a model. It never writes
// the source (AO-073's, src/data/exempt.js) and never copies a -film.html page. scripts/check/hidden.mjs checks them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
export const ROBOTS = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">';
const CHARSET = /<meta charset="utf-8">/i;
export const LAB_LINE = /<div[^<>]*>teardown-lab experiment (?:\\xB7|·|&middot;) not canon<\/div>/g;
export const TITLE = /<title>([^<]*)<\/title>/;
export const modelTitle = (name) => `${name} · SERVICE MODEL`;

// The model page as the hidden page named `name` serves it, or an error saying which change could not be made.
export function adapt(html, name) {
  if (!CHARSET.test(html)) throw new Error('no <meta charset="utf-8"> to put the robots line after');
  if (!TITLE.test(html)) throw new Error('no <title> to give the in-world name');
  const lines = html.match(LAB_LINE) ?? [];
  if (lines.length !== 1) throw new Error(`expected the lab's "not canon" line once, found it ${lines.length} times`);
  const out = html.replace(CHARSET, (m) => `${m}\n${ROBOTS}`).replace(LAB_LINE, '<div hidden></div>')
    .replace(TITLE, () => `<title>${modelTitle(name)}</title>`);
  if (/not canon/i.test(out)) throw new Error('"not canon" is still in the page after the change');
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pages } = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/hidden-pages.json'), 'utf8'));
  let failed = 0;
  for (const { address, model } of pages.filter((p) => p.model)) {
    const from = path.join(PUBLIC, model, 'index.html');
    const to = path.join(PUBLIC, address, 'model', 'index.html');
    try {
      if (/-film\b/.test(model)) throw new Error('a -film page is never copied');
      const name = TITLE.exec(fs.readFileSync(path.join(PUBLIC, address, 'index.html'), 'utf8'))?.[1].trim();
      if (!name) throw new Error(`${address}index.html has no <title> to name the model by`);
      const html = adapt(fs.readFileSync(from, 'utf8'), name);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, html);
      console.log(`${model} -> ${address}model/ (${Math.round(html.length / 1024)} KB)`);
    } catch (error) {
      failed += 1;
      console.error(`${model} -> ${address}model/: ${error.message}`);
    }
  }
  process.exit(failed ? 1 : 0);
}
