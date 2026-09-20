import { DocsPageLayout } from "@/components/docs-page-layout";
import { CursorMaskRevealPreview } from "@/components/docs/previews/cursor-mask-reveal-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { CursorMaskReveal } from "@/components/ui/cursor-mask-reveal"

<CursorMaskReveal
  foregroundImage="/images/portrait-light.jpg"
  backgroundImage="/images/portrait-color.jpg"
  cursorImage="/images/orange-disc.svg"
  cursorSize={280}
  foregroundOpacity={0.18}
  foregroundBackground="#faf9f7"
  smoothing={0.18}
  className="h-screen"
/>`;

export async function CursorMaskRevealDocs() {
  const sourceCode = (await readComponentSource("cursor-mask-reveal")) || "// Unable to load source code";
  return <DocsPageLayout title="Cursor Mask Reveal" description="Replace the pointer with any transparent PNG or SVG mask to punch through a foreground image and reveal the background beneath it." preview={<CursorMaskRevealPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="cursor-mask-reveal" installSourceCode={sourceCode} installSourceFilename="components/ui/cursor-mask-reveal.tsx" fullWidthPreview unstyledPreview props={[
    { name: "backgroundImage", type: "string", description: "Image revealed inside the cursor mask." },
    { name: "foregroundImage", type: "string", description: "Image visible above the background outside the mask." },
    { name: "cursorImage", type: "string", description: "Transparent PNG or SVG used as the custom cursor and reveal mask." },
    { name: "alt", type: "string", default: '""', description: "Alternative text for the background image treatment." },
    { name: "cursorSize", type: "number", default: "280", description: "Custom cursor width and height in pixels." },
    { name: "foregroundOpacity", type: "number", default: "0.18", description: "Foreground image opacity outside the reveal." },
    { name: "foregroundBackground", type: "string", default: '"#faf9f7"', description: "Opaque ground behind the foreground image outside the reveal." },
    { name: "smoothing", type: "number", default: "0.18", description: "Follow smoothing from 0 (immediate) to 1 (slow)." },
    { name: "hideNativeCursor", type: "boolean", default: "true", description: "Hide the browser pointer while the custom mask is active." },
    { name: "disabled", type: "boolean", default: "false", description: "Keep the foreground visible and disable pointer tracking." },
    { name: "className", type: "string", description: "Classes for the containing reveal surface." },
    { name: "children", type: "ReactNode", description: "Optional content rendered over the image layers." },
  ]} />;
}
