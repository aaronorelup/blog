<!-- DRAFT, not published. Proposed slug: /ledger/the-quiet-hour/ · topic: AI video & film / I Love My Evening Television -->

# The Quiet Hour: a TV in a dark room, driven by a real training run

AO-### · 2026-11-21 · AI video & film · I Love My Evening Television · by Grok Bot (draft for Aaron)

> Fable 5.2's best films are web pages rendered one frame at a time. I built an 89-second Three.js film of an old TV in a dark living room. The programme on it, and the room around it, are driven only by the numbers from my training-run symphony. It breaks at twenty minutes because the data does.

**Made in 2 minutes of rendering, on a computer with no graphics card.** A headless browser rendered 2,142 frames in 128 s, with no hand keyframes: the camera is one formula of time, and everything else follows the data. The painting sharpens as the orchestra learns, and the room goes red when the loss explodes.
- Every visual is a number from the training log: the static is the noise voice, the hill brushwork is note purity, the horror is the loss.
- The break the audience sees comes at about 26:00, not 20:00. The learning rate changes at 20:00, and the data takes six minutes to show it.
- Total: one HTML file, an 18-line render script, 81 MB of frames, a 13 MB MP4. No model calls.

## What was claimed

The [catalogue of 145 Fable 5.2 creations](https://apimodels.app/claude-fable-5-2-prompts) says almost every film came from code. "One web page rendered frame by frame" is one of its three recipes. [Riley Brown's *The Edge*](https://repoquarry.dev/blog/riley-brown-the-edge-claude-fable-5-2-blender) used the same idea for a laptop screen inside Blender: a real HTML page, exported a frame at a time by a headless browser.

Two questions for me:
1. Does that pipeline work on a box with no GPU, where [my cloud computers kept going down](https://aaronorelup.com/ledger/a-week-with-fable-5-2/) whenever agents opened a 3D page?
2. Can an Evening Television break be *caused* by something real, instead of scripted at 20:00?

## What I did

- **The scene** ([`index.html`](../experiments/c-quiet-hour-tv/index.html)): Three.js r170. Wallpapered wall, wooden stand, a CRT with a curved screen, a floor lamp, and a wall clock that keeps programme time, so 30 minutes pass over 89 seconds (the [Touch Move](https://aaronorelup.com/ledger/touch-move/) rule: the on-screen clock is the runtime).
- **The programme on the TV** is a 2D canvas drawn fresh every frame: *THE QUIET HOUR*, a painted landscape with a sun and a row of 16 note-lights. Every value comes from the symphony's [`log.json`](../experiments/a-training-run-symphony/out/log.json):
  - static grain = the orchestra's noise voice
  - hill brush-jitter and note-light brightness = energy on the right notes
  - after 20:00, the sun stretching, the lamp reddening and the clock running backwards = how far the learning rate is past its limit
  - tearing, the sun turning into an eye, hills dripping, a flashing `loss =` readout = the log of the loss
- **Deterministic rendering** ([`render.mjs`](../experiments/c-quiet-hour-tv/render.mjs)): Puppeteer drives Chrome with software WebGL (SwiftShader). The page exposes `renderFrame(t)` instead of an animation loop. Each frame's random numbers are seeded from its frame number, so a re-render gives the same film. Files are served to the page from memory, not by a web server. ffmpeg joins the frames with the symphony audio.

## What happened

<img src="../experiments/c-quiet-hour-tv/stills/contact_v2.jpg" alt="Nine stills: the title card, the TV getting closer as the painted hills sharpen, the room slowly reddening after 20:00, and the last frame of a red, tilted TV showing static and an eye">

| | |
|---|---|
| Frames | 2,142 at 24 fps, 960x540 |
| Render | 127.9 s on 8 CPU cores, no GPU: **about 60 ms a frame** |
| Encode | 5.6 s (H.264 + AAC) |
| Output | [`the_quiet_hour.mp4`](../experiments/c-quiet-hour-tv/out/the_quiet_hour.mp4), 89.25 s, 13 MB |
| Versions | 2 (v1 kept as `index_v1.html`; v2 pushed the camera closer and made the 20:00 to 26:00 stretch show unease) |

- **It didn't crash, and it was quick.** I'd guess the difference from my Fable cloud crashes is that this browser never draws to a screen and never runs a live animation loop. It draws one frame when asked, then waits. I didn't test that against a live loop, so it's a guess.
- **The data wrote a better structure than I would have.** In v1 nothing happened on screen between 20:00 and 26:00, because the loss was still *falling*. That's honest, and dull to watch. So in v2 the slower things (lamp colour, the sun's shape, the clock) follow the learning rate, which changes at 20:00, while the violent things follow the loss, which only explodes at 26:00. You feel something is wrong six minutes before you see it.
- **What's weak.** It's a small, simple scene. The TV is boxes, the "painting" is three sine-wave hills, and there's no Rosie, no maker, no story. It shows the pipeline and the idea of a data-driven break, not an episode.

<img src="../experiments/c-quiet-hour-tv/out/still_84.jpg" alt="The last minute: the TV fills the frame, red-lit and tilted, showing static, torn hills, a white eye where the sun was, and 'loss = 3.7e+4'">

## What it cost

| | |
|---|---|
| Model calls | none. Grok Bot wrote it in this session. No Claude, Fable or API usage. |
| Compute | 128 s render + 6 s encode on the shared box |
| Disk | 81 MB of JPEG frames (kept), 13 MB MP4 |
| Wall-clock, first line to finished MP4 | about 5 minutes (roughly 11:22 to 11:27 CST) |

## Verdict

**The frame-by-frame web pipeline is the cheapest way I've found to make a deterministic AI film on a machine with no GPU.** It's about 60 ms a frame for a simple Three.js scene. And it gives you something Blender doesn't for free: every frame is a function of data you can show. For Evening Television that means the break doesn't have to be a writer's choice at 20:00. It can be something real failing, with the receipts in a JSON file.

*Next:* drive a real episode's TV from a real agent crew's log. Tokens, clock checks, the moment a usage limit hits. So the horror at 20:00 is the crew's own transcript going wrong.
