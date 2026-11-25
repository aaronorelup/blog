---
id: "AO-092"
title: "Ask Claude Code to build a physics sim and change one number"
summary: "Experiment: a tablecloth trick simulation with one input, the pull speed, run at 76 speeds. Hypothesis: a dish stays only if the cloth leaves before friction drags it off. Models: Claude Opus 5.5, max effort. Look for: the cutoff speed."
date: 2026-11-25
topic: "agents"
draft: false
preview:
  verdict: "Plate stays from 3.51 m/s"
  takeaway: "Across 76 pull speeds the plate stayed on the table from 3.51 m/s. Run with the X post's own values, the same code gave 2.80 m/s, where the post says 2.8."
  points:
    - "At 1 m/s the plate caught up with the cloth after 17 cm and rode it off. At 6 m/s it slid 7.0 cm and stopped."
    - "From 2.91 to 3.51 m/s the cloth got out first and the plate still slid off the edge."
    - "The gap to 2.8 comes from the chosen values: more friction, more cloth behind the plate, the edge 5 cm closer."
  image: "/media/previews/ask-claude-code-to-build-a-physics-sim-and-change-one-number.webp"
  alt: "A chart of how far the plate and the glass slide at each pull speed, with each one's table edge"
---

My agents tested an idea from X: ask Claude Code why the tablecloth trick works (yanking a cloth out from under the dishes), have it build a small simulation with one input, then change only that number. They built a 3D web page of a table, a cloth, a plate and a glass where the pull speed is the only control, and ran 76 pull speeds from 0.5 to 8 m/s through it. **On their table the plate stays from 3.51 m/s and the glass from 2.37 m/s.** Given the values the X post used, the same code gives 2.80 m/s. The post says 2.8.

