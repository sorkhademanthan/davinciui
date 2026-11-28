#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALE = "en-US";
const CONTENT_TYPE = "component";
const SLUGS = [
  "curved-inline-type",
  "shake-text",
  "rolling-text",
  "media-text-hover",
  "random-text-reveal",
  "text-morph",
  "text-reveal",
  "shader-text",
  "fluid-particle-text",
  "encrypted-text",
  "glitch-liquid-text",
  "editorial-curtain-preloader",
  "pixel-preloader",
  "fill-preloader",
  "cinematic-panel-preloader",
  "glitch-shred-preloader",
  "editorial-card-arc-preloader",
  "masked-arc-preloader",
  "staircase-preloader",
  "geometric-preloader",
  "editorial-wipe-preloader",
  "wavy-flow-carousel",
  "scroll-timeline",
  "scroll-media-expand",
  "interactive-media-accordion",
  "stacked-scroll-gallery",
];

function flag(name) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : undefined;
}

function parseSlugs() {
  const only = flag("--only");
  const slugs = only
    ? only.split(",").map((slug) => slug.trim()).filter(Boolean)
    : SLUGS;
  for (const slug of slugs) {
    if (!SLUGS.includes(slug)) {
      throw new Error(`Unknown slug: ${slug}. Known: ${SLUGS.join(", ")}`);
    }
  }
  return slugs;
}

async function loadEnv() {
  const env = {};
  for (const file of [".env", "apps/web/.env.local"]) {
    try {
      const text = await fs.promises.readFile(path.join(ROOT, file), "utf8");
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#") || !line.includes("=")) continue;
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        if (key && env[key] === undefined) env[key] = value;
      }
    } catch {}
  }
  return { ...env, ...process.env };
}

const env = await loadEnv();
const SPACE_ID = env.CONTENTFUL_SPACE_ID;
const TOKEN = env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT = env.CONTENTFUL_ENVIRONMENT || "master";
const CMA = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;
const UPLOAD_BASE = `https://upload.contentful.com/spaces/${SPACE_ID}`;
const OUT_DIR = path.resolve(ROOT, flag("--out") || "tmp/previews");
const DRY_RUN = process.argv.includes("--dry-run");
const TAG = (flag("--tag") || "").trim();

if (!SPACE_ID || !TOKEN) {
  throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN are required.");
}

const authHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/vnd.contentful.management.v1+json",
});

async function api(label, url, options = {}) {
  const { method = "GET", headers, body, quiet = false } = options;
  let response;
  try {
    response = await fetch(url, { method, headers: headers ?? authHeaders(), body });
  } catch (error) {
    if (!quiet) console.error(`  x ${label} -> network error: ${error.message}`);
    return { status: 0, ok: false, json: null, text: "" };
  }
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  if (!response.ok || !quiet) {
    console.log(`  ${response.ok ? "✓" : "x"} ${label} -> HTTP ${response.status}`);
    if (!response.ok) console.error(`    ${text.slice(0, 500)}`);
  }
  return { status: response.status, ok: response.ok, json, text };
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function normalizeUrl(url) {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

const metaCache = new Map();
function registryMeta(slug) {
  if (metaCache.has(slug)) return metaCache.get(slug);
  const fallbackTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  let meta = { title: fallbackTitle, description: `${fallbackTitle} component preview.` };
  try {
    const source = fs.readFileSync(path.join(ROOT, "apps/web/registry/index.ts"), "utf8");
    const block = source.match(
      new RegExp(`(?:\"${slug}\"|${slug})\\s*:\\s*\\{[\\s\\S]*?\\n  \\},`),
    );
    if (block) {
      const title = block[0].match(/title:\s*"([^"]+)"/)?.[1];
      const description = block[0].match(/description:\s*\n?\s*"([^"]+)"/)?.[1];
      if (title && description) meta = { title, description };
    }
  } catch {}
  metaCache.set(slug, meta);
  return meta;
}

