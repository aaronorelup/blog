---
id: "AO-049"
title: "Every morning at 4 a.m. Claude draws one idea with three image models, and it has picked the same one 41 times out of 41"
summary: "A scheduled Claude job borrows my laptop's GPU before I wake and draws one idea with oneObsession, Pony V6 XL and Qwen-Image 2.1, plus a short video clip. In 41 ideas its judge has never once named anything but the Qwen picture the best. Six of those mornings are below, shuffled, so you can judge them blind."
date: 2026-10-15
status: "in-progress"
tags: ["claude-code", "comfyui", "agents", "stable-diffusion", "lessons"]
series: ["agent-runs"]
preview:
  verdict: "Qwen, 41 of 41"
  takeaway: "A judge working from a written brief rewards the model that follows sentences. The tag models lost on the brief, not on looks."
  points:
    - "198 renders logged: Qwen-Image 2.1 kept 77 of 79, oneObsession 46 of 54, Pony V6 XL 22 of 43."
    - "The judge's notes call a Pony picture 'the most cinematic' of the four. It has never picked one."
    - "Each morning costs about four minutes of GPU and $1.75 to $2.87 of Sonnet 5.5 tokens at API list prices."
  image: "/media/previews/daily-candy.webp"
  alt: "The same Halloween brief drawn three ways: a hooded grinning figure, a cloaked man bowing to a child, and a poster of BloodTailor offering candy to three ghost-costume children"
---

Every morning at four, a scheduled Claude job checks that nobody is using my laptop's GPU, then
draws one idea with three image models and turns the best still into a five-second clip. It
looks at every picture, writes a sentence about each one, and names a best of the idea.
**In 41 ideas since 24 September, the best has been the Qwen-Image 2.1 picture every time.**

That is less a verdict on the models than on the judge. Six of the mornings are below, with a
button that shuffles them and hides the names, so you can pick before you know.

## Where it came from

On 20 September I told Claude what I actually wanted from all the agents running on my
machine:

> What I really want is Aaron candy. As in things that give me joy and signal.

The first run went out the next morning: one model, Flux.2 Klein 9B, three posters for a racing
game I'd made that never had cover art. By 24 September the job had its current shape. A
Claude Sonnet 5.5 agent picks one new idea, from one of my characters, one of my projects or
something in my notes, and makes it four ways:

- **oneObsession**, an Illustrious checkpoint, prompted in comma-separated tags;
- **Pony V6 XL**, also tags, behind its `score_9, score_8_up` preamble;
- **Qwen-Image 2.1**, prompted in plain sentences, the one that can letter a sign;
- **MiniMax-H3**, a five-second clip with sound, animated from the best still.

The clips stay off this site: MiniMax-H3's licence excludes the United States, for the model
and its outputs. Everything else here is the job's own output, resized for the web.

Every generation gets a line in a log before the next one starts: the time, the model, one
sentence about what the picture actually shows, the measured seconds, and kept or dropped with
a reason. That log is where every number in this post comes from.

## Judge them yourself

These are six of the eleven mornings since 1 October, each model's better picture of its two
by the job's own notes. Every row is one brief. Press **Judge blind**, pick one per row, then
Reveal: the job's pick is marked.

