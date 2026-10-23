import React from "react";
import { LENS_DRIFT_ITEMS } from "@workspace/ui/components/lens-drift-grid";
import { LensDriftGrid } from "@workspace/ui/components/lens-drift-grid";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { LensDriftGrid } from "@/components/ui/lens-drift-grid"

export default function Gallery() {
  return (
    <LensDriftGrid
      className="h-full min-h-[620px] w-full"
      autoDrift
    />
  )
}`;

export async function LensDriftGridDocs() {
  const sourceCode =
    (await readComponentSource("lens-drift-grid")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Lens Drift Grid"
      description="A seamless two-axis image wall warped as one continuous fisheye surface, with dense editorial tiles, weighted drag navigation, and a gentle idle auto-drift that yields to touch."
      preview={<LensDriftGrid className="h-full w-full" autoDrift />}
      previewCode={defaultCode}
      installPackageName="lens-drift-grid"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/lens-drift-grid.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Ambient dark field",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <LensDriftGrid autoDrift className="h-full w-full" />
            </div>
          ),
          code: `import { LensDriftGrid } from "@/components/ui/lens-drift-grid"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <LensDriftGrid autoDrift className="h-full w-full" />
</div>`,
        },
        {
          title: "Light, shallow lens",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <LensDriftGrid
                items={LENS_DRIFT_ITEMS}
                theme="light"
                lensStrength={0.4}
                tileWidth={150}
                tileHeight={190}
                gap={10}
                autoDrift={{ x: 10, y: 5 }}
                interactive={false}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { LensDriftGrid } from "@/components/ui/lens-drift-grid"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <LensDriftGrid
    items={items}
    theme="light"
    lensStrength={0.4}
    tileWidth={150}
    tileHeight={190}
    gap={10}
    autoDrift={{ x: 10, y: 5 }}
    interactive={false}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "items",
          type: "LensDriftItem[]",
          default: "Built-in editorial motion collection",
          description:
            "Images and labels repeated across the seamless two-axis grid.",
        },
        {
          name: "tileWidth",
          type: "number",
          default: "238",
          description: "Width of each gallery tile in CSS pixels.",
        },
        {
          name: "tileHeight",
          type: "number",
          default: "272",
          description: "Height of each gallery tile in CSS pixels.",
        },
        {
          name: "gap",
          type: "number",
          default: "0",
          description: "Space between adjacent grid tiles in CSS pixels.",
        },
        {
          name: "lensStrength",
          type: "number",
          default: "0.24",
          description:
            "Intensity of the center-weighted bend. Use 0 for a flat grid.",
        },
        {
          name: "theme",
          type: '"dark" | "light" | "system"',
          default: '"system"',
          description:
            "Color treatment for the grid surface, tile chrome, labels, and depth vignette. System follows the active page or OS theme.",
        },
        {
          name: "hoverNudge",
          type: "number",
          default: "16",
          description:
            "Distance of the small reversible motion shown when a mouse enters the grid.",
        },
        {
          name: "inertia",
          type: "number",
          default: "0.94",
          description:
            "Momentum retained after drag release. Values are clamped between 0 and 0.98.",
        },
        {
          name: "wheelSensitivity",
          type: "number",
          default: "0.42",
          description:
            "Trackpad and mouse-wheel response. Lower values create a slower, heavier pan.",
        },
        {
          name: "autoDrift",
          type: "boolean | { x?: number; y?: number }",
          default: "false",
          description:
            "Slow idle self-motion in px/sec. True uses a gentle diagonal drift. Pauses on interaction and resumes after driftResumeMs. Ignored under reduced motion.",
        },
        {
          name: "driftResumeMs",
          type: "number",
          default: "2400",
          description:
            "Stillness in milliseconds after interaction before auto-drift resumes.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description:
            "When false, hover, drag, wheel, and keyboard input are disabled and only autoDrift drives the animation. Use for ambient auto-playing previews.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes applied to the root container.",
        },
      ]}
    />
  );
}
