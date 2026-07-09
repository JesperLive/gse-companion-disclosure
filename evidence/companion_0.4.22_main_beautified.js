import {
    app as X,
    ipcMain as j,
    dialog as Ds,
    shell as zn,
    BrowserWindow as Wn,
    Notification as Wt,
    nativeImage as An,
    Tray as Ms,
    Menu as xs
} from "electron";
import {
    join as P,
    dirname as Ns,
    basename as vt,
    resolve as xe,
    sep as bt
} from "path";
import {
    createHash as on
} from "crypto";
import {
    openSync as Jn,
    writeSync as Hn,
    fsyncSync as Qn,
    closeSync as Xn,
    renameSync as rn,
    existsSync as z,
    readFileSync as we,
    writeFileSync as Te,
    mkdirSync as Vs,
    readdirSync as Fe,
    statSync as ot,
    copyFileSync as Yn,
    realpathSync as In,
    watch as Rs,
    createWriteStream as Bs,
    chmodSync as Ks,
    unlinkSync as Ls
} from "fs";
import "stream/promises";
import {
    tmpdir as Gs
} from "os";
import {
    execFile as Us,
    spawn as Rt
} from "child_process";
import {
    promisify as Fs
} from "util";
import {
    fileURLToPath as zs
} from "url";
import {
    createRequire as Ws
} from "module";
import Js from "luaparse";
import {
    createHash as Hs
} from "node:crypto";
import Qs from "tweetnacl";
import Xs from "node:module";
const Dr = import.meta.filename,
    Tn = import.meta.dirname,
    ze = Xs.createRequire(import.meta.url),
    vn = {
        wowPaths: [],
        updateChannel: "stable",
        syncOnClose: !0,
        // When a downloaded update finishes, install + relaunch automatically
        // instead of waiting on a Restart click. User can flip this off in
        // AppSettings if they want to vet each update first.
        autoApplyUpdates: !0,
        // Per-platformId opt-out from server-driven updates. Items in this list
        // are dropped from BOTH the in-game import dialog (runIncoming → bridge)
        // AND the upstream-fork-update toast, so the user stops getting nagged
        // on every login about a specific sequence they don't want to update.
        // Companion-install-wide — applies across every WoW client/account this
        // Companion manages.
        ignoredUpstreamIds: []
    };

function Zn() {
    return P(X.getPath("userData"), "settings.json");
}

function q() {
    try {
        const e = Zn();
        if (z(e))
            return {
                ...vn,
                ...JSON.parse(we(e, "utf-8"))
            };
    } catch {}
    return {
        ...vn
    };
}

function G(e) {
    const t = Zn(),
        n = t + ".tmp",
        s = q(),
        o = JSON.stringify({
            ...s,
            ...e
        }, null, 2),
        a = Jn(n, "w");
    try {
        Hn(a, o), Qn(a);
    } finally {
        Xn(a);
    }
    return rn(n, t), q();
}

function En(e, t) {
    return e && typeof e == "object" && !Array.isArray(e) && "bind" in e ? t ? t[e.bind] : void 0 : e;
}

function Pn(e) {
    return e instanceof Set ? e : Array.isArray(e) ? new Set(e) : new Set(e == null ? [] : [e]);
}

function Cn(e, t, n) {
    switch (t) {
        case "eq":
            return e === n;
        case "ne":
            return e !== n;
        case "in":
            return Pn(n).has(e);
        case "nin":
            return !Pn(n).has(e);
        case "exists":
            return e != null == !!n;
        case "matches":
            return typeof e == "string" && new RegExp(n).test(e);
        case "prefix":
            return typeof e == "string" && e.startsWith(n);
        case "suffix":
            return typeof e == "string" && e.endsWith(n);
        default:
            return !1;
    }
}

function rt(e, t) {
    if (typeof e == "function") return e;
    if (!e || typeof e != "object") return () => !1;
    if (Array.isArray(e.and)) {
        const n = e.and.map((s) => rt(s, t));
        return (s, o) => n.every((a) => a(s, o));
    }
    if (Array.isArray(e.or)) {
        const n = e.or.map((s) => rt(s, t));
        return (s, o) => n.some((a) => a(s, o));
    }
    if (e.not) {
        const n = rt(e.not, t);
        return (s, o) => !n(s, o);
    }
    if ("key" in e) {
        const n = En(e.value, t);
        return (s) => Cn(s, e.op, n);
    }
    if ("field" in e) {
        const n = En(e.value, t);
        return (s, o) => Cn(o?.[e.field], e.op, n);
    }
    return () => !1;
}

function es(e, t, n) {
    if (!e || typeof e != "object") return [];
    const s = rt(t, n);
    return Object.keys(e).filter((o) => s(o, e[o]));
}

function Ys(e, t, n) {
    const s = es(e, t, n);
    for (const o of s) delete e[o];
    return s;
}

function Zs(e, t, n) {
    const s = Array.isArray(t) ? t : [t];
    let o = e;
    for (let a = 0; a < s.length - 1; a++) {
        const r = s[a];
        (!o[r] || typeof o[r] != "object") && (o[r] = {}), o = o[r];
    }
    return o[s[s.length - 1]] = n, e;
}

function eo(e, t = 1) {
    const n = /* @__PURE__ */ new Set(),
        s = (o, a) => {
            if (!(!o || typeof o != "object")) {
                if (a === 1) {
                    for (const r of Object.keys(o)) n.add(r);
                    return;
                }
                for (const r of Object.keys(o)) s(o[r], a - 1);
            }
        };
    return s(e, t), n;
}

function Jt(e, t, n) {
    if (!Array.isArray(e)) return [];
    if (typeof t == "function") return e.filter((o) => !t(o));
    const s = rt(t, n);
    return e.filter((o) => !s(null, o));
}

function to(e, t) {
    if (!Array.isArray(e)) return [];
    const n = typeof t == "function" ? t : (o) => o == null ? null : o[t],
        s = /* @__PURE__ */ new Map();
    return e.forEach((o, a) => {
        const r = n(o);
        r != null && s.set(r, a);
    }), e.filter((o, a) => {
        const r = n(o);
        return r == null || s.get(r) === a;
    });
}
Ws(import.meta.url);
const On = Fs(Us),
    lt = {
        _retail_: {
            name: "Retail",
            exes: ["wow", "wow.exe"],
            clientType: "retail"
        },
        _ptr_: {
            name: "PTR",
            exes: ["wowt", "wowt.exe"],
            clientType: "retail"
        },
        _xptr_: {
            name: "Expansion PTR",
            exes: ["wowt", "wowt.exe"],
            clientType: "retail"
        },
        _beta_: {
            name: "Beta",
            exes: ["wowb", "wowb.exe"],
            clientType: "retail-beta"
        },
        _classic_: {
            name: "Classic",
            exes: ["wowclassic", "wowclassic.exe"],
            clientType: "classic-prog"
        },
        _classic_era_: {
            name: "Classic Era",
            exes: ["wowclassic", "wowclassic.exe"],
            clientType: "classic-era"
        },
        _anniversary_: {
            name: "Anniversary",
            exes: ["wowclassic", "wowclassic.exe"],
            clientType: "classic-prog"
        },
        _classic_beta_: {
            name: "Classic Beta",
            exes: ["wowclassicb", "wowclassicb.exe"],
            clientType: "classic-prog"
        }
    };
async function He() {
    try {
        if (process.platform === "win32") {
            const {
                stdout: s
            } = await On("tasklist", ["/fo", "csv", "/nh"]), o = s.split(`
`).map((r) => r.split(",")[0]?.replace(/"/g, "").toLowerCase()), a = new Set(
                Object.values(lt).flatMap((r) => r.exes.map((c) => c.toLowerCase()))
            );
            return [...new Set(o.filter((r) => r && a.has(r)))];
        }
        const {
            stdout: e
        } = await On("ps", ["-A", "-o", "args="]), t = /* @__PURE__ */ new Set(), n = /\b(WowVoiceProxy|WoWErrorReporter|Battle\.net Helper|Agent)\.exe/i;
        for (const s of e.split(`
`)) {
            const o = s.trim();
            if (!o || /\/Helpers\//i.test(o) || n.test(o)) continue;
            const a = o.replace(/\\/g, "/");
            for (const [r, c] of Object.entries(lt))
                if (a.includes(`/${r}/`)) {
                    t.add(c.exes[0]);
                    break;
                }
        }
        return [...t];
    } catch (e) {
        return console.error("[wow] detectRunningWow failed:", e?.message ?? e), [];
    }
}

function no(e, t) {
    if (!e || !Array.isArray(t) || !t.length) return !1;
    const n = lt[e];
    if (!n || !Array.isArray(n.exes)) return !1;
    const s = new Set(t.map((o) => String(o).toLowerCase()));
    return n.exes.some((o) => s.has(String(o).toLowerCase()));
}

function Se(e) {
    if (!e) return [];
    const t = [];
    for (const [n, s] of Object.entries(lt)) {
        const o = P(e, n);
        z(P(o, "WTF")) && t.push({
            folder: n,
            name: s.name,
            path: o
        });
    }
    return t;
}

function Et(e) {
    const t = P(e, "Interface", "AddOns", "GSE", "GSE.toc");
    if (!z(t)) return null;
    const s = we(t, "utf-8").match(/^## Version:\s*(.+)$/m);
    return s ? s[1].trim() : null;
}
const qn = {
    1: "Classic Era",
    2: "TBC Classic",
    3: "Wrath Classic",
    4: "Cataclysm Classic",
    5: "MoP Classic",
    6: "WoD",
    7: "Legion",
    8: "Battle for Azeroth",
    9: "Shadowlands",
    10: "Dragonflight",
    11: "TWW",
    12: "Midnight",
    13: "The Last Titan"
};

function Pt(e) {
    const t = P(e, ".."),
        n = P(t, ".build.info");
    if (!z(n)) return null;
    try {
        const o = we(n, "utf-8").split(`
`).filter((u) => u.trim());
        if (o.length < 2) return null;
        const a = o[0].split("|").map((u) => u.split("!")[0]),
            r = a.indexOf("Version"),
            c = a.indexOf("Product");
        if (r < 0 || c < 0) return null;
        const i = P(e, ".flavor.info");
        if (!z(i)) return null;
        const l = we(i, "utf-8").split(`
`).filter((u) => u.trim()),
            f = l[l.length - 1]?.trim();
        if (!f) return null;
        for (let u = 1; u < o.length; u++) {
            const h = o[u].split("|");
            if (h[c]?.trim() !== f) continue;
            const y = h[r]?.trim();
            if (!y) continue;
            const p = parseInt(y.split(".")[0], 10);
            if (!isNaN(p) && qn[p])
                return qn[p];
        }
    } catch {}
    return null;
}

function an(e) {
    const t = [];
    for (const [n, s] of Object.entries(e || {}))
        t.push(`${n} = ${Ht(s, 0)}`);
    return t.join(`
`) + `
`;
}

function Ht(e, t) {
    if (e == null) return "nil";
    if (e === !0) return "true";
    if (e === !1) return "false";
    if (typeof e == "number")
        return Number.isInteger(e), String(e);
    if (typeof e == "string") return ts(e);
    if (Array.isArray(e)) {
        const n = "  ".repeat(t + 1),
            s = "  ".repeat(t),
            o = e.map((a, r) => `${n}[${r + 1}] = ${Ht(a, t + 1)}`).join(`,
`);
        return e.length === 0 ? "{}" : `{
${o},
${s}}`;
    }
    if (typeof e == "object") {
        const n = Object.entries(e);
        if (n.length === 0) return "{}";
        const s = "  ".repeat(t + 1),
            o = "  ".repeat(t);
        return `{
${n.map(([r, c]) => `${s}${so(r)} = ${Ht(c, t + 1)}`).join(`,
`)},
${o}}`;
    }
    return "nil";
}

function so(e) {
    return /^-?\d+$/.test(e) ? `[${e}]` : /^[A-Za-z_][A-Za-z0-9_]*$/.test(e) && !oo.has(e) ? e : `[${ts(e)}]`;
}
const oo = /* @__PURE__ */ new Set([
    "and",
    "break",
    "do",
    "else",
    "elseif",
    "end",
    "false",
    "for",
    "function",
    "goto",
    "if",
    "in",
    "local",
    "nil",
    "not",
    "or",
    "repeat",
    "return",
    "then",
    "true",
    "until",
    "while"
]);

function ts(e) {
    return '"' + e.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\0/g, "\\0") + '"';
}

function Ae(e) {
    if (!z(e)) return null;
    try {
        const t = we(e, {
                encoding: "latin1"
            }),
            n = Js.parse(t, {
                encodingMode: "pseudo-latin1",
                luaVersion: "5.1"
            }),
            s = {};
        for (const o of n.body)
            if (o.type === "AssignmentStatement") {
                const a = o.variables[0]?.name;
                a && (s[a] = tt(o.init[0]));
            }
        return s;
    } catch (t) {
        return console.error(`[wow] readSavedVariables failed for ${e}:`, t?.message ?? t), null;
    }
}

function tt(e) {
    if (!e) return null;
    switch (e.type) {
        case "StringLiteral":
            return e.value;
        case "NumericLiteral":
            return e.value;
        case "BooleanLiteral":
            return e.value;
        case "NilLiteral":
            return null;
        case "TableConstructorExpression": {
            const t = e.fields,
                n = {};
            let s = !0;
            for (const o of t)
                o.type === "TableKey" ? (s = !1, n[tt(o.key)] = tt(o.value)) : o.type === "TableKeyString" ? (s = !1, n[o.key.name] = tt(o.value)) : n[Object.keys(n).length + 1] = tt(o.value);
            return s && t.length > 0 ? Object.values(n) : n;
        }
        default:
            return null;
    }
}
const ro = {
    // 5-digit prefixes
    1: "Classic Era",
    2: "TBC Classic",
    3: "Wrath Classic",
    4: "Cataclysm Classic",
    5: "MoP Classic",
    6: "WoD",
    7: "Legion",
    8: "Battle for Azeroth",
    9: "Shadowlands",
    // 6-digit prefixes
    10: "Dragonflight",
    11: "TWW",
    12: "Midnight",
    13: "The Last Titan"
};

function cn(e) {
    const t = Math.floor(Number(e));
    if (!t || t <= 0) return "Unknown";
    const n = String(t),
        s = n.length >= 6 ? parseInt(n.slice(0, 2), 10) : parseInt(n[0], 10);
    return ro[s] ?? "Unknown";
}
const ao = {
    _retail_: "Midnight",
    _ptr_: "Midnight",
    _xptr_: "The Last Titan",
    _beta_: "The Last Titan",
    _classic_: "MoP Classic",
    _classic_era_: "Classic Era",
    _anniversary_: "MoP Classic",
    _classic_beta_: "MoP Classic"
};

function io(e) {
    return ao[e] ?? "Unknown";
}

function wt(e) {
    if (Buffer.isBuffer(e) || e instanceof Uint8Array)
        return Buffer.from(e).toString("utf8");
    if (e instanceof Map) {
        const t = {};
        for (const [n, s] of e) {
            const o = Buffer.isBuffer(n) || n instanceof Uint8Array ? Buffer.from(n).toString("utf8") : String(n);
            t[o] = wt(s);
        }
        return t;
    }
    if (Array.isArray(e)) return e.map(wt);
    if (e && typeof e == "object") {
        const t = {};
        for (const n of Object.keys(e)) t[n] = wt(e[n]);
        return t;
    }
    return e;
}

function fe(e) {
    if (typeof e != "string" || !e.startsWith("!GSE3!") || e.startsWith("!GSE3!+")) return null;
    try {
        const t = Buffer.from(e.slice(6), "base64"),
            n = ze("zlib").inflateRawSync(t),
            {
                Decoder: s
            } = ze("cbor-x"),
            o = new s({
                mapsAsObjects: !1,
                useRecords: !1
            }).decode(n);
        return wt(o);
    } catch {
        return null;
    }
}

function et(e) {
    return String(e).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function Ne(e) {
    const {
        readdirSync: t,
        statSync: n
    } = ze("fs"), s = P(e, "WTF", "Account");
    if (!z(s)) return [];
    try {
        return t(s).filter((o) => o !== "SavedVariables").filter((o) => n(P(s, o)).isDirectory()).map((o) => ({
            name: o,
            path: P(s, o)
        }));
    } catch {
        return [];
    }
}
const ns = "GSE_Companion",
    ss = "GSE_Companion_Data.lua";

function co() {
    const e = zs(import.meta.url),
        t = Ns(e),
        n = P(t, "..", "..", "addon");
    if (z(n)) return n;
    const s = P(t, "..", "..", "..", "addon");
    if (z(s)) return s;
    if (process.resourcesPath) {
        const o = P(process.resourcesPath, "addon");
        if (z(o)) return o;
    }
    return n;
}

function os(e) {
    const t = P(e, "Interface", "AddOns", ns);
    if (!z(P(e, "Interface", "AddOns"))) return !1;
    z(t) || Vs(t, {
        recursive: !0
    });
    const n = co();
    let s;
    try {
        s = Fe(n).filter((a) => {
            if (!/\.(toc|lua)$/i.test(a) || /_Data\.lua$/i.test(a)) return !1;
            try {
                return ot(P(n, a)).isFile();
            } catch {
                return !1;
            }
        });
    } catch {
        s = ["GSE_Companion.toc", "Bootstrap.lua", "GSE_Companion.lua"];
    }
    for (const a of s) {
        const r = P(n, a),
            c = P(t, a);
        z(r) && Yn(r, c);
    }
    const o = P(t, ss);
    return z(o) || Te(o, `GSECompanionData = {}
`, {
        encoding: "latin1"
    }), !0;
}

function Qe(e) {
    return P(e, "Interface", "AddOns", ns, ss);
}
let lo = 0;

function jn() {
    return `${Date.now().toString(36)}_${(lo++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function Dn(e, t) {
    const n = " ".repeat(t),
        s = [`${n}{`];
    for (const [o, a] of Object.entries(e))
        if (a != null && o !== "displayItems")
            if (o === "sequences" && typeof a == "object") {
                s.push(`${n}  ["sequences"] = {`);
                for (const [r, c] of Object.entries(a))
                    s.push(`${n}    ["${et(r)}"] = "${et(c)}",`);
                s.push(`${n}  },`);
            } else typeof a == "number" ? s.push(`${n}  ["${et(o)}"] = ${a},`) : s.push(`${n}  ["${et(o)}"] = "${et(String(a))}",`);
    return s.push(`${n}},`), s.join(`
`);
}

function ge(e, {
    queue: t,
    incomingQueue: n
}) {
    const s = os(e),
        o = Qe(e);
    if (console.log("[bridge] writeBridgeData:", {
            clientPath: e,
            dataPath: o,
            addonOk: s,
            hasQueue: !!t?.length,
            hasIncoming: !!n?.length
        }), !s) return;
    const a = o.replace(/\.lua$/, ".json");
    let r = {
        queue: [],
        incomingQueue: []
    };
    if (z(a))
        try {
            r = JSON.parse(we(a, "utf-8"));
        } catch {}
    const c = (S) => S ? S.contentType && S.name ? `${S.contentType}:${S.name}` : S.name ? `name:${S.name}` : null : null;
    if (n?.length)
        for (const S of n) {
            const k = c(S);
            if (k) {
                const g = r.incomingQueue.length;
                r.incomingQueue = Jt(r.incomingQueue, (w) => c(w) === k);
                const O = g - r.incomingQueue.length;
                O > 0 && console.log(`[bridge] superseding ${O} stale incoming entr${O === 1 ? "y" : "ies"} for ${k}`);
            }
            r.incomingQueue.push({
                ...S,
                _id: S._id || jn()
            });
        } {
            const S = r.incomingQueue.length;
            r.incomingQueue = to(r.incomingQueue, c);
            const k = S - r.incomingQueue.length;
            k > 0 && console.log(`[bridge] collapsed ${k} pre-existing duplicate incoming entr${k === 1 ? "y" : "ies"}`);
        }
    if (t?.length)
        for (const S of t) {
            if (r.queue.some(
                    (g) => g.action === S.action && g.name === S.name && (S.action !== "setPlatformID" || g.platformid === S.platformid)
                )) {
                console.log(`[bridge] skipping duplicate queue entry: ${S.action} "${S.name}"`);
                continue;
            }
            r.queue.push({
                ...S,
                _id: jn()
            });
        }
    Te(a, JSON.stringify(r), "utf-8");
    const i = 100,
        l = r.incomingQueue.filter((S) => S.force),
        f = r.incomingQueue.filter((S) => !S.force),
        u = [...l, ...f],
        h = r.queue.slice(0, i),
        y = ["GSECompanionData = {"];
    if (u.length) {
        y.push('  ["incomingQueue"] = {');
        for (const S of u) y.push(Dn(S, 4));
        y.push("  },");
    }
    if (h.length) {
        y.push('  ["queue"] = {');
        for (const S of h) y.push(Dn(S, 4));
        y.push("  },");
    }
    y.push("}");
    const p = y.join(`
`) + `
`,
        I = r.incomingQueue.length - u.length,
        E = r.queue.length - h.length;
    return console.log(
        "[bridge] writing Lua data file:",
        o,
        "| queue:",
        r.queue.length,
        "(emit",
        h.length,
        "backlog",
        E,
        ")",
        "| incoming:",
        r.incomingQueue.length,
        "(emit",
        u.length,
        "backlog",
        I,
        ")",
        "| bytes:",
        p.length
    ), Te(o, p, {
        encoding: "latin1"
    }), !0;
}

function uo(e) {
    if (!e || typeof e.name != "string" || e.name === "") return null;
    const t = e.contentType || "sequence",
        n = e.checksum || "";
    return `${t}:${e.name}:${n}`;
}

function fo(e, t) {
    if (typeof t != "function") return 0;
    const s = Qe(e).replace(/\.lua$/, ".json");
    if (!z(s)) return 0;
    let o;
    try {
        o = JSON.parse(we(s, "utf-8"));
    } catch {
        return 0;
    }
    if (!Array.isArray(o.incomingQueue) || !o.incomingQueue.length) return 0;
    const a = o.incomingQueue.length;
    o.incomingQueue = o.incomingQueue.filter((c) => {
        try {
            return !t(c);
        } catch {
            return !0;
        }
    });
    const r = a - o.incomingQueue.length;
    return r === 0 ? 0 : (Te(s, JSON.stringify(o), "utf-8"), ge(e, {}), r);
}

function po(e, t) {
    if (!Array.isArray(t) || !t.length) return 0;
    const s = Qe(e).replace(/\.lua$/, ".json");
    if (!z(s)) return 0;
    let o;
    try {
        o = JSON.parse(we(s, "utf-8"));
    } catch {
        return 0;
    }
    if (!Array.isArray(o.incomingQueue) || !o.incomingQueue.length) return 0;
    const a = new Set(t.map(String)),
        r = o.incomingQueue.length;
    o.incomingQueue = o.incomingQueue.filter((i) => !a.has(String(i._id ?? "")));
    const c = r - o.incomingQueue.length;
    return c === 0 ? 0 : (Te(s, JSON.stringify(o), "utf-8"), ge(e, {}), c);
}

function ln(e, t, n = []) {
    const o = Qe(e).replace(/\.lua$/, ".json");
    if (!z(o)) return 0;
    let a;
    try {
        a = JSON.parse(we(o, "utf-8"));
    } catch {
        return 0;
    }
    const r = new Set(t),
        c = new Set(n),
        i = (a.queue?.length ?? 0) + (a.incomingQueue?.length ?? 0);
    a.queue = Jt(a.queue ?? [], (u) => r.has(u._id)), a.incomingQueue = Jt(a.incomingQueue ?? [], (u) => {
        if (u._id && r.has(u._id)) return !0;
        const h = uo(u);
        return !!(h && c.has(h));
    });
    const l = a.queue.length + a.incomingQueue.length,
        f = i - l;
    return f === 0 ? 0 : (Te(o, JSON.stringify(a), "utf-8"), ge(e, {}), f);
}

function rs(e) {
    try {
        const n = Qe(e).replace(/\.lua$/, ".json");
        if (!z(n)) return {
            queue: [],
            incomingQueue: []
        };
        const s = JSON.parse(we(n, "utf-8"));
        return {
            queue: s.queue ?? [],
            incomingQueue: s.incomingQueue ?? []
        };
    } catch {
        return {
            queue: [],
            incomingQueue: []
        };
    }
}

function un(e) {
    const t = P(e, "SavedVariables", "GSE_Companion.lua"),
        s = Ae(t)?.GSECompanionBridgeDB;
    return s ? {
        processedIds: Object.keys(s.processed ?? {}),
        importedKeys: Object.keys(s.imported ?? {})
    } : {
        processedIds: [],
        importedKeys: []
    };
}

function as(e) {
    const t = Qe(e),
        n = t.replace(/\.lua$/, ".json");
    z(t) && Te(t, `GSECompanionData = {}
`, {
        encoding: "latin1"
    }), z(n) && Te(n, JSON.stringify({
        queue: [],
        incomingQueue: []
    }), "utf-8");
}
async function ho(e) {
    try {
        const t = await fetch(`${e}/settings/access-policy`, {
            headers: {
                Accept: "application/json"
            }
        });
        if (!t.ok) return {
            enforce: !1,
            error: `http_${t.status}`
        };
        const n = await t.json().catch(() => null);
        return {
            enforce: !!(n && n.enforce),
            updatedAt: n?.updatedAt ?? null,
            integrityRef: n?.integrityRef ?? null
        };
    } catch (t) {
        return {
            enforce: !1,
            error: t?.message ?? "fetch_failed"
        };
    }
}
async function go({
    apiUrl: e,
    token: t,
    personaId: n,
    present: s
}) {
    if (!t || !n) return {
        skipped: "missing_inputs"
    };
    let o = null,
        a = !1;
    try {
        const c = await fetch(`${e}/content/gseMember/list`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${t}`
            },
            body: JSON.stringify({
                filter: {
                    operator: "and",
                    filters: [{
                        key: "meta.personaAuthor",
                        comparator: "equal",
                        value: n
                    }]
                },
                select: ["_id", "data.restrictedAccount"],
                page: {
                    size: 1
                }
            })
        });
        if (!c.ok) return {
            error: `list_http_${c.status}`
        };
        const l = (await c.json().catch(() => null))?.items?.[0];
        if (!l?._id) return {
            skipped: "no_member"
        };
        o = l._id, a = !!l?.data?.restrictedAccount;
    } catch (c) {
        return {
            error: c?.message ?? "list_failed"
        };
    }
    if (a === s)
        return {
            skipped: "unchanged",
            present: s,
            memberId: o
        };
    const r = s ? {
        data: {
            restrictedAccount: !0,
            restrictedAccountReviewedAt: ( /* @__PURE__ */ new Date()).toISOString()
        }
    } : {
        data: {
            restrictedAccount: !1
        }
    };
    try {
        const c = await fetch(`${e}/content/${o}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${t}`
            },
            body: JSON.stringify(r)
        });
        if (!c.ok) return {
            error: `patch_http_${c.status}`
        };
    } catch (c) {
        return {
            error: c?.message ?? "patch_failed"
        };
    }
    return {
        changed: !0,
        present: s,
        memberId: o
    };
}
const fn = [
    ge,
    ln,
    un,
    rs,
    as,
    fe,
    an,
    Ae
];

