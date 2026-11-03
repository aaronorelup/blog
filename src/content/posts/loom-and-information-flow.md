---
id: "AO-041"
title: "Claude's 40-minute video lesson on how language models work"
summary: "Claude made eight short videos and two tools you can try, from one request. They explain two ideas by the writer janus: her tool Loom, and how information moves inside a language model."
date: 2026-10-07
topic: "learning"
project: []
preview:
  verdict: "40 minutes, no human edits"
  takeaway: "153 Claude agents turned one request into a 40-minute lesson with two working tools in about four and a half hours, and nobody edited it before it went up."
  points:
    - "The checks caught real errors before narration, like a wrong start date for Loom."
    - "Mini Loom lets you steer stories grown by a small AI model and counts your choices in bits."
    - "janus didn't review it. The videos simplify, and the stories come from a model far smaller than Loom was built for."
  image: "/media/previews/loom-and-information-flow.webp"
  alt: "Title card of video 2.2, The K/V stream, with a small grid over the words You, are, absolutely and purple arrows carrying information sideways"
---

I asked Claude to explain two sets of ideas by janus, a writer who posts as
[@repligate](https://x.com/repligate). One is Loom, her tool for exploring the many ways a
language model could continue a piece of text. The other is
[her thread on how information moves through a transformer](https://x.com/repligate/status/1965960676104712451),
the design inside today's language models.

From that one request, 153 Claude agents made **eight short narrated videos, 40 minutes in all,
and two tools you can try**, in about four and a half hours. Nobody edited any of it before it went
up, me included, and janus didn't review it. The ideas are all hers.

- **The checks caught real mistakes before narration**, like a wrong start date for Loom.
- **Mini Loom** lets you steer stories grown by a small AI model and counts your choices in bits.
- **The Information Flow Explorer** makes her transformer diagram clickable.
- **The videos simplify**, and the stories come from a much smaller model than Loom was built for.

A few days later I rebuilt my course on building with AI,
[The Hidden Curriculum](/courses/the-hidden-curriculum/), and pointed at this as
[the one lesson that had worked](/ledger/curriculum-from-sources/). It was built on someone else's
hard work, and we only had to deliver it.

## Part 1: Loom

At every step, a language model gives odds for each possible next token, a word or piece of a
word. One gets drawn, like rolling a weighted die. So a single prompt grows into a tree of possible
stories, which janus calls a multiverse. Loom lets you walk around in it.

### 1.1 One prompt, many futures

What a base model puts out. That's a model trained only to continue text, with no chat training.

<ao-transcript find="sampl|token|multiverse">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-1-one-prompt-many-futures.webp" src="/media/loom-and-information-flow/1-1-one-prompt-many-futures.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-1-one-prompt-many-futures.vtt"></video><figcaption><b>1.1 · One prompt, many futures</b><span class="ao-meta">5:10 · 689 words · narrated by RClayton (ElevenLabs) · 11.8 MB</span></figcaption></figure>
</ao-transcript>

### 1.2 Loom: an interface to the multiverse

Where Loom came from and how it works.

<ao-transcript find="Loom|tree|GPT-3">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-2-loom.webp" src="/media/loom-and-information-flow/1-2-loom.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-2-loom.vtt"></video><figcaption><b>1.2 · Loom: an interface to the multiverse</b><span class="ao-meta">4:59 · 668 words · narrated by RClayton (ElevenLabs) · 11.2 MB</span></figcaption></figure>
</ao-transcript>

### 1.3 Bits of selection

How picking branches steers the model. One pick out of four is two bits.

<ao-transcript find="bits|steer|manual">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-3-bits-of-selection.webp" src="/media/loom-and-information-flow/1-3-bits-of-selection.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-3-bits-of-selection.vtt"></video><figcaption><b>1.3 · Bits of selection</b><span class="ao-meta">5:04 · 670 words · narrated by RClayton (ElevenLabs) · 12.5 MB</span></figcaption></figure>
</ao-transcript>

### 1.4 Weaving with a base model

The Cyborgism idea from Nicholas Kees Dupuis and janus, where you keep the goal and a base model
supplies the options.

<ao-transcript find="cyborg|simulat|Mini Loom">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-4-weaving.webp" src="/media/loom-and-information-flow/1-4-weaving.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-4-weaving.vtt"></video><figcaption><b>1.4 · Weaving with a base model</b><span class="ao-meta">5:11 · 683 words · narrated by RClayton (ElevenLabs) · 13.1 MB</span></figcaption></figure>
</ao-transcript>

### Try it: Mini Loom

A small base model, Qwen3 1.7B Base, grew these story trees ahead of time, four branches at every
fork. You pick, go back and branch again, and a meter counts your bits of selection.

<ao-game src="/labs/mini-loom/" poster="/media/loom-and-information-flow/mini-loom-poster.webp" size="about 1.5 MB" label="Mini Loom, a small Loom with trees grown by a real base model" note="Click, or use the keys: 1–4 choose, arrows move, T token view, M map. The live model is optional and downloads only if you ask (about 125–395 MB, depending on your device)."><a href="/labs/mini-loom/">Open Mini Loom</a></ao-game>

<details><summary>Four things to try in Mini Loom</summary>

1. **Pick the most surprising branch every time** and watch where the story goes.
2. **Go back to the start and take a different first branch.** Same prompt, a different world.
3. **Find a narrow fork and a wide one.** A label above the cards tells you which. Turn on the
   token view (T) and hover the words to see why.
4. **Compare your bits with the model's words** in the meter after four or more choices. Press 1
   at every fork to go deepest, eight choices.

</details>

## Part 2: How information flows through a transformer

janus draws a transformer as a grid. Each column is a token and each row is a layer, one of the
model's stacked processing steps. Information climbs each column through the residual stream, a
running total that every layer adds to. It also moves sideways through keys and values, which each
token reads from the tokens before it in a step called attention.

### 2.1 The grid and the residual stream

Her grid, and the highway up each column.

<ao-transcript find="residual|layer|column">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-1-the-grid.webp" src="/media/loom-and-information-flow/2-1-the-grid.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-1-the-grid.vtt"></video><figcaption><b>2.1 · The grid and the residual stream</b><span class="ao-meta">4:54 · 701 words · narrated by Adrian (ElevenLabs) · 10.7 MB</span></figcaption></figure>
</ao-transcript>

### 2.2 The K/V stream

The second highway, carrying information sideways from earlier tokens.

<ao-transcript find="K/V|query|cache">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-2-the-kv-stream.webp" src="/media/loom-and-information-flow/2-2-the-kv-stream.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-2-the-kv-stream.vtt"></video><figcaption><b>2.2 · The K/V stream</b><span class="ao-meta">4:50 · 704 words · narrated by Adrian (ElevenLabs) · 10.9 MB</span></figcaption></figure>
</ao-transcript>

### 2.3 Counting the paths

How many routes run between two points in the grid. For a real model, more than the atoms in the
observable universe.

<ao-transcript find="route|steps|atoms">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-3-counting-paths.webp" src="/media/loom-and-information-flow/2-3-counting-paths.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-3-counting-paths.vtt"></video><figcaption><b>2.3 · Counting the paths</b><span class="ao-meta">4:52 · 680 words · narrated by Adrian (ElevenLabs) · 11.6 MB</span></figcaption></figure>
</ao-transcript>

### 2.4 Time slices and the way down

The orders the work can happen in, the one route back down, and a tour of the Explorer.

<ao-transcript find="slice|token|introspect">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-4-time-and-the-way-down.webp" src="/media/loom-and-information-flow/2-4-time-and-the-way-down.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-4-time-and-the-way-down.vtt"></video><figcaption><b>2.4 · Time slices and the way down</b><span class="ao-meta">4:58 · 711 words · narrated by Adrian (ElevenLabs) · 13.4 MB</span></figcaption></figure>
</ao-transcript>

### Try it: Information Flow Explorer

Her diagram, made clickable. Its six modes go from what can reach what to real attention numbers
from GPT-2 small, an older OpenAI model.

<ao-game src="/labs/info-flow/" poster="/media/loom-and-information-flow/info-flow-poster.webp" size="about 0.1 MB" label="Information Flow Explorer, after janus's diagram" note="Keys 1–6 switch modes. Works with a mouse, touch or the keyboard."><a href="/labs/info-flow/">Open the Information Flow Explorer</a></ao-game>

<details><summary>Five things to try in the Explorer</summary>

1. **In Reach (tab 2), click a cell in the middle** and count its two cones. Then turn on
   "generating" and see what the newly written token adds.
2. **In Paths (tab 3), press "janus's example"** and step through her three routes. Then scale it
   up to a real model.
3. **In Time slices (tab 4), schedule the grid yourself.** Try to finish in fewer steps than her
   diagonal slices.
4. **In Inside one cell (tab 5), pick "Sarah lent Tom her bike because he"** and look for a head
   where "he" looks at "Tom". A head is one of the 12 parallel attention units in each layer of
   GPT-2 small, and these are its real attention weights.
5. **Do the puzzles.** Each answer shows the route, or why there isn't one.

</details>

## How Claude made and checked it

Claude's agents researched, wrote, fact-checked and narrated it, then animated the videos in code
on the engine built for my course. That was the day after Claude made me
[an explainer of its own hidden watermark](/ledger/claude-text-watermark/).

The checks caught two mistakes before narration. The plan called her diagonal time slices "the
fastest legal order" for working through the grid, but reading a prompt layer by layer takes fewer
steps. And a script dated Loom to 2021, when her own posts put the start in late 2020. A last
check fixed a wrong sentence in video 1.4 and made Mini Loom usable on phones.

<details><summary>My request, the six steps and the agent counts</summary>

**The request.** One message. Explain what Loom is and how janus explains the way information
flows through transformers, in about 40 minutes of video, half on each. Two tools people can use.
Credit to her throughout. Up to seven Opus 5.5 agents at a time, and finish without my feedback.

1. **Research.** Five agents read her thread and tweets, the Cyborgism post, her generative.ink
   essays and the Loom code, and looked into models that can run in a browser and the engine the
   videos would be made with.
2. **A plan.** The session that ran the agents wrote one plan for all of them. It set what each
   video must cover, the words to use, the credit rules, and colors taken from her diagram.
3. **Scripts.** One agent per video wrote the script and storyboard. A second agent checked every
   claim against the sources and fixed what was wrong, before anything was narrated. An editor
   read all eight together, removed repetition and cut them to length. The fact-checkers
   re-fetched the published model settings behind the numbers on screen.
4. **Narration.** ElevenLabs, an AI voice service, with two voices, RClayton for part 1 and Adrian
   for part 2. 33,933 characters, including two sections narrated again after the last check. Each
   section was transcribed back and compared with its script.
5. **Animation.** A designer agent drew the shared pieces: the grid after her diagram, the Loom
   tree, the title and summary cards. Then one agent per scene animated it in code, and one agent
   did each video's opening and closing cards. A reviewer checked each video against its
   narration from stills taken every 1.5 seconds. Fix passes followed, and a last check came
   before each render.
6. **Tools.** One agent built each tool. Mini Loom's four trees, 608 grown passages each, were
   grown with Qwen3 1.7B Base on my laptop's graphics card in eight runs. They held it for about
   45 minutes in all, rejected attempts included. The Explorer's attention numbers come from
   GPT-2 small. Each tool was reviewed and fixed twice.

**The counts.** 153 agents plus the session that directed them, all Claude Opus 5.5, never more
than seven at once.

- 5 for research
- 21 for scripts, fact-checks and editing
- 8 for narration
- 97 for design, animation, review and rendering
- 17 for the tools
- 5 for the last check

Nine of them were stopped and run again. Seven reran because the first run was stopped within a
minute to fix the order of its steps. Two reran because a bug stopped the second run after
narration. Together they wrote about 5.3 million output tokens. Their working time adds up to about 25
hours. They ran in parallel, so the whole job took about four and a half hours from my request
to publishing.

</details>

<details><summary>Everything the checks caught, and two bugs in the run</summary>

- The time-slice mistake was caught by the agent building the Explorer and the agent writing
  script 2.4, both before narration. The 2021 date was fixed before narration too.
- The Explorer's first version said nothing below and to the left of a point could reach it. That
  is false, and a reviewer caught it.
- Video 1.4 described a bar in Mini Loom wrongly. The sentence was narrated again and the video
  rendered again.
- Mini Loom couldn't be used inside the post on a phone. It now offers its own tab or full screen
  when the frame is too small.
- The script that ran the agents read the narrators' routine mention of their quota as a failure,
  so all eight videos stopped after narration. They were restarted from the narrated files, so no
  narration was paid for twice.
- One render failed on an error in a scene. It was fixed before the video shipped.

</details>

## Limits

- **The videos simplify**, and they say where today's models differ from her picture.
- **The trees came from a small model.** The ones Loom was built for were far larger.

<details><summary>More on both</summary>

- Where her thread simplifies the order of steps inside a layer, the videos follow the standard
  design.
- Many of today's models share keys and values across attention heads, the parallel units inside
  each attention step. That makes the sideways channel narrower than in her description.
- Qwen3 1.7B Base, which grew the trees, has 1.7 billion parameters, the numbers a model learns in
  training. The live model that can run in your browser is smaller still.

</details>

## Sources

<details><summary>Her writing and everything else the lesson used</summary>

**By janus (@repligate)**

- [How information flows through transformers](https://x.com/repligate/status/1965960676104712451), thread, September 2025
- [On KV caching and introspection](https://x.com/repligate/status/1963460961744163145), September 2025, which that thread quotes
- [Loom's origin story, continued](https://x.com/repligate/status/1775842616099434496), April 2024
- [Appendix: Testimony of a Cyborg](https://www.lesswrong.com/posts/bxt7uCiHam4QXrQAA/cyborgism#Appendix__Testimony_of_a_Cyborg), in [Cyborgism](https://www.lesswrong.com/posts/bxt7uCiHam4QXrQAA/cyborgism) by Nicholas Kees Dupuis and janus, LessWrong, February 2023
- [Loom](https://github.com/socketteer/loom) on GitHub
- On generative.ink: [Language models are multiverse generators](https://generative.ink/posts/language-models-are-multiverse-generators/) (January 2021), [Loom: interface to the multiverse](https://generative.ink/posts/loom-interface-to-the-multiverse/) (February 2021), [Quantifying curation](https://generative.ink/posts/quantifying-curation/) (July 2021), and the [Loom of Time manual](https://generative.ink/loom/toc/)
- [Simulators](https://www.lesswrong.com/posts/vJFdjigzmcXMhNTsx/simulators) (September 2022) and [Mysteries of mode collapse](https://www.lesswrong.com/posts/t9svvNPNmFf5Qa3TA/mysteries-of-mode-collapse) (November 2022), LessWrong

**Also used**

- [Foliations and coordinates on causal graphs](https://www.wolframphysics.org/technical-introduction/the-updating-process-for-string-substitution-systems/foliations-and-coordinates-on-causal-graphs/), Wolfram Physics Project, which her thread links
- [The post her KV-caching tweet quotes](https://x.com/lefthanddraft/status/1961299143080743212), by @lefthanddraft, August 2025
- [Emergent introspective awareness in large language models](https://transformer-circuits.pub/2025/introspection/index.html), Anthropic, October 2025
- Model settings: [GPT-2 small](https://huggingface.co/openai-community/gpt2/blob/main/config.json), [Llama 3.1 8B](https://huggingface.co/unsloth/Meta-Llama-3.1-8B/blob/main/config.json), [70B](https://huggingface.co/unsloth/Meta-Llama-3.1-70B/blob/main/config.json), [405B](https://huggingface.co/unsloth/Meta-Llama-3.1-405B-bnb-4bit/blob/main/config.json), public copies of Meta's files. And the paper on [grouped-query attention](https://arxiv.org/abs/2305.13245), the way of sharing keys and values across heads.
- Models in the tools: [Qwen3 1.7B Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base) for the pre-grown trees, [SmolLM2](https://huggingface.co/onnx-community/SmolLM2-360M-ONNX) through [transformers.js](https://github.com/huggingface/transformers.js) for the live model, and [GPT-2 small](https://huggingface.co/openai-community/gpt2) for the attention data

</details>
