import { RollingText } from "@workspace/ui/components/rolling-text";

import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  RollingTextPersonalizePanel,
  RollingTextPlayground,
} from "@/components/docs/previews/rolling-text-preview";
import { LiveCodeBlock } from "@/components/live-code-block";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { RollingText } from "@/components/ui/rolling-text"

<RollingText
  text="DAVINCIUI"
  pattern="alternating"
/>`;

export async function RollingTextDocs() {
  const sourceCode =
    (await readComponentSource("rolling-text")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Rolling Text"
      description="Mechanical slot-machine typography — every character is an independent clipped column rolling a vertical stack of its own glyphs into place."
      preview={<RollingTextPlayground />}
      personalizeContent={<RollingTextPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="rolling-text"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/rolling-text.tsx"
      usageCode={
        <LiveCodeBlock slug="rolling-text" defaultCode={defaultCode} />
      }
      fullWidthPreview
      examples={[
        {
          title: "Sequential roll",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center bg-zinc-950 px-6">
              <RollingText
                text="SEQUENCE"
                pattern="sequential"
                rollDuration={1.6}
                staggerDelay={0.06}
                fontSize="clamp(2rem, 5vw, 3.5rem)"
                textColor="#f5f5f4"
                backgroundColor="transparent"
              />
            </div>
          ),
          code: `import { RollingText } from "@/components/ui/rolling-text"

<RollingText
  text="SEQUENCE"
  pattern="sequential"
  rollDuration={1.6}
  staggerDelay={0.06}
  fontSize="clamp(2rem, 5vw, 3.5rem)"
  textColor="#f5f5f4"
  backgroundColor="transparent"
/>`,
        },
        {
          title: "Heavy blur, deeper stack",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center bg-zinc-950 px-6">
              <RollingText
                text="MECHANICAL"
                pattern="alternating"
                duplicateCount={12}
                rollDuration={2.2}
                blurIntensity={6}
                fontSize="clamp(1.75rem, 4vw, 3rem)"
                textColor="#f5f5f4"
                backgroundColor="transparent"
              />
            </div>
          ),
          code: `import { RollingText } from "@/components/ui/rolling-text"

<RollingText
  text="MECHANICAL"
  pattern="alternating"
  duplicateCount={12}
  rollDuration={2.2}
  blurIntensity={6}
  fontSize="clamp(1.75rem, 4vw, 3rem)"
  textColor="#f5f5f4"
  backgroundColor="transparent"
/>`,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          default: '"DAVINCIUI"',
          description:
            "Text content. Wraps at word boundaries; spaces keep their width.",
        },
        {
          name: "pattern",
          type: '"sequential" | "alternating"',
          default: '"alternating"',
          description:
            "Sequential rolls every column downward in order; alternating rolls even and odd columns in opposing directions.",
        },
        {
          name: "duplicateCount",
          type: "number",
          default: "8",
          description:
            "Repeated copies of each glyph stacked inside its column. Travel adapts automatically.",
        },
        {
          name: "rollDuration",
          type: "number",
          default: "1.4",
          description:
            "Per-character roll duration in seconds. Eased with cubic-bezier(0.22, 1, 0.36, 1).",
        },
        {
          name: "staggerDelay",
          type: "number",
          default: "0.04",
          description: "Delay between consecutive characters in seconds.",
        },
        {
          name: "blurIntensity",
          type: "number",
          default: "3",
          description:
            "Vertical motion blur during movement in px (0–20). Always resolves to 0px.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "true",
          description:
            "Animate once into the final state on mount and when animation props change. When false, trigger manually through the component ref.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"Inter, sans-serif"',
          description: "Font family applied to the text.",
        },
        {
          name: "fontSize",
          type: "number | string",
          default: "60",
          description:
            "Font size. Numbers become px; strings pass through. Roll geometry follows automatically.",
        },
        {
          name: "fontWeight",
          type: "number | string",
          default: "900",
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
          default: "1",
          description: "Line height. Numbers are unitless multipliers.",
        },
        {
          name: "letterSpacing",
          type: "number | string",
          default: '"-0.02em"',
          description: "Tracking. Numbers become px; strings pass through.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"var(--foreground)"',
          description:
            "Follows the site theme (light mode: dark text, dark mode: light text). Pass an explicit color to fix it.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"var(--background)"',
          description:
            'Follows the site theme so the type masks seamlessly against the stage. Pass an explicit color (or "transparent") to fix it.',
        },
        {
          name: "textAlign",
          type: '"left" | "center" | "right"',
          default: '"center"',
          description: "Text alignment.",
        },
        {
          name: "className",
          type: "string",
          description: "Extra classes for the outer element.",
        },
        {
          name: "style",
          type: "CSSProperties",
          description: "Inline style overrides for the outer element.",
        },
      ]}
    />
  );
}
