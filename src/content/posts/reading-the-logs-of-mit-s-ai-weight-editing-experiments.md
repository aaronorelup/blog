---
id: "AO-077"
title: "Reading the logs of MIT's AI weight-editing experiments"
summary: "An MIT team showed an AI reading and rewriting the weights of other neural networks. I went through their released logs to see what each of the eight experiments did and what's behind the headline numbers."
date: 2026-11-04
topic: "learning"
draft: true        # until Aaron says it's good, in his own words
preview:
  verdict: "Real, but oversold"
  takeaway: "The experiments are real and fully logged. Most of the edits are hand-wired rules or one bug fix, not an AI reading weights the way the headlines say."
  points:
    - "The 7.9% to 48.1% math jump came from fixing a looping bug. On a model that didn't loop, no edit helped."
    - "The car fix that changed 3.5% of the weights comes down to about 50 hand-picked numbers."
    - "Reading raw weights with no tools only worked on tiny networks, up to 172,000 weights."
  image: "/media/previews/reading-the-logs-of-mit-s-ai-weight-editing-experiments.webp"
  alt: "Heatmaps of four trained game networks' first-layer weights: a paddle row in Breakout, a paddle column in Pong, a maze in Pac-Man, road lanes in Freeway"
---

I had Claude go through the full logs of a new MIT study where GPT-6 Astra, OpenAI's newest model, read and rewrote the weights of other neural networks. Weights are the numbers inside an AI model, and normally only training changes them. **The results are real, but most are smaller than they sound.** The edits are mostly rules wired in by hand or one bug fix, and reading raw weights with no tools only worked on tiny networks.

