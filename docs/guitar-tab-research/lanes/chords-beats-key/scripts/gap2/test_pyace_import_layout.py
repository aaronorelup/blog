"""Gap round 2: what Python 3 does with pyace's package layout, on a synthetic replica (no pyace code).

pyace 0.1.1 (github.com/tangkk/pyace, 4321145) has pyace/__init__.py containing "from pyace import simpleace" and
"from pyace import deepace", with the functions defined in pyace/pyace.py, which itself starts with
"from helpers import helpers". This script builds the same layout with stub files in a temporary folder and imports it
with the running Python 3 interpreter. Usage: python3 -I test_pyace_import_layout.py
"""
import os
import subprocess
import sys
import tempfile

with tempfile.TemporaryDirectory() as tmp:
    pkg = os.path.join(tmp, "pyace")
    os.makedirs(os.path.join(pkg, "helpers"))
    open(os.path.join(pkg, "__init__.py"), "w").write("from pyace import simpleace\nfrom pyace import deepace\n")
    open(os.path.join(pkg, "pyace.py"), "w").write(
        "from helpers import helpers\ndef simpleace(*a):\n    return 'simple'\ndef deepace(*a):\n    return 'deep'\n")
    open(os.path.join(pkg, "helpers", "__init__.py"), "w").write("")
    open(os.path.join(pkg, "helpers", "helpers.py"), "w").write("nchords = 24\n")
    for label, code, cwd in (("import pyace (installed-package route)", "import pyace", tmp),
                             ("python pyace.py from inside the folder (README's other route)",
                              "import runpy; runpy.run_path('pyace.py'); print('ran')", pkg)):
        p = subprocess.run([sys.executable, "-c", code], cwd=cwd, capture_output=True, text=True)
        last = (p.stderr.strip().splitlines() or [p.stdout.strip()])[-1]
        print("%s: exit %d: %s" % (label, p.returncode, last))
print(sys.version.split()[0])
