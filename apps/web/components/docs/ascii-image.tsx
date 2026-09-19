import { DocsPageLayout, type PropItem } from "@/components/docs-page-layout";
import {
  AsciiColorPreview,
  AsciiImagePreview,
  AsciiIsolatedPreview,
  AsciiScramblePreview,
  AsciiTerminalPreview,
} from "@/components/docs/previews/ascii-image-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { AsciiImage } from "@/components/ui/ascii-image"`;

const imageCode = `${importCode}

<div className="h-[520px] overflow-hidden rounded-2xl">
  <AsciiImage
    src="/images/portrait.jpg"
    alt="Portrait rendered as ASCII typography"
    preset="detailed"
    resolution="high"
    foreground="#f1f1f1"
    background="#151619"
  />
</div>`;

const isolatedCode = `${importCode}

<AsciiImage
  src="/images/portrait.jpg"
  preset="detailed"
  backgroundMode="empty"
  backgroundThreshold={0.94}
  background="transparent"
/>`;

const terminalCode = `${importCode}

<AsciiImage
  src="/images/portrait.jpg"
  preset="classic"
  resolution="medium"
/>`;

const colorCode = `${importCode}

<AsciiImage
  src="/images/portrait.jpg"
  preset="detailed"
  colorMode="source"
/>`;

const scrambleCode = `${importCode}

<AsciiImage
  src="/images/portrait.jpg"
  preset="detailed"
  effect="scramble"
/>`;

const props: PropItem[] = [
  { name: "src", type: "string", description: "Image URL rendered as ASCII. Any image produces a new rendering." },
  { name: "alt", type: "string", default: '""', description: "Accessible label for the canvas. Empty string marks it decorative." },
  { name: "preset", type: '"minimal" | "classic" | "detailed" | "halftone"', default: '"detailed"', description: "Ordered character ramp plus default cell size." },
  { name: "characters", type: "string", description: "Custom ramp ordered light to dense. Overrides preset." },
  { name: "resolution", type: '"low" | "medium" | "high" | number', default: '"high"', description: "Target glyph size. Custom number sets cell pixels directly." },
  { name: "cellSize", type: "number", description: "Explicit cell size override." },
  { name: "fontFamily", type: "string", description: "Monospace stack used for measuring and drawing glyphs." },
  { name: "fontSize", type: "number", description: "Explicit glyph size override." },
  { name: "foreground", type: "string", default: '"currentColor"', description: "Glyph color in mono mode." },
  { name: "background", type: "string", default: '"transparent"', description: 'Canvas paint. Use "transparent" to sit on any surface.' },
  { name: "colorMode", type: '"mono" | "source"', default: '"mono"', description: "Mono uses foreground; source tints each glyph from its pixel." },
  { name: "brightness", type: "number", default: "0", description: "Luminance shift after contrast." },
  { name: "contrast", type: "number", default: "1.1", description: "Contrast around the luminance midpoint." },
  { name: "invert", type: "boolean", default: "false", description: "Reverse the luminance-to-character mapping." },
  { name: "backgroundMode", type: '"ascii" | "empty" | "edge"', default: '"ascii"', description: "Empty suppresses bright pixels by luminance; edge suppresses colors matching the image border." },
  { name: "backgroundThreshold", type: "number", default: "0.95", description: "Luminance cutoff for empty mode; normalized color-distance cutoff for edge mode." },
  { name: "opacityMode", type: '"fixed" | "luminance"', default: '"fixed"', description: "Luminance fades glyph alpha by pixel darkness." },
  { name: "opacity", type: "number", default: "1", description: "Base glyph alpha." },
  { name: "opacityGamma", type: "number", default: "1.4", description: "Curve for luminance opacity mapping." },
  { name: "fit", type: '"contain" | "cover"', default: '"contain"', description: "Contain shows the whole image; cover fills and crops like object-fit." },
  { name: "position", type: '"center" | "top" | "bottom" | "left" | "right"', default: '"center"', description: "Image anchor inside the grid." },
  { name: "effect", type: '"none" | "reveal" | "scramble"', default: '"none"', description: "Reveal progresses cell-by-cell; scramble resolves random glyphs into place." },
  { name: "effectDuration", type: "number", default: "1400", description: "Animation duration in milliseconds." },
  { name: "trigger", type: '"load" | "inView"', default: '"load"', description: "Start on image load or when scrolled into view." },
  { name: "className", type: "string", description: "Additional classes for the container." },
];

export async function AsciiImageDocs() {
  const source = await readComponentSource("ascii-image");

  return (
    <DocsPageLayout
      title="Ronaldo ASCII Effect"
      description="A responsive Ronaldo ASCII portrait with presets, dark background suppression, and reveal/scramble effects."
      preview={<AsciiImagePreview />}
      previewCode={imageCode}
      installPackageName="ascii-image"
      installSourceCode={source ?? "// Unable to load source code"}
      installSourceFilename="components/ui/ascii-image.tsx"
      usageCode={imageCode}
      examples={[
        { title: "Isolated portrait", preview: <AsciiIsolatedPreview />, code: isolatedCode },
        { title: "Classic terminal", preview: <AsciiTerminalPreview />, code: terminalCode },
        { title: "Source color", preview: <AsciiColorPreview />, code: colorCode },
        { title: "Scramble", preview: <AsciiScramblePreview />, code: scrambleCode },
      ]}
      props={props}
      fullWidthPreview
    />
  );
}
