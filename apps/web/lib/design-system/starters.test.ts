// Focused starter-template tests (Step 3). Same convention as the Step 1/2
// tests: compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DESIGN_SYSTEM_VERSION,
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import {
  STARTERS,
  createSystemFromStarter,
  getStarter,
  type StarterId,
} from "./starters";

const ALL_IDS: StarterId[] = [
  "blank",
  "minimal",
  "saas",
  "enterprise",
  "editorial",
  "ecommerce",
  "dark-first",
];

function build(id: StarterId, name = `Test ${id}`): DesignSystemConfig {
  return createSystemFromStarter({ starterId: id, name });
}

test("all seven starter ids exist and are selectable", () => {
  assert.equal(STARTERS.length, 7);
  assert.deepEqual(
    [...STARTERS.map((starter) => starter.id)].sort(),
    [...ALL_IDS].sort(),
  );
  for (const starter of STARTERS) {
    assert.ok(starter.label.length > 0);
    assert.ok(starter.description.length > 0);
    assert.ok(starter.intendedUse.length > 0);
    assert.equal(getStarter(starter.id).id, starter.id);
  }
});

test("unknown starter id safely falls back to Blank", () => {
  assert.equal(getStarter("does-not-exist").id, "blank");
  assert.equal(getStarter("").id, "blank");
  const system = createSystemFromStarter({ starterId: "does-not-exist", name: "Fallback" });
  assert.equal(system.starter.presetId, "blank");
  assert.equal(system.foundations.colors.palettes.length, 1);
  assert.equal(system.foundations.colors.palettes[0]?.role, "neutral");
});

test("every starter produces a valid canonical system", () => {
  for (const id of ALL_IDS) {
    const system = build(id);
    assert.equal(system.schemaVersion, DESIGN_SYSTEM_VERSION, id);
    assert.equal(system.starter.presetId, id, id);
    assert.ok(system.id.length > 0, id);
    assert.ok(system.meta.name.length > 0, id);
    assert.ok(system.meta.createdAt.length > 0, id);
    assert.ok(system.meta.updatedAt.length > 0, id);
    const issues = validateDesignSystem(system);
    assert.deepEqual(issues, [], `${id}: ${JSON.stringify(issues)}`);
  }
});

test("every required foundation section is populated", () => {
  for (const id of ALL_IDS) {
    const system = build(id);
    const foundations = system.foundations;
    assert.ok(foundations.colors.palettes.length >= 1, `${id}: palettes`);
    assert.deepEqual(
      Object.keys(foundations.typography.roles).sort(),
      ["body", "display", "heading", "label", "mono"],
      `${id}: typography roles`,
    );
    assert.ok(foundations.typography.styles.length >= 8, `${id}: text styles`);
    assert.deepEqual(
      foundations.spacing.scale.map((token) => token.id),
      ["space-1", "space-2", "space-3", "space-4", "space-5", "space-6", "space-7", "space-8", "space-9", "space-10", "space-11", "space-12"],
      `${id}: spacing scale`,
    );
    assert.deepEqual(
      foundations.radius.scale.map((token) => token.id),
      ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"],
      `${id}: radius scale`,
    );
    assert.ok(
      foundations.radius.scale.every((token) => token.label.length > 0 && token.value.length > 0),
      `${id}: radius labels/values`,
    );
    assert.ok(Object.keys(foundations.borders.widths).length > 0, `${id}: border widths`);
    assert.ok(Object.keys(foundations.borders.styles).length > 0, `${id}: border styles`);
    assert.ok(foundations.borders.tokens.length > 0, `${id}: border tokens`);
    assert.ok(foundations.shadows.tokens.length > 0, `${id}: shadows`);
    assert.ok(Object.keys(foundations.motion.durations).length > 0, `${id}: durations`);
    assert.ok(Object.keys(foundations.motion.easings).length > 0, `${id}: easings`);
    assert.ok(Object.keys(foundations.icons.sizes).length > 0, `${id}: icon sizes`);
    assert.ok(foundations.icons.strokeWidth > 0, `${id}: stroke width`);
    assert.ok(foundations.grid.columns >= 1, `${id}: grid columns`);
    assert.ok(foundations.grid.gutter.length > 0, `${id}: gutter`);
    assert.ok(foundations.grid.maxWidth.length > 0, `${id}: max width`);
    assert.deepEqual(
      foundations.breakpoints.scale.map((token) => token.id),
      ["base", "sm", "md", "lg", "xl", "2xl"],
      `${id}: breakpoints`,
    );
    assert.ok(
      ["compact", "comfortable", "spacious"].includes(foundations.density),
      `${id}: density`,
    );
  }
});

