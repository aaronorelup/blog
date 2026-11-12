#!/usr/bin/env python3
"""docs-browser-audio-sync: summarise saved licence files so each quote can be checked against the file.

Usage: python3 -I docs_license_scan.py FILE [FILE ...]
For each file: the first non-empty line, the copyright lines, and which well-known licence sentences it contains
verbatim (after collapsing whitespace). The sentences searched for are listed in MARKERS below; a hit means the
exact sentence is in the file, so it can be quoted from it.
"""
import re
import sys

MARKERS = {
    "MIT grant": 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and '
                 'associated documentation files (the "Software"), to deal in the Software without restriction',
    "BSD redistribution": "Redistribution and use in source and binary forms, with or without modification, are "
                          "permitted provided that the following conditions are met",
    "BSD-3 no-endorse": "may be used to endorse or promote products derived from this software without specific "
                        "prior written permission",
    "Apache-2.0 grant": "Subject to the terms and conditions of this License, each Contributor hereby grants to You a "
                        "perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license",
    "Apache-2.0 header": "Licensed under the Apache License, Version 2.0",
    "MPL-2.0": "Mozilla Public License Version 2.0",
    "GPL-2.0": "GNU GENERAL PUBLIC LICENSE Version 2, June 1991",
    "GPL-3.0": "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007",
    "LGPL-2.1": "GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999",
    "LGPL-3.0": "GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007",
    "AGPL-3.0": "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007",
    "AGPL s13": "if you modify the Program, your modified version must prominently offer all users interacting with "
                "it remotely through a computer network",
    "ISC": "Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is "
           "hereby granted",
}


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


for path in sys.argv[1:]:
    try:
        raw = open(path, encoding="utf-8", errors="replace").read()
    except OSError as e:
        print(f"{path}: ERROR {e}")
        continue
    t = norm(raw)
    first = next((l.strip() for l in raw.splitlines() if l.strip()), "")
    cps = [norm(l) for l in raw.splitlines() if re.search(r"copyright\s*(\(c\)|©|[0-9])", l, re.I)][:3]
    hits = [k for k, v in MARKERS.items() if norm(v) in t]
    print(f"{path}\n  first: {first[:120]}\n  copyright: {cps}\n  verbatim markers: {hits}\n  bytes: {len(raw)}")
