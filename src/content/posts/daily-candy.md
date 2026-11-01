---
id: "AO-049"
title: "Claude picks the best of three AI image models every morning"
summary: "A Claude job draws one idea every morning with three AI image models and picks the best. Why it picked the same model all 41 times, and six mornings you can judge blind."
date: 2026-10-15
status: "in-progress"
tags: ["claude-code", "comfyui", "agents", "stable-diffusion", "lessons"]
series: ["agent-runs"]
topic: "art"
project: []
preview:
  verdict: "Qwen-Image, 41 of 41"
  takeaway: "The judge picked the Qwen-Image picture all 41 times because it grades against a written brief, and Qwen is the one model of the three that follows sentences."
  points:
    - "The other two models take keyword lists, which can't say the children are scared. Neither one drew a scared child."
    - "The judge called one Pony V6 XL poster the most cinematic of the bunch, and it has never named a Pony picture the best."
    - "A morning is six pictures and a clip, about four minutes of laptop GPU, plus $1.75 to $2.87 of Claude at list prices."
  image: "/media/previews/daily-candy.webp"
  alt: "The same Halloween brief drawn three ways: a hooded grinning figure, a cloaked man bowing to a child, and a poster of BloodTailor offering candy to three ghost-costume children"
---

Every morning at 4 a.m. a Claude agent checks that nobody is using my laptop's graphics card,
draws one idea with three AI image models and picks the best picture. In the 41 ideas it drew
from 24 September to 15 October, **it picked the Qwen-Image picture every time.** That's because
it judges each picture against a written brief. Qwen is the only one of the three you prompt in
full sentences, so it's the one that draws what was asked for, signs and all. The judge's notes
often praise how the other two look, and it still never picks them.

- **Keyword prompts can't say how things relate.** The other two models take lists of keywords,
  and neither drew the scared children the Halloween brief was about.
- **Only Qwen can letter a sign.** "DO NOT STAB" on my character Jefrie's snowman came out
  spelled exactly.
- **The two keyword models get dropped far more.** Qwen kept 77 of its 79 pictures, oneObsession
  46 of 54 and Pony 22 of 43.
- **A morning takes about four minutes of graphics card.** Plus $1.75 to $2.87 of Claude usage, at
  Anthropic's list prices.

## How the job works

On 20 September I told Claude what I actually wanted from all the agents running on my machine:

> What I really want is Aaron candy. As in things that give me joy and signal.

So now a scheduled Claude agent picks one idea every morning from my characters, my projects or
my notes, and makes two pictures with each model:

- **oneObsession**, an anime model prompted in tags, short lists of keywords. It's the model that
  invented my character [Jefrie](/ledger/jefrie-lora/).
- **Pony V6 XL**, another anime model prompted in tags.
- **Qwen-Image 2.1**, prompted in plain sentences.

It animates the best still into a five-second clip with MiniMax-H3, an AI video model. The clips
aren't shown here. It logs every picture with a sentence on what it shows, and keeps or drops it
with a reason. Every number here is from that log.

## Judge them yourself

Here are six of the eleven mornings between 1 and 15 October, one brief per row, with each
model's better picture of its two. **Judge blind** shuffles the pictures and hides the names.
Pick one per row, and Reveal marks the job's pick.

