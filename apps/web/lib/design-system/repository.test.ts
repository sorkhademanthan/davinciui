// Focused repository tests (Step 2). Same convention as domain.test.ts:
// compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createBlankDesignSystem, type DesignSystemConfig } from "./domain";
import type { V1DesignSystem } from "./migrations";
import {
  DESIGN_SYSTEM_STORAGE_KEY,
  browserDesignSystems,
  createDesignSystemsStore,
  type StorageLike,
} from "./repository";

const LEGACY_V1_KEY = "davinciui.design-system.v1";

interface MemoryStorage extends StorageLike {
  dump(): Record<string, string>;
}

function memoryStorage(seed: Record<string, string> = {}): MemoryStorage {
  const data = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    dump: () => Object.fromEntries(data),
  };
}

function v2system(name: string, updatedAt?: string): DesignSystemConfig {
  const system = createBlankDesignSystem({ name });
  return updatedAt ? { ...system, meta: { ...system.meta, updatedAt } } : system;
}

function envelopeWith(systems: unknown[]): string {
  return JSON.stringify({ storageVersion: 1, systems, updatedAt: "2025-01-01T00:00:00.000Z" });
}

function v1fixture(): V1DesignSystem {
  return {
    schemaVersion: 1,
    id: "manthan-abc123",
    meta: {
      name: "Manthan",
      brand: "Acme",
      description: "v1 system",
      version: "1.0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-06-01T00:00:00.000Z",
    },
    foundation: {
      colors: [
        { id: "brand", name: "Primary", base: "#123456", enabled: true, shades: { "500": "#123456", "600": "#0f2c48" } },
        { id: "neutral", name: "Neutral", base: "#71717a", enabled: true, shades: { "200": "#e4e4e7", "900": "#18181b" } },
      ],
      fontFamily: "Space Grotesk",
      spacingBase: 8,
      radius: 12,
      density: "compact",
    },
    semantic: [
      { id: "action.primary.background", reference: "brand.600", label: "Primary action background" },
      { id: "custom.banner", reference: "#ff0000", label: "Banner" },
    ],
    themes: {
      light: { "background.canvas": "#fafafa", "custom.extra": "#111111" },
      dark: { "background.canvas": "#000000" },
    },
    components: [],
  };
}

test("save then reload across store instances", () => {
  const mem = memoryStorage();
  const first = createDesignSystemsStore(() => mem);
  const saved = first.save(v2system("Alpha"));
  assert.equal(saved.ok, true);
  const second = createDesignSystemsStore(() => mem);
  const listed = second.list();
  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.meta.name, "Alpha");
  assert.equal(second.get(listed[0]?.id ?? "")?.id, listed[0]?.id);
});

test("systems are ordered most-recently-updated-first", () => {
  const mem = memoryStorage({
    [DESIGN_SYSTEM_STORAGE_KEY]: envelopeWith([
      v2system("Older", "2024-01-01T00:00:00.000Z"),
      v2system("Newer", "2024-06-01T00:00:00.000Z"),
    ]),
  });
  const store = createDesignSystemsStore(() => mem);
  assert.deepEqual(
    store.list().map((system) => system.meta.name),
    ["Newer", "Older"],
  );
});

test("save preserves createdAt and refreshes updatedAt", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const first = store.save(v2system("Beta"));
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const createdAt = first.system.meta.createdAt;
  const tampered: DesignSystemConfig = {
    ...first.system,
    meta: { ...first.system.meta, createdAt: "2000-01-01T00:00:00.000Z" },
  };
  const second = store.save(tampered);
  assert.equal(second.ok, true);
  if (!second.ok) return;
  assert.equal(second.system.meta.createdAt, createdAt);
  assert.ok(second.system.meta.updatedAt >= first.system.meta.updatedAt);
  assert.equal(store.list().filter((system) => system.id === first.system.id).length, 1);
});

test("save rejects invalid systems without writing", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const badVersion = { ...v2system("Bad"), schemaVersion: 99 } as unknown as DesignSystemConfig;
  assert.equal(store.save(badVersion).ok, false);
  const unnamed = { ...v2system(""), meta: { ...v2system("").meta, name: "   " } };
  assert.equal(store.save(unnamed).ok, false);
  const noId = { ...v2system("NoId"), id: "" };
  assert.equal(store.save(noId).ok, false);
  assert.equal(store.list().length, 0);
  assert.ok(!(DESIGN_SYSTEM_STORAGE_KEY in mem.dump()));
});