I found it through [Matthew Berman's video](https://www.youtube.com/watch?v=j09uV1oAuIo). The [original write-up](https://rikiyat.github.io/blog/weight-space-programming/) is a blog post, not a peer-reviewed paper, and the team released [every prompt, reply and network](https://github.com/RikiyaT/lm_understand-logs). That's the only reason any of this could be checked, so credit to them. It's a fun place to keep going from, not a sign of AI about to rewrite itself.

- **Naming a game from a trained network (experiment 1).** It got all four. The game is visible in the first layer of weights, as the picture below shows.
- **Saying what a tiny image model draws (2).** All three shapes right. It drew them as outlines, but the models draw filled shapes.
- **Naming the language a tiny language model learned (3).** Right all six times, but only 48 to 62% sure, picking from three. It used Python and a known interpretability method.
- **Fixing a car stuck on a ramp (4).** It worked in all 1,024 runs. The fix is a hand-wired rule made of about 50 numbers.
- **Writing game networks from scratch (5).** Its Breakout network scored 20 times a trained one. 96% of its weights are zero and the rest work like switches.
- **Writing a Go network (6).** Without test games it lost to a trained network of the same size. With 50 rounds of test games it won 70 to 79% of games.
- **Finding the people-pleaser (7).** From the weights alone it couldn't tell which of two models agrees with whatever answer you suggest. Allowed to see where each model looks while it reads, it picked right all three times.
- **Making a small model better at math (8).** 7.9% to 48.1%, by removing a looping bug. On a model that didn't loop, nothing improved.

## The first layer gives the game away

All four game networks have the same shape and the same inputs, so the only clue is the weights. But you don't need to read deep. Plot how strong the first-layer weights are for each square of the 10 by 10 grid and the games show up on their own.

<figure class="wide">
  <img src="/media/reading-the-logs-of-mit-s-ai-weight-editing-experiments/first-layer-weights.webp" alt="Eight heatmaps on a 10 by 10 grid, one column per game. Top row, the player's weights: one bright row along the bottom for Breakout, one bright column on the left for Pong, a maze of corridors for Pac-Man, a block over the road for Freeway. Bottom row, the reward weights: three rows of bricks for Breakout, the right edge for Pong, two single squares for Pac-Man, the top row for Freeway." loading="lazy">
  <figcaption><b>Where each trained network's first layer is strong.</b> Brighter is stronger. The top row is the squares where the player can be, the bottom row the squares where rewards are. Made from the team's released networks.</figcaption>
</figure>

Breakout's player lives on one row, a paddle. Pong's lives on one column. Pac-Man's draws a maze and Freeway's covers the road. Astra's answers point at exactly these patterns. Doing that from 17,253 numbers pasted in as text, with no tools, is still neat. But it's pattern spotting on the first layer, not understanding the network, and the researchers say as much about their first two experiments.

## Writing weights mostly means writing rules

In experiments 4 to 6 Astra didn't tune a network the way training does. It wrote a small program and turned it into weights, using huge values that make each neuron act like an on/off switch.

- **The car.** The fix is 51 lines like `actor0.W[6, 122] = 80`. Most of the 6,073 changed numbers come from zeroing six neurons per layer so it could take them over. The real fix is about 50 hand-picked numbers that say back up, go full throttle past a certain spot, then hand control back to the trained network.
- **Breakout.** 815 of the 20,486 weights aren't zero, with values like 1,000 and -200. The first layer works out where the ball will land and the second moves the paddle there. The input is a 10 by 10 grid of on/off squares, not a screen of pixels.
- **Go.** A 336-line Python script set the weights. One kind of neuron gets +4 from "my stone is here", -1 from each stone next to it, and a bias that makes it output exactly how many empty points surround my stone. Later layers use that to find groups about to be captured.

That's a real skill, and a person with a few hours and a calculator could do the same kind of thing. What makes trained networks good is the millions of small in-between values nobody wrote, and these experiments mostly skip that. [Someone on X](https://x.com/xingyudang/status/2117428791660134736) found open models do better writing the rules as plain Python than as weights, which fits.

## The math result fixed a broken mode

Qwen3.5-0.8B is a small open model with a "thinking" mode that loops. In that mode 93% of its answers on the MATH-500 test kept repeating themselves until they hit the 32,768-token length limit. Astra found the direction in two layers that drives the looping and removed it, changing 131,072 weights (0.016%). The loops mostly stopped, and the score rose with them.

<ao-bars unit="%" max="100">
<table><thead><tr><th>Run</th><th>MATH-500 score</th><th>Answers that hit the length limit</th></tr></thead>
<tbody>
<tr><td>Unedited</td><td>7.9</td><td>93.0</td></tr>
<tr><td>Edited, 10 test passes</td><td>12.3</td><td>87.2</td></tr>
<tr><td>Edited, 25 test passes</td><td>14.1</td><td>86.4</td></tr>
<tr><td>Edited, 50 test passes</td><td>48.1</td><td>33.1</td></tr>
</tbody></table>
<figcaption><b>The score went up when the loops went away</b></figcaption>
</ao-bars>

A test pass is one batch of up to 512 practice problems Astra could run the model on. What the 6x headline leaves out:

- **It's one run.** The runs left out of the post made no edit or gained less. The 5-pass run and a second 10-pass run made no edit at all.
- **Thinking mode isn't the default.** Qwen's model card says this model runs without thinking by default, and the post never gives that score. Several people on X who re-ran it that way say the unedited model already scores close to the edit, and [one reports 45.6%](https://x.com/_carlos_toledo_/status/2117754318396997971).
- **The edit itself is real.** Hugging Face rebuilt it from the logs and got 51.0%.
- **It can't add skill.** On Gemma 3 270M, which rarely loops, no edit moved the score more than about a point.

## Bigger networks needed tools, not reading

The two "reading" tests on bigger models were less like reading. In experiment 3 Astra had Python and ran 6 to 11 scripts on the 7.2 million weights, using a method from a 2021 interpretability paper. In experiment 7, on two copies of a 270-million-weight model, four tries from the weights alone came out as coin flips, at 15 minutes to 2 hours per pair. It only got there with a tool that runs both models and shows where they look, at 30 to 40 minutes per pair. Pasting the raw weights in as text only ever worked up to 172,000 weights.

## What I want to try next

- **Do hand-wired rules survive training?** Neurons pushed to their limits barely change when training updates a network, so my guess is you could wire in a readable rule and train around it. A 1994 method called KBANN did something close.
- **Editing a small image model's weights toward a color or a texture.** And checking every step, because it's easy to blame the wrong neuron.

<details><summary>Every experiment's size and setup</summary>

| # | Network | Weights | What Astra had |
|---|---|---|---|
| 1 | Game player on a 10 by 10 grid | 17,253 | The weights as text, no tools |
| 2 | Tiny image model, 12 by 12 shapes | 23,824 | The weights as text, no tools |
| 3 | Tiny language model that predicts letters | 7.2 million | Python, but it couldn't run the model |
| 4 | Car controller | 171,664 | The weights as text, no tools, one reply |
| 5 | Game players written from zero | 20,486 | The game's rules and code, no tools |
| 6 | Go player written from zero | 1.48 million | Python, plus up to 50 rounds of test games |
| 7 | Gemma 3 | 270 million | Python, then a tool showing where it looks |
| 8 | Qwen3.5 | 0.8 billion | Python, plus up to 50 test passes |

Experiments 1 and 2 took a minute or two per network. The Breakout network took 8 minutes. Go took 22 minutes with no test games and about an hour and a half with 50. Each math run took 8.5 to 20 hours.

</details>

*Claude read the write-up, all eight experiments' logs and the reactions on X for this post, and checked every number against the logs.*
