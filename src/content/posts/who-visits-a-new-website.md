---
id: "AO-057"
title: "Who actually visits a new website? I asked Cloudflare"
summary: "My site is 77 days old and has never been promoted. Claude read its traffic through Cloudflare: who really visits, which pages they read, and what to expect if you start a site of your own."
date: 2026-10-17
status: "shipped"
tags: ["cloudflare", "analytics", "mcp", "claude-code", "blog"]
series: ["the-site"]
preview:
  verdict: "Mostly machines, and me"
  takeaway: "Of 11,637 pages my site served in 30 days, about 9,000 went to machines and 1,600 to me. Other people read 290 to 980: 10 to 33 a day."
  points:
    - "The dashboard said 412 unique visitors a day. It counts any address that asks, bots and me included."
    - "AI crawlers, assistants and AI search made 6,671 requests in 30 days, twice the 3,313 from search engines."
    - "People land on the homepage, then one post: Jefrie in 3D. 550 of 570 visits came with no sign of where from."
---

aaronorelup.com went up on 2 August. In the 77 days since, I haven't promoted it, installed
Google Analytics, or looked at a single traffic number. Cloudflare, which hosts it, has been
counting the whole time. This week I connected Claude to my Cloudflare account and asked the
question anyone with a new site wants answered: who actually visits?

**In the last 30 days the site served 11,637 pages. About 9,000 went to machines, about 1,600
went to me, and between 290 and 980 went to other people: 10 to 33 a day.**

If you've never looked at web analytics, this is also a starting point: the few words you need,
what a brand-new site really gets, and what I'm doing about mine.

*The numbers stop on 17 October. A version refreshed every day is on [the stats page](/stats).*

## Six words you need

- **Request**: anything a browser or program asks the site for. One page is often dozens of
  requests: the page, then its pictures, video and scripts.
- **Page view**: a request for a page itself. The closest thing to "someone opened a post".
- **Unique visitor**: a distinct internet address in one day. Not a person. A bot is one, my
  laptop is one, my phone is another.
- **Bot**: a program fetching pages. Search engines, AI companies, SEO tools, and scanners
  looking for weak spots.
- **Analytics script**: a tiny piece of code that runs in a real browser and reports the visit.
  Most bots don't run it and ad blockers stop it, so it undercounts, but it's the best sign a
  visit was a person.
- **Referrer**: the page a visitor clicked from, when the browser passes it on. It's how you'd
  know whether someone came from Google, X or an email.

Claude got the numbers through Cloudflare's analytics connection (an MCP server: a plug-in that
lets an AI agent call a service). I asked in plain English, and Claude wrote the queries.

## What the dashboard says

