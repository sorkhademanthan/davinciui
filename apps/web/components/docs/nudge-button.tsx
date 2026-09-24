import { DocsPageLayout } from "@/components/docs-page-layout";
import { NudgeButtonPreview } from "@/components/docs/previews/nudge-button-preview";
import { readComponentSource } from "@/lib/source-code";

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
      title="Nudge Button"
      description="A white pill CTA with a directional nudge interaction — concentric blue, red, and yellow rings burst from the exact pointer entry point before a white reveal pushes them out through the clipped edges. One component scales from gallery card to fullscreen."
      preview={<NudgeButtonPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="nudge-button"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/nudge-button.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "children",
          type: "React.ReactNode",
          default: '"BUY NUDGE"',
          description: "Centered label. Never moved, resized, or distorted by the rings.",
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
          description: "Click handler. Never interfered with by the ring animation.",
        },
      ]}
    />
  );
}
