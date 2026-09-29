// Focused Motion tests (Step 7E). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultMotion,
  validateDesignSystem,
  type DesignSystemConfig,
  type DurationToken,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  canDeleteMotionToken,
  canDisableMotionToken,
  createDurationToken,
  createEasingToken,
  diffMotion,
  duplicateMotionToken,
  effectiveMotion,
  ensureDurations,
  ensureEasings,
  findMotionReferences,
  formatDurationMs,
  hasCustomMotionEdits,
  humanMotionLabel,
  motionIssues,
  parseDurationMs,
  parseEasing,
  REDUCED_MOTION_POLICIES,
  removeMotionToken,
  resetMotionTokenToStarter,
  resolveDurationMs,
  resolveEasingCss,
  restoreStarterMotion,
  setMotionEnabled,
  setReducedMotionPolicy,
  slugifyMotionId,
  updateDurationValue,
  updateEasingValue,
  updateMotionLabel,
} from "./motion";

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

/** Blank "Manthan" system with motion.normal wired to a component token. */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  return {
    ...system,
    components: [
      ...system.components,
      {
        component: "toast",
        label: "Toast",
        overrides: [{ token: "duration", value: "normal" }],
      },
    ],
  };
}

function motionIds(system: DesignSystemConfig): string[] {
  return system.foundations.motion.durations.map((token) => token.id);
}

function easingIds(system: DesignSystemConfig): string[] {
  return system.foundations.motion.easings.map((token) => token.id);
}

