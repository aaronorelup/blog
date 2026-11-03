---
id: "AO-039"
title: "Making long AI films on my 8 GB laptop, six seconds at a time"
summary: "For twelve days my laptop made AI films and music videos by chaining six-second clips. What came out, what went wrong in each, and the rules I ended up with."
date: 2026-10-05
topic: "video"
project: ["characters", "blackwater"]
preview:
  verdict: "As good as my notes"
  takeaway: "Chaining six-second clips makes long AI films on a laptop, but the chain keeps every mistake. Every big jump in quality came from my notes, not a setting."
  points:
    - "Painted stills for clips to end on keep the look from drifting. One every 3 clips in action, 5 or 6 in calm ones."
    - "Words summon things. Lantern light gave a campfire, thunder gave lightning, and red wax read as blood."
    - "On 8 GB, models other sessions left loaded turned one clip into 49 minutes. Freeing memory got it back to about ten."
  image: "/media/previews/every-ai-film-so-far.webp"
  loop: "/media/previews/every-ai-film-so-far.mp4"
  alt: "Jefrie with her red cape, long tail and red scythe in a moonlit muddy yard by a watchtower, winding up a sweep"
---

My drive filled up again, so before deleting twenty-odd gigabytes of leftovers I had Claude write
down everything we tried in twelve days of making AI films. Almost all of it ran on MiniMax-H3, an
AI video model that makes about six seconds at a time, on my laptop's 8 GB graphics card. Chained
together, those six seconds made films up to 13 minutes long.

**The chain carries every mistake forward.** Once the look drifts, nothing fixes it afterwards, so
it has to be pinned in advance, with painted stills the clips must end on. And **every big jump in
quality came from my notes, not from a setting.** They were plain notes, like no captions and no
camera snaps.

That was 23 September to 4 October, about 36 GPU-hours.

## What held across all of it

- **Chaining works.** Thirteen minutes of one character, with seams you can't see.
- **Drift can't be fixed after the fact.** The chain remembers the style, so a better reference
  later does nothing.
- **End frames are a dial.** None and it drifts back to a smooth CGI look. One on every clip and it
  copies the bad ones. One every 3 clips in action and 5 or 6 in calm stretches worked.
- **The models copy what you show them.** The image model copies the pose of its reference, and a
  photoreal base image gives Pixar faces. A previs (a rough 3D version of the shot, made first as a
  guide) gets copied too, a colored one as a look and [a bad one as bad motion](/ledger/a-bad-previs/).
- **Words summon things.** Name a person and they show up. "Lantern light" made a campfire and
  "thunder" made lightning.
- **A previs gives you space, camera and timing, and caps the motion.** Only make one if its
  motion beats what the model would invent.
- **Never trust generated text or numbers.** Add them afterwards.
- **On 8 GB, the card is the budget.** Free the memory before every clip, and use two image
  references at most with a previs.

## How the chaining works

H3 makes about six seconds of video with sound per go. An add-on by SatoDive for ComfyUI, the app
I run my models in, saves the clip's latent (the model's internal version of the video), and the
next clip carries on from its last second. The seams are invisible and the sound runs straight
across.

## Jefrie: one film that grew to 13 minutes

Jefrie is my scythe-wielding character, one of the two fighters in
[my fighting game](/ledger/storm-bell-fighter/). It started with two minutes of her reading on
sandbags at dusk, then one unbroken two-minute shot where she vaults a barbed-wire fence, climbs a
building, jumps off the roof and ends at a lookout.

Around clip 9 she started turning into a toy. My reference was a studio-gray render, and the chain
picked up a glossy plastic 3D look. Claude retook clips 9 to 11 with a painted reference, and it
didn't help at all.

<figure>
  <img src="/media/every-ai-film-so-far/stroll-drift.webp" alt="Two contact sheets of Jefrie walking through ruins; both the original chain and the retake have the same glossy toy-like look" loading="lazy">
  <figcaption>Left, the original clips 9 to 11. Right, the retake with a better reference. Same toy. The style lives in the latent now.</figcaption>
</figure>

What pulled it back was end frames. Every clip got a painted still it had to land on, made with
Qwen-Image, an AI image model.

<figure>
  <img src="/media/every-ai-film-so-far/lookout-endframe.webp" alt="Six frames of Jefrie sitting with her scythe; the first two have a white toy-like mask, the later ones are dark painted gunmetal" loading="lazy">
  <figcaption>The first clip after the drift, with a painted end frame. Top left is the toy look it inherited. It doesn't keep it.</figcaption>
</figure>

The next two pieces found the dial. A night of end frames on all 61 clips copied two bad stills, so
H3 animated a tail that wasn't attached to her body. The first try at four minutes of training, with
only 9 end frames in 48 clips, fell straight back to CGI at the first cut. Somewhere in between
worked, with a painted picture of her inside the scene as the reference.

That film has my favorite H3 clip so far, the finishing sweep:

<video class="fill square" controls muted loop playsinline preload="metadata" poster="/media/every-ai-film-so-far/train-s42.jpg" src="/media/every-ai-film-so-far/train-s42.mp4"></video>

