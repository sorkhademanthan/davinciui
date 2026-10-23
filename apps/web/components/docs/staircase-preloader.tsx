import { Section } from "@/components/component-layout";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { StaircasePreloaderPreview } from "@/components/docs/previews/staircase-preloader-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { StaircasePreloader } from "@/components/ui/staircase-preloader"

export default function Page() {
  return (
    <main>
      <StaircasePreloader />
      {/* Your page content sits underneath */}
      <h1>Welcome</h1>
    </main>
  )
}`;

function StaircasePreloaderNotes() {
  return (
    <>
      <Section title="About Staircase Preloader" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A fullscreen stepped-curtain reveal: a solid vivid orange overlay
            holds briefly, then leaves upward as vertical strips with a small
            left-to-right stagger — so the lower edge reads as a rectangular
            staircase that exits near the top-right.
          </p>
          <p>
            The strips overlap by a pixel to render as one continuous orange
            surface with zero seams. Your page content already exists underneath
            and stays completely stationary; the preloader purely uncovers it
            with GPU-friendly{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              transform
            </code>{" "}
            motion and a strong ease-out curve.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Phases</strong> move through{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              idle → holding → exiting → finished
            </code>
            , then the overlay unmounts itself.
          </li>
          <li>
            <strong className="text-foreground">Staircase</strong> comes from
            per-column delays — the left strip lifts first and each strip to the
            right follows ~55ms later.
          </li>
          <li>
            <strong className="text-foreground">Replay</strong> by remounting
            with a changing{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              key
            </code>
            .
          </li>
          <li>
            <strong className="text-foreground">Scroll</strong> is locked while
            the overlay is alive and restored on exit.
          </li>
          <li>
            <strong className="text-foreground">Theme</strong> — the curtain is
            an opaque brand color, so it is identical in light and dark mode by
            design; the revealed page underneath adapts as usual.
          </li>
          <li>
            <strong className="text-foreground">Reduced motion</strong> keeps
            the same sequence with a short, stagger-free reveal.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Portfolio intros, campaign pages, and product launches where the first
          paint should feel like a confident geometric curtain being pulled
          upward.
        </p>
      </Section>
    </>
  );
}

export async function StaircasePreloaderDocs() {
  const sourceCode =
    (await readComponentSource("staircase-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Staircase Preloader"
      description="A fullscreen orange stepped-curtain loader that exits upward with a left-to-right staircase edge and a top-right finish."
      preview={
        <StaircasePreloaderPreview
          src="/demo/staircase-preloader"
          title="Staircase Preloader Demo"
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="staircase-preloader"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/staircase-preloader.tsx"
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/staircase-preloader"
              title="Staircase Preloader demo"
            />
          ),
          code: `import { StaircasePreloader } from "@/components/ui/staircase-preloader"

<StaircasePreloader />`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "color",
          type: "string",
          default: '"#FF3D00"',
          description: "Solid color of the fullscreen curtain.",
        },
        {
          name: "stepCount",
          type: "number",
          default: "8",
          description:
            "Number of vertical strips forming the staircase (4–12).",
        },
        {
          name: "holdDuration",
          type: "number",
          default: "200",
          description:
            "Milliseconds the fully-covered orange frame stays visible.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "850",
          description: "Milliseconds for each column's upward travel.",
        },
        {
          name: "stagger",
          type: "number",
          default: "55",
          description:
            "Delay in milliseconds between successive columns, left to right.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "9999",
          description: "Stacking order of the overlay.",
        },
        {
          name: "onPhaseChange",
          type: "(phase) => void",
          description:
            "Fires on every transition: idle, holding, exiting, finished.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description:
            "Fires once the exit reveal finishes and the overlay unmounts.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the overlay wrapper.",
        },
      ]}
      afterContent={<StaircasePreloaderNotes />}
    />
  );
}
