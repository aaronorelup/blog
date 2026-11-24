---
id: "AO-085"
title: "62 Claude sessions rebuilding my media library in 80 minutes"
summary: "My Claude orchestrator ran 62 cloud sessions and hundreds of helper agents for 80 minutes to tag and tidy my media library. What they built, what broke, and the $1,186 bill at API prices."
date: 2026-11-18
topic: "agents"
project: []
draft: false
preview:
  verdict: "$1,186 at API prices"
  takeaway: "The 10 minutes when Fable 5.2 sessions joined cost about $563, almost half the night, and my weekly meter went from 54% to 82%."
  points:
    - "The Fable wave cost 3 times as much a minute as the Opus minutes before it, mostly from a pricier token mix and Fable's price."
    - "Cache reads were 95% of the 1.8 billion tokens but only 30% of the bill. Fresh cache writes were 53%."
    - "What broke: 1,363 bad tags, an overloaded database, and fields on about 3,200 items overwritten. All fixed that night."
  image: "/media/previews/the-library-fleet.webp"
  alt: "Bar chart of dollars per minute through the evening: gold Opus bars under $21 a minute, then coral Fable bars spiking to $73 a minute, with the weekly meter marked at 54%, 82% and 94%"
---

My private media library is where everything my AI agents make gets filed for me to look at. By Tuesday evening it held 72,670 files, tens of thousands of them scaffolding (pictures agents made so other agents could check their work), and none were tagged by what's in them. My weekly Claude usage limit was resetting in an hour and a half with plenty left. So I asked Claude to be the orchestrator, an agent that plans a job and hands it out, and to do none of the work itself.

**In 80 minutes it ran 62 cloud sessions, which started at least 425 helper agents of their own, and burned through $1,186 worth of tokens at API prices.** A cloud session is a full Claude Code agent on its own computer in the cloud. API prices are what those tokens would cost if I paid per token instead of my $200 a month plan. Almost half of it, about $563, went in the 10 minutes when [Fable 5.2](/ledger/a-week-with-fable-5-2/), Anthropic's model above Opus 5.5, joined in. That's when my weekly meter jumped from 54% to 82%.

- **It came in waves.** Data workers, page builders, 13 gem hunters (sessions that pick my best pieces), 8 sessions tagging images by eye, then the Fable 5.2 wave, with 39 cloud sessions open at the peak.
- **I kept changing the plan while it ran,** and each ask became new sessions or helpers within minutes.
- **Three things broke, and all were fixed that evening.** 1,363 wrong tags from a cheap vision model, fields overwritten on about 3,200 items, and a database the crowd overloaded.
- **The trash pile had real work in it.** The rescue passes pulled 2,018 real pieces out of the cleanup proposal.
- **Spend per minute jumped when Fable joined, from more helpers per session and Fable's higher price.** Three meter readings can't show how the plan weighs Fable against Opus.
- **The cache did most of the work for under a third of the bill,** 95% of the tokens and 30% of the cost.

<figure class="flush"><img class="fill soft" src="/media/the-library-fleet/spend-per-minute.webp" alt="Bar chart of dollars per minute at API prices from 8:36 to 9:56 pm. Gold Opus 5.5 bars climb to about $20 a minute by 9:22. Coral Fable 5.2 bars stack on top from 9:25, peak at $73 a minute at 9:33 and stop at 9:35, $563 in those 10 minutes. Dashed lines mark the weekly meter at 54% at 9:25, 82% at 9:35 when the Fable limit hit, and 94% at 9:45" loading="lazy"><figcaption>The whole evening, a column a minute, in dollars at API prices. Each cloud session's total is exact, but how it splits by minute is estimated from its checkpoints.</figcaption></figure>

## How it ran

The library is part of my command center, the private dashboard my agents post to. It's the same one whose database [hit Cloudflare's free limit](/ledger/d1-free-tier-cutoff/) in October. It held 57.9k images, 4.1k videos and 8.8k audio files.

The orchestrator started helpers inside its own session (subagents, which share its computer) and cloud sessions, which each get their own. 36 sessions ran Opus 5.5 and 26 ran Fable 5.2. 29 were ultracode sessions. Ultracode is a keyword that tells Claude Code to hand every task to a crowd of helper agents, cost no object. I asked for it at 9:19, and the orchestrator's prompts told each of those sessions to fan out to 8 or more helpers.

