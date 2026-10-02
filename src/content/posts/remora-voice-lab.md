---
id: "AO-030"
title: "Claude rendered 223 clips of my game's robot voice, and couldn't hear any of them"
summary: "I asked for ten experiments to make the dive monitor in BLACKWATER sound less like a wobble. In under three hours and seven rounds, Claude rendered 223 clips it had no way to listen to, checked every one with a transcriber and a loudness meter, and left the choosing to my ears. The clips are below, so you can hear them at the same moment I did."
date: 2026-10-02
status: "in-progress"
tags: ["claude-code", "gamedev", "elevenlabs", "sound-design", "lessons"]
series: ["blackwater"]
---

On 1 October I asked Claude to make REMORA, the robot voice in the diver's ear in
[BLACKWATER](/ledger/still-on-shift-music-video/), sound cooler. Two hours and 48 minutes later
there were 223 clips on a listening page, seven rounds of them, and a treatment I liked. Claude
heard none of it. It said so at the top of the page: **"I can't listen to audio. My picks come
from the measurements and from what each technique is known to do. Your ears decide."**

That split is what made it work. Claude did everything that can be measured: same line, same
loudness, a speech-to-text check on every clip, a spectrogram of each. I did the one thing that
can't be, which was listening, and each of my answers set up the next round.

Nothing here is in the game yet. Every clip and spectrogram below is the session's own render.

Each player below keeps the playhead when you switch clips, so the same word comes through each
treatment, and A/B flips to the block's reference at the same moment. The picture is the clip's
spectrogram: time left to right, pitch bottom to top. Every clip was normalised to −18 LUFS, so
none wins by being louder.

## Round 1: what ships, and ten ways out

My prompt asked for at least ten experiments, "some could just be special effects on top of the
generated audio clips", and two stacks I wanted to hear: her line generated five times and played
at once, and five different voices saying it together. "Don't add it to the game yet, this is
just an experiment."

The line was the one she says at 150 metres: "One hundred fifty meters. This unit is rated to one
hundred forty. We will not mention it again." What ships today is a 52 Hz volume wobble squeezed
through a phone band. The session's own summary of round 1 was that the biggest step toward
"robot" was flattening her pitch onto one note.

<ao-listen ref="00">
<figure data-id="00"><audio controls preload="none" src="/media/remora-voice-lab/00_current.mp3"></audio><img src="/media/remora-voice-lab/00_current.webp" alt="Spectrogram of the shipped voice" loading="lazy"><figcaption><b>00 · What ships today</b><span class="ao-meta">52 Hz tremolo, depth 0.3 → 320–3300 Hz band → compressor 9:1</span></figcaption></figure>
<figure data-id="02"><audio controls preload="none" src="/media/remora-voice-lab/02_monotone.mp3"></audio><img src="/media/remora-voice-lab/02_monotone.webp" alt="Spectrogram of the monotone version, harmonics in flat lines" loading="lazy"><figcaption><b>02 · Monotone</b><span class="ao-meta">WORLD vocoder, every voiced frame re-pitched to 196 Hz (G3)</span></figcaption></figure>
<figure data-id="04"><audio controls preload="none" src="/media/remora-voice-lab/04_vocoder.mp3"></audio><img src="/media/remora-voice-lab/04_vocoder.webp" alt="Spectrogram of the channel vocoder version" loading="lazy"><figcaption><b>04 · Channel vocoder</b><span class="ao-meta">28 bands on a 196 Hz sawtooth plus a sub-octave</span></figcaption></figure>
<figure data-id="15"><audio controls preload="none" src="/media/remora-voice-lab/15_stack_machined_unison.mp3"></audio><img src="/media/remora-voice-lab/15_stack_machined_unison.webp" alt="Spectrogram of five takes locked to one note" loading="lazy"><figcaption><b>15 · Machined unison</b><span class="ao-meta">five takes word-locked and pitch-locked to G3, light ring mod, a comb tuned to her note</span></figcaption></figure>
<figcaption><b>Round 1, rem.depth.150</b><span class="ao-meta">1 Oct, 18:00–18:22 · Opus 5.5 in Claude Code · Python (numpy, scipy, pyworld) · 16 clips in the round, 4 shown</span></figcaption>
</ao-listen>

