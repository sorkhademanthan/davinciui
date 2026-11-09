import {Section} from "@/components/component-layout";
import {DemoFrame} from "@/components/docs/previews/demo-frame";
import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {GeometricPreloaderPlayground, GeometricPreloaderPersonalizePanel} from "@/components/docs/previews/preloader-playgrounds";

const defaultCode = `import { GeometricPreloader } from "@/components/ui/geometric-preloader"

export default function Page() {
  return (
    <main>
      <GeometricPreloader />
      <h1>Your page content</h1>
    </main>
  )
}`;

export async function GeometricPreloaderDocs() {
  const sourceCode =
    (await readComponentSource("geometric-preloader")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      hideExamples
      title="Geometric Preloader"
      description="A fullscreen geometric loader with nested rotating squares and a diamond-scale reveal."
      preview={<GeometricPreloaderPlayground />}
      personalizeContent={<GeometricPreloaderPersonalizePanel />}
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="geometric-preloader"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/geometric-preloader.tsx"
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/geometric-preloader"
              title="Geometric Preloader demo"
            />
          ),
          code: `import { GeometricPreloader } from "@/components/ui/geometric-preloader"

<GeometricPreloader />`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "duration",
          type: "number",
          default: "2200",
          description: "Milliseconds spent in the loading phase.",
        },
        {
          name: "holdDuration",
          type: "number",
          default: "180",
          description: "Milliseconds the completed geometric frame holds.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "720",
          description: "Milliseconds for the diamond-scale reveal.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: 'theme-aware ("#111111" / "#e8e6e3")',
          description:
            "Overlay background color. Defaults follow the page color scheme.",
        },
        {
          name: "foregroundColor",
          type: "string",
          default: 'theme-aware ("#f5f1e8" / "#1b1b19")',
          description:
            "Secondary square-line color. Defaults follow the page color scheme.",
        },
        {
          name: "accentColor",
          type: "string",
          default: '"#ff4d23"',
          description: "Accent line and progress color.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Color scheme for the defaults. Auto follows the page and updates live; explicit colors always win.",
        },
        {
          name: "showLabel",
          type: "boolean",
          default: "true",
          description: "Show the progress label in the center.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description: "Fires once after the reveal finishes.",
        },
      ]}
      afterContent={
        <Section title="About Geometric Preloader" className="pt-8">
          <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
            Nested square outlines create a precise geometric signal while the
            loading phase runs. The completed frame expands as a diamond to
            expose the page beneath it. Remount the component to replay the
            sequence.
          </p>
        </Section>
      }
    />
  );
}
