"""STONE (deezer/stone): turn the values.npz files that its inference.py writes into key labels.

Written in gap round 2 for Aaron's steps (for-aaron.md, section 10). Not a STONE run: STONE's own code did not run on the
research box (repository code). This script only reads the .npz files and applies the two mappings the STONE README
gives ("Mapping" section of https://raw.githubusercontent.com/deezer/stone/main/README.md, read 2026-11-11).

inference.py (main branch, read 2026-11-11) saves one entry per audio file, keyed by the file's path, holding
torch.mean(yh, dim=0).argmax() over the 15 s segments when --average is on (its default), i.e. one integer class.

Usage (needs only numpy):
  python stone_npz_labels.py <clips>/results/semisupervised_ks_mode/values.npz ks_mode
  python stone_npz_labels.py <clips>/results/semitone_ks/values.npz ks
Prints "<file name>\t<class index>\t<label>" per file and writes the same lines to <npz>.labels.tsv.
"""
import os
import sys

import numpy as np

# Copied from the STONE README, "Mapping": "# for 12stone (semitone_ks.pt)"
MAP_KS = {0: 'Bb Major/G minor', 1: 'B Major/G# minor', 2: 'C Major/A minor', 3: 'C# Major/Bb minor',
          4: 'D Major/B minor', 5: 'D# Major/C minor', 6: 'E Major/C# minor', 7: 'F Major/D minor',
          8: 'F# Major/D# minor', 9: 'G Major/E minor', 10: 'G# Major/F minor', 11: 'A Major/F# minor'}
# Copied from the STONE README, "Mapping": "# for 24stone (semisupervised_key_mode.pt)"; the file in ckpt/ is
# named semisupervised_ks_mode.pt.
MAP_KS_MODE = {0: 'B minor', 1: 'C minor', 2: 'C# minor', 3: 'D minor', 4: 'D# minor', 5: 'E minor', 6: 'F minor',
               7: 'F# minor', 8: 'G minor', 9: 'G# minor', 10: 'A minor', 11: 'Bb minor', 12: 'D Major',
               13: 'D# Major', 14: 'E Major', 15: 'F Major', 16: 'F# Major', 17: 'G Major', 18: 'G# Major',
               19: 'A Major', 20: 'Bb Major', 21: 'B Major', 22: 'C Major', 23: 'C# Major'}


def main():
    if len(sys.argv) != 3 or sys.argv[2] not in ("ks", "ks_mode"):
        sys.exit("usage: python stone_npz_labels.py <values.npz> ks|ks_mode")
    path, kind = sys.argv[1], sys.argv[2]
    mapping = MAP_KS if kind == "ks" else MAP_KS_MODE
    data = np.load(path, allow_pickle=False)
    lines = []
    for key in sorted(data.files):
        value = np.asarray(data[key])
        if value.size != 1:
            lines.append("%s\t(not one class: shape %s; was --average off?)\t" % (os.path.basename(key), value.shape))
            continue
        idx = int(value.reshape(-1)[0])
        lines.append("%s\t%d\t%s" % (os.path.basename(key), idx, mapping.get(idx, "(index outside the map)")))
    with open(path + ".labels.tsv", "w") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
