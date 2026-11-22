The Quiet Hour: the soundtrack recipe (numpy and scipy only; ffmpeg decodes the voice takes and writes the mp3)

One script makes the whole soundtrack of an ending from three inputs, and nothing else:
  - the ending's cue file, written by ../cues.mjs from the log and the film's rules (every voice line with its start
    frame, every knob turn with its frames and how far it goes, the dial taps and the chalk tick, and per-note arrays:
    pick, its probability, hum on, tear amount, spoon chatter; and the last note's bet for the coda),
  - the ending's published audio (Fable 5.2's programme, decoded to 48 kHz, sample 0 = programme 00:00),
  - the frozen voice files (frozen/manifest.json lists each file's sha256; the build refuses a changed file).

  python build_sound.py --ending main --cues <work>/build/cues/cues-main.json --out <dir>
      -> <dir>/soundtrack-main.wav (48 kHz stereo 24-bit, exactly 4,800,000 samples = 2,400 frames x 2,000)
         <dir>/soundtrack-main.json (loudness, every placed sound with its sample and frame, each line of the voice
         with its loudness, the loudness of everything under it and how far the programme was dipped, sha256)
      --sync-proof adds a click on every bar line through the speaker; sync_proof.py checks where they land.
  python web_copy.py --wav <dir>/soundtrack-main.wav --mp3 <dir>/fable-opus-quiet-hour-main.mp3
      -> the lab page's copy (mp3, 128 kb/s, 48 kHz stereo), decoded back and compared with the WAV: read with its
         gapless header it is the same 4,800,000 samples at offset 0; a player that ignores the header starts the
         film 1,105 samples (23 ms) late. It comes out 0.45 dB quieter than the WAV (the encoder's own scaling at
         this bitrate).

The build fails if true peak is above -1 dBTP, short-term loudness is above -13 LUFS anywhere, a line of the voice is
less than 4 LU over everything under it, or the hum differs from the engine's own hum level. Two runs give the same
bytes. Nothing in it branches on the ending's name (the name only picks which published file to open), and the first
20:00 come out byte-identical in all four endings: every gain before 20:00 depends only on what has sounded so far
(the peak limiter alone looks 15 ms ahead), and the room response is convolved in one-second blocks, so nothing later
can disturb them even by rounding.

What is where
  The TV (mono, through the speaker chain): the programme through a static compressor; the maker's voice; under each
  line the programme dips 9 dB, or as far as it takes to hold its level 4 LU under that line's own, in place before
  the line starts; a punch tick on every pick (level by its probability); the ratchet on every knob turn (one click
  per tooth passed, so one click a note while the knob creeps and a zip when it is pushed); the chalk tick; the dial
  taps; a soft crank creak every bar; in the coda the last bet held as a pad.
  The room (stereo): the house hum (it follows the cue's hum flag and stops dead when the flag drops), a wall-clock
  tick on every bar line, a faint tube whine, tear crackle, the spoon.

Files
  build_sound.py   the soundtrack and its checks
  bs1770.py        loudness by ITU-R BS.1770 / EBU R128 (integrated, short-term, momentary, true peak)
  wav24.py         WAV reading, and 24-bit writing with a fixed header
  voice_measure.py speaking length, pace (words a minute), pitch and noise floor of a take, without listening
  voice_freeze.py  picks one take of every line (its transcript must say the line; then the pace nearest 125 words
                   a minute), trims and levels it, freezes it with its sha256 and writes ../../data/voice.json
                   (each line's text and length, which the engine reads to schedule lines and subtitles)
  sync_proof.py    bar-line clicks at frame x 2000; the published notes on the 5-frame grid
  web_copy.py      the mp3 for the lab page, and the proof that it stays in step

The voice is a new voice designed for this film with ElevenLabs voice design ("Quiet Hour maker (AO-087)"): an older
woman, calm, warm, dry, unhurried. The takes were spoken once, transcribed back, measured and frozen; the audio files
themselves are not in this repository. Nobody listened while this was made: every level here was set by measurement.
