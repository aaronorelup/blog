---
id: "AO-040"
title: "How the hidden watermark in Claude's writing works"
summary: "Since August, Anthropic has put a hidden watermark in what Claude writes. I had Claude build an animated explainer and five demos showing how the mark works, what edits do to it, and what removes it."
date: 2026-10-06
topic: "agents"
project: []
preview:
  verdict: "Long text keeps the mark"
  takeaway: "The mark is a slight lean in Claude's free word choices. Long text keeps it through heavy edits and Claude rephrases, but another AI model's rewrite removes it."
  points:
    - "Facts and exact answers carry no mark. Paris as France's capital is unchanged, but Paris as a food city can carry it."
    - "Short text is fragile. One synonym swap every ten words nearly always got the demo's 163-word letter past the checker."
    - "A hit only says Claude was involved. A light proofread of a 3,000-word essay gets flagged about 2% of the time."
  image: "/media/previews/claude-text-watermark.webp"
  alt: "The explainer's title card: the sentence 'The tea house sits at the edge of the river' with garden and forest as the other choices, next to a sheet of paper under a desk lamp"
---

Since August, Anthropic has been putting a hidden watermark in what Claude writes, so it can
check later whether a piece of text came from one of its models. The mark is a slight lean in
which word Claude picks wherever it had more than one good option, like "sits" or "stands". So
nothing gets added and the writing reads the same. Facts and exact answers like a URL come out
unchanged.

**Long text keeps the mark through a lot of editing.** Asking Claude to rephrase it just marks it
again. A full rewrite by an AI model that doesn't have the key removes it. Only organizations
Anthropic approves can check. I had Claude build an animated explainer and five demos that show
how it works.

## What it is and who can check

