---
id: "AO-092"
title: "Ask Claude Code to build a physics sim and change one number"
summary: "Experiment: a tablecloth trick simulation with one input, the pull speed, run at 76 speeds and drawn as moving pictures. Hypothesis: a dish stays only if the cloth leaves before friction drags it off. Models: Claude Opus 5.5, max effort."
date: 2026-11-25
topic: "agents"
draft: false
preview:
  verdict: "Plate stays from 3.51 m/s"
  takeaway: "Friction can push the plate only so hard, so the pull speed sets how long it pushes. Across 76 speeds the plate stayed from 3.51 m/s, and the post's own values gave 2.80 m/s."
  points:
    - "At 1 m/s the plate caught up with the cloth after 17 cm and rode it off. At 6 m/s it slid 7.0 cm and stopped."
    - "A 1.5 kg plate got five times the push of a 0.3 kg plate and moved exactly the same."
    - "From 2.91 to 3.51 m/s the cloth got out first and the plate still slid off the edge."
  image: "/media/previews/ask-claude-code-to-build-a-physics-sim-and-change-one-number.webp"
  alt: "The 3D simulation in slow motion: a plate tipping off the edge of a wooden table as a white cloth runner is pulled over it"
---

The tablecloth trick works because friction can only push the plate so hard. The one thing you control is how long it pushes, and a faster pull means less time. My agents built a simulation of it, a table with a cloth, a plate and a glass where the pull speed is the only input, and ran it at 76 speeds. **On their table the plate stays if the cloth is pulled at 3.51 m/s or faster.** Run with the X post's own values, the same code gives 2.80 m/s. The post says 2.8.

Everything below moves, and every number in it comes from that same simulation, running in your browser.

## The idea in four moving pictures

**1. The cloth drags the plate along.** Friction from the moving cloth pulls the plate the same way. Pull slowly and the plate keeps speeding up until it moves with the cloth, and then it rides the cloth off the table.

<ao-demo name="tablecloth" part="rub">A side view of a 1 m/s pull: the cloth drags the plate along, the plate catches up with the cloth after 17.0 cm and rides it off the edge at 0.42 s.</ao-demo>

**2. The drag has a ceiling, and the plate's weight doesn't change it.** Friction can only push so hard. Here that's enough to speed the plate up by 2.94 m/s every second, 30 percent of gravity's pull. A heavier plate gets a bigger push, but it's just as much harder to get moving, so it moves exactly like a light one.

<ao-demo name="tablecloth" part="weight">A 0.3 kg and a 1.5 kg plate on the same 6 m/s pull. The cloth pushes the heavy one with 4.41 N and the light one with 0.88 N. Both speed up by 2.94 m/s every second, and both stop after 7.0 cm.</ao-demo>

**3. So the only thing you control is time.** The gold box is the push from the cloth. Its height is how hard the cloth pushes, the same in both pulls. Its width is how long the cloth is under the plate. Its area, push times time, is the speed the plate leaves with. A faster pull makes a thinner box.

**4. Then the table has to stop the plate before the edge.** Once the cloth is gone, the bare table brakes the plate, the orange box under the line. If the plate leaves the cloth with more speed than the room left can take, it slides off anyway.

<ao-demo name="tablecloth" part="time">A 3 m/s pull and a 6 m/s pull. At 3 m/s the cloth rubs the plate for 0.392 s and leaves it at 1.15 m/s, too fast to stop in the 25 cm left. At 6 m/s it rubs for 0.165 s, the plate gets 0.49 m/s and stops after 7.0 cm.</ao-demo>

## Try it

Drag the pull speed, the cloth's grip and the plate's weight. It plays at 1/10 speed. Grip changes the gold box's height and speed changes its width. Weight changes its height too, but the plate still ends up in the same place.

<ao-demo name="tablecloth" part="lab">The playable simulation needs JavaScript. With its starting values a 3 m/s pull leaves the plate at 1.15 m/s and it slides off the edge. With friction 0.30 the plate stays from 3.51 m/s.</ao-demo>

## Change one number

Each pair is two pulls 0.1 m/s apart, either side of the cutoff speed. Same table, same dish, one number changed.

<ao-demo name="tablecloth" part="compare">Two pulls either side of each cutoff. My plate stays from 3.507 m/s: at 3.46 m/s it slides off, at 3.56 m/s it stops 1.0 cm short of the edge. My glass stays from 2.369 m/s. On the post's own values the plate stays from 2.797 m/s, and the post says 2.8.</ao-demo>

- **My plate: 3.507 m/s.** It sits 25 cm from the edge with 95 cm of cloth behind it.
- **My glass: 2.369 m/s.** It sits farther from the edge, and less cloth has to pass under it.
- **The post's table: 2.797 m/s** on the post's own values. The post says 2.8.

## The same idea in symbols

