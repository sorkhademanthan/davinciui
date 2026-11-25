# Video Preview Grid — architecture

A production-grade catalog grid of looping video previews:
**every card is a poster by default; a `<video>` exists only for the card the user interacts with, and it is torn down immediately afterward.**

Two components and one manager:

| File                                                | Purpose                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/ui/src/components/video-preview-card.tsx` | One card: poster + intent-based video mount + teardown + fade-in                |
| `packages/ui/src/components/video-preview-grid.tsx` | Virtualized grid wrapper (responsive columns) built on `react-window` v2 `Grid` |
| `packages/ui/src/lib/video-playback-manager.ts`     | Singleton enforcing **at most 1 active video** at a time                        |
| `packages/ui/src/hooks/use-video-preview-policy.ts` | Gates playback on reduced-motion / `saveData` / slow 2G / page hidden           |
| `packages/ui/src/hooks/use-hover-intent.ts`         | ~120 ms hover-intent timer (sweeping the mouse across the grid fires no videos) |
| `scripts/encode-previews.sh`                        | ffmpeg pipeline: `<slug>.webm` + `<slug>.mp4` + `<slug>.webp` with size budgets |
| `scripts/verify-video-preview-grid.mjs`             | Browser QA (section 11 below) — `node scripts/verify-video-preview-grid.mjs`    |

## Architecture in four layers

1. **Virtualization** — `VideoPreviewGrid` uses `react-window`'s `Grid` with fixed
   `rowHeight` and `columnWidth`. Offscreen cards are not rendered at all; `overscanCount`
   (default 2) keeps cards near the viewport. Columns are responsive: a
   `ResizeObserver` on the grid container recomputes `columnCount`
   (`floor(width / minCardWidth)`, default 250, capped at 8).
2. **Card = image until intent** — `VideoPreviewCard` renders only a poster
   `<img>` (`loading="lazy" decoding="async"`, poster at card size × 2 for retina).
   `aspectRatio` (default `244 / 190`) reserves layout space → CLS = 0. No `<video>` in the DOM.
3. **Intent-based mount** — video mounts only when the user shows intent:
   - Desktop: `pointerenter` starts a 120 ms hover-intent timer; `pointerleave` cancels it.
   - Keyboard: `focus` starts, `blur` stops.
   - Touch: first tap (`pointerdown`, `pointerType === "touch"`), or with
     `playOnIntersect` (used by the grid on coarse-pointer devices): `IntersectionObserver`
     with `threshold: 0.6`.
4. **Teardown (what saves memory)** — on leave/blur/unmount, the card runs:
   `video.pause()` → `video.removeAttribute("src")` → remove `<source>` children →
   `video.load()` (aborts the download and releases the decoder/buffers) → unmount.
   The poster `<img>` stays in the DOM the whole time. All timers/observers/listeners are
   cleaned up in `useEffect` cleanup.

## Concurrency

`videoPlaybackManager` (`packages/ui/src/lib/video-playback-manager.ts`) is a module
singleton with an `acquire(teardown)` / `release(token)` pair. Acquiring tears down the
previous playback first, so at most one video decodes at any time. `VideoPreviewCard`
holds its token in a ref; unmount releases it.

## Policy

`useVideoPreviewPolicy()` returns `false` when any of these hold:

- `prefers-reduced-motion: reduce`
- `document.visibilityState === "hidden"` (also on `visibilitychange`)
- `navigator.connection.saveData === true` or `effectiveType` is `2g`/`slow-2g`

It re-checks on `visibilitychange`, media-query `change`, and connection `change`.

## Video markup (intended, not rendered at rest)

```html
<video
  muted
  loop
  playsinline
  preload="none"
  disablePictureInPicture
  disableRemotePlayback
  poster="…webp"
  aria-hidden="true"
>
  <source src="…webm" type="video/webm" />
  <source src="…mp4" type="video/mp4" />
</video>
```

`video.play()` is called in a `useEffect` on mount and its promise is caught
(`.catch(() => {})` — it can reject on interruption). The video fades in
(`opacity` transition, 200 ms) only after the `playing` event, so there is no black flash.

## Encoding pipeline

`scripts/encode-previews.sh <input-dir> [output-dir] [width]` (default width 480):

- `*.webm` — VP9 (primary), `*.mp4` — H.264/yuv420p (Safari/iOS), `*.webp` — poster (1 frame).
- Budgets enforced (fail the script): video **< 300 KB** (hard fail > 500 KB), poster **< 15 KB**.
- Source clips should be 3–5 s seamless loops at card size × 2; never ship full-res recordings.

## Usage

```tsx
import { VideoPreviewGrid } from "@workspace/ui/components/video-preview-grid";

const items = [
  {
    id: "1",
    href: "/item/1",
    poster: "/assets/video/1.webp",
    sources: [
      { src: "/assets/video/1.webm", type: "video/webm" },
      { src: "/assets/video/1.mp4", type: "video/mp4" },
    ],
    title: "Nova",
    meta: "UI / 2024",
  },
  // …200+ items
];

<VideoPreviewGrid items={items} height={1280} />;
```

## Verification (section 11)

Run against the dev server (`pnpm dev`):

```bash
node scripts/verify-video-preview-grid.mjs   # or: pnpm test:video-preview-grid
```

It opens `http://localhost:3000/demo/video-preview-grid` (200-card demo page, auto-starts the
dev server if needed) in Chromium and checks, printing measured values:

- **A. Initial load:** `video requests at load: 0`, `mounted <video> at rest: 0`,
  `posters in DOM: 150` (verified).
- **B. Scroll:** `body child elements while scrolled: 66` (virtualization, verified).
- **C. Hover:** `video requests after hover: 1`, `mounted <video> while playing: 1` (verified).
- **D. Move away:** `videos after pointer leaves: 0` (verified).
- **E. Sweep:** `max active videos during sweep: 1` (verified — the ≥120 ms hover-intent
  prevents most requests; the manager guarantees ≤ 1).
- **F. Limited connections:** hovering with `saveData: true`, `effectiveType: 2g` /
  `slow-2g` (emulated via `navigator.connection` in the page) produces `0` requests.
- **G. Memory:** `videos after 30 hover/leave cycles: 0`.
