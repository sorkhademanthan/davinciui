/**
 * Slugs hidden from the public site (gallery, docs listings, sidebar groups).
 * Components remain in the registry/files for reference; they are simply
 * not surfaced in navigation or listing UIs.
 *
 * Keep this list in sync when hiding/unhiding components.
 */
export const HIDDEN_COMPONENT_SLUGS = new Set<string>([
  "liquid-chrome",
  "animated-pill-button",
  "hover-transition",
  // Hidden per request (kept for docs/registry reference, not shown in UI)
  "text-reveal",
  "burn-plus",
  "services-showcase",
  "vertical-image-marquee",
  "team-slide-reveal",
  "hover-card",
  "liquid-reveal-button",
]);

export function isHiddenComponentSlug(slug: string): boolean {
  return HIDDEN_COMPONENT_SLUGS.has(slug);
}