<ao-runs>
<table>
<thead><tr><th>Agent</th><th>Phase</th><th>Start</th><th>End</th></tr></thead>
<tbody>
<tr><td>The orchestrator</td><td>Orchestrator</td><td>20:36:56</td><td>21:53:42</td></tr>
<tr><td>Fill missing thumbnails and previews</td><td>Helpers in the main session</td><td>20:43:02</td><td>21:35:33</td></tr>
<tr><td>Curate music and finished films</td><td>Helpers in the main session</td><td>20:43:04</td><td>20:56:37</td></tr>
<tr><td>Find throwaway media, build a cleanup proposal</td><td>Helpers in the main session</td><td>20:43:05</td><td>20:55:28</td></tr>
<tr><td>Vision-tag every image</td><td>Helpers in the main session</td><td>20:43:32</td><td>21:32:42</td></tr>
<tr><td>Build version families and keep suggestions</td><td>Helpers in the main session</td><td>20:57:39</td><td>21:21:31</td></tr>
<tr><td>Tag my characters across the library</td><td>Helpers in the main session</td><td>21:00:13</td><td>21:43:45</td></tr>
<tr><td>Check cleanup groups 1-28, then merge</td><td>Helpers in the main session</td><td>21:00:13</td><td>21:09:14</td></tr>
<tr><td>Check cleanup groups 57-84</td><td>Helpers in the main session</td><td>21:00:14</td><td>21:05:13</td></tr>
<tr><td>Check cleanup groups 29-56</td><td>Helpers in the main session</td><td>21:00:14</td><td>21:05:03</td></tr>
<tr><td>Check cleanup groups 85-112</td><td>Helpers in the main session</td><td>21:00:31</td><td>21:06:28</td></tr>
<tr><td>Write the library vision doc from my words</td><td>Helpers in the main session</td><td>21:02:12</td><td>21:05:36</td></tr>
<tr><td>Map character worlds, episodes and variants</td><td>Helpers in the main session</td><td>21:04:50</td><td>21:15:52</td></tr>
<tr><td>Lift the library write cap and deploy</td><td>Helpers in the main session</td><td>21:11:04</td><td>21:12:58</td></tr>
<tr><td>Find and file the full Episode 1 and 2 films</td><td>Helpers in the main session</td><td>21:11:04</td><td>21:18:12</td></tr>
<tr><td>Ship the new library pages</td><td>Helpers in the main session</td><td>21:19:09</td><td>21:53:40</td></tr>
<tr><td>Repair fields overwritten that evening</td><td>Helpers in the main session</td><td>21:23:12</td><td>21:37:51</td></tr>
<tr><td>Apply the rescues to the cleanup proposal</td><td>Helpers in the main session</td><td>21:37:41</td><td>21:52:45</td></tr>
<tr><td>Designer: file it where it is made</td><td>Design workflow in the main session</td><td>21:12:34</td><td>21:18:23</td></tr>
<tr><td>Designer: a pipeline on arrival</td><td>Design workflow in the main session</td><td>21:12:35</td><td>21:19:38</td></tr>
<tr><td>Designer: a steward agent</td><td>Design workflow in the main session</td><td>21:19:56</td><td>21:24:42</td></tr>
<tr><td>Designer: a layered mix</td><td>Design workflow in the main session</td><td>21:21:30</td><td>21:28:29</td></tr>
<tr><td>Judge: what I would want</td><td>Design workflow in the main session</td><td>21:30:07</td><td>21:31:25</td></tr>
<tr><td>Judge: the engineer</td><td>Design workflow in the main session</td><td>21:30:11</td><td>21:33:44</td></tr>
<tr><td>Synthesis of the designs</td><td>Design workflow in the main session</td><td>21:34:42</td><td>21:39:10</td></tr>
<tr><td>Gallery, and putting it all together</td><td>Page builders, Opus</td><td>20:44:49</td><td>21:44:54</td></tr>
<tr><td>Theatre mode and music player</td><td>Page builders, Opus</td><td>20:44:50</td><td>20:57:35</td></tr>
<tr><td>One-tap clean up page</td><td>Page builders, Opus</td><td>20:44:52</td><td>20:52:56</td></tr>
<tr><td>Versions side by side, keep with a reason</td><td>Page builders, Opus</td><td>20:57:35</td><td>21:12:52</td></tr>
<tr><td>Rooms: characters, courses, everything</td><td>Page builders, Opus</td><td>20:58:58</td><td>21:51:47</td></tr>
<tr><td>Gem hunt: Evening Television, part 1</td><td>Gem hunters, Opus</td><td>20:55:32</td><td>21:23:27</td></tr>
<tr><td>Gem hunt: Evening Television, part 2</td><td>Gem hunters, Opus</td><td>20:55:34</td><td>21:22:12</td></tr>
<tr><td>Gem hunt: blog posts</td><td>Gem hunters, Opus</td><td>20:55:35</td><td>21:23:31</td></tr>
<tr><td>Gem hunt: Storm Bell Fighter</td><td>Gem hunters, Opus</td><td>20:55:37</td><td>21:23:42</td></tr>
<tr><td>Gem hunt: the Megabonk Jefrie mod</td><td>Gem hunters, Opus</td><td>20:55:39</td><td>21:20:42</td></tr>
<tr><td>Gem hunt: Blackwater and old games</td><td>Gem hunters, Opus</td><td>20:55:41</td><td>21:25:10</td></tr>
<tr><td>Gem hunt: wallpapers and oil paintings</td><td>Gem hunters, Opus</td><td>20:55:42</td><td>21:24:30</td></tr>
<tr><td>Gem hunt: Hidden Curriculum and more</td><td>Gem hunters, Opus</td><td>20:55:44</td><td>21:23:17</td></tr>
<tr><td>Gem hunt: Earthlight and Crimson Coil</td><td>Gem hunters, Opus</td><td>20:55:45</td><td>21:24:18</td></tr>
<tr><td>Gem hunt: Moonlight and model tests</td><td>Gem hunters, Opus</td><td>20:55:47</td><td>21:24:38</td></tr>
<tr><td>Gem hunt: Jefrie, BloodTailor and characters</td><td>Gem hunters, Opus</td><td>20:55:49</td><td>21:25:44</td></tr>
<tr><td>Gem hunt: seven mid-size projects</td><td>Gem hunters, Opus</td><td>20:55:50</td><td>21:24:12</td></tr>
<tr><td>Gem hunt: fifteen small projects</td><td>Gem hunters, Opus</td><td>20:55:52</td><td>21:23:42</td></tr>
<tr><td>Claude eyes: images, part 1</td><td>Claude eyes on images, Opus</td><td>21:03:51</td><td>21:31:13</td></tr>
<tr><td>Claude eyes: images, part 2</td><td>Claude eyes on images, Opus</td><td>21:03:53</td><td>21:26:39</td></tr>
<tr><td>Claude eyes: images, part 3</td><td>Claude eyes on images, Opus</td><td>21:03:54</td><td>21:56:06</td></tr>
<tr><td>Claude eyes: images, part 4</td><td>Claude eyes on images, Opus</td><td>21:03:56</td><td>21:37:19</td></tr>
<tr><td>Claude eyes: images, part 5</td><td>Claude eyes on images, Opus</td><td>21:03:58</td><td>21:37:21</td></tr>
<tr><td>Claude eyes: images, part 6</td><td>Claude eyes on images, Opus</td><td>21:03:59</td><td>21:52:32</td></tr>
<tr><td>Claude eyes: images, part 7</td><td>Claude eyes on images, Opus</td><td>21:04:01</td><td>21:27:19</td></tr>
<tr><td>Claude eyes: images, part 8</td><td>Claude eyes on images, Opus</td><td>21:04:03</td><td>21:37:20</td></tr>
<tr><td>Album: made by me</td><td>Albums, Opus</td><td>21:10:12</td><td>21:29:26</td></tr>
<tr><td>Albums: Evening Television highlights, extras, fan art</td><td>Albums, Opus</td><td>21:10:14</td><td>21:23:31</td></tr>
<tr><td>Wow room: Evening Television living room</td><td>Wow rooms, Opus</td><td>21:18:45</td><td>21:35:27</td></tr>
<tr><td>Wow room: a character world</td><td>Wow rooms, Opus</td><td>21:18:47</td><td>21:32:07</td></tr>
<tr><td>Wow room: my studio</td><td>Wow rooms, Opus</td><td>21:18:49</td><td>21:31:39</td></tr>
<tr><td>Wow room: Moonlight at the Waterline</td><td>Wow rooms, Opus</td><td>21:18:50</td><td>21:34:55</td></tr>
<tr><td>Claude eyes: videos, part 1</td><td>Claude eyes on videos, Opus</td><td>21:21:17</td><td>21:39:35</td></tr>
<tr><td>Claude eyes: videos, part 2</td><td>Claude eyes on videos, Opus</td><td>21:21:18</td><td>21:37:08</td></tr>
<tr><td>Claude eyes: videos, part 3</td><td>Claude eyes on videos, Opus</td><td>21:21:20</td><td>21:34:52</td></tr>
<tr><td>Claude eyes: videos, part 4</td><td>Claude eyes on videos, Opus</td><td>21:21:22</td><td>21:34:53</td></tr>
<tr><td>Fable co-orchestrator</td><td>Fable co-orchestrator</td><td>21:13:16</td><td>21:42:27</td></tr>
<tr><td>Rescue pass 1</td><td>Rescue passes, Fable then Opus</td><td>21:25:41</td><td>21:34:12</td></tr>
<tr><td>Rescue pass 2</td><td>Rescue passes, Fable then Opus</td><td>21:25:43</td><td>21:44:40</td></tr>
<tr><td>Rescue pass 3</td><td>Rescue passes, Fable then Opus</td><td>21:25:44</td><td>21:48:46</td></tr>
<tr><td>Rescue pass 4</td><td>Rescue passes, Fable then Opus</td><td>21:25:46</td><td>21:43:47</td></tr>
<tr><td>Rescue pass 5</td><td>Rescue passes, Fable then Opus</td><td>21:25:47</td><td>21:44:04</td></tr>
<tr><td>Rescue pass 6</td><td>Rescue passes, Fable then Opus</td><td>21:25:49</td><td>21:52:41</td></tr>
<tr><td>Rescue pass 7</td><td>Rescue passes, Fable then Opus</td><td>21:25:51</td><td>21:56:57</td></tr>
<tr><td>Rescue pass 8</td><td>Rescue passes, Fable then Opus</td><td>21:25:53</td><td>21:42:54</td></tr>
<tr><td>Dashboard reliability and hardening</td><td>Checks, review and tests, Fable</td><td>21:28:19</td><td>21:32:47</td></tr>
<tr><td>Review what shipped that evening</td><td>Checks, review and tests, Fable</td><td>21:28:21</td><td>21:35:17</td></tr>
<tr><td>End-to-end tests for the new rooms</td><td>Checks, review and tests, Fable</td><td>21:28:22</td><td>21:48:55</td></tr>
<tr><td>Check character tags: Jefrie, half 1</td><td>Checks, review and tests, Fable</td><td>21:29:58</td><td>21:35:16</td></tr>
<tr><td>Check character tags: Jefrie, half 2</td><td>Checks, review and tests, Fable</td><td>21:30:00</td><td>21:35:23</td></tr>
<tr><td>Check character tags: BloodTailor, Yusef and more</td><td>Checks, review and tests, Fable</td><td>21:30:01</td><td>21:35:08</td></tr>
<tr><td>Check character tags: Echo, Ichigo and more</td><td>Checks, review and tests, Fable</td><td>21:30:03</td><td>21:47:37</td></tr>
<tr><td>Check character tags: Evening Television cast and Bad. Very Bad.</td><td>Checks, review and tests, Fable</td><td>21:30:05</td><td>21:50:52</td></tr>
<tr><td>Check titles by eye, part 1</td><td>Checks, review and tests, Fable</td><td>21:32:26</td><td>21:46:03</td></tr>
<tr><td>Check titles by eye, part 2</td><td>Checks, review and tests, Fable</td><td>21:32:28</td><td>21:47:38</td></tr>
<tr><td>Check titles by eye, part 3</td><td>Checks, review and tests, Fable</td><td>21:32:29</td><td>21:53:02</td></tr>
<tr><td>Check titles by eye, part 4</td><td>Checks, review and tests, Fable</td><td>21:32:31</td><td>21:35:37</td></tr>
<tr><td>Check version families by eye</td><td>Checks, review and tests, Fable</td><td>21:32:33</td><td>21:35:35</td></tr>
<tr><td>Fable Wow room: the candy shop</td><td>Wow rooms, Fable</td><td>21:31:14</td><td>21:35:43</td></tr>
<tr><td>Fable Wow room: the oil painting museum</td><td>Wow rooms, Fable</td><td>21:31:15</td><td>21:37:18</td></tr>
<tr><td>Fable Wow room: the listening room</td><td>Wow rooms, Fable</td><td>21:31:17</td><td>21:36:56</td></tr>
<tr><td>Fable Wow room: Echo's bell tower</td><td>Wow rooms, Fable</td><td>21:31:19</td><td>21:36:26</td></tr>
</tbody>
</table>
<figcaption><b>Every session and helper on one clock, 8:36 to 9:56 pm</b><span class="ao-meta">87 bars: the orchestrator, its 24 helpers and 62 cloud sessions, on a 24-hour clock (20:36 is 8:36 pm). The 425 or more helpers inside the cloud sessions aren't drawn. Rescue passes ran on Fable until its limit, then six were moved to Opus. Sessions stopped by the Fable limit are drawn to their last error, but spent nothing after 9:35. Colors only tell the phases apart.</span></figcaption>
</ao-runs>

