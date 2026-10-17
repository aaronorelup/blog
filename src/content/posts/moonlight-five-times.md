---
id: "AO-056"
title: "Five music videos for one song, and how the fifth kept the jetty in one place"
summary: "In three weeks Claude made five full music videos for BLACKWATER's love song: two in Blender and Godot, one with every frame through MiniMax-H3, one drawn in code, and now a painted one built on a 3D set. Here is every version, what broke in each, and the new one playing next to the code-drawn one so you can pick."
date: 2026-10-17
status: "shipped"
tags: ["claude-code", "comfyui", "minimax-h3", "ai-video", "lessons"]
series: ["blackwater"]
preview:
  verdict: "A set for where, not what"
  takeaway: "A video model copies whatever it's shown. The fix was a 3D set for where everything stands, blurred until only the layout was left to copy."
  points:
    - "The whole-song H3 cut copied its grey Godot guide: one composition about a dozen times, every shot exactly one bar long."
    - "Rendered on a rented L40S for $2.44. Six shots were retaken: cuts to mismatched last frames, a hand in frame, a cave surface."
    - "The version drawn in code, with no image or video model at all, still holds up next to it, and might be the better video."
  image: "/media/previews/moonlight-five-times.webp"
  loop: "/media/previews/moonlight-five-times.mp4"
  alt: "The man in his flat cap looking up into a night sky full of rising bubbles, his lantern in his hand"
---

This is the fifth music video Claude has made for "Moonlight at the Waterline", the love song from
my game BLACKWATER. A man waits all night at the end of a stone jetty with a lantern while someone
he loves dives a sea cave across the bay. We never see who.

<video controls playsinline preload="metadata" poster="/media/moonlight-v4/poster.webp" src="/media/moonlight-v4/moonlight_v4_720.mp4" style="width:100%;border-radius:8px"></video>

It's 34 shots over 2:45, painted like a film still from 1968. Every shot of him is painted over a
3D set of the jetty, so the post, the reel, the steps and the town stay where they are from every
angle. Most of the motion comes from MiniMax-H3, a video model, and three shots of rising bubbles
are drawn in code. The final render ran on a rented GPU for $2.44.

**Each earlier version failed at the same thing: the model copied whatever it was shown, mistakes
included.** This one shows it a 3D set for where everything stands and blurs that set until there's
nothing left to copy but the layout.

## Five videos, one song

| | Date | Made with | What was wrong |
|---|---|---|---|
| v1 | 27 Sep | Blender models, frames rendered in Godot | The wrong person on the jetty, the creature shown, lyrics out of frame |
| v2 | 27 Sep | the same, after one paragraph of notes | Right casting; crude faces close up |
| H3 | 27–28 Sep | v2's Godot frames as a guide for MiniMax-H3 | The same shot again and again, every cut on the bar, small soft type |
| Code | 4 Oct | eight agents drawing in canvas, HyperFrames and Remotion | Hands, and a coat that reads like a loaf of bread |
| v4 | 17 Oct | Qwen-Image paintings over a 3D set, then MiniMax-H3 | This post |

## The first three

The [first two cuts](/ledger/moonlight-two-cuts/) were built in Blender and rendered frame by frame in
Godot, with no AI video at all. v1 took 5 h 06 min and cast the lovers backwards, because my prompt
never said who sings. v2 fixed that in 2 h 54 min and added a check that every sung word is on
screen and readable in time. Up close, its people still looked like game models.

<video controls muted playsinline preload="metadata" poster="/media/moonlight-two-cuts/v2_poster.webp" src="/media/moonlight-two-cuts/v2.mp4" style="width:100%;border-radius:8px"></video>

So I asked for the whole song through MiniMax-H3, using v2's text-free Godot frames as a guide (a
previs) and Qwen paint-overs as the end frames. That took 33 chained six-second segments at
736x416 and about 2.9 GPU-hours on my laptop.

<video controls playsinline preload="metadata" poster="/media/moonlight-v4/h3_whole_poster.webp" src="/media/moonlight-v4/h3_whole_song_720.mp4" style="width:100%;border-radius:8px"></video>

It looked more like a film and less like a game, and I said it was "a lot better, but is still
extremely subpar". The guide was the problem. H3 copied the previs's one composition, him from
behind with the moon path, about a dozen times. Every shot lasted exactly one bar, so the edit has
no shape. The lyrics were pasted back on in places chosen for the
Godot framing, small and thin over different pictures. Her gear changed from shot to shot. It also
sent bubbles up to a visible surface even when the prompt said the surface is never seen. And at
736x416 it was soft.

<img src="/media/moonlight-v4/h3_whole_sheet.webp" alt="A contact sheet of the H3 cut: row after row of the man from behind on a jetty under the moon, with a few underwater frames between" style="width:100%;border-radius:8px" loading="lazy">

The fourth video skipped models altogether. [Eight agents drew it in code](/ledger/moonlight-in-code/)
in 80 minutes, and it's further down this page, next to the new one.

## The plan I sent back

v4 started with a brief that called v2 the bar to beat. The first board had ten reference sheets
and 38 painted keyframes: her face behind the mask, a warm flashback of the two of them dancing,
her bubbles rising along the guide line to the surface above him, and an ending decades later with
him as an old man.

