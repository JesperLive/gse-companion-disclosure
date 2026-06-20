// ============================================================================
// GSE Companion 0.4.14 - verbatim extract of the competitor-detection /
// account-flag / deletion subsystem from resources/app.asar -> out/main/index.js
// app.asar  SHA-256: 217ff61e074d421ed418f12d47f7f342c09eba9d8c15c4a5bc59fc746ff7229e
// index.js  SHA-256: 9c8c9588f7a749c81fb710de73e98899ca516f56cdb004fa82547315b5f0239d
// In 0.4.12/0.4.13 these identifiers were plaintext; here they are base64 (see L551).
// ============================================================================

// ---- Region A: lines 545-740 (base64 decoder + detect + flag + purge) ----
}
function Kn(e) {
  const t = ze(e), n = t.replace(/\.lua$/, ".json");
  G(t) && Ae(t, `GSECompanionData = {}
`, { encoding: "latin1" }), G(n) && Ae(n, JSON.stringify({ queue: [], incomingQueue: [] }), "utf-8");
}
const kt = (e) => Buffer.from(e, "base64").toString("utf8"), Rt = kt("R1JJUC1FTVMubHVh"), Ms = kt("R1JJUF9FTVNfQ0hBUg=="), Vs = kt("cHJvdmVuYW5jZVNvdXJjZQ=="), Ns = kt("Z3NlLWxlZ2FjeQ==");
function Rs(e) {
  if (!e) return !1;
  if (G(C(e, "SavedVariables", Rt)))
    return !0;
  try {
    const t = tt(e).filter((n) => {
      if (n === "SavedVariables") return !1;
      try {
        return nt(C(e, n)).isDirectory();
      } catch {
        return !1;
      }
    });
    for (const n of t) {
      const s = C(e, n);
      try {
        const o = tt(s).filter((a) => {
          try {
            return nt(C(s, a)).isDirectory();
          } catch {
            return !1;
          }
        });
        for (const a of o)
          if (G(C(s, a, "SavedVariables", Rt)))
            return !0;
      } catch {
      }
    }
  } catch {
  }
  return !1;
}
function Bs(e, t) {
  for (const n of e ?? []) {
    const s = t(n.path) ?? [];
    for (const o of s)
      if (Rs(o.path)) return !0;
  }
  return !1;
}
function Gs(e, t) {
  const n = [];
  for (const s of e ?? []) {
    const o = t(s.path) ?? [];
    for (const a of o)
      try {
        const r = tt(a.path).filter((c) => {
          if (c === "SavedVariables") return !1;
          try {
            return nt(C(a.path, c)).isDirectory();
          } catch {
            return !1;
          }
        });
        for (const c of r) {
          const i = C(a.path, c);
          try {
            const l = tt(i).filter((u) => {
              try {
                return nt(C(i, u)).isDirectory();
              } catch {
                return !1;
              }
            });
            for (const u of l) {
              const f = C(i, u, "SavedVariables", Rt);
              G(f) && n.push(f);
            }
          } catch {
          }
        }
      } catch {
      }
  }
  return n;
}
async function Ks(e) {
  try {
    const t = await fetch(`${e}/settings/access-policy`, {
      headers: { Accept: "application/json" }
    });
    if (!t.ok) return { enforce: !1, error: `http_${t.status}` };
    const n = await t.json().catch(() => null);
    return {
      enforce: !!(n && n.enforce),
      updatedAt: n?.updatedAt ?? null
    };
  } catch (t) {
    return { enforce: !1, error: t?.message ?? "fetch_failed" };
  }
}
async function Us({ apiUrl: e, token: t, personaId: n, present: s }) {
  if (!t || !n) return { skipped: "missing_inputs" };
  let o = null, a = !1;
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
          filters: [
            { key: "meta.personaAuthor", comparator: "equal", value: n }
          ]
        },
        select: ["_id", "data.restrictedAccount"],
        page: { size: 1 }
      })
    });
    if (!c.ok) return { error: `list_http_${c.status}` };
    const l = (await c.json().catch(() => null))?.items?.[0];
    if (!l?._id) return { skipped: "no_member" };
    o = l._id, a = !!l?.data?.restrictedAccount;
  } catch (c) {
    return { error: c?.message ?? "list_failed" };
  }
  if (a === s)
    return { skipped: "unchanged", present: s, memberId: o };
  const r = s ? { data: { restrictedAccount: !0, restrictedAccountReviewedAt: (/* @__PURE__ */ new Date()).toISOString() } } : { data: { restrictedAccount: !1 } };
  try {
    const c = await fetch(`${e}/content/${o}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify(r)
    });
    if (!c.ok) return { error: `patch_http_${c.status}` };
  } catch (c) {
    return { error: c?.message ?? "patch_failed" };
  }
  return { changed: !0, present: s, memberId: o };
}
function Ls(e) {
  const t = /* @__PURE__ */ new Set();
  if (!e) return t;
  const n = C(e, "SavedVariables", "GSE.lua"), o = be(n)?.GSESequences;
  if (!o || typeof o != "object") return t;
  for (const a of Object.keys(o)) {
    const r = o[a];
    if (!(!r || typeof r != "object"))
      for (const c of Object.keys(r))
        t.add(c);
  }
  return t;
}
function zs(e, t) {
  if (!e || !G(e))
    return { skipped: !0, reason: "no_file" };
  const n = be(e);
  if (!n) return { skipped: !0, reason: "parse_failed" };
  const o = n[Ms]?.sequences;
  if (!o || typeof o != "object")
    return { skipped: !0, reason: "no_sequences" };
  const a = [];
  for (const [l, u] of Object.entries(o)) {
    if (!u || typeof u != "object") continue;
    const h = u[Vs] === Ns, w = t?.has?.(l);
    (h || w) && a.push(l);
  }
  if (a.length === 0) return { skipped: !0, reason: "nothing_to_purge" };
  for (const l of a) delete o[l];
  const r = Yt(n), c = `${e}.gse-purge.tmp`, i = xn(c, "w");
  try {
    Pn(i, r), On(i);
  } finally {
    jn(i);
  }
  return Qt(c, e), {
    purged: a.length,
    remaining: Object.keys(o).length,
    names: a
  };
}
const tn = [
  he,
  Xt,
  en,
  Gn,
  Kn,
  ue,
  Yt,
  be
];

// ---- Region B: lines 2531-2640 (policy orchestrator + 10-min timer + handlers) ----
  return ("syncOnClose" in t || "wowPaths" in t) && on(), "wowPaths" in t && x?.webContents.send("wow:installs-changed"), n;
});
let ie = {
  restricted: !1,
  // last-known detection result
  enforce: !1,
  // last-known operator flag
  enforceCheckedAt: 0,
  // ms epoch of the last enforcement fetch
  lastSyncResult: null,
  // { changed, present, memberId } | { error } | { skipped }
  lastCleanupResult: null
  // tally from runAccountCleanup()
};
const $o = 10 * 60 * 1e3;
let Dt = null;
async function At() {
  const e = D(), t = e.userSession, n = t?.persona ?? t?.session?.persona, s = n && (n._id || n.id || n), o = t?.token ?? t?.session?.token ?? null, a = (e.wowPaths ?? []).flatMap((i) => xe(i)), r = Bs(a, Te);
  if (ie.restricted = !!r, s && o)
    try {
      ie.lastSyncResult = await Us({
        apiUrl: te,
        token: o,
        personaId: s,
        present: r
      });
    } catch (i) {
      ie.lastSyncResult = { error: i?.message ?? "sync_threw" };
    }
  else
    ie.lastSyncResult = { skipped: "no_session" };
  const c = await Ks(ge);
  if (ie.enforce = !!c.enforce, ie.enforceCheckedAt = Date.now(), ie.restricted && ie.enforce)
    try {
      const i = await Le();
      (Array.isArray(i) ? i.some((u) => u?.running) : !!i) ? ie.lastCleanupResult = { skipped: "wow_running" } : ie.lastCleanupResult = _o(a);
    } catch (i) {
      ie.lastCleanupResult = { error: i?.message ?? "cleanup_threw" };
    }
  else
    ie.lastCleanupResult = { skipped: "not_enforced" };
  return { restricted: ie.restricted, enforce: ie.enforce };
}
function _o(e) {
  let t = 0, n = 0, s = 0;
  for (const o of e ?? []) {
    const a = Te(o.path) ?? [];
    for (const r of a) {
      const c = Ls(r.path), i = Gs([o], () => [r]);
      for (const l of i) {
        t += 1;
        try {
          const u = zs(l, c);
          u?.purged && (n += 1, s += u.purged);
        } catch (u) {
          console.warn("[policy] purge failed for", l, u?.message ?? u);
        }
      }
    }
  }
  return { filesScanned: t, filesPurged: n, totalRemoved: s };
}
function Zn() {
  Dt || (Dt = setInterval(() => {
    At().catch((e) => console.warn("[policy] refresh failed:", e?.message ?? e));
  }, $o), Dt.unref?.());
}
O.handle("policy:state", () => ({
  restricted: ie.restricted,
  enforce: ie.enforce,
  enforceCheckedAt: ie.enforceCheckedAt
}));
O.handle("policy:refresh", () => At());
function Ke() {
  const e = D();
  return Array.isArray(e.ignoredUpstreamIds) ? e.ignoredUpstreamIds.map(String) : [];
}
O.handle("ignore-upstream:list", () => Ke());
O.handle("ignore-upstream:add", (e, t) => {
  const n = String(t || "").trim();
  if (!n) return Ke();
  const s = new Set(Ke());
  return s.add(n), F({ ignoredUpstreamIds: [...s] }), [...s];
});
O.handle("ignore-upstream:remove", (e, t) => {
  const n = String(t || "").trim();
  if (!n) return Ke();
  const s = new Set(Ke());
  return s.delete(n), F({ ignoredUpstreamIds: [...s] }), [...s];
});
O.handle("ignore-upstream:clear", () => (F({ ignoredUpstreamIds: [] }), []));
O.handle("wow:detect", () => Le());
async function Xn(e) {
  const t = ["sequence", "gseVariable", "gseMacro"], n = { sequence: [], gseVariable: [], gseMacro: [] };
  return await Promise.all(t.map(async (s) => {
    let o = null;
    for (let a = 0; a < 20; a++) {
      const r = { type: s, limit: 100, ...o ? { cursor: o } : {} }, c = await fetch(`${ge}/sync/incoming`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${e}`, ...Se() },
        body: JSON.stringify(r)
      });
      if (!c.ok) break;
      const i = await c.json();
      if (n[s].push(...i.items || []), o = i.nextCursor, !o) break;
    }
  })), n;
}
O.handle("modeA:preview", async (e, { clientPath: t, accountName: n }) => {
  try {
