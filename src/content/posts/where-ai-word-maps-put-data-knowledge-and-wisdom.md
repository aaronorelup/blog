---
id: "AO-075"
title: "Where AI word maps put data, knowledge and wisdom"
summary: "I put idea, knowledge, data, intel and wisdom into three AI word maps from 2013 to 2025. Which line up, where they split, how to find gaps in a learner's vocabulary, and what a small AI uses to name itself."
date: 2026-11-02
topic: "learning"
draft: true
preview:
  verdict: "Data to wisdom, in order"
  takeaway: "In three AI word maps from 2013 to 2025, data, information, knowledge and wisdom fall in that order. Data is always the machine end, wisdom the human end."
  points:
    - "A 2025 embedding model given one bare word matched people no better than word2vec from 2013. A prompt fixed it."
    - "A vocabulary gap finder picked sauce and pants for a 500-word learner. Frequency lists still cover 3 times more text."
    - "A small chat AI named itself after the task, like Lighthouse, and where its attention went didn't explain the choice."
  image: "/media/previews/where-ai-word-maps-put-data-knowledge-and-wisdom.webp"
  alt: "Data and wisdom at two ends of a line, information and knowledge between them, idea and intel off to the side"
---

AI models turn every word into a long list of numbers, a point on a map with hundreds of directions where similar words land close together. Years ago everyone shared "king minus man plus woman equals queen" from these maps, and then I never heard about it again. So I had Claude find out who still works on this and run my own words through three of the maps. **People work on it more than ever, under a different name. And in every map I tried, data, information, knowledge and wisdom land in exactly that order.**

- **The field split in two.** The maps now run every AI search box. What the numbers mean became interpretability research, one of MIT Technology Review's breakthrough technologies of 2026.
- **Data, information, knowledge and wisdom line up in pyramid order.** In maps from 2013, 2014 and 2025.
- **Data is always the machine end and wisdom the human end.** That held on machine to human, numbers to feelings and raw to refined.
- **"Intel" means something different in every map.** A chip company in two and spy slang in the third.
- **The 2025 map has to be asked properly.** Given one bare word it matched people no better than the 2013 map. One line of instructions fixed it.
- **My vocabulary idea works on a pretend learner.** A gap finder picked sauce and pants for a beginner instead of more synonyms.
- **A small AI names itself after the task.** Lighthouse after a lighthouse job, Assistant after a spreadsheet.

## Is anyone still working on this?

Yes. The word2vec paper from 2013 won the test of time award at NeurIPS, the big AI conference, in 2023. Its idea that meaning sits in directions became the base of a whole field. Labs like Anthropic and Google DeepMind now find personas, emotions and "being the assistant" as directions inside chat models, built the same way as king minus man. Average one thing, average the other, subtract. The plain maps became plumbing for any chatbot that searches your documents.

The famous trick has an asterisk. The standard code never lets the answer be one of the words you typed in. A 2020 paper allowed them, and word2vec's score on the classic analogy test fell from 74% to 21%. Most of the time the closest word to king minus man plus woman is just king. In my test only the 2025 map said queen with king allowed.

## My five words on the map

I used three maps. GloVe from 2014, word2vec from 2013 and Qwen3-Embedding from 2025, a small modern model that runs on a laptop. I added 19 relatives like information and insight, and compared everything against 20,000 common English words.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/where-ai-word-maps-put-data-knowledge-and-wisdom/data-to-wisdom-line.webp" alt="Three scatter charts, one per word map, each placing words between data on the left and wisdom on the right. In all three, information sits a quarter to a third of the way along and knowledge about two thirds, in gold. Idea and intel sit higher up, away from the line, with 18 other knowledge words in grey." loading="lazy">
    <figcaption><b>Data, information, knowledge, wisdom, in order in all three maps</b><span class="ao-meta">Across: how far along the line from data to wisdom. Up: how far off that line</span></figcaption>
  </figure>
