---
id: "AO-080"
title: "Progress report on my 3D AI landscape page"
summary: "I had 40 AI agents research, fact-check and design a 3D page about the five big AI companies. The research and three working prototypes are done. The page itself isn't built yet."
date: 2026-11-11
topic: "agents"
draft: false
preview:
  verdict: "Researched, not built yet"
  takeaway: "40 AI agents finished the research, most of the fact-checking and three working 3D prototypes in about 4 hours. The page itself isn't built yet."
  points:
    - "About $390 at API list prices so far, my estimate. It ran on my subscription and paused at the weekly usage limit."
    - "Two judges split. Clarity picked \"follow the sentence\", craft picked \"Nine Floors\". Both want parts of all three."
    - "Research so far: the agent names I dictated are Claude Duet, dots, Grok Bot and Muse."
  image: "/media/previews/progress-report-on-my-3d-ai-landscape-page.webp"
  alt: "Five glass towers in pink, blue, orange, purple and green standing on a white floor that reads THE AI LANDSCAPE"
---

I asked Claude to build a new page for this site: an animated 3D snapshot of the five big AI companies, how each one's products are stacked in layers, and which one is best at what. **The research and three working design prototypes are done. The page itself isn't built yet.** I paused the job after about 4 hours because my Claude account was close to its weekly usage limit. By then 40 agents had worked on it, about $390 worth at API list prices by my estimate.

- **Ten researchers** covered Anthropic, OpenAI, Google, Meta and xAI, plus who's best at what, how people manage their agents, my own setup, this site's code and the design reference I gave it.
- **Every claim was checked by an agent that didn't write it.** Eight agents turned the research into data files, and eight more opened every cited source to check each claim. A red team (agents told to try to break the riskiest claims) finished one file, probably two, before the pause.
- **Three designers built three competing prototypes.** Each is a running 3D page, not a mockup.
- **Two of the four judges reported, and they disagree** on which design is best.
- **Nothing is on the site yet.** The last fact check, the build spec, the build and the review are still to come.

## What I asked for

I dictated a long request. The short version is a page about Anthropic, OpenAI, Google, Meta and xAI that's "visually completely different" from the rest of my site and shows "the different layers and how they're interconnected" with as few words as possible. Each company has its own mix of chat apps, voice, personal agents, coding agents and cloud computers, running on different models, and I can't keep up with it anymore. I pointed it at Shopify's Winter 2026 Editions page as the bar for design, and at my [Teardown Lab](/ledger/teardown-lab/) post for how much a page can explain with pictures.

I also asked for a dated snapshot. The next time I do this the old one stays up at its own date.

## How it ran

The main agent was an orchestrator. It plans and hands out work and does none of it itself. Opus 5.5 ran most of the jobs. Fable 5.2, which sits above Opus 5.5, ran the orchestrator, the format for the data and the three designs. Everyone worked at a high reasoning setting.

1. **Research.** Ten agents, one subject each.
2. **A fact base.** One agent designed the format, where every claim carries its source and a date. Eight agents wrote one data file each. Eight more re-checked every claim by opening its source. Then a red team went after the 20 highest-stakes claims in each file.
3. **Design.** Three designers, each with a different idea, each built a running prototype and took screenshots. Then four judges, each with one lens. Comprehension asks whether a newcomer gets it. Craft asks whether a design jury would rate it. Feasibility asks whether it can be built on this site. Owner fit asks whether it's what I asked for.
4. **Build, review, land.** Not started.

| Phase | State at the pause |
|---|---|
| Research, 10 agents | Done |
| Fact base: format, 8 data files, every claim source-checked | Done |
| Red team on the riskiest claims | Done for Anthropic, probably for OpenAI, interrupted for Google, Meta, xAI and best-at |
| Merge into one data file | Not started |
| Three designs with running prototypes | Done |
| Judges | Comprehension and craft reported, feasibility and owner fit interrupted |
| Build spec, build, review, pull request | Not started |

## The three designs

All three use the same trick. Every company gets the same nine layers in the same order, from the app you open at the top, down through voice, the agent, the harness (the loop that gives a model its tools), the model, its tools, the computer it works on, who it hands work to, and memory. A layer a company doesn't have shows up as a gap you can see.

These are prototype screenshots. Their labels came from the fact base before the last check, so treat them as placeholders.

**Nine Floors.** It opens as a flat poster of five coloured marks. The camera tilts and each mark turns out to be the top of a glass tower nine floors deep. You hover a floor to light it in all five towers, pull one tower apart, and turn the lights out to see whose model is actually doing the thinking.

