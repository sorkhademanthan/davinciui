import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {CurvedInlineTypePlayground, CurvedInlineTypePersonalizePanel} from "@/components/docs/previews/iframe-playgrounds";

const defaultCode = `import { CurvedInlineType } from "@/components/ui/curved-inline-type"

export default function Hero() {
  return <CurvedInlineType />
}`;

const usageCode = `"use client"

import {
  CurvedInlineType,
  type CurvedInlineLine,
} from "@/components/ui/curved-inline-type"

const lines: CurvedInlineLine[] = [
  { before: "Form" },
  {
    before: "Build",
    after: "Slow",
    media: {
      type: "image",
      src: "/images/spiral-3d-slider/prism-portrait.jpg",
      alt: "Prism portrait",
    },
  },
  { before: "Cadence" },
  {
    before: "Hold",
    after: "Steady",
    media: {
      type: "image",
      src: "/images/segmented-image-carousel/concrete-oculus.jpg",
      alt: "Concrete oculus",
    },
  },
  { before: "Silence" },
  { before: "Make", after: "Space" },
]

export function Hero() {
  return (
    <CurvedInlineType
      lines={lines}
      scrollLength="400vh"
      fontSize="clamp(24px, 8.55vw, 94px)"
    />
  )
}`;

export async function CurvedInlineTypeDocs() {
  const sourceCode =
    (await readComponentSource("curved-inline-type")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      fullWidthPreview
      title="Curved Inline Type"
      description="A sticky scroll stage where headline lines ride an invisible vertical drum. Each line rises from below, flattens and brightens at the front, then rolls up and fades over the top, with images and looping videos sitting inline between words."
      preview={<CurvedInlineTypePlayground />}
      personalizeContent={<CurvedInlineTypePersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="curved-inline-type"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/curved-inline-type.tsx"
      usageCode={usageCode}
      props={[
        {
          name: "lines",
          type: "CurvedInlineLine[]",
          description:
            "Headline rows. Each row takes before/after text plus an optional inline image or video, href and newTab. Defaults to the built-in 14-line composition.",
        },
        {
          name: "scrollLength",
          type: "string | number",
          default: '"400vh"',
          description:
            "Height of the scroll track. The stage stays sticky for height minus one viewport.",
        },
        {
          name: "sweepDeg",
          type: "number",
          default: "260",
          description: "Total angle between the first and last line.",
        },
        {
          name: "direction",
          type: '"forward" | "reverse"',
          default: '"forward"',
          description:
            "Forward reproduces the live reference; reverse starts with the first line at the front.",
        },
        {
          name: "mapping",
          type: '"live" | "spec"',
          default: '"live"',
          description:
            "Live matches the published Framer site. Spec uses the brief's theta0 = progress * sweepDeg mapping.",
        },
        {
          name: "perspective",
          type: "number",
          default: "1200",
          description:
            "CSS perspective in px, capped responsively at 170vw.",
        },
        {
          name: "ringHeight",
          type: "number",
          default: "0.8",
          description:
            "Vertical lift multiplier, applied to min(42vh, 42vw).",
        },
        {
          name: "ringDepth",
          type: "number",
          default: "1.25",
          description:
            "Depth reach multiplier, applied to min(46vh, 46vw).",
        },
        {
          name: "textRotation",
          type: "number",
          default: "1.15",
          description: "rotateX per degree of ring angle.",
        },
        {
          name: "fadeExponent",
          type: "number",
          default: "1.5",
          description: "Curve of the front-to-back opacity falloff.",
        },
        {
          name: "minOpacity",
          type: "number",
          default: "0.06",
          description: "Opacity of lines at the back of the drum.",
        },
        {
          name: "blurAmount",
          type: "number",
          default: "3",
          description: "Maximum backdrop blur in px for far lines.",
        },
        {
          name: "fontSize",
          type: "string",
          default: '"clamp(24px, 8.55vw, 94px)"',
          description: "Headline type size.",
        },
        {
          name: "mediaHeight",
          type: "number",
          default: "0.9",
          description: "Inline media height in em.",
        },
        {
          name: "mediaWidth",
          type: "number",
          default: "1.035",
          description: "Inline media width in em.",
        },
        {
          name: "mediaRadius",
          type: "number",
          default: "10",
          description: "Inline media corner radius in px.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"var(--foreground, #f4f2ed)"',
          description:
            "Headline color. Defaults to your theme's foreground token, so it follows light and dark mode.",
        },
        {
          name: "background",
          type: "string",
          default: '"var(--background, #0b0b0e)"',
          description:
            "Stage background. Defaults to your theme's background token.",
        },
        {
          name: "captionColor",
          type: "string",
          default: '"var(--muted-foreground, #8b8b96)"',
          description:
            "Caption color. Defaults to your theme's muted-foreground token.",
        },
        {
          name: "spring",
          type: "CurvedSpringSettings",
          default: "{ stiffness: 90, damping: 26, mass: 1 }",
          description: "Scroll spring that supplies the soft end overshoot.",
        },
        {
          name: "captionText",
          type: "string",
          default: '"SCROLL SCROLL SCROLL..."',
          description: "Fixed caption above the stage.",
        },
        {
          name: "captionPulse",
          type: "boolean",
          default: "true",
          description: "Pulses the caption between 0.08 and 0.55 opacity.",
        },
      ]}
    />
  );
}
