import { KineticText } from "@workspace/ui/components/gsap-text";

import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  GSAPTextPersonalizePanel,
  GSAPTextPlayground,
} from "@/components/docs/previews/gsap-text-preview";
import { LiveCodeBlock } from "@/components/live-code-block";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { KineticText } from "@/components/ui/gsap-text"

<KineticText
  text="DAVINCIUI"
  htmlTag="h1"
  textClassName="scale-x-[1.04]"
  direction="both"
  layerCount={10}
  distance={300}
  duration={4}
/>`;

export async function GSAPTextDocs() {
  const sourceCode =
    (await readComponentSource("gsap-text")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="GSAP Text"
      description="A cinematic kinetic typography component that creates a layered 3D depth effect using continuous vertical text motion."
      preview={<GSAPTextPlayground />}
      personalizeContent={<GSAPTextPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="gsap-text"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/gsap-text.tsx"
      usageCode={<LiveCodeBlock slug="gsap-text" defaultCode={defaultCode} />}
      fullWidthPreview
      examples={[
        {
          title: "Single upward direction",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-zinc-950">
              <KineticText
                text={"KINETIC\nTYPE"}
                htmlTag="h2"
                direction="up"
                layerCount={6}
                distance={220}
                duration={3}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { KineticText } from "@/components/ui/gsap-text"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <KineticText
    text={"KINETIC\\nTYPE"}
    htmlTag="h2"
    direction="up"
    layerCount={6}
    distance={220}
    duration={3}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Warm palette, downward",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-zinc-950">
              <KineticText
                text="MOTION"
                direction="down"
                layerCount={8}
                distance={260}
                duration={5}
                textColor="#f97316"
                backgroundColor="#0b0b0b"
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { KineticText } from "@/components/ui/gsap-text"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <KineticText
    text="MOTION"
    direction="down"
    layerCount={8}
    distance={260}
    duration={5}
    textColor="#f97316"
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
          default: '"GSAP TEXT"',
          description:
            "Text rendered in the main layer and every clone. \\n sequences become line breaks.",
        },
        {
          name: "htmlTag",
          type: '"h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"',
          default: '"h1"',
          description:
            "Semantic tag for the accessible main text. Clones are always divs with aria-hidden.",
        },
        {
          name: "font",
          type: "KineticTextFont",
          description:
            "Structured font object (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, variant). Numbers become px.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"var(--foreground)"',
          description:
            "Follows the site theme (light mode: dark text, dark mode: light text). Pass an explicit color to fix it.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"var(--background)"',
          description:
            "Follows the site theme so every layer masks seamlessly against the stage. Pass an explicit color to fix it.",
        },
        {
          name: "direction",
          type: '"up" | "down" | "both"',
          default: '"both"',
          description:
            "Flow direction. Up/down create one clone per layer; both creates two (±distance/2).",
        },
        {
          name: "layerCount",
          type: "number",
          default: "10",
          description:
            "Number of independent GSAP timelines. Both renders 2 clones per layer.",
        },
        {
          name: "distance",
          type: "number",
          default: "300",
          description:
            "Total vertical travel in px. Both splits it to ±distance/2 per clone.",
        },
        {
          name: "duration",
          type: "number",
          default: "4",
          description:
            "Seconds per tween. Also drives each layer's phase offset: (layerIndex / layerCount) * duration. Eased with power3.out, loops forever.",
        },
        {
          name: "className",
          type: "string",
          description: "Extra classes for the outer wrapper.",
        },
        {
          name: "textClassName",
          type: "string",
          description: "Extra classes applied to the main text.",
        },
      ]}
    />
  );
}
