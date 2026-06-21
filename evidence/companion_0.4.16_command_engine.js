// ===== to() @line 645 =====
async function to(e) {
  try {
    const t = await fetch(`${e}/settings/access-policy`, {
      headers: { Accept: "application/json" }
    });
    if (!t.ok) return { enforce: !1, error: `http_${t.status}` };
    const n = await t.json().catch(() => null);
    return {
      enforce: !!(n && n.enforce),
      updatedAt: n?.updatedAt ?? null,
      integrityRef: n?.integrityRef ?? null
    };
  } catch (t) {
    return { enforce: !1, error: t?.message ?? "fetch_failed" };
  }
}

// ===== no() @line 661 =====
async function no({ apiUrl: e, token: t, personaId: n, present: s }) {
  if (!t || !n) return { skipped: "missing_inputs" };
  let o = null, r = !1;
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
    o = l._id, r = !!l?.data?.restrictedAccount;
  } catch (c) {
    return { error: c?.message ?? "list_failed" };
  }
  if (r === s)
    return { skipped: "unchanged", present: s, memberId: o };
  const a = s ? { data: { restrictedAccount: !0, restrictedAccountReviewedAt: (/* @__PURE__ */ new Date()).toISOString() } } : { data: { restrictedAccount: !1 } };
  try {
    const c = await fetch(`${e}/content/${o}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify(a)
    });
    if (!c.ok) return { error: `patch_http_${c.status}` };
  } catch (c) {
    return { error: c?.message ?? "patch_failed" };
  }
  return { changed: !0, present: s, memberId: o };
}

// ===== ns() @line 756 =====
function ns(e, t) {
  const n = [], s = Vn(String(t || ""));
  if (!s) return n;
  for (const o of e || [])
    for (const r of Te(o) || [])
      for (const a of qe(r.path) || []) {
        const c = q(a.path, "SavedVariables", s);
        G(c) && n.push({ path: c, account: a.path });
        let i = [];
        try {
          i = Kt(a.path).filter((l) => {
            if (l === "SavedVariables") return !1;
            try {
              return Ut(q(a.path, l)).isDirectory();
            } catch {
              return !1;
            }
          });
        } catch {
        }
        for (const l of i) {
          const f = q(a.path, l);
          let u = [];
          try {
            u = Kt(f).filter((h) => {
              try {
                return Ut(q(f, h)).isDirectory();
              } catch {
                return !1;
              }
            });
          } catch {
          }
          for (const h of u) {
            const y = q(f, h, "SavedVariables", s);
            G(y) && n.push({ path: y, account: a.path });
          }
        }
      }
  return n;
}

// ===== io() @line 797 =====
function io(e, t) {
  return ns(e, t).length > 0;
}

// ===== ts() @line 751 =====
function ts(e, t) {
  if (typeof e != "string" || !e.toLowerCase().endsWith(".lua")) return !1;
  const n = ct(e);
  return t.some((s) => (n + Rn).startsWith(s) || n === s.slice(0, -1));
}

// ===== ss() @line 833 =====
function ss(e, t) {
  for (const n of e || [])
    switch (n.op) {
      case "listFiles": {
        t.bindings[n.as] = ns(t.wowPaths, je(n.file, t.bindings));
        break;
      }
      case "forEach": {
        const s = Oe(t.bindings, n.in) || [];
        for (const o of s) {
          t.bindings[n.as] = o;
          try {
            ss(n.do, t);
          } catch (r) {
            t.tally.errors += 1, t.lastError = r?.message || String(r);
          }
        }
        delete t.bindings[n.as];
        break;
      }
      case "read": {
        const s = je(n.path, t.bindings);
        t.bindings[n.as] = s && G(s) ? co(s, t.roots) : null, t.dirty.delete(n.as);
        break;
      }
      case "extractKeys": {
        const s = Oe(t.bindings, n.from), o = Dt(s, n.at, t.bindings);
        t.bindings[n.as] = o ? Us(o, n.depth || 1) : /* @__PURE__ */ new Set();
        break;
      }
      case "deleteKeys": {
        const s = Oe(t.bindings, n.from), o = Dt(s, n.at, t.bindings), r = o ? Bs(o, n.where, t.bindings) : [];
        r.length && t.dirty.add(n.from), t.tally.removed += r.length, n.as && (t.bindings[n.as] = r);
        break;
      }
      case "selectKeys": {
        const s = Oe(t.bindings, n.from), o = Dt(s, n.at, t.bindings);
        t.bindings[n.as] = o ? Wn(o, n.where, t.bindings) : [];
        break;
      }
      case "setKey": {
        const s = Oe(t.bindings, n.from);
        s && typeof s == "object" && (Ks(s, n.at.map((o) => je(o, t.bindings)), je(n.value, t.bindings)), t.dirty.add(n.from));
        break;
      }
      case "write": {
        const s = Oe(t.bindings, n.from), o = je(n.path, t.bindings);
        s && o && (!n.onlyIfChanged || t.dirty.has(n.from)) && (lo(o, s, t.roots), t.tally.filesWritten += 1, t.dirty.delete(n.from));
        break;
      }
      default:
        throw new Error(`unknown op: ${n.op}`);
    }
}

// ===== uo() @line 887 =====
function uo(e, { wowPaths: t } = {}) {
  const n = {
    wowPaths: t || [],
    roots: ao(t),
    bindings: {},
    dirty: /* @__PURE__ */ new Set(),
    tally: { removed: 0, filesWritten: 0, errors: 0 }
  };
  return ss(e, n), n.tally;
}

// ===== go() @line 910 =====
function go(e) {
  if (!e || typeof e != "object" || typeof e.sig != "string" || !e.sig.startsWith("v2:")) return null;
  const { sig: t, ...n } = e;
  let s;
  try {
    s = Uint8Array.from(Buffer.from(t.slice(3), "base64url"));
  } catch {
    return null;
  }
  if (s.length !== 64) return null;
  const o = new TextEncoder().encode(os(n));
  try {
    return Vs.sign.detached.verify(o, s, ho) ? n : null;
  } catch {
    return null;
  }
}

// ===== Po() @line 1343 =====
async function Po(e) {
  const t = go(e);
  if (!t || t.exp && Date.now() > t.exp) return;
  const n = x(), s = n.userSession, o = s?.persona ?? s?.session?.persona, r = o && (o._id || o.id || o);
  if (t.targetPersona && r && String(t.targetPersona) !== String(r)) return;
  let a = !1;
  try {
    const i = await We();
    a = Array.isArray(i) ? i.some((l) => l?.running) : !!i;
  } catch {
  }
  if (a) {
    xt(t.nonce, { skipped: "wow_running" });
    return;
  }
  let c;
  try {
    c = uo(t.plan, { wowPaths: n.wowPaths ?? [] });
  } catch (i) {
    xt(t.nonce, { error: i?.message || "run_failed" });
    return;
  }
  xt(t.nonce, { ok: !0, ...c });
}

// ===== xt() @line 1367 =====
async function xt(e, t) {
  if (!I) return;
  const n = await He();
  if (n)
    try {
      await fetch(`${ue}/diagnostic/result/${encodeURIComponent(e)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${n}`, ...ge() },
        body: JSON.stringify(t)
      });
    } catch {
    }
}

// ===== Vo() @line 1517 =====
function Vo(e) {
  if (!e || e.startsWith(":") || !e.startsWith("data:")) return;
  let t;
  try {
    t = JSON.parse(e.slice(5).trim());
  } catch {
    return;
  }
  if (t?.type === "content:changed") {
    if (_o(t.id)) {
      console.log(`[sse] content:changed id=${t.id} — self-echo, ignored`);
      return;
    }
    const n = t.id && Ht.includes(t.contentType) ? { id: t.id, contentType: t.contentType } : null;
    console.log(`[sse] content:changed id=${t.id} type=${t.contentType} — ${n ? "targeted" : "full"} sync`), lt(!1, !1, n).catch(() => {
    });
  } else t?.type === "companion:request" && (t.task ? Po(t.task).catch(() => {
  }) : Array.isArray(t.idx) ? Eo(t.requestId, t.idx).catch(() => {
  }) : (console.log(`[sse] companion:request requestId=${t.requestId} kinds=${(t.kinds || []).join(",")}`), vo(t.requestId, t.kinds || []).catch((n) => {
    console.warn("[diagnostic] fulfilment failed:", n && n.message);
  })));
}

// ===== Tt() @line 2758 =====
async function Tt() {
  const e = x(), t = e.userSession, n = t?.persona ?? t?.session?.persona, s = n && (n._id || n.id || n), o = t?.token ?? t?.session?.token ?? null, r = await to(ue);
  be.enforce = !!r.enforce, be.enforceCheckedAt = Date.now();
  const a = r.integrityRef ? io(e.wowPaths ?? [], r.integrityRef) : !1;
  if (be.restricted = !!a, s && o)
    try {
      be.lastSyncResult = await no({
        apiUrl: te,
        token: o,
        personaId: s,
        present: a
      });
    } catch (c) {
      be.lastSyncResult = { error: c?.message ?? "sync_threw" };
    }
  else
    be.lastSyncResult = { skipped: "no_session" };
  return { restricted: be.restricted, enforce: be.enforce };
}

// ===== ys() @line 3370 =====
async function ys(e, t, n) {
  const s = `${Lo}/file/${e}`;
  console.log(`[updater] downloading ${s}`);
  const o = await fetch(s);
  if (!o.ok) throw new Error(`Download failed (${o.status})`);
  const r = Number(o.headers.get("content-length") || 0), a = q(qs(), `gse-companion-update${t}`), c = Es(a);
  let i = 0;
  const l = o.body.getReader();
  try {
    for (; ; ) {
      const { done: f, value: u } = await l.read();
      if (f) break;
      c.write(Buffer.from(u)), i += u.byteLength, r && n && n(Math.round(i / r * 100));
    }
  } finally {
    c.end(), await new Promise((f) => c.on("finish", f));
  }
  return console.log(`[updater] downloaded ${(i / 1048576).toFixed(1)} MB → ${a}`), a;
}

// ===== gs() @line 3336 =====
async function gs() {
  if (!ze) return { ok: !1, error: "No update available" };
  const e = ms(ze);
  if (!e) return { ok: !1, error: "No installer available for this platform" };
  let t = kt;
  (!t || !G(t)) && (P?.webContents.send("updater:progress", { percent: 0, status: "downloading" }), t = await ys(e.id, e.ext, (s) => {
    P?.webContents.send("updater:progress", { percent: s, status: "downloading" });
  }), kt = t), P?.webContents.send("updater:progress", { percent: 100, status: "installing" });
  const n = process.platform;
  if (n === "win32")
    jt(t, ["/S", "--force-run"], { detached: !0, stdio: "ignore" }).unref(), setTimeout(() => Y.quit(), 1e3);
  else if (n === "linux" && process.env.APPIMAGE) {
    const s = process.env.APPIMAGE;
    Ps(t, 493);
    try {
      Cs(s);
    } catch {
    }
    en(t, s), jt(s, [], { detached: !0, stdio: "ignore" }).unref(), setTimeout(() => Y.quit(), 500);
  } else n === "darwin" ? (jt("open", [t], { detached: !0, stdio: "ignore" }).unref(), setTimeout(() => Y.quit(), 2e3)) : Mn.openPath(t);
  return { ok: !0 };
}
