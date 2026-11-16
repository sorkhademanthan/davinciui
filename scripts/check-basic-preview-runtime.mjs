import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const previewFile = resolve(
  root,
  "apps/web/components/docs/previews/basic-component-card-preview.tsx",
);
const shellFile = resolve(
  root,
  "apps/web/components/component-card-live-preview.tsx",
);

const source = readFileSync(previewFile, "utf8");
const shellSource = readFileSync(shellFile, "utf8");

const bannedPatterns = [
  ["setTimeout", /\bsetTimeout\s*\(/],
  ["setInterval", /\bsetInterval\s*\(/],
  ["requestAnimationFrame", /\brequestAnimationFrame\s*\(/],
  ["ResizeObserver", /\bResizeObserver\b/],
  ["IntersectionObserver", /\bIntersectionObserver\b/],
  ["createPortal", /\bcreatePortal\s*\(/],
  ["canvas element", /<canvas\b/],
  [
    "running CSS animation",
    /\banimate-(spin|pulse|bounce|ping)\b/,
  ],
];

const hits = bannedPatterns.filter(([, pattern]) => pattern.test(source));
const shellHits = [
  ["IntersectionObserver", /\bnew\s+IntersectionObserver\s*\(/],
  ["matchMedia", /\bmatchMedia\s*\(/],
].filter(([, pattern]) => pattern.test(shellSource));

if (hits.length > 0 || shellHits.length > 0) {
  if (hits.length > 0) {
    console.error(
      "Basic preview runtime guard failed. Remove these from basic-component-card-preview.tsx:",
    );
    for (const [name] of hits) {
      console.error(`  - ${name}`);
    }
  }

  if (shellHits.length > 0) {
    console.error(
      "Shared gallery shell guard failed. Keep these in gallery-card-runtime.ts, not component-card-live-preview.tsx:",
    );
    for (const [name] of shellHits) {
      console.error(`  - ${name}`);
    }
  }

  process.exit(1);
}

console.log(
  "Basic preview runtime guard passed: no timers, RAF, observers, portals, canvases, or running CSS animations.",
);
console.log(
  "Shared gallery shell guard passed: observers and matchMedia stay in the shared runtime.",
);
