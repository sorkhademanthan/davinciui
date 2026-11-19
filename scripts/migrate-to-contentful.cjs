#!/usr/bin/env node
/**
 * Upload MP4 preview assets to Contentful and create + publish `component`
 * entries that link them.
 *
 *   node scripts/migrate-to-contentful.cjs [slug ...] [--source <dir>]
 *
 * Slugs default to the original pilot set when no arguments are given.
 * --source overrides the local MP4 root (defaults to public/preview-videos/home).
 *
 * Flow (all steps report real HTTP status; tokens are never printed):
 *   1. Verify the CMA token against the space and that content type
 *      `component` exists.
 *   2. Delete ONLY empty "Untitled" draft assets with no file (debris left
 *      by earlier failed runs of this script).
 *   3. For each slug, for each theme (light/dark):
 *        a. POST raw MP4 bytes to upload.contentful.com/spaces/<id>/uploads
 *        b. POST the asset with fields.title and
 *           fields.file["en-US"] = { contentType, fileName, uploadFrom }
 *        c. PUT  .../assets/<assetId>/files/en-US/process
 *        d. poll .../assets/<assetId> until fields.file["en-US"].url exists
 *        e. PUT  .../assets/<assetId>/published
 *   4. Create (or update) one entry per slug — every field wrapped in the
 *      "en-US" locale, header X-Contentful-Content-Type: component — then
 *      publish it.
 *   5. Run scripts/check-contentful.mjs.
 *
 * `description` is included because the content type marks it required:
 * publishing fails with 422 without it.
 */

require("dotenv").config({
  path: require("path").resolve(__dirname, "../apps/web/.env.local"),
});

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CMA = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;
const UPLOAD_BASE = `https://upload.contentful.com/spaces/${SPACE_ID}`;
const LOCALE = "en-US";
const CONTENT_TYPE = "component";
function optionValue(name) {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : undefined;
}

const SOURCE_ARG = optionValue("--source");
const VIDEO_DIR = SOURCE_ARG
  ? path.resolve(ROOT, SOURCE_ARG)
  : path.join(ROOT, "apps/web/public/preview-videos/home");
const CLI_SLUGS = process.argv
  .slice(2)
  .filter(
    (arg) =>
      !arg.startsWith("--") && arg !== SOURCE_ARG && !arg.startsWith("--source="),
  );
const TARGET_SLUGS = CLI_SLUGS.length
  ? CLI_SLUGS
  : ["sunlight-effect", "hover-cards"];

if (!SPACE_ID || !TOKEN) {
  console.error(
    "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN are required (apps/web/.env.local).",
  );
  process.exit(1);
}

/* ----------------------------- HTTP helpers ------------------------------ */

const authHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/vnd.contentful.management.v1+json",
});

async function call(label, url, { method = "GET", headers, body, quiet = false } = {}) {
  let res;
  try {
    res = await fetch(url, { method, headers: headers ?? authHeaders(), body });
  } catch (err) {
    console.error(`  ✗ ${label} -> network error: ${err.message}`);
    return { status: 0, ok: false, json: null, text: "" };
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok || !quiet) {
    const mark = res.ok ? "✓" : "✗";
    console.log(`  ${mark} ${label} -> HTTP ${res.status}`);
    if (!res.ok) console.error(`    Response body: ${text}`);
  }
  return { status: res.status, ok: res.ok, json, text };
}

function die(label, result) {
  console.error(`\nAborted at: ${label} (HTTP ${result.status}).`);
  process.exit(1);
}

/* --------------------------- registry metadata --------------------------- */

function registryMeta(slug) {
  const fallbackTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  try {
    const src = fs.readFileSync(path.join(ROOT, "apps/web/registry/index.ts"), "utf8");
    const block = src.match(
      new RegExp(`(?:"${slug}"|${slug})\\s*:\\s*\\{[\\s\\S]*?\\n  \\},`),
    );
    if (block) {
      const title = block[0].match(/title:\s*"([^"]+)"/)?.[1];
      const description = block[0].match(/description:\s*\n?\s*"([^"]+)"/)?.[1];
      if (title && description) return { title, description };
    }
  } catch {
    // fall through to derived values
  }
  return {
    title: fallbackTitle,
    description: `${fallbackTitle} component preview.`,
  };
}

/* ------------------------------- assets ---------------------------------- */

