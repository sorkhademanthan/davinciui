import { Noiser } from "@workspace/ui/components/noiser";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  NoiserPlayground,
  NoiserPersonalizePanel,
} from "@/components/docs/previews/hero-background-playgrounds";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import Noiser from "@/components/ui/noiser"

<section className="relative min-h-[32rem] overflow-hidden bg-zinc-950">
  <Noiser
    noiseType="gaussian"
    frequency={0.26}
    octaves={2}
    colorMode="mono"
    monoColor="#ffffff"
    noiseOpacity={0.3}
    animated
    fps={12}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

export async function NoiserDocs() {
  const sourceCode =
    (await readComponentSource("noiser")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Noiser"
      description="Fine procedural grain for hero backgrounds, rendered with responsive SVG turbulence filters."
      preview={<NoiserPlayground />}
      personalizeContent={<NoiserPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="noiser"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/noiser.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Three-color animated grain",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-zinc-950">
              <Noiser
                noiseType="gaussian"
                colorMode="multi"
                colorA="#f97316"
                colorB="#ec4899"
                colorC="#22d3ee"
                noiseOpacity={0.5}
                colorOpacity={0.6}
                frequency={0.32}
                octaves={3}
                animated
                fps={18}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import Noiser from "@/components/ui/noiser"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <Noiser
    noiseType="gaussian"
    colorMode="multi"
    colorA="#f97316"
    colorB="#ec4899"
    colorC="#22d3ee"
    noiseOpacity={0.5}
    colorOpacity={0.6}
    frequency={0.32}
    octaves={3}
    animated
    fps={18}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Static monochrome",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-zinc-950">
              <Noiser
                noiseType="uniform"
                colorMode="mono"
                monoColor="#ffffff"
                frequency={0.4}
                octaves={4}
                noiseOpacity={0.22}
                animated={false}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import Noiser from "@/components/ui/noiser"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <Noiser
    noiseType="uniform"
    colorMode="mono"
    monoColor="#ffffff"
    frequency={0.4}
    octaves={4}
    noiseOpacity={0.22}
    animated={false}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "noiseType",
          type: "enum",
          default: '"gaussian"',
          description:
            "Gaussian maps to fractalNoise; Uniform maps to turbulence.",
        },
        {
          name: "frequency",
          type: "number",
          default: "0.26",
          description:
            "Turbulence baseFrequency; higher values create finer grain.",
        },
        {
          name: "octaves",
          type: "number",
          default: "2",
          description: "Number of noise detail layers.",
        },
        {
          name: "seed",
          type: "number",
          default: "8",
          description: "Starting noise seed.",
        },
        {
          name: "colorMode",
          type: "enum",
          default: '"mono"',
          description: "Mono, Duo, or Multi noise coloring.",
        },
        {
          name: "monoColor / colorA / colorB / colorC",
          type: "string",
          description: "Color values shown for the selected color mode.",
        },
        {
          name: "noiseOpacity",
          type: "number",
          default: "0.3",
          description: "Overall strength of the noise mask.",
        },
        {
          name: "colorOpacity",
          type: "number",
          default: "0.8",
          description: "Color-layer strength in Duo and Multi modes.",
        },
        {
          name: "animated",
          type: "boolean",
          default: "true",
          description: "Evolve the seed at the selected frame rate.",
        },
        {
          name: "fps",
          type: "number",
          default: "12",
          description: "Animation update rate from 1 to 60 FPS.",
        },
      ]}
    />
  );
}
