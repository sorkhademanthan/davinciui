// Browser-side persistence for design systems (Step 2).
// Versioned storage envelope + schema migrations + lifecycle management.
// No React state, no polling, no UI. Every method is safe during SSR and
// when localStorage is unavailable or contains malformed data.

import {
  type CreateDesignSystemInput,
  type DesignSystemConfig,
} from "./domain";
import { isV1System, isV2SystemShape, migrateV1ToV2, normalizeRecord } from "./migrations";
import { createSystemFromStarter } from "./starters";

// ---------------------------------------------------------------------------
// Storage envelope (separate from an individual system's schemaVersion)
// ---------------------------------------------------------------------------

/** The one clearly named localStorage key for v2 systems. */
export const DESIGN_SYSTEM_STORAGE_KEY = "davinciui.design-system.v2";

/** Read-only legacy key holding pre-Step-1 (v1) systems. Never written to. */
const LEGACY_V1_STORAGE_KEY = "davinciui.design-system.v1";

/**
 * Tombstone key: ids the user explicitly deleted. The legacy v1 key is
 * read-only and never erased, so without this a deleted legacy record would
 * re-migrate on the next read and the delete would appear to fail.
 */
const DELETED_IDS_STORAGE_KEY = "davinciui.design-system.v2.deleted";

/** Bound on tombstone growth; ids are random per system, so this is ample. */
const MAX_DELETED_IDS = 500;

function readDeletedIds(storage: StorageLike): Set<string> {
  try {
    const raw = storage.getItem(DELETED_IDS_STORAGE_KEY);
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((entry): entry is string => typeof entry === "string" && entry !== ""),
    );
  } catch {
    return new Set();
  }
}

function writeDeletedIds(storage: StorageLike, ids: Set<string>): boolean {
  try {
    storage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify([...ids].slice(-MAX_DELETED_IDS)));
    return true;
  } catch {
    return false;
  }
}

export const DESIGN_SYSTEM_STORAGE_VERSION = 1;

export interface StorageEnvelope {
  storageVersion: number;
  systems: unknown[];
  updatedAt: string;
}

/** Minimal storage surface so tests can inject an in-memory backend. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// ---------------------------------------------------------------------------
// Result types (non-throwing status reporting)
// ---------------------------------------------------------------------------

export interface RepositoryStatus {
  ok: boolean;
  /** False during SSR or when localStorage is unavailable. */
  available: boolean;
  /** Loadable v2 systems (after migration). */
  total: number;
  skippedInvalid: number;
  migrated: number;
  incompatible: number;
  warnings: string[];
}

export type SaveResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };
export type DuplicateResult = { ok: true; system: DesignSystemConfig } | { ok: false; error: string };
export interface RemoveResult {
  removed: boolean;
}
export interface ImportResult {
  imported: number;
  skipped: number;
  incompatible: number;
  warnings: string[];
}

export type RepositoryListener = () => void;

export interface DesignSystemsStore {
  list(): DesignSystemConfig[];
  /** Diagnostics for the last read: skips, migrations, incompatibilities. */
  status(): RepositoryStatus;
  get(id: string): DesignSystemConfig | undefined;
  save(system: DesignSystemConfig): SaveResult;
  create(input: CreateDesignSystemInput): SaveResult;
  duplicate(id: string): DuplicateResult;
  remove(id: string): RemoveResult;
  /** Development/test-only. Never exposed in product UI. */
  clear(): void;
  /** Serialize one system for later export work. No export UI here. */
  exportRaw(id: string): string | undefined;
  /** Ingest a JSON string, envelope, array, or single system. No import UI here. */
  importRaw(payload: unknown): ImportResult;
  /**
   * Refresh strategy for Overview/Builder client components: subscribe to
   * mutations, re-read via list()/get(). No React state inside, no polling.
   */
  subscribe(listener: RepositoryListener): () => void;
}

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(value: string, fallback = "design-system"): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || fallback;
}

function randomSuffix(length: number): string {
  try {
    const cryptoRef = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
    if (cryptoRef?.randomUUID) return cryptoRef.randomUUID().replace(/-/g, "").slice(0, length);
  } catch {
    // Fall through to Math.random.
  }
  return Math.random().toString(36).slice(2, 2 + length);
}

