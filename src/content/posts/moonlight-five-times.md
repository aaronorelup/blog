---
id: "AO-056"
title: "A love song's music video, made five ways with AI"
summary: "Claude made five music videos for a love song from my game, each a different way. What broke in each, how the newest keeps its setting consistent, and how it compares with the one drawn in code."
date: 2026-10-17
topic: "video"
project: ["blackwater"]
preview:
  verdict: "AI models copy the guide"
  takeaway: "The AI models copied whatever they were shown, mistakes and all. So the newest version paints over a 3D set, blurred until only the layout is left."
  points:
    - "The whole-song AI video cut copied its gray game-engine guide and repeated one composition about a dozen times."
    - "The version eight agents drew in code, with no AI image or video model, might still be the better video."
    - "The final render ran on a rented GPU for $2.44. Six shots came back for retakes, one of them twice."
  image: "/media/previews/moonlight-five-times.webp"
  loop: "/media/previews/moonlight-five-times.mp4"
  alt: "The man in his flat cap looking up into a night sky full of rising bubbles, his lantern in his hand"
---

Claude has now made five music videos for "Moonlight at the Waterline", the love song from
[BLACKWATER](/ledger/blackwater-weekend/), the cave-diving zombies game I built in four days. In
the song a man waits all night at the end of a stone jetty with a lantern, while someone he loves
dives a sea cave across the bay. We never see who.

**The versions made with AI models kept failing the same way. The model copied whatever it was
shown, mistakes included.** So the new one paints every shot of him over a 3D set of the jetty,
blurred until only the layout is left to copy. I think the one drawn in code might still be the
better video.

<video controls playsinline preload="metadata" poster="/media/moonlight-v4/poster.webp" src="/media/moonlight-v4/moonlight_v4_720.mp4" style="width:100%;border-radius:8px"></video>

The new one is 34 shots over 2:45, painted to look like a film still from 1968. Most of the
motion comes from MiniMax-H3 (H3 for short), an AI video model. Three shots of rising bubbles
are drawn in code. The final render ran on
[a rented graphics card](/ledger/renting-a-gpu/) for $2.44.

## The new one next to the one drawn in code

I like [the version eight agents drew in code](/ledger/moonlight-in-code/) a lot. Both are timed
to the same song, so they play in sync. Click a lyric line and both jump to it.

<ao-cues labels="v4 · painted, MiniMax-H3 · 17 Oct|Code · eight agents, no image or video model · 4 Oct">
<video controls muted playsinline preload="metadata" poster="/media/moonlight-v4/poster.webp" src="/media/moonlight-v4/moonlight_v4_720.mp4"></video>
<video controls muted playsinline preload="metadata" poster="/media/moonlight-in-code/poster.webp" src="/media/moonlight-in-code/moonlight_code_mv_720.mp4"></video>
<ol>
<li data-t="0:00">(the jukebox / the title)</li>
<li data-t="0:06.83">The tide is slowly creeping up the sand</li>
<li data-t="0:14.77">The evening breeze is chilling on my hand</li>
<li data-t="0:22.43">Your empty coat is sitting here with me</li>
<li data-t="0:28.41">I'll watch the silver ripples on the sea</li>
<li data-t="0:33.83">And I'll wait for you</li>
<li data-t="0:37.81">The lighthouse throws its long and lonely beam</li>
<li data-t="0:45.47">While far below you chase an underwater dream</li>
<li data-t="0:53.33">I check my pocket watch and sigh once more</li>
<li data-t="1:00.51">The bubbles rising slowly to the shore</li>
<li data-t="1:08.31">You're a little late, my love</li>
<li data-t="1:14.30">Moonlight at the waterline</li>
<li data-t="1:20.55">I'm keeping vigil by the sea so blue</li>
<li data-t="1:26.33">But deep down dark where secrets stay</li>
<li data-t="1:32.17">The heavy water keeps the things it likes</li>
<li data-t="1:37.89">So please come back to me</li>
<li data-t="1:44.97">I see your oxygen bubbles rise</li>
<li data-t="1:53.33">Floating up into the starry skies</li>
<li data-t="2:01.15">My heart beats double time</li>
<li data-t="2:06.33">Under the pale moonshine</li>
<li data-t="2:11.81">Oh, tell me you're alright</li>
<li data-t="2:21.37">The water keeps what it likes</li>
<li data-t="2:27.89">But you will return</li>
<li data-t="2:32.11">Won't you, my love?</li>
</ol>
<figcaption><b>Moonlight at the Waterline, the new one (v4) and the code version</b><span class="ao-meta">Both 2:45, timed to the same song · click a line to send both there</span></figcaption>
</ao-cues>