let assetCache = null;
async function allAssets() {
  if (assetCache) return assetCache;
  const items = [];
  let skip = 0;
  while (true) {
    const result = await api("GET /assets", `${CMA}/assets?limit=1000&skip=${skip}`, { quiet: true });
    if (!result.ok) throw new Error(`GET /assets failed (HTTP ${result.status}).`);
    const batch = result.json?.items ?? [];
    items.push(...batch);
    if (batch.length < 1000) break;
    skip += 1000;
  }
  assetCache = items;
  return items;
}

async function publishAsset(asset) {
  const published = await api(
    `PUT /assets/${asset.sys.id}/published`,
    `${CMA}/assets/${asset.sys.id}/published`,
    {
      method: "PUT",
      headers: { ...authHeaders(), "X-Contentful-Version": String(asset.sys.version) },
    },
  );
  if (!published.ok) throw new Error(`Publishing asset ${asset.sys.id} failed (HTTP ${published.status}).`);
  return published.json;
}

async function processAsset(asset, fileObject) {
  const processed = await api(
    `PUT /assets/${asset.sys.id}/files/${LOCALE}/process`,
    `${CMA}/assets/${asset.sys.id}/files/${LOCALE}/process`,
    {
      method: "PUT",
      headers: { ...authHeaders(), "X-Contentful-Version": String(asset.sys.version) },
      body: JSON.stringify({ fields: { file: { [LOCALE]: fileObject } } }),
    },
  );
  if (!processed.ok) throw new Error(`Processing asset ${asset.sys.id} failed (HTTP ${processed.status}).`);
  let version = processed.json?.sys?.version ?? asset.sys.version + 1;
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const polled = await api(`GET /assets/${asset.sys.id} (poll ${attempt})`, `${CMA}/assets/${asset.sys.id}`, { quiet: true });
    if (!polled.ok) {
      if (polled.status === 429 || polled.status >= 500) continue;
      throw new Error(`Polling asset ${asset.sys.id} failed (HTTP ${polled.status}).`);
    }
    version = polled.json?.sys?.version ?? version;
    if (polled.json?.fields?.file?.[LOCALE]?.url) return polled.json;
  }
  throw new Error(`Asset ${asset.sys.id} never produced a CDN URL.`);
}

