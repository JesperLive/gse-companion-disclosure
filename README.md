# Undisclosed competitor-addon detection, server-gated data deletion, and sequence lock-out in GSE (GnomeSequencer-Enhanced) and the GSE Companion app — a record of what shipped, and what GSE has since removed

> ## ⚠ Read this first — correction notice (2026-07-17)
>
> **Finding 2 of this repository (the "PATRON" build / pay-gate argument) is substantially retracted.** I claimed GSE withheld add-on code behind a Patreon role lock. That was false: `GSE_QoL` is public source in GSE's own GitHub repository, free to anyone, and nothing checks entitlement. **Blizzard policy point 2 is satisfied and my point-2 argument is withdrawn in full.** My point-1 reading is narrower than it was, but point 1 is a separate test and I am not withdrawing it on point 2's evidence — I made that mistake once already, on 2026-07-17, and it is corrected below. Full detail in the retraction block further down and in [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md).
>
> **Finding 1 (the Companion) is unaffected** and stands on its own evidence. Note also that, as of Companion **v0.4.26** (2026-07-17), the arbitrary-file capture that Finding 1 describes has been **removed** by GSE — see the v0.4.26 entry below. What remains is the unsigned auto-updater.
>
> I would rather this repository be right than be damning. Corrections are recorded in place, dated, with the original wording quoted.