## The stacks I asked for

The two I'd asked for came out the way the spectrogram says: five takes of the same line breathe
and pace differently, so the words drift apart and the pauses fill in. Five different voices piled
up worse, and it was the only clip in round 1 the transcriber got wrong (it heard "meters" as
"units"). Claude's fix was to re-time every word of takes 2 to 5 onto take 1, which ElevenLabs
makes possible because it returns a timestamp for every character. Locked, the pauses come back.

Then I asked for 12 "but also add the glitch effect and leave the last few words
unsynchronized", and six minutes later for "staggering just the words 140": the number the unit is
rated to, said five times, each take a little later than the last.

<ao-listen ref="10">
<figure data-id="10"><audio controls preload="none" src="/media/remora-voice-lab/10_five_takes_raw.mp3"></audio><img src="/media/remora-voice-lab/10_five_takes_raw.webp" alt="Spectrogram of five unaligned takes, a continuous smear" loading="lazy"><figcaption><b>10 · Her voice, five takes, raw</b><span class="ao-meta">5 ElevenLabs takes (seeds 1001–1005) started together, no processing · my request</span></figcaption></figure>
<figure data-id="11"><audio controls preload="none" src="/media/remora-voice-lab/11_five_voices_raw.mp3"></audio><img src="/media/remora-voice-lab/11_five_voices_raw.webp" alt="Spectrogram of five different voices, unaligned" loading="lazy"><figcaption><b>11 · Five voices, raw</b><span class="ao-meta">5 ElevenLabs voices started together · Scribe heard "meters" as "units" · my request</span></figcaption></figure>
<figure data-id="12"><audio controls preload="none" src="/media/remora-voice-lab/12_five_takes_locked.mp3"></audio><img src="/media/remora-voice-lab/12_five_takes_locked.webp" alt="Spectrogram of five takes word-locked, with clean pauses" loading="lazy"><figcaption><b>12 · Five takes, word-locked</b><span class="ao-meta">takes 2–5 re-timed word by word onto take 1 with WORLD</span></figcaption></figure>
<figure data-id="16"><audio controls preload="none" src="/media/remora-voice-lab/16_locked_glitch_last_line_loose.mp3"></audio><img src="/media/remora-voice-lab/16_locked_glitch_last_line_loose.webp" alt="Spectrogram of the locked stack with glitches and a loose ending" loading="lazy"><figcaption><b>16 · Locked, glitching, last line loose</b><span class="ao-meta">round 2 · 12 + stutter, dropout, crush, pitch sag · lock released before "We will not"</span></figcaption></figure>
<figure data-id="17"><audio controls preload="none" src="/media/remora-voice-lab/17_locked_glitch_staggered_end.mp3"></audio><img src="/media/remora-voice-lab/17_locked_glitch_staggered_end.webp" alt="Spectrogram of the locked stack with a staggered ending" loading="lazy"><figcaption><b>17 · Locked, glitching, staggered end</b><span class="ao-meta">round 2 · "mention it again" from takes 2–5, 0.08–0.32 s late</span></figcaption></figure>
<figure data-id="18"><audio controls preload="none" src="/media/remora-voice-lab/18_locked_glitch_staggered_140.mp3"></audio><img src="/media/remora-voice-lab/18_locked_glitch_staggered_140.webp" alt="Spectrogram of the stack with the number staggered" loading="lazy"><figcaption><b>18 · Staggered "one hundred forty"</b><span class="ao-meta">round 3 · the number from takes 2–5, 0.08–0.32 s late; everything else locked</span></figcaption></figure>
<figcaption><b>Rounds 1–3, the stacks</b><span class="ao-meta">1 Oct, 18:00–18:30 · 10 new ElevenLabs takes, about 1,000 characters of credit</span></figcaption>
</ao-listen>

