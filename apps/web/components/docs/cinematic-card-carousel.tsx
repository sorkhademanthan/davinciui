import { CinematicCardCarousel } from "@workspace/ui/components/cinematic-card-carousel";
import { cinematicDemoCards } from "@/components/docs/previews/cinematic-card-carousel-items";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { CinematicCardCarouselPreview } from "@/components/docs/previews/cinematic-card-carousel-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { CinematicCardCarousel } from "@/components/ui/cinematic-card-carousel"

const items = [
  {
    id: "long-take",
    src: "/images/portrait-01.jpg",
    title: "A room built for one long take",
    description: "Single-source light, no cuts, no cover.",
  },
  {
    id: "loading-dock",
    src: "/images/portrait-02.jpg",
    title: "Rain on the loading dock",
    description: "Night exterior, practicals only.",
  },
  {
    id: "first-light",
    src: "/images/portrait-03.jpg",
    title: "Second unit, first light",
    description: "Golden hour held for one more setup.",
  },
]

<CinematicCardCarousel items={items} initialIndex={1} />`;

const usageCode = `import { CinematicCardCarousel, type CinematicCardItem } from "@/components/ui/cinematic-card-carousel"

const items: CinematicCardItem[] = [
  {
    id: "long-take",
    src: "/images/portrait-01.jpg",
    type: "image",
    title: "A room built for one long take",
    description: "Single-source light, no cuts, no cover.",
    alt: "Portrait lit by a single practical lamp",
  },
  {
    id: "festival-ident",
    src: "/videos/festival-ident.mp4",
    type: "video",
    title: "Festival ident, cutdown 04",
    description: "Six seconds, muted and looping.",
  },
]

export default function Gallery() {
  return (
    <CinematicCardCarousel
      items={items}
      initialIndex={0}
      loop
      onIndexChange={(index) => console.log("active card:", index)}
    />
  )
}`;

export async function CinematicCardCarouselDocs() {
  const sourceCode =
    (await readComponentSource("cinematic-card-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Cinematic Card Carousel"
      description="A cinematic depth-based card gallery — one sharp hero portrait stays dominant in the center while neighbors compress behind it with progressive scale, blur, and fade. Drag, swipe, or click any card to promote it with weighted spring physics."
      preview={<CinematicCardCarouselPreview />}
      previewCode={defaultCode}
      installPackageName="cinematic-card-carousel"
      installDependencies="framer-motion lucide-react clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/cinematic-card-carousel.tsx"
      importCode={`"use client";

import {
  CinematicCardCarousel,
  type CinematicCardItem,
} from "@/components/ui/cinematic-card-carousel";`}
      usageCode={usageCode}
      examples={[
        {
          title: "Stacked deck",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl">
              <CinematicCardCarousel
                items={cinematicDemoCards}
                initialIndex={0}
                className="h-full"
              />
            </div>
          ),
          code: `import { CinematicCardCarousel } from "@/components/ui/cinematic-card-carousel"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <CinematicCardCarousel items={items} initialIndex={0} className="h-full" />
</div>`,
        },
        {
          title: "Auto-advancing, no arrows",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl">
              <CinematicCardCarousel
                items={cinematicDemoCards}
                initialIndex={2}
                autoPlayInterval={4000}
                showArrows={false}
                className="h-full"
              />
            </div>
          ),
          code: `import { CinematicCardCarousel } from "@/components/ui/cinematic-card-carousel"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <CinematicCardCarousel
    items={items}
    initialIndex={2}
    autoPlayInterval={4000}
    showArrows={false}
    className="h-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      props={[
        {
          name: "items",
          type: "CinematicCardItem[]",
          description:
            "Cards shown in the deck. Each item has id, src, optional type ('image' | 'video'), title, description, and alt.",
        },
        {
          name: "initialIndex",
          type: "number",
          default: "0",
          description: "Card that starts in the center hero position.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description:
            "Wrap past the last card back to the first (and vice versa) with no visible reset.",
        },
        {
          name: "autoPlayInterval",
          type: "number",
          description:
            "Advance the deck automatically every N milliseconds. Disabled by default and when reduced motion is requested.",
        },
        {
          name: "onIndexChange",
          type: "(index: number) => void",
          description: "Callback fired when the active card changes.",
        },
        {
          name: "wheelNavigation",
          type: 'false | "horizontal" | "both"',
          default: '"horizontal"',
          description:
            'Sideways trackpad/mouse scroll moves the deck. "both" also captures vertical scroll; vertical page scroll is never trapped in "horizontal" mode.',
        },
        {
          name: "showArrows",
          type: "boolean",
          default: "true",
          description: "Show minimal translucent previous/next edge controls.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes for the gallery container.",
        },
      ]}
    />
  );
}