A second and a half of stillness, a two-second swing, then a settle. One idea, a steady camera and
an end frame right at the end of the move. Asking for a "pale moonlit streak" got me anime smear
arcs, which I'll take.

All five pieces join into **one film of 13 minutes 16 seconds**. It took about 14 GPU-hours.

<details><summary>The night film and the training film, in more detail</summary>

- **The night film.** I had Claude queue up a night of work by itself, five more minutes with a
  Qwen end frame for every clip, built up front as a storyboard I could review. I loved it, and I
  told it so. But we used end frames too often, and two of the tail close-ups came from images
  where her tail wasn't attached.
- **H3 picks good shots by itself.** The stretches where it was left alone, her sitting on the
  ledge with the cuts around her, were some of the best coverage in the film.
- **Words summoned things that night too.** "Warm lantern or spark light" put a campfire on the
  lookout. "Thunder" in the sound prompt made lightning flash in the picture. Naming a dome in the
  film-wide description put her inside it in the first test.
- **The training film's first try.** With 9 end frames in 48 clips and the camera free to move
  around the yard, H3 fell back to its default look at the very first cut. Green lawn, pink cape,
  near daylight.
- **What fixed it.** An end frame about every three clips in the action, every five or six in the
  calm parts, and a painted picture of her in the scene as the reference instead of a character
  sheet on gray.

</details>

## Echo: 8 minutes that kept the painted look

Echo is [a character Claude designed for my world](/ledger/echo-the-borrowed-voice/), a porcelain
figure with a bell for a head. I loved its four one-minute films enough to give it the GPU for a
night, and it made an **8-minute film of 101 clips in eight chapters**, the first that long to keep
the painted look all the way. Thirty seconds, from the trench chapter:

<video class="fill square" controls playsinline preload="metadata" poster="/media/every-ai-film-so-far/echo-excerpt.jpg" src="/media/every-ai-film-so-far/echo-excerpt.mp4"></video>

- **What's under the painted still matters as much as the prompt.** Stills painted over a
  photoreal base turned every face into a Pixar face. A painterly base held.
- **Side characters drift first.** Echo stayed painted. The child and the soldiers in close-up
  each needed their own end frame and a retake.
- **Distance isn't respected.** A lantern "far away on the horizon" walked up and sat next to Echo.

<figure>
  <img src="/media/every-ai-film-so-far/lantern-creep.webp" alt="Top row: Echo kneeling at a crater with a tiny lantern on the horizon. Bottom row: the same lantern now sitting on the ground right beside Echo" loading="lazy">
  <figcaption>Top, as asked. Bottom, three clips later, the lantern has come to visit. The fix was repeating "a tiny point on the far horizon" and "there is no lantern near Echo" in every beat.</figcaption>
</figure>

- **Color carries meaning you didn't ask for.** Red candle wax on a split bell read as blood. Five clips were redone
  in ivory.
- **A pose sheet as a reference makes two of the character.** Six poses in, two Echos out, one of
  them headless.

The speech check uses Whisper, a speech-to-text model, to make sure no voices slipped into the
sound. On rain and birdsong it confidently hears "thank you for watching, please subscribe and hit
the bell icon." That means there's no speech.

<details><summary>One frame from every shot of the Echo film</summary>

<figure>
  <img src="/media/every-ai-film-so-far/echo-overview.webp" alt="A grid of frames, one per shot, across eight chapters of the Echo film, all in the same painted dark-fantasy style" loading="lazy">
  <figcaption>One frame per shot, all eight chapters.</figcaption>
</figure>

</details>

## BloodTailor: two tutorials, one finished

BloodTailor is my other main character. Two experiments with him followed tutorials from
Higgsfield, a cloud AI video service.

The first, a breakdown of a short film made with Blender and AI, became a 72-second fight with
BloodTailor and Jefrie against mud monsters. H3 kept the gray previs's positions, timing and camera
move, and took the look from the images.

<figure>
  <img src="/media/every-ai-film-so-far/hollows-overlay.webp" alt="A frame from the fight with the Blender previs drawn over it as red outlines" loading="lazy">
  <figcaption>The red lines are the Blender previs, drawn over what H3 made from it.</figcaption>
</figure>

I liked it, but almost all of it ran on Higgsfield's cloud instead of my laptop. It also came out
glossy 3D even though every prompt said "hand-painted, not 3D." And it's where I first hit a
failure that kept coming back. **Name a character in a shot without giving their reference, and H3
invents someone.** I later wrote the method down as [a workflow I can repeat](/ledger/previs-film-flow/).

The second was five 30-second experiments on my laptop. All five previs got built in Blender, and
only the first was rendered before the 8 GB card ran out of room.

<details><summary>The Higgsfield method, the corridor clips, and why the rest never rendered</summary>

The first tutorial's method is asset sheets, a storyboard, a gray Blender previs for the hardest
shots and a five-part prompt per shot. Only one shot of the fight was ever re-rendered on my GPU. A
BloodTailor-only shot got a made-up companion.

The five experiments were a corridor one-take, a dialogue scene at a table, camera moves, a
blood-magic "commercial" and a rooftop chase.

