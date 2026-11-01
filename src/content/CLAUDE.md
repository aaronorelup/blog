# src/content: posts, notes, research

- **Read `WRITING.md` and `PREVIEWS.md` first.** Write from their rules, not from an older post: many predate them.
- `posts/<slug>.md` is one post. The file name is its URL (`/ledger/<slug>/`) and never changes once it's out (a
  rename needs a `301` in `public/_redirects`). Make a new one with `npm run new-post "Title"`: never pick an
  `AO-###` by hand.
- `notes/<slug>.md` is the full making-of of a split post, at `/ledger/<slug>/notes/`. Its `post:` is the same
  slug, and it is listed exactly when its post is.
- `topic` (from `src/data/taxonomy.js`) makes a post v2: the caps and voice rules are errors for it. The icon is
  `public/media/icons/<AO-###>.webp` by convention, no field needed.
- **The `<ao-*>` tags and their attributes are frozen.** 72 posts use them. A rewrite keeps every component,
  video, audio and iframe block byte for byte (`node scripts/tools/element-usage.mjs --diff <old> <new> [notes]`).
- **`teardown-lab.md` (AO-073) is not yours.** Other sessions write it live. Never edit it or its media.
- Every post waits for Aaron's OK: `draft: true` until he says so in his own words.
- Before pushing: `npm run check -- <your files>` (no errors), then `npm run build`.
- Never put a never-publish term in any file here, drafts included: the repo is public.
