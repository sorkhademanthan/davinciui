# Preview Scalability Checklist

This checklist covers making component gallery previews scalable (lower CPU/GPU/memory and bandwidth/runtime risk) **without modifying component source implementations**.

## Constraint

- **Do not modify component implementations** in `packages/ui/src/components/*` (or their core behavior).
- Allowed on approval: gallery/preview infrastructure, `apps/web/components/docs/previews/*-card-preview*`, `apps/web/lib/preview-contract*`, `apps/web/registry/index.ts`, `apps/web/app/experience/components/*`, asset references/config/docs, and adding static/video assets.

---

## Checklist A — Coding Agent Tasks

_I will do these only when you explicitly command each item/group._

### A0. Audit & baseline (no behavior change)

- [x] **A0.1** Snapshot current gallery behavior/cost: confirm `IntersectionObserver` config, render gating, and dynamic imports in `apps/web/components/component-card-live-preview.tsx`.
- [x] **A0.2** Confirm card media priority and wide-card rules in `apps/web/app/experience/components/page.tsx` (`previewVideo` → `previewImage` → live → placeholder).
- [x] **A0.3** Inventory all slugs rendered as live previews vs basic vs static and map to preview files (`apps/web/components/docs/previews/*`, `basic-component-card-slugs.ts`).
- [x] **A0.4** Record baseline (bundle/chunk hints for preview modules, `apps/web/public` size, and current heavy-slug list) for before/after comparison.

### A1. Runtime guardrails (stop-the-bleeding, infra only)

- [ ] **A1.1** Reduce mount window in `component-card-live-preview.tsx`: lower `rootMargin` (e.g. `300px` → `0–100px`) and/or require stronger visibility/threshold so far-offscreen cards don’t mount.
- [ ] **A1.2** Add a **global concurrency cap** for live/mounted previews (e.g. 2–4), prioritizing cards nearest viewport center; overflow falls back to static label/poster/frame.
- [ ] **A1.3** Enforce “static in gallery” when `prefers-reduced-motion` for continuous/heavy tiers (respect contract and strengthen where needed) without changing component code.
- [ ] **A1.4** Pause/unmount or stop gallery previews when tab is hidden (`document.visibilityState` / Page Visibility API) if applicable at orchestrator level.
- [ ] **A1.5** Ensure live preview mounts are fully torn down offscreen (verify timers/RAF/listeners stop via unmount) and that no preview runs outside allowed mount conditions.
- [ ] **A1.6** Harden `previewVideo` path in `experience/components/page.tsx`: lazy/intersection-driven play, `preload="none"` (or minimal), pause/reset when out of view, avoid autoplaying many videos simultaneously.

### A2. Static-first preview pipeline & data model

- [ ] **A2.1** Extend registry/metadata (`apps/web/registry/index.ts`) to support per-component gallery media and mode (e.g. `previewImage`, `previewVideo`, poster, and/or explicit `cardPreviewMode: "static" | "video" | "live-once" | "hover" | "live"`).
- [ ] **A2.2** Extend `apps/web/lib/preview-contract.ts` (and types) to express gallery card render policy per slug/tier, keeping detail-page behavior intact.
- [ ] **A2.3** Update `component-card-live-preview.tsx` to honor policy: render **poster/image/video/static frame** for P0/P1, allow `hover/live-once` only if enabled and under cap, and keep **live** only for P3.
- [ ] **A2.4** Update `experience/components/page.tsx` to prefer optimized static/video assets per registry and fall back safely; keep existing wide-card/layout rules.
- [ ] **A2.5** Create a documented asset convention (paths/naming, e.g. poster + webm/mp4 per slug) and wire loading to it (CDN/base URL support if you choose external hosting).

### A3. Per-slug gallery treatment plan

_Apply via infra/assets/card-preview wrappers only — no edits to `packages/ui/src/components/*`._

- [ ] **A3.1 — P0 (never live in gallery; use poster or short CDN video)**
  - [ ] WebGL/Three/shaders/particles: `tubes-cursor`, `fluid-cursor`, `fluid-particle-text`, `glitch-liquid-text`, `ink-flow`, `silk-aurora`, `soft-fluid-gradient`, `pixel-flow`, `shader-text`, `neon-mesh-bg`, `spectra-noise`, `sunlight-effect`, `liquid-chrome-button`
  - [ ] Video/media-decode & SVG-anim heavy: `text-video-mask` (remove remote live decode in card), `focus-carousel`, `ambient-strip`, `curve-wall`, `media-text-hover` (if video), `noiser`
