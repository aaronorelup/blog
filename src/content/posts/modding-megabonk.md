---
id: "AO-036"
title: "Modding my own character into the game Megabonk"
summary: "My Claude agents put my character Jefrie into Megabonk, a game I play, with no code, then gave her a jump the game doesn't have. What's easy, what needs real code, and how to mod it safely."
date: 2026-10-05
status: "in-progress"
tags: ["claude-code", "modding", "gamedev", "characters", "agents"]
series: ["characters", "agent-runs"]
topic: "games"
project: ["characters"]
preview:
  verdict: "Works, still in a test copy"
  takeaway: "A new Megabonk character needs no code, only a model, five animations and the community loader, but a new move needs a plugin that hooks the game's code."
  points:
    - "A copied game still shares your saves and Steam account. Turn score uploads off, then block them in a plugin too."
    - "In Claude's test runs the tail jump sent her 5.77 m up, against 3.70 m for a normal jump."
    - "The code was the small part. The tail-jump plugin took one agent 14 minutes and her reference art took 7.5 hours."
  image: "/media/previews/modding-megabonk.webp"
  alt: "Jefrie's 3D model in Megabonk's character select, scythe beside her, next to the panel listing her Heavy Scythe and Tail Spring"
---

My Claude agents put my character Jefrie into the game Megabonk as a new playable character, and
the character itself took no code at all. Jefrie is my grinning scythe girl with a tail heavier than she is. Megabonk
is a 3D game where you run around a map while your weapons fire on their own at swarms of
enemies.

The one part of her that needed code was a move the game doesn't have, a first jump launched by her
tail. That took a plugin, a small program the game loads at start-up that runs new code inside
it. In Claude's test runs it sent her 5.77 m up, against 3.70 m for a normal jump.

Claude's agents did all of it, over about 16 hours for the first version and one more evening
for the second. I said what I wanted and played the result. The most careful part was safety,
because my test copy of the game still shares my saves and Steam account with the real one.

<ao-compare cols="1">
  <figure class="wide"><img src="/media/modding-megabonk/ingame-charselect.webp" alt="Megabonk's character select with Jefrie selected: her 3D model in a red cape and black sleeves with her spiked tail curled at her side, and the info panel listing the Heavy Scythe and the Tail Spring passive" loading="lazy"><figcaption><b>Jefrie in Megabonk's character select, version 2</b><span class="ao-meta">her Heavy Scythe and the Tail Spring passive · a screenshot from Claude's test runs in my test copy</span></figcaption></figure>
</ao-compare>

- **A new character takes no code.** A model, five animation clips, an icon and a data file,
  loaded by the community's character loader, a free mod.
- **A new move takes a plugin.** Tail Spring is 241 lines that hook the game's own jump. If a game
  update breaks it, it switches itself off.
- **A copy of the game isn't a sandbox.** It shares your saves and Steam stats. Turn score uploads
  off, then block them in code too.
- **The code was the small part.** The plugin took 14 minutes. Her reference art took 7.5 hours.
- **Where it stands on 5 October.** Version 1 passed my playtest. Version 2 passed Claude's scripted test runs
  on the third try, after two failed on bugs in the test script. My playtest of it is next, and
  nothing is in my real Steam install yet.

<ao-compare cols="2" aspect="16/10">
  <figure><img src="/media/modding-megabonk/ingame-run.webp" alt="Jefrie running up a grassy slope toward goblins, her spiked tail trailing straight behind her and her scythe raised" loading="lazy"><figcaption><b>Run</b><span class="ao-meta">run 1 · tail trailing behind her</span></figcaption></figure>
  <figure><img src="/media/modding-megabonk/ingame-tailspring-apex.webp" alt="Jefrie in the air near the top of her first jump, tail hanging below her, goblins on the hillside" loading="lazy"><figcaption><b>Tail Spring jump</b><span class="ao-meta">near the top · 5.77 m</span></figcaption></figure>
  <figure><img src="/media/modding-megabonk/ingame-grind.webp" alt="Jefrie side-on, riding a grey rail with her tail stretched out behind her while her scythe sweep hits two enemies for 14 damage each" loading="lazy"><figcaption><b>Grind</b><span class="ao-meta">on a rail Claude's script spawned and set her on · runs 2 and 3 only, a script bug threw her off in run 1</span></figcaption></figure>
  <figure><img src="/media/modding-megabonk/ingame-fall.webp" alt="Jefrie falling between mossy stone ruins, seen from above, tail hanging behind her" loading="lazy"><figcaption><b>Fall</b><span class="ao-meta">a test drop between ruins</span></figcaption></figure>
