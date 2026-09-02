import React from "react";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import {
  DitheredLogoDensePreview,
  DitheredLogoOutlinePreview,
  DitheredLogoPersonalizePanel,
  DitheredLogoPlayground,
  DitheredLogoSharpPreview,
  DitheredLogoSoftPreview,
} from "@/components/docs/previews/dithered-logo-playground";

const defaultCode = `import { DitheredLogo } from "@/components/ui/dithered-logo"

<div className="h-[600px] w-full bg-white text-black">
  <DitheredLogo
    imageSrc="https://componentry.dev/images/dithered-logo/logo.svg"
    className="h-full w-full"
    gridSize={200}
    scale={0.36}
    dotScale={1}
    invert={true}
    cornerRadius={0.2}
    gamma={1.0}
    blur={3.75}
    diffusionStrength={1.0}
  />
</div>`;

const outlineCode = `import { DitheredLogo } from "@/components/ui/dithered-logo"

<div className="h-[600px] w-full bg-white text-black">
  <DitheredLogo
    imageSrc="/images/dithered-logo/logo.svg"
    className="h-full w-full"
    scale={0.36}
    invert={false}
    threshold={160}
    blur={2.5}
  />
</div>`;

const denseCode = `import { DitheredLogo } from "@/components/ui/dithered-logo"

<div className="h-[600px] w-full bg-white text-black">
  <DitheredLogo
    imageSrc="/images/dithered-logo/logo.svg"
    className="h-full w-full"
    gridSize={260}
    scale={0.42}
    dotScale={0.85}
    threshold={165}
    blur={2}
  />
</div>`;

const softCode = `import { DitheredLogo } from "@/components/ui/dithered-logo"

<div className="h-[600px] w-full bg-white text-black">
  <DitheredLogo
    imageSrc="/images/dithered-logo/logo.svg"
    className="h-full w-full"
    scale={0.36}
    blur={6}
    gamma={1.4}
    threshold={190}
    contrast={-10}
    diffusionStrength={0.85}
  />
</div>`;

const sharpCode = `import { DitheredLogo } from "@/components/ui/dithered-logo"

<div className="h-[600px] w-full bg-white text-black">
  <DitheredLogo
    imageSrc="/images/dithered-logo/logo.svg"
    className="h-full w-full"
    gridSize={180}
    threshold={140}
    blur={1.2}
    gamma={0.85}
    contrast={20}
    diffusionStrength={1.15}
    cornerRadius={0.08}
  />
</div>`;

export async function DitheredLogoDocs() {
  const sourceCode =
    (await readComponentSource("dithered-logo")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Dithered Logo"
      description="A canvas-rendered particle logo that converts SVG or image assets into an interactive error-diffusion dither field with cursor repulsion and click ripples."
      preview={<DitheredLogoPlayground />}
      personalizeContent={<DitheredLogoPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="dithered-logo"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      usageCode={defaultCode}
      fullWidthPreview
      examples={[
        { title: "Outline", preview: <DitheredLogoOutlinePreview />, code: outlineCode },
        { title: "Dense", preview: <DitheredLogoDensePreview />, code: denseCode },
        { title: "Soft", preview: <DitheredLogoSoftPreview />, code: softCode },
        { title: "Sharp", preview: <DitheredLogoSharpPreview />, code: sharpCode },
      ]}
      props={[
        {
          name: "imageSrc",
          type: "string",
          description: "Image or SVG source used to generate the dithered particle field.",
        },
        {
          name: "gridSize",
          type: "number",
          default: "200",
          description: "Maximum sampled image dimension before dithering.",
        },
        {
          name: "scale",
          type: "number",
          default: "0.5",
          description: "Relative scale of the generated particle logo inside the canvas.",
        },
        {
          name: "dotScale",
          type: "number",
          default: "1",
          description: "Multiplier for each rendered particle size.",
        },
        {
          name: "invert",
          type: "boolean",
          default: "true",
          description: "Invert the generated dithered mask.",
        },
        {
          name: "cornerRadius",
          type: "number",
          default: "0.2",
          description: "Rounded mask radius used when invert mode is enabled.",
        },
        {
          name: "threshold",
          type: "number",
          default: "180",
          description: "Brightness threshold for error-diffusion dithering.",
        },
        {
          name: "contrast",
          type: "number",
          default: "0",
          description: "Contrast adjustment applied before dithering.",
        },
        {
          name: "gamma",
          type: "number",
          default: "1",
          description: "Gamma correction applied before dithering.",
        },
        {
          name: "blur",
          type: "number",
          default: "3.75",
          description: "Image blur amount applied before sampling the grayscale grid.",
        },
        {
          name: "diffusionStrength",
          type: "number",
          default: "1",
          description: "Strength of the Floyd-Steinberg error diffusion.",
        },
        {
          name: "serpentine",
          type: "boolean",
          default: "true",
          description: "Alternate dither scan direction on every row.",
        },
        {
          name: "particleColor",
          type: "string",
          default: '"currentColor"',
          description: "Canvas particle color. Uses the element text color by default.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes for the root element.",
        },
      ]}
    />
  );
}