> **Independently re-verified 2026-06-12.** Every SHA-256 below was recomputed against the files on disk and matched; every function name and constant quoted in this document was confirmed present in the shipped v0.4.12 `app.asar` (build hash `209aded…b0f`; this README documents v0.4.12, and the dated updates below track every build I hold since, through the current v0.4.26 — except v0.4.17 and v0.4.25, which I never acquired and do not characterise here in either direction). The extracted code region is included in this repo at [`evidence/app_asar_grip_region.js`](evidence/app_asar_grip_region.js) so you can read the real file rather than trust the quotes.
>
> **Re-verified 2026-06-16:** on that date, GSE Companion v0.4.12 was the current release on gse.tools/releases, and the GSE addon's CurseForge file was 3.3.22 (uploaded 2026-06-16). All four SHA-256 hashes below still match the files on disk. (The Companion has since moved on to v0.4.22 — see the updates below; the GSE CurseForge stable is still 3.3.22 as of 2026-06-21.)
>
> **Re-checked 2026-06-17 against the next release:** GSE shipped Companion v0.4.13 and addon 3.3.22-1. Both were diffed statically, without installing. The access-policy detection, account-flagging, and `purgeGripCharSequences` deletion code is byte-identical in 0.4.13 — the only code change in the entire app is one unrelated line in the bridge-queue pruning (`pruneBridgeData`), plus the version string. The addon update was an interface-version bump ("#1914 TOC Updates") with no GRIP-EMS-related change. The 0.4.13 hashes are listed below.
>
> **Updated 2026-06-20 (v0.4.14):** GSE shipped Companion v0.4.14. The detection, account-flagging, and deletion code is unchanged in behaviour, but the four identifiers that name GRIP-EMS (`GRIP-EMS.lua`, `GRIP_EMS_CHAR`, `provenanceSource`, `gse-legacy`) are now base64-encoded and decoded at runtime, and the descriptive function names are minified away. A plain-text search of v0.4.14 for the names in the reproduction steps below returns nothing; the behaviour was not removed, only hidden. Full write-up: [UPDATE-2026-06-20-v0.4.14-obfuscation.md](UPDATE-2026-06-20-v0.4.14-obfuscation.md). The v0.4.14 hashes are in `hashes.txt`.
>
> **Updated 2026-06-21 (v0.4.15 + v0.4.16):** Two more builds shipped. In v0.4.15 the four GRIP-EMS identifiers were removed from the binary entirely (not just encoded), the detection target moved to a server-supplied field, and the single-purpose deletion routine was replaced with a general, ed25519-signed, server-pushed engine that can delete from or rewrite any addon's SavedVariables while WoW is closed (the dependency `tweetnacl` was added to verify those directives). v0.4.16, built twelve minutes later, renamed the two remaining server-facing fields (`detectPattern` to `integrityRef`, `directive` to `task`) and deleted the explanatory comments; the engine is byte-identical. A live instrumented run on 2026-06-21 found the subsystem dormant (server `enforce:false`, no directive sent). Full write-up: [UPDATE-2026-06-21-v0.4.15-v0.4.16.md](UPDATE-2026-06-21-v0.4.15-v0.4.16.md).
>
> **Updated 2026-06-21 (in-game addon, separate finding):** A change in the GSE addon itself (build 3.3.22-12), not the Companion. The current addon replaces the global `GSE` namespace with a locked proxy that no longer exposes the sequence library to other addons (GSE's own comment: "to deny in-memory scraping by third-party addons"), and ships a new ChaCha20-encrypted sequence format (`!GSE3!+`) that only the GSE addon can decrypt, using a key built into the addon. Neither change names any competitor. The encrypted format is provisioned but not yet written on disk (the addon decrypts it but never encrypts it; the encoder is server-side or not yet enabled). Full write-up: [UPDATE-2026-06-21-addon-sequence-lockout.md](UPDATE-2026-06-21-addon-sequence-lockout.md).
>
> **Updated 2026-07-09 (v0.4.20 to v0.4.22):** Three more Companion builds shipped. The detection, account-flag, and ed25519-signed engine are unchanged from v0.4.15/v0.4.16 (same embedded key). v0.4.20 generalized the unsigned diagnostic upload: on a server push (`companion:request`) it now reads arbitrary files under your `Interface\AddOns` and `WTF` folders (any file, 4 MB cap, path-scoped, `..` rejected) and POSTs their content to `api.gse.tools/diagnostic/upload`, so the collection reaches any addon's files, not only GSE's. v0.4.22 adds your BugGrabber and BugSack error-log SavedVariables to every diagnostic upload. The signed engine can delete from or rewrite any addon's SavedVariables (`.lua` under `WTF`), and it is not gated by the `enforce` flag; that flag only retired the old fixed purge. I ran v0.4.22 under a 30-minute decrypted TLS capture (WoW closed, GRIP-EMS present, two manual syncs): it did only GSE content sync, no `companion:request` directive arrived, `enforce` read false, and no file changed. So the capabilities are in the shipped code, and I did not observe them being exercised in that window. The in-game addon is now 3.3.23-7, and its `!GSE3!+` encoder is still decode-only. Full write-up: [UPDATE-2026-07-09-v0.4.20-v0.4.22.md](UPDATE-2026-07-09-v0.4.20-v0.4.22.md). The 0.4.20 to 0.4.22 hashes are in `hashes.txt`.
>
> **Updated 2026-07-15 (v0.4.23, and addon 3.3.24):** v0.4.23 **removed the client-side detection and account-flagging** (confirmed by a normalized diff, not inferred). The access-policy fetch no longer returns `integrityRef`; the `syncRestrictedAccountFlag` routine that read your WoW folders and set `restrictedAccount` on your account is deleted; the 10-minute check now only reads `enforce`; and `policy:state` returns `restricted:false` hard-coded, with GSE's own shipped comment that "the Companion performs no client-side presence scan. Any account restriction is decided server-side." What did NOT change: the ed25519-signed engine that can delete or rewrite any addon's SavedVariables, the unsigned server-triggered arbitrary-file capture and its `/diagnostic/upload`, the BugGrabber/BugSack error-log gather, and the unsigned auto-updater are all still present. So the behaviour did not stop; the targeting decision moved from the auditable client to GSE's server (which cannot be inspected), while the arm that acts on a flagged account stayed. Live on 2026-07-15: `enforce:false`; of 3,747 member records exactly one currently carries `restrictedAccount:true` (an aggregate count, not me, identity not looked at). Addon 3.3.24-1 stays inert (no competitor strings; encoder still writes plain `!GSE3!`; `!GSE3!+` decode-only). Full write-up: [UPDATE-2026-07-15-v0.4.23.md](UPDATE-2026-07-15-v0.4.23.md).
>
> **Updated 2026-07-17 (v0.4.24, and addon 3.3.24-2) — GSE narrowed the write path, and credit where it is due.** v0.4.24 adds a second guard to the signed engine's atomic write: the target's basename must match `/^GSE.*\.lua$/i`, or the write throws. `GRIP-EMS.lua` does not match, so **the signed engine can no longer write to or delete my addon's SavedVariables.** The guard is real and load-bearing, not decoration: the guarded function has exactly one call site (the plan interpreter's `write` op), `write` is the only operation in the interpreter that touches disk, and a case-sensitive enumeration of every filesystem-mutating call in the app shows it is the only one that accepts a server-supplied path. `purgeGripCharSequences` and `runAccountCleanup` are gone. What v0.4.24 did **not** change: the unsigned, server-triggered arbitrary-file capture (still no basename restriction, still reaches any file under `Interface\AddOns` and `WTF`, still POSTs to `/diagnostic/upload`), the engine's `read` op, the BugGrabber/BugSack gather, and the unsigned updater. **Bearing: the ability to destroy my data was removed; the ability to collect it was kept.** I also examined the third `companion:request` branch (`t.idx`), which I had never read before: it hashes the source text of eight of GSE's own functions and POSTs a digest, reads nothing of yours, and is not new. **And I stopped to ask a question I should have asked five builds ago: what can GSE's server make the Companion do at all?** Ranked by blast radius, the answer is not the competitor machinery — it is the **auto-updater**, which is the largest capability in the app and the only one with no check of any kind: the server names an asset id, the app downloads it, and runs it with `/S --force-run` with no signature, hash or publisher check, then quits. A directive to delete one key from a Lua table is ed25519-signed, expiry-checked, account-checked and WoW-closed-gated; the executable that runs as you is verified by nothing. That is not competitor-specific — it affects every GSE user identically — and I had it filed as an unrelated aside since v0.4.14, which was the wrong weighting. Nothing has ever been observed being pushed through it in three captures. One clean negative worth stating: the **website cannot drive the app** — the Companion loads a local `index.html`, never gse.tools, with `contextIsolation: true` and `nodeIntegration: false`. Live on 2026-07-17 (35 min, WoW closed for 30): `enforce:false` on all four ten-minute polls, no `integrityRef`, no directive, no upload, no `.svmnt.tmp`, and the only `GRIP-EMS.lua` writes were WoW's own close flush. Addon 3.3.24-2 removed `GSE.Patron` entirely (17 refs to 0) and moved the gate to a separate `GSE_QoL` module shipped in the PATRON zip; advanced export is now free for everyone and three features genuinely left the free build, but **raw edit and multi-window are still fully compiled into the free build** and withheld by a nil hook. **(Retracted in part 2026-07-17 — see the retraction immediately below. `GSE_QoL` is NOT patron-only: it is public source on GitHub, free to anyone, and nothing checks entitlement. The pay-gate conclusions in that update are withdrawn; the Companion findings above are unaffected.)** Full write-up: [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md).
>
> ### ⚠ **RETRACTION 2026-07-17 — Finding 2 (the "PATRON" build) is substantially withdrawn.**
>
> I claimed that `QoL.lua` is "not freely accessible to or viewable by the general public" and that the 3.3.24-2 restructure "withholds 473 lines of add-on code behind a Patreon role lock". **Both are false.** `GSE_QoL` is **public source in GSE's own GitHub repository** and has been since **2024-07-07** (100+ commits; the restructure commit `7732fe5` was made *to that public repo*, which reports `"private": false`). The GitHub copy of `QoL.lua` is **byte-identical** to the PATRON zip's once line endings are normalised — 20,942 B LF vs 21,415 B CRLF, and the 473-byte difference is exactly the line count. `patreonBuild.js`, in the same public repo, simply copies the folder into the release.
>
> **Nothing checks entitlement**, so anyone can download the three files for free and every gated feature works. `Statics.Patrons` has exactly one functional reference in the whole addon — a `SetText` on the About page. It is a credits list; it gates nothing.
>
> **Blizzard policy point 2 is satisfied and my point-2 argument is withdrawn in full.** The Patreon role-locks the prebuilt *zip*; it does not withhold the *code*. I compared the two zips to each other and never opened the repository, and the repository is where point 2 is decided. The evidence for this retraction is the public repo, which has been public since 2024-07-07 and is unaffected by anything that happened this month.
>
> **Correction to this retraction, same day.** When I first wrote this block I also withdrew point 1, saying my "point-1 reading is substantially weakened." That was an error in the opposite direction, and I am fixing it here rather than quietly dropping it. Point 2 asks whether the code is completely visible. Point 1 asks whether the add-on is distributed free of charge and whether there are premium versions with additional for-pay features. Those are different tests. `GSE_QoL` being public source answers the first one. It does not answer the second, and I should not have let one carry the other.
>
> What I will say on point 1 is narrower than what I said in June, and it is this: no monetary compensation is required to *obtain* any feature. The code is public, it is free, and nothing checks entitlement. What the Patreon buys is the prebuilt zip and the convenience of not assembling it yourself. Whether that is a "premium version with additional for-pay features" within the meaning of point 1 is an argument I no longer think is clear-cut, and it is not mine to decide.
>
> One thing I am deliberately **not** doing: GSE's CurseForge description now reads *"This addon is 100% free. There are extra modules available for GSE for power users stored in GSE's GitHub repository."* I am not citing that as evidence in either direction. It appears on 3.3.25, uploaded 2026-07-17. I cannot tell from outside whether it is long-standing or recent, and a description written at one point in time is not an independent check on what the builds did over the preceding six weeks. Treating it as confirmation would be circular reasoning, and I have already made one error in this block by reaching for the nearest available conclusion.
>
> **Findings 1 (the Companion) and the addon lock-out finding are unaffected** — they were verified against shipped builds and do not turn on the pay-gate question. Details: the retraction block in [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md) and the corrections inside Finding 2 below.
>
> Also corrected: an earlier version of this note said CurseForge lagged at 3.3.23 and that 3.3.24/3.3.25 were gse.tools-only. Wrong — that came from a stale page fetch. CF's main file is **3.3.25, uploaded 2026-07-17**, listing 12.1.0.

