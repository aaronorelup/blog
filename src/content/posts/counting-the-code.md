---
id: "AO-062"
title: "Counting every line of code in my AI projects"
summary: "I had Claude count the code in the 29 projects in my current projects folder. How much there is, which projects are biggest, and why the first count was three times too high."
date: 2026-10-21
topic: "agents"
project: []
preview:
  verdict: "About a million lines"
  takeaway: "My 29 projects hold about 1.03 million lines of code. The first count said 3.1 million because two thirds of it was copies, auto-generated files and other people's code."
  points:
    - "Copies of this blog, mostly ones my agents make to work in, came to 875,824 lines. The site's own code is about 10,500."
    - "A game's testing tool wrote 941 HTML reports, 768,489 lines, nearly ten times the 79,105 lines of the game."
    - "My AI TV series is a fifth of what's left, 205,234 lines across three episodes, most of it Python."
  image: "/media/previews/counting-the-code.webp"
  alt: "A short stack of paper tied with string in front of a faded stack three times taller, a wooden abacus leaning on it"
---

I asked Claude to count all the code in my projects folder. It came to about **1.03 million
lines across 29 projects**, not counting blank lines, comments or tests.

The first count actually said 3.1 million. Two out of every three lines it found weren't real work:

- **Copies of this blog: 875,824 lines.** My agents make a full copy of the site so they can work
  on a post without touching mine. Six were still on disk. Each one carries the games and decks
  the site hosts, and so does mine. The site's own code is only about 10,500 lines.
- **941 test reports from one game: 768,489 lines.** Its test tool saves a web page after every
  run. That's almost ten times the size of the game itself.
- **Other people's code: 244,250 lines.** Libraries and tools I'd copied in to build on.
- **Backups and built files: 185,991 lines.**

So if you ever count your code, look at what's actually in the folders first. A plain count was
off by 3x for me.

## How Claude counted

This is what I typed:

> Could you list all of the projects I have in [my projects folder] that are code based, and
> list them by how many files of code and how many lines of code, not counting comments or
> tests.

One Claude session wrote a 290-line Python script to do the counting. It ran it over the folder,
looked at what came back, and ran it again with the junk taken out. The whole thing took 42
minutes. The first pass alone took 30 of them, mostly reading folders that didn't count.

The script was strict from the start. It only read code files, and it already skipped the usual
folders of downloaded libraries and built files. That still came to 3,104,925 lines in 14,250
files. Here's how it got from there to the real number, one layer at a time:

<ao-funnel unit="lines">
<ol>
<li><b>Lines of code the first scan found</b> <data value="3104925">3,104,925</data> 29 project folders, 14,250 code files. Blank lines, comments, tests and the usual dependency folders were already out.</li>
<li><b>Copies of this blog</b> <data value="-875824">−875,824</data> Six git worktrees: separate checkouts that sessions make so they can work on a post without touching my copy. Each carries the games, decks and labs the site hosts.<ul><li>blog-context-window: 142,167 lines</li><li>Four more at 124,000 to 125,000 each</li><li>blog-crimson-yt: 118,455</li><li>The hosted pages in my own copy: 116,441</li></ul></li>
<li><b>Test reports a game wrote</b> <data value="-768489">−768,489</data> Blackwater Godot's test framework writes an HTML report for every run, and HTML counts as code. 941 runs, one folder each.</li>
<li><b>Other people's code</b> <data value="-244250">−244,250</data> Copied into my folders to build on.<ul><li>Two copies of alice's Claude Paint simulator</li><li>Decompiled game source and a mod maker inside a MEGABONK mod</li><li>The three.js library inside a racing game: 30,122</li><li>The gdUnit4 test framework: 18,571</li></ul></li>
<li><b>Backups, publish copies and built bundles</b> <data value="-185991">−185,991</data> The course's copy of the blog it publishes to, old takes of lessons, a wallpaper app's snapshot and built bundles, a render's temp folder.</li>
</ol>
<figcaption><b>From 3.1 million lines to 1.03 million</b><span class="ao-meta">Scan of 20 Oct 2026, 23:36 to 00:10. Each layer is the difference between the first and second pass, folder by folder. What's left: 1,030,371 lines in 6,645 files.</span></figcaption>
</ao-funnel>

