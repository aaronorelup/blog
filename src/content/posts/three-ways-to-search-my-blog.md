---
id: "AO-083"
title: "Three ways an AI can answer questions from my blog"
summary: "I had Claude test three ways an AI model can answer from my posts. An agent with search tools was the most accurate and the slowest, reading them all kept pace on whole-blog questions, and a passage search only on lookups."
date: 2026-11-12
topic: "site"
project: []
draft: false
preview:
  verdict: "Three ways, three jobs"
  takeaway: "Reading every post at once kept pace with an agent on whole-blog questions in a seventh of the time, though both got under half the key facts."
  points:
    - "Only the agent found all 5 posts that used RunPod, and counted my September posts right: 12. Reading it all said 15."
    - "My Ask box, RAG Goobie, mostly reads it all. Its search is only a hint, and it isn't given the posts' dates."
    - "Claude Code dropped RAG for grep-style search. Cursor found meaning search helped in 2025, then dropped it in 2026."
  image: "/media/previews/three-ways-to-search-my-blog.webp"
  alt: "Three bars of the 72 posts tested: reading it all lights every post, the passage search slivers of 5, the agent parts of 16"
---

My blog has an Ask box, [RAG Goobie](/ledger/), that answers questions from my posts. I'd been calling it RAG without being sure, and I keep hearing the best AI agents have dropped RAG for agentic search. So I had Claude test the three ways an AI model can work from a pile of documents, on the 72 posts my blog had on 6 November, each on the questions it should be best at. **RAG Goobie mostly reads every post on every question, the first of the three ways.** Each way was the best pick for its own kind of question, and every run below is real.

An AI model answers from its context window, the text it reads right before it writes. That's counted in tokens, a word or a piece of one. RAG, short for retrieval-augmented generation, means looking things up first and handing the model what turned up. The three ways differ in what goes into the window, who picks it, and when.

- **In-context: everything goes in.** All 72 posts, about 240,000 tokens, on every question, for under a tenth of a cent off-peak with a cache. It kept pace with the agent on whole-blog questions in a seventh of the time, though both got under half the key facts.
- **Classic RAG: a search picks, before the model starts.** The 8 chunks of the blog closest in meaning to the question go in, about 2,300 tokens. It matched the other two on find-that-post questions with a hundredth of the reading, and fell apart on everything else.
- **Agentic search: the model picks, as it goes.** It gets tools to list, search and read posts, and decides what to look up next. It was the most accurate overall and the only one that got every RunPod post and the September count right, but the slowest, up to half a minute.
- **Two leading coding agents dropped RAG.** Claude Code and, since July 2026, Cursor search code for its exact words, not its meaning. Elsewhere RAG is still common.

<ao-demo name="goobie-lab" part="windows">What each way saw of the blog on 6 November: reading it all, every word of all 72 posts. The passage search, 8 chunks from 5 posts. The agent, the lines and sections its tools returned from 16.</ao-demo>

## In-context: the whole blog in one prompt

This way is best when the answer is spread over the whole blog: what lessons I keep relearning, which experiments didn't work out, what AI agents are still bad at. Each answer drew on 6 to 12 posts. Neither it nor the agent got half the key facts, so none of the three is good at these yet.

<ao-demo name="goobie-lab" part="context">Every post in one prompt: 240,083 tokens, 99.9% of them from the cache, an answer in 3.4 seconds for $0.0009. The first question, with nothing cached yet, read them all at full price, $0.036.</ao-demo>

- **The cache is the whole trick.** Every question starts with the same 240,000 tokens, so the model's provider keeps them and charges a fiftieth. The first question paid full price, about 3.6 cents off-peak.
- **The agent got about as far, slowly.** It read post after post for 17 to 29 seconds, at 2.5 to 5.5 times the cost. Classic RAG's 8 chunks came from just 3 to 6 posts, mostly my long film making-ofs.
- **It miscounts.** Asked how many posts I published in September, it said 15. It was 12.
- **It has a ceiling.** On 6 November the blog filled a quarter of the model's window, and somewhere around 300 posts it won't fit at all. Anthropic's advice is to skip RAG under about 200,000 tokens ([Anthropic](https://www.anthropic.com/news/contextual-retrieval)), and my blog is already over that.

## Classic RAG: the closest passages

This way is best when the question is about one thing and you only need to find it. Asked "Did a cloud agent ever push something broken to the real site?", its search ranked [the post about my stale branch going live](/ledger/the-branch-that-went-live/) first. The other two found it too, so its edge was cost and speed, not finding more.

<ao-demo name="goobie-lab" part="rag">The question is turned into numbers, compared with 1,005 chunks, and the 8 closest go to the model: about 2,500 tokens, an answer in 2.2 seconds for $0.0005.</ao-demo>

- **Same share of the key facts, a hundredth of the reading.** On five find-that-post questions all three got about 70% of them. RAG read about 2,200 tokens, the in-context way 240,000.
- **It's the fastest, and cheap every time.** About $0.0005 and 2 seconds a question.
- **It scales.** A blog ten times bigger still hands the model 8 chunks.
- **It can't see the whole.** It did poorly on every whole-blog question, the September count and the question that needed a second search.

## Agentic search: the model looks things up

This way is best when the answer has to be exact and complete: every post that mentions something, a count, a chain of lookups. Asked which posts used RunPod, the site I [rent GPUs from](/ledger/renting-a-gpu/), it searched for the word, found 19 mentions in 5 posts, read each one and listed every card and dollar. The other two each named 3 of the 5, and the read-it-all answer added one that never used RunPod.

