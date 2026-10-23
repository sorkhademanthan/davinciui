import { Section } from "@/components/component-layout";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { PixelPreloaderPreview } from "@/components/docs/previews/pixel-preloader-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { PixelPreloader } from "@/components/ui/pixel-preloader"

export default function Page() {
  return (
    <main>
      <PixelPreloader />
      {/* Your page content sits underneath */}
      <h1>Welcome</h1>
    </main>
  )
}`;

function PixelPreloaderNotes() {
  return (
    <>
      <Section title="About Pixel Preloader" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A fullscreen pixel-cell loading takeover: a fine canvas grid fills
            bottom-up behind a jagged orange transition frontier with vertical
            spikes, while a small histogram + percentage HUD sits at the
            top-left.
          </p>
          <p>
            At 100% the completed white frame holds briefly, then the overlay
            fades to reveal the page already mounted underneath. The frontier is
            a persistent per-column simulation — not television static — so
            consecutive frames read as the same terrain evolving.
          </p>
          <p>
            Canvas renders every cell directly and the percentage only touches
            the DOM when the integer changes, so React never rerenders at 60fps.
            Noise is seeded, so the same{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              seed
            </code>{" "}
            replays the exact same pattern.
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
            staged progression — slow emergence, steady middle, eased landing
            near 100%.
          </li>
          <li>
            <strong className="text-foreground">Manual mode</strong> follows the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              progress
            </code>{" "}
            prop (0–100) with smoothing, so hook it to real loading when
            available.
          </li>
          <li>
            <strong className="text-foreground">Theme</strong> — the field
            colors default to the page color scheme (near-black → white in dark
            mode, warm gray → white in light mode) and follow live theme
            changes; the orange frontier stays constant.
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
            <strong className="text-foreground">Reduced motion</strong> renders
            a calm frontier without spikes and shortens the sequence.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Digital-first brand intros, developer tools, and launch pages where
          loading itself should feel like a procedural signal takeover.
        </p>
      </Section>
    </>
  );
}

export async function PixelPreloaderDocs() {
  const sourceCode =
    (await readComponentSource("pixel-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Pixel Preloader"
      description="A fullscreen pixel-grid loader that takes over the viewport bottom-up behind a jagged orange frontier, with a top-left percentage HUD and a clean fade reveal."
      preview={
        <PixelPreloaderPreview
          src="/demo/pixel-preloader"
          title="Pixel Preloader Demo"
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="pixel-preloader"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/pixel-preloader.tsx"
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/pixel-preloader"
              title="Pixel Preloader demo"
            />
          ),
          code: `import { PixelPreloader } from "@/components/ui/pixel-preloader"

<PixelPreloader />`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "progress",
          type: "number",
          description:
            "Manual 0–100 override. Disables simulation; 100 triggers exit.",
        },
        {
          name: "duration",
          type: "number",
          default: "4500",
          description:
            "Milliseconds for the simulated 0 → 100 progression (auto mode).",
        },
        {
          name: "seed",
          type: "number",
          default: "1337",
          description: "Seed for deterministic noise and spikes.",
        },
        {
          name: "cellSize",
          type: "number",
          default: "6",
          description: "Target cell size in CSS pixels.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: 'theme-aware ("#0d0d0d" / "#d9d6d0")',
          description: "Unloaded-region color.",
        },
        {
          name: "foregroundColor",
          type: "string",
          default: 'theme-aware ("#f3efe7" / "#faf8f3")',
          description: "Loaded-region (warm white) color.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Color scheme for the defaults. Auto follows the page and updates live; explicit colors always win.",
        },
        {
          name: "accentColor",
          type: "string",
          default: '"#ff4d23"',
          description: "Transition-frontier (orange) color.",
        },
        {
          name: "showPercentage",
          type: "boolean",
          default: "true",
          description: "Show the top-left percentage HUD.",
        },
        {
          name: "completionHold",
          type: "number",
          default: "450",
          description: "Milliseconds the completed 100% frame stays visible.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "700",
          description: "Milliseconds for the fade-out reveal.",
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
            "Fires on every transition: idle, loading, complete, exiting, finished.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description:
            "Fires once the reveal finishes and the overlay unmounts.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the overlay wrapper.",
        },
      ]}
      afterContent={<PixelPreloaderNotes />}
    />
  );
}
