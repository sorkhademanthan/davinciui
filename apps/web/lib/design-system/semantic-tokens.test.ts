// Focused Semantic Tokens tests (Step 8). Same convention as previous steps:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveToken,
  validateDesignSystem,
  type DesignSystemConfig,
} from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter } from "./starters";
import {
  REQUIRED_SEMANTIC_IDS,
  addMissingDefaults,
  baselineValueFor,
  canDeleteSemanticToken,
  classifyValue,
  createSemanticToken,
  duplicateSemanticToken,
  findTokenReferences,
  formatChain,
  groupTokensByCategory,
  insertSemanticToken,
  missingStandardTokens,
  removeSemanticToken,
  resetTokenToStarter,
  semanticIssues,
  slugifySemanticId,
  updateTokenCategory,
  updateTokenLabel,
  updateTokenValue,
  usageCount,
  validReferenceCandidates,
  validateTokenValue,
  wouldCreateCycle,
} from "./semantic-tokens";

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

/** Minimal older system missing most of the Step 8 baseline. */
function legacySystem(): DesignSystemConfig {
  const system = manthanSystem();
  const keep = new Set([
    "background.canvas",
    "text.primary",
    "border.default",
    "action.primary.background",
  ]);
  return {
    ...system,
    semanticTokens: system.semanticTokens.filter((token) => keep.has(token.id)),
  };
}

const BASELINE_IDS = [
  "background.canvas",
  "background.subtle",
  "background.inverse",
  "surface.default",
  "surface.raised",
  "surface.sunken",
  "text.primary",
  "text.secondary",
  "text.muted",
  "text.inverse",
  "border.subtle",
  "border.default",
  "border.strong",
  "action.primary.background",
  "action.primary.foreground",
  "action.primary.hover",
  "action.secondary.background",
  "action.secondary.foreground",
  "focus.ring",
  "status.success.foreground",
  "status.success.background",
  "status.warning.foreground",
  "status.warning.background",
  "status.danger.foreground",
  "status.danger.background",
  "status.info.foreground",
  "status.info.background",
  "overlay.scrim",
];

test("starter systems contain the required semantic-token baseline", () => {
  for (const starter of ["blank", "saas", "enterprise", "editorial", "ecommerce", "dark-first"] as const) {
    const system = createSystemFromStarter({ starterId: starter, name: "Probe" });
    for (const id of BASELINE_IDS) {
      assert.ok(
        system.semanticTokens.some((token) => token.id === id),
        `${starter}: missing ${id}`,
      );
    }
    assert.deepEqual(semanticIssues(system), [], `${starter}: no semantic issues`);
    assert.deepEqual(validateDesignSystem(system), [], `${starter}: fully valid`);
  }
  assert.deepEqual(
    [...REQUIRED_SEMANTIC_IDS].sort(),
    [...new Set([...BASELINE_IDS, "background.surface"])].sort(),
  );
});

test("palette-shade reference resolves correctly", () => {
  const system = createSystemFromStarter({ starterId: "saas", name: "Probe" });
  const brand600 = system.foundations.colors.palettes[0]?.shades["600"];
  const classified = classifyValue(system, "brand.600");
  assert.deepEqual(classified, { kind: "foundation", detail: "Palette shade brand.600 (brand)" });
  assert.deepEqual(validateTokenValue(system, "brand.600"), {
    ok: true,
    kind: "foundation",
    detail: "Palette shade brand.600 (brand)",
  });
  assert.equal(resolveToken(system, "action.primary.background").value, brand600);
});

test("semantic alias classification and resolution", () => {
  const system = manthanSystem();
  assert.deepEqual(classifyValue(system, "text.primary"), {
    kind: "alias",
    detail: "Semantic alias of text.primary",
  });
  const resolved = resolveToken(system, "action.secondary.foreground");
  assert.equal(resolved.status, "resolved");
  assert.deepEqual(resolved.chain[0], "action.secondary.foreground");
  assert.ok(resolved.chain.includes("text.primary"), formatChain(resolved.chain));
  assert.equal(resolved.value, resolveToken(system, "neutral.900").value);
});

test("raw HEX fallback works only when valid", () => {
  const system = manthanSystem();
  assert.deepEqual(validateTokenValue(system, "#123abc"), {
    ok: true,
    kind: "raw",
    detail: "Raw fallback #123abc",
  });
  for (const bad of ["#123abz", "#1234", "red", "12px", ""]) {
    assert.equal(validateTokenValue(system, bad).ok, false, bad);
  }
});

test("unresolved references are rejected", () => {
  const system = manthanSystem();
  for (const bad of ["ghost.500", "missing.token", "brand.9999"]) {
    const result = validateTokenValue(system, bad);
    assert.equal(result.ok, false, bad);
    if (!result.ok) assert.ok(result.error.includes("does not match"), result.error);
  }
});

test("self-reference is rejected", () => {
  const system = manthanSystem();
  const result = validateTokenValue(system, "text.primary", "text.primary");
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.error.includes("itself"));
});

