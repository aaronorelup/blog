# EMBED: the film at the top of AO-082, and how it goes live

Scout record, 2026-11-24. How a 30 to 60 minute film is put at the top of
`src/content/posts/guitar-tab-tools.md` (AO-082, listed, live at `/ledger/guitar-tab-tools/`) and published by
the site's own rules. Read for it: `CLAUDE.md`, `WRITING.md`, `PREVIEWS.md`, `docs/MEDIA.md`, `docs/COMPONENTS.md`,
`ARCHITECTURE.md` (checks, budgets, contracts, data flows), `docs/ASK.md`, `docs/WORKER.md`, `src/elements/ao-shots/`,
`src/elements/_core/`, `scripts/media/*.mjs` (push, verify, the build hooks in `integration.mjs`), `scripts/check/*.mjs`,
`worker/media/`, the posts AO-081 and AO-052, the studio-library skill and the live library rules. Everything marked "measured" was run on this
box today.

## The short answer

| | |
|---|---|
| Component | `<ao-shots>`: one `<video>`, a strip of chapter thumbnails that seek it, a caption. The site's long film (AO-081, 49:05) and AO-052 use it. |
| Video file | MP4, H.264 High@4.0, 1920x1080, 30 fps constant, yuv420p, BT.709, AAC-LC 48 kHz stereo 192 to 256 kbit/s, moov first (`+faststart`), no in-band subtitles. The production kit's output meets this except its mov_text track (2.1). |
| Bitrate | about 1.5 to 4.5 Mbit/s average, peaks about 6 at most. AO-081 is 2.84 Mbit/s, the production proof 2.2. |
| Size | aim under 1.9 GB. **Hard limit: under 2,147,483,647 bytes**, or `npm run media:push` cannot read the file (measured). |
| Paths | `/media/guitar-tab-tools/film/guitar-video-to-tab.mp4` (R2), `poster.webp`, `captions.vtt`, `chapters/NN.webp` (git) |
| Where | the first thing in the post body, above the opening paragraph (AO-052 does this) |
| Upload | `npm run media:push` (one signed S3 PUT, ETag = MD5); AO-081's 1.04 GB film went up this way |
| Library | `studio push blog-posts <folder> --agent <name>`, with a `NOTES.md` |

## 1. The markup and where it goes

### The block

Paste as is, filling the brackets. No blank line anywhere inside it, a blank line before and after it (an
`<ao-*>` block is a CommonMark type-7 HTML block: a blank line ends it, and whatever follows is parsed as Markdown).

```html
<ao-shots>
<video controls playsinline preload="metadata" width="1920" height="1080" aria-label="[FILM TITLE]" poster="/media/guitar-tab-tools/film/poster.webp" src="/media/guitar-tab-tools/film/guitar-video-to-tab.mp4"><track kind="captions" srclang="en" label="English" src="/media/guitar-tab-tools/film/captions.vtt"></video>
<ol>
<li data-t="0:00"><img src="/media/guitar-tab-tools/film/chapters/01.webp" alt="[what the still shows]" loading="lazy">[Opening]</li>
<li data-t="[m:ss.xx]"><img src="/media/guitar-tab-tools/film/chapters/02.webp" alt="[what the still shows]" loading="lazy">[The three songs]</li>
<li data-t="[m:ss.xx]"><img src="/media/guitar-tab-tools/film/chapters/03.webp" alt="[what the still shows]" loading="lazy">[next chapter]</li>
</ol>
<figcaption><b>[FILM TITLE]</b><span class="ao-meta">[mm:ss] · three songs with known tabs, one with a capo, one in [tuning], one with neither · every tab played back · captions in the player · click a chapter to play from it</span></figcaption>
</ao-shots>
```

One `<li>` per chapter, in time order. The times come from the production kit's `chapters.vtt` (`join.py` writes
one cue per chapter, its start in `HH:MM:SS.mmm` and its text the chapter's title): write each start as `m:ss.xx`.
Chapter labels are 1 to 5 words (ideas, not rules: Opening, The three songs, Splitting the guitar out, Sound to notes,
Capo and tuning, String and fret, Hands on the fretboard, The tab played back, Opus 5.5 with the tools, Opus 5.5
without them, What to give the AI).

