// Focused Icons tests (Step 7F). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultIcons,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  canDeleteIconSize,
  createIconSize,
  diffIcons,
  duplicateIconSize,
  ensureIconSizes,
  findIconReferences,
  formatIconSize,
  hasCustomIconEdits,
  humanIconLabel,
  iconColorOptions,
  iconIssues,
  iconSizePx,
  isRenderedSource,
  parseIconSize,
  pxOfIconSize,
  removeIconSize,
  resetIconSizeToStarter,
  resolveIconColor,
  restoreStarterIcons,
  setDefaultSize,
  setIconColor,
  setIconSource,
  setLineCap,
  setLineJoin,
  setStrokeWidth,
  slugifyIconId,
  STROKE_PRESETS,
  updateIconLabel,
  updateIconSize,
  LINE_CAPS,
  LINE_JOINS,
} from "./icons";

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

/** Blank "Manthan" system with icon-md wired to a component token. */
function manthanSystem(): DesignSystemConfig {
  const system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  return {
    ...system,
    components: [
      ...system.components,
      {
        component: "badge",
        label: "Badge",
        overrides: [{ token: "icon", value: "icon-md" }],
      },
    ],
  };
}

function sizeIds(system: DesignSystemConfig): string[] {
  return system.foundations.icons.sizes.map((token) => token.id);
}