- [ ] **A3.2 — P1 (frozen/static frame or poster/video; no continuous loop)**
  - [ ] Preloaders: `preloader-pro`, `preloader-pro-v1`, `preloader-pro-v4`, `preloader-pro-v5` (use frozen frame approach where available), `fill-preloader`, `staircase-preloader`, `pixel-preloader`, `editorial-wipe-preloader`, `geometric-preloader`, `wave-bars-loader`
  - [ ] Scroll sims, galleries, bento/accordion: `scroll-reveal-image`, `cms-media-bento`, `cms-scroll-gallery`, `interactive-media-accordion`, `stacked-scroll-gallery`, `scroll-sync-gallery`, `scroll-media-expand`, `scroll-timeline`, `infinite-image-gallery`, `orbit-spiral-gallery`, `spiral-media-gallery`, `3d-flow-gallery`, `circular-gallery`, `editorial-image-stack`
  - [ ] Auto-motion carousels/marquees/reveals: `vertical-image-marquee`, `cinematic-card-carousel`, `pixel-wipe-carousel`, `segmented-image-carousel`, `arc-carousel`, `arcwave-carousel`, `streamline-carousel`, `depth-carousel-3d`, `wavy-flow-carousel`, `profile-carousel`, `team-slide-reveal`, `hover-transition`, `crumpled-paper-reveal`, `radial-fan-deck`, `tilt-flip-polaroid`, `lens-drift-grid`, `services-showcase`, `glass-scene-dock`
- [ ] **A3.3 — P2 (play-once or hover/focus-to-play, capped)**
  - [ ] Cursors/effects: `circle-cursor`, `magic-cursor-pro`, `elastic-blob-cursor`, `electric-vijdi-cursor`, `chromatic-cursor`, `geometric-trail-cursor`
  - [ ] Animated text/interaction: `gsap-text`, `text-morph`, `shake-text`, `encrypted-text`, `random-text-reveal`, `text-reveal`, `rolling-text`, `animated-metric`, `motion-hamburger`, `animated-pill-button`, `nudge-button`, `burn-plus`, `bookshelf`, `liquid-reveal-button`, `curved-inline-type`, `character-field`, `hover-cards`, `fanned-deck` (as needed)
- [ ] **A3.4 — P3 (live allowed, low cost, in-view only)**
  - [ ] All basic primitives in `basic-component-card-slugs.ts` via `BasicComponentCardPreview` remain lightweight live/static-miniature per policy.
  - [ ] Audio/interaction components idle in card, no autoplay audio: `ambient-audio-toggle`, `interaction-sound-kit`, `voice-recorder`, `keyboard-command-sounds`, `upload-sound-status`.
- [ ] **A3.5** For each slug, implement the chosen mode by using an existing frozen/preview-safe card path where available, swapping to poster/video, or making the preview wrapper mount only on intent/cap — **without editing `packages/ui/src/components/*`**.

### A4. Validation & safety checks

- [ ] **A4.1** Verify gallery still renders all components, correct links, categories/filters, wide-card layout, and empty states.
- [ ] **A4.2** Verify no continuous heavy loops run for P0/P1 cards offscreen or at idle; confirm concurrency cap works.
- [ ] **A4.3** Verify reduced-motion and visibility handling for gallery previews.
- [ ] **A4.4** Run typecheck/lint/build relevant to web (e.g. `pnpm --filter web typecheck`, lint as appropriate) and fix any infra issues introduced.
- [ ] **A4.5** Re-measure/compare: preview chunk/bundle impact and basic runtime sanity (no obvious long tasks from many simultaneous previews).
- [ ] **A4.6** Document final per-slug preview mode mapping and asset locations in repo docs/comments (e.g. this file, `docs/`, or preview-contract notes).

---

## Checklist B — Your Tasks (steps you take for scalability)

### B0. Decisions & scope

