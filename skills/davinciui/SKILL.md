---
name: davinciui
description: Animated React components for DavinciUI. Find, install, compose, and customize motion components with the shadcn CLI.
---

# DavinciUI

Animated React components you add as source code to the user's project via the shadcn CLI. There is no runtime package — the CLI copies component files into the project and the user owns the code.

> **IMPORTANT:** Run all CLI commands with the project's package runner: `pnpm dlx shadcn@latest`, `npx shadcn@latest`, `yarn dlx shadcn@latest`, or `bunx --bun shadcn@latest` — based on the project's `packageManager`. Examples below use `pnpm dlx shadcn@latest`; substitute the correct runner.

## Current Project Context

```json
!`pnpm dlx shadcn@latest info --json`
```

The JSON above is the source of truth for this project: framework, Tailwind version, aliases, icon library, installed components, and resolved file paths. Always read it before generating code — never assume `@/components/ui` if aliases say otherwise.

Use `pnpm dlx shadcn@latest docs @davinciui/<component>` to fetch documentation and example URLs for any component.

## Principles

1. **Open code you own.** Every `add` is a one-time file copy, not a dependency. Installed files never update on their own and never phone home.
2. **Read before writing.** Check `info --json`, then `view` or `docs` the component, then install. Never hand-write a DavinciUI component from memory.
3. **Respect project tokens.** Components use semantic Tailwind utilities (`bg-background`, `text-foreground`, `border-border`) and CSS variables. Re-theme via tokens, never by forking classes.
4. **Motion with restraint.** Animate transform and opacity, gate behind `prefers-reduced-motion` where the component supports it, and keep hero/canvas effects off the critical path.

## Installing Components

The DavinciUI registry lives at `https://davinciui.com/r/{name}.json` under the `@davinciui` namespace. The project must declare it in `components.json`:

```json
{
  "registries": {
    "@davinciui": "https://davinciui.com/r/{name}.json"
  }
}
```

Install any component:

```bash
pnpm dlx shadcn@latest add @davinciui/text-morph
```

What happens: the CLI downloads `https://davinciui.com/r/text-morph.json`, copies the listed files into the project's aliased directories (default `@/components/ui`), and installs declared npm dependencies (e.g. `framer-motion`, `lucide-react`).

Useful variants:

```bash
# Preview without installing (read-only)
pnpm dlx shadcn@latest view @davinciui/text-morph

# Find candidates
pnpm dlx shadcn@latest search @davinciui --query "text"

# Pick up a newer registry version (replaces local files — commit first)
pnpm dlx shadcn@latest add @davinciui/text-morph --overwrite
```

Browse the full catalog at `https://davinciui.com/docs/components` or as plain text at `https://davinciui.com/llms.txt`.

## Composing Components

- Import from where the CLI placed the file, e.g. `import { TextMorph } from "@/components/ui/text-morph"`.
- DavinciUI components are animated building blocks (text reveals, hero backgrounds, visual effects, preloaders). Compose them with the project's own layout and shadcn/ui primitives — don't rebuild forms, dialogs, or menus from scratch when the project already has them.
- Keep prose and UI copy in the project's type scale (see `https://davinciui.com/docs/typeset`); reserve mono for code and labels.
- Every token override needs a `.dark` value. Never place muted text on muted surfaces.
- Check each component page for its own requirements before adding animation- or canvas-heavy pieces (WebGL, heavy Framer Motion scenes).

## Theming

- Tokens live in the global stylesheet under `:root` with dark overrides under `.dark` (`--background`, `--foreground`, `--primary`, `--border`, `--radius`, …).
- Change `--primary` or `--radius` once and every installed component follows — no component rewrite needed.
- Full token inventory: `https://davinciui.com/docs/foundations/colors`. Theming guide: `https://davinciui.com/docs/theming`.

## Troubleshooting

- **404 or unknown registry** — the `registries` block is missing from `components.json`. Re-add it.
- **Wrong slug** — item names are exact and kebab-cased. Copy the slug from the component page or `view` it first.
- **Files in the wrong place** — aliases in `components.json` disagree with `tsconfig.json` paths.
- **Missing dependency at runtime** — finish the install with the project's package manager, then restart the dev server.
