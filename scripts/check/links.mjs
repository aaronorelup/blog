// Links in posts, notes, Now snapshots and project files (code examples left out): every /ledger/<slug>/ link, and
// every slug in a project's posts:, goes to a listed post (and /notes/ to its notes page), nothing links a page under
// public/ledger/ (the hidden easter eggs, found by looking, so no list names them), and no link matches
// banned-phrases.js's LINKS. A link through a redirect warns. The old address /posts/<slug>/ is read as /ledger/<slug>/,
// where public/_redirects sends it, so it can't reach a draft or an unlisted post either.
import { LINKS } from '../../src/data/banned-phrases.js';
import { isListed } from '../../src/lib/posts.js';
import { keyLine, liner, withoutCode } from './text.mjs';

const LEDGER = /(?<=^|[\s"'(=>[]|aaronorelup\.com)\/(?:ledger|posts)\/([\w-]+)(?=[/#?\s"'<>)\]]|[.,;:!](?!\w)|$)(\/[^\s"'<>()[\]#?]*)?/g;

const redirects = (repo) => new Map(repo.read('public/_redirects').split('\n')
  .map((l) => l.trim().split(/\s+/)).filter(([from, to]) => from?.startsWith('/') && to)
  .map(([from, to]) => [from.replace(/\/?$/, '/'), to]));

export default function links(repo, report) {
  const posts = new Map(repo.posts.map((p) => [p.slug, p]));
  const notes = new Set(repo.notes.map((n) => n.slug));
  const moved = redirects(repo);

  for (const { file, raw } of [...repo.posts, ...repo.notes, ...repo.now, ...repo.projects]) {
    const line = liner(raw);
    const text = withoutCode(raw);
    for (const m of text.matchAll(LEDGER)) {
      const [href, slug, rest = ''] = m;
      const at = line(m.index);
      const deeper = rest.split('/').filter(Boolean);
      const post = posts.get(slug);
      if (deeper.length && repo.exists(`public/ledger/${slug}/${deeper[0]}`)) {
        report(file, at, `${href} is a hidden page under public/ledger/: never link it`, 'deploy');
      } else if (!post && moved.has(`/ledger/${slug}/`)) {
        report(file, at, `${href} redirects to ${moved.get(`/ledger/${slug}/`)}: link that`, 'warn');
      } else if (!post) {
        report(file, at, `${href}: there is no post ${slug}`, 'deploy');
      } else if (!isListed(post.data)) {
        report(file, at, `${href} is ${post.data.draft ? 'a draft' : 'unlisted'}: never link it`, 'deploy');
      } else if (deeper.length && !(deeper.length === 1 && deeper[0] === 'notes' && notes.has(slug))) {
        report(file, at, `${href}: no such page (a post has only /ledger/<slug>/ and, with notes, /notes/)`, 'deploy');
      }
    }
    for (const { pattern, why } of LINKS) {
      for (const m of raw.matchAll(pattern)) {
        report(file, line(m.index), `"${m[0]}" is ${why}`, 'deploy');
      }
    }
  }

  for (const { file, raw, data } of repo.projects) {
    for (const slug of data.posts ?? []) {
      const post = posts.get(slug);
      if (!post || !isListed(post.data)) report(file, keyLine(raw, 'posts'), `posts: "${slug}" is ${post ? 'not listed' : 'no post'}: a card links only listed posts`, 'deploy');
    }
  }
}
