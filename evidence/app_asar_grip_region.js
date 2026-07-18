 applies across every WoW client/account this
  // Companion manages.
  ignoredUpstreamIds: []
};
function settingsPath() {
  return join(app.getPath("userData"), "settings.json");
}
function readSettings() {
  try {
    const p = settingsPath();
    if (existsSync(p)) {
      return { ...DEFAULTS, ...JSON.parse(readFileSync(p, "utf-8")) };
    }
  } catch {
  }
  return { ...DEFAULTS };
}
function writeSettings(patch) {
  const p = settingsPath();
  const tmp = p + ".tmp";
  const current = readSettings();
  const body = JSON.stringify({ ...current, ...patch }, null, 2);
  const fd = openSync(tmp, "w");
  try {
    writeSync(fd, body);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tmp, p);
  return readSettings();
}
createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const CLIENT_FOLDERS = {
  "_retail_": { name: "Retail", exes: ["wow", "wow.exe"], clientType: "retail" },
  "_ptr_": { name: "PTR", exes: ["wowt", "wowt.exe"], clientType: "retail" },
  "_xptr_": { name: "Expansion PTR", exes: ["wowt", "wowt.exe"], clientType: "retail" },
  "_beta_": { name: "Beta", exes: ["wowb", "wowb.exe"], clientType: "retail-beta" },
  "_classic_": { name: "Classic", exes: ["wowclassic", "wowclassic.exe"], clientType: "classic-prog" },
  "_classic_era_": { name: "Classic Era", exes: ["wowclassic", "wowclassic.exe"], clientType: "classic-era" },
  "_anniversary_": { name: "Anniversary", exes: ["wowclassic", "wowclassic.exe"], clientType: "classic-prog" },
  "_classic_beta_": { name: "Classic Beta", exes: ["wowclassicb", "wowclassicb.exe"], clientType: "classic-prog" }
};
async function detectRunningWow() {
  try {
    if (process.platform === "win32") {
      const { stdout: stdout2 } = await execFileAsync("tasklist", ["/fo", "csv", "/nh"]);
      const names = stdout2.split("\n").map((l) => l.split(",")[0]?.replace(/"/g, "").toLowerCase());
      const allExes = new Set(
        Object.values(CLIENT_FOLDERS).flatMap((c) => c.exes.map((e) => e.toLowerCase()))
      );
      return [...new Set(names.filter((n) => n && allExes.has(n)))];
    }
    const { stdout } = await execFileAsync("ps", ["-A", "-o", "args="]);
    const running = /* @__PURE__ */ new Set();
    const HELPER_NAMES = /\b(WowVoiceProxy|WoWErrorReporter|Battle\.net Helper|Agent)\.exe/i;
    for (const rawLine of stdout.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      if (/\/Helpers\//i.test(line)) continue;
      if (HELPER_NAMES.test(line)) continue;
      const normalized = line.replace(/\\/g, "/");
      for (const [folder, meta] of Object.entries(CLIENT_FOLDERS)) {
        if (normalized.includes(`/${folder}/`)) {
          running.add(meta.exes[0]);
          break;
        }
      }
    }
    return [...running];
  } catch (err) {
    console.error("[wow] detectRunningWow failed:", err?.message ?? err);
    return [];
  }
}
function isClientRunning(folderKey, runningExes) {
  if (!folderKey || !Array.isArray(runningExes) || !runningExes.length) return false;
  const meta = CLIENT_FOLDERS[folderKey];
  if (!meta || !Array.isArray(meta.exes)) return false;
  const lowered = new Set(runningExes.map((e) => String(e).toLowerCase()));
  return meta.exes.some((e) => lowered.has(String(e).toLowerCase()));
}
function getWowClients(basePath) {
  if (!basePath) return [];
  const clients = [];
  for (const [folder, meta] of Object.entries(CLIENT_FOLDERS)) {
    const clientPath = join(basePath, folder);
    if (existsSync(join(clientPath, "WTF"))) {
      clients.push({ folder, name: meta.name, path: clientPath });
    }
  }
  return clients;
}
function getGseVersion(clientPath) {
  const tocPath = join(clientPath, "Interface", "AddOns", "GSE", "GSE.toc");
  if (!existsSync(tocPath)) return null;
  const content = readFileSync(tocPath, "utf-8");
  const match = content.match(/^## Version:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}
const EXPANSION_BY_MAJOR = {
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
function getClientExpansion(clientPath) {
  const basePath = join(clientPath, "..");
  const buildInfoPath = join(basePath, ".build.info");
  if (!existsSync(buildInfoPath)) return null;
  try {
    const content = readFileSync(buildInfoPath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return null;
    const headers = lines[0].split("|").map((h) => h.split("!")[0]);
    const versionIdx = headers.indexOf("Version");
    const productIdx = headers.indexOf("Product");
    if (versionIdx < 0 || productIdx < 0) return null;
    const flavorPath = join(clientPath, ".flavor.info");
    if (!existsSync(flavorPath)) return null;
    const flavorLines = readFileSync(flavorPath, "utf-8").split("\n").filter((l) => l.trim());
    const flavor = flavorLines[flavorLines.length - 1]?.trim();
    if (!flavor) return null;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("|");
      if (cols[productIdx]?.trim() !== flavor) continue;
      const version = cols[versionIdx]?.trim();
      if (!version) continue;
      const major = parseInt(version.split(".")[0], 10);
      if (!isNaN(major) && EXPANSION_BY_MAJOR[major]) {
        return EXPANSION_BY_MAJOR[major];
      }
    }
  } catch {
  }
  return null;
}
function serializeSavedVariables(obj) {
  const parts = [];
  for (const [k, v] of Object.entries(obj || {})) {
    parts.push(`${k} = ${luaValue(v, 0)}`);
  }
  return parts.join("\n") + "\n";
}
function luaValue(v, depth) {
  if (v === null || v === void 0) return "nil";
  if (v === true) return "true";
  if (v === false) return "false";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return String(v);
  }
  if (typeof v === "string") return luaString(v);
  if (Array.isArray(v)) {
    const pad = "  ".repeat(depth + 1);
    const close = "  ".repeat(depth);
    const inner = v.map((x, i) => `${pad}[${i + 1}] = ${luaValue(x, depth + 1)}`).join(",\n");
    return v.length === 0 ? "{}" : `{
${inner},
${close}}`;
  }
  if (typeof v === "object") {
    const entries = Object.entries(v);
    if (entries.length === 0) return "{}";
    const pad = "  ".repeat(depth + 1);
    const close = "  ".repeat(depth);
    const inner = entries.map(([k, x]) => `${pad}${luaKey(k)} = ${luaValue(x, depth + 1)}`).join(",\n");
    return `{
${inner},
${close}}`;
  }
  return "nil";
}
function luaKey(k) {
  if (/^-?\d+$/.test(k)) return `[${k}]`;
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) && !LUA_KEYWORDS.has(k)) return k;
  return `[${luaString(k)}]`;
}
const LUA_KEYWORDS = /* @__PURE__ */ new Set([
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
function luaString(s) {
  return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\0/g, "\\0") + '"';
}
function readSavedVariables(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    const content = readFileSync(filePath, { encoding: "latin1" });
    const ast = luaparse.parse(content, { encodingMode: "pseudo-latin1", luaVersion: "5.1" });
    const result = {};
    for (const node of ast.body) {
      if (node.type === "AssignmentStatement") {
        const name = node.variables[0]?.name;
        if (name) result[name] = luaValueToJs(node.init[0]);
      }
    }
    return result;
  } catch (err) {
    console.error(`[wow] readSavedVariables failed for ${filePath}:`, err?.message ?? err);
    return null;
  }
}
function luaValueToJs(node) {
  if (!node) return null;
  switch (node.type) {
    case "StringLiteral":
      return node.value;
    case "NumericLiteral":
      return node.value;
    case "BooleanLiteral":
      return node.value;
    case "NilLiteral":
      return null;
    case "TableConstructorExpression": {
      const fields = node.fields;
      const obj = {};
      let isArray = true;
      for (const f of fields) {
        if (f.type === "TableKey") {
          isArray = false;
          obj[luaValueToJs(f.key)] = luaValueToJs(f.value);
        } else if (f.type === "TableKeyString") {
          isArray = false;
          obj[f.key.name] = luaValueToJs(f.value);
        } else {
          obj[Object.keys(obj).length + 1] = luaValueToJs(f.value);
        }
      }
      return isArray && fields.length > 0 ? Object.values(obj) : obj;
    }
    default:
      return null;
  }
}
const EXPANSION_BY_PREFIX = {
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
function tocToExpansion(toc) {
  const n = Math.floor(Number(toc));
  if (!n || n <= 0) return "Unknown";
  const s = String(n);
  const prefix = s.length >= 6 ? parseInt(s.slice(0, 2), 10) : parseInt(s[0], 10);
  return EXPANSION_BY_PREFIX[prefix] ?? "Unknown";
}
const CLIENT_CURRENT_EXPANSION = {
  "_retail_": "Midnight",
  "_ptr_": "Midnight",
  "_xptr_": "The Last Titan",
  "_beta_": "The Last Titan",
  "_classic_": "MoP Classic",
  "_classic_era_": "Classic Era",
  "_anniversary_": "MoP Classic",
  "_classic_beta_": "MoP Classic"
};
function clientDefaultExpansion(folderKey) {
  return CLIENT_CURRENT_EXPANSION[folderKey] ?? "Unknown";
}
function mapsToObjects(val) {
  if (Buffer.isBuffer(val) || val instanceof Uint8Array) {
    return Buffer.from(val).toString("utf8");
  }
  if (val instanceof Map) {
    const obj = {};
    for (const [k, v] of val) {
      const keyStr = Buffer.isBuffer(k) || k instanceof Uint8Array ? Buffer.from(k).toString("utf8") : String(k);
      obj[keyStr] = mapsToObjects(v);
    }
    return obj;
  }
  if (Array.isArray(val)) return val.map(mapsToObjects);
  if (val && typeof val === "object") {
    const out = {};
    for (const k of Object.keys(val)) out[k] = mapsToObjects(val[k]);
    return out;
  }
  return val;
}
function decodeGSEBlob(encoded) {
  if (typeof encoded !== "string" || !encoded.startsWith("!GSE3!")) return null;
  try {
    const compressed = Buffer.from(encoded.slice(6), "base64");
    const cborBuf = require2("zlib").inflateRawSync(compressed);
    const { Decoder } = require2("cbor-x");
    const raw = new Decoder({ mapsAsObjects: false, useRecords: false }).decode(cborBuf);
    return mapsToObjects(raw);
  } catch {
    return null;
  }
}
function escapeLua(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
function getWtfAccounts(clientPath) {
  const { readdirSync: readdirSync2, statSync: statSync2 } = require2("fs");
  const wtfPath = join(clientPath, "WTF", "Account");
  if (!existsSync(wtfPath)) return [];
  try {
    return readdirSync2(wtfPath).filter((name) => name !== "SavedVariables").filter((name) => statSync2(join(wtfPath, name)).isDirectory()).map((name) => ({ name, path: join(wtfPath, name) }));
  } catch {
    return [];
  }
}
const BRIDGE_ADDON_NAME = "GSE_Companion";
const BRIDGE_DATA_FILE = "GSE_Companion_Data.lua";
function getAddonSourceDir() {
  const thisFile = fileURLToPath(import.meta.url);
  const mainDir = dirname(thisFile);
  const devPath = join(mainDir, "..", "..", "addon");
  if (existsSync(devPath)) return devPath;
  const prodPath = join(mainDir, "..", "..", "..", "addon");
  if (existsSync(prodPath)) return prodPath;
  if (process.resourcesPath) {
    const resPath = join(process.resourcesPath, "addon");
    if (existsSync(resPath)) return resPath;
  }
  return devPath;
}
function ensureBridgeAddon(clientPath) {
  const addonsPath = join(clientPath, "Interface", "AddOns", BRIDGE_ADDON_NAME);
  if (!existsSync(join(clientPath, "Interface", "AddOns"))) return false;
  if (!existsSync(addonsPath)) {
    mkdirSync(addonsPath, { recursive: true });
  }
  const sourceDir = getAddonSourceDir();
  let filesToCopy;
  try {
    filesToCopy = readdirSync(sourceDir).filter((file) => {
      if (!/\.(toc|lua)$/i.test(file)) return false;
      if (/_Data\.lua$/i.test(file)) return false;
      try {
        return statSync(join(sourceDir, file)).isFile();
      } catch {
        return false;
      }
    });
  } catch {
    filesToCopy = ["GSE_Companion.toc", "Bootstrap.lua", "GSE_Companion.lua"];
  }
  for (const file of filesToCopy) {
    const src = join(sourceDir, file);
    const dst = join(addonsPath, file);
    if (existsSync(src)) {
      copyFileSync(src, dst);
    }
  }
  const dataPath = join(addonsPath, BRIDGE_DATA_FILE);
  if (!existsSync(dataPath)) {
    writeFileSync(dataPath, "GSECompanionData = {}\n", { encoding: "latin1" });
  }
  return true;
}
function getBridgeDataPath(clientPath) {
  return join(clientPath, "Interface", "AddOns", BRIDGE_ADDON_NAME, BRIDGE_DATA_FILE);
}
let bridgeIdCounter = 0;
function genBridgeId() {
  return `${Date.now().toString(36)}_${(bridgeIdCounter++).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
function entryToLua(entry, indent) {
  const I = " ".repeat(indent);
  const lines = [`${I}{`];
  for (const [k, v] of Object.entries(entry)) {
    if (v == null) continue;
    if (k === "displayItems") continue;
    if (k === "sequences" && typeof v === "object") {
      lines.push(`${I}  ["sequences"] = {`);
      for (const [sk, sv] of Object.entries(v)) {
        lines.push(`${I}    ["${escapeLua(sk)}"] = "${escapeLua(sv)}",`);
      }
      lines.push(`${I}  },`);
    } else if (typeof v === "number") {
      lines.push(`${I}  ["${escapeLua(k)}"] = ${v},`);
    } else {
      lines.push(`${I}  ["${escapeLua(k)}"] = "${escapeLua(String(v))}",`);
    }
  }
  lines.push(`${I}},`);
  return lines.join("\n");
}
function writeBridgeData(clientPath, { queue, incomingQueue }) {
  const addonOk = ensureBridgeAddon(clientPath);
  const dataPath = getBridgeDataPath(clientPath);
  console.log("[bridge] writeBridgeData:", { clientPath, dataPath, addonOk, hasQueue: !!queue?.length, hasIncoming: !!incomingQueue?.length });
  if (!addonOk) return;
  const sidecarPath = dataPath.replace(/\.lua$/, ".json");
  let sidecar = { queue: [], incomingQueue: [] };
  if (existsSync(sidecarPath)) {
    try {
      sidecar = JSON.parse(readFileSync(sidecarPath, "utf-8"));
    } catch {
    }
  }
  const incomingIdentityKey = (item) => {
    if (!item) return null;
    if (item.contentType && item.name) return `${item.contentType}:${item.name}`;
    if (item.name) return `name:${item.name}`;
    return null;
  };
  if (incomingQueue?.length) {
    for (const item of incomingQueue) {
      const key = incomingIdentityKey(item);
      if (key) {
        const before = sidecar.incomingQueue.length;
        sidecar.incomingQueue = sidecar.incomingQueue.filter((e) => incomingIdentityKey(e) !== key);
        const dropped = before - sidecar.incomingQueue.length;
        if (dropped > 0) console.log(`[bridge] superseding ${dropped} stale incoming entr${dropped === 1 ? "y" : "ies"} for ${key}`);
      }
      sidecar.incomingQueue.push({ ...item, _id: item._id || genBridgeId() });
    }
  }
  {
    const lastIndexByKey = /* @__PURE__ */ new Map();
    sidecar.incomingQueue.forEach((e, i) => {
      const k = incomingIdentityKey(e);
      if (k) lastIndexByKey.set(k, i);
    });
    const before = sidecar.incomingQueue.length;
    sidecar.incomingQueue = sidecar.incomingQueue.filter((e, i) => {
      const k = incomingIdentityKey(e);
      return !k || lastIndexByKey.get(k) === i;
    });
    const dropped = before - sidecar.incomingQueue.length;
    if (dropped > 0) console.log(`[bridge] collapsed ${dropped} pre-existing duplicate incoming entr${dropped === 1 ? "y" : "ies"}`);
  }
  if (queue?.length) {
    for (const entry of queue) {
      const isDuplicate = sidecar.queue.some(
        (existing) => existing.action === entry.action && existing.name === entry.name && (entry.action !== "setPlatformID" || existing.platformid === entry.platformid)
      );
      if (isDuplicate) {
        console.log(`[bridge] skipping duplicate queue entry: ${entry.action} "${entry.name}"`);
        continue;
      }
      sidecar.queue.push({ ...entry, _id: genBridgeId() });
    }
  }
  writeFileSync(sidecarPath, JSON.stringify(sidecar), "utf-8");
  const LUA_QUEUE_CAP = 100;
  const incomingForced = sidecar.incomingQueue.filter((e) => e.force);
  const incomingNormal = sidecar.incomingQueue.filter((e) => !e.force);
  const incomingSlice = [...incomingForced, ...incomingNormal];
  const queueSlice = sidecar.queue.slice(0, LUA_QUEUE_CAP);
  const parts = ["GSECompanionData = {"];
  if (incomingSlice.length) {
    parts.push('  ["incomingQueue"] = {');
    for (const item of incomingSlice) parts.push(entryToLua(item, 4));
    parts.push("  },");
  }
  if (queueSlice.length) {
    parts.push('  ["queue"] = {');
    for (const entry of queueSlice) parts.push(entryToLua(entry, 4));
    parts.push("  },");
  }
  parts.push("}");
  const lua = parts.join("\n") + "\n";
  const incomingBacklog = sidecar.incomingQueue.length - incomingSlice.length;
  const queueBacklog = sidecar.queue.length - queueSlice.length;
  console.log(
    "[bridge] writing Lua data file:",
    dataPath,
    "| queue:",
    sidecar.queue.length,
    "(emit",
    queueSlice.length,
    "backlog",
    queueBacklog,
    ")",
    "| incoming:",
    sidecar.incomingQueue.length,
    "(emit",
    incomingSlice.length,
    "backlog",
    incomingBacklog,
    ")",
    "| bytes:",
    lua.length
  );
  writeFileSync(dataPath, lua, { encoding: "latin1" });
  return true;
}
function incomingIdentityFromEntry(item) {
  if (!item || typeof item.name !== "string" || item.name === "") return null;
  const ct = item.contentType || "sequence";
  const cs = item.checksum || "";
  return `${ct}:${item.name}:${cs}`;
}
function pruneIncomingMatching(clientPath, predicate) {
  if (typeof predicate !== "function") return 0;
  const dataPath = getBridgeDataPath(clientPath);
  const sidecarPath = dataPath.replace(/\.lua$/, ".json");
  if (!existsSync(sidecarPath)) return 0;
  let sidecar;
  try {
    sidecar = JSON.parse(readFileSync(sidecarPath, "utf-8"));
  } catch {
    return 0;
  }
  if (!Array.isArray(sidecar.incomingQueue) || !sidecar.incomingQueue.length) return 0;
  const before = sidecar.incomingQueue.length;
  sidecar.incomingQueue = sidecar.incomingQueue.filter((e) => {
    try {
      return !predicate(e);
    } catch {
      return true;
    }
  });
  const removed = before - sidecar.incomingQueue.length;
  if (removed === 0) return 0;
  writeFileSync(sidecarPath, JSON.stringify(sidecar), "utf-8");
  writeBridgeData(clientPath, {});
  return removed;
}
function pruneIncomingByPlatformIds(clientPath, platformIds) {
  if (!Array.isArray(platformIds) || !platformIds.length) return 0;
  const dataPath = getBridgeDataPath(clientPath);
  const sidecarPath = dataPath.replace(/\.lua$/, ".json");
  if (!existsSync(sidecarPath)) return 0;
  let sidecar;
  try {
    sidecar = JSON.parse(readFileSync(sidecarPath, "utf-8"));
  } catch {
    return 0;
  }
  if (!Array.isArray(sidecar.incomingQueue) || !sidecar.incomingQueue.length) return 0;
  const idSet = new Set(platformIds.map(String));
  const before = sidecar.incomingQueue.length;
  sidecar.incomingQueue = sidecar.incomingQueue.filter((e) => !idSet.has(String(e._id ?? "")));
  const removed = before - sidecar.incomingQueue.length;
  if (removed === 0) return 0;
  writeFileSync(sidecarPath, JSON.stringify(sidecar), "utf-8");
  writeBridgeData(clientPath, {});
  return removed;
}
function pruneBridgeData(clientPath, processedIds, importedKeys = []) {
  const dataPath = getBridgeDataPath(clientPath);
  const sidecarPath = dataPath.replace(/\.lua$/, ".json");
  if (!existsSync(sidecarPath)) return 0;
  let sidecar;
  try {
    sidecar = JSON.parse(readFileSync(sidecarPath, "utf-8"));
  } catch {
    return 0;
  }
  const idSet = new Set(processedIds);
  const keySet = new Set(importedKeys);
  const beforeCount = (sidecar.queue?.length ?? 0) + (sidecar.incomingQueue?.length ?? 0);
  sidecar.queue = (sidecar.queue ?? []).filter((e) => !idSet.has(e._id));
  sidecar.incomingQueue = (sidecar.incomingQueue ?? []).filter((e) => {
    const k = incomingIdentityFromEntry(e);
    return !(k && keySet.has(k));
  });
  const afterCount = sidecar.queue.length + sidecar.incomingQueue.length;
  const removed = beforeCount - afterCount;
  if (removed === 0) return 0;
  writeFileSync(sidecarPath, JSON.stringify(sidecar), "utf-8");
  writeBridgeData(clientPath, {});
  return removed;
}
function readBridgePending(clientPath) {
  try {
    const dataPath = getBridgeDataPath(clientPath);
    const sidecarPath = dataPath.replace(/\.lua$/, ".json");
    if (!existsSync(sidecarPath)) return { queue: [], incomingQueue: [] };
    const data = JSON.parse(readFileSync(sidecarPath, "utf-8"));
    return { queue: data.queue ?? [], incomingQueue: data.incomingQueue ?? [] };
  } catch {
    return { queue: [], incomingQueue: [] };
  }
}
function readBridgeProcessedIds(accountPath) {
  const svPath = join(accountPath, "SavedVariables", "GSE_Companion.lua");
  const sv = readSavedVariables(svPath);
  const db = sv?.GSECompanionBridgeDB;
  if (!db) return { processedIds: [], importedKeys: [] };
  return {
    processedIds: Object.keys(db.processed ?? {}),
    importedKeys: Object.keys(db.imported ?? {})
  };
}
function clearBridgeData(clientPath) {
  const dataPath = getBridgeDataPath(clientPath);
  const sidecarPath = dataPath.replace(/\.lua$/, ".json");
  if (existsSync(dataPath)) {
    writeFileSync(dataPath, "GSECompanionData = {}\n", { encoding: "latin1" });
  }
  if (existsSync(sidecarPath)) {
    writeFileSync(sidecarPath, JSON.stringify({ queue: [], incomingQueue: [] }), "utf-8");
  }
}
const GRIP_SV_FILENAME = "GRIP-EMS.lua";
function accountHasGripEms(accountPath) {
  if (!accountPath) return false;
  if (existsSync(join(accountPath, "SavedVariables", GRIP_SV_FILENAME))) {
    return true;
  }
  try {
    const servers = readdirSync(accountPath).filter((entry) => {
      if (entry === "SavedVariables") return false;
      try {
        return statSync(join(accountPath, entry)).isDirectory();
      } catch {
        return false;
      }
    });
    for (const server of servers) {
      const serverPath = join(accountPath, server);
      try {
        const chars = readdirSync(serverPath).filter((c) => {
          try {
            return statSync(join(serverPath, c)).isDirectory();
          } catch {
            return false;
          }
        });
        for (const char of chars) {
          if (existsSync(join(serverPath, char, "SavedVariables", GRIP_SV_FILENAME))) {
            return true;
          }
        }
      } catch {
      }
    }
  } catch {
  }
  return false;
}
function detectGripEmsAcrossClients(clients, accountsForClient) {
  for (const client of clients ?? []) {
    const accounts = accountsForClient(client.path) ?? [];
    for (const account of accounts) {
      if (accountHasGripEms(account.path)) return true;
    }
  }
  return false;
}
function listGripCharSavedVarPaths(clients, accountsForClient) {
  const paths = [];
  for (const client of clients ?? []) {
    const accounts = accountsForClient(client.path) ?? [];
    for (const account of accounts) {
      try {
        const servers = readdirSync(account.path).filter((entry) => {
          if (entry === "SavedVariables") return false;
          try {
            return statSync(join(account.path, entry)).isDirectory();
          } catch {
            return false;
          }
        });
        for (const server of servers) {
          const serverPath = join(account.path, server);
          try {
            const chars = readdirSync(serverPath).filter((c) => {
              try {
                return statSync(join(serverPath, c)).isDirectory();
              } catch {
                return false;
              }
            });
            for (const char of chars) {
              const p = join(serverPath, char, "SavedVariables", GRIP_SV_FILENAME);
              if (existsSync(p)) paths.push(p);
            }
          } catch {
          }
        }
      } catch {
      }
    }
  }
  return paths;
}
async function fetchAccessPolicy(svcUrl) {
  try {
    const res = await fetch(`${svcUrl}/settings/access-policy`, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) return { enforce: false, error: `http_${res.status}` };
    const json = await res.json().catch(() => null);
    return {
      enforce: !!(json && json.enforce),
      updatedAt: json?.updatedAt ?? null
    };
  } catch (err) {
    return { enforce: false, error: err?.message ?? "fetch_failed" };
  }
}
async function syncRestrictedAccountFlag({ apiUrl, token, personaId, present }) {
  if (!token || !personaId) return { skipped: "missing_inputs" };
  let memberId = null;
  let currentRestricted = false;
  try {
    const listRes = await fetch(`${apiUrl}/content/gseMember/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        filter: {
          operator: "and",
          filters: [
            { key: "meta.personaAuthor", comparator: "equal", value: personaId }
          ]
        },
        select: ["_id", "data.restrictedAccount"],
        page: { size: 1 }
      })
    });
    if (!listRes.ok) return { error: `list_http_${listRes.status}` };
    const body = await listRes.json().catch(() => null);
    const item = body?.items?.[0];
    if (!item?._id) return { skipped: "no_member" };
    memberId = item._id;
    currentRestricted = !!item?.data?.restrictedAccount;
  } catch (err) {
    return { error: err?.message ?? "list_failed" };
  }
  if (currentRestricted === present) {
    return { skipped: "unchanged", present, memberId };
  }
  const patchBody = present ? { data: { restrictedAccount: true, restrictedAccountReviewedAt: (/* @__PURE__ */ new Date()).toISOString() } } : { data: { restrictedAccount: false } };
  try {
    const patchRes = await fetch(`${apiUrl}/content/${memberId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(patchBody)
    });
    if (!patchRes.ok) return { error: `patch_http_${patchRes.status}` };
  } catch (err) {
    return { error: err?.message ?? "patch_failed" };
  }
  return { changed: true, present, memberId };
}
function readGseSequenceNamesForAccount(accountPath) {
  const names = /* @__PURE__ */ new Set();
  if (!accountPath) return names;
  const gseSv = join(accountPath, "SavedVariables", "GSE.lua");
  const parsed = readSavedVariables(gseSv);
  const seqs = parsed?.GSESequences;
  if (!seqs || typeof seqs !== "object") return names;
  for (const classId of Object.keys(seqs)) {
    const slice = seqs[classId];
    if (!slice || typeof slice !== "object") continue;
    for (const name of Object.keys(slice)) {
      names.add(name);
    }
  }
  return names;
}
function purgeGripCharSequences(gripCharPath, gseSequenceNames) {
  if (!gripCharPath || !existsSync(gripCharPath)) {
    return { skipped: true, reason: "no_file" };
  }
  const parsed = readSavedVariables(gripCharPath);
  if (!parsed) return { skipped: true, reason: "parse_failed" };
  const charBlob = parsed.GRIP_EMS_CHAR;
  const sequences = charBlob?.sequences;
  if (!sequences || typeof sequences !== "object") {
    return { skipped: true, reason: "no_sequences" };
  }
  const toDelete = [];
  for (const [seqName, seqData] of Object.entries(sequences)) {
    if (!seqData || typeof seqData !== "object") continue;
    const provenance = seqData.provenanceSource;
    const isGseLegacy = provenance === "gse-legacy";
    const nameMatchesGse = gseSequenceNames?.has?.(seqName);
    if (isGseLegacy || nameMatchesGse) {
      toDelete.push(seqName);
    }
  }
  if (toDelete.length === 0) return { skipped: true, reason: "nothing_to_purge" };
  for (const name of toDelete) delete sequences[name];
  const out = serializeSavedVariables(parsed);
  const tmpPath = `${gripCharPath}.gse-purge.tmp`;
  const fd = openSync(tmpPath, "w");
  try {
    writeSync(fd, out);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tmpPath, gripCharPath);
  return {
    purged: toDelete.length,
    remaining: Object.keys(sequences).length,
    names: toDelete
  };
}
function resolveExpansion(toc, clientExpansion) {
  const t = tocToExpansion(toc);
  if (t && t !== "Unknown") return t;
  return clientExpansion || "Midnight";
}
const GSE_API_URL = "https://api.qik.dev";
const GSE_SVC_URL = "https://api.gse.tools";
const GSE_APPLICATION_ID = "69c5b37340521b7b01536a59";
async function resolveBatchesAsync(pendingBatches, contextItems, accountName, clientPath, token) {
  if (!Array.isArray(pendingBatches) || pendingBatches.length === 0) return;
  const POLL_INTERVAL_MS = 750;
  const POLL_TIMEOUT_MS = 6e4;
  for (const pb of pendingBatches) {
    const { batchId, contentType } = pb;
    if (!batchId || !contentType) continue;
    const inputs = (pb.items || []).map((it) => {
      const ctx = contextItems[it.originalIndex] || {};
      return {
        originalIndex: it.originalIndex,
        originKey: it.originKey,
        title: it.title,
        kind: ctx.kind,
        name: ctx.name,
        expansion: ctx.expansion,
        classKey: ctx.classKey,
        hash: ctx.hash
      };
    });
    mainWindow?.webContents.send("sync:batch-progress", {
      account: accountName,
      contentType,
      batchId,
      total: inputs.length,
      completed: 0,
      percent: 0,
      phase: "submitted"
    });
    const start = Date.now();
    let progress = null;
    while (Date.now() - start < POLL_TIMEOUT_MS) {
      try {
        const res = await fetch(`${GSE_API_URL}/batch/${batchId}`, {
          headers: { ...token ? { Authorization: `Bearer ${token}` } : {} }
        });
        if (res.ok) {
          const body = await res.json().catch(() => null);
          progress = body?.[batchId] ?? body;
          if (progress?.progress) {
            mainWindow?.webContents.send("sync:batch-progress", {
              account: accountName,
              contentType,
              batchId,
              total: progress.progress.total ?? inputs.length,
              completed: progress.progress.completed ?? 0,
              percent: progress.progress.percent ?? 0,
              phase: progress.completed ? "recovering" : "running"
            });
          }
          if (progress?.completed) break;
        }
      } catch {
      }
      await new Promise((rs) => setTimeout(rs, POLL_INTERVAL_MS));
    }
    if (!progress?.completed) {
      console.warn(`[sync.batch] poll timeout batch=${batchId} ct=${contentType}`);
      mainWindow?.webContents.send("sync:batch-progress", {
        account: accountName,
        contentType,
        batchId,
        total: inputs.length,
        completed: 0,
        percent: 0,
        phase: "timeout"
      });
      continue;
    }
    const okMap = /* @__PURE__ */ new Map();
    const titleMap = /* @__PURE__ */ new Map();
    for (const it of inputs) {
      if (it.originKey) okMap.set(it.originKey, it);
      if (it.title) titleMap.set(it.title, it);
    }
    const userSession = readSettings().userSession;
    const personaRaw = userSession?.persona ?? userSession?.session?.persona;
    const personaId = personaRaw && (personaRaw._id || personaRaw.id || personaRaw);
    if (!personaId) {
      console.warn(`[sync.batch] no persona for list 

// ============================================================================
// Region B: out/main/index.js -- access-policy orchestrator, 10-minute refresh
// constant + timer, and runAccountCleanup. These call the detect / flag / purge
// functions above; they live later in the same out/main/index.js, so they were
// outside the original contiguous slice. Added 2026-07-18 so every v0.4.12
// snippet the README quotes is present in this file.
// ============================================================================

let accessPolicyState = {
    restricted: false,
    // last-known detection result
    enforce: false,
    // last-known operator flag
    enforceCheckedAt: 0,
    // ms epoch of the last enforcement fetch
    lastSyncResult: null,
    // { changed, present, memberId } | { error } | { skipped }
    lastCleanupResult: null
    // tally from runAccountCleanup()
};
const ACCESS_POLICY_REFRESH_MS = 10 * 60 * 1e3;
let accessPolicyRefreshTimer = null;
async function runAccessPolicyCheck() {
    const settings = readSettings();
    const userSession = settings.userSession;
    const personaRaw = userSession?.persona ?? userSession?.session?.persona;
    const personaId = personaRaw && (personaRaw._id || personaRaw.id || personaRaw);
    const token = userSession?.token ?? userSession?.session?.token ?? null;
    const clients = (settings.wowPaths ?? []).flatMap((p) => getWowClients(p));
    const present = detectGripEmsAcrossClients(clients, getWtfAccounts);
    accessPolicyState.restricted = !!present;
    if (personaId && token) {
        try {
            accessPolicyState.lastSyncResult = await syncRestrictedAccountFlag({
                apiUrl: GSE_API_URL,
                token,
                personaId,
                present
            });
        } catch (err) {
            accessPolicyState.lastSyncResult = {
                error: err?.message ?? "sync_threw"
            };
        }
    } else {
        accessPolicyState.lastSyncResult = {
            skipped: "no_session"
        };
    }
    const e = await fetchAccessPolicy(GSE_SVC_URL);
    accessPolicyState.enforce = !!e.enforce;
    accessPolicyState.enforceCheckedAt = Date.now();
    if (accessPolicyState.restricted && accessPolicyState.enforce) {
        try {
            const wowRunning = await detectRunningWow();
            const anyRunning = Array.isArray(wowRunning) ? wowRunning.some((c) => c?.running) : !!wowRunning;
            if (!anyRunning) {
                accessPolicyState.lastCleanupResult = runAccountCleanup(clients);
            } else {
                accessPolicyState.lastCleanupResult = {
                    skipped: "wow_running"
                };
            }
        } catch (err) {
            accessPolicyState.lastCleanupResult = {
                error: err?.message ?? "cleanup_threw"
            };
        }
    } else {
        accessPolicyState.lastCleanupResult = {
            skipped: "not_enforced"
        };
    }
    return {
        restricted: accessPolicyState.restricted,
        enforce: accessPolicyState.enforce
    };
}

function runAccountCleanup(clients) {
    let filesScanned = 0;
    let filesPurged = 0;
    let totalRemoved = 0;
    for (const client of clients ?? []) {
        const accounts = getWtfAccounts(client.path) ?? [];
        for (const account of accounts) {
            const gseNames = readGseSequenceNamesForAccount(account.path);
            const charPaths = listGripCharSavedVarPaths([client], () => [account]);
            for (const p of charPaths) {
                filesScanned += 1;
                try {
                    const r = purgeGripCharSequences(p, gseNames);
                    if (r?.purged) {
                        filesPurged += 1;
                        totalRemoved += r.purged;
                    }
                } catch (err) {
                    console.warn("[policy] purge failed for", p, err?.message ?? err);
                }
            }
        }
    }
    return {
        filesScanned,
        filesPurged,
        totalRemoved
    };
}

function startAccessPolicyRefreshTimer() {
    if (accessPolicyRefreshTimer) return;
    accessPolicyRefreshTimer = setInterval(() => {
        runAccessPolicyCheck().catch((err) => console.warn("[policy] refresh failed:", err?.message ?? err));
    }, ACCESS_POLICY_REFRESH_MS);
    accessPolicyRefreshTimer.unref?.();
}