<ao-blind aspect="1216/832">
<div data-row="2 Oct · Jefrie's first snow, building a snowman under the Storm Bell">
<figure><img src="/media/daily-candy/snow_oneobsession_00002.webp" alt="A masked girl in a red cape kneels in deep snow under a huge armoured tail, holding a tall scythe, beside a snowman and a campfire" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">23 s · "tail and scythe both right"</span></figcaption></figure>
<figure><img src="/media/daily-candy/snow_pony_00002.webp" alt="A grey-haired grinning girl in silver armour and a streaming red cape kneels in a blizzard beside a grumpy snowman" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">17 s · "energy, cape, grin, the snowman", but no mask and no scythe</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/snow_qwen_00001.webp" alt="Jefrie in a half-mask hugs a snowman in front of an iron-bar dome and watchtowers, her spiked tail curled round them, a sign reading DO NOT STAB" loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">31 s · "every canon element lands", sign spelled exactly</span></figcaption></figure>
</div>
<div data-row="3 Oct · the four levels of reading as a four-storey tea-house library">
<figure><img src="/media/daily-candy/reading_oneobsession_00001.webp" alt="A rainy-night library with tall shelves, paper lanterns, a spiral staircase and an orange cat asleep on an open book" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">29 s · "cosy and well composed" but "one floor, not four"</span></figcaption></figure>
<figure><img src="/media/daily-candy/reading_pony_00002.webp" alt="A painted many-storey library of curving shelves with small orange cats on different stairs" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">21 s · "cats on every level, closest to the four-floors idea"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/reading_qwen_00001.webp" alt="A cutaway four-floor tea house in rain with cats reading on each floor and a sign by the door" loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">32 s · "all four levels land"</span></figcaption></figure>
</div>
<div data-row="5 Oct · the GPU queue as a tea house: one kettle, cats with numbered tickets">
<figure><img src="/media/daily-candy/gpuqueue_oneobsession_00002.webp" alt="A deep wooden tea house with a stove and teapots, two cats sitting side by side facing the stove" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">31 s · "two cats waiting in turn at the pot", but no tickets</span></figcaption></figure>
<figure><img src="/media/daily-candy/gpuqueue_pony_00002.webp" alt="A blue-tiled tea house at dusk with lanterns and teapots, a row of cats peeking from a bush" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">22 s · "most atmospheric"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/gpuqueue_qwen_00001.webp" alt="Five cats in a line holding paper tickets face a steaming iron kettle on a charcoal stove under a sign reading ONE POT AT A TIME" loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">39 s · sign exact, and the tickets read 1, 4, 2, 3 and 7-ish</span></figcaption></figure>
</div>
<div data-row="10 Oct · BloodTailor hands out Halloween candy, and the children are scared of him">
<figure><img src="/media/daily-candy/halloween_oneobsession_00002.webp" alt="A grinning figure in an orange hood holds a jack-o'-lantern candy bowl on a dark porch, a cyan ghost over his shoulder" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">22 s · "strong silhouette, grin, ghost", but no children</span></figcaption></figure>
<figure><img src="/media/daily-candy/halloween_pony_00002.webp" alt="A man in a red-brown cloak bows toward a grinning child in a tall white hat beside a carved pumpkin" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">15 s · "the gentle offering reads", but the eye plate is missing</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/halloween_qwen_00002.webp" alt="BloodTailor, an iron plate over his eyes and a huge grin, holds out a bowl of candy to three children in bedsheet ghost costumes under a banner reading PLEASE, TAKE ONE." loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">23 s · "gentlest reading, cleanest lettering"</span></figcaption></figure>
</div>
<div data-row="11 Oct · a boy studying calmly by a rainy window, from my notes on learning">
<figure><img src="/media/daily-candy/study_oneobsession_00002.webp" alt="A boy in a cream sweater reads an open book by tall rainy windows with an orange cat asleep on his lap" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">26 s · "reads as studying, cat and tea all present"</span></figcaption></figure>
<figure><img src="/media/daily-candy/study_pony_00002.webp" alt="A smiling orange-haired boy with fox-like ears holds a stack of books at a sunlit desk" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">20 s · "the ears are a cat-ear bleed and the cat is missing"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/study_qwen_00002.webp" alt="A poster of a boy writing by a rainy window with a cat on the sill, a banner reading DON'T BE BORED and the line CLOSE THE BOOK. SAY IT FROM MEMORY." loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">25 s · both lines of lettering exact</span></figcaption></figure>
</div>
<div data-row="14 Oct · Playback Lens as a brass lens over a scroll of tiny lit rooms">
<figure><img src="/media/daily-candy/lens_oneobsession_00002.webp" alt="A long scroll across a desk with a brass lens on a stand at one end, a teacup and a lit lantern" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">23 s · "lens reads clearer", but no rooms in the scroll</span></figcaption></figure>
<figure><img src="/media/daily-candy/lens_pony_00002.webp" alt="A painterly desk at a night window over a lantern-dotted town, with a round brass-framed glass beside a lamp" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">17 s · "mood and light are lovely" but "it shows no scrolling windows"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/lens_qwen_00001.webp" alt="A poster of a brass lens on a stand beside a scroll of tiny lit rooms, banner reading EVERY SESSION, REPLAYED." loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">34 s · "lens and scroll tell the story at once"</span></figcaption></figure>
</div>
<figcaption><b>Six mornings, three models, the same brief per row</b><span class="ao-meta">Each model's better picture of its two, by the job's own notes (quoted). Seconds are measured, and a model's first job of the morning includes loading it. The agent wrote every prompt. Qwen-Image 2.1 has a non-commercial license, and this site sells nothing.</span></figcaption>
</ao-blind>

## Why the tag models miss the brief

