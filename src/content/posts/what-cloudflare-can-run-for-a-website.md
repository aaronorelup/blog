---
id: "AO-081"
title: "What Cloudflare can run for a website, free or for $5 a month"
summary: "Claude checked every Cloudflare product against Cloudflare's own docs: what each one does, what's free, what the $5 plan adds, and whether logins, payments and newsletters can run there."
date: 2026-11-10
topic: "learning"
draft: true
preview:
  verdict: "Almost all of it, for $5"
  takeaway: "Cloudflare's $5 a month plan can run a whole website: pages, database, files, AI models and bot checks. It can't take card payments or send newsletters."
  points:
    - "There's no ready-made login for readers, but a passkey and email-link login runs fine on a Worker and its database."
    - "Its email service sends account mail only. A newsletter needs a sender like Kit or Amazon SES."
    - "The free plan covers a small site. $5 removes the daily database cutoff and adds email, queues and containers."
  image: "/media/previews/what-cloudflare-can-run-for-a-website.webp"
  alt: "A bar chart of AI job costs on Cloudflare: a picture for 1.5 cents, and 1,000 spoken words from 0.14 cents with MeloTTS to 18 cents with Deepgram Aura-2"
---

My whole site runs on Cloudflare ([everything it runs on](/ledger/what-my-website-runs-on/)), so
I had Claude check every Cloudflare product against Cloudflare's own docs, as of November 2026.
**The $5 a month Workers plan can run an entire website**: the pages, a database, file storage, AI
models, bot checks, timed jobs and account emails. It can't charge a card, it won't send a
newsletter, and it has no ready-made login for readers.

- **The free plan covers a small site.** Plain pages are free and unlimited. Workers, the small
  programs that run on Cloudflare's servers, get 100,000 requests a day. The D1 database gets
  5 million rows read a day, and R2 file storage 10 GB.
- **$5 a month mostly removes the ceilings.** 10 million Worker requests and 25 billion database
  rows read a month, no daily cutoff, and extras the free plan doesn't have, like email sending and
  containers.
- **AI is built in.** Cloudflare runs 73 models of its own on its graphics cards: chat and coding
  models, speech-to-text, voices, image generation and search. Every account gets a free daily
  allowance.
- **Logins are yours to build.** Cloudflare has no sign-in for the public, but one runs fine on a
  Worker and its database.
- **Payments go through Stripe.** Cloudflare doesn't process cards. Its own payment tools charge AI
  crawlers and bots, not people.
- **Newsletters are everything but the send.** Cloudflare's new email service sends account mail
  only, so the issues themselves need another sender.
- **Two limits to know.** There are no graphics cards for your own AI models, and nothing hard-caps
  your spending.

## What a site costs

<ao-calc>
<ul><li data-var="req" data-min="0" data-max="50" data-step="0.5" data-value="15" data-unit="million">Worker requests a month</li>
<li data-var="cpu" data-min="1" data-max="50" data-step="1" data-value="7" data-unit="ms">Computer time per request</li>
<li data-var="gb" data-min="0" data-max="500" data-step="5" data-value="10" data-unit="GB">Files stored in R2</li></ul>
<ol><li data-f="5 + max(0, req - 10) * 0.3 + max(0, req * cpu - 30) * 0.02" data-prefix="$" data-digits="2">Workers plan</li>
<li data-f="max(0, gb - 10) * 0.015" data-prefix="$" data-digits="2">R2 storage</li>
<li data-f="5 + max(0, req - 10) * 0.3 + max(0, req * cpu - 30) * 0.02 + max(0, gb - 10) * 0.015" data-prefix="$" data-digits="2">A month in all</li></ol>
<figcaption><b>A month on the $5 plan</b> Cloudflare's own example: 15 million requests at 7 ms of computer time each is $8.00. Plain pages are free and don't count.</figcaption>
</ao-calc>

The plan includes 10 million requests and 30 million milliseconds of computer time a month. Past
that it's 30 cents per million requests and 2 cents per million milliseconds. There are no fees
for bandwidth. R2 storage is billed on its own, at 1.5 cents a GB a month after the free 10 GB, and
taking files back out is free.

## What AI jobs cost

<ao-bars unit="cents">
<table><thead><tr><th>One job</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>A chat answer, gpt-oss-120b</td><td>0.1</td></tr>
<tr><td>A chat answer, Kimi K2.6</td><td>0.35</td></tr>
<tr><td>Transcribe 10 minutes of audio, Whisper</td><td>0.5</td></tr>
<tr><td>A 1024×1024 picture, FLUX.2 klein 9B</td><td>1.5</td></tr>
<tr><td>Speak 1,000 words, MeloTTS</td><td>0.14</td></tr>
<tr><td>Speak 1,000 words, Deepgram Aura-1</td><td>9</td></tr>
<tr><td>Speak 1,000 words, Deepgram Aura-2</td><td>18</td></tr>
</tbody></table>
<figcaption><b>What one AI job costs on Cloudflare's Workers AI</b><span class="ao-meta">US cents at list price, past the free daily allowance. A chat answer is 2,000 tokens in and 400 out, and a token is about three quarters of a word</span></figcaption>
</ao-bars>

Cloudflare counts AI work in Neurons, and every account gets 10,000 a day free. That's about 214
minutes of Whisper, about 110 chat answers from gpt-oss-120b or about 7 pictures from FLUX.2 klein
9B a day. Past it, the $5 plan pays $0.011 per 1,000 Neurons. On the free plan the AI just stops
for the day.

## Logins, payments and newsletters

**Logins.** Cloudflare's Access sign-in is meant for up to 50 named people, free, like a team or a
group of beta testers. For readers you build your own on a Worker: an emailed sign-in link plus
passkeys (Face ID or a fingerprint instead of a password), with the accounts in D1. Cloudflare's
email service can send the sign-in emails. Hosted services like Clerk, free up to 50,000 monthly
users, are faster to add, but they put another company's script on your page.