My answer to 18: "okay, I like this effect, but we can only use this for one or two lines." A
voice that does that on every line stops meaning anything. So the next ask was glitches for her
ordinary lines, and whether there was anything we could install to get better effects.

## Round 4: a glitch per line, rolled

Claude sent a Sonnet 5.5 agent to research plugins and libraries while it built ten glitches and
two ways of combining them, each placed automatically from the line's word timings and never on a number, so she can glitch
on "unit" but never on "forty". G11 is the one meant for everyday use: each line rolls one main
glitch, sometimes a second at the end or in a pause, seeded by the line's id so the same line
always sounds the same. Across her 29 scripted lines it came out as 11 lines with one event, 15
with two and 3 with three. The block below has three of its rolls on the same line.

<ao-listen ref="g00">
<figure data-id="g00"><audio controls preload="none" src="/media/remora-voice-lab/g00_base__depth150.mp3"></audio><img src="/media/remora-voice-lab/g00_base__depth150.webp" alt="Spectrogram of the clean earpiece base" loading="lazy"><figcaption><b>G0 · Clean earpiece</b><span class="ao-meta">shipped take → 250–5000 Hz band → compressor, no wobble</span></figcaption></figure>
<figure data-id="g02"><audio controls preload="none" src="/media/remora-voice-lab/g02_stutter__depth150.mp3"></audio><img src="/media/remora-voice-lab/g02_stutter__depth150.webp" alt="Spectrogram with a stutter before one word" loading="lazy"><figcaption><b>G2 · Stutter</b><span class="ao-meta">the first 50–80 ms of "unit" played before the word</span></figcaption></figure>
<figure data-id="g03"><audio controls preload="none" src="/media/remora-voice-lab/g03_codec_smear__depth150.mp3"></audio><img src="/media/remora-voice-lab/g03_codec_smear__depth150.webp" alt="Spectrogram with the last word through a phone codec" loading="lazy"><figcaption><b>G3 · Codec smear</b><span class="ao-meta">"again" through the GSM phone codec twice · pedalboard</span></figcaption></figure>
<figure data-id="g06"><audio controls preload="none" src="/media/remora-voice-lab/g06_reverse_ghost__depth150.mp3"></audio><img src="/media/remora-voice-lab/g06_reverse_ghost__depth150.webp" alt="Spectrogram with a reversed swell before a word" loading="lazy"><figcaption><b>G6 · Reverse ghost</b><span class="ao-meta">the start of a word played backwards just before it, about −10 dB</span></figcaption></figure>
<figure data-id="g11a"><audio controls preload="none" src="/media/remora-voice-lab/g11_everyday__depth150.mp3"></audio><img src="/media/remora-voice-lab/g11_everyday__depth150.webp" alt="Spectrogram of everyday roll one" loading="lazy"><figcaption><b>G11 · Everyday roll 1</b><span class="ao-meta">rolled: stutter</span></figcaption></figure>
<figure data-id="g11b"><audio controls preload="none" src="/media/remora-voice-lab/g11_everyday__depth150_s1.mp3"></audio><img src="/media/remora-voice-lab/g11_everyday__depth150_s1.webp" alt="Spectrogram of everyday roll two" loading="lazy"><figcaption><b>G11 · Everyday roll 2</b><span class="ao-meta">rolled: packet loss</span></figcaption></figure>
<figure data-id="g11c"><audio controls preload="none" src="/media/remora-voice-lab/g11_everyday__depth150_s2.mp3"></audio><img src="/media/remora-voice-lab/g11_everyday__depth150_s2.webp" alt="Spectrogram of everyday roll three" loading="lazy"><figcaption><b>G11 · Everyday roll 3</b><span class="ao-meta">rolled: ElevenLabs sound-effect burst + stutter</span></figcaption></figure>
<figure data-id="g12"><audio controls preload="none" src="/media/remora-voice-lab/g12_all_at_once__depth150.mp3"></audio><img src="/media/remora-voice-lab/g12_all_at_once__depth150.webp" alt="Spectrogram with nine glitches at once" loading="lazy"><figcaption><b>G12 · Every glitch at once</b><span class="ao-meta">9 glitches, each on its own word · still transcribed perfectly</span></figcaption></figure>
<figcaption><b>Round 4, rem.depth.150</b><span class="ao-meta">1 Oct, 18:35–18:49 · 13 treatments × 3 lines = 41 clips, 8 shown</span></figcaption>
</ao-listen>

