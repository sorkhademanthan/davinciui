// Focused Breakpoints tests (Step 7H). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultBreakpoints,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  activeBreakpoint,
  applyBreakpointPreset,
  BREAKPOINT_PRESETS,
  breakpointIssues,
  breakpointPx,
  canDeleteBreakpoint,
  createBreakpointToken,
  diffBreakpointScales,
  ensureBreakpointScale,
  findBreakpointReferences,
  formatBreakpointValue,
  hasCustomBreakpointEdits,
  humanBreakpointLabel,
  insertBreakpointToken,
  moveBreakpoint,
  parseBreakpointValue,
  removeBreakpoint,
  resetBreakpointToStarter,
  restoreStarterBreakpoints,
  slugifyBreakpointId,
  updateBreakpointDescription,
  updateBreakpointLabel,
  updateBreakpointValue,
} from "./breakpoints";

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
        overrides: [{ token: "columns", value: "md" }],
      },
    ],
  };
}

function scaleOf(system: DesignSystemConfig) {
  return ensureBreakpointScale(system.foundations.breakpoints?.scale);
}

test("starter breakpoint scales are valid and strictly ascending", () => {
  assert.deepEqual(
    defaultBreakpoints().scale.map((token) => token.id),
    ["base", "sm", "md", "lg", "xl", "2xl"],
  );
  assert.equal(defaultBreakpoints().scale.find((token) => token.id === "base")?.value, "0px");
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    const scale = scaleOf(system);
    assert.ok(scale.length >= 6, `${starter}: scale populated`);
    assert.equal(scale[0]?.id, "base", `${starter}: base first`);
    assert.equal(scale[0]?.value, "0px", `${starter}: base is 0px`);
    const widths = scale.map((token) => breakpointPx(token));
    for (let index = 1; index < widths.length; index += 1) {
      assert.ok(widths[index]! > widths[index - 1]!, `${starter}: strictly ascending at ${scale[index]?.id}`);
    }
    for (const id of ["base", "sm", "md", "lg", "xl", "2xl"]) {
      assert.ok(scale.some((token) => token.id === id), `${starter}: ${id}`);
    }
    assert.deepEqual(breakpointIssues(system), [], `${starter}: no breakpoint issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("base is always 0px and cannot be deleted", () => {
  const system = manthanSystem();
  const guard = canDeleteBreakpoint(system, "base");
  assert.equal(guard.ok, false);
  if (!guard.ok) assert.ok(guard.reasons[0]?.includes("`base` is required at 0px"));
  const edited = updateBreakpointValue(system, "base", 320, "px");
  assert.equal(edited.ok, false);
  if (!edited.ok) assert.ok(edited.error.includes("fixed at 0px"));
  assert.equal(scaleOf(system)[0]?.value, "0px");
});

test("valid threshold edits persist after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const edited = updateBreakpointValue(manthanSystem(), "md", 800, "px");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const saved = store.save(edited.system);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.system.id);
  assert.ok(reloaded);
  assert.equal(scaleOf(reloaded!).find((token) => token.id === "md")?.value, "800px");
  // Grid config travels untouched alongside the edit.
  assert.deepEqual(reloaded!.foundations.grid, manthanSystem().foundations.grid);
  // Sibling thresholds survive the round trip.
  assert.equal(scaleOf(reloaded!).find((token) => token.id === "lg")?.value, "1024px");
});

test("duplicate, negative, and out-of-order values are rejected", () => {
  const system = manthanSystem();
  const scale = scaleOf(system);
  assert.equal(updateBreakpointValue(system, "md", -10, "px").ok, false);
  assert.equal(updateBreakpointValue(system, "md", Number.NaN, "px").ok, false);
  assert.equal(updateBreakpointValue(system, "md", 9000, "px").ok, false);
  assert.equal(updateBreakpointValue(system, "ghost", 900, "px").ok, false);
  // Duplicate of lg.
  const duplicate = updateBreakpointValue(system, "md", 1024, "px");
  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) {
    assert.ok(duplicate.error.includes("`md` must be larger than `sm` (640px)"));
    assert.ok(duplicate.error.includes("smaller than `lg` (1024px)"));
  }
  // Below the lower neighbor.
  const below = updateBreakpointValue(system, "lg", 700, "px");
  assert.equal(below.ok, false);
  if (!below.ok) assert.ok(below.error.includes("larger than `md` (768px)"));
  // Above the upper neighbor.
  const above = updateBreakpointValue(system, "md", 2000, "px");
  assert.equal(above.ok, false);
  if (!above.ok) assert.ok(above.error.includes("smaller than `lg` (1024px)"));
  // Untouched on rejection.
  assert.equal(scaleOf(system).find((token) => token.id === "md")?.value, "768px");
  // Parsing edge cases.
  assert.deepEqual(parseBreakpointValue("768px"), { amount: 768, unit: "px" });
  assert.deepEqual(parseBreakpointValue("48rem"), { amount: 48, unit: "rem" });
  assert.deepEqual(parseBreakpointValue("768"), { amount: 768, unit: "px" });
  assert.deepEqual(parseBreakpointValue("0"), { amount: 0, unit: "px" });
  for (const bad of ["-1px", "auto", "12em", "12pt", "", "px", "1.2.3px", "9000px", "500rem", null, undefined, 12]) {
    assert.equal(parseBreakpointValue(bad), null, JSON.stringify(bad));
  }
  assert.equal(formatBreakpointValue({ amount: 768, unit: "px" }), "768px");
  assert.equal(breakpointPx({ value: "48rem" }), 768);
  assert.equal(breakpointPx({ value: "nope" }), null);
  assert.equal(humanBreakpointLabel("my-tablet"), "My tablet");
});

test("adding a valid custom breakpoint works with a unique stable id", () => {
  const system = manthanSystem();
  const scale = scaleOf(system);
  const created = createBreakpointToken({ label: "Tablet!", amount: 900, unit: "px" }, scale);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "tablet");
  assert.equal(created.token.value, "900px");
  // Inserted in sorted position, never silently reordering existing ids.
  const inserted = insertBreakpointToken(scale, created.token);
  assert.deepEqual(
    inserted.map((token) => token.id),
    ["base", "sm", "md", "tablet", "lg", "xl", "2xl"],
  );

  const explicit = createBreakpointToken({ id: "Wide Screen", label: "ignored", amount: 2000, unit: "px" }, scale);
  assert.equal(explicit.ok, true);
  if (!explicit.ok) return;
  assert.equal(explicit.token.id, "wide-screen");

  assert.equal(createBreakpointToken({ id: "md", amount: 1, unit: "px" }, scale).ok, false);
  assert.equal(createBreakpointToken({ id: "!!", amount: 1, unit: "px" }, scale).ok, false);
  assert.equal(createBreakpointToken({ amount: 1, unit: "px" }, scale).ok, false);
  assert.equal(createBreakpointToken({ label: "x", amount: -2, unit: "px" }, scale).ok, false);
  assert.equal(createBreakpointToken({ id: "base", label: "x", amount: 10, unit: "px" }, scale).ok, false);
  // Duplicate threshold of an existing token is rejected, naming the blocker.
  const clash = createBreakpointToken({ label: "Clone", amount: 768, unit: "px" }, scale);
  assert.equal(clash.ok, false);
  if (!clash.ok) assert.ok(clash.error.includes("md already starts at 768px"));
  assert.equal(slugifyBreakpointId("  ", []), "token");
  assert.equal(slugifyBreakpointId("MD", ["md"]), "md-2");
});

test("label edits do not break breakpoint identity", () => {
  const system = manthanSystem();
  const renamed = updateBreakpointLabel(system, "md", "  Tablet landscape  ");
  assert.equal(scaleOf(renamed).find((token) => token.id === "md")?.label, "Tablet landscape");
  assert.equal(scaleOf(renamed).find((token) => token.id === "md")?.id, "md");
  const blankLabel = updateBreakpointLabel(system, "md", "   ");
  assert.equal(scaleOf(blankLabel).find((token) => token.id === "md")?.label, "Medium");
  const described = updateBreakpointDescription(system, "md", "  Tablets and up  ");
  assert.equal(scaleOf(described).find((token) => token.id === "md")?.description, "Tablets and up");
  const cleared = updateBreakpointDescription(described, "md", "   ");
  assert.equal(scaleOf(cleared).find((token) => token.id === "md")?.description, undefined);
});

test("Grid configuration remains attached to breakpoint ids after threshold edits", () => {
  const before = manthanSystem();
  const edited = updateBreakpointValue(before, "lg", 1100, "px");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  // Grid columns/gutter/gaps are untouched — only the threshold moved, so the
  // existing keyed configuration activates at the new viewport instead.
  assert.deepEqual(edited.system.foundations.grid, before.foundations.grid);
  assert.equal(scaleOf(edited.system).find((token) => token.id === "lg")?.value, "1100px");
  assert.equal(activeBreakpoint(edited.system, 1099).id, "md");
  assert.equal(activeBreakpoint(edited.system, 1100).id, "lg");
});

test("effective active-breakpoint resolution is correct across widths", () => {
  const system = manthanSystem();
  assert.equal(activeBreakpoint(system, 0).id, "base");
  assert.equal(activeBreakpoint(system, 390).id, "base");
  assert.equal(activeBreakpoint(system, 640).id, "sm");
  assert.equal(activeBreakpoint(system, 767).id, "sm");
  assert.equal(activeBreakpoint(system, 768).id, "md");
  assert.equal(activeBreakpoint(system, 1024).id, "lg");
  assert.equal(activeBreakpoint(system, 1280).id, "xl");
  assert.equal(activeBreakpoint(system, 1536).id, "2xl");
  assert.equal(activeBreakpoint(system, 5000).id, "2xl");
  assert.equal(activeBreakpoint(system, -50).id, "base");
  assert.equal(activeBreakpoint(system, Number.NaN).id, "base");
});

test("deleting a Grid-referenced breakpoint is blocked", () => {
  const system = manthanSystem();
  const references = findBreakpointReferences(system, "md");
  // Manthan wires "md" to a Card override and every canonical breakpoint now
  // carries a responsive Grid profile keyed by the same stable id.
  assert.ok(references.some((ref) => ref.kind === "component" && ref.pointer === "Card.columns"));
  assert.ok(references.some((ref) => ref.kind === "grid"));
  const guard = canDeleteBreakpoint(system, "md");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("md is used by"));
  assert.ok(guard.reasons[0]?.includes("Card.columns"));
  assert.deepEqual(guard.references, references);

  const solo: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      breakpoints: {
        scale: [
          { id: "base", label: "Base", value: "0px" },
          { id: "only", label: "Only", value: "800px" },
        ],
      },
    },
  };
  const last = canDeleteBreakpoint(solo, "only");
  assert.equal(last.ok, false);
  if (!last.ok) assert.ok(last.reasons[0]?.toLowerCase().includes("last"));
  assert.equal(canDeleteBreakpoint(system, "ghost").ok, false);
});

test("applying a preset requires confirmation when user edits exist", () => {
  const pristine = manthanSystem();
  assert.equal(hasCustomBreakpointEdits(pristine), false);
  const edited = updateBreakpointValue(pristine, "md", 800, "px");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  assert.equal(hasCustomBreakpointEdits(edited.system), true);

  const preset = BREAKPOINT_PRESETS.find((entry) => entry.id === "wide")!;
  const diff = diffBreakpointScales(
    scaleOf(edited.system),
    preset.scale,
  );
  assert.ok(diff.changed.some((entry) => entry.id === "md" && entry.from.includes("800px") && entry.to.includes("900px")));

  const applied = applyBreakpointPreset(edited.system, preset);
  assert.equal(scaleOf(applied).find((token) => token.id === "md")?.value, "900px");
  assert.deepEqual(breakpointIssues(applied), []);
});

test("resetting one token changes only that breakpoint", () => {
  const first = updateBreakpointValue(manthanSystem(), "md", 800, "px");
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const edited = updateBreakpointValue(first.system, "lg", 1100, "px");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const reset = resetBreakpointToStarter(edited.system, "md");
  assert.ok(reset);
  assert.equal(scaleOf(reset!).find((token) => token.id === "md")?.value, "768px");
  assert.equal(scaleOf(reset!).find((token) => token.id === "lg")?.value, "1100px");
  assert.equal(resetBreakpointToStarter(edited.system, "tablet"), null);
  const relabeled = updateBreakpointLabel(reset!, "md", "Tablet");
  assert.equal(scaleOf(relabeled).find((token) => token.id === "md")?.label, "Tablet");
});

test("restoring full scale returns starter defaults after confirmation", () => {
  const edited = updateBreakpointValue(manthanSystem(), "md", 800, "px");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const restored = restoreStarterBreakpoints(edited.system);
  assert.deepEqual(
    scaleOf(restored).map((token) => token.id),
    ["base", "sm", "md", "lg", "xl", "2xl"],
  );
  assert.equal(scaleOf(restored).find((token) => token.id === "md")?.value, "768px");
  assert.deepEqual(breakpointIssues(restored), []);
  assert.deepEqual(validateDesignSystem(restored), []);
});

test("reordering keeps numerical order valid or is rejected", () => {
  const system = manthanSystem();
  // Custom middle token can move within its valid range.
  const created = createBreakpointToken({ label: "Tablet", amount: 900, unit: "px" }, scaleOf(system));
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withCustom = {
    ...system,
    foundations: {
      ...system.foundations,
      breakpoints: { scale: insertBreakpointToken(scaleOf(system), created.token) },
    },
  };
  assert.deepEqual(
    scaleOf(withCustom).map((token) => token.id),
    ["base", "sm", "md", "tablet", "lg", "xl", "2xl"],
  );
  // Moving tablet below md (768px) would break ascending order.
  const blocked = moveBreakpoint(withCustom, "tablet", -1);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.ok(blocked.error.includes("ascending order"));
  // Moving it above lg is equally invalid here (lg is 1024px).
  assert.equal(moveBreakpoint(withCustom, "tablet", 1).ok, false);
  // Base can never move.
  assert.equal(moveBreakpoint(withCustom, "base", 1).ok, false);
  // A no-op-safe move on an unmovable edge reports clearly.
  assert.equal(moveBreakpoint(system, "base", -1).ok, false);
});

test("legacy Record scales normalize without data loss", () => {
  const legacy = { xs: "0px", sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" };
  const normalized = ensureBreakpointScale(legacy);
  assert.deepEqual(
    normalized.map((token) => token.id),
    ["base", "sm", "md", "lg", "xl", "2xl"],
  );
  assert.equal(normalized.find((token) => token.id === "base")?.value, "0px");
  assert.equal(normalized.find((token) => token.id === "md")?.value, "768px");
  assert.deepEqual(ensureBreakpointScale(undefined).map((token) => token.id).slice(0, 2), ["base", "sm"]);
});

test("deleting an unused custom breakpoint works", () => {
  const system = manthanSystem();
  const created = createBreakpointToken({ label: "Tablet", amount: 900, unit: "px" }, scaleOf(system));
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withCustom: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      breakpoints: { scale: insertBreakpointToken(scaleOf(system), created.token) },
    },
  };
  assert.deepEqual(canDeleteBreakpoint(withCustom, created.token.id), { ok: true });
  const removed = removeBreakpoint(withCustom, created.token.id);
  assert.ok(!scaleOf(removed).some((token) => token.id === created.token.id));
  assert.equal(scaleOf(removed).length, scaleOf(withCustom).length - 1);
});
