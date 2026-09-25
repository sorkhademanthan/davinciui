import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiquidChromeButtonPreview } from "@/components/docs/previews/liquid-chrome-button-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { LiquidChromeButton } from "@/components/ui/liquid-chrome-button"

<LiquidChromeButton
  size={112}
  borderWidth={10}
  speed={1}
  glassOpacity={0.42}
  ariaLabel="Open project"
/>`;

export async function LiquidChromeButtonDocs() {
  const sourceCode = (await readComponentSource("liquid-chrome-button")) || "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Liquid Chrome Button"
      description="A circular WebGL liquid-metal button with a frosted glass lens, springy hover response, and anchor support."
      preview={<LiquidChromeButtonPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="liquid-chrome-button"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/liquid-chrome-button.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        { name: "size", type: "number", default: "112", description: "Button diameter, clamped from 40 to 300px." },
        { name: "borderWidth", type: "number", default: "10", description: "Width of the animated chrome ring in pixels." },
        { name: "speed", type: "number", default: "1", description: "WebGL liquid-motion multiplier. Use 0 for a static surface." },
        { name: "glassOpacity", type: "number", default: "0.42", description: "Opacity of the frosted inner lens, from 0 to 1." },
        { name: "icon", type: '"folder" | "lightning" | "cursor"', description: "Optional built-in center icon." },
        { name: "customIcon", type: "ReactNode", description: "Custom SVG or React content, automatically contained in the glass lens." },
        { name: "href", type: "string", description: "Renders an anchor when supplied; otherwise renders a button." },
      ]}
    />
  );
}