## Round 5: effects that never stop

Then I noticed something about all of it: "all the ones you used were just things that just
happen once in the sound clip." I asked for persistent effects, for Kilohearts Essentials and
Glitch² to be installed if they were easy, and for a showcase of what it could do to audio
without ElevenLabs at all.

Glitch² went in, run from Python through DawDreamer in its own environment because the plugin
needs a host with a clock. Kilohearts didn't: it needs an account and its own installer, which
the session said it couldn't do for me. The toolbox came back with 36 techniques and 10 sound
effects synthesised from nothing. And twelve persistent effects, which is where I found it.

**"data shimmer! that is the one!"** P7 is three copies of her drifting 11 to 25 milliseconds
behind on slow, unrelated wobbles. I also liked P12, P10 and P9, and wrote that G11 was "amazing
too".

<ao-listen ref="g00">
<figure data-id="g00"><audio controls preload="none" src="/media/remora-voice-lab/g00_base__depth150.mp3"></audio><img src="/media/remora-voice-lab/g00_base__depth150.webp" alt="Spectrogram of the clean earpiece base" loading="lazy"><figcaption><b>G0 · Clean earpiece</b><span class="ao-meta">the base every P clip sits on</span></figcaption></figure>
<figure data-id="p07"><audio controls preload="none" src="/media/remora-voice-lab/p07_data_shimmer__depth150.mp3"></audio><img src="/media/remora-voice-lab/p07_data_shimmer__depth150.webp" alt="Spectrogram of the data shimmer" loading="lazy"><figcaption><b>P7 · Data shimmer</b><span class="ao-meta">3 delays of 11 / 17 / 23 ms swaying at 0.31 / 0.47 / 0.73 Hz · my pick</span></figcaption></figure>
<figure data-id="p09"><audio controls preload="none" src="/media/remora-voice-lab/p09_granular_halo__depth150.mp3"></audio><img src="/media/remora-voice-lab/p09_granular_halo__depth150.webp" alt="Spectrogram of the granular halo" loading="lazy"><figcaption><b>P9 · Granular halo</b><span class="ao-meta">60–120 ms grains of her voice trailing 0.15–0.6 s behind, some an octave off</span></figcaption></figure>
<figure data-id="p10"><audio controls preload="none" src="/media/remora-voice-lab/p10_whisper_double__depth150.mp3"></audio><img src="/media/remora-voice-lab/p10_whisper_double__depth150.webp" alt="Spectrogram of the whisper double" loading="lazy"><figcaption><b>P10 · Whisper double</b><span class="ao-meta">a phase-randomised copy of her, about 8 dB under</span></figcaption></figure>
<figure data-id="p12"><audio controls preload="none" src="/media/remora-voice-lab/p12_remora_channel__depth150.mp3"></audio><img src="/media/remora-voice-lab/p12_remora_channel__depth150.webp" alt="Spectrogram of the REMORA channel mix" loading="lazy"><figcaption><b>P12 · REMORA channel</b><span class="ao-meta">G11 roll + wow + open radio channel + hum, in the right ear · stereo, use headphones</span></figcaption></figure>
<figcaption><b>Round 5, persistent effects, rem.depth.150</b><span class="ao-meta">1 Oct, 18:57–19:17 · 12 effects × 3 lines, 4 shown</span></figcaption>
</ao-listen>