- **The push is the grip times the weight,** friction 0.30 × mass × 9.81. The speed-up is the push divided by the mass, so the mass cancels: 0.30 × 9.81 = 2.94 m/s every second.
- **The speed the plate leaves with is that speed-up times the time under the cloth.** Push times time is the area of the gold box. Physicists call it the impulse.
- **The time under the cloth is about the cloth behind the plate divided by the pull speed.** 95 cm at 6 m/s is 0.158 s. The simulation says 0.165 s, because the plate creeps forward with the cloth.
- **The bare table stops it after its speed squared divided by 2 × 0.40 × 9.81.** At 0.49 m/s that's 3.0 cm, on top of the 4.0 cm it moved while the cloth was under it. 7.0 cm in all, of the 25 cm it had.

## What my agents built and measured

The idea comes from [Vorzen's post on X](https://x.com/0xVorzen/status/2125315105001009557). The technique in Vorzen's words is "ask one question, build the machine, then break one number." This is the prompt that ran, with this test's parts as placeholders:

```text
Build one self-contained interactive web page (three.js, no external CDN or network at run time) of <the scene>. The only input is a <one number> slider. Physics: <the rules>. Every number shown on screen must come from the simulation. Include a button that replays the last <run> in slow motion with live numbers.
Also run a headless sweep of <the input> in code (for example <a range>) and record, per <value>, <what to measure>. Find the cutoff <value>, and compare your measured numbers with the ones <the source> reports. Say where they differ and why. Choose and state your own <fixed values>.
```

The first build was a 3D page of the table with the pull speed as its only control and a slow motion replay with live numbers.

<figure><video controls playsinline preload="none" poster="/media/ask-claude-code-to-build-a-physics-sim-and-change-one-number/3d-page-poster.webp" src="/media/ask-claude-code-to-build-a-physics-sim-and-change-one-number/3d-page-1ms-then-6ms.mp4"></video><figcaption>The 3D page my agents built: a 1 m/s pull at real speed and at 1/20, then a 6 m/s pull and its replay. Its numbers come from the same simulation.</figcaption></figure>

- **Slow pulls drag the plate off.** At 1 m/s the plate catches up with the cloth after 17 cm at 0.34 s and rides it off the edge at 0.42 s.
- **Fast pulls leave it behind.** At 6 m/s the cloth is out from under the plate in 0.165 s. The plate is moving at 0.49 m/s by then, and the bare table stops it after 7.0 cm in all.
- **The cloth leaving first isn't enough.** From 2.91 to 3.51 m/s the cloth gets out before the plate reaches the edge, and the plate still slides off.
- **The post's numbers came back with the post's values.** A 0.25 g drag, a table that brakes at 0.4 g and the edge 30 cm away gave 20 cm and 0.41 s at 1 m/s, then 0.155 s, 0.38 m/s and 4.8 cm at 6 m/s, and a cutoff of 2.80 m/s.

![A chart of how far the plate and the glass slide at each pull speed from 0.5 to 8 m/s. The plate's curve crosses its table edge, 25 cm away, at 3.51 m/s. The glass's crosses its edge, 40 cm away, at 2.37 m/s. A dotted line marks the post's 2.8 m/s.](/media/ask-claude-code-to-build-a-physics-sim-and-change-one-number/slide-by-pull-speed.webp)

### Why their numbers differ from the post's

They picked their own values, as the prompt asked. The plate grips the cloth with friction 0.30 instead of 0.25. There's 95 cm of cloth behind the plate instead of about 90. The plate starts 25 cm from the edge instead of 30. Changing one value at a time from the post's to theirs moves the cutoff from 2.80 m/s to 3.14 with more grip, then 3.29 with more cloth, then 3.51 m/s with the closer edge. The bare table brakes with friction 0.40 in both.

The post gives its friction values and the edge distance in its text and video. It doesn't say how much cloth sits behind the plate. 0.90 m is the length that makes its 0.155 s come out, so that one value is inferred.

### How it was checked

- **The 3D page runs offline.** It's one 607 KB file with three.js, a library for 3D in the browser, and the simulation inside. Opened with every network request blocked, it made 0 requests and showed 0 errors.
- **Every number on screen comes from the simulation.** That includes the cutoffs, which are found by halving the gap between a speed that drops the dish and one that keeps it. The moving pictures above run the same simulation file.
- **The steps matched the formulas.** In 470 checks from 0.3 to 12 m/s the simulation agreed with the exact answer to 12 decimal places. Time steps of 1 ms, 0.1 ms and 0.01 ms gave the same results.
- **The build took 29 minutes and 152,065 output tokens.** Output tokens are the text the model wrote. That was Claude Opus 5.5 at max effort, in one session with no subagents. Reading the source post through Grok cost nothing.
- **The moving pictures came in a second pass,** after I asked for a version that teaches the idea. The same model wrote them at the same effort.

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