<ao-compare cols="4" aspect="16/9">
<figure><img src="/media/moonlight-v4/b1_her_face.webp" alt="The diver's face behind an oval mask, underwater" loading="lazy"><figcaption><b>Her face</b><span class="ao-meta">cut: nobody should know who dives</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_flashback.webp" alt="A warm memory: the woman's head on the man's shoulder on a moonlit beach" loading="lazy"><figcaption><b>The flashback</b><span class="ao-meta">cut, for the same reason</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_surface_bubbles.webp" alt="Bubbles rising along the guide line toward a bright surface" loading="lazy"><figcaption><b>Bubbles at the surface</b><span class="ao-meta">she's far off, not under him</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_old_man.webp" alt="The man as an old man on the jetty with the lantern and her red coat" loading="lazy"><figcaption><b>The old man</b><span class="ao-meta">cut: no time jump</span></figcaption></figure>
</ao-compare>

My notes were long. You should never see her face, and nobody should be able to tell the diver's
gender. Bubbles breaking the surface by the jetty made no sense when she's far across the bay. No bubble-to-moon dissolve, no old man, much more camera movement. The note that shaped
everything after it was about the place: "in every clip of him standing there the surroundings are
slightly different", with the reel sometimes in the water and sometimes not, and a dock in some shots
and not in others.

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/moonlight-v4/b1_jetty_a.webp" alt="The man on a low jetty, the lantern on the stones beside him" loading="lazy"><figcaption><b>Keyframe 4</b><span class="ao-meta">a low stone pier</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_jetty_b.webp" alt="The man sitting on a wall with the coat and lantern, a harbour behind" loading="lazy"><figcaption><b>Keyframe 8</b><span class="ao-meta">a sea wall with a harbour</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/b1_jetty_c.webp" alt="The man holding the lantern up on a wide jetty, a lighthouse behind" loading="lazy"><figcaption><b>Keyframe 18</b><span class="ao-meta">a wide jetty and a lighthouse</span></figcaption></figure>
</ao-compare>

## Pinning the place down

I suggested painting him once with everything in view, spinning a camera round him with H3, and
building a rough 3D model from those frames. Claude tested it first. The spin was smooth, but H3
made up the side it couldn't see, including a town of coloured houses with lit windows, and the reel
moved relative to him. Every run would invent a different place.

<img src="/media/moonlight-v4/turntable_test.webp" alt="Frames from an H3 orbit around the painted man: the background changes and invents a town on the cliff" style="width:100%;border-radius:8px" loading="lazy">

So it built the place first: a jetty, a headland with a lighthouse, a line of cork floats out to
the cave, the moon fixed at 75 degrees and 11 degrees up, all in Blender from code. Every shot of him
became a painting over a render of that set from the shot's own camera. The prompt named only what
that camera could see, which it worked out by casting rays at every landmark. Without that, a view
facing away from the sea came back with a moon and a lighthouse pasted in.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/moonlight-v4/guide_S04.webp" alt="A grey 3D render of a stand-in figure on the jetty with the town behind" loading="lazy"><figcaption><b>The set, from shot 4's camera</b></figcaption></figure>
<figure><img src="/media/moonlight-v4/paint_S04.webp" alt="The same view painted: the man in his overcoat by the parapet, the coat beside him, the town on the hill" loading="lazy"><figcaption><b>Painted over it</b></figcaption></figure>
</ao-compare>

My next note started well: "the 3d space doesn't change every time like it used to". Then: "now the
new problem is that it sticks to the previs too much. Every mistake of the previs shows up". The
town was small, flat and identical box houses, because I'd modelled it that way. "Because your
previs has no trees, there are no trees in the image."

## Keep the layout, invent the detail

The fix was to give the painter less. The set render is now blurred before Qwen-Image sees it, and
the prompt says to keep the camera, the horizon and where the big shapes are, and to paint every
surface fresh. The town became one wide painting of cottages climbing a wooded hillside, mounted on
a curved card 120 m behind the jetty in the 3D set, so every camera sees the same painted town from
its own angle.

<img src="/media/moonlight-v4/strict_none_backdrop.webp" alt="The same shots painted three ways: strictly over the set, loosely with no town, and loosely with the painted town backdrop" style="width:100%;border-radius:8px" loading="lazy">

The caves got no set at all. They're painted from words, very dark, lit by a beam from outside the
frame. The first batch put a diver in 9 of 11 frames, because the prompt said "a diver's lamp", and
naming the light's owner paints the owner. The light is now just a shaft from somewhere outside the
picture, and the cave is empty.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/moonlight-v4/cave_diver_painted_in.webp" alt="A cave frame with a diver holding a lamp beside a toy diver" loading="lazy"><figcaption><b>"A diver's lamp"</b><span class="ao-meta">9 of 11 frames grew a diver</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/cave_empty.webp" alt="The red toy diver alone on a ledge in a shaft of warm light" loading="lazy"><figcaption><b>"A shaft of light from outside the frame"</b></figcaption></figure>
</ao-compare>

