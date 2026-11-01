---
id: "AO-075"
title: "The hidden pages of my AI-made TV series"
summary: "My AI-made TV series hides pages on this site that only a few paused frames point to. Every one of them, what's on it, where its episode shows the address, and the seven Moon machine pages still waiting."
date: 2026-11-01
topic: "video"
project: ["evening-television"]
draft: true        # until Aaron says it's good, in his own words
preview:
  verdict: "3 canon, 7 waiting"
  takeaway: "Three hidden pages are canon, each shown for five frames at 29:47 of its episode. Seven more, one per Moon machine, are built and wait for an episode."
  points:
    - "They're in-world, with no header, no menu and no explanation. Nothing on them says how they were made."
    - "Each Moon machine page opens a 3D model of that machine you can take apart and break."
    - "The list fills itself in from one data file, and the build fails if a hidden page is missing from it."
  image: "/media/previews/the-hidden-pages-of-my-ai-made-tv-series.webp"
  alt: "A torn black card with white chalk handwriting: aaronorelup.com/ledger/ and under it earthlight/hideaway"
---

My TV series, [I Love My Evening Television](/courses/i-love-my-evening-television/), hides pages on this site. Near
the end of an episode, at 29:47, an address shows for five frames, too fast to read unless you pause, and nothing else
links to it. **Three of these pages are canon, one each for Episodes 2, 3 and 4. Seven more are built and waiting, one
for each machine on Earthlight's Moon base.** This post is the one place that lists them all, and it updates itself
when a new one is added.

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/the-hidden-pages-of-my-ai-made-tv-series/card-earthlight.webp" alt="A torn black card with white chalk handwriting: aaronorelup.com/ledger/ and under it earthlight/hideaway"><figcaption><b>Earthlight</b><span class="ao-meta">Episode 2 · a scrap of Noor's chalk wall</span></figcaption></figure>
<figure><img src="/media/the-hidden-pages-of-my-ai-made-tv-series/card-context-window.webp" alt="A dark frame of smashed watermelon under a red REQUEST CHANGES stamp, and in the bottom left a terminal card reading $ ls ~/private and, under it, the address of the folder's page on this site"><figcaption><b>Context Window</b><span class="ao-meta">Episode 3 · a torn terminal card</span></figcaption></figure>
<figure><img src="/media/the-hidden-pages-of-my-ai-made-tv-series/card-touch-move.webp" alt="The bottom of a yellowed chess score sheet: RESULT with 1-0 struck through and ½-½ written beside it, two signatures, and a printed footer with the address of the game's page on this site"><figcaption><b>Touch Move</b><span class="ao-meta">Episode 4 · the score sheet's footer</span></figcaption></figure>
</ao-compare>

*The three addresses as their episodes show them, each for five frames at 29:47.*

- **They're in-world.** No site header, no menu, no explanation. Each one is a thing from the story: a tunnel, a
  folder, a chess game, a robot's status screen. Search engines are told to skip them, and nothing else on the site
  links to them.
- **A page is canon once an episode points to it.** In the lore course, anything shown on screen or on an episode's
  hidden page counts as fact. The seven Moon machine pages don't count yet. They're a draft of the world until an
  episode shows their address.
- **The Moon machine pages lead to toys.** Each is the base's own status screen for that machine, and a button opens a
  3D model of it you can take apart, cut open and break. The models came out of my
  [teardown lab](/ledger/teardown-lab/).
- **The list keeps itself current.** Every hidden page carries a small marker in its code, and the entries below come
  from one data file. The build fails if a marked page is missing from the file, or the file names a page that isn't
  there.

## The three that are canon

<div data-hidden-pages="attached"></div>

## The Moon machines, not attached yet

All seven belong to [Earthlight](/ledger/earthlight/), Episode 2, set on Tranquility Homestead, the failed Moon base
where a ten-year-old named Noor is left alone with robots that don't work right. Their addresses follow the tunnel
page's: one word under `earthlight/`, the machine's own name, short enough to letter on a card for five frames. If a
future episode puts one on screen at 29:47, that page becomes canon.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/the-hidden-pages-of-my-ai-made-tv-series/mole-1-status.webp" alt="A dark blue status screen headed HOMESTEAD BASE_STATUS: MOLE-1, FLEET, DRUM DIGGER, with rows reading LATEST ISSUE SHEET 3 REV B, ORDER EXCEPT MOLE-1: EXTEND HAB 3 TUNNEL TO 3 M COVER in amber, DRUMS RUNNING, LIGHT OUT and TWIN MOLE-2 FROZEN, and a picture of the digger with an OPEN SERVICE MODEL button"><figcaption><b>MOLE-1's page</b><span class="ao-meta">the base's status screen</span></figcaption></figure>
<figure><img src="/media/the-hidden-pages-of-my-ai-made-tv-series/mole-1-model.webp" alt="A light grey console around a 3D orange drum digger with a hopper on top and a split drum at the front, parked on the edge of a cut in pale ground, with panels for Rev B, the job, a section through the drift to Noor's tunnel and buttons to take it apart"><figcaption><b>Its service model</b><span class="ao-meta">a take-apart 3D model, one click away</span></figcaption></figure>
</ao-compare>

<div data-hidden-pages="not yet attached"></div>

## How they were made

Claude agents made all ten. Each episode is mostly one long Claude Code session with a crew of agents, and the hidden
page is one of the last jobs. In Earthlight the agent writing the blog post built the tunnel page from the film's own
pictures. In Context Window the crew that planted the easter eggs wrote the folder's contents word for word, and the
blog crew built the page from that. In Touch Move a crew built Board 14 with a table of White's replies worked out by a
chess engine in advance, so the page plays real chess without running one.

The Moon machine pages came later. My teardown lab had Opus 5.5 build a take-apart model of each machine from its
concept sheet, and each model carried a small "not canon" line. For these pages Claude put a copy of each model behind
its machine's page with only that line taken off, and drew the status screens in the look of Noor's base app from the
film, using lines the lore already has: Rev B's orders, the decommission steps, the roster's words. What it made up is
small. It chose the screens' labels, like LATEST ISSUE and LAST STEP, and the addresses, and it gave the lander's page
one red light that blinks once, borrowed from the one red blink near the end of Earthlight.

<details><summary>How the list works</summary>

- Each hidden page has `<meta name="ao:hidden" content="lore">` in its code. Nothing on the page shows it.
- The list is `src/data/hidden-pages.json`: the address, a title, the episode, whether an episode shows it and where,
  what's on the page and how it ties into the story.
- `scripts/check/hidden.mjs` runs before every build. It fails if a marked page isn't in the list, if an entry has no
  page or its page has lost the marker or the line telling search engines to skip it, or if a model copy still says
  "not canon".
- This post doesn't name the pages itself. The two lists above are filled in from the data file when the site builds,
  so a new entry shows up here with no edit to the post.
- Only lore pages go in it, the ones an episode points to or will. Posts I just didn't want listed never do.
- When the lab fixes a model, `node scripts/tools/hidden-models.mjs` copies it behind its page again.

</details>

*Researched and built by Claude (Opus 5.5) from the series' lore and the episodes' notes.*
