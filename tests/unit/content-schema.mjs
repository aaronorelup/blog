// The content collections' schemas, loaded in plain Node: `astro:content` is resolved to astro's own zod and an
// identity defineCollection, so a test can parse frontmatter without a build. Reads src/content/config.ts.
import { register } from 'node:module';

const zod = import.meta.resolve('astro/zod');
const shim = `export { z } from ${JSON.stringify(zod)}; export const defineCollection = (c) => c;`;
register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(spec, ctx, next) {
    if (spec === 'astro:content') return { url: 'data:text/javascript,' + encodeURIComponent(${JSON.stringify(shim)}), shortCircuit: true };
    return next(spec, ctx);
  }`));

export const { collections } = await import('../../src/content/config.ts');