<figure><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/machine-opening.webp" alt="Five glass towers in pink, blue, orange, purple and green, tilted in perspective over a white floor with THE AI LANDSCAPE printed across it" loading="lazy"><figcaption>Nine Floors: the poster tilts into five towers</figcaption></figure>

<div class="gallery-280">
<figure class="flush"><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/machine-line-up.webp" alt="The five towers side by side under the heading FIVE COMPANIES. THE SAME NINE FLOORS, with the nine layer names on the left" loading="lazy"><figcaption>The line-up, one floor per layer</figcaption></figure>
<figure class="flush"><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/machine-x-ray.webp" alt="One green tower pulled apart into nine labelled floors in a dark room, with the words GROK BOT behind it and a red glow on the model floor" loading="lazy"><figcaption>X-ray: the lights go out and the room takes the colour of the model doing the work</figcaption></figure>
</div>

**Residents.** The AI landscape drawn as a real landscape. Five sea stacks stand in a sea of cloud at dusk, and on top of each one stands its personal agent as a little porcelain figure in its company's colour. Its first line is the best of the three: "You talk to the one on top. Scroll to see what it stands on."

<div class="gallery-280">
<figure class="flush"><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/residents-opening.webp" alt="Five small porcelain figures standing on ringed stone stacks in a pink and purple sky, under the title AI Landscape" loading="lazy"><figcaption>Residents: five agents, each on its own stack</figcaption></figure>
<figure class="flush"><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/residents-stack.webp" alt="One stack opened into nine glowing blue layers with labels from Surface down to Memory, and a list of jobs to send through it" loading="lazy"><figcaption>One stack opened up, with a job running down through it</figcaption></figure>
</div>

**Follow the sentence.** You say one sentence: "Fix the typo on my homepage and tell me when it's live." A red thread carries it off a paper table, down through the nine floors and back up with the answer. When it leaves one company's tower for another's, you see whose model did your work.

<figure><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/request-opening.webp" alt="Glass plates in five colours on a cream table, a red thread dropping from a quoted sentence into one of them, and the words You say one sentence. Here's where it goes." loading="lazy"><figcaption>Follow the sentence: one request, five companies</figcaption></figure>

<div class="gallery-280">
<figure class="flush"><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/request-model-floor.webp" alt="A dark floor labelled Model with a glowing teal plate, and a purple arc running from it to another company's plate" loading="lazy"><figcaption>The model floor: the arc shows the work leaving the building</figcaption></figure>
<figure class="flush"><img class="fill soft" src="/media/progress-report-on-my-3d-ai-landscape-page/request-line-up.webp" alt="Five columns of glass plates, nine rows deep, under a curved horizon, each row named on the left from Interface to Memory" loading="lazy"><figcaption>The line-up: five companies by nine layers</figcaption></figure>
</div>

### What the judges said

- **Comprehension put "follow the sentence" first** with a score of 8.0, then Nine Floors at 7.5 and Residents at 5.0. It's the only one where scrolling alone teaches you what each layer is.
- **Craft put Nine Floors first** with 8.0, then "follow the sentence" at 6.5 and Residents at 6.0. Nine Floors has the strongest look. "Follow the sentence" has the best single idea, a lens under your cursor that shows the inside of a tower.
- **Both want the final page to borrow from all three.** Even Residents, last on both lists, has parts both judges want to keep. The other two judges were cut off by the pause, and the director agent that picks and writes the build spec hadn't started.

## What the research found so far

These are from the research as of 10 November 2026. Every claim was checked against its cited source, but the red team didn't finish, so none of this is final. The page will only show the claims that survive the full check.

- **The names I dictated.** I said "the Duel", "Dots", "Grokbot" and "Muse". They're Claude Duet (Anthropic, a research preview since 21 October, US only, with a waitlist), dots (OpenAI, out since 29 September), Grok Bot (xAI) and Muse, which at Meta is a model family, the personal agent app and Muse Code all at once. Google's agent is Gemini Spark, reported to be renamed Tasks in Gemini.
- **You can't always tell whose model you're talking to.** Grok Bot has no model picker. xAI's docs say it picks a model for each request and doesn't show you which, and a Cursor help page names Claude Opus 5.5 as one of the routes. The first draft said Grok Bot "uses" Opus 5.5. The checker cut that back to "may route to", because that's all the sources say. That one matters to me, since a Grok bot is the agent I talk to.
- **Best at what.** Claude Code leads coding on scores, but Codex is far cheaper per task. Computer use (an AI working a screen with a mouse and keyboard) is contested. One independent test favours OpenAI, and the companies' own benchmark tables favour Anthropic. Searching X is Grok, clearly.
- **The "DeepSeek Super Agent paper" I mentioned isn't a paper.** It's a long X post from 1 November with a prototype repo. Its key line is "Workers never interact with humans directly", which is the setup I'm moving toward.

