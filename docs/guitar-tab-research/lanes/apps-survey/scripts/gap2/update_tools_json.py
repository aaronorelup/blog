"""update_tools_json.py : gap round 2 (gapfill-apps-survey, 2026-11-11). Applies this round's changes to the lane's
tools.json (same formatting: indent 2, UTF-8, no trailing newline). Every quote it adds is taken by id from
quotes2.json, whose quotes checkquotes2.py matched against the saved pages. Run once; it refuses to run twice."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(HERE, "..", "..", "tools.json")
Q = {q["id"]: q for q in json.load(open(os.path.join(HERE, "quotes2.json"), encoding="utf-8"))}
D = "2026-11-11"
TAG = f"gap round 2 (gapfill-apps-survey, {D})"

d = json.load(open(TOOLS, encoding="utf-8"))
if d.get("updated", "").startswith(D):  # the run on 2026-11-11 wrote "2026-11-11 (gap round 2, gapfill-apps-survey)"
    sys.exit("already applied")
by = {t["name"]: t for t in d["tools"]}


def term(topic, qid, url=None):
    q = Q[qid]
    return {"topic": topic, "quote": q["quote"], "url": url or q["url"]}


def corr(t, text):
    t.setdefault("corrections", []).append(f"{TAG}: {text}")


# P2: AnthemScore Web was counted as tried without output.
t = by["AnthemScore Web"]
t["tried"] = False
t["tried_how"] = ("browser-headless (partial: S2s.wav uploaded and the job settings page reached; no transcription, "
                  "no output)")
corr(t, "tried was true; set to false because no transcription and no output file was produced (r0055 exit 1; r0062 "
        "and r0226 reached the job settings page only; GAPS.md P2). The three runs stay listed as attempt facts.")

# P1: Guitar Pro 8
t = by["Guitar Pro 8"]
gp = "https://www.guitar-pro.com/c/9-software-end-user-license-agreement"
t["license"]["service_terms"] += [
    term("EULA preamble (no date on the page)", "G1", gp),
    term("EULA preamble: no transfer of intellectual property", "G2", gp),
    term("EULA §1.1: right of use, personal and professional", "G3", gp),
    term("EULA §1.1: activations", "G4", gp),
    term("EULA §8 (iii): creations made with Guitar Pro", "G5", gp),
    term("EULA §9: user's liability, new works", "G6", gp),
    term("Terms of sale, Article 3: consumer", "G8"),
    term("Terms of sale, Article 6.2: mySongBook scores and their exports", "G9"),
    term("Web site terms of use: contents and services of the site", "G10"),
]
t["unverified"] = [
    "No clause on who owns files a user writes or exports, and none on bots, scripts or automated access, was found in "
    "the EULA, the web site terms of use or the terms of sale (read 2026-11-11).",
]
corr(t, "the EULA was not read in the first pass; it is published at "
        "https://www.guitar-pro.com/c/9-software-end-user-license-agreement and was read on 2026-11-11 (survey.md, "
        "Guitar Pro 8).")

# P1: Melodyne 5
t = by["Melodyne 5"]
t["what"] += (" Systems: macOS 10.12 (64-bit) or higher (natively on Apple Silicon from 5.2) and Windows 10 (64-bit) or "
              "11; plug-in operation via VST3, AU or AAX and ARA; no Linux build listed.")
t["not_run_reason"] = "Desktop install (macOS or Windows; no Linux build listed)."
t["outputs"] = [
    "MIDI file (\"Audio-to-MIDI – export notes to a MIDI file\": assistant, editor and studio editions, not essential)",
    "chords (\"Chord Track and chord recognition – bring notes into line harmonically, extract chords from audio\": "
    "all four editions)",
    "note editing of polyphonic guitar (\"DNA Direct Note Access – algorithms for polyphonic instruments such as "
    "piano and guitar\": editor and studio)",
]
t["pricing"] = ("Celemony shop (https://www.celemony.com/en/shop, read 2026-11-11): Melodyne 5 studio \"US$699\" (\"retail "
                "price of US$849\"); essential \"US$99\", assistant \"US$249\" (\"retail price of US$299\"), editor "
                "\"US$399\" (\"retail price of US$499\"), in the page's column order. Trial: \"For a period of 30 days, "
                "free of charge, with no obligations or limitations.\"; \"By default, the trial version starts off as "
                "Melodyne studio\".")
t["license"]["service_terms"] += [
    term("Help center: license and activations", "M13"),
    term("Webshop GTC: scope (files bought as downloads)", "M14"),
    term("Webshop GTC: use of a downloaded file", "M15"),
]
t["unverified"] = [
    "Tab output: not found.",
    "The EULA text was not read: no EULA page is linked from celemony.com (/en/service/legal/eula and "
    "/license-agreement answered 404); the only copy found, https://ec.crypton.co.jp/download/pdf/eula_celemonyme.pdf, "
    "was unreachable on 2026-11-11 (connection reset, then HTTP 503 maintenance page). Its clauses on exported files, "
    "commercial use and automated access are unknown.",
    "The webshop GTC do not mention MIDI or files exported from Melodyne.",
    "Whether the trial needs a Celemony account was not checked.",
]
corr(t, "\"MIDI export, price: not read (UNVERIFIED)\" and the unread operating systems were read on 2026-11-11 "
        "(editions, technical matters and shop pages; survey.md, Melodyne 5).")

# P1: RipX DAW
t = by["RipX DAW"]
t["what"] += (" Systems: \"macOS 10.15+ (2012 & later models, including M1 onwards) / Windows 8/10/11 (64-bit)\"; "
              "\"Ability to see specific chords & notes being played in a particular part\".")
t["not_run_reason"] = "Desktop install (macOS 10.15+ or Windows 8/10/11 64-bit; no Linux build listed)."
t["pricing"] = ("RipX DAW \"$99.00 USD\"; RipX DAW PRO \"$198.00 USD\"; \"21-day trial\"; \"We offer license deactivation "
                "with a full refund within 14 days of purchase\" (https://buy.hitnmix.com/, read 2026-11-11). Earlier: "
                "\"Buy Now – Starting at $99\"; \"Try RipX DAW PRO Free for 21 Days\".")
t["license"]["service_terms"] += [
    term("Terms of use: definition of HIT'N'MIX", "R1"),
    term("Terms of use: copyright of music processed", "R2"),
    term("Terms of use: intellectual property and HIT'N'MIX content", "R3"),
    term("Store terms of service: same paragraph, personal non-commercial use", "R4"),
    term("Activation", "R7"),
    term("Installations", "R8"),
]
t["unverified"] = [
    "Tab output: the words tab, tabs and tablature are on neither the RipX DAW page nor the buy page (2026-11-11).",
    "Whether \"HIT'N'MIX content\" in the terms covers stems or MIDI a user exports is not stated; no clause on bots, "
    "scripts or automated access was found.",
    "No EULA page is linked from hitnmix.com or buy.hitnmix.com; whether the installer shows one, and its text, was not "
    "checked.",
]
corr(t, "\"Which operating systems: not read\" and the MIDI details were read on 2026-11-11 (buy.hitnmix.com, "
        "hitnmix.com/ripx-daw/; survey.md, RipX DAW).")

# P1: MIDI Guitar
t = by["MIDI Guitar 2 and 3 (Jam Origin)"]
t["version"] = "MIDI Guitar 2; MIDI Guitar 3 (\"MIDI Guitar 3 is in beta testing phase.\", jam.live, 2026-11-11)"
t["outputs"] = t["outputs"] + [
    "JAM API (beta): notes as text on \"a WebSocket at localhost, port 8080\", one line per played note: \"note-id, age, "
    "string, pitch, bend, pressure, brightness\" (https://jam.live/developers/websocket/)",
]
t["pricing"] = ("\"The price is always USD 149.95 and there are never any discounts.\"; \"Pay once = Lifetime license + "
                "Lifetime free updates\" (https://jam.live/shop/, read 2026-11-11). FastSpring page: \"MIDI GUITAR, "
                "personal lifetime license\", \"$149.95\". iOS: \"features that are only available as in-app purchases "
                "via Apple's App Store\". Earlier: \"Personal license for Windows/Mac standalone and plugins\"; "
                "\"Download Free trial\" (MIDI Guitar 2).")
t["license"]["service_terms"] += [
    term("License (FastSpring store page)", "J5"),
    term("License FAQ", "J6"),
]
t["unverified"] = [
    "No license agreement, EULA or terms page is linked from jamorigin.com or jam.live (2026-11-11), so nothing is "
    "stated on who owns the MIDI it outputs, commercial use or automated access; whether the installer shows a license "
    "text was not checked.",
    "No tab output described; the WebSocket note stream has a field named \"string\", whose values are not described.",
    "Whether version 3 has a free trial was not read.",
]
corr(t, "\"Prices: not shown in the page text\" was answered on 2026-11-11: USD 149.95 (jam.live shop; survey.md, MIDI "
        "Guitar 2 and 3).")

# P1: Yousician
t = by["Yousician"]
yt = "https://yousician.com/terms-of-service"
t["license"]["service_terms"] += [
    term("Terms (\"Effective as of December 17, 2024\") §4: license", "Y2", yt),
    term("§4: public performances", "Y3", yt),
    term("§4: ownership", "Y4", yt),
    term("§8: what counts as User Content", "Y5", yt),
    term("§8: rights you grant", "Y6", yt),
    term("§10: commercial activities", "Y7", yt),
    term("§10: automated systems", "Y8", yt),
    term("§10: automated means", "Y9", yt),
]
corr(t, "terms of service read on 2026-11-11 (none had been quoted).")

# P1: Yamaha Chord Tracker
t = by["Yamaha Chord Tracker"]
t["what"] += (" Yamaha's page: \"Chord Tracker Android is now available at Google Play.\"; compatible devices \"iPhone / "
              "iPad / Android\". Two App Store listings: \"Chord Tracker - US\" (Yamaha Corporation of America, "
              "id992502589, US store) and \"Chord Tracker\" (Yamaha Corporation, id975438908, UK store).")
t["outputs"] = t["outputs"] + [
    "chord information sent to a connected Yamaha instrument",
    "a recorded performance as an audio file shared by email (\"AAC or WAV format\")",
]
t["constraints_accepted"] = [
    "user chord edits (\"choosing from two recommended chords or selecting the chord root and chord type\")",
    "tempo and key changes",
]
t["license"]["service_terms"] += [
    term("App privacy policy", "YA5"),
    term("Apple Standard EULA (applies unless a custom EULA is provided)", "A1"),
]
t["unverified"] = [
    "No license agreement for the app was found on Yamaha's pages or the App Store listing; whether a custom EULA exists "
    "is not shown there. Yamaha's web site terms of use were not read.",
    "No clause on the chord charts it shows, commercial use or automated access was found.",
]
corr(t, "platforms, features and terms checked on 2026-11-11 (survey.md, Yamaha Chord Tracker).")

# P1: Capo
t = by["Capo (SuperMegaUltraGroovy)"]
t["what"] = t["what"].replace(
    "a spectrogram-based Tabbing view for note-by-note transcription,",
    "a spectrogram-based Tabbing view for note-by-note transcription, in which the user draws the notes and "
    "\"tablature is generated automatically below\",")
t["version"] = "iOS App Store 4.7.3 (2026-11-02); Mac App Store 4.7.3 (2026-11-04), \"Requires macOS 14.6 or later.\""
t["outputs"] = [o if o != "MIDI export of notes and chords (Mac only)" else
                "MIDI export of the user's chord and note entries (\"Export audio-synchronized MIDI containing your chord "
                "and note entries.\", Mac only)" for o in t["outputs"]] + [
    "tablature generated from the notes the user draws on the spectrogram (Mac Tabbing view)"]
t["pricing"] += (" Mac App Store (read 2026-11-11): \"Capo Platinum $49.99\", \"Capo Pro - Yearly $39.99\", \"Capo "
                 "Platinum - Upgrade $29.99\", \"Capo Pro - Monthly $5.99\", \"Capo Pro - Upgrade $24.99\".")
t["license"]["service_terms"] += [
    term("Apple Standard EULA (applies unless a custom EULA is provided)", "A1"),
    term("Apple Standard EULA a.: scope of license", "A2"),
]
t["unverified"] = [u for u in t["unverified"] if not u.startswith("Whether the Mac \"Tabbing view\"")] + [
    "No terms of use or EULA on supermegaultragroovy.com (/legal/ 403, /legal/terms/ and /legal/eula/ 404, 2026-11-11); "
    "whether a custom App Store EULA exists is not shown on the listings.",
    "No clause on who owns Capo's exports, their commercial use or automated access was found.",
]
corr(t, "\"Whether the Mac Tabbing view transcribes automatically\" was settled on 2026-11-11 from "
        "https://supermegaultragroovy.com/products/capo/mac/: the user draws the notes and the tab is generated from them.")

# P1: ChordU
t = by["ChordU"]
ct = "https://chordu.com/terms-of-use"
t["not_run_reason"] = ("Web service; its terms bar automated access: \"You shall not collect content or information or "
                       "access ChordU service using automated means (such as bots, robots, spiders or scrapers) without "
                       "our permission.\"")
t["license"]["service_terms"] += [
    term("Terms of use (no date; footer © 2023): User guidelines, automated access", "U1", ct),
    term("Terms of use: Liability, personal non-commercial use", "U2", ct),
    term("Terms of use: User Intellectual property rights", "U3", ct),
    term("Terms of use: footer", "U5", ct),
]
t["pricing"] = ("Not read: no chordu.com page was fetched after its terms, which bar automated access, were read "
                "(2026-11-11). The terms: \"Certain service options are free of cost whereas others are only accessible "
                "through premium subscriptions.\"")
t["unverified"] = [
    "Prices: not read (for-aaron.md test 8b).",
    "No clause on who owns a user's uploads or the chords computed from them was found.",
]
corr(t, "\"Terms not read\" (2026-11-10): the terms of use were read on 2026-11-11 (survey.md, ChordU).")

# P1: Chordify
t = by["Chordify"]
t["not_run_reason"] += (" Again HTTP 403 on 2026-11-11 to curl and WebFetch; opening the terms page in headless "
                        "Chromium was refused by the session's permission system (\"[Bot Check Circumvention]\").")
t["unverified"] = [("Chordify's terms and upload rules were not read (HTTP 403 on 2026-11-10 and 2026-11-11; the "
                    "archive.org snapshot reset the connection on 2026-11-10; headless render refused on 2026-11-11). "
                    "for-aaron.md test 8a.") if u.startswith("Chordify's terms") else u for u in t["unverified"]]
corr(t, "access retried on 2026-11-11 (survey.md, Chordify).")

# P3: Practice Pro
d["tools"].append({
    "name": "Practice Pro - AI Music Tools",
    "kind": "commercial-app",
    "what": ("iOS app (App Store id 6754810269) known only from a web search result quoted in GAPS.md row P3 (an \"AI "
             "Guitar Tab Generator ... synced with playback\"); not found in the App Store on 2026-11-10 or 2026-11-11."),
    "url": "https://apps.apple.com/us/app/id6754810269",
    "version": None,
    "tried": False,
    "tried_how": None,
    "runs": [],
    "not_run_reason": ("Existence UNVERIFIED: the App Store URL answered HTTP 404 (2026-11-10 and 2026-11-11) and Apple's "
                       "lookup API returned resultCount 0 for id 6754810269 in the us, gb, se, de, fr, ca, au, in and jp "
                       "stores (2026-11-11)."),
    "for_aaron": True,
    "callable_via": ["mobile-app"],
    "inputs": [],
    "outputs": [],
    "constraints_accepted": [],
    "license": {"code": None, "weights": None, "training_data": [], "service_terms": []},
    "pricing": None,
    "handoffs_out": [],
    "unverified": ["Whether the app exists, under id 6754810269 or another id; its input, output, price and terms."],
    "corrections": [f"added in {TAG} (GAPS.md P3)"],
})

d["updated"] = f"{D} (gap round 2, gapfill-apps-survey)"
s = json.dumps(d, indent=2, ensure_ascii=False)
open(TOOLS, "w", encoding="utf-8").write(s)
print("tools:", len(d["tools"]))
