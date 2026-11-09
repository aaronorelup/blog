// The files the checks read, loaded once from a repo root: posts, notes and the Now page's snapshots with their
// frontmatter, project files, and plain file helpers. run.mjs builds it and hands it to every rule. Paths are
// repo-relative with forward slashes.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export function loadRepo(root) {
  const abs = (rel) => path.join(root, rel);
  const exists = (rel) => fs.existsSync(abs(rel));
  const read = (rel) => fs.readFileSync(abs(rel), 'utf8');
  const size = (rel) => fs.statSync(abs(rel)).size;
  // Files under dir (recursive), repo-relative and sorted; none when dir doesn't exist yet.
  const list = (dir, test = () => true) => !exists(dir) ? [] : fs.readdirSync(abs(dir), { recursive: true })
    .map((f) => `${dir}/${String(f).split(path.sep).join('/')}`)
    .filter((f) => test(f) && fs.statSync(abs(f)).isFile()).sort();

  // A Markdown entry. Broken YAML is reported by frontmatter.mjs; the other rules then see no data.
  const entry = (file) => {
    const raw = read(file);
    const slug = path.basename(file, '.md');
    try {
      return { file, slug, raw, data: matter(raw).data };
    } catch (error) {
      return { file, slug, raw, data: {}, yamlError: error };
    }
  };
  // A project card's YAML, parsed like frontmatter (src/schemas/project.ts holds its rules).
  const project = (file) => {
    const raw = read(file);
    try {
      return { file, raw, data: matter.engines.yaml.parse(raw) ?? {} };
    } catch (error) {
      return { file, raw, data: {}, yamlError: error };
    }
  };
  const md = (dir) => list(dir, (f) => f.endsWith('.md') && !f.slice(dir.length + 1).includes('/')).map(entry);

  return {
    root, abs, exists, read, size, list,
    posts: md('src/content/posts'),
    notes: md('src/content/notes'),
    now: md('src/content/now'),
    projects: list('src/content/projects', (f) => f.endsWith('.yaml')).map(project),
  };
}
