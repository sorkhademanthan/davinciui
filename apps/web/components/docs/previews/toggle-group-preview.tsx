"use client";

import * as React from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Monitor,
  Smartphone,
  Tablet,
  Underline,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-5 overflow-auto bg-background p-6">
      <div className="flex w-full max-w-md items-center justify-center">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function ToggleGroupBasicPreview() {
  const [value, setValue] = React.useState("center");
  return (
    <DemoShell readout={value ? `align: ${value}` : "align: (none)"}>
      <ToggleGroup type="single" value={value} onValueChange={setValue} aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Justify">
          <AlignJustify className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </DemoShell>
  );
}

export function ToggleGroupOutlinePreview() {
  const [value, setValue] = React.useState<string[]>(["bold"]);
  return (
    <DemoShell readout={`style: ${value.join(", ") || "(none)"}`}>
      <ToggleGroup type="multiple" variant="outline" value={value} onValueChange={setValue} aria-label="Text style">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </DemoShell>
  );
}

export function ToggleGroupSizePreview() {
  return (
    <DemoShell readout="sm · default · lg">
      <div className="flex flex-col items-center gap-4">
        <ToggleGroup size="sm" defaultValue="left" aria-label="Small">
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup defaultValue="center" aria-label="Default">
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup size="lg" defaultValue="right" aria-label="Large">
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </DemoShell>
  );
}

export function ToggleGroupSpacingPreview() {
  return (
    <DemoShell readout='spacing="lg" turns segments into pills'>
      <ToggleGroup variant="outline" spacing="lg" type="multiple" defaultValue={["tablet"]} aria-label="Devices">
        <ToggleGroupItem value="phone" aria-label="Phone">
          <Smartphone className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="tablet" aria-label="Tablet">
          <Tablet className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="desktop" aria-label="Desktop">
          <Monitor className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </DemoShell>
  );
}

export function ToggleGroupVerticalPreview() {
  const [value, setValue] = React.useState("center");
  return (
    <DemoShell readout={value ? `align: ${value}` : "align: (none)"}>
      <ToggleGroup orientation="vertical" value={value} onValueChange={setValue} aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </DemoShell>
  );
}

export function ToggleGroupDisabledPreview() {
  return (
    <DemoShell readout="whole group disabled · underline item disabled">
      <div className="flex flex-col items-center gap-4">
        <ToggleGroup disabled defaultValue="bold" aria-label="Disabled group">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <Bold className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <Italic className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup variant="outline" defaultValue="bold" aria-label="One disabled item">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <Bold className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <Italic className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" disabled aria-label="Underline (unavailable)">
            <Underline className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </DemoShell>
  );
}

export function ToggleGroupCustomPreview() {
  const [view, setView] = React.useState("preview");
  return (
    <DemoShell readout={`view: ${view}`}>
      <ToggleGroup
        variant="outline"
        spacing="sm"
        value={view}
        onValueChange={(v) => v && setView(v)}
        aria-label="Editor view"
      >
        <ToggleGroupItem
          value="edit"
          className="px-4 data-[pressed]:border-indigo-500 data-[pressed]:bg-indigo-500/10 data-[pressed]:text-indigo-600 dark:data-[pressed]:text-indigo-400"
        >
          Edit
        </ToggleGroupItem>
        <ToggleGroupItem
          value="preview"
          className="px-4 data-[pressed]:border-emerald-500 data-[pressed]:bg-emerald-500/10 data-[pressed]:text-emerald-600 dark:data-[pressed]:text-emerald-400"
        >
          Preview
        </ToggleGroupItem>
      </ToggleGroup>
    </DemoShell>
  );
}

export function ToggleGroupRtlPreview() {
  const [value, setValue] = React.useState("center");
  return (
    <DemoShell readout="dir=rtl · segments mirror, arrow keys follow direction">
      <div dir="rtl">
        <ToggleGroup variant="outline" value={value} onValueChange={setValue} aria-label="محاذاة النص">
          <ToggleGroupItem value="right" aria-label="يمين">
            <AlignRight className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="وسط">
            <AlignCenter className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="left" aria-label="يسار">
            <AlignLeft className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </DemoShell>
  );
}
