import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { EditorialWipePreloaderPreview } from "@/components/docs/previews/editorial-wipe-preloader-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { EditorialWipePreloader } from "@/components/ui/editorial-wipe-preloader"

export default function Page() {
  return (
    <main>
      <EditorialWipePreloader />
      {/* Your page content sits underneath */}
      <h1>Welcome</h1>
    </main>
  )
}`;

function EditorialWipePreloaderNotes() {
  return (
    <>
      <Section title="About Editorial Wipe Preloader" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A fullscreen editorial loading wipe: one continuous cream reveal
            with a beige leading edge sweeps horizontally over a deep forest
            field while an oversized tabular counter rides along the
            lower-left.
          </p>
          <p>
            The counter renders twice — dark ink and muted taupe — and the
            taupe render is clipped to the cream region, so a single glyph can
            span the moving color boundary. At 100 the cream frame holds
            briefly, then the entire overlay lifts vertically upward as one
            surface, revealing the page already mounted beneath it. Your
            content exists underneath; the preloader is purely an overlay
            covering it.
          </p>
          <p>
            One motion value drives the counter, the reveal position, the
            counter mask and the label, so they can never drift apart. The
            reveal moves with a single GPU-friendly{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              translate3d
            </code>{" "}
            transform and the counter updates imperatively — React never
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
            staged cinematic progression — quick open, steady middle,
            deliberate crawl into 100.
          </li>
          <li>
            <strong className="text-foreground">Manual mode</strong> follows
            the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              progress
            </code>{" "}
            prop with smoothing, so hook it to real loading when available.
          </li>
          <li>
            <strong className="text-foreground">Debug</strong> — pass{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              debugProgress
            </code>{" "}
            (0–1) to freeze the exact visual state for screenshot comparison.
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
          Portfolio intros, editorial sites, and campaign pages where loading
          itself should feel like a designed title card rather than a spinner.
        </p>
      </Section>
    </>
  );
}

export async function EditorialWipePreloaderDocs() {
  const sourceCode =
    (await readComponentSource("editorial-wipe-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Editorial Wipe Preloader"
      description="A fullscreen forest-to-cream horizontal wipe with a giant split-tone counter and a vertical slide-away reveal."
      preview={
        <EditorialWipePreloaderPreview
          src="/demo/editorial-wipe-preloader"
          title="Editorial Wipe Preloader Demo"
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="editorial-wipe-preloader"
      installDependencies="framer-motion"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/editorial-wipe-preloader.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "duration",
          type: "number",
          default: "3800",
          description:
            "Milliseconds for the simulated 0 → 100 progression (auto mode).",
        },
        {
          name: "completionHold",
          type: "number",
          default: "450",
          description:
            "Milliseconds the completed 100 frame stays visible.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "900",
          description: "Milliseconds for the vertical exit reveal.",
        },
        {
          name: "darkColor",
          type: "string",
          default: '"#1A241E"',
          description: "Fullscreen base field — deep forest green.",
        },
        {
          name: "lightColor",
          type: "string",
          default: '"#E4E0D7"',
          description: "Dominant light surface — warm cream.",
        },
        {
          name: "accentColor",
          type: "string",
          default: '"#C7B39E"',
          description: "Mid-tone travelling band — muted beige.",
        },
        {
          name: "counterDarkColor / counterLightColor",
          type: "string / string",
          default: '"#8A8A8A" / "#AAA0A1"',
          description:
            "Giant counter ink over the dark field and over the cream field.",
        },
        {
          name: "showLoadingLabel / loadingLabel",
          type: "boolean / string",
          default: "true / \"LOADING\"",
          description: "Tiny uppercase label above the counter.",
        },
        {
          name: "startValue / endValue",
          type: "number / number",
          default: "0 / 100",
          description: "Counter values at progress 0 and 100.",
        },
        {
          name: "mode",
          type: '"viewport" | "container"',
          default: '"viewport"',
          description:
            "Viewport covers the screen (fixed); container fills a relative, overflow-hidden parent (absolute). Identical animation logic.",
        },
        {
          name: "counterFontSize / counterFontWeight / counterFontFamily",
          type: "string / number / string",
          default: "clamp(2.5rem, 24cqw, 26.25rem) / 300 / inherit",
          description:
            "Counter typography, relative to the loader's own width. Keep the weight light.",
        },
        {
          name: "progress",
          type: "number",
          description:
            "Manual 0–100 override. Disables simulation; 100 triggers exit.",
        },
        {
          name: "debugProgress",
          type: "number",
          description:
            "Dev-only 0–1 freeze frame. Disables autoplay for calibration.",
        },
        {
          name: "autoPlay / disableScroll / respectReducedMotion",
          type: "boolean",
          default: "true",
          description: "Playback, scroll-lock, and reduced-motion behavior.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "9999",
          description: "Stacking order of the overlay.",
        },
        {
          name: "onStart / onProgress",
          type: "() => void / (value) => void",
          description: "Fires on start and on every integer change.",
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
      afterContent={<EditorialWipePreloaderNotes />}
    />
  );
}
