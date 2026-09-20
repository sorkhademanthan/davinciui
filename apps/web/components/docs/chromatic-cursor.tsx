import { DocsPageLayout } from "@/components/docs-page-layout";
import { ChromaticCursorPreview } from "@/components/docs/previews/chromatic-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { ChromaticCursor } from "@/components/ui/chromatic-cursor"

export function App() {
  return (
    <main className="min-h-screen bg-[#07080c] text-white">
      <ChromaticCursor
        trailLength={64}
        splitDistance={4}
        fadeSpeed={0.1}
        size={8}
        tension={0.2}
        hideSystemCursor
      />
      {/* Your app remains fully interactive. */}
    </main>
  )
}`;

export async function ChromaticCursorDocs() {
  const sourceCode = (await readComponentSource("chromatic-cursor")) || "// Unable to load source code";
  return <DocsPageLayout title="Chromatic Cursor" description="A lightweight RGB cursor trail with independently styled color channels, a soft glowing head, and smooth canvas motion." preview={<ChromaticCursorPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="chromatic-cursor" installSourceCode={sourceCode} installSourceFilename="components/ui/chromatic-cursor.tsx" fullWidthPreview unstyledPreview props={[
    { name: "trailLength", type: "number", default: "64", description: "Maximum number of samples retained in the trail." },
    { name: "splitDistance", type: "number", default: "4", description: "Perpendicular separation between RGB channels in pixels." },
    { name: "fadeSpeed", type: "number", default: "0.1", description: "Fade rate from 0.05 (long) to 1 (quick)." },
    { name: "size", type: "number", default: "8", description: "Cursor head radius and stroke scale in pixels." },
    { name: "tension", type: "number", default: "0.2", description: "Follow smoothing from 0.05 (soft) to 1 (direct)." },
    { name: "red", type: "string", default: '"#FF3C3C"', description: "Red trail channel color." },
    { name: "green", type: "string", default: '"#78FFA0"', description: "Green trail channel color." },
    { name: "blue", type: "string", default: '"#0095FF"', description: "Blue trail channel color." },
    { name: "hideSystemCursor", type: "boolean", default: "false", description: "Hide the native cursor while the effect is active." },
    { name: "containerRef", type: "RefObject<HTMLElement>", description: "Optionally constrain pointer tracking and rendering to a positioned host." },
    { name: "zIndex", type: "number", default: "9999", description: "Overlay stacking order." },
    { name: "disabled", type: "boolean", default: "false", description: "Turn the effect off without unmounting it." },
    { name: "className", type: "string", description: "Additional class name applied to the canvas." },
  ]} />;
}
