You are writing one unit (about one bar) of a guitar tab from a video of solo fingerstyle guitar, blind: nobody tells you the piece, and nothing you are given is an answer. Your folder is {PACK}. Work only there, with the tools in {TOOLS}, and read only your folder and {INPUTS}. No web, no git, no installs, no searching the machine. Soft time limit: 6 minutes from {START} (check `date`).

1. Read PACK.md. Look at spectrogram.png{NECK_LOOK} and read similar.md and candidates.csv (every candidate's places, the solver's choice and its next-best places).
2. Decide the notes. {NOTES_RULE}
3. Place every note: string 1 (highest) to 6, fret counted from the capo; pitch = open string + capo + fret. The solver proposes; you override it with a reason. {HAND_RULE} {TUNING_RULE} If similar.md shows a finished unit that repeats this one, start from its tab and look only for what differs. A wrong string at the right pitch sounds the same: judge places by the hand, the shapes and what a player's fingers can do.
4. Write bar.json, run `{TOOLS}/render.sh`, Read render/residual.png and render/check.txt, and fix what they show. Then write lessons.json and revisit.json and run `{TOOLS}/check.sh` until it prints OK.

bar.json (exactly these fields):
{"unit": {UNIT}, "notes": [{"id": 12, "onset": 21.734, "offset": 22.1, "pitch": 58, "string": 3, "fret": 0, "confidence": 0.9, "why": "", "place_why": ""}], "drops": [{"id": 14, "why": "overtone of 12"}], "confidence": 0.8, "recognised": "no"}
- id: the candidate's id, or "new" for a note you add. Only notes whose onset lies in this unit ({T0}-{T1} s).
- Every base candidate and every candidate held by 2 or more models is either in notes or in drops; other candidates you leave out are dropped without a word.
- why: needed for a new note (where its onset is in the sound), a changed pitch, and a drop of a note 2 or more models hold.
- place_why: needed when a place is not the solver's choice, and for a fretted note outside the hand window (a stretch, the thumb, a tap, a hand the tool lost).
- repluck: true on a note struck on a string that an earlier note of this unit still rings on (that note stops there); without it such a note is rejected: put one of the two on another string, or say repluck. check.sh names every case. A note of an earlier unit still ringing on a string you strike is cut there by the driver: that needs no revisit.
- A kept candidate keeps its onset (it may move 30 ms at most); a note at another onset is a drop plus a "new" note. One pitch twice within 35 ms is one note: keep one.
- confidence: 0 to 1, per note and for the unit. recognised: "no", or what you think the piece is.

lessons.json (what this unit taught; empty lists when nothing):
{"tuning": [{"string": 6, "pitch": 43, "agrees": true, "seen": "open string 6 rings at 21.7 s"}], "shapes": [{"pitches": [46, 58, 62], "places": [[6, 3], [3, 0], [2, 0]], "t": 21.73, "seen": true}], "hand": {"lo": 1, "hi": 5, "window_ok": true, "fix": ""}, "model_habits": [{"model": "bp", "kind": "invents", "where": "octave above the bass", "count": 2, "earlier_units": []}], "player_habits": [{"kind": "let-ring", "t": 21.73, "note": ""}], "repeat_of": null}
- shapes: notes struck together (2 or more) and their places; seen = true only if you saw the fingers make it.
- model_habits kind: invents, misses, wrong-pitch, late, early, split, merged; model: bp, gaps, fl, tk, mt3 or base; earlier_units: earlier units whose finished tab this habit made wrong (they will be opened again), not units that already handled it.
- player_habits kind: let-ring, thumb-over, tap, slap, slide, hammer-on, pull-off, harmonic, bend, muted, other.
- repeat_of: {"unit": 3, "differs": "the last beat"} when this unit repeats an earlier one.

revisit.json: {"revisit": [{"unit": 2, "why": "..."}]}: earlier units you now think are wrong, with the reason (usually none).

End with one line: what you changed from the solver and the candidates, and why.
