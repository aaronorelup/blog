// One-off (W4): removes the v1 frontmatter fields `series`, `status` and `tags` from every post but the live
// notebooks, and writes `project:` from `series` where a post named none (what the schema derived until now).
// `--skip AO-1,AO-2` leaves those posts out, `--only AO-1` strips just those. Deleted once it has run.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { isLive } from '../../src/data/exempt.js';
import { SERIES_TO_PROJECT } from '../../src/data/taxonomy.js';

const arg = (name) => (process.argv.find((a, i) => process.argv[i - 1] === name) ?? '').split(',').filter(Boolean);
const skip = arg('--skip');
const only = arg('--only');
const dir = 'src/content/posts';

for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
  const file = path.join(dir, name);
  const raw = fs.readFileSync(file, 'utf8');
  const { data } = matter(raw);
  if (isLive(data.id) || skip.includes(data.id) || (only.length && !only.includes(data.id))) continue;
  const end = raw.indexOf('\n---', 4);
  const lines = raw.slice(0, end).split('\n');
  const project = data.project === undefined && data.series?.length
    ? [...new Set(data.series.map((s) => SERIES_TO_PROJECT[s]).filter(Boolean))] : [];
  const kept = lines.flatMap((l) => {
    if (/^series:/.test(l)) return project.length ? [`project: ${JSON.stringify(project).replace(/,/g, ', ')}`] : [];
    return /^(status|tags):/.test(l) ? [] : [l];
  });
  if (kept.length === lines.length && !project.length) continue;
  fs.writeFileSync(file, kept.join('\n') + raw.slice(end));
  console.log(`${data.id} ${name}: ${lines.length - kept.length} line(s) out${project.length ? `, project ${project.join(', ')}` : ''}`);
}