</ao-compare>

These shots come from the three test runs, played by a script Claude wrote that drives the game
by itself.

## What's easy and what takes code

| What you want to change | How hard | How |
|---|---|---|
| **A new playable character** | Easy | A model and five animation clips, built with the community's character maker |
| **A skin for a character** | Easy | The same tools |
| **Name, description, icons** | Easy | Fields in the character's data file |
| **Starting stats** | Easy | Any of the game's own 57 stats, set in the data file |
| **A weapon** | Medium | Your own look, timing and effects on top of one of the game's attack types |
| **A passive** | Rename only | One of the game's 21 passives, or its empty one, under your own name, text and icon |
| **A base-game weapon as her starting weapon** | Needs a plugin | The data file can't point at one |
| **New behaviour: a new projectile, passive effect or movement** | Needs a plugin | |
| **Online play, anti-cheat, leaderboards** | Don't | |

The line falls there because Megabonk ships as machine code, with no readable script to edit. A
character pack can only carry data, like 3D models, textures, animations and
pointers to things the game already has. So a custom weapon is really "the game's melee attack,
with these numbers".

A plugin can run new code. BepInEx, the mod framework the loader runs on, loads your code when
the game starts and lets it run before or after any of the game's functions. The catch is finding
the right function, because the game doesn't ship them in readable form. Claude used Cpp2IL, a
tool that turns a compiled game back into readable names and instructions.

## Her kit

Every character has a starting weapon and a passive, an always-on perk.

- **Heavy Scythe.** The game's own melee attack inside our weapon, with a 0.98-second swing that
  starts slow, overshoots and swings back. That's Claude's reading of her character notes, which
  say the scythe "lags behind her hands".
  It landed 14 to 18 hits a run in the tests.
- **Marionette Tail, version 1.** The game's Float passive with a new name, so she drifted down
  when you held jump. It worked, but floating isn't what her tail does. It rears up and slams down
  to launch her.
- **Tail Spring, version 2.** The game's empty None passive with a new name and text. The real
  effect lives in the plugin.

<ao-compare cols="1">
  <figure class="wide"><img src="/media/modding-megabonk/ingame-fight.webp" alt="Jefrie against a wall with a crowd of green goblins in front of her, the white sweep scythe arcing through them with 14-damage numbers floating up" loading="lazy"><figcaption><b>The Heavy Scythe in a real run: every hit is 14</b><span class="ao-meta">run 1, 44 seconds in</span></figcaption></figure>
</ao-compare>

## The tail jump

Tail Spring makes her first jump after landing about 1.6 times as high on flat ground, and leaves
every other jump alone. It hooks the game's jump function, which every jump goes through, and adds upward
speed right after the game's own jump.

Claude's test script checked it against the same jump 2 seconds later with the boost off. The
tail jump peaked at 5.77 m and the normal one at 3.70 m. That's 1.56 times the height, the same in
two runs.

It took one agent about 14 minutes, research included, and nothing had to change after the game
ran it. Whether 1.6 feels right is my playtest's job.

<ao-compare cols="1">
  <figure class="wide"><video controls muted playsinline preload="metadata" poster="/media/modding-megabonk/tailspring-run.webp" src="/media/modding-megabonk/tailspring-run.mp4"></video><figcaption><b>Tail Spring, then the normal control jump, an extra air jump and a grind</b><span class="ao-meta">run 2 · captured from outside the game at about 22 frames a second · 11 s</span></figcaption></figure>
</ao-compare>

<details><summary>How the tail jump works, measured</summary>

- **The math.** Height grows with the square of launch speed, so the plugin adds about 26% speed
  for 60% more height. The tail jump took off at 17.71 m/s, the normal one at the game's own
  14.00 m/s. Claude's guess for the small gap under 1.6 is the few moments the game still counts
  her as on the ground after take-off.
- **Already rising, it goes higher.** Jump while moving up a slope or off a ramp and the boost
  comes on top of that speed. One test jump that started at 10.74 m/s upward reached 12.46 m.
