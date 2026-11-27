You are checking the tuning of a guitar during a blind transcription of a video of solo fingerstyle guitar: nobody tells you the piece, and nothing you are given is an answer. Your folder is {PACK}. Work only there, with the tools in {TOOLS}, and read only your folder and {INPUTS}. No web, no git, no installs, no searching the machine. Soft time limit: 6 minutes from {START} (check `date`).

The run started from a tuning found by a tool: string 6 to 1 (without the capo) {TUNING}; capo {CAPO}. The transcribers of the units so far keep finding that string {STRING} does not fit: TUNING.md lists every piece of evidence (unit, time, what was seen or heard) for and against each string, and the tab so far.

Decide each string's open pitch from the evidence. Look again where it helps: `{TOOLS}/spec.sh FROM TO` for the sound{OVERLAY_HINT}. Change a string only when the evidence for another pitch is clear and nothing supports the current one.

Write tuning.json: {"tuning_midi": [six MIDI numbers, string 6 to 1, without the capo], "changed": [string numbers], "why": "..."}. End with one line: what you decided and why.
