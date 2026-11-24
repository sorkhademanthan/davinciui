import { PixelFlow } from "@workspace/ui/components/pixel-flow";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import { PixelFlowPlayground, PixelFlowPersonalizePanel } from "@/components/docs/previews/pixel-flow-preview";
import { readComponentSource } from "@/lib/source-code";

const basicUsageCode = `import { PixelFlow } from "@/components/ui/pixel-flow"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <PixelFlow preset="reference-purple" />
  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
    <span className="whitespace-nowrap font-black uppercase leading-none tracking-[-0.055em] text-white text-[clamp(3rem,8.5vw,6rem)]">
      DAVINCIUI
    </span>
  </div>
</div>`;

export async function PixelFlowDocs() {
  const sourceCode =
    (await readComponentSource("pixel-flow")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Pixel Flow"
      description="Flowing violet light rendered through a fine, animated dithered pixel field."
      preview={<PixelFlowPlayground />}
      personalizeContent={<PixelFlowPersonalizePanel />}
      previewCode={basicUsageCode}
      installPackageName="pixel-flow"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/pixel-flow.tsx"
      usageCode={
        <LiveCodeBlock slug="pixel-flow" defaultCode={basicUsageCode} />
      }
      examples={[
        {
          title: "Coarse electric blue",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <PixelFlow
                preset="electric-blue"
                pixelSize={8}
                pixelDensity={0.9}
                speed={0.8}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { PixelFlow } from "@/components/ui/pixel-flow"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <PixelFlow
    preset="electric-blue"
    pixelSize={8}
    pixelDensity={0.9}
    speed={0.8}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Fine warm field",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <PixelFlow
                preset="warm"
                pixelSize={4}
                pixelDensity={1.3}
                ditherStrength={0.8}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { PixelFlow } from "@/components/ui/pixel-flow"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <PixelFlow
    preset="warm"
    pixelSize={4}
    pixelDensity={1.3}
    ditherStrength={0.8}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      props={[
        {
          name: "preset",
          type: '"reference-purple" | "monochrome" | "electric-blue" | "aurora" | "warm"',
          default: '"reference-purple"',
          description:
            "Color preset. Explicit color props override the preset.",
        },
        {
          name: "pixelSize",
          type: "number",
          default: "4",
          description:
            "Virtual pixel size in screen pixels. Smaller values densify the grid.",
        },
        {
          name: "pixelDensity",
          type: "number",
          default: "1",
          description:
            "Grid density multiplier. Higher values pack more cells.",
        },
        {
          name: "dotSize",
          type: "number",
          default: "0.2",
          description: "Square dot half-size within a cell, 0 to 0.7 units.",
        },
        {
          name: "dotStrength",
          type: "number",
          default: "0.12",
          description: "Strength of the dark dot matrix overlay.",
        },
        {
          name: "ditherStrength",
          type: "number",
          default: "1",
          description:
            "Ordered pixel coverage. Set to 0 for a continuous color field.",
        },
        {
          name: "speed",
          type: "number",
          default: "0.75",
          description: "Global animation rate.",
        },
        {
          name: "flowStrength",
          type: "number",
          default: "1",
          description: "Advection strength of the time flow.",
        },
        {
          name: "warpStrength",
          type: "number",
          default: "1",
          description: "Domain-warp amplitude of the field.",
        },
        {
          name: "noiseScale",
          type: "number",
          default: "1.7",
          description: "Base sampling frequency of the noise field.",
        },
        {
          name: "octaves",
          type: "number",
          default: "4",
          description: "FBM octave count, 1 to 6.",
        },
        {
          name: "contrast",
          type: "number",
          default: "1.25",
          description: "Field contrast around mid-gray.",
        },
        {
          name: "softness",
          type: "number",
          default: "0.65",
          description: "Softness of palette transitions.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#0d0820"',
          description: "Deepest field color.",
        },
        {
          name: "shadowColor",
          type: "string",
          default: '"#1a1038"',
          description: "Dark violet region color.",
        },
        {
          name: "primaryColor",
          type: "string",
          default: '"#33266b"',
          description: "Muted violet midtone.",
        },
        {
          name: "electricColor",
          type: "string",
          default: '"#6345b8"',
          description: "Soft purple mid-highlight color.",
        },
        {
          name: "secondaryColor",
          type: "string",
          default: '"#796bac"',
          description: "Lavender transition color.",
        },
        {
          name: "highlightColor",
          type: "string",
          default: '"#9789c6"',
          description: "Pale lavender-gray highlight color.",
        },
        {
          name: "brightness",
          type: "number",
          default: "1",
          description: "Post brightness multiplier.",
        },
        {
          name: "saturation",
          type: "number",
          default: "0.92",
          description: "Post saturation multiplier.",
        },
        {
          name: "quality",
          type: "number",
          default: "1",
          description:
            "Backing-store resolution multiplier, 0.25 to 1. Lower values are faster.",
        },
        {
          name: "animate",
          type: "boolean",
          default: "true",
          description: "Set to false to freeze the current composition.",
        },
        {
          name: "pauseWhenOffscreen",
          type: "boolean",
          default: "true",
          description: "Pause rendering while outside the viewport.",
        },
        {
          name: "respectReducedMotion",
          type: "boolean",
          default: "true",
          description: "Render one static frame for reduced-motion users.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description: "Maximum device pixel ratio for the backing buffer.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the outer element.",
        },
      ]}
    />
  );
}
