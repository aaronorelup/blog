---
id: "AO-033"
title: "Claude modded my characters into the card game Inscryption"
summary: "Claude read the code of a card game I own, added my six characters as playable cards and filmed a battle it played by itself. How it worked, the bug every test missed, and what it takes to mod another game."
date: 2026-10-03
topic: "games"
project: ["characters"]
preview:
  verdict: "Worked in three hours"
  takeaway: "Agents had a working mod and a filmed battle three hours after choosing the game, and the art was the weak part. Only screenshots caught that it was wrong."
  points:
    - "Every check passed while five of six portraits were black, because the game draws any solid pixel as ink."
    - "Pick a single-player Unity game whose code unpacks in seconds. A copy still shares the original's Windows settings."
    - "With my main GPU booked, rendering on the CPU crashed all five launches. The laptop's Intel graphics worked first time."
  image: "/media/previews/characters-in-inscryption.webp"
  alt: "Ichigo, Jefrie, Yusef and Siloam as ink-drawn Inscryption cards on Leshy's table, under his Bullfrog and Grizzly cards"
---

Claude put six of my characters into Inscryption, a card game I own, as playable cards. Each card
has an ability based on a line from my notes about that character. **The whole thing took about
three hours.** The one bad bug, five of six portraits drawn as black silhouettes, passed every
automated check and only showed up in a screenshot.

In Inscryption you play cards against a dealer named Leshy, across his table. Claude worked on a
copy of the game and read its code. Besides the cards, it wrote a second mod that plays a whole
battle by itself and films it. Nobody played the battle below.

<video controls playsinline preload="metadata" poster="/media/characters-in-inscryption/film-poster.webp" src="/media/characters-in-inscryption/film.mp4" style="width:100%;border-radius:8px"></video>

It's 1 minute 41 seconds in one take, with the game's own sound. Leshy introduces each card as
it's drawn, then every ability fires once.

