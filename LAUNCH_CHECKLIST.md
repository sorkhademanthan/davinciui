# DavinciUI Launch Checklist

Goal: the most premium free component library on the internet. Generated from a full pre-launch audit (Oct 4, 2026), re-verified against the live tree (Oct 9, 2026). Work top to bottom — P0 first.

## P0 — Fix before launch (credibility damage)

- [x] **Hide fake testimonials (re-enable with real quotes later).** `apps/web/content/testimonials.json` is AI-generated sample data. `<Testimonials />` is now hidden in `apps/web/app/page.tsx` (comment left at the call site). To re-enable: collect 3–4 real quotes with `sourceUrl`, replace the JSON, uncomment the import + JSX. (Hidden Oct 9, 2026.)
- [ ] **Fix author GitHub URL typo.** `apps/web/lib/site.ts:10` points at `https://github.com/sorkhademanthan` but the repo/owner everywhere else is `sorkhademanthan/davinciui`. Breaks SEO `authors` (`app/layout.tsx:85-88`) + author link. One-line fix. (Found Oct 9, 2026.)
- [ ] **Scrub stale `componentry.*` refs in repo docs.** Source is clean, but HN browses the repo: `docs/SHADCN_REGISTRY_INDEX_SUBMISSION.md` (`@componentry`, `componentry.fun/r/*`), `docs/README.md:50-51` (`componentry.dev`, `componentry.fun`), `docs/performance_analysis.md` (old file paths), `temporary/HOW_TO_UPLOAD.md:21` (`R2_BUCKET_NAME=componentry`). Update or delete. (Found Oct 9, 2026.)
- [x] **Rewrite legal pages.** Privacy + Terms referenced `componentry.com`, Vercel Analytics, `hello@componentry.fun`, `@harshjdhv`. Now: `davinciui.com`, PostHog, `sorkhademanthan@gmail.com`, `@ManthanSorkhade`. (Done Oct 4, 2026.)
- [x] **Fix README.** References `componentry.dev`, `harshjdhv/componentry`, wrong owner. Point to `davinciui.com`, `sorkhademanthan/davinciui`, verified `shadcn add @davinciui/*`, add a screenshot. (Done Oct 4, 2026 — also fixed LICENSE copyright.)
- [x] **Docs search + sidebar.** Search button wired to the command menu (⌘K works from the sidebar); sidebar now lists all 16 registry categories with per-component links instead of only "All Components" — inactive groups start collapsed, the active one auto-opens. Same fix applied to the components index page, which was hiding 8 categories. Also fixed the latent double-dialog bug (⌘K opened stacked palettes on every route mounting 2+ menus) via a shared singleton store, and added a "Docs Components" ⌘K group so docs pages are searchable. Lint + `tsc` clean. (Done Oct 4, 2026.) Still open: mobile has no sidebar on static docs routes.
- [x] **Fix broken category links on docs landing.** Three cards pointed at non-existent `/docs/premium/*` routes. Retargeted to the matching live gallery tabs (`/experience/components?tab=…`). Verified `/experience/components` index + all slugs resolve; `docs/mcp` "Browse components" link was already fine. (Done Oct 4, 2026.)
- [x] **Unify on `davinciui.com`.** Fixed end to end: SEO keywords, AI-assistant prompt URL, markdown footers, MCP registry URL, registry `homepage` (generator + regenerated `registry.json`), canonical `siteConfig.url`, llms.txt base URL. Renamed `ComponentryLogomark` → `DavinciUILogomark` (site header, footer, previews). Removed the dead Pro CTA + Pro branding on `/blocks` (no Pro product yet) and deleted orphaned `www.componentry.fun_.png`. Verified zero `componentry`/`harshjdhv`/`davinciui.dev` references in source; `tsc` clean. (Done Oct 4, 2026.)
- [x] **Kill or gate stub pages.** `/experience/motion` + `/experience/scroll` one-liners now redirect to the live gallery tabs; pruned 18 dead sub-links from the experience sidebar + ⌘K (motion/blocks/templates subs, phantom scroll subs) while keeping the real Scroll Animations page; undocumented `/docs/components/[slug]` pages redirect to the live gallery instead of shipping "coming soon" stubs; sitemap now indexes only slugs with real docs (+ `/blocks`, `/sponsors`, `/docs/installation`, `/docs/components`); coming-soon pages gained Follow-on-X + Star-on-GitHub notify actions; `/og-preview` + `/preview` are `noindex` (+ robots disallow). Lint + `tsc` clean. (Done Oct 4, 2026.)
- [x] **Wire analytics for real.** Consent-first PostHog: SDK starts opted-out, cookie banner (Accept/Decline, persisted) gates all capture; funnel events `design_system_created` (with starter), `design_system_validated` (with status + counts), `design_system_exported` (with format) added. Privacy policy discloses PostHog + cookieless Umami/Vercel analytics. Lint + `tsc` clean. (Done Oct 4, 2026.) Still needed from you: paste a real PostHog project key + host into production env vars, or nothing is collected.

