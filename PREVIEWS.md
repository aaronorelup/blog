# Ledger previews: the card that opens when you hover a post

Hover any link to a post (a ledger row, a series thread, an older/newer link, a cross-link
inside a post) with a mouse, and a card opens beside it: a verdict, a one-sentence takeaway,
up to three findings, and a small still or a three-second silent loop from the post. The aim is
that a reader who never clicks still leaves with most of what the post has to teach: roughly
half of the value for about one percent of the reading.

**Every post gets one, written when the post is written.** A post without one still gets a card
(its opening lines, automatically), so nothing breaks, but the build lists it as missing and it
doesn't do the job. This file is the spec. Read it before writing a preview.

## Where it lives

In the post's frontmatter, under `preview:`

```yaml
preview:
  verdict: "The previs made it worse"
  takeaway: "A video model copies the motion in a Blender guide animation (a previs) as faithfully as its camera, bad animation included."
  points:
    - "Mine held attacks Opus 5.5 had failed to animate. MiniMax-H3 kept every beat of them, down to the dangling legs."
    - "Without a previs the motion felt far better, but where Jefrie stood and which way her scythe swung were often unclear."
    - "Even a previs of grey boxes and spheres dragged the motion down. Keep it simple enough that you can animate it well."
  image: "/media/previews/a-bad-previs.webp"
  loop: "/media/previews/a-bad-previs.mp4"
  alt: "Jefrie's marionette attack side by side: the no-previs take on the left, the previs take on the right"
```