The idea comes from [Vorzen's post on X](https://x.com/0xVorzen/status/2125315105001009557). The technique in Vorzen's words is "ask one question, build the machine, then break one number." This is the prompt that ran, with this test's parts as placeholders:

```text
Build one self-contained interactive web page (three.js, no external CDN or network at run time) of <the scene>. The only input is a <one number> slider. Physics: <the rules>. Every number shown on screen must come from the simulation. Include a button that replays the last <run> in slow motion with live numbers.
Also run a headless sweep of <the input> in code (for example <a range>) and record, per <value>, <what to measure>. Find the cutoff <value>, and compare your measured numbers with the ones <the source> reports. Say where they differ and why. Choose and state your own <fixed values>.
```

- **Slow pulls drag the plate off.** The cloth can speed the plate up by at most 0.30 g, 30 percent of gravity's pull, the friction value they chose. At 1 m/s the plate catches up with the cloth after 17 cm at 0.34 s and rides it off the edge at 0.42 s.
- **Fast pulls leave it behind.** At 6 m/s the cloth is out from under the plate in 0.165 s. The plate is moving at 0.49 m/s by then, and the bare table stops it after 7.0 cm in all.
- **The cloth leaving first isn't enough.** From 2.91 to 3.51 m/s the cloth gets out before the plate reaches the edge, and the plate still slides off. The table needs room to brake it.
- **The post's numbers came back with the post's values.** A 0.25 g drag, a table that brakes at 0.4 g and the edge 30 cm away gave 20 cm and 0.41 s at 1 m/s, then 0.155 s, 0.38 m/s and 4.8 cm at 6 m/s, and a cutoff of 2.80 m/s.

![A chart of how far the plate and the glass slide at each pull speed from 0.5 to 8 m/s. The plate's curve crosses its table edge, 25 cm away, at 3.51 m/s. The glass's crosses its edge, 40 cm away, at 2.37 m/s. A dotted line marks the post's 2.8 m/s.](/media/ask-claude-code-to-build-a-physics-sim-and-change-one-number/slide-by-pull-speed.webp)

## Why their numbers differ from the post's

They picked their own values, as the prompt asked. The plate grips the cloth with friction 0.30 instead of 0.25. There's 95 cm of cloth behind the plate instead of about 90. The plate starts 25 cm from the edge instead of 30. Changing one value at a time from the post's to theirs moves the cutoff from 2.80 m/s to 3.14 with more grip, then 3.29 with more cloth, then 3.51 m/s with the closer edge. The bare table brakes with friction 0.40 in both.

The post gives its friction values and the edge distance in its text and video. It doesn't say how much cloth sits behind the plate. 0.90 m is the length that makes its 0.155 s come out, so that one value is inferred.

## How it was checked

- **The page runs offline.** It's one 607 KB file with three.js, a library for 3D in the browser, and the simulation inside. Opened with every network request blocked, it made 0 requests and showed 0 errors.
- **Every number on screen comes from the simulation.** That includes the two cutoffs. The page finds them when it loads by halving the gap between a speed that drops the dish and one that keeps it.
- **The steps matched the formulas.** In 470 checks from 0.3 to 12 m/s the simulation agreed with the exact answer to 12 decimal places. Time steps of 1 ms, 0.1 ms and 0.01 ms gave the same results.
- **The build took 29 minutes and 152,065 output tokens.** Output tokens are the text the model wrote. That was Claude Opus 5.5 at max effort. Reading the source post through Grok cost nothing.

<details><summary>Every pull speed from 0.5 to 8 m/s</summary>

The sweep ran every 0.1 m/s. This table shows every 0.5 m/s. "Edge" means the dish's centre reached the table edge and it fell.

| Pull (m/s) | Plate | Plate slid (cm) | Cloth left the plate (s) | Glass | Glass slid (cm) |
|---:|---|---:|---:|---|---:|
| 0.5 | falls | 25.0 (edge) | never | falls | 40.0 (edge) |
| 1.0 | falls | 25.0 (edge) | never | falls | 40.0 (edge) |
| 1.5 | falls | 25.0 (edge) | never | falls | 40.0 (edge) |
| 2.0 | falls | 25.0 (edge) | never | falls | 40.0 (edge) |
| 2.5 | falls | 25.0 (edge) | never | stays | 33.2 |
| 3.0 | falls | 25.0 (edge) | 0.392 | stays | 19.5 |
| 3.5 | falls | 25.0 (edge) | 0.313 | stays | 13.2 |
| 4.0 | stays | 17.8 | 0.263 | stays | 9.6 |
| 4.5 | stays | 13.4 | 0.228 | stays | 7.4 |
| 5.0 | stays | 10.5 | 0.202 | stays | 5.9 |
| 5.5 | stays | 8.5 | 0.181 | stays | 4.8 |
| 6.0 | stays | 7.0 | 0.165 | stays | 4.0 |
| 6.5 | stays | 5.9 | 0.151 | stays | 3.3 |
| 7.0 | stays | 5.0 | 0.140 | stays | 2.9 |
| 7.5 | stays | 4.4 | 0.130 | stays | 2.5 |
| 8.0 | stays | 3.8 | 0.121 | stays | 2.2 |

</details>

<details><summary>The table, the dishes and the friction they picked</summary>

- **Table:** 1.20 m along the pull, 0.80 m wide and 0.75 m high.
- **Cloth:** a 0.60 m wide runner with its back edge at the far end of the table, pulled at a steady speed from the first instant.
- **Plate:** 27 cm across with its centre 25 cm from the edge. Friction 0.30 on the cloth and 0.40 on the bare table.
- **Glass:** a 7 cm base and 12 cm tall, its centre 40 cm from the edge and 20 cm to the side. Friction 0.25 on the cloth and 0.35 on the table.
- **The rules:** while the cloth slides under a dish, friction drags the dish toward the puller. A dish that reaches the cloth's speed rides along. Once the cloth's back edge passes the dish's centre, the bare table brakes it until it stops. A dish whose centre passes the edge falls.

</details>

*My agents picked this idea, ran the test and wrote it up.*
