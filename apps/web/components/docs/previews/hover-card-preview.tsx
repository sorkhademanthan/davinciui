"use client";

import * as React from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  type HoverCardSide,
} from "@workspace/ui/components/hover-card";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      {children}
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

function ProfileCard({ name = "Ada Lovelace", handle = "@ada", bio = "First programmer. Analytical engines, then and now." }: { name?: string; handle?: string; bio?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
        {name.charAt(0)}
      </span>
      <span>
        <span className="block text-sm font-semibold">{name}</span>
        <span className="block font-mono text-xs text-muted-foreground">{handle}</span>
        <span className="mt-1.5 block text-[13px] leading-5 text-muted-foreground">{bio}</span>
      </span>
    </div>
  );
}

export function BasicHoverCardDemo() {
  return (
    <DemoShell readout="Hover the handle">
      <HoverCard>
        <HoverCardTrigger>
          <span className="cursor-pointer font-mono text-sm text-foreground underline decoration-dotted underline-offset-4">
            @ada
          </span>
        </HoverCardTrigger>
        <HoverCardContent>
          <ProfileCard />
        </HoverCardContent>
      </HoverCard>
    </DemoShell>
  );
}

export function TriggerDelaysDemo() {
  const [state, setState] = React.useState("closed");
  return (
    <DemoShell readout={`card ${state} · opens fast, lingers on leave`}>
      <HoverCard openDelay={100} closeDelay={800} onOpenChange={(o) => setState(o ? "open" : "closed")}>
        <HoverCardTrigger>
          <span className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm">Hover me</span>
        </HoverCardTrigger>
        <HoverCardContent>
          <ProfileCard name="Grace Hopper" handle="@grace" bio="Compiler pioneer. It is easier to ask forgiveness…" />
        </HoverCardContent>
      </HoverCard>
    </DemoShell>
  );
}

export function PositioningDemo() {
  return (
    <DemoShell readout="align start · center · end">
      <div className="flex items-start gap-8">
        {(["start", "center", "end"] as const).map((align) => (
          <HoverCard key={align} align={align}>
            <HoverCardTrigger>
              <span className="cursor-pointer rounded-md border border-border px-3 py-1.5 font-mono text-xs">{align}</span>
            </HoverCardTrigger>
            <HoverCardContent>
              <ProfileCard />
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </DemoShell>
  );
}

const SIDES: HoverCardSide[] = ["top", "right", "bottom", "left"];

export function SidesDemo() {
  return (
    <DemoShell readout="One trigger per side">
      <div className="grid grid-cols-2 gap-10 p-10">
        {SIDES.map((side) => (
          <HoverCard key={side} side={side}>
            <HoverCardTrigger>
              <span className="cursor-pointer rounded-md border border-border px-3 py-1.5 font-mono text-xs">{side}</span>
            </HoverCardTrigger>
            <HoverCardContent>
              <ProfileCard />
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </DemoShell>
  );
}

export function RtlHoverCardDemo() {
  return (
    <DemoShell>
      <div dir="rtl">
        <HoverCard dir="rtl">
          <HoverCardTrigger>
            <span className="cursor-pointer font-mono text-sm underline decoration-dotted underline-offset-4">@آدا</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <ProfileCard name="آدا لوفليس" handle="@آدا" bio="أول مبرمجة في التاريخ." />
          </HoverCardContent>
        </HoverCard>
      </div>
    </DemoShell>
  );
}