</ao-compare>

**They line up in pyramid order.** In all three maps the main direction through data, information, knowledge and wisdom puts them in that order. By chance that happens 1 time in 12. Information sits a quarter to a third of the way from data to wisdom and knowledge about two thirds, closer to that line than 99.9% of the 20,000 words.

**The old analogy trick walks up the ladder.** In GloVe, data is to information as information is to knowledge. Information is to knowledge as knowledge is to understanding. One step past wisdom you get prudence, patience and humility.

**Data is the machine end.** I made directions from opposite words, like six machine words against six human words, and ranked all 20,000 words along them. Data always landed in the bottom sixth, wisdom in the top third.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/where-ai-word-maps-put-data-knowledge-and-wisdom/named-axes.webp" alt="Three heatmaps, one per word map. Rows are data, information, intel, idea, knowledge and wisdom. Columns are machine to human, numbers to feelings, raw to refined and new to old. Data is blue (the left end) in nearly every cell and wisdom is red (the right end) in every cell." loading="lazy">
    <figcaption><b>Where each word ranks among 20,000 on four directions</b><span class="ao-meta">0 means the left word of the pair, 100 the right word</span></figcaption>
  </figure>
</ao-compare>

**Intel is where my five words differ most.** GloVe ignores capital letters, so intel means the chip company and sits next to Pentium and IBM. Word2vec keeps capitals, so lowercase intel is spy slang. "Intelligence" meant the CIA in 2014 and AI in a bare 2025 search. The next biggest split is data against idea, databases on one side and imagination on the other.

The old male to female direction didn't hold up. Wisdom leaned male in one map and female in another.

## Old maps against a new one

I scored each map against 999 word pairs that people rated for similarity. 1 would mean it ranks every pair the way people do.

<ao-bars max="0.7">
<table><thead><tr><th>Word map</th><th>Agreement with people</th></tr></thead>
<tbody>
<tr><td>GloVe, 2014</td><td>0.37</td></tr>
<tr><td>word2vec, 2013</td><td>0.44</td></tr>
<tr><td>Qwen3, one bare word</td><td>0.45</td></tr>
<tr><td>Qwen3, "meaning:" in front</td><td>0.61</td></tr>
<tr><td>Qwen3, with an instruction</td><td>0.69</td></tr>
</tbody></table>
<figcaption><b>How well each map matches human similarity ratings</b><span class="ao-meta">SimLex-999, rank correlation</span></figcaption>
</ao-bars>

**Given one bare word, the 2025 map did no better than the one from 2013.** Its closest words to "idea" included eclipse and illustrator. It was trained on sentences, so one word alone throws it off. A line of instructions in front fixed it, as a paper from last December found in seven models.

## A word map for language learners

I've been thinking about an open store for the words a language learner knows, like Android's Health Connect for vocabulary, so any app could read and add to it. I'm calling it WordHoard Core. The research found nothing like it. My idea is to use the maps to track which meaning of a word you know and where your biggest holes are. You don't need huge, giant and enormous if you have big.

**A model can tell which "run" you know.** Claude wrote 40 sentences using 7 meanings of run, like running a business, running for office and a run in your tights. A model called BERT sorted 95% of them into the right meaning. A chat model that reads left to right got 55%, because at the word "runs" it hasn't seen the rest of the sentence yet.

<ao-bars unit="%" max="100">
<table><thead><tr><th>How the word was read</th><th>Right meaning</th></tr></thead>
<tbody>
<tr><td>BERT, reads both directions</td><td>95</td></tr>
<tr><td>Chat model, asked after the sentence</td><td>88</td></tr>
<tr><td>Chat model, at the word itself</td><td>55</td></tr>
<tr><td>Guessing</td><td>14</td></tr>
</tbody></table>
<figcaption><b>Sorting 40 uses of "run" into 7 meanings</b><span class="ao-meta">each sentence matched to the meaning its closest sentences share</span></figcaption>
</ao-bars>