## How the evening went

<ao-timeline lanes="a:Me|o:Orchestrator|f:Cloud sessions|m:Weekly meter">
<ol>
<li data-lane="a"><time>8:36 pm</time><p>I ask for the library tagged, tidied and made into <q>a place that I love to be</q> by 10 pm. <q>don't do any of the work yourself</q></p></li>
<li data-lane="a"><time>8:48 pm</time><p><q>I give you unlimited database budget.</q> The dashboard's own daily cap on agent writes still stops it.</p></li>
<li data-lane="a"><time>8:53 pm</time><p>Over the next quarter hour I add asks: versions side by side, rooms, characters grouped by world, albums that don't flood my feed.</p></li>
<li data-lane="f"><time>8:55 pm</time><p>13 gem hunters start. Between them they look at about 12,000 thumbnails and post 259 picks.</p></li>
<li data-lane="o"><time>8:56 pm</time><p>The vision tagger's Gemini credit runs out. Around then, a cheap model it sends 100 images at a time starts giving one answer for many of them.</p></li>
<li data-lane="f"><time>9:03 pm</time><p>Eight "Claude eyes" sessions start tagging images by looking at them.</p></li>
<li data-lane="o"><time>9:07 pm</time><p>Its computer restarts. It picks its helpers back up from their transcripts.</p></li>
<li data-lane="o"><time>9:09 pm</time><p>Four skeptic helpers cut the cleanup proposal from 34,588 items to 29,460. The "junk" held finished lesson videos, music videos, canon art and 3D rigs.</p></li>
<li data-lane="a"><time>9:09 pm</time><p><q>lift the library write cap ... and deploy it</q> Live at 9:12.</p></li>
<li data-lane="a"><time>9:11 pm</time><p>I ask for a Fable 5.2 session to work beside it.</p></li>
<li data-lane="a"><time>9:17 pm</time><p>I ask for "Wow rooms", bespoke pages for my favorite projects.</p></li>
<li data-lane="a"><time>9:19 pm</time><p>I ask it to use more helpers per session: ultracode.</p></li>
<li data-lane="a"><time>9:22 pm</time><p>The dashboard shows me Error 1101, Cloudflare's crash page.</p></li>
<li data-lane="o"><time>9:23 pm</time><p>It finds the code that files new items overwriting who made them and which project they belong to, on about 3,200 items.</p></li>
<li data-lane="m"><time>9:25 pm</time><p>54% of the weekly limit used.</p></li>
<li data-lane="a"><time>9:25 pm</time><p>I switch the orchestrator itself to Fable 5.2.</p></li>
<li data-lane="f"><time>9:25 pm</time><p>Eight Fable rescue passes start on the 29,460 items marked for cleanup.</p></li>
<li data-lane="o"><time>9:25 pm</time><p>The new library goes live.</p></li>
<li data-lane="f"><time>9:28 pm</time><p>17 more Fable sessions in four minutes: checks, a review, tests, a reliability fix and four more Wow rooms.</p></li>
<li data-lane="f"><time>9:32 pm</time><p>39 cloud sessions open at once, 40 with the orchestrator, the peak.</p></li>
<li data-lane="a"><time>9:35 pm</time><p>I turn down three more Wow rooms and tell it to slow down.</p></li>
<li data-lane="m"><time>9:35 pm</time><p>82% weekly, 92% of the Fable allowance. The Fable limit stops at least 22 of the 26 Fable sessions mid-job.</p></li>
<li data-lane="o"><time>9:36 pm</time><p>A fix goes live so the dashboard answers busy instead of crashing. No more 1101s.</p></li>
<li data-lane="a"><time>9:36 pm</time><p>I switch the orchestrator back to Opus.</p></li>
<li data-lane="a"><time>9:40 pm</time><p>I move six stopped rescue passes onto Opus 5.5 myself.</p></li>
<li data-lane="m"><time>9:45 pm</time><p>94%. <q>okay you are at 94% now, you can wrap up</q></p></li>
<li data-lane="o"><time>9:52 pm</time><p>An in-page image viewer goes live, after I complained that clicking a picture lost my place.</p></li>
<li data-lane="f"><time>9:56 pm</time><p>The last cloud session finishes.</p></li>
</ol>
</ao-timeline>

