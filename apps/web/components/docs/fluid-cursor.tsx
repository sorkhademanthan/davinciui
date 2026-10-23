import { DocsPageLayout } from "@/components/docs-page-layout";
import { FluidCursorPreview } from "@/components/docs/previews/fluid-cursor-preview";
import { FluidCursorExampleStage } from "@/components/docs/previews/fluid-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { FluidCursor } from "@/components/ui/fluid-cursor"

export function App() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <FluidCursor />
      {/* Your app remains fully interactive above the effect. */}
    </main>
  )
}`;

export async function FluidCursorDocs() {
  const sourceCode =
    (await readComponentSource("fluid-cursor")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Fluid Cursor"
      description="A fullscreen GPU fluid simulation on near-black. Pointer movement injects velocity and spectral dye into a persistent velocity field with vorticity confinement and pressure solving, so colorful liquid keeps drifting, curling, and fading after the cursor leaves."
      preview={<FluidCursorPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="fluid-cursor"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/fluid-cursor.tsx"
      examples={[
        {
          title: "Standard fluid trail",
          preview: <FluidCursorExampleStage />,
          code: `"use client"

import { useRef } from "react"
import { FluidCursor } from "@/components/ui/fluid-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <FluidCursor containerRef={ref} intensity={1} curl={28} zIndex={10} />
    </div>
  )
}`,
        },
        {
          title: "Thicker, slower dye",
          preview: (
            <FluidCursorExampleStage
              intensity={1.6}
              curl={18}
              label="Heavier fluid"
            />
          ),
          code: `"use client"

import { useRef } from "react"
import { FluidCursor } from "@/components/ui/fluid-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <FluidCursor containerRef={ref} intensity={1.6} curl={18} zIndex={10} />
    </div>
  )
}`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "backgroundColor",
          type: "string",
          default: "theme-aware (#000000 dark / #ffffff light)",
          description:
            "Canvas clear color. An explicit value always wins over the theme.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Color scheme. Auto follows the site theme live; the canvas background adapts without rebuilding the simulation.",
        },
        {
          name: "intensity",
          type: "number",
          default: "1",
          description: "Global multiplier for splat force and dye amount.",
        },
        {
          name: "trailSize",
          type: "number",
          default: "0.22",
          description:
            "Splat radius scale. 0.2–0.25 produces broad flowing masses.",
        },
        {
          name: "force",
          type: "number",
          default: "1",
          description: "Velocity force injected per pointer travel.",
        },
        {
          name: "curl",
          type: "number",
          default: "28",
          description:
            "Vorticity confinement strength. 20–35 gives visible curls and folds.",
        },
        {
          name: "velocityDissipation",
          type: "number",
          default: "0.992",
          description:
            "Per-frame velocity retention at 60fps. Higher = longer inertia.",
        },
        {
          name: "dyeDissipation",
          type: "number",
          default: "0.975",
          description:
            "Per-frame dye retention at 60fps. Higher = longer visible trails.",
        },
        {
          name: "densityDissipation",
          type: "number",
          description: "Alias for dyeDissipation.",
        },
        {
          name: "colorSpeed",
          type: "number",
          default: "0.12",
          description: "Injected hue drift in spectrum cycles per second.",
        },
        {
          name: "brightness",
          type: "number",
          default: "1",
          description: "Overall exposure multiplier.",
        },
        {
          name: "glow",
          type: "number",
          default: "0.15",
          description: "Subtle halo around dense fluid. 0 disables it.",
        },
        {
          name: "saturation",
          type: "number",
          default: "0.85",
          description: "Color saturation of the injected dye (0–1).",
        },
        {
          name: "colorMode",
          type: '"spectral" | "ocean" | "sunset" | "mono"',
          default: '"spectral"',
          description: "Palette behavior. Spectral matches the reference.",
        },
        {
          name: "resolution",
          type: "number",
          default: "128",
          description:
            "Simulation grid resolution. Dye uses a higher fixed grid.",
        },
        {
          name: "pressureIterations",
          type: "number",
          default: "20",
          description: "Pressure solver iterations (clamped 4–40).",
        },
        {
          name: "pointerSmoothing",
          type: "number",
          default: "0.18",
          description:
            "Injection-point easing (0–1). Lower = heavier smoothing.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description: "Cap for devicePixelRatio.",
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
