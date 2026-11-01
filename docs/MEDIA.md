# Video and audio on aaronorelup.com

## Where it lives

- Every video, song, sound and HLS stream (`.mp4 .webm .mov .mp3 .m4a .wav .ogg .opus .flac .m3u8 .ts` and the rest)
  lives in the private Cloudflare R2 bucket `aaronorelup-site-media`, not in git.
- Each file keeps its normal URL. `/media/<slug>/clip.mp4` on the site is the object `media/<slug>/clip.mp4` in
  the bucket, and the site's Worker (`worker/media.js`) serves it from there, with seeking (byte ranges) and
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
local previews too. `scripts/preview-media.mjs` downloads an R2 source from the live site the same way.
