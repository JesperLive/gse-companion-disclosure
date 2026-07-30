# The rest of the claims, measured (2026-07-30)

A companion to [UPDATE-2026-07-30-engine-claim-and-site-corrections.md](UPDATE-2026-07-30-engine-claim-and-site-corrections.md).
That file recorded the one claim of theirs that was correct and the fix I shipped for it.
This one records what happened when I measured the rest.

Ten items. Every figure here was measured against the artifacts the two repositories ship,
not against my own working copy. Both bundled release archives hash to the values in their
own `SHA256SUMS.txt`, so the artifacts are genuine and I measured the same bytes they did.
Each item carries the command that reproduces it.

## Where this was supposed to go, and why it is here instead

I wrote these up as ten separate issues and two pull requests, one set per repository, so
each item could be checked on its own and corrected in place. I could not file any of them.

From my account, GitHub returns HTTP 403 for both forking and issue creation on both
repositories:

```
POST /repos/LarryThiessen/GSE-to-GRIP-EMS-Conversion-Copyright-Violations/issues
{"message":"Blocked","status":"403"}

POST /repos/LarryThiessen/GSE-Addon-vs-GRIP-EMS-Addon-Copyright-Violations/issues
{"message":"Blocked","status":"403"}
```

Both repositories report `allow_forking: true`, neither is archived or disabled, both are
public, and public read and clone both work normally, which is how I measured everything
below. A control fork of an unrelated public repository from the same account in the same
minute succeeded, and the API rate limit was not near its ceiling. The block is specific to
these repositories.

I am recording that rather than working around it. A pull request or an issue from a second
account would be circumventing a platform control, and I am not doing that. So the
corrections are published here, where the timestamps are checkable, and the delivery routes
that remain open are the CurseForge claim thread, where the numeric errors below actually
matter, and a direct message.

## 1. GSE was MIT licensed for the whole period in which GRIP-EMS was designed and built

`CURSEFORGE-COMPLAINT-FIELDS.md:37` presents the licence as
`Copyright (c) 2026 Timothy Minahan. All Rights Reserved.` with no date attached, and
`THE-STORY.md` describes the conduct as reverse engineering "the free, All-Rights-Reserved
addon". The LICENSE file in `TimothyLuke/GSE-Advanced-Macro-Compiler` has exactly two
commits in its whole history.

```bash
gh api "repos/TimothyLuke/GSE-Advanced-Macro-Compiler/commits?path=LICENSE" \
  --jq '.[] | [.sha[0:8], .commit.author.date] | @tsv'
gh api repos/TimothyLuke/GSE-Advanced-Macro-Compiler/contents/LICENSE?ref=9c15b61c \
  -H "Accept: application/vnd.github.raw" | head -3
```

`9c15b61c`, 2021-07-06, is the MIT License, "Copyright (c) 2016 Timothy Minahan", granting
permission "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies". `5f293d0a`, 2026-04-14, replaces it with the All Rights Reserved text the filing
quotes.

| Date | Event |
|---|---|
| 2021-07-06 | GSE LICENSE committed as MIT |
| 2026-02-06 | GSE wiki Priority page last edited, see item 4 |
| 2026-03-18 | GRIP-EMS first commit, "Initial project skeleton" |
| 2026-03-21 | GRIP-EMS v1.0.4, the first release in their own version scan |
| 2026-04-14 | GSE relicensed to All Rights Reserved |
| 2026-04-25 | GSE introduces `PlatformID`, per their section 3 |
| 2026-04-30 | the Discord thread their capture covers |

The design period, the build period and the first twenty four days of public releases all
sat inside the MIT window. I am stating dates, not arguing law. The sworn field text quotes
a licence that took effect on 2026-04-14 without noting that the prior licence was MIT,
which a reader needs in order to weigh the claim.

Against my own interest: the "ARR Licence" message in their capture is dated 2026-04-30,
after the relicense, so it was accurate when it was written. The licence history does not
touch that.

