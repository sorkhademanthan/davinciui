import { DocsPageLayout } from "@/components/docs-page-layout";
import { GeometricTrailCursorPreview } from "@/components/docs/previews/geometric-trail-cursor-preview";
import { GeometricTrailCursorExampleStage } from "@/components/docs/previews/geometric-trail-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { GeometricTrailCursor } from "@/components/ui/geometric-trail-cursor"

export function App() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <GeometricTrailCursor activeColor="#22D3EE" />
      {/* Your app remains fully interactive above the effect. */}
    </main>
  )
}`;

export async function GeometricTrailCursorDocs() {
  const sourceCode =
    (await readComponentSource("geometric-trail-cursor")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Geometric Trail Cursor"
      description="A fullscreen procedural wireframe cursor history on pure black. Pointer movement extrudes twisting chains of outlined polygons along the exact cursor path. New shapes cycle through vivid hues before settling into a long-lived near-black geometric skeleton."
      preview={<GeometricTrailCursorPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="geometric-trail-cursor"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/geometric-trail-cursor.tsx"
      examples={[
        {
          title: "Cyan geometry trail",
          preview: <GeometricTrailCursorExampleStage />,
          code: `"use client"

import { useRef } from "react"
import { GeometricTrailCursor } from "@/components/ui/geometric-trail-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <GeometricTrailCursor containerRef={ref} activeColor="#22d3ee" />
    </div>
  )
}`,
        },
        {
          title: "Hue cycling",
          preview: (
            <GeometricTrailCursorExampleStage
              activeColor="#f97316"
              colorCycle
              label="Every shape shifts hue"
            />
          ),
          code: `"use client"

import { useRef } from "react"
import { GeometricTrailCursor } from "@/components/ui/geometric-trail-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <GeometricTrailCursor containerRef={ref} activeColor="#f97316" colorCycle />
    </div>
  )
}`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "activeColor",
          type: "string",
          default: '"#22D3EE"',
          description:
            "Stroke color for the newest geometry around the pointer.",
        },
        {
          name: "colorCycle",
          type: "boolean",
          default: "true",
          description:
            "Cycle newly emitted geometry through hues derived from activeColor.",
        },
        {
          name: "colorCycleSpeed",
          type: "number",
          default: "40",
          description: "Hue rotation speed in degrees per second.",
        },
        {
          name: "ghostColor",
          type: "string",
          default: '"#181818"',
          description:
            "Wireframe color the trail settles into after the active phase.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#000000"',
          description: "Canvas clear color.",
        },
        {
          name: "minSize",
          type: "number",
          default: "16",
          description: "Minimum polygon diameter in CSS pixels.",
        },
        {
          name: "maxSize",
          type: "number",
          default: "150",
          description: "Maximum polygon diameter reached on fast flicks.",
        },
        {
          name: "spacing",
          type: "number",
          default: "16",
          description:
            "Distance in CSS pixels between emitted shapes along the path.",
        },
        {
          name: "density",
          type: "number",
          default: "1",
          description:
            "Multiplier on the number of shapes emitted per distance travelled.",
        },
        {
          name: "velocityScale",
          type: "number",
          default: "1.4",
          description: "How strongly pointer speed inflates polygon size.",
        },
        {
          name: "rotationAmount",
          type: "number",
          default: "0.15",
          description:
            "Per-shape rotation step along a chain (radians) — the tunnel twist.",
        },
        {
          name: "activeDuration",
          type: "number",
          default: "180",
          description:
            "How long newborn geometry stays vivid before fading into the dark wireframe.",
        },
        {
          name: "colorFadeDuration",
          type: "number",
          default: "520",
          description:
            "How quickly vivid shapes settle into the dark wireframe.",
        },
        {
          name: "ghostDuration",
          type: "number",
          default: "persistence-derived (~22000)",
          description:
            "How long aged geometry persists as a ghost, in milliseconds.",
        },
        {
          name: "persistence",
          type: "number",
          default: "0.9",
          description:
            "0–1 shortcut for trail longevity when ghostDuration is unset.",
        },
        {
          name: "strokeWidth",
          type: "number",
          default: "1.5",
          description: "Base stroke width in CSS pixels.",
        },
        {
          name: "glow",
          type: "number",
          default: "6",
          description:
            "Subtle shadowBlur applied only to the bright active head. 0 disables it.",
        },
        {
          name: "minSides",
          type: "number",
          default: "3",
          description: "Minimum polygon side count.",
        },
        {
          name: "maxSides",
          type: "number",
          default: "6",
          description: "Maximum polygon side count.",
        },
        {
          name: "maxShapes",
          type: "number",
          default: "1200",
          description: "Buffer cap. Oldest shapes are dropped first.",
        },
        {
          name: "enabled",
          type: "boolean",
          default: "true",
          description:
            "Master switch — when false nothing is tracked or drawn.",
        },
        {
          name: "respectReducedMotion",
          type: "boolean",
          default: "true",
          description:
            "Honor prefers-reduced-motion by freezing trail generation.",
        },
        {
          name: "enableTouch",
          type: "boolean",
          default: "false",
          description: "Generate trails from touch movement.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "50",
          description: "Overlay stacking order.",
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
