import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  InteractiveMediaAccordionPersonalizePanel,
  InteractiveMediaAccordionPlayground,
} from "@/components/docs/previews/interactive-media-accordion-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { InteractiveMediaAccordion } from "@/components/ui/interactive-media-accordion"

const items = [
  { id: "mist", media: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80", title: "Mountains of Mist", description: "Wander into nature's hands." },
  { id: "dunes", media: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80", title: "Golden Dunes", description: "Where the desert breathes." },
  { id: "tide", media: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80", title: "Emerald Tide", description: "Chase the endless horizon." },
  { id: "aurora", media: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80", title: "Northern Aurora", description: "Light dancing on winter skies." },
  { id: "forest", media: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80", title: "Silent Forest", description: "Listen to the trees whisper." },
]

export default function Demo() {
  return <InteractiveMediaAccordion items={items} trigger="hover" />
}`;

export async function InteractiveMediaAccordionDocs() {
  const sourceCode =
    (await readComponentSource("interactive-media-accordion")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Interactive Media Accordion"
      description="A horizontal accordion gallery — one media card stays expanded while the rest collapse into narrow pills. Hovering, tapping, or clicking another card smoothly transfers the expanded state with simultaneous width redistribution; images crop inside the card instead of stretching."
      preview={<InteractiveMediaAccordionPlayground />}
      personalizeContent={<InteractiveMediaAccordionPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="interactive-media-accordion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/interactive-media-accordion.tsx"
      usageCode={<LiveCodeBlock defaultCode={defaultCode} />}
      fullWidthPreview
      props={[
        { name: "items", type: "InteractiveMediaAccordionItem[]", description: "Gallery data. Each item needs an id + media (image or video URL), optional mediaType ('auto' | 'image' | 'video'), alt, title, description, and focal positionX / positionY (0–100). Works with any item count." },
        { name: "trigger", type: '"hover" | "click"', default: '"hover"', description: "Hover activates on pointer enter (touch falls back to tap); click mode requires a click or tap." },
        { name: "activeIndex / initialActiveIndex", type: "number", default: "0", description: "Controlled active index, or the uncontrolled starting index." },
        { name: "onActiveChange", type: "(index: number) => void", description: "Fires whenever the expanded item changes." },
        { name: "height", type: "number", default: "600", description: "Gallery height in pixels." },
        { name: "gap", type: "number", default: "14", description: "Gap between cards in pixels (reduced automatically on narrow containers)." },
        { name: "collapsedWidth", type: "number", default: "132", description: "Inactive pill width on desktop. Tablet and mobile widths adapt via tabletCollapsedWidth / mobileCollapsedWidth." },
        { name: "radius / collapsedRadius", type: "number", default: "48 / collapsedWidth ÷ 2", description: "Active card radius and pill radius. The pill defaults to a capsule." },
        { name: "outerPadding", type: "number", default: "0", description: "Outer padding of the gallery in pixels." },
        { name: "fit", type: '"cover" | "contain"', default: '"cover"', description: "How media fills its card. Cover keeps the crop-window behavior." },
        { name: "textGradient / gradientStrength", type: "boolean / number", default: "true / 0.55", description: "Subtle bottom gradient behind the active text, with 0–1 strength." },
        { name: "inactiveBrightness / inactiveSaturation", type: "number", default: "1 / 1", description: "Optional treatment for inactive pills. Defaults keep the original image." },
        { name: "titleSize / descriptionSize", type: "number", default: "40 / 15", description: "Active text sizes in pixels, scaled down on narrow containers." },
        { name: "titleFont / descriptionFont", type: "string", description: "Font families for the active title and subtitle." },
        { name: "titleColor / descriptionColor", type: "string", default: '"#ffffff" / white 82%', description: "Active text colors." },
        { name: "contentPadding", type: "[number, number]", default: "[40, 44]", description: "Active text inset [x, y] from the card edges." },
        { name: "textAlign", type: '"left" | "center" | "right"', default: '"left"', description: "Active text alignment." },
        { name: "autoPlay / autoPlayInterval", type: "boolean / number", default: "false / 4000", description: "Auto-advance through items on an interval (ms)." },
        { name: "pauseAutoPlayOnHover", type: "boolean", default: "true", description: "Pause auto-play while the pointer is over the gallery." },
        { name: "duration / easing", type: "number / string", default: "650 / cubic-bezier(0.22, 1, 0.36, 1)", description: "Single shared transition for width, radius, and position." },
        { name: "reducedMotion", type: "boolean", default: "false", description: "Shorten transitions while preserving functionality. System preference is respected automatically." },
      ]}
    />
  );
}