- [ ] **B0.1** Approve priority order (P0 → P1 → P2 → P3) and whether any slug needs an exception (must stay live in gallery).
- [ ] **B0.2** Decide per slug: **poster image** vs **short loop video** vs **frozen frame** vs **hover/play-once** (use Checklist A3 as baseline).
- [ ] **B0.3** Define quality targets: card size/aspect (incl. 16:9 wide cards), poster format (WebP/AVIF), video length/fps/resolution/bitrate (e.g. 3–6s, muted, WebM+MP4).
- [ ] **B0.4** Decide asset hosting: keep in repo/`public` (small/static only) vs **CDN/object storage** (recommended for videos/many posters). Choose provider (e.g. Cloudflare R2, Bunny, S3+CloudFront, Vercel Blob/other) and budget.

### B1. Capture/create preview assets (content work)

- [ ] **B1.1** Create a capture list for all **P0 and P1** slugs (and P2 if needed): representative state, theme (light/dark), and motion segment for video.
- [ ] **B1.2** Produce **poster images** (single best frame) for every slug that will use static/video fallback.
- [ ] **B1.3** Produce **short loop videos** (WebM + MP4, poster, muted, seamless where possible) for slugs chosen as video.
- [ ] **B1.4** Produce **frozen-frame captures** for preloaders/galleries where a static composition is preferred over video.
- [ ] **B1.5** Optimize assets (compress, correct dimensions, strip metadata) to keep per-asset size small and consistent.
- [ ] **B1.6** Name/organize assets by slug per agreed convention and deliver final file set + mapping (slug → poster/video URLs/paths).

### B2. Hosting, CDN, and delivery

- [ ] **B2.1** Set up storage bucket/CDN (or chosen host), access, and public/cacheable delivery URLs.
- [ ] **B2.2** Upload assets, configure caching headers/TTL and correct MIME types (webm/mp4/avif/webp).
- [ ] **B2.3** Provide base URL/config values to wire into the app (env/config) and confirm CORS/origin behavior if needed.
- [ ] **B2.4** (If on Vercel or similar) Review plan limits relevant to this site: bandwidth, edge/function/image optimization usage; ensure media is served from CDN to avoid overages.

### B3. Integration sign-off (after agent implements)

- [ ] **B3.1** Review and approve the per-slug mode mapping and any registry/contract changes.
- [ ] **B3.2** Supply/confirm final asset URLs for P0/P1 (and others) so the agent can populate registry/media references.
- [ ] **B3.3** Visually QA gallery cards on desktop/mobile, light/dark, and reduced-motion: correctness, no unexpected live playback, acceptable quality.
- [ ] **B3.4** Spot-check a sample of **detail/demo pages** to confirm full-fidelity live components are unchanged.

### B4. Performance verification & rollout

- [ ] **B4.1** Test gallery with many components visible (scroll through all categories): CPU/GPU, memory, dropped frames, device thermals on a mid/low-end device.
- [ ] **B4.2** Run Lighthouse/Web Vitals on gallery and key pages; compare before/after.
- [ ] **B4.3** Monitor hosting analytics after deploy (bandwidth, cache hit rate, errors, any platform limit warnings).
- [ ] **B4.4** Decide rollout: merge to main/deploy when checks pass; keep a rollback plan (revert branch/previous asset mapping) if issues appear.

### B5. Ongoing governance

- [ ] **B5.1** Adopt a rule for new components: must include gallery mode + poster/video (if non-trivial) before adding to gallery.
- [ ] **B5.2** Periodically re-audit as catalog grows (new heavy components, asset sizes, concurrency/mount settings).

---

## Notes

- **Client runtime cost** (CPU/GPU/memory from live previews) is the primary user/device risk; **hosting limits** (bandwidth, edge/image/cache/build on free tiers) are most affected by asset delivery and Next.js rendering/image optimization choices.
- Gallery priority today: `previewVideo` → `previewImage` → live preview → placeholder (see `apps/web/app/experience/components/page.tsx`).
- Keep full-fidelity live demos on detail/demo pages; optimize the **gallery card** experience for scalability.
- Mark items complete as you go (change `[ ]` to `[x]`) and add notes under items if needed.

---

## Baseline (A0.4)