function is(e) {
    return String(e).replace(/\r\n/g, `
`);
}

function mo(e, t, n) {
    const s = Hs("sha256");
    s.update(Buffer.from(String(e), "utf8"));
    for (const o of t) {
        const a = n(o);
        if (typeof a != "string") throw new Error("bad index " + o);
        const r = Buffer.from(a, "utf8"),
            c = Buffer.alloc(8);
        c.writeUInt32BE(o >>> 0, 0), c.writeUInt32BE(r.length >>> 0, 4), s.update(c), s.update(r);
    }
    return s.digest("hex");
}

function yo(e, t) {
    if (!Array.isArray(e) || e.length === 0) throw new Error("empty");
    for (const n of e)
        if (!Number.isInteger(n) || n < 0 || n >= t) throw new Error("range " + n);
}

function cs(e, t, n = fn) {
    return yo(t, n.length), mo(e, t, (s) => is(n[s].toString()));
}

function ls(e = fn) {
    return e.map((t) => is(t.toString()));
}
fn.length;

function wo(e) {
    const t = [];
    for (const n of e || [])
        for (const s of Se(n) || [])
            t.push(xe(s.path, "WTF") + bt);
    return t;
}

function us(e, t) {
    if (typeof e != "string" || !e.toLowerCase().endsWith(".lua")) return !1;
    const n = xe(e);
    return t.some((s) => (n + bt).startsWith(s) || n === s.slice(0, -1));
}

function dn(e, t) {
    const n = [],
        s = (o, a) => {
            let r = [];
            try {
                r = Fe(o);
            } catch {
                return;
            }
            for (const c of r) {
                if (!t(c)) continue;
                const i = P(o, c);
                try {
                    ot(i).isFile() && n.push({
                        path: i,
                        account: a
                    });
                } catch {}
            }
        };
    for (const o of e || [])
        for (const a of Se(o) || [])
            for (const r of Ne(a.path) || []) {
                s(P(r.path, "SavedVariables"), r.path);
                let c = [];
                try {
                    c = Fe(r.path).filter((i) => {
                        if (i === "SavedVariables") return !1;
                        try {
                            return ot(P(r.path, i)).isDirectory();
                        } catch {
                            return !1;
                        }
                    });
                } catch {}
                for (const i of c) {
                    const l = P(r.path, i);
                    let f = [];
                    try {
                        f = Fe(l).filter((u) => {
                            try {
                                return ot(P(l, u)).isDirectory();
                            } catch {
                                return !1;
                            }
                        });
                    } catch {}
                    for (const u of f) s(P(l, u, "SavedVariables"), r.path);
                }
            }
    return n;
}

function fs(e, t) {
    const n = vt(String(t || ""));
    return n ? dn(e, (s) => s === n) : [];
}

function bo(e, t) {
    return fs(e, t).length > 0;
}

function So(e, t) {
    if (!us(e, t)) throw new Error("path out of scope");
    return Ae(e);
}

function ko(e, t, n) {
    if (!us(e, n)) throw new Error("path out of scope");
    const s = an(t),
        o = `${e}.svmnt.tmp`,
        a = Jn(o, "w");
    try {
        Hn(a, s), Qn(a);
    } finally {
        Xn(a);
    }
    rn(o, e);
}

function je(e, t) {
    return String(t).split(".").reduce((n, s) => n == null ? n : n[s], e);
}

function De(e, t) {
    if (e && typeof e == "object") {
        if ("bind" in e) return je(t, e.bind);
        if (Array.isArray(e.join)) return P(...e.join.map((n) => String(De(n, t))));
    }
    return e;
}

function Bt(e, t, n) {
    let s = e;
    for (const o of t || []) {
        const a = De(o, n);
        if (s == null || typeof s != "object") return null;
        s = s[a];
    }
    return s && typeof s == "object" ? s : null;
}

function ds(e, t) {
    for (const n of e || [])
        switch (n.op) {
            case "listFiles": {
                t.bindings[n.as] = fs(t.wowPaths, De(n.file, t.bindings));
                break;
            }
            case "forEach": {
                const s = je(t.bindings, n.in) || [];
                for (const o of s) {
                    t.bindings[n.as] = o;
                    try {
                        ds(n.do, t);
                    } catch (a) {
                        t.tally.errors += 1, t.lastError = a?.message || String(a);
                    }
                }
                delete t.bindings[n.as];
                break;
            }
            case "read": {
                const s = De(n.path, t.bindings);
                t.bindings[n.as] = s && z(s) ? So(s, t.roots) : null, t.dirty.delete(n.as);
                break;
            }
            case "extractKeys": {
                const s = je(t.bindings, n.from),
                    o = Bt(s, n.at, t.bindings);
                t.bindings[n.as] = o ? eo(o, n.depth || 1) : /* @__PURE__ */ new Set();
                break;
            }
            case "deleteKeys": {
                const s = je(t.bindings, n.from),
                    o = Bt(s, n.at, t.bindings),
                    a = o ? Ys(o, n.where, t.bindings) : [];
                a.length && t.dirty.add(n.from), t.tally.removed += a.length, n.as && (t.bindings[n.as] = a);
                break;
            }
            case "selectKeys": {
                const s = je(t.bindings, n.from),
                    o = Bt(s, n.at, t.bindings);
                t.bindings[n.as] = o ? es(o, n.where, t.bindings) : [];
                break;
            }
            case "setKey": {
                const s = je(t.bindings, n.from);
                s && typeof s == "object" && (Zs(s, n.at.map((o) => De(o, t.bindings)), De(n.value, t.bindings)), t.dirty.add(n.from));
                break;
            }
            case "write": {
                const s = je(t.bindings, n.from),
                    o = De(n.path, t.bindings);
                s && o && (!n.onlyIfChanged || t.dirty.has(n.from)) && (ko(o, s, t.roots), t.tally.filesWritten += 1, t.dirty.delete(n.from));
                break;
            }
            default:
                throw new Error(`unknown op: ${n.op}`);
        }
}

function $o(e, {
    wowPaths: t
} = {}) {
    const n = {
        wowPaths: t || [],
        roots: wo(t),
        bindings: {},
        dirty: /* @__PURE__ */ new Set(),
        tally: {
            removed: 0,
            filesWritten: 0,
            errors: 0
        }
    };
    return ds(e, n), n.tally;
}
const _o = /^GSE.*\.lua$/i,
    Ao = /^!?Bug(Grabber|Sack)\.lua$/i,
    Mn = 4 * 1024 * 1024,
    at = 40,
    xn = 4e4;

function Io(e) {
    return [P(e, "Interface", "AddOns"), P(e, "WTF")];
}

function Nn(e, t) {
    const n = xe(e);
    if (!t.some((o) => {
            const a = xe(o);
            return n === a || n.startsWith(a + bt);
        })) return !1;
    try {
        const o = In(n);
        return t.some((a) => {
            let r;
            try {
                r = In(a);
            } catch {
                return !1;
            }
            return o === r || o.startsWith(r + bt);
        });
    } catch {
        return !0;
    }
}

function ut(e) {
    let t;
    try {
        t = ot(e);
    } catch {
        return null;
    }
    if (!t.isFile()) return null;
    if (t.size > Mn) return `(skipped: ${t.size} bytes exceeds ${Mn} cap)`;
    try {
        return we(e, "utf8");
    } catch (n) {
        return `(read error: ${n.message})`;
    }
}

function ps(e, t, n, s) {
    if (n.n >= xn || s.length >= at) return;
    let o;
    try {
        o = Fe(e, {
            withFileTypes: !0
        });
    } catch {
        return;
    }
    for (const a of o) {
        if (n.n >= xn || s.length >= at) return;
        n.n += 1;
        const r = P(e, a.name);
        a.isDirectory() ? ps(r, t, n, s) : a.name === t && s.push(r);
    }
}

function To() {
    const e = [];
    let t = [];
    try {
        t = q().wowPaths ?? [];
    } catch {
        return e;
    }
    for (const {
            path: s
        }
        of dn(t, (o) => _o.test(o))) {
        const o = ut(s);
        e.push({
            kind: `gseSv:${vt(s)}`,
            path: s,
            content: o ?? "(missing or unreadable)"
        });
    }
    let n = [];
    try {
        n = t.flatMap((s) => Se(s));
    } catch {}
    for (const s of n) {
        const o = P(s.path, "Interface", "AddOns", "GSE_Companion", "GSE_Companion_Data.lua"),
            a = ut(o);
        e.push({
            kind: `companionData-${s.name || "client"}`,
            path: o,
            content: a ?? "(missing or unreadable)"
        });
    }
    return e;
}

function vo() {
    const e = [];
    let t = [];
    try {
        t = q().wowPaths ?? [];
    } catch {
        return e;
    }
    for (const {
            path: n
        }
        of dn(t, (s) => Ao.test(s))) {
        const s = ut(n);
        e.push({
            kind: `errorLog:${vt(n)}`,
            path: n,
            content: s ?? "(missing or unreadable)"
        });
    }
    return e;
}

function Eo(e) {
    if (!Array.isArray(e) || !e.length) return [];
    const t = [];
    let n = [];
    try {
        n = (q().wowPaths ?? []).flatMap((o) => Se(o));
    } catch {
        return t;
    }
    for (const s of n) {
        if (t.length >= at) break;
        const o = Io(s.path),
            a = s.name || "client";
        for (const r of e) {
            if (t.length >= at) break;
            const c = String(r || "").replace(/\\/g, "/").replace(/^\/+/, "").trim();
            if (!(!c || c.includes("..")))
                if (c.includes("/")) {
                    const i = P(s.path, ...c.split("/").filter(Boolean));
                    if (!Nn(i, o)) {
                        t.push({
                            kind: `capture-denied-${a}`,
                            path: i,
                            content: "(denied: out of allowed scope)"
                        });
                        continue;
                    }
                    const l = ut(i);
                    l != null && t.push({
                        kind: `capture-${a}`,
                        path: i,
                        content: l
                    });
                } else {
                    const i = [],
                        l = {
                            n: 0
                        };
                    for (const f of o) ps(f, c, l, i);
                    for (const f of i) {
                        if (t.length >= at) break;
                        if (!Nn(f, o)) continue;
                        const u = ut(f);
                        u != null && t.push({
                            kind: `capture-${a}`,
                            path: f,
                            content: u
                        });
                    }
                }
        }
    }
    return t;
}
const Po = "b531cb8b505ae9752b5b789f26085853b0ba5da5d7e7e244975f0545430d683a";

function Co(e) {
    const t = new Uint8Array(e.length / 2);
    for (let n = 0; n < t.length; n++) t[n] = parseInt(e.substr(n * 2, 2), 16);
    return t;
}
const Oo = Co(Po);

function hs(e) {
    if (e === null) return "null";
    if (typeof e != "object") return JSON.stringify(e);
    const t = Array.isArray(e) ? e.map((n, s) => [String(s + 1), n]) : Object.entries(e);
    return t.sort((n, s) => n[0] < s[0] ? -1 : n[0] > s[0] ? 1 : 0), "{" + t.map(([n, s]) => JSON.stringify(n) + ":" + hs(s)).join(",") + "}";
}

function qo(e) {
    if (!e || typeof e != "object" || typeof e.sig != "string" || !e.sig.startsWith("v2:")) return null;
    const {
        sig: t,
        ...n
    } = e;
    let s;
    try {
        s = Uint8Array.from(Buffer.from(t.slice(3), "base64url"));
    } catch {
        return null;
    }
    if (s.length !== 64) return null;
    const o = new TextEncoder().encode(hs(n));
    try {
        return Qs.sign.detached.verify(o, s, Oo) ? n : null;
    } catch {
        return null;
    }
} {
    const e = process.argv.indexOf("--build-manifest-respond");
    if (process.argv.includes("--emit-build-manifest"))
        process.stdout.write("MANIFEST_BEGIN" + JSON.stringify(ls()) + "MANIFEST_END"), process.exit(0);
    else if (e !== -1) {
        const t = cs(process.argv[e + 1], JSON.parse(process.argv[e + 2]));
        process.stdout.write("MANIFEST_BEGIN" + t + "MANIFEST_END"), process.exit(0);
    }
}

function Vn(e, t) {
    const n = cn(e);
    return n && n !== "Unknown" ? n : t || "Midnight";
}
const te = "https://api.qik.dev",
    re = "https://api.gse.tools",
    jo = "69c5b37340521b7b01536a59";
