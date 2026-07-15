# Undisclosed competitor-addon detection, server-gated data deletion, and sequence lock-out in GSE (GnomeSequencer-Enhanced) and the GSE Companion app

> **Independently re-verified 2026-06-12.** Every SHA-256 below was recomputed against the files on disk and matched; every function name and constant quoted in this document was confirmed present in the shipped v0.4.12 `app.asar` (build hash `209aded…b0f`; this README documents v0.4.12, and the dated updates below track every build since through the current v0.4.23). The extracted code region is included in this repo at [`evidence/app_asar_grip_region.js`](evidence/app_asar_grip_region.js) so you can read the real file rather than trust the quotes.
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

The GSE Companion is a desktop application that GSE distributes as a tool to "sync" macro sequences to the GSE addon. The shipped application also contains an "access-policy" subsystem, undocumented in the app, that does three things. Through v0.4.22, on login and then every ten minutes while signed in, it scanned your World of Warcraft SavedVariables for a competing addon named by GSE's server and reported the result, setting a `restrictedAccount` flag on your GSE account; v0.4.23 removed that client-side scan and flag and, by GSE's own comment, moved the decision to its server (see the 2026-07-15 update above). It carries an ed25519-signed, server-pushed engine that, on a signed directive from GSE, can delete entries from or rewrite any addon's `.lua` SavedVariables while WoW is closed. And, since v0.4.20, it carries an unsigned, server-triggered routine that reads arbitrary files under your `Interface\AddOns` and `WTF` folders and uploads their content. In the version first published here (v0.4.12) the detection target was the hard-coded string `GRIP-EMS.lua` and the deletion was a fixed routine, `purgeGripCharSequences`, aimed at my addon by name; that plaintext form is quoted in full below because it is the clearest proof of what the subsystem was built to do, and the dated updates above track how GSE moved the target to its server and generalized the deletion across later builds.

## What the application is

GSE Companion is an Electron desktop app. Electron apps store their JavaScript in a `resources/app.asar` archive, which is plain text once extracted — there is no decompilation involved. Everything below is quoted from that file in the installed application. Lines beginning with `//` in plain English are my annotations; the code lines are verbatim.

## Finding 1 — detection, reporting, and conditional deletion of a competitor's data

Through v0.4.22 this subsystem had three parts, all in the Companion's `out/main/index.js`. v0.4.23 removed the first (the client-side detection and flagging) and, by GSE's own comment, moved that decision to its server; the signed engine and the file capture remain. As it stood through v0.4.22:

- Detection and flagging. On login and then every ten minutes, whenever you are signed in, the app scans your WoW SavedVariables for a target the server names (the `integrityRef` field in the access-policy response) and reports the result to GSE's backend, setting `restrictedAccount` true or false on your account. In the original build the target was not server-supplied; it was the hard-coded string `GRIP-EMS.lua` shown below.
- A signed file-modification engine. On a server push (`companion:request`) carrying an ed25519 signature from GSE's embedded key, the app can delete entries from or rewrite any `.lua` SavedVariables file under your `WTF` folder while WoW is closed. It is authorized by the signature, not by the `enforce` flag.
- A server-triggered file read (added in v0.4.20). On an unsigned server push, the app reads arbitrary files under your `Interface\AddOns` and `WTF` folders and uploads their content; since v0.4.22 it also attaches your BugGrabber and BugSack error logs to every such upload.

Each part is documented build-by-build in the dated updates above and their linked write-ups. The rest of this section quotes the subsystem in the form it was first published (v0.4.12), because there the target is named in plain text and the intent is unambiguous.

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

I am being deliberately precise about the limits of this finding:

- The detection and the account-flagging run unconditionally whenever a user is signed into the Companion. This is in the shipped code and runs today.
- The current signed engine is authorized by an ed25519 signature, not by the `enforce` flag. `enforce` gated the original v0.4.12 purge and still disables parts of the UI, but it does not gate the signed engine, so `enforce:false` does not mean a deletion cannot run. A deletion requires a signed server push, your account as the target, an unexpired directive, and WoW closed.
- I am not claiming a deletion has happened to anyone. On 2026-07-09 I ran the current build under a decrypted capture, signed in with my addon present and WoW closed: `enforce` read false, no signed directive arrived, and nothing on disk changed. The capability is in the shipped code; I did not observe it being used in that window.
- What I am stating is narrow and verifiable: the distributed application, today, contains code that detects a competitor's save file, reports its presence to a server, flags the user's account, and carries a remote-triggered routine to delete that competitor's data. Whether GSE sends such a directive to a given user is the part not visible from the client.

## Finding 2 (secondary) — paid "PATRON" build of the addon

GSE ships a separate "PATRON" build alongside the public build on https://gse.tools/releases. Comparing the public and PATRON builds of the same version (`3.3.20-9-gd5e65ce`):

- The files present in both builds are byte-identical except for one line: the PATRON `.toc` version string ends in `-PatronBuild`.
- `GSE/API/Init.lua` contains: `if GSE.VersionString:find("Patron") then GSE.Patron = true end`.
- That flag gates features compiled into both builds: raw macro editing, multi-window editing, tab-completion of variables and sequences, click-timing configuration, and advanced export. The PATRON zip additionally ships a `GSE_QoL` module (native icon picker, Skyriding keybind bar, on-save checksum stamper).

For accuracy: CurseForge hosts only the free GSE build; the PATRON build is distributed off-CurseForge via gse.tools. Blizzard's UI Add-On Development Policy, point 1, states that all add-ons must be distributed free of charge and that developers may not create premium versions with additional for-pay features. A paid build of the addon itself, with feature gates, is the category that policy addresses.

