import {DocsPageLayout} from "@/components/docs-page-layout";

import {ChromaticCursorPlayground, ChromaticCursorPersonalizePanel} from "@/components/docs/previews/cursor-playgrounds";
import {ChromaticCursorExampleStage} from "@/components/docs/previews/chromatic-cursor-preview";
import {readComponentSource} from "@/lib/source-code";

const usageCode = `import { ChromaticCursor } from "@/components/ui/chromatic-cursor"

export function App() {
  return (
    <main className="min-h-screen bg-[#07080c] text-white">
      <ChromaticCursor
        trailLength={40}
        splitDistance={5}
        fadeSpeed={0.25}
        size={9}
        tension={0.5}
        hideSystemCursor
      />
      {/* Your app remains fully interactive. */}
    </main>
  )
}`;

export async function ChromaticCursorDocs() {
  const sourceCode =
    (await readComponentSource("chromatic-cursor")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      hideExamples
      title="Chromatic Cursor"
      description="A lightweight RGB cursor trail with independently styled color channels, a soft glowing head, and smooth canvas motion."
      preview={<ChromaticCursorPlayground />}
      personalizeContent={<ChromaticCursorPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="chromatic-cursor"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/chromatic-cursor.tsx"
      examples={[
        {
          title: "RGB split trail",
          preview: (
            <ChromaticCursorExampleStage splitDistance={10} trailLength={14} />
          ),
          code: `"use client"

import { useRef } from "react"
import { ChromaticCursor } from "@/components/ui/chromatic-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <ChromaticCursor containerRef={ref} splitDistance={10} trailLength={14} />
    </div>
  )
}`,
        },
        {
          title: "Wide split, short trail",
          preview: (
            <ChromaticCursorExampleStage
              splitDistance={18}
              trailLength={8}
              label="Wider RGB separation"
            />
          ),
          code: `"use client"

import { useRef } from "react"
import { ChromaticCursor } from "@/components/ui/chromatic-cursor"

export function Section() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] cursor-none overflow-hidden rounded-xl">
      <ChromaticCursor containerRef={ref} splitDistance={18} trailLength={8} />
    </div>
  )
}`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "trailLength",
          type: "number",
          default: "40",
          description: "Maximum number of samples retained in the trail.",
        },
        {
          name: "splitDistance",
          type: "number",
          default: "5",
          description:
            "Perpendicular separation between RGB channels in pixels.",
        },
        {
          name: "fadeSpeed",
          type: "number",
          default: "0.25",
          description: "Fade rate from 0.05 (long) to 1 (quick).",
        },
        {
          name: "size",
          type: "number",
          default: "9",
          description: "Cursor head radius and stroke scale in pixels.",
        },
        {
          name: "tension",
          type: "number",
          default: "0.5",
          description: "Follow responsiveness from 0.05 (soft) to 1 (tight).",
        },
        {
          name: "glow",
          type: "boolean",
          default: "true",
          description:
            "Soft additive glow around the trail. Disable on small thumbnails to save GPU time.",
        },
        {
          name: "red",
          type: "string",
          default: '"#FF4040"',
          description: "Red trail channel color.",
        },
        {
          name: "green",
          type: "string",
          default: '"#3DFF88"',
          description: "Green trail channel color.",
        },
        {
          name: "blue",
          type: "string",
          default: '"#2E9BFF"',
          description: "Blue trail channel color.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Blending and core rendering scheme. Auto follows the site theme live.",
        },
        {
          name: "quality",
          type: '"low" | "medium" | "high"',
          default: '"high"',
          description: "Rendering detail and DPR cap.",
        },
        {
          name: "hideSystemCursor",
          type: "boolean",
          default: "false",
          description: "Hide the native cursor while the effect is active.",
        },
        {
          name: "containerRef",
          type: "RefObject<HTMLElement>",
          description:
            "Optionally constrain pointer tracking and rendering to a positioned host.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "9999",
          description: "Overlay stacking order.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Turn the effect off without unmounting it.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional class name applied to the canvas.",
        },
      ]}
    />
  );
}
