---
id: "AO-032"
title: "Claude picked the best Opus 5.5 trick on X, then modded a game I own and dealt my characters into it"
summary: "I asked Claude to find the most incredible thing people were doing with Opus 5.5 that I hadn't tried, and do it alone. It chose modding a game I own. Four hours later my six characters were cards on Leshy's table in Inscryption, and the battle in the video was played and filmed by the mod itself. All the tests passed while five portraits were black silhouettes."
date: 2026-10-03
status: "shipped"
tags: ["claude-code", "agents", "modding", "gamedev", "characters"]
series: ["characters", "agent-runs"]
---

On 3 October I gave Claude one instruction: go on X, see what people are doing with Opus 5.5,
pick the most incredible thing I haven't tried that you can do on your own, do it with what you
know about me, and write it up here so you can judge the result. Opus 5.5 agents only, no more
than five at a time, check the clock every 30 minutes, four to six hours in total.

It picked modding a game I own. By the end, BloodTailor, Jefrie, Yusef, Echo, Siloam and Ichigo
were playable cards in Inscryption. Each one has a sigil translated from a line on its canon
page, and Leshy says one line about each when it's drawn.

**I didn't play the battle below, and neither did anyone else. Claude wrote a second mod that
boots the game, builds a run, deals the hand, plays every turn through the game's own code and
films it frame by frame.** That's how it checked its own work, and how it found the one thing
that was badly wrong.

<video controls playsinline preload="metadata" poster="/media/characters-in-inscryption/film-poster.webp" src="/media/characters-in-inscryption/film.mp4" style="width:100%;border-radius:8px"></video>

The sound is the game's own mix. The mod recorded it frame by frame alongside the picture while
my speakers stayed silent. 1 minute 41 seconds, one continuous take: Leshy introduces each card
as it's drawn, then every sigil fires once and the take holds two seconds on each.

## How it chose

Everything in this section was decided by agents. My only part was the prompt.

**X first.** The in-app browser hit X's login wall, and Claude won't type a password, so it
used my Chrome, where I'm already signed in. Its first scraping script froze: X was a background
tab, and Chrome throttles timers in background tabs until a 45-second limit killed the call. It
switched to small steps (navigate, read the page, scroll) and pulled about 60 of the most-liked
posts mentioning Opus 5.5, both of Min Choi's roundup threads, and the full 9,861-character
prompt behind the most viral one: donald's 12-hour, one-prompt music video.

**Then the rest of the web.** Four agents searched in parallel, one each for press and newsletters,
Reddit and Hacker News, creative and media work, and long autonomous runs. In 12 minutes they
came back with 57 candidates, each with how it was made and whether it could be repeated alone on
my laptop.

**Then me.** A sixth agent read my blog, my skills folder, my Notion and my Claude Code history
to list everything I've already tried: agent-built games, code-drawn films, H3 films, Blender
previs, Jefrie in 3D, ElevenLabs songs, 16 wallpapers. It took 54 minutes, mostly because a
search across my whole history timed out after 30.

**Then a vote.** Eight finalists went to five judges, each scoring all eight on one thing only:
wow, novelty for me, whether it could be finished alone in about three hours, what I'd learn
that carries over to other projects, and whether it would delight me and you. Four of the five
picked the same one.

| Finalist | Wow | Novelty | Feasible alone | Learning | Delight | Total /50 |
|---|---|---|---|---|---|---|
| **A. Mod a game I own** | 9 | 10 | 6 | 9 | 9 | **43** |
| B. Oil paintings in a paint simulator | 8 | 8 | 5 | 5 | 8 | 34 |
| E. A song where code synthesizes every sound, voice included | 8 | 5 | 7 | 6 | 5 | 31 |
| H. Interactive explainer (the Lens Lab) | 5 | 3 | 9 | 7 | 5 | 29 |
| D. A buildable LEGO model with instructions | 7 | 8 | 3 | 4 | 6 | 28 |
| G. Rotoscoping a generated video in code | 6 | 4 | 4 | 6 | 7 | 27 |
| C. Zero-direction demoscene intro | 6 | 2 | 8 | 4 | 4 | 24 |
| F. Arcane-style painted shot in Blender | 6 | 4 | 3 | 5 | 6 | 24 |

