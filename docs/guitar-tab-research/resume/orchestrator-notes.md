# Orchestrator state (guitar tab research) — working notes, not a deliverable
Branch research/guitar-tab-tools, draft PR #10 (aaronorelup/blog). Work dir /home/user/gtr. Lane script v2: scratchpad/gtr-lane-v2.js (DO NOT EDIT: resume cache). v1 script (hosted-apis only): /root/.claude/projects/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/workflows/scripts/gtr-lane-wf_bec2a1db-792.js
Phase A done 20:40 UTC (15 clips; R3b/R3c missing -> inputs-video agent).
| lane | task id | run id | script |
| hosted-apis | wr2djtabv | wf_bec2a1db-792 | v1 |
| audio-to-notes | wt1y6ztum | wf_8ea70378-f88 | v2 |
| chords-beats-key | wf8rsiqo7 | wf_6b42e671-938 | v2 |
| source-separation | w5x8qhmnl | wf_7bac4b3b-9a4 | v2 |
| guitar-tab | w1zgbl7qi | wf_c32537f5-0b9 | v2 |
| video-hands-fretboard | wjvi9sruo | wf_0b490893-5a1 | v2 |
| inputs-video | w5ud1plcj | wf_bd9615d6-9ce | own |
Resume a lane after a restart: Workflow({scriptPath, args:{lane}, resumeFromRunId}).
| web-tab-render | wtrxpy5ko | wf_20a9a9a3-e85 | v2 |
| browser-audio-sync | w0hwbl3tf | wf_7a97ade3-95e | v2 |
| fingerstyle-voices-taps | wlf6gnb1t | wf_b667c976-bc4 | v2 |
| apps-survey | wx3q7fesu | wf_b61ed36f-0c2 | v2 |
All 10 lanes launched by 20:56 UTC.
Draft post: src/content/posts/guitar-tab-tools.md = AO-079 (stub, topic agents). Media folder public/media/guitar-tab-tools/.
FINDING: checker (scripts/check/links.mjs) errors at deploy level on any link to an unlisted post, even from a draft -> the post must NOT hyperlink /ledger/guitar-tabs-from-video/. Name it in words; flag in PR summary.
Post rule: facts only; use raw counts (matched X of Y), no F-scores as "scores", no ranking order (alphabetical or pipeline order).
Disk: allowance ~40 GB total; classifier denied deleting system toolchains. Use `uv cache prune`, agents delete venvs. env.sh prints low-disk notice.
22:33 hosted-apis DONE, 22:41 web-tab-render DONE, 21:56 apps-survey DONE.
Phase C scripts ready (DO NOT EDIT after launch): scratchpad/gtr-phase-c1.js (args.which = chains | critic | foraaron), gtr-phase-c3.js (handoff graph + 2 verifiers + repair).
Phase D section script: scratchpad/gtr-post-section.js (args.lane) -> fragments at scratchpad/post/<lane>.md, images into public/media/guitar-tab-tools/.
Section runs: web-tab-render wsydj2v2h wf_551ce136-b9d | hosted-apis wd85fid0r wf_23618e41-458 | apps-survey wfydgq743 wf_3b38b055-82a
Known issues for gap list: gtr-eval ASCII-tab capo rule reads "capo 2" from TuxGuitar title line (e0468); late finds Note2Tabs, Cesure, RiffToTab, Fretwise, GuitarConvert, gtrsnipe; Gemini key 402 (no credit); permission system refused: run AppImage, npm ci / pnpm install in 3rd-party repos, tick consent box.
STUDIO: test clips filed. project blog-posts, run-id 20261110-225132-vm-7d3107, items #70897-#70922 (26 files, status reference, purpose test). NEVER write the hq host URL into repo files (private link). Staging dir /home/user/gtr/studio/.
22:52 fingerstyle-voices-taps DONE; its section run: wcurxkegx wf_26e60d08-56d.
gtr-eval bugs to fix in gap phase: (1) ASCII-tab capo rule reads title line (e0468); (2) f0 IndexError on empty cells (e0440-e0447).
23:05 browser-audio-sync DONE; section run launched. ENVIRONMENT.md needs fixing at end: many runs were --nolock (queue of 24-30 jobs); state pinned vs nolock counts from the ledger.
23:12 audio-to-notes DONE, 23:17 chords-beats-key DONE. (7/10 lanes done; remaining source-separation, guitar-tab, video-hands-fretboard.)
Gap-fill script scratchpad/gtr-gapfill.js (args lane, round, tasks) DO NOT EDIT. Round-1 gap fills launched: audio-to-notes w3tcdwbki wf_f5367e26-b16 | fingerstyle-voices-taps w9563ybap wf_a7d1ac27-d50 | chords-beats-key (see next).
Sections drafted/in progress: apps-survey, hosted-apis, web-tab-render, fingerstyle-voices-taps, browser-audio-sync. After gap rounds, sections of lanes with gap rounds need an update pass (fingerstyle) or a first draft (audio-to-notes, chords, source-sep, guitar-tab, video).
Classifier refuses "Code from External" (running cloned repo code / building) in several lanes: BTC, madmom git, pYIN vamp build, Timbre-Trap, ADTOF-pytorch, muzart pnpm install, AnthemScore AppImage, McLeod voice-splitting -> FOR_AARON.
23:29 guitar-tab DONE (8/10); section run launched. chains run: wbtnnfacg wf_cc43e0db-1ac. chords gapfill: woxqhoxni wf_78504b8f-cec. DECISION: single post file with folded details per lane (precedent: guitar-tabs-from-video.md 409 KB); trial assembly of 4 fragments passes npm run check.
23:36 video-hands-fretboard DONE (9/10); apps-survey SECTION done (fragment final). Section runs: guitar-tab w57gmaraa wf_a9ebce6b-a39 | video wom05my3b wf_6da9fe56-123 | browser wnz75iggq wf_9d2cd92f-723.
Critic launched 23:38: wkg9nj8d5 wf_42e9b209-626 (gtr-phase-c1.js which=critic; CRITIC text edited before launch).
LEDGER FACT (23:36): 532 runs; 120 in a 2-core slot, 1 four-core, 410 --nolock. ENVIRONMENT.md must be rewritten with final counts + ONNX Runtime affinity caveat. Main read must define "the cloud box".
Plan: after critic -> gap round 2 per lane; then for-aaron (which=foraaron) + handoff graph (gtr-phase-c3.js); section update passes; chains section; assemble post (order: source-separation, audio-to-notes, chords-beats-key, guitar-tab, fingerstyle, video, web-tab-render, browser-audio-sync, chains, hosted-apis, apps-survey); global fact-check; studio push outputs; README.md; ledger copies; PR summary.
00:10 (Nov 11 UTC) critic DONE: 52 gaps -> docs GAPS.md; per-lane task files scratchpad/gaps/<lane>.txt.
Gap round 2 launched 00:14 for: guitar-tab whzk53ccy wf_93ad9b2a-31f | video wuqv6dek3 wf_da1fccf5-18a | web-tab-render wm7zf7ot2 wf_2d587bee-b55 | browser wdwy01xlw wf_e35c7080-b51 | apps-survey wsuvhhhyq wf_ae624f89-084 | hosted-apis walsbdmds wf_afb8acac-942. gtr-eval fix: wfxii7j9q wf_32fbf770-0bb.
STILL TO LAUNCH round 2 (after their round 1 ends): audio-to-notes, fingerstyle-voices-taps, chords-beats-key; and source-separation (after its lane workflow ends).
Sections final: apps-survey, web-tab-render, hosted-apis (but gap round 2 will change those lanes -> need section UPDATE pass). In progress: fingerstyle, browser, guitar-tab, video.
alphaTab license: its "alphaTab.net" mark must stay visible; do not crop alphaTab pictures (hover card!).
00:22 ALL 10 LANES DONE (source-separation last). chains DONE+verified (docs lanes/chains/trials.md). browser section final.
00:25 launched: source-separation gap round 2 wh6x4h6o5 wf_f90fc63e-e58 | chains section wsyfoj193 wf_b26d9fb9-25d.
00:30 a2n gap round 1 DONE (RMVPE, OaF ran; MT3/MR-MT3/CREPE-TF/Omnizart/YourMT3-local open: permission refusals). a2n gap round 2 launched (critic gaps + PyPI mt3-infer / yourmt3).
Update script ready: scratchpad/gtr-post-update.js (args.lane) for sections drafted before gap rounds: apps-survey, web-tab-render, hosted-apis, fingerstyle, browser, guitar-tab, video.
Sections NOT yet drafted (wait for gap rounds): audio-to-notes, chords-beats-key, source-separation.
Remaining round 2 to launch after round 1 ends: fingerstyle-voices-taps, chords-beats-key.
00:33 fingerstyle gap round 1 DONE (6 installs refused by permission system; RT1 real tapping clip CC BY 3.0 added to lane inputs). Round 2 launched. META-FINDING for post/PR: auto-mode permission classifier refused '[Code from External]' installs/runs for many tools -> FOR_AARON + note he can allow via permission rule.
00:52 sections final (pre-gap-round-2): apps, web, hosted, browser, guitar-tab, video, fingerstyle. Section drafts launched 00:52: source-separation wi7rfyb0v wf_0262c475-c5f | audio-to-notes wbmaje9c6 wf_df736123-70c | chords-beats-key wrsgjlpte wf_7263046c-bd2. chains section wsyfoj193 in progress.
assemble.py ready (needs post/_main.md and post/_front.yaml). gtr-post-update.js edited to also tighten openings (<=60 words) and rundown (<=45 words).
NEXT: when gap round 2 done per lane -> run gtr-post-update.js for that lane (all 10 + chains if needed). chords round 2 still to launch after round 1 ends. Then: for-aaron (gtr-phase-c1.js which=foraaron), handoff graph (gtr-phase-c3.js). Cross-section consistency check (e.g. tutts 'not run' in web but ran in guitar-tab). CC BY-SA frames from R3a in video section: flag in PR.
01:06 apps-survey gap round 2 DONE (tools 60, tried 0, for_aaron 28) -> section update launched (gtr-post-update.js; DO NOT EDIT now).
NOTE: session WebSearch budget (200) used up; agents still have curl/WebFetch. Some vendor terms bar automated access (Yousician, Capo/SMUG, Apple site terms): agents fetched a few pages before reading terms -> mention in PR notes.
post/_clips.md written (17 test clips table).
01:10 gtr-eval fixed -> 0.12.1 (notes docs scripts/gtr-eval-fix-notes.md). 01:22 hosted-apis gap2 DONE; chords gap1 DONE (allin1, tempo-cnn, S-KEY ran); chains section DONE; browser gap2 DONE (tools 101, tried 36).
Launched 01:24: updates hosted-apis wrpjbk19b, chains wzm6q1en8, browser (next id), apps w1x764tfn (01:06); chords gap round 2 wvvq298qq wf_1858b37c-019.
PENDING gap round 2: guitar-tab, video, web, source-sep, a2n, fingerstyle, chords. PENDING section drafts: source-sep, a2n, chords.
THEN: updates for guitar-tab, video, web, fingerstyle, source-sep, a2n, chords -> for-aaron + handoff-graph -> assemble -> global check.
_main.md + _front.yaml + _clips.md drafted with [[placeholders]].
