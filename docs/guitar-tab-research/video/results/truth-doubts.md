# Doubts about the answer keys that change how a score may be read

Collected from the experiment agents' notes (work folders exp-chords and exp-tuning) and the answer-key checks.
Every later record and the film's script follow these readings.

## Tuning song: where the beat falls

- The tuning song's tab has no rhythm. Its answer-key beats were placed by rule (beats 3 and 4 on note onsets,
  beat 2 between, beat 1 on the lowest note of the rolled chord).
- Every beat tracker (Beat This!, madmom, madmom with a tempo hint) puts each beat about 0.2 s later than the key
  (median +0.195 to +0.199 s; about a sixteenth note of a 0.9 s beat). madmom agrees with the key on tempo (65 and 66
  BPM against 65.73, step-04 tempo table). Beat This! does not: its tempo is 72 BPM (9.5 % off) and it adds beats in
  places (211 beats for the key's 193, nine bars counted to a fifth beat and four to a sixth;
  `experiments/tuning/c-01/beats.txt`), corrected 2026-11-25 after the ch06 film review.
- Unshifted beat F on the tuning song (0.02 to 0.05) measures that phase difference, not missing beats. Moved by the
  median offset, beat F is 0.77 to 0.86.
- So which phase is right is a matter of judgement, not settled by the key. The film does not call the trackers wrong
  on this song. It plays the key's click track and a tracker's click track over the recording and lets the viewer
  judge, and it may quote the shifted F with the shift named.

## Standard song: tuning offset in cents

- The key says +6 cents (median of 485 notes, +5.64, rounded). Independent measurements give +3.7 to +4.9 cents;
  librosa's estimate is +3.0.
- So a tool's cents error on the standard song is uncertain by about 2 cents. The film does not grade a tool on cents
  differences under 3 on this song.

## Capo and standard songs: sevenths

- The keys label no sevenths (the Cmaj7 colour of the intro and the E7 of the chorus are named as plain triads).
  A tool that names Cmaj7 or E7 there counts as wrong under "sevenths" but right under "root" and "majmin". Read the
  sevenths column of these two songs with that in mind; the film quotes majmin or root.

## Tuning song: the home key

- `truth-tuning.md` names the key D minor "(a judgement)": a key-profile fit on duration-weighted pitch classes of the
  repaired notes gives D minor r = 0.744, C major 0.732, F major 0.725 (F major is the relative major, the same pitch
  set). `RESULTS.md` Limits: "the key (D minor or F major) is a judgement".
- So D minor against F major is not settled by the key. The film does not grade a tool or a blind attempt on it (madmom
  and the bare arm said F major, the kit arm D minor); it names both and leaves it to the ear. Added by the script-fix
  agent, 2026-11-25, from the script fact check's records note (`script-factcheck.md`).
