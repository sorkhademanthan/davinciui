import {AnimatedPillButton} from "@workspace/ui/components/animated-pill-button";

import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {AnimatedPillButtonPlayground, AnimatedPillButtonPersonalizePanel} from "@/components/docs/previews/interaction-playgrounds";

const usageCode = `import { AnimatedPillButton } from "@/components/ui/animated-pill-button"

export default function ReserveCta() {
  return <AnimatedPillButton onClick={() => console.log("reserved")}>Reserve Now</AnimatedPillButton>
}`;

export async function AnimatedPillButtonDocs() {
  const sourceCode =
    (await readComponentSource("animated-pill-button")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Animated Pill Button"
      description="A black pill CTA with a directional liquid wipe — cyan bursts from the right-side dot with a curved leading edge while the dot morphs into an arrow circle and the label flips contrast inside the same mask. One component scales from gallery card to fullscreen."
      preview={<AnimatedPillButtonPlayground />}
      personalizeContent={<AnimatedPillButtonPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="animated-pill-button"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/animated-pill-button.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Link with a custom accent",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <AnimatedPillButton
                href="/docs/components"
                size="lg"
                activeColor="#f97316"
              >
                Browse components
              </AnimatedPillButton>
            </div>
          ),
          code: `import { AnimatedPillButton } from "@/components/ui/animated-pill-button"

<AnimatedPillButton
  href="/docs/components"
  size="lg"
  activeColor="#f97316"
>
  Browse components
</AnimatedPillButton>`,
        },
        {
          title: "Disabled state",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <AnimatedPillButton disabled label="Sold out" />
            </div>
          ),
          code: `import { AnimatedPillButton } from "@/components/ui/animated-pill-button"

<AnimatedPillButton disabled label="Sold out" />`,
        },
      ]}
      props={[
        {
          name: "label",
          type: "string",
          default: '"Reserve Now"',
          description:
            "Button text. Duplicated internally so contrast flips exactly inside the cyan mask with zero movement.",
        },
        {
          name: "href",
          type: "string",
          description:
            "Renders a semantic link instead of a button when supplied.",
        },
        {
          name: "onClick",
          type: "() => void",
          description:
            "Click handler. Never interfered with by the wipe animation.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description:
            "Density multiplier. Container queries still scale type in card and fullscreen.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: "theme-aware (black / inverted white)",
          description:
            "Resting pill colour. Omit to auto-adapt: reference black in light mode, white in dark mode.",
        },
        {
          name: "activeColor",
          type: "string",
          default: '"#19CBEA"',
          description: "Expanding wipe colour and resting dot colour.",
        },
        {
          name: "textColor",
          type: "string",
          default: "theme-aware (white / inverted black)",
          description:
            "Label colour over the resting pill. Follows the theme unless overridden.",
        },
        {
          name: "activeTextColor",
          type: "string",
          default: '"#000000"',
          description: "Duplicate-label colour revealed inside the cyan mask.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disables the wipe and the click.",
        },
      ]}
    />
  );
}
