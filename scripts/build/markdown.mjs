// The Markdown plugins in their order, for astro.config.mjs and the unit tests, and the pipeline that runs them. `v`
// hashes the code they run: Astro's content cache keys on the config, where a function counts for nothing, so without
// it a changed plugin would leave every unchanged post with its cached HTML.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { unified } from '@astrojs/markdown-remark';
import { isLivePath } from '../../src/data/exempt.js';
import { sha256hex, short } from '../../src/lib/text/hash.js';
import rehypeHeadingIds from './rehype-heading-ids.mjs';
import rehypePostImages from './rehype-post-images.mjs';
import rehypePostText from './rehype-post-text.mjs';

// The post components: a folder src/elements/<tag>/ is a tag (src/elements/CLAUDE.md).
const TAGS = fs.readdirSync(new URL('../../src/elements/', import.meta.url)).filter((d) => d.startsWith('ao-')).sort();

const CODE = ['rehype-heading-ids.mjs', 'rehype-post-images.mjs', 'rehype-post-text.mjs', '../../src/lib/text/rules.js',
  '../../src/data/exempt.js'];
const v = short(sha256hex(CODE.map((f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8')).join('\0')));

export const rehypePlugins = ({ publicDir }) => [
  [rehypePostImages, { publicDir }],
  rehypeHeadingIds,
  [rehypePostText, { tags: TAGS, v }],
];

// astro.config.mjs's markdown.processor: the unified (remark/rehype) pipeline with these plugins. Astro fails the
// build on a Markdown file that throws as it renders; a live notebook's page builds blank instead (Astro has logged
// why), because nothing about a live notebook may fail a build (src/data/exempt.js).
export function markdownProcessor({ publicDir }) {
  const base = unified({ rehypePlugins: rehypePlugins({ publicDir }) });
  return {
    ...base,
    async createRenderer(shared) {
      const { render } = await base.createRenderer(shared);
      return {
        render: (content, opts) => render(content, opts).catch((err) => {
          const file = fileURLToPath(opts.fileURL);
          if (!isLivePath(file)) throw err;
          console.warn(`[markdown] ${file} did not render; its page builds blank (live notebook)`);
          return { code: '', metadata: { headings: [], localImagePaths: [], remoteImagePaths: [], frontmatter: opts.frontmatter } };
        }),
      };
    },
  };
}