## 2. Finding 5 overstates the export, in the build they hashed

`grip-cmi-evidence-exhibit.md:129` says the export "strips only locale fields".

`PrepareExportVersions`, the function quoted, is at line 22 of `Import/GRIPExport.lua` and
handles one version's steps and actions. It never touches sequence metadata. That is
assembled further down the same file, in `GE.Export`, and the share payload carries sixteen
provenance and identity fields: `originalAuthor`, `originalAuthorIdentity`,
`originalAuthorRealm`, `originalCreatedAt`, `originalSignature`, `originalSignatureV2`,
`signatureAlgorithm`, `lastModifier`, `lastModifierIdentity`, `lastModifierRealm`,
`lastModifiedAt`, `modifierChain`, `forkedFrom`, `forkedFromChain`, `provenanceSource` and
`privacyMode`.

```bash
unzip -o evidence/GRIP-EMS-v2.3.5.zip -d v235
sed -n '22p;464p;544,559p' v235/GRIP-EMS/Import/GRIPExport.lua
```

In v2.3.5, the archive they hash, `GE.Export` is at 464 and that block is 544 to 559. In
v2.3.16 it is 594 to 609 with `GE.Export` at 514. Before the payload is built,
`Identity:BuildExportPayload` scrubs the local user's own identity for privacy and leaves
foreign-author entries alone, which is the opposite direction from stripping somebody
else's attribution.

The rest of that sentence is correct and I am not contesting it. There is no license check
and nothing gates re-sharing on origin: `grep -ric 'licens'` returns zero across
`Import/*.lua` and `Engine/Transmission.lua`. So the heading at line 127, "with no
provenance or redistribution guard", is half right. The redistribution half stands. The
provenance half is the one that line 196 carries into the 1202 argument.

## 3. The legacy import block is quoted from the second line of the branch

`grip-vs-gse-forensic-comparison.md:261-269` quotes five lines for v2.3.5 and `:309-319`
quotes seven for v2.3.16, under the heading "GRIP blanks the origin identity on GSE-legacy
import". Three things sit just outside the quote.

```bash
unzip -o evidence/GRIP-EMS-v2.3.16.zip -d v2316
sed -n '876,934p' v2316/GRIP-EMS/Import/LegacyImport.lua
```

Line 920 is `else`. The `elseif` branch above it, 878 to 919, carries every provenance
field an incoming payload actually has plus a modifier chain entry; the quoted block is the
other branch, for content arriving with no provenance at all, which is what a GSE export
is. The first line of their own code block is
`seqData.originalAuthor = seqData.author or "Unknown (GSE legacy)"`, which keeps the author.
Their quote ends at 927; line 928 is `seqData.provenanceSource = "gse-legacy"` and line 933
appends a modifier chain entry reading `"imported-from-gse"`.

The empty strings inside the quote go to fields holding an EMS identity hash, an EMS realm
and an EMS signature. A GSE sequence never carried any of the three, so there is nothing to
preserve into them.

## 4. The Priority expansion is not GSE's design

`grip-vs-gse-forensic-comparison.md:48-54` calls the triangular expansion "GSE's signature
algorithm" and "GSE's distinctive design", "for over a decade", and line 177 calls it "the
single most probative point in this exhibit".

Their reading of my code is right. `SF:ExpandPriority` does emit `[1, 1, 2, 1, 2, 3]` for
three steps. The attribution is what does not hold, on three independent grounds.

**It is in GSE's own repository, in another addon's form.** `spec/prioritycheck.lua` on
master carries the walk at lines 35 to 41.

```bash
gh api repos/TimothyLuke/GSE-Advanced-Macro-Compiler/contents/spec/prioritycheck.lua?ref=master \
  -H "Accept: application/vnd.github.raw" | sed -n '35,41p'
gh api "repos/TimothyLuke/GSE-Advanced-Macro-Compiler/commits?path=spec/prioritycheck.lua" \
  --jq '.[] | [.sha[0:8], .commit.author.date] | @tsv'
```