| Piece | Why |
|---|---|
| `<ao-shots>` | the component for "reels, trailers, films, cuts" (`docs/COMPONENTS.md`). No attributes of its own. `<ao-transcript>` was considered and not chosen: it is built to compare versions and has no chapter strip. |
| `controls playsinline` | `playsinline` is required: `scripts/check/prose.mjs` fails a `<video>` without it (iPhone would go fullscreen) |
| `preload="metadata"` | as AO-081, AO-052 and the other `<ao-shots>` posts (the tested pattern, e2e shots-1). Cost: the moov box loads with the page, about 3.2 MB for AO-081's 49 min, about 4 MB for 60 min at 30 fps. `preload="none"` is lighter but untested with chapter clicks. |
| `width="1920" height="1080"` | new here, and worth it. Measured in Chromium: a `<video>` with `width:100%; height:auto` (the `<ao-shots>` CSS) and no attributes reserves 640x150 until the poster or metadata arrive, then jumps. With these two attributes it reserves 640x360 from the first paint. At the top of the longest post on the site, that jump would move everything under it. |
| `aria-label` | names the film in the now-playing bar (`src/elements/_core/now-playing.js` `titleOf`: `label`, `title`, then `aria-label`, then the nearest heading before it). At the top of the post there is no heading, so without it the bar says "Video in this post". `title` would also work but shows a hover tooltip. |
| `poster` | 1280x720 WebP in git (section 2) |
| `<track kind="captions" srclang="en" label="English">` | the site's pattern (`claude-text-watermark`, `lessons-sent-back`, `loom-and-information-flow`; live HTML keeps it). No `default`: no post turns captions on by default. The live server sends `.vtt` as `text/vtt` (measured). |
| `data-t` | `m:ss`, `m:ss.xx` or `h:mm:ss` (`src/elements/_lib/time.js parseTime`). Minutes may pass 59 (`61:05`). The first is `0:00`. The strip prints each as `m:ss.s`. |
| `loading="lazy"` on every thumbnail | `scripts/build/rehype-post-images.mjs` makes every picture but the post's first lazy, and written attributes win. With the film first, its first thumbnail would be the post's first picture, so write it on all (AO-052 and AO-081 do). The build adds `width` and `height` from the files in `public/`. |
| `alt` | what the still shows. Scanned by the never-publish check. |
| caption | the components' convention (`src/styles/elements.css`): `<b>` title, then a `.ao-meta` monospace line, as AO-052. The `·` separators are fine. Semicolons, em dashes and banned phrases in the caption and the chapter labels fail `npm run check` (prose.mjs reads all text between tags, attributes excluded). |

### Where it goes in the file

