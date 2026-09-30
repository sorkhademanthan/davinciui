// Focused Typography foundation tests (Step 6). Same convention as previous
// steps: compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDesignSystem, type DesignSystemConfig } from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  applyFamilyToRoleStyles,
  assignFontFamily,
  ensureTextStyles,
  parseFallbackStack,
  parseFamilyName,
  parseFontSize,
  parseLetterSpacing,
  parseLineHeight,
  parseWeight,
  resetRoleToStarter,
  resetStyleToRole,
  STYLE_DEFINITIONS,
  styleForPreview,
  styleOverrides,
  updateRole,
  updateStyle,
} from "./typography";
import { fallbacksFor, findFont, isCustomFamily, renderStack, searchFonts } from "./font-catalog";

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

function manthan(): DesignSystemConfig {
  return createSystemFromStarter({ starterId: "blank", name: "Manthan" });
}

test("each role can hold a different family and fallback stack", () => {
  let system = manthan();
  system = updateRole(system, "display", { fontFamily: "Georgia", fallback: ["Georgia", "serif"] });
  system = updateRole(system, "body", { fontFamily: "Inter", fallback: ["system-ui", "sans-serif"] });
  system = updateRole(system, "mono", { fontFamily: "JetBrains Mono", fallback: ["ui-monospace", "monospace"] });
  assert.equal(system.foundations.typography.roles.display.fontFamily, "Georgia");
  assert.deepEqual(system.foundations.typography.roles.display.fallback, ["Georgia", "serif"]);
  assert.equal(system.foundations.typography.roles.body.fontFamily, "Inter");
  assert.equal(system.foundations.typography.roles.mono.fontFamily, "JetBrains Mono");
  assert.deepEqual(validateDesignSystem(system), []);
});

test("editing Body does not mutate Display, Heading, Label, or Mono", () => {
  const before = manthan();
  const after = updateRole(before, "body", { fontFamily: "Manrope", weight: 500, size: "1.0625rem" });
  assert.equal(after.foundations.typography.roles.body.fontFamily, "Manrope");
  for (const role of ["display", "heading", "label", "mono"] as const) {
    assert.deepEqual(after.foundations.typography.roles[role], before.foundations.typography.roles[role]);
  }
  // The input system is untouched (pure update).
  assert.equal(before.foundations.typography.roles.body.fontFamily, "Inter");
});

test("a font assignment updates its related roles and styles without changing the others", () => {
  const before = manthan();
  const after = assignFontFamily(
    before,
    ["display", "heading"],
    "Roboto",
    ["system-ui", "sans-serif"],
  );
  assert.equal(after.foundations.typography.roles.display.fontFamily, "Roboto");
  assert.equal(after.foundations.typography.roles.heading.fontFamily, "Roboto");
  assert.equal(after.foundations.typography.roles.body.fontFamily, before.foundations.typography.roles.body.fontFamily);
  assert.equal(ensureTextStyles(after).find((style) => style.id === "h1")?.fontFamily, "Roboto");
  assert.equal(ensureTextStyles(after).find((style) => style.id === "body")?.fontFamily, before.foundations.typography.roles.body.fontFamily);
  assert.deepEqual(validateDesignSystem(after), []);
});

test("editing h1 does not mutate h2 or body styles", () => {
  const before = manthan();
  const h2Before = ensureTextStyles(before).find((style) => style.id === "h2");
  const bodyBefore = ensureTextStyles(before).find((style) => style.id === "body");
  const after = updateStyle(before, "h1", { weight: 800, size: "2.75rem" });
  const styles = ensureTextStyles(after);
  assert.equal(styles.find((style) => style.id === "h1")?.weight, 800);
  assert.equal(styles.find((style) => style.id === "h1")?.size, "2.75rem");
  assert.deepEqual(styles.find((style) => style.id === "h2"), h2Before);
  assert.deepEqual(styles.find((style) => style.id === "body"), bodyBefore);
});