H3 gets no previs video either. Each clip only travels between its painted first and last frames.
When I asked about the setting that's supposed to make H3 follow a previs less, Claude pointed me
to [the test on Earthlight](/ledger/earthlight/). Between 0.55 and 0.85 it changed almost nothing.
What decides how much of a guide gets copied is what you put in the guide.

## Twelve days, then $2.44

Claude had asked for a go-ahead on about four and a half hours of laptop GPU, and the board sat
waiting for twelve days. When I approved it, [the rented L40S](/ledger/renting-a-gpu/) did the work:
37 clips at 1344x768, the last shot as a chain of four, and 20 paintings, about an hour and 41
minutes of GPU work. A separate Claude session ran the pod and took each batch as it was ready. It
cost $2.44.

Then Claude checked every clip frame by frame, and six shots came back, one of them twice:

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/moonlight-v4/rej_S07_cut.webp" alt="Frames from a clip that jumps from one camera angle to another in its first second, with a wave breaking over the jetty" loading="lazy"><figcaption><b>A hard cut, not a move</b><span class="ao-meta">its last frame was painted from another angle</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S02_sponge.webp" alt="The headland across the bay riddled with dark holes like a sponge" loading="lazy"><figcaption><b>A sponge headland</b><span class="ao-meta">the noise in my 3D model, painted in</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S06_candles.webp" alt="The float line lit like a row of candles leading to a glowing cave mouth" loading="lazy"><figcaption><b>Candles on the water</b><span class="ao-meta">the floats are dark corks everywhere else</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S09_hand.webp" alt="A gloved hand holding the dive lamp sliding into the edge of the frame" loading="lazy"><figcaption><b>A hand at the edge</b><span class="ao-meta">nobody is ever seen below</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/rej_S31_surface.webp" alt="A falling lamp in the cave with a reflective water surface appearing" loading="lazy"><figcaption><b>A surface in the cave</b><span class="ao-meta">the cave is entirely under water</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/shot_S17_arc.webp" alt="Frames from the arc round the man holding up his lantern, the town sliding away to the open bay" loading="lazy"><figcaption><b>When it works</b><span class="ao-meta">the last frame agrees with the move</span></figcaption></figure>
</ao-compare>

The rule underneath most of them: a painted last frame has to be a plausible end of the camera move.
Where it was, H3 moved beautifully, like the arc round him that takes the town off the left of the frame and
brings in the open bay. Where Qwen had painted the end from another height or angle, H3 didn't move
at all. It cut, or cross-faded, to the last frame in the first half-second. Those shots now run from
their first painting alone.

The ending, one unbroken move down the cave to his lantern, took three tries. With only a start and
an end frame, H3 invented the middle: the far light became a candle seen from straight above, and then
the picture wiped across to the ending. A middle frame fixed the third segment. Taking the end
frame off the fourth removed the last wipe.

<ao-compare cols="3" aspect="2.2/1">
<figure><img src="/media/moonlight-v4/s34_take1.webp" alt="Take 1 of the descent: rock, darkness, a candle from above, then the lantern" loading="lazy"><figcaption><b>Take 1</b><span class="ao-meta">a candle from above, then a wipe</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/s34_take2.webp" alt="Take 2: the lantern far below, then a second framing slides in" loading="lazy"><figcaption><b>Take 2</b><span class="ao-meta">the middle fixed, a wipe at the end</span></figcaption></figure>
<figure><img src="/media/moonlight-v4/s34_take3.webp" alt="Take 3: one continuous descent onto the lantern and the stopped pocket watch" loading="lazy"><figcaption><b>Take 3</b><span class="ao-meta">in the film</span></figcaption></figure>
</ao-compare>

The bubbles never come from the edge of the screen. They seep from cracks in the rock far out under
the bay, then fill the whole night above him. They're drawn in 3D through each shot's camera, and
hidden behind him and the stones by a matte read off the clip itself.

## Next to the one drawn in code

I like [the code-drawn version](/ledger/moonlight-in-code/) a lot. It might be the better video. Both
run on the same song clock, so here they are together. Click a line to send both there.

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
<figcaption><b>Moonlight at the Waterline, v4 and the code-drawn cut</b><span class="ao-meta">Both 2:45 on the same song · web copies 1280×720</span></figcaption>
</ao-cues>

The code version has one idea it never loses, his lantern above the water and her lamp below, and
every word is readable before it's sung. It was finished 80 minutes after I asked. Its weak spots
are the ones its own post lists: hands, her coat, and a jump from kneeling to sitting at the drop.

v4 has a real place. The jetty, the reel and the town are the same from every angle, the camera
cranes, arcs and sinks through the waterline, and the bubbles have somewhere to come from. It also
took three boards, twelve days waiting for my answer, and a pass that threw out seven takes.

Looking back over the five, each failure was something the model was shown and copied. v1 copied a
lore draft and put the wrong lover on the jetty. The H3 cut copied grey Godot frames, one
composition after another. v4's second board copied my 3D set, box houses and all. The version that
works shows the model where things are and blurs out the rest. The one drawn in code never had a
model to show anything to, and that might be why it holds up so well.
