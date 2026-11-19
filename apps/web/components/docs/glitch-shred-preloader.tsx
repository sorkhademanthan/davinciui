import { Section } from "@/components/component-layout";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";

import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { PreloaderProV1 } from "@/components/ui/glitch-shred-preloader"

export default function Page() {
  return (
    <main>
      <PreloaderProV1
        images={[
          { src: "/images/one.jpg" },
          { src: "/images/two.jpg" },
          { src: "/images/three.jpg" },
        ]}
        label="LOADING"
      />
      {/* Your page content sits underneath and is revealed by the exit */}
      <h1>Welcome</h1>
    </main>
  )
}`;

function PreloaderProV1Notes() {
  return (
    <>
      <Section title="About Glitch Shred Preloader" className="pt-8 scroll-mt-24">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A full-screen cinematic loader: a drifting strip of portrait cards
            on near-black (or warm paper in light mode), a zero-padded
            percentage counter, a hairline progress bar, and random glitch
            bursts that flicker over the scene.
          </p>
          <p>
            The exit shreds the screen into horizontal bands. Outer bands slide
            sideways and drop away with grey trails, the central cards stretch
            into RGB-split ribbons and mosaic blocks, then the remaining bands
            collapse to a line at the vertical centre and vanish.
          </p>
          <p>
            One{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              requestAnimationFrame
            </code>{" "}
            timeline derives every value from elapsed time. Only transforms,
            opacity and filter change, and the counter updates imperatively so
            React never re-renders at 60fps.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8 scroll-mt-24">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Timed mode</strong> follows the
            measured power ease-out: 2.7s from 0 to 100, then a 1.2s hold before
            the 1s shred exit.
          </li>
          <li>
            <strong className="text-foreground">Page load mode</strong> follows
            real loading events and image decoding, eased with the same curve
            and never going backwards.
          </li>
          <li>
            <strong className="text-foreground">Glitches</strong> fire in short
            bursts — chromatic split, interference lines, displaced blocks,
            pixel smears and the occasional scrambled digit.
          </li>
          <li>
            <strong className="text-foreground">Theme aware</strong> by default:
            it follows the site light/dark class, or set{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              theme
            </code>{" "}
            to lock a palette.
          </li>
          <li>
            <strong className="text-foreground">Reduced motion</strong> removes
            drift, glitches and the shred, exiting with a short opacity fade.
          </li>
          <li>
            <strong className="text-foreground">Replay</strong> with the
            exposed {"`replay()`"} ref handle.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8 scroll-mt-24">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Editorial portfolios, fashion campaigns and launch pages where the
          first paint should feel like a glitched film leader shredding open.
        </p>
      </Section>
    </>
  );
}

export async function PreloaderProV1Docs() {
  const sourceCode =
    (await readComponentSource("glitch-shred-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Glitch Shred Preloader"
      description="A cinematic strip preloader with drifting portrait cards, a zero-padded counter, glitch bursts and a sliced-shred RGB exit."
      preview={
        <DemoFrame
          src="/demo/glitch-shred-preloader"
          title="Glitch Shred Preloader demo"
          fill
          flush
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="glitch-shred-preloader"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/glitch-shred-preloader.tsx"
      examples={[
        {
          title: "Full-page demo",
          preview: (
            <DemoFrame
              src="/demo/glitch-shred-preloader"
              title="Glitch Shred Preloader demo"
              fill
              flush
            />
          ),
          code: defaultCode,
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "images",
          type: "{ src: string; title?: string; caption?: string }[]",
          default: "required",
          description:
            "Card images rendered in order and looped seamlessly. Every image is preloaded and decoded.",
        },
        {
          name: "label",
          type: "string",
          default: '"LOADING"',
          description: "Top-left monospace label.",
        },
        {
          name: "mode",
          type: '"timed" | "pageLoad"',
          default: '"timed"',
          description:
            "Timed follows the measured curve; pageLoad follows real loading events.",
        },
        {
          name: "duration",
          type: "number",
          default: "2.7",
          description: "Seconds for the 0 → 100 progression.",
        },
        {
          name: "holdTime",
          type: "number",
          default: "1.2",
          description: "Seconds the completed 100% frame holds.",
        },
        {
          name: "exitDuration",
          type: "number",
          default: "1.0",
          description: "Seconds for the sliced-shred exit.",
        },
        {
          name: "driftSpeed",
          type: "number",
          default: "60",
          description: "Strip drift speed in pixels per second.",
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
          name: "foreground",
          type: "string",
          default: "theme palette",
          description:
            "Foreground ink override. Defaults to the active theme palette.",
        },
        {
          name: "cardWidth",
          type: "number",
          default: "200",
          description: "Card width in px.",
        },
        {
          name: "cardHeight",
          type: "number",
          default: "280",
          description: "Card height in px.",
        },
        {
          name: "gap",
          type: "number",
          default: "24",
          description: "Gap between cards in px.",
        },
        {
          name: "radius",
          type: "number",
          default: "4",
          description: "Card corner radius in px.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"Inter Tight", …',
          description: "Counter and UI font stack.",
        },
        {
          name: "counterSize",
          type: "number",
          default: "clamp(72px, 8.6vw, 160px)",
          description: "Counter font size in px.",
        },
        {
          name: "glitch",
          type: "object",
          default: "all effects on",
          description:
            "Tune enabled effects and intensity (0–1): chromatic, blocks, smear, lines.",
        },
        {
          name: "exitTrails",
          type: "boolean",
          default: "true",
          description: "Render grey trail blocks during the exit.",
        },
        {
          name: "lockScroll",
          type: "boolean",
          default: "true",
          description: "Lock page scroll while the overlay is active.",
        },
        {
          name: "oncePerSession",
          type: "boolean",
          default: "false",
          description:
            "Persist a sessionStorage flag and skip if the loader already ran.",
        },
        {
          name: "reducedMotion",
          type: '"skip" | "fade"',
          default: '"fade"',
          description:
            "Behaviour when prefers-reduced-motion is set: skip entirely or fade out.",
        },
        {
          name: "preview",
          type: "boolean",
          default: "false",
          description:
            "Render one frozen frame (counter 066, bar 66%) with no timers.",
        },
        {
          name: "seed",
          type: "number",
          default: "random",
          description: "Deterministic seed for glitch and exit randomness.",
        },
        {
          name: "onExitStart",
          type: "() => void",
          default: "—",
          description:
            "Fires when the shred begins, so underlying content can animate in while the overlay breaks apart.",
        },
        {
          name: "onComplete",
          type: "() => void",
          default: "—",
          description: "Fires after the overlay is removed.",
        },
      ]}
      afterContent={<PreloaderProV1Notes />}
    />
  );
}
