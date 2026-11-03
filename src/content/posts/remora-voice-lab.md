---
id: "AO-030"
title: "Designing a robot voice for my game with an AI that can't hear"
summary: "Claude made 223 clips of the robot voice in my cave-diving game in under three hours without hearing any of them. How we narrowed them down, the one I picked, and every clip to compare."
date: 2026-10-02
topic: "games"
project: ["blackwater"]
preview:
  verdict: "It measured, I listened"
  takeaway: "Claude can't hear, but it made my listening fast: same line, same loudness, one click apart, so the only difference left was the one I was judging."
  points:
    - "My pick was a 'data shimmer', three copies of the robot's voice drifting 11 to 25 ms behind. I hadn't asked for it."
    - "A speech-to-text check cut failures first. Of 16 glitch-plugin presets, one kept all ten words and six kept none."
    - "Everyday lines get a per-line glitch and the shimmer, special lines five stacked takes. None of it is in the game yet."
  image: "/media/previews/remora-voice-lab.webp"
  alt: "Spectrogram of the data shimmer version of the robot voice, bright bands of speech on purple"
---

I asked Claude to make REMORA sound cooler. She's the robot voice in the diver's ear in my
cave-diving game [BLACKWATER](/ledger/blackwater-weekend/). In under three hours Claude made 223
clips over seven rounds, and it couldn't hear a single one. "Your ears decide," it wrote at the top
of the listening page it built me. **My pick was a "data shimmer", three copies of her voice
drifting a few milliseconds apart, and it wasn't anything I'd asked for.**

- **Claude measured, I listened.** Every comparison used the same line at the same loudness, and
  every clip got a speech-to-text check (software that writes down what it hears). Each of my
  answers set up the next round.
- **The shimmer won.** I also liked a whispered copy of her underneath, a halo of tiny slivers of
  her voice trailing behind, and a different glitch for each line.
- **The numbers threw out failures before I heard them.** Of 16 presets in one glitch plugin (an
  add-on effect for audio software), one kept all ten words for the transcriber and six kept none.
- **She gets two versions.** An everyday one, and a special one with five takes at once for one or
  two lines. None of it is in the game yet.

## Round 1: what ships now, and the first experiments

I asked for at least ten experiments. I also wanted to hear her line generated five times and
played at once, and five different voices saying it together. What ships today is her voice with a
fast volume wobble, squeezed into the narrow range of a phone line. Claude found the biggest step
toward "robot" was flattening her pitch onto one note.

<ao-listen ref="00">
<figure data-id="00"><audio controls preload="none" src="/media/remora-voice-lab/00_current.mp3"></audio><img src="/media/remora-voice-lab/00_current.webp" alt="Spectrogram of the shipped voice" loading="lazy"><figcaption><b>What ships today</b><span class="ao-meta">a fast volume wobble through a phone band</span></figcaption></figure>
<figure data-id="02"><audio controls preload="none" src="/media/remora-voice-lab/02_monotone.mp3"></audio><img src="/media/remora-voice-lab/02_monotone.webp" alt="Spectrogram of the monotone version, harmonics in flat lines" loading="lazy"><figcaption><b>Monotone</b><span class="ao-meta">every word pushed onto one note</span></figcaption></figure>
<figure data-id="04"><audio controls preload="none" src="/media/remora-voice-lab/04_vocoder.mp3"></audio><img src="/media/remora-voice-lab/04_vocoder.webp" alt="Spectrogram of the channel vocoder version" loading="lazy"><figcaption><b>Vocoder</b><span class="ao-meta">the classic robot effect, her voice shaping a synth buzz</span></figcaption></figure>
<figure data-id="15"><audio controls preload="none" src="/media/remora-voice-lab/15_stack_machined_unison.mp3"></audio><img src="/media/remora-voice-lab/15_stack_machined_unison.webp" alt="Spectrogram of five takes locked to one note" loading="lazy"><figcaption><b>Machined unison</b><span class="ao-meta">five takes locked together on one note, with a metallic ring</span></figcaption></figure>
<figcaption><b>Round 1, the 150-meter line</b><span class="ao-meta">"One hundred fifty meters. This unit is rated to one hundred forty. We will not mention it again." · 16 clips in the round, 4 here, all at the same loudness · each picture is the clip's spectrogram, time left to right and pitch bottom to top · switching clips keeps your place, and A/B jumps to what ships today</span></figcaption>
</ao-listen>

