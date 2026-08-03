# Update, 2026-08-03: corrections received on the SLG repositories, and what the current GRIP-EMS release contains

Both repositories (LarryThiessen/GSE-to-GRIP-EMS-Conversion-Copyright-Violations,
LarryThiessen/GSE-Addon-vs-GRIP-EMS-Addon-Copyright-Violations) received mirrored
updates on 2026-08-01 and 2026-08-03. This note records what changed, which items
from the 2026-07-30 measurements are now resolved, and one measured fact about
version currency. Every claim below carries the command or commit that reproduces
it. Measurements were taken 2026-08-03 against the Conversion repository at commit
cec75a6a and the Addon-vs repository at dd1a95ec.

## 1. The 80 percent figure is withdrawn, openly

Item 8 of UPDATE-2026-07-30-slg-claims-measured.md set the filed complaint's
"roughly 80% of my sequences are distributed privately" against the same
package's own statements that the content is published free. That figure is now
gone. The complaint's section 3 replaces it with a permission-model statement
(every sequence flagged Private on GSE.Tools) and carries an explicit correction
note: "That figure described distribution reach and was misleading as to
permissions... Corrected 2026-08-01." The exhibit's section 1 was reworded the
same way on 2026-08-03, and the new rights-holder statement records the
correction in its own caveats rather than amending quietly.

That resolves item 8. The juxtaposition was accurate against the package as it
stood on 2026-07-30, and the package corrected it with a dated note two days
later. Corrections made that way are how a record is supposed to move.

Reproduce: git log --follow -p curseforge-complaint-final.md in the Conversion
repository; the rewrite lands 2026-08-01 and the section 3 note is verbatim in
the current file at lines 30 to 34.

## 2. A new rights-holder statement, described here without argument

evidence/RIGHTS-HOLDER-STATEMENT-2026-08-01.md (committed 2026-08-03) is a
testimony document: 100 percent of the author's sequences flagged Private on
GSE.Tools, Export and Install controls withheld from other users, a fork-request
step routed to the author, never requested or approved for any GRIP-EMS-related
party. Its own basis table marks the three platform-mechanics points "Needs
confirmation", with GSE.Tools documentation requested from the platform operator
on 2026-08-01, and its caveat 2 states "The complaint does not collapse without
it." Recorded here as it describes itself. This repository takes no position on
platform mechanics only the platform operator can confirm.

## 3. The package now pins v2.3.16 as current. The current release is v2.3.17.

On 2026-08-03 the exhibits were re-pinned: "GRIP-EMS v2.3.16 (2026-07-29, the
current release and the operative version for this complaint)", and the
comparison exhibit closes "Nothing here has been remediated in the eleven
versions since v2.3.5." Both sentences were accurate against v2.3.16.

GRIP-EMS v2.3.17 has been the current release since 2026-08-02 (release tag
dated 2026-08-02 00:20 UTC+1). Measured in the v2.3.17 sources:

1. A sequence whose author marked it do-not-share is refused on every sharing
   path: string export, collection export, player-to-player send, the browse
   list, and direct requests. Engine/Transmission.lua gates all five through one
   helper (IsNoRedistribute, 8 occurrences). The package's "no license check, no
   origin/redistribution gate" finding, correct against v2.3.16, does not
   describe this release: the author's own mark is a redistribution gate, and it
   is honoured.
2. Content converted through the LazyGrip web tool now lands labeled. The
   converter has stamped its output since 2026-07-30, and v2.3.17 also reads
   the converter's gseVersion field (Import/LegacyImport.lua line 975):
   a converted sequence arriving without explicit provenance is stamped
   "gse-legacy" and shows the origin badge. The exhibit's "zero references to
   GRIP's own platformId, helpUrl and gseVersion field names" is therefore
   accurate for v2.3.16 and not for the current release.
3. Imported variable bodies run in a restricted environment
   (Data/VariableStore.lua, sandbox built at line 411, applied at line 667).

Reproduce: download GRIP-EMS v2.3.17 from CurseForge project 1489414, then
grep -n IsNoRedistribute Engine/Transmission.lua; grep -n "elseif
sequence.gseVersion" Import/LegacyImport.lua; grep -n "BuildVariableSandbox"
Data/VariableStore.lua; read CHANGELOG.md, entries v2.3.17 and v2.3.16. Stated
as dated product facts. This note asserts nothing about why either side's
documents changed when they did.

## 4. Corrections received on the Discord record, and what remains open

The 2026-08-03 pass through evidence/discord/captures.md corrected four things:
the 2026-04-30 16:24:57 message carries two image attachments, not a video (the
"download the video" action item is closed as a misreading); the CzarTheMad
Reddit share is dated 2026-07-09, not mid-January (a six month correction);
every "Screenshot saved" note now discloses the screenshot was reviewed on
screen and never written to disk; and a curated table lists the 16 captures
that do exist. Those are corrections received, and they are recorded as such.

Still open in grip-vs-gse-forensic-comparison.md at commit cec75a6a, as
measured on 2026-07-30 and re-checked today: "GRIP's entire ~9,000-file tree"
at line 96 (the v2.3.5 archive holds 228 files, v2.3.16 holds 244 entries);
"the file is 505 lines in both" at line 314 (504 in both); "grew from ~900 to
2,396 lines" at line 317 (v1.9.1 is 1436 lines and v2.3.5 is 2052; no shipped
release is near 900); line 96 still cites the blanking at 857-872 while line
317 renumbers the same block to 921-927; and "~12 to 13 years" of prior art at
lines 21 and 162 (the GSE repository was created 2016-06-24, ten years).

## 5. The claim channel, for the paper trail

From correspondence/2026-07-cf-claim-thread.md in the Conversion repository:
ticket #386456 was misrouted to general support ("Copyright claims are handled
by a different team", 2026-08-01); the claim was filed the same day on the
dedicated CurseForge Copyright Claims form and acknowledged by the CurseForge
Team, which issued no reference number; their own escalation note now runs to
approximately 2026-08-14. The submission records that contacting the developer
first was "not realistic (the developer has blocked the rights holder)". For
the GitHub side, the measured direction on 2026-07-30 was the reverse, and it
is already on this record in UPDATE-2026-07-30-slg-claims-measured.md: this
account is blocked by theirs on both repositories (issue creation returns 403
"Blocked", forking returns 403, a control fork succeeded in the same minute).
Whether any block exists on another platform is not measured here.

## Scope

Items 1, 4 and 5 are measurements of the two repositories' own files and
history. Item 2 describes a testimony document in that repository's own words.
Item 3 is a measurement of the shipped GRIP-EMS v2.3.17 sources against two
sentences in the exhibits. Nothing in this note argues motive, and nothing in
it alters the standing findings of the earlier updates, which remain pinned to
the dates they carry.
