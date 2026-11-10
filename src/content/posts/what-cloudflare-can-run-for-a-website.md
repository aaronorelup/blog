---
id: "AO-081"
title: "Running a website on Cloudflare for free or $5 a month"
summary: "Claude checked every Cloudflare product a website can use against Cloudflare's own docs: what each one does, what's free, what the $5 plan adds, and whether logins, payments and newsletters can run there."
date: 2026-11-10
topic: "learning"
draft: true
preview:
  verdict: "Almost all of it, for $5"
  takeaway: "Cloudflare's $5 a month plan can run a whole website: pages, database, files, AI and bot checks. Payments need Stripe, and newsletters a sender like Kit."
  points:
    - "No ready-made login for readers, but an emailed-link and Face ID login runs fine on Cloudflare's own code and database."
    - "AI is built in. The free daily allowance covers about 110 chat answers, and past it a picture costs about 1.5 cents."
    - "The free plan covers a small site. $5 removes the daily database cutoff and adds email sending and containers."
  image: "/media/previews/what-cloudflare-can-run-for-a-website.webp"
  alt: "A bar chart of AI job costs on Cloudflare: 10 minutes of transcription for half a cent, a picture for 1.5 cents, and 1,000 spoken words for 9 or 18 cents"
---

My whole site runs on Cloudflare, the company whose servers host and protect a big share of the web
([everything it runs on](/ledger/what-my-website-runs-on/)). So I had Claude check every Cloudflare
product a website can use against Cloudflare's own docs, in November 2026. **Its $5 a month Workers
plan can run an entire website**: the pages, a database, file storage, AI models, bot checks, timed
jobs and account emails. It can't charge a card, it won't send a newsletter, and it has no
ready-made login for readers.

- **The free plan covers a small site.** Plain pages are free and unlimited. Workers, the small
  programs that run on Cloudflare's servers, get 100,000 requests a day. The D1 database gets
  5 million rows read a day, and R2 file storage 10 GB.
- **$5 a month mostly removes the ceilings.** 10 million Worker requests and 25 billion database
  rows read a month, no daily cutoff, plus email sending and containers (a whole Linux computer
  that starts when it's needed).
- **AI is built in.** Cloudflare runs dozens of AI models on its own graphics cards: chat and
  coding models, speech-to-text, voices, image generation and search. Every account gets a free
  daily allowance.
- **Logins are yours to build.** Cloudflare has no sign-in for the public, but one runs fine on a
  Worker and its database.
- **Payments go through Stripe.** Cloudflare doesn't process cards. Its own payment tools charge
  bots that read sites for AI companies, not people.
- **Newsletters need another company to send them.** Cloudflare's new email service sends account
  mail only, like sign-in links and receipts.
- **No graphics cards and no spending cap.** Your own AI models have to run somewhere else, and
  nothing caps the whole bill.

## What the $5 plan adds

The free plan has daily ceilings. The $5 plan swaps them for much bigger monthly ones and adds email
sending and containers.

| | Free plan | $5 plan, each month |
|---|---|---|
| Worker requests | 100,000 a day | 10 million, then $0.30 per million |
| Computer time per request | 10 ms | up to 5 minutes (30 seconds by default) |
| D1 database | 5 million rows read and 100,000 written a day | 25 billion read and 50 million written |
| KV (a quick lookup table) | 100,000 reads and 1,000 writes a day | 10 million reads and 1 million writes |
| Durable Objects (small live rooms) | 100,000 requests a day | 1 million requests |
| Queues (a to-do line between programs) | 10,000 operations a day | 1 million operations |
| Workflows (step-by-step jobs) | 3,000 steps a day | 500,000 steps |
| Workers AI | 10,000 Neurons a day | the same, then $0.011 per 1,000 |
| Browser Run (a real Chrome in the cloud) | 10 minutes a day | 10 hours |
| Email sending | not included | 3,000 emails, then $0.35 per 1,000 |
| Containers (a Linux computer for any program) | not included | 25 GiB-hours of memory, 375 CPU-minutes |
| Plain pages | free, unlimited | free, unlimited |

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

Past the plan it's 30 cents per million requests and 2 cents per million milliseconds of computer
time. There are no fees for the data visitors download. R2 storage is billed on its own, at 1.5
cents a GB a month after the free 10 GB, and taking files back out is free. For scale, my site, my
agents' dashboard and a game made about 66,000 Worker requests in October, well under 1% of the 10
million.

## What AI jobs cost

<ao-bars unit="cents">
<table><thead><tr><th>One job</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>A chat answer, gpt-oss-120b</td><td>0.1</td></tr>
<tr><td>A chat answer, DeepSeek V4.1 Flash</td><td>0.11</td></tr>
<tr><td>Transcribe 10 minutes of audio, Whisper</td><td>0.5</td></tr>
<tr><td>A 1024×1024 picture, FLUX.2 klein 9B</td><td>1.5</td></tr>
<tr><td>Speak 1,000 words, Deepgram Aura-1</td><td>9</td></tr>
<tr><td>Speak 1,000 words, Deepgram Aura-2</td><td>18</td></tr>
</tbody></table>
<figcaption><b>What one AI job costs on Cloudflare's Workers AI</b><span class="ao-meta">US cents at list price, past the free daily allowance. A chat answer is 2,000 tokens in and 400 out, and a token is about three quarters of a word</span></figcaption>
</ao-bars>

Cloudflare counts AI work in Neurons, and every account gets 10,000 a day free. That's about 214
minutes of Whisper, about 110 chat answers from gpt-oss-120b or about 7 pictures from FLUX.2 klein
9B a day. Past it, the $5 plan pays $0.011 per 1,000 Neurons. On the free plan the AI stops for the
day. Cloudflare also retires older models now and then. Twenty-four of them, including MeloTTS, its
cheapest voice, stop working on November 20, 2026.

## Logins, payments and newsletters

**Logins.** Cloudflare has no sign-in for the public, so you build your own on a Worker: an emailed
sign-in link plus passkeys (Face ID or a fingerprint instead of a password), with the accounts in
D1. Cloudflare's email service can send the sign-in emails. Its Access sign-in is free for up to 50
named people, like a team or a group of beta testers, and it isn't built for public sign-up. Hosted
services like Clerk, free up to 50,000 monthly users, are faster to add, but they put another
company's script on your page.

**Payments.** Cloudflare doesn't process card payments. Stripe does, at 2.9% plus 30 cents a sale,
and a Worker records who bought what. To sell downloads worldwide, a merchant of record (a company
that becomes the legal seller and handles sales tax and VAT) like Paddle, Polar or Stripe's Managed
Payments costs about 5 to 6.4% plus 30 to 50 cents a sale. Cloudflare's own payment tools, Pay per
crawl and Monetization Gateway, charge bots that read sites for AI companies, not people, and both
are invite-only tests.

**Newsletters.** Cloudflare can hold the signup form, the list, the confirmation email and the
one-click unsubscribe, but another service has to send the issues. Its Email Service, in beta since
April 2026, includes 3,000 emails a month on the $5 plan, then 35 cents per 1,000, and its FAQ says
it sends transactional mail only, meaning sign-in links, confirmations and receipts. So something
like Kit (free up to 10,000 subscribers) or Amazon SES (about 10 cents per 1,000 emails) sends the
issues. Email Routing, which is free, receives mail at your own domain. Before the first issue,
Gmail and Yahoo want one-click unsubscribe honored within 2 days, and US law wants a postal address
in every email, where a PO box is fine. Turning on Cloudflare's Email Service also adds a strict
anti-forgery email record if the domain has none, which can block other services that send as your
domain, so a subdomain like news.yourdomain.com is safer.

## No graphics cards and no spending cap

Your own AI models have to run somewhere else. Cloudflare's containers top out at 4 CPUs and 12 GiB
of memory by default, and none of their sizes comes with a graphics card. Nothing caps the whole
bill either. Budget alerts email you after the fact, and only AI calls sent through AI Gateway can
be capped in dollars.

## Every Cloudflare product for a website

All 98 products Cloudflare offers a site like this, by area, with what the free plan gives and what the $5 plan adds. Cloudflare calls the $5 plan Workers Paid. Some settings belong instead to each website's own plan, Free, Pro or Business, and the $5 plan doesn't change those. Prices are list prices as of November 2, 2026, with the model retirements of November 20 added.

<details><summary>AI models and tools (18)</summary>

- **Workers AI.** Cloudflare's own AI models on its graphics cards, called from code with one line and paid per use, not per hour. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  - **Free plan.** 10,000 Neurons (Cloudflare's usage unit) a day, worth about $0.11. On the free plan, requests past that fail.
  - **$5 plan.** The same 10,000 free Neurons a day, then $0.011 per 1,000 Neurons. Adds paid-only models like GLM-5.3 and DeepSeek V4.1 Flash.