## What broke, and how it was caught

- **A cheap model repeated itself.** Around when its Gemini credit ran out, the vision tagger sent a cheap model 100 images per request, and it gave many of them one description. 1,363 wrong tags, all repaired.
- **The crowd overloaded the database.** About 45 agents caused about 2,200 "overloaded" errors from 9:15 to 9:30, which was my Error 1101 page. The fix answers "busy, try again" instead of crashing, retries reads and caches thumbnails.
- **A bug overwrote who made things and which project they belong to,** on about 3,200 existing items. A repair helper put them back, and a check of all 72,684 items found 0 differences.
- **Approvals don't pass through agents.** Claude Code's permission check wouldn't lift the write cap on the orchestrator's word, only when I typed it myself. One cloud session waited until I approved it.
- **Fable ran out.** It has its own allowance, up to half the weekly limit. The limit stopped at least 22 of the 26 Fable sessions mid-job. I moved six rescue passes to Opus and they finished. The other 16 ended there, including the check of version families (every take of one piece, grouped) with all 18 of its helpers.

## What it built

- **A new library** with a gallery, rooms, versions side by side with a reason to keep each, a theatre for films and music, four Wow rooms and an image viewer.
- **Tags.** About 19,131 items from the vision tagger, about 20,600 images tagged by eye, and more than 7,000 character tags.
- **A cleanup proposal** of 26,951 scaffolding items in 76 groups, waiting for my one tap.
- **About 130 albums**, 8 of them my own hand-drawn and self-generated work, 1,329 version families, and the full Episode 1 film filed.
- **A plan** for keeping it tidy while agents keep adding to it.

