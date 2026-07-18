# The Companion's server-control surface: the updater outranks the competitor machinery, and the website cannot drive the app

**Published:** 2026-07-18. Current build at time of writing: Companion **v0.4.26** (`out/main/index.js` SHA-256 `db3f8f5c1d747d05c701cfb0e05538a065c90fbf14d51535b6e3ca882f53b7e3`, 136,850 bytes, the copy this document quotes).
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP-EMS.

This follows the v0.4.24 update, which first put it plainly: ranked by blast radius, the most powerful thing GSE's server can make the Companion do is not the competitor-targeting machinery. It is the auto-updater, and the updater is the one server-driven path with no check of any kind. This document reads that surface against the current build, line by line, and states one clean negative on the way: the website cannot drive the app.

Same rule as the rest of this repository. Every claim is a line you can read in a shipped file, and the steps to reproduce are at the bottom. I am a competitor, so ignore my framing and read the file. This is a description of capability, not conduct, and it is not an allegation that anything has been done.

## The updater is the largest capability, and it verifies nothing

The Companion updates itself. The check asks GSE's backing store (`api.qik.dev`) for the latest release record on your channel, the app downloads an installer whose id the server supplies, and on Windows it runs that installer silently and quits. Read in the current build (the minified names are this build's; search for the strings, not the names):

- The download (in v0.4.26, `Ps`; search `[updater] downloading`). It builds the URL `<host>/file/<id>`, where `<id>` is the `_id` from the server's release record, does a bare `fetch(s)`, checks only `response.ok`, and streams the bytes to a temp file. There is no signature check, no hash comparison, no publisher or Authenticode check, and no expected-size or digest field read. The one header it reads, `content-length`, feeds the progress bar and is compared to nothing.
- The asset selection (`Es`; search `fileWin`). It reads `data.fileWin` / `fileMac` / `fileLinux` and nothing else. No digest, hash, size, or signature is even pulled off the record.
- The apply (`vs`; search `--force-run`). On Windows it spawns the downloaded file with `["/S", "--force-run"]`, detached, then quits the app a second later. `/S` is the NSIS silent-install switch. Whatever bytes came back for that id run silently, with your privileges.

The contract is: the server names a file id, the app fetches those bytes and executes them. Nothing in between checks what they are.

Three things make that wider than it first looks.

Auto-apply is the shipped default. The defaults object sets `autoApplyUpdates: true` (search `autoApplyUpdates`), and the gate disables it only on an explicit `false` in `settings.json`, so a user who never touched the setting auto-installs. GSE's own comment above the default says the opt-out is there so users can "vet each update first", and vetting is the only defence, because the client verifies nothing. It ships off.

The server can trigger it on demand. Besides startup and a four-hour timer, an HTTP 426 on any ordinary sync response runs the release check out of band (search `426`), which flows straight into download and auto-apply. The server does not have to wait for the timer.

It does not need you signed in. At startup the release check and its timer run in a comma-sequenced expression that sits outside the `if (userSession)` group (search `no session — waiting for login` and read that line), and the download itself is a bare unauthenticated `fetch`. Every other server-driven path in the app gates on a token. The updater is the one that does not, so it reaches every install on the channel, signed in or not.

## The asymmetry

| Capability | Maximum effect | What checks it |
|---|---|---|
| Signed engine (`t.task`) | rewrite a key inside a `GSE*.lua` file | ed25519 signature, embedded key, expiry, optional target persona, WoW closed, and a `/^GSE.*\.lua$/i` basename guard |
| Updater | run an arbitrary installer as you | nothing |

A directive to delete one key from a Lua table is cryptographically signed and guarded five ways. The installer that runs as you is verified by nothing. The strongest capability has the weakest check, and that is the finding. (The arbitrary-file capture that used to sit between these two was removed in v0.4.26; see that update.)

## The website cannot drive the app

The obvious worry with a desktop app tied to a website is that the site can reach into the app. Here it cannot. The packaged build loads a local file, not gse.tools (search `loadFile` and read the window-creation call: `ELECTRON_RENDERER_URL` is the electron-vite dev-server variable, unset in a packaged build, so it falls through to `loadFile(... index.html)`). The window is created with `contextIsolation: true` and `nodeIntegration: false`. `sandbox: false` gives the preload Node access, which is ordinary for a preload bridge and is not reachable from remote content, because there is no remote content.

So gse.tools is never loaded into a window and has no path into the app. The exposure is the API and the updater, not the site. I am stating it because it is the one place the obvious worry does not hold up, and leaving it out would be the dishonest kind of omission.