<ao-blind aspect="1216/832">
<div data-row="2 Oct · Jefrie's first snow, building a snowman under the Storm Bell">
<figure><img src="/media/daily-candy/snow_oneobsession_00002.webp" alt="A masked girl in a red cape kneels in deep snow under a huge armoured tail, holding a tall scythe, beside a snowman and a campfire" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">23.3 s · "tail and scythe both right"</span></figcaption></figure>
<figure><img src="/media/daily-candy/snow_pony_00002.webp" alt="A grey-haired grinning girl in silver armour and a streaming red cape kneels in a blizzard beside a grumpy snowman" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">17.2 s · "energy, cape, grin, the snowman"; no mask, no scythe</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/snow_qwen_00001.webp" alt="Jefrie in a half-mask hugs a snowman in front of an iron-bar dome and watchtowers, her spiked tail curled round them, a sign reading DO NOT STAB" loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">31.2 s · "every canon element lands"; sign spelled exactly</span></figcaption></figure>
</div>
<div data-row="3 Oct · the four levels of reading as a four-storey tea-house library">
<figure><img src="/media/daily-candy/reading_oneobsession_00001.webp" alt="A rainy-night library with tall shelves, paper lanterns, a spiral staircase and an orange cat asleep on an open book" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">29.3 s · "cosy and well composed; one floor, not four"</span></figcaption></figure>
<figure><img src="/media/daily-candy/reading_pony_00002.webp" alt="A painted many-storey library of curving shelves with small orange cats on different stairs" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">20.5 s · "cats on every level, closest to the four-floors idea"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/reading_qwen_00001.webp" alt="A cutaway four-floor tea house in rain with cats reading on each floor and a sign by the door" loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">31.5 s · "all four levels land"</span></figcaption></figure>
</div>
<div data-row="5 Oct · the GPU queue as a tea house: one kettle, cats with numbered tickets">
<figure><img src="/media/daily-candy/gpuqueue_oneobsession_00002.webp" alt="A deep wooden tea house with a stove and teapots, two cats sitting side by side facing the stove" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">31.0 s · "two cats waiting in turn at the pot"; no tickets</span></figcaption></figure>
<figure><img src="/media/daily-candy/gpuqueue_pony_00002.webp" alt="A blue-tiled tea house at dusk with lanterns and teapots, a row of cats peeking from a bush" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">21.9 s · "most atmospheric"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/gpuqueue_qwen_00001.webp" alt="Five cats in a line holding paper tickets face a steaming iron kettle on a charcoal stove under a sign reading ONE POT AT A TIME" loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">39.0 s · sign exact; the tickets read 1, 4, 2, 3 and 7-ish</span></figcaption></figure>
</div>
<div data-row="10 Oct · BloodTailor hands out Halloween candy, and the children are scared of him">
<figure><img src="/media/daily-candy/halloween_oneobsession_00002.webp" alt="A grinning figure in an orange hood holds a jack-o'-lantern candy bowl on a dark porch, a cyan ghost over his shoulder" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">22.4 s · "strong silhouette, grin, ghost"; no children</span></figcaption></figure>
<figure><img src="/media/daily-candy/halloween_pony_00002.webp" alt="A man in a red-brown cloak bows toward a grinning child in a tall white hat beside a carved pumpkin" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">15.1 s · "the gentle offering reads"; plate missing</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/halloween_qwen_00002.webp" alt="BloodTailor, an iron plate over his eyes and a huge grin, holds out a bowl of candy to three children in bedsheet ghost costumes under a banner reading PLEASE, TAKE ONE." loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">23.2 s · "gentlest reading, cleanest lettering"</span></figcaption></figure>
</div>
<div data-row="11 Oct · a boy studying calmly by a rainy window, from my notes on learning">
<figure><img src="/media/daily-candy/study_oneobsession_00002.webp" alt="A boy in a cream sweater reads an open book by tall rainy windows with an orange cat asleep on his lap" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">25.5 s · "reads as studying, cat and tea all present"</span></figcaption></figure>
<figure><img src="/media/daily-candy/study_pony_00002.webp" alt="A smiling orange-haired boy with fox-like ears holds a stack of books at a sunlit desk" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">19.9 s · "the ears are a cat-ear bleed and the cat is missing"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/study_qwen_00002.webp" alt="A poster of a boy writing by a rainy window with a cat on the sill, a banner reading DON'T BE BORED and the line CLOSE THE BOOK. SAY IT FROM MEMORY." loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">25.1 s · both lines of lettering exact</span></figcaption></figure>
</div>
<div data-row="14 Oct · Playback Lens as a brass lens over a scroll of tiny lit rooms">
<figure><img src="/media/daily-candy/lens_oneobsession_00002.webp" alt="A long scroll across a desk with a brass lens on a stand at one end, a teacup and a lit lantern" loading="lazy"><figcaption><b>oneObsession</b><span class="ao-meta">23.4 s · "lens reads clearer"; no rooms in the scroll</span></figcaption></figure>
<figure><img src="/media/daily-candy/lens_pony_00002.webp" alt="A painterly desk at a night window over a lantern-dotted town, with a round brass-framed glass beside a lamp" loading="lazy"><figcaption><b>Pony V6 XL</b><span class="ao-meta">16.9 s · "mood and light are lovely; it shows no scrolling windows"</span></figcaption></figure>
<figure data-verdict="The job's pick"><img src="/media/daily-candy/lens_qwen_00001.webp" alt="A poster of a brass lens on a stand beside a scroll of tiny lit rooms, banner reading EVERY SESSION, REPLAYED." loading="lazy"><figcaption><b>Qwen-Image 2.1</b><span class="ao-meta">34.3 s · "lens and scroll tell the story at once"</span></figcaption></figure>
</div>
<figcaption><b>Six mornings, three models, the same brief per row</b><span class="ao-meta">Each model's better image of two by the job's notes (quoted). All 1216×832; seconds measured, a model's first job of the morning includes loading it. Prompts written by the agent. oneObsession and Pony V6 XL are SDXL-family checkpoints; Qwen-Image 2.1 has a non-commercial licence and this site sells nothing.</span></figcaption>
</ao-blind>

## The same idea, in three dialects

The difference starts in the prompts. Here is what the agent wrote on 10 October for the
Halloween row, oneObsession first, then Pony, then Qwen:

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

A tag list can say there are children in ghost costumes. It can't say they are scared of him,
or that one of them is reaching out anyway, and that relationship was the whole idea. Neither
tag model drew a frightened child. oneObsession put a pumpkin on his head in its first try.

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
<figcaption><b>Every still rendered, kept or dropped by the job</b><span class="ao-meta">candy-log.md, 23 Sep to 15 Oct 2026: 176 stills plus 22 MiniMax-H3 clips (all kept, not shown). Qwen has more because the 30 Sep bonus rounds gave it six images a round to the others' one to four.</span></figcaption>
</ao-bars>

The seconds are close. The median render was 21.3 s for Pony, 26.7 s for oneObsession and
28.8 s for Qwen; the clip takes about 81 s. A whole morning is seven generations and four
minutes of GPU, and the agent's tokens cost $1.75 to $2.87 a morning at API list prices since
1 October. On 4 and 12 October it found the GPU already busy and stood down.

On 30 September I told it my GPU was free and to keep going until I said stop. It ran nine
more rounds, 27 ideas in about two hours, before I typed "stop for now". That afternoon
accounts for most of the 41.

**The judge grades against the brief, and the brief is written in sentences.** Read the
dropped lines and the reasons are almost never about how a picture looks. Pony's Blackwater
poster on 25 September was "the most cinematic and genuinely unsettling of the four despite
the anglerfish being dropped from the render". Its Playback Lens picture was "beautiful but
the lens, the scroll and the idea are lost", and was dropped. Ichigo's autumn morning lost its
Pony picture because a `yellow snail` tag turned into "two empty yellow rowboats each carrying
a small animal-like head, no girl anywhere".

So the 41 doesn't say Qwen draws the best pictures. It says Qwen draws the picture that was
asked for, including the words on the sign, and that an agent holding the request will pick it
every time. The job still makes all three every morning, because its instructions say to.
Going by its own notes, the other two are where the surprises come from: the pictures nobody
asked for, which it keeps, describes kindly, and never chooses.
