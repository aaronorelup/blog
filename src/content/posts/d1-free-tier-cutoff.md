---
id: "AO-072"
title: "My 68,000-file library hit Cloudflare D1's free limit in four days. A few queries read every row, on timers"
summary: "When my digiKam library moved into Cloudflare D1, my account went from reading about 46,000 database rows a day to an average of 4.1 million. The free plan allows 5 million for the whole account, and on 27 October D1 refused every query for five hours. What to expect, and what to do first."
date: 2026-10-28
status: "note"
tags: ["cloudflare", "d1", "sqlite", "lessons", "claude-code"]
series: ["the-site"]
preview:
  verdict: "Cut off on day four"
  takeaway: "D1 bills every row a query scans, not the rows it returns. One page's summary read all 68,000 rows on each load and was half the worst day."
  points:
    - "The summary's query had an index made for it, and SQLite ignored it. INDEXED BY took a load from 68,687 rows to 1,062."
    - "Run EXPLAIN QUERY PLAN on every query that runs often. SCAN means every row, even when it says USING INDEX."
    - "Take Workers Paid ($5 a month) first: no daily cutoff, and 4.1 million rows a day is 0.5% of what it includes."
---

In the first half of October my Cloudflare account read 40,000 to 56,000 database rows a day,
about 1% of what the free plan allows. On 18 October my agents moved my digiKam library, 68,000
files, into my command centre: a Cloudflare Worker with a D1 database (Cloudflare's hosted
SQLite) behind it. From that day the account read 2.4 to 5.3 million rows a day, and on the
fourth day it went over the free limit of 5 million. **D1 counts every row a query scans, not
the rows it returns, and a few of the library's queries read the whole table every time they
ran, some of them on timers.**

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

On 27 October the account read 5.17 million rows, about the whole library 75 times over, and
passed 5 million at about 18:47 UTC. Since 1 September, going over means D1 refuses every query
on the account until midnight UTC. From 19:00, it did. The limit is per account, so my blog's
small database was refused too. The site's pages stayed up, because they are static files; only
`/api/stats`, behind its stats page, broke.

## How to do it instead

- **Take the $5 plan before you move anything big in.** Workers Paid has no daily cutoff and
  includes 25 billion rows read a month. Even my wasteful 4.1 million a day is 0.5% of that. I
  took it after the third day over.
- **Run `EXPLAIN QUERY PLAN` on every query that runs often, on a copy as big as the real
  thing.** `SCAN` means every row, even when it says `USING INDEX`. SQLite picks its own plan,
  whatever indexes you made; `INDEXED BY` overrules it. D1 returns `meta.rows_read` with every
  result, so each query's cost is there to read.
- **Never put a whole-table query on a timer.** Keep running counts in a table, and have
  background jobs ask only about what changed since they last looked.
- **Count reads like you count writes.** The library budgeted every write and never counted a
  read, so ten days at an average of 82% of the limit went by unnoticed.

## Where the 5 million went

Claude audited 27 October from the Worker's logs and D1's analytics, then fixed every query.
Rows read per call, before and after, on the live database:

- **The library page's summary: 2.6 million, half the day.** It counted the 531 files agents had
  picked, trusting a partial index to skip the rest. SQLite ignored the index and scanned all
  68,000, on every load, every two minutes while the page was open, and from two hourly laptop
  jobs. With `INDEXED BY`: 68,687 → 1,062.
- **The sweeper and other background jobs: 1 million.** Every 15 minutes the sweeper looked up
  every recent upload again, even files it had filed days before. Asking only about new ones:
  about 11,600 rows a tick → under 200 on a quiet one (on a full-size copy).
- **My agents' `studio find --run`: 0.7 million.** Nothing indexed the run column. With an index,
  a one-file run: 68,156 → 2.
- **A laptop job's list of my loves: 0.4 million.** Only 108 files are loved, so a page of 200
  never filled and the scan ran to the end of the table. Sorted by the loved index: 68,156 → 108.

The indexes went live at 02:37 UTC on 28 October, and `find --run` has read 2 rows a call since.
The rest of the code went live at 05:40 UTC the same morning: the library's summary now reads
1,831 rows instead of about 70,000, and every response says how many rows it read. The account
should settle near 0.6 to 0.7 million rows a day, about a sixth of what it was.

68,000 rows is a small table for SQLite. Reading all of it 75 times a day is not.
