// The content collections' schemas, loaded in plain Node: `astro:content` is resolved to astro's own zod, an
// identity defineCollection and a string reference(), `astro/loaders` to a no-op glob, and an extensionless
// relative import to its .ts file, so a test can parse frontmatter without a build. Reads src/content.config.ts.
import { register } from 'node:module';

const zod = import.meta.resolve('astro/zod');
const content = `import { z } from ${JSON.stringify(zod)}; export { z };
  export const defineCollection = (c) => c; export const reference = () => z.string();`;
const loaders = `export const glob = (o) => ({ name: 'glob', ...o });`;
const data = (src) => 'data:text/javascript,' + encodeURIComponent(src);
register(data(`
  import fs from 'node:fs';
  export async function resolve(spec, ctx, next) {
    if (spec === 'astro:content') return { url: ${JSON.stringify(data(content))}, shortCircuit: true };
    if (spec === 'astro/loaders') return { url: ${JSON.stringify(data(loaders))}, shortCircuit: true };
    if (/^\\.\\.?\\//.test(spec) && !/\\.[cm]?[jt]s$/.test(spec) && ctx.parentURL?.startsWith('file:')) {
      const ts = new URL(spec + '.ts', ctx.parentURL);
      if (fs.existsSync(ts)) return { url: ts.href, shortCircuit: true };
    }
    return next(spec, ctx);
  }`));

export const { collections } = await import('../../src/content.config.ts');
