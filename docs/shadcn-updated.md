# shadcn registry — update (2026-11-25)

Status snapshot after the `@davinciui` registry directory entry was merged upstream.
Companion to `SHADCN_REGISTRY_INDEX_SUBMISSION.md` (that file's "open PR" state is now stale).

## What happened (2026-11-25)

- **PR [shadcn-ui/ui#12799](https://github.com/shadcn-ui/ui/pull/12799)** (ours: "add `@davinciui` registry")
  was **closed** — not rejected. shadcn folded the entry into a batch PR and closed #12799 to track it there.
- **PR [shadcn-ui/ui#12850](https://github.com/shadcn-ui/ui/pull/12850)** — "feat(registry): add community registries"
  (authored by **shadcn**), containing 20 registries including `@davinciui` — **MERGED 2026-11-25T18:54:24Z**
  (merge commit `0e5b2e6` — `feat(registry): add 20 community registries (#12850)`).
- shadcn comment on #12799: *"Thanks, added this to #12850. Closing this one so we can track it there."*

## Live verification (2026-11-25, post-merge)

| Check | Result |
| --- | --- |
| `https://ui.shadcn.com/r/registries.json` | **200** — 613 entries, `@davinciui` **present** |
| Entry content | `name: @davinciui`, `homepage: https://davinciui.com`, `url: https://davinciui.com/r/{name}.json`, description: "140+ interactive React and Tailwind CSS components with motion, WebGL and cursor-driven effects. Copy, paste, and own the code." |
| `https://davinciui.com/r/registry.json` | **200** (via www redirect) — 164 items |
| `https://davinciui.com/r/button.json` | **200** — valid `registry:ui` JSON |
| `https://davinciui.com/r/shader-text.json` | serves, but **STALE** (see open item below) |

Entry as published in the directory:

```json
{
  "name": "@davinciui",
  "homepage": "https://davinciui.com",
  "url": "https://davinciui.com/r/{name}.json",
  "description": "140+ interactive React and Tailwind CSS components with motion, WebGL and cursor-driven effects. Copy, paste, and own the code."
}
```

## Moot / ignore (superseded by the merge)

- **github-actions bot on #12799**: "sign the commits within 14 days or PR auto-closes"
  → moot; #12799 is closed and the merged commit on #12850 is shadcn's own.
- **vercel[bot] on #12799**: "deploy to shadcn-pro Team needs authorization"
  → moot; that preview deploy belonged to the closed PR.

## Next steps

1. **Shoogle** — no submission API; its indexer reads `ui.shadcn.com/r/registries.json` on its next run.
   Check in a day or two: https://shoogle.dev — search `davinciui`.
   (Mechanics documented in `SHADCN_REGISTRY_INDEX_SUBMISSION.md` §"How Shoogle works".)
2. **Optional end-to-end install check** in a scratch Next.js project:
   ```bash
   npx shadcn@latest add @davinciui/shader-text
   ```
3. **Update `SHADCN_REGISTRY_INDEX_SUBMISSION.md`** — it still says PR #12799 is "open, MERGEABLE, BLOCKED"
   (line ~16) and has unchecked "wait for review" boxes. Should be rewritten to: merged via #12850.

## Open item (unrelated to shadcn, but blocks "everything deployed")

- The 18-commit push (`a50ab16`, includes shader-text registry regen) is on `origin/main` but **not live**:
  the Vercel deploy was **canceled from the dashboard**; prod still serves the previous build.
  - Verify after redeploy: local `shasum apps/web/public/r/shader-text.json` must match
    `curl -sL https://davinciui.com/r/shader-text.json | shasum`.
  - Also `https://davinciui.vercel.app/demo/video-preview-grid` should go 404 → 200.
  - Redeploy: Vercel dashboard → davinciui → Deployments → redeploy latest, or `npx vercel --prod`.
- Separate known issue: GitHub Actions `Validate Registry` fails on **billing**
  ("recent account payments have failed / spending limit"), not code —
  `node scripts/validate-registry.js` passes locally (169 OK). Doesn't block Vercel.
