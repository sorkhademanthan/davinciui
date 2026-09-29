// Focused domain-contract tests (Step 1). Runs with the repo's existing
// TypeScript tooling: compile to JS, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DESIGN_SYSTEM_VERSION,
  createBlankDesignSystem,
  createDesignSystem,
  isHexColor,
  paletteFrom,
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";

function blank(): DesignSystemConfig {
  return createBlankDesignSystem({ name: "Blank test system" });
}

test("blank system is a valid neutral baseline", () => {
  const system = blank();
  assert.equal(system.schemaVersion, DESIGN_SYSTEM_VERSION);
  assert.equal(system.starter.presetId, "blank");
  assert.ok(system.id.length > 0);
  // One neutral palette, no forced accent.
  assert.equal(system.foundations.colors.palettes.length, 1);
  assert.equal(system.foundations.colors.palettes[0]?.role, "neutral");
  // Semantic defaults required to render a basic interface.
  for (const id of [
    "background.canvas",
    "text.primary",
    "border.default",
    "action.primary.background",
    "action.primary.foreground",
    "focus.ring",
  ]) {
    assert.ok(
      system.semanticTokens.some((token) => token.id === id),
      `missing semantic token ${id}`,
    );
  }
  // Blank actions resolve to an accessible dark neutral with white text.
  assert.equal(resolveToken(system, "action.primary.background").value, system.foundations.colors.palettes[0]?.shades["900"]);
  assert.equal(resolveToken(system, "action.primary.foreground").value, "#ffffff");
  // Light + dark themes present without duplicating foundations.
  assert.deepEqual(
    system.themes.map((theme) => theme.id).sort(),
    ["dark", "light"],
  );
  const errors = validateDesignSystem(system).filter((issue) => issue.severity === "error");
  assert.deepEqual(errors, []);
});

test("blank starter ignores color overrides (stays neutral-only)", () => {
  const system = createDesignSystem({
    name: "Blank via wizard",
    presetId: "blank",
    color: "#db2777",
    font: "Inter",
    density: "comfortable",
  });
  assert.equal(system.foundations.colors.palettes.length, 1);
  assert.equal(system.foundations.colors.palettes[0]?.id, "neutral");
});

test("custom palette creation carries role, label, and id", () => {
  const palette = paletteFrom("#0f766e", "teal-brand", "Teal brand", "brand");
  assert.equal(palette.id, "teal-brand");
  assert.equal(palette.label, "Teal brand");
  assert.equal(palette.role, "brand");
  assert.equal(palette.base, "#0f766e");
  assert.ok(isHexColor(palette.shades["500"]));
  assert.ok(isHexColor(palette.shades["950"]));

  const system = createDesignSystem({
    name: "SaaS system",
    presetId: "saas",
    color: "#635bff",
    font: "Inter",
    density: "comfortable",
  });
  assert.equal(system.starter.label, "SaaS");
  assert.equal(system.foundations.colors.palettes[0]?.id, "brand");
  assert.equal(system.foundations.colors.palettes[1]?.id, "neutral");
  assert.equal(system.foundations.density, "comfortable");
  assert.equal(system.foundations.typography.primary, "Inter");
  assert.ok(system.foundations.spacing.scale.some((token) => token.id === "space-12"));
});

test("semantic references resolve through palette aliases", () => {
  const system = createDesignSystem({
    name: "Resolver system",
    presetId: "saas",
    color: "#635bff",
    font: "Inter",
    density: "comfortable",
  });
  const brand600 = system.foundations.colors.palettes[0]?.shades["600"];
  const resolved = resolveToken(system, "action.primary.background");
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.value, brand600);
  // Primitive palette references resolve directly.
  assert.equal(resolveToken(system, "brand.500").value, "#635bff");
  // Raw hex passes through.
  assert.deepEqual(resolveToken(system, "#ffffff"), {
    status: "resolved",
    value: "#ffffff",
    chain: ["#ffffff"],
  });
});

test("light and dark theme overrides resolve per theme", () => {
  const system = blank();
  assert.equal(resolveToken(system, "background.canvas", "light").value, "#ffffff");
  assert.equal(resolveToken(system, "background.canvas", "dark").value, "#09090b");
  assert.equal(resolveToken(system, "text.primary", "dark").value, "#fafafa");
  // Unknown theme falls back to the base semantic value (still resolved).
  const fallback = resolveToken(system, "background.canvas", "no-such-theme");
  assert.equal(fallback.status, "resolved");
});

test("unresolved references never throw and stay identifiable", () => {
  const system = blank();
  for (const reference of ["nope.500", "missing.token", "", "   ", "#12g45z"]) {
    const result = resolveToken(system, reference);
    assert.equal(result.status, "unresolved", `expected unresolved for ${JSON.stringify(reference)}`);
    assert.ok(typeof result.value === "string");
    assert.ok(result.reason && result.reason.length > 0);
  }
  // @ts-expect-error resolver must tolerate non-string input at runtime
  assert.equal(resolveToken(system, undefined).status, "unresolved");
});

test("circular references are detected safely", () => {
  const system = blank();
  const loop: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens,
      { id: "loop.a", label: "Loop A", category: "custom", value: "loop.b" },
      { id: "loop.b", label: "Loop B", category: "custom", value: "loop.a" },
    ],
  };
  const result = resolveToken(loop, "loop.a");
  assert.equal(result.status, "circular");
  assert.ok((result.reason ?? "").includes("Circular"));
  assert.deepEqual(result.chain[0], "loop.a");
});

test("validation reports structured issues", () => {
  const system = blank();

  const unnamed: DesignSystemConfig = {
    ...system,
    meta: { ...system.meta, name: "   " },
  };
  const nameIssues = validateDesignSystem(unnamed).filter((issue) => issue.path === "meta.name");
  assert.equal(nameIssues.length, 1);
  assert.equal(nameIssues[0]?.severity, "error");
  assert.ok((nameIssues[0]?.message ?? "").length > 0);

  const badHex: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      colors: {
        palettes: [{ ...system.foundations.colors.palettes[0]!, base: "not-a-color" }],
      },
    },
  };
  assert.ok(
    validateDesignSystem(badHex).some((issue) => issue.code === "invalid-hex" && issue.severity === "error"),
  );

  const brokenRef: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens,
      { id: "custom.broken", label: "Broken", category: "custom", value: "ghost.500" },
    ],
  };
  const refIssues = validateDesignSystem(brokenRef).filter((issue) => issue.code === "unresolved-reference");
  assert.ok(refIssues.length >= 1);
  assert.ok(refIssues.every((issue) => issue.path && issue.message && issue.severity));

  const noDark: DesignSystemConfig = {
    ...system,
    themes: system.themes.filter((theme) => theme.id !== "dark"),
  };
  assert.ok(
    validateDesignSystem(noDark).some(
      (issue) => issue.code === "missing-theme" && issue.message.includes("dark"),
    ),
  );

  const duplicated: DesignSystemConfig = {
    ...system,
    semanticTokens: [...system.semanticTokens, { ...system.semanticTokens[0]! }],
  };
  assert.ok(
    validateDesignSystem(duplicated).some((issue) => issue.code === "duplicate-id"),
  );

  const loop: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens,
      { id: "loop.a", label: "Loop A", category: "custom", value: "loop.b" },
      { id: "loop.b", label: "Loop B", category: "custom", value: "loop.a" },
    ],
  };
  assert.ok(
    validateDesignSystem(loop).some((issue) => issue.code === "circular-reference"),
  );
});