test("create helper persists a starter-built system", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const result = store.create({
    name: "Created",
    presetId: "saas",
    color: "#635bff",
    font: "Inter",
    density: "comfortable",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(store.get(result.system.id)?.meta.name, "Created");
});

test("duplicate creates an independent deep copy", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const saved = store.save(v2system("Original"));
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const duplicated = store.duplicate(saved.system.id);
  assert.equal(duplicated.ok, true);
  if (!duplicated.ok) return;
  assert.notEqual(duplicated.system.id, saved.system.id);
  assert.equal(duplicated.system.meta.name, "Original copy");
  assert.ok(duplicated.system.meta.createdAt >= saved.system.meta.createdAt);
  // Mutating the copy must not affect the original.
  duplicated.system.foundations.colors.palettes[0]!.base = "#000000";
  const reread = store.save(duplicated.system);
  assert.equal(reread.ok, true);
  assert.notEqual(store.get(saved.system.id)?.foundations.colors.palettes[0]?.base, "#000000");
  assert.equal(store.list().length, 2);
});

test("duplicate of a missing id reports an error", () => {
  const store = createDesignSystemsStore(() => memoryStorage());
  const result = store.duplicate("does-not-exist");
  assert.equal(result.ok, false);
});

test("remove deletes only the requested system", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const a = store.save(v2system("A"));
  const b = store.save(v2system("B"));
  assert.equal(a.ok && b.ok, true);
  if (!a.ok || !b.ok) return;
  assert.deepEqual(store.remove("missing"), { removed: false });
  assert.deepEqual(store.remove(a.system.id), { removed: true });
  assert.deepEqual(
    store.list().map((system) => system.id),
    [b.system.id],
  );
});

test("remove permanently deletes a migrated legacy system (no resurrection)", () => {
  const mem = memoryStorage({ [LEGACY_V1_KEY]: JSON.stringify([v1fixture()]) });
  const store = createDesignSystemsStore(() => mem);
  assert.equal(store.list().length, 1);
  assert.deepEqual(store.remove("manthan-abc123"), { removed: true });
  assert.deepEqual(store.list(), []);
  // Fresh store instances must not re-migrate the read-only legacy record.
  const second = createDesignSystemsStore(() => mem);
  assert.deepEqual(second.list(), []);
  assert.equal(second.get("manthan-abc123"), undefined);
  assert.deepEqual(second.remove("manthan-abc123"), { removed: false });
});

test("deleting one legacy system keeps other legacy systems migrating", () => {
  const branding = {
    ...v1fixture(),
    id: "branding-xyz789",
    meta: { ...v1fixture().meta, name: "Branding" },
  };
  const mem = memoryStorage({ [LEGACY_V1_KEY]: JSON.stringify([v1fixture(), branding]) });
  const store = createDesignSystemsStore(() => mem);
  assert.equal(store.list().length, 2);
  assert.deepEqual(store.remove("manthan-abc123"), { removed: true });
  assert.deepEqual(
    store.list().map((system) => system.meta.name),
    ["Branding"],
  );
  assert.deepEqual(store.remove("branding-xyz789"), { removed: true });
  assert.deepEqual(createDesignSystemsStore(() => mem).list(), []);
});

test("explicit save after delete restores the system", () => {
  const mem = memoryStorage({ [LEGACY_V1_KEY]: JSON.stringify([v1fixture()]) });
  const store = createDesignSystemsStore(() => mem);
  const original = store.list()[0]!;
  assert.deepEqual(store.remove(original.id), { removed: true });
  assert.deepEqual(store.list(), []);
  const saved = store.save(original);
  assert.equal(saved.ok, true);
  assert.equal(store.list().length, 1);
  assert.equal(store.list()[0]?.id, original.id);
});

test("malformed localStorage is handled without throwing", () => {
  const mem = memoryStorage({ [DESIGN_SYSTEM_STORAGE_KEY]: "{not json" });
  const store = createDesignSystemsStore(() => mem);
  assert.deepEqual(store.list(), []);
  const status = store.status();
  assert.equal(status.available, true);
  assert.ok(status.warnings.length >= 1);
  // Saving still works and heals the envelope (nothing valid to preserve).
  const saved = store.save(v2system("Healed"));
  assert.equal(saved.ok, true);
  assert.equal(store.list().length, 1);
});