async function ensureAsset(title, filePath) {
  const fileName = path.basename(filePath);
  const assets = await allAssets();
  let asset = assets.find((item) => item.fields?.title?.[LOCALE] === title);
  let reused = Boolean(asset);

  if (asset) {
    const id = asset.sys.id;
    const file = asset.fields?.file?.[LOCALE];
    if (file?.url) {
      const url = normalizeUrl(file.url);
      if (!asset.sys.publishedVersion) await publishAsset(asset);
      return { id, url, reused };
    }
    if (!file?.uploadFrom) throw new Error(`Existing asset ${id} has no usable file.`);
    asset = await processAsset(asset, file);
    const url = normalizeUrl(asset.fields.file[LOCALE].url);
    if (!asset.sys.publishedVersion) await publishAsset(asset);
    return { id, url, reused };
  }

  const data = fs.readFileSync(filePath);
  const uploadResponse = await fetch(`${UPLOAD_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(data.length),
    },
    body: data,
  });
  const uploadText = await uploadResponse.text();
  console.log(`  ${uploadResponse.ok ? "✓" : "x"} POST /uploads (${fileName}) -> HTTP ${uploadResponse.status}`);
  if (!uploadResponse.ok) throw new Error(`Uploading ${fileName} failed: ${uploadText.slice(0, 500)}`);
  const uploadId = JSON.parse(uploadText).sys.id;
  const fileObject = {
    contentType: "video/mp4",
    fileName,
    uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } },
  };

  const created = await api(`POST /assets (${fileName})`, `${CMA}/assets`, {
    method: "POST",
    body: JSON.stringify({
      fields: {
        title: { [LOCALE]: title },
        file: { [LOCALE]: fileObject },
      },
    }),
  });
  if (!created.ok) throw new Error(`Creating asset ${fileName} failed (HTTP ${created.status}).`);
  asset = await processAsset(created.json, fileObject);
  const id = asset.sys.id;
  const url = normalizeUrl(asset.fields.file[LOCALE].url);
  asset = await publishAsset(asset);
  if (assetCache) assetCache.push(asset);
  return { id, url, reused };
}

async function findEntry(slug) {
  const params = new URLSearchParams({
    content_type: CONTENT_TYPE,
    "fields.slug": slug,
    limit: "10",
  });
  const result = await api(`GET /entries?slug=${slug}`, `${CMA}/entries?${params}`, { quiet: true });
  if (!result.ok) throw new Error(`Entry lookup failed for ${slug} (HTTP ${result.status}).`);
  return (result.json?.items ?? []).find((item) => item.fields?.slug?.[LOCALE] === slug) ?? null;
}

async function upsertEntry(slug, meta, assetIds) {
  const incoming = {
    title: { [LOCALE]: meta.title },
    slug: { [LOCALE]: slug },
    description: { [LOCALE]: meta.description },
    previewLight: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: assetIds.light } } },
    previewDark: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: assetIds.dark } } },
  };
  const existing = await findEntry(slug);
  const fields = { ...(existing?.fields ?? {}), ...incoming };
  let entry;
  if (existing) {
    const updated = await api(`PUT /entries/${existing.sys.id}`, `${CMA}/entries/${existing.sys.id}`, {
      method: "PUT",
      headers: { ...authHeaders(), "X-Contentful-Version": String(existing.sys.version) },
      body: JSON.stringify({ fields }),
    });
    if (!updated.ok) throw new Error(`Updating entry ${existing.sys.id} failed (HTTP ${updated.status}).`);
    entry = updated.json;
  } else {
    const created = await api("POST /entries", `${CMA}/entries`, {
      method: "POST",
      headers: { ...authHeaders(), "X-Contentful-Content-Type": CONTENT_TYPE },
      body: JSON.stringify({ fields }),
    });
    if (!created.ok) throw new Error(`Creating entry for ${slug} failed (HTTP ${created.status}).`);
    entry = created.json;
  }
  const published = await api(`PUT /entries/${entry.sys.id}/published`, `${CMA}/entries/${entry.sys.id}/published`, {
    method: "PUT",
    headers: { ...authHeaders(), "X-Contentful-Version": String(entry.sys.version) },
  });
  if (!published.ok) throw new Error(`Publishing entry ${entry.sys.id} failed (HTTP ${published.status}).`);
  return entry.sys.id;
}

function probe(file) {
  const output = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate",
      "-show_entries", "format=duration",
      "-of", "json",
      file,
    ],
    { encoding: "utf8" },
  );
  return JSON.parse(output);
}

async function verifyVideo(label, localFile, url) {
  const head = await fetch(url, { method: "HEAD" });
  const contentType = head.headers.get("content-type") || "";
  if (!head.ok || !contentType.includes("video/mp4")) {
    throw new Error(`${label} HEAD failed: HTTP ${head.status}, content-type ${contentType || "missing"}`);
  }
  console.log(`  ✓ ${label} HEAD -> HTTP ${head.status} (${contentType})`);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label} download failed: HTTP ${response.status}`);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "davinciui-contentful-verify-"));
  const downloaded = path.join(tempDir, path.basename(localFile));
  fs.writeFileSync(downloaded, Buffer.from(await response.arrayBuffer()));
  const localHash = sha256(localFile);
  const remoteHash = sha256(downloaded);
  if (localHash !== remoteHash) throw new Error(`${label} hash mismatch: local ${localHash} / CDN ${remoteHash}`);
  const info = probe(downloaded);
  const stream = info.streams.find((entry) => entry.codec_type === "video");
  const duration = Number.parseFloat(info.format.duration);
  const issues = [];
  if (stream?.codec_name !== "h264") issues.push("not h264");
  if (stream?.pix_fmt !== "yuv420p") issues.push("not yuv420p");
  if (stream?.width !== 1280 || stream?.height !== 720) issues.push("wrong resolution");
  if (stream?.r_frame_rate !== "30/1") issues.push("wrong fps");
  if (duration < 4.8 || duration > 5.2) issues.push("wrong duration");
  if (issues.length) throw new Error(`${label} ffprobe failed: ${issues.join(", ")}`);
  console.log(`  ✓ ${label} hash ${localHash.slice(0, 12)}... | ${duration.toFixed(2)}s 1280x720 30fps h264`);
}

