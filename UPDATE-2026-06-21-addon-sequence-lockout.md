# Update 2026-06-21: the in-game GSE addon is walling its sequences off from other addons (a locked global, and a new ChaCha20-encrypted sequence format)

**Published:** 2026-06-21
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)
**Subject software:** the in-game GSE addon (GnomeSequencer-Enhanced / "GSE: Sequences, Variables, Macros"), build 3.3.22-12-gfb1946e-PatronBuild, World of Warcraft Retail patch 12.0.7
**Continues:** the 2026-06-12 disclosure (`README.md`) and the Companion updates of 2026-06-20 and 2026-06-21.

---

## Read this first

I am the author of GRIP-EMS, a competing World of Warcraft macro addon. Do not take my word for any of this. Every factual claim below is a line you can read in the shipped GSE addon, with the file and line range named, and the steps to reproduce are at the bottom. The earlier disclosures in this repository are about GSE's desktop Companion app. This one is about the in-game addon, and it is a different kind of change: not code that names my addon, but changes that make GSE's own sequence data unreadable to any third-party addon, mine included.

## Why this is a separate finding

The Companion disclosures looked for code that targets GRIP-EMS by name. The current addon does something that no name-search would catch: it closes off the ways another addon could read GSE sequences at all. There are two changes, both in the current shipped build, neither of which mentions any competitor.

## Finding 1 - the global GSE namespace is now a locked proxy

A WoW addon normally exposes its data on a global table so other addons can interoperate. GSE used to put its sequence library on the global `GSE`. The current build removes that and replaces the global with a small proxy that exposes only three functions used for plugin registration. The real data is gone from the global, and writes to it are silently dropped. This is GSE's own comment and code (verbatim, `evidence/gse_addon_locked_proxy.lua`, from `GSE/API/Plugins.lua`):

```
-- Expose a minimal public proxy at `_G.GSE` carrying ONLY the two functions
-- those plugins need for registration. Everything else on the private GSE
-- namespace (L, Static, Library, isEmpty, internal helpers, event mixins ...)
-- is deliberately absent ...
-- Writes are silently dropped so a stray `GSE.foo = bar` in a third-party
-- addon can't clobber our exposed methods ...
local publicProxy = {
    RegisterAddon = GSE.RegisterAddon,
    GetSequenceNamesFromLibrary = GSE.GetSequenceNamesFromLibrary,
    isEmpty = GSE.isEmpty,
    Statics = {}
}
setmetatable(publicProxy, { __newindex = function() end, __metatable = false })
rawset(_G, "GSE", publicProxy)
```

A second file states the intent plainly (`GSE/API/Storage.lua`, line 8):

```
-- The global GSE is now a minimal locked proxy (see Plugins.lua) with no .V or
-- internals exposed, to deny in-memory scraping by third-party addons.
```

In plain English: the live sequence library (`GSE.Library`) is no longer reachable from another addon at runtime. The proxy exposes sequence names, but not the sequence data. The stated purpose, in their words, is to deny in-memory reading by third-party addons. This is also defensible as ordinary code hygiene, so I am not calling it more than what the comment says. The effect is that the easy way for any other tool to read GSE sequences in memory is closed.

## Finding 2 - a new ChaCha20-encrypted sequence format

The current addon ships a new file, `GSE/API/Codec.lua`, dated 2026-06-20 (the same day as the latest Companion). It is a ChaCha20 stream cipher. GSE sequences can now travel in a new format tagged with a `!GSE3!+` prefix, where the payload is encrypted and only the GSE addon can decrypt it, using a key built into the addon. Verbatim (`evidence/gse_addon_codec_chacha20.lua`, from `GSE/API/Codec.lua`):

```
local C0, C1, C2, C3 = 1634760805, 857760878, 2036477234, 1797285236   -- ChaCha "expand 32-byte k"

function GSE.TransformBytes(key, nonce, counter, data)   -- ChaCha20 keystream XOR
  ...
end

local keys = {
    ["1"] = "\062\219\034\238\241\049\089\006\129\129\249\022\151\152\036\030\140\098\198\223\066\041\211\084\233\092\232\202\056\248\123\037",
}

function GSE.DecodePackedMessage(data)
    local id = ssub(data, 8, 8)              -- key id byte at position 8
    local key = keys[id]
    if not key then error("unsupported encoding") end
    local raw = C_EncodingUtil.DecodeBase64(ssub(data, 9))
    local nonce = ssub(raw, 1, 12)
    local body = ssub(raw, 13)
    local plain = GSE.TransformBytes(key, nonce, 0, body)
    return C_EncodingUtil.DeserializeCBOR(C_EncodingUtil.DecompressString(plain))
end
```

