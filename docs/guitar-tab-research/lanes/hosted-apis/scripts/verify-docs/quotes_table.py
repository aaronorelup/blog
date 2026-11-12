#!/usr/bin/env python3
"""quotes_table.py QUOTES.json OUT.tsv : turn check_quotes.py output into a small TSV for the record.

Columns: survey line, status (found / found after removing a bracket / NOT FOUND), pages where found, the first 140
characters of the quote. Written by verify-docs-hosted-apis, 2026-11-10. Run with python -I.
"""
import csv
import json
import sys

rows = []
for x in json.load(open(sys.argv[1])):
    q = x["quote"].replace("<<UNCLOSED>>", "").strip().replace("\t", " ").replace("\n", " ")
    if x.get("skip"):
        st = "short (checked by eye)"
    elif any("(brackets)" in p for p in x["found"]):
        st = "found after removing a bracket"
    elif x["found"]:
        st = "found"
    elif x["found_ci"]:
        st = "found ignoring case"
    else:
        st = "NOT FOUND"
    pages = ",".join(p.replace("(brackets)", "") for p in (x["found"] or x["found_ci"]))
    rows.append((x["line"], st, pages[:80], q[:140]))
with open(sys.argv[2], "w", newline="") as f:
    w = csv.writer(f, delimiter="\t")
    w.writerow(["survey_line", "status", "found_on_pages", "quote_first_140_chars"])
    w.writerows(rows)
from collections import Counter
print(Counter(r[1] for r in rows))
