import { DocsPageLayout } from "@/components/docs-page-layout";
import { curveWallDemoItems } from "@/components/docs/previews/curve-wall-items";
import { readComponentSource } from "@/lib/source-code";
import { CurveWall } from "@workspace/ui/components/curve-wall";

const defaultCode = `import { CurveWall } from "@/components/ui/curve-wall"

const items = [
  { src: "/images/gallery/photo-01.jpg", alt: "Describe the first tile" },
  { src: "/images/gallery/photo-02.jpg", alt: "Describe the second tile" },
]

<CurveWall items={items} />`;

const usageCode = `"use client"

import {
  CurveWall,
  type CurveWallItem,
} from "@/components/ui/curve-wall"

// Add your own files to public/images/gallery, or use remote media URLs.
const items: CurveWallItem[] = [
  { src: "/images/gallery/photo-01.jpg", alt: "Describe the first tile" },
  { src: "/images/gallery/photo-02.jpg", alt: "Describe the second tile" },
  { src: "/images/gallery/photo-03.jpg", alt: "Describe the third tile" },
  {
    src: "/images/gallery/clip.mp4",
    type: "video",
    alt: "A looping video tile",
  },
]

export default function Wall() {
  return (
    <CurveWall
      items={items}
      className="h-[720px]"
      columns={5}
      bow={0.16}
      dragSpeed={1}
      wheelSpeed={1}
    />
  )
}`;

export async function CurveWallDocs() {
  const sourceCode =
    (await readComponentSource("curve-wall")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Curve Wall"
      description="A full-bleed wall of portrait media bowed into a soft lens, with drag momentum, a shared-wall hover lift, a spotlight vignette, and an in-place media viewer."
      preview={
        <CurveWall
          items={curveWallDemoItems}
          fit="contain"
          className="h-full min-h-0"
          ariaLabel="CMS curve media wall"
        />
      }
      previewCode={defaultCode}
      installPackageName="curve-wall"
      installDependencies="clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/curve-wall.tsx"
      usageCode={usageCode}
      usageNote={
        <p className="text-sm leading-6 text-muted-foreground">
          Tiles support images or muted, looping video. Clicking a tile expands
          it into an in-place viewer; an optional <code>href</code> appears as a
          secondary Visit button inside that viewer. The wall repeats the media
          across the viewport, so keep the item list focused and give every
          item meaningful alternative text.
        </p>
      }
      examples={[
        {
          title: "Tighter grid, deeper dome",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
              <CurveWall
                items={curveWallDemoItems.slice(0, 14)}
                columns={7}
                gap={8}
                bow={0.24}
                lens={0.3}
                fit="contain"
                className="h-full"
                ariaLabel="Tightly packed curve wall"
              />
            </div>
          ),
          code: `import { CurveWall } from "@/components/ui/curve-wall"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
  <CurveWall
    items={items}
    columns={7}
    gap={8}
    bow={0.24}
    lens={0.3}
    fit="contain"
    className="h-full"
  />
</div>`,
        },
        {
          title: "Calm, static wall",
          preview: (
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
              <CurveWall
                items={curveWallDemoItems.slice(4, 18)}
                columns={4}
                gap={16}
                shade={0.72}
                fit="contain"
                interactive={false}
                className="h-full"
                ariaLabel="Static curve wall"
              />
            </div>
          ),
          code: `import { CurveWall } from "@/components/ui/curve-wall"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-background">
  <CurveWall
    items={items}
    columns={4}
    gap={16}
    shade={0.72}
    fit="contain"
    interactive={false}
    className="h-full"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      props={[
        {
          name: "items",
          type: "CurveWallItem[]",
          description: "Images or videos repeated across the wall.",
        },
        {
          name: "columns",
          type: "number",
          default: "5",
          description: "Columns used to size the grid.",
        },
        {
          name: "gap",
          type: "number",
          default: "12",
          description: "Gap between cells in pixels.",
        },
        {
          name: "ratio",
          type: "number",
          default: "0.8",
          description: "Tile width divided by height.",
        },
        {
          name: "tileScale",
          type: "number",
          default: "0.86",
          description: "Scale applied to tile size and grid pitch.",
        },
        {
          name: "fit",
          type: '"cover" | "contain"',
          default: '"cover"',
          description: "How wall media fits inside each tile.",
        },
        {
          name: "radius",
          type: "number",
          default: "6",
          description: "Tile corner radius in pixels.",
        },
        {
          name: "drift",
          type: "number",
          default: "0.4",
          description: "Horizontal drift applied to media inside each tile.",
        },
        {
          name: "bow",
          type: "number",
          default: "0.16",
          description: "Curvature strength. Positive swells outward.",
        },
        {
          name: "lens",
          type: "number",
          default: "0.22",
          description: "Cursor lens strength.",
        },
        {
          name: "reach",
          type: "number",
          default: "1.4",
          description: "Cursor lens reach relative to the smaller cell side.",
        },
        {
          name: "dragSpeed",
          type: "number",
          default: "1",
          description: "Multiplier applied to drag movement.",
        },
        {
          name: "wheelSpeed",
          type: "number",
          default: "1",
          description: "Multiplier applied to wheel movement.",
        },
        {
          name: "settle",
          type: "number",
          default: "0.92",
          description: "Glide retained after a fling.",
        },
        {
          name: "wander",
          type: "number",
          default: "0",
          description: "Idle drift in pixels per second.",
        },
        {
          name: "heading",
          type: "number",
          default: "215",
          description: "Idle drift angle in degrees.",
        },
        {
          name: "scatter",
          type: "boolean",
          default: "true",
          description: "Shuffle the media order across cells.",
        },
        {
          name: "seed",
          type: "number",
          default: "7",
          description: "Shuffle seed.",
        },
        {
          name: "spotlight",
          type: "boolean",
          default: "true",
          description: "Render the spotlight vignette.",
        },
        {
          name: "shade",
          type: "number",
          default: "0.62",
          description: "Vignette shade between 0 and 1.",
        },
        {
          name: "hole",
          type: "number",
          default: "0.9",
          description: "Clear radius of the spotlight.",
        },
        {
          name: "feather",
          type: "number",
          default: "0.9",
          description: "Spotlight falloff.",
        },
        {
          name: "tint",
          type: "string",
          default: '"#08080a"',
          description: "Vignette and backdrop tint.",
        },
        {
          name: "background",
          type: "string",
          default: '"var(--background, #000000)"',
          description: "Stage background. Follows the active theme by default.",
        },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description: "Enable drag, wheel, hover, keyboard, and the viewer.",
        },
        {
          name: "ariaLabel",
          type: "string",
          default: '"Curve media wall"',
          description: "Accessible name for the gallery region.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the stage.",
        },
        {
          name: "style",
          type: "CSSProperties",
          description: "Additional styles for the stage.",
        },
      ]}
    />
  );
}
