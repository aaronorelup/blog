---
id: "AO-040"
title: "Claude's text is watermarked now, and the mark only lives where Claude had a choice"
summary: "Since August, Anthropic watermarks what Claude writes with a version of Google DeepMind's SynthID-Text. The mark is in which words get picked, so the text reads the same and an answer with only one right version comes out unchanged, and only Anthropic's key can check it. An animated explainer and five demos show how it works, what edits do to it, and what would remove it."
date: 2026-10-06
status: "shipped"
tags: ["claude", "watermarking", "synthid", "interactive", "agents"]
preview:
  verdict: "Long text keeps the mark"
  takeaway: "The mark is a slight lean in Claude's free word choices. Long text keeps it through heavy edits; a Claude rephrase re-marks it, and a pass through a model without the key removes it."
  points:
    - "If Claude rewrote a 90,000-word novel of mine, I'd need to change about half its words for even odds of slipping past."
    - "Short text is fragile: swapping one word in ten for a synonym takes the demo's 163-word letter from 52.0% + to about 50.7%, under the flag line."
    - "A hit only says Claude was involved. A light proofread of a 3,000-word essay is flagged about 2% of the time."
---

Anthropic started watermarking what its models write in August. The watermark lets Anthropic check
whether a piece of text was written by one of its models. The remarkable part is where it lives: in
the word choices themselves, without making the writing any worse. I made an animated explainer and
five demos to show how it works.

## The short version

