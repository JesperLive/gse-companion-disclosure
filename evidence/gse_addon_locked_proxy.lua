-- Verbatim extract from the in-game GSE addon: Plugins.lua lines 104-138
-- GSE replaces its global _G.GSE with a minimal locked proxy; writes are dropped (__newindex), metatable locked. Stated purpose in-comment: deny in-memory scraping by third-party addons.
-- Source: World of Warcraft Retail, Interface/AddOns/GSE (build 3.3.22-12-gfb1946e-PatronBuild).
-- Reproduce: open the same file in any GSE install and read these lines.


-- ---------------------------------------------------------------------------
-- Legacy plugin compatibility shim
--
-- Other addons (out of our control) still do `local GSE = GSE` at parse-time
-- and call `GSE.RegisterAddon(...)` / `GSE.GetSequenceNamesFromLibrary(...)`
-- to register their bundled sequence packs. Since we removed the global GSE,
-- those plugins would silently no-op (their nil-guard would print the
-- "requires GSE3" warning and `return`).
--
-- Expose a minimal public proxy at `_G.GSE` carrying ONLY the two functions
-- those plugins need for registration. Everything else on the private GSE
-- namespace (L, Static, Library, isEmpty, internal helpers, event mixins …)
-- is deliberately absent — the proxy isn't a leak; it's a contract surface.
--
-- Writes are silently dropped so a stray `GSE.foo = bar` in a third-party
-- addon can't clobber our exposed methods or accidentally graft state onto
-- the proxy. setmetatable is locked so the proxy can't be re-tabled either.
-- ---------------------------------------------------------------------------
local publicProxy = {
    RegisterAddon = GSE.RegisterAddon,
    GetSequenceNamesFromLibrary = GSE.GetSequenceNamesFromLibrary,
    -- isEmpty is the nil-guard helper plugins use to defend their own
    -- Sequences table before handing it to RegisterAddon. Without it the
    -- registration handshake errors before it reaches the two methods above.
    isEmpty = GSE.isEmpty,
    Statics = {}
}
setmetatable(publicProxy, {
    __newindex = function() end,
    __metatable = false,
})
rawset(_G, "GSE", publicProxy)

GSE.DebugProfile("Plugins")
