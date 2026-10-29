# Component Detail Preview Audit

Date: 2026-10-09 (statuses re-verified against `main` on Oct 9, 2026)
Scope: `/docs/components/[slug]` and `/experience/components/[slug]`
Legend: **[x] done / [~] partially done / [ ] open**

## Goal

Keep the vertical "preview first, documentation after" structure while making preview
behavior consistent, personalizable, responsive, accessible, and shared across every
component surface.

## Critical

- [x] **1. Fullscreen is owned by the preview wrapper again.**
  Was broken after the layout restructure (stale `data-docs-preview-shell` /
  `data-docs-right-column` selectors). Verified fixed: zero stale selector matches in
  `apps/web/components/docs-preview-wrapper.tsx`; Escape-to-close, Tab focus trap,
  focus restoration, `aria-modal`, header hide + scroll-lock with restore are all
  present (`docs-preview-wrapper.tsx:346-416`). Browser-validated 2026-10-09
  (1280×720 desktop, 390×844 mobile, no overflow; see validation record below).
- [x] **2. Personalization is a complete product pipeline (component pages).**
  DONE Oct 9, verified end-to-end in a live browser on `wave-bars-loader`:
  personalize → store → generated Usage → copy all agree, with no cross-page
  leakage. How: every one of the 22 personalized preview modules now publishes
  generated usage code under its registry slug (14 already had bespoke
  `generateCode`; added for ambient-audio-toggle, burn-plus, ink-flow,
  motion-hamburger, neon-mesh-bg, soft-fluid-gradient, spectra-noise,
  sunlight-effect, wave-bars-loader). The playground store keys
  generated code by slug (`setPersonalizedCode`), so one page's settings can
  never leak into another page's Usage block. Both Usage surfaces consume it:
  `DynamicCodeBlock` swaps the Default tab to live-highlighted code with a
  "Personalized" badge + live copy, and `LiveCodeBlock` (12 call sites) is
  slug-gated the same way. Also fixed en route: example preview wrappers were
  hijacking the shared variant index to 0 on mount, so Usage opened on a
  variant tab while the preview showed Default — wrappers without variants no
  longer publish an index. Proven: set Speed=2 in the drawer → Usage
  re-rendered `speed={2}` → clipboard contained `speed={2}`.
  Explicitly out of scope (static by nature): gallery cards, shipped registry
  source, and hardcoded example variants do not reflect live settings.
- [x] **3. There is one shared preview contract.**
  DONE Oct 9 (`apps/web/lib/preview-contract.ts`): a single `PreviewDefinition`
  per slug — stage height, card background, assistive exposure, reduced-motion
  safety, scrolling, fullscreen capability, stage treatment — with defaults that
  reproduce historical behavior exactly and small explicit override tables.
  All surfaces read it: the docs shell (height/scroll), `DocsPreviewWrapper`
  (scroll/fullscreen gate), and the gallery card (replacing a 30-slug
  reduced-motion allowlist, 5-slug aria list, and background branches with data).
  Verified live: standard pages keep the 420/480 shell, preloader pages resolve
  600px, text-reveal resolves a scroll region, expand controls render, reduced
  motion still shows live previews only for safe components — zero new
  page errors. Per-component thumbnail *content* stays bespoke (that is
  artwork, not behavior). Fixed en route: `basic-component-card-slugs.ts` was
  needlessly `"use client"`, which crashed server components calling the
  contract — directive removed (pure data module).
- [x] **4. Preview formatting options all resolve.**
  DONE Oct 9: `unstyledPreview` was wired earlier; now `previewCode` — which
  was declared but never even destructured — drives the Default tab (what's
  actually rendering above). Where it meaningfully differs from the full
  usage snippet (3 pages), the usage keeps a dedicated Usage tab instead of
  being displaced; the other 113 string-usage pages are byte-identical, and
  LiveCodeBlock pages are untouched. Verified live: Default/Usage tabs with
  matching content on `cinematic-card-carousel`, no Usage tab on `button`,
  personalized flow intact. `tsc` + `eslint` clean.

## Structure and consistency

- [x] **5. Capability-driven height for components with very different needs.**
  DONE Oct 9: the preview contract now tiers detail stages — `compact`
  (`min-h-[320px]`) for 39 small primitives, `standard` (420/480) by default,
  `tall` (600px) for the 6 preloaders, plus an `aspect` field reserved for
  future full-bleed curation. Tiers curated from measured desktop content
  heights across all 130 docs pages (compact group max 292px, ≥28px breathing
  room; canvas/immersive categories never compact since headless measurement
  cannot see their output). All tiers are minimums, so they can never clip —
  verified live on all 39 compact pages at desktop + mobile: content fits,
  no overflow. The old collapsed-stage fix (grid shell + filling iframes)
  stands underneath.