```lua
limit = limit or 1
if step == limit then
  limit = limit % #macros + 1
  step = 1
else
  step = step % #macros + 1
end
```

That file entered the repository on 2017-06-14, commit `a2c17c99`, "Priority checks and
update for #302". Note what it counts: `#macros`. GSE's own engine at
`GSE/API/Storage.lua:2155-2171`, the code their exhibit quotes as GSE's implementation,
counts `#actionList`. `macros` is GnomeSequencer's table name.

**It is semlar's, published before GSE's repository existed.** GnomeSequencer, WoWInterface
file 23234, author semlar, listing created 2014-10-29, 280,195 downloads. The listing
reproduces `ExampleSequences.lua` inline and the reproduced file carries the same five
statements with the same three variable names, under the comment "This example increments
the step in the following order: 1 12 123 1234 etc. until it reaches the end and starts
over".

Stated against my own interest: the version on that page today is 7.3.0.1, updated
2017-08-31, so the inline listing is the 2017 file rather than provably the October 2014
upload. What the page establishes without qualification is authorship by semlar, a listing
dating to 2014, and that the body is his rather than GSE's. Their own sworn field text names
the work "GSE - Gnome Sequencer Enhanced", which is the same lineage read from the other end.

**GSE publishes the expansion in implementable detail.** The wiki page "GSE3: Advanced Loop
Step Functions - Priority and Reverse Priority", public, last edited 2026-02-06, states the
weighting in words, "in the case of a 7 line macro the first line is attempted 7 times more
than the last line with line 2 6 times more and line 6 2 times more", then prints the
literal expansion `1 / 12 / 123 / 1234 / 12345 / 123456 / 1234567`, then the reverse
variant, then a seven pass worked example with spell names.

That page was last edited forty one days before my first commit. The "no convergent
evolution, no independent invention" argument at line 24 needs the behaviour to be
obtainable only by reading GSE's source. It is on GSE's own wiki, in words and in a printed
table, and it was not GSE's to begin with.

## 5. Ten years, not 12 to 13

`TimothyLuke/GSE-Advanced-Macro-Compiler` was created 2016-06-24. Ten years to today.

```bash
gh repo view TimothyLuke/GSE-Advanced-Macro-Compiler --json createdAt
```

The figure appears five times in one repository and twice in the other. Six of the seven are
prose. The seventh is `CURSEFORGE-COMPLAINT-FIELDS.md:37`, field text prepared for a
CurseForge filing, and line 95 of the same file is the attestation reading "All information
I have provided is true." Their own sentence at line 37 dates the addon to 2015 or 2016 and
calls it 12 to 13 years of prior art in the same breath, so the two halves disagree with
each other before anyone checks the repository date.

GnomeSequencer is older than the GSE repository, but that cuts the other way. It makes GSE
the downstream work.

## 6. Six counting errors

Taken one at a time none of these matters. Taken together they sit in the passages that
establish the package's measurement rigour, including the paragraph stating that its line
numbers "were re-derived from those exact artifacts".

| Where | Claim | Measured |
|---|---|---|
| forensic `:170` and `:295` | "272 entries" then "244 entries" | 272 and 288 total entries; 44 directory entries each; 228 and 244 files |
| forensic `:96` | "GRIP's entire ~9,000-file tree" | 228 files in v2.3.5, 244 in v2.3.16 |
| forensic `:306` | `StepFunctions.lua` "is 505 lines in both" | 504 in both |
| forensic `:309` | `LegacyImport.lua` "grew from ~900 to 2,396 lines" | 2052 in v2.3.5, 2395 in v2.3.16. No shipped release has it near 900 |
| forensic `:96` and `:309` | the blanking block "previously cited at 857-872" | 870 to 876 in v2.3.5. Line 261 of the same file cites 870 to 874 for the same block |

