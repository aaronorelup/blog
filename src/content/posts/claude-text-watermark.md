---
id: "AO-040"
title: "Claude's text is watermarked now, and the mark only lives where Claude had a choice"
summary: "Since August, Claude's writing carries a version of Google DeepMind's SynthID-Text watermark, and only Anthropic's key can read it, through a private API for regulators, press, researchers and schools. It hides in choices like 'grey' versus 'overcast', so 'Paris', a URL or a quote you asked for comes out the way it would have and carries none of it. Five demos run the published algorithm in your browser: the tournament, the exact answers, the detector, your edits, and what scrubbing it would take."
date: 2026-10-06
status: "shipped"
tags: ["claude", "watermarking", "synthid", "interactive", "agents"]
---

Claude's text has carried a watermark since August. Nothing is added to the words: the mark is in
*which* words got picked, and only where picking was a real choice. "Grey" or "overcast" can carry
it. "Paris" can't. Only Anthropic holds the key that reads it, and for now only regulators, police,
journalists, fact-checkers, researchers, schools and EU civil-society groups can ask Anthropic to
check, plus companies that need it for their own compliance.

I wanted to see how both halves could be true at once, a mark in every long answer that never
touches an exact one, so I had Claude build the mechanism small enough to watch. The five demos
below run the algorithm from the 2024 Nature paper in your browser, on a toy model.

## When, who, where

