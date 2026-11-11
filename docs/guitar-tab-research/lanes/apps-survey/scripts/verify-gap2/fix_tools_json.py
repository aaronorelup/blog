"""fix_tools_json.py : verify-gapfill-apps-survey (round 2, 2026-11-11). Applies the verifier's corrections to the
lane's tools.json (same formatting as the gap round: indent 2, UTF-8, no trailing newline). Every quote added here was
matched exactly against the verifier's own fetch of its URL (verify-gap2/raw/). Run once; it refuses to run twice."""
import json, os, sys

TOOLS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools.json")
d = json.load(open(TOOLS, encoding="utf-8"))
by = {t["name"]: t for t in d["tools"]}
TAG = "verify-gapfill-apps-survey (2026-11-11)"
if any(TAG in c for t in d["tools"] for c in t.get("corrections") or []):
    sys.exit("already applied")
TOU = "https://supermegaultragroovy.com/legal/tou/"

capo = by["Capo (SuperMegaUltraGroovy)"]
capo["license"]["service_terms"][0:0] = [
    {"topic": "Terms of Use Agreement (\"Last Updated: May 20, 2015\"): scope, licensed not sold",
     "quote": "The Services (including but not limited to software downloaded by or otherwise made available to you by "
              "SMUG or any of its licensors or providers (the \"SMUG Software\")) are licensed, not sold, to you for use "
              "only under the terms of this license, unless a Service is accompanied by a separate agreement providing "
              "for same, in which case the terms of that separate agreement will govern, subject to your prior "
              "acceptance of that separate agreement.",
     "url": TOU},
    {"topic": "Terms of Use Agreement: automated use",
     "quote": "You shall not engage in any automated use of the Services, including but not limited to Maillist, "
              "Listserv or any other auto-response software or program;",
     "url": TOU},
    {"topic": "Terms of Use Agreement: No Resale of the Services (commercial purposes)",
     "quote": "Without limiting the foregoing, you agree not to reproduce, duplicate, copy, sell, trade, or exploit for "
              "any commercial purposes, any portion of the Services, the SMUG Software, use of the Services and/or the "
              "Content, or access to the Services.",
     "url": TOU},
    {"topic": "Terms of Use Agreement: Ownership of what the user provides",
     "quote": "You acknowledge and expressly agree that content and information (with the exception of your name, phone "
              "number and other similar personal information) posted or otherwise provided by you as part of your "
              "access to and/or use of the Services, is and shall be owned by SMUG immediately and automatically upon "
              "the posting/providing of such consent and/or information on the SMUG Website or otherwise to SMUG",
     "url": TOU},
    {"topic": "Terms of Use Agreement: Licenses (software)",
     "quote": "SMUG hereby grants you a personal, non-transferable and non-exclusive license to access, download and use "
              "the applicable SMUG Software on any compatible device that you own or control.",
     "url": TOU},
]
old_u = [u for u in capo["unverified"] if u.startswith("No terms of use or EULA on supermegaultragroovy.com")
         or u.startswith("No clause on who owns Capo's exports")]
assert len(old_u) == 2, old_u
capo["unverified"] = [u for u in capo["unverified"] if u not in old_u] + [
    "The Terms of Use Agreement (https://supermegaultragroovy.com/legal/tou/) does not name Capo, MIDI, chords, "
    "tablature or exported files; whether its ownership clause on content \"provided by you\" covers MIDI or lead sheets "
    "exported from Capo is not stated. Whether the App Store versions carry a custom EULA is not shown on the listings."]
capo["corrections"].append(
    TAG + ": the gap round said no terms of use or EULA exists on supermegaultragroovy.com and that the product pages "
    "link the privacy policy. Both App Store descriptions end \"Our Privacy Policy can be found at "
    "https://supermegaultragroovy.com/legal/privacy, and our Terms of Use at https://supermegaultragroovy.com/legal/tou.\"; "
    "that page (301 to /legal/tou/, then 200) was read on 2026-11-11 and its clauses are now in service_terms. The two "
    "product pages fetched link no privacy, terms or license page.")

ripx = by["RipX DAW"]
st = [s for s in ripx["license"]["service_terms"] if s["url"] == "https://buy.hitnmix.com/policies/terms-of-service"]
assert len(st) == 1
st[0]["quote"] += " Any other use of HIT’N’MIX content requires the prior written permission of Hit’n’Mix Ltd."
st[0]["topic"] = "Store terms of service: the paragraph that differs from the site terms (three sentences)"
ripx["unverified"] = [u.replace("\"HIT'N'MIX content\"", "\"HIT’N’MIX content\"") for u in ripx["unverified"]]
ripx["corrections"].append(
    TAG + ": the store terms quote lacked its third sentence, \"Any other use of HIT’N’MIX content requires the prior "
    "written permission of Hit’n’Mix Ltd.\" (added; the two terms pages differ only in that paragraph and the footer).")

open(TOOLS, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False))
print("applied")
