---
id: "AO-057"
title: "Who actually visits a new website? I asked Cloudflare"
summary: "My site is 77 days old and has never been promoted. I gave Claude three Cloudflare connections and asked who actually visits: the real numbers, what each connection can see and do, and the questions worth asking."
date: 2026-10-17
status: "shipped"
tags: ["cloudflare", "analytics", "mcp", "claude-code", "blog"]
series: ["the-site"]
preview:
  verdict: "Mostly machines, and me"
  takeaway: "Of 11,637 pages my site served in 30 days, about 9,000 went to machines and 1,600 to me. Other people read 290 to 980: 10 to 33 a day."
  points:
    - "Requests per day more than doubled in October, and nearly half of that growth was my own agents checking my posts."
    - "AI crawlers, assistants and AI search made 6,671 requests in 30 days, twice the 3,313 from search engines."
    - "A quarter of all requests were 404s, mostly scanners hunting WordPress and leaked .env files on a site with neither."
---

aaronorelup.com went up on 2 August. In the 77 days since, I haven't promoted it, installed
Google Analytics, or looked at a single traffic number. Cloudflare, which serves it, has been
counting the whole time.

This week I connected Claude to my Cloudflare account through three of Cloudflare's connections
(MCP servers, the plug-ins that let an AI agent call a service) and asked the question anyone
building a site wants answered: who actually visits?

**In the last 30 days the site served 11,637 pages. About 1,600 went to me and my own agents,
about 9,000 went to machines, and between 290 and 980 went to other people: 10 to 33 a day.**
The rest of this post is how that answer was found, what each connection can see and do, and
the questions I'd ask first if I were starting a site today. Nothing here has been optimised:
no SEO work, no social posting, no ads, 55 posts before this one.

## 77 days, by the dashboard's numbers