<figure>
  <img src="/media/every-ai-film-so-far/five-b1.webp" alt="Frames from five local clips of BloodTailor walking a prison corridor, including one with an unrequested girl holding a lantern" loading="lazy">
  <figcaption>The corridor one-take. The camera follows the previs well. The armoured girl with the lantern was not invited.</figcaption>
</figure>

The first clip took 49 minutes. The GPU sat at 100% while drawing only about 37 watts, which meant
the model was being swapped in and out of memory, because other sessions had left their models
loaded. Freeing memory first brought the clips back to about ten minutes. Then the dialogue scene,
with four or five reference images plus the previs, overflowed the card completely and was heading
for over an hour and a half per clip. That project was abandoned, and it left two rules. Use two
image references at most with a previs. And if the card sits at 100% but draws only 37 watts, stop
the clip.

</details>

## BLACKWATER "Still on Shift": three versions in eight days

"Still on Shift" is the jukebox song from [BLACKWATER](/ledger/blackwater-weekend/), my cave-diving
zombie game. Its music video got made three times, and why none of them feel right to me is in
[its own post](/ledger/still-on-shift-concept/).

- **v1 was [rendered inside the game](/ledger/still-on-shift-music-video/),** with no AI video
  at all.
- **v2 repainted the game footage with H3.** Its best shot was the ending, made with no previs, 14
  seconds of the diver bursting out of the water. It convinced us a static previs was holding
  everything else back.
- **v3 started over from the song and the lore.** The full four minutes, 97 shots, painted stills
  for every key moment, words written into the world instead of captions, and an edit locked to the
  beat.

Twenty-five seconds of v3:

<video class="fill square" controls playsinline preload="metadata" poster="/media/every-ai-film-so-far/bw-v3-excerpt.jpg" src="/media/every-ai-film-so-far/bw-v3-excerpt.mp4"></video>

<details><summary>What went wrong in v2 and v3</summary>

The first H3 test was very good, but it stuck too closely to the game footage. The fix was to swap
the game's zombies for gray capsules and tell H3 they were placeholders to animate freely. Then the
men started to sway and reach.

<figure>
  <img src="/media/every-ai-film-so-far/bw-test1.webp" alt="Contact sheet of the first H3 test: photoreal miners in a cave, plus a few failures like pale blobs and a red ring tunnel" loading="lazy">
  <figcaption>H3 test 1. Photoreal, but it copied the game's stiff zombie animation, and the game's pale models turned into blobs across the lens.</figcaption>
</figure>

The full v2 had to be restarted twice. First, every cut landed three or four seconds late and empty
shots filled up with invented mannequins, because the film-wide text said "replace every block with
a miner" and it did, everywhere. Then the look drifted back into game graphics until every clip got
a painted end frame.

<figure>
  <img src="/media/every-ai-film-so-far/bw-v2.webp" alt="Forty frames from the finished v2 music video: a diver descending, miners in tunnels, a brass-helmet guardian, the crew photo with one man circled, a red heart" loading="lazy">
  <figcaption>v2, one frame per shot. A big step from v1, but low resolution, one composition repeated, and a diver who changes between shots.</figcaption>
</figure>

v3 ran H3 at 1344×768 and wrote its words on ledgers and stencils in the world. Its failures were
new ones:

- Silt described as a "cloud" rose as bright, solid cotton.
- A drowned stove grew flames.
- Counter digits came out wrong, so exact numbers went in afterwards as overlays.
- Qwen kept adding a fish no matter how many times we said "no fish."
- Two actions in one clip went wild every time. The rule became one action per clip, landed on the
  right word in the edit by changing the clip's speed, not in the prompt.

<figure>
  <img src="/media/every-ai-film-so-far/bw-v3.webp" alt="A strip of frames from v3: the jukebox, a ledger, a stopwatch, the NAVSITE BLACKWATER gate sign, the 1964 crew photo, a calendar for June 1968, a bell" loading="lazy">
  <figcaption>v3 is a different film. Two worlds, 1964 dry and warm, and now black water with one light.</figcaption>
</figure>

</details>

## Moonlight at the Waterline: still not there

The other BLACKWATER song got the whole-song H3 treatment too, 2 minutes 51 in 33 chained clips and
about three GPU-hours, and I still called it extremely subpar. Since then it's been
[drawn entirely in code](/ledger/moonlight-in-code/), and a v4 painted over a 3D set came out on
17 October in [five music videos for one song](/ledger/moonlight-five-times/).

<details><summary>Timing the cuts to the song, and what was still wrong</summary>

Over a whole song, H3's cuts drifted between 6 frames late and 45 frames early against the bars of
the music. So Claude found each real cut and stretched each shot onto its bar.

<figure>
  <img src="/media/every-ai-film-so-far/moonlight-cuts.webp" alt="Frame pairs either side of each detected cut in the Moonlight music video" loading="lazy">
  <figcaption>Checking each detected cut by eye before retiming the shots onto the song's bars.</figcaption>
</figure>

It came out better than the version before it. But the lyrics pasted on top were hard to read,
every shot was exactly one bar long, the same composition kept repeating, and it was 736×416.

</details>
