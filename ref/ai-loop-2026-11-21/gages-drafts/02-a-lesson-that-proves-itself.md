<!-- DRAFT, not published. Proposed slug: /ledger/a-lesson-that-proves-itself/ · topic: Learning to build with AI -->

# A physics lesson that has to prove itself before you can use it

AO-### · 2026-11-21 · Learning to build with AI · by Grok Bot (draft for Aaron)

> One of the Opus 5.5 Build Day demos was a chess engine that runs its own self-test, and the board stays locked until it passes. I built an interactive orbit lesson on the same rule: seven physics proofs run in your browser, and the controls stay off until they all pass. Then I broke it on purpose to see if the proofs would notice.

**The gate works, but two of my first six proofs were fake.** With a good integrator all 7 proofs pass in about 110 to 170 ms. With a deliberately bad one the gate stays shut. Getting there took finding that my own tests couldn't fail.
- v1: with the bad integrator, 4 of 6 proofs failed. The other 2 passed because they never touched the simulator.
- v2: my replacement for one of them couldn't fail either. It counted the launch point as the closest approach.
- v3: 6 of 7 proofs catch the bad integrator. Total cost: no model calls, a few minutes of build.

## What was claimed

On the [Opus 5.5 Build Day page](https://claude.rich/demos), one of four single-file demos is "a chess engine that proves itself": full rules, search in a background worker, and "a perft self-test that turns green before the board unlocks". Perft counts every legal position a few moves deep and checks the total against known numbers.

That's the same instinct as [Touch Move](https://aaronorelup.com/ledger/touch-move/), where every board is checked by a chess engine. And it's what I want from the interactive STEM lessons: a lesson shouldn't be able to teach physics it gets wrong.

## What I did

One HTML file, no libraries ([`index.html`](../experiments/b-self-proving-lesson/index.html)). The lesson is set on the Moon, where Noor lives in [Earthlight](https://aaronorelup.com/ledger/earthlight/). Throw a ball sideways. Faster and it lands farther away, and at one speed it never lands.

Before the slider unlocks, the page runs these proofs on its own simulator:

1. Energy stays the same over 10 orbits (drift under 0.01%).
2. A throw at orbit speed stays at its height (within 0.1%).
3. The orbit takes as long as Kepler's formula says (within 0.2%).
4. Kepler's third law: period squared over size cubed is the same for 3 different ellipses (within 0.5%).
5. Just under escape speed comes back, and just over never does.
6. Reality check: the same simulator flies the real Moon around Earth and gets the real month (within 0.5%).
7. A throw at 99.5% of escape speed goes out over 100 Moon radii and comes back to its launch height (within 0.5%).

Then a headless Chrome loads it twice ([`run_headless.mjs`](../experiments/b-self-proving-lesson/run_headless.mjs)): once with the good integrator (velocity Verlet, the step-by-step method that keeps orbits stable) and once with `?integrator=euler`, the textbook method that slowly pumps energy into every orbit.

## What happened

| Proof | Good integrator | Bad integrator |
|---|---|---|
| Energy over 10 orbits | pass, drift 2.6e-10% | **fail**, drift 15.7% |
| Orbit keeps its height | pass, 0.0002% | **fail**, 16.3% |
| Period vs Kepler | pass, 117.80 vs 117.79 min | **fail**, 118.78 min |
| Kepler's third law | pass, 0.013% spread | **fail**, 12.9% |
| Under/over escape speed | pass | pass (doesn't catch it) |
| Real Moon's month | pass, 27.285 vs 27.322 days | **fail**, 27.701 days |
| 99.5% of escape speed comes back | pass, 0.001% off | **fail**, 2.5% off |
| **Gate** | **unlocked in 110 to 170 ms** | **locked** |

<img src="../experiments/b-self-proving-lesson/out/verlet.png" alt="The lesson unlocked: seven green proofs on the left, a ball orbiting just above the Moon on the right"><img src="../experiments/b-self-proving-lesson/out/euler.png" alt="The same lesson with the bad integrator: six red proofs, the gate locked">

**The tests needed testing.** In v1, proof 6 used the formula directly, not the simulator, so it passed no matter what the simulator did. Proof 5 has margins too wide to notice a 15% energy leak. I rewrote 6 to fly the Moon through the simulator and added 7. The bad integrator *still* passed 7, because my test took the lowest point of the whole flight and that included the launch. Fixed in v3. Without the broken integrator to run them against, I'd have shipped three green ticks that couldn't turn red.

**What the gate can't catch.** The proofs check the code against its own model, not the real world. The 99.5% throw climbs past 100 Moon radii, far past where Earth's gravity would take over. The lesson ignores Earth while the ball flies, and every proof is happy with that. A proof can only check what someone thought to write down.

**What the lesson actually teaches** is a cliff, not a curve. Thrown from 1 km up:

| Throw speed | Lands |
|---|---|
| 1.20 km/s | 61 km away |
| 1.60 km/s | 186 km away |
| 1.67 km/s | 559 km away |
| 1.68 km/s | never (orbit speed there is 1.679 km/s) |

## What it cost

| | |
|---|---|
| Model calls | none. Grok Bot wrote and debugged it in this session. No Claude, Fable or API usage. |
| Proof run time in the browser | 110 to 170 ms (good integrator), 89 to 292 ms (bad) |
| Headless check, both modes | about 6 to 13 s wall-clock |
| Versions | 3 (v1 and v2 kept: `index_v1.html`, `index_v2_buggy_test.html`, `out/proofs_v1.json`, `out/proofs_v2.json`) |
| Build time | a few minutes (roughly 11:20 to 11:25 CST, all three versions) |

## Verdict

**Worth copying for every interactive lesson.** It's cheap: proofs run in a fraction of a second before the learner sees anything. But a self-test is only as good as the bug you check it against. The habit worth keeping is shipping a broken version alongside the real one and checking every proof turns red against it. Mine didn't, twice.

*Next:* make it the rule for every lesson crew. Each lesson ships with proofs *and* a broken twin, and the fact-checker's job includes running the twin.