async function Do(e, t, n, s, o) {
    if (!Array.isArray(e) || e.length === 0) return;
    const a = 750,
        r = 6e4;
    for (const c of e) {
        const {
            batchId: i,
            contentType: l
        } = c;
        if (!i || !l) continue;
        const f = (c.items || []).map((w) => {
            const T = t[w.originalIndex] || {};
            return {
                originalIndex: w.originalIndex,
                originKey: w.originKey,
                title: w.title,
                kind: T.kind,
                name: T.name,
                expansion: T.expansion,
                classKey: T.classKey,
                hash: T.hash
            };
        });
        C?.webContents.send("sync:batch-progress", {
            account: n,
            contentType: l,
            batchId: i,
            total: f.length,
            completed: 0,
            percent: 0,
            phase: "submitted"
        });
        const u = Date.now();
        let h = null;
        for (; Date.now() - u < r;) {
            try {
                const w = await fetch(`${te}/batch/${i}`, {
                    headers: {
                        ...o ? {
                            Authorization: `Bearer ${o}`
                        } : {}
                    }
                });
                if (w.ok) {
                    const T = await w.json().catch(() => null);
                    if (h = T?.[i] ?? T, h?.progress && C?.webContents.send("sync:batch-progress", {
                            account: n,
                            contentType: l,
                            batchId: i,
                            total: h.progress.total ?? f.length,
                            completed: h.progress.completed ?? 0,
                            percent: h.progress.percent ?? 0,
                            phase: h.completed ? "recovering" : "running"
                        }), h?.completed) break;
                }
            } catch {}
            await new Promise((w) => setTimeout(w, a));
        }
        if (!h?.completed) {
            console.warn(`[sync.batch] poll timeout batch=${i} ct=${l}`), C?.webContents.send("sync:batch-progress", {
                account: n,
                contentType: l,
                batchId: i,
                total: f.length,
                completed: 0,
                percent: 0,
                phase: "timeout"
            });
            continue;
        }
        const y = /* @__PURE__ */ new Map(),
            p = /* @__PURE__ */ new Map();
        for (const w of f)
            w.originKey && y.set(w.originKey, w), w.title && p.set(w.title, w);
        const I = q().userSession,
            E = I?.persona ?? I?.session?.persona,
            S = E && (E._id || E.id || E);
        if (!S) {
            console.warn(`[sync.batch] no persona for list — batch=${i}`);
            continue;
        }
        let k = [];
        try {
            const w = await fetch(`${te}/content/${l}/list`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...o ? {
                        Authorization: `Bearer ${o}`
                    } : {}
                },
                body: JSON.stringify({
                    filter: {
                        operator: "and",
                        filters: [{
                            key: "meta.personaAuthor",
                            comparator: "equal",
                            value: S
                        }]
                    },
                    sort: {
                        key: "meta.created",
                        direction: "desc"
                    },
                    page: {
                        size: Math.max(f.length * 2, 50)
                    },
                    select: ["_id", "title", "data.wowOriginKey"]
                })
            });
            w.ok ? k = (await w.json().catch(() => null))?.items || [] : console.warn(`[sync.batch] list HTTP ${w.status} batch=${i}`);
        } catch (w) {
            console.warn(`[sync.batch] list failed batch=${i}:`, w.message);
        }
        const g = [],
            O = /* @__PURE__ */ new Set();
        for (const w of k) {
            const T = w.data?.wowOriginKey;
            if (T && y.has(T)) {
                const N = y.get(T);
                if (!O.has(N.originalIndex)) {
                    O.add(N.originalIndex), g.push({
                        ctx: N,
                        _id: w._id
                    });
                    continue;
                }
            }
            if (w.title && p.has(w.title)) {
                const N = p.get(w.title);
                O.has(N.originalIndex) || (O.add(N.originalIndex), g.push({
                    ctx: N,
                    _id: w._id
                }));
            }
        }
        if (!g.length) {
            console.warn(`[sync.batch] no ids recovered batch=${i} ct=${l}`), C?.webContents.send("sync:batch-progress", {
                account: n,
                contentType: l,
                batchId: i,
                total: f.length,
                completed: 0,
                percent: 100,
                phase: "no-recovery"
            });
            continue;
        } {
            const w = q(),
                T = w.cachedSiteIds ?? {};
            T[n] = T[n] ?? {};
            const N = w.contentHashes ?? {},
                U = l === "sequence" ? "sequences" : l === "gseVariable" ? "variables" : l === "gseMacro" ? "macros" : null,
                x = U ? N[U] = N[U] ?? {} : null;
            for (const {
                    ctx: R,
                    _id: me
                }
                of g)
                if (R.originKey && R.expansion && (T[n][he(R.originKey, R.expansion)] = me), x && R.originKey && R.hash) {
                    const ne = _e(null, n, R.originKey),
                        ue = _e(me, n, R.originKey);
                    x[ue] = R.hash, ne !== ue && delete x[ne];
                }
            G({
                cachedSiteIds: T,
                contentHashes: N
            }), nr();
        }
        if (s) {
            const w = g.map(({
                ctx: T,
                _id: N
            }) => ({
                action: "setPlatformID",
                contentType: l,
                name: T.name || T.title,
                classid: T.kind === "seq" && T.classKey != null ? Number(T.classKey) : 0,
                platformid: N
            }));
            try {
                ge(s, {
                    queue: w
                });
            } catch (T) {
                console.warn("[sync.batch] bridge write failed:", T.message);
            }
        }
        C?.webContents.send("sync:batch-progress", {
            account: n,
            contentType: l,
            batchId: i,
            total: f.length,
            completed: g.length,
            percent: 100,
            phase: "done"
        }), console.log(`[sync.batch] resolved ${g.length}/${f.length} ${l} (batch=${i}) on ${n}`);
    }
}

function Mo(e) {
    return typeof e != "string" ? e : e.replace(/\|c[0-9a-fA-F]{8}/gi, "").replace(/\|r/gi, "");
}

function ft(e) {
    return e === null || typeof e != "object" ? JSON.stringify(e) : Array.isArray(e) ? "[" + e.map(ft).join(",") + "]" : "{" + Object.keys(e).sort().map((n) => JSON.stringify(n) + ":" + ft(e[n])).join(",") + "}";
}

function St(e) {
    const t = e?.Versions ?? {},
        n = e?.MetaData ?? {},
        s = {
            Default: n.Default ?? null,
            InbuiltVariables: n.InbuiltVariables ?? null,
            Dependencies: n.Dependencies ?? null,
            PvP: n.PvP ?? null
        };
    return on("sha256").update(ft({
        Versions: t,
        MetaData: s
    })).digest("hex").slice(0, 16);
}

function gs(e) {
    if (!e || typeof e != "object") return "";
    const {
        LastUpdated: t,
        GSEVersion: n,
        Author: s,
        ...o
    } = e;
    return on("sha256").update(ft(o)).digest("hex").slice(0, 16);
}

function ms(e) {
    if (!e || typeof e != "object") return "";
    const {
        LastUpdated: t,
        GSEVersion: n,
        ...s
    } = e;
    return on("sha256").update(ft(s)).digest("hex").slice(0, 16);
}

function _e(e, t, n) {
    return e ? `pid:${e}` : `loc:${t}:${n}`;
}

function Rn(e) {
    if (!e || typeof e != "object" || Array.isArray(e)) return null;
    const t = Object.keys(e).map((o) => parseInt(o, 10)).filter((o) => Number.isInteger(o) && !Number.isNaN(o));
    if (!t.length) return null;
    t.sort((o, a) => o - a);
    const n = t[0],
        s = t[t.length - 1];
    return n === 1 && s === t.length ? null : n === 0 ? `Versions starts at index 0 (Lua ipairs starts at 1 → editor and runtime see no versions). Keys: [${t.join(",")}]` : n !== 1 ? `Versions starts at index ${n} instead of 1. Keys: [${t.join(",")}]` : `Versions has gaps. Keys: [${t.join(",")}], expected 1..${t.length}`;
}

function kt(e) {
    if (!e) return e;
    let t = e.Versions,
        n = e.MetaData?.Default;
    if (Array.isArray(t) || t && typeof t == "object") {
        const a = Array.isArray(t) ? t.map((h, y) => [String(y + 1), h]) : Object.entries(t),
            r = [],
            c = [];
        for (const [h, y] of a) {
            const p = Number(h);
            Number.isInteger(p) && !isNaN(p) ? r.push([p, y]) : c.push([h, y]);
        }
        r.sort((h, y) => h[0] - y[0]);
        const i = r.filter(([, h]) => h != null),
            l = /* @__PURE__ */ new Map(),
            f = {};
        i.forEach(([h, y], p) => {
            const I = p + 1;
            f[String(I)] = xo(y), l.set(h, I);
        });
        for (const [h, y] of c) f[h] = y;
        t = f;
        const u = Number(n);
        Number.isInteger(u) && !isNaN(u) && (l.has(u) ? n = l.get(u) : l.size > 0 && (n = 1));
    }
    const s = {
        ...e,
        Versions: t
    };
    return n !== e.MetaData?.Default && e.MetaData && (s.MetaData = {
        ...e.MetaData,
        Default: n
    }), s;
}

function xo(e) {
    if (!e || typeof e != "object") return e;
    const t = Array.isArray(e.Actions) ? e.Actions.map(Qt) : e.Actions;
    return {
        ...e,
        Actions: t
    };
}

function Qt(e) {
    if (!e || typeof e != "object") return e;
    const t = {};
    for (const [n, s] of Object.entries(e))
        if (typeof s == "string")
            t[n] = Mo(s);
        else if (/^\d+$/.test(n))
        if (Array.isArray(s)) {
            const o = {};
            s.forEach((a, r) => {
                o[String(r + 1)] = Qt(a);
            }), t[n] = o;
        } else
            t[n] = Qt(s);
    else
        t[n] = s;
    return t;
}
let _ = null,
    Xt = !1,
    it = null,
    C = null,
    Oe = null,
    oe = null,
    dt = !1,
    nt = !1,
    Pe = null,
    ye = null,
    Ue = 1e3;
const No = 6e4,
    Vo = 65e3;
let Ce = [],
    Ie = [],
    gt = null;
const Yt = "69c5b349738d1f112d148281",
    Kt = /* @__PURE__ */ new Map();

function Ro(e) {
    return (e || []).map((t) => `${t._id || t.name || ""}:${t.checksum || ""}`).sort().join("|");
}

function Xe(e) {
    Ce.length && Wt.isSupported() && new Wt({
        title: "GSE Companion",
        body: `${e} — type /reload in WoW to apply.`
    }).show();
}
async function ee() {
    if (!it) {
        const {
            default: e
        } = await import("@qikdev/sdk");
        it = new e({
            apiURL: te
        });
    }
    return it;
}
async function ve() {
    try {
        const e = await ee();
        await e.auth.ensureValidToken();
        const t = e.auth.getCurrentToken();
        return t && t !== _ && (_ = t, G({
            accessToken: t,
            userSession: e.auth.getCurrentUser()
        })), t ?? _;
    } catch {
        return _;
    }
}
const Bo = 15e3,
    Zt = /* @__PURE__ */ new Map();

function Bn(e) {
    e && Zt.set(String(e), Date.now() + Bo);
}

function Ko(e) {
    if (!e) return !1;
    const t = Zt.get(String(e));
    return t ? Date.now() > t ? (Zt.delete(String(e)), !1) : !0 : !1;
}

function ys() {
    return {
        source: "companion",
        version: X.getVersion(),
        platform: process.platform,
        packageType: process.platform === "linux" ? process.env.APPIMAGE ? "appimage" : "deb" : process.platform === "darwin" ? "dmg" : "exe"
    };
}

function le() {
    const e = ys();
    return {
        "x-gse-client-version": e.version,
        "x-gse-client-source": e.source,
        "x-gse-client-platform": e.platform,
        "x-gse-client-package-type": e.packageType
    };
}
const Kn = 2e3,
    st = [];

function pn(e, t) {
    try {
        const n = ( /* @__PURE__ */ new Date()).toISOString(),
            s = t.map((o) => typeof o == "string" ? o : (() => {
                try {
                    return JSON.stringify(o);
                } catch {
                    return String(o);
                }
            })()).join(" ");
        st.push(`${n} ${e.toUpperCase()} ${s}`), st.length > Kn && st.splice(0, st.length - Kn);
    } catch {}
}
const Lo = console.log.bind(console),
    Go = console.warn.bind(console),
    Uo = console.error.bind(console);
console.log = function(...e) {
    pn("log", e), Lo(...e);
};
console.warn = function(...e) {
    pn("warn", e), Go(...e);
};
console.error = function(...e) {
    pn("error", e), Uo(...e);
};

function ws(e) {
    const t = [];
    try {
        t.push(...To());
    } catch (n) {
        console.warn("[diagnostic] mandatory GSE gather failed:", n.message);
    }
    try {
        t.push(...vo());
    } catch (n) {
        console.warn("[diagnostic] error-log gather failed:", n.message);
    }
    if (e.has("log") && t.push({
            kind: "log",
            path: "(in-memory console ring)",
            content: st.join(`
`)
        }), e.has("settings"))
        try {
            const s = {
                ...q()
            };
            delete s.accessToken, delete s.userSession, t.push({
                kind: "settings",
                path: "(settings.json)",
                content: JSON.stringify(s, null, 2)
            });
        } catch (n) {
            t.push({
                kind: "settings",
                content: `(read error: ${n.message})`
            });
        }
    return t;
}

function Fo() {
    const e = [];
    try {
        const n = (q().wowPaths ?? []).flatMap((s) => Se(s));
        for (const s of n) {
            const o = P(s.path, "Interface", "AddOns");
            let a;
            try {
                a = Fe(o, {
                    withFileTypes: !0
                });
            } catch {
                continue;
            }
            for (const r of a) {
                if (!r.isDirectory()) continue;
                const c = r.name;
                let i = c,
                    l = null;
                try {
                    const f = we(P(o, c, `${c}.toc`), "utf8"),
                        u = f.match(/^##\s*Title:\s*(.+)$/mi);
                    u && (i = u[1].trim().replace(/\|c[0-9a-fA-F]{8}|\|r/g, ""));
                    const h = f.match(/^##\s*Version:\s*(.+)$/mi);
                    h && (l = h[1].trim());
                } catch {}
                e.push({
                    client: s.name || s.folder,
                    name: c,
                    title: i,
                    version: l
                });
            }
        }
    } catch (t) {
        console.warn("[report] modlist read failed:", t.message);
    }
    return e;
}
async function zo(e, t, n) {
    if (!e) return;
    if (!_) {
        console.warn("[diagnostic] no auth — skipping");
        return;
    }
    const s = new Set((Array.isArray(t) ? t : []).map((r) => String(r).toLowerCase())),
        o = ws(s);
    if (Array.isArray(n) && n.length)
        try {
            const r = Eo(n);
            o.push(...r), console.log(`[diagnostic] captured ${r.length} requested path(s)`);
        } catch (r) {
            console.warn("[diagnostic] path capture failed:", r.message);
        }
    if (!o.length) {
        console.warn("[diagnostic] no files gathered for kinds:", [...s].join(","), "paths:", (n || []).join(","));
        return;
    }
    const a = await ve();
    if (!a) {
        console.warn("[diagnostic] token refresh failed — skipping upload");
        return;
    }
    try {
        const r = await fetch(`${re}/diagnostic/upload/${encodeURIComponent(e)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${a}`,
                ...le()
            },
            body: JSON.stringify({
                files: o
            })
        });
        if (!r.ok) {
            const i = await r.text().catch(() => "");
            console.warn(`[diagnostic] upload HTTP ${r.status}: ${i.slice(0, 200)}`);
            return;
        }
        const c = await r.json().catch(() => null);
        console.log(`[diagnostic] uploaded ${c && c.stored || o.length} file(s), ${c && c.bytes || "?"} bytes for requestId=${e}`);
    } catch (r) {
        console.warn("[diagnostic] upload failed:", r.message);
    }
}
async function Wo(e, t) {
    if (!e || !Array.isArray(t) || !t.length || !_) return;
    let n;
    try {
        n = cs(e, t);
    } catch {
        return;
    }
    const s = await ve();
    if (s)
        try {
            await fetch(`${re}/diagnostic/report/${encodeURIComponent(e)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${s}`,
                    ...le()
                },
                body: JSON.stringify({
                    digest: n
                })
            });
        } catch {}
}
async function Jo(e) {
    const t = qo(e);
    if (!t || t.exp && Date.now() > t.exp) return;
    const n = q(),
        s = n.userSession,
        o = s?.persona ?? s?.session?.persona,
        a = o && (o._id || o.id || o);
    if (t.targetPersona && a && String(t.targetPersona) !== String(a)) return;
    let r = !1;
    try {
        const i = await He();
        r = Array.isArray(i) ? i.some((l) => l?.running) : !!i;
    } catch {}
    if (r) {
        Lt(t.nonce, {
            skipped: "wow_running"
        });
        return;
    }
    let c;
    try {
        c = $o(t.plan, {
            wowPaths: n.wowPaths ?? []
        });
    } catch (i) {
        Lt(t.nonce, {
            error: i?.message || "run_failed"
        });
        return;
    }
    Lt(t.nonce, {
        ok: !0,
        ...c
    });
}
async function Lt(e, t) {
    if (!_) return;
    const n = await ve();
    if (n)
        try {
            await fetch(`${re}/diagnostic/result/${encodeURIComponent(e)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${n}`,
                    ...le()
                },
                body: JSON.stringify(t)
            });
        } catch {}
}
async function Ho(e) {
    const n = (await ee()).auth.getCurrentToken() ?? _;
    for (const a of e)
        a?.id && Bn(a.id);
    const s = await fetch(`${re}/upsert`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...n ? {
                Authorization: `Bearer ${n}`
            } : {},
            ...le()
        },
        body: JSON.stringify({
            items: e,
            clientMeta: ys()
        })
    });
    if (!s.ok) {
        const a = await s.text().catch(() => "");
        if (s.status === 426) {
            let c = null;
            try {
                c = JSON.parse(a);
            } catch {}
            C?.webContents.send("updater:server-rejected", {
                message: c?.error || "Companion update required.",
                minVersion: c?.minVersion || null,
                currentVersion: X.getVersion()
            }), yn().catch(() => {});
            const i = new Error(c?.error || "Companion needs an update");
            throw i.status = 426, i;
        }
        const r = new Error(`/upsert HTTP ${s.status}: ${a}`);
        throw r.status = s.status, r;
    }
    const o = await s.json();
    if (!o.success) {
        const a = new Error(o.error || "/upsert failed");
        throw o.error?.includes("Authentication") && (a.status = 401), a;
    }
    for (const a of o.results || [])
        a?._id && Bn(a._id);
    return {
        results: o.results || [],
        pendingBatches: o.pendingBatches || []
    };
}
async function hn(e) {
    const {
        results: t,
        pendingBatches: n
    } = await Ho(e);
    return {
        results: t.map((s) => s?.error ? {
            originKey: s.originKey,
            error: s.error
        } : s?.status === "batch-pending" ? {
            originKey: s.originKey,
            status: "batch-pending",
            batchId: s.batchId,
            contentType: s.contentType
        } : {
            originKey: s.originKey,
            status: s.status,
            _id: s.id
        }),
        pendingBatches: n
    };
}
let de = null,
    Ct = !1;

function Qo() {
    return X.isPackaged ? P(process.resourcesPath, "tray-icon.png") : xe(X.getAppPath(), "resources", "tray-icon.png");
}

function Xo() {
    if (de) return de;
    try {
        const e = An.createFromPath(Qo());
        de = new Ms(e.isEmpty() ? An.createEmpty() : e), de.setToolTip("GSE Companion"), Yo(), de.on("click", () => {
            if (!C) {
                $t();
                return;
            }
            C.isVisible() ? C.hide() : (C.show(), C.focus());
        });
    } catch (e) {
        console.warn("[tray] failed to create:", e.message), de = null;
    }
    return de;
}

function Yo() {
    if (!de) return;
    const e = xs.buildFromTemplate([{
            label: "Show GSE Companion",
            click: () => {
                C ? (C.show(), C.focus()) : $t();
            }
        },
        {
            type: "separator"
        },
        {
            label: "Quit",
            click: () => {
                Ct = !0, X.quit();
            }
        }
    ]);
    de.setContextMenu(e);
}

