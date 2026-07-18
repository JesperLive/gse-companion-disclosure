# How the binaries were acquired and verified — 2026-07-18

**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)

This repository quotes code from specific GSE Companion and GSE addon builds. This file is the chain of
custody behind that: every GSE binary I hold, when it arrived, what version it declares from inside its
own archive, and whether its hash holds. It adds no new finding about the software. It records how the
files the other documents rely on were obtained and checked.

Two of the three columns here you can check yourself; one you cannot. The SHA-256 of any build is
reproducible from a copy you obtain — [`hashes.txt`](hashes.txt) already publishes the hashes for the
builds this repo cites, and they are recomputed here. The declared version is read from inside the
archive and you can reproduce that too. The acquisition date is my own machine's file-creation metadata;
you cannot check it, and I mark below why I trust it.

## Method

- **Version is read from inside the archive, never from the filename.** For the Companion that is
  `resources/app.asar` -> `package.json` -> `"version"`; for the addon it is `## Version:` in
  `GSE/GSE.toc`. This matters because a filename can lie: the installer named `Setup 0.4.17.exe` is
  byte-identical to `Setup 0.4.18.exe` and declares `0.4.18` inside, so there is no 0.4.17 build on this
  disk — one installer, downloaded twice 38 seconds apart, the second copy misnamed.
- **Every Companion version was read from an `app.asar` whose SHA-256 was first checked against its
  published hash** where one exists (11 of 11 matched), so the version is read from the exact bytes the
  hash names.
- **SHA-256 recomputed for every file.** Byte-identical copies are collapsed so a re-download is not
  counted as a separate build.
- **The acquisition date is the NTFS creation time**, corroborated as described at the end.

## What is on disk

37 GSE binary files: 15 `GSE Companion Setup *.exe` and 22 `GSE-*.zip`. Three are byte-identical
re-downloads (the misnamed "0.4.17" copy of 0.4.18; a second copy of 0.4.20; a second copy of
3.3.23-7). That leaves **34 distinct binaries: 13 Companion builds and 21 addon builds.**

Two builds are absent and I characterise neither, in either direction: **0.4.17** (never acquired; the
file so named is 0.4.18) and **0.4.25** (never acquired; whether it released is unknown).

## Companion installers (13 distinct builds, in acquisition order)

| Acquired | Version (from inside) | SHA-256 (prefix) | Size | In hashes.txt? |
|---|---|---|---|---|
| 2026-06-11 | 0.4.12 | `706742b44f5ea905` | 81,299,552 | yes, matches |
| 2026-06-17 | 0.4.13 | `d580dc7c7c39fb74` | 81,299,751 | yes, matches |
| 2026-06-20 | 0.4.14 | `24b64bc72d9c5609` | 81,296,884 | yes, matches |
| 2026-06-20 | 0.4.15 | `d516415c9b1ff83c` | 81,322,606 | yes, matches |
| 2026-06-20 | 0.4.16 | `264013e8d6508a2c` | 81,322,563 | yes, matches |
| 2026-06-22 | 0.4.18 | `978cc99a5f101072` | 81,324,864 | no (held; not cited) |
| 2026-06-28 | 0.4.19 | `743b816e9ad2beec` | 81,325,163 | no (held; not cited) |
| 2026-06-28 | 0.4.20 | `805d34d8ff6e3a54` | 81,326,173 | yes, matches |
| 2026-06-29 | 0.4.21 | `341fb6212bb950e5` | 81,326,335 | yes, matches |
| 2026-07-01 | 0.4.22 | `61015247508dc209` | 81,326,397 | yes, matches |
| 2026-07-15 | 0.4.23 | `394b68fd9be35a22` | 81,326,323 | yes, matches (unsigned) |
| 2026-07-17 | 0.4.24 | `d912618652c9cfdb` | 81,326,455 | yes, matches |
| 2026-07-17 | 0.4.26 | `c720ec821818fa2b` | 81,327,286 | yes, matches (unsigned) |

The two builds absent from `hashes.txt` (0.4.18, 0.4.19) are covered in
[UPDATE-2026-07-17-v0.4.17-v0.4.19.md](UPDATE-2026-07-17-v0.4.17-v0.4.19.md): nothing competitor-facing
moves in either, and the arbitrary-file capture first appears at 0.4.20 exactly where this repo already
said it did.

