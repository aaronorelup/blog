---
id: "AO-013"
title: "Second Brain, v2 — a ledger"
summary: "Research-first rebuild of my agent-facing second brain: the rules, the measured before/after, 15 named builders, and the bill."
date: 2026-08-15
status: "shipped"
tags: ["second-brain", "agents", "notion", "claude-code"]
preview:
  verdict: "Retrieval: 6/10 to 9/10"
  takeaway: "An agent-facing second brain breaks on duplication: give every fact one home, rewrite corrections in place instead of stacking them, and state the rules once."
  points:
    - "v1's one confidently wrong answer traced to an append-only stack of corrections. v2 rewrites in place, and had none."
    - "Pages of 750-4,000 words, not ~250-word atomic notes: that advice is vector-search thinking and costs agents accuracy."
    - "Notion over markdown in git: no vendor's phone app reads a local vault, and every major vendor can attach Notion's MCP."
---

*Research: 2026-08-14/15, ~130 agents, claims adversarially verified (3 refutation votes each; 11 confirmed / 4 contested / 1 refuted). Migration: 2026-08-15. Reproduction ledger, not a tutorial. Point your agent at this post and [The Second Brain Builders (RE-001)](/research/second-brain-builders/) (a raw-markdown link for your agent sits at the top of that page) for a head start — the research is pre-synthesized.*

I've seen a lot of people building second brains lately. A second brain stores what's in your head somewhere agents can use it. I had Fable 5 build mine in one shot, with poor results. I tried again — research first, then rules, then migration. Here's what I got.

## Rules

**Platform: Notion (Plus tier), held to an exit-ready standard.** Not markdown-in-git: no vendor's phone app can read a local vault, and as of 2026-08 there is no turnkey write-capable GitHub path for ChatGPT, Grok, or Gemini — plus GitHub OAuth is repo-wide, which breaks sensitive-content containment. Access layer = Notion's hosted MCP server; every major vendor can attach it; nothing to host or build. Exit: weekly one-way API markdown pull into a local git repo, monthly zip to a second cloud. Fidelity tested on real content including Japanese — clean.