- [x] **6. Generalized scrollable overflow policy.**
  DONE Oct 9: scrolling is now a contract capability (`scrollable` +
  `scrollMaxHeight`, default 560), not a Text Reveal special case. The marker
  attribute is generic (`data-preview-scroll-region`), the aria-label reads
  "Scrollable preview", and the shell takes a definite contract height so the
  stage scrolls internally instead of growing the page (this also broke a
  scroller/stage resize feedback loop that had ballooned the text-reveal page
  past 90,000px — now a sane ~6,200px with a 514px capped stage). Verified
  live: region renders from the contract alone (text-reveal's explicit prop
  was removed as proof), internal scroll + variant scroll-reset work.
  Deliberately excluded: scroll-*linked* components (marquees, scroll
  galleries, timelines) and self-contained scrollers (message-scroller,
  scroll-area) must never be capped — verified they resolve no region.
- [x] **7. Examples mount once per viewport, not twice per page.**
  DONE Oct 9: below-fold example sections now mount their preview only within
  a 300px viewport margin (`LazyExamplePreview` + shared `useInViewport`
  hook — the same pattern as the gallery cards). Offscreen examples are
  cheap 280px placeholders, so a 4-example page keeps ~2 live instances
  instead of 5+. Headings, anchors, TOC entries, and SEO markup always
  render. Verified live on `wave-bars-loader`: all four sections mount with
  toolbars when scrolled into view, placeholders return when far away,
  `#glow` anchor navigation works, zero errors.
- [x] **8. One page-owned personalization controller.**
  DONE Oct 9: a single `PersonalizeController` per component page registers the
  panel once (under the page slug) and renders the only drawer portal.
  `DocsPreviewWrapper` no longer renders or registers drawers, so mounted
  examples cannot spawn competing portals. Verified live: exactly one portal
  whether opened from the toolbar pill or the site header, still one after
  scrolling through all examples, pipeline (drawer → Usage) still live, and
  non-personalized pages show no entry points at all. Navigating away clears
  registration via effect cleanup.
- [x] **9. One shared shell for `/docs/components` and `/experience/components`.**
  DONE Oct 9: both routes render the same `ComponentDetailShell` — identical
  220px nav rail + 300px section rail, identical content width, identical
  surface (verified live: 920px main on both). Each route keeps its own
  section nav (docs links stay in Docs, experience links in Experience, proven
  in the rails) and its own mobile drawer + breadcrumb. `DocsShell` is now a
  thin wrapper over the shared shell (docs routes byte-identical). Experience
  detail pages bypass the section sidebar via `ExperienceChrome` (gallery and
  sibling routes untouched). Pagination is route-aware (stays in-section via
  client pathname; server resolution kept the registry bundle out of the
  client). Verified: no drift between routes, no errors.
- [x] **10. The right-side table of contents exists on Experience pages.**
  Fixed as a consequence of 9 — the shared shell always renders the
  `DocsOnThisPage` rail, so vertically-long Experience documentation gets the
  same section navigation as Docs (verified live, 300px rail present).
- [x] **11. The toolbar is capability-gated and decluttered on mobile.**
  DONE Oct 9: the contract now declares universal controls (`controls.search
  / .reload / .theme`, all default-on so any component can opt out), joining
  the existing content-driven gates (source, personalize, fullscreen,
  variants). Mobile verified live: search + theme collapse below `sm` (both
  remain one tap away in the site header), leaving source/personalize/reload/
  fullscreen — desktop renders all six, unchanged. `tsc` + `eslint` clean.
- [x] **12. Reload means reset.**
  DONE Oct 9, end-to-end verified: the toolbar Reload now restores the
  component's module defaults before remounting, via a per-slug reset
  registry in the playground store (all 24 personalized modules register
  their reset; the wrapper calls it by slug). A `dirty` flag (config vs
  module defaults) drives the live Usage surfaces, so pristine loads show
  static code with no badge, touched state shows live code, and reload
  returns to static. Proven live on `wave-bars-loader`: no badge on load →
  badge on Speed=2 → reload → slider back to 1.0, badge gone, static usage
  restored. Zero errors.

## Accessibility and interaction