## What it cost

**$1,185.63 at API prices**, $14.79 a minute. The cloud sessions spent $1,048.32 and the main session $137.31. Opus 5.5 was $731.25 and Fable 5.2 $454.13, plus 25 cents of Sonnet 5.5, a cheaper Claude model one video tagger used. I didn't pay that. It all ran on my plan, where the real cost is a share of the weekly limit.

<ao-bars unit="dollars">
<table>
<thead><tr><th>Group</th><th>Opus 5.5</th><th>Fable 5.2</th></tr></thead>
<tbody>
<tr><td>Rescue passes (8)</td><td>128.17</td><td>251.88</td></tr>
<tr><td>Claude eyes on images (8)</td><td>208.5</td><td></td></tr>
<tr><td>Checks, review and tests (13)</td><td>1.72</td><td>161.25</td></tr>
<tr><td>Gem hunters (13)</td><td>130.72</td><td></td></tr>
<tr><td>Helpers in the main session (17)</td><td>73.84</td><td></td></tr>
<tr><td>Claude eyes on videos (4)</td><td>58.05</td><td></td></tr>
<tr><td>The orchestrator</td><td>36.16</td><td>12.68</td></tr>
<tr><td>Page builders (5)</td><td>44.95</td><td></td></tr>
<tr><td>Wow rooms on Opus (4)</td><td>22.72</td><td></td></tr>
<tr><td>Wow rooms on Fable (4)</td><td></td><td>18.72</td></tr>
<tr><td>Design workflow (7)</td><td>14.63</td><td></td></tr>
<tr><td>Albums (2)</td><td>11.79</td><td></td></tr>
<tr><td>Fable co-orchestrator</td><td></td><td>9.61</td></tr>
</tbody>
</table>
<figcaption><b>Where the $1,186 went, by group</b><span class="ao-meta">API-equivalent dollars, with how many sessions or helpers each group had. The video taggers' 25 cents of Sonnet 5.5 isn't drawn.</span></figcaption>
</ao-bars>

Three rescue passes were the most expensive sessions, $65 to $75 each, then the orchestrator at $48.84. Two things aren't counted: one session of my own that ran on the same account during the Fable wave, and writing this post, which had cost another $22.13 when these numbers were pulled. My [Playback Lens](/ledger/reading-my-own-agents/) only reads transcripts on its own computer, so it saw just the main session. The cloud sessions' numbers come from the token use each one reports.

<details><summary>Every session and helper, most expensive first</summary>