<ao-series show="Requests" avg="7">
<table>
<thead><tr><th>Day</th><th>Requests</th><th>Pages</th><th>Unique visitors</th><th data-unit="MB">Data served</th><th>Threats</th></tr></thead>
<tbody>
<tr><td>2026-08-02</td><td>1316</td><td>247</td><td>115</td><td>21.2</td><td>2</td></tr>
<tr><td>2026-08-03</td><td>904</td><td>268</td><td>185</td><td>7.9</td><td>7</td></tr>
<tr><td>2026-08-04</td><td>1542</td><td>423</td><td>255</td><td>42.1</td><td>5</td></tr>
<tr><td>2026-08-05</td><td>4555</td><td>269</td><td>162</td><td>35.2</td><td>21</td></tr>
<tr><td>2026-08-06</td><td>358</td><td>127</td><td>114</td><td>1.1</td><td>3</td></tr>
<tr><td>2026-08-07</td><td>1758</td><td>223</td><td>85</td><td>57.3</td><td>5</td></tr>
<tr><td>2026-08-08</td><td>1117</td><td>237</td><td>126</td><td>32.1</td><td>0</td></tr>
<tr><td>2026-08-09</td><td>530</td><td>141</td><td>115</td><td>5.3</td><td>0</td></tr>
<tr><td>2026-08-10</td><td>459</td><td>128</td><td>84</td><td>9.9</td><td>2</td></tr>
<tr><td>2026-08-11</td><td>821</td><td>102</td><td>78</td><td>8.9</td><td>15</td></tr>
<tr><td>2026-08-12</td><td>945</td><td>169</td><td>97</td><td>35.9</td><td>0</td></tr>
<tr><td>2026-08-13</td><td>404</td><td>74</td><td>82</td><td>3.8</td><td>1</td></tr>
<tr><td>2026-08-14</td><td>1466</td><td>146</td><td>99</td><td>7.7</td><td>2</td></tr>
<tr><td>2026-08-15</td><td>471</td><td>176</td><td>86</td><td>6.0</td><td>0</td></tr>
<tr><td>2026-08-16</td><td>384</td><td>115</td><td>109</td><td>4.3</td><td>0</td></tr>
<tr><td>2026-08-17</td><td>663</td><td>155</td><td>122</td><td>19.3</td><td>1</td></tr>
<tr><td>2026-08-18</td><td>532</td><td>132</td><td>116</td><td>14.1</td><td>1</td></tr>
<tr><td>2026-08-19</td><td>731</td><td>150</td><td>96</td><td>24.8</td><td>0</td></tr>
<tr><td>2026-08-20</td><td>1491</td><td>223</td><td>90</td><td>55.2</td><td>1</td></tr>
<tr><td>2026-08-21</td><td>297</td><td>147</td><td>115</td><td>8.2</td><td>0</td></tr>
<tr><td>2026-08-22</td><td>2589</td><td>151</td><td>120</td><td>12.1</td><td>12</td></tr>
<tr><td>2026-08-23</td><td>318</td><td>121</td><td>121</td><td>4.9</td><td>1</td></tr>
<tr><td>2026-08-24</td><td>460</td><td>146</td><td>88</td><td>6.8</td><td>1</td></tr>
<tr><td>2026-08-25</td><td>339</td><td>129</td><td>78</td><td>5.6</td><td>2</td></tr>
<tr><td>2026-08-26</td><td>283</td><td>139</td><td>93</td><td>5.0</td><td>0</td></tr>
<tr><td>2026-08-27</td><td>291</td><td>148</td><td>125</td><td>5.2</td><td>2</td></tr>
<tr><td>2026-08-28</td><td>382</td><td>135</td><td>126</td><td>13.1</td><td>2</td></tr>
<tr><td>2026-08-29</td><td>556</td><td>139</td><td>145</td><td>5.0</td><td>13</td></tr>
<tr><td>2026-08-30</td><td>434</td><td>120</td><td>132</td><td>13.8</td><td>0</td></tr>
<tr><td>2026-08-31</td><td>838</td><td>164</td><td>114</td><td>5.3</td><td>6</td></tr>
<tr><td>2026-09-01</td><td>408</td><td>121</td><td>117</td><td>3.4</td><td>12</td></tr>
<tr><td>2026-09-02</td><td>1321</td><td>126</td><td>127</td><td>7.3</td><td>517</td></tr>
<tr><td>2026-09-03</td><td>370</td><td>112</td><td>120</td><td>7.5</td><td>6</td></tr>
<tr><td>2026-09-04</td><td>710</td><td>157</td><td>155</td><td>4.2</td><td>61</td></tr>
<tr><td>2026-09-05</td><td>189</td><td>119</td><td>124</td><td>4.0</td><td>0</td></tr>
<tr><td>2026-09-06</td><td>486</td><td>98</td><td>110</td><td>3.4</td><td>9</td></tr>
<tr><td>2026-09-07</td><td>1646</td><td>111</td><td>81</td><td>4.2</td><td>62</td></tr>
<tr><td>2026-09-08</td><td>342</td><td>157</td><td>112</td><td>5.4</td><td>0</td></tr>
<tr><td>2026-09-09</td><td>2952</td><td>117</td><td>71</td><td>4.7</td><td>24</td></tr>
<tr><td>2026-09-10</td><td>918</td><td>135</td><td>70</td><td>4.9</td><td>17</td></tr>
<tr><td>2026-09-11</td><td>679</td><td>153</td><td>142</td><td>3.9</td><td>79</td></tr>
<tr><td>2026-09-12</td><td>207</td><td>106</td><td>115</td><td>3.6</td><td>0</td></tr>
<tr><td>2026-09-13</td><td>198</td><td>99</td><td>115</td><td>5.5</td><td>6</td></tr>
<tr><td>2026-09-14</td><td>817</td><td>97</td><td>98</td><td>3.7</td><td>7</td></tr>
<tr><td>2026-09-15</td><td>1811</td><td>152</td><td>137</td><td>11.0</td><td>317</td></tr>
<tr><td>2026-09-16</td><td>635</td><td>140</td><td>88</td><td>6.4</td><td>22</td></tr>
<tr><td>2026-09-17</td><td>420</td><td>72</td><td>85</td><td>3.0</td><td>3</td></tr>
<tr><td>2026-09-18</td><td>187</td><td>97</td><td>110</td><td>5.2</td><td>0</td></tr>
<tr><td>2026-09-19</td><td>254</td><td>102</td><td>117</td><td>7.4</td><td>0</td></tr>
<tr><td>2026-09-20</td><td>174</td><td>106</td><td>103</td><td>3.5</td><td>0</td></tr>
<tr><td>2026-09-21</td><td>349</td><td>93</td><td>88</td><td>20.6</td><td>0</td></tr>
<tr><td>2026-09-22</td><td>885</td><td>120</td><td>110</td><td>5.0</td><td>31</td></tr>
<tr><td>2026-09-23</td><td>715</td><td>94</td><td>101</td><td>4.9</td><td>8</td></tr>
<tr><td>2026-09-24</td><td>4328</td><td>138</td><td>119</td><td>5.9</td><td>26</td></tr>
<tr><td>2026-09-25</td><td>694</td><td>99</td><td>126</td><td>5.2</td><td>6</td></tr>
<tr><td>2026-09-26</td><td>1450</td><td>284</td><td>167</td><td>47.5</td><td>5</td></tr>
<tr><td>2026-09-27</td><td>1111</td><td>207</td><td>133</td><td>376.5</td><td>0</td></tr>
<tr><td>2026-09-28</td><td>896</td><td>141</td><td>142</td><td>358.7</td><td>3</td></tr>
<tr><td>2026-09-29</td><td>1203</td><td>253</td><td>226</td><td>392.9</td><td>1</td></tr>
<tr><td>2026-09-30</td><td>3427</td><td>1120</td><td>300</td><td>814.2</td><td>6</td></tr>
<tr><td>2026-10-01</td><td>2350</td><td>612</td><td>228</td><td>477.5</td><td>15</td></tr>
<tr><td>2026-10-02</td><td>2441</td><td>294</td><td>243</td><td>479.5</td><td>8</td></tr>
<tr><td>2026-10-03</td><td>1977</td><td>476</td><td>240</td><td>708.6</td><td>36</td></tr>
<tr><td>2026-10-04</td><td>1452</td><td>308</td><td>240</td><td>407.4</td><td>14</td></tr>
<tr><td>2026-10-05</td><td>2648</td><td>517</td><td>355</td><td>373.9</td><td>5</td></tr>
<tr><td>2026-10-06</td><td>1870</td><td>299</td><td>229</td><td>687.4</td><td>4</td></tr>
<tr><td>2026-10-07</td><td>2554</td><td>576</td><td>570</td><td>676.1</td><td>5</td></tr>
<tr><td>2026-10-08</td><td>2920</td><td>696</td><td>610</td><td>734.6</td><td>7</td></tr>
<tr><td>2026-10-09</td><td>2159</td><td>388</td><td>459</td><td>978.8</td><td>4</td></tr>
<tr><td>2026-10-10</td><td>2016</td><td>635</td><td>375</td><td>276.6</td><td>5</td></tr>
<tr><td>2026-10-11</td><td>2749</td><td>507</td><td>545</td><td>955.3</td><td>18</td></tr>
<tr><td>2026-10-12</td><td>4347</td><td>750</td><td>643</td><td>1172.7</td><td>5</td></tr>
<tr><td>2026-10-13</td><td>2259</td><td>611</td><td>490</td><td>347.7</td><td>5</td></tr>
<tr><td>2026-10-14</td><td>2110</td><td>620</td><td>483</td><td>751.8</td><td>6</td></tr>
<tr><td>2026-10-15</td><td>2102</td><td>402</td><td>455</td><td>437.7</td><td>2</td></tr>
<tr><td>2026-10-16</td><td>1869</td><td>445</td><td>426</td><td>362.2</td><td>3</td></tr>
<tr><td>2026-10-17</td><td>2122</td><td>379</td><td>345</td><td>565.4</td><td>5</td></tr>
</tbody>
</table>
<ol>
<li data-d="2026-08-02">AO-001 · Why I'm starting this</li>
<li data-d="2026-08-02">AO-002 · I built a cave-diving zombies game in a weekend</li>
<li data-d="2026-08-02">AO-003 · The one-shot game that worked, and the one that didn't</li>
<li data-d="2026-08-05">AO-004 · I asked my agent to play my game. It handed back a documentary.</li>
<li data-d="2026-08-07">AO-005 · I resurrected a dead Jagex game to test the gauntlet loop</li>
<li data-d="2026-08-07">AO-006 · The skin I gave up on, and the effect I barely described</li>
<li data-d="2026-08-08">AO-007 · No VS Code, no terminal, no idea</li>
<li data-d="2026-08-08">AO-008 · LLM Monster Hunter was my computer science degree</li>
<li data-d="2026-08-08">AO-009 · Everything Sonnet 4 got wrong, and what each one taught me</li>
<li data-d="2026-08-08">AO-010 · The wall that stopped me for ten months, and the week that cleared it</li>
<li data-d="2026-08-08">AO-011 · I don't learn programming anymore</li>
<li data-d="2026-08-08">AO-012 · I stopped keeping my agents fed</li>
<li data-d="2026-08-15">AO-013 · Second Brain, v2 — a ledger</li>
<li data-d="2026-08-18">AO-015 · Prompting Is Solved, but the Bottleneck Is Still You</li>
<li data-d="2026-08-24">AO-016 · I asked for an MVP before I knew what I wanted</li>
<li data-d="2026-09-01">AO-014 · I had 801 agent transcripts and no way to read them</li>
<li data-d="2026-09-22">AO-017 · An autopilot winning is not a person playing</li>
<li data-d="2026-09-25">AO-018 · Six days of trying to put my character in 3D, every attempt side by side</li>
<li data-d="2026-09-26">AO-019 · An agent confessed to deleting 19 GB I had asked another agent to delete</li>
<li data-d="2026-09-26">AO-020 · A 30-second film with no assets, and a score nobody listened to</li>
<li data-d="2026-09-26">AO-021 · A music video for my game, rendered inside the game</li>
<li data-d="2026-09-27">AO-022 · Claude designed its own character for my world, and wrote this post about it</li>
<li data-d="2026-09-27">AO-023 · The video model follows your previs, bad animation included</li>
<li data-d="2026-09-28">AO-024 · A fighting game with my two characters, and where its 42 hours went</li>
<li data-d="2026-09-28">AO-025 · The model that invented Jefrie couldn't draw her again, until I trained a LoRA</li>
<li data-d="2026-09-28">AO-026 · Sonnet 5.5 is half the price of Opus 5.5 on paper. Across three long tests it was 2% cheaper.</li>
<li data-d="2026-09-29">AO-027 · My agents built 16 wallpapers overnight, and none of them ever saw one run</li>
<li data-d="2026-10-01">AO-029 · I asked where I was supposed to learn all this. Two hours later, 44 agents had made the first lesson.</li>
<li data-d="2026-10-02">AO-030 · Claude rendered 223 clips of my game's robot voice, and couldn't hear any of them</li>
<li data-d="2026-10-03">AO-031 · Claude made a music video for my song and cast the lovers the wrong way round</li>
<li data-d="2026-10-03">AO-032 · I told Claude to find the best Opus 5.5 trick on X and do it without me</li>
<li data-d="2026-10-03">AO-033 · I tried Rehan Sheikh's Universal Modder on a game I own, and Opus 5.5 dealt my characters into Inscryption</li>
<li data-d="2026-10-04">AO-034 · I sent back two of my course's first seven lessons, including the one built to stop that happening</li>
<li data-d="2026-10-04">AO-035 · Eight Claude agents drew my song's whole music video in code, one tool per scene</li>
<li data-d="2026-10-05">AO-036 · Modding Megabonk: a new character takes no code, a new mechanic takes a plugin</li>
<li data-d="2026-10-05">AO-037 · I tested the AI rigging and animation models on Jefrie. The scripted rig won.</li>
<li data-d="2026-10-05">AO-038 · Claude painted three oil paintings, one brushstroke at a time, with no undo</li>
<li data-d="2026-10-05">AO-039 · Twelve days of AI films on an 8 GB laptop: everything I tried, and how each one turned out</li>
<li data-d="2026-10-06">AO-040 · Claude's text is watermarked now, and the mark only lives where Claude had a choice</li>
<li data-d="2026-10-07">AO-041 · Claude made a 40-minute lesson on Loom and how information flows through transformers</li>
<li data-d="2026-10-08">AO-042 · For two months no video on my site could skip ahead, and the agent that noticed wrote a workaround</li>
<li data-d="2026-10-09">AO-043 · A cloud session pushed one post from a branch, and my whole site went back to August</li>
<li data-d="2026-10-11">AO-044 · Nine Claudes painted the same picture in oil, and the first tries were the art</li>
<li data-d="2026-10-11">AO-045 · Crimson Coil: Claude's 30-minute oil paint-along, where the window breaks at 20:00</li>
<li data-d="2026-10-12">AO-046 · My course was built on Claude's guess of what to teach. Rebuilt from 251 sources, 214 lessons became 36</li>
<li data-d="2026-10-14">AO-047 · I asked for my showreel to be made in Blender. The first cut only used Blender to glue the old one together</li>
<li data-d="2026-10-14">AO-048 · Earthlight: Claude's 30-minute moon-city stream, watched by the girl alone in the base it drew</li>
<li data-d="2026-10-15">AO-049 · Every morning at 4 a.m. Claude draws one idea with three image models, and it has picked the same one 41 times out of 41</li>
<li data-d="2026-10-16">AO-050 · The first lesson on my rebuilt course map took 71 agents, and the one reading as a beginner caught what it had backwards</li>
<li data-d="2026-10-16">AO-051 · Can Claude find a specific moment in a YouTube video, and does Arcmira help?</li>
<li data-d="2026-10-16">AO-052 · Bad. Very Bad.: Claude's 30-second anime haggle, timed by audio the film never plays</li>
<li data-d="2026-10-16">AO-053 · Three music videos for one song, and I'm not happy with any of them</li>
<li data-d="2026-10-16">AO-054 · The previs workflow, written down where I'll actually find it again</li>
<li data-d="2026-10-17">AO-055 · I rented a 48 GB cloud GPU for my video model expecting 10 to 30 times my laptop. It does 4 to 5</li>
<li data-d="2026-10-17">AO-056 · Five music videos for one song, and how the fifth kept the jetty in one place</li>
</ol>
<figcaption><b>Cloudflare's daily totals for aaronorelup.com, 2 Aug to 17 Oct 2026</b><span class="ao-meta">17 Oct is a partial day. Pages = Cloudflare's page views: successful HTML responses, to anyone. Unique visitors = distinct IP addresses per day. Dots under the axis are posts going up. httpRequests1dGroups, read through the analytics connection on 17 Oct</span></figcaption>
</ao-series>