## P1 — The premium layer (differentiation)

- [x] **Flawless copy-paste (done).** One canonical command `pnpm dlx shadcn@latest add @davinciui/[slug]` in all single-display spots (hero, home-hero, blocks viewer, input-group demo); per-PM tabs (npm/yarn/bun) kept only inside explicit package-manager switchers. All 129 docs `installPackageName`s resolve to real registry slugs; 5 drifted display names realigned to their slugs (Fluid Particle Text, GSAP Text, Glitch Liquid Text, Media Text Hover, Burn Plus) across registry, docs, landing, previews + regenerated `public/r` titles. `validate-registry` OK (149 items), `tsc` + `eslint` clean. (Done Oct 9, 2026.)
- [x] **Docs nav (done).** Foundations + MCP groups exist in `config/docs.ts:70-91`; `llms.txt/route.ts` regenerates from nav + registry; mobile nav exists in `DocsShell` for guide routes + own row on component pages. (Verified Oct 9, 2026.)
- [x] **Hero above the fold (done — scoped).** 320px headline fixed (`clamp` + `text-balance`); dark-mode cold-start flash fixed via blocking pre-paint script in `app/layout.tsx`. Live preview in first viewport + "View live demo" CTA deliberately skipped per owner decision. (Closed Oct 9, 2026.)
- [x] **Design-system export handoff (done).** One-click copy-CSS-variables on the CSS card (shares the exact download text) + "Use it in your project" 3-step guide (paste CSS → `data-ds-theme` → `var(--ds-*)`) + import-back: Export JSON card links to Design systems → Import, landing has an Import button (header + empty state) wired to `importRaw` with result notices. Validation deep-links were already live (`FindingCard` → `finding.route`). (Done Oct 9, 2026.)
- [x] **Decide what Pro is (closed — stale).** No `pro.componentry.dev` in source. Remaining "Pro" strings are component names (`Magic Cursor Pro`, `Preloader Pro`) + pricing blocks, not a product cliff. No action. (Verified Oct 9, 2026.)
- [x] **SEO/tech.** Per skill audit (seo-audit + web-quality seo): removed the sitewide canonical that pointed every page at `/` (deindexation risk); self-referencing canonicals on sponsors/privacy/terms/MCP layouts + experience/component/block dynamic pages; tailored titles + descriptions for sponsors/MCP/legal; 6 branded per-section OG image routes (/, /docs, /docs/mcp, /blocks, gallery, /sponsors) via a shared text-only generator — which also un-breaks the existing component OG images that explicit root metadata was suppressing. Lint + `tsc` clean. (Done Oct 4, 2026.) Still yours: submit sitemap in Search Console post-deploy.

## P2 — Nice-to-have (week two)

- [x] Footer support links (Report bug / Request feature / Email) + version pill `v0.1.0` — done in `components/footer.tsx:64-71,202`. (Verified Oct 9, 2026.)
- [ ] Skip-to-content link (no match in `components`/`app`), reduced-motion gating on hero (`app/page.tsx:119-191` animates without `useReducedMotion`), hamburger tap target (`site-header.tsx:266-272` is `size-8`/32px with extended `before:` hit area — bump to `size-11` or accept hit-slop and close).

## Post-deploy verification (registry goes live with the deploy)

- [x] Working tree clean on `main` (Oct 9, 2026), `public/r` has 150 tracked files, `node scripts/validate-registry.js` passes (149 items, 130 documented slugs). Re-run after any registry change.
- [ ] Deploy `davinciui.com`, then verify: `curl https://davinciui.com/r/pixel-flow.json` and `/r/registry.json` return 200.
- [ ] Real production e2e: scratch project with `"@davinciui": "https://davinciui.com/r/{name}.json"`, install one simple (`skeleton`) + one with deps (`sidebar` pulls `@davinciui/input`) component, confirm files + imports.
- [ ] Run `node scripts/validate-registry.js` in CI/pre-commit so the index can never drift again.
- [ ] Prod env: real `NEXT_PUBLIC_POSTHOG_*` in Vercel env (`.env.local` has a real key, `.env.example` is still placeholder) + submit sitemap in Search Console + set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## Suggested schedule

- **Days 1–2 — Trust sprint:** testimonials, README, broken routes, stub pages, brand sweep.
- **Days 3–4 — Dev-conversion sprint:** search + nav + copy buttons + CLI consistency.
- **Day 5 — Instrument + polish:** PostHog events, hero, OG/sitemap/metadata.
- **Launch:** Show HN + X + shadcn-adjacent communities with one killer interactive demo.