| Who | Model | Started | Minutes | API-equivalent |
|---|---|---|---|---|
| Rescue pass 6 | Fable 5.2 and Opus 5.5 | 9:25 | 27 | $74.98 |
| Rescue pass 8 | Fable 5.2 and Opus 5.5 | 9:25 | 17 | $71.19 |
| Rescue pass 3 | Fable 5.2 and Opus 5.5 | 9:25 | 23 | $65.12 |
| The orchestrator | Opus 5.5, briefly Fable 5.2 | 8:36 | 77 | $48.84 |
| Rescue pass 4 | Fable 5.2 and Opus 5.5 | 9:25 | 18 | $47.89 |
| Rescue pass 5 | Fable 5.2 and Opus 5.5 | 9:25 | 18 | $40.19 |
| Rescue pass 2 | Fable 5.2 | 9:25 | 19 | $33.89 |
| Claude eyes: images, part 3 | Opus 5.5 | 9:03 | 52 | $30.04 |
| Rescue pass 7 | Fable 5.2 and Opus 5.5 | 9:25 | 31 | $29.69 |
| Claude eyes: images, part 8 | Opus 5.5 | 9:04 | 33 | $28.86 |
| Claude eyes: images, part 4 | Opus 5.5 | 9:03 | 33 | $28.84 |
| Claude eyes: images, part 5 | Opus 5.5 | 9:03 | 33 | $27.23 |
| Review what shipped that evening | Fable 5.2 | 9:28 | 7 | $27.17 |
| Claude eyes: images, part 1 | Opus 5.5 | 9:03 | 27 | $26.21 |
| Claude eyes: images, part 6 | Opus 5.5 | 9:03 | 48 | $24.45 |
| Gallery, and putting it all together | Opus 5.5 | 8:44 | 60 | $23.46 |
| Check character tags: Evening Television cast and Bad. Very Bad. | Fable 5.2 | 9:30 | 21 | $22.59 |
| Claude eyes: images, part 2 | Opus 5.5 | 9:03 | 23 | $21.72 |
| End-to-end tests for the new rooms | Fable 5.2 | 9:28 | 20 | $21.67 |
| Claude eyes: images, part 7 | Opus 5.5 | 9:04 | 23 | $21.14 |
| Check character tags: Echo, Ichigo and more | Fable 5.2 | 9:30 | 18 | $17.14 |
| Rescue pass 1 | Fable 5.2 | 9:25 | 8 | $17.09 |
| Claude eyes: videos, part 4 | Opus 5.5 and Sonnet 5.5 | 9:21 | 14 | $16.81 |
| Claude eyes: videos, part 3 | Opus 5.5 | 9:21 | 14 | $16.26 |
| Check character tags: Jefrie, half 2 | Fable 5.2 | 9:30 | 5 | $15.67 |
| Check titles by eye, part 3 | Fable 5.2 | 9:32 | 20 | $15.54 |
| Check titles by eye, part 2 | Fable 5.2 | 9:32 | 15 | $14.26 |
| Check titles by eye, part 1 | Fable 5.2 | 9:32 | 14 | $13.73 |
| Claude eyes: videos, part 1 | Opus 5.5 | 9:21 | 18 | $13.43 |
| Gem hunt: Jefrie, BloodTailor and characters | Opus 5.5 | 8:55 | 30 | $12.93 |
| Gem hunt: Earthlight and Crimson Coil | Opus 5.5 | 8:55 | 28 | $12.09 |
| Gem hunt: Evening Television, part 1 | Opus 5.5 | 8:55 | 28 | $11.84 |
| Claude eyes: videos, part 2 | Opus 5.5 | 9:21 | 16 | $11.80 |
| Gem hunt: Moonlight and model tests | Opus 5.5 | 8:55 | 29 | $11.21 |
| Tag my characters across the library | Opus 5.5 | 9:00 | 44 | $11.00 |
| Vision-tag every image | Opus 5.5 | 8:43 | 49 | $10.97 |
| Gem hunt: blog posts | Opus 5.5 | 8:55 | 28 | $10.77 |
| Gem hunt: seven mid-size projects | Opus 5.5 | 8:55 | 28 | $10.16 |
| Gem hunt: Storm Bell Fighter | Opus 5.5 | 8:55 | 28 | $10.07 |
| Gem hunt: wallpapers and oil paintings | Opus 5.5 | 8:55 | 29 | $10.04 |
| Rooms: characters, courses, everything | Opus 5.5 | 8:58 | 53 | $10.04 |
| Gem hunt: Evening Television, part 2 | Opus 5.5 | 8:55 | 27 | $9.96 |
| Fable co-orchestrator | Fable 5.2 | 9:13 | 29 | $9.61 |
| Gem hunt: fifteen small projects | Opus 5.5 | 8:55 | 28 | $9.10 |
| Gem hunt: Blackwater and old games | Opus 5.5 | 8:55 | 30 | $9.00 |
| Albums: Evening Television highlights, extras, fan art | Opus 5.5 | 9:10 | 13 | $8.78 |
| Gem hunt: Hidden Curriculum and more | Opus 5.5 | 8:55 | 28 | $8.59 |
| Build version families and keep suggestions | Opus 5.5 | 8:57 | 24 | $7.10 |
| Fill missing thumbnails and previews | Opus 5.5 | 8:43 | 52 | $7.08 |
| Dashboard reliability and hardening | Fable 5.2 and Opus 5.5 | 9:28 | 4 | $6.92 |
| Wow room: my studio | Opus 5.5 | 9:18 | 13 | $6.22 |
| Wow room: Moonlight at the Waterline | Opus 5.5 | 9:18 | 16 | $5.92 |
| Ship the new library pages | Opus 5.5 | 9:19 | 34 | $5.69 |
| Fable Wow room: Echo's bell tower | Fable 5.2 | 9:31 | 5 | $5.45 |
| Wow room: a character world | Opus 5.5 | 9:18 | 13 | $5.32 |
| Wow room: Evening Television living room | Opus 5.5 | 9:18 | 17 | $5.27 |
| Curate music and finished films | Opus 5.5 | 8:43 | 14 | $5.16 |
| Find throwaway media, build a cleanup proposal | Opus 5.5 | 8:43 | 12 | $5.11 |
| Gem hunt: the Megabonk Jefrie mod | Opus 5.5 | 8:55 | 25 | $4.97 |
| Versions side by side, keep with a reason | Opus 5.5 | 8:57 | 15 | $4.60 |
| Fable Wow room: the candy shop | Fable 5.2 | 9:31 | 4 | $4.56 |
| Fable Wow room: the listening room | Fable 5.2 | 9:31 | 6 | $4.37 |
| Fable Wow room: the oil painting museum | Fable 5.2 | 9:31 | 6 | $4.34 |
| Theatre mode and music player | Opus 5.5 | 8:44 | 13 | $4.05 |
| Map character worlds, episodes and variants | Opus 5.5 | 9:04 | 11 | $3.16 |
| Album: made by me | Opus 5.5 | 9:10 | 19 | $3.01 |
| Check titles by eye, part 4 | Fable 5.2 | 9:32 | 3 | $2.93 |
| Check cleanup groups 1-28, then merge | Opus 5.5 | 9:00 | 9 | $2.88 |
| Apply the rescues to the cleanup proposal | Opus 5.5 | 9:37 | 15 | $2.87 |
| One-tap clean up page | Opus 5.5 | 8:44 | 8 | $2.80 |
| Designer: a pipeline on arrival | Opus 5.5 | 9:12 | 7 | $2.62 |
| Designer: file it where it is made | Opus 5.5 | 9:12 | 6 | $2.47 |
| Designer: a layered mix | Opus 5.5 | 9:21 | 7 | $2.37 |
| Repair fields overwritten that evening | Opus 5.5 | 9:23 | 15 | $2.34 |
| Synthesis of the designs | Opus 5.5 | 9:34 | 4 | $2.27 |
| Find and file the full Episode 1 and 2 films | Opus 5.5 | 9:11 | 7 | $2.24 |
| Check cleanup groups 85-112 | Opus 5.5 | 9:00 | 6 | $2.20 |
| Check cleanup groups 57-84 | Opus 5.5 | 9:00 | 5 | $2.13 |
| Designer: a steward agent | Opus 5.5 | 9:19 | 5 | $2.05 |
| Check character tags: BloodTailor, Yusef and more | Fable 5.2 | 9:30 | 5 | $1.92 |
| Check cleanup groups 29-56 | Opus 5.5 | 9:00 | 5 | $1.90 |
| Check version families by eye | Fable 5.2 | 9:32 | 3 | $1.83 |
| Judge: the engineer | Opus 5.5 | 9:30 | 4 | $1.81 |
| Check character tags: Jefrie, half 1 | Fable 5.2 | 9:29 | 5 | $1.60 |
| Write the library vision doc from my words | Opus 5.5 | 9:02 | 3 | $1.18 |
| Judge: what I would want | Opus 5.5 | 9:30 | 1 | $1.04 |
| Lift the library write cap and deploy | Opus 5.5 | 9:11 | 2 | $0.83 |

