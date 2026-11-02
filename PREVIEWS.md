# Ledger previews: the card that opens when you hover a post

Hover any link to a post with a mouse (a ledger row, an older/newer link, a cross-link inside a
post) and a card opens beside it: a verdict, a short takeaway, up to three more findings, and a
small still or a three-second silent loop from the post. **The card gives the post's
conclusions.** A reader who never clicks still leaves knowing what the post found.

It's the third of the four layers in `WRITING.md`: the title says what the post is about, the
description (`summary`) says what you'd learn or what was tested, the card gives the
conclusions, and the post opens with them too. Read `WRITING.md` first. It owns the voice and the
writing rules. This file is the card's spec.

**Every post gets one, written with the post.** A post without one still gets a card (its opening
lines, automatically), so nothing breaks, but the build lists it as missing and it doesn't do
the job.

## Where it lives

In the post's frontmatter, under `preview:`

```yaml
preview:
  verdict: "All five caught it"
  takeaway: "All five other AI writers flagged the fake fact within 17 minutes, and none of them reused it. It drew more flags than any honest mistake in the room."
  points:
    - "The lie: that 'introspection' was once a word glaziers used for checking window glass. One search disproves it."
    - "Everyone had been asked to list anything that looked made up. Only the liar knew a lie was planted."
    - "The liar caught both of the room's honest mistakes. A boring fake number would have had a better chance."
  image: "/media/previews/the-planted-lie.webp"
  alt: "A string-art portrait in gold thread: from across the room a face, from close up only circles of thread"
```

That's the approved rewrite of AO-066's card. Its description says what was tested ("whether the other five noticed,
and how fast"). The card answers it: the verdict is the result, the takeaway is the result with
its numbers, and the points add what the takeaway doesn't say (what the lie was, that everyone
had been told to doubt, who caught what).

| Field | Required | Aim for (`WRITING.md`) | Build refuses over |
|---|---|---|---|
| `takeaway` | yes | 1 or 2 short sentences, ≤ 160 characters, 200 at most | 200 |
| `points` | no (2 or 3 is normal) | each ≤ 120 characters | 150 each, 3 items |
| `verdict` | no, but nearly always worth it | 2 to 5 words, ≤ 28 characters | 36 |
| `image` | no, but every post has media, so nearly always | 640×360 WebP, ≤ 30 KB | 48 KB, or a file that isn't there |
| `loop` | no, and only with `image` | 640×360 H.264, 3 s (4 at most), ≤ 150 KB | 240 KB, or a file that isn't there |
| `alt` | with `image` | what the picture shows | |

The caps live in `src/data/limits.js`. The schema (`src/schemas/preview.ts`) refuses text over
them, and the checker (`scripts/check/assets.mjs`, the first step of `npm run build`) refuses
missing or oversized media, so the build fails before either can ship. The tighter "aim for"
numbers are the writing rules, checked by `npm run check`.

## Writing it

The reader is skimming a list. He reads the card top to bottom and can stop anywhere:

1. **Verdict** (a second): the outcome as a stamp. "4-5x faster, not 30x", "Gave up on day
   seven", "The scripted rig won", "Still unsolved". For an opinion post, the stance: "Bursts
   beat drip-feeding".
2. **Takeaway** (five seconds): the main conclusion. A claim, with its number if it has one. "X
   turned out to be Y, because Z", never "This post explores X". If the whole post had to be a
   tweet, this is the tweet.
3. **Points** (fifteen seconds): the other findings, the ones that make the takeaway believable
   or useful. Numbers, names, what worked, what didn't, what to do instead. Most important first.
   Each one stands alone.

Rules:

- **The card gives the answer, all of it.** Nothing is held back for the click. If the post found
  three things, the card says three things.
- **The description doesn't hold it back either.** It says what was done or tested and what
  you'd learn. It can state the result. It never teases it ("here's what happened", "the answer
  surprised me", "what each one is, and when I'd reach for which"). If a description reads like
  a hook, fix the description. Don't write the card around it.
- **Don't repeat the description.** In the ledger it sits right next to the card. Where the
  description already states the result, the takeaway can say it in fewer words, but the points
  must say things the description doesn't.
- **Only what the post says.** Every number and claim must be in the post. Don't add, don't
  round in a way that changes the meaning, don't improve on the result. A card must never be
  more sure than its post.
