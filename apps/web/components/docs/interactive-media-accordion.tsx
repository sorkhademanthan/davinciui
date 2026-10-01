import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { InteractiveMediaAccordionDemoPreview } from "@/components/docs/previews/interactive-media-accordion-demo-preview";

const defaultCode = `import { InteractiveMediaAccordion } from "@/components/ui/interactive-media-accordion"

const items = [
  { id: "mist", media: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80", title: "Mountains of Mist", description: "Wander into nature's hands." },
  { id: "dunes", media: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80", title: "Golden Dunes", description: "Where the desert breathes." },
  { id: "tide", media: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80", title: "Emerald Tide", description: "Chase the endless horizon." },
]

export default function Demo() {
  return <InteractiveMediaAccordion items={items} trigger="scroll" height={340} scrollStep={700} />
}`;

export async function InteractiveMediaAccordionDocs() {
  const sourceCode =
    (await readComponentSource("interactive-media-accordion")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Interactive Media Accordion"
      description="A sticky media accordion that advances with scroll and reverses as you scroll back. Click or focus a card to select it directly; narrow layouts keep every card visible when space allows."
      preview={
        <InteractiveMediaAccordionDemoPreview
          src="/demo/interactive-media-accordion"
          title="Interactive Media Accordion Demo"
        />
      }
      previewCode={defaultCode}
      installPackageName="interactive-media-accordion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/interactive-media-accordion.tsx"
      usageCode={defaultCode}
      fullWidthPreview
      props={[
        { name: "items", type: "InteractiveMediaAccordionItem[]", description: "Gallery data. Each item needs an id + media (image or video URL), optional mediaType ('auto' | 'image' | 'video'), alt, title, description, and focal positionX / positionY (0–100). Works with any item count." },
        { name: "trigger", type: '"scroll" | "hover" | "click"', default: '"scroll"', description: "Scroll mode pins the gallery and advances one card per scroll band. Hover and click remain available for compact, non-scrolling placements." },
        { name: "scrollStep", type: "number", default: "800", description: "Scroll distance in pixels assigned to each item while trigger is scroll." },
        { name: "stickyTop", type: "number", default: "40", description: "Sticky offset from the top of the nearest scroll container." },
        { name: "activeIndex / initialActiveIndex", type: "number", default: "0", description: "Controlled active index, or the uncontrolled starting index." },
        { name: "onActiveChange", type: "(index: number) => void", description: "Fires whenever the expanded item changes." },
        { name: "height", type: "number", default: "600", description: "Gallery height in pixels." },
        { name: "gap", type: "number", default: "14", description: "Gap between cards in pixels (reduced automatically on narrow containers)." },
        { name: "collapsedWidth", type: "number", default: "132", description: "Inactive pill width on desktop. Tablet and mobile widths adapt via tabletCollapsedWidth / mobileCollapsedWidth." },
        { name: "radius / collapsedRadius", type: "number", default: "48 / collapsedWidth ÷ 2", description: "Active card radius and pill radius. The pill defaults to a capsule." },
        { name: "outerPadding", type: "number", default: "0", description: "Outer padding of the gallery in pixels." },
        { name: "fit", type: '"cover" | "contain"', default: '"cover"', description: "How media fills its card. Cover keeps the crop-window behavior." },
        { name: "textGradient / gradientStrength", type: "boolean / number", default: "true / 0.8", description: "Bottom gradient behind the active text, with 0–1 strength." },
        { name: "inactiveBrightness / inactiveSaturation", type: "number", default: "1 / 1", description: "Optional treatment for inactive pills. Defaults keep the original image." },
        { name: "titleSize / descriptionSize", type: "number", default: "40 / 15", description: "Active text sizes in pixels, scaled down on narrow containers." },
        { name: "titleFont / descriptionFont", type: "string", description: "Font families for the active title and subtitle." },
        { name: "titleColor / descriptionColor", type: "string", default: '"#ffffff" / white 82%', description: "Active text colors." },
        { name: "contentPadding", type: "[number, number]", default: "[40, 44]", description: "Active text inset [x, y] from the card edges." },
        { name: "textAlign", type: '"left" | "center" | "right"', default: '"left"', description: "Active text alignment." },
        { name: "autoPlay / autoPlayInterval", type: "boolean / number", default: "false / 4000", description: "Auto-advance in hover or click mode. Scroll mode always follows scroll position." },
        { name: "pauseAutoPlayOnHover", type: "boolean", default: "true", description: "Pause auto-play while the pointer is over the gallery." },
        { name: "duration / easing", type: "number / string", default: "650 / cubic-bezier(0.22, 1, 0.36, 1)", description: "Single shared transition for width, radius, and position." },
        { name: "reducedMotion", type: "boolean", default: "false", description: "Shorten transitions while preserving functionality. System preference is respected automatically." },
      ]}
    />
  );
}
