#!/usr/bin/env python3
"""frames.py <video> <out.jpg> --times t1,t2,... [--crop x0,y0,x1,y1] [--cols 2] [--width 960]

Plain frames of the video at the given times (seconds), each labelled with its time, tiled into one sheet. --crop cuts
the same rectangle (full-frame pixels) out of every frame first, to zoom on the hands or the neck; --width is each
tile's width in pixels.
"""
import argparse
import numpy as np, cv2


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video"); ap.add_argument("out"); ap.add_argument("--times", required=True)
    ap.add_argument("--crop"); ap.add_argument("--cols", type=int, default=2); ap.add_argument("--width", type=int, default=960)
    a = ap.parse_args()
    times = [float(x) for x in a.times.split(",") if x.strip()]
    cap = cv2.VideoCapture(a.video)
    tiles = []
    for t in times:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000.0)
        ok, im = cap.read()
        if not ok:
            im = np.zeros((360, 640, 3), np.uint8)
        if a.crop:
            x0, y0, x1, y1 = [int(v) for v in a.crop.split(",")]
            im = im[y0:y1, x0:x1]
        h = int(round(im.shape[0] * a.width / im.shape[1]))
        im = cv2.resize(im, (a.width, h), interpolation=cv2.INTER_AREA)
        cv2.rectangle(im, (0, 0), (150, 30), (0, 0, 0), -1)
        cv2.putText(im, f"{t:.2f} s", (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        tiles.append(im)
    hmax = max(t.shape[0] for t in tiles)
    tiles = [cv2.copyMakeBorder(t, 0, hmax - t.shape[0], 0, 0, cv2.BORDER_CONSTANT) for t in tiles]
    while len(tiles) % a.cols:
        tiles.append(np.zeros_like(tiles[0]))
    rows = [np.hstack(tiles[i:i + a.cols]) for i in range(0, len(tiles), a.cols)]
    cv2.imwrite(a.out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(a.out)


if __name__ == "__main__":
    main()