test("all semantic and component-token references resolve", () => {
  for (const id of ALL_IDS) {
    const system = build(id);
    for (const themeId of [undefined, "light", "dark"] as const) {
      for (const token of system.semanticTokens) {
        const resolution = resolveToken(system, token.value, themeId);
        assert.equal(
          resolution.status,
          "resolved",
          `${id} [${themeId ?? "base"}] ${token.id} -> ${token.value}: ${resolution.reason ?? ""}`,
        );
      }
    }
    for (const entry of system.components) {
      for (const override of entry.overrides) {
        const resolution = resolveToken(system, override.value);
        assert.equal(
          resolution.status,
          "resolved",
          `${id} ${entry.component}.${override.token} -> ${override.value}: ${resolution.reason ?? ""}`,
        );
      }
    }
  }
});

test("light and dark themes exist for every starter", () => {
  for (const id of ALL_IDS) {
    const system = build(id);
    const light = system.themes.find((theme) => theme.id === "light");
    const dark = system.themes.find((theme) => theme.id === "dark");
    assert.ok(light, `${id}: light theme`);
    assert.ok(dark, `${id}: dark theme`);
    assert.equal(light?.mode, "light", id);
    assert.equal(dark?.mode, "dark", id);
  }
});

test("no starter has duplicate color roles or duplicate token ids", () => {
  for (const id of ALL_IDS) {
    const system = build(id);
    const roles = system.foundations.colors.palettes.map((palette) => palette.role);
    assert.equal(new Set(roles).size, roles.length, `${id}: duplicate palette role`);
    const paletteIds = system.foundations.colors.palettes.map((palette) => palette.id);
    assert.equal(new Set(paletteIds).size, paletteIds.length, `${id}: duplicate palette id`);
  }
});

test("Blank has no forced Accent palette", () => {
  const system = build("blank");
  assert.equal(system.foundations.colors.palettes.length, 1);
  assert.equal(system.foundations.colors.palettes[0]?.role, "neutral");
  for (const id of ["background.canvas", "text.primary", "border.default", "action.primary.background", "action.primary.foreground", "focus.ring"]) {
    assert.ok(system.semanticTokens.some((token) => token.id === id), `blank missing ${id}`);
  }
  assert.equal(system.foundations.density, "comfortable");
});

test("Blank ignores user color overrides", () => {
  const system = createSystemFromStarter({ starterId: "blank", name: "Blank custom", color: "#db2777" });
  assert.equal(system.foundations.colors.palettes.length, 1);
  assert.equal(system.foundations.colors.palettes[0]?.role, "neutral");
});

test("Enterprise is compact with tight radius and strong borders", () => {
  const system = build("enterprise");
  assert.equal(system.foundations.density, "compact");
  assert.equal(system.foundations.radius.base, 6);
  assert.equal(system.foundations.spacing.base, 4);
  const border = system.foundations.borders.tokens.find((token) => token.id === "border.default");
  assert.equal(border?.width, "medium");
  assert.ok(system.semanticTokens.some((token) => token.id === "status.success"));
});