<ao-series show="Pages" avg="7">
<table>
<thead><tr><th>Day</th><th>Requests</th><th>Pages</th><th>Unique visitors</th></tr></thead>
<tbody>
<tr><td>2026-08-02</td><td>1316</td><td>247</td><td>115</td></tr>
<tr><td>2026-08-03</td><td>904</td><td>268</td><td>185</td></tr>
<tr><td>2026-08-04</td><td>1542</td><td>423</td><td>255</td></tr>
<tr><td>2026-08-05</td><td>4555</td><td>269</td><td>162</td></tr>
<tr><td>2026-08-06</td><td>358</td><td>127</td><td>114</td></tr>
<tr><td>2026-08-07</td><td>1758</td><td>223</td><td>85</td></tr>
<tr><td>2026-08-08</td><td>1117</td><td>237</td><td>126</td></tr>
<tr><td>2026-08-09</td><td>530</td><td>141</td><td>115</td></tr>
<tr><td>2026-08-10</td><td>459</td><td>128</td><td>84</td></tr>
<tr><td>2026-08-11</td><td>821</td><td>102</td><td>78</td></tr>
<tr><td>2026-08-12</td><td>945</td><td>169</td><td>97</td></tr>
<tr><td>2026-08-13</td><td>404</td><td>74</td><td>82</td></tr>
<tr><td>2026-08-14</td><td>1466</td><td>146</td><td>99</td></tr>
<tr><td>2026-08-15</td><td>471</td><td>176</td><td>86</td></tr>
<tr><td>2026-08-16</td><td>384</td><td>115</td><td>109</td></tr>
<tr><td>2026-08-17</td><td>663</td><td>155</td><td>122</td></tr>
<tr><td>2026-08-18</td><td>532</td><td>132</td><td>116</td></tr>
<tr><td>2026-08-19</td><td>731</td><td>150</td><td>96</td></tr>
<tr><td>2026-08-20</td><td>1491</td><td>223</td><td>90</td></tr>
<tr><td>2026-08-21</td><td>297</td><td>147</td><td>115</td></tr>
<tr><td>2026-08-22</td><td>2589</td><td>151</td><td>120</td></tr>
<tr><td>2026-08-23</td><td>318</td><td>121</td><td>121</td></tr>
<tr><td>2026-08-24</td><td>460</td><td>146</td><td>88</td></tr>
<tr><td>2026-08-25</td><td>339</td><td>129</td><td>78</td></tr>
<tr><td>2026-08-26</td><td>283</td><td>139</td><td>93</td></tr>
<tr><td>2026-08-27</td><td>291</td><td>148</td><td>125</td></tr>
<tr><td>2026-08-28</td><td>382</td><td>135</td><td>126</td></tr>
<tr><td>2026-08-29</td><td>556</td><td>139</td><td>145</td></tr>
<tr><td>2026-08-30</td><td>434</td><td>120</td><td>132</td></tr>
<tr><td>2026-08-31</td><td>838</td><td>164</td><td>114</td></tr>
<tr><td>2026-09-01</td><td>408</td><td>121</td><td>117</td></tr>
<tr><td>2026-09-02</td><td>1321</td><td>126</td><td>127</td></tr>
<tr><td>2026-09-03</td><td>370</td><td>112</td><td>120</td></tr>
<tr><td>2026-09-04</td><td>710</td><td>157</td><td>155</td></tr>
<tr><td>2026-09-05</td><td>189</td><td>119</td><td>124</td></tr>
<tr><td>2026-09-06</td><td>486</td><td>98</td><td>110</td></tr>
<tr><td>2026-09-07</td><td>1646</td><td>111</td><td>81</td></tr>
<tr><td>2026-09-08</td><td>342</td><td>157</td><td>112</td></tr>
<tr><td>2026-09-09</td><td>2952</td><td>117</td><td>71</td></tr>
<tr><td>2026-09-10</td><td>918</td><td>135</td><td>70</td></tr>
<tr><td>2026-09-11</td><td>679</td><td>153</td><td>142</td></tr>
<tr><td>2026-09-12</td><td>207</td><td>106</td><td>115</td></tr>
<tr><td>2026-09-13</td><td>198</td><td>99</td><td>115</td></tr>
<tr><td>2026-09-14</td><td>817</td><td>97</td><td>98</td></tr>
<tr><td>2026-09-15</td><td>1811</td><td>152</td><td>137</td></tr>
<tr><td>2026-09-16</td><td>635</td><td>140</td><td>88</td></tr>
<tr><td>2026-09-17</td><td>420</td><td>72</td><td>85</td></tr>
<tr><td>2026-09-18</td><td>187</td><td>97</td><td>110</td></tr>
<tr><td>2026-09-19</td><td>254</td><td>102</td><td>117</td></tr>
<tr><td>2026-09-20</td><td>174</td><td>106</td><td>103</td></tr>
<tr><td>2026-09-21</td><td>349</td><td>93</td><td>88</td></tr>
<tr><td>2026-09-22</td><td>885</td><td>120</td><td>110</td></tr>
<tr><td>2026-09-23</td><td>715</td><td>94</td><td>101</td></tr>
<tr><td>2026-09-24</td><td>4328</td><td>138</td><td>119</td></tr>
<tr><td>2026-09-25</td><td>694</td><td>99</td><td>126</td></tr>
<tr><td>2026-09-26</td><td>1450</td><td>284</td><td>167</td></tr>
<tr><td>2026-09-27</td><td>1111</td><td>207</td><td>133</td></tr>
<tr><td>2026-09-28</td><td>896</td><td>141</td><td>142</td></tr>
<tr><td>2026-09-29</td><td>1203</td><td>253</td><td>226</td></tr>
<tr><td>2026-09-30</td><td>3427</td><td>1120</td><td>300</td></tr>
<tr><td>2026-10-01</td><td>2350</td><td>612</td><td>228</td></tr>
<tr><td>2026-10-02</td><td>2441</td><td>294</td><td>243</td></tr>
<tr><td>2026-10-03</td><td>1977</td><td>476</td><td>240</td></tr>
<tr><td>2026-10-04</td><td>1452</td><td>308</td><td>240</td></tr>
<tr><td>2026-10-05</td><td>2648</td><td>517</td><td>355</td></tr>
<tr><td>2026-10-06</td><td>1870</td><td>299</td><td>229</td></tr>
<tr><td>2026-10-07</td><td>2554</td><td>576</td><td>570</td></tr>
<tr><td>2026-10-08</td><td>2920</td><td>696</td><td>610</td></tr>
<tr><td>2026-10-09</td><td>2159</td><td>388</td><td>459</td></tr>
<tr><td>2026-10-10</td><td>2016</td><td>635</td><td>375</td></tr>
<tr><td>2026-10-11</td><td>2749</td><td>507</td><td>545</td></tr>
<tr><td>2026-10-12</td><td>4347</td><td>750</td><td>643</td></tr>
<tr><td>2026-10-13</td><td>2259</td><td>611</td><td>490</td></tr>
<tr><td>2026-10-14</td><td>2110</td><td>620</td><td>483</td></tr>
<tr><td>2026-10-15</td><td>2102</td><td>402</td><td>455</td></tr>
<tr><td>2026-10-16</td><td>1869</td><td>445</td><td>426</td></tr>
<tr><td>2026-10-17</td><td>2122</td><td>379</td><td>345</td></tr>
</tbody>
</table>
<figcaption><b>Cloudflare's daily totals for aaronorelup.com, 2 Aug to 17 Oct 2026</b><span class="ao-meta">17 Oct is a partial day. Pages = page views, to anyone who asked. Unique visitors = distinct addresses per day. Click a series to switch</span></figcaption>
</ao-series>

