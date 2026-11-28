import React from "react";
import { SilkAurora } from "@workspace/ui/components/silk-aurora";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { SilkAuroraPlayground, SilkAuroraPersonalizePanel } from "@/components/docs/previews/playgrounds/silk-aurora";
import { readComponentSource } from "@/lib/source-code";

const basicUsageCode = `import { SilkAurora } from "@/components/ui/silk-aurora"

<div className="relative h-[560px] w-full overflow-hidden">
  <SilkAurora
    baseColor="#060505"
    midColor="#19130f"
    sheenColor="#ffe2a9"
    accentColor="#c58d5d"
    intensity={0.9}
    speed={0.75}
    className="h-full w-full"
  />
  <div className="absolute inset-0 flex items-center justify-center text-center">
    <span className="text-5xl font-black uppercase tracking-[-0.055em] text-white">
      DAVINCIUI
    </span>
  </div>
</div>`;

export async function SilkAuroraDocs() {
  const sourceCode =
    (await readComponentSource("silk-aurora")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Silk Aurora"
      description="A premium WebGL hero background with satin-dark aurora ribbons, pearlescent highlights, subtle grain, and optional cursor depth."
      preview={<SilkAuroraPlayground />}
      personalizeContent={<SilkAuroraPersonalizePanel />}
      previewCode={basicUsageCode}
      installPackageName="silk-aurora"
      installSourceCode={sourceCode}
      usageCode={basicUsageCode}
      examples={[
        {
          title: "Cool violet aurora",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <SilkAurora
                baseColor="#04060d"
                midColor="#0b1224"
                sheenColor="#a5b4fc"
                accentColor="#38bdf8"
                intensity={1.1}
                speed={0.6}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { SilkAurora } from "@/components/ui/silk-aurora"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <SilkAurora
    baseColor="#04060d"
    midColor="#0b1224"
    sheenColor="#a5b4fc"
    accentColor="#38bdf8"
    intensity={1.1}
    speed={0.6}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "With editorial content",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <SilkAurora
                title="Aurora"
                subtitle="Signal in the dark"
                baseColor="#060505"
                midColor="#19130f"
                sheenColor="#ffe2a9"
                accentColor="#c58d5d"
                intensity={0.9}
                speed={0.5}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { SilkAurora } from "@/components/ui/silk-aurora"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <SilkAurora
    title="Aurora"
    subtitle="Signal in the dark"
    baseColor="#060505"
    midColor="#19130f"
    sheenColor="#ffe2a9"
    accentColor="#c58d5d"
    intensity={0.9}
    speed={0.5}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "title",
          type: "string",
          default: '"Silk Aurora"',
          description: "Primary hero headline rendered above the background.",
        },
        {
          name: "subtitle",
          type: "string",
          default: '"Premium Atmosphere"',
          description: "Small uppercase label rendered above the title.",
        },
        {
          name: "description",
          type: "string",
          description: "Supporting copy rendered below the title.",
        },
        {
          name: "baseColor",
          type: "string",
          default: '"#050507"',
          description: "Deepest background color.",
        },
        {
          name: "midColor",
          type: "string",
          default: '"#14151d"',
          description: "Secondary base color for atmospheric depth.",
        },
        {
          name: "sheenColor",
          type: "string",
          default: '"#f4dfb8"',
          description: "Pearlescent highlight color.",
        },
        {
          name: "accentColor",
          type: "string",
          default: '"#6ed6c9"',
          description: "Aurora ribbon accent color.",
        },
        {
          name: "speed",
          type: "number",
          default: "0.85",
          description: "Global animation speed multiplier.",
        },
        {
          name: "intensity",
          type: "number",
          default: "1",
          description: "Strength of aurora ribbons, glints, and sheen.",
        },
        {
          name: "grain",
          type: "number",
          default: "0.85",
          description: "Amount of fine shader grain.",
        },
        {
          name: "vignette",
          type: "number",
          default: "1",
          description: "Edge darkening strength.",
        },
        {
          name: "mouseInfluence",
          type: "number",
          default: "1",
          description: "Cursor-driven distortion strength.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description: "Enables pointer movement response.",
        },
        {
          name: "children",
          type: "ReactNode",
          description: "Custom content rendered above the background.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes for the root container.",
        },
      ]}
    />
  );
}