- **The system is SynthID-Text.** Google DeepMind published it in
  [Nature in 2024](https://www.nature.com/articles/s41586-024-08025-4), and Anthropic's
  [announcement](https://www.anthropic.com/news/claude-text-watermark) says Claude uses "a version
  of" it.
- **It started on 2 August 2026.** Claude models released since then have it from launch, and older
  ones are being added. Anthropic's [help page](https://support.claude.com/en/articles/16266773) lists
  which models have it; as of this week that's every model on the list, from Haiku 4.5 to Fable 5.1.
- **It's on every Anthropic platform, with no opt-out.** The API, the Claude apps, Claude Code and
  the rest, plus Claude through AWS, Google Cloud and Microsoft Foundry, worldwide.
- **The reason is the EU AI Act,** which since 2 August requires AI providers to mark AI-generated
  content in a way a machine can detect.
- **Only organisations Anthropic approves can check.** Regulators, police, journalists,
  fact-checkers, researchers, schools and EU civil-society groups can apply through a form on
  [Anthropic's page](https://www.anthropic.com/news/claude-text-watermark), and so can companies that
  need it for their own compliance. There is no public checker.
- **A hit means Claude was probably involved.** It can't say who wrote the text, or whether Claude
  wrote it or only edited it, and no hit doesn't mean a human wrote it.

## How SynthID-Text works

There are many ways to watermark text. SynthID-Text makes some tokens a little more likely than
others, depending on the tokens before them. In text without the watermark, which tokens get picked
doesn't lean any particular way. In watermarked text it leans, slightly. The trick is leaning
without making the writing worse, and SynthID-Text does it with a tournament.

1. **A tournament picks each token.** It has a set number of rounds (the paper uses 30). Each round,
   the contestants are paired off and one from each pair goes through. The contestant that wins the
   last round is the token that gets generated.
2. **The contestants come from the model's own odds.** Instead of sampling the next token straight
   from its probability distribution, the model fills the tournament with contestants, each holding
   a token drawn from that distribution. The more likely a token, the more contestants hold it.
3. **Every token gets a + or a − for each round: its round assignments.** They're set before the
   tournament starts, at random, using the secret key and the four previous tokens as the seed. Every
   contestant holding the same token has the same assignments.
4. **In each match, + beats −.** If both contestants have the same sign, the winner is picked at
   random.
5. **Better assignments win more often.** A token with more +'s has a better chance of winning the
   tournament and being generated. It's still always a token the model wanted; the watermark only
   decides which of them wins.
6. **The checker recreates the assignments.** They depend only on the previous tokens and the key, so
   whoever holds the key can recreate them for any text that still has the same previous tokens. In
   text without the watermark, about half of all the assignments of the tokens that were picked are +.
   The more a text leans toward +, the more likely it was watermarked, and the longer the text, the
   less that lean can be luck.

Here is the same thing, animated. It walks through everything the demos below let you try.

<figure class="sid-video"><video controls playsinline preload="none" poster="/media/claude-text-watermark/explainer.webp" src="/media/claude-text-watermark/explainer.mp4"><track kind="captions" srclang="en" label="English" src="/media/claude-text-watermark/explainer.vtt"></video><figcaption>How SynthID-Text works · 4:34 · voice and music by ElevenLabs · animation drawn in code</figcaption></figure>

## Try it: one tournament

The toy model below is finishing a sentence. First you see each possible next word's odds and its
round assignments; then a tournament of eight contestants over three rounds; then what happens if
you run that tournament many times.

<ao-demo name="synthid" part="tournament">
The interactive demo needs JavaScript.
</ao-demo>

Switch the last chart to 30 rounds, like the real system, and one word takes nearly all the odds:
for a given key and four previous tokens, the choice is all but settled. Anthropic describes it the
same way: the key and the few words before decide which word gets picked. Across everything the
model writes, the previous tokens keep changing, so each word still wins as often as the model
wanted. The paper does report some loss of variety between answers to the same prompt; how much
variety Claude's version keeps, Anthropic hasn't said.

## When there's only one right answer

Ask "what's the capital of France?" and the model is 99.95% sure the answer is "Paris". Nearly
every contestant holds "Paris", so Paris plays Paris and wins, whatever the round assignments say.
The watermark has nothing to act on, and the answer comes out exactly as it would have. The same
goes for a URL, a file path or a quote you asked for word for word: each of their tokens is nearly
certain. Anthropic's own example is Newton's *Principia*: the next word has to be *Mathematica*, so
the watermark has "nothing to act on".

It isn't about the word. Ask for a city famous for its food and "Paris" is one good answer among
several, so the round assignments decide which city wins, and the watermark works as usual.

<ao-demo name="synthid" part="certain">
The interactive demo needs JavaScript.
</ao-demo>

Running it over 100,000 different sets of previous tokens turned up one wrinkle I didn't expect.

- **On average, nothing changes.** Averaged over every set of previous tokens, each word comes out
  exactly as often as the model wanted. The paper proves this.
- **But the rare mistakes get gathered up.** For a 99.95%-sure answer, the wrong answers got *rarer*
  than the model's own odds in 99.5% of cases. In about 1 in 450 they rose above 1%, and in the
  unluckiest one a wrong word won outright.
- **The surer the model, the rarer that gets.** Slide "Set it yourself" all the way up and it
  doesn't happen once in 100,000.

That's arithmetic on the published algorithm, not something I measured on Claude. Anthropic says
the watermark isn't applied where an exact output is required, without saying how. The checkbox
shows one way that can be true: drop very unlikely words before the tournament (the paper applies
the watermark after this kind of trimming), and "Paris" is the only contestant left. What Claude's
sampler does there isn't public, and neither is what happens at temperature 0.

## How the checker works

The checker never needs the model. It needs the text, the key and the way the seed is made. It
recreates every token's round assignments and counts the +.

<ao-demo name="synthid" part="detect">
The interactive demo needs JavaScript.
</ao-demo>

- **Shorten it.** The whole letter, 163 words, comes out 52.0% +, past the flag line at 51.5%: text
  without the watermark scores that high about 1 time in 770. The first 40 words alone come out
  50.8%, which isn't enough. Short text holds too few choices, which is why Anthropic says detection
  doesn't work well on small samples.
- **Switch to the letter written without the watermark.** Same kind of words, about 50% +.
- **Check Claude's letter with a different key.** About 50% again. The assignments only mean
  something with the key that made them, which is why only the key holder can check.

## What edits do

Each token's round assignments are seeded by the four tokens before it. So changing one token
changes five tokens' assignments: its own, and the four after it. The checker gives those five new,
random assignments, and their evidence is gone. Every other token keeps its evidence. Change a word
in the letter below and watch the wavy underline run four tokens past it.

<ao-demo name="synthid" part="edit">
The interactive demo needs JavaScript.
</ao-demo>

So "a small edit" is the wrong unit. What matters is which tokens you change and how long the text
is. Swap one word in ten for a synonym and the letter falls from 52.0% + to about 50.7%, under the
flag line nearly every time. The words you can swap for a synonym are exactly the ones the model
was free to choose, so those are the ones holding the evidence. And the letter is short. A book is
not.

Say I had Claude rewrite a book I wrote, then did the final pass myself:

<ao-demo name="synthid" part="book">
The interactive demo needs JavaScript.
</ao-demo>

- **If Claude rewrote it, the mark is in Claude's word choices,** and my final pass only removes it
  around the words I change. In a 90,000-word novel I'd have to change about half of all the words
  before it was a coin flip whether the checker flagged it. Edits bunched into sentences break fewer
  neighbours than scattered ones; edits aimed at word choices, as in demo 4, remove more.
- **If Claude only proofread it, there's almost nothing to find.** Most of the words are mine. Set
  "a light proofread": a 3,000-word essay is flagged about 2% of the time. Anthropic says the same.
- **Either way, a hit would only say Claude was involved,** which would be true. It can't say who
  wrote the book.

The published numbers agree in shape. The paper's own test deleted 20% or 50% of the words and found
the mark still detectable with high accuracy on long enough text. A 2025 study
([SynGuard](https://arxiv.org/abs/2508.20228)) swapped synonyms into 200-token texts, aiming for 70%
of the words, and still caught 82% of them at a 3.5% false-positive rate. That's far sturdier than my
toy letter, though that attack stops early when it runs out of words it can swap, so the share it
actually changed can be lower than its target.

## What it would take to remove it

This part is speculation, with demo 4 as a sandbox. None of it has been tested against Claude,
which would need the key.

- **An invisible character every four tokens beats a careless checker, not a real one.** Each
  zero-width space is a token, so every set of four previous tokens contains one and every round
  assignment is redrawn. Untick "removes invisible characters" in demo 4 and the score collapses. But
  a checker can delete invisible characters before checking, which is one line of code, and the
  mark comes straight back. Visible junk survives that, and ruins the text.
- **Making Claude write the junk does work.** Ask for an emoji after every word, then delete them
  ("The emoji trick" in demo 4). Every word was picked with an emoji among its four previous tokens,
  so once they're gone the checker sees different previous tokens everywhere. It costs a strange
  prompt and probably some quality, and a provider could answer by ignoring emoji when it makes the
  seed, after which someone tries the next thing.
- **Asking Claude to rephrase every sentence doesn't work.** A rewording by Claude is new Claude text
  under the same key, so it gets a new watermark. Anthropic says the same about translation: a Claude
  translation is marked, because every word in it is Claude's.
- **Swapping synonyms for the unimportant words works on short text and is slow on long text.** The
  words you can swap without changing the meaning are exactly the free choices where the mark lives,
  so each swap removes real evidence. One swap in four wipes the toy letter. On something book-length
  you'd be rewriting a large share of it, and the SynGuard numbers above suggest real text holds up
  better than my toy.
- **One pass through a model that doesn't have the key is the one that works.** Every word gets
  picked again with ordinary randomness. A [July 2026 study](https://arxiv.org/abs/2607.16010) found
  paraphrasing removed the mark from 98.3% of the SynthID texts that had been detected (on an
  open-source reimplementation that already missed 80% before any attack, so read that loosely). The
  paper calls a thorough paraphrase by a strong model a strong attack, and Anthropic agrees a complete
  rewrite removes the mark, adding that by then it's arguably not AI-generated text any more.

## What I take from it

The watermark isn't on the facts. It's on the taste: "sits" or "stands", "grey" or "overcast", the
words that were Claude's to pick rather than mine or the world's. Paris as the capital of France
belongs to everyone, so it carries nothing. Paris as a good place to eat was Claude's pick, and it
can.

This post was drafted by Claude Opus 5.5, which is on Anthropic's list. So the sentences I didn't
rewrite probably carry the mark, and the ones I did carry less of it. That seems about right.

## How this was made

Four Opus 5.5 agents at low reasoning effort did the reading: the paper and its code, Anthropic's
pages, who can check, and the attack papers. Two more re-read Anthropic's pages and the robustness
numbers as raw text, which corrected several quotes the first pass had paraphrased and removed two
numbers nobody could find in the source. Claude Opus 5.5 built the demos from the paper and Google
DeepMind's code and drafted the post. For the explainer, Claude wrote the script, seven Claude agents
animated a scene each in code, ElevenLabs voiced it and generated its music, and Qwen-Image 2.1 painted
the desk-lamp backdrop on my laptop.

The demos' model is a hand-written menu of word choices, a token is a whole word, and the seed is
made the demo's own way, so it can't check real Claude text; nothing public can. Because every toy
letter shares its fixed words, any one key tilts unwatermarked letters slightly; the demo uses the
first small key whose unwatermarked letters average exactly 50% +.
