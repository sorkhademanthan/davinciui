// Minimal focused-test runner for design-system domain tests (Step 7G).
// Node cannot run extensionless TypeScript imports directly, and no test
// framework is installed. This script compiles the pure lib files with the
// repo's TypeScript to a temporary CommonJS tree, then runs `node --test`.
// Production import paths are untouched. Run from the repo root:
//   node scripts/run-design-system-tests.mjs [test-files...]
// or via workspace script:
//   pnpm --filter web test:focus
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const webDir = join(root, "apps", "web");
const requested = process.argv.slice(2);
const entries =
  requested.length > 0
    ? requested
    : [
        "apps/web/lib/design-system/grid.test.ts",
        "apps/web/lib/design-system/breakpoints.test.ts",
      ];

// tsc runs from apps/web so @types/node + strict match the project.
const webRelative = entries.map((entry) => {
  const abs = resolve(root, entry);
  const rel = relative(webDir, abs);
  if (rel.startsWith("..")) {
    throw new Error(`Test entry must live under apps/web: ${entry}`);
  }
  return rel;
});

const outDir = mkdtempSync(join(tmpdir(), "davinciui-ds-tests-"));
try {
  const tsc = spawnSync(
    "npx",
    [
      "tsc",
      "--pretty",
      "false",
      "--strict",
      "--skipLibCheck",
      "--target",
      "es2022",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--esModuleInterop",
      "--rootDir",
      ".",
      "--outDir",
      outDir,
      ...webRelative,
    ],
    { cwd: webDir, stdio: "inherit" },
  );
  if (tsc.status !== 0) {
    process.exit(tsc.status ?? 1);
  }
  const compiled = webRelative.map((entry) => join(outDir, entry.replace(/\.ts$/, ".js")));
  const runner = spawnSync("node", ["--test", ...compiled], {
    cwd: root,
    stdio: "inherit",
  });
  process.exit(runner.status ?? 1);
} finally {
  try {
    rmSync(outDir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup only.
  }
}
