import { DocsPageLayout } from "@/components/docs-page-layout";
import { AmbientStripPreview } from "@/components/docs/previews/ambient-strip-preview";
import { readComponentSource } from "@/lib/source-code";

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

<AmbientStrip items={items} badge="Hover to expand" />`;

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
      restColor="#c8c8c8"
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
      title="Ambient Strip"
      description="A horizontal strip of portrait frames that expands the hovered or focused card while a blurred, full-bleed version of the same artwork crossfades behind the row. Drag, wheel, or use the arrow keys to travel the strip; touch devices expand whichever card sits at the center."
      preview={<AmbientStripPreview />}
      previewCode={defaultCode}
      usageCode={usageCode}
      installPackageName="ambient-strip"
      installDependencies="clsx tailwind-merge framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/ambient-strip.tsx"
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
          default: '"#c8c8c8"',
          description: "Flat surface behind the strip when no frame is active.",
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
      accessibilityNote="Each frame is a labelled group with a screen-reader caption built from its title and subtitle (falling back to alt). Only one tiled set stays in the tab order, arrow keys move between frames, and focus outlines stay visible against the ambient artwork."
      motionNote="Expansion and ambient crossfades use spring and ease-out motion. When the user prefers reduced motion, transitions shorten to near-instant fades and the ambient drift is disabled."
    />
  );
}