function $t() {
    const {
        windowBounds: e
    } = q();
    C = new Wn({
        width: e?.width ?? 1024,
        height: e?.height ?? 700,
        x: e?.x,
        y: e?.y,
        minWidth: 800,
        minHeight: 560,
        backgroundColor: "#1c1c1c",
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
        webPreferences: {
            preload: X.isPackaged ? P(Tn, "../preload/index.mjs") : xe(X.getAppPath(), "out/preload/index.mjs"),
            contextIsolation: !0,
            nodeIntegration: !1,
            sandbox: !1
        }
    }), C.on("close", (t) => {
        G({
            windowBounds: C.getBounds()
        });
        const s = q().minimizeToTray !== !1;
        !Ct && s && de && (t.preventDefault(), C.hide());
    }), process.env.ELECTRON_RENDERER_URL ? C.loadURL(process.env.ELECTRON_RENDERER_URL) : C.loadFile(P(Tn, "../renderer/index.html"));
}

function Zo() {
    const e = q().cachedSiteIds ?? {},
        t = /* @__PURE__ */ new Set();
    for (const n of Object.values(e))
        if (n && typeof n == "object")
            for (const s of Object.values(n))
                s && typeof s == "string" && t.add(s);
    return [...t];
}
let Ge = null;

function er(e, t) {
    if (!t || e.length !== t.size) return !1;
    for (const n of e)
        if (!t.has(n)) return !1;
    return !0;
}
let mt = null;
const tr = 750;

function nr() {
    _ && (mt && clearTimeout(mt), mt = setTimeout(() => {
        mt = null, Ot();
    }, tr));
}

function yt() {
    ye || !_ || (console.log(`[sse] reconnect in ${Ue}ms`), ye = setTimeout(() => {
        ye = null, Ot();
    }, Ue), Ue = Math.min(Ue * 2, No));
}

function sr(e) {
    if (!e || e.startsWith(":") || !e.startsWith("data:")) return;
    let t;
    try {
        t = JSON.parse(e.slice(5).trim());
    } catch {
        return;
    }
    if (t?.type === "content:changed") {
        if (Ko(t.id)) {
            console.log(`[sse] content:changed id=${t.id} — self-echo, ignored`);
            return;
        }
        const n = t.id && en.includes(t.contentType) ? {
            id: t.id,
            contentType: t.contentType
        } : null;
        console.log(`[sse] content:changed id=${t.id} type=${t.contentType} — ${n ? "targeted" : "full"} sync`), pt(!1, !1, n).catch(() => {});
    } else t?.type === "companion:request" && (t.task ? Jo(t.task).catch(() => {}) : Array.isArray(t.idx) ? Wo(t.requestId, t.idx).catch(() => {}) : (console.log(`[sse] companion:request requestId=${t.requestId} kinds=${(t.kinds || []).join(",")} paths=${(t.paths || []).join(",")}`), zo(t.requestId, t.kinds || [], t.paths || []).catch((n) => {
        console.warn("[diagnostic] fulfilment failed:", n && n.message);
    })));
}

