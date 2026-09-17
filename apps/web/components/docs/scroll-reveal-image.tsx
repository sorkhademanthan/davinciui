import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ScrollRevealImagePreview } from "@/components/docs/previews/scroll-reveal-image-preview";

const defaultCode = `import { ScrollRevealImage } from "@/components/ui/scroll-reveal-image"

const images = [
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1800&q=90",
    alt: "Noir portrait of a man on a black background",
  },
  {
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1800&q=90",
    alt: "Ember portrait of a woman against a deep red wall",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=90",
    alt: "Velvet portrait of a woman in a charcoal studio",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=90",
    alt: "Ashen portrait of a man against a gray studio wall",
  },
]

export default function Page() {
  return <ScrollRevealImage images={images} />
}`;

export async function ScrollRevealImageDocs() {
  const sourceCode =
    (await readComponentSource("scroll-reveal-image")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Scroll Reveal Image"
      description="A scroll scrubbed image sequence that lets the next frame arrive in a centered window before it takes over the backdrop. The result feels like a cinematic reveal without scroll hijacking."
      fullWidthPreview
      preview={
        <ScrollRevealImagePreview
          src="/demo/scroll-reveal-image"
          title="Scroll Reveal Image Demo"
        />
      }
      previewCode={defaultCode}
      installPackageName="scroll-reveal-image"
      installDependencies="framer-motion clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-reveal-image.tsx"
      usageCode={defaultCode}
      props={[
        { name: "images", type: "readonly ScrollRevealImageItem[]", description: "Images shown in scroll order. Each item can provide a wide backdrop source, a portrait reveal source, and alt text." },
        { name: "sectionHeight", type: "string", default: '"300vh"', description: "Height of the scroll runway that drives the sequence." },
        { name: "imageWidth", type: "string", default: '"clamp(15rem, 30vw, 38rem)"', description: "CSS width of the centered reveal window." },
        { name: "imageHeight", type: "string", default: '"clamp(22rem, 78vh, 52rem)"', description: "CSS height of the centered reveal window." },
        { name: "borderRadius", type: "string", default: '"0rem"', description: "CSS radius applied to the reveal window." },
        { name: "backgroundScale", type: "number", default: "1.08", description: "Scale applied to the full-bleed backdrop for a quiet parallax depth effect." },
        { name: "imageScale", type: "number", default: "1.04", description: "Scale applied inside the centered reveal window." },
        { name: "scrub", type: "number", default: "0.18", description: "Spring mass controlling how closely the motion follows the scroll position." },
        { name: "className", type: "string", description: "Additional classes applied to the scroll section." },
      ]}
    />
  );
}
