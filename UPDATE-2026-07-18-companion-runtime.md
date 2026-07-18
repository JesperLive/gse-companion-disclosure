# The Companion at runtime: a clean stock-Electron shell and no deletion on my own machine

**Published:** 2026-07-18. Current build: Companion **v0.4.26**. The runtime captures below were taken on the builds that were live at the time: the molecular teardown and the Process Monitor session on v0.4.18 (2026-06-22), and the live account captures on the builds current between 2026-06-20 (v0.4.14) and 2026-07-17 (v0.4.24). Hashes are in `hashes.txt`.
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP-EMS.

The rest of this repository reads shipped code: what the app can do, from the file on disk. This one is the other half. It is what the app did when I ran it, watched on my own machine over my own account, read-only. Same rule at the bottom of the page: the steps to reproduce are there, and you should ignore my framing and run them, because I am a competitor.

Most of what follows runs in GSE's favour, and I am stating it plainly because that is the rule this repository holds itself to. The binary is a clean stock Electron shell. The server switch that gated the old deletion path has read off in every capture I have taken. And on my own machine, with the deletion targets sitting on disk and the app live, nothing of mine was touched. This is a record of capability, not of conduct, and none of it is an allegation that anything has been done.

## The binary is stock Electron, byte for byte

The v0.4.14 audit already in this repository treated the runtime files as the stock Electron distribution "by name and version" and hashed them, but said plainly they were "not individually reverse-engineered or compared to official Electron release hashes." This closes that gap.

The app reports Electron 32.3.3 / Chromium 128.0.6613.186 / Node 20.18.1, read from the version strings embedded in `GSE Companion.exe`. I downloaded the official `electron-v32.3.3-win32-x64.zip` from the `github.com/electron/electron` release and byte-compared every file present in both trees:

