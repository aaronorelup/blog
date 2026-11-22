The Quiet Hour: the soundtrack recipe (numpy and scipy only; ffmpeg only to decode the voice takes once)

One script makes the whole soundtrack of an ending from three inputs, and nothing else:
  - the ending's cue file, written by ../cues.mjs from the log and the film's rules (every voice line with its start
    frame, every knob turn, dial tap and the chalk, and per-note arrays: pick, its probability, step changed, hum on,
    tear amount, spoon chatter; and the last note's bet for the coda),
  - the ending's published audio (Fable 5.2's programme, decoded to 48 kHz, sample 0 = programme 00:00),
  - the frozen voice files (frozen/manifest.json lists each file's sha256; the build refuses a changed file).

  python build_sound.py --ending main --cues <work>/build/cues/cues-main.json --out <dir>
      -> <dir>/soundtrack-main.wav (48 kHz stereo 24-bit, exactly 4,800,000 samples = 2,400 frames x 2,000)
         <dir>/soundtrack-main.json (loudness, every placed sound with its sample and frame, sha256)
      --sync-proof adds a click on every bar line through the speaker; sync_proof.py checks where they land.

The build fails if true peak is above -1 dBTP, short-term loudness is above -13 LUFS anywhere, integrated loudness
is outside -18 to -15 LUFS, any line is less than 4 LU above the bed under it (the programme dips under each line,
deeper where the music is loud), or a ratchet, the chalk, a dial tap or a sure pick's punch is masked in its own band
(each is raised, up to 15 dB, until it is 3 dB above everything else there). Two runs give the same bytes. Nothing in
it branches on the ending's name (the name only picks which published file to open), and the first 60 s (20:00 on
the clock, samples 0 to 2,879,999) come out bit-identical in all four endings: nothing in the chain looks ahead
across a bar line (causal filters, the room response convolved one bar at a time, the limiter deciding each bar from
that bar and the one before).

  python verify_sound.py --dir <dir> [--again <dir of a second build>] [--mp3]
      -> loudness again by ffmpeg ebur128 and pyloudnorm, lengths, the first 60 s identical, the two builds identical,
         and the web mp3s' decoded lengths and offsets
  python spectrogram.py --wav <wav> --json <its .json> --png <png>   (the soundtrack drawn, with its events)

Files
  build_sound.py   the soundtrack: speaker chain, compressor, voice (with the programme dipped under it), bench foley,
                   room (hum, clock, tube whine, tear crackle, spoon), the coda's held bet, the mix and its checks
  bs1770.py        loudness by ITU-R BS.1770 / EBU R128 (integrated, short-term, momentary, true peak)
  wav24.py         WAV reading, and 24-bit writing with a fixed header
  voice_measure.py speaking length, pace (words a minute), pitch and noise floor of a take, without listening
  voice_freeze.py  picks one take of every line (its transcript must say the line; then the pace nearest 125 words
                   a minute), trims and levels it, freezes it with its sha256 and writes ../../data/voice.json
                   (each line's text and length, which ../cues.mjs --durations reads to schedule lines)
  sync_proof.py    bar-line clicks at frame x 2000; the published notes on the 5-frame grid
  verify_sound.py  the checks again with other tools (ffmpeg ebur128, pyloudnorm), identity across endings and builds
  spectrogram.py   a PNG of a soundtrack with every line and bench sound marked (matplotlib)

The voice is a new voice designed for this film with ElevenLabs voice design ("Quiet Hour maker (AO-087)"): an older
woman, calm, warm, dry, unhurried. The takes were spoken once, transcribed back, measured and frozen; the audio files
themselves are not in this repository.
