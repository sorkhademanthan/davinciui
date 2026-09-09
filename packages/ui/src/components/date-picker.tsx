"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { CalendarDays, X } from "lucide-react";
import * as React from "react";
import { Calendar, type CalendarSystem, type DateRange } from "./calendar";

// ─────────────────────────────────────────────────────────────
// Types (public API unchanged)
// ─────────────────────────────────────────────────────────────

export interface DatePickerPreset {
  label: string;
  value: Date | (() => Date);
}

export type DatePickerPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface DatePickerProps {
  /** Controlled selected date. */
  value?: Date | null;
  /** Uncontrolled initial date. */
  defaultValue?: Date | null;
  /** Fires when the date changes (pick, preset, clear, time edit). */
  onValueChange?: (date: Date | null) => void;
  /** Input placeholder. */
  placeholder?: string;
  /** Disable the whole control. @default false */
  disabled?: boolean;
  /** Error state with destructive ring. @default false */
  invalid?: boolean;
  /** Show an X button that clears the date. @default false */
  showClearButton?: boolean;
  /** Hour/minute selects bound to the value. @default false */
  showTimeSelect?: boolean;
  /** Quick-pick buttons rendered above the calendar. */
  presets?: DatePickerPreset[];
  /** Booked days — array, predicate, or both. */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** Display formatter for the input. Defaults to locale short date (+time). */
  formatDate?: (date: Date) => string;
  /** BCP-47 locale for the calendar and the readout. @default "en-US" */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. @default 0 */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Calendar system for the grid. @default "gregory" */
  calendarSystem?: CalendarSystem;
  /** Text direction. @default "ltr" */
  dir?: "ltr" | "rtl";
  /** Popup alignment relative to the field. @default "bottom-start" */
  placement?: DatePickerPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Extra classes for the root. */
  className?: string;
  /** Extra classes for the text input. */
  inputClassName?: string;
  /** Extra classes for the inner calendar. */
  calendarClassName?: string;
}

function resolvePreset(p: DatePickerPreset): Date {
  return typeof p.value === "function" ? p.value() : p.value;
}

// Placement → popover side/align. The positioner flips and shifts
// from here to stay inside the viewport — no overflow bugs.
const PLACEMENT: Record<DatePickerPlacement, { side: "top" | "bottom"; align: "start" | "end" }> = {
  "bottom-start": { side: "bottom", align: "start" },
  "bottom-end": { side: "bottom", align: "end" },
  "top-start": { side: "top", align: "start" },
  "top-end": { side: "top", align: "end" },
};

// ─────────────────────────────────────────────────────────────
// Component — input-anchored single-date picker.
// Popup positioning, portal, outside-dismiss, Escape, and focus
// return come from the Base UI Popover primitive; this file owns
// the premium field + unified card visual layer.
// ─────────────────────────────────────────────────────────────

export function DatePicker({
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  invalid = false,
  showClearButton = false,
  showTimeSelect = false,
  presets,
  disabledDates,
  formatDate,
  locale = "en-US",
  weekStartsOn,
  calendarSystem = "gregory",
  dir = "ltr",
  placement = "bottom-start",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  inputClassName,
  calendarClassName,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const emit = (next: Date | null) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const display = React.useMemo(() => {
    if (!value) return "";
    if (formatDate) return formatDate(value);
    return value.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(showTimeSelect ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  }, [value, formatDate, locale, showTimeSelect]);

  const hasValue = value != null;
  const pos = PLACEMENT[placement];

  const pickAndClose = (next: Date | null) => {
    emit(next);
    setOpen(false);
  };

  const goToday = () => {
    const now = new Date();
    const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    pickAndClose(noon);
  };

  return (
    <PopoverPrimitive.Root
      data-slot="date-picker"
      open={open}
      onOpenChange={(next) => {
        if (!disabled) setOpen(next);
      }}
    >
      <span dir={dir} data-slot="date-picker-dir" className={cn("inline-block w-72", className)}>
        <PopoverPrimitive.Trigger
          data-slot="date-picker-trigger"
          disabled={disabled}
          render={
            <div
              aria-label={hasValue ? `Change date, currently ${display}` : placeholder}
              className={cn(
                "flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm shadow-xs transition-all duration-150",
                "outline-none hover:border-foreground/25 hover:shadow-sm",
                "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "data-[popup-open]:border-foreground/30 data-[popup-open]:shadow-sm data-[popup-open]:ring-2 data-[popup-open]:ring-ring/40",
                !hasValue && "text-muted-foreground",
                disabled && "cursor-not-allowed opacity-50 hover:border-input hover:shadow-none",
                invalid && "border-destructive/60 ring-2 ring-destructive/15 hover:border-destructive/60",
              )}
            >
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                readOnly
                tabIndex={-1}
                aria-hidden
                value={display}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "min-w-0 flex-1 cursor-pointer bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
                  inputClassName,
                )}
              />
              {showClearButton && hasValue && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear date"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    emit(null);
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      emit(null);
                    }
                  }}
                  className="flex shrink-0 items-center rounded-md p-0.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
                >
                  <X className="size-4" />
                </span>
              )}
            </div>
          }
        />

        <PopoverPrimitive.Portal data-slot="date-picker-portal">
          <PopoverPrimitive.Positioner
            data-slot="date-picker-positioner"
            side={pos.side}
            align={pos.align}
            sideOffset={6}
            collisionPadding={8}
            sticky
            className="z-50"
          >
            <PopoverPrimitive.Popup
              data-slot="date-picker-content"
              role="dialog"
              aria-label="Choose date"
              className={cn(
                "relative z-50 overflow-hidden rounded-2xl border border-border/70 bg-popover/95 text-popover-foreground",
                "shadow-[0_0_0_1px_rgb(0_0_0/0.02),0_2px_6px_rgb(0_0_0/0.06),0_16px_40px_-12px_rgb(0_0_0/0.22)]",
                "bg-clip-padding backdrop-blur-xl backdrop-saturate-150",
                "dark:border-white/[0.08] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_2px_8px_rgb(0_0_0/0.4),0_24px_56px_-12px_rgb(0_0_0/0.65)]",
                "origin-[var(--transform-origin)] transition-[opacity,scale,translate] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform",
                "data-[starting-style]:translate-y-1 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0",
                "data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0",
                "outline-none motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[starting-style]:scale-100",
              )}
            >
              {presets && presets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2.5">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => pickAndClose(resolvePreset(p))}
                      className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs outline-none transition-all duration-150 hover:border-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 active:scale-[0.97]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(v: Date | DateRange | null) => {
                    if (v instanceof Date) pickAndClose(v);
                  }}
                  disabled={disabledDates}
                  locale={locale}
                  weekStartsOn={weekStartsOn}
                  calendarSystem={calendarSystem}
                  showTimeSelect={showTimeSelect}
                  dir={dir}
                  className={cn("border-0 bg-transparent shadow-none", calendarClassName)}
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-3 py-2">
                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
                >
                  Today
                </button>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums" aria-live="polite">
                  {display || "No date selected"}
                </span>
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </span>
    </PopoverPrimitive.Root>
  );
}

export default DatePicker;