**Payments.** Cloudflare doesn't process card payments. Stripe does, at 2.9% plus 30 cents a sale,
and a Worker records who bought what. To sell downloads worldwide, a merchant of record (a company
that becomes the legal seller and handles sales tax and VAT) like Paddle, Polar or Stripe's Managed
Payments costs about 5 to 6.4% plus 30 to 50 cents a sale. Cloudflare's own payment tools, Pay per
crawl and Monetization Gateway, charge AI crawlers and bots, not people, and both are closed betas.

**Newsletters.** Cloudflare's Email Service went into beta in April 2026. The $5 plan includes
3,000 emails a month, then 35 cents per 1,000. Its FAQ says plainly that it sends transactional
mail only, meaning sign-in links, confirmations and receipts, not marketing. So Cloudflare can hold
the signup form, the list, the confirmation email and the one-click unsubscribe, and something like
Kit (free up to 10,000 subscribers) or Amazon SES (about 10 cents per 1,000 emails) sends the
issues. Email Routing, which is free, receives mail at your own domain.

**The two limits.** Cloudflare's containers top out at 4 CPUs and 12 GB of memory and have no
graphics card, so your own AI models need to run somewhere else. And nothing hard-caps your
spending. Budget alerts email you after the fact.

## What the $5 plan adds

| | Free plan | $5 plan, each month |
|---|---|---|
| Worker requests | 100,000 a day | 10 million, then $0.30 per million |
| Computer time per request | 10 ms | up to 5 minutes (30 seconds by default) |
| D1 database | 5 million rows read and 100,000 written a day | 25 billion read and 50 million written |
| KV (quick key-value storage) | 100,000 reads and 1,000 writes a day | 10 million reads and 1 million writes |
| Durable Objects (small live rooms) | 100,000 requests a day | 1 million requests |
| Queues | 10,000 operations a day | 1 million operations |
| Workflows (step-by-step jobs) | 3,000 steps a day | 500,000 steps |
| Workers AI | 10,000 Neurons a day | the same, then $0.011 per 1,000 |
| Browser Run (a real Chrome in the cloud) | 10 minutes a day | 10 hours |
| Email sending | not included | 3,000 emails, then $0.35 per 1,000 |
| Containers | not included | 25 GiB-hours of memory, 375 CPU-minutes |
| Plain pages | free, unlimited | free, unlimited |

## Every Cloudflare product

Every product Cloudflare offers a site like this, by area, with what the free plan gives and what the $5 plan adds. Prices are list prices as of 2 November 2026.

<details><summary>AI models and tools: 18</summary>

