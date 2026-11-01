# Video and audio on aaronorelup.com

## Where it lives

- Every video, song, sound and HLS stream (`.mp4 .webm .mov .mp3 .m4a .wav .ogg .opus .flac .m3u8 .ts` and the rest)
  lives in the private Cloudflare R2 bucket `aaronorelup-site-media`, not in git.
- Each file keeps its normal URL. `/media/<slug>/clip.mp4` on the site is the object `media/<slug>/clip.mp4` in
  the bucket, and the site's Worker (`worker/media/serve.js`) serves it from there, with seeking (byte ranges) and
  caching (ETag, 304) working.
- `src/data/media-manifest.json` lists every file in the bucket, with its size and its MD5. Commit it.
- Pictures (`.webp .png .jpg`) and captions (`.vtt`) stay in git under `public/`, as before.
- One exception: `public/courses/` is written by the course publishers in other repos, so its videos are still in
  git. The Worker checks R2 first for every path, so a course moves the day its files are uploaded with the same paths.
- A second, for now: every live notebook's folders under `public/` (`src/data/exempt.js`; today AO-073's
  `public/media/teardown-lab/` and `public/labs/teardown/`) stay in git, because a fleet of other sessions is still
  writing them, video included. Move them with `npm run media:push` once the post is finished.

## Adding a video or a song to a post

1. Put the file where it would go anyway: `public/media/<slug>/clip.mp4`.
2. Reference it in the post by its URL, as always: `<video src="/media/<slug>/clip.mp4" ...>`.
3. Run `npm run media:push`. It uploads every new or changed video and audio file, adds them to the manifest, and
   takes the local copies out of `public/` (they are in R2 now).
4. Commit the post and `src/data/media-manifest.json`, then push `main`.

`npm run media:push -- --keep` leaves the local copies in place. The build refuses to run while any video or audio sits
in `public/` outside `courses/`, or while any file there is over 25 MiB (Cloudflare's limit per static file),
and says to run `npm run media:push`.

The full-size originals of anything generated still go to Aaron's studio library (`studio push`); the bucket holds
only what the site plays.

## The two commands

- `npm run media:push` uploads new or changed media and updates the manifest. It reads `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY` and `R2_ENDPOINT` from the environment, or from Infisical through `~/.claude/bin/getkey.py`.
- `npm run media:verify` asks the live site for every file in the manifest and checks that each one comes from R2
  with the right size, type and ETag, then checks seeking and a 304 on one video. Run it after a deploy.

## Working locally

`npm run dev` sends any media file that is in the manifest but not on disk to the live site, so videos play in
local previews too. `scripts/tools/preview-media.mjs` downloads an R2 source from the live site the same way.

## Pictures made to a size: icons and project pictures

One tool does every resize-to-a-cap job, `scripts/tools/preview-media.mjs` (it needs ffmpeg). Its post form makes a
hover card's still and loop (`PREVIEWS.md`); its `--out` form makes one WebP still at a size and under a byte cap, and
fails if it can't fit. The caps are in `src/data/limits.js`, and `npm run check` and the build refuse a file over one.

- **Post icons** are keyed by post id, because slugs get renamed: `public/media/icons/<AO-###>.webp` (256 px, at most
  24 KB) and `<AO-###>-96.webp` (at most 6 KB). Pages find them through `src/lib/icons.js iconFor(post)`, which
  returns null when there is no file, and then they draw the topic glyph. A live notebook never gets one. The 1024 px
  originals are in Aaron's studio library (style "lantern gouache"); the agent kit's icon recipe makes new ones.

  ```bash
  node scripts/tools/preview-media.mjs <original or 512 px copy> --out public/media/icons/AO-075.webp --size 256 --cap 24k
  node scripts/tools/preview-media.mjs <original or 512 px copy> --out public/media/icons/AO-075-96.webp --size 96 --cap 6k
  ```
- **Project pictures** (`src/content/projects/*.yaml`, `image.src`) are 640×360, at most 60 KB: a still or a frame
  from the project's own post media or hosted page, never anything made for the card.

  ```bash
  node scripts/tools/preview-media.mjs /media/<folder>/<file>.webp --out public/media/projects/<name>.webp --size 640x360 --cap 60k
  node scripts/tools/preview-media.mjs /media/<folder>/<clip>.mp4 --at 12 --out public/media/projects/<name>.webp --size 640x360 --cap 60k
  ```
  `--fit blur`, `--focus` and `--crop` work as in `PREVIEWS.md`. Look at the result before committing it.

## Share cards (og:image)

Nothing to make by hand: the build draws each listed post's card, `/og/<slug>.jpg` (1200×630 JPEG, at most 150 KB),
from its icon (or its topic's glyph), id, topic, title and verdict, with sharp and the Latin subset of Zen Maru
Gothic 700 in `src/assets/fonts/` (`src/lib/og/`). The page's `og:image` carries `?v=<h8>`, the hash of what is
drawn, so X fetches a card again when its title, verdict or icon changes. Drawn cards are kept in
`node_modules/.astro/og/`, which Workers Builds restores between builds when its build cache is on, so a build
redraws only the changed ones. A card that fails to draw fails the build (`STRICT` in `src/lib/og/image.js`), except
a live notebook's, which falls back to `public/og/default.jpg`. An unlisted post has no card. A new design: bump
`V` in that file.
