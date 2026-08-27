# Update 2026-08-26: platform actions, and the two Companion builds this repository had not characterised

This covers everything since the last update on 2026-08-03. It has two halves that
do not depend on each other.

The first half is the platform record: three filings against GRIP-EMS, one removal,
one restoration, and a set of archived packages withdrawn at my request. Almost none
of that is my own measurement. It is drawn from the other party's published
repositories, from what the platforms themselves show, and from a public forum
thread. I say per item where each fact comes from and how confident it is.

The second half is measurement, and it is the part I would rather be judged on. I
hold two GSE Companion builds this repository has never characterised, **0.4.27** and
**0.5.3**. Both are measured here against the same markers used for every build since
0.4.12. The result runs in GSE's favour and is stated plainly.

There is also a date correction to the Finding 2 retraction. The correction makes the
retraction stronger, not weaker, which is the only reason I noticed it at all.

---

## 1. The two Companion builds, measured

### Build identity

Both were read the same way as every other build in this repository: extract the NSIS
installer, extract `app-64.7z` from it, take `resources/app.asar`, unpack it, and read
`out/main/index.js`. No decompilation, no instrumentation, no running of the app.

| | 0.4.27 | 0.5.3 |
|---|---|---|
| Installer bytes | 81,327,641 | 81,335,293 |
| Installer SHA-256 | `73e805253017628e1dee6865ecb5f2c85ba64bd426988b038b1bc3921df8011f` | `a00f4dc3d2eb12d1913dacadac78bc2a0169966359855a3d22c1a1a25237e3dd` |
| Installer signature | **unsigned** | **unsigned** |
| `app.asar` bytes | 6,211,562 | 6,255,817 |
| `app.asar` SHA-256 | `d3a1cf027fdba74aedb5f00abd525ad7c80f46fd2e1f47253e6a90e6f3b8f4f3` | `2b98b0041ca4787ffb9cb067a575dcc3f3673b185d09644cfd91985121373ddd` |
| `out/main/index.js` bytes | 138,339 | 146,566 |
| `out/main/index.js` SHA-256 | `6d3bbc72eafbb58938a5b912ca0a6a3851cdb0edb095b291cd0257d1a2da958e` | `6c53500dcae3975db8ba679a804d557cd4e7e2c2fc342e9b83c20268bf73376c` |
| `package.json` version | `0.4.27` | `0.5.3` |
| Acquisition (file CreationTime) | 2026-08-06 01:37 | 2026-08-24 16:15 |

The declared dependency set is identical in both and unchanged from 0.4.26:
`@qikdev/sdk`, `adm-zip`, `cbor-x`, `luaparse`, `ps-list`, `tweetnacl`. `tweetnacl` is
the ed25519 library, so its presence is consistent with the signed engine still being
shipped, which the marker counts below confirm directly.

The jump from 0.4.x to 0.5.x is a version-number change. I have not established that
it corresponds to any change in the subsystems this repository tracks, and the counts
below say it does not.

### Marker counts

Same markers, same method, as the 0.4.23, 0.4.24 and 0.4.26 characterisations. The
0.4.26 column is what this repository already published; the other two are measured
today.

| Marker | 0.4.26 (published) | 0.4.27 | 0.5.3 |
|---|---|---|---|
| `GRIP-EMS.lua` | 0 | **0** | **0** |
| `GRIP_EMS_CHAR` | 0 | **0** | **0** |
| `provenanceSource` | 0 | **0** | **0** |
| `gse-legacy` | 0 | **0** | **0** |
| `grip`, case-insensitive, any position | 0 | **0** | **0** |
| `syncRestrictedAccountFlag` | 0 | **0** | **0** |
| `detectGripEmsAcrossClients` | 0 | **0** | **0** |
| `purgeGripCharSequences` | 0 | **0** | **0** |
| `runAccountCleanup` | 0 | **0** | **0** |
| `integrityRef` | 0 | **0** | **0** |
| `restrictedAccount` | 0 | **0** | **0** |
| `.paths` | 0 | **0** | **0** |
| `capture-denied` | 0 | **0** | **0** |
| `capture-` | 0 | **0** | **0** |
| `4e4`, the 40,000-entry walk cap | 0 | **0** | **0** |
| `withFileTypes` | 1 | **1** | **1** |
| `userFile:` | 1 | **1** | **1** |
| `requestFiles` | 3 | **3** | **3** |
| `userFilePaths` | 4 | **4** | **4** |
| `excludeMods` | 4 | **4** | **4** |
| `includeErrorLogs` | 5 | **5** | **5** |
| `report:files-requested` | 1 | **1** | **1** |
| ed25519 key `b531cb8b...683a` | present | **1** | **1** |
| `sign.detached.verify` | 1 site | **1** | **1** |
| `targetPersona` | present | **2** | **2** |
| `write refused: not a GSE SavedVariables file` | present | **1** | **1** |
| `/^GSE.*\.lua$/i` | 2 | **2** | **2** |
| `/^!?Bug(Grabber\|Sack)\.lua$/i` | present | **1** | **1** |
| `--force-run` | present | **1** | **1** |
| `autoApplyUpdates` | present | **2** | **2** |
| `/diagnostic/upload` | present | **1** | **1** |