"Started" is pm, my time. Rescue passes ran on Fable 5.2 until its limit, and the ones I moved carried on with Opus 5.5.

</details>

## What the cache did to the bill

Every step, an agent re-reads its whole conversation so far, mostly from a cache. A cache read costs a twentieth of the normal input price on Opus. A cache write, storing new context to re-read later, costs more than plain input.

<ao-bars unit="%">
<table>
<thead><tr><th>Kind of token</th><th>Share of tokens</th><th>Share of the bill</th></tr></thead>
<tbody>
<tr><td>Cache reads</td><td>95.15</td><td>29.5</td></tr>
<tr><td>Cache writes</td><td>4.38</td><td>53</td></tr>
<tr><td>Output</td><td>0.45</td><td>17.5</td></tr>
<tr><td>Fresh input</td><td>0.01</td><td>0.1</td></tr>
</tbody>
</table>
<figcaption><b>1.84 billion tokens, and what each kind cost</b><span class="ao-meta">Cache reads: 1.75 billion tokens, $349.47. Cache writes: 80.4 million, $627.61. Output: 8.35 million, $207.49. Fresh input: 256 thousand, $1.06.</span></figcaption>
</ao-bars>

Billed as fresh input, those re-reads would have cost $7,918 instead of $349. Cache writes were the biggest part, 53%, probably mostly short-lived helpers storing their context from scratch. Over [16 weeks of my normal use](/ledger/what-drives-claude-code-cost/), cache reads were the biggest part.

## Why spend jumped when Fable joined

