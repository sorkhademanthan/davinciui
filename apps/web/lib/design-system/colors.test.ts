// Focused Colors foundation tests (Step 5). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isHexColor,
  resolveToken,
  type DesignSystemConfig,
  type Palette,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  bestTextOn,
  canDeletePalette,
  coerceHexInput,
  createPalette,
  duplicatePalette,
  findPaletteReferences,
  generateScale,
  manualShadeDiffs,
  normalizeHex,
  PALETTE_SHADES,
  regenerateShades,
  removePalette,
  slugifyPaletteId,
} from "./colors";

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

/** Blank system with a brand palette set to #0F766E (the manual journey). */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  const created = createPalette(
    { label: "Brand", role: "brand", base: "#0F766E" },
    system.foundations.colors.palettes.map((palette) => palette.id),
  );
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("fixture setup failed");
  // Wire primary actions to the new brand palette, as the editor's
  // "set as brand" flow would.
  const rewire = (value: string): string =>
    value === "neutral.900" ? "brand.600" : value;
  return {
    ...system,
    semanticTokens: system.semanticTokens.map((token) =>
      token.id === "action.primary.background" || token.id === "focus.ring"
        ? { ...token, value: rewire(token.value) }
        : token,
    ),
    foundations: {
      ...system.foundations,
      colors: {
        palettes: [...system.foundations.colors.palettes, created.palette],
      },
    },
  };
}

function paletteIds(system: DesignSystemConfig): string[] {
  return system.foundations.colors.palettes.map((palette) => palette.id);
}

test("adding a custom palette with #0F766E produces a valid scale", () => {
  const result = createPalette({ label: "Favorite Teal", role: "custom", base: "#0F766E" }, ["brand", "neutral"]);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.palette.id, "favorite-teal");
  assert.equal(result.palette.label, "Favorite Teal");
  assert.equal(result.palette.role, "custom");
  assert.equal(result.palette.base, "#0F766E");
  assert.equal(result.palette.enabled, true);
  assert.deepEqual(Object.keys(result.palette.shades).sort(), [...PALETTE_SHADES].sort());
  for (const shade of PALETTE_SHADES) {
    assert.ok(isHexColor(result.palette.shades[shade]), `shade ${shade} must be valid hex`);
  }
  assert.equal(result.palette.shades["500"], "#0F766E");
});

test("custom ids are honored when safe, rejected when colliding or unsafe", () => {
  const withId = createPalette({ label: "Whatever", role: "accent", base: "#635BFF", id: "My Accent!" }, ["brand"]);
  assert.equal(withId.ok, true);
  if (!withId.ok) return;
  assert.equal(withId.palette.id, "my-accent");

  const collision = createPalette({ label: "Other", role: "accent", base: "#635BFF", id: "brand" }, ["brand"]);
  assert.equal(collision.ok, false);

  const unsafe = createPalette({ label: "Other", role: "accent", base: "#635BFF", id: "!!!" }, ["brand"]);
  assert.equal(unsafe.ok, false);

  // Label-derived ids stay predictable and unique.
  assert.equal(slugifyPaletteId("Favorite Teal", ["favorite-teal"]), "favorite-teal-2");
  assert.equal(slugifyPaletteId("  ", []), "palette");
});

test("no automatic duplicate of the primary palette", () => {
  const system = manthanSystem();
  const brand = system.foundations.colors.palettes.find((palette) => palette.id === "brand")!;
  const again = createPalette({ label: "Brand copy attempt", role: "brand", base: brand.base }, paletteIds(system));
  assert.equal(again.ok, true);
  if (!again.ok) return;
  // Same base color is allowed (user choice) but the id is never silently reused.
  assert.notEqual(again.palette.id, "brand");
  assert.ok(!paletteIds(system).includes(again.palette.id));
  // Independent shade objects — no shared references.
  again.palette.shades["500"] = "#000000";
  assert.equal(brand.shades["500"], "#0F766E");
});

