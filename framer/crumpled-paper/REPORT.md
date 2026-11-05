# Crumpled Paper Reveal — final report

Branch: `feat/crumpled-paper`  
Component: `framer/crumpled-paper/CrumpledPaperReveal.tsx`  
Demo: `framer/crumpled-paper/demo/`

## 1. What was built

One self-contained Framer code component that renders an image as a faceted paper wad and unfolds it into a flat, creased print.

- Single `.tsx` file, default export + `addPropertyControls`.
- Imports only `react` and `framer`; all GLSL is inline as template literals.
- Annotations: `@framerSupportedLayoutWidth any`, `@framerSupportedLayoutHeight auto`, `@framerIntrinsicWidth 320`, `@framerDisableUnlink`.
- Raw WebGL2, no three.js or other runtime dependencies.
- Procedural geometry, creases, folds, facets, shadow, lighting, curl, and image/no-image placeholder.
- CSS flat-print fallback for Framer canvas, reduced motion, WebGL2 absence, and failed images.
- Local demo with three procedural test images (handwritten letter, blue mountain photo print with baked white margin, typed letter with red `RECEIVED` stamp), a control strip, reduced-motion emulation, and RAF/FPS instrumentation.

### Milestones

1. **Shell** — annotations, props/defaults, clamped controls, measured width/aspect height, DOM wrapper, overlay, CSS, Framer canvas path. Done.
2. **WebGL plane** — WebGL2 context, shader/program helpers, sheet + shadow programs, VAO/EBO, texture upload, mipmaps, DPR/backing-store sizing, resize, context loss/restore, lazy init. Done.
3. **Morph + timing** — ball topology, 12 shape presets, stagger, springy easing, anticipation squeeze, billow flight envelope, collapse, reversible animation. Done.
4. **Look** — facets, crease/fold lines, back-face paper, image/focal/margin/radius, shadow interpolation, paper/back/finish/crease controls, ball size, curl, pointer light. Done.
5. **Triggers + a11y** — hover, click, inView (+ replay), scroll; touch behavior; link navigation; keyboard focus/Enter/Space; aria; focus ring; reduced motion. Done.
6. **Hardening** — no WebGL2/image/broken-image fallbacks, CORS-safe texture path, DPR resize, context restore, 1/3/6 instance isolation, idle RAF stop. Done.

No milestone was skipped.

## 2. How to run

```bash
cd framer/crumpled-paper
./demo/setup.sh          # symlinks React + @types from apps/web/node_modules
./demo/build.sh          # bun build demo/main.tsx -> demo/dist/main.js
cd demo && python3 -m http.server 4173
# open http://localhost:4173/index.html
```

Typecheck:

```bash
cd framer/crumpled-paper
npx tsc --noEmit -p tsconfig.json
```

Demo flags:

- `?canvas=1` — static Framer-canvas simulation (no `<canvas>`).
- `?nolink=1` — overlay is a focusable `div`, click toggles.
- `?broken=1` — first image fails, exercises the CSS fallback.
- `?aspect=1:1&margin=24&focal=0,0` — aspect/margin/focal inspection.
- Replay checkbox in the control strip for the inView replay path.

## 3. Deviations and assumptions

1. **Extra fallback element.** The wrapper contains an extra `aria-hidden`, `pointer-events:none` flat-print layer that fades out when WebGL is ready. It is the static/fallback path and keeps the Framer canvas and failure states usable. The required canvas/overlay structure is otherwise unchanged.
2. **One WebGL2 context per instance.** Six instances were tested. This is simpler than a shared context with per-instance scissor/viewport and stays well inside typical browser context limits.
3. **Color space.** The image is sampled and composited with premultiplied alpha; no explicit sRGB texture/internal-format conversion or sRGB framebuffer is used. Colors were matched visually against the reference.
4. **Broken-image fallback.** A broken image shows the procedural ruled-paper placeholder rather than a broken photo. A WebGL2-unavailable instance shows the real image in CSS.
5. **Flat-sheet facets.** Procedural facet shading is intentionally softer than a sharp low-poly reference; it reads as paper texture at thumbnail size and keeps the print legible.
6. **Link target.** Link URLs open with `target="_blank"` and `rel="noopener noreferrer"` as specified; a Link object's own target is not forwarded.
7. **Scroll demo layout.** The demo inserts a `62vh` spacer only when trigger is `scroll` so the instance starts below the 85% line, and a `52vh` footer spacer.
8. **Broken-image console noise.** The browser logs its own 404 for the intentionally broken demo URL in addition to the single component `console.warn`.
9. **Timing evidence.** The spring numbers below are from the implemented easing function; screenshot deltas confirm the visible progression but include Playwright capture latency, so they are not frame-exact.

## 4. Measured timing (duration = 1s, Springy)

Spring: damping `0.58`, omega `7.0`, time warp `pow(t, 1.9)`, settle blend `smoothstep(0.9, 1.0)`.

| time | progress | squeeze | billow |
|---|---|---|---|
| 0.00s | 0.000 | 1.000 | 0% |
| 0.20s | 0.047 | 0.964 | 9.4% |
| 0.30s | 0.188 | **0.900** | 12.5% |
| 0.35s | 0.302 | 0.930 | 13.5% |
| 0.425s | 0.516 | 1.000 | **14.0%** |
| 0.60s | **0.992** | 1.000 | 11.2% |
| 0.75s | **1.105** (peak) | 1.000 | 5.1% |
| 0.85s | 1.057 | 1.000 | 0% |
| 0.90s | 1.027 | 1.000 | 0% |
| 1.00s | 1.000 | 1.000 | 0% |

