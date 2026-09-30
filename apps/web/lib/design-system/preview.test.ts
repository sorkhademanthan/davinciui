// Focused Preview tests (Step 11). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveToken, type DesignSystemConfig } from "./domain";
import { createSystemFromStarter } from "./starters";
import { createTheme, insertTheme, setOverride } from "./themes";
import { updateBreakpointValue } from "./breakpoints";
import {
  buildCssVarMap,
  collectDiagnostics,
  isSafeCssValue,
  previewMotion,
  resolveActiveLayout,
  resolveComponentSlot,
  resolvePreview,
  resolveSemanticsForTheme,
} from "./preview";

/** Blank "Manthan" system. */
function manthanSystem(): DesignSystemConfig {
  return createSystemFromStarter({ starterId: "blank", name: "Manthan" });
}

function customThemedSystem(): DesignSystemConfig {
  const created = createTheme(manthanSystem(), { label: "Midnight", mode: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("fixture setup failed");
  const edited = setOverride(
    insertTheme(manthanSystem(), created.theme),
    "midnight",
    "text.primary",
    "#000001",
  );
  assert.equal(edited.ok, true);
  if (!edited.ok) throw new Error("fixture setup failed");
  return edited.system;
}

test("semantic token resolution under Light, Dark, and Custom themes", () => {
  const system = customThemedSystem();
  for (const themeId of ["light", "dark", "midnight"] as const) {
    const resolved = resolveSemanticsForTheme(system, themeId);
    assert.ok(Object.keys(resolved).length >= 29, `${themeId}: baseline covered`);
    assert.equal(resolved["text.primary"]?.status, "resolved", themeId);
  }
  const light = resolveSemanticsForTheme(system, "light");
  const midnight = resolveSemanticsForTheme(system, "midnight");
  assert.equal(light["text.primary"]?.provenance, "theme-override");
  assert.equal(light["text.primary"]?.final, "#18181b");
  assert.equal(midnight["text.primary"]?.final, "#000001");
  // Untouched tokens inherit identically everywhere.
  assert.equal(light["overlay.scrim"]?.provenance, "base-semantic");
  assert.equal(
    light["overlay.scrim"]?.final,
    midnight["overlay.scrim"]?.final,
  );
});

test("CSS-variable map is scoped, safe, and contains expected values", () => {
  const system = manthanSystem();
  const { vars, skipped } = buildCssVarMap(system, "light");
  for (const key of Object.keys(vars)) {
    assert.ok(key.startsWith("--pv-"), `scoped: ${key}`);
  }
  assert.equal(vars["--pv-text-primary"], "#18181b");
  assert.ok(vars["--pv-font-body"]?.length, "font emitted");
  assert.ok(vars["--pv-radius-md"]?.endsWith("px"), "radius emitted");
  assert.ok(vars["--pv-duration-normal"]?.endsWith("ms"), "duration emitted");
  assert.deepEqual(skipped, [], "starter values are all safe");
  // Hostile values never reach CSS: crafted literal resolves but is skipped.
  const hostile: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens,
      { id: "custom.evil", label: "Evil", category: "custom", value: "16px; color: red" },
    ],
  };
  assert.equal(resolveToken(hostile, "custom.evil").status, "resolved");
  const hostileVars = buildCssVarMap(hostile, "light");
  assert.ok(!("custom-evil" in hostileVars.vars) && !("--pv-custom-evil" in hostileVars.vars));
  assert.ok(hostileVars.skipped.includes("custom.evil"));
  assert.equal(isSafeCssValue("#ffffff"), true);
  assert.equal(isSafeCssValue("16px"), true);
  assert.equal(isSafeCssValue("cubic-bezier(0.4, 0, 0.2, 1)"), true);
  assert.equal(isSafeCssValue("16px; color: red"), false);
  assert.equal(isSafeCssValue(""), false);
});

test("selected preview width resolves the correct breakpoint/Grid profile", () => {
  const system = manthanSystem();
  const expectations = [
    { width: 390, breakpoint: "base", columns: 4 },
    { width: 768, breakpoint: "md", columns: 8 },
    { width: 1024, breakpoint: "lg", columns: 12 },
    { width: 1440, breakpoint: "xl", columns: 12 },
  ] as const;
  for (const { width, breakpoint, columns } of expectations) {
    const layout = resolveActiveLayout(system, width);
    assert.equal(layout.breakpointId, breakpoint, `${width}px`);
    assert.equal(layout.columns, columns, `${width}px`);
    assert.ok(layout.gutterPx !== null && layout.gutterPx > 0, `${width}px gutter`);
    assert.ok(layout.containerMaxPx !== null && layout.containerMaxPx > 0, `${width}px container`);
  }
  // A theme edit never changes layout activation.
  const themed = setOverride(system, "dark", "text.primary", "neutral.50");
  assert.equal(themed.ok, true);
  if (!themed.ok) return;
  assert.deepEqual(resolveActiveLayout(themed.system, 1024), resolveActiveLayout(system, 1024));
});