The front matter is lines 1 to 17, line 18 is blank, line 19 is the opening paragraph ("I want to build a web app
..."), line 21 the second, line 23 `## The quick rundown`. Put the block at line 19, followed by one blank line, so the
opening paragraph follows it unchanged:

```text
17  ---
18  (blank)
19  <ao-shots>
    ...
    </ao-shots>
    (blank)
    I want to build a web app that turns a song, ...      (old line 19, unchanged)
```

What the rules allow above the opening text:
- `WRITING.md` asks that the first 2 to 4 sentences say what was done, why and what was found, and that media "stay
  and lead". Nothing forbids media before the first sentence. AO-052 (`bad-very-bad`) opens its body with its
  `<ao-shots>` film. AO-081 puts its film after three paragraphs of context, before the first h2. Both pass every check.
- On the page the body comes after the header (title, summary, Listen), "The short version" box (the card) and the
  Contents list (`src/components/post/PostView.astro`). So "the top of the post" is just under the card box.
- The opening section (everything before the first h2) is what read-aloud reads first (with title and summary) and
  what Ask cites as the opening. Both skip `<ao-*>` entirely, so the film changes neither. Only text does.

What the checker enforces on this edit (`npm run check`, and `npm run build` runs the deploy rules first):

| Rule | File | Level |
|---|---|---|
| `<video>` has `playsinline` | `scripts/check/prose.mjs` | check error |
| no em dash, spaced en dash, `;` or banned phrase in reader text (labels and caption included), takeaway at most 2 sentences | `prose.mjs` | check error |
| every video or audio URL in a post is in `src/data/media-manifest.json` (or a STAYS_IN_GIT folder) | `scripts/check/assets.mjs` | deploy |
| preview `image`/`loop` exist (public/ or R2) and are under 48 KB / 240 KB | `assets.mjs` | deploy |
| no never-publish term anywhere in the file (alt text and file names too) | `never-publish.mjs` | deploy |
| `/ledger/<slug>/` links go to listed posts | `links.mjs` | deploy |
| title 90, summary 260, verdict 36, takeaway 200, points 150 each and at most 3, a verdict on a listed post | `src/schemas/strict.js`, `preview.ts` (`STRICT = true`) | deploy |
| an `<ao-*>` tag with no `src/elements/` folder fails the build | `scripts/build/rehype-post-text.mjs` | build |
| no video or audio under `public/` (outside `courses/` and live notebooks), no file there over 25 MiB | `scripts/media/integration.mjs` (`astro:build:start`) | build |

Nothing checks the order of blocks, posters, chapter stills or the `.vtt` (see 2.4). Baseline today:
`npm run check -- src/content/posts/guitar-tab-tools.md` gives 0 errors, 0 warnings (measured).

## 2. Every file the film needs

All web copies of pictures and captions go in git under `public/media/guitar-tab-tools/film/` (a new subfolder, so
the post's 33 existing WebP stills stay as they are). Video and audio go to R2. Do not use
`/media/guitar-tabs-from-video/`: `worker/media/shown.js` withholds every file there but `-(001|002|003|004|009)`
mp4/mp3, so a new file in that folder answers 404. For the same reason the film must not show the AO-078 recordings
that were taken off the site (anything of that folder outside those five numbers).

### 2.1 The video

Precedent, measured on the live files with ffprobe:

| File | Length | Format | Total bitrate | Size |
|---|---|---|---|---|
| AO-081 `astra-film.mp4` | 49:05 | H.264 High@4.0 1920x1080 30 fps yuv420p (libx264), AAC-LC 48 kHz stereo 252k, moov at byte 32 (3.2 MB) | 2.84 Mbit/s (video 2.57) | 1,043,771,613 bytes |
| AO-052 `final_720p.mp4` | 0:30 | H.264 High 1280x720 30 fps, AAC 48 kHz 130k | 2.52 Mbit/s | 9.4 MB |
| AO-087 `fable-opus-quiet-hour.mp4` | 1:40 | H.264 High 1920x1080 24 fps, AAC 48 kHz 188k | 2.05 Mbit/s | 25.7 MB |
| `lessons-sent-back/v2-0005.mp4` | 19:54 | H.264 High 1280x720 30 fps, AAC 44.1 kHz 65k, plus an in-band mov_text track | 0.17 Mbit/s | 25.1 MB |

All six videos probed are H.264 in MP4, with AAC-LC where there is sound. AO-081 is the only video in R2 over
26 MB (the manifest's next largest is 25.7 MB).

What the site needs from the file:
- **Container** MP4, `+faststart` (moov before mdat, so playback and seeking start without fetching the end).
- **Video** H.264 High profile, level 4.0, 1920x1080 square pixels, progressive, constant 30 fps, 8-bit yuv420p,
  BT.709 matrix, primaries and transfer, TV range. H.264 High@4.0 1080p30 is decoded in hardware by every phone and
  laptop of the last decade. HEVC and AV1 are not everywhere, and 10-bit H.264 is not hardware-decoded on most phones.
- **Rate** about 1.5 to 4.5 Mbit/s average, peaks around 6 Mbit/s at most. The site plays one progressive file with
  byte ranges, no adaptive streaming, so the peak is what a phone on an ordinary connection must keep up with.
  Graphics compress well (AO-081 2.84, the production proof 2.0), camera footage needs more.
- **Keyframes** x264's default (at least every 250 frames, 8.3 s at 30 fps, plus scene cuts) is what AO-081 and the
  proof have, and seeking works with it. Every chapter start must be a keyframe, so a chapter click starts at once.
- **Audio** AAC-LC, 48 kHz, stereo, 192 to 256 kbit/s (AO-081 252k), mixed and encoded once for the whole film:
  joining separately encoded AAC pieces leaves small gaps at every join (each piece has its own encoder delay).
- **No in-band subtitle stream in the site copy.** Chrome and Firefox ignore it, Safari may list it as a second
  English option beside the `<track>`. No source metadata.

What the production kit already gives (`video/PRODUCTION.md`; measured today on `/home/user/gtv/production/proof.mp4`):
H.264 High@4.0 1920x1080 30 fps yuv420p with BT.709 tags, video 2.0 Mbit/s, AAC-LC 48 kHz (192k target, 178k
read), moov first, keyframes at 0, 7.3, 15.6, 24.0 and 32.3 s, plus a mov_text subtitle track. Its path is
`render_chapter.sh` per chapter, then `join.py` (chapters joined with `-c:v copy`, so each chapter starts on a
keyframe, sound joined as FLAC, each chapter cut to its video length), then `finish.py` (sound mastered and encoded once, `+faststart`). That meets
everything above except the subtitle track: `join.py` calls `finish.py --vtt`. For the site copy, run
`python3 kit/tools/finish.py <out>/film_raw.mp4 /home/user/gtv/render/guitar-video-to-tab.mp4` without `--vtt`
(the library copy may keep it), and ship `film.vtt` as `captions.vtt`.

Fallback, only if the film is encoded outside the kit. Tested on this box (ffmpeg 6.1.1, libx264): the output read
back as High, level 40, yuv420p, bt709 tags, keyframes exactly at the forced times, boxes `ftyp, moov, free, mdat`.

```bash
ffmpeg -i <master video> -i <final mix .wav> -map 0:v:0 -map 1:a:0 -map_metadata -1 -metadata title="[FILM TITLE]" \
  -vf "scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 20 -maxrate 6M -bufsize 12M -profile:v high -level:v 4.0 -r 30 -g 60 -keyint_min 30 \
  -force_key_frames "<chapter starts in seconds, comma-separated, e.g. 0,63.5,312.2>" \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart \
  /home/user/gtv/render/guitar-video-to-tab.mp4
```

`-r 30 -g 60 -keyint_min 30` assume 30 fps (a 2 s GOP, which makes scrubbing quicker than the default). At another
frame rate set `-r` to it and `-g` to 2 seconds of frames. Level 4.0 holds 1080p up to 30 fps (60 fps needs 4.2).
For RGB sources (PNG frames, a browser capture) the `out_color_matrix=bt709` part matters: ffmpeg's default for RGB
input is BT.601, which shifts colours against what players assume for HD. If the film is not 1920x1080, change the
markup's `width` and `height` to its size.

Disk (8 GB free today, 3 GB kept spare): at the peak `join.py` holds the chapter renders, `film_raw.mp4` (the video
plus FLAC sound, about 0.2 GB an hour more than the film) and `film.mp4` at once, about three times the film. A
full-length master at a higher quality does not fit beside that (60 minutes at 10 Mbit/s is 4.5 GB), so the web copy
is the master. Delete chapter renders and `film_raw.mp4` once the film is checked, and hard-link rather than copy
from then on (3.1, section 5).

Size: the binding limit is `npm run media:push`, which reads each file with `fs.readFileSync`. Node refuses a file
over 2 GiB: measured here with a 2,200,000,000-byte sparse file, `ERR_FS_FILE_TOO_LARGE: File size (2200000000) is
greater than 2 GiB`. R2's own single-PUT limit (4.995 GiB) is not the one that bites. A multipart upload is no way
around it: R2 then gives an ETag that is not the file's MD5, and the manifest and `media:verify` check that ETag.

| Length | at AO-081's 2.84 Mbit/s | at 3.5 Mbit/s | at 4.5 Mbit/s | most average bitrate for 1.9 GB |
|---|---|---|---|---|
| 30 min | 0.64 GB | 0.79 GB | 1.01 GB | 8.4 Mbit/s |
| 45 min | 0.96 GB | 1.18 GB | 1.52 GB | 5.6 Mbit/s |
| 60 min | 1.28 GB | 1.58 GB | 2.03 GB (too big) | 4.2 Mbit/s |

At the proof's 2.2 Mbit/s an hour is about 1.0 GB, well inside. Over 1.9 GB: encode the video again with the
fallback at CRF 22 or `-maxrate 5M -bufsize 10M`, or two-pass with the video a little under
`(1.9e9 * 8 / seconds) - 256k` bit/s.

Checks before it leaves the box:

```bash
f=/home/user/gtv/render/guitar-video-to-tab.mp4
stat -c %s "$f"    # must be < 2147483647; aim < 1900000000
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,profile,level,width,height,pix_fmt,avg_frame_rate,color_space,sample_rate,channels,bit_rate -of default=nw=1 "$f"
python3 -I - "$f" <<'EOF'
import struct, sys
f = open(sys.argv[1], 'rb'); end = f.seek(0, 2); off = 0; boxes = []
while off < end:
    f.seek(off); h = f.read(16); size, typ = struct.unpack('>I4s', h[:8])
    if size == 1: size = struct.unpack('>Q', h[8:16])[0]
    elif size == 0: size = end - off
    boxes.append(typ.decode('latin1')); off += size
print(boxes, 'faststart' if 'moov' in boxes and boxes.index('moov') < boxes.index('mdat') else 'NOT faststart')
EOF
```

Also: the last chapter's `data-t` is under the film's duration, and the figcaption's `mm:ss` is the duration ffprobe
gives, rounded down.

### 2.2 The poster

`public/media/guitar-tab-tools/film/poster.webp`, 1280x720 WebP (16:9, the film's shape), aim 30 to 60 KB. No
checker cap. Precedents: AO-081 45 KB, `claude-text-watermark` 36 KB, `showreel-rebuilt` 18 KB, AO-052 100 KB. It is
the first big picture on the page, so keep it small. A frame that says what the film is (a fretboard close-up with
its tab under it reads better than a title card). Tested on this box:

```bash
node scripts/tools/preview-media.mjs /home/user/gtv/render/guitar-video-to-tab.mp4 --at <s> --out public/media/guitar-tab-tools/film/poster.webp --size 1280x720 --cap 60k
```

### 2.3 Chapter stills

`public/media/guitar-tab-tools/film/chapters/01.webp`, `02.webp`, ... (two digits, in order), 320x180 WebP, aim
under 12 KB each (AO-081 2 to 9 KB, AO-052 up to 20 KB). The strip shows them 132 px wide (108 px on a phone), so
pick a frame 1 to 2 s after each chapter start, not a transition, with one clear subject rather than small text.

```bash
node scripts/tools/preview-media.mjs <film> --at <chapter start + 1.5> --out public/media/guitar-tab-tools/film/chapters/01.webp --size 320x180 --cap 12k
```

### 2.4 Captions

`public/media/guitar-tab-tools/film/captions.vtt`, WebVTT in git (`docs/MEDIA.md`: pictures and captions stay in
git). The site's files look like this (`public/media/claude-text-watermark/explainer.vtt`):

```text
WEBVTT

1
00:00:01.400 --> 00:00:04.941
In this lesson you'll learn how SynthID text
```

- UTF-8, LF line ends, `WEBVTT` first, numbered cues, `HH:MM:SS.mmm` times (hours always written, since the film may
  pass an hour), cues in order and never overlapping, 1 to 7 s each, at most 2 lines of about 42 characters.
- Escape `&` `<` `>` as `&amp;` `&lt;` `&gt;`. Never `-->` inside a cue.
- The words actually spoken (the narration script aligned with ElevenLabs' character timestamps, or a transcription of
  the final mix). Where a tab is played back with no speech, a short cue in brackets says what is playing, for
  example `[Basic Pitch's notes, played back]`.
- About 1,500 cues for 60 minutes, roughly 100 to 150 KB. Fine (the only cap is 25 MiB per public file).
- The kit's `join.py` writes `film.vtt` in exactly this shape (numbered cues, `HH:MM:SS.mmm`, each chapter's cues
  offset to its place in the film, built from ElevenLabs word timings). Ship that file as `captions.vtt` once it
  passes the check below. Its `chapters.vtt` is for the markup's `data-t`, not for the page.
- **No check reads `.vtt` files** (`never-publish.mjs` scans posts, notes and data, not `public/`). It is public, so
  check it yourself against the never-publish hashes (tested on this box):

```bash
node --input-type=module -e "
import fs from 'node:fs';
import { keys, hash } from './scripts/check/never-publish.mjs';
const hashes = new Set(JSON.parse(fs.readFileSync('src/data/never-publish.json', 'utf8')));
let hits = 0;
for (const f of process.argv.slice(1)) for (const [k] of keys(fs.readFileSync(f, 'utf8'))) if (hashes.has(hash(k))) { hits++; console.log('HIT', f); }
console.log('never-publish hits:', hits);
" public/media/guitar-tab-tools/film/captions.vtt
```

### 2.5 The hover card's still and loop

Posts that lead with a film carry a loop on their card: AO-081 and AO-052 both have `image` and `loop`, and
`PREVIEWS.md` says "a loop only when the subject moves: a film". AO-082's card has a still only today
(`/media/previews/guitar-tab-tools.webp`, 7.5 KB, the fingertips-on-a-fretboard frame) and no loop.

- Make both from the film: `node scripts/tools/preview-media.mjs guitar-tab-tools /home/user/gtv/render/guitar-video-to-tab.mp4 --at <s> --dur 3`.
  It writes `public/media/previews/guitar-tab-tools.webp` (replacing today's still: the loop's first frame) and
  `public/media/previews/guitar-tab-tools.mp4`, and prints the lines to paste (`image:`, `loop:`).
- Limits (`src/data/limits.js` `PREVIEW_MEDIA`): 640x360, at most 24 fps, loop at most 4 s (3 is the rule), still
  aim 30 KB and cap 48 KB, loop aim 150 KB and cap 240 KB. The script squeezes quality to fit and warns when it can't.
- The loop is video, so it goes to R2 with the film (`media:push`) and gets its own manifest line, as AO-081's did.
- Rewrite `alt:` for the new picture. Pick a moment that reads at 380 px wide: a hand on the fretboard, not tab digits.
- The card picture also shows on `/tea/` shelves that feature the post (`src/lib/tea.js` reads `image`).
- If no film moment reads at card size, keep today's still. That is allowed, it just doesn't move.

### 2.6 The other limits

`src/data/limits.js` has no limit for films, posters, chapter stills or captions. Its numbers: title 90 (aim 70),
summary 260 (aim 240), verdict 36, takeaway 200, point 150, 3 points, the card media above, icons 24 KB / 6 KB,
project pictures 640x360 60 KB, share cards 1200x630 150 KB. AO-082 today: title 49, summary 198, verdict 20,
takeaway 128, points 118, 118 and 95 characters (all 3 used).

AO-082 has no icon (`public/media/icons/AO-082.webp` is missing), so its ledger row, header and share card draw the
"agents" glyph. The film doesn't need one. The agent kit's icon recipe makes one if wanted (`docs/MEDIA.md`).

## 3. Getting it to the site

### 3.1 Where to work

The post lands on `main` only. This checkout (`/home/user/blog`) is the research branch `research/guitar-tab-tools`
(pull request #10, the research folder only), and the research folder is not on `main`. Work in the landing worktree
`/home/user/land` (clean, at `31d83c04`, which is `origin/main` and the live commit today, with its own
`node_modules`), on a fresh branch:

```bash
cd /home/user/land && git fetch origin && git checkout -B land-film origin/main
git log -1 origin/main     # recent; src/content/posts/ holds dozens of posts. If not, stop: wrong base.
```

Disk: the film lives in `/home/user/gtv`. Put it into the worktree as a hard link (same filesystem), not a copy, so it
costs no second 1 to 2 GB. `media:push` then removes only the link.

```bash
mkdir -p public/media/guitar-tab-tools/film/chapters
ln /home/user/gtv/render/guitar-video-to-tab.mp4 public/media/guitar-tab-tools/film/guitar-video-to-tab.mp4
# plus poster.webp, captions.vtt, chapters/*.webp (copies, they are small), and the card still and loop from 2.5
```

### 3.2 `npm run media:push`

What it does (`scripts/media/push.mjs`, `files.mjs`):
- Reads every video and audio file under `public/` (`mp4 m4v webm mov m3u8 ts mp3 m4a aac wav flac ogg oga opus`)
  outside `courses/` and the live notebook's folders, and compares its bytes and MD5 with
  `src/data/media-manifest.json`. New or changed files are uploaded, the rest counted as already in R2.
- Upload: one signed S3 PUT per file (AWS SigV4, region `auto`) to the private bucket `aaronorelup-site-media`, key =
  the URL path without its leading slash, content type from the extension, 8 files at a time. One piece per file, so
  R2's ETag is the MD5, and the script stops if it isn't.
- Keys: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` from the environment, else through
  `~/.claude/bin/getkey.py` (it does this itself, nothing is printed).
- Writes the manifest (in a `finally`, so files that made it are recorded even if a later one fails), then deletes the
  local copies whose MD5 matches (`-- --keep` leaves them).
- Limits: the whole file is read into memory (more than once: MD5, upload, removal check), so under 2 GiB per file
  (above), and run it with nothing heavy beside it (15 GB of memory, and a 1.9 GB file can hold several GB at once).
  No timeout, no retry, no resume: a dropped PUT throws and a stalled one hangs. Run it as
  `timeout 45m npm run media:push`, and after either failure run it again (it skips what the manifest already has).

Has a 1 to 2 GB upload been done? Yes, once: AO-081's 1,043,771,613-byte film, in commit `0a170072` (2026-11-11,
"The film (1080p master) and the card's loop are in R2 (media:push)"), from a Claude session (author Claude,
+0000). No record says how long it took (not the commit, the post or any doc). For scale, measured today: 100 MB
downloaded from the live film through this box's proxy in 3.4 s (29.6 MB/s). Upload speed wasn't measured (nothing
test-uploaded to the site's bucket). Node's built-in fetch reached the site from this box without
`NODE_USE_ENV_PROXY=1` (measured). If a PUT times out with no proxy error, run it again with that variable set
(`/root/.ccr/README.md`).

### 3.3 The manifest

`media:push` adds the lines itself, for example
`"/media/guitar-tab-tools/film/guitar-video-to-tab.mp4": {"bytes":<size>,"etag":"<md5>"}` and the card loop's.
Commit `src/data/media-manifest.json` with the post. It is never merged by hand. If the rebase in 3.5 conflicts on it:
take `origin/main`'s file, link the film back into `public/` and run `npm run media:push` again (it uploads the same
bytes again, a few minutes, and writes the lines onto the new manifest), then remove the link before building.

### 3.4 The edit, then check, build and test

1. Paste the block of section 1, the post text of section 4.2 and the card fields of 2.5.
2. `npm run check -- src/content/posts/guitar-tab-tools.md` (0 errors; `-- --strict` also fails warnings).
3. `node scripts/tools/element-usage.mjs --diff <copy of the old post> src/content/posts/guitar-tab-tools.md`: every
   old `<ao-*>`, video, audio and iframe block (the 11 `<ao-compare>`) is still there byte for byte.
4. `npm run build` (the deploy checks, then `astro build`, then the contracts and budgets on `dist/`). It refuses any
   video or audio still in `public/`, so `media:push` comes first.
5. `npm test` (unit tests, and the budgets of the last build: an element's JS and CSS at most 6 KB. `<ao-shots>`
   already ships on four posts that pass).
   Nothing checks that the poster, chapter stills or `.vtt` exist (`assets.mjs` checks only video, audio and card
   media), so `ls` them before the build.
6. The e2e specs the change touches, desktop project:
   `npm run e2e -- tests/e2e/elements/shots.spec.mjs tests/e2e/core.spec.mjs tests/e2e/post.spec.mjs tests/e2e/cards.spec.mjs --project desktop`.
   The config starts its own `astro preview` and sends media requests to the live site, so the film must already be
   in R2. Two box facts (measured): the repo's Playwright 1.64.1 wants the Chromium headless shell build 1248 and
   `/opt/pw-browsers` has 1243 ("Executable doesn't exist"), so run `npx playwright install --only-shell chromium`
   first (about 260 MB). WebKit isn't installed, so the `phone` project (iPhone 13) can't run here.
   These specs take their pages from `tests/e2e/targets.json` (rebuilt from `dist/` on every run), so they may not
   open AO-082 itself. Look at AO-082 directly too: `npm run dev` (media in the manifest is sent to the live site),
   open `/ledger/guitar-tab-tools/` at 1440 px and at phone width, check the poster box is 16:9 from the start, a
   chapter click plays from its time, the lit chapter follows, captions show from the CC menu, the bar names the film.

### 3.5 Landing (`CLAUDE.md`)

1. `git fetch origin && git rebase origin/main`. Other sessions push to `main` all day. If the new commits touch only
   AO-073's paths, push without rebuilding, otherwise build again. A `package-lock.json` conflict: take `origin/main`'s
   and `npm install` again. A manifest conflict: 3.3.
2. `git push origin HEAD:main`. Rejected: back to 1. Never force-push.
3. Within 10 minutes `curl -s https://aaronorelup.com/version.json` shows `"branch": "main"` and this commit or a
   newer one. Another branch or an older commit means the deploy went wrong: say so and stop.
4. Media changed, so `npm run media:verify`: every manifest file answers from R2 with the right length, type and ETag
   (a one-byte range each), then a mid-file range, the first two bytes and a 304 on the largest MP4, which will be the
   new film if it is over 1,043,771,613 bytes.
5. Live checks:
   ```bash
   u=https://aaronorelup.com/media/guitar-tab-tools/film
   curl -sI $u/guitar-video-to-tab.mp4 | grep -i -E 'HTTP/|content-type|content-length|x-media-source'   # 200, video/mp4, manifest bytes, r2
   curl -s -r 0-1 -o /dev/null -w '%{http_code}\n' $u/guitar-video-to-tab.mp4                            # 206
   curl -sI $u/captions.vtt | grep -i -E 'HTTP/|content-type'                                              # 200, text/vtt
   curl -s https://aaronorelup.com/ledger/guitar-tab-tools/ | grep -c 'guitar-video-to-tab.mp4'            # 1
   ```
   Then open the live post and its hover card (desktop and phone, day and night).
6. A live check that fails because of this change: push `git revert` of it at once, then report.

The post is listed, so the push publishes the film the moment it deploys: there is no draft step for an edit. The
site's rule is that a post goes out on Aaron's OK in his own words. His ask for this job was that the film goes at
the top of the post, live (`video/STATE.md`). Quote his words in the commit message. The commit ends with the
session's attribution lines, and commits no video (the build would refuse it anyway).

## 4. What else reacts, and the post's text

### 4.1 What the rest of the site does with a film on a listed post

| Part | What happens | Source |
|---|---|---|
| Read-aloud (Listen) | Skips `<ao-*>`, `figure`, `figcaption`, `video`: the film, its labels and caption are never read. A new sentence in the opening changes the first section's hash, and the `read.step` cron (every 10 min, the Worker's own ElevenLabs key) re-voices that section only. Until it has, Listen uses the browser's voice. Nothing to do. | `src/lib/text/rules.js`, `docs/WORKER.md` |
| Search | Every `<ao-*>` is stamped `data-pagefind-ignore`, and the Vectorize chunks come from the same text, so the film is invisible to search unless the post's text names it. The changed doc is re-embedded by `search.sync` within minutes. | `rehype-post-text.mjs`, `ARCHITECTURE.md` |
| Ask (RAG Goobie) | `text.full` leaves out `<ao-*>` insides, captions included (putting component captions in was tried in T2.8 and is not live). Ask only knows the film from a sentence in the text. AO-082 is far over `DOC_CAP` (36k est. tokens, its top kept), and the opening is in the top. | `docs/ASK.md` |
| Share card `/og/guitar-tab-tools.jpg` | Drawn from icon (here the topic glyph), id, topic, title and verdict. No `og:video`, no VideoObject in the JSON-LD, no RSS enclosure anywhere on the site. Unchanged unless the title or verdict change (then it is redrawn and `?v=` changes). | `src/lib/og/`, `src/lib/jsonld.js` |
| Hover card, short version box | Text and picture from `preview:`. A loop (2.5) plays after a quarter second open, never on phones, Save-Data, 2G or reduced motion. | `PREVIEWS.md` |
| Reading minutes | Words of the main read at 230 a minute. The film doesn't count. State its length in the text and caption. | `src/lib/text/minutes.js` |
| Markdown twin `/ledger/guitar-tab-tools.md`, `/llms-full.txt` | Carry the raw `<ao-shots>` block with absolute URLs, so agents see the film's address, chapters and caption. | `src/lib/agent-text.js` |
| One player at a time | The film is a lone player: playing it pauses anything else, and scrolled away with sound it keeps playing with the now-playing bar (named by `aria-label`). The homepage reader's `ao-stop` pauses it. | `src/elements/_core/player.js` |
| `media:verify` | Probes the largest MP4 in the manifest from now on if the film is the largest. | `scripts/media/verify.mjs` |
| e2e targets | AO-082 joins the `<ao-shots>` pages. `pageWith('ao-shots')` takes the first page in order, so shots-1 probably still opens AO-081. | `tests/e2e/helpers.mjs` |

### 4.2 The post's text should change

Yes. Without a sentence in the text, Ask, search and Listen never learn the film exists, and `WRITING.md` wants the
opening to carry what was found. Every new line follows `WRITING.md`'s voice (Aaron, first person, short sentences,
no em dashes, no semicolons, few colons, terms explained, no "here's", no "in this post", no telling the reader how
to read it). Both candidates below passed the prose rules (no em dash, en dash, semicolon or banned phrase, checked
against `src/data/banned-phrases.js`).

1. **A third paragraph in the opening**, after the old line 21 and before `## The quick rundown`, with the film's main
   result and its length:

   > The film at the top puts these tools to work on three real recordings of a whole song played on guitar, each
   > with a video and a tab to check against. One is played with a capo, one in [TUNING], where the strings are tuned
   > to different notes than usual, and one with neither. Every tab in it is also played back, so you can hear where
   > it's right and where it isn't. At the end Claude Opus 5.5 tabs each song from the video alone with the answer
   > hidden, once with the tools that held up and once without. [THE RESULT IN ONE SENTENCE, WITH ITS NUMBERS.] It
   > runs [NN] minutes.

   The one-line version, if the results go elsewhere: "The film at the top runs these tools on three real guitar
   videos whose tabs are known, plays every tab back, and ends with Claude Opus 5.5 tabbing each song blind, with
   the tools that held up and without them. It runs [NN] minutes."

   If the blind result is the strongest finding of the whole post, it belongs in the first 2 to 4 sentences
   (`WRITING.md`), so move that one sentence into the first paragraph.
2. **The counts.** The post says 138 of 575 tools ran and lists what it didn't run. `EXPERIMENTS.md` plans GPU runs of
   tools the post lists as not run (YourMT3+ on a GPU, MT3, ADTOF, BTC). If the film runs them, the post must say so
   (one sentence, with the number) or its counts read as wrong next to the film. Dating the survey's counts ("in the
   survey's two sittings") is the lighter fix.
3. **The credit line** at the very end gets one sentence: "The film was made by Claude agents from 2026-11-24 to
   [DATE], [WHO] directing." Keep the rest of it.
4. **"What it cost"** gets the film's costs (tokens, ElevenLabs credits, any rented GPU) in a sentence, the detail
   folded.
5. **The card** stays about the survey unless the film's result replaces a point (3 points are used, aim 120
   characters each). The card never says more than the post. Add the loop and new `alt` from 2.5.
6. **The summary** may say it (today 198 characters, aim 240): "I had Claude agents list every tool for turning songs
   and guitar videos into tabs, run what they could and read each license, then film the ones that held up on three
   real songs. What went in, what came out, what it cost." (221 characters.) The title can stay.
7. **Credit the three recordings** (performer, link, who wrote the tab) in a folded `<details>` right under the film
   or in the caption's meta line. External links are allowed (`links.mjs` checks the site's own). Licensing is not a
   concern for this film. One note: served from Aaron's own R2 it plays as is, but a later YouTube upload of the same
   film could be claimed by those songs' rights holders.

