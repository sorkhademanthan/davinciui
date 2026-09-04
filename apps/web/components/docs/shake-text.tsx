import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ShakeTextManualExample,
  ShakeTextPersonalizePanel,
  ShakeTextPlayground,
} from "@/components/docs/previews/shake-text-preview";
import { LiveCodeBlock } from "@/components/live-code-block";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { ShakeText } from "@/components/ui/shake-text"

<ShakeText
  text="SHAKER"
  trigger="mount"
/>`;

const manualCode = `import { useRef } from "react";
import { ShakeText, type ShakeTextHandle } from "@/components/ui/shake-text"

function Example() {
  const shakeRef = useRef<ShakeTextHandle>(null);

  return (
    <>
      <ShakeText ref={shakeRef} text="SHAKER" trigger="manual" />
      <button onClick={() => shakeRef.current?.shake()}>
        Shake it
      </button>
    </>
  );
}`;

export async function ShakeTextDocs() {
  const sourceCode =
    (await readComponentSource("shake-text")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Shake Text"
      description="A premium 3D layered text effect with a physical GSAP shake — five depth-stacked copies with dimensional black edges that jitter as one locked object."
      preview={<ShakeTextPlayground />}
      personalizeContent={<ShakeTextPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="shake-text"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/shake-text.tsx"
      usageCode={<LiveCodeBlock defaultCode={defaultCode} />}
      fullWidthPreview
      examples={[
        {
          title: "Manual trigger",
          preview: <ShakeTextManualExample />,
          code: manualCode,
        },
      ]}
      props={[
        { name: "text", type: "string", description: "Text rendered in the front layer and every depth layer.", default: '"SHAKER"' },
        { name: "as", type: '"h1" | "h2" | "h3" | "span" | "div"', default: '"h1"', description: "Semantic tag for the accessible front layer. Depth layers are always aria-hidden." },
        { name: "fontFamily", type: "string", default: '"Inter, sans-serif"', description: "Font family for every layer." },
        { name: "fontSize", type: "number | string", default: "137", description: "Font size. Numbers become px; strings pass through. Depth offsets scale with it." },
        { name: "fontWeight", type: "number", default: "900", description: "Font weight for every layer." },
        { name: "letterSpacing", type: "number | string", default: "0", description: "Letter spacing. Numbers become px." },
        { name: "frontColor", type: "string", default: '"rgb(231, 231, 231)"', description: "Front layer color." },
        { name: "layerColors", type: "[string, string, string, string]", default: "orange / violet / salmon / sand", description: "Back-to-front colors for the four depth layers." },
        { name: "depth", type: "number", default: "8", description: "Z-depth step per layer in px at the 137px reference size." },
        { name: "layerOffset", type: "number", default: "8", description: "Vertical offset step per layer in px at the 137px reference size." },
        { name: "perspective", type: "number", default: "1000", description: "CSS perspective of the wrapper in px." },
        { name: "shakeIntensity", type: "number", default: "1", description: "Multiplier for the shake keyframes." },
        { name: "shakeDuration", type: "number", default: "0.65", description: "Total shake duration in seconds." },
        { name: "shakeRepeat", type: "number", default: "0", description: "Extra timeline repeats per shake." },
        { name: "trigger", type: '"mount" | "hover" | "click" | "manual"', default: '"mount"', description: "How the shake is triggered. Manual exposes shake() via ref." },
        { name: "autoPlay", type: "boolean", default: "true", description: "Play once on mount (mount trigger only)." },
        { name: "className", type: "string", description: "Extra classes for the outer wrapper." },
        { name: "textClassName", type: "string", description: "Extra classes applied to the front text layer." },
      ]}
    />
  );
}
