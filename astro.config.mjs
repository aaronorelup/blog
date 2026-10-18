import { defineConfig } from 'astro/config';
import rehypePostImages from './scripts/rehype-post-images.mjs';
import statsPages from './scripts/stats-pages.mjs';
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

// Dev-only. /api/stats is answered by the Worker (worker/stats.js) in production; `astro dev`
// has no Worker, so this answers it from .stats-fixture.json at the project root (gitignored).
// ?state=not-connected, ?state=gathering and ?state=error show the page's other answers. The
// file is found from this config's own folder, not process.cwd(): the dev server is usually
// started from the folder above with --root blog.
const PROJECT_DIR = path.dirname(fileURLToPath(import.meta.url));
function statsFixture() {
  return {
    name: 'stats-fixture',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/stats', (req, res) => {
        const state = new URL(req.originalUrl || req.url, 'http://localhost').searchParams.get('state');
        const send = (status, body, cache = 'no-store') => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', cache);
          res.end(body);
        };
        const file = path.join(PROJECT_DIR, '.stats-fixture.json');
        if (state === 'error') return send(500, JSON.stringify({ error: 'The traffic numbers could not be read just now.' }));
        if (state === 'gathering') {
          return send(503, JSON.stringify({ error: 'The first numbers are still being gathered. They start to appear a few minutes after the counter starts, and fill in over the next couple of hours.', state: 'gathering' }));
        }
        if (state === 'not-connected' || !fs.existsSync(file)) {
          return send(503, JSON.stringify({ error: 'The traffic numbers aren’t connected yet.', state: 'not-connected' }));
        }
        send(200, fs.readFileSync(file, 'utf8'), 'public, max-age=300');
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
  // statsPages: dist/stats-pages.txt, the public pages /api/stats may name (worker/stats.js).
  integrations: [publicDirConstant(), statsPages()],
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
    plugins: [captureEndpoint(), statsFixture()],
  },
});
