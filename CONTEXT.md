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

3. (2026-11-21) DialKit reference wired into the app (dialkit 2.2.1) — implemented; verified.
   - Goal: implement the DialKit reference ("Mount one DialRoot and use useDialKit…") where the app's dialogs for input are — all dialog-input surfaces now read/write DialKit-controlled values, and the reference quick-start is a real component.
   - Changes:
     - `apps/web/app/layout.tsx`: mounted one `<DialRoot productionEnabled />` (user asked to keep the editor visible in production) + `import "dialkit/styles.css"`.
     - `apps/web/components/dialkit-reference.tsx` (new): reference quick-start `DialkitCard` — `useDialKit("Card", { radius: [24, 0, 64], color: "#a78bfa" })`, styles `borderRadius`/`background` from values; rendered on `/design-system/new` (the app's dialog-for-input flow).
     - `apps/web/components/docs/previews/dialog-preview.tsx`: `DialogStickyFooterPreview` ("Edit profile" — the dialog for input, with its 8 Input fields) now binds its fields through `useDialKitController("Edit profile", stickyFooterFieldConfig)` — app Inputs read `values[key]` and write via `setValue(key, …)`, so typing flows into the dialkit panel and panel edits flow back.
     - `apps/web/package.json`: added `dialkit: ^2.2.1`; `pnpm install` linked it into `apps/web/node_modules` and updated `pnpm-lock.yaml` (root `package.json` also carries dialkit/motion from earlier, pre-existing working-tree changes).
   - Verification:
     - `apps/web` `npx tsc --noEmit`: no errors in changed files; only 2 pre-existing errors remain in `packages/ui/src/components/scroll-media-expand.tsx:348,578` (from the uncommitted poster-first rollout diff, not touched by this work).
     - `eslint` clean on all changed files; Prettier clean on `dialkit-reference.tsx` (3.7 reformats of other touched files' pre-existing lines were reverted — kept diffs minimal).
     - `pnpm build` fails only on those pre-existing `scroll-media-expand.tsx` type errors (unrelated); webpack/turbopop compile succeeded.

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

- **Visual sitemap page + Shoogle/shadcn registry verification (2026-11-22) — COMPLETE; uncommitted.**
  - Goal: a tree sitemap of the site (categories → components) and to get the library into shoogle.dev.
  - Built `apps/web/app/sitemap/page.tsx` (`/sitemap`): server-rendered tree with hero stats, sticky category index, site-pages tree, and per-category `<details>` trees linking all 145 documented component pages (`/docs/components/<slug>`). Added `Sitemap` link in `components/footer.tsx` and `/sitemap` to `app/sitemap.ts`. Added `"focus-carousel": "Visual Effects"` to `lib/docs-content/categories.ts` (fixes its grouping + one `validate:docs` category error).
  - Shoogle finding: shoogle.dev has **no submission API/token**. It indexes the official shadcn registry directory (`https://ui.shadcn.com/r/registries.json`). Listing = PR to `shadcn-ui/ui` `apps/v4/registry/directory.json`.
  - Verified: `https://davinciui.com/r/registry.json` → 200, 164 unique items, no `content` in index files; **all 164 item URLs** → 200, valid JSON, valid `registry-item` types, `files[].content` present. Local vs live registry identical. Directory entry `@davinciui` matches the shadcn zod schema (name/homepage/url/description/author/logo, no extras) and has no duplicate namespace.
  - Submission already exists: sibling clone `../ui` branch `feat/registry-add-davinciui` (commit `714f616c7`, pushed to `fork`) has **open PR shadcn-ui/ui#12799** — `MERGEABLE`, `BLOCKED` pending review; only failing check is Vercel "Authorization required to deploy" (fork permission, not code). Not merged yet, so `registries.json` (593 entries) does not include `@davinciui`; Shoogle will index after merge.
  - Verification: `apps/web npx tsc --noEmit` only the pre-existing `orbit-spiral-gallery.tsx` three.js errors; ESLint clean on changed files; Playwright on `:3000` `/sitemap` → 200, 16 categories, 145 component links, `/sitemap.xml` still 200 (148 locs), 0 console errors, no horizontal overflow at 390/768/1440.
  - Handoff records: rewrote `docs/SHADCN_REGISTRY_INDEX_SUBMISSION.md` (current status, Shoogle mechanics, entry, next-step checklist, troubleshooting) and added `scripts/verify-registry-urls.mjs` + `pnpm verify:registry` (checks index + all 164 item URLs; currently PASS 164/164).

- **DialKit integration (2026-11-22) — COMPLETE / runtime-verified; uncommitted.**
  - Goal: mount one `DialRoot` and bind the app's dialog-for-input surfaces to DialKit.
  - Implemented: `apps/web/app/layout.tsx` mounts `<DialRoot productionEnabled />` and imports `dialkit/styles.css`; `apps/web/components/dialkit-reference.tsx` `DialkitCard` uses `useDialKit("Card", …)` and renders on `/design-system/new`; `apps/web/components/docs/previews/dialog-preview.tsx` `DialogStickyFooterPreview` binds 8 text fields via `useDialKitController("Edit profile", …)`; `dialkit@^2.2.1` in `apps/web/package.json` (lock updated).
  - Verification (2026-11-22): Playwright on `:3000` — panel mounts, reference card renders, dialog opens from the `Sticky Footer` variant, 8 fields default `Value 1..8`; two-way sync confirmed (dialog → panel `QA-SYNC-123`, panel → dialog `FROM-PANEL-456`); zero console errors. `apps/web npx tsc --noEmit` clean after fixing the 2 pre-existing `scroll-media-expand.tsx` errors; DialKit files ESLint clean.
  - Committed as `9ce2acb` (2026-11-22). Full `next build` still blocked by unrelated pre-existing type errors (see below).

- **Fluid Particle Text → pixel-accurate reference implementation/QA (2026-11-21) — changes applied; QA/build/typecheck passed; repo validators still failing.**
  - Goal: align `FluidParticleText` demo/preview with the supplied reference: text `INK`, Archivo Narrow 700, white background, black text, solid at rest, liquid around cursor; add bright displaced-particle highlights and correct WebGL intensity rendering.
  - Changes:
    - `packages/ui/src/components/fluid-particle-text.tsx`: added `intensity`, `renderScratch`, `locHighlight`, `locIntensity`; shaders now use `varying` for intensity; upload interleaves positions/intensity; intensity set from displacement; rest snap resets intensity.
    - `apps/web/app/demo/fluid-particle-text/page.tsx`: switched to `preset="showcase"`, `text="INK"`.
    - `apps/web/components/docs/fluid-particle-text.tsx`: default code/prop defaults updated to Archivo Narrow/700 and solid `INK`.
    - `apps/web/components/docs/previews/fluid-particle-text-preview.tsx`, `...-card-preview.tsx`, `...-playground.tsx`: switched primary demos to static white/black solid `INK` / reference physics.
  - Verification:
    - `npx tsc --noEmit` clean; changed-file ESLint clean; Prettier clean; `pnpm build` successful; `node tmp/verify/fluid-particle-text.mjs` browser QA passed (WebGL `webgl`, 87,608 particles, Archivo Narrow loaded, white bg, no overflow/console errors).
    - `pnpm validate:docs` still fails with known 11 errors; `pnpm validate:registry` still fails with known 1 error.

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

### 3. `next build` type errors (pre-existing, unrelated to DialKit)

- `apps/web npx tsc --noEmit` is now **clean** (2026-11-22) after fixing the 2 `scroll-media-expand.tsx` errors (`overlay.style.tabIndex` → `overlay.tabIndex`; `cfg.playFontSize` → `playFontSize`).
- `next build` (Turbopack, Next 16.0.10) now fails later on unrelated pre-existing errors:
  - Fixed: `apps/web/app/blocks/[category]/[name]/page.tsx` inferred-type portability — added explicit `Promise<ReactElement>` return type.
  - **Open:** `packages/ui/src/components/orbit-spiral-gallery.tsx:297` — three.js `Mesh` type mismatch (`meshes.current[index] = node`), likely duplicate `three` type versions.
- Re-run `cd apps/web && npx next build` to see the next blocker.

## Suggested next steps (pick one, then update this file)

1. Run final human visual polish on `GlitchLiquidText` hover after the first-pass retune.
2. Fix `validate:docs` failures (registry entries + focus-carousel category/notes/legacy props).
3. Regenerate registry to fix `validate:registry` (`preloader-pro-v1`).
4. ~~Commit the verified DialKit changes~~ — done (`9ce2acb`).
5. Continue fixing the unrelated `next build` type errors (orbit-spiral-gallery three.js types) if a green build is required.
6. Continue the `docs/preview-scalability-checklist.md` A1+ items (all unchecked; large planned effort).

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
- (2026-11-21) Added the `@davinciui` registry entry to the sibling shadcn clone (`../ui/apps/v4/registry/directory.json`), appended at the bottom like the `@componentry` reference PR (#9757). Entry: homepage `https://davinciui.com`, url `https://davinciui.com/r/{name}.json`, author `Manthan Sorkhade`, and a traced inline SVG of the real leaf logo (`var(--foreground)`). `/r/registries.json` is a dynamic route in this shadcn version, so no generated artifact needed. Validated JSON against the directory schema manually (594 entries, no duplicates; the only pre-existing oddity is `@awwwardedui` with logo `" "`). Change is uncommitted in `../ui`.
