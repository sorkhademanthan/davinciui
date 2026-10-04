// Regression harness for long client-side design-system PDFs.
// Compiles the real React PDF document into an isolated temporary tree, then
// renders a deliberately large system. This catches pagination failures that
// do not appear in the focused pure-function tests.
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const web = join(root, "apps", "web");
const output = resolve(process.argv[2] ?? join(root, "tmp", "pdfs", "design-system-export-stress.pdf"));
const build = mkdtempSync(join(tmpdir(), "davinciui-pdf-stress-"));

try {
  writeFileSync(join(build, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      strict: true,
      skipLibCheck: true,
      target: "ES2022",
      module: "CommonJS",
      moduleResolution: "Node",
      esModuleInterop: true,
      jsx: "react-jsx",
      rootDir: web,
      outDir: join(build, "compiled"),
      baseUrl: web,
      paths: { "@/*": ["*"] },
    },
    files: [
      join(web, "components", "design-system", "design-system-export-document.tsx"),
      join(web, "lib", "design-system", "export.ts"),
      join(web, "lib", "design-system", "starters.ts"),
    ],
  }, null, 2));

  const compile = spawnSync("npx", ["tsc", "-p", join(build, "tsconfig.json")], {
    cwd: web,
    stdio: "inherit",
  });
  if (compile.status !== 0) process.exit(compile.status ?? 1);

  const aliasRoot = join(build, "node_modules", "@");
  mkdirSync(aliasRoot, { recursive: true });
  symlinkSync(join(build, "compiled", "components"), join(aliasRoot, "components"), "dir");
  symlinkSync(join(build, "compiled", "lib"), join(aliasRoot, "lib"), "dir");

  const harness = join(build, "render.cjs");
  writeFileSync(harness, `
const React = require("react");
const { renderToFile } = require("@react-pdf/renderer");
const { DesignSystemExportDocument } = require(${JSON.stringify(join(build, "compiled", "components", "design-system", "design-system-export-document.js"))});
const { prepareDesignSystemExport } = require(${JSON.stringify(join(build, "compiled", "lib", "design-system", "export.js"))});
const { createSystemFromStarter } = require(${JSON.stringify(join(build, "compiled", "lib", "design-system", "starters.js"))});
const { CORE_COMPONENT_IDS } = require(${JSON.stringify(join(build, "compiled", "lib", "design-system", "component-manifest.js"))});

(async () => {
  const baseline = process.env.PDF_FIXTURE === "baseline";
  const system = createSystemFromStarter({ starterId: "saas", name: baseline ? "DavinciUI" : "Long Export Regression" });
  if (!baseline) {
    system.semanticTokens.push(...Array.from({ length: 240 }, (_, index) => ({
      id: "custom.stress." + String(index + 1).padStart(3, "0"),
      label: "Stress token " + String(index + 1),
      category: "custom",
      value: index % 2 === 0 ? "#0f766e" : "#18181b",
      description: "Long-document pagination regression token used to verify reliable browser PDF layout.",
    })));
    // Exercise a warning-bearing model while verifying that the PDF remains a
    // clean handbook and the long token reference still paginates safely.
    const primaryText = system.semanticTokens.find((token) => token.id === "text.primary");
    const canvas = system.semanticTokens.find((token) => token.id === "background.canvas");
    if (primaryText) primaryText.value = "#777777";
    if (canvas) canvas.value = "#ffffff";
    system.library = { included: [...CORE_COMPONENT_IDS] };
  }
  const prepared = prepareDesignSystemExport(system, "2026-10-03T00:00:00.000Z");
  if (!prepared.ok) throw new Error("Stress fixture did not pass validation.");
  await renderToFile(React.createElement(DesignSystemExportDocument, { model: prepared.model }), ${JSON.stringify(output)});
  process.stdout.write(${JSON.stringify(output)} + "\\n");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
`);

  mkdirSync(dirname(output), { recursive: true });
  const run = spawnSync(process.execPath, [harness], {
    cwd: root,
    env: {
      ...process.env,
      NODE_PATH: `${join(build, "node_modules")}:${join(web, "node_modules")}:${join(root, "node_modules")}`,
    },
    stdio: "inherit",
  });
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(build, { recursive: true, force: true });
}