## The stacks I asked for

Five takes of one line drift apart, because each one breathes and paces a little differently, so
the pauses fill in. Five different voices were worse, and the transcriber heard "meters" as
"units". To fix the drift, Claude lined up every word of takes 2 to 5 with take 1. ElevenLabs, the
AI voice service, gives a timestamp for every character, which made that possible. Locked like
that, the pauses come back. Then I had it stagger just "one hundred forty", each take a little
later than the last.

<ao-listen ref="10">
<figure data-id="10"><audio controls preload="none" src="/media/remora-voice-lab/10_five_takes_raw.mp3"></audio><img src="/media/remora-voice-lab/10_five_takes_raw.webp" alt="Spectrogram of five unaligned takes, a continuous smear" loading="lazy"><figcaption><b>Five takes, raw</b><span class="ao-meta">the same line generated five times, played at once · my request</span></figcaption></figure>
<figure data-id="11"><audio controls preload="none" src="/media/remora-voice-lab/11_five_voices_raw.mp3"></audio><img src="/media/remora-voice-lab/11_five_voices_raw.webp" alt="Spectrogram of five different voices, unaligned" loading="lazy"><figcaption><b>Five voices, raw</b><span class="ao-meta">five different voices at once, and the transcriber heard "meters" as "units" · my request</span></figcaption></figure>
<figure data-id="12"><audio controls preload="none" src="/media/remora-voice-lab/12_five_takes_locked.mp3"></audio><img src="/media/remora-voice-lab/12_five_takes_locked.webp" alt="Spectrogram of five takes word-locked, with clean pauses" loading="lazy"><figcaption><b>Five takes, word-locked</b><span class="ao-meta">every word of takes 2 to 5 moved onto take 1</span></figcaption></figure>
<figure data-id="16"><audio controls preload="none" src="/media/remora-voice-lab/16_locked_glitch_last_line_loose.mp3"></audio><img src="/media/remora-voice-lab/16_locked_glitch_last_line_loose.webp" alt="Spectrogram of the locked stack with glitches and a loose ending" loading="lazy"><figcaption><b>Locked, glitching, last line loose</b><span class="ao-meta">round 2 · glitches added, and the lock lets go before "We will not"</span></figcaption></figure>
<figure data-id="17"><audio controls preload="none" src="/media/remora-voice-lab/17_locked_glitch_staggered_end.mp3"></audio><img src="/media/remora-voice-lab/17_locked_glitch_staggered_end.webp" alt="Spectrogram of the locked stack with a staggered ending" loading="lazy"><figcaption><b>Locked, glitching, staggered end</b><span class="ao-meta">round 2 · each take says "mention it again" a little later than the last</span></figcaption></figure>
<figure data-id="18"><audio controls preload="none" src="/media/remora-voice-lab/18_locked_glitch_staggered_140.mp3"></audio><img src="/media/remora-voice-lab/18_locked_glitch_staggered_140.webp" alt="Spectrogram of the stack with the number staggered" loading="lazy"><figcaption><b>Staggered "one hundred forty"</b><span class="ao-meta">round 3 · just the number staggered, everything else locked</span></figcaption></figure>
<figcaption><b>Rounds 1 to 3, the stacks</b><span class="ao-meta">10 new AI voice takes made for these</span></figcaption>
</ao-listen>

My answer to that one: "okay, I like this effect, but we can only use this for one or two lines."
A voice that does that on every line stops meaning anything. So next I asked for glitches for her
ordinary lines.

## A glitch on every line

Claude built ten glitches and two ways to mix them, placed from the word timings and never on a
number, so she can glitch on "unit" but never on "forty". The everyday mix rolls one main glitch
for each line, sometimes a second. The roll is tied to the line, so the same line always sounds
the same.

<details><summary>Every glitch, and the plugin test</summary>

The clean base, three of the ten glitches, three rolls of the everyday mix on the same line, and
every glitch at once. A second agent, Claude Sonnet 5.5, researched plugins and libraries while Claude built these.
Across her 29 scripted lines, the everyday roll put one glitch on 11 lines, two on 15 and three on 3.

