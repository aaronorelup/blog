"""verify-gapfill-hosted-apis (round 2, 2026-11-11): corrections to tools.json after checking gap round 2.

usage: python3 -I update_tools_json.py <tools.json>
Idempotent. Keeps the file's format (json.dumps(indent=2, ensure_ascii=False) plus a trailing newline).
1. meta/muse-spark-open: the Muse Model License grant (a weights / model license clause) was filed under
   license.service_terms; it is moved into license.weights.note.
2. xiaomi/mimo-v2.6-flash: gateway_data_flags said every MiMo call was served by `xiaomi`; the two MP4 calls (r0077,
   r0098) were refused by all seven providers (providerAttempts in their response.json).
3. Google Gemini API: the gap-round-2 correction line says only countTokens (r0016) answered; the probes r0014 and
   r0300 also ran a countTokens step that answered. That line is kept; a correction line is added.
4. The verifier's re-runs are added to the runs of ffmpeg (r0661, r0662, 2 cores) and of the Cesure MCP server (r0655).
"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path, encoding="utf-8"))
by = {t["name"]: t for t in d["tools"]}
V = "corrected by verify-gapfill-hosted-apis (round 2, 2026-11-11): "


def note(t, text):
    t.setdefault("corrections", [])
    if text not in t["corrections"]:
        t["corrections"].append(text)


# 1. Muse grant clause: service_terms -> weights
m = by["meta/muse-spark-open (via Vercel AI Gateway)"]
st = m["license"]["service_terms"]
grant = [s for s in st if s.get("topic") == "Muse Model License grant"]
if grant:
    g = grant[0]
    m["license"]["service_terms"] = [s for s in st if s is not g]
    w = m["license"]["weights"]
    add = "; grant clause: \"" + g["quote"] + "\""
    if add not in w.get("note", ""):
        w["note"] = w.get("note", "") + add
    note(m, V + "the Muse Model License grant (\"Permission is hereby granted, ...\") is a clause of the model "
         "license, not of a service's terms; moved from license.service_terms into license.weights.note")

# 2. MiMo: which provider served which call
x = by["xiaomi/mimo-v2.6-flash (via Vercel AI Gateway)"]
old = "all MiMo calls here served by `xiaomi`"
new = ("every MiMo call that answered was served by `xiaomi` (finalProvider); the MP4 calls r0077 and r0098 were tried "
       "on `xiaomi` and the six other providers in turn and refused by all seven (providerAttempts)")
if old in (x.get("gateway_data_flags") or ""):
    x["gateway_data_flags"] = x["gateway_data_flags"].replace(old, new)
    note(x, V + "gateway_data_flags had said all MiMo calls were served by `xiaomi`; the two MP4 calls were refused "
         "by all seven providers")

# 3. Gemini: the gap-round-2 correction line is kept as written; this adds the missing fact
gm = by["Google Gemini API"]
note(gm, V + "the line above says only countTokens (r0016) answered; the countTokens step of the probes r0014 and "
     "r0300 answered too (HTTP 200, 773 tokens for S3); no generation request answered")

# 4. verifier re-runs
ff = by["ffmpeg"]
ids = {r["run_id"] for r in ff["runs"]}
if "r0661" not in ids:
    ff["runs"].append({"run_id": "r0661", "input_id": "S2n, S3, S4", "cores": [0, 1], "wall_s": 0.36, "peak_mb": 50.2,
                       "exit_code": 0, "output_files": [],
                       "metrics": {"command": "scripts/gap2/ffmpeg_excerpts.sh (re-run of r0599)",
                                   "result": "the three sha256 equal those in inputs/README.md; copies deleted",
                                   "note": "verifier re-run (verify-gapfill-hosted-apis), 2-core slot, waited 267.5 s"}})
if "r0662" not in ids:
    ff["runs"].append({"run_id": "r0662", "input_id": "R3a", "cores": [0, 1], "wall_s": 0.57, "peak_mb": 70.0,
                       "exit_code": 0, "output_files": [],
                       "metrics": {"command": "scripts/gap2/ffmpeg_frames_r3a.sh (re-run of r0600)",
                                   "result": "18 JPEGs, 531,261 bytes, 18 byte-identical to out/frames/R3a/; copies deleted",
                                   "note": "verifier re-run (verify-gapfill-hosted-apis), 2-core slot"}})
c = by["Cesure MCP server (api.cesure.app/mcp)"]
if "r0655" not in {r["run_id"] for r in c["runs"]}:
    c["runs"].append({"run_id": "r0655", "input_id": None, "cores": None, "wall_s": 2.26, "peak_mb": 23.4,
                      "exit_code": 0, "output_files": [],
                      "metrics": {"nolock": True, "initialize_http": 200, "initialized_http": 202,
                                  "tools_list_http": 200, "tools": 14, "oauth_protected_resource_http": 404,
                                  "tools_call_sent": False,
                                  "note": "verifier re-run (verify-gapfill-hosted-apis) of r0622 into "
                                          "/home/user/gtr/lanes/hosted-apis/verify-gap2/cesure-mcp/: tools_list.json "
                                          "byte-identical to samples/cesure-mcp/tools_list.json; the four response "
                                          "bodies equal r0622's"}})

open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
print("ok", len(d["tools"]), "entries")
