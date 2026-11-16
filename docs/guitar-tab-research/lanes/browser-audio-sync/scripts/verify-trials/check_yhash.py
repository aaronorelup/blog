import hashlib, json, subprocess, sys
for name in ["R3a.mp4", "R3a.webm"]:
    src = "/home/user/gtr/inputs/R3a/" + name
    ref = json.load(open("/home/user/gtr/lanes/browser-audio-sync/out/video/%s.yhash.json" % name))
    raw = subprocess.run(["ffmpeg","-v","error","-threads","1","-i",src,"-map","0:v:0","-fps_mode","passthrough","-f","rawvideo","-pix_fmt","yuv420p","-"], capture_output=True).stdout
    fs = 640*480*3//2
    n = len(raw)//fs
    hs = [hashlib.sha1(raw[i*fs:i*fs+640*480]).hexdigest() for i in range(n)]
    pts = json.loads(subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0","-show_entries","frame=pts_time","-of","json",src]))["frames"]
    same = sum(1 for a,b in zip(hs, ref["frames"]) if a == b["y_sha1"])
    print(name, "frames", n, "distinct", len(set(hs)), "equal to stored", same, "first pts", pts[0]["pts_time"], pts[1]["pts_time"], "last pts", pts[-1]["pts_time"])