In the chart, a worktree is one of those agent copies of the blog. Blackwater Godot is my
cave-diving game [BLACKWATER](/ledger/blackwater-weekend/) rebuilt in the Godot game engine, and
gdUnit4 is the test tool that writes its reports. The other people's code includes alice's Claude
Paint, the oil paint simulator [Claude paints with](/ledger/claude-paints-in-oil/), and the game
Megabonk's own code, copied into [my mod for it](/ledger/modding-megabonk/).

## The biggest projects

The biggest real project is my AI-made TV series,
[I Love My Evening Television](/courses/i-love-my-evening-television/), at 205,234 lines. That's
about a fifth of everything, because every episode builds its own tools. Each episode is a
30-minute film Claude makes, and the count has three of them.
[Crimson Coil](/ledger/crimson-coil/) is 56,167 lines, [Earthlight](/ledger/earthlight/) 72,596
and [Context Window](/ledger/context-window/) 73,442. Most of it is Python.

Here's all of it, by project or by language:

<ao-treemap unit="lines" top="7" views="By project|By language">
<table>
<thead><tr><th>Project</th><th>Python</th><th>JavaScript</th><th>HTML</th><th>GDScript</th><th>C#</th><th>TypeScript</th><th>CSS</th><th>Lua</th><th>C/C++</th><th>Kotlin</th><th>Shell</th><th>PowerShell</th><th>Shader</th><th>Astro</th><th>Batch</th><th>SQL</th></tr></thead>
<tbody>
<tr><td>I Love My Evening Television</td><td>153870</td><td>15090</td><td>2018</td><td></td><td></td><td></td><td></td><td>23837</td><td>9135</td><td></td><td>1019</td><td>199</td><td></td><td></td><td>66</td><td></td></tr>
<tr><td>Gauntlet Test</td><td>4825</td><td>56957</td><td>51889</td><td></td><td></td><td></td><td>2369</td><td></td><td></td><td></td><td>86</td><td>20</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Courses</td><td>18325</td><td>50013</td><td>15430</td><td></td><td></td><td></td><td>704</td><td></td><td></td><td></td><td>73</td><td>28</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Sandbox 2</td><td>52401</td><td>818</td><td>5639</td><td></td><td>11886</td><td></td><td>2096</td><td>7162</td><td></td><td></td><td>1146</td><td>1839</td><td>156</td><td></td><td>5</td><td></td></tr>
<tr><td>Blackwater Godot</td><td>21484</td><td>2507</td><td>680</td><td>48726</td><td></td><td>1918</td><td></td><td></td><td></td><td></td><td>1832</td><td>314</td><td>1642</td><td></td><td>2</td><td></td></tr>
<tr><td>Wallpaper Breaker</td><td>11188</td><td>186</td><td>305</td><td></td><td>11346</td><td>35392</td><td>436</td><td></td><td></td><td></td><td>6</td><td>276</td><td></td><td></td><td>2</td><td></td></tr>
<tr><td>Blackwater with MCP</td><td>11428</td><td>100</td><td></td><td></td><td>41242</td><td>1784</td><td></td><td></td><td></td><td></td><td></td><td>263</td><td>64</td><td></td><td>94</td><td></td></tr>
<tr><td>Storm Bell Fighter Game</td><td>32510</td><td></td><td>828</td><td>19315</td><td></td><td></td><td></td><td></td><td></td><td></td><td>285</td><td>75</td><td>1234</td><td></td><td></td><td></td></tr>
<tr><td>LLM Monster Hunter 2</td><td>22382</td><td>26302</td><td>49</td><td></td><td></td><td></td><td>4559</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>258</td><td>0</td></tr>
<tr><td>Sandbox</td><td>5938</td><td>17826</td><td>9665</td><td></td><td></td><td></td><td>12823</td><td></td><td></td><td></td><td></td><td>582</td><td></td><td></td><td>21</td><td></td></tr>
<tr><td>My Blog (this site and its tools)</td><td>8536</td><td>17720</td><td>2953</td><td></td><td></td><td>41</td><td>2455</td><td></td><td></td><td></td><td>656</td><td>555</td><td></td><td>1491</td><td>41</td><td>450</td></tr>
<tr><td>Storm Bell Fighter</td><td>28743</td><td></td><td></td><td>396</td><td></td><td></td><td></td><td></td><td></td><td></td><td>67</td><td></td><td>17</td><td></td><td></td><td></td></tr>
<tr><td>Claude Playback Lens</td><td></td><td>23841</td><td>50</td><td></td><td></td><td></td><td>2653</td><td></td><td></td><td></td><td>16</td><td></td><td></td><td></td><td>14</td><td></td></tr>
<tr><td>Japanese Learning Programs</td><td>11160</td><td>7370</td><td>4540</td><td></td><td></td><td></td><td>581</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>28</td><td></td></tr>
<tr><td>Music</td><td>1027</td><td>162</td><td>9244</td><td></td><td></td><td>7181</td><td>193</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Black Ops Cave Diver</td><td></td><td>670</td><td>17</td><td></td><td></td><td>15213</td><td>1134</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>4</td><td></td></tr>
<tr><td>MySillyTavern</td><td>4121</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>7948</td><td></td><td>67</td><td></td><td></td><td>76</td><td></td></tr>
<tr><td>Jet Brigade Racers</td><td>2154</td><td>4663</td><td>395</td><td></td><td></td><td></td><td>943</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>16</td><td></td></tr>
<tr><td>ComfyUI scripts</td><td>7784</td><td>124</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>84</td><td>31</td><td></td><td></td><td>18</td><td></td></tr>
<tr><td>Reading Pacer v2</td><td>2708</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>31</td><td>27</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Bad Very Bad</td><td>2585</td><td>29</td><td></td><td></td><td></td><td></td><td>75</td><td></td><td></td><td></td><td>43</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>OpenClaw Management</td><td>180</td><td>965</td><td>549</td><td></td><td></td><td></td><td>914</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Showreel 2026</td><td>1372</td><td>744</td><td>138</td><td></td><td></td><td></td><td>14</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Blender Paper Films</td><td>2009</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>MyLLMApp</td><td>1152</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>37</td><td></td></tr>
<tr><td>Brand Designs</td><td></td><td></td><td>1030</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Runpod Render Kit</td><td>796</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>61</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Canvas Films</td><td>28</td><td></td><td>208</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Jev</td><td>63</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table>
<figcaption><b>1,030,371 lines of code in 29 project folders</b><span class="ao-meta">Second pass, 21 Oct 2026, 00:10. Lua, C/C++, Kotlin, shell, PowerShell, shaders, Astro, batch and SQL are under Other. HTML and CSS count as code.</span></figcaption>
</ao-treemap>

