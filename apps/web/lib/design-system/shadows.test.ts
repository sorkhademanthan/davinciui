// Focused Shadows tests (Step 7D). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDesignSystem, type DesignSystemConfig, type ShadowToken } from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  addShadowLayer,
  applyShadowPreset,
  canDeleteShadowRecipe,
  canDisableShadowRecipe,
  createShadowRecipe,
  cssForLayers,
  diffShadowTokens,
  duplicateShadowRecipe,
  findShadowReferences,
  hasCustomShadowEdits,
  humanShadowLabel,
  layersResolve,
  moveShadowLayer,
  parseLayer,
  removeShadowLayer,
  removeShadowRecipe,
  resetShadowToStarter,
  resolveShadow,
  restoreStarterShadows,
  setShadowEnabled,
  SHADOW_PRESETS,
  shadowIssues,
  slugifyShadowId,
  updateShadowLayer,
  updateShadowRecipe,
  withOpacity,
} from "./shadows";

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

/** Blank "Manthan" system with shadow.md wired to a component token. */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  return {
    ...system,
    components: [
      ...system.components,
      {
        component: "dialog",
        label: "Dialog",
        overrides: [{ token: "shadow", value: "shadow.md" }],
      },
    ],
  };
}

function tokenIds(system: DesignSystemConfig): string[] {
  return (system.foundations.shadows?.tokens ?? []).map((token) => token.id);
}