## 5. Filing the originals in the studio library

`docs/MEDIA.md` and `WRITING.md`: the full-size originals of anything generated go to Aaron's studio library, the
site's bucket keeps only what the site plays. A job that made media is not done until it is pushed and the run id is
reported (`~/agent-kit/skills/studio-library/SKILL.md`, the live rules from `studio rules`, a copy in
`~/.claude/library-rules.txt`).

```bash
studio push blog-posts /home/user/gtv/library --agent <short job name> --dry-run   # checks the closed lists, uploads nothing
studio push blog-posts /home/user/gtv/library --agent <short job name>
studio promote blog-posts <run-id> guitar-tab-tools                                # the finished film into the project tree (adds only)
```

- `studio` is installed (`/root/.local/bin/studio`), with rclone 1.76 (multipart, 64 MB parts), so a 1 to 2 GB film
  goes up. The HTTP fallback (`/api/library/upload`) takes at most 100 MB a file, so not the film.
- Fill the folder with hard links from `/home/user/gtv`, not copies (disk).
- What to file: the film (the best master there is. If only the web copy exists, that one), the narration, any
  generated music or sound, the played-back tab audio, the poster, the chapter stills (or one contact sheet), the
  card still and loop. The three source recordings may go in as `reference` with their links, as the research's test
  clips were (run `20261110-225132-vm-7d3107`).
