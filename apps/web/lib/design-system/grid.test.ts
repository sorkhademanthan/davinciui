// Focused Grid tests (Step 7G). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultGrid,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import { activeBreakpoint, updateBreakpointValue } from "./breakpoints";
import {
  GRID_PRESETS,
  applyGridPreset,
  breakpointIdsWithGridProfiles,
  canDeleteContainer,
  containerPx,
  createContainer,
  diffGrids,
  effectiveProfile,
  ensureGridForSystem,
  gridIssues,
  hasCustomGridEdits,
  insertContainer,
  isSpacingTokenUsedByGrid,
  parseContainerValue,
  removeContainer,
  resetProfileToStarter,
  resolveGridForWidth,
  restoreStarterGrid,
  setDefaultContainer,
  spacingReferencesInGrid,
  updateContainerLabel,
  updateContainerValue,
  updateProfileColumns,
  updateProfileGap,
} from "./grid";

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

test("responsive Grid resolution at 390, 768, 1024, and 1440px", () => {
  const system = manthanSystem();
  const at390 = resolveGridForWidth(system, 390);
  const at768 = resolveGridForWidth(system, 768);
  const at1024 = resolveGridForWidth(system, 1024);
  const at1440 = resolveGridForWidth(system, 1440);
  assert.equal(at390.breakpointId, "base");
  assert.equal(at390.profile.columns, 4);
  assert.equal(at768.breakpointId, "md");
  assert.equal(at768.profile.columns, 8);
  assert.equal(at1024.breakpointId, "lg");
  assert.equal(at1024.profile.columns, 12);
  assert.equal(at1440.breakpointId, "xl");
  assert.equal(at1440.profile.columns, 12);
  // Active breakpoint drives resolution.
  assert.equal(activeBreakpoint(system, 390).id, at390.breakpointId);
  assert.equal(activeBreakpoint(system, 1440).id, at1440.breakpointId);
  assert.deepEqual(gridIssues(system), []);
  assert.deepEqual(validateDesignSystem(system), []);
});

test("breakpoint-threshold changes shift Grid activation without losing configuration", () => {
  const before = manthanSystem();
  const beforeLg = effectiveProfile(before, "lg");
  const edited = updateBreakpointValue(before, "lg", 1100, "px");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  // Grid values travel untouched; only the threshold moved.
  assert.deepEqual(ensureGridForSystem(edited.system).profiles, ensureGridForSystem(before).profiles);
  assert.equal(resolveGridForWidth(edited.system, 1099).breakpointId, "md");
  assert.equal(resolveGridForWidth(edited.system, 1100).breakpointId, "lg");
  assert.deepEqual(resolveGridForWidth(edited.system, 1100).profile, { ...beforeLg, breakpointId: "lg" });
  // Threshold edit never discards column values.
  assert.equal(resolveGridForWidth(edited.system, 1100).profile.columns, beforeLg.columns);
});

test("legacy flat Grid migration preserves user values", () => {
  const system = manthanSystem();
  const legacy: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      grid: { columns: 8, gutter: "24px", maxWidth: "1440px" } as unknown as DesignSystemConfig["foundations"]["grid"],
    },
  };
  const migrated = ensureGridForSystem(legacy);
  // Legacy flat values preserved verbatim.
  assert.equal(migrated.columns, 8);
  assert.equal(migrated.gutter, "24px");
  assert.equal(migrated.maxWidth, "1440px");
  // Standard container inherits the legacy maxWidth.
  assert.equal(migrated.containers.find((c) => c.id === "standard")?.value, "1440px");
  // 24px maps onto a real spacing token (space-5/space-6 in the 4px base).
  const gutterProfile = migrated.profiles.find((p) => p.breakpointId === "lg");
  assert.ok(gutterProfile);
  const spacingIds = new Set([
    ...system.foundations.spacing.scale.map((t) => t.id),
    ...system.foundations.sizing.tokens.map((t) => t.id),
  ]);
  assert.ok(spacingIds.has(gutterProfile!.gutter));
  // Seeded for every breakpoint id, including canonical six.
  for (const id of ["base", "sm", "md", "lg", "xl", "2xl"]) {
    assert.ok(migrated.profiles.some((p) => p.breakpointId === id), id);
  }
  // Unknown/custom breakpoint ids remain safe (seeded, not dropped).
  const withCustom: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      breakpoints: {
        scale: [
          ...system.foundations.breakpoints.scale,
          { id: "3xl", label: "Huge", value: "2000px" },
        ],
      },
    },
  };
  const seeded = ensureGridForSystem(withCustom);
  assert.ok(seeded.profiles.some((p) => p.breakpointId === "3xl"));
  assert.deepEqual(validateDesignSystem({ ...system, foundations: { ...system.foundations, grid: migrated } }), []);
});

