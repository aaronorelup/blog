---
id: "AO-028"
title: "One prompt, six hours, and a 2:50 film of my characters drawn entirely in code"
summary: "I asked for an animated short of Jefrie, BloodTailor and Yusef with no image or video models. 27 Opus 5.5 agents wrote 24,000 lines of canvas code and came back six hours later with 2 minutes 50 seconds of it. The first passes were rough; review rounds on the rendered frames are what changed them."
date: 2026-09-30
status: "shipped"
tags: ["claude-code", "animation", "canvas", "agents", "characters"]
series: ["characters", "agent-runs"]
---

On 26 September I wrote one prompt asking for an animated film of my three characters, and six
hours later I had 2 minutes 50 seconds of it. Every frame is drawn by JavaScript on an HTML
canvas, and the score and sound effects are synthesized in code. No image model, no video model,
and no Blender.

**The first pass of each chapter was rough. What made it better was a loop of fresh agents
looking at the encoded video, frame by frame around every hit, and sending it back.** Nothing
in the code changed as much as what the reviewers saw.

Here it is. It's violent: on-screen kills and blood, drawn in ink and red.

<video controls muted playsinline preload="metadata" poster="/media/storm-bell-pop-up/film-poster.webp" src="/media/storm-bell-pop-up/film.mp4" style="width:100%;border-radius:8px"></video>

## What I asked for

I'd seen a short on X by Alexey Fateev: six and a half minutes, all 9,363 frames drawn by
canvas code Opus 5.5 wrote, in the style of *Hedgehog in the Fog*. He'd published the skill he
used, and said the film came mostly from talking it through with Claude, in about two to
three hours by his guess.

I didn't want a children's film. I wanted my own series: Jefrie at her iron-bar dome, the Storm
Bell, killing whoever comes near it; BloodTailor walking through the unknown and fighting
demons with blood magic; Yusef entering a betting fight in a foreign town, never getting hit,
then drawing his sword with his third arm while the other two still hold his lantern and his
Bible. The characters were never to share a scene. Between them, a pop-up book: the current
character's cut-out on the left page, the next one's rising on the right, and the camera flying
over to it.

And I told it not to use that skill. The prompt said to build its own engine for this style,
"focuses on being able to illustrate the blood, mud, metal, and impact frames", and that
"attacks should have leading lines with acceleration curves so attacks feel heavy and
impactful."

I asked for it to run in the cloud. The session launched it as a remote agent and called it
"the cloud agent" the whole way through, but its first command cloned the repo into a temp
folder on my laptop, and that's where it ran.

## How it was built

The times are from the session transcript and the film repo's git log, Central time.

- **14:39.** My prompt. Three agents turn my reference images into a drawing spec per
  character, and a second pass checks each spec against the canon on my Notion pages. Where an
  image disagreed with the canon, the canon won.
- **14:48.** One Opus 5.5 agent gets the brief, the specs and 13 reference images, with no
  videos. By **14:58** it has committed the engine core: easing and strike curves, hit-stop
  timing, ink brushes, springs and chains, camera shake, blood, mud and metal.
- **15:02.** It starts eight builders in parallel: a rig and model sheet for each of the three
  characters, the strangers, demons and gore, two environment builders, the pop-up book, and
  the audio.
- **16:30 to 20:10.** Chapters built hero shot first, then three rounds of review on the
  encoded MP4s, with a fourth for chapters 2 and 3. The reviewers were fresh agents each round.
- **20:46.** The final commit: the film, 31 shots, 4,095 frames at 1080p and 24 fps.

The model sheets came first, and the characters weren't animated until those matched the
specs. These are the finished sheets, rendered by the same code as the film.

<ao-compare cols="3" aspect="16/9">
  <figure><img src="/media/storm-bell-pop-up/jefrie-sheet.webp" alt="Jefrie model sheet: front and three-quarter views with the scythe, a head close-up and tail silhouettes" loading="lazy"><figcaption><b>Jefrie</b><span class="ao-meta">canvas code · 5.5 heads, tail 9.6 heads</span></figcaption></figure>
  <figure><img src="/media/storm-bell-pop-up/bloodtailor-sheet.webp" alt="BloodTailor model sheet: iron dome helm, red cloak, barbed-wire forearms" loading="lazy"><figcaption><b>BloodTailor</b><span class="ao-meta">canvas code</span></figcaption></figure>
  <figure><img src="/media/storm-bell-pop-up/yusef-sheet.webp" alt="Yusef model sheet: white and gold coat, lantern, Bible, third arm with sword" loading="lazy"><figcaption><b>Yusef</b><span class="ao-meta">canvas code</span></figcaption></figure>
</ao-compare>

## First pass and last

The pop-up book was one of the first things built, before the characters existed. The left
video is that first test at 15:36, with placeholder cut-outs: that Jefrie is the one the notes
say "read as a skull". The right is round three at 20:13. Both are 9.5 seconds and play
together.

<ao-compare cols="2" aspect="16/9" sync>
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-pop-up/book-first.webp" src="/media/storm-bell-pop-up/book-first.mp4"></video><figcaption><b>Book transition, first test</b><span class="ao-meta">26 Sep 15:36 · placeholder cut-outs</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-pop-up/book-final.webp" src="/media/storm-bell-pop-up/book-final.mp4"></video><figcaption><b>Book transition, round 3</b><span class="ao-meta">26 Sep 20:13 · starts on Jefrie's last frame, ends on BloodTailor's first</span></figcaption></figure>
</ao-compare>

