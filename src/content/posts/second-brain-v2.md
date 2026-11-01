---
id: "AO-013"
title: "Rebuilding my second brain for AI agents, research first"
summary: "An AI built my first second brain in one shot, and agents got 6 of 10 lookups right from it, so I rebuilt it research first. The rules I ended up with, the retest, and what it cost."
date: 2026-08-15
status: "shipped"
tags: ["second-brain", "agents", "notion", "claude-code"]
topic: "agents"
project: []
preview:
  verdict: "Lookup test: 6/10 to 9/10"
  takeaway: "After the rebuild, agents got 9 of 10 lookup questions right instead of 6, and the one confident wrong answer, caused by stacked-up corrections, was gone."
  points:
    - "Give every fact one home and fix mistakes in place. The old wrong answer came from a pile of added-on corrections."
    - "Pages of 750 to 4,000 words work better for agents than the usual advice of short, 250-word notes."
    - "Notion over files on my PC: no AI phone app can read a local folder, and all the big AI apps can connect to Notion."
  image: "/media/previews/second-brain-v2.webp"
  alt: "A brain built from stacked paper index cards, one card pulled halfway out and glowing gold"
---

I've seen a lot of people building second brains lately. A second brain stores what's in your
head somewhere agents can use it. I had Fable 5 build mine in one shot, with poor results. I
tried again: research first, then rules, then migration. Here's what I got.

**On the same 10-question lookup test, agents went from 6 right answers to 9, and the one
confidently wrong answer went away.**

Fable 5 is one of Claude's models. My second brain lives in Notion, a notes app. The test hands
a fresh agent, one with no other context, 10 questions to answer from it.

<ao-bars max="10" unit="of 10">
<table>
<thead><tr><th>Version</th><th>Right answers</th></tr></thead>
<tbody>
<tr><td>First version, built in one shot</td><td>6</td></tr>
<tr><td>Rebuilt, research first</td><td>9</td></tr>
</tbody>
</table>
<figcaption><b>The same 10 questions, answered by a fresh agent</b><span class="ao-meta">Both versions took about 9 steps per question on average, where a step is one tool call, like a search or a page read. 9.1 before, 8.7 after. The first version's one confident wrong answer is gone in the second.</span></figcaption>
</ao-bars>

The big changes, in short. Every fact gets one home. Mistakes get fixed in place instead of
corrected on top. The agents' rules live in one short rulebook. And the agents get three narrow
jobs, with no big agent reorganizing everything on its own.

If you're building your own, point your agent at this post and at
[The Second Brain Builders](/research/second-brain-builders/), my research on 15 people who
built one. There's a plain-text link at the top of that page made for agents.

## The rules

### Where it lives

- **Notion, not files on my computer.** No AI app on a phone can read a folder on my laptop,
  and all the big AI apps can connect to Notion through its MCP server (MCP is the standard way
  AI apps plug into other tools). So there's nothing for me to host or build.
- **I can leave any time.** Every week a script copies every page out as plain text files to my
  computer, and every month a zip goes to a second cloud. I tested the copies on real pages and
  they came out clean.
- **Sensitive stuff never goes in.** It stays in an encrypted folder on my computer. The second
  brain only holds a note saying it exists.

<details><summary>Why Notion and not text files on GitHub</summary>

- In August 2026, when I built this, ChatGPT, Grok and Gemini had no simple way to write to a
  GitHub repository.
- Signing an AI app in to GitHub gives it the whole repository, so private pages can't be kept
  apart from the rest.
- I'm on Notion's Plus plan.

</details>

### How it's organized

- **Every fact lives in one place.** Each live topic has one hub page that holds where things
  stand now, and everything else links to it. Both failures in my lookup test traced back to not
  having this rule.
- **Numbered sections for filing, links for finding.** The top level is numbered sections with
  little nesting, and each number is a permanent address that's never changed or reused. Niklas Luhmann,
  a German sociologist, ran 90,000 note cards that way. Links and hub pages do the finding.
- **The categories stay open.** When things stop fitting cleanly, or an index passes about 25
  entries, a set procedure adds a new section. A fixed list of categories doesn't hold up.

### How it's written

- **One rulebook, stated once.** A single page of about 20 numbered rules, written as orders,
  with no explaining. Each section gets a note of 150 words or less that points to rule numbers.
  Agents skim long instructions, and rules that get copied drift apart. Mine did.
- **Pages of 750 to 4,000 words.** Split only where the topic really changes. The research found
  that length works best when an agent searches the notes itself. The usual advice of 250-word notes was made
  for AI search that pulls up small chunks of text, and here it costs accuracy.
- **Every fact is timeless, dated, or a link to a source that stays up to date.** A fact that can go out of date
  carries the date it goes stale, and a weekly sweep catches the ones that expire.
