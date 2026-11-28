import {LiquidChromeButton} from "@workspace/ui/components/liquid-chrome-button";

import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import { LiquidChromeButtonPlayground, LiquidChromeButtonPersonalizePanel } from "@/components/docs/previews/playgrounds/liquid-chrome-button";

const usageCode = `import { LiquidChromeButton } from "@/components/ui/liquid-chrome-button"

<LiquidChromeButton
  size={112}
  borderWidth={10}
  speed={1}
  glassOpacity={0.42}
  ariaLabel="Open project"
/>`;

export async function LiquidChromeButtonDocs() {
  const sourceCode =
    (await readComponentSource("liquid-chrome-button")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      hideExamples
      title="Liquid Chrome Button"
      description="A circular WebGL liquid-metal button with a frosted glass lens, springy hover response, and anchor support."
      preview={<LiquidChromeButtonPlayground />}
      personalizeContent={<LiquidChromeButtonPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      examples={[
        {
          title: "Large lightning action",
          preview: (
            <div className="flex min-h-[260px] items-center justify-center px-6">
              <LiquidChromeButton
                size={148}
                borderWidth={14}
                speed={0.6}
                glassOpacity={0.3}
                icon="lightning"
                ariaLabel="Quick actions"
              />
            </div>
          ),
          code: `import { LiquidChromeButton } from "@/components/ui/liquid-chrome-button"

<LiquidChromeButton
  size={148}
  borderWidth={14}
  speed={0.6}
  glassOpacity={0.3}
  icon="lightning"
  ariaLabel="Quick actions"
/>`,
        },
        {
          title: "Static folder link",
          preview: (
            <div className="flex min-h-[260px] items-center justify-center px-6">
              <LiquidChromeButton
                size={96}
                borderWidth={8}
                speed={0}
                href="/docs/components"
                icon="folder"
                ariaLabel="Browse components"
              />
            </div>
          ),
          code: `import { LiquidChromeButton } from "@/components/ui/liquid-chrome-button"

<LiquidChromeButton
  size={96}
  borderWidth={8}
  speed={0}
  href="/docs/components"
  icon="folder"
  ariaLabel="Browse components"
/>`,
        },
      ]}
      installPackageName="liquid-chrome-button"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/liquid-chrome-button.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "size",
          type: "number",
          default: "112",
          description: "Button diameter, clamped from 40 to 300px.",
        },
        {
          name: "borderWidth",
          type: "number",
          default: "10",
          description: "Width of the animated chrome ring in pixels.",
        },
        {
          name: "speed",
          type: "number",
          default: "1",
          description:
            "WebGL liquid-motion multiplier. Use 0 for a static surface.",
        },
        {
          name: "glassOpacity",
          type: "number",
          default: "0.42",
          description: "Opacity of the frosted inner lens, from 0 to 1.",
        },
        {
          name: "icon",
          type: '"folder" | "lightning" | "cursor"',
          description: "Optional built-in center icon.",
        },
        {
          name: "customIcon",
          type: "ReactNode",
          description:
            "Custom SVG or React content, automatically contained in the glass lens.",
        },
        {
          name: "href",
          type: "string",
          description:
            "Renders an anchor when supplied; otherwise renders a button.",
        },
      ]}
    />
  );
}
