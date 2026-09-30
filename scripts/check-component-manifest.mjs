// Drift check for the Step 10A component manifest.
// Verifies that apps/web/lib/design-system/component-manifest.ts stays in
// sync with its sources of truth without importing them (the manifest must
// stay dependency-light for the focused test runner):
//   - documented catalog  = docsImportMap keys in components/docs/lazy-registry.ts
//   - registry metadata   = record keys in registry/index.ts
//   - live card previews  = slug literals in ComponentCardLivePreviewProps
// Usage: node scripts/check-component-manifest.mjs
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const web = join(root, "apps", "web");

const read = (rel) => readFileSync(join(web, rel), "utf8");

const lazy = read("components/docs/lazy-registry.ts");
const registry = read("registry/index.ts");
const cardFile = read("components/component-card-live-preview.tsx");
const manifest = read("lib/design-system/component-manifest.ts");

const docsSlugs = new Set(
  [...lazy.matchAll(/^(?:  "([^"]+)"|  ([a-z0-9-]+)): \(\)/gm)].map((m) => m[1] ?? m[2]),
);
// Registry record keys, including single-line entries.
const registryKeys = new Set(
  [...registry.matchAll(/^(?:  "([^"]+)"|  ([a-z0-9-]+)):\s*\{/gm)].map((m) => m[1] ?? m[2]),
);
const unionBlock = cardFile.slice(
  cardFile.indexOf("slug:"),
  cardFile.indexOf("export function ComponentCardLivePreview"),
);
const cardUnion = new Set([...unionBlock.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
// Exclude the BasicPreviewSlug type reference (not a literal).
cardUnion.delete("BasicPreviewSlug");

const docsOnly = [...manifest.matchAll(/const DOCS_ONLY_SLUGS[^=]*=\s*\[([^\]]*)\]/gs)][0]?.[1] ?? "";
const manifestDocsOnly = new Set([...docsOnly.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
const cardLive = [...manifest.matchAll(/const CARD_LIVE_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const;/gs)][0]?.[1] ?? "";
const manifestCardLive = new Set([...cardLive.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`${ok ? "ok  " : "FAIL"}  ${message}`);
};

check(docsSlugs.size >= 129, `documented catalog has ${docsSlugs.size} slugs`);
for (const slug of docsSlugs) {
  check(
    registryKeys.has(slug) || manifestDocsOnly.has(slug),
    `catalog slug covered: ${slug}`,
  );
}
for (const slug of manifestDocsOnly) {
  check(docsSlugs.has(slug), `DOCS_ONLY entry is a real catalog slug: ${slug}`);
  check(!registryKeys.has(slug), `DOCS_ONLY entry still lacks registry metadata: ${slug}`);
}
for (const key of registryKeys) {
  check(docsSlugs.has(key), `registry entry is documented: ${key}`);
}
for (const slug of manifestCardLive) {
  check(cardUnion.has(slug), `CARD_LIVE slug has a real card preview: ${slug}`);
}
console.log(failures.length === 0 ? "\nmanifest in sync" : `\n${failures.length} drift(s) found`);
process.exit(failures.length === 0 ? 0 : 1);
