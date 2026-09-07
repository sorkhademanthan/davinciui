import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BubbleAlignmentPreview,
  BubbleBasicPreview,
  BubbleCollapsiblePreview,
  BubbleGroupPreview,
  BubbleLinksButtonsPreview,
  BubblePopoverPreview,
  BubbleReactionsPreview,
  BubbleRtlPreview,
  BubbleTooltipPreview,
  BubbleVariantsPreview,
} from "@/components/docs/previews/bubble-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"`;
const defaultCode = `<Bubble>
  <BubbleContent>
    I checked the registry output and removed the stale route.
  </BubbleContent>
  <BubbleReactions>
    <span>👍</span>
  </BubbleReactions>
</Bubble>`;

export async function BubbleDocs() {
  const sourceCode =
    (await readComponentSource("bubble")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Bubble"
      description="Displays conversational content in a message bubble. Supports variants, alignment, grouping, reactions, and collapsible content."
      preview={<BubbleBasicPreview />}
      previewCode={defaultCode}
      installPackageName="bubble"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/bubble.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Bubble is intentionally scoped to the bubble surface. Place avatars, names, timestamps, metadata, and
            message-level actions outside it. Reactions overlap the bubble edge, so leave vertical space between rows.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Bubble
├── BubbleContent
└── BubbleReactions

BubbleGroup
├── Bubble
│   └── BubbleContent
└── Bubble
    └── BubbleContent`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Variants",
          preview: <BubbleVariantsPreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"

<Bubble>
  <BubbleContent>Default primary bubble.</BubbleContent>
</Bubble>
<Bubble variant="secondary">
  <BubbleContent>Standard neutral bubble.</BubbleContent>
</Bubble>
<Bubble variant="muted">
  <BubbleContent>Lower emphasis.</BubbleContent>
</Bubble>
<Bubble variant="tinted">
  <BubbleContent>Subtle primary tint.</BubbleContent>
</Bubble>
<Bubble variant="outline">
  <BubbleContent>Bordered bubble.</BubbleContent>
</Bubble>
<Bubble variant="destructive">
  <BubbleContent>Error or failed action.</BubbleContent>
</Bubble>
<Bubble variant="ghost">
  <BubbleContent>Unframed, full-width assistant text.</BubbleContent>
</Bubble>

// Bubbles size to content up to 80% width; ghost spans the full row.`,
        },
        {
          title: "Alignment",
          preview: <BubbleAlignmentPreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"

<Bubble>
  <BubbleContent>Aligned to the start (default).</BubbleContent>
</Bubble>
<Bubble align="end">
  <BubbleContent>Aligned to the end for user messages.</BubbleContent>
</Bubble>`,
        },
        {
          title: "Bubble Group",
          preview: <BubbleGroupPreview />,
          code: `import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"

// Group consecutive bubbles from the same sender.
// Set align on each Bubble, not on the group.
<BubbleGroup className="gap-1.5">
  <Bubble variant="secondary">
    <BubbleContent>Can you tell me what&apos;s the issue?</BubbleContent>
  </Bubble>
  <Bubble variant="secondary">
    <BubbleContent>It worked yesterday!</BubbleContent>
  </Bubble>
</BubbleGroup>`,
        },
        {
          title: "Links and Buttons",
          preview: <BubbleLinksButtonsPreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"

// Turn a bubble into a link or button with render.
// Interactive bubbles keep a visible focus ring.
<Bubble variant="muted" align="end">
  <BubbleContent render={<button type="button" onClick={onReply} />}>
    I forgot my password
  </BubbleContent>
</Bubble>`,
        },
        {
          title: "Reactions",
          preview: <BubbleReactionsPreview />,
          code: `import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"

// side="top" anchors to the upper edge.
// Group the row as one image with a descriptive label.
<Bubble variant="secondary">
  <BubbleContent>Tests passed on the first try.</BubbleContent>
  <BubbleReactions role="img" aria-label="Reactions: party, applause">
    <span>🎉</span>
    <span>👏</span>
  </BubbleReactions>
</Bubble>`,
        },
        {
          title: "Show More / Collapsible",
          preview: <BubbleCollapsiblePreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

<Bubble variant="secondary">
  <BubbleContent>
    <Collapsible>
      <p>Short summary…</p>
      <CollapsibleContent>
        <p>The rest of the long message…</p>
      </CollapsibleContent>
      <CollapsibleTrigger>Show more</CollapsibleTrigger>
    </Collapsible>
  </BubbleContent>
</Bubble>`,
        },
        {
          title: "Tooltip",
          preview: <BubbleTooltipPreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Wrap a bubble to reveal metadata on hover, e.g. read receipts.
<Bubble variant="secondary">
  <Tooltip>
    <TooltipTrigger>
      <BubbleContent>Did you remove the stale route?</BubbleContent>
    </TooltipTrigger>
    <TooltipContent>Read · 09:41</TooltipContent>
  </Tooltip>
</Bubble>`,
        },
        {
          title: "Popover",
          preview: <BubblePopoverPreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Pair a bubble with a popover for details on demand,
// e.g. the full error for a failed action.
<Bubble variant="destructive">
  <Popover>
    <PopoverTrigger>
      <BubbleContent>Failed to run the command.</BubbleContent>
    </PopoverTrigger>
    <PopoverContent>Build failed · ERR_MODULE_NOT_FOUND</PopoverContent>
  </Popover>
</Bubble>`,
        },
        {
          title: "RTL",
          preview: <BubbleRtlPreview />,
          code: `import { Bubble, BubbleContent } from "@/components/ui/bubble"

<div dir="rtl">
  <Bubble variant="secondary">
    <BubbleContent>مرحباً! هل تريد رؤية فقاعات الدردشة؟</BubbleContent>
  </Bubble>
  <Bubble align="end">
    <BubbleContent>نعم، اعرض أفضل عرض لديك.</BubbleContent>
  </Bubble>
</div>`,
        },
      ]}
      props={[
        { name: "variant", type: '"default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"', default: '"default"', description: "Visual treatment. Ghost is unframed and full-width." },
        { name: "align", type: '"start" | "end"', default: '"start"', description: "Inline alignment of the bubble. Set on Bubble, not BubbleGroup." },
        { name: "render", type: "ReactElement | function", default: "—", description: "Render BubbleContent as a link, button, or custom element." },
        { name: "side", type: '"top" | "bottom"', default: '"bottom"', description: "Bubble edge the reactions anchor to (BubbleReactions)." },
        { name: "align (reactions)", type: '"start" | "end"', default: '"end"', description: "Inline alignment of the reaction row (BubbleReactions)." },
        { name: "className", type: "string", description: "Additional classes on Bubble, BubbleContent, BubbleReactions, or BubbleGroup." },
      ]}
    />
  );
}
