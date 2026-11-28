import sys, zipfile, pickletools, io, re
z = zipfile.ZipFile(sys.argv[1])
names = z.namelist()
pk = [n for n in names if n.endswith(".pkl")]
print("entries:", len(names), "pickles:", pk)
data = z.read(pk[0])
out = io.StringIO()
pickletools.dis(data, out=out)
txt = out.getvalue()
globs = sorted(set(re.findall(r"GLOBAL\s+'([^']+)'", txt)) | set(re.findall(r"STACK_GLOBAL", txt) and []))
# protocol 2+ may use STACK_GLOBAL with preceding SHORT_BINUNICODE pairs; collect those too
lines = txt.splitlines()
sg = []
for i, l in enumerate(lines):
    if "STACK_GLOBAL" in l:
        a = re.search(r"'([^']*)'", lines[i-2]); b = re.search(r"'([^']*)'", lines[i-1])
        if a and b: sg.append(a.group(1) + "." + b.group(1))
print("GLOBAL:", globs)
print("STACK_GLOBAL:", sorted(set(sg)))
print("cuda mentions:", sorted(set(re.findall(r"'(cuda[^']*)'", txt))))
for key in ["tuning", "low", "high", "E2", "A2", "D3", "G3", "B3", "E4", "num_frets", "num_strings"]:
    pass
strs = re.findall(r"BINUNICODE\s+'([^']*)'", txt)
print("strings mentioning tuning/pitch:", [s for s in strs if re.fullmatch(r"[A-G]#?\d", s)][:12])
idx = [i for i, l in enumerate(lines) if "'tuning'" in l or "'low'" in l or "'high'" in l]
for i in idx[:6]:
    print("\n".join(lines[i:i+14]))
    print("....")