```bash
for z in evidence/GRIP-EMS-v2.3.5.zip evidence/GRIP-EMS-v2.3.16.zip; do
  echo "$z"; unzip -Z1 "$z" | wc -l; unzip -Z1 "$z" | grep -c '/$'
done
find v235 -type f | wc -l; find v2316 -type f | wc -l
wc -l v235/GRIP-EMS/Engine/StepFunctions.lua v2316/GRIP-EMS/Engine/StepFunctions.lua
wc -l v235/GRIP-EMS/Import/LegacyImport.lua v2316/GRIP-EMS/Import/LegacyImport.lua
```

The entries row is the one worth a second look. 272 counts every entry including
directories and 244 counts files only, so side by side under one word the package reads as
though it shrank by 28 entries between the two releases. It grew by 16. Their hashes, byte
sizes and Lua counts are all correct, so this is a counting method that changed between two
rows rather than a problem with the artifacts.

## 7. Two of five rows in the scienter table are a third party's words

This concerns `grip-1202-cmi-analysis.md` in the Conversion repository only. The other
repository carries an earlier version of that memo with no such table.

The table at line 56 is headed "Evidence (developers' own words)" and line 64 says the
innocent-conversion reading "is contradicted by the developers' own words". Two of the five
rows quote CzarTheMad: the row at line 59, "Perhaps it would be easier for me to strip the
gse tools stuff from gse", message `1499389371697336340`; and the row at line 61, "I'm
worried you'll stop the conversation in addon. Or TL will do so much obfuscating that it
makes it time prohibited", message `1499389764921724940`.

Their own capture attributes both correctly and repeatedly, with permalinks, at
`captures.md:147`, `:149`, `:165` and `:297`. So this is not a dispute about who said what.
It is that the memo then presents them as the developer's words. Their own record also says
who CzarTheMad is: `captures.md:140` gives "CzarTheMad (MOD badge) and Sataana (Developer
role)", and `THE-STORY.md:156` lists the roles as Sataana tagged Developer, MFDOOM and
itmeteemo Operations, and "bearded_dad_bod/CzarTheMad/Pershizzle" as BETA Testers.

`captures.md` is byte identical in both repositories, so both citations resolve wherever you
check them. On the second row the memo also drops the leading word: their capture has "Yes
I'm worried you'll stop the conversation in addon", which is a reply to a question.

I am addressing the attribution and nothing else in that table.

## 8. The predicate act, from their own three documents

The 1202 and inducement theories both need a user copy that infringes. Three passages in
their own repositories bear on whether one exists, quoted rather than characterised.

`SLG-Sequences-LICENSE.txt` clause 1 grants "a personal, non-exclusive, non-transferable,
revocable license to download and use this software and its sequence/macro content ... for
your own personal, non-commercial use in World of Warcraft, including modifying it for your
own personal use."

`grip-cmi-evidence-exhibit.md:201`, and `curseforge-complaint-final.md:69` in the same
words: "A user converting their own installed copy for personal use is not the target."

`README.md:71` in the Conversion repository: "An investigation into whether the community
site lazygrip.net hosts / redistributes copies of these sequences returned no matches ...
That hosting angle is deliberately excluded; do not include it."

So the act a user performs is inside their grant and their own documents say it is not the
target, and the act that would carry the theory was searched for and not found.

Two related figures. `curseforge-complaint-final.md:25` states "roughly 80% of my sequences
are distributed privately to supporters/subscribers and are not published openly", and
`grip-cmi-evidence-exhibit.md:274` maps licence clause 3 onto "the ~80% privately-distributed
sequences". `THE-STORY.md:7` and `captures.md:13` both state "ScaryLarryGames publishes all
his current content free on CurseForge", and `README.md:63` states "The 14 works claimed are
all of the rights holder's CurseForge projects ... each published All Rights Reserved."

## 9. The memo drops context that their own capture supplies

Their capture file is careful. It is the memo built on top of it that is not, and the gap
between the two is measurable without leaving their repository.

