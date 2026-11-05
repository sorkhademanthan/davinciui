import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  editorialImageStackBackgroundItems,
  editorialImageStackForegroundItems,
} from "@/components/docs/previews/editorial-image-stack-items";
import { readComponentSource } from "@/lib/source-code";
import { EditorialImageStack } from "@workspace/ui/components/editorial-image-stack";

const defaultCode = `import { EditorialImageStack } from "@/components/ui/editorial-image-stack"

const backgroundImages = [
  { src: "/images/deck/architecture-01.jpg", alt: "Concrete oculus" },
  { src: "/images/deck/architecture-02.jpg", alt: "Spiral staircase" },
  // Twenty ring cards cycle through white / black / grey / black / rust.
]

const foregroundImages = [
  { src: "/images/deck/portrait-01.jpg", alt: "Blue motion profile" },
  { src: "/images/deck/portrait-02.jpg", alt: "Red fashion portrait" },
  // Center card images swap in sync with each ring step.
]

<EditorialImageStack
  backgroundImages={backgroundImages}
  foregroundImages={foregroundImages}
/>`;

const usageCode = `"use client"

import {
  EditorialImageStack,
  type EditorialImageStackImage,
} from "@/components/ui/editorial-image-stack"

// Add your own files to public/images, or use remote image URLs.
const backgroundImages: EditorialImageStackImage[] = [
  { src: "/images/deck/architecture-01.jpg", alt: "Concrete oculus" },
  { src: "/images/deck/architecture-02.jpg", alt: "Spiral staircase" },
  { src: "/images/deck/architecture-03.jpg", alt: "Chrome chair" },
  { src: "/images/deck/architecture-04.jpg", alt: "Coastal tree" },
  { src: "/images/deck/portrait-01.jpg", alt: "Green studio portrait" },
  { src: "/images/deck/portrait-02.jpg", alt: "Prismatic portrait" },
  { src: "/images/deck/portrait-03.jpg", alt: "Blue double exposure" },
  { src: "/images/deck/portrait-04.jpg", alt: "Crimson motion portrait" },
]

const foregroundImages: EditorialImageStackImage[] = [
  { src: "/images/deck/portrait-05.jpg", alt: "Blue profile" },
  { src: "/images/deck/portrait-06.jpg", alt: "Red long exposure" },
  { src: "/images/deck/portrait-07.jpg", alt: "Teal motion blur" },
  { src: "/images/deck/portrait-08.jpg", alt: "Crimson profile" },
  { src: "/images/deck/portrait-09.jpg", alt: "Camera reflection" },
  { src: "/images/deck/portrait-10.jpg", alt: "White studio motion" },
  { src: "/images/deck/portrait-11.jpg", alt: "Orange haze" },
  { src: "/images/deck/portrait-12.jpg", alt: "Silver motion" },
  { src: "/images/deck/portrait-13.jpg", alt: "Reflective visor" },
]

export default function PhotographicDeck() {
  return (
    <EditorialImageStack
      backgroundImages={backgroundImages}
      foregroundImages={foregroundImages}
      count={20}
      interval={500}
      transitionMs={120}
      centerScale={1}
      autoRotate={true}
      className="h-[700px] w-full"
      ariaLabel="Editorial radial card stack"
    />
  )
}`;

export async function EditorialImageStackDocs() {
  const sourceCode =
    (await readComponentSource("editorial-image-stack")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Editorial Image Stack"
      description="A radial pinwheel of N square cards stacked on the same center point, each rotated by its own increment so only the corners stick out around a stable center card. Colors hand off to their neighbor on every smooth step."
      preview={
        <EditorialImageStack
          backgroundImages={editorialImageStackBackgroundItems}
          foregroundImages={editorialImageStackForegroundItems}
          className="h-full min-h-0"
          ariaLabel="Editorial image stack gallery"
        />
      }
      previewCode={defaultCode}
      installPackageName="editorial-image-stack"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/editorial-image-stack.tsx"
      importCode={`"use client";

import {
  EditorialImageStack,
  type EditorialImageStackImage,
} from "@/components/ui/editorial-image-stack";`}
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          Every ring card is the same size as the center card and stacked at
          the same center point (
          <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
            position: absolute; inset: 0
          </code>
          ), each rotated by{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
            i * step
          </code>
          around its own center. Only the corners and edges that extend beyond
          the front card are visible, forming a circular pinwheel silhouette.
          The whole ring is driven by a single{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
            requestAnimationFrame
          </code>
          loop: one wrapper element is rotated by the accumulated angle (one
          step every{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
            interval
          </code>
          ), while each card keeps its static offset — so only one transform is
          animated per tick. Drift continues slowly between steps and stops
          under{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[12px] text-foreground">
            prefers-reduced-motion
          </code>
          .
        </p>
      }
      fullWidthPreview
      props={[
        {
          name: "backgroundImages",
          type: "EditorialImageStackImage[]",
          description:
            "Ring card face images. Each card is stacked at the center and rotated by i * step; only corners extending past the center card are visible.",
        },
        {
          name: "foregroundImages",
          type: "EditorialImageStackImage[]",
          description:
            "Center card images, cycled in sync with each rotation step. Each item should include a meaningful alt description.",
        },
        {
          name: "count",
          type: "number",
          default: "20",
          description:
            "Number of ring cards. Angle step is 360 / count (18° for 20 cards).",
        },
        {
          name: "cardSize",
          type: "number",
          default: "330",
          description:
            "Fixed card size in pixels. If omitted, scales responsively with the parent container via --stack-size.",
        },
        {
          name: "centerSize",
          type: "number",
          default: "cardSize",
          description: "Center card size in pixels. Defaults to the card size.",
        },
        {
          name: "centerScale",
          type: "number",
          default: "1",
          description:
            "Multiplier applied to cardSize to derive centerSize when centerSize is not set.",
        },
        {
          name: "interval",
          type: "number",
          default: "3000",
          description: "Milliseconds between rotation steps.",
        },
        {
          name: "switchIntervalMs",
          type: "number",
          default: "3000",
          description: "Alias for interval.",
        },
        {
          name: "transitionMs",
          type: "number",
          default: "500",
          description:
            "Step transition duration in milliseconds. Only transform is animated.",
        },
        {
          name: "rotationStep",
          type: "number",
          default: "360 / count",
          description: "Degrees per step.",
        },
        {
          name: "driftSpeed",
          type: "number",
          default: "0.75",
          description: "Continuous drift in degrees per second between steps.",
        },
        {
          name: "autoRotate",
          type: "boolean",
          default: "true",
          description:
            "Whether the stack auto-steps and drifts. Center image still changes when false.",
        },
        {
          name: "backdropText",
          type: "string",
          description:
            "Optional large background typography behind the ring, visible at the edges.",
        },
        {
          name: "easing",
          type: "string",
          default: '"cubic-bezier(0.22, 1, 0.36, 1)"',
          description: "CSS easing for step transitions.",
        },
        {
          name: "palette",
          type: "readonly string[]",
          description:
            "Override the default 5-color cycle: white, black, light grey, black, rust orange.",
        },
        {
          name: "cards",
          type: "RadialCardStackItem[]",
          description:
            "Explicit per-card data (color, image, label). Overrides the generated palette cycle.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Editorial image stack"',
          description:
            "Accessible name for the stack region. Ring cards are aria-hidden.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes for the root. Give the stack a height context.",
        },
      ]}
    />
  );
}
