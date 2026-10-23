import { MotionHamburger } from "@workspace/ui/components/motion/motion-hamburger";

import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  MotionHamburgerPersonalizePanel,
  MotionHamburgerPreview,
} from "@/components/docs/previews/motion-hamburger-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { MotionHamburger } from "@/components/ui/motion-hamburger"

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header>
      <MotionHamburger
        size={48}
        color="#FFFFFF"
        thickness={2.5}
        onToggle={setMenuOpen}
      />
      {menuOpen && <MobileNav />}
    </header>
  )
}`;

function MotionHamburgerNotes() {
  return (
    <>
      <Section title="About Motion Hamburger" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p className="font-medium text-foreground">
            A hamburger toggle that morphs into a close icon with real SVG
            path-drawing — not three rotating divs.
          </p>
          <p>
            The top and bottom strokes carry hidden curved geometry. On toggle,
            different portions of each path are revealed with{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              stroke-dasharray
            </code>
            while the whole icon rotates 45 degrees with an elastic overshoot
            and the middle line collapses. All four motions run together for the
            signature fluid feel.
          </p>
          <p>
            Wire{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              onToggle
            </code>{" "}
            to a mobile nav, fullscreen overlay, sidebar, or drawer. Pass{" "}
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              open
            </code>{" "}
            to control the icon from outside.
          </p>
        </div>
      </Section>

      <Section title="Controls" className="pt-8">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-7 text-muted-foreground">
          <li>
            <strong className="text-foreground">Initial State</strong> sets
            whether the icon loads as a hamburger or an X.
          </li>
          <li>
            <strong className="text-foreground">Icon</strong> controls size (24
            to 500px, geometry scales automatically), stroke color, and line
            thickness.
          </li>
          <li>
            <strong className="text-foreground">Ring</strong> adds a subtle
            circular ring that breathes with the toggle.
          </li>
          <li>
            <strong className="text-foreground">Hover Growth</strong> scales the
            whole assembly on hover without disturbing the morph rotation.
          </li>
          <li>
            <strong className="text-foreground">Keyboard</strong> toggles with
            Enter or Space and shows a visible focus ring. Reduced-motion
            preferences remove the overshoot while preserving both states.
          </li>
        </ul>
      </Section>

      <Section title="Best For" className="pt-8">
        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Site headers, mobile navigation triggers, fullscreen overlays,
          sidebars, drawers, and off-canvas menus that need a polished
          menu-to-close microinteraction.
        </p>
      </Section>
    </>
  );
}

export async function MotionHamburgerDocs() {
  const sourceCode =
    (await readComponentSource("motion-hamburger")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      hideExamples
      title="Motion Hamburger"
      description="A premium animated hamburger toggle that morphs into a close icon with SVG path-drawing, elastic rotation, and an optional ring."
      preview={<MotionHamburgerPreview />}
      personalizeContent={<MotionHamburgerPersonalizePanel />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="motion-hamburger"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/motion-hamburger.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Ringed toggle",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <MotionHamburger
                size={56}
                thickness={2.5}
                showRing
                ringColor="currentColor"
                ringThickness={1.5}
                ringPadding={6}
                hoverGrowth={1.08}
              />
            </div>
          ),
          code: `import { MotionHamburger } from "@/components/ui/motion-hamburger"

<MotionHamburger
  size={56}
  thickness={2.5}
  showRing
  ringColor="currentColor"
  ringThickness={1.5}
  ringPadding={6}
  hoverGrowth={1.08}
/>`,
        },
        {
          title: "Starts open, custom color",
          preview: (
            <div className="flex min-h-[220px] items-center justify-center px-6">
              <MotionHamburger
                initialState="open"
                size={48}
                color="#f97316"
                thickness={3}
                showRing
                ringColor="#f97316"
              />
            </div>
          ),
          code: `import { MotionHamburger } from "@/components/ui/motion-hamburger"

<MotionHamburger
  initialState="open"
  size={48}
  color="#f97316"
  thickness={3}
  showRing
  ringColor="#f97316"
/>`,
        },
      ]}
      props={[
        {
          name: "initialState",
          type: '"closed" | "open"',
          default: '"closed"',
          description: "Uncontrolled starting state of the toggle.",
        },
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state. Omit for uncontrolled toggling.",
        },
        {
          name: "onToggle / onOpenChange",
          type: "(isOpen: boolean) => void",
          description:
            "Fired on every toggle with the next state. Connect overlays, drawers, or nav variants.",
        },
        {
          name: "size",
          type: "number",
          default: "48",
          description:
            "Icon box size in pixels, clamped from 24 to 500. Geometry scales automatically.",
        },
        {
          name: "color",
          type: "string",
          default: '"#FFFFFF"',
          description: "Stroke color of the three lines.",
        },
        {
          name: "thickness",
          type: "number",
          default: "2.5",
          description: "Stroke width in SVG units, clamped from 1 to 8.",
        },
        {
          name: "showRing",
          type: "boolean",
          default: "false",
          description: "Show a subtle circular ring around the icon.",
        },
        {
          name: "ringColor",
          type: "string",
          default: '"rgba(255, 255, 255, 0.35)"',
          description: "Ring stroke color.",
        },
        {
          name: "ringThickness / ringPadding",
          type: "number / number",
          default: "1 / 6",
          description: "Ring stroke width and gap around the icon in pixels.",
        },
        {
          name: "hoverGrowth",
          type: "number",
          default: "1.05",
          description:
            "Hover scale for the whole assembly, clamped from 1 to 1.3.",
        },
        {
          name: "className / style",
          type: "string / CSSProperties",
          description: "Additional styling for the component root.",
        },
      ]}
      afterContent={<MotionHamburgerNotes />}
    />
  );
}
