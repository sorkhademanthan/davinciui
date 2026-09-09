"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type CalendarMode = "single" | "range";

/** Display calendar system. Grids are computed with Intl, no date library needed. */
export type CalendarSystem = "gregory" | "persian" | "islamic";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface CalendarProps {
  /** Selection mode. @default "single" */
  mode?: CalendarMode;
  /** Controlled selection. */
  selected?: Date | DateRange | null;
  /** Uncontrolled initial selection. */
  defaultSelected?: Date | DateRange | null;
  /** Fires with a Date in single mode, a DateRange in range mode. */
  onSelect?: (value: Date | DateRange | null) => void;
  /** Controlled visible month (any date within it). */
  month?: Date;
  /** Uncontrolled initial visible month. @default today */
  defaultMonth?: Date;
  /** Fires when the visible month changes. */
  onMonthChange?: (month: Date) => void;
  /** Booked/unavailable days — array, predicate, or both. */
  disabled?: Date[] | ((date: Date) => boolean);
  /** BCP-47 locale for names and digits (e.g. "fa-IR"). @default "en-US" */
  locale?: string;
  /**
   * 0 = Sunday … 6 = Saturday. @default 0.
   * Pass explicitly for locale conventions (e.g. 6 for fa-IR / ar-EG).
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Show ISO week numbers. @default false */
  showWeekNumbers?: boolean;
  /** Month + year dropdowns in the header. @default false */
  showMonthYearPicker?: boolean;
  /** Day cell size in px. @default 36 */
  cellSize?: number;
  /** Hour/minute selects bound to the selected date. @default false */
  showTimeSelect?: boolean;
  /** "HH:MM" 24h value for the time selects. */
  timeValue?: string;
  /** Uncontrolled initial time. @default "12:00" */
  defaultTimeValue?: string;
  /** Fires when the time selects change. */
  onTimeChange?: (value: string) => void;
  /** Calendar system for the grid. @default "gregory" */
  calendarSystem?: CalendarSystem;
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_CELL = 36;

// ─────────────────────────────────────────────────────────────
// Calendar-system math (Intl-driven, works for gregory/persian/islamic)
// ─────────────────────────────────────────────────────────────

function calTag(locale: string, system: CalendarSystem, latin = false): string {
  const ca = system === "gregory" ? "gregory" : system;
  return `${locale}-u-ca-${ca}${latin ? "-nu-latn" : ""}`;
}

function calParts(date: Date, locale: string, system: CalendarSystem): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat(calTag(locale, system, true), {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month") - 1, d: get("day") };
}

function atNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function addDays(date: Date, n: number): Date {
  const d = atNoon(date);
  d.setDate(d.getDate() + n);
  return d;
}

function sameDay(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** All gregorian dates whose calendar-system parts fall in (year, month). Exported for testing. */
export function monthDays(year: number, month: number, locale: string, system: CalendarSystem): Date[] {
  const anchor = monthAnchor(year, month, locale, system);
  if (!anchor) return [];
  const out: Date[] = [];
  for (let i = -40; i <= 40; i++) {
    const d = addDays(anchor, i);
    const p = calParts(d, locale, system);
    if (p.y === year && p.m === month) out.push(d);
  }
  out.sort((a, b) => a.getTime() - b.getTime());
  return out;
}

/**
 * Find a gregorian date inside the (year, month) of any Intl calendar.
 * Bisects on the monotonic gregorian→year mapping, then walks months.
 */
function monthAnchor(year: number, month: number, locale: string, system: CalendarSystem): Date | null {
  const yAt = (t: number) => calParts(new Date(t), locale, system).y;
  const DAY = 86400000;
  let lo = Date.UTC(1900, 0, 1);
  let hi = Date.UTC(2100, 0, 1);
  let guard = 0;
  while (yAt(lo) > year && guard++ < 100) lo -= 3660 * DAY;
  guard = 0;
  while (yAt(hi) < year && guard++ < 100) hi += 3660 * DAY;
  // bisect first day with parts.year >= year
  let a = lo;
  let b = hi;
  guard = 0;
  while (b - a > DAY && guard++ < 100) {
    const mid = a + Math.floor((b - a) / 2);
    if (yAt(mid) < year) a = mid;
    else b = mid;
  }
  // walk months from b to (year, month)
  let cur = new Date(b);
  guard = 0;
  while (guard++ < 30) {
    const p = calParts(cur, locale, system);
    if (p.y === year && p.m === month) return cur;
    const diff = (p.y - year) * 12 + (p.m - month);
    if (diff === 0) return cur;
    cur = addDays(cur, diff > 0 ? -22 : 22);
  }
  return null;
}

function monthName(year: number, month: number, locale: string, system: CalendarSystem): string {
  const days = monthDays(year, month, locale, system);
  const sample = days[Math.min(14, days.length - 1)] ?? new Date();
  return new Intl.DateTimeFormat(calTag(locale, system), { month: "long" }).format(sample);
}

/** Year rendered in the locale's own digits (e.g. ۱۴۰۵ for fa-IR). */
function yearLabel(year: number, month: number, locale: string, system: CalendarSystem): string {
  const anchor = monthAnchor(year, month, locale, system) ?? new Date();
  return new Intl.DateTimeFormat(calTag(locale, system), { year: "numeric" }).format(anchor);
}

function dayNumber(date: Date, locale: string, system: CalendarSystem): string {
  return new Intl.DateTimeFormat(calTag(locale, system), { day: "numeric" }).format(date);
}

function weekdayNames(locale: string, weekStartsOn: number): string[] {
  const sunday = new Date(2024, 0, 7, 12); // a Sunday
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(sunday, (i + weekStartsOn) % 7)));
}

/** ISO-8601 week number for a gregorian date. */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}

