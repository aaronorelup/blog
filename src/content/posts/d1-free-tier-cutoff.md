---
id: "AO-072"
title: "My media library hit Cloudflare's free database limit in four days"
summary: "My agents moved my 68,000-file media library into a Cloudflare D1 database, and on the fourth day Cloudflare cut off every database on my account. Why it happened, and what to set up first."
date: 2026-10-28
status: "note"
tags: ["cloudflare", "d1", "sqlite", "lessons", "claude-code"]
series: ["the-site"]
topic: "site"
project: []
preview:
  verdict: "Cut off on day four"
  takeaway: "Cloudflare's database counts every row a query looks through, not just the ones it returns, and one page looked through all 68,000 on every load."
  points:
    - "The library page was half the reads on the worst cutoff day. Making it use its index cut 68,687 rows a load to 1,062."
    - "D1 reports how many rows each query read. Check that number for every query that runs often."
    - "Pay for the $5 a month plan first. It has no daily cutoff, and my 4.1 million rows a day is 0.5% of what it includes."
  image: "/media/previews/d1-free-tier-cutoff.webp"
  alt: "An empty tea caddy tipped on its side, its lid beside it and three golden tea leaves spilled out"
---

My agents moved my media library into a Cloudflare database on 18 October, and on the fourth
day it went over the free plan's daily limit. Cloudflare then refused every database query on
my account until midnight. **The database counts every row a query (a question to the database)
looks through, not just the rows it hands back, and a few of the library's queries looked
through the whole table every time.** Some ran on timers. One page read all 68,000 rows on
every load.

The library is where everything my agents make gets filed for me to review, about 68,000 files.
It moved off my laptop into my command center, the private dashboard my agents post to. That runs
on Cloudflare with a D1 database behind it. D1 is Cloudflare's hosted SQLite, a small and very
common database. Each file is a row, and the free plan lets a whole account read 5 million rows a
day. In early October mine read about 46,000 a day. From the day the library moved in, it read
2.4 to 5.3 million.

<ao-series>
<table>
<thead><tr><th>Day</th><th>Rows read</th></tr></thead>
<tbody>
<tr><td>2026-10-01</td><td>44637</td></tr>
<tr><td>2026-10-02</td><td>43563</td></tr>
<tr><td>2026-10-03</td><td>45431</td></tr>
<tr><td>2026-10-04</td><td>46881</td></tr>
<tr><td>2026-10-05</td><td>56320</td></tr>
<tr><td>2026-10-06</td><td>49302</td></tr>
<tr><td>2026-10-07</td><td>48010</td></tr>
<tr><td>2026-10-08</td><td>46948</td></tr>
<tr><td>2026-10-09</td><td>46729</td></tr>
<tr><td>2026-10-10</td><td>46829</td></tr>
<tr><td>2026-10-11</td><td>45678</td></tr>
<tr><td>2026-10-12</td><td>43741</td></tr>
<tr><td>2026-10-13</td><td>40154</td></tr>
<tr><td>2026-10-14</td><td>43976</td></tr>
<tr><td>2026-10-15</td><td>43798</td></tr>
<tr><td>2026-10-16</td><td>45026</td></tr>
<tr><td>2026-10-17</td><td>24508</td></tr>
<tr><td>2026-10-18</td><td>2948898</td></tr>
<tr><td>2026-10-19</td><td>3091746</td></tr>
<tr><td>2026-10-20</td><td>4672589</td></tr>
<tr><td>2026-10-21</td><td>5273527</td></tr>
<tr><td>2026-10-22</td><td>3020763</td></tr>
<tr><td>2026-10-23</td><td>2408027</td></tr>
<tr><td>2026-10-24</td><td>5249487</td></tr>
<tr><td>2026-10-25</td><td>4354757</td></tr>
<tr><td>2026-10-26</td><td>4974670</td></tr>
<tr><td>2026-10-27</td><td>5173282</td></tr>
</tbody>
</table>
<ol>
<li data-d="2026-10-18">The library goes live</li>
<li data-d="2026-10-21">Over the limit: D1 refuses queries from about 21:00 UTC</li>
<li data-d="2026-10-24">Over the limit at 23:54 UTC</li>
<li data-d="2026-10-27">Over at 18:47 UTC: every query refused from 19:00 to midnight UTC</li>
</ol>
<figcaption><b>Rows read per day by my Cloudflare account, 1 to 27 October 2026</b><span class="ao-meta">Every D1 database on the account, from Cloudflare's own analytics. The free plan allows 5,000,000 a day in total</span></figcaption>
</ao-series>

