import { DocsPageLayout } from "@/components/docs-page-layout";
import { TubesCursorPreview } from "@/components/docs/previews/tubes-cursor-preview";
import { TubesCursorExampleStage } from "@/components/docs/previews/tubes-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { TubesCursor } from "@/components/ui/tubes-cursor"

export function App() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <TubesCursor />
      {/* Your app remains fully interactive above the effect. */}
    </main>
  )
}`;

export async function TubesCursorDocs() {
  const sourceCode =
    (await readComponentSource("tubes-cursor")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Tubes Cursor"
      description="A bundle of glowing 3D neon tubes that chases the pointer with fluid inertia, smooth spline curvature, and soft bloom. Clicking randomizes the palette."
      preview={<TubesCursorPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="tubes-cursor"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/tubes-cursor.tsx"
      examples={[
        {
          title: "Violet tube bundle",
          preview: <TubesCursorExampleStage />,
          code: `"use client"

import { useRef } from "react"
import { TubesCursor } from "@/components/ui/tubes-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <TubesCursor containerRef={ref} quality="medium" idleMotion />
    </div>
  )
}`,
        },
        {
          title: "Warm tube palette",
          preview: (
            <TubesCursorExampleStage
              tubeColors={["#f97316", "#f43f5e", "#fbbf24"]}
              lightColors={["#fb923c", "#f43f5e", "#fbbf24", "#fde68a"]}
              label="Warm bundle"
            />
          ),
          code: `"use client"

import { useRef } from "react"
import { TubesCursor } from "@/components/ui/tubes-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <TubesCursor
        containerRef={ref}
        tubeColors={["#f97316", "#f43f5e", "#fbbf24"]}
        lightColors={["#fb923c", "#f43f5e", "#fbbf24", "#fde68a"]}
      />
    </div>
  )
}`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "tubeColors",
          type: "string[]",
          default: '["#5e72e4", "#8965e0", "#f5365c"]',
          description:
            "Tube body colors sampled along the bundle. Updates live.",
        },
        {
          name: "lightColors",
          type: "string[]",
          default: '["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"]',
          description:
            "Four point-light colors tinting the tubes and bloom. Updates live.",
        },
        {
          name: "lightIntensity",
          type: "number",
          default: "200",
          description: "Intensity of the point lights. Updates live.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Color scheme. Auto follows the site theme live; light renders bloom-free over transparency.",
        },
        {
          name: "tubeCount",
          type: "number",
          default: "16",
          description: "Number of tubes in the bundle. Applied on init.",
        },
        {
          name: "bloomThreshold",
          type: "number",
          default: "0",
          description: "Bloom threshold. Applied on init.",
        },
        {
          name: "bloomStrength",
          type: "number",
          default: "1.5",
          description: "Bloom strength. Applied on init.",
        },
        {
          name: "bloomRadius",
          type: "number",
          default: "0.5",
          description: "Bloom radius. Applied on init.",
        },
        {
          name: "randomizeOnClick",
          type: "boolean",
          default: "true",
          description:
            "Clicking the interaction area generates a new tube and light palette.",
        },
        {
          name: "idleMotion",
          type: "boolean",
          default: "true",
          description:
            "Ambient drift while the pointer is outside the canvas. False parks the bundle at center. Applied on init.",
        },
        {
          name: "quality",
          type: '"low" | "medium" | "high"',
          default: '"high"',
          description: "Rendering detail and DPR cap. Updates live.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "10",
          description: "Overlay stacking order.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Turns the decorative overlay off without unmounting it.",
        },
        {
          name: "containerRef",
          type: "RefObject<HTMLElement>",
          description:
            "Optionally constrain pointer tracking and rendering to a positioned host.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional class name applied to the overlay wrapper.",
        },
        {
          name: "children",
          type: "ReactNode",
          description: "Content layered above the effect.",
        },
      ]}
    />
  );
}
