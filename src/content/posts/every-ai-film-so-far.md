---
id: "AO-039"
title: "Twelve days of AI films on an 8 GB laptop: everything I tried, and how each one turned out"
summary: "Between September 23rd and October 4th my laptop made a 13-minute Jefrie saga, an 8-minute Echo film, a monster fight, three versions of a music video and a song video that I still call subpar. About 36 GPU-hours of MiniMax-H3. Here is every method, what it got right, and the failure each one taught me."
date: 2026-10-05
status: "shipped"
tags: ["minimax-h3", "ai-video", "comfyui", "previs", "lessons"]
---

Today I cleaned out my films folder. My drive had filled up again, and the folder was twenty-odd gigabytes of
saved latents, frame dumps, retakes and previs renders sitting next to the handful of films they produced. Before
deleting any of it I had Claude go through every project and write down what we tried, why, and how it turned out,
because the intermediate files are where the lessons were.

This is that write-up. It covers twelve days, September 23rd to October 4th: about **36 hours of GPU time**, almost
all of it MiniMax-H3 running locally on an 8 GB RTX 4070 laptop. Some of it I'm proud of. Some of it I've called
"extremely subpar." Both kinds are in here.

## The one trick everything is built on

MiniMax-H3 makes about six seconds of video with sound per generation. That's the ceiling for one clip. What made
everything else possible was a ComfyUI pack by SatoDive that saves the clip's latent (the model's internal version
of the video) and lets the next generation continue from it. Each new segment takes the last second of the previous
one as its starting context, then carries on. Joined frame-exact, the seams are invisible and the ambient sound runs
straight across them.

So a long film is a chain of six-second links. That's also the catch, and most of this post is about it: **the chain
carries everything forward, including its mistakes.**

## Jefrie: one film that grew to 13 minutes

It started with a two-minute film of Jefrie reading on the sandbags at dusk. Then I asked for a continuous two-minute
shot continuing from it: she closes the book, walks off, vaults a barbed-wire fence, climbs a building, jumps off the
roof and ends at a lookout.

It worked, and it's two unbroken minutes of one camera. But around segment 9 she started turning into a toy. The
reference image I'd given was a studio-grey render of her, and the chain picked up a glossy, plastic 3D look and her
white full-face mask came back. Claude retook segments 9 to 11 with a painted reference. It didn't help at all:

<figure>
  <img src="/media/every-ai-film-so-far/stroll-drift.webp" alt="Two contact sheets of Jefrie walking through ruins; both the original chain and the retake have the same glossy toy-like look" loading="lazy">
  <figcaption>Left: the original segments 9–11. Right: the retake with a better reference. Same toy. The latent remembers the style.</figcaption>
</figure>

That was the first big lesson. **Once a chain has drifted, a better reference can't pull it back.** The style lives
in the latent now.

What did pull it back was end frames. For the next piece, a 16-second "she sharpens her scythe, then a close-up of her
face," every segment got a painted still (made with Qwen-Image 2.1) as the frame it had to land on. The first segment
starts on the toy look inherited from the stroll and is painted again by the end of the clip:

<figure>
  <img src="/media/every-ai-film-so-far/lookout-endframe.webp" alt="Six frames of Jefrie sitting with her scythe; the first two have a white toy-like mask, the later ones are dark painted gunmetal" loading="lazy">
  <figcaption>The first clip after the drift, with a painted end frame. Top left is what it inherited; it doesn't keep it.</figcaption>
</figure>

Then I asked Claude to queue up a night's worth of work by itself: five more minutes, with a Qwen end frame for
**every** segment, built up front as a storyboard I could review. That became the 5-minute night film, 61 segments.
I loved it, and I told it so. But we used end frames too often, and sometimes we used one that was a bad image
generation. Two of the tail close-ups came from Qwen images where her tail wasn't attached to her body, and H3 faithfully
animated a detached tail. And the stretches where H3 was left alone, sitting on the ledge with the cuts around her,
were some of the best coverage in the film. It's actually good at picking shots when you let it.

