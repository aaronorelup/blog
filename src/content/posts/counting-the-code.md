---
id: "AO-062"
title: "My projects folder holds 1.03 million lines of code. The first count said 3.1 million"
summary: "I asked Claude to count the code in every project I've built with it. 29 folders hold about a million lines, and two million more on the same disk turned out to be copies, generated reports and other people's code."
date: 2026-10-21
status: "note"
tags: ["claude-code", "opus-5-5", "agents", "lessons"]
preview:
  verdict: "1.03 million, not 3.1"
  takeaway: "Two of every three lines the first count found were copies, generated reports or other people's code. The biggest pile: agents' checkouts of this blog."
  points:
    - "Six worktree copies of the blog, with the games it hosts: 875,824 lines. The blog's own source is about 10,500."
    - "A Godot game's test framework wrote 941 HTML reports: 768,489 lines, nearly ten times the game's own 79,105."
    - "The code left is about 15 million tokens. My sessions have produced 218.5 million output tokens since July."
---

My projects folder holds about **1.03 million lines of code in 29 projects**, not counting
blank lines, comments or tests. The first count came to 3.1 million. Two of every three lines
it found were copies of something, files a program had generated, or code somebody else wrote,
and the single biggest pile was the checkouts my own agents make of this blog.

Last night I asked Claude:

> Could you list all of the projects I have in [my projects folder] that are code based, and
> list them by how many files of code and how many lines of code, not counting comments or
> tests.

One Opus 5.5 session wrote a 290-line Python counter, ran it over the folder, looked at what came
back, and ran it again with the junk taken out. The whole thing took 42 minutes; the first scan
alone took 30 of them, most of it spent parsing folders that turned out not to count.

## What the first count picked up

The counter was strict from the start. It read only code files (Python, JavaScript, C#,
GDScript, HTML, CSS and a dozen more), skipped `node_modules`, virtual environments, build
folders and minified bundles, and left out blank lines, comments, docstrings and anything that
looked like a test. That still came to 3,104,925 lines in 14,250 files.

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

**The biggest thing on my disk that looked like code was this blog, seven times over.** Its
own source, the part I'd call the site, is about 10,500 lines. Every worktree is a whole copy,
and every copy carries `public/`, where the site keeps playable games and decks from other
projects. Six of them were still on disk. The one this post was written in is the
seventh, made this morning, and it is removed when the post is live.

The second biggest was a game writing about itself. Blackwater Godot runs its test suite through
gdUnit4, which leaves an HTML page, stylesheets and an XML file per run. 941 of them add up to
768,489 lines, nearly ten times the 79,105 lines of the game.

Neither is a problem in itself. Both mean that a count of "my code" which doesn't look inside
the folders it counts is wrong by a factor of three.

## Where the million lives

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

- **I Love My Evening Television is a fifth of everything: 205,234 lines.** That is three
  episodes of a series where Claude makes a 30-minute film, and each episode builds its own
  tools: [Crimson Coil](/ledger/crimson-coil/) 56,167, [Earthlight](/ledger/earthlight/)
  72,596, [Context Window](/ledger/context-window/) 73,442. Most of it is Python.
- **Gauntlet Test, second at 116,146, is one brief run ten times.** Opus 5.5 and Sonnet 5.5
  each built the same thing at five effort settings, in ten folders. Counted as one project, it
  overstates how much I've built; counted as ten, it's ten small ones.
- **Python is 40% of the total (408,769 lines), JavaScript 22%, HTML 10%.** The game folders
  bring GDScript (68,437) and C# (64,474); the wallpaper app brings most of the TypeScript.
- **Sandbox and Sandbox 2 are grab-bags,** 130,003 lines between them across dozens of
  experiments.
- **Two folders overlap.** Storm Bell Fighter and Storm Bell Fighter Game point at the same
  repository and share about 26,000 lines of Blender tools, so those are counted twice.

Tests were left out from the start: 148,282 lines in 1,101 files. A third of them belong to
Blackwater Godot (47,338), the same project that wrote the 941 reports. The two go together.

## In tokens

My follow-up was "How many tokens is is that as an estimate?" The session measured characters
rather than guessing from lines: the counted lines hold 53.8 million characters with their
indentation. At the usual three to four characters per token for code, that is **about 15
million tokens, somewhere between 13 and 18 million.** Nobody ran a tokenizer over the files, so
it stays a range.

For scale: Playback Lens, which reads every Claude Code session on this laptop, has recorded
218.5 million output tokens across 498 sessions since 7 July. That isn't a like-for-like
comparison. Output tokens include thinking, every reply, files written and rewritten and
deleted, and work in folders this scan never looked at. But it puts the code still standing at
roughly **one token for every 12 to 17 my sessions have produced.**

## What isn't in it

- **23 older projects** moved to OneDrive on 16 October and are online-only. Scanning them
  would have downloaded about 2 GB, so they weren't counted. The total is the code in my current
  folder, not everything I've made.
- **The count moves.** I re-ran the same counter with the same exclusions this morning:
  1,038,996 lines, 8,625 more than the night before, while a film session kept working, and
  54.3 million characters.
- **The rules are judgement calls.** HTML and CSS count. A Python string holding a long prompt
  counts. A test helper that isn't named like a test counts. Change any of those and the
  million moves by tens of thousands.

The number I asked for turned out to be the smallest one the scan produced. Most of what agents
leave on a disk is the scaffolding around the work: checkouts to work in, records of runs,
libraries to build on. The code is what's left when those come out, and it took a second pass
to see it.