In the final version the book opens on the exact last frame of Jefrie's chapter and hands over
on the exact first frame of BloodTailor's. The agent measured both seams at about 41 dB PSNR.

The characters went the same way. Each rig got a motion test on a grey stage before any shot
was built. On the left, those tests at about 15:45. On the right, the shots they became.

<ao-compare cols="2" aspect="16/9">
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-pop-up/mt-jefrie.webp" src="/media/storm-bell-pop-up/mt-jefrie.mp4"></video><figcaption><b>Jefrie, tail launch motion test</b><span class="ao-meta">15:53 · 4.7 s</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-pop-up/final-jefrie.webp" src="/media/storm-bell-pop-up/final-jefrie.mp4"></video><figcaption><b>Jefrie, launch and kill (j05)</b><span class="ao-meta">20:38 · 5.5 s · after three review rounds</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-pop-up/mt-yusef.webp" src="/media/storm-bell-pop-up/mt-yusef.mp4"></video><figcaption><b>Yusef, third arm motion test</b><span class="ao-meta">15:41 · 4.3 s</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-pop-up/final-yusef.webp" src="/media/storm-bell-pop-up/final-yusef.mp4"></video><figcaption><b>Yusef, the final blow (y09)</b><span class="ao-meta">20:38 · 6 s · after four review rounds</span></figcaption></figure>
</ao-compare>

## The frames that make a hit

At full speed a hit goes by in a quarter of a second, and the parts that make it land are
single frames. So these two shots have frame controls: step through them, or jump to the
marked frames.

In Jefrie's kill, frames 44 and 45 are the smear of the scythe coming down. 46 is a silhouette
frame, black on bone. 47 is the red frame. 48 to 51 hold on the contact with radial lines
while the camera keeps shaking, and only then does the blood go.

<ao-frames fps="24" marks="44:Smear|46:Silhouette|47:Red frame|48:Hit-stop">
<video controls muted playsinline preload="metadata" poster="/media/storm-bell-pop-up/final-jefrie.webp" src="/media/storm-bell-pop-up/final-jefrie.mp4"></video>
<figcaption><b>j05, the tail launch and kill, frame by frame</b><span class="ao-meta">132 frames at 24 fps · 854×480 web copy of the 1080p shot</span></figcaption>
</ao-frames>

Yusef's gets two impact frames: a silhouette at 32 when the maul lands where he was standing,
and red at 48 when his blade lands. The brief allowed him gold as the one other colour, and it
stays on in the red frame.

<ao-frames fps="24" marks="32:Maul lands|48:Red frame">
<video controls muted playsinline preload="metadata" poster="/media/storm-bell-pop-up/final-yusef.webp" src="/media/storm-bell-pop-up/final-yusef.mp4"></video>
<figcaption><b>y09, the third arm's cut, frame by frame</b><span class="ao-meta">144 frames at 24 fps · 854×480 web copy</span></figcaption>
</ao-frames>

The reviewers' notes are what taught the engine this. A downswing hidden inside the white
frame "reads as nothing", so there must be two or three visible smear frames before it.
Contact is computed from the blade edge, not set on a fixed frame. A character hanging at the
top of a jump before striking kills the momentum. For Yusef, who must never be touched, the
last round measured the gap between his silhouette and the fighter's on every frame.

## What it says is still wrong

The film's notes end with the agent's own list:

- **The drawing.** The characters are rigs built in code. They read on-model at film size, but
  they're stiffer and flatter than hand-drawn keys, and hands, faces in motion and three-quarter
  turns are the weakest. The strangers and the pit fighter look "a bit paper-doll".
- **Two faked angles.** In two BloodTailor shots, a reverse angle was made by mirroring a
  side-view rig, and his screen direction flips with no bridging shot.
- **Blood.** Some of it still reads as particles, not liquid.
- **The last kill.** The fighter's lower half stays kneeling instead of falling.
- **The sound.** "Audio was never listened to by a human in production." It was checked by
  measurement only: loudness at −16 LUFS, peaks at −1 dBTP, a click detector. The crowd voices
  are what the agent expects to sound most synthetic.

The last pass also caught 16 blank frames that had come from Chrome losing its GPU canvas
while shots rendered in parallel. It now renders with the GPU switched off and a guard that
retries any shot with a blank frame. That was in the assembled film, which is the only place
it could have been found.

## What it cost

27 agents, all Opus 5.5, over about six hours of wall-clock. 2,091 requests, 467,000 output
tokens, and $291 at API list prices, which I don't pay (I'm on a flat subscription). The repo
holds 24,085 lines of JavaScript: 5,029 of engine, 18,725 of film and 331 of tools, in 23
commits. The engine is also written up as a skill with eight reference files, so the next film
in this style starts from it.

[AO-020](/ledger/clawd-growth-montage/) was the same method at a smaller size: one agent, one
file, 30 seconds of Clawd, and a score nobody listened to before it shipped. Here the agents
did look, over and over, at every frame that mattered, and the one thing nobody looked at was
the one thing a frame can't show.