<ao-listen ref="g00">
<figure data-id="g00"><audio controls preload="none" src="/media/remora-voice-lab/g00_base__depth150.mp3"></audio><img src="/media/remora-voice-lab/g00_base__depth150.webp" alt="Spectrogram of the clean earpiece base" loading="lazy"><figcaption><b>Clean earpiece</b><span class="ao-meta">the shipped take, less filtered, with no wobble</span></figcaption></figure>
<figure data-id="g02"><audio controls preload="none" src="/media/remora-voice-lab/g02_stutter__depth150.mp3"></audio><img src="/media/remora-voice-lab/g02_stutter__depth150.webp" alt="Spectrogram with a stutter before one word" loading="lazy"><figcaption><b>Stutter</b><span class="ao-meta">the start of "unit" played just before the word</span></figcaption></figure>
<figure data-id="g03"><audio controls preload="none" src="/media/remora-voice-lab/g03_codec_smear__depth150.mp3"></audio><img src="/media/remora-voice-lab/g03_codec_smear__depth150.webp" alt="Spectrogram with the last word through a phone codec" loading="lazy"><figcaption><b>Codec smear</b><span class="ao-meta">"again" crushed twice by old cellphone compression</span></figcaption></figure>
<figure data-id="g06"><audio controls preload="none" src="/media/remora-voice-lab/g06_reverse_ghost__depth150.mp3"></audio><img src="/media/remora-voice-lab/g06_reverse_ghost__depth150.webp" alt="Spectrogram with a reversed swell before a word" loading="lazy"><figcaption><b>Reverse ghost</b><span class="ao-meta">the start of a word played backwards, quietly, just before it</span></figcaption></figure>
<figure data-id="g11a"><audio controls preload="none" src="/media/remora-voice-lab/g11_everyday__depth150.mp3"></audio><img src="/media/remora-voice-lab/g11_everyday__depth150.webp" alt="Spectrogram of everyday roll one" loading="lazy"><figcaption><b>Everyday glitch, roll 1</b><span class="ao-meta">rolled a stutter</span></figcaption></figure>
<figure data-id="g11b"><audio controls preload="none" src="/media/remora-voice-lab/g11_everyday__depth150_s1.mp3"></audio><img src="/media/remora-voice-lab/g11_everyday__depth150_s1.webp" alt="Spectrogram of everyday roll two" loading="lazy"><figcaption><b>Everyday glitch, roll 2</b><span class="ao-meta">rolled packet loss, like a bad call dropping bits</span></figcaption></figure>
<figure data-id="g11c"><audio controls preload="none" src="/media/remora-voice-lab/g11_everyday__depth150_s2.mp3"></audio><img src="/media/remora-voice-lab/g11_everyday__depth150_s2.webp" alt="Spectrogram of everyday roll three" loading="lazy"><figcaption><b>Everyday glitch, roll 3</b><span class="ao-meta">rolled an AI sound-effect burst and a stutter</span></figcaption></figure>
<figure data-id="g12"><audio controls preload="none" src="/media/remora-voice-lab/g12_all_at_once__depth150.mp3"></audio><img src="/media/remora-voice-lab/g12_all_at_once__depth150.webp" alt="Spectrogram with nine glitches at once" loading="lazy"><figcaption><b>Every glitch at once</b><span class="ao-meta">9 glitches, each on its own word, and still transcribed perfectly</span></figcaption></figure>
<figcaption><b>Round 4, the 150-meter line</b><span class="ao-meta">41 clips in the round, 8 here</span></figcaption>
</ao-listen>

In round 5 I asked Claude to install two plugin packs (add-on effects for audio software),
Kilohearts Essentials and Glitch², if they were easy. Glitch² went in, run from Python through
DawDreamer, because the plugin has to run inside a host program that keeps time. Kilohearts needs an account and its own
installer, which Claude couldn't do for me.

Glitch²'s factory bank loads a random set of presets every time, so Claude pinned the 16 it rendered
and ran each over a plain take of another line, "Visibility zero. Hold the line. The line does not
panic." The transcriber was the only judge Claude had, and it was blunt. **One preset kept all ten
words, and six kept none.**

