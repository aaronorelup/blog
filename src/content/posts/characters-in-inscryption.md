---
id: "AO-033"
title: "I tried Rehan Sheikh's Universal Modder on a game I own, and Opus 5.5 dealt my characters into Inscryption"
summary: "Opus 5.5 copied Inscryption into a lab, decompiled it, read the code, and added my six characters as cards with three new sigils. Then it wrote a second mod that plays the battle and films it. Every test passed while five of the six portraits were black silhouettes."
date: 2026-10-03
status: "shipped"
tags: ["claude-code", "modding", "gamedev", "characters", "agents"]
series: ["characters", "agent-runs"]
---

On 28 September Rehan Sheikh [posted](https://x.com/rehan_shei/status/2104662849624981571) that
he'd pointed Opus 5.5 at Terraria before bed and woken up to a reverse-engineered game, then added
new weapons and mobs. Two days later he
packaged what Claude had learned into
[Universal Modder](https://x.com/rehan_shei/status/2105161487509852622), a set of skills for
modding "almost any game you own". That post has 14,000 likes and 3.6 million views.

I didn't choose to try it. Claude did: I told it to find the most incredible thing people were
doing with Opus 5.5 on X and do it without me, and this is what it picked. How it chose is
[its own post](/ledger/opus-55-on-x-alone/). This one is the mod.

The game is Inscryption, which I own. By the end, BloodTailor, Jefrie, Yusef, Echo, Siloam and
Ichigo were playable cards on Leshy's table. Each one has a sigil translated from a line on its
canon page, and Leshy says one line about each when it's drawn.

**I didn't play the battle below, and neither did anyone else. Claude wrote a second mod that
boots the game, builds a run, deals the hand, plays every turn through the game's own code and
films it frame by frame.** That's how it checked its own work, and how it found the one thing
that was badly wrong.

<video controls playsinline preload="metadata" poster="/media/characters-in-inscryption/film-poster.webp" src="/media/characters-in-inscryption/film.mp4" style="width:100%;border-radius:8px"></video>

The sound is the game's own mix. The mod recorded it frame by frame alongside the picture while
my speakers stayed silent. It's 1 minute 41 seconds in one continuous take. Leshy introduces each
card as it's drawn, then every sigil fires once and the take holds two seconds on each.

## The loop

Universal Modder is a ten-step loop. Claude followed the loop but didn't install the package
itself. Its asset steps call fal, a paid image API, and Inscryption already has a community
modding API to build on. Here's what each step became:

| Step | What happened here |
|---|---|
| 1. Search field notes | Nothing yet for this game, so the field notes from this run are the first. |
| 2. Recon | Unity 2019.4, compiled to .NET (Mono), **32-bit**, single-player, with a maintained community API. |
| 3. Safe lab | A full copy of the game in a lab folder, its own save, `steam_appid.txt` so it runs from there, and my real save files hashed before and after. |
| 4. Read the real code | The game decompiled into 2,098 C# files in 24 seconds. One agent read it and wrote 339 lines of notes on class and method names that every later agent built against. |
| 5. One working slice | Six cards, three new sigils, and Leshy's lines, as one BepInEx plugin. |
| 6. Assets | Portraits made from my existing art in code (no image model), then redone once the game showed what was wrong. |
| 7. Verify in the running game | A second plugin that plays the game. More on that below. |
| 8. Record | The same plugin films itself, with the game's audio. |
| 9. Package | The plugin plus its art. Install steps are at the end. |
| 10. Field notes | Written for the next agent that tries this on another Unity game. |

## The lab, and the one leak

The copy wasn't fully isolated. Unity keeps a game's settings in the Windows registry under the
game's name, and the real install reads the same place. So the first windowed test launch also
changed my real game's resolution and fullscreen mode. The setup agent caught it because it had
exported those keys before launching and compared them afterwards. A plugin can't stop Unity
writing there, so the fix was to restore the export at the end. Without that check, my real game
would have opened at 1280×720 in a window and I'd never have known why.

## Reading the code

The recon agent was looking for one thing above all: a way to get from launching the game to a
card battle with my cards in hand, without anyone clicking. The game has no debug shortcut.
`DEBUG_KEYS_ENABLED` is false, and a flag called `debugSkipIntro` is never read. What it found
instead was the game's own path. Create a Kaycee's Mod run with a chosen deck, save it (the menu
re-reads the save from disk before loading the cabin), transition to the map, then call the
same method a map node calls when you step on a battle. Turns are played through the game's
own entry points: the hand's card-selected handler, the board's slot handler, and the bell. No
mouse input.

It also found something worth knowing before running any of this. A key combination in the
game's Steam handler resets all of your real Steam achievements and stats. The harness patches
that out, along with every achievement unlock and the game's own settings writes.

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

## The battle that plays itself

The harness is a second plugin that does nothing unless the game is launched with
`--oc-harness=<scenario.json>`. A scenario is a list of steps: play this card into that lane,
sacrificing these; draw; ring the bell; wait; take a screenshot; and expect this card to have
this much health. Each run leaves a log, a pass/fail result and a folder of screenshots.

- Its first launch reached a battle, played two cards and rang the bell. It passed all 14 steps.
- The showcase battle with my six cards passed 44 of 44 steps and all 12 sigil checks on the
  third launch.
- The film is the same battle at a pace a person can follow, with two-second holds on each sigil.
  The game's frame clock is locked to 30 frames per second, and every frame is saved as a JPEG.
  Sound comes from Unity's offline audio renderer, which mixes the game's audio in step with
  those frames instead of sending it to the speakers.

One thing in the video was chosen for the camera. BloodTailor's Sightless sigil picks a random
lane from a seeded random number. On the first seed it picked the lane straight across, which
looks like a normal attack. The harness agent worked out offline which seed would send him
somewhere else, and used that one.

## What went wrong

- **Portraits, round one.** Jefrie's torso read as bare skin at card size. Her canon says she is
  always fully covered, so that had to change. BloodTailor's source render has eye slits in his
  plate, and his canon page says there are none. Both were caught in review and sent back.
- **Portraits, round two, in the game.** All twelve checks passed, and five of the six portraits
  were black silhouettes. Inscryption's Act 1 card shader draws every opaque pixel as ink. The
  mock-ups had put the art on flat parchment, which hid it. Only the real game showed it, and only
  a screenshot could catch it. The fix came from reading the decompiled renderer. The portrait is
  tinted with a colour that defaults to black, so only its alpha survives. The glow map is only
  drawn when a flag is set, and adding the art to the card doesn't set it. So the portraits were
  redrawn as pure ink and hatching on transparency, and my world's one colour moved into the
  glow. Red is the only colour in BloodTailor's world, and on these cards red is literally the
  only thing that glows. Yusef's gold is the exception, as it is in his canon.
- **My GPU was booked.** I share one RTX 4070 between Claude sessions through a queue. During the
  hour the fixes needed it, other sessions had about 2.5 hours of ComfyUI work queued. The agents
  waited, hit their time limits, and cancelled without launching anything. That hour produced a
  lot of code and no proof.
- **Rendering on the CPU failed.** Claude searched the engine's DLL for command-line flags and
  found one that renders with Microsoft's software rasterizer, which uses no GPU at all. All five
  launches ran on it, and all five crashed out of memory loading the cabin. Inscryption is a
  32-bit program, so it gets 4 GB of address space, and the software renderer keeps every texture
  inside it. Half-size textures didn't fit either. That was 44 minutes, and what it bought was
  the reason.
- **The integrated GPU worked.** The same string search had found `-force-device-index`. This
  laptop has an Intel UHD chip alongside the RTX. With index 1, the game's log said
  `Renderer: Intel(R) UHD Graphics`, nvidia-smi never listed the game, and the portrait check
  passed first time. The film take ran straight after and took six and a half minutes. The queue protects the RTX, and the
  RTX was never touched.

## What it cost

| Stage | Agents | Output tokens | Tool calls | Agent minutes |
|---|---|---|---|---|
| Lab, decompile, recon, card design, first portraits | 4 | 256,345 | 278 | 51 |
| Cards plugin, harness plugin, art fixes | 3 | 259,416 | 307 | 61 |
| Ink portraits, film rig, media (the GPU-blocked hour) | 3 | 207,438 | 204 | 105 |
| The CPU-rendering attempt | 1 | 56,817 | 72 | 44 |
| **The mod** | **11** | **780,016** | **861** | **261** |

All Opus 5.5 at xhigh effort, measured from the session transcripts. It took 3 hours from the
pick (16:43) to the finished film (19:42). Of that, 2 hours 8 minutes went on getting the film:
first waiting for the GPU, then the CPU, then the Intel chip. The research before it and the
whole run's totals are in [the other post](/ledger/opus-55-on-x-alone/).

## How to play it

Once I'd asked how to actually play it, a second pass made it playable. The cards were already
in the normal card pool, but they only turned up as random picks. So Claude added a Kaycee's
Mod starter deck called "Leshy's Guests" with my three cheapest characters: Ichigo, Jefrie and
BloodTailor. Getting it to show needed two more fixes, both found in the game:

- **The deck screen never opened.** My save has only the vanilla deck unlocked, and the game
  skips the deck screen when it counts just one deck. The community API doesn't count added
  decks, so one more small patch does.
- **The previews were blank.** The deck screen previews cards in Inscryption's Act 2 pixel style,
  not Act 1 ink. So each card also got a 41×28 pixel portrait and each new sigil a 17×17 icon,
  drawn in code.

<figure><img src="/media/characters-in-inscryption/starter-deck.webp" alt="Kaycee's Mod starter deck screen: an iron-plated grinning head icon selected, previews of Ichigo, Jefrie and BloodTailor in pixel style" loading="lazy" style="width:100%;border-radius:8px"><figcaption>The starter-deck screen in the real game, on page 2 after the vanilla decks. The game never prints deck names, so look for the grinning iron head.</figcaption></figure>

It was checked in the game three times on the Intel chip. The first launch used the build, the
second used the plugin installed from the zip by hand, and the third used it laid out the way
r2modman installs it. All three passed, from the deck screen to the first battle with the three
cards in hand.

To play it:

1. **Back up the save first.** Copy `SaveFile.gwsave` and `SaveFile-Backup.gwsave` out of the
   game folder. Playing writes the modded cards into the save, and a save with them in it may not
   load once the mod is gone. Put the backup back before playing vanilla.
2. **Easiest route: r2modman.** Pick Inscryption, make a profile, install **API** by API_dev from
   the online list (it brings BepInEx and the MonoMod loader with it), then Settings → Import
   local mod → the mod's zip, and Start modded. Starting from Steam stays vanilla. I haven't run
   r2modman itself yet; the layout it installs to is the one tested above.
3. **Or by hand:** BepInEx **x86** 5.4.23.5 (the game is 32-bit, so the x64 build won't load),
   the MonoMod loader and the API from Thunderstore, then the plugin folder into
   `BepInEx\plugins`.
4. **Kaycee's Mod → New Run →** the arrow to page 2 → the grinning head. In the Act 1 story, the
   six cards show up as random card choices and in the trader's offers. Yusef is rare.

Achievements aren't blocked in the play package; only the test harness blocked them. The package
isn't up for download yet.


## Doing this with another game

This is the part I wanted most: if I want this again for something else, what does it take?

- **Pick the right game.** It should be single-player, with no anti-cheat, and ideally Unity on
  Mono. You can tell from the game folder: it has a `<Game>_Data\Managed\Assembly-CSharp.dll`.
  Those decompile back to readable C# in seconds. An IL2CPP game (a `GameAssembly.dll` instead) is
  a much bigger job.
- **Copy the game, never touch the original.** Copy the game folder, add `steam_appid.txt` so it
  runs from the copy, and hash the real save before and after. Export the registry keys for the
  game's settings before the first launch, because the copy and the original share them.
- **Get the loader and the code.** That's BepInEx (the x86 build for a 32-bit game), the game's
  community API if it has one, and `ilspycmd` to decompile into the lab folder. Setup took about
  6 minutes.
- **Have an agent read the code before writing any.** The recon notes are what every later agent
  built against.
- **Build a harness that plays the game.** It should be opt-in from the command line, drive the
  game through its own methods, block achievements and settings writes, and take its own
  screenshots. Without it, every check is me clicking through menus. With it, a test is one
  command and a folder of evidence.
- **If the GPU is busy, try the integrated one.** That's `-force-device-index 1` on this laptop,
  and the game's log tells you which chip it got. Don't try CPU rendering on a 32-bit game.
- **Look at the game, not the logs.** Every log check passed while the portraits were black
  silhouettes.

What to expect: about three hours of wall-clock from choosing the game to a mod that works in the
real game and a recording of it, with the art as the weakest part. The code side went faster than
the art did.

At the end the lab was deleted: the 3.5 GB game copy, BepInEx, the decompiled code and ILSpy.
The caches the installs had left were cleared, the registry settings were restored, and both of
my real save files were hashed again and still match.

Every claim in this post comes with a screenshot, because the mod takes its own. Those
screenshots caught the one thing no check had: the most visible thing on the card was wrong.
It's the same lesson as [the film](/ledger/storm-bell-pop-up/) that went out with a score nobody
had listened to. A test can only check what someone thought to write down, and nobody had
written down what a portrait should look like.