- **Keep the dead ends.** The ledger is not a highlight reel. If it failed, the verdict says so.
- **Write for someone who hasn't read it.** Name things the way a newcomer would understand
  them: "a Blender animation used as a guide (a previs)", not "the previs" cold.
- **Voice is `WRITING.md`'s.** No em dashes, no semicolons, no hype words, no emoji, no
  exclamation marks. A post where Claude tells its own story keeps Claude's voice in its card.
- Straight quotes and plain hyphens. Use `"..."` in YAML and escape inner double quotes.

## The picture

The card shows one picture from the post: the one a reader would recognise it by, so it reminds
people who read it and tells people who didn't what it's about.

- **Take it from the post itself.** Something the reader sees there. The result rather than a
  diagram of the process. One subject rather than a grid of twelve.
- **A loop only when the subject moves**: a film, an animation, a game, a music video, a
  side-by-side of motion. Three seconds of something recognisable, not a fade or a black frame.
  A still is enough for everything else.
- **Every post has media now, so every card gets a picture.** Don't make a decorative one for a
  card. A post whose own pictures don't work at card size will get its generated icon instead
  once those land.
- **It has to read at 380 pixels wide.** Small text in a screenshot won't. Faces, characters,
  one clear object, a strong silhouette.
- Nothing violent or gory, even if the post has it.

Make the files with the script, which crops to the 640×360 frame and squeezes quality until each
file is under its target:

```bash
cd blog
node scripts/tools/preview-media.mjs <slug> /media/<folder>/<file>.webp                       # a still
node scripts/tools/preview-media.mjs <slug> /media/<folder>/<clip>.mp4 --at 41.5 --dur 3      # still + loop
node scripts/tools/preview-media.mjs <slug> /media/<folder>/<sheet>.webp --fit blur           # portrait or odd shape
node scripts/tools/preview-media.mjs <slug> /media/<folder>/<img>.webp --focus top            # keep the head in a crop
node scripts/tools/preview-media.mjs <slug> /media/<folder>/<clip>.mp4 --at 12 --still        # only a still, from a video
```

Other options: `--crop w:h:x:y` cuts a region out of the source first, `--focus x,y` takes two
fractions. The source is a path under `public/` or any file on disk. It writes
`public/media/previews/<slug>.webp` (and `.mp4`) and prints the lines to paste. A loop's still is
its first frame, so the poster and the playing video line up. In Git Bash, set
`MSYS_NO_PATHCONV=1` or drop the leading slash (`media/<folder>/x.mp4`), or Bash rewrites the
path. Then **look at the result**: open the WebP, and for a loop, step through it
(`ffmpeg -i public/media/previews/<slug>.mp4 -vf fps=2,tile=6x1 sheet.png`). A cropped-off head
or an unreadable frame is worse than no picture.

If the script warns that a file is over its target at the lowest quality, the moment is too busy:
pick a calmer stretch, a shorter `--dur`, or a tighter `--crop`.

## Why the numbers are what they are

The whole thing has to feel instant on a slow laptop on a slow connection, and cost nothing to
anyone on a phone.

- **Text is never fetched on hover.** Every listed post's card text is in one file,
  `/ledger/previews.json`, built from the frontmatter. A mouse-and-hover device fetches it once
  while the browser is idle. Phones and tablets never fetch it. It measured 13 KB compressed for
  40 posts on 2026-10-07, about a third of a kilobyte each, so it stays small for hundreds of
  posts. A longer card makes it bigger for every visitor, not just for one card.
- **A still costs only when it might be seen.** It starts loading when the pointer reaches the
  row (or the row next to it), before the card has even opened. At 30 KB that's a tenth of a
  second on ordinary broadband and about half a second on slow 3G. The text shows immediately
  either way.
- **A loop costs only when someone stays.** It's fetched after the card has been open for a
  quarter of a second, as one small file fetched whole (cancelled if the reader moves on first),
  and played muted from memory, so looping and coming back to the card cost no requests. It's
  never fetched with Save-Data on, on a 2G connection, or with reduced motion on. Those readers
  get the still. A 640×360 H.264 clip is decoded by the graphics hardware of any laptop from the
  last decade, so playing it costs next to nothing. 150 KB is what keeps fetching it cheap.
- **The card itself** is one element, reused: placed once per open, faded in with `opacity` and
  a 4px `transform`, no blur and no shadow animation, and nothing runs on mouse move.

## How the card behaves

