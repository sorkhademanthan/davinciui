#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const webDir = path.join(root, "apps/web");
const previewsDir = path.join(webDir, "components/docs/previews");
const outDir = path.join(previewsDir, "playgrounds");

const BARREL_RE = /-playgrounds\.tsx$/;
const DOCS_IMPORT_PREFIX = "@/components/docs/previews/";
const OUT_IMPORT_PREFIX = "@/components/docs/previews/playgrounds/";

function fail(message) {
  console.error(`[split-playground-barrels] ${message}`);
  process.exit(1);
}

function parseFile(file) {
  const source = fs.readFileSync(file, "utf8");
  return {
    file,
    source,
    sf: ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
  };
}

function getDeclaredNames(statement) {
  const names = new Set();

  if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations) {
      collectBindingNames(declaration.name, names);
    }
  } else if (
    ts.isFunctionDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isEnumDeclaration(statement)
  ) {
    if (statement.name) names.add(statement.name.text);
  }

  return names;
}

function collectBindingNames(name, names) {
  if (ts.isIdentifier(name)) {
    names.add(name.text);
    return;
  }
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) collectBindingNames(element.name, names);
    }
  }
}

function collectIdentifiers(node, names) {
  if (ts.isIdentifier(node)) {
    names.add(node.text);
    return;
  }
  ts.forEachChild(node, (child) => collectIdentifiers(child, names));
}

function getImportLocalNames(importDecl) {
  const names = new Set();
  const clause = importDecl.importClause;
  if (!clause) return names;

  if (clause.name) names.add(clause.name.text);

  const bindings = clause.namedBindings;
  if (bindings) {
    if (ts.isNamespaceImport(bindings)) {
      names.add(bindings.name.text);
    } else {
      for (const element of bindings.elements) names.add(element.name.text);
    }
  }

  return names;
}

function buildImportText(importDecl, includedNames) {
  const clause = importDecl.importClause;
  const moduleText = importDecl.moduleSpecifier.text;

  if (!clause) return `import "${moduleText}";`;

  const parts = [];
  if (clause.name && includedNames.has(clause.name.text)) {
    parts.push(clause.name.text);
  }

  const bindings = clause.namedBindings;
  if (bindings) {
    if (ts.isNamespaceImport(bindings) && includedNames.has(bindings.name.text)) {
      parts.push(`* as ${bindings.name.text}`);
    } else if (ts.isNamedImports(bindings)) {
      const specifiers = [];
      for (const element of bindings.elements) {
        if (!includedNames.has(element.name.text)) continue;
        const imported = element.propertyName ? element.propertyName.text : element.name.text;
        const local = element.name.text;
        const typePrefix = element.isTypeOnly ? "type " : "";
        specifiers.push(
          imported === local ? `${typePrefix}${imported}` : `${typePrefix}${imported} as ${local}`,
        );
      }
      if (specifiers.length) parts.push(`{ ${specifiers.join(", ")} }`);
    }
  }

  if (!parts.length) return null;
  const typePrefix = clause.isTypeOnly ? "type " : "";
  return `import ${typePrefix}${parts.join(", ")} from "${moduleText}";`;
}

