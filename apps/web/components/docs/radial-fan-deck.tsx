import { DocsPageLayout } from "@/components/docs-page-layout";
import { RadialFanDeckPreview } from "@/components/docs/previews/radial-fan-deck-preview";
import { readComponentSource } from "@/lib/source-code";

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
      title="Radial Fan Deck"
      description="A scroll-driven editorial card deck that unfolds from one shared hinge into a full radial fan. Scroll back to fold it into the centered stack."
      preview={<RadialFanDeckPreview />}
      previewCode={defaultCode}
      installPackageName="radial-fan-deck"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/radial-fan-deck.tsx"
      usageCode={defaultCode}
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
          description: "Optional controlled scroll position from 0 (closed) to 1 (fully fanned).",
        },
        {
          name: "startAngle / fanAngle",
          type: "number",
          default: "-24 / 332",
          description: "Starting angle and total angular sweep of the fan in degrees.",
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
