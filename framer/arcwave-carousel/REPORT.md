# Arcwave Carousel — final report

Branch: `3d-arcwave`  
Component: `framer/arcwave-carousel/ArcwaveCarousel.tsx`  
Demo: `framer/arcwave-carousel/demo/`

## 1. What was built

One self-contained Framer code component that renders an infinite CSS-3D carousel of image/video cards on the inside of a cylinder.

- Single `.tsx` file, default export + `addPropertyControls`.
- Imports only `react` and `framer`.
- Annotations: `@framerSupportedLayoutWidth any`, `@framerSupportedLayoutHeight any`, `@framerIntrinsicWidth 1200`, `@framerIntrinsicHeight 600`, `@framerDisableUnlink`.
- DOM + CSS 3D only: no WebGL, canvas, frame library or external runtime.
- One animation loop; per-frame geometry is written directly to element refs. No React state update per frame.
- Continuous and step autoplay, drag, momentum, spring settling, wheel input, optional snapping, centre-on-click, links, keyboard navigation, captions, video playback modes, responsive sizing, edge fade, side darkening, and Framer-canvas/reduced-motion paths.
- Local demo with a control strip, golden test, interactive desktop and compact instances, video/link/canvas variants, and RAF instrumentation.

### Milestones

1. **Shell + math** — annotations, defaults, cylinder plate math, cloned ring, static shell. Done.
2. **Cylinder layout** — responsive scaling, radius/perspective/gap controls, blur/fade/z-index/rotation, edge fade, shadows, darkening. Done.
3. **Motion** — drag, momentum, spring, wheel, snap, click-to-centre, keyboard, interaction pause/resume. Done.
4. **Autoplay** — continuous and step modes, direction, speed, interval, resume delay, hover pause. Done.
5. **Content + accessibility** — image/video slides, poster/alt/srcSet, caption modes/reveals, link behaviour, focus order, aria state, reduced motion. Done.
6. **Hardening + demo** — resize, canvas static mode, idle RAF stop, golden test, interaction/video/link tests, report and screenshots. Done.

No milestone was skipped.

## 2. How to run

```bash
cd framer/arcwave-carousel
./demo/build.sh
cd demo
python3 -m http.server 4173
# open http://localhost:4173/index.html
```

Typecheck:

```bash
./node_modules/.bin/tsc -p framer/arcwave-carousel/tsconfig.json
```

Automated browser tests:

```bash
node framer/arcwave-carousel/demo/test.mjs
```

Demo variants:

- `?autoplay=0` — stable, non-moving layout.
- `?canvas=1&autoplay=0` — static Framer-canvas simulation.
- `?link=1&autoplay=0` — first slide linked to `https://example.com`.
- `?video=1&autoplay=0` — first slide uses the local muted WebM fixture.
- `reducedMotion: "reduce"` (Playwright) — disables autoplay and spring motion.

## 3. Geometry

Measured reference values at card width 168:

| value                     | result                        |
| ------------------------- | ----------------------------- |
| pitch                     | `18.7827°` (target `18.783°`) |
| radius at base width      | `532`                         |
| perspective at base width | `480`                         |
| gap at base width         | `6.4`                         |
| rotation limit            | `65°`                         |
| visible arc               | `90°`                         |
| side opacity              | `0.45`                        |
| side blur                 | `2.4px`                       |
| blur exponent             | `1.3`                         |
| z-index base              | `500`                         |
| interactive angle         | `75°`                         |
| aria-hidden opacity       | `0.1`                         |
| minimum ring slots        | `20`                          |

The section 4.4 golden table was checked for slots 6–15 at position `10.57`. All 183 pure-math and DOM checks pass, including the expected x/z, rotateY, opacity, blur, z-index, pointer and aria states.

Per-plate formulas:

```text
d = wrap(i - position, slotCount)
theta = d * pitch
x = radius * sin(clamp(theta, -arc, arc))
z = -radius * (1 - cos(clamp(theta, -arc, arc)))
rotateY = clamp(theta, -maxRotation, maxRotation)
opacity = lerp(1, sideOpacity, |thetaClamped| / arc) *
          (1 - smoothstep(maxRotation, arc, |thetaClamped|))
blur = sideBlur * (|thetaClamped| / arc)^1.3 * scale
zIndex = 500 - round(20 * |thetaClamped| / pitch)
```

## 4. Interaction model

