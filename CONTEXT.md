# Agent Context

> Shared handoff file. **Any agent starting work in this repo must read this first**
> and update it before pausing/handing off. Keep it current and factual.

## How to use this file

- Before starting a task, add an entry under **Active task** with goal, plan, and files touched.
- While working, record decisions, blockers, and exact commands used.
- Before handing off/pausing, update **Status**, **Next steps**, and **Open questions**.
- Do not delete history; move completed work to **Completed / verified**.

---

## Repo snapshot

- Project: DavinciUI monorepo (Next.js app `apps/web`, component lib `packages/ui`, registry in `apps/web/registry/index.ts` + `apps/web/public/r/*`).
- Branch: `main`
- HEAD: `3f50629` — `refactor: remove SegmentedImageCarousel component and related code; ...` (2026-11-20)
- Working tree: **has uncommitted changes** from the all-video poster-first rollout (see Active task) plus untracked `CONTEXT.md` and new poster assets.
- Package manager: pnpm (`packageManager: pnpm@10.4.1`); repo also has a stale `bun.lock`.
- Local artifacts: `tmp/` is gitignored (preview screenshots/logs); `.next/` gitignored.

## Last work sessions (context from commit history)

1. `9d8c4a3` **feat: new component preview changes** (Manthan, 2026-11-20)
   - Added `apps/web/components/customize-panel.tsx` (~784 lines) and migrated ~25 playground previews from the old `PersonalizeController`/`PersonalizeDrawer` to inline `CustomizePanel`.
   - Deleted `apps/web/components/personalize-controller.tsx` and `personalize-drawer.tsx`.
   - Verification artifacts exist in `tmp/verify-customize/` (41 results; no horizontal overflow failures detected).
2. `3f50629` **remove SegmentedImageCarousel + related code** (Nirvik30, 2026-11-20, pulled)
   - Removed 6 components consistently from `packages/ui`, registry, docs pages, previews, categories/accessibility/motion sections:
     `segmented-image-carousel`, `cms-scroll-gallery`, `editorial-image-stack`, `fanned-deck`, `fluid-cursor`, `bookshelf`.
   - Also removed `apps/web/components/cookie-consent.tsx`.
   - No dangling imports found for the removed components.

## Active task

- **Glitch Liquid Text → Studio Lumio reference (2026-11-21) — implementation QA passed; final visual polish pending.**
  - Goal: make `GlitchLiquidText` match the Studio Lumio reference behavior: localized cursor-driven liquid distortion, starburst/wave/pinch deformation, dynamic RGB split, crisp clean text before interaction, optional custom cursor, touch/responsive support, docs/registry/live-preview integration.
  - Implementation completed in this session:
    - `packages/ui/src/components/glitch-liquid-text.tsx`: added `responsive` fit, `starburstStrength`, `waveStrength`, `pinchStrength`; added radial starburst, wave, pinch, radial glow; tuned local RGB and default strengths; enabled touch pointer down/up/cancel release; added `touchAction: none` when interactive; default clean idle behavior.
    - `packages/ui/src/styles/globals.css`: added self-hosted Anton `@font-face` from `apps/web/public/fonts/anton/anton-latin.woff2`.
    - Docs/previews updated to `DAVINCIUI`, `#080808`, `fontSize 250`, `lineHeight 1.2`, new tuned defaults.
    - Registry regenerated via `node scripts/generate-registry.js glitch-liquid-text`.
  - Final tuned defaults after first hover QA: `distortionStrength=0.42`, `distortionRadius=0.2`, `liquidStrength=1`, `starburstStrength=0.28`, `waveStrength=0.22`, `pinchStrength=0.22`, `chromaticAberration=0.014`, `glitchStrength=0.08`; `autoAnimate=false`.
  - Final QA after fallback/prettier/registry update: `apps/web npx tsc --noEmit` clean; component + docs lint clean; Prettier clean; `node scripts/generate-registry.js glitch-liquid-text` regenerated registry; Playwright/Chrome on `:3000` clean/no overflow/no console errors, Anton loaded, host background `rgb(8, 8, 8)`.
  - Fixed light/dark mode in the Glitch docs playground: added a themed render stage using `next-themes`, changed stage background to `bg-background`, and passed theme-aware text/background colors; QA now shows dark host bg `rgb(8, 8, 8)` and light host bg `rgb(248, 250, 252)`, with text `DAVINCIUI`.