> **Updated 2026-07-17, later the same day (v0.4.26, and addon 3.3.25) — the collection half is now gone too, and my previous sentence is out of date.** The update above ends "the ability to destroy my data was removed; the ability to collect it was kept." That is no longer accurate. **v0.4.26 removes the server-triggered arbitrary-file capture.** The server can no longer name a file: the `paths` field is not read anywhere in the build (`.paths` goes 2 occurrences to 0), the recursive directory walker that resolved bare filenames is deleted (`withFileTypes` 2 to 1), `capture-denied` and the 40,000-entry walk cap are gone (1 to 0 each), and the `companion:request` fall-through now calls the gather with `(requestId, kinds)` only. The capability did not move into `kinds`: that is a closed set of three flags (`errorlogs` / `log` / `settings`), no branch treats a member of it as a path, and the server path deletes `errorlogs` before gathering. What replaces it is user-driven — the server can set one boolean, `requestFiles`, whose whole effect is a notification asking *you* to attach files through the "Report a problem" form; `userFilePaths` arrives from the local UI (`ipcMain`, `source: "in-app"`) and its collector has exactly one call site. **Addon 3.3.25 does the matching half in-game:** the BugSack/BugGrabber error-log upload that 0.4.22 added to the always-on gather is now an unticked, default-off checkbox (`errorLogsCheck:SetValue(false)`), so it is neither always-on nor server-reachable. Both halves of the competitor-facing subsystem I documented in June are now absent from the shipped client. **What did NOT change, and it is still the largest capability in the app:** the unsigned auto-updater is untouched on all five properties (asset selection reads only `fileWin` with no digest, `autoApplyUpdates` still defaults on, still spawns `/S --force-run`, still has the HTTP-426 out-of-band trigger, installer still unsigned). The signed engine's `read` op still has **no** basename guard, and one indirect path survives: the engine can `read` `GRIP-EMS.lua` and `write` it into a `GSE*.lua` file, which the mandatory GSE-scoped gather then uploads — two steps, requiring a valid ed25519-signed directive, and never observed in any capture. Addon 3.3.25 is otherwise inert: competitor scan 0 hits on both builds (verified against a control), codec still writes plain `!GSE3!`, `!GSE3!+` still decode-only, `Serialisation.lua`/`Codec.lua`/`Plugins.lua` byte-identical to 3.3.24-2; the only added file is a BigWigs packager manifest. I also finally read the **`GSE_Companion` bridge addon**, which I had never examined: it is **installed by the desktop app** out of a payload inside the `.exe`, not by any addon channel, and has shipped that way since at least 0.4.20 — so it is a gap in my coverage, not a change in this build. It is benign; I checked the Lua-injection question specifically and the escaping is correct. Full write-up: [UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md). The 0.4.26 and 3.3.25 hashes are in `hashes.txt`.

**Published:** 2026-06-12
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)
**Subject software:** GSE Companion v0.4.12 (desktop app), distributed from https://gse.tools/releases
**Related project:** GSE: Sequences, Variables, Macros (GnomeSequencer-Enhanced), a World of Warcraft addon

---

## What this repository documents

This is a reproducible technical record of behavior in GSE, also known as GnomeSequencer-Enhanced or "GSE: Sequences, Variables, Macros," a World of Warcraft macro addon, and in its desktop companion, the GSE Companion app, distributed from gse.tools. With quoted code and step-by-step reproduction from the public downloads, it documents: the GSE Companion app detecting a competing addon's saved data, reporting it to GSE's server, flagging the user's account, and carrying a server-gated routine to delete that data; the later move of that deletion into a general, ed25519-signed, server-pushed file-modification engine; the later widening of the app's unsigned diagnostic upload to read arbitrary files under the WoW folders, reaching any addon's data and not only GSE's; and changes in the in-game GSE addon that close its sequence data off from other addons, including a new ChaCha20-encrypted sequence format. Every claim is a line you can read in a shipped file. I am a competitor, so do not take my word for it: each section ends with steps to reproduce it yourself.

Keywords for anyone researching this: GSE, GnomeSequencer-Enhanced, GSE Companion, gse.tools, World of Warcraft macro addon, SavedVariables, sequence import and migration, addon security.

---

## Read this first: who I am and how to treat this document

I am the author of GRIP-EMS, a free World of Warcraft macro addon. The software described below is built by GSE, a competing project, and the behavior it contains is aimed at my addon specifically.

I am a competitor. You should not take my word for anything. This document is written so you do not have to: every claim is a quoted line from a shipped file, and the steps to reproduce all of it from the public download are at the bottom. Verify it yourself and ignore my framing.

## One-paragraph summary

The GSE Companion is a desktop application that GSE distributes as a tool to "sync" macro sequences to the GSE addon. The shipped application also contains an "access-policy" subsystem, undocumented in the app, that does three things. Through v0.4.22, on login and then every ten minutes while signed in, it scanned your World of Warcraft SavedVariables for a competing addon named by GSE's server and reported the result, setting a `restrictedAccount` flag on your GSE account; v0.4.23 removed that client-side scan and flag and, by GSE's own comment, moved the decision to its server (see the 2026-07-15 update above). Through v0.4.23 it carried an ed25519-signed, server-pushed engine that, on a signed directive from GSE, could delete entries from or rewrite any addon's `.lua` SavedVariables while WoW is closed; v0.4.24 added a basename guard that confines those writes to GSE's own `GSE*.lua`, so the engine can no longer write to or delete my addon's file (see the 2026-07-17 update above). And from v0.4.20 through v0.4.24 it carried an unsigned, server-triggered routine that reads arbitrary files under your `Interface\AddOns` and `WTF` folders and uploads their content — unchanged in v0.4.24, reaching any file under those folders, including my addon's; v0.4.26 removed that routine (see the 2026-07-17 v0.4.26 update above). In the version first published here (v0.4.12) the detection target was the hard-coded string `GRIP-EMS.lua` and the deletion was a fixed routine, `purgeGripCharSequences`, aimed at my addon by name; that plaintext form is quoted in full below because it is the clearest proof of what the subsystem was built to do, and the dated updates above track how GSE moved the target to its server and generalized the deletion across later builds.

## What the application is

GSE Companion is an Electron desktop app. Electron apps store their JavaScript in a `resources/app.asar` archive, which is plain text once extracted — there is no decompilation involved. Everything below is quoted from that file in the installed application. Lines beginning with `//` in plain English are my annotations; the code lines are verbatim.

## Finding 1 — detection, reporting, and conditional deletion of a competitor's data

This finding has an arc across builds: the capability was added in plain text, obfuscated, generalized into a signed engine, and then in v0.4.24 half withdrawn. The current build is v0.4.26, which removes the arbitrary-file capture — see [UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md). The status table below is scoped to v0.4.24. Read the status table and the timeline first — the v0.4.12 code is quoted further down because that is where the intent is unambiguous, not because it is what ships today.

**Where it stands in v0.4.24:**

| Capability | Status in v0.4.24 |
|---|---|
| Client-side scan for `GRIP-EMS.lua`, and the `restrictedAccount` flag written to your account | Removed in v0.4.23. The decision moved to GSE's server, which cannot be inspected. |
| Signed engine writing to or deleting **GRIP-EMS's** SavedVariables | **Blocked in v0.4.24** by a new basename guard. |
| Signed engine writing to or deleting GSE's own `GSE*.lua` | Retained. |
| Server-triggered read and upload of **arbitrary files** under your `Interface\AddOns` and `WTF` | Retained, unchanged, still arbitrary. |
| The engine's `read` operation (any file under the roots, into memory) | Retained. No basename guard. |
| BugGrabber / BugSack error logs attached to every diagnostic upload | Retained. |
| Unsigned auto-updater (`/S --force-run`, no signature or hash check) | Retained. |

