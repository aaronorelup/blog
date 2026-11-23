---
id: "AO-088"
title: "Posing an AI character with a drawn stick figure"
summary: "I gave an AI image editor a stick figure as a pose guide for my character, with and without the pose in words, and measured how close each picture came. With two prompts to rerun it on your own character."
date: 2026-11-23
topic: "art"
project: []
draft: true
preview:
  verdict: "Stick + words: 5.4° off"
  takeaway: "With a stick figure and the pose in words, my character's limbs came out 5.4 degrees off on average, against 17.8 for words alone and 28.1 for the stick figure alone."
  points:
    - "The stick figure alone did worst. On a side-view sprint the editor ignored it and copied her standing reference pose."
    - "None of the 13 pictures had the stick figure drawn into it. Side-view poses still came back facing the viewer."
    - "One seed per picture. Her tail went missing in one picture and came out thin in another."
  image: "/media/previews/stick-figure-poses.webp"
  alt: "Jefrie, a masked girl with a huge armoured tail, in a deep lunge holding a scythe level above her head"
---

I wanted to know if I could pose my character in an AI image editor just by showing it a stick
figure, without installing ControlNet, the add-on people normally use for posing. A Claude agent
drew four stick figures, gave each one to Qwen-Image 2.1's edit mode as an extra picture, and
measured how far my character's arms and legs landed from the stick figure's. **With the stick
figure and the pose written out in words, her limbs were 5.4 degrees off on average. Words alone
were 17.8 degrees off, and the stick figure alone 28.1.**

- **Stick figure plus words came closest on all four poses.** In the lunge and the star jump
  every joint landed within a fifth of a torso length of the stick figure's.
- **The stick figure alone was worse than words on average.** It won 2 of the 4 poses, but on
  the side-view sprint the editor ignored it and stood her the way she stands in her reference
  pictures.
- **It never drew the stick figure into the picture.** Not once in 13 pictures. One sentence in
  the prompt tells it not to.
- **Side views came back facing the viewer**, and one arabesque lost her tail.