On 10 October the brief was [BloodTailor](/ledger/storm-bell-fighter/), one of my characters,
handing out Halloween candy to kids who are scared of him. The tag prompts listed it: gaunt man,
iron eye plate, huge grin, red cloak, candy bowl, small children in ghost costumes. Qwen's prompt
said three tiny children in ghost costumes cling together at the bottom of the steps, frozen
with fear, one of them reaching out a trembling hand.

A list can name the children. It can't say they're scared of him, and that was the whole idea.
Neither tag model drew a frightened child. oneObsession's first try put a pumpkin on his head.

<details><summary>The three Halloween prompts, word for word</summary>

oneObsession first, then Pony, then Qwen. The numbers in brackets tell a tag model how much
weight to give a tag. `quasarcake` is a style add-on.

```text
1boy, solo, male focus, tall, gaunt, pale skin, black hair, (iron faceplate covering
eyes:1.4), (huge grin:1.3), white victorian shirt, tattered red cloak, holding candy bowl,
standing, porch, halloween, jack-o'-lantern, small children in ghost costumes, night,
(quasarcake:0.65), limited color

score_9, score_8_up, score_7_up, score_6_up, source_anime, rating_safe, 1boy, tall gaunt
man, pale skin, black hair, (iron plate covering eyes:1.3), (huge wide grin:1.3), white
victorian shirt, long tattered red cloak, holding candy bowl, porch at night,
jack-o'-lantern, halloween, small children in ghost costumes, painterly

A painterly Halloween poster in a desaturated grey-blue night with the red cloak as the only
saturated colour, plus the warm orange glow of jack-o'-lanterns. A tall gaunt pale man stands
on a wooden porch, wearing a smooth featureless iron plate over his eyes with no eye holes,
and an enormous gentle grin far wider than a human mouth below it. [...] He holds out a
wooden bowl heaped with wrapped candy toward three tiny children in bedsheet ghost costumes
who cling together at the bottom of the steps, frozen with fear, one of them reaching out a
trembling hand. [...] At the top of the poster, a cream banner with hand-lettered text
reading: PLEASE, TAKE ONE.
```

</details>

## What the log says

<ao-bars unit="images">
<table>
<thead><tr><th>Model</th><th>Kept</th><th>Dropped</th></tr></thead>
<tbody>
<tr><td>Qwen-Image 2.1</td><td>77</td><td>2</td></tr>
<tr><td>oneObsession</td><td>46</td><td>8</td></tr>
<tr><td>Pony V6 XL</td><td>22</td><td>21</td></tr>
</tbody>
</table>
<figcaption><b>Every still rendered, kept or dropped by the job</b><span class="ao-meta">The job's log, 23 September to 15 October 2026: 176 stills, plus 22 video clips (all kept, not shown). Qwen has more because the 30 September bonus rounds gave it six pictures a round to the others' one to four.</span></figcaption>
</ao-bars>

The three models are close on speed. A typical picture took 21 to 29 seconds on any of them.

Most of the 41 ideas came from one afternoon. On 30 September I told it my GPU was free and to
keep going until I said stop. It did 27 ideas in about two hours before I typed "stop for now".

## What the judge says about the other two

When the judge drops a picture, the reason is almost never how it looks. Pony's poster for
[Blackwater](/ledger/blackwater-weekend/), my cave-diving zombie game, was "the most cinematic and
genuinely unsettling of the four despite the anglerfish being dropped from the render". Pony's
picture of [Playback Lens](/ledger/reading-my-own-agents/), my tool for reading back my Claude
sessions, was "beautiful but the lens, the scroll and the idea are lost", and got dropped. On my
character Ichigo's autumn morning, a `yellow snail` tag turned Pony's picture into "two empty
yellow rowboats each carrying a small animal-like head, no girl anywhere". Dropped too.

The job still makes all three every morning, because its instructions say to.

<details><summary>More from the log</summary>

- The first run went out on 21 September, the morning after I asked for "Aaron candy". It used
  one model, Flux.2 Klein 9B, and made three posters for a racing game I'd made that never had
  cover art. By 24 September the job had its current shape.
- The agent is Claude Sonnet 5.5. A morning is seven renders: two pictures from each model and
  one clip with sound.
- Median render time: 21.3 seconds on Pony, 26.7 on oneObsession, 28.8 on Qwen, and about 81
  for the clip.
- The $1.75 to $2.87 a morning is since 1 October, at Anthropic's API list prices.
- On 4 and 12 October the job found the graphics card already busy and stood down.
- The 30 September afternoon was nine extra rounds.

</details>