- **Second is Gauntlet Test at 116,146 lines, and it's one job built ten times.** Two Claude
  models, Opus 5.5 and Sonnet 5.5, each built the same brief at five effort levels. Effort is a
  setting for how much work the model puts into a job. The test is in
  [my post comparing the two models](/ledger/sonnet-vs-opus-gauntlet/).
- **Python is 40% of it all, 408,769 lines.** JavaScript is 22% and HTML 10%. The games bring
  GDScript, the Godot engine's own language, and C#.

## In AI tokens

In AI terms that's roughly 15 million tokens, the chunks AI models read and write. My Claude
sessions have written about 218 million tokens since July, so about one in every 12 to 17 of them
is still standing as code.

<details><summary>How the token estimate works</summary>

- When I asked how many tokens that is, Claude measured characters instead of guessing from
  lines. The counted lines hold 53.8 million characters with their indentation.
- Code runs about three to four characters per token, so that's somewhere between 13 and 18
  million tokens. Nobody ran the files through a token counter, so it stays a range.
- The 218.5 million comes from [Playback Lens](/ledger/reading-my-own-agents/), my tool that
  reads every Claude Code session on my laptop. It covers 498 sessions since 7 July.
- It isn't a fair comparison. Those tokens include thinking, every reply, files written and
  rewritten and deleted, and work in folders this scan never looked at.
- What my sessions cost is in [my post on Claude Code costs](/ledger/what-drives-claude-code-cost/).

</details>

<details><summary>What the count left out</summary>

- 23 older projects I'd moved to OneDrive weren't counted. They're online-only, and scanning them
  would have downloaded about 2 GB.
- Tests were left out on purpose: 148,282 lines in 1,101 files. A third of them, 47,338 lines,
  belong to Blackwater Godot, the same game that wrote the 941 reports.
- The count moves. Running it again the next morning gave 1,038,996, while a film session kept
  working.
- The rules are judgment calls. HTML and CSS count, and a long prompt inside a Python file
  counts. Change those and the total moves by tens of thousands.
- Two folders point at the same game, [Storm Bell Fighter](/ledger/storm-bell-fighter/), so
  about 26,000 lines are counted twice.

</details>
