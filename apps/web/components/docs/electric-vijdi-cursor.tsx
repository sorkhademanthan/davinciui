import { DocsPageLayout } from "@/components/docs-page-layout";
import { ElectricVijdiCursorPreview } from "@/components/docs/previews/electric-vijdi-cursor-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { ElectricVijdiCursor } from "@/components/ui/electric-vijdi-cursor"

export function App() {
  return (
    <main className="min-h-screen bg-[#09070f] text-white">
      <ElectricVijdiCursor
        color="#A855F7"
        trailLifetime={240}
        jitter={9}
        quality="high"
      />
      {/* Your app remains fully interactive. */}
    </main>
  )
}`;

export async function ElectricVijdiCursorDocs() {
  const sourceCode = (await readComponentSource("electric-vijdi-cursor")) || "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Electric Vijdi Cursor"
      description="A white-hot violet bolt that snaps through recent pointer movement, flickers briefly at rest, and never intercepts page interactions."
      preview={<ElectricVijdiCursorPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="electric-vijdi-cursor"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/electric-vijdi-cursor.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        { name: "color", type: "string", default: '"#A855F7"', description: "Electrical body and glow color." },
        { name: "intensity", type: "number", default: "1", description: "Overall brightness multiplier." },
        { name: "boltWidth", type: "number", default: "1.2", description: "White-hot core width in pixels." },
        { name: "glowSize", type: "number", default: "1", description: "Outer bloom size multiplier." },
        { name: "trailLifetime", type: "number", default: "240", description: "Visible movement history in milliseconds." },
        { name: "jitter", type: "number", default: "9", description: "Jagged perpendicular displacement in pixels." },
        { name: "branchIntensity", type: "number", default: "1", description: "Amount and length of sparse secondary arcs." },
        { name: "sparkIntensity", type: "number", default: "1", description: "Amount of tiny, fast-decaying sparks." },
        { name: "speedResponse", type: "number", default: "1", description: "How strongly cursor velocity extends and energizes the bolt." },
        { name: "quality", type: '"low" | "medium" | "high"', default: '"medium"', description: "Balances bolt detail, bloom, and DPR cap." },
        { name: "zIndex", type: "number", default: "9999", description: "Overlay stacking order." },
        { name: "disabled", type: "boolean", default: "false", description: "Turns the decorative overlay off without unmounting it." },
        { name: "containerRef", type: "RefObject<HTMLElement>", description: "Optionally constrain pointer tracking and rendering to a positioned host." },
        { name: "className", type: "string", description: "Additional class name applied to the canvas." },
      ]}
    />
  );
}
