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
  alt: "A bar chart of what one AI job costs on Cloudflare, from a tenth of a cent for a chat answer to 18 cents for 1,000 spoken words"
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

CATALOG

*Claude Code researched this post against Cloudflare's docs and changelogs on 2 November 2026, and
four more agents tried to disprove every price and limit in it.*