There were smaller lessons that night too, all of the same kind: **words summon things**. "Warm lantern or spark
light" put a campfire on the lookout. "Thunder" in the audio prompt made lightning flash in the picture. Naming the
dome in the film-wide description teleported her into it in the first test.

The last piece was four minutes of her training, with the camera free to move around the yard. The first try used only
9 end frames out of 48, and H3 fell straight back into its default smooth 3D-CGI look at the very first cut: green
lawn, pink cape, near daylight. What balanced it was an end frame about every three segments in the action stretches
and every five or six in the calm ones, plus a painted picture of her *inside the scene* as the reference instead of a
character sheet on grey.

That film also has my favourite H3 generation so far, segment 42, the finishing sweep:

<video controls muted loop playsinline preload="metadata" poster="/media/every-ai-film-so-far/train-s42.jpg" src="/media/every-ai-film-so-far/train-s42.mp4" style="width:100%;border-radius:0"></video>

About a second and a half of stillness, then an explosive two-second swing, then a settle. One idea in the clip, a
steady camera, an end frame at the exact end of the move. The motion streaks came from asking for a "pale moonlit
streak" and getting anime smear arcs, which I'll take.

All five pieces join into **one 13-minute-16-second film**, made six seconds at a time on a laptop. It took about
14 GPU-hours.

## Echo: a character Claude designed for itself

On the 25th I asked Claude to design its own character for my world, with me picking between four options at every
step. It came up with Echo: a porcelain bell-headed former mouthpiece of the Devil who has no voice of its own and
keeps dead soldiers' last words as porcelain face-beads. It made four one-minute films over two rounds (the
[whole story of that is here](/ledger/echo-the-borrowed-voice/)), and I loved them enough that I gave it the GPU for a
whole night.

What it did with the night was an **8-minute, 101-segment film in eight chapters** that ties all four shorts into one
story. It's the first time a film that long held the painted look the whole way through:

<figure>
  <img src="/media/every-ai-film-so-far/echo-overview.webp" alt="A grid of frames, one per shot, across eight chapters of the Echo film, all in the same painted dark-fantasy style" loading="lazy">
  <figcaption>One frame per shot, all eight chapters.</figcaption>
</figure>

Thirty seconds of it, from the trench chapter:

<video controls playsinline preload="metadata" poster="/media/every-ai-film-so-far/echo-excerpt.jpg" src="/media/every-ai-film-so-far/echo-excerpt.mp4" style="width:100%;border-radius:0"></video>

The Echo films taught their own lessons:

- **What's under the keyframe matters as much as the prompt.** Two films used the same method. One had keyframes
  painted over a photoreal plate, and every face in it drifted into Pixar: a big-eyed CG boy on a cot. The other used
  a painterly plate and held. Same with Jefrie's grey studio reference becoming a toy.
- **Side characters drift first.** In the 8-minute film Echo stayed painted, because it was anchored everywhere, but
  the child and the soldiers in close-up drifted toward photoreal. Each needed its own painted end frame and a retake.
- **Distance isn't respected.** A lantern described as "far away on the horizon" walked up and sat next to Echo:

<figure>
  <img src="/media/every-ai-film-so-far/lantern-creep.webp" alt="Top row: Echo kneeling at a crater with a tiny lantern on the horizon. Bottom row: the same lantern now sitting on the ground right beside Echo" loading="lazy">
  <figcaption>Top: as asked. Bottom, three segments later: the lantern has come to visit. The fix was repeating "a tiny point on the far horizon; there is no lantern near Echo" in every beat.</figcaption>
</figure>

- **Colour carries meaning you didn't ask for.** Red candle wax on a split bell read as blood, and five segments had to
  be redone with ivory wax.
- **A pose sheet as a reference makes two of the character.** Six poses in, two Echos out, one of them headless.

And one I still find funny: the speech check uses Whisper to make sure no voices slipped into the ambient audio.
On rain and birdsong it confidently hears "thank you for watching, please subscribe and hit the bell icon." That means
there's no speech.

