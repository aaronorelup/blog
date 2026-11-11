import os, sys, json, base64, subprocess, urllib.request, concurrent.futures as cf, time
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
KEY = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "GEMINI_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
MODEL = os.environ.get("IMG_MODEL", "gemini-3-pro-image")
OUT = "/workspace/teahouse_alt/hero_work/stills"
ISO = (" Isolated single subject, full body entirely in frame with generous margin on all sides, centered, on a perfectly flat plain light grey (#d8d8d8) studio background,"
       " no floor, no ground shadow, no scenery, no text, even soft frontal lighting, no strong rim light. Painterly dark-fantasy illustration style matching the reference, sharp clean silhouette edges.")
JOBS = {
 "jefrie_apose": (["/workspace/ip_refs/world1_jefrie.jpg", "/workspace/jefrie_canon_tail_ride.jpg"],
   "Character turnaround still of exactly this character, Jefrie: a small naga girl with a gunmetal armored half-face mask with a wide grin, void dark eyes, red leather pointed ear flaps, black-and-gunmetal armor, torn red cape, two human legs in boots, and one huge thick black scaled tail with a red underbelly emerging from her lower back, as thick as her torso at the root. Pose: neutral standing A-pose facing the camera, arms held straight out and down at 45 degrees away from the body, hands empty, legs slightly apart, the tail laid out flat on the ground extending sideways to her left and curving back, not coiled around her legs, cape short and hanging behind. No scythe."),
 "jefrie_leap": (["/workspace/ip_refs/world1_jefrie.jpg", "/workspace/jefrie_canon_tail_ride.jpg"],
   "This exact character, Jefrie, in mid-leap riding her own huge coiled black scaled red-bellied tail like a spring, body airborne leaning forward, knees bent, the large red-eyed steel scythe held up in both hands, torn red cape streaming behind. Same mask, armor and tail design as the references. Three-quarter view."),
 "yusef_apose": (["/workspace/ip_refs/world1_yusef.jpg"],
   "Character turnaround still of exactly this character, Yusef: a young angel with a thin gold halo, pale wavy hair, gentle sad face, long layered white and cream robes with gold embroidered trim, and large feathered white wings. Pose: neutral standing A-pose facing the camera, arms held straight out and down at 45 degrees away from the body, hands empty (no book, no lantern), wings spread open wide to both sides and away from the body, robe hem just above the feet."),
 "yusef_leap": (["/workspace/ip_refs/world1_yusef.jpg"],
   "This exact character, Yusef the angel, mid-flight in a leap, both large white feathered wings fully open and raised, body leaning forward, one arm raising a glowing brass-and-glass lantern high, the other hand clasping a red leather book with a gold cross to his chest, white robes flowing back, gold halo. Three-quarter view."),
 "echo_apose": (["/workspace/ip_refs/world1_echo.jpg"],
   "Character turnaround still of exactly this character, Echo: a figure whose entire head is a large dented white-grey church bell helmet with small round holes, wearing a long weathered grey-brown trench coat with belt and buttons, a satchel strap across the chest, dark trousers and heavy muddy boots. Pose: neutral standing A-pose facing the camera, arms held straight out and down at 45 degrees away from the body, gloved hands empty (no bell in hand), legs slightly apart, coat closed."),
 "echo_leap": (["/workspace/ip_refs/world1_echo.jpg"],
   "This exact character, Echo with the bell helmet head and long trench coat, mid-stride lunging forward, swinging a small dark red hand bell on a wooden handle in an arc from one gloved hand, coat tails flaring out behind. Three-quarter view."),
 "prop_crt": (["/workspace/ip_eltv_still_01.jpg"],
   "A single small 1970s portable CRT television set on its own: wood-grain and beige plastic cabinet, rounded rectangular bulging glass screen, two rotary knobs and a small speaker grille on the right side, short rabbit-ear antenna on top. The screen is BLANK, uniformly very dark grey, nothing displayed. Three-quarter front view, slightly from above, product shot. Same warm vintage look as the TV in the reference."),
 "prop_lantern": (["/workspace/ip_refs/world1_yusef.jpg"],
   "Only the lantern that this angel carries, on its own: an ornate hexagonal brass and glass lantern with a domed top and ring handle, glass panes glowing softly warm from a candle inside. Front view, product shot."),
 "prop_bell": (["/workspace/ip_refs/world1_echo.jpg"],
   "Only the hand bell this figure carries, on its own: a small dark red cast-iron hand bell with a turned wooden handle, the bell mouth facing down, seen from a three-quarter side view, product shot."),
}
def gen(name):
    refs, prompt = JOBS[name]
    parts = [{"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(open(r, "rb").read()).decode()}} for r in refs]
    parts.append({"text": "Use the attached reference image(s) for the character's exact design. " + prompt + ISO})
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1"}}}
    for attempt in range(3):
        try:
            r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent", data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
            d = json.load(urllib.request.urlopen(r, timeout=180))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    ext = "png" if "png" in p["inlineData"]["mimeType"] else "jpg"
                    fn = f"{OUT}/{name}.{ext}"; open(fn, "wb").write(base64.b64decode(p["inlineData"]["data"])); return f"{name} ok {fn}"
            return f"{name} no image {str(d)[:200]}"
        except Exception as e:
            err = str(e); time.sleep(3)
    return f"{name} FAIL {err[:200]}"
names = sys.argv[1:] or list(JOBS)
with cf.ThreadPoolExecutor(5) as ex:
    for r in ex.map(gen, names): print(r, flush=True)