- It opens about 90 ms after the pointer settles on a link, and instantly when moving from one
  link to the next while a card is open. Tabbing to a link with the keyboard opens it too.
  Escape, a click or a scroll closes it (a scroll brings it back if the pointer is still there).
- On a ledger row it sits flush with the row's right edge, level with the summary and below the
  title, taking the hovered row's colour, so it reads as that row opened out. Inside a post it
  goes in the margin beside the column when there's room, otherwise above or below the link.
- It may cover the rows around the hovered one, but never that row's own title or summary, or
  the link itself. Where the full card can't sit clear of them it steps down a size: the picture
  shrinks to a thumbnail the text wraps around, then the picture goes, then the points go and
  only the verdict and takeaway stay. On a 1440×900 screen, 105 of 120 placements (every row at
  the top, middle and bottom of the screen) were full size. At 1280×720, 79.
- On a short window it steps down the same way, so it is never cut off, by the window or by its own box: at
  1366×657 and 1024×600 a card of three long findings opens with the thumbnail (`cards.spec.mjs`). The card's
  `max-height` is only a backstop for a window too small for any size.
- **On RAG Goobie's citations** (Ask RAG Goobie's `[1]`, `[2]` on `/ledger/`) the card is the cited post's,
  with one more line under the title naming the passage the link lands on: "RAG Goobie cites: How the
  chaining works", "the opening", "the short version", or for a passage of the notes page, "...,
  in the full making-of". Two citations of one post show the same card with different lines, and
  moving straight from one to the other changes only the line: its loop plays on. A citation of a
  notes page gets its post's card this way; any other link to a notes page gets none, since without
  that line the card would pass the post off as the notes. The numbers count posts, not passages
  (1, 2, 3 in order of first mention, every passage of one post under one number, a run of
  citations showing each post once), and a citation has no native tooltip, which would double the
  card. A phone has no card, and there each number is a 44 px tap target (an invisible box around it, so the
  answer's lines don't move) that never reaches over another citation's number.
- **On the "Ask RAG Goobie" button** the card is the post about how RAG Goobie works, with the line "How RAG Goobie
  works", once that post is listed. Until then `previews.json` has no card for it, so nothing opens and nothing
  breaks. It opens on hover and on keyboard focus, closes when the pointer leaves, and never on touch.
- Not on phones or tablets, and not in print.

## How it works (for whoever changes it)

- `src/schemas/preview.ts`: the `preview` schema.
- `src/data/limits.js`: the numbers, in one place. Change one there and the schema, the checker
  and the media script move together.
- `scripts/check/assets.mjs`: every preview still and loop exists and is under its cap.
- `src/pages/ledger/previews.json.js`: builds `/ledger/previews.json` from listed posts only
  (`isListed`, so unlisted and draft posts never surface in a card), with reading time, and for a
  post without a preview, its opening lines. It prints which posts have no preview.
- The Worker reads `/ledger/previews.json` too, as its list of real posts (`worker/reads/serve.js`,
  and `worker/stats/index.js` when `/stats-pages.txt` is missing), so keep its shape
  (`{ "posts": { "<slug>": card } }`).
- `src/scripts/cards/` and `src/styles/cards.css`: the card. `data.js` fetches `previews.json` once
  (shared with search and Ask), `render.js` builds, fills and places the one card element, `hover.js`
  decides when it opens. It runs on `/ledger`, every post page, `/projects`, `/stats` and the
  homepage's overlay, and lives inside `#panel-screen` so it picks up the day/night palette.
- An element that isn't a link gets a card by naming its post in `data-card`: the "Ask RAG Goobie" button
  (`components/ledger/SearchBox.astro`) names `ABOUT_POST` from `src/data/ask.js`. `hover.js` reads the slug
  from the attribute, with no URL parsing and no "a post doesn't preview itself" check.
- A link can give its card one line of its own with `data-card-line` (`render.js` `line()`, the
  `.lp-line` rule): RAG Goobie's citations do, written by `src/scripts/search/ask-answer.js`, which also
  numbers them by post and gives each an `aria-label` ("Source 1: <post title>, <passage>"), and so does the Ask
  button ("How RAG Goobie works"). Every other card has no line, so it is unchanged. The line is on the link, not in `previews.json`, so it
  costs the card file nothing.
- `scripts/tools/preview-media.mjs`: makes the media. It needs ffmpeg on PATH. The build doesn't (it
  only checks the files that are committed).
