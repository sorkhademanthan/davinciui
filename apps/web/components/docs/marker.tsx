import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  MarkerBasicPreview,
  MarkerBorderPreview,
  MarkerIconPreview,
  MarkerLinksPreview,
  MarkerLivePreview,
  MarkerSeparatorPreview,
  MarkerShimmerPreview,
  MarkerStatusPreview,
  MarkerTimestampsPreview,
  MarkerTonesPreview,
  MarkerVariantsPreview,
} from "@/components/docs/previews/marker-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Marker, MarkerContent, MarkerDot, MarkerIcon, MarkerTime } from "@/components/ui/marker"`;
const defaultCode = `<Marker>
  <MarkerIcon>
    <CheckIcon />
  </MarkerIcon>
  <MarkerContent>Explored 4 files</MarkerContent>
</Marker>`;

export async function MarkerDocs() {
  const sourceCode =
    (await readComponentSource("marker")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Marker"
      description="Inline status, system notes, bordered rows, and labeled separators for conversations — with tones, live dots, and timestamps. Compose with Message in a thread."
      preview={<MarkerBasicPreview />}
      previewCode={defaultCode}
      installPackageName="marker"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/marker.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Marker is presentational by default — choose the semantics per use:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">role=&quot;status&quot;</code> for
            streaming updates, <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">render</code> as a
            link or button for actions, and no role for plain notes. Icons are decorative and hidden from assistive
            tech; the content carries the meaning.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Marker
├── MarkerIcon
└── MarkerContent`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Variants",
          preview: <MarkerVariantsPreview />,
          code: `import { Marker, MarkerContent } from "@/components/ui/marker"

<Marker>
  <MarkerContent>Inline marker for status and notes.</MarkerContent>
</Marker>
<Marker variant="separator">
  <MarkerContent>Centered label with divider lines.</MarkerContent>
</Marker>
<Marker variant="border">
  <MarkerContent>Row boundary with a bottom border.</MarkerContent>
</Marker>`,
        },
        {
          title: "Status",
          preview: <MarkerStatusPreview />,
          code: `import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Spinner } from "@/components/ui/spinner"

// role="status" announces streaming updates as they appear.
<Marker role="status">
  <MarkerIcon>
    <Spinner />
  </MarkerIcon>
  <MarkerContent>Compacting conversation</MarkerContent>
</Marker>`,
        },
        {
          title: "Shimmer",
          preview: <MarkerShimmerPreview />,
          code: `import { Marker, MarkerContent } from "@/components/ui/marker"

// Pulse the content while text streams in.
// Pair with the shimmer utility for a gradient sweep.
<Marker>
  <MarkerContent className="animate-pulse">Thinking…</MarkerContent>
</Marker>`,
        },
        {
          title: "Separator",
          preview: <MarkerSeparatorPreview />,
          code: `import { Marker, MarkerContent } from "@/components/ui/marker"

// Labeled dividers for dates and section breaks.
// The lines are decorative; the text announces normally.
// Do not add role="separator" — it would hide the label.
<Marker variant="separator">
  <MarkerContent>Today</MarkerContent>
</Marker>`,
        },
        {
          title: "Border",
          preview: <MarkerBorderPreview />,
          code: `import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

// Border keeps default alignment while separating rows.
// Semantics stay the same: status, render, or no role.
<Marker variant="border">
  <MarkerIcon>
    <GitBranchIcon />
  </MarkerIcon>
  <MarkerContent>Switched to release-candidate</MarkerContent>
</Marker>`,
        },
        {
          title: "With Icon",
          preview: <MarkerIconPreview />,
          code: `import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

// Icons are aria-hidden; content carries meaning.
// Use flex-col to stack the icon above the content.
<Marker className="flex-col gap-1">
  <MarkerIcon>
    <BookOpenCheckIcon />
  </MarkerIcon>
  <MarkerContent>Syncing completed</MarkerContent>
</Marker>

// Icon-only markers need a label so they never announce empty:
<Marker aria-label="Synced">
  <MarkerIcon>
    <CheckIcon />
  </MarkerIcon>
</Marker>`,
        },
        {
          title: "Tones",
          preview: <MarkerTonesPreview />,
          code: `import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

// Tone tints the icon chip; text stays calm for thread rhythm.
// Icons inherit the marker tone automatically.
<Marker tone="success">
  <MarkerIcon>
    <CheckIcon />
  </MarkerIcon>
  <MarkerContent>Tests passed in 12s</MarkerContent>
</Marker>`,
        },
        {
          title: "Live",
          preview: <MarkerLivePreview />,
          code: `import { Marker, MarkerContent, MarkerDot } from "@/components/ui/marker"

// Pinging dot + role="status" for streaming work.
<Marker tone="info" role="status">
  <MarkerDot live tone="info" />
  <MarkerContent>Thinking…</MarkerContent>
</Marker>`,
        },
        {
          title: "Timestamps",
          preview: <MarkerTimestampsPreview />,
          code: `import { Marker, MarkerContent, MarkerIcon, MarkerTime } from "@/components/ui/marker"

<Marker>
  <MarkerIcon>
    <GitBranchIcon />
  </MarkerIcon>
  <MarkerContent>Switched to release-candidate</MarkerContent>
  <MarkerTime>09:41</MarkerTime>
</Marker>`,
        },
        {
          title: "Links and Buttons",
          preview: <MarkerLinksPreview />,
          code: `import { Marker, MarkerContent } from "@/components/ui/marker"

// Real elements keep markers focusable with correct roles;
// the accessible name comes from the marker text.
<Marker render={<a href="/pr/42" />}>
  <MarkerContent>View the pull request</MarkerContent>
</Marker>`,
        },
      ]}
      props={[
        { name: "variant", type: '"default" | "border" | "separator"', default: '"default"', description: "Inline marker, bordered row, or labeled separator with gradient-fade lines." },
        { name: "tone", type: '"neutral" | "success" | "warning" | "error" | "info"', default: '"neutral"', description: "Semantic tone — tints the icon chip and dot; inherited by MarkerIcon and MarkerDot." },
        { name: "size", type: '"default" | "sm"', default: '"default"', description: "Row density." },
        { name: "MarkerDot · live", type: "boolean", default: "false", description: "Pinging live indicator for streaming work." },
        { name: "MarkerTime", type: "time element", description: "Mono tabular timestamp docked at the row edge." },
        { name: "render", type: "ReactElement | function", default: "—", description: "Render as a link, button, or custom element with hover treatment." },
        { name: "role", type: '"status"', default: "—", description: "Announce streaming markers as live status updates." },
        { name: "aria-label", type: "string", default: "—", description: "Label icon-only markers so they never announce empty." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