## BloodTailor: two tutorials, one finished

Two experiments came from following other people's tutorials step by step.

The first was Higgsfield's own Blender-plus-AI breakdown: asset sheets, a storyboard, grey-geometry Blender previs for
the hardest shots, a five-block prompt per shot. Claude followed it and made "The Hollows at the Storm Bell," a
72-second fight with BloodTailor and Jefrie against mud monsters. The grey previs as a video reference worked. H3 kept
the blocking, timing and camera move and took the look from the images:

<figure>
  <img src="/media/every-ai-film-so-far/hollows-overlay.webp" alt="A frame from the fight with the Blender previs drawn over it as red outlines" loading="lazy">
  <figcaption>The red lines are the Blender blocking, drawn over what H3 made from it.</figcaption>
</figure>

I liked it. But almost all of it ran on Higgsfield's cloud, and I'd wanted it done locally. Only one shot was ever
re-rendered on my GPU. It also came out glossy 3D even though every prompt said "hand-painted, not 3D." And it's where
I first saw a failure that kept coming back: **name a character in a shot without giving their reference, and H3
invents someone.** A BloodTailor-only shot got a hybrid companion.

The second tutorial was five 30-second experiments for BloodTailor, all local: a corridor one-take, a dialogue scene at
a table, camera moves, a blood-magic "commercial," a rooftop chase. All five previs got built in Blender. Only the
first block was ever rendered:

<figure>
  <img src="/media/every-ai-film-so-far/five-b1.webp" alt="Frames from five local clips of BloodTailor walking a prison corridor, including one with an unrequested girl holding a lantern" loading="lazy">
  <figcaption>The corridor one-take. The camera follows the previs well. The armoured girl with the lantern was not invited.</figcaption>
</figure>

The first clip took 49 minutes instead of 5. The GPU sat at 100% while drawing about 37 watts, meaning the model was
being paged in and out of memory because other sessions had left their models loaded. Freeing memory first brought the
clips back to about ten minutes. Then the dialogue scene, with four or five reference images plus the previs,
overflowed the 8 GB card completely and projected over an hour and a half per clip. That project was abandoned, and it
left a rule in my notes: **with a previs, two image references at most.**

## BLACKWATER "Still on Shift": three versions in eight days

"Still on Shift" is the jukebox song from my cave-diving zombie game. Its music video got made three times, each time
with a different main pipeline.

**v1** [rendered inside the game itself](/ledger/still-on-shift-music-video/), no AI video model at all. Claude wrote a
director script that ran in Godot, staged 35 shots with the game's caves and crew, and cut them to the song. My notes on
it: zombies swam into the lens, the camera shook violently, the guide line was far too white, and the captions made it
feel more like an ad than a music video.

So for **v2** we tried local H3, starting with a 30-second test that repainted the game footage into photoreal:

<figure>
  <img src="/media/every-ai-film-so-far/bw-test1.webp" alt="Contact sheet of the first H3 test: photoreal miners in a cave, plus a few failures like pale blobs and a red ring tunnel" loading="lazy">
  <figcaption>H3 test 1. Photoreal, but it copied the game's stiff zombie animation, and the game's pale models turned into blobs across the lens.</figcaption>
</figure>

It was very good, but it was adhering too much to the previs. The fix was to replace the game's zombies with grey
capsules in the previs and tell H3 they were placeholders to be animated freely. That worked, and the men started to
sway and reach. The full v2 then had to be restarted twice: first because every cut landed three or four seconds late
and empty shots filled up with invented mannequins (the film-wide text said "replace every block with a miner," so it
did, everywhere), and then because the look drifted back into game graphics until every segment got a painted end
frame:

<figure>
  <img src="/media/every-ai-film-so-far/bw-v2.webp" alt="Forty frames from the finished v2 music video: a diver descending, miners in tunnels, a brass-helmet guardian, the crew photo with one man circled, a red heart" loading="lazy">
  <figcaption>v2, one frame per shot. A big step from v1, but low resolution, one composition repeated, and a diver who changes between shots.</figcaption>
