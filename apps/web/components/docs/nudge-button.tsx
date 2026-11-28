import {NudgeButton} from "@workspace/ui/components/nudge-button";

import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import { NudgeButtonPlayground, NudgeButtonPersonalizePanel } from "@/components/docs/previews/playgrounds/nudge-button";

const usageCode = `import { NudgeButton } from "@/components/ui/nudge-button"

export default function BuyCta() {
  return <NudgeButton onClick={() => console.log("clicked")}>BUY NUDGE</NudgeButton>
}`;

export async function NudgeButtonDocs() {
  const sourceCode =
    (await readComponentSource("nudge-button")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Nudge Button"
      description="A white pill CTA with a directional nudge interaction — concentric blue, red, and yellow rings burst from the exact pointer entry point before a white reveal pushes them out through the clipped edges. One component scales from gallery card to fullscreen."
      preview={<NudgeButtonPlayground />}
      personalizeContent={<NudgeButtonPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="nudge-button"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/nudge-button.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Custom ring palette",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <NudgeButton
                duration={1000}
                colors={{
                  outer: "#0ea5e9",
                  middle: "#6366f1",
                  inner: "#f59e0b",
                  reveal: "#ffffff",
                }}
              >
                NUDGE ME
              </NudgeButton>
            </div>
          ),
          code: `import { NudgeButton } from "@/components/ui/nudge-button"

<NudgeButton
  duration={1000}
  colors={{
    outer: "#0ea5e9",
    middle: "#6366f1",
    inner: "#f59e0b",
    reveal: "#ffffff",
  }}
>
  NUDGE ME
</NudgeButton>`,
        },
        {
          title: "Disabled",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <NudgeButton disabled>DISABLED</NudgeButton>
            </div>
          ),
          code: `import { NudgeButton } from "@/components/ui/nudge-button"

<NudgeButton disabled>DISABLED</NudgeButton>`,
        },
      ]}
      props={[
        {
          name: "children",
          type: "React.ReactNode",
          default: '"BUY NUDGE"',
          description:
            "Centered label. Never moved, resized, or distorted by the rings.",
        },
        {
          name: "colors",
          type: "{ outer?: string; middle?: string; inner?: string; reveal?: string }",
          default: "blue / red / gold / white",
          description:
            "Ring palette from outermost to the reveal layer. Reveal should match the button surface for a seamless exit.",
        },
        {
          name: "duration",
          type: "number",
          default: "850",
          description:
            "Total interaction length in milliseconds. Relative layer stagger is preserved at any value.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disables the interaction and the click.",
        },
        {
          name: "onClick",
          type: "(event) => void",
          description:
            "Click handler. Never interfered with by the ring animation.",
        },
      ]}
    />
  );
}