`captures.md:150`, message `1499389964071469108`, CzarTheMad at 12:40:24, two messages
after the "strip the gse tools stuff" line: "Want to still be able to use GSE w/o the
companion app. And to be able to import gse strings into ems for the forseeable future."
Removing the GSE.Tools dependency from his own copy of the GSE addon so it runs without the
companion is a different act from removing owner identifiers from sequences. The memo row
at line 59 titles that same quote "Intended to remove the identifying data".

`captures.md:295`, on a different "strip" reference: "This particular 'strip' reference is
about UI simplification, not CMI, included for completeness/accuracy; do not conflate with
the CMI-stripping conduct." That is the right instinct, written by them, and it is not
applied to the row above.

`captures.md:190` prints the licence message in full. The two fragments quoted at line 204
as proof of "knowing engagement with, and conscious legal hedging around, GSE's license
terms" are "In theory (I cant advise it since the GitHub is under ARR Licence)" and "(Again,
legally I cant advice it)". Both sit inside a sentence declining to advise, and the subject
of the sentence is reading GSE's public GitHub commits, not sequence identifiers.

The source file flags its own reliability 46 times: 33 instances of "date TBD", 9 of
"truncated", 2 of "need full message", 1 "could not be loaded", and 1 statement that the
capture is "necessarily incomplete".

```bash
for p in 'date TBD' 'need full message' 'truncated' 'could not be loaded' \
         'necessarily incomplete'; do
  printf '%-26s %s\n' "$p" "$(grep -oi "$p" evidence/discord/captures.md | wc -l)"
done
```

Their transcriptions are close to exact and their attributions in the capture are right. It
is that the memo presents five fragments as a chain while the file they came from records
the goal, the distinction and the caveats sitting around them.

## 10. The site owner line

`README.md:47` in the Addon-vs repository lists me as "(site owner)" of LazyGrip.net. Line
37 calls the ownership "circumstantially the same operator" and line 50 makes that the
"single most important nexus fact".

I do not own the `lazygrip` GitHub organisation and I am not a member of it. I am a
repository collaborator whose permission the GitHub API returns as `write`, given by the
maintainer so I can push branches and open and triage pull requests on the addon-facing
parts of the site. I hold neither admin nor maintain, and `viewerCanAdminister` is false for
me there. I do not own or operate the domain, the hosting, the database or the moderation.

Pull requests 25 and 26 on `lazygrip/lazygrip-gg` were opened by me and merged by me, and I
said so in the companion update before anyone asked.

Their own `OPERATOR-IDENTITY-RESOLVED.md` section 2 already reaches most of this. It credits
the Workshop tools to Beard3d_Gamer and Slowdog, on the site's own in-panel credit and on
their own descriptions of their roles, and it records the domain registrant as redacted.
`README.md:47` predates that document and contradicts it.

## What I am not claiming

This is a record of measurements, not a legal document and not advice. Where their citations
are right I have said so, here and in the companion update: `PlatformID`, `HelpURL` and
`gse.tools` are zero; the `blockedPlayers` gate is real and their description of it is
accurate; their Lua counts, hashes and byte sizes are correct; `StepFunctions.lua:248-262`
is byte identical across the two releases and in fact the whole file is; their section 7a
migrate field set holds across all four archives; and the engine claim was theirs and
correct.

Two defects of mine are visible in their evidence and I am not disputing either: the
converter refusal on one of their sequences, and a spell ID that changes across a web
conversion round trip. Both are logged and being fixed.

## Verification

- Both SLG repositories, cloned 2026-07-30, and the four release archives they bundle.
- `TimothyLuke/GSE-Advanced-Macro-Compiler` LICENSE and `spec/prioritycheck.lua` histories
  via the GitHub REST API, and the GSE wiki page named in item 4.
- GnomeSequencer, WoWInterface file 23234.
- GRIP-EMS v2.3.5 and v2.3.16 as shipped, plus v1.0.4 and v1.9.1 for the version-scan checks.
