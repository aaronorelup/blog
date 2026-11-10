"""Check that every double-quoted passage in survey.md (split at '...') appears in one of the saved raw page texts."""
import sys, re, glob
def norm(s):
    s = s.replace("’","'").replace("‘","'").replace("“",'"').replace("”",'"').replace(" "," ")
    s = s.replace("—","-").replace("–","-").replace("‑","-")
    return re.sub(r"\s+", " ", s).strip().lower()
corpus = ""
for f in glob.glob("/home/user/gtr/lanes/apps-survey/raw/**/*", recursive=True):
    if f.endswith((".txt", ".md", "LICENSE", ".html")) and not f.endswith("_fetchlog.txt"):
        try: corpus += "\n" + norm(open(f, encoding="utf-8", errors="replace").read())
        except Exception: pass
# also allow html-unescaped/joined versions: collapse newlines already done by norm
text = open(sys.argv[1], encoding="utf-8").read()
quotes = re.findall(r'"([^"\n]{12,}?)"', text.replace("\n  ", " ").replace("\n", " "))
missing = 0
for q in quotes:
    parts = [p.strip(" .,;:") for p in re.split(r"\s*\.\.\.\s*|\s*…\s*", q) if len(p.strip(" .,;:")) >= 8]
    for p in parts:
        if norm(p) not in corpus:
            missing += 1
            print("NOT FOUND:", p[:160])
print(f"checked {len(quotes)} quotes; {missing} parts not found")
