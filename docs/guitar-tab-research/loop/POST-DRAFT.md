<!-- The draft of LOOP's post. Becomes src/content/posts/<slug>.md through `npm run new-post` in a worktree from
origin/main when the film exists; draft: true until Aaron's OK in his own words. [FILM] when the film is rendered, [COST] from report-self at the end. -->

---
title: "Using a guitarist's hand position to fix AI guitar tabs"
summary: "I had Claude Opus 5.5 watch which frets a guitarist's hand could reach, find the tuning by itself and write the tab one bar at a time. How much each of those helps, tested on six guitar videos with known tabs."
date: 2026-11-27
topic: "agents"
draft: true
credits:
  owner: "Aaron"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5 xhigh"
  cost: [COST]
preview:
  verdict: "Hand reach: up to +8 in 100"
  takeaway: "Knowing the hand's reach put 86 notes in 100 in place instead of 78 on one song, 4 more on another and none on the third. One pass over the whole song scored 83 to 95."
  points:
    - "Claude found the tuning of all six guitars by itself, including two tunings it had never been tried on."
    - "Going bar by bar cost four to five times as much and learned nothing. Wiping its memory between bars didn't hurt."
    - "On three new videos it placed 94, 82 and 70 notes in 100. The 70 is a song played high up the neck."
  image: "/media/previews/[slug].webp"
  loop: "/media/previews/[slug].mp4"
  alt: "A guitarist's fretting hand with a band over the frets it can reach"
---

[FILM: the <ao-shots> block, by ../video/EMBED.md, with the new slug]

<details><summary>The six recordings</summary>

The answer keys are the tabs these recordings were played from, timed to the recordings. They're the players' own, except Three Little Boats, whose tab is by its arranger.

