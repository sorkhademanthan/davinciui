import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import { PremiumPreloaderPreview } from "@/components/docs/previews/premium-preloader-preview";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { PremiumPreloader } from "@/components/ui/premium-preloader"

export function PageIntro() {
  return <PremiumPreloader />
}

// Scoped to a card or docs stage
export function Preview() {
  return (
    <div style={{ position: "relative", width: "100%", height: 600 }}>
      <PremiumPreloader mode="preview" loop />
    </div>
  )
}`;

function PremiumPreloaderNotes() {
  return (
    <>
      <Section title="About Premium Preloader" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A theme-aware editorial curtain: a three-line tagline, a centered
            wordmark, and two mirrored streams of portrait cards that fly
            quadratic paths before the panels split away.
          </p>
          <p>
            Every card pair shares an image and a launch time, so the left and
            right streams read as one symmetrical composition. The layers live
            behind a soft vertical mask, keeping the frame edges clean while the
            cards build density toward the center.
          </p>
          <p>
            One GSAP master timeline drives the whole sequence. Words blur up,
            the tagline and corner marks cross-dissolve into the logo, the card
            chain travels for roughly 0.88s per card, and then the right panel
            drops while the left lifts. The overlay unmounts after the reveal.
          </p>
          <p>
            There is no external logo file in the repository, so omitting{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              logo
            </code>{" "}
            draws the typeset DAVINCIUI wordmark. Pass{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              logo
            </code>{" "}
            to use an image instead.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Sequences</strong> —{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              logo-images
            </code>{" "}
            introduces the mark before the streams;{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              images-logo
            </code>{" "}
            runs the streams first and lands the logo last.
          </li>
          <li>
            <strong className="text-foreground">Replay</strong> — the forwarded
            ref exposes{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              replay(sequence?)
            </code>
            . Each call builds a fresh timeline from a clean first frame.
          </li>
          <li>
            <strong className="text-foreground">Modes</strong> —{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              fullscreen
            </code>{" "}
            locks scroll and inerts the page behind it;{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              preview
            </code>{" "}
            stays inside its positioned parent for cards and docs stages.
          </li>
          <li>
            <strong className="text-foreground">Mobile</strong> — set{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              disableOnMobile
            </code>{" "}
            to skip the overlay below 810px, or pass{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              mobileBreakpoint
            </code>{" "}
            to change the cutoff.
          </li>
          <li>
            <strong className="text-foreground">Theme</strong> —{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              auto
            </code>{" "}
            follows the website light or dark theme live; pass{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              light
            </code>{" "}
            or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              dark
            </code>{" "}
            to force a palette. Explicit background and textColor props still
            win.
          </li>
          <li>
            <strong className="text-foreground">Reduced motion</strong> — the
            full sequence collapses to a 0.4s fade with no card travel.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Component libraries, design systems, and product launches where the
          first paint should feel like an editorial title card rather than a
          progress bar.
        </p>
      </Section>
    </>
  );
}

export async function PremiumPreloaderDocs() {
  const sourceCode =
    (await readComponentSource("premium-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Premium Preloader"
      description="A theme-aware editorial curtain with a three-line tagline, a centered DAVINCIUI wordmark, and mirrored streams of portrait cards."
      preview={
        <PremiumPreloaderPreview
          src="/demo/premium-preloader"
          title="Premium Preloader demo"
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installDependencies="gsap"
      installPackageName="premium-preloader"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/premium-preloader.tsx"
      installationNote="Installs two files: components/ui/premium-preloader.tsx and lib/premium-preloader-path.ts, the shared quadratic-path helper used by the component and its regression test."
      fullWidthPreview
      unstyledPreview
      afterContent={<PremiumPreloaderNotes />}
      props={[
        {
          name: "sequence",
          type: '"logo-images" | "images-logo"',
          default: '"logo-images"',
          description:
            "Choreography order. The logo leads in the first; the card streams lead in the second.",
        },
        {
          name: "tagline",
          type: "string[]",
          default: '["Copy", "Paste", "Ship"]',
          description:
            "Lines rendered as stacked blurred words before the logo appears.",
        },
        {
          name: "logo",
          type: "string",
          description:
            "Optional logo image. When omitted, the typeset DAVINCIUI wordmark renders as text.",
        },
        {
          name: "images",
          type: "string[]",
          description:
            "Card image sources, cycled in order across both mirrored streams.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Follows the website theme live, or forces the light or dark palette.",
        },
        {
          name: "background",
          type: "string",
          default: "theme palette",
          description:
            "Paper color for both curtain panels; overrides the theme palette.",
        },
        {
          name: "textColor",
          type: "string",
          default: "theme palette",
          description: "Logo and tagline ink; overrides the theme palette.",
        },
        {
          name: "disableOnMobile",
          type: "boolean",
          default: "false",
          description:
            "Skip the fullscreen overlay below the mobile breakpoint.",
        },
        {
          name: "mobileBreakpoint",
          type: "number",
          default: "810",
          description: "Cutoff in CSS pixels for disableOnMobile.",
        },
        {
          name: "playOnce",
          type: "boolean",
          default: "false",
          description:
            "Remember completion per path in sessionStorage and skip subsequent mounts.",
        },
        {
          name: "mode",
          type: '"fullscreen" | "preview"',
          default: '"fullscreen"',
          description:
            "Fixed viewport overlay or absolutely positioned stage for cards and previews.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description: "Restart automatically after each reveal.",
        },
        {
          name: "loopHold",
          type: "number",
          default: "900",
          description: "Milliseconds the revealed page holds before looping.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description:
            "Fires after the curtains finish, and after every loop pass.",
        },
        {
          name: "ref",
          type: "PremiumPreloaderHandle",
          description:
            "Forwarded ref exposing replay(sequence?) for imperative restarts.",
        },
      ]}
    />
  );
}
