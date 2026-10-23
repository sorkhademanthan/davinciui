import React from "react";
import { Archivo_Narrow } from "next/font/google";
import { FluidParticleText } from "@workspace/ui/components/fluid-particle-text";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { FluidParticleTextPreview } from "@/components/docs/previews/fluid-particle-text-preview";
import { readComponentSource } from "@/lib/source-code";

/* Reference typeface (confirmed from the published reference page). */
const archivoNarrow = Archivo_Narrow({ weight: "700", subsets: ["latin"] });

const defaultCode = `import { FluidParticleText } from "@/components/ui/fluid-particle-text"

export const Demo = () => {
    return (
        <FluidParticleText
            preset="showcase"
            text="INK"
            padding={0.16}
            outline
            strokeWidth={2.25}
            fillOpacity={1}
            className="h-full w-full"
        />
    );
};`;

export async function FluidParticleTextDocs() {
  const sourceCode =
    (await readComponentSource("fluid-particle-text")) ||
    "// Unable to load source code";

  return (
    <div className={archivoNarrow.className}>
      <DocsPageLayout
        title="Fluid Particle Text"
        description="Interactive particle typography sampled from rasterized text. A dense sheet of material at rest, advected along your cursor trajectory with pressure, shear and topology coherence, then sprung home."
        preview={
          <FluidParticleTextPreview
            fontFamily={archivoNarrow.style.fontFamily}
          />
        }
        previewCode={defaultCode}
        examples={[
          {
            title: "Outline INK",
            preview: (
              <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
                <FluidParticleText
                  preset="showcase"
                  text="INK"
                  fontFamily={archivoNarrow.style.fontFamily}
                  padding={0.16}
                  color="#f4f4f5"
                  background="#09090b"
                  outline
                  strokeWidth={2.25}
                  fillOpacity={1}
                  className="h-full w-full"
                />
              </div>
            ),
            code: `import { FluidParticleText } from "@/components/ui/fluid-particle-text"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <FluidParticleText
    preset="showcase"
    text="INK"
    padding={0.16}
    color="#f4f4f5"
    background="#09090b"
    outline
    strokeWidth={2.25}
    fillOpacity={1}
    className="h-full w-full"
  />
</div>`,
          },
          {
            title: "Solid orange FLUID",
            preview: (
              <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
                <FluidParticleText
                  text="FLUID"
                  fontFamily={archivoNarrow.style.fontFamily}
                  fontWeight="700"
                  padding={0.12}
                  color="#f97316"
                  background="#fafafa"
                  particleSize={2.4}
                  className="h-full w-full"
                />
              </div>
            ),
            code: `import { FluidParticleText } from "@/components/ui/fluid-particle-text"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <FluidParticleText
    text="FLUID"
    fontWeight="700"
    padding={0.12}
    color="#f97316"
    background="#fafafa"
    particleSize={2.4}
    className="h-full w-full"
  />
</div>`,
          },
        ]}
        fullWidthPreview
        unstyledPreview
        installPackageName="fluid-particle-text"
        installDependencies="clsx tailwind-merge"
        installSourceCode={sourceCode}
        installSourceFilename="components/ui/fluid-particle-text.tsx"
        usageCode={defaultCode}
        props={[
          {
            name: "text",
            type: "string",
            description:
              "Source text rasterized into particle home positions. Supports \\n line breaks.",
          },
          {
            name: "fontFamily",
            type: "string",
            default: '"Arial Black", ...',
            description:
              "Font used for rasterization. The component waits for it via document.fonts before sampling.",
          },
          {
            name: "fontWeight",
            type: "number | string",
            default: "900",
            description: "Weight used for rasterization.",
          },
          {
            name: "fontSize",
            type: "number",
            default: "160",
            description:
              "Base size in CSS px. Used directly when fitMode is off.",
          },
          {
            name: "fitMode",
            type: '"off" | "fit" | "fill"',
            default: '"fit"',
            description:
              "Fit scales text inside bounds, fill aggressively covers them, off uses fontSize directly.",
          },
          {
            name: "color",
            type: "string",
            default: '"#000000"',
            description: "Particle color.",
          },
          {
            name: "background",
            type: "string",
            default: '"#ffffff"',
            description: "Canvas background.",
          },
          {
            name: "particleSize",
            type: "number",
            default: "2",
            description:
              "Particle diameter in CSS px (scaled by DPR in the shader).",
          },
          {
            name: "preset",
            type: '"default" | "showcase" | "reference404"',
            description:
              "Named tuning preset. showcase powers the INK demo; explicit props always win.",
          },
          {
            name: "particleSpacing",
            type: "number",
            default: "2",
            description:
              "Particle spacing in CSS px (≈1.25 in the reference). Overrides sampleQuality when set.",
          },
          {
            name: "particleShape",
            type: '"circle" | "square"',
            default: '"square"',
            description:
              "Square tiles into a near-solid glyph; circle renders soft dots.",
          },
          {
            name: "sampleQuality",
            type: '"low" | "medium" | "high" | "ultra"',
            default: '"high"',
            description:
              "Sampling density. Gap auto-escalates to respect maxParticles.",
          },
          {
            name: "interactionRadius",
            type: "number",
            default: "110",
            description:
              "Cursor influence radius in CSS px. Defines a smooth field, not a visible edge.",
          },
          {
            name: "viscosity",
            type: "number",
            default: "3",
            description:
              "Local velocity coherence near the interaction so rows flow together instead of spokes.",
          },
          {
            name: "forceStrength",
            type: "number",
            default: "1",
            description:
              "Legacy pressure scaler. Prefer pressureStrength for new work.",
          },
          {
            name: "advectionStrength",
            type: "number",
            default: "1",
            description:
              "Dominant force: how strongly particles inherit cursor velocity along the path.",
          },
          {
            name: "pressureStrength",
            type: "number",
            default: "0.12",
            description: "Broad, soft separation normal to the pointer path.",
          },
          {
            name: "corePressureStrength",
            type: "number",
            default: "0",
            description:
              "Narrow path-normal pressure for visible cuts without a circular radius target.",
          },
          {
            name: "shearStrength",
            type: "number",
            default: "0.2",
            description:
              "Directional shear across the path; produces tapered sheets and filaments.",
          },
          {
            name: "topologyCohesion",
            type: "number",
            default: "0.1",
            description:
              "Raster-neighbor velocity coherence so deformed rows stay readable.",
          },
          {
            name: "homeStrength",
            type: "number",
            default: "16",
            description:
              "Home spring in 1/s^2. Direct alternative to returnSpeed.",
          },
          {
            name: "trailLifetime",
            type: "number",
            default: "0.3",
            description:
              "Pointer-path memory in seconds. Stretched cuts need longer memory.",
          },
          {
            name: "curlStrength",
            type: "number",
            default: "0.25",
            description: "Tangential swirl around the cursor.",
          },
          {
            name: "returnSpeed",
            type: "number",
            default: "0.08",
            description: "Home spring stiffness.",
          },
          {
            name: "damping",
            type: "number",
            default: "0.9",
            description: "Velocity retention per frame. Lower settles faster.",
          },
          {
            name: "maxDisplacement",
            type: "number",
            default: "150",
            description: "Maximum excursion from home in CSS px.",
          },
          {
            name: "maxParticles",
            type: "number",
            default: "220000",
            description: "Hard particle budget cap.",
          },
          {
            name: "maxDpr",
            type: "number",
            default: "2",
            description: "Caps devicePixelRatio for the render target.",
          },
        ]}
      />
    </div>
  );
}
