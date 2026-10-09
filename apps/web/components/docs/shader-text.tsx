import { ShaderTextFitPreview } from "@/components/docs/previews/shader-text-fit-preview";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  ShaderTextPersonalizePanel,
  ShaderTextPlayground,
} from "@/components/docs/previews/shader-text-preview";
import { readComponentSource } from "@/lib/source-code";

const basicUsageCode = `import { ShaderText } from "@/components/ui/shader-text"

<ShaderText text="DAVINCIUI" preset="aurora" fontSize={80} />`;

const plasmaCode = `<ShaderText
  text="DAVINCIUI"
  preset="plasma"
  fontFamily="Anton, sans-serif"
  fontSize={80}
  speed={1.4}
  scale={1.2}
/>`;

const lavaCode = `<ShaderText
  text="DAVINCIUI"
  preset="lava"
  fontSize={80}
  speed={0.8}
  softness={0.65}
/>`;

export async function ShaderTextDocs() {
  const sourceCode =
    (await readComponentSource("shader-text")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Shader Text"
      description="Animated WebGL fragment shaders clipped inside text glyphs via a dynamic SVG mask. Twelve GLSL presets — noise, plasma, aurora, cyber and more — flow continuously inside razor-sharp type with GPU-accelerated rendering."
      preview={<ShaderTextPlayground />}
      personalizeContent={<ShaderTextPersonalizePanel />}
      previewCode={basicUsageCode}
      installPackageName="shader-text"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/shader-text.tsx"
      usageCode={<LiveCodeBlock slug="shader-text" defaultCode={basicUsageCode} />}
      fullWidthPreview
      examples={[
        {
          title: "Plasma Display",
          preview: (
            <div className="flex h-full min-h-[440px] w-full items-center justify-center bg-zinc-200/70 px-6 py-14 dark:bg-[#0a0a0f]">
              <ShaderTextFitPreview
                text="DAVINCIUI"
                preset="plasma"
                fontFamily="Anton, sans-serif"
                speed={1.4}
                scale={1.2}
              />
            </div>
          ),
          code: plasmaCode,
        },
        {
          title: "Molten",
          preview: (
            <div className="flex h-full min-h-[440px] w-full items-center justify-center bg-zinc-200/70 px-6 py-14 dark:bg-[#0a0a0f]">
              <ShaderTextFitPreview
                text="DAVINCIUI"
                preset="lava"
                speed={0.8}
                softness={0.65}
              />
            </div>
          ),
          code: lavaCode,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          default: '"Shader"',
          description:
            "Text rendered into the SVG glyph mask. Supports multiline via \\n.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: "'Inter, \"Helvetica Neue\", Arial, sans-serif'",
          description:
            "Font family shared by the sizing node and the SVG mask so glyphs align exactly.",
        },
        {
          name: "fontSize",
          type: "number",
          default: "120",
          description: "Font size in CSS px.",
        },
        {
          name: "fontWeight",
          type: "number | string",
          default: "800",
          description: "Font weight applied to the sizing node and mask.",
        },
        {
          name: "fontStyle",
          type: "string",
          default: '"normal"',
          description: "Font style (e.g. normal or italic).",
        },
        {
          name: "letterSpacing",
          type: "number",
          default: "0",
          description: "Tracking in CSS px.",
        },
        {
          name: "lineHeight",
          type: "number",
          default: "1",
          description: "Unitless line-height multiplier for multiline text.",
        },
        {
          name: "textAlign",
          type: '"left" | "center" | "right"',
          default: '"center"',
          description: "Horizontal alignment of each line.",
        },
        {
          name: "preset",
          type: '"noise" | "plasma" | "aurora" | "cyber" | "lava" | "ocean" | "sunset" | "nebula" | "prism" | "glitch" | "bloom" | "void"',
          default: '"aurora"',
          description:
            "Fragment-shader preset. Each value compiles a different GLSL program (case-insensitive).",
        },
        {
          name: "speed",
          type: "number",
          default: "1",
          description: "Animation speed multiplier driving u_time.",
        },
        {
          name: "scale",
          type: "number",
          default: "1.6",
          description: "Shader pattern zoom passed as u_scale.",
        },
        {
          name: "resolution",
          type: "number",
          default: "1",
          description:
            "Canvas backing-store multiplier on top of devicePixelRatio (0.25–2).",
        },
        {
          name: "softness",
          type: "number",
          default: "0.5",
          description:
            "Pattern softness 0–1 passed as u_softness; reshapes transitions inside the shader.",
        },
        {
          name: "ariaLabel",
          type: "string",
          description: "Accessible label override. Defaults to the text.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the outer wrapper.",
        },
      ]}
    />
  );
}