- **It's Google DeepMind's SynthID-Text.** DeepMind published it in
  [Nature in 2024](https://www.nature.com/articles/s41586-024-08025-4), and Anthropic's
  [announcement](https://www.anthropic.com/news/claude-text-watermark) says Claude uses "a version
  of" it.
- **It started on 2 August 2026, on every platform, with no opt-out.** That's when the EU AI Act,
  Europe's AI law, started requiring AI-made content to be marked so a machine can detect it.
- **Only approved organizations can check.** Regulators, police, journalists, fact-checkers,
  researchers and schools can apply on [Anthropic's page](https://www.anthropic.com/news/claude-text-watermark).
  There's no public checker.
- **A hit means Claude was probably involved.** It can't say who wrote the text, or whether Claude
  only edited it. And no hit doesn't mean a human wrote it.

<details><summary>Which models and apps have it</summary>

- Claude models released since 2 August have it from launch, and older ones are being added.
  Anthropic's [help page](https://support.claude.com/en/articles/16266773) lists which models have
  it. In early October that was every model on the list, from Haiku 4.5 to Fable 5.1.
- It's on every Anthropic platform: the API (how other apps talk to Claude), the Claude apps,
  Claude Code and the rest. It's also on Claude through AWS, Google Cloud and Microsoft Foundry,
  worldwide.
- Companies that need it for their own compliance can apply to check too, and so can EU
  civil-society groups.

</details>

## How it works

Claude writes in tokens, small chunks of text that are usually a word or part of one. Normally
the next token is drawn at random from the model's odds. SynthID-Text runs a little tournament
instead, where a secret key and the four tokens before it decide which words get an edge. Anyone
with the key can later count how often the favored words won. The explainer walks through it in
four and a half minutes.

<figure class="sid-video"><video controls playsinline preload="none" poster="/media/claude-text-watermark/explainer.webp" src="/media/claude-text-watermark/explainer.mp4"><track kind="captions" srclang="en" label="English" src="/media/claude-text-watermark/explainer.vtt"></video><figcaption>How SynthID-Text works · 4:34 · voice and music by ElevenLabs · animated in code by Claude agents</figcaption></figure>

Claude also made [a 40-minute video lesson](/ledger/loom-and-information-flow/) on how language
models work, with a toy where you steer a small AI model's stories.

<details><summary>The algorithm, step by step</summary>

1. **A tournament picks each token.** It has a set number of rounds (the paper uses 30). Each
   round the contestants are paired off and one from each pair goes through. The one that wins the
   last round is the token that gets written.
2. **The contestants come from the model's own odds.** Instead of drawing the next token straight
   from its odds, the model fills the tournament with contestants, each holding a token drawn from
   those odds. The more likely a token, the more contestants hold it.
3. **Every token gets a plus or a minus for each round.** These are its round assignments. They're
   set at random before the tournament starts, using the secret key and the four previous tokens as
   the seed, the number the randomness starts from. Every contestant holding the same token has the
   same assignments.
4. **In each match, plus beats minus.** If both have the same sign, the winner is picked at random.
5. **Better assignments win more often.** A token with more pluses has a better chance of winning.
   It's still always a token the model wanted. The watermark only decides which of them wins.
6. **The checker recreates the assignments.** They depend only on the previous tokens and the key,
   so whoever holds the key can recreate them for any text that still has the same previous tokens.
   In text without the watermark, about half the assignments of the picked tokens are plus. The
   more a text leans toward plus, the more likely it was watermarked. And the longer the text, the
   less that lean can be luck.

</details>

## Try it: one tournament

A toy model is finishing a sentence. You see each next word's odds and its plus or minus for each
round (its round assignments), then a tournament of eight contestants over three rounds, then that
tournament run many times.

<ao-demo name="synthid" part="tournament">
The interactive demo needs JavaScript.
</ao-demo>

Switch the last chart to 30 rounds, like the real system, and one word takes nearly all the odds.
But the previous tokens keep changing, so across everything Claude writes each word still wins
about as often as the model wanted. That's why the writing doesn't get worse.

The demos run on a toy model, not on Claude. Nothing public can check real Claude text.

<details><summary>What the toy model is, and what the paper says about variety</summary>

- The demos' model is a hand-written menu of word choices. A token is a whole word, and the seed is
  made the demo's own way, so it can't check real Claude text.
- Because every toy letter shares its fixed words, any one key tilts unwatermarked letters
  slightly. The demo uses the first small key whose unwatermarked letters average exactly 50% plus.
- With 30 rounds, a given key and four previous tokens all but settle the choice. Anthropic
  describes it the same way. The paper does report some loss of variety between answers to the same
  prompt. How much variety Claude's version keeps, Anthropic hasn't said.

</details>

## Facts and exact answers carry no mark

Ask "what's the capital of France?" and the model is 99.95% sure it's Paris. Nearly every
contestant holds Paris, so Paris plays Paris and wins whatever the assignments say. The answer
comes out exactly as it would have. Same for a URL, a file path or a quote you asked for word for
word. Anthropic's own example is Newton's *Principia*, where the next word has to be *Mathematica*.

It isn't about the word. Ask for a city famous for its food and Paris is one good answer among
several. Now the assignments decide which city wins, and the mark works as usual.

<ao-demo name="synthid" part="certain">
The interactive demo needs JavaScript.
</ao-demo>

<details><summary>The rare exception, over 100,000 runs</summary>

Running the Paris question over 100,000 different sets of previous tokens turned up one wrinkle.

- **On average nothing changes.** Averaged over every set of previous tokens, each word comes out
  exactly as often as the model wanted. The paper proves this.
- **But the rare mistakes get gathered up.** For a 99.95%-sure answer, the wrong answers got rarer
  than the model's own odds in 99.5% of cases. In about 1 in 450 they rose above 1%, and in the
  unluckiest one a wrong word won outright.
- **The surer the model, the rarer that gets.** Slide "Set it yourself" all the way up and it
  doesn't happen once in 100,000.

That's arithmetic on the published algorithm, not something measured on Claude. Anthropic says the
watermark isn't applied where an exact output is required, without saying how. The checkbox shows
one way that can be true. Drop very unlikely words before the tournament (the paper applies the
watermark after this kind of trimming) and Paris is the only contestant left. What Claude does
there isn't public. Neither is what happens at temperature 0, the setting where a model always
takes its single most likely word.

</details>

## How the checker works

The checker only needs the text, the key and the way the seed is made. It recreates every token's
assignments and counts the pluses. Text without the watermark lands near 50%. The demo's flag
line, where the checker says it found a watermark, is 51.5%.

<ao-demo name="synthid" part="detect">
The interactive demo needs JavaScript.
</ao-demo>

- **The whole 163-word letter gets flagged** at 52.0% plus. Text without the watermark scores that
  high about 1 time in 770.
- **The first 40 words alone don't.** They come out 50.8%. Short text holds too few choices, which
  is why Anthropic says detection doesn't work well on small samples.
- **The unmarked letter, or Claude's letter checked with a different key, comes out about 50%.**
  The assignments only mean something with the key that made them.

## What edits do: short text breaks, a book doesn't

Each token's assignments are seeded by the four tokens before it. So changing one token wipes the
evidence on five, its own and the four after it. Change a word in the letter below and watch the
wavy underline run four tokens past it.

<ao-demo name="synthid" part="edit">
The interactive demo needs JavaScript.
</ao-demo>

Swap one word in ten for a synonym and the letter drops from 52.0% to about 50.7%, under the flag
line nearly every time. The words you can swap for a synonym are exactly the free choices where
the mark lives. But that letter is short. Say I had Claude rewrite a book I wrote, then did the
final pass myself.

<ao-demo name="synthid" part="book">
The interactive demo needs JavaScript.
</ao-demo>

- **If Claude rewrote it, I'd have to change about half the words.** That's what it takes in a
  90,000-word novel before it's a coin flip whether the checker flags it.
- **If Claude only proofread it, there's almost nothing to find.** A 3,000-word essay after a light
  proofread gets flagged about 2% of the time. Anthropic says the same.
- **Either way a hit only says Claude was involved.** It can't say who wrote the book.

<details><summary>What the published tests found</summary>

- Edits bunched into sentences break fewer neighbors than scattered ones. Edits aimed at word
  choices, like the synonym swaps in demo 4, remove more.
- The paper's own test deleted 20% or 50% of the words and still found the mark with high accuracy
  on long enough text.
- A 2025 study ([SynGuard](https://arxiv.org/abs/2508.20228)) swapped synonyms into 200-token
  texts, aiming at 70% of the words, and still caught 82% of them while wrongly flagging 3.5% of
  unmarked texts. That's far sturdier than my toy letter. The attack stops early when it runs out
  of words it can swap, though, so the share it actually changed can be lower than its target.

</details>

## What removes it

None of this has been tested against Claude, since that would need the key.

- **Asking Claude to rephrase doesn't remove it.** A Claude rewording is new Claude text under the
  same key, so it gets a new watermark. Anthropic says the same about a Claude translation.
- **A pass through a model that doesn't have the key removes it.** Every word gets picked again
  with ordinary randomness. A [July 2026 study](https://arxiv.org/abs/2607.16010) found
  paraphrasing removed the mark from 98.3% of the SynthID texts that had been detected. That was on
  an open-source copy that already missed 80% before any attack, so I'd read it loosely. Anthropic
  agrees a complete rewrite removes it, and says by then it's arguably not AI-generated text anymore.

<details><summary>Synonym swaps, and tricks that scramble the four previous tokens</summary>

- **Swapping synonyms is slow on long text.** One swap in four wipes the toy letter. A book would
  need a big share of it rewritten, and the SynGuard numbers above suggest real text holds up
  better than my toy.
- **An invisible character every four tokens only fools a careless checker.** Each zero-width
  space, a character that takes up no room on screen, is a token. So every set of four previous
  tokens contains one and every assignment is redrawn. Untick "removes invisible characters" in
  demo 4 and the score collapses. But a checker can delete invisible characters before checking,
  which is one line of code, and the mark comes straight back. Visible junk survives that, and
  ruins the text.
- **Having Claude write the junk would work.** Ask for an emoji after every word, then delete them
  ("The emoji trick" in demo 4). Every word was picked with an emoji among its four previous tokens,
  so once they're gone the checker sees different previous tokens everywhere. It costs a strange
  prompt and probably some quality. A provider could answer by ignoring emoji when it makes the
  seed, and then someone tries the next thing.

</details>

*Claude Opus 5.5 agents read the papers, the code and Anthropic's pages, re-checked the quotes,
built the demos and drafted this post. For the explainer, Claude wrote the script, seven Claude
agents animated a scene each in code, ElevenLabs did the voice and music, and Qwen-Image 2.1
painted the backdrop on my laptop.*
