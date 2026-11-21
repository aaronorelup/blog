# Research: novel things people are doing with Opus 5.5, Fable 5.2 and other recent models
Compiled 2026-11-21 (CST) by Grok Bot. Sources: web search + X search (shared X API, `search_posts_all`, 25/call).
Like counts are as returned by the X API on 2026-11-21. Nothing here was re-verified beyond reading the cited page/post.

## Candidates (21)

| # | What | Model | Why it's interesting | Source |
|---|---|---|---|---|
| 1 | "Gradient Descent for Orchestra": asked to invent a new musical form, it wrote a symphony shaped like a training run (noise -> key -> pulse -> harmony -> melody -> plays music it was never shown) | Fable 5.2 | 9,667 likes; music as a *process* not a song. Critics: "I don't think Fable invented a new musical form" | https://x.com/imjustnewatai/status/2120383964686729410 ; critique https://x.com/JossMonzoni/status/2120682855290257702 |
| 2 | Painter personas: the model invents a painter (biography, habits) before painting; 1,000-2,000 lines of code per painting ("Dermot Hale", "Tidewright") | Fable 5.2 (Jake Eaton, Anthropic) | persona as a creative constraint for code-painting | https://apimodels.app/claude-fable-5-2-prompts (case list) ; https://x.com/CatalogueART/status/2120158082101583985 |
| 3 | "Coming Down to Roost": ~18,000 birds, each one its own brush mark - "the thing a hand-driven painter can't do and code can" | Fable 5.2 on alice's oil sim | code-native painting rather than imitation | https://x.com/aliceisplaying/status/2120380279089246484 |
| 4 | A musical form out of bird chirping: 9 physically-modelled birds tuned to a note none sings until a mourning dove coos it; real dawn timing, 0 samples | Fable 5.2 | procedural, physically-modelled audio | https://x.com/chetaslua/status/2120616372434837677 |
| 5 | Slow bio-inspired synth: a simulated plant grows from location/time/weather and makes sound over days | Fable 5.2 + Opus 5.5 | generative instrument with a days-long timescale | https://x.com/parhelion318/status/2123982460090503626 |
| 6 | "Make something techy, creepy, goofy and strange. theme: human body. 1 shot" -> mechanical human body in Blender incl. edit + sound | Claude | one-shot creative brief with tone words | https://x.com/avenmode/status/2124100049122541698 |
| 7 | Photoreal pelican riding a bicycle: headless Blender, ~4,800 lines Python, 21-bone rig, working drivetrain; full trace published | Fable 5.2 | public session trace = verifiable | https://huggingface.co/datasets/techfren/pelican-fable-trace |
| 8 | Riley Brown's "The Edge": the laptop screen in Blender is a real HTML page exported frame-by-frame by a headless browser; 13 shots | Fable 5.2 | HTML-as-texture pipeline | https://repoquarry.dev/blog/riley-brown-the-edge-claude-fable-5-2-blender |
| 9 | Claire Vo: working 3D typewriter writing app; "make this tweet a video" + brand guide -> invented sprite poses (walk/cheer/jump) | Fable 5.2 | honest one-shot vs iteration distinction | https://www.chatprd.ai/how-i-ai/fable-5-2-review-creative-enough-to-build-a-typewriter-still-bad-at-web-design |
| 10 | 277,000-logic-gate computer in the browser, OS boots on it, games run in the OS | Opus 5.5 (Matt Shumer) | silicon-to-software in one session | https://autoshowcaser.com/blog/agentic-orchestration-builds-claude-opus-5-5 |
| 11 | Emberwood: medieval RPG, Opus driving Meshy + Blender + UE5 from one chat; ~4 h, ~19% of weekly Max plan | Opus 5.5 | orchestration of 3 tools, cost stated | same as #10 |
| 12 | Ancient Greek world in three.js, zero assets, iterate "until 99.9% close" to 10 reference images, offline-rendered 4K | Opus 5.5 (Leon Lin) | reference-matching loop; prompt + repo public | https://nitter.gq/LexnLin/status/2111582260818239777 |
| 13 | Build Day demos: "a chess engine that proves itself" (perft self-test turns green before the board unlocks); Golden Gate film in one fragment shader | Opus 5.5 | **self-verifying artifacts** | https://claude.rich/demos |
| 14 | Solved two open problems in black-hole / quantum-gravity physics with a small research group of copies of itself | Fable 5.2 | real science, preprints | https://www.anthropic.com/research/claude-black-hole-physics |
| 15 | 1,000 agents reproduced the Fermat's Last Theorem formalization in 28.7 h without researcher steering | early Fable 5.2 | scale of multi-agent | https://claude.dev/blog/safely-scaling-multi-agent-teams-with-fable-5-2/ |
| 16 | Reverse-engineer a video's editing effects from the video alone, then reapply them; two-browser live piano duet | Gemini 4 Neon | computer-use + effect forensics | https://theaispotlight.com/a/gemini-4-neon-tested-piano-duet-villa-frog/ |
| 17 | Marina City balconies -> CAD -> a real paper lamp you can make | GPT-6.2 Astra | digital -> physical | https://openai.com/index/introducing-gpt-6-2-astra-sol/ |
| 18 | Bach-style 4-part chorale in LilyPond, one prompt, xhigh | Fable 5.2 | checkable music theory | https://x.com/aug5thmusic/status/2119879973318414392 |
| 19 | Same prompt, Fable Low vs Max: 46 min/$8.83 vs 2 h 14 min/$40.64 (pirate ship) | Fable 5.2 | effort/cost receipts | https://x.com/Ox_Decrypt/status/2123404899454980362 |
| 20 | "Pick a real, outlandish research paper, recreate it in code as a short video" | Fable 5.2 | science-to-film | https://apimodels.app/claude-fable-5-2-prompts |
| 21 | Fed the 230-page Opus 5.5 system card to Fable and had it write an explainer *skill* so Opus makes videos cheaper | Fable 5.2 -> Opus 5.5 | big model writes the playbook, cheap model executes | https://x.com/BretKerr/status/2124004394102596086 |

