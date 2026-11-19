import { Section } from "@/components/component-layout";
import { DemoFrame } from "@/components/docs/previews/demo-frame";
import { DocsPageLayout } from "@/components/docs-page-layout";

import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { PreloaderProV5 } from "@/components/ui/masked-arc-preloader"

const images = [
  { src: "/images/spiral-3d-slider/crimson-profile.webp" },
  { src: "/images/spiral-3d-slider/blue-double.webp" },
  { src: "/images/spiral-3d-slider/prism-portrait.webp" },
  {
    src: "/images/spiral-3d-slider/red-echo.webp",
    expandSrc: "/images/spiral-3d-slider/red-echo-16x9.webp",
  },
  { src: "/images/spiral-3d-slider/green-portrait.webp" },
  { src: "/images/spiral-3d-slider/orange-haze.webp" },
  { src: "/images/spiral-3d-slider/ghosted-portrait.webp" },
]

export default function Page() {
  return (
    <main>
      <PreloaderProV5
        images={images}
        brandName="DaVinci UI"
        introText="Every interface, considered."
        featuredIndex={3}
        revealStyle="split"
      />
      <h1>DaVinci UI</h1>
    </main>
  )
}`;

function PreloaderProV5Notes() {
  return (
    <>
      <Section title="About Masked Arc Preloader" className="pt-8 scroll-mt-24">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A cinematic editorial preloader: masked words trade places while
            seven portrait stills sweep into a wide 3D arc, converge on a
            featured image, and open into a split-image reveal.
          </p>
          <p>
            The sequence is built from flat DOM elements. A single{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              requestAnimationFrame
            </code>{" "}
            timeline drives the card arc, orbit drift, featured expansion, and
            final reveal, so the loader stays deterministic and can be scrubbed
            or replayed.
          </p>
          <p>
            Add an optional{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              expandSrc
            </code>{" "}
            to the featured image for a dedicated full-bleed crop. Every color,
            size, arc value, and timing constant is exposed as a prop.
          </p>
        </div>
      </Section>

      <Section title="Behavior" className="pt-8 scroll-mt-24">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Masked typography</strong> lifts
            the intro line character by character, then trades it for the brand
            name before the images arrive.
          </li>
          <li>
            <strong className="text-foreground">Arc entry</strong> sends each
            portrait from below the viewport into a shallow 3D arc with
            perspective yaw, per-card stagger, and orbit drift.
          </li>
          <li>
            <strong className="text-foreground">Convergence</strong> collapses
            the arc toward the centre while the non-featured cards fade back.
          </li>
          <li>
            <strong className="text-foreground">Featured expansion</strong>{" "}
            scales the selected card to full bleed, swaps in{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              expandSrc
            </code>{" "}
            when available, and adds an overlay scrim for the image title.
          </li>
          <li>
            <strong className="text-foreground">
              Split reveal (revealStyle="split")
            </strong>{" "}
            opens a horizontal gap through the image before the overlay leaves
            the page.
          </li>
          <li>
            <strong className="text-foreground">Exit styles</strong>:{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              split
            </code>{" "}
            separates the image halves,{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              lift
            </code>{" "}
            slides the whole overlay upward, and{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              iris
            </code>{" "}
            closes a circular mask.
          </li>
          <li>
            <strong className="text-foreground">Playback controls</strong>:
            scroll is locked while active, Escape skips, and the ref handle
            exposes {"`replay()`"}, {"`skip()`"}, and {"`seek(t)`"}.
          </li>
          <li>
            <strong className="text-foreground">Session and motion</strong>:
            play once per session, skip on every load, or let reduced-motion
            users see a static composed frame with a short fade.
          </li>
          <li>
            <strong className="text-foreground">Preview mode</strong> renders one
            frozen frame for gallery cards and docs surfaces without timers.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8 scroll-mt-24">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Photography portfolios, fashion editorials, film and studio sites, and
          launch pages where a small set of images should feel like a printed
          sequence opening into a single hero frame.
        </p>
      </Section>
    </>
  );
}

export async function PreloaderProV5Docs() {
  const sourceCode =
    (await readComponentSource("masked-arc-preloader")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Masked Arc Preloader"
      description="A cinematic image preloader with masked typography, a seven-card 3D arc, featured full-bleed expansion, and split, lift, or iris reveals."
      preview={
        <DemoFrame
          src="/demo/masked-arc-preloader"
          title="Masked Arc Preloader demo"
          fill
          flush
        />
      }
      previewCode={defaultCode}
      usageCode={defaultCode}
      installPackageName="masked-arc-preloader"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/masked-arc-preloader.tsx"
      examples={[
        {
          title: "Split reveal",
          preview: (
            <DemoFrame
              src="/demo/masked-arc-preloader?reveal=split"
              title="Masked Arc Preloader split reveal"
              fill
              flush
            />
          ),
          code: defaultCode,
        },
        {
          title: "Lift reveal",
          preview: (
            <DemoFrame
              src="/demo/masked-arc-preloader?reveal=lift"
              title="Masked Arc Preloader lift reveal"
              fill
              flush
            />
          ),
          code: defaultCode.replace(
            'revealStyle="split"',
            'revealStyle="lift"',
          ),
        },
        {
          title: "Iris reveal",
          preview: (
            <DemoFrame
              src="/demo/masked-arc-preloader?reveal=iris"
              title="Masked Arc Preloader iris reveal"
              fill
              flush
            />
          ),
          code: defaultCode.replace(
            'revealStyle="split"',
            'revealStyle="iris"',
          ),
        },
      ]}
      fullWidthPreview
      unstyledPreview
      props={[
        {
          name: "images",
          type: "(PreloaderProV5Image | string)[]",
          default: "8-image editorial set",
          description:
            "Portrait images for the arc. The featured image can provide an expandSrc for the full-bleed crop.",
        },
        {
          name: "imageCount",
          type: "number",
          default: "7",
          description:
            "Number of arc cards. Responsive breakpoints cap the count at 5 on mobile and 6 on tablet.",
        },
        {
          name: "featuredIndex",
          type: "number",
          default: "3",
          description:
            "Image that converges, expands to full bleed, and drives the final reveal.",
        },
        {
          name: "brandName",
          type: "string",
          default: '"DaVinci UI"',
          description: "Brand title revealed before the arc and over the image.",
        },
        {
          name: "introText",
          type: "string",
          default: '"Every interface, considered."',
          description: "Opening masked line shown before the brand title.",
        },
        {
          name: "theme",
          type: '"light" | "dark" | "auto"',
          default: '"auto"',
          description:
            "Color scheme for the default palette. Auto follows the page dark class, data-theme, or system preference and updates live.",
        },
        {
          name: "logo",
          type: "ReactNode",
          default: "—",
          description:
            "Optional logo rendered above both brand titles. Strings that look like image URLs render as an image.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: "site sans stack",
          description: "Font stack applied to the overlay.",
        },
        {
          name: "textColor",
          type: "string",
          default: 'light "#111111" / dark "#F1EEE8"',
          description: "Intro and brand title color.",
        },
        {
          name: "imageTextColor",
          type: "string",
          default: '"#ffffff"',
          description: "Brand title color over the expanded image.",
        },
        {
          name: "imageWidth",
          type: "number",
          default: "240",
          description: "Base arc card width before responsive scaling.",
        },
        {
          name: "imageHeight",
          type: "number",
          default: "320",
          description: "Base arc card height before responsive scaling.",
        },
        {
          name: "imageRadius",
          type: "number",
          default: "10",
          description: "Arc card and feature corner radius.",
        },
        {
          name: "imageFit",
          type: '"cover" | "contain"',
          default: '"cover"',
          description: "Object fit for arc and feature images.",
        },
        {
          name: "imagePosition",
          type: "string",
          default: '"50% 50%"',
          description:
            "Default object position, overridable per image with position.",
        },
        {
          name: "backgroundColor",
          type: "string",
          default: 'light "#ECECEA" / dark "#0B0B0A"',
          description: "Overlay background color.",
        },
        {
          name: "cardBackground",
          type: "string",
          default: 'light "#d8d5cf" / dark "#23211E"',
          description: "Card placeholder color while images decode.",
        },
        {
          name: "overlayColor",
          type: "string",
          default: 'light "rgba(7, 7, 7, 0.22)" / dark "rgba(0, 0, 0, 0.38)"',
          description: "Scrim color over the expanded image.",
        },
        {
          name: "titleSize",
          type: "number | string",
          default: "clamp(2rem, 8.5vw, 8rem)",
          description: "Brand title font size.",
        },
        {
          name: "introTextSize",
          type: "number | string",
          default: "clamp(1.6rem, 5.6vw, 5.2rem)",
          description: "Intro line font size.",
        },
        {
          name: "imageGap",
          type: "number",
          default: "26",
          description: "Gap between cards along the arc.",
        },
        {
          name: "arcRadius",
          type: "number",
          default: "720",
          description: "Arc radius before responsive clamping.",
        },
        {
          name: "animationDuration",
          type: "number",
          default: "7.4",
          description:
            "Seconds from intro to the start of the exit reveal.",
        },
        {
          name: "staggerDelay",
          type: "number",
          default: "0.09",
          description: "Per-card stagger between arc entries.",
        },
        {
          name: "cardMovementSpeed",
          type: "number",
          default: "1",
          description:
            "Scales arc entry speed without changing the overall duration.",
        },
        {
          name: "transitionDuration",
          type: "number",
          default: "1.05",
          description: "Seconds for the selected exit reveal.",
        },
        {
          name: "animationEasing",
          type: "string",
          default: '"cubic-bezier(0.22, 1, 0.36, 1)"',
          description:
            "CSS easing string used for the exit reveal. Accepts linear, ease keywords, or cubic-bezier.",
        },
        {
          name: "revealStyle",
          type: '"split" | "lift" | "iris"',
          default: '"split"',
          description:
            "Exit reveal: split image halves, lift the overlay upward, or close a circular iris.",
        },
        {
          name: "playOnEveryLoad",
          type: "boolean",
          default: "true",
          description:
            "Play on every mount. Set false to treat the loader as session bound.",
        },
        {
          name: "playOncePerSession",
          type: "boolean",
          default: "false",
          description:
            "Store a sessionStorage flag and skip the loader on later mounts.",
        },
        {
          name: "disableScrollDuringPlayback",
          type: "boolean",
          default: "true",
          description:
            "Locks page scroll while the overlay is active and restores it on exit.",
        },
        {
          name: "skipPreloader",
          type: "boolean",
          default: "false",
          description: "Render nothing and complete immediately.",
        },
        {
          name: "sessionKey",
          type: "string",
          default: '"masked-arc-preloader-shown"',
          description: "sessionStorage key used by the session flags.",
        },
        {
          name: "onComplete",
          type: "() => void",
          default: "—",
          description: "Fires once the overlay leaves and unmounts.",
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
          default: "5",
          description: "Timeline time used when preview is enabled.",
        },
        {
          name: "zIndex",
          type: "number",
          default: "99999",
          description: "Overlay stacking order when not in preview mode.",
        },
      ]}
      afterContent={<PreloaderProV5Notes />}
    />
  );
}