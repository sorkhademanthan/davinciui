// Focused Borders tests (Step 7C). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDesignSystem, type DesignSystemConfig } from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  applyBorderPreset,
  availableStyles,
  BORDER_PRESETS,
  borderIssues,
  canDeleteBorderRecipe,
  canDeleteWidthToken,
  createBorderRecipe,
  createWidthToken,
  defaultBorderStyle,
  diffBorders,
  duplicateBorderRecipe,
  findRecipeReferences,
  formatBorderWidth,
  hasCustomBorderEdits,
  parseBorderWidth,
  removeBorderRecipe,
  removeWidthToken,
  resetRecipeToStarter,
  resetWidthToStarter,
  resolveBorderColor,
  resolveBorderRecipe,
  resolveBorderStyle,
  resolveBorderWidth,
  restoreStarterBorders,
  setDefaultStyle,
  setStyleEnabled,
  updateBorderRecipe,
  updateWidthValue,
} from "./borders";

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const data = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

/** Blank "Manthan" system with border.default wired to a component token. */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  return {
    ...system,
    components: [
      ...system.components,
      {
        component: "input",
        label: "Input",
        overrides: [{ token: "border", value: "border.default" }],
      },
    ],
  };
}

test("starter width, style, and recipe configuration is valid", () => {
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    const widths = system.foundations.borders.widths;
    for (const key of ["none", "hairline", "thin", "default", "medium", "thick"]) {
      assert.ok(key in widths, `${starter}: width ${key}`);
      assert.ok(parseBorderWidth(widths[key]) !== null, `${starter}: width ${key} parses`);
    }
    assert.deepEqual(
      Object.keys(system.foundations.borders.styles).sort(),
      ["dashed", "dotted", "none", "solid"],
      `${starter}: styles`,
    );
    for (const id of ["border.subtle", "border.default", "border.strong", "border.focus", "border.error"]) {
      assert.ok(system.foundations.borders.tokens.some((token) => token.id === id), `${starter}: ${id}`);
    }
    assert.deepEqual(borderIssues(system), [], `${starter}: no border issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("recipes resolve width, style, and palette-shade color references", () => {
  const system = manthanSystem();
  const resolved = resolveBorderRecipe(system, "border.default");
  assert.ok(resolved);
  assert.equal(resolved!.width, "1px");
  assert.equal(resolved!.style, "solid");
  assert.ok(/^#[0-9a-f]{6}$/i.test(resolved!.color), `hex color, got ${resolved!.color}`);
  assert.equal(resolved!.css, `${resolved!.width} ${resolved!.style} ${resolved!.color}`);

  // Semantic alias in the focus recipe.
  const focus = resolveBorderRecipe(system, "border.focus");
  assert.ok(focus);
  assert.equal(focus!.width, "2px");

  // Legacy raw widths still resolve.
  assert.equal(resolveBorderWidth(system, "3px"), "3px");
  assert.equal(resolveBorderWidth(system, "nope"), null);
  assert.equal(resolveBorderStyle(system, "dashed"), "dashed");
  assert.equal(resolveBorderStyle(system, "groove"), null);
  assert.equal(resolveBorderColor(system, "#ABCDEF"), "#ABCDEF");
  assert.equal(resolveBorderColor(system, "missing.999"), null);
  assert.equal(resolveBorderRecipe(system, "border.ghost"), null);
});

test("width editing persists after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const edited = updateWidthValue(manthanSystem(), "default", 3, "px");
  const saved = store.save(edited);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.id);
  assert.ok(reloaded);
  assert.equal(reloaded!.foundations.borders.widths["default"], "3px");
  assert.equal(reloaded!.foundations.borders.widths["thin"], "1px");
});

test("custom width and recipe ids are unique", () => {
  const system = manthanSystem();
  const widthIds = Object.keys(system.foundations.borders.widths);
  const created = createWidthToken({ label: "Chunky!", amount: 6, unit: "px" }, widthIds);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.id, "chunky");
  assert.equal(created.value, "6px");
  assert.equal(createWidthToken({ id: "thin", amount: 1, unit: "px" }, widthIds).ok, false);
  assert.equal(createWidthToken({ id: "!!", amount: 1, unit: "px" }, widthIds).ok, false);
  assert.equal(createWidthToken({ amount: 1, unit: "px" }, widthIds).ok, false);
  assert.equal(createWidthToken({ label: "x", amount: -1, unit: "px" }, widthIds).ok, false);

  const recipeIds = system.foundations.borders.tokens.map((token) => token.id);
  const recipe = createBorderRecipe(system, { label: "Card Pop", width: "thin", style: "dashed", color: "neutral.300" });
  assert.equal(recipe.ok, true);
  if (!recipe.ok) return;
  assert.equal(recipe.token.id, "card-pop");
  // Dots slugify to dashes, so this stays distinct from "border.default".
  const dotted = createBorderRecipe(system, { label: "x", width: "thin", style: "solid", color: "neutral.200", id: "border.default" });
  assert.equal(dotted.ok, true);
  if (!dotted.ok) return;
  assert.equal(dotted.token.id, "border-default");
  // A genuine collision with an existing id is rejected.
  const withBoth: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      borders: { ...system.foundations.borders, tokens: [...system.foundations.borders.tokens, recipe.token] },
    },
  };
  assert.equal(createBorderRecipe(withBoth, { label: "x", width: "thin", style: "solid", color: "neutral.200", id: "card-pop" }).ok, false);
});

test("invalid widths, styles, and references are rejected", () => {
  const system = manthanSystem();
  assert.deepEqual(parseBorderWidth("2px"), { amount: 2, unit: "px" });
  assert.deepEqual(parseBorderWidth("0.5rem"), { amount: 0.5, unit: "rem" });
  assert.deepEqual(parseBorderWidth("4"), { amount: 4, unit: "px" });
  assert.deepEqual(parseBorderWidth("0"), { amount: 0, unit: "px" });
  for (const bad of ["-1px", "auto", "2em", "2pt", "", "px", "100px", "5rem", null, undefined, 2]) {
    assert.equal(parseBorderWidth(bad), null, JSON.stringify(bad));
  }
  assert.equal(formatBorderWidth({ amount: 2, unit: "px" }), "2px");

  // Unknown width keys, styles, and colors are rejected on create and update.
  assert.equal(createBorderRecipe(system, { label: "x", width: "chunky", style: "solid", color: "neutral.200" }).ok, false);
  assert.equal(createBorderRecipe(system, { label: "x", width: "thin", style: "groove", color: "neutral.200" }).ok, false);
  assert.equal(createBorderRecipe(system, { label: "x", width: "thin", style: "solid", color: "missing.999" }).ok, false);
  assert.equal(updateBorderRecipe(system, "border.default", { width: "nope" }).ok, false);
  assert.equal(updateBorderRecipe(system, "border.default", { style: "groove" }).ok, false);
  assert.equal(updateBorderRecipe(system, "border.default", { label: "   " }).ok, false);
  assert.equal(updateBorderRecipe(system, "border.ghost", { label: "x" }).ok, false);
  // Raw hex is an allowed documented fallback.
  const hexed = updateBorderRecipe(system, "border.default", { color: "#123456" });
  assert.equal(hexed.ok, true);

  // Style availability guards.
  assert.equal(setDefaultStyle(system, "groove").ok, false);
  const disabled = setStyleEnabled(system, "dashed", false);
  assert.equal(disabled.ok, true);
  assert.ok(!availableStyles(disabled.ok ? disabled.system : system).includes("dashed"));
  assert.equal(defaultBorderStyle(system), "solid");
  const changed = setDefaultStyle(system, "dashed");
  assert.equal(changed.ok, true);
});

test("recipe updates change preview resolution", () => {
  const system = manthanSystem();
  const before = resolveBorderRecipe(system, "border.default");
  assert.ok(before);
  const updated = updateBorderRecipe(system, "border.default", { width: "medium", style: "dashed", color: "neutral.400" });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  const after = resolveBorderRecipe(updated.system, "border.default");
  assert.ok(after);
  assert.notDeepEqual(after, before);
  assert.equal(after!.css, "2px dashed " + after!.color);
  // Renaming the label never touches the stable id.
  const renamed = updateBorderRecipe(updated.system, "border.default", { label: "Everyday border" });
  assert.equal(renamed.ok, true);
  if (!renamed.ok) return;
  const dupe = duplicateBorderRecipe(renamed.system, "border.default");
  assert.ok(dupe);
  assert.equal(dupe!.id, "border.default-copy");
  assert.equal(dupe!.label, "Everyday border copy");
  assert.equal(duplicateBorderRecipe(renamed.system, "border.ghost"), null);
});

test("deleting an unused custom width and recipe works", () => {
  const system = manthanSystem();
  const widthIds = Object.keys(system.foundations.borders.widths);
  const created = createWidthToken({ label: "Chunky", amount: 6, unit: "px" }, widthIds);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withWidth: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      borders: {
        ...system.foundations.borders,
        widths: { ...system.foundations.borders.widths, [created.id]: created.value },
      },
    },
  };
  assert.deepEqual(canDeleteWidthToken(withWidth, created.id), { ok: true });
  const removedWidth = removeWidthToken(withWidth, created.id);
  assert.ok(!(created.id in removedWidth.foundations.borders.widths));

  const recipe = createBorderRecipe(system, { label: "Card Pop", width: "thin", style: "dashed", color: "neutral.300" });
  assert.equal(recipe.ok, true);
  if (!recipe.ok) return;
  const withRecipe: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      borders: { ...system.foundations.borders, tokens: [...system.foundations.borders.tokens, recipe.token] },
    },
  };
  assert.deepEqual(canDeleteBorderRecipe(withRecipe, recipe.token.id), { ok: true });
  const removed = removeBorderRecipe(withRecipe, recipe.token.id);
  assert.ok(!removed.foundations.borders.tokens.some((token) => token.id === recipe.token.id));
});

test("deleting referenced widths and recipes is blocked", () => {
  const system = manthanSystem();
  // Starter components already reference border.default (Button, Input, ...),
  // plus the Input override wired by this fixture.
  const references = findRecipeReferences(system, "border.default");
  assert.ok(references.length >= 2, `expected live references, got ${references.length}`);
  assert.ok(references.some((reference) => reference.pointer === "Input.border"));
  const guard = canDeleteBorderRecipe(system, "border.default");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("border.default is used by"));
  assert.ok(guard.reasons[0]?.includes("Input.border"));
  assert.deepEqual(guard.references, references);
  // Width "default" is referenced by the border.default recipe itself.
  const widthGuard = canDeleteWidthToken(system, "default");
  assert.equal(widthGuard.ok, false);
  if (!widthGuard.ok) {
    assert.ok(widthGuard.reasons[0]?.includes("border.default"));
  }
  // Disabling a style used by recipes is blocked, with dependency detail.
  const toggle = setStyleEnabled(system, "solid", false);
  assert.equal(toggle.ok, false);
  // Unknown ids cannot be deleted.
  assert.equal(canDeleteBorderRecipe(system, "border.ghost").ok, false);
  assert.equal(canDeleteWidthToken(system, "ghost").ok, false);
});

test("changing a palette shade updates the resolved border recipe color", () => {
  const system = manthanSystem();
  const before = resolveBorderColor(system, "neutral.200");
  assert.ok(before);
  const edited: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      colors: {
        palettes: system.foundations.colors.palettes.map((palette) =>
          palette.id === "neutral" ? { ...palette, shades: { ...palette.shades, "200": "#123456" } } : palette,
        ),
      },
    },
  };
  assert.equal(resolveBorderColor(edited, "neutral.200"), "#123456");
  assert.equal(resolveBorderRecipe(edited, "border.default")?.color, "#123456");
  assert.notEqual(resolveBorderRecipe(edited, "border.default")?.color, before);
});

test("preset application requires confirmation when custom edits exist", () => {
  const pristine = manthanSystem();
  assert.equal(hasCustomBorderEdits(pristine), false);
  const edited = updateWidthValue(pristine, "default", 3, "px");
  assert.equal(hasCustomBorderEdits(edited), true);

  const preset = BORDER_PRESETS.find((entry) => entry.id === "product")!;
  const diff = diffBorders(
    { widths: edited.foundations.borders.widths, tokens: edited.foundations.borders.tokens },
    { widths: preset.widths, tokens: preset.recipes },
  );
  assert.ok(diff.widthsChanged.some((entry) => entry.id === "default" && entry.from === "3px" && entry.to === "1px"));

  const applied = applyBorderPreset(edited, preset);
  assert.equal(applied.foundations.borders.widths["default"], "1px");
  assert.equal(applied.foundations.borders.defaultStyle, "solid");
  assert.deepEqual(borderIssues(applied), []);
});

test("reset one token affects only that token", () => {
  const edited = updateWidthValue(manthanSystem(), "default", 9, "px");
  const reset = resetWidthToStarter(edited, "default");
  assert.ok(reset);
  assert.equal(reset!.foundations.borders.widths["default"], "1px");
  assert.equal(reset!.foundations.borders.widths["thin"], edited.foundations.borders.widths["thin"]);
  assert.equal(resetWidthToStarter(edited, "custom-thing"), null);

  const renamed = updateBorderRecipe(edited, "border.default", { label: "Custom", width: "thick", color: "#123456" });
  assert.equal(renamed.ok, true);
  if (!renamed.ok) return;
  const recipeReset = resetRecipeToStarter(renamed.system, "border.default");
  assert.ok(recipeReset);
  assert.equal(recipeReset!.foundations.borders.tokens.find((token) => token.id === "border.default")?.width, "default");
  assert.equal(recipeReset!.foundations.borders.tokens.find((token) => token.id === "border.default")?.label, "Default border");
  assert.equal(resetRecipeToStarter(renamed.system, "border.custom"), null);
});

test("restore starter defaults works after confirmation", () => {
  const edited = updateWidthValue(manthanSystem(), "default", 9, "px");
  const restored = restoreStarterBorders(edited);
  assert.deepEqual(restored.foundations.borders.widths["default"], "1px");
  assert.deepEqual(
    restored.foundations.borders.tokens.map((token) => token.id),
    ["border.subtle", "border.default", "border.strong", "border.focus", "border.error"],
  );
  assert.deepEqual(borderIssues(restored), []);
  assert.deepEqual(validateDesignSystem(restored), []);
});
