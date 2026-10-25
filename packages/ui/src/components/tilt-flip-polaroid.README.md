# TiltFlipPolaroid

A single Polaroid-style photo card. It tilts in 3D away from the pointer and flips to a handwritten back face on click, tap, Space, or Enter.

```tsx
import { TiltFlipPolaroid } from "@/components/ui/tilt-flip-polaroid";

<TiltFlipPolaroid
  image={{ src: "/images/jeju-field.jpg", alt: "A quiet field in Jeju" }}
  date="12/07/24"
  backText={"jeju, april.\ni wandered into this field alone."}
/>;
```

## Props

| Prop               | Type                                | Default       | Notes                                                                         |
| ------------------ | ----------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `image`            | `{ src: string; alt: string }`      | —             | Photo reserved at the 372 × 367 inset with a `#EEE` placeholder while loading. |
| `date`             | `string`                            | `"12/07/24"`  | Centered in the 64px caption strip.                                           |
| `backText`         | `string`                            | The Jeju note | Newlines are preserved. Centered with 45px horizontal padding.                |
| `flipped`          | `boolean`                           | —             | Controlled flipped state.                                                     |
| `defaultFlipped`   | `boolean`                           | `false`       | Initial state when uncontrolled.                                              |
| `onFlippedChange`  | `(flipped: boolean) => void`        | —             | Fires on every flip request, including controlled mode.                       |
| `maxTilt`          | `number`                            | `15`          | Maximum degrees per axis.                                                     |
| `perspective`      | `number`                            | `1000`        | Perspective on the static hit-area wrapper.                                   |
| `tiltEnabled`      | `boolean`                           | `true`        | Tilt also disables for coarse pointers and reduced motion.                    |
| `selectableBack`   | `boolean`                           | `false`       | Enables text selection on the back face.                                      |
| `width`            | `number`                            | `396`         | Card width in CSS pixels.                                                     |
| `height`           | `number`                            | `443`         | Card height in CSS pixels.                                                    |
| `className`        | `string`                            | —             | Classes on the hit-area wrapper.                                              |
| `style`            | `React.CSSProperties`               | —             | Override exposed CSS variables and other inline styles.                       |

## CSS variables

`--tfp-bg`, `--tfp-card`, `--tfp-ink`, `--tfp-placeholder`, `--tfp-inset`, `--tfp-caption`, `--tfp-radius`, `--tfp-photo-radius`, `--tfp-shadow`, `--tfp-font`, `--tfp-date-size`, `--tfp-back-size`, `--tfp-back-line`.

The font stack is `var(--font-caveat, "Caveat"), "Segoe Script", cursive`. Load Caveat with `next/font` (or any local face) and expose it as `--font-caveat`. If it is absent, the script fallback is used.

## Transform nesting

```text
static hit area (perspective, pointer listeners, role=button)
└── tilt layer (rotateX / rotateY springs, preserve-3d)
    └── flip layer (rotateY spring, preserve-3d)
        ├── front face (backface-visibility: hidden)
        └── back face (pre-rotated 180deg, backface-visibility: hidden)
```

Keep the pointer listeners on the outer wrapper so the hit area never rotates. Apply the tilt rotation to the tilt layer and the flip rotation to the flip layer — never to the individual faces. The faces own `backface-visibility` so the hidden face is not shown mid-flip.