test("Editorial pairs expressive display type with readable body type", () => {
  const system = build("editorial");
  const { roles } = system.foundations.typography;
  assert.equal(roles.display.fontFamily, "Georgia");
  assert.equal(roles.body.fontFamily, "Inter");
  assert.notEqual(roles.display.fontFamily, roles.body.fontFamily);
  const displayStyle = system.foundations.typography.styles.find((style) => style.id === "display");
  assert.equal(displayStyle?.fontFamily, "Georgia");
  assert.equal(system.foundations.density, "spacious");
  assert.equal(system.foundations.grid.maxWidth, "768px");
});

test("Dark-first designs its baseline for dark and keeps light usable", () => {
  const system = build("dark-first");
  const canvas = system.semanticTokens.find((token) => token.id === "background.canvas");
  assert.equal(canvas?.value, "#0e0e11");
  const light = system.themes.find((theme) => theme.id === "light")!;
  const dark = system.themes.find((theme) => theme.id === "dark")!;
  assert.equal(light.overrides["background.canvas"], "#ffffff");
  assert.equal(dark.overrides["background.canvas"], "#0e0e11");
  // Usable light theme: every light override resolves.
  for (const value of Object.values(light.overrides)) {
    assert.equal(resolveToken(system, value, "light").status, "resolved", `light: ${value}`);
  }
  // Not an inverted SaaS: distinct brand and dark-first action pairing.
  assert.equal(system.foundations.colors.palettes[0]?.base, "#8b5cf6");
  const action = system.semanticTokens.find((token) => token.id === "action.primary.background");
  const actionFg = system.semanticTokens.find((token) => token.id === "action.primary.foreground");
  assert.equal(action?.value, "brand.400");
  assert.equal(actionFg?.value, "neutral.950");
});

test("SaaS ships the full feedback palette set", () => {
  const system = build("saas");
  const roles = system.foundations.colors.palettes.map((palette) => palette.role);
  for (const role of ["brand", "neutral", "success", "warning", "danger", "info"]) {
    assert.ok(roles.includes(role as (typeof roles)[number]), `saas missing ${role}`);
  }
  assert.equal(system.foundations.density, "comfortable");
});

test("E-commerce models price, availability, and checkout states", () => {
  const system = build("ecommerce");
  for (const id of ["product.price", "status.inStock", "status.lowStock", "status.promotion", "action.checkout.background", "action.checkout.foreground"]) {
    assert.ok(system.semanticTokens.some((token) => token.id === id), `ecommerce missing ${id}`);
  }
  const button = system.components.find((entry) => entry.component === "Button")!;
  assert.ok(
    button.overrides.some((override) => override.variant === "checkout" && override.value === "action.checkout.background"),
    "ecommerce Button checkout variant",
  );
});

test("generated systems have independent ids and no shared mutable state", () => {
  const first = build("saas", "Same name");
  const second = build("saas", "Same name");
  assert.notEqual(first.id, second.id);
  first.meta.name = "Mutated";
  first.foundations.colors.palettes[0]!.base = "#000000";
  first.semanticTokens[0]!.value = "#000000";
  first.themes[0]!.overrides["background.canvas"] = "#000000";
  assert.equal(second.meta.name, "Same name");
  assert.notEqual(second.foundations.colors.palettes[0]?.base, "#000000");
  assert.notEqual(second.semanticTokens[0]?.value, "#000000");
  assert.notEqual(second.themes[0]?.overrides["background.canvas"], "#000000");
});

test("user overrides win over starter defaults", () => {
  const custom = createSystemFromStarter({
    starterId: "saas",
    name: "Custom",
    color: "#123456",
    font: "Space Grotesk",
    density: "spacious",
  });
  assert.equal(custom.foundations.colors.palettes[0]?.base, "#123456");
  assert.equal(custom.foundations.typography.primary, "Space Grotesk");
  assert.equal(custom.foundations.typography.roles.body.fontFamily, "Space Grotesk");
  assert.equal(custom.foundations.density, "spacious");
  // Structural extras survive overrides.
  assert.ok(custom.semanticTokens.some((token) => token.id === "status.success"));
});
