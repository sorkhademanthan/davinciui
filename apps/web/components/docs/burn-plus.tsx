import { AshReveal } from "@workspace/ui/components/burn-plus";

import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BurnPlusPersonalizePanel,
  BurnPlusPreview,
} from "@/components/docs/previews/burn-plus-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { AshReveal } from "@/components/ui/burn-plus"

export function AshRevealHero() {
  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      <AshReveal
        media="/images/prism-portrait.jpg"
        trigger="hover"
        start={0.75}
        burn={0.7}
        density={0.5}
        distortion={0.38}
      />
    </div>
  )
}`;

export async function BurnPlusDocs() {
  const sourceCode =
    (await readComponentSource("burn-plus")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Burn Plus"
      description="A WebGL organic burn/dissolve mask — warped multi-octave noise eats through a dark surface to reveal your media, driven by hover, scroll, tap, load, or direct control."
      preview={<BurnPlusPreview />}
      personalizeContent={<BurnPlusPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="burn-plus"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/burn-plus.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Hover-triggered burn",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <AshReveal
                media="/images/prism-portrait.jpg"
                trigger="hover"
                start={0.15}
                end={0.85}
                density={0.35}
                distortion={0.45}
                duration={1400}
                className="h-full w-full"
                ariaLabel="Hover to burn away the surface"
              />
            </div>
          ),
          code: `import { AshReveal } from "@/components/ui/burn-plus"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <AshReveal
    media="/images/prism-portrait.jpg"
    trigger="hover"
    start={0.15}
    end={0.85}
    density={0.35}
    distortion={0.45}
    duration={1400}
    className="h-full w-full"
    ariaLabel="Hover to burn away the surface"
  />
</div>`,
        },
        {
          title: "Inverted burn",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <AshReveal
                media="/images/prism-portrait.jpg"
                trigger="load"
                invert
                background="#f5f5f4"
                density={0.12}
                distortion={0.08}
                duration={2600}
                className="h-full w-full"
                ariaLabel="Inverted burn reveal"
              />
            </div>
          ),
          code: `import { AshReveal } from "@/components/ui/burn-plus"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <AshReveal
    media="/images/prism-portrait.jpg"
    trigger="load"
    invert
    background="#f5f5f4"
    density={0.12}
    distortion={0.08}
    duration={2600}
    className="h-full w-full"
    ariaLabel="Inverted burn reveal"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "media",
          type: "string",
          description: "Image or video URL used as the revealed surface.",
        },
        {
          name: "mediaType",
          type: '"image" | "video" | "auto"',
          default: '"auto"',
          description: "Force media kind; auto detects video by extension.",
        },
        {
          name: "fit",
          type: '"cover" | "contain" | "fill"',
          default: '"cover"',
          description: "CSS object-fit behaviour reproduced in UV space.",
        },
        {
          name: "burn",
          type: "number",
          default: "0.7",
          description:
            'Reveal threshold 0–1. With trigger="manual" this is the live controlled value.',
        },
        {
          name: "density",
          type: "number",
          default: "0.5",
          description:
            "Burn field frequency 0–1: broad regions at 0, fine detail at 1.",
        },
        {
          name: "distortion",
          type: "number",
          default: "0.38",
          description:
            "Boundary turbulence 0–1: smooth contours at 0, aggressive warp at 1.",
        },
        {
          name: "edgeSoftness",
          type: "number",
          default: "0.05",
          description: "Edge half-width in field units 0–1.",
        },
        {
          name: "noiseScale",
          type: "number",
          default: "1",
          description: "Base frequency multiplier for the noise domain.",
        },
        {
          name: "octaves",
          type: "number",
          default: "4",
          description: "FBM octave count 1–5. Higher adds finer breakup.",
        },
        {
          name: "seed",
          type: "number",
          default: "1",
          description:
            "Pattern offset. Changing it rejumps the field; burn never does.",
        },
        {
          name: "edgeComplexity",
          type: "number",
          default: "0.6",
          description: "Fine breakup weight concentrated near the moving edge.",
        },
        {
          name: "start",
          type: "number",
          default: "0",
          description: "Animation endpoint: burn value at progress 0.",
        },
        {
          name: "end",
          type: "number",
          default: "1",
          description: "Animation endpoint: burn value at progress 1.",
        },
        {
          name: "completeAt",
          type: "number",
          default: "1",
          description:
            "Reveal progress that resolves the held frame into fully visible media.",
        },
        {
          name: "quality",
          type: "number",
          default: "1.75",
          description: "Desktop DPR cap for the backing buffer.",
        },
        {
          name: "mobileQuality",
          type: "number",
          default: "1.25",
          description: "DPR cap on coarse-pointer devices.",
        },
        {
          name: "background",
          type: "string",
          default: '"#000000"',
          description: "Colour of burned-away regions.",
        },
        {
          name: "invert",
          type: "boolean",
          default: "false",
          description: "Flip the mask: burn hides instead of reveals.",
        },
        {
          name: "trigger",
          type: '"manual" | "load" | "hover" | "tap" | "inview" | "scroll"',
          default: '"manual"',
          description: "What drives the burn progress uniform.",
        },
        {
          name: "direction",
          type: '"reveal" | "hide" | "alternate"',
          default: '"reveal"',
          description: "Playback direction; alternate ping-pongs when looping.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description: "Start load/inview animations automatically.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description: "Replay continuously after the completed state is held.",
        },
        {
          name: "loopDelay",
          type: "number",
          default: "1200",
          description:
            "Milliseconds to hold the completed reveal before restarting a loop.",
        },
        {
          name: "delay",
          type: "number",
          default: "0",
          description: "Autostart delay in milliseconds.",
        },
        {
          name: "duration",
          type: "number",
          default: "2000",
          description: "Full-sweep duration in milliseconds.",
        },
        {
          name: "transition",
          type: '"linear" | "easeIn" | "easeOut" | "easeInOut" | "custom"',
          default: '"easeInOut"',
          description: "Easing for time-based tweens (not scroll scrubbing).",
        },
        {
          name: "transitionBezier",
          type: "[number, number, number, number]",
          default: "[0.42, 0, 0.58, 1]",
          description: 'Custom cubic-bezier used when transition="custom".',
        },
        {
          name: "scrollStart",
          type: "number",
          default: "0",
          description: "Scroll-window start (element entering = 0).",
        },
        {
          name: "scrollEnd",
          type: "number",
          default: "1",
          description: "Scroll-window end (element leaving = 1).",
        },
        {
          name: "scrollSmoothing",
          type: "number",
          default: "0.25",
          description: "Scrub follow lag 0–0.99; 0 tracks raw scroll.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Burn reveal effect"',
          description: "Accessible label; the canvas itself is hidden from AT.",
        },
      ]}
    />
  );
}
