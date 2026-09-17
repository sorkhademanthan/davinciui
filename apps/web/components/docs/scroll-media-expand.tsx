import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ScrollMediaExpandInteractivePreview } from "@/components/docs/previews/scroll-media-expand-interactive-preview";

const defaultCode = `import { ScrollMediaExpand } from "@/components/ui/scroll-media-expand"

export default function Page() {
  return (
    <ScrollMediaExpand
      src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80"
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
      description="A tiny centered media pill that blooms into a fullscreen cinematic scene — width first, then height — with smootherstep-glided phases, labels physically pushed off-frame, a parallax settle inside the mask, and a glass play CTA that arrives once the card turns readable. One normalized scroll progress drives every frame, forward and back."
      fullWidthPreview
      preview={<ScrollMediaExpandInteractivePreview />}
      previewCode={defaultCode}
      installPackageName="scroll-media-expand"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-media-expand.tsx"
      usageCode={defaultCode}
      props={[
        { name: "src", type: "string", description: "Image or video URL revealed through the expanding window." },
        { name: "mediaType", type: '"image" | "video" | "auto"', default: '"auto"', description: "How the media element is rendered. Auto detects video by file extension." },
        { name: "poster", type: "string", description: "Poster frame for video media." },
        { name: "leftLabel", type: "string", default: '"©2026"', description: "Label glued to the left edge of the media, pushed outward as it grows." },
        { name: "rightLabel", type: "string", default: '"Showreel"', description: "Label glued to the right edge of the media, pushed outward as it grows." },
        { name: "overlayText", type: "string", default: '"Play showreel"', description: "Center CTA text revealed once the media becomes a readable card (progress ~0.32 → 0.48)." },
        { name: "objectPosition", type: "string", default: '"50% 50%"', description: "Media focal point (CSS object-position). The container acts as a mask, so this stays stable." },
        { name: "objectFit", type: '"cover" | "contain" | "fill"', default: '"cover"', description: "How media fills its window. Cover keeps the aperture-reveal behavior with no stretching." },
        { name: "initialWidth", type: "number", description: "Rest-state pill width in px. Defaults to a responsive clamp (72–110px desktop, 80–110px mobile)." },
        { name: "initialHeight", type: "number", description: "Rest-state pill height in px. Defaults to a responsive clamp (14–20px desktop, 16–22px mobile)." },
        { name: "sectionHeight", type: "string | number", default: '"300vh"', description: "Height of the tall scroll track driving the scrub." },
        { name: "viewportHeight", type: "string", default: '"100svh"', description: "Height of the pinned viewport (any CSS length). svh avoids mobile chrome jumps." },
        { name: "startRadius", type: "number", default: "999", description: "Corner radius (px) of the rest-state pill." },
        { name: "endRadius", type: "number", default: "0", description: "Corner radius (px) at fullscreen." },
        { name: "showOverlay", type: "boolean", default: "true", description: "Show the center CTA overlay." },
        { name: "showScrollHint", type: "boolean", default: "true", description: "Show a minimal scroll cue at rest that dissolves the moment scrolling begins." },
        { name: "smoothing", type: "number", default: "0", description: "Scroll-follow smoothing 0 (direct scrub) to 1. Keep at 0 so the timeline literally is the scroll position." },
        { name: "enabled", type: "boolean", default: "true", description: "When false, renders a static accessible card instead of the pinned scroll effect." },
        { name: "pauseOffscreenVideo", type: "boolean", default: "true", description: "Pause video media while the section is far offscreen." },
        { name: "pauseWhenOffscreen", type: "boolean", default: "true", description: "Pause transform work while the section is far offscreen (IntersectionObserver with 600px margin)." },
        { name: "background", type: "string", default: '"#fff"', description: "Stage background color." },
        { name: "foreground", type: "string", default: '"#111"', description: "Label color." },
      ]}
    />
  );
}
