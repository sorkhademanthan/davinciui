# FannedDeck ("Arc Deck Pro" replica) — test report

Branch: `feat/fanned-deck`
Component: `framer/fanned-deck/FannedDeck.tsx` (one file; `react` + `framer` only — all motion is CSS transitions/animations, no framer-motion needed)
Local demo: `framer/fanned-deck/demo/` (`./build.sh`, then serve with `/images/*` mapped to `apps/web/public`)

## How it was verified

The live reference (arcdeckpro.framer.website) was inspected with headless
Chromium: the brief's §9 console snippet plus deeper extraction captured every
card's item/arc/hop/bob/perspective/face styles, all 14 slice transforms,
idle + hover states for cards 1/4/7 (and 2/3/5/6 for bubble offsets), shadow
values, the bob/hop keyframes, the bubble tail SVG, and the entrance pile
state. The replica's DOM was then asserted against those captured values with
a Playwright suite (`demo/test.mjs`) — 119 checks, all passing.

## Measured values that supersede the brief

| Value | Brief | Live (used) |
| ----- | ----- | ----------- |
| Tilt per card | 5.5deg | 4.3333deg, fan offset -3.5deg (asymmetric; left tilts harder) |
| Slice Z formula | 0.0819 x ((6.5-j)/6.5)^2 | Matches within 0.0003 (live serializer rounding); formula kept |
| Slice X | formula (symmetric) | Antisymmetric table (0.00977 ... -0.00977), baked |
| Hover straighten | tilt -> 0 | tilt x 0.4 |
| Hover scale | ~1.08-1.1 | x1.06 exactly |
| Uncurl | full | x0.45 rotateY / x0.4538 Z / x0.2026 X |
| Hover lift | "~0.05-0.08x--s" | fixed 18px on the arc layer ("- 18px") |
| Neighbour spread | 0.16x--s | 0.16 x 0.62^(dist-1) geometric wave |
| Bubble colour @inkhouse | #275ffd | #2f6bff (all 7 captured; @greenline #5e9c78) |
| Bubble type | ~14px/36px | Inter 17px/400, padding 10px 16px, radius 16px, tail SVG |
| Overlay B | opacity 0.001 | constant 0.19 |
| Entrance pile | "small scale, slight rotation" | x=0, arc 0.7 (confirmed by reload sampling) |

## Acceptance checks

| # | Check | Result |
| - | ----- | ------ |
| 1 | Idle fan matches live | Verified: item X, arc Y, hop, tilt, scale, z-index, bob duration/delay, slice transforms for all 7 cards x 14 slices asserted against the captured live DOM |
| 2 | Active card 450x300-equivalent geometry | Verified (card size token --s with cqw/cqh; centre card scale 1, tilt -3.5deg) |
| 3 | Seamless behaviour with 3/7/20 images | Verified structurally (list repeats evenly; demo uses 7; items clamp at 14) |
| 4 | Drag/swipe n/a; wheel n/a; keyboard focus, click-to-link | Verified: focus activates (focus = hover), mouse hover activates, first touch tap activates + second follows link, anchor opens new tab with noopener noreferrer |
| 5 | Entrance overshoot spring | Verified: pile state held pre-decode, then 560ms cubic-bezier(0.25,1.45,0.45,1) with 70ms/card stagger (deal/flip/rise/sweep all asserted from pile state to settled fan) |
| 6 | Hover on cards 1/4/7 | Verified: straighten + uncurl + neighbour spread + bubble + dim, no jank, no seam flicker (0.8px slice overlap kept) |
| 7 | Container-query scaling | Verified: card width 153px @ 900px viewport vs 276px @ 1600px; no fixed-px layout except radius/shadow/bubble/bob/18px lift |
| 8 | A11y | Verified: role=list/listitem, tabindex 0 + aria-label per card, aria-hidden bubble/shadow, reduced motion skips entrance + bob |
| 9 | No console errors | Verified across all scenarios |
| 10 | Side-by-side vs live | Structurally pixel-matched (values above); visual side-by-side done with repo images (the live photos are not in the repo, so colour-matched repo portraits were mapped in order) |

## Known limitations / assumptions

- **Images**: the live site's seven portraits are not in the repo; the seven
  `spiral-3d-slider` portraits were mapped in bubble-colour order (blue, red,
  amber, magenta, crimson, violet, green). They are darker/moodier than the
  live photos, so the deck reads darker — layout and motion are identical.
- **Bubble Y offsets** are hand-placed per card on the live site; both tables
  (idle + hover) are copied verbatim and cycled for decks larger than 7.
- **The `--hop` layer** is reproduced for DOM parity (with its keyframes in
  the injected style), but the live site never triggers it during
  hover/scroll in any capture, so it stays idle here too.
- **React 19 / @types/react 19** ignore `defaultProps` on function components;
  props merge `DEFAULT_PROPS` manually (comment in source).
- **Video cards** render the same 14-slice treatment (a `<video>` per slice,
  muted/loop/playsInline/autoplay); the demo uses images only.
- **Framer canvas / preview / published** behaviour not verified — needs a
  live Framer round-trip.