It went over three times. On the 27th the account read 5.17 million rows, about the whole
library 75 times over, and every query was refused for the last five hours of Cloudflare's day.
The limit covers the whole account, so this blog's small database got refused too. The pages
stayed up because they're plain files. Only the numbers behind the [stats page](/stats/) broke.

## What I'd do instead

- **Take the $5 plan before you move anything big in.** Cloudflare's Workers Paid plan has no
  daily cutoff and includes 25 billion rows read a month. My wasteful average of 4.1 million a
  day is 0.5% of that. I took it after the third day over.
- **On a full-size copy, ask the database how it plans to answer every query that runs often.**
  `EXPLAIN QUERY PLAN` shows the plan without running the query. `SCAN` means every row, even
  when it also says `USING INDEX`. An index is a sorted lookup list, like the one at the back of
  a book. SQLite picks its own plan, and `INDEXED BY` makes it use the index you name. D1 also returns how many
  rows each query read (`meta.rows_read`).
- **Never put a whole-table query on a timer.** Keep running counts in their own table, and have
  background jobs ask only about what changed.
- **Count reads like you count writes.** The library budgeted every write and never counted a
  read, so ten days at an average of 82% of the limit went by unnoticed.

## Where the 5 million went

Claude went through the 27th from the logs and D1's own analytics, then fixed every query. Here's
what used the most that day, and what one call read before and after:

- **The library page's summary: 2.6 million, half the day.** It counted the 531 files agents had
  picked, with an index made just for those. SQLite ignored it and read all 68,000 rows every
  time. The page ran it on every load and every two minutes while it was open, and two laptop
  jobs ran it every hour. `INDEXED BY` took it from 68,687 rows to 1,062.
- **The sweeper and other background jobs: 1 million.** The sweeper files new uploads. Every 15
  minutes it looked up every recent one again, even ones it had filed days before. Asking
  only about new ones took a run from about 11,600 rows to under 200.
- **My agents' search for one job's files: 0.7 million.** Nothing indexed the column it searches.
  With an index, a one-file job went from 68,156 rows to 2.
- **A laptop job listing the files I've loved: 0.4 million.** It asked for 200 at a time and
  only 108 are loved, so it never got its 200 and searched to the end of the table. Sorted by an
  index of loved files, it went from 68,156 rows to 108.

## After the fixes

Everything went live early on 28 October. The live library summary now reads 1,831 rows instead
of about 70,000. The account should settle near 0.6 to 0.7 million rows a day, about a sixth of
what it was.

<details><summary>The exact times and how each number was measured</summary>

- The account went over the limit at about 21:00 UTC on 21 October, at 23:54 UTC on 24 October
  and at about 18:47 UTC on 27 October. On the 27th every query was refused from 19:00 to
  midnight UTC.
- Since 1 September, going over the free limit means D1 refuses every query on the account
  until midnight UTC.
- The rows-per-day numbers are for every D1 database on the account, from Cloudflare's own
  analytics.
- The new indexes went live at 02:37 UTC on 28 October. The rest of the code went live at 05:40
  UTC the same morning.
- The sweeper's before and after (about 11,600 rows a run down to under 200, on a quiet run) was
  measured on a full-size copy of the database. The other before and after numbers are from the
  live one.
- My agents' search for one job's files is the command `studio find --run`. It has read 2 rows a
  call since the indexes went live.
- Every response from the library now also says how many rows it read.

</details>
