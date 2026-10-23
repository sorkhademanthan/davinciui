import React from "react";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ScrollTimelinePreview } from "@/components/docs/previews/scroll-timeline-preview";

const defaultCode = `import { ScrollTimeline } from "@/components/ui/scroll-timeline"

const items = [
  {
    year: "2015",
    index: "01",
    title: "ORIGINS",
    description: "Founded as a three-person design collective crafting brand identities and early web experiments.",
    background: "#1D4ED8",
    foreground: "#FFFFFF",
  },
  {
    year: "2017",
    index: "02",
    title: "BREAKTHROUGH",
    description: "Won our first international commission and grew into a full-service product studio.",
    background: "#F97316",
    foreground: "#111111",
  },
  {
    year: "2020",
    index: "03",
    title: "REMOTE-FIRST",
    description: "Rebuilt around distributed collaboration and launched an R&D lab for immersive storytelling.",
    background: "#0D9488",
    foreground: "#FFFFFF",
  },
]

export default function Demo() {
  return (
    <div className="w-full">
      <ScrollTimeline
        items={items}
        yearSize="clamp(9rem, 19vw, 20rem)"
        descriptionWidth="min(28rem, 30vw)"
      />
    </div>
  )
}`;

export async function ScrollTimelineDocs() {
  const sourceCode =
    (await readComponentSource("scroll-timeline")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Scroll Timeline"
      description="Pinned fullscreen year timeline — vertical scroll collapses each panel horizontally via clip-path while the oversized year rotates around its bottom-left anchor, exposing the next era underneath. Fully reversible and driven directly by scroll progress."
      preview={
        <ScrollTimelinePreview
          src="/demo/scroll-timeline"
          title="Scroll Timeline Demo"
        />
      }
      previewCode={defaultCode}
      installPackageName="scroll-timeline"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-timeline.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/scroll-timeline"
              title="Scroll Timeline demo"
            />
          ),
          code: `import { ScrollTimeline } from "@/components/ui/scroll-timeline"

<ScrollTimeline items={milestones} />`,
        },
      ]}
      fullWidthPreview={true}
      props={[
        {
          name: "items",
          type: "TimelineItem[]",
          description:
            "Timeline entries in order. Each item needs year, background and foreground, plus optional index, title and description. Supports any item count.",
        },
        {
          name: "scrollPerItem",
          type: "number",
          default: "100",
          description:
            "Scroll distance devoted to each transition, in vh. Total track = viewport + distance × (items − 1).",
        },
        {
          name: "rotationAmount",
          type: "number",
          default: "82",
          description:
            "Final counter-clockwise year rotation in degrees, around the bottom-left anchor.",
        },
        {
          name: "yearSize",
          type: "string",
          default: '"clamp(9rem, 19vw, 20rem)"',
          description:
            "CSS font-size for the oversized year. Kept at full size while panels collapse so the mask slices the type.",
        },
        {
          name: "descriptionWidth",
          type: "string",
          default: '"min(28rem, 30vw)"',
          description: "CSS width for the upper-right description block.",
        },
        {
          name: "easing",
          type: '"linear" | "smooth"',
          default: '"smooth"',
          description: "Easing applied to each transition's local progress.",
        },
        {
          name: "viewportHeight",
          type: "string",
          default: '"100vh"',
          description: "Height of the pinned viewport (any CSS length).",
        },
        {
          name: "smoothing",
          type: "number",
          default: "0",
          description:
            "Scroll-follow smoothing 0 (direct scrub) to 1. Keep at 0 so the timeline literally is the scroll position.",
        },
        {
          name: "disableAnimation",
          type: "boolean",
          default: "false",
          description:
            "When true, renders a static accessible list instead of the pinned scroll effect.",
        },
        {
          name: "pauseWhenOffscreen",
          type: "boolean",
          default: "true",
          description:
            "Pause transform work while the section is far offscreen (IntersectionObserver with 600px margin).",
        },
      ]}
    />
  );
}