/** Split month days into week rows with leading/trailing outside days. */
export function buildWeeks(days: Date[], firstDay: number): Date[][] {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return [];
  const lead = (first.getDay() - firstDay + 7) % 7;
  const cells: Date[] = [...Array<Date>(lead).fill(first), ...days];
  // leading cells mirror backwards from the 1st so outside days render muted
  for (let i = 0; i < lead; i++) cells[i] = addDays(first, i - lead);
  let extra = 0;
  while (cells.length % 7 !== 0) {
    extra += 1;
    cells.push(addDays(last, extra));
  }
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, (i + 1) * 7));
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function Calendar({
  mode = "single",
  selected: controlledSelected,
  defaultSelected = null,
  onSelect,
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  disabled,
  locale = "en-US",
  weekStartsOn,
  showWeekNumbers = false,
  showMonthYearPicker = false,
  cellSize = DEFAULT_CELL,
  showTimeSelect = false,
  timeValue: controlledTime,
  defaultTimeValue = "12:00",
  onTimeChange,
  calendarSystem = "gregory",
  dir = "ltr",
  className,
}: CalendarProps) {
  const [internalSelected, setInternalSelected] = React.useState<Date | DateRange | null>(defaultSelected);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const today = React.useMemo(() => atNoon(new Date()), []);
  const initialMonth = defaultMonth ?? (selected instanceof Date ? selected : today);
  const initialParts = calParts(initialMonth, locale, calendarSystem);
  const [internalView, setInternalView] = React.useState({ y: initialParts.y, m: initialParts.m });

  const viewParts = React.useMemo(() => {
    if (!controlledMonth) return internalView;
    const p = calParts(controlledMonth, locale, calendarSystem);
    return { y: p.y, m: p.m };
  }, [controlledMonth, internalView, locale, calendarSystem]);

  const [internalTime, setInternalTime] = React.useState(defaultTimeValue);
  const timeValue = controlledTime !== undefined ? controlledTime : internalTime;

  // Sunday default. weekStartsOn must be explicit for locale conventions
  // (Intl week data differs across runtimes and would hydration-mismatch).
  const firstDay = weekStartsOn ?? 0;

  const [navDir, setNavDir] = React.useState<"next" | "prev" | null>(null);

  const setView = (y: number, m: number) => {
    const d = (y - viewParts.y) * 12 + (m - viewParts.m);
    if (d !== 0) setNavDir(d > 0 ? "next" : "prev");
    if (controlledMonth === undefined) setInternalView({ y, m });
    const days = monthDays(y, m, locale, calendarSystem);
    onMonthChange?.(days[Math.min(14, days.length - 1)] ?? today);
  };

  const shiftMonth = (delta: number) => {
    const days = monthDays(viewParts.y, viewParts.m, locale, calendarSystem);
    const anchor = days[Math.min(14, days.length - 1)] ?? today;
    const target = addDays(anchor, delta * 22);
    const p = calParts(target, locale, calendarSystem);
    setView(p.y, p.m);
  };

  const isDisabled = (date: Date): boolean => {
    if (!disabled) return false;
    if (typeof disabled === "function") return disabled(date);
    return disabled.some((d) => sameDay(d, date));
  };

  const emit = (value: Date | DateRange | null) => {
    if (controlledSelected === undefined) setInternalSelected(value);
    onSelect?.(value);
  };

  const withTime = (date: Date): Date => {
    if (!showTimeSelect) return date;
    const [h = 12, mi = 0] = timeValue.split(":").map(Number);
    const d = atNoon(date);
    d.setHours(Number.isFinite(h) ? h : 12, Number.isFinite(mi) ? mi : 0, 0, 0);
    return d;
  };

  const pick = (date: Date) => {
    if (isDisabled(date)) return;
    if (mode === "single") {
      emit(withTime(date));
      return;
    }
    const range = (selected as DateRange | null) ?? {};
    if (!range.from || (range.from && range.to)) {
      emit({ from: withTime(date) });
    } else if (date.getTime() < range.from.getTime()) {
      emit({ from: withTime(date) });
    } else {
      emit({ from: range.from, to: withTime(date) });
    }
  };

  const setTime = (next: string) => {
    if (controlledTime === undefined) setInternalTime(next);
    onTimeChange?.(next);
    if (mode === "single" && selected instanceof Date) {
      const [h = 12, mi = 0] = next.split(":").map(Number);
      const d = new Date(selected);
      d.setHours(Number.isFinite(h) ? h : 12, Number.isFinite(mi) ? mi : 0, 0, 0);
      emit(d);
    }
  };

  const days = React.useMemo(
    () => monthDays(viewParts.y, viewParts.m, locale, calendarSystem),
    [viewParts, locale, calendarSystem],
  );

  const weeks = React.useMemo(() => buildWeeks(days, firstDay), [days, firstDay]);

  const weekNames = React.useMemo(() => weekdayNames(locale, firstDay), [locale, firstDay]);
  const viewYearLabel = React.useMemo(
    () => yearLabel(viewParts.y, viewParts.m, locale, calendarSystem),
    [viewParts, locale, calendarSystem],
  );
  const title = `${monthName(viewParts.y, viewParts.m, locale, calendarSystem)} ${viewYearLabel}`;

  const range = (selected as DateRange | null) ?? null;

  const inRange = (date: Date): boolean => {
    if (mode !== "range" || !range?.from || !range?.to) return false;
    const t = atNoon(date).getTime();
    return t > atNoon(range.from).getTime() && t < atNoon(range.to).getTime();
  };

  const years = React.useMemo(() => {
    const arr: number[] = [];
    for (let y = viewParts.y - 100; y <= viewParts.y + 100; y++) arr.push(y);
    return arr;
  }, [viewParts.y]);
  const yearOptions = React.useMemo(
    () => years.map((y) => ({ value: y, label: yearLabel(y, 0, locale, calendarSystem) })),
    [years, locale, calendarSystem],
  );

  const monthOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => ({ value: m, label: monthName(viewParts.y, m, locale, calendarSystem) }));
  }, [viewParts.y, locale, calendarSystem]);

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const [hh, mm] = timeValue.split(":");

  const fullFmt = React.useMemo(
    () => new Intl.DateTimeFormat(calTag(locale, calendarSystem), { dateStyle: "full" }),
    [locale, calendarSystem],
  );

  // ── Keyboard navigation (react-day-picker parity, RTL-aware) ──
  // Roving tabindex: one tab stop per grid, arrows move focus freely.
  const dayRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = React.useRef<string | null>(null);
  const [tabStop, setTabStop] = React.useState<string | null>(null);

  const defaultStopKey = React.useMemo(() => {
    const flat = weeks.flat();
    const inView = (d: Date) => {
      const p = calParts(d, locale, calendarSystem);
      return p.y === viewParts.y && p.m === viewParts.m;
    };
    const cands: Array<Date | undefined> =
      mode === "single"
        ? [(selected as Date | null) ?? undefined, today]
        : [range?.from, range?.to, today];
    for (const c of cands) {
      if (c && flat.some((d) => sameDay(d, c))) return c.toDateString();
    }
    return (flat.find(inView) ?? flat[0])?.toDateString() ?? null;
  }, [weeks, selected, today, range, mode, viewParts, locale, calendarSystem]);

  const defaultStopRef = React.useRef<string | null>(null);
  defaultStopRef.current = defaultStopKey;

  React.useEffect(() => {
    const p = pendingFocus.current;
    pendingFocus.current = null;
    if (!p) return;
    const el = dayRefs.current.get(p === "__default__" ? (defaultStopRef.current ?? "") : p);
    el?.focus();
  }, [weeks]);

  const setDayRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) dayRefs.current.set(key, el);
    else dayRefs.current.delete(key);
  };

  const focusDay = (target: Date) => {
    const key = target.toDateString();
    const el = dayRefs.current.get(key);
    if (el) {
      el.focus();
      return;
    }
    // Target lives in another month — jump the view, then focus it.
    const op = calParts(target, locale, calendarSystem);
    pendingFocus.current = key;
    setView(op.y, op.m);
  };

  const jumpMonthFocus = (delta: number, from: Date) => {
    if (calendarSystem === "gregory") {
      const dim = new Date(from.getFullYear(), from.getMonth() + delta + 1, 0).getDate();
      const t = new Date(from.getFullYear(), from.getMonth() + delta, Math.min(from.getDate(), dim), 12);
      pendingFocus.current = t.toDateString();
    } else {
      pendingFocus.current = "__default__";
    }
    shiftMonth(delta);
  };

  const onDayKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const rtl = dir === "rtl";
    const shift = e.shiftKey;
    let target: Date | null = null;
    switch (e.key) {
      case "ArrowLeft":
        if (shift) {
          e.preventDefault();
          jumpMonthFocus(rtl ? 1 : -1, date);
          return;
        }
        target = addDays(date, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        if (shift) {
          e.preventDefault();
          jumpMonthFocus(rtl ? -1 : 1, date);
          return;
        }
        target = addDays(date, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        if (shift) {
          e.preventDefault();
          jumpMonthFocus(-12, date);
          return;
        }
        target = addDays(date, -7);
        break;
      case "ArrowDown":
        if (shift) {
          e.preventDefault();
          jumpMonthFocus(12, date);
          return;
        }
        target = addDays(date, 7);
        break;
      case "Home":
        target = addDays(date, -((date.getDay() - firstDay + 7) % 7));
        break;
      case "End":
        target = addDays(date, 6 - ((date.getDay() - firstDay + 7) % 7));
        break;
      case "PageUp":
        e.preventDefault();
        jumpMonthFocus(shift ? -12 : -1, date);
        return;
      case "PageDown":
        e.preventDefault();
        jumpMonthFocus(shift ? 12 : 1, date);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (target) focusDay(target);
  };

  return (
    <div
      data-slot="calendar"
      dir={dir}
      className={cn(
        "inline-block rounded-2xl border border-border/70 bg-card p-4 text-card-foreground",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(0,0,0,0.18)]",
        "dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.3),0_16px_40px_-16px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-90"
        >
          <PrevIcon className="size-4" />
        </button>
        {showMonthYearPicker ? (
          <div className="flex items-center gap-1.5">
            <select
              aria-label="Month"
              value={viewParts.m}
              onChange={(e) => setView(viewParts.y, Number(e.target.value))}
              className="h-8 max-w-[8rem] rounded-[10px] border border-input bg-background px-1.5 text-[13px] font-medium shadow-sm transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={viewParts.y}
              onChange={(e) => setView(Number(e.target.value), viewParts.m)}
              className="h-8 rounded-[10px] border border-input bg-background px-1.5 text-[13px] font-medium tabular-nums shadow-sm transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {yearOptions.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-[15px] font-semibold tracking-tight" aria-live="polite">
            {title}
          </div>
        )}
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-90"
        >
          <NextIcon className="size-4" />
        </button>
      </div>

      {/* Animated grid — key remount replays the slide on month change */}
      <div
        key={`${calendarSystem}-${locale}-${viewParts.y}-${viewParts.m}`}
        className={cn(
          navDir === "prev" && "motion-safe:animate-cal-prev",
          navDir === "next" && "motion-safe:animate-cal-next",
        )}
      >
        {/* Weekday header */}
        <div className="flex">
          {showWeekNumbers && <div className="shrink-0" style={{ width: cellSize * 0.9 }} />}
          {weekNames.map((name, i) => (
            <div
              key={i}
              style={{ width: cellSize }}
              className="pb-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => {
          const thursday = week.find((d) => (d.getDay() + 6) % 7 === 3) ?? week[0];
          return (
            <div key={wi} className="flex">
              {showWeekNumbers && (
                <div
                  style={{ width: cellSize * 0.9 }}
                  className="flex items-center justify-center text-xs font-medium tabular-nums text-muted-foreground/50"
                >
                  {thursday ? isoWeek(thursday) : ""}
                </div>
              )}
              {week.map((date, di) => {
                const p = calParts(date, locale, calendarSystem);
                const outside = p.m !== viewParts.m || p.y !== viewParts.y;
                const dis = isDisabled(date);
                const isToday = sameDay(date, today);
                const isFrom = mode === "range" ? sameDay(range?.from, date) : false;
                const isTo = mode === "range" ? sameDay(range?.to, date) : false;
                const isSelected = mode === "single" ? sameDay(selected as Date | null, date) : isFrom || isTo;
                const mid = inRange(date);
                const key = date.toDateString();
                return (
                  <button
                    key={di}
                    ref={setDayRef(key)}
                    type="button"
                    disabled={dis}
                    tabIndex={tabStop ? (key === tabStop ? 0 : -1) : key === defaultStopKey ? 0 : -1}
                    aria-label={fullFmt.format(date)}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    onFocus={() => setTabStop(key)}
                    onKeyDown={(e) => onDayKeyDown(e, date)}
                    onClick={() => {
                      pick(date);
                      if (outside) {
                        const op = calParts(date, locale, calendarSystem);
                        setView(op.y, op.m);
                      }
                    }}
                    style={{ width: cellSize, height: cellSize }}
                    className={cn(
                      "relative flex items-center justify-center rounded-full text-sm font-normal tabular-nums transition-all duration-150 ease-out",
                      "hover:scale-[1.06] hover:bg-accent hover:text-accent-foreground active:scale-95",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card",
                      "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
                      outside && !isSelected && "text-muted-foreground/40 hover:text-foreground",
                      dis &&
                        "cursor-not-allowed text-muted-foreground/30 line-through decoration-muted-foreground/40 decoration-1 hover:scale-100 hover:bg-transparent hover:text-muted-foreground/30",
                      isToday &&
                        !isSelected &&
                        "font-semibold text-foreground after:absolute after:bottom-[5px] after:size-1 after:rounded-full after:bg-primary",
                      isSelected &&
                        "bg-primary bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_55%)] font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_4px_14px_-4px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-black/10 hover:bg-primary hover:text-primary-foreground hover:brightness-110 dark:ring-white/20",
                      mid &&
                        "rounded-none bg-primary/[0.12] font-medium text-foreground hover:scale-100 hover:bg-primary/[0.2] dark:bg-primary/[0.18] dark:hover:bg-primary/[0.26]",
                      // Logical endpoints — stay correct in RTL (was rounded-l/r).
                      isFrom && "rounded-e-none rounded-s-full hover:scale-100",
                      isTo && "rounded-e-full rounded-s-none hover:scale-100",
                    )}
                  >
                    {dayNumber(date, locale, calendarSystem)}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Time */}
      {showTimeSelect && (
        <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-border/70 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">Time</span>
          <select
            aria-label="Hours"
            value={hh?.padStart(2, "0") ?? "12"}
            onChange={(e) => setTime(`${e.target.value}:${(mm ?? "00").padStart(2, "0")}`)}
            className="h-8 rounded-[10px] border border-input bg-background px-1.5 text-[13px] font-medium tabular-nums shadow-sm transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={String(h).padStart(2, "0")}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">:</span>
          <select
            aria-label="Minutes"
            value={mm?.padStart(2, "0") ?? "00"}
            onChange={(e) => setTime(`${(hh ?? "12").padStart(2, "0")}:${e.target.value}`)}
            className="h-8 rounded-[10px] border border-input bg-background px-1.5 text-[13px] font-medium tabular-nums shadow-sm transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default Calendar;