<ao-listen ref="t00">
<figure data-id="t00"><audio controls preload="none" src="/media/remora-voice-lab/t00_dry.mp3"></audio><img src="/media/remora-voice-lab/t00_dry.webp" alt="Spectrogram of the dry take" loading="lazy"><figcaption><b>Dry take</b><span class="ao-meta">the line with no effects</span></figcaption></figure>
<figure data-id="x07"><audio controls preload="none" src="/media/remora-voice-lab/g2_07.mp3"></audio><img src="/media/remora-voice-lab/g2_07.webp" alt="Spectrogram of Glitch² program 7" loading="lazy"><figcaption><b>Glitch² preset 07</b><span class="ao-meta">the transcriber heard 10 of 10 words</span></figcaption></figure>
<figure data-id="x08"><audio controls preload="none" src="/media/remora-voice-lab/g2_08.mp3"></audio><img src="/media/remora-voice-lab/g2_08.webp" alt="Spectrogram of Glitch² program 8" loading="lazy"><figcaption><b>Glitch² preset 08</b><span class="ao-meta">the transcriber heard 0 of 10 words</span></figcaption></figure>
<figure data-id="x13"><audio controls preload="none" src="/media/remora-voice-lab/g2_13.mp3"></audio><img src="/media/remora-voice-lab/g2_13.webp" alt="Spectrogram of Glitch² program 13" loading="lazy"><figcaption><b>Glitch² preset 13</b><span class="ao-meta">the transcriber heard 0 of 10 words</span></figcaption></figure>
<figcaption><b>Glitch², 3 of 16 presets</b><span class="ao-meta">a free glitch plugin, factory presets, untuned</span></figcaption>
</ao-listen>

</details>

## Effects that never stop

Then I told Claude, "all the ones you used were just things that just happen once in the sound
clip." So I asked for effects that run under the whole line. Claude made twelve, and that's where I
found it. **"data shimmer! that is the one!"** Three copies of her drift 11 to 25 milliseconds
behind, each on its own slow wobble. I also liked the radio channel, the whisper and the halo.

<ao-listen ref="g00">
<figure data-id="g00"><audio controls preload="none" src="/media/remora-voice-lab/g00_base__depth150.mp3"></audio><img src="/media/remora-voice-lab/g00_base__depth150.webp" alt="Spectrogram of the clean earpiece base" loading="lazy"><figcaption><b>Clean earpiece</b><span class="ao-meta">the base under every effect here</span></figcaption></figure>
<figure data-id="p07"><audio controls preload="none" src="/media/remora-voice-lab/p07_data_shimmer__depth150.mp3"></audio><img src="/media/remora-voice-lab/p07_data_shimmer__depth150.webp" alt="Spectrogram of the data shimmer" loading="lazy"><figcaption><b>Data shimmer</b><span class="ao-meta">three copies of her a few milliseconds behind, each swaying on its own · my pick</span></figcaption></figure>
<figure data-id="p09"><audio controls preload="none" src="/media/remora-voice-lab/p09_granular_halo__depth150.mp3"></audio><img src="/media/remora-voice-lab/p09_granular_halo__depth150.webp" alt="Spectrogram of the granular halo" loading="lazy"><figcaption><b>Granular halo</b><span class="ao-meta">tiny slivers of her voice trailing up to 0.6 seconds behind, some an octave off</span></figcaption></figure>
<figure data-id="p10"><audio controls preload="none" src="/media/remora-voice-lab/p10_whisper_double__depth150.mp3"></audio><img src="/media/remora-voice-lab/p10_whisper_double__depth150.webp" alt="Spectrogram of the whisper double" loading="lazy"><figcaption><b>Whisper double</b><span class="ao-meta">a quieter, whispery copy of her underneath</span></figcaption></figure>
<figure data-id="p12"><audio controls preload="none" src="/media/remora-voice-lab/p12_remora_channel__depth150.mp3"></audio><img src="/media/remora-voice-lab/p12_remora_channel__depth150.webp" alt="Spectrogram of the REMORA channel mix" loading="lazy"><figcaption><b>Radio channel</b><span class="ao-meta">a glitch roll plus radio hiss and hum, in the right ear · stereo, best on headphones</span></figcaption></figure>
<figcaption><b>Round 5, effects that never stop</b><span class="ao-meta">12 effects on 3 lines, 4 here</span></figcaption>
</ao-listen>

## Putting it together: an everyday voice and a special one

Round 6 mixed my picks eight ways. I liked everything together except the radio channel. I wanted
the halo's echo treated like a glitch, and some lines built on the five stacked takes. Round 7 did
that, with two versions.

