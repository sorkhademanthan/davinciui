import {AmbientStrip} from "@workspace/ui/components/ambient-strip";
import {ambientStripDemoItems} from "@/components/docs/previews/ambient-strip-items";
import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import { AmbientStripPlayground, AmbientStripPersonalizePanel } from "@/components/docs/previews/playgrounds/ambient-strip";

const defaultCode = `import { AmbientStrip } from "@/components/ui/ambient-strip"

const items = [
  {
    src: "/images/portrait-01.jpg",
    title: "Night call",
    subtitle: "Episode 04",
    tone: "dark",
  },
  {
    src: "/images/portrait-02.jpg",
    title: "The silver reel",
    subtitle: "Archive scan",
    tone: "light",
  },
  {
    src: "/videos/loading-dock.mp4",
    type: "video",
    poster: "/images/portrait-03.jpg",
    title: "Loading dock",
    subtitle: "Motion study",
  },
]

<AmbientStrip items={items} />`;

const usageCode = `import { AmbientStrip, type AmbientStripItem } from "@/components/ui/ambient-strip"

const items: AmbientStripItem[] = [
  {
    src: "/images/portrait-01.jpg",
    title: "Night call",
    subtitle: "Episode 04",
    tone: "dark",
    alt: "Portrait washed in deep blue light",
  },
  {
    src: "/images/portrait-02.jpg",
    title: "The silver reel",
    subtitle: "Archive scan",
    tone: "light",
    alt: "Silver portrait in a soft horizontal exposure",
  },
]

export default function MediaStrip() {
  return (
    <AmbientStrip
      items={items}
      cardWidth="auto"
      expandScale={1.18}
      blur={72}
      loop
      onActiveChange={(index) => console.log("active card:", index)}
    />
  )
}`;

export async function AmbientStripDocs() {
  const sourceCode =
    (await readComponentSource("ambient-strip")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Ambient Strip"
      description="A horizontal strip of portrait frames that expands the hovered or focused card while a blurred, full-bleed version of the same artwork crossfades behind the row. Drag, wheel, or use the arrow keys to travel the strip; touch devices expand whichever card sits at the center."
      preview={<AmbientStripPlayground />}
      personalizeContent={<AmbientStripPersonalizePanel />}
      previewCode={defaultCode}
      usageCode={usageCode}
      installPackageName="ambient-strip"
      installDependencies="clsx tailwind-merge framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/ambient-strip.tsx"
      examples={[
        {
          title: "Compact film strip",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl">
              <AmbientStrip
                items={ambientStripDemoItems}
                cardWidth={180}
                gap={10}
                loop
                badge="Drag to explore"
                className="h-full"
              />
            </div>
          ),
          code: `import { AmbientStrip } from "@/components/ui/ambient-strip"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <AmbientStrip
    items={items}
    cardWidth={180}
    gap={10}
    loop
    badge="Drag to explore"
    className="h-full"
  />
</div>`,
        },
        {
          title: "Soft focus, no badge",
          preview: (
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl">
              <AmbientStrip
                items={ambientStripDemoItems}
                cardWidth={210}
                blur={18}
                expandScale={1.05}
                loop
                className="h-full"
              />
            </div>
          ),
          code: `import { AmbientStrip } from "@/components/ui/ambient-strip"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <AmbientStrip
    items={items}
    cardWidth={210}
    blur={18}
    expandScale={1.05}
    loop
    className="h-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "items",
          type: "AmbientStripItem[]",
          description:
            "Frames in the strip. Each item needs src and can define type ('image' | 'video'), poster, title, subtitle, tone, and alt.",
        },
        {
          name: "cardWidth",
          type: 'number | "auto"',
          default: '"auto"',
          description:
            'Idle card width in pixels. "auto" keeps roughly four frames visible on desktop and snaps to a wider single-frame focus on small screens.',
        },
        {
          name: "expandScale",
          type: "number",
          default: "1.18",
          description:
            "How much taller the active frame grows when it is hovered, focused, or centered.",
        },
        {
          name: "gap",
          type: "number",
          default: "14",
          description: "Space between frames in CSS pixels.",
        },
        {
          name: "blur",
          type: "number",
          default: "72",
          description:
            "Backdrop blur radius for the full-bleed ambient layer, in CSS pixels.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description:
            "Repeat the strip seamlessly, keeping one tiled set of frames focusable for keyboard users.",
        },
        {
          name: "restColor",
          type: "string",
          default: '"theme surface"',
          description:
            "Override the flat surface behind the strip. Defaults to light gray in light mode and near-black in dark mode.",
        },
        {
          name: "activeIndex",
          type: "number | null",
          description:
            "Controlled active frame. When provided, the strip scrolls that frame toward the center and ignores hover, focus, and center-snap. Pass null to show the rest state.",
        },
        {
          name: "badge",
          type: "ReactNode",
          description:
            "Optional pill rendered in the bottom-right corner for hints or metadata.",
        },
        {
          name: "onActiveChange",
          type: "(index: number | null) => void",
          description:
            "Called with the active item index whenever the expanded frame changes, or null when nothing is active.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes for the host section, including its minimum height.",
        },
      ]}
    />
  );
}