**Structure: shallow numbered roots for filing; wiki links and hub pages for finding.** Root numbers are permanent addresses — never renumbered, never reused (Luhmann's mechanism, proven at 90k cards). The taxonomy is open: a new root is created by procedure when items stop routing cleanly or an index passes ~25 entries. Closed taxonomies leak.

**Databases where schema repeats; pages where narrative resists schema.** Projects, idea pipeline, document registry, agent output → databases, each with its own schema, never one mega-table. Prose → pages.

**One hub page per live topic owns current state.** Every fact lives in exactly one place; everything else links to it. Both failures in my retrieval test traced to this rule not existing.

**One contract, stated once.** A single rulebook page: ~20 numbered, imperative rules, no justification prose. Per-root stubs ≤150 words that cite rule numbers. Evidence: agents skim long prose instructions; duplicated rules drift (mine measurably did).

**Four small operational rules do quiet work.** Routing is deterministic — every input either matches a rule or lands in the inbox, never a judgment call. Index pages are contracts: add or move a page, update its index in the same session. Claims sourced from a stored document link back to that document. And when the rules conflict with the situation, the agent stops and asks instead of improvising.

**Pages: 750–4,000 words, split only at real topic boundaries.** The measured optimum for agentic retrieval. Atomic-note advice (~250 words) is vector-RAG thinking — wrong regime, costs accuracy. Every page opens with a 1–3 sentence TL;DR. English titles with a unique searchable token. Meta on everything: type / status / tags / stale-after.

**Every stored fact is timeless, dated, or a pointer to a live source.** Rot-prone facts carry stale-after dates; a weekly sweep catches expirations. Corrections rewrite in place — append-only correction stacks were v1's worst measured failure.

**Everything agent-authored enters a Proposals database with a lifecycle.** Accepted → filed. Reference → shelved. Rejected → deleted. Untouched 60 days → flagged, deleted 14 days later. Deletion is real, or the system only gets heavier.

**Three narrow agent roles, riding the AI subscription you already pay for.** Librarian: any session plus the contract — files, finds, updates on request. Drain: daily scheduled task that classifies the capture inbox (capture itself is zero-triage). Steward: weekly staleness/contradiction/index sweep, lifecycle deletions, backup diff; monthly metrics. No grand autonomous reorganizer — narrow scheduled jobs are the version that works.

**Sensitive material never enters the workspace.** Local encrypted folder; the brain holds a pointer saying it exists.

## The original results

The one-shot build produced 114 pages / ~130k words in 13 days. Genuinely good: a deterministic routing algorithm, per-section agent instruction files, a contained sensitive vault. Measured flaws: zero metadata on any page; 9,100 words of agent rules, ~45% operational, the same rules restated in up to 10 files — two copies had already drifted apart; append-only corrections buried truth under stale claims (a cold-agent retrieval test scored 6/10 at ~9 tool calls average, and its one confident wrong answer traced directly to a correction stack); a closed taxonomy already under pressure; 27% of all pages were unreviewed agent run-output with no lifecycle; 11 of 14 database rows were template placeholders.

## What others have done

Fifteen named builders profiled (2026-08-15, strict no-embellishment rule — absences reported as absences). Full architectures and lessons: [The Second Brain Builders (RE-001)](/research/second-brain-builders/) (a raw-markdown link for your agent sits at the top of that page).

**Big tech:** Karpathy (one plain-text note; separately the LLM Wiki pattern — immutable sources, LLM-owned wiki, co-evolved schema, ingest/query/lint). Cherny (CLAUDE.md as living contract; "auto-dream" consolidation subagent). Willison (blog + TILs + GitHub issues as public memory; "current vs temporal" docs). Wolfram (metasearch over 30 years of everything). Johnson (1.3M words of highlights in 15 consolidated files behind NotebookLM).

**Creators:** Wes Roth — a full Obsidian + Claude Code build of Karpathy's LLM Wiki pattern (video + written guide, July 2026). *Correction: this research originally published him as a confirmed negative — the profile now carries the correction and the anatomy of that error.* Forte (PARA by actionability; "canonical home" per data type; pivoting PKM → Personal Context Management). Eliason (boom-era Roam teacher; now argues most note-hoarding is dead). Poulin (loose PARA in Notion; areas as pages over filtered database views). Milo (Maps of Content = hub pages).

**Practitioners:** Reitz (467-note vault run by Claude Code; ~200-line CLAUDE.md "API contract" whose first section is What NOT To Do). Brier (~1,500 notes; agent launched from vault root so it sees everything). Michalski (572k thoughts in TheBrain since 1997; no folders; no-orphan rule). karlicoss (export everything raw and immutable; normalize at read time; his data outlived the services). Ghelbur (closest analogue: index.md + log.md + 120-token always-loaded facts file; ingest rewrites, never appends; enforced inbox drain; measured 77% recall on paraphrased queries — keep semantic search in the loop).

Headline: 6 of 15 document an agent-facing system (originally published as 5 — the Wes Roth miss, corrected). The design space is young; the real precedents mostly agree.

## The bill (proof of work, measured from transcripts)

| Session | Agents | Output tokens | Cache read | Wall clock |
|---|---|---|---|---|
| Research 1 — deep research + verification (08-14) | 81 | 306k attributed | 20.7M | 35 min |
| Research 2 — tests, bake-off, builders (08-15) | 48 | 1.07M | 69.3M | 176 min |
| Migration — 5 workflows + gap agents (08-15) | 91 | ~1.44M | ~92M | ~2 h |

Models: Sonnet for search/fetch/verify/mechanical passes, Opus for distill/synthesize/judge and the delicate rewrites, Fable 5 orchestrating. Zero agent errors across the research runs; the migration's only failures were refusals (subagents declining bulk-export tasks they couldn't corroborate as user-authorized — the skepticism is a feature; fixed with verifiable evidence, not louder instructions) and two unrelated API safeguard false positives. Result the numbers paid for: the same 10-question cold-agent retrieval test went from 6/10 correct at 9.1 tool calls (v1) to 9/10 at 8.7 (v2), with the one confidently-wrong answer eliminated.