</figure>

The best shot in v2 was the ending, which I'd asked to be done with no previs at all: an up-close, dynamic 14 seconds
of the diver bursting out of the water with the heart, straight to video at 1344×768. It was the shot that convinced
us a static previs was holding everything else back.

**v3** started over from the song and the lore instead of the game: the full four minutes, 97 shots, Qwen-Image
keyframes, H3 at 1344×768, words written into the world on ledgers and stencils instead of captions, and an edit locked
to the beat. Twenty-five seconds:

<video controls playsinline preload="metadata" poster="/media/every-ai-film-so-far/bw-v3-excerpt.jpg" src="/media/every-ai-film-so-far/bw-v3-excerpt.mp4" style="width:100%;border-radius:0"></video>

<figure>
  <img src="/media/every-ai-film-so-far/bw-v3.webp" alt="A strip of frames from v3: the jukebox, a ledger, a stopwatch, the NAVSITE BLACKWATER gate sign, the 1964 crew photo, a calendar for June 1968, a bell" loading="lazy">
  <figcaption>v3 is a different film: two worlds, 1964 dry and warm, now black water with one light.</figcaption>
</figure>

Its failures were new ones. Silt described as a "cloud" rose as bright opaque cotton. A drowned stove grew flames.
Counter digits came out wrong, so exact numbers went in as code overlays. Qwen kept adding a fish no matter how many
times we said "no fish." Two actions in one clip went wild every time, so the rule became one action per clip, landed
on the right word in the edit by changing the clip's speed, not in the prompt.

## Moonlight at the Waterline: still not there

The other BLACKWATER song got the whole-song H3 treatment too: 2 minutes 51, 33 chained segments, about three GPU-hours,
driven by grey renders from the game. The new thing here was timing. Over a whole song, H3's cuts drifted between 6
frames late and 45 frames early against the bar lines, so Claude found each real cut and stretched each shot onto its
bar:

<figure>
  <img src="/media/every-ai-film-so-far/moonlight-cuts.webp" alt="Frame pairs either side of each detected cut in the Moonlight music video" loading="lazy">
  <figcaption>Checking each detected cut by eye before retiming the shots onto the song's bars.</figcaption>
</figure>

It came out better than the version before it, and I still said it was extremely subpar. The lyrics pasted on top were
hard to read, every shot was exactly one bar long, the same composition kept repeating, and it was 736×416. It's moved
on since: [a version drawn entirely in code](/ledger/moonlight-in-code/), and a v4 that's still in progress.

## What held across all of it

1. **Latent chaining works.** Thirteen minutes of one character, six seconds at a time, on a laptop, with invisible
   seams.
2. **The chain remembers style.** Drift can't be fixed after the fact. Anchor it before, with painted end frames.
3. **End frames are a dial, not a switch.** None and it falls back to CGI. On every segment, bad keyframes get copied
   and H3 stops choosing its own shots. Every three segments in action and five or six in calm worked.
4. **The models copy what you show them.** Qwen copies the reference pose. A photoreal plate gives Pixar faces. A
   coloured previs gets copied as a look. [A bad previs gets copied as bad motion](/ledger/a-bad-previs/).
5. **Words summon things.** Name a person and they appear. "Lantern light" is a campfire, "thunder" is lightning,
   "cloud" is cotton, red wax is blood.
6. **A previs gives you space, camera and cut timing, and caps the motion.** Make one only if its motion is better than
   what the model would make up.
7. **Never trust generated text or numbers.** Put them in afterwards.
8. **On 8 GB, the card is the budget.** Free memory before every clip, two references with a previs, and if it's
   pegged at 100% on 37 watts, stop it.

The one that matters most to me isn't technical, though. Every big jump in quality came from my notes, not from a
setting: no captions, no camera snaps, never show the heart, the Lamp Man for half a second and no more. The pipeline got
better each time, but it got better in the direction I pointed it. Twelve days in, the films aren't good because the
model is good. They're as good as the notes I gave it.
