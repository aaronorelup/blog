# Lane inputs added by `try-video-hands-fretboard`

Written 2026-11-10 (UTC). The shared set (`/home/user/gtr/inputs/INPUTS.md`) has one video, R3a (640x480, the
player small in frame). R3b and R3c (closer views) were not in the shared set when this lane started; they were added
to it later (`/home/user/gtr/inputs/READY-VIDEO` reads 2026-11-10T21:29:15Z) and this lane ran them too (see the shared
manifest for their sources and licenses). Before that, this lane added one clip, cut from the same archive.org source
file that R3a was cut from, so it carries the same license.

| id | file (in /home/user/gtr/lanes/video-hands-fretboard/inputs/R3a_cu/) | duration | video | what it is | truth | source URL | license (quoted clause) | attribution |
|---|---|---|---|---|---|---|---|---|
| R3a_cu | `R3a_cu.mp4`<br>`R3a_cu.wav` | 10.010 s video (300 frames); AAC stream 10.000 s; WAV 10.008 s (ffprobe) | H.264 yuv420p, 640x480, 30000/1001 fps; AAC 192 kb/s; WAV 16-bit 44.1 kHz stereo | Close shot of the same concert: the player from the chest up, guitar neck diagonal across the frame from lower left (body end) to upper right (headstock), fretting hand on the neck with frets and strings visible, picking hand not in frame (the sound hole is at the left edge behind a music stand). One continuous shot (ffmpeg scene score > 0.12 finds no cut inside the excerpt). The fretting hand is motion-blurred in some frames (for example frame 1). | none | https://archive.org/details/scm-422828-crescendo313-drh-meredithconn | CC BY-SA 4.0: "Usage: Attribution-ShareAlike 4.0 International (https://creativecommons.org/licenses/by-sa/4.0/)" (quoted from the shared manifest, which read the item page on 2026-11-10) | "Crescendo 313 - DRH - Meredith Connie Solo Classical Guitar - Part II", Mark Andersen / Seattle Community Media, archive.org item scm-422828-crescendo313-drh-meredithconn, CC BY-SA 4.0; excerpt 682-692 s, re-encoded. |

How it was made (run r0015, 2 cores, wall 10.16 s):

```
ffmpeg -v error -y -ss 682 -i /home/user/gtr/inputs/R3a/original/crescendo313_2014_09_04_0.mp4 -t 10 \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart R3a_cu.mp4
ffmpeg -v error -y -i R3a_cu.mp4 -vn -ac 2 -ar 44100 -c:a pcm_s16le R3a_cu.wav
```

How the excerpt was chosen: a contact sheet of the whole 28-minute source at one frame per 15 s (run r0012), then
one frame per 2 s over 660-720 s, showed a close shot of the neck at about 682-691 s. `ffmpeg ... -ss 670 -t 40
-vf "select='gt(scene,0.12)',showinfo"` put camera cuts at 674.57, 681.61, 692.66, 700.37 and 703.54 s of the
source, so 682-692 s lies inside one shot (681.61-692.66 s). The same scan shows a second, shorter close shot at
700.37-703.54 s (not used).

| file | bytes | sha256 |
|---|---|---|
| `R3a_cu/R3a_cu.mp4` | 2244809 | `e02d0c1752fb7c8f0698a8229996d897ae3019efbaeed968e02abea2830e2534` |
| `R3a_cu/R3a_cu.wav` | 1765672 | `e1beb026ccce5ebe4089dd7aa7f2d64e13ab0334981c44fd83a545951cd045dd` |

## Shot boundaries and hand crops used for R3a (set by hand)

`ffmpeg -i R3a.mp4 -vf "select='gt(scene,0.12)',showinfo"` reports cuts at frame 218 (7.274 s) and frame 439
(14.648 s). Frames are numbered from 0 here (frame n is at n x 1001/30000 s).

| shot | frames | hand crop (x0, y0, x1, y1) in the 640x480 frame | crop size | upscaled to |
|---|---|---|---|---|
| medium | 0-217 and 439-539 | (200, 110, 440, 350) | 240x240 | 720x720 (3x, OpenCV INTER_CUBIC) |
| wide | 218-438 | (200, 100, 480, 320) | 280x220 | 840x660 (3x, OpenCV INTER_CUBIC) |

