import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  KineticSplitTextPersonalizePanel,
  KineticSplitTextPreview,
  KineticVariantDemo,
} from "@/components/docs/previews/kinetic-split-text-preview";
import { readComponentSource } from "@/lib/source-code";
import {
  KINETIC_VARIANT_META,
  KINETIC_VARIANTS,
} from "@workspace/ui/components/kinetic-split-text-variants";

const usageCode = `import { KineticSplitText } from "@/components/ui/kinetic-split-text"

export function Hero() {
  return (
    <KineticSplitText
      text="Motion makes it memorable."
      split="words"
      variant="editorial-rise"
      direction="up"
      stagger={0.07}
      duration={0.75}
      trigger="inView"
      once
    />
  )
}`;

function KineticSplitTextNotes() {
  return (
    <>
      <Section title="About Kinetic Split Text" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            Staggered kinetic typography with real clipping — every word, character, or
            line rises from behind its own invisible boundary.
          </p>
          <p>
            Each unit lives inside an{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              overflow-hidden
            </code>{" "}
            wrapper and animates with the Web Animations API using GPU-friendly{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              transform / opacity / filter
            </code>{" "}
            only. Nothing re-renders per frame, and the blur filter is dropped to{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              none
            </code>{" "}
            once each unit settles.
          </p>
          <p>
            Scroll mode is true scrubbing, not a viewport trigger: each unit occupies an
            offset progress window, so scrolling backwards reverses the sequence
            naturally.
          </p>
        </div>
      </Section>

      <Section title="Motion styles" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Editorial Rise</strong> — the default:
            clipped vertical reveal with a subtle overshoot and settle.
          </li>
          <li>
            <strong className="text-foreground">Depth Cascade</strong> — words travel in
            from different perceived depths through scale, blur, and perspective.
          </li>
          <li>
            <strong className="text-foreground">Split Shutter</strong> — each word
            reassembles from four alternating horizontal slices, then hands off to a
            clean copy with no seams.
          </li>
          <li>
            <strong className="text-foreground">Elastic Slam</strong> — a controlled
            squash-and-stretch impact with alternating tilt, never cartoonish.
          </li>
          <li>
            <strong className="text-foreground">Blur Rush</strong> — cinematic horizontal
            rush with motion blur, scale, and tracking that lock into focus.
          </li>
        </ul>
        <p className="max-w-2xl pt-2 text-[15px] leading-7 text-muted-foreground">
          Switch styles with the{" "}
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
            variant
          </code>{" "}
          prop — the timeline replays immediately. All five work with every trigger,
          including scroll scrubbing and progress-based hover.
        </p>
      </Section>

      <Section title="Stagger patterns" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Forward / Reverse</strong> run the sequence
            start-to-end or end-to-start.
          </li>
          <li>
            <strong className="text-foreground">Center</strong> blooms from the middle
            unit outward; <strong className="text-foreground">Edges</strong> collapses
            from the outside in.
          </li>
          <li>
            <strong className="text-foreground">Random</strong> uses a seeded shuffle that
            stays stable across renders — pass{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              randomSeed
            </code>{" "}
            to pick a different fixed order.
          </li>
        </ul>
      </Section>

      <Section title="Accessibility" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          The full string is rendered once for screen readers while the animated
          fragments are hidden from assistive tech, so &ldquo;Motion&rdquo; is never
          announced letter by letter. Reduced-motion preferences skip the
          translation, rotation, and blur tracks and render the final state.
        </p>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Hero headings, editorial section titles, launch announcements, and any display
          typography that should arrive with agency-grade polish.
        </p>
      </Section>
    </>
  );
}

export async function KineticSplitTextDocs() {
  const sourceCode =
    (await readComponentSource("kinetic-split-text")) ||
    "// Unable to load source code";

  // Bottom-pill tabs — one pinned demo per motion style. Selecting a tab
  // swaps (and remounts) the preview, so each variant replays instantly.
  const variantExamples = KINETIC_VARIANTS.map((variant) => ({
    title: KINETIC_VARIANT_META[variant].title,
    preview: <KineticVariantDemo variant={variant} />,
    code: `<KineticSplitText\n  text={"MAKE\\nMOTION\\nMATTER."}\n  split="lines"\n  variant="${variant}"\n  trigger="inView"\n  once\n/>`,
    fullWidth: true,
  }));

  return (
    <DocsPageLayout
      title="Kinetic Split Text"
      description="Staggered kinetic typography with character, word and line splitting, directional reveals, blur, 3D transforms and scroll-linked motion."
      preview={<KineticSplitTextPreview />}
      personalizeContent={<KineticSplitTextPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="kinetic-split-text"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/kinetic-split-text.tsx"
      fullWidthPreview
      unstyledPreview
      examples={variantExamples}
      props={[
        {
          name: "text",
          type: "string",
          default: '"Motion makes it memorable."',
          description: "Full text. Use \\n for explicit breaks in lines mode.",
        },
        {
          name: "split",
          type: '"characters" | "words" | "lines"',
          default: '"words"',
          description: "Granularity of the split. Words is the default.",
        },
        {
          name: "variant",
          type: '"editorial-rise" | "depth-cascade" | "split-shutter" | "elastic-slam" | "blur-rush"',
          default: '"editorial-rise"',
          description:
            "Motion choreography. Switching replays the timeline immediately.",
        },
        {
          name: "preset",
          type: '"reveal" | "blur-rise" | "flip" | "elastic" | "scatter" | "cinematic" | "custom"',
          default: '"flip"',
          description:
            "Legacy presets. Any value other than the default takes precedence over variant and reproduces the exact previous behavior.",
        },
        {
          name: "direction",
          type: '"up" | "down" | "left" | "right"',
          default: '"up"',
          description: "Reveal direction, resolved through the clipping wrappers.",
        },
        {
          name: "staggerPattern",
          type: '"forward" | "reverse" | "center" | "edges" | "random"',
          default: '"forward"',
          description: "Order in which units enter. Random is seeded and stable.",
        },
        {
          name: "randomSeed",
          type: "number",
          default: "7",
          description: "Seed for the deterministic random pattern and scatter jitter.",
        },
        {
          name: "stagger",
          type: "number",
          default: "0.07",
          description: "Per-unit stagger in seconds.",
        },
        {
          name: "duration",
          type: "number",
          default: "0.75",
          description: "Per-unit duration in seconds.",
        },
        {
          name: "delay",
          type: "number",
          default: "0",
          description: "Base delay in seconds before the sequence starts.",
        },
        {
          name: "trigger",
          type: '"inView" | "hover" | "click" | "load" | "manual" | "scroll"',
          default: '"inView"',
          description: "How the animation is triggered. Scroll scrubs with scroll position.",
        },
        {
          name: "once",
          type: "boolean",
          default: "true",
          description: "For inView: animate only the first entry, or replay on re-entry.",
        },
        {
          name: "threshold / rootMargin",
          type: "number / string",
          default: "0.2 / \"0px\"",
          description: "IntersectionObserver visibility fraction and margin.",
        },
        {
          name: "hoverBehavior",
          type: '"stay" | "reverse" | "reset"',
          default: '"stay"',
          description: "Pointer-leave behavior for hover mode.",
        },
        {
          name: "translateX / translateY",
          type: "number",
          description: "Extra initial offsets in px, added to the preset offset.",
        },
        {
          name: "initialScale / finalScale",
          type: "number",
          default: "preset / 1",
          description: "Scale track endpoints.",
        },
        {
          name: "initialRotation / finalRotation",
          type: "number",
          default: "preset / 0",
          description: "Flat (Z-axis) rotation in degrees.",
        },
        {
          name: "rotationX / rotationY",
          type: "number",
          default: "preset",
          description: "3D rotation in degrees. Needs perspective.",
        },
        {
          name: "blur",
          type: "number",
          default: "preset",
          description: "Initial blur in px, resolving to none when settled.",
        },
        {
          name: "opacity",
          type: "number",
          default: "preset",
          description: "Initial opacity (0–1).",
        },
        {
          name: "perspective",
          type: "number",
          default: "800",
          description: "Perspective distance in px for 3D rotation.",
        },
        {
          name: "scrollStart / scrollEnd",
          type: "string",
          default: '"top 85%" / "top 40%"',
          description: 'Viewport bands mapping to progress 0 and 1, e.g. "top 85%".',
        },
        {
          name: "scrollSmoothing",
          type: "number",
          default: "0.12",
          description: "Scroll-mode smoothing. 0 tracks the scroll position directly.",
        },
        {
          name: "fontFamily / fontSize / fontWeight / lineHeight / letterSpacing / textAlign / textTransform / color",
          type: "CSS",
          description: "Typography controls. fontSize accepts clamp() strings.",
        },
      ]}
      afterContent={<KineticSplitTextNotes />}
    />
  );
}
