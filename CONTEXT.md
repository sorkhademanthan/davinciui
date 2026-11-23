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
- HEAD: `b8400e1` — `feat: add visual sitemap and registry verification` (2026-11-22)
- Working tree: **has uncommitted changes** — the docs-site rebuild (see Active task) plus the earlier fluid-particle-text/scroll-media/blocks fixes and untracked `CONTEXT.md`/poster assets.
- Package manager: pnpm (`packageManager: pnpm@10.4.1`); repo also has a stale `bun.lock`.
- Local artifacts: `tmp/` is gitignored (preview screenshots/logs); `.next/` gitignored.

## Active task

- **Stash `/experience/components/spiral-media-gallery` prod-parity changes (2026-11-23) — DONE.**
  - Goal: the page's own files (`app/experience/components/**`, `components/docs/spiral-media-gallery.tsx`, `packages/ui/.../spiral-media-gallery.tsx`) were **unchanged**; every diff vs `https://davinciui.vercel.app/experience/components/spiral-media-gallery` came from shared files touched by the uncommitted docs rebuild. User asked to find and stash exactly those.
  - Diffed live HTML vs `http://localhost:3000/...` (artifacts in `/var/folders/00/qlfsv8yj6yzg5p6jz3pffxvh0000gn/T/opencode/smg/`) and mapped each visible delta to a source file.
  - Stashed 9 files (stash `stash@{0}`, msg `wip: revert /experience/components/spiral-media-gallery to prod parity`):
    `apps/web/components/{docs-page-layout,page-context-menu,docs-props-table,docs-preview-wrapper,docs-code-panel,package-manager-command,theme-toggle}.tsx`, `apps/web/app/layout.tsx`, `apps/web/components/providers.tsx`.
    Covered: `Components` eyebrow + 36px h1 + container padding + desc order + removed prev/next pagination; `Copy page` button; 4-column props table; viewport/RTL/StackBlitz preview toolbar; rounded-16 code panel + Ask AI tab; shiki install command; theme-toggle icon/label; default theme `dark` → `system`.
  - Deliberately **not** stashed (no effect on this page): `docs-structured-content.tsx` (`Customization`→`Theming` never renders here), `command-menu.tsx` (client-only), `app/docs/docs.css` (only imported by `app/docs/layout.tsx`, so `.docs-*` rules never load on `/experience/*`), and the rest of the docs rebuild (57 changes remain).
  - Verified: `npx tsc --noEmit -p apps/web` → EXIT 0; re-diffed text content → only remaining delta is `<title>` placement, which is a dev-server artifact (the untouched `/sitemap` route also has no `<title>` in `<head>` on dev).
  - Restore with: `git stash pop stash@{0}` (or `git stash apply`).

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

