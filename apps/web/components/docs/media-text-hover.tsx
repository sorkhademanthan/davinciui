import { MediaTextHover } from "@workspace/ui/components/media-text-hover";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  MediaTextHoverPersonalizePanel,
  MediaTextHoverPlayground,
} from "@/components/docs/previews/media-text-hover-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { MediaTextHover } from "@/components/ui/media-text-hover"

<MediaTextHover
  text="DAVINCIUI"
  mediaSrc="/preview-videos/component-animations/spiral3dslider.mp4"
  mediaWidth={300}
  mediaHeight={100}
/>`;

export async function MediaTextHoverDocs() {
  const sourceCode =
    (await readComponentSource("media-text-hover")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Media Text Hover"
      description="A bold split headline that opens a responsive image or video window on hover, focus, or touch. Choose a centered brand reveal or let the split follow the pointer."
      preview={<MediaTextHoverPlayground />}
      personalizeContent={<MediaTextHoverPersonalizePanel />}
      previewCode={defaultCode}
      installPackageName="media-text-hover"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/media-text-hover.tsx"
      usageCode={
        <LiveCodeBlock slug="media-text-hover" defaultCode={defaultCode} />
      }
      fullWidthPreview
      examples={[
        {
          title: "Dynamic split with an image",
          preview: (
            <div className="flex min-h-[260px] items-center justify-center bg-background px-6">
              <MediaTextHover
                text="PORTFOLIO"
                mode="dynamic"
                mediaSrc="/images/spiral-3d-slider/prism-portrait.webp"
                mediaWidth={260}
                mediaHeight={120}
                mediaRadius={12}
                fontSize="clamp(3rem, 9vw, 6rem)"
                textColor="var(--foreground)"
              />
            </div>
          ),
          code: `import { MediaTextHover } from "@/components/ui/media-text-hover"

<div className="flex min-h-[360px] items-center justify-center bg-background px-6">
  <MediaTextHover
    text="PORTFOLIO"
    mode="dynamic"
    mediaSrc="/images/spiral-3d-slider/prism-portrait.webp"
    mediaWidth={260}
    mediaHeight={120}
    mediaRadius={12}
    fontSize="clamp(3rem, 9vw, 6rem)"
    textColor="var(--foreground)"
  />
</div>`,
        },
        {
          title: "Fixed split with video",
          preview: (
            <div className="flex min-h-[260px] items-center justify-center bg-background px-6">
              <MediaTextHover
                text="SHOWREEL"
                splitIndex={5}
                mediaSrc="/preview-videos/component-animations/spiral3dslider.mp4"
                mediaWidth={200}
                mediaHeight={90}
                mediaRadius={8}
                fontSize="clamp(2.5rem, 7vw, 5rem)"
                textColor="var(--foreground)"
              />
            </div>
          ),
          code: `import { MediaTextHover } from "@/components/ui/media-text-hover"

<div className="flex min-h-[360px] items-center justify-center bg-background px-6">
  <MediaTextHover
    text="SHOWREEL"
    splitIndex={5}
    mediaSrc="/preview-videos/component-animations/spiral3dslider.mp4"
    mediaWidth={200}
    mediaHeight={90}
    mediaRadius={8}
    fontSize="clamp(2.5rem, 7vw, 5rem)"
    textColor="var(--foreground)"
  />
</div>`,
        },
      ]}
      props={[
        {
          name: "text",
          type: "string",
          default: '"DAVINCIUI"',
          description: "Headline rendered on both sides of the media window.",
        },
        {
          name: "splitIndex",
          type: "number",
          default: "midpoint",
          description: "Character index where the media opens in fixed mode.",
        },
        {
          name: "mode",
          type: '"fixed" | "dynamic"',
          default: '"fixed"',
          description:
            "Keep the split centered or move it across the headline with the pointer.",
        },
        {
          name: "mediaSrc",
          type: "string",
          description:
            "Image or video URL revealed between the two text fragments.",
        },
        {
          name: "mediaType",
          type: '"image" | "video"',
          default: "inferred",
          description:
            "Optional media type override when it cannot be inferred from the URL.",
        },
        {
          name: "mediaAlt",
          type: "string",
          default: '""',
          description:
            "Alternative text for image media. Leave empty when the media is decorative.",
        },
        {
          name: "mediaWidth / mediaHeight",
          type: "number",
          default: "225 / 25",
          description: "Expanded media dimensions in pixels.",
        },
        {
          name: "mediaRadius",
          type: "number",
          default: "6",
          description: "Media corner radius in pixels.",
        },
        {
          name: "mediaGap",
          type: "number",
          default: "16",
          description:
            "Horizontal gap between the text fragments and the media window.",
        },
        {
          name: "objectFit",
          type: 'CSSProperties["objectFit"]',
          default: '"cover"',
          description: "Controls how the image or video fills its window.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"Anton, \'Anton SC\', sans-serif"',
          description: "Display family used by both headline fragments.",
        },
        {
          name: "fontSize",
          type: "number | string",
          default: "130",
          description: "Responsive strings such as clamp() are supported.",
        },        {
          name: "fontWeight",
          type: "number | string",
          default: "400",
          description: "Headline font weight.",
        },
        {
          name: "letterSpacing",
          type: "number | string",
          default: '"-0.02em"',
          description: "Headline tracking.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"var(--foreground)"',
          description: "Headline color.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: '"var(--background)"',
          description:
            'Stage background behind the headline. Use "transparent" to inherit the surrounding surface.',
        },
        {
          name: "springStiffness / springDamping",
          type: "number",
          default: "225 / 50",
          description:
            "Spring response used to open and close the media window.",
        },
      ]}
    />
  );
}
