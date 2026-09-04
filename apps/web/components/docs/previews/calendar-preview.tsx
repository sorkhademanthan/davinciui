"use client";

import * as React from "react";
import { Calendar, type DateRange } from "@workspace/ui/components/calendar";

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────

const AUG_2026 = new Date(2026, 7, 1, 12);

function fmtDay(d?: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtRange(r: DateRange | null): string {
  if (!r || !r.from) return "Pick two dates";
  if (!r.to) return `${fmtDay(r.from)} → …`;
  return `${fmtDay(r.from)} → ${fmtDay(r.to)}`;
}

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

// ─────────────────────────────────────────────────────────────
// 1. Basic
// ─────────────────────────────────────────────────────────────

export function BasicCalendarDemo() {
  const [value, setValue] = React.useState<Date | DateRange | null>(new Date(2026, 7, 14, 12));
  return (
    <DemoShell readout={value instanceof Date ? fmtDay(value) : "—"}>
      <Calendar defaultMonth={AUG_2026} selected={value} onSelect={setValue} />
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Date picker (input-anchored)
// ─────────────────────────────────────────────────────────────

export function DatePickerDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<Date | null>(null);
  return (
    <DemoShell>
      <div className="relative">
        <input
          readOnly
          value={value ? fmtDay(value) : ""}
          placeholder="Pick a date"
          onClick={() => setOpen((o) => !o)}
          onFocus={() => setOpen(true)}
          className="h-10 w-64 rounded-lg border border-input bg-background px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {open && (
          <>
            <button
              type="button"
              aria-label="Close picker"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <div className="absolute left-0 top-12 z-20">
              <Calendar
                defaultMonth={AUG_2026}
                selected={value}
                onSelect={(v) => {
                  if (v instanceof Date) {
                    setValue(v);
                    setOpen(false);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Persian / Hijri / Jalali systems
// ─────────────────────────────────────────────────────────────

const SYSTEMS = [
  { value: "gregory", label: "Gregorian" },
  { value: "persian", label: "Jalali (Persian)" },
  { value: "islamic", label: "Hijri (Islamic)" },
] as const;

export function CalendarSystemDemo() {
  const [system, setSystem] = React.useState<(typeof SYSTEMS)[number]["value"]>("persian");
  return (
    <DemoShell readout={system === "persian" ? "fa-IR digits · Jalali months" : system === "islamic" ? "ar-SA digits · Hijri months" : "en-US · Gregorian months"}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {SYSTEMS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSystem(s.value)}
              className={
                system === s.value
                  ? "rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                  : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        <Calendar
          key={system}
          defaultMonth={AUG_2026}
          calendarSystem={system}
          locale={system === "persian" ? "fa-IR" : system === "islamic" ? "ar-SA" : "en-US"}
          weekStartsOn={system === "persian" ? 6 : 0}
        />
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Selected date with timezone
// ─────────────────────────────────────────────────────────────

const TIMEZONES = ["UTC", "America/New_York", "Europe/Berlin", "Asia/Dubai", "Asia/Tehran"];

export function TimezoneDateDemo() {
  const [value, setValue] = React.useState<Date | DateRange | null>(new Date(2026, 7, 14, 15, 30));
  const [tz, setTz] = React.useState("Asia/Dubai");
  const readout =
    value instanceof Date
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: tz,
        }).format(value)
      : "Pick a date";
  return (
    <DemoShell readout={`${readout} · ${tz}`}>
      <div className="flex flex-col items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Time zone
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TIMEZONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <Calendar defaultMonth={AUG_2026} selected={value} onSelect={setValue} />
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Range
// ─────────────────────────────────────────────────────────────

export function RangeCalendarDemo() {
  const [value, setValue] = React.useState<DateRange | null>({
    from: new Date(2026, 7, 10, 12),
    to: new Date(2026, 7, 16, 12),
  });
  return (
    <DemoShell readout={fmtRange(value)}>
      <Calendar
        mode="range"
        defaultMonth={AUG_2026}
        selected={value}
        onSelect={(v) => setValue(v as DateRange)}
      />
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. Month and year selector
// ─────────────────────────────────────────────────────────────

export function MonthYearPickerDemo() {
  return (
    <DemoShell readout="Jump decades with the dropdowns">
      <Calendar defaultMonth={AUG_2026} showMonthYearPicker />
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. Presets
// ─────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
}

const PRESETS: Array<{ label: string; range: () => DateRange }> = [
  { label: "Today", range: () => ({ from: startOfDay(new Date()), to: startOfDay(new Date()) }) },
  {
    label: "Last 7 days",
    range: () => {
      const to = startOfDay(new Date());
      return { from: new Date(to.getTime() - 6 * 86400000), to };
    },
  },
  {
    label: "Last 30 days",
    range: () => {
      const to = startOfDay(new Date());
      return { from: new Date(to.getTime() - 29 * 86400000), to };
    },
  },
  {
    label: "This month",
    range: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth(), 1, 12), to: startOfDay(now) };
    },
  },
];

export function PresetsDemo() {
  const [value, setValue] = React.useState<DateRange | null>(null);
  return (
    <DemoShell readout={fmtRange(value)}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setValue(p.range())}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
        <Calendar mode="range" selected={value} onSelect={(v) => setValue(v as DateRange)} />
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. Date and time picker
// ─────────────────────────────────────────────────────────────

export function DateTimePickerDemo() {
  const [value, setValue] = React.useState<Date | DateRange | null>(new Date(2026, 7, 14, 10, 30));
  const readout =
    value instanceof Date
      ? value.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Pick a date";
  return (
    <DemoShell readout={readout}>
      <Calendar defaultMonth={AUG_2026} selected={value} onSelect={setValue} showTimeSelect />
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. Booked dates
// ─────────────────────────────────────────────────────────────

const BOOKED = [new Date(2026, 7, 8, 12), new Date(2026, 7, 9, 12), new Date(2026, 7, 15, 12), new Date(2026, 7, 22, 12)];

export function BookedDatesDemo() {
  return (
    <DemoShell readout="Struck-through days are booked and unselectable">
      <div className="flex flex-col items-center gap-3">
        <Calendar defaultMonth={AUG_2026} disabled={BOOKED} />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block size-2.5 rounded-sm bg-muted-foreground/40" />
          Booked
        </div>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. Custom cell size
// ─────────────────────────────────────────────────────────────

export function CellSizeDemo() {
  const [size, setSize] = React.useState(36);
  return (
    <DemoShell readout={`${size}px cells`}>
      <div className="flex flex-col items-center gap-4">
        <label className="flex w-56 items-center gap-3 text-xs text-muted-foreground">
          Cell size
          <input
            type="range"
            min={28}
            max={48}
            step={2}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full accent-foreground"
          />
        </label>
        <Calendar defaultMonth={AUG_2026} cellSize={size} />
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. Week numbers
// ─────────────────────────────────────────────────────────────

export function WeekNumbersDemo() {
  return (
    <DemoShell readout="ISO-8601 week numbers">
      <Calendar defaultMonth={AUG_2026} showWeekNumbers />
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 12. RTL
// ─────────────────────────────────────────────────────────────

export function RtlCalendarDemo() {
  return (
    <DemoShell readout="dir=rtl · ar-EG locale · Saturday-first weeks">
      <Calendar defaultMonth={AUG_2026} dir="rtl" locale="ar-EG" weekStartsOn={6} />
    </DemoShell>
  );
}
