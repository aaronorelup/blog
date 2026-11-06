---
id: "AO-078"
title: "Three ways an AI can answer questions from my blog"
summary: "I had Claude test three ways an AI model can answer from my 72 posts: reading them all at once, a search that hands it the closest passages, and an agent with search tools. What each is best at, with real runs."
date: 2026-11-06
topic: "site"
project: []
draft: true        # until Aaron says it's good, in his own words
preview:
  verdict: "Three ways, three jobs"
  takeaway: "Reading all 72 posts at once matched an agent on whole-blog questions in a seventh of the time. A passage search kept up only on find-that-post questions."
  points:
    - "Only the agent found all 5 posts that used RunPod, and counted my September posts right: 12. Reading it all said 15."
    - "My Ask box, RAG Goobie, is mostly the read-it-all kind. Its search only names the 6 most related posts as a hint."
    - "Claude Code dropped RAG for grep-style search. Cursor found adding meaning search back made answers 12.5% more accurate."
  image: "/media/previews/three-ways-to-search-my-blog.webp"
  alt: "Three bars of my 72 posts: reading it all lights every post, the passage search slivers of 5, the agent parts of 16"
---

My blog has an Ask box, [RAG Goobie](/ledger/), that answers questions from my posts. I'd been calling it RAG without being sure, and I keep hearing the best AI agents have dropped RAG for agentic search. So I had Claude test the three ways an AI model can work from a pile of documents on my 72 posts, each on the questions it should be best at. **RAG Goobie is mostly the first way: it reads every post on every question.** Each way was the best pick for its own kind of question, and every run below is real.

An AI model answers from its context window, the text it reads right before it writes. That's counted in tokens, a word or a piece of one. RAG, short for retrieval-augmented generation, means looking things up first and handing the model what turned up. The three ways differ in what goes into the window, who picks it, and when.

- **In-context: everything goes in.** All 72 posts, about 240,000 tokens, on every question, for under a tenth of a cent with a cache. It matched the agent on whole-blog questions in a seventh of the time.
- **Classic RAG: a search picks, before the model starts.** The 8 chunks of the blog closest in meaning to the question go in, about 2,000 tokens. It matched the other two on find-that-post questions with a hundredth of the reading, and fell apart on everything else.
- **Agentic search: the model picks, as it goes.** It gets tools to list posts, search for exact words and read a section, and decides what to look up next. It was the most accurate overall and the only one that got every RunPod post and the September count right, but the slowest, up to half a minute.
- **The best agents mix them.** Claude Code dropped its search index for exact-word search, but other tools keep meaning search beside it, and most business AI still runs on classic RAG.

<ao-demo name="goobie-lab" part="windows">What each way saw of the blog: reading it all, every word of all 72 posts. The passage search, 8 chunks from 5 posts. The agent, the lines and sections its tools returned from 16.</ao-demo>

## What RAG Goobie actually is

A hybrid, mostly the first way. On every question the call that writes the answer gets its rules, every listed post in full, then the question. A quick first AI call writes a few searches and a meaning search runs, but today all that does is name the 6 most related posts beside the question, as a hint. No post is left out because of it.

That changes when the blog outgrows one prompt. Past about 600,000 estimated tokens, around 140 posts by its own notes, it switches to what its code calls split mode, and the search starts deciding which posts go in. That part is classic RAG, a whole post at a time. It never decides to look again or picks a tool, so it isn't agentic.

## In-context: the whole blog in one prompt

This way is best when the answer is spread over the whole blog: what lessons I keep relearning, which experiments didn't work out, what AI agents are still bad at. Each answer drew on 7 to 12 posts in under 4 seconds, for less than a tenth of a cent.

<ao-demo name="goobie-lab" part="context">Every post in one prompt: 240,083 tokens, 99.9% of them from the cache, an answer in 3.4 seconds for $0.0009. The first question after a change read them all at full price, $0.036.</ao-demo>