Glitch²'s factory bank loads a random set of programs every time, so the session pinned the 16 it
rendered and ran each over a plain take of another line, "Visibility zero. Hold the line. The line
does not panic." The transcriber is the only judge Claude had, and it was blunt: **one program
kept all ten words, and six kept none.**

<ao-listen ref="t00">
<figure data-id="t00"><audio controls preload="none" src="/media/remora-voice-lab/t00_dry.mp3"></audio><img src="/media/remora-voice-lab/t00_dry.webp" alt="Spectrogram of the dry take" loading="lazy"><figcaption><b>T00 · Dry take</b><span class="ao-meta">rem.silt.1, no processing</span></figcaption></figure>
<figure data-id="x07"><audio controls preload="none" src="/media/remora-voice-lab/g2_07.mp3"></audio><img src="/media/remora-voice-lab/g2_07.webp" alt="Spectrogram of Glitch² program 7" loading="lazy"><figcaption><b>Glitch² program 07</b><span class="ao-meta">Scribe heard 10 of 10 words</span></figcaption></figure>
<figure data-id="x08"><audio controls preload="none" src="/media/remora-voice-lab/g2_08.mp3"></audio><img src="/media/remora-voice-lab/g2_08.webp" alt="Spectrogram of Glitch² program 8" loading="lazy"><figcaption><b>Glitch² program 08</b><span class="ao-meta">Scribe heard 0 of 10 words</span></figcaption></figure>
<figure data-id="x13"><audio controls preload="none" src="/media/remora-voice-lab/g2_13.mp3"></audio><img src="/media/remora-voice-lab/g2_13.webp" alt="Spectrogram of Glitch² program 13" loading="lazy"><figcaption><b>Glitch² program 13</b><span class="ao-meta">Scribe heard 0 of 10 words</span></figcaption></figure>
<figcaption><b>Glitch², 3 of 16 programs</b><span class="ao-meta">free VST3 plugin, hosted in Python by DawDreamer · factory programs, untuned</span></figcaption>
</ao-listen>

## Rounds 6 and 7: putting the picks together

Round 6 mixed my five picks eight ways on four new lines. My answer: "I like everything together
but the shimmer channel. The echo should be treated as a glitch. And some voicelines should have
the 5 eleven labs voices layer word and staggering as it's bases voice line with all the effects on
top." Round 7 did exactly that and called it REMORA v1. V1 is for ordinary lines: the glitch roll,
with the halo cut down to a brief "memory echo" on 40 % of lines, then the shimmer and the
whisper, in mono. V2 is for the one or two special lines: the shipped take plus four more,
word-locked, with one word staggered and the glitches kept off it.

<ao-listen ref="m00">
<figure data-id="m00"><audio controls preload="none" src="/media/remora-voice-lab/m00_clean__silence1.mp3"></audio><img src="/media/remora-voice-lab/m00_clean__silence1.webp" alt="Spectrogram of the clean silence line" loading="lazy"><figcaption><b>M0 · Clean earpiece</b><span class="ao-meta">the reference for rounds 6 and 7</span></figcaption></figure>
<figure data-id="m07"><audio controls preload="none" src="/media/remora-voice-lab/m07_full_remora__silence1.mp3"></audio><img src="/media/remora-voice-lab/m07_full_remora__silence1.webp" alt="Spectrogram of the full REMORA mix with channel hiss" loading="lazy"><figcaption><b>M7 · Full REMORA</b><span class="ao-meta">round 6 · every pick, channel hiss included · stereo</span></figcaption></figure>
<figure data-id="v1a"><audio controls preload="none" src="/media/remora-voice-lab/v1_everyday__silence1.mp3"></audio><img src="/media/remora-voice-lab/v1_everyday__silence1.webp" alt="Spectrogram of REMORA v1 everyday, roll one" loading="lazy"><figcaption><b>V1 · Everyday, roll 1</b><span class="ao-meta">round 7 · rolled: codec smear · shimmer + whisper, no channel</span></figcaption></figure>
<figure data-id="v1b"><audio controls preload="none" src="/media/remora-voice-lab/v1_everyday__silence1_s1.mp3"></audio><img src="/media/remora-voice-lab/v1_everyday__silence1_s1.webp" alt="Spectrogram of REMORA v1 everyday, roll two" loading="lazy"><figcaption><b>V1 · Everyday, roll 2</b><span class="ao-meta">round 7 · rolled: packet loss + memory echo</span></figcaption></figure>
<figure data-id="v4"><audio controls preload="none" src="/media/remora-voice-lab/v4_stack_bare__silence1.mp3"></audio><img src="/media/remora-voice-lab/v4_stack_bare__silence1.webp" alt="Spectrogram of the bare five-take stack" loading="lazy"><figcaption><b>V4 · Five-take stack, no effects</b><span class="ao-meta">round 7 · the "I" of "Neither have I" staggered</span></figcaption></figure>
<figure data-id="v2"><audio controls preload="none" src="/media/remora-voice-lab/v2_special__silence1.mp3"></audio><img src="/media/remora-voice-lab/v2_special__silence1.webp" alt="Spectrogram of REMORA v1 special" loading="lazy"><figcaption><b>V2 · Special</b><span class="ao-meta">round 7 · the stack + the same roll as V1, roll 1</span></figcaption></figure>
<figcaption><b>Rounds 6–7, rem.silence.1</b><span class="ao-meta">"You have not spoken in some time. Neither have I. One of us should log that." · 1 Oct, 19:26–20:49</span></figcaption>
</ao-listen>