Captured: **2026-11-13** (local). Command: `pnpm --filter web build` (Next.js 16.0.10 Turbopack, compiled successfully; 422 static pages generated). No app behavior changed; no files in `packages/ui/src/components/*` modified.

### 1) Build and route baseline

- **Route table (from build log):** Next 16/Turbopack output lists route types but does **not** emit legacy per-route `Size` / `First Load JS` columns in this run.
  - `○ /experience/components` — Static
  - `● /experience/components/[slug]` — SSG via `generateStaticParams` (150 paths shown in build log, e.g. `/experience/components/circle-cursor`, `.../chromatic-cursor`, `.../magic-cursor-pro`, +147 more)
  - `● /docs/components/[slug]` — SSG (150 paths)
  - `○ /demo/preloader-pro-v5` — Static (and other demo routes static/dynamic as listed)
  - `ƒ /experience/components/opengraph-image` — Dynamic (edge runtime warning shown during build)
- **Preview module inventory (code):** `apps/web/components/component-card-live-preview.tsx` contains **91** `next/dynamic(..., { ssr: false })` imports (90 named preview modules/primitives + basic preview module path mapping coverage) for gallery card previews.
- **Production chunk attribution note:** In `.next/static/chunks/*.js`, only some preview identifiers were directly attributable by string search (e.g. `ink-flow`, `shader-text`, `text-video-mask` matched shared chunk `0a774d74f4b44cb8.js`). Most per-slug card-preview modules were **not individually attributable** to unique hashed static chunks in this build output (likely merged/split/shared by bundler). Dev named chunks exist under `.next/dev/...` but are not production baseline. Per-slug sizes below are therefore reported as **chunk attribution (prod)** + **code-based module/dependency analysis**.

### 2) Largest production static chunks (proxy for client payload)

Top 15 `.next/static/chunks/*.js` by raw size (raw / gzip bytes):

| # | Chunk | Raw (bytes) | Gzip (bytes) |
|---|---|---:|---:|
| 1 | `527fc26d04285762.js` | 1,243,534 | 450,088 |
| 2 | `0a774d74f4b44cb8.js` | 1,231,811 | 333,396 |
| 3 | `102b8fcc3c99c355.js` | 1,224,027 | 331,366 |
| 4 | `8394bf00e7641e86.js` | 874,791 | 230,555 |
| 5 | `53c41e0f283bf434.js` | 761,933 | 207,245 |
| 6 | `db8a26bb27f78133.js` | 635,422 | 177,054 |
| 7 | `eb47f3c01259022f.js` | 587,512 | 112,658 |
| 8 | `c58c55b0c10f878c.js` | 363,796 | 84,609 |
| 9 | `fb50817e87a049ff.js` | 318,834 | 88,293 |
| 10 | `5951c1e896c3c3d8.js` | 231,295 | 74,975 |
| 11 | `81e7d71736714b33.js` | 214,274 | 67,467 |
| 12 | `a2b5dcbabe0496cd.js` | 196,810 | 51,960 |
| 13 | `b2ca395e3918ed9d.js` | 138,439 | 42,413 |
| 14 | `3d7145751564a3d3.js` | 132,753 | 42,809 |
| 15 | `a87a7246b4b280f6.js` | 132,753 | 42,731 |

_Attribution: `0a774d74f4b44cb8.js` matched `ink-flow`, `shader-text`, and `text-video-mask` preview modules (shared). Other preview modules not uniquely attributable in prod static chunks._

### 3) Public assets baseline

- **Total:** `25M` (`apps/web/public`)

Top 20 largest files in `apps/web/public`:

