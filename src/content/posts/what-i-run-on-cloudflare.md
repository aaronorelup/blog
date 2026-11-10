---
id: "AO-080"
title: "What I run on Cloudflare's $5 plan, and what I'd add next"
summary: "Every Cloudflare product behind my website, my agents' dashboard and one game, how much of the $5 plan they really use, what it all costs, and what I could add next on the same plan."
date: 2026-11-10
topic: "site"
draft: true
preview:
  verdict: "October: about 1% of it"
  takeaway: "In October my site, dashboard and game made about 66,000 Worker requests, under 1% of the 10 million Cloudflare's $5 plan includes."
  points:
    - "Storage adds almost as much again. 325 GB of my agents' renders and songs in R2 is about $4.75 a month."
    - "Voice questions for my chatbot, a newsletter signup and live visitors on my 3D homepage all fit on the same $5 plan."
    - "Card payments would need Stripe, and the newsletter issues would go out through a sender like Kit."
  image: "/media/previews/what-i-run-on-cloudflare.webp"
  alt: "The homepage of aaronorelup.com by day: a 3D tea house with cherry trees and a welcome card with Aaron's photo"
---

My website, the private dashboard my agents post to and one of my games all run on Cloudflare, the
company whose servers host and protect a big share of the web. **I pay $5 a month for its Workers
plan, and in October my Workers used about 1% of what it includes.** I pay it anyway because the
free plan's daily database cap [once shut my whole account off until midnight](/ledger/d1-free-tier-cutoff/).
Storage for my agents' renders and songs adds about $4.75, so the whole bill is about $10 a month.

- **Three Workers do the work.** A Worker is a small program that runs on Cloudflare's servers. One
  runs this site, one runs my command center, and one serves my game.
- **Page views are free.** Cloudflare hands out plain pages for nothing, so my Workers only ran
  about 66,000 times in October, out of the 10 million the plan includes.
- **Storage costs almost as much as the plan.** R2, Cloudflare's file storage, holds 1.8 GB for
  this site, inside the free 10 GB, and 325 GB for my agents' library.
- **Two things here are half-built.** The Listen button's recorded voice and the /stats traffic
  page are both built and wait on one last setup step.
- **Almost everything I'd add next fits on the same plan.** Voice questions for the chatbot went
  live while I wrote this, and a newsletter signup, live visitors on my 3D homepage and a guestbook
  could come next. Card payments and the newsletter emails themselves need another company.

## What runs where

Each of the three Workers uses a different mix of Cloudflare's parts.

![The homepage of aaronorelup.com by day: a 3D tea house with cherry trees, stepping stones and a welcome card with Aaron's photo](/media/what-i-run-on-cloudflare/homepage-day.webp)

| Worker | What it does | The Cloudflare parts it uses |
|---|---|---|
| This site | Pages, video, search, the chatbot, the read counter | Free page hosting, R2 file storage, a D1 database, Cloudflare's AI and Vectorize for search by meaning, Turnstile's invisible "are you a person" check, rate limits, timed jobs, cookie-free visitor counts, automatic builds from GitHub |
| My command center | My agents' tickets and notes, my voice notes, the media library | A D1 database, KV (a quick lookup table), R2, Whisper speech-to-text on Cloudflare's AI, a timed job every 15 minutes |
| BLACKWATER | My [cave-diving game](/ledger/blackwater-weekend/) | Free page hosting |

Cloudflare also runs the domain's DNS (the address book that points aaronorelup.com at its servers)
and its HTTPS certificates, and it sold me the domain at cost.
[Everything this site runs on](/ledger/what-my-website-runs-on/) has the full stack, including the
parts that aren't Cloudflare.

## How much of the $5 plan I use

October used about 1% of the plan. November started busier.

<ao-bars unit="%" max="100">
<table><thead><tr><th>What the plan includes each month</th><th>Used in October</th></tr></thead>
<tbody>
<tr><td>Worker requests (10 million)</td><td>0.7</td></tr>
<tr><td>Database rows read (25 billion)</td><td>0.2</td></tr>
<tr><td>Database rows written (50 million)</td><td>1.3</td></tr>
</tbody></table>
<figcaption><b>Share of the $5 plan's monthly allowance used in October</b><span class="ao-meta">From Cloudflare's analytics, all three Workers together</span></figcaption>
</ao-bars>

- **About 66,000 Worker requests in October.** Page views don't count. About a third of the
  requests were my Workers' own timed jobs (the site's runs every minute), and the rest were video,
  the read counter and my dashboard.
- **About 640,000 in the first ten days of November**, most of them on November 1 to 3. That's
  about 6% of the month's allowance, and I haven't looked into the jump yet.
- **About 49 million database rows read in October**, 0.2% of the plan's 25 billion. The free plan
  stops at 5 million a day.
- **AI used about 2% of the free allowance.** Cloudflare counts AI work in Neurons and gives every
  account 10,000 a day free. My Workers used about 2,000 in the first nine days of November, all of
  it for search.

## What it costs

Cloudflare costs me about $10 a month, half for the plan and half for storage.

