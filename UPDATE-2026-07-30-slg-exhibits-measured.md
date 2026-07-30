# The two exhibits nobody measured (2026-07-30)

A third companion to
[UPDATE-2026-07-30-engine-claim-and-site-corrections.md](UPDATE-2026-07-30-engine-claim-and-site-corrections.md)
and [UPDATE-2026-07-30-slg-claims-measured.md](UPDATE-2026-07-30-slg-claims-measured.md).

Going back over both repositories file by file, two exhibits carry claims that neither of
those updates touched: `grip-vs-gse-functional-identity.md` and
`grip-lazygrip-webtool-exhibit.md`. Both are byte identical across the two repositories,
so each correction below lands twice.

Seven items, same rule as before. Every figure is measured against the release archives
the repositories bundle rather than against my working copy, and each item carries the
command that reproduces it.

1. [The addon refuses encrypted GSE content, and did so in the archive they hashed](#1-the-addon-refuses-encrypted-gse-content-and-did-so-in-the-archive-they-hashed)
2. [Five of the six detected formats decode through the shared routine](#2-five-of-the-six-detected-formats-decode-through-the-shared-routine)
3. [The step function table omits a mode both addons ship](#3-the-step-function-table-omits-a-mode-both-addons-ship)
4. [GSE's version key is given two different names nine lines apart](#4-gses-version-key-is-given-two-different-names-nine-lines-apart)
5. [The field said to be dropped from v1.0.4 did not exist when v1.0.4 shipped](#5-the-field-said-to-be-dropped-from-v104-did-not-exist-when-v104-shipped)
6. [Ten releases inside "every release" were never scanned](#6-ten-releases-inside-every-release-were-never-scanned)
7. [The refusal experiment cannot separate the author from the content](#7-the-refusal-experiment-cannot-separate-the-author-from-the-content)

Items 1 and 2 are the same code read two ways. Item 1 is what the code does. Item 2 is the
sentence in their exhibit that describes it wrongly.

## 1. The addon refuses encrypted GSE content, and did so in the archive they hashed

The filed complaint at `curseforge-complaint-final.md:25` states that "roughly 80% of my
sequences are distributed privately to supporters/subscribers and are not published
openly", and clause 3 of the licence quoted at `:45` covers "subscriber/paid content".
`:40` then says those sequences, "including private, supporter-only sequences never
licensed for distribution", "are reproduced" into GRIP-EMS.

`Import/Serialization.lua` declines to read encrypted legacy content. `S.DetectFormat`
returns `GSE3_ENCRYPTED` on the encrypted prefix, and `S.Decode` refuses on that value
before it attempts anything, at lines 88 to 102 in v2.3.16:

```lua
-- Encrypted legacy sequences (protected or subscriber-only content) cannot
-- be read. Refuse with a clear message before any decode attempt so nothing
-- is written and the user does not get a generic decode error.
if format == "GSE3_ENCRYPTED" then
```

The message the user gets names the reason: "This is an encrypted sequence and GRIP-EMS
can't import it. The source sequencer locks its protected and subscriber-only content so
other addons can't read it. Plain legacy sequences still import normally." The refusal is
counted in `db.importStats["GSE3_ENCRYPTED"]`, so a user can see how often it fired.

```bash
unzip -o evidence/GRIP-EMS-v2.3.5.zip -d v235
unzip -o evidence/GRIP-EMS-v2.3.16.zip -d v2316
sed -n '88,102p' v2316/GRIP-EMS/Import/Serialization.lua
grep -n 'GSE3_ENCRYPTED' v235/GRIP-EMS/Import/Serialization.lua
```

The guard is in v2.3.5, the archive they hashed, at the same lines, and in v2.3.16. It is
not a response to the complaint.

Against my own interest, and this is the part that decides how much the item is worth: the
guard only meets the complaint if the supporter-only sequences are in fact distributed
encrypted. If they go out as plain `!GSE3!` strings then the guard never sees them and
this item does not touch the claim at `:40`. I have no way to check how that content is
distributed, I am not asserting either way, and the rights holder is the one who knows.
What the code establishes is narrower: where the source sequencer locks content, this
addon does not attempt to open it, by design, and said so in a user-facing string before
any of this started.

## 2. Five of the six detected formats decode through the shared routine

`grip-vs-gse-functional-identity.md:18` lists the six values `DetectFormat` returns and
says GRIP "decodes them through **one** shared routine (strip prefix -> Base64 ->
decompress -> CBOR)". The same exhibit at line 7 says GSE's ChaCha20 codec is absent from
GRIP, which is correct.

Both cannot hold for `GSE3_ENCRYPTED`, and the code resolves it the way line 7 implies:
the format is detected and then refused, per item 1. Five formats reach the shared
routine. The sixth reaches the refusal at line 91 and returns.

```bash
sed -n '44,68p;78,102p' v2316/GRIP-EMS/Import/Serialization.lua
```

This is a one word correction to their sentence rather than a defect in their conclusion.
Their conclusion, that GRIP does not carry GSE's encryption code, is right, and I said so
in the earlier update.

## 3. The step function table omits a mode both addons ship

The data model table at `grip-vs-gse-functional-identity.md:26` reads
`| StepFunction (Sequential/Priority/Random) | stepFunction | yes -- same set |`. Line 7
of the same file says "GRIP's ReversePriority/Random modes diverge".

GRIP-EMS ships four, in `Engine/StepFunctions.lua`: `SF.Sequential` at 35, `SF.Random` at
130, `SF.Priority` at 227 and `SF.ReversePriority` at 233 in v2.3.16. `SF.ReversePriority`
is in v2.3.5 too.

```bash
grep -n '^SF\.[A-Za-z]* = {' v235/GRIP-EMS/Engine/StepFunctions.lua \
                             v2316/GRIP-EMS/Engine/StepFunctions.lua
```

GSE has the mode as well. The wiki page item 4 of the earlier update quotes is titled
"GSE3: Advanced Loop Step Functions - Priority and Reverse Priority", and it prints the
reverse variant next to the forward one.

So the table understates the set by one on both sides, and line 7 lists as a divergence a
mode that both addons implement. The two statements are wrong in opposite directions,
which is why neither is load bearing on its own. It matters because the table is the
exhibit's own inventory of the identity it is arguing for.

## 4. GSE's version key is given two different names nine lines apart

`grip-vs-gse-functional-identity.md:24` gives GSE's key as `Versions`. Line 33 of the same
file gives it as `MacroVersions`, in the sentence describing what `Import/LegacyImport.lua`
reads. `MacroVersions` is the one that appears in the code.

```bash
grep -n 'MacroVersions' v2316/GRIP-EMS/Import/LegacyImport.lua | head -3
sed -n '24p;33p' grip-vs-gse-functional-identity.md
```

Small, and I would not raise it alone. It sits in the field mapping table of the exhibit
whose thesis is field level identity, which is the one table where the field names should
be exact.

## 5. The field said to be dropped from v1.0.4 did not exist when v1.0.4 shipped

`README.md:31` in the Conversion repository describes the version scan as covering "all 64
GRIP releases (v1.0.4->v2.3.5): each reads GSE data, carries zero `PlatformID`, drops the
author ID."

`README.md:103` in the other repository dates the field: "PlatformID introduction
(2026-04-25 per the SLG package)". v1.0.4 was released 2026-03-21, which is their own date
and the one in my earlier update's timeline.

A field introduced on 2026-04-25 cannot have been dropped by a build published thirty five
days earlier. For the releases in that window there was nothing to carry and nothing to
drop. `PlatformID` is genuinely absent from all of them, which is the measurement, and
"drops the author ID" is the characterisation laid over it.

This is the same shape as item 5 of the earlier update. The underlying count is right and
the sentence built on it says more than the count supports.

## 6. Ten releases inside "every release" were never scanned

`data/grip_version_scan.csv` is 65 lines, a header and 64 rows, and `README.md:31` gives
its range as v1.0.4 to v2.3.5.

`CURSEFORGE-COMPLAINT-FIELDS.md:75` states the import path is "Present in every release,
from v1.0.4 (2026-03-21) through the current v2.3.16".

v2.3.6 through v2.3.15 is ten releases. They are outside the scan and were not checked
separately anywhere in either repository, which checks v2.3.16 on its own.

```bash
wc -l data/grip_version_scan.csv
cut -d, -f1 data/grip_version_scan.csv | tail -1
```

Stated plainly against my own interest: the claim is true of those ten. The import path is
in every release, `PlatformID` is absent from every release, and I am not contesting
either. The defect is that field text carrying an attestation says "every release" on the
strength of a scan that stops ten releases short, and the gap is not disclosed next to the
claim.

## 7. The refusal experiment cannot separate the author from the content

`grip-lazygrip-webtool-exhibit.md:80` concludes that the converter's refusal is "a
content-based server rule ... applied uniformly" and "not a per-user permission".

The experiment has two samples. The refused one is the rights holder's own collection,
where `:62` records the refusal naming `SLG-DK-Oh-!@#$` and `SLG-DK-GetOverHerE`. The
accepted one, at `:66`, is a third party's sequence. Author and content change together
between them, so the result is consistent with a content rule and equally consistent with
anything keyed on the author, and the design cannot tell the two apart.

A third sample separates them: either a third party's sequence carrying the same
structural feature that triggered the refusal, or the rights holder's collection with that
feature removed. Neither is in the evidence directory.

The exhibit's own next clause concedes the narrower version of this, that per-account
overrides "cannot be determined from the client and is unknown". The conclusion above it
is stated more firmly than that concession allows.

For completeness on the same exhibit: the file manifest at lines 107 and 108 still marks
both screenshots "(to add)", but both PNG files are present in both repositories. That is
a stale manifest and not missing evidence, and I am recording it here so nobody reads the
manifest and concludes the captures do not exist.

## What I am not claiming

These are measurements against two exhibits, not a legal document and not advice.

Neither exhibit is wrong in the round. The functional identity exhibit is right that the
two addons use the same container, that the field vocabularies map onto each other, that
`Import/LegacyImport.lua` reads GSE's tables directly, that the Sequential body advances
unconditionally, and that the only `UNIT_SPELLCAST_SUCCEEDED` consumer is the talent swap.
I verified each of those independently and said so in the engine update. The webtool
exhibit's core before and after holds: `PlatformID`, `HelpURL`, `Checksum` and `GSEVersion`
are present in the input and absent from the `!GRIP1!` output, and the author name and
notes survive. Its honest limits section is accurate, including the part recording that no
GRIP format copy of the rights holder's own sequence was produced.

Both exhibits also state, and I want this on the record because it is the fair reading,
that the source code was not copied. The five subsystem diff found none, and I am not
treating anything above as disturbing that finding.

The one item that touches the complaint's substance is item 1, and I have given it with
its limit attached rather than as an answer.

## Verification

- Both repositories, cloned 2026-07-30, and the release archives they bundle. The two
  exhibits are byte identical across the pair, confirmed by sha256 on each copy.
- `Import/Serialization.lua` and `Engine/StepFunctions.lua` as shipped in GRIP-EMS v2.3.5
  and v2.3.16, read from the bundled archives rather than from my working tree.
- `data/grip_version_scan.csv` as published, and the GRIP-EMS release tag list for the
  v2.3.6 to v2.3.15 count.
- The GSE wiki page named in item 4 of the companion update, for the Reverse Priority mode.