test("multi-token circular references are rejected", () => {
  const system = manthanSystem();
  const withChain: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens,
      { id: "custom.a", label: "A", category: "custom", value: "text.primary" },
      { id: "custom.b", label: "B", category: "custom", value: "custom.a" },
    ],
  };
  // Closing the loop back onto custom.b must be refused.
  assert.equal(wouldCreateCycle(withChain, "custom.a", "custom.b"), true);
  const rejected = validateTokenValue(withChain, "custom.b", "custom.a");
  assert.equal(rejected.ok, false);
  if (!rejected.ok) assert.ok(rejected.error.includes("circular"), rejected.error);
  // A safe alias is still accepted.
  assert.equal(validateTokenValue(withChain, "text.muted", "custom.a").ok, true);
  // The picker hides cyclic choices.
  const candidates = validReferenceCandidates(withChain, "custom.a");
  assert.ok(!candidates.aliases.includes("custom.a"), "self hidden");
  assert.ok(!candidates.aliases.includes("custom.b"), "cycle-closing alias hidden");
  assert.ok(candidates.aliases.includes("text.primary"), "safe alias offered");
  assert.ok(candidates.foundations.includes("neutral.900"), "palette shades offered");
});

test("category grouping is correct", () => {
  const system = manthanSystem();
  const groups = groupTokensByCategory(system.semanticTokens);
  assert.deepEqual(
    groups.map((group) => group.category),
    ["background", "surface", "text", "border", "action", "focus", "status", "overlay", "custom"].filter((category) =>
      groups.some((group) => group.category === category),
    ),
  );
  for (const group of groups) {
    for (const token of group.tokens) {
      assert.equal(token.category, group.category);
    }
  }
  const background = groups.find((group) => group.category === "background")!;
  assert.ok(background.tokens.some((token) => token.id === "background.canvas"));
  // Customs sort last even when present.
  const withCustom: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens,
      { id: "custom.zed", label: "Zed", category: "custom", value: "#111111" },
    ],
  };
  const regrouped = groupTokensByCategory(withCustom.semanticTokens);
  assert.equal(regrouped[regrouped.length - 1]?.category, "custom");
});

