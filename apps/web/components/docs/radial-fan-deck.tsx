import {RadialFanDeck} from "@workspace/ui/components/radial-fan-deck";
import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {RadialFanDeckPlayground, RadialFanDeckPersonalizePanel} from "@/components/docs/previews/interaction-playgrounds";

const defaultCode = `import { useState } from "react"
import { RadialFanDeck } from "@/components/ui/radial-fan-deck"

export function FanDeckExample() {
  const [scrollProgress, setScrollProgress] = useState(0)

  return <RadialFanDeck cardWidth={360} scrollProgress={scrollProgress} />
}`;

export async function RadialFanDeckDocs() {
  const sourceCode =
    (await readComponentSource("radial-fan-deck")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Radial Fan Deck"
      description="A scroll-driven editorial card deck that unfolds from one shared hinge into a full radial fan. Scroll back to fold it into the centered stack."
      preview={<RadialFanDeckPlayground />}
      personalizeContent={<RadialFanDeckPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="radial-fan-deck"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/radial-fan-deck.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Fully fanned",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950">
              <RadialFanDeck
                cardWidth={220}
                scrollProgress={1}
                fanAngle={110}
                className="h-full"
              />
            </div>
          ),
          code: `import { RadialFanDeck } from "@/components/ui/radial-fan-deck"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950">
  <RadialFanDeck
    cardWidth={220}
    scrollProgress={1}
    fanAngle={110}
    className="h-full"
  />
</div>`,
        },
        {
          title: "Half unfolded",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950">
              <RadialFanDeck
                cardWidth={250}
                scrollProgress={0.4}
                startAngle={-40}
                fanAngle={80}
                className="h-full"
              />
            </div>
          ),
          code: `import { RadialFanDeck } from "@/components/ui/radial-fan-deck"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950">
  <RadialFanDeck
    cardWidth={250}
    scrollProgress={0.4}
    startAngle={-40}
    fanAngle={80}
    className="h-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      props={[
        {
          name: "items",
          type: "RadialFanDeckItem[]",
          description: "Cover faces arranged around the shared hinge.",
        },
        {
          name: "cardWidth",
          type: "number",
          default: "332",
          description: "Width of each card cover in CSS pixels.",
        },
        {
          name: "cardAspectRatio",
          type: "number",
          default: "0.585",
          description: "Height divided by width for every cover.",
        },
        {
          name: "scrollProgress",
          type: "number",
          description:
            "Optional controlled scroll position from 0 (closed) to 1 (fully fanned).",
        },
        {
          name: "startAngle / fanAngle",
          type: "number",
          default: "-24 / 332",
          description:
            "Starting angle and total angular sweep of the fan in degrees.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Animated radial fan deck"',
          description: "Accessible name for the decorative deck.",
        },
        {
          name: "className",
          type: "string",
          description: "Controls the stage dimensions and outer surface.",
        },
      ]}
    />
  );
}
