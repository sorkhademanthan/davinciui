# shadcn Registry Directory & Shoogle listing

DavinciUI is exposed as a namespaced shadcn registry:

- Index: `https://davinciui.com/r/registry.json`
- Items: `https://davinciui.com/r/<name>.json`
- Install: `npx shadcn@latest add @davinciui/<name>`

## Current status (2026-11-22)

| Item | Status |
| --- | --- |
| Live registry index | 200 OK, 164 unique items |
| Every item URL | 164/164 resolve, valid JSON + `registry-item` content |
| Directory entry | Added in sibling clone `../ui` on `feat/registry-add-davinciui` (`714f616c7`) |
| Upstream PR | **shadcn-ui/ui#12799** — open, `MERGEABLE`, `BLOCKED` on review |
| Merged into `ui.shadcn.com/r/registries.json` | **Not yet** (593 entries, no `@davinciui`) |
| Shoogle listing | Appears automatically **after** the PR merges |

The only failing check on the PR is Vercel `Authorization required to deploy`
(fork deploy permission), not a code failure. Everything else passes.

## Use it now (before the PR merges)

The merge is only needed for the short `@davinciui/<name>` form. You can install
today with either of these:

```bash
# Direct item URL — works immediately, no setup
npx shadcn@latest add https://davinciui.com/r/text-morph.json
```

```jsonc
// components.json — register the namespace locally, then use @davinciui/*
{
  "registries": {
    "@davinciui": "https://davinciui.com/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @davinciui/text-morph
```

The current shadcn CLI has **no `--registry` flag** (verified with
`shadcn add --help`); do not rely on it.

## How Shoogle works (important)

Shoogle has **no submission API, form, token, or namespace registration**.
It indexes the official shadcn registry directory. The chain is:

1. PR merges into `shadcn-ui/ui` `apps/v4/registry/directory.json`.
2. That publishes `@davinciui` into `https://ui.shadcn.com/r/registries.json`.
3. Shoogle's indexer picks it up on its next run.

So there is **no separate Shoogle action**. Getting the shadcn PR merged is the
whole task.

## shadcn directory requirements

1. Registry is open source and publicly reachable over HTTPS.
2. `registry.json` conforms to `https://ui.shadcn.com/schema/registry.json`.
3. Flat layout: `/registry.json` and `/<name>.json` at the registry root.
4. The index `registry.json` `files` array, if present, must **not** contain
   `content` (individual item JSONs must contain `content`).

The directory entry lives in `apps/v4/registry/directory.json` and is validated
by `pnpm --filter=v4 validate:registries` in the shadcn repo.

## The directory entry

```json
{
  "name": "@davinciui",
  "homepage": "https://davinciui.com",
  "url": "https://davinciui.com/r/{name}.json",
  "description": "140+ interactive React and Tailwind CSS components with motion, WebGL and cursor-driven effects. Copy, paste, and own the code.",
  "author": "Manthan Sorkhade",
  "logo": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='122 89.5 256.41 316.24' fill='var(--foreground)'>…</svg>"
}
```

Allowed keys only: `name`, `homepage`, `url`, `description`, `author`, `logo`.
`name` must match `^@[a-zA-Z0-9][a-zA-Z0-9_-]*$`, `url` must contain `{name}`,
and names must be unique (case-insensitive).

## Re-verify at any time

From the repo root:

```bash
pnpm verify:registry
# or: node scripts/verify-registry-urls.mjs
# or: node scripts/verify-registry-urls.mjs http://localhost:3000/r
```

It checks the index and every item URL for: HTTP 200, valid JSON, matching
`name`, valid `registry-item` type, and non-empty `files[].content`. Exits
non-zero on any problem.

Also useful:

```bash
pnpm validate:registry   # local generated registry consistency
```

## Next steps (checklist)

- [ ] Wait for review on **shadcn-ui/ui#12799**; respond to any maintainer
      comments. Rebase if asked.
- [ ] After merge, confirm the entry is live:

  ```bash
  curl -s https://ui.shadcn.com/r/registries.json | grep -o '"@davinciui"'
  ```

- [ ] Then confirm the CLI resolves the namespace (after `@davinciui` is in the
      user's `components.json` / registry directory):

  ```bash
  npx shadcn@latest add @davinciui/text-morph
  ```

- [ ] Check Shoogle's directory for `@davinciui`:
      `https://shoogle.dev/directory` (its indexer runs on its own schedule).
- [ ] Re-run `pnpm verify:registry` after any registry regeneration or deploy.

## Troubleshooting

- **PR shows BLOCKED** — expected until a maintainer reviews. The Vercel
  failure is a fork-deploy permission issue, not a build failure.
- **`@davinciui` missing from `registries.json`** — the PR is not merged yet.
  Nothing on our side to fix.
- **An item 404s or has empty content** — run `pnpm verify:registry`, then
  regenerate the affected item with `node scripts/generate-registry.js <name>`.
- **CLI cannot find `@davinciui/<name>`** — the namespace is not in the
  directory yet. Install one of two ways until the PR merges:

  ```bash
  # 1) Direct item URL (no config needed)
  npx shadcn@latest add https://davinciui.com/r/text-morph.json
  ```

  ```jsonc
  // 2) Register the namespace locally in components.json, then use @davinciui/*
  { "registries": { "@davinciui": "https://davinciui.com/r/{name}.json" } }
  ```

  Note: the current shadcn CLI has **no `--registry` flag** (verified with
  `shadcn add --help`). Use the direct URL or `components.json` instead.

## Related

- Site tree: `/sitemap` (`apps/web/app/sitemap/page.tsx`)
- Machine sitemap: `/sitemap.xml` (`apps/web/app/sitemap.ts`)