function Ot() {
    if (!_) return;
    const e = Zo();
    if (!e.length) {
        oe && (oe.abort(), oe = null), Ge = null;
        return;
    }
    Ge && oe && !oe.signal.aborted && er(e, Ge) || (oe && (oe.abort(), oe = null), ye && (clearTimeout(ye), ye = null), Ge = null, oe = new AbortController(), (async () => {
        let t;
        try {
            const o = await ve();
            if (!o) {
                yt();
                return;
            }
            if (t = await fetch(`${re}/events/subscribe`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${o}`,
                        ...le()
                    },
                    body: JSON.stringify({
                        ids: e
                    }),
                    signal: oe.signal
                }), !t.ok) {
                console.warn(`[sse] subscribe HTTP ${t.status} — will reconnect`), yt();
                return;
            }
        } catch (o) {
            if (o.name === "AbortError") return;
            console.warn("[sse] connect failed:", o.message), yt();
            return;
        }
        Ue = 1e3, Ge = new Set(e), console.log(`[sse] connected, watching ${e.length} ids`), dt ? console.log("[sse] reconnect — catch-up already done this session, skipping broad sweep") : (dt = !0, pt().catch(() => {}));
        let n = null;
        const s = () => {
            clearTimeout(n), n = setTimeout(() => {
                console.warn("[sse] stale — no data in 65s, reconnecting"), oe?.abort();
            }, Vo);
        };
        s();
        try {
            const o = new TextDecoder();
            let a = "";
            for await (const r of t.body) {
                s(), a += o.decode(r, {
                    stream: !0
                });
                const c = a.split(`
`);
                a = c.pop();
                for (const i of c) sr(i.trim());
            }
        } catch (o) {
            o.name !== "AbortError" && console.warn("[sse] stream error:", o.message);
        } finally {
            clearTimeout(n), Ge = null;
        }
        oe?.signal.aborted || yt();
    })());
}

function bs() {
    try {
        const t = (q().wowPaths ?? []).flatMap((s) => Se(s));
        let n = 0;
        for (const s of t) {
            const o = Ne(s.path),
                a = [],
                r = [];
            for (const c of o) {
                const {
                    processedIds: i,
                    importedKeys: l
                } = un(c.path);
                a.push(...i), r.push(...l);
            }
            if (a.length || r.length) {
                const c = ln(s.path, a, r);
                c > 0 && (console.log(`[startup-prune] cleared ${c} acknowledged entr${c === 1 ? "y" : "ies"} for ${s.name}`), n += c);
            }
        }
        n === 0 && console.log("[startup-prune] nothing to clear");
    } catch (e) {
        console.warn("[startup-prune] failed:", e.message);
    }
}
async function Ss() {
    if (!nt) {
        if (Pe) return Pe;
        if (_)
            return Pe = (async () => {
                try {
                    const e = await ve();
                    if (!e) return;
                    const t = await fetch(`${re}/sync/repair-flags`, {
                        headers: {
                            Authorization: `Bearer ${e}`,
                            ...le()
                        }
                    });
                    if (!t.ok) {
                        console.warn(`[repair-upload] /sync/repair-flags HTTP ${t.status} — skipping this session`);
                        return;
                    }
                    const n = await t.json().catch(() => null),
                        s = new Set(n?.ids || []);
                    if (!s.size) {
                        console.log("[repair-upload] server lists 0 flagged records"), nt = !0;
                        return;
                    }
                    console.log(`[repair-upload] server lists ${s.size} flagged record(s); scanning local SVs`);
                    const a = (q().wowPaths ?? []).flatMap((f) => Se(f)),
                        r = /* @__PURE__ */ new Set(),
                        c = [];
                    for (const f of a) {
                        const u = Pt(f.path);
                        for (const h of Ne(f.path)) {
                            const y = P(h.path, "SavedVariables", "GSE.lua"),
                                p = Ae(y);
                            if (!p) continue;
                            const I = mn(p, h.name, u);
                            for (const E of I) {
                                if (E.type !== "sequence") continue;
                                const S = E.payload?.data?.sequenceData?.MetaData?.PlatformID;
                                !S || !s.has(S) || r.has(S) || (r.add(S), c.push({
                                    contentType: E.type,
                                    id: S,
                                    originKey: E.originKey,
                                    payload: E.payload
                                }));
                            }
                        }
                    }
                    if (!c.length) {
                        console.log(`[repair-upload] none of ${s.size} flagged ids matched local SV — nothing to upload`), nt = !0;
                        return;
                    }
                    console.log(`[repair-upload] uploading ${c.length}/${s.size} flagged record(s)`);
                    let i = 0,
                        l = 0;
                    for (let f = 0; f < c.length; f += Me) {
                        const u = c.slice(f, f + Me);
                        try {
                            const {
                                results: h
                            } = await hn(u);
                            for (const y of h)
                                y?.error ? l++ : i++;
                        } catch (h) {
                            l += u.length, console.warn("[repair-upload] batch failed:", h.message);
                        }
                    }
                    console.log(`[repair-upload] done — uploaded ${i}, failed ${l} (of ${c.length})`), nt = !0;
                } catch (e) {
                    console.warn("[repair-upload] failed:", e.message);
                } finally {
                    Pe = null;
                }
            })(), Pe;
    }
}

function ks() {
    Oe = setInterval(async () => {
        const e = await He(),
            t = Ce.filter((s) => !e.includes(s)),
            n = e.filter((s) => !Ce.includes(s));
        if ((n.length || t.length) && (C?.webContents.send("wow:state-changed", {
                running: e,
                started: n,
                stopped: t
            }), t.length)) {
            const {
                syncOnClose: s
            } = q();
            if (s === !1) return;
            C?.webContents.send("sync:started", {}), await pt(), C?.webContents.send("sync:finished", {
                at: ( /* @__PURE__ */ new Date()).toISOString()
            });
        }
        Ce = e;
    }, 1e4);
}

function gn() {
    for (const s of Ie)
        try {
            s.close();
        } catch {}
    Ie = [];
    const {
        syncOnClose: e,
        wowPaths: t
    } = q();
    if (e === !1 || !t?.length) return;
    const n = t.flatMap((s) => Se(s));
    for (const s of n)
        for (const o of Ne(s.path)) {
            const a = P(o.path, "SavedVariables");
            if (z(a))
                try {
                    const r = Rs(a, (c, i) => {
                        if (i && !i.startsWith("GSE") || !_) return;
                        const {
                            syncOnClose: l
                        } = q();
                        l !== !1 && (Ce && Ce.length > 0 || (gt && clearTimeout(gt), gt = setTimeout(async () => {
                            gt = null, !(Ce && Ce.length > 0) && (console.log("[sync] WTF file change detected (WoW not running), running outgoing sync..."), C?.webContents.send("sync:started", {}), await pt(!1, !0), C?.webContents.send("sync:finished", {
                                at: ( /* @__PURE__ */ new Date()).toISOString()
                            }));
                        }, 3e4)));
                    });
                    Ie.push(r);
                } catch (r) {
                    console.log("[sync] failed to watch", a, r.message);
                }
        }
    Ie.length && console.log(`[sync] watching ${Ie.length} SavedVariables dir(s) for changes`);
}
const Me = 25,
    en = ["sequence", "gseVariable", "gseMacro"];
async function Ln(e, t, n, s = null) {
    const o = {
        type: e
    };
    t && (o.since = t), s && s.length && (o.ids = s);
    try {
        const a = await fetch(`${re}/sync/incoming`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...n ? {
                    Authorization: `Bearer ${n}`
                } : {},
                ...le()
            },
            body: JSON.stringify(o)
        });
        return a.ok ? await a.json() : (console.warn(`[sync] /sync/incoming ${e} HTTP ${a.status}`), {
            items: [],
            nextCursor: null
        });
    } catch (a) {
        return console.warn(`[sync] /sync/incoming ${e} failed:`, a.message), {
            items: [],
            nextCursor: null
        };
    }
}

function Gt(e) {
    let t = null;
    for (const n of e || []) {
        const s = n.updatedAt;
        s && (!t || s > t) && (t = s);
    }
    return t;
}
async function $s(e, t, n) {
    const s = {
            "Content-Type": "application/json",
            ...t ? {
                Authorization: `Bearer ${t}`
            } : {},
            ...le()
        },
        o = JSON.stringify({
            ids: e,
            source: "companion",
            ...n ? {
                modVersion: n
            } : {}
        }),
        a = await fetch(`${re}/compute/exportGSE`, {
            method: "POST",
            headers: s,
            body: o
        });
    if (!a.ok) throw new Error(`Export failed (${a.status})`);
    return await a.json();
}
const _t = process.env.GSE_NOOP_DEBUG === "1",
    At = /* @__PURE__ */ new Set(["Test2", "Prescience", "Decursive", "AUGMENTATION"]);

function tn(e, t, n) {
    if (!e || !t) return !1;
    const s = e.GSEVariables?.[t];
    if (typeof s != "string")
        return _t && At.has(t) && console.log(`[noop-debug] var "${t}": no local entry (sv.GSEVariables[${t}] is ${typeof s})`), !1;
    const o = fe(s),
        a = fe(n),
        r = o?.funct,
        c = a?.funct,
        i = typeof r == "string" && typeof c == "string" && r === c;
    if (_t && At.has(t) && !i && (console.log(`[noop-debug] var "${t}" mismatch: local funct len=${r?.length ?? "nil"} incoming funct len=${c?.length ?? "nil"}`), typeof r == "string" && typeof c == "string" && r !== c)) {
        let l = 0;
        for (; l < Math.min(r.length, c.length) && r[l] === c[l];) l++;
        console.log(`[noop-debug] var "${t}" first diff at ${l}: local=${JSON.stringify(r.slice(Math.max(0, l - 10), l + 30))} incoming=${JSON.stringify(c.slice(Math.max(0, l - 10), l + 30))}`);
    }
    return i;
}

function nn(e, t, n) {
    if (!e || !t) return !1;
    const s = e.GSEMacros?.[t],
        o = s && typeof s == "object" ? s.text : null,
        r = fe(n)?.text,
        c = typeof o == "string" && typeof r == "string" && o === r;
    if (_t && At.has(t) && !c && (console.log(`[noop-debug] mac "${t}" mismatch: local text len=${o?.length ?? "nil"} incoming text len=${r?.length ?? "nil"}`), typeof o == "string" && typeof r == "string")) {
        let i = 0;
        for (; i < Math.min(o.length, r.length) && o[i] === r[i];) i++;
        console.log(`[noop-debug] mac "${t}" first diff at ${i}: local=${JSON.stringify(o.slice(Math.max(0, i - 10), i + 30))} incoming=${JSON.stringify(r.slice(Math.max(0, i - 10), i + 30))}`);
    }
    return c;
}

function sn(e, t, n) {
    if (!e || !t || !n) return !1;
    const s = n[t];
    if (typeof s != "string") return !1;
    const a = fe(s)?.payload?.Sequences?.[t];
    if (!a) return !1;
    const r = St(kt({
            Versions: a.Versions ?? a.Macros ?? {},
            MetaData: a.MetaData ?? {}
        })),
        c = e.GSESequences ?? {};
    for (const i of Object.values(c)) {
        if (!i || typeof i != "object") continue;
        const l = i[t];
        if (typeof l != "string") continue;
        const f = fe(l);
        if (!f) continue;
        const u = Array.isArray(f) ? f[1] : f?.payload?.Sequences?.[t];
        if (!u) continue;
        const h = St(kt({
            Versions: u.Versions ?? u.Macros ?? {},
            MetaData: u.MetaData ?? {}
        }));
        if (h === r) return !0;
        if (_t && At.has(t)) {
            const y = Object.keys(u.Versions || u.Macros || {}),
                p = Object.keys(a.Versions || a.Macros || {});
            console.log(`[noop-debug] seq "${t}" hash mismatch: local=${h} incoming=${r} (localVerKeys=[${y.join(",")}] incomingVerKeys=[${p.join(",")}])`);
        }
    }
    return !1;
}

function or(e) {
    if (!Array.isArray(e) || !e.length) return;
    const t = new Set(q().notifiedArchivedOrigins || []),
        n = e.filter((s) => s && s.id && !t.has(String(s.id)));
    if (n.length) {
        for (const s of n) t.add(String(s.id));
        G({
            notifiedArchivedOrigins: [...t].slice(-500)
        }), C?.webContents.send("archived-origins", {
            items: n.map((s) => ({
                id: s.id,
                name: s.name || null,
                author: s.author || s.wowAuthor || null,
                reason: s.reason || "archived"
            }))
        });
    }
}
async function rr(e, t, n, s = !1, o = null, a = null, r = null) {
    const i = q().lastIncomingByType ?? {},
        l = i[t.name] ?? {},
        f = await ve();
    if (!f) return {
        count: 0,
        updatedIds: /* @__PURE__ */ new Set()
    };
    let u = {
            items: []
        },
        h = {
            items: []
        },
        y = {
            items: []
        };
    if (r?.id && en.includes(r.contentType)) {
        const d = await Ln(r.contentType, null, f, [r.id]);
        r.contentType === "sequence" ? u = d : r.contentType === "gseVariable" ? h = d : r.contentType === "gseMacro" && (y = d);
    } else
        [u, h, y] = await Promise.all(
            en.map((d) => Ln(d, s ? null : l[d], f))
        );
    const p = (u.items || []).map((d) => ({
            _id: d._id,
            name: d.title,
            author: d.author,
            checksum: d.checksum,
            expansionVersion: d.expansionVersion || "",
            sequences: {
                [d.title]: d.encoded
            },
            ...d._fromRelationship ? {
                _fromRelationship: d._fromRelationship
            } : {},
            ...d._isUpstreamUpdate ? {
                _isUpstreamUpdate: !0
            } : {}
        })),
        I = (h.items || []).map((d) => ({
            _id: d._id,
            name: d.title,
            author: d.author,
            checksum: d.checksum,
            encoded: d.encoded
        })),
        E = (y.items || []).map((d) => ({
            _id: d._id,
            name: d.title,
            author: d.author,
            checksum: d.checksum,
            encoded: d.encoded
        }));
    if (or(u.archivedOrigins), !p.length && !I.length && !E.length)
        return {
            count: 0,
            updatedIds: /* @__PURE__ */ new Set()
        };
    const S = p.filter((d) => !d._isUpstreamUpdate),
        k = p.filter((d) => d._isUpstreamUpdate),
        g = o instanceof Set ? o : /* @__PURE__ */ new Set(),
        O = e.expansion || "",
        w = (d) => {
            const se = (d || "").trim();
            return !se || se === "Unknown" || !O ? !0 : se === O;
        },
        T = S.filter((d) => w(d.expansionVersion)),
        N = S.length - T.length;
    N > 0 && console.log(`[sync] incoming: dropped ${N} sequence(s) that don't match ${e.name} (${O})`);
    let U = T.filter((d) => !g.has(d._id)),
        x = I.filter((d) => !g.has(d._id)),
        R = E.filter((d) => !g.has(d._id));
    const me = S.length - U.length + (I.length - x.length) + (E.length - R.length);
    me > 0 && console.log(`[sync] incoming: skipped ${me} item(s) with pending local changes`);
    const ne = new Set(We());
    if (ne.size) {
        const d = U.length,
            se = x.length,
            Re = R.length;
        U = U.filter((ae) => !ne.has(String(ae._id))), x = x.filter((ae) => !ne.has(String(ae._id))), R = R.filter((ae) => !ne.has(String(ae._id)));
        const Ee = d - U.length + (se - x.length) + (Re - R.length);
        Ee > 0 && console.log(`[sync] incoming: dropped ${Ee} item(s) on the user ignore list`);
    }
    if (a) {
        const d = U.length,
            se = x.length,
            Re = R.length;
        U = U.filter((ae) => !sn(a, ae.name, ae.sequences)), x = x.filter((ae) => !tn(a, ae.name, ae.encoded)), R = R.filter((ae) => !nn(a, ae.name, ae.encoded));
        const Ee = d - U.length + (se - x.length) + (Re - R.length);
        Ee > 0 && console.log(`[sync] incoming: dropped ${Ee} no-op item(s) — local already matches the server's copy.`);
    }
    const ue = /* @__PURE__ */ new Set();
    if (a) {
        for (const d of S)
            d._id && (sn(a, d.name, d.sequences) || ue.add(d._id));
        for (const d of I)
            d._id && (tn(a, d.name, d.encoded) || ue.add(d._id));
        for (const d of E)
            d._id && (nn(a, d.name, d.encoded) || ue.add(d._id));
    } else {
        for (const d of S) d._id && ue.add(d._id);
        for (const d of I) d._id && ue.add(d._id);
        for (const d of E) d._id && ue.add(d._id);
    }
    const qe = [
        ...U.map((d) => ({
            _id: d._id,
            contentType: "sequence",
            name: d.name || "",
            author: d.author || "",
            source: "gsecompanion",
            checksum: d.checksum || "",
            sequences: d.sequences
        })),
        ...x.map((d) => ({
            _id: d._id,
            contentType: "gseVariable",
            name: d.name || "",
            author: d.author || "",
            source: "gsecompanion",
            checksum: d.checksum || "",
            encoded: d.encoded
        })),
        ...R.map((d) => ({
            _id: d._id,
            contentType: "gseMacro",
            name: d.name || "",
            author: d.author || "",
            source: "gsecompanion",
            checksum: d.checksum || "",
            encoded: d.encoded
        }))
    ];
    if (qe.length) {
        ge(e.path, {
            incomingQueue: qe
        });
        const d = Ro(qe);
        Kt.get(e.path) !== d && (Xe(`${qe.length} update(s) ready`), Kt.set(e.path, d)), console.log(`[sync] incoming: wrote ${U.length} sequence(s), ${x.length} variable(s), ${R.length} macro(s) to bridge`);
    } else
        Kt.delete(e.path);
    const ke = ne.size ? k.filter((d) => !ne.has(String(d._id)) && !ne.has(String(d._fromRelationship || ""))) : k;
    ke.length && (C?.webContents.send("sync:upstream-updates", {
        account: t.name,
        clientPath: e.path,
        updates: ke.map((d) => ({
            name: d.name,
            author: d.author,
            relationshipId: d._fromRelationship,
            sequences: d.sequences
        }))
    }), new Wt({
        title: "GSE Companion",
        body: `${ke.length} upstream update(s) available for your forked sequences`
    }).show(), console.log(`[sync] incoming: ${ke.length} upstream update(s) sent to renderer${ne.size && ke.length !== k.length ? ` (${k.length - ke.length} ignored)` : ""}`));
    const Ve = {
            ...l
        },
        pe = Gt(u.items),
        Ye = Gt(h.items),
        Ze = Gt(y.items);
    pe && (Ve.sequence = pe), Ye && (Ve.gseVariable = Ye), Ze && (Ve.gseMacro = Ze);
    const jt = {
        ...i,
        [t.name]: Ve
    };
    return G({
        lastIncomingByType: jt
    }), {
        count: p.length + I.length + E.length,
        updatedIds: ue
    };
}

function he(e, t) {
    return `${e}|${t}`;
}
async function Gn(e, t, n, s) {
    if (!t || !n || !s) return /* @__PURE__ */ new Map();
    const o = /* @__PURE__ */ new Map();
    let a = 0;
    for (;;) {
        let r;
        try {
            r = await fetch(`${te}/content/${e}/list`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${s}`
                },
                body: JSON.stringify({
                    filter: {
                        operator: "and",
                        filters: [{
                                key: "meta.personaAuthor",
                                comparator: "equal",
                                value: t
                            }
                            // wowAccountName intentionally NOT in filter — it's a
                            // display-only field (export action overwrites it with the
                            // gseMember nickname) and legacy records may have it missing.
                            // Persona scope is the correct partition.
                        ]
                    },
                    page: {
                        size: 500,
                        index: a
                    },
                    select: ["_id", "title", "data.accessLevel"]
                })
            });
        } catch (l) {
            return console.warn(`[sync] ${e} id-map fetch failed:`, l.message), o;
        }
        if (!r.ok)
            return console.warn(`[sync] ${e} id-map HTTP ${r.status}`), o;
        const i = (await r.json().catch(() => null))?.items ?? [];
        for (const l of i)
            l.title && l._id && o.set(l.title, {
                id: l._id,
                accessLevel: l.data?.accessLevel ?? null
            });
        if (i.length < 500 || (a += 1, a > 20)) break;
    }
    return o;
}
async function ar(e, t, n) {
    if (!e || !t || !n) return /* @__PURE__ */ new Map();
    const s = /* @__PURE__ */ new Map();
    let o = 0;
    for (;;) {
        let a;
        try {
            a = await fetch(`${te}/content/sequence/list`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${n}`
                },
                body: JSON.stringify({
                    filter: {
                        operator: "and",
                        filters: [{
                                key: "meta.personaAuthor",
                                comparator: "equal",
                                value: e
                            }
                            // wowAccountName intentionally NOT in filter — it's a
                            // display-only field (export action overwrites it with the
                            // gseMember nickname) and legacy records may have it missing.
                            // Persona scope is the correct partition.
                        ]
                    },
                    page: {
                        size: 500,
                        index: o
                    },
                    select: ["_id", "data.wowOriginKey", "data.expansionVersion", "data.accessLevel"]
                })
            });
        } catch (i) {
            return console.warn("[sync] seq access prefetch failed:", i.message), s;
        }
        if (!a.ok)
            return console.warn("[sync] seq access prefetch HTTP", a.status), s;
        const c = (await a.json().catch(() => null))?.items ?? [];
        for (const i of c) {
            const l = i.data?.wowOriginKey,
                f = i.data?.expansionVersion || "Unknown";
            l && i._id && s.set(he(l, f), {
                id: i._id,
                accessLevel: i.data?.accessLevel ?? null
            });
        }
        if (c.length < 500 || (o += 1, o > 20)) break;
    }
    return s;
}
let Un = Promise.resolve();
const It = /* @__PURE__ */ new Set();

function ir(e) {
    It.add(e), e.finally(() => It.delete(e));
}
async function pt(e = !1, t = !1, n = null) {
    const s = Un.catch(() => {}).then(async () => (It.size && await Promise.allSettled([...It]), cr(e, t, n)));
    return Un = s.catch(() => {}), s;
}
async function cr(e = !1, t = !1, n = null) {
    if (Xt)
        return console.log("[sync] skipped — sync is disabled for this session (dev login flag)"), [];
    if (_)
        try {
            const i = await ee();
            await i.auth.ensureValidToken();
            const l = i.auth.getCurrentToken();
            l && l !== _ && (_ = l, G({
                accessToken: l,
                userSession: i.auth.getCurrentUser()
            }));
        } catch {}
    Pe && (console.log("[sync] deferring runSync until repair-flag upload completes"), await Pe.catch(() => {}));
    const s = q(),
        o = (s.wowPaths ?? []).flatMap((i) => Se(i)),
        a = await He().catch(() => []);
    if (!s._sidecarCleanup_v1) {
        console.log("[sync] running one-time sidecar cleanup (v1)");
        for (const i of o)
            as(i.path);
        G({
            _sidecarCleanup_v1: !0,
            lastIncomingCheck: {}
        });
    }
    const r = [],
        c = /* @__PURE__ */ new Set();
    for (const i of o) {
        os(i.path);
        const l = Ne(i.path),
            f = no(i.folder, a);
        f && console.log(`[sync] ${i.name}: WoW is running — outgoing uploads paused (incoming still active). SavedVariables only flush on /reload or /logout, so the on-disk state is stale mid-session.`);
        const u = [],
            h = [];
        for (const p of l) {
            const {
                processedIds: I,
                importedKeys: E
            } = un(p.path);
            u.push(...I), h.push(...E);
        }
        if (u.length || h.length) {
            const p = ln(i.path, u, h);
            p > 0 && console.log(`[sync] pruned ${p} bridge entr${p === 1 ? "y" : "ies"} for ${i.name}`);
        }
        const y = new Set(s.syncDisabledAccounts ?? []);
        for (const p of l) {
            let I = function(m) {
                    const $ = cn(m);
                    return !$ || $ === "Unknown" ? me : $;
                },
                E = function(m, $) {
                    if (!$ || typeof $ != "object" || typeof $.text != "string") return;
                    const D = {
                            name: $.name ?? m,
                            icon: $.icon ?? null,
                            text: $.text,
                            ...$.Author ? {
                                Author: $.Author
                            } : {},
                            ...$.comments ? {
                                comments: $.comments
                            } : {},
                            // LastUpdated drives server's newer-wins gate (UTC YYYYMMDDHHMMSS
                            // stamped by the addon via GSE.GetTimestamp). Without it here the
                            // cross-account macro bouncing class can't be resolved server-side.
                            ...$.LastUpdated ? {
                                LastUpdated: $.LastUpdated
                            } : {}
                        },
                        F = ms(D),
                        J = `${m}|${$.Author ?? ""}`,
                        Y = me,
                        K = R[he(J, Y)] || ae[m] || ue.get(m)?.id || null,
                        b = _e(K, p.name, J);
                    !e && F === Re[b] || se.push({
                        name: m,
                        wow_author_name: $.Author ?? null,
                        last_updated: ( /* @__PURE__ */ new Date()).toISOString().replace(/\D/g, "").slice(0, 14),
                        data: D,
                        expansion_version: Y,
                        gse_version: null,
                        _hash: F,
                        originKey: J,
                        platformId: K
                    });
                };
            const S = `${i.path}::${p.name}`;
            if (y.has(S) || y.has(p.name)) {
                console.log(`[sync] account "${p.name}" on "${i.name}" is disabled — skipping`);
                continue;
            }
            const k = P(p.path, "SavedVariables", "GSE.lua"),
                g = Ae(k);
            if (!g) continue;
            if (g.GSESupportReports)
                try {
                    await lr(g.GSESupportReports);
                } catch (m) {
                    console.warn("[report] support-report pickup failed:", m.message);
                }
            if (g.GSEDeltas)
                try {
                    await ur(g.GSEDeltas);
                } catch (m) {
                    console.warn("[delta] delta-fork sync failed:", m.message);
                }
            const O = fo(i.path, (m) => {
                if (!m || !m.name) return !1;
                const $ = m.contentType;
                return $ === "gseVariable" || $ === "variable" ? tn(g, m.name, m.encoded) : $ === "gseMacro" || $ === "macro" ? nn(g, m.name, m.encoded) : $ === "sequence" || !$ ? sn(g, m.name, m.sequences) : !1;
            });
            O > 0 && console.log(`[sync] ${i.name}/${p.name}: cleaned ${O} stale no-op incoming entr${O === 1 ? "y" : "ies"} (local already matches).`);
            const w = s.lastSyncTimestamps?.[p.name] ?? {},
                T = {
                    ...w
                },
                N = s.contentHashes?.sequences ?? {},
                U = {
                    ...N
                },
                x = [],
                R = s.cachedSiteIds?.[p.name] ?? {},
                me = io(i.folder);
            let ne = /* @__PURE__ */ new Map(),
                ue = /* @__PURE__ */ new Map(),
                qe = /* @__PURE__ */ new Map(),
                ke = /* @__PURE__ */ new Set();
            if (_)
                try {
                    const m = await ee(),
                        $ = m.auth.getCurrentToken() ?? _,
                        D = m.auth.getCurrentUser?.() ?? q().userSession,
                        F = D?.persona ?? D?.session?.persona,
                        J = F && (F._id || F.id || F);
                    if (J) {
                        const [Y, K, b, V] = await Promise.all([
                            Gn("gseVariable", J, p.name, $),
                            Gn("gseMacro", J, p.name, $),
                            ar(J, p.name, $),
                            fetch(`${re}/sync/repair-flags`, {
                                headers: {
                                    Authorization: `Bearer ${$}`,
                                    ...le()
                                }
                            }).then((M) => M.ok ? M.json() : null).catch(() => null)
                        ]);
                        ne = Y, ue = K, qe = b, V?.ids?.length && (ke = new Set(V.ids), console.log(`[sync] ${ke.size} record(s) flagged for repair — outgoing will force-upload regardless of hash`));
                    }
                } catch (m) {
                    console.warn("[sync] var/mac/seq access prefetch error:", m.message);
                }
            const Ve = g.GSESequences ?? {};
            for (const [m, $] of Object.entries(Ve))
                if (!(!$ || typeof $ != "object"))
                    for (const [D, F] of Object.entries($)) {
                        const J = fe(F);
                        if (!J) continue;
                        const Y = Array.isArray(J) ? J[1] : J?.payload?.Sequences?.[D];
                        if (!Y) continue;
                        const K = Y.MetaData ?? {},
                            b = K.SpecID ? Number(K.SpecID) : null,
                            V = Y.Versions ?? Y.Macros ?? {},
                            M = Rn(V);
                        if (M) {
                            console.warn(`[sync] WARN: sequence "${D}" (${p.name}) has structurally invalid Versions — ${M}`);
                            const W = Y.MetaData ?? {},
                                Z = `${D}|${W.Author ?? ""}`,
                                Ke = I(W.TOC),
                                $e = typeof W.PlatformID == "string" && W.PlatformID || R[he(Z, Ke)] || (g.GSEPlatformIDs ?? {})[Z] || null,
                                Le = Y.LastUpdated ?? null,
                                $n = (s.acknowledgedInvalidVersions ?? {})[p.name] ?? {};
                            if (!($n[D] != null && $n[D] === Le)) {
                                const xt = {
                                    account: p.name,
                                    accountName: p.name,
                                    clientPath: i.path,
                                    clientName: i.name,
                                    name: D,
                                    platformId: $e,
                                    classId: Number(m),
                                    issue: M,
                                    serverShape: "unknown",
                                    lastUpdated: Le
                                };
                                (async () => {
                                    if ($e && _)
                                        try {
                                            const qs = (await ee()).auth.getCurrentToken() ?? _,
                                                _n = await fetch(`${te}/content/${$e}`, {
                                                    headers: {
                                                        Authorization: `Bearer ${qs}`
                                                    }
                                                });
                                            if (_n.ok) {
                                                const Nt = (await _n.json().catch(() => null))?.data?.sequenceData,
                                                    js = typeof Nt == "string" ? JSON.parse(Nt) : Nt,
                                                    Vt = Rn(js?.Versions || {});
                                                xt.serverShape = Vt ? "invalid" : "clean", Vt && (xt.serverIssue = Vt);
                                            }
                                        } catch {}
                                    C?.webContents.send("sync:invalid-versions", xt);
                                })();
                            }
                        }
                        const B = {
                                ...Y,
                                Versions: V
                            },
                            H = kt(B),
                            A = St(H),
                            v = `${D}|${K.Author ?? ""}`,
                            ce = I(K.TOC),
                            ie = R[he(v, ce)] || typeof K.PlatformID == "string" && K.PlatformID || (g.GSEPlatformIDs ?? {})[v] || null,
                            L = _e(ie, p.name, v),
                            Q = ie && ke.has(ie);
                        !e && !Q && A === N[L] || x.push({
                            name: D,
                            wow_author_name: K.Author ?? null,
                            last_updated: Y.LastUpdated ?? null,
                            data: H,
                            expansion_version: ce,
                            gse_version: String(K.GSEVersion ?? ""),
                            class_id: Number(m),
                            spec_ids: b ? [b] : [],
                            _hash: A,
                            originKey: v,
                            platformId: ie
                        });
                    }
            const pe = [],
                Ye = s.contentHashes?.variables ?? {},
                Ze = {
                    ...Ye
                },
                jt = g.GSEVariables ?? {},
                d = g.GSEVariablePlatformIDs ?? {};
            for (const [m, $] of Object.entries(jt)) {
                if (typeof $ != "string") continue;
                const D = fe($);
                if (!D) continue;
                const F = gs(D),
                    J = D.MetaData ?? {},
                    Y = D.Author ?? J.Author ?? null,
                    K = `${m}|${Y ?? ""}`,
                    b = I(J.TOC),
                    V = ne.get(m)?.id || R[he(K, b)] || d[m] || null,
                    M = _e(V, p.name, K);
                !e && F === Ye[M] || pe.push({
                    name: m,
                    wow_author_name: Y,
                    last_updated: ( /* @__PURE__ */ new Date()).toISOString().replace(/\D/g, "").slice(0, 14),
                    data: D,
                    expansion_version: b,
                    gse_version: String(D.GSEVersion ?? ""),
                    _hash: F,
                    originKey: K,
                    platformId: V
                });
            }
            const se = [],
                Re = s.contentHashes?.macros ?? {},
                Ee = {
                    ...Re
                },
                ae = g.GSEMacroPlatformIDs ?? {},
                Cs = g.GSEMacros ?? {};
            for (const [m, $] of Object.entries(Cs))
                if (!(!$ || typeof $ != "object"))
                    if (typeof $.text == "string")
                        E(m, $);
                    else
                        for (const [D, F] of Object.entries($))
                            E(D, F);
            const Dt = new Set([
                ...x.map((m) => m.platformId),
                ...pe.map((m) => m.platformId),
                ...se.map((m) => m.platformId)
            ].filter(Boolean));
            if (Dt.size) {
                const m = po(i.path, [...Dt]);
                m > 0 && console.log(`[sync] ${i.name}/${p.name}: removed ${m} stale incoming entr${m === 1 ? "y" : "ies"} superseded by local edit(s).`);
            }
            let wn = 0,
                ht = /* @__PURE__ */ new Set();
            if (_ && (!t || !!n))
                try {
                    const m = await rr(i, p, k, e, Dt, g, n);
                    wn = m.count, ht = m.updatedIds;
                } catch (m) {
                    console.log("[sync] incoming error:", m.message);
                }
            let bn = 0;
            const Sn = {},
                Be = [];
            for (const [m, $] of ne) {
                const D = $?.id;
                D && d[m] !== D && Be.push({
                    action: "setPlatformID",
                    contentType: "gseVariable",
                    name: m,
                    classid: 0,
                    platformid: D
                });
            }
            for (const [m, $] of ue) {
                const D = $?.id;
                D && ae[m] !== D && Be.push({
                    action: "setPlatformID",
                    contentType: "gseMacro",
                    name: m,
                    classid: 0,
                    platformid: D
                });
            }
            if (f && (x.length || se.length || pe.length) && (C?.webContents.send("sync:outgoing-paused", {
                    account: p.name,
                    clientName: i.name,
                    counts: {
                        seq: x.length,
                        mac: se.length,
                        var: pe.length
                    }
                }), console.log(`[sync] ${i.name}: ${x.length} seq + ${pe.length} var + ${se.length} mac local edit(s) deferred until WoW closes or /reloads.`)), (x.length || se.length || pe.length) && _ && !f) {
                let m = !1;
                const $ = {
                        scopes: [Yt],
                        security: "secure"
                    },
                    D = [],
                    F = [];
                for (const b of x) {
                    const {
                        originKey: V,
                        platformId: M,
                        expansion_version: B
                    } = b, H = `seq:${p.name}:${he(V, B)}`;
                    if (c.has(H)) {
                        T[b.name] = b.last_updated;
                        continue;
                    }
                    if (M && ht.has(M)) {
                        console.log(`[sync] conflict on sequence "${b.name}" (${B}) — both server and local changed; skipping upload`), C?.webContents.send("sync:conflict", {
                            account: p.name,
                            kind: "seq",
                            name: b.name,
                            platformId: M,
                            expansion: B
                        });
                        continue;
                    }
                    const A = qe.get(he(V, B))?.accessLevel ?? null,
                        v = {
                            contentType: "sequence",
                            payload: {
                                title: b.name,
                                meta: $,
                                data: {
                                    expansionVersion: B,
                                    gseVersion: String(b.gse_version ?? ""),
                                    classId: b.class_id ?? 0,
                                    specId: b.spec_ids && b.spec_ids[0] ? b.spec_ids[0] : 0,
                                    sequenceData: b.data,
                                    wowAuthorName: b.wow_author_name ?? null,
                                    wowAccountName: p.name,
                                    wowOriginKey: V,
                                    ...A ? {
                                        accessLevel: A
                                    } : {}
                                }
                            }
                        };
                    M ? v.id = M : v.originKey = V, D.push(v), F.push({
                        kind: "seq",
                        name: b.name,
                        originKey: V,
                        expansion: B,
                        classKey: b.class_id,
                        hash: b._hash,
                        timestamp: b.last_updated,
                        platformId: M
                    });
                }
                for (const b of se) {
                    const {
                        originKey: V,
                        platformId: M,
                        expansion_version: B
                    } = b, H = `mac:${p.name}:${he(V, B)}`;
                    if (c.has(H))
                        continue;
                    if (M && ht.has(M)) {
                        console.log(`[sync] conflict on macro "${b.name}" (${B}) — both server and local changed; skipping upload`), C?.webContents.send("sync:conflict", {
                            account: p.name,
                            kind: "mac",
                            name: b.name,
                            platformId: M,
                            expansion: B
                        });
                        continue;
                    }
                    const A = ue.get(b.name)?.accessLevel ?? null,
                        v = {
                            contentType: "gseMacro",
                            payload: {
                                title: b.name,
                                meta: $,
                                data: {
                                    expansionVersion: B,
                                    macroData: b.data,
                                    wowAuthorName: b.wow_author_name ?? null,
                                    wowAccountName: p.name,
                                    wowOriginKey: V,
                                    ...A ? {
                                        accessLevel: A
                                    } : {}
                                }
                            }
                        };
                    M ? v.id = M : v.originKey = V, D.push(v), F.push({
                        kind: "mac",
                        name: b.name,
                        originKey: V,
                        expansion: B,
                        hash: b._hash,
                        platformId: M
                    });
                }
                for (const b of pe) {
                    const {
                        originKey: V,
                        platformId: M,
                        expansion_version: B
                    } = b, H = `var:${p.name}:${he(V, B)}`;
                    if (c.has(H))
                        continue;
                    if (M && ht.has(M)) {
                        console.log(`[sync] conflict on variable "${b.name}" (${B}) — both server and local changed; skipping upload`), C?.webContents.send("sync:conflict", {
                            account: p.name,
                            kind: "var",
                            name: b.name,
                            platformId: M,
                            expansion: B
                        });
                        continue;
                    }
                    const A = ne.get(b.name)?.accessLevel ?? null,
                        v = {
                            contentType: "gseVariable",
                            payload: {
                                title: b.name,
                                meta: $,
                                data: {
                                    expansionVersion: B,
                                    variableData: b.data,
                                    wowAuthorName: b.wow_author_name ?? null,
                                    wowAccountName: p.name,
                                    wowOriginKey: V,
                                    ...A ? {
                                        accessLevel: A
                                    } : {}
                                }
                            }
                        };
                    M ? v.id = M : v.originKey = V, D.push(v), F.push({
                        kind: "var",
                        name: b.name,
                        originKey: V,
                        expansion: B,
                        hash: b._hash,
                        platformId: M
                    });
                }
                const J = [];
                for (let b = 0; b < D.length && !m; b += Me) {
                    const V = D.slice(b, b + Me);
                    let M = [],
                        B = [];
                    try {
                        if ({
                                results: M,
                                pendingBatches: B
                            } = await hn(V), B?.length)
                            for (const H of B) {
                                const A = (H.items || []).map((v) => ({
                                    ...v,
                                    // contextItems passed to the resolver will be the slice of
                                    // itemMeta corresponding to this chunk; the resolver
                                    // indexes by originalIndex (chunk-relative) directly.
                                    originalIndex: v.originalIndex
                                }));
                                J.push({
                                    ...H,
                                    items: A,
                                    _chunkOffset: b
                                });
                            }
                    } catch (H) {
                        if (H?.response?.status === 401 || H?.status === 401) {
                            m = !0;
                            break;
                        }
                        console.log(`[sync] batch error (offset ${b}):`, H.message);
                        continue;
                    }
                    for (let H = 0; H < V.length; H++) {
                        const A = F[b + H],
                            v = M[H] || {
                                error: "missing result"
                            };
                        if (v.error) {
                            console.log(`[sync] ${A.kind} "${A.name}" error:`, v.error);
                            continue;
                        }
                        bn++;
                        const ce = he(A.originKey, A.expansion);
                        if (c.add(`${A.kind}:${p.name}:${ce}`), v._id && (A.kind === "seq" && (Sn[ce] = v._id), v.status === "created")) {
                            const Z = A.kind === "seq" ? "sequence" : A.kind === "var" ? "gseVariable" : A.kind === "mac" ? "gseMacro" : null;
                            Z && Be.push({
                                action: "setPlatformID",
                                contentType: Z,
                                name: A.name,
                                classid: A.kind === "seq" && A.classKey != null ? Number(A.classKey) : 0,
                                platformid: v._id
                            });
                        }
                        const ie = v._id || A.platformId || null,
                            L = _e(ie, p.name, A.originKey),
                            Q = _e(null, p.name, A.originKey),
                            W = A.kind === "seq" ? U : A.kind === "mac" ? Ee : Ze;
                        if (W[L] = A.hash, L !== Q && delete W[Q], A.kind === "seq") {
                            T[A.name] = A.timestamp;
                            const Z = v._id ? `(${v._id})` : v.status === "batch-pending" ? `(batch ${v.batchId})` : "";
                            console.log(`[sync] sequence "${A.name}" (${A.expansion}) → ${v.status} ${Z}`.trimEnd());
                        } else A.kind === "mac" ? console.log(`[sync] macro "${A.name}" (${A.expansion}) → ${v.status}${v.status === "batch-pending" ? ` (batch ${v.batchId})` : ""}`) : console.log(`[sync] variable "${A.name}" (${A.expansion}) → ${v.status}${v.status === "batch-pending" ? ` (batch ${v.batchId})` : ""}`);
                    }
                }
                if (J.length) {
                    const b = (await ee()).auth.getCurrentToken() ?? _;
                    for (const V of J) {
                        const M = V._chunkOffset ?? 0,
                            B = F.slice(M, M + Me),
                            {
                                _chunkOffset: H,
                                ...A
                            } = V,
                            v = Do([A], B, p.name, i.path, b).catch((ce) => console.warn("[sync.batch] resolver crashed:", ce?.message));
                        ir(v);
                    }
                }
                if (m) {
                    console.log("[sync] session expired — attempting refresh...");
                    try {
                        const b = await ee();
                        await b.auth.ensureValidToken(!0), _ = b.auth.getCurrentUser()?.token?.accessToken ?? b.auth.getCurrentToken(), G({
                            accessToken: _,
                            userSession: b.auth.getCurrentUser()
                        }), console.log("[sync] token refreshed successfully"), m = !1;
                    } catch {
                        console.log("[sync] refresh failed — clearing session"), _ = null, dt = !1, G({
                            accessToken: null,
                            userSession: null
                        }), C?.webContents.send("auth:session-expired");
                    }
                }
                const K = q().contentHashes ?? {};
                x.length && (K.sequences = U), pe.length && (K.variables = Ze), se.length && (K.macros = Ee), (x.length || pe.length || se.length) && G({
                    contentHashes: K
                });
            }
            if (_)
                try {
                    const m = await ee(),
                        $ = m.auth.getCurrentToken() ?? _,
                        D = m.auth.getCurrentUser?.() ?? q().userSession,
                        F = D?.persona ?? D?.session?.persona,
                        J = F && (F._id || F.id || F);
                    if (!J)
                        console.log("[sync] skip reconcile — no persona on session");
                    else {
                        const Y = /* @__PURE__ */ new Map(),
                            K = /* @__PURE__ */ new Map();
                        let b = 0;
                        const V = 500;
                        let M = !0;
                        for (;;) {
                            const A = await fetch(`${te}/content/sequence/list`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    ...$ ? {
                                        Authorization: `Bearer ${$}`
                                    } : {}
                                },
                                body: JSON.stringify({
                                    filter: {
                                        operator: "and",
                                        filters: [{
                                            key: "meta.personaAuthor",
                                            comparator: "equal",
                                            value: J
                                        }]
                                    },
                                    page: {
                                        size: V,
                                        index: b
                                    },
                                    // wowAccountName + accessLevel needed for archive-on-local-
                                    // delete cross-checks below.
                                    select: [
                                        "_id",
                                        "data.wowOriginKey",
                                        "data.expansionVersion",
                                        "data.wowAccountName",
                                        "data.accessLevel"
                                    ]
                                })
                            });
                            if (!A.ok) {
                                console.warn(`[sync] reconcile: sequence list page ${b} HTTP ${A.status} — aborting reconcile this cycle (no false deletes)`), M = !1;
                                break;
                            }
                            const v = await A.json().catch(() => null);
                            if (!v) {
                                console.warn(`[sync] reconcile: sequence list page ${b} returned unparseable body — aborting reconcile this cycle`), M = !1;
                                break;
                            }
                            const ce = v?.items ?? [];
                            for (const ie of ce) {
                                Y.set(ie._id, ie);
                                const L = ie.data?.wowOriginKey,
                                    Q = ie.data?.expansionVersion || "Unknown";
                                if (L) {
                                    const W = he(L, Q);
                                    K.has(W) || K.set(W, ie._id);
                                }
                            }
                            if (ce.length < V || (b += 1, b > 20)) break;
                        }
                        const B = {},
                            H = g.GSEPlatformIDs ?? {};
                        for (const [A, v] of Object.entries(g.GSESequences ?? {}))
                            if (!(!v || typeof v != "object"))
                                for (const [ce, ie] of Object.entries(v)) {
                                    const L = fe(ie);
                                    if (!L) continue;
                                    const Q = Array.isArray(L) ? L[1] : L?.payload?.Sequences?.[ce];
                                    if (!Q) continue;
                                    const W = Q.MetaData ?? {},
                                        Z = `${ce}|${W.Author ?? ""}`,
                                        Ke = I(W.TOC, me),
                                        $e = typeof W.PlatformID == "string" && W.PlatformID || H[Z] || null;
                                    $e && (B[he(Z, Ke)] = $e);
                                }
                        for (const [A, v] of Object.entries(Sn)) B[A] = v;
                        if (!M)
                            console.warn("[sync] reconcile: skipping resolve+delete-detect this cycle (server fetch incomplete).");
                        else {
                            const A = {},
                                v = /* @__PURE__ */ new Set([...Object.keys(B), ...K.keys()]),
                                ce = [];
                            for (const L of v) {
                                const Q = B[L],
                                    W = K.get(L),
                                    Z = L.lastIndexOf("|"),
                                    Ke = Z >= 0 ? L.slice(0, Z) : L,
                                    $e = Z >= 0 ? L.slice(Z + 1) : "",
                                    Le = Ke.split("|")[0];
                                Q && Y.has(Q) ? A[L] = Q : W ? (A[L] = W, Q && Q !== W && (console.log(`[sync] reconciled "${Le}" (${$e}): ${Q} → ${W}`), $e === me && Be.push({
                                    action: "setPlatformID",
                                    contentType: "sequence",
                                    name: Le,
                                    classid: 0,
                                    platformid: W
                                }))) : Q && ce.push({
                                    key: L,
                                    localId: Q,
                                    originKey: Ke,
                                    expansion: $e,
                                    displayName: Le
                                });
                            }
                            for (const L of ce) {
                                let Q = !1;
                                try {
                                    const W = await fetch(`${te}/content/${L.localId}`, {
                                        method: "GET",
                                        headers: {
                                            ...$ ? {
                                                Authorization: `Bearer ${$}`
                                            } : {}
                                        }
                                    });
                                    if (W.ok) {
                                        const Z = await W.json().catch(() => null);
                                        Q = !!(Z && Z._id === L.localId && !Z?.meta?.deleted && !Z?.error);
                                    }
                                } catch {}
                                Q && (A[L.key] = L.localId);
                            }
                            const ie = s.cachedSiteIds ?? {};
                            ie[p.name] = A, G({
                                cachedSiteIds: ie
                            });
                        }
                    }
                } catch (m) {
                    console.log("[sync] ID reconciliation error:", m.message);
                }
            const kn = s.lastSyncSvNames?.[p.name] ?? {};
            new Set(kn.variables ?? []), new Set(kn.macros ?? []);
            const Os = new Set(
                    Object.entries(g.GSEVariables ?? {}).filter(([, m]) => typeof m == "string").map(([m]) => m)
                ),
                Mt = /* @__PURE__ */ new Set();
            for (const [m, $] of Object.entries(g.GSEMacros ?? {}))
                if ($ && typeof $ == "object" && typeof $.text == "string") Mt.add(m);
                else if ($ && typeof $ == "object")
                for (const D of Object.keys($)) Mt.add(D);
            {
                const m = q().lastSyncSvNames ?? {};
                m[p.name] = {
                    variables: [...Os],
                    macros: [...Mt]
                }, G({
                    lastSyncSvNames: m
                });
            }
            if (Be.length)
                try {
                    ge(i.path, {
                        queue: Be
                    });
                } catch (m) {
                    console.log("[sync] bridge queue write error:", m.message);
                }
            if (JSON.stringify(T) !== JSON.stringify(w)) {
                const m = s.lastSyncTimestamps ?? {};
                m[p.name] = T, G({
                    lastSyncTimestamps: m
                });
            }
            r.push({
                client: i.name,
                account: p.name,
                sequences: x.length,
                macros: se.length,
                variables: pe.length,
                uploaded: bn,
                incoming: wn
            });
        }
    }
    return r;
}
j.handle("auth:login", async (e, {
    email: t,
    password: n,
    mfa: s,
    disableSync: o
}) => {
    try {
        s || (it = null);
        const a = await ee(),
            r = {
                email: t,
                password: n,
                application: jo
            };
        s && (r.mfa = s);
        const c = await a.auth.login(r);
        if (c?.data?.mfa)
            return {
                ok: !1,
                mfa: !0
            };
        const i = c?.data,
            l = a.auth.getCurrentUser(),
            f = l?.token?.accessToken ?? a.auth.getCurrentToken();
        return f ? (_ = f, Xt = !X.isPackaged && o === !0, Xt && console.log("[sync] DISABLED for this session — login form requested no-sync (dev only)"), G({
            accessToken: f,
            userSession: l
        }), bs(), Ss().catch(() => {}), Oe || ks(), Ot(), gn(), qt().catch((u) => console.warn("[policy] post-login check failed:", u?.message ?? u)), Is(), {
            ok: !0,
            user: i
        }) : {
            ok: !1,
            error: "Login failed — no token returned"
        };
    } catch (a) {
        return {
            ok: !1,
            error: a.message
        };
    }
});
j.handle("auth:logout", async () => {
    try {
        await (await ee()).auth.logout();
    } catch {}
    _ = null, dt = !1, nt = !1, Pe = null, it = null, G({
        accessToken: null,
        userSession: null
    }), oe && (oe.abort(), oe = null), ye && (clearTimeout(ye), ye = null), Ue = 1e3, Oe && (clearInterval(Oe), Oe = null);
    for (const e of Ie)
        try {
            e.close();
        } catch {}
    return Ie = [], {
        ok: !0
    };
});
j.handle("auth:me", async () => {
    if (!_) return {
        ok: !1
    };
    try {
        const e = await ee();
        await e.auth.ensureValidToken();
        const t = e.auth.getCurrentToken();
        t && t !== _ && (_ = t, G({
            accessToken: t,
            userSession: e.auth.getCurrentUser()
        }));
        const n = await fetch(`${te}/user`, {
            headers: {
                Authorization: `Bearer ${_}`
            }
        });
        if (!n.ok) return {
            ok: !1
        };
        const s = await n.json();
        return bs(), Ss().catch(() => {}), Oe || ks(), Ot(), gn(), qt().catch((o) => console.warn("[policy] post-auth:me check failed:", o?.message ?? o)), Is(), {
            ok: !0,
            user: s
        };
    } catch {
        return {
            ok: !1
        };
    }
});
j.handle("api:request", async (e, {
    path: t,
    method: n = "GET",
    body: s,
    params: o
}) => {
    async function a(r) {
        const c = o ? "?" + new URLSearchParams(o) : "",
            i = {
                "Content-Type": "application/json"
            };
        r && (i.Authorization = `Bearer ${r}`);
        const l = await fetch(`${te}${t}${c}`, {
                method: n,
                headers: i,
                body: s ? JSON.stringify(s) : void 0
            }),
            f = await l.json().catch(() => null);
        return {
            ok: l.ok,
            status: l.status,
            data: f
        };
    }
    try {
        const r = await ee(),
            c = r.auth.getCurrentToken() ?? _;
        let i = await a(c);
        if (i.status === 401)
            try {
                await r.auth.ensureValidToken(!0), _ = r.auth.getCurrentToken(), G({
                    accessToken: _,
                    userSession: r.auth.getCurrentUser()
                }), i = await a(_);
            } catch {
                _ = null, dt = !1, G({
                    accessToken: null,
                    userSession: null
                }), C?.webContents.send("auth:session-expired");
            }
        return i;
    } catch (r) {
        return {
            ok: !1,
            error: r.message
        };
    }
});
const Ut = /* @__PURE__ */ new Map(),
    Fn = /* @__PURE__ */ new Map();
async function _s(e, t) {
    if (!t || !Array.isArray(e) || !e.length) return {};
    const n = [],
        s = /* @__PURE__ */ new Set(),
        o = [];
    for (const r of e) {
        const c = r?.meta?.personaAuthor,
            i = c && (c._id || c.id || c);
        !i || typeof i != "string" || s.has(i) || (s.add(i), o.push(i), Ut.has(i) || n.push(i));
    }
    if (n.length) {
        const r = n.map((c) => ({
            key: "meta.personaAuthor",
            comparator: "equal",
            value: c
        }));
        try {
            const c = await fetch(`${te}/content/gseMember/list`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${t}`
                },
                body: JSON.stringify({
                    filter: {
                        operator: "or",
                        filters: r
                    },
                    select: ["_id", "data.nickname", "data.avatarFileId", "meta.personaAuthor"],
                    page: {
                        size: Math.max(n.length, 20)
                    }
                })
            });
            if (c.ok) {
                const i = await c.json();
                for (const l of i?.items ?? []) {
                    const f = l?.meta?.personaAuthor,
                        u = f && (typeof f == "object" ? f._id || f.id : f);
                    if (u && (l.data?.nickname && Ut.set(u, l.data.nickname), l.data?.avatarFileId)) {
                        const h = l.data.avatarFileId;
                        Fn.set(u, typeof h == "object" ? h._id || h.id : h);
                    }
                }
            } else {
                const i = await c.text().catch(() => "");
                console.error("[gse] resolveAuthorsForItems failed:", c.status, i.slice(0, 200));
            }
        } catch (c) {
            console.error("[gse] resolveAuthorsForItems error:", c.message);
        }
    }
    const a = {};
    for (const r of o) {
        const c = Ut.get(r),
            i = Fn.get(r);
        (c || i) && (a[r] = {
            nickname: c || null,
            avatarFileId: i || null,
            avatarUrl: i ? `${te}/image/${i}` : null
        });
    }
    return a;
}
j.handle("content:browse", async (e, {
    type: t,
    expansionVersion: n,
    viewMode: s,
    page: o,
    authorId: a,
    classId: r,
    specId: c,
    size: i,
    search: l,
    includeArchived: f
}) => {
    try {
        const u = new URLSearchParams({
            type: t ?? "sequence"
        });
        n && u.set("expansion", n), s && u.set("viewMode", s), o && u.set("page", String(o)), i && u.set("size", String(i)), a && u.set("authorId", a), r && u.set("classId", String(r)), c && u.set("specId", String(c)), l && u.set("search", String(l)), f && u.set("includeArchived", "true");
        const h = await ee(),
            y = h.auth.getCurrentToken() ?? _,
            p = h.auth.getCurrentUser?.() ?? q().userSession,
            I = p?.persona ?? p?.session?.persona,
            E = I && (I._id || I.id || I);
        E && u.set("personaId", String(E));
        const S = {};
        y && (S.Authorization = `Bearer ${y}`);
        const k = `${re}/browse?${u}`;
        console.log("[gse] browse URL:", k);
        const g = await fetch(k, {
            headers: S
        });
        if (!g.ok) {
            const N = await g.text().catch(() => "");
            return console.error("[gse] browse failed:", g.status, N.slice(0, 200)), {
                ok: !1,
                error: `HTTP ${g.status}`
            };
        }
        const O = await g.json(),
            w = O.items ?? [];
        console.log("[gse] browse returned", w.length, "items, total:", O.total);
        const T = await _s(w, y);
        return {
            ok: !0,
            items: w,
            authorProfiles: (() => {
                const N = {
                    ...O.authorProfiles ?? {},
                    ...T
                };
                for (const [U, x] of Object.entries(N))
                    if (!x.avatarUrl && x.avatarFileId) {
                        const R = typeof x.avatarFileId == "object" ? x.avatarFileId._id || x.avatarFileId.id : x.avatarFileId;
                        R && (x.avatarUrl = `${te}/image/${R}`);
                    }
                return N;
            })(),
            total: O.total ?? w.length,
            totalPages: O.totalPages ?? 1,
            // Personas the caller has an active Patreon subscription to. Drives the
            // Install vs "View Author" button decision on subscriber-tier items.
            subAuthors: Array.isArray(O.subAuthors) ? O.subAuthors : []
        };
    } catch (u) {
        return {
            ok: !1,
            error: u.message
        };
    }
});
j.handle("content:browse-authors", async (e, {
    contentType: t
}) => {
    try {
        const n = `${re}/browse/authors?contentType=${encodeURIComponent(t || "sequence")}`,
            s = await fetch(n, {
                headers: {
                    ...le()
                }
            });
        if (!s.ok) {
            const a = await s.text().catch(() => "");
            return {
                ok: !1,
                error: `browse/authors ${s.status}: ${a.slice(0, 200)}`
            };
        }
        return {
            ok: !0,
            authors: (await s.json()).authors || []
        };
    } catch (n) {
        return {
            ok: !1,
            error: n.message
        };
    }
});
j.handle("content:list", async (e, {
    type: t
}) => {
    try {
        const s = (await ee()).auth.getCurrentToken() ?? _;
        if (!s) return {
            ok: !1,
            error: "Not authenticated"
        };
        const o = await fetch(`${re}/my-content?type=${encodeURIComponent(t)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${s}`,
                ...le()
            }
        });
        if (!o.ok) return {
            ok: !1,
            error: `HTTP ${o.status}`
        };
        const a = await o.json();
        if (!a?.success) return {
            ok: !1,
            error: a?.error ?? "my-content failed"
        };
        const r = a.items ?? [],
            c = await _s(r, s),
            i = {
                ok: !0,
                items: r,
                authorProfiles: c
            };
        return a.relationships && (i.relationships = a.relationships), i;
    } catch (n) {
        return {
            ok: !1,
            error: n.message
        };
    }
});
j.handle("app:info", () => {
    const {
        platform: e
    } = process;
    let t = "unknown";
    return e === "linux" ? t = process.env.APPIMAGE ? "appimage" : "deb" : e === "darwin" ? t = "dmg" : e === "win32" && (t = "exe"), {
        version: X.getVersion(),
        platform: e,
        packageType: t,
        username: q().userSession?.email || q().userSession?.username || ""
    };
});
j.handle("settings:get", () => q());
async function As({
    description: e,
    includeModList: t,
    source: n
}) {
    const s = String(e || "").trim();
    if (!s) return {
        ok: !1,
        error: "Please describe the problem."
    };
    if (!_) return {
        ok: !1,
        error: "Please sign in first."
    };
    let o = [];
    try {
        o = ws( /* @__PURE__ */ new Set(["gsesv", "companionsv", "log", "settings"]));
    } catch {}
    let a = [];
    if (t)
        try {
            a = Fo();
        } catch {}
    let r = null;
    try {
        r = ls();
    } catch {}
    const c = await ve();
    if (!c) return {
        ok: !1,
        error: "Could not authenticate. Please try again."
    };
    try {
        const i = await fetch(`${re}/report/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${c}`,
                    ...le()
                },
                body: JSON.stringify({
                    description: s,
                    includeModList: !!t,
                    modList: a,
                    files: o,
                    manifest: r,
                    source: n || "in-app"
                })
            }),
            l = await i.json().catch(() => ({}));
        return i.ok ? {
            ok: !0,
            id: l.id
        } : {
            ok: !1,
            error: l.error || `Upload failed (HTTP ${i.status})`
        };
    } catch (i) {
        return {
            ok: !1,
            error: i.message || "Network error"
        };
    }
}
j.handle("report:submit", async (e, t) => As({
    description: t?.description,
    includeModList: !!t?.includeModList,
    source: "in-app"
}));
async function lr(e) {
    if (!Array.isArray(e) || !e.length || !_) return;
    const t = new Set(q().uploadedSupportReportIds || []);
    let n = !1;
    for (const s of e) {
        const o = s && s.id != null ? String(s.id) : null,
            a = s && typeof s.text == "string" ? s.text.trim() : "";
        if (!o || !a || t.has(o)) continue;
        const r = await As({
            description: a,
            includeModList: !!s.includeMods,
            source: "in-game"
        });
        r && r.ok ? (t.add(o), n = !0, console.log(`[report] uploaded in-game support report ${o}`)) : console.warn(`[report] in-game report ${o} upload failed: ${r && r.error} — will retry`);
    }
    n && G({
        uploadedSupportReportIds: [...t].slice(-200)
    });
}
async function ur(e) {
    if (!e || typeof e != "object" || !_) return;
    const t = q().uploadedDeltaForks || {};
    let n = !1;
    for (const [s, o] of Object.entries(e)) {
        if (!o || typeof o != "object") continue;
        const a = typeof o.d == "string" ? o.d : null,
            r = o.src != null ? String(o.src) : null;
        if (!(!s || !a || !r || t[s] === a))
            try {
                const c = await ve(),
                    i = await fetch(`${re}/content/${encodeURIComponent(s)}/delta`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${c}`,
                            ...le()
                        },
                        body: JSON.stringify({
                            delta: a,
                            upstreamId: r
                        })
                    });
                i.ok ? (t[s] = a, n = !0, console.log(`[delta] synced fork ${s}`)) : console.warn(`[delta] fork ${s} sync failed: HTTP ${i.status} — will retry`);
            } catch (c) {
                console.warn(`[delta] fork ${s} sync error: ${c.message}`);
            }
    }
    n && G({
        uploadedDeltaForks: t
    });
}
j.handle("report:mine", async () => {
    if (!_) return {
        ok: !1,
        error: "not signed in",
        reports: []
    };
    const e = await ve();
    if (!e) return {
        ok: !1,
        error: "auth failed",
        reports: []
    };
    try {
        const t = await fetch(`${re}/report/mine`, {
                headers: {
                    Authorization: `Bearer ${e}`,
                    ...le()
                }
            }),
            n = await t.json().catch(() => ({}));
        return t.ok ? {
            ok: !0,
            reports: Array.isArray(n.reports) ? n.reports : []
        } : {
            ok: !1,
            error: n.error || `HTTP ${t.status}`,
            reports: []
        };
    } catch (t) {
        return {
            ok: !1,
            error: t.message || "Network error",
            reports: []
        };
    }
});
j.handle("settings:set", (e, t) => {
    const n = G(t);
    return ("syncOnClose" in t || "wowPaths" in t) && gn(), "wowPaths" in t && C?.webContents.send("wow:installs-changed"), n;
});
let be = {
    restricted: !1,
    enforce: !1,
    enforceCheckedAt: 0,
    lastSyncResult: null
};
const fr = 10 * 60 * 1e3;
let Ft = null;
async function qt() {
    const e = q(),
        t = e.userSession,
        n = t?.persona ?? t?.session?.persona,
        s = n && (n._id || n.id || n),
        o = t?.token ?? t?.session?.token ?? null,
        a = await ho(re);
    be.enforce = !!a.enforce, be.enforceCheckedAt = Date.now();
    const r = a.integrityRef ? bo(e.wowPaths ?? [], a.integrityRef) : !1;
    if (be.restricted = !!r, s && o)
        try {
            be.lastSyncResult = await go({
                apiUrl: te,
                token: o,
                personaId: s,
                present: r
            });
        } catch (c) {
            be.lastSyncResult = {
                error: c?.message ?? "sync_threw"
            };
        }
    else
        be.lastSyncResult = {
            skipped: "no_session"
        };
    return {
        restricted: be.restricted,
        enforce: be.enforce
    };
}

function Is() {
    Ft || (Ft = setInterval(() => {
        qt().catch((e) => console.warn("[policy] refresh failed:", e?.message ?? e));
    }, fr), Ft.unref?.());
}
j.handle("policy:state", () => ({
    restricted: be.restricted,
    enforce: be.enforce,
    enforceCheckedAt: be.enforceCheckedAt
}));
j.handle("policy:refresh", () => qt());

function We() {
    const e = q();
    return Array.isArray(e.ignoredUpstreamIds) ? e.ignoredUpstreamIds.map(String) : [];
}
j.handle("ignore-upstream:list", () => We());
j.handle("ignore-upstream:add", (e, t) => {
    const n = String(t || "").trim();
    if (!n) return We();
    const s = new Set(We());
    return s.add(n), G({
        ignoredUpstreamIds: [...s]
    }), [...s];
});
j.handle("ignore-upstream:remove", (e, t) => {
    const n = String(t || "").trim();
    if (!n) return We();
    const s = new Set(We());
    return s.delete(n), G({
        ignoredUpstreamIds: [...s]
    }), [...s];
});
j.handle("ignore-upstream:clear", () => (G({
    ignoredUpstreamIds: []
}), []));
j.handle("wow:detect", () => He());
async function Ts(e) {
    const t = ["sequence", "gseVariable", "gseMacro"],
        n = {
            sequence: [],
            gseVariable: [],
            gseMacro: []
        };
    return await Promise.all(t.map(async (s) => {
        let o = null;
        for (let a = 0; a < 20; a++) {
            const r = {
                    type: s,
                    limit: 100,
                    ...o ? {
                        cursor: o
                    } : {}
                },
                c = await fetch(`${re}/sync/incoming`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${e}`,
                        ...le()
                    },
                    body: JSON.stringify(r)
                });
            if (!c.ok) break;
            const i = await c.json();
            if (n[s].push(...i.items || []), o = i.nextCursor, !o) break;
        }
    })), n;
}
j.handle("modeA:preview", async (e, {
    clientPath: t,
    accountName: n
}) => {
    try {
        const s = P(t, "WTF", "Account", n, "SavedVariables", "GSE.lua"),
            o = Ae(s);
        if (!o) return {
            ok: !1,
            error: "GSE.lua not found — launch WoW with GSE once and /reload."
        };
        const r = (await ee()).auth.getCurrentToken() ?? _;
        if (!r) return {
            ok: !1,
            error: "Sign in first."
        };
        const c = await Ts(r),
            i = {};
        for (const y of ["sequence", "gseVariable", "gseMacro"]) {
            i[y] = /* @__PURE__ */ new Map();
            for (const p of c[y]) {
                const I = p.wowOriginKey;
                if (!I) continue;
                const E = `${I}|${p.wowAccountName || ""}|${p.expansionVersion || ""}`;
                i[y].set(E, p);
            }
        }
        const l = Pt(t),
            f = mn(o, n, l),
            u = [],
            h = [];
        for (const y of f) {
            const p = `${y.originKey}|${n}|${y.expansion}`,
                I = i[y.type]?.get(p);
            I ? u.push({
                ...y,
                _id: I._id,
                title: I.title
            }) : h.push(y);
        }
        return {
            ok: !0,
            updates: u,
            missingOnSite: h
        };
    } catch (s) {
        return {
            ok: !1,
            error: s.message
        };
    }
});
j.handle("modeA:execute", async (e, {
    clientPath: t,
    accountName: n,
    approvedLocalIds: s
}) => {
    try {
        const o = P(t, "WTF", "Account", n, "SavedVariables", "GSE.lua"),
            a = Ae(o);
        if (!a) return {
            ok: !1,
            error: "GSE.lua not found."
        };
        const r = Pt(t),
            c = mn(a, n, r),
            i = new Set(s || []),
            l = c.filter((h) => i.has(h.localId));
        if (!l.length) return {
            ok: !0,
            pushed: 0
        };
        const f = l.map((h) => ({
            contentType: h.type,
            originKey: h.originKey,
            payload: h.payload
        }));
        let u = 0;
        for (let h = 0; h < f.length; h += Me) {
            const y = f.slice(h, h + Me),
                {
                    results: p
                } = await hn(y);
            for (const I of p) I.error || u++;
        }
        return {
            ok: !0,
            pushed: u
        };
    } catch (o) {
        return {
            ok: !1,
            error: o.message
        };
    }
});

function mn(e, t, n) {
    const s = [],
        o = (a, r, c) => {
            if (typeof c != "string") return;
            const i = fe(c);
            if (!i) return;
            const l = Array.isArray(i) ? i[1] : i?.payload?.Sequences?.[r] || i;
            if (!l || typeof l != "object" || Array.isArray(l)) return;
            const f = l.MetaData || {},
                u = Vn(f.TOC, n),
                h = `${r}|${f.Author ?? ""}`,
                y = Number(a) || 0,
                p = f.SpecID ? Number(f.SpecID) : 0;
            s.push({
                type: "sequence",
                localId: `sequence:${r}`,
                name: r,
                originKey: h,
                expansion: u,
                classId: y,
                specId: p,
                // surfaced for renderer-side class/spec filter
                payload: {
                    title: r,
                    meta: {
                        scopes: [Yt],
                        security: "secure"
                    },
                    data: {
                        expansionVersion: u,
                        gseVersion: String(f.GSEVersion ?? ""),
                        classId: y,
                        specId: p,
                        sequenceData: l,
                        wowAuthorName: f.Author ?? null,
                        wowAccountName: t,
                        wowOriginKey: h
                    }
                }
            });
        };
    for (const [a, r] of Object.entries(e.GSESequences ?? {}))
        if (typeof r == "object")
            for (const [c, i] of Object.entries(r)) o(a, c, i);
    for (const [a, r] of Object.entries(e.GSEVariables ?? {})) {
        if (typeof r != "string") continue;
        const c = fe(r);
        if (!c) continue;
        const i = c.Author ?? c.MetaData?.Author ?? null,
            l = `${a}|${i ?? ""}`,
            f = Vn(c.MetaData?.TOC, n);
        s.push({
            type: "gseVariable",
            localId: `gseVariable:${a}`,
            name: a,
            originKey: l,
            expansion: f,
            classId: 0,
            specId: 0,
            // variables are not class/spec-specific
            payload: {
                title: a,
                meta: {
                    scopes: [Yt],
                    security: "secure"
                },
                data: {
                    expansionVersion: f,
                    variableData: c,
                    wowAuthorName: i,
                    wowAccountName: t,
                    wowOriginKey: l
                }
            }
        });
    }
    return s;
}
j.handle("modeB:preflight", async () => {
    const e = await He().catch(() => []);
    return {
        ok: !0,
        wowRunning: Array.isArray(e) && e.length > 0,
        processes: e
    };
});
j.handle("modeB:execute", async (e, {
    clientPath: t,
    accountName: n,
    submode: s
    /* 'replace-mine' | 'delete-all' */
}) => {
    try {
        const o = await He().catch(() => []);
        if (Array.isArray(o) && o.length > 0) return {
            ok: !1,
            error: "Close WoW first. Mode B writes GSE.lua directly; WoW would overwrite it on /reload."
        };
        if (!["replace-mine", "delete-all"].includes(s)) return {
            ok: !1,
            error: "Invalid submode."
        };
        const r = (await ee()).auth.getCurrentToken() ?? _;
        if (!r) return {
            ok: !1,
            error: "Sign in first."
        };
        const c = P(t, "WTF", "Account", n, "SavedVariables", "GSE.lua");
        if (!z(c)) return {
            ok: !1,
            error: "GSE.lua not found."
        };
        const i = `${c}.bak.${Date.now()}`;
        Yn(c, i);
        const l = await Ts(r),
            f = Ae(c) || {},
            {
                sequences: u,
                gseVariable: h,
                gseMacro: y
            } = l,
            p = s === "delete-all" ? {} : {
                ...f.GSESequences ?? {}
            },
            I = s === "delete-all" ? {} : {
                ...f.GSEVariables ?? {}
            };
        if (s === "replace-mine") {
            const k = new Set(u.map((g) => g.wowAuthorName).filter(Boolean));
            for (const [g, O] of Object.entries(p))
                if (typeof O == "object")
                    for (const [w] of Object.entries(O)) {
                        const T = w.split("|")[1] || "";
                        T && k.has(T) && delete p[g][w];
                    }
        }
        for (const k of u) {
            const g = String(k.data?.classId ?? 0);
            p[g] || (p[g] = {}), k.encoded && (p[g][k.title] = k.encoded);
        }
        for (const k of h)
            k.encoded && (I[k.title] = k.encoded);
        const E = {
                ...f,
                GSESequences: p,
                GSEVariables: I
            },
            S = an(E);
        return Te(c, S, {
            encoding: "latin1"
        }), {
            ok: !0,
            backupPath: i,
            installed: {
                sequences: u.length,
                variables: h.length
            }
        };
    } catch (o) {
        return {
            ok: !1,
            error: o.message
        };
    }
});
j.handle("wow:get-clients", (e, t) => (t ?? q().wowPaths ?? []).flatMap(
    (s) => Se(s).map((o) => ({
        ...o,
        basePath: s,
        gseVersion: Et(o.path)
    }))
));
j.handle("wow:get-installs", () => {
    const e = q().wowPaths ?? [],
        t = [];
    for (const n of e)
        for (const s of Se(n)) {
            const o = lt[s.folder],
                a = Pt(s.path);
            for (const r of Ne(s.path))
                t.push({
                    accountName: r.name,
                    clientName: o?.name ?? s.folder,
                    clientType: o?.clientType ?? "retail",
                    folder: s.folder,
                    clientPath: s.path,
                    basePath: n,
                    gseVersion: Et(s.path),
                    expansion: a
                });
        }
    return t;
});
j.handle("wow:read-local-content", (e, {
    clientPath: t,
    accountName: n
}) => {
    const s = P(t, "WTF", "Account", n, "SavedVariables", "GSE.lua"),
        o = Ae(s);
    if (!o)
        return {
            ok: !0,
            sequences: [],
            macros: [],
            variables: [],
            collections: [],
            localMissing: !0
        };
    const a = o.GSEPlatformIDs ?? {},
        i = {
            ...q().cachedSiteIds?.[n] ?? {},
            ...a
        },
        l = [],
        f = o.GSESequences ?? {};
    for (const [I, E] of Object.entries(f))
        if (!(!E || typeof E != "object"))
            for (const [S, k] of Object.entries(E)) {
                const g = fe(k);
                if (!g) continue;
                const O = Array.isArray(g) ? g[1] : g?.payload?.Sequences?.[S];
                if (!O) continue;
                const w = O.MetaData ?? {},
                    T = w.Author ?? "",
                    N = `${S}|${T}`,
                    U = typeof w.PlatformID == "string" && w.PlatformID || i[N] || null;
                l.push({
                    name: S,
                    classId: Number(I) || 0,
                    specId: w.SpecID ? Number(w.SpecID) : null,
                    expansionVersion: cn(w.TOC),
                    gseVersion: String(w.GSEVersion ?? ""),
                    author: T,
                    lastUpdated: O.LastUpdated ?? null,
                    platformId: U
                });
            }
    const u = [],
        h = o.GSEMacros ?? {};
    for (const [I, E] of Object.entries(h))
        if (!(!E || typeof E != "object"))
            if (typeof E.text == "string")
                u.push({
                    name: E.name ?? I,
                    icon: E.icon ?? null,
                    author: E.Author ?? ""
                });
            else
                for (const [S, k] of Object.entries(E))
                    k && typeof k == "object" && typeof k.text == "string" && u.push({
                        name: k.name ?? S,
                        icon: k.icon ?? null,
                        author: k.Author ?? ""
                    });
    const y = [],
        p = o.GSEVariables ?? {};
    for (const [I, E] of Object.entries(p)) {
        if (typeof E != "string") continue;
        const S = fe(E);
        if (!S) continue;
        const k = S.Author ?? "",
            g = S.MetaData ?? {},
            O = typeof g.PlatformID == "string" && g.PlatformID || i[`${I}|${k}`] || null;
        y.push({
            name: I,
            author: k,
            platformId: O
        });
    }
    return {
        ok: !0,
        sequences: l,
        macros: u,
        variables: y
    };
});
j.handle("wow:install-content", async (e, {
    clientPath: t,
    accountName: n,
    contentType: s,
    ids: o,
    displayItems: a
}) => {
    try {
        if (!o?.length) return {
            ok: !1,
            error: "No IDs provided"
        };
        const c = (await ee()).auth.getCurrentToken() ?? _,
            i = await $s(o, c, Et(t));
        if (!i?.success)
            return {
                ok: !1,
                error: i?.error ?? "Export action failed",
                missing: i?.missing ?? null
            };
        const l = i.encoded;
        if (!l) return {
            ok: !1,
            error: "No encoded data returned"
        };
        const f = a?.[0]?.name,
            u = o.length === 1 ? f || "content" : `${o.length} item(s)`;
        return ge(t, {
            incomingQueue: [{
                name: u,
                source: "gsecompanion",
                contentType: s ?? "sequence",
                displayItems: a ?? null,
                // force=true so the addon's IsImported gate doesn't silently drop
                // this entry when the user previously imported the same name.
                // Browse → Install is an explicit user gesture; if they click it
                // again they expect a fresh import dialog, not silent suppression.
                // Matches the pattern wow:queue-reinstall already uses.
                force: !0,
                sequences: {
                    import: l
                }
            }]
        }), Xe(`${o.length} item(s) queued`), {
            ok: !0,
            count: o.length
        };
    } catch (r) {
        return console.error("[install-content] error:", r), {
            ok: !1,
            error: r.message
        };
    }
});
j.handle("wow:queue-delete", (e, {
    clientPath: t,
    accountName: n,
    name: s,
    classId: o,
    contentType: a
}) => {
    const r = ge(t, {
        queue: [{
            action: "delete",
            contentType: a ?? "sequence",
            name: s,
            classid: o
        }]
    });
    return Xe(`Delete queued for "${s}"`), {
        ok: r
    };
});
j.handle("wow:queue-reinstall", async (e, {
    clientPath: t,
    accountName: n,
    platformId: s,
    name: o,
    contentType: a
}) => {
    if (!s) return {
        ok: !1,
        error: "No platform ID — not synced to platform"
    };
    try {
        const c = (await ee()).auth.getCurrentToken() ?? _,
            i = await $s([s], c, Et(t));
        return !i?.success || !i.encoded ? {
            ok: !1,
            error: i?.error ?? "Export failed"
        } : (ge(t, {
            incomingQueue: [{
                name: o || "reinstall",
                source: "gsecompanion",
                // force=true tells the bridge addon's ProcessBridgeData to bypass
                // IsImported() for this entry. Reinstalls are an explicit user
                // gesture — if they previously dismissed (clearincoming) or already
                // imported this item, the existing marker would silently swallow
                // the new payload and the dialog would never open.
                force: !0,
                sequences: {
                    import: i.encoded
                }
            }]
        }), Xe(`Reinstall queued for "${o}"`), {
            ok: !0
        });
    } catch (r) {
        return console.error("[queue-reinstall] error:", r), {
            ok: !1,
            error: r.message
        };
    }
});
j.handle("wow:get-pending-uploads", async (e, {
    clientPath: t,
    accountName: n
}) => {
    try {
        if (!t || !n) return {
            sequences: [],
            variables: [],
            macros: []
        };
        const o = Ne(t).find((k) => k.name === n);
        if (!o) return {
            sequences: [],
            variables: [],
            macros: []
        };
        const a = P(o.path, "SavedVariables", "GSE.lua"),
            r = Ae(a);
        if (!r) return {
            sequences: [],
            variables: [],
            macros: []
        };
        const c = q(),
            i = c.contentHashes?.sequences ?? {},
            l = c.contentHashes?.variables ?? {},
            f = c.contentHashes?.macros ?? {},
            u = r.GSEPlatformIDs ?? {},
            h = r.GSEVariablePlatformIDs ?? {},
            y = r.GSEMacroPlatformIDs ?? {},
            p = [],
            I = [],
            E = [];
        for (const [k, g] of Object.entries(r.GSEVariables ?? {})) {
            if (typeof g != "string") continue;
            const O = fe(g);
            if (!O) continue;
            const w = O.Author ?? O.MetaData?.Author ?? "",
                T = `${k}|${w}`,
                N = h[k] || null,
                U = _e(N, n, T);
            gs(O) !== l[U] && I.push(k);
        }
        const S = (k, g) => {
            if (!g || typeof g != "object" || typeof g.text != "string") return;
            const O = {
                    name: g.name ?? k,
                    icon: g.icon ?? null,
                    text: g.text,
                    ...g.Author ? {
                        Author: g.Author
                    } : {},
                    ...g.comments ? {
                        comments: g.comments
                    } : {}
                },
                w = `${k}|${g.Author ?? ""}`,
                T = y[k] || null,
                N = _e(T, n, w);
            ms(O) !== f[N] && E.push(k);
        };
        for (const [k, g] of Object.entries(r.GSEMacros ?? {}))
            if (g && typeof g == "object" && typeof g.text == "string") S(k, g);
            else if (g && typeof g == "object")
            for (const [O, w] of Object.entries(g)) S(O, w);
        for (const [, k] of Object.entries(r.GSESequences ?? {}))
            if (!(!k || typeof k != "object"))
                for (const [g, O] of Object.entries(k)) {
                    const w = fe(O);
                    if (!w) continue;
                    const T = Array.isArray(w) ? w[1] : w?.payload?.Sequences?.[g];
                    if (!T) continue;
                    const N = T.MetaData ?? {},
                        U = T.Versions ?? T.Macros ?? {},
                        x = kt({
                            Versions: U,
                            MetaData: N
                        }),
                        R = `${g}|${N.Author ?? ""}`,
                        me = typeof N.PlatformID == "string" && N.PlatformID || u[R] || null,
                        ne = _e(me, n, R);
                    St(x) !== i[ne] && p.push(g);
                }
        return {
            sequences: p,
            variables: I,
            macros: E
        };
    } catch (s) {
        return console.error("[get-pending-uploads] error:", s), {
            sequences: [],
            variables: [],
            macros: []
        };
    }
});
j.handle("invalid-versions:acknowledge", (e, t) => {
    if (!Array.isArray(t) || t.length === 0) return {
        ok: !0
    };
    const s = q().acknowledgedInvalidVersions ?? {};
    for (const o of t)
        !o || !o.account || !o.name || (s[o.account] || (s[o.account] = {}), s[o.account][o.name] = o.lastUpdated ?? null);
    return G({
        acknowledgedInvalidVersions: s
    }), {
        ok: !0
    };
});
j.handle("wow:queue-set-platform-ids", (e, {
    clientPath: t,
    accountName: n,
    entries: s
}) => {
    const o = s.map((r) => ({
        action: "setPlatformID",
        name: r.name,
        classid: r.classId,
        platformid: r.platformId
    }));
    return {
        ok: ge(t, {
            queue: o
        })
    };
});
j.handle("wow:pending-queue", (e, {
    clientPath: t
}) => {
    try {
        return rs(t);
    } catch {
        return {
            queue: [],
            incomingQueue: []
        };
    }
});
j.handle("wow:accept-upstream", (e, {
    clientPath: t,
    sequences: n
}) => !n || !n.length ? {
    success: !1
} : (ge(t, {
    incomingQueue: n
}), Xe(`${n.length} upstream update(s) applied`), console.log(`[sync] accepted ${n.length} upstream update(s)`), {
    success: !0,
    count: n.length
}));
j.handle("dialog:pick-directory", async () => {
    const {
        canceled: e,
        filePaths: t
    } = await Ds.showOpenDialog(C, {
        title: "Select World of Warcraft folder",
        properties: ["openDirectory"]
    });
    if (e || !t[0]) return null;
    let n = t[0];
    const s = vt(n);
    return ["_retail_", "_ptr_", "_xptr_", "_beta_", "_classic_", "_classic_era_", "_anniversary_", "_classic_beta_"].includes(s) && (n = xe(n, ".."), console.log("[gse] User selected client dir, auto-corrected to parent:", n)), n;
});
j.handle("wow:sync-now", async () => {
    C?.webContents.send("sync:started", {});
    const e = await pt(!0);
    return C?.webContents.send("sync:finished", {
        at: ( /* @__PURE__ */ new Date()).toISOString()
    }), e;
});
j.handle("wow:write-queue", (e, {
    clientPath: t,
    accountName: n,
    queue: s
}) => {
    const o = ge(t, {
        incomingQueue: s
    });
    return s?.length && Xe(`${s.length} item(s) queued`), o;
});
j.handle("gse:get-releases", async (e, {
    channel: t
}) => {
    try {
        const n = {
            sort: {
                key: "meta.created",
                direction: "desc"
            },
            page: {
                size: 20
            },
            select: ["_id", "title", "data"]
        };
        t && t !== "all" && (n.filter = {
            operator: "and",
            filters: [{
                key: "data.channel",
                comparator: "equal",
                value: t
            }]
        });
        const s = {
            "Content-Type": "application/json"
        };
        _ && (s.Authorization = `Bearer ${_}`);
        const o = await fetch(`${te}/content/gseRelease/list`, {
            method: "POST",
            headers: s,
            body: JSON.stringify(n)
        });
        if (!o.ok) {
            const c = await o.text().catch(() => "");
            return console.error("[gse] get-releases failed:", o.status, c.slice(0, 200)), {
                ok: !1,
                error: `Server returned ${o.status}`
            };
        }
        return {
            ok: !0,
            releases: ((await o.json())?.items ?? []).map((c) => ({
                _id: c._id,
                title: c.title,
                ...c.data || {}
            })).filter((c) => c.version)
        };
    } catch (n) {
        return {
            ok: !1,
            error: n.message
        };
    }
});
j.handle("gse:install", async (e, {
    clientPath: t,
    version: n
}) => {
    try {
        const s = {
            "Content-Type": "application/json"
        };
        _ && (s.Authorization = `Bearer ${_}`);
        const o = await fetch(`${te}/content/gseRelease/list`, {
            method: "POST",
            headers: s,
            body: JSON.stringify({
                filter: {
                    operator: "and",
                    filters: [{
                        key: "data.version",
                        comparator: "equal",
                        value: n
                    }]
                },
                select: ["_id", "title", "data"],
                page: {
                    size: 1
                }
            })
        });
        if (!o.ok) {
            const k = await o.text().catch(() => "");
            return console.error("[gse] install list failed:", o.status, k.slice(0, 200)), {
                ok: !1,
                error: `Could not find release (HTTP ${o.status})`
            };
        }
        const r = (await o.json())?.items?.[0];
        if (!r) return {
            ok: !1,
            error: `Release ${n} not found`
        };
        if (!r?.data?.zipFile)
            return console.error("[gse] install: release has no zipFile:", JSON.stringify(r).slice(0, 300)), {
                ok: !1,
                error: "No zip file for this release"
            };
        const c = r.data.zipFile?._id ?? r.data.zipFile,
            i = `${te}/actions/69c7477f4106131aec21c479?id=${c}`,
            l = _ ? {
                Authorization: `Bearer ${_}`
            } : {},
            f = await fetch(i, {
                headers: l
            });
        if (!f.ok) return {
            ok: !1,
            error: `Download returned ${f.status}`
        };
        const u = Buffer.from(await f.arrayBuffer()),
            h = ze("adm-zip"),
            y = new h(u),
            p = P(t, "Interface", "AddOns"),
            I = [...new Set(
                y.getEntries().map((k) => k.entryName.split("/")[0]).filter(Boolean)
            )];
        y.extractAllTo(
            p,
            /* overwrite */
            !0
        );
        const S = q().gseManifests ?? {};
        return S[t] = I, G({
            gseManifests: S
        }), {
            ok: !0
        };
    } catch (s) {
        return {
            ok: !1,
            error: s.message
        };
    }
});
j.handle("gse:uninstall", (e, {
    clientPath: t
}) => {
    try {
        const {
            rmSync: n
        } = ze("fs"), s = P(t, "Interface", "AddOns"), a = q().gseManifests ?? {}, {
            readdirSync: r
        } = ze("fs"), c = a[t] ?? r(s).filter((l) => l === "GSE" || l.startsWith("GSE_")), i = [];
        for (const l of c)
            n(P(s, l), {
                recursive: !0,
                force: !0
            }), i.push(l);
        return delete a[t], G({
            gseManifests: a
        }), {
            ok: !0,
            removed: i
        };
    } catch (n) {
        return {
            ok: !1,
            error: n.message
        };
    }
});
j.handle("shell:open-external", (e, t) => zn.openExternal(t));
j.handle("gse:decode-import", async (e, {
    importString: t
}) => {
    const n = {
            "Content-Type": "application/json",
            ...le()
        },
        s = JSON.stringify({
            importString: t
        });
    try {
        const o = await fetch(`${re}/compute/decodeImport`, {
            method: "POST",
            headers: n,
            body: s
        });
        if (!o.ok) return {
            ok: !1,
            error: `HTTP ${o.status}`
        };
        const a = await o.json();
        return a.success ? {
            ok: !0,
            format: a.format,
            data: a.data
        } : {
            ok: !1,
            error: a.error || "Decode failed"
        };
    } catch (o) {
        return {
            ok: !1,
            error: o.message
        };
    }
});
const dr = te;
let Je = null;
async function yn() {
    const e = X.getVersion();
    try {
        const n = q().updateChannel ?? "release",
            s = {
                "Content-Type": "application/json"
            };
        _ && (s.Authorization = `Bearer ${_}`);
        const o = await fetch(`${te}/content/gseCompanionRelease/list`, {
            method: "POST",
            headers: s,
            body: JSON.stringify({
                filter: {
                    operator: "and",
                    filters: [{
                        key: "data.channel",
                        comparator: "equal",
                        value: n
                    }]
                },
                sort: {
                    key: "meta.created",
                    direction: "desc"
                },
                select: ["_id", "title", "data"],
                page: {
                    size: 1
                }
            })
        });
        if (!o.ok) {
            console.warn(`[updater] HTTP ${o.status} on release list — skipping this check`);
            return;
        }
        const r = (await o.json())?.items?.[0];
        if (!r?.data?.version) {
            console.warn("[updater] release list empty or missing version");
            return;
        }
        if (r.data.version === e) {
            console.log(`[updater] already on latest v${e} (channel: ${n})`);
            return;
        }
        console.log(`[updater] update available: v${e} → v${r.data.version} (channel: ${n})`), Je = r, C?.webContents.send("updater:available", {
            version: r.data.version
        }), pr().catch((c) => {
            console.warn("[updater] background download failed:", c.message);
        });
    } catch (t) {
        console.warn(`[updater] check failed (current v${e}):`, t.message);
    }
}
let Tt = null,
    zt = !1;
async function pr() {
    if (!Je || Tt || zt) return;
    const e = Es(Je);
    if (!e) {
        console.warn("[updater] no installer for this platform — skipping background download");
        return;
    }
    zt = !0;
    try {
        C?.webContents.send("updater:progress", {
            percent: 0,
            status: "downloading"
        }), Tt = await Ps(e.id, e.ext, (s) => {
            C?.webContents.send("updater:progress", {
                percent: s,
                status: "downloading"
            });
        }), C?.webContents.send("updater:progress", {
            percent: 100,
            status: "ready"
        }), q().autoApplyUpdates !== !1 ? (console.log("[updater] auto-apply on — installing now"), vs().catch((s) => {
            console.warn("[updater] auto-apply install failed:", s.message);
        })) : console.log("[updater] background download ready — awaiting user Restart click (auto-apply disabled)");
    } finally {
        zt = !1;
    }
}
async function vs() {
    if (!Je) return {
        ok: !1,
        error: "No update available"
    };
    const e = Es(Je);
    if (!e) return {
        ok: !1,
        error: "No installer available for this platform"
    };
    let t = Tt;
    (!t || !z(t)) && (C?.webContents.send("updater:progress", {
        percent: 0,
        status: "downloading"
    }), t = await Ps(e.id, e.ext, (s) => {
        C?.webContents.send("updater:progress", {
            percent: s,
            status: "downloading"
        });
    }), Tt = t), C?.webContents.send("updater:progress", {
        percent: 100,
        status: "installing"
    });
    const n = process.platform;
    if (n === "win32")
        Rt(t, ["/S", "--force-run"], {
            detached: !0,
            stdio: "ignore"
        }).unref(), setTimeout(() => X.quit(), 1e3);
    else if (n === "linux" && process.env.APPIMAGE) {
        const s = process.env.APPIMAGE;
        Ks(t, 493);
        try {
            Ls(s);
        } catch {}
        rn(t, s), Rt(s, [], {
            detached: !0,
            stdio: "ignore"
        }).unref(), setTimeout(() => X.quit(), 500);
    } else n === "darwin" ? (Rt("open", [t], {
        detached: !0,
        stdio: "ignore"
    }).unref(), setTimeout(() => X.quit(), 2e3)) : zn.openPath(t);
    return {
        ok: !0
    };
}
const hr = 4 * 60 * 60 * 1e3;
let ct = null;

function gr() {
    ct && clearInterval(ct), ct = setInterval(() => {
        Je || yn().catch(() => {});
    }, hr);
}

function Es(e) {
    const t = process.platform,
        n = e?.data;
    return n ? t === "win32" && n.fileWin ? {
        id: n.fileWin._id ?? n.fileWin,
        ext: ".exe"
    } : t === "darwin" && n.fileMac ? {
        id: n.fileMac._id ?? n.fileMac,
        ext: ".dmg"
    } : t === "linux" && n.fileLinux ? {
        id: n.fileLinux._id ?? n.fileLinux,
        ext: ".AppImage"
    } : null : null;
}
async function Ps(e, t, n) {
    const s = `${dr}/file/${e}`;
    console.log(`[updater] downloading ${s}`);
    const o = await fetch(s);
    if (!o.ok) throw new Error(`Download failed (${o.status})`);
    const a = Number(o.headers.get("content-length") || 0),
        r = P(Gs(), `gse-companion-update${t}`),
        c = Bs(r);
    let i = 0;
    const l = o.body.getReader();
    try {
        for (;;) {
            const {
                done: f,
                value: u
            } = await l.read();
            if (f) break;
            c.write(Buffer.from(u)), i += u.byteLength, a && n && n(Math.round(i / a * 100));
        }
    } finally {
        c.end(), await new Promise((f) => c.on("finish", f));
    }
    return console.log(`[updater] downloaded ${(i / 1048576).toFixed(1)} MB → ${r}`), r;
}
j.handle("updater:install", async () => {
    try {
        return await vs();
    } catch (e) {
        return console.error("[updater] install error:", e), C?.webContents.send("updater:progress", {
            percent: 0,
            error: e.message
        }), {
            ok: !1,
            error: e.message
        };
    }
});
X.whenReady().then(async () => {
    process.platform === "win32" && X.setAppUserModelId("com.gseplatform.companion");
    const e = q();
    e.userSession && ((await ee()).auth.set(e.userSession), _ = e.userSession?.token?.accessToken ?? null), $t(), Xo(), console.log(_ ? "[startup] saved session restored — waiting for auth:me to confirm token validity before kick-off" : "[startup] no session — waiting for login"), X.isPackaged ? (yn(), gr()) : console.log("[updater] dev build — auto-update check disabled"), X.on("activate", () => {
        Wn.getAllWindows().length === 0 && $t();
    });
});
X.on("before-quit", () => {
    Ct = !0;
});
X.on("window-all-closed", () => {
    const t = q().minimizeToTray !== !1;
    if (!(!Ct && t && de)) {
        Oe && clearInterval(Oe), oe && (oe.abort(), oe = null), ye && (clearTimeout(ye), ye = null), ct && clearInterval(ct);
        for (const n of Ie)
            try {
                n.close();
            } catch {}
        if (Ie = [], de) {
            try {
                de.destroy();
            } catch {}
            de = null;
        }
        process.platform !== "darwin" && X.quit();
    }
});