| Bill | A month |
|---|---|
| Workers Paid plan | $5.00 |
| R2 storage, 327 GB minus the free 10 GB, at $0.015 a GB | about $4.75 |
| DeepSeek, the AI behind the chatbot, capped at $2 a day | close to $0 so far |
| The domain | at cost, once a year |
| **In all** | **about $9.75, plus the domain** |

Almost all of the R2 bill is my agents' library: about 386,000 files of renders, songs, frames and
thumbnails. Taking files back out of R2 is free, which most cloud storage charges for.

## What's half-built

- **Listen's recorded voice.** The site reads posts aloud in your browser's own voice today. A
  timed job is built to record every post with ElevenLabs, a voice company, into R2, and it's
  switched off until I finish setting it up.
- **The /stats page.** It counts visits to the site from Cloudflare's analytics, sorted into people
  and bots with no IP addresses, and it needs reconnecting to them.

## What I could add next

Each of these keeps to the rules I set for the site: nothing reads your IP address, every paid call
has a daily cap and an off switch, and no draft or unlisted post ever shows up anywhere.

- **Voice questions for the chatbot.** Hold a button, ask out loud, and Whisper, OpenAI's
  speech-to-text model, turns it into text on Cloudflare. About 25 cents for 1,000 thirty-second
  questions. This one is live now, on the microphone beside the Ask box on [the ledger](/ledger/).
- **A Cloudflare voice for Listen.** Recording every post would cost about $5 with Deepgram's Aura-1
  voice on Cloudflare, or about $10 with the newer Aura-2. I'd want to hear them next to ElevenLabs
  first.
- **An email newsletter.** A signup box with Cloudflare's "are you a person" check, the list in D1
  and the confirmation email through Cloudflare's Email Service. The issues themselves would go out
  through Kit, free up to 10,000 readers, or Amazon SES, about 20 cents a month for 500 readers and
  four issues.
- **Live visitors on my homepage.** My homepage is a 3D tea house. A quiet "three others are having
  tea" and a floating lantern for each visitor, with Durable Objects, Cloudflare's small live rooms.
  $0 at my traffic.
- **An email address at my own domain.** Cloudflare's Email Routing forwards it to my inbox for
  free.
- **A guestbook.** Notes wait for my OK, and an AI safety filter reads them first. About 10 cents
  per 1,000 notes.
- **Any post as a PDF.** Cloudflare runs a real Chrome in its cloud. Printing every post once would
  take about 12 browser-minutes, and the plan includes 10 browser-hours a month.

<details><summary>Seven smaller ideas, and one I'd skip</summary>

- **The chatbot's AI on Cloudflare.** DeepSeek V4.1 Flash, the model behind the chatbot, also runs
  on Cloudflare's own AI, so the chatbot could drop its one outside AI company. Each question reads
  about 280,000 tokens of posts, so I'd compare the prices first.
- **Counting what readers use**, like Listen plays and demo runs, with Cloudflare's Analytics
  Engine. No IP addresses and no cookies. Free.
- **Machine translations** of posts, marked as machine-made. About 5 to 15 cents per language for
  the whole archive.
- **Smaller pictures on phones.** Astro, the tool that builds my pages, can make right-sized copies
  of every picture as it builds. Free, and it doesn't even need Cloudflare.
- **Header art** drawn at build time with the FLUX.2 image model, for me to pick from. About $1 to
  $2 for the whole archive.
- **Read-aloud on Workflows**, Cloudflare's step-by-step background jobs, so a changed post gets
  re-recorded faster. Free at this size.
- **Talking to the chatbot live**, a voice conversation that answers out loud. About 5 cents for a
  three-minute chat, so it would need a tight daily cap.
- **Not Cloudflare Stream.** R2 already serves my video with no download fees.

</details>

<details><summary>More ideas, product by product</summary>

- **One cost dashboard and a spending cap** for the chatbot's DeepSeek calls and the ElevenLabs
  voice, with Cloudflare's AI Gateway, whose basic features are free.
- **Captions and transcripts** for every video and song post, from Whisper, so search can find what's
  said in them.
- **Alt text for every picture**, written by a vision model when the site builds.
- **Read-next picks by meaning**, from the same fingerprints search already makes.
- **A test copy of the site for every change**, with Cloudflare's Worker Previews, to see a change
  before it goes live.

</details>

## Free settings that take a minute

- **Four security settings.** Send every plain http visit to the secure https address, turn away
  the oldest encryption (TLS 1.0 and 1.1), tell browsers to only ever use https (HSTS), and sign
  the domain's address records so they can't be faked (DNSSEC). Free, one switch each.
- **See which AI bots read my posts**, and allow or block each one, with Cloudflare's AI Crawl
  Control. Free.
- **A budget alert at a number I pick.** Cloudflare already emails at $10 by default. It only warns,
  it never stops anything.
- **Leave Bot Fight Mode off.** It would challenge my own agents' checks from cloud machines.

Two things don't come ready-made. Card payments need Stripe, and reader logins would be code Claude
writes on my Worker, since Cloudflare has no sign-in for the public.

*Claude Code read my Cloudflare account and its analytics for this post, measured the usage and
priced each idea from Cloudflare's price lists.*