function deepClone<T>(value: T): T {
  try {
    const clone = (globalThis as { structuredClone?: (input: T) => T }).structuredClone;
    if (typeof clone === "function") return clone(value);
  } catch {
    // Fall through to JSON cloning.
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortByUpdatedAtDesc(systems: DesignSystemConfig[]): DesignSystemConfig[] {
  return [...systems].sort((a, b) => {
    const time = (b.meta?.updatedAt || "").localeCompare(a.meta?.updatedAt || "");
    if (time !== 0) return time;
    return (a.id || "").localeCompare(b.id || "");
  });
}

// ---------------------------------------------------------------------------
// Store factory
// ---------------------------------------------------------------------------

export function createDesignSystemsStore(
  getStorage: () => StorageLike | undefined,
): DesignSystemsStore {
  const listeners = new Set<RepositoryListener>();

  function notify(): void {
    for (const listener of [...listeners]) {
      try {
        listener();
      } catch {
        // A failing subscriber must never break persistence.
      }
    }
  }

  function readRaw(storage: StorageLike, key: string): string | null {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeEnvelope(storage: StorageLike, entries: unknown[]): boolean {
    try {
      const envelope: StorageEnvelope = {
        storageVersion: DESIGN_SYSTEM_STORAGE_VERSION,
        systems: entries,
        updatedAt: nowIso(),
      };
      storage.setItem(DESIGN_SYSTEM_STORAGE_KEY, JSON.stringify(envelope));
      return true;
    } catch {
      return false;
    }
  }

  interface Loaded {
    available: boolean;
    systems: DesignSystemConfig[];
    /** Verbatim v2-envelope entries (in original order). */
    envelopeEntries: unknown[];
    hadEnvelope: boolean;
    envelopeMalformed: boolean;
    skippedInvalid: number;
    migrated: number;
    incompatible: number;
    warnings: string[];
  }

  function load(persist: boolean): Loaded {
    const empty: Loaded = {
      available: false,
      systems: [],
      envelopeEntries: [],
      hadEnvelope: false,
      envelopeMalformed: false,
      skippedInvalid: 0,
      migrated: 0,
      incompatible: 0,
      warnings: [],
    };
    let storage: StorageLike | undefined;
    try {
      storage = getStorage();
    } catch {
      storage = undefined;
    }
    if (!storage) return empty;

    const loaded: Loaded = { ...empty, available: true };
    const now = nowIso();
    const deletedIds = readDeletedIds(storage);

    // 1. Read the v2 envelope.
    const raw = readRaw(storage, DESIGN_SYSTEM_STORAGE_KEY);
    if (raw !== null) {
      loaded.hadEnvelope = true;
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        loaded.envelopeMalformed = true;
        loaded.warnings.push("Stored design systems are malformed JSON; showing nothing rather than crashing.");
      }
      const entries =
        parsed !== null &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        Array.isArray((parsed as { systems?: unknown }).systems)
          ? ((parsed as { systems: unknown[] }).systems as unknown[])
          : null;
      if (parsed !== null && entries === null && !loaded.envelopeMalformed) {
        loaded.envelopeMalformed = true;
        loaded.warnings.push("Stored design systems use an unknown envelope; showing nothing rather than crashing.");
      }
      if (entries !== null) {
        loaded.envelopeEntries = entries;
        entries.forEach((entry, index) => {
          const normalized = normalizeRecord(entry, now);
          if (normalized.kind === "v2") {
            loaded.systems.push(normalized.system);
          } else if (normalized.kind === "migrated") {
            loaded.systems.push(normalized.system);
            loaded.migrated += 1;
          } else if (normalized.kind === "future") {
            loaded.incompatible += 1;
            loaded.warnings.push(
              `Stored system at index ${index} uses unsupported schemaVersion ${normalized.schemaVersion}; left untouched.`,
            );
          } else {
            loaded.skippedInvalid += 1;
            loaded.warnings.push(`Stored system at index ${index} is invalid and was skipped (${normalized.reason}).`);
          }
        });
      }
    }

    // 2. Ingest legacy v1 systems (read-only key; never written to, never erased).
    const legacyRaw = readRaw(storage, LEGACY_V1_STORAGE_KEY);
    if (legacyRaw !== null) {
      let legacyParsed: unknown = null;
      try {
        legacyParsed = JSON.parse(legacyRaw);
      } catch {
        loaded.warnings.push("Legacy v1 design systems are malformed JSON and were skipped.");
      }
      if (legacyParsed !== null) {
        const candidates = Array.isArray(legacyParsed) ? legacyParsed : [legacyParsed];
        const knownIds = new Set(loaded.systems.map((system) => system.id));
        for (const candidate of candidates) {
          if (!isV1System(candidate)) {
            if (candidate !== null && typeof candidate === "object") {
              loaded.skippedInvalid += 1;
              loaded.warnings.push("A legacy v1 record is invalid and was skipped.");
            }
            continue;
          }
          if (knownIds.has(candidate.id)) continue; // Already migrated earlier.
          if (deletedIds.has(candidate.id)) continue; // User-deleted: never resurrect read-only legacy records.
          loaded.systems.push(migrateV1ToV2(candidate, now));
          knownIds.add(candidate.id);
          loaded.migrated += 1;
        }
      }
    }

    loaded.systems = sortByUpdatedAtDesc(loaded.systems);

    // 3. Persist the normalized v2 result safely (only when something changed).
    // Verbatim carry-through: entries we cannot normalize (future/invalid)
    // are written back byte-identical so a migration never erases them.
    if (persist && loaded.migrated > 0) {
      const migratedById = new Map(loaded.systems.map((system) => [system.id, system]));
      const carried: unknown[] = [];
      for (const entry of loaded.envelopeEntries) {
        const normalized = normalizeRecord(entry, now);
        if (normalized.kind === "migrated") {
          carried.push(migratedById.get(normalized.system.id) ?? normalized.system);
        } else if (normalized.kind === "v2") {
          carried.push(normalized.system);
        } else {
          carried.push(entry);
        }
      }
      const carriedIds = new Set(
        carried.flatMap((entry) =>
          entry !== null && typeof entry === "object" && "id" in entry && typeof (entry as { id: unknown }).id === "string"
            ? [(entry as { id: string }).id]
            : [],
        ),
      );
      for (const system of loaded.systems) {
        if (!carriedIds.has(system.id)) carried.push(system);
      }
      // Keep loadable systems most-recently-updated-first; opaque entries
      // retain their relative order at the end.
      const loadable = sortByUpdatedAtDesc(
        carried.filter((entry) => isV2SystemShape(entry)) as DesignSystemConfig[],
      );
      const opaque = carried.filter((entry) => !isV2SystemShape(entry));
      if (!writeEnvelope(storage, [...loadable, ...opaque])) {
        loaded.warnings.push("Migrated systems could not be persisted (storage write failed).");
      }
    }

    return loaded;
  }

  function writeSystems(storage: StorageLike, systems: DesignSystemConfig[]): boolean {
    // Preserve opaque (future/invalid) envelope entries verbatim so ordinary
    // saves never erase records this version cannot understand. Entries that
    // normalize to v2 are fully described by `systems` and are not carried.
    const raw = readRaw(storage, DESIGN_SYSTEM_STORAGE_KEY);
    let opaque: unknown[] = [];
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw) as { systems?: unknown[] };
        if (parsed !== null && typeof parsed === "object" && Array.isArray(parsed.systems)) {
          opaque = parsed.systems.filter((entry) => {
            const normalized = normalizeRecord(entry, nowIso());
            return normalized.kind === "future" || normalized.kind === "invalid";
          });
        }
      } catch {
        // Malformed envelope: nothing valid to preserve.
      }
    }
    return writeEnvelope(storage, [...sortByUpdatedAtDesc(systems), ...opaque]);
  }

  function storageOrError(): { storage: StorageLike } | { error: string } {
    let storage: StorageLike | undefined;
    try {
      storage = getStorage();
    } catch {
      storage = undefined;
    }
    if (!storage) return { error: "Storage is unavailable (server-side render or blocked localStorage)." };
    return { storage };
  }

  return {
    list(): DesignSystemConfig[] {
      try {
        return load(true).systems;
      } catch {
        return [];
      }
    },

    status(): RepositoryStatus {
      try {
        const loaded = load(false);
        return {
          ok: loaded.available && loaded.envelopeMalformed === false,
          available: loaded.available,
          total: loaded.systems.length,
          skippedInvalid: loaded.skippedInvalid,
          migrated: loaded.migrated,
          incompatible: loaded.incompatible,
          warnings: loaded.warnings,
        };
      } catch {
        return {
          ok: false,
          available: false,
          total: 0,
          skippedInvalid: 0,
          migrated: 0,
          incompatible: 0,
          warnings: ["Repository read failed unexpectedly."],
        };
      }
    },

    get(id: string): DesignSystemConfig | undefined {
      try {
        return load(true).systems.find((system) => system.id === id);
      } catch {
        return undefined;
      }
    },

    save(system: DesignSystemConfig): SaveResult {
      try {
        const resolved = storageOrError();
        if ("error" in resolved) return { ok: false, error: resolved.error };
        if (!isV2SystemShape(system)) {
          const reason =
            system !== null && typeof system === "object" && (system as { schemaVersion?: unknown }).schemaVersion !== 2
              ? `Unsupported schemaVersion ${String((system as { schemaVersion?: unknown }).schemaVersion)}.`
              : "Invalid system object.";
          return { ok: false, error: reason };
        }
        if (system.meta.name.trim() === "") {
          return { ok: false, error: "A design-system name is required." };
        }
        const loaded = load(true);
        const now = nowIso();
        const previous = loaded.systems.find((entry) => entry.id === system.id);
        const next: DesignSystemConfig = {
          ...deepClone(system),
          meta: {
            ...system.meta,
            createdAt: previous?.meta.createdAt || system.meta.createdAt || now,
            updatedAt: now,
          },
        };
        const others = loaded.systems.filter((entry) => entry.id !== system.id);
        if (!writeSystems(resolved.storage, [...others, next])) {
          return { ok: false, error: "Storage write failed." };
        }
        // An explicit save wins over an earlier delete: drop any tombstone so
        // a re-saved id is never treated as deleted legacy data. Best effort
        // only — the envelope copy already wins over legacy records.
        try {
          const deleted = readDeletedIds(resolved.storage);
          if (deleted.delete(next.id)) writeDeletedIds(resolved.storage, deleted);
        } catch {
          // Ignore; persistence already succeeded.
        }
        notify();
        return { ok: true, system: next };
      } catch {
        return { ok: false, error: "Save failed unexpectedly." };
      }
    },

    create(input: CreateDesignSystemInput): SaveResult {
      try {
        // Thin adapter: the creation input is mapped onto the canonical
        // starter factory (starters.ts) — no template data lives here.
        return this.save(
          createSystemFromStarter({
            starterId: input.presetId,
            name: input.name,
            team: input.team,
            brand: input.brand,
            description: input.description,
            color: input.color,
            font: input.font,
            density: input.density,
          }),
        );
      } catch {
        return { ok: false, error: "Create failed unexpectedly." };
      }
    },

    duplicate(id: string): DuplicateResult {
      try {
        const resolved = storageOrError();
        if ("error" in resolved) return { ok: false, error: resolved.error };
        const original = load(true).systems.find((system) => system.id === id);
        if (!original) return { ok: false, error: `No design system found for id "${id}".` };
        const now = nowIso();
        const copy = deepClone(original);
        copy.id = `${slugify(`${original.meta.name} copy`)}-${randomSuffix(4)}`;
        copy.meta = { ...copy.meta, name: `${original.meta.name} copy`, createdAt: now, updatedAt: now };
        return this.save(copy);
      } catch {
        return { ok: false, error: "Duplicate failed unexpectedly." };
      }
    },

    remove(id: string): RemoveResult {
      try {
        const resolved = storageOrError();
        if ("error" in resolved) return { removed: false };
        const loaded = load(true);
        if (!loaded.systems.some((system) => system.id === id)) return { removed: false };
        // Tombstone first: the legacy v1 key is read-only and never erased,
        // so without this a deleted legacy record would re-migrate on the
        // next read and the delete would appear to fail. Tombstone-first also
        // keeps failures honest: if the envelope write below fails, the
        // system is still visibly present (the envelope copy always wins over
        // legacy records and ignores tombstones).
        if (readRaw(resolved.storage, LEGACY_V1_STORAGE_KEY) !== null) {
          const deleted = readDeletedIds(resolved.storage);
          deleted.add(id);
          if (!writeDeletedIds(resolved.storage, deleted)) return { removed: false };
        }
        if (!writeSystems(resolved.storage, loaded.systems.filter((system) => system.id !== id))) {
          return { removed: false };
        }
        notify();
        return { removed: true };
      } catch {
        return { removed: false };
      }
    },

    clear(): void {
      // Development/test-only: wipes the v2 envelope plus delete tombstones.
      // The legacy v1 key is intentionally left alone.
      try {
        const resolved = storageOrError();
        if ("error" in resolved) return;
        try {
          resolved.storage.removeItem(DESIGN_SYSTEM_STORAGE_KEY);
        } catch {
          return;
        }
        try {
          resolved.storage.removeItem(DELETED_IDS_STORAGE_KEY);
        } catch {
          // Best effort; the envelope wipe already succeeded.
        }
        notify();
      } catch {
        // Never throw.
      }
    },

    exportRaw(id: string): string | undefined {
      try {
        const system = load(true).systems.find((entry) => entry.id === id);
        return system ? JSON.stringify(system, null, 2) : undefined;
      } catch {
        return undefined;
      }
    },

    importRaw(payload: unknown): ImportResult {
      const result: ImportResult = { imported: 0, skipped: 0, incompatible: 0, warnings: [] };
      try {
        const resolved = storageOrError();
        if ("error" in resolved) {
          result.warnings.push(resolved.error);
          return result;
        }
        let parsed = payload;
        if (typeof payload === "string") {
          try {
            parsed = JSON.parse(payload);
          } catch {
            result.warnings.push("Import payload is not valid JSON.");
            return result;
          }
        }
        const candidates: unknown[] =
          parsed !== null &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Array.isArray((parsed as { systems?: unknown }).systems)
            ? ((parsed as { systems: unknown[] }).systems as unknown[])
            : Array.isArray(parsed)
              ? parsed
              : [parsed];
        const now = nowIso();
        const loaded = load(true);
        const merged = new Map(loaded.systems.map((system) => [system.id, system]));
        const importedIds: string[] = [];
        for (const candidate of candidates) {
          const normalized = normalizeRecord(candidate, now);
          if (normalized.kind === "future") {
            result.incompatible += 1;
            result.warnings.push(
              `Import skipped an unsupported schemaVersion ${normalized.schemaVersion}; left untouched.`,
            );
          } else if (normalized.kind === "invalid") {
            result.skipped += 1;
            result.warnings.push(`Import skipped an invalid record (${normalized.reason}).`);
          } else {
            const system = normalized.system;
            if (system.meta.name.trim() === "") {
              result.skipped += 1;
              result.warnings.push("Import skipped a system with a missing name.");
              continue;
            }
            merged.set(system.id, deepClone(system));
            importedIds.push(system.id);
            result.imported += 1;
          }
        }
        if (result.imported > 0) {
          if (!writeSystems(resolved.storage, [...merged.values()])) {
            result.warnings.push("Imported systems could not be persisted (storage write failed).");
            result.imported = 0;
          } else {
            // Explicit imports win over earlier deletes: drop tombstones for
            // re-imported ids. Best effort only.
            try {
              const deleted = readDeletedIds(resolved.storage);
              let changed = false;
              for (const id of importedIds) {
                if (deleted.delete(id)) changed = true;
              }
              if (changed) writeDeletedIds(resolved.storage, deleted);
            } catch {
              // Ignore; the import already succeeded.
            }
            notify();
          }
        }
        return result;
      } catch {
        result.warnings.push("Import failed unexpectedly.");
        return result;
      }
    },

    subscribe(listener: RepositoryListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function browserStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const candidate = window.localStorage;
    // Probe: some browsers expose localStorage but throw on access.
    candidate.getItem(DESIGN_SYSTEM_STORAGE_KEY);
    return candidate;
  } catch {
    return undefined;
  }
}

/** Browser singleton used by Overview, direct creation, and Builder. */
export const browserDesignSystems: DesignSystemsStore = createDesignSystemsStore(browserStorage);