- **Workers AI**. Cloudflare's own AI models on its GPUs, called from code with one line and paid per use, not per hour. Free plan: 10,000 Neurons (Cloudflare's usage unit) a day, worth about $0.11. On Workers Free, requests past that fail. $5 plan: The same 10,000 free Neurons a day, then $0.011 per 1,000 Neurons. Adds paid-only models like Kimi K2.6, GLM-5.3 and DeepSeek V4. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- **Workers AI speech-to-text**. Turns recorded or live speech into text, with Whisper and Deepgram models. Free plan: Covered by the 10,000 free Neurons a day, about 214 minutes of Whisper large-v3-turbo a day. $5 plan: Same free Neurons, then Whisper is $0.0005 per audio minute, Deepgram Nova-3 $0.0052, and live Deepgram Flux $0.0077. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- **Workers AI text-to-speech**. Turns written text into a spoken voice, with models like MeloTTS and Deepgram Aura. Free plan: Covered by the daily free Neurons, about 1,200 words a day of Aura-1 or 537 audio minutes of MeloTTS. $5 plan: Same free Neurons, then MeloTTS is $0.0002 per audio minute, Aura-1 $0.015 and Aura-2 $0.030 per 1,000 characters. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- **Workers AI chat models**. Large open-weight models (ones anyone can download) hosted by Cloudflare that chat, write, use tools and return structured data. Free plan: Covered by the daily free Neurons, about 110 gpt-oss-120b answers a day (2,000 tokens, or word pieces, in and 400 out). $5 plan: Adds paid-only models like Kimi K2.6 and DeepSeek V4, at 20 requests a minute each. Kimi K2.6 costs $0.95 in, $4.00 out per million tokens. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- **Workers AI image generation**. Makes pictures from a text prompt, and edits pictures, with models like FLUX.2 and Leonardo. Free plan: Covered by the daily free Neurons, about 7 FLUX.2 klein 9B images or roughly 170 FLUX.1 schnell images (1024x1024, 4 steps) a day. $5 plan: Same free Neurons, then FLUX.2 klein 9B costs $0.015 for the first megapixel (a million pixels). A 1024x1024 FLUX.1 schnell image at 4 steps is about $0.0006. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- **Workers AI image understanding**. Models that look at a picture and describe it, read the text in it, or find objects in it. Free plan: Covered by the 10,000 free Neurons a day. $5 plan: Same free Neurons, then Moondream 3.1 is $0.30 in and $1.00 out per million tokens (small chunks of text or image). [Source](https://developers.cloudflare.com/workers-ai/models/moondream3.1-9B-A2B/)
- **Workers AI embeddings and reranking**. Turns text into number lists that capture meaning, so search finds things by meaning, then reorders hits so the best comes first. Free plan: Covered by the 10,000 free Neurons a day. The bge-m3 model uses 1,075 Neurons per million tokens. $5 plan: Same free Neurons, then bge-m3 costs $0.012 per million tokens and the bge-reranker-base reranker $0.003 per million. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- **Workers AI translation**. Machine translation between languages, with m2m100 covering about 100 languages and IndicTrans2 covering English to 22 languages of India. Free plan: Covered by the 10,000 free Neurons a day. $5 plan: Same free Neurons, then m2m100 costs $0.342 per million tokens in and out, about $0.0014 for a 1,500-word article. [Source](https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/)
- **Workers AI classification and extraction models**. Small models that give set answers instead of prose, like picking an option, flagging unsafe text or pulling out a total. Free plan: Covered by the 10,000 free Neurons a day. $5 plan: Same free Neurons, then Clef-flash costs $0.038 and Clef $0.24 per million input tokens, with no charge for output. Clairic (preview) is $0.10 per million input tokens, also with no output charge. [Source](https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/)
- **Workers AI Markdown conversion**. Turns PDFs, web pages, office files and images into clean text an AI can read, and writes a description for each image. Free plan: Free for most formats, including PDF and HTML. Image descriptions use AI models and count against the 10,000 free Neurons a day. $5 plan: Same as free. Image descriptions past the free Neurons are billed at the model's normal rate. [Source](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/)
- **Third-party AI models**. The same code that calls Cloudflare's models also reaches outside ones like Veo, Kling, Claude, GPT and Gemini, on one Cloudflare bill. Free plan: Nothing included. You pay with prepaid AI Gateway credits or your own provider key. $5 plan: Not included. Provider list price with no markup, plus a 5% fee on credits. Veo 3.1 Fast is $0.08 to $0.30 per second of video. [Source](https://developers.cloudflare.com/ai/models/)
- **AI Gateway**. A switchboard for AI calls that tracks cost, caches repeat answers, caps spending and switches to a backup model when one fails. Free plan: Core features are free, including analytics, caching and rate limiting. Up to 10 gateways. $5 plan: 20 gateways. Accounts whose first gateway was made on or after Sep 24, 2026 get 20 million log events a month, then $0.60 per million (moving to Cloudflare Observability pricing on Dec 1, 2026). Older accounts keep 10 million per gateway. [Source](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- **Web Search API** (beta). Lets an AI search the live web from code running on Cloudflare, so its answers aren't stuck at its training date. Free plan: No free amount stated. $5 plan: Not included. You pay the search provider's list price with no markup, from $0.25 per 1,000 searches on Ceramic up to $7 on Exa. [Source](https://developers.cloudflare.com/changelog/post/2026-10-02-introducing-web-search-api/)
- **Vectorize**. A vector database (number lists that capture meaning) that finds the entries closest in meaning to a question. Free plan: 30 million queried and 5 million stored dimensions (the numbers in each list) a month, and 100 indexes. $5 plan: 50 million queried and 10 million stored dimensions a month, then $0.01 per million queried and $0.05 per 100 million stored. [Source](https://developers.cloudflare.com/vectorize/platform/pricing/)
- **AI Search**. Point it at a website, a storage bucket or uploaded files, and it builds a managed search engine you can chat with. Free plan: Each month, 1,000 meaning-based and 1,000 keyword searches and 5 million tokens of content read in. Crawls 500 pages a day. $5 plan: Same monthly allowance, unlimited crawl pages, then $0.75 per 1,000 meaning-based searches and $0.75 per million tokens read in. Billing started Nov 1, 2026. [Source](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- **Agents SDK and remote MCP servers** (beta). Hosts AI agents that remember and schedule work, and MCP servers that let AIs like Claude use a service as a tool. Free plan: Runs on Durable Objects (small programs that keep their own data), with 100,000 requests a day and 5 GB of storage total. $5 plan: 1 million requests and 5 GB of storage a month, then $0.15 per million requests. The AI models it calls bill separately. [Source](https://developers.cloudflare.com/agents/)
- **Realtime voice agents** (beta). A talk-to-it AI in the browser that listens, thinks and talks back, and stops talking when interrupted. Free plan: Model use comes out of the 10,000 free Neurons a day, plus the free Durable Objects allowance. $5 plan: The paid Durable Objects allowance, plus pay-per-use models like Flux speech-to-text at $0.0077 a minute. A 5-minute chat is about $0.07 (estimate). [Source](https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/)
- **Browser Run**. A Chrome browser in Cloudflare's cloud that code or an AI drives to take screenshots, make PDFs, read pages or crawl sites. Free plan: 10 browser-minutes a day, with 3 browsers running at once. $5 plan: 10 browser-hours a month and 10 browsers at once (a monthly average of daily peaks) included, then $0.09 per extra browser-hour and $2.00 for each extra browser at once. [Source](https://developers.cloudflare.com/browser-run/pricing/)

</details>

<details><summary>Running code: 15</summary>

- **Workers**. Small programs that run on Cloudflare's servers worldwide the moment someone loads a page, with no server of your own to manage. Free plan: 100,000 requests a day, with up to 10 milliseconds of processing time per request. $5 plan: 10 million requests and 30 million milliseconds of processing time a month. Then $0.30 per million requests and $0.02 per million milliseconds. No bandwidth charge. [Source](https://developers.cloudflare.com/workers/platform/pricing/)
- **Workers Static Assets**. Hosting for a website's built files, like pages, images and scripts, served from the same Worker out of Cloudflare's cache. Free plan: Requests for these files are free and unlimited. Up to 20,000 files per version, 25 MiB each. $5 plan: Same as free, but up to 100,000 files per version. If Workers Caching is on, every request is billed at the normal rate. [Source](https://developers.cloudflare.com/workers/platform/limits/)
- **Workers Builds**. Cloudflare's own build service that turns your code into a finished site and publishes it every time you push to GitHub. Free plan: 3,000 build minutes a month, one build at a time, 20 minutes max per build. $5 plan: 6,000 build minutes a month, six builds at once and 4 virtual processors instead of 2. Then $0.005 per extra build minute. [Source](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
- **Queues**. A to-do line between programs, where one part drops a job in and another picks it up later, retrying until it's done. Free plan: 10,000 operations a day, about 3 per delivered message. Messages are kept for 24 hours. $5 plan: 1 million operations a month, messages kept 4 days by default and up to 14. Then $0.40 per extra million operations. [Source](https://developers.cloudflare.com/queues/platform/pricing/)
- **Workflows**. Long jobs split into saved steps that retry on failure and can pause for minutes, days or until someone approves. Free plan: 3,000 steps a day and 100 jobs running at once, sharing the Workers limit of 100,000 requests a day. $5 plan: 500,000 steps a month and 50,000 jobs running at once. Then $0.80 per extra 100,000 steps, plus requests and processing time at Workers rates. [Source](https://developers.cloudflare.com/workflows/reference/pricing/)
- **Cron Triggers**. Runs a Worker on a timer, like every minute or every day at 3 am. Free plan: 5 timers per account, with 10 milliseconds of processing time per run. $5 plan: 250 timers per account, with up to 30 seconds of processing per run, or 15 minutes for timers an hour or more apart. Billed as normal Worker use. [Source](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- **Containers**. Runs any program, like Python or the ffmpeg video tool, in a Linux box that starts when needed and sleeps when idle. Free plan: Not on the free plan. $5 plan: 375 processor-minutes, 25 GiB-hours of memory and 1 TB of traffic out in North America and Europe a month. Then billed by the second. No GPU (unconfirmed). [Source](https://developers.cloudflare.com/containers/platform/pricing/)
- **Sandboxes and Dynamic Workers**. Safe boxes for running untrusted or AI-written code, either a Linux container or a throwaway Worker made on the fly. Free plan: Not on the free plan. $5 plan: Sandboxes use Containers allowances and rates. Dynamic Workers include 1,000 unique ones a month, then $0.002 each per day, with requests counted as Workers usage. [Source](https://developers.cloudflare.com/sandbox/)
- **Workers VPC** (beta). Lets a Worker privately reach machines that aren't on the public internet, like a laptop, through Cloudflare Tunnel or Cloudflare Mesh. Free plan: Free on all plans while in beta. $5 plan: Free while in beta. Pricing after beta is unconfirmed. [Source](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/)
- **Workers for Platforms**. Lets you run a platform where customers upload their own Workers, each walled off from the others. Free plan: Not on the free plan. $5 plan: Not included. It's a separate $25 a month plan with 20 million requests and 1,000 scripts, then $0.30 per million requests and $0.02 per script. [Source](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
- **Service bindings**. Lets one Worker call another directly and privately, without going over the public internet. Free plan: Included. $5 plan: Included. The whole call is billed as one request plus both Workers' processing time. With Workers Caching on, each call between Workers is also billed as a request. [Source](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- **Smart Placement and placement hints** (beta). Runs a Worker near the database or API it talks to most, instead of near the visitor, to cut back-and-forth delays. Free plan: Available, with no separate price listed. $5 plan: Same as free. [Source](https://developers.cloudflare.com/workers/configuration/placement/)
- **Framework support on Workers**. Ready-made adapters so sites built with common frameworks like Astro, Nuxt or SvelteKit go straight onto Workers, with Next.js in beta. Free plan: Included. $5 plan: Included. [Source](https://developers.cloudflare.com/workers/static-assets/routing/full-stack-application/)
- **Pages vs Workers**. Cloudflare's two ways to host a site, and Cloudflare now says to start new projects on Workers instead of Pages. Free plan: Pages gives 500 builds a month. Workers serves site files free with no limit, plus 3,000 build minutes a month. $5 plan: 10 million requests a month and 6,000 build minutes, then $0.30 per million requests. Pages Functions, the server code in Pages, are billed like Workers. [Source](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- **Custom domains and routes**. Points a whole domain or subdomain at a Worker, and Cloudflare creates the DNS record and HTTPS certificate itself. Free plan: Free, with the certificate made automatically. No wildcard entries that cover every subdomain at once, and www needs its own entry. $5 plan: Same as free. Requests count toward the 10 million included, and site files stay free. [Source](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)

</details>

<details><summary>Storing data: 9</summary>

- **Durable Objects**. A tiny "room" with its own SQLite database that every visitor sees the same way, for live counters, chats and multiplayer. Free plan: 100,000 requests a day and 5 GB of storage in total. Only the SQLite-backed kind. $5 plan: 1 million requests and 5 GB of storage a month. Then $0.15 per million requests, $0.20 per GB a month, plus fees for running time and database rows. [Source](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- **D1**. A SQLite database, tables of rows a Worker can read and write, with no database server for you to run. Free plan: 5 million rows read and 100,000 rows written a day, 5 GB in total, 500 MB per database. $5 plan: 25 billion rows read and 50 million written a month, restore to any minute of the last 30 days. Then $0.001 per million rows read and $1 per million rows written. [Source](https://developers.cloudflare.com/d1/platform/pricing/)
- **Workers KV**. A global lookup table that reads small values fast anywhere, though a change can take up to about 60 seconds to spread. Free plan: 100,000 reads and 1,000 writes a day, 1 GB of storage. $5 plan: 10 million reads and 1 million writes a month, 1 GB of storage. Then $0.50 per million reads, $5 per million writes and $0.50 per GB a month. [Source](https://developers.cloudflare.com/kv/platform/pricing/)
- **R2**. Cheap cloud file storage that works like Amazon S3, with no fees when people download the files. Free plan: 10 GB of storage, 1 million writes and 10 million reads a month. No bandwidth fees. $5 plan: Not part of the $5 plan. R2 is its own pay-as-you-go bill, at $0.015 per GB a month, $4.50 per million writes and $0.36 per million reads. [Source](https://developers.cloudflare.com/r2/pricing/)
- **Basin Catalog and Basin SQL (formerly R2 Data Catalog and R2 SQL)**. Turns files in R2 into database tables and lets you query huge piles of logged data with SQL, the standard database language. Free plan: 1 million catalog operations and 10 GB of SQL scanning a month. SQL needs an R2 subscription and a card on file. $5 plan: Same as free. Then $9 per million catalog operations and $2.50 per TB scanned by SQL, plus R2 storage. [Source](https://developers.cloudflare.com/basin/platform/pricing/)
- **Basin Pipelines (formerly Cloudflare Pipelines)**. A firehose for events that cleans incoming data with SQL and writes it to R2 as tables or files. Free plan: 1 GB a month each of processing and delivery, from a May 2026 post. Today's pricing page lists only the paid plan. $5 plan: 50 GB of processing and 50 GB of delivery a month. Sending data in is free. Then $0.04 per GB processed and $0.03 to $0.06 per GB delivered. [Source](https://developers.cloudflare.com/basin-pipelines/platform/pricing/)
- **Hyperdrive**. Makes an outside Postgres or MySQL database fast to use from Workers by keeping connections open and caching queries. Free plan: 100,000 queries a day and 10 configurations. $5 plan: Unlimited queries and 25 configurations, with no Hyperdrive fee. The outside database is billed by its own provider. [Source](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- **Workers Analytics Engine**. A cheap counter store that records huge numbers of small events and lets you query them with SQL. Free plan: 100,000 data points written and 10,000 queries a day. $5 plan: 10 million data points and 1 million queries a month. Then $0.25 per extra million data points and $1 per extra million queries, but billing isn't switched on yet. [Source](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- **Workers Logs, Tail Workers and Logpush**. Logs of what a Worker did, plus Tail Workers that react to every run and Logpush, which ships logs to storage. Free plan: 200,000 log events a day, kept 3 days. From December 1, 2026, 0.5 GB a day, kept 7 days. No Tail Workers. $5 plan: 20 million log events a month kept 7 days, then $0.60 per extra million. From December 1, 2026, 50 GB a month included, then $0.25 per GB. [Source](https://developers.cloudflare.com/observability/pricing/)

</details>

<details><summary>Video, images and calls: 5</summary>

- **Cloudflare Images**. Resizes, crops and converts images to lighter web formats on the fly, adds watermarks and text, and can AI-upscale them. It can also store images. Free plan: 5,000 unique transformations a month (one image in one size counts as one). Past that, new ones fail instead of billing, and ones already made keep loading. $5 plan: Not included, billed separately. $0.50 per 1,000 unique transformations past 5,000, $5 per 100,000 stored images a month, $1 per 100,000 delivered. [Source](https://developers.cloudflare.com/images/pricing/)
- **Cloudflare Stream**. Video hosting that converts uploads, plays them at the right quality per device, adds AI captions and runs live streams. Free plan: Not on the free plan. $5 plan: Not included. Storage is $5 per 1,000 minutes a month, prepaid, and viewing is $1 per 1,000 minutes watched. Converting and uploading are free. [Source](https://developers.cloudflare.com/stream/pricing/)
- **Media Transformations** (beta). Shrinks or crops videos, cuts short clips, grabs still frames and extracts audio, even from videos in R2, Cloudflare's file storage. Free plan: Shares Images' 5,000 free unique transformations a month. A still frame counts as one, a 5-second clip as five. $5 plan: Not included. $0.50 per 1,000 unique transformations. Using it by URL is fully released. Calling it from Worker code is in beta and free for now, and after beta every call is billed, even repeats. [Source](https://developers.cloudflare.com/stream/pricing/)
- **Realtime SFU and TURN**. The plumbing for live audio, video and data between browsers, for things like video calls, multiplayer and watch parties. The SFU passes each person's stream on to the others, and TURN relays connections that can't link up directly. Free plan: The first 1,000 GB of outgoing data a month is free, shared by both. TURN is free when used with the SFU. $5 plan: Same as free. Past 1,000 GB it's $0.05 per GB. [Source](https://developers.cloudflare.com/realtime/sfu/platform/pricing/)
- **RealtimeKit**. Ready-made video and audio meeting rooms, with drop-in interface kits, recording and transcripts. Free plan: No free allowance listed. $5 plan: Not included. $0.002 per participant-minute (one person for one minute) for video, $0.0005 audio-only, recording $0.010 a minute. A one-hour video call with four people is 240 participant-minutes, or $0.48. [Source](https://developers.cloudflare.com/realtime/realtimekit/platform/pricing/)

</details>

<details><summary>Email: 3</summary>

- **Email Routing**. Receives mail at your own domain and forwards it to an inbox like Gmail, or to your code on Cloudflare. Free plan: Free and unlimited for incoming mail. Up to 200 routing rules per domain and 25 MiB per message. $5 plan: Same as free. Code that reads mail counts toward the normal Workers CPU limits. [Source](https://developers.cloudflare.com/email-service/platform/limits/)
- **Email Workers sending to verified addresses**. Lets your code on Cloudflare email addresses you've verified, which is handy for alerts to yourself. Free plan: Free on every plan, even with only Email Routing set up. Up to 50 recipients and 25 MiB per message. $5 plan: Still free, and it doesn't use up the 3,000 included sends or the daily limits of Email Service. [Source](https://developers.cloudflare.com/email-service/configuration/send-bindings/)
- **Cloudflare Email Service** (beta). Sends email from code on Cloudflare to any address, for things like confirmations, login links and receipts. Free plan: Not on the free plan. $5 plan: 3,000 emails a month included per account, then $0.35 per 1,000. New accounts start with a cautious daily cap that grows with a good sending record, and the exact number is unconfirmed. The domain must use Cloudflare DNS, meaning Cloudflare runs its address records. [Source](https://developers.cloudflare.com/email-service/platform/pricing/)

</details>

<details><summary>Security: 12</summary>

- **SSL/TLS**. The padlock in the browser. It encrypts every visit to a site and can force the secure https version. Free plan: Free certificate for the main domain and one level of subdomains, like blog.example.com. Forcing https is free too. $5 plan: Sites on Workers custom domains get their own certificate automatically, deeper subdomains included. Advanced Certificate Manager is $10 a month. [Source](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- **WAF managed rules**. A web firewall (WAF) with Cloudflare's ready-made rules that block well-known attacks on websites. Free plan: The Free Managed Ruleset is on by default. Leaked-password detection is on too. $5 plan: Not a Workers product. The full Cloudflare Managed Ruleset and the OWASP rules (a widely used open set of attack checks) need the Pro plan or higher. [Source](https://developers.cloudflare.com/waf/managed-rules/)
- **WAF custom rules**. Your own rules to block visitors or make them prove they're human, like blocking every request to /wp-admin, the WordPress admin page that bots often probe. Free plan: 5 rules, with every action except Log and no regex (advanced text patterns). $5 plan: Not a Workers product. Pro gets 20 rules, Business 100. [Source](https://developers.cloudflare.com/waf/custom-rules/)
- **Rate limiting rules**. Slows down anyone who hits a page too often, set as a site-wide firewall rule. Free plan: 1 rule, counted by IP address only, with a 10-second window and a 10-second block. It can only match on the page path or on whether a visitor is a verified bot. $5 plan: Not a Workers product. Pro gets 2 rules, Business 5. Separate from the rate limiter you can build inside a Worker. [Source](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- **DDoS protection**. Automatically soaks up floods of fake traffic meant to knock a site offline. Free plan: Unmetered on the free plan, meaning it isn't capped or billed by attack size, with alerts and one override of the managed rules. $5 plan: Same as free. [Source](https://developers.cloudflare.com/ddos-protection/)
- **Bot Fight Mode**. Challenges simple bots and headless browsers, meaning automated browsers with no screen, across a whole site. Free plan: Bot Fight Mode is free, along with Block AI bots, AI Labyrinth (decoy pages that waste the time of bots ignoring no-crawl rules) and a managed robots.txt, the file that tells crawlers what they may read. $5 plan: Not a Workers product. Super Bot Fight Mode needs Pro or higher, and full Bot Management is Enterprise only. [Source](https://developers.cloudflare.com/bots/plans/free/)
- **Turnstile**. A privacy-friendly 'are you human?' check, usually invisible, with no picture puzzles. Free plan: Unlimited challenges, up to 20 widgets, each on up to 10 hostnames like www.example.com, and 7 days of analytics. $5 plan: Same as free. More needs Enterprise. [Source](https://developers.cloudflare.com/turnstile/plans/)
- **Client-side security**. Lists every script a site's pages load and warns when a bad one sneaks in. Formerly called Page Shield. Free plan: Script monitoring is free. Connection and cookie monitoring and new-resource alerts need Business or higher. $5 plan: Not a Workers product. The Advanced add-on is listed at $0.099 per 1,000 requests. [Source](https://developers.cloudflare.com/client-side-security/)
- **Zero Trust Access**. A login wall Cloudflare puts in front of a page, subdomain or app, so only people on your list get in. Free plan: Free for up to 50 users, with 24 hours of logs. $5 plan: Not part of Workers Paid. Past the free plan, pay-as-you-go is $7 per user a month. [Source](https://www.cloudflare.com/plans/sase-zero-trust.md)
- **Cloudflare Tunnel**. Puts a program running on your own computer on the internet safely, without opening any doors into your network. Free plan: Free, up to 1,000 tunnels per account. Quick tunnels need no account at all. $5 plan: Same as free. Workers can also reach private services through a tunnel, using Workers VPC. [Source](https://developers.cloudflare.com/tunnel/)
- **Gateway**. A safe-browsing filter for your own devices that blocks bad sites. Free plan: Part of the Zero Trust free plan, for up to 50 users. $5 plan: Not part of Workers Paid. Past the free plan, pay-as-you-go is $7 per user a month. [Source](https://www.cloudflare.com/plans/sase-zero-trust.md)
- **Rate limiting in a Worker**. A request limiter inside your code that counts by anything you pick, like a post or a session, with no IP address needed. Free plan: Included with Workers on every plan. It counts over 10 or 60 seconds, per Cloudflare location, so counts are approximate. $5 plan: Same as free, no extra charge. [Source](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

</details>

<details><summary>Web and speed: 18</summary>

- **Secrets Store** (beta). One account-wide safe for API keys, the passwords programs use to reach other services. Several Workers can share the keys, instead of each key being set on each Worker. Free plan: Open beta, with 100 secrets and 1 store per account. Pricing unconfirmed. $5 plan: Same as free. Pricing unconfirmed. [Source](https://developers.cloudflare.com/secrets-store/manage-secrets/)
- **DNS**. The phone book that tells browsers where a website lives. Free plan: Free, unmetered lookups on every plan. Free-plan domains added on or after September 1, 2024 hold up to 200 records. DNSSEC, which signs DNS answers so they can be trusted, is free and takes one click. $5 plan: Not part of Workers Paid. Same as free. Pro and Business site plans raise the record limit to 3,500. [Source](https://developers.cloudflare.com/dns/manage-dns-records/)
- **CDN, Cache Rules and Workers Cache**. A CDN keeps copies of a site in data centers near readers. Cache Rules decide what to keep and for how long. Free plan: The CDN is free and unmetered. 10 Cache Rules and 10 Cache Response Rules. Workers Cache works on any plan with no separate fee. $5 plan: Requests for static files are free and unlimited. Turning on Workers Cache makes every request billable, static files included, at $0.30 per million after the first 10 million. Cache hits aren't charged for CPU time, the computing time a Worker uses. [Source](https://developers.cloudflare.com/workers/cache/)
- **Tiered Cache**. Cloudflare's data centers check with a nearby larger data center first, so the site's own server gets fewer requests. Free plan: The Tiered Cache page lists its Smart Topology setting as free on every plan. Newer docs describe it as part of Cloudflare's Smart Shield packages, and whether that changes the free setting is unconfirmed. $5 plan: Not part of Workers Paid. Same as free. The other layouts are Enterprise only. [Source](https://developers.cloudflare.com/cache/how-to/tiered-cache/)
- **Cache Reserve**. A long-term cache stored on R2, Cloudflare's file storage, so rarely viewed files stay cached. Free plan: Not on the free plan. $5 plan: Not included in Workers Paid. Cloudflare's docs now put it in the Smart Shield Advanced package, not currently offered to Free, Pro or Business, though the plans page still lists it as usage-based. Storage $0.015 per GB a month, writes $4.50 per million, reads $0.36 per million. [Source](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)
- **Redirect Rules**. Sends one web address to another without code, either one rule at a time or from big bulk lists. Free plan: 10 single redirect rules, plus bulk redirects: 15 rules and 5 lists holding up to 10,000 addresses per account. $5 plan: Not part of Workers Paid. Same as free. [Source](https://developers.cloudflare.com/rules/url-forwarding/)
- **Transform Rules and Managed Transforms**. Rewrite web addresses or headers, the hidden labels on each request and response, for example to add security headers. Free plan: 10 active Transform Rules, without pattern matching (regex). Managed Transforms, Cloudflare's ready-made header changes, are available. $5 plan: Not part of Workers Paid. Same as free. [Source](https://developers.cloudflare.com/rules/transform/)
- **Snippets**. Tiny bits of JavaScript that run on Cloudflare before a request reaches the site, like a mini Worker. Free plan: Not on the free plan. $5 plan: Not part of Workers Paid. Needs Pro ($20 a month billed yearly, $25 monthly) for 25 Snippets, or Business for 50. [Source](https://developers.cloudflare.com/rules/snippets/)
- **Web Analytics**. Visitor counts and page speed for a site, collected without cookies. Free plan: Free for any number of sites that run through Cloudflare, plus up to 10 that don't. $5 plan: Not part of Workers Paid. Same as free. [Source](https://developers.cloudflare.com/web-analytics/limits/)
- **Zaraz**. Runs outside scripts like tracking pixels and analytics from Cloudflare instead of the reader's browser, and offers a consent banner. Free plan: 1 million events a month per account, with every feature on every plan. $5 plan: Not part of Workers Paid. Zaraz Paid costs $5 per extra million events. Without it, going over switches Zaraz off until the next billing cycle. [Source](https://developers.cloudflare.com/zaraz/pricing-info/)
- **Registrar and Registrar API** (beta). Sells domain names at cost. Its API, a way for programs to buy domains, is in beta. Free plan: No markup, so the price is what the registry running each domain ending, like .com, charges. The plans page lists prices from $7.85, and the current .com price is unconfirmed. Owner details are hidden from public lookups by default. Dashboard purchases auto-renew by default. $5 plan: Not tied to Workers. API purchases use the default payment method, can't be refunded and don't auto-renew by default. [Source](https://developers.cloudflare.com/registrar/)
- **Radar**. Cloudflare's public stats on internet traffic, attacks and AI bots, plus a tool that scans any web address. Free plan: Free, both the website and the API. $5 plan: Same as free. [Source](https://radar.cloudflare.com/)
- **Observatory** (beta). Runs Google Lighthouse speed tests on a site's pages and shows how fast it loads for real visitors. Free plan: Real-visitor speed tracking is on by default, excluding visitors from the European Economic Area, the UK and Switzerland. The number of free tests is unconfirmed. $5 plan: Not part of Workers Paid. Pro gets 50 one-off and 5 recurring daily tests a month, Business 100 and 10. [Source](https://developers.cloudflare.com/speed/observatory/)
- **Waiting Room**. A virtual queue that holds visitors back when too many people arrive at once. Free plan: Not on the free plan. $5 plan: Not part of Workers Paid, and not on Pro either. Business ($200 a month billed yearly, $250 monthly) and Enterprise each include one basic waiting room. [Source](https://developers.cloudflare.com/waiting-room/plans/)
- **Health Checks**. Cloudflare keeps pinging a site and sends an alert if it goes down. Free plan: Not on the free plan. $5 plan: Not part of Workers Paid. Pro gets 10 health checks, Business 50. [Source](https://developers.cloudflare.com/health-checks/)
- **Load Balancing**. Spreads traffic over several servers and skips any that are down. Free plan: Not included. It's a paid add-on that any plan can buy, the free plan too. $5 plan: Not part of Workers Paid. The add-on starts at $5 a month. How many servers that covers, and the price per extra server, are unconfirmed. [Source](https://developers.cloudflare.com/load-balancing/)
- **Spectrum**. Cloudflare's protection for services that aren't websites, like a game server or SSH (remote login to a server). Free plan: Not on the free plan. $5 plan: Not part of Workers Paid. On Pro and Business, a paid add-on covers one Minecraft or SSH app, price unconfirmed. Business also allows Windows Remote Desktop. Any other kind of app needs Enterprise. [Source](https://developers.cloudflare.com/spectrum/protocols-per-plan/)
- **Free, Pro and Business plans**. The plan each website is on, billed separately from the $5 Workers plan. It sets rule counts, security features and support. Free plan: $0. 70 rules plus 10,000 bulk redirects, blocking for simple bots, and help from community forums and docs. $5 plan: A separate bill. Workers Paid doesn't upgrade it. Pro is $20 a month billed yearly or $25 monthly, Business $200 or $250. [Source](https://www.cloudflare.com/plans/network-cdn.md)

</details>

<details><summary>Money: 2</summary>

- **AI Crawl Control and Pay per crawl** (closed beta). Shows which AI bots, like GPTBot and ClaudeBot, read a site and lets you allow, block or charge them per page. Free plan: Crawl Control is on every plan, free included. Pay per crawl, in closed beta, uses one price for a whole site or a price set per request, and chosen pages can stay free. $5 plan: Same as free, since it's a site setting. Cloudflare handles the billing, but its cut and how it pays out are unconfirmed. [Source](https://developers.cloudflare.com/ai-crawl-control/)
- **Agent payments (x402)** (closed beta). Lets AI agents pay small amounts per request, mostly in stablecoins (crypto pegged to the dollar). Not a checkout for people. Free plan: No free allowance listed. Cloudflare's own fees are unconfirmed. $5 plan: Not priced in Workers Paid. The payment tools in Cloudflare's Agents SDK (x402 and MPP) work now. AI Gateway's Machine Payments is in beta for US-based users with a card on file, and Monetization Gateway is in closed beta. [Source](https://developers.cloudflare.com/agents/tools/payments/)

</details>

<details><summary>Also worth knowing (checked once, not twice): 16</summary>

- **Worker Previews**. Every branch of a site's code except the main one, meaning each separate line of work, gets its own private test copy, with its own address, settings and logs. Free plan: Part of Workers and Workers Builds, with no separate price listed. Launched September 22, 2026. $5 plan: Same as free. [Source](https://developers.cloudflare.com/workers/previews/)
- **Billable Usage dashboard and Budget alerts**. A daily view of what usage beyond the $5 plan costs, plus an email when spending passes a chosen dollar amount. Free plan: Free for pay-as-you-go accounts, added April 2026. A default alert has since rolled out. $5 plan: Same as free. [Source](https://developers.cloudflare.com/changelog/post/2026-04-13-billable-usage-dashboard-and-budget-alerts/)
- **Notifications and alerts**. Alerts by email or webhook, an automatic message to another app, for Cloudflare events like billing, security certificates and attacks, and for scheduled checks written in SQL, a database query language. Free plan: Email and webhooks on every plan. Up to 100 webhook targets without a paid site plan. $5 plan: Same as free. PagerDuty alerts, for on-call paging, need the Business plan or above. [Source](https://developers.cloudflare.com/notifications/)
- **DMARC Management**. Shows every service sending email as a domain, and whether its mail passes SPF, DKIM and DMARC, the checks against fake senders. Free plan: Available on all plans that use Cloudflare DNS. No price stated. $5 plan: Same as free. [Source](https://developers.cloudflare.com/dmarc-management/)
- **Security Center**. Scans an account for setup mistakes like DNS records pointing nowhere, a missing or broken DMARC record, and old versions of TLS, the encryption behind https. Free plan: Security Insights runs on every plan. $5 plan: Same as free. Brand Protection alerts need the Pro plan or above. [Source](https://developers.cloudflare.com/security-center/get-started/)
- **Leaked credentials detection**. Flags logins that use a password already exposed in a data breach. Free plan: Free, and on by default on the free plan. $5 plan: Same as free. [Source](https://developers.cloudflare.com/waf/detections/leaked-credentials/get-started/)
- **Flagship**. Switches that turn a feature on for some visitors, or a percentage of them, without putting out a new version of the site. Free plan: Public beta since May 26, 2026. The docs publish no price. $5 plan: Same as free. [Source](https://developers.cloudflare.com/flagship/)
- **Artifacts**. Git repositories, code folders with full history, hosted by Cloudflare. Workers can create them, standard git tools can push to them, and Workers Builds can deploy from them. Free plan: Not on the free plan. $5 plan: Includes 10,000 operations and 1 GB-month of storage (1 GB kept for a month), then $0.15 per 1,000 operations and $0.50 per GB-month. Billing starts November 12, 2026. [Source](https://developers.cloudflare.com/artifacts/platform/pricing/)
- **K2**. An event log. A program writes records, they're kept for a set time, and several separate readers can each work through them. Free plan: Not on the free plan. $5 plan: Public beta. 10 GB per account during the beta, records kept for up to 30 days. No K2 price published. [Source](https://developers.cloudflare.com/k2/)
- **Media over QUIC (MoQ)**. Hosted relay servers that pass along live video and audio with very little delay. Free plan: Free during the beta. The price after that isn't stated. $5 plan: Same as free. [Source](https://developers.cloudflare.com/moq/)
- **Agent Memory**. Long-term memory for an AI agent that lasts across conversations, reached from a Worker. Free plan: Private beta. No price stated. $5 plan: Same as free. [Source](https://developers.cloudflare.com/agent-memory/)
- **Cloudflare CLI**. One command-line tool, cf, for the whole Cloudflare API. Over 2,900 commands, machine-readable JSON output, built for coding agents. Free plan: Free. In beta since September 28, 2026. $5 plan: Same as free. [Source](https://developers.cloudflare.com/cf/)
- **Cloudflare API MCP server**. Lets an AI agent call the full Cloudflare API directly through MCP, a common standard for connecting agents to tools. Lives at mcp.cloudflare.com. Free plan: Free. The account's own API permissions still apply. $5 plan: Same as free. [Source](https://developers.cloudflare.com/agent-setup/claude-code/)
- **Agent Lee**. An AI assistant in the Cloudflare dashboard that answers questions about the account and makes changes once the user approves them. Free plan: Beta, offered to Free-plan accounts and some Enterprise customers. $5 plan: Unclear. The docs don't say how Workers Paid accounts are treated. [Source](https://developers.cloudflare.com/agent-lee/)
- **Cloudflare Wallets**. Planned wallets for stablecoins, crypto tied to a currency like the dollar, for an account and its AI agents. Free plan: Not launched. For now the only step is reserving a NAME.cloudflare.pay handle. Price and regions not stated. $5 plan: Same as free. [Source](https://developers.cloudflare.com/wallets/)
- **Randomness Beacon**. Public random numbers that anyone can verify and no one can predict or rig. Free plan: Public endpoints anyone can query. The Cloudflare page states no price. $5 plan: Same as free. [Source](https://developers.cloudflare.com/randomness-beacon/)

</details>

*Claude Code researched this post against Cloudflare's docs and changelogs on 2 November 2026, and
four more agents tried to disprove every price and limit in it.*