- **Poster-first hover/tap-to-play for all video-backed components (2026-11-21) — DONE.**
- Scope: every gallery card with a CMS or `previewVideo` source (~58 CMS slugs + `liquid-chrome`), plus home `VideoPreviewMedia`.
- Goal: no video downloads at rest; posters only until hover/focus (desktop) or tap (touch).
- Changes:
  - `apps/web/app/experience/components/components-gallery-client.tsx`: `GalleryCardMedia` is poster-first for any card with video. `<video preload="none">` mounts only when active + in view + motion allowed. Mouse hover and keyboard `:focus-visible` activate; touch gets a full-card play overlay (`[@media(hover:none)]`) that activates on first tap, then the second tap follows the card link. Poster load errors fall back to a neutral gradient.
  - `apps/web/components/landing/video-preview-media.tsx`: home cards play only on mouse hover or keyboard `:focus-visible`; touch keeps using the existing “Live preview” button.
  - Generated 49 missing WebP posters (24 slugs × 2 themes + `liquid-chrome` × 2) under `apps/web/public/preview-videos/home/<slug>/`, ~744 KB total.
- Verification:
  - `cd apps/web && npx tsc --noEmit` clean; `npx eslint <changed files> --max-warnings 0` clean.
  - Playwright (Chrome against existing dev server on `:3000`): Text Animations tab → 13 posters, **0 video requests initially, 1 after hover**; mobile overlay visible, first tap plays, second tap navigates to `/experience/components/gsap-text`; All tab → 58 posters, 0 broken, 0 videos until hover; home `gsap-text` → 0 before hover, 1 after.
- Known gap: `pixel-wipe-carousel`, `cinematic-card-carousel`, `lens-drift-grid` have local videos/posters but are not in `CONTENTFUL_PREVIEW_SLUGS` / generated media, so the gallery does not currently play them. Follow-up: wire them into the Contentful preview set or add `previewVideo` to registry.
- Deployment note: if production sets `NEXT_PUBLIC_HOME_PREVIEW_VIDEO_BASE` to a remote CDN, upload the 49 new posters there; otherwise the new cards fall back to the gradient.
- Status: complete; changes uncommitted.

### Completed: Text Animations poster-first (2026-11-21)

- Scope: the 13 Text Animations slugs.
- Added `apps/web/lib/text-animation-slugs.ts` (`TEXT_ANIMATION_ORDER` + `TEXT_ANIMATION_SLUGS`), still used for the Text Animations gallery order.
- Generated the 11 missing light/dark poster pairs (~130 KB); `gsap-text` and `text-video-mask` already had posters.
- Superseded by the all-video rollout above.

### Completed: Contentful entries for 27 listed components (2026-11-21)

- Goal: create Contentful entries for the components the user listed, **without duplicating** any that already exist (e.g. `gsap-text`).
- Result: 17 of 27 already existed (skipped, untouched). **10 created + published**; no duplicate slugs.
  - Created: `spiral-media-gallery`, `focus-carousel`, `arc-carousel`, `lens-drift-grid`, `cinematic-card-carousel`, `infinite-image-gallery`, `cms-media-bento`, `orbit-spiral-gallery`, `pixel-wipe-carousel`, `3d-flow-gallery`.
  - With light/dark video assets (local MP4s uploaded): `lens-drift-grid`, `cinematic-card-carousel`, `pixel-wipe-carousel`.
  - Without media (no local MP4 exists; `previewLight`/`previewDark` optional): `spiral-media-gallery`, `focus-carousel`, `arc-carousel`, `infinite-image-gallery`, `cms-media-bento`, `orbit-spiral-gallery`, `3d-flow-gallery`.
