import { DocsPageLayout } from "@/components/docs-page-layout";
import { ArcwaveCarouselPreview } from "@/components/docs/previews/arcwave-carousel-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { ArcwaveCarousel } from "@/components/ui/arcwave-carousel"

const slides = [
  {
    type: "image",
    image: { src: "/images/work/blue-double.jpg", alt: "Blue double exposure" },
    title: "Blue Double",
    description: "Double exposure study",
  },
  {
    type: "image",
    image: { src: "/images/work/red-echo.jpg", alt: "Red echo portrait" },
    title: "Red Echo",
    description: "Long exposure portrait",
  },
]

export default function Work() {
  return (
    <ArcwaveCarousel
      slides={slides}
      cardSizeMode="fillHeight"
      heightPercent={82}
      autoplay
      className="h-[520px] w-full"
    />
  )
}`;

const usageCode = `"use client"

import {
  ArcwaveCarousel,
  type ArcwaveSlide,
} from "@/components/ui/arcwave-carousel"

const slides: ArcwaveSlide[] = [
  {
    type: "image",
    image: { src: "/images/work/photo-01.jpg", alt: "Describe the image" },
    title: "First slide",
    description: "Optional caption",
    link: { href: "/work/first", target: "_self" },
  },
  {
    type: "video",
    video: "/videos/work-loop.mp4",
    poster: "/images/work/poster.jpg",
    title: "Video slide",
    description: "Muted loop",
  },
]

export function WorkCarousel() {
  return (
    <ArcwaveCarousel
      slides={slides}
      cardSizeMode="fillHeight"
      heightPercent={78}
      autoplay
      autoplayMode="continuous"
      captionMode="hover"
      className="h-[560px] w-full"
    />
  )
}`;

export async function ArcwaveCarouselDocs() {
  const sourceCode =
    (await readComponentSource("arcwave-carousel")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Arcwave Carousel"
      description="An infinite CSS-3D carousel whose cards sit on the inside of a cylinder. The centre card faces forward while neighbouring cards curve away, fade, blur, and darken toward the silhouette. Drag, wheel, keyboard, snapping, autoplay, captions, links, and video are built in."
      preview={<ArcwaveCarouselPreview />}
      previewCode={defaultCode}
      installPackageName="arcwave-carousel"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/arcwave-carousel.tsx"
      usageCode={usageCode}
      fullWidthPreview
      examples={[]}
      props={[
        {
          name: "slides",
          type: "ArcwaveSlide[]",
          description:
            "Cards in the ring. Fewer than 20 slides are cloned internally for a seamless loop.",
        },
        {
          name: "cardSizeMode",
          type: '"fixed" | "fillHeight"',
          default: '"fixed"',
          description:
            "Use fixed card dimensions or derive the card height from the container.",
        },
        {
          name: "cardWidth",
          type: "number",
          default: "168",
          description: "Card width in pixels when cardSizeMode is fixed.",
        },
        {
          name: "cardHeight",
          type: "number",
          default: "240",
          description: "Card height in pixels when cardSizeMode is fixed.",
        },
        {
          name: "heightPercent",
          type: "number",
          default: "82",
          description:
            "Card height as a percentage of the container in fillHeight mode.",
        },
        {
          name: "gap",
          type: "number",
          default: "6.4",
          description: "Space between cards before cylinder scaling.",
        },
        {
          name: "cornerRadius",
          type: "number",
          default: "0",
          description: "Card corner radius in pixels.",
        },
        {
          name: "cylinderRadius",
          type: "number",
          default: "auto",
          description: "Override the computed cylinder radius.",
        },
        {
          name: "perspective",
          type: "number",
          default: "auto",
          description: "Override the CSS perspective distance.",
        },
        {
          name: "maxRotation",
          type: "number",
          default: "65",
          description: "Maximum card Y rotation in degrees.",
        },
        {
          name: "visibleArc",
          type: "number",
          default: "90",
          description: "Visible portion of the cylinder in degrees.",
        },
        {
          name: "sideOpacity",
          type: "number",
          default: "0.45",
          description: "Opacity of cards at the edge of the visible arc.",
        },
        {
          name: "sideBlur",
          type: "number",
          default: "2.4",
          description: "Blur in pixels at the edge of the visible arc.",
        },
        {
          name: "sideDarken",
          type: "number",
          default: "0",
          description: "Dark overlay strength on side cards.",
        },
        {
          name: "edgeFade",
          type: "number",
          default: "20",
          description: "Width of the left and right background fades in percent.",
        },
        {
          name: "background",
          type: "string",
          default: '"rgb(0, 0, 0)"',
          description: "Stage background color used by the edge fades.",
        },
        {
          name: "dragEnabled",
          type: "boolean",
          default: "true",
          description: "Enable pointer drag and momentum.",
        },
        {
          name: "wheelEnabled",
          type: "boolean",
          default: "true",
          description: "Enable horizontal and vertical wheel navigation.",
        },
        {
          name: "momentum",
          type: "number",
          default: "0.5",
          description: "Momentum multiplier applied after a drag.",
        },
        {
          name: "springStiffness",
          type: "number",
          default: "180",
          description: "Spring stiffness used to settle toward the target position.",
        },
        {
          name: "springDamping",
          type: "number",
          default: "27",
          description: "Spring damping used to settle toward the target position.",
        },
        {
          name: "snap",
          type: "boolean",
          default: "false",
          description: "Snap to the nearest card after interaction.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description: "Enable autoplay. Reduced motion disables it.",
        },
        {
          name: "autoplayMode",
          type: '"continuous" | "step"',
          default: '"continuous"',
          description: "Continuous drift or timed steps.",
        },
        {
          name: "autoplayDirection",
          type: '"left" | "right"',
          default: '"left"',
          description: "Direction of autoplay travel.",
        },
        {
          name: "autoplaySpeed",
          type: "number",
          default: "1",
          description: "Autoplay speed in slots per second.",
        },
        {
          name: "stepInterval",
          type: "number",
          default: "3",
          description: "Seconds between steps in step mode.",
        },
        {
          name: "resumeDelay",
          type: "number",
          default: "1",
          description: "Seconds to wait after interaction before autoplay resumes.",
        },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "false",
          description: "Pause autoplay while the pointer is over the carousel.",
        },
        {
          name: "captionMode",
          type: '"hover" | "always" | "center"',
          default: '"hover"',
          description: "When captions are visible.",
        },
        {
          name: "reveal",
          type: '"fade" | "slide" | "none"',
          default: '"slide"',
          description: "Caption reveal transition.",
        },
        {
          name: "videoPlayback",
          type: '"visible" | "centre" | "always"',
          default: '"visible"',
          description: "When video slides play.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Card carousel"',
          description: "Accessible label for the carousel region.",
        },
      ]}
    />
  );
}