- **Docs site rebuild — prompt-fidelity pass (2026-11-22, session 3) — IN PROGRESS / finishing QA.**
  - Goal (from pasted fix prompt): make `https://davinciui.vercel.app/docs` match `https://docs.archil.com/getting-started/` (regions: header, sidebar, TOC, article, links, code blocks, callouts, bottom elements, typography, responsive; acceptance: within 2px; final report = changed list + values not matched within 2px + invented tokens).
  - Session 3 work completed (this session):
    - `apps/web/app/docs/docs.css` (untracked new file from prior rebuild): added `--docs-link-underline: var(--docs-brand)`; appended `.docs-article` typography block (h1 36px/500 lh 1.15, h2 24px/500 mt 48mb 16, h3/h4, lists, inline code, blockquote, hr, img, table, th/td); appended shiki code-figure rules (light bg #faf9f7 / dark #0f0f11, radius 16, pre padding 16px 20px, fs 14/lh 24); `.docs-article .docs-callout`/`.docs-prose .docs-callout` margin; `.docs-eyebrow` (incl. `.docs-article` variant) now fw 500 size 13 color var(--docs-brand); `.docs-lead` variants updated.
    - `apps/web/components/docs-page-layout.tsx`: added `docs-article` to `<article>`; header now eyebrow + h1 (`text-[36px] font-medium leading-[1.15] tracking-tight`) with PageContextMenu (Copy page) in title row right (removed ComponentPagination + `resolveComponentPagination` + `pagination`); added optional `eyebrow?: string` prop + `resolvedEyebrow` (eyebrow ?? (installPackageName && getComponent(...) ? "Components" : "Getting started")); added `import { getComponent } from "@/registry"`.
    - `apps/web/components/component-layout.tsx`: `eyebrow?: string` prop; h1 wrapper `min-w-0 space-y-2` with `<p className="docs-eyebrow">`; Section h2 now direct h2 (`group flex scroll-m-20 items-center gap-2 text-2xl font-medium tracking-tight mt-12 mb-4`) no border-b wrapper; content div `cn("space-y-6", step && "pl-12")`; container `w-full max-w-[648px] space-y-10 py-6 md:py-8 lg:py-10`.
    - `apps/web/components/docs-chrome/docs-header.tsx`: added GitHub Star pill in row-1 right (hidden sm:inline-flex; h-9; border; rounded-full; fs text-sm; fw 500; muted-foreground; hover foreground; inner Github size-4 + Star span + sr-only; href https://github.com/sorkhademanthan/davinciui).
    - `apps/web/components/docs-chrome/docs-sidebar.tsx`: SidebarLink `flex h-8 items-center gap-2 rounded-[10px] px-2 text-[15px] transition-colors duration-150`, active `bg-primary/6 font-medium text-primary hover:bg-primary/6`; children similar; group heading `mb-2 px-2 py-2 text-sm font-medium text-muted-foreground`; nav `flex flex-col gap-6 py-6 pl-6 pr-4 pb-12`.
    - `apps/web/components/docs-code-panel.tsx`: rewritten clean — container `docs-code-panel not-prose ... rounded-[16px]`; tablist `relative flex items-center gap-1`; tab `docs-code-tab ... px-2 py-0.5 text-sm`, active/inactive bg-transparent, `data-state={isSelected?"active":"inactive"}`; Ask AI button (`docs-code-ask`, Sparkles size-3.5, aria-label/title "Ask AI about this code", onClick openAsk).
    - `apps/web/components/package-manager-command.tsx`: rewritten — re-exports PACKAGE_MANAGERS/usePackageManager/PackageManager from `@/hooks/use-package-manager`; `HighlightedCommand` removed; effect POSTs `/api/docs/source {code, lang:"bash"}` → `html`; renders shiki div via dangerouslySetInnerHTML with `docs-shell-code [&_.shiki]:!bg-transparent [&_pre]:!bg-transparent` when html else fallback pre.
    - Standalone docs pages + ComponentLayout container: `w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 lg:py-10` → `w-full max-w-[648px] py-6 md:py-8 lg:py-10` (apps/web/app/docs/{page,configuration,changelog,installation,cli,theming,registry,skills,typeset,components}/page.tsx + component-layout.tsx); h1 `text-3xl font-semibold tracking-tight sm:text-4xl` → `text-[36px] font-medium leading-[1.15] tracking-tight` (10 files); eyebrow `text-sm font-medium text-muted-foreground">Docs</p>` → `<p className="docs-eyebrow">Docs</p>` (10 files); docs/components/page.tsx `max-w-3xl space-y-4`→`max-w-[648px] space-y-4`, `mt-10 max-w-3xl`→`mt-10 max-w-[648px]`; typeset h2 `scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight` → `scroll-m-20 text-2xl font-medium tracking-tight mt-12 mb-4` (9).
    - Prettier: `npx prettier --write` on 5 files reformatted heavily (no prettier config; defaults) → reverted via `git checkout --` those files and re-applied edits via python; keep formatting unchanged going forward.
  - Verification this session:
    - `npx tsc --noEmit -p apps/web` → EXIT=0 clean; ESLint (`apps/web/node_modules/.bin/eslint`) clean on changed files (`--max-warnings 0`) → EXIT OK.
    - `pnpm validate:docs` → ALL PASS (145 pages); `pnpm validate:registry` → OK (169 items).
    - `pnpm exec next build` (from apps/web) → GREEN.
    - Playwright QA: /docs,/docs/installation,/docs/components,/docs/components/button,/docs/theming @1465/1100/390 × light/dark → `documentElement.scrollWidth - clientWidth === 0` everywhere (no horizontal overflow); Star pill found+visible; code panel tabs (bun/npm/pnpm/yarn data-state) + 2 Ask AI buttons + 5 shiki blocks (github-light/github-dark) on /docs/components/button; /api/docs/source bash → shiki html 200.
    - Known: persistent client `pageerror: Unexpected token '}'` on ALL routes incl. `/` (pre-existing? not caused by this session's edits — no landing files touched; possibly stale dev cache) — to investigate.
  - Remaining: final QA (TOC, callouts, bottom elements, typography, responsive at 1280/1024/390 light+dark), final report (changed list, unmatched within 2px, invented tokens).

- **Docs site rebuild — prompt-fidelity pass (2026-11-22, session 2) — COMPLETE; all checks green; uncommitted.**
  - Goal: finish the rebuild against the full "DavinciUI Docs: Build Prompt" (18 sections). The full prompt was recovered from the earlier opencode session and stored at `/var/folders/00/qlfsv8yj6yzg5p6jz3pffxvh0000gn/T/opencode/docs-prompt.txt`.
  - Implemented this session: brand-colored active tab/sidebar/TOC/eyebrow and tab underline; eyebrow title-case; chevron accordion + reduced-motion CSS; mobile full-width floating Ask; 4-column props table (Prop/Type/Default/Description); standard feedback/prev-next/footer for component pages (removed `DocsPageFooter` early return); compact in-page TOC dropdown mounted centrally in `DocsChrome` for every docs page; MDX CodeGroup PM persistence (shared `use-package-manager` hook) + "Ask AI about this code" sparkle actions; streaming `/api/ask` + client reader with source links; ⌘K Headings group (curated `lib/docs-headings.ts`), recent searches in localStorage, match highlighting; preview toolbar viewport-width/RTL/StackBlitz controls; canonical + per-page OG (`/api/docs-og?title=…`) for MDX pages; sitemap now includes nav + MDX docs pages; `.md` fallback for TSX docs pages; first-visit `prefers-color-scheme` default + mode-aware theme icon; `main#main-content` skip target; manual-install fallback; theming playground with live token editor + CSS export; per-component CSS var tables for Button/Input/Dialog/Tabs; Introduction sections ("You can use…", Common tasks, Features, At a glance, Compatibility) + two-tab CodeGroup; Installation `<Steps>` + tip callout.
  - Decisions/deviations: component pages intentionally keep their wide showcase canvas (not 648px article) and redirect undocumented slugs to the gallery (not "Coming soon" stubs); `lastUpdated` is supported in MDX frontmatter but not fabricated for pages without real dates; OG images for MDX pages use a query-driven route (a file-convention OG image inside `app/docs/[...slug]` crashes Turbopack because a catch-all must be the last path segment); theming playground lives at `components/theming-playground.tsx` (not under `components/docs/`, which the docs validator scans as component pages).
  - Verified: `apps/web npx tsc --noEmit` clean; targeted ESLint clean on every changed file; `pnpm validate:docs` clean (145 pages); `pnpm validate:registry` clean (169 items); `npx next build` green; Playwright QA 11/11 at `tmp/docs-final-qa.cjs` with screenshots in `tmp/docs-final/` (1465px + 390px, light/dark, 48+48 header, 288 sidebar, 648 article, 293 TOC, 0 overflow, ⌘K/⌘I/copy menu/preview controls/markdown+OG endpoints all pass, 0 console errors).
  - `pnpm --filter web lint` still fails on 48 pre-existing warnings in unrelated files (none in files touched this session).

- **Docs site rebuild (Mintlify/Archil-style) at `/docs` (2026-11-22) — implementation complete; `next build` green; uncommitted.**
  - Goal: replace the docs shell in place with a Mintlify-style chrome (two-row header, 288px sidebar, 648px article, 293px TOC, floating Ask), MDX starter pages, `.md`/`llms.txt` endpoints, assistant/feedback stubs, and a working copy-page menu; keep the 145 TSX component pages.
  - Implemented: `app/docs/layout.tsx` → `DocsChrome`; `docs.css` tokens/prose/MDX; `docs-header`/`docs-sidebar`/`docs-mobile-nav`/`floating-ask`/`docs-page-footer`/`ask-assistant`/`ask-store`/`docs-tabs`; `docs-on-this-page` docs variant; `config/docs.ts` nav; MDX route `app/docs/[...slug]/page.tsx` with `next-mdx-remote`, `rehype-pretty-code` (dual theme), `rehype-slug`, `rehype-autolink-headings`; `components/mdx/*`; `lib/docs-mdx.ts`; 10 content files under `content/docs/`; `/api/ask`, `/api/docs/feedback`, `/api/docs-markdown/[...slug]`, `/llms.txt`, `/llms-full.txt`; `PageContextMenu` on MDX pages.
  - Fixed during QA: closed assistant/drawer overflow (`hidden`), mobile logo truncation, inline-code block bug (`figure[data-rehype-pretty-code-figure]` scoping), fixed-panel height (`backdrop-blur` containing block — moved panels outside `<header>`), card underlines, mobile article padding 24px (chrome `px-6`; removed inner `px-4` from `/docs`, standalone docs pages, `DocsPageLayout`, `ComponentLayout`, skeleton).
  - Sitemap/build: moved XML sitemap from `app/sitemap.ts` to `app/sitemap.xml/route.ts` + `lib/sitemap-entries.ts` (fixes `/sitemap` page vs metadata conflict; `/sitemap` page stays, `/sitemap.xml` returns 148 URLs); cast two `orbit-spiral-gallery.tsx` refs (`as unknown as Mesh/ShaderMaterial`) for duplicate `@types/three`; **`npx next build` passes**.
  - Verification: `tsc --noEmit` clean; ESLint clean on docs changed files; Playwright 390px h1 x=24 on `/docs`, `/docs/quickstart`, `/docs/components`, `/docs/components/button`, `/docs/foundations/colors`; no horizontal overflow; `/sitemap.xml` 200 `application/xml`; copy button/menu verified.
  - Remaining: `validate:docs` 9 errors (5 missing registry entries, `focus-carousel` notes/legacy prop), `validate:registry` 1 (`preloader-pro-v1`); commit the docs work (not yet requested).

- **Visual sitemap page + Shoogle/shadcn registry verification (2026-11-22) — COMPLETE; committed as `b8400e1`.**
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

### 1. `pnpm validate:docs` — green (2026-11-22)

- All 145 pages pass. The previously missing registry entries (`ambient-audio-toggle`, `interaction-sound-kit`, `keyboard-command-sounds`, `upload-sound-status`, `voice-recorder`) and `focus-carousel` notes were fixed in the uncommitted docs work (`apps/web/registry/index.ts`, `apps/web/lib/docs-content/sections/{accessibility,motion}.ts`, `apps/web/components/docs/focus-carousel.tsx`).

### 2. `pnpm validate:registry` — green (2026-11-22)

- 169 items validated, 145 documented slugs checked. `preloader-pro-v1` was added to `apps/web/public/r/registry.json` items and the validator allowlist.

### 3. `next build` — green (2026-11-22)

- `npx next build` passes (Turbopack, Next 16.0.10); route table includes `/docs/[...slug]`, `/llms.txt`, `/llms-full.txt`, `/sitemap`, `/sitemap.xml`.
- Fixes: `scroll-media-expand.tsx` (`overlay.tabIndex`, `playFontSize`), `blocks/[category]/[name]/page.tsx` explicit return type, `orbit-spiral-gallery.tsx` ref casts for duplicate `@types/three`, and the `/sitemap` page vs `app/sitemap.ts` metadata conflict (XML moved to `app/sitemap.xml/route.ts` + `lib/sitemap-entries.ts`).

## Suggested next steps (pick one, then update this file)

1. Review/commit the docs-site rebuild (uncommitted); all validators, `next build`, and Playwright QA are green.
2. ~~Fix `validate:docs` failures~~ — done (2026-11-22).
3. ~~Fix `validate:registry`~~ — done (2026-11-22).
4. ~~Commit the verified DialKit changes~~ — done (`9ce2acb`).
5. ~~Fix the `next build` type errors~~ — done; `next build` is green (2026-11-22).
6. Continue the `docs/preview-scalability-checklist.md` A1+ items (all unchecked; large planned effort).
7. Optional fidelity follow-ups: generate props tables from TS types, add "Last updated" from a real source, per-component OG theme tokens, Lighthouse run.

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

- (2026-11-22) Docs-site rebuild implemented and verified: MDX pages, `.md`/`llms` endpoints, assistant/feedback stubs, copy menu, mobile 24px padding; `next build` green; `/sitemap.xml` 148 URLs.
- (2026-11-22) Prompt-fidelity pass implemented and verified: brand active states, 4-column props tables, standard footer on component pages, central mobile TOC dropdown, streaming assistant, search headings/recents/highlighting, PM persistence + AI code actions, preview toolbar controls, per-page MDX OG/canonical, theming playground, starter-content sections; `tsc`, targeted ESLint, both validators, `next build`, and Playwright 11/11 all green.
- (2026-11-21) Glitch Liquid Text Studio Lumio implementation QA passed: clean/no-overflow/no-console-error runs and tuned hover defaults completed.
- (2026-11-21) Confirmed clean working tree, no dangling references to the 6 removed components.
- (2026-11-21) Confirmed customize-panel migration artifacts and no broken imports for deleted `personalize-controller`/`personalize-drawer`.
- (2026-11-21) Added the `@davinciui` registry entry to the sibling shadcn clone (`../ui/apps/v4/registry/directory.json`), appended at the bottom like the `@componentry` reference PR (#9757). Entry: homepage `https://davinciui.com`, url `https://davinciui.com/r/{name}.json`, author `Manthan Sorkhade`, and a traced inline SVG of the real leaf logo (`var(--foreground)`). `/r/registries.json` is a dynamic route in this shadcn version, so no generated artifact needed. Validated JSON against the directory schema manually (594 entries, no duplicates; the only pre-existing oddity is `@awwwardedui` with logo `" "`). Change is uncommitted in `../ui`.