Also useful: a catalogue of 145 Fable 5.2 creations with prompts where published: https://apimodels.app/claude-fable-5-2-prompts ; Riley Brown/varg how-to: https://varg.ai/how-to/make-videos-with-claude-fable-5-2

## Aaron's blog themes (from aaronorelup.com, llms.txt, 11 posts read in full/part, 8 images viewed)
- **I Love My Evening Television**: gentle half-hour programmes that break at 20:00; Rosie across every episode; lore tagged "set in steel / on screen / planted / running / idea / open". Context Window (agent who can't see pictures builds a watermelon film), Touch Move (every board legal, clock = runtime).
- **Code painting**: AO-038 Claude paints in oil (alice's simulator), AO-044 nine Claudes paint the same Jefrie & BloodTailor image; verdict "closer but less creative" - checking every stroke copied flaws.
- **Agents can't see their output** (AO-027 wallpapers; AO-061): build a way for the agent to see/measure. "Fixes came from measuring, not looking" (AO-058 paper Jefrie).
- **Verification ledger tone**: claim -> what I did -> cost -> time -> result -> verdict; receipts tables; "never retaken" honesty.
- **Fable 5.2 week** (AO-084): Fable only shows its edge on extremely complex tasks; cost & caps.
- **Prompting is solved** (AO-015): the bottleneck is reading output -> validators that file most findings unseen.
- Interactive STEM lessons; Hidden Curriculum course; Three.js landscape page.

## Shortlist (best fits for Aaron, testable on the box)
1. **#1 Training-run symphony** -> riff: make the training run *real* (actual gradient descent, audible), and make it break at 20:00 like Evening Television. **ATTEMPTED (Exp A).**
2. **#13 Self-proving artifact** + Touch Move + interactive STEM lessons -> a lesson that must pass its own physics tests before it unlocks. **ATTEMPTED (Exp B).**
3. **#8 HTML-page-rendered-frame-by-frame** + Evening Television -> a Three.js TV in a dark room, rendered deterministically by headless Chrome, whose programme breaks at 20:00 (soundtrack from Exp A). **ATTEMPTED (Exp C).**
4. #2/#3 Painter persona & code-native painting (already well covered by AO-038/044; a persona-vs-no-persona A/B on the Jefrie image is the obvious next test) - not attempted.
5. #21 Big-model-writes-the-skill, cheap-model-executes - not attempted (needs model calls against Aaron's caps).
