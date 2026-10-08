import { defineConfig } from 'astro/config';
import rehypePostImages from './scripts/rehype-post-images.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Dev-only. The scene is a canvas, so the only way to review it is to render a frame and
// look at it; this lets the page POST a data URL and have it land in captures/ as a file.
// It is a Vite dev middleware, so it does not exist in the production build.
function captureEndpoint() {
  return {
    name: 'home-scene-capture',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__capture', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('POST only');
        }
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          try {
            const { name, data } = JSON.parse(body);
            const dir = path.resolve('captures');
            fs.mkdirSync(dir, { recursive: true });
            const safe = String(name).replace(/[^a-z0-9._-]/gi, '_');
            const b64 = String(data).replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(path.join(dir, safe), Buffer.from(b64, 'base64'));
            res.end('ok ' + safe);
          } catch (e) {
            res.statusCode = 500;
            res.end('err ' + e.message);
          }
        });
      });
    },
  };
}

// The hover-card endpoint (src/pages/ledger/previews.json.js) checks every card's media file
// on disk. The dev server is usually started from the folder above with --root blog, so
// process.cwd() isn't the project; hand the endpoint Astro's own idea of public/.
function publicDirConstant() {
  return {
    name: 'public-dir-constant',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        updateConfig({ vite: { define: { __PUBLIC_DIR__: JSON.stringify(fileURLToPath(config.publicDir)) } } });
      },
    },
  };
}

// Only main may reach the site. Workers Builds builds every branch pushed to GitHub, and on
// 2026-10-08 it deployed one to production: a cloud session had branched from the stale
// `master` (2026-08-02), so the live site went back two months until it was rolled back.
// Failing the build is what stops the deploy. Local builds don't set WORKERS_CI.
const ciBranch = process.env.WORKERS_CI ? process.env.WORKERS_CI_BRANCH : null;
if (ciBranch && ciBranch !== 'main') {
  throw new Error(
    `Not building "${ciBranch}" on Cloudflare: only main deploys aaronorelup.com. ` +
      'Rebase the branch onto main and merge it there (see CLAUDE.md).',
  );
}

export default defineConfig({
  site: 'https://aaronorelup.com',
  integrations: [publicDirConstant()],
  markdown: {
    // Both themes, emitted as CSS custom properties rather than a baked-in
    // background — panel.css picks one based on the day/night mode. A single
    // theme here hardcodes `background-color` inline on <pre>, which beat the
    // palette and left every code block white in night mode.
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
    // Every post picture gets its file's width and height (no jumping text as they load), and
    // a data-full link to a larger copy when one sits beside it. See the plugin.
    rehypePlugins: [rehypePostImages],
  },
  vite: {
    plugins: [captureEndpoint()],
  },
});
