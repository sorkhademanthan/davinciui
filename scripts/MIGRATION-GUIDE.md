# Migration Guide: Contentful-backed homepage preview media

## Overview

The homepage bento cards prefer MP4 previews from published Contentful
`component` entries. Each entry links one light and one dark asset. The local
WebM and WebP poster remain in the app as fallbacks, so cards keep working if
Contentful is unconfigured or unreachable.

Local media lives in `apps/web/public/preview-videos/home/<slug>/` with
`<slug>-<theme>.{mp4,webm,webp}` files. Published entries currently cover
`hover-cards`, `sunlight-effect`, `pixel-flow`, `gsap-text`, `text-video-mask`,
`scroll-reveal-image`, `geometric-trail-cursor`, `neon-mesh-bg`, `silk-aurora`,
`soft-fluid-gradient`, `ink-flow`, `character-field`, `spectra-noise` and
`noiser`. The remaining cards keep using their local files until migrated.

## Contentful setup

### Content type: `component`

| Field | Type | Config |
| --- | --- | --- |
| `title` | Symbol | Required |
| `slug` | Symbol | Required — matches the registry/home slug, e.g. `hover-cards` |
| `description` | Text or Symbol | Required (publishing fails without it) |
| `previewLight` | Asset link | Required — light-theme MP4 |
| `previewDark` | Asset link | Required — dark-theme MP4 |
| `category`, `featured`, `order` | any | Optional, currently unused by the homepage |

### Environment variables

Put these in `apps/web/.env.local` (never commit real tokens):

```
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN=          # Delivery API, read-only, used by the app
CONTENTFUL_MANAGEMENT_TOKEN=      # Management API, used by the migration script only
```

`CONTENTFUL_PREVIEW_ACCESS_TOKEN` and `CONTENTFUL_PREVIEW_SECRET` are optional
and only needed if draft previews are added later.

## Migration

```bash
node scripts/migrate-to-contentful.cjs [slug ...] [--source <dir>]
# e.g. node scripts/migrate-to-contentful.cjs pixel-flow gsap-text
# e.g. node scripts/migrate-to-contentful.cjs neon-mesh-bg --source ./tmp/previews
```

With no arguments it re-runs the original `sunlight-effect` and `hover-cards`
pilot set. Pass only the slugs you want to migrate so already-published assets
are not uploaded again. MP4s are read from
`apps/web/public/preview-videos/home` by default; pass `--source ./tmp/previews`
to upload freshly recorded files from `scripts/record-previews.mjs`.

The script:

1. Checks the Management API token and the `component` content type.
2. Deletes only empty, unpublished `Untitled` assets left by failed runs.
3. For each slug and theme: uploads the local MP4, creates and processes the
   asset, waits for a CDN URL, then publishes it.
4. Creates or updates and publishes one `component` entry per slug with
   `previewLight` and `previewDark` links.
5. Runs `scripts/check-contentful.mjs`.

Re-running is safe: entries are matched by `slug`, so they are updated rather
than duplicated. Uploaded assets are not deduplicated, so prune old assets in
Contentful if you migrate the same slug repeatedly.

## Verification

```bash
node scripts/check-contentful.mjs
```

It reports which `CONTENTFUL_*` variables are set (never their values), lists
the published `component` entries, and checks whether each preview asset is
published and resolvable through the Delivery API. Exit codes: `0` = ok,
`1` = unauthorized/missing credentials, `2` = wrong space/environment,
`3` = network/other error.

## Runtime behavior

`apps/web/lib/contentful.ts` fetches published `component` entries from the
Delivery API and caches them for five minutes. `app/page.tsx` passes the result
to `HomePreviewMediaProvider`; `VideoPreviewMedia` picks the theme-specific MP4
and merges it with the local WebM and WebP poster. If the fetch fails or the
variables are unset, the app serves only the local files.

Bump `PREVIEW_MEDIA_VERSION` in `apps/web/components/landing/video-preview-media.tsx`
after replacing media at the same Contentful asset URL to bust browser caches.

## Rollback

1. Remove the Contentful variables from the deployment (or leave the entries
   unpublished) — the app automatically falls back to local media.
2. Optionally delete the `component` entries and uploaded assets in Contentful.
3. The local files in `apps/web/public/preview-videos/home/` are never deleted
   by the migration; keep them as the rollback source.