function findMP4(slug, theme) {
  const dir = path.join(VIDEO_DIR, slug);
  if (!fs.existsSync(dir)) return null;
  const preferred = path.join(dir, `${slug}-${theme}.mp4`);
  if (fs.existsSync(preferred)) return preferred;
  const match = fs
    .readdirSync(dir)
    .find((f) => f.toLowerCase().endsWith(".mp4") && f.toLowerCase().includes(`-${theme}`));
  return match ? path.join(dir, match) : null;
}

async function deleteEmptyUntitledDrafts() {
  console.log("\n— Cleaning up empty 'Untitled' draft assets —");
  const list = await call("GET /assets", `${CMA}/assets?limit=1000`, { quiet: true });
  if (!list.ok) die("GET /assets", list);
  const items = list.json?.items ?? [];
  let deleted = 0;
  for (const item of items) {
    const fields = item.fields ?? {};
    const file = fields.file?.[LOCALE];
    const title = fields.title?.[LOCALE];
    const hasFile = Boolean(file && (file.url || file.uploadFrom || file.fileName));
    const isUntitled = !title || title === "Untitled";
    const isDraft = !item.sys.publishedAt;
    if (isDraft && !hasFile && isUntitled) {
      const del = await call(`DELETE /assets/${item.sys.id}`, `${CMA}/assets/${item.sys.id}`, {
        method: "DELETE",
        headers: { ...authHeaders(), "X-Contentful-Version": String(item.sys.version) },
      });
      if (del.ok) deleted += 1;
    }
  }
  console.log(`  empty 'Untitled' draft assets deleted: ${deleted}`);
}

