// Frontmatter facts the schema can't see from one file: YAML that parses, each notes page named after a built post
// (and saying so in `post:`), START_HERE empty or 5 different listed slugs. On v1 posts (no `topic`) it warns about
// the title and summary caps, which the schema enforces only on v2 posts until W4.
import { START_HERE } from '../../src/data/picks.js';
import { TEXT } from '../../src/data/limits.js';
import { isListed } from '../../src/lib/posts.js';
import { keyLine } from './text.mjs';

export default function frontmatter(repo, report) {
  for (const e of [...repo.posts, ...repo.notes]) {
    if (e.yamlError) report(e.file, e.yamlError.mark.line + 2, `the frontmatter isn't valid YAML: ${e.yamlError.reason}`, 'deploy');
  }
  for (const e of repo.projects) {
    if (e.yamlError) report(e.file, e.yamlError.mark.line + 1, `this isn't valid YAML: ${e.yamlError.reason}`, 'deploy');
  }

  const built = new Set(repo.posts.filter((p) => !p.data.draft).map((p) => p.slug));
  for (const n of repo.notes) {
    if (n.data.post !== n.slug) report(n.file, keyLine(n.raw, 'post'), `post: must be "${n.slug}", the file's own name`, 'deploy');
    else if (!built.has(n.slug)) report(n.file, 1, `no built post src/content/posts/${n.slug}.md for these notes`, 'deploy');
  }

  const listed = new Set(repo.posts.filter((p) => isListed(p.data)).map((p) => p.slug));
  if (START_HERE.length && (START_HERE.length !== 5 || new Set(START_HERE).size !== 5 || !START_HERE.every((s) => listed.has(s)))) {
    report('src/data/picks.js', null, 'START_HERE is either empty or 5 different slugs of listed posts', 'deploy');
  }

  for (const p of repo.posts.filter((p) => p.data.topic === undefined)) {
    for (const [key, cap] of [['title', TEXT.titleCap], ['summary', TEXT.summaryCap]]) {
      const n = String(p.data[key] ?? '').trim().length;
      if (n > cap) report(p.file, keyLine(p.raw, key), `${key} is ${n} characters, over the ${cap} cap (an error once the post has a topic)`, 'warn');
    }
  }
}