**The short version: v0.4.24 removed the ability to destroy my data and kept the ability to collect it.** Anyone told "the Companion has been addressed" should know which half that is true of.

### The timeline

- **v0.4.12**, the build first published here. The target was the hard-coded string `GRIP-EMS.lua`. On login and then every ten minutes while signed in, the app scanned your WoW SavedVariables for it, reported the result to GSE's backend, and set `restrictedAccount` on your account. A fixed routine, `purgeGripCharSequences`, deleted my addon's sequences when the server's `enforce` flag was on and WoW was closed. That form is quoted below.
- **v0.4.14.** The four GRIP-EMS identifiers were base64-encoded and the descriptive function names minified away. The behaviour did not change.
- **v0.4.15 and v0.4.16.** The identifiers were removed from the binary entirely, the target moved to a server-supplied field (`integrityRef`), and the fixed purge was replaced with a general, ed25519-signed, server-pushed engine that could delete from or rewrite any addon's `.lua` SavedVariables under `WTF` while WoW was closed.
- **v0.4.20 and v0.4.22.** v0.4.20 generalized the unsigned diagnostic upload: on a server push it reads arbitrary files under `Interface\AddOns` and `WTF` and POSTs their content. v0.4.22 attached your BugGrabber and BugSack error logs to every such upload.
- **v0.4.23.** The client-side detection and the `restrictedAccount` write were removed, with GSE's own shipped comment saying the restriction "is decided server-side." The signed engine and the capture stayed.
- **v0.4.24.** A basename guard was added to the engine's write path.
- **v0.4.26.** The arbitrary-file capture was removed; the server can no longer name file paths to collect. The signed engine, the `read` op and the unsigned updater are retained.

### v0.4.24: the write guard is real

I am a competitor, so this is the part where I have the least incentive to be fair. It is therefore the part I have been most careful about. The guard is genuine, it is load-bearing, and it does what it appears to do.

```
const Io = /^GSE.*\.lua$/i;
function Ao(e, t, n) {
    if (!ps(e, n)) throw new Error("path out of scope");
    if (!Io.test(dt(e))) throw new Error("write refused: not a GSE SavedVariables file");
    ...
}
```

`dt` is `basename`. The v0.4.23 counterpart has an identical body with only the `ps()` path-scope check, so the second guard is new in v0.4.24. `GRIP-EMS.lua` does not match `/^GSE.*\.lua$/i`.

I did not take the error string's word for it. Three checks:

1. `Ao` has exactly one call site: the plan interpreter's `write` operation.
2. The interpreter's full operation set is `listFiles`, `forEach`, `read`, `extractKeys`, `deleteKeys`, `selectKeys`, `setKey`, `write`, and a default that throws. Only `write` touches the filesystem. `deleteKeys` and `setKey` mutate in-memory bindings and can reach disk only through `write`, which means through `Ao` and its guard.
3. Every filesystem-mutating call in the application was enumerated case-sensitively and checked for whether its path can come from the server. `Ao` is the only one that takes a server-supplied path, and it is now guarded. The others write fixed GSE-owned paths: the bridge files, a hard-coded `GSE.lua` backup, and the Linux updater.

`runAccountCleanup` and `purgeGripCharSequences` are gone from the build.

**The signed engine can no longer write to or delete `GRIP-EMS.lua`.** That is a real change, and it is the right one.

### What v0.4.24 did not fix

The guard is on the write path only. What reads and uploads is untouched:

- **The arbitrary-file capture still has no basename or extension restriction.** On an unsigned server push (`companion:request` carrying `paths`), the app resolves the server's list, walks `Interface\AddOns` and `WTF`, reads what it finds and POSTs the content to `/diagnostic/upload/<requestId>`. Its only limits are a `..` reject, a realpath scope check, 4 MB per file, 40 files, and 40,000 walk entries. The server can still name `GRIP-EMS.lua` and receive it.
- **The engine's `read` operation has no basename guard either**, only the path-scope check, so any file under the roots can still be read into the interpreter's bindings.
- The BugGrabber / BugSack gather and the unsigned `--force-run` updater are unchanged.

