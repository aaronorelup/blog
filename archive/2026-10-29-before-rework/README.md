# Every post as it stood before the rework (29 October 2026)

These are the 72 ledger posts exactly as they were at commit `45c02e1` (AO-072), the last commit
before the October rework that rewrote titles, descriptions, callouts and bodies across the ledger.

Nothing here is built into the site. The folder sits outside `src/`, so Astro never reads it.

## Putting a post back

Copy its file over the current one and push:

```bash
cp archive/2026-10-29-before-rework/posts/<slug>.md src/content/posts/<slug>.md
npm run build
```

Two things changed around the posts that an old file won't know about:

- Posts that became a short post plus a notes page have their old full text at
  `src/content/notes/<slug>.md` as well. Restoring the old post doesn't need the notes file, but you
  can delete the notes file if you restore the old version.
- AO-068 and AO-070 were merged into one post. Restoring either old file brings it back as its own post;
  remove the redirect for it in `public/_redirects` if you do.

To see exactly what the rework changed in one post:

```bash
git diff 45c02e1 -- src/content/posts/<slug>.md
```
