// src/data/exempt.js: posts other sessions write, and every path they write. No migration, schema rule, check,
// budget, baseline, media rule, icon rule, strip script or recording fails on them or touches them.
export const LIVE_NOTEBOOKS = {
  'AO-073': { slug: 'teardown-lab', paths: ['src/content/posts/teardown-lab.md', 'public/media/teardown-lab/',
                                            'public/labs/teardown/', 'dist/ledger/teardown-lab/'] },
};
const all = Object.entries(LIVE_NOTEBOOKS);
export const isLive = (idOrSlug) => all.some(([id, n]) => idOrSlug === id || idOrSlug === n.slug);
// Repo-relative or dist-relative paths, with or without a leading slash ('/media/teardown-lab/x.webp' matches too).
export const isLivePath = (p) => all.some(([, n]) => n.paths.some((q) =>
  ('/' + p.replace(/^\//, '')).includes('/' + q.replace(/^(public|dist)\//, ''))));
