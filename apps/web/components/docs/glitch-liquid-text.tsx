import { GlitchLiquidText } from "@workspace/ui/components/glitch-liquid-text";

import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  GlitchLiquidTextPlayground,
  GlitchLiquidTextPersonalizePanel,
} from "@/components/docs/previews/glitch-liquid-text-playground";
import { readComponentSource } from "@/lib/source-code";
import { MousePointer } from "lucide-react";

const usageCode = `import { GlitchLiquidText } from "@/components/ui/glitch-liquid-text"

<GlitchLiquidText
  text="DAVINCIUI"
  fontFamily="Anton"
  fontSize={250}
  lineHeight={1.2}
  backgroundColor="#080808"
  textColor="#ffffff"
  distortionStrength={0.42}
  liquidStrength={1}
  starburstStrength={0.28}
  className="h-[560px] w-full"
/>`;

const defaultCode = `import { GlitchLiquidText } from "@/components/ui/glitch-liquid-text"

<GlitchLiquidText
  text="DAVINCIUI"
  fontSize={250}
  lineHeight={1.2}
  distortionStrength={0.42}
  liquidStrength={1}
  starburstStrength={0.28}
  className="h-[560px] w-full"
/>`;

function HoverHint() {
  return (
    <span className="pointer-events-none absolute bottom-5 left-0 right-0 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground/60 select-none">
      <MousePointer className="w-3 h-3" />
      Move across the type — the distortion stays local to the cursor
    </span>
  );
}

