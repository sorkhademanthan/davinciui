// Focused component-curation tests (Step 10A). Same convention as previous
// steps: compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import type { DesignSystemConfig } from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  COMPONENT_MANIFEST,
  CORE_COMPONENT_IDS,
  PREMIUM_COMPONENT_IDS,
  manifestById,
  type ComponentFamily,
  type ComponentMaturity,
  type ComponentTier,
} from "./component-manifest";
import {
  componentReadiness,
  includeComponent,
  includeFamily,
  includedEntries,
  includedIds,
  inclusionSummary,
  isIncluded,
  removeAllPremium,
  removeComponent,
  resetToCore,
  resolveBridgeValues,
  setIncludedIds,
  validateBridge,
} from "./component-curation";
import { components as registryComponents } from "../../registry";

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

test("every registry/catalog component has exactly one manifest entry", () => {
  // Full docs-catalog sync is enforced by scripts/check-component-manifest.mjs
  // (the manifest must stay dependency-light for this runner). Here we assert
  // the registry dimension plus overall breadth at runtime.
  const registryIds = Object.keys(registryComponents);
  assert.ok(registryIds.length >= 120, `registry breadth (${registryIds.length})`);
  const ids = COMPONENT_MANIFEST.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, "manifest ids are unique");
  assert.ok(ids.length >= 129, `manifest covers the documented catalog (${ids.length})`);
  for (const id of registryIds) {
    assert.ok(ids.includes(id), `manifest missing registry component ${id}`);
  }
  for (const id of ids) {
    assert.ok(
      (registryComponents as Record<string, unknown>)[id] !== undefined ||
        ["alert-dialog", "aspect-ratio"].includes(id),
      `manifest id ${id} matches no catalog source`,
    );
  }
});

test("manifest ids/routes match the source catalog", () => {
  for (const entry of COMPONENT_MANIFEST) {
    assert.equal(entry.docsRoute, `/docs/components/${entry.id}`);
    assert.equal(entry.experienceRoute, `/experience/components/${entry.id}`);
  }
  assert.equal(manifestById("button")?.name, "Button");
  assert.equal(manifestById("text-morph")?.name, "Text Morph");
  // Docs-only entries without registry metadata stay discoverable.
  for (const id of ["alert-dialog", "aspect-ratio"]) {
    const entry = manifestById(id);
    assert.ok(entry, id);
    assert.equal(entry?.docsAvailable, true);
    assert.equal(entry?.registryAvailable, false);
  }
  assert.equal(manifestById("no-such-component"), undefined);
});

test("tier/family/maturity values are valid", () => {
  const tiers: ComponentTier[] = ["core", "premium"];
  const families: ComponentFamily[] = [
    "inputs", "actions", "navigation", "feedback", "overlays", "data-display",
    "layout", "text", "background", "cursor", "scroll", "media", "carousel",
  ];
  const maturities: ComponentMaturity[] = ["ready", "needs-review", "experimental"];
  for (const entry of COMPONENT_MANIFEST) {
    assert.ok(tiers.includes(entry.tier), `${entry.id}: tier`);
    assert.ok(families.includes(entry.family), `${entry.id}: family`);
    assert.ok(maturities.includes(entry.maturity), `${entry.id}: maturity`);
  }
  const core = COMPONENT_MANIFEST.filter((entry) => entry.tier === "core");
  const premium = COMPONENT_MANIFEST.filter((entry) => entry.tier === "premium");
  assert.ok(core.length >= 50, `core breadth (${core.length})`);
  assert.ok(premium.length >= 60, `premium breadth (${premium.length})`);
  assert.deepEqual(
    [...CORE_COMPONENT_IDS].sort(),
    core.map((entry) => entry.id).sort(),
  );
  assert.deepEqual(
    [...PREMIUM_COMPONENT_IDS].sort(),
    premium.map((entry) => entry.id).sort(),
  );
  // Premium keeps its identity: bridges are minimal, effects keep modalities.
  for (const entry of premium) {
    assert.ok(entry.bridge, `${entry.id}: explicit bridge`);
    assert.ok(entry.motionModality !== "not-applicable" || entry.family === "media" || entry.reducedMotionFallback === "not-applicable", `${entry.id}: modality`);
  }
});

test("Design systems contain basic components only — premium stays library-only", () => {
  const system = manthanSystem();
  // New systems begin with all Core UI included.
  for (const id of ["button", "input", "card", "dialog"]) {
    assert.ok(isIncluded(system, id), id);
  }
  assert.ok(!isIncluded(system, "text-morph"), "premium never in systems");
  // Premium cannot be added: single, family, or bulk.
  assert.equal(includeComponent(system, "text-morph").ok, false);
  assert.equal(includeComponent(system, "ghost-effect").ok, false);
  const scrolled = includeFamily(system, "scroll");
  assert.ok(
    COMPONENT_MANIFEST.filter((entry) => entry.family === "scroll" && entry.tier === "core").every((entry) =>
      isIncluded(scrolled, entry.id),
    ),
  );
  assert.ok(!isIncluded(scrolled, "scroll-reveal-image"), "scroll premium stays out");
  // Core families still curate normally.
  const inputs = includeFamily(removeComponent(system, "input"), "inputs");
  assert.ok(isIncluded(inputs, "input"));
  // Stored premium ids (legacy data) are filtered on read and write.
  const legacy: DesignSystemConfig = {
    ...system,
    library: { included: [...CORE_COMPONENT_IDS, ...PREMIUM_COMPONENT_IDS.slice(0, 3)] },
  };
  assert.ok(!isIncluded(legacy, PREMIUM_COMPONENT_IDS[0]!));
  assert.deepEqual([...includedIds(legacy)].sort(), [...CORE_COMPONENT_IDS].sort());
  const cleaned = removeAllPremium(legacy);
  assert.deepEqual([...includedIds(cleaned)].sort(), [...CORE_COMPONENT_IDS].sort());
  const reset = resetToCore(legacy);
  assert.deepEqual([...includedIds(reset)].sort(), [...CORE_COMPONENT_IDS].sort());
  const written = setIncludedIds(system, ["button", "text-morph", "ghost-effect"]);
  assert.deepEqual(includedIds(written), ["button"]);
});