And her first line, where the staggered word is her own name:

<ao-listen ref="m00h">
<figure data-id="m00h"><audio controls preload="none" src="/media/remora-voice-lab/m00_clean__hello1.mp3"></audio><img src="/media/remora-voice-lab/m00_clean__hello1.webp" alt="Spectrogram of the clean hello line" loading="lazy"><figcaption><b>M0 · Clean earpiece</b><span class="ao-meta">rem.hello.1</span></figcaption></figure>
<figure data-id="v1h"><audio controls preload="none" src="/media/remora-voice-lab/v1_everyday__hello1.mp3"></audio><img src="/media/remora-voice-lab/v1_everyday__hello1.webp" alt="Spectrogram of REMORA v1 everyday on the hello line" loading="lazy"><figcaption><b>V1 · Everyday</b><span class="ao-meta">rolled: packet loss + brownout + memory echo</span></figcaption></figure>
<figure data-id="v2h"><audio controls preload="none" src="/media/remora-voice-lab/v2_special__hello1.mp3"></audio><img src="/media/remora-voice-lab/v2_special__hello1.webp" alt="Spectrogram of REMORA v1 special on the hello line" loading="lazy"><figcaption><b>V2 · Special</b><span class="ao-meta">"REMORA" staggered across five takes</span></figcaption></figure>
<figcaption><b>Round 7, rem.hello.1</b><span class="ao-meta">"Monitor engaged. Type R dive monitor, client-supplied. The case stencil reads REMORA. …"</span></figcaption>
</ao-listen>

The transcriber got every word of 29 of round 7's 32 clips; the other three kept every word and
picked up an extra "uh" where the staggered "I"s trail off. Which lines get V2 isn't decided
yet.

## What the numbers could and couldn't do

The session never guessed at what sounded good. It measured what it could and printed it on the
page: the loudness match, the pitch spread in semitones, the transcriber's word count, how much of
each line an effect actually touched. Those numbers cleared out what didn't work before I heard
anything (six Glitch² programs that erased the line, a pile-up that turned "meters" into "units"),
and they couldn't tell me a thing about which of the rest was good.

**The useful thing an agent did here was make my ears fast.** Same line, same level, same moment,
one click between them, so the only difference left was the one I was there to judge. Seven rounds
took 2 hours 48 minutes and $32 at API list prices, almost all of it Opus 5.5, with one Sonnet 5.5
research agent. Of everything in REMORA v1, only the five-take stack was in my first prompt. The
shimmer, the whisper and the echo are things I said yes to after hearing them.