test("ids are unique and label changes preserve references", () => {
  const system = manthanSystem();
  assert.equal(slugifySemanticId("Primary action", "action", ["action.primary-action"]), "action.primary-action-2");
  assert.equal(slugifySemanticId("!!!", "custom", []), "custom.token");
  const created = createSemanticToken(system, {
    label: "Card border",
    category: "border",
    value: "neutral.200",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.equal(created.token.id, "border.card-border");
  const next = insertSemanticToken(system, created.token);
  const renamed = updateTokenLabel(next, created.token.id, "Card edge");
  assert.equal(
    renamed.semanticTokens.find((token) => token.id === created.token.id)?.label,
    "Card edge",
  );
  // The stable id survives the rename, so references keep working.
  assert.ok(renamed.semanticTokens.some((token) => token.id === created.token.id));
  const recategorized = updateTokenCategory(renamed, created.token.id, "custom");
  assert.equal(
    recategorized.semanticTokens.find((token) => token.id === created.token.id)?.category,
    "custom",
  );
});

test("duplicate token is independent", () => {
  const system = manthanSystem();
  const copy = duplicateSemanticToken(system, "text.primary");
  assert.ok(copy);
  assert.equal(copy?.id, "text.primary-copy");
  assert.equal(copy?.value, "neutral.900");
  const second = duplicateSemanticToken(insertSemanticToken(system, copy!), "text.primary");
  assert.equal(second?.id, "text.primary-copy-2");
  assert.equal(duplicateSemanticToken(system, "ghost"), null);
});

test("deletion of an unused custom token works", () => {
  const system = manthanSystem();
  const created = createSemanticToken(system, { label: "Zed", category: "custom", value: "#111111" });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const next = insertSemanticToken(system, created.token);
  assert.deepEqual(canDeleteSemanticToken(next, created.token.id), { ok: true });
  const removed = removeSemanticToken(next, created.token.id);
  assert.ok(!removed.semanticTokens.some((token) => token.id === created.token.id));
  // Required baseline tokens are blocked even when unreferenced.
  const guard = canDeleteSemanticToken(system, "status.info.background");
  assert.equal(guard.ok, false);
  if (!guard.ok) assert.ok(guard.reasons[0]?.includes("required baseline"));
});

test("deletion of a referenced token is blocked with dependency information", () => {
  const system: DesignSystemConfig = {
    ...manthanSystem(),
    semanticTokens: [
      ...manthanSystem().semanticTokens,
      { id: "custom.accent", label: "Accent", category: "custom", value: "brand.600" },
    ],
  };
  const withRef: DesignSystemConfig = {
    ...system,
    semanticTokens: system.semanticTokens.map((token) =>
      token.id === "text.primary" ? { ...token, value: "custom.accent" } : token,
    ),
  };
  // text.primary is required baseline → blocked regardless.
  assert.equal(canDeleteSemanticToken(withRef, "text.primary").ok, false);
  // custom.accent is referenced by text.primary → blocked with a pointer.
  const guard = canDeleteSemanticToken(withRef, "custom.accent");
  assert.equal(guard.ok, false);
  if (!guard.ok) {
    assert.ok(guard.reasons[0]?.includes("text.primary"), guard.reasons[0]);
    assert.ok(guard.references.some((ref) => ref.kind === "semantic" && ref.pointer === "text.primary"));
  }
  assert.equal(usageCount(withRef, "custom.accent"), 1);
  // Foundation references count too: point a border recipe at the token.
  const withFoundation: DesignSystemConfig = {
    ...withRef,
    foundations: {
      ...withRef.foundations,
      borders: {
        ...withRef.foundations.borders,
        tokens: withRef.foundations.borders.tokens.map((token) =>
          token.id === "border.default" ? { ...token, color: "custom.accent" } : token,
        ),
      },
    },
  };
  const refs = findTokenReferences(withFoundation, "custom.accent");
  assert.ok(refs.some((ref) => ref.kind === "foundation" && ref.pointer === "border.border.default"));
  assert.equal(canDeleteSemanticToken(withFoundation, "custom.accent").ok, false);
});

test("Add missing defaults adds only absent defaults and preserves edits", () => {
  const legacy = legacySystem();
  assert.ok(missingStandardTokens(legacy).includes("text.muted"));
  const before = legacy.semanticTokens.find((token) => token.id === "text.primary")!;
  const edited: DesignSystemConfig = {
    ...legacy,
    semanticTokens: [
      ...legacy.semanticTokens.map((token) =>
        token.id === "text.primary" ? { ...token, value: "#111111" } : token,
      ),
      { id: "custom.keep", label: "Keep", category: "custom", value: "#222222" },
    ],
  };
  const { system: filled, added } = addMissingDefaults(edited);
  assert.ok(added.includes("text.muted"));
  assert.ok(added.includes("status.success.foreground"));
  assert.ok(!added.includes("text.primary"), "edited values are never overwritten");
  assert.ok(!added.includes("custom.keep"), "custom tokens are never overwritten");
  assert.equal(
    filled.semanticTokens.find((token) => token.id === "text.primary")?.value,
    "#111111",
  );
  assert.equal(
    filled.semanticTokens.find((token) => token.id === "custom.keep")?.value,
    "#222222",
  );
  void before;
  assert.deepEqual(missingStandardTokens(filled), []);
  assert.deepEqual(semanticIssues(filled), []);
  // Starter-consistent values: SaaS maps status tokens onto its palettes.
  const saasLegacy: DesignSystemConfig = {
    ...createSystemFromStarter({ starterId: "saas", name: "Old SaaS" }),
    semanticTokens: legacy.semanticTokens,
  };
  assert.equal(baselineValueFor(saasLegacy, "status.success.foreground"), "success.600");
  assert.equal(baselineValueFor(manthanSystem(), "status.success.foreground"), "#16a34a");
});

test("resetting a token restores starter defaults without touching siblings", () => {
  const edited = updateTokenValue(manthanSystem(), "text.primary", "neutral.700");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const relabeled: DesignSystemConfig = {
    ...edited.system,
    semanticTokens: edited.system.semanticTokens.map((token) =>
      token.id === "text.primary" ? { ...token, label: "Custom label" } : token,
    ),
  };
  const reset = resetTokenToStarter(relabeled, "text.primary");
  assert.ok(reset);
  assert.equal(
    reset!.semanticTokens.find((token) => token.id === "text.primary")?.value,
    "neutral.900",
  );
  assert.equal(
    reset!.semanticTokens.find((token) => token.id === "text.primary")?.label,
    "Primary text",
  );
  // Custom tokens have no starter baseline to restore.
  assert.equal(resetTokenToStarter(relabeled, "custom.ghost"), null);
});

test("semantic preview resolution changes after a token update", () => {
  const system = manthanSystem();
  const before = resolveToken(system, "text.primary").value;
  const edited = updateTokenValue(system, "text.primary", "neutral.700");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  assert.notEqual(resolveToken(edited.system, "text.primary").value, before);
  // Aliases follow: action.secondary.foreground points at text.primary.
  assert.equal(
    resolveToken(edited.system, "action.secondary.foreground").value,
    resolveToken(edited.system, "text.primary").value,
  );
  // Invalid updates are rejected with field-ready errors.
  assert.equal(updateTokenValue(system, "text.primary", "ghost.500").ok, false);
  assert.equal(updateTokenValue(system, "ghost", "neutral.500").ok, false);
});

test("persistence survives reload", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const created = createSemanticToken(manthanSystem(), {
    label: "Card border",
    category: "border",
    value: "neutral.200",
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const edited = updateTokenValue(insertSemanticToken(manthanSystem(), created.token), "text.primary", "neutral.700");
  assert.equal(edited.ok, true);
  if (!edited.ok) return;
  const saved = store.save(edited.system);
  assert.equal(saved.ok, true);
  const reloaded = createDesignSystemsStore(() => mem).get(edited.system.id);
  assert.ok(reloaded);
  assert.equal(
    reloaded!.semanticTokens.find((token) => token.id === "text.primary")?.value,
    "neutral.700",
  );
  assert.ok(reloaded!.semanticTokens.some((token) => token.id === created.token.id));
});
