// ensure(db, schema): runs a feature's .sql file (CREATE TABLE IF NOT EXISTS only, imported as text) once per
// isolate, before that feature's first query. Deploys are git pushes with no migration step and tables are only
// ever added, so this is the whole of it. A failed run is forgotten, so the next call tries again.
const statements = (sql) => sql.replace(/--.*$/gm, '').split(';').map((s) => s.trim()).filter(Boolean);
const done = new Map(); // schema text -> its run

export function ensure(db, schema) {
  if (!done.has(schema)) {
    const run = db.batch(statements(schema).map((s) => db.prepare(s)));
    run.catch(() => done.delete(schema));
    done.set(schema, run);
  }
  return done.get(schema);
}