**The gap finder skips "huge" if you know "big".** I faked a learner who knows the 500 most common English words. Huge, giant and enormous were already about half covered by big and large. Cooking words were barely covered. So its first picks were sauce, pants, animals, protein and plastic. The plain frequency list wanted military, perfect and personal.

**Frequency still wins for reading.** The frequency list covers 3 times more of a real text. The gap list covers about 12 times more ground in meaning. An app needs both.

**A second map found mostly the same gaps.** Word2vec agreed on 6 of the 15 picks and chose near-twins for most of the rest, like tomato for vegetables. Research from this year says models agree on which words are neighbours but not on distances. So the store should save which meaning you know as an ID from an open dictionary like WordNet, and keep the number lists as a cache.

## What a small AI looks at when it names itself

My last idea was to give a model a long task, ask it to name itself, and look inside at that moment. Nobody has published that yet. Claude ran a small version on Qwen2.5, a chat model small enough for a laptop. It helped with four tasks, then I asked what it would call itself.

| Before the question | Its top names |
|---|---|
| Nothing | Eve, Zenith, Sage |
| Restoring a lighthouse | Lighthouse, StoneLighthouseRestoration |
| A telescope guide | AstronomyExplorer, Stellar, StarGazer |
| A garden plan | Vegetable, Assistant, Sunseed |
| A bookkeeping spreadsheet | Assistant, at 93% |

**The task names the model.** A model this small mostly names the project, not itself. Boring work makes it "Assistant". With no task it picks the usual AI names.

**The name forms in the last few layers.** Reading the model's best guess at each of its 28 layers, "Assistant" locked in at layer 22. The themed names came last. After the telescope guide it went Galactic, then 星辰, Chinese for "the stars", then Star, and only then AstronomyExplorer.

**Where it looks isn't what decides.** Claude deleted each sentence of the chat one at a time to see which ones change the name. In the garden and lighthouse chats my first message mattered most. Deleting "I'm planting a vegetable garden" turned the garden name into Assistant, yet the model paid more attention to my last request. Across the four chats, attention and the deletion test agreed between -0.21 and 0.31, where 1 is a perfect match. Researchers have warned about this since 2019. The real version needs a bigger model, a tool called circuit tracing and a rented graphics card.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/where-ai-word-maps-put-data-knowledge-and-wisdom/attention-vs-deletion.webp" alt="A scatter chart of about 40 sentences from the garden chat. Across: how much of the model's attention each sentence got. Up: how much deleting it hurt the chosen name. One dot, my opening message about planting a vegetable garden, sits far above the rest at 3.1. The most-attended sentence, my last request for a note in the shed, sits near zero." loading="lazy">
    <figcaption><b>The sentence that decided the name wasn't the one it looked at most</b><span class="ao-meta">Garden chat, Qwen2.5-1.5B, attention weighted by what each word passes on</span></figcaption>
  </figure>
</ao-compare>

## How it was tested

Claude ran everything on a 4-core cloud computer with no graphics card on 2 November 2026. Each test ran once, so these are first-pass numbers.

<details><summary>The research and its sources</summary>

Five research agents each took one angle: the geometry of word maps, looking inside models, the tools, language learning, and who works on this now. Each report then went to a separate fact-checker told to find what was wrong. Of 75 key claims, 70 checked out as written and 5 needed a detail fixed. None were false.

