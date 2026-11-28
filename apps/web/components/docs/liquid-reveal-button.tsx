import {LiquidRevealButton} from "@workspace/ui/components/liquid-reveal-button";

import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import { LiquidRevealButtonPlayground, LiquidRevealButtonPersonalizePanel } from "@/components/docs/previews/playgrounds/liquid-reveal-button";

const usageCode = `import { LiquidRevealButton } from "@/components/ui/liquid-reveal-button"

export default function ProjectsCta() {
  return (
    <LiquidRevealButton onClick={() => console.log("clicked")}>
      View all projects
    </LiquidRevealButton>
  )
}`;

export async function LiquidRevealButtonDocs() {
  const sourceCode =
    (await readComponentSource("liquid-reveal-button")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Liquid Reveal Button"
      description="A substantial acid-yellow pill CTA with a pointer-driven black liquid reveal — the mask originates at the real cursor position, expands to full cover with spatially-masked two-tone text, then retracts toward the exit point. One container-aware component adapts to card, side-panel, and fullscreen sizes."
      preview={<LiquidRevealButtonPlayground />}
      personalizeContent={<LiquidRevealButtonPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      examples={[
        {
          title: "Link with a cool palette",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <LiquidRevealButton
                href="/docs/components"
                backgroundColor="#38bdf8"
                hoverColor="#0f172a"
                textColor="#0f172a"
                hoverTextColor="#f8fafc"
                borderColor="#0f172a"
              >
                See all components
              </LiquidRevealButton>
            </div>
          ),
          code: `import { LiquidRevealButton } from "@/components/ui/liquid-reveal-button"

<LiquidRevealButton
  href="/docs/components"
  backgroundColor="#38bdf8"
  hoverColor="#0f172a"
  textColor="#0f172a"
  hoverTextColor="#f8fafc"
  borderColor="#0f172a"
>
  See all components
</LiquidRevealButton>`,
        },
        {
          title: "Disabled",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <LiquidRevealButton disabled>
                Currently unavailable
              </LiquidRevealButton>
            </div>
          ),
          code: `import { LiquidRevealButton } from "@/components/ui/liquid-reveal-button"

<LiquidRevealButton disabled>Currently unavailable</LiquidRevealButton>`,
        },
      ]}
      installPackageName="liquid-reveal-button"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/liquid-reveal-button.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "children",
          type: "React.ReactNode",
          default: '"View all projects"',
          description:
            "Button label. Kept on a single line and never moved by the reveal.",
        },
        {
          name: "href",
          type: "string",
          description:
            "Renders a semantic link instead of a button when supplied.",
        },
        {
          name: "onClick",
          type: "(event) => void",
          description:
            "Click handler. Never interfered with by the reveal animation.",
        },
        {
          name: "mode",
          type: '"card" | "preview" | "fullscreen"',
          default: '"preview"',
          description:
            "Density hint for the host surface. Physics and reveal behaviour are identical in every mode.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#E5FF46"',
          description: "Pill base colour (acid yellow in the reference).",
        },
        {
          name: "hoverColor",
          type: "string",
          default: '"#111111"',
          description: "Liquid reveal colour.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"#141414"',
          description: "Label colour over the base pill.",
        },
        {
          name: "hoverTextColor",
          type: "string",
          default: '"#FFFFFF"',
          description:
            "Duplicate-label colour, visible only inside the reveal mask.",
        },
        {
          name: "borderColor",
          type: "string",
          default: '"#141414"',
          description:
            "Thin pill outline, stable through the whole interaction.",
        },
        {
          name: "showDemoCursor",
          type: "boolean",
          default: "false",
          description:
            "Renders the fixed black demo cursor that tracks the pointer over the button. Demo-only; the button never replaces the site cursor.",
        },
      ]}
    />
  );
}
