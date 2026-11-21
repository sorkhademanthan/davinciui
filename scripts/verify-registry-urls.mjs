#!/usr/bin/env node
// Verifies that the live DavinciUI registry resolves the way the shadcn CLI
// (and therefore the shadcn registry directory / Shoogle) expects.
//
// Usage:
//   node scripts/verify-registry-urls.mjs
//   node scripts/verify-registry-urls.mjs https://davinciui.com/r
//   BASE_URL=http://localhost:3000/r node scripts/verify-registry-urls.mjs

const BASE_URL = (process.argv[2] || process.env.BASE_URL || "https://davinciui.com/r").replace(/\/$/, "");
const CONCURRENCY = 8;

const VALID_TYPES = new Set([
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:base",
  "registry:item",
]);

const problems = [];

function problem(scope, message) {
  problems.push(`${scope}: ${message}`);
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "davinciui-registry-verify" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return JSON.parse(text);
}

async function checkItem(name) {
  const url = `${BASE_URL}/${name}.json`;
  let item;
  try {
    item = await fetchJson(url);
  } catch (error) {
    problem(name, `${url} failed (${error.message})`);
    return;
  }

  if (item.name !== name) problem(name, `item name is "${item.name}", expected "${name}"`);
  if (!VALID_TYPES.has(item.type)) problem(name, `invalid item type "${item.type}"`);
  if (!Array.isArray(item.files) || item.files.length === 0) {
    problem(name, "files[] is missing or empty");
    return;
  }

  for (const [i, file] of item.files.entries()) {
    if (!file.path) problem(name, `files[${i}].path is missing`);
    if (!VALID_TYPES.has(file.type)) problem(name, `files[${i}].type "${file.type}" is invalid`);
    if (typeof file.content !== "string" || file.content.trim() === "") {
      problem(name, `files[${i}].content is missing (install would fail)`);
    }
  }
}

async function main() {
  console.log(`Verifying registry at ${BASE_URL}\n`);

  let index;
  try {
    index = await fetchJson(`${BASE_URL}/registry.json`);
  } catch (error) {
    console.error(`FATAL: registry.json failed (${error.message})`);
    process.exit(1);
  }

  if (typeof index.name !== "string" || !index.name) problem("registry.json", "missing name");
  if (typeof index.homepage !== "string" || !index.homepage) problem("registry.json", "missing homepage");
  if (!Array.isArray(index.items) || index.items.length === 0) {
    console.error("FATAL: registry.json has no items");
    process.exit(1);
  }

  const names = index.items.map((item) => item.name);
  if (new Set(names).size !== names.length) problem("registry.json", "duplicate item names");

  for (const item of index.items) {
    if (!item.name) problem("registry.json", "item without name");
    if (!VALID_TYPES.has(item.type)) problem(item.name, `invalid index type "${item.type}"`);
    if (Array.isArray(item.files) && item.files.some((file) => "content" in file)) {
      problem(item.name, "index item files include content (directory forbids it)");
    }
  }

  console.log(`Index: ${index.items.length} items, name="${index.name}", homepage="${index.homepage}"`);
  console.log(`Fetching ${names.length} item URLs...\n`);

  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < names.length) {
      const name = names[cursor++];
      await checkItem(name);
    }
  });
  await Promise.all(workers);

  if (problems.length > 0) {
    console.error(`FAILED: ${problems.length} problem(s)\n`);
    for (const message of problems.slice(0, 50)) console.error(` - ${message}`);
    if (problems.length > 50) console.error(` ...and ${problems.length - 50} more`);
    process.exit(1);
  }

  console.log(`PASS: ${names.length}/${names.length} item URLs resolve with valid registry-item content.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