test("resetting an overridden style returns it to its role/default value", () => {
  let system = manthan();
  // Fresh starter styles read as inherited (definition defaults included).
  for (const id of ["display", "h1", "h2", "h3", "body", "label", "code"]) {
    assert.equal(styleOverrides(system, id).overridden, false, id);
  }
  system = updateStyle(system, "h1", { weight: 800, size: "2.75rem" });
  const report = styleOverrides(system, "h1");
  assert.equal(report.overridden, true);
  assert.ok(report.fields.includes("weight"));
  assert.ok(report.fields.includes("size"));
  assert.ok(!report.fields.includes("lineHeight"));

  const reset = resetStyleToRole(system, "h1");
  const resetReport = styleOverrides(reset, "h1");
  assert.equal(resetReport.overridden, false);
  assert.deepEqual(resetReport.fields, []);
  // Reset target is the h1 definition default (2.25rem/700), not the bare role.
  const h1 = ensureTextStyles(reset).find((style) => style.id === "h1")!;
  assert.equal(h1.weight, 700);
  assert.equal(h1.size, "2.25rem");
  assert.equal(h1.lineHeight, reset.foundations.typography.roles.heading.lineHeight);
});

test("missing h4 and caption styles are derived from roles, existing kept", () => {
  const system = manthan();
  const ids = system.foundations.typography.styles.map((style) => style.id);
  assert.ok(!ids.includes("h4"));
  assert.ok(!ids.includes("caption"));
  const styles = ensureTextStyles(system);
  assert.deepEqual(
    styles.map((style) => style.id),
    [...STYLE_DEFINITIONS.map((definition) => definition.id)],
  );
  const h4 = styles.find((style) => style.id === "h4")!;
  assert.equal(h4.role, "heading");
  assert.equal(h4.size, "1.25rem");
  assert.equal(h4.fontFamily, system.foundations.typography.roles.heading.fontFamily);
  const caption = styles.find((style) => style.id === "caption")!;
  assert.equal(caption.size, "0.75rem");
});

test("resetting a role to its starter default restores starter values", () => {
  let system = manthan();
  system = updateRole(system, "display", { fontFamily: "Comic Sans", size: "9rem" });
  const starter = createSystemFromStarter({ starterId: "blank", name: "Reset probe" });
  const reset = resetRoleToStarter(system, "display", starter.foundations.typography);
  assert.deepEqual(reset.foundations.typography.roles.display, starter.foundations.typography.roles.display);
  // Other roles untouched; overridden display styles stay visibly overridden.
  assert.deepEqual(reset.foundations.typography.roles.body, system.foundations.typography.roles.body);
});

test("applying a family to role styles touches only that role", () => {
  let system = manthan();
  system = updateRole(system, "heading", { fontFamily: "Fraunces" });
  const applied = applyFamilyToRoleStyles(system, "heading");
  const styles = ensureTextStyles(applied);
  for (const style of styles) {
    if (style.role === "heading") assert.equal(style.fontFamily, "Fraunces");
    else assert.notEqual(style.fontFamily, "Fraunces");
  }
});

test("valid custom font-family and fallback entries persist after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  let system = createSystemFromStarter({ starterId: "blank", name: "Manthan" });
  system = updateRole(system, "display", {
    fontFamily: "My Custom Display",
    fallback: ["My Custom Display", "Georgia", "serif"],
  });
  system = updateStyle(system, "code", { fontFamily: "My Custom Mono", fallback: ["SFMono-Regular", "monospace"] });
  const saved = store.save(system);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(system.id);
  assert.ok(reloaded);
  assert.equal(reloaded!.foundations.typography.roles.display.fontFamily, "My Custom Display");
  assert.deepEqual(reloaded!.foundations.typography.roles.display.fallback, ["My Custom Display", "Georgia", "serif"]);
  assert.equal(
    ensureTextStyles(reloaded!).find((style) => style.id === "code")?.fontFamily,
    "My Custom Mono",
  );
  assert.deepEqual(validateDesignSystem(reloaded!), []);
});

