#!/usr/bin/env python3
"""Draw the handoff graph from ../handoffs.json with Graphviz (`dot`), as SVG and as a 1600 px wide PNG.

    python3 make_diagram.py

Writes, in this folder:
  overview.dot / .svg / .png              the stages as columns, with tool counts, and the edges between stages
  full-song.dot / .svg / .png             tools and edges of the full-song path
  fingerstyle-video.dot / .svg / .png     tools and edges of the fingerstyle-video path
and fills the "diagrams" block of ../HANDOFFS.md.

Drawing rules: stages are columns from left to right in pipeline order; tested edges solid, documentation-only
edges dashed; joins (two outputs lined up by time) drawn with arrowheads at both ends; tools that did not run here
drawn with a dashed outline (ran on a public Space or an API: grey fill; not run: white). Besides the tools and
edges of handoffs.json, the files hold a legend and invisible edges that keep the columns in order; `concentrate=true`
merges parallel edges where they run side by side. Needs Graphviz and Pillow.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.dirname(HERE)
G = json.load(open(os.path.join(DOCS, "handoffs.json")))
STAGES = [(s["id"], s["title"]) for s in G["stages"]]
IDX = {k: i for i, (k, _) in enumerate(STAGES)}
SHORT = {"input": "Input", "separation": "Source separation", "notes": "Notes and melody",
         "chords": "Chords, beat, tempo, key, tuning", "tab": "String and fret", "fingerstyle": "Voices and taps",
         "video": "Video hands and fretboard", "formats": "Tab file formats", "render": "Browser render, edit, play",
         "sync": "Metronome and sync", "corrections": "User corrections", "other": "Hosts, runtimes, other"}
NODES = {n["id"]: n for n in G["nodes"]}
EDGES = G["edges"]
MAX_PNG_BYTES = 300_000


def short_name(n):
    s = n["name"]
    s = re.sub(r"\s*\(.*$", "", s) or s
    s = s.replace("Spotify ", "")
    return s if len(s) <= 30 else s[:29] + "…"


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def node_attrs(n):
    st = n["status"]
    if st == "ran-here":
        return 'style="rounded,filled", fillcolor="#ffffff", color="#1f2933", fontcolor="#1f2933"'
    if st == "ran-elsewhere":
        return 'style="rounded,dashed,filled", fillcolor="#e3e8ee", color="#52606d", fontcolor="#1f2933"'
    return 'style="rounded,dashed,filled", fillcolor="#ffffff", color="#7b8794", fontcolor="#52606d"'


def edge_attrs(e):
    a = 'color="#1f2933", penwidth=1.3' if e["evidence_type"] == "tested" else 'color="#b8c2cc", style=dashed, penwidth=0.7'
    if e.get("kind") == "join":
        a += ", dir=both"
    return a


def legend(lines):
    lines.append('  subgraph cluster_legend { label="Legend"; fontsize=11; color="#cbd2d9"; fontname="Helvetica";')
    lines.append('    lg1 [label="ran here", shape=box, ' + node_attrs({"status": "ran-here"}) + '];')
    lines.append('    lg2 [label="ran on a Space or API", shape=box, ' + node_attrs({"status": "ran-elsewhere"}) + '];')
    lines.append('    lg3 [label="not run here", shape=box, ' + node_attrs({"status": "for-aaron"}) + '];')
    lines.append('    lg1 -> lg2 [label=" tested", color="#1f2933", fontsize=9];')
    lines.append('    lg2 -> lg3 [label=" docs only", color="#9aa5b1", style=dashed, fontsize=9];')
    lines.append("  }")


def path_graph(title, stages, keep_edge):
    es = [e for e in EDGES if keep_edge(e) and e["from"] != e["to"]]
    used = set()
    for e in es:
        used.add(e["from"])
        used.add(e["to"])
    lines = ["digraph G {", '  graph [rankdir=LR, newrank=true, nodesep=0.12, ranksep=1.1, fontname="Helvetica", fontsize=16, '
             f'labelloc=t, label="{esc(title)}", splines=true, concentrate=true, outputorder=edgesfirst];',
             '  node [shape=box, fontname="Helvetica", fontsize=10, height=0.25, margin="0.06,0.02"];',
             '  edge [arrowsize=0.6];']
    for s in stages:
        members = sorted([i for i in used if NODES[i]["stage"] == s], key=lambda i: NODES[i]["name"].lower())
        if not members:
            continue
        lines.append(f'  subgraph cluster_{s} {{ label="{esc(SHORT[s])}"; fontsize=13; fontname="Helvetica-Bold"; '
                     'color="#cbd2d9"; style=rounded;')
        lines.append("    {rank=same; " + " ".join(f'"{i}";' for i in members) + "}")
        for i in members:
            lines.append(f'    "{i}" [label="{esc(short_name(NODES[i]))}", {node_attrs(NODES[i])}];')
        lines.append("  }")
    # keep the columns in pipeline order with invisible edges between the first member of each column
    firsts = []
    for s in stages:
        members = sorted([i for i in used if NODES[i]["stage"] == s], key=lambda i: NODES[i]["name"].lower())
        if members:
            firsts.append(members[0])
    for a, b in zip(firsts, firsts[1:]):
        lines.append(f'  "{a}" -> "{b}" [style=invis, weight=10];')
    for e in es:
        forward = IDX[NODES[e["from"]]["stage"]] < IDX[NODES[e["to"]]["stage"]]
        c = "" if forward else ", constraint=false"
        lines.append(f'  "{e["from"]}" -> "{e["to"]}" [{edge_attrs(e)}{c}];')
    legend(lines)
    lines.append("}")
    return "\n".join(lines), len(used), es


def overview_graph():
    counts = {}
    for n in G["nodes"]:
        c = counts.setdefault(n["stage"], {"n": 0, "ran-here": 0, "ran-elsewhere": 0, "for-aaron": 0, "not-runnable": 0})
        c["n"] += 1
        c[n["status"]] += 1
    agg = {}
    for e in EDGES:
        a, b = e["joint"]
        if a == b:
            key = (a, a)
        else:
            key = (a, b)
        t = agg.setdefault(key, {"tested": 0, "docs": 0})
        t[e["evidence_type"]] += 1
    lines = ["digraph G {", '  graph [rankdir=LR, newrank=true, nodesep=0.35, ranksep=0.9, fontname="Helvetica", fontsize=18, labelloc=t, '
             'label="Guitar tab tools: stages, tool counts and edges between stages (from handoffs.json)"];',
             '  node [shape=box, style="rounded,filled", fillcolor="#ffffff", color="#1f2933", fontname="Helvetica", fontsize=12];',
             '  edge [fontname="Helvetica", fontsize=10, arrowsize=0.7];']
    order = [k for k, _ in STAGES]
    for k in order:
        c = counts.get(k, {"n": 0, "ran-here": 0, "ran-elsewhere": 0, "for-aaron": 0, "not-runnable": 0})
        lab = (f"{SHORT[k]}\\n{c['n']} tools\\nran here {c['ran-here']}, elsewhere {c['ran-elsewhere']}\\n"
               f"steps for Aaron {c['for-aaron']}, not run {c['not-runnable']}")
        extra = ', style="rounded,dashed,filled"' if c["ran-here"] == 0 else ""
        lines.append(f'  "{k}" [label="{lab}"{extra}];')
    main = [k for k in order if k not in ("other",)]
    lines.append("  {rank=same; \"other\";}")
    for a, b in zip(main, main[1:]):
        lines.append(f'  "{a}" -> "{b}" [style=invis, weight=20];')
    for (a, b), t in sorted(agg.items(), key=lambda x: (IDX[x[0][0]], IDX[x[0][1]])):
        lab = f"{t['tested']} tested / {t['docs']} docs"
        style = 'color="#1f2933", penwidth=1.4' if t["tested"] else 'color="#9aa5b1", style=dashed'
        c = "" if IDX[a] < IDX[b] else ", constraint=false"
        lines.append(f'  "{a}" -> "{b}" [label="{lab}", {style}{c}];')
    lines.append("}")
    return "\n".join(lines)


def render(name, dot_src):
    dot_path = os.path.join(HERE, f"{name}.dot")
    with open(dot_path, "w") as f:
        f.write(dot_src + "\n")
    svg = os.path.join(HERE, f"{name}.svg")
    png = os.path.join(HERE, f"{name}.png")
    subprocess.run(["dot", "-Tsvg", dot_path, "-o", svg], check=True)
    big = os.path.join(tempfile.mkdtemp(), f"{name}_big.png")
    subprocess.run(["dot", "-Tpng", "-Gdpi=110", dot_path, "-o", big], check=True)
    im = Image.open(big).convert("RGB")
    w, h = im.size
    im = im.resize((1600, max(1, round(h * 1600 / w))), Image.LANCZOS)
    for colors in (64, 32, 16, 8):
        q = im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
        q.save(png, optimize=True)
        if os.path.getsize(png) <= MAX_PNG_BYTES:
            break
    os.remove(big)
    return os.path.getsize(svg), os.path.getsize(png), Image.open(png).size, colors


def main():
    out = []
    # overview
    sv, pn, size, colors = render("overview", overview_graph())
    out.append(("overview", "the twelve stage tables as boxes with their tool counts, and one arrow per joint with its number of "
                "tested and documentation-only edges (an arrow from a stage to itself when both ends sit in one stage)", sv, pn, size, colors, None))
    # full song path
    fs_stages = ["input", "separation", "notes", "chords", "tab", "formats", "render", "sync"]
    src, n_nodes, es = path_graph("Full-song path: every edge whose two tools sit in these stages (tested solid, docs dashed)",
                                  fs_stages, lambda e: NODES[e["from"]]["stage"] in fs_stages and NODES[e["to"]]["stage"] in fs_stages)
    sv, pn, size, colors = render("full-song", src)
    out.append(("full-song", "every edge whose two tools both sit in the input, separation, notes, chords/beat/key, string and fret, "
                "tab formats, browser and metronome/sync stages", sv, pn, size, colors, (n_nodes, len(es))))
    # fingerstyle video path
    fv_stages = ["input", "separation", "notes", "fingerstyle", "video", "tab", "formats", "render", "sync"]
    core = {"fingerstyle", "video"}
    down = {"notes", "tab", "formats", "render", "sync"}

    def keep(e):
        a, b = NODES[e["from"]]["stage"], NODES[e["to"]]["stage"]
        if a not in fv_stages or b not in fv_stages:
            return False
        if a in core or b in core or set(e["joint"]) & core:
            return True
        return e["evidence_type"] == "tested" and a in down and b in down

    src, n_nodes, es = path_graph("Fingerstyle-video path: edges at the voices/taps and video stages, plus the tested edges from notes to the browser",
                                  fv_stages, keep)
    sv, pn, size, colors = render("fingerstyle-video", src)
    out.append(("fingerstyle-video", "every edge with an end (or its joint) at the voices/taps or video stage, plus the tested edges "
                "among notes, string and fret, tab formats, browser and metronome/sync", sv, pn, size, colors, (n_nodes, len(es))))
    # fill the block in HANDOFFS.md
    lines = []
    for name, what, sv, pn, size, colors, ne in out:
        extra = f" {ne[0]} tools, {ne[1]} edges." if ne else ""
        lines.append(f"- `handoffs/{name}.svg` ({sv:,} bytes) and `handoffs/{name}.png` ({size[0]} x {size[1]} px, {pn:,} bytes, "
                     f"{colors}-colour palette): {what}.{extra}")
    lines.append("")
    lines.append("![Stages, tool counts and edges between stages](handoffs/overview.png)")
    block = "\n".join(lines)
    path = os.path.join(DOCS, "HANDOFFS.md")
    text = open(path).read()
    rx = re.compile(r"(<!-- BEGIN GENERATED: diagrams -->\n)(.*?)(<!-- END GENERATED: diagrams -->)", re.S)
    if not rx.search(text):
        sys.exit("diagrams marker missing in HANDOFFS.md")
    text = rx.sub(lambda m: m.group(1) + block + "\n" + m.group(3), text)
    open(path, "w").write(text)
    for name, what, sv, pn, size, colors, ne in out:
        print(name, sv, pn, size, colors, ne)


if __name__ == "__main__":
    main()
