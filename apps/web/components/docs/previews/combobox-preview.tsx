"use client";

import * as React from "react";
import { Search, Command } from "lucide-react";
import { Combobox, type ComboboxItem } from "@workspace/ui/components/combobox";

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

const FRAMEWORKS: ComboboxItem[] = [
  { value: "next", label: "Next.js", keywords: ["react", "vercel"] },
  { value: "react", label: "React", keywords: ["library"] },
  { value: "vue", label: "Vue", keywords: ["framework"] },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
  { value: "angular", label: "Angular", keywords: ["google"] },
  { value: "svelte", label: "Svelte", keywords: ["compiler"] },
  { value: "solid", label: "Solid", keywords: ["fine-grained"] },
  { value: "astro", label: "Astro", keywords: ["islands"] },
  { value: "remix", label: "Remix", keywords: ["react-router"] },
  { value: "qwik", label: "Qwik", keywords: ["resumable"], disabled: true },
];

function byValues(...values: string[]): ComboboxItem[] {
  return values.map((v) => FRAMEWORKS.find((f) => f.value === v)).filter((f): f is ComboboxItem => Boolean(f));
}

const GROUPED = [
  { label: "React ecosystem", items: byValues("next", "react", "remix") },
  { label: "Vue ecosystem", items: byValues("vue", "nuxt") },
  { label: "Independent", items: byValues("angular", "svelte", "solid", "astro", "qwik") },
];

const COLLECTION: ComboboxItem[] = Array.from({ length: 60 }, (_, i) => ({
  value: `pkg-${i + 1}`,
  label: `Package ${i + 1}`,
  keywords: [`keyword-${(i % 7) + 1}`],
}));

const AR_ITEMS: ComboboxItem[] = [
  { value: "react", label: "رياكت" },
  { value: "vue", label: "فيو" },
  { value: "angular", label: "أنجولار" },
  { value: "svelte", label: "سفلت" },
];

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      {children}
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

function readoutOf(v: string | string[] | null): string {
  if (v == null) return "—";
  return Array.isArray(v) ? (v.length > 0 ? v.join(", ") : "—") : v;
}

// ─────────────────────────────────────────────────────────────
// Demos
// ─────────────────────────────────────────────────────────────

export function SimpleComboboxDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(null);
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox items={FRAMEWORKS} value={value} onValueChange={setValue} placeholder="Pick a framework…" />
    </DemoShell>
  );
}

export function ChipsComboboxDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(["react", "vue"]);
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox multiple items={FRAMEWORKS} value={value} onValueChange={setValue} placeholder="Pick frameworks…" />
    </DemoShell>
  );
}

export function GroupsCollectionDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(null);
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox groups={[{ label: "Popular", items: FRAMEWORKS.slice(0, 5) }, { label: "Collection", items: COLLECTION }]} value={value} onValueChange={setValue} placeholder="Search 65 items…" />
    </DemoShell>
  );
}

const STATUS_COLOR: Record<string, string> = {
  next: "bg-black dark:bg-white",
  react: "bg-sky-500",
  vue: "bg-emerald-500",
  angular: "bg-red-500",
  svelte: "bg-orange-500",
};

export function CustomItemsDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(null);
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox
        items={FRAMEWORKS.slice(0, 5)}
        value={value}
        onValueChange={setValue}
        placeholder="Pick with custom rows…"
        renderItem={(item, { selected }) => (
          <span className="flex items-center gap-2.5">
            <span className={`size-2.5 rounded-full ${STATUS_COLOR[item.value] ?? "bg-muted-foreground"}`} aria-hidden />
            <span className="flex-1">{item.label}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{selected ? "active" : item.value}</span>
          </span>
        )}
      />
    </DemoShell>
  );
}

export function MultipleSelectionDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(["next"]);
  const count = Array.isArray(value) ? value.length : 0;
  return (
    <DemoShell readout={`${count} selected`}>
      <Combobox multiple items={FRAMEWORKS} value={value} onValueChange={setValue} placeholder="Select many…" />
    </DemoShell>
  );
}

export function BasicComboboxDemo() {
  return (
    <DemoShell>
      <label className="flex w-72 flex-col gap-1.5">
        <span className="text-sm font-medium">Framework</span>
        <Combobox items={FRAMEWORKS} placeholder="Choose one…" className="w-full" />
        <span className="text-xs text-muted-foreground">Used in uncontrolled mode with zero wiring.</span>
      </label>
    </DemoShell>
  );
}

export function MultipleMaxDemo() {
  const [value, setValue] = React.useState<string | string[] | null>([]);
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox multiple maxSelections={3} items={FRAMEWORKS} value={value} onValueChange={setValue} placeholder="Up to 3…" />
    </DemoShell>
  );
}

export function ClearButtonDemo() {
  const [value, setValue] = React.useState<string | string[] | null>("astro");
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox items={FRAMEWORKS} value={value} onValueChange={setValue} showClearButton placeholder="Pick…" />
    </DemoShell>
  );
}

export function GroupsDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(null);
  return (
    <DemoShell readout={readoutOf(value)}>
      <Combobox groups={GROUPED} value={value} onValueChange={setValue} placeholder="Pick from groups…" />
    </DemoShell>
  );
}

export function InvalidDemo() {
  return (
    <DemoShell readout="aria-invalid + destructive ring">
      <Combobox items={FRAMEWORKS} invalid placeholder="Required field…" />
    </DemoShell>
  );
}

export function DisabledDemo() {
  return (
    <DemoShell readout="Entire control disabled">
      <Combobox items={FRAMEWORKS} disabled placeholder="Unavailable…" />
    </DemoShell>
  );
}

export function AutoHighlightDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(null);
  return (
    <DemoShell readout="Type + Enter picks the first match">
      <Combobox items={FRAMEWORKS} value={value} onValueChange={setValue} autoHighlight placeholder="Type “re”… " />
    </DemoShell>
  );
}

export function PopupDemo() {
  return (
    <DemoShell readout="Scrollable popup · closes on Escape / outside click">
      <div className="h-64 overflow-auto rounded-xl border p-6">
        <p className="mb-3 text-xs text-muted-foreground">Scroll container — the popup stays anchored.</p>
        <Combobox items={COLLECTION.slice(0, 20)} placeholder="Open the popup…" />
        <div className="h-40" />
      </div>
    </DemoShell>
  );
}

export function InputGroupDemo() {
  return (
    <DemoShell readout="Leading icon + ⌘K hint inside the field">
      <div className="relative w-72">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Combobox items={FRAMEWORKS} placeholder="Search…" inputClassName="ps-8 pe-12" className="w-full" />
        <kbd className="pointer-events-none absolute end-8 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <Command className="size-3" />K
        </kbd>
      </div>
    </DemoShell>
  );
}

export function RtlComboboxDemo() {
  const [value, setValue] = React.useState<string | string[] | null>(null);
  return (
    <DemoShell readout="dir=rtl · Arabic labels">
      <Combobox dir="rtl" items={AR_ITEMS} value={value} onValueChange={setValue} placeholder="اختر…" emptyMessage="لا نتائج" />
    </DemoShell>
  );
}