- Steal My Girl (One Direction), fingerstyle arrangement, tab and performance by Gareth Evans (goliathguitartutorials.com), via [the Internet Archive](https://archive.org/details/gareth-evans_202101). Capo on fret 3.
- Imagine (John Lennon), fingerstyle arrangement, tab and performance by Gareth Evans, via the same archive. Standard tuning.
- A soft collision of breath, composed and played by Evan Handyside, [intellimusica.com](https://www.intellimusica.com/a-soft-collision-of-breath/), [video on Vimeo](https://vimeo.com/1149455966). Nylon strings tuned D G C F A C.
- New for this test: Closer (The Chainsmokers), fingerstyle arrangement and performance by Gareth Evans, via the same archive. Tuned E A D G A D, capo on fret 1.
- New: Wake Me Up When September Ends (Green Day), Jonathan's Version, arranged and played by Evan Handyside, [intellimusica.com](https://www.intellimusica.com/wake-me-when-september-ends-jonathans-version-guitar-tab/), [video on Vimeo](https://vimeo.com/813529239). Open G tuning, capo on fret 2.
- New: Three Little Boats, a traditional tune from the Isle of Man arranged by James Franklin, played by Pete Lumb in "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0). Standard tuning, no capo.

</details>

I want to build a web app that turns a video of someone playing guitar into tabs. Tabs are guitar music written as fret numbers on six lines, one per string. [My last test](/ledger/guitar-tab-tools/) lost most of its score on finding the notes, and getting the tuning wrong ruined everything after it. Even with the right notes, most of them can be played in two to four places, so each one still needs the right string and fret. So this time I had Claude Opus 5.5 treat it as a puzzle with rules. It watched which frets the guitarist's hand could reach, worked out how the guitar was tuned by itself, and wrote the tab one bar at a time. **Knowing where the hand was put 86 notes in 100 in the right place instead of 78 on the song played with a capo (a clamp across the strings that raises every note), and one pass over the whole song did as well or better, 83 to 95 in 100.**

- **The hand's reach narrows each note down to one or two places.** Claude marks a few fret wires on a frame and the rest follows from how frets are spaced. A band over the frets under the fingertips held 99.5 to 100 of every 100 fretted notes. On one new song it lifted a plain solver, a program that picks a string and fret for each note, from 43 to 57 in 100.
- **Claude found the tuning the way a person would.** It looked at which strings rang open and which chord shapes the hand made. It got all 18 strings of the first three guitars, then all 18 of three new ones, two of them in tunings it had never seen. My last test never found the nylon guitar's tuning. Its best try had five of the six strings right.
- **Claude beat a plain solver every time.** Given the same notes, tuning and hand band, the solver put 80 to 85 in 100 in place on the first three songs and 58 to 91 on the new ones. Claude scored higher on all six. On Three Little Boats neither put a note in the wrong place, so there Claude won by keeping more of the right notes.
- **One pass over the whole song did as well as going bar by bar or better.** It scored 95, 88 and 83 in 100 against 86, 87 and 84, so it was level on two songs and 9 better on the capo song. It took about half an hour and $8 to $11 a song, against 2 to 3.5 hours and $30 to $55.
- **Going bar by bar didn't learn anything.** On the first 38 bars of the capo song, a copy that forgot everything before each bar did just as well (84 in 100 against 82). The capo song did score higher in its last third, but so did the run without the hand band, so that was the music, not learning.
- **New videos were mixed.** On three songs it had never seen, it placed 94, 82 and 70 notes in 100, against about 88 on the first three. The 94 is a simple folk tune where every note has one sensible place. The 70 is Closer, played high up the neck in E A D G A D. So the method doesn't carry over to every new song yet.
- **What's left is mostly one mistake.** When the player frets a note that's also an open string, Claude writes the open string. The hand band can't rule open strings out, so the next fix is reading the fingers themselves.

The app should ask the person one thing, where the capo is. It can find the tuning, read the hand's reach, and give Claude the whole song in one go.

## How the hand's reach works

A hand tracker called MediaPipe finds the fingertips in every frame, but it can't tell you which fret a fingertip is on. So Claude looks at a frame, finds the fret wires and names a few of them by counting from the nut or reading the dots on the neck. Every other fret follows from the math of fret spacing, and a tracker carries that model of the neck through the video as the guitar moves around.

The band is the frets under the fingertips, plus one either side, counted from the capo. Open strings are always allowed, and when the hand is lost there's no band at all. Then a second Claude, which never saw the answer key, checks the band every ten seconds and wherever it looks unsure, and fixes it. A note that could be played in three or four places can now be played in one or two (3.4 to 1.4 on average).

It fails where the hand does something odd, like a note tapped with the picking hand or a fast shift up the neck in a blur, and once where the checking Claude set the band wrong. A fingertip read one fret off is covered by the extra fret either side.

## How it found the tuning

On the nylon song, the blind Claude attempts in my last test said the top string was a D. Claude looked at the fingers instead. In a G minor chord at 31.8 seconds, a fourth finger presses that string at the second fret just as a D sounds. If the string were a D, that finger would make an E, and no E is ever heard. So it's a C, which is what the player's tab says. A wrong tuning is expensive. With just that one string wrong, the solver's score on that song fell from 80 to 62 in 100.

## Bar by bar, or the whole song

The loop gave a fresh Claude one bar at a time, with the bar's sound, every note any of five note models heard there, the neck with the hand band, what the solver would write, and lessons carried from earlier bars. It went back to earlier bars now and then. The whole-song version gave one Claude session the same things for the entire song and 90 minutes.

The whole-song session matched the loop on two songs and was 9 points better on the capo song, where the player goes high on the fourth string and the loop wrote the same pitches down by the nut. Wiping the loop's memory before every bar didn't hurt, so cutting the song into bars was just chunking the work, not learning. Given the right notes from the answer key, the loop placed all 628 notes of the nylon song correctly, so on that song, placing notes is close to solved once the notes are right. It's the easiest of the three for that (a plain solver got 97 in 100 from the same notes), and the test wasn't run on the other two.

<details><summary>Every run, in numbers</summary>

Share of the answer key's notes on the right string and fret, onset within 50 ms.

| | capo song | Imagine | nylon song |
|---|---|---|---|
| solver program alone | 0.828 | 0.854 | 0.801 |
| Claude bar by bar, no hand band | 0.783 | 0.831 | 0.833 |
| Claude bar by bar | 0.859 | 0.875 | 0.836 |
| Claude, whole song at once | 0.947 | 0.878 | 0.830 |
| Claude bar by bar, given the key's notes | | | 1.000 |

| new song | tuning found | Claude, whole song | solver alone |
|---|---|---|---|
| September (open G, capo 2) | all 6 strings | 0.823 | 0.736 |
| Closer (E A D G A D, capo 1) | all 6 strings | 0.698 | 0.579 |
| Three Little Boats (standard) | all 6 strings | 0.935 | 0.909 |

On Three Little Boats I also ran the bar-by-bar version with the tuning it found, the full path the app would take. It scored 0.940, level with the whole-song pass, at more than twice the cost.

The method was frozen before any new song was run. Every number, with the file and eval it comes from, is in [the research records](https://github.com/aaronorelup/blog/tree/research/guitar-tab-loop/docs/guitar-tab-research/loop).

</details>

## What it cost

[COST: the session's API-equivalent from report-self, and the blind calls' list-price total from results.json]

*Researched, run and written up by Claude Opus 5.5 agents.*
