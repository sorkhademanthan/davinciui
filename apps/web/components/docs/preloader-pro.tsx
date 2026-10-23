import { Section } from "@/components/component-layout";
import { PreloaderPro } from "@workspace/ui/components/preloader-pro";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { PreloaderProPreview } from "@/components/docs/previews/preloader-pro-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { PreloaderPro } from "@/components/ui/preloader-pro"

export function Preview() {
  return (
    <div style={{ width: "100%", height: 420 }}>
      <PreloaderPro mode="preview" />
    </div>
  )
}

// Fullscreen: the same component fills the viewport
export function Fullscreen() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PreloaderPro mode="fullscreen" />
    </div>
  )
}`;

function PreloaderProNotes() {
  return (
    <>
      <Section title="About Preloader Pro" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A two-stage cinematic preloader: a pure-white panel with a heavy
            centered percentage and a thin red progress line, then a sliding
            panel reveal into a dark atmospheric hero with a single massive
            centered word.
          </p>
          <p>
            The percentage follows a loading curve — quick open, steady middle,
            deliberate landing — and the red line grows in lockstep via{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              scaleX
            </code>{" "}
            with a left origin, so it never triggers layout. At 100% the frame
            holds briefly, then the whole white surface slides away upward,
            exposing the hero already mounted underneath.
          </p>
          <p>
            One{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              requestAnimationFrame
            </code>{" "}
            timeline derives every visual from elapsed time. The container is
            the viewport — relative positioning plus container-query units only,
            never{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              position: fixed
            </code>{" "}
            — so the identical component fills a card, the preview panel, and
            fullscreen.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Phases</strong> move through{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              loading → holding → exiting → revealed
            </code>
            , then rest on the hero.
          </li>
          <li>
            <strong className="text-foreground">Modes</strong> —{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              preview | fullscreen
            </code>{" "}
            share one engine and timeline; only responsive dimension caps
            change.
          </li>
          <li>
            <strong className="text-foreground">Hero</strong> — one centered
            DAVINCIUI wordmark on near-black with deep-red central illumination
            and a barely-there ambient drift.
          </li>
          <li>
            <strong className="text-foreground">Loop</strong> — set{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              loop
            </code>{" "}
            for a self-running cycle: hero fades, black holds, the panel returns
            and the counter runs again. Or replay by remounting with a changing{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              key
            </code>
            .
          </li>
          <li>
            <strong className="text-foreground">Reduced motion</strong> keeps
            the functional percentage but shortens the count and swaps the slide
            for a simple fade.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Product launches, campaign pages, and portfolio intros where the first
          paint should feel like a confident editorial curtain-lift into a dark
          cinematic hero.
        </p>
      </Section>
    </>
  );
}

export async function PreloaderProDocs() {
  const sourceCode =
    (await readComponentSource("preloader-pro")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Preloader Pro"
      description="A cinematic two-stage loader: heavy percentage with a thin red line on white, then a sliding panel reveal into a dark DAVINCIUI hero."
      preview={
        <PreloaderProPreview
          src="/demo/preloader-pro"
          title="Preloader Pro Demo"
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="preloader-pro"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/preloader-pro.tsx"
      examples={[
        {
          title: "Panel preview",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <PreloaderPro
                mode="preview"
                duration={2600}
                completionHold={600}
              />
            </div>
          ),
          code: `import { PreloaderPro } from "@/components/ui/preloader-pro"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <PreloaderPro mode="preview" />
</div>`,
        },
        {
          title: "Fast red run",
          preview: (
            <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
              <PreloaderPro
                mode="preview"
                duration={1400}
                completionHold={300}
                exitDuration={500}
                progressColor="#ef4444"
                loaderBackground="#f5f5f4"
              />
            </div>
          ),
          code: `import { PreloaderPro } from "@/components/ui/preloader-pro"

<div className="relative h-[420px] w-full overflow-hidden rounded-xl">
  <PreloaderPro
    mode="preview"
    duration={1400}
    completionHold={300}
    exitDuration={500}
    progressColor="#ef4444"
    loaderBackground="#f5f5f4"
  />
</div>`,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "mode",
          type: '"preview" | "fullscreen"',
          default: '"preview"',
          description:
            "Sizing context. One engine and timeline either way; only responsive dimension caps change.",
        },
        {
          name: "duration",
          type: "number",
          default: "2200",
          description: "Milliseconds for the 0 → 100 progression.",
        },
        {
          name: "completionHold",
          type: "number",
          default: "180",
          description: "Milliseconds the completed 100% frame holds.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "900",
          description: "Milliseconds for the white-panel exit reveal.",
        },
        {
          name: "progressColor",
          type: "string",
          default: '"#D3001B"',
          description: "Thin progress line color.",
        },
        {
          name: "loaderBackground",
          type: "string",
          default: '"#FFFFFF"',
          description: "Loader panel background. Pure white.",
        },
        {
          name: "text",
          type: "string",
          default: '"DAVINCIUI"',
          description:
            "Hero word, rendered once, centered. Rendered exactly as provided.",
        },
        {
          name: "textColor",
          type: "string",
          default: 'theme-aware ("#F4ECEC" / "#191114")',
          description:
            "Center hero ink. Defaults follow the website color scheme.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: 'theme-aware ("#070707" / "#F4F1EE")',
          description:
            "Hero base background. Defaults follow the website color scheme.",
        },
        {
          name: "glowColor",
          type: "string",
          default: "theme-aware (deep red / soft rose)",
          description: "Atmospheric illumination at the hero center.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Color scheme for the hero defaults. Auto follows the website and updates live; explicit colors always win. The white loading stage is fixed reference artwork.",
        },
        {
          name: "showProgress",
          type: "boolean",
          default: "true",
          description: "Show the percentage counter and line.",
        },
        {
          name: "autoStart",
          type: "boolean",
          default: "true",
          description:
            "Start playing on mount. When false, the hero rests revealed.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description:
            "Loop forever: hero fades → black → panel returns → replay.",
        },
        {
          name: "loopHold",
          type: "number",
          default: "2600",
          description:
            "Milliseconds the revealed hero holds before a loop restart.",
        },
        {
          name: "fontFamily",
          type: "string",
          description:
            "Counter / hero font stack. Heavy geometric sans recommended.",
        },
        {
          name: "onPhaseChange",
          type: "(phase) => void",
          description:
            "Fires on every transition: loading, holding, exiting, revealed, looping.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description:
            "Fires once the reveal finishes (every loop when looping).",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the container.",
        },
      ]}
      afterContent={<PreloaderProNotes />}
    />
  );
}