test("generated scale is deterministic and valid", () => {
  const first = generateScale("#0f766e");
  const second = generateScale("#0F766E");
  assert.ok(first && second);
  assert.deepEqual(first, second);
  assert.equal(first!["500"], "#0F766E");
  for (const shade of PALETTE_SHADES) {
    assert.ok(isHexColor(first![shade]), `shade ${shade} must be valid hex`);
  }
});

test("invalid HEX is rejected everywhere", () => {
  assert.equal(normalizeHex("#0F766E"), "#0F766E");
  assert.equal(normalizeHex("  #635bff  "), "#635BFF");
  // Strict canonical form requires `#`; the forgiving field-level coercion
  // accepts a bare six-digit value.
  assert.equal(normalizeHex("0f766e"), null);
  assert.equal(coerceHexInput("0f766e"), "#0F766E");
  assert.equal(coerceHexInput("  #635bff  "), "#635BFF");
  for (const bad of ["", "#", "#12345", "#1234567", "red", "#GGGGGG", 42, null, undefined]) {
    assert.equal(normalizeHex(bad), null, JSON.stringify(bad));
    assert.equal(coerceHexInput(bad), null, JSON.stringify(bad));
  }
  assert.equal(generateScale("nope"), null);
  const noName = createPalette({ label: "   ", role: "brand", base: "#0F766E" }, []);
  assert.equal(noName.ok, false);
  const noColor = createPalette({ label: "Teal", role: "brand", base: "teal" }, []);
  assert.equal(noColor.ok, false);
});

test("editing a base color updates the scale only when regeneration is confirmed", () => {
  const system = manthanSystem();
  const brand = system.foundations.colors.palettes.find((palette) => palette.id === "brand")!;
  // Pristine palette: no manual diffs, regeneration is a no-op semantically.
  assert.deepEqual(manualShadeDiffs(brand), []);

  const changed: Palette = { ...brand, base: "#FF0000", shades: { ...brand.shades } };
  // Base edit alone never touches shades implicitly.
  assert.equal(changed.shades["500"], "#0F766E");
  // …but the stale scale now differs everywhere from a fresh generation, so
  // regeneration (explicitly confirmed in UI) would overwrite every shade.
  assert.deepEqual(manualShadeDiffs(changed).sort(), [...PALETTE_SHADES].sort());

  const regenerated = regenerateShades(changed);
  assert.equal(regenerated.shades["500"], "#FF0000");
  assert.equal(regenerated.base, "#FF0000");
  for (const shade of PALETTE_SHADES) {
    assert.ok(isHexColor(regenerated.shades[shade]), shade);
  }
});

test("manual shade editing persists without accidental regeneration", () => {
  const system = manthanSystem();
  const brand = system.foundations.colors.palettes.find((palette) => palette.id === "brand")!;
  const edited: Palette = { ...brand, shades: { ...brand.shades, "600": "#123456" } };
  assert.deepEqual(manualShadeDiffs(edited), ["600"]);
  // Unrelated operations keep the manual value.
  const relabeled: Palette = { ...edited, label: "Renamed brand" };
  assert.equal(relabeled.shades["600"], "#123456");
  const toggled: Palette = { ...relabeled, enabled: false };
  assert.equal(toggled.shades["600"], "#123456");
  // Only an explicit regeneration overwrites it.
  assert.notEqual(regenerateShades(toggled).shades["600"], "#123456");
});

test("duplicate palette produces a new id and independent values", () => {
  const system = manthanSystem();
  const ids = paletteIds(system);
  const brand = system.foundations.colors.palettes.find((palette) => palette.id === "brand")!;
  const copy = duplicatePalette(brand, ids);
  assert.equal(copy.id, "brand-copy");
  assert.equal(copy.label, "Brand copy");
  assert.equal(copy.base, brand.base);
  assert.deepEqual(copy.shades, brand.shades);
  copy.shades["500"] = "#000000";
  copy.base = "#000000";
  assert.equal(brand.shades["500"], "#0F766E");
  assert.equal(brand.base, "#0F766E");
  const copy2 = duplicatePalette(brand, [...ids, copy.id]);
  assert.equal(copy2.id, "brand-copy-2");
});

