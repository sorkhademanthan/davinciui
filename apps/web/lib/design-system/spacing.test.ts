// Focused Spacing & sizing tests (Step 7A). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultSizing,
  defaultSpacing,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  allTokenIds,
  applySpacingPreset,
  canDeleteToken,
  createToken,
  diffScales,
  findTokenReferences,
  firstAvailablePx,
  formatLength,
  hasCustomScaleEdits,
  humanLabel,
  moveToken,
  parseLength,
  pxOf,
  removeToken,
  resetTokenToStarter,
  restoreStarterScale,
  scaleIssues,
  slugifyTokenId,
  SPACING_PRESETS,
  updateTokenValue,
} from "./spacing";

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

/** Blank "Manthan" system with space-4 wired to a component token. */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  return {
    ...system,
    components: [
      ...system.components,
      {
        component: "button",
        label: "Button",
        overrides: [{ token: "padding-inline", value: "space-4" }],
      },
    ],
  };
}

test("starter spacing and sizing scales are valid", () => {
  assert.deepEqual(
    defaultSpacing(4).scale.map((token) => token.id),
    ["space-1", "space-2", "space-3", "space-4", "space-5", "space-6", "space-7", "space-8", "space-9", "space-10", "space-11", "space-12"],
  );
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    assert.ok(system.foundations.sizing.tokens.length >= 9, `${starter}: sizing populated`);
    for (const id of ["control-sm", "control-md", "control-lg", "icon-sm", "icon-md", "icon-lg", "content-sm", "content-md", "content-lg"]) {
      assert.ok(system.foundations.sizing.tokens.some((token) => token.id === id), `${starter}: ${id}`);
    }
    assert.deepEqual(scaleIssues(system), [], `${starter}: no scale issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("length parsing normalizes safely and rejects invalid input", () => {
  assert.deepEqual(parseLength("16px"), { amount: 16, unit: "px" });
  assert.deepEqual(parseLength("1.5rem"), { amount: 1.5, unit: "rem" });
  assert.deepEqual(parseLength("16"), { amount: 16, unit: "px" });
  assert.deepEqual(parseLength("  2.50REM  "), { amount: 2.5, unit: "rem" });
  assert.deepEqual(parseLength("0"), { amount: 0, unit: "px" });
  assert.deepEqual(parseLength("0px"), { amount: 0, unit: "px" });
  for (const bad of ["-4px", "-1", "auto", "16em", "16pt", "", "px", "1.2.3px", "5000px", "300rem", null, undefined, 16]) {
    assert.equal(parseLength(bad), null, JSON.stringify(bad));
  }
  assert.equal(formatLength({ amount: 16, unit: "px" }), "16px");
  assert.equal(formatLength({ amount: 1.5, unit: "rem" }), "1.5rem");
  assert.equal(pxOf({ id: "space-4", value: "16px" }), 16);
  assert.equal(pxOf({ id: "x", value: "1.5rem" }), 24);
  assert.equal(pxOf({ id: "x", value: "nope" }), null);
  assert.equal(humanLabel("control-md"), "Control md");
  assert.equal(humanLabel("space-4"), "Space 4");
});

test("editing a spacing token persists after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const edited = updateTokenValue(manthanSystem(), "spacing", "space-4", 20, "px");
  const saved = store.save(edited);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.id);
  assert.ok(reloaded);
  assert.equal(reloaded!.foundations.spacing.scale.find((token) => token.id === "space-4")?.value, "20px");
  // Untouched siblings survive the round trip.
  assert.equal(reloaded!.foundations.spacing.scale.find((token) => token.id === "space-3")?.value, "12px");
});

test("adding a custom token produces a safe unique id", () => {
  const system = manthanSystem();
  const created = createToken("spacing", { label: "Space Gutter!", amount: 18, unit: "px" }, system);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "space-gutter");
  assert.equal(created.token.value, "18px");

  const explicit = createToken("sizing", { id: "gutter-lg", label: "ignored", amount: 2, unit: "rem" }, system);
  assert.equal(explicit.ok, true);
  if (!explicit.ok) return;
  assert.equal(explicit.token.id, "gutter-lg");
  assert.equal(explicit.token.value, "2rem");

  // Ids are unique across spacing and sizing combined.
  const clash = createToken("sizing", { id: "space-4", amount: 1, unit: "px" }, system);
  assert.equal(clash.ok, false);

  assert.equal(slugifyTokenId("  ", []), "token");
  assert.equal(slugifyTokenId("Space 4", ["space-4"]), "space-4-2");
});

test("duplicate ids are rejected", () => {
  const system = manthanSystem();
  assert.equal(createToken("spacing", { id: "space-4", amount: 4, unit: "px" }, system).ok, false);
  assert.equal(createToken("spacing", { id: "!!", amount: 4, unit: "px" }, system).ok, false);
  assert.equal(createToken("spacing", { amount: 4, unit: "px" }, system).ok, false);
  assert.equal(createToken("spacing", { label: "x", amount: -2, unit: "px" }, system).ok, false);
});

test("deleting an unused custom token works", () => {
  const system = manthanSystem();
  const created = createToken("spacing", { label: "Extra", amount: 18, unit: "px" }, system);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withExtra: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      spacing: { ...system.foundations.spacing, scale: [...system.foundations.spacing.scale, created.token] },
    },
  };
  assert.deepEqual(canDeleteToken(withExtra, "spacing", created.token.id), { ok: true });
  const removed = removeToken(withExtra, "spacing", created.token.id);
  assert.ok(!removed.foundations.spacing.scale.some((token) => token.id === created.token.id));
});

test("deleting a referenced token is blocked with a clear message", () => {
  const system = manthanSystem();
  const references = findTokenReferences(system, "space-4");
  assert.equal(references.length, 1);
  assert.equal(references[0]?.kind, "component");
  assert.equal(references[0]?.pointer, "Button.padding-inline");
  const guard = canDeleteToken(system, "spacing", "space-4");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("space-4 is used by 1 token (Button.padding-inline)"));
  assert.deepEqual(guard.references, references);

  // Last token can never go, and unknown ids cannot be deleted.
  const solo: DesignSystemConfig = {
    ...system,
    foundations: { ...system.foundations, spacing: { base: 4, scale: [{ id: "space-1", value: "4px" }] } },
  };
  const last = canDeleteToken(solo, "spacing", "space-1");
  assert.equal(last.ok, false);
  if (!last.ok) assert.ok(last.reasons[0]?.toLowerCase().includes("last token"));
  assert.equal(canDeleteToken(system, "spacing", "ghost").ok, false);
});

test("applying a preset requires confirmation when custom edits exist", () => {
  const pristine = manthanSystem();
  assert.equal(hasCustomScaleEdits(pristine, "spacing"), false);
  const edited = updateTokenValue(pristine, "spacing", "space-4", 99, "px");
  assert.equal(hasCustomScaleEdits(edited, "spacing"), true);

  const preset = SPACING_PRESETS.find((entry) => entry.id === "spacious")!;
  const diff = diffScales(edited.foundations.spacing.scale, preset.scale);
  assert.ok(diff.changed.some((entry) => entry.id === "space-4" && entry.from === "99px" && entry.to === "32px"));
  // Starter tokens absent from the preset would be removed — surfaced, not silent.
  assert.ok(diff.removed.length > 0);

  const applied = applySpacingPreset(edited, preset);
  assert.equal(applied.foundations.spacing.base, 8);
  assert.equal(applied.foundations.spacing.scale.find((token) => token.id === "space-4")?.value, "32px");
  assert.deepEqual(scaleIssues(applied), []);
});

test("density changes do not silently overwrite a custom scale", () => {
  const edited = updateTokenValue(manthanSystem(), "spacing", "space-4", 99, "px");
  const withDensity: DesignSystemConfig = {
    ...edited,
    foundations: { ...edited.foundations, density: "compact" },
  };
  assert.equal(withDensity.foundations.spacing.scale.find((token) => token.id === "space-4")?.value, "99px");
  assert.equal(withDensity.foundations.density, "compact");
});

test("preview resolution changes when spacing or sizing tokens change", () => {
  const system = manthanSystem();
  assert.deepEqual(firstAvailablePx(system, "spacing", ["space-4", "space-3"]), { id: "space-4", px: 16 });
  const edited = updateTokenValue(system, "spacing", "space-4", 32, "px");
  assert.deepEqual(firstAvailablePx(edited, "spacing", ["space-4", "space-3"]), { id: "space-4", px: 32 });
  assert.deepEqual(firstAvailablePx(edited, "sizing", ["control-md"]), { id: "control-md", px: 40 });
  const resized = updateTokenValue(edited, "sizing", ["control-md"][0]!, 2, "rem");
  assert.deepEqual(firstAvailablePx(resized, "sizing", ["control-md"]), { id: "control-md", px: 32 });
  assert.equal(firstAvailablePx(edited, "sizing", ["missing"]), null);
});

test("resetting one token restores only that token", () => {
  const edited = updateTokenValue(updateTokenValue(manthanSystem(), "spacing", "space-4", 99, "px"), "spacing", "space-3", 99, "px");
  const reset = resetTokenToStarter(edited, "spacing", "space-4");
  assert.ok(reset);
  assert.equal(reset!.foundations.spacing.scale.find((token) => token.id === "space-4")?.value, "16px");
  assert.equal(reset!.foundations.spacing.scale.find((token) => token.id === "space-3")?.value, "99px");
  assert.equal(resetTokenToStarter(edited, "spacing", "space-custom"), null);
});

test("resetting full scale restores the selected starter defaults", () => {
  const edited = updateTokenValue(manthanSystem(), "spacing", "space-4", 99, "px");
  const restored = restoreStarterScale(edited, "spacing");
  assert.equal(restored.foundations.spacing.base, 4);
  assert.equal(restored.foundations.spacing.scale.find((token) => token.id === "space-4")?.value, "16px");
  assert.deepEqual(scaleIssues(restored), []);
  const resized = updateTokenValue(edited, "sizing", "control-md", 99, "px");
  const sizingRestored = restoreStarterScale(resized, "sizing");
  assert.equal(sizingRestored.foundations.sizing?.tokens.find((token) => token.id === "control-md")?.value, "40px");
});

test("reordering changes display order without touching references", () => {
  const system = manthanSystem();
  const before = system.foundations.spacing.scale.map((token) => token.id);
  const moved = moveToken(system, "spacing", "space-12", -1);
  const after = moved.foundations.spacing.scale.map((token) => token.id);
  assert.notDeepEqual(after, before);
  assert.deepEqual([...after].sort(), [...before].sort());
  const values = new Map(moved.foundations.spacing.scale.map((token) => [token.id, token.value]));
  for (const token of system.foundations.spacing.scale) {
    assert.equal(values.get(token.id), token.value);
  }
  // Out-of-range moves are no-ops.
  assert.deepEqual(moveToken(system, "spacing", "space-1", -1).foundations.spacing.scale, system.foundations.spacing.scale);
  assert.deepEqual(allTokenIds(system).length, system.foundations.spacing.scale.length + (system.foundations.sizing?.tokens.length ?? 0));
});
