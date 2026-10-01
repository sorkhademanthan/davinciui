import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ScrollMediaExpandInteractivePreview } from "@/components/docs/previews/scroll-media-expand-interactive-preview";

const defaultCode = `import { ScrollMediaExpand } from "@/components/ui/scroll-media-expand"

export default function Page() {
  return (
    <ScrollMediaExpand
      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85"
      leftLabel="©2026"
      rightLabel="Showreel"
      overlayText="Play showreel"
    />
  )
}`;

export async function ScrollMediaExpandDocs() {
  const sourceCode =
    (await readComponentSource("scroll-media-expand")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Scroll Media Expand"
      description="A cinematic scroll zoom reveal that begins as a compact media capsule, expands width-first into a rounded frame, and then fills the viewport while the surrounding text fades away. The motion is fully reversible, responsive, and driven directly by scroll progress."
      fullWidthPreview
      preview={<ScrollMediaExpandInteractivePreview />}
      previewCode={defaultCode}
      installPackageName="scroll-media-expand"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-media-expand.tsx"
      usageCode={defaultCode}
      props={[
        {
          name: "src",
          type: "string",
          description:
            "Image or video URL revealed through the expanding window.",
        },
        {
          name: "mediaType",
          type: '"image" | "video" | "auto"',
          default: '"auto"',
          description:
            "How the media element is rendered. Auto detects video by file extension.",
        },
        {
          name: "poster",
          type: "string",
          description: "Poster frame for video media.",
        },
        {
          name: "leftLabel",
          type: "string",
          default: '"©2026"',
          description:
            "Label glued to the left edge of the media, pushed outward as it grows.",
        },
        {
          name: "rightLabel",
          type: "string",
          default: '"Showreel"',
          description:
            "Label glued to the right edge of the media, pushed outward as it grows.",
        },
        {
          name: "overlayText",
          type: "string",
          default: '"Play showreel"',
          description:
            "Center CTA text revealed once the media becomes a readable card (progress ~0.32 → 0.48).",
        },
        {
          name: "objectPosition",
          type: "string",
          default: '"50% 35%"',
          description:
            "Media focal point (CSS object-position). The container acts as a mask, so this stays stable.",
        },
        {
          name: "objectFit",
          type: '"cover" | "contain" | "fill"',
          default: '"cover"',
          description:
            "How media fills its window. Cover keeps the aperture-reveal behavior with no stretching.",
        },
        {
          name: "initialWidth",
          type: "number",
          description:
            "Rest-state pill width in px. Defaults to a responsive clamp (150–220px desktop, 90–140px mobile).",
        },
        {
          name: "initialHeight",
          type: "number",
          description:
            "Rest-state pill height in px. Defaults to a responsive clamp (28–42px desktop, 22–32px mobile).",
        },
        {
          name: "sectionHeight",
          type: "string | number",
          default: '"300vh"',
          description: "Height of the tall scroll track driving the scrub.",
        },
        {
          name: "viewportHeight",
          type: "string",
          default: '"100svh"',
          description:
            "Height of the pinned viewport (any CSS length). svh avoids mobile chrome jumps.",
        },
        {
          name: "startRadius",
          type: "number",
          default: "999",
          description: "Corner radius (px) of the rest-state pill.",
        },
        {
          name: "endRadius",
          type: "number",
          default: "0",
          description: "Corner radius (px) at fullscreen.",
        },
        {
          name: "showOverlay",
          type: "boolean",
          default: "true",
          description: "Show the center CTA overlay.",
        },
        {
          name: "showScrollHint",
          type: "boolean",
          default: "false",
          description:
            "Optionally show a minimal scroll cue at rest that dissolves when scrolling begins.",
        },
        {
          name: "smoothing",
          type: "number",
          default: "0",
          description:
            "Scroll-follow smoothing 0 (direct scrub) to 1. Keep at 0 so the timeline literally is the scroll position.",
        },
        {
          name: "enabled",
          type: "boolean",
          default: "true",
          description:
            "When false, renders a static accessible card instead of the pinned scroll effect.",
        },
        {
          name: "pauseOffscreenVideo",
          type: "boolean",
          default: "true",
          description: "Pause video media while the section is far offscreen.",
        },
        {
          name: "pauseWhenOffscreen",
          type: "boolean",
          default: "true",
          description:
            "Pause transform work while the section is far offscreen (IntersectionObserver with 600px margin).",
        },
        {
          name: "background",
          type: "string",
          default: '"var(--background, #fff)"',
          description:
            "Stage background. Uses the active theme token by default; pass any CSS color to override it.",
        },
        {
          name: "foreground",
          type: "string",
          default: '"var(--foreground, #111)"',
          description:
            "Label color. Uses the active theme token by default; pass any CSS color to override it.",
        },
      ]}
    />
  );
}