- **Workers AI speech-to-text.** Turns recorded or live speech into text, with Whisper and Deepgram models. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  - **Free plan.** Covered by the 10,000 free Neurons a day, about 214 minutes of Whisper large-v3-turbo a day.
  - **$5 plan.** Same free Neurons, then Whisper is $0.0005 per audio minute, Deepgram Nova-3 $0.0052, and live Deepgram Flux $0.0077.
- **Workers AI text-to-speech.** Turns written text into a spoken voice, with Deepgram's Aura models. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  - **Free plan.** Covered by the daily free Neurons, about 1,200 words a day of Aura-1 or 600 of Aura-2.
  - **$5 plan.** Same free Neurons, then Aura-1 is $0.015 and Aura-2 $0.030 per 1,000 characters. MeloTTS, the cheapest voice, retires on November 20, 2026.
- **Workers AI chat models.** Large open-weight models (ones anyone can download) hosted by Cloudflare that chat, write, use tools and return structured data. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  - **Free plan.** Covered by the daily free Neurons, about 110 gpt-oss-120b answers a day (2,000 tokens, or word pieces, in and 400 out).
  - **$5 plan.** Adds paid-only models like GLM-5.3 and DeepSeek V4.1 Flash, at 20 requests a minute each. DeepSeek V4.1 Flash costs $0.30 in, $1.20 out per million tokens. Kimi K2.6, GLM-5.2 and the older DeepSeek V4 builds retire on November 20, 2026.
- **Workers AI image generation.** Makes pictures from a text prompt, and edits pictures, with models like FLUX.2 and Leonardo. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  - **Free plan.** Covered by the daily free Neurons, about 7 FLUX.2 klein 9B images or roughly 170 FLUX.1 schnell images (1024x1024, 4 steps) a day.
  - **$5 plan.** Same free Neurons, then FLUX.2 klein 9B costs $0.015 for the first megapixel (a million pixels). A 1024x1024 FLUX.1 schnell image at 4 steps is about $0.0006.
