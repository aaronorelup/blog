"""Reference frame list for a video: decode every frame with ffmpeg (no frame dropping or duplication) and write,
per frame, its index, its presentation time and the SHA-1 of its luma (Y) plane. A browser page hashes the Y plane
of the frame it shows or decodes the same way, so a frame can be identified exactly when both decoders are
bit-exact.

Usage: python frame_hashes.py <video> <out.json>
"""
import hashlib, json, subprocess, sys

video, out = sys.argv[1], sys.argv[2]
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,r_frame_rate,codec_name,pix_fmt:frame=pts_time,best_effort_timestamp_time', '-of', 'json', video]))
st = probe['streams'][0]
w, h = st['width'], st['height']
times = [float(f.get('pts_time', f.get('best_effort_timestamp_time'))) for f in probe['frames']]
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', video, '-map', '0:v:0', '-fps_mode', 'passthrough', '-f', 'rawvideo',
                      '-pix_fmt', 'yuv420p', '-'], stdout=subprocess.PIPE)
fs = w * h * 3 // 2
frames = []
i = 0
while True:
    b = p.stdout.read(fs)
    if len(b) < fs:
        break
    frames.append({'i': i, 't': times[i] if i < len(times) else None, 'y_sha1': hashlib.sha1(b[:w * h]).hexdigest()})
    i += 1
p.wait()
dup = {}
for f in frames:
    dup.setdefault(f['y_sha1'], []).append(f['i'])
res = {'video': video, 'codec': st['codec_name'], 'pix_fmt': st['pix_fmt'], 'width': w, 'height': h,
       'r_frame_rate': st['r_frame_rate'], 'n_frames': len(frames),
       'n_distinct_y_hashes': len(dup), 'frames': frames,
       'ffmpeg': subprocess.check_output(['ffmpeg', '-version']).decode().split('\n')[0]}
json.dump(res, open(out, 'w'))
print(json.dumps({k: v for k, v in res.items() if k != 'frames'}))