test("inclusion state persists after reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const withoutCard = removeComponent(manthanSystem(), "card");
  assert.ok(!isIncluded(withoutCard, "card"));
  const saved = store.save(withoutCard);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(withoutCard.id);
  assert.ok(reloaded);
  assert.ok(!isIncluded(reloaded!, "card"));
  assert.ok(isIncluded(reloaded!, "button"));
  // Legacy systems without the field default to all Core UI.
  const legacy: DesignSystemConfig = { ...manthanSystem(), library: undefined };
  assert.deepEqual([...includedIds(legacy)].sort(), [...CORE_COMPONENT_IDS].sort());
  const summary = inclusionSummary(reloaded!);
  assert.equal(summary.premium, 0);
  assert.equal(summary.included, summary.core);
  assert.equal(summary.total, CORE_COMPONENT_IDS.length);
});

test("a Premium component receives only supported token-bridge values", () => {
  const system = manthanSystem();
  const entry = manifestById("text-morph")!;
  assert.ok(entry.bridge);
  const values = resolveBridgeValues(system, "dark", entry.bridge!);
  assert.ok(Object.keys(values).length > 0);
  assert.ok(values["foreground"]);
  assert.equal(values["foreground"]?.final, resolveBridgeValues(system, "dark", entry.bridge!)["foreground"]?.final);
  // Unsupported keys never reach the component, even if smuggled in.
  const smuggled = resolveBridgeValues(system, "dark", {
    ...entry.bridge!,
    globalCss: "body{color:red}",
    reducedMotionFallback: entry.bridge!.reducedMotionFallback,
  } as typeof entry.bridge & { globalCss: string });
  assert.ok(!("globalCss" in smuggled), "unknown bridge keys dropped");
  // No global CSS is touched and the source system is unmutated.
  const snapshot = JSON.stringify(system);
  resolveBridgeValues(system, "midnight" in {} ? "midnight" : "dark", entry.bridge!);
  assert.equal(JSON.stringify(system), snapshot);
  // Bridge validation flags unresolvable refs.
  assert.deepEqual(validateBridge(system, entry.bridge!, entry.motionModality), []);
  const broken = validateBridge(
    system,
    { foreground: "ghost.500", reducedMotionFallback: "static" },
    "autoplay",
  );
  assert.ok(broken.some((issue) => issue.key === "foreground"));
});

test("reduced-motion fallback is required for applicable premium motion modalities", () => {
  for (const entry of COMPONENT_MANIFEST.filter((item) => item.tier === "premium")) {
    if (["hover", "pointer", "scroll", "autoplay", "ambient"].includes(entry.motionModality)) {
      assert.ok(
        ["static", "simplified", "disabled"].includes(entry.reducedMotionFallback),
        `${entry.id}: fallback for ${entry.motionModality}`,
      );
    }
    assert.ok(entry.staticFallback.length > 0, `${entry.id}: fallback behavior described`);
  }
});

test("components marked Needs review expose concrete missing checks", () => {
  const flagged = COMPONENT_MANIFEST.filter((entry) => entry.maturity === "needs-review");
  assert.ok(flagged.length > 0, "premium breadth is honestly flagged");
  for (const entry of flagged) {
    assert.ok(entry.missingChecks.length > 0, `${entry.id}: concrete gaps`);
  }
  for (const entry of COMPONENT_MANIFEST.filter((entry) => entry.maturity === "ready")) {
    assert.deepEqual(entry.missingChecks, [], `${entry.id}: ready means no gaps`);
  }
});

test("Preview receives only included basic components", () => {
  const system = manthanSystem();
  assert.ok(includedEntries(system).every((entry) => entry.tier === "core"));
  assert.equal(includedEntries(system, "premium").length, 0);
  // Premium can no longer be added to a system.
  assert.equal(includeComponent(system, "text-morph").ok, false);
  assert.equal(includedEntries(system, "premium").length, 0);
  // Unknown stored ids never leak into the gallery.
  const tampered: DesignSystemConfig = {
    ...system,
    library: { included: ["button", "ghost-effect"] },
  };
  assert.ok(includedEntries(tampered).every((entry) => entry.id !== "ghost-effect"));
  // Legacy stored premium ids are filtered out.
  const legacyPremium: DesignSystemConfig = {
    ...system,
    library: { included: ["button", "text-morph"] },
  };
  assert.deepEqual(
    includedEntries(legacyPremium).map((entry) => entry.id),
    ["button"],
  );
});

test("readiness data is machine-readable for the Validate phase", () => {
  const system = manthanSystem();
  const button = componentReadiness(system, manifestById("button")!);
  assert.ok(button.every((check) => check.pass), JSON.stringify(button.filter((check) => !check.pass)));
  const effect = componentReadiness(system, manifestById("text-morph")!);
  const byId = new Map(effect.map((check) => [check.id, check]));
  assert.equal(byId.get("bridge-valid")?.pass, true);
  assert.equal(byId.get("modality-declared")?.pass, true);
  assert.equal(byId.get("dark-known")?.pass, false, "honest dark gap");
  for (const check of effect) {
    assert.ok(check.id && check.label && check.detail.length > 0);
  }
});