- **Downhill, it goes lower.** The game doesn't cancel her downward speed before a jump, and the
  plugin adds its full boost on top of whatever is left. Two jumps that started still moving down
  at 3.05 and 9.85 m/s peaked at 3.79 m and 1.12 m.
- **Air jumps stay normal.** Jefrie has no air jump of her own, so the test script gave her one,
  the way an extra-jump item would. The plugin's counter didn't move on any of them.
- **Items should still count.** The boost scales with her jump height stat, so anything that
  raises it should raise the tail jump too. That's read from the code, not measured in the game.
- **It fails safe.** If a game update renames something it needs, it writes one `DISABLED` line to
  the log, patches nothing, and she jumps normally.
- **It has a dial.** A settings file sets the boost anywhere from 1.0 to 3.0 times the height.
- **The game already does this.** Its jump has special code for two of its own characters, Monke
  and Ninja. The plugin checks the same field the game checks, so movement that's different per
  character is something Megabonk does itself.
- **The passive slot really is empty.** Claude decoded the game's passive code to make sure None
  does nothing. Keeping Float would have meant patching out its slow fall and a hidden damage bonus
  it gives while she's in the air.
- **No Visual Studio needed.** The free .NET compiler, pointed at the game's mod folders, builds
  the plugin in about 1.5 seconds. Cpp2IL listed the game's 114,472 functions in 42 seconds.

The heart of the plugin, trimmed:

```csharp
if (pm.usedJumps != s.UsedJumpsBefore + 1) return;              // the game didn't jump
if (!s.OnGround || s.UsedJumpsBefore != 0) return;               // air, rail, ladder, wall jump: unchanged
float gameUp = pm.GetJumpForce() / mass * (1.5f + 0.5f * n.y);   // the game's own upward jump speed
float extra = Mathf.Min((k - 1f) * gameUp, MaxExtraUpSpeed);     // k = sqrt(1.6)
rb.AddForce(new Vector3(0f, extra, 0f), ForceMode.VelocityChange);
```

</details>

## Doing it safely

- **A copy isn't isolated.** It runs on your Steam account and shares your saves, settings, stats,
  achievements and leaderboards with the real game. Whatever you earn in the copy counts in your
  real save.
- **Back up your saves first, and never copy the backup back.** Steam Cloud, Steam's automatic
  save sync, could push the old files over your newer progress.
- **Turn score uploads off.** It's Settings > Game > Upload Score to Leaderboards > Off. Every copy
  shares that setting, so turning it off in the test copy turned it off in my real game too.
- **Then block uploads in code anyway.** The game's own mod check only guards the global
  leaderboard, and only for big scores. So Claude wrote a second plugin, JefrieSafety, that blocks
  the game's calls to Steam. In my first playtest it blocked all five score uploads and about
  3,100 stat writes.
- **Your save still changes.** JefrieSafety only stops what goes to Steam. Claude's test script
  blocks save writes too.
- **Write the uninstaller before you install.** Ours removes exactly the 235 files the mod added
  and never touches saves. Steam's "Verify integrity of game files" won't remove the mod, because
  it only checks Steam's own files.

The game also grabs the whole screen every time it opens. The agents launched it 11 times before I
asked them to stop and did the playtesting myself. Later I let Claude back in for the three short
scripted runs.

## How her model got made

Her model started as a reference sheet in Megabonk's style, which took 7.5 hours and three rounds.
An AI model turned it into 3D, cut down to 3,000 triangles to match the game's own characters,
which run 864 to 4,434. Rigging it (giving it a skeleton to move with), the clips and building
her for the game took about three hours after that. The full story is in
[the AI rigging post](/ledger/ai-rigging-vs-a-script/). The first time I tried to put her in 3D it
took [six days](/ledger/jefrie-in-3d/).

<ao-compare cols="1">
  <figure class="wide"><img src="/media/modding-megabonk/refs-board.webp" alt="Reference board: wiki portraits of Megabonk's Fox, Noelle and Robinette as style references, Jefrie's canon art as identity, a 3D layout proxy from four sides, and the finished Megabonk-style turnaround, scythe prop and 32-pixel icon" loading="lazy"><figcaption><b>What drove her look</b><span class="ao-meta">three of the game's portraits from the Megabonk wiki for style, my art of her for identity, one rough 3D model so every view agrees, and the finished sheet from every side, scythe and icon</span></figcaption></figure>