test("one corrupt system does not hide valid systems", () => {
  const valid = v2system("Valid");
  const mem = memoryStorage({
    [DESIGN_SYSTEM_STORAGE_KEY]: envelopeWith([{ totally: "broken" }, valid]),
  });
  const store = createDesignSystemsStore(() => mem);
  assert.deepEqual(
    store.list().map((system) => system.meta.name),
    ["Valid"],
  );
  const status = store.status();
  assert.equal(status.skippedInvalid, 1);
  assert.ok(status.warnings.length >= 1);
  // No migration happened, so the raw envelope is left untouched.
  const after = JSON.parse(mem.dump()[DESIGN_SYSTEM_STORAGE_KEY]!) as { systems: unknown[] };
  assert.equal(after.systems.length, 2);
});

test("legacy v1 systems migrate with user data preserved", () => {
  const mem = memoryStorage({ [LEGACY_V1_KEY]: JSON.stringify([v1fixture()]) });
  const store = createDesignSystemsStore(() => mem);
  const listed = store.list();
  assert.equal(listed.length, 1);
  const migrated = listed[0]!;
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.id, "manthan-abc123");
  assert.equal(migrated.meta.name, "Manthan");
  assert.equal(migrated.meta.brand, "Acme");
  assert.equal(migrated.meta.createdAt, "2024-01-01T00:00:00.000Z");
  assert.equal(migrated.foundations.colors.palettes[0]?.base, "#123456");
  assert.equal(migrated.foundations.colors.palettes[0]?.label, "Primary");
  assert.equal(migrated.foundations.colors.palettes[0]?.role, "brand");
  assert.equal(migrated.foundations.colors.palettes[0]?.shades["500"], "#123456");
  assert.ok(migrated.foundations.colors.palettes[0]?.shades["950"]);
  assert.equal(migrated.foundations.typography.primary, "Space Grotesk");
  assert.equal(migrated.foundations.spacing.base, 8);
  assert.ok(migrated.foundations.spacing.scale.some((token) => token.id === "space-1"));
  assert.equal(migrated.foundations.radius.base, 12);
  assert.equal(migrated.foundations.density, "compact");
  assert.ok(
    migrated.semanticTokens.some((token) => token.id === "custom.banner" && token.value === "#ff0000"),
  );
  assert.ok(
    migrated.semanticTokens.some(
      (token) => token.id === "action.primary.background" && token.value === "brand.600",
    ),
  );
  const light = migrated.themes.find((theme) => theme.id === "light")!;
  assert.equal(light.overrides["background.canvas"], "#fafafa");
  assert.equal(light.overrides["custom.extra"], "#111111");
  assert.ok(migrated.themes.some((theme) => theme.id === "dark"));
  // A read-only status probe reports the pending migration without persisting.
  const probeMem = memoryStorage({ [LEGACY_V1_KEY]: JSON.stringify([v1fixture()]) });
  const probe = createDesignSystemsStore(() => probeMem);
  assert.equal(probe.status().migrated, 1);
  assert.ok(!(DESIGN_SYSTEM_STORAGE_KEY in probeMem.dump()));
  // Normalized v2 was persisted; the legacy key is left intact, never erased.
  const persisted = JSON.parse(mem.dump()[DESIGN_SYSTEM_STORAGE_KEY]!) as { systems: Array<{ schemaVersion: number }> };
  assert.ok(persisted.systems.every((system) => system.schemaVersion === 2));
  assert.ok(LEGACY_V1_KEY in mem.dump());
  // A second read does not duplicate the migrated system.
  assert.equal(store.list().length, 1);
});

test("v1 records inside the v2 envelope migrate in place", () => {
  const mem = memoryStorage({ [DESIGN_SYSTEM_STORAGE_KEY]: envelopeWith([v1fixture()]) });
  const store = createDesignSystemsStore(() => mem);
  assert.equal(store.list()[0]?.meta.name, "Manthan");
  const persisted = JSON.parse(mem.dump()[DESIGN_SYSTEM_STORAGE_KEY]!) as { systems: Array<{ schemaVersion: number }> };
  assert.deepEqual(
    persisted.systems.map((system) => system.schemaVersion),
    [2],
  );
});