| # | Size (bytes) | File |
|---|---:|---|
| 1 | 4,088,519 | `apps/web/public/banner.png` |
| 2 | 4,051,562 | `apps/web/public/preview_original.png` |
| 3 | 4,036,368 | `apps/web/public/audio/strangerthings/strangerthingsbg.mp3` |
| 4 | 3,858,218 | `apps/web/public/home.png` |
| 5 | 603,667 | `apps/web/public/opengraph-image.png` |
| 6 | 453,012 | `apps/web/public/images/segmented-image-carousel/coastal-tree.jpg` |
| 7 | 429,995 | `apps/web/public/images/segmented-image-carousel/spiral-staircase.jpg` |
| 8 | 410,384 | `apps/web/public/images/hover-transition-team.jpg` |
| 9 | 405,550 | `apps/web/public/images/segmented-image-carousel/concrete-oculus.jpg` |
| 10 | 391,941 | `apps/web/public/images/segmented-image-carousel/chrome-chair.jpg` |
| 11 | 370,030 | `apps/web/public/audio/strangerthings/vecnaattack.mp3` |
| 12 | 352,844 | `apps/web/public/audio/ambient-toggle-demo.wav` |
| 13 | 256,334 | `apps/web/public/images/spiral-3d-slider/ghosted-portrait.webp` |
| 14 | 205,635 | `apps/web/public/audio/strangerthings/rockpunchcinematic.mp3` |
| 15 | 183,281 | `apps/web/public/images/spiral-3d-slider/prism-portrait.webp` |
| 16 | 177,816 | `apps/web/public/LastoriaBoldRegular.otf` |
| 17 | 169,612 | `apps/web/public/preview-videos/component-animations/spiral3dslider.mp4` |
| 18 | 167,839 | `apps/web/public/images/spiral-3d-slider/orange-haze.webp` |
| 19 | 151,384 | `apps/web/public/images/spiral-3d-slider/blue-profile.webp` |
| 20 | 147,830 | `apps/web/public/images/spiral-3d-slider/teal-echo.webp` |

### 4) Heavy-slug baseline (A3.1 P0 & A3.2 P1)

Legend: deps/tech flags are **code-based** (card preview + underlying UI/component files). “Prod chunk attribution” = match found in `.next/static/chunks/*.js` by module identifier; otherwise `not uniquely attributable`.

#### A3.1 — P0 (19 slugs)

| Slug | Exists | Preview/module files (primary) | Code deps/tech flags | Prod chunk attribution |
|---|---|---|---|---|
| `tubes-cursor` | yes | `apps/web/components/docs/previews/tubes-cursor-card-preview.tsx`, `packages/ui/src/components/tubes-cursor.tsx` | `three/WebGL`, `canvas/WebGL` | not uniquely attributable |
| `fluid-cursor` | yes | `.../fluid-cursor-card-preview.tsx`, `packages/ui/src/components/fluid-cursor.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `fluid-particle-text` | yes | `.../fluid-particle-text-card-preview.tsx`, `packages/ui/src/components/fluid-particle-text.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `glitch-liquid-text` | yes | `.../glitch-liquid-text-card-preview.tsx`, `packages/ui/src/components/glitch-liquid-text.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `ink-flow` | yes | `packages/ui/src/components/ink-flow.tsx` (inline/direct use in card preview path) | `canvas/WebGL`, `RAF/timers` | `0a774d74f4b44cb8.js` raw 1,231,811 / gzip 332,300 (shared, 8 candidates) |
| `silk-aurora` | yes | `.../silk-aurora-card-preview.tsx`, `packages/ui/src/components/silk-aurora.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `soft-fluid-gradient` | yes | `.../soft-fluid-gradient-card-preview.tsx`, `packages/ui/src/components/soft-fluid-gradient.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `pixel-flow` | yes | `.../pixel-flow-card-preview.tsx`, `packages/ui/src/components/pixel-flow.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `shader-text` | yes | `packages/ui/src/components/shader-text.tsx` (direct) | `canvas/WebGL`, `RAF/timers` | `0a774d74f4b44cb8.js` raw 1,231,811 / gzip 332,300 (shared, 10 candidates) |
| `neon-mesh-bg` | yes | `.../neon-mesh-bg-card-preview.tsx`, `packages/ui/src/components/neon-mesh-bg.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `spectra-noise` | yes | `.../spectra-noise-card-preview.tsx`, `packages/ui/src/components/spectra-noise.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `sunlight-effect` | yes | `.../sunlight-effect-card-preview.tsx`, `packages/ui/src/components/sunlight-effect.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `liquid-chrome-button` | yes | `.../liquid-chrome-button-card-preview.tsx`, `packages/ui/src/components/liquid-chrome-button.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `text-video-mask` | yes | `packages/ui/src/components/text-video-mask.tsx` (direct; card uses remote video URL) | `video`, `canvas/WebGL` | `0a774d74f4b44cb8.js` raw 1,231,811 / gzip 332,300 (shared, 9 candidates) |
| `focus-carousel` | yes | `.../focus-carousel-card-preview.tsx`, `packages/ui/src/components/focus-carousel.tsx` | `video`, `RAF/timers`, `framer-motion`, `three/WebGL` (code refs) | not uniquely attributable |
| `ambient-strip` | yes | `.../ambient-strip-card-preview.tsx`, `packages/ui/src/components/ambient-strip.tsx` | `video`, `canvas/WebGL`, `RAF/timers`, `framer-motion` | not uniquely attributable |
| `curve-wall` | yes | `.../curve-wall-card-preview.tsx`, `packages/ui/src/components/curve-wall.tsx` | `video`, `RAF/timers` | not uniquely attributable |
| `media-text-hover` | yes | `.../media-text-hover-card-preview.tsx`, `packages/ui/src/components/media-text-hover.tsx` | `video` (if media), `framer-motion` | not uniquely attributable |
| `noiser` | yes | `.../noiser-card-preview.tsx`, `packages/ui/src/components/noiser.tsx` | `RAF/timers` (SVG/filter animation pattern) | not uniquely attributable |

