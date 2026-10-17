# aaronorelup.com

A ledger of what I'm learning about AI. Astro static site, hosted on Cloudflare Pages.
The homepage is a scroll-driven Three.js tea house; every other page is the same panel
that grows out of the cards in that scene.

## Writing a post

```bash
npm run new-post "Title of the post"
```

This creates `src/content/posts/<slug>.md` with the next sequential ID (`AO-002`, etc.)
and today's date pre-filled. Open it, write, then:

```bash
git add .
git commit -m "AO-002: title of the post"
git push
```

That's the entire publish step. Pushing to `main` triggers a Cloudflare Pages build, and
the post goes live at `/ledger/<slug>/`. **This repo publishes nothing to any social
account.**

## Frontmatter fields

| Field     | Meaning                                                               |
|-----------|-----------------------------------------------------------------------|
| `id`      | Ledger reference, e.g. `AO-003`. Auto-assigned by `new-post`.         |
| `title`   | Post title.                                                           |
| `summary` | One-liner — shown in the ledger list.                                 |
| `date`    | Publish date.                                                         |
| `status`  | `note`, `in-progress`, or `shipped`.                                  |
| `tags`    | Array of tags. Shown as RSS categories.                               |
| `draft`   | Set `true` to keep a post off the site.                               |

## Local development

```bash
npm install
npm run dev
```

## How the site is put together

- `src/pages/index.astro` — the tea house. Six camera waypoints, a day/night toggle, and
  an overlay panel. All of the panel's content is server-rendered into the page.
- `src/scripts/home-scene.js` — the scene itself, ported from the Claude Design artifact.
  Plain ES module, no framework; `three` is a local dependency loaded by dynamic import so
  it code-splits out of the initial bundle.
- `src/components/panel/*` — the Ledger, Projects, About and post views. The homepage and
  the standalone pages render the *same* components, so the two can't drift apart.
- `src/layouts/PanelPage.astro` — chrome for `/ledger`, `/projects`, `/about` and each
  post. These are real pages: they work with JavaScript off, they're what search engines
  and RSS readers see, and the homepage overlay fetches post bodies from them.
- `src/data/projects.js` — the projects list. Add an object to add a project.

Backtick (`` ` ``) on the homepage opens the staging tool for re-tuning camera waypoints;
`WASD` moves, `[`/`]` change FOV, and **Copy values** gives you numbers to paste into
`WAYPOINTS` at the top of `home-scene.js`.

## Cloudflare Pages setup (one-time)

1. Cloudflare dashboard → Workers & Pages → Create → Connect to Git → this repo.
2. Framework preset: **Astro**. Build command `npm run build`, output directory `dist`.
3. Deploy. Attach `aaronorelup.com` as a custom domain in the project's Domains tab.

## Post URLs

Posts live at `/ledger/<slug>/`. They used to live at `/posts/<slug>/`; `public/_redirects`
301s the old paths and should stay there permanently, since AO-004 and AO-005 were shared
under the old URLs.