test("palette deletion works when unused", () => {
  const system = manthanSystem();
  const extra = createPalette({ label: "Unused", role: "custom", base: "#A16207" }, paletteIds(system));
  assert.equal(extra.ok, true);
  if (!extra.ok) return;
  const withExtra: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      colors: { palettes: [...system.foundations.colors.palettes, extra.palette] },
    },
  };
  assert.deepEqual(canDeletePalette(withExtra, extra.palette.id), { ok: true });
  const removed = removePalette(withExtra, extra.palette.id);
  assert.ok(!paletteIds(removed).includes(extra.palette.id));
  assert.equal(paletteIds(removed).length, paletteIds(withExtra).length - 1);
});

test("palette deletion is blocked when referenced, with token detail", () => {
  const system = manthanSystem();
  // Blank starter wires action.primary.background to a brand shade.
  const references = findPaletteReferences(system, "brand");
  assert.ok(references.length > 0, "expected live references to the brand palette");
  const guard = canDeletePalette(system, "brand");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons.length > 0);
  assert.ok(guard.reasons[0]!.includes("action.primary.background"));
  assert.deepEqual(guard.references, references);

  // Deleting the last remaining palette is blocked even when unreferenced.
  const solo = createSystemFromStarter({ starterId: "blank", name: "Solo" });
  const onlyId = paletteIds(solo)[0]!;
  const soloGuard = canDeletePalette(solo, onlyId);
  assert.equal(soloGuard.ok, false);
  if (!soloGuard.ok) {
    assert.ok(soloGuard.reasons[0]!.toLowerCase().includes("last palette"));
  }

  // Unknown ids cannot be deleted either.
  assert.equal(canDeletePalette(system, "ghost").ok, false);
});

test("palette edits persist after repository reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const system = manthanSystem();
  const brand = system.foundations.colors.palettes.find((palette) => palette.id === "brand")!;
  const edited: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      colors: {
        palettes: system.foundations.colors.palettes.map((palette) =>
          palette.id === "brand"
            ? { ...palette, label: "Edited brand", enabled: false, shades: { ...palette.shades, "600": "#123456" } }
            : palette,
        ),
      },
    },
  };
  void brand;
  const saved = store.save(edited);
  assert.equal(saved.ok, true);

  const reloaded = createDesignSystemsStore(() => mem).get(edited.id);
  assert.ok(reloaded);
  const roundTripped = reloaded!.foundations.colors.palettes.find((palette) => palette.id === "brand")!;
  assert.equal(roundTripped.label, "Edited brand");
  assert.equal(roundTripped.enabled, false);
  assert.equal(roundTripped.base, "#0F766E");
  assert.equal(roundTripped.shades["600"], "#123456");
});

test("preview resolution changes when a referenced palette shade changes", () => {  const system = manthanSystem();
  const before = resolveToken(system, "action.primary.background");
  assert.equal(before.status, "resolved");
  const edited: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      colors: {
        palettes: system.foundations.colors.palettes.map((palette) =>
          palette.id === "brand" ? regenerateShades({ ...palette, base: "#FF0000" }) : palette,
        ),
      },
    },
  };
  const after = resolveToken(edited, "action.primary.background");
  assert.equal(after.status, "resolved");
  assert.notEqual(after.value, before.value);
  assert.equal(after.value, edited.foundations.colors.palettes.find((palette) => palette.id === "brand")!.shades["600"]);
});

test("bestTextOn picks readable swatch text and never throws", () => {
  assert.equal(bestTextOn("#0F766E"), "#ffffff");
  assert.equal(bestTextOn("#FFFFFF"), "#000000");
  assert.equal(bestTextOn("#000000"), "#ffffff");
  assert.equal(bestTextOn("not-a-color"), "#ffffff");
});
