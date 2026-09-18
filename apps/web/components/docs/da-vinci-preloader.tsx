import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { DaVinciPreloaderPreview } from "@/components/docs/previews/da-vinci-preloader-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { DaVinciPreloader } from "@/components/ui/da-vinci-preloader"

export default function Page() {
  return (
    <DaVinciPreloader image="/images/hero.jpg">
      {/* Your hero / page content sits underneath */}
      <main>
        <h1>Welcome</h1>
      </main>
    </DaVinciPreloader>
  )
}`;

function DaVinciPreloaderNotes() {
  return (
    <>
      <Section title="About Da Vinci Preloader" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            One continuous cinematic transformation: the hero is visible,
            its typography fragments and scatters, an off-white screen takes
            over, DA VINCI assembles from clipped slices, a small hero-image
            window opens inside the wordmark — then expands until it becomes
            the page itself.
          </p>
          <p>
            The reveal layer is a single fullscreen image whose{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              clip-path
            </code>{" "}
            interpolates from a point to a small center rect to full
            viewport. The crop can never jump, because only the mask moves.
            At handoff the overlay fades over the identical hero asset, so
            the transition is effectively invisible.
          </p>
          <p>
            Hero fragmentation targets{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              [data-dv-hero-char]
            </code>{" "}
            descendants of your content when present; otherwise the overlay
            wipe still runs. One GSAP master timeline drives everything —
            no timeout chains, no per-frame React state.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Phases</strong> move through{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              hero → fragmenting → assembling → holding → revealing →
              expanding → handing-off → finished
            </code>
            , then the overlay unmounts itself.
          </li>
          <li>
            <strong className="text-foreground">Asset gating</strong> — the
            timeline waits for the hero image and fonts (plus a minimum
            display floor) so it never completes over an unloaded hero.
          </li>
          <li>
            <strong className="text-foreground">Seamless handoff</strong> —
            pass the same asset to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              image
            </code>{" "}
            that your hero renders underneath. Never use a separately
            cropped thumbnail.
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
            the sequence is alive and restored on exit.
          </li>
          <li>
            <strong className="text-foreground">Reduced motion</strong> shows
            a brief wordmark and a short reveal, then exposes the hero.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Portfolio intros, studio sites, and campaign pages where the loader
          should transform directly into the website — typography into image
          into hero.
        </p>
      </Section>
    </>
  );
}

export async function DaVinciPreloaderDocs() {
  const sourceCode =
    (await readComponentSource("da-vinci-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Da Vinci Preloader"
      description="Hero type fragments, DA VINCI assembles on off-white, then a hero-image window opens inside the wordmark and expands into the full page."
      preview={
        <DaVinciPreloaderPreview
          src="/demo/da-vinci-preloader"
          title="Da Vinci Preloader Demo"
          className="h-[420px]"
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="da-vinci-preloader"
      installDependencies="gsap"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/da-vinci-preloader.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "children",
          type: "React.ReactNode",
          description:
            "Page / hero content revealed underneath the loader.",
        },
        {
          name: "image",
          type: "string",
          description:
            "Hero image source. Must be the same asset your hero renders underneath for a seamless handoff.",
        },
        {
          name: "text",
          type: "string",
          default: '"DA VINCI"',
          description: "Wordmark text. Preserves the space between words.",
        },
        {
          name: "background",
          type: "string",
          default: '"#F3F1F1"',
          description: "Loader background — a light warm gray, never pure white.",
        },
        {
          name: "textColor",
          type: "string",
          default: '"#141414"',
          description: "Wordmark ink color.",
        },
        {
          name: "duration",
          type: "number",
          default: "3.2",
          description:
            "Master timeline scale in seconds. 1× ≈ 3.2s reference pacing.",
        },
        {
          name: "minimumDuration",
          type: "number",
          default: "400",
          description:
            "Minimum milliseconds to wait for the hero asset and fonts before playing.",
        },
        {
          name: "imageAlt",
          type: "string",
          default: '""',
          description: "Alt text for the reveal image (decorative by default).",
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
            "Fires on every transition: hero, fragmenting, assembling, holding, revealing, expanding, handing-off, finished.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description:
            "Fires once the handoff finishes and the overlay unmounts.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the overlay wrapper.",
        },
      ]}
      afterContent={<DaVinciPreloaderNotes />}
    />
  );
}
