import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BasicHoverCardDemo,
  PositioningDemo,
  RtlHoverCardDemo,
  SidesDemo,
  TriggerDelaysDemo,
} from "@/components/docs/previews/hover-card-preview";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@workspace/ui/components/hover-card";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

export function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <span>@ada</span>
      </HoverCardTrigger>
      <HoverCardContent>
        <ProfileCard />
      </HoverCardContent>
    </HoverCard>
  );
}`;

const compositionNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        A trigger wrapped in hover intent drives one floating panel. Side, alignment, gap, and both
        delays are props — focus, Escape, click-toggle, and outside dismissal come built in.
      </p>
    </div>
  </div>
);

export async function HoverCardDocs() {
  const sourceCode =
    (await readComponentSource("hover-card")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Hover Card"
      description="A hover preview panel with intent delays, four sides, alignment control, keyboard support, and RTL."
      preview={
        <div className="flex flex-col items-center justify-center">
          <HoverCard>
            <HoverCardTrigger>
              <span className="cursor-pointer font-mono text-sm underline decoration-dotted underline-offset-4">
                @ada
              </span>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-sm">Ada Lovelace — first programmer.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="hover-card"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/hover-card.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Trigger Delays",
          preview: <TriggerDelaysDemo />,
          code: `import { HoverCard } from "@/components/ui/hover-card"

// Intent-tuned: opens fast, lingers so the pointer can travel.
<HoverCard openDelay={100} closeDelay={800}>
  …
</HoverCard>`,
        },
        {
          title: "Positioning",
          preview: <PositioningDemo />,
          code: `import { HoverCard } from "@/components/ui/hover-card"

<HoverCard side="top" align="start">…</HoverCard>
<HoverCard side="top" align="center">…</HoverCard>
<HoverCard side="top" align="end">…</HoverCard>`,
        },
        {
          title: "Basic",
          preview: <BasicHoverCardDemo />,
          code: `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger>
    <span>@ada</span>
  </HoverCardTrigger>
  <HoverCardContent>
    <ProfileCard />
  </HoverCardContent>
</HoverCard>`,
        },
        {
          title: "Sides",
          preview: <SidesDemo />,
          code: `import { HoverCard } from "@/components/ui/hover-card"

<HoverCard side="top">…</HoverCard>
<HoverCard side="right">…</HoverCard>
<HoverCard side="bottom">…</HoverCard>
<HoverCard side="left">…</HoverCard>`,
        },
        {
          title: "RTL",
          preview: <RtlHoverCardDemo />,
          code: `import { HoverCard } from "@/components/ui/hover-card"

<div dir="rtl">
  <HoverCard dir="rtl">…</HoverCard>
</div>`,
        },
      ]}
      props={[
        { name: "open", type: "boolean", default: "—", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Uncontrolled initial open state." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Fires when the card opens or closes." },
        { name: "openDelay", type: "number", default: "500", description: "Hover intent delay before opening, in ms." },
        { name: "closeDelay", type: "number", default: "250", description: "Grace delay before closing, in ms." },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Panel side relative to the trigger." },
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Panel alignment along the side." },
        { name: "sideOffset", type: "number", default: "8", description: "Gap between trigger and panel in px." },
        { name: "showArrow", type: "boolean", default: "true", description: "Connector arrow pointing at the trigger." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Text direction." },
        { name: "className", type: "string", description: "Extra classes for the wrapper." },
      ]}
    />
  );
}
