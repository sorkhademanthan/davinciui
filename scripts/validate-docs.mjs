#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = path.join(root, "apps/web/components/docs");
const registryFile = path.join(root, "apps/web/registry/index.ts");
const contentDir = path.join(root, "apps/web/lib/docs-content");
const componentsDir = path.join(root, "packages/ui/src/components");

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function objectKeys(source) {
  return [...source.matchAll(/^ {2}(?:"([^"]+)"|([\w-]+)): \{/gm)].map(
    (match) => match[1] ?? match[2],
  );
}

function mapKeys(source) {
  return [...source.matchAll(/^ {2}(?:"([^"]+)"|([\w-]+)):/gm)].map(
    (match) => match[1] ?? match[2],
  );
}

function pascal(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function exportedNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
    for (const raw of match[1].split(",")) {
      const name = raw
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.add(name);
    }
  }
  for (const match of source.matchAll(
    /export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z0-9_]+)/g,
  )) {
    names.add(match[1]);
  }
  return names;
}

function entriesWithBody(source) {
  const entries = [];
  const re = /^ {2}(?:"([^"]+)"|([\w-]+)): \{([\s\S]*?)^ {2}\},/gm;
  for (const match of source.matchAll(re)) {
    entries.push({ slug: match[1] ?? match[2], body: match[3] });
  }
  return entries;
}

const docsSlugs = fs
  .readdirSync(docsDir)
  .filter((file) => file.endsWith(".tsx") && file !== "index.tsx")
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort();

