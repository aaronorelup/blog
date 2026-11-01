// Media before a reader meets a broken player or a slow card: each preview still and loop exists and is within its
// cap (PREVIEWS.md), icons and project pictures are within theirs (src/data/limits.js), and every video or audio
// file a post, note or project names is in R2 (src/data/media-manifest.json) or on disk in a STAYS_IN_GIT folder.
import { ICON, PREVIEW_MEDIA, PROJECT_IMAGE } from '../../src/data/limits.js';
import { belongsInR2, TYPES } from '../media/files.mjs';
import { keyLine, liner, withoutCode } from './text.mjs';

const EXTS = Object.keys(TYPES).filter((e) => e !== 'ts').join('|');
const MEDIA_PATH = new RegExp(`(?<=[\\s"'(=]|aaronorelup\\.com)(/[^\\s"'<>()?#]+\\.(?:${EXTS}))(?=[\\s"'<>)?#]|$)`, 'gi');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

export default function assets(repo, report) {
  const r2 = JSON.parse(repo.read('src/data/media-manifest.json'));
  const bytesOf = (url) => (repo.exists('public' + url) ? repo.size('public' + url) : r2[url]?.bytes);

  for (const { file, raw, data } of repo.posts) {
    for (const [key, cap] of [['image', PREVIEW_MEDIA.stillCap], ['loop', PREVIEW_MEDIA.loopCap]]) {
      const url = data.preview?.[key];
      if (!url) continue;
      const bytes = bytesOf(url);
      if (bytes === undefined) report(file, keyLine(raw, key), `preview ${key} ${url} is neither under public/ nor in R2`, 'deploy');
      else if (bytes > cap) report(file, keyLine(raw, key), `preview ${key} ${url} is ${kb(bytes)}, over the ${kb(cap)} cap: remake it with scripts/preview-media.mjs (PREVIEWS.md)`, 'deploy');
    }
  }

  const capped = [
    ...repo.list('public/media/icons', (f) => f.endsWith('.webp')).map((f) => [f, f.endsWith('-96.webp') ? ICON.s96Cap : ICON.s256Cap]),
    ...repo.list('public/media/projects', (f) => f.endsWith('.webp')).map((f) => [f, PROJECT_IMAGE.cap]),
  ];
  for (const [f, cap] of capped) if (repo.size(f) > cap) report(f, null, `${kb(repo.size(f))}, over its ${kb(cap)} cap (src/data/limits.js)`, 'deploy');

  for (const { file, raw } of [...repo.posts, ...repo.notes, ...repo.projects]) {
    const line = liner(raw);
    for (const m of withoutCode(raw).matchAll(MEDIA_PATH)) {
      const url = m[1];
      const inGit = !belongsInR2(url) && repo.exists('public' + url);
      if (!r2[url] && !inGit) report(file, line(m.index), `${url} is not in R2: npm run media:push (docs/MEDIA.md)`, 'deploy');
    }
  }
}
