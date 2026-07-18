# The in-game addon: no competitor targeting, and the in-game Patreon question

**Published:** 2026-07-18. Builds at time of writing: GSE addon **3.3.25** (free) and **3.3.25-PatronBuild** (patron), read from `GSE/GSE.toc` inside each zip, not from the filename. Companion cross-reference is **v0.4.26**. Hashes in `hashes.txt`.
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP-EMS.

Until now this repository has documented the desktop Companion, plus one addon change (the sequence lock-out). This covers the rest of the in-game addon: what it targets (nothing of mine), the one real security weakness it carries, how it verifies platform-signed sequences, what it reports, and the in-game links it ships. Same rule as the rest of the repo: every claim is a line you can open in the two public zips. I am a competitor, so read the file and ignore my framing. Where a claim is about intent rather than code, it is marked INFERRED. None of this is new in 3.3.25; it is pre-existing behaviour earlier passes did not write up.

## The addon does not target GRIP-EMS, or any competitor

I will lead with the part that runs against my own interest, because it is the clearest. The in-game addon contains none of the competitor machinery this repository documents in the Companion. Scanned across both the free and patron 3.3.25 trees, every `.lua` file: zero hits for `restrictedAccount`, `GRIP-EMS`, `provenanceSource`, `gse-legacy`, `detectGrip`, or `purgeGrip`. The only `grip` strings in the whole addon are five resize-grip UI comments. There is no `io.open`, `os.execute`, `C_FileSystem`, `dofile`, or `RunScript` anywhere in GSE's own code. The detection, account-flagging, and deletion subsystem lives only in the desktop app; the addon is clean of it, and has been in every addon audit I have run. If you remember one thing about the in-game addon, remember that.

## The one real weakness: it runs imported sequence code with full access

GSE's "variable" feature lets a sequence carry Lua that the addon compiles and runs. The compile environment is `GSE/API/Storage.lua` line 16:

```
local gseEvalEnv = setmetatable({GSE = GSE}, {__index = _G})
```

The `__index = _G` fallthrough hands that compiled code the full WoW global table, not a restricted sandbox, and the addon `setfenv`s each compiled chunk into it. So a sequence you paste, receive from another player over the addon's peer-to-peer channel, or accept from the Companion can carry Lua that runs with full addon-level access. WoW's own client sandbox still applies (no operating-system access, no sockets), but inside the game that is enough to read or overwrite any addon's saved data, send messages as you, or disconnect you. Two details matter: `Storage.lua` compiles and calls some stored variables at sequence-load time, not only on a keypress; and a sequence received peer-to-peer is stored without a confirmation prompt.

This is not planted malware and I am not calling it that. It is a longstanding design property of GSE's variable feature and it predates this dispute. I am not publishing an exploit, and there is no single line to "fix": it is how the feature works. I am flagging it because gse.tools and the Companion can now deliver sequence content automatically, which widens who can hand you one, and because it is the single most important thing any macro tool has to handle safely when importing GSE sequences. I say how GRIP-EMS handles it at the end.

## It verifies platform-signed sequences with the same key the Companion uses

The addon ships a pure-Lua Ed25519 verifier, `GSE/API/ed25519verify.lua` (`GSE_Ed25519Verify` at line 358), and calls it from `GSE/API/Checksum.lua`. A v2 sequence checksum is an Ed25519 signature, verified against a hard-coded "Platform" public key (`Checksum.lua` line 149):

```
-- Public key hex: b531cb8b505ae9752b5b789f26085853b0ba5da5d7e7e244975f0545430d683a
```

That is byte-for-byte the same 64-character key the desktop Companion embeds for its signed command engine (`out/main/index.js`, `const Oo = "b531cb8b...683a"`). So gse.tools holds one signing keypair, and its public half is built into both the in-game addon and the desktop app.

It is a provenance badge, not a gate. If the verifier is absent the check returns `no_checksum` and the import proceeds (`Checksum.lua` line 223); an unsigned or tampered sequence is never blocked, deleted, or restricted. In the patron build only, `GSE_QoL/QoL.lua` (line 152, `onSequenceSaved`) stamps a checksum into every sequence on save; the free build stamps only on export, and `onSequenceSaved` is absent from the free zip.

## What it reports: opt-in telemetry and an opt-in error-log upload

Two data paths, both off unless you turn them on.