### What that means, stated narrowly

**Nothing competitor-facing has returned.** Every identifier that named my addon, and
every routine that detected it or flagged an account for it, reads zero in both
builds. A case-insensitive search for `grip` anywhere in `index.js` returns zero hits
in both. The arbitrary-file capture that v0.4.26 removed is still absent: `.paths`,
`capture-denied` and the walk cap are all zero.

**Nothing this repository flagged as retained has since been removed.** The ed25519
signed engine is present with the same embedded key. The v0.4.24 basename guard is
present. The BugGrabber/BugSack gather is present. The unsigned auto-updater is
present, `autoApplyUpdates` is still there, and the installer for both builds is still
unsigned. That last item has been the largest capability in the application since
v0.4.14 by my own reckoning, and it is unchanged.

So the position stated in the 2026-07-17 v0.4.26 update holds through 0.5.3. Both
halves of the competitor-facing subsystem are still absent from the shipped client.

**A correction to my own method, recorded because it nearly became a false finding.**
My first pass counted the literal strings `BugGrabber` and `BugSack` and got zero in
both builds. I was one step from writing that the error-log gather had been removed.
It has not been. The gather is expressed as the alternation
`/^!?Bug(Grabber|Sack)\.lua$/i`, so neither literal name occurs in the file even when
the capability is fully present. A scan finds only the shape it encodes. The corrected
row above counts the regex, and it is present in both builds.

**A second reproduction caveat.** The minifier reassigns single-letter identifiers
between builds. In the v0.4.24 quote in the README, `Io` is the `/^GSE.*\.lua$/i`
regex and `Ao` is the guarded write function. In 0.4.27 and 0.5.3 those names have
swapped: `const Ao = /^GSE.*\.lua$/i, Io = /^!?Bug(Grabber|Sack)\.lua$/i`. Match on the
regex literal and the error string, never on the variable name.

### What I did not do

I read `out/main/index.js` statically and searched the whole unpacked archive for the
error-log markers. I did **not** run either build, did not capture its traffic, and did
not diff them line by line against 0.4.26. I no longer hold the 0.4.26 installer, so a
byte diff against it is not available to me. The marker table is a comparison against
the published 0.4.26 counts, not against the 0.4.26 bytes.

---

## 2. The GSE addon is five builds ahead of this repository

This repository characterises the in-game GSE addon up to **3.3.25** (2026-07-17). The
current release is **3.3.30**, published 2026-08-24.

| Build | Published |
|---|---|
| 3.3.26 | 2026-08-10 |
| 3.3.27 | 2026-08-13 |
| 3.3.28 | 2026-08-21 |
| 3.3.29 | 2026-08-23 |
| 3.3.30 | 2026-08-24 |

**I have not characterised any of them, and I am not characterising them here in
either direction.** No competitor scan, no codec check, no diff. Anyone citing this
repository on the current state of the GSE addon is citing a build that is five
releases old. That is a gap in my coverage and it is stated rather than papered over.

