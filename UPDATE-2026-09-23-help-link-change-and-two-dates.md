# Update 2026-09-23: the claimant's change to GSE's Help Link field, and two dates in his timeline

This update records two things. On 2026-09-23 GSE merged a change written by Larry A.
Thiessen (ScaryLarryGames), the claimant in the copyright dispute recorded in this
repository, and it rewrites a metadata field in stored GSE sequences. And while re-checking
the one part of his claim that survived CurseForge's closure, I measured two dates his
timeline depends on. GSE's own history supports neither of them.

The first half is about GSE's code, and that code has not reached a tagged release yet. The
second half is about his published timeline. One of its dates also appears in an update of
mine, so I correct that here as well. Where a sentence is argument and not measurement, it
says so.

---

## 1. The change: GSE pull request #2060

[Pull request #2060](https://github.com/TimothyLuke/GSE-Advanced-Macro-Compiler/pull/2060),
titled "Refuse wowlazymacros.com as a Help Link, and heal stored sequences (#2059)", was opened from
the `LarryThiessen` account on 2026-09-08 and merged by `TimothyLuke` on 2026-09-23 at 05:05
UTC, as merge commit `9993178b`. It closes
[issue #2059](https://github.com/TimothyLuke/GSE-Advanced-Macro-Compiler/issues/2059), opened
from the same account the same day. Its one commit, `99fca7fd`, is authored as
ScaryLarryGames, and the pull request's description credits him with the requirement and
with testing it in game. Three files change, with 73 lines added and 2 removed.

What it does, read from the merged source:

- `GSE/API/Storage.lua:176-177` define a blocked host, `wowlazymacros.com`, and a
  replacement, `https://discord.gg/gseunited`.
- `GSE.HelplinkAllowed` at `:178` rejects any Help Link that contains the blocked host. The
  match is a plain substring on the lower-cased link, so any scheme, subdomain or path is
  caught.
- `GSE.SanitizeHelplink` at `:184` swaps a rejected `MetaData.Helplink` for the replacement.

It runs in three places. On load, `migrateSequenceVersions` calls it at `:210`, and that
function runs for every stored sequence as its class loads (`:239` and `:299`). When a
sequence is stored, `GSE.ReplaceSequence` calls it at `:691`. In the editor,
`GSE_GUI/Editor_Metadata.lua:652-653` puts the replacement in when the Help Link box is
built around a rejected link, and `:659-663` puts it back when one is typed. The issue asks
for no chat message, and none is printed.

When the load-time rewrite fires, the lines straight after it (`Storage.lua:211-213`) clear
`MetaData.Checksum`. The pull request's description says so. That step is not new code: GSE
already cleared the checksum after any load-time repair, and this change makes a Help Link
one more thing to repair. For a sequence that is not stored in GSE's protected form, the
rewritten copy is then written back to `GSESequences` (`:252-253`, and `:306-308` for the
single-sequence loader), so it reaches the saved file.

What clearing the checksum costs depends on what it held. On a sequence published through
GSE.Tools it holds a `v2:` value, which is an Ed25519 signature checked against the
platform's public key (`GSE/API/Checksum.lua`, the v2 section from line 53). The client only
ever computes the `v1` hash itself (`:7` and `:191`), and the only Ed25519 code it ships is
a verifier, `GSE_Ed25519Verify` in `GSE/API/ed25519verify.lua`. So once a `v2` value is
cleared, the client has no way to put it back.

The claimant's own evidence shows where this lands. His exhibit
`evidence/lazygrip-webtool/02_thirdparty_BEFORE_gse.json` holds three sequences by another
author, DrussRet: `DRUSS_AOE_v8`, `DRUSS_NOCD` and `DRUSS_ST_v8`. Each one has a Help Link on
wowlazymacros.com (lines 83, 143 and 241) and a `v2:` checksum. In a GSE build that contains
this change, each of the three would load with its Help Link replaced by the GSE United
invite and its checksum cleared. His own four sequences, in `01_original_decoded.json`,
already use the GSE United link and would be left alone.

No tag contains `9993178b`. It sits 11 commits after the most recent tag, `3.3.34`. Until a
release carries it, it has reached no player.

## 2. Why it is recorded here

This section is argument, not measurement.

The part of the claim against GRIP-EMS that survived CurseForge's closure is about fields
GRIP-EMS does not carry across from GSE's `MetaData` table. The claimant's release-delta
analysis (`evidence/RELEASE-DELTA-ANALYSIS-2026-08-26.md`, section 3b) and his section 1202
memo (`grip-1202-cmi-analysis.md`, lines 99 to 105) make the same point. GRIP-EMS reads that
table, copies `GSEVersion` and `Checksum` out of it and passes over `PlatformID`. The memo
calls that "a selection within a parsed structure" and treats it as evidence of the
knowledge section 1202(b) requires. The same memo pleads `Checksum` as the second of the
three items it says are removed, and describes it as a platform signature that attests a
sequence is the author's published version (lines 37 to 40).

PR #2060 reads the same table, finds `Helplink` by its value and replaces what the
sequence's author put there. When it does that on load, it also clears `Checksum`. It
applies to every stored sequence whoever wrote it, and nobody is asked, neither the player
nor the author. By the standard his package applies to GRIP-EMS, that is a selection, and
his own issue sets out the requirement for it. For comparison, `Helplink` is a field
GRIP-EMS does carry across, as the 2026-08-27 update records.

Two things cut the other way, and I would sooner state them than have them pointed out.

- His package names `HelpURL` as the protected link, and `Helplink` is a different field.
  His LazyGrip provenance evidence quotes a description of `Helplink` as a Discord invite
  link (`evidence/LAZYGRIP-OPERATOR-AND-CONVERTER-PROVENANCE.md`, line 220), and nothing in
  the package calls `Helplink` protected information. So what I am comparing is the conduct
  in each case. The fields differ.
- GSE belongs to its maintainers. What GSE's own editor accepts in its own field is their
  call, and a maintainer changing that is ordinary.

I make no claim that the change is unlawful, that it breaches any licence, or that it harms
anyone. I am not qualified to say, and it is not the question here. The question is whether
one standard is being applied in both directions. If reading `MetaData` and choosing what to
keep counts as knowledge when GRIP-EMS does it, it is hard to see why it counts for less in
a change that rewrites an author's field by value.

## 3. Two dates in the claimant's timeline

Both of these come from re-checking the surviving claim against GSE's own repository.

### 3a. The two fields were chosen before PlatformID existed

The block that copies `GSEVersion` and `Checksum` into `importMeta` carries the comment
"Store legacy format metadata for future use (informational only)". It was added in GRIP-EMS
commit `25cc004a` on 2026-03-25 and shipped in v1.0.5 that day. GSE had added `Checksum`
eight days earlier, in `835c2a13` on 2026-03-17. `PlatformID` first appears anywhere in
GSE's history on 2026-04-02, in `df75d00a`, eight days after the block. That comes from a
case-insensitive pickaxe search over every commit on every ref of GSE's repository.

The GRIP-EMS repository is private, so the 2026-03-25 date is my own record and you cannot
check it the way you can check GSE's dates. Part of it can be checked in the claimant's own
files. He publishes the v1.9.1 source, and the same block is at
`evidence/cited-source/v1.9.1/Import/LegacyImport.lua:365-372`. His own version scan dates
v1.9.1 to 2026-04-12 and marks it as released before GSE had the field. So on his own dates,
the block he describes as a selection was already shipping before the field it is said to
pass over.

### 3b. PlatformID reached GSE on 4 April, not 25 April

His exhibit dates the field to 2026-04-25 (`grip-cmi-evidence-exhibit.md`, lines 88 and 90),
and his version scan and memo build on that date. GSE's history puts it three weeks earlier.
Commit `df75d00a`, under GSE issue #1893, created `GSE_Utils/CompanionQueue.lua`, which
writes `MetaData.PlatformID` onto a sequence when the Companion sends a `setPlatformID`
action. In tag `3.3.09`, dated 2026-04-04, those writes are at lines 259 and 264, and
`GSE_Utils.toc` loads the file at line 35. The 2026-04-25 commit, `77e4c7c2` in tag
`3.3.14`, is a later change under the same issue. It added the `GSEPlatformIDs`,
`GSEVariablePlatformIDs` and `GSEMacroPlatformIDs` saved variables.

Two parts of his package rest on the later date.

- His version scan (`data/grip_version_scan.csv`) marks 16 GRIP-EMS releases, v1.7.1 on
  2026-04-06 to v1.9.10 on 2026-04-23, as shipped while GSE had no `PlatformID`. GSE had it
  for all 16.
- His memo's timeline (lines 122 to 152) names v2.0.0, on 2026-05-02, as the first release
  to face the field, two days after the Discord conversation of 2026-04-30, and argues
  intent from that gap. By GSE's own history the first was v1.7.1, 24 days before the
  conversation.

There is one limit on this. In `3.3.09` the field was only written onto sequences the
Companion synced, so a player who never used the Companion had none. That bears on how many
sequences carried the field. It does not change when GSE had it.

I carried the later date too. My 2026-07-30 measurements list 2026-04-25 as the date GSE
introduced `PlatformID`, attributed to his section 3
([UPDATE-2026-07-30-slg-claims-measured.md](UPDATE-2026-07-30-slg-claims-measured.md), line
82). I recorded his figure there without measuring it, and this corrects it. One point in my
exhibits update used the same date: that the field did not exist when v1.0.4 shipped on
2026-03-21. That still holds on either date.

### 3c. What these dates do not change

GRIP-EMS has not read `PlatformID` in any release, including every release since the claim
was filed. His memo argues the knowledge point from that persistence after notice as well as
from the timeline, and the persistence is a fact. The concession in
[UPDATE-2026-08-27-curseforge-closes-the-claim.md](UPDATE-2026-08-27-curseforge-closes-the-claim.md)
stands. The two dates remove the timing his memo draws its inference from. They do not show
what I intended, and I am not offering them as that.

To reproduce the GSE half, in a clone of `TimothyLuke/GSE-Advanced-Macro-Compiler`:

```
git log --reverse --regexp-ignore-case -S "platformid" --all --format="%h %ci %s"
git tag --contains df75d00a --sort=v:refname
git show 3.3.09:GSE_Utils/CompanionQueue.lua | grep -n "MetaData.PlatformID"
git show 3.3.09:GSE_Utils/GSE_Utils.toc | grep -n CompanionQueue
git log --reverse --all -S "Checksum" --format="%h %ci %s" | head -1
git tag --contains 77e4c7c2 --sort=v:refname
git show 99fca7fd -- GSE/API/Storage.lua GSE_GUI/Editor_Metadata.lua
git tag --contains 9993178b
```

The last command prints nothing while the change is unreleased.

## 4. What I could not verify

- When, or whether, PR #2060 reaches a GSE release. No tag contains it as I write this.
- How many sequences in circulation carry a Help Link on wowlazymacros.com. His exhibit has
  three. I have no wider count.
- Why the change was made. Issue #2059 describes the behaviour it asks for and gives no
  reason. Motive is outside this repository's scope, his included.
- Whether GSE.Tools does anything comparable on its server, or re-issues a `v2` checksum when
  a cleared sequence is synced again. That code is not public, so I cannot read it.
- When `3.3.09` reached players. I measured the tag date, not a platform upload date.
- The 2026-03-25 commit date in section 3a, for anyone but me. It comes from a private
  repository.

## 5. Nothing in this changes the findings above

The Companion findings stand where
[UPDATE-2026-08-26-platform-actions-and-current-builds.md](UPDATE-2026-08-26-platform-actions-and-current-builds.md)
left them. Nothing here is a new measurement of the Companion, and none of it should be read
as one.
