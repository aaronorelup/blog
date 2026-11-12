---
id: "AO-079"
title: "Everything my AI-built website runs on"
summary: "What's behind aaronorelup.com: the 3D tea house on the homepage, the AI search, the language model that runs in your browser and the $5 a month Cloudflare plan under it. Plus how much code Claude wrote."
date: 2026-11-10
topic: "site"
draft: false
preview:
  verdict: "$5 a month on Cloudflare"
  takeaway: "Claude Code on Opus 5.5 wrote nearly all of this site, about 45,000 lines of code. Cloudflare hosts it for $5 a month, and only the chatbot's answers come from an outside AI."
  points:
    - "The 3D tea house on the homepage is three.js, built from code alone. It has no 3D model files and no textures."
    - "The biggest piece of code is the /stats traffic page, about 14,000 lines. The tea house scene is about 1,200."
    - "696 commits (saved changes) in three months, 97% of them made with Claude. About 380 automatic tests check it."
  image: "/media/previews/what-my-website-runs-on.webp"
  alt: "The inside of the 3D tea house at night: a glowing paper lamp beside a low desk with a closed book"
---

I made this whole website with Claude Code, Anthropic's AI coding agent, running mostly on its
Opus 5.5 model, and I've never really looked at the code. So I had Claude go through all of it and tell me what's in there. **Cloudflare
hosts nearly all of it on its $5 a month plan**, from the pages to the database, the video and the
AI search. The code Claude wrote for the site is about 45,000 lines in 530 files, made in 696
commits (saved batches of changes) over three months.

- **The pages are plain files.** Astro, a free site builder, turns my posts into finished pages
  ahead of time, and Cloudflare just hands them out.
- **One small program does the rest.** A Cloudflare Worker is a program that runs on Cloudflare's
  servers, close to whoever asks. Mine streams the video from R2, Cloudflare's file storage, and
  runs the search, the read counter and the site's chatbot.
- **The 3D tea house on the homepage is made of code alone.** It's drawn with three.js, a free
  library for 3D in the browser.
- **The AI runs in three places.** Cloudflare's AI powers the search. DeepSeek, a cheap outside
  model, writes the chatbot's answers. One demo runs a small language model on your own computer.
- **The sliders, players and calculators in posts are home-made.** They're 23 small pieces of code
  written just for this site, with no big toolkit like React underneath.

## The tea house

<ao-slider aspect="16/9" labels="Night|Day">
<img src="/media/what-my-website-runs-on/tea-house-night.webp" alt="The desk stop in the 3D tea house at night: the paper lamp glows orange beside a low desk, with a dark sky through the window"><img src="/media/what-my-website-runs-on/tea-house-day.webp" alt="The same desk stop by day: cream paper walls, a pink book on the desk and blue sky with cherry trees through the window">
<figcaption><b>The same spot in the tea house, at night and by day</b><span class="ao-meta">Screenshots of the live homepage</span></figcaption>
</ao-slider>

[The homepage](/) is a 3D scene your graphics card draws with three.js. The scene is about 1,200
lines of code, and every wall, tree, lamp and petal is made of simple shapes in that code. There
are no 3D model files and no textures. The black cartoon outlines come from a slightly bigger
inside-out copy of each object, in dark ink.

Scrolling flies the camera to the next of six stops in and around the house. On a slow computer
the scene steps down to fewer petals, fewer lights and less sharpness, and if that's still too slow
it turns into a normal page. The day and night switch plays a short sunset.

## What Cloudflare does

Every piece of the site runs on one Cloudflare account, inside the $5 a month Workers plan plus a
few cents of storage.

| Cloudflare part | What it does here |
|---|---|
| Static assets | Serves every page and picture |
| Workers | One program for video, search, the chatbot and the read counter |
| R2 | File storage. 1,309 video and audio files, 1.8 GB, [streamed so you can skip ahead](/ledger/every-video-can-seek/) |
| D1 | A small database for read counts, search counts, saved answers and on/off switches |
| Workers AI and Vectorize | Turn posts and searches into "meaning fingerprints", so search finds what you mean |
| Turnstile | The invisible "are you a person" check before the chatbot |
| Rate limiting | Caps on how often one post, one question or one chat session can be hit |
| Cron triggers | Timed jobs every minute, like keeping the search index up to date |
| Web Analytics | Visitor counts with no cookies |
| Workers Builds | Builds the site whenever I push a change to GitHub. It's live within minutes |
| DNS and Registrar | The domain itself |

The $5 plan includes 10 million requests a month and, unlike the free plan, no daily database
cap. My command center, the private dashboard my agents post to,
[hit that cap in October](/ledger/d1-free-tier-cutoff/), and every database on the account stopped
until midnight. R2 storage is billed on its own. The site's 1.8 GB of video adds about 3 cents a
month.

My agents also file everything they generate into a second R2 storage space for me to review.
It's about 386,000 files and 325 GB, which adds about $4.70 a month. Unlike most cloud storage,
taking files back out of R2 is free.