Two caveats, stated not buried. `ELECTRON_RENDERER_URL` is read from the environment, so anyone who can set that variable could point the renderer elsewhere, but that is a local attacker who already has your account, not a server capability. And `shell:open-external` opens an arbitrary URL with no allowlist (search `shell:open-external`); it is renderer-to-main IPC from local content, so it only matters chained behind a renderer compromise.

## The server surface the client talks to

For orientation, the endpoints the shipped client calls, read from its code. Two hosts: `api.gse.tools` (the app API) and `api.qik.dev` (the content backing store, and the updater file host). Each row is either OBSERVED against my own account, read-only, or a CAPABILITY that is present in the code and that I did not see fire.

| Endpoint | Host | Purpose (from client code) | Status |
|---|---|---|---|
| `/settings/access-policy` | gse.tools | read the `enforce` flag | OBSERVED: `enforce:false` in every capture |
| `/events/subscribe` (SSE) | gse.tools | open the push channel for `companion:request` | OBSERVED: connected; no directive seen |
| `/sync/incoming`, `/upsert`, `/my-content` | gse.tools | pull, push, list your own GSE content | OBSERVED: my own data |
| `/diagnostic/upload`, `/diagnostic/result`, `/report/submit` | gse.tools | upload gathered files, plan result, user report | CAPABILITY |
| `/content/{type}/list`, `/content/<id>`, `/user` | qik.dev | your own content and identity record | OBSERVED: my own record |
| `/file/<id>` | qik.dev | the unsigned updater download | CAPABILITY (the updater above) |

One note, deliberately not detailed here. A separate access-control observation on this platform was reported privately to the operator and to GSE on 2026-06-21, and it is recorded in [MODERATION-RECORD.md](MODERATION-RECORD.md) as a private report. It is not written up in this repository, because publishing the mechanics of an unfixed access-control issue would put users at risk, which is the opposite of the point. Everything in the table above is read from the client I downloaded. I did not fuzz routes, test other accounts, or probe for admin endpoints, because that crosses from reading my own client into attacking someone else's system, and as a competitor I will not do that.

## What this does and does not mean

- It does not mean anyone has done any of this. Across three instrumented captures (2026-07-09, 2026-07-15, 2026-07-17) the only updater traffic was the release-list check. Nothing unexpected was fetched, and nothing was spawned.
- It does not mean a random attacker can trivially use it. The channel is HTTPS to `api.qik.dev`, so a third party would need control of that host, its DNS, or a valid certificate for it. What the missing signature check removes is the second layer, the one that still protects you if the distribution host is compromised or misused. That is what code signing is for.
- It is not competitor-specific. This is a general property of the app, and it affects every GSE user equally, GSE's own included. I had it filed as an unrelated aside since v0.4.14, which was the wrong weighting.
- I am not publishing an exploitation path, and I did not probe GSE's server. Everything here is read from a client I downloaded and ran on my own machine.

If GSE signs its installers and checks the signature before running them, this finding goes away. That is the fix, and it is a normal one.

## How to verify this yourself

1. Download GSE Companion from https://gse.tools/releases and install it.
2. Open `%LOCALAPPDATA%\Programs\gse-companion\resources\app.asar` and extract it (`npx asar extract app.asar out`). The logic is `out/main/index.js`, minified onto a few lines; run it through any JavaScript beautifier to get line breaks.
3. Updater: search `--force-run`, `autoApplyUpdates`, and `[updater] downloading`. Read the download function the last string sits in, and confirm it does a bare `fetch` of `<host>/file/<id>` with no hash or signature check. Confirm `autoApplyUpdates` defaults to true and only an explicit false disables it. Search `426` for the on-demand trigger.
4. Website: search `loadFile` and read the window-creation call; confirm the packaged path is `loadFile(... index.html)`, and that `contextIsolation` is true and `nodeIntegration` is false.
5. Match the build: verify the SHA-256 of your `out/main/index.js` against `hashes.txt`. For v0.4.26 it is `db3f8f5c1d747d05c701cfb0e05538a065c90fbf14d51535b6e3ca882f53b7e3` (136,850 bytes). The `enforce:false` captures and the ed25519-signed engine are documented in the earlier updates.

## Scope

This document reads shipped code, the same rule the README sets. The updater and the window-creation checks are static reads of the distributed binary, so they sit inside the existing scope. The endpoint table adds one thing the README's static-only scope did not previously cover: a handful of rows marked OBSERVED, which come from watching the app talk to its server over my own authenticated, read-only session. That is a live observation of my own account, not a code read, and it is labelled as such per row. Nothing here rests on any access to another account or to any admin surface; the one access-control observation that exists was reported privately and is not detailed anywhere in this repository.