- **The cache is the whole trick.** Every question starts with the same 240,000 tokens, so the model's provider keeps them and charges a fiftieth for them. The first question after I publish or edit a post pays full price, about 3.6 cents.
- **The agent got about as far, slowly.** It read post after post, 17 to 29 seconds, at 2 to 6 times the cost. Classic RAG had nothing to say, because its 8 chunks came from 3 to 6 posts, mostly my long film making-ofs.
- **It miscounts.** Asked how many posts I published in September, it said 15. It was 12.
- **It has a ceiling.** The blog fills a quarter of the model's window today. Somewhere around 300 posts it won't fit at all.

## Classic RAG: the closest passages

This way is best when the question is about one thing and you only need to find it, even in words the post never uses. "Did a cloud agent ever push something broken to the real site?" found [the post about my stale branch going live](/ledger/the-branch-that-went-live/), which never says broken.

<ao-demo name="goobie-lab" part="rag">The question is turned into numbers, compared with 1,005 chunks, and the 8 closest go to the model: about 2,500 tokens, an answer in 2.2 seconds for $0.0005.</ao-demo>

- **Same answers, a hundredth of the reading.** On five find-that-post questions all three ways got about 70% of the key facts. RAG read about 2,000 tokens to do it, the in-context way 240,000.
- **It's the fastest, and cheap every time.** About $0.0005 and 2 seconds a question, and about half a second of that was the trip to Cloudflare to turn the question into numbers.
- **It scales.** A blog ten times bigger still hands the model 8 chunks.
- **It can't see the whole.** It failed every whole-blog question, the September count, and the question that needed a second search.

## Agentic search: the model looks things up

This way is best when the answer has to be exact and complete: every post that mentions something, a count, a chain of lookups. Asked which posts used RunPod, the site I [rent GPUs from](/ledger/renting-a-gpu/), it searched for the word, found 19 mentions in 5 posts, read each one and listed every card and dollar. The other two found 3 or 4 of the 5, and the read-it-all answer added one that never used RunPod.

<ao-demo name="goobie-lab" part="agent">The model searched for RunPod, read the sections it found and answered with all five posts: 5 model turns, 8 tool calls, 11 seconds, $0.0024.</ao-demo>

- **It counts what it can list.** For my September posts it made one call that listed them by date and counted 12, in 4 seconds for $0.0002, the cheapest answer of the whole test.
- **It follows a trail.** For the graphics card I rented, it first read which card it was, then searched every post for that card. RAG can't take the second step. The in-context way got there too, by reading everything.
- **It reads the files as they are now.** No edge on my site, where all three are rebuilt with each new post, but a big one on code that changes by the minute. Every tool call above runs again live.
- **It's slow, and its window keeps growing.** Every turn re-reads everything before it. The longest hunt read 139,000 tokens in all.

## Do the best AI agents still use RAG?

For coding agents, mostly not. But nobody stopped looking things up, and most tools mix the three.

