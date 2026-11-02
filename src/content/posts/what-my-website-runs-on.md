---
id: "AO-076"
title: "What my website runs on: Cloudflare, Astro and Claude Code"
summary: "Everything behind aaronorelup.com: the 3D tea house, the AI search, the language model that runs in your browser and the $5 a month Cloudflare plan under it all. Plus how much code Claude wrote."
date: 2026-11-02
topic: "site"
draft: true
preview:
  verdict: "$5 a month on Cloudflare"
  takeaway: "Claude Code wrote this whole site, about 41,000 lines of code, and Cloudflare hosts all of it on its $5 a month plan."
  points:
    - "The 3D tea house on the homepage is three.js, built from code alone. It has no 3D model files and no textures."
    - "One demo downloads a small language model into your browser and runs it on your own graphics card."
    - "569 commits in 93 days, 97% of them made with Claude. Code, posts and apps come to about 2.4 million tokens."
  image: "/media/previews/what-my-website-runs-on.webp"
  alt: "The inside of the 3D tea house at night: a glowing paper lamp beside a low desk with a closed book"
---

I made this whole website with Claude Code, Anthropic's AI coding agent, and I've never really
looked at the code. So I had Claude go through all of it and tell me what's in there. **Cloudflare
hosts every part of it on its $5 a month plan**, from the pages to the database, the video, the
search and the AI. The code Claude wrote for the site is about 41,000 lines in 477 files, made in
569 commits over three months.

- **The pages are plain files.** Astro, a free site builder, turns my posts into finished pages when
  the site is built. Cloudflare hands them out, and no code runs for an ordinary page view.
- **One small program does the rest.** A Cloudflare Worker is a program that runs on Cloudflare's
  servers, close to whoever asks. Mine handles video, search, the read counter and Ask Goobie, the
  site's chatbot.
- **The 3D tea house is three.js**, a free library for 3D in the browser, built from code alone.
- **Some of the AI runs on Cloudflare and some on your computer.** Cloudflare's AI powers the
  search. One demo runs a small language model right in your browser.
- **There's no framework in your browser.** No React. The interactive parts of posts are 23 small
  home-made components.
- **Two outside services fill the gaps.** DeepSeek, a cheap AI model, writes Ask Goobie's answers.
  ElevenLabs, a voice company, is set up to record posts for the Listen button.

## The tea house

<ao-slider aspect="16/9" labels="Night|Day">
<img src="/media/what-my-website-runs-on/tea-house-night.webp" alt="The desk stop in the 3D tea house at night: the paper lamp glows orange beside a low desk, with a dark sky through the window"><img src="/media/what-my-website-runs-on/tea-house-day.webp" alt="The same desk stop by day: cream paper walls, a pink book on the desk and blue sky with cherry trees through the window">
<figcaption><b>The same spot in the tea house, at night and by day</b><span class="ao-meta">Screenshots of the live homepage</span></figcaption>
</ao-slider>

The homepage is a 3D scene your graphics card draws with three.js. It's about 1,500 lines of code,
and every wall, tree, lamp and petal is made of simple shapes in that code. The black cartoon
outlines are a trick. Each object gets a slightly bigger inside-out copy of itself in dark ink.

Scrolling flies the camera to the next of six stops in the house. On a slow computer the scene
drops the petals, then the lamp lights, then sharpness, and if that's still too slow it turns into
a normal page. The day and night switch plays a 2.6-second sunset.

## What Cloudflare does

| Cloudflare part | What it does here |
|---|---|
| Static assets | Serves every page and picture |
| Workers | One program, called `blog`, for video, search, Ask Goobie and the read counter |
| R2 | File storage. 1,309 video and audio files, 1.8 GB, [streamed so you can skip ahead](/ledger/every-video-can-seek/) |
| D1 | A small database for read counts, search counts, saved answers and on/off switches. 80 KB |
| Workers AI and Vectorize | Turn posts and searches into "meaning fingerprints", so search finds what you mean. 1,051 passages so far |
| Turnstile | The invisible "are you a person" check before Ask Goobie |
| Rate limiting | Caps on how often one post or one question can be hit |
| Cron triggers | Timed jobs every minute, like keeping the search index up to date |
| Web Analytics | Visitor counts with no cookies |
| Workers Builds | Builds the site whenever I push a change to GitHub. It's live within minutes |
| DNS and Registrar | The domain itself |

The Workers plan is $5 a month and includes 10 million requests a month. R2 storage is billed on
its own, but the site's 1.8 GB of video fits in R2's free 10 GB. The free Workers plan has a daily
database limit that [my command center hit in October](/ledger/d1-free-tier-cutoff/). The $5 plan
doesn't.

Nothing on the server reads your IP address. The limits count per post or per question, never per
person.

