---
name: davinciui
description: Animated React components for DavinciUI — landing heroes, text animations, hero backgrounds, cursor effects, preloaders, visual effects, and motion UI. Use when the user wants to add, theme, or customize DavinciUI components, or asks for animated/motion UI. Finds, installs, and composes components with the shadcn CLI.
---

# DavinciUI

Animated React components you add as source code to the user's project via the shadcn CLI. There is no runtime package — the CLI copies component files into the project and the user owns the code.

> **IMPORTANT:** Run all CLI commands with the project's package runner: `pnpm dlx shadcn@latest`, `npx shadcn@latest`, `yarn dlx shadcn@latest`, or `bunx --bun shadcn@latest` — based on the project's `packageManager`. Examples below use `pnpm dlx shadcn@latest`; substitute the correct runner.

## When to use this skill

Activate when the user asks for any of these, or something that maps to them:

- Animated/motion UI: landing heroes, text reveals, animated backgrounds, cursor effects, preloaders, scroll galleries, hover interactions
- Installing, updating, theming, or troubleshooting a DavinciUI component
- "Add X from DavinciUI" / "use DavinciUI for Y"

Do NOT use for plain shadcn/ui primitives (button, dialog, form) unless composing them with a DavinciUI animated piece.

## Current Project Context

```json
!`pnpm dlx shadcn@latest info --json`
```

The JSON above is the source of truth: framework, Tailwind version, aliases, icon library, installed components, resolved file paths. Read it before generating code — never assume `@/components/ui` if aliases say otherwise. If it fails, the project is not shadcn-initialized: run `pnpm dlx shadcn@latest init` first (New York style, Neutral base, CSS variables).

## Before installing: prerequisites

Verify these; fix before adding components, not after:

1. **React 19 + Tailwind CSS v4 project.** DavinciUI components are built on Tailwind v4 tokens. On v3, stop and tell the user to upgrade — do not install.
2. **`components.json` declares the namespace.** Without it the CLI cannot resolve `@davinciui/*`:
   ```json
   { "registries": { "@davinciui": "https://davinciui.com/r/{name}.json" } }
   ```
3. **Dependencies install via the CLI.** `framer-motion` / `lucide-react` come with the component — never pre-install them manually.

## Component map

83 components. Match the user's request to a category, then confirm the exact slug via `search`/`view` (slugs evolve — never invent one):

- **Text Animations:** fluid-particle-text, text-morph, encrypted-text, gsap-text, glitch-liquid-text, media-text-hover, shader-text, text-video-mask, random-text-reveal, text-reveal, shake-text, rolling-text
- **Hero Backgrounds:** silk-aurora, ink-flow, soft-fluid-gradient, neon-mesh-bg, spectra-noise, sunlight-effect, liquid-chrome, character-field, pixel-flow
- **Premium Components:** hover-transition, lens-drift-grid, cms-scroll-gallery, interactive-media-accordion, scroll-reveal-image, stacked-scroll-gallery, scroll-sync-gallery, scroll-media-expand, scroll-timeline, orbit-spiral-gallery, arc-carousel, ambient-strip, tilt-flip-polaroid
- **Visual Effects:** pixel-wipe-carousel, segmented-image-carousel, burn-plus, cinematic-card-carousel, vertical-image-marquee, hover-cards, profile-carousel, services-showcase
- **Cursor Effects:** circle-cursor, chromatic-cursor, magic-cursor-pro, electric-vijdi-cursor, elastic-blob-cursor, fluid-cursor, tubes-cursor, geometric-trail-cursor
- **Preloaders:** fill-preloader, staircase-preloader, pixel-preloader, editorial-wipe-preloader, geometric-preloader, preloader-pro
- **Interactions:** glass-scene-dock, liquid-reveal-button, nudge-button, animated-pill-button, team-slide-reveal
- **Motion:** wave-bars-loader, motion-hamburger, liquid-chrome-button, radial-fan-deck, animated-metric, kinetic-split-text
- **Sound:** ambient-audio-toggle, interaction-sound-kit, voice-recorder, keyboard-command-sounds, upload-sound-status
- **Primitives (shadcn-compatible):** Actions (button-group, toggle-group), Forms (date-picker, input-group, input-otp, native-select), Navigation (navigation-menu), Overlays (alert-dialog, dropdown-menu, context-menu, hover-card), Layout (aspect-ratio, scroll-area), Data Display (message-scroller)
- **Styles:** typeset — prose styling for rendered markdown. Install with `add @davinciui/typeset`, `@import` the CSS after Tailwind, wrap content in `typeset` + a preset (`typeset-docs`, `typeset-chat`, `typeset-compact`). Docs: `https://davinciui.com/docs/typeset`.

Machine-readable discovery: full index at `https://davinciui.com/r/registry.json`, plain-text catalog at `https://davinciui.com/llms.txt`, live docs at `https://davinciui.com/docs/components`.

## Installing components

```bash
# Preview without installing (read-only — always do this first for unfamiliar components)
pnpm dlx shadcn@latest view @davinciui/text-morph

# Find candidates
pnpm dlx shadcn@latest search @davinciui --query "text"

# Install
pnpm dlx shadcn@latest add @davinciui/text-morph

# Full docs + examples for a component
pnpm dlx shadcn@latest docs @davinciui/text-morph
```

The CLI downloads `https://davinciui.com/r/<slug>.json`, copies files into the aliased directories, and installs declared npm dependencies.

## After installing: verify

1. Import from where the CLI placed the file, e.g. `import { TextMorph } from "@/components/ui/text-morph"`.
2. Animated components are client components — keep the `"use client"` directive the CLI installed.
3. Restart the dev server after new dependencies land (`framer-motion`, canvas/WebGL libs).
4. Confirm it renders before styling around it. Text renders but doesn't animate → dependency missed or server not restarted.

## Customize vs reinstall

- **Customize by editing the installed files.** They are plain project files — adjust classes, motion params, tokens directly.
- **Never re-run `add --overwrite` on a customized component without warning the user** — it replaces local files and destroys edits. Tell them to commit first.
- **Re-theme via tokens, never by forking classes.** Change `--primary` / `--radius` once in the global stylesheet and every component follows. Every override needs a `.dark` value. Never place muted text on muted surfaces.

## Principles

1. **Open code you own.** Every `add` is a one-time file copy, not a dependency. Nothing updates silently, nothing phones home.
2. **Read before writing.** `info --json` → `view`/`search` → `add`. Never hand-write a DavinciUI component from memory.
3. **Compose, don't rebuild.** Pair DavinciUI motion pieces with the project's existing layout and shadcn/ui primitives — don't rebuild forms, dialogs, or menus when they already exist.
4. **Motion with restraint.** Prefer transform/opacity, respect `prefers-reduced-motion`, keep hero/canvas effects off the critical path. Check heavy pieces (WebGL, large motion scenes) against the component page requirements first.

## Troubleshooting

- **404 or unknown registry** — the `registries` block is missing from `components.json`. Re-add it.
- **Wrong slug** — names are exact and kebab-cased. Copy from the component page or `view` first.
- **Files in the wrong place** — aliases in `components.json` disagree with `tsconfig.json` paths.
- **Missing dependency at runtime** — finish installing with the project package manager, restart the dev server.
- **Stale output after editing** — installed files are yours, not live-linked. Re-install only with `--overwrite` (commit first).