The code version never loses its one idea, his lantern above the water and her lamp below. Every
word is readable before it's sung. Its weak spots are hands, her coat, and a jump from kneeling to
sitting at the drop. The new one has a real place. The jetty and the town stay the same from every
angle, and the camera rises, circles him and sinks through the waterline. It also took three
rounds of stills and seven thrown-out takes, and one round sat twelve days waiting on my answer.

## What each version taught me

- **v1 copied an old story draft from the game's folder.** It put the wrong lover on the jetty,
  because my prompt never said who sings.
- **v2 fixed the casting.** Up close, its people still looked like game models.
- **The whole-song H3 cut copied its gray guide.** It repeated one composition about a dozen
  times, and every shot lasted exactly one bar.
- **The code version had no image or video model that could copy anything.** Eight agents made
  it in 80 minutes, and that might be why it holds up so well.
- **The new one copied its 3D set too, box houses and all.** Blurring the set before painting
  over it fixed that.
- **Naming a light's owner paints the owner.** "A diver's lamp" put a diver in 9 of 11 cave
  frames.
- **A painted last frame has to fit the camera move.** When it didn't, H3 jumped straight to it
  instead of moving.

## Five videos, one song

In the player above, the new one is labeled v4.

| Version | Date | How it was made | What was wrong |
|---|---|---|---|
| v1 | 27 Sep | 3D models built in Blender, filmed inside the Godot game engine | The wrong person on the jetty, the cave creature shown instead of hinted at, lyrics out of frame |
| v2 | 27 Sep | The same, after one paragraph of notes from me | Right casting, crude faces up close |
| The H3 cut | 27 to 28 Sep | v2's frames as a guide for the MiniMax-H3 video model | The same shot again and again, every cut on the bar, small soft lyrics |
| The code version | 4 Oct | Eight agents drawing every frame in code, no image or video model | Hands, and a coat that reads like a loaf of bread |
| v4, the new one | 17 Oct | AI paintings over a 3D set, animated by MiniMax-H3 | Seven takes thrown out before it was done |

## The first three versions

Claude built [the first two cuts](/ledger/moonlight-two-cuts/) in Blender, a free 3D program,
and filmed them inside Godot, a free game engine. There was no AI video at all. This is v2.

<video controls muted playsinline preload="metadata" poster="/media/moonlight-two-cuts/v2_poster.webp" src="/media/moonlight-two-cuts/v2.mp4" style="width:100%;border-radius:8px"></video>

So I asked for the whole song through H3. Claude gave it v2's frames as a guide (a previs, a rough
version of every shot). It also painted over those frames with Qwen-Image, an AI image model, to
make the still each clip ends on. That came to 33 six-second clips chained end to end, about 2.9
hours on my laptop's graphics card.

<video controls playsinline preload="metadata" poster="/media/moonlight-v4/h3_whole_poster.webp" src="/media/moonlight-v4/h3_whole_song_720.mp4" style="width:100%;border-radius:8px"></video>

It looked more like a film and less like a game. I told Claude it was "a lot better, but is still
extremely subpar". H3 copied the guide's one composition, him from behind with the moon on the
water, about a dozen times. Every shot lasted exactly one bar, so the edit has no shape.

<details><summary>Everything else wrong with the H3 cut</summary>

- The lyrics were pasted back on in spots chosen for the Godot framing, small and thin over
  different pictures.
- Her gear changed from shot to shot.
- Bubbles rose to a visible surface, even though the prompt said you never see the surface.
- It rendered at 736x416, so it was soft.

</details>

Here are frames from across the whole cut. It's row after row of the same shot.

<img src="/media/moonlight-v4/h3_whole_sheet.webp" alt="A contact sheet of the H3 cut: row after row of the man from behind on a jetty under the moon, with a few underwater frames between" style="width:100%;border-radius:8px" loading="lazy">

## What I cut from the first plan

The new one started with a brief that called v2 the bar to beat. Claude's first board had 38
painted keyframes. A board is a set of stills, one per key moment, that I OK before any video
gets made. I cut these four ideas.

