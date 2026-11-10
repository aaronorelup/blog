"""Print one summary block per LLM trial directory: model, provider, tokens, cost, wall, the answer in short, and the
gtr-eval numbers with their eval ids. Usage: python -I summarize_llm_trials.py <dir> [<dir> ...]
"""
import json, os, re, sys

for d in sys.argv[1:]:
    if not os.path.isdir(d):
        continue
    def load(n):
        p = os.path.join(d, n)
        return json.load(open(p)) if os.path.exists(p) else None
    meta = load("meta.json") or {}
    ans = load("answer.json")
    print("##", os.path.basename(d))
    u = meta.get("usage") or {}
    print("  model", meta.get("model"), "| provider", meta.get("final_provider"), "| http", meta.get("http_status"),
          "| finish", meta.get("finish_reason"), "| wall_s", meta.get("wall_s"))
    print("  tokens: prompt", u.get("prompt_tokens"), "completion", u.get("completion_tokens"), "reasoning",
          (u.get("completion_tokens_details") or {}).get("reasoning_tokens"), "| cost reported", meta.get("cost_usd_reported"),
          "computed", meta.get("cost_usd_computed"))
    if isinstance(ans, dict):
        if "chords" in ans and isinstance(ans["chords"], list):
            print("  chords:", " ".join(f"{c['start']:.2f}-{c['end']:.2f}:{c['label']}" for c in ans["chords"]))
            print("  tempo", ans.get("tempo_bpm"), "key", ans.get("key"), "ts", ans.get("time_signature"))
        elif "notes" in ans:
            ns = ans["notes"]
            print("  notes:", len(ns), "first 10:", [(n.get("onset"), n.get("offset"), n.get("pitch")) for n in ns[:10]])
        else:
            print("  answer:", json.dumps(ans)[:600])
    ids = open(os.path.join(d, "eval_ids.txt")).read() if os.path.exists(os.path.join(d, "eval_ids.txt")) else ""
    eids = re.findall(r"\[gtr-eval (e\d+)\] (\w[\w-]*)", ids)
    for sub in ("chords", "tempo", "key", "notes", "tuning"):
        e = load(f"eval_{sub}.json")
        if not e:
            continue
        m = e.get("metrics", {})
        eid = [i for i, s in eids if s == sub]
        eid = eid[-1] if eid else "?"
        if sub == "chords":
            print(f"  chords ({eid}): root {m.get('root')} majmin {m.get('majmin')} sevenths {m.get('sevenths')}")
        elif sub == "notes":
            oo = m.get("onset_only", {})
            ch = m.get("chroma_onset_only", {})
            print(f"  notes ({eid}): onset-only P {oo.get('precision')} R {oo.get('recall')} F1 {oo.get('f1')}; "
                  f"onset+offset F1 {(m.get('onset_offset') or {}).get('f1')}; chroma onset-only F1 {ch.get('f1')}; "
                  f"counts {e.get('counts')}")
        else:
            print(f"  {sub} ({eid}):", json.dumps(m)[:400])