Re-verified 2026-06-16 (addon 3.3.22): the public and PATRON trees are identical except for the version strings in the `.toc` files and the patron-only `GSE_QoL` module. Per the developer's own Patreon, the PATRON build is "role locked so it's only available for Patrons."

## How to verify all of this yourself

**Finding 1 (Companion):**

1. Download GSE Companion from https://gse.tools/releases and install it.
2. Open `%LOCALAPPDATA%\Programs\gse-companion\resources\app.asar`. It is an asar archive; extract it with `npx asar extract app.asar out`, or read it directly with any text editor or a `strings` tool.
3. Search the contents for: `detectGripEmsAcrossClients`, `syncRestrictedAccountFlag`, `purgeGripCharSequences`, `GRIP-EMS.lua`, `GRIP_EMS_CHAR`, `access-policy`.
4. Confirm the constants and the `runAccessPolicyCheck` flow shown above.

   Important — match the recipe to the build you downloaded. The steps above are for v0.4.12-v0.4.13, where the identifiers are plain text. The current release as of 2026-07-14 is v0.4.23, and the names in step 3 are not in it; the targeting code changed across releases and a plain-text search of a recent build returns nothing by design. The progression, each with its own working recipe:

   - v0.4.14 base64-encoded the four GRIP-EMS identifiers. Recipe: [UPDATE-2026-06-20-v0.4.14-obfuscation.md](UPDATE-2026-06-20-v0.4.14-obfuscation.md) (search the base64 literal `R1JJUC1FTVMubHVh` and decode it), or read [evidence/app_asar_grip_region_0.4.14.js](evidence/app_asar_grip_region_0.4.14.js).
   - v0.4.15 and v0.4.16 removed the four identifiers from the binary entirely and replaced the fixed deletion with a signed, server-pushed file-modification engine. Recipe: [UPDATE-2026-06-21-v0.4.15-v0.4.16.md](UPDATE-2026-06-21-v0.4.15-v0.4.16.md) (search the ed25519 key `b531cb8b505ae9752b5b789f26085853b0ba5da5d7e7e244975f0545430d683a`, the `sign.detached.verify` call, and the interpreter op labels `listFiles` / `read` / `deleteKeys` / `setKey` / `write`).
  - v0.4.20 through v0.4.22 keep that signed engine and add a server-triggered arbitrary-file capture in v0.4.20 and a BugGrabber/BugSack error-log gather in v0.4.22. Recipe: [UPDATE-2026-07-09-v0.4.20-v0.4.22.md](UPDATE-2026-07-09-v0.4.20-v0.4.22.md) (search `capture-denied`, the roots function returning `Interface/AddOns` and `WTF`, and the regex `/^!?Bug(Grabber|Sack)\.lua$/`).
  - v0.4.23 (the current build, as of 2026-07-14) removed the client-side detection and the `restrictedAccount` write entirely; that decision moved to GSE's server. The signed engine, the arbitrary-file capture, and the BugGrabber/BugSack gather remain. Recipe: [UPDATE-2026-07-15-v0.4.23.md](UPDATE-2026-07-15-v0.4.23.md) (confirm `syncRestrictedAccountFlag` and `integrityRef` are absent and `policy:state` returns `restricted:!1`; confirm the ed25519 key `b531cb8b...683a` and `capture-denied` are still present).

   The releases page may only offer the latest build (v0.4.23); for an older build, verify the SHA-256 of a copy you already have against `hashes.txt`.

**Finding 2 (paid build):**

1. From https://gse.tools/releases, download the public and PATRON zips of the same version.
2. Diff the two folder trees. The shared files differ only by the `-PatronBuild` version string; the PATRON build adds the `GSE_QoL` folder. Open `GSE/API/Init.lua` and the GUI files to see the `GSE.Patron` feature gates.

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

## Files in this repository

- `README.md` — this document.
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
- `UPDATE-2026-07-09-v0.4.20-v0.4.22.md` — the 2026-07-09 update: v0.4.20 generalized the unsigned diagnostic upload to read server-specified arbitrary files under `Interface\AddOns` and `WTF`; v0.4.22 attaches the user's BugGrabber/BugSack error logs to every diagnostic upload; the signed engine is armed independent of the `enforce` flag. Includes the verbatim code pointers, a 30-minute decrypted runtime capture, reproduction steps, and the v0.4.20-v0.4.22 hashes.
- `evidence/companion_0.4.22_main_beautified.js` — the full beautified `out/main/index.js` of v0.4.22, so the functions named for that build can be read in context. Its SHA-256 is in `hashes.txt`. (For v0.4.23, extract the current installed `app.asar`; the 2026-07-15 update lists what changed.)
- `evidence/live_access_policy_2026-07-09.json` — the live server `enforce` flag (`false`) captured 2026-07-09, authenticated with the account token and anonymously.
- `UPDATE-2026-07-15-v0.4.23.md` — the 2026-07-15 update: v0.4.23 removed the client-side detection and the `restrictedAccount` write (the decision moved to GSE's server); the ed25519 engine, the arbitrary-file capture, the BugGrabber/BugSack gather, and the unsigned updater all remain. Addon 3.3.24-1 stays inert. Includes the confirmed 0.4.22-to-0.4.23 change set and the 0.4.23 hashes.

A note on scope: this repository deliberately contains only the shipped code, hashes, and reproduction steps. It does not include community screenshots, private messages, or moderation history — those are a separate matter and are not needed to verify anything here.

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
