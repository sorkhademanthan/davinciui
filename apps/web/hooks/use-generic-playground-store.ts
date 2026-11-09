import { create } from "zustand";

export type PlaygroundValue = string | number | boolean;

export type GenericPlaygroundConfig = Record<string, PlaygroundValue>;

interface GenericPlaygroundStore {
  /** Per-slug live config. Seeded from registered defaults on first read. */
  configs: Record<string, GenericPlaygroundConfig>;
  /** Per-slug registered defaults (module-owned, never mutated). */
  defaults: Record<string, GenericPlaygroundConfig>;
  /** Per-slug active preset label. */
  activePresets: Record<string, string>;
  /** Per-slug remount counter used by the Reload control. */
  renderVersions: Record<string, number>;
  /**
   * Seed a slug's defaults once. Safe to call on every module import: an
   * existing live config (user personalization) is never overwritten.
   */
  registerDefaults: (
    slug: string,
    defaults: GenericPlaygroundConfig,
    options?: { activePreset?: string },
  ) => void;
  setConfig: (slug: string, config: GenericPlaygroundConfig) => void;
  updateConfig: (slug: string, updates: Partial<GenericPlaygroundConfig>) => void;
  setActivePreset: (slug: string, preset: string) => void;
  reset: (slug: string) => void;
  bumpRenderVersion: (slug: string) => void;
}

export const useGenericPlaygroundStore = create<GenericPlaygroundStore>(
  (set) => ({
    configs: {},
    defaults: {},
    activePresets: {},
    renderVersions: {},
    registerDefaults: (slug, defaults, options) =>
      set((state) => {
        if (state.defaults[slug]) return state;
        return {
          defaults: { ...state.defaults, [slug]: defaults },
          configs: state.configs[slug]
            ? state.configs
            : { ...state.configs, [slug]: { ...defaults } },
          activePresets: {
            ...state.activePresets,
            [slug]: state.activePresets[slug] ?? options?.activePreset ?? "Default",
          },
        };
      }),
    setConfig: (slug, config) =>
      set((state) => ({
        configs: { ...state.configs, [slug]: config },
      })),
    updateConfig: (slug, updates) =>
      set((state) => ({
        configs: {
          ...state.configs,
          [slug]: {
            ...(state.configs[slug] ?? {}),
            ...updates,
          } as GenericPlaygroundConfig,
        },
      })),
    setActivePreset: (slug, preset) =>
      set((state) => ({
        activePresets: { ...state.activePresets, [slug]: preset },
      })),
    reset: (slug) =>
      set((state) => {
        const defaults = state.defaults[slug] ?? {};
        return {
          configs: { ...state.configs, [slug]: { ...defaults } },
          activePresets: { ...state.activePresets, [slug]: "Default" },
          renderVersions: {
            ...state.renderVersions,
            [slug]: (state.renderVersions[slug] ?? 0) + 1,
          },
        };
      }),
    bumpRenderVersion: (slug) =>
      set((state) => ({
        renderVersions: {
          ...state.renderVersions,
          [slug]: (state.renderVersions[slug] ?? 0) + 1,
        },
      })),
  }),
);

/**
 * Read a slug's live config, falling back to the registered defaults (and
 * seeding them if the module has not registered yet).
 */
export function useGenericPlaygroundConfig<T extends GenericPlaygroundConfig>(
  slug: string,
  defaults: T,
): T {
  return useGenericPlaygroundStore(
    (state) => (state.configs[slug] ?? defaults) as T,
  );
}