So that the guard is not credited with more than it does, its own edges: it tests the basename while the scope check allows anywhere under `Interface\AddOns` and `WTF`, so a `GSE*.lua` file can still be written into any in-scope directory, including inside `Interface\AddOns\GRIP-EMS\`. It cannot overwrite `GRIP-EMS.lua`. The regex is case-insensitive with an unbounded `.*`, so `gse-anything.lua` passes it. Neither edge harms GRIP-EMS.

**A trap for anyone reproducing this.** A second copy of the same regex, `vo = /^GSE.*\.lua$/i`, sits inside the capture region and looks like it scopes the capture. It does not. It governs only the default gather of GSE's own SavedVariables, and the same regex was already present in v0.4.23. Reading it as "the capture is now GSE-only" would be wrong.

### The subsystem as first published (v0.4.12)

The rest of this section quotes the code in the form it was first published, because there the target is named in plain text and the intent is unambiguous. This is the historical record, not the current build.

**Constants defined in the application:**

```
const GSE_API_URL = "https://api.qik.dev";
const GSE_SVC_URL = "https://api.gse.tools";
const GRIP_SV_FILENAME = "GRIP-EMS.lua";
const ACCESS_POLICY_REFRESH_MS = 10 * 60 * 1000;
```

**Orchestration (`runAccessPolicyCheck`, called on login and on a 10-minute timer):**

```
const present = detectGripEmsAcrossClients(clients, getWtfAccounts);
accessPolicyState.restricted = !!present;
if (personaId && token) {
  accessPolicyState.lastSyncResult = await syncRestrictedAccountFlag({
    apiUrl: GSE_API_URL, token, personaId, present });
}
const e = await fetchAccessPolicy(GSE_SVC_URL);   // GET /settings/access-policy
accessPolicyState.enforce = !!e.enforce;
if (accessPolicyState.restricted && accessPolicyState.enforce) {
  ... if (!anyRunning) runAccountCleanup(clients);
}
```

**Deletion routine (`purgeGripCharSequences`):**

```
const charBlob = parsed.GRIP_EMS_CHAR;
const sequences = charBlob?.sequences;
...
for (const [seqName, seqData] of Object.entries(sequences)) {
  if (!seqData || typeof seqData !== "object") continue;
  const provenance = seqData.provenanceSource;
  const isGseLegacy = provenance === "gse-legacy";
  const nameMatchesGse = gseSequenceNames?.has?.(seqName);
  if (isGseLegacy || nameMatchesGse) {
    toDelete.push(seqName);
  }
}
// entries in toDelete are then removed from `sequences` and the file is
// atomically rewritten (writeSync to a .tmp, then renameSync over the original)
```

**What this does, in plain English:**

- `detectGripEmsAcrossClients` walks every configured WoW client's `WTF/Account/*/SavedVariables` folders, and each character folder, looking for a file named `GRIP-EMS.lua` — my addon's save file.
- `syncRestrictedAccountFlag` calls GSE's backend (`api.qik.dev`) and sets `data.restrictedAccount = true` or `false` on the signed-in user's GSE account record depending on whether my addon is present. This runs whenever a user is signed into the Companion, independent of the deletion switch.
- `fetchAccessPolicy` reads a server-controlled boolean `enforce` from `https://api.gse.tools/settings/access-policy`.
- If `restricted && enforce` is true and WoW is not running, `runAccountCleanup` calls `purgeGripCharSequences`, which opens the user's `GRIP-EMS.lua`, deletes the sequences whose `provenanceSource` is `"gse-legacy"` or whose name matches a GSE sequence, and rewrites the file without them. WoW being closed matters because the running game would otherwise overwrite the edited file on its next save.

**This is written against my addon specifically, not a generic heuristic.** GRIP-EMS's TOC declares `## SavedVariablesPerCharacter: GRIP_EMS_CHAR`, which WoW writes to `GRIP-EMS.lua`. The Companion reads exactly `parsed.GRIP_EMS_CHAR.sequences` and keys deletion on `provenanceSource === "gse-legacy"`, which is GRIP-EMS's own internal tag for sequences a user imported from GSE. The routine targets my addon's real on-disk schema, by name.

## The in-game addon points users to the Companion

The free GSE addon hosted on CurseForge links to the Companion and walks users through installing it, even though the store listing does not mention it. In the shipped free build:

- `GSE_GUI/Editor_Tree.lua` — a clickable in-game link to `https://gse.tools`, the site that distributes the Companion.
- `GSE/Localization/ModL_enUS.lua` — in-game text reading: "Download the Companion at gse.tools. Once installed, a small bridge addon (GSE Companion Bridge) appears in your addon list — keep it enabled."
- `GSE_Options/Options.lua` — a "Companion App" settings panel (Auto-Accept Companion Updates, Sync WoW Macros to GSE.Tools).

These strings are byte-identical between the free and PATRON builds. The in-game addon is what points users to the desktop application described above.

## What I am not claiming

I am being deliberately precise about the limits of this finding, and those limits have narrowed as the builds have changed. Precision cuts both ways, so some of these are concessions.

- **The client-side detection and the account flag are gone.** Through v0.4.22 they ran unconditionally whenever you were signed in. v0.4.23 deleted them. The current Companion does not scan your disk for my addon, and I am not saying it does. What I am saying is narrower: GSE moved that decision to its server, where nobody outside GSE can audit it, and left in the client the arm that acts on it.
- **The signed engine can no longer touch my addon's file.** v0.4.24 restricts the engine's write path to filenames matching `GSE*.lua`. `GRIP-EMS.lua` does not match. I verified that three ways, and it holds.
- **The engine is authorized by an ed25519 signature, not by the `enforce` flag.** `enforce` gated the original v0.4.12 purge and still disables parts of the UI, but it has never gated the signed engine, so `enforce:false` does not mean a directive cannot run. Writing anything now takes a signed server push, an unexpired directive, WoW closed, **and** a target filename matching `GSE*.lua`.
- **Correcting myself on the account check.** I have previously described the directive's `targetPersona` as if it were a requirement protecting you. Reading it properly, it is not. The check is `if (t.targetPersona && a && String(t.targetPersona) !== String(a)) return;` — it only refuses when the server *supplied* a target persona **and** it fails to match. If the server omits that field, the check is skipped and the directive proceeds. So `targetPersona` is an optional narrowing the sender may choose to apply; it is not an entitlement check the client enforces on your behalf. I made it sound stronger than it is, and it is my job to get that right in the direction that does not flatter my own case.
- **The arbitrary-file capture was the part still live in v0.4.24, and v0.4.26 removed it.** Through v0.4.24 it was unsigned, server-triggered, had no basename or extension restriction, and reached any file under your `Interface\AddOns` and `WTF` folders, my addon's save file included. As of v0.4.26 the server can no longer name file paths to collect — see [UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md).
- **I am not claiming a deletion or an upload has happened to anyone.** On 2026-07-17 I ran v0.4.24 under a decrypted capture for 35 minutes, signed in with my addon present and WoW closed for the last 30: `enforce` read false on all four ten-minute polls, no `integrityRef` was returned, no directive arrived, no file was uploaded, no `.svmnt.tmp` appeared, and the only writes to `GRIP-EMS.lua` were WoW's own close flush. Same result as 2026-07-09 and 2026-07-15. The capability is in the shipped code; I have never observed it being exercised.
- **I am not claiming a motive.** I do not know GSE's release date for v0.4.24, and nothing on the client can tell me why any of it shipped. This document records what the builds do, and makes no claim about why they do it.
- **What I am stating is narrow and verifiable:** through v0.4.24 the distributed application carried an unsigned, server-triggered routine that read arbitrary files under your WoW folders and uploaded their content; v0.4.26 removes it. The signed engine that can rewrite GSE's own SavedVariables while WoW is closed is still shipped. Until v0.4.23 it also carried code that detected my addon by name and flagged your account for it; that code is in the published history and the hashes above, not in today's build. Whether GSE sends any directive to a given user is the part not visible from the client.

## Finding 2 (secondary) — the "PATRON" build of the addon — **substantially retracted 2026-07-17, see the corrections in this section**

GSE ships a separate "PATRON" build alongside the public build on https://gse.tools/releases. Comparing the public and PATRON builds of the same version (`3.3.20-9-gd5e65ce`):

- The files present in both builds are byte-identical except for one line: the PATRON `.toc` version string ends in `-PatronBuild`.
- `GSE/API/Init.lua` contains: `if GSE.VersionString:find("Patron") then GSE.Patron = true end`.
- That flag gates features compiled into both builds: raw macro editing, multi-window editing, tab-completion of variables and sequences, click-timing configuration, and advanced export. The PATRON zip additionally ships a `GSE_QoL` module (native icon picker, Skyriding keybind bar, on-save checksum stamper).

The description above is of the mechanism as it stood through addon build **3.3.24-1** (verified 2026-07-17: 17 `GSE.Patron` references across seven files, all five features gated). In that form the flag was self-declared by the build rather than checked: it was set solely because the addon's own `## Version:` string contained "Patron" (`GSE/API/Init.lua:20`), with no licence key, no server call and no Patreon verification, so any copy of the PATRON zip had it set. The features it gated are ordinary supporter perks, and none of them touch the access-policy, `restrictedAccount`, or deletion machinery in Finding 1. I am not suggesting the patron gate is hostile; the question this section raises is the paid-build policy one below.

**Superseded by 3.3.24-2 (2026-07-16).** Commit `7732fe5` ("Restructure power user features") removed the `GSE.Patron` flag entirely (17 references to 0) and moved the gated code into a separate `GSE_QoL` module — which ships in the PATRON zip, and is also **public source on GitHub** (see the correction below) — as capability hooks (`CanMultiWindow`, `CanRawEdit`, `OnBuildClickTimingOptions`, `OnTreeContextMenuExtras`, `OnEditorBooleanTab`, `OnEditorMacroTab`), which the shared files now call defensively. The gate is therefore module distribution rather than a runtime flag: comparing the two 3.3.24-2 zips, the free build ships 165 files and the PATRON build 168, the three extra being `GSE_QoL/{Bootstrap.lua, GSE_QoL.toc, QoL.lua}`, and every shared `.lua` is byte-identical (only the five module `.toc` version strings differ). Of the five features, advanced export is now genuinely free for everyone; tab-completion, click-timing and the tree context extras are genuinely absent from the free build; but raw edit and multi-window remain fully compiled into the free build and are withheld only because the hook is nil.

**Nothing checks your entitlement.** There is no licence key, no server call, no Patreon verification and no account binding in either build. The free build carries the dispatcher (`GSE/API/Init.lua`: a six-name `SUBMODULES` allowlist and `pushGSEInto`, which calls `_G[addon .. "_Initialize"](GSE)` on `ADDON_LOADED`); the PATRON zip supplies the other half, a twelve-line `GSE_QoL/Bootstrap.lua` that receives GSE's real namespace table and runs the module's setup. That setup then sets `GSE.CanRawEdit = function() return true end` and `GSE.CanMultiWindow = function() return true end` — two closures that return the literal `true` and consult nothing. So the gate is the presence of a folder on disk, enforced at the download and never at runtime, and the allowlist is keyed on folder name alone.

**CORRECTED 2026-07-17.** This paragraph previously ended: *"Worth noting alongside Blizzard's policy point 2 ('Add-on code must be completely visible... freely accessible to and viewable by the general public'): the old flag arrangement shipped all the code to everyone and withheld a boolean; the new one withholds 473 lines of add-on code behind a Patreon role lock."* **That was false and it is withdrawn.** `GSE_QoL` is public source in GSE's own GitHub repository (`TimothyLuke/GSE-Advanced-Macro-Compiler/GSE_QoL/`) and has been since 2024-07-07. The GitHub copy of `QoL.lua` is byte-identical to the PATRON zip's once line endings are normalised (20,942 B LF vs 21,415 B CRLF — the 473-byte difference is exactly the line count), and `patreonBuild.js` in the same public repo simply copies the folder into the release. **No add-on code is withheld from anyone. Point 2 is satisfied.** The Patreon role-locks the prebuilt *zip*, not the *code* — and since nothing checks entitlement at runtime, the features work for anyone who downloads the module for free. (2026-07-18: this paragraph previously went on to cite GSE's CurseForge description as accurate corroboration here. The correction block at the top of this document rules that description out as evidence in either direction, so the citation is removed; the public repository is the check.) The error was comparing the two zips to each other and never opening the repository. See the retraction block in [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md).

Full write-up, with the measured file counts, the hook table, the verbatim gate chain and the per-feature evidence: [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md).

**CORRECTED 2026-07-17.** This section previously ended by arguing that GSE's PATRON build was the category Blizzard's policy point 1 addresses — "a paid build of the addon itself, with feature gates". **That reading is substantially weakened and I am recording why rather than leaving it to stand.** Point 1 bars requiring "monetary compensation to download or access an add-on". No payment is required to access any GSE feature: `GSE_QoL` is free public source (above), nothing checks entitlement, and the module works for anyone who downloads it. The strongest surviving version of this section is narrow — a zip *branded* "PatronBuild" is Patreon-exclusive, even though none of its contents are — and whether a convenience bundle of freely-available code is a "premium version" is a genuine question rather than the clear-cut one this section implied. What remains accurate: raw edit and multi-window are compiled into the free build and withheld by a nil hook. That is the mechanism; it is not a paywall.

Also corrected: CurseForge hosts the **current** GSE build, not an old one. As of 2026-07-17 the CF project page's main file is **3.3.25, uploaded that same day**, listing 12.1.0 among its game versions. An earlier draft of this correction claimed CF lagged at 3.3.23 and that newer builds were gse.tools-only; that came from a stale page fetch and was wrong. The PATRON zip is distributed via gse.tools; the free build ships to CurseForge same-day.

Re-verified 2026-06-16 (addon 3.3.22): the public and PATRON trees are identical except for the version strings in the `.toc` files and the extra `GSE_QoL` module. Per the developer's own Patreon, the PATRON **build** is "role locked so it's only available for Patrons" — which is accurate about the zip, and is not the same thing as the module's code being withheld. It is not.

## How to verify all of this yourself

**Finding 1 (Companion):**

1. Download GSE Companion from https://gse.tools/releases and install it.
2. Open `%LOCALAPPDATA%\Programs\gse-companion\resources\app.asar`. It is an asar archive; extract it with `npx asar extract app.asar out`, or read it directly with any text editor or a `strings` tool.
3. Search the contents for: `detectGripEmsAcrossClients`, `syncRestrictedAccountFlag`, `purgeGripCharSequences`, `GRIP-EMS.lua`, `GRIP_EMS_CHAR`, `access-policy`.
4. Confirm the constants and the `runAccessPolicyCheck` flow shown above.

   Important — match the recipe to the build you downloaded. The steps above are for v0.4.12-v0.4.13, where the identifiers are plain text. The current release as of 2026-07-18 is v0.4.26, and the names in step 3 are not in it; the targeting code changed across releases and a plain-text search of a recent build returns nothing by design. The progression, each with its own working recipe:

   - v0.4.14 base64-encoded the four GRIP-EMS identifiers. Recipe: [UPDATE-2026-06-20-v0.4.14-obfuscation.md](UPDATE-2026-06-20-v0.4.14-obfuscation.md) (search the base64 literal `R1JJUC1FTVMubHVh` and decode it), or read [evidence/app_asar_grip_region_0.4.14.js](evidence/app_asar_grip_region_0.4.14.js).
   - v0.4.15 and v0.4.16 removed the four identifiers from the binary entirely and replaced the fixed deletion with a signed, server-pushed file-modification engine. Recipe: [UPDATE-2026-06-21-v0.4.15-v0.4.16.md](UPDATE-2026-06-21-v0.4.15-v0.4.16.md) (search the ed25519 key `b531cb8b505ae9752b5b789f26085853b0ba5da5d7e7e244975f0545430d683a`, the `sign.detached.verify` call, and the interpreter op labels `listFiles` / `read` / `deleteKeys` / `setKey` / `write`).
  - v0.4.20 through v0.4.22 keep that signed engine and add a server-triggered arbitrary-file capture in v0.4.20 and a BugGrabber/BugSack error-log gather in v0.4.22. Recipe: [UPDATE-2026-07-09-v0.4.20-v0.4.22.md](UPDATE-2026-07-09-v0.4.20-v0.4.22.md) (search `capture-denied`, the roots function returning `Interface/AddOns` and `WTF`, and the regex `/^!?Bug(Grabber|Sack)\.lua$/`).
  - v0.4.23 removed the client-side detection and the `restrictedAccount` write entirely; that decision moved to GSE's server. The signed engine, the arbitrary-file capture, and the BugGrabber/BugSack gather remain. Recipe: [UPDATE-2026-07-15-v0.4.23.md](UPDATE-2026-07-15-v0.4.23.md) (confirm `syncRestrictedAccountFlag` and `integrityRef` are absent and `policy:state` returns `restricted:!1`; confirm the ed25519 key `b531cb8b...683a` and `capture-denied` are still present).
  - v0.4.24 adds a basename guard to the signed engine's write path, so it can no longer write to or delete `GRIP-EMS.lua`. The arbitrary-file capture, the engine's `read` op, the BugGrabber/BugSack gather and the unsigned updater are all retained. Recipe: [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md). Search the beautified `out/main/index.js` for the string `write refused: not a GSE SavedVariables file` and read the function it sits in; confirm that function has exactly one call site (the interpreter's `write` op). Then confirm the capture is still unguarded: search `capture-denied` and `/diagnostic/upload`, and check that the file-gathering function has no basename test. Do not mistake the `/^GSE.*\.lua$/i` copy inside the capture region for capture scoping — it governs only the default gather of GSE's own files, and it was already in v0.4.23.
  - v0.4.26 removed the arbitrary-file capture. Recipe: [UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md) (confirm the dispatch else-branch calls the gather with kinds only and no paths, and that `capture-denied` is absent).

   The releases page may only offer the latest build (v0.4.26, as of 2026-07-18); for an older build, verify the SHA-256 of a copy you already have against `hashes.txt`.

**Finding 2 (paid build):**

1. From https://gse.tools/releases, download the public and PATRON zips of the same version.
2. Diff the two folder trees. The shared files differ only by the `-PatronBuild` version string; the PATRON build adds the `GSE_QoL` folder.
3. Match the recipe to the build. **Through 3.3.24-1:** open `GSE/API/Init.lua` and the GUI files to see the `GSE.Patron` feature gates (`Init.lua:20` sets the flag from the version string). **From 3.3.24-2 the flag is gone** and the gate is module distribution — in the *free* build read the `SUBMODULES` table and `pushGSEInto` in `GSE/API/Init.lua`, then grep `CanRawEdit` and `CanMultiWindow` and confirm you find call sites and zero definitions; in the *PATRON* build read `GSE_QoL/Bootstrap.lua` (12 lines) and `GSE_QoL/QoL.lua:134,137`. Note that a literal grep for `GSE_QoL_Initialize` in the free build returns nothing, because the dispatcher builds the name by concatenation (`_G[addon .. "_Initialize"]`) — that absence is not evidence the caller is missing.
4. To see that raw edit still ships in the free build, open `GSE_GUI/Editor.lua` at 6126-6160 and confirm `raweditbutton` is fully constructed there, then note only the `AddChild` at 7073 is gated.

## File integrity (SHA-256)

All files acquired on the dates shown. I can provide any of these files, or the extracted `app.asar` JavaScript, on request.

- **GSE Companion Setup 0.4.12.exe** (installer, from gse.tools/releases)
  `706742b44f5ea9056f67df2e8cae771cd909dd0b882a0d4c3bf87a7639d0043f`
  81,299,552 bytes — acquired 2026-06-11
- **resources/app.asar** (installed Companion application logic)
  `209adedde7905179832038661b5d279a95831a155d963da3190871d502f36b0f`
  6,068,792 bytes — installed 2026-06-09
- **GSE-3.3.20-9-gd5e65ce.zip** (public addon build)
  `789753305d33dc21732b67948ef839f4b058fcc15e095b8be8fcb855e28d9c85`
  2,514,665 bytes — acquired 2026-06-11
- **GSE-3.3.20-9-gd5e65ce-PatronBuild.zip** (PATRON addon build)
  `7ea11bd7dbe6bb64eb1867462197c7ac52e795a0e7a528eeba77d62be475f5a0`
  2,522,115 bytes — acquired 2026-06-11
- **GSE Companion Setup 0.4.13.exe** (installer, from gse.tools/releases)
  `d580dc7c7c39fb747b25830e8233d71b7f4404a07d3c8b14262dc3254d114729`
  81,299,751 bytes — acquired 2026-06-17
- **resources/app.asar** (0.4.13, extracted statically from the installer)
  `4f9a2664ea0d2cb5a4f4594299dfd7e74242379fd4fbf2edbf75655893278c5f`
  6,068,841 bytes — extracted 2026-06-17

## Scope of this document

This is a description of behavior in distributed software, backed by quoted code and reproduction steps. It is not a claim about anyone's character, and it does not cover community moderation, account bans, or any dispute between projects — only what the shipped application does. Reach your own conclusion from the files.

That scope has not changed. The correspondence — the CurseForge moderation ticket, the cease and desist I sent, the access request, the platform reply — is in [MODERATION-RECORD.md](MODERATION-RECORD.md), deliberately kept out of this document. It is there because leaving it out entirely would give a misleading picture of what has happened since June, not because it is evidence. **It is my account of what I was told, and most of it you cannot check.** Nothing in this README depends on any of it. If you only read one of these two files, read this one.

One addition to note, 2026-07-18: the new server-control-surface update is almost entirely static reads of the shipped binary and sits inside this scope. Its endpoint table includes a few rows marked OBSERVED, which come from watching the app talk to its server over my own authenticated, read-only session, a live observation of my own account, labelled per row, not a code read. It rests on nothing beyond my own account. Where a genuine access-control observation on GSE's platform exists, it was reported privately to the operator and to GSE (see [MODERATION-RECORD.md](MODERATION-RECORD.md)) and is deliberately not detailed anywhere in this repository, because publishing the mechanics of an unfixed access-control issue would put users at risk.

## Files in this repository

- `README.md` — this document.
- `MODERATION-RECORD.md` — the correspondence: the CurseForge moderation ticket, the cease and desist I sent, the access request that bounced, the platform reply, the forum ban. Deliberately separate. It is my account of what I was told, most of it is not checkable by you, and nothing in this README rests on it.
- `hashes.txt` — SHA-256 hashes for the installer, `app.asar`, and both addon builds.
- `evidence/app_asar_grip_region.js` — the extracted region of the Companion's `app.asar` containing the access-policy, detection, account-flag, and deletion code quoted above. Read the real file instead of trusting the quotes.
- `evidence/patron_vs_public_build_diff.txt` — the file-tree and content diff of the public vs. PATRON addon build (supports the secondary finding).
- `evidence/ems_vs_gse_similarity_scan.txt` — a source-similarity scan between GRIP-EMS and GSE, included for completeness so the addon-code question can be checked independently too.
- `UPDATE-2026-06-20-v0.4.14-obfuscation.md` — the 2026-06-20 update: v0.4.14 keeps the same targeting code but base64-encodes the GRIP-EMS identifiers. Includes the plaintext (0.4.12) vs base64 (0.4.14) comparison, the decode, and an updated reproduction recipe.
- `FULL-TECHNICAL-AUDIT-v0.4.14.md` — a complete static security audit of v0.4.14. The competitor-targeting above is the focus; the audit also covers the rest of the app (most of which is unremarkable) and notes one unrelated general-security issue in the auto-updater, for completeness.
- `evidence/app_asar_grip_region_0.4.14.js` — the verbatim v0.4.14 code region (detector, account-flag, deletion, policy orchestrator); the counterpart to the 0.4.12 extract.
- `evidence/decoded_strings_0.4.14.txt` — the four base64 literals and their decoded values.
- `evidence/live_access_policy_2026-06-20.json` — a capture of the live server `enforce` flag (`false`) on 2026-06-20, with the request used.
- `evidence/file_manifest_0.4.14.txt` — SHA-256 of every file in the v0.4.14 installer payload and `app.asar`.
- `UPDATE-2026-06-21-v0.4.15-v0.4.16.md` — the 2026-06-21 update: v0.4.15 replaced the fixed purge with a general, ed25519-signed, server-pushed file-modification engine and moved detection to a server-supplied field; v0.4.16 renamed the remaining fields and stripped the comments. Includes the verbatim engine code, the runtime capture, reproduction steps, and the v0.4.15/v0.4.16 hashes.
- `evidence/companion_0.4.16_command_engine.js` — the verbatim signed-command engine from v0.4.15/v0.4.16: the signature gate, the directive handler, the plan interpreter and its operations, the event-stream dispatch, the detection scan, and the embedded ed25519 public key.
- `evidence/identifier_search_0.4.16.txt` — the all-encodings search confirming the four GRIP-EMS identifiers are absent from v0.4.16 in any encoding.
- `evidence/live_access_policy_2026-06-21.json` — the live server `enforce` flag (`false`) captured 2026-06-21, with the authenticated and anonymous responses.
- `UPDATE-2026-06-21-addon-sequence-lockout.md` — a separate 2026-06-21 finding in the in-game GSE addon (not the Companion): the global `GSE` namespace is now a locked proxy that denies in-memory reads by third-party addons, and a new ChaCha20-encrypted sequence format (`!GSE3!+`) is provisioned that only the GSE addon can decrypt. Includes verbatim code, the addon-file hashes, and reproduction steps.
- `evidence/gse_addon_locked_proxy.lua` — the verbatim locked-proxy block from the addon's `GSE/API/Plugins.lua`.
- `evidence/gse_addon_codec_chacha20.lua` — the verbatim `GSE/API/Codec.lua`: the ChaCha20 cipher, the embedded 32-byte key, and `DecodePackedMessage`.
- `evidence/gse_addon_serialisation_dispatch.lua` — the verbatim `EncodeMessage` / `DecodeMessage` dispatch that routes a `!GSE3!+` string to the decrypter.
- `UPDATE-2026-07-17-v0.4.17-v0.4.19.md` — the 2026-07-17 update covering the builds between v0.4.16 and v0.4.20. Nothing competitor-facing moves in either build I hold: the signed engine, the detection field and the `enforce` flag are flat, and the arbitrary-file capture first appears in v0.4.20 exactly where this repository already said it did. It also records that **v0.4.17 was never acquired** — the installer named `0.4.17` is byte-identical to the one named `0.4.18` and declares `"version": "0.4.18"` inside — and that a user-driven support report with an add-on inventory arrived in v0.4.17 or v0.4.18 and cannot be narrowed further. That last point corrects a sentence in the v0.4.26 update, in GSE's favour.
- `UPDATE-2026-07-09-v0.4.20-v0.4.22.md` — the 2026-07-09 update: v0.4.20 generalized the unsigned diagnostic upload to read server-specified arbitrary files under `Interface\AddOns` and `WTF`; v0.4.22 attaches the user's BugGrabber/BugSack error logs to every diagnostic upload; the signed engine is armed independent of the `enforce` flag. Includes the verbatim code pointers, a 30-minute decrypted runtime capture, reproduction steps, and the v0.4.20-v0.4.22 hashes.
- `evidence/companion_0.4.22_main_beautified.js` — the full beautified `out/main/index.js` of v0.4.22, so the functions named for that build can be read in context. Its SHA-256 is in `hashes.txt`. (For v0.4.23, extract the current installed `app.asar`; the 2026-07-15 update lists what changed.)
- `evidence/live_access_policy_2026-07-09.json` — the live server `enforce` flag (`false`) captured 2026-07-09, authenticated with the account token and anonymously.
- `UPDATE-2026-07-15-v0.4.23.md` — the 2026-07-15 update: v0.4.23 removed the client-side detection and the `restrictedAccount` write (the decision moved to GSE's server); the ed25519 engine, the arbitrary-file capture, the BugGrabber/BugSack gather, and the unsigned updater all remain. Addon 3.3.24-1 stays inert. Includes the confirmed 0.4.22-to-0.4.23 change set and the 0.4.23 hashes.
- `UPDATE-2026-07-17-v0.4.24.md` — the 2026-07-17 update: v0.4.24 adds a real basename guard (`/^GSE.*\.lua$/i`) to the signed engine's write path, so it can no longer write to or delete `GRIP-EMS.lua`; the arbitrary-file capture, the engine's `read` op, the BugGrabber/BugSack gather and the unsigned updater are all retained. Also covers the third `companion:request` branch (`t.idx`), which I had never examined and which turns out to be a code self-attestation channel rather than a data path, and addon 3.3.24-2's pay-gate restructure. Includes the verbatim guard, the fs-call enumeration, a 30-minute decrypted runtime capture, reproduction steps and the 0.4.24 / 3.3.24-2 hashes.
- `UPDATE-2026-07-17-v0.4.26.md` — the 2026-07-17 update on the current build, and the one that reverses this document's headline: **v0.4.26 removes the arbitrary-file capture** that Finding 1 describes. Read it before citing anything above as current. What remains is the unsigned auto-updater.
- `UPDATE-2026-07-18-server-control-surface.md` — the server-control surface read against the current build: the unsigned auto-updater ranked as the largest capability (no signature or hash check, `/S --force-run`, auto-apply default, HTTP-426 on-demand trigger, runs signed-out), the asymmetry between the five-way-guarded signed engine and the unchecked updater, the negative result that the website cannot drive the app, and the endpoint surface the client talks to. Reproduction steps and the 0.4.26 `index.js` hash included.

A note on scope: this document deliberately contains only the shipped code, hashes, and reproduction steps. It does not include community screenshots, private messages, or moderation history — those are a separate matter and are not needed to verify anything here. Where that material exists, it is quarantined in [MODERATION-RECORD.md](MODERATION-RECORD.md) and labelled for what it is: unverifiable correspondence, published so the record is complete, carrying none of the weight.

## References

- GSE Companion and addon releases: https://gse.tools/releases
- GSE Companion FAQ (states the "sync" purpose only): https://gse.tools/help/faq
- GSE on CurseForge: https://www.curseforge.com/wow/addons/gse-gnome-sequencer-enhanced-advanced-macros
- GRIP-EMS on CurseForge: https://www.curseforge.com/wow/addons/grip-enhanced-macro-sequencer
- Blizzard UI Add-On Development Policy: https://us.forums.blizzard.com/en/wow/t/ui-add-on-development-policy/24534
- CurseForge moderation policies: https://support.curseforge.com/support/solutions/articles/9000197279-project-and-modpack-moderation-policies
- Archived copies of the pages cited here: https://archive.org/details/@jesper_driessen/web-archive
- Where this is being discussed (context, not part of the evidence in this repo):
  - r/WowUI: https://www.reddit.com/r/WowUI/comments/1u3z6cs/
  - r/wowaddons: https://www.reddit.com/r/wowaddons/comments/1u3z5j7/
  - r/wow (the original post): https://www.reddit.com/r/wow/comments/1u25ulq/
  - r/wow: https://www.reddit.com/r/wow/comments/1urdvdj/
  - WoW forums (Blizzard) - Re: Paid Addons: https://us.forums.blizzard.com/en/wow/t/re-paid-addons/2314723
  - Video discussion: https://youtu.be/2Lwqu93TiFY