async function uploadMP4(filePath, assetTitle) {
  const fileName = path.basename(filePath);
  const data = fs.readFileSync(filePath);

  const upRes = await fetch(`${UPLOAD_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(data.length),
    },
    body: data,
  });
  const upText = await upRes.text();
  if (!upRes.ok) {
    console.error(`  ✗ POST /uploads (${fileName}) -> HTTP ${upRes.status}`);
    console.error(`    Response body: ${upText}`);
    return null;
  }
  console.log(`  ✓ POST /uploads (${fileName}) -> HTTP ${upRes.status}`);
  let uploadId;
  try {
    uploadId = JSON.parse(upText).sys.id;
  } catch {
    console.error(`    Unexpected upload response: ${upText}`);
    return null;
  }

  const fileObject = {
    contentType: "video/mp4",
    fileName,
    uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } },
  };

  const created = await call(`POST /assets (${fileName})`, `${CMA}/assets`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      fields: {
        title: { [LOCALE]: assetTitle },
        file: { [LOCALE]: fileObject },
      },
    }),
  });
  if (!created.ok) return null;
  const assetId = created.json.sys.id;
  let version = created.json.sys.version;

  const processed = await call(`PUT /assets/${assetId}/files/${LOCALE}/process`, `${CMA}/assets/${assetId}/files/${LOCALE}/process`, {
    method: "PUT",
    headers: { ...authHeaders(), "X-Contentful-Version": String(version) },
    body: JSON.stringify({ fields: { file: { [LOCALE]: fileObject } } }),
  });
  if (!processed.ok) return null;
  version = processed.json?.sys?.version ?? version + 1;

  // Poll until Contentful has processed the file and a CDN URL exists.
  let asset = null;
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    await new Promise((r) => setTimeout(r, 1000));
    const polled = await call(`GET /assets/${assetId} (poll ${attempt})`, `${CMA}/assets/${assetId}`, {
      quiet: true,
    });
    if (!polled.ok) {
      if (polled.status === 429 || polled.status >= 500) continue;
      die(`GET /assets/${assetId} (poll)`, polled);
    }
    const url = polled.json?.fields?.file?.[LOCALE]?.url;
    if (url) {
      asset = polled.json;
      console.log(`  ✓ asset processed -> HTTP ${polled.status} (url present)`);
      break;
    }
    version = polled.json?.sys?.version ?? version;
  }
  if (!asset) {
    console.error(`  ✗ asset ${assetId} never produced fields.file["${LOCALE}"].url`);
    return null;
  }
  version = asset.sys.version;

  const published = await call(`PUT /assets/${assetId}/published`, `${CMA}/assets/${assetId}/published`, {
    method: "PUT",
    headers: { ...authHeaders(), "X-Contentful-Version": String(version) },
  });
  if (!published.ok) return null;
  return { assetId, url: asset.fields.file[LOCALE].url };
}

/* ------------------------------- entries --------------------------------- */

async function findEntryBySlug(slug) {
  const res = await call(
    `GET /entries?fields.slug=${slug}`,
    `${CMA}/entries?content_type=${CONTENT_TYPE}&fields.slug=${slug}&limit=10`,
    { quiet: true },
  );
  if (!res.ok) die("GET /entries (slug lookup)", res);
  return (res.json?.items ?? []).find((i) => i.fields?.slug?.[LOCALE] === slug) ?? null;
}

async function upsertEntry(slug, meta, previewLightId, previewDarkId) {
  const fields = {
    title: { [LOCALE]: meta.title },
    slug: { [LOCALE]: slug },
    description: { [LOCALE]: meta.description },
    previewLight: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: previewLightId } } },
    previewDark: { [LOCALE]: { sys: { type: "Link", linkType: "Asset", id: previewDarkId } } },
  };

  const existing = await findEntryBySlug(slug);
  let entryId;
  let version;

  if (existing) {
    entryId = existing.sys.id;
    version = existing.sys.version;
    const updated = await call(`PUT /entries/${entryId}`, `${CMA}/entries/${entryId}`, {
      method: "PUT",
      headers: { ...authHeaders(), "X-Contentful-Version": String(version) },
      body: JSON.stringify({ fields }),
    });
    if (!updated.ok) return null;
    version = updated.json.sys.version;
  } else {
    const created = await call("POST /entries", `${CMA}/entries`, {
      method: "POST",
      headers: { ...authHeaders(), "X-Contentful-Content-Type": CONTENT_TYPE },
      body: JSON.stringify({ fields }),
    });
    if (!created.ok) return null;
    entryId = created.json.sys.id;
    version = created.json.sys.version;
  }

  const published = await call(`PUT /entries/${entryId}/published`, `${CMA}/entries/${entryId}/published`, {
    method: "PUT",
    headers: { ...authHeaders(), "X-Contentful-Version": String(version) },
  });
  if (!published.ok) return null;
  return entryId;
}

/* -------------------------------- main ----------------------------------- */

(async () => {
  console.log("Contentful migration — component preview media");
  console.log(`space: ${SPACE_ID}  environment: ${ENVIRONMENT}`);

  const spaceCheck = await call("GET /spaces/{id} (CMA token check)", `https://api.contentful.com/spaces/${SPACE_ID}`);
  if (!spaceCheck.ok) die("CMA token check", spaceCheck);

  const ct = await call(`GET /content_types/${CONTENT_TYPE}`, `${CMA}/content_types/${CONTENT_TYPE}`);
  if (!ct.ok) die(`content type '${CONTENT_TYPE}'`, ct);
  console.log(`  content type '${CONTENT_TYPE}' present (version ${ct.json.sys.version})`);

  await deleteEmptyUntitledDrafts();

  const results = [];
  for (const slug of TARGET_SLUGS) {
    console.log(`\n=== ${slug} ===`);
    const meta = registryMeta(slug);
    const assetIds = {};
    const urls = {};

    for (const theme of ["light", "dark"]) {
      console.log(` — theme: ${theme} —`);
      const mp4 = findMP4(slug, theme);
      if (!mp4) {
        console.error(`  ✗ no ${theme} MP4 found for ${slug}`);
        process.exit(1);
      }
      const uploaded = await uploadMP4(mp4, `${meta.title} (${theme})`);
      if (!uploaded) process.exit(1);
      assetIds[theme] = uploaded.assetId;
      urls[theme] = uploaded.url;
    }

    const entryId = await upsertEntry(slug, meta, assetIds.light, assetIds.dark);
    if (!entryId) process.exit(1);
    results.push({ slug, entryId, ...urls });
  }

  console.log("\n=== Summary ===");
  for (const r of results) {
    console.log(`  ${r.slug}: entry ${r.entryId}`);
    console.log(`    light: ${r.light}`);
    console.log(`    dark:  ${r.dark}`);
  }

  console.log("\n=== scripts/check-contentful.mjs ===");
  const check = spawnSync(process.execPath, [path.join(ROOT, "scripts/check-contentful.mjs")], {
    stdio: "inherit",
    cwd: ROOT,
  });
  process.exit(check.status ?? 0);
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