The feasibility judge voted for H, the explainer. It was right that the mod was the riskier of
the two.

The winner was Rehan Sheikh's [Universal Modder](https://x.com/rehan_shei/status/2105161487509852622).
He pointed Opus 5.5 at Terraria before bed and
[woke up](https://x.com/rehan_shei/status/2104662849624981571) to a reverse-engineered game with
new weapons and mobs, then packaged what Claude had learned as skills for modding "almost any
game you own". That post has 14,000 likes and 3.6 million views. Claude checked my Steam folder
for a game it could do this to. Elden Ring, Palworld and Path of Exile 2 are online games with
anti-cheat, so they were ruled out. Inscryption is a Unity game compiled to .NET, which is the
easiest kind to read, and it's single-player. Its look also suits my characters' world: dark,
grey, candlelit, and run by something that would rather play games with you than kill you.

## What I'd have done instead

Second place was **[Claude Paint](https://x.com/aliceisplaying/status/2104672235093119196)**, by
alice. It is a physics simulator for oil paint, written in Rust: bristles carrying wet paint over
linen, paint that dries on a clock, colours that mix like real pigment, and no undo. Opus 5.5
paints by writing Lua against a live easel, steps back to look at the canvas, then paints the
next passage. Its [Show HN](https://news.ycombinator.com/item?id=49928566) had 367 points the
day before. The plan was to have it paint my characters from their canon pages alone, BloodTailor as
a figure seen from behind, Friedrich-style, and ship the replays as time-lapses. It lost on two
counts: the repo assumes macOS (launchd, bash scripts), so Windows was a gamble, and on X it was
a few hundred likes against fourteen thousand.

The rest of the shortlist, all opened and checked on X the same day:

| | What it is | Post |
|---|---|---|
| E | "No Samples": a rap single where JavaScript synthesizes every sound, the rapping voice included | [@aj_dev_smith](https://x.com/aj_dev_smith/status/2102803889183736141) · 2.0k likes |
| H | An interactive camera-lens lab, one shot, 1 h 26 min, $25.66 | [@RyanSael](https://x.com/RyanSael/status/2102591147927654847) · 16.2k likes · 3.5M views |
| D | A life-size LEGO Microduck from 1,113 real parts, with a 141-page instruction book | [@victormustar](https://x.com/victormustar/status/2103110908444631120) · 8.7k likes · 1.3M views |
| G | Rotoscoping in code: a video generated first, then redrawn frame by frame as JavaScript so the base is never seen | [@donaldjewkes](https://x.com/donaldjewkes/status/2102801274173587569) · 10.7k likes · 3.8M views; [@gandamu_ml](https://x.com/gandamu_ml/status/2104402167906124280) |
| C | "Make the most impressive demo of yourself": a demoscene intro, every pixel and sound in one 280 KB HTML file | [@JustinPerea](https://x.com/JustinPerea/status/2102893186330841502) · 1.6k likes |
| F | "SPARK": an Arcane-style shot in Blender, every texture painted stroke by stroke in code | [@xikhar](https://x.com/xikhar/status/2105315982525014067) · [the prompt](https://x.com/xikhar/status/2105317581695623329) |

Other posts weighed and ruled out because I've already done something like them:
[the P(doom) music video](https://x.com/other__reality/status/2102514581684052169) (2.8M views)
and Alex Albert's [one-prompt Blender claymation](https://x.com/alexalbert__/status/2102458348511879448).

## What it took

Times are Central, from the session transcript and the build log. Each lane is a group of
agents; the lead session is the one I prompted.

<ao-timeline lanes="lead:Lead session|research:Research agents|build:Build agents|game:In the game">
<ol>
<li data-lane="lead"><time>15:41</time><p>My prompt. The lead checks the clock and splits the work.</p></li>
<li data-lane="research"><time>15:43</time><p>The profile agent starts on my blog, skills, Notion and history. It takes 54 minutes.</p></li>
<li data-lane="lead"><time>15:45</time><p>X's login wall, then my Chrome. The first scraper freezes in a background tab, so it scrapes step by step.</p></li>
<li data-lane="research"><time>15:47</time><p>Four web-sweep agents. 12 minutes, 57 candidates.</p></li>
<li data-lane="research"><time>16:38</time><p>Five judges, 2 minutes. Modding a game I own: 43 of 50.</p></li>
<li data-lane="build"><time>16:42</time><p>Lab copy, BepInEx, InscryptionAPI, and the game's code decompiled into 2,098 C# files. 6 minutes in total, 24 seconds of it decompiling.</p></li>
<li data-lane="game"><time>16:46</time><p>First launch from the copy. The registry side effect is found here.</p></li>
<li data-lane="build"><time>16:50</time><p>Recon reads the code. The card designer reads six Notion pages. The portrait artist starts on my reference art.</p></li>
<li data-lane="build"><time>17:06</time><p>The cards plugin, the harness plugin and the art fixes, in parallel.</p></li>
<li data-lane="game"><time>17:25</time><p>The harness's first launch reaches a battle, plays two cards and rings the bell. Nobody clicks.</p></li>
<li data-lane="game"><time>17:32</time><p>The showcase battle: 44 of 44 actions, 12 of 12 sigil checks, and five black silhouettes.</p></li>
<li data-lane="build"><time>17:34</time><p>Ink portraits and the film rig get built. The GPU queue is full, so neither runs.</p></li>
<li data-lane="lead"><time>18:46</time><p>A search of the engine DLL finds a flag that renders on the CPU, and a second that picks the GPU.</p></li>
<li data-lane="game"><time>19:00</time><p>Five CPU-rendered launches, five out-of-memory crashes.</p></li>
<li data-lane="game"><time>19:33</time><p>On the Intel chip, the portrait check passes and the glow shows.</p></li>
<li data-lane="game"><time>19:36</time><p>The film take on the Intel chip: 47 of 47 actions, 3,021 frames, and the game's audio recorded offline. 6 minutes for 101 seconds of film.</p></li>
<li data-lane="lead"><time>19:50</time><p>Cleanup: the registry restored, the game copy and every tool deleted, the real saves hashed again. Then this post.</p></li>
</ol>
</ao-timeline>

## The cards

The rule given to the card-design agent: every mechanic comes from a quote on the character's
Notion page, copied word for word, and the mechanic is labelled an interpretation, never canon.
The stats follow my power ranking (Yusef far above Siloam, then BloodTailor, then Jefrie), at
Inscryption's scale.

| Card | Cost | Power / Health | Sigils | The canon line it comes from |
|---|---|---|---|---|
| **Jefrie** | 2 blood | 2 / 1 | Bifurcated Strike | "It lags behind her hands, overshoots, keeps swinging after she stops" (her tail-heavy scythe, so it hits both lanes beside the one in front) |
| **BloodTailor** | 2 blood | 2 / 3 | Blood Lust, **Sightless** *(new)* | "The more blood loss he inflicts, the more he can forge" (+1 power per kill); he's blind, so he strikes a random lane |
| **Yusef** | 3 blood | 0 / 10 | Repulsive, Leader | "No demon will walk into the lantern's light" (nothing attacks him). 0 power because he's forbidden to use his strength |
| **Siloam** | 3 blood | 3 / 4 | Waterborne | "He is seen less than the other characters in the story." He submerges during Leshy's turn |
| **Echo** | 4 bones | 1 / 1 | Corpse Eater, **Last Words** *(new)* | "it keeps the last words of the dying" (+1 health whenever anything else dies) |
| **Ichigo** | 1 blood | 1 / 1 | **Snail Flick** *(new)* | "a snail comes to visit her in her boat, and she flicks him off into the ocean." The card across from her goes back to Leshy's queue |

Three sigils are new code; the other six are the game's own. Each new one was written after
reading the decompiled code for the closest thing the game already does. Snail Flick calls the
game's own "return a card to the queue" method. Reading that method showed it leaves the
flicked card on the board, so the mod clears the lane itself, the same way the game does when
a card moves.

Leshy gets one line per card the first time it's drawn, in his voice, e.g. for Yusef: *"He
carries a light I did not put on this table. Nothing of mine will walk into it... and he will
not raise a hand. He was told not to."* For Ichigo: *"This one is not from my woods. Far too
much colour... She does not want to be here either."* Her world is separate from the others,
so she's the card that doesn't belong.

Here is each source next to the card it became, as the game renders it. The top row is my art:
renders from my pipelines, except Ichigo's, which comes from my 2017 drawing. Siloam was only
described in words on 29 September and has no art yet, so his card is a placeholder drawn in
code, faceless on purpose.

<ao-compare cols="6" aspect="2/3">
  <figure><img src="/media/characters-in-inscryption/source-jefrie.webp" alt="Jefrie source render: masked girl with a scythe, red cape and armour" loading="lazy"><figcaption><b>Jefrie</b><span class="ao-meta">source</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-bloodtailor.webp" alt="BloodTailor source render: iron mask with a wide grin, red coat" loading="lazy"><figcaption><b>BloodTailor</b><span class="ao-meta">source</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-yusef.webp" alt="Yusef source render: white robe, lantern and Bible" loading="lazy"><figcaption><b>Yusef</b><span class="ao-meta">source</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-siloam.webp" alt="Siloam placeholder drawn in code: a faceless figure inside a ring of water" loading="lazy"><figcaption><b>Siloam</b><span class="ao-meta">placeholder, no art yet</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-echo.webp" alt="Echo source render: porcelain bell helm with a red slit" loading="lazy"><figcaption><b>Echo</b><span class="ao-meta">source</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/source-ichigo.webp" alt="Ichigo source: strawberry-haired girl flicking a snail off her boat" loading="lazy"><figcaption><b>Ichigo</b><span class="ao-meta">source</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-jefrie.webp" alt="Jefrie's card in game: ink portrait, red glow on the scythe eye and ears" loading="lazy"><figcaption><b>Jefrie</b><span class="ao-meta">in game, 3 power from Yusef's Leader</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-bloodtailor.webp" alt="BloodTailor's card in game: smooth iron plate, red glowing grin" loading="lazy"><figcaption><b>BloodTailor</b><span class="ao-meta">in game, 4 power after a kill</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-yusef.webp" alt="Yusef's card in game: line art, gold glowing lantern, 0 power 10 health" loading="lazy"><figcaption><b>Yusef</b><span class="ao-meta">in game, gold is his exception</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-siloam.webp" alt="Siloam's card in game: hatched figure inside a blue glowing water ring" loading="lazy"><figcaption><b>Siloam</b><span class="ao-meta">in game</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-echo.webp" alt="Echo's card in game: bell helm with a red glowing slit, 5 health" loading="lazy"><figcaption><b>Echo</b><span class="ao-meta">in game, 5 health after four deaths</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/ingame-ichigo.webp" alt="Ichigo's card in game: ink drawing with faded pink glowing hair" loading="lazy"><figcaption><b>Ichigo</b><span class="ao-meta">in game, the one that doesn't belong</span></figcaption></figure>
</ao-compare>

On the left, the first battle that passed every check. On the right, the same moment in the
final take.

<ao-compare cols="2" aspect="16/9">
  <figure><img src="/media/characters-in-inscryption/round1-silhouettes.webp" alt="First showcase run: Ichigo and Yusef portraits render as solid black silhouettes" loading="lazy"><figcaption><b>Showcase run, 17:32</b><span class="ao-meta">12 of 12 checks passed</span></figcaption></figure>
  <figure><img src="/media/characters-in-inscryption/sigil-bifurcated-leader.webp" alt="Final take: the same board with ink portraits and glowing accents" loading="lazy"><figcaption><b>Final take, 19:38</b><span class="ao-meta">ink portraits, emission on</span></figcaption></figure>
</ao-compare>

The three new sigils firing, each clip cut from the film:

<ao-compare cols="3" aspect="16/9">
  <figure><video controls muted loop playsinline preload="metadata" src="/media/characters-in-inscryption/clip-snail-flick.mp4"></video><figcaption><b>Snail Flick</b><span class="ao-meta">Ichigo sends the Stoat back to Leshy's queue</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" src="/media/characters-in-inscryption/clip-last-words.mp4"></video><figcaption><b>Last Words</b><span class="ao-meta">Echo gains health as cards die</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" src="/media/characters-in-inscryption/clip-sightless.mp4"></video><figcaption><b>Sightless</b><span class="ao-meta">BloodTailor hits the Grizzly, not the Bullfrog across from him</span></figcaption></figure>
</ao-compare>

## What went wrong

In order:

- **X wanted a login.** Claude doesn't enter passwords, so it moved to my signed-in Chrome.
  Its first scraper then froze, because Chrome throttles background tabs. A 45-second timeout
  killed it.
- **The profile agent took 54 minutes** of the first hour. Most of that was one search across
  my entire Claude Code history that hit its 30-minute timeout.
- **Two of the sweep's X links were wrong.** One status ID didn't load, and one was a retweet
  standing in for the original post. Claude only caught them because it opened every link
  before putting it in this post.
- **The lab copy wasn't fully isolated.** Unity keeps a game's settings in the Windows registry
  under the game's name. That location is shared, so the first windowed test launch also changed
  my real install's resolution and fullscreen mode. The setup agent caught it by exporting
  the keys before launching and diffing them after. A plugin can't block Unity's own write, so
  the fix is a restore at the end.
- **Portraits, round one.** Jefrie's torso read as bare skin at card size. Her canon says she
  is always fully covered, so that had to change. BloodTailor's source render has eye slits in
  his plate, and his canon page says there are none. Both were caught in my review and sent back.
- **Portraits, round two, in the game.** All twelve logic checks passed, and five of the six
  portraits were black silhouettes. Inscryption's Act 1 card shader draws every opaque pixel as
  ink. The mock-ups had put the art on flat parchment, which hid it. Only the real game showed it,
  and only a screenshot could catch it. The fix came from reading the decompiled renderer. The
  portrait is tinted with a colour that defaults to black, so only its alpha survives, and the
  emission map is only drawn when a flag is set. Adding the art to the card doesn't set it. So
  the portraits were redrawn as pure ink and hatching on transparency, and my world's one colour
  moved into the glow. Red is the only colour in BloodTailor's world, and on these cards red is
  now literally the only thing that glows. Yusef's gold is the exception, as it is in his canon.
- **My GPU was booked.** I share one RTX 4070 between Claude sessions through a queue, and
  during the hour the art fix and the film needed it, other sessions had queued 2.5 hours of
  ComfyUI work. Three agents waited, hit their time limits and cancelled their tickets without
  launching anything. That hour produced a lot of code and no proof.
- **The software-rendering idea failed.** Claude searched the game's engine DLL for
  command-line flags and found one that renders on the CPU with Microsoft's software
  rasterizer, which uses no GPU at all. All five launches ran on it, and all five crashed out
  of memory loading the cabin. Inscryption is a 32-bit program, so it gets 4 GB of address
  space, and the software renderer keeps every texture inside it. Half-size textures didn't fit
  either. 44 minutes, and the useful result is knowing why.
- **The integrated GPU worked.** The same string search had also found `-force-device-index`.
  This laptop has an Intel UHD chip alongside the RTX. With index 1, the game's log said
  `Renderer: Intel(R) UHD Graphics`, nvidia-smi never listed it, and the portrait check passed
  on the first try. The queue protects the RTX, and the RTX was never touched.
- **A demo seed was chosen.** BloodTailor's Sightless sigil picks a random lane from a seeded
  random number. On the first showcase seed it picked the lane straight across, which looks
  like a normal attack. The harness agent worked out offline which seed would send him into a
  different lane, and used that one. The sigil is real; the seed in the video was picked for
  the camera.

## What it cost

| Stage | Agents | Output tokens | Tool calls | Agent minutes |
|---|---|---|---|---|
| Research: profile, 4 web sweeps, 5 judges | 10 | 176,071 | 439 | 104 |
| Lab, decompile, recon, card design, first portraits | 4 | 256,345 | 278 | 51 |
| Cards plugin, harness plugin, art fixes | 3 | 259,416 | 307 | 61 |
| Ink portraits, film rig, media (the GPU-blocked hour) | 3 | 207,438 | 204 | 105 |
| The CPU-rendering attempt | 1 | 56,817 | 72 | 44 |
| Lead session | 1 | 156,563 | 187 | 248 |
| **Total** | **22** | **1,112,650** | **1,487** | **613** |

Every agent was Opus 5.5 at xhigh effort, and never more than five ran at once. The agent
minutes add up to more than the wall clock because agents ran in parallel. From prompt to film
was 4 hours; with cleanup and this post, about 4.5. The run also read 214 million tokens of
cached context, 192 times its output. These figures come from the session transcripts, measured
when the film was done. I'm on a flat subscription, so there's no bill to show.

## Doing this with another game

This is the part I wanted most: if I want this again for something else, what does it take?

- **Pick the right game.** Single-player, no anti-cheat, and ideally Unity on Mono: the folder has
  a `<Game>_Data\Managed\Assembly-CSharp.dll`. Those decompile back to readable C# in seconds. An
  IL2CPP game (a `GameAssembly.dll` instead) is a much bigger job. One of mine, WLKRR, is IL2CPP
  and was skipped.
- **Copy the game, never touch the original.** Copy the game folder, add `steam_appid.txt` so it
  runs from the copy, and hash the real save before and after. Export the registry keys for the
  game's settings before the first launch, because those are shared.
- **Get the loader and the code.** BepInEx (the x86 build for a 32-bit game), the game's community
  API if it has one, and `ilspycmd` to decompile into the lab folder. Setup took about 6 minutes.
- **Have an agent read the code before writing any.** The recon agent's notes (339 lines of class
  and method names) are what every later agent built against. It found that the game has no debug
  shortcut into a battle, and also found the route that works without one.
- **Build a harness that plays the game.** A plugin that only runs when you pass a command-line
  flag, drives the game through its own methods (never the mouse), blocks achievements and
  settings writes, and takes its own screenshots. Without it, every check is me clicking through
  menus. With it, a test is one command and a folder of evidence.
- **Look at the game, not the logs.** Every log check passed while the portraits were black
  silhouettes.

What to expect: in about four hours of wall-clock, a mod that works in the real game, a
recording of it, and art that is the weakest part. The code side went faster than I expected,
and getting art to look native went slower.

The mod's source, the harness, the scenarios and the field notes are in my project folder. At
the end the lab was deleted: the 3.5 GB game copy, BepInEx, the decompiled code and ILSpy. The
pip and NuGet caches the installs had left were cleared, the registry settings were restored,
and both of my real save files were hashed again and still match.

Every claim in this post comes with a screenshot, because the mod can take its own. The one
thing those screenshots showed that no check had caught was the most visible thing on the card.
The same was true when [the film](/ledger/storm-bell-pop-up/) went out with a score nobody had
listened to: a test can only check what someone thought to write down, and nobody had written
down what a portrait should look like.
