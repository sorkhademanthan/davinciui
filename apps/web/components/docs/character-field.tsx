import { CharacterField } from "@workspace/ui/components/character-field";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  CharacterFieldPersonalizePanel,
  CharacterFieldPlayground,
} from "@/components/docs/previews/character-field-preview";
import { readComponentSource } from "@/lib/source-code";

const basicUsageCode = `import { CharacterField } from "@/components/ui/character-field"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <CharacterField characterSet="mixed" mutationSpeed={1.8} />
  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
    <span className="whitespace-nowrap font-black uppercase leading-none tracking-[-0.055em] text-white text-[clamp(3rem,8.5vw,6rem)]">
      DAVINCIUI
    </span>
  </div>
</div>`;

export async function CharacterFieldDocs() {
  const sourceCode =
    (await readComponentSource("character-field")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Character Field"
      description="A dense ambient surface of monospace glyphs that mutate independently. Canvas-rendered, stationary, and restrained — dark green-teal by default with occasional bright flickers."
      preview={<CharacterFieldPlayground />}
      personalizeContent={<CharacterFieldPersonalizePanel />}
      previewCode={basicUsageCode}
      installPackageName="character-field"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/character-field.tsx"
      usageCode={
        <LiveCodeBlock slug="character-field" defaultCode={basicUsageCode} />
      }
      fullWidthPreview
      examples={[
        {
          title: "Numbers with an amber highlight",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <CharacterField
                characterSet="numbers"
                backgroundColor="#0b0f14"
                characterColor="#334155"
                highlightColor="#f97316"
                fontSize={16}
                density={1.3}
                mutationSpeed={2.2}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { CharacterField } from "@/components/ui/character-field"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <CharacterField
    characterSet="numbers"
    backgroundColor="#0b0f14"
    characterColor="#334155"
    highlightColor="#f97316"
    fontSize={16}
    density={1.3}
    mutationSpeed={2.2}
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Custom glyph pool",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <CharacterField
                characterSet="custom"
                customCharacters="<>/{}[]=+-"
                backgroundColor="#050505"
                characterColor="#27272a"
                highlightColor="#22d3ee"
                fontSize={18}
                characterSpacing={4}
                density={0.9}
                mutationAmount={0.3}
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { CharacterField } from "@/components/ui/character-field"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <CharacterField
    characterSet="custom"
    customCharacters="<>/{}[]=+-"
    backgroundColor="#050505"
    characterColor="#27272a"
    highlightColor="#22d3ee"
    fontSize={18}
    characterSpacing={4}
    density={0.9}
    mutationAmount={0.3}
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "characterSet",
          type: '"mixed" | "letters" | "numbers" | "symbols" | "custom"',
          default: '"mixed"',
          description: "Which glyph pool fills the grid.",
        },
        {
          name: "customCharacters",
          type: "string",
          default: '""',
          description: 'Custom glyph pool used when characterSet is "custom".',
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"ui-monospace, ..."',
          description: "Font family applied to every glyph.",
        },
        {
          name: "fontSize",
          type: "number",
          default: "14",
          description: "Glyph size in CSS pixels.",
        },
        {
          name: "fontWeight",
          type: "number | string",
          default: "400",
          description: "Font weight applied to every glyph.",
        },
        {
          name: "characterSpacing",
          type: "number",
          default: "2",
          description: "Extra horizontal space between glyphs, in px.",
        },
        {
          name: "lineHeight",
          type: "number",
          default: "1.5",
          description: "Line height multiplier for grid rows.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#060a09"',
          description: "Canvas background fill.",
        },
        {
          name: "characterColor",
          type: "string",
          default: '"#1d3a34"',
          description: "Base glyph color.",
        },
        {
          name: "highlightColor",
          type: "string",
          default: '"#8fc0b5"',
          description: "Color used for occasional bright glyphs.",
        },
        {
          name: "baseOpacity",
          type: "number",
          default: "0.6",
          description: "Global opacity multiplier for glyphs.",
        },
        {
          name: "brightnessVariation",
          type: "number",
          default: "0.55",
          description:
            "Spread of per-glyph brightness. Higher values make bright glyphs rarer.",
        },
        {
          name: "density",
          type: "number",
          default: "1",
          description:
            "Grid density multiplier. Higher values pack more glyphs.",
        },
        {
          name: "mutationSpeed",
          type: "number",
          default: "1.8",
          description:
            "Global mutation rate multiplier. Set to 0 to freeze the field.",
        },
        {
          name: "mutationAmount",
          type: "number",
          default: "0.16",
          description:
            "Probability that a scheduled cell event replaces its glyph.",
        },
        {
          name: "minUpdateDelay",
          type: "number",
          default: "60",
          description:
            "Minimum delay in milliseconds between mutations of the same cell.",
        },
        {
          name: "maxUpdateDelay",
          type: "number",
          default: "1400",
          description:
            "Maximum delay in milliseconds between mutations of the same cell.",
        },
        {
          name: "flickerIntensity",
          type: "number",
          default: "0.35",
          description: "Per-frame opacity shimmer strength, 0 to 1.",
        },
        {
          name: "smoothFade",
          type: "boolean",
          default: "true",
          description: "Ease opacity toward its target instead of snapping.",
        },
        {
          name: "pauseWhenOffscreen",
          type: "boolean",
          default: "true",
          description: "Pause the loop while outside the viewport.",
        },
        {
          name: "respectReducedMotion",
          type: "boolean",
          default: "true",
          description: "Render one static field for reduced-motion users.",
        },
        {
          name: "seed",
          type: "number",
          default: "—",
          description: "Optional seed for a deterministic initial field.",
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
          description: "Additional classes for the outer element.",
        },
      ]}
    />
  );
}
