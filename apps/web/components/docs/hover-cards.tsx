import {HoverCards} from "@workspace/ui/components/hover-cards";

import {DocsPageLayout} from "@/components/docs-page-layout";
import {hoverCardsDemoItems} from "@/components/docs/previews/hover-cards-items";

import {readComponentSource} from "@/lib/source-code";
import { HoverCardsPlayground, HoverCardsPersonalizePanel } from "@/components/docs/previews/playgrounds/hover-cards";

const usageCode = `import { HoverCards, type HoverCardsItem } from "@/components/ui/hover-cards"

const portraits: HoverCardsItem[] = [
  {
    id: "soft-focus",
    src: "/images/portrait-01.jpg",
    alt: "Portrait in warm window light",
    label: "Soft Focus",
    description: "A quiet portrait shaped by warm light and subtle shadows.",
    textTone: "light",
  },
  {
    id: "silver-poise",
    src: "/images/portrait-02.jpg",
    alt: "Monochrome editorial portrait",
    label: "Silver Poise",
    description: "Monochrome restraint with a calm, cinematic presence.",
    textTone: "dark",
  },
]

export default function PortraitGallery() {
  return <HoverCards items={portraits} className="min-h-[42rem]" />
}`;

export async function HoverCardsDocs() {
  const sourceCode =
    (await readComponentSource("hover-cards")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Hover Cards"
      description="An editorial portrait row that opens the hovered card into a tall focal image while a blurred, full-bleed version of the same artwork washes across the stage. Pointer, keyboard, and tap interactions share the same responsive composition."
      preview={<HoverCardsPlayground />}
      personalizeContent={<HoverCardsPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      examples={[
        {
          title: "Autoplay through the set",
          preview: (
            <div className="w-full">
              <HoverCards
                items={hoverCardsDemoItems}
                autoPlay
                autoPlayInterval={2200}
                backdropBlur={64}
                className="min-h-[42rem]"
              />
            </div>
          ),
          code: `import { HoverCards } from "@/components/ui/hover-cards"

const portraits = [
  { id: "soft-focus", src: "/images/portrait-01.jpg", alt: "…", label: "Soft Focus", description: "…", textTone: "light" },
  { id: "silver-poise", src: "/images/portrait-02.jpg", alt: "…", label: "Silver Poise", description: "…", textTone: "dark" },
]

<HoverCards
  items={portraits}
  autoPlay
  autoPlayInterval={2200}
  backdropBlur={64}
  className="min-h-[42rem]"
/>`,
        },
        {
          title: "Opens on a chosen card",
          preview: (
            <div className="w-full">
              <HoverCards
                items={hoverCardsDemoItems.slice(0, 3)}
                initialActiveIndex={1}
                title="Selected Works"
                backdropBlur={20}
                className="min-h-[38rem]"
              />
            </div>
          ),
          code: `import { HoverCards } from "@/components/ui/hover-cards"

<HoverCards
  items={portraits}
  initialActiveIndex={1}
  title="Selected Works"
  backdropBlur={20}
  className="min-h-[38rem]"
/>`,
        },
      ]}
      installPackageName="hover-cards"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/hover-cards.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "items",
          type: "readonly HoverCardsItem[]",
          description:
            "Portrait source, alt text, label, description, crop position, and optional active-backdrop text tone for each card.",
        },
        {
          name: "title",
          type: "ReactNode",
          default: '"Hover Cards"',
          description: "Centered title above the portrait row.",
        },
        {
          name: "activeIndex",
          type: "number | null",
          description: "Controlled active card. Pass null for the idle layout.",
        },
        {
          name: "initialActiveIndex",
          type: "number | null",
          default: "null",
          description: "Initial active card for uncontrolled usage.",
        },
        {
          name: "onActiveIndexChange",
          type: "(index: number | null) => void",
          description:
            "Called when pointer, keyboard focus, or tap changes the active card.",
        },
        {
          name: "clearOnLeave",
          type: "boolean",
          default: "true",
          description:
            "Restore the equal-width idle row when a mouse leaves the composition.",
        },
        {
          name: "backdropBlur",
          type: "number",
          default: "44",
          description:
            "Blur radius, in pixels, for the expanded background image.",
        },
        {
          name: "autoPlay",
          type: "boolean",
          default: "false",
          description:
            "Auto-advance through cards on a timer. Pauses offscreen, in background tabs, and while hovered or focused.",
        },
        {
          name: "autoPlayInterval",
          type: "number",
          default: "3000",
          description: "Auto-play interval in milliseconds (minimum 800).",
        },
        {
          name: "pauseAutoPlayOnHover",
          type: "boolean",
          default: "true",
          description:
            "Pause auto-play while the pointer hovers or focus is inside the composition.",
        },
        {
          name: "showText",
          type: "boolean",
          default: "true",
          description:
            "Hide the title, index numbers, labels, and descriptions for compact previews.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for sizing and styling the stage.",
        },
      ]}
    />
  );
}
