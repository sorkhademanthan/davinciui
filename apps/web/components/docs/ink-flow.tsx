import { InkFlow } from "@workspace/ui/components/ink-flow";

import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  InkFlowPersonalizePanel,
  InkFlowPreview,
} from "@/components/docs/previews/ink-flow-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { InkFlow } from "@/components/ui/ink-flow"

<section className="relative min-h-screen overflow-hidden">
  <InkFlow
    speed={0.22}
    scale={1}
    saturation={1}
    contrast={1}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function InkFlowNotes() {
  return (
    <>
      <Section title="About Ink Flow" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            Bring a high-end, gallery-grade editorial aesthetic to your
            interfaces.
          </p>
          <p>
            Ink Flow recreates the slow, organic movement of fountain-pen ink
            dispersing through textured watercolor paper. Large pigment fields
            gently stretch, bleed, and fold into one another to create a
            constantly evolving generative backdrop.
          </p>
          <p>
            Built with native WebGL, the effect remains GPU accelerated without
            relying on heavy rendering frameworks.
          </p>
        </div>
      </Section>

      <Section id="controls-prose" title="Controls" className="pt-8" hideFromToc>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Flow Speed</strong> controls how
            quickly the ink evolves.
          </li>
          <li>
            <strong className="text-foreground">Ink Scale</strong> controls the
            size and density of the fluid forms.
          </li>
          <li>
            <strong className="text-foreground">Ink Saturation</strong> controls
            the strength of the pigment.
          </li>
          <li>
            <strong className="text-foreground">Contrast</strong> controls
            separation between paper and ink tones.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Editorial sites, portfolios, premium agency pages, luxury product
          experiences, and immersive typographic hero sections.
        </p>
      </Section>
    </>
  );
}

export async function InkFlowDocs() {
  const sourceCode =
    (await readComponentSource("ink-flow")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Ink Flow"
      description="A native WebGL hero background where fountain-pen pigment slowly disperses through warm, textured watercolor paper."
      preview={<InkFlowPreview />}
      personalizeContent={<InkFlowPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="ink-flow"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/ink-flow.tsx"
      examples={[
        {
          title: "Warm paper and umber ink",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <InkFlow
                paperColor="#f4efe6"
                softInkColor="#b8a99a"
                deepInkColor="#3f3a36"
                accentColor="#b45309"
                speed={0.3}
                scale={1.2}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { InkFlow } from "@/components/ui/ink-flow"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <InkFlow
    paperColor="#f4efe6"
    softInkColor="#b8a99a"
    deepInkColor="#3f3a36"
    accentColor="#b45309"
    speed={0.3}
    scale={1.2}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Monochrome, high contrast",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <InkFlow
                saturation={0}
                contrast={1.6}
                speed={0.18}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { InkFlow } from "@/components/ui/ink-flow"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <InkFlow
    saturation={0}
    contrast={1.6}
    speed={0.18}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "speed",
          type: "number",
          default: "0.22",
          description:
            "Rate at which the ink evolves. Set to 0 to freeze the current frame.",
        },
        {
          name: "scale",
          type: "number",
          default: "1",
          description:
            "Spatial scale of the ink structures. Lower values produce broader forms.",
        },
        {
          name: "saturation",
          type: "number",
          default: "1",
          description: "Pigment saturation. Set to 0 for a neutral rendering.",
        },
        {
          name: "contrast",
          type: "number",
          default: "1",
          description: "Separation between the paper and pigment tones.",
        },
        {
          name: "paperColor",
          type: "string",
          default: '"#F6EFD3"',
          description: "Warm paper base color.",
        },
        {
          name: "softInkColor",
          type: "string",
          default: '"#9DA5B6"',
          description: "Color used for broad, diffused ink washes.",
        },
        {
          name: "deepInkColor",
          type: "string",
          default: '"#3C2FAA"',
          description: "Color used for concentrated pigment regions.",
        },
        {
          name: "accentColor",
          type: "string",
          default: '"#F5AED9"',
          description: "Rare accent color used for thin ink veins.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description:
            "Maximum device pixel ratio used by the canvas backing buffer.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes applied to the full-size background layer.",
        },
      ]}
      afterContent={<InkFlowNotes />}
    />
  );
}