const hiddenSource = read(
  path.join(root, "apps/web/lib/hidden-components.ts"),
);
const hiddenSlugs = new Set(
  [...hiddenSource.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
);
const visibleDocsSlugs = docsSlugs.filter((slug) => !hiddenSlugs.has(slug));

const registrySlugs = objectKeys(read(registryFile)).sort();

const categoriesSource = read(path.join(contentDir, "categories.ts"));
const categorySlugs = mapKeys(categoriesSource).sort();
const visibleCategorySlugs = categorySlugs.filter(
  (slug) => !hiddenSlugs.has(slug),
);

const accessibilitySource = read(
  path.join(contentDir, "sections/accessibility.ts"),
);
const motionSource = read(path.join(contentDir, "sections/motion.ts"));
const compositionSource = read(
  path.join(contentDir, "sections/composition.ts"),
);
const customizationSource = read(
  path.join(contentDir, "sections/customization.ts"),
);
const constraintsSource = read(
  path.join(contentDir, "sections/constraints.ts"),
);
const relatedSource = read(path.join(contentDir, "sections/related.ts"));

const accessibilityKeys = mapKeys(accessibilitySource);
const motionKeys = mapKeys(motionSource);

for (const [label, slugs, expected] of [
  ["docs pages", docsSlugs, docsSlugs.length],
  ["registry entries", registrySlugs, docsSlugs.length],
  ["category map", visibleCategorySlugs, visibleDocsSlugs.length],
]) {
  if (slugs.length !== expected) {
    fail(`${label}: expected ${expected} slugs, found ${slugs.length}.`);
  }
}

for (const slug of visibleDocsSlugs) {
  if (!visibleCategorySlugs.includes(slug))
    fail(`Category map is missing "${slug}".`);
  if (!registrySlugs.includes(slug)) fail(`Registry is missing "${slug}".`);
}

for (const slug of [...new Set([...accessibilityKeys, ...motionKeys])]) {
  if (!docsSlugs.includes(slug)) {
    fail(`Content module references unknown page "${slug}".`);
  }
}

for (const slug of visibleDocsSlugs) {
  if (!accessibilityKeys.includes(slug)) {
    fail(`Missing accessibility note for "${slug}".`);
  }
  if (!motionKeys.includes(slug)) {
    fail(`Missing motion note for "${slug}".`);
  }
}

for (const file of fs.readdirSync(docsDir)) {
  if (!file.endsWith(".tsx")) continue;
  const source = read(path.join(docsDir, file));
  if (/\b(accessibilityNote|motionNote)\s*=/.test(source)) {
    fail(`${file} still passes a legacy accessibilityNote/motionNote prop.`);
  }
}

const compositionEntries = entriesWithBody(compositionSource);
for (const { slug, body } of compositionEntries) {
  if (!docsSlugs.includes(slug)) {
    fail(`Composition entry "${slug}" does not have a docs page.`);
    continue;
  }

  const sourceFile = path.join(componentsDir, `${slug}.tsx`);
  if (!fs.existsSync(sourceFile)) {
    fail(`Composition entry "${slug}" has no source file.`);
    continue;
  }

  const tree = body.match(/tree:\s*`([\s\S]*?)`/)?.[1];
  if (!tree) {
    fail(`Composition entry "${slug}" has no tree.`);
    continue;
  }

  const exports = exportedNames(read(sourceFile));
  const prefix = pascal(slug);
  const tokens = new Set(tree.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []);
  for (const token of tokens) {
    if (!token.startsWith(prefix)) continue;
    if (!exports.has(token)) {
      fail(
        `Composition "${slug}" uses <${token} />, which is not exported by ${slug}.tsx.`,
      );
    }
  }
}

const customizationEntries = entriesWithBody(customizationSource);
for (const { slug, body } of customizationEntries) {
  if (!docsSlugs.includes(slug)) {
    fail(`Customization entry "${slug}" does not have a docs page.`);
    continue;
  }

  const sourceFile = path.join(componentsDir, `${slug}.tsx`);
  if (!fs.existsSync(sourceFile)) {
    fail(`Customization entry "${slug}" has no source file.`);
    continue;
  }

  const source = read(sourceFile);
  for (const match of body.matchAll(/\[data-slot="([^"]+)"\]/g)) {
    if (!source.includes(`data-slot="${match[1]}"`)) {
      fail(
        `Customization "${slug}" documents data-slot "${match[1]}", which the source does not render.`,
      );
    }
  }
}

const constraintEntries = entriesWithBody(constraintsSource);
for (const { slug, body } of constraintEntries) {
  if (!docsSlugs.includes(slug)) {
    fail(`Constraints entry "${slug}" does not have a docs page.`);
    continue;
  }
  if (!/constraints:\s*\[/.test(body)) {
    fail(`Constraints entry "${slug}" is not an array.`);
    continue;
  }
  const items = [...body.matchAll(/^\s*"/gm)].length;
  if (items === 0) {
    fail(`Constraints entry "${slug}" has no items.`);
  }
}

const relatedEntries = entriesWithBody(relatedSource);
for (const { slug, body } of relatedEntries) {
  if (!docsSlugs.includes(slug)) {
    fail(`Related entry "${slug}" does not have a docs page.`);
    continue;
  }
  for (const match of body.matchAll(/href:\s*"([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/docs/")) {
      fail(`Related entry "${slug}" has a non-docs href "${href}".`);
      continue;
    }
    if (!href.startsWith("/docs/components/")) continue;
    const target = href.replace("/docs/components/", "");
    if (!docsSlugs.includes(target)) {
      fail(`Related entry "${slug}" links to missing page "${target}".`);
    }
  }
}

const examplesCount = fs
  .readdirSync(docsDir)
  .filter((file) => file.endsWith(".tsx") && file !== "index.tsx")
  .filter((file) =>
    /\bexamples=\{/.test(read(path.join(docsDir, file))),
  ).length;

console.log("Docs validation");
console.log(`  pages:         ${docsSlugs.length}`);
console.log(`  accessibility: ${accessibilityKeys.length}`);
console.log(`  motion:        ${motionKeys.length}`);
console.log(`  composition:   ${compositionEntries.length}`);
console.log(`  customization: ${customizationEntries.length}`);
console.log(`  constraints:   ${constraintEntries.length}`);
console.log(`  related:       ${relatedEntries.length}`);
console.log(`  with examples: ${examplesCount}`);

for (const message of warnings) console.warn(`warning: ${message}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log("\nAll docs checks passed.");