One thing I did check, because the Finding 2 retraction turns on it, is the build
split. It is unchanged. `GSE_QoL` is still listed under `ignore:` in the repository's
`.pkgmeta`, and it is still absent from the public zip. The public 3.3.30 build ships
the same five folders as the public 3.3.25 build. **This does not disturb the
retraction and it is not offered as reviving it.** The retraction says the *code* is
public and free, and that remains true and is the point that matters. The zip split is
the thing the retraction already described as accurate: the Patreon role-locks the
prebuilt bundle, not the source.

---

## 3. Correction to the Finding 2 retraction: the date is wrong, and the true date is earlier

The retraction says, twice, that `GSE_QoL` has been public source in GSE's own
repository **since 2024-07-07**. The original wording, preserved:

> `GSE_QoL` is **public source in GSE's own GitHub repository** and has been since
> **2024-07-07** (100+ commits; the restructure commit `7732fe5` was made *to that
> public repo*, which reports `"private": false`).

**I can find no evidence for 2024-07-07 and the commit record gives two earlier
dates.** The earliest commit touching the `GSE_QoL/` path is `12d4674436c7`, dated
**2024-07-01**, subject "#1433 QoL Improvements". That commit renamed the files into
place: `GSE_QoL/QoL.lua` was previously `GSE2/QoL.lua`. The earliest commit touching
`GSE2/QoL.lua` is `7b73166239`, dated **2024-06-14**, subject "#1443 Prework for Spell
Autocomplete".

So the defensible statement is: public source since **2024-06-14** under the path
`GSE2/`, and at its current `GSE_QoL/` path since **2024-07-01**.

I am recording this rather than quietly editing the number, for the same reason every
other correction in this repository is recorded in place. Note which way it runs. Both
true dates are *earlier* than the date I published, so the code was public for longer
than my own retraction credited. The retraction was already the strongest evidence of
good faith here and this makes it slightly stronger. A correction that helps the party
I am in dispute with is exactly the kind that tends not to get made, which is why it
gets its own section.

The retraction text itself is unchanged. Nothing has been softened, moved or removed.

---

## 4. The platform record

Three separate filings have now been made against GRIP-EMS across three platforms.
Only one has resulted in any action.

**How to read this section.** I did not see any of these filings. What follows is
drawn from the other party's own published repositories, which record their side of
the correspondence in detail, plus what the platforms themselves currently show and
one public forum thread. Where their record and the platform disagree, I say so. I do
not treat their record as neutral and neither should you, but it is contemporaneous,
public, and specific, and on the checkable points it has matched what the platforms
show.

### 2026-08-02, CurseForge

A copyright claim was filed on CurseForge's dedicated Copyright Claims form. By the
filer's own record it is explicitly not a §512 notice: no perjury statement and no
sworn declaration. An earlier support ticket, #386456, was closed on 2026-08-05 on
routing rather than on the merits.

### 2026-08-20, CurseForge acted

**GRIP-EMS project 1489414 was removed from CurseForge.** This is the one platform
action that is established. Three independent things agree: the filer's repositories
both carry a commit dated 2026-08-20 21:43 UTC titled "RESOLVED 2026-08-20: claim
actioned, project 1489414 removed from CurseForge"; they published a capture of the
project's 404 page and an empty files-API response from that date; and the project was
observably absent for several days afterwards.

CurseForge's reply as they quote it says the review is complete and action taken as
requested, and notes that the owner may still submit a counter claim, in which case
the matter returns to review.

I was given no notice naming a claim, a claimant or a cause. I record that as my own
account, not as an established fact about what CurseForge did or did not send.

### 2026-08-20, Wago Addons

A DMCA §512(c) notice was filed with Wago Addons on the same day, sent to
`dmca@wago.io`. This is the only one of the three characterised by its sender as a
formal DMCA notice.

Their own record is careful about what it asserts, and it is worth quoting because it
narrows the claim considerably:

> I do not claim that the GRIP-EMS download hosted by Wago contains copies of my
> sequences. It does not.

**As of 2026-08-26 the GRIP-EMS listing on Wago Addons is live**, showing v2.4.8 dated
2026-08-25. I have received no notice from Wago. Whether that means the notice was
declined, is still in process, or was never delivered is not something I can see, and
I make no claim about it.

### 2026-08-26, WoWInterface

A complaint was filed with WoWInterface at 16:02 on 2026-08-26, sent to
`admins@mmoui.com`. Their record states it was filed as an IP and policy complaint and
deliberately **not** as a §512 notice.