- Reveal is near-flat at ~0.6s.
- Peak overshoot is ~10.5% at ~0.75s.
- Motion is visually settled by ~0.9–1.0s (2.7% residual at 0.9s).
- Billow envelope is `sin(pi * clamp(flight / 0.85))`, peak at 0.425s, 0 at 0.85s.
- Anticipation is a 10% squeeze, peak at ~0.30s, recovered by ~0.40s.
- Collapse is ~0.6s at full distance, scaled by distance, ease-in-out, no anticipation.
- Screenshot deltas (mean RGB vs settled, including capture latency):

| 0.5s | 0.6s | 0.7s | 0.8s | 0.85s | 0.9s | 1.0s |
|---|---|---|---|---|---|---|
| 11.1 | 9.35 | 6.36 | 2.79 | 1.11 | 1.12 | 1.1 |

## 5. Verification summary

| Check | Result |
|---|---|
| Ball, mid-flight, flat, collapse screenshots | Pass |
| Hover reveal and leave recollapse | Pass |
| Click + link: first click reveals, second opens `https://example.com/` | Pass |
| Click without link: toggles | Pass |
| InView: reveal on enter; replay off stays; replay on collapses on leave and replays exactly | Pass |
| Scroll trigger: ball below 85% line, flat once top crosses 25%; smooth lerp | Pass |
| Keyboard: Tab focus, 2px focus ring, Space/Enter | Pass |
| Touch: first tap reveals, second follows the link | Pass (earlier run) |
| 1/3/6 instances; hover isolation in six-instance page | Pass |
| Reduced motion: finished flat print, RAF 0 | Pass |
| Framer canvas: 0 `<canvas>` elements, flat print | Pass |
| Broken image: canvas opacity 0, CSS placeholder, one warning | Pass |
| WebGL2 unavailable: CSS image fallback, warning | Pass |
| Resize / DPR: backing store `CSS × min(dpr,2)`; re-measured 1306→1440 on DPR 2 resize | Pass |
| Context loss/restore via `WEBGL_lose_context` | Pass |
| Idle RAF stops | 0 calls/s |
| 12 shapes distinct at thumbnail size | Pass (mean diff 24–34) |
| No `any` except the CSS-variable cast; imports only react/framer | Pass |
| TypeScript strict check | Pass |
| Normal demo run console errors | None |

## 6. Screenshots

All relative to this folder:

- `report/01-ball.png` — tight wad at rest.
- `report/02-mid-billow.png` — near-flat billowing mid-flight.
- `report/03-flat.png` — settled flat print.
- `report/04-collapse-mid.png` — collapsing back toward the wad.
- `report/05-keyboard-focus.png` — keyboard focus ring with revealed print.
- `report/06-shapes.png` — all 12 ball shapes.
- `report/07-six-instances.png` — six independent instances.
- `report/08-six-hover-isolation.png` — one flat, others still wads.
- `report/09-framer-canvas.png` — static Framer-canvas layout (no canvas).
- `report/10-reduced-motion.png` — reduced-motion flat print, RAF 0.
- `report/11-broken-image.png` — broken-image CSS placeholder.

## 7. Section 12 — acceptance checklist

- [x] Default drop shows a tight wad, no console errors, no external asset requests. **PASS**
- [x] Ball is ~0.45 × sheet width and ~0.585 × sheet height at the tuned default `ballSize` of 0.45 (the measured 0.50/0.65 ratios are scaled by this value), off-axis, faceted, with image shards and the reverse side visible. **PASS**
- [x] Shadow is down-right, blended, blur/offset/opacity interpolate to the flat sheet. **PASS**
- [x] Hover reveals; pointer leave recollapses. **PASS**
- [x] Click with a link reveals first, navigates on the next activation. **PASS**
- [x] Click without a link toggles. **PASS**
- [x] InView reveals on entry; replay can collapse on exit and replay on re-entry. **PASS**
- [x] Scroll trigger tracks progress from folded below 85% to flat at 25%. **PASS**
- [x] Reduced motion shows the finished flat print with no animation loop. **PASS**
- [x] Framer canvas shows the flat print without WebGL or a canvas element. **PASS**
- [x] Empty image shows a procedural placeholder; broken/CORS image shows the CSS fallback and warns once. **PASS**
- [x] WebGL2 unavailable shows the CSS fallback. **PASS**
- [x] Three or more instances work independently; six were verified. **PASS**
- [x] Tab reaches the overlay; focus ring is 2px with a 4px offset; Enter/Space behaves like click. **PASS**
- [x] Touch first tap reveals, second tap follows the link. **PASS**
- [x] `link` renders a real `<a>` only; no link renders `<div role="img" tabindex="0">`. **PASS**
- [x] Canvas is `aria-hidden`, pointer-events none, oversized by the padding; wrapper size comes from the aspect ratio. **PASS**
- [x] Backing store is CSS size × `min(dpr,2)`; resize stays crisp. **PASS**
- [x] Texture upload is CORS-safe, downscaled to 2048 if needed, mipmapped. **PASS**
- [x] Context loss is prevented and restored resources are rebuilt. **PASS**
- [x] No React re-render per frame; RAF stops when settled/idle. **PASS**
- [x] 12 shape presets and 3 fold modes are distinct/visible. **PASS**
- [x] All numeric controls clamp; controls irrelevant to the trigger hide via `hidden`. **PASS**
- [x] The canvas padding (min 128px, `0.4 × width`) contains the ball, shadow, curl, and 14% billow. **PASS**
- [x] Only `react`/`framer` imports; GLSL inline; strict TS; only the allowed CSS-variable `any`. **PASS**

## 8. Known limitations

- One context per instance; extreme page counts (well above six) may approach browser context limits.
- No textual DOM fallback for the image content; the overlay carries the alt label.
- The flat-sheet facet pattern is softer than a hand-authored low-poly reference.
- The demo's intentional broken-image URL still produces a browser 404 line in the console.
