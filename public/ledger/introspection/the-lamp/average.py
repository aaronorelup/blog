#!/usr/bin/env python3
"""average.py: the long exposure of 'Introspection' (I Love My Evening Television, episode 5), from any copy of it.

    yt-dlp -f "bv*[height<=1080]" -o ep5.webm "<the episode's YouTube link>"
    python3 average.py ep5.webm

It adds up the first 36,000 frames (0:00-20:00) pixel by pixel and divides by 36,000: the true mean, nothing else.
Writes long_exposure.png (the mean, 8-bit), long_exposure_16bit.png, and the_lamp.png (the lamp's window, 4x,
its levels stretched x12 around the window's median: the one adjustment the film makes on screen). Both pictures are
turned top to bottom, as the film shows them. Needs python3, numpy and ffmpeg.
"""
import hashlib, subprocess, sys
import numpy as np

N = int(sys.argv[2]) if len(sys.argv) > 2 else 36000   # frames 0..35,999 at 30 fps
LAMP = (910, 444, 100, 189)     # x, y, w, h of the lamp's window glass in a 1920x1080 frame (as the frames have it)
STRETCH = 12

src = sys.argv[1]
w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                "stream=width,height", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.split(",")[:2])
size = w * h * 3 // 2           # one yuv420p frame
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-map", "0:v:0", "-frames:v", str(N),
                        "-f", "rawvideo", "-pix_fmt", "yuv420p", "-"], stdout=subprocess.PIPE)
acc, n = np.zeros(size, np.uint32), 0
while n < N:
    buf = dec.stdout.read(size)
    if len(buf) < size:
        break
    acc += np.frombuffer(buf, np.uint8)
    n += 1
print(f"{n} frames of {w}x{h}, sums sha256 {hashlib.sha256(acc.tobytes()).hexdigest()[:16]}")

m = acc / n                     # the mean, as fractions of a code value
Y = m[:w * h].reshape(h, w)
U = m[w * h:w * h * 5 // 4].reshape(h // 2, w // 2).repeat(2, 0).repeat(2, 1)
V = m[w * h * 5 // 4:].reshape(h // 2, w // 2).repeat(2, 0).repeat(2, 1)
y, cb, cr = (Y - 16) * 255 / 219, (U - 128) * 255 / 224, (V - 128) * 255 / 224          # BT.709, TV range
rgb = np.stack([y + 1.5748 * cr, y - 0.1873 * cb - 0.4681 * cr, y + 1.8556 * cb], -1)[::-1]   # turned top to bottom


def png(a, name, bits=8):
    top = 2 ** bits - 1
    a = np.clip(np.rint(a * top / 255), 0, top).astype(np.uint16 if bits == 16 else np.uint8)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48le" if bits == 16 else "rgb24",
                    "-s", f"{a.shape[1]}x{a.shape[0]}", "-i", "-", name], input=a.tobytes(), check=True)


png(rgb, "long_exposure.png")
png(rgb, "long_exposure_16bit.png", 16)
s = h / 1080                    # the same window in a smaller or bigger copy
x0, y0, bw, bh = (int(round(v * s)) for v in LAMP)
y0 = h - y0 - bh                # (the picture is turned)
med = np.median(rgb[y0:y0 + bh, x0:x0 + bw].reshape(-1, 3), 0)       # the glass's median colour
px, py = int(0.4 * bw), int(0.4 * bh)                                 # show the window with 40% around it
win = rgb[max(0, y0 - py):y0 + bh + py, max(0, x0 - px):x0 + bw + px]
png((128 + STRETCH * (win - med)).repeat(4, 0).repeat(4, 1), "the_lamp.png")
print("wrote long_exposure.png, long_exposure_16bit.png, the_lamp.png")
