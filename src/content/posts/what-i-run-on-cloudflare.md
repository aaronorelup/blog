---
id: "AO-080"
title: "What I run on Cloudflare for $5 a month, and what I'd add next"
summary: "Every Cloudflare product behind my website, my agents' dashboard and one game, how much of the $5 plan they really use, what it all costs, and 15 things I could add on the same plan."
date: 2026-11-10
topic: "site"
draft: true
preview:
  verdict: "I use about 1% of it"
  takeaway: "My site, my agents' dashboard and a game run on one Cloudflare account. In October they used about 1% of what the $5 a month plan includes."
  points:
    - "The bigger bill is storage. 325 GB of my agents' renders and songs in R2 adds about $4.70 a month."
    - "Voice questions, a newsletter signup and live visitors in the tea house would all fit on the same $5 plan."
    - "Card payments and the newsletter emails themselves would need Stripe and a mail service like Kit."
  image: "/media/previews/what-i-run-on-cloudflare.webp"
  alt: "The homepage of aaronorelup.com by day: a 3D tea house with cherry trees and a welcome card with Aaron's photo"
---

My website, the private dashboard my agents post to and one of my games all run on one Cloudflare
account. **I pay $5 a month for Cloudflare's Workers plan, and in October I used about 1% of what it
includes.** The bigger bill is storage for my agents' renders and songs, about $4.70 a month. Below
is every piece I run, and the list of things I could add without paying for a bigger plan.

- **Three Workers do the work.** A Worker is a small program that runs on Cloudflare's servers. One
  runs this site, one runs my command center (the private dashboard my agents post to), and one
  serves my game.
- **The $5 plan is barely touched.** In October my Workers handled about 66,000 requests out of the
  10 million the plan includes.
- **Storage is the real bill.** Cloudflare's file storage, R2, holds 1.8 GB for this site and
  325 GB for my agents' library.
- **Two things here are half-built.** The Listen button's recorded voice and the /stats traffic
  page each wait on a key I still have to make.
- **The list of what I could add is long**, and almost all of it fits on the same plan. Payments
  and newsletter emails are the exceptions.

## What runs where

![The homepage of aaronorelup.com by day: a 3D tea house with cherry trees, stepping stones and a welcome card with Aaron's photo](/media/what-i-run-on-cloudflare/homepage-day.webp)

| Worker | What it does | The Cloudflare parts it uses |
|---|---|---|
| This site | Pages, video, search, the chatbot, the read counter | Static files, R2, the D1 database, Workers AI, Vectorize, Turnstile, rate limits, timed jobs, Web Analytics, Workers Builds |
| My command center | My agents' tickets and notes, my voice notes, the media library | D1, KV, R2, Workers AI (Whisper), a timed job every 15 minutes |
| BLACKWATER | My [cave-diving game](/ledger/blackwater-weekend/) | Static files |

Cloudflare also runs the domain's DNS, its certificates and the domain itself, which I bought
through Cloudflare's registrar at cost. [Everything this site runs on](/ledger/what-my-website-runs-on/)
has the full stack, including the parts that aren't Cloudflare.

## How much of the $5 plan I use

<ao-bars unit="%" max="100">
<table><thead><tr><th>What the plan includes each month</th><th>Used in October</th></tr></thead>
<tbody>
<tr><td>Worker requests (10 million)</td><td>0.7</td></tr>
<tr><td>Database rows read (25 billion)</td><td>0.2</td></tr>
<tr><td>Database rows written (50 million)</td><td>1.3</td></tr>
</tbody></table>
<figcaption><b>Share of the $5 plan's monthly allowance used in October</b><span class="ao-meta">From Cloudflare's analytics, all three Workers together</span></figcaption>
</ao-bars>

- **About 66,000 Worker requests in October.** Page views don't count at all. Cloudflare serves
  plain pages for free, and the Worker only runs for video, search, the chatbot and my dashboard.
- **About 49 million database rows read.** That's 0.2% of the plan. The free plan stops at
  5 million a day, and [my command center hit that in October](/ledger/d1-free-tier-cutoff/).
- **About 2,000 Neurons of Workers AI in the first nine days of November.** Neurons are how
  Cloudflare counts AI work, and every account gets 10,000 a day free. Search used about 2% of that.

## What it costs

| Bill | A month |
|---|---|
| Workers Paid plan | $5.00 |
| R2 storage, 327 GB minus the free 10 GB, at $0.015 a GB | about $4.75 |
| DeepSeek for the chatbot, capped at $2 a day | close to $0 so far |
| The domain | at cost, once a year |

Almost all of the R2 bill is my agents' library: about 386,000 files of renders, songs, frames and
thumbnails. Taking files back out of R2 is free, which most cloud storage charges for.

## What's half-built

- **Listen's recorded voice.** The site reads posts aloud in your browser's own voice today. A timed
  job is built to record every post with ElevenLabs, a voice company, into R2. It needs its own
  ElevenLabs key first. The backlog is 73 posts, about 347,000 characters.
- **The /stats page.** It shows who visits the site, from Cloudflare's analytics, and it needs a
  fresh analytics key.

## What I could add next

Each of these fits the site's rules: nothing reads your IP address, every paid call has a daily cap
and an off switch, and nothing hidden ever shows up.

- **Voice questions for the chatbot.** Hold a button, ask out loud, and Cloudflare's copy of
  Whisper turns it into text. About 25 cents for 1,000 thirty-second questions. This one is being
  built now.
- **A Cloudflare voice for Listen.** Recording all 73 posts would cost about $5 with Deepgram's
  Aura-1 voice on Cloudflare, or about 8 cents with MeloTTS. I'd want to hear them next to ElevenLabs
  first.
- **An email newsletter.** A signup box with Cloudflare's "are you a person" check, the list in D1
  and the confirmation email through Cloudflare's Email Service. The issues themselves would go out
  through Kit or Amazon SES, about 20 cents a month for 500 readers and four issues.
- **Live visitors in the tea house.** A quiet "three others are having tea" and a floating lantern
  for each visitor, with Durable Objects, Cloudflare's small live rooms. $0 at my traffic.
- **A hello@aaronorelup.com address.** Cloudflare's Email Routing forwards it to my inbox for free.
- **A guestbook.** Notes wait for my OK, and an AI safety filter reads them first. About 10 cents per
  1,000 notes.
- **Any post as a PDF.** Cloudflare runs a real Chrome in its cloud. Printing all 73 posts once
  would take about 12 browser-minutes, and the plan includes 10 browser-hours a month.
- **Exact-phrase search** next to the meaning search, so model names and quotes always match.
  Free, inside the database I already have.
- **Counting what readers use**, like Listen plays and demo runs, with no IP addresses and no
  cookies. Free.
- **Machine translations** of posts, marked as machine-made. About 10 to 20 cents per language for
  the whole archive.
- **Smaller pictures on phones**, right-sized at build time. Free.
- **Header art** drawn at build time with the FLUX.2 image model, for me to pick from. About $1 to
  $2 for the whole archive.
- **Read-aloud on Workflows**, Cloudflare's step-by-step background jobs, so a changed post gets
  re-recorded faster. Free at this size.
- **Talking to the chatbot live**, a voice conversation that answers out loud. About 5 cents for a
  three-minute chat, so it would need a tight daily cap.
- **Cloudflare Stream for video.** Probably not. R2 already serves my video with no download fees.

A few things need more than Cloudflare. Taking card payments means Stripe, and logins for readers
would be code I write on the Worker, since Cloudflare has no ready-made sign-in for the public.

*Claude Code read my Cloudflare account and its analytics for this post, and measured every number
in it.*
