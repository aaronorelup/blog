// Dev only. /api/stats is answered by the Worker (worker/stats.js) in production; `astro dev` has no Worker,
// so this answers it from .stats-fixture.json at the project root (gitignored), or as "not connected" when
// that file isn't there. The e2e tests mock the page's other answers with routes.
import fs from 'node:fs';
import path from 'node:path';

export default function devStatsFixture() {
  return {
    name: 'stats-fixture',
    apply: 'serve',
    configureServer(server) {
      const file = path.join(server.config.root, '.stats-fixture.json');
      server.middlewares.use('/api/stats', (req, res) => {
        const send = (status, body, cache) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', cache);
          res.end(body);
        };
        if (!fs.existsSync(file)) {
          return send(503, JSON.stringify({ error: 'The traffic numbers aren’t connected yet.', state: 'not-connected' }), 'no-store');
        }
        send(200, fs.readFileSync(file, 'utf8'), 'public, max-age=300');
      });
    },
  };
}