Read the way a dashboard invites you to, this is a site taking off: about 145 page views a day
in August and September, over 500 in October, and "unique visitors" up from about 115 a day to
412.

But nothing on that chart is a count of people. Every line counts anything that asked: bots,
scanners and me. Nearly half of October's jump is me alone. From 26 September the Claude app's
built-in browser started checking each post while my agents wrote it, and requests from my own
connection went from about 14 a day to 615.

## Who's actually there

To get to people, Claude took one group away at a time:

<ao-funnel unit="pages">
<ol>
<li><b>Pages served</b> <data value="11637">11,637</data> Every page, 18 Sep to 17 Oct, to anyone who asked.</li>
<li><b>Me and my agents</b> <data value="-1634">−1,634</data> Anything from my home connection: my browser, my phone, the Claude app's browser, and the scripts my agents use to check a post went live.</li>
<li><b>Bots that say so</b> <data value="-3896">−3,896</data> Crawlers Cloudflare has confirmed are who they claim: search engines, AI companies, SEO tools.<ul><li>OpenAI: 2,073 requests across its three bots</li><li>Exa (AI search) 949, Meta 816, Apple 777, Amazon 731</li><li>Googlebot 708, Anthropic's ClaudeBot 480</li></ul></li>
<li><b>Scanners that missed</b> <data value="-326">−326</data> Error pages sent to programs hunting for files this site doesn't have, like WordPress logins and leaked password files.</li>
<li><b>Scripts</b> <data value="-1253">−1,253</data> Requests that name a program instead of a browser.</li>
<li><b>Browsers a year out of date</b> <data value="-3550">~−3,550</data> Things that claim to be browsers, but versions from before October 2025. One "iPhone on iOS 13", from 2019, fetched 1,183 pages. People do run old phones; not this many, this often.</li>
<li><b>Ran the analytics script</b> <data value="290">~290</data> The pages where a real browser ran Cloudflare's script. Ad blockers stop it, so the true number of people sits between this and the ~980 left above.</li>
</ol>
<figcaption><b>The last 30 days in pages, one group removed at a time</b><span class="ao-meta">Page (HTML) responses, 18 Sep to 17 Oct. Bot request counts are for all files, not just pages</span></figcaption>
</ao-funnel>