I didn't pick this. I told Claude to find the best thing people were doing on X with Opus 5.5, the
Claude model I use, and do it without me. It picked Rehan Sheikh's
[Universal Modder](https://x.com/rehan_shei/status/2105161487509852622), a set of instructions for
modding almost any game you own. He made it after
[Opus 5.5 took apart Terraria](https://x.com/rehan_shei/status/2104662849624981571) overnight for
him. How Claude chose it is [its own post](/ledger/opus-55-on-x-alone/).

## The quick rundown

- **Three hours and 11 agents, from picking the game to the film.** Agents are separate Claude
  workers, each given one job.
- **It all happened on a copy.** My real save files matched before and after. The one leak was the
  Windows settings the copy shares with the real game. Claude had backed them up first and put
  them back.
- **Turning the game back into readable code took 24 seconds.** One agent read the 2,098 files
  and wrote notes every later agent built on.
- **Every ability comes from my notes.** Six cards, three abilities written from scratch, and a
  line from Leshy for each card.
- **A second mod plays the game.** It deals the hand and plays every turn through the game's own
  code. That's how Claude checked its work.
- **The art was the weak part.** Every check passed while five of six portraits were black.
- **My graphics card was busy.** Drawing the game on the processor crashed five times. The small
  Intel chip built into my laptop worked first try.

## The six cards

Inscryption calls a card's abilities sigils. Cards fight in lanes, and a card normally hits
whatever sits across from it. Each sigil here comes from a quote on that character's page in my
notes, and the stats follow my own power ranking.

| Card | Cost | Power / Health | Sigils | The line it comes from |
|---|---|---|---|---|
| **Jefrie** | 2 blood | 2 / 1 | Bifurcated Strike, hits both lanes beside the one in front | "It lags behind her hands, overshoots, keeps swinging after she stops" (her tail-heavy scythe) |
| **BloodTailor** | 2 blood | 2 / 3 | Blood Lust, +1 power per kill. **Sightless** *(new)*, he's blind so he strikes a random lane | "The more blood loss he inflicts, the more he can forge" |
| **Yusef** | 3 blood | 0 / 10 | Repulsive, nothing attacks him. Leader, the cards beside him get +1 power | "No demon will walk into the lantern's light." 0 power because he's forbidden to use his strength |
| **Siloam** | 3 blood | 3 / 4 | Waterborne, he dives under during Leshy's turn | "He is seen less than the other characters in the story." |
| **Echo** | 4 bones | 1 / 1 | Corpse Eater, jumps in from your hand when one of your cards dies in battle. **Last Words** *(new)*, +1 health whenever anything else dies | "it keeps the last words of the dying" |
| **Ichigo** | 1 blood | 1 / 1 | **Snail Flick** *(new)*, the card across from her goes back to Leshy's queue, the row where his next cards wait | "a snail comes to visit her in her boat, and she flicks him off into the ocean." |

<details><summary>Costs, and what Leshy says</summary>

In Inscryption you pay for most cards in blood, by sacrificing cards already on your side of the
table. Echo costs bones, which you collect when your cards die. Each new sigil was written after
reading the game's code for the closest thing it already does.

Leshy gets one line per card the first time it's drawn. For Yusef: *"He carries a light I did not
put on this table. Nothing of mine will walk into it... and he will not raise a hand. He was told
not to."* For Ichigo: *"This one is not from my woods. Far too much colour... She does not want to
be here either."* Her world is separate from the others, so she's the card that doesn't belong.

</details>

Here's my art next to each card as the game draws it. The art is renders of
[Jefrie and BloodTailor](/ledger/storm-bell-fighter/), Yusef and
[Echo](/ledger/echo-the-borrowed-voice/), plus my own 2017 drawing of Ichigo. Siloam had only been
described in words, so Claude drew him a faceless placeholder.

<ao-compare cols="6" aspect="2/3">
  <figure><img src="/media/characters-in-inscryption/source-jefrie.webp" alt="Jefrie source render: masked girl with a scythe, red cape and armour" loading="lazy"><figcaption><b>Jefrie</b><span class="ao-meta">my art</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-bloodtailor.webp" alt="BloodTailor source render: iron mask with a wide grin, red coat" loading="lazy"><figcaption><b>BloodTailor</b><span class="ao-meta">my art</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-yusef.webp" alt="Yusef source render: white robe, lantern and Bible" loading="lazy"><figcaption><b>Yusef</b><span class="ao-meta">my art</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-siloam.webp" alt="Siloam placeholder drawn in code: a faceless figure inside a ring of water" loading="lazy"><figcaption><b>Siloam</b><span class="ao-meta">a placeholder drawn in code</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-echo.webp" alt="Echo source render: porcelain bell helm with a red slit" loading="lazy"><figcaption><b>Echo</b><span class="ao-meta">my art</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-ichigo.webp" alt="Ichigo source: strawberry-haired girl flicking a snail off her boat" loading="lazy"><figcaption><b>Ichigo</b><span class="ao-meta">my 2017 drawing</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-jefrie.webp" alt="Jefrie's card in game: ink portrait, red glow on the scythe eye and ears" loading="lazy"><figcaption><b>Jefrie</b><span class="ao-meta">in game, 3 power from Yusef's Leader</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-bloodtailor.webp" alt="BloodTailor's card in game: smooth iron plate, red glowing grin" loading="lazy"><figcaption><b>BloodTailor</b><span class="ao-meta">in game, 4 power after a kill</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-yusef.webp" alt="Yusef's card in game: line art, gold glowing lantern, 0 power 10 health" loading="lazy"><figcaption><b>Yusef</b><span class="ao-meta">in game, gold is his exception</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-siloam.webp" alt="Siloam's card in game: hatched figure inside a blue glowing water ring" loading="lazy"><figcaption><b>Siloam</b><span class="ao-meta">in game</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-echo.webp" alt="Echo's card in game: bell helm with a red glowing slit, 5 health" loading="lazy"><figcaption><b>Echo</b><span class="ao-meta">in game, 5 health after four deaths</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-ichigo.webp" alt="Ichigo's card in game: ink drawing with faded pink glowing hair" loading="lazy"><figcaption><b>Ichigo</b><span class="ao-meta">in game, the one that doesn't belong</span></figcaption></figure>
</ao-compare>

The three new sigils firing, each clip cut from the film:

<ao-compare cols="3" aspect="16/9">
  <figure><video controls muted loop playsinline preload="metadata" src="/media/characters-in-inscryption/clip-snail-flick.mp4"></video><figcaption><b>Snail Flick</b><span class="ao-meta">Ichigo sends the Stoat back to Leshy's queue</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" src="/media/characters-in-inscryption/clip-last-words.mp4"></video><figcaption><b>Last Words</b><span class="ao-meta">Echo gains health as cards die</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" src="/media/characters-in-inscryption/clip-sightless.mp4"></video><figcaption><b>Sightless</b><span class="ao-meta">BloodTailor hits the Grizzly, not the Bullfrog across from him</span></figcaption></figure>
</ao-compare>

## The bug every check missed

The first battle to pass all 12 checks had five of the six portraits drawn in solid black. Only
a screenshot showed it.

<ao-compare cols="2" aspect="16/9">
  <figure><img src="/media/characters-in-inscryption/round1-silhouettes.webp" alt="First showcase run: Ichigo and Yusef portraits render as solid black silhouettes" loading="lazy"><figcaption><b>The first battle that passed</b><span class="ao-meta">12 of 12 checks passed</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/sigil-bifurcated-leader.webp" alt="Final take: the same board with ink portraits and glowing accents" loading="lazy"><figcaption><b>The final take, two hours later</b><span class="ao-meta">ink portraits, colour in the glow</span></figcaption></figure>
</ao-compare>

The game draws every solid pixel on a card as black ink. Claude's mock-ups had put my art on flat
parchment, which hid that. So the portraits were redrawn as ink lines and hatching on a
see-through background, and the colour moved into the glow layer. Red is the only colour in
BloodTailor's world, and on these cards red is the only thing that glows. Yusef's gold is the
exception, same as in my notes on him.

<details><summary>Why the art came out black, and the first round of fixes</summary>

- **The cause, from the game's drawing code.** The portrait gets tinted with a colour that starts
  out black, so every colour in it turns black and only its shape survives. The glow layer only
  switches on when a setting is flipped, and adding art to a card doesn't flip it.
- **Two portraits had already been sent back.** Jefrie's torso read as bare skin at card size, and
  she's always fully covered. BloodTailor's render had eye slits in his iron plate, and he has none.

</details>

## Doing this with another game

This is the part I wanted most. If I want this again for something else, what does it take?

- **Pick the right game.** Single-player, no anti-cheat, and ideally made in Unity, the engine
  behind a lot of indie games. If the game folder has `<Game>_Data\Managed\Assembly-CSharp.dll`,
  the code turns back into readable form in seconds. A `GameAssembly.dll` instead means machine
  code and a much bigger job, like [Jefrie in Megabonk](/ledger/modding-megabonk/).
- **Work on a copy, never the original.** Copy the game folder, add a `steam_appid.txt` file so it
  runs from there, and check your real saves before and after. Back up the game's Windows settings
  too. The copy shares them, and Claude's first test launch changed my real game's resolution and
  fullscreen setting.
- **Get a mod loader and the code.** BepInEx is a free mod loader. Use its 32-bit build for a
  32-bit game. Add the game's community modding toolkit if it has one, and a free decompiler like
  `ilspycmd` to read the code. Setup took about 6 minutes.
- **Have an agent read the code before anyone writes any.** It found a key combination that resets
  all your real Steam achievements, so the test mod switches that off.
- **Build a test mod that plays the game.** It switches on only from the command line, drives the
  game through its own code, blocks achievements and settings changes, and takes screenshots. Then
  a test is one command and a folder of evidence.
- **If the graphics card is busy, try the built-in one.** On my laptop that's the launch option
  `-force-device-index 1`, and the game's log says which chip it got. Don't draw a 32-bit game on
  the processor.
- **Look at the game, not the logs.** Every log check passed while the portraits were black.

Expect about three hours from choosing the game to a mod that works and a recording of it, with the
art as the weakest part.

## Getting the film on a busy laptop

My Claude sessions share one graphics card, an RTX 4070, through a queue. The hour the fixes
needed it, other sessions had about 2.5 hours of work booked, so the agents waited and gave up.
Drawing the game on the processor crashed all five launches. The laptop's small Intel chip worked
first time, and the film took six and a half minutes after that.

<details><summary>What happened on each chip</summary>

- **The RTX, booked.** The agents waited for it, hit their time limits and cancelled without
  launching anything. That hour made a lot of code and no proof.
- **The processor, out of memory.** Claude searched the game engine for launch options and found
  one that draws with no graphics card at all. All five launches crashed loading Leshy's cabin.
  Inscryption is a 32-bit program, so it only gets 4 GB of memory, and drawing in software keeps
  every texture inside that. Half-size textures didn't fit either. That was 44 minutes, and what it
  bought was the reason.
- **The Intel chip, first time.** The same search found an option to pick the graphics chip. On the
  Intel one the game's log named it, the RTX was never touched, and the portrait check passed.
- **The time it cost.** Of the three hours, 2 hours 8 minutes went on getting the film.

</details>

## Playing it

When I asked how to actually play it, a second pass added a starter deck called "Leshy's Guests"
with my three cheapest characters, Ichigo, Jefrie and BloodTailor. It's in Kaycee's Mod, the
game's replayable run mode.

<figure><img src="/media/characters-in-inscryption/starter-deck.webp" alt="Kaycee's Mod starter deck screen: an iron-plated grinning head icon selected, previews of Ichigo, Jefrie and BloodTailor in pixel style" loading="lazy" style="width:100%;border-radius:8px"><figcaption>The starter-deck screen in the real game, on page 2 after the game's own decks. The game never prints deck names, so look for the grinning iron head.</figcaption></figure>

Claude checked it in the game three times, from the deck screen to the first battle. The mod isn't
up for download. The install steps are in
[the full making-of notes](/ledger/characters-in-inscryption/notes/), with Universal Modder's ten
steps, how the self-playing battle works and what each stage cost.

<details><summary>The two fixes the starter deck needed</summary>

- **The deck screen never opened.** My save has only the game's first starter deck, and the game
  skips the deck screen when it counts just one. The modding toolkit doesn't count added decks, so
  one more small patch does.
- **The previews were blank.** That screen draws cards in the game's pixel-art style, not the ink
  one. So each card also got a 41×28 pixel portrait and each new sigil a 17×17 icon, drawn in code.

</details>