Nothing in the site's code reads your IP address. The limits count per post, per question or per
chat session, never by your address.

## The AI parts

- **Search has two halves.** Pagefind, a small index in your browser, finds your exact words.
  Cloudflare's AI turns your search into a meaning fingerprint and finds the closest passages. The
  two lists get merged.
- **The chatbot answers only from my posts.** It's called RAG Goobie, after the trick of looking
  things up before answering. It reads all 73 posts before every answer, and DeepSeek writes a
  short reply that cites them. A question costs about a fifth of a cent, capped at $2 a day.
- **Listen reads a post aloud** and highlights each word, in your browser's own voice for now. A
  timed job on the Worker is built to have ElevenLabs, a voice company, record each post into R2.
  It's switched off and hasn't made a recording yet.
- **[Mini Loom](/labs/mini-loom/) runs a real language model on your computer.** It's the demo from
  [Claude's video lesson on how language models work](/ledger/loom-and-information-flow/), where you
  steer a story an AI is writing. If you ask, it downloads SmolLM2, a small open model, from
  Hugging Face (125 to 395 MB). Then it runs on your graphics card, or on your processor if it has
  to.
- **Voice-to-text runs on Cloudflare too.** My command center sends my voice notes to Cloudflare's
  copy of Whisper, OpenAI's speech model, for half a cent per ten minutes of audio.

## How big it is

<ao-treemap views="By part|By language" top="5" unit="lines">
<table><thead><tr><th>Part</th><th>JavaScript</th><th>CSS</th><th>Astro</th><th>JSON</th><th>TypeScript</th><th>SQL</th><th>Text</th><th>Other</th></tr></thead>
<tbody>
<tr><td>The /stats traffic page</td><td>12,346</td><td>1,852</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Pages, layouts and styles</td><td>3,009</td><td>2,392</td><td>3,403</td><td>340</td><td>165</td><td></td><td></td><td></td></tr>
<tr><td>Tests</td><td>5,911</td><td></td><td></td><td>2,162</td><td></td><td></td><td>137</td><td></td></tr>
<tr><td>Post components</td><td>4,122</td><td>2,400</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Build and check scripts</td><td>1,898</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Homepage and tea house</td><td>1,856</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>The Worker</td><td>1,743</td><td></td><td></td><td></td><td></td><td>20</td><td></td><td></td></tr>
<tr><td>The chatbot</td><td>1,614</td><td></td><td></td><td></td><td></td><td>1</td><td></td><td></td></tr>
<tr><td>Config files</td><td>39</td><td></td><td></td><td>46</td><td></td><td></td><td>4</td><td>11</td></tr>
</tbody></table>
<figcaption><b>The site's own code, 45,471 lines</b><span class="ao-meta">Counted with cloc, a line-counting tool, without blank lines, comments or posts</span></figcaption>
</ao-treemap>

- **About 45,000 lines of code in 530 files.** 72% is JavaScript, 15% CSS and 7% Astro.
  Without the tests, the way I [counted my other projects](/ledger/counting-the-code/), it's about
  37,000.
- **The biggest piece of code is the /stats traffic page**, about 14,000 lines. The 3D tea house
  scene is about 1,200.
- **About 380 automatic tests.** 256 of them click through the site in a real browser, on a
  desktop and on a phone.
- **696 commits in three months**, 97% of them made by Claude or with Claude as co-author. 639 of
  them name Opus 5.5 as the model. It was all on my flat-rate Claude Max plan, so I can't say what
  it would have cost per use.
- **73 published posts, about 144,000 words.**
- **About 2.6 million tokens of text** in the code, posts and hosted apps. A token is the chunk of
  text an AI reads, about three quarters of a word. That's the size of the site, not what Claude
  used to write it, estimated with OpenAI's free counter.

<details><summary>The apps the site hosts</summary>

The site also serves finished projects as plain files. Together they add about 64,000 lines of
code, and three quarters of that is the 20 apps from one test.

- [Storm Bell](/ledger/storm-bell-fighter/) is a fighting game made in Godot, a free game engine,
  and compiled to run in the browser. Its engine file was just over the biggest single file
  Cloudflare will serve. So it's zipped from 26 MB to 6.4 MB, and the page unzips it as it
  downloads.
- [Grind & Grimoire](/ledger/grind-and-grimoire/) is a 3D game on a newer version of three.js.
- [Clawd's growth montage](/ledger/clawd-growth-montage/) is a 30-second animation where every frame
  and every note of the music is code. The page draws and plays it live, and the same page made the
  video in its post.
- [The Sonnet vs Opus gauntlet](/ledger/sonnet-vs-opus-gauntlet/) keeps all 20 apps the two models
  built online, so you can try them side by side.
- [BLACKWATER](/ledger/blackwater-weekend/), my cave-diving game, runs on a second Worker at its own
  address.

</details>

*Claude Code read the site's code, my Cloudflare account and Cloudflare's docs for this post, and
measured every number in it.*