<ao-demo name="goobie-lab" part="agent">The model searched for RunPod, read the sections it found and answered with all five posts: 5 model turns, 8 tool calls, 11 seconds, $0.0024.</ao-demo>

- **It counts what it can list.** For my September posts one call listed them by date and it counted 12, in 4 seconds for $0.0002, the cheapest answer in the test.
- **It follows a trail.** For the graphics card I rented, it read which card it was, then searched every post for it. RAG can't take that second step. The in-context way got there too, slightly better, by reading everything.
- **It's slow, and its window keeps growing.** Every turn re-reads everything before it. The longest hunt read 139,000 tokens in all.

## What this means for RAG Goobie

It's a hybrid, mostly the in-context way. On every question the call that writes the answer gets its rules, every listed post in full, then the question. A quick first AI call writes a few searches and a meaning search runs, but for now all that does is name the 6 most related posts beside the question, as a hint. The in-context runs here were a bare copy of it, with no first call or hint. RAG Goobie itself takes about 5.5 seconds and $0.001 off-peak.

- **It isn't agentic.** It never decides to look again or picks a tool. The agent's two clear wins, every RunPod post and the September count, came from a search for the exact word and a list by date.
- **It isn't told when a post came out.** The bare copy had every post's date and still miscounted September. RAG Goobie's prompt names each post's number, title, topic and author, but no date.
- **At about 140 posts it switches to split mode.** Its search then picks which block of posts and which extra posts go in, RAG with whole posts instead of 8 chunks. This test didn't try that.

## Do the best AI agents still use RAG?

For Claude Code and Cursor, not anymore.

- **Claude Code has no search index.** Boris Cherny, who created it, said RAG "worked pretty well" in its early versions, but letting the model search with plain tools like grep "outperformed everything", "by a lot", with no index to fall out of date or keep secure. It costs time and tokens, and his evidence was "mostly vibes", he said, with some internal benchmarks. ([Latent Space](https://www.youtube.com/watch?v=zDmW5hJPsvQ), [The Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny)) Anthropic calls it a hybrid: a few files go in up front, and it searches for the rest as it works. ([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))
- **Cursor dropped meaning search in 2026.** In 2025 the AI coding tool found that meaning search beside grep made its agent's answers 12.5% more accurate on average. In July 2026 it turned it off, saying models had got really good at grep. ([Cursor](https://cursor.com/en-US/blog/semsearch), [its forum](https://forum.cursor.com/t/what-do-you-think-about-cursor-removing-the-codebase-indexing-settings/165899), [its docs](https://cursor.com/docs/agent/tools/search))
- **RAG is still common elsewhere.** In a 2025 survey of 495 people who choose AI for big US companies, it came second only to writing good prompts ([Menlo Ventures](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)). Claude's app gives a project a search tool once its files near the window's limit ([Claude Help Center](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)).

<details><summary>How it was tested</summary>

- **One model for all three**, the one RAG Goobie already runs on, with one set of rules and settings and a 200-word limit for all three (not RAG Goobie's own), so the only thing that changed was how the posts reached it. Its window holds a million tokens, so the whole blog fits.
- **The posts**: the 72 listed on 6 November. The live notebook other agents write all day was left out of all three.
- **In-context**: every post in full, in post-number order, with its date, topic and author, then the question.
- **Classic RAG**: every section cut into chunks of at most 1,500 characters the way the site's own search cuts them, 1,005 chunks, turned into numbers by the same embedding model the site's search uses. The 8 closest to the question went to the model.
- **Agentic search**: list_posts, grep and read, up to 12 turns. The same tool code runs in this page.
- **14 questions, each answered all three ways**, 42 runs. Five were meant for each of the first two ways and four for the agent. Each has a list of key facts from the posts, the same for all three ways. Three lists were rewritten once, before grading, after the first answers turned up facts they had missed. The five lookups were picked from about 15 tried on the search alone, all ones it found, which favors classic RAG on them. Two of the whole-blog questions were added after the first twelve had been graded.
- **The agent ran twice.** Its first 12 runs were thrown away and redone after its instructions were fixed so it could cite a post it had seen only in its post list. The other two ways ran once. Before the test, a first try asked one question each way, and the cold first question above is from it.
- **Graded** by the same model with its thinking turned on, twice per answer, against a list of key facts, reading in full the posts that hold the answer and every post the answer cited. A first grading pass was thrown away when the grader was changed to see each post's number.
- **Times** are from a cloud machine over the internet, so turning a question into numbers took 0.3 to 1.3 seconds here, more than it would on the site. Costs are at off-peak prices. At peak hours each one doubles.
- **The whole test** cost about 50 cents for the AI model, runs and grading, the thrown-away ones included, and under a cent for the embeddings.

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
| the rented card, followed | agent | 2.75 of 4, 3.1 s | 1.5 of 4, 2.4 s | 2.5 of 4, 14 s |
| the posts Claude wrote itself | agent | 4 of 4, 2.8 s | 0 of 4, 2.8 s | 4 of 4, 5.5 s |

Key facts are the mean of the two grading passes. On average per question, the in-context way got 58% of them, classic RAG 34% and agentic search 67%, at a median of 3.0, 2.3 and 10.1 seconds and $0.0009, $0.0005 and $0.0018 a question.

</details>

*Claude ran the tests and wrote this up.*