Read the way a dashboard invites you to, this is a site taking off. Requests per day went from
about 900 in August to 2,400 in October, "unique visitors" from 116 a day to 412, data served
from 16 MB a day to 614 MB. Over the whole stretch: 96,961 requests, 18,485 page views and
13 GB.

The data is the easy one: from late September, posts started carrying video, and video is four
fifths of every byte served in the last 30 days. The rest of the growth needs a second question.

## Who drew the line

The connection keeps 30 days of detail on the free plan, so for the last 30 I asked it to split
every request by who sent it. That takes four questions: which came from my own home connection
(Cloudflare tells a page its visitor's address, so I asked for mine and filtered on it), which
bots Cloudflare has verified, which requests from everyone else failed, and what was left.

<ao-series stack>
<table>
<thead><tr><th>Day</th><th>Everyone else</th><th>Bots that say so</th><th>Scanners that missed</th><th>Me and my agents</th></tr></thead>
<tbody>
<tr><td>2026-09-18</td><td>128</td><td>29</td><td>43</td><td>0</td></tr>
<tr><td>2026-09-19</td><td>109</td><td>62</td><td>46</td><td>52</td></tr>
<tr><td>2026-09-20</td><td>94</td><td>45</td><td>38</td><td>11</td></tr>
<tr><td>2026-09-21</td><td>216</td><td>89</td><td>33</td><td>8</td></tr>
<tr><td>2026-09-22</td><td>134</td><td>45</td><td>655</td><td>18</td></tr>
<tr><td>2026-09-23</td><td>108</td><td>41</td><td>602</td><td>7</td></tr>
<tr><td>2026-09-24</td><td>133</td><td>78</td><td>4159</td><td>0</td></tr>
<tr><td>2026-09-25</td><td>90</td><td>47</td><td>590</td><td>12</td></tr>
<tr><td>2026-09-26</td><td>192</td><td>118</td><td>374</td><td>778</td></tr>
<tr><td>2026-09-27</td><td>313</td><td>72</td><td>52</td><td>689</td></tr>
<tr><td>2026-09-28</td><td>290</td><td>88</td><td>139</td><td>379</td></tr>
<tr><td>2026-09-29</td><td>209</td><td>369</td><td>109</td><td>526</td></tr>
<tr><td>2026-09-30</td><td>1395</td><td>509</td><td>1006</td><td>523</td></tr>
<tr><td>2026-10-01</td><td>782</td><td>385</td><td>389</td><td>832</td></tr>
<tr><td>2026-10-02</td><td>385</td><td>492</td><td>639</td><td>982</td></tr>
<tr><td>2026-10-03</td><td>625</td><td>480</td><td>429</td><td>463</td></tr>
<tr><td>2026-10-04</td><td>502</td><td>223</td><td>439</td><td>419</td></tr>
<tr><td>2026-10-05</td><td>833</td><td>668</td><td>233</td><td>924</td></tr>
<tr><td>2026-10-06</td><td>519</td><td>460</td><td>173</td><td>738</td></tr>
<tr><td>2026-10-07</td><td>815</td><td>625</td><td>302</td><td>840</td></tr>
<tr><td>2026-10-08</td><td>1142</td><td>767</td><td>335</td><td>702</td></tr>
<tr><td>2026-10-09</td><td>985</td><td>507</td><td>542</td><td>141</td></tr>
<tr><td>2026-10-10</td><td>696</td><td>363</td><td>867</td><td>108</td></tr>
<tr><td>2026-10-11</td><td>764</td><td>611</td><td>194</td><td>1200</td></tr>
<tr><td>2026-10-12</td><td>1360</td><td>1463</td><td>270</td><td>1284</td></tr>
<tr><td>2026-10-13</td><td>977</td><td>532</td><td>700</td><td>50</td></tr>
<tr><td>2026-10-14</td><td>770</td><td>751</td><td>183</td><td>425</td></tr>
<tr><td>2026-10-15</td><td>864</td><td>519</td><td>695</td><td>136</td></tr>
<tr><td>2026-10-16</td><td>418</td><td>490</td><td>183</td><td>783</td></tr>
<tr><td>2026-10-17</td><td>411</td><td>529</td><td>66</td><td>1173</td></tr>
</tbody>
</table>
<figcaption><b>The last 30 days, split by who asked</b><span class="ao-meta">Requests, 18 Sep to 17 Oct (17 Oct partial). Me and my agents = my home IP address. Bots that say so = Cloudflare's verifiedBotCategory is set. Scanners that missed = everyone else, answered 400 or worse. httpRequestsAdaptiveGroups, 17 Oct. Click a layer's name to hide it</span></figcaption>
</ao-series>

Nearly half of October's growth is me. On 26 September the Claude desktop app's built-in
browser started checking posts while my agents wrote them, and requests from my own connection
went from about 14 a day to 615. Over the same weeks, bots that announce themselves went from
55 a day to 500, most of them AI companies, and everyone else from 127 a day to 706. Scanners
come in waves: on 24 September one sent 4,159 requests in a day for files this site has never
had.

## Who got the pages

Pages are what a reader means by "visits", so here is the same month counted in pages, with each
group taken away in turn:

<ao-funnel unit="pages">
<ol>
<li><b>Pages served</b> <data value="11637">11,637</data> Every HTML response, 18 Sep to 17 Oct, to anyone who asked.</li>
<li><b>Me and my agents</b> <data value="-1634">−1,634</data> My home connection: my browser and phone, the Claude app's built-in browser, and curl, which agents use to check that a deploy went live.<ul><li>Chrome on my PC: 6,470 requests</li><li>The Claude app's browser: 3,108 requests</li><li>curl: 2,224 requests</li><li>My phone: 1,065 requests</li><li>Headless Chrome, run by my scripts: 725 requests</li><li>In all, 14,203 requests: 25% of everything, and 47% of the bytes</li></ul></li>
<li><b>Bots that say so</b> <data value="-3896">−3,896</data> Crawlers Cloudflare has verified are who they claim to be: search engines, AI crawlers, AI assistants, SEO tools.<ul><li>OpenAI: OAI-SearchBot 1,269, ChatGPT-User 558, GPTBot 246 requests</li><li>Exa, an AI search engine: 949</li><li>Meta: 816</li><li>Applebot: 777</li><li>Amazonbot: 731</li><li>Googlebot: 708, and GoogleOther 287</li><li>AhrefsBot, an SEO tool: 685</li><li>Huawei's PetalBot: 668</li><li>ClaudeBot: 480</li></ul></li>
<li><b>Scanners that missed</b> <data value="-326">−326</data> Error pages sent to scanners. They made 14,485 requests, a quarter of all traffic, but most of those got a bare 404, not a page.<ul><li>/wp-admin/install.php: 389 requests</li><li>/.env: 174, plus dozens of variants (/.env.dev 113, /.env.prod 70, /api/.env 73)</li><li>/.git/config: 120</li><li>/xmlrpc.php: 108</li><li>/Cpanel.php, /up.php, /info.php: about 60 each</li></ul></li>
<li><b>Scripts and headless browsers</b> <data value="-1253">−1,253</data> Requests that name no browser, or name a program: curl, Python, headless Chrome.</li>
<li><b>Browsers a year out of date</b> <data value="-3550">~−3,550</data> Visitors that look like browsers, but versions released before October 2025, led by one iPhone on iOS 13 (from 2019) that fetched 1,183 pages. People do run old browsers; not this many, this often.<ul><li>iPhone, iOS 13.2.3: 1,183 pages</li><li>Chrome 124 on Windows: 545</li><li>Pixel 6 with Chrome 114: 306</li><li>Android with Chrome 131: 178</li><li>Chrome 117: 156</li></ul></li>
<li><b>Ran Cloudflare's analytics script</b> <data value="290">~290</data> A separate count. Cloudflare's Web Analytics turned out to be running on the site, and it only hears from browsers that run its script: 570 of its reports came from someone other than me, about two per page. Ad blockers stop it, so the real number of people sits between this and the ~980 above.</li>
</ol>
<figcaption><b>The last 30 days in pages, filtered layer by layer</b><span class="ao-meta">HTML responses, 18 Sep to 17 Oct. Each layer is a filter the analytics connection ran: my IP; verifiedBotCategory; status 400 and up; the user agents curl, Python, headless and unknown; browser version; and the /cdn-cgi/rum reports Web Analytics sends. Request counts in the lists are for all files, not just pages</span></figcaption>
</ao-funnel>

So: 10 to 33 page views a day by people who aren't me. For every page a person read, machines
took at least nine.

What surprised me is who the machines are. **AI crawlers, AI assistants and AI search made
6,671 requests in those 30 days, twice the 3,313 from search engines.** One of them,
ChatGPT-User, fetches a page when a person's question in ChatGPT needs it; it came 558 times.
On a site this young, more people may be meeting my posts through an AI's answer than through a
search result, and no dashboard calls them visitors.

## You, in this data

Your visit to this page is in the same tables, and Cloudflare will show you your own row:

<ao-demo name="cf" part="you">
Ask Cloudflare what it saw of your visit: <a href="/cdn-cgi/trace">/cdn-cgi/trace</a> (the demo needs JavaScript).
</ao-demo>

## The three connections

Each connection is a set of tools Claude can call with my account's permissions. I added three:

| Connection | What it can read | What it can change |
|---|---|---|
| **Traffic and analytics** (Cloudflare's GraphQL Analytics API) | Every request Cloudflare served, grouped any way: page, country, status, cache, browser, bot category, IP address. Web Analytics page loads and Core Web Vitals. Worker usage. What the firewall blocked. | Nothing |
| **Worker logs and errors** (Workers Observability) | Every request a Worker handled, with its logs, errors and timing. The account's Workers and the code deployed to each. | Nothing |
| **Cloudflare Developer Platform** | D1 databases, KV stores, R2 file buckets, Hyperdrive, Workers and their code, Cloudflare's documentation. | Creates and deletes databases, buckets and stores, and runs SQL |

None of the three deploys code or changes a setting (DNS, caching, security rules); that is still
the dashboard, Cloudflare's command line, or a push to git. The limits I hit, all on the free
plan:

- **30 days of detail.** Per-request analytics go back 31 days; daily totals go back a year,
  hourly ones 3 days.
- **No referrers.** "Where did my visitors come from?" was refused outright: the free plan doesn't
  keep the referring site in its request analytics. Web Analytics does, but it samples 1 page
  load in 10.
- **A query budget.** After about 15 questions in a few minutes: `Rate limiter budget depleted.
  Please try again after 5 minutes.`
- **Logs only if you switched them on.** I hadn't, so the logs connection's first answer about the
  site's Worker was an empty list.
- **Logs it could count but not show.** Once logs were on, the logs connection added them up fine,
  but every request to list them failed inside the connection with a validation error, for both
  of my Workers. That may be fixed by the time you read this.

The analytics connection now describes itself as deprecated in favour of Cloudflare's newer
all-in-one API server (`mcp.cloudflare.com/mcp`), which runs the same GraphQL queries. The
questions carry over.

## What I asked, and what came back

These are the questions behind the numbers above, in plain words, each with the call Claude made
(trimmed) and what came back. Any of them works on your own site: copy it and swap in your
domain.

<ao-ask>
<details data-via="Analytics" data-tool="graphql_query" open><summary>How much traffic has aaronorelup.com had since it launched?</summary><pre>httpRequests1dGroups(limit: 100, filter: {date_geq: "2026-08-01"}, orderBy: [date_ASC]) {
  dimensions { date }
  sum { requests pageViews bytes cachedBytes threats }
  uniq { uniques }
}</pre><p>96,961 requests, 18,485 page views and 13 GB in 77 days, plus 1,480 requests Cloudflare counted as threats. The first chart above is this answer, one row per day.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>How much of it is bots?</summary><pre>httpRequestsAdaptiveGroups(limit: 20, filter: {datetime_geq: "2026-09-18T00:00:00Z"}, orderBy: [count_DESC]) {
  count
  dimensions { verifiedBotCategory }
}</pre><p>One request in five announces itself: AI crawlers 3,582, search engines 3,313, AI assistants 1,752, SEO tools 1,359, AI search 1,337, link previews 83. The other four in five don't say, which is where the work starts.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>Which AI companies are reading my site?</summary><pre>httpRequestsAdaptiveGroups(limit: 40, filter: {…, verifiedBotCategory_neq: ""}, orderBy: [count_DESC]) {
  count
  dimensions { userAgent verifiedBotCategory }
}</pre><p>OpenAI most (OAI-SearchBot 1,269, ChatGPT-User 558, GPTBot 246), then Exa 949, Meta 816, Apple 777, Amazon 731, Huawei 668, Anthropic's ClaudeBot 480. Google's own Googlebot made 708.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>What are all the 404s?</summary><pre>httpRequestsAdaptiveGroups(limit: 50, filter: {…, edgeResponseStatus: 404}, orderBy: [count_DESC]) {
  count
  dimensions { clientRequestPath }
}</pre><p>14,946 of them, a quarter of all requests. The top one was my fault: /favicon.ico, 512 times, because the site only had an SVG icon. Then /wp-admin/install.php 389, /.env 174, /.git/config 120: scanners looking for a WordPress install or a leaked password file. /sitemap.xml, 38 times, was mine again.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>How much of the traffic is me?</summary><pre>httpRequestsAdaptiveGroups(limit: 12, filter: {…, clientIP: "&lt;my address, from /cdn-cgi/trace&gt;"}, orderBy: [count_DESC]) {
  count
  dimensions { userAgentBrowser }
  sum { edgeResponseBytes }
}</pre><p>14,203 of 56,384 requests (25%) and 5.8 of 12.5 GB (47%). Chrome 6,470, the Claude app's browser 3,108, curl 2,224, my phone 1,065, headless Chrome 725. The Claude app's browser made 4 requests in the eight days before 26 September.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>Where do my visitors come from?</summary><pre>httpRequestsAdaptiveGroups(… dimensions { clientRefererHost })
rumPageloadEventsAdaptiveGroups(… dimensions { refererHost })</pre><p>The first was refused: <code>does not have access to the field 'clientrefererhost'</code>. The free plan doesn't keep referrers with requests. Web Analytics does, sampled: of an estimated 1,650 page loads in 77 days, 1,010 came from my own pages, 620 had no referrer, and 20 came from Google.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>Is my site fast for real visitors?</summary><pre>rumWebVitalsEventsAdaptiveGroups(… ) {
  quantiles { largestContentfulPaintP75 cumulativeLayoutShiftP75 interactionToNextPaintP75 }
}
…then the same, grouped by { userAgentBrowser deviceType }</pre><p>The first answer put Largest Contentful Paint, the moment the main content appears, at 19.9 seconds for the slowest quarter of visits. Split by browser it was 0.58 s for Chrome on a computer, 1.4 s for Chrome on Android and 0.29 s for Safari on an iPhone; the slow figure came from a handful of page loads, Safari on a Mac among them at 21.6 s. Ask for the split every time.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>What did Cloudflare block?</summary><pre>firewallEventsAdaptive(limit: 40, filter: {…}, orderBy: [datetime_DESC]) {
  datetime action source clientRequestPath clientCountryName userAgent description
}</pre><p>132 requests stopped by the free plan's managed rules: attempts on WordPress (backups of wp-config.php, CVE-2026-63030) and on React (CVE-2025-55182, aimed at /, /admin and /dashboard). 82 more turned away by the Browser Integrity Check, the ones I looked at sent by Python scripts. The grouped version of this query is refused on the free plan; the raw events are allowed.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>Is the site's Worker healthy?</summary><pre>workersInvocationsAdaptive(limit: 50, filter: {…, scriptName: "blog"}) {
  dimensions { status }
  sum { requests errors cpuTimeUs }
  quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 }
}</pre><p>5,384 runs in 30 days, nearly all of them video and audio requests. No errors from its code. 168 runs ended with the viewer leaving mid-video, and 2 were stopped for using too much CPU. The median run used 0.73 ms of CPU.</p></details>
<details data-via="Logs" data-tool="query_worker_observability"><summary>Show me the blog Worker's errors this week.</summary><pre>{ "view": "events", "parameters": { "filters": [
  { "key": "$metadata.service", "operation": "eq", "value": "blog" },
  { "key": "$metadata.error", "operation": "exists" } ] } }</pre><p><code>[]</code>, and not because there were none: logging had never been switched on for that Worker, so nothing it did was ever kept. The account's other Worker, which does log, had 3,284 events that week.</p></details>