**As of this date the GRIP-EMS listing on WoWInterface is live**, showing v2.4.8
updated 2026-08-25, with no visible moderation notice.

### 2026-08-25, the project was restored

GRIP-EMS returned to CurseForge under the same project ID, 1489414. I posted
"Restored on CF, all is well in the world once again" on the WoW Lazy Macros forum at
13:27 UTC that day, and v2.4.8 was uploaded to CurseForge at 17:58 UTC.

**The mechanism is not established.** No public notice on the project page or in the
files API explains how or why the listing returned. The other party's own record says
the same thing and declines to assert either way, which is the correct position and I
adopt it.

One correction to a date I have seen stated: **the restoration was 2026-08-25, not
2026-08-26.** The forum post and the file upload timestamp both fix it to the 25th.

### 2026-08-26, reported again

After the project reappeared, the same claim was submitted to CurseForge again, at
14:48 UTC. As of this date the project remains live with v2.4.8.

### 2026-08-26, the eight archived packages were withdrawn

The two repositories had been archiving full installable GRIP-EMS packages as
evidence: v1.0.4, v1.9.1, v2.3.5, v2.3.16, v2.3.17, v2.3.18, v2.4.6 and v2.4.7.
GRIP-EMS is All Rights Reserved and I asked, by email, that those eight packages be
taken down. **They were removed within hours**, in commit `8379721d` at 19:29 UTC,
titled "Withdraw eight full GRIP-EMS packages; publish the cited source files
instead", and 117 individual source files cited in their analysis were published in
their place.

Their own note on it, quoted in full because it is accurate and because I asked for
this and got it:

> He did not ask for any analysis, exhibit, correspondence, finding or quotation to be
> removed, and none has been touched. He asked only that the eight full installable
> packages come down, explicitly excluding v2.4.8.

That is exactly what I asked for and exactly what happened. I am recording it because
a record that only notes the other party's adverse actions is not a record.

### 2026-08-26, the licence argument

Later the same day their §1202 and inducement memo was modified to cite section 6 of
the licence shipped in GRIP-EMS v2.4.8. The memo itself is not new; it dates from
2026-07-12. What was added on 2026-08-26 is the section 6 argument.

I am not answering it here. This repository documents shipped software and does not
argue legal theories, mine or theirs. Two things about the document are worth noting
as fact rather than as argument, because both cut against a reader assuming the worst
of it: it carries a prominent header stating it is not legal advice and that it is
deliberately two-sided, and it argues against one of its own available theories on the
ground that a macro sequencer plainly has substantial lawful uses.

---

## 5. GRIP-EMS v2.4.8

For completeness, since it is the build now listed on all three platforms and the one
the other party re-archived. Released 2026-08-25. It adds an author-confirmation
prompt on every route by which a sequence can leave the client, removes the previous
automatic authorship claim on save, and ships a rewritten licence.

This is my own addon and I am not offering my description of it as evidence of
anything. It is here so the timeline is complete.

---

## 6. What I could not verify

Recorded so that nothing above reads as more settled than it is.

- **The contents of any of the three filings.** I have not seen them. Everything in
  section 4 about what was filed comes from the filer's own published record.
- **Whether Wago Addons or WoWInterface received, read, or acted on anything.** I know
  only that both listings are live.
- **Why CurseForge restored the project.** Not established by anyone, including the
  other party.
- **Whether a GSE Companion build newer than 0.5.3 exists.** `gse.tools/releases`
  requires a login to see the download list, so I cannot enumerate current releases
  from outside. 0.5.3 is simply the newest build I hold.
- **Whether a 0.4.25 or a 0.4.24 installer was ever published.** Unchanged from the
  earlier updates: I never acquired either, and I do not characterise them.
- **The 0.4.26 installer hash.** Published in `hashes.txt` on 2026-07-17 and correct
  as of that date, but the file is no longer on my machine, so it is the one Companion
  hash in this repository I could not re-verify today. Every other Companion installer
  hash was re-verified and matched. See section 7.
- **Anything about intent, motive or state of mind**, on any side. Out of scope here
  and always.

---

## 7. Hash re-verification, 2026-08-26

