import { DocsPageLayout } from "@/components/docs-page-layout";
import { CrumpledPaperRevealPreview } from "@/components/docs/previews/crumpled-paper-reveal-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { CrumpledPaperReveal } from "@/components/ui/crumpled-paper-reveal"

<CrumpledPaperReveal
  image={{
    src: "/images/coastal-tree.jpg",
    alt: "A wind-shaped tree on a pale coastal hillside",
  }}
  trigger="hover"
  shape="Tight Wad"
  aspect="4:5"
/>`;

const usageCode = `import { CrumpledPaperReveal } from "@/components/ui/crumpled-paper-reveal"

export function FieldPrint() {
  return (
    <CrumpledPaperReveal
      image={{
        src: "/images/coastal-tree.jpg",
        alt: "A wind-shaped tree on a pale coastal hillside",
      }}
      alt="A wind-shaped tree on a pale coastal hillside"
      trigger="hover"
      shape="Tight Wad"
      aspect="4:5"
      duration={1}
      finish="matte"
      creaseDepth={0.5}
      shadow={0.5}
      curl={0.3}
    />
  )
}`;

export async function CrumpledPaperRevealDocs() {
  const sourceCode =
    (await readComponentSource("crumpled-paper-reveal")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Crumpled Paper Reveal"
      description="An image that begins as a tight, faceted paper wad and unfolds into a flat print with its creases intact. Hover, click, scroll, or enter the viewport to reveal; the whole surface is procedural WebGL2 with a CSS print fallback."
      preview={<CrumpledPaperRevealPreview />}
      previewCode={defaultCode}
      usageCode={usageCode}
      installPackageName="crumpled-paper-reveal"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/crumpled-paper-reveal.tsx"
      props={[
        {
          name: "image",
          type: "string | { src?: string; srcSet?: string; alt?: string; sizes?: string }",
          description:
            "Image source. A string or an image object; the texture is uploaded with crossOrigin anonymous.",
        },
        {
          name: "alt",
          type: "string",
          default: '""',
          description:
            "Accessible name for the reveal surface. Falls back to a generic label when empty.",
        },
        {
          name: "trigger",
          type: '"hover" | "click" | "inView" | "scroll"',
          default: '"hover"',
          description:
            "How the sheet unfolds. Scroll maps progress to the viewport instead of playing a fixed animation.",
        },
        {
          name: "replay",
          type: "boolean",
          default: "false",
          description: "Collapse again when the component leaves the viewport.",
        },
        {
          name: "duration",
          type: "number",
          default: "1",
          description: "Reveal duration in seconds; collapse runs at 60% of it.",
        },
        {
          name: "easing",
          type: '"Smooth" | "Snappy" | "Springy"',
          default: '"Springy"',
          description:
            "Spring character. Springy adds the billow, overshoot, and settle.",
        },
        {
          name: "shape",
          type: '"Sphere" | "Tight Wad" | "Loose Wad" | "Egg" | "Pebble" | "Pillow" | "Cube" | "Shard" | "Cone" | "Disc" | "Twist" | "Burst"',
          default: '"Tight Wad"',
          description: "Silhouette of the collapsed wad.",
        },
        {
          name: "aspect",
          type: '"1:1" | "4:5" | "3:4" | "4:3" | "3:2" | "16:9"',
          default: '"4:5"',
          description: "Sheet aspect; the image is cover-fit and focal-pointed.",
        },
        {
          name: "focalX",
          type: "number",
          default: "50",
          description: "Horizontal focal point of the cover fit, 0–100.",
        },
        {
          name: "focalY",
          type: "number",
          default: "50",
          description: "Vertical focal point of the cover fit, 0–100.",
        },
        {
          name: "paperColor",
          type: "string",
          default: '"#F4EFE4"',
          description: "Unprinted paper color around the image and on the reverse.",
        },
        {
          name: "backColor",
          type: "string",
          default: '"#EFE8D8"',
          description: "Shaded reverse-side paper color.",
        },
        {
          name: "margin",
          type: "number",
          default: "0",
          description: "Baked print margin in pixels, up to 80.",
        },
        {
          name: "radius",
          type: "number",
          default: "0",
          description: "Corner radius in pixels, up to 48.",
        },
        {
          name: "finish",
          type: '"matte" | "satin" | "gloss"',
          default: '"matte"',
          description: "Paper specular response used by the pointer light.",
        },
        {
          name: "creaseDepth",
          type: "number",
          default: "0.5",
          description: "Strength of the baked crease lines and facet shading.",
        },
        {
          name: "ballSize",
          type: "number",
          default: "0.45",
          description: "Collapsed wad size relative to the sheet.",
        },
        {
          name: "shadow",
          type: "number",
          default: "0.5",
          description: "Contact shadow opacity around the wad and print.",
        },
        {
          name: "curl",
          type: "number",
          default: "0.3",
          description: "Corner curl on the settled print.",
        },
        {
          name: "pointerLight",
          type: "boolean",
          default: "true",
          description: "Follow the pointer with a paper highlight and curl lift.",
        },
        {
          name: "link",
          type: "string | { href?: string; target?: string }",
          description:
            "Optional destination. The first activation reveals, the next opens the link.",
        },
        {
          name: "autoPlayInterval",
          type: "number",
          default: "0",
          description:
            "Cycle the reveal automatically every N milliseconds. Used by galleries; disabled for reduced motion.",
        },
        {
          name: "previewMode",
          type: "boolean",
          default: "false",
          description:
            "Decorative gallery mode: the overlay is inert, unfocusable, and hidden from assistive technology.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes applied to the root wrapper.",
        },
      ]}
    />
  );
}