<ao-compare cols="4" aspect="16/9">
<figure><img src="/media/moonlight-v4/b1_her_face.webp" alt="The diver's face behind an oval mask, underwater" loading="lazy"><figcaption><b>Her face</b><span class="ao-meta">cut: nobody should know who dives</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_flashback.webp" alt="A warm memory: the woman's head on the man's shoulder on a moonlit beach" loading="lazy"><figcaption><b>The flashback</b><span class="ao-meta">cut, for the same reason</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_surface_bubbles.webp" alt="Bubbles rising along the guide line toward a bright surface" loading="lazy"><figcaption><b>Bubbles at the surface</b><span class="ao-meta">she's far off, not under him</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_old_man.webp" alt="The man as an old man on the jetty with the lantern and her red coat" loading="lazy"><figcaption><b>The old man</b><span class="ao-meta">cut: no time jump</span></figcaption></figure>
</ao-compare>

My notes said you should never see her face or be able to tell the diver's gender. No old man,
and a lot more camera movement. The note that shaped everything after it was about the place.
"In every clip of him standing there the surroundings are slightly different."

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/moonlight-v4/b1_jetty_a.webp" alt="The man on a low jetty, the lantern on the stones beside him" loading="lazy"><figcaption><b>Keyframe 4</b><span class="ao-meta">a low stone pier</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_jetty_b.webp" alt="The man sitting on a wall with the coat and lantern, a harbour behind" loading="lazy"><figcaption><b>Keyframe 8</b><span class="ao-meta">a sea wall with a harbour</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_jetty_c.webp" alt="The man holding the lantern up on a wide jetty, a lighthouse behind" loading="lazy"><figcaption><b>Keyframe 18</b><span class="ao-meta">a wide jetty and a lighthouse</span></figcaption></figure>
</ao-compare>

<details><summary>My other notes on the first board</summary>

- Bubbles breaking the surface by the jetty made no sense when she's far across the bay.
- No bubble-to-moon dissolve.
- The reel was in the water in some shots and not in others. Some shots had a dock and some
  didn't.

</details>

## Building the jetty in 3D first

I suggested painting him once and spinning a camera around him with H3 to get a 3D model. Claude
tested it first. H3 made up the side it couldn't see, a whole town of colored houses included,
and the props around him moved. Every run would invent a different place.

<img src="/media/moonlight-v4/turntable_test.webp" alt="Frames from an H3 orbit around the painted man: the background changes and invents a town on the cliff" style="width:100%;border-radius:8px" loading="lazy">

So Claude built the place first, in Blender, from code. A jetty, a headland with a lighthouse, a
line of cork floats out to the cave, and the moon pinned to one spot. Every shot of him became a
painting over a render of that set from the shot's own camera.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/moonlight-v4/guide_S04.webp" alt="A grey 3D render of a stand-in figure on the jetty with the town behind" loading="lazy"><figcaption><b>The set, from shot 4's camera</b></figcaption></figure>
<figure><img src="/media/moonlight-v4/paint_S04.webp" alt="The same view painted: the man in his overcoat by the parapet, the coat beside him, the town on the hill" loading="lazy"><figcaption><b>Painted over it</b></figcaption></figure>
</ao-compare>

<details><summary>How each painting knew what its camera could see</summary>

The prompt for each painting named only what that camera could actually see. Claude worked that
out by checking the line of sight from the camera to every landmark. Without it, a view facing
away from the sea came back with a moon and a lighthouse pasted in.

</details>

My next note said "the 3d space doesn't change every time like it used to". But now the paintings
stuck to the set too much. The town was flat, identical box houses, because that's how the set had
it. "Because your previs has no trees, there are no trees in the image."

## Blurring the set so only the layout gets copied

The fix was to give the painter less. Claude now blurs the set render before Qwen-Image sees it,
and the prompt says to keep the camera, the horizon and the big shapes, and to paint every
surface fresh. The town became one wide painting of cottages on a wooded hillside, hung on a
curved card in the set, 120 metres behind the jetty. Every camera sees the same town from its own
angle.

Same shots, three ways. Strictly over the set, loosely with no town, and loosely with the painted
town.

<img src="/media/moonlight-v4/strict_none_backdrop.webp" alt="The same shots painted three ways: strictly over the set, loosely with no town, and loosely with the painted town backdrop" style="width:100%;border-radius:8px" loading="lazy">

H3 gets no guide video this time. Each clip only moves between its painted first and last frames.
There's a setting that's supposed to make H3 follow a guide less. A test on
[Earthlight](/ledger/earthlight/), an episode of my
[AI TV series](/courses/i-love-my-evening-television/), found it changed almost nothing at any
value between 0.55 and 0.85. How much of a guide gets copied depends on what you put in the guide.

## The cave, the retakes and the ending

Six shots came back for retakes, one of them twice. Most had the same cause. A painted last frame
has to be a believable end of the camera move, or H3 cuts to it instead of moving there.