#### A3.2 — P1 (42 slugs)

| Slug | Exists | Preview/module files (primary) | Code deps/tech flags | Prod chunk attribution |
|---|---|---|---|---|
| `preloader-pro` | yes | `.../preloader-pro-card-preview.tsx`, `packages/ui/src/components/preloader-pro.tsx` | `RAF/timers` | not uniquely attributable |
| `preloader-pro-v1` | yes | `.../preloader-pro-v1-card-preview.tsx`, `packages/ui/src/components/preloader-pro-v1.tsx` | `RAF/timers` | not uniquely attributable |
| `preloader-pro-v4` | yes | `.../preloader-pro-v4-card-preview.tsx`, `packages/ui/src/components/preloader-pro-v4.tsx` | `RAF/timers` | not uniquely attributable |
| `preloader-pro-v5` | yes | `.../preloader-pro-v5-card-preview.tsx`, `packages/ui/src/components/preloader-pro-v5.tsx` | `RAF/timers` | not uniquely attributable |
| `fill-preloader` | yes | `.../fill-preloader-card-preview.tsx`, `packages/ui/src/components/fill-preloader.tsx` | `RAF/timers`, `framer-motion` | not uniquely attributable |
| `staircase-preloader` | yes | `.../staircase-preloader-card-preview.tsx`, `packages/ui/src/components/staircase-preloader.tsx` | `RAF/timers`, `framer-motion` | not uniquely attributable |
| `pixel-preloader` | yes | `.../pixel-preloader-card-preview.tsx`, `packages/ui/src/components/pixel-preloader.tsx` | `canvas/WebGL`, `RAF/timers` | not uniquely attributable |
| `editorial-wipe-preloader` | yes | `.../editorial-wipe-preloader-card-preview.tsx`, `packages/ui/src/components/editorial-wipe-preloader.tsx` | `RAF/timers`, `framer-motion` | not uniquely attributable |
| `geometric-preloader` | yes | `.../geometric-preloader-card-preview.tsx`, `packages/ui/src/components/geometric-preloader.tsx` | `RAF/timers` | not uniquely attributable |
| `wave-bars-loader` | yes | `.../wave-bars-loader-card-preview.tsx`, `packages/ui/src/components/wave-bars-loader.tsx` | (light DOM/CSS) | not uniquely attributable |
| `scroll-reveal-image` | yes | `.../scroll-reveal-image-card-preview.tsx`, `packages/ui/src/components/scroll-reveal-image.tsx` | `framer-motion` | not uniquely attributable |
| `cms-media-bento` | yes | `.../cms-media-bento-card-preview.tsx`, `packages/ui/src/components/cms-media-bento.tsx` | `RAF/timers` | not uniquely attributable |
| `cms-scroll-gallery` | yes | `.../cms-scroll-gallery-card-preview.tsx`, `packages/ui/src/components/cms-scroll-gallery.tsx` | `framer-motion`, `video` | not uniquely attributable |
| `interactive-media-accordion` | yes | `.../interactive-media-accordion-card-preview.tsx`, `packages/ui/src/components/interactive-media-accordion.tsx` | `RAF/timers`, `framer-motion`, `video` | not uniquely attributable |
| `stacked-scroll-gallery` | yes | `.../stacked-scroll-gallery-card-preview.tsx`, `packages/ui/src/components/stacked-scroll-gallery.tsx` | `RAF/timers`, `framer-motion`, `video` | not uniquely attributable |
| `scroll-sync-gallery` | yes | `.../scroll-sync-gallery-card-preview.tsx`, `packages/ui/src/components/scroll-sync-gallery.tsx` | `RAF/timers`, `framer-motion`, `three/WebGL` (code refs) | not uniquely attributable |
| `scroll-media-expand` | yes | `.../scroll-media-expand-card-preview.tsx`, `packages/ui/src/components/scroll-media-expand.tsx` | `RAF/timers`, `framer-motion`, `video` | not uniquely attributable |
| `scroll-timeline` | yes | `.../scroll-timeline-card-preview.tsx`, `packages/ui/src/components/scroll-timeline.tsx` | `RAF/timers`, `canvas/WebGL`, `framer-motion`, `three/WebGL` (code refs) | not uniquely attributable |
| `infinite-image-gallery` | yes | `.../infinite-image-gallery-card-preview.tsx`, `packages/ui/src/components/infinite-image-gallery.tsx` | `RAF/timers`, `framer-motion` | not uniquely attributable |
| `orbit-spiral-gallery` | yes | `.../orbit-spiral-gallery-card-preview.tsx`, `packages/ui/src/components/orbit-spiral-gallery.tsx` | `canvas/WebGL`, `three/WebGL` | not uniquely attributable |
| `spiral-media-gallery` | yes | `.../spiral-media-gallery-card-preview.tsx`, `packages/ui/src/components/spiral-media-gallery.tsx` | `RAF/timers` | not uniquely attributable |
| `3d-flow-gallery` | yes | `.../3d-flow-gallery-card-preview.tsx`, `packages/ui/src/components/3d-flow-gallery.tsx` | `RAF/timers`, `canvas/WebGL`, `three/WebGL` | not uniquely attributable |
| `circular-gallery` | yes | `.../circular-gallery-card-preview.tsx`, `packages/ui/src/components/circular-gallery.tsx` | `RAF/timers`, `canvas/WebGL`, `framer-motion`, `three/WebGL` | not uniquely attributable |
| `editorial-image-stack` | yes | `.../editorial-image-stack-card-preview.tsx`, `packages/ui/src/components/editorial-image-stack.tsx` | `RAF/timers` | not uniquely attributable |
| `vertical-image-marquee` | yes | `.../vertical-image-marquee-card-preview.tsx`, `packages/ui/src/components/vertical-image-marquee.tsx` | `framer-motion` | not uniquely attributable |
| `cinematic-card-carousel` | yes | `.../cinematic-card-carousel-card-preview.tsx`, `packages/ui/src/components/cinematic-card-carousel.tsx` | `RAF/timers`, `framer-motion`, `video` | not uniquely attributable |
| `pixel-wipe-carousel` | yes | `.../pixel-wipe-carousel-card-preview.tsx`, `packages/ui/src/components/pixel-wipe-carousel.tsx` | `RAF/timers`, `canvas/WebGL` | not uniquely attributable |
| `segmented-image-carousel` | yes | `.../segmented-image-carousel-card-preview.tsx`, `packages/ui/src/components/segmented-image-carousel.tsx` | `RAF/timers`, `canvas/WebGL` | not uniquely attributable |
| `arc-carousel` | yes | `.../arc-carousel-card-preview.tsx`, `packages/ui/src/components/arc-carousel.tsx` | `RAF/timers`, `video` | not uniquely attributable |
| `arcwave-carousel` | yes | `.../arcwave-carousel-card-preview.tsx`, `packages/ui/src/components/arcwave-carousel.tsx` | `RAF/timers`, `video` | not uniquely attributable |
| `streamline-carousel` | yes | `.../streamline-carousel-card-preview.tsx`, `packages/ui/src/components/streamline-carousel.tsx` | `RAF/timers`, `canvas/WebGL` | not uniquely attributable |
| `depth-carousel-3d` | yes | `.../depth-carousel-3d-card-preview.tsx`, `packages/ui/src/components/depth-carousel-3d.tsx` | `RAF/timers`, `canvas/WebGL`, `framer-motion` | not uniquely attributable |
| `wavy-flow-carousel` | yes | `.../wavy-flow-carousel-card-preview.tsx`, `packages/ui/src/components/wavy-flow-carousel.tsx` | `RAF/timers`, `canvas/WebGL`, `three/WebGL` | not uniquely attributable |
| `profile-carousel` | yes | `.../profile-carousel-card-preview.tsx`, `packages/ui/src/components/profile-carousel.tsx` | `RAF/timers`, `framer-motion` | not uniquely attributable |
| `team-slide-reveal` | yes | `.../team-slide-reveal-card-preview.tsx`, `packages/ui/src/components/team-slide-reveal.tsx` | `RAF/timers` | not uniquely attributable |
| `hover-transition` | yes | `.../hover-transition-card-preview.tsx`, `packages/ui/src/components/hover-transition.tsx` | `RAF/timers` | not uniquely attributable |
| `crumpled-paper-reveal` | yes | `.../crumpled-paper-reveal-card-preview.tsx`, `packages/ui/src/components/crumpled-paper-reveal.tsx` | `RAF/timers`, `canvas/WebGL` | not uniquely attributable |
| `radial-fan-deck` | yes | `.../radial-fan-deck-card-preview.tsx`, `packages/ui/src/components/radial-fan-deck.tsx` | `RAF/timers` | not uniquely attributable |
| `tilt-flip-polaroid` | yes | `.../tilt-flip-polaroid-card-preview.tsx`, `packages/ui/src/components/tilt-flip-polaroid.tsx` | `RAF/timers`, `framer-motion` | not uniquely attributable |
| `lens-drift-grid` | yes | `.../lens-drift-grid-card-preview.tsx`, `packages/ui/src/components/lens-drift-grid.tsx` | `RAF/timers`, `canvas/WebGL`, `framer-motion` | not uniquely attributable |
| `services-showcase` | yes | `.../services-showcase-card-preview.tsx`, `packages/ui/src/components/services-showcase.tsx` | `RAF/timers`, `three/WebGL` (code refs) | not uniquely attributable |
| `glass-scene-dock` | yes | `.../glass-scene-dock-card-preview.tsx`, `packages/ui/src/components/glass-scene-dock.tsx` | `framer-motion` | not uniquely attributable |

