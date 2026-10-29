---
id: "AO-041"
title: "Claude made a 40-minute lesson on Loom and how information flows through transformers"
summary: "Eight narrated videos and two tools that run in the browser, made by Claude Opus 5.5 agents in one session from the writing of janus (@repligate): Loom, her interface for exploring a language model's many possible continuations, and her thread on how information moves through a transformer. The ideas are hers. Try the lesson and judge how well it explains them."
date: 2026-10-07
status: "shipped"
tags: ["claude", "agents", "interactive", "transformers", "loom", "lessons"]
series: ["agent-runs"]
---

This is a lesson Claude (Opus 5.5) made from one request. It explains two sets of ideas by
janus, who posts as [@repligate](https://x.com/repligate):

- **Loom**, her interface for exploring the branching tree of a language model's possible
  continuations, and the way of working it grew out of.
- Her thread **[How information flows through transformers](https://x.com/repligate/status/1965960676104712451)**
  (September 2025): the residual stream, the K/V stream, the routes between two points in the
  network, and what the architecture allows.

The ideas are hers. Claude's job was to make them easier to follow. It made eight videos,
39 minutes 59 seconds in all, and two tools. Watch them, try the tools, and decide how well it did.

**How to use this page.** Each video has its transcript under it: search it, or click a line
to play from there. Each part ends with a tool. The videos build on each other, but each one
starts by saying what it covers, so you can start anywhere.

## Part 1: Loom

### 1.1 One prompt, many futures

What a base model actually produces, and why janus calls the result a multiverse.

<ao-transcript find="sampl|token|multiverse">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-1-one-prompt-many-futures.webp" src="/media/loom-and-information-flow/1-1-one-prompt-many-futures.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-1-one-prompt-many-futures.vtt"></video><figcaption><b>1.1 · One prompt, many futures</b><span class="ao-meta">5:10 · 689 words · narrated by RClayton (ElevenLabs) · 11.8 MB</span></figcaption></figure>
</ao-transcript>

### 1.2 Loom: an interface to the multiverse

What Loom is, where it came from, and how its interface works.

<ao-transcript find="Loom|tree|GPT-3">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-2-loom.webp" src="/media/loom-and-information-flow/1-2-loom.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-2-loom.vtt"></video><figcaption><b>1.2 · Loom: an interface to the multiverse</b><span class="ao-meta">4:59 · 668 words · narrated by RClayton (ElevenLabs) · 11.2 MB</span></figcaption></figure>
</ao-transcript>

### 1.3 Bits of selection

How choosing between branches steers a model, and why janus counts that steering in bits.

<ao-transcript find="bits|steer|manual">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-3-bits-of-selection.webp" src="/media/loom-and-information-flow/1-3-bits-of-selection.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-3-bits-of-selection.vtt"></video><figcaption><b>1.3 · Bits of selection</b><span class="ao-meta">5:04 · 670 words · narrated by RClayton (ElevenLabs) · 12.5 MB</span></figcaption></figure>
</ao-transcript>

### 1.4 Weaving with a base model

What the Cyborgism post by Nicholas Kees Dupuis and janus means by working inside a loop with a
base model, and a tour of Mini Loom.

<ao-transcript find="cyborg|simulat|Mini Loom">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/1-4-weaving.webp" src="/media/loom-and-information-flow/1-4-weaving.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/1-4-weaving.vtt"></video><figcaption><b>1.4 · Weaving with a base model</b><span class="ao-meta">5:11 · 683 words · narrated by RClayton (ElevenLabs) · 13.1 MB</span></figcaption></figure>
</ao-transcript>

### Try it: Mini Loom

A small Loom. The trees were grown ahead of time by a base model, Qwen3 1.7B Base, four branches
at every fork. You choose, go back, and branch again; the meter counts your bits of
selection against the model's words. A smaller model can also run live in your browser if you
want to grow your own branches.

<ao-game src="/labs/mini-loom/" poster="/media/loom-and-information-flow/mini-loom-poster.webp" size="about 1.5 MB" label="Mini Loom, a small Loom with trees grown by a real base model" note="Click, or use the keys: 1–4 choose, arrows move, T token view, M map. The live model is optional and downloads only if you ask (about 125–395 MB, depending on your device)."><a href="/labs/mini-loom/">Open Mini Loom</a></ao-game>

Four things to try:

1. **Pick the most surprising branch every time** and watch where the story goes.
2. **Go back to the root and take a different first branch.** Same prompt, a different world.
3. **Find a narrow fork and a wide one.** A label above the cards says which. Turn on the token
   view (T) and hover the words to see why.
4. **Compare your bits with the model's words** in the meter after four or more choices. Press 1
   at every fork to go deepest: eight choices.

## Part 2: How information flows through a transformer

### 2.1 The grid and the residual stream

The picture janus draws: one column per token, one row per layer, and the vertical highway.

<ao-transcript find="residual|layer|column">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-1-the-grid.webp" src="/media/loom-and-information-flow/2-1-the-grid.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-1-the-grid.vtt"></video><figcaption><b>2.1 · The grid and the residual stream</b><span class="ao-meta">4:54 · 701 words · narrated by Adrian (ElevenLabs) · 10.7 MB</span></figcaption></figure>
</ao-transcript>

### 2.2 The K/V stream

The second highway: the keys and values that carry information sideways from earlier positions.

<ao-transcript find="K/V|query|cache">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-2-the-kv-stream.webp" src="/media/loom-and-information-flow/2-2-the-kv-stream.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-2-the-kv-stream.vtt"></video><figcaption><b>2.2 · The K/V stream</b><span class="ao-meta">4:50 · 704 words · narrated by Adrian (ElevenLabs) · 10.9 MB</span></figcaption></figure>
</ao-transcript>

### 2.3 Counting the paths

How many routes information can take between two points in the grid, and how fast that number
grows.

<ao-transcript find="route|steps|atoms">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-3-counting-paths.webp" src="/media/loom-and-information-flow/2-3-counting-paths.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-3-counting-paths.vtt"></video><figcaption><b>2.3 · Counting the paths</b><span class="ao-meta">4:52 · 680 words · narrated by Adrian (ElevenLabs) · 11.6 MB</span></figcaption></figure>
</ao-transcript>

### 2.4 Time slices and the way down

The orders the computation can happen in, the one route back down, and a tour of the
Information Flow Explorer.

<ao-transcript find="slice|token|introspect">
<figure><video controls playsinline preload="none" poster="/media/loom-and-information-flow/2-4-time-and-the-way-down.webp" src="/media/loom-and-information-flow/2-4-time-and-the-way-down.mp4"><track kind="captions" srclang="en" label="English" src="/media/loom-and-information-flow/2-4-time-and-the-way-down.vtt"></video><figcaption><b>2.4 · Time slices and the way down</b><span class="ao-meta">4:58 · 711 words · narrated by Adrian (ElevenLabs) · 13.4 MB</span></figcaption></figure>
</ao-transcript>

### Try it: Information Flow Explorer

A clickable version of her diagram, redrawn here: a grid of positions and layers, in her
colours. Six modes: the two highways, what can reach what, the routes from A to B with exact
counts, the time slices (and a game where you schedule the grid yourself), one attention step
with real numbers from GPT-2 small, and puzzles.

<ao-game src="/labs/info-flow/" poster="/media/loom-and-information-flow/info-flow-poster.webp" size="about 0.1 MB" label="Information Flow Explorer, after janus's diagram" note="Keys 1–6 switch modes. Works with a mouse, touch or the keyboard."><a href="/labs/info-flow/">Open the Information Flow Explorer</a></ao-game>

Five things to try:

1. **In Reach (tab 2), click a cell in the middle** and count its two cones. Then turn on
   "generating" and see what the sampled token adds.
2. **In Paths (tab 3), press "janus's example"** and step through her three routes. Then scale it up
   to a real model.
3. **In Time slices (tab 4), schedule the grid yourself.** Try to finish in fewer steps than her
   diagonal slices.
4. **In Inside one cell (tab 5), pick "Sarah lent Tom her bike because he"** and look for a head
   where "he" attends to "Tom". These are attention weights from GPT-2 small.
5. **Do the puzzles.** Each answer shows the route, or why there isn't one.

## What was done

**The request.** One message from Aaron: explain what Loom is, and how janus explains the way
information flows through transformers. About 40 minutes of video, half on each. Two tools
readers can use. One post, written in a neutral, brief voice that says what was done and asks
the reader to try it. Credit to her throughout. Up to seven Opus 5.5 agents at a time. Finished
without his feedback.

**How it was made.**

1. **Research.** Five agents read her thread and tweets, the Cyborgism post, her generative.ink
   essays and the Loom repository, and looked into models that can run in a browser and the
   engine the videos would be made with.
2. **A plan.** The session that ran the agents wrote one plan for all of them: what each video
   must cover, the words to use, the credit rules, and colours taken from her diagram.
3. **Scripts.** One agent per video wrote the script and storyboard. A second agent checked every
   claim against the sources and fixed what was wrong, before anything was narrated. An editor
   read all eight together, removed repetition, and cut them to length. The fact-checkers
   re-fetched the published model configurations behind the numbers on screen.
4. **Narration.** ElevenLabs, two voices: RClayton for part 1, Adrian for part 2. 33,933
   characters, including two sections narrated again after the last check. Each section was transcribed back and compared with its script.
5. **Animation.** A designer drew the shared pieces: the grid after her diagram, the Loom tree,
   the title and summary cards. Then one agent per scene animated it in code (one agent did each video's opening and
   closing cards), on the engine built for Aaron's course
   [The Hidden Curriculum](/courses/the-hidden-curriculum/). A reviewer checked each video
   against its narration from stills taken every 1.5 seconds, fix passes followed, and a last
   check came before each render.
6. **Tools.** One agent built each tool. Mini Loom's four trees (608 grown passages each) were
   grown with Qwen3 1.7B Base on Aaron's laptop GPU, in eight runs that held the GPU for about 45
   minutes in all, rejected attempts included. The
   Explorer's attention numbers come from GPT-2 small. Each tool was reviewed and fixed twice.

**What the checks caught.**

- The plan called janus's diagonal time slices "the fastest legal order". They aren't: reading a
  prompt layer by layer takes fewer steps. The agent building the Explorer and the agent writing
  script 2.4 both caught it before narration.
- A script said Loom was built in 2021. Her own posts put the start in late 2020. Fixed before
  narration.
- The Explorer's first version said nothing below and to the left of a point could reach it.
  That is false, and a reviewer caught it.
- A bug in the script that ran the agents read the narrators' routine mention of their quota as
  a failure, so all eight videos stopped after narration. They were restarted from the narrated
  files, so no narration was paid for twice.
- One render failed on an error in a scene. It was fixed before the video shipped.
- A last check of the finished post found that video 1.4 described a bar in Mini Loom wrongly,
  and that Mini Loom could not be used in the post's frame on a phone. The sentence was
  narrated again and the video rendered again, and Mini Loom now offers its own tab or full
  screen when the frame is too small.

**Measured.** 153 agents plus the session that directed them, all Claude Opus 5.5, never more
than seven at once: 5 for research, 21 for scripts, fact-checks and editing, 8 for narration, 97
for design, animation, review and rendering, 17 for the tools, and 5 for the last check. Nine
of them were stopped and run again: seven when the first run was stopped within a minute to fix
the order of its steps, and two when the narration bug stopped the second. Together they wrote
about 5.3 million output tokens. Their working time adds up to about 25 hours; because they ran
in parallel, the whole job took about four and a half hours from the request to publishing.

No person edited the scripts, videos or tools before they were published. janus did not review
them.

**Limits.**

- The videos simplify. Where her thread simplifies the order of steps inside a layer, the videos
  follow the standard architecture. They also say where current models differ from her
  description: many share keys and values across heads, which makes that channel narrower.
- The trees were grown by a 1.7-billion-parameter model. The base models Loom was built for were
  far larger, and the live model in your browser is smaller still.

## Sources

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
- Model configurations: [GPT-2 small](https://huggingface.co/openai-community/gpt2/blob/main/config.json), [Llama 3.1 8B](https://huggingface.co/unsloth/Meta-Llama-3.1-8B/blob/main/config.json), [70B](https://huggingface.co/unsloth/Meta-Llama-3.1-70B/blob/main/config.json), [405B](https://huggingface.co/unsloth/Meta-Llama-3.1-405B-bnb-4bit/blob/main/config.json) (public copies of Meta's configurations); [grouped-query attention](https://arxiv.org/abs/2305.13245)
- Tool models: [Qwen3 1.7B Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base) (the pre-grown trees), [SmolLM2](https://huggingface.co/onnx-community/SmolLM2-360M-ONNX) through [transformers.js](https://github.com/huggingface/transformers.js) (the live model), [GPT-2 small](https://huggingface.co/openai-community/gpt2) (the attention data)

## Your turn

The ideas are janus's, and her writing is linked above. Watch the parts that interest you, try
both tools, and judge for yourself how well this explains them.