- WagoAnalytics. `GSE/Lib/WagoAnalytics/Shim.lua` is a stub. It reports only if you already run Wago's analytics library (bundled with the Wago app and some addon managers); with the library absent every call is a no-op. When active it sends booleans and counters (init timings, minimap state, a Patron flag, and a used sequence's name and class), no macro contents and no account name. The patron module re-asserts the Patron flag to Wago (`QoL.lua`, `Switch("Patron", true)`), so patron installs stay distinguishable in analytics even though the old `GSE.Patron` gate is gone.
- Error logs. Build 3.3.25 adds a support-report checkbox, `GSE_Options/Support.lua`: "Include my BugSack / BugGrabber error logs (recommended if you are seeing in-game errors)". It ships unticked, `errorLogsCheck:SetValue(false)` (line 64), and only a ticked box sets `includeErrorLogs` in the report payload (line 91). It is in both the free and patron builds. This is the in-game half of the Companion's 0.4.22 BugGrabber/BugSack error-log gather; the addon toggle is user-driven and default-off. The coupling to the Companion is INFERRED, from matching names and timing, not from any shared code in the addon.

## The in-game links it ships

The free build hard-codes a Patreon link and a supporters panel. Facts first; the policy reading is the next section.

- Patreon link. `GSE_GUI/Editor_Tree.lua`, the `RESOURCE_LINKS` table, sixth entry (free build, line 100): `title = "GSE Addon Patreon"`, `url = "https://www.patreon.com/TimothyLuke"`, with `icon = Statics.Icons.Patreon`. It renders as an icon, a copyable URL box, and a Copy button. `Statics.Icons.Patreon` (`GSE/API/Statics.lua`) points at a shipped `patreon.png` asset, so the addon carries the Patreon brand mark. The popup opens two ways: the editor's Resources button, and Blizzard Settings > AddOns > GSE > About > "GSE: Resources". `Editor_Tree.lua` is byte-identical in the free and patron zips, so every user gets it.
- Supporters block. `GSE_Options/Options.lua` line 2039, on the About page: a "Supporters" header, the line "The following people donate monthly via Patreon for the ongoing maintenance and development of GSE. Their support is greatly appreciated.", and a list of roughly 250 names. The description is localised into every shipped locale.
- Companion on-ramp. `GSE/Localization/ModL_enUS.lua` carries a What's New block promoting the desktop app: "Download the Companion at gse.tools ... keep it enabled." It is the in-game funnel to the app this repository documents. The addon text markets sync and install convenience; it does not itself detect or delete anything (INFERRED tie to the Companion's behaviour).
- Format funnel. Old-format sequences are refused in-game with "Upload it to https://gse.tools to update it ..." (`Storage.lua` lines 149 and 197). A step that used to be local now routes through the web platform.

## Blizzard add-on policy points 4 and 5

This is a reading of published policy text against shipped code. I am not a lawyer and it is not a ruling. The two points that speak to an in-game surface have not been examined before in this repository; earlier passes argued points 1 and 2. None of it is new in 3.3.25 (`Editor_Tree.lua` and `Options.lua` are unchanged from 3.3.24-2).

The policy text (Blizzard UI Add-On Development Policy, linked in the README references, retrieved 2026-07-17):

> 4) Add-ons may not include advertisements. Add-ons may not be used to advertise any goods or services.

> 5) Add-ons may not solicit donations. Add-ons may not include requests for donations. We recognize the immense amount of effort and resources that go into developing an add-on; however, such requests should be limited to the add-on website or distribution site and should not appear in the game.

Point 5 is the closer fit. Its first sentence is flat: add-ons may not include requests for donations. The sentence after it says where such requests belong, the website or distribution site, not the game. The free client ships a copyable link to `patreon.com/TimothyLuke` carrying the Patreon brand mark, and an About page that reads, top to bottom, a Resources button that opens that link, a "Supporters" header, and "The following people donate monthly via Patreon ... their support is greatly appreciated" over 250 names. Read as one screen, that is the thing the sentence describes as belonging on the website.

The counter-readings, up front: the second sentence of point 5 uses "should", not the "must" that points 1 and 2 use, so it reads partly as guidance; a supporters list is an acknowledgement, not by itself a request; and this is near-universal and visibly unenforced, with a reply on Blizzard's own policy thread dated 2026-06-28 asking "this is 90% of the biggest addons though", unanswered. Those are real. What they do not dissolve is the first sentence, or the composition of the About page read together.

Point 4 is weaker, and I will keep it modest. The argument is that the in-game link points at a Patreon, and the Patreon is where the patron build of `GSE_QoL` is distributed, so the client advertises a service. But the code in that patron module is free public source on GitHub, which this repository retracted its own "paywall" claim about on 2026-07-17, so the Patreon sells a convenience bundle of free code, not access. That makes point 4 a weak reading and I am marking it weak rather than dressing it up. The `Oak - YouTube` row in the same table is third-party promotion, which point 4 also touches, and is the cleaner point-4 item.

