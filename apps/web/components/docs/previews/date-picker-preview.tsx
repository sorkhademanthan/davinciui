"use client";

import * as React from "react";
import { DatePicker } from "@workspace/ui/components/date-picker";

const BOOKED = [new Date(2026, 7, 8, 12), new Date(2026, 7, 9, 12), new Date(2026, 7, 15, 12)];

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

function fmt(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BasicDatePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 7, 14, 12));
  return (
    <DemoShell readout={fmt(value)}>
      <DatePicker value={value} onValueChange={setValue} />
    </DemoShell>
  );
}

export function PresetsDatePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(null);
  const atNoon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  return (
    <DemoShell readout={fmt(value)}>
      <DatePicker
        value={value}
        onValueChange={setValue}
        presets={[
          { label: "Today", value: () => atNoon(new Date()) },
          { label: "Tomorrow", value: () => atNoon(new Date(Date.now() + 86400000)) },
          { label: "Next week", value: () => atNoon(new Date(Date.now() + 7 * 86400000)) },
        ]}
      />
    </DemoShell>
  );
}

export function TimeDatePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 7, 14, 10, 30));
  return (
    <DemoShell
      readout={value ? value.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
    >
      <DatePicker value={value} onValueChange={setValue} showTimeSelect />
    </DemoShell>
  );
}

export function ClearDatePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 7, 20, 12));
  return (
    <DemoShell readout={fmt(value)}>
      <DatePicker value={value} onValueChange={setValue} showClearButton />
    </DemoShell>
  );
}

export function DisabledDatesPickerDemo() {
  return (
    <DemoShell readout="Booked days cannot be picked">
      <DatePicker disabledDates={BOOKED} />
    </DemoShell>
  );
}

export function PlacementDatePickerDemo() {
  return (
    <DemoShell readout="Popup opens above, aligned to the end">
      <div className="flex h-full flex-col justify-end pb-2">
        <DatePicker placement="top-end" />
      </div>
    </DemoShell>
  );
}

export function RtlDatePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(null);
  return (
    <DemoShell readout="dir=rtl · ar-EG locale">
      <DatePicker dir="rtl" locale="ar-EG" weekStartsOn={6} value={value} onValueChange={setValue} placeholder="اختر التاريخ" />
    </DemoShell>
  );
}