The dispatch that routes the new format to the decrypter is in `GSE/API/Serialisation.lua` (verbatim in `evidence/gse_addon_serialisation_dispatch.lua`): a string beginning `!GSE3!+` goes to `DecodePackedMessage`; the plain `!GSE3!` format is the old, readable one.

Three honest qualifications, because they change how this should be read:

First, the key is inside the addon, so this is not real confidentiality. Anyone who has the addon can read the key out of `Codec.lua`. A built-in key does not keep data secret; what it does is make any other tool depend on GSE in order to read the data. The id byte exists so the key can be rotated.

Second, it is not in use on my own machine. Nothing on the client writes this format: the addon only decrypts it, never encrypts it; the Companion app explicitly refuses a `!GSE3!+` string; and none of my own GSE sequences on disk are in it. So the encoder is on GSE's server, or it is not switched on yet.

Third, that means the addon has been given the ability to receive sequences that only GSE can read, with the switch to start sending them sitting on GSE's side. It is the same shape as the Companion's deletion engine: ship the capability quietly, decide later when to use it. The format is wired to GSE's "protected" content path, so the most likely first use is paid or protected sequences.

## Why this matters

Neither change names my addon, or any competitor, anywhere. That is the point, and it is why the earlier name-searches did not find them. Read together, the direction is consistent with the Companion findings: the live sequence library is now closed to other addons, and a format that only GSE can read is in place and ready. The effect on any tool a user might use to move their own sequences out of GSE, mine included, is that GSE sequence data becomes progressively unreadable outside GSE.

## What I am not claiming

- I am not claiming the encrypted format is in use today. On my machine it is not: nothing writes it, and I have no encrypted sequences on disk. The encoder is server-side or not yet enabled.
- I am not claiming the locked global is wrong on its own. Not leaking your namespace is reasonable practice. I am reporting what it does and quoting GSE's own stated reason for it.
- The "protected content" reading of the encryption is the most likely purpose, but I cannot see GSE's server, so I am not stating it as fact. The verifiable part is the cipher, the embedded key, and the format dispatch, all of which are in the shipped files.

## How to verify

1. Install the GSE addon (free build on CurseForge, or the build you already run).
2. Open `Interface/AddOns/GSE/API/Plugins.lua` and read the `publicProxy` block near the bottom. Confirm the global is replaced by a three-function proxy with `__newindex = function() end`.
3. Open `Interface/AddOns/GSE/API/Storage.lua` line 8 for the stated "deny in-memory scraping by third-party addons" comment.
4. Open `Interface/AddOns/GSE/API/Codec.lua`. Confirm the ChaCha20 constants (`1634760805`, `857760878`, `2036477234`, `1797285236`), the `keys` table with the 32-byte key, and `GSE.DecodePackedMessage`.
5. Open `Interface/AddOns/GSE/API/Serialisation.lua` and confirm `DecodeMessage` sends a `!GSE3!+` string to `DecodePackedMessage` and a plain `!GSE3!` string to the readable path.

## File integrity (SHA-256)

From build 3.3.22-12-gfb1946e-PatronBuild, files dated 2026-06-20:

- `GSE/API/Codec.lua` (the ChaCha20 cipher + DecodePackedMessage)
  `fc6eea938f36222feb577f220108e55a01bbb9e29f1edc18300662c492fea748` — 2,925 bytes
- `GSE/API/Plugins.lua` (the locked-proxy block)
  `6aaad9964db4d0af0194496bf05d90680288990fbb7d992b5212f488b1e81fb6` — 5,490 bytes
- `GSE/API/Serialisation.lua` (the format dispatch)
  `ac2dffe2becbc9b44aa704c8f9655cc95c5a6b07b6e22e71d4eb6700ece5fce8` — 18,971 bytes

## Files added by this update

- `evidence/gse_addon_locked_proxy.lua` — the verbatim locked-proxy block from `GSE/API/Plugins.lua`.
- `evidence/gse_addon_codec_chacha20.lua` — the verbatim `GSE/API/Codec.lua`: the ChaCha20 cipher, the embedded key, and `DecodePackedMessage`.
- `evidence/gse_addon_serialisation_dispatch.lua` — the verbatim `EncodeMessage` / `DecodeMessage` dispatch that routes `!GSE3!+` to the decrypter.