The character is [Jefrie](/ledger/jefrie-lora/), and this was one of
[the daily experiments](/ledger/four-art-techniques/) a Claude agent picks and runs on my laptop's
8 GB graphics card. The pictures and scores are below so you can judge it yourself. If you want
to try it on your own character, there are [two prompts](#try-it-on-your-own-character) for Claude
at the end.

## The four stick figures

<ao-compare cols="1" aspect="4/1">
<figure><img src="/media/stick-figure-poses/stick-figures.webp" alt="Four stick figures in OpenPose colours on black: an arabesque seen from the side, a deep lunge with both arms overhead, a running figure seen from the side, and a star jump" loading="lazy"><figcaption><b>The four targets</b><span class="ao-meta">drawn by a script from hand-set joints · 1024 × 1024 each</span></figcaption></figure>
</ao-compare>

An arabesque seen from the side, a deep lunge with her scythe overhead, a side-view sprint and a
star jump. All four are far from how she stands in her reference pictures. Each pose was made
three ways, with the same seed and the same two reference pictures of her.

- **A, words only.** The pose described in a sentence or two.
- **B, stick figure only.** The stick figure as an extra picture, and a line telling the editor
  to copy its pose.
- **C, both.**

## The best picture of each pose

<ao-compare cols="1" aspect="1/1">
<figure><img src="/media/stick-figure-poses/best-of-each.webp" alt="Jefrie in four poses, two by two: an arabesque, a deep lunge with the scythe held level overhead, a side-view running leap and a star jump, each with its target stick figure in the corner" loading="lazy"><figcaption><b>The closest picture of each pose</b><span class="ao-meta">Qwen-Image 2.1 edit · 1024 × 1024 · 25 steps · seed 3801 · the arabesque shows B (8.7°) because C (8.4°) drew no tail</span></figcaption></figure>
</ao-compare>

## All 12, scored

<ao-compare cols="1" aspect="1100/1320">
<figure><img src="/media/stick-figure-poses/all-12-scored.webp" alt="A grid of the four target stick figures down the left, then Jefrie in each pose three ways: words only, stick figure only, and both, with the limb error in degrees under each picture" loading="lazy"><figcaption><b>Every picture with its score</b><span class="ao-meta">big number = error on the limbs all three versions share · gold = closest · opens full size</span></figcaption></figure>
</ao-compare>

The big number under each picture is how far off her limbs are, in degrees, averaged over the
limbs that were found in all three versions of that pose. That's the number the averages use.
"all-limb" is the same over every limb found in that one picture. "null" is that picture scored
against the other three stick figures, 35 to 58 degrees. Every picture was closer to its own
stick figure than to any of the other three.

<ao-bars max="60" unit="°">
<table>
<thead><tr><th>Pose</th><th>A, words</th><th>B, stick figure</th><th>C, both</th></tr></thead>
<tbody>
<tr><td>Arabesque</td><td>26.5</td><td>8.7</td><td>8.4</td></tr>
<tr><td>Lunge, scythe overhead</td><td>10.0</td><td>9.3</td><td>2.9</td></tr>
<tr><td>Side-view sprint</td><td>26.4</td><td>58.1</td><td>6.3</td></tr>
<tr><td>Star jump</td><td>8.2</td><td>36.5</td><td>4.1</td></tr>
<tr><td>Average</td><td>17.8</td><td>28.1</td><td>5.4</td></tr>
</tbody>
</table>
<figcaption><b>Limb error per pose</b><span class="ao-meta">degrees, lower is closer · limbs common to A, B and C: 7, 9, 5 and 10</span></figcaption>
</ao-bars>

Words alone came within 10 degrees on the two poses that face the viewer, the lunge and the star
jump, and drifted to 26 on the arabesque and the sprint. The stick figure alone lost where it is
hard to read. The sprint has crossing limbs, and the editor ignored it and copied her standing
pose. In the star jump it took the legs and left her arms hanging.

## What OpenPose saw

OpenPose is a free model that finds a person's joints in a picture. The stick figures use its
colours, and it's also what scored every picture.

<ao-compare cols="1" aspect="1060/1410">
<figure><img src="/media/stick-figure-poses/what-openpose-saw.webp" alt="All twelve pictures of Jefrie with the coloured skeleton OpenPose found drawn over each, and the target stick figure in the top right corner" loading="lazy"><figcaption><b>The skeleton OpenPose found in every picture</b><span class="ao-meta">target in the corner · hollow circles = joints under 0.6 confidence, not counted · the err in each label is all-limb · opens full size</span></figcaption></figure>
</ao-compare>

It has trouble with side views. In the sprint with both, it found only 8 of her 14 joints, so
that picture is scored on 5 limbs. It also decides left and right separately for the arms and the
legs. A picture facing the viewer of a side-view target got its arms labelled from one side and
its legs from the other. So the agent scores each picture four ways (as labelled, all swapped,
arms swapped, legs swapped) and keeps the best.

That rule was changed after the first test picture and before the other twelve. Under the rule as
first written, swap everything or nothing, the result is mixed: both wins 2 of 4 poses and the
averages tie, 16.9 degrees for both and 17.0 for words. Both sets of numbers are in the agent's
table.

## What went wrong

- **One seed per picture.** The sprint with both was re-run at a second seed and came out the
  same, 4.5 degrees.
- **Side-view targets came back facing the viewer.** All three arabesques face you. The layout of
  the limbs carries over, but not which way her body faces.
- **Her tail isn't in the stick figure.** The arabesque with both has no tail at all, and the star
  jump with both has a thinner one than she should.
- **Her props.** In the lunge with the stick figure alone she holds the torn tip of her ear like a
  rag and stands the scythe upright with the blade on the ground.

## The stick-figure sentence

If you only want the trick, this is the line that went into the prompt after the description of
the character. In the closest pictures the pose in words came right after it.

```
Her pose is exactly the pose of the stick figure in <image2>: the same angle of every arm,
leg and her body, at the same place and size in the picture. <image2> is only a pose guide:
draw no lines, dots or stick figure in the picture.
```

## Try it on your own character

You need Claude Code and ComfyUI. Use Claude Opus 5.5 at high effort, which is what ran the
original. On my 8 GB laptop card the 13 pictures took 23 minutes of graphics card, and the model
files are about 17 GB.

**1. Set up.** Paste this first. It reads the recipe, checks what you already have and installs
only what's missing.

```
Get this computer ready to rerun the experiment in
https://aaronorelup.com/ledger/stick-figure-poses/notes.md
ComfyUI is already installed. Install only what's missing, test each piece once,
then tell me what you installed and where.
```

**2. Run it.** Put a picture of your character on the first line. The second line is for anything
you want done differently, like your own image model or your own poses. Leave it as it is to
match my test.

```
My character: C:\path\to\your-character.png
Change: nothing

Rerun the experiment in
https://aaronorelup.com/ledger/stick-figure-poses/notes.md
with my character, on my own setup where it fits. Keep the four stick figures and the
three versions so my scores compare with the post. Show me the scored grid and what
OpenPose saw when it's done.
```

The recipe both prompts point to is [the notes page](/ledger/stick-figure-poses/notes/): the
stick figures, the model and settings, the prompts, and the scripts that score the pictures and
draw the two sheets.

*A Claude agent designed and ran the experiment on my laptop, and Claude wrote this post from its
notes.*
