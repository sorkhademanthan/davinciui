import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  PaperInkBackgroundPersonalizePanel,
  PaperInkBackgroundPreview,
} from "@/components/docs/previews/paper-ink-background-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { PaperInkBackground } from "@/components/ui/paper-ink-background"

<section className="relative min-h-screen overflow-hidden">
  <PaperInkBackground
    speed={0.22}
    scale={1}
    saturation={1}
    contrast={1}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function PaperInkBackgroundNotes() {
  return (
    <>
      <Section title="About Paper Ink Background" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            Bring a high-end, gallery-grade editorial aesthetic to your
            interfaces.
          </p>
          <p>
            Paper Ink Background recreates the slow, organic movement of
            fountain-pen ink dispersing through textured watercolor paper.
            Large pigment fields gently stretch, bleed, and fold into one
            another to create a constantly evolving generative backdrop.
          </p>
          <p>
            Built with native WebGL, the effect remains GPU accelerated without
            relying on heavy rendering frameworks.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li><strong className="text-foreground">Flow Speed</strong> controls how quickly the ink evolves.</li>
          <li><strong className="text-foreground">Ink Scale</strong> controls the size and density of the fluid forms.</li>
          <li><strong className="text-foreground">Ink Saturation</strong> controls the strength of the pigment.</li>
          <li><strong className="text-foreground">Contrast</strong> controls separation between paper and ink tones.</li>
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

export async function PaperInkBackgroundDocs() {
  const sourceCode =
    (await readComponentSource("paper-ink-background")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Paper Ink Background"
      description="A native WebGL hero background where fountain-pen pigment slowly disperses through warm, textured watercolor paper."
      preview={<PaperInkBackgroundPreview />}
      personalizeContent={<PaperInkBackgroundPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="paper-ink-background"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/paper-ink-background.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "speed",
          type: "number",
          default: "0.22",
          description: "Rate at which the ink evolves. Set to 0 to freeze the current frame.",
        },
        {
          name: "scale",
          type: "number",
          default: "1",
          description: "Spatial scale of the ink structures. Lower values produce broader forms.",
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
          default: '"#E9E1C8"',
          description: "Warm paper base color.",
        },
        {
          name: "softInkColor",
          type: "string",
          default: '"#8B9BBE"',
          description: "Color used for broad, diffused ink washes.",
        },
        {
          name: "deepInkColor",
          type: "string",
          default: '"#2D2A93"',
          description: "Color used for concentrated pigment regions.",
        },
        {
          name: "accentColor",
          type: "string",
          default: '"#DC4FA7"',
          description: "Rare accent color used for thin ink veins.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description: "Maximum device pixel ratio used by the canvas backing buffer.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes applied to the full-size background layer.",
        },
      ]}
      afterContent={<PaperInkBackgroundNotes />}
    />
  );
}
