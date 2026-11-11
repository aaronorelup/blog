# hero-spike costs

| When (CST) | What | Where | Price |
|---|---|---|---|
| 13:04 | Pod vdz1yk8137gg6f, RTX 4090 secure, TRELLIS.2 image | RunPod | $0.89/h while running |
| 13:00 | microsoft/TRELLIS.2 HF Space probe | Hugging Face ZeroGPU | free, refused: quota exceeded |
| 13:06 | 3 stills (jefrie_leap, echo_leap, prop_crt) | Gemini API gemini-3-pro-image | about $0.13 each, about $0.40 (list price; 6 more calls refused with HTTP 402 Payment Required, billing cap) |
| 13:07 | 6 stills (jefrie_apose, yusef_apose, yusef_leap, echo_apose, prop_lantern, prop_bell) | xAI grok-imagine-image-2.0 /v1/images/edits | about $0.07 each, about $0.42 (estimate, list price not checked) |
| 13:32 | Pod e9i3f2qwqzy9yx, RTX 4090 secure, plan B (runpod/pytorch + bootstrap) because pod A was still pulling after 28 min | RunPod | see PODS.txt |
| 13:49 | Pod pdv3f0gwb5d1be, RTX 4090 secure, plan B2 (fixed bootstrap) | RunPod | $0.89/h |
| 14:09 | Pod 3c8oacy2gt6wlr, RTX 4090 secure, plan B3 | RunPod | $0.89/h |

## RunPod totals (real run times, $0.89/h each, billed from create to terminate)

| Pod | Ran | Hours | Cost |
|---|---|---|---|
| vdz1yk8137gg6f (prebuilt image, never got past the pull) | 13:04 to 13:49 | 0.75 | $0.67 |
| e9i3f2qwqzy9yx (pip conflict) | 13:32 to 13:49 | 0.28 | $0.25 |
| pdv3f0gwb5d1be (worker bug) | 13:49 to 14:09 | 0.33 | $0.30 |
| 3c8oacy2gt6wlr (worked; all 9 GLBs done by 14:23, then sat idle until 18:12 because the session stalled) | 14:09 to 18:12 | 4.05 | $3.60 |
| **Total** | | **5.41** | **about $4.82** (about $3.40 of it is idle time on 3c8oacy2gt6wlr) |

Images: about $0.40 Gemini plus about $0.42 xAI (estimates). **Spike total: about $5.64.**