test("starter duration and easing tokens are valid", () => {
  assert.deepEqual(
    defaultMotion().durations.map((token) => token.id),
    ["instant", "fast", "normal", "slow", "deliberate"],
  );
  assert.deepEqual(
    defaultMotion().easings.map((token) => token.id),
    ["linear", "standard", "enter", "exit", "emphasized"],
  );
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    for (const id of ["instant", "fast", "normal", "slow", "deliberate"]) {
      assert.ok(motionIds(system).includes(id), `${starter}: duration ${id}`);
    }
    for (const id of ["linear", "standard", "enter", "exit", "emphasized"]) {
      assert.ok(easingIds(system).includes(id), `${starter}: easing ${id}`);
    }
    for (const token of system.foundations.motion.durations) {
      assert.ok(parseDurationMs(token.value) !== null, `${starter}: duration ${token.id} parses`);
    }
    for (const token of system.foundations.motion.easings) {
      assert.ok(parseEasing(token.value) !== null, `${starter}: easing ${token.id} parses`);
    }
    assert.equal(system.foundations.motion.reducedMotion, "respect-preference", `${starter}: default policy`);
    assert.deepEqual(motionIssues(system), [], `${starter}: no motion issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("legacy Record motion scales normalize without data loss", () => {
  const durations = ensureDurations({ instant: "0ms", fast: "120ms", custom: "450ms" });
  assert.deepEqual(
    durations.map((token) => token.id),
    ["instant", "fast", "custom"],
  );
  assert.equal(durations.find((token) => token.id === "custom")?.value, "450ms");
  assert.deepEqual(ensureDurations(undefined).map((token) => token.id), ["instant", "fast", "normal", "slow", "deliberate"]);
  const easings = ensureEasings({ standard: "cubic-bezier(0.4, 0, 0.2, 1)" });
  assert.deepEqual(
    easings.map((token) => token.id),
    ["standard"],
  );
  assert.deepEqual(ensureEasings(null).map((token) => token.id), ["linear", "standard", "enter", "exit", "emphasized"]);
});

test("duration editing persists after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const editedMs = updateDurationValue(manthanSystem(), "normal", 240);
  const saved = store.save(editedMs);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(editedMs.id);
  assert.ok(reloaded);
  assert.equal(reloaded!.foundations.motion.durations.find((token) => token.id === "normal")?.value, "240ms");
  assert.equal(reloaded!.foundations.motion.durations.find((token) => token.id === "fast")?.value, "120ms");
});

test("invalid duration values are rejected", () => {
  assert.equal(parseDurationMs("200ms"), 200);
  assert.equal(parseDurationMs("200"), 200);
  assert.equal(parseDurationMs("0ms"), 0);
  assert.equal(parseDurationMs("0"), 0);
  assert.equal(parseDurationMs("  320MS  "), 320);
  for (const bad of ["-100ms", "-1", "fast", "200s", "200px", "", "ms", "1.2.3ms", "20000ms", "1e3ms", null, undefined, 200]) {
    assert.equal(parseDurationMs(bad), null, JSON.stringify(bad));
  }
  assert.equal(formatDurationMs(200), "200ms");
  assert.equal(updateDurationValue(manthanSystem(), "normal", -5).foundations.motion.durations.find((t) => t.id === "normal")?.value, "200ms");
  assert.equal(updateDurationValue(manthanSystem(), "normal", 20000).foundations.motion.durations.find((t) => t.id === "normal")?.value, "200ms");
  assert.equal(createDurationToken({ label: "x", ms: -1 }, []).ok, false);
  assert.equal(createDurationToken({ label: "x", ms: 20000 }, []).ok, false);
  assert.equal(humanMotionLabel("my-snap"), "My snap");
});

test("custom easing validation accepts valid cubic-bezier and rejects invalid values", () => {
  assert.equal(parseEasing("linear"), "linear");
  assert.equal(parseEasing("ease-out"), "ease-out");
  assert.equal(parseEasing("cubic-bezier(0.4, 0, 0.2, 1)"), "cubic-bezier(0.4, 0, 0.2, 1)");
  assert.equal(parseEasing("cubic-bezier( 0 , 0 , 0.2 , 1 )"), "cubic-bezier(0, 0, 0.2, 1)");
  assert.equal(parseEasing("steps(4, jump-end)"), "steps(4, jump-end)");
  assert.equal(parseEasing("steps(2)"), "steps(2)");
  for (const bad of [
    "cubic-bezier(1.5, 0, 0.2, 1)",
    "cubic-bezier(0.4, 0)",
    "cubic-bezier(a, 0, 0.2, 1)",
    "steps(0)",
    "steps(101)",
    "steps(2, sideways)",
    "spring(1, 80, 10)",
    "var(--ease)",
    "",
  ]) {
    assert.equal(parseEasing(bad), null, JSON.stringify(bad));
  }
  assert.equal(parseEasing("  EASE-IN-OUT  "), "ease-in-out");
  const system = manthanSystem();
  assert.equal(updateEasingValue(system, "enter", "bogus").foundations.motion.easings.find((t) => t.id === "enter")?.value, "cubic-bezier(0, 0, 0.2, 1)");
  const updated = updateEasingValue(system, "enter", "cubic-bezier(0.3, 0.7, 0.4, 1)");
  assert.equal(updated.foundations.motion.easings.find((t) => t.id === "enter")?.value, "cubic-bezier(0.3, 0.7, 0.4, 1)");
});

test("custom token ids remain unique", () => {
  const system = manthanSystem();
  const ids = motionIds(system);
  const created = createDurationToken({ label: "Gentle Pause!", ms: 450 }, ids);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "gentle-pause");
  assert.equal(created.token.value, "450ms");

  const explicit = createEasingToken({ id: "My Ease!", label: "ignored", value: "cubic-bezier(0.5, 0, 0.5, 1)" }, easingIds(system));
  assert.equal(explicit.ok, true);
  if (!explicit.ok) return;
  assert.equal(explicit.token.id, "my-ease");

  assert.equal(createDurationToken({ id: "fast", label: "x", ms: 1 }, ids).ok, false);
  assert.equal(createDurationToken({ id: "!!", label: "x", ms: 1 }, ids).ok, false);
  assert.equal(createDurationToken({ ms: 1 }, ids).ok, false);
  assert.equal(createEasingToken({ label: "x", value: "wiggle(2)" }, easingIds(system)).ok, false);
  assert.equal(slugifyMotionId("  ", []), "token");
  assert.equal(slugifyMotionId("Fast", ["fast"]), "fast-2");
});

test("duplicate token values are independent", () => {
  const system = manthanSystem();
  const copy = duplicateMotionToken(system, "durations", "normal");
  assert.ok(copy);
  assert.equal(copy!.id, "normal-copy");
  assert.equal(copy!.label, "Normal copy");
  assert.equal(copy!.value, "200ms");
  const withCopy = {
    ...system,
    foundations: {
      ...system.foundations,
      motion: { ...system.foundations.motion, durations: [...system.foundations.motion.durations, copy as DurationToken] },
    },
  };
  assert.ok(withCopy);
  const copy2 = duplicateMotionToken(withCopy as DesignSystemConfig, "durations", "normal");
  assert.equal(copy2!.id, "normal-copy-2");
  assert.equal(duplicateMotionToken(system, "easings", "ghost"), null);
  // Renaming a label never touches the stable id.
  const renamed = updateMotionLabel(system, "durations", "normal", "  Everyday  ");
  assert.equal(renamed.foundations.motion.durations.find((t) => t.id === "normal")?.label, "Everyday");
  const blankRename = updateMotionLabel(system, "durations", "normal", "   ");
  assert.equal(blankRename.foundations.motion.durations.find((t) => t.id === "normal")?.label, "Normal");
});

test("deleting unused custom tokens works", () => {
  const system = manthanSystem();
  const created = createDurationToken({ label: "Extra", ms: 450 }, motionIds(system));
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withExtra: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      motion: { ...system.foundations.motion, durations: [...system.foundations.motion.durations, created.token] },
    },
  };
  assert.deepEqual(canDeleteMotionToken(withExtra, "durations", created.token.id), { ok: true });
  const removed = removeMotionToken(withExtra, "durations", created.token.id);
  assert.ok(!removed.foundations.motion.durations.some((token) => token.id === created.token.id));
});

test("deleting referenced duration and easing tokens is blocked", () => {
  const system = manthanSystem();
  const references = findMotionReferences(system, "normal");
  assert.equal(references.length, 1);
  assert.equal(references[0]?.kind, "component");
  assert.equal(references[0]?.pointer, "Toast.duration");
  const guard = canDeleteMotionToken(system, "durations", "normal");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("normal is used by 1 token (Toast.duration)"));
  assert.deepEqual(guard.references, references);

  // Last-token and last-usable guards hold for both scales.
  const solo: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      motion: {
        ...system.foundations.motion,
        easings: [{ id: "linear", label: "Linear", value: "linear" }],
      },
    },
  };
  const last = canDeleteMotionToken(solo, "easings", "linear");
  assert.equal(last.ok, false);
  if (!last.ok) assert.ok(last.reasons[0]?.toLowerCase().includes("last"));
  assert.equal(canDisableMotionToken(system, "durations", "ghost").ok, false);
  assert.equal(canDeleteMotionToken(system, "durations", "ghost").ok, false);
});

test("restore and reset require confirmation surface data", () => {
  const edited = updateDurationValue(manthanSystem(), "normal", 240);
  assert.equal(hasCustomMotionEdits(edited), true);
  assert.equal(hasCustomMotionEdits(manthanSystem()), false);
  const starter = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  const diff = diffMotion(
    {
      durations: edited.foundations.motion.durations,
      easings: edited.foundations.motion.easings,
      reducedMotion: edited.foundations.motion.reducedMotion,
    },
    {
      durations: starter.foundations.motion.durations,
      easings: starter.foundations.motion.easings,
      reducedMotion: starter.foundations.motion.reducedMotion,
    },
  );
  assert.ok(diff.durationsChanged.some((entry) => entry.id === "normal" && entry.from.includes("240ms") && entry.to.includes("200ms")));

  const reset = resetMotionTokenToStarter(edited, "durations", "normal");
  assert.ok(reset);
  assert.equal(reset!.foundations.motion.durations.find((token) => token.id === "normal")?.value, "200ms");
  assert.equal(reset!.foundations.motion.durations.find((token) => token.id === "fast")?.value, "120ms");
  assert.equal(resetMotionTokenToStarter(edited, "durations", "custom-thing"), null);

  const restored = restoreStarterMotion(edited);
  assert.deepEqual(
    restored.foundations.motion.durations.map((token) => token.id),
    ["instant", "fast", "normal", "slow", "deliberate"],
  );
  assert.equal(restored.foundations.motion.reducedMotion, "respect-preference");
  assert.deepEqual(motionIssues(restored), []);
});

test("reduced-motion policy persists and computes effective motion", () => {
  assert.deepEqual(
    REDUCED_MOTION_POLICIES.map((entry) => entry.id),
    ["respect-preference", "reduce-all", "none"],
  );
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const changed = setReducedMotionPolicy(manthanSystem(), "reduce-all");
  assert.equal(changed.ok, true);
  if (!changed.ok) return;
  const saved = store.save(changed.system);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(changed.system.id);
  assert.equal(reloaded!.foundations.motion.reducedMotion, "reduce-all");

  assert.deepEqual(effectiveMotion(manthanSystem(), false), { reduce: false, reason: "OS allows full motion" });
  assert.deepEqual(effectiveMotion(manthanSystem(), true), { reduce: true, reason: "OS requests reduced motion" });
  assert.deepEqual(effectiveMotion(changed.system, false), { reduce: true, reason: "Policy minimizes motion" });
  const off = setReducedMotionPolicy(manthanSystem(), "none");
  assert.equal(off.ok, true);
  if (!off.ok) return;
  assert.deepEqual(effectiveMotion(off.system, false), { reduce: true, reason: "Policy disables non-essential motion" });
  assert.equal(setReducedMotionPolicy(manthanSystem(), "always" as never).ok, false);
});

test("preview resolution uses changed duration and easing values", () => {
  const system = manthanSystem();
  assert.equal(resolveDurationMs(system, "normal"), 200);
  assert.equal(resolveEasingCss(system, "enter"), "cubic-bezier(0, 0, 0.2, 1)");
  const edited = updateEasingValue(updateDurationValue(system, "normal", 500), "enter", "cubic-bezier(0.3, 0.7, 0.4, 1)");
  assert.equal(resolveDurationMs(edited, "normal"), 500);
  assert.equal(resolveEasingCss(edited, "enter"), "cubic-bezier(0.3, 0.7, 0.4, 1)");
  assert.equal(resolveDurationMs(edited, "missing"), null);
  const disabled = setMotionEnabled(edited, "durations", "normal", false);
  assert.equal(resolveDurationMs(disabled, "normal"), null);
  const reenabled = setMotionEnabled(disabled, "durations", "normal", true);
  assert.equal(resolveDurationMs(reenabled, "normal"), 500);
});
