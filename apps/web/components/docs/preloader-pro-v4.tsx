import { Section } from "@/components/component-layout";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";

import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { PreloaderProV4 } from "@/components/ui/preloader-pro-v4"

const cards = [
  { src: "/images/spiral-3d-slider/camera-reflection.jpg", title: "Field study" },
  { src: "/images/spiral-3d-slider/white-motion.jpg", title: "Quiet rooms" },
  { src: "/images/spiral-3d-slider/orange-haze.jpg", title: "North light" },
  {
    src: "/images/spiral-3d-slider/red-echo.jpg",
    expandSrc: "/images/spiral-3d-slider/red-echo-16x9.jpg",
  },
  { src: "/images/spiral-3d-slider/visor-portrait.jpg", title: "Material notes" },
  { src: "/images/spiral-3d-slider/dark-glitch.jpg", title: "Open studio" },
  { src: "/images/spiral-3d-slider/teal-echo.jpg", title: "Late hours" },
]

export default function Page() {
  return (
    <main>
      <PreloaderProV4
        cards={cards}
        featuredIndex={3}
        label="Loading"
        exit="fade"
      />
      {/* Your page sits underneath and is revealed by the exit */}
      <h1>DaVinci UI</h1>
    </main>
  )
}`;

function PreloaderProV4Notes() {
  return (
    <>
      <Section title="About Preloader Pro V4" className="pt-8 scroll-mt-24">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A seven-card editorial loader: portrait stills rise from the lower
            edge, collapse into a centred pile, then fan into a shallow arc
            while the counter climbs from 000 to 100.
          </p>
          <p>
            At the top of the count the centre card lifts, pauses, and expands
            into a full-bleed 16:9 image before the overlay cuts away to the
            page. Add an optional{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              expandSrc
            </code>{" "}
            to the featured card for a dedicated landscape crop. The composition
            is built from flat DOM elements — no canvas, WebGL, or 3D
            transforms.
          </p>
          <p>
            One{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              requestAnimationFrame
            </code>{" "}
            timeline drives the whole sequence. Card positions, ripple, lift,
            expansion, counter, and exit all read from elapsed time, so the
            loader stays deterministic and can be scrubbed or replayed.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8 scroll-mt-24">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Rise and fan</strong> starts as
            a tight column at the bottom edge, collapses at centre, then springs
            into a 12.5° arc with the featured card on top.
          </li>
          <li>
            <strong className="text-foreground">Counter</strong> follows the
            measured curve and eases into 100 around 2.13s, well before the lift
            begins.
          </li>
          <li>
            <strong className="text-foreground">Ripple</strong> sends a short
            vertical bump through the fan during the count, offset per card and
            scaled by{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              rippleIntensity
            </code>
            .
          </li>
          <li>
            <strong className="text-foreground">Lift and expand</strong> raises
            the featured card by 115px at 1.14× scale, holds, then animates its
            real rectangle to the viewport with{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              object-fit: cover
            </code>
            .
          </li>
          <li>
            <strong className="text-foreground">Exit</strong> is a 0.45s fade by
            default.{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              exit=&quot;slide-up&quot;
            </code>{" "}
            lifts the whole overlay away over 0.7s.
          </li>
          <li>
            <strong className="text-foreground">Theme aware</strong> by default:
            the overlay follows the site light/dark class, so light mode uses
            warm paper with dark ink and dark mode keeps the near-black palette.
            Set{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              theme
            </code>{" "}
            to lock a palette.
          </li>
          <li>
            <strong className="text-foreground">Reduced motion</strong> skips
            the fan, ripple, lift, and expansion, showing a static composed
            frame with a short fade.
          </li>
          <li>
            <strong className="text-foreground">Page load mode</strong> follows
            image decoding and document load events instead of the timed curve.
          </li>
          <li>
            <strong className="text-foreground">Replay</strong> with the exposed{" "}
            {"`replay()`"} ref handle, or scrub with {"`seek(t)`"}.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8 scroll-mt-24">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Fashion editorials, photography portfolios, and launch pages where a
          small set of images should feel like a printed contact sheet opening
          into a single hero frame.
        </p>
      </Section>
    </>
  );
}

export async function PreloaderProV4Docs() {
  const sourceCode =
    (await readComponentSource("preloader-pro-v4")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Preloader Pro V4"
      description="A seven-card editorial preloader with a rising pile, fanned arc, percentage counter, centre-card lift, and a full-bleed 16:9 image expansion."
      preview={
        <DemoFrame
          src="/demo/preloader-pro-v4"
          title="Preloader Pro V4 demo"
          fill
          flush
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="preloader-pro-v4"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/preloader-pro-v4.tsx"
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/preloader-pro-v4"
              title="Preloader Pro V4 demo"
              fill
              flush
            />
          ),
          code: defaultCode,
        },
        {
          title: "Slide-up exit",
          preview: (
            <DemoFrame
              src="/demo/preloader-pro-v4?exit=slide-up"
              title="Preloader Pro V4 slide-up exit"
              fill
              flush
            />
          ),
          code: defaultCode.replace('exit="fade"', 'exit="slide-up"'),
        },
        {
          title: "Page load mode",
          preview: (
            <DemoFrame
              src="/demo/preloader-pro-v4?mode=pageLoad"
              title="Preloader Pro V4 page load mode"
              fill
              flush
            />
          ),
          code: defaultCode.replace(
            'exit="fade"',
            'mode="pageLoad"\n        exit="fade"',
          ),
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "cards",
          type: "{ src: string; expandSrc?: string; title?: string }[]",
          default: "7-image editorial set",
          description:
            "Card images rendered in order. Up to 15 are supported. The featured card can provide a 16:9 expandSrc for the fullscreen crop.",
        },
        {
          name: "featuredIndex",
          type: "number",
          default: "middle card",
          description:
            "Card that lifts and expands into a 16:9 frame that covers the viewport.",
        },
        {
          name: "featuredTitle",
          type: "string",
          default: "—",
          description:
            "Optional title reserved for the featured card in future caption variants.",
        },
        {
          name: "label",
          type: "string",
          default: '"Loading"',
          description:
            "Top-left label, uppercased by CSS with wide letter spacing.",
        },
        {
          name: "mode",
          type: '"timed" | "pageLoad"',
          default: '"timed"',
          description:
            "Timed uses the measured two-second counter curve; pageLoad follows image decoding and document load events.",
        },
        {
          name: "duration",
          type: "number",
          default: "2",
          description:
            "Seconds for the counter progression. The lift and exit phases shift with this value.",
        },
        {
          name: "exit",
          type: '"fade" | "slide-up"',
          default: '"fade"',
          description:
            "Overlay exit: a 0.45s opacity fade or a 0.7s upward slide.",
        },
        {
          name: "theme",
          type: '"auto" | "light" | "dark"',
          default: '"auto"',
          description:
            "Palette mode. Auto follows the site light/dark class; light uses warm paper and dark ink.",
        },
        {
          name: "background",
          type: "string",
          default: "theme palette",
          description:
            "Overlay background override. Defaults to the active theme palette.",
        },
        {
          name: "textColor",
          type: "string",
          default: "theme palette",
          description:
            "Counter and primary foreground override. Defaults to the active theme palette.",
        },
        {
          name: "mutedColor",
          type: "string",
          default: "theme palette",
          description:
            "Label and dimmed counter override. Defaults to the active theme palette.",
        },
        {
          name: "counterFont",
          type: "string",
          default: '"Inter Tight", …',
          description: "Counter font stack.",
        },
        {
          name: "labelFont",
          type: "string",
          default: '"Inter Tight", …',
          description: "Top-left label font stack.",
        },
        {
          name: "cardWidth",
          type: "number",
          default: "170",
          description:
            "Base card width at 1465px. Scales with the viewport and preserves a 5:7 aspect ratio.",
        },
        {
          name: "spread",
          type: "number",
          default: "12.5",
          description:
            "Rotation between adjacent cards in degrees, capped as the card count grows.",
        },
        {
          name: "radius",
          type: "number",
          default: "14",
          description: "Card corner radius, scaled with card width.",
        },
        {
          name: "rippleIntensity",
          type: "number",
          default: "1",
          description:
            "Scales the travelling vertical ripple during the counter phase. Zero disables it.",
        },
        {
          name: "waveCount",
          type: "number",
          default: "1",
          description:
            "Number of interleaved ripple waves passing through the fan.",
        },
        {
          name: "lockScroll",
          type: "boolean",
          default: "true",
          description:
            "Locks page scroll while the overlay is active and marks the underlying main element inert.",
        },
        {
          name: "oncePerSession",
          type: "boolean",
          default: "false",
          description:
            "Stores a sessionStorage flag when the exit starts and skips the loader on later mounts.",
        },
        {
          name: "onComplete",
          type: "() => void",
          default: "—",
          description:
            "Fires after the overlay leaves and is removed from the tree.",
        },
        {
          name: "preview",
          type: "boolean",
          default: "false",
          description:
            "Renders one frozen frame with no timers, used by gallery cards and docs surfaces.",
        },
        {
          name: "previewTime",
          type: "number",
          default: "1.6",
          description: "Timeline time used when preview is enabled.",
        },
      ]}
      afterContent={<PreloaderProV4Notes />}
    />
  );
}
