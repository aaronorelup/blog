# browser-audio-sync lane inputs (added by try-browser-audio-sync, 2026-11-10)

- `S4_10s/`: a 10.000 s excerpt of the shared clip S4 for the in-browser Demucs trial: `sox <S4 file> <out> trim
  182483s 441000s` applied to `S4.wav` and to each of `stems/bass.wav`, `stems/drums.wav`, `stems/guitar.wav`,
  `stems/lead.wav` (samples 182483 to 623482, from 4.137937 s, the first beat after the count-in bar; 44.1 kHz,
  2 channels, 16-bit). `S4_10s.truth.json` is S4's truth with `stems` pointing at the cut files, `duration_s` 10, and
  notes, beats and chords emptied (they were not shifted). Source and license: the shared S4 clip (synthesized for this
  test set; see `/home/user/gtr/inputs/INPUTS.md`, row S4: rendered with the FluidR3_GM SoundFont, MIT license: "I
  hereby release Fluid under the MIT license, as described in COPYING.").
- `FluidR3_GM.sf2`: a symbolic link to `/usr/share/sounds/sf2/FluidR3_GM.sf2` (148,398,306 bytes, Debian package
  fluid-soundfont-gm), so the trial pages can load the same SoundFont that rendered the shared inputs.
