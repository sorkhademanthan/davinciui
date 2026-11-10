import { DocsPageLayout } from "@/components/docs-page-layout";
import type { CSSProperties, ReactNode } from "react";
import { readComponentSource } from "@/lib/source-code";
import { caveatFont } from "@/lib/caveat-font";
import { TiltFlipPolaroid } from "@workspace/ui/components/tilt-flip-polaroid";
import { TiltFlipPolaroidPlayground, TiltFlipPolaroidPersonalizePanel } from "@/components/docs/previews/premium-playgrounds";

const demoImage = {
  src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
  alt: "Lone figure passing through a muted green field",
};

function ExampleStage({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${caveatFont.variable} flex w-full items-center justify-center bg-[#FAFAFA] p-6 transition-colors duration-300 dark:bg-[#0A0A0B]`}
    >
      {children}
    </div>
  );
}

const defaultCode = `import { TiltFlipPolaroid } from "@/components/ui/tilt-flip-polaroid"

<TiltFlipPolaroid
  image={{
    src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
    alt: "Lone figure passing through a muted green field",
  }}
  date="11/07/24"
  backText={\`november, late afternoon.
the wind pushed everything sideways
and somehow i stayed.\`}
/>`;

const usageCode = `import { TiltFlipPolaroid } from "@/components/ui/tilt-flip-polaroid"

export function FieldPolaroid() {
  return (
    <TiltFlipPolaroid
      image={{
        src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
        alt: "Lone figure passing through a muted green field",
      }}
      date="11/07/24"
      backText={\`november, late afternoon.
the wind pushed everything
sideways and somehow i stayed.
stood there until my ears
went numb, then carried
the quiet all the way home. ⚘\`}
      onFlippedChange={(flipped) => console.log("flipped:", flipped)}
    />
  )
}`;

export async function TiltFlipPolaroidDocs() {
  const sourceCode =
    (await readComponentSource("tilt-flip-polaroid")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Tilt Flip Polaroid"
      description="A Polaroid print that tilts away from the pointer with a damped 3D tilt, then flips around its Y axis to reveal a handwritten note. The hit area stays flat while the card moves, so the pointer never chases a rotated target."
      preview={<TiltFlipPolaroidPlayground className={caveatFont.variable} />}
      personalizeContent={<TiltFlipPolaroidPersonalizePanel />}
      previewCode={defaultCode}
      usageCode={usageCode}
      installPackageName="tilt-flip-polaroid"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/tilt-flip-polaroid.tsx"
      fullWidthPreview
      examples={[
        {
          title: "Opens on the back face",
          preview: (
            <ExampleStage>
              <TiltFlipPolaroid image={demoImage} defaultFlipped />
            </ExampleStage>
          ),
          code: `import { TiltFlipPolaroid } from "@/components/ui/tilt-flip-polaroid"

<TiltFlipPolaroid
  image={{
    src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
    alt: "Lone figure passing through a muted green field",
  }}
  date="11/07/24"
  defaultFlipped
/>`,
        },
        {
          title: "Flat card, no pointer tilt",
          preview: (
            <ExampleStage>
              <TiltFlipPolaroid image={demoImage} tiltEnabled={false} />
            </ExampleStage>
          ),
          code: `import { TiltFlipPolaroid } from "@/components/ui/tilt-flip-polaroid"

<TiltFlipPolaroid
  image={{
    src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
    alt: "Lone figure passing through a muted green field",
  }}
  date="11/07/24"
  tiltEnabled={false}
/>`,
        },
        {
          title: "Custom size and palette",
          preview: (
            <ExampleStage>
              <TiltFlipPolaroid
                image={demoImage}
                date="09/11/24"
                width={340}
                height={382}
                style={
                  {
                    "--tfp-card": "#141414",
                    "--tfp-ink": "#F5F5F5",
                    "--tfp-shadow": "0 18px 40px rgba(0, 0, 0, 0.45)",
                  } as CSSProperties
                }
              />
            </ExampleStage>
          ),
          code: `import { TiltFlipPolaroid } from "@/components/ui/tilt-flip-polaroid"

<TiltFlipPolaroid
  image={{
    src: "https://images.unsplash.com/photo-1610846202780-b4d9837371ea?w=900&q=85&auto=format&fit=crop",
    alt: "Lone figure passing through a muted green field",
  }}
  date="09/11/24"
  width={340}
  height={382}
  style={
    {
      "--tfp-card": "#141414",
      "--tfp-ink": "#F5F5F5",
      "--tfp-shadow": "0 18px 40px rgba(0, 0, 0, 0.45)",
    } as React.CSSProperties
  }
/>`,
        },
      ]}
      props={[
        {
          name: "image",
          type: "{ src: string; alt: string }",
          description:
            "Photo shown inside the 12px inset. The 372 x 367 box is reserved with a neutral placeholder while the image loads.",
        },
        {
          name: "date",
          type: "string",
          default: '"11/07/24"',
          description:
            "Caption centred in the 64px strip below the photo, rendered in Caveat.",
        },
        {
          name: "backText",
          type: "string",
          default: "november, late afternoon. …",
          description:
            "Handwritten note on the back face. Each newline is preserved; the block is centred with 45px horizontal padding.",
        },
        {
          name: "flipped",
          type: "boolean",
          description:
            "Controlled flipped state. When supplied, internal clicks call onFlippedChange without mutating internal state.",
        },
        {
          name: "defaultFlipped",
          type: "boolean",
          default: "false",
          description: "Initial flipped state for uncontrolled usage.",
        },
        {
          name: "onFlippedChange",
          type: "(flipped: boolean) => void",
          description:
            "Fires for clicks, taps, Space, and Enter in both controlled and uncontrolled modes.",
        },
        {
          name: "maxTilt",
          type: "number",
          default: "15",
          description:
            "Maximum rotation in degrees per axis. The pointer offset is normalized by half the card size and clamped to ±1.",
        },
        {
          name: "perspective",
          type: "number",
          default: "1000",
          description:
            "Perspective distance on the static hit-area wrapper. No translation or in-plane rotation is applied to the card.",
        },
        {
          name: "tiltEnabled",
          type: "boolean",
          default: "true",
          description:
            "Turns pointer tilt off while keeping click, tap, and keyboard flipping. Tilt is always off for coarse pointers and reduced motion.",
        },
        {
          name: "selectableBack",
          type: "boolean",
          default: "false",
          description:
            "Allows selecting the back text. Selection is disabled on the card by default.",
        },
        {
          name: "width",
          type: "number",
          default: "396",
          description: "Card width in CSS pixels.",
        },
        {
          name: "height",
          type: "number",
          default: "443",
          description: "Card height in CSS pixels.",
        },
        {
          name: "className",
          type: "string",
          description:
            "Additional classes on the hit-area wrapper. The card visuals are driven by --tfp-* CSS variables.",
        },
        {
          name: "style",
          type: "React.CSSProperties",
          description:
            "Optional inline overrides, including --tfp-card, --tfp-ink, --tfp-inset, --tfp-caption, --tfp-radius, and --tfp-shadow.",
        },
      ]}
    />
  );
}