Every Companion installer hash published in `hashes.txt` was recomputed against the
file on disk today.

| Version | Result |
|---|---|
| 0.4.12 | match |
| 0.4.13 | match |
| 0.4.14 | match |
| 0.4.15 | match |
| 0.4.16 | match |
| 0.4.20 | match |
| 0.4.21 | match |
| 0.4.22 | match |
| 0.4.23 | match |
| 0.4.24 | **not re-checkable, file no longer held** |
| 0.4.26 | **not re-checkable, file no longer held** |

Nine of eleven match. Zero mismatches.

> **Correction 2026-08-27.** The two lines above previously read "Nine of ten match" and
> listed 0.4.26 alone as not re-checkable. `hashes.txt` names eleven Companion
> installers, not ten, and two of them are no longer held. The count came from a script
> that found each published hash and then looked for a filename on the same line; every
> entry pairs them on one line except 0.4.24, which puts the filename on the line above,
> so that entry was skipped without any error being raised. Nine matched and none
> mismatched both before and after, so no finding moves. The denominator and the
> not-re-checkable list were wrong and are corrected here rather than silently.
>
> The failure is the one this same update warns about two sections earlier, where
> counting the literal `BugGrabber` returned zero because the shipped regex writes
> `Bug(Grabber|Sack)`. A scan finds only the shape it encodes. I wrote that caveat on
> 2026-08-26 and then did not apply it to my own hash parser on the same day.
>
> **Acquisition dates in this update were also corrected on 2026-08-27.** The 0.4.27
> row previously read "Acquisition (file mtime) | 2026-08-20 or earlier". Every
> installer in that folder carries a LastWriteTime of 20/08/2026 18:16 to 18:17, which
> is when the folder was copied during a machine rebuild rather than when anything was
> downloaded. CreationTime survived and reads 06/08/2026 01:37:56 for 0.4.27. The old
> statement was true but rested on the wrong field and discarded available precision.

Two installers I hold are not named in `hashes.txt` and are recorded here for
completeness: 0.4.19 (`743b816e9ad2beecda463a3264fc7623643e628f2ed467f4aa994e155fb72d08`,
81,325,163 bytes), and the pair named 0.4.17 and 0.4.18, which share the single hash
`978cc99a5f101072542070b0e031fb92247f9b047511acfbb6d9890373e156ef` at 81,324,864 bytes
each. That pair independently reproduces the finding already recorded in
[UPDATE-2026-07-17-v0.4.17-v0.4.19.md](UPDATE-2026-07-17-v0.4.17-v0.4.19.md): the
installer distributed as 0.4.17 is byte-identical to the one distributed as 0.4.18.

### One integrity defect in this repository, now fixed

`hashes.txt` publishes the SHA-256 of `evidence/companion_0.4.22_main_beautified.js`
as `2e549b9e...` at 178,366 bytes. That is its length with LF line endings. The
repository had no `.gitattributes`, so on Windows the file checked out with CRLF at
183,764 bytes and its hash did not match the published value. Anyone verifying this
repository on Windows would have hit a mismatch on the one file whose hash they could
actually check, with no way to tell line endings from altered evidence.

A `.gitattributes` pinning `* text=auto eol=lf` is now committed and the working tree
is normalised. Every checkout is byte-identical on every platform and the published
hash reproduces. This was a defect in how the evidence was published, not in the
evidence, and it is recorded here rather than fixed silently.

---

## How to reproduce section 1

1. Obtain `GSE Companion Setup 0.4.27.exe` or `GSE Companion Setup 0.5.3.exe` and
   confirm the installer SHA-256 against the table above.
2. `7z x "GSE Companion Setup 0.5.3.exe" -oout` to unpack the NSIS installer.
3. `7z x "out/$PLUGINSDIR/app-64.7z" -oapp` to unpack the application payload.
4. `npx asar extract app/resources/app.asar asar_out`.
5. Confirm `asar_out/package.json` declares the expected `"version"`.
6. Read `asar_out/out/main/index.js` and count the markers in the table above.
   Search for the regex literals, not the variable names: the minifier reassigns
   single-letter identifiers between builds. In particular search
   `Bug(Grabber|Sack)` and not `BugGrabber`, which does not occur even when the
   capability is present.