test("valid container and spacing references", () => {
  const system = manthanSystem();
  const created = createContainer(system, { label: "Sidebar", value: "320px" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.container.id, "sidebar");
  const inserted = insertContainer(system, created.container);
  assert.ok(ensureGridForSystem(inserted).containers.some((c) => c.id === "sidebar"));

  const cols = updateProfileColumns(system, "md", 6);
  assert.equal(cols.ok, true);
  if (!cols.ok) return;
  assert.equal(effectiveProfile(cols.system, "md").columns, 6);

  const gap = updateProfileGap(system, "md", "columnGap", "space-6");
  assert.equal(gap.ok, true);
  if (!gap.ok) return;
  assert.equal(effectiveProfile(gap.system, "md").columnGap, "space-6");

  const renamed = updateContainerLabel(system, "narrow", "Narrow column");
  assert.equal(
    ensureGridForSystem(renamed).containers.find((c) => c.id === "narrow")?.label,
    "Narrow column",
  );
  // Container parsing edge cases.
  assert.deepEqual(parseContainerValue("1200px"), { amount: 1200, unit: "px" });
  assert.deepEqual(parseContainerValue("75rem"), { amount: 75, unit: "rem" });
  assert.equal(parseContainerValue("100%"), "full");
  assert.equal(containerPx({ value: "100%" }), null);
  assert.equal(containerPx({ value: "75rem" }), 1200);
  for (const bad of ["-1px", "auto", "12em", "", "px", "101%", null, undefined, 12]) {
    assert.equal(parseContainerValue(bad), null, JSON.stringify(bad));
  }
});

test("invalid columns/gutters/gaps rejected", () => {
  const system = manthanSystem();
  assert.equal(updateProfileColumns(system, "md", 0).ok, false);
  assert.equal(updateProfileColumns(system, "md", 13).ok, false);
  assert.equal(updateProfileColumns(system, "md", 2.5).ok, false);
  const badGap = updateProfileGap(system, "md", "gutter", "space-ghost");
  assert.equal(badGap.ok, false);
  if (!badGap.ok) assert.ok(badGap.error.includes("not a spacing token"));
  assert.equal(updateContainerValue(system, "narrow", "auto").ok, false);
  assert.equal(updateContainerValue(system, "narrow", "-10px").ok, false);
  assert.equal(createContainer(system, { label: "", value: "100px" }).ok, false);
  assert.equal(createContainer(system, { id: "narrow", label: "Duplicate", value: "100px" }).ok, false);
  // Untouched on rejection.
  assert.equal(effectiveProfile(system, "md").columns, 8);
});

test("referenced token/breakpoint deletion blocked", () => {
  const system = manthanSystem();
  // Every canonical breakpoint has a stored Grid profile → deletion must block.
  const withProfiles = breakpointIdsWithGridProfiles(system);
  for (const id of ["base", "md", "lg"]) {
    assert.ok(withProfiles.includes(id), id);
  }
  // Spacing tokens used by Grid cannot be safely deleted.
  assert.equal(isSpacingTokenUsedByGrid(system, "space-4"), true);
  assert.equal(isSpacingTokenUsedByGrid(system, "space-ghost"), false);
  const refs = spacingReferencesInGrid(system);
  assert.ok(refs.some((r) => r.value === "space-4"));
  // Containers: last/default guards.
  assert.equal(canDeleteContainer(system, "standard").ok, false);
  const solo: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      grid: {
        ...ensureGridForSystem(system),
        containers: [{ id: "only", label: "Only", value: "800px" }],
        defaultContainer: "only",
      },
    },
  };
  assert.equal(canDeleteContainer(solo, "only").ok, false);
  assert.equal(canDeleteContainer(system, "ghost").ok, false);
  // Removing an unused custom container works.
  const created = createContainer(system, { label: "Sidebar", value: "320px" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const inserted = insertContainer(system, created.container);
  assert.deepEqual(canDeleteContainer(inserted, "sidebar"), { ok: true });
  const removed = removeContainer(inserted, "sidebar");
  assert.ok(!ensureGridForSystem(removed).containers.some((c) => c.id === "sidebar"));
});

test("preset confirmation and reset behavior", () => {
  const pristine = manthanSystem();
  assert.equal(hasCustomGridEdits(pristine), false);
  const edited = updateProfileColumns(pristine, "md", 6);
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  assert.equal(hasCustomGridEdits(edited.system), true);

  const preset = GRID_PRESETS.find((p) => p.id === "dashboard")!;
  const diff = diffGrids(ensureGridForSystem(edited.system), {
    ...ensureGridForSystem(edited.system),
    containers: preset.containers.map((c) => ({ ...c })),
    profiles: preset.profiles.map((p) => ({ ...p })),
    defaultContainer: preset.defaultContainer,
  });
  assert.ok(diff.profilesChanged.length > 0);

  const applied = applyGridPreset(edited.system, preset);
  // Breakpoint thresholds untouched by Grid presets.
  assert.deepEqual(
    applied.foundations.breakpoints.scale.map((t) => t.value),
    edited.system.foundations.breakpoints.scale.map((t) => t.value),
  );
  assert.equal(effectiveProfile(applied, "md").columns, 8);
  assert.deepEqual(gridIssues(applied), []);

  // Reset one profile changes only that breakpoint.
  // Rebuild cleanly for single-reset assertion.
  const step1 = updateProfileColumns(pristine, "md", 6);
  assert.equal(step1.ok, true);
  if (!step1.ok) return;
  const step2 = updateProfileColumns(step1.system, "lg", 6);
  assert.equal(step2.ok, true);
  if (!step2.ok) return;
  const reset = resetProfileToStarter(step2.system, "md");
  assert.ok(reset);
  assert.equal(effectiveProfile(reset!, "md").columns, 8);
  assert.equal(effectiveProfile(reset!, "lg").columns, 6);

  // Restore full grid returns starter defaults.
  const restored = restoreStarterGrid(step2.system);
  assert.equal(hasCustomGridEdits(restored), false);
  assert.equal(effectiveProfile(restored, "md").columns, 8);
  assert.deepEqual(gridIssues(restored), []);
  assert.deepEqual(validateDesignSystem(restored), []);

  // Default container switching with guard.
  const setDefault = setDefaultContainer(pristine, "wide");
  assert.equal(setDefault.ok, true);
  if (!setDefault.ok) return;
  assert.equal(ensureGridForSystem(setDefault.system).defaultContainer, "wide");
  assert.equal(setDefaultContainer(pristine, "ghost").ok, false);
});

test("persistence after reload and preview-resolution changes", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const edited = updateProfileColumns(manthanSystem(), "lg", 10);
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const saved = store.save(edited.system);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.system.id);
  assert.ok(reloaded);
  assert.equal(effectiveProfile(reloaded!, "lg").columns, 10);
  assert.equal(resolveGridForWidth(reloaded!, 390).profile.columns, 4);
  assert.equal(resolveGridForWidth(reloaded!, 1024).profile.columns, 10);
  assert.equal(resolveGridForWidth(reloaded!, 1440).profile.columns, 12);
  // Default grid shape itself is valid.
  assert.deepEqual(ensureGridForSystem(manthanSystem()).containers.map((c) => c.id), [
    "narrow",
    "reading",
    "standard",
    "wide",
    "full",
  ]);
  assert.equal(defaultGrid().profiles.length, 6);
});
