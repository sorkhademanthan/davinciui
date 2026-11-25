#!/usr/bin/env node
/**
 * Verification for the Contentful integration.
 *
 *   node scripts/check-contentful.mjs
 *
 * Checks, without ever printing secret values:
 *   1. Which CONTENTFUL_* env vars are set (in apps/web/.env.local or the environment).
 *   2. Whether published `component` entries fetch successfully.
 *   3. For each entry: slug, title, and whether previewLight/previewDark
 *      exist and are published (a Link-typed asset field means the asset
 *      itself is missing or unpublished).
 *
 * Exit codes: 0 = ok (or not configured), 1 = 401 (bad token),
 *             2 = 404 (wrong space/environment), 3 = network/other failure.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFiles() {
  const env = {};
  return (async () => {
    for (const candidate of [
      path.join(ROOT, ".env"),
      path.join(ROOT, "apps/web/.env.local"),
    ]) {
      try {
        const text = await readFile(candidate, "utf8");
        for (const raw of text.split("\n")) {
          const line = raw.trim();
          if (!line || line.startsWith("#") || !line.includes("=")) continue;
          const eq = line.indexOf("=");
          const key = line.slice(0, eq).trim();
          const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
          if (key && env[key] === undefined) env[key] = value;
        }
      } catch {
        // file absent — fine
      }
    }
    return { ...env, ...process.env };
  })();
}

const REQUIRED = [
  "CONTENTFUL_SPACE_ID",
  "CONTENTFUL_ENVIRONMENT",
  "CONTENTFUL_ACCESS_TOKEN",
];
const OPTIONAL = [
  "CONTENTFUL_PREVIEW_ACCESS_TOKEN",
  "CONTENTFUL_PREVIEW_SECRET",
  "CONTENTFUL_MANAGEMENT_TOKEN",
];

function assetStatus(fieldLink, assetsById) {
  if (!fieldLink) return "missing";
  if (fieldLink.sys?.type !== "Link" || fieldLink.sys.linkType !== "Asset") {
    return "field is not an asset link";
  }
  // Delivery API keeps asset links in entry fields and puts the resolved
  // assets in includes.Asset; an absent include means unpublished or missing.
  const asset = assetsById.get(fieldLink.sys.id);
  if (!asset) return "linked asset NOT published or missing";
  const url = asset.fields?.file?.url;
  return typeof url === "string" ? "published" : "linked asset has no file";
}

const env = await loadEnvFiles();

console.log("Environment variables:");
for (const key of REQUIRED) {
  console.log(`  ${env[key] ? "set   " : "MISSING"}  ${key}`);
}
for (const key of OPTIONAL) {
  console.log(`  ${env[key] ? "set   " : "unset "}  ${key} (optional)`);
}

const space = env.CONTENTFUL_SPACE_ID;
const accessToken = env.CONTENTFUL_ACCESS_TOKEN;
const environment = env.CONTENTFUL_ENVIRONMENT || "master";

if (!space || !accessToken) {
  console.error("\nDelivery credentials missing — publish nothing and the app falls back to local media.");
  process.exit(1);
}

const params = new URLSearchParams({
  content_type: "component",
  include: "2",
  limit: "500",
  order: "fields.order",
});
const url = `https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries?${params}`;

let response;
try {
  response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
} catch (error) {
  console.error(`\nNetwork error contacting Contentful: ${error.message}`);
  process.exit(3);
}

if (response.status === 401) {
  console.error("\n401 Unauthorized — CONTENTFUL_ACCESS_TOKEN is invalid for this space/environment.");
  process.exit(1);
}
if (response.status === 404) {
  console.error("\n404 Not Found — wrong CONTENTFUL_SPACE_ID or CONTENTFUL_ENVIRONMENT.");
  process.exit(2);
}
if (!response.ok) {
  console.error(`\nContentful API error: ${response.status} ${response.statusText}`);
  process.exit(3);
}

const body = await response.json();
const items = body?.items ?? [];
const assetsById = new Map((body?.includes?.Asset ?? []).map((a) => [a.sys.id, a]));
console.log(`\nPublished component entries: ${items.length}\n`);

if (items.length === 0) {
  console.log("No entries yet. Create + PUBLISH entries (and their assets) in Contentful — the app falls back to local media meanwhile.");
  process.exit(0);
}

for (const item of items) {
  const f = item.fields ?? {};
  const light = assetStatus(f.previewLight, assetsById);
  const dark = assetStatus(f.previewDark, assetsById);
  console.log(`• ${f.title ?? "(untitled)"}  [${f.slug ?? "no slug"}]`);
  console.log(`    category=${f.category ?? "—"}  featured=${f.featured === true}  order=${f.order ?? "—"}`);
  console.log(`    previewLight: ${light}   previewDark: ${dark}\n`);
}

process.exit(0);
