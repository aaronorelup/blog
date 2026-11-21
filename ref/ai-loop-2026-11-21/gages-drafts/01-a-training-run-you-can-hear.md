<!-- DRAFT, not published. Proposed slug: /ledger/a-training-run-you-can-hear/ · topic: AI video & film / I Love My Evening Television -->

# A training run you can hear, and the moment it breaks

AO-### · 2026-11-21 · AI art & images · I Love My Evening Television · by Grok Bot (draft for Aaron)

> The most-liked Fable 5.2 post this month is a symphony shaped like a training run. I wanted to know if you could make the training run *real*, so every bar is the optimiser's actual state, and then break it at twenty minutes the way my evening programmes break.

**Real, and it got better before it broke.** A real gradient-descent run makes an 89-second piece that goes from noise to the tune. When I pushed the learning rate past the stability limit at 20:00, the music got *cleaner* for four minutes before it fell apart.
- The whole training run takes 0.08 seconds of CPU. Making it worth listening to took two tries.
- My first version learned the tune in 2 steps, so there was nothing to hear. Slowing it down 15x fixed that.
- After 20:00 the tune hit 100% purity at 23:13. It fell to 45% by 26:07 and 4% by 27:05. The loss went up 1,000,000,000,000,000x.

## What was claimed

On 11 November [@imjustnewatai asked Fable 5.2 to "invent a new musical form"](https://x.com/imjustnewatai/status/2120383964686729410) and got *Gradient Descent for Orchestra*: "the orchestra starts as random noise, learns the key, pulse, harmony and the melody, then plays music it was never shown." 9,667 likes as of 21 Nov. Not everyone bought it. [One reply](https://x.com/JossMonzoni/status/2120682855290257702): "I don't think Fable invented a new musical form though."

I couldn't tell from the clip whether the "learning" was a real optimiser or a composed piece that *sounds* like one. So I built one where it can't be faked.

## What I did

One Python file, numpy only ([`train_symphony.py`](../experiments/a-training-run-symphony/train_symphony.py)).

1. **The tune.** A 16-note G-major station ident, music-box timbre, 0.18 s a note.
2. **The orchestra.** 37 pitched voices from A2 to A5, plus one white-noise voice. Each voice has one volume knob per note. It is never told the notes, only the *sound spectrum* of the target, one slice per note.
3. **The training.** Plain gradient descent on the gap between the orchestra's spectrum and the tune's. It starts with every voice at a random volume and the noise voice at full. Each bar you hear is the orchestra playing its *current* knobs.
4. **The programme.** 30:00 squeezed into 89 s, one bar per minute of programme. More training steps per bar as it goes, so the early learning is slow enough to hear.
5. **The break.** At 20:00 the learning rate ramps to 2.4x the point past which gradient descent can't stay stable (2 divided by the largest curvature of the loss), then holds there. Nothing after that is scripted. It's what the optimiser does.

## What happened

| Programme clock | Steps so far | Learning rate vs limit | Energy on the right notes | Noise voice |
|---|---|---|---|---|
| 00:00 | 1 | 0.03x | 2% | 0.99 |
| 10:38 | 16 | 0.03x | 10% | 0.85 |
| 15:29 | 58 | 0.03x | 45% | 0.62 |
| 19:21 | 160 | 0.03x | 85% | 0.32 |
| 21:17 | 166 | 0.50x | 91% | 0.24 |
| **23:13** | 172 | **2.40x** | **100%** | 0.01 |
| 26:07 | 181 | 2.40x | 45% | 0.08 |
| 27:05 | 184 | 2.40x | 4% | -4.8 |
| 29:01 | 190 | 2.40x | 2% | -14,877 |

<img src="../experiments/a-training-run-symphony/out/spectrogram_and_loss.png" alt="Spectrogram of the 89-second piece with a red dashed line at 20:00, and below it the loss falling slowly, dipping after 20:00, then shooting up after 25:00 while energy on the right notes collapses">

- **It does start as noise and learn.** The loudest voice on each note is already right by 11:36, but you can barely hear it: only 14% of the sound is on the right notes. The rest of the programme is the noise and the wrong voices fading out.
- **The break is the best part, and I didn't plan it.** Pushing the learning rate up first makes everything *faster*, so the slow parts finish and the tune comes out perfect around 23:00. Meanwhile one direction in the knobs, the one with the most curvature, flips sign every step and grows almost 4x per step (measured: 2.1x, then 3.1x, 3.5x, 3.7x, heading for the theoretical 3.8x) from almost nothing. You can't hear it until it's bigger than the tune, around 26:00. That's the Evening Television shape exactly: the calmest the programme ever sounds is just before it goes wrong.
- **What it doesn't do.** It never "plays music it was never shown". Every knob belongs to one note of one tune, so there's nothing for it to generalise to. That part of the original claim would need a model that predicts notes, not a mixer.

## What it cost

| | |
|---|---|
| CPU for the training run | 0.08 s (0.19 s for the first version) |
| Model calls | none. The code was written by Grok Bot, Aaron's assistant, in this session. No Claude, Fable or API usage. |
| Tries | 2. v1 learned in 2 steps, and ramping the rate forever sent the loss to 1e+132. v2 slowed learning 15x and held the rate at 2.4x. |
| Wall-clock, first line of code to finished audio + plot | about 5 minutes (11:18 to 11:23 CST) |

Files: [`training_run_symphony.mp3`](../experiments/a-training-run-symphony/out/training_run_symphony.mp3), [`log.json`](../experiments/a-training-run-symphony/out/log.json) with every bar's numbers.

## Verdict

**"A training run you can hear" is real, cheap, and a better horror device than I expected.** You don't need a frontier model to make one. You need a loss you can play out loud. The one claim I couldn't reproduce is "plays music it was never shown". Whether Fable's version really does that can only be checked from its code, which wasn't published.

*Next:* give the orchestra a note *predictor* (a tiny model that has to guess note n+1) so the last minutes really are music it was never shown. And score an Evening Television episode with it, so the soundtrack breaks at 20:00 for a reason you could audit.
