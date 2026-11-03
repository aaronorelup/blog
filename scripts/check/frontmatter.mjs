// Frontmatter facts: YAML that parses, each notes page named after a built post (and saying so in `post:`),
// START_HERE empty or 5 different listed slugs, and on every post the v2 content rules (src/schemas/strict.js) with
// no leftover v1 field (`series`, `status`, `tags`), which live notebooks keep for good. Those last two fail the
// deploy build once STRICT is on.
import { START_HERE } from '../../src/data/picks.js';
import { isHeld, isLive } from '../../src/data/exempt.js';
import { isListed } from '../../src/lib/posts.js';
import { STRICT, v2Rules } from '../../src/schemas/strict.js';
import { keyLine } from './text.mjs';

const V1_FIELDS = ['series', 'status', 'tags'];

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

  const strict = STRICT ? 'deploy' : 'check';
  for (const p of repo.posts.filter((p) => !p.yamlError)) {
    const level = isHeld(p.slug) ? 'warn' : strict;
    v2Rules(p.data, (key, message) => report(p.file, keyLine(p.raw, key), `${key}: ${message}`, level));
    for (const key of V1_FIELDS.filter((k) => k in p.data && !isLive(p.slug))) {
      report(p.file, keyLine(p.raw, key), `${key}: a v1 field; leave it out (WRITING.md lists the frontmatter)`, strict);
    }
  }
}
