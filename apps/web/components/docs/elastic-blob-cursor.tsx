import { DocsPageLayout } from "@/components/docs-page-layout";
import { ElasticBlobCursorPreview } from "@/components/docs/previews/elastic-blob-cursor-preview";
import { ElasticBlobCursorExampleStage } from "@/components/docs/previews/elastic-blob-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { ElasticBlobCursor } from "@/components/ui/elastic-blob-cursor"

export function App() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <ElasticBlobCursor />
      {/* Your app remains fully interactive above the effect. */}
    </main>
  )
}`;

export async function ElasticBlobCursorDocs() {
  const sourceCode =
    (await readComponentSource("elastic-blob-cursor")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      hideExamples
      title="Elastic Blob Cursor"
      description="A soft white blob that chases the pointer with inertia, stretches along the direction of travel, and relaxes back into a circle when you slow down."
      preview={<ElasticBlobCursorPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="elastic-blob-cursor"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/elastic-blob-cursor.tsx"
      examples={[
        {
          title: "Rounded dark blob",
          preview: <ElasticBlobCursorExampleStage />,
          code: `"use client"

import { useRef } from "react"
import { ElasticBlobCursor } from "@/components/ui/elastic-blob-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <ElasticBlobCursor containerRef={ref} mode="container" size={56} />
    </div>
  )
}`,
        },
        {
          title: "High stretch",
          preview: (
            <ElasticBlobCursorExampleStage
              size={44}
              color="#f97316"
              maxStretch={2.4}
              label="Flick harder"
            />
          ),
          code: `"use client"

import { useRef } from "react"
import { ElasticBlobCursor } from "@/components/ui/elastic-blob-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <ElasticBlobCursor
        containerRef={ref}
        mode="container"
        size={44}
        color="#f97316"
        maxStretch={2.4}
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
          name: "size",
          type: "number",
          default: "60",
          description: "Blob diameter in pixels at rest.",
        },
        {
          name: "color",
          type: "string",
          default: '"#FFFFFF"',
          description: "Solid fill. Used for both themes unless overridden.",
        },
        {
          name: "lightColor",
          type: "string",
          default: '"#18181B"',
          description:
            "Fill on light backgrounds (only when color is default).",
        },
        {
          name: "darkColor",
          type: "string",
          description: "Fill on dark backgrounds. Defaults to color.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description: "Color scheme. Auto follows the site theme live.",
        },
        {
          name: "followStrength",
          type: "number",
          default: "0.16",
          description:
            "Position interpolation per frame (0.12–0.20). Higher is tighter.",
        },
        {
          name: "maxStretch",
          type: "number",
          default: "1.4",
          description:
            "Maximum stretch along travel (1.4 = 140% width at full speed).",
        },
        {
          name: "compression",
          type: "number",
          default: "0.22",
          description:
            "Maximum cross-axis compression amount (0.22 → down to 78% height).",
        },
        {
          name: "velocitySensitivity",
          type: "number",
          default: "0.8",
          description: "How strongly pointer speed maps to deformation.",
        },
        {
          name: "rotationSmoothing",
          type: "number",
          default: "0.15",
          description: "Shortest-arc rotation interpolation per frame.",
        },
        {
          name: "deformationSmoothing",
          type: "number",
          default: "0.18",
          description:
            "Stretch interpolation while deforming; recovery is slower.",
        },
        {
          name: "mode",
          type: '"global" | "container"',
          default: '"global"',
          description:
            "Follow across the viewport, or stay inside containerRef.",
        },
        {
          name: "hideNativeCursor",
          type: "boolean",
          default: "true",
          description:
            "Hide the browser cursor while active on fine-pointer devices.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "9999",
          description: "Overlay stacking order.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Turn the cursor off without unmounting it.",
        },
        {
          name: "disableManualInput",
          type: "boolean",
          default: "false",
          description:
            "Ignore real pointer input; follow only synthetic/programmatic movement (self-playing previews).",
        },
        {
          name: "containerRef",
          type: "RefObject<HTMLElement>",
          description:
            "Host that constrains tracking/rendering. Required for container mode.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional class name applied to the cursor element.",
        },
      ]}
    />
  );
}