- [x] **13. Fullscreen and drawers have complete modal behavior.**
  DONE Oct 9: a shared `useModalDialog` hook (Escape, Tab trap with overlay
  awareness, focus restore, symmetric scroll-lock) now drives the Personalize
  drawer, the Source drawer (which also gained `role`/`aria-modal`/label —
  it had none), and matches the pre-existing fullscreen behavior. Both drawer
  close buttons also gained visible focus rings. Proven keyboard-only live:
  trap holds across 12 tabs, body locks/unlocks, Escape closes, focus returns
  to the exact trigger on both drawers. Zero errors.
- [x] **14. Focus outlines have visible replacements everywhere they matter.**
  DONE Oct 9 via site-wide sweep: the two drawer close buttons gained rings
  (with item 13); the landing custom-work card link (bg-change only) and the
  design-system token input (bare `outline-none`, ring only when configured)
  gained `focus-visible` rings. Verified: variant/code tabs, toolbar buttons,
  and editor inputs pair `outline-none` with rings; demo-content and
  unfocusable mocks intentionally untouched (altering them would change what's
  demonstrated); dialog containers keep `outline-none` (programmatic-focus
  fallback only, keyboard focus lands on ringed controls).
- [x] **15. Toolbar touch targets meet 44px.**
  DONE Oct 9: every preview-toolbar icon button (plus the mobile nav-drawer
  buttons) carries an invisible 6px halo (`before:-inset-1.5`), lifting the
  effective target to 44px while the visual box stays a dense 32px — desktop
  density unchanged. Proven with a touchscreen tap 8px outside the visual box:
  the action fires. `tsc` clean.
- [x] **16. Heavy detail previews pause offscreen.**
  DONE Oct 9: the main preview honors the same 300px-margin unmount as cards
  and example sections (new `unmountOffscreen` contract field), while the
  toolbar, tabs, and shell stay mounted. Fullscreen is exempt (always live);
  user-started audio surfaces are exempt by contract (never killed by
  scrolling). Verified live on `silk-aurora`: mounted at top → placeholder
  when scrolled past → remounted on return; `ambient-audio-toggle` never
  placeholders. With cards (validated earlier), examples (item 7), and now
  the main preview all gated, no heavy surface runs while far offscreen.

## Recommended fixing order

1. ~~Rebuild fullscreen around the current preview element~~ — done (item 1).
2. Introduce one `PreviewDefinition` contract for aspect ratio, height mode,
   background, scrolling, fullscreen, theme, and personalization (items 3, 5, 6, 11).
3. Make personalization use one page-level state source that drives preview,
   generated Usage code, variants, and export/copy output (items 2, 8, 12).
4. Consolidate `/docs/components` and `/experience/components` onto one
   component-detail shell (items 9, 10).
5. Remove duplicate example mounting and make heavy previews intersection-aware
   (items 7, 16); resolve `previewCode` (item 4).
6. Complete keyboard, focus, modal, mobile-toolbar, and touch-target behavior
   (items 13–15).

## Validation records (kept from the Oct 9 browser pass)

### Fullscreen acceptance (all passing at time of check)

- Expands the selected preview to the complete viewport on Docs and Experience routes.
- Uses the preview's exact on-page rectangle as the enter/exit origin without remounting.
- Closes from the toolbar and with `Escape`; focus returns to the trigger.
- Fits desktop and mobile viewports without horizontal overflow (1280×720;
  390×844 measured exactly, no document-level overflow).
- Opening Source from fullscreen closes it cleanly; Search opens above it.

### Preview structure (measured Oct 9, post grid-shell + iframe-fill changes)

- Lens Drift Grid: shell 996×480, stage/canvas 994×434.
- Text Video Mask: shell 996×606, stage 994×560, centered.
- Pixel Preloader: 600px stage + iframe (was 150px browser default).
- Horizontal Scroll Gallery: shell 996×686, stage/iframe 994×640.
- Scroll Sync Gallery: shell 996×646, stage/iframe 994×600.
- Silk Aurora: shell 996×480, stage/canvas 994×434.
- Mobile 390×844: no document-level horizontal overflow on any measured page.
- Hover Cards follow-up: `size` query + `min-height` zeroed block-axis units in
  detail preview — now inline-size queries + observed-height composition; pointer
  hover verified (`aria-pressed`, 220px → 361px); catalog autoplay intact.
- Preloader height follow-up: Fill, Staircase, Pixel, Editorial Wipe, Geometric,
  Preloader Pro share the 600px detail stage (646px incl. 46px toolbar).
- Catalog mounting follow-up: 300px viewport margin; Orbit Spiral Gallery remounts
  on re-entry with autoplay continuing (distinct frames 1s apart).