- **It's SynthID-Text.** Anthropic's [announcement](https://www.anthropic.com/news/claude-text-watermark)
  (14 August) calls Claude's watermark "a version of the SynthID-Text approach" from Google
  DeepMind's [2024 Nature paper](https://www.nature.com/articles/s41586-024-08025-4). Anthropic
  hasn't published its own settings.
- **Since 2 August 2026.** Models launched in the EU from that date carry it at launch, and older
  ones are being added over the coming months. Anthropic's
  [help page](https://support.claude.com/en/articles/16266773) keeps a table: as of this week every
  model on it, from Haiku 4.5 and Opus 4.5 up to Fable 5.1, is watermarked on Anthropic's own apps
  and API.
- **Everywhere, and no opt-out is mentioned.** It's applied in the model, so it's in the API, the
  Claude apps, Claude Code, Cowork and Claude Tag, and through AWS, Google Cloud and Microsoft
  Foundry for most of the newer models (Bedrock finishes rolling out by 12 October). It's worldwide
  because, Anthropic says, it has no reliable way to limit it to one region yet.
- **Why: the EU AI Act.** Article 50(2) has required machine-readable marking of AI-generated
  content since 2 August. Anthropic signed the EU's Code of Practice on Transparency of
  AI-Generated Content in July, one of about 190 signatories, and says other big model makers will
  mark their text too, each with their own key.
- **Who can check: almost nobody, yet.** Detection is a private-preview API for the organisations
  the EU law names (regulators, law enforcement, media, fact-checkers, independent researchers,
  educational organisations, EU civil-society groups) plus companies that must verify watermarks
  for their own compliance. You register interest through a form on
  [Anthropic's page](https://www.anthropic.com/news/claude-text-watermark); wider access is planned,
  with no date. There is no public checker. AI-detector services like Pangram don't have the key,
  and Google's [open-source SynthID code](https://github.com/google-deepmind/synthid-text) only finds
  marks made with keys you hold.
- **A hit means Claude was probably involved. Nothing more.** It can't tell "Claude wrote this" from
  "Claude heavily edited this", it carries nothing about you, your organisation or your chat, and a
  miss doesn't prove a human wrote the text. Files are handled differently: PNGs, JPGs and SVGs
  Claude makes get a signed C2PA content credential in their metadata, which anyone can read.

## How one word gets picked

Every time Claude writes a token, it has a list of candidates and a probability for each. Normally
a random number picks one. SynthID replaces the random number with a knockout tournament:

1. **Every candidate gets 30 coins.** Each coin is 0 or 1, computed by hashing the secret key, the
   previous four tokens, and the candidate itself. Same key, same four tokens, same candidate: same
   coins, every time.
2. **Candidates are drawn from the model's own odds and paired off.** In each layer, a candidate
   whose coin is 1 beats one whose coin is 0. A tie is settled by a fair flip.
3. **The winner is always a word the model already wanted.** It's just more likely to be one whose
   coins are 1.

Later, anyone with the key can recompute every word's coins. Ordinary text averages half ones.
Watermarked text averages a little more, and over a few hundred words "a little more" stops looking
like luck.

<ao-demo name="synthid" part="tournament">
The interactive demo needs JavaScript.
</ao-demo>

The real thing doesn't play 2<sup>30</sup> matches. It applies all 30 layers straight to the
probabilities: in each layer, probability moves from the candidates whose coin is 0 to the ones
whose coin is 1, and the result is the exact odds of who would have won. That's what the gold bars
are.

They also show something I hadn't understood from the paper: thirty layers nearly settle the
choice. For one key and one set of four previous tokens, a single word takes almost all the odds.
Anthropic's own description puts it the same way: the key and a few words before settle which word
gets picked. What randomness is left comes from the small odds the other words keep and from steps that
aren't watermarked at all, like a repeated context. The paper reports some loss of variety between
answers to the same prompt; how much variety Claude's version keeps, Anthropic hasn't said.

## Why "Paris" comes out as Paris

If the model is 99.95% sure the next word is "Paris", nearly every candidate the tournament draws
is "Paris", and Paris beats Paris. There's nothing to tilt. That's the answer for most exact text:
a URL, a file path, a quote you asked for word for word, the digits of a sum. Each of those tokens
is near-certain, so it comes out the way it would have anyway, and it carries none of the mark.
Anthropic's own example is Newton's *Principia*: the next word has to be *Mathematica*, so the
watermark has "nothing to act on". Code gets less of it for the same reason.

<ao-demo name="synthid" part="certain">
The interactive demo needs JavaScript.
</ao-demo>

Running it over 100,000 contexts showed me a wrinkle I didn't expect.

- **On average, nothing changes.** Each layer moves probability around without changing its
  expected share, so averaged over contexts every token's odds are exactly the model's own. The
  paper proves this.
- **But errors aren't spread evenly any more.** For a 99.95%-sure answer, the wrong answers got
  *rarer* than the model's own odds in 99.5% of contexts. In about 1 in 450 they rose above 1%, and
  in the unluckiest one a wrong word won outright. The watermark doesn't add mistakes; it gathers
  the few the model would have made into a few contexts.
- **The surer the model, the rarer that gets.** At 99.995% (the URL example) it's about 1 context
  in 2,400. Slide "Set it yourself" all the way up and it doesn't happen once in 100,000.

That's arithmetic on the published algorithm, not something I measured on Claude. Anthropic says
the nudge isn't applied where exact output is required, without saying how. The checkbox shows one
way it can be true: trim the unlikely tail before the tournament (the paper applies the watermark
after any top-k or top-p trimming), and a 99.95% answer becomes the only candidate. What Claude's
sampler does there isn't public. The same goes for temperature 0: in the published version, greedy
decoding leaves nothing to tilt, and Anthropic doesn't say what its version does.

## Checking a text

The detector never needs the model. It needs the words, the key and the hash: it recomputes every
word's coins and averages them.

<ao-demo name="synthid" part="detect">
The interactive demo needs JavaScript.
</ao-demo>

- **Shorten it.** The whole letter, 163 words, lands 3.7 standard deviations above chance, past the
  flag line: unwatermarked text scores that high about 1 time in 9,000. The first 40 words alone
  don't clear it. Short text doesn't hold enough choices, which is why Anthropic says detection
  doesn't work well on small samples.
- **Switch to the unwatermarked letter.** Same menu, same kind of words, no lean.
- **Use the wrong key.** Claude's letter, checked with someone else's key, scores like coin flips.
  That's the whole access story in one button: the mark is only visible to whoever holds the key,
  and today that's Anthropic.

## What your edits do, and what happens to a book

Each coin depends on the four tokens before it, so changing one word breaks five windows: its own
and the next four. Every other word keeps its evidence. Change a word in the letter and watch the
wavy underline run four tokens past it.

<ao-demo name="synthid" part="edit">
The interactive demo needs JavaScript.
</ao-demo>

So "a small edit" is the wrong unit. What matters is how many windows survive, which of them, and
how long the text is. Swap one word in ten for a synonym and only about a third of the windows
break, but the letter's score falls from 3.7σ to around 1.2σ, under the line nearly every time. The
words you can swap for a synonym are exactly the ones Claude was free to choose, so those are the
windows that held the evidence. The letter is also short. A book is not.

The book is the case I actually care about. Say I had Claude rewrite a book I wrote, then did the
final pass myself:

<ao-demo name="synthid" part="book">
The interactive demo needs JavaScript.
</ao-demo>

- **If Claude rewrote it, the mark is in Claude's choices,** and my final pass only removes it
  around the words I change. In a 90,000-word novel I'd have to change about half of all the words
  before it had even odds of getting through. Two things move that number in opposite directions:
  real edits cluster in sentences and break fewer neighbours than scattered ones, while edits aimed
  at word choices (as in demo 4) remove the evidence faster than edits that land anywhere.
- **If Claude only proofread it, there's almost nothing to find.** Most of the words are mine. Set
  "a light proofread": a 3,000-word essay is flagged about 2% of the time. Anthropic says the same.
- **Either way, a hit would only say Claude was involved,** which would be true. It can't say who
  wrote the book.

The published numbers agree in shape. The paper's own test deleted 20% or 50% of words and found
the mark still detectable with high accuracy on long enough text. A 2025 study
([SynGuard](https://arxiv.org/abs/2508.20228)) swapped synonyms into 200-token texts, aiming for
70% of the words, and still caught 82% of them at a 3.5% false-positive rate. That's far sturdier
than my toy letter, though that attack stops early when it runs out of words it can swap, so the
share it actually changed can be lower than its target.

## What it would take to scrub it

This part is me speculating, with demo 4 as a sandbox. None of it has been tested against Claude,
which would need the key.

- **An invisible character every four tokens: beats a lazy detector, not a real one.** Each
  zero-width space is a token, so every four-token window contains one and every coin is fresh.
  Untick "strip invisible characters" in demo 4 and the score collapses. But a detector can delete
  invisible characters before checking, which is one line of code, and the mark comes straight
  back. Visible junk survives that, and wrecks the text.
- **Making Claude write the junk does work.** Ask for an emoji after every word, then delete them
  ("The emoji trick" in demo 4). Claude's coins were tossed with an emoji in every window, so once
  they're gone every window is new. It costs a strange prompt and probably some quality, and a
  provider could answer by hashing only real words, after which someone tries the next thing.
- **Asking Claude to rephrase every sentence: useless.** A rewording by Claude is new Claude text
  under the same key, so it gets a fresh watermark. Anthropic says the same about translation: a
  Claude translation is marked, because every word in it is Claude's.
- **Synonyms for the unimportant words: works on short text, slow on long text.** The
  "unimportant" words, the ones you can swap without changing the meaning, are exactly the free
  choices where the mark lives, so each swap removes real evidence and breaks four windows after
  it. One swap in four wipes the toy letter. On something book-length you'd be rewriting a large
  share of it, and the SynGuard numbers above suggest real text holds up better than my toy.
- **One pass through a model that doesn't have the key: this is the one that works.** Every word
  gets re-chosen with ordinary randomness. A [July 2026 study](https://arxiv.org/abs/2607.16010)
  found paraphrasing removed the mark from 98.3% of the SynthID texts that had been detected (on an
  open-source reimplementation that already missed 80% before any attack, so read that loosely).
  The paper calls a thorough paraphrase by a strong model a strong attack, and Anthropic agrees a
  complete rewrite removes the mark, adding that by then it's arguably not AI-generated text any
  more.

## What I take from it

The watermark isn't on the facts. It's on the taste: "sits" or "stands", "grey" or "overcast", the
words that were Claude's to pick rather than mine or the world's. Paris belongs to everyone, so it
carries nothing.

This post was drafted by Claude Opus 5.5, which is on Anthropic's table. So the sentences I didn't
rewrite probably carry the mark, and the ones I did carry less of it. That seems about right.

## How this was made

Four Opus 5.5 agents at low reasoning effort did the reading: the paper and its code, Anthropic's
pages, the detector landscape, and the attack papers. Two more re-read Anthropic's pages and the
robustness numbers as raw text, which corrected several quotes the first pass had paraphrased and
removed two numbers nobody could find in the source. The six of them wrote about 31,000 tokens of
output between them, and none took more than two minutes. Claude Opus 5.5 then built the demos from
the paper and Google DeepMind's code and drafted this post, which took the main session about
200,000 output tokens; the whole run took about 35 minutes.

The demos' model is a hand-written menu of word choices, a token is a whole word, and the hash is
the demo's own, so it can't check real Claude text; nothing public can. Because every toy letter
shares its fixed words, any one key tilts unwatermarked letters slightly; the demo uses the first
small key whose unwatermarked letters average exactly chance.
