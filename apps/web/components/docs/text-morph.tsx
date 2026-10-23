import { TextMorph } from "@workspace/ui/components/text-morph";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  TextMorphPersonalizePanel,
  TextMorphPlayground,
} from "@/components/docs/previews/text-morph-playground";
import { readComponentSource } from "@/lib/source-code";

const basicUsageCode = `import { TextMorph } from "@/components/ui/text-morph"

<TextMorph
  words={["DAVINCIUI", "COMPONENTS"]}
  className="text-4xl font-bold tracking-tight md:text-5xl"
/>`;

export async function TextMorphDocs() {
  const sourceCode =
    (await readComponentSource("text-morph")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Text Morph"
      description="A fluid text primitive that blends one value into the next while preserving its visual center and inheriting the surrounding typography."
      preview={<TextMorphPlayground />}
      personalizeContent={<TextMorphPersonalizePanel />}
      previewCode={basicUsageCode}
      installPackageName="text-morph"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/text-morph.tsx"
      usageCode={
        <LiveCodeBlock slug="text-morph" defaultCode={basicUsageCode} />
      }
      fullWidthPreview
      examples={[
        {
          title: "Custom word sequence",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <TextMorph
                words={["BUILD", "SHIP", "SCALE"]}
                interval={2000}
                morphDuration={700}
                className="text-5xl font-semibold tracking-tight"
              />
            </div>
          ),
          code: `import { TextMorph } from "@/components/ui/text-morph"

<TextMorph
  words={["BUILD", "SHIP", "SCALE"]}
  interval={2000}
  morphDuration={700}
  className="text-5xl font-semibold tracking-tight"
/>`,
        },
        {
          title: "Slow editorial tracking",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <TextMorph
                words={["IDEAS", "SYSTEMS", "STORIES"]}
                interval={2600}
                morphDuration={900}
                className="text-4xl font-light uppercase tracking-[0.2em]"
              />
            </div>
          ),
          code: `import { TextMorph } from "@/components/ui/text-morph"

<TextMorph
  words={["IDEAS", "SYSTEMS", "STORIES"]}
  interval={2600}
  morphDuration={900}
  className="text-4xl font-light uppercase tracking-[0.2em]"
/>`,
        },
      ]}
      props={[
        {
          name: "words",
          type: "string[]",
          default: '["DAVINCIUI", "COMPONENTS"]',
          description:
            "Text, numbers, prices, or short phrases displayed by the morph sequence.",
        },
        {
          name: "interval",
          type: "number",
          default: "2600",
          description:
            "Time each value rests before the next morph begins, in milliseconds.",
        },
        {
          name: "morphDuration",
          type: "number",
          default: "680",
          description: "Duration of the fluid morph in milliseconds.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes for layout or typography. All visual text properties inherit naturally.",
        },
      ]}
    />
  );
}
