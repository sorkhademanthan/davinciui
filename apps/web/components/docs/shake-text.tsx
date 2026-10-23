import { ShakeText } from "@workspace/ui/components/shake-text";

import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ShakeTextPersonalizePanel,
  ShakeTextPlayground,
} from "@/components/docs/previews/shake-text-preview";
import { LiveCodeBlock } from "@/components/live-code-block";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { ShakeText } from "@/components/ui/shake-text"

<ShakeText
  text="DAVINCIUI"
  fontSize="clamp(2.5rem, 7.5vw, 6.5rem)"
/>`;

export async function ShakeTextDocs() {
  const sourceCode =
    (await readComponentSource("shake-text")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Shake Text"
      description="A premium 3D layered text effect with four colored depth copies that move continuously behind a stable foreground."
      preview={<ShakeTextPlayground />}
      personalizeContent={<ShakeTextPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="shake-text"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/shake-text.tsx"
      usageCode={<LiveCodeBlock slug="shake-text" defaultCode={defaultCode} />}
      fullWidthPreview
      examples={[
        {
          title: "Cool depth palette",
          preview: (
            <div className="flex min-h-[240px] items-center justify-center overflow-hidden bg-zinc-950 px-6">
              <ShakeText
                text="SHAKE"
                fontSize="clamp(3rem, 9vw, 6rem)"
                frontColor="#fafafa"
                layerColors={["#22d3ee", "#a3e635", "#fb7185", "#facc15"]}
              />
            </div>
          ),
          code: `import { ShakeText } from "@/components/ui/shake-text"

<div className="flex min-h-[320px] items-center justify-center overflow-hidden">
  <ShakeText
    text="SHAKE"
    fontSize="clamp(3rem, 9vw, 6rem)"
    frontColor="#fafafa"
    layerColors={["#22d3ee", "#a3e635", "#fb7185", "#facc15"]}
  />
</div>`,
        },
        {
          title: "Faster, stronger motion",
          preview: (
            <div className="flex min-h-[240px] items-center justify-center overflow-hidden bg-zinc-950 px-6">
              <ShakeText
                text="PULSE"
                fontSize="clamp(3rem, 9vw, 6rem)"
                shakeIntensity={2}
                shakeDuration={0.9}
                layerColors={["#f97316", "#ef4444", "#a855f7", "#facc15"]}
              />
            </div>
          ),
          code: `import { ShakeText } from "@/components/ui/shake-text"

<div className="flex min-h-[320px] items-center justify-center overflow-hidden">
  <ShakeText
    text="PULSE"
    fontSize="clamp(3rem, 9vw, 6rem)"
    shakeIntensity={2}
    shakeDuration={0.9}
    layerColors={["#f97316", "#ef4444", "#a855f7", "#facc15"]}
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          description:
            "Text rendered in the front layer and every depth layer.",
          default: '"DAVINCIUI"',
        },
        {
          name: "as",
          type: '"h1" | "h2" | "h3" | "span" | "div"',
          default: '"h1"',
          description:
            "Semantic tag for the accessible front layer. Depth layers are always aria-hidden.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"Inter, sans-serif"',
          description: "Font family for every layer.",
        },
        {
          name: "fontSize",
          type: "number | string",
          default: "137",
          description:
            "Font size. Numbers become px; strings pass through. Depth offsets scale with it.",
        },
        {
          name: "fontWeight",
          type: "number",
          default: "900",
          description: "Font weight for every layer.",
        },
        {
          name: "letterSpacing",
          type: "number | string",
          default: "0",
          description: "Letter spacing. Numbers become px.",
        },
        {
          name: "frontColor",
          type: "string",
          default: '"#fff8e7"',
          description: "Front layer color.",
        },
        {
          name: "layerColors",
          type: "[string, string, string, string]",
          default: "teal / green / coral / yellow",
          description: "Back-to-front colors for the four depth layers.",
        },
        {
          name: "depth",
          type: "number",
          default: "5",
          description:
            "Z-depth step per layer in px at the 137px reference size.",
        },
        {
          name: "layerOffset",
          type: "number",
          default: "4",
          description:
            "Vertical offset step per layer in px at the 137px reference size.",
        },
        {
          name: "perspective",
          type: "number",
          default: "1000",
          description: "CSS perspective of the wrapper in px.",
        },
        {
          name: "shakeIntensity",
          type: "number",
          default: "1",
          description: "Multiplier for the shake keyframes.",
        },
        {
          name: "shakeDuration",
          type: "number",
          default: "1.4",
          description: "Duration of one continuous motion cycle in seconds.",
        },
        {
          name: "shakeRepeat",
          type: "number",
          default: "0",
          description: "Extra timeline repeats for a manual shake.",
        },
        {
          name: "trigger",
          type: '"loop" | "manual"',
          default: '"loop"',
          description:
            "Continuously animate or wait for shake() through the component ref.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "true",
          description: "Start the continuous loop automatically.",
        },
        {
          name: "className",
          type: "string",
          description: "Extra classes for the outer wrapper.",
        },
        {
          name: "textClassName",
          type: "string",
          description: "Extra classes applied to the front text layer.",
        },
      ]}
    />
  );
}