<details><summary>The cave lamp, the render, the retakes, the ending and the bubbles</summary>

**The cave lamp.** The caves got no set at all. They're painted from words, very dark, lit by a
beam from outside the frame. The first batch put a diver in 9 of 11 frames, because the prompt
said "a diver's lamp", and naming the light's owner paints the owner. The light is now just a
shaft from somewhere outside the picture, and the cave is empty.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/moonlight-v4/cave_diver_painted_in.webp" alt="A cave frame with a diver holding a lamp beside a toy diver" loading="lazy"><figcaption><b>"A diver's lamp"</b><span class="ao-meta">9 of 11 frames grew a diver</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/cave_empty.webp" alt="The red toy diver alone on a ledge in a shaft of warm light" loading="lazy"><figcaption><b>"A shaft of light from outside the frame"</b></figcaption></figure>
</ao-compare>

**Twelve days, then $2.44.** Claude had asked me to OK about four and a half hours on my laptop's
graphics card, and the board sat waiting twelve days for my answer. When I finally approved it, a
rented 48 GB cloud card (an L40S) did the work instead. That was 37 clips at 1344x768 with the
last shot as a chain of four, plus 20 paintings and 2 keyframes. The card ran 2 hours 8 minutes,
about an hour and 41 of it actual GPU work. A separate Claude session ran the rented machine and
picked up each batch as it was ready. It cost $2.44.

**Six retakes.** Then Claude checked every clip frame by frame, and six shots came back, one of
them twice.

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/moonlight-v4/rej_S07_cut.webp" alt="Frames from a clip that jumps from one camera angle to another in its first second, with a wave breaking over the jetty" loading="lazy"><figcaption><b>A hard cut, not a move</b><span class="ao-meta">its last frame was painted from another angle</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S02_sponge.webp" alt="The headland across the bay riddled with dark holes like a sponge" loading="lazy"><figcaption><b>A sponge headland</b><span class="ao-meta">noise in the 3D set, painted in</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S06_candles.webp" alt="The float line lit like a row of candles leading to a glowing cave mouth" loading="lazy"><figcaption><b>Candles on the water</b><span class="ao-meta">the floats are dark corks everywhere else</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S09_hand.webp" alt="A gloved hand holding the dive lamp sliding into the edge of the frame" loading="lazy"><figcaption><b>A hand at the edge</b><span class="ao-meta">nobody is ever seen below</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S31_surface.webp" alt="A falling lamp in the cave with a reflective water surface appearing" loading="lazy"><figcaption><b>A surface in the cave</b><span class="ao-meta">the cave is entirely under water</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/shot_S17_arc.webp" alt="Frames from the arc round the man holding up his lantern, the town sliding away to the open bay" loading="lazy"><figcaption><b>When it works</b><span class="ao-meta">the last frame agrees with the move</span></figcaption></figure>
</ao-compare>

When the painted last frame fit the move, H3 moved beautifully, like the arc around him that
slides the town off the left of the frame and brings in the open bay. Where Qwen had painted the
end from another height or angle, H3 didn't move at all. It cut, or cross-faded, to the last
frame in the first half-second. Those shots now run from their first painting alone.

**The ending in three takes.** The last shot is one unbroken move down the cave to his lantern,
four clips chained together, and it took three tries. With only a start and an end frame, H3
invented the middle. The far light became a candle seen from straight above, and then the picture
wiped across to the ending. A middle frame fixed the third clip. Taking the end frame off the
fourth removed the last wipe.

<ao-compare cols="3" aspect="2.2/1">
<figure><img src="/media/moonlight-v4/s34_take1.webp" alt="Take 1 of the descent: rock, darkness, a candle from above, then the lantern" loading="lazy"><figcaption><b>Take 1</b><span class="ao-meta">a candle from above, then a wipe</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/s34_take2.webp" alt="Take 2: the lantern far below, then a second framing slides in" loading="lazy"><figcaption><b>Take 2</b><span class="ao-meta">the middle fixed, a wipe at the end</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/s34_take3.webp" alt="Take 3: one continuous descent onto the lantern and the stopped pocket watch" loading="lazy"><figcaption><b>Take 3</b><span class="ao-meta">in the film</span></figcaption></figure>
</ao-compare>

**Where the bubbles come from.** They never come from the edge of the screen. They seep from
cracks in the rock far out under the bay, then fill the whole night sky above him. They're drawn
in 3D through each shot's camera, and hidden behind him and the stones by a cut-out mask made from
the clip itself.

</details>