</ao-compare>

Version 1 curled her tail to her side in every clip, because that's how the model was posed.
Version 2 re-posed it straight behind her, except when she stands idle.

<ao-compare cols="2" aspect="16/10">
  <figure><video controls muted loop playsinline preload="metadata" src="/media/modding-megabonk/v1-run-preview.mp4"></video><figcaption><b>Run</b><span class="ao-meta">version 1 in Blender, tail curled to her side</span></figcaption></figure>
  <figure><video controls muted loop playsinline preload="metadata" src="/media/modding-megabonk/v1-jump-preview.mp4"></video><figcaption><b>Jump</b><span class="ao-meta">version 1 in Blender</span></figcaption></figure>
</ao-compare>

## Doing it yourself

As of 5 October 2026 you need BepInEx 6.0.738 and Shadowth117's fixed character loader, because
the original loader broke in the game's December 2025 update. You also need Unity 2023.2.22f1, the
game engine version Megabonk uses. Test with a known-good character like the community's Sonic mod first, so you know in 20
minutes whether the loader works. Every tool, step and trap is in
[the full making-of notes](/ledger/modding-megabonk/notes/).

## What it took

When I modded my characters into [the card game Inscryption](/ledger/characters-in-inscryption/),
I wrote that a game shipped as machine code, like Megabonk, would be a much bigger job. It was, but the extra work went into the art and
the safety, not the code.

- **Agents.** 14 in five parallel tracks for the first phase, each track checked by a second agent
  hunting for mistakes. 10 more built the model. 16 did version 2, the rigging tests and the
  drafts of both posts.
- **Money.** Nothing beyond my own laptop.

## What I'd try next

The game's code suggests a few more plugin-sized jobs, like handing her the game's own scythe,
rails on every map and new challenges. None of them has been tried yet.

<details><summary>Ten ideas from the game's code, untried</summary>

Most of these come from names in the game's code. Apart from the rail trick and the test script,
which Claude used for this post, none of them has been tried.

1. **Give her the game's own scythe.** The loader's data file can't point at a base-game weapon,
   but the game has functions to fetch a weapon and add one to your inventory, and it already has a
   scythe with its own attack. A small plugin could hand Jefrie the real one when a run starts.
2. **More movement for one character.** Tail Spring is one patch on the jump. Air jumps, the
   wall-climb window, ladders and rails all live in the same part of the code. A wall-run, a dash
   (the game has one) or a landing that damages enemies would be the same kind of mod.
3. **Rails everywhere.** One number decides how many rails a stage gets, and on this build it's 0.
   A plugin could raise it. Claude's test script already spawns the game's own rail and sets her
   feet on it, and the game starts the grind by itself. Raising the number on real maps hasn't been
   tried.
4. **A new challenge.** Challenges like Blind, Inverted Controls, Lava, No Movement, Speedrun,
   Smol Boi and eight more are small pieces of code. Changing one is a plugin. Adding a brand-new
   one should be possible, but nobody has tried it here yet.
5. **Rebalance from data.** The game keeps its lists of weapons, tomes, items, enemies, maps and
   encounters in one place and announces when they've loaded. A plugin listening for that could
   retune numbers without patching any logic.
6. **Your own swarms.** Stages run on a timeline of events, like adding an enemy type, a mini-boss
   or a swarm. A boss rush or an all-skeletons mode looks like a timeline edit.
7. **A soundtrack or hats.** The same lists hold music tracks and hats. Both are data, so a bundle
   of files plus a small plugin to add them might be all it takes.
8. **Item reworks.** Each of the more than 80 items has its own code, so one patch changes one
   item.
9. **The debug console.** The game ships one, with four commands Claude could find, GetSeed, Help,
   SetResetTime and SetSeedCrypt. Adding "spawn a rail" or "give weapon" would make every other
   idea here easier to test. I don't know yet how it opens.
10. **A script that plays the game.** Claude's test script drives Megabonk through its own menus,
    character select, map and movement, takes its own screenshots, blocks save writes and never
    lets a run reach game over. In one launch it took Sonic through every test, with 20.5 m of
    running, a 5.34 m jump, a 28 m fall and 10 kills in 83 seconds. If you mod with agents, that's
    what turns "I think it works" into a folder of evidence.

</details>