What I saw live was dozens of Opus sessions with the meter barely moving, then the Fable sessions came in and it raced.

| Stretch | API-equivalent | Per minute | Meter |
|---|---|---|---|
| 8:36 to 9:13, Opus | $228 | $6 | not read |
| 9:13 to 9:25, nearly all Opus | $215 | $17 | 54% at 9:25 |
| 9:25 to 9:35, Fable wave | $563 | $56 | 54% to 82% |
| 9:35 to 9:45, Opus | $130 | $13 | 82% to 94% |

Each cloud session's total is exact, but how it splits by minute is estimated from its checkpoints.

Spend per minute in the Fable wave was 9 times the slow start, but only about 3 times the Opus minutes just before it (9:19 to 9:25). Against those, tokens a minute rose 1.2 times, a pricier mix of tokens 1.6 times (more cache writes and output, probably from short-lived helpers) and Fable's price 1.5 times. 25 of the 26 Fable sessions were ultracode, with 13.2 helpers each on average against 4.1 for the Opus ones.

So helpers per session mattered about as much as the model. The rescue passes, with about 27 helpers each, spent $3.21 per session-minute (spend divided by minutes open) on Fable and $2.32 after six moved to Opus. The Opus gem hunters, with about 3 helpers each, spent $0.36.

Three meter readings can't show how the plan weighs Fable against Opus. If anything, an Opus dollar moved it more: about 5 points per $100 in the wave, about 9 in the Opus minutes after. But the readings are whole percents off my screen, the meter's lag is unknown, both readings include my use from earlier in the week, and one session of my own ran during the wave. The plan goes by the model's name in one place, Fable's own allowance, and hitting that stopped the wave.

Switching the orchestrator's model cost about $13 by itself. A prompt cache belongs to one model, so its first Fable request wrote its 506,099-token conversation to the cache again ($8.35), and its first Opus request after rewrote nearly all of its own ($4.80).

## What I'd do differently

- **Watch helpers per session, not just the model.** Big fan-outs raised the cost per minute about as much as Fable's price did.
- **Don't switch the orchestrator's model mid-job.** That's about $13 just to cache its conversation again.
- **Give the database retries before 45 agents hit it,** not after the error page.
- **Spot-check cheap models that work in batches.** One answer copied across many images looks fine until you look.
- **Stay near the keyboard.** Permission changes and deploys wait for me, not the orchestrator.
- **Plan for the Fable allowance.** When it runs out, sessions stop mid-job, helpers and all.

<details><summary>The prices and the arithmetic</summary>

API-equivalent cost is each agent's tokens times Anthropic's list price per million tokens. The 5-minute cache write is 1.25 times the input price and the 1-hour one 2 times.

| Model | Input | Output | Cache read | Cache write, 5 min | Cache write, 1 hour |
|---|---|---|---|---|---|
| Opus 5.5 | $4 | $20 | $0.20 | $5 | $8 |
| Fable 5.2 | $8 | $40 | $0.20 | $10 | $16 |
| Sonnet 5.5 | $2 | $10 | $0.10 | $2.50 | $4 |

| Model | Cache reads | Cache writes, 5 min | Cache writes, 1 hour | Output | Input | Cost |
|---|---|---|---|---|---|---|
| Opus 5.5 | 1,515,093,187 | 33,082,834 | 16,911,245 | 6,326,959 | 246,599 | $731.25 |
| Fable 5.2 | 232,246,065 | 26,420,512 | 3,903,283 | 2,023,787 | 8,915 | $454.13 |
| Sonnet 5.5 | 0 | 99,001 | 0 | 156 | 2 | $0.25 |

Spend per minute in the Fable wave, split into three factors that multiply:

| Factor | Against 8:36 to 9:13 | Against 9:19 to 9:25 |
|---|---|---|
| Tokens a minute | 3.55 | 1.23 |
| Pricier kinds of tokens | 1.63 | 1.62 |
| Fable's price | 1.56 | 1.54 |
| All together | 9.0 | 3.1 |

- Tokens a minute counts every kind. Pricier kinds compares the cost per token at Opus prices, so it measures the mix of cache writes, output and cache reads. Fable's price compares the wave's cost with the same tokens at Opus prices. About half the wave's tokens were Opus, so it's well under Fable's own 1.81.
- The 9:19 to 9:25 minutes cost $122.21, $18.33 a minute, at 41.6 million tokens a minute. The wave was $562.90, $56.20 a minute, at 51.3 million.
- The main session's numbers come from its transcripts, every request counted once. The cloud sessions' come from each session's own cumulative usage record. Recomputed from tokens and prices, they match the $1,048.32 the sessions report to the cent.
- Fable's tokens would have cost $250.29 at Opus prices, so on the same tokens Fable cost 1.81 times as much, not 2. Cache reads cost the same on both.
- Per million tokens handled, Fable cost $1.716 and Opus $0.465. 96.4% of Opus's tokens were cheap cache reads, against 87.8% of Fable's.
- Two small corrections bring the total to $1,185.87: one Fable answer whose last usage figures weren't written to its transcript, and Haiku side requests for things like titles.
- 39 cloud sessions finished, 6 are waiting for my review, 1 is blocked, and 16 failed, all 16 on the Fable limit.

</details>

*Claude wrote this from the orchestrator's transcripts, the cloud sessions' own usage records and my messages that evening.*