## The AI parts

- **Search has two halves.** Pagefind, a small index in your browser, finds your exact words.
  Cloudflare's bge-m3 model turns your search into a meaning fingerprint, and Vectorize finds the
  closest passages. The two lists get merged.
- **Ask Goobie** finds passages the same way, then DeepSeek writes a short answer that cites them.
  It's capped at 1,000 answers a day.
- **Listen reads a post aloud** and highlights each word. For now it uses your browser's own voice.
  The ElevenLabs recordings are built and waiting to be switched on.
- **Mini Loom runs a real language model on your computer.** It's the demo from
  [Claude's video lesson on how language models work](/ledger/loom-and-information-flow/), where you
  steer a story an AI is writing. If you ask, it downloads SmolLM2, a small open model of 125 to
  395 MB, and runs it on your graphics card through WebGPU, or on your processor if it has to.
- **The speech-to-text I liked isn't on this site.** It's in my command center, the private
  dashboard my agents post to, on the same Cloudflare account. It sends my voice notes to
  Cloudflare's copy of Whisper, OpenAI's speech model. Ten minutes of audio costs half a cent, and
  the free daily allowance covers about three and a half hours.

## How big it is

<ao-treemap views="By part|By language" top="5" unit="lines">
<table><thead><tr><th>Part</th><th>JavaScript</th><th>CSS</th><th>Astro</th><th>JSON</th><th>TypeScript</th><th>Python</th><th>SQL</th><th>Text</th></tr></thead>
<tbody>
<tr><td>The /stats traffic page</td><td>12,337</td><td>1,852</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Pages, layouts and styles</td><td>2,821</td><td>2,346</td><td>3,340</td><td>327</td><td>164</td><td></td><td></td><td></td></tr>
<tr><td>Post components</td><td>4,081</td><td>2,637</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Tests</td><td>4,424</td><td></td><td></td><td>296</td><td></td><td></td><td></td><td>137</td></tr>
<tr><td>Build and check scripts</td><td>1,838</td><td></td><td></td><td></td><td></td><td>96</td><td></td><td></td></tr>
<tr><td>The Worker</td><td>1,857</td><td></td><td></td><td></td><td></td><td></td><td>21</td><td></td></tr>
<tr><td>Homepage and tea house</td><td>1,856</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</tbody></table>
<figcaption><b>The site's own code, 40,430 lines</b><span class="ao-meta">Counted with cloc, without blank lines, comments, posts or config files</span></figcaption>
</ao-treemap>

- **About 41,000 lines of code in 477 files**, not counting blank lines or comments. 72% is
  JavaScript. I [counted my other projects](/ledger/counting-the-code/) the same way.
- **The biggest piece isn't the tea house.** It's the /stats traffic page, at about 14,000 lines.
- **314 automatic tests.** 231 of them click through the site in a real browser.
- **569 commits in 93 days**, 97% of them made by Claude or with Claude as co-author.
- **72 published posts, about 164,000 words.**
- **About 2.4 million tokens** for the code, posts and hosted apps together. A token is the chunk
  of text an AI reads, about three quarters of a word. It's an estimate from OpenAI's free counter,
  and Claude counts a little differently.

I can't tell you what this would have cost at API prices. It took dozens of sessions on my laptop
and in the cloud, all on my Claude Max plan, and nothing added them up.

<details><summary>The apps the site hosts</summary>

The site also serves finished projects as plain files. Together they add about 64,000 lines of
code, and three quarters of that is the 20 apps from one test.

- [Storm Bell](/ledger/storm-bell-fighter/) is a fighting game made in Godot, a free game engine,
  and compiled to run in the browser. Its engine file was just over the biggest single file
  Cloudflare will serve. So it's zipped from 26 MB to 6.4 MB, stored in pieces, and the page puts
  the pieces back together as they download.
- [Grind & Grimoire](/ledger/grind-and-grimoire/) is a 3D game on a newer version of three.js.
- [Clawd's growth montage](/ledger/clawd-growth-montage/) is a 30-second animation where every frame
  and every note of the music is code. There's no video file.
- [The Sonnet vs Opus gauntlet](/ledger/sonnet-vs-opus-gauntlet/) keeps all 20 apps the two models
  built online, so you can try them side by side.
- [BLACKWATER](/ledger/blackwater-weekend/), my cave-diving game, runs on a second Worker at its own
  address.

</details>

## The storage readers never see

My agents also file everything they generate, from renders to songs, into a second R2 bucket for
me to review. It holds about 384,000 files, 321 GB, which is about $4.70 a month at R2's standard
price. Taking files back out of R2 is free.

*Claude Code read the repo, my Cloudflare account and Cloudflare's docs for this post, and measured
every number in it.*