async function main() {
  const slugs = parseSlugs();
  console.log("Contentful preview upload");
  console.log(`space: ${SPACE_ID}  environment: ${ENVIRONMENT}  output: ${OUT_DIR}`);
  console.log(`mode: ${DRY_RUN ? "dry-run" : "upload"}  tag: ${TAG || "none"}`);

  const spaceCheck = await api("GET /spaces/{id} (CMA token check)", `https://api.contentful.com/spaces/${SPACE_ID}`);
  if (!spaceCheck.ok) throw new Error(`CMA token check failed (HTTP ${spaceCheck.status}).`);
  const typeCheck = await api(`GET /content_types/${CONTENT_TYPE}`, `${CMA}/content_types/${CONTENT_TYPE}`);
  if (!typeCheck.ok) throw new Error(`Content type ${CONTENT_TYPE} check failed (HTTP ${typeCheck.status}).`);

  const results = [];
  for (const slug of slugs) {
    const meta = registryMeta(slug);
    console.log(`\n=== ${slug} ===`);
    const assetIds = {};
    const urls = {};
    for (const theme of ["light", "dark"]) {
      const file = path.join(OUT_DIR, slug, `${slug}-${theme}.mp4`);
      if (!fs.existsSync(file)) throw new Error(`Missing local video: ${file}`);
      const title = `${meta.title} (${theme})${TAG ? ` ${TAG}` : ""}`;
      if (DRY_RUN) {
        console.log(`  [dry-run] ensure asset "${title}" from ${file}`);
        assetIds[theme] = `dry-run-${theme}`;
        urls[theme] = `https://dry-run.invalid/${slug}-${theme}.mp4`;
      } else {
        const asset = await ensureAsset(title, file);
        assetIds[theme] = asset.id;
        urls[theme] = asset.url;
        console.log(`  ${asset.reused ? "reused" : "created"} asset ${asset.id}: ${asset.url}`);
      }
    }
    if (DRY_RUN) {
      console.log(`  [dry-run] upsert + publish entry for ${slug}`);
    } else {
      const entryId = await upsertEntry(slug, meta, assetIds);
      console.log(`  entry ${entryId} published`);
      results.push({ slug, entryId, urls });
    }
  }

  if (DRY_RUN) {
    console.log("\nDry run complete. No Contentful changes made.");
    return;
  }

  console.log("\n=== Verification ===");
  for (const result of results) {
    console.log(`\n${result.slug}`);
    for (const theme of ["light", "dark"]) {
      const localFile = path.join(OUT_DIR, result.slug, `${result.slug}-${theme}.mp4`);
      await verifyVideo(`${result.slug} ${theme}`, localFile, result.urls[theme]);
    }
  }

  console.log("\n=== scripts/check-contentful.mjs ===");
  const check = spawnSync(process.execPath, [path.join(ROOT, "scripts/check-contentful.mjs")], {
    stdio: "inherit",
    cwd: ROOT,
  });
  process.exitCode = check.status ?? 0;
}

main().catch((error) => {
  console.error(`\nAborted: ${error.message}`);
  process.exitCode = 1;
});