test("starter shadow recipes are valid", () => {
  // Blank carries the full six-token scale; other starters keep intentional subsets.
  const blank = createSystemFromStarter({ starterId: "blank", name: "Probe" });
  for (const id of ["shadow.none", "shadow.xs", "shadow.sm", "shadow.md", "shadow.lg", "shadow.xl"]) {
    assert.ok((blank.foundations.shadows?.tokens ?? []).some((token) => token.id === id), `blank: ${id}`);
  }
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    const tokens = system.foundations.shadows?.tokens ?? [];
    assert.ok(tokens.length > 0, `${starter}: non-empty scale`);
    for (const token of tokens) {
      const check = layersResolve(system, token.layers ?? []);
      assert.equal(check.ok, true, `${starter} ${token.id}: colors resolve`);
      const resolved = resolveShadow(system, token.id);
      assert.ok(resolved, `${starter} ${token.id}: resolves`);
      assert.ok(typeof resolved!.css === "string" && resolved!.css.length > 0, `${starter} ${token.id}: css`);
    }
    assert.deepEqual(shadowIssues(system), [], `${starter}: no shadow issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("one-layer and multi-layer recipes resolve to valid CSS output", () => {
  const system = manthanSystem();
  const single = resolveShadow(system, "shadow.sm");
  assert.ok(single);
  assert.equal(single!.css, "0px 1px 2px 0px rgb(25 25 27 / 0.05)");
  assert.deepEqual(single!.colors, ["rgb(25 25 27 / 0.05)"]);

  const multi = resolveShadow(system, "shadow.md");
  assert.ok(multi);
  assert.equal(
    multi!.css,
    "0px 4px 6px -1px rgb(25 25 27 / 0.1), 0px 2px 4px -2px rgb(25 25 27 / 0.1)",
  );
  assert.equal(multi!.colors.length, 2);

  const none = resolveShadow(system, "shadow.none");
  assert.ok(none);
  assert.equal(none!.css, "none");

  // Raw hex at full opacity passes through untouched.
  assert.equal(withOpacity("#ff0000", 1), "#ff0000");
  assert.equal(withOpacity("#ff0000", 0.5), "rgb(255 0 0 / 0.5)");
  assert.equal(withOpacity("red", 0.5), "color-mix(in srgb, red 50%, transparent)");

  // Unknown ids and disabled recipes do not resolve.
  assert.equal(resolveShadow(system, "shadow.ghost"), null);
  const disabled = updateShadowRecipe(system, "shadow.md", { enabled: false });
  assert.equal(disabled.ok, true);
  if (!disabled.ok) return;
  assert.equal(resolveShadow(disabled.system, "shadow.md"), null);
});

test("editing a layer persists after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const before = manthanSystem();
  const token = before.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  const patched = updateShadowLayer(token, 0, { y: 12, opacity: 0.2 });
  assert.ok(patched);
  assert.equal(patched!.layers?.[0]?.y, 12);
  assert.equal(patched!.layers?.[0]?.opacity, 0.2);
  // Original untouched (pure update).
  assert.equal(token.layers?.[0]?.y, 4);
  const updated = updateShadowRecipe(before, "shadow.md", { layers: patched!.layers });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  const saved = store.save(updated.system);
  assert.equal(saved.ok, true);

  const reloaded = createDesignSystemsStore(() => mem).get(before.id);
  assert.ok(reloaded);
  const roundTripped = reloaded!.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  assert.equal(roundTripped.layers?.[0]?.y, 12);
  assert.equal(roundTripped.layers?.[0]?.opacity, 0.2);
  assert.ok(roundTripped.value.includes("12px"));
});

test("custom recipe ids remain unique", () => {
  const system = manthanSystem();
  const ids = tokenIds(system);
  const created = createShadowRecipe(system, {
    label: "Gentle lift!",
    layers: [{ x: 0, y: 2, blur: 4, spread: 0, color: "neutral.300", opacity: 0.12, inset: false }],
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "gentle-lift");
  assert.ok(created.token.value.includes("4px"));

  const explicit = createShadowRecipe(system, { id: "my-lift", label: "ignored", layers: [] });
  assert.equal(explicit.ok, true);
  if (!explicit.ok) return;
  assert.equal(explicit.token.id, "my-lift");
  assert.equal(explicit.token.value, "none");

  // Dots slugify to dashes, so "shadow.md" becomes the distinct "shadow-md".
  const dotted = createShadowRecipe(system, { id: "shadow.md", label: "x" });
  assert.equal(dotted.ok, true);
  if (!dotted.ok) return;
  assert.equal(dotted.token.id, "shadow-md");
  // A genuine collision with an existing id is rejected.
  const withBoth: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      shadows: { tokens: [...system.foundations.shadows.tokens, created.token] },
    },
  };
  assert.equal(createShadowRecipe(withBoth, { id: "gentle-lift", label: "x" }).ok, false);
  assert.equal(createShadowRecipe(system, { id: "!!", label: "x" }).ok, false);
  assert.equal(createShadowRecipe(system, { label: "   " }).ok, false);
  assert.equal(slugifyShadowId("  ", []), "token");
  assert.equal(slugifyShadowId("Lift", ["lift"]), "lift-2");
  assert.equal(humanShadowLabel("my-lift"), "My lift");
});

test("malformed values are rejected", () => {
  assert.equal(parseLayer(null), null);
  assert.equal(parseLayer({ x: 0, y: "4", blur: 4, spread: 0, color: "neutral.950", opacity: 0.1, inset: false }), null);
  assert.equal(parseLayer({ x: 0, y: 4, blur: -1, spread: 0, color: "neutral.950", opacity: 0.1, inset: false }), null);
  assert.equal(parseLayer({ x: 0, y: 4, blur: 500, spread: 0, color: "neutral.950", opacity: 0.1, inset: false }), null);
  assert.equal(parseLayer({ x: 0, y: 4, blur: 4, spread: 200, color: "neutral.950", opacity: 0.1, inset: false }), null);
  assert.equal(parseLayer({ x: 0, y: 4, blur: 4, spread: 0, color: "neutral.950", opacity: 2, inset: false }), null);
  assert.equal(parseLayer({ x: 0, y: 4, blur: 4, spread: 0, color: "", opacity: 0.1, inset: false }), null);
  assert.equal(parseLayer({ x: NaN, y: 4, blur: 4, spread: 0, color: "neutral.950", opacity: 0.1, inset: false }), null);
  assert.ok(parseLayer({ x: 0, y: 4, blur: 4, spread: 0, color: "neutral.950", opacity: 0.1, inset: true }));

  const system = manthanSystem();
  // Unresolvable layer colors are rejected on create and update.
  assert.equal(
    createShadowRecipe(system, {
      label: "Bad",
      layers: [{ x: 0, y: 4, blur: 4, spread: 0, color: "missing.999", opacity: 0.1, inset: false }],
    }).ok,
    false,
  );
  assert.equal(updateShadowRecipe(system, "shadow.md", { label: "   " }).ok, false);
  const token = system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  assert.equal(updateShadowLayer(token, 9, { y: 1 }), null);
  assert.equal(updateShadowLayer(token, 0, { blur: -5 }), null);
  assert.equal(removeShadowLayer(token, 9), null);
  assert.equal(moveShadowLayer(token, 0, -1), null);
  assert.equal(moveShadowLayer(token, 5, 1), null);
});

test("layer reordering persists deterministically", () => {
  const system = manthanSystem();
  const token = system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  assert.equal(token.layers?.length, 2);
  const moved = moveShadowLayer(token, 1, -1);
  assert.ok(moved);
  assert.equal(moved!.layers?.[0]?.y, 2);
  assert.equal(moved!.layers?.[1]?.y, 4);
  // Untouched original.
  assert.equal(token.layers?.[0]?.y, 4);

  const updated = updateShadowRecipe(system, "shadow.md", { layers: moved!.layers });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  assert.equal(store.save(updated.system).ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(system.id)!;
  const roundTripped = reloaded.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  assert.deepEqual(
    roundTripped.layers?.map((layer) => layer.y),
    [2, 4],
  );
  assert.ok(roundTripped.value.startsWith("0px 2px"));
});

test("duplicate recipe is independent from the original", () => {
  const system = manthanSystem();
  const copy = duplicateShadowRecipe(system, "shadow.md");
  assert.ok(copy);
  assert.equal(copy!.id, "shadow.md-copy");
  assert.equal(copy!.label, "Medium copy");
  assert.deepEqual(copy!.layers, system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!.layers);
  assert.ok(copy!.layers && copy!.layers.length > 0);
  copy!.layers![0]!.y = 99;
  assert.equal(
    system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!.layers?.[0]?.y,
    4,
  );
  const copy2 = duplicateShadowRecipe(
    { ...system, foundations: { ...system.foundations, shadows: { tokens: [...system.foundations.shadows.tokens, copy!] } } },
    "shadow.md",
  );
  assert.equal(copy2!.id, "shadow.md-copy-2");
  assert.equal(duplicateShadowRecipe(system, "shadow.ghost"), null);
});

test("adding and removing layers works", () => {
  const system = manthanSystem();
  const token = system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.sm")!;
  const added = addShadowLayer(token, { x: 0, y: 8, blur: 12, spread: 0, color: "#123456", opacity: 0.15, inset: false });
  assert.equal(added.layers?.length, 2);
  assert.equal(added.layers?.[1]?.color, "#123456");
  // Malformed additions fall back to a safe default layer, never garbage.
  const fallback = addShadowLayer(token, { x: NaN, y: 0, blur: 0, spread: 0, color: "", opacity: 0, inset: false });
  assert.equal(fallback.layers?.length, 2);
  assert.equal(fallback.layers?.[1]?.color, "neutral.950");
  const removed = removeShadowLayer(added, 0);
  assert.ok(removed);
  assert.equal(removed!.layers?.length, 1);
  assert.equal(removed!.layers?.[0]?.y, 8);
});

test("deleting an unused recipe works", () => {
  const system = manthanSystem();
  const created = createShadowRecipe(system, {
    label: "Gentle lift",
    layers: [{ x: 0, y: 2, blur: 4, spread: 0, color: "neutral.300", opacity: 0.12, inset: false }],
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withExtra: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      shadows: { tokens: [...system.foundations.shadows.tokens, created.token] },
    },
  };
  assert.deepEqual(canDeleteShadowRecipe(withExtra, created.token.id), { ok: true });
  const removed = removeShadowRecipe(withExtra, created.token.id);
  assert.ok(!removed.foundations.shadows.tokens.some((token) => token.id === created.token.id));
});

test("deleting a referenced recipe is blocked", () => {
  const system = manthanSystem();
  const references = findShadowReferences(system, "shadow.md");
  assert.equal(references.length, 1);
  assert.equal(references[0]?.kind, "component");
  assert.equal(references[0]?.pointer, "Dialog.shadow");
  const guard = canDeleteShadowRecipe(system, "shadow.md");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("shadow.md is used by 1 token (Dialog.shadow)"));
  assert.deepEqual(guard.references, references);

  // Disabling the last usable recipe is blocked; disabling a spare is fine.
  const solo: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      shadows: {
        tokens: system.foundations.shadows.tokens.map((token, index) =>
          index === 0 ? token : { ...token, enabled: false },
        ),
      },
    },
  };
  const onlyId = solo.foundations.shadows.tokens[0]!.id;
  assert.equal(canDisableShadowRecipe(solo, onlyId).ok, false);
  assert.equal(canDisableShadowRecipe(system, "shadow.xl").ok, true);
  const disabled = setShadowEnabled(system, "shadow.xl", false);
  assert.equal(disabled.ok, true);
  if (!disabled.ok) return;
  assert.equal(resolveShadow(disabled.system, "shadow.xl"), null);

  // Unknown ids cannot be deleted either.
  assert.equal(canDeleteShadowRecipe(system, "shadow.ghost").ok, false);
});

test("applying an elevation preset requires confirmation when custom edits exist", () => {
  const pristine = manthanSystem();
  assert.equal(hasCustomShadowEdits(pristine), false);
  const token = pristine.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  const patched = updateShadowLayer(token, 0, { y: 99 });
  assert.ok(patched);
  const editedResult = updateShadowRecipe(pristine, "shadow.md", { layers: patched!.layers });
  assert.equal(editedResult.ok, true);
  if (!editedResult.ok) return;
  assert.equal(hasCustomShadowEdits(editedResult.system), true);

  const preset = SHADOW_PRESETS.find((entry) => entry.id === "elevated")!;
  const diff = diffShadowTokens(
    editedResult.system.foundations.shadows.tokens,
    preset.tokens,
  );
  assert.ok(diff.changed.some((entry) => entry.id === "shadow.md"));

  const applied = applyShadowPreset(editedResult.system, preset);
  assert.equal(
    applied.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")?.layers?.[0]?.y,
    8,
  );
  assert.deepEqual(shadowIssues(applied), []);
});

test("reset one recipe affects only that recipe", () => {
  const before = manthanSystem();
  const token = before.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  const patched = updateShadowLayer(token, 0, { y: 99 });
  assert.ok(patched);
  const renamed = updateShadowRecipe(before, "shadow.md", { label: "Custom", layers: patched!.layers });
  assert.equal(renamed.ok, true);
  if (!renamed.ok) return;
  const smPatched = updateShadowLayer(
    renamed.system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.sm")!,
    0,
    { y: 42 },
  );
  const smEdited = updateShadowRecipe(renamed.system, "shadow.sm", { layers: smPatched!.layers });
  assert.equal(smEdited.ok, true);
  if (!smEdited.ok) return;

  const reset = resetShadowToStarter(smEdited.system, "shadow.md");
  assert.ok(reset);
  const md = reset!.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  assert.equal(md.label, "Medium");
  assert.equal(md.layers?.[0]?.y, 4);
  // The sibling edit survives.
  assert.equal(reset!.foundations.shadows.tokens.find((entry) => entry.id === "shadow.sm")?.layers?.[0]?.y, 42);
  assert.equal(resetShadowToStarter(smEdited.system, "shadow.custom"), null);
});

test("full restore returns starter shadow defaults after confirmation", () => {
  const editedResult = updateShadowRecipe(manthanSystem(), "shadow.md", { label: "Custom" });
  assert.equal(editedResult.ok, true);
  if (!editedResult.ok) return;
  const restored = restoreStarterShadows(editedResult.system);
  assert.deepEqual(
    restored.foundations.shadows.tokens.map((token) => token.id),
    ["shadow.none", "shadow.xs", "shadow.sm", "shadow.md", "shadow.lg", "shadow.xl"],
  );
  assert.equal(restored.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")?.label, "Medium");
  assert.deepEqual(shadowIssues(restored), []);
  // The fixture's dialog component references shadow.md, which the Step 1
  // resolver intentionally reports as a warning (not an error).
  assert.deepEqual(
    validateDesignSystem(restored).filter((issue) => issue.severity === "error"),
    [],
  );
});

test("preview resolution changes after a shadow update", () => {
  const system = manthanSystem();
  const before = resolveShadow(system, "shadow.md");
  assert.ok(before);
  const token = system.foundations.shadows.tokens.find((entry) => entry.id === "shadow.md")!;
  const patched = updateShadowLayer(token, 0, { opacity: 0.4 });
  assert.ok(patched);
  const updated = updateShadowRecipe(system, "shadow.md", { layers: patched!.layers });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  const after = resolveShadow(updated.system, "shadow.md");
  assert.ok(after);
  assert.notEqual(after!.css, before!.css);
  assert.ok(after!.css.includes("/ 0.4)"));
  // Layer add/remove also flow through.
  const added = addShadowLayer(token, { x: 0, y: 1, blur: 1, spread: 0, color: "#ffffff", opacity: 1, inset: false });
  assert.equal(cssForLayers(system, added.layers ?? [])?.split(",").length, 3);
  assert.equal(cssForLayers(system, []), "none");
  assert.equal(cssForLayers(system, [{ x: 0, y: 1, blur: 1, spread: 0, color: "missing.999", opacity: 1, inset: false }]), null);
});

test("legacy value-only tokens keep rendering", () => {
  const system = manthanSystem();
  const legacy: ShadowToken = { id: "shadow.legacy", label: "Legacy", value: "0 2px 8px rgba(0,0,0,.2)" };
  const extended: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      shadows: { tokens: [...system.foundations.shadows.tokens, legacy] },
    },
  };
  const resolved = resolveShadow(extended, "shadow.legacy");
  assert.ok(resolved);
  assert.equal(resolved!.css, "0 2px 8px rgba(0,0,0,.2)");
  assert.deepEqual(
    validateDesignSystem(extended).filter((issue) => issue.severity === "error"),
    [],
  );
});