test("threshold edits shift layout activation (no profile loss)", () => {
  const system = manthanSystem();
  const moved = updateBreakpointValue(system, "lg", 1100, "px");
  assert.equal(moved.ok, true);
  if (!moved.ok) return;
  assert.equal(resolveActiveLayout(moved.system, 1099).breakpointId, "md");
  const at1100 = resolveActiveLayout(moved.system, 1100);
  assert.equal(at1100.breakpointId, "lg");
  // The Grid profile travels with its breakpoint id, untouched.
  assert.equal(at1100.columns, resolveActiveLayout(system, 1024).columns);
  assert.equal(at1100.gutterToken, resolveActiveLayout(system, 1024).gutterToken);
});

test("component-token overrides resolve correctly when present", () => {
  const system = manthanSystem();
  const primary = resolveComponentSlot(system, "Button", "background", {
    variant: "primary",
    themeId: "light",
  });
  assert.equal(primary.status, "resolved");
  assert.equal(primary.provenance, "component-override");
  assert.equal(primary.overrideValue, "action.primary.background");
  assert.equal(primary.final, resolveToken(system, "action.primary.background", "light").value);
  // Dialog shadow is a recipe id: resolves through the shadow pipeline.
  const shadow = resolveComponentSlot(system, "Dialog", "shadow", { themeId: "light" });
  assert.equal(shadow.status, "resolved");
  assert.ok((shadow.final ?? "").length > 0);
  // Unknown component/slot degrades to a structured miss, never throws.
  const miss = resolveComponentSlot(system, "Ghost", "background", { themeId: "light" });
  assert.equal(miss.status, "unresolved");
  assert.equal(miss.final, null);
});

test("preview diagnostics report unresolved/circular values without throwing", () => {
  const broken: DesignSystemConfig = {
    ...manthanSystem(),
    semanticTokens: [
      ...manthanSystem().semanticTokens,
      { id: "custom.broken", label: "Broken", category: "custom", value: "ghost.500" },
      { id: "loop.a", label: "Loop A", category: "custom", value: "loop.b" },
      { id: "loop.b", label: "Loop B", category: "custom", value: "loop.a" },
    ],
  };
  const diagnostics = collectDiagnostics(broken, "light");
  assert.ok(diagnostics.unresolved.includes("custom.broken"));
  assert.ok(diagnostics.circular.includes("loop.a"));
  assert.ok(diagnostics.circular.includes("loop.b"));
  // Full-model resolution still returns (degraded sections, no throw).
  const model = resolvePreview(broken, "light", 1024);
  assert.equal(model.semantics["custom.broken"]?.status, "unresolved");
  assert.equal(model.semantics["loop.a"]?.status, "circular");
  assert.equal(model.layout.breakpointId, "lg");
  assert.ok(model.cssVars["--pv-text-primary"]?.length);
});

test("preview state changes do not mutate the original system object", () => {
  const system = manthanSystem();
  const snapshot = JSON.stringify(system);
  resolvePreview(system, "dark", 390);
  resolvePreview(system, "light", 1440, { osPrefersReduced: true });
  buildCssVarMap(system, "dark");
  collectDiagnostics(system, "dark");
  resolveComponentSlot(system, "Button", "background", { variant: "primary", themeId: "dark" });
  assert.equal(JSON.stringify(system), snapshot);
});

test("reduced-motion policy yields reduced/disabled non-essential transitions", () => {
  const system = manthanSystem();
  const full = previewMotion(system, false);
  assert.equal(full.reduce, false);
  assert.ok(full.transition.includes("ms"), full.transition);
  assert.ok((full.durationMs ?? 0) > 0);
  const osReduced = previewMotion(system, true);
  assert.equal(osReduced.reduce, true);
  assert.equal(osReduced.transition, "none");
  const forced: DesignSystemConfig = {
    ...system,
    foundations: { ...system.foundations, motion: { ...system.foundations.motion, reducedMotion: "reduce-all" } },
  };
  const policy = previewMotion(forced, false);
  assert.equal(policy.reduce, true);
  assert.equal(policy.transition, "none");
});

test("token-inspector output identifies base/theme/component provenance", () => {
  const system = customThemedSystem();
  // Theme override provenance.
  const themed = resolveComponentSlot(system, "Button", "background", {
    variant: "primary",
    themeId: "midnight",
  });
  assert.equal(themed.provenance, "component-override");
  const semantics = resolveSemanticsForTheme(system, "midnight");
  assert.equal(semantics["text.primary"]?.provenance, "theme-override");
  assert.equal(semantics["overlay.scrim"]?.provenance, "base-semantic");
  // Component override pointing at a theme-overridden token still reports
  // the component layer as the deciding layer.
  const aliased: DesignSystemConfig = {
    ...system,
    components: [
      ...system.components,
      { component: "Card", label: "Card", overrides: [{ token: "foreground", value: "text.primary" }] },
    ],
  };
  const cardFg = resolveComponentSlot(aliased, "Card", "foreground", { themeId: "midnight" });
  assert.equal(cardFg.provenance, "component-override");
  assert.equal(cardFg.final, "#000001");
});
