# CurvedInlineType — test report

Branch: `curved-motion-type`
Component: `framer/curved-inline-type/CurvedInlineType.tsx` (one file; `react` + `framer` only)
Local demo: `framer/curved-inline-type/demo/` (`./build.sh`, then serve the folder over HTTP)
Reference: https://curvedinlinetype.framer.website/

## How it was verified

- `tsc --noEmit` on `framer/curved-inline-type/tsconfig.json` — clean.
- `demo/build.sh` (`bun build`) — succeeds.
- Headless Chromium (Playwright) suite `demo/test.mjs` — all checks pass:
  golden §4 line table at the calibrated base angle, rendered ring tables at
  `p = 0, .25, .5, .75, 1` against measured live values, content order,
  spring overshoot/settle, reverse direction, spec mapping, reduced motion,
  seven local images with alt text, 10px media radius, caption copy /
  typography / pulse, PageDown scrolling, 390px fit and computed font size.
- Geometry comparison against the live site at `p = 0` and `p ≈ 0.238`
  (`1440 × 900`) — ring positions, rotation, and fade match; copy and media are
  intentionally different.

Commands:

```sh
framer/curved-inline-type/demo/build.sh
node framer/curved-inline-type/demo/test.mjs
```

The test starts its own static server on port 4194, so no manual server is needed.

## Live calibration

Measured from the published Framer site at `1440 × 900`:

| Property | Value |
| -------- | ----- |
| Track height | 400vh (3600px), sticky 100vh stage, travel 300vh |
| Ring sweep | `from: -140`, `to: +140`, `track: 4` |
| Ring arc | `260°` (step `260 / 14`) |
| Spring | `stiffness 90`, `damping 26`, `mass 1`, Framer restDelta `0.001` / restSpeed `0.01` |
| Perspective | `min(1200px, 170vw)` |
| Lift / reach | `min(42vh, 42vw) * 0.800` / `min(46vh, 46vw) * 1.250` |
| Text pitch | `rotateX(-1.15 * theta)` |
| Far fade | `0.06 + 0.94 * ((cos + 1) / 2) ^ 1.5` |
| Far blur | `3 * (1 - front) ^ 1.6`, `none` below `0.06` |
| Media box | `0.900em × 1.035em`, 10px radius, `object-fit: cover`, gap `0.05em` |
| Type | Funnel Display, `clamp(24px, 8.55vw, 94px)`, `-0.04em`, `#f4f2ed` |
| Background | `#0b0b0e` |

At `p = 0` the live site shows its last line near the front (`y 0.3303`,
`z 0.9439`, `opacity 0.9607`) and its first line near the back
(`y -0.9869`, `opacity 0.3152`). The default `mapping: "live"` reproduces
this exactly; only the copy and media differ from the reference.

## Deviation between the written spec and the live component

The brief and the published site do not describe the same scroll mapping:

- The brief says `theta0 = progress * 260`, so at `p = 0` line 0 is at the
  front, and at `p = 1` line 13 has just passed it.
- The live site actually sweeps `-140° → +140°` with an initial anchor, so at
  `p = 0` line 13 is at the front and at `p = 1` line 0 has just passed it.

Both behaviours are implemented:

- `mapping: "live"` (default) — matches the live site pixel-for-pixel.
- `mapping: "spec"` — implements the brief's `theta0 = p * sweepDeg` mapping.
- `direction: "reverse"` — used with either mapping; with `"live"` it puts
  line 0 at the front at the top and line 13 at the front at the bottom, which
  is the behaviour described in the brief.

The brief also prints the reference base angle as `194.07`. That is rounded:
the underlying value is approximately `194.0783`, which reproduces every §4
row at full displayed precision. The formula itself is exact; only the printed
seed is truncated.

The brief asks for a pulsing caption in `#f4f2ed`; the live caption is a static
grey `rgb(139, 139, 150)`. The component keeps the pulse (`captionPulse`
defaults to `true`) and themes the color through
`var(--muted-foreground, #8b8b96)` so it stays legible in light and dark mode.
Both remain props.

## Acceptance checks

