// Font catalogue for the Typography editor (Step 6).
// A curated, production-appropriate set of families — deliberately small, not
// "thousands of fonts". No font files are bundled and no provider or API key
// is required: families render in the browser when installed and otherwise
// fall back to their stack. Saved typography data stays plain strings, so a
// future font-provider integration can expand this catalogue without changing
// any persisted system.

export type FontCategory = "sans" | "serif" | "mono" | "display";

export const FONT_CATEGORIES: ReadonlyArray<{ id: FontCategory; label: string }> = [
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
  { id: "display", label: "Display" },
];

export function fontCategoryLabel(category: FontCategory): string {
  return FONT_CATEGORIES.find((entry) => entry.id === category)?.label ?? category;
}

export interface FontCatalogEntry {
  family: string;
  category: FontCategory;
  /** Render fallbacks used when the family is not locally installed. */
  fallbacks: string[];
  note?: string;
}

const SANS_FALLBACK = ["system-ui", "-apple-system", "Segoe UI", "sans-serif"];
const SERIF_FALLBACK = ["Georgia", "Times New Roman", "serif"];
const MONO_FALLBACK = ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"];

/** Curated catalogue. Includes the Step 4 onboarding baseline families. */
export const FONT_CATALOG: readonly FontCatalogEntry[] = [
  // Compatibility baseline (Step 4 onboarding options).
  { family: "Inter", category: "sans", fallbacks: SANS_FALLBACK },
  { family: "Manrope", category: "sans", fallbacks: SANS_FALLBACK },
  { family: "DM Sans", category: "sans", fallbacks: SANS_FALLBACK },
  { family: "Plus Jakarta Sans", category: "sans", fallbacks: SANS_FALLBACK },
  { family: "Space Grotesk", category: "display", fallbacks: SANS_FALLBACK },
  { family: "Geist", category: "sans", fallbacks: SANS_FALLBACK },
  { family: "Georgia", category: "serif", fallbacks: SERIF_FALLBACK, note: "System serif" },
  // Additional sans.
  { family: "IBM Plex Sans", category: "sans", fallbacks: SANS_FALLBACK },
  { family: "Source Sans 3", category: "sans", fallbacks: SANS_FALLBACK },
  // Serif.
  { family: "Source Serif 4", category: "serif", fallbacks: SERIF_FALLBACK },
  { family: "Newsreader", category: "serif", fallbacks: SERIF_FALLBACK },
  { family: "IBM Plex Serif", category: "serif", fallbacks: SERIF_FALLBACK },
  // Mono.
  { family: "Geist Mono", category: "mono", fallbacks: MONO_FALLBACK },
  { family: "IBM Plex Mono", category: "mono", fallbacks: MONO_FALLBACK },
  { family: "JetBrains Mono", category: "mono", fallbacks: MONO_FALLBACK },
  { family: "Menlo", category: "mono", fallbacks: MONO_FALLBACK, note: "System mono" },
  // Display.
  { family: "Fraunces", category: "display", fallbacks: SERIF_FALLBACK },
  { family: "DM Serif Display", category: "display", fallbacks: SERIF_FALLBACK },
];

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

/** Exact (case-insensitive) catalogue lookup. Null means a custom family. */
export function findFont(family: string): FontCatalogEntry | null {
  const name = normalizeName(family);
  if (!name) return null;
  return FONT_CATALOG.find((entry) => normalizeName(entry.family) === name) ?? null;
}

/** True when the family is not in the catalogue (user-supplied custom font). */
export function isCustomFamily(family: string): boolean {
  return family.trim().length > 0 && findFont(family) === null;
}

/**
 * Search by family-name substring, optionally filtered by category.
 * Empty query returns every entry in the category. Pass "all" for no filter.
 */
export function searchFonts(query: string, category: FontCategory | "all" = "all"): FontCatalogEntry[] {
  const needle = normalizeName(query);
  return FONT_CATALOG.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (!needle) return true;
    return normalizeName(entry.family).includes(needle);
  });
}

/**
 * CSS `font-family` value for rendering: the family plus a fallback stack.
 * Only names containing spaces are quoted; hyphenated generics such as
 * `system-ui` or `ui-monospace` stay bare. Custom families render through the
 * caller-supplied fallbacks so previews never break.
 */
export function renderStack(family: string, fallbacks: readonly string[]): string {
  const quote = (name: string): string => {
    const item = name.trim();
    if (!item) return item;
    if (item.startsWith('"')) return item;
    return item.includes(" ") ? `"${item}"` : item;
  };
  const head = family.trim();
  if (!head) return fallbacks.map(quote).filter(Boolean).join(", ");
  return [quote(head), ...fallbacks.map(quote).filter(Boolean)].join(", ");
}

/** Sensible fallback stack for a family: catalogue entry or mono/sans default. */
export function fallbacksFor(family: string, category?: FontCategory): string[] {
  const entry = findFont(family);
  if (entry) return [...entry.fallbacks];
  if (category === "mono") return [...MONO_FALLBACK];
  if (category === "serif" || category === "display") return [...SERIF_FALLBACK];
  return [...SANS_FALLBACK];
}
