import { GlitchLiquidText } from "@workspace/ui/components/glitch-liquid-text";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { GlitchLiquidTextPreview } from "@/components/docs/previews/glitch-liquid-text-preview";
import { readComponentSource } from "@/lib/source-code";
import { MousePointer } from "lucide-react";

const usageCode = `import { GlitchLiquidText } from "@/components/ui/glitch-liquid-text"

<GlitchLiquidText
  text={"DAVINCIUI\\nCOMPONENTS"}
  fontFamily="Anton"
  fontSize={180}
  lineHeight={0.95}
  backgroundColor="#141414"
  textColor="#f5f5f5"
  distortionStrength={0.42}
  liquidStrength={1.1}
  className="h-[560px] w-full"
/>`;

const defaultCode = `import { GlitchLiquidText } from "@/components/ui/glitch-liquid-text"

<GlitchLiquidText
  text={"DAVINCIUI\\nCOMPONENTS"}
  fontSize={180}
  lineHeight={0.95}
  distortionStrength={0.42}
  liquidStrength={1.1}
  className="h-[560px] w-full"
/>`;

function HoverHint() {
  return (
    <span className="pointer-events-none absolute bottom-5 left-0 right-0 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground/60 select-none">
      <MousePointer className="w-3 h-3" />
      Move your cursor across the type — velocity drags the membrane
    </span>
  );
}

export async function GlitchLiquidTextDocs() {
  const sourceCode =
    (await readComponentSource("glitch-liquid-text")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Glitch Liquid Text"
      description="GPU-rendered interactive typography printed on a thin liquid membrane. The cursor stretches glyphs with viscous fluid distortion, velocity-driven smear, localized RGB channel separation, subtle glitch slices, and cinematic light rays — while untouched type stays razor sharp."
      preview={
        <div className="relative h-full min-h-[560px] w-full p-6 sm:p-10">
          <GlitchLiquidTextPreview />
          <HoverHint />
        </div>
      }
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
          default: '"DAVINCIUI\\nCOMPONENTS"',
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
          default: "220",
          description: "Base type size in CSS px before contain-fit scaling.",
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
          default: "0.95",
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
          default: '"#f5f5f5"',
          description: "Glyph color applied in the shader composite.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#141414"',
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
          default: "0.18",
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
          default: "0.07",
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
          default: "0.012",
          description: "Peak RGB channel separation at distorted edges.",
        },
        {
          name: "glitchStrength",
          type: "number",
          default: "0.4",
          description:
            "Intensity of sparse horizontal glitch slices (secondary effect).",
        },
        {
          name: "liquidStrength",
          type: "number",
          default: "1.1",
          description:
            "Tangential swirl component — higher feels more fluid, less lens-like.",
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
          default: "0.35",
          description:
            "Directional light-ray bloom gathered from disturbed glyph edges.",
        },
        {
          name: "grainStrength",
          type: "number",
          default: "0.025",
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
          default: "true",
          description:
            "Low-energy wandering pointer keeps the membrane alive at idle.",
        },
        {
          name: "fit",
          type: '"contain" | "cover" | "fixed"',
          default: '"contain"',
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
