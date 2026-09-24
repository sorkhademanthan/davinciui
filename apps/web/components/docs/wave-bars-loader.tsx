import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  WaveBarsLoaderPersonalizePanel,
  WaveBarsLoaderPreview,
  WaveBarsLoaderSizePreview,
  WaveBarsLoaderColorPreview,
  WaveBarsLoaderSpeedPreview,
  WaveBarsLoaderGlowPreview,
} from "@/components/docs/previews/wave-bars-loader-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { WaveBarsLoader } from "@/components/ui/wave-bars-loader"`;
const defaultCode = `<WaveBarsLoader />`;

export async function WaveBarsLoaderDocs() {
  const sourceCode =
    (await readComponentSource("wave-bars-loader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Wave Bars Loader"
      description="A deterministic 4-bar traveling-wave loader with mint bars morphing through descending, flat, and ascending states."
      preview={<WaveBarsLoaderPreview />}
      personalizeContent={<WaveBarsLoaderPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="wave-bars-loader"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/wave-bars-loader.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Size",
          preview: <WaveBarsLoaderSizePreview />,
          code: `<WaveBarsLoader size={32} />\n<WaveBarsLoader size={60} />\n<WaveBarsLoader size={96} />`,
        },
        {
          title: "Color",
          preview: <WaveBarsLoaderColorPreview />,
          code: `<WaveBarsLoader color="#42E6C6" />\n<WaveBarsLoader color="#7C6CFF" />\n<WaveBarsLoader color="#FF6B6B" />`,
        },
        {
          title: "Speed",
          preview: <WaveBarsLoaderSpeedPreview />,
          code: `<WaveBarsLoader speed={0.5} />\n<WaveBarsLoader speed={1} />\n<WaveBarsLoader speed={2} />`,
        },
        {
          title: "Glow",
          preview: <WaveBarsLoaderGlowPreview />,
          code: `<WaveBarsLoader glow={false} />\n<WaveBarsLoader glow />\n<WaveBarsLoader glow glowIntensity={2} />`,
        },
      ]}
      props={[
        { name: "size", type: "number", default: "60", description: "Total height in px; bar width, gap, radius, and glow scale from it." },
        { name: "color", type: "string", default: '"#42E6C6"', description: "Solid fill color of the bars." },
        { name: "speed", type: "number", default: "1", description: "Speed multiplier. 1 = reference speed, 0.5 = slower, 2 = faster." },
        { name: "gap", type: "number", default: "size * 0.11", description: "Horizontal gap between bars in px." },
        { name: "barWidth", type: "number", default: "size * 0.32", description: "Width of each bar in px." },
        { name: "borderRadius", type: "number", default: "barWidth * 0.3", description: "Corner radius of each bar in px." },
        { name: "glow", type: "boolean", default: "true", description: "Enables a subtle soft aura around the bars." },
        { name: "glowIntensity", type: "number", default: "1", description: "Glow strength multiplier." },
        { name: "paused", type: "boolean", default: "false", description: "Freezes the animation." },
        { name: "ariaLabel", type: "string", default: '"Loading"', description: "Accessible label for the loading status." },
        { name: "className", type: "string", description: "Additional CSS classes for the loader wrapper." },
      ]}
    />
  );
}