- Verification: `node scripts/check-contentful.mjs` → **71 published entries, 71 unique slugs, 0 duplicates**.
- Follow-up (optional): add preview media for the 7 media-less entries if/when MP4s are captured.
- One-off creation script used: `/var/folders/.../T/opencode/create-contentful-entries.cjs` (outside repo; not committed).

### Prior investigation (2026-11-21): work paused when credits ran out

- Conclusion: source tree is consistent/clean; no half-written files. The remaining unfinished work is the failing repo validators below, not an in-progress file edit.

## Known unfinished / failing checks

Run these before claiming the repo is green.

### 1. `pnpm validate:docs` — 11 errors

- `apps/web/registry/index.ts` is missing 5 documented slugs (140 entries vs 145 docs pages):
  `ambient-audio-toggle`, `interaction-sound-kit`, `keyboard-command-sounds`, `upload-sound-status`, `voice-recorder`.
  Their docs pages and `apps/web/public/r/<slug>.json` files exist; only the index metadata is missing.
- `apps/web/lib/docs-content/categories.ts` is missing `focus-carousel`.
- `apps/web/lib/docs-content/sections/accessibility.ts` is missing `focus-carousel`.
- `apps/web/lib/docs-content/sections/motion.ts` is missing `focus-carousel`.
- `apps/web/components/docs/focus-carousel.tsx:256,277` still passes legacy `accessibilityNote` / `motionNote` props (validator forbids these; notes must move to the content modules).

### 2. `pnpm validate:registry` — 1 error

- `apps/web/public/r/registry.json` is missing `preloader-pro-v1` from `items[]`, although `apps/web/public/r/preloader-pro-v1.json` exists.
- Likely fix: regenerate with `pnpm registry:blocks` (see `scripts/build-blocks-registry.js`) or add the item manually.

### 3. `tsc --noEmit` false failure (local only)

- `apps/web/.next/types/validator.ts` referenced deleted demo routes `demo/cms-scroll-gallery` and `demo/editorial-image-stack`.
- This is stale Next.js cache, not source. Delete `apps/web/.next` (or run a fresh build) before typechecking.
- A clean re-run was started on 2026-11-21 but aborted by the user; re-run to confirm zero errors.

## Suggested next steps (pick one, then update this file)

1. Run final human visual polish on `GlitchLiquidText` hover after the first-pass retune.
2. Fix `validate:docs` failures (registry entries + focus-carousel category/notes/legacy props).
3. Regenerate registry to fix `validate:registry` (`preloader-pro-v1`).
4. Confirm clean typecheck after removing `apps/web/.next`.
5. Continue the `docs/preview-scalability-checklist.md` A1+ items (all unchecked; large planned effort).

## Useful commands

```bash
pnpm validate:docs
pnpm validate:registry
pnpm registry:blocks
pnpm --filter web typecheck   # or: cd apps/web && npx tsc --noEmit
pnpm lint
pnpm build
```

## Open questions

- Which paused task should be resumed first? (validator cleanup vs preview-scalability checklist vs customize-panel polish)
- Should `bun.lock` be removed in favor of `pnpm-lock.yaml`?
- Should this `CONTEXT.md` be committed to `main`?

## Completed / verified

- (2026-11-21) Glitch Liquid Text Studio Lumio implementation QA passed: clean/no-overflow/no-console-error runs and tuned hover defaults completed.
- (2026-11-21) Confirmed clean working tree, no dangling references to the 6 removed components.
- (2026-11-21) Confirmed customize-panel migration artifacts and no broken imports for deleted `personalize-controller`/`personalize-drawer`.