For every page a person read, machines took at least nine.

The surprise is who the machines are. **AI crawlers, AI assistants and AI search made 6,671
requests in those 30 days, twice the 3,313 from search engines.** One of them, ChatGPT-User,
fetches a page when someone's question in ChatGPT needs it; it came 558 times. On a site this
young, more people may be meeting my posts inside an AI's answer than in a search result, and
no dashboard calls them visitors.

## What people read

The homepage, by a long way, then one post: Jefrie in 3D.

<ao-bars unit="views">
<table>
<thead><tr><th>Page</th><th>Browser page views</th></tr></thead>
<tbody>
<tr><td>Homepage</td><td>1251</td></tr>
<tr><td>Jefrie in 3D, six days of tries</td><td>182</td></tr>
<tr><td>The ledger (list of posts)</td><td>159</td></tr>
<tr><td>The Hidden Curriculum (course)</td><td>136</td></tr>
<tr><td>Sonnet vs Opus, three long tests</td><td>115</td></tr>
<tr><td>REMORA voice lab</td><td>94</td></tr>
<tr><td>AI rigging vs a script</td><td>93</td></tr>
<tr><td>Moonlight in code</td><td>91</td></tr>
<tr><td>Storm Bell fighter</td><td>83</td></tr>
<tr><td>Projects</td><td>82</td></tr>
<tr><td>About</td><td>80</td></tr>
</tbody>
</table>
<figcaption><b>Most-viewed pages, 17 Sep to 16 Oct</b><span class="ao-meta">Successful page loads from browsers, with confirmed bots removed. My own browsing and the disguised bots are still in, and scanners land on the homepage too, so trust the order more than the numbers</span></figcaption>
</ao-bars>

The analytics script gives a cleaner view of where people arrive from outside the site:

<ao-bars unit="visits">
<table>
<thead><tr><th>Page</th><th>Visits from outside</th></tr></thead>
<tbody>
<tr><td>Homepage</td><td>260</td></tr>
<tr><td>Jefrie in 3D, six days of tries</td><td>50</td></tr>
<tr><td>The ledger (list of posts)</td><td>40</td></tr>
<tr><td>Sonnet vs Opus, three long tests</td><td>20</td></tr>
<tr><td>Course lesson: the map of everything</td><td>20</td></tr>
<tr><td>play.aaronorelup.com</td><td>20</td></tr>
</tbody>
</table>
<figcaption><b>Where 570 visits started, 2 Aug to 17 Oct</b><span class="ao-meta">A visit is a page someone reached from outside the site. Cloudflare samples these, so they come in steps of 10</span></figcaption>
</ao-bars>

Both lists agree. Most people come in the front door and look around, and one post pulls readers
in on its own.

**Where they are:** 470 of the 570 visits came from the US, then about 20 each from Japan,
China and South Korea. The raw request count shows far more Germany, the Netherlands and
Singapore, which is where data centres are, so that's scrapers, not readers.

**Where they came from:** mostly unknowable. 550 of 570 visits arrived with no referrer, which
is what a click from X, Discord, email and most apps looks like: the app doesn't pass it on.
Google sent about 20. So I can't yet tell which post on X brought anyone in.

## You, in this data

Your visit to this page is in the same tables, and Cloudflare will show you your own row:

<ao-demo name="cf" part="you">
Ask Cloudflare what it saw of your visit: <a href="/cdn-cgi/trace">/cdn-cgi/trace</a> (the demo needs JavaScript).
</ao-demo>

## If you start a site like this

What I'd tell anyone starting out, from these 77 days:

- **Most of your traffic will be machines.** Here, about nine pages in ten.
- **AI companies will find you before people do.** Within weeks, and twice as often as search
  engines.
- **Scanners will try doors you don't have.** A quarter of all requests here were "not found"
  errors, mostly programs looking for WordPress logins and leaked password files. On a simple
  static site like this one, that's harmless background noise.
