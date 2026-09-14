import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SoftFluidGradientPersonalizePanel,
  SoftFluidGradientPreview,
} from "@/components/docs/previews/soft-fluid-gradient-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { SoftFluidGradient } from "@/components/ui/soft-fluid-gradient"

<section className="relative min-h-screen overflow-hidden">
  <SoftFluidGradient
    speed={0.26}
    density={1}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function SoftFluidGradientNotes() {
  return (
    <>
      <Section title="About Soft Fluid Gradient" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            Uplift your canvas with a deep, hypnotic field of saturated color
            and fluid illumination.
          </p>
          <p>
            The shader moves one enormous ribbon of near-black, deep navy, icy
            blue, white, and warm beige light through broad organic loops. Its
            palette is intentionally fixed to preserve the reference aesthetic.
          </p>
          <p>
            It works as an immersive ambient backdrop, a high-density focal
            point, or a living digital-art layer behind interface content.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Flow Speed</strong> changes the
            movement from a slow drop to a quicker current.
          </li>
          <li>
            <strong className="text-foreground">Density (Loops)</strong>
            changes the wave detail from broad bends to tighter folds.
          </li>
        </ul>
      </Section>
    </>
  );
}

export async function SoftFluidGradientDocs() {
  const sourceCode =
    (await readComponentSource("soft-fluid-gradient")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Soft Fluid Gradient"
      description="A deep, hypnotic native WebGL background with an enormous looping ribbon of dark color and fluid illumination."
      preview={<SoftFluidGradientPreview />}
      personalizeContent={<SoftFluidGradientPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="soft-fluid-gradient"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/soft-fluid-gradient.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "speed",
          type: "number",
          default: "0.26",
          description:
            "Animation rate from 0 to 2. Set to 0 to freeze the current frame.",
        },
        {
          name: "density",
          type: "number",
          default: "1",
          description: "Wave density from broad loops to tighter folds.",
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
      afterContent={<SoftFluidGradientNotes />}
    />
  );
}