Points 2 and 7 are deliberately not argued. Point 2 (code must be visible) and point 7 (must abide by the ToU and EULA) both reach GRIP-EMS in the same words: EMS's own source is not public either, and any "a sequencer facilitates gameplay" theory catches EMS and Blizzard's own `/castsequence` alike. Raising them against GSE would be special pleading, so I do not.

### The glass-house: does GRIP-EMS do this?

Asked and answered before it is asked back. On its own surface, EMS is clean. Every external link EMS opens in-game is its own guide, its community Discord, or an accessibility reference (`GRIP/EMS/UI/SettingsPanel.lua`, the `SP_showURL` sites): the grip-ems-guide page, `discord.gg/temptingus`, `accessible.games`, and `gameaccessibilityguidelines.com`. No Patreon, no donation link, no supporters list, nothing of the kind. Scanned across the whole EMS source, the only donation words that appear at all are inside captured sequence data, never in EMS's own code.

There is one real exposure, and I will state it before it is raised at me. EMS renders the description field of an imported sequence (`UI/SequenceEditor.lua` line 5441, `SetText(seqData.description or "")`), and third-party sequence authors put donation solicitations in that field. Captured examples in my own research data carry a third-party author's Patreon, PayPal, and Ko-fi links, redacted here because they are that author's and not mine. So EMS does display donation solicitations in-game.

The distinction is real, without the defensiveness:

| | GSE | GRIP-EMS |
|---|---|---|
| Whose ask | GSE's own, for its author | a third party's, for that sequence's author |
| Where from | hard-coded in the shipped addon | user-imported content the user chose to add |
| Curated by the addon | yes, a fixed link table | no, arbitrary text in a metadata field |
| Removable by the user | no | yes, it is their sequence |
| Ships to every install | yes | no, only if that sequence is imported |

An addon that renders user-supplied text is not "including a request for donations" the way an addon that ships a hard-coded link to its author's Patreon is. That distinction holds, but it is a distinction, not immunity, and it holds only while EMS does not itself curate, promote, or ship such links. I am writing it down as a standing constraint, not improvising it later.

## Two release-mechanics footnotes

Neither bears on behaviour; recorded so the account is complete.

- 3.3.22-dev to 3.3.23 was a pure re-stamp. Diffed file by file, 166 files each side: nothing added, nothing removed, seven files changed, and those seven are six `.toc` version strings and one CHANGELOG heading. Every `.lua` is byte-identical. The release that carried a version bump carried no code change.
- release.json, 3.3.25 patron only. The patron zip adds one file the free zip does not: `release.json`, a BigWigs/CurseForge packager manifest that names the free zip `GSE-3.3.25.zip` with its interface numbers. It is a packaging byproduct, not runtime code.

## How to verify

1. Get the free and patron 3.3.25 zips from gse.tools (the free build is also on CurseForge). Read the version from `GSE/GSE.toc` inside each, not the filename: `3.3.25` and `3.3.25-PatronBuild`.
2. No targeting: grep both trees' `.lua` for `restrictedAccount`, `GRIP-EMS`, `provenanceSource`, `gse-legacy`. Zero hits. Grep `grip` as a control and you get a handful of resize-grip UI comments.
3. Imported-code environment: open `GSE/API/Storage.lua` at line 16 and read `gseEvalEnv = setmetatable({GSE = GSE}, {__index = _G})`.
4. Provenance key: `GSE/API/Checksum.lua`, the `b531cb8b...683a` public-key line, and compare it to `const Oo` in the Companion's beautified `out/main/index.js`.
5. In-game links: `GSE_GUI/Editor_Tree.lua` `RESOURCE_LINKS` (the Patreon entry), and `GSE_Options/Options.lua` around the `L["Supporters"]` block.
6. Error-log toggle: `GSE_Options/Support.lua`, the `errorLogsCheck` checkbox and its `SetValue(false)` default.
7. Policy text: the Blizzard UI Add-On Development Policy, linked in the README references.

## Scope

Every claim above is a static read of the two public addon zips, plus one cross-reference to the Companion build this repository already documents. The policy section is a reading of published text against that code, with the counter-readings included, not a determination; Blizzard decides what its policy means and whether to act on it. There are no in-game screenshots here: the rendering is inferred from the widget construction, and a screenshot pass would make the About-page composition concrete without changing what the code says.