<details data-via="Logs" data-tool="query_worker_observability"><summary>Logs are on now. What has the blog Worker logged?</summary><pre>{ "view": "calculations", "parameters": {
  "filters": [{ "key": "$metadata.service", "operation": "eq", "value": "blog" }],
  "calculations": [{ "operator": "count" }],
  "groupBys": [{ "type": "string", "value": "$metadata.type" }] } }
…then { "view": "events" } and { "view": "invocations" } to see them</pre><p>It could count them: 5 requests in the first half hour. It could not show me one. Both views that list events failed inside the connection, every time, with <code>Invalid input: expected string, received undefined</code> at <code>$workers.requestId</code>, and the same happened for the account's other Worker. On 17 October this connection could add up my logs but not read them.</p></details>
<details data-via="Developer Platform" data-tool="d1_databases_list · kv_namespaces_list · r2_buckets_list"><summary>What storage does my account have?</summary><p>One D1 database, one KV store and one R2 bucket, all belonging to other projects. Nothing for the site.</p></details>
<details data-via="Developer Platform" data-tool="d1_database_create · d1_database_query"><summary>Make a database to count this post's readers.</summary><pre>d1_database_create({ name: "blog-reads", primary_location_hint: "enam" })
d1_database_query({ sql: "CREATE TABLE IF NOT EXISTS reads (slug TEXT NOT NULL, day TEXT NOT NULL,
  country TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (slug, day, country)) WITHOUT ROWID" })</pre><p>Two calls, a few seconds. The Worker code that uses it still had to be written and deployed through git: the connection makes resources, not apps.</p></details>
<details data-via="Developer Platform" data-tool="search_cloudflare_documentation"><summary>Can my automatic deploys use a new database without new permissions?</summary><pre>search_cloudflare_documentation({ query: "Workers Builds API token default permissions D1" })</pre><p>Yes: <q>You do not need separate permissions on the bound resources to deploy the Worker.</q> That's why the counter below shipped with an ordinary push.</p></details>
</ao-ask>

## What it led to

Four changes went in with this post, each from a number above:

1. **Worker logs are on.** One line in the Worker's settings. It logged its first 5 requests within half an hour; the logs connection, as the questions above show, could count them but not yet show me one.
2. **A favicon.ico.** The site had an SVG icon; browsers and crawlers still ask for
   `/favicon.ico` by name, and got 512 404s in 30 days.
3. **A sitemap, and a robots.txt that points to it.** Crawlers asked for `/sitemap.xml` 38
   times. It now lists every page and listed post, so they don't have to guess. (The robots.txt
   the site had been serving was Cloudflare's: a page of legal comments about AI "content
   signals", with no rules in it.)
4. **A counter of my own.** The Developer Platform connection made the database; the site's
   [Worker](https://github.com/Bloodtailor/blog/blob/main/worker/reads.js), which until now
   only answered video and audio requests, counts this post's readers in it.

<ao-demo name="cf" part="count" data-slug="who-visits-a-new-website">
The live counter needs JavaScript.
</ao-demo>

It counts roughly what Cloudflare's script counts, without the 1-in-10 sampling: a browser that
stays on the page for a few seconds, once a day. It will miss the same people (anyone whose
blocker stops a request to `/api/reads`), and a patient script could add a read every ten
seconds. It keeps three things per read, all of them shown above.

## What none of it tells you

- **What people did on the page.** No clicks, scrolling or sessions. That is what tools like
  Hotjar and Microsoft Clarity record.
- **What they searched to find you.** That is Google Search Console.
- **Where they came from, on the free plan.** See the refused question above.
- **Whether a visitor that looks like Chrome is a person.** Everything in the funnel past the
  declared bots is a judgement, and every judgement was another question.

That last one is the real lesson. The default dashboard says this site had 412 unique visitors a
day in October. Every number in this post came from asking "and who was that?" one more time,
which is tedious by hand and takes an agent a minute. I built the site for people, and most of
what reads it is machines and me. The people are a small number, and now one I can watch.
