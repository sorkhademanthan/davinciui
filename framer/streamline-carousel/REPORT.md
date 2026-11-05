# Streamline Carousel — test report

Branch: `feat/streamline-carousel`
Component: `framer/streamline-carousel/StreamlineCarousel.tsx` (one file, `react` + `framer` only)
Local demo: `framer/streamline-carousel/demo/` (`./build.sh`, then serve the folder over HTTP)

## How it was verified

- `tsc --noEmit` on `framer/streamline-carousel/tsconfig.json` — clean.
- Headless Chromium (Playwright) suite `demo/test.mjs` — 42 checks, all passing:
  silhouette curvature, 3-card and 20-card layouts at 2560px, drag + momentum,
  horizontal / Shift+vertical / plain vertical wheel behaviour, arrow-key focus,
  click-to-focus, centred-card link opening with `noopener`, video playback,
  empty-state placeholders, natural aspect mode, DPR-aware backing-store resize,
  unmount/remount with RAF accounting, hover pause, and reduced motion.

## Acceptance checks

| # | Check | Result |
| - | ----- | ------ |
| 1 | Flat centre, curved edges, silhouette bows outward | Verified (pixel analysis: edge columns higher than centre; screenshots) |
| 2 | Seamless loop, 3 and 20 cards at 2560px | Verified (no background voids ≥120px at mid-height; copies tile seamlessly by construction) |
| 3 | Drag + momentum, wheel, arrow keys, click-to-focus, link opening | Verified (drag delta, wheel delta, ArrowRight tween, click tween, `window.open(url, "_blank", "noopener")`) |
| 4 | Plain vertical scroll over canvas scrolls the page | Verified (`scrollY` 0 → 118; carousel untouched; listener not preventDefault'd) |
| 5 | Videos play muted in canvas; images never stretched | Verified (video frames advance, canvas pixels change; images cover-fit via UV scale, never stretched) |
| 6 | Natural aspect mode: per-card widths, smooth re-layout after load | Partially verified — mode renders with per-card widths; re-layout eases over ~125ms but "no visible jump" not measurable headlessly |
| 7 | RGB split grows toward edges and with speed; zero at rest in flat centre | Verified visually (fringe present at extremes, absent in centre) — formula guarantees 0 at e=0 ∧ sv=0 |
| 8 | Resizing keeps canvas sharp | Verified (backing store == CSS size × min(dpr, 2) before and after resize) |
| 9 | Unmount/remount leaves nothing behind | Verified (RAF delta ≈ 0/800ms after unmount — 3 calls; remount restarts; listeners removed; videos paused and released) |
| 10 | Framer canvas / preview / published site; control show/hide | Not verified — needs a live Framer round-trip. Control `hidden` callbacks follow the spec; publish behaviour unchecked |

## Known limitations / assumptions

- **React 19 / @types/react 19 ignore `defaultProps` on function components**, so
  the component merges `DEFAULT_PROPS` manually; `.defaultProps` is still set for
  older Framer runtimes (comment in source).
- **Initial framing** seeds `pos` to the first card's centre so a fresh drop
  opens centred instead of flush-left; this uses the provisional aspect until
  media loads.
- **Shift+vertical wheel** drives the carousel per spec; the modifier lookup
  prefers horizontal delta over vertical, matching trackpad conventions.
- **`deltaMode: line` wheel events** are scaled ×16px (spec silent; simplest
  robust option).
- **Wheel capture** intentionally blocks page scroll only for gestures it
  consumes; plain vertical scroll passes through untouched.
- **Videos are detached elements** (never in the DOM); they mute-autoplay via
  `play()` on `loadeddata`. If a browser blocks it, the poster-less first
  frame shows and the component stays stable.
- **Empty media list** renders 7 gradient placeholder cards.
- **Small rings are cloned** logically via `base + m*P` copies — the same slide
  can appear multiple times on very wide screens by design.
- **A WebGL context loss** cancels RAF and rebuilds everything on restore
  (program, strip buffer, grey texture, media textures).

## Not verified (needs Framer)

- Appearance and behaviour inside the actual Framer canvas, the property
  panel (including `hidden` conditions), preview mode, and published output.
