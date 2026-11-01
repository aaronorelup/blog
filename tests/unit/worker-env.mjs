// For unit tests of Worker modules: loadWorker(path) imports one the way wrangler bundles it (its .sql files as
// text), and d1() is an in-memory D1 (node:sqlite behind D1's prepare/bind/first/all/run/batch), so the real SQL runs.
import { register } from 'node:module';
import { DatabaseSync } from 'node:sqlite';

register('data:text/javascript,' + encodeURIComponent(`
  import { readFile } from 'node:fs/promises';
  export async function load(url, context, next) {
    if (!url.endsWith('.sql')) return next(url, context);
    return { format: 'module', shortCircuit: true, source: 'export default ' + JSON.stringify(await readFile(new URL(url), 'utf8')) };
  }`));

export const loadWorker = (path) => import(new URL(`../../worker/${path}`, import.meta.url));

export function d1() {
  const db = new DatabaseSync(':memory:');
  const statement = (sql, args = []) => ({
    bind: (...values) => statement(sql, values),
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    first: async (column) => {
      const row = db.prepare(sql).get(...args);
      return row === undefined ? null : column ? row[column] : row;
    },
    run: async () => { db.prepare(sql).run(...args); return {}; },
  });
  return { prepare: (sql) => statement(sql), batch: (list) => Promise.all(list.map((s) => s.all())) };
}
