"""verify-gapfill-chords-beats-key: one-time corrections to the gap round's tools.json edits (it asserts the old text is
present, so a second run stops; same formatting as before: indent=2,
ensure_ascii=False, no trailing newline). Each change is printed. Run: python3 -I fix_tools_json.py
"""
import json

TJ = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/tools.json"
d = json.load(open(TJ))
T = {t["name"]: t for t in d["tools"]}

sk = T["S-KEY (Deezer self-supervised key estimation)"]
old_onnx = "a community ONNX conversion exists at https://huggingface.co/aaatmy/skey-onnx (named in a search result; not read)"
readme = [u for u in sk["unverified"] if u.startswith("README at the converter's commit 918b83d")]
assert old_onnx in sk["unverified"] and len(readme) == 1
sk["unverified"] = [u for u in sk["unverified"] if u not in (old_onnx, readme[0])]
w = sk["license"]["weights"]
w["note"] = ("The community ONNX export that ran here (huggingface.co/aaatmy/skey-onnx, revision c04b6a2b) was converted "
             "from skey.pt at commit 918b83d, the same file (765,465 bytes, SHA-256 78dfd0ad...ead4) as skey.pt at main. "
             "The README at 918b83d says under License only \"The code of **SKEY** is [MIT-licensed](LICENSE).\"; the "
             "README at main adds the sentence quoted above. The ONNX card: \"That paragraph does not separately state a "
             "license for pretrained weights; this model card does not assign them a new license.\" (all read 2026-11-10 "
             "and again 2026-11-11)")
sk["inputs"].append("ONNX route (huggingface.co/aaatmy/skey-onnx): float32 mono PCM at 22,050 Hz, shape [1, samples]; "
                    "decoding, resampling and the channel mean are left to the caller (model card)")
sk["outputs"].append("ONNX route: scores of shape [1, 24], softmax included, in the manifest's label order (model card, "
                     "manifest.json)")
print("S-KEY: removed 2 unverified items, added license.weights.note, one input, one output")

ai = T["All-In-One (allin1)"]
for r in ai["runs"]:
    if r["run_id"] == "r0576":
        old = r["metrics"]["note"]
        r["metrics"]["note"] = ("same bpm, beats, downbeats and positions as r0563's S4; one segment boundary 20.70 s vs "
                                "20.69 s. Demucs 4.0.1 separates with --shifts 1 by default, which offsets the input by a "
                                "random amount, so two runs need not give identical stems; the verifier's re-run of S3 "
                                "(r0693) gave a JSON byte-identical to r0521's")
        print("All-In-One r0576 note:", old, "->", r["metrics"]["note"])
for i, u in enumerate(ai["unverified"]):
    if u.startswith("the allin1 README's NATTEN website"):
        ai["unverified"][i] = ("what the allin1 README's NATTEN website (shi-labs.com/natten) lists: not read, because its "
                               "TLS certificate had expired (notAfter Dec 3 2025; seen on 2026-11-10 and 2026-11-11)")
        print("All-In-One unverified item reworded")
for r in ai["runs"]:
    if r["run_id"] == "r0518":
        r["metrics"]["note"] = ("the 0.17.3 and 0.17.4 CPU wheels for cp39 attached to NATTEN's GitHub releases (HTTP 200) "
                                "were not used; the verifier rebuilt 0.17.3 the same way in r0675 (149.28 s wall, exit 0)")
        print("All-In-One r0518 note added")

s = json.dumps(d, indent=2, ensure_ascii=False)
open(TJ, "w").write(s)
print("tools.json bytes:", len(s.encode("utf-8")))
