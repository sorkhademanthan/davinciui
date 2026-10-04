// Theme-mode regression coverage: the two theme layers (application chrome vs
// selected system theme) must stay independent. Same convention as the other
// focused tests: compile with the repo's TypeScript, then `node --test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSystemFromStarter } from "./starters";
import { createTheme, insertTheme, setOverride } from "./themes";
import { resolveBorderRecipe } from "./borders";
import { resolveIconColor } from "./icons";
import {
  buildCssVarMap,
  resolveComponentSlot,
  resolvePreview,
  resolveSemanticsForTheme,
} from "./preview";
import {
  COMPONENT_MANIFEST,
  manifestById,
} from "./component-manifest";
import { resolveBridgeValues } from "./component-curation";
import type { DesignSystemConfig } from "./domain";

/** Blank "Manthan" system. */
function manthanSystem(): DesignSystemConfig {
  return createSystemFromStarter({ starterId: "blank", name: "Manthan" });
}

function systemWithCustomTheme(): { system: DesignSystemConfig; customId: string } {
  const created = createTheme(manthanSystem(), { label: "Ember", mode: "dark", fromThemeId: "dark" });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("fixture setup failed");
  let system = insertTheme(manthanSystem(), created.theme);
  const edited = setOverride(system, created.theme.id, "background.canvas", "#2a1a4a");
  assert.equal(edited.ok, true);
  if (!edited.ok) throw new Error("fixture setup failed");
  system = edited.system;
  return { system, customId: created.theme.id };
}

