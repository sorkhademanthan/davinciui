# DavinciUI Launch Checklist

Goal: the most premium free component library on the internet. Generated from a full pre-launch audit (Oct 4, 2026). Work top to bottom — P0 first.

## P0 — Fix before launch (credibility damage)

- [ ] **Remove or replace fake testimonials.** `apps/web/content/testimonials.json` is AI-generated sample data rendered as social proof. Hide the section or ship real quotes.
- [x] **Rewrite legal pages.** Privacy + Terms referenced `componentry.com`, Vercel Analytics, `hello@componentry.fun`, `@harshjdhv`. Now: `davinciui.com`, PostHog, `sorkhademanthan@gmail.com`, `@ManthanSorkhade`. (Done Oct 4, 2026.)
- [x] **Fix README.** References `componentry.dev`, `harshjdhv/componentry`, wrong owner. Point to `davinciui.com`, `sorkhademanthan/davinciui`, verified `shadcn add @davinciui/*`, add a screenshot. (Done Oct 4, 2026 — also fixed LICENSE copyright.)
- [x] **Docs search + sidebar.** Search button wired to the command menu (⌘K works from the sidebar); sidebar now lists all 16 registry categories with per-component links instead of only "All Components" — inactive groups start collapsed, the active one auto-opens. Same fix applied to the components index page, which was hiding 8 categories. Also fixed the latent double-dialog bug (⌘K opened stacked palettes on every route mounting 2+ menus) via a shared singleton store, and added a "Docs Components" ⌘K group so docs pages are searchable. Lint + `tsc` clean. (Done Oct 4, 2026.) Still open: mobile has no sidebar on static docs routes.
- [x] **Fix broken category links on docs landing.** Three cards pointed at non-existent `/docs/premium/*` routes. Retargeted to the matching live gallery tabs (`/experience/components?tab=…`). Verified `/experience/components` index + all slugs resolve; `docs/mcp` "Browse components" link was already fine. (Done Oct 4, 2026.)
- [x] **Unify on `davinciui.com`.** Fixed end to end: SEO keywords, AI-assistant prompt URL, markdown footers, MCP registry URL, registry `homepage` (generator + regenerated `registry.json`), canonical `siteConfig.url`, llms.txt base URL. Renamed `ComponentryLogomark` → `DavinciUILogomark` (site header, footer, previews). Removed the dead Pro CTA + Pro branding on `/blocks` (no Pro product yet) and deleted orphaned `www.componentry.fun_.png`. Verified zero `componentry`/`harshjdhv`/`davinciui.dev` references in source; `tsc` clean. (Done Oct 4, 2026.)
- [x] **Kill or gate stub pages.** `/experience/motion` + `/experience/scroll` one-liners now redirect to the live gallery tabs; pruned 18 dead sub-links from the experience sidebar + ⌘K (motion/blocks/templates subs, phantom scroll subs) while keeping the real Scroll Animations page; undocumented `/docs/components/[slug]` pages redirect to the live gallery instead of shipping "coming soon" stubs; sitemap now indexes only slugs with real docs (+ `/blocks`, `/sponsors`, `/docs/installation`, `/docs/components`); coming-soon pages gained Follow-on-X + Star-on-GitHub notify actions; `/og-preview` + `/preview` are `noindex` (+ robots disallow). Lint + `tsc` clean. (Done Oct 4, 2026.)
- [x] **Wire analytics for real.** Consent-first PostHog: SDK starts opted-out, cookie banner (Accept/Decline, persisted) gates all capture; funnel events `design_system_created` (with starter), `design_system_validated` (with status + counts), `design_system_exported` (with format) added. Privacy policy discloses PostHog + cookieless Umami/Vercel analytics. Lint + `tsc` clean. (Done Oct 4, 2026.) Still needed from you: paste a real PostHog project key + host into production env vars, or nothing is collected.

## P1 — The premium layer (differentiation)

- [ ] **Flawless copy-paste:** one canonical import path in all snippets, `shadcn@latest add @davinciui/[slug]` everywhere, copy button on every code block (installation + import blocks lack them).
- [ ] **Docs nav:** add Foundations + MCP groups, mobile sidebar on all docs routes, regenerate `llms.txt` from nav + registry source.
- [ ] **Hero above the fold:** live interactive preview in first viewport, secondary CTA → "View live demo", fix `whitespace-nowrap` headline at 320px, fix dark-mode cold-start flash.
- [ ] **Design-system export handoff:** copy-CSS-variables, usage instructions, import-back for exported JSON, route validation findings to in-system editors.
- [ ] **Decide what Pro is:** `pro.componentry.dev` CTA is a cliff. Real page with pricing/auth, or drop Pro branding until live.
- [x] **SEO/tech.** Per skill audit (seo-audit + web-quality seo): removed the sitewide canonical that pointed every page at `/` (deindexation risk); self-referencing canonicals on sponsors/privacy/terms/MCP layouts + experience/component/block dynamic pages; tailored titles + descriptions for sponsors/MCP/legal; 6 branded per-section OG image routes (/, /docs, /docs/mcp, /blocks, gallery, /sponsors) via a shared text-only generator — which also un-breaks the existing component OG images that explicit root metadata was suppressing. Lint + `tsc` clean. (Done Oct 4, 2026.) Still yours: submit sitemap in Search Console post-deploy.

## P2 — Nice-to-have (week two)

- [ ] Skip-to-content link, reduced-motion gating on hero, tap-target sizes (32px hamburger → 44px), footer support links (Report bug / Ask question), version + changelog pill on landing.

## Post-deploy verification (registry goes live with the deploy)

- [ ] Commit + push registry work (generator/validator fixes, 10 index additions, phantom removals, import normalization).
- [ ] Deploy `davinciui.com`, then verify: `curl https://davinciui.com/r/pixel-flow.json` and `/r/registry.json` return 200.
- [ ] Real production e2e: scratch project with `"@davinciui": "https://davinciui.com/r/{name}.json"`, install one simple (`skeleton`) + one with deps (`sidebar`) component, confirm files + imports.
- [ ] Run `node scripts/validate-registry.js` in CI/pre-commit so the index can never drift again.

## Suggested schedule

- **Days 1–2 — Trust sprint:** testimonials, README, broken routes, stub pages, brand sweep.
- **Days 3–4 — Dev-conversion sprint:** search + nav + copy buttons + CLI consistency.
- **Day 5 — Instrument + polish:** PostHog events, hero, OG/sitemap/metadata.
- **Launch:** Show HN + X + shadcn-adjacent communities with one killer interactive demo.