- **Everyday, for most lines:** the glitch roll, a short echo on 40% of lines, the shimmer and the
  whisper.
- **Special, for one or two lines:** five takes locked word by word, with one word staggered.

<ao-listen ref="m00">
<figure data-id="m00"><audio controls preload="none" src="/media/remora-voice-lab/m00_clean__silence1.mp3"></audio><img src="/media/remora-voice-lab/m00_clean__silence1.webp" alt="Spectrogram of the clean silence line" loading="lazy"><figcaption><b>Clean earpiece</b><span class="ao-meta">the reference for rounds 6 and 7</span></figcaption></figure>
<figure data-id="m07"><audio controls preload="none" src="/media/remora-voice-lab/m07_full_remora__silence1.mp3"></audio><img src="/media/remora-voice-lab/m07_full_remora__silence1.webp" alt="Spectrogram of the full REMORA mix with channel hiss" loading="lazy"><figcaption><b>Everything together</b><span class="ao-meta">round 6 · every pick, radio hiss included · stereo</span></figcaption></figure>
<figure data-id="v1a"><audio controls preload="none" src="/media/remora-voice-lab/v1_everyday__silence1.mp3"></audio><img src="/media/remora-voice-lab/v1_everyday__silence1.webp" alt="Spectrogram of REMORA v1 everyday, roll one" loading="lazy"><figcaption><b>Everyday, roll 1</b><span class="ao-meta">round 7 · rolled a codec smear, plus the shimmer and the whisper</span></figcaption></figure>
<figure data-id="v1b"><audio controls preload="none" src="/media/remora-voice-lab/v1_everyday__silence1_s1.mp3"></audio><img src="/media/remora-voice-lab/v1_everyday__silence1_s1.webp" alt="Spectrogram of REMORA v1 everyday, roll two" loading="lazy"><figcaption><b>Everyday, roll 2</b><span class="ao-meta">round 7 · rolled packet loss and the memory echo</span></figcaption></figure>
<figure data-id="v4"><audio controls preload="none" src="/media/remora-voice-lab/v4_stack_bare__silence1.mp3"></audio><img src="/media/remora-voice-lab/v4_stack_bare__silence1.webp" alt="Spectrogram of the bare five-take stack" loading="lazy"><figcaption><b>Five-take stack, no effects</b><span class="ao-meta">round 7 · the "I" of "Neither have I" staggered</span></figcaption></figure>
<figure data-id="v2"><audio controls preload="none" src="/media/remora-voice-lab/v2_special__silence1.mp3"></audio><img src="/media/remora-voice-lab/v2_special__silence1.webp" alt="Spectrogram of REMORA v1 special" loading="lazy"><figcaption><b>Special</b><span class="ao-meta">round 7 · the stack plus the same glitch as everyday roll 1</span></figcaption></figure>
<figcaption><b>Rounds 6 and 7, the silence line</b><span class="ao-meta">"You have not spoken in some time. Neither have I. One of us should log that."</span></figcaption>
</ao-listen>

And her first line, where the staggered word is her own name:

<ao-listen ref="m00h">
<figure data-id="m00h"><audio controls preload="none" src="/media/remora-voice-lab/m00_clean__hello1.mp3"></audio><img src="/media/remora-voice-lab/m00_clean__hello1.webp" alt="Spectrogram of the clean hello line" loading="lazy"><figcaption><b>Clean earpiece</b><span class="ao-meta">her first line, no effects</span></figcaption></figure>
<figure data-id="v1h"><audio controls preload="none" src="/media/remora-voice-lab/v1_everyday__hello1.mp3"></audio><img src="/media/remora-voice-lab/v1_everyday__hello1.webp" alt="Spectrogram of REMORA v1 everyday on the hello line" loading="lazy"><figcaption><b>Everyday</b><span class="ao-meta">rolled packet loss, a power-dip brownout and the memory echo</span></figcaption></figure>
<figure data-id="v2h"><audio controls preload="none" src="/media/remora-voice-lab/v2_special__hello1.mp3"></audio><img src="/media/remora-voice-lab/v2_special__hello1.webp" alt="Spectrogram of REMORA v1 special on the hello line" loading="lazy"><figcaption><b>Special</b><span class="ao-meta">"REMORA" staggered across five takes</span></figcaption></figure>
<figcaption><b>Round 7, her first line</b><span class="ao-meta">"Monitor engaged. Type R dive monitor, client-supplied. The case stencil reads REMORA. ..."</span></figcaption>
</ao-listen>