## GSE addon builds (21 distinct binaries, in acquisition order)

Channel is patron when the archive contains the `GSE_QoL` module. "Files" is the non-directory member
count.

| Acquired | Version (from `GSE.toc`) | Channel | Files | SHA-256 (prefix) | In hashes.txt? |
|---|---|---|---|---|---|
| 2026-05-09 | 3.3.15-4 | patron | 183 | `86f0877b476a3cfe` | no (pre-dispute) |
| 2026-06-02 | 3.3.19-30 | patron | 161 | `edd004d58a4a3519` | no (pre-dispute) |
| 2026-06-04 | 3.3.19-37 | patron | 164 | `8227dbf17b86ad2c` | no (pre-dispute) |
| 2026-06-07 | 3.3.19-40 | patron | 164 | `dc8ff3f83cdcace4` | no (pre-dispute) |
| 2026-06-11 | 3.3.20-9 | free | 161 | `789753305d33dc21` | yes, matches |
| 2026-06-11 | 3.3.20-9 | patron | 164 | `7ea11bd7dbe6bb64` | yes, matches |
| 2026-06-11 | 3.3.20-10 | patron | 164 | `06ee86da96d9549d` | no |
| 2026-06-13 | 3.3.21 | patron | 166 | `5d7578f379e10493` | no |
| 2026-06-16 | 3.3.22 | patron | 167 | `8e9e37da3446f06d` | no |
| 2026-06-16 | 3.3.22 | free | 163 | `24a12424632f1a6e` | no |
| 2026-06-17 | 3.3.22-1 | patron | 166 | `53e76917435e08b2` | no |
| 2026-06-20 | 3.3.22-10 | patron | 166 | `e8d7c1d48d149ede` | no |
| 2026-06-20 | 3.3.22-12 | patron | 166 | `9fd13599fa659cae` | partial (3 internal Lua published) |
| 2026-06-22 | 3.3.23 | patron | 167 | `02ba039cd0effe34` | no |
| 2026-06-22 | 3.3.23-1 | patron | 167 | `5418b2440da32b55` | no |
| 2026-07-01 | 3.3.23-7 | patron | 168 | `c0868ba90b8158fb` | no |
| 2026-07-15 | 3.3.24-1 | patron | 168 | `c51da4087697c59a` | described, no hash row |
| 2026-07-17 | 3.3.24-2 | patron | 168 | `575196444d1fa7ea` | yes, matches |
| 2026-07-17 | 3.3.24-2 | free | 165 | `435128b3251b41f0` | yes, matches |
| 2026-07-17 | 3.3.25 | free | 165 | `ea15d65ba23f91ea` | yes, matches |
| 2026-07-17 | 3.3.25 | patron | 169 | `a62bc47e28b3ae14` | yes, matches |

Most of these are historical acquisitions no repo claim cites. I collect GSE patron builds and have done
since before this dispute — the earliest here is 2026-05-09, a month before the first message to
TimothyLuke. That is context, not evidence, and I include it rather than trim the list to only the
builds that suit the argument. The builds the repo actually relies on are the ones marked "yes" above,
and their hashes are in `hashes.txt`.

## Why I trust the acquisition dates

The NTFS creation time is the download time only if the file was not copied into place, since a copy
resets it. The control is `hashes.txt`, which states an "acquired" date for 14 of these builds, written
build-by-build as each one arrived over June and July. Every one of those 14 matches the creation time
measured from the disk. Fourteen of fourteen agree and none diverge, so the creation time is the genuine
download time, not a copy artifact.

## Full SHA-256

The complete list of all 37 files, with the byte-identical re-downloads sharing a hash, is reproducible
from the files with `certutil -hashfile "<file>" SHA256` on Windows or `sha256sum "<file>"` elsewhere.
The prefixes above disambiguate every distinct build; the builds this repository cites carry their full
hashes in [`hashes.txt`](hashes.txt).

## What this does not cover

The acquisition date is when I downloaded a build, not when GSE released it — no release date is claimed,
and the 0.4.25 gap means only that I never acquired it. The 16 held builds without a published hash are
measured here but are not cited by any repo claim; if one becomes relevant, its hash can be lifted into
`hashes.txt`. The `GSE_Companion` bridge addon ships no zip — it is installed by the desktop app from a
payload inside the `.exe`, and `hashes.txt` documents that payload separately.
