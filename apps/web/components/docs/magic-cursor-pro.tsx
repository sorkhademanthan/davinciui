import { DocsPageLayout } from "@/components/docs-page-layout";
import { MagicCursorProPreview } from "@/components/docs/previews/magic-cursor-pro-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { MagicCursorPro } from "@/components/ui/magic-cursor-pro"

<MagicCursorPro
  stiffness={400}
  damping={35}
  mass={1}
  clickSquish
  mixBlendMode="difference"
/>`;

export async function MagicCursorProDocs() {
  const sourceCode = (await readComponentSource("magic-cursor-pro")) || "// Unable to load source code";
  return <DocsPageLayout title="Magic Cursor Pro" description="A compact outlined cursor with natural spring weight, subtle click compression, dynamic blend support, and automatic touch/portrait disablement." preview={<MagicCursorProPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="magic-cursor-pro" installSourceCode={sourceCode} installSourceFilename="components/ui/magic-cursor-pro.tsx" fullWidthPreview unstyledPreview props={[
    { name: "customIcon", type: "string", description: "PNG, SVG, or data URL used instead of the default arrow." },
    { name: "invertDefaultIcon", type: "boolean", default: "false", description: "Swap the default arrow fill and outline." },
    { name: "iconSize", type: "number", default: "34", description: "Cursor icon width and height in pixels." },
    { name: "theme", type: '"auto" | "light" | "dark"', default: '"auto"', description: "Default arrow colors. Auto follows the site theme live." },
    { name: "mixBlendMode", type: "CSS mix-blend-mode", default: '"normal"', description: "Use difference or exclusion for dynamic background contrast." },
    { name: "clickSquish", type: "boolean", default: "true", description: "Compress and rebound the icon on primary clicks." },
    { name: "stiffness", type: "number", default: "400", description: "Spring pull toward the pointer." },
    { name: "damping", type: "number", default: "35", description: "Spring resistance; higher is tighter." },
    { name: "mass", type: "number", default: "1", description: "Cursor weight and trailing behavior." },
    { name: "hideSystemCursor", type: "boolean", default: "true", description: "Hide the browser cursor while the effect is active." },
    { name: "disableOnPortrait", type: "boolean", default: "true", description: "Disable on portrait screens in addition to touch devices." },
    { name: "zIndex", type: "number", default: "9999", description: "Overlay stacking order." },
    { name: "disabled", type: "boolean", default: "false", description: "Disable without unmounting." },
    { name: "disableManualInput", type: "boolean", default: "false", description: "Ignore real pointer input; follow only synthetic/programmatic movement (self-playing previews)." },
    { name: "containerRef", type: "RefObject<HTMLElement>", description: "Optionally constrain pointer tracking and rendering to a positioned host." },
    { name: "className", type: "string", description: "Classes for the cursor wrapper." },
  ]} />;
}
