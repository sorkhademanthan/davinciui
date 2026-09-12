import Link from "next/link";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { TextReveal } from "@workspace/ui/components/text-reveal";
import {
  TextRevealScrollStage,
  TEXT_REVEAL_PREVIEW_SCROLLER,
  TEXT_REVEAL_PREVIEW_TRIGGER,
} from "@/components/docs/previews/text-reveal-scroll-stage";
import { readComponentSource } from "@/lib/source-code";

const sampleText =
  "DavinciUI brings a growing library of thoughtfully crafted components and flexible patterns together, helping teams build polished, consistent interfaces faster. Explore, customize every detail, and bring motion-rich experiences to life—from the first prototype through the final product.";

const defaultCode = `import { TextReveal } from "@/components/ui/text-reveal"

<TextReveal
  text="${sampleText}"
  revealStyle="linear"
  revealBy="words"
  fromOpacity={0.15}
  toOpacity={1}
  revealSoftness={0.24}
  startPosition="top 80%"
  endPosition="bottom 40%"
  scrub
  scrubSmoothness={0.4}
/>`;

function ExamplePreview({
  revealStyle,
  revealBy,
}: {
  revealStyle: "linear" | "diagonal" | "random" | "center-out" | "edges-in";
  revealBy: "characters" | "words";
}) {
  return (
    <div className="min-h-64 w-full bg-transparent">
      <TextRevealScrollStage>
        <TextReveal
          text={sampleText}
          revealStyle={revealStyle}
          revealBy={revealBy}
          fontSize={24}
          lineHeight={1.45}
          startPosition="top top"
          endPosition="bottom bottom"
          scroller={TEXT_REVEAL_PREVIEW_SCROLLER}
          trigger={TEXT_REVEAL_PREVIEW_TRIGGER}
          revealedColor="var(--foreground)"
          unrevealedColor="var(--foreground)"
          className="mx-auto max-w-2xl"
        />
      </TextRevealScrollStage>
    </div>
  );
}

export async function TextRevealDocs() {
  const sourceCode =
    (await readComponentSource("text-reveal")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Text Reveal"
      description="A scroll-scrubbed text reveal engine. Choose character or word units and five genuinely different reveal orders, including a position-measured diagonal sweep that recalculates as text wraps."
      preview={
        <TextRevealScrollStage>
          <TextReveal
            text={sampleText}
            startPosition="top top"
            endPosition="bottom bottom"
            scroller={TEXT_REVEAL_PREVIEW_SCROLLER}
            trigger={TEXT_REVEAL_PREVIEW_TRIGGER}
            revealedColor="var(--foreground)"
            unrevealedColor="var(--foreground)"
            fontSize={28}
            lineHeight={1.45}
            className="mx-auto max-w-3xl"
          />
        </TextRevealScrollStage>
      }
      previewCode={defaultCode}
      installPackageName="text-reveal"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/text-reveal.tsx"
      usageCode={defaultCode}
      fullWidthPreview
      scrollablePreview
      usageNote={
        <p className="text-sm text-muted-foreground">
          Compare all seven reveal combinations on the{" "}
          <Link
            href="/demo/text-reveal"
            className="underline underline-offset-4 text-foreground"
          >
            Text Reveal test page
          </Link>
          .
        </p>
      }
      examples={[
        {
          title: "Diagonal Characters",
          preview: (
            <ExamplePreview revealStyle="diagonal" revealBy="characters" />
          ),
          code: `<TextReveal text={text} revealStyle="diagonal" revealBy="characters" />`,
          fullWidth: true,
        },
        {
          title: "Diagonal Words",
          preview: <ExamplePreview revealStyle="diagonal" revealBy="words" />,
          code: `<TextReveal text={text} revealStyle="diagonal" revealBy="words" />`,
          fullWidth: true,
        },
        {
          title: "Random Words",
          preview: <ExamplePreview revealStyle="random" revealBy="words" />,
          code: `<TextReveal text={text} revealStyle="random" revealBy="words" />`,
          fullWidth: true,
        },
        {
          title: "Linear Characters",
          preview: <ExamplePreview revealStyle="linear" revealBy="characters" />,
          code: `<TextReveal text={text} revealStyle="linear" revealBy="characters" />`,
          fullWidth: true,
        },
        {
          title: "Center Out",
          preview: <ExamplePreview revealStyle="center-out" revealBy="words" />,
          code: `<TextReveal text={text} revealStyle="center-out" revealBy="words" />`,
          fullWidth: true,
        },
        {
          title: "Edges In",
          preview: <ExamplePreview revealStyle="edges-in" revealBy="characters" />,
          code: `<TextReveal text={text} revealStyle="edges-in" revealBy="characters" />`,
          fullWidth: true,
        },
      ]}
      props={[
        { name: "text", type: "string", default: `"${sampleText}"`, description: "Text content. Browser wrapping is preserved; whitespace and line breaks stay in place." },
        { name: "revealStyle", type: '"linear" | "diagonal" | "random" | "center-out" | "edges-in"', default: '"linear"', description: "Reveal ordering. Spatial styles are measured from rendered unit positions." },
        { name: "revealBy", type: '"characters" | "words"', default: '"words"', description: "Animation unit. Character mode keeps each word grouped so natural wrapping occurs between words." },
        { name: "diagonalDirection", type: '"top-left-to-bottom-right" | "top-right-to-bottom-left" | "bottom-left-to-top-right" | "bottom-right-to-top-left"', default: '"top-left-to-bottom-right"', description: "Physical sweep direction; applies to the diagonal style." },
        { name: "fromOpacity / toOpacity", type: "number", default: "0.15 / 1", description: "Opacity at the beginning and end of each unit's soft reveal." },
        { name: "revealedColor / unrevealedColor", type: "string", default: '"#FFFFFF" / "#FFFFFF"', description: "Colors interpolate with opacity. Set them equal to use opacity alone." },
        { name: "revealSoftness", type: "number", default: "0.24", description: "Fraction of the scroll range used to fade each unit between its dim and revealed states." },
        { name: "startPosition / endPosition", type: "ScrollTrigger positions", default: '"top 80%" / "bottom 40%"', description: "GSAP start and end expressions controlling the scroll distance for a complete reveal." },
        { name: "startOffset / endOffset", type: "number", default: "0", description: "Additional pixel offsets applied to the start and end positions." },
        { name: "scrub", type: "boolean", default: "true", description: "Tie reveal progress to scrolling. Disable to play on entering the trigger range." },
        { name: "scrubSmoothness", type: "number", default: "0.4", description: "Numeric GSAP scrub catch-up duration in seconds. Zero uses direct scrub." },
        { name: "font", type: "Framer Font control", default: "Inter · 32px / 600 / 1.4", description: "Native typography control for family, size, style, weight, line height, letter spacing, and alignment. React consumers can also set the individual font props." },
        { name: "xOffset / yOffset", type: "number", default: "0 / 0", description: "Optional starting position offsets, in pixels." },
        { name: "scaleFrom / blurFrom", type: "number", default: "1 / 0", description: "Optional starting scale and blur amount." },
        { name: "randomSeed", type: "number", default: "1", description: "Stable random ordering seed; used by the random style." },
        { name: "respectReducedMotion", type: "boolean", default: "true", description: "Show all text in its final state when reduced motion is preferred." },
      ]}
    />
  );
}