export async function GlitchLiquidTextDocs() {
  const sourceCode =
    (await readComponentSource("glitch-liquid-text")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Glitch Liquid Text"
      description="GPU-rendered interactive typography on a dark liquid membrane. The cursor pulls a localized starburst, wave, and pinch through nearby glyphs, with velocity smear and edge-localized RGB separation — while untouched type stays crisp and readable."
      preview={
        <div className="relative h-full min-h-[560px] w-full p-6 sm:p-10">
          <GlitchLiquidTextPlayground />
          <HoverHint />
        </div>
      }
      personalizeContent={<GlitchLiquidTextPersonalizePanel />}
      previewCode={defaultCode}
      fullWidthPreview
      installPackageName="glitch-liquid-text"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/glitch-liquid-text.tsx"
      usageCode={usageCode}
      examples={[
        {
          title: "Light surface, stronger liquid",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <GlitchLiquidText
                text={"LIQUID\nTYPE"}
                fontSize={160}
                textColor="#0f172a"
                backgroundColor="#f5f5f4"
                distortionStrength={0.6}
                liquidStrength={1.4}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { GlitchLiquidText } from "@/components/ui/glitch-liquid-text"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <GlitchLiquidText
    text={"LIQUID\\nTYPE"}
    fontSize={160}
    textColor="#0f172a"
    backgroundColor="#f5f5f4"
    distortionStrength={0.6}
    liquidStrength={1.4}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Ambient glitch, cursor off",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <GlitchLiquidText
                text="NO CURSOR"
                fontSize={150}
                cursorEnabled={false}
                glitchStrength={0.4}
                noiseStrength={0.25}
                textColor="#f5f5f5"
                backgroundColor="#0b0b0b"
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { GlitchLiquidText } from "@/components/ui/glitch-liquid-text"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <GlitchLiquidText
    text="NO CURSOR"
    fontSize={150}
    cursorEnabled={false}
    glitchStrength={0.4}
    noiseStrength={0.25}
    textColor="#f5f5f5"
    backgroundColor="#0b0b0b"
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          default: '"DAVINCIUI"',
          description:
            "Text rendered into the GPU texture. Supports multiline via \\n.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"Anton"',
          description:
            "Font family baked into the text texture. Ensure the font is loaded before mount for crisp results.",
        },
        {
          name: "fontSize",
          type: "number",
          default: "250",
          description:
            "Base type size in CSS px before responsive fit scaling.",
        },
        {
          name: "fontWeight",
          type: "number | string",
          default: "400",
          description: "Font weight baked into the texture.",
        },
        {
          name: "lineHeight",
          type: "number",
          default: "1.2",
          description: "Line-height multiplier for multiline text.",
        },
        {
          name: "letterSpacing",
          type: "number",
          default: "0",
          description: "Tracking in CSS px between characters.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"#ffffff"',
          description: "Glyph color applied in the shader composite.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#080808"',
          description: "Canvas clear color and shader background.",
        },
        {
          name: "distortionStrength",
          type: "number",
          default: "0.42",
          description: "Peak liquid displacement around the cursor.",
        },
        {
          name: "distortionRadius",
          type: "number",
          default: "0.2",
          description: "Interaction field radius in UV units.",
        },
        {
          name: "distortionDecay",
          type: "number",
          default: "3",
          description: "Viscous relaxation rate once the cursor leaves.",
        },
        {
          name: "noiseStrength",
          type: "number",
          default: "0.03",
          description:
            "Amplitude of the animated FBM ripple inside disturbed areas.",
        },
        {
          name: "noiseScale",
          type: "number",
          default: "2.4",
          description: "Spatial frequency of the liquid noise field.",
        },
        {
          name: "noiseSpeed",
          type: "number",
          default: "0.35",
          description: "Temporal evolution speed of the noise.",
        },
        {
          name: "chromaticAberration",
          type: "number",
          default: "0.014",
          description: "Peak RGB channel separation at distorted edges.",
        },
        {
          name: "glitchStrength",
          type: "number",
          default: "0.08",
          description:
            "Intensity of sparse horizontal glitch slices (secondary effect).",
        },
        {
          name: "liquidStrength",
          type: "number",
          default: "1",
          description:
            "Tangential swirl component — higher feels more fluid, less lens-like.",
        },
        {
          name: "starburstStrength",
          type: "number",
          default: "0.28",
          description:
            "High-frequency radial rays that flicker through the cursor field.",
        },
        {
          name: "waveStrength",
          type: "number",
          default: "0.22",
          description: "Concentric ripple that rolls outward from the pointer.",
        },
        {
          name: "pinchStrength",
          type: "number",
          default: "0.22",
          description:
            "Inward pull near the pointer center for a lens-like pinch.",
        },
        {
          name: "velocityInfluence",
          type: "number",
          default: "0.05",
          description:
            "How strongly cursor speed smears the type along motion.",
        },
        {
          name: "lightIntensity",
          type: "number",
          default: "0.14",
          description:
            "Directional light-ray bloom gathered from disturbed glyph edges.",
        },
        {
          name: "grainStrength",
          type: "number",
          default: "0.016",
          description: "Fine monochromatic cinematic grain.",
        },
        {
          name: "cursorEnabled",
          type: "boolean",
          default: "true",
          description:
            "Show the difference-blend ring + dot cursor while hovering.",
        },
        {
          name: "cursorSize",
          type: "number",
          default: "48",
          description: "Outer ring diameter in px.",
        },
        {
          name: "cursorColor",
          type: "string",
          default: '"#ffffff"',
          description:
            "Custom cursor color (rendered with difference blending).",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description:
            "Enable pointer interaction. Disable for a static render.",
        },
        {
          name: "autoAnimate",
          type: "boolean",
          default: "false",
          description:
            "Low-energy wandering pointer keeps the membrane alive at idle.",
        },
        {
          name: "fit",
          type: '"responsive" | "contain" | "cover" | "fixed"',
          default: '"responsive"',
          description: "How the text texture maps into the container.",
        },
        {
          name: "as",
          type: '"h1" | "h2" | "h3" | "p" | "div" | "span"',
          default: '"div"',
          description: "Semantic element for the screen-reader text node.",
        },
        {
          name: "ariaLabel",
          type: "string",
          description: "Accessible label override for the canvas region text.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes. The container needs an explicit height (defaults to h-[560px]).",
        },
      ]}
    />
  );
}