function getPlaygroundBlocks(barrel) {
  const blocks = [];
  const imports = [];

  for (const statement of barrel.sf.statements) {
    if (ts.isImportDeclaration(statement)) {
      imports.push(statement);
      continue;
    }

    if (!ts.isVariableStatement(statement)) continue;
    if (!(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
    if (statement.declarationList.declarations.length !== 1) continue;

    const declaration = statement.declarationList.declarations[0];
    if (!ts.isObjectBindingPattern(declaration.name)) continue;
    if (!declaration.initializer || !ts.isCallExpression(declaration.initializer)) continue;

    const callee = declaration.initializer.expression;
    if (!ts.isIdentifier(callee) || callee.text !== "createComponentPlayground") continue;

    const [definition] = declaration.initializer.arguments;
    if (!definition || !ts.isObjectLiteralExpression(definition)) continue;

    let slug = null;
    for (const property of definition.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = property.name;
      if (!ts.isIdentifier(name) || name.text !== "slug") continue;
      if (ts.isStringLiteral(property.initializer)) slug = property.initializer.text;
    }

    if (!slug) fail(`could not read slug in ${path.relative(root, barrel.file)}`);

    blocks.push({ statement, slug });
  }

  return { imports, blocks };
}

function collectSharedStatements(barrel, blockStatements) {
  const shared = [];
  for (const statement of barrel.sf.statements) {
    if (ts.isImportDeclaration(statement)) continue;
    if (blockStatements.has(statement)) continue;
    if (ts.isExpressionStatement(statement)) continue;
    if (ts.isVariableStatement(statement) && statement.declarationList.declarations.length === 0) continue;
    const names = getDeclaredNames(statement);
    if (!names.size) continue;
    shared.push({ statement, names });
  }
  return shared;
}

function resolveDependencies(block, shared, imports) {
  const sharedByName = new Map();
  for (const entry of shared) {
    for (const name of entry.names) sharedByName.set(name, entry);
  }

  const neededShared = new Set();
  const neededNames = new Set();
  const queue = [];

  collectIdentifiers(block.statement, neededNames);
  for (const name of neededNames) queue.push(name);

  while (queue.length) {
    const name = queue.pop();
    const entry = sharedByName.get(name);
    if (!entry || neededShared.has(entry)) continue;
    neededShared.add(entry);

    const refs = new Set();
    collectIdentifiers(entry.statement, refs);
    for (const declared of entry.names) refs.delete(declared);
    for (const ref of refs) {
      neededNames.add(ref);
      queue.push(ref);
    }
  }

  const includedImports = [];
  for (const importDecl of imports) {
    const localNames = getImportLocalNames(importDecl);
    const included = new Set([...localNames].filter((name) => neededNames.has(name)));
    if (!localNames.size || included.size) {
      const text = buildImportText(importDecl, included);
      if (text) includedImports.push(text);
    }
  }

  return { includedImports, neededShared: [...neededShared] };
}

function buildComponentFile(barrel, block, shared, imports) {
  const { includedImports, neededShared } = resolveDependencies(block, shared, imports);
  const sharedText = neededShared
    .sort(
      (a, b) =>
        a.statement.getStart(barrel.sf) - b.statement.getStart(barrel.sf),
    )
    .map((entry) => entry.statement.getFullText(barrel.sf).trim())
    .join("\n\n");
  const blockText = block.statement.getFullText(barrel.sf).trim();

  return `"use client";\n\n${includedImports.join("\n")}\n\n${sharedText ? `${sharedText}\n\n` : ""}${blockText}\n`;
}

const barrels = fs
  .readdirSync(previewsDir)
  .filter((name) => BARREL_RE.test(name))
  .map((name) => path.join(previewsDir, name));

if (!barrels.length) fail("no *-playgrounds.tsx barrels found");

fs.mkdirSync(outDir, { recursive: true });

const exportMap = new Map();
const barrelNames = new Set(barrels.map((file) => path.basename(file, ".tsx")));
const outputFiles = [];

for (const file of barrels) {
  const barrel = parseFile(file);
  const { imports, blocks } = getPlaygroundBlocks(barrel);
  const blockStatements = new Set(blocks.map((block) => block.statement));
  const shared = collectSharedStatements(barrel, blockStatements);

  for (const block of blocks) {
    const declaration = block.statement.declarationList.declarations[0];
    for (const element of declaration.name.elements) {
      if (!ts.isBindingElement(element)) continue;
      const localName = element.name;
      if (!ts.isIdentifier(localName)) continue;
      if (!exportMap.has(localName.text)) exportMap.set(localName.text, new Set());
      exportMap.get(localName.text).add(block.slug);
    }

    const outFile = path.join(outDir, `${block.slug}.tsx`);
    if (outputFiles.includes(outFile)) fail(`duplicate output file ${outFile}`);
    outputFiles.push(outFile);
    fs.writeFileSync(outFile, buildComponentFile(barrel, block, shared, imports));
  }
}

const docsDir = path.join(webDir, "components/docs");
const docsFiles = fs
  .readdirSync(docsDir)
  .filter((name) => name.endsWith(".tsx") && !name.startsWith("."))
  .map((name) => path.join(docsDir, name));

let rewritten = 0;

for (const file of docsFiles) {
  const parsed = parseFile(file);
  const edits = [];

  for (const statement of parsed.sf.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const moduleText = statement.moduleSpecifier.text;
    if (!moduleText.startsWith(DOCS_IMPORT_PREFIX)) continue;

    const barrelName = moduleText.slice(DOCS_IMPORT_PREFIX.length);
    if (!barrelNames.has(barrelName)) continue;

    const clause = statement.importClause;
    if (!clause || clause.name || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      fail(`unsupported import shape in ${path.relative(root, file)}: ${moduleText}`);
    }

    const groups = new Map();
    for (const element of clause.namedBindings.elements) {
      const localName = element.name.text;
      const slugs = exportMap.get(localName);
      if (!slugs || slugs.size !== 1) {
        fail(
          `cannot map imported name ${localName} from ${moduleText} in ${path.relative(root, file)}`,
        );
      }
      const slug = [...slugs][0];
      if (!groups.has(slug)) groups.set(slug, []);
      groups.get(slug).push(element.getText(parsed.sf));
    }

    const replacement = [...groups.entries()]
      .map(([slug, names]) => `import { ${names.join(", ")} } from "${OUT_IMPORT_PREFIX}${slug}";`)
      .join("\n");

    edits.push({ start: statement.getStart(parsed.sf), end: statement.getEnd(), replacement });
  }

  if (!edits.length) continue;

  let source = parsed.source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.replacement + source.slice(edit.end);
  }
  fs.writeFileSync(file, source);
  rewritten += 1;
}

console.log(
  `[split-playground-barrels] wrote ${outputFiles.length} component playground files; rewrote ${rewritten} docs imports`,
);
