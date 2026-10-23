import { SpectraNoise } from "@workspace/ui/components/spectra-noise";

import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  SpectraNoisePersonalizePanel,
  SpectraNoisePreview,
} from "@/components/docs/previews/spectra-noise-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { SpectraNoise } from "@/components/ui/spectra-noise"

<section className="relative min-h-screen overflow-hidden">
  <SpectraNoise
    glowColor="#127c74"
    highlightColor="#c5f58a"
    backgroundColor="#03090b"
    hueShift={0}
    noiseIntensity={0.35}
    scanlineDensity={1.5}
    scanlineIntensity={0.25}
    warpAmount={1}
    animationSpeed={0.35}
  />

  <div className="relative z-10">
    {/* Your hero content */}
  </div>
</section>`;

function SpectraNoiseNotes() {
  return (
    <>
      <Section title="About Spectra Noise" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            Luminous teal folds with pale green edges, suspended in deep shadow.
          </p>
          <p>
            Two layers of light drift at different speeds, creating a sense of
            depth. Soft halos, fine grain, and moving scanlines give the surface
            a cinematic texture, with darker space between the folds for your
            content.
          </p>
          <p>
            Hue Shift recolors the field in-shader while the black background
            and luminance hierarchy stay intact. Warp Amount bends the
            silhouettes from calm atmosphere to surreal folding, and Animation
            Speed drives internal evolution rather than sliding the texture.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Colors</strong> customize the
            glow, highlights, and background independently in Personalize.
          </li>
          <li>
            <strong className="text-foreground">Hue Shift</strong> rotates the
            spectrum from the default teal and mint palette through the full
            color wheel.
          </li>
          <li>
            <strong className="text-foreground">Noise Intensity</strong>{" "}
            controls fine cinematic grain over the macro field.
          </li>
          <li>
            <strong className="text-foreground">
              Scanline Density / Intensity
            </strong>{" "}
            tune the subtle horizontal scanline texture.
          </li>
          <li>
            <strong className="text-foreground">Warp Amount</strong> controls
            the strength of domain distortion.
          </li>
          <li>
            <strong className="text-foreground">Animation Speed</strong>{" "}
            controls how fast the field evolves internally.
          </li>
          <li>
            <strong className="text-foreground">Resolution Scale</strong> trades
            render sharpness for performance.
          </li>
          <li>
            <strong className="text-foreground">Seed</strong> recomposes the
            field layout without touching anything else.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Dark cinematic heroes, sci-fi product launches, atmospheric section
          backgrounds, album and editorial covers, and anywhere a restrained
          alien glow should sit behind content.
        </p>
      </Section>
    </>
  );
}

export async function SpectraNoiseDocs() {
  const sourceCode =
    (await readComponentSource("spectra-noise")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Spectra Noise"
      description="Luminous aurora folds, soft teal halos, and pale green edges drifting through deep shadow, finished with fine grain and moving scanlines."
      preview={<SpectraNoisePreview />}
      personalizeContent={<SpectraNoisePersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="spectra-noise"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/spectra-noise.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Teal and lime scan",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <SpectraNoise
                backgroundColor="#03090b"
                glowColor="#127c74"
                highlightColor="#c5f58a"
                noiseIntensity={0.35}
                scanlineIntensity={0.25}
                warpAmount={1}
                animationSpeed={0.4}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { SpectraNoise } from "@/components/ui/spectra-noise"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <SpectraNoise
    backgroundColor="#03090b"
    glowColor="#127c74"
    highlightColor="#c5f58a"
    noiseIntensity={0.35}
    scanlineIntensity={0.25}
    warpAmount={1}
    animationSpeed={0.4}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Warm, heavier warp",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <SpectraNoise
                backgroundColor="#0b0503"
                glowColor="#7c2d12"
                highlightColor="#fde68a"
                hueShift={20}
                warpAmount={1.6}
                scanlineIntensity={0.4}
                animationSpeed={0.2}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { SpectraNoise } from "@/components/ui/spectra-noise"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <SpectraNoise
    backgroundColor="#0b0503"
    glowColor="#7c2d12"
    highlightColor="#fde68a"
    hueShift={20}
    warpAmount={1.6}
    scanlineIntensity={0.4}
    animationSpeed={0.2}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "hueShift",
          type: "number",
          default: "0",
          description:
            "Base hue rotation in degrees. 0 preserves the selected colors.",
        },
        {
          name: "noiseIntensity",
          type: "number",
          default: "0.35",
          description: "Fine cinematic grain strength. 0 disables it.",
        },
        {
          name: "scanlineDensity",
          type: "number",
          default: "1.5",
          description: "Horizontal scanline frequency.",
        },
        {
          name: "scanlineIntensity",
          type: "number",
          default: "0.25",
          description: "Horizontal scanline modulation strength.",
        },
        {
          name: "warpAmount",
          type: "number",
          default: "1",
          description:
            "Strength of domain distortion. 0 is almost smooth, 2 is surreal.",
        },
        {
          name: "animationSpeed",
          type: "number",
          default: "0.35",
          description:
            "Rate of internal time evolution. Set to 0 to freeze the field.",
        },
        {
          name: "resolutionScale",
          type: "number",
          default: "1",
          description:
            "Canvas backing-store multiplier (0.5–1.5). Lower values trade quality for speed.",
        },
        {
          name: "paused",
          type: "boolean",
          default: "false",
          description: "Freeze the animation loop and hold the current frame.",
        },
        {
          name: "seed",
          type: "number",
          default: "7",
          description: "Noise field seed. Changing it recomposes the layout.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#03090b"',
          description: "Near-black base color behind the luminous field.",
        },
        {
          name: "glowColor",
          type: "string",
          default: '"#127c74"',
          description: "Main color of the luminous field (six-digit hex).",
        },
        {
          name: "highlightColor",
          type: "string",
          default: '"#c5f58a"',
          description: "Color of the brightest areas (six-digit hex).",
        },
        {
          name: "effectIntensity",
          type: "number",
          default: "1",
          description: "Overall strength of the luminous masses.",
        },
        {
          name: "maxDpr",
          type: "number",
          default: "2",
          description:
            "Maximum device pixel ratio used by the canvas backing buffer.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes applied to the full-size background layer.",
        },
      ]}
      afterContent={<SpectraNoiseNotes />}
    />
  );
}
