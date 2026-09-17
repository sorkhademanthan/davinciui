import { DocsPageLayout } from "@/components/docs-page-layout";
import { readComponentSource } from "@/lib/source-code";
import { ScrollBlurOverlayInteractivePreview } from "@/components/docs/previews/scroll-blur-overlay-interactive-preview";

const defaultCode = `import { ScrollBlurOverlay } from "@/components/ui/scroll-blur-overlay"

export default function Page() {
  return (
    <>
      <section className="relative h-screen">
        {/* vivid content that gets frosted on the way out */}
      </section>

      <section className="relative min-h-screen bg-[#0c0c0e]">
        <ScrollBlurOverlay
          maxBlur={28}
          startLine={62}
          threshold={520}
          backgroundColor="#ffffff"
          opacity={0.1}
          extendAbove
        />
        {/* incoming content renders above the sheet */}
      </section>
    </>
  )
}`;

export async function ScrollBlurOverlayDocs() {
  const sourceCode =
    (await readComponentSource("scroll-blur-overlay")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Scroll Blur Overlay"
      description="A scroll-reactive frosted-glass sheet — real backdrop blur driven continuously by scroll position through a shared rAF tick. An extendAbove mode lets the incoming section rise and progressively diffuse the outgoing one, and scrolling back reverses every pixel."
      fullWidthPreview
      preview={<ScrollBlurOverlayInteractivePreview />}
      previewCode={defaultCode}
      installPackageName="scroll-blur-overlay"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/scroll-blur-overlay.tsx"
      usageCode={defaultCode}
      props={[
        { name: "backgroundColor", type: "string", default: '"#000000"', description: "Tint applied to the translucent overlay. Baked to rgba so blur and tint stay independent." },
        { name: "opacity", type: "number", default: "0", description: "Tint strength 0 → 1. Independent from blur intensity — blur can run with zero tint." },
        { name: "maxBlur", type: "number", default: "30", description: "Backdrop blur (px) at progress = 1. Range 0 → 100." },
        { name: "minBlur", type: "number", default: "0", description: "Backdrop blur (px) at progress = 0." },
        { name: "startLine", type: "number", default: "50", description: "Viewport line (0 → 100) where the effect begins. 50 = middle of the viewport." },
        { name: "startLineUnit", type: '"vh" | "%"', default: '"vh"', description: "Unit for Start Line. Both resolve against viewport height." },
        { name: "threshold", type: "number", default: "400", description: "Distance over which blur ramps from 0 to max. Range 1 → 2000." },
        { name: "thresholdUnit", type: '"px" | "vh"', default: '"px"', description: "Unit for Threshold. vh resolves against the live viewport height." },
        { name: "extendAbove", type: "boolean", default: "false", description: "Extend the backdrop layer above its own bounds by the threshold distance, blurring the section above." },
        { name: "extendHeight", type: "number", description: "Explicit upward extension (px). Defaults to the resolved threshold distance." },
        { name: "easing", type: '"linear" | "ease-in" | "ease-out" | "ease-in-out" | (t: number) => number', default: '"ease-out"', description: "Easing remaps scroll progress only — never time-based, always reversible." },
        { name: "mobileMaxBlur", type: "number", description: "Blur cap (px) on viewports narrower than 768px. Defaults to maxBlur." },
        { name: "disableOnMobile", type: "boolean", default: "false", description: "Disable the effect entirely below 768px." },
        { name: "blurQuality", type: '"auto" | "low" | "high"', default: '"auto"', description: "Blur rounding precision. Low snaps to 0.5px steps." },
        { name: "disabled", type: "boolean", default: "false", description: "When true, renders nothing (wrapper children still render) and performs no work." },
        { name: "debug", type: "boolean", default: "false", description: "Show the viewport start line plus a live progress / blur / threshold readout." },
        { name: "zIndex", type: "number", default: "10", description: "z-index of the overlay layer above underlying content." },
        { name: "children", type: "ReactNode", description: "Wrapper mode: renders a relative container around children with the overlay pinned inside. Omit for bare-overlay placement in your own section." },
      ]}
    />
  );
}