- The word2vec paper won the [NeurIPS 2023 Test of Time award](https://neurips.cc/virtual/2023/awards_detail).
- [Fair is Better than Sensational](https://arxiv.org/abs/1905.09866) (Nissim, van Noord and van der Goot, 2020) is the paper that let the input words be answers. Word2vec's analogy score fell from 0.74 to 0.21.
- [MIT Technology Review's 10 Breakthrough Technologies 2026](https://www.technologyreview.com/2026/01/12/1130003/mechanistic-interpretability-ai-research-models-2026-breakthrough-technologies/) names mechanistic interpretability.
- [Persona vectors](https://arxiv.org/abs/2507.21509) (Anthropic, 2025) and [The Assistant Axis](https://arxiv.org/abs/2601.10387) (Lu, Gallagher, Michala, Fish and Lindsey, 2026).
- [One Word Is Not Enough](https://arxiv.org/abs/2512.06744) (December 2025) found a short prompt in front of a single word raises agreement with people by up to 0.29 across 7 models.
- [Revisiting the Platonic Representation Hypothesis](https://arxiv.org/abs/2602.14486) (Gröger, Wen and Brbić, 2026) found models agree on local neighbours much more than on distances.

</details>

<details><summary>The word maps and the words</summary>

- **GloVe**, 300 numbers per word, trained on Wikipedia and news, 2014. It lowercases everything.
- **word2vec**, 300 numbers per word, trained on Google News, 2013. It keeps capital letters.
- **Qwen3-Embedding-0.6B**, 1,024 numbers per word, 2025. Run with a bare word, with `meaning:` in front, and with the line "Given an English word, retrieve English words with a similar meaning". Its average vector was subtracted first, since every similarity in it runs high otherwise.

The pool for neighbours and rankings was GloVe's 20,000 most common lowercase words. The knowledge words were idea, knowledge, data, intel, wisdom, information, intelligence, insight, understanding, fact, thought, concept, memory, belief, truth, evidence, signal, theory, opinion, skill, experience, news, meaning and learning.

| Map | Information along the line | Knowledge along the line | Closer to the line than |
|---|---|---|---|
| GloVe | 0.25 | 0.59 | 99.9% of words in between |
| word2vec | 0.29 | 0.63 | 99.9% of words in between |
| Qwen3, instruction | 0.36 | 0.68 | 99.9% of words in between |

0 is data and 1 is wisdom. One direction holds 60% of the spread of the four pyramid words in GloVe, 53% in word2vec and 61% in Qwen3. Between 8% and 31% of random groups of four related words line up more tightly, so the line is good but not unusual for close words.

</details>

<details><summary>The named directions</summary>

Each direction is the average of six words for one end minus the average of six for the other. Each word gets its percentile among the 20,000.

| Direction | Words for each end |
|---|---|
| machine to human | computer, machine, software, database, algorithm, server / person, human, heart, soul, family, friend |
| numbers to feelings | number, count, percent, statistics, measurement, quantity / feeling, emotion, story, purpose, spirit, heart |
| raw to refined | raw, crude, unprocessed, rough, basic, simple / refined, polished, distilled, sophisticated, profound, deep |
| new to old | new, modern, novel, recent, fresh, young / ancient, old, elder, traditional, ancestral, aged |
| he to she | he, man, his, him, male, boy / she, woman, her, hers, female, girl |

Data was at the 16th percentile or lower on the first three in every map, and wisdom at the 72nd or higher. Wisdom was 73rd to 98th on new to old, and idea 1st to 26th. On he to she, wisdom was 47th in GloVe, 19th in word2vec and 88th in Qwen3.

</details>

<details><summary>Neighbours and the analogy</summary>

| Word | GloVe | word2vec | Qwen3, bare word | Qwen3, instruction |
|---|---|---|---|---|
| intel | amd, ibm, microsoft | intelligence, spy, pentagon | pc, pcs, amd | pentium, ibm, intern |
| intelligence | cia, information, security | intel, counterintelligence | ai, intelligent, artificial | intelligent, cognitive, intellectual |
| idea | notion, concept, something | concept, notion, suggestion | ideas, eclipse, interface | ideas, concept, conceptual |
| wisdom | knowledge, belief, patience | sagacity, intuition, humility | wisely, advice, virtue | wise, knowledge, insight |

King minus man plus woman, closest word with the input words allowed: king in GloVe (0.76, queen second at 0.67), king in word2vec, king in bare Qwen3, queen in instructed Qwen3. With the inputs banned, all four say queen.

The people test is SimLex-999, 999 word pairs rated for similarity. Read from its last layer with the prompt "This word means in one word", the Qwen2.5 chat model scored 0.60.

</details>

<details><summary>The senses of "run" and the gap finder</summary>

WordNet lists 57 senses of "run". Claude wrote 40 sentences for 7 of them. A sentence counts as right if it is closest to the average of the other sentences with its meaning. BERT did best at its 8th of 12 layers. GloVe's single vector for "run" has neighbours like going, allowed, three, first and third, mostly baseball and cricket.

The gap finder's pool was 15,000 common English words from the wordfreq list that GloVe has and WordNet lists in lower case, minus names (a word was dropped when its capitalised form is 3 times more common in Google News). A word counts as covered by how close it is to the nearest word the learner knows. Each pick raises frequency-weighted coverage of all the unknown words the most.

| Learner | Meaning covered, 15 gap-first words | Next 15 by frequency | Running text added, gap-first | Frequency |
|---|---|---|---|---|
| Knows 500 words | 446 | 38 | 0.07% | 0.23% |
| Knows 2,000 words | 111 | 14 | 0.02% | 0.06% |

- The 500-word learner's first picks: sauce, pants, animals, protein, plastic, infection, anger, ship, trees, charges.
- The 2,000-word learner's: molecules, butter, vegetables, yelling, guitar, insects, cloth, tomato, horizontal, variables.
- With the 25 food words removed from the 2,000-word learner, the first picks were sauce, vegetables, molecules and dessert.
- On word2vec, 6 of the 15 picks for the 500-word learner were the same, and the regions they fill overlapped 12 times more than random.
- Without the frequency weight, the emptiest spots were slang and abbreviations like pic, hes and comp.

</details>
<details><summary>The name test</summary>

The model was Qwen2.5-1.5B-Instruct. It wrote its own replies to three messages per task (about 300 words each), then got "Thanks, that's everything for today. Before we wrap up: if you could give yourself a name, what would it be? Answer with just the name." Each name below is the model's most likely first piece of the answer, finished by its most likely next pieces, with the probability of that first piece.

| Before the question | "You are a helpful assistant." | "You are Qwen, created by Alibaba Cloud." |
|---|---|---|
| Nothing | Eve 27%, Zenith 6%, Sage 4% | Eve 20%, CloudHelper 6%, Luminos 6% |
| Restoring a lighthouse | StoneLighthouseRestoration 35%, Lighthouse 31% | Lighthouse 41%, StoneLighthouseRestoration 12%, Qwen 8% |
| A telescope guide | AstronomyExplorer 23%, Stellar 16%, StarGazer 12% | Qwen 35%, StarGazer 11%, AstronomyExplorer 10% |
| A garden plan | Vegetable 27%, Assistant 16%, Sunseed 5% | Qwen 90% |
| A bookkeeping spreadsheet | Assistant 93% | Qwen 95% |

The first token of the chat drew about 31% of all the attention from the answer, a known quirk called an attention sink, and about 11% once weighted by what each word passes on. The final question drew about 22%.

| Chat | Agreement, attention and deletion | Sentence length alone | Name enters the top 10 at layer |
|---|---|---|---|
| Lighthouse | 0.15 | -0.26 | 25 |
| Telescope | -0.21 | -0.45 | 27 |
| Garden | 0.04 | 0.19 | 28 |
| Spreadsheet | 0.31 | 0.46 | 22 |

The guesses along the way were Historical, Stone, Old and Lighthouse for the lighthouse chat, Green and Plant for the garden, and Galactic, 星辰 and Star for the telescope. In the spreadsheet chat, plain sentence length predicted the deletion effect better than attention did. The chats were about 480 tokens long, far shorter than a real long task.

</details>

*Claude did the research with five research agents and five fact-checkers, and ran every test.*