- **Position:** continuous slot-space position with spring toward a target.
- **Drag:** horizontal pointer drag; one card width moves about one slot; velocity feeds momentum on release.
- **Wheel:** horizontal or vertical delta; non-passive listener prevents page scroll over the carousel.
- **Snap:** optional rounding after interaction and idle.
- **Autoplay:** continuous speed in slots/second or step mode at `stepInterval`; direction left/right; resumes after `resumeDelay`; optional hover pause.
- **Click:** side card moves to centre; centre card follows its link. Side links do not navigate.
- **Keyboard:** ←/→ move one slot; Enter/Space centres a side card or activates the centre link.
- **Captions:** hover, always, or centre-only; fade/slide/none reveal.
- **Video:** muted loop; play when visible, centre-only, or always; hidden/offscreen cards pause.
- **Reduced motion:** autoplay and spring motion are disabled; position changes are immediate.
- **Idle:** animation loop stops when settled and no autoplay/interaction is pending.

## 5. Verification summary

| Check                                        | Result                                              |
| -------------------------------------------- | --------------------------------------------------- |
| Golden geometry + DOM, 183 checks            | Pass                                                |
| Continuous autoplay advances                 | Pass                                                |
| Step autoplay advances                       | Pass                                                |
| Drag moves the ring                          | Pass                                                |
| Wheel moves the ring                         | Pass                                                |
| Snap settles on a slot                       | Pass                                                |
| Keyboard next                                | Pass                                                |
| Click side card centres it                   | Pass                                                |
| Hover caption reveals / hides                | Pass                                                |
| Centre-only captions                         | Pass                                                |
| Always-on captions                           | Pass                                                |
| `fillHeight` responsive sizing               | Pass (`183.67 × 262.39` in 600×320)                 |
| Framer canvas static centre                  | Pass                                                |
| Reduced motion disables autoplay             | Pass                                                |
| Video renders and autoplays muted            | Pass                                                |
| Visible video mode keeps side video playing  | Pass                                                |
| Centre video mode pauses side / plays centre | Pass                                                |
| Always video mode plays side                 | Pass                                                |
| Side link centres instead of navigating      | Pass                                                |
| Centre link navigates                        | Pass                                                |
| Focus order + aria-hidden state              | Pass                                                |
| Idle RAF stops                               | Pass (`RAF 0/s`)                                    |
| Autoplay RAF runs                            | Pass (`~42/s` headless, capped by test environment) |
| Normal demo console errors                   | None                                                |
| TypeScript strict check                      | Pass                                                |
| Production demo build                        | Pass                                                |

## 6. Screenshots

All relative to this folder:

- `report/01-desktop.png` — full demo page.
- `report/02-hover-captions.png` — caption reveal on hover.
- `report/03-compact.png` — fill-height compact instance.
- `report/04-video.png` — video slide with playback.
- `report/05-framer-canvas.png` — static canvas layout.
- `report/06-reduced-motion-status.png` — reduced-motion header with `RAF 0/s`.

## 7. Deviations and assumptions

1. **Scaling.** Custom `cylinderRadius`, `perspective`, `gap` and `cornerRadius` are scaled by `cardWidth / 168`, matching the measured base geometry rather than staying absolute at other card sizes.
2. **Default content.** The default ten team slides use inline procedural SVG portraits, so a fresh drop has no network dependency. User images/videos replace them directly.
3. **Primary demo size.** The interactive reference instance uses the measured `168 × 240` card size inside `1465 × 737`; the compact instance exercises `fillHeight` at `600 × 320`.
4. **Snap + continuous autoplay.** Snap applies to user interaction/wheel idle. Continuous autoplay remains continuous rather than quantising to slots.
5. **Video fixture.** `demo/test-video.webm` is a 40 KB generated muted fixture used only by `?video=1`; the component itself has no bundled media.
6. **`debugPosition`.** A non-controlled prop used by the golden test to freeze the ring at `10.57`; it is intentionally not exposed as a Framer control.
7. **Link target.** Link objects may override the default `_blank`; `_blank` links include `noopener noreferrer`.
8. **Reduced motion.** Motion is suppressed rather than shortened; this keeps the carousel usable and removes autoplay.

## 8. Known limitations

- Wheel capture intentionally prevents page scrolling while the cursor is over the carousel.
- Very small rings are cloned to 20 slots, so the same slide can appear on both sides of the ring.
- Video elements are muted and loop automatically; there is no custom playback UI or audio control.
- The demo video fixture is a generated colour test pattern, not a production asset.
- Changes are currently uncommitted on `3d-arcwave`.
