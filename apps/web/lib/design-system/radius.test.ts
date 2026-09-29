// Focused Radius tests (Step 7B). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultRadius,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  applyRadiusPreset,
  canDeleteRadiusToken,
  createRadiusToken,
  diffRadiusScales,
  ensureRadiusScale,
  findRadiusReferences,
  formatRadiusValue,
  hasCustomRadiusEdits,
  humanRadiusLabel,
  moveRadiusToken,
  parseRadiusValue,
  radiusValueFor,
  radiusIssues,
  RADIUS_PRESETS,
  removeRadiusToken,
  resetRadiusTokenToStarter,
  restoreStarterRadius,
  slugifyRadiusId,
  updateRadiusLabel,
  updateRadiusValue,
} from "./radius";

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

/** Blank "Manthan" system with md wired to a component token. */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  return {
    ...system,
    components: [
      ...system.components,
      {
        component: "card",
        label: "Card",
        overrides: [{ token: "radius", value: "md" }],
      },
    ],
  };
}

test("starter radius scales are valid", () => {
  assert.deepEqual(
    defaultRadius(8).scale.map((token) => token.id),
    ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"],
  );
  assert.equal(defaultRadius(8).scale.find((token) => token.id === "md")?.value, "8px");
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    assert.ok(system.foundations.radius.scale.length >= 8, `${starter}: radius populated`);
    for (const id of ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"]) {
      assert.ok(system.foundations.radius.scale.some((token) => token.id === id), `${starter}: ${id}`);
    }
    assert.deepEqual(radiusIssues(system), [], `${starter}: no radius issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("radius value parsing normalizes safely and rejects invalid input", () => {
  assert.deepEqual(parseRadiusValue("12px"), { amount: 12, unit: "px" });
  assert.deepEqual(parseRadiusValue("1.5rem"), { amount: 1.5, unit: "rem" });
  assert.deepEqual(parseRadiusValue("50%"), { amount: 50, unit: "%" });
  assert.deepEqual(parseRadiusValue("12"), { amount: 12, unit: "px" });
  assert.deepEqual(parseRadiusValue("0"), { amount: 0, unit: "px" });
  assert.deepEqual(parseRadiusValue("9999px"), { amount: 9999, unit: "px" });
  for (const bad of ["-4px", "-1", "auto", "12em", "12pt", "", "px", "1.2.3px", "10000px", "300rem", "101%", null, undefined, 12]) {
    assert.equal(parseRadiusValue(bad), null, JSON.stringify(bad));
  }
  assert.equal(formatRadiusValue({ amount: 12, unit: "px" }), "12px");
  assert.equal(humanRadiusLabel("my-shape"), "My shape");
});

test("editing a token persists after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const edited = updateRadiusValue(manthanSystem(), "md", 20, "px");
  const saved = store.save(edited);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.id);
  assert.ok(reloaded);
  assert.equal(reloaded!.foundations.radius.scale.find((token) => token.id === "md")?.value, "20px");
  assert.equal(reloaded!.foundations.radius.scale.find((token) => token.id === "sm")?.value, "4px");
});

test("adding a custom token produces a safe unique id", () => {
  const system = manthanSystem();
  const created = createRadiusToken({ label: "Card Pop!", amount: 18, unit: "px" }, system.foundations.radius.scale.map((token) => token.id));
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "card-pop");
  assert.equal(created.token.label, "Card Pop!");
  assert.equal(created.token.value, "18px");

  const explicit = createRadiusToken({ id: "pill-lg", label: "ignored", amount: 50, unit: "%" }, system.foundations.radius.scale.map((token) => token.id));
  assert.equal(explicit.ok, true);
  if (!explicit.ok) return;
  assert.equal(explicit.token.id, "pill-lg");
  assert.equal(explicit.token.value, "50%");

  assert.equal(slugifyRadiusId("  ", []), "token");
  assert.equal(slugifyRadiusId("MD", ["md"]), "md-2");
});

test("duplicate ids and negative values are rejected", () => {
  const system = manthanSystem();
  const ids = system.foundations.radius.scale.map((token) => token.id);
  assert.equal(createRadiusToken({ id: "md", amount: 4, unit: "px" }, ids).ok, false);
  assert.equal(createRadiusToken({ id: "!!", amount: 4, unit: "px" }, ids).ok, false);
  assert.equal(createRadiusToken({ amount: 4, unit: "px" }, ids).ok, false);
  assert.equal(createRadiusToken({ label: "x", amount: -2, unit: "px" }, ids).ok, false);
  // Labels are editable without touching the stable id; blanks are ignored.
  const renamed = updateRadiusLabel(system, "md", "  Medium +  ");
  assert.equal(renamed.foundations.radius.scale.find((token) => token.id === "md")?.label, "Medium +");
  assert.equal(renamed.foundations.radius.scale.find((token) => token.id === "md")?.id, "md");
  const blankLabel = updateRadiusLabel(system, "md", "   ");
  assert.equal(blankLabel.foundations.radius.scale.find((token) => token.id === "md")?.label, "Medium");
});

test("full remains valid and intentionally represented", () => {
  const system = manthanSystem();
  const full = system.foundations.radius.scale.find((token) => token.id === "full")!;
  assert.equal(full.value, "9999px");
  assert.ok(full.label.toLowerCase().includes("pill"));
  assert.equal(radiusValueFor(system, "full"), "9999px");
  for (const preset of RADIUS_PRESETS) {
    const token = preset.scale.find((entry) => entry.id === "full")!;
    assert.equal(token.value, "9999px", `${preset.id}: full stays pill`);
  }
});

test("deleting an unused custom token works", () => {
  const system = manthanSystem();
  const created = createRadiusToken({ label: "Extra", amount: 18, unit: "px" }, system.foundations.radius.scale.map((token) => token.id));
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withExtra: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      radius: { ...system.foundations.radius, scale: [...system.foundations.radius.scale, created.token] },
    },
  };
  assert.deepEqual(canDeleteRadiusToken(withExtra, created.token.id), { ok: true });
  const removed = removeRadiusToken(withExtra, created.token.id);
  assert.ok(!removed.foundations.radius.scale.some((token) => token.id === created.token.id));
});

test("deleting a referenced token is blocked with a clear message", () => {
  const system = manthanSystem();
  const references = findRadiusReferences(system, "md");
  assert.equal(references.length, 1);
  assert.equal(references[0]?.kind, "component");
  assert.equal(references[0]?.pointer, "Card.radius");
  const guard = canDeleteRadiusToken(system, "md");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("md is used by 1 token (Card.radius)"));
  assert.deepEqual(guard.references, references);

  const solo: DesignSystemConfig = {
    ...system,
    foundations: { ...system.foundations, radius: { base: 0, scale: [{ id: "none", label: "None", value: "0px" }] } },
  };
  const last = canDeleteRadiusToken(solo, "none");
  assert.equal(last.ok, false);
  if (!last.ok) assert.ok(last.reasons[0]?.toLowerCase().includes("last"));
  assert.equal(canDeleteRadiusToken(system, "ghost").ok, false);
});

test("applying a shape preset requires confirmation when custom edits exist", () => {
  const pristine = manthanSystem();
  assert.equal(hasCustomRadiusEdits(pristine), false);
  const edited = updateRadiusValue(pristine, "md", 99, "px");
  assert.equal(hasCustomRadiusEdits(edited), true);

  const preset = RADIUS_PRESETS.find((entry) => entry.id === "rounded")!;
  const current = edited.foundations.radius.scale;
  const diff = diffRadiusScales(current, preset.scale);
  assert.ok(diff.changed.some((entry) => entry.id === "md" && entry.from.includes("99px") && entry.to.includes("16px")));

  const applied = applyRadiusPreset(edited, preset);
  assert.equal(applied.foundations.radius.base, 12);
  assert.equal(applied.foundations.radius.scale.find((token) => token.id === "md")?.value, "16px");
  assert.deepEqual(radiusIssues(applied), []);
});

test("resetting one token restores only that token", () => {
  const edited = updateRadiusValue(updateRadiusLabel(manthanSystem(), "md", "Custom"), "md", 99, "px");
  const reset = resetRadiusTokenToStarter(edited, "md");
  assert.ok(reset);
  assert.equal(reset!.foundations.radius.scale.find((token) => token.id === "md")?.value, "8px");
  assert.equal(reset!.foundations.radius.scale.find((token) => token.id === "md")?.label, "Medium");
  assert.equal(reset!.foundations.radius.scale.find((token) => token.id === "sm")?.value, "4px");
  assert.equal(resetRadiusTokenToStarter(edited, "custom-thing"), null);
});

test("resetting full scale restores the selected starter defaults", () => {
  const edited = updateRadiusValue(manthanSystem(), "md", 99, "px");
  const restored = restoreStarterRadius(edited);
  assert.equal(restored.foundations.radius.base, 8);
  assert.equal(restored.foundations.radius.scale.find((token) => token.id === "md")?.value, "8px");
  assert.deepEqual(
    restored.foundations.radius.scale.map((token) => token.id),
    ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"],
  );
  assert.deepEqual(radiusIssues(restored), []);
});

test("preview resolves and changes when radius tokens change", () => {
  const system = manthanSystem();
  assert.equal(radiusValueFor(system, "md"), "8px");
  const edited = updateRadiusValue(system, "md", 24, "px");
  assert.equal(radiusValueFor(edited, "md"), "24px");
  assert.equal(radiusValueFor(edited, "missing"), null);
  const moved = moveRadiusToken(system, "2xl", -1);
  const order = moved.foundations.radius.scale.map((token) => token.id);
  assert.equal(order[5], "2xl");
  assert.equal(order[6], "xl");
  // Values travel with their ids.
  assert.equal(moved.foundations.radius.scale[5]?.value, "20px");
  assert.equal(moveRadiusToken(system, "none", -1).foundations.radius.scale[0]?.id, "none");
});

test("legacy Record scales normalize without data loss", () => {
  const legacy = {
    none: "0px",
    sm: "2px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  };
  const normalized = ensureRadiusScale(legacy, 8);
  assert.deepEqual(
    normalized.map((token) => token.id),
    ["none", "sm", "md", "lg", "xl", "full"],
  );
  assert.equal(normalized.find((token) => token.id === "md")?.value, "8px");
  assert.deepEqual(ensureRadiusScale(undefined).map((token) => token.id).slice(0, 3), ["none", "xs", "sm"]);
});
