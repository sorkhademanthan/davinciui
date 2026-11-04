# DepthCarousel3D — test report

Branch: `feat/depth-3d-slider`
Component: `framer/depth-carousel/DepthCarousel3D.tsx` (one file; `react`, `framer`, `framer-motion` only)
Local demo: `framer/depth-carousel/demo/` (`./build.sh`, then serve the folder over HTTP)

## How it was verified

- `tsc --noEmit` on `framer/depth-carousel/tsconfig.json` — clean.
- Headless Chromium (Playwright) suite `demo/test.mjs` — all checks pass:
  golden layout table, initial active-card geometry, item counts for 3/5/7/20
  images at 2560px, drag + momentum, horizontal / Shift+vertical / plain
  vertical wheel behaviour, arrow keys, click-to-focus, active-card link with
  `noopener`, synthetic touch swipes, edge blur, responsive scale,
  unmount/remount, reduced motion, empty-state placeholders.

## Acceptance checks

| # | Check | Result |
| - | ----- | ------ |
| 1 | Verification table within 0.01 | Verified at 0.01 for width, height, rotateY, z-index and 0.05px for X/Z. The spec prints `a` to 3 decimals; two rows (a=0.838, a=1.838) differ by 0.013-0.019px — entirely attributable to that rounding; the formula is implemented exactly. |
| 2 | Active card 450x300 and centred; neighbours fan symmetrically | Verified (width/height read from computed style; mirror symmetry of slot +1/-1 within 0.01px) |
| 3 | Seamless loop with 3, 7 and 20 images at 2560px | Verified structural: 21/21/20 virtual slides mount, zero console errors; wrap math is exact (mod N) |
| 4 | Drag, swipe (touch), wheel, arrow keys, click-to-focus, active-card link | Verified (mouse drag, synthetic PointerEvents with pointerType=touch, touch-action: pan-y preserved, wheel granular, ArrowRight advances, click springs side card to centre, link opens with noopener) |
| 5 | Fast flick throws a few slots, settles on exact integer slot | Verified functionally — spring settles (framer-motion spring, stiffness 170/damping 26); 6-slot throw cap implemented |
| 6 | Edge blur only in outer 25%, fades to centre, never blocks input | Verified (25% width, blur(25px), linear-gradient mask both sides, pointer-events: none, z-index 5000 below drag layer 9999) |
| 7 | Perspective, rotation, depth, gap, overlap, spring props update live | Implemented via props-ref reads; prop edits reapply layout without remount (verified by construction; not exercised from a live Framer panel here) |
| 8 | Narrow container via responsiveScale | Verified (scale = clamp(w/1000, 0.55, 1); measured 435.6px @ 1000px, 270px @ 600px min-width contract) |
| 9 | Unmount leaves nothing behind | Verified structurally (deck unmounts from DOM; remount restores exactly 20 slides; springs stopped, timers cleared, listeners removed) |
| 10 | Framer canvas / preview / published site | Not verified — needs a live Framer round-trip |

## Known limitations / assumptions

- **React 19 / @types/react 19 ignore `defaultProps`** on function components;
  props merge `DEFAULT_PROPS` manually (comment in source); `.defaultProps`
  is still set for older runtimes.
- **Initial position** seeds the first card centred (spec silent).
- **Wheel**: horizontal delta drives the deck; vertical only with Shift held
  or `wheelAxis: "both"` (dominant axis). Line-mode deltas scaled x16px.
  Plain vertical page scroll is never prevented.
- **Root is min-width 600px / min-height 400px** as specced, so the 0.55
  responsiveScale floor only engages via the 600px contract on small screens.
- **Items are cloned logically** (base + m*N slots) — the same slide repeats
  on wide screens by design; no visible seam because positions are pure
  modular arithmetic.
- **The drag layer covers the whole component** (z-index 9999) and receives
  all input; hit-testing for clicks runs through the same layout math.
- **Videos are out of scope** — the spec handles images only.
- **`data-depth-index`** is emitted on items for testing; harmless in production.

## Not verified (needs Framer)

- Framer canvas / preview / published rendering, the property panel
  (including `hidden` conditions), and live control edits in the panel.
