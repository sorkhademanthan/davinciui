import { TextVideoMask } from "@workspace/ui/components/text-video-mask";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  TEXT_VIDEO_MASK_SAMPLE_VIDEO,
  TextVideoMaskPersonalizePanel,
  TextVideoMaskPlayground,
} from "@/components/docs/previews/text-video-mask-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { TextVideoMask } from "@/components/ui/text-video-mask"

<TextVideoMask
  text="DAVINCI."
  src="${TEXT_VIDEO_MASK_SAMPLE_VIDEO}"
  videoFit="cover"
  positionX={20}
  positionY={30}
  horizontalPadding={0}
  backgroundColor="#000000"
  fallbackColor="#FFFFFF"
  className="h-[560px] w-full"
/>`;

export async function TextVideoMaskDocs() {
  const sourceCode =
    (await readComponentSource("text-video-mask")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Text Video Mask"
      description="Large typography where a playing video is visible only inside the glyphs. The type is a true mask cutout — counters and holes included — over one continuous footage surface that keeps playing while the letters stay still."
      preview={
        <div className="relative h-full min-h-[560px] w-full">
          <TextVideoMaskPlayground />
        </div>
      }
      previewCode={defaultCode}
      personalizeContent={<TextVideoMaskPersonalizePanel />}
      fullWidthPreview
      installPackageName="text-video-mask"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/text-video-mask.tsx"
      usageCode={
        <LiveCodeBlock slug="text-video-mask" defaultCode={defaultCode} />
      }
      examples={[
        {
          title: "Top-aligned crop",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <TextVideoMask
                text="MOTION"
                src={TEXT_VIDEO_MASK_SAMPLE_VIDEO}
                videoFit="cover"
                positionX={50}
                positionY={10}
                backgroundColor="#000000"
                fallbackColor="#FFFFFF"
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { TextVideoMask } from "@/components/ui/text-video-mask"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <TextVideoMask
    text="MOTION"
    src="/videos/brand-film.mp4"
    videoFit="cover"
    positionX={50}
    positionY={10}
    backgroundColor="#000000"
    fallbackColor="#FFFFFF"
    className="h-full w-full"
  />
</div>`,
        },
        {
          title: "Multiline, bottom-heavy crop",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <TextVideoMask
                text={"TYPE\nCUT"}
                src={TEXT_VIDEO_MASK_SAMPLE_VIDEO}
                videoFit="cover"
                positionX={30}
                positionY={80}
                lineHeight={0.85}
                backgroundColor="#0b0b0b"
                fallbackColor="#F5F5F4"
                className="h-full w-full"
              />
            </div>
          ),
          code: `import { TextVideoMask } from "@/components/ui/text-video-mask"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <TextVideoMask
    text={"TYPE\\nCUT"}
    src="/videos/brand-film.mp4"
    videoFit="cover"
    positionX={30}
    positionY={80}
    lineHeight={0.85}
    backgroundColor="#0b0b0b"
    fallbackColor="#F5F5F4"
    className="h-full w-full"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          default: '"DAVINCI."',
          description:
            "Text revealed as cutouts in the video. Supports multiline via \\n.",
        },
        {
          name: "src",
          type: "string",
          default: '""',
          description:
            "Video source — uploaded asset URL or remote .mp4/.webm URL.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"Anton"',
          description: "Font family baked into the mask texture.",
        },
        {
          name: "fontSize",
          type: "number",
          default: "200",
          description:
            "Base type size in px. Exact in fixed mode, maximum in fit mode.",
        },
        {
          name: "fontWeight",
          type: "number | string",
          default: "800",
          description: "Font weight baked into the mask texture.",
        },
        {
          name: "fontStyle",
          type: '"normal" | "italic"',
          default: '"normal"',
          description: "Font style baked into the mask texture.",
        },
        {
          name: "lineHeight",
          type: "number",
          default: "1",
          description: "Line-height multiplier for multiline text.",
        },
        {
          name: "letterSpacing",
          type: "number",
          default: "0",
          description: "Tracking in px between characters.",
        },
        {
          name: "textAlign",
          type: '"left" | "center" | "right"',
          default: '"center"',
          description: "Horizontal alignment of the text block.",
        },
        {
          name: "verticalAlign",
          type: '"top" | "center" | "bottom"',
          default: '"center"',
          description: "Vertical alignment of the text block.",
        },
        {
          name: "textSizing",
          type: '"fixed" | "fit"',
          default: '"fit"',
          description:
            "Fixed uses fontSize; fit scales down to fit the padded width.",
        },
        {
          name: "horizontalPadding",
          type: "number",
          default: "24",
          description:
            "Horizontal inset in px, respected by alignment and fit mode.",
        },
        {
          name: "verticalPadding",
          type: "number",
          default: "24",
          description: "Vertical inset in px, respected by vertical alignment.",
        },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description:
            "Start playback automatically. Falls back to muted on policy blocks.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description: "Loop the footage.",
        },
        {
          name: "muted",
          type: "boolean",
          default: "true",
          description:
            "Mute the footage (required for autoplay in most browsers).",
        },
        {
          name: "playsInline",
          type: "boolean",
          default: "true",
          description: "Allow inline playback on iOS Safari.",
        },
        {
          name: "controls",
          type: "boolean",
          default: "false",
          description: "Show native browser video controls.",
        },
        {
          name: "videoFit",
          type: '"cover" | "contain" | "fill"',
          default: '"cover"',
          description: "How the footage fills the component (object-fit).",
        },
        {
          name: "positionX",
          type: "number",
          default: "50",
          description: "Footage focal point, 0–100 (object-position X).",
        },
        {
          name: "positionY",
          type: "number",
          default: "50",
          description: "Footage focal point, 0–100 (object-position Y).",
        },
        {
          name: "preload",
          type: '"none" | "metadata" | "auto"',
          default: '"metadata"',
          description: "Video preload hint.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"#000000"',
          description:
            "Fills the component; video never appears outside the glyphs.",
        },
        {
          name: "fallbackColor",
          type: "string",
          default: '"#ffffff"',
          description:
            "Solid glyph color when video is unavailable or reduced-motion.",
        },
        {
          name: "reducedMotion",
          type: '"fallback" | "paused"',
          default: '"fallback"',
          description:
            "Fallback renders solid type; paused shows the video paused.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the outer container.",
        },
        {
          name: "style",
          type: "React.CSSProperties",
          description: "Additional inline styles for the outer container.",
        },
      ]}
    />
  );
}