- **Workers AI image understanding.** Models that look at a picture and describe it, read the text in it, or find objects in it. [Source](https://developers.cloudflare.com/workers-ai/models/moondream3.1-9B-A2B/)
  - **Free plan.** Covered by the 10,000 free Neurons a day.
  - **$5 plan.** Same free Neurons, then Moondream 3.1 is $0.30 in and $1.00 out per million tokens (small chunks of text or image).
- **Workers AI embeddings and reranking.** Turns text into number lists that capture meaning, so search finds things by meaning, then reorders hits so the best comes first. [Source](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  - **Free plan.** Covered by the 10,000 free Neurons a day. The bge-m3 model uses 1,075 Neurons per million tokens.
  - **$5 plan.** Same free Neurons, then bge-m3 costs $0.012 per million tokens and the bge-reranker-base reranker $0.003 per million.
- **Workers AI translation.** Machine translation between languages, with m2m100 covering about 100 languages and IndicTrans2 covering English to 22 languages of India. [Source](https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/)
  - **Free plan.** Covered by the 10,000 free Neurons a day.
  - **$5 plan.** Same free Neurons, then m2m100 costs $0.342 per million tokens in and out, about $0.0014 for a 1,500-word article.
- **Workers AI classification and extraction models.** Small models that give set answers instead of prose, like picking an option, flagging unsafe text or pulling out a total. [Source](https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/)
  - **Free plan.** Covered by the 10,000 free Neurons a day.
  - **$5 plan.** Same free Neurons, then Clef-flash costs $0.038 and Clef $0.24 per million input tokens, with no charge for output. Clairic (preview) is $0.10 per million input tokens, also with no output charge.
- **Workers AI Markdown conversion.** Turns PDFs, web pages, office files and images into clean text an AI can read, and writes a description for each image. [Source](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/)
  - **Free plan.** Free for most formats, including PDF and HTML. Image descriptions use AI models and count against the 10,000 free Neurons a day.
  - **$5 plan.** Same as free. Image descriptions past the free Neurons are billed at the model's normal rate.
- **Third-party AI models.** The same code that calls Cloudflare's models also reaches outside ones like Veo, Kling, Claude, GPT and Gemini, on one Cloudflare bill. [Source](https://developers.cloudflare.com/ai/models/)
  - **Free plan.** Nothing included. You pay with prepaid AI Gateway credits or your own provider key.
  - **$5 plan.** Not included. Provider list price with no markup, plus a 5% fee on credits. Veo 3.1 Fast is $0.08 to $0.30 per second of video.
- **AI Gateway.** A switchboard for AI calls that tracks cost, caches repeat answers, caps spending and switches to a backup model when one fails. [Source](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
  - **Free plan.** Core features are free, including analytics, caching and rate limiting. Up to 10 gateways.
  - **$5 plan.** 20 gateways. Accounts whose first gateway was made on or after September 24, 2026 get 20 million log events a month, then $0.60 per million (moving to Cloudflare Observability pricing on December 1, 2026). Older accounts keep 10 million per gateway.
- **Web Search API** (beta). Lets an AI search the live web from code running on Cloudflare, so its answers aren't stuck at its training date. [Source](https://developers.cloudflare.com/changelog/post/2026-10-02-introducing-web-search-api/)
  - **Free plan.** No free amount stated.
  - **$5 plan.** Not included. You pay the search provider's list price with no markup, from $0.25 per 1,000 searches on Ceramic up to $7 on Exa.
- **Vectorize.** A vector database (number lists that capture meaning) that finds the entries closest in meaning to a question. [Source](https://developers.cloudflare.com/vectorize/platform/pricing/)
  - **Free plan.** 30 million queried and 5 million stored dimensions (the numbers in each list) a month, and 100 indexes. Cloudflare's Workers pricing page still says Vectorize needs the $5 plan.
  - **$5 plan.** 50 million queried and 10 million stored dimensions a month, then $0.01 per million queried and $0.05 per 100 million stored.
- **AI Search.** Point it at a website, a storage bucket or uploaded files, and it builds a managed search engine you can chat with. [Source](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
  - **Free plan.** Each month, 1,000 meaning-based and 1,000 keyword searches and 5 million tokens of content read in. Crawls 500 pages a day.
  - **$5 plan.** Same monthly allowance, unlimited crawl pages, then $0.75 per 1,000 meaning-based searches and $0.75 per million tokens read in. Billing started November 1, 2026.
- **Agents SDK and remote MCP servers.** Hosts AI agents that remember and schedule work, and MCP servers that let AIs like Claude use a service as a tool. [Source](https://developers.cloudflare.com/agents/)
  - **Free plan.** Runs on Durable Objects (small programs that keep their own data), with 100,000 requests a day and 5 GB of storage total.
  - **$5 plan.** 1 million requests and 5 GB of storage a month, then $0.15 per million requests. The AI models it calls bill separately.
- **Realtime voice agents** (beta). A talk-to-it AI in the browser that listens, thinks and talks back, and stops talking when interrupted. [Source](https://developers.cloudflare.com/agents/agent-class/communication-channels/voice/)
  - **Free plan.** Model use comes out of the 10,000 free Neurons a day, plus the free Durable Objects allowance.
  - **$5 plan.** The paid Durable Objects allowance, plus pay-per-use models like Flux speech-to-text at $0.0077 a minute. A 5-minute chat is about $0.07 (estimate).
- **Browser Run.** A Chrome browser in Cloudflare's cloud that code or an AI drives to take screenshots, make PDFs, read pages or crawl sites. [Source](https://developers.cloudflare.com/browser-run/pricing/)
  - **Free plan.** 10 browser-minutes a day, with 3 browsers running at once.
  - **$5 plan.** 10 browser-hours a month and 10 browsers at once (a monthly average of daily peaks) included, then $0.09 per extra browser-hour and $2.00 for each extra browser at once.

</details>

<details><summary>Running code (15)</summary>

- **Workers.** Small programs that run on Cloudflare's servers worldwide the moment someone loads a page, with no server of your own to manage. [Source](https://developers.cloudflare.com/workers/platform/pricing/)
  - **Free plan.** 100,000 requests a day, with up to 10 milliseconds of processing time per request.
  - **$5 plan.** 10 million requests and 30 million milliseconds of processing time a month. Then $0.30 per million requests and $0.02 per million milliseconds. No bandwidth charge.
- **Workers Static Assets.** Hosting for a website's built files, like pages, images and scripts, served from the same Worker out of Cloudflare's cache. [Source](https://developers.cloudflare.com/workers/platform/limits/)
  - **Free plan.** Requests for these files are free and unlimited. Up to 20,000 files per version, 25 MiB each.
  - **$5 plan.** Same as free, but up to 100,000 files per version. If Workers Caching is on, every request is billed at the normal rate.
- **Workers Builds.** Cloudflare's own build service that turns your code into a finished site and publishes it every time you push to GitHub. [Source](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
  - **Free plan.** 3,000 build minutes a month, one build at a time, 20 minutes max per build.
  - **$5 plan.** 6,000 build minutes a month, six builds at once and 4 virtual processors instead of 2. Then $0.005 per extra build minute.
- **Queues.** A to-do line between programs, where one part drops a job in and another picks it up later, retrying until it's done. [Source](https://developers.cloudflare.com/queues/platform/pricing/)
  - **Free plan.** 10,000 operations a day, about 3 per delivered message. Messages are kept for 24 hours.
  - **$5 plan.** 1 million operations a month, messages kept 4 days by default and up to 14. Then $0.40 per extra million operations.
- **Workflows.** Long jobs split into saved steps that retry on failure and can pause for minutes, days or until someone approves. [Source](https://developers.cloudflare.com/workflows/reference/pricing/)
  - **Free plan.** 3,000 steps a day and 100 jobs running at once, sharing the Workers limit of 100,000 requests a day.
  - **$5 plan.** 500,000 steps a month and 50,000 jobs running at once. Then $0.80 per extra 100,000 steps, plus requests and processing time at Workers rates.
- **Cron Triggers.** Runs a Worker on a timer, like every minute or every day at 3 am. [Source](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
  - **Free plan.** 5 timers per account, with 10 milliseconds of processing time per run.
  - **$5 plan.** 250 timers per account, with up to 30 seconds of processing per run, or 15 minutes for timers an hour or more apart. Billed as normal Worker use.
- **Containers.** Runs any program, like Python or the ffmpeg video tool, in a Linux box that starts when needed and sleeps when idle. [Source](https://developers.cloudflare.com/containers/platform/pricing/)
  - **Free plan.** Not included.
  - **$5 plan.** 375 processor-minutes, 25 GiB-hours of memory and 1 TB of traffic out in North America and Europe a month. Then billed by the second. None of the sizes comes with a graphics card.
- **Sandboxes and Dynamic Workers.** Safe boxes for running untrusted or AI-written code, either a Linux container or a throwaway Worker made on the fly. [Source](https://developers.cloudflare.com/sandbox/)
  - **Free plan.** Not included.
  - **$5 plan.** Sandboxes use Containers allowances and rates. Dynamic Workers include 1,000 unique ones a month, then $0.002 each per day, with requests counted as Workers usage.
- **Workers VPC** (beta). Lets a Worker privately reach machines that aren't on the public internet, like a laptop, through Cloudflare Tunnel or Cloudflare Mesh. [Source](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/)
  - **Free plan.** Free on all plans while in beta.
  - **$5 plan.** Free while in beta. Pricing after beta is unconfirmed.
- **Workers for Platforms.** Lets you run a platform where customers upload their own Workers, each walled off from the others. [Source](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
  - **Free plan.** Not included.
  - **$5 plan.** Not included. It's a separate $25 a month plan with 20 million requests and 1,000 scripts, then $0.30 per million requests and $0.02 per script.
- **Service bindings.** Lets one Worker call another directly and privately, without going over the public internet. [Source](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
  - **Free plan.** Included.
  - **$5 plan.** Included. The whole call is billed as one request plus both Workers' processing time. With Workers Caching on, each call between Workers is also billed as a request.
- **Smart Placement and placement hints** (beta). Runs a Worker near the database or API it talks to most, instead of near the visitor, to cut back-and-forth delays. [Source](https://developers.cloudflare.com/workers/configuration/placement/)
  - **Free plan.** Available, with no separate price listed.
  - **$5 plan.** Same as free.
- **Framework support on Workers.** Ready-made adapters so sites built with common frameworks like Astro, Nuxt or SvelteKit go straight onto Workers, with Next.js in beta. [Source](https://developers.cloudflare.com/workers/static-assets/routing/full-stack-application/)
  - **Free plan.** Included.
  - **$5 plan.** Included.
- **Pages vs Workers.** Cloudflare's two ways to host a site, and Cloudflare now says to start new projects on Workers instead of Pages. [Source](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
  - **Free plan.** Pages gives 500 builds a month. Workers serves site files free with no limit, plus 3,000 build minutes a month.
  - **$5 plan.** 10 million requests a month and 6,000 build minutes, then $0.30 per million requests. Pages Functions, the server code in Pages, are billed like Workers.
- **Custom domains and routes.** Points a whole domain or subdomain at a Worker, and Cloudflare creates the DNS record and HTTPS certificate itself. [Source](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
  - **Free plan.** Free, with the certificate made automatically. No wildcard entries that cover every subdomain at once, and www needs its own entry.
  - **$5 plan.** Same as free. Requests count toward the 10 million included, and site files stay free.

</details>

<details><summary>Storing data (9)</summary>

- **Durable Objects.** A tiny "room" with its own SQLite database that every visitor sees the same way, for live counters, chats and multiplayer. [Source](https://developers.cloudflare.com/durable-objects/platform/pricing/)
  - **Free plan.** 100,000 requests a day and 5 GB of storage in total. Only the SQLite-backed kind.
  - **$5 plan.** 1 million requests and 5 GB of storage a month. Then $0.15 per million requests, $0.20 per GB a month, plus fees for running time and database rows.
- **D1.** A SQLite database, tables of rows a Worker can read and write, with no database server for you to run. [Source](https://developers.cloudflare.com/d1/platform/pricing/)
  - **Free plan.** 5 million rows read and 100,000 rows written a day, 5 GB in total, 500 MB per database.
  - **$5 plan.** 25 billion rows read and 50 million written a month, restore to any minute of the last 30 days. Then $0.001 per million rows read and $1 per million rows written.
- **Workers KV.** A global lookup table that reads small values fast anywhere, though a change can take up to about 60 seconds to spread. [Source](https://developers.cloudflare.com/kv/platform/pricing/)
  - **Free plan.** 100,000 reads and 1,000 writes a day, 1 GB of storage.
  - **$5 plan.** 10 million reads and 1 million writes a month, 1 GB of storage. Then $0.50 per million reads, $5 per million writes and $0.50 per GB a month.
- **R2.** Cheap cloud file storage that works like Amazon S3, with no fees when people download the files. [Source](https://developers.cloudflare.com/r2/pricing/)
  - **Free plan.** 10 GB of storage, 1 million writes and 10 million reads a month. No bandwidth fees.
  - **$5 plan.** Not part of the $5 plan. R2 is its own pay-as-you-go bill, at $0.015 per GB a month, $4.50 per million writes and $0.36 per million reads.
- **Basin Catalog and Basin SQL (formerly R2 Data Catalog and R2 SQL).** Turns files in R2 into database tables and lets you query huge piles of logged data with SQL, the standard database language. [Source](https://developers.cloudflare.com/basin/platform/pricing/)
  - **Free plan.** 1 million catalog operations and 10 GB of SQL scanning a month. SQL needs an R2 subscription and a card on file.
  - **$5 plan.** Same as free. Then $9 per million catalog operations and $2.50 per TB scanned by SQL, plus R2 storage.
- **Basin Pipelines (formerly Cloudflare Pipelines).** A firehose for events that cleans incoming data with SQL and writes it to R2 as tables or files. [Source](https://developers.cloudflare.com/basin-pipelines/platform/pricing/)
  - **Free plan.** 1 GB a month each of processing and delivery, from a May 2026 post. Today's pricing page lists only the paid plan.
  - **$5 plan.** 50 GB of processing and 50 GB of delivery a month. Sending data in is free. Then $0.04 per GB processed and $0.03 to $0.06 per GB delivered.
- **Hyperdrive.** Makes an outside Postgres or MySQL database fast to use from Workers by keeping connections open and caching queries. [Source](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
  - **Free plan.** 100,000 queries a day and 10 configurations.
  - **$5 plan.** Unlimited queries and 25 configurations, with no Hyperdrive fee. The outside database is billed by its own provider.
- **Workers Analytics Engine.** A cheap counter store that records huge numbers of small events and lets you query them with SQL. [Source](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
  - **Free plan.** 100,000 data points written and 10,000 queries a day.
  - **$5 plan.** 10 million data points and 1 million queries a month. Then $0.25 per extra million data points and $1 per extra million queries, but billing isn't switched on yet.
- **Workers Logs, Tail Workers and Logpush.** Logs of what a Worker did, plus Tail Workers that react to every run and Logpush, which ships logs to storage. [Source](https://developers.cloudflare.com/observability/pricing/)
  - **Free plan.** 200,000 log events a day, kept 3 days. From December 1, 2026, 0.5 GB a day, kept 7 days. No Tail Workers.
  - **$5 plan.** 20 million log events a month kept 7 days, then $0.60 per extra million. From December 1, 2026, 50 GB a month included, then $0.25 per GB.

</details>

<details><summary>Video, images and calls (5)</summary>

- **Cloudflare Images.** Resizes, crops and converts images to lighter web formats on the fly, adds watermarks and text, and can AI-upscale them. It can also store images. [Source](https://developers.cloudflare.com/images/pricing/)
  - **Free plan.** 5,000 unique transformations a month (one image in one size counts as one). Past that, new ones fail instead of billing, and ones already made keep loading.
  - **$5 plan.** Not included, billed separately. $0.50 per 1,000 unique transformations past 5,000, $5 per 100,000 stored images a month, $1 per 100,000 delivered.
- **Cloudflare Stream.** Video hosting that converts uploads, plays them at the right quality per device, adds AI captions and runs live streams. [Source](https://developers.cloudflare.com/stream/pricing/)
  - **Free plan.** Not included.
  - **$5 plan.** Not included. Storage is $5 per 1,000 minutes a month, prepaid, and viewing is $1 per 1,000 minutes watched. Converting and uploading are free.
- **Media Transformations** (beta). Shrinks or crops videos, cuts short clips, grabs still frames and extracts audio, even from videos in R2, Cloudflare's file storage. [Source](https://developers.cloudflare.com/stream/pricing/)
  - **Free plan.** Shares Images' 5,000 free unique transformations a month. A still frame counts as one, a 5-second clip as five.
  - **$5 plan.** Not included. $0.50 per 1,000 unique transformations. Using it by URL is fully released. Calling it from Worker code is in beta and free for now, and after beta every call is billed, even repeats.
- **Realtime SFU and TURN.** The plumbing for live audio, video and data between browsers, for things like video calls, multiplayer and watch parties. The SFU passes each person's stream on to the others, and TURN relays connections that can't link up directly. [Source](https://developers.cloudflare.com/realtime/sfu/platform/pricing/)
  - **Free plan.** The first 1,000 GB of outgoing data a month is free, shared by both. TURN is free when used with the SFU.
  - **$5 plan.** Same as free. Past 1,000 GB it's $0.05 per GB.
- **RealtimeKit.** Ready-made video and audio meeting rooms, with drop-in interface kits, recording and transcripts. [Source](https://developers.cloudflare.com/realtime/realtimekit/platform/pricing/)
  - **Free plan.** No free allowance listed.
  - **$5 plan.** Not included. $0.002 per participant-minute (one person for one minute) for video, $0.0005 audio-only, recording $0.010 a minute. A one-hour video call with four people is 240 participant-minutes, or $0.48.

</details>

<details><summary>Email (3)</summary>

- **Email Routing.** Receives mail at your own domain and forwards it to an inbox like Gmail, or to your code on Cloudflare. [Source](https://developers.cloudflare.com/email-service/platform/limits/)
  - **Free plan.** Free and unlimited for incoming mail. Up to 200 routing rules per domain and 25 MiB per message.
  - **$5 plan.** Same as free. Code that reads mail counts toward the normal Workers CPU limits.
- **Email Workers sending to verified addresses.** Lets your code on Cloudflare email addresses you've verified, which is handy for alerts to yourself. [Source](https://developers.cloudflare.com/email-service/configuration/send-bindings/)
  - **Free plan.** Free on every plan, even with only Email Routing set up. Up to 50 recipients and 25 MiB per message.
  - **$5 plan.** Still free, and it doesn't use up the 3,000 included sends or the daily limits of Email Service.
- **Cloudflare Email Service** (beta). Sends email from code on Cloudflare to any address, for things like confirmations, login links and receipts. [Source](https://developers.cloudflare.com/email-service/platform/pricing/)
  - **Free plan.** Not included.
  - **$5 plan.** 3,000 emails a month included per account, then $0.35 per 1,000. New accounts start with a cautious daily cap that grows with a good sending record, and the exact number is unconfirmed. The domain must use Cloudflare DNS, meaning Cloudflare runs its address records.

</details>

<details><summary>Security (13)</summary>

- **SSL/TLS.** The padlock in the browser. It encrypts every visit to a site and can force the secure https version. [Source](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
  - **Free plan.** Free certificate for the main domain and one level of subdomains, like blog.example.com. Forcing https is free too.
  - **$5 plan.** Same as free. On any plan, Workers custom domains get their own certificate automatically, deeper subdomains included. Advanced Certificate Manager is $10 a month.
- **WAF managed rules.** A web firewall (WAF) with Cloudflare's ready-made rules that block well-known attacks on websites. [Source](https://developers.cloudflare.com/waf/managed-rules/)
  - **Free plan.** The Free Managed Ruleset is on by default. Leaked-password detection is on too.
  - **$5 plan.** A site setting, not part of the $5 plan. The full Cloudflare Managed Ruleset and the OWASP rules (a widely used open set of attack checks) need the Pro plan or higher.
- **WAF custom rules.** Your own rules to block visitors or make them prove they're human, like blocking every request to /wp-admin, the WordPress admin page that bots often probe. [Source](https://developers.cloudflare.com/waf/custom-rules/)
  - **Free plan.** 5 rules, with every action except Log and no regex (advanced text patterns).
  - **$5 plan.** A site setting, not part of the $5 plan. Pro gets 20 rules, Business 100.
- **Rate limiting rules.** Slows down anyone who hits a page too often, set as a site-wide firewall rule. [Source](https://developers.cloudflare.com/waf/rate-limiting-rules/)
  - **Free plan.** 1 rule, counted by IP address only, with a 10-second window and a 10-second block. It can only match on the page path or on whether a visitor is a verified bot.
  - **$5 plan.** A site setting, not part of the $5 plan. Pro gets 2 rules, Business 5. Separate from the rate limiter you can build inside a Worker.
- **DDoS protection.** Automatically soaks up floods of fake traffic meant to knock a site offline. [Source](https://developers.cloudflare.com/ddos-protection/)
  - **Free plan.** Unmetered on the free plan, meaning it isn't capped or billed by attack size, with alerts and one override of the managed rules.
  - **$5 plan.** Same as free.
- **Bot Fight Mode.** Challenges simple bots and headless browsers, meaning automated browsers with no screen, across a whole site. [Source](https://developers.cloudflare.com/bots/plans/free/)
  - **Free plan.** Bot Fight Mode is free, along with Block AI bots, AI Labyrinth (decoy pages that waste the time of bots ignoring no-crawl rules) and a managed robots.txt, the file that tells crawlers what they may read.
  - **$5 plan.** A site setting, not part of the $5 plan. Super Bot Fight Mode needs Pro or higher, and full Bot Management is Enterprise only.
- **Turnstile.** A privacy-friendly 'are you human?' check, usually invisible, with no picture puzzles. [Source](https://developers.cloudflare.com/turnstile/plans/)
  - **Free plan.** Unlimited challenges, up to 20 widgets, each on up to 10 hostnames like www.example.com, and 7 days of analytics.
  - **$5 plan.** Same as free. More needs Enterprise.
- **Client-side security.** Lists every script a site's pages load and warns when a bad one sneaks in. Formerly called Page Shield. [Source](https://developers.cloudflare.com/client-side-security/)
  - **Free plan.** Script monitoring is free. Connection and cookie monitoring and new-resource alerts need Business or higher.
  - **$5 plan.** A site setting, not part of the $5 plan. The Advanced add-on is listed at $0.099 per 1,000 requests.
- **Zero Trust Access.** A login wall Cloudflare puts in front of a page, subdomain or app, so only people on your list get in. [Source](https://www.cloudflare.com/plans/sase-zero-trust.md)
  - **Free plan.** Free for up to 50 users, with 24 hours of logs.
  - **$5 plan.** Not part of the $5 plan. Past the free plan, pay-as-you-go is $7 per user a month.
- **Cloudflare Tunnel.** Puts a program running on your own computer on the internet safely, without opening any doors into your network. [Source](https://developers.cloudflare.com/tunnel/)
  - **Free plan.** Free, up to 1,000 tunnels per account. Quick tunnels need no account at all.
  - **$5 plan.** Same as free. Workers can also reach private services through a tunnel, using Workers VPC.
- **Gateway.** A safe-browsing filter for your own devices that blocks bad sites. [Source](https://www.cloudflare.com/plans/sase-zero-trust.md)
  - **Free plan.** Part of the Zero Trust free plan, for up to 50 users.
  - **$5 plan.** Not part of the $5 plan. Past the free plan, pay-as-you-go is $7 per user a month.
- **Rate limiting in a Worker.** A request limiter inside your code that counts by anything you pick, like a post or a session, with no IP address needed. [Source](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
  - **Free plan.** Included with Workers on every plan. It counts over 10 or 60 seconds, per Cloudflare location, so counts are approximate.
  - **$5 plan.** Same as free, no extra charge.
- **Secrets Store** (beta). One account-wide safe for API keys, the passwords programs use to reach other services. Several Workers can share the keys, instead of each key being set on each Worker. [Source](https://developers.cloudflare.com/secrets-store/manage-secrets/)
  - **Free plan.** Open beta, with 100 secrets and 1 store per account. Pricing unconfirmed.
  - **$5 plan.** Same as free. Pricing unconfirmed.

</details>

<details><summary>Web and speed (17)</summary>

- **DNS.** The phone book that tells browsers where a website lives. [Source](https://developers.cloudflare.com/dns/manage-dns-records/)
  - **Free plan.** Free, unmetered lookups on every plan. Free-plan domains added on or after September 1, 2024 hold up to 200 records. DNSSEC, which signs DNS answers so they can be trusted, is free and takes one click.
  - **$5 plan.** Same as free. Pro and Business site plans raise the record limit to 3,500.
- **CDN, Cache Rules and Workers Cache.** A CDN keeps copies of a site in data centers near readers. Cache Rules decide what to keep and for how long. [Source](https://developers.cloudflare.com/workers/cache/)
  - **Free plan.** The CDN is free and unmetered. 10 Cache Rules and 10 Cache Response Rules. Workers Cache works on any plan with no separate fee.
  - **$5 plan.** Requests for static files are free and unlimited. Turning on Workers Cache makes every request billable, static files included, at $0.30 per million after the first 10 million. Cache hits aren't charged for CPU time, the computing time a Worker uses.
- **Tiered Cache.** Cloudflare's data centers check with a nearby larger data center first, so the site's own server gets fewer requests. [Source](https://developers.cloudflare.com/cache/how-to/tiered-cache/)
  - **Free plan.** The Tiered Cache page lists its Smart Topology setting as free on every plan. Newer docs describe it as part of Cloudflare's Smart Shield packages, and whether that changes the free setting is unconfirmed.
  - **$5 plan.** Same as free. The other layouts are Enterprise only.
- **Cache Reserve.** A long-term cache stored on R2, Cloudflare's file storage, so rarely viewed files stay cached. [Source](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)
  - **Free plan.** Not included.
  - **$5 plan.** Not included in the $5 plan. Cloudflare's docs now put it in the Smart Shield Advanced package, not currently offered to Free, Pro or Business, though the plans page still lists it as usage-based. Storage $0.015 per GB a month, writes $4.50 per million, reads $0.36 per million.
- **Redirect Rules.** Sends one web address to another without code, either one rule at a time or from big bulk lists. [Source](https://developers.cloudflare.com/rules/url-forwarding/)
  - **Free plan.** 10 single redirect rules, plus bulk redirects: 15 rules and 5 lists holding up to 10,000 addresses per account.
  - **$5 plan.** Same as free.
- **Transform Rules and Managed Transforms.** Rewrite web addresses or headers, the hidden labels on each request and response, for example to add security headers. [Source](https://developers.cloudflare.com/rules/transform/)
  - **Free plan.** 10 active Transform Rules, without pattern matching (regex). Managed Transforms, Cloudflare's ready-made header changes, are available.
  - **$5 plan.** Same as free.
- **Snippets.** Tiny bits of JavaScript that run on Cloudflare before a request reaches the site, like a mini Worker. [Source](https://developers.cloudflare.com/rules/snippets/)
  - **Free plan.** Not included.
  - **$5 plan.** Not part of the $5 plan. Needs Pro ($20 a month billed yearly, $25 monthly) for 25 Snippets, or Business for 50.
- **Web Analytics.** Visitor counts and page speed for a site, collected without cookies. [Source](https://developers.cloudflare.com/web-analytics/limits/)
  - **Free plan.** Free for any number of sites that run through Cloudflare, plus up to 10 that don't.
  - **$5 plan.** Same as free.
- **Zaraz.** Runs outside scripts like tracking pixels and analytics from Cloudflare instead of the reader's browser, and offers a consent banner. [Source](https://developers.cloudflare.com/zaraz/pricing-info/)
  - **Free plan.** 1 million events a month per account, with every feature on every plan.
  - **$5 plan.** Not part of the $5 plan. Zaraz Paid costs $5 per extra million events. Without it, going over switches Zaraz off until the next billing cycle.
- **Registrar and Registrar API** (beta). Sells domain names at cost. Its API, a way for programs to buy domains, is in beta. [Source](https://developers.cloudflare.com/registrar/)
  - **Free plan.** No markup, so the price is what the registry running each domain ending, like .com, charges. The plans page lists prices from $7.85, and the current .com price is unconfirmed. Owner details are hidden from public lookups by default. Dashboard purchases auto-renew by default.
  - **$5 plan.** Not tied to Workers. API purchases use the default payment method, can't be refunded and don't auto-renew by default.
- **Radar.** Cloudflare's public stats on internet traffic, attacks and AI bots, plus a tool that scans any web address. [Source](https://radar.cloudflare.com/)
  - **Free plan.** Free, both the website and the API.
  - **$5 plan.** Same as free.
- **Observatory** (beta). Runs Google Lighthouse speed tests on a site's pages and shows how fast it loads for real visitors. [Source](https://developers.cloudflare.com/speed/observatory/)
  - **Free plan.** Real-visitor speed tracking is on by default, excluding visitors from the European Economic Area, the UK and Switzerland. The number of free tests is unconfirmed.
  - **$5 plan.** Not part of the $5 plan. Pro gets 50 one-off and 5 recurring daily tests a month, Business 100 and 10.
- **Waiting Room.** A virtual queue that holds visitors back when too many people arrive at once. [Source](https://developers.cloudflare.com/waiting-room/plans/)
  - **Free plan.** Not included.
  - **$5 plan.** Not part of the $5 plan, and not on Pro either. Business ($200 a month billed yearly, $250 monthly) and Enterprise each include one basic waiting room.
- **Health Checks.** Cloudflare keeps pinging a site and sends an alert if it goes down. [Source](https://developers.cloudflare.com/health-checks/)
  - **Free plan.** Not included.
  - **$5 plan.** Not part of the $5 plan. Pro gets 10 health checks, Business 50.
- **Load Balancing.** Spreads traffic over several servers and skips any that are down. [Source](https://developers.cloudflare.com/load-balancing/)
  - **Free plan.** Not included. It's a paid add-on that any plan can buy, the free plan too.
  - **$5 plan.** Not part of the $5 plan. The add-on starts at $5 a month. How many servers that covers, and the price per extra server, are unconfirmed.
- **Spectrum.** Cloudflare's protection for services that aren't websites, like a game server or SSH (remote login to a server). [Source](https://developers.cloudflare.com/spectrum/protocols-per-plan/)
  - **Free plan.** Not included.
  - **$5 plan.** Not part of the $5 plan. On Pro and Business, a paid add-on covers one Minecraft or SSH app, price unconfirmed. Business also allows Windows Remote Desktop. Any other kind of app needs Enterprise.
- **Free, Pro and Business plans.** The plan each website is on, billed separately from the $5 Workers plan. It sets rule counts, security features and support. [Source](https://www.cloudflare.com/plans/network-cdn.md)
  - **Free plan.** $0. 70 rules plus 10,000 bulk redirects, blocking for simple bots, and help from community forums and docs.
  - **$5 plan.** A separate bill. The $5 plan doesn't upgrade it. Pro is $20 a month billed yearly or $25 monthly, Business $200 or $250.

</details>

<details><summary>Money (2)</summary>

- **AI Crawl Control and Pay per crawl** (Pay per crawl in closed beta). Shows which AI bots, like GPTBot and ClaudeBot, read a site and lets you allow, block or charge them per page. [Source](https://developers.cloudflare.com/ai-crawl-control/)
  - **Free plan.** Crawl Control is on every plan, free included. Pay per crawl, in closed beta, uses one price for a whole site or a price set per request, and chosen pages can stay free.
  - **$5 plan.** Same as free, since it's a site setting. Cloudflare handles the billing, but its cut and how it pays out are unconfirmed.
- **Agent payments (x402)** (partly beta). Lets AI agents pay small amounts per request, mostly in stablecoins (crypto pegged to the dollar). Not a checkout for people. [Source](https://developers.cloudflare.com/agents/tools/payments/)
  - **Free plan.** No free allowance listed. Cloudflare's own fees are unconfirmed.
  - **$5 plan.** Not priced in the $5 plan. The payment tools in Cloudflare's Agents SDK (x402 and MPP) work now. AI Gateway's Machine Payments is in beta for US-based users with a card on file, and Monetization Gateway is in closed beta.

</details>

<details><summary>Also worth knowing (16)</summary>

One agent checked these and none re-checked them, so treat the details as a starting point.

- **Worker Previews.** Every branch of a site's code except the main one, meaning each separate line of work, gets its own separate test copy, with its own address, settings and logs. [Source](https://developers.cloudflare.com/workers/previews/)
  - **Free plan.** Part of Workers and Workers Builds, with no separate price listed. Launched September 22, 2026.
  - **$5 plan.** Same as free.
- **Billable Usage dashboard and Budget alerts.** A daily view of what usage beyond the $5 plan costs, plus an email when spending passes a chosen dollar amount. [Source](https://developers.cloudflare.com/changelog/post/2026-04-13-billable-usage-dashboard-and-budget-alerts/)
  - **Free plan.** Free for pay-as-you-go accounts, added April 2026. A default alert has since rolled out.
  - **$5 plan.** Same as free.
- **Notifications and alerts.** Alerts by email or webhook, an automatic message to another app, for Cloudflare events like billing, security certificates and attacks, and for scheduled checks written in SQL, a database query language. [Source](https://developers.cloudflare.com/notifications/)
  - **Free plan.** Email and webhooks on every plan. Up to 100 webhook targets without a paid site plan.
  - **$5 plan.** Same as free. PagerDuty alerts, for on-call paging, need the Business plan or above.
- **DMARC Management.** Shows every service sending email as a domain, and whether its mail passes SPF, DKIM and DMARC, the checks against fake senders. [Source](https://developers.cloudflare.com/dmarc-management/)
  - **Free plan.** Available on all plans that use Cloudflare DNS. No price stated.
  - **$5 plan.** Same as free.
- **Security Center.** Scans an account for setup mistakes like DNS records pointing nowhere, a missing or broken DMARC record, and old versions of TLS, the encryption behind https. [Source](https://developers.cloudflare.com/security-center/get-started/)
  - **Free plan.** Security Insights runs on every plan.
  - **$5 plan.** Same as free. Brand Protection alerts need the Pro plan or above.
- **Leaked credentials detection.** Flags logins that use a password already exposed in a data breach. [Source](https://developers.cloudflare.com/waf/detections/leaked-credentials/get-started/)
  - **Free plan.** Free, and on by default on the free plan.
  - **$5 plan.** Same as free.
- **Flagship.** Switches that turn a feature on for some visitors, or a percentage of them, without putting out a new version of the site. [Source](https://developers.cloudflare.com/flagship/)
  - **Free plan.** Public beta since May 26, 2026. The docs publish no price.
  - **$5 plan.** Same as free.
- **Artifacts.** Git repositories, code folders with full history, hosted by Cloudflare. Workers can create them, standard git tools can push to them, and Workers Builds can deploy from them. [Source](https://developers.cloudflare.com/artifacts/platform/pricing/)
  - **Free plan.** Not included.
  - **$5 plan.** Includes 10,000 operations and 1 GB-month of storage (1 GB kept for a month), then $0.15 per 1,000 operations and $0.50 per GB-month. Billing starts November 12, 2026.
- **K2.** An event log. A program writes records, they're kept for a set time, and several separate readers can each work through them. [Source](https://developers.cloudflare.com/k2/)
  - **Free plan.** Not included.
  - **$5 plan.** Public beta. 10 GB per account during the beta, records kept for up to 30 days. No K2 price published.
- **Media over QUIC (MoQ).** Hosted relay servers that pass along live video and audio with very little delay. [Source](https://developers.cloudflare.com/moq/)
  - **Free plan.** Free during the beta. The price after that isn't stated.
  - **$5 plan.** Same as free.
- **Agent Memory.** Long-term memory for an AI agent that lasts across conversations, reached from a Worker. [Source](https://developers.cloudflare.com/agent-memory/)
  - **Free plan.** Private beta. No price stated.
  - **$5 plan.** Same as free.
- **Cloudflare CLI.** One command-line tool, cf, for the whole Cloudflare API. Over 2,900 commands, machine-readable JSON output, built for coding agents. [Source](https://developers.cloudflare.com/cf/)
  - **Free plan.** Free. In beta since September 28, 2026.
  - **$5 plan.** Same as free.
- **Cloudflare API MCP server.** Lets an AI agent call the full Cloudflare API directly through MCP, a common standard for connecting agents to tools. Lives at mcp.cloudflare.com. [Source](https://developers.cloudflare.com/agent-setup/claude-code/)
  - **Free plan.** Free. The account's own API permissions still apply.
  - **$5 plan.** Same as free.
- **Agent Lee.** An AI assistant in the Cloudflare dashboard that answers questions about the account and makes changes once the user approves them. [Source](https://developers.cloudflare.com/agent-lee/)
  - **Free plan.** Beta, offered to Free-plan accounts and some Enterprise customers.
  - **$5 plan.** Unclear. The docs don't say how the $5 plan accounts are treated.
- **Cloudflare Wallets.** Planned wallets for stablecoins, crypto tied to a currency like the dollar, for an account and its AI agents. [Source](https://developers.cloudflare.com/wallets/)
  - **Free plan.** Not launched. For now the only step is reserving a NAME.cloudflare.pay handle. Price and regions not stated.
  - **$5 plan.** Same as free.
- **Randomness Beacon.** Public random numbers that anyone can verify and no one can predict or rig. [Source](https://developers.cloudflare.com/randomness-beacon/)
  - **Free plan.** Public endpoints anyone can query. The Cloudflare page states no price.
  - **$5 plan.** Same as free.

</details>

*Claude Code researched this post against Cloudflare's docs and changelogs on November 2, 2026, and
four more agents tried to disprove the prices and limits in it, all but the last fold. A last check
on November 10 caught the model retirements.*
