// Focused Theme tests (Step 9). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  canDeleteTheme,
  classifyOverrideValue,
  clearThemeOverrides,
  createTheme,
  duplicateTheme,
  ensureRequiredThemes,
  findTheme,
  formatThemeChain,
  hasCustomThemeEdits,
  insertTheme,
  invalidOverrideKeys,
  listThemes,
  removeOverride,
  removeTheme,
  resetOverrideToStarter,
  restoreThemeToStarter,
  setOverride,
  summarizeTheme,
  themeIssues,
  tokenThemeState,
  unresolvedOverrides,
  updateThemeLabel,
  updateThemeMode,
  validateOverrideValue,
  validOverrideCandidates,
  wouldOverrideCycle,
} from "./themes";

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

/** Blank "Manthan" system. */
function manthanSystem(): DesignSystemConfig {
  return createSystemFromStarter({ starterId: "blank", name: "Manthan" });
}

test("every starter has valid required Light and Dark themes", () => {
  for (const starter of ["blank", "saas", "enterprise", "editorial", "ecommerce", "dark-first"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    const light = findTheme(system, "light");
    const dark = findTheme(system, "dark");
    assert.ok(light, `${starter}: light theme`);
    assert.ok(dark, `${starter}: dark theme`);
    assert.equal(light?.mode, "light", starter);
    assert.equal(dark?.mode, "dark", starter);
    // Every baseline token resolves under both themes (inherited or overridden).
    for (const token of system.semanticTokens) {
      for (const themeId of ["light", "dark"] as const) {
        assert.equal(
          resolveToken(system, token.id, themeId).status,
          "resolved",
          `${starter} [${themeId}] ${token.id}`,
        );
      }
    }
    assert.deepEqual(themeIssues(system), [], `${starter}: no theme issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
  assert.deepEqual(
    listThemes(manthanSystem()).map((theme) => theme.id),
    ["light", "dark"],
  );
});

test("base semantic values resolve correctly with no override", () => {
  const system = manthanSystem();
  // overlay.scrim has no theme override anywhere: effective === inherited.
  for (const themeId of ["light", "dark"] as const) {
    const state = tokenThemeState(system, themeId, "overlay.scrim")!;
    assert.equal(state.override, null);
    assert.equal(state.status, "inherited");
    assert.equal(state.effectiveValue, state.inheritedValue);
    assert.equal(state.effectiveValue, "#000000");
  }
  // text.secondary is overridden for dark (readable on dark canvas) while
  // light inherits the base value.
  const lightSecondary = tokenThemeState(system, "light", "text.secondary")!;
  assert.equal(lightSecondary.override, null);
  assert.equal(lightSecondary.status, "inherited");
  const darkSecondary = tokenThemeState(system, "dark", "text.secondary")!;
  assert.equal(darkSecondary.override, "#d4d4d8");
  assert.equal(darkSecondary.status, "overridden");
  assert.equal(darkSecondary.effectiveValue, "#d4d4d8");
});

test("Light and Dark overrides resolve correctly", () => {
  const system = manthanSystem();
  // Light pins text.primary to a raw ink; dark inherits the neutral base here.
  const light = tokenThemeState(system, "light", "text.primary")!;
  assert.equal(light.override, "#18181b");
  assert.equal(light.status, "overridden");
  assert.equal(light.effectiveValue, "#18181b");
  assert.deepEqual(light.effectiveChain[0], "text.primary");
  assert.ok(light.effectiveChain.includes("#18181b"), formatThemeChain(light.effectiveChain));
  const dark = tokenThemeState(system, "dark", "text.primary")!;
  assert.equal(dark.override, "#fafafa");
  assert.equal(dark.effectiveValue, "#fafafa");
  // Same token, different effective values per theme.
  assert.notEqual(light.effectiveValue, dark.effectiveValue);
  const summary = summarizeTheme(system, "light")!;
  assert.equal(summary.mode, "light");
  assert.ok(summary.overridden > 0);
  assert.equal(summary.overridden + summary.inherited + summary.invalid, summary.total);
});

test("custom theme creation clones selected base-theme overrides independently", () => {
  const system = manthanSystem();
  const created = createTheme(system, { label: "Midnight", mode: "dark", fromThemeId: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.theme.id, "midnight");
  assert.deepEqual(created.theme.overrides, findTheme(system, "dark")!.overrides);
  const next = insertTheme(system, created.theme);
  // Mutating the clone never touches the source.
  const edited = setOverride(next, "midnight", "text.primary", "#000000");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  assert.equal(findTheme(edited.system, "dark")!.overrides["text.primary"], "#fafafa");
  assert.equal(findTheme(edited.system, "midnight")!.overrides["text.primary"], "#000000");
  // Defaults and validation reject bad creation input.
  assert.equal(createTheme(system, { label: "   ", mode: "dark" }).ok, false);
  // A required-sounding name still yields a unique non-required id.
  const lightLike = createTheme(system, { label: "Light", mode: "dark" });
  assert.equal(lightLike.ok, true);
  if (!lightLike.ok) return;
  assert.equal(lightLike.theme.id, "light-2");
  assert.equal(createTheme(system, { label: "Ghost copy", mode: "dark", fromThemeId: "ghost" }).ok, false);
  const fromLight = createTheme(system, { label: "Paper", mode: "light", fromThemeId: "light" });
  assert.equal(fromLight.ok, true);
  if (!fromLight.ok) return;
  assert.deepEqual(fromLight.theme.overrides, findTheme(system, "light")!.overrides);
});

test("editing one custom theme never mutates its source or another theme", () => {
  const first = createTheme(manthanSystem(), { label: "A", mode: "dark" });
  const second = createTheme(manthanSystem(), { label: "B", mode: "dark" });
  assert.equal(first.ok && second.ok, true);
  if (!first.ok || !second.ok) return;
  let system = insertTheme(insertTheme(manthanSystem(), first.theme), second.theme);
  const editedA = setOverride(system, first.theme.id, "background.canvas", "#111111");
  assert.equal(editedA.ok, true);
  if (!editedA.ok) return;
  system = editedA.system;
  assert.equal(findTheme(system, "dark")!.overrides["background.canvas"], "#09090b");
  // Sibling clone keeps its own cloned value, untouched by the edit to A.
  assert.equal(
    findTheme(system, second.theme.id)!.overrides["background.canvas"],
    findTheme(manthanSystem(), "dark")!.overrides["background.canvas"],
  );
  const renamed = updateThemeLabel(system, first.theme.id, "A renamed");
  assert.equal(findTheme(renamed, first.theme.id)?.label, "A renamed");
  assert.equal(findTheme(renamed, second.theme.id)?.label, "B");
  const retinted = updateThemeMode(system, first.theme.id, "light");
  assert.equal(findTheme(retinted, first.theme.id)?.mode, "light");
  assert.equal(findTheme(retinted, "dark")?.mode, "dark");
});

test("valid palette-shade and semantic-alias overrides resolve", () => {
  const system = manthanSystem();
  assert.deepEqual(classifyOverrideValue(system, "neutral.50"), {
    kind: "foundation",
    detail: "Palette shade neutral.50 (neutral)",
  });
  assert.deepEqual(classifyOverrideValue(system, "text.secondary"), {
    kind: "alias",
    detail: "Semantic alias of text.secondary",
  });
  assert.deepEqual(classifyOverrideValue(system, "#123abc"), {
    kind: "raw",
    detail: "Raw fallback #123abc",
  });
  const shaded = setOverride(system, "dark", "text.primary", "neutral.50");
  assert.equal(shaded.ok, true);
  if (!shaded.ok) return;
  assert.equal(
    resolveToken(shaded.system, "text.primary", "dark").value,
    resolveToken(shaded.system, "neutral.50").value,
  );
  const aliased = setOverride(system, "dark", "text.muted", "text.secondary");
  assert.equal(aliased.ok, true);
  if (!aliased.ok) return;
  assert.equal(
    resolveToken(aliased.system, "text.muted", "dark").value,
    resolveToken(aliased.system, "text.secondary", "dark").value,
  );
  // Base layer is untouched by theme edits.
  assert.equal(
    system.semanticTokens.find((token) => token.id === "text.primary")?.value,
    "neutral.900",
  );
});

test("malformed/unresolved override values are rejected", () => {
  const system = manthanSystem();
  for (const bad of ["", "   ", "ghost.500", "red", "12px", "neutral.9999"]) {
    assert.equal(setOverride(system, "dark", "text.primary", bad).ok, false, JSON.stringify(bad));
  }
  const result = validateOverrideValue(system, "dark", "text.primary", "ghost.500");
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.error.includes("does not match"), result.error);
  assert.equal(validateOverrideValue(system, "ghost", "text.primary", "neutral.50").ok, false);
  assert.equal(validateOverrideValue(system, "dark", "ghost.token", "neutral.50").ok, false);
  // Untouched on rejection.
  assert.equal(findTheme(system, "dark")!.overrides["text.primary"], "#fafafa");
});

test("direct and indirect override cycles are rejected", () => {
  const system = manthanSystem();
  // Direct self-reference through the theme layer.
  assert.equal(wouldOverrideCycle(system, "dark", "text.primary", "text.primary"), true);
  const direct = setOverride(system, "dark", "text.primary", "text.primary");
  assert.equal(direct.ok, false);
  if (!direct.ok) assert.ok(direct.error.includes("itself"));
  // Indirect: base text.secondary is neutral-bound, so alias text.primary at
  // text.secondary, then point text.primary back at it inside dark.
  const step1 = setOverride(system, "dark", "text.secondary", "text.primary");
  assert.equal(step1.ok, true);
  if (!step1.ok) return;
  assert.equal(wouldOverrideCycle(step1.system, "dark", "text.primary", "text.secondary"), true);
  const indirect = setOverride(step1.system, "dark", "text.primary", "text.secondary");
  assert.equal(indirect.ok, false);
  if (!indirect.ok) assert.ok(indirect.error.includes("circular"), indirect.error);
  // Safe values still pass, and the picker hides cyclic choices.
  assert.equal(validateOverrideValue(step1.system, "dark", "text.primary", "neutral.50").ok, true);
  const candidates = validOverrideCandidates(step1.system, "dark", "text.primary");
  assert.ok(!candidates.aliases.includes("text.primary"), "self hidden");
  assert.ok(!candidates.aliases.includes("text.secondary"), "cycle-closing alias hidden");
  assert.ok(candidates.aliases.includes("text.muted"), "safe alias offered");
  assert.ok(candidates.foundations.includes("neutral.50"), "palette shades offered");
});

test("removing an override correctly restores inherited/base resolution", () => {
  const system = manthanSystem();
  const before = tokenThemeState(system, "dark", "background.canvas")!;
  assert.equal(before.status, "overridden");
  const cleared = removeOverride(system, "dark", "background.canvas");
  const after = tokenThemeState(cleared, "dark", "background.canvas")!;
  assert.equal(after.override, null);
  assert.equal(after.status, "inherited");
  assert.equal(after.effectiveValue, resolveToken(cleared, "background.canvas").value);
  assert.equal(after.effectiveValue, "#ffffff");
  // Reset to starter restores the starter override value.
  const reset = resetOverrideToStarter(cleared, "dark", "background.canvas");
  assert.ok(reset);
  assert.equal(
    tokenThemeState(reset!, "dark", "background.canvas")?.override,
    findTheme(manthanSystem(), "dark")!.overrides["background.canvas"],
  );
  assert.equal(resetOverrideToStarter(system, "midnight", "text.primary"), null);
});

test("default Light/Dark themes cannot be deleted", () => {
  const system = manthanSystem();
  for (const id of ["light", "dark"] as const) {
    const guard = canDeleteTheme(system, id);
    assert.equal(guard.ok, false);
    if (!guard.ok) assert.ok(guard.reasons[0]?.includes("required"), guard.reasons[0]);
  }
  assert.equal(canDeleteTheme(system, "ghost").ok, false);
});

test("custom-theme deletion works only when safe and confirmed", () => {
  const created = createTheme(manthanSystem(), { label: "Midnight", mode: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const system = insertTheme(manthanSystem(), created.theme);
  // Safe: nothing references theme ids in the current contract.
  assert.deepEqual(canDeleteTheme(system, "midnight"), { ok: true });
  const removed = removeTheme(system, "midnight");
  assert.ok(!removed.themes.some((theme) => theme.id === "midnight"));
  assert.ok(removed.themes.some((theme) => theme.id === "dark"));
  // Duplicate produces an independent theme with a unique id.
  const copy = duplicateTheme(system, "midnight");
  assert.ok(copy);
  assert.equal(copy?.id, "midnight-copy");
  const doubled = insertTheme(system, copy!);
  const again = duplicateTheme(doubled, "midnight");
  assert.equal(again?.id, "midnight-copy-2");
  assert.equal(duplicateTheme(system, "ghost"), null);
});

test("restore starter defaults does not affect custom themes", () => {
  const created = createTheme(manthanSystem(), { label: "Midnight", mode: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  let system = insertTheme(manthanSystem(), created.theme);
  const editedLight = setOverride(system, "light", "text.primary", "#000001");
  assert.equal(editedLight.ok, true);
  if (!editedLight.ok) return;
  const editedCustom = setOverride(editedLight.system, "midnight", "text.primary", "#000002");
  assert.equal(editedCustom.ok, true);
  if (!editedCustom.ok) return;
  system = editedCustom.system;
  const restored = restoreThemeToStarter(system, "light");
  assert.ok(restored);
  assert.equal(
    findTheme(restored!, "light")!.overrides["text.primary"],
    findTheme(manthanSystem(), "light")!.overrides["text.primary"],
  );
  // Custom theme survives the restore untouched.
  assert.equal(findTheme(restored!, "midnight")!.overrides["text.primary"], "#000002");
  assert.equal(restoreThemeToStarter(system, "midnight"), null);
  assert.equal(hasCustomThemeEdits(system, "light"), true);
  assert.equal(hasCustomThemeEdits(manthanSystem(), "light"), false);
});

test("clearing custom overrides and invalid-key detection", () => {
  const created = createTheme(manthanSystem(), { label: "Midnight", mode: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const system = insertTheme(manthanSystem(), created.theme);
  const cleared = clearThemeOverrides(system, "midnight");
  assert.equal(cleared.ok, true);
  if (!cleared.ok) return;
  assert.deepEqual(findTheme(cleared.system, "midnight")!.overrides, {});
  assert.equal(clearThemeOverrides(system, "light").ok, false);
  // Hand-built invalid keys are detected, never silently accepted.
  const tampered: DesignSystemConfig = {
    ...system,
    themes: system.themes.map((theme) =>
      theme.id === "midnight" ? { ...theme, overrides: { ...theme.overrides, "ghost.token": "neutral.500" } } : theme,
    ),
  };
  assert.deepEqual(invalidOverrideKeys(tampered, "midnight"), ["ghost.token"]);
  assert.deepEqual(invalidOverrideKeys(system, "midnight"), []);
  assert.equal(unresolvedOverrides(system, "midnight").length, 0);
});

test("ensureRequiredThemes preserves existing edits/custom themes", () => {
  const created = createTheme(manthanSystem(), { label: "Midnight", mode: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  let system = insertTheme(manthanSystem(), created.theme);
  const edited = setOverride(system, "dark", "text.primary", "#000001");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  system = edited.system;
  // Complete system: strict no-op.
  const intact = ensureRequiredThemes(system);
  assert.deepEqual(intact.added, []);
  assert.deepEqual(intact.system.themes, system.themes);
  // Legacy system missing dark: only dark is added, everything else kept.
  const legacy: DesignSystemConfig = {
    ...system,
    themes: system.themes.filter((theme) => theme.id !== "dark"),
  };
  const repaired = ensureRequiredThemes(legacy);
  assert.deepEqual(repaired.added, ["dark"]);
  assert.equal(findTheme(repaired.system, "light")!.overrides["text.primary"], "#18181b");
  assert.ok(findTheme(repaired.system, "midnight"));
  assert.equal(findTheme(repaired.system, "dark")!.overrides["text.primary"], "#fafafa");
});

test("persistence survives reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const created = createTheme(manthanSystem(), { label: "Midnight", mode: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const edited = setOverride(insertTheme(manthanSystem(), created.theme), "midnight", "text.primary", "#000001");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const saved = store.save(edited.system);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.system.id);
  assert.ok(reloaded);
  assert.equal(findTheme(reloaded!, "midnight")!.overrides["text.primary"], "#000001");
  assert.equal(findTheme(reloaded!, "dark")!.overrides["text.primary"], "#fafafa");
});

test("preview resolution changes when an override changes", () => {
  const system = manthanSystem();
  const before = resolveToken(system, "action.primary.background", "dark").value;
  const edited = setOverride(system, "dark", "action.primary.background", "neutral.50");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  assert.notEqual(resolveToken(edited.system, "action.primary.background", "dark").value, before);
  // Light is unaffected by the dark edit.
  assert.equal(
    resolveToken(edited.system, "action.primary.background", "light").value,
    resolveToken(system, "action.primary.background", "light").value,
  );
});