Which lines get the special version isn't decided yet. The seven rounds took 2 hours 48 minutes
and cost $32 at pay-per-use API prices. Only the five-take stack was in my first prompt. I said
yes to the shimmer, the whisper and the echo after hearing them.

<details><summary>Every clip's recipe, and what it cost</summary>

Every clip was set to -18 LUFS, a standard loudness measure, so none wins by being louder. The
transcriber is ElevenLabs' Scribe. Claude printed what it could measure next to each clip: the
loudness match, the pitch spread in semitones, the transcriber's word count, and how much of each
line an effect touched. Those numbers cleared out what didn't work. They couldn't tell me which of
the rest was good. Opus 5.5 in Claude Code did the work in Python (numpy, scipy and
pyworld), with one Sonnet 5.5 research agent.

**Round 1, the 150-meter line (1 Oct, 18:00 to 18:22, 16 clips)**

- What ships today: a 52 Hz tremolo at depth 0.3, then a 320 to 3300 Hz band, then a 9:1 compressor.
- Monotone: the WORLD vocoder, every voiced frame re-pitched to 196 Hz (G3).
- Vocoder: a 28-band channel vocoder on a 196 Hz sawtooth plus a sub-octave.
- Machined unison: five takes word-locked and pitch-locked to G3, light ring mod, a comb filter tuned to her note.

**Rounds 1 to 3, the stacks (18:00 to 18:30, 10 new ElevenLabs takes, about 1,000 characters of credit)**

- Five takes, raw: 5 ElevenLabs takes (seeds 1001 to 1005) started together, no processing.
- Five voices, raw: 5 ElevenLabs voices started together. Scribe heard "meters" as "units".
- Word-locked: takes 2 to 5 re-timed word by word onto take 1 with WORLD.
- Last line loose: the locked stack plus stutter, dropout, crush and pitch sag, lock released before "We will not".
- Staggered end: "mention it again" from takes 2 to 5, 0.08 to 0.32 s late.
- Staggered number: the number from takes 2 to 5, 0.08 to 0.32 s late, everything else locked.

**Round 4, glitches (18:35 to 18:49, 41 clips)**

- Clean earpiece: the shipped take through a 250 to 5000 Hz band and a compressor, no wobble.
- Stutter: the first 50 to 80 ms of "unit" played before the word.
- Codec smear: "again" through the GSM phone codec twice, with the pedalboard audio library.
- Reverse ghost: the start of a word reversed just before it, about 10 dB down.
- Everyday rolls: one main glitch per line, seeded by the line's id. The three rolls here came out as a stutter, packet loss, and an ElevenLabs sound-effect burst plus a stutter.
- Every glitch at once: 9 glitches, each on its own word.

**Round 5, persistent effects (18:57 to 19:17, 12 effects on 3 lines)**

The toolbox that came back with them held 36 techniques and 10 sound effects made from scratch.

- Data shimmer: three delays of 11, 17 and 23 ms swaying at 0.31, 0.47 and 0.73 Hz.
- Granular halo: 60 to 120 ms grains of her voice trailing 0.15 to 0.6 s behind, some an octave off.
- Whisper double: a phase-randomised copy of her, about 8 dB under.
- Radio channel: an everyday roll plus wow, an open radio channel and hum, in the right ear.
- Glitch²: a free VST3 plugin, hosted in Python by DawDreamer in its own environment. 16 factory programs pinned and run on the "Visibility zero" line.

**Rounds 6 and 7, putting it together (19:26 to 20:49)**

- Everything together: every pick, radio hiss included, stereo.
- Everyday: the glitch roll, the halo cut down to a brief memory echo on 40% of lines, then the shimmer and the whisper, in mono.
- Special: the shipped take plus four more, word-locked, one word staggered with the glitches kept off it, plus the same roll as everyday roll 1.

**Round 7 transcripts:** all 32 clips kept every word. Three picked up an extra "uh" where the
staggered "I"s trail off.

**Cost:** seven rounds in 2 hours 48 minutes, $32 at pay-per-use API prices, almost all of it Opus 5.5.

</details>
