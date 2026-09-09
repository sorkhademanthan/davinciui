"use client";

import * as React from "react";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@workspace/ui/components/bubble";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

function Thread({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-6 ${className ?? ""}`}>{children}</div>;
}

export function BubbleBasicPreview() {
  return (
    <DemoShell>
      <Thread>
        <Bubble variant="secondary">
          <BubbleContent>Hey there! Want to see chat bubbles?</BubbleContent>
          <BubbleReactions role="img" aria-label="Reactions: thumbs up">
            <span>👍</span>
          </BubbleReactions>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Sure. Hit me with your best demo.</BubbleContent>
        </Bubble>
        <Bubble variant="secondary">
          <BubbleContent>I can group messages, switch sides, and keep the whole thread easy to scan.</BubbleContent>
          <BubbleReactions role="img" aria-label="Reactions: thumbs up, fire, eyes, and 2 more">
            <span>👍</span>
            <span>🔥</span>
            <span>👀</span>
            <span>+2</span>
          </BubbleReactions>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleVariantsPreview() {
  return (
    <DemoShell readout="default · secondary · muted · tinted · outline · destructive · ghost">
      <div className="flex flex-col gap-3">
        <Bubble>
          <BubbleContent>This is the default primary bubble.</BubbleContent>
        </Bubble>
        <Bubble variant="secondary">
          <BubbleContent>This is the secondary variant.</BubbleContent>
        </Bubble>
        <Bubble variant="muted">
          <BubbleContent>This one is muted, for quiet supporting content.</BubbleContent>
        </Bubble>
        <Bubble variant="tinted">
          <BubbleContent>This one is tinted with a softer primary color.</BubbleContent>
        </Bubble>
        <Bubble variant="outline">
          <BubbleContent>We can also use an outlined variant.</BubbleContent>
        </Bubble>
        <Bubble variant="destructive">
          <BubbleContent>Failed to run the command: exit code 1.</BubbleContent>
          <BubbleReactions role="img" aria-label="Reactions: fire">
            <span>🔥</span>
          </BubbleReactions>
        </Bubble>
        <Bubble variant="ghost">
          <BubbleContent>
            Ghost bubbles work for assistant text and markdown that should not be framed — and span the full width.
          </BubbleContent>
        </Bubble>
      </div>
    </DemoShell>
  );
}

export function BubbleAlignmentPreview() {
  return (
    <DemoShell>
      <Thread>
        <Bubble>
          <BubbleContent>This bubble is aligned to the start. This is the default alignment.</BubbleContent>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>This bubble is aligned to the end. Use this for user messages.</BubbleContent>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleGroupPreview() {
  return (
    <DemoShell readout="adjoining corners collapse — like a real chat app">
      <Thread>
        <BubbleGroup>
          <Bubble variant="secondary">
            <BubbleContent>Can you tell me what&apos;s the issue?</BubbleContent>
          </Bubble>
          <Bubble variant="secondary">
            <BubbleContent>It worked yesterday. You broke it!</BubbleContent>
          </Bubble>
          <Bubble variant="secondary">
            <BubbleContent>Find the bug and fix it.</BubbleContent>
          </Bubble>
        </BubbleGroup>
        <BubbleGroup>
          <Bubble align="end">
            <BubbleContent>On it — checking the registry output.</BubbleContent>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>Found it. Shipping the fix now.</BubbleContent>
            <BubbleReactions role="img" aria-label="Reactions: eyes">
              <span>👀</span>
            </BubbleReactions>
          </Bubble>
        </BubbleGroup>
      </Thread>
    </DemoShell>
  );
}

export function BubbleTailsPreview() {
  return (
    <DemoShell readout="tail points at the sender · skipped on ghost and mid-group rows">
      <Thread>
        <Bubble variant="secondary" tail>
          <BubbleContent>Hey there! Want to see chat bubbles?</BubbleContent>
        </Bubble>
        <Bubble align="end" tail>
          <BubbleContent>Sure. Hit me with your best demo.</BubbleContent>
        </Bubble>
        <Bubble variant="outline" tail>
          <BubbleContent>Outlined tails carry the surface color.</BubbleContent>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleLinksButtonsPreview() {
  const [picked, setPicked] = React.useState<string | null>(null);
  const options = ["I forgot my password", "I need help with my subscription", "Talk to a human"];
  return (
    <DemoShell readout={picked ? `picked: ${picked}` : "render bubbles as buttons or links"}>
      <Thread>
        <Bubble variant="secondary">
          <BubbleContent>How can I help you today?</BubbleContent>
        </Bubble>
        {options.map((option) => (
          <Bubble key={option} variant="muted" align="end">
            <BubbleContent render={<button type="button" onClick={() => setPicked(option)} />}>
              {option}
            </BubbleContent>
          </Bubble>
        ))}
        <Bubble variant="ghost">
          <BubbleContent render={<a href="#bubble" onClick={(e) => e.preventDefault()} />}>
            Read the messaging guidelines
          </BubbleContent>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleReactionsPreview() {
  return (
    <DemoShell readout='side="top" anchors to the upper edge · leave vertical space'>
      <Thread>
        <Bubble variant="secondary">
          <BubbleContent>I don&apos;t need tests, I know my code works.</BubbleContent>
          <BubbleReactions side="top" role="img" aria-label="Reactions: thumbs up, surprised">
            <span>👍</span>
            <span>😮</span>
          </BubbleReactions>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Tests passed on the first try. All 142 of them.</BubbleContent>
          <BubbleReactions role="img" aria-label="Reactions: party, applause">
            <span>🎉</span>
            <span>👏</span>
          </BubbleReactions>
        </Bubble>
        <Bubble variant="outline" align="end">
          <BubbleContent>Are you sure I can run this command?</BubbleContent>
          <BubbleReactions align="start" role="img" aria-label="Reactions: rocket and 2 more">
            <span>👀</span>
            <span>🚀</span>
            <span>+2</span>
          </BubbleReactions>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleCollapsiblePreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <DemoShell>
      <Thread>
        <Bubble variant="secondary">
          <BubbleContent>
            <Collapsible open={open} onOpenChange={setOpen}>
              <p>How can I help you today?</p>
              <p className="mt-1">
                The accessibility review found two focus states that were visually too subtle in dark mode.
              </p>
              <CollapsibleContent className="mt-1">
                <p>
                  I checked the dialog, menu, and drawer paths because each one renders focusable controls with
                  different elevation. The full report has fourteen findings, ranked by severity, with a suggested
                  fix and a regression test for each.
                </p>
              </CollapsibleContent>
              <CollapsibleTrigger className="mt-2 text-xs font-medium underline underline-offset-4">
                {open ? "Show less" : "Show more"}
              </CollapsibleTrigger>
            </Collapsible>
          </BubbleContent>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleTooltipPreview() {
  return (
    <DemoShell readout="hover or focus the bubble for read metadata">
      <TooltipProvider>
        <Thread>
          <Bubble variant="secondary">
            <Tooltip>
              <TooltipTrigger className="w-fit max-w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                <BubbleContent>Did you remove the stale route?</BubbleContent>
              </TooltipTrigger>
              <TooltipContent>Read · 09:41</TooltipContent>
            </Tooltip>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>Yes, removed it from the registry.</BubbleContent>
          </Bubble>
        </Thread>
      </TooltipProvider>
    </DemoShell>
  );
}

export function BubblePopoverPreview() {
  return (
    <DemoShell readout="click the failed bubble for the full error">
      <Thread>
        <Bubble align="end">
          <BubbleContent>Run the build script.</BubbleContent>
        </Bubble>
        <Bubble variant="destructive">
          <Popover>
            <PopoverTrigger className="w-fit max-w-full rounded-2xl text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <BubbleContent>Failed to run the command.</BubbleContent>
            </PopoverTrigger>
            <PopoverContent className="text-sm">
              <p className="font-medium">Build failed</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">ERR_MODULE_NOT_FOUND · registry/output.js</p>
            </PopoverContent>
          </Popover>
        </Bubble>
      </Thread>
    </DemoShell>
  );
}

export function BubbleRtlPreview() {
  return (
    <DemoShell readout="dir=rtl · align=start docks to the right">
      <div dir="rtl">
        <Thread>
          <Bubble variant="secondary">
            <BubbleContent>مرحباً! هل تريد رؤية فقاعات الدردشة؟</BubbleContent>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>نعم، اعرض أفضل عرض لديك.</BubbleContent>
            <BubbleReactions role="img" aria-label="Reactions: thumbs up">
              <span>👍</span>
            </BubbleReactions>
          </Bubble>
        </Thread>
      </div>
    </DemoShell>
  );
}