/** Relative luminance of a six-digit hex color (0 = black, 1 = white). */
function luminance(hex: string): number {
  const linear = [1, 3, 5].map((at) => {
    const channel = parseInt(hex.slice(at, at + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

test("Light, Dark, and Custom themes produce distinct correct scoped values", () => {
  const { system, customId } = systemWithCustomTheme();
  const light = buildCssVarMap(system, "light");
  const dark = buildCssVarMap(system, "dark");
  const custom = buildCssVarMap(system, customId);
  // Independent scoped output per theme.
  assert.equal(light.vars["--pv-background-canvas"], "#ffffff");
  assert.equal(dark.vars["--pv-background-canvas"], "#09090b");
  assert.equal(custom.vars["--pv-background-canvas"], "#2a1a4a");
  assert.equal(light.vars["--pv-text-primary"], "#18181b");
  assert.equal(dark.vars["--pv-text-primary"], "#fafafa");
  // The custom theme inherits dark for untouched tokens.
  assert.equal(custom.vars["--pv-text-primary"], dark.vars["--pv-text-primary"]);
  // Full preview models carry their own theme id.
  assert.equal(resolvePreview(system, "light", 1024).themeId, "light");
  assert.equal(resolvePreview(system, customId, 1024).themeId, customId);
});

test("application chrome mode does not alter system-theme resolution", () => {
  const { system, customId } = systemWithCustomTheme();
  const before = {
    light: resolveSemanticsForTheme(system, "light"),
    dark: resolveSemanticsForTheme(system, "dark"),
    custom: resolveSemanticsForTheme(system, customId),
    vars: buildCssVarMap(system, "dark"),
    preview: resolvePreview(system, customId, 390),
  };
  // Simulate application chrome flipped to dark: resolvers must never read it.
  const scope = globalThis as Record<string, unknown>;
  const savedDocument = scope["document"];
  scope["document"] = {
    documentElement: { classList: { contains: () => true } },
    querySelector: () => null,
  };
  try {
    assert.deepEqual(resolveSemanticsForTheme(system, "light"), before.light);
    assert.deepEqual(resolveSemanticsForTheme(system, "dark"), before.dark);
    assert.deepEqual(resolveSemanticsForTheme(system, customId), before.custom);
    assert.deepEqual(buildCssVarMap(system, "dark"), before.vars);
    assert.deepEqual(resolvePreview(system, customId, 390), before.preview);
  } finally {
    if (savedDocument === undefined) delete scope["document"];
    else scope["document"] = savedDocument;
  }
});

test("scoped preview CSS variables do not leak to the document root", () => {
  const { system, customId } = systemWithCustomTheme();
  const snapshot = JSON.stringify(system);
  for (const themeId of ["light", "dark", customId]) {
    const { vars, skipped } = buildCssVarMap(system, themeId);
    for (const key of Object.keys(vars)) {
      assert.ok(key.startsWith("--pv-"), `scoped: ${key}`);
      assert.ok(!key.includes(" ") && !key.includes(";"), `inert name: ${key}`);
    }
    assert.ok(!("root" in vars), "no root entry");
    assert.ok(!skipped.some((id) => id in vars), "skipped ids are absent");
  }
  // Pure and read-only: repeated calls agree and the system is untouched.
  assert.deepEqual(buildCssVarMap(system, "dark"), buildCssVarMap(system, "dark"));
  assert.equal(JSON.stringify(system), snapshot);
});

test("component overrides resolve correctly in both Light and Dark system themes", () => {
  const base = manthanSystem();
  const withOverride: DesignSystemConfig = {
    ...base,
    components: (base.components ?? []).map((entry) =>
      entry.component === "Button"
        ? {
            ...entry,
            overrides: (entry.overrides ?? []).map((override) =>
              override.token === "background" && override.variant === "primary"
                ? { ...override, value: "text.primary" }
                : override,
            ),
          }
        : entry,
    ),
  };
  const light = resolveComponentSlot(withOverride, "Button", "background", {
    variant: "primary",
    themeId: "light",
  });
  const dark = resolveComponentSlot(withOverride, "Button", "background", {
    variant: "primary",
    themeId: "dark",
  });
  assert.equal(light.status, "resolved");
  assert.equal(dark.status, "resolved");
  assert.equal(light.provenance, "component-override");
  assert.equal(light.final, "#18181b");
  assert.equal(dark.final, "#fafafa");
  // Base semantic fallback (no override) is theme-aware too.
  const cardLight = resolveComponentSlot(withOverride, "Card", "background", { themeId: "light" });
  const cardDark = resolveComponentSlot(withOverride, "Card", "background", { themeId: "dark" });
  assert.equal(cardLight.final, "#fafafa");
  assert.equal(cardDark.final, "#18181b");
});

test("premium token bridges receive correct supported theme-aware values", () => {
  const { system, customId } = systemWithCustomTheme();
  const entry = manifestById("text-morph");
  assert.ok(entry?.bridge, "text-morph declares a bridge");
  const light = resolveBridgeValues(system, "light", entry.bridge!);
  const dark = resolveBridgeValues(system, "dark", entry.bridge!);
  const custom = resolveBridgeValues(system, customId, entry.bridge!);
  // Theme-dependent references track the selected theme…
  assert.equal(light["foreground"]?.final, "#18181b");
  assert.equal(dark["foreground"]?.final, "#fafafa");
  assert.equal(custom["foreground"]?.final, "#fafafa");
  // …unsupported keys never reach the component…
  const extra = resolveBridgeValues(system, "dark", {
    ...entry.bridge!,
    bogusKey: "text.primary",
  } as unknown as typeof entry.bridge);
  assert.ok(!("bogusKey" in extra), "unknown bridge keys are dropped");
  // …and every declared bridge value resolves in every theme.
  for (const themeId of ["light", "dark", customId]) {
    const resolved = resolveBridgeValues(system, themeId, entry.bridge!);
    for (const value of Object.values(resolved)) {
      assert.equal(value.status, "resolved", `${themeId}.${value.key}`);
    }
  }
});

test("dark system theme never falls back to a light-only raw color", () => {
  const system = manthanSystem();
  const dark = resolveSemanticsForTheme(system, "dark");
  const canvas = dark["background.canvas"]?.final;
  const text = dark["text.primary"]?.final;
  const border = dark["border.default"]?.final;
  assert.ok(canvas && text && border, "key dark surfaces resolve");
  assert.ok(luminance(canvas) < 0.05, `dark canvas is dark (${canvas})`);
  assert.ok(luminance(text) > 0.7, `dark text is light (${text})`);
  assert.ok(luminance(border) < 0.1, `dark border is dark (${border})`);
  // Readable pairing, not just distinct values.
  assert.ok(
    Math.abs(luminance(canvas) - luminance(text)) > 0.5,
    "dark canvas/text pairing stays distinguishable",
  );
  const light = resolveSemanticsForTheme(system, "light");
  assert.ok(luminance(light["background.canvas"]?.final ?? "#000") > 0.7, "light canvas is light");
  // Full preview surfaces agree with the semantic layer in both themes.
  for (const themeId of ["light", "dark"]) {
    const model = resolvePreview(system, themeId, 1024);
    assert.equal(
      model.semantics["background.canvas"]?.final,
      themeId === "light" ? "#ffffff" : "#09090b",
    );
  }
});

test("dark theme completes surfaces, actions, focus, and statuses", () => {
  // Every pairing the preview canvas renders must stay readable in the dark
  // system theme — no light-only base value may leak through.
  const system = manthanSystem();
  const dark = resolveSemanticsForTheme(system, "dark");
  const final = (id: string): string => {
    const value = dark[id]?.final;
    assert.ok(value, `${id} resolves in dark`);
    return value!;
  };
  const pair = (fg: string, bg: string, label: string): void => {
    const ratio =
      (Math.max(luminance(fg), luminance(bg)) + 0.05) / (Math.min(luminance(fg), luminance(bg)) + 0.05);
    assert.ok(ratio >= 4.5, `${label} contrast ${ratio.toFixed(2)}`);
  };
  // Surfaces track the dark canvas instead of leaking light base values.
  assert.ok(luminance(final("surface.default")) < 0.1, "dark surface.default is dark");
  assert.ok(luminance(final("background.subtle")) < 0.1, "dark background.subtle is dark");
  // Secondary text stays readable on the dark canvas.
  pair(final("text.secondary"), final("background.canvas"), "dark text.secondary on canvas");
  // Secondary actions pair their (themed) background with the text layer.
  pair(final("action.secondary.foreground"), final("action.secondary.background"), "dark secondary action");
  // Focus ring stays visible against the dark canvas.
  assert.ok(
    Math.abs(luminance(final("focus.ring")) - luminance(final("background.canvas"))) > 0.3,
    "dark focus ring distinguishable from canvas",
  );
  // Status rows carry dark fills with light text.
  for (const kind of ["success", "warning", "danger", "info"] as const) {
    pair(
      final(`status.${kind}.foreground`),
      final(`status.${kind}.background`),
      `dark status.${kind}`,
    );
  }
  // Inverse regions genuinely invert in the dark theme.
  pair(final("text.inverse"), final("background.inverse"), "dark inverse pairing");
});

test("foundation recipe and icon resolvers follow the selected theme", () => {
  // Foundation previews (shadows, borders, icons) resolve recipes through the
  // same theme layer — switching the preview theme must switch their output.
  const { system, customId } = systemWithCustomTheme();
  // Point the border recipe at a theme-dependent semantic token: stock
  // recipes may reference raw palette shades (intentionally theme-stable).
  const themed: DesignSystemConfig = {
    ...system,
    foundations: {
      ...system.foundations,
      borders: {
        ...system.foundations.borders,
        tokens: (system.foundations.borders?.tokens ?? []).map((token) =>
          token.id === "border.default" ? { ...token, color: "border.default" } : token,
        ),
      },
    },
  };
  const borderLight = resolveBorderRecipe(themed, "border.default", "light");
  const borderDark = resolveBorderRecipe(themed, "border.default", "dark");
  assert.ok(borderLight && borderDark, "border recipe resolves in both themes");
  assert.notEqual(borderLight.css, borderDark.css, "border recipe is theme-aware");
  const iconLight = resolveIconColor(system, "muted", "light");
  const iconDark = resolveIconColor(system, "muted", "dark");
  assert.ok(iconLight && iconDark, "icon colors resolve in both themes");
  // Custom themes participate identically.
  const borderCustom = resolveBorderRecipe(themed, "border.default", customId);
  assert.ok(borderCustom, "border recipe resolves for custom themes");
  const iconCustom = resolveIconColor(system, "muted", customId);
  assert.equal(iconCustom, iconDark, "custom theme inherits dark icon color");
});

test("reduced-motion fallback remains active after theme switching", () => {
  const { system, customId } = systemWithCustomTheme();
  for (const themeId of ["light", "dark", customId]) {
    const reduced = resolvePreview(system, themeId, 1024, { osPrefersReduced: true });
    assert.equal(reduced.motion.reduce, true, `${themeId} reduces`);
    assert.equal(reduced.motion.transition, "none", `${themeId} has no transition`);
    const full = resolvePreview(system, themeId, 1024, { osPrefersReduced: false });
    assert.equal(full.motion.reduce, full.motion.reason === "Unavailable" ? false : full.motion.reduce);
  }
  // Premium effects in the component library declare a static/simplified/disabled fallback.
  const samplePremium = COMPONENT_MANIFEST.filter((entry) => entry.tier === "premium").slice(0, 12);
  assert.ok(samplePremium.length > 0, "premium breadth in library");
  for (const entry of samplePremium) {
    const item = manifestById(entry.id);
    assert.ok(item, `premium exists: ${entry.id}`);
    assert.notEqual(item!.reducedMotionFallback, "not-applicable", `${entry.id} declares a fallback`);
  }
});
