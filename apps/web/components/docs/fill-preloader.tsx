import {Section} from "@/components/component-layout";
import {DemoFrame} from "@/components/docs/previews/demo-frame";
import {DocsPageLayout} from "@/components/docs-page-layout";

import {readComponentSource} from "@/lib/source-code";
import {FillPreloaderPlayground, FillPreloaderPersonalizePanel} from "@/components/docs/previews/preloader-playgrounds";

const defaultCode = `import { FillPreloader } from "@/components/ui/fill-preloader"

export default function Page() {
  return (
    <main>
      <FillPreloader />
      {/* Your page content sits underneath */}
      <h1>Welcome</h1>
    </main>
  )
}`;

function FillPreloaderNotes() {
  return (
    <>
      <Section title="About Fill Preloader" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A fullscreen loading transition: a solid blue surface rises from the
            bottom over a near-black screen while a large percentage counter
            sits anchored at the bottom-right.
          </p>
          <p>
            At 100% the completed frame holds briefly, then the entire overlay
            slides vertically upward — a clean reveal with no fade. Your page
            content already exists underneath; the preloader is purely an
            overlay covering it.
          </p>
          <p>
            One motion value drives both the blue fill and the counter, so they
            can never drift apart. The fill uses GPU-friendly{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              scaleY
            </code>{" "}
            transforms and the counter updates imperatively — React never
            rerenders at 60fps.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Phases</strong> move through{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              idle → loading → complete → exiting → finished
            </code>
            , then the overlay unmounts itself.
          </li>
          <li>
            <strong className="text-foreground">Auto mode</strong> simulates a
            natural staged progression — slow start, fast middle, eased landing
            near 100%.
          </li>
          <li>
            <strong className="text-foreground">Manual mode</strong> follows the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              progress
            </code>{" "}
            prop with smoothing, so hook it to real loading when available.
          </li>
          <li>
            <strong className="text-foreground">Theme</strong> — background and
            counter default to the page color scheme (light or dark) and follow
            live theme changes; the blue fill stays constant.
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
            <strong className="text-foreground">Reduced motion</strong> shortens
            the simulation and exit while keeping the same sequence.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Portfolio intros, campaign pages, and product launches where the first
          paint should feel like a confident editorial curtain-lift.
        </p>
      </Section>
    </>
  );
}

export async function FillPreloaderDocs() {
  const sourceCode =
    (await readComponentSource("fill-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Fill Preloader"
      description="A fullscreen bottom-up blue fill loader with a giant bottom-right percentage counter and a vertical slide-away reveal."
      preview={<FillPreloaderPlayground />}
      personalizeContent={<FillPreloaderPersonalizePanel />}
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="fill-preloader"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/fill-preloader.tsx"
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame src="/demo/fill-preloader" title="Fill Preloader demo" />
          ),
          code: `import { FillPreloader } from "@/components/ui/fill-preloader"

<FillPreloader />`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "backgroundColor",
          type: "string",
          default: 'theme-aware ("#111111" / "#e8e6e3")',
          description: "Fullscreen background color behind the fill.",
        },
        {
          name: "fillColor",
          type: "string",
          default: '"#0b5ffb"',
          description: "Solid color of the rising progress surface.",
        },
        {
          name: "textColor",
          type: "string",
          default: 'theme-aware ("#ffffff" / "#09090b")',
          description: "Color of the percentage counter.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Color scheme for the defaults. Auto follows the page and updates live; explicit colors always win.",
        },
        {
          name: "duration",
          type: "number",
          default: "2800",
          description:
            "Milliseconds for the simulated 0 → 100 progression (auto mode).",
        },
        {
          name: "completionHold",
          type: "number",
          default: "300",
          description: "Milliseconds the completed 100% frame stays visible.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "900",
          description: "Milliseconds for the vertical exit reveal.",
        },
        {
          name: "progress",
          type: "number",
          description:
            "Manual 0–100 override. Disables simulation; 100 triggers exit.",
        },
        {
          name: "showCounter",
          type: "boolean",
          default: "true",
          description: "Show the bottom-right percentage counter.",
        },
        {
          name: "fontSize / fontWeight / fontFamily",
          type: "string / number / string",
          default: "clamp(64px, 9vw, 132px) / 600 / inherit",
          description: "Counter typography.",
        },
        {
          name: "counterOffsetX / counterOffsetY",
          type: "number",
          default: "32 / 24",
          description:
            "Counter distance in pixels from the right and bottom edges (safe-area aware).",
        },
        {
          name: "zIndex",
          type: "number",
          default: "100",
          description: "Stacking order of the overlay.",
        },
        {
          name: "onPhaseChange",
          type: "(phase) => void",
          description:
            "Fires on every transition: idle, loading, complete, exiting, finished.",
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
      afterContent={<FillPreloaderNotes />}
    />
  );
}
