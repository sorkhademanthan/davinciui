# Smooth Scroll (Lenis)

This project uses [Lenis](https://github.com/darkroomengineering/lenis) for site-wide smooth scrolling.

## Where it’s mounted

- Provider: `apps/web/components/smooth-scroll/smooth-scroll.tsx`
- Hook exports: `apps/web/components/smooth-scroll/index.ts`
- Mounted once in `apps/web/components/providers.tsx` via `<SmoothScroll>`.
- Global CSS import: `packages/ui/src/styles/globals.css` imports `lenis/dist/lenis.css`.

## Default configuration

Configured in `SmoothScroll` (overridable via `options` prop):

- `autoRaf: true`
- `lerp: 0.1`
- `smoothWheel: true`
- `wheelMultiplier: 1`
- `touchMultiplier: 1`
- `syncTouch: false`
- `anchors: true`
- `stopInertiaOnNavigate: true`
- `autoResize: true`
- `autoToggle: true`
- `allowNestedScroll: false`

Reduced motion: when `prefers-reduced-motion: reduce` is active, wheel smoothing is disabled (`smoothWheel: false`) so scrolling stays native-feeling/instant.

## Tuning

- **Snappier**: increase `lerp` (e.g. `0.14` to `0.2`).
- **Floatier**: decrease `lerp` (e.g. `0.06` to `0.09`).
- Avoid setting `duration` + `easing` at the same time as `lerp` unless you intentionally switch modes (Lenis ignores `duration/easing` when `lerp` is defined).

## Nested scroll areas / overlays

Lenis can hijack wheel/touch events. For any element with its own scrolling, add:

```tsx
<div data-lenis-prevent className="overflow-y-auto">...</div>
```

Use granular variants only when needed:
- `data-lenis-prevent-wheel`
- `data-lenis-prevent-touch`

Overlays that lock background scroll should also stop/start Lenis:
- `useLenisOverlayLock(open)` from `@/components/smooth-scroll`
- This is wired into docs mobile nav and app nav drawer; fullscreen preview also stops/starts Lenis.

## Imperative scrolling

Use the hook in client components:

```tsx
import { useLenis } from "@/components/smooth-scroll"

const lenis = useLenis()
lenis?.scrollTo("#target", { offset: -96 })
lenis?.scrollTo(0, { immediate: true })
```

For small non-hook utilities, `window.__lenis` is exposed by `SmoothScroll` (client-only fallback).

## Route changes

`RouteScrollReset` in `SmoothScroll` resets to top on pathname change with `immediate: true, force: true`.

## Known limitations

- Smooth scroll does not work over iframes (wheel events are not forwarded).
- Safari can be capped at 60fps (30fps in low power mode).
- `position: fixed` may lag on pre-M1 macOS Safari.
