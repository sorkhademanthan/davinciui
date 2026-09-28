import { DocsPageLayout } from "@/components/docs-page-layout";
import { CircleCursorPreview } from "@/components/docs/previews/circle-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { CircleCursor } from "@/components/ui/circle-cursor"

export function App() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-white">
      <CircleCursor
        size={46}
        followSpeed={0.16}
        theme="auto"
        hideNativeCursor
      />
      {/* Your app remains fully interactive above the effect. */}
    </main>
  )
}`;

export async function CircleCursorDocs() {
  const sourceCode = (await readComponentSource("circle-cursor")) || "// Unable to load source code";
  return <DocsPageLayout title="Circle Cursor" description="A single solid orange follower circle with smooth requestAnimationFrame inertia, viewport-wide tracking, automatic touch-device disablement, and light/dark theme support." preview={<CircleCursorPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="circle-cursor" installSourceCode={sourceCode} installSourceFilename="components/ui/circle-cursor.tsx" fullWidthPreview unstyledPreview props={[
    { name: "size", type: "number", default: "46", description: "Diameter of the circle in pixels." },
    { name: "color", type: "string", default: '"#FF3B0A"', description: "Solid fill color used for both themes unless overridden by lightColor / darkColor." },
    { name: "lightColor", type: "string", default: '"#EA580C"', description: "Fill color used on light backgrounds." },
    { name: "darkColor", type: "string", default: '"#FF3B0A"', description: "Fill color used on dark backgrounds." },
    { name: "theme", type: '"auto" | "light" | "dark"', default: '"auto"', description: "Color scheme. \"auto\" follows the site theme live." },
    { name: "followSpeed", type: "number", default: "0.16", description: "Interpolation per frame from 0.12 (soft) to 0.22 (tight)." },
    { name: "hideNativeCursor", type: "boolean", default: "true", description: "Hide the browser cursor on fine-pointer devices while active." },
    { name: "zIndex", type: "number", default: "9999", description: "Overlay stacking order." },
    { name: "disabled", type: "boolean", default: "false", description: "Disable without unmounting." },
    { name: "disableManualInput", type: "boolean", default: "false", description: "Ignore real pointer input; follow only synthetic/programmatic movement (self-playing previews)." },
    { name: "containerRef", type: "RefObject<HTMLElement>", description: "Optionally constrain pointer tracking and rendering to a positioned host." },
    { name: "className", type: "string", description: "Classes for the cursor element." },
  ]} />;
}