## What it cost so far

Measured from the agents' own transcripts, up to the pause:

- **40 agents, 4.2 million output tokens, about 4 hours.** They ran side by side, so it adds up to about 19 hours of agent time.
- **Opus 5.5 wrote 76.5% of the output** across 34 agents. Fable 5.2 wrote 23.5% across the orchestrator and four agents. One small helper ran on Haiku 5.5.
- **The biggest number is 770 million cache-read tokens.** Every turn, an agent re-reads its whole conversation so far, mostly from a cache. That's about $154 of the estimate.
- **About $390 at API list prices.** That's an estimate. The work ran on my Claude subscription, where the real cost was a share of the weekly usage limit, which is also why it stopped.

<ao-bars unit="k">
<table><thead><tr><th>Phase</th><th>Output tokens (thousands)</th></tr></thead>
<tbody>
<tr><td>Research, 10 agents</td><td>763</td></tr>
<tr><td>Data format, 1 agent</td><td>174</td></tr>
<tr><td>Data files, 8 agents</td><td>1184</td></tr>
<tr><td>Source checks, 8 agents</td><td>786</td></tr>
<tr><td>Red team, 4 agents (2 cut off)</td><td>227</td></tr>
<tr><td>Three designs, 3 agents</td><td>745</td></tr>
<tr><td>Judges, 4 agents (2 cut off)</td><td>252</td></tr>
<tr><td>Orchestrator and 1 helper</td><td>70</td></tr>
</tbody></table>
<figcaption><b>Where the 4.2 million output tokens went</b><span class="ao-meta">by phase, up to the pause</span></figcaption>
</ao-bars>

The three designers were the most expensive single agents, 214,000 to 297,000 output tokens each over 70 to 85 minutes.

<details><summary>The prices and the arithmetic</summary>

| Model | Agents | Output | Cache writes | Cache reads | Uncached input | Estimate |
|---|---|---|---|---|---|---|
| Opus 5.5 | 34 | 3,211,682 | 13,994,294 | 657,397,995 | 5,089 | $265.71 |
| Fable 5.2 | 5 | 985,838 | 5,900,060 | 112,508,747 | 621 | $120.94 |
| Haiku 5.5 | 1 | 3,067 | 26,436 | 4,015 | 4 | under 1 cent |
| Total | 40 | 4,200,587 | 19,920,790 | 769,910,757 | 5,714 | about $387 |

Prices are per million tokens, from Anthropic's API price list in early November 2026.

- **Opus 5.5:** $4 input, $20 output, $5 cache writes, $0.20 cache reads. That's $64 of output, $70 of cache writes and $131 of cache reads.
- **Fable 5.2:** $8 input, $40 output, $10 cache writes, $0.20 cache reads. That's $39 of output, $59 of cache writes and $23 of cache reads.
- **Haiku 5.5:** $0.10 input, $0.50 output. Its cache prices aren't in the price list I used, so its cache tokens are left as tokens. Its share is a fraction of a cent either way.

The cache write prices are for the 5-minute cache, 1.25 times the input price. If every write was the one-hour kind ($8 for Opus, $16 for Fable), the total would be about $464. Real elapsed time was 238 minutes. The agents' clocks add up to about 1,150 minutes because they overlapped.

</details>

## What's left

1. Finish the red team on Google, Meta, xAI and best-at, then merge everything into one data file.
2. Run the last two judges, then a director agent writes the build spec.
3. Build it. One builder lays the foundation, then several work in parallel, then one puts it together.
4. Review until nothing's left to fix: whether a newcomer gets it, craft and motion, phones, speed, accessibility, and every word on the page traced back to the data file.
5. It lands as a pull request, and I merge it.

The facts are dated 10 November, and the leaders changed twice in the two weeks before that. If too many days pass before the build, the agents either keep the snapshot dated 10 November as gathered or re-check everything and re-date it. No mixing.

## What the finished page will be

It'll live at `/ai-landscape` and show the newest snapshot, with every older one kept at its own dated address, the way my [Now page](/now/) works. Five companies with the same nine layers each, every personal agent, and who's best at what with a date on every call. Previews are labelled as previews and contested calls are shown as contested. It ends with how people wire these together, using my own setup as the example: a Grok bot I talk to, Claude Code doing the coding, and the storage, keys and cloud GPUs around them. The look is original, with its own marks for each company and no logos.

*Claude drafted this post from the job's hand-off notes, the two judges' reports and the measured agent table.*
