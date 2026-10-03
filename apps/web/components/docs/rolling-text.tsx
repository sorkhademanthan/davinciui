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
      usageCode={<LiveCodeBlock defaultCode={defaultCode} />}
      fullWidthPreview
      props={[
        { name: "text", type: "string", default: '"DAVINCIUI"', description: "Text content. Wraps at word boundaries; spaces keep their width." },
        { name: "pattern", type: '"sequential" | "alternating"', default: '"alternating"', description: "Sequential rolls every column downward in order; alternating rolls even and odd columns in opposing directions." },
        { name: "duplicateCount", type: "number", default: "8", description: "Repeated copies of each glyph stacked inside its column. Travel adapts automatically." },
        { name: "rollDuration", type: "number", default: "1.4", description: "Per-character roll duration in seconds. Eased with cubic-bezier(0.22, 1, 0.36, 1)." },
        { name: "staggerDelay", type: "number", default: "0.04", description: "Delay between consecutive characters in seconds." },
        { name: "blurIntensity", type: "number", default: "3", description: "Vertical motion blur during movement in px (0–20). Always resolves to 0px." },
        { name: "autoPlay", type: "boolean", default: "true", description: "Animate once into the final state on mount and when animation props change. When false, trigger manually through the component ref." },
        { name: "fontFamily", type: "string", default: '"Inter, sans-serif"', description: "Font family applied to the text." },
        { name: "fontSize", type: "number | string", default: "60", description: "Font size. Numbers become px; strings pass through. Roll geometry follows automatically." },
        { name: "fontWeight", type: "number | string", default: "900", description: "Font weight applied to the text." },
        { name: "fontStyle", type: '"normal" | "italic"', default: '"normal"', description: "Font style applied to the text." },
        { name: "lineHeight", type: "number | string", default: "1", description: "Line height. Numbers are unitless multipliers." },
        { name: "letterSpacing", type: "number | string", default: '"-0.02em"', description: "Tracking. Numbers become px; strings pass through." },
        { name: "textColor", type: "string", default: '"var(--foreground)"', description: "Follows the site theme (light mode: dark text, dark mode: light text). Pass an explicit color to fix it." },
        { name: "backgroundColor", type: "string", default: '"var(--background)"', description: 'Follows the site theme so the type masks seamlessly against the stage. Pass an explicit color (or "transparent") to fix it.' },
        { name: "textAlign", type: '"left" | "center" | "right"', default: '"center"', description: "Text alignment." },
        { name: "className", type: "string", description: "Extra classes for the outer element." },
        { name: "style", type: "CSSProperties", description: "Inline style overrides for the outer element." },
      ]}
    />
  );
}
