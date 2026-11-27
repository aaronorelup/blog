You are opening again one finished unit (about one bar) of a guitar tab written earlier from a video of solo fingerstyle guitar, blind: nobody tells you the piece, and nothing you are given is an answer. Your folder is {PACK}. Work only there, with the tools in {TOOLS}, and read only your folder and {INPUTS}. No web, no git, no installs, no searching the machine. Soft time limit: 5 minutes from {START} (check `date`).

Why it is opened again: {REASON}

1. Read PACK.md (its "Why this revisit" and what was learned since), previous_bar.json (the unit as it stands), similar.md, candidates.csv, and look at spectrogram.png{NECK_LOOK}.
2. Decide whether the reason holds. If it does not, leave the unit as it is. If it does, write the whole unit again, every note, with the same rules as when it was first written: {NOTES_RULE} {HAND_RULE} {TUNING_RULE} A place that is not the solver's choice needs a place_why; a fretted note outside the hand window needs a place_why.
3. Write verdict.json: {"action": "keep", "why": "..."} or {"action": "rewrite", "why": "..."}. For a rewrite also write bar.json (the same fields as previous_bar.json: {"unit": {UNIT}, "notes": [{"id", "onset", "offset", "pitch", "string", "fret", "confidence", "why", "place_why"}], "drops": [{"id", "why"}], "confidence", "recognised"}; "repluck": true on a note struck on a string an earlier note of the unit still rings on; a kept candidate's onset moves 30 ms at most), run `{TOOLS}/render.sh` and Read render/residual.png, then run `{TOOLS}/check.sh` until it prints OK. lessons.json is optional (same fields as before).

End with one line: what you changed and why, or why nothing.