That is AO-023's real card. Notice what it doesn't do: the summary beside it already says the
previs made the movement worse, so the points spend their space on what the summary doesn't say
(how closely it copied, what was better without it, that even boxes didn't help). An earlier
draft ended on "next time, use a rectangle", which the post suggests and then doubts in the very
next paragraph; a card must not be more certain than its post.

| Field | Required | Target | Build refuses over |
|---|---|---|---|
| `takeaway` | yes | 90–160 characters | 200 |
| `points` | no (2–3 is normal) | each ≤ 120 characters | 150 each, 3 items |
| `verdict` | no, but nearly always worth it | 2–5 words, ≤ 28 characters | 36 |
| `image` | no | 640×360 WebP, ≤ 30 KB | 48 KB, or a file that isn't there |
| `loop` | no, and only with `image` | 640×360 H.264, 3 s, ≤ 150 KB | 240 KB, or a file that isn't there |
| `alt` | with `image` | what the picture shows | |

The caps live in `src/data/preview-budget.js`; the schema (`src/content/config.ts`) and the
previews endpoint (`src/pages/ledger/previews.json.js`) enforce them, so `npm run build` fails
on an over-long line or an oversized file before it can ship.

## Writing it

The reader is skimming a list. The card is read in the order it's laid out, and they can stop
anywhere:

1. **Verdict** (a second): the outcome as a stamp. "Worked: 27 of 30", "Gave up on day seven",
   "The scripted rig won", "Still unsolved". For an essay, the stance: "Bursts beat drip-feeding".
2. **Takeaway** (five seconds): the one sentence a reader should walk away with. A claim, not a
   description: "X turned out to be Y, because Z", never "This post explores X". If the whole
   post had to be a tweet, this is the tweet.
3. **Points** (fifteen seconds): the findings that make the takeaway believable or useful. The
   numbers, the names, what worked, what didn't, the surprise, what to do instead. Most
   important first. Each one stands alone.

Rules:

- **Don't repeat the summary.** In the ledger the summary sits right next to the card, and it is
  often a hook that withholds the answer ("what each one is, and when I'd reach for which").
  The card gives the answer. Where the summary already states the conclusion, the takeaway can
  say it in fewer words, but the points must say things the summary doesn't.
- **Only what the post says.** Every number and claim must be in the post. Don't add, don't
  round in a way that changes the meaning, don't improve on the result.
- **Keep the dead ends.** The ledger is not a highlight reel. If it failed, the verdict says so.
- **Aaron's voice:** first person where the post is first person, plainspoken, specific. No hype
  words (incredible, powerful, game-changing), no "In this post", no emoji, no exclamation marks.
- **Write for someone who hasn't read it.** Name things the way a newcomer would understand
  them: "a Blender animation used as a guide (a previs)", not "the previs" cold.
- Straight quotes and plain hyphens are fine. Use `"..."` in YAML and escape inner double quotes.

A post written by Claude about its own work (AO-022) keeps the post's voice, not Aaron's.

## The picture

The card shows one picture from the post: the one a reader would recognise it by, so it
reminds people who did read it and tells people who didn't what it's about.

- **Take it from the post itself.** It should be something the reader sees there. The result
  rather than a diagram of the process; one subject rather than a grid of twelve.
- **A loop only when the subject moves**: a film, an animation, a game, a music video, a
  side-by-side of motion. Three seconds of something recognisable, not a fade or a black frame.
  A still is enough for everything else, and for posts with no pictures at all, use nothing.
  A text-only card is fine; a decorative picture is not.
- **It has to read at 380 pixels wide.** Small text in a screenshot won't. Faces, characters,
  one clear object, a strong silhouette.
- Nothing violent or gory, even if the post has it.

Make the files with the script, which crops to the 640×360 frame and squeezes quality until each
file is under its target:

```bash
cd blog
node scripts/preview-media.mjs <slug> /media/<folder>/<file>.webp                       # a still
node scripts/preview-media.mjs <slug> /media/<folder>/<clip>.mp4 --at 41.5 --dur 3      # still + loop
node scripts/preview-media.mjs <slug> /media/<folder>/<sheet>.webp --fit blur           # portrait or odd shape
node scripts/preview-media.mjs <slug> /media/<folder>/<img>.webp --focus top            # keep the head in a crop
```

It writes `public/media/previews/<slug>.webp` (and `.mp4`) and prints the lines to paste. A
loop's still is its first frame, so the poster and the playing video line up. In Git Bash, set
`MSYS_NO_PATHCONV=1` or drop the leading slash (`media/<folder>/x.mp4`), or Bash rewrites the
path. Then **look at the result**: open the WebP, and for a loop, step through it
(`ffmpeg -i public/media/previews/<slug>.mp4 -vf fps=2,tile=6x1 sheet.png`). A cropped-off head
or an illegible frame is worse than no picture.

If the script warns that a file is over its target at the lowest quality, the moment is too busy:
pick a calmer stretch, a shorter `--dur`, or a tighter `--crop`.

## Why the numbers are what they are

The whole thing has to feel instant on a slow laptop on a slow connection, and cost nothing to
anyone on a phone.

- **Text is never fetched on hover.** Every listed post's card text is in one file,
  `/ledger/previews.json`, built from the frontmatter. A mouse-and-hover device fetches it once
  while the browser is idle; phones and tablets never fetch it at all. It measured 13 KB
  compressed for 40 posts on 2026-10-07, about a third of a kilobyte each, so it stays small
  for hundreds of posts. A longer preview makes it bigger for every visitor, not just for one
  card.
- **A still costs only when it might be seen.** It starts loading when the pointer reaches the
  row (or the row next to it), before the card has even opened. At 30 KB that is a tenth of a
  second on ordinary broadband and about half a second on slow 3G; the text shows immediately
  either way.
- **A loop costs only when someone stays.** It is fetched after the card has been open for a
  quarter of a second, as one small file fetched whole (cancelled if the reader moves on first),
  and played muted from memory, so looping and coming back to the card cost no requests. It is never
  fetched with Save-Data on, on a 2G connection, or with reduced motion on; those readers get the
  still. A 640×360 H.264 clip is decoded by the graphics hardware of any laptop from the last
  decade, so playing it costs next to nothing; 150 KB is what keeps fetching it cheap.
- **The card itself** is one element, reused: placed once per open, faded in with `opacity` and
  a 4px `transform`, no blur and no shadow animation, and nothing runs on mouse move.

## How the card behaves

- It opens about 90 ms after the pointer settles on a link, and instantly when moving from one
  link to the next while a card is open. Tabbing to a link with the keyboard opens it too;
  Escape, a click or a scroll closes it (a scroll brings it back if the pointer is still there).
- On a ledger row it sits flush with the row's right edge, level with the summary and below the
  title, taking the hovered row's colour, so it reads as that row opened out. Inside a post it
  goes in the margin beside the column when there's room, otherwise above or below the link.
- It may cover the rows around the hovered one, but never that row's own title or summary, or
  the link itself. Where the full card can't sit clear of them it steps down a size: the picture
  shrinks to a thumbnail the text wraps around, then the picture goes, then the findings go and
  only the verdict and takeaway stay. On a 1440×900 screen, 105 of 120 placements (every row at
  the top, middle and bottom of the screen) were full size; at 1280×720, 79.
- Not on phones or tablets, and not in print.

## How it works (for whoever changes it)

- `src/content/config.ts`: the `preview` schema.
- `src/pages/ledger/previews.json.js`: builds `/ledger/previews.json` from listed posts only
  (`isListed`, so unlisted and draft posts never surface in a card), with reading time, and for a
  post without a preview, its opening lines. Fails the build on a missing or oversized media file
  and prints which posts have no preview.
- `src/scripts/ledger-preview.js` and `src/styles/ledger-preview.css`: the card. Loaded by
  `LedgerView.astro` and `PostView.astro`, so it runs on `/ledger`, every post page and the
  homepage (whose panel renders `LedgerView`, and whose reader injects post bodies, so their links
  get cards too). It lives inside `#panel-screen` so it picks up the day/night palette.
- `scripts/preview-media.mjs`: makes the media. `src/data/preview-budget.js`: the numbers.

`node scripts/preview-media.mjs` needs ffmpeg on PATH; the build doesn't (it only checks the
files that are committed).