The crop boxes were read off gridded frames 0 and 300 by eye so that both hands and the guitar neck fall inside them.
They are fixed per shot and do not follow the player. R3a_cu was used at its full 640x480 frame, and also upscaled 2x
(1280x960) where a run says so.

## C1: a still of a guitar neck with a capo (added in gap round 2, 2026-11-11)

The shared video clips show no capo (shared manifest, "Caveats"; its capo clip S5capo2 is synthesized audio with no
video; corrected by the round-2 verifier, this said "The shared clips have no capo"), so this lane added one freely
licensed still for the
capo questions (gap V6 in `GAPS.md`). Found on Wikimedia Commons in `Category:Capos` (category page read 2026-11-11;
the Commons search API answered HTTP 429 to this box twice, and the general web-search budget of this session was
used up, so the category page was read instead). Two smaller files in that category were looked at and not used:
`File:Capo_third_fret.jpg` (272 x 148 pixels) and `File:Capo_on_a_guitar_neck.jpg` (300 x 224 pixels).

| id | file (in /home/user/gtr/lanes/video-hands-fretboard/inputs/capo/) | size | what it is | truth | source URL | license (quoted clause) | attribution |
|---|---|---|---|---|---|---|---|
| C1 | `C1_kapodaster_960px.jpg` | 960 x 1706 pixels, JPEG (yuvj420p), 225,432 bytes | A studio photo, front view, of a steel-string guitar's headstock and first frets, neck vertical, white background, no hands. Commons caption: "A guitar capo with a lever-operated over-centre locking action clamp"; description: "Kapodaster an Gitarre."; date 30 January 2015; source "Own work". By eye on this file: headstock with a C. F. Martin & Co. logo and six tuners at the top; the nut at about y = 1050-1090 px; fret wire 1 at about y = 1322; a black capo bar across all six strings at about y = 1440-1500, x = 290-725, with its clamp at the right edge of the neck (x about 615-725); fret wire 2 at about y = 1538; the fretboard spans about x = 338-617; the bottom edge cuts the neck below fret 2. | none (the capo position above is read by eye) | https://commons.wikimedia.org/wiki/File:Kapodaster_an_Westerngitarre_--_2015_--_1951.jpg | CC BY-SA 4.0: "This file is licensed under the Creative Commons Attribution-Share Alike 4.0 International license. Attribution: © Anil Öztas" | "Kapodaster an Westerngitarre", © Anil Öztas, CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/); Commons' 960-pixel rendition, not modified. |

- The original upload is 1,688 x 3,000 pixels, 2.37 MB (file page). Its URL
  (https://upload.wikimedia.org/wikipedia/commons/9/90/Kapodaster_an_Westerngitarre_--_2015_--_1951.jpg) answered HTTP
  429 at 2026-11-11T00:32Z; Commons' 960-pixel rendition of the same file
  (https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Kapodaster_an_Westerngitarre_--_2015_--_1951.jpg/960px-Kapodaster_an_Westerngitarre_--_2015_--_1951.jpg)
  answered HTTP 200 a few seconds later and is the file used. sha256
  `11e53f300c0948e6484cc3da2e8198c4509479f632ed6938b1cf8a3d9b916115`.
- The file page's author box ("Using this picture") asks for the attribution in this form: "You must place the above
  copyright notice (attribution) in a suitable place (next to the photo or temporarily in the imprint or image source
  list) so that an appropriate and clear connection is made between the image and me as the author. Please refrain
  from giving further details such as via Wikipedia, Wikimedia, Commons or similar." The same box asks to be told when
  the photo is used outside Wikimedia; that request is the author's, not a license condition, and is left to Aaron.
- The page also carries Commons' "Trademarked" tag: "This work includes material that may be protected as a trademark
  in some jurisdictions. If you want to use it, you have to ensure that you have the legal right to do so and that you
  do not infringe any trademark rights." (the headstock logo).
- Overlays of this photo in `samples/` (open-vocabulary boxes, OpenCV lines) are derivatives under CC BY-SA 4.0 with
  the attribution above.
- The other capo clips the plan names stay as they were: S5capo2 is synthesized audio with no video, and no clip has
  a capo in a playing video; `for-aaron.md` section 10 asks Aaron to record one.
