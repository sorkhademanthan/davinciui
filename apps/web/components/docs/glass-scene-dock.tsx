import { DocsPageLayout } from "@/components/docs-page-layout";
import { GlassSceneDockPreview } from "@/components/docs/previews/glass-scene-dock-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { GlassSceneDock } from "@/components/ui/glass-scene-dock"

const scenes = [
  { id: "ember", image: "/images/ember.jpg", alt: "Warm portrait haze" },
  { id: "prism", image: "/images/prism.jpg", alt: "Prism portrait" },
  { id: "tide", image: "/images/tide.jpg", alt: "Blue profile" },
  { id: "dune", image: "/images/dune.jpg", alt: "Teal echo" },
  { id: "mono", image: "/images/mono.jpg", alt: "Monochrome portrait" },
]

export default function SceneSection() {
  return <GlassSceneDock scenes={scenes} />
}`;

export async function GlassSceneDockDocs() {
  const sourceCode =
    (await readComponentSource("glass-scene-dock")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Glass Scene Dock"
      description="A floating glass navigation dock pinned over scroll-driven photographic scenes — a travelling glass highlight glides between icons while scrolling crossfades the cinematic backdrop. One container-query component adapts to card, side-panel, and fullscreen sizes."
      preview={<GlassSceneDockPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="glass-scene-dock"
      installDependencies="framer-motion, lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/glass-scene-dock.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "scenes",
          type: "GlassScene[]",
          description:
            "Background scenes in order. Each scene needs id + image, optional alt. The dock shows one item per scene.",
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
          description: "Fires when the active scene changes via scroll, click, or keyboard.",
        },
      ]}
    />
  );
}