test("starter icon configurations are valid", () => {
  assert.equal(defaultIcons().library, "lucide");
  assert.deepEqual(
    defaultIcons().sizes.map((token) => token.id),
    ["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"],
  );
  for (const starter of ["blank", "saas", "enterprise", "editorial"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    for (const id of ["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"]) {
      assert.ok(sizeIds(system).includes(id), `${starter}: size ${id}`);
    }
    for (const role of ["default", "muted", "action", "success", "warning", "danger"] as const) {
      assert.ok(resolveIconColor(system, role) !== null, `${starter}: color ${role} resolves`);
    }
    assert.deepEqual(iconIssues(system), [], `${starter}: no icon issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
});

test("Lucide is the default supported rendered source", () => {
  assert.equal(isRenderedSource("lucide"), true);
  assert.equal(isRenderedSource("custom"), false);
  assert.equal(isRenderedSource("font-awesome"), false);
  const system = manthanSystem();
  assert.equal(system.foundations.icons.library, "lucide");
  const custom = setIconSource(system, "custom");
  assert.equal(custom.ok, true);
  if (!custom.ok) return;
  assert.equal(custom.system.foundations.icons.library, "custom");
  assert.equal(isRenderedSource(custom.system.foundations.icons.library), false);
  // Unsupported libraries are rejected, never selectable.
  assert.equal(setIconSource(system, "font-awesome").ok, false);
  assert.equal(setIconSource(system, "").ok, false);
});

test("icon size and color role updates persist after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  let edited = updateIconSize(manthanSystem(), "icon-md", 22, "px");
  const colored = setIconColor(edited, "action", "neutral.900");
  assert.equal(colored.ok, true);
  if (!colored.ok) return;
  edited = colored.system;
  const saved = store.save(edited);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.id);
  assert.ok(reloaded);
  assert.equal(reloaded!.foundations.icons.sizes.find((token) => token.id === "icon-md")?.value, "22px");
  assert.equal(reloaded!.foundations.icons.colors.action, "neutral.900");
  // Untouched siblings survive the round trip.
  assert.equal(reloaded!.foundations.icons.sizes.find((token) => token.id === "icon-sm")?.value, "16px");
  assert.equal(reloaded!.foundations.icons.sizes.find((token) => token.id === "icon-sm")?.label, "Small");
});

test("size token ids are unique and invalid values are rejected", () => {
  const system = manthanSystem();
  const ids = sizeIds(system);
  const created = createIconSize({ label: "Hero Glyph!", amount: 48, unit: "px" }, ids);
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "hero-glyph");
  assert.equal(created.token.value, "48px");

  const explicit = createIconSize({ id: "My Glyph", label: "ignored", amount: 1.5, unit: "rem" }, ids);
  assert.equal(explicit.ok, true);
  if (!explicit.ok) return;
  assert.equal(explicit.token.id, "my-glyph");
  assert.equal(explicit.token.value, "1.5rem");

  assert.equal(createIconSize({ id: "icon-md", amount: 1, unit: "px" }, ids).ok, false);
  assert.equal(createIconSize({ id: "!!", amount: 1, unit: "px" }, ids).ok, false);
  assert.equal(createIconSize({ amount: 1, unit: "px" }, ids).ok, false);
  assert.equal(createIconSize({ label: "x", amount: -2, unit: "px" }, ids).ok, false);
  assert.equal(slugifyIconId("  ", []), "token");
  assert.equal(slugifyIconId("Icon MD", ["icon-md"]), "icon-md-2");
  assert.equal(humanIconLabel("my-glyph"), "My glyph");

  assert.deepEqual(parseIconSize("20px"), { amount: 20, unit: "px" });
  assert.deepEqual(parseIconSize("1.5rem"), { amount: 1.5, unit: "rem" });
  assert.deepEqual(parseIconSize("20"), { amount: 20, unit: "px" });
  assert.deepEqual(parseIconSize("0"), { amount: 0, unit: "px" });
  for (const bad of ["-4px", "auto", "20em", "20pt", "", "px", "300px", "20rem", null, undefined, 20]) {
    assert.equal(parseIconSize(bad), null, JSON.stringify(bad));
  }
  assert.equal(formatIconSize({ amount: 20, unit: "px" }), "20px");
  assert.equal(pxOfIconSize({ id: "icon-md", label: "Medium", value: "20px" }), 20);
  assert.equal(pxOfIconSize({ id: "x", label: "X", value: "1.5rem" }), 24);
  assert.equal(pxOfIconSize({ id: "x", label: "X", value: "nope" }), null);
});

test("palette-shade reference resolution drives icon color roles", () => {
  const system = manthanSystem();
  const before = resolveIconColor(system, "action");
  assert.ok(before);
  const edited: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      colors: {
        palettes: system.foundations.colors.palettes.map((palette) =>
          palette.id === "neutral" ? { ...palette, shades: { ...palette.shades, "900": "#123456" } } : palette,
        ),
      },
    },
  };
  assert.equal(resolveIconColor(edited, "action"), "#123456");
  assert.notEqual(resolveIconColor(edited, "action"), before);
  // Raw hex fallback is allowed and documented.
  const hexed = setIconColor(system, "action", "#ABCDEF");
  assert.equal(hexed.ok, true);
  // Unknown references are rejected with guidance.
  assert.equal(setIconColor(system, "action", "missing.999").ok, false);
  assert.equal(setIconColor(system, "action", "").ok, false);
  assert.equal(setIconColor(system, "nope" as never, "neutral.900").ok, false);
  // Pickers expose palette shades first, then semantic aliases.
  const options = iconColorOptions(system);
  assert.ok(options.some((option) => option.value === "neutral.900"));
  assert.ok(options.some((option) => option.value === "text.primary"));
  assert.ok(
    options.findIndex((option) => option.value === "text.primary") >
      options.findIndex((option) => option.value === "neutral.900"),
  );
});

test("editing the visible label does not break stable ids", () => {
  const system = manthanSystem();
  const renamed = updateIconLabel(system, "icon-md", "  Medium +  ");
  assert.equal(renamed.foundations.icons.sizes.find((token) => token.id === "icon-md")?.label, "Medium +");
  assert.equal(renamed.foundations.icons.sizes.find((token) => token.id === "icon-md")?.id, "icon-md");
  const blankLabel = updateIconLabel(system, "icon-md", "   ");
  assert.equal(blankLabel.foundations.icons.sizes.find((token) => token.id === "icon-md")?.label, "Medium");
});

test("deleting unused custom sizes works", () => {
  const system = manthanSystem();
  const created = createIconSize({ label: "Hero", amount: 48, unit: "px" }, sizeIds(system));
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const withExtra: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      icons: { ...system.foundations.icons, sizes: [...system.foundations.icons.sizes, created.token] },
    },
  };
  assert.deepEqual(canDeleteIconSize(withExtra, created.token.id), { ok: true });
  const removed = removeIconSize(withExtra, created.token.id);
  assert.ok(!removed.foundations.icons.sizes.some((token) => token.id === created.token.id));
});

test("deleting referenced icon tokens is blocked", () => {
  const system = manthanSystem();
  const references = findIconReferences(system, "icon-md");
  assert.equal(references.length, 1);
  assert.equal(references[0]?.kind, "component");
  assert.equal(references[0]?.pointer, "Badge.icon");
  const guard = canDeleteIconSize(system, "icon-md");
  assert.equal(guard.ok, false);
  if (guard.ok) return;
  assert.ok(guard.reasons[0]?.includes("icon-md is used by 1 token (Badge.icon)"));
  assert.deepEqual(guard.references, references);

  // The default size cannot go while it is the default.
  assert.equal(canDeleteIconSize(system, "icon-md").ok, false);
  const solo: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      icons: {
        ...system.foundations.icons,
        defaultSize: "icon-xl",
        sizes: [{ id: "icon-xl", label: "X-Large", value: "32px" }],
      },
    },
  };
  const last = canDeleteIconSize(solo, "icon-xl");
  assert.equal(last.ok, false);
  if (!last.ok) assert.ok(last.reasons[0]?.toLowerCase().includes("last"));
  assert.equal(canDeleteIconSize(system, "ghost").ok, false);
});

test("reset one token affects only that token", () => {
  const edited = updateIconSize(updateIconSize(manthanSystem(), "icon-md", 22, "px"), "icon-sm", 18, "px");
  const reset = resetIconSizeToStarter(edited, "icon-md");
  assert.ok(reset);
  assert.equal(reset!.foundations.icons.sizes.find((token) => token.id === "icon-md")?.value, "20px");
  assert.equal(reset!.foundations.icons.sizes.find((token) => token.id === "icon-md")?.label, "Medium");
  assert.equal(reset!.foundations.icons.sizes.find((token) => token.id === "icon-sm")?.value, "18px");
  assert.equal(resetIconSizeToStarter(edited, "icon-custom"), null);

  const stroked = setStrokeWidth(edited, 3);
  assert.equal(stroked.ok, true);
  assert.equal(
    restoreStarterIcons(stroked.ok ? stroked.system : edited).foundations.icons.strokeWidth,
    2,
  );
});

test("full restore requires confirmation data and restores starter defaults", () => {
  const edited = updateIconSize(manthanSystem(), "icon-md", 22, "px");
  assert.equal(hasCustomIconEdits(edited), true);
  assert.equal(hasCustomIconEdits(manthanSystem()), false);
  const restored = restoreStarterIcons(edited);
  assert.deepEqual(
    restored.foundations.icons.sizes.map((token) => token.id),
    ["icon-xs", "icon-sm", "icon-md", "icon-lg", "icon-xl"],
  );
  assert.equal(restored.foundations.icons.sizes.find((token) => token.id === "icon-md")?.value, "20px");
  assert.equal(restored.foundations.icons.library, "lucide");
  assert.deepEqual(iconIssues(restored), []);
  assert.deepEqual(validateDesignSystem(restored), []);
});

test("stroke, caps, source, and default-size controls validate", () => {
  const system = manthanSystem();
  assert.equal(setStrokeWidth(system, 2.5).ok, true);
  assert.equal(setStrokeWidth(system, 0.25).ok, false);
  assert.equal(setStrokeWidth(system, 8).ok, false);
  assert.equal(setStrokeWidth(system, Number.NaN).ok, false);
  assert.deepEqual(STROKE_PRESETS.map((preset) => preset.width), [1, 1.5, 2, 2.5]);
  assert.equal(setLineCap(system, "butt").ok, true);
  assert.equal(setLineCap(system, "square").ok, true);
  assert.equal(setLineCap(system, "triangle" as never).ok, false);
  assert.equal(setLineJoin(system, "miter").ok, true);
  assert.equal(setLineJoin(system, "blob" as never).ok, false);
  assert.ok(LINE_CAPS.includes("round") && LINE_JOINS.includes("bevel"));
  assert.equal(setDefaultSize(system, "icon-lg").ok, true);
  assert.equal(setDefaultSize(system, "ghost").ok, false);
  // Deleting the default size is blocked until the default moves.
  assert.equal(canDeleteIconSize(system, "icon-md").ok, false);
  const moved = setDefaultSize(system, "icon-lg");
  assert.equal(moved.ok, true);
  if (!moved.ok) return;
  // icon-md is still referenced by the Badge component override.
  assert.equal(canDeleteIconSize(moved.system, "icon-md").ok, false);
});

test("duplicate sizes are independent and legacy scales normalize", () => {
  const system = manthanSystem();
  const copy = duplicateIconSize(system, "icon-md");
  assert.ok(copy);
  assert.equal(copy!.id, "icon-md-copy");
  assert.equal(copy!.label, "Medium copy");
  assert.equal(copy!.value, "20px");
  copy!.value = "99px";
  assert.equal(
    system.foundations.icons.sizes.find((token) => token.id === "icon-md")?.value,
    "20px",
  );
  assert.equal(duplicateIconSize(system, "ghost"), null);
  const legacy = ensureIconSizes({ "size-md": "20px", "size-lg": "24px" });
  assert.deepEqual(
    legacy.map((token) => token.id),
    ["size-lg", "size-md"],
  );
  assert.deepEqual(ensureIconSizes(undefined).map((token) => token.id), [
    "icon-xs",
    "icon-sm",
    "icon-md",
    "icon-lg",
    "icon-xl",
  ]);
});