- **Mistakes get rewritten in place.** No correction stacked on top of the old claim. That pile-up
  was the first version's worst failure.

<details><summary>Smaller rules: databases, page summaries, titles and tags</summary>

- Things that repeat get databases, and everything else is a page. Projects, ideas, a list of
  stored documents and agent output each get a database with their own fields, never one giant
  table. Anything that's really writing is a page.
- Every page starts with a one to three sentence summary.
- Titles are in English, with one unique word you can search for.
- Every page is tagged with its type, its status, tags and the date it goes stale.

</details>

### What the agents do

- **Everything an agent writes starts as a proposal.** It goes into a Proposals database first.
  Accepted ones get filed, reference ones get shelved and rejected ones get deleted. Anything untouched
  for 60 days gets flagged and deleted 14 days later. The deleting has to be real, or the whole
  thing only gets heavier.
- **Three narrow jobs, on the AI subscription I already pay for.** The librarian is any chat
  session with the rulebook loaded, and it files, finds and updates things when I ask. The drain
  is a daily scheduled job that sorts the inbox, so I can drop notes in without sorting them. The
  steward runs weekly. It hunts stale facts, contradictions and out-of-date indexes, does the
  deletions and checks the backup. Once a month it also adds up some numbers on how the whole
  thing is doing. No big agent reorganizes everything on its own. Narrow jobs on
  a schedule are the version that works.

<details><summary>Four small rules that do quiet work</summary>

- Every input either matches a filing rule or lands in the inbox, so no agent makes a judgment
  call about where it goes.
- An agent that adds or moves a page updates its index in the same session.
- A claim taken from a stored document links back to that document.
- When the rules don't fit the situation, the agent stops and asks me instead of improvising.

</details>

## What was wrong with the first version

Fable 5 built it in one go, and it reached 114 pages, about 130,000 words. Some of it
was honestly good. It had a set rule for where every note goes, instruction files for agents in
each section, and a sealed-off space for sensitive stuff.

Two of its flaws led straight to rules in the list above.

- **The agent rules were copied everywhere.** 9,100 words of them, with the same rules restated
  in up to 10 files. Two of the copies had already drifted apart.
- **Corrections piled up on top of old claims.** The old claims stayed, so the truth got buried.
  The test's one confident wrong answer came straight from one of those piles.

<details><summary>Everything else that was wrong with it</summary>

- No page had any tags or dates at all.
- Its list of categories was closed, and things were already straining to fit it.
- 27% of all the pages were agent output nobody had reviewed, with no rule for when it gets
  filed or deleted.
- 11 of the 14 database rows were template placeholders.

</details>

## What other people built

I also had agents profile 15 people who built a second brain and wrote about it, from Andrej
Karpathy to people running a few hundred notes. Only 6 of the 15 built theirs for agents, so
there isn't much to copy yet, and those 6 mostly agree. The full profiles are in
[The Second Brain Builders](/research/second-brain-builders/).

That page carries one correction. It first said Wes Roth, an AI YouTuber, had no documented
system, so the count went out as 5. He has one. It's a full build of Karpathy's design for a wiki
that an AI keeps up. It lives in Obsidian, another notes app, and Claude's coding tool, Claude
Code, runs it. His profile now explains how the research missed it.

## What the rebuild took

Three sessions over two days, two of research and one to move everything over.

<details><summary>Agents, tokens and time for each session, from the session logs</summary>

Tokens are the chunks of text AI models read and write. Cache reads are text a model re-reads
from a cheap memory of the conversation so far.

| Session | Agents | Output tokens | Cache read | Wall clock |
|---|---|---|---|---|
| Research 1: deep research and checking (Aug 14) | 81 | 306k attributed | 20.7M | 35 min |
| Research 2: tests, a head-to-head comparison, the 15 builders (Aug 15) | 48 | 1.07M | 69.3M | 176 min |
| Migration: 5 workflows, plus agents filling the gaps (Aug 15) | 91 | ~1.44M | ~92M | ~2 h |

- Fable 5 ran the whole thing. Two other Claude models did the rest. Sonnet did the searching,
  fetching, checking and mechanical passes. Opus did the distilling, the judging and the delicate
  rewrites.
- Every claim in the research went to three other agents, each trying to prove it wrong. 11 held
  up, 4 were contested and 1 was refuted.
- The research runs had zero agent errors. In the migration, some agents refused to bulk-export
  my notes because they couldn't confirm I'd really asked for it. I think that's a good instinct.
  What fixed it was giving them proof I'd asked, not louder instructions. The only other
  failures were two false alarms from Claude's safety filter.

</details>

*About 130 Claude agents did the research and checked each other's claims.*
