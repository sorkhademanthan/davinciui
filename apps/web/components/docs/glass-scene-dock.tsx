import {GlassSceneDock} from "@workspace/ui/components/glass-scene-dock";
import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import { GlassSceneDockPlayground, GlassSceneDockPersonalizePanel } from "@/components/docs/previews/playgrounds/glass-scene-dock";

const usageCode = `import { GlassSceneDock } from "@/components/ui/glass-scene-dock"

const scenes = [
  {
    id: "ember",
    title: "Ember glow",
    background: "linear-gradient(158deg, #fff8f0, #ffd8c0)",
    darkBackground: "linear-gradient(158deg, #1c0f08, #150a07)",
  },
  {
    id: "prism",
    title: "Prism drift",
    background: "linear-gradient(162deg, #f6f3ff, #d6ecff)",
    darkBackground: "linear-gradient(162deg, #120e24, #0a1830)",
  },
  { id: "tide", image: "/images/tide.jpg", alt: "Blue profile" },
]

export default function SceneSection() {
  // Omit image for pure-CSS gradient scenes — pass image to use photography.
  return <GlassSceneDock scenes={scenes} />
}`;

export async function GlassSceneDockDocs() {
  const sourceCode =
    (await readComponentSource("glass-scene-dock")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Glass Scene Dock"
      description="A floating glass navigation dock pinned over scroll-driven gradient scenes — no image files needed. A travelling glass highlight glides between icons while scrolling crossfades the backdrop. Pass image per scene to use photography instead. Fully light/dark aware."
      preview={<GlassSceneDockPlayground />}
      personalizeContent={<GlassSceneDockPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="glass-scene-dock"
      installDependencies="framer-motion, lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/glass-scene-dock.tsx"
      examples={[
        {
          title: "Card dock",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <GlassSceneDock
                mode="card"
                defaultIndex={0}
                enableScroll={false}
                className="h-full"
              />
            </div>
          ),
          code: `import { GlassSceneDock } from "@/components/ui/glass-scene-dock"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <GlassSceneDock mode="card" defaultIndex={0} enableScroll={false} className="h-full" />
</div>`,
        },
        {
          title: "Hover-only transitions",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <GlassSceneDock
                mode="preview"
                defaultIndex={1}
                enableScroll={false}
                enableHover
                transitionDuration={0.6}
                className="h-full"
              />
            </div>
          ),
          code: `import { GlassSceneDock } from "@/components/ui/glass-scene-dock"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <GlassSceneDock
    mode="preview"
    defaultIndex={1}
    enableScroll={false}
    enableHover
    transitionDuration={0.6}
    className="h-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "scenes",
          type: "GlassScene[]",
          description:
            "Background scenes in order: id plus either image (+ optional alt) for photography, or background / darkBackground CSS gradients — no files needed. Optional title for screen readers. The dock shows one item per scene.",
        },
        {
          name: "items",
          type: "GlassDockItem[]",
          description:
            "Dock controls (id, label, icon). Defaults to five thin-stroke icons: home, overview, focus, contact, settings.",
        },
        {
          name: "defaultIndex",
          type: "number",
          default: "0",
          description: "Initially selected scene and dock item.",
        },
        {
          name: "mode",
          type: '"card" | "preview" | "fullscreen"',
          default: '"preview"',
          description:
            "Density hint for the host surface. Card compacts the dock rhythm; layout otherwise follows the container width automatically.",
        },
        {
          name: "enableScroll",
          type: "boolean",
          default: "true",
          description:
            "When false the internal scroller locks and selection is click/keyboard only.",
        },
        {
          name: "enableHover",
          type: "boolean",
          default: "true",
          description:
            "Hovering an item glides the glass highlight, which stays where you leave it. Hover never moves the background — scenes travel on scroll, tap, click, or keyboard only. Touch and reduced-motion fall back to tap/click.",
        },
        {
          name: "transitionDuration",
          type: "number",
          default: "650",
          description:
            "Target crossfade settle time in milliseconds (200–2000). Tunes the scroll-smoothing spring.",
        },
        {
          name: "onSceneChange",
          type: "(index: number) => void",
          description:
            "Fires when the active scene changes via scroll, click, or keyboard.",
        },
      ]}
    />
  );
}