- **You will be one of your biggest visitors.** Me and my agents made a quarter of all requests.
  Take yourself out before you read any number.
- **The visitor count will flatter you.** "412 unique visitors a day" was 10 to 33 people.
- **You won't know where people came from** unless you mark your own links (below).
- **Early numbers are small, and that's normal.** This is 55 posts with no promotion at all.

## What I'm doing about it

Already done, with this post:

1. **A `favicon.ico`.** Browsers ask for it by name, and the site only had an SVG icon: 512 "not
   found" errors in 30 days.
2. **A sitemap, and a robots.txt that points to it,** so crawlers stop guessing at pages.
3. **Logging switched on** for the site's Worker (the small program that serves its video), so
   errors get kept.
4. **A reader counter of my own.** It counts a browser that stays on this post for a few seconds,
   once a day, and keeps only the post, the day and the country:

<ao-demo name="cf" part="count" data-slug="who-visits-a-new-website">
The live counter needs JavaScript.
</ao-demo>

Next:

1. **Tag every link I share.** `?ref=x`, `?ref=bluesky`, `?ref=devto` on the end of each link,
   and teach the counter to keep the tag. Then "which post brought people in?" has an answer.
2. **Take myself out first, every time.** Any number I read starts with my own connection removed.
3. **Promote something, and watch.** This is the baseline: 10 to 33 people a day. The next post I
   share, tagged, shows whether that number moves.
4. **Decide whether I need time on page.** Cloudflare counts page loads, not reading. Knowing
   whether people scroll or leave needs a small script of my own, or a privacy-friendly tool
   like Plausible or Umami. Not yet.

<details>
<summary>The questions I asked, if you want to ask your own site</summary>

Copy any of these and swap in your domain. Each shows the query Claude wrote, trimmed.

<ao-ask>
<details data-via="Analytics" data-tool="graphql_query"><summary>How much traffic has my site had since it launched?</summary><pre>httpRequests1dGroups(limit: 100, filter: {date_geq: "2026-08-01"}, orderBy: [date_ASC]) {
  dimensions { date }
  sum { requests pageViews bytes }
  uniq { uniques }
}</pre><p>96,961 requests and 18,485 page views in 77 days. The first chart above is this answer.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>How much of it is bots?</summary><pre>httpRequestsAdaptiveGroups(limit: 20, filter: {datetime_geq: "2026-09-18T00:00:00Z"}, orderBy: [count_DESC]) {
  count
  dimensions { verifiedBotCategory }
}</pre><p>One request in five comes from a bot that says so. The other four in five don't say, which is where the work starts.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>How much of the traffic is me?</summary><pre>httpRequestsAdaptiveGroups(limit: 12, filter: {…, clientIP: "&lt;my address, from /cdn-cgi/trace&gt;"}, orderBy: [count_DESC]) {
  count
  dimensions { userAgentBrowser }
}</pre><p>14,203 of 56,384 requests: a quarter of everything.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>What are all the "not found" errors?</summary><pre>httpRequestsAdaptiveGroups(limit: 50, filter: {…, edgeResponseStatus: 404}, orderBy: [count_DESC]) {
  count
  dimensions { clientRequestPath }
}</pre><p>14,946 of them. The top one was my fault (/favicon.ico, 512). Then /wp-admin/install.php 389, /.env 174, /.git/config 120: scanners.</p></details>
<details data-via="Analytics" data-tool="graphql_query"><summary>Where do my visitors come from?</summary><pre>httpRequestsAdaptiveGroups(… dimensions { clientRefererHost })
rumPageloadEventsAdaptiveGroups(… dimensions { refererHost })</pre><p>The first was refused: the free plan doesn't keep referrers on requests. The analytics script does, sampled, and most visits had none.</p></details>
</ao-ask>

Limits on Cloudflare's free plan: request-level detail goes back 31 days (daily totals a year),
no referrers on requests, and after about 15 questions in a few minutes the connection asks you
to wait five.

</details>

The dashboard said 412 visitors a day. Every useful number in this post came from asking "and
who was that?" one more time, which is tedious by hand and takes an agent a minute. I built the
site for people, and most of what reads it is machines and me. The people are a small number,
and now one I can watch.
