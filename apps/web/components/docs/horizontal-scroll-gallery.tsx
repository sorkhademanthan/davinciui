import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { HorizontalScrollGalleryPreview } from "@/components/docs/previews/horizontal-scroll-gallery-preview";

const defaultCode = `import { HorizontalScrollGallery } from "@/components/ui/horizontal-scroll-gallery"

const items = [
  {
    src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80",
    alt: "Green fern leaves",
    label: "Green Fern",
    widthRatio: 0.55,
  },
  {
    src: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80",
    alt: "Yellow flowers in bloom",
    label: "Yellow Flower",
    widthRatio: 0.72,
  },
  {
    src: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1600&q=80",
    alt: "Orange flowers",
    label: "Orange Flower",
    widthRatio: 0.66,
  },
  {
    src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&q=80",
    alt: "Purple flower field",
    label: "Purple Flower",
    widthRatio: 0.58,
  },
]

export default function Page() {
  return <HorizontalScrollGallery items={items} />
}`;

export async function HorizontalScrollGalleryDocs() {
  const sourceCode =
    (await readComponentSource("horizontal-scroll-gallery")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Horizontal Scroll Gallery"
      description="A pinned variable-width film strip — vertical page scroll drives a continuous horizontal image track with no snapping, no controls, and no autoplay. Fully reversible, dimension-driven, with responsive redistribution and reduced-motion fallback."
      fullWidthPreview
      preview={
        <HorizontalScrollGalleryPreview />
      }
      previewCode={defaultCode}
      installPackageName="horizontal-scroll-gallery"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/horizontal-scroll-gallery.tsx"
      usageCode={defaultCode}
      props={[
        { name: "items", type: "HorizontalScrollGalleryItem[]", description: "Media cards in track order. Each item supports src, alt, label, width (px or CSS length), and widthRatio (viewport fraction). Widths are clamped per breakpoint so partial edge cards are preserved." },
        { name: "gap", type: "number", default: "12", description: "Gap (px) between cards." },
        { name: "radius", type: "number", default: "10", description: "Corner radius (px) applied to every card." },
        { name: "inset", type: "number", default: "20", description: "Horizontal inset (px) at both track edges." },
        { name: "height", type: "string", default: '"clamp(300px, 38vw, 540px)"', description: "Card height (any CSS length). All cards share one height for the film-strip look." },
        { name: "viewportHeight", type: "string", default: '"100vh"', description: "Height of the pinned viewport (any CSS length)." },
        { name: "scrollDistance", type: "number", default: "1", description: "Vertical scroll distance multiplier. Section height = viewportHeight + horizontalTravel × scrollDistance. Slightly reduced on tablet/mobile." },
        { name: "smoothing", type: "number", default: "0.1", description: "Scroll-follow smoothing 0 (direct) to 1. Drives a critically damped spring so stops decelerate smoothly with no overshoot or snapping." },
        { name: "startOffset", type: "number", default: "0", description: "Initial track offset in px (≤ 0). Negative values pre-clip the first card. Clamped so no empty space appears." },
        { name: "endOffset", type: "number", default: "0", description: "Final track offset adjustment in px. Clamped against measured travel so the track never exposes empty space." },
        { name: "background", type: "string", description: "Surrounding background color. When omitted, the gallery follows the light/dark theme (white/black). The docs preview theme toggle switches it live." },
        { name: "objectFit", type: '"cover" | "contain" | "fill"', default: '"cover"', description: "How images fill their card." },
        { name: "objectPosition", type: "string", default: '"50% 50%"', description: "Image focal point (CSS object-position)." },
        { name: "enabled", type: "boolean", default: "true", description: "When false, renders a static accessible row instead of the pinned scroll effect." },
        { name: "pauseWhenOffscreen", type: "boolean", default: "true", description: "Pause transform work while the gallery is far offscreen (IntersectionObserver with 400px margin)." },
        { name: "scrollRoot", type: "React.RefObject<HTMLElement | null>", description: "Optional scroll-container ref for fixed-height previews or panels. When omitted, the gallery follows page scroll." },
        { name: "className", type: "string", description: "Additional classes applied to the scroll section." },
      ]}
    />
  );
}
