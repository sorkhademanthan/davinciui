import { NeonMeshBG } from "@workspace/ui/components/neon-mesh-bg";

import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  NeonMeshBGPersonalizePanel,
  NeonMeshBGPreview,
} from "@/components/docs/previews/neon-mesh-bg-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { NeonMeshBG } from "@/components/ui/neon-mesh-bg"

<section className="relative min-h-screen overflow-hidden">
  <NeonMeshBG
    scale={1.6}
    warp={1.15}
    contrast={1.6}
    gridSize={6.5}
    gridStrength={0.92}
    glowStrength={1}
    speed={0.35}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function NeonMeshBGNotes() {
  return (
    <>
      <Section title="About Neon Mesh BG" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A dark, cinematic WebGL background with an evolving purple neon mesh
            viewed through a fine LED pixel matrix.
          </p>
          <p>
            A softly bending wave carries shifting pools of violet and lavender
            light across a stationary square pixel grid. Smooth falloff keeps
            the edges atmospheric and the surrounding frame near black.
          </p>
          <p>
            Use it as a full-screen hero backdrop, a card atmosphere, or a
            premium ambient layer behind interface content.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Scale</strong> changes the mesh
            from broad sweeping masses to tighter folds.
          </li>
          <li>
            <strong className="text-foreground">Warp</strong> controls how hard
            the field folds and reforms over time.
          </li>
          <li>
            <strong className="text-foreground">Contrast</strong> sets how much
            of the frame stays dark versus illuminated.
          </li>
          <li>
            <strong className="text-foreground">Grid Size / Strength</strong>{" "}
            tune the fine pixel-matrix texture over the glow.
          </li>
          <li>
            <strong className="text-foreground">Glow Strength / Spread</strong>{" "}
            shape the atmospheric bloom around the neon mass.
          </li>
        </ul>
      </Section>
    </>
  );
}

export async function NeonMeshBGDocs() {
  const sourceCode =
    (await readComponentSource("neon-mesh-bg")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Neon Mesh BG"
      description="A dark cinematic WebGL background with an evolving purple neon mesh, fine pixel matrix, and soft atmospheric bloom."
      preview={<NeonMeshBGPreview />}
      personalizeContent={<NeonMeshBGPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="neon-mesh-bg"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/neon-mesh-bg.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Emerald mesh",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <NeonMeshBG
                backgroundColor="#01110f"
                primaryColor="#064e3b"
                secondaryColor="#10b981"
                highlightColor="#d1fae5"
                scale={1.2}
                gridSize={5}
                glowStrength={1.4}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { NeonMeshBG } from "@/components/ui/neon-mesh-bg"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <NeonMeshBG
    backgroundColor="#01110f"
    primaryColor="#064e3b"
    secondaryColor="#10b981"
    highlightColor="#d1fae5"
    scale={1.2}
    gridSize={5}
    glowStrength={1.4}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Warm high-contrast field",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <NeonMeshBG
                backgroundColor="#120603"
                primaryColor="#7c2d12"
                secondaryColor="#f97316"
                highlightColor="#ffedd5"
                scale={2}
                contrast={2}
                gridStrength={0.4}
                speed={0.2}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { NeonMeshBG } from "@/components/ui/neon-mesh-bg"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <NeonMeshBG
    backgroundColor="#120603"
    primaryColor="#7c2d12"
    secondaryColor="#f97316"
    highlightColor="#ffedd5"
    scale={2}
    contrast={2}
    gridStrength={0.4}
    speed={0.2}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "backgroundColor",
          type: "string",
          default: '"#050505"',
          description: "Deepest background color.",
        },
        {
          name: "primaryColor",
          type: "string",
          default: '"#40134e"',
          description: "Dark violet midtone.",
        },
        {
          name: "secondaryColor",
          type: "string",
          default: '"#873491"',
          description: "Electric purple / magenta glow.",
        },
        {
          name: "highlightColor",
          type: "string",
          default: '"#eed5f2"',
          description: "Pale lavender core highlight.",
        },
        {
          name: "scale",
          type: "number",
          default: "1.6",
          description: "Base sampling frequency of the mesh field.",
        },
        {
          name: "complexity",
          type: "number",
          default: "4",
          description: "FBM octave count, 1 to 5.",
        },
        {
          name: "warp",
          type: "number",
          default: "1.15",
          description: "Domain-warp amplitude of the field.",
        },
        {
          name: "contrast",
          type: "number",
          default: "1.6",
          description: "Field contrast around mid-gray.",
        },
        {
          name: "brightness",
          type: "number",
          default: "0.85",
          description: "Post brightness multiplier.",
        },
        {
          name: "gridSize",
          type: "number",
          default: "6.5",
          description:
            "Pixel cell size in screen pixels. Smaller values densify the matrix.",
        },
        {
          name: "gridStrength",
          type: "number",
          default: "0.92",
          description: "Visibility of the pixel / dot matrix, 0 to 1.",
        },
        {
          name: "glowStrength",
          type: "number",
          default: "1",
          description: "Atmospheric bloom strength, 0 to 2.",
        },
        {
          name: "glowSpread",
          type: "number",
          default: "0.65",
          description: "Softness of the glow falloff, 0 to 1.",
        },
        {
          name: "speed",
          type: "number",
          default: "0.35",
          description: "Global animation rate.",
        },
        {
          name: "animate",
          type: "boolean",
          default: "true",
          description: "Set to false to freeze the current composition.",
        },
        {
          name: "quality",
          type: "number",
          default: "1",
          description:
            "Backing-store resolution multiplier, 0.25 to 1. Lower values are faster.",
        },
        {
          name: "pauseWhenOffscreen",
          type: "boolean",
          default: "true",
          description: "Pause rendering while outside the viewport.",
        },
        {
          name: "respectReducedMotion",
          type: "boolean",
          default: "true",
          description: "Render one static frame for reduced-motion users.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description: "Maximum device pixel ratio for the backing buffer.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes applied to the background layer.",
        },
      ]}
      afterContent={<NeonMeshBGNotes />}
    />
  );
}
