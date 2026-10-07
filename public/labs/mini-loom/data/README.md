# Mini Loom: pre-grown multiverses

Four trees of continuations, grown offline on 2026-10-07 on an RTX 4070 Laptop GPU (8 GB).

| file | seed | nodes | deepest | bytes |
|---|---|---|---|---|
| `lighthouse.json` | story | 609 | 8 | 1,389,248 |
| `jacquard.json` | nonfiction | 609 | 8 | 1,465,636 |
| `manual.json` | a document | 609 | 8 | 1,458,309 |
| `advice.json` | a forum thread | 609 | 8 | 1,460,468 |

`index.json` lists them with the model and the sampling settings, and gives each tree's shallowest
and deepest leaf in choices (`min_depth` 4, `depth` 8), which the seed menu prints as "4 to 8 choices deep".

## Model

[Qwen/Qwen3-1.7B-Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base) (Apache-2.0), a base model:
pretrained only, with no chat or instruction tuning. Run in bfloat16 with PyTorch 2.11 and
transformers 5.14.1 (ComfyUI's embedded Python, nothing installed).

## Sampling

- Temperature 1.0, nucleus (top-p) 0.95. No top-k, no repetition penalty.
- Special and control tokens (ids 151643 and up: end-of-text, chat markers, unused rows) are
  removed before the softmax, so no branch ends early or prints a control token. They held about
  one millionth of the probability at the lighthouse prompt.
- 4 branches per fork. Each branch is up to 32 tokens long. It is cut at the last sentence end
  (`.` `!` `?` `…`, optionally followed by a closing quote or bracket, then whitespace) that falls
  between token 12 and token 32. If there is none, it is cut at the last word boundary within 32
  tokens. Children continue from the exact sampled token ids, not from re-tokenised text.
- Our own sampling loop over the logits, batched (48 sequences per pass, left-padded, explicit
  position ids) with the KV cache. The final projection to the vocabulary runs in float32, because
  bfloat16 logits are rounded to steps of 1/8 nat. A self-test compares the batched, cached
  log-probs with one plain forward pass: they agree to about 0.02 nats on average (bfloat16 noise
  in the network body).

## What each token records

`tokens[i] = [text, logprob, [[alt, logprob] x 4]]`. The log-probability of the sampled token and
the top 4 alternatives come from the full temperature-1 distribution **before** top-p truncation
(the distribution the model actually gives, special tokens removed). The sampled token may or may
not be among the 4. Rounded to 3 decimals. The entries' texts concatenate exactly to the node text.
When a byte-level token ends partway through a multi-byte character, it is merged with the next
token(s) into one entry (log-probs summed, alternatives from the first position). An alternative
that is only part of a character shows as `�` (2 such alternatives in all four files).

## Tree shape

Node ids are breadth-first.

- Every node at depth 0 to 3 has 4 children: the full tree to depth 4 (1 + 4 + 16 + 64 + 256 = 341 nodes).
- Every depth-4 node under the root's **first** child (node 1) has 4 children: depth 5 everywhere
  under node 1 (+256).
- The first-child spine (node 1, then each node's first child) keeps branching 4 ways down to
  depth 8 (+12).

So a reader has 4 choices at every step for 4 steps anywhere, 5 steps anywhere under the first
branch, and 8 steps along the first-child path. Every non-root node has exactly 4 siblings.

## Quality filtering (all of it)

- A branch is resampled if it is empty, has fewer than 3 words, is mostly symbols, is invalid
  UTF-8, repeats a 4-word phrase three times, copies a sibling, or copies text already on its
  path. Up to 12 resamples per branch; the counts are in each file's `grown.resampled`.
- If a branch was still degenerate after 12 resamples (its context had fallen into a loop or a
  table of digits), or a file would pass 1.5 MB, the whole tree was regrown from the root with a
  new random seed (rng + 1000 per attempt). Kept trees: lighthouse attempt 1 (rng 1101),
  jacquard attempt 4 (rng 4804: attempt 1 fell into a 0/1 punch-card table, attempts 2 and 3
  were over 1.5 MB), manual attempt 1 (rng 4141), advice attempt 1 (rng 7007).
- The `advice` prompt is TOOL-LOOM.md's with one header line added ("Forum thread: Learning and
  self-improvement"). With the bare `Q: … A:` prompt, deeper branches drifted into Chinese
  exam-style Q&A, emoji and URLs (32 of 609 nodes had Chinese text); with the header, a probe of
  64 branches had none, and the grown tree has none.
- Nothing else was edited or removed. The trees keep what a 1.7B base model does: the Jacquard
  tree turns into homework questions and quizzes in places and states some wrong "facts"
  (dates, names); the lighthouse tree has one node with a Chinese gloss and one with a URL.

## Reproduce

```
python grow.py OUT_DIR [seed ...]
```

The grower (`grow.py`, with its validator `validate.py` and the prompt probe `probe_prompts.py`) is
kept with the course's source files, not published with this page. It needs PyTorch and
transformers with a CUDA GPU. Same GPU, same seeds, same batch layout gives the same trees; a
different GPU or library version may not. About 50 to 60 seconds of GPU time per accepted tree.