- `NOTES.md` in the folder: free text first (searchable): what the film is and for which post
  (`aaronorelup.com/ledger/guitar-tab-tools/`), the three recordings (title, performer, link, capo or tuning), the
  tools run, the narrator (voice name and id, model, settings), how it was rendered, where the written records are
  (`docs/guitar-tab-research/video/` on the research branch). No keys. Then `field: value` lines. Fields are
  `characters, purpose, model, prompt, status, pick, replaces, title`. Lines before the first `## <file name>`
  apply to the whole run, lines under one apply to that file.
- Closed lists (live today): project `blog-posts`. Purpose: `final draft test concept sheet keyframe storyboard shot
  asset plate mask cover music voice sfx reference frame screenshot contact-sheet rig 3d-model training-data doc`.
  Model includes `elevenlabs`, `hyperframes`, `higgsfield`, `hand-made` (an unknown model is kept as plain text). No
  characters: none of Aaron's characters are in it, so leave it empty and name the guitarists in the free text.
- Status: agents may set `new` (the default), `wip`, `reference`. Only the film stays New, with a `pick:`. Mark the
  rest `status: reference`, or a run of more than 12 New files is folded by age. `purpose: final` only on the
  finished film ("keep this forever": finals are copied to Aaron's laptop every hour).

```text
[Free text: the film for AO-082 ...]

## guitar-video-to-tab.mp4
title: [FILM TITLE]
purpose: final
model: [the renderer, e.g. hyperframes]
pick: the finished film as published at the top of AO-082

## narration.wav
purpose: voice
model: elevenlabs
status: reference
prompt: [voice name and id, model id, settings]

## poster.webp
purpose: cover
status: reference

## chapters-sheet.webp
purpose: contact-sheet
status: reference
```

Report the run id and the item ids (`#1234`) in the final message.

## 6. The order, start to finish

1. The kit's chapter renders and `join.py`, then `finish.py` without `--vtt` into
   `/home/user/gtv/render/guitar-video-to-tab.mp4` (2.1), then the checks in 2.1 (size, profile, faststart).
2. `film.vtt` as `captions.vtt` (2.4) after its never-publish check. Poster and chapter stills (2.2, 2.3), the
   chapter times from the kit's `chapters.vtt`. Card still and loop (2.5).
3. `studio push` the originals (section 5), report the run id.
4. Worktree on `origin/main` (3.1), hard-link the film in, copy the rest, `npm run media:push` (3.2).
5. Edit the post (section 1, 4.2), `npm run check`, the `--diff`, `npm run build`, `npm test`, e2e (3.4).
6. Rebase, push `main`, `version.json`, `media:verify`, live checks, revert on failure (3.5).
7. Add a line to `video/STATE.md` and the pull request note on the research branch.

The research folder is public too, and `scripts/check/never-publish.mjs` doesn't scan `docs/guitar-tab-research/`.
Run the snippet of 2.4 over `docs/guitar-tab-research/video/*` before each commit of the records (today: 0 hits in all
five files, after this file's one hit, a private host name, was taken out).