- 14 of 14 framework and Chromium-resource files are byte-identical by SHA-256 (the `.pak` bundles, `icudtl.dat`, `ffmpeg.dll`, `libEGL.dll`, `libGLESv2.dll`, the V8 snapshots, `vulkan-1.dll`, `d3dcompiler_47.dll`, `LICENSES.chromium.html`).
- 55 of 55 locale `.pak` files are byte-identical.
- The only file that differs is the launcher, `GSE Companion.exe` (186,424,320 bytes against upstream `electron.exe`'s 186,328,576, a delta of +95,744 bytes). That delta is the standard electron-builder branding of a stock `electron.exe`: the app icon, the version resource (CompanyName TimothyLuke, ProductVersion 0.4.18.0), the rename, and the Electron fuse flips, all at their out-of-the-box values. It is resource-section sized. There is no basis to infer any change to the code section.

A strings sweep of the native binaries backs this up: zero hits for `gse.tools`, `qik.dev`, `GRIP-EMS`, `tweetnacl`, the ed25519 key, `restrictedAccount`, or any embedded URL, in `GSE Companion.exe` or any bundled native helper. (One trap worth flagging for anyone reproducing it: Sysinternals `strings` emits UTF-16 to a pipe, so a first `strings | findstr` pass reports a false "no match"; the result above is the re-run with an encoding-correct matcher.) Every GSE-specific line — the detection, the flag, the signed engine — lives in the interpreted `app.asar` JavaScript that the rest of this repository quotes, not in compiled code. So the "is the runtime itself trojaned" question closes with a negative. It changes none of the static findings; it removes one thing you would otherwise have to take on trust.

The version, throughout, is read from `package.json` inside the archive, not from the installer filename — the same rule this repository adopted after an installer named `0.4.17` turned out to declare `0.4.18` inside.

## What it does when it runs: it watches my addon and touches nothing

This is OBSERVED: a whole-system Process Monitor capture on my own machine, across a full WoW session on 2026-06-22, plus a 15-minute idle tail with the Companion left running and signed in. I picked the most awkward possible conditions for the "it is dormant" reading: in-game I deleted all my EMS sequences and ran EMS's own GSE-to-EMS migrate, so `GRIP-EMS.lua` was rewritten from scratch while the Companion watched, and then I closed WoW.

Across 21 million parsed events, with the Companion's own events fully resolved:

- The Companion has `GRIP-EMS.lua` in view. Its SavedVariables directory watch stat'd it by name — 60 existence/attribute queries and 8 directory listings — as the migrate rewrote the file.
- It never read the contents: ReadFile 0, WriteFile 0, delete 0. It read and wrote only GSE's own files and its own files, spawned only `tasklist.exe` (to check whether WoW is running), and opened network connections only to GSE, Qik, and a CDN.

The most adversarial condition for the dormant-engine reading — my EMS data changing under an open, signed-in client — produced no action against it. One honest limit: about 3.8% of the captured events came from process indices the parser could not resolve, so I cannot rule out that some other process read `GRIP-EMS.lua`; but the Companion's own events resolved completely, and it did not read, write, or delete it.

## The one local weakness: the account tokens are in plaintext

This is OBSERVED in my own user-data folder, `%APPDATA%\gse-companion`. The app keeps its state in one file, `settings.json`, in plaintext: no encryption, no ACL hardening. That file holds the account access token (a JWT) and the session token in the clear. I have redacted the values and record only their lengths.

Any process running as you, any backup, or any infostealer that can read that file can impersonate the account until the tokens expire. This is a local-security weakness, it is not competitor-specific, and it affects every GSE user the same way. What that file does not hold is any targeting state: no `restrictedAccount`, no `integrityRef`, no `enforce` value, no report ids. That is consistent with the targeting flag living server-side, which the rest of this repository already establishes.

## It installs no way to run in the background

Also OBSERVED on my own machine: I enumerated the Run and RunOnce registry keys, the Startup folders, scheduled tasks, services, URL-protocol handlers, and file associations. There is no GSE entry in any of them. The footprint is an ordinary per-user Electron install: the program directory, the user-data folder, one uninstall entry, and the two Start-menu and desktop shortcuts. No autostart, no service, no scheduled trigger, no custom protocol handler.

The app runs only when you open it. That matches the runtime finding above: it cannot act unless it is running, and nothing makes it run on its own.

## The switch has never been set

The old deletion path was gated by one server flag: a GET to `api.gse.tools/settings/access-policy`, reading the `enforce` field. This is OBSERVED on my own account, across six captures spanning nearly four weeks:

| Date | enforce | updatedAt | Notes |
|---|---|---|---|
| 2026-06-20 | false | null | |
| 2026-06-21 | false | null | polled 5 times over ~31 min, identical each time |
| 2026-06-22 | false | null | authenticated response byte-identical to anonymous |
| 2026-07-09 | false | null | authenticated == anonymous |
| 2026-07-15 | false | null | |
| 2026-07-17 | false | null | polled 4 times over ~30 min, identical each time |

`enforce` reads `false` every time, and `updatedAt` is `null` every time, which means the flag has not been set since the record began. On the dates where I checked both with and without my account token, the authenticated response for my signed-in, GRIP-EMS-present account is byte-identical to the anonymous one: no `integrityRef`, no `restrictedAccount`, no directive is served to either. Three of these six captures are in the repository already, as `evidence/live_access_policy_2026-06-20.json`, `-06-21`, and `-07-09`; the other three are recorded in the build updates for 06-22, 07-15, and 07-17.

Two limits, stated not buried. `enforce:false` switches off only the retired hard-coded purge and a UI button-disable; it does not gate the ed25519-signed file-modification engine, which is authorized by a signature rather than by this flag (see the v0.4.15/v0.4.16 update). And what GSE's server does with `enforce`, or when it might be flipped, cannot be read from the client. That is inference from what I can observe, not fact.

## Capability, not conduct: nothing of mine was deleted

This is the sharpest observation, and it runs in GSE's favour, so it goes at the front of its own section. On 2026-06-20, on my own machine, with the Companion live and signed in and the deletion targets present on disk, I took a hash baseline and then re-checked every GRIP-EMS SavedVariables file. Every one was byte-identical — SHA-256, size, and modification time — to the baseline. No EMS SavedVariables file was edited or deleted. The Companion had been running before WoW closed and stayed running after, so it had the full window, and it wrote only its own files.

The capability is real and it is armed. The deletion targets are on disk, the account is one the flag can be set on, and the Companion runs on its timer. The only thing between those sequences and deletion is that server flag, which reads `false`. Present and armed, not fired.

There is a tight loop worth stating in the aggregate. Of the seven sequences the deletion routine would target on one of my characters, five are the same sequences the Companion pushed to that account through its own incoming sync queue. So the sequences GSE syncs onto an account are, in part, exactly the ones its kill-switch is written to remove. I am stating that as a count, not a list: the sequence names, the character detail, and the raw capture are personal data, and they sit in the private regulator filing, not here.

One transparency point, which this repository already records in the aggregate and I will only restate: whether an account carries the `restrictedAccount` flag is decided and held server-side, and it is not shown to the account holder anywhere in the gse.tools interface. A signed-in session cannot see its own flag state. That holds independently of the flag being off right now.

## What this batch does and does not mean

- It does not allege a deletion, an upload, or any action against anyone. The opposite: in every capture I took, the flag was off and my EMS data was untouched. This is a record of what the app can do and what it did on my machine, not a claim that it did anything to anyone.
- The runtime binary is clean stock Electron, and the behaviour I could watch on my own machine was benign. What remains is the capability that ships in the code, documented in the other updates, plus the server side, which no one outside GSE can inspect.
- Everything marked OBSERVED here is my own account on my own machine, read-only. I did not touch another account, probe GSE's server, or call any write, report, or state-changing endpoint. The raw 2026-06-20 forensic capture carries my own personal data — characters, sequence names, tokens — and is held for the private regulator filing rather than published here.

## How to verify this yourself

1. Provenance. Download GSE Companion from https://gse.tools/releases, and download `electron-v32.3.3-win32-x64.zip` from `github.com/electron/electron/releases`. Under the Companion's `resources`, compare the framework DLLs, `.pak` and `.dat` bundles, the V8 snapshots, and `locales\*.pak` against the same files in the Electron zip by SHA-256; they match. Only `GSE Companion.exe` differs, by branding. Read the Electron / Chromium / Node version triple from the strings in `GSE Companion.exe`, using an encoding-correct string dump rather than `strings | findstr`.
2. Runtime behaviour. Run the Companion signed in with WoW open, capture with Process Monitor filtered to the Companion process, and watch its operations on `GRIP-EMS.lua`: metadata queries (QueryOpen, QueryDirectory) appear, and no ReadFile, WriteFile, or delete.
3. The flag. `GET https://api.gse.tools/settings/access-policy`, with and without your account bearer token. It returns `{"enforce":false,"updatedAt":null,...}` and the two responses are identical. Three of the six captures are in `evidence/live_access_policy_*.json`.
4. The tokens. Open `%APPDATA%\gse-companion\settings.json` and confirm the access and session tokens are stored in plaintext.
5. The footprint. Check the HKCU and HKLM `Run` keys, the Startup folders, scheduled tasks, and services: no GSE entry. The app starts only when you launch it.

## Scope

Two kinds of claim here, each labelled. The Electron provenance is a static comparison of two public downloads and sits inside this repository's existing static-read scope. Everything else — the Process Monitor runtime behaviour, the plaintext-token storage, the install footprint, the six `enforce` captures, and the no-deletion tamper check — is OBSERVED: watched on my own machine over my own authenticated, read-only session, and labelled OBSERVED per section. Nothing here rests on access to any other account or any admin surface. The raw forensic capture from 2026-06-20 contains my own personal data (characters, sequence names, account tokens) and is not published here; it is part of the private regulator filing. There are no screenshots.