| # | Check | Result |
| - | ----- | ------ |
| 1 | §4 golden table exact | Verified; base angle `194.0783` reproduces all Y/Z/rotateX/opacity values at the printed precision. The printed `194.07` is a rounded seed, documented above. |
| 2 | Live site tables at `p = 0, .25, .5, .75, 1` | Verified. `p = 0` matches exactly; the other samples match within `0.0006` in Y/Z and `0.0004` in opacity after settling (spring residual, not formula error). |
| 3 | Content order, 7 images + 0 videos, 10px radius, 0.900 × 1.035em, cover | Verified from computed styles and srcs. |
| 4 | Scroll behavior, spring easing, slight overshoot | Verified. Line 0 rises past the front (peak `y ≈ 0.998`) then settles on `-0.3296`; live peaks at `0.9936` with the same qualitative curve. |
| 5 | Accessibility / reduced motion / keyboard | Verified. `prefers-reduced-motion` maps scroll directly, PageDown advances the track, caption is `aria-hidden` and `pointer-events: none`, images expose `alt`. |
| 6 | Caption pulse | Verified (`curved-caption-pulse`, 5.5s, 0.08–0.55 as specced). |
| 7 | Responsive fit | Verified at `390 × 844`: widest line (`Make Space`) is 312.1px with zero horizontal overflow; computed font size `33.345px`, identical to the live site. |
| 8 | No layout shift / font before first paint | Verified structurally: fonts are self-hosted and preloaded, and a `useLayoutEffect` plus inline initial transforms apply the ring geometry before the first paint. |
| 9 | Local media, no hotlinks | Verified; the seven images are repo-owned and copied into `demo/assets/`, with descriptive alt text. |
| 10 | Build + typecheck | Verified; `bun build` and `tsc --noEmit` both clean. |
| 11 | Framer canvas / preview / published site | Not verified — needs a live Framer round-trip. |

## Known limitations / assumptions

- **Custom spring.** Framer Motion is not available at the repo root, so the
  component integrates a small semi-implicit spring (4 substeps per frame,
  Framer's `restDelta 0.001` / `restSpeed 0.01` snap thresholds). It matches
  the live curve closely but is not the Framer analytical solver: peak `y`
  differs by ~`0.005` and the tail settles within ~`0.002`.
- **Videos.** The default composition uses images only. Custom lines can still
  include videos: up to three nearest the front (within a 70° gate) play, the
  rest are paused; all are `muted`, `loop`, `playsInline`, with preloaded
  metadata. The live site behaves the same way visually but was not inspected
  for its exact play/pause policy.
- **Fonts.** The demo self-hosts Funnel Display and Inter (`demo/assets/fonts`)
  because the CSS `@font-face` was not copied from the live site. In Framer the
  family is resolved by the host.
- **Links.** `CurvedInlineLine.href` supports optional wrapping anchors with
  `noopener noreferrer` for new tabs; the default lines are not links.
- **Caption defaults follow the brief**, not the live site (see deviation
  section above).
- **Test tables are measured live values**, so they encode the live mapping,
  not the brief's mapping. `mapping: "spec"` is covered by a separate check.

## Web app integration

The component is also shipped in the design system, not just the Framer harness:

- `packages/ui/src/components/curved-inline-type.tsx` — web port; Framer
  property controls stripped, named and default exports, isomorphic layout
  effect, repo-owned `/images` media, and theme-token defaults for background,
  text, and caption colors.
- `apps/web/app/demo/curved-inline-type/page.tsx` — fullscreen demo with
  Funnel Display / Inter `@font-face` and a reduced-motion-aware auto-scroll.
- `apps/web/components/docs/curved-inline-type.tsx` — docs page, install
  source, usage, and prop reference.
- `apps/web/components/docs/previews/curved-inline-type-preview.tsx` — docs
  stage iframe.
- `apps/web/components/docs/previews/curved-inline-type-card-preview.tsx` —
  live gallery card that auto-rotates a miniature ring.
- `apps/web/registry/index.ts`, `apps/web/public/r/curved-inline-type.json`,
  `apps/web/public/r/registry.json` — registry metadata and copy-paste item.
- Lazy docs registry, docs category/motion/accessibility maps, preview
  contract, design-system manifest, and the experience gallery are wired.

Verification:

- `pnpm --filter web typecheck` — clean.
- `eslint --max-warnings 0` on every touched web/UI file — clean.
- Dev-server Playwright checks: `/demo/curved-inline-type` mounts 14 lines,
  7 media elements and auto-scrolls; `/docs/components/curved-inline-type`
  renders the title and iframe with no console errors; the Text Animations
  gallery card mounts the live mini ring (7 images, 15 3D nodes). Light and
  dark mode resolve the stage to the theme tokens with no hardcoded dark
  background left in the demo, docs preview, card, or preview contract.
- `validate:registry` / `validate:docs` still report pre-existing main-branch
  gaps (`ambient-audio-toggle`, `focus-carousel`, preloader/sound slugs); no
  error references `curved-inline-type`.
