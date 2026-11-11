"""update_tools_json_handoffs.py : gap round 2 (gapfill-apps-survey, 2026-11-11). Adds the MIDI handoffs of
survey.md handoff line 27 (Melodyne, RipX DAW, Capo for Mac) to tools.json. Run once; it refuses to run twice."""
import json, os, sys
TOOLS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools.json")
d = json.load(open(TOOLS, encoding="utf-8"))
by = {t["name"]: t for t in d["tools"]}
if any("handoff line 27" in h.get("evidence", "") for t in d["tools"] for h in t.get("handoffs_out") or []):
    sys.exit("already applied")
TAIL = ("; Guitar Pro 8 and Tabtify import MIDI (survey.md handoff line 3) and RiffToTab takes in \".mid or .midi\" "
        "(https://rifftotab.com/). Added in gap round 2 (2026-11-11).")
add = {
    "Melodyne 5": ("Documented, not tested (survey.md handoff line 27): \"Audio-to-MIDI – export notes to a MIDI "
                   "file\" in the assistant, editor and studio editions (https://www.celemony.com/en/melodyne/melodyne-5-editions)"),
    "RipX DAW": ("Documented, not tested (survey.md handoff line 27): \"Print Audio to Midi to load a specific part onto a "
                 "separate VST/Synth\" (https://hitnmix.com/ripx-daw/)"),
    "Capo (SuperMegaUltraGroovy)": ("Documented, not tested (survey.md handoff line 27): \"Export audio-synchronized MIDI "
                                    "containing your chord and note entries.\" (Mac only; the notes are the ones the user "
                                    "entered; https://supermegaultragroovy.com/products/capo/mac/)"),
}
for name, ev in add.items():
    by[name].setdefault("handoffs_out", []).append(
        {"to": "Guitar Pro 8, Tabtify, RiffToTab", "via_format": "MIDI", "evidence": ev + TAIL})
open(TOOLS, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False))
print("added", len(add))
