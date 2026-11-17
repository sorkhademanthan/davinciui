import { ArcCarousel } from "@workspace/ui/components/arc-carousel";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ArcCarouselPlayground, ArcCarouselPersonalizePanel } from "@/components/docs/previews/premium-playgrounds";

const defaultCode = `import { ArcCarousel, type ArcCarouselItem } from "@/components/ui/arc-carousel"

const items: ArcCarouselItem[] = [
  { src: "/images/work/blue-double.jpg", alt: "Blue double exposure" },
  { src: "/images/work/red-echo.jpg", alt: "Red echo portrait" },
  { src: "/images/work/prism-portrait.jpg", alt: "Prism portrait" },
  { src: "/images/work/silver-motion.jpg", alt: "Silver motion study" },
  { src: "/images/work/orange-haze.jpg", alt: "Orange haze figure" },
  { src: "/images/work/green-portrait.jpg", alt: "Green lit portrait" },
  { src: "/images/work/red-blue-figure.jpg", alt: "Two-tone figure" },
  { src: "/images/work/crimson-profile.jpg", alt: "Crimson profile" },
  { src: "/images/work/teal-echo.jpg", alt: "Teal echo" },
  { src: "/images/work/visor-portrait.jpg", alt: "Visor portrait" },
  { src: "/images/work/white-motion.jpg", alt: "White motion study" },
  { src: "/images/work/camera-reflection.jpg", alt: "Camera reflection" },
]

export default function Work() {
  return (
    <ArcCarousel
      items={items}
      stepAngle={20}
      autoPlay
      className="h-full min-h-[420px]"
    >
      {null}
    </ArcCarousel>
  )
}`;

const usageCode = `import { ArcCarousel, type ArcCarouselItem } from "@/components/ui/arc-carousel"

const items: ArcCarouselItem[] = [
  { src: "/images/work/blue-double.jpg", type: "image", alt: "Blue double exposure" },
  { src: "/videos/work-loop.mp4", type: "video", alt: "Muted studio loop" },
]

export function WorkFan({ items }: { items: ArcCarouselItem[] }) {
  return (
    <ArcCarousel
      items={items}
      tileSize={250}
      radius={680}
      stepAngle={17}
      friction={0.94}
      snap
      autoPlay
      className="min-h-[760px]"
    />
  )
}`;

const arcExampleItems = [
  {
    src: "/images/spiral-3d-slider/blue-double.webp",
    alt: "Blue double exposure",
  },
  { src: "/images/spiral-3d-slider/red-echo.webp", alt: "Red echo portrait" },
  { src: "/images/spiral-3d-slider/prism-portrait.webp", alt: "Prism portrait" },
  {
    src: "/images/spiral-3d-slider/silver-motion.webp",
    alt: "Silver motion study",
  },
  {
    src: "/images/spiral-3d-slider/orange-haze.webp",
    alt: "Orange haze figure",
  },
  {
    src: "/images/spiral-3d-slider/green-portrait.webp",
    alt: "Green lit portrait",
  },
];

export async function ArcCarouselDocs() {
  const sourceCode =
    (await readComponentSource("arc-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Arc Carousel"
      description="A drag, wheel, and keyboard driven fan of media that rides a circular arc. Tiles stay tangent to the arc, wrap infinitely, and settle with inertia plus a soft critically damped spring."
      preview={<ArcCarouselPlayground />}
      personalizeContent={<ArcCarouselPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="arc-carousel"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/arc-carousel.tsx"
      usageCode={usageCode}
      fullWidthPreview
      examples={[
        {
          title: "Tighter fan with a heading",
          preview: (
            <div className="w-full">
              <ArcCarousel
                items={arcExampleItems}
                stepAngle={12}
                eyebrow="Selected"
                heading="Recent work"
                className="h-[420px]"
              />
            </div>
          ),
          code: `import { ArcCarousel } from "@/components/ui/arc-carousel"

<ArcCarousel
  items={items}
  stepAngle={12}
  eyebrow="Selected"
  heading="Recent work"
  className="h-[420px]"
/>`,
        },
        {
          title: "Autoplay, wider spread",
          preview: (
            <div className="w-full">
              <ArcCarousel
                items={arcExampleItems.slice(0, 4)}
                stepAngle={26}
                autoPlay
                snap={false}
                className="h-[420px]"
              />
            </div>
          ),
          code: `import { ArcCarousel } from "@/components/ui/arc-carousel"

<ArcCarousel
  items={items}
  stepAngle={26}
  autoPlay
  snap={false}
  className="h-[420px]"
/>`,
        },
      ]}
      props={[
        {
          name: "items",
          type: "ArcCarouselItem[]",
          description:
            "Media tiles riding the arc. Each item has src, optional type ('image' | 'video'), and alt. Fewer than 10 items are duplicated internally for a seamless loop.",
        },
        {
          name: "eyebrow",
          type: "string",
          default: '"OUR WORK"',
          description: "Small uppercase label above the heading.",
        },
        {
          name: "heading",
          type: "string",
          default: '"The most complete view of the work"',
          description: "Two-line display heading nested inside the arc.",
        },
        {
          name: "description",
          type: "string",
          default: "A living archive...",
          description: "Supporting copy below the heading.",
        },
        {
          name: "children",
          type: "React.ReactNode",
          description:
            "Overrides the default eyebrow/heading/description block with your own content.",
        },
        {
          name: "tileSize",
          type: 'number | "auto"',
          default: '"auto"',
          description:
            "Square tile edge in pixels. Auto uses 17.9% of the container width, clamped to 120–340px (42% on mobile).",
        },
        {
          name: "radius",
          type: 'number | "auto"',
          default: '"auto"',
          description:
            "Arc radius in pixels. Auto uses 0.587 × container width (0.9 × on mobile).",
        },
        {
          name: "stepAngle",
          type: "number",
          default: "16",
          description:
            "Angular distance between neighboring tiles in degrees. Mobile defaults to 20.",
        },
        {
          name: "friction",
          type: "number",
          default: "0.94",
          description:
            "Per-16ms velocity decay applied during release inertia. Higher values glide longer.",
        },
        {
          name: "snap",
          type: "boolean",
          default: "true",
          description:
            "Settles to the nearest tile with a soft spring after the velocity decays.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "false",
          description:
            "Adds a slow idle drift when the carousel is not being dragged. Disabled under reduced motion.",
        },
        {
          name: "onActiveChange",
          type: "(index: number) => void",
          description:
            "Fires whenever the tile nearest the top of the arc changes.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the section container.",
        },
      ]}
    />
  );
}
