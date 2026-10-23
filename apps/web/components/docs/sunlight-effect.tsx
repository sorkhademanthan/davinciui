import { SunlightEffect } from "@workspace/ui/components/sunlight-effect";
import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SunlightEffectPersonalizePanel,
  SunlightEffectPreview,
} from "@/components/docs/previews/sunlight-effect-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { SunlightEffect } from "@/components/ui/sunlight-effect"

<section className="relative min-h-screen overflow-hidden">
  <SunlightEffect
    colors={["#55ffad", "#27ffc6", "#d4ff58", "#f4ffd2", "#00df9d"]}
    backgroundColor="#020b07"
    bloomColor="#6dff94"
    bloom={1.12}
    intensity={1.35}
    density={1}
    spotty={0.18}
    midSize={0.82}
    midIntensity={1.72}
    speed={1.2}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function SunlightEffectNotes() {
  return (
    <>
      <Section title="About Sunlight Effect" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            Animated rays radiate from a bright central glow, with long mint,
            lime, and teal shafts fading into deep green shadow.
          </p>
          <p>
            Build a palette with up to five colors, tune the number and reach of
            the rays, and add a separate bloom color for atmospheric light. The
            motion carries light from every edge toward the center while the
            whole overlay stays anchored behind your content.
          </p>
          <p>
            The effect uses a small native WebGL shader with no runtime shader
            library. It fills its parent at every size and redraws when the
            container changes dimensions.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Colors</strong> distributes up
            to five tones across the ray field.
          </li>
          <li>
            <strong className="text-foreground">Bloom</strong> adds a separate
            soft glow around the center.
          </li>
          <li>
            <strong className="text-foreground">Density and Spotty</strong>
            control how many rays appear and how far they extend.
          </li>
          <li>
            <strong className="text-foreground">Mid Size and Intensity</strong>
            shape the luminous center.
          </li>
          <li>
            <strong className="text-foreground">Speed</strong> controls the
            inward light motion. Set it to 0 to hold one frame.
          </li>
          <li>
            <strong className="text-foreground">
              Scale, Rotation, and Offset
            </strong>
            position the burst behind your composition.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Dramatic hero backgrounds, logo reveals, launch pages, energy bursts,
          and atmospheric light behind large type.
        </p>
      </Section>
    </>
  );
}

export async function SunlightEffectDocs() {
  const sourceCode =
    (await readComponentSource("sunlight-effect")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Sunlight Effect"
      description="Animated multi-color rays radiating from a bright central glow, with adjustable density, reach, bloom, and motion."
      preview={<SunlightEffectPreview />}
      personalizeContent={<SunlightEffectPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="sunlight-effect"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/sunlight-effect.tsx"
      examples={[
        {
          title: "Mint ray burst",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <SunlightEffect className="h-full w-full" />
            </div>
          ),
          code: `import { SunlightEffect } from "@/components/ui/sunlight-effect"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <SunlightEffect className="h-full w-full" />
</div>`,
        },
        {
          title: "Amber dusk",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <SunlightEffect
                colors={["#ffd9a0", "#ffb066", "#ff8c42", "#ff6b35", "#ffa94d"]}
                backgroundColor="#140b05"
                bloomColor="#ffb066"
                bloom={1}
                intensity={1.2}
                speed={0.6}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { SunlightEffect } from "@/components/ui/sunlight-effect"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <SunlightEffect
    colors={["#ffd9a0", "#ffb066", "#ff8c42", "#ff6b35", "#ffa94d"]}
    backgroundColor="#140b05"
    bloomColor="#ffb066"
    bloom={1}
    intensity={1.2}
    speed={0.6}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "colors",
          type: "string[]",
          default: "five-color mint palette",
          description: "One to five colors distributed across the light rays.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#020b07"',
          description: "Base color behind the burst.",
        },
        {
          name: "bloomColor",
          type: "string",
          default: '"#6dff94"',
          description: "Color of the atmospheric central glow.",
        },
        {
          name: "bloom",
          type: "number",
          default: "1.12",
          description: "Strength and reach of the bloom overlay.",
        },
        {
          name: "intensity",
          type: "number",
          default: "1.35",
          description: "Overall visibility and brightness of the rays.",
        },
        {
          name: "density",
          type: "number",
          default: "1.2",
          description: "Number of broad and fine light rays.",
        },
        {
          name: "spotty",
          type: "number",
          default: "0.18",
          description: "Shortens and separates rays as it increases.",
        },
        {
          name: "midSize",
          type: "number",
          default: "0.82",
          description: "Radius of the bright central glow.",
        },
        {
          name: "midIntensity",
          type: "number",
          default: "1.72",
          description: "Brightness of the central glow.",
        },
        {
          name: "speed",
          type: "number",
          default: "1",
          description: "Animation speed. Set to 0 to freeze the field.",
        },
        {
          name: "scale / rotation / offsetX / offsetY",
          type: "number",
          description: "Scale, rotate, and position the burst origin.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description: "Maximum device pixel ratio used by the canvas.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes applied to the full-size layer.",
        },
      ]}
      afterContent={<SunlightEffectNotes />}
    />
  );
}
