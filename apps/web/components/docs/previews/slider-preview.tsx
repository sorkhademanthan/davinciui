"use client";

import * as React from "react";
import { Slider, type SliderValue } from "@workspace/ui/components/slider";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-6 overflow-auto bg-background p-6">
      {children}
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

function fmt(v: SliderValue): string {
  return Array.isArray(v) ? v.join(" – ") : String(v);
}

export function RangeSliderDemo() {
  const [value, setValue] = React.useState<SliderValue>([25, 75]);
  return (
    <DemoShell readout={fmt(value)}>
      <Slider value={value} onValueChange={setValue} ariaLabel={["Minimum", "Maximum"]} />
    </DemoShell>
  );
}

export function MultipleThumbsDemo() {
  const [value, setValue] = React.useState<SliderValue>([10, 50, 90]);
  return (
    <DemoShell readout={fmt(value)}>
      <Slider
        value={value}
        onValueChange={setValue}
        ariaLabel={["Low", "Mid", "High"]}
      />
    </DemoShell>
  );
}

export function VerticalSliderDemo() {
  const [value, setValue] = React.useState<SliderValue>(60);
  return (
    <DemoShell readout={fmt(value)}>
      <Slider orientation="vertical" value={value} onValueChange={setValue} ariaLabel="Volume" />
    </DemoShell>
  );
}

export function ControlledSliderDemo() {
  const [value, setValue] = React.useState<SliderValue>(30);
  return (
    <DemoShell readout={fmt(value)}>
      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <Slider value={value} onValueChange={setValue} ariaLabel="Controlled" />
        <button
          type="button"
          onClick={() => setValue(30)}
          className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </DemoShell>
  );
}

export function DisabledSliderDemo() {
  return (
    <DemoShell readout="Entire control disabled">
      <Slider defaultValue={40} disabled ariaLabel="Disabled" />
    </DemoShell>
  );
}

export function RtlSliderDemo() {
  const [value, setValue] = React.useState<SliderValue>(70);
  return (
    <DemoShell readout="dir=rtl · minimum sits on the right">
      <div dir="rtl" className="flex w-full max-w-xs justify-center">
        <Slider dir="rtl" value={value} onValueChange={setValue} ariaLabel="مستوى الصوت" />
      </div>
    </DemoShell>
  );
}
