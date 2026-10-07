const fs = require("fs");
const path = require("path");

const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

// Configuration
const COMPONENT_DIR = path.join(__dirname, "../packages/ui/src/components");
const REGISTRY_DIR = path.join(__dirname, "../apps/web/public/r");
const REGISTRY_INDEX_PATH = path.join(REGISTRY_DIR, "registry.json");
const WEBGL_ERROR_BOUNDARY_FILENAME = "webgl-error-boundary.tsx";
const WEBGL_ERROR_BOUNDARY_SOURCE_PATH = path.join(
  COMPONENT_DIR,
  WEBGL_ERROR_BOUNDARY_FILENAME,
);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Please provide a component name (e.g., text-morph)");
  process.exit(1);
}

const componentName = args[0];
const componentFilename = `${componentName}.tsx`;

// Components may live in grouped subdirectories (e.g. components/motion/).
// Resolve the flat path first, then fall back to a recursive search.
function findComponentSource(dir, filename) {
  const direct = path.join(dir, filename);
  if (fs.existsSync(direct)) return direct;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const nested = findComponentSource(path.join(dir, entry.name), filename);
    if (nested) return nested;
  }
  return null;
}

const sourcePath = findComponentSource(COMPONENT_DIR, componentFilename);
const registryPath = path.join(REGISTRY_DIR, `${componentName}.json`);

// Check if source component exists
if (!sourcePath) {
  console.error(
    `Component file not found: ${componentFilename} (searched ${COMPONENT_DIR})`,
  );
  process.exit(1);
}

// Read source content
const sourceContent = fs.readFileSync(sourcePath, "utf8");

function toTitleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeRegistryContent(content) {
  return (
    content
      .replace(/@workspace\/ui\/lib\/utils/g, "@/lib/utils")
      .replace(/@workspace\/ui\/lib\/ease/g, "@/lib/ease")
      .replace(
        /@workspace\/ui\/components\/webgl-error-boundary/g,
        "./webgl-error-boundary",
      )
      // Cross-component imports become standard alias paths so the shadcn
      // CLI rewrites them to the user's aliases; the targets ship via
      // registryDependencies (@davinciui/*).
      .replace(
        /@workspace\/ui\/components\/(button|input|scroll-area|autocomplete)/g,
        "@/components/ui/$1",
      )
      // Extensionless sibling imports resolve in every bundler; the source
      // keeps the explicit .js extension for node16/nodenext typechecking.
      .replace(/from\s+["']\.\/([a-z0-9-]+)\.js["']/g, 'from "./$1"')
  );
}

// Prepare registry data
let registryData;
if (fs.existsSync(registryPath)) {
  try {
    registryData = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    console.log(`Updating existing registry file for ${componentName}...`);
  } catch (error) {
    console.error("Error parsing existing registry file:", error);
    process.exit(1);
  }
} else {
  console.log(`Creating new registry file for ${componentName}...`);
  registryData = {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: componentName,
    type: "registry:ui",
    title: toTitleCase(componentName),
    dependencies: [],
    devDependencies: [],
    registryDependencies: [],
    description: `Component for ${componentName}`, // Default description
    files: [],
  };
}

if (!registryData.$schema) {
  registryData.$schema = REGISTRY_ITEM_SCHEMA;
}

if (!registryData.title) {
  registryData.title = toTitleCase(componentName);
}

if (!Array.isArray(registryData.dependencies)) {
  registryData.dependencies = [];
}

if (!Array.isArray(registryData.devDependencies)) {
  registryData.devDependencies = [];
}

if (!Array.isArray(registryData.registryDependencies)) {
  registryData.registryDependencies = [];
}

// Update or add the main file content
// We assume simple 1-file component structure for now or find the matching file path
const targetFilePath = `components/ui/${componentFilename}`;

if (!registryData.files) {
  registryData.files = [];
}

const existingFileIndex = registryData.files.findIndex(
  (f) => f.path === targetFilePath || f.path.endsWith(componentFilename),
);

if (existingFileIndex >= 0) {
  registryData.files[existingFileIndex].content =
    normalizeRegistryContent(sourceContent);
} else {
  registryData.files.push({
    path: targetFilePath,
    content: normalizeRegistryContent(sourceContent),
    type: "registry:ui",
  });
}

// Include shared helper file when the component uses the WebGL error boundary.
const usesWebGLErrorBoundary = sourceContent.includes("webgl-error-boundary");
if (usesWebGLErrorBoundary && fs.existsSync(WEBGL_ERROR_BOUNDARY_SOURCE_PATH)) {
  const boundaryContent = normalizeRegistryContent(
    fs.readFileSync(WEBGL_ERROR_BOUNDARY_SOURCE_PATH, "utf8"),
  );
  const boundaryTargetPath = `components/ui/${WEBGL_ERROR_BOUNDARY_FILENAME}`;
  const boundaryIndex = registryData.files.findIndex(
    (f) =>
      f.path === boundaryTargetPath ||
      f.path.endsWith(WEBGL_ERROR_BOUNDARY_FILENAME),
  );

  if (boundaryIndex >= 0) {
    registryData.files[boundaryIndex].content = boundaryContent;
  } else {
    registryData.files.push({
      path: boundaryTargetPath,
      content: boundaryContent,
      type: "registry:ui",
    });
  }
}

// Include sibling component files when the source imports them relatively
// (e.g. `from "./calendar"` or `from "./calendar.js"`), so multi-file
// components install all of their parts.
const siblingImports = new Set();
for (const match of sourceContent.matchAll(
  /from\s+["']\.\/([a-z0-9-]+)(?:\.js)?["']/g,
)) {
  siblingImports.add(match[1]);
}
for (const sibling of siblingImports) {
  const siblingFilename = `${sibling}.tsx`;
  const siblingSourcePath = path.join(COMPONENT_DIR, siblingFilename);
  if (!fs.existsSync(siblingSourcePath)) {
    console.error(
      `Warning: sibling component not found at: ${siblingSourcePath}`,
    );
    continue;
  }
  const siblingContent = normalizeRegistryContent(
    fs.readFileSync(siblingSourcePath, "utf8"),
  );
  const siblingTargetPath = `components/ui/${siblingFilename}`;
  const siblingIndex = registryData.files.findIndex(
    (f) => f.path === siblingTargetPath || f.path.endsWith(siblingFilename),
  );

  if (siblingIndex >= 0) {
    registryData.files[siblingIndex].content = siblingContent;
  } else {
    registryData.files.push({
      path: siblingTargetPath,
      content: siblingContent,
      type: "registry:ui",
    });
  }
}

// Write back to registry file
fs.writeFileSync(registryPath, JSON.stringify(registryData, null, 2));

console.log(`Successfully updated ${registryPath}`);

// Keep registry.json in sync when present.
if (fs.existsSync(REGISTRY_INDEX_PATH)) {
  try {
    const registryIndex = JSON.parse(
      fs.readFileSync(REGISTRY_INDEX_PATH, "utf8"),
    );
    if (!Array.isArray(registryIndex.items)) {
      registryIndex.items = [];
    }

    const existingNames = new Set(
      registryIndex.items
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter(Boolean),
    );

    if (!existingNames.has(componentName)) {
      registryIndex.items.push({
        name: componentName,
        type: "registry:ui",
      });
      registryIndex.items.sort((a, b) => {
        const aName = typeof a === "string" ? a : a.name;
        const bName = typeof b === "string" ? b : b.name;
        return aName.localeCompare(bName);
      });
      fs.writeFileSync(
        REGISTRY_INDEX_PATH,
        JSON.stringify(registryIndex, null, 2),
      );
      console.log(`Added ${componentName} to ${REGISTRY_INDEX_PATH}`);
    }
  } catch (error) {
    console.error(
      "Warning: could not sync apps/web/public/r/registry.json:",
      error.message,
    );
  }
}