#### Flags (A3 list validation)

- **Missing from A3 lists:** none in A3.1/A3.2 were missing files; all 61 slugs exist and map to preview/component modules. No additional **very-high** WebGL/Three live gallery previews identified outside P0 by this code scan (other `three/WebGL`/`canvas` flags appear in some P1/P2-class components already listed in P0/P1 or lower tiers per prior audit); `curved-inline-type`, cursor trails, and animated text remain in P2/P3 as medium/low. (Recommend confirming against full audit if new components added.)
- **In A3 lists but non-existent:** none found.

### 5) Runtime baseline (code-based, current IO + grid)

- **Current behavior:** `IntersectionObserver` with `rootMargin: "300px 0px"`, `threshold: 0.01`; card mounts while intersecting expanded band and unmounts when leaving (`component-card-live-preview.tsx:850-856`).
- **Card layout:** gallery grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, default preview height `h-48` (~192px) except wide 16:9 (`preloader-pro-v1/v4/v5`) (`experience/components/page.tsx:445,469`).
- **Estimated simultaneously mountable preview cards** (approx., margin adds 300px above+below viewport; `ceil((viewportH + 600) / (cardH + gap)) * cols`):

| Viewport | Size (W×H) | Columns | ~Visible cards | ~Mountable with 300px margin |
|---|---:|---:|---:|---:|
| Desktop typical | 1440×900 | 3 | ~18 | **~27** |
| Desktop large | 1920×1080 | 3 | ~21 | **~30** |
| Mobile typical | 390×844 | 1 | ~6 | **~8** |

- **Risk:** In “All”/dense categories, mounted cards may include heavy live previews (WebGL/Three/canvas/video/RAF) until scrolled far away; there is no global concurrency cap.