test("unsupported future schema is reported but not overwritten", () => {
  const future = { schemaVersion: 99, id: "future-1", meta: { name: "Future" } };
  const before = envelopeWith([future]);
  const mem = memoryStorage({ [DESIGN_SYSTEM_STORAGE_KEY]: before });
  const store = createDesignSystemsStore(() => mem);
  assert.deepEqual(store.list(), []);
  const status = store.status();
  assert.equal(status.incompatible, 1);
  assert.ok(status.warnings.some((warning) => warning.includes("99")));
  assert.equal(mem.dump()[DESIGN_SYSTEM_STORAGE_KEY], before);
  // Ordinary saves carry future records through verbatim.
  const saved = store.save(v2system("Current"));
  assert.equal(saved.ok, true);
  const after = JSON.parse(mem.dump()[DESIGN_SYSTEM_STORAGE_KEY]!) as { systems: Array<{ schemaVersion?: number }> };
  assert.ok(after.systems.some((system) => system.schemaVersion === 99));
  assert.ok(after.systems.some((system) => system.schemaVersion === 2));
});

test("unavailable storage is safe (SSR behavior)", () => {
  const store = createDesignSystemsStore(() => undefined);
  assert.deepEqual(store.list(), []);
  assert.equal(store.get("anything"), undefined);
  assert.equal(store.save(v2system("X")).ok, false);
  assert.equal(store.create({ name: "X", presetId: "saas", color: "#635bff", font: "Inter", density: "comfortable" }).ok, false);
  assert.equal(store.duplicate("anything").ok, false);
  assert.deepEqual(store.remove("anything"), { removed: false });
  assert.equal(store.exportRaw("anything"), undefined);
  const imported = store.importRaw("[]");
  assert.equal(imported.imported, 0);
  const status = store.status();
  assert.equal(status.available, false);
  assert.equal(status.total, 0);
  // Subscriptions are safe no-ops when storage is unavailable.
  let calls = 0;
  const unsubscribe = store.subscribe(() => {
    calls += 1;
  });
  store.list();
  unsubscribe();
  assert.equal(calls, 0);
});

test("singleton is SSR-safe in this environment", () => {
  // Node has no window: the browser singleton must degrade gracefully.
  assert.deepEqual(browserDesignSystems.list(), []);
  assert.equal(browserDesignSystems.status().available, false);
});

test("subscribers are notified on mutations only", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  let calls = 0;
  const unsubscribe = store.subscribe(() => {
    calls += 1;
  });
  const saved = store.save(v2system("Sub"));
  assert.equal(saved.ok, true);
  assert.equal(calls, 1);
  if (saved.ok) {
    store.duplicate(saved.system.id);
    assert.equal(calls, 2);
    store.remove(saved.system.id);
    assert.equal(calls, 3);
  }
  unsubscribe();
  store.save(v2system("After"));
  assert.equal(calls, 3);
});

test("exportRaw and importRaw round-trip", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const saved = store.save(v2system("Roundtrip"));
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const raw = store.exportRaw(saved.system.id);
  assert.ok(typeof raw === "string");
  assert.equal(store.exportRaw("missing"), undefined);
  store.clear();
  assert.deepEqual(store.list(), []);
  const result = store.importRaw(raw);
  assert.equal(result.imported, 1);
  assert.equal(store.get(saved.system.id)?.meta.name, "Roundtrip");
  const bad = store.importRaw("{oops");
  assert.equal(bad.imported, 0);
  assert.ok(bad.warnings.length >= 1);
});

test("clear wipes v2 only and is dev/test-only", () => {
  const mem = memoryStorage({ [LEGACY_V1_KEY]: JSON.stringify([v1fixture()]) });
  const store = createDesignSystemsStore(() => mem);
  store.save(v2system("Temp"));
  assert.ok(DESIGN_SYSTEM_STORAGE_KEY in mem.dump());
  store.clear();
  assert.ok(!(DESIGN_SYSTEM_STORAGE_KEY in mem.dump()));
  assert.ok(LEGACY_V1_KEY in mem.dump());
  // Legacy systems are never erased: the next read re-migrates them.
  assert.equal(store.list()[0]?.meta.name, "Manthan");
});
