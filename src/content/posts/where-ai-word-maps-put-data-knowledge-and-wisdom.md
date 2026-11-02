---
id: "AO-075"
title: "Where AI word maps put data, knowledge and wisdom"
summary: "I put idea, knowledge, data, intel and wisdom into three AI word maps from 2013 to 2025. Which ones line up, where they split, and whether anyone still works on this stuff."
date: 2026-11-02
topic: "learning"
preview:
  verdict: "Data to wisdom, in order"
  takeaway: "In three AI word maps from 2013 to 2025, data, information, knowledge and wisdom fall in that order. Data is always the machine end, wisdom the human end."
  points:
    - "People still work on this, more than ever. It's called interpretability research now."
    - "A 2025 model fed one bare word did no better than word2vec from 2013. One line of instructions fixed it."
    - "Intel means a chip company in two of the maps and spy slang in the third."
  image: "/media/previews/where-ai-word-maps-put-data-knowledge-and-wisdom.webp"
  alt: "Data and wisdom at two ends of a line, information and knowledge between them, idea and intel off to the side"
---

AI models turn every word into a long list of numbers, a point on a map with hundreds of directions where similar words land close together. I remembered "king minus man plus woman equals queen" from years ago and wanted to know if anyone still works on this. So I had Claude look into it and run my own words through three of these maps. **People work on it more than ever, under a new name. And in all three maps, data, information, knowledge and wisdom land in exactly that order.**

- **The field split in two.** The maps now run every AI search box. Figuring out what the numbers mean became interpretability research, one of MIT Technology Review's breakthrough technologies of 2026.
- **Data is always the machine end and wisdom the human end.** That held on directions like machine to human and numbers to feelings.
- **"Intel" is a different word in every map.** A chip company in two of them and spy slang in the third.
- **The 2025 map has to be asked properly.** Fed one bare word, it matched people no better than the 2013 map. One line of instructions in front fixed it.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/where-ai-word-maps-put-data-knowledge-and-wisdom/data-to-wisdom-line.webp" alt="Three scatter charts, one per word map, each placing words between data on the left and wisdom on the right. In all three, information sits a quarter to a third of the way along and knowledge about two thirds, in gold. Idea and intel sit higher up, away from the line, with 18 other knowledge words in grey." loading="lazy">
    <figcaption><b>Data, information, knowledge, wisdom, in order in all three maps</b><span class="ao-meta">Across: how far along the line from data to wisdom. Up: how far off that line</span></figcaption>
  </figure>
</ao-compare>

## The five words

I used GloVe from 2014, word2vec from 2013 and Qwen3-Embedding from 2025, a small modern model that runs on a laptop. Along the main direction through data, information, knowledge and wisdom, all three put them in that order. By chance that happens 1 time in 12. The old analogy trick even walks up the ladder. In GloVe, information is to knowledge as knowledge is to understanding, and one step past wisdom you get prudence, patience and humility.

## Is anyone still working on this?

Yes. The word2vec paper won the test of time award at NeurIPS, the big AI research conference, in 2023. Labs like Anthropic and Google DeepMind now find things like emotions and "being the assistant" as directions inside chat models, built the same way as king minus man. The famous trick has an asterisk though. The standard code never lets "king" itself be the answer. Allow it and the closest word to king minus man plus woman is usually just king.

<details><summary>How it was tested</summary>

Claude ran everything on a cloud computer with no graphics card on 2 November 2026, once each.

- **The maps.** GloVe (300 numbers per word, Wikipedia and news), word2vec (300 numbers, Google News) and Qwen3-Embedding-0.6B (1,024 numbers). The Qwen3 words had the line "Given an English word, retrieve English words with a similar meaning" in front.
- **The words.** My five plus 19 relatives like information, insight and evidence, compared against GloVe's 20,000 most common lowercase words.
- **The line.** Information sat 0.25 to 0.36 of the way from data to wisdom and knowledge 0.59 to 0.68, depending on the map. Both were closer to that line than 99.9% of the 20,000 words.
- **The directions.** Each one is six words for one end minus six for the other, like computer and machine against person and heart. Data ranked at the 16th percentile or lower on machine to human, numbers to feelings and raw to refined in every map, and wisdom at the 72nd or higher.
- **Matching people.** On SimLex-999, 999 word pairs rated by people, GloVe scored 0.37, word2vec 0.44, Qwen3 with a bare word 0.45 and Qwen3 with the instruction 0.69.
- **The research** came from five research agents, each checked by a separate fact-checker. Of 75 key claims, 70 checked out as written and 5 needed a detail fixed.

</details>

*Claude did the research with a team of agents and ran the tests.*