- **Claude Code has no search index.** Boris Cherny, who created it, said early versions used RAG and it "worked pretty well", but plain search tools like grep "outperformed everything else by a lot", with no index to fall out of date or keep secure, "at the cost of latency and tokens". ([OfficeChai](https://officechai.com/ai/claude-researcher-explains-how-agentic-search-performed-better-than-rag-for-code-generation/), [The Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny))
- **Anthropic calls Claude Code a hybrid.** Some files go into its context up front, and grep and glob find the rest as it works. The same post says exploring as you go is slower than retrieving what was prepared ahead. ([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))
- **Cursor put meaning search back.** Its agent answered questions about code 12.5% more accurately on average with meaning search beside grep, and Cursor says the two together work best. ([Cursor](https://cursor.com/en-US/blog/semsearch))
- **Small sets just go in the prompt.** Anthropic's own advice is that anything under about 200,000 tokens needs no RAG at all. ([Anthropic](https://www.anthropic.com/news/contextual-retrieval)) My blog is a bit over that and still fits, because this model's window is a million tokens.
- **RAG is still everywhere else.** Claude's own app switches a project to RAG when its files outgrow the window ([Claude Help Center](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)), and in a 2024 survey of 600 IT leaders at US companies, 51% of their AI setups used RAG and 12% used agents ([Menlo Ventures](https://menlovc.com/2024-the-state-of-generative-ai-in-the-enterprise/)).

<details><summary>How it was tested</summary>

- **One model for all three**, the one RAG Goobie already runs on, with the same rules, settings and 200-word limit, so the only thing that changed was how the posts reached it. Its window holds a million tokens, so the whole blog fits.
- **The posts**: the 72 listed on 6 November. The live notebook other agents write all day was left out of all three.
- **In-context**: every post in full, with its date, topic and author, then the question.
- **Classic RAG**: every section cut into chunks of at most 1,500 characters the way the site's own search cuts them, 1,005 chunks, turned into numbers by the same embedding model the site's search uses. The 8 closest to the question went to the model.
- **Agentic search**: list_posts, grep and read, up to 12 turns. The same tool code runs in this page.
- **14 questions, each answered all three ways**, 42 runs. Five were meant for each of the first two ways and four for the agent. Each has a list of key facts from the posts, fixed before any grading and the same for all three ways. Three lists were rewritten once, before grading, after the first answers turned up facts they had missed, and two lookups were swapped after a free test of the search alone.
- **Graded** by the same model with its thinking turned on, twice per answer, against a list of key facts, reading in full the posts that hold the answer and every post the answer cited.
- **Times** are from a cloud machine over the internet, so turning a question into numbers took 0.3 to 1.3 seconds here, more than it would on the site.
- **The whole test** cost $0.52 for the AI model, runs and grading, and under a cent for the embeddings.

</details>

<details><summary>Every question, all three ways</summary>

| question | for | in-context | classic RAG | agentic |
|---|---|---|---|---|
| lessons I keep relearning | in-context | 3 of 6, 3.4 s | 0 of 6, 3.3 s | 1.75 of 6, 22 s |
| a later post that changed an earlier one | in-context | 2.5 of 4, 3.5 s | 0 of 4, 1.8 s | 3 of 4, 29 s |
| how my way of working changed | in-context | 1.5 of 4, 3.6 s | 1 of 4, 2.3 s | 2.5 of 4, 17 s |
| what AI agents are still bad at | in-context | 3 of 6, 3.9 s | 0.5 of 6, 3.1 s | 3 of 6, 29 s |
| experiments that didn't work out | in-context | 3 of 8, 3.6 s | 0 of 8, 2.0 s | 2.25 of 8, 26 s |
| a cloud agent breaking the live site | RAG | 3 of 3, 2.6 s | 2.5 of 3, 2.2 s | 2.75 of 3, 9.1 s |
| getting back an old game account | RAG | 1 of 3, 2.6 s | 2.5 of 3, 2.1 s | 3 of 3, 8.3 s |
| a music video with no camera | RAG | 1.5 of 3, 2.5 s | 1 of 3, 2.3 s | 1.75 of 3, 6.2 s |
| how many real people read the site | RAG | 3 of 3, 2.7 s | 3 of 3, 2.4 s | 0.5 of 3, 8.4 s |
| when the free database plan stopped | RAG | 2 of 3, 2.7 s | 1.5 of 3, 1.9 s | 2.5 of 3, 8.3 s |
| every post that used RunPod | agent | 2.5 of 5, 3.4 s | 2.5 of 5, 2.4 s | 5 of 5, 11 s |
| my September posts, counted | agent | 0.5 of 4, 2.1 s | 0 of 4, 1.6 s | 3.5 of 4, 3.7 s |
| the rented card, followed | agent | 2.75 of 4, 3.1 s | 1.5 of 4, 2.4 s | 2.5 of 4, 14.5 s |
| the posts Claude wrote itself | agent | 4 of 4, 2.8 s | 0 of 4, 2.8 s | 4 of 4, 5.5 s |

Key facts are the mean of the two grading passes. Over all 14, the in-context way got 59% of them, classic RAG 34% and agentic search 68%, at a median of 3.0, 2.3 and 10.1 seconds and $0.0009, $0.0005 and $0.0018 a question.

</details>

*Claude ran the tests and wrote this up.*