test("invalid numeric values are rejected or normalized safely", () => {
  assert.equal(parseWeight("700"), 700);
  assert.equal(parseWeight("abc"), null);
  assert.equal(parseWeight("50"), 50);
  assert.equal(parseWeight("0"), null);
  assert.equal(parseWeight("1200"), null);

  assert.equal(parseFontSize("1.5rem"), "1.5rem");
  assert.equal(parseFontSize("16PX"), "16px");
  assert.equal(parseFontSize("16"), "16px");
  assert.equal(parseFontSize("0"), null);
  assert.equal(parseFontSize("-2rem"), null);
  assert.equal(parseFontSize("huge"), null);
  assert.equal(parseFontSize("500px"), null);

  assert.equal(parseLineHeight("1.5"), 1.5);
  assert.equal(parseLineHeight("0.4"), null);
  assert.equal(parseLineHeight("4"), null);
  assert.equal(parseLineHeight("24px"), "24px");
  assert.equal(parseLineHeight("tall"), null);

  assert.equal(parseLetterSpacing("0.02em"), "0.02em");
  assert.equal(parseLetterSpacing("-0.01EM"), "-0.01em");
  assert.equal(parseLetterSpacing("0"), "0em");
  assert.equal(parseLetterSpacing("2px"), "2px");
  assert.equal(parseLetterSpacing("wide"), null);

  assert.deepEqual(parseFallbackStack("Georgia, Times New Roman,, serif "), ["Georgia", "Times New Roman", "serif"]);
  assert.deepEqual(parseFallbackStack("   "), []);
  assert.equal(parseFamilyName("  Inter  "), "Inter");
  assert.equal(parseFamilyName("   "), null);
});

test("starter typography remains valid after edits", () => {
  let system = createSystemFromStarter({ starterId: "editorial", name: "Manthan" });
  system = updateRole(system, "body", { fontFamily: "Inter" });
  system = updateRole(system, "display", { fontFamily: "Fraunces" });
  system = updateRole(system, "mono", { fontFamily: "JetBrains Mono" });
  system = updateStyle(system, "h1", { weight: 800, size: "2.75rem" });
  system = updateStyle(system, "caption", { letterSpacing: "0.04em" });
  assert.deepEqual(validateDesignSystem(system), []);
});

test("preview style resolution changes after a role/style update", () => {
  const before = styleForPreview(manthan(), "h1");
  assert.ok(before.fontFamily.startsWith("Inter"));
  let system = updateRole(manthan(), "heading", { fontFamily: "Fraunces", size: "2rem" });
  const afterRole = styleForPreview(system, "h1");
  // Snapshots do not auto-propagate: the existing h1 keeps its values until reset.
  assert.deepEqual(afterRole, before);
  system = resetStyleToRole(system, "h1");
  const afterReset = styleForPreview(system, "h1");
  assert.ok(afterReset.fontFamily.startsWith("Fraunces"));
  // Reset restores the h1 definition default (2.25rem), not the edited role size.
  assert.equal(afterReset.fontSize, "2.25rem");
  assert.notDeepEqual(
    { family: before.fontFamily, size: before.fontSize },
    { family: afterReset.fontFamily, size: afterReset.fontSize },
  );
});

test("font catalogue search, filter, and custom behavior", () => {
  for (const family of ["Inter", "Manrope", "DM Sans", "Plus Jakarta Sans", "Space Grotesk", "Geist", "Georgia"]) {
    assert.ok(findFont(family), `${family} in catalogue`);
    assert.equal(isCustomFamily(family), false);
  }
  assert.equal(findFont("My Custom Display"), null);
  assert.equal(isCustomFamily("My Custom Display"), true);
  assert.equal(isCustomFamily("  "), false);

  const sans = searchFonts("", "sans");
  assert.ok(sans.length > 0 && sans.every((entry) => entry.category === "sans"));
  const found = searchFonts("plex", "all");
  assert.ok(found.length >= 3);
  assert.ok(searchFonts("zxqv", "all").length === 0);

  assert.equal(renderStack("Inter", ["system-ui", "sans-serif"]), "Inter, system-ui, sans-serif");
  assert.equal(renderStack("DM Sans", ["sans-serif"]), '"DM Sans", sans-serif');
  assert.deepEqual(fallbacksFor("Inter"), findFont("Inter")!.fallbacks);
  assert.deepEqual(fallbacksFor("Unknown Family", "mono"), ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]);
});
