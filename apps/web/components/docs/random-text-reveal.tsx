import { RandomTextReveal } from "@workspace/ui/components/random-text-reveal";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  RandomTextRevealPersonalizePanel,
  RandomTextRevealPlayground,
} from "@/components/docs/previews/random-text-reveal-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { RandomTextReveal } from "@/components/ui/random-text-reveal"

<RandomTextReveal
  text="DavinciUI gives you production-ready components with crafted details, buttery motion, and beautiful defaults. Every component is open code you own, built to drop into any project and feel instantly at home."
  fontSize="clamp(1.5rem, 5cqi, 3.5rem)"
  fromOpacity={0.12}
  toOpacity={1}
  duration={0.35}
  minDelay={0}
  maxDelay={1.5}
  ease="Power2 Out"
  animationMode="random"
/>`;

export async function RandomTextRevealDocs() {
  const sourceCode =
    (await readComponentSource("random-text-reveal")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Random Text Reveal"
      description="Per-character text reveal in shuffled order when the text enters the viewport. Unrevealed glyphs sit faint while random letters resolve into solid type — scattered across the whole paragraph, never left-to-right."
      preview={<RandomTextRevealPlayground />}
      previewCode={defaultCode}
      personalizeContent={<RandomTextRevealPersonalizePanel />}
      fullWidthPreview
      installPackageName="random-text-reveal"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/random-text-reveal.tsx"
      usageCode={
        <LiveCodeBlock slug="random-text-reveal" defaultCode={defaultCode} />
      }
      examples={[
        {
          title: "Center-out reveal",
          preview: (
            <div className="flex min-h-[260px] items-center bg-zinc-950 px-6">
              <RandomTextReveal
                text="Every glyph resolves in a shuffled order, with the center arriving first."
                fontSize="clamp(1.25rem, 3vw, 2rem)"
                color="#f5f5f4"
                animationMode="center-out"
                duration={0.5}
                maxDelay={0.9}
              />
            </div>
          ),
          code: `import { RandomTextReveal } from "@/components/ui/random-text-reveal"

<RandomTextReveal
  text="Every glyph resolves in a shuffled order, with the center arriving first."
  fontSize="clamp(1.25rem, 3vw, 2rem)"
  color="#f5f5f4"
  animationMode="center-out"
  duration={0.5}
  maxDelay={0.9}
/>`,
        },
        {
          title: "Forward reveal with a subtle lift",
          preview: (
            <div className="flex min-h-[260px] items-center bg-zinc-950 px-6">
              <RandomTextReveal
                text="Forward reveal with a subtle lift."
                fontSize="clamp(1.5rem, 3.5vw, 2.5rem)"
                color="#f5f5f4"
                animationMode="forward"
                motionY={18}
                motionScale={0.96}
                maxDelay={0.6}
              />
            </div>
          ),
          code: `import { RandomTextReveal } from "@/components/ui/random-text-reveal"

<RandomTextReveal
  text="Forward reveal with a subtle lift."
  fontSize="clamp(1.5rem, 3.5vw, 2.5rem)"
  color="#f5f5f4"
  animationMode="forward"
  motionY={18}
  motionScale={0.96}
  maxDelay={0.6}
/>`,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          default: '"DavinciUI gives you production-ready components…"',
          description:
            "Text content. Words wrap naturally; characters reveal independently.",
        },
        {
          name: "fontFamily",
          type: "string",
          description: "Font family applied to the text.",
        },
        {
          name: "fontSize",
          type: "number | string",
          default: "64",
          description: "Font size. Numbers become px; strings pass through.",
        },
        {
          name: "fontWeight",
          type: "number | string",
          default: "600",
          description: "Font weight applied to the text.",
        },
        {
          name: "fontStyle",
          type: '"normal" | "italic"',
          default: '"normal"',
          description: "Font style applied to the text.",
        },
        {
          name: "lineHeight",
          type: "number | string",
          default: "1.1",
          description: "Line height. Numbers are unitless multipliers.",
        },
        {
          name: "letterSpacing",
          type: "number | string",
          default: '"-0.03em"',
          description: "Tracking. Numbers become px; strings pass through.",
        },
        {
          name: "color",
          type: "string",
          default: '"#000000"',
          description:
            "Final revealed character color (opacity animates, color stays).",
        },
        {
          name: "textAlign",
          type: '"left" | "center" | "right" | "justify"',
          default: '"center"',
          description: "Text alignment.",
        },
        {
          name: "fromOpacity",
          type: "number",
          default: "0.12",
          description: "Starting opacity of unrevealed characters.",
        },
        {
          name: "toOpacity",
          type: "number",
          default: "1",
          description: "Final opacity of revealed characters.",
        },
        {
          name: "duration",
          type: "number",
          default: "0.35",
          description: "Per-character transition duration, in seconds.",
        },
        {
          name: "minDelay",
          type: "number",
          default: "0",
          description: "Earliest per-character reveal delay, in seconds.",
        },
        {
          name: "maxDelay",
          type: "number",
          default: "1.5",
          description: "Latest per-character reveal delay, in seconds.",
        },
        {
          name: "ease",
          type: '"Linear" | "Power1 Out" | "Power2 Out" | "Power3 Out" | "Power4 Out" | "Sine Out" | "Expo Out" | "Circ Out" | "Back Out"',
          default: '"Power2 Out"',
          description: "GSAP easing for each character transition.",
        },
        {
          name: "animationMode",
          type: '"random" | "forward" | "reverse" | "center-out" | "edges-in"',
          default: '"random"',
          description: "Reveal order across the text.",
        },
        {
          name: "triggerPosition",
          type: '"top" | "center" | "bottom"',
          default: '"center"',
          description: "Viewport position that starts the reveal.",
        },
        {
          name: "triggerOffset",
          type: "number",
          default: "0",
          description: "Fine-tune trigger point in px (positive = later).",
        },
        {
          name: "replay",
          type: "boolean",
          default: "true",
          description:
            "Re-arm when leaving the viewport so re-entering replays.",
        },
        {
          name: "randomizeEachReplay",
          type: "boolean",
          default: "true",
          description: "Fresh random distribution on every replay.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description:
            "Auto-replay on a timer after each completion (keeps looping in view).",
        },
        {
          name: "loopDelay",
          type: "number",
          default: "2",
          description: "Pause between loop iterations, in seconds.",
        },
        {
          name: "seed",
          type: "number",
          description: "Fixed seed for a stable random order across renders.",
        },
        {
          name: "motionX",
          type: "number",
          default: "0",
          description: "Optional horizontal motion offset in px.",
        },
        {
          name: "motionY",
          type: "number",
          default: "0",
          description: "Optional vertical motion offset in px.",
        },
        {
          name: "motionScale",
          type: "number",
          default: "1",
          description: "Optional starting scale.",
        },
        {
          name: "motionRotation",
          type: "number",
          default: "0",
          description: "Optional starting rotation in degrees.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the outer element.",
        },
        {
          name: "style",
          type: "React.CSSProperties",
          description: "Additional inline styles for the outer element.",
        },
      ]}
    />
  );
}
