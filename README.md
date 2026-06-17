# Undisclosed competitor-addon detection, account flagging, and remote-triggered data deletion in the GSE Companion application

> **Independently re-verified 2026-06-12.** Every SHA-256 below was recomputed against the files on disk and matched; every function name and constant quoted in this document was confirmed present in the current shipped `app.asar` (build hash `209aded…b0f`). The extracted code region is included in this repo at [`evidence/app_asar_grip_region.js`](evidence/app_asar_grip_region.js) so you can read the real file rather than trust the quotes.
>
> **Re-verified 2026-06-16:** GSE Companion v0.4.12 is still the current release on gse.tools/releases, and the GSE addon's current CurseForge file is 3.3.22 (uploaded 2026-06-16). All four SHA-256 hashes below still match the files on disk.
>
> **Re-checked 2026-06-17 against the next release:** GSE shipped Companion v0.4.13 and addon 3.3.22-1. Both were diffed statically, without installing. The access-policy detection, account-flagging, and `purgeGripCharSequences` deletion code is byte-identical in 0.4.13 — the only code change in the entire app is one unrelated line in the bridge-queue pruning (`pruneBridgeData`), plus the version string. The addon update was an interface-version bump ("#1914 TOC Updates") with no GRIP-EMS-related change. The 0.4.13 hashes are listed below.

**Published:** 2026-06-12
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)
**Subject software:** GSE Companion v0.4.12 (desktop app), distributed from https://gse.tools/releases
**Related project:** GSE: Sequences, Variables, Macros (GnomeSequencer-Enhanced), a World of Warcraft addon

---

## Read this first: who I am and how to treat this document

I am the author of GRIP-EMS, a free World of Warcraft macro addon. The software described below is built by GSE, a competing project, and the behavior it contains is aimed at my addon specifically.

I am a competitor. You should not take my word for anything. This document is written so you do not have to: every claim is a quoted line from a shipped file, and the steps to reproduce all of it from the public download are at the bottom. Verify it yourself and ignore my framing.

## One-paragraph summary

The GSE Companion is a desktop application that GSE distributes as a tool to "sync" macro sequences to the GSE addon. The shipped application also contains an "access-policy" subsystem that, on login and then every ten minutes: (1) scans every installed World of Warcraft client's SavedVariables for the save file of my addon, `GRIP-EMS.lua`; (2) reports whether my addon is present to GSE's backend and sets a `restrictedAccount` flag on the signed-in user's GSE account; and (3) carries a routine, `purgeGripCharSequences`, that opens my addon's per-character save file and deletes sequences from it, gated behind a server-controlled switch. None of this is described in the Companion's documentation, which presents the app only as a sequence sync tool.

## What the application is

GSE Companion is an Electron desktop app. Electron apps store their JavaScript in a `resources/app.asar` archive, which is plain text once extracted — there is no decompilation involved. Everything below is quoted from that file in the installed application. Lines beginning with `//` in plain English are my annotations; the code lines are verbatim.

## Finding 1 — detection, reporting, and conditional deletion of a competitor's data

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

The free GSE addon hosted on CurseForge (current file 3.3.22) links to the Companion and walks users through installing it, even though the store listing does not mention it. In the shipped free build:

- `GSE_GUI/Editor_Tree.lua` — a clickable in-game link to `https://gse.tools`, the site that distributes the Companion.
- `GSE/Localization/ModL_enUS.lua` — in-game text reading: "Download the Companion at gse.tools. Once installed, a small bridge addon (GSE Companion Bridge) appears in your addon list — keep it enabled."
- `GSE_Options/Options.lua` — a "Companion App" settings panel (Auto-Accept Companion Updates, Sync WoW Macros to GSE.Tools).

These strings are byte-identical between the free and PATRON builds. The in-game addon is what points users to the desktop application described above.

## What I am not claiming

I am being deliberately precise about the limits of this finding:

- The detection and the account-flagging run unconditionally whenever a user is signed into the Companion. This is in the shipped code and runs today.
- The deletion is gated behind the server-side `enforce` flag. Its current value is set by GSE and cannot be observed from the client. I am **not** claiming the deletion is currently switched on for any user.
- What I am stating is narrow and verifiable: the distributed application, today, contains code that detects a competitor's save file, reports its presence to a server, flags the user's account, and carries a remote-triggered routine to delete that competitor's data. Whether the final switch is currently flipped is the only part not visible from the client.

## Finding 2 (secondary) — paid "PATRON" build of the addon

GSE ships a separate "PATRON" build alongside the public build on https://gse.tools/releases. Comparing the public and PATRON builds of the same version (`3.3.20-9-gd5e65ce`):

- The files present in both builds are byte-identical except for one line: the PATRON `.toc` version string ends in `-PatronBuild`.
- `GSE/API/Init.lua` contains: `if GSE.VersionString:find("Patron") then GSE.Patron = true end`.
- That flag gates features compiled into both builds: raw macro editing, multi-window editing, tab-completion of variables and sequences, click-timing configuration, and advanced export. The PATRON zip additionally ships a `GSE_QoL` module (native icon picker, Skyriding keybind bar, on-save checksum stamper).

For accuracy: CurseForge hosts only the free GSE build; the PATRON build is distributed off-CurseForge via gse.tools. Blizzard's UI Add-On Development Policy, point 1, states that all add-ons must be distributed free of charge and that developers may not create premium versions with additional for-pay features. A paid build of the addon itself, with feature gates, is the category that policy addresses.

Re-verified on the current build (3.3.22, 2026-06-16): the public and PATRON trees are identical except for the version strings in the `.toc` files and the patron-only `GSE_QoL` module. Per the developer's own Patreon, the PATRON build is "role locked so it's only available for Patrons."

## How to verify all of this yourself

**Finding 1 (Companion):**

1. Download GSE Companion from https://gse.tools/releases and install it.
2. Open `%LOCALAPPDATA%\Programs\gse-companion\resources\app.asar`. It is an asar archive; extract it with `npx asar extract app.asar out`, or read it directly with any text editor or a `strings` tool.
3. Search the contents for: `detectGripEmsAcrossClients`, `syncRestrictedAccountFlag`, `purgeGripCharSequences`, `GRIP-EMS.lua`, `GRIP_EMS_CHAR`, `access-policy`.
4. Confirm the constants and the `runAccessPolicyCheck` flow shown above.

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

A note on scope: this repository deliberately contains only the shipped code, hashes, and reproduction steps. It does not include community screenshots, private messages, or moderation history — those are a separate matter and are not needed to verify anything here.

## References

- GSE Companion and addon releases: https://gse.tools/releases
- GSE Companion FAQ (states the "sync" purpose only): https://gse.tools/help/faq
- GSE on CurseForge: https://www.curseforge.com/wow/addons/gse-gnome-sequencer-enhanced-advanced-macros
- GRIP-EMS on CurseForge: https://www.curseforge.com/wow/addons/grip-enhanced-macro-sequencer
- Blizzard UI Add-On Development Policy: https://us.forums.blizzard.com/en/wow/t/ui-add-on-development-policy/24534
- CurseForge moderation policies: https://support.curseforge.com/support/solutions/articles/9000197279-project-and-modpack-moderation-policies
- Archived copies of the pages cited here: https://archive.org/details/@jesper_driessen/web-archive
- Where this finding is being discussed: https://www.reddit.com/r/WowUI/comments/1u3z6cs/ and https://www.reddit.com/r/wowaddons/comments/1u3z5j7/